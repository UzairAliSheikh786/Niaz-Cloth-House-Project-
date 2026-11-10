# Niaz Cloth House — Data Consistency & Migration Plan

**Document Version**: 1.0  
**Target Environment**: Cloud Firestore (`ai-studio-niazclothhousehe-2f3e4db8-6c1d-431a-acbf-143f22a9756b`)  
**Scope**: Product Pricing Architecture, Immutable Order Snapshots, Store Settings

---

## 1. Principles of Non-Destructive Data Preservation
1. **Never delete or overwrite existing products**: All initial product records (`nch-001` through `nch-024` and any user-created items) must retain their existing IDs, cuts, images, and descriptions.
2. **Backward-Compatible Schema Extensions**: Any new fields (such as `cuttingCharge`, `promotionId`, `serverPriceHash`) are added as optional properties with deterministic fallback defaults.
3. **Immutable Historical Orders**: Changes to current product prices must never alter past order records or reporting. Each order stores an immutable price snapshot at the moment of checkout.

---

## 2. Schema Enhancements

### A. Product Pricing Model
```typescript
export interface ProductPricing {
  sellingPrice: number;            // Current active selling price in PKR (authoritative)
  originalPrice?: number;         // Original MSRP, displayed only if an active promotion exists
  cuttingCharge?: number;         // Special cutting fee for custom lengths (default: 0)
  discountPercentage?: number;    // Computed strictly from active store promotions
  promotionId?: string;           // ID of the store promotion currently applied
}
```

### B. Immutable Order Item Snapshot
```typescript
export interface OrderItemSnapshot {
  productId: string;
  productTitle: string;
  fabric: string;
  unitPrice: number;              // Price at time of order creation
  quantity: number;
  selectedColor?: string;
  selectedDesign?: string;
  designAdditionalPrice: number;  // Surcharge at time of order creation
  itemSubtotal: number;           // (unitPrice + designAdditionalPrice) * quantity
}
```

### C. Store Settings Document (`/storeSettings/config`)
Stores the administrator-controlled pricing and operational parameters:
```typescript
export interface StoreSettingsDocument {
  storeName: string;              // "Niaz Cloth House"
  tagline: string;                // "Dress to Impress"
  foundedYear: number;            // 1970
  phone: string;                  // "0334-6565636"
  whatsapp: string;               // "0334-6565636"
  address: string;                // "Paris Bazaar, Rawalpindi, Pakistan"
  businessHours: string;          // "Monday - Sunday, 10:00 AM - 9:00 PM PKT"
  shippingFee: number;            // 250 PKR
  freeShippingThreshold: number;  // 5000 PKR
  promotions: Array<{
    id: string;
    title: string;
    discountPercent: number;
    startDate: string;
    endDate: string;
    active: boolean;
  }>;
}
```

---

## 3. Migration & Rollback Procedures

### Step 1: Pre-Migration Backup Snapshot
Before applying schema updates:
- An automated backup snapshot of all active collections is exported via the `/api/admin/backups/create` endpoint.
- File saved with timestamp: `nch-backup-[timestamp].json`.

### Step 2: In-Memory / Client Sync Compatibility
- Frontend `ShopContext` gracefully checks for both flat `price` and nested `pricing.sellingPrice`.
- If `pricing` object is absent, `price` is used seamlessly.

### Step 3: Rollback Plan
- If any migration step fails, the system reverts to legacy field reads (`product.price`, `order.total`).
- No destructive dropping of fields or documents.
