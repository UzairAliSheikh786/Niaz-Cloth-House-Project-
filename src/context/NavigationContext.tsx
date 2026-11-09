import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS } from '../data/products';
import { Product } from '../types';

export type PageRoute = 
  | 'home' 
  | 'shop'
  | 'men-summer'
  | 'men-winter'
  | 'women-summer'
  | 'women-winter'
  | 'location'
  | 'product-detail' 
  | 'admin'
  | 'compare'
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'refund'
  | 'not-found';

export interface NavFilterParams {
  gender?: string;
  fabric?: string;
  category?: string;
  season?: string;
  fabricWeight?: string;
  threadCount?: string;
  weaveType?: string;
  brand?: string;
  craftType?: string;
  search?: string;
  favoritesOnly?: boolean;
  newArrivalsOnly?: boolean;
  saleOnly?: boolean;
}

interface NavigationContextType {
  currentPage: PageRoute;
  productId: string | null;
  navigateTo: (
    page: PageRoute, 
    params?: { 
      id?: string; 
      slug?: string;
      category?: string; 
      fabric?: string; 
      gender?: string; 
      season?: string;
      fabricWeight?: string;
      threadCount?: string;
      weaveType?: string;
      brand?: string;
      craftType?: string;
      search?: string;
      favoritesOnly?: boolean;
      newArrivalsOnly?: boolean;
      saleOnly?: boolean;
    }
  ) => void;
  filterParams: NavFilterParams;
  isMapAgentOpen: boolean;
  setIsMapAgentOpen: (open: boolean) => void;
  is3DInspectorOpen: boolean;
  setIs3DInspectorOpen: (open: boolean) => void;
  inspectorProduct: Product | null;
  open3DInspector: (product?: Product | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const parseCurrentUrl = () => {
    const path = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    let id = search.get('id');
    const slugParam = search.get('slug');
    const gender = search.get('gender') || undefined;
    const fabric = search.get('fabric') || undefined;
    const category = search.get('category') || undefined;
    const season = search.get('season') || undefined;
    const fabricWeight = search.get('fabricWeight') || search.get('weight') || undefined;
    const threadCount = search.get('threadCount') || search.get('thread') || undefined;
    const weaveType = search.get('weaveType') || search.get('weave') || undefined;
    const brand = search.get('brand') || undefined;
    const craftType = search.get('craftType') || search.get('craft') || undefined;
    const searchQuery = search.get('search') || search.get('q') || undefined;

    let page: PageRoute = 'home';

    if (path.startsWith('/product/') || path.includes('/product-detail') || id || slugParam) {
      page = 'product-detail';
      if (path.startsWith('/product/')) {
        const slug = path.replace('/product/', '').replace('.html', '').split('/')[0];
        const match = INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
        if (match) id = match.id;
      } else if (slugParam) {
        const match = INITIAL_PRODUCTS.find((p) => p.slug === slugParam || p.id === slugParam);
        if (match) id = match.id;
      }
    } else if (path.includes('privacy')) {
      page = 'privacy';
    } else if (path.includes('terms') || path.includes('condition')) {
      page = 'terms';
    } else if (path.includes('cookie')) {
      page = 'cookies';
    } else if (path.includes('refund') || path.includes('return')) {
      page = 'refund';
    } else if (path.includes('admin')) {
      page = 'admin';
    } else if (path.includes('compare')) {
      page = 'compare';
    } else if (path.includes('location') || path.includes('map') || path.includes('directions')) {
      page = 'location';
    } else if (path.includes('studio') || path.includes('3d')) {
      page = 'shop';
    } else if (path.includes('men-summer')) {
      page = 'men-summer';
    } else if (path.includes('men-winter')) {
      page = 'men-winter';
    } else if (path.includes('women-summer')) {
      page = 'women-summer';
    } else if (path.includes('women-winter')) {
      page = 'women-winter';
    } else if (path.includes('summer')) {
      page = 'men-summer';
    } else if (path.includes('winter')) {
      page = 'men-winter';
    } else if (path.includes('shop') || path.includes('catalog')) {
      page = 'shop';
    } else if (path === '/' || path === '' || path === '/index.html' || path === '/home') {
      page = 'home';
    } else {
      page = 'not-found';
    }

    return { 
      page, 
      id: id || 'nch-001', 
      filters: { 
        gender, 
        fabric, 
        category, 
        season,
        fabricWeight,
        threadCount,
        weaveType,
        brand,
        craftType,
        search: searchQuery
      } 
    };
  };

  const initial = parseCurrentUrl();
  const [currentPage, setCurrentPage] = useState<PageRoute>(initial.page);
  const [productId, setProductId] = useState<string | null>(initial.id || 'nch-001');
  const [filterParams, setFilterParams] = useState<NavFilterParams>(initial.filters);
  const [isMapAgentOpen, setIsMapAgentOpen] = useState(false);
  const [is3DInspectorOpen, setIs3DInspectorOpen] = useState(false);
  const [inspectorProduct, setInspectorProduct] = useState<Product | null>(null);

  const open3DInspector = (product?: Product | null) => {
    if (product) setInspectorProduct(product);
    setIs3DInspectorOpen(true);
  };

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseCurrentUrl();
      setCurrentPage(parsed.page);
      if (parsed.id) setProductId(parsed.id);
      setFilterParams(parsed.filters);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (
    page: PageRoute,
    params?: NavFilterParams & { 
      id?: string; 
      slug?: string;
    }
  ) => {
    setCurrentPage(page);
    let resolvedId = params?.id;
    if (params?.slug) {
      const match = INITIAL_PRODUCTS.find((p) => p.slug === params.slug || p.id === params.slug);
      if (match) resolvedId = match.id;
    }
    if (resolvedId) {
      setProductId(resolvedId);
    }
    if (params) {
      setFilterParams({
        gender: params.gender,
        fabric: params.fabric,
        category: params.category,
        season: params.season,
        fabricWeight: params.fabricWeight,
        threadCount: params.threadCount,
        weaveType: params.weaveType,
        brand: params.brand,
        craftType: params.craftType,
        search: params.search,
        favoritesOnly: params.favoritesOnly,
        newArrivalsOnly: params.newArrivalsOnly,
        saleOnly: params.saleOnly,
      });
    } else {
      setFilterParams({});
    }

    // Build SEO-friendly canonical URL for browser address bar
    let path = '/';
    const query = new URLSearchParams();

    if (page === 'home') {
      path = '/';
    } else if (page === 'men-summer') {
      path = '/collections/men-summer';
    } else if (page === 'men-winter') {
      path = '/collections/men-winter';
    } else if (page === 'women-summer') {
      path = '/collections/women-summer';
    } else if (page === 'women-winter') {
      path = '/collections/women-winter';
    } else if (page === 'location') {
      path = '/location';
    } else if (page === 'shop') {
      path = '/shop';
      if (params?.gender) query.set('gender', params.gender);
      if (params?.fabric) query.set('fabric', params.fabric);
      if (params?.category) query.set('category', params.category);
      if (params?.season) query.set('season', params.season);
      if (params?.fabricWeight) query.set('fabricWeight', params.fabricWeight);
      if (params?.threadCount) query.set('threadCount', params.threadCount);
      if (params?.weaveType) query.set('weaveType', params.weaveType);
      if (params?.search) query.set('search', params.search);
    } else if (page === 'product-detail') {
      const targetId = resolvedId || productId || 'nch-001';
      const targetProduct = INITIAL_PRODUCTS.find((p) => p.id === targetId || p.slug === targetId);
      path = targetProduct ? `/product/${targetProduct.slug}` : `/product/${targetId}`;
    } else if (page === 'admin') {
      path = '/admin';
    } else if (page === 'compare') {
      path = '/compare';
    } else if (page === 'privacy') {
      path = '/privacy-policy';
    } else if (page === 'terms') {
      path = '/terms-and-conditions';
    } else if (page === 'cookies') {
      path = '/cookie-policy';
    } else if (page === 'refund') {
      path = '/refund-policy';
    }

    const queryString = query.toString();
    const fullUrl = queryString ? `${path}?${queryString}` : path;

    try {
      window.history.pushState({ page, params }, '', fullUrl);
    } catch {
      // In restricted iframe environments fallback
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        productId,
        navigateTo,
        filterParams,
        isMapAgentOpen,
        setIsMapAgentOpen,
        is3DInspectorOpen,
        setIs3DInspectorOpen,
        inspectorProduct,
        open3DInspector,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
