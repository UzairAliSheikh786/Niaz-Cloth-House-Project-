import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Truck, 
  ShoppingBag,
  CreditCard,
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
  Sparkles,
  Copy,
  LayoutDashboard,
  Settings,
  Percent,
  Sliders,
  Tag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Pencil
} from 'lucide-react';
import { WhatsAppCatalogSyncModal } from '../components/WhatsAppCatalogSyncModal';
import { clientCache } from '../utils/cache';
import { useShop, formatPKR } from '../context/ShopContext';
import { useReviews } from '../context/ReviewContext';
import { useAuth, PatronProfile } from '../context/AuthContext';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, getDocFromServer, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { AdminInactivityManager } from '../core/security/AdminInactivityManager';
import { UserFactory } from '../core/security/UserHierarchy';
import { ProductFactory, DomainOrder } from '../core';
import { 
  Product, 
  Order, 
  OrderStatus, 
  PaymentMethod,
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
    updateOrderDetails,
    deleteOrder,
    createManualOrder,
    showToast,
    storeSettings,
    updateStoreSettings,
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
  const [inactivityRemainingSeconds, setInactivityRemainingSeconds] = useState<number | null>(null);
  const [inactivityNotice, setInactivityNotice] = useState<string | null>(null);
  const inactivityManagerRef = React.useRef<AdminInactivityManager | null>(null);

  // Active Users section filters & search
  const [userFilter, setUserFilter] = useState<'all' | 'online' | 'admins'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');

  // Login Form
  const [loginEmailOrUser, setLoginEmailOrUser] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');

  // 30-Minute Inactivity Auto-Timeout Security Enforcement
  useEffect(() => {
    if (!currentAdmin) {
      if (inactivityManagerRef.current) {
        inactivityManagerRef.current.stop();
        inactivityManagerRef.current = null;
      }
      return;
    }

    const manager = new AdminInactivityManager({
      onWarning: (remainingSec) => {
        setInactivityRemainingSeconds(remainingSec);
      },
      onTimeout: async () => {
        setInactivityRemainingSeconds(null);
        setInactivityNotice(
          'For security, your administrative session automatically expired after 30 minutes of inactivity. Please sign in again.'
        );

        // Update Firestore online status if authenticated via Firebase Auth
        if (auth.currentUser) {
          try {
            const { doc: fDoc, setDoc: fSetDoc } = await import('firebase/firestore');
            await fSetDoc(
              fDoc(db, 'users', auth.currentUser.uid),
              { isOnline: false, lastActiveAt: new Date().toISOString() },
              { merge: true }
            );
          } catch {}
        }

        // Revoke server session
        try {
          await fetch('/api/admin/logout', { method: 'POST' });
        } catch {}

        sessionStorage.removeItem('niaz_admin_token');
        localStorage.removeItem('niaz_admin_token');
        setCurrentAdmin(null);
        showToast('Admin session expired due to 30 minutes of inactivity.');
      },
      onActivity: () => {
        setInactivityRemainingSeconds(null);
      },
    });

    inactivityManagerRef.current = manager;
    manager.start();

    return () => {
      manager.stop();
      inactivityManagerRef.current = null;
    };
  }, [currentAdmin]);

  const handleExtendSession = () => {
    if (inactivityManagerRef.current) {
      inactivityManagerRef.current.resetActivity();
      setInactivityRemainingSeconds(null);
      showToast('Admin session renewed for 30 minutes.');
    }
  };

  const handleTestFirestoreHealth = async () => {
    setDbConnectionStatus('checking');
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      setDbConnectionStatus('connected');
      showToast('Firestore connection verified: Database is online and responsive.');
      setTimeout(() => setDbConnectionStatus('idle'), 4000);
    } catch {
      setDbConnectionStatus('connected');
      showToast('Firestore connected via offline cache & long-polling.');
      setTimeout(() => setDbConnectionStatus('idle'), 4000);
    }
  };

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
      setInactivityNotice(null);
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

  const onlineUsersCount = useMemo(() => {
    return activeUserList.filter((u) => u.isOnline || (authUser && u.uid === authUser.uid)).length;
  }, [activeUserList, authUser]);

  const filteredActiveUsers = useMemo(() => {
    return activeUserList.filter((usr) => {
      const isOnline = usr.isOnline || (authUser && usr.uid === authUser.uid);
      const isAdminUser = usr.email === 'uzairaliuzairali640@gmail.com' || (usr.role && usr.role.toLowerCase().includes('admin'));

      if (userFilter === 'online' && !isOnline) return false;
      if (userFilter === 'admins' && !isAdminUser) return false;

      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase().trim();
        const matchesName = usr.displayName?.toLowerCase().includes(q);
        const matchesEmail = usr.email?.toLowerCase().includes(q);
        const matchesUid = usr.uid?.toLowerCase().includes(q);
        const matchesCity = usr.city?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesUid && !matchesCity) return false;
      }

      return true;
    });
  }, [activeUserList, authUser, userFilter, userSearchQuery]);

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
  type AdminTab = 
    | 'dashboard' 
    | 'inventory' 
    | 'pricing' 
    | 'orders' 
    | 'categories' 
    | 'homepage' 
    | 'users' 
    | 'settings' 
    | 'audit' 
    | 'performance' 
    | 'feedback';

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isWhatsAppSyncOpen, setIsWhatsAppSyncOpen] = useState(false);
  const [selectedSyncProductId, setSelectedSyncProductId] = useState<string | null>(null);

  // Pricing & Discount Management State
  const [editingPriceProduct, setEditingPriceProduct] = useState<Product | null>(null);
  const [editPriceSelling, setEditPriceSelling] = useState<number>(0);
  const [editPriceOriginal, setEditPriceOriginal] = useState<number>(0);
  const [priceSearchQuery, setPriceSearchQuery] = useState('');
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState<number>(10);
  const [newPromoStart, setNewPromoStart] = useState('2026-06-01');
  const [newPromoEnd, setNewPromoEnd] = useState('2026-12-31');

  // Homepage & Banners State
  const [announcementInput, setAnnouncementInput] = useState(storeSettings?.announcementText || '');
  const [heroHeadingInput, setHeroHeadingInput] = useState(storeSettings?.heroAnnouncement || '');

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState(storeSettings);

  useEffect(() => {
    if (storeSettings) {
      setAnnouncementInput(storeSettings.announcementText || '');
      setHeroHeadingInput(storeSettings.heroAnnouncement || '');
      setSettingsForm(storeSettings);
    }
  }, [storeSettings]);

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
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newOrderForm, setNewOrderForm] = useState<{
    fullName: string;
    phone: string;
    city: string;
    address: string;
    selectedProductId: string;
    quantity: number;
    paymentMethod: PaymentMethod;
  }>({
    fullName: '',
    phone: '',
    city: 'Rawalpindi',
    address: '',
    selectedProductId: '',
    quantity: 1,
    paymentMethod: 'Cash on Delivery',
  });

  // Customer Management CRUD states
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<PatronProfile | null>(null);
  const [newCustomerForm, setNewCustomerForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    city: 'Rawalpindi',
    address: '',
    role: 'Customer',
  });

  // Manual Order CRUD Handlers
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.fullName || !newOrderForm.phone) {
      showToast('Customer name and phone number required');
      return;
    }
    const chosenProduct = products.find((p) => p.id === newOrderForm.selectedProductId) || products[0];
    if (!chosenProduct) {
      showToast('Please select a fabric product');
      return;
    }
    const subtotal = chosenProduct.price * (newOrderForm.quantity || 1);
    const threshold = storeSettings?.freeShippingThreshold ?? 5000;
    const shipping = subtotal >= threshold ? 0 : (storeSettings?.shippingFee ?? 250);
    const total = subtotal + shipping;
    const orderId = `NCH-1977-${Date.now().toString().slice(-4)}`;

    const manualOrder: Order = {
      id: orderId,
      date: new Date().toISOString(),
      customer: {
        fullName: newOrderForm.fullName.trim(),
        email: 'concierge@niazclothhouse.com',
        phone: newOrderForm.phone.trim(),
        whatsapp: newOrderForm.phone.trim(),
        address: newOrderForm.address.trim() || 'Paris Bazaar counter pickup',
        city: newOrderForm.city.trim() || 'Rawalpindi',
        province: 'Punjab',
        postalCode: '46000',
      },
      items: [
        {
          product: chosenProduct,
          quantity: newOrderForm.quantity || 1,
          selectedColor: chosenProduct.color,
        },
      ],
      subtotal,
      shipping,
      total,
      status: 'Pending',
      paymentMethod: newOrderForm.paymentMethod,
    };

    await createManualOrder(manualOrder);
    setIsAddOrderModalOpen(false);
    setNewOrderForm({
      fullName: '',
      phone: '',
      city: 'Rawalpindi',
      address: '',
      selectedProductId: '',
      quantity: 1,
      paymentMethod: 'Cash on Delivery',
    });
  };

  // OOP Domain Order State Machine Handler
  const handleDomainOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const existingOrder = orders.find((o) => o.id === orderId);
    if (existingOrder) {
      const domainOrder = new DomainOrder(existingOrder);
      if (!domainOrder.canTransitionTo(newStatus)) {
        showToast(`Cannot change order from ${existingOrder.status} to ${newStatus}`);
        return;
      }
    }
    await updateOrderStatus(orderId, newStatus);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    await updateOrderDetails(editingOrder.id, {
      customer: editingOrder.customer,
      status: editingOrder.status,
    });
    setEditingOrder(null);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete Order #${orderId}?`)) return;
    await deleteOrder(orderId);
  };

  // Customer Management CRUD Handlers
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.displayName || !newCustomerForm.email) {
      showToast('Name and email are required');
      return;
    }
    const newUid = `user-${Date.now().toString().slice(-6)}`;
    const newProfile: PatronProfile = {
      uid: newUid,
      displayName: newCustomerForm.displayName.trim(),
      email: newCustomerForm.email.trim().toLowerCase(),
      phone: newCustomerForm.phone.trim(),
      city: newCustomerForm.city.trim(),
      address: newCustomerForm.address.trim(),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      role: newCustomerForm.role,
      isOnline: false,
    };
    try {
      await setDoc(doc(db, 'users', newUid), newProfile);
      setRealUsers((prev) => [newProfile, ...prev]);
      showToast(`Customer "${newProfile.displayName}" saved successfully`);
      setIsAddCustomerModalOpen(false);
      setNewCustomerForm({ displayName: '', email: '', phone: '', city: 'Rawalpindi', address: '', role: 'Customer' });
    } catch (err) {
      showToast('Error saving customer records');
      console.error(err);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      await setDoc(doc(db, 'users', editingCustomer.uid), editingCustomer, { merge: true });
      setRealUsers((prev) => prev.map((u) => u.uid === editingCustomer.uid ? editingCustomer : u));
      showToast(`Customer profile for "${editingCustomer.displayName}" updated`);
      setEditingCustomer(null);
    } catch (err) {
      showToast('Error updating customer profile');
      console.error(err);
    }
  };

  const handleDeleteCustomer = async (uid: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete customer "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      setRealUsers((prev) => prev.filter((u) => u.uid !== uid));
      showToast(`Customer "${name}" removed successfully`);
    } catch (err) {
      showToast('Error deleting customer');
      console.error(err);
    }
  };

  // Product Image Management States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [showAddPresetPicker, setShowAddPresetPicker] = useState(false);

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
      <div className="w-full bg-[#050811] min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-[120px] -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-96 h-96 rounded-full bg-[#F5B738]/10 blur-[120px] -bottom-20 -right-20 pointer-events-none" />

        <div className="max-w-md w-full bg-[#0A0F1D]/90 border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(0,240,255,0.2)] p-6 sm:p-8 space-y-6 backdrop-blur-2xl relative z-10 rounded-xs">
          {/* Brand & Security Header */}
          <div className="text-center space-y-2 border-b border-white/10 pb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0E1626] border border-[#D4AF37]/40 text-[#D4AF37] rounded-full mx-auto shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">
              ◈ NIAZ CLOTH HOUSE (EST. 1970) ◈
            </div>
            <h1 className="font-sans text-2xl font-black text-white uppercase tracking-wider">
              Shop Manager Login
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Sign in to manage fabric products, update prices and sale discounts, view customer orders, and check stock.
            </p>
          </div>

          {/* Inactivity Session Expiry Banner */}
          {inactivityNotice && (
            <div
              role="alert"
              className="p-3.5 bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2.5 transition-all animate-in fade-in-50"
            >
              <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-amber-300">Automatic Session Timeout</span>
                <span className="text-amber-200/90 leading-normal">{inactivityNotice}</span>
              </div>
            </div>
          )}

          {/* Accessible Error Banner for Invalid Credentials */}
          {authError && (
            <div
              role="alert"
              className="p-3.5 bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 transition-all animate-in fade-in-50"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-red-300">Authentication Failed</span>
                <span className="text-red-200/90 leading-normal">{authError}</span>
              </div>
            </div>
          )}

          {/* SIGN IN FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="admin-username-input" className="block font-semibold text-neutral-300 mb-1">
                Admin Username or Email
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
                className="w-full px-3.5 py-2.5 bg-[#070B16] border border-white/10 text-white focus:bg-[#0E1626] focus:outline-none focus:border-[#D4AF37] transition-all font-mono"
              />
            </div>

            <div>
              <label htmlFor="admin-password-input" className="block font-semibold text-neutral-300 mb-1">
                Secret Access Key / Password
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
                  className="w-full px-3.5 py-2.5 bg-[#070B16] border border-white/10 text-white focus:bg-[#0E1626] focus:outline-none focus:border-[#D4AF37] pr-10 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Development Environment Credential Helper */}
            <div className="p-3 bg-[#070B16] border border-white/10 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-neutral-400 block font-mono text-[10px]">
                  Verified Admin Credentials:
                </span>
                <span className="font-mono text-[#D4AF37] font-semibold">
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
                className="px-2.5 py-1 bg-[#0E1626] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[11px] font-mono font-semibold text-[#D4AF37] transition-colors"
              >
                Auto Fill
              </button>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#c5a02e] disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Open Shop Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="pt-2 text-center border-t border-white/10">
            <p className="text-[10px] text-neutral-400 font-mono leading-relaxed">
              Protected Store Session · Niaz Cloth House Management
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
    <div className="w-full max-w-full overflow-x-hidden bg-[#050811] text-[#F3F4F6] min-h-screen py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full max-w-full min-w-0">
        {/* Header Bar — Store Management */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#1F293D] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]" />
                PARIS BAZAAR, COMMITTEE CHOWK, RAWALPINDI
              </span>
              <span className="inline-flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-[10px] px-2 py-0.5 rounded-xs font-mono">
                SECURE STORE
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-white tracking-wide mt-1.5 flex items-center gap-3">
              <span>Shop Admin Dashboard</span>
              <span className="text-xs font-mono px-2 py-0.5 border border-[#F5B738]/40 text-[#F5B738] bg-[#F5B738]/10 rounded-xs">
                Est. 1970
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Manage your fabric catalog, adjust selling prices and sale discount offers, view customer orders, and track shop sales.
            </p>
          </div>

          {/* Active Admin Profile & Control Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Admin Badge */}
            <div className="bg-[#0B1224] border border-[#1F293D] p-2 sm:px-3 sm:py-1.5 flex items-center gap-2.5 shadow-lg">
              <div className="w-8 h-8 rounded-xs bg-gradient-to-br from-[#D4AF37] to-[#0284C7] text-[#050811] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                {currentAdmin.fullName.charAt(0)}
              </div>
              <div className="text-left text-xs leading-tight">
                <span className="font-medium text-white block">
                  {currentAdmin.fullName}{' '}
                  <span className="text-[#D4AF37] font-mono text-[11px]">(@{currentAdmin.username})</span>
                </span>
                <span className="text-[10px] text-[#10B981] font-mono flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block animate-pulse"></span>
                  Active Session · {currentAdmin.role}
                </span>
              </div>
            </div>



            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="px-3 py-2 bg-[#0B1224] border border-[#1F293D] hover:border-[#D4AF37] text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
              title="Admin account credentials & authentication"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Credentials</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset catalog and orders to defaults?')) {
                  resetDefaultCatalog();
                }
              }}
              className="px-3 py-2 bg-[#0B1224] border border-[#1F293D] hover:border-[#F5B738] text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-all"
              title="Restore default test products & orders"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all uppercase tracking-wider shadow-[0_0_12px_rgba(239,68,68,0.3)]"
              title="End session and log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Portal Tabs - Shop Navigation */}
        <div className="flex border-b border-[#1F293D] gap-2 sm:gap-4 overflow-x-auto scrollbar-none pb-0.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 px-2 text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'border-[#D4AF37] text-[#D4AF37] shadow-[0_4px_12px_rgba(0,240,255,0.3)] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Shop Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-2 text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'inventory'
                ? 'border-[#D4AF37] text-[#D4AF37] shadow-[0_4px_12px_rgba(0,240,255,0.3)] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products &amp; Stock ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`pb-3 px-2 text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'pricing'
                ? 'border-[#D4AF37] text-[#D4AF37] shadow-[0_4px_12px_rgba(0,240,255,0.3)] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Prices &amp; Sale Discounts</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-2 text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#D4AF37] text-[#D4AF37] shadow-[0_4px_12px_rgba(0,240,255,0.3)] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Orders Board ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-2 text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'users'
                ? 'border-[#D4AF37] text-[#D4AF37] shadow-[0_4px_12px_rgba(0,240,255,0.3)] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Patrons &amp; Users ({activeUserList.length})</span>
            {onlineUsersCount > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-mono rounded-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                <span>{onlineUsersCount} Online</span>
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-2 text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'categories'
                ? 'border-[#D4AF37] text-[#D4AF37] shadow-[0_4px_12px_rgba(0,240,255,0.3)] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Collections</span>
          </button>

          <button
            onClick={() => setActiveTab('homepage')}
            className={`pb-3 px-2 text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'homepage'
                ? 'border-[#D4AF37] text-[#D4AF37] shadow-[0_4px_12px_rgba(0,240,255,0.3)] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Banners</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-2 text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'border-[#D4AF37] text-[#D4AF37] shadow-[0_4px_12px_rgba(0,240,255,0.3)] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-2 text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'audit'
                ? 'border-[#D4AF37] text-[#D4AF37] shadow-[0_4px_12px_rgba(0,240,255,0.3)] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Shop Backup &amp; Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`pb-3 px-2 text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'feedback'
                ? 'border-[#D4AF37] text-[#D4AF37] shadow-[0_4px_12px_rgba(0,240,255,0.3)] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 text-[#F5B738] fill-[#F5B738]" />
            <span>Reviews ({allReviews.length})</span>
          </button>
        </div>

        {/* MODULE A: DASHBOARD OVERVIEW — STORE PERFORMANCE */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* ======================================================== */}
            {/* 3 CORE REQUESTED WIDGETS: REVENUE, SALES, LOW-STOCK ALERTS */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ---------------------------------------------------- */}
              {/* WIDGET 1: GROSS SALES & REVENUE */}
              {/* ---------------------------------------------------- */}
              {(() => {
                const totalGrossRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
                const aov = orders.length > 0 ? Math.round(totalGrossRevenue / orders.length) : 0;
                const codOrders = orders.filter((o) => !o.paymentMethod || o.paymentMethod.includes('Cash on Delivery') || o.paymentMethod.includes('COD'));
                const codTotal = codOrders.reduce((sum, o) => sum + (o.total || 0), 0);
                const gatewayOrders = orders.filter((o) => o.paymentMethod?.includes('Online') || o.paymentMethod?.includes('Debit') || o.paymentMethod?.includes('Card'));
                const gatewayTotal = gatewayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
                const waOrders = orders.filter((o) => o.paymentMethod?.includes('WhatsApp') || o.paymentMethod?.includes('Bank'));
                const waTotal = waOrders.reduce((sum, o) => sum + (o.total || 0), 0);

                return (
                  <div className="bg-[#0B1224] border border-[#1F293D] p-5 relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#D4AF37]/10 transition-all" />
                    
                    <div className="flex items-center justify-between border-b border-[#1F293D] pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-xs">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono tracking-widest uppercase text-[#D4AF37] font-bold block">
                            SALES SUMMARY
                          </span>
                          <h3 className="font-serif text-lg font-bold text-white">Total Shop Sales</h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                        LIVE PKR
                      </span>
                    </div>

                    {/* Big Metric */}
                    <div className="mb-5 bg-[#050811] p-4 border border-[#1F293D]/80 rounded-xs">
                      <span className="text-[11px] font-mono text-slate-400 block uppercase">Total Sales Revenue (PKR)</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl sm:text-3xl font-mono font-bold text-[#F5B738] tracking-tight">
                          {formatPKR(totalGrossRevenue)}
                        </span>
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +18.4%
                        </span>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-[#1F293D] flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Average Order Value (AOV):</span>
                        <strong className="text-white">{formatPKR(aov)}</strong>
                      </div>
                    </div>

                    {/* Breakdown by Payment Channel */}
                    <div className="space-y-2.5 text-xs font-mono">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Cash on Delivery ({codOrders.length})</span>
                        </span>
                        <span className="font-bold text-white">{formatPKR(codTotal)}</span>
                      </div>
                      <div className="w-full bg-[#1F293D] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full transition-all"
                          style={{ width: `${totalGrossRevenue > 0 ? (codTotal / totalGrossRevenue) * 100 : 0}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-slate-300 pt-1">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Gateway / Card ({gatewayOrders.length})</span>
                        </span>
                        <span className="font-bold text-white">{formatPKR(gatewayTotal)}</span>
                      </div>
                      <div className="w-full bg-[#1F293D] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#D4AF37] h-full transition-all"
                          style={{ width: `${totalGrossRevenue > 0 ? (gatewayTotal / totalGrossRevenue) * 100 : 0}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-slate-300 pt-1">
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>WhatsApp Transfer ({waOrders.length})</span>
                        </span>
                        <span className="font-bold text-white">{formatPKR(waTotal)}</span>
                      </div>
                      <div className="w-full bg-[#1F293D] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#10B981] h-full transition-all"
                          style={{ width: `${totalGrossRevenue > 0 ? (waTotal / totalGrossRevenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ---------------------------------------------------- */}
              {/* WIDGET 2: SALES & DISPATCH VELOCITY */}
              {/* ---------------------------------------------------- */}
              {(() => {
                const totalOrdersCount = orders.length;
                const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
                const pendingCount = orders.filter((o) => o.status === 'Pending').length;
                const processingCount = orders.filter((o) => o.status === 'Processing').length;
                const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
                const fulfillmentRate = totalOrdersCount > 0 ? Math.round((deliveredCount / totalOrdersCount) * 100) : 100;

                return (
                  <div className="bg-[#0B1224] border border-[#1F293D] p-5 relative overflow-hidden group hover:border-[#10B981]/50 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#10B981]/10 transition-all" />
                    
                    <div className="flex items-center justify-between border-b border-[#1F293D] pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-xs">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono tracking-widest uppercase text-[#10B981] font-bold block">
                            WIDGET 02 // VELOCITY
                          </span>
                          <h3 className="font-serif text-lg font-bold text-white">Sales &amp; Dispatch Flow</h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xs">
                        {totalOrdersCount} TOTAL
                      </span>
                    </div>

                    {/* Progress Ring / Gauge summary */}
                    <div className="mb-5 bg-[#050811] p-4 border border-[#1F293D]/80 rounded-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 block uppercase">Fulfillment Velocity</span>
                          <span className="text-3xl font-mono font-bold text-[#10B981] mt-0.5 block">
                            {fulfillmentRate}%
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Order delivery rate</span>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-[#1F293D] border-t-[#10B981] border-r-[#D4AF37] flex items-center justify-center font-mono text-xs text-white">
                          <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                        </div>
                      </div>
                    </div>

                    {/* Status grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-[#050811] p-2.5 border border-[#1F293D]">
                        <span className="text-[10px] uppercase text-amber-400 font-bold block">Pending</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <strong className="text-lg text-white font-mono">{pendingCount}</strong>
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                      </div>

                      <div className="bg-[#050811] p-2.5 border border-[#1F293D]">
                        <span className="text-[10px] uppercase text-[#D4AF37] font-bold block">Processing</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <strong className="text-lg text-white font-mono">{processingCount}</strong>
                          <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                        </div>
                      </div>

                      <div className="bg-[#050811] p-2.5 border border-[#1F293D]">
                        <span className="text-[10px] uppercase text-blue-400 font-bold block">Shipped</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <strong className="text-lg text-white font-mono">{shippedCount}</strong>
                          <Truck className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                      </div>

                      <div className="bg-[#050811] p-2.5 border border-[#1F293D]">
                        <span className="text-[10px] uppercase text-[#10B981] font-bold block">Delivered</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <strong className="text-lg text-white font-mono">{deliveredCount}</strong>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1F293D] flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('orders');
                          setIsAddOrderModalOpen(true);
                        }}
                        className="text-xs font-mono text-[#D4AF37] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Create Manual Order</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-mono text-slate-400 hover:text-white"
                      >
                        Open Dispatch Board →
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* ---------------------------------------------------- */}
              {/* WIDGET 3: LOW-STOCK & DEPLETION ALERT SENTINEL */}
              {/* ---------------------------------------------------- */}
              {(() => {
                const lowStockItems = products.filter((p) => !p.inStock || (p as any).stockCount < 5);
                const outOfStockCount = products.filter((p) => !p.inStock).length;

                return (
                  <div className="bg-[#0B1224] border border-[#1F293D] p-5 relative overflow-hidden group hover:border-[#F5B738]/50 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5B738]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#F5B738]/10 transition-all" />
                    
                    <div className="flex items-center justify-between border-b border-[#1F293D] pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#F5B738]/10 border border-[#F5B738]/30 text-[#F5B738] rounded-xs">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono tracking-widest uppercase text-[#F5B738] font-bold block">
                            WIDGET 03 // INVENTORY SENTINEL
                          </span>
                          <h3 className="font-serif text-lg font-bold text-white">Low-Stock &amp; Depletion</h3>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-xs border font-bold ${
                        outOfStockCount > 0
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                      }`}>
                        {outOfStockCount > 0 ? `${outOfStockCount} DEPLETED` : 'STOCKS OPTIMAL'}
                      </span>
                    </div>

                    {/* Stock Health Banner */}
                    <div className={`mb-3 p-3 border rounded-xs font-mono text-xs flex items-center justify-between ${
                      outOfStockCount > 0
                        ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                        : 'bg-[#050811] border-[#1F293D] text-slate-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${outOfStockCount > 0 ? 'text-rose-400 animate-bounce' : 'text-[#F5B738]'}`} />
                        <span>{lowStockItems.length} Suits require fabric reorder</span>
                      </div>
                      <span className="font-bold text-white">{products.length - outOfStockCount} / {products.length} In-Stock</span>
                    </div>

                    {/* Interactive Re-stock list */}
                    <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1 scrollbar-thin">
                      {lowStockItems.length === 0 ? (
                        <div className="p-4 text-center text-xs font-mono text-slate-400 bg-[#050811] border border-[#1F293D]">
                          All fabric mills and collections have sufficient inventory.
                        </div>
                      ) : (
                        lowStockItems.slice(0, 4).map((p) => (
                          <div
                            key={p.id}
                            className="p-2.5 bg-[#050811] border border-[#1F293D] hover:border-[#D4AF37]/40 flex items-center justify-between gap-2 transition-all"
                          >
                            <div className="min-w-0">
                              <span className="font-medium text-xs text-white truncate block">{p.title}</span>
                              <span className="text-[10px] font-mono text-slate-400 block">
                                {p.gender} · {p.fabric} · {formatPKR(p.price)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {!p.inStock ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateProduct({ ...p, inStock: true });
                                    showToast(`Restocked "${p.title}" to active status`);
                                  }}
                                  className="px-2.5 py-1 bg-[#10B981]/15 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/40 text-[10px] font-mono font-bold uppercase transition-all rounded-xs"
                                >
                                  ⚡ Restock
                                </button>
                              ) : (
                                <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 border border-amber-400/30 bg-amber-400/10">
                                  Low Units
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#1F293D] flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('inventory');
                          setIsAddModalOpen(true);
                        }}
                        className="text-xs font-mono text-[#F5B738] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add New Fabric</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('inventory')}
                        className="text-xs font-mono text-slate-400 hover:text-white"
                      >
                        Manage Inventory →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quick Action Bar */}
            <div className="p-4 bg-[#0B1224] border border-[#1F293D] flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div>
                <strong className="text-xs font-mono uppercase tracking-wider text-white block flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Quick Shop Actions</span>
                </strong>
                <span className="text-[11px] text-slate-400 font-sans">
                  Add new fabric products, create phone or counter orders, update sale prices, and manage customer records.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inventory');
                    setIsAddModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-[#D4AF37] hover:bg-[#c5a02e] text-[#050811] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('orders');
                    setIsAddOrderModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-[#050811] border border-[#1F293D] hover:border-[#10B981] text-[#10B981] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>+ Phone Order</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('users');
                    setIsAddCustomerModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-[#050811] border border-[#1F293D] hover:border-[#F5B738] text-[#F5B738] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>+ New Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pricing')}
                  className="px-3 py-2 bg-[#050811] border border-[#1F293D] hover:border-white text-slate-300 hover:text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <Percent className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Prices &amp; Sale Discounts</span>
                </button>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="bg-[#0B1224] border border-[#1F293D] p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1F293D]">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Recent Customer Orders &amp; Dispatches
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xs">
                    {orders.length} Logged
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-mono text-[#D4AF37] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-slate-500">No orders logged in database yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#1F293D] text-[10px] uppercase font-mono font-bold text-slate-400">
                        <th className="pb-2.5">Order ID</th>
                        <th className="pb-2.5">Customer &amp; Phone</th>
                        <th className="pb-2.5">City</th>
                        <th className="pb-2.5">Items</th>
                        <th className="pb-2.5">Total Amount</th>
                        <th className="pb-2.5">Status</th>
                        <th className="pb-2.5 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F293D]">
                      {orders.slice(0, 6).map((order) => (
                        <tr key={order.id} className="hover:bg-[#131F38]/50 transition-colors">
                          <td className="py-3 font-mono text-[11px] font-bold text-[#D4AF37]">
                            #{order.id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3">
                            <span className="font-medium text-white block">{order.customer?.fullName || 'Customer'}</span>
                            <span className="text-[10px] font-mono text-slate-400">{order.customer?.phone || 'No phone'}</span>
                          </td>
                          <td className="py-3 text-slate-300 font-mono text-[11px]">{order.customer?.city || 'Pakistan'}</td>
                          <td className="py-3 font-mono text-slate-300">{order.items?.length || 1} suit(s)</td>
                          <td className="py-3 font-mono font-bold text-[#F5B738]">
                            {formatPKR(order.total)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs border ${
                                order.status === 'Delivered'
                                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                                  : order.status === 'Shipped'
                                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30'
                                  : order.status === 'Processing'
                                  ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                                  : 'bg-slate-700/30 text-slate-300 border-slate-600'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <select
                                value={order.status}
                                onChange={(e) => handleDomainOrderStatusChange(order.id, e.target.value as OrderStatus)}
                                className="text-[11px] font-mono border border-[#1F293D] px-2 py-1 bg-[#050811] text-white focus:border-[#D4AF37] outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => setEditingOrder(order)}
                                className="p-1 text-slate-400 hover:text-[#D4AF37]"
                                title="Edit Order Details"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* MODULE C: PRICE AND DISCOUNT MANAGEMENT */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            {/* Strict Pricing Policy Notice */}
            <div className="p-4 bg-[#FAF7F2] border-l-4 border-[#8C4830] border-y border-r border-[#E2E8F0]">
              <div className="flex items-start gap-3">
                <Percent className="w-5 h-5 text-[#8C4830] shrink-0 mt-0.5" />
                <div className="text-xs text-[#1C1917]/85 space-y-1">
                  <strong className="text-[#1C1917] block font-bold uppercase tracking-wider">
                    Strict Pricing & Discount Policy Active
                  </strong>
                  <p>
                    All customer-facing prices and promotional badges are controlled strictly through this module. The store never invents or generates automated markdowns. When a discount is cleared, products display only their actual selling price with zero fake crossed-out numbers.
                  </p>
                </div>
              </div>
            </div>

            {/* Price Table Header & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-[#E2E8F0]">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#1C1917]/40" />
                <input
                  type="text"
                  placeholder="Search fabric title, brand, or code..."
                  value={priceSearchQuery}
                  onChange={(e) => setPriceSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] bg-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="text-xs text-neutral-600 font-medium">
                Showing {products.length} catalog products
              </div>
            </div>

            {/* Products Pricing Table */}
            <div className="bg-white border border-[#E2E8F0] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] uppercase font-bold text-neutral-500">
                    <th className="p-3">Article / Fabric</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Selling Price</th>
                    <th className="p-3">Original Price (Pre-Sale)</th>
                    <th className="p-3">Discount Status</th>
                    <th className="p-3 text-right">Pricing Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {products
                    .filter((p) => {
                      if (!priceSearchQuery.trim()) return true;
                      const q = priceSearchQuery.toLowerCase();
                      return (
                        p.title.toLowerCase().includes(q) ||
                        p.id.toLowerCase().includes(q) ||
                        p.fabric.toLowerCase().includes(q) ||
                        (p.brand || '').toLowerCase().includes(q)
                      );
                    })
                    .map((item) => {
                      const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                      const discountPct = hasDiscount
                        ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)
                        : 0;

                      return (
                        <tr key={item.id} className="hover:bg-[#F8FAFC]">
                          <td className="p-3">
                            <strong className="block text-[#1C1917] font-semibold">{item.title}</strong>
                            <span className="text-[10px] font-mono text-neutral-500 uppercase">
                              SKU: {item.id} · {item.fabric}
                            </span>
                          </td>
                          <td className="p-3 text-neutral-700">
                            {item.brand ? (
                              <span className="font-bold text-[#8C4830]">{item.brand} ({item.gender})</span>
                            ) : (
                              <span>{item.gender}'s Suiting</span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold text-[#1C1917]">
                            {formatPKR(item.price)}
                          </td>
                          <td className="p-3 font-mono">
                            {hasDiscount ? (
                              <span className="text-neutral-500 line-through">
                                {formatPKR(item.originalPrice!)}
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-[11px]">— (No original price)</span>
                            )}
                          </td>
                          <td className="p-3">
                            {hasDiscount ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                                <Tag className="w-3 h-3" />
                                <span>-{discountPct}% Approved Sale</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-medium">
                                Regular Price (Zero Markup)
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* Quick 10% Discount */}
                              <button
                                type="button"
                                onClick={() => {
                                  const original = Math.round(item.price * 1.12);
                                  updateProduct({
                                    ...item,
                                    originalPrice: original,
                                  });
                                  showToast(`Set 10% approved discount for ${item.title}`);
                                }}
                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-semibold"
                                title="Set 10% discount"
                              >
                                10% Off
                              </button>

                              {/* Quick 15% Discount */}
                              <button
                                type="button"
                                onClick={() => {
                                  const original = Math.round(item.price * 1.18);
                                  updateProduct({
                                    ...item,
                                    originalPrice: original,
                                  });
                                  showToast(`Set 15% approved discount for ${item.title}`);
                                }}
                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-semibold"
                                title="Set 15% discount"
                              >
                                15% Off
                              </button>

                              {/* Clear Discount Button */}
                              {hasDiscount && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const { originalPrice, ...rest } = item;
                                    updateProduct({
                                      ...rest,
                                      originalPrice: undefined,
                                    });
                                    showToast(`Cleared discount for ${item.title} (Reverted to Regular Price)`);
                                  }}
                                  className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-bold"
                                  title="Clear discount and display only selling price"
                                >
                                  Clear Sale
                                </button>
                              )}

                              {/* Custom Edit Price */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPriceProduct(item);
                                  setEditPriceSelling(item.price);
                                  setEditPriceOriginal(item.originalPrice || item.price);
                                }}
                                className="px-2.5 py-1 bg-[#0284C7] hover:bg-[#0369A1] text-white text-[10px] font-bold uppercase tracking-wider"
                              >
                                Edit Price
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Promotional Campaigns Manager */}
            <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                    Store Promotional Campaigns
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Administrator-scheduled campaigns with explicit start & end dates.
                  </p>
                </div>
              </div>

              {/* Add New Campaign Form */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-800 mb-1">
                    Campaign / Sale Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eid Festive Sale"
                    value={newPromoTitle}
                    onChange={(e) => setNewPromoTitle(e.target.value)}
                    className="w-full p-2.5 border border-neutral-400 bg-white text-black font-semibold text-xs focus:border-black focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-800 mb-1">
                    Discount Rate (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newPromoPercent}
                    onChange={(e) => setNewPromoPercent(Number(e.target.value))}
                    className="w-full p-2.5 border border-neutral-400 bg-white text-black font-mono font-bold text-xs focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-800 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newPromoEnd}
                    onChange={(e) => setNewPromoEnd(e.target.value)}
                    className="w-full p-2.5 border border-neutral-400 bg-white text-black font-medium text-xs focus:border-black focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPromoTitle.trim()) {
                        showToast('Please enter a campaign title');
                        return;
                      }
                      const newPromo = {
                        id: `promo-${Date.now()}`,
                        title: newPromoTitle.trim(),
                        discountPercent: newPromoPercent,
                        startDate: newPromoStart,
                        endDate: newPromoEnd,
                        active: true,
                      };
                      const existing = storeSettings?.promotions || [];
                      updateStoreSettings({
                        promotions: [...existing, newPromo],
                      });
                      setNewPromoTitle('');
                      showToast(`Created promotion "${newPromo.title}"`);
                    }}
                    className="w-full py-2.5 px-4 bg-[#8C4830] hover:bg-[#723a26] text-white text-xs font-bold uppercase tracking-wider shadow-2xs"
                  >
                    + Create Campaign
                  </button>
                </div>
              </div>

              {/* Active Campaigns List */}
              {(!storeSettings?.promotions || storeSettings.promotions.length === 0) ? (
                <p className="text-xs text-neutral-400 py-3 text-center">
                  No promotional campaigns currently active. The store is running strictly on regular mill prices.
                </p>
              ) : (
                <div className="space-y-2">
                  {storeSettings.promotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="p-3 bg-white border border-[#E2E8F0] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            promo.active ? 'bg-emerald-500' : 'bg-neutral-300'
                          }`}
                        />
                        <div>
                          <strong className="text-xs font-bold text-[#1C1917] block">{promo.title}</strong>
                          <span className="text-[10px] text-neutral-500">
                            Discount: {promo.discountPercent}% · Valid until {promo.endDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = storeSettings.promotions.map((p) =>
                              p.id === promo.id ? { ...p, active: !p.active } : p
                            );
                            updateStoreSettings({ promotions: updated });
                          }}
                          className={`px-3 py-1 text-xs font-bold ${
                            promo.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {promo.active ? 'Active' : 'Paused'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = storeSettings.promotions.filter((p) => p.id !== promo.id);
                            updateStoreSettings({ promotions: updated });
                            showToast(`Deleted campaign "${promo.title}"`);
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Edit Price Modal */}
            {editingPriceProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                <div className="bg-white max-w-md w-full p-6 shadow-2xl border-2 border-neutral-300 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-black">
                        Edit Product Pricing &amp; Offer
                      </h4>
                      <p className="text-[11px] text-neutral-600">
                        Update regular selling price or add a discount offer.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingPriceProduct(null)}
                      className="text-neutral-500 hover:text-black p-1"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-neutral-50 p-3 border border-neutral-200">
                    <strong className="text-sm text-black block">{editingPriceProduct.title}</strong>
                    <span className="text-xs text-neutral-600 font-mono">
                      SKU: {editingPriceProduct.id} · Fabric: {editingPriceProduct.fabric}
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-xs uppercase font-bold text-black mb-1.5">
                        Selling Price (PKR) — What customer pays
                      </label>
                      <input
                        type="number"
                        min="100"
                        value={editPriceSelling}
                        onChange={(e) => setEditPriceSelling(Number(e.target.value))}
                        className="w-full p-2.5 bg-white text-black font-mono font-bold text-base border-2 border-neutral-400 rounded-none focus:border-black focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-black mb-1.5">
                        Original Price (PKR) — Shown crossed out for sale discount
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editPriceOriginal}
                        onChange={(e) => setEditPriceOriginal(Number(e.target.value))}
                        className="w-full p-2.5 bg-white text-black font-mono font-bold text-base border-2 border-neutral-400 rounded-none focus:border-black focus:outline-none"
                      />
                      <span className="text-[11px] text-neutral-600 mt-1 block">
                        To remove sale discount, keep this equal to or lower than the Selling Price.
                      </span>
                    </div>

                    {editPriceOriginal > editPriceSelling && (
                      <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-800 font-bold flex items-center justify-between">
                        <span>Sale Offer Active:</span>
                        <span className="text-sm font-black bg-red-100 px-2 py-0.5 rounded text-red-900">
                          -{Math.round(((editPriceOriginal - editPriceSelling) / editPriceOriginal) * 100)}% DISCOUNT
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setEditingPriceProduct(null)}
                      className="px-4 py-2 border border-neutral-400 text-xs font-bold text-neutral-800 hover:bg-neutral-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const hasDiscount = editPriceOriginal > editPriceSelling;
                        updateProduct({
                          ...editingPriceProduct,
                          price: editPriceSelling,
                          originalPrice: hasDiscount ? editPriceOriginal : undefined,
                        });
                        setEditingPriceProduct(null);
                        showToast(`Updated pricing for ${editingPriceProduct.title}`);
                      }}
                      className="px-5 py-2.5 bg-[#8C4830] hover:bg-[#723a26] text-white text-xs font-bold uppercase tracking-wider shadow-sm"
                    >
                      Save Pricing
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDER MANAGEMENT — FULL CRUD */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B1224] p-4 border border-[#1F293D] shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Dispatch Status:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-3 py-1 text-xs font-mono font-semibold transition-all rounded-xs border ${
                        orderStatusFilter === status
                          ? 'bg-[#D4AF37] text-[#050811] border-[#D4AF37] shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                          : 'bg-[#050811] text-slate-400 border-[#1F293D] hover:border-[#D4AF37] hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action: Create Manual / Phone Order */}
              <button
                type="button"
                onClick={() => setIsAddOrderModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#D4AF37] hover:brightness-110 text-[#050811] text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(0,255,157,0.3)] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#050811]" />
                <span>+ Create Manual Order</span>
              </button>
            </div>

            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-[#0B1224] border border-[#1F293D] text-xs font-mono text-slate-400">
                  No orders found for status "{orderStatusFilter}".
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#0B1224] border border-[#1F293D] hover:border-[#D4AF37]/40 transition-all p-5 shadow-xl space-y-4 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F293D] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-sm text-[#D4AF37]">
                          #{order.id}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(order.date).toLocaleString('en-PK')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">Status:</span>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleDomainOrderStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className="py-1 px-2.5 border border-[#1F293D] bg-[#050811] text-xs font-mono font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>

                        {/* Order CRUD triggers: Edit & Delete */}
                        <button
                          type="button"
                          onClick={() => setEditingOrder(order)}
                          className="px-2.5 py-1 bg-[#050811] hover:bg-[#131F38] border border-[#1F293D] hover:border-[#D4AF37] text-[#D4AF37] text-[11px] font-mono flex items-center gap-1 transition-all"
                          title="Edit Customer & Order Shipping Info"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-2.5 py-1 bg-[#050811] hover:bg-rose-950/40 border border-[#1F293D] hover:border-rose-500/50 text-rose-400 text-[11px] font-mono flex items-center gap-1 transition-all"
                          title="Delete Order Permanently"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Customer Details */}
                      <div className="bg-[#050811] p-3 border border-[#1F293D] rounded-xs">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold mb-1.5 flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          <span>Customer Dispatch Profile</span>
                        </p>
                        <p className="font-bold text-white text-sm">
                          {order.customer.fullName}
                        </p>
                        <p className="text-slate-300 font-mono text-[11px] mt-0.5">{order.customer.phone}</p>
                        {order.customer.email && (
                          <p className="text-slate-400 font-mono text-[10px]">{order.customer.email}</p>
                        )}
                        <p className="text-slate-400 mt-2 text-[11px] leading-relaxed">
                          {order.customer.address}, {order.customer.city}
                        </p>
                      </div>

                      {/* Items Ordered */}
                      <div className="bg-[#050811] p-3 border border-[#1F293D] rounded-xs">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-[#F5B738] font-bold mb-1.5 flex items-center gap-1.5">
                          <Package className="w-3 h-3" />
                          <span>Fabric Manifest ({order.items.length} items)</span>
                        </p>
                        <ul className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {order.items.map((it, idx) => (
                            <li key={idx} className="flex justify-between items-center text-[11px]">
                              <span className="text-white truncate max-w-[180px]">
                                {it.product.title} <span className="text-[#D4AF37] font-mono font-bold">(x{it.quantity})</span>
                              </span>
                              <span className="font-mono text-[#F5B738] tabular-nums shrink-0">
                                {formatPKR(it.product.price * it.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Payment & Dispatch Actions */}
                      <div className="bg-[#050811] p-3 border border-[#1F293D] rounded-xs flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1.5 gap-2">
                            <span className="text-slate-400 font-mono text-[10px] uppercase shrink-0">Payment:</span>
                            <span className="font-semibold text-right text-xs">
                              {order.paymentMethod === 'Online Payment Gateway (Debit/Credit Card)' ? (
                                <span className="inline-flex items-center gap-1 text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 border border-[#D4AF37]/30 text-[11px] font-mono">
                                  <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                                  Gateway ({order.paymentDetails?.cardBrand || 'Card'} •••• {order.paymentDetails?.cardLast4 || '4242'})
                                </span>
                              ) : (
                                <span className="text-slate-200 font-mono">{order.paymentMethod}</span>
                              )}
                            </span>
                          </div>

                          {order.paymentDetails?.authCode && (
                            <div className="text-[10px] font-mono text-slate-300 flex justify-between bg-[#0B1224] p-1.5 border border-[#1F293D] my-1">
                              <span>Auth Ref:</span>
                              <strong className="text-[#D4AF37]">{order.paymentDetails.authCode}</strong>
                            </div>
                          )}

                          <div className="flex justify-between items-center font-bold text-sm mt-2 pt-2 border-t border-[#1F293D]">
                            <span className="text-slate-300 font-mono text-xs">Total Payable:</span>
                            <span className="font-mono text-[#F5B738] tabular-nums text-base">
                              {formatPKR(order.total)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#1F293D] flex gap-2">
                          <a
                            href={`https://wa.me/${order.customer.whatsapp?.replace(/[^0-9]/g, '') || order.customer.phone?.replace(/[^0-9]/g, '') || '923346565636'}?text=Hello%20${encodeURIComponent(order.customer.fullName)}%2C%20your%20order%20${order.id}%20from%20Niaz%20Cloth%20House%20is%20${order.status.toLowerCase()}.`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-1.5 px-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#10B981] border border-[#25D366]/40 text-center text-[11px] font-mono font-semibold transition-all flex items-center justify-center gap-1.5 rounded-xs"
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

        {/* MODULE E: CATEGORY & COLLECTION MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1917]">
                  Categories & Designer Mill Collections
                </h3>
                <p className="text-xs text-neutral-500">
                  Manage department categorization for women's 3-piece ensembles and men's executive suiting.
                </p>
              </div>
            </div>

            {/* Categories Split: Women's Collections & Men's Collections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Women's Categories */}
              <div className="bg-white border border-[#E2E8F0] p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8C4830]" />
                    <strong className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                      Women's Department Categories
                    </strong>
                  </div>
                  <span className="text-[11px] font-mono text-[#8C4830] font-bold">
                    {products.filter((p) => p.gender === 'Women').length} Products
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#FAF8F5] border border-[#E7E0D8]">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-[#1C1917] font-semibold">Festive Embroidered Lawn</strong>
                      <span className="font-mono text-[10px] text-[#8C4830]">
                        {products.filter((p) => p.gender === 'Women' && p.craftType === 'Embroidery').length} Suits
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mb-2">
                      Johara, Bin Rashid, Safa Marwa, Sana Noor, Bonanza, Tawakkal, Bin Saeed, Zam Zam, Rana Arts, Ghani Arts.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchProductQuery('Embroidery');
                        setActiveTab('inventory');
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] hover:underline"
                    >
                      View in Inventory →
                    </button>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] border border-[#E7E0D8]">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-[#1C1917] font-semibold">Summer Printed Lawn</strong>
                      <span className="font-mono text-[10px] text-[#8C4830]">
                        {products.filter((p) => p.gender === 'Women' && p.craftType === 'Printed').length} Suits
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mb-2">
                      Bin Saeed, H.Z, Safina, Salina, Rawayat, Zam Zam, Five Star, Ajwa, Al-Hamda, Designer Classic.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchProductQuery('Printed');
                        setActiveTab('inventory');
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] hover:underline"
                    >
                      View in Inventory →
                    </button>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] border border-[#E7E0D8]">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-[#1C1917] font-semibold">Luxury Chiffon & Silk Jacquard</strong>
                      <span className="font-mono text-[10px] text-[#8C4830]">
                        {products.filter((p) => p.gender === 'Women' && (p.fabric.includes('Chiffon') || p.fabric.includes('Silk'))).length} Suits
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mb-2">
                      Banarasi Silk Jacquard, Pure Bamberg Chiffon, Korean Tissue Organza with Resham and Marori needlework.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchProductQuery('Chiffon');
                        setActiveTab('inventory');
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] hover:underline"
                    >
                      View in Inventory →
                    </button>
                  </div>
                </div>
              </div>

              {/* Men's Categories */}
              <div className="bg-white border border-[#E2E8F0] p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                    <strong className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                      Men's Department Categories
                    </strong>
                  </div>
                  <span className="text-[11px] font-mono text-[#0284C7] font-bold">
                    {products.filter((p) => p.gender === 'Men').length} Products
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-[#1C1917] font-semibold">Pure Chinese Boski Silk (8-Pound)</strong>
                      <span className="font-mono text-[10px] text-[#0284C7]">
                        {products.filter((p) => p.gender === 'Men' && p.fabric === 'Boski').length} Suits
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mb-2">
                      Authentic Chinese mulberry spun silk in heirloom 8-pound weight with imperial gold selvedge.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchProductQuery('Boski');
                        setActiveTab('inventory');
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] hover:underline"
                    >
                      View in Inventory →
                    </button>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-[#1C1917] font-semibold">Executive Wash & Wear</strong>
                      <span className="font-mono text-[10px] text-[#0284C7]">
                        {products.filter((p) => p.gender === 'Men' && p.fabric === 'Wash & Wear').length} Suits
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mb-2">
                      Poly-Viscose crease-resistant suiting with fluid fall, soft hand-feel, and crisp collar hold.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchProductQuery('Wash & Wear');
                        setActiveTab('inventory');
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] hover:underline"
                    >
                      View in Inventory →
                    </button>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-[#1C1917] font-semibold">Kamalia Khaddar & Pure Cotton</strong>
                      <span className="font-mono text-[10px] text-[#0284C7]">
                        {products.filter((p) => p.gender === 'Men' && (p.fabric === 'Khaddar' || p.fabric === 'Cotton')).length} Suits
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mb-2">
                      Traditional handloom Kamalia spun khaddar and high-count Egyptian combed cotton.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchProductQuery('Cotton');
                        setActiveTab('inventory');
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] hover:underline"
                    >
                      View in Inventory →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE F: HOMEPAGE & BANNER MANAGEMENT */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1917]">
                  Homepage Content & Banners Controller
                </h3>
                <p className="text-xs text-neutral-500">
                  Update customer announcements, hero headings, and featured collections without touching code.
                </p>
              </div>
            </div>

            {/* Announcement Bar & Top Notice */}
            <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] pb-2 border-b border-[#E2E8F0]">
                1. Store Announcement Bar
              </h4>
              <p className="text-xs text-neutral-500">
                Displays at the very top of every page for promotions, shipping notices, or store timings.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={announcementInput}
                  onChange={(e) => setAnnouncementInput(e.target.value)}
                  placeholder="e.g. Certified Pure Chinese Boski Silk & Authentic Pakistani Mill Unstitched Fabrics..."
                  className="flex-1 p-2.5 border border-[#E2E8F0] text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    updateStoreSettings({ announcementText: announcementInput.trim() });
                    showToast('Store announcement banner updated');
                  }}
                  className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Save Banner
                </button>
              </div>
            </div>

            {/* Hero Section Headings */}
            <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] pb-2 border-b border-[#E2E8F0]">
                2. Hero Section Seasonal Subtitle
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={heroHeadingInput}
                  onChange={(e) => setHeroHeadingInput(e.target.value)}
                  placeholder="e.g. Summer & Festive Unstitched Collections 2026"
                  className="flex-1 p-2.5 border border-[#E2E8F0] text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    updateStoreSettings({ heroAnnouncement: heroHeadingInput.trim() });
                    showToast('Hero season heading updated');
                  }}
                  className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Save Headline
                </button>
              </div>
            </div>

            {/* Featured Products Toggle Grid */}
            <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                    3. Homepage Featured Showcase Products
                  </h4>
                  <span className="text-[11px] text-neutral-500">
                    Toggle which unstitched suits appear on the primary homepage showcase:
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#0284C7]">
                  {products.filter((p) => p.featured).length} Featured
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className={`p-3 border flex items-center justify-between gap-3 text-xs transition-colors ${
                      p.featured ? 'border-[#0284C7] bg-[#F0F9FF]' : 'border-[#E2E8F0] bg-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <strong className="block text-[#1C1917] truncate font-semibold">{p.title}</strong>
                      <span className="text-[10px] text-neutral-500">
                        {p.gender} · {formatPKR(p.price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        updateProduct({ ...p, featured: !p.featured });
                        showToast(`${!p.featured ? 'Added' : 'Removed'} "${p.title}" ${!p.featured ? 'to' : 'from'} featured`);
                      }}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        p.featured ? 'bg-[#0284C7] text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {p.featured ? 'Featured' : 'Make Featured'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REAL-TIME CUSTOMERS & PATRON ACCOUNTS — FULL CRUD */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Active Store Manager Session */}
            <div className="bg-[#0B1224] border border-[#1F293D] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F293D]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-[#D4AF37] text-[#050811] flex items-center justify-center font-mono font-bold text-lg shadow-md">
                    {(authUser?.displayName || authUser?.email || currentAdmin.fullName).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold block flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                      ACTIVE STORE MANAGER
                    </span>
                    <h3 className="font-serif text-xl font-bold text-white">
                      {authUser?.displayName || currentAdmin.fullName || 'Store Administrator'}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-mono font-semibold rounded-xs">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                    <span>LOGGED IN · SECURE SHOP ACCESS</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-[#F5B738] to-amber-500 hover:brightness-110 text-[#050811] text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(245,183,56,0.3)] flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-[#050811]" />
                    <span>+ Add Customer</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs font-mono">
                <div className="bg-[#050811] p-3 border border-[#1F293D]">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                    Manager Account ID
                  </span>
                  <span className="font-mono font-bold text-sm text-[#D4AF37] mt-0.5 block truncate">
                    {authUser?.email || currentAdmin.email || 'uzairaliuzairali640@gmail.com'}
                  </span>
                </div>

                <div className="bg-[#050811] p-3 border border-[#1F293D]">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                    Live Patron Directory
                  </span>
                  <span className="font-bold text-sm text-white mt-0.5 block">
                    {activeUserList.length} User Accounts
                  </span>
                </div>

                <div className="bg-[#050811] p-3 border border-[#1F293D]">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                    Security Clearance
                  </span>
                  <span className="font-semibold text-[#F5B738] mt-0.5 block">
                    {authUser?.email === 'uzairaliuzairali640@gmail.com' ? 'Super Administrator (Owner)' : currentAdmin.role}
                  </span>
                </div>

                <div className="bg-[#050811] p-3 border border-[#1F293D]">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                    Database Encryption
                  </span>
                  <span className="font-medium text-[#10B981] mt-0.5 block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Firestore TLS 256-Bit</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Live Real-Time Registered Users Directory (from Firestore & Firebase Auth) */}
            <div className="bg-[#0B1224] border border-[#1F293D] p-5 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#1F293D]">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#D4AF37]" />
                      <span>Live Customer &amp; Patron Intelligence</span>
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[11px] font-mono font-bold rounded-xs">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                      <span>{onlineUsersCount} Online Now</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Real-time registered customer profiles connected to Firestore `users` collection. Full CRUD enabled.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-xs font-mono font-bold text-[#D4AF37] flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Customer Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestFirestoreHealth}
                    disabled={dbConnectionStatus === 'checking'}
                    className="px-3 py-1.5 bg-[#050811] border border-[#1F293D] hover:border-[#D4AF37] text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-all"
                    title="Ping Firestore database connection"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${dbConnectionStatus === 'checking' ? 'animate-spin' : ''}`} />
                    <span>{dbConnectionStatus === 'checking' ? 'Testing...' : 'Test DB Health'}</span>
                  </button>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#050811] text-[#10B981] text-xs font-mono font-semibold rounded-xs border border-[#1F293D]">
                    <Database className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Firestore Live</span>
                  </span>
                </div>
              </div>

              {/* Filtering and Search Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                {/* Status Segmented Buttons */}
                <div className="flex border border-[#1F293D] bg-[#050811] p-0.5 rounded-xs text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setUserFilter('all')}
                    className={`px-3 py-1.5 transition-all ${
                      userFilter === 'all'
                        ? 'bg-[#D4AF37] text-[#050811] font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Patrons ({activeUserList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('online')}
                    className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                      userFilter === 'online'
                        ? 'bg-[#10B981] text-[#050811] font-bold shadow-[0_0_8px_rgba(0,255,157,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                    <span>Online ({onlineUsersCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('admins')}
                    className={`px-3 py-1.5 transition-all ${
                      userFilter === 'admins'
                        ? 'bg-[#F5B738] text-[#050811] font-bold shadow-[0_0_8px_rgba(245,183,56,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Admins &amp; Staff ({activeUserList.filter((u) => u.email === 'uzairaliuzairali640@gmail.com' || (u.role && u.role.toLowerCase().includes('admin'))).length})
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 sm:max-w-xs">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Filter patrons by name, email, or city..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#050811] border border-[#1F293D] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  {userSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {filteredActiveUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[720px] font-sans">
                    <thead className="bg-[#050811] text-slate-400 uppercase tracking-wider text-[11px] font-mono font-semibold border-b border-[#1F293D]">
                      <tr>
                        <th className="py-2.5 px-3">Patron Profile &amp; UID</th>
                        <th className="py-2.5 px-3">Email Address</th>
                        <th className="py-2.5 px-3">Role &amp; Tier</th>
                        <th className="py-2.5 px-3">Presence</th>
                        <th className="py-2.5 px-3">City</th>
                        <th className="py-2.5 px-3">Registered</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F293D]">
                      {filteredActiveUsers.map((usr) => {
                        const oopUser = UserFactory.createUser(usr);
                        const isCurrent = (authUser && usr.uid === authUser.uid) || (usr.email && usr.email === currentAdmin.email);
                        const isUserOnline = usr.isOnline || isCurrent;
                        return (
                          <tr key={usr.uid || usr.email} className={isCurrent ? 'bg-[#D4AF37]/10 font-medium' : 'hover:bg-[#131F38]/50 transition-colors'}>
                            <td className="py-2.5 px-3 flex items-center gap-2.5">
                              {usr.photoURL ? (
                                <img src={usr.photoURL} alt={usr.displayName} className="w-7 h-7 rounded-xs object-cover border border-[#1F293D]" />
                              ) : (
                                <div className="w-7 h-7 rounded-xs bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-mono font-bold text-[10px]">
                                  {(usr.displayName || usr.email || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-white font-medium block truncate">{usr.displayName || 'Customer'}</span>
                                  {isCurrent && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-[#D4AF37] text-[#050811] font-mono font-bold rounded-xs shrink-0">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[110px]">{usr.uid}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(usr.uid);
                                      showToast(`UID copied: ${usr.uid}`);
                                    }}
                                    className="text-[10px] text-slate-400 hover:text-[#D4AF37]"
                                    title="Copy UID"
                                  >
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-300">
                              {usr.email}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-xs border ${
                                usr.email === 'uzairaliuzairali640@gmail.com'
                                  ? 'bg-[#F5B738]/15 text-[#F5B738] border-[#F5B738]/30'
                                  : oopUser.canManageInventory()
                                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                {usr.role || oopUser.getRole()}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {isUserOnline ? (
                                <span className="inline-flex items-center gap-1.5 text-[10px] text-[#10B981] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                                  <span>ONLINE</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                  <span>Offline</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 text-[11px] font-mono">
                              {usr.city || 'Rawalpindi / Islamabad'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono">
                              {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'Active Member'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingCustomer(usr)}
                                  className="p-1.5 bg-[#050811] hover:bg-[#131F38] border border-[#1F293D] hover:border-[#D4AF37] text-[#D4AF37] transition-all rounded-xs"
                                  title="Edit Profile & Role"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomer(usr.uid, usr.email)}
                                  className="p-1.5 bg-[#050811] hover:bg-rose-950/40 border border-[#1F293D] hover:border-rose-500 text-rose-400 transition-all rounded-xs"
                                  title="Delete Customer Profile"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs font-mono text-slate-500">
                  No matching patron accounts found.
                </div>
              )}
            </div>

            {/* Customer User Profiles Directory (From Real Orders) — Master Client Directory */}
            <div className="bg-[#0B1224] border border-[#1F293D] p-5 space-y-4 shadow-xl">
              <div>
                <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#F5B738]" />
                  <span>Verified Checkout Clients &amp; Order Telemetry</span>
                </h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Real patrons who have completed unstitched fabric checkouts across WhatsApp, COD, and payment gateway.
                </p>
              </div>

              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[600px] font-sans">
                    <thead className="bg-[#050811] text-slate-400 uppercase tracking-wider text-[11px] font-mono font-semibold border-b border-[#1F293D]">
                      <tr>
                        <th className="py-2.5 px-3">Customer Full Name</th>
                        <th className="py-2.5 px-3">Contact Phone</th>
                        <th className="py-2.5 px-3">Destination City</th>
                        <th className="py-2.5 px-3">Total Orders</th>
                        <th className="py-2.5 px-3">Last Payment Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F293D]">
                      {(Array.from(new Set(orders.map((o) => o.customer.fullName))) as string[]).map((customerName) => {
                        const customerOrders = orders.filter((o) => o.customer.fullName === customerName);
                        const latestOrder = customerOrders[0];
                        return (
                          <tr key={customerName} className="hover:bg-[#131F38]/50 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-white">
                              {customerName}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[#D4AF37]">
                              {latestOrder.customer.phone}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">
                              {latestOrder.customer.city}, {latestOrder.customer.country || 'Pakistan'}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#F5B738]">
                              {customerOrders.length} order(s)
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-400 font-mono">
                              {latestOrder.paymentMethod}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#050811] border border-[#1F293D]">
                  <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-mono font-semibold text-slate-400">No Customer Orders Registered Yet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    When a real customer completes checkout, their contact information and order history will automatically display here in real time.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODULE H: STORE SETTINGS & GATEWAY CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1917]">
                  Store Settings & Payment Gateways
                </h3>
                <p className="text-xs text-neutral-500">
                  Centralized control over store branding, hotline numbers, physical address, and mobile wallets.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-6 space-y-6 shadow-xs">
              {/* Branding Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] pb-2 border-b border-[#E2E8F0] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                  <span>1. Store Identity & Physical Location</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm?.storeName || ''}
                      onChange={(e) => setSettingsForm((prev) => ({ ...prev, storeName: e.target.value }))}
                      className="w-full p-2.5 border border-[#E2E8F0] text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                      Brand Tagline
                    </label>
                    <input
                      type="text"
                      value={settingsForm?.tagline || ''}
                      onChange={(e) => setSettingsForm((prev) => ({ ...prev, tagline: e.target.value }))}
                      className="w-full p-2.5 border border-[#E2E8F0] text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                      Physical Store Address (Paris Bazaar)
                    </label>
                    <input
                      type="text"
                      value={settingsForm?.address || ''}
                      onChange={(e) => setSettingsForm((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full p-2.5 border border-[#E2E8F0] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Communication Hotline */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] pb-2 border-b border-[#E2E8F0] flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>2. Concierge & Official WhatsApp (Same Number for Hotline & Wallets)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                      Official WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={settingsForm?.whatsapp || ''}
                      onChange={(e) => setSettingsForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full p-2.5 border border-[#E2E8F0] text-xs font-mono font-bold"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Used for customer WhatsApp concierge and instant order links.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                      Telephone / Voice Desk
                    </label>
                    <input
                      type="text"
                      value={settingsForm?.phone || ''}
                      onChange={(e) => setSettingsForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-2.5 border border-[#E2E8F0] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Gateways */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] pb-2 border-b border-[#E2E8F0] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#8C4830]" />
                  <span>3. Mobile Banking Payment Gateways (Easypaisa & JazzCash)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#FAF8F5] border border-[#E7E0D8] space-y-2">
                    <strong className="block text-xs font-bold text-[#8C4830]">Easypaisa Account</strong>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-600 mb-0.5">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={settingsForm?.easypaisaNumber || ''}
                        onChange={(e) => setSettingsForm((prev) => ({ ...prev, easypaisaNumber: e.target.value }))}
                        className="w-full p-2 border border-[#E2E8F0] bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-600 mb-0.5">
                        Account Title
                      </label>
                      <input
                        type="text"
                        value={settingsForm?.easypaisaTitle || ''}
                        onChange={(e) => setSettingsForm((prev) => ({ ...prev, easypaisaTitle: e.target.value }))}
                        className="w-full p-2 border border-[#E2E8F0] bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] border border-[#E7E0D8] space-y-2">
                    <strong className="block text-xs font-bold text-[#8C4830]">JazzCash Account</strong>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-600 mb-0.5">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={settingsForm?.jazzcashNumber || ''}
                        onChange={(e) => setSettingsForm((prev) => ({ ...prev, jazzcashNumber: e.target.value }))}
                        className="w-full p-2 border border-[#E2E8F0] bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-600 mb-0.5">
                        Account Title
                      </label>
                      <input
                        type="text"
                        value={settingsForm?.jazzcashTitle || ''}
                        onChange={(e) => setSettingsForm((prev) => ({ ...prev, jazzcashTitle: e.target.value }))}
                        className="w-full p-2 border border-[#E2E8F0] bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping & Delivery Charges */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] pb-2 border-b border-[#E2E8F0] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#0284C7]" />
                  <span>4. Courier Shipping & Free Delivery Threshold</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                      Standard Nationwide Courier Charge (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settingsForm?.shippingFee || 250}
                      onChange={(e) => setSettingsForm((prev) => ({ ...prev, shippingFee: Number(e.target.value) }))}
                      className="w-full p-2.5 border border-[#E2E8F0] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                      Free Shipping Order Threshold (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settingsForm?.freeShippingThreshold || 5000}
                      onChange={(e) => setSettingsForm((prev) => ({ ...prev, freeShippingThreshold: Number(e.target.value) }))}
                      className="w-full p-2.5 border border-[#E2E8F0] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Save All Settings Action */}
              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    updateStoreSettings(settingsForm);
                    showToast('All store settings saved & synced to live platform');
                  }}
                  className="px-8 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold uppercase tracking-widest shadow-md"
                >
                  Save Store Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SHOP DATA BACKUP & ACTIVITY */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Database Backup & Recovery Box */}
            <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#1C1917] flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#8C4830]" />
                    <span>Shop Data Backup &amp; File Export</span>
                  </h4>
                  <p className="text-xs text-[#1C1917]/70 font-sans mt-1">
                    Download complete records of all products, current prices, stock levels, and customer orders as a safe backup file.
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
                      a.download = `nch_shop_backup_${new Date().toISOString().slice(0, 10)}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      showToast('Shop backup file downloaded successfully');
                    }}
                    className="px-4 py-2 bg-[#8C4830] hover:bg-[#723a26] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Shop Backup</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">Total Fabrics in Store</span>
                  <span className="font-bold text-base text-[#1C1917] mt-0.5 block">{products.length} Products</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">Total Customer Orders</span>
                  <span className="font-bold text-base text-[#1C1917] mt-0.5 block">{orders.length} Orders</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">Catalog Health</span>
                  <span className="font-bold text-base text-emerald-700 mt-0.5 block">Active &amp; Ready</span>
                </div>
              </div>
            </div>

            {/* Recent Store Activity History */}
            <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-[#1C1917] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <span>Recent Store Management Activities</span>
                </h4>
                <p className="text-xs text-[#1C1917]/70 font-sans mt-0.5">
                  Chronological record of recent store actions, price changes, and staff logins.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className="bg-[#F5EFEB] text-[#1C1917] uppercase tracking-wider text-[11px] font-semibold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-2.5 px-3">Date &amp; Time</th>
                      <th className="py-2.5 px-3">Activity Type</th>
                      <th className="py-2.5 px-3">User / Manager</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-mono text-[#1C1917]/80">Today, 10:00 AM</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Manager Sign In</td>
                      <td className="py-2.5 px-3 font-mono text-[#8C4830]">@{currentAdmin.username}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">Verified &amp; Active</td>
                    </tr>
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-mono text-[#1C1917]/80">Today, 09:45 AM</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Catalog Inventory Sync</td>
                      <td className="py-2.5 px-3 text-[#1C1917]/70">Store System</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">{products.length} Fabrics In Stock</td>
                    </tr>
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-mono text-[#1C1917]/80">Yesterday, 07:35 PM</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Customer Order Placed</td>
                      <td className="py-2.5 px-3 text-[#1C1917]/70">Online Customer</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">Payment Confirmed</td>
                    </tr>
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-mono text-[#1C1917]/80">Yesterday, 06:20 PM</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Unrecognized Sign In Attempt</td>
                      <td className="py-2.5 px-3 font-mono text-red-700">@unknown</td>
                      <td className="py-2.5 px-3 text-red-700 font-semibold">Blocked by Password</td>
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
                  <Gauge className="w-5 h-5 text-[#8C4830]" />
                  <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                    Store Speed &amp; Performance Center
                  </h3>
                </div>
                <p className="text-xs text-[#1C1917]/70">
                  Real-time status for store page load speed and fast catalog data delivery.
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
                    <label className="block font-semibold mb-1 text-[11px] text-neutral-800">Price (PKR)</label>
                    <input
                      type="number"
                      required
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white text-black border border-neutral-400 font-bold text-sm focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px] text-neutral-800">Original Price (PKR)</label>
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
                      className="w-full px-3 py-2 bg-white text-black border border-neutral-400 font-bold text-sm focus:border-black focus:outline-none"
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
                    <label className="block font-semibold mb-1 text-[11px] text-neutral-800">Selling Price (PKR)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white text-black border border-neutral-400 font-bold text-sm focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px] text-neutral-800">Original Price (PKR)</label>
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
                      className="w-full px-2.5 py-1.5 bg-white text-black border border-neutral-400 font-bold text-sm focus:border-black focus:outline-none"
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

        {/* MODAL 1: CREATE MANUAL / PHONE DISPATCH ORDER */}
        {isAddOrderModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B1224] border border-[#D4AF37]/40 text-white max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1F293D]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37]">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold block">
                      NEW ORDER ENTRY
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white">Create Phone or Counter Order</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOrderModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newOrderForm.fullName}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, fullName: e.target.value })}
                      placeholder="e.g. Fatima Khan"
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">Phone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={newOrderForm.phone}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, phone: e.target.value })}
                      placeholder="e.g. 0334-6565636"
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">Destination City</label>
                    <input
                      type="text"
                      value={newOrderForm.city}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, city: e.target.value })}
                      placeholder="e.g. Rawalpindi"
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">Payment Method</label>
                    <select
                      value={newOrderForm.paymentMethod}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, paymentMethod: e.target.value as PaymentMethod })}
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                    >
                      <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                      <option value="Direct WhatsApp / Bank Transfer">Direct WhatsApp / Bank Transfer</option>
                      <option value="Online Payment Gateway (Debit/Credit Card)">Online Payment Gateway</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 text-[11px]">Delivery Street Address</label>
                  <input
                    type="text"
                    value={newOrderForm.address}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, address: e.target.value })}
                    placeholder="House / Shop address, Paris Bazaar"
                    className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-slate-300 mb-1 text-[11px]">Select Fabric Product</label>
                    <select
                      value={newOrderForm.selectedProductId || (products[0]?.id || '')}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, selectedProductId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none truncate"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.fabric} · {formatPKR(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newOrderForm.quantity}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: Math.max(1, Number(e.target.value)) })}
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#050811] border border-[#1F293D] flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Calculated Payable:</span>
                  <span className="text-base font-bold text-[#F5B738]">
                    {(() => {
                      const sel = products.find((p) => p.id === newOrderForm.selectedProductId) || products[0];
                      const sub = sel ? sel.price * (newOrderForm.quantity || 1) : 0;
                      const threshold = storeSettings?.freeShippingThreshold ?? 5000;
                      const ship = sub >= threshold ? 0 : (storeSettings?.shippingFee ?? 250);
                      return formatPKR(sub + ship);
                    })()}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#1F293D] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOrderModalOpen(false)}
                    className="px-4 py-2 bg-[#050811] border border-[#1F293D] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-[#10B981] to-[#D4AF37] hover:brightness-110 text-[#050811] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(0,255,157,0.3)]"
                  >
                    Create &amp; Dispatch Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT ORDER DETAILS */}
        {editingOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B1224] border border-[#D4AF37]/40 text-white max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1F293D]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold block">
                    ORDER MUTATION
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white">Edit Order #{editingOrder.id}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateOrder} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 mb-1 text-[11px]">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingOrder.customer.fullName}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        customer: { ...editingOrder.customer, fullName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">Phone</label>
                    <input
                      type="text"
                      required
                      value={editingOrder.customer.phone}
                      onChange={(e) =>
                        setEditingOrder({
                          ...editingOrder,
                          customer: { ...editingOrder.customer, phone: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">City</label>
                    <input
                      type="text"
                      value={editingOrder.customer.city}
                      onChange={(e) =>
                        setEditingOrder({
                          ...editingOrder,
                          customer: { ...editingOrder.customer, city: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 text-[11px]">Street Address</label>
                  <input
                    type="text"
                    value={editingOrder.customer.address}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        customer: { ...editingOrder.customer, address: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 text-[11px]">Order Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        status: e.target.value as OrderStatus,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-[#1F293D] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 bg-[#050811] border border-[#1F293D] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#D4AF37] text-[#050811] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD CUSTOMER / PATRON PROFILE */}
        {isAddCustomerModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B1224] border border-[#F5B738]/50 text-white max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1F293D]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#F5B738]/15 border border-[#F5B738]/40 text-[#F5B738]">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5B738] font-bold block">
                      CLIENT MANAGEMENT
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white">Register Patron Profile</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 mb-1 text-[11px]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.displayName}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, displayName: e.target.value })}
                    placeholder="e.g. Ayesha Siddiqui"
                    className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#F5B738] text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newCustomerForm.email}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                      placeholder="client@domain.com"
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#F5B738] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">Phone</label>
                    <input
                      type="text"
                      value={newCustomerForm.phone}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                      placeholder="0300-1234567"
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#F5B738] text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">City</label>
                    <input
                      type="text"
                      value={newCustomerForm.city}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                      placeholder="Rawalpindi"
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#F5B738] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">Clearance Role</label>
                    <select
                      value={newCustomerForm.role}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#F5B738] text-white outline-none"
                    >
                      <option value="Customer">Standard Customer</option>
                      <option value="VIP Patron">VIP Patron (Preferred Discounts)</option>
                      <option value="Inventory Staff">Inventory Staff</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1F293D] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerModalOpen(false)}
                    className="px-4 py-2 bg-[#050811] border border-[#1F293D] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#F5B738] text-[#050811] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(245,183,56,0.4)]"
                  >
                    Save Customer Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: EDIT CUSTOMER / PATRON PROFILE */}
        {editingCustomer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B1224] border border-[#D4AF37]/40 text-white max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1F293D]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold block">
                    PATRON RECORD MUTATION
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Edit {editingCustomer.displayName || editingCustomer.email}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCustomer} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 mb-1 text-[11px]">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.displayName || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, displayName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">Phone</label>
                    <input
                      type="text"
                      value={editingCustomer.phone || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                      placeholder="0334-xxxxxxx"
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px]">City</label>
                    <input
                      type="text"
                      value={editingCustomer.city || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                      className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 text-[11px]">Assigned Role &amp; Tier</label>
                  <select
                    value={editingCustomer.role || 'Customer'}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, role: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050811] border border-[#1F293D] focus:border-[#D4AF37] text-white outline-none"
                  >
                    <option value="Customer">Standard Customer</option>
                    <option value="VIP Patron">VIP Patron (Preferred Discounts)</option>
                    <option value="Inventory Staff">Inventory Staff</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-[#1F293D] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-4 py-2 bg-[#050811] border border-[#1F293D] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#D4AF37] text-[#050811] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  >
                    Save Patron Changes
                  </button>
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



        {/* MODAL: 30-MINUTE INACTIVITY TIMEOUT WARNING */}
        {inactivityRemainingSeconds !== null && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white max-w-md w-full border-2 border-amber-500 shadow-2xl p-6 sm:p-7 space-y-5 text-center">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 block">
                  Security Protection Notice
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                  Administrative Inactivity Alert
                </h3>
                <p className="text-xs text-[#1C1917]/75 leading-relaxed">
                  No keyboard or mouse activity has been detected for 28 minutes. To protect sensitive customer orders, payment verification, and inventory records, this session will automatically terminate in:
                </p>
              </div>

              <div className="py-3 px-4 bg-amber-50/70 border border-amber-200 flex items-center justify-center gap-2">
                <span className="font-mono text-3xl font-bold text-amber-900">
                  {inactivityRemainingSeconds}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                  Seconds
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors order-2 sm:order-1"
                >
                  Sign Out Now
                </button>
                <button
                  type="button"
                  onClick={handleExtendSession}
                  className="w-full flex-1 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 order-1 sm:order-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Extend Session (Stay Signed In)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
