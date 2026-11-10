# Niaz Cloth House — Comprehensive Technical Project Audit
**Audit Date**: November 10, 2026  
**Auditor**: Elite Architecture & Security Engineering Taskforce  
**Repository Branch**: `main`  
**Brand Identity**: NIAZ CLOTH HOUSE (Est. 1970, Paris Bazaar, Rawalpindi, Pakistan) · *Dress to Impress*

---

## 1. Executive Summary & Architecture Baseline

Niaz Cloth House is a full-stack unstitched luxury fabric e-commerce platform built to serve domestic and international patrons seeking authentic Pakistani textiles (pure Chinese Boski silk, premium wash & wear, combed latha cotton, Kamalia khaddar, textured lelan, embroidered chiffon, and luxury printed lawn).

### Current Tech Stack
- **Frontend Core**: React 19 (`react` 19.0.1, `react-dom` 19.0.1), TypeScript 7.0, Vite 8 (`vite` 8.3.0), Tailwind CSS 4 (`@tailwindcss/vite` 4.3.3).
- **Animation & Motion**: Motion 12 (`motion` 12.23.24) — note: no redundant Framer Motion.
- **3D & WebGL Graphics**: Three.js (`three` 0.186.1), React Three Fiber (`@react-three/fiber` 9.8.2), Drei (`@react-three/drei` 10.7.9).
- **Backend Core**: Express 4 (`express` 4.21.2) hosted in TypeScript via `tsx` (running on port 3000 with Vite dev middleware mounted).
- **AI Integration**: Google GenAI SDK (`@google/genai` 2.4.0) utilized server-side for Maps/Search grounding and fabric assistant.
- **Database & Auth**: Firebase SDK 13 (`firebase` 13.0.0) connected to Cloud Firestore (Database ID: `ai-studio-niazclothhousehe-2f3e4db8-6c1d-431a-acbf-143f22a9756b`, Project ID: `master-starlight-tv4kj`).
- **Icons & Tooling**: Lucide React (`lucide-react` 0.546.0), `@vis.gl/react-google-maps` (1.10.2).

---

## 2. Directory Structure & File Map

```
/
├── package.json                   # Project scripts and dependencies
├── server.ts                      # Express server with Vite middleware & REST endpoints
├── tsconfig.json                  # Path mapping @/* to ./src/*
├── vite.config.ts                 # Vite bundler, React, Tailwind v4, @ alias
├── firestore.rules                # Firestore security rules
├── firestore.indexes.json         # Composite index definitions
├── firebase-blueprint.json        # Data entity schemas and paths
├── firebase-applet-config.json    # Provisioned Firebase client config
├── index.html                     # HTML5 entry with metadata
├── public/
│   ├── images/                    # Local catalog and architectural imagery
│   ├── sitemap.xml                # XML Sitemap for search crawlers
│   └── robots.txt                 # Search engine crawler policies
└── src/
    ├── App.tsx                    # Main app container, layout & modals
    ├── main.tsx                   # React root mount
    ├── types.ts                   # Core domain types, products, orders, settings
    ├── firebase.ts                # Firebase client init
    ├── firebaseSync.ts            # Firestore listeners and syncing utilities
    ├── index.css                  # Tailwind CSS import and global styles
    ├── context/
    │   ├── AuthContext.tsx        # Firebase auth, patron state, roles
    │   ├── ShopContext.tsx        # Cart, wishlist, products, search, order sync
    │   ├── ReviewContext.tsx      # Customer reviews and testimonials
    │   └── NavigationContext.tsx  # Multi-page SPA navigation
    ├── components/
    │   ├── Header.tsx             # Limelight-style top mega-navigation
    │   ├── Footer.tsx             # Heritage footer with store details
    │   ├── ProductCard.tsx        # Responsive product card with quick-actions
    │   ├── CartDrawer.tsx         # Slide-out cart with subtotal & charges
    │   ├── CheckoutModal.tsx      # Checkout dialog with payment gateways
    │   ├── BrandEntranceReveal.tsx# 3D interactive entrance reveal
    │   ├── SEOHead.tsx            # Technical SEO & Schema.org tags
    │   ├── QuickViewModal.tsx     # Product quick preview modal
    │   ├── SearchModal.tsx        # Full catalog real-time search
    │   ├── CookieConsent.tsx      # Privacy consent manager
    │   ├── FloatingWhatsAppButton.tsx # WhatsApp instant consultation
    │   ├── PatronAuthModal.tsx    # Customer sign-in/up dialog
    │   └── 3d/
    │       ├── Interactive3DStorefronts.tsx   # Men's and Women's collection showcases
    │       ├── SilkWeaveHeroCanvas.tsx        # Interactive fabric flow canvas
    │       ├── Fabric3DInspectorModal.tsx     # Full 3D fabric rotation/zoom inspector
    │       ├── FabricSwatch3DViewer.tsx       # R3F swatch viewer
    │       ├── AtelierAmbient3DBackground.tsx # Ambient lighting & ribbon background
    │       ├── Card3DWrapper.tsx              # Reusable perspective wrapper
    │       └── threeUtils.ts                  # WebGL fallback, resource cleanup, procedural textures
    ├── core/
    │   ├── security/
    │   │   ├── UserHierarchy.ts           # OOP AbstractUser, SuperAdmin, Patron
    │   │   └── AdminInactivityManager.ts  # Session timeout guard
    │   ├── payments/
    │   │   └── PaymentGateways.ts         # OOP AbstractPaymentGateway, COD, EasyPaisa, JazzCash
    │   └── storage/                       # Local caching abstraction
    ├── data/
    │   └── products.ts            # Authentic unstitched product catalog (1800+ lines)
    └── pages/
        ├── HomePage.tsx           # Homepage with hero, showcases, new arrivals, story
        ├── ShopPage.tsx           # Filterable catalog (Men, Women, Fabric, Brand, Price)
        ├── ProductDetailPage.tsx  # Product gallery, specifications, cutting options
        ├── AdminPage.tsx          # Administrator control center
        ├── LocationPage.tsx       # Paris Bazaar store location & hours
        ├── ComparePage.tsx        # Fabric side-by-side comparison
        ├── LegalPage.tsx          # Privacy, Terms, Shipping & Returns
        └── NotFoundPage.tsx       # 404 handler
```

---

## 3. Findings, Incomplete Features & Identified Defects

### Defect 1: Cyberpunk Styling vs. Luxury Heritage Brand Identity
- **Finding**: Several components used `#050811` dark sci-fi backgrounds, `#00F0FF` electric cyan borders, and `"2050 CYBER ATELIER"` badges.
- **Requirement**: Align strictly with the verified brand palette:
  - Ivory (`#F7F4EE` - 60%)
  - Charcoal (`#1F1F1F` - 30%)
  - Heritage Gold (`#D4AF37` - 10%)
  - Soft Beige (`#E8E0D2`)
  - White (`#FFFFFF`)
  - Elegant typography, generous whitespace, minimal editorial layout.

### Defect 2: Two Interactive Collection Showcases
- **Finding**: `Interactive3DStorefronts.tsx` contained cyber neon effects rather than genuine luxury fashion environments for Women (ivory/champagne, embroidery, warm gold) and Men (charcoal/ivory, tailoring details, Boski/wash & wear).
- **Requirement**: Elevate showcases with genuine interactive 3D perspectives, clear collection entry points, real product previews from the database, and accessible touch/keyboard controls.

### Defect 3: Server-Authoritative Order & Pricing Validation
- **Finding**: `POST /api/orders` blindly trusted `req.body.total` and `req.body.subtotal` without recalculating items, cutting charges, variant addons, or current promotional discounts from the authoritative database.
- **Requirement**: Implement server-side price recalculation: fetch authoritative product prices, compute design addon charges, apply active non-expired store promotions, calculate shipping fees, and reject spoofed totals.

### Defect 4: Express API Security & Authorization
- **Finding**: `GET /api/orders` and `PATCH /api/orders/:id/status` lacked server-side token verification, exposing customer PII to any unauthenticated caller.
- **Requirement**: Require Bearer token authentication on administrative endpoints, rate-limit order creation, validate request schemas, and sanitize error responses.

### Defect 5: Firestore Rules Least-Privilege Hardening
- **Finding**: `/orders/{orderId}` allowed `get: if true`, leaking order tracking info. `users/{userId}` allowed `read: if isSignedIn()`, enabling any signed-in user to scrape other users' profiles.
- **Requirement**: Restrict order access to the order owner or verified administrators; restrict user document reads to the specific account owner or admin.

### Defect 6: Pricing & Discount Rules
- **Finding**: Some components computed discounts arbitrarily without an active administrator promotion.
- **Requirement**: If no promotion is active, show only the normal selling price. Never display invented discounts or arbitrary strike-through prices.

---

## 4. Preservation & Baseline Verification
- **Build Status**: Verified via `compile_applet` (`vite build`) and `lint_applet` (`tsc --noEmit`) — 0 errors.
- **Dev Server**: Running on `http://0.0.0.0:3000` with Vite dev middleware serving root `/` with HTTP 200 OK.
- **Database**: Cloud Firestore is online (`ai-studio-niazclothhousehe-2f3e4db8-6c1d-431a-acbf-143f22a9756b`).
- **Product Catalog**: 100% of authentic unstitched products in `src/data/products.ts` preserved without modification or deletion.
