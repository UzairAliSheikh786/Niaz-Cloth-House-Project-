# Niaz Cloth House — Cybersecurity Audit & Remediation Matrix

**Audit Date**: November 10, 2026  
**Auditor**: Senior Cybersecurity & Application Security Architect  
**Classification**: High-Priority Security Remediation  

---

## 1. Vulnerability Findings & Risk Assessment

| Ref | Target Component | Vulnerability Description | Severity | Remediation Plan |
|---|---|---|---|---|
| **SEC-01** | `firestore.rules` `/orders/{orderId}` | Public read via `allow get: if true;`. Anyone knowing or guessing an order ID can view full customer PII (name, phone, WhatsApp, full delivery address, order items). | **CRITICAL** | Restrict `get` to authenticated account owner (`resource.data.userId == request.auth.uid`) or verified administrator. For guest order tracking, enforce a secure server proxy with phone/email verification. |
| **SEC-02** | `firestore.rules` `/users/{userId}` | Broad read via `allow read: if isSignedIn();`. Any authenticated customer could query and read another customer's profile document. | **HIGH** | Restrict `read` to `isOwner(userId) || isAdmin()`. |
| **SEC-03** | `server.ts` `GET /api/orders` | Unauthenticated endpoint returning complete list of all orders including customer phone numbers, addresses, and order history. | **CRITICAL** | Protect endpoint with `requireAdminAuth` middleware validating session token or admin secret header. |
| **SEC-04** | `server.ts` `POST /api/orders` | Unvalidated client pricing. Server accepted arbitrary `subtotal` and `total` from request payload without recalculating from database. | **CRITICAL** | Implement server-side authoritative price recalculation: validate product IDs, verify in-stock status, fetch authoritative unit price, add design option prices, check active promotions, compute shipping fee. |
| **SEC-05** | `server.ts` `PATCH /api/orders/:id/status` | Unauthenticated status update. Anyone could change order status to `Delivered` or `Cancelled`. | **HIGH** | Enforce admin authentication middleware and validate allowed status transitions. |
| **SEC-06** | `firestore.rules` Admin Check | Admin email checks lacked `email_verified == true`, making email spoofing theoretically possible if unverified email providers were enabled. | **MEDIUM** | Add `request.auth.token.email_verified == true` to `isAdmin()` helper. |
| **SEC-07** | `server.ts` Admin Endpoints | Endpoints `/api/admin/backups`, `/api/admin/upload-image`, `/api/load-test/run` lacked uniform rate limiting and session guard. | **MEDIUM** | Apply token-bucket rate limiter and administrative session validation. |
| **SEC-08** | Client Pricing & Promos | Frontend components displaying simulated strike-through discounts without an active administrator promotion. | **MEDIUM** | Strictly enforce pricing rules: no discount is displayed unless an active, non-expired promotion exists in store settings. |

---

## 2. Hardened Access Control Specification

### A. Firestore Rules Hardening
- **Global Default**: `match /{document=**} { allow read, write: if false; }`
- **Admins Collection / Verified Email**:
  ```javascript
  function isAdmin() {
    return isSignedIn() && (
      (request.auth.token.email in ['uzairaliuzairali640@gmail.com', 'admin@nch.com', 'admin@niazclothhouse.com'] &&
       request.auth.token.email_verified == true) ||
      exists(/databases/$(database)/documents/admins/$(request.auth.uid))
    );
  }
  ```
- **Orders Access**:
  - `allow create`: Allowed with schema validation (`id`, `customer`, `items`, `total`, `paymentMethod`).
  - `allow get`: Restricted to `isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid)`.
  - `allow list`: Restricted to `isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid)`.
  - `allow update, delete`: Restricted to `isAdmin()`.
- **Users Access**:
  - `allow read, write`: Restricted to `isOwner(userId) || isAdmin()`.

### B. Express Server Security Middleware
- **Header Hardening**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **Rate Limiting**:
  - General API: 100 requests per minute per IP.
  - Checkout / Order Submission: 10 requests per 5 minutes per IP.
  - Admin Authentication: 5 attempts per 15 minutes per IP.
- **Server Authoritative Order Calculation**:
  - Browser passes `{ items: [{ productId, quantity, selectedDesignId }], customer, paymentMethod }`.
  - Server looks up products in authoritative catalog.
  - Subtotal = Sum(product.price * quantity + (designOption.additionalPrice || 0) * quantity).
  - Shipping = Subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee.
  - Discount = Active Promotion ? (Subtotal * promotion.discountPercent / 100) : 0.
  - Total = Subtotal - Discount + Shipping.
  - Mismatch between client expectation and server calculation logs an audit warning and uses server total.

---

## 3. Residual Risks & Gateway Credentials
- Real-time card processing (e.g. PayMob, CyberSource) requires external merchant credentials.
- Until merchant API keys are provisioned in `.env`, manual payment gateways (EasyPaisa, JazzCash, Direct Bank Transfer) operate via verified manual transaction references (`transactionId`), and Cash on Delivery operates with payment status `COD (Pending Collection)`.
