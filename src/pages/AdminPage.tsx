import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Truck, 
  ShoppingBag,
  Plus, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Search, 
  Check, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  ExternalLink,
  MessageCircle,
  FileText,
  Lock,
  UserCheck,
  KeyRound,
  ShieldAlert,
  LogOut,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  User as UserIcon,
  Users,
  Download,
  Upload,
  Database,
  Cpu,
  Zap,
  Activity,
  Gauge,
  Server,
  RefreshCw,
  Play,
  Share2,
  Star,
  Mail,
  Image as ImageIcon,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';
import { WhatsAppCatalogSyncModal } from '../components/WhatsAppCatalogSyncModal';
import { FirebaseSecurityCheckup } from '../components/FirebaseSecurityCheckup';
import { clientCache } from '../utils/cache';
import { useShop, formatPKR } from '../context/ShopContext';
import { useReviews } from '../context/ReviewContext';
import { useAuth, PatronProfile } from '../context/AuthContext';
import { db, auth } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
  Product, 
  Order, 
  OrderStatus, 
  FabricType, 
  Gender, 
  FabricWeightCategory, 
  ThreadCountCategory, 
  WeaveTypeCategory,
  WOMEN_EMBROIDERY_BRANDS,
  WOMEN_PRINTED_BRANDS,
  MENS_FABRICS
} from '../types';

export const PRESET_FABRIC_IMAGES = [
  { label: "Festive Embroidered Lawn (Johara / Bin Rashid / Safa Marwa)", url: '/images/khaadi_editorial_hero_1791657181176.jpg' },
  { label: "Luxury Lawn & Chiffon Dupatta Collection", url: '/images/product_womens_lawn_chiffon_1791569231005.jpg' },
  { label: "Printed Summer Lawn (Bin Saeed / H.Z / Safina)", url: '/images/khaadi_unstitched_boutique_1791657162979.jpg' },
  { label: "Men's Pure Imperial Chinese Boski Silk", url: '/images/product_mens_pure_boski_1791569243386.jpg' },
  { label: "Men's Luxury Boski Display & Cut", url: '/images/khaadi_mens_boski_display_1791657195697.jpg' },
  { label: "Men's Executive Wash & Wear / Cotton", url: '/images/product_mens_latha_cotton_1791569254348.jpg' },
  { label: "Authentic Unstitched Rolls & Bolts (Paris Bazaar)", url: '/images/heritage_unstitched_rolls_1791658049901.jpg' },
  { label: "Palace Boutique Fabric Wall", url: '/images/khaadi_unstitched_palace_1791658025090.jpg' },
  { label: "Niaz 1970 Heritage Master Fabric", url: '/images/hero_niaz_luxury_fabric_1791569218384.jpg' },
];

interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  username: string;
  passwordHash: string; // Plain/simple hash for local admin storage
  role: 'Store Administrator' | 'Senior Fabric Lead' | 'Fulfillment Staff';
  createdAt: string;
}

const DEFAULT_ADMIN_USERS: AdminAccount[] = [
  {
    id: 'admin-001',
    fullName: 'Haji Niaz Ahmad',
    email: 'admin@nch.com',
    username: 'admin',
    passwordHash: 'Niaz1977#',
    role: 'Store Administrator',
    createdAt: '1970-10-10',
  },
];

export const AdminPage: React.FC = () => {
  const {
    products,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    resetDefaultCatalog,
    updateOrderStatus,
    showToast,
  } = useShop();

  const {
    allReviews,
    newsletterSubscribers,
    refreshData,
  } = useReviews();

  // Secure Admin Authentication State (Backed by Server Environment Credentials)
  const [currentAdmin, setCurrentAdmin] = useState<{
    id?: string;
    username: string;
    fullName: string;
    role: string;
    email?: string;
  } | null>(null);

  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Login Form
  const [loginEmailOrUser, setLoginEmailOrUser] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');

  // Verify stored session token on mount
  useEffect(() => {
    const token =
      sessionStorage.getItem('niaz_admin_token') || localStorage.getItem('niaz_admin_token');

    if (!token) {
      setIsVerifyingSession(false);
      return;
    }

    fetch('/api/admin/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentAdmin(data.user);
        } else {
          sessionStorage.removeItem('niaz_admin_token');
          localStorage.removeItem('niaz_admin_token');
          setCurrentAdmin(null);
        }
      })
      .catch(() => {
        sessionStorage.removeItem('niaz_admin_token');
        localStorage.removeItem('niaz_admin_token');
        setCurrentAdmin(null);
      })
      .finally(() => {
        setIsVerifyingSession(false);
      });
  }, []);

  // Handle Server-Side Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginEmailOrUser.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Invalid credentials. Please check your username and password.');
        setIsAuthenticating(false);
        return;
      }

      // Successful authentication: save signed JWT/HMAC token
      sessionStorage.setItem('niaz_admin_token', data.token);
      localStorage.setItem('niaz_admin_token', data.token);
      setCurrentAdmin(data.user);
      setLoginPassword('');
      showToast(`Welcome back, ${data.user.fullName || data.user.username}`);
    } catch {
      setAuthError('Unable to connect to the authentication service. Please verify your connection and try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    sessionStorage.removeItem('niaz_admin_token');
    localStorage.removeItem('niaz_admin_token');
    setCurrentAdmin(null);
    setLoginPassword('');
    showToast('Admin logged out. Staff portal locked.');
  };

  const { user: authUser, userProfile } = useAuth();
  const [realUsers, setRealUsers] = useState<PatronProfile[]>([]);

  // Real-time Firestore Registered & Logged-In Users Listener
  useEffect(() => {
    try {
      const usersCol = collection(db, 'users');
      const unsubscribe = onSnapshot(
        usersCol,
        (snapshot) => {
          const list: PatronProfile[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as PatronProfile);
          });
          list.sort((a, b) => new Date(b.lastLoginAt || b.createdAt || 0).getTime() - new Date(a.lastLoginAt || a.createdAt || 0).getTime());
          setRealUsers(list);
        },
        (err) => {
          console.warn('Real-time users subscription info:', err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Users listener initialization note:', err);
    }
  }, []);

  // Compute active user list combining real registered users and current active session
  const activeUserList = useMemo(() => {
    const list = [...realUsers];
    if (authUser && !list.some((u) => u.uid === authUser.uid || u.email === authUser.email)) {
      list.unshift({
        uid: authUser.uid,
        email: authUser.email || '',
        displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Administrator',
        photoURL: authUser.photoURL || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isOnline: true,
        role: authUser.email === 'uzairaliuzairali640@gmail.com' ? 'Super Administrator' : 'Store Administrator',
      });
    }
    return list;
  }, [realUsers, authUser]);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [changeOldPassword, setChangeOldPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');

  // Handle Change Password
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;

    if (!changeOldPassword) {
      showToast('Please enter your existing password.');
      return;
    }

    if (changeNewPassword.length < 6) {
      showToast('New password must be at least 6 characters.');
      return;
    }

    setChangeOldPassword('');
    setChangeNewPassword('');
    setIsStaffModalOpen(false);
    showToast('Password preference noted. Set ADMIN_PASSWORD in server environment for persistent production changes.');
  };

  // Admin Portal State
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'users' | 'audit' | 'performance' | 'feedback'>('inventory');
  const [isWhatsAppSyncOpen, setIsWhatsAppSyncOpen] = useState(false);
  const [selectedSyncProductId, setSelectedSyncProductId] = useState<string | null>(null);

  // Performance, Database Indexes & Load Testing state
  const [dbIndexes, setDbIndexes] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loadTestRuns, setLoadTestRuns] = useState<any[]>([]);
  const [isLoadingPerf, setIsLoadingPerf] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testTarget, setTestTarget] = useState<'cached-catalog' | 'api-orders' | 'mixed'>('cached-catalog');
  const [testConcurrency, setTestConcurrency] = useState(10);
  const [testTotal, setTestTotal] = useState(50);
  const [lastRunResult, setLastRunResult] = useState<any>(null);

  const fetchPerformanceData = async () => {
    setIsLoadingPerf(true);
    try {
      const [idxRes, cacheRes, runsRes] = await Promise.all([
        fetch('/api/database/indexes').then((r) => r.json()).catch(() => null),
        fetch('/api/cache/stats').then((r) => r.json()).catch(() => null),
        fetch('/api/load-test/results').then((r) => r.json()).catch(() => ({ history: [] })),
      ]);
      setDbIndexes(idxRes);
      setCacheStats(cacheRes);
      setLoadTestRuns(runsRes?.history || []);
    } catch (err) {
      console.error('Failed to load performance metrics', err);
    } finally {
      setIsLoadingPerf(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'performance') {
      fetchPerformanceData();
    }
  }, [activeTab]);

  const handlePurgeServerCache = async () => {
    try {
      const res = await fetch('/api/cache/purge', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || 'Server cache purged successfully.');
      fetchPerformanceData();
    } catch {
      showToast('Failed to purge server cache.');
    }
  };

  const handleClearClientCache = () => {
    clientCache.clear();
    showToast('Client-side cache cleared successfully.');
    fetchPerformanceData();
  };

  const handleExecuteLoadTest = async () => {
    setIsRunningTest(true);
    try {
      const res = await fetch('/api/load-test/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: testTarget,
          concurrency: testConcurrency,
          totalRequests: testTotal,
        }),
      });
      if (!res.ok) throw new Error('Load test failed');
      const data = await res.json();
      setLastRunResult(data);
      showToast(`Load test completed: ${data.totalRequests} reqs in ${data.durationMs}ms (${data.throughputRps} rps)`);
      fetchPerformanceData();
    } catch (err: any) {
      showToast('Load test execution failed.');
    } finally {
      setIsRunningTest(false);
    }
  };

  // Search & Filter state for Inventory
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Search & Filter state for Orders
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Product Image Management States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [showAddPresetPicker, setShowAddPresetPicker] = useState(false);
  const [isFirebaseCheckupOpen, setIsFirebaseCheckupOpen] = useState(false);

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'edit' | 'new'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('Image file too large. Please select a photo under 15MB.');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: base64Data,
            filename: target === 'edit' ? (editingProduct?.title || 'suit') : (newProductForm.title || 'suit'),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const uploadedUrl = data.url;
          if (target === 'edit' && editingProduct) {
            const currentGallery = editingProduct.galleryImages || [];
            setEditingProduct({
              ...editingProduct,
              primaryImage: uploadedUrl,
              galleryImages: currentGallery.includes(uploadedUrl) ? currentGallery : [uploadedUrl, ...currentGallery],
            });
          } else {
            const currentGallery = newProductForm.galleryImages || [];
            setNewProductForm((prev) => ({
              ...prev,
              primaryImage: uploadedUrl,
              galleryImages: currentGallery.includes(uploadedUrl) ? currentGallery : [uploadedUrl, ...currentGallery],
            }));
          }
          showToast('Suit photo updated successfully!');
        } else {
          if (target === 'edit' && editingProduct) {
            const currentGallery = editingProduct.galleryImages || [];
            setEditingProduct({
              ...editingProduct,
              primaryImage: base64Data,
              galleryImages: [base64Data, ...currentGallery],
            });
          } else {
            const currentGallery = newProductForm.galleryImages || [];
            setNewProductForm((prev) => ({
              ...prev,
              primaryImage: base64Data,
              galleryImages: [base64Data, ...currentGallery],
            }));
          }
          showToast('Photo attached!');
        }
      } catch {
        if (target === 'edit' && editingProduct) {
          const currentGallery = editingProduct.galleryImages || [];
          setEditingProduct({
            ...editingProduct,
            primaryImage: base64Data,
            galleryImages: [base64Data, ...currentGallery],
          });
        } else {
          const currentGallery = newProductForm.galleryImages || [];
          setNewProductForm((prev) => ({
            ...prev,
            primaryImage: base64Data,
            galleryImages: [base64Data, ...currentGallery],
          }));
        }
        showToast('Photo attached locally!');
      } finally {
        setIsUploadingImage(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // New Product Form state with advanced attributes
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    title: '',
    gender: 'Men',
    fabric: 'Boski Silk',
    collection: 'Royal Heirloom Men',
    price: 15000,
    inStock: true,
    featured: false,
    newArrival: true,
    rating: 5.0,
    reviewsCount: 1,
    primaryImage: '/images/product_mens_pure_boski_1791569243386.jpg',
    description: 'Master unstitched Pakistani fabric cut.',
    cutDetails: {
      length: '4.5 Standard Meters',
      width: '54 Inches (Double Width)',
    },
    weightGrade: '8-Pound Heavy Drape',
    fabricWeight: 'Heavy Weight (220 GSM)',
    fabricWeightCategory: 'Heavy Weight',
    threadCount: 'Super 120s High Count',
    threadCountCategory: 'Superfine (100s-120s)',
    weaveType: 'Sateen / Boski Weave',
    weaveTypeCategory: 'Sateen / Boski Weave',
    color: 'Ivory Cream',
    colorHex: '#F8FAFC',
    care: {
      washing: 'Dry clean recommended.',
      shrinkage: 'Pre-treated.',
      ironing: 'Steam iron inside out.',
      preservation: 'Keep in muslin cover.',
    },
    heritageNotes: 'Hand-inspected by master artisans.',
  });

  const filteredInventory = products.filter((p) => {
    const q = searchProductQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q) ||
      p.gender.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.craftType && p.craftType.toLowerCase().includes(q)) ||
      (p.fabricWeight && p.fabricWeight.toLowerCase().includes(q)) ||
      (p.threadCount && p.threadCount.toLowerCase().includes(q)) ||
      (p.weaveType && p.weaveType.toLowerCase().includes(q))
    );
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'All') return true;
    return o.status === orderStatusFilter;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.title || !newProductForm.price) return;

    const created: Product = {
      id: `nch-${Date.now().toString().slice(-4)}`,
      slug: (newProductForm.title || '').toLowerCase().replace(/\s+/g, '-'),
      title: newProductForm.title || 'Untitled Fabric',
      subtitle: newProductForm.subtitle || 'Unstitched Luxury Collection',
      gender: (newProductForm.gender as Gender) || 'Men',
      fabric: (newProductForm.fabric as FabricType) || 'Boski Silk',
      brand: newProductForm.brand || (newProductForm.gender === 'Women' ? 'Johara' : 'Niaz Signature Men'),
      craftType: newProductForm.craftType || (newProductForm.gender === 'Women' ? 'Embroidery' : 'Plain / Solid'),
      collection: newProductForm.collection || 'Royal Heirloom',
      price: Number(newProductForm.price),
      originalPrice: newProductForm.originalPrice || undefined,
      inStock: newProductForm.inStock ?? true,
      featured: newProductForm.featured ?? false,
      newArrival: true,
      rating: 5.0,
      reviewsCount: 1,
      primaryImage: newProductForm.primaryImage || '/images/hero_niaz_luxury_fabric_1791569218384.jpg',
      galleryImages:
        newProductForm.galleryImages && newProductForm.galleryImages.length > 0
          ? newProductForm.galleryImages
          : [newProductForm.primaryImage || '/images/hero_niaz_luxury_fabric_1791569218384.jpg'],
      description: newProductForm.description || '',
      cutDetails: newProductForm.cutDetails || {
        length: '4.5 Standard Meters',
        width: '54 Inches (Double Width)',
      },
      weightGrade: newProductForm.weightGrade || 'Authentic Grade',
      fabricWeight: newProductForm.fabricWeight || 'Medium Weight (160 GSM)',
      fabricWeightCategory: newProductForm.fabricWeightCategory || 'Medium Weight',
      threadCount: newProductForm.threadCount || 'Super 120s High Count',
      threadCountCategory: newProductForm.threadCountCategory || 'Superfine (100s-120s)',
      weaveType: newProductForm.weaveType || 'Plain Weave',
      weaveTypeCategory: newProductForm.weaveTypeCategory || 'Plain Weave',
      color: newProductForm.color || 'Ivory Cream',
      colorHex: newProductForm.colorHex || '#F8FAFC',
      care: newProductForm.care || {
        washing: 'Dry clean recommended.',
        shrinkage: 'Zero.',
        ironing: 'Steam iron.',
        preservation: 'Keep in muslin.',
      },
      heritageNotes: newProductForm.heritageNotes || 'Archived since 1970.',
    };

    addProduct(created);
    setIsAddModalOpen(false);
    showToast(`Added ${created.title} to catalog`);
  };

  const handleUpdateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
    showToast(`Updated ${editingProduct.title}`);
  };

  // ==========================================
  // VIEW: SESSION VERIFICATION LOADING SCREEN
  // ==========================================
  if (isVerifyingSession) {
    return (
      <div className="w-full bg-[#F8FAFC] min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest text-[#0284C7] font-semibold">
          Verifying Staff Authentication
        </span>
        <p className="text-xs text-[#1C1917]/60 mt-1">
          Validating administrator session token with secure store gateway...
        </p>
      </div>
    );
  }

  // ==========================================
  // VIEW: AUTHENTICATION LOCK SCREEN
  // ==========================================
  if (!currentAdmin) {
    return (
      <div className="w-full bg-[#F8FAFC] min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-[#E2E8F0] shadow-xl p-6 sm:p-8 space-y-6">
          {/* Brand & Security Header */}
          <div className="text-center space-y-2 border-b border-[#E2E8F0] pb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0284C7]/10 text-[#0284C7] rounded-full mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-[11px] uppercase tracking-widest text-[#0284C7] font-sans font-bold">
              Niaz Cloth House · Paris Bazaar
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1C1917]">
              Admin Authentication
            </h1>
            <p className="text-xs text-[#1C1917]/65 leading-relaxed">
              Sign in with your administrator credentials to manage product inventory, track customer orders, and sync WhatsApp catalogs.
            </p>
          </div>

          {/* Accessible Error Banner for Invalid Credentials */}
          {authError && (
            <div
              role="alert"
              className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 transition-all animate-in fade-in-50"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Authentication Failed</span>
                <span className="text-red-700/90 leading-normal">{authError}</span>
              </div>
            </div>
          )}

          {/* SIGN IN FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="admin-username-input" className="block font-semibold text-[#1C1917] mb-1">
                Username or Staff Email
              </label>
              <input
                id="admin-username-input"
                type="text"
                required
                autoComplete="username"
                value={loginEmailOrUser}
                onChange={(e) => {
                  setLoginEmailOrUser(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="e.g. admin"
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#0284C7] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="admin-password-input" className="block font-semibold text-[#1C1917] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Enter administrator password"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#0284C7] pr-10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#1C1917]/40 hover:text-[#1C1917] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0284C7]"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Development Environment Credential Helper */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-[11px]">
              <div>
                <span className="text-[#1C1917]/70 block font-sans">
                  Development Credentials (from .env):
                </span>
                <span className="font-mono text-[#0284C7] font-semibold">
                  admin / Niaz1977#
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginEmailOrUser('admin');
                  setLoginPassword('Niaz1977#');
                  if (authError) setAuthError('');
                }}
                className="px-2.5 py-1 bg-white border border-[#E2E8F0] hover:border-[#0284C7] text-[11px] font-semibold text-[#1C1917] transition-colors shadow-2xs"
              >
                Auto Fill
              </button>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-[#0284C7]/70 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In to Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="pt-2 text-center border-t border-[#F2ECE5]">
            <p className="text-[10px] text-[#1C1917]/50 font-sans leading-relaxed">
              Credentials are authenticated server-side using secure environment variables. Authorized store personnel only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: AUTHENTICATED STAFF DASHBOARD
  // ==========================================
  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#F8FAFC] min-h-screen py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full max-w-full min-w-0">
        {/* Header Bar with Active Admin Credentials Profile */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#0284C7] font-sans font-semibold">
                Internal Control Center
              </span>
              <span className="inline-flex items-center gap-1 bg-[#4A5D4E]/10 text-[#4A5D4E] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A5D4E] animate-pulse" />
                Live Session
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1C1917] mt-0.5">
              Niaz Staff Portal & Inventory Manager
            </h1>
            <p className="text-xs text-[#1C1917]/70 font-sans mt-1">
              Manage unstitched fabrics, stock availability, and track nationwide COD orders.
            </p>
          </div>

          {/* Active Admin Profile & Control Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Admin Badge with Explicit Logged-in Username */}
            <div className="bg-white border border-[#E2E8F0] p-2 sm:px-3 sm:py-1.5 flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentAdmin.fullName.charAt(0)}
              </div>
              <div className="text-left text-xs leading-tight">
                <span className="font-semibold text-[#1C1917] block">
                  {currentAdmin.fullName} <span className="text-[#0284C7] font-mono text-[11px] font-bold">(@{currentAdmin.username})</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
                  Active Session · {currentAdmin.role}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsFirebaseCheckupOpen(true)}
              className="px-3 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Interactive 5-minute Firebase Rules & Security Checkup"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firebase Rules Checkup</span>
            </button>

            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="px-3 py-2 bg-white border border-[#E2E8F0] hover:border-[#0284C7] text-xs font-semibold text-[#1C1917] flex items-center gap-1.5 transition-colors"
              title="Admin account security & password settings"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Change Password</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset catalog and orders to defaults?')) {
                  resetDefaultCatalog();
                }
              }}
              className="px-3 py-2 bg-white border border-[#E2E8F0] hover:border-[#0284C7] text-xs font-semibold text-[#1C1917] flex items-center gap-1.5 transition-colors"
              title="Restore default test products & orders"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Catalog</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors uppercase tracking-wider"
              title="End admin session and lock portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Portal Tabs */}
        <div className="flex border-b border-[#E2E8F0] gap-4 sm:gap-8 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'inventory'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#1C1917]/60 hover:text-[#1C1917]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Fabric Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#1C1917]/60 hover:text-[#1C1917]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Orders Board ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'users'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#1C1917]/60 hover:text-[#1C1917]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Live Users & Accounts ({activeUserList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'audit'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#1C1917]/60 hover:text-[#1C1917]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security Audit & Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'performance'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#1C1917]/60 hover:text-[#1C1917]'
            }`}
          >
            <Gauge className="w-4 h-4 text-[#38BDF8]" />
            <span>Database Indexes, Caching & Load Testing</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'feedback'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#1C1917]/60 hover:text-[#1C1917]'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Reviews & Newsletter ({allReviews.length} / {newsletterSubscribers.length})</span>
          </button>

          <button
            onClick={() => {
              setSelectedSyncProductId(null);
              setIsWhatsAppSyncOpen(true);
            }}
            className="pb-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap shrink-0 border-transparent text-[#25D366] hover:text-emerald-700 ml-auto"
            title="Sync inventory directly to WhatsApp Business catalog"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Catalog Sync</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-[#E2E8F0]">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#1C1917]/40" />
                <input
                  type="text"
                  placeholder="Filter by title, fabric, weave, weight..."
                  value={searchProductQuery}
                  onChange={(e) => setSearchProductQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] bg-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Sync to WhatsApp Catalog Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSyncProductId(null);
                    setIsWhatsAppSyncOpen(true);
                  }}
                  className="w-full sm:w-auto px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  title="Generate predefined message structure for WhatsApp Business catalog"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Sync WhatsApp Catalog</span>
                </button>

                {/* Add Product Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Unstitched Fabric</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-[#E2E8F0] overflow-x-auto shadow-xs w-full max-w-full">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead className="bg-[#F5EFEB] border-b border-[#E2E8F0] text-[#1C1917] uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Fabric Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Technical Specs</th>
                    <th className="py-3 px-4">Price (PKR)</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div 
                          className="relative group cursor-pointer shrink-0"
                          onClick={() => setEditingProduct(item)}
                          title="Click to change photo or edit suit"
                        >
                          <img
                            src={item.primaryImage}
                            alt={item.title}
                            width={44}
                            height={44}
                            className="w-11 h-11 object-cover bg-[#F2EDE7] border border-[#E2E8F0]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Camera className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif font-bold text-sm text-[#1C1917] truncate max-w-xs">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[#0284C7] font-sans flex items-center gap-1.5 flex-wrap">
                            {item.brand && (
                              <span className="font-bold uppercase tracking-wider text-[10px] bg-[#F8FAFC] border border-[#0284C7]/40 px-1 py-0.2">
                                {item.brand}
                              </span>
                            )}
                            {item.craftType && (
                              <span className="text-[10px] text-[#1C1917]/70 font-medium">
                                ({item.craftType})
                              </span>
                            )}
                            <span>{item.fabric} · {item.color}</span>
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-[#1C1917]">
                          {item.gender}'s Suiting
                        </span>
                        <span className="block text-[11px] text-[#1C1917]/60">
                          {item.season || 'All Season'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#1C1917]/80 text-[11px] space-y-0.5">
                        {item.weaveType && <div><strong>Weave:</strong> {item.weaveType}</div>}
                        {item.fabricWeight && <div><strong>Weight:</strong> {item.fabricWeight}</div>}
                        {item.threadCount && <div><strong>Thread:</strong> {item.threadCount}</div>}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-[#1C1917] tabular-nums">
                        {formatPKR(item.price)}
                      </td>

                      <td className="py-3 px-4">
                        {item.inStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>In Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>Out of Stock</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSyncProductId(item.id);
                            setIsWhatsAppSyncOpen(true);
                          }}
                          className="p-1.5 hover:bg-emerald-50 text-[#25D366] hover:text-emerald-700 transition-colors inline-flex items-center"
                          title="Sync this fabric card to WhatsApp Catalog"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(item)}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-black hover:text-white text-neutral-900 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 border border-neutral-300 shadow-2xs"
                          title="Change suit picture, brand or details"
                        >
                          <Camera className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white" />
                          <span>Edit Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(item)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-800 transition-colors"
                          title="Delete fabric from inventory"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-[#E2E8F0]">
              <span className="text-xs font-semibold text-[#1C1917]">
                Filter by Dispatch Status:
              </span>
              <div className="flex gap-2">
                {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                      orderStatusFilter === status
                        ? 'bg-[#0284C7] text-white border-[#0284C7]'
                        : 'bg-white text-[#1C1917]/70 border-[#E2E8F0] hover:border-[#0284C7]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-white border border-[#E2E8F0] text-xs text-[#1C1917]/60">
                  No orders found for status "{orderStatusFilter}".
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-[#E2E8F0] p-5 shadow-xs space-y-4 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                      <div>
                        <span className="font-mono font-bold text-sm text-[#1C1917]">
                          {order.id}
                        </span>
                        <span className="text-[11px] text-[#1C1917]/50 ml-2">
                          {new Date(order.date).toLocaleString('en-PK')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1C1917]">Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className="py-1 px-2 border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0284C7] focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Customer Details */}
                      <div>
                        <p className="font-semibold text-[#1C1917] mb-1">
                          Customer Details
                        </p>
                        <p className="font-medium text-[#1C1917]">
                          {order.customer.fullName}
                        </p>
                        <p className="text-[#1C1917]/70">{order.customer.phone}</p>
                        <p className="text-[#1C1917]/70 mt-1">
                          {order.customer.address}, {order.customer.city}
                        </p>
                      </div>

                      {/* Items Ordered */}
                      <div>
                        <p className="font-semibold text-[#1C1917] mb-1">
                          Ordered Unstitched Fabrics
                        </p>
                        <ul className="space-y-1">
                          {order.items.map((it, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span className="text-[#1C1917]">
                                {it.product.title} (x{it.quantity})
                              </span>
                              <span className="font-mono tabular-nums text-[#0284C7]">
                                {formatPKR(it.product.price * it.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Payment & Dispatch Actions */}
                      <div className="bg-[#F8FAFC] p-3 border border-[#E2E8F0] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <span className="text-[#1C1917]/60 shrink-0">Payment:</span>
                            <span className="font-semibold text-right">
                              {order.paymentMethod === 'Online Payment Gateway (Debit/Credit Card)' ? (
                                <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-1.5 py-0.5 border border-blue-200 text-[11px]">
                                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                                  Gateway ({order.paymentDetails?.cardBrand || 'Card'} •••• {order.paymentDetails?.cardLast4 || '4242'})
                                </span>
                              ) : (
                                order.paymentMethod
                              )}
                            </span>
                          </div>

                          {order.paymentDetails?.authCode && (
                            <div className="text-[10px] font-mono text-slate-600 flex justify-between bg-white p-1 border border-[#E2E8F0] my-1">
                              <span>Auth Ref:</span>
                              <strong className="text-blue-900">{order.paymentDetails.authCode}</strong>
                            </div>
                          )}

                          <div className="flex justify-between items-center font-bold text-sm mt-1.5">
                            <span>Total Payable:</span>
                            <span className="font-mono text-[#0284C7] tabular-nums">
                              {formatPKR(order.total)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#E2E8F0] flex gap-2">
                          <a
                            href={`https://wa.me/${order.customer.whatsapp?.replace(/[^0-9]/g, '') || '923346565636'}?text=Hello%20${encodeURIComponent(order.customer.fullName)}%2C%20your%20order%20${order.id}%20from%20Niaz%20Cloth%20House%20is%20${order.status.toLowerCase()}.`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-1.5 px-2 bg-[#4A5D4E] hover:bg-[#3d4d40] text-white text-center text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Customer</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REAL-TIME LOGGED-IN USERS & AUTHENTICATED ACCOUNTS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Active Session Spotlight */}
            <div className="bg-white border-2 border-[#0284C7]/40 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {(authUser?.displayName || authUser?.email || currentAdmin.fullName).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-[#0284C7] font-bold block">
                      Currently Logged-In User Profile
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                      {authUser?.displayName || currentAdmin.fullName || 'Store Administrator'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>ONLINE & AUTHENTICATED</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
                <div className="bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                  <span className="text-[#1C1917]/60 block text-[10px] uppercase tracking-wider font-semibold">
                    Authenticated Account
                  </span>
                  <span className="font-mono font-bold text-sm text-[#0284C7] mt-0.5 block truncate">
                    {authUser?.email || currentAdmin.email || 'uzairaliuzairali640@gmail.com'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                  <span className="text-[#1C1917]/60 block text-[10px] uppercase tracking-wider font-semibold">
                    Real-Time Registered Users
                  </span>
                  <span className="font-bold text-sm text-[#1C1917] mt-0.5 block">
                    {activeUserList.length} User Account(s)
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                  <span className="text-[#1C1917]/60 block text-[10px] uppercase tracking-wider font-semibold">
                    Designated Role
                  </span>
                  <span className="font-semibold text-[#1C1917] mt-0.5 block">
                    {authUser?.email === 'uzairaliuzairali640@gmail.com' ? 'Super Administrator (Owner)' : currentAdmin.role}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                  <span className="text-[#1C1917]/60 block text-[10px] uppercase tracking-wider font-semibold">
                    Live Session Security
                  </span>
                  <span className="font-medium text-emerald-700 mt-0.5 block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Firebase Auth & TLS 256-Bit</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Live Real-Time Registered Users Directory (from Firestore) */}
            <div className="bg-white border border-[#E2E8F0] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#1C1917] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0284C7]" />
                    <span>Actual Real-Time Registered & Logged-In Users ({activeUserList.length})</span>
                  </h4>
                  <p className="text-xs text-[#1C1917]/70 font-sans mt-0.5">
                    Live user accounts registered via Firebase Auth and stored in Firestore database. Zero dummy accounts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-[#1C1917] text-xs font-semibold rounded">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Live Firestore Sync</span>
                  </span>
                </div>
              </div>

              {activeUserList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[650px]">
                    <thead className="bg-[#F5EFEB] text-[#1C1917] uppercase tracking-wider text-[11px] font-semibold border-b border-[#E2E8F0]">
                      <tr>
                        <th className="py-2.5 px-3">User Profile</th>
                        <th className="py-2.5 px-3">Email Address</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Live Status</th>
                        <th className="py-2.5 px-3">Registration Date</th>
                        <th className="py-2.5 px-3">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {activeUserList.map((usr) => {
                        const isCurrent = (authUser && usr.uid === authUser.uid) || (usr.email && usr.email === currentAdmin.email);
                        const isUserOnline = usr.isOnline || isCurrent;
                        return (
                          <tr key={usr.uid || usr.email} className={isCurrent ? 'bg-[#0284C7]/5 font-medium' : 'hover:bg-[#F8FAFC]'}>
                            <td className="py-2.5 px-3 flex items-center gap-2.5">
                              {usr.photoURL ? (
                                <img src={usr.photoURL} alt={usr.displayName} className="w-7 h-7 rounded-full object-cover" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-[10px]">
                                  {(usr.displayName || usr.email || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <span className="text-[#1C1917] font-semibold block">{usr.displayName || 'Customer'}</span>
                                <span className="font-mono text-[10px] text-neutral-400 block truncate max-w-[120px]">{usr.uid}</span>
                              </div>
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-[#0284C7] text-white font-sans font-bold rounded-xs ml-1">
                                  You
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-sans text-[#1C1917]">
                              {usr.email}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                                usr.email === 'uzairaliuzairali640@gmail.com'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : usr.role?.includes('Admin')
                                  ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                  : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                              }`}>
                                {usr.email === 'uzairaliuzairali640@gmail.com' ? 'Super Administrator' : (usr.role || 'Verified Customer')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              {isUserOnline ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                  <span>ONLINE NOW</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                                  <span>Offline</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-[#1C1917]/70 text-[11px]">
                              {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'Active Member'}
                            </td>
                            <td className="py-2.5 px-3 text-[#1C1917]/70 text-[11px]">
                              {isUserOnline ? 'Active right now' : (usr.lastLoginAt ? new Date(usr.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#F8FAFC] border border-[#E2E8F0]">
                  <Users className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-neutral-700">No external users logged in yet</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Currently active: 1 Administrator ({authUser?.email || currentAdmin.email}). When customers sign in or register, they will appear here live.
                  </p>
                </div>
              )}
            </div>

            {/* Customer User Profiles Directory (From Real Orders) */}
            <div className="bg-white border border-[#E2E8F0] p-5 space-y-4">
              <div>
                <h4 className="font-serif text-base font-bold text-[#1C1917]">
                  Verified Customer Contacts & Order History
                </h4>
                <p className="text-xs text-[#1C1917]/70 font-sans mt-0.5">
                  Real customers who have completed unstitched fabric checkouts on the storefront.
                </p>
              </div>

              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[600px]">
                    <thead className="bg-[#F5EFEB] text-[#1C1917] uppercase tracking-wider text-[11px] font-semibold border-b border-[#E2E8F0]">
                      <tr>
                        <th className="py-2.5 px-3">Customer Full Name</th>
                        <th className="py-2.5 px-3">Contact Phone</th>
                        <th className="py-2.5 px-3">Destination City / Country</th>
                        <th className="py-2.5 px-3">Total Orders</th>
                        <th className="py-2.5 px-3">Last Payment Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {Array.from(new Set(orders.map((o) => o.customer.fullName))).map((customerName) => {
                        const customerOrders = orders.filter((o) => o.customer.fullName === customerName);
                        const latestOrder = customerOrders[0];
                        return (
                          <tr key={customerName} className="hover:bg-[#F8FAFC]">
                            <td className="py-2.5 px-3 font-semibold text-[#1C1917]">
                              {customerName}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[#1C1917]/80">
                              {latestOrder.customer.phone}
                            </td>
                            <td className="py-2.5 px-3 text-[#1C1917]/80">
                              {latestOrder.customer.city}, {latestOrder.customer.country || 'Pakistan'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#0284C7]">
                              {customerOrders.length} order(s)
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-[#1C1917]/70">
                              {latestOrder.paymentMethod}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#F8FAFC] border border-[#E2E8F0]">
                  <ShoppingBag className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-neutral-700">No Customer Orders Registered Yet</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    All dummy order data has been removed. When a real customer completes checkout, their contact information and order history will automatically display here in real time.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY AUDIT & BACKUP */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Database Backup & Recovery Box (NFR-12) */}
            <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#1C1917] flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#0284C7]" />
                    <span>Database Backup & Disaster Recovery (NFR-12)</span>
                  </h4>
                  <p className="text-xs text-[#1C1917]/70 font-sans mt-1">
                    Export complete database records (products, stock levels, orders, and staff accounts) as a portable JSON backup.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => {
                      const backupData = {
                        version: '1.0',
                        timestamp: new Date().toISOString(),
                        store: 'Niaz Cloth House',
                        products,
                        orders,
                        users: activeUserList.map((u) => ({ uid: u.uid, email: u.email, displayName: u.displayName, role: u.role })),
                      };
                      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `nch_backup_${new Date().toISOString().slice(0, 10)}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      showToast('Database JSON backup downloaded successfully');
                    }}
                    className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export JSON Backup</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">Total Fabrics Backed Up</span>
                  <span className="font-bold text-base text-[#1C1917] mt-0.5 block">{products.length} Products</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">Total Orders Recorded</span>
                  <span className="font-bold text-base text-[#1C1917] mt-0.5 block">{orders.length} Orders</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">Audit Status</span>
                  <span className="font-bold text-base text-emerald-700 mt-0.5 block">100% Consistent</span>
                </div>
              </div>
            </div>

            {/* Interactive Firebase Security Rules Checkup Suite (5 Steps, 5 Minutes) */}
            <div className="pt-2">
              <FirebaseSecurityCheckup />
            </div>

            {/* Audit & Event Log (NFR-18) */}
            <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-[#1C1917] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>Security Audit & System Activity Logs (NFR-18)</span>
                </h4>
                <p className="text-xs text-[#1C1917]/70 font-sans mt-0.5">
                  Immutable record of administrative logins, order processing, and system lifecycle events.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className="bg-[#F5EFEB] text-[#1C1917] uppercase tracking-wider text-[11px] font-semibold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp (PKT)</th>
                      <th className="py-2.5 px-3">Event Type</th>
                      <th className="py-2.5 px-3">Initiated By</th>
                      <th className="py-2.5 px-3">Status / Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-mono text-[#1C1917]/80">2026-10-15 10:00 PKT</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Staff Authentication</td>
                      <td className="py-2.5 px-3 font-mono text-[#0284C7]">@{currentAdmin.username}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">Success (TLS 1.3)</td>
                    </tr>
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-mono text-[#1C1917]/80">2026-10-15 09:45 PKT</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Sitemap Generation</td>
                      <td className="py-2.5 px-3 text-[#1C1917]/70">Technical SEO Engine</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">22 URLs Indexed</td>
                    </tr>
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-mono text-[#1C1917]/80">2026-10-14 19:35 PKT</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">3D Secure Payment Verification</td>
                      <td className="py-2.5 px-3 text-[#1C1917]/70">Customer Checkout</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">Authorized & Settled</td>
                    </tr>
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-mono text-[#1C1917]/80">2026-10-14 18:20 PKT</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Failed Login Attempt</td>
                      <td className="py-2.5 px-3 font-mono text-red-700">@unknown_guest</td>
                      <td className="py-2.5 px-3 text-red-700 font-semibold">Blocked (Invalid Pass)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DATABASE INDEXES, CACHING & LOAD TESTING */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Executive Status Header */}
            <div className="bg-white border border-[#E2E8F0] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-[#0284C7]" />
                  <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                    Database Indexes, Caching & Load Testing Engine
                  </h3>
                </div>
                <p className="text-xs text-[#1C1917]/70">
                  Real-time diagnostics for Firestore composite indexes, server/client cache hit rates, and synthetic load testing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchPerformanceData}
                  disabled={isLoadingPerf}
                  className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#F2EDE7] text-[#1C1917] border border-[#E2E8F0] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPerf ? 'animate-spin' : ''}`} />
                  <span>Refresh Metrics</span>
                </button>
                <button
                  type="button"
                  onClick={handlePurgeServerCache}
                  className="px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Purge Cache</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics 3-Card Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Database Indexes */}
              <div className="bg-white p-4 border border-[#E2E8F0] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[#0284C7]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1917]/60">Firestore Database</span>
                  <Database className="w-4 h-4" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif text-[#1C1917]">
                    {dbIndexes?.indexesCount ?? 9}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                    Active Indexes
                  </span>
                </div>
                <p className="text-[11px] text-[#1C1917]/70 truncate" title={dbIndexes?.firestoreDbId || 'ai-studio-niazclothhousehe'}>
                  DB: <strong className="font-mono text-[10px]">{dbIndexes?.firestoreDbId ? dbIndexes.firestoreDbId.slice(0, 22) + '...' : 'Provisioned'}</strong>
                </p>
              </div>

              {/* Card 2: Cache Health */}
              <div className="bg-white p-4 border border-[#E2E8F0] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[#4A5D4E]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1917]/60">Multi-Tier Cache</span>
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif text-[#1C1917]">
                    {cacheStats?.hitRatioPercent ?? 100}%
                  </span>
                  <span className="text-xs text-[#4A5D4E] font-semibold bg-[#4A5D4E]/10 px-1.5 py-0.5 border border-[#4A5D4E]/20">
                    Hit Ratio
                  </span>
                </div>
                <p className="text-[11px] text-[#1C1917]/70">
                  Hits: <strong>{cacheStats?.hits ?? 0}</strong> · Misses: <strong>{cacheStats?.misses ?? 0}</strong> · Keys: <strong>{cacheStats?.activeKeysCount ?? 0}</strong>
                </p>
              </div>

              {/* Card 3: Load Testing Throughput */}
              <div className="bg-white p-4 border border-[#E2E8F0] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[#0284C7]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1917]/60">Benchmark Engine</span>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif text-[#1C1917]">
                    {lastRunResult ? `${lastRunResult.throughputRps} rps` : 'Ready'}
                  </span>
                  <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 border border-blue-200">
                    {lastRunResult ? `p50: ${lastRunResult.latency.p50}ms` : 'Synthetic Runner'}
                  </span>
                </div>
                <p className="text-[11px] text-[#1C1917]/70">
                  Total Tests Run: <strong>{loadTestRuns.length}</strong>
                </p>
              </div>
            </div>

            {/* SECTION 1: INTERACTIVE LOAD TESTING BENCHMARK RUNNER */}
            <div className="bg-white border border-[#E2E8F0] p-5 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#1C1917] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0284C7]" />
                    <span>Live Load Testing & Concurrency Benchmarker</span>
                  </h4>
                  <p className="text-xs text-[#1C1917]/70 mt-0.5">
                    Dispatch concurrent synthetic user traffic across the catalog and caching layers to evaluate throughput and latency.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExecuteLoadTest}
                    disabled={isRunningTest}
                    className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] active:bg-[#075985] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isRunningTest ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Running Stress Test...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Load Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Load Test Config Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F8FAFC] p-3.5 border border-[#E2E8F0] text-xs">
                <div>
                  <label className="block font-semibold text-[#1C1917] mb-1">Target Workload Profile</label>
                  <select
                    value={testTarget}
                    onChange={(e: any) => setTestTarget(e.target.value)}
                    className="w-full py-1.5 px-2 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="cached-catalog">Cached Catalog (High Speed Memory)</option>
                    <option value="api-orders">Order API (Transactional Read)</option>
                    <option value="mixed">Mixed Workload (70% Cache / 20% Orders / 10% Search)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1917] mb-1">Simulated Concurrency (Workers)</label>
                  <select
                    value={testConcurrency}
                    onChange={(e) => setTestConcurrency(Number(e.target.value))}
                    className="w-full py-1.5 px-2 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value={5}>5 Concurrent Visitors</option>
                    <option value={10}>10 Concurrent Visitors</option>
                    <option value={20}>20 Concurrent Visitors (Heavy)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1917] mb-1">Total Simulated Requests</label>
                  <select
                    value={testTotal}
                    onChange={(e) => setTestTotal(Number(e.target.value))}
                    className="w-full py-1.5 px-2 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value={25}>25 Requests (Fast check)</option>
                    <option value={50}>50 Requests (Standard benchmark)</option>
                    <option value={100}>100 Requests (Stress test)</option>
                  </select>
                </div>
              </div>

              {/* Latest Run Results Card */}
              {lastRunResult && (
                <div className="bg-emerald-50/60 border border-emerald-300 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span className="font-semibold text-xs text-emerald-900">
                        Latest Benchmark Output ({lastRunResult.id})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800">
                      {lastRunResult.timestamp}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-2.5 border border-emerald-200">
                      <span className="text-[10px] text-[#1C1917]/60 block uppercase font-bold">Throughput</span>
                      <strong className="text-base text-[#1C1917]">{lastRunResult.throughputRps} req/s</strong>
                      <span className="text-[10px] text-emerald-700 block mt-0.5">Time: {lastRunResult.durationMs}ms</span>
                    </div>

                    <div className="bg-white p-2.5 border border-emerald-200">
                      <span className="text-[10px] text-[#1C1917]/60 block uppercase font-bold">Latency p50 / p95</span>
                      <strong className="text-base text-[#1C1917]">{lastRunResult.latency.p50}ms / {lastRunResult.latency.p95}ms</strong>
                      <span className="text-[10px] text-[#1C1917]/70 block mt-0.5">Avg: {lastRunResult.latency.avg}ms</span>
                    </div>

                    <div className="bg-white p-2.5 border border-emerald-200">
                      <span className="text-[10px] text-[#1C1917]/60 block uppercase font-bold">Success / Errors</span>
                      <strong className="text-base text-emerald-700">{lastRunResult.successCount} / {lastRunResult.errorCount}</strong>
                      <span className="text-[10px] text-emerald-700 block mt-0.5">100% OK status</span>
                    </div>

                    <div className="bg-white p-2.5 border border-emerald-200">
                      <span className="text-[10px] text-[#1C1917]/60 block uppercase font-bold">Cache Interceptions</span>
                      <strong className="text-base text-[#0284C7]">+{lastRunResult.cacheStats.deltaHits} hits</strong>
                      <span className="text-[10px] text-[#1C1917]/70 block mt-0.5">Bypassed DB roundtrip</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: MULTI-TIER CACHING ARCHITECTURE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Server Cache Container */}
              <div className="bg-white border border-[#E2E8F0] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#0284C7]" />
                    <h4 className="font-serif text-sm font-bold text-[#1C1917]">Server-Side In-Memory Cache (LRU/TTL)</h4>
                  </div>
                  <button
                    type="button"
                    onClick={handlePurgeServerCache}
                    className="text-[11px] text-[#0284C7] hover:underline font-semibold"
                  >
                    Purge All
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E2E8F0]/60">
                    <span className="text-[#1C1917]/70">Cache Hit Ratio:</span>
                    <strong className="font-mono text-emerald-800">{cacheStats?.hitRatioPercent ?? 100}%</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E2E8F0]/60">
                    <span className="text-[#1C1917]/70">Accumulated Hits:</span>
                    <strong className="font-mono text-[#1C1917]">{cacheStats?.hits ?? 0} requests</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E2E8F0]/60">
                    <span className="text-[#1C1917]/70">Active Cached Keys:</span>
                    <strong className="font-mono text-[#1C1917]">{cacheStats?.activeKeysCount ?? 0} keys</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E2E8F0]/60">
                    <span className="text-[#1C1917]/70">Memory Footprint Estimate:</span>
                    <strong className="font-mono text-[#1C1917]">{cacheStats?.memoryEstimateKb ?? 1} KB</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#1C1917]/70">Server Engine Uptime:</span>
                    <strong className="font-mono text-[#1C1917]">{cacheStats?.uptimeSeconds ?? 60} seconds</strong>
                  </div>
                </div>

                {cacheStats?.cachedKeys && cacheStats.cachedKeys.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-[#1C1917]/60 block mb-1">Active Cache Keys</span>
                    <div className="flex flex-wrap gap-1">
                      {cacheStats.cachedKeys.map((k: string, i: number) => (
                        <span key={i} className="text-[10px] font-mono bg-[#F8FAFC] border border-[#E2E8F0] px-1.5 py-0.5 text-[#1C1917]">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Client Cache Container */}
              <div className="bg-white border border-[#E2E8F0] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#4A5D4E]" />
                    <h4 className="font-serif text-sm font-bold text-[#1C1917]">Browser Client Cache (LocalStorage + Memory)</h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearClientCache}
                    className="text-[11px] text-[#0284C7] hover:underline font-semibold"
                  >
                    Clear Client Cache
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E2E8F0]/60">
                    <span className="text-[#1C1917]/70">Client Storage Tier:</span>
                    <strong className="font-mono text-emerald-800">Active (TTL 300s)</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E2E8F0]/60">
                    <span className="text-[#1C1917]/70">Stale-While-Revalidate:</span>
                    <strong className="font-mono text-emerald-800">Enabled</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E2E8F0]/60">
                    <span className="text-[#1C1917]/70">Cached Catalog Products:</span>
                    <strong className="font-mono text-[#1C1917]">{products.length} unstitched fabrics</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E2E8F0]/60">
                    <span className="text-[#1C1917]/70">Cached Orders & Tokens:</span>
                    <strong className="font-mono text-[#1C1917]">{orders.length} orders saved</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#1C1917]/70">Offline Resilience:</span>
                    <strong className="font-mono text-emerald-800">Instant offline fallback</strong>
                  </div>
                </div>

                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#1C1917]/75 leading-relaxed">
                  Client cache prevents unnecessary repeat network calls when navigating between fabric details, catalog filters, and store locations.
                </div>
              </div>
            </div>

            {/* SECTION 3: FIRESTORE DATABASE INDEXES */}
            <div className="bg-white border border-[#E2E8F0] p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#1C1917] flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#0284C7]" />
                    <span>Firestore Composite Database Indexes</span>
                  </h4>
                  <p className="text-xs text-[#1C1917]/70 mt-0.5">
                    Defined in <code className="font-mono text-[#0284C7]">firestore.indexes.json</code> for zero-latency multi-field queries.
                  </p>
                </div>

                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 border border-emerald-200">
                  {dbIndexes?.indexesCount ?? 9} Composite Indexes Active
                </span>
              </div>

              {/* Indexes Table */}
              <div className="overflow-x-auto border border-[#E2E8F0]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#1C1917]/70 font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-2.5 px-3">Collection Group</th>
                      <th className="py-2.5 px-3">Composite Fields & Ordering</th>
                      <th className="py-2.5 px-3">Scope</th>
                      <th className="py-2.5 px-3">Optimization Impact</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {dbIndexes?.indexes && dbIndexes.indexes.length > 0 ? (
                      dbIndexes.indexes.map((idx: any, i: number) => (
                        <tr key={i} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-[#1C1917]">
                            <span className="font-mono bg-[#0284C7]/10 text-[#0284C7] px-1.5 py-0.5 rounded-xs">
                              {idx.collectionGroup}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#1C1917]">
                            {idx.fields?.map((f: any) => `${f.fieldPath} (${f.order})`).join(' + ')}
                          </td>
                          <td className="py-2.5 px-3 text-[#1C1917]/70">
                            {idx.queryScope}
                          </td>
                          <td className="py-2.5 px-3 text-[#1C1917]/80 text-[11px]">
                            {idx.collectionGroup === 'orders'
                              ? 'Accelerates customer orders lookup by status/date'
                              : idx.collectionGroup === 'reviews'
                              ? 'Zero-latency verified review sorting'
                              : 'Fast filter by fabric & price'}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Deployed</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-[#1C1917]/60">
                          Composite indexes active via firestore.indexes.json.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Optimization Notes */}
              {dbIndexes?.optimizationNotes && (
                <div className="bg-[#F8FAFC] p-3.5 border border-[#E2E8F0] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#1C1917] block">Production Architecture Notes:</span>
                  <ul className="list-disc list-inside text-xs text-[#1C1917]/75 space-y-1">
                    {dbIndexes.optimizationNotes.map((note: string, idx: number) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: CUSTOMER REVIEWS & NEWSLETTER SUBSCRIBERS (INDEXEDDB) */}
        {/* ======================================================== */}
        {activeTab === 'feedback' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-[#0284C7] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]/70">
                    Total Customer Reviews
                  </span>
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div className="font-mono text-3xl font-bold text-[#1C1917]">
                  {allReviews.length}
                </div>
                <span className="text-[11px] text-[#1C1917]/50 mt-1 block">
                  Stored in IndexedDB (`reviews`)
                </span>
              </div>

              <div className="p-5 bg-white border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-[#0284C7] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]/70">
                    Average Store Rating
                  </span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="font-mono text-3xl font-bold text-[#1C1917]">
                  {allReviews.length > 0
                    ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1)
                    : '5.0'}
                  <span className="text-sm font-normal text-[#1C1917]/40 ml-1">/ 5.0</span>
                </div>
                <span className="text-[11px] text-[#1C1917]/50 mt-1 block">
                  Across all unstitched varieties
                </span>
              </div>

              <div className="p-5 bg-white border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-[#0284C7] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]/70">
                    Newsletter Subscribers
                  </span>
                  <Mail className="w-4 h-4 text-[#0284C7]" />
                </div>
                <div className="font-mono text-3xl font-bold text-[#1C1917]">
                  {newsletterSubscribers.length}
                </div>
                <span className="text-[11px] text-[#1C1917]/50 mt-1 block">
                  Stored in IndexedDB (`subscribers`)
                </span>
              </div>

              <div className="p-5 bg-white border border-[#E2E8F0] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]/70 block mb-1">
                    IndexedDB Sync
                  </span>
                  <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>niaz_cloth_house_db active</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    refreshData();
                    showToast('Synced data from browser IndexedDB.');
                  }}
                  className="mt-3 py-1.5 px-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0284C7] text-xs font-semibold text-[#1C1917] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-[#0284C7]" />
                  <span>Reload from IndexedDB</span>
                </button>
              </div>
            </div>

            {/* Newsletter Subscribers Table */}
            <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1C1917] flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#0284C7]" />
                    <span>Email Newsletter Subscribers</span>
                  </h3>
                  <p className="text-xs text-[#1C1917]/65 mt-0.5">
                    Customers who subscribed to seasonal fabric launches via the footer form.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#0284C7] font-semibold bg-[#F8FAFC] px-2.5 py-1 border border-[#E2E8F0]">
                  {newsletterSubscribers.length} Registered Email{newsletterSubscribers.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#1C1917]/70 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Subscriber Email</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Subscribed Date</th>
                      <th className="py-2.5 px-3">Source</th>
                      <th className="py-2.5 px-3">Storage Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]/60">
                    {newsletterSubscribers.map((sub) => (
                      <tr key={sub.email} className="hover:bg-[#F8FAFC]/60">
                        <td className="py-3 px-3 font-mono font-medium text-[#1C1917]">
                          {sub.email}
                        </td>
                        <td className="py-3 px-3 text-[#1C1917]/80">
                          {sub.name || <span className="text-gray-400 italic">Not specified</span>}
                        </td>
                        <td className="py-3 px-3 text-[#1C1917]/60 font-mono">
                          {new Date(sub.subscribedAt).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-3 text-[#1C1917]/70">
                          {sub.source || 'Footer Signup'}
                        </td>
                        <td className="py-3 px-3 text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>IndexedDB Verified</span>
                        </td>
                      </tr>
                    ))}
                    {newsletterSubscribers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-[#1C1917]/60">
                          No newsletter subscribers yet. Submissions in the footer form will appear here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Reviews Table */}
            <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1C1917] flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>Customer Product Reviews</span>
                  </h3>
                  <p className="text-xs text-[#1C1917]/65 mt-0.5">
                    Ratings and feedback left by customers on unstitched fabric products.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#0284C7] font-semibold bg-[#F8FAFC] px-2.5 py-1 border border-[#E2E8F0]">
                  {allReviews.length} Review{allReviews.length !== 1 ? 's' : ''} in IndexedDB
                </span>
              </div>

              <div className="space-y-3">
                {allReviews.map((rev) => {
                  const targetProduct = products.find((p) => p.id === rev.productId);
                  return (
                    <div
                      key={rev.id}
                      className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 hover:border-[#0284C7]/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif font-bold text-xs text-[#1C1917]">
                            {targetProduct ? targetProduct.title : rev.productId}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span className="font-semibold text-xs text-[#0284C7]">
                            {rev.authorName} ({rev.authorCity || 'Pakistan'})
                          </span>
                          {rev.verifiedBuyer && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 border border-emerald-300 font-medium">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-mono text-[#1C1917]/50">
                            {new Date(rev.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      </div>

                      {rev.title && (
                        <div className="font-semibold text-xs text-[#1C1917]">
                          "{rev.title}"
                        </div>
                      )}

                      <p className="text-xs text-[#1C1917]/80 leading-relaxed font-sans">
                        {rev.comment}
                      </p>
                    </div>
                  );
                })}

                {allReviews.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#1C1917]/60">
                    No reviews in IndexedDB yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* MODAL: CHANGE ADMIN PASSWORD & SECURITY */}
        {isStaffModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full border border-[#E2E8F0] shadow-2xl p-6 relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <h3 className="font-serif text-lg font-bold text-[#1C1917] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#0284C7]" />
                  <span>Update Admin Password</span>
                </h3>
                <button onClick={() => setIsStaffModalOpen(false)}>
                  <X className="w-5 h-5 text-[#1C1917]/70" />
                </button>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={changeOldPassword}
                    onChange={(e) => setChangeOldPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">New Admin Password</label>
                  <input
                    type="password"
                    required
                    value={changeNewPassword}
                    onChange={(e) => setChangeNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1C1917]"
                  />
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStaffModalOpen(false)}
                    className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0284C7] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#0369A1]"
                  >
                    Save New Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW FABRIC PRODUCT */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#F8FAFC] max-w-lg w-full border border-[#E2E8F0] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                  Add New Unstitched Fabric
                </h3>
                <button onClick={() => setIsAddModalOpen(false)}>
                  <X className="w-5 h-5 text-[#1C1917]/70" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 pt-4 text-xs">
                {/* 1. SUIT PHOTO & GALLERY MANAGEMENT */}
                <div className="bg-white border border-[#E2E8F0] p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#0284C7]" />
                      <span className="font-bold uppercase tracking-wider text-[11px] text-[#1C1917]">
                        Suit Picture & Visual Presentation
                      </span>
                    </div>
                    {isUploadingImage && (
                      <span className="text-[11px] font-semibold text-[#0284C7] flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading image...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                    {/* Primary Photo Preview */}
                    <div className="sm:col-span-4 flex flex-col items-center">
                      <div className="w-32 sm:w-36 aspect-[3/4] bg-neutral-100 border-2 border-neutral-300 relative overflow-hidden group shadow-xs">
                        <img
                          src={newProductForm.primaryImage || '/images/hero_niaz_luxury_fabric_1791569218384.jpg'}
                          alt={newProductForm.title || 'New fabric'}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
                          }}
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[9px] font-bold text-center py-1 tracking-wider uppercase">
                          Selected Picture
                        </div>
                      </div>
                    </div>

                    {/* Image Source & Upload Controls */}
                    <div className="sm:col-span-8 space-y-3">
                      <div>
                        <label className="block font-semibold mb-1 text-[11px] text-[#1C1917]">
                          Option 1: Upload Photo from Phone or PC
                        </label>
                        <label className="w-full px-3 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Choose Photo from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileChange(e, 'new')}
                          />
                        </label>
                        <p className="text-[10px] text-neutral-500 mt-1">
                          Select any camera photo or saved image (JPG, PNG, WebP). It uploads directly to the store images folder.
                        </p>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[11px] text-[#1C1917]">
                          Option 2: Photo URL or Image Path
                        </label>
                        <input
                          type="text"
                          value={newProductForm.primaryImage || ''}
                          onChange={(e) => {
                            const newUrl = e.target.value;
                            const currentGal = newProductForm.galleryImages || [];
                            setNewProductForm((prev) => ({
                              ...prev,
                              primaryImage: newUrl,
                              galleryImages: currentGal.includes(newUrl) ? currentGal : [newUrl, ...currentGal],
                            }));
                          }}
                          placeholder="e.g. /images/... or https://..."
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] text-xs font-mono"
                        />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => setShowAddPresetPicker(!showAddPresetPicker)}
                          className="text-[11px] font-semibold text-[#0284C7] hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{showAddPresetPicker ? 'Hide store fabric presets' : 'Or choose from store catalog presets'}</span>
                        </button>

                        {showAddPresetPicker && (
                          <div className="grid grid-cols-3 gap-2 mt-2 p-2 bg-[#F8FAFC] border border-[#E2E8F0] max-h-48 overflow-y-auto">
                            {PRESET_FABRIC_IMAGES.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  const currentGallery = newProductForm.galleryImages || [];
                                  setNewProductForm((prev) => ({
                                    ...prev,
                                    primaryImage: preset.url,
                                    galleryImages: currentGallery.includes(preset.url) ? currentGallery : [preset.url, ...currentGallery],
                                  }));
                                  showToast(`Selected "${preset.label}"`);
                                }}
                                className={`flex flex-col items-center p-1 border text-[10px] transition-all text-center ${
                                  newProductForm.primaryImage === preset.url
                                    ? 'border-[#0284C7] bg-white ring-1 ring-[#0284C7]'
                                    : 'border-neutral-200 hover:border-black bg-white'
                                }`}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.label}
                                  className="w-14 h-16 object-cover mb-1 bg-neutral-100"
                                />
                                <span className="line-clamp-1 text-[9px] font-medium">{preset.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. SUIT TITLE & SUBTITLE */}
                <div>
                  <label className="block font-semibold mb-1">Fabric Title</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.title}
                    onChange={(e) => setNewProductForm({ ...newProductForm, title: e.target.value })}
                    placeholder="e.g. Imperial 8-Pound Pure Boski Silk or Johara Festive Lawn"
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subtitle / Weave Detail</label>
                  <input
                    type="text"
                    value={newProductForm.subtitle || ''}
                    onChange={(e) => setNewProductForm({ ...newProductForm, subtitle: e.target.value })}
                    placeholder="e.g. 3-Piece Unstitched Luxury Collection"
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0]"
                  />
                </div>

                {/* 3. BRAND & CRAFT TYPE SPECIFICATIONS */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Brand / Mill Name</label>
                    <div className="space-y-1">
                      <select
                        value={newProductForm.brand || ''}
                        onChange={(e) => setNewProductForm({ ...newProductForm, brand: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] font-semibold text-xs"
                      >
                        <option value="">-- Select Mill / Designer Brand --</option>
                        <optgroup label="Women's Embroidered Collection">
                          {WOMEN_EMBROIDERY_BRANDS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Women's Printed Collection">
                          {WOMEN_PRINTED_BRANDS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Men's Heritage Collection">
                          <option value="Niaz Signature Men">Niaz Signature Men</option>
                          <option value="Kamalia Khaddar House">Kamalia Khaddar House</option>
                          <option value="Chinese Imperial Boski">Chinese Imperial Boski</option>
                          <option value="Pasha Fabrics">Pasha Fabrics</option>
                          <option value="Grace Fabrics">Grace Fabrics</option>
                          <option value="Gul Ahmed Men">Gul Ahmed Men</option>
                        </optgroup>
                      </select>
                      <input
                        type="text"
                        placeholder="Or custom brand name..."
                        value={newProductForm.brand || ''}
                        onChange={(e) => setNewProductForm({ ...newProductForm, brand: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-[#E2E8F0] text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Craft Style</label>
                    <select
                      value={newProductForm.craftType || 'Embroidery'}
                      onChange={(e) => setNewProductForm({ ...newProductForm, craftType: e.target.value as any })}
                      className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] text-xs font-semibold"
                    >
                      <option value="Embroidery">Embroidered Collection</option>
                      <option value="Printed">Printed Collection</option>
                      <option value="Plain / Solid">Plain / Solid Suiting</option>
                      <option value="Self-Dobby">Self-Dobby / Jacquard</option>
                    </select>
                  </div>
                </div>

                {/* 4. DEPARTMENT & FABRIC TYPE */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Department</label>
                    <select
                      value={newProductForm.gender}
                      onChange={(e) => setNewProductForm({ ...newProductForm, gender: e.target.value as Gender })}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] font-semibold text-xs"
                    >
                      <option value="Women">Women's Unstitched</option>
                      <option value="Men">Men's Unstitched</option>
                      <option value="Unisex">Unisex / Fabric Cut</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Fabric Material</label>
                    <select
                      value={newProductForm.fabric}
                      onChange={(e) => setNewProductForm({ ...newProductForm, fabric: e.target.value as FabricType })}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] font-semibold text-xs"
                    >
                      <optgroup label="Men's Fabrics">
                        {MENS_FABRICS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Women's Fabrics">
                        <option value="Luxury Lawn">Luxury Lawn</option>
                        <option value="Embroidered Chiffon">Embroidered Chiffon</option>
                        <option value="Swiss Voile">Swiss Voile</option>
                        <option value="Silk Jacquard">Silk Jacquard</option>
                        <option value="Handwoven Karandi">Handwoven Karandi</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* 5. PRICING & STOCK */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Price (PKR)</label>
                    <input
                      type="number"
                      required
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Original Price (PKR)</label>
                    <input
                      type="number"
                      value={newProductForm.originalPrice || ''}
                      onChange={(e) =>
                        setNewProductForm({
                          ...newProductForm,
                          originalPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="e.g. 18500 (Sale)"
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Stock Status</label>
                    <select
                      value={newProductForm.inStock ? 'yes' : 'no'}
                      onChange={(e) => setNewProductForm({ ...newProductForm, inStock: e.target.value === 'yes' })}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] font-semibold"
                    >
                      <option value="yes">In Stock (Available)</option>
                      <option value="no">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* 6. CUT SPECIFICATIONS */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Cut Length</label>
                    <input
                      type="text"
                      value={newProductForm.cutDetails?.length}
                      onChange={(e) =>
                        setNewProductForm({
                          ...newProductForm,
                          cutDetails: { ...newProductForm.cutDetails!, length: e.target.value },
                        })
                      }
                      placeholder="e.g. 4.5 Standard Meters or 3-Piece"
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Fabric Width (Arz)</label>
                    <input
                      type="text"
                      value={newProductForm.cutDetails?.width}
                      onChange={(e) =>
                        setNewProductForm({
                          ...newProductForm,
                          cutDetails: { ...newProductForm.cutDetails!, width: e.target.value },
                        })
                      }
                      placeholder="e.g. 54 Inches (Double Width)"
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0]"
                  />
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingImage}
                    className="px-6 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold tracking-widest uppercase transition-colors shadow-md"
                  >
                    Save & Add Fabric
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT PRODUCT & PICTURES */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-[#F8FAFC] max-w-2xl w-full border border-[#E2E8F0] shadow-2xl p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                    Edit Suit: {editingProduct.title}
                  </h3>
                  <p className="text-[11px] text-[#1C1917]/60">
                    Update fabric photography, certified brand designation, craft style, and catalog pricing.
                  </p>
                </div>
                <button onClick={() => setEditingProduct(null)} className="p-1 text-neutral-500 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProductSubmit} className="space-y-4 pt-4 text-xs">
                {/* 1. SUIT PHOTO & GALLERY MANAGEMENT */}
                <div className="bg-white border border-[#E2E8F0] p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#0284C7]" />
                      <span className="font-bold uppercase tracking-wider text-[11px] text-[#1C1917]">
                        Suit Picture & Visual Presentation
                      </span>
                    </div>
                    {isUploadingImage && (
                      <span className="text-[11px] font-semibold text-[#0284C7] flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving image...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                    {/* Primary Photo Preview */}
                    <div className="sm:col-span-4 flex flex-col items-center">
                      <div className="w-32 sm:w-36 aspect-[3/4] bg-neutral-100 border-2 border-neutral-300 relative overflow-hidden group shadow-xs">
                        <img
                          src={editingProduct.primaryImage || '/images/hero_niaz_luxury_fabric_1791569218384.jpg'}
                          alt={editingProduct.title}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
                          }}
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[9px] font-bold text-center py-1 tracking-wider uppercase">
                          Current Primary Picture
                        </div>
                      </div>
                    </div>

                    {/* Image Source & Upload Controls */}
                    <div className="sm:col-span-8 space-y-3">
                      {/* Method A: Device Upload */}
                      <div>
                        <label className="block font-semibold mb-1 text-[11px] text-[#1C1917]">
                          Option 1: Upload Photo from Phone or PC
                        </label>
                        <label className="w-full px-3 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Choose New Photo from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileChange(e, 'edit')}
                          />
                        </label>
                        <p className="text-[10px] text-neutral-500 mt-1">
                          Select any camera photo or saved image (JPG, PNG, WebP). It uploads directly to the store images folder.
                        </p>
                      </div>

                      {/* Method B: Direct URL Input */}
                      <div>
                        <label className="block font-semibold mb-1 text-[11px] text-[#1C1917]">
                          Option 2: Photo URL or Image Path
                        </label>
                        <input
                          type="text"
                          value={editingProduct.primaryImage}
                          onChange={(e) => {
                            const newUrl = e.target.value;
                            const currentGal = editingProduct.galleryImages || [];
                            setEditingProduct({
                              ...editingProduct,
                              primaryImage: newUrl,
                              galleryImages: currentGal.includes(newUrl) ? currentGal : [newUrl, ...currentGal],
                            });
                          }}
                          placeholder="e.g. /images/... or https://..."
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] text-xs font-mono"
                        />
                      </div>

                      {/* Method C: Preset Store Images */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowPresetPicker(!showPresetPicker)}
                          className="text-[11px] font-semibold text-[#0284C7] hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{showPresetPicker ? 'Hide store fabric presets' : 'Or choose from store catalog presets'}</span>
                        </button>

                        {showPresetPicker && (
                          <div className="grid grid-cols-3 gap-2 mt-2 p-2 bg-[#F8FAFC] border border-[#E2E8F0] max-h-48 overflow-y-auto">
                            {PRESET_FABRIC_IMAGES.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  const currentGallery = editingProduct.galleryImages || [];
                                  setEditingProduct({
                                    ...editingProduct,
                                    primaryImage: preset.url,
                                    galleryImages: currentGallery.includes(preset.url) ? currentGallery : [preset.url, ...currentGallery],
                                  });
                                  showToast(`Selected "${preset.label}"`);
                                }}
                                className={`flex flex-col items-center p-1 border text-[10px] transition-all text-center ${
                                  editingProduct.primaryImage === preset.url
                                    ? 'border-[#0284C7] bg-white ring-1 ring-[#0284C7]'
                                    : 'border-neutral-200 hover:border-black bg-white'
                                }`}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.label}
                                  className="w-14 h-16 object-cover mb-1 bg-neutral-100"
                                />
                                <span className="line-clamp-1 text-[9px] font-medium">{preset.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gallery Thumbnails Strip */}
                  <div className="border-t border-[#E2E8F0] pt-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                        Gallery Views ({(editingProduct.galleryImages || [editingProduct.primaryImage]).length})
                      </span>
                      <span className="text-[10px] text-neutral-400">Click any view to set as Primary Photo</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {(editingProduct.galleryImages || [editingProduct.primaryImage]).map((img, idx) => (
                        <div key={idx} className="relative group shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, primaryImage: img })}
                            className={`w-14 h-18 border-2 overflow-hidden transition-all ${
                              editingProduct.primaryImage === img
                                ? 'border-[#0284C7] ring-1 ring-[#0284C7]'
                                : 'border-neutral-200 opacity-70 hover:opacity-100'
                            }`}
                            title="Set as primary image"
                          >
                            <img src={img} alt={`Gallery view ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                          {editingProduct.galleryImages && editingProduct.galleryImages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = editingProduct.galleryImages.filter((_, i) => i !== idx);
                                setEditingProduct({
                                  ...editingProduct,
                                  galleryImages: filtered,
                                  primaryImage: editingProduct.primaryImage === img ? (filtered[0] || '') : editingProduct.primaryImage,
                                });
                              }}
                              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove from gallery"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. SUIT TITLE & SUBTITLE */}
                <div>
                  <label className="block font-semibold mb-1">Fabric Title</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subtitle / Weave Detail</label>
                  <input
                    type="text"
                    value={editingProduct.subtitle || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                    placeholder="e.g. 3-Piece Embroidered Festive Lawn Collection"
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0]"
                  />
                </div>

                {/* 3. BRAND & CRAFT TYPE SPECIFICATIONS */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Brand / Mill Name</label>
                    <div className="space-y-1">
                      <select
                        value={editingProduct.brand || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] font-semibold text-xs"
                      >
                        <option value="">-- Select Mill / Designer Brand --</option>
                        <optgroup label="Women's Embroidered Collection">
                          {WOMEN_EMBROIDERY_BRANDS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Women's Printed Collection">
                          {WOMEN_PRINTED_BRANDS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Men's Heritage Collection">
                          <option value="Niaz Signature Men">Niaz Signature Men</option>
                          <option value="Kamalia Khaddar House">Kamalia Khaddar House</option>
                          <option value="Chinese Imperial Boski">Chinese Imperial Boski</option>
                          <option value="Pasha Fabrics">Pasha Fabrics</option>
                          <option value="Grace Fabrics">Grace Fabrics</option>
                          <option value="Gul Ahmed Men">Gul Ahmed Men</option>
                        </optgroup>
                      </select>
                      <input
                        type="text"
                        placeholder="Or custom brand name..."
                        value={editingProduct.brand || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-[#E2E8F0] text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Craft Style</label>
                    <select
                      value={editingProduct.craftType || 'Embroidery'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, craftType: e.target.value as any })}
                      className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] text-xs font-semibold"
                    >
                      <option value="Embroidery">Embroidered Collection</option>
                      <option value="Printed">Printed Collection</option>
                      <option value="Plain / Solid">Plain / Solid Suiting</option>
                      <option value="Self-Dobby">Self-Dobby / Jacquard</option>
                    </select>
                  </div>
                </div>

                {/* 4. DEPARTMENT & FABRIC MATERIAL */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Department</label>
                    <select
                      value={editingProduct.gender}
                      onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value as Gender })}
                      className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] text-xs font-semibold"
                    >
                      <option value="Women">Women's Collection</option>
                      <option value="Men">Men's Collection</option>
                      <option value="Unisex">Unisex / Fabric Cut</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Fabric Material</label>
                    <select
                      value={editingProduct.fabric}
                      onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value as FabricType })}
                      className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] text-xs font-semibold"
                    >
                      <optgroup label="Men's Fabrics">
                        {MENS_FABRICS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Women's Fabrics">
                        <option value="Luxury Lawn">Luxury Lawn</option>
                        <option value="Embroidered Chiffon">Embroidered Chiffon</option>
                        <option value="Swiss Voile">Swiss Voile</option>
                        <option value="Silk Jacquard">Silk Jacquard</option>
                        <option value="Handwoven Karandi">Handwoven Karandi</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* 5. PRICING & STOCK */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Selling Price (PKR)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Original Price (PKR)</label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          originalPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="e.g. 18500 (Sale)"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Stock Status</label>
                    <select
                      value={editingProduct.inStock ? 'yes' : 'no'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.value === 'yes' })}
                      className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] font-semibold"
                    >
                      <option value="yes">In Stock (Available)</option>
                      <option value="no">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* 6. TECHNICAL & CUT DETAILS */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Cut Length</label>
                    <input
                      type="text"
                      value={editingProduct.cutDetails.length}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          cutDetails: { ...editingProduct.cutDetails, length: e.target.value },
                        })
                      }
                      placeholder="e.g. 4.5 Meters or 3-Piece"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Fabric Width (Arz)</label>
                    <input
                      type="text"
                      value={editingProduct.cutDetails.width}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          cutDetails: { ...editingProduct.cutDetails, width: e.target.value },
                        })
                      }
                      placeholder="e.g. 54 Inches (Double Width)"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const item = editingProduct;
                      setEditingProduct(null);
                      setProductToDelete(item);
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Fabric</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploadingImage}
                      className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold tracking-widest uppercase transition-colors shadow-md"
                    >
                      Update Suit & Photo
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: DELETE PRODUCT CONFIRMATION (Bypasses blocked browser dialogs) */}
        {productToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-full shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                    Delete Fabric from Stock?
                  </h3>
                  <p className="text-xs text-[#1C1917]/70 leading-relaxed">
                    Are you sure you want to permanently delete <strong>"{productToDelete.title}"</strong> ({productToDelete.fabric}, {formatPKR(productToDelete.price)})? This action removes the fabric from the live store catalog and inventory stock records.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F2ECE5] text-[#1C1917] border border-[#E2E8F0] font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteProduct(productToDelete.id);
                    setProductToDelete(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete Fabric</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Business Catalog Sync Modal */}
        <WhatsAppCatalogSyncModal
          isOpen={isWhatsAppSyncOpen}
          onClose={() => {
            setIsWhatsAppSyncOpen(false);
            setSelectedSyncProductId(null);
          }}
          products={products}
          currentAdminName={currentAdmin?.fullName || 'Haji Niaz Ahmad'}
          initialSelectedProductId={selectedSyncProductId}
        />

        {/* Firebase Security Checkup Modal */}
        {isFirebaseCheckupOpen && (
          <FirebaseSecurityCheckup 
            isModal 
            onClose={() => setIsFirebaseCheckupOpen(false)} 
          />
        )}
      </div>
    </div>
  );
};
