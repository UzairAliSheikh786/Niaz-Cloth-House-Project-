# Niaz Cloth House — Transformation Implementation Plan

**Objective**: Elevate Niaz Cloth House into a world-class luxury 3D e-commerce platform with authentic Pakistani textile heritage, rock-solid security, server-authoritative commerce, and flawless user experience.

---

## Phase Breakdown

### Phase 1: Security & API Hardening (CYBERSECURITY MANDATE)
1. **Express Server API Protection**:
   - Secure `GET /api/orders` with admin token verification (`Authorization: Bearer <token>`).
   - Secure `PATCH /api/orders/:id/status` with admin token verification and input validation.
   - Refactor `POST /api/orders` to be server-authoritative:
     - Match product IDs against genuine database products.
     - Validate available inventory.
     - Recalculate item unit prices, variant design option surcharges, and cutting charges.
     - Apply only active, non-expired administrator promotions.
     - Calculate official shipping charges based on store settings (e.g., free shipping threshold).
     - Store immutable snapshot of order items, pricing breakdown, and payment status.
   - Protect `/api/admin/backups`, `/api/admin/upload-image`, `/api/load-test/*` with admin authorization middleware.
   - Add rate-limiting (`express-rate-limit` patterns or in-memory token bucket) for order creation and login attempts.
2. **Cloud Firestore Rules Hardening**:
   - Update `firestore.rules`:
     - Disallow public `get` on `/orders/{orderId}`; require owner UID match or verified admin.
     - Disallow public list of `/users/{userId}`; require owner UID match or verified admin.
     - Add schema validation helper `isValidOrder()` and `isValidProduct()`.
     - Secure `/storeSettings/config` with admin write and public read.
     - Deploy updated rules via `DeployRules` RPC action.
   - Update `firebase-blueprint.json` to include StoreSettings and audit collections.

### Phase 2: Brand Identity & Luxury Design System
1. **Palette Transformation**:
   - Primary: Ivory (`#F7F4EE`) — 60%
   - Secondary / Typography: Charcoal (`#1F1F1F`) — 30%
   - Accent: Heritage Gold (`#D4AF37`) — 10%
   - Supporting: Soft Beige (`#E8E0D2`) & Crisp White (`#FFFFFF`)
   - Remove cyberpunk neon elements (`#00F0FF`, cyber badges, sci-fi overlays).
2. **Typography & Layout**:
   - Editorial serif/sans combination, generous whitespace, clean luxury borders, subtle gold foil accents.
   - Update `index.css` and global styling to reflect the refined heritage palette.
   - Verify brand details: **NIAZ CLOTH HOUSE**, **DRESS TO IMPRESS**, **ESTABLISHED 1970**, Paris Bazaar, Rawalpindi.

### Phase 3: The Two Main Fashion Showcases
1. **Interactive Showcases Component (`Interactive3DStorefronts.tsx`)**:
   - **Showcase A: Women's Luxury Collection**:
     - Warm ivory/champagne backdrop with soft golden lighting.
     - Highlights: Embroidered organza, lawn, chiffon, Johara, Bin Rashid, Safa Marwa, Tawakkal.
     - Interactive 3D card tilt & lighting sheen with real product data.
     - One-click navigation to Women's curated shop.
   - **Showcase B: Men's Sartorial Collection**:
     - Refined charcoal & ivory architecture with dark wood accents.
     - Highlights: Authentic Chinese Boski silk (4.5m cuts), executive wash & wear, combed cotton, Kamalia khaddar.
     - Interactive 3D card tilt & lighting sheen with real product data.
     - One-click navigation to Men's curated shop.
   - Both showcases support keyboard, mouse hover, and touch gestures, with WebGL/CSS 3D fallback.

### Phase 4: Brand Entrance & 3D Ambient Infrastructure
1. **Brand Entrance Reveal (`BrandEntranceReveal.tsx`)**:
   - Clean luxury entrance with monogram, "NIAZ CLOTH HOUSE", "DRESS TO IMPRESS", "ESTABLISHED 1970".
   - Non-intrusive, fast-loading, respects `prefers-reduced-motion`, easily skippable, and remembers user dismissal in `sessionStorage`.
2. **Ambient 3D Lighting & Silk Weave (`AtelierAmbient3DBackground.tsx` & `SilkWeaveHeroCanvas.tsx`)**:
   - Update shaders and materials to ivory, golden silk sheen, and warm natural studio lighting.
   - Preserve performance: low draw calls, proper GPU resource disposal, software GL fallback.

### Phase 5: Homepage Redesign & Editorial Experience
- Section 1: Brand Entrance & Hero Banner.
- Section 2: Two Interactive Collection Showcases (Women's & Men's).
- Section 3: New Arrivals (genuine products marked `newArrival: true`).
- Section 4: Curated Fabric Atelier (Embroidered, Printed Lawn, Pure Boski, Wash & Wear, Khaddar).
- Section 5: Best Sellers (authentic orders/featured selections).
- Section 6: Heritage Story (1970 origin in Paris Bazaar, Rawalpindi).
- Section 7: Fabric Discovery Guide (cut lengths, GSM weights, care guides).
- Section 8: Customer Trust (reviews, physical store guarantee, delivery policies).
- Section 9: WhatsApp Direct Concierge (`0334-6565636`).
- Section 10: Luxury Semantic Footer.

### Phase 6: Product Detail & 3D Fabric Inspection
- Update `ProductDetailPage.tsx` and `Fabric3DInspectorModal.tsx`:
  - Authentic product gallery with zoom and full-screen view.
  - Transparent pricing with exact variant design addons (e.g. Micro-Dobby, Gold Seal Selvedge).
  - Fabric specifications: length, double width (54"), thread count, GSM, weave type, care notes.
  - 3D Fabric Inspector: rotation, zoom, studio/daylight lighting presets, procedural weave bump maps, WebGL memory cleanup.

### Phase 7: Shopping Cart & Server-Authoritative Checkout
- Update `CartDrawer.tsx` and `CheckoutModal.tsx`:
  - Accurate line-item subtotals, variant surcharges, and cutting options.
  - Transparent pricing breakdown: subtotal, cutting fee, shipping fee (honoring free shipping threshold), discount (only if active).
  - Genuine payment methods: Cash on Delivery (marked as pending collection/unpaid), EasyPaisa / JazzCash / Bank Transfer instructions.
  - Submit orders to server API for authoritative validation and transactional persistence.

### Phase 8: Modular Administrator Control Centre
- Refactor `AdminPage.tsx`:
  - Overview: Genuine orders count, paid revenue, pending orders, inventory value, low-stock sentinel.
  - Products: Add, edit, archive, variant options, stock adjustments.
  - Pricing & Promotions: Full control over selling price, cutting charges, promotion dates, active toggles. No invented discounts.
  - Orders: Status management (Pending -> Processing -> Shipped -> Delivered), customer details, payment verification.
  - Customers: Patron profiles and order history.
  - Store Settings: Business hours, contact numbers, shipping fee & free-shipping threshold.

### Phase 9: Verification & Testing
- Co-execute `compile_applet` and `lint_applet`.
- Verify dev server on port 3000 with HTTP 200.
- Test end-to-end checkout, product navigation, 3D viewers, and admin operations.
