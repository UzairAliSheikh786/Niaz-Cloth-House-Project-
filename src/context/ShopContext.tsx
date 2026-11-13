import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  CartItem, 
  Order, 
  CustomerDetails, 
  OrderStatus, 
  PaymentMethod, 
  OrderPaymentDetails,
  StoreSettings,
  DEFAULT_STORE_SETTINGS
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/products';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  cartStore, 
  preferenceStore, 
  recentlyViewedStore, 
  UserPreferences, 
  DEFAULT_USER_PREFERENCES 
} from '../core/storage/IndexedDBStore';
import { PricingEngine } from '../core/domain/PricingEngine';
import { ProductFactory } from '../core/domain/ProductHierarchy';

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  compareProductIds: [string, string];
  setCompareProductA: (id: string) => void;
  setCompareProductB: (id: string) => void;
  swapCompareProducts: () => void;
  addToCompare: (id: string) => void;
  addToCart: (
    product: Product, 
    quantity?: number, 
    options?: { selectedColor?: string; selectedColorHex?: string; selectedDesign?: string }
  ) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotal: number;
  cartCount: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  createOrder: (
    customer: CustomerDetails, 
    paymentMethod: PaymentMethod, 
    paymentDetails?: OrderPaymentDetails
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderDetails: (orderId: string, details: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  createManualOrder: (order: Order) => Promise<void>;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  resetDefaultCatalog: () => void;
  formatPKR: (amount: number) => string;
  generateWhatsAppOrderUrl: (customer?: CustomerDetails) => string;
  // IndexedDB Preferences & Personalization
  userPreferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  recentlyViewed: Product[];
  recordProductView: (product: Product) => void;
  // Store Settings & Promotions
  storeSettings: StoreSettings;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const formatPKR = (amount: number): string => {
  return `₨ ${amount.toLocaleString('en-PK')}`;
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('nch_products_v3');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p) => p.id));
          const missingFlagships = INITIAL_PRODUCTS.filter(
            (p) => p.id.startsWith('nch-shahi-') && !existingIds.has(p.id)
          );
          return missingFlagships.length > 0 ? [...missingFlagships, ...parsed] : parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS;
  });

  // Cart state with IndexedDB client-side persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('niaz_cart_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Store Settings state with localStorage & Firestore persistence
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('nch_store_settings_v1');
      if (saved) return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_STORE_SETTINGS;
  });

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('nch_store_settings_v1', JSON.stringify(updated));
      } catch {}
      try {
        setDoc(doc(db, 'store_settings', 'main'), updated, { merge: true }).catch(() => {});
      } catch {}
      return updated;
    });
    showToast('Store settings updated');
  };

  // User Preferences & Recently Viewed (IndexedDB)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Hydrate Cart, User Preferences, and Recently Viewed from IndexedDB on initial mount
  useEffect(() => {
    async function hydrateFromIndexedDB() {
      try {
        // 1. Hydrate Cart from IndexedDB if available
        const idbCartItems = await cartStore.loadCartItems();
        if (idbCartItems && idbCartItems.length > 0) {
          setCart(idbCartItems);
        }

        // 2. Hydrate Preferences
        const prefs = await preferenceStore.getPreferences();
        setUserPreferences(prefs);

        // 3. Hydrate Recently Viewed
        const viewed = await recentlyViewedStore.getRecentlyViewed();
        setRecentlyViewed(viewed);
      } catch (err) {
        console.warn('IndexedDB initial hydration note:', err);
      }
    }
    hydrateFromIndexedDB();
  }, []);

  const updatePreferences = async (partial: Partial<UserPreferences>) => {
    try {
      const updated = await preferenceStore.savePreferences(partial);
      setUserPreferences(updated);
      showToast('Personalization preferences updated');
    } catch {
      setUserPreferences((prev) => ({ ...prev, ...partial }));
    }
  };

  const recordProductView = async (product: Product) => {
    try {
      await recentlyViewedStore.recordView(product);
      setRecentlyViewed((prev) => {
        const filtered = prev.filter((p) => p.id !== product.id);
        return [product, ...filtered].slice(0, 10);
      });
    } catch {
      // ignore
    }
  };

  // Orders state (Filtered of any legacy dummy data)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('niaz_orders_v2');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        const cleaned = parsed.filter(
          (o) =>
            o.id !== 'NCH-1977-1042' &&
            o.id !== 'NCH-1977-1041' &&
            o.id !== 'NCH-1977-1040' &&
            o.customer?.fullName !== 'Tariq Mehmood' &&
            o.customer?.fullName !== 'Amina Farooq' &&
            o.customer?.fullName !== 'Usman Ghani'
        );
        localStorage.setItem('niaz_orders_v2', JSON.stringify(cleaned));
        return cleaned;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Real-time Firestore Orders Synchronization
  useEffect(() => {
    try {
      const ordersCol = collection(db, 'orders');
      const unsubscribe = onSnapshot(ordersCol, (snapshot) => {
        if (!snapshot.empty) {
          const remoteOrders = snapshot.docs.map((docSnap) => docSnap.data() as Order);
          const cleaned = remoteOrders.filter(
            (o) =>
              o.id !== 'NCH-1977-1042' &&
              o.id !== 'NCH-1977-1041' &&
              o.id !== 'NCH-1977-1040' &&
              o.customer?.fullName !== 'Tariq Mehmood' &&
              o.customer?.fullName !== 'Amina Farooq' &&
              o.customer?.fullName !== 'Usman Ghani'
          );
          cleaned.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
          setOrders(cleaned);
          try {
            localStorage.setItem('niaz_orders_v2', JSON.stringify(cleaned));
          } catch {
            // ignore
          }
        }
      }, (err) => {
        console.warn('Real-time orders sync info:', err);
      });
      return () => unsubscribe();
    } catch {
      // fallback
    }
  }, []);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Limelight Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nch_wishlist_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('nch_wishlist_v1', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Suit removed from Wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Suit saved to Wishlist');
        return [...prev, productId];
      }
    });
  };

  // Compare Fabrics state (Two unstitched fabric IDs)
  const [compareProductIds, setCompareProductIds] = useState<[string, string]>(() => {
    try {
      const saved = localStorage.getItem('niaz_compare_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 2 && parsed[0] && parsed[1]) {
          return [parsed[0], parsed[1]];
        }
      }
    } catch {
      // fallback
    }
    return ['nch-001', 'nch-002'];
  });

  useEffect(() => {
    try {
      localStorage.setItem('niaz_compare_v1', JSON.stringify(compareProductIds));
    } catch (e) {
      console.error('Failed to save compare state:', e);
    }
  }, [compareProductIds]);

  const setCompareProductA = (id: string) => {
    setCompareProductIds((prev) => [id, prev[1]]);
  };

  const setCompareProductB = (id: string) => {
    setCompareProductIds((prev) => [prev[0], id]);
  };

  const swapCompareProducts = () => {
    setCompareProductIds((prev) => [prev[1], prev[0]]);
  };

  const addToCompare = (id: string) => {
    setCompareProductIds((prev) => {
      if (prev[0] === id) return prev;
      return [prev[0], id];
    });
    showToast('Fabric loaded into comparison');
  };

  // Sync products to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nch_products_v3', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  }, [products]);

  // Sync cart to localStorage and IndexedDB (Preserves items, quantities, and prices across browser sessions)
  useEffect(() => {
    try {
      localStorage.setItem('niaz_cart_v2', JSON.stringify(cart));
      cartStore.syncCart(cart).catch((err) => {
        console.warn('IndexedDB cart sync error:', err);
      });
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  // Sync orders to localStorage & listen to Firestore collection
  useEffect(() => {
    try {
      localStorage.setItem('niaz_orders_v2', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders:', e);
    }
  }, [orders]);

  // Real-time Firestore sync for orders
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const ordersCol = collection(db, 'orders');
      unsubscribe = onSnapshot(
        ordersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteOrders: Order[] = [];
            snapshot.forEach((docSnap) => {
              remoteOrders.push(docSnap.data() as Order);
            });
            // Merge remote with initial default orders ensuring no duplicates
            setOrders((prev) => {
              const map = new Map<string, Order>();
              prev.forEach((o) => map.set(o.id, o));
              remoteOrders.forEach((o) => map.set(o.id, o));
              return Array.from(map.values()).sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );
            });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'orders');
        }
      );
    } catch (err) {
      console.warn('Firestore orders subscription unavailable, using local persistence.');
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    options?: { selectedColor?: string; selectedColorHex?: string; selectedDesign?: string }
  ) => {
    const chosenColor = options?.selectedColor || product.color;
    const chosenColorHex = options?.selectedColorHex || product.colorHex;
    const chosenDesign = options?.selectedDesign || (product.designOptions?.[0]?.name || 'Standard Cut');

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === chosenColor &&
          item.selectedDesign === chosenDesign
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [
        ...prev,
        {
          product,
          quantity,
          selectedColor: chosenColor,
          selectedColorHex: chosenColorHex,
          selectedDesign: chosenDesign,
        },
      ];
    });
    showToast(`Added ${quantity} × ${product.title} (${chosenColor}) to bag`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Removed item from shopping bag');
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemUnitPrice = (item: CartItem): number => {
    let designAddon = 0;
    if (item.selectedDesign && item.product.designOptions) {
      const designOpt = item.product.designOptions.find(
        (d) => d.name === item.selectedDesign || d.id === item.selectedDesign
      );
      if (designOpt && designOpt.additionalPrice) {
        designAddon = designOpt.additionalPrice;
      }
    }
    return item.product.price + designAddon;
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + getItemUnitPrice(item) * item.quantity,
    0
  );
  
  // Encapsulated OOP Domain Pricing Computation
  const pricingEngine = new PricingEngine(
    storeSettings.freeShippingThreshold ?? 5000,
    storeSettings.shippingFee ?? 250
  );
  const cartPricing = pricingEngine.computeOrder(cartSubtotal);
  const cartTotal = cart.length === 0 ? 0 : cartPricing.finalTotal;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const createOrder = async (
    customer: CustomerDetails,
    paymentMethod: PaymentMethod,
    paymentDetails?: OrderPaymentDetails
  ): Promise<Order> => {
    let finalOrder: Order = {
      id: `NCH-1970-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString(),
      customer,
      items: [...cart],
      subtotal: cartSubtotal,
      shipping: cartPricing.shippingFee,
      total: cartTotal,
      status: 'Pending',
      paymentMethod,
      paymentDetails,
    };

    // Attempt server-authoritative verification & registration
    try {
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            selectedColor: i.selectedColor,
            selectedDesign: i.selectedDesign,
          })),
          paymentMethod,
          paymentDetails,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.order) {
          finalOrder = {
            ...finalOrder,
            id: data.order.id,
            subtotal: data.order.subtotal,
            shipping: data.order.shipping ?? (data.order.total - data.order.subtotal),
            total: data.order.total,
          };
        }
      }
    } catch (err) {
      console.warn('Backend server order placement offline or unreachable, registering via client & Firestore:', err);
    }

    // Save to local state
    setOrders((prev) => [finalOrder, ...prev]);

    // Save to Firestore
    try {
      const orderRef = doc(db, 'orders', finalOrder.id);
      await setDoc(orderRef, {
        ...finalOrder,
        userId: auth.currentUser?.uid || null,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${finalOrder.id}`);
    }

    clearCart();
    setIsCartOpen(false);
    showToast(`Order #${finalOrder.id} registered successfully via ${paymentMethod}!`);
    return finalOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }

    showToast(`Order ${orderId} updated to ${status}`);
  };

  const updateOrderDetails = async (orderId: string, details: Partial<Order>) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, ...details } : o));
      try {
        localStorage.setItem('niaz_orders_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, details, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
    showToast(`Order #${orderId} details updated`);
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      try {
        localStorage.setItem('niaz_orders_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    }
    showToast(`Order #${orderId} removed`);
  };

  const createManualOrder = async (order: Order) => {
    setOrders((prev) => {
      const updated = [order, ...prev];
      try {
        localStorage.setItem('niaz_orders_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'orders', order.id), {
        ...order,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${order.id}`);
    }
    showToast(`Order #${order.id} registered successfully`);
  };

  const addProduct = (product: Product) => {
    setProducts((prev) => {
      const updated = [product, ...prev];
      try {
        localStorage.setItem('nch_products_v3', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to sync added product to localStorage:', e);
      }
      return updated;
    });

    try {
      setDoc(doc(db, 'products', product.id), product).catch((err) => {
        console.warn('Firestore add product sync warning:', err);
      });
    } catch {
      // local fallback
    }

    showToast(`Added product "${product.title}" to catalog`);
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === product.id ? product : p));
      try {
        localStorage.setItem('nch_products_v3', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to sync updated product to localStorage:', e);
      }
      return updated;
    });

    try {
      setDoc(doc(db, 'products', product.id), product).catch((err) => {
        console.warn('Firestore update product sync warning:', err);
      });
    } catch {
      // local fallback
    }

    showToast(`Updated product "${product.title}"`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('nch_products_v3', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to sync deleted product to localStorage:', e);
      }
      return updated;
    });

    try {
      deleteDoc(doc(db, 'products', id)).catch(() => {
        // silent fallback if item was local only
      });
    } catch {
      // ignore
    }

    showToast('Fabric removed from inventory catalog');
  };

  const resetDefaultCatalog = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    showToast('Catalog & orders restored to heritage defaults');
  };

  const generateWhatsAppOrderUrl = (customer?: CustomerDetails): string => {
    const phoneNumber = '923346565636'; // Official Niaz Cloth House WhatsApp (0334-6565636)
    const lines = [
      '✨ *NIAZ CLOTH HOUSE (Since 1970 - Dress To Impress)* ✨',
      '📍 *Paris Bazaar, Committee Chowk, Rawalpindi*',
      '📞 *Call / WhatsApp: 0334-6565636*',
      'Hello Niaz Cloth House, I would like to place an order from your unstitched catalog:',
      '',
      '📦 *ORDER SUMMARY:*',
      ...cart.map(
        (item, idx) =>
          `${idx + 1}. ${item.product.title}\n   • Fabric: ${item.product.fabric}\n   • Qty: ${item.quantity}\n   • Price: ${formatPKR(item.product.price * item.quantity)}`
      ),
      '',
      `💰 *Total Amount:* ${formatPKR(cartSubtotal)}`,
      '🚚 *Payment Method:* Cash on Delivery / Direct Bank Transfer',
    ];

    if (customer && customer.fullName) {
      lines.push(
        '',
        '👤 *CUSTOMER DETAILS:*',
        `• Name: ${customer.fullName}`,
        `• Phone: ${customer.phone}`,
        `• City: ${customer.city}`,
        `• Address: ${customer.address}`,
        customer.notes ? `• Special Instructions: ${customer.notes}` : ''
      );
    }

    lines.push(
      '',
      'Please confirm fabric availability and delivery time. JazakAllah Khair.'
    );

    const message = encodeURIComponent(lines.filter(Boolean).join('\n'));
    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        orders,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        toast,
        showToast,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        createOrder,
        updateOrderStatus,
        updateOrderDetails,
        deleteOrder,
        createManualOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        resetDefaultCatalog,
        formatPKR,
        generateWhatsAppOrderUrl,
        compareProductIds,
        setCompareProductA,
        setCompareProductB,
        swapCompareProducts,
        addToCompare,
        userPreferences,
        updatePreferences,
        recentlyViewed,
        recordProductView,
        storeSettings,
        updateStoreSettings,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1C1917] text-[#F8FAFC] px-5 py-3 rounded-none shadow-xl border-l-2 border-[#0284C7] transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <span className="text-xs uppercase tracking-widest text-[#38BDF8] font-medium font-sans">
            Niaz Notice
          </span>
          <span className="text-xs text-white/90 font-sans">{toast}</span>
        </div>
      )}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
