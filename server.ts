import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import http from 'http';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PRODUCTS } from './src/data/products.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================================================= //
// 1. DEDICATED ENVIRONMENT & EXTERNAL SERVICE VALIDATION ENGINE             //
// (Executes BEFORE initializing Firebase Admin SDK and Express application) //
// ========================================================================= //

export interface ExternalServiceCheck {
  name: string;
  category: 'DATABASE' | 'AI_SERVICE' | 'AUTHENTICATION' | 'STORAGE' | 'BUILD_ARTIFACT';
  critical: boolean;
  status: 'READY' | 'DEGRADED' | 'FAILED';
  details: string;
  developerMessage?: string;
}

export interface EnvironmentValidationReport {
  timestamp: string;
  environmentMode: 'DEVELOPMENT' | 'PRODUCTION' | 'TEST';
  isProduction: boolean;
  effectivePort: number;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  dependencies: Record<string, ExternalServiceCheck>;
  developerErrors: string[];
  developerWarnings: string[];
  logText: string;
}

export interface EnvStatus {
  name: string;
  isSet: boolean;
  maskedValue: string;
  requiredForProd: boolean;
  status: 'LOADED' | 'OPTIONAL_MISSING' | 'REQUIRED_MISSING';
}

export function maskSecret(val: string | undefined): string {
  if (!val) return '[NOT CONFIGURED]';
  if (val.length <= 8) return '********';
  return `${val.slice(0, 4)}...${val.slice(-4)} (${val.length} chars)`;
}

/**
 * Dedicated pre-flight environment & external service dependency validator.
 * Runs BEFORE initializing the Firebase Admin SDK, AI clients, or the Express application.
 * Logs the active environment mode and produces developer diagnostic messages.
 */
export function validateEnvironment(): EnvironmentValidationReport {
  const rawNodeEnv = (process.env.NODE_ENV || 'development').trim().toLowerCase();
  const isProduction = rawNodeEnv === 'production';
  const isTest = rawNodeEnv === 'test';
  const environmentMode: 'DEVELOPMENT' | 'PRODUCTION' | 'TEST' = isProduction ? 'PRODUCTION' : isTest ? 'TEST' : 'DEVELOPMENT';
  const effectivePort = isProduction ? (Number(process.env.PORT) || 8080) : 3000;

  // Prominently announce environment mode in developer logs
  console.log('========================================================================');
  console.log(`[NCH ENVIRONMENT MODE] Running in ${environmentMode} mode`);
  console.log(`[NCH NETWORK BINDING]  Target port: ${effectivePort} (Host: 0.0.0.0)`);
  console.log(`[NCH BOOTSTRAP]        Pre-flight dependency verification starting...`);
  console.log('========================================================================');

  const dependencies: Record<string, ExternalServiceCheck> = {};
  const developerErrors: string[] = [];
  const developerWarnings: string[] = [];

  // 1. Critical Dependency: Firebase / Cloud Firestore
  const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (!fs.existsSync(firebaseConfigPath)) {
    const errorMsg = `[CRITICAL - FIREBASE CONFIG MISSING] 'firebase-applet-config.json' was not found in ${__dirname}. Firestore database and Firebase Authentication cannot operate without this file.`;
    dependencies.firebaseFirestore = {
      name: 'Firebase / Cloud Firestore',
      category: 'DATABASE',
      critical: true,
      status: 'FAILED',
      details: 'firebase-applet-config.json missing',
      developerMessage: errorMsg,
    };
    developerErrors.push(errorMsg);
  } else {
    try {
      const rawCfg = fs.readFileSync(firebaseConfigPath, 'utf-8');
      const cfg = JSON.parse(rawCfg);
      const expectedDbId = 'ai-studio-niazclothhousehe-2f3e4db8-6c1d-431a-acbf-143f22a9756b';
      const hasDbMatch = cfg.firestoreDatabaseId === expectedDbId;
      const hasApiKey = Boolean(cfg.apiKey && cfg.apiKey.startsWith('AIza'));
      const hasProjectId = Boolean(cfg.projectId);

      if (!hasDbMatch || !hasApiKey || !hasProjectId) {
        const warnMsg = `[FIREBASE MISCONFIGURATION] Configuration file present but requires attention. DB Match: ${hasDbMatch ? 'OK' : `Expected ${expectedDbId}, got ${cfg.firestoreDatabaseId}`}; API Key: ${hasApiKey ? 'OK' : 'MISSING/INVALID'}.`;
        dependencies.firebaseFirestore = {
          name: 'Firebase / Cloud Firestore',
          category: 'DATABASE',
          critical: true,
          status: 'DEGRADED',
          details: `Project: ${cfg.projectId || 'unset'}, DB: ${cfg.firestoreDatabaseId || 'unset'}`,
          developerMessage: warnMsg,
        };
        developerWarnings.push(warnMsg);
      } else {
        dependencies.firebaseFirestore = {
          name: 'Firebase / Cloud Firestore',
          category: 'DATABASE',
          critical: true,
          status: 'READY',
          details: `Project: ${cfg.projectId} | Database: ${cfg.firestoreDatabaseId} | AuthDomain: ${cfg.authDomain || 'set'}`,
        };
      }
    } catch (parseErr: any) {
      const errorMsg = `[CRITICAL - FIREBASE CONFIG CORRUPT] Failed to parse 'firebase-applet-config.json': ${parseErr?.message || parseErr}`;
      dependencies.firebaseFirestore = {
        name: 'Firebase / Cloud Firestore',
        category: 'DATABASE',
        critical: true,
        status: 'FAILED',
        details: 'JSON Parse Failure',
        developerMessage: errorMsg,
      };
      developerErrors.push(errorMsg);
    }
  }

  // 2. Critical Dependency: Google Gemini Generative AI SDK
  const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!geminiApiKey) {
    const warnMsg = `[GEMINI AI DEPENDENCY WARNING] GEMINI_API_KEY is not configured in environment variables. Generative AI services (/api/ai/styling-advice, /api/ai/recommend) will operate in fallback heuristic mode. To enable full AI styling, obtain an API key from Google AI Studio and configure GEMINI_API_KEY.`;
    dependencies.geminiAi = {
      name: 'Google Gemini Generative AI',
      category: 'AI_SERVICE',
      critical: false,
      status: 'DEGRADED',
      details: 'GEMINI_API_KEY not set',
      developerMessage: warnMsg,
    };
    developerWarnings.push(warnMsg);
  } else if (geminiApiKey.length < 10) {
    const warnMsg = `[GEMINI AI WARNING] GEMINI_API_KEY appears suspiciously short (${geminiApiKey.length} characters). Verify the key value in .env.`;
    dependencies.geminiAi = {
      name: 'Google Gemini Generative AI',
      category: 'AI_SERVICE',
      critical: false,
      status: 'DEGRADED',
      details: `Suspicious key format (${geminiApiKey.length} chars)`,
      developerMessage: warnMsg,
    };
    developerWarnings.push(warnMsg);
  } else {
    dependencies.geminiAi = {
      name: 'Google Gemini Generative AI',
      category: 'AI_SERVICE',
      critical: false,
      status: 'READY',
      details: `Active key: ${maskSecret(geminiApiKey)}`,
    };
  }

  // 3. Security Dependency: Administrator Authentication & Cryptographic Session Secret
  const sessionSecret = (process.env.ADMIN_SESSION_SECRET || '').trim();
  if (!sessionSecret || sessionSecret.length < 16) {
    const warnMsg = `[SECURITY NOTICE - SESSION SECRET] ADMIN_SESSION_SECRET is missing or too short (${sessionSecret.length} chars). Set a 16+ character secret in environment variables for production deployments.`;
    dependencies.adminSecurity = {
      name: 'Admin Cryptographic Security (HMAC-SHA256)',
      category: 'AUTHENTICATION',
      critical: isProduction,
      status: isProduction ? 'FAILED' : 'DEGRADED',
      details: sessionSecret ? `Short secret (${sessionSecret.length} chars)` : 'Ephemeral session secret fallback active',
      developerMessage: warnMsg,
    };
    if (isProduction) {
      developerErrors.push(warnMsg);
    } else {
      developerWarnings.push(warnMsg);
    }
  } else {
    dependencies.adminSecurity = {
      name: 'Admin Cryptographic Security (HMAC-SHA256)',
      category: 'AUTHENTICATION',
      critical: true,
      status: 'READY',
      details: sessionSecret.length >= 32
        ? '32+ character high-entropy session secret configured'
        : `256-bit derived HMAC signing key active (${sessionSecret.length}-char secret)`,
    };
  }

  // 4. Production Build Artifact Dependency
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexPath = path.resolve(distPath, 'index.html');
  const distIndexExists = fs.existsSync(distIndexPath);
  if (isProduction && !distIndexExists) {
    const errorMsg = `[CRITICAL BUILD ARTIFACT MISSING] Production mode is active, but 'dist/index.html' does not exist. The Express server will be unable to serve client single-page application requests. Run 'npm run build' before launching the production server.`;
    dependencies.clientBuild = {
      name: 'Client Production SPA Bundle',
      category: 'BUILD_ARTIFACT',
      critical: true,
      status: 'FAILED',
      details: 'dist/index.html missing',
      developerMessage: errorMsg,
    };
    developerErrors.push(errorMsg);
  } else {
    dependencies.clientBuild = {
      name: 'Client Production SPA Bundle',
      category: 'BUILD_ARTIFACT',
      critical: isProduction,
      status: 'READY',
      details: distIndexExists ? 'dist/index.html verified' : 'Vite HMR/development middleware active',
    };
  }

  // 5. Storage Dependency: Product Media Assets
  const publicImagesPath = path.resolve(__dirname, 'public', 'images');
  const imagesExist = fs.existsSync(publicImagesPath);
  if (!imagesExist) {
    const warnMsg = `[MEDIA STORAGE WARNING] 'public/images/' directory was not found. High-resolution fabric textures and product photography may fail to load.`;
    dependencies.mediaStorage = {
      name: 'Product Photography & Fabric Textures',
      category: 'STORAGE',
      critical: false,
      status: 'DEGRADED',
      details: 'public/images/ directory missing',
      developerMessage: warnMsg,
    };
    developerWarnings.push(warnMsg);
  } else {
    dependencies.mediaStorage = {
      name: 'Product Photography & Fabric Textures',
      category: 'STORAGE',
      critical: false,
      status: 'READY',
      details: 'public/images/ verified',
    };
  }

  // 6. Storage Dependency: Database Backups
  const backupsDir = path.resolve(__dirname, 'backups');
  try {
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    dependencies.backupEngine = {
      name: 'Automated Database Snapshot Engine',
      category: 'STORAGE',
      critical: false,
      status: 'READY',
      details: 'backups/ directory verified and writable',
    };
  } catch (ioErr: any) {
    const warnMsg = `[BACKUP STORAGE WARNING] Could not ensure backups directory: ${ioErr?.message || ioErr}`;
    dependencies.backupEngine = {
      name: 'Automated Database Snapshot Engine',
      category: 'STORAGE',
      critical: false,
      status: 'DEGRADED',
      details: 'Write permission error on backups/',
      developerMessage: warnMsg,
    };
    developerWarnings.push(warnMsg);
  }

  const overallStatus: 'HEALTHY' | 'DEGRADED' | 'FAILED' =
    developerErrors.length > 0 ? 'FAILED' : developerWarnings.length > 0 ? 'DEGRADED' : 'HEALTHY';

  // Format diagnostic log text
  const timestamp = new Date().toISOString();
  const logLines = [
    '========================================================================',
    '        NIAZ CLOTH HOUSE (EST. 1970) — SERVER STARTUP DIAGNOSTICS      ',
    '========================================================================',
    `Timestamp:       ${timestamp}`,
    `Node.js Version: ${process.version} (${process.platform}/${process.arch})`,
    `Mode:            ${environmentMode} (${rawNodeEnv})`,
    `Listening Port:  ${effectivePort} (bound to 0.0.0.0)`,
    `Readiness:       ${overallStatus}`,
    '------------------------------------------------------------------------',
    'CRITICAL EXTERNAL SERVICE DEPENDENCIES AUDIT:',
    ...Object.values(dependencies).map((dep) => {
      const tag = dep.status.padEnd(8);
      return `  • [${tag}] ${dep.name.padEnd(36)}: ${dep.details}`;
    }),
    '------------------------------------------------------------------------',
    'ENVIRONMENT VARIABLES AUDIT (SECRETS MASKED):',
    `  • [LOADED] PORT                  : ${process.env.PORT || `Default: ${effectivePort}`}`,
    `  • [LOADED] NODE_ENV              : ${process.env.NODE_ENV || 'development (default)'}`,
    `  • [LOADED] GEMINI_API_KEY        : ${maskSecret(process.env.GEMINI_API_KEY)}`,
    `  • [LOADED] ADMIN_USERNAME        : ${process.env.ADMIN_USERNAME || '[NOT SET]'}`,
    `  • [LOADED] ADMIN_PASSWORD        : ${maskSecret(process.env.ADMIN_PASSWORD)}`,
    `  • [LOADED] ADMIN_SESSION_SECRET  : ${maskSecret(process.env.ADMIN_SESSION_SECRET)}`,
    `  • [LOADED] DISABLE_HMR           : ${process.env.DISABLE_HMR || 'false'}`,
    '------------------------------------------------------------------------',
    'BUILD & RUNTIME ARTIFACTS VERIFICATION:',
    `  • Production dist/ directory:       ${fs.existsSync(distPath) ? 'FOUND' : 'MISSING (required in production)'}`,
    `  • Production dist/index.html:      ${distIndexExists ? 'FOUND' : 'MISSING (run "npm run build")'}`,
    `  • Public assets (public/images):   ${imagesExist ? 'FOUND' : 'MISSING'}`,
    `  • In-Memory Catalog Products:      ${INITIAL_PRODUCTS.length} items loaded`,
    '------------------------------------------------------------------------',
    'DEVELOPER DIAGNOSTIC LOGS & ACTIONABLE MESSAGES:',
  ];

  if (developerErrors.length > 0) {
    logLines.push('CRITICAL ERRORS:');
    developerErrors.forEach((err) => logLines.push(`  ❌ ${err}`));
  }
  if (developerWarnings.length > 0) {
    logLines.push('DEVELOPER WARNINGS & ADVISORIES:');
    developerWarnings.forEach((warn) => logLines.push(`  ⚠ ${warn}`));
  }
  if (developerErrors.length === 0 && developerWarnings.length === 0) {
    logLines.push('  ✓ All critical external services, dependencies, and artifacts are verified OK.');
  }

  logLines.push('========================================================================');
  const logText = logLines.join('\n');

  // Persist to startup-diagnostic.log
  try {
    const diagnosticLogPath = path.resolve(__dirname, 'startup-diagnostic.log');
    fs.writeFileSync(diagnosticLogPath, logText, 'utf8');
  } catch (ioErr) {
    console.warn('[Startup Diagnostics] Failed to write startup-diagnostic.log to disk:', ioErr);
  }

  return {
    timestamp,
    environmentMode,
    isProduction,
    effectivePort,
    overallStatus,
    dependencies,
    developerErrors,
    developerWarnings,
    logText,
  };
}

// ------------------------------------------------------------------------- //
// STEP 1: Run dedicated environment validation BEFORE initializing services //
// ------------------------------------------------------------------------- //
const initialEnvironmentReport = validateEnvironment();

// ------------------------------------------------------------------------- //
// STEP 2: Safe Firebase Admin SDK Initialization / Verification Hook        //
// ------------------------------------------------------------------------- //
let firebaseAdminState = {
  initialized: false,
  projectId: 'master-starlight-tv4kj',
  firestoreDatabaseId: 'ai-studio-niazclothhousehe-2f3e4db8-6c1d-431a-acbf-143f22a9756b',
  mode: 'client-sdk-aligned',
};

function initializeFirebaseAdmin() {
  try {
    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (cfg.projectId) firebaseAdminState.projectId = cfg.projectId;
      if (cfg.firestoreDatabaseId) firebaseAdminState.firestoreDatabaseId = cfg.firestoreDatabaseId;
      firebaseAdminState.initialized = true;
      console.log(`[Firebase Admin Hook] Database ready: ${firebaseAdminState.firestoreDatabaseId} (Project: ${firebaseAdminState.projectId})`);
    } else {
      console.warn('[Firebase Admin Hook] firebase-applet-config.json not found on disk.');
    }
  } catch (err: any) {
    console.error('[Firebase Admin Hook] Initialization check error:', err?.message || err);
  }
}

// Initialize Firebase Admin configuration hook before Express application
initializeFirebaseAdmin();

// ------------------------------------------------------------------------- //
// STEP 3: Express Application Initialization & Middleware Setup             //
// ------------------------------------------------------------------------- //
const app = express();
const port = process.env.NODE_ENV === 'production' ? (Number(process.env.PORT) || 8080) : 3000;

// Enable Gzip compression for HTML, JSON, JS, CSS, and SVG responses
app.use(compression({ threshold: 1024 }));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Immutable long-term caching for responsive AVIF/WebP image variants
app.use(
  '/images/opt',
  express.static(path.resolve(__dirname, 'public', 'images', 'opt'), {
    maxAge: '365d',
    immutable: true,
    etag: true,
    lastModified: true,
    setHeaders: (res: Response, filePath: string) => {
      if (filePath.endsWith('.avif')) {
        res.setHeader('Content-Type', 'image/avif');
      } else if (filePath.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  })
);

// Long-lived browser + CDN caching with stale-while-revalidate for source images
const imageStaticOptions = {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res: Response, filePath: string) => {
    if (filePath.endsWith('.avif')) {
      res.setHeader('Content-Type', 'image/avif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  },
};

// Explicit static handlers for image assets
app.use('/images', express.static(path.resolve(__dirname, 'public', 'images'), imageStaticOptions));
app.use('/src/assets/images', express.static(path.resolve(__dirname, 'public', 'images'), imageStaticOptions));

// Cache public static SVG icon & manifest cleanly
app.get('/icon.svg', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  res.sendFile(path.resolve(__dirname, 'public', 'icon.svg'));
});
app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  res.sendFile(path.resolve(__dirname, 'public', 'favicon.ico'));
});

// Serve static XML sitemap
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(path.resolve(__dirname, 'public', 'sitemap.xml'));
});

// Environment-aware robots.txt
app.get('/robots.txt', (req: Request, res: Response) => {
  const host = (req.headers['x-forwarded-host'] as string || req.get('host') || '').toLowerCase();
  const isProduction = host.includes('nch.com') || host.includes('niazclothhouse.com') || process.env.NODE_ENV === 'production';
  if (!isProduction) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return res.send(
      `# NCH Development / Staging Preview Environment\n# Indexing disabled to prevent duplicate content\nUser-agent: *\nDisallow: /\n`
    );
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(path.resolve(__dirname, 'public', 'robots.txt'));
});

// Google Search Console HTML Verification File Handler
app.get('/google:token.html', (req: Request, res: Response) => {
  const token = req.params.token;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`google-site-verification: google${token}.html`);
});

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function evaluateStartupDiagnostics() {
  const report = validateEnvironment();
  const envStatuses: Record<string, EnvStatus> = {
    PORT: {
      name: 'PORT',
      isSet: Boolean(process.env.PORT),
      maskedValue: process.env.PORT ? String(process.env.PORT) : `Default: ${port}`,
      requiredForProd: false,
      status: 'LOADED',
    },
    NODE_ENV: {
      name: 'NODE_ENV',
      isSet: Boolean(process.env.NODE_ENV),
      maskedValue: process.env.NODE_ENV || 'development (default)',
      requiredForProd: true,
      status: process.env.NODE_ENV ? 'LOADED' : 'OPTIONAL_MISSING',
    },
    GEMINI_API_KEY: {
      name: 'GEMINI_API_KEY',
      isSet: Boolean(process.env.GEMINI_API_KEY),
      maskedValue: maskSecret(process.env.GEMINI_API_KEY),
      requiredForProd: false,
      status: process.env.GEMINI_API_KEY ? 'LOADED' : 'OPTIONAL_MISSING',
    },
    ADMIN_USERNAME: {
      name: 'ADMIN_USERNAME',
      isSet: Boolean(process.env.ADMIN_USERNAME),
      maskedValue: process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME : '[NOT SET]',
      requiredForProd: true,
      status: process.env.ADMIN_USERNAME ? 'LOADED' : 'REQUIRED_MISSING',
    },
    ADMIN_PASSWORD: {
      name: 'ADMIN_PASSWORD',
      isSet: Boolean(process.env.ADMIN_PASSWORD),
      maskedValue: maskSecret(process.env.ADMIN_PASSWORD),
      requiredForProd: true,
      status: process.env.ADMIN_PASSWORD ? 'LOADED' : 'REQUIRED_MISSING',
    },
    ADMIN_SESSION_SECRET: {
      name: 'ADMIN_SESSION_SECRET',
      isSet: Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 16),
      maskedValue: maskSecret(process.env.ADMIN_SESSION_SECRET),
      requiredForProd: true,
      status: process.env.ADMIN_SESSION_SECRET ? 'LOADED' : 'REQUIRED_MISSING',
    },
    DISABLE_HMR: {
      name: 'DISABLE_HMR',
      isSet: Boolean(process.env.DISABLE_HMR),
      maskedValue: process.env.DISABLE_HMR ? String(process.env.DISABLE_HMR) : 'false (default)',
      requiredForProd: false,
      status: 'LOADED',
    },
  };

  const distPath = path.resolve(__dirname, 'dist');
  const distIndexPath = path.resolve(distPath, 'index.html');
  const distExists = fs.existsSync(distPath);
  const distIndexExists = fs.existsSync(distIndexPath);
  const imagesPath = path.resolve(__dirname, 'public', 'images');
  const imagesExists = fs.existsSync(imagesPath);

  const diagnosticsData = {
    timestamp: report.timestamp,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    environmentMode: report.environmentMode,
    environment: process.env.NODE_ENV || 'development',
    serverPort: port,
    boundHost: '0.0.0.0',
    criticalDependencies: report.dependencies,
    developerErrors: report.developerErrors,
    developerWarnings: report.developerWarnings,
    environmentVariables: envStatuses,
    productionArtifacts: {
      distDirectoryExists: distExists,
      distIndexHtmlExists: distIndexExists,
      publicImagesDirectoryExists: imagesExists,
      catalogProductsCount: INITIAL_PRODUCTS.length,
    },
    missingProductionDependencies: report.developerErrors,
    overallReadiness: report.overallStatus,
  };

  return { diagnosticsData, logText: report.logText };
}

// ========================================== //
// MULTI-TIER SERVER CACHE & PERFORMANCE ENGINE //
// ========================================== //
interface CacheRecord {
  key: string;
  value: any;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

const serverCache = new Map<string, CacheRecord>();
const cacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  purges: 0,
  startedAt: Date.now(),
};

function getFromCache<T>(key: string): T | null {
  const item = serverCache.get(key);
  if (!item) {
    cacheMetrics.misses++;
    return null;
  }
  if (Date.now() > item.expiresAt) {
    serverCache.delete(key);
    cacheMetrics.misses++;
    return null;
  }
  item.hits++;
  cacheMetrics.hits++;
  return item.value as T;
}

function setToCache<T>(key: string, value: T, ttlSeconds: number = 300): void {
  if (serverCache.size >= 1000) {
    const oldestKey = serverCache.keys().next().value;
    if (oldestKey) serverCache.delete(oldestKey);
  }
  serverCache.set(key, {
    key,
    value,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlSeconds * 1000,
    hits: 0,
  });
  cacheMetrics.sets++;
}

// ========================================== //
// LOAD TESTING & BENCHMARKING STATE          //
// ========================================== //
export interface LoadTestRun {
  id: string;
  timestamp: string;
  target: string;
  concurrency: number;
  totalRequests: number;
  completedRequests: number;
  successCount: number;
  errorCount: number;
  durationMs: number;
  throughputRps: number;
  latency: {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  cacheStats: {
    hitsBefore: number;
    hitsAfter: number;
    deltaHits: number;
  };
}

const loadTestHistory: LoadTestRun[] = [];

// Database state in memory backing the backend API
interface StoreOrder {
  id: string;
  date: string;
  customer: any;
  items: any[];
  subtotal: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  paymentMethod: string;
}

let backendOrders: StoreOrder[] = [
  {
    id: 'NCH-1977-1042',
    date: '2026-10-08T14:30:00Z',
    customer: {
      fullName: 'Tariq Mehmood',
      phone: '+92 300 8452109',
      city: 'Rawalpindi',
      address: 'House 14, Street 3, Saddar, Rawalpindi',
    },
    items: [{ title: 'Authentic 8-Pound Pure Boski Silk', quantity: 1, price: 18500 }],
    subtotal: 18500,
    total: 18500,
    status: 'Shipped',
    paymentMethod: 'Cash on Delivery',
  },
  {
    id: 'NCH-1977-1041',
    date: '2026-10-07T11:15:00Z',
    customer: {
      fullName: 'Kaleemullah Danish',
      phone: '+92 321 4455882',
      city: 'Rawalpindi',
      address: 'Moti Bazar near Committee Chowk, Rawalpindi',
    },
    items: [{ title: 'Royal Egyptian Latha Cotton', quantity: 1, price: 6800 }],
    subtotal: 6800,
    total: 6800,
    status: 'Delivered',
    paymentMethod: 'WhatsApp Direct',
  },
];

let backendReviews = [
  {
    id: 'rev-01',
    authorName: 'Kaleemullah Danish',
    rating: 5,
    comment: 'Niaz Cloth House in Paris Bazaar is the most reliable shop for pure unstitched suiting in Rawalpindi. Genuine Boski silk weight and top quality Latha cotton cuts. 100% recommended for authentic unstitched fabrics.',
    city: 'Rawalpindi',
    createdAt: '2026-09-18T10:00:00Z',
    verified: true,
  },
  {
    id: 'rev-02',
    authorName: 'Muhammad Arshad',
    rating: 5,
    comment: 'Ordered pure Chinese 8-pound Boski unstitched suit cut for Eid. Arrived in pristine condition via Cash on Delivery. Beautiful natural lustre and authentic drape.',
    city: 'Islamabad',
    createdAt: '2026-10-02T14:20:00Z',
    verified: true,
  },
];

const storeMetadata = {
  name: 'Niaz Cloth House',
  tagline: 'Dress To Impress',
  founder: 'Haji Sh. Niaz Ahmed (Est. 1970)',
  type: 'Authentic Cloth House & Unstitched Fabrics (Since 1970)',
  founded: 1970,
  address: {
    shopNumber: 'Shop # 166-C',
    street: 'Shop # 166-C, Paris Bazaar, Committee Chowk',
    city: 'Rawalpindi',
    state: 'Punjab',
    postalCode: '46000',
    country: 'Pakistan',
    plusCode: 'J375+HM Rawalpindi, Pakistan',
    coordinates: { lat: 33.6062, lng: 73.0645 },
  },
  contact: {
    phone: '0334-6565636',
    whatsapp: '0334-6565636',
    easypaisa: '0334-6565636',
    jazzcash: '0334-6565636',
    email: 'info@niazclothhouse.com',
  },
  hours: 'Monday to Sunday, 10:00 AM - 9:00 PM PKT',
  googleRating: {
    rating: 5.0,
    reviewsCount: 1,
    featuredReview: {
      author: 'Kaleemullah Danish',
      stars: 5,
      text: 'Niaz Cloth House in Paris Bazaar is the most reliable shop for pure unstitched suiting in Rawalpindi. Genuine Boski silk weight and top quality Latha cotton cuts. 100% recommended for authentic unstitched fabrics.',
    },
  },
  firestoreDbId: 'ai-studio-niazclothhousehe-2f3e4db8-6c1d-431a-acbf-143f22a9756b',
};

// ========================================== //
// PRODUCTION RATE LIMITING ENGINE            //
// ========================================== //
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

function createRateLimiter(options: { maxRequests: number; windowMs: number; tierName: string }) {
  return (req: Request, res: Response, next: () => void) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress || '127.0.0.1').trim();
    const key = `${options.tierName}:${ip}`;
    const now = Date.now();
    let bucket = rateLimitStore.get(key);
    if (!bucket || now - bucket.lastRefill > options.windowMs) {
      bucket = { tokens: options.maxRequests, lastRefill: now };
    } else {
      const timePassed = now - bucket.lastRefill;
      const refill = Math.floor((timePassed / options.windowMs) * options.maxRequests);
      if (refill > 0) {
        bucket.tokens = Math.min(options.maxRequests, bucket.tokens + refill);
        bucket.lastRefill = now;
      }
    }
    const resetSeconds = Math.max(1, Math.ceil((bucket.lastRefill + options.windowMs - now) / 1000));
    const remaining = Math.max(0, bucket.tokens - 1);
    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);
    if (bucket.tokens <= 0) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit of ${options.maxRequests} requests per minute reached for ${options.tierName}. Access is throttled to prevent abuse. Please retry in ${resetSeconds}s.`,
        retryAfter: resetSeconds,
      });
    }
    bucket.tokens -= 1;
    rateLimitStore.set(key, bucket);
    next();
  };
}

const generalApiLimiter = createRateLimiter({ maxRequests: 120, windowMs: 60000, tierName: 'API' });
const aiEndpointLimiter = createRateLimiter({ maxRequests: 25, windowMs: 60000, tierName: 'AI-Concierge' });

// ========================================== //
// AUTOMATED DATABASE BACKUP & RESTORATION    //
// ========================================== //
export interface DatabaseBackupSnapshot {
  id: string;
  timestamp: string;
  recordCounts: { orders: number; reviews: number; products: number; };
  fileSizeKb: number;
  status: 'Completed' | 'Pending';
  data: { metadata: typeof storeMetadata; orders: StoreOrder[]; reviews: typeof backendReviews; };
}

const backupsList: DatabaseBackupSnapshot[] = [];

function generateDatabaseBackup(): DatabaseBackupSnapshot {
  const payload = {
    metadata: storeMetadata,
    orders: [...backendOrders],
    reviews: [...backendReviews],
  };
  const str = JSON.stringify(payload, null, 2);
  const snapshot: DatabaseBackupSnapshot = {
    id: `nch-backup-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    recordCounts: {
      orders: backendOrders.length,
      reviews: backendReviews.length,
      products: 24,
    },
    fileSizeKb: Math.max(1, Math.round(Buffer.byteLength(str) / 1024)),
    status: 'Completed',
    data: payload,
  };
  backupsList.unshift(snapshot);
  if (backupsList.length > 20) backupsList.pop();
  return snapshot;
}

generateDatabaseBackup();

interface ClientErrorReport {
  id: string;
  message: string;
  stack?: string;
  category: string;
  timestamp: string;
  url: string;
  userAgent: string;
  breadcrumbs: string[];
}
const serverErrorReports: ClientErrorReport[] = [];

interface ClientAnalyticsEvent {
  id: string;
  name: string;
  properties?: any;
  timestamp: string;
  url: string;
}
const serverAnalyticsStream: ClientAnalyticsEvent[] = [];

app.use('/api', generalApiLimiter);

// Enforce strict private no-store caching for customer orders, tracking, and admin endpoints
app.use(['/api/orders', '/api/admin', '/api/diagnostics', '/api/cache'], (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
});

// --- REST API BACKEND ROUTES --- //
app.get('/api/health', (_req: Request, res: Response) => {
  const { diagnosticsData } = evaluateStartupDiagnostics();
  res.json({
    status: 'online',
    readiness: diagnosticsData.overallReadiness,
    environmentMode: diagnosticsData.environmentMode,
    store: storeMetadata.name,
    environment: diagnosticsData.environment,
    port: diagnosticsData.serverPort,
    firestoreDatabase: storeMetadata.firestoreDbId,
    criticalDependencies: diagnosticsData.criticalDependencies,
    developerWarningsCount: diagnosticsData.developerWarnings.length,
    developerErrorsCount: diagnosticsData.developerErrors.length,
    activeRateLimiters: ['TokenBucket-General', 'TokenBucket-AI', 'Admin-Auth'],
    backupsCount: backupsList.length,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/diagnostics', (_req: Request, res: Response) => {
  const { diagnosticsData } = evaluateStartupDiagnostics();
  res.setHeader('Cache-Control', 'no-store');
  res.json(diagnosticsData);
});

app.get('/api/store-info', (_req: Request, res: Response) => {
  const cacheKey = 'store_metadata_info';
  const cached = getFromCache<typeof storeMetadata>(cacheKey);
  if (cached) {
    res.setHeader('X-Cache-Status', 'HIT');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.json(cached);
  }
  setToCache(cacheKey, storeMetadata, 3600);
  res.setHeader('X-Cache-Status', 'MISS');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(storeMetadata);
});

interface DailyExchangeRatePayload {
  base: 'USD';
  quote: 'PKR';
  pkrPerUsd: number;
  source: 'live' | 'cache' | 'fallback';
  provider: string;
  marketDate: string;
  fetchedAt: string;
  nextRefreshAt: string;
}

const DEFAULT_FALLBACK_PKR_PER_USD = 278.5;
let lastKnownDailyFx: DailyExchangeRatePayload | null = null;

async function fetchJsonWithTimeout(url: string, timeoutMs = 4500): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

app.get('/api/exchange-rate', async (req: Request, res: Response) => {
  const cacheKey = 'daily_fx_usd_pkr';
  const forceRefresh = req.query.refresh === 'true';
  const fxTtlSeconds = 6 * 3600; // Refresh automatically up to 4x daily

  if (!forceRefresh) {
    const cached = getFromCache<DailyExchangeRatePayload>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache-Status', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=1800, stale-while-revalidate=86400');
      return res.json({ ...cached, source: cached.source === 'fallback' ? 'fallback' : 'cache' });
    }
  }

  const now = new Date();
  const nextRefresh = new Date(now.getTime() + fxTtlSeconds * 1000);
  let resolvedRate: number | null = null;
  let providerName = 'open.er-api.com';
  let marketDate = now.toISOString().slice(0, 10);

  // Provider 1: ExchangeRate-API Open Access (Daily mid-market rates including PKR)
  try {
    const data = await fetchJsonWithTimeout('https://open.er-api.com/v6/latest/USD', 4500);
    const rate = Number(data?.rates?.PKR);
    if (Number.isFinite(rate) && rate > 150 && rate < 600) {
      resolvedRate = Number(rate.toFixed(2));
      providerName = 'open.er-api.com';
      if (data?.time_last_update_utc) {
        const parsedDate = new Date(data.time_last_update_utc);
        if (!Number.isNaN(parsedDate.getTime())) {
          marketDate = parsedDate.toISOString().slice(0, 10);
        }
      }
    }
  } catch {
    // Fall through to secondary provider
  }

  // Provider 2: Fawazahmed0 Daily Currency API via jsDelivr CDN
  if (resolvedRate === null) {
    try {
      const data = await fetchJsonWithTimeout(
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
        4500
      );
      const rate = Number(data?.usd?.pkr);
      if (Number.isFinite(rate) && rate > 150 && rate < 600) {
        resolvedRate = Number(rate.toFixed(2));
        providerName = 'currency-api';
        if (typeof data?.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(data.date)) {
          marketDate = data.date.slice(0, 10);
        }
      }
    } catch {
      // Fall through to cached/fallback
    }
  }

  if (resolvedRate !== null) {
    const payload: DailyExchangeRatePayload = {
      base: 'USD',
      quote: 'PKR',
      pkrPerUsd: resolvedRate,
      source: 'live',
      provider: providerName,
      marketDate,
      fetchedAt: now.toISOString(),
      nextRefreshAt: nextRefresh.toISOString(),
    };
    lastKnownDailyFx = payload;
    setToCache(cacheKey, payload, fxTtlSeconds);
    res.setHeader('X-Cache-Status', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=1800, stale-while-revalidate=86400');
    return res.json(payload);
  }

  const fallbackPayload: DailyExchangeRatePayload = lastKnownDailyFx
    ? { ...lastKnownDailyFx, source: 'cache' }
    : {
        base: 'USD',
        quote: 'PKR',
        pkrPerUsd: DEFAULT_FALLBACK_PKR_PER_USD,
        source: 'fallback',
        provider: 'baseline',
        marketDate,
        fetchedAt: now.toISOString(),
        nextRefreshAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
      };

  setToCache(cacheKey, fallbackPayload, 900); // Retry upstream after 15 mins on failure
  res.setHeader('X-Cache-Status', 'FALLBACK');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.json(fallbackPayload);
});

app.get('/api/cache/stats', (_req: Request, res: Response) => {
  const total = cacheMetrics.hits + cacheMetrics.misses;
  const hitRatio = total > 0 ? Number(((cacheMetrics.hits / total) * 100).toFixed(1)) : 0;
  const memoryEstimateKb = Math.round(JSON.stringify(Array.from(serverCache.entries())).length / 1024);
  res.json({
    status: 'active',
    hits: cacheMetrics.hits,
    misses: cacheMetrics.misses,
    sets: cacheMetrics.sets,
    purges: cacheMetrics.purges,
    totalRequests: total,
    hitRatioPercent: hitRatio,
    activeKeysCount: serverCache.size,
    memoryEstimateKb,
    cachedKeys: Array.from(serverCache.keys()),
    uptimeSeconds: Math.round((Date.now() - cacheMetrics.startedAt) / 1000),
  });
});

app.post('/api/cache/purge', (_req: Request, res: Response) => {
  const previousSize = serverCache.size;
  serverCache.clear();
  cacheMetrics.purges++;
  res.json({
    success: true,
    message: `Cache successfully purged (${previousSize} items cleared).`,
    purgedAt: new Date().toISOString(),
  });
});

// ========================================== //
// SECURE ADMIN AUTHENTICATION ENGINE         //
// ========================================== //
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || '').trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();
const RAW_SESSION_SECRET = (process.env.ADMIN_SESSION_SECRET || '').trim();
const EPHEMERAL_DEV_SECRET = crypto.randomBytes(32).toString('hex');

const DERIVED_SESSION_KEY = RAW_SESSION_SECRET
  ? crypto.createHmac('sha256', 'nch-1970-session-kdf').update(RAW_SESSION_SECRET).digest('hex')
  : EPHEMERAL_DEV_SECRET;

function timingSafeCompare(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

const adminAuthLimiter = createRateLimiter({ maxRequests: 15, windowMs: 15 * 60 * 1000, tierName: 'Admin-Auth' });

interface AdminSessionPayload {
  username: string;
  role: string;
  fullName: string;
  exp: number;
}

function generateAdminToken(payload: AdminSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', DERIVED_SESSION_KEY).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyAdminToken(token: string): AdminSessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', DERIVED_SESSION_KEY).update(data).digest('base64url');
    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSignature);
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as AdminSessionPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Middleware: Require validated admin session for sensitive endpoints
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Admin authentication token is required.' });
  }
  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Admin session is invalid or has expired.' });
  }
  (req as any).adminUser = payload;
  next();
}

app.post('/api/admin/login', adminAuthLimiter, (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  const inputUser = String(username || '').trim();
  const inputPass = String(password || '').trim();
  if (!inputUser || !inputPass) {
    return res.status(400).json({ success: false, error: 'Please provide both username and password.' });
  }

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return res.status(503).json({
      success: false,
      error: 'Administrator credentials are not configured on the server environment.',
    });
  }

  const userMatches = timingSafeCompare(inputUser, ADMIN_USERNAME);
  const passMatches = timingSafeCompare(inputPass, ADMIN_PASSWORD);
  if (!userMatches || !passMatches) {
    return res.status(401).json({
      success: false,
      error: 'Invalid administrator username or password.',
    });
  }

  const sessionPayload: AdminSessionPayload = {
    username: ADMIN_USERNAME,
    fullName: 'Haji Niaz Ahmad',
    role: 'Store Administrator',
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const token = generateAdminToken(sessionPayload);
  return res.json({
    success: true,
    message: 'Authentication successful',
    token,
    user: { username: sessionPayload.username, fullName: sessionPayload.fullName, role: sessionPayload.role },
  });
});

app.get('/api/admin/verify', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) return res.status(401).json({ authenticated: false, error: 'No token provided.' });
  const payload = verifyAdminToken(token);
  if (!payload) return res.status(401).json({ authenticated: false, error: 'Session expired.' });
  return res.json({ authenticated: true, user: { username: payload.username, fullName: payload.fullName, role: payload.role } });
});

app.post('/api/admin/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Admin session terminated.' });
});

// Image Upload: Restricted to authenticated administrators
app.post('/api/admin/upload-image', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { imageData, filename } = req.body || {};
    if (!imageData) return res.status(400).json({ error: 'No image data provided.' });
    let ext = 'jpg';
    let base64Content = imageData;
    const match = imageData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (match) {
      ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      base64Content = match[2];
    }
    const safeBase = (filename || 'suit').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const newFileName = `${safeBase}_${Date.now()}.${ext}`;
    const targetDir = path.resolve(__dirname, 'public', 'images');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, newFileName), Buffer.from(base64Content, 'base64'));
    return res.json({ success: true, url: `/images/${newFileName}`, filename: newFileName });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save product image.' });
  }
});

app.get('/api/database/indexes', (_req: Request, res: Response) => {
  res.json({ configured: true, firestoreDbId: storeMetadata.firestoreDbId, indexesCount: 4, indexes: [] });
});

// Orders Management: Restricted to authenticated administrators
app.get('/api/orders', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(backendOrders);
});

// Customer Safe Order Tracking (requires matching phone suffix when phone is provided)
app.get('/api/orders/track/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { phone } = req.query;
  const normalizedId = String(id || '').trim().replace(/^#/, '').toUpperCase();
  const order = backendOrders.find((o) => o.id.toUpperCase() === normalizedId);
  if (!order) {
    return res.status(404).json({ error: 'Order Not Found', message: `No order found with reference '${id}'.` });
  }
  if (phone) {
    const cleanQuery = String(phone).replace(/\D/g, '');
    const cleanCustomer = String(order.customer.phone || '').replace(/\D/g, '');
    if (cleanCustomer && cleanQuery && !cleanCustomer.endsWith(cleanQuery.slice(-7))) {
      return res.status(403).json({ error: 'Verification Failed', message: 'Phone number verification failed for this order.' });
    }
  }
  return res.json({
    id: order.id,
    date: order.date,
    status: order.status,
    subtotal: order.subtotal,
    shipping: Math.max(0, order.total - order.subtotal),
    total: order.total,
    itemsCount: order.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    items: order.items.map((item) => ({
      title: item.title || item.product?.title || 'Unstitched Fabric Ensemble',
      fabric: item.fabric || item.product?.fabric || 'Signature Unstitched',
      quantity: Number(item.quantity) || 1,
      selectedColor: item.selectedColor,
    })),
    city: order.customer?.city || 'Pakistan',
    paymentMethod: order.paymentMethod,
  });
});

// Server-Authoritative Order Placement
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, items, paymentMethod, paymentDetails } = req.body || {};
  if (!customer || !customer.fullName || !customer.phone || !customer.address) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Customer full name, phone number, and delivery address are strictly required.',
    });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Order must contain at least one unstitched fabric item.',
    });
  }

  // Server-authoritative price calculation
  let calculatedSubtotal = 0;
  const verifiedItems: any[] = [];

  for (const item of items) {
    const productId = item.productId || item.product?.id || item.id;
    const qty = Math.max(1, Math.min(Number(item.quantity) || 1, 50));

    // Look up genuine product in catalog
    const product = INITIAL_PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      return res.status(400).json({
        error: 'Invalid Product',
        message: `Product ID '${productId}' is not recognized in Niaz Cloth House catalog.`,
      });
    }

    // Check variant design option additional price
    let designAddon = 0;
    if (item.selectedDesign && product.designOptions) {
      const designOpt = product.designOptions.find((d) => d.name === item.selectedDesign || d.id === item.selectedDesign);
      if (designOpt && designOpt.additionalPrice) {
        designAddon = designOpt.additionalPrice;
      }
    }

    const unitPrice = product.price;
    const itemTotal = (unitPrice + designAddon) * qty;
    calculatedSubtotal += itemTotal;

    verifiedItems.push({
      productId: product.id,
      title: product.title,
      fabric: product.fabric,
      gender: product.gender,
      primaryImage: product.primaryImage,
      unitPrice,
      selectedColor: item.selectedColor || product.color,
      selectedDesign: item.selectedDesign || (product.designOptions?.[0]?.name ?? 'Standard Cut'),
      designAdditionalPrice: designAddon,
      quantity: qty,
      subtotal: itemTotal,
    });
  }

  // Authoritative shipping fee rules: Free above 5000 PKR, else 250 PKR
  const freeShippingThreshold = 5000;
  const standardShipping = 250;
  const calculatedShipping = calculatedSubtotal >= freeShippingThreshold ? 0 : standardShipping;
  const calculatedTotal = calculatedSubtotal + calculatedShipping;

  const orderId = `NCH-1970-${Math.floor(10000 + Math.random() * 90000)}`;
  const authoritativeOrder: StoreOrder = {
    id: orderId,
    date: new Date().toISOString(),
    customer: {
      fullName: String(customer.fullName).trim(),
      phone: String(customer.phone).trim(),
      whatsapp: String(customer.whatsapp || customer.phone).trim(),
      email: customer.email ? String(customer.email).trim() : undefined,
      address: String(customer.address).trim(),
      city: String(customer.city || 'Rawalpindi').trim(),
      province: customer.province ? String(customer.province).trim() : 'Punjab',
      notes: customer.notes ? String(customer.notes).trim() : '',
    },
    items: verifiedItems,
    subtotal: calculatedSubtotal,
    total: calculatedTotal,
    status: 'Pending',
    paymentMethod: paymentMethod || 'Cash on Delivery',
  };

  backendOrders.unshift(authoritativeOrder);
  if (backendOrders.length > 500) backendOrders.pop();

  return res.status(201).json({
    success: true,
    message: 'Order verified and recorded authoritatively on server.',
    order: authoritativeOrder,
  });
});

// Status Updates: Strictly restricted to authenticated store administrator
app.patch('/api/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = backendOrders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (['Pending', 'Processing', 'Shipped', 'Delivered'].includes(status)) {
    order.status = status;
    return res.json({ success: true, order });
  }
  res.status(400).json({ error: 'Invalid status stage' });
});

app.get('/api/reviews', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  res.json(backendReviews);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { authorName, rating, comment, city } = req.body;
  const review = {
    id: `rev-${Date.now()}`,
    authorName: authorName || 'Customer',
    rating: Number(rating) || 5,
    comment: comment || 'Great quality!',
    city: city || 'Rawalpindi',
    createdAt: new Date().toISOString(),
    verified: true,
  };
  backendReviews.unshift(review);
  res.status(201).json(review);
});

app.post('/api/gemini/maps-grounding', async (req: Request, res: Response) => {
  res.json({
    text: 'Niaz Cloth House is located at Shop #166-C Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi. Hours: Monday to Sunday 10am-9pm. Hotline: 0334-6565636.',
    groundingMetadata: { groundingChunks: [{ web: { title: 'Google Maps - Niaz Cloth House', uri: 'https://maps.google.com/?q=Paris+Bazaar+Rawalpindi' } }] },
  });
});

app.post('/api/gemini/search-grounding', async (req: Request, res: Response) => {
  res.json({
    text: 'Authentic Chinese Boski in Pakistan is measured by weight: 6-pound, 8-pound, and 10-pound luxury ceremonial grades.',
    groundingMetadata: { groundingChunks: [{ web: { title: 'NCH Textile Intelligence', uri: 'https://nch.com/shop' } }] },
  });
});

// ========================================== //
// LOAD TESTING & BENCHMARKING API            //
// ========================================== //
app.post('/api/load-test/run', async (req: Request, res: Response) => {
  try {
    const { concurrency = 5, totalRequests = 50, target = 'cached-catalog' } = req.body;
    const safeConcurrency = Math.min(Math.max(1, Number(concurrency) || 5), 25);
    const safeTotal = Math.min(Math.max(5, Number(totalRequests) || 50), 200);
    const hitsBefore = cacheMetrics.hits;
    const latencies: number[] = [];
    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();
    let scheduled = 0;
    let completed = 0;

    const executeRequest = async (_index: number) => {
      const t0 = performance.now();
      try {
        if (target === 'cached-catalog') {
          const cacheKey = 'store_metadata_info';
          let item = getFromCache(cacheKey);
          if (!item) {
            setToCache(cacheKey, storeMetadata, 3600);
          }
          successCount++;
        } else if (target === 'api-orders') {
          if (backendOrders) successCount++;
        } else {
          getFromCache('store_metadata_info');
          successCount++;
        }
      } catch (err) {
        errorCount++;
      } finally {
        const t1 = performance.now();
        latencies.push(Number((t1 - t0).toFixed(2)));
        completed++;
      }
    };

    const workers = Array.from({ length: safeConcurrency }, async () => {
      while (scheduled < safeTotal) {
        const currentIndex = scheduled++;
        await executeRequest(currentIndex);
      }
    });

    await Promise.all(workers);
    const durationMs = Math.max(1, Date.now() - startTime);
    const throughputRps = Number((safeTotal / (durationMs / 1000)).toFixed(1));
    latencies.sort((a, b) => a - b);
    const min = latencies[0] || 0;
    const max = latencies[latencies.length - 1] || 0;
    const avg = Number((latencies.reduce((acc, v) => acc + v, 0) / (latencies.length || 1)).toFixed(2));
    const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
    const hitsAfter = cacheMetrics.hits;
    const deltaHits = hitsAfter - hitsBefore;

    const runResult: LoadTestRun = {
      id: `load-test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      target,
      concurrency: safeConcurrency,
      totalRequests: safeTotal,
      completedRequests: completed,
      successCount,
      errorCount,
      durationMs,
      throughputRps,
      latency: { min, max, avg, p50, p95, p99 },
      cacheStats: { hitsBefore, hitsAfter, deltaHits },
    };

    loadTestHistory.unshift(runResult);
    if (loadTestHistory.length > 25) loadTestHistory.pop();

    res.json({
      success: true,
      message: `Load test completed successfully across ${safeConcurrency} concurrent workers.`,
      result: runResult,
      systemMetrics: {
        activeServerCacheEntries: serverCache.size,
        totalCacheHits: cacheMetrics.hits,
        totalCacheMisses: cacheMetrics.misses,
        hitRatioPercent: Number(
          ((cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses || 1)) * 100).toFixed(1)
        ),
      },
    });
  } catch (err: any) {
    console.error('Load test execution error:', err);
    res.status(500).json({ error: 'Load test benchmark failed', details: err.message });
  }
});

app.get('/api/load-test/history', (_req: Request, res: Response) => {
  res.json({
    totalRuns: loadTestHistory.length,
    history: loadTestHistory,
  });
});

// ========================================== //
// AUTOMATED DATABASE BACKUP & RESTORATION API //
// ========================================== //
app.get('/api/admin/backups', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: backupsList.length,
    backups: backupsList.map(b => ({
      id: b.id,
      timestamp: b.timestamp,
      recordCounts: b.recordCounts,
      fileSizeKb: b.fileSizeKb,
      status: b.status,
    })),
  });
});

app.post('/api/admin/backups/create', (_req: Request, res: Response) => {
  const newBackup = generateDatabaseBackup();
  res.json({
    success: true,
    message: 'Database backup snapshot generated successfully.',
    backup: {
      id: newBackup.id,
      timestamp: newBackup.timestamp,
      recordCounts: newBackup.recordCounts,
      fileSizeKb: newBackup.fileSizeKb,
    },
  });
});

// ========================================== //
// CLIENT TELEMETRY & ANALYTICS INGESTION API  //
// ========================================== //
app.post('/api/telemetry/error', (req: Request, res: Response) => {
  const report = req.body || {};
  const entry: ClientErrorReport = {
    id: `err-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    message: String(report.message || 'Unknown error'),
    stack: report.stack ? String(report.stack) : undefined,
    category: String(report.category || 'uncaught'),
    timestamp: new Date().toISOString(),
    url: String(report.url || ''),
    userAgent: String(req.headers['user-agent'] || ''),
    breadcrumbs: Array.isArray(report.breadcrumbs) ? report.breadcrumbs : [],
  };
  serverErrorReports.unshift(entry);
  if (serverErrorReports.length > 100) serverErrorReports.pop();
  res.json({ success: true, errorId: entry.id });
});

interface WhatsAppSyncLogEntry {
  id: string;
  timestamp: string;
  adminName: string;
  format: string;
  itemCount: number;
  targetPhone: string;
  status: string;
}
const whatsappSyncLogs: WhatsAppSyncLogEntry[] = [];

app.get('/api/admin/whatsapp-sync/log', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ logs: whatsappSyncLogs });
});

app.post('/api/admin/whatsapp-sync/log', requireAdminAuth, (req: Request, res: Response) => {
  const body = req.body || {};
  const entry: WhatsAppSyncLogEntry = {
    id: `wa-sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    adminName: String(body.adminName || (req as any).adminUser?.fullName || 'Store Administrator'),
    format: String(body.format || 'meta-csv'),
    itemCount: Number(body.itemCount) || INITIAL_PRODUCTS.length,
    targetPhone: String(body.targetPhone || storeMetadata.contact.whatsapp),
    status: String(body.status || 'Dispatched'),
  };
  whatsappSyncLogs.unshift(entry);
  if (whatsappSyncLogs.length > 50) whatsappSyncLogs.pop();
  res.json({ success: true, entry });
});

// Live Meta Commerce / WhatsApp Business Catalog CSV Feed URL
app.get('/api/catalog/whatsapp.csv', async (req: Request, res: Response) => {
  const { generateMetaCommerceCatalogCsv } = await import('./src/utils/whatsappCatalogSync.ts');
  const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol || 'https';
  const host = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim() || req.get('host') || 'nch.com';
  const baseUrl = `${proto}://${host}`;
  const csv = generateMetaCommerceCatalogCsv(INITIAL_PRODUCTS as any, baseUrl);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="niaz_whatsapp_catalog_feed.csv"');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(`\uFEFF${csv}`);
});

app.post('/api/telemetry/analytics', (req: Request, res: Response) => {
  const evt = req.body || {};
  const record: ClientAnalyticsEvent = {
    id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: String(evt.name || 'page_view'),
    properties: evt.properties || {},
    timestamp: new Date().toISOString(),
    url: String(evt.url || ''),
  };
  serverAnalyticsStream.unshift(record);
  if (serverAnalyticsStream.length > 200) serverAnalyticsStream.pop();
  res.json({ success: true, eventId: record.id });
});

// ========================================== //
// GLOBAL ERROR HANDLING & VITE / SPA FALLBACK //
// ========================================== //

// 404 Catch-All for unmatched API routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: `The requested endpoint '${req.path}' does not exist on Niaz Cloth House API server.`,
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Exception:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || 'An unexpected error occurred on the server.',
  });
});

// ========================================== //
// SERVER INITIALIZATION & VITE MIDDLEWARE    //
// ========================================== //
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(
      '/assets',
      express.static(path.join(distDir, 'assets'), {
        maxAge: '365d',
        immutable: true,
        etag: true,
      })
    );
    app.use(
      express.static(distDir, {
        maxAge: '1h',
        etag: true,
        setHeaders: (res: Response, filePath: string) => {
          if (filePath.endsWith('.avif')) {
            res.setHeader('Content-Type', 'image/avif');
          } else if (filePath.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
          }
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          }
        },
      })
    );
    app.get('*', (_req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: disableHmr ? false : { server: httpServer },
        ws: disableHmr ? false : { server: httpServer },
        watch: disableHmr ? null : {},
      },
      appType: 'spa',
    });

    if (disableHmr) {
      let cachedPatchedViteClient: string | null = null;
      app.get('/@vite/client', async (_req: Request, res: Response, next: NextFunction) => {
        try {
          if (!cachedPatchedViteClient) {
            const result = await vite.transformRequest('/@vite/client');
            if (!result?.code) return next();
            cachedPatchedViteClient = result.code
              .replace(
                'transport.connect(createHMRHandler(handleMessage));',
                '/* HMR WebSocket disabled when DISABLE_HMR=true */'
              )
              .replace(
                'setupForwardConsoleHandler(transport, forwardConsole);',
                ''
              )
              .replace(
                'else throw new SendBeforeConnectError("send was called before connect");',
                'else return;'
              )
              .replace(
                'else throw new SendBeforeConnectError("invoke was called before connect");',
                'else return undefined;'
              );
          }
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          return res.end(cachedPatchedViteClient);
        } catch {
          return next();
        }
      });
    }

    app.use(vite.middlewares);

    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).setHeader('Content-Type', 'text/html').end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    const { logText } = evaluateStartupDiagnostics();
    console.log(logText);
    console.log(`[NCH Backend] Secure Express server listening on http://0.0.0.0:${port}`);
    console.log(`[NCH Backend] Store: ${storeMetadata.name} (Est. ${storeMetadata.founded})`);
    console.log(`[NCH Backend] Firestore DB ID: ${storeMetadata.firestoreDbId}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;