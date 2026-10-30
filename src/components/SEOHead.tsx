import React, { useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useShop } from '../context/ShopContext';
import { STATIC_ROUTE_SEO, getProductSEOMetadata, generateProductJSONLD, BASE_SITE_URL } from '../utils/seoData';

export const SEOHead: React.FC = () => {
  const { currentPage, productId } = useNavigation();
  const { products } = useShop();

  useEffect(() => {
    let metadata;
    let productJSONLD = null;

    if (currentPage === 'product-detail') {
      const product = products.find((p) => p.id === productId || p.slug === productId) || products[0];
      if (product) {
        metadata = getProductSEOMetadata(product);
        productJSONLD = generateProductJSONLD(product);
      } else {
        metadata = STATIC_ROUTE_SEO.shop;
      }
    } else {
      metadata = STATIC_ROUTE_SEO[currentPage] || STATIC_ROUTE_SEO.home;
    }

    // 1. Update Document Title
    document.title = metadata.title;

    // 2. Helper to set/update meta tag
    const setMetaTag = (attribute: string, key: string, content: string) => {
      let meta = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, key);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 3. Helper to set/update link tag
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // 4. Update Meta Description
    setMetaTag('name', 'description', metadata.description);

    // 5. Update Robots (Block staging/dev environments, index on production)
    const isProductionHost = 
      typeof window !== 'undefined' && 
      (window.location.hostname === 'nch.com' || window.location.hostname === 'www.nch.com' || window.location.hostname === 'niazclothhouse.com');

    const effectiveRobots = isProductionHost ? metadata.robots : 'noindex, nofollow';
    setMetaTag('name', 'robots', effectiveRobots);

    // 6. Update Canonical URL
    const canonicalFullUrl = `${BASE_SITE_URL}${metadata.canonicalPath}`;
    setLinkTag('canonical', canonicalFullUrl);

    // 7. Update Open Graph
    setMetaTag('property', 'og:title', metadata.title);
    setMetaTag('property', 'og:description', metadata.description);
    setMetaTag('property', 'og:type', metadata.ogType);
    setMetaTag('property', 'og:url', canonicalFullUrl);
    setMetaTag(
      'property',
      'og:image',
      metadata.ogImage.startsWith('http') ? metadata.ogImage : `${BASE_SITE_URL}${metadata.ogImage}`
    );

    // 8. Update Twitter Cards
    setMetaTag('name', 'twitter:title', metadata.title);
    setMetaTag('name', 'twitter:description', metadata.description);
    setMetaTag(
      'name',
      'twitter:image',
      metadata.ogImage.startsWith('http') ? metadata.ogImage : `${BASE_SITE_URL}${metadata.ogImage}`
    );

    // 9. Update or Remove Product JSON-LD
    const existingProductScript = document.getElementById('product-schema-jsonld');
    if (productJSONLD) {
      if (!existingProductScript) {
        const script = document.createElement('script');
        script.id = 'product-schema-jsonld';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(productJSONLD);
        document.head.appendChild(script);
      } else {
        existingProductScript.textContent = JSON.stringify(productJSONLD);
      }
    } else if (existingProductScript) {
      existingProductScript.remove();
    }
  }, [currentPage, productId, products]);

  return null;
};
