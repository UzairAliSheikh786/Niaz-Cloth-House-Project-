import { Product } from '../types';

export const BASE_SITE_URL = 'https://nch.com';

export interface SEOPageMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  ogType: 'website' | 'article' | 'product';
  ogImage: string;
  robots: string;
  keywords: string[];
  breadcrumbs: Array<{ name: string; path: string }>;
}

export const STATIC_ROUTE_SEO: Record<string, SEOPageMetadata> = {
  home: {
    title: 'Niaz Cloth House | Authentic Pakistani Unstitched Fabrics Since 1977',
    description: 'Shop genuine Pakistani unstitched suits and luxury fabrics since 1977. 100% pure Chinese Boski silk, Egyptian Giza cotton Latha, Kamalia Khaddar, and designer lawn at 170 Paris Bazaar, Rawalpindi.',
    canonicalPath: '/',
    ogType: 'website',
    ogImage: '/src/assets/images/hero_niaz_luxury_fabric_1791569218384.jpg',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    keywords: [
      'Pakistani unstitched suits',
      'pure Boski silk Rawalpindi',
      'Egyptian cotton Latha',
      'Kamalia handloom khaddar',
      'unstitched fabric store Pakistan',
      'Paris Bazaar Rawalpindi cloth house',
      'men unstitched shalwar kameez fabric',
      'women 3-piece unstitched lawn'
    ],
    breadcrumbs: [{ name: 'Home', path: '/' }],
  },
  'men-summer': {
    title: 'Men’s Summer Unstitched Fabrics | Pure Boski & Egyptian Latha Cotton - Niaz Cloth House',
    description: 'Explore premium men’s summer unstitched fabrics in Pakistan. Single-origin Egyptian Giza Latha (Super 120s/140s) and breathable 6-pound pure Chinese Boski silk. 4.5m cuts on 54" double width.',
    canonicalPath: '/collections/men-summer',
    ogType: 'website',
    ogImage: '/src/assets/images/product_mens_latha_cotton_1791569254348.jpg',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    keywords: [
      'men summer unstitched fabric',
      'Egyptian Giza cotton latha',
      'pure summer Boski silk',
      'men unstitched lawn cotton',
      'Pakistani men summer shalwar kameez',
      'white latha cotton Pakistan'
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Collections', path: '/shop' },
      { name: 'Men’s Summer Collection', path: '/collections/men-summer' },
    ],
  },
  'men-winter': {
    title: 'Men’s Winter Unstitched Suiting | Kamalia Khaddar & Heavy Karandi - Niaz Cloth House',
    description: 'Discover authentic Pakistani winter unstitched fabrics. Pure handloom Kamalia Khaddar, raw silk-cotton Karandi, and heavyweight 10-pound collector Boski silk. Full generous cuts.',
    canonicalPath: '/collections/men-winter',
    ogType: 'website',
    ogImage: '/src/assets/images/khaadi_mens_boski_display_1791657195697.jpg',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    keywords: [
      'men winter unstitched suiting',
      'Kamalia handloom khaddar',
      'handloom raw karandi',
      '10 pound gold seal Boski',
      'winter shalwar kameez fabric Pakistan',
      'heavy unstitched cloth men'
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Collections', path: '/shop' },
      { name: 'Men’s Winter Collection', path: '/collections/men-winter' },
    ],
  },
  'women-summer': {
    title: 'Women’s Summer Lawn & Chiffon | 3-Piece Designer Unstitched Suits - Niaz Cloth House',
    description: 'Shop luxury 3-piece unstitched summer lawn suits with pure crinkle chiffon and silk dupattas. 80s combed lawn, Swiss voile schiffli, and pastel tone-on-tone embroidery.',
    canonicalPath: '/collections/women-summer',
    ogType: 'website',
    ogImage: '/src/assets/images/product_womens_lawn_chiffon_1791569231005.jpg',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    keywords: [
      'women summer unstitched lawn 3 piece',
      'pure chiffon dupatta suit',
      'Swiss voile schiffli Pakistan',
      'designer unstitched suits Rawalpindi',
      'luxury summer lawn 2026'
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Collections', path: '/shop' },
      { name: 'Women’s Summer Collection', path: '/collections/women-summer' },
    ],
  },
  'women-winter': {
    title: 'Women’s Winter Unstitched Suits | Kashmiri Pashmina Shawls & Khaddar - Niaz Cloth House',
    description: 'Shop premium women’s winter unstitched 3-piece ensembles featuring authentic Kashmiri pashmina wool shawls, heavy Kamalia khaddar, and handloom karandi shirts.',
    canonicalPath: '/collections/women-winter',
    ogType: 'website',
    ogImage: '/src/assets/images/product_womens_lawn_chiffon_1791569231005.jpg',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    keywords: [
      'women winter unstitched suits',
      'Kashmiri pashmina shawl suit',
      'women winter khaddar 3 piece',
      'embroidered wool shawl suit Pakistan',
      'warm unstitched dresses'
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Collections', path: '/shop' },
      { name: 'Women’s Winter Collection', path: '/collections/women-winter' },
    ],
  },
  shop: {
    title: 'All Unstitched Fabrics Catalog | Men’s & Women’s Pakistani Suits - Niaz Cloth House',
    description: 'Browse the complete unstitched fabric collection at Niaz Cloth House. Filter by season, pure silk, Egyptian cotton, Kamalia khaddar, thread count, and weave. Genuine quality guaranteed.',
    canonicalPath: '/shop',
    ogType: 'website',
    ogImage: '/src/assets/images/hero_niaz_luxury_fabric_1791569218384.jpg',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    keywords: [
      'unstitched fabric catalog Pakistan',
      'buy Boski silk online',
      'Egyptian cotton latha price',
      'unstitched 3 piece suits',
      'Pakistani fabric shop online'
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'All Unstitched Fabrics', path: '/shop' },
    ],
  },
  location: {
    title: 'Visit 170 Paris Bazaar Shop Rawalpindi | Store Hours & Directions - Niaz Cloth House',
    description: 'Visit Niaz Cloth House at Shop #170 Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi. Monday to Sunday 10am-9pm. Authentic Boski silk, Egyptian Latha, and unstitched suits.',
    canonicalPath: '/location',
    ogType: 'website',
    ogImage: '/src/assets/images/hero_niaz_luxury_fabric_1791569218384.jpg',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    keywords: [
      'Niaz Cloth House Paris Bazaar Rawalpindi',
      'Moti Bazar fabric shop',
      'Committee Chowk Rawalpindi cloth market',
      'Boski silk shop Rawalpindi',
      'Niaz cloth house store hours Sunday open'
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Store Location & Timings', path: '/location' },
    ],
  },
  privacy: {
    title: 'Privacy Policy & DPDP Act Compliance | Niaz Cloth House',
    description: 'Read the Niaz Cloth House Privacy Policy. Certified DPDP Act compliant: transparent customer data processing, zero third-party data sales, and SSL-encrypted transactions.',
    canonicalPath: '/privacy-policy',
    ogType: 'article',
    ogImage: '/src/assets/images/hero_niaz_luxury_fabric_1791569218384.jpg',
    robots: 'index, follow',
    keywords: ['Niaz Cloth House privacy policy', 'DPDP Act Pakistan compliance', 'customer data security'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy-policy' },
    ],
  },
  terms: {
    title: 'Terms & Conditions of Sale | Niaz Cloth House',
    description: 'Review our terms of sale, fabric pre-shrinking guidelines (Tarr-Karna), payment options, and courier dispatch timeline.',
    canonicalPath: '/terms-and-conditions',
    ogType: 'article',
    ogImage: '/src/assets/images/hero_niaz_luxury_fabric_1791569218384.jpg',
    robots: 'index, follow',
    keywords: ['terms and conditions Niaz Cloth House', 'unstitched fabric terms', 'Pakistan online store policy'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Terms & Conditions', path: '/terms-and-conditions' },
    ],
  },
  cookies: {
    title: 'Cookies Policy & Consent Preferences | Niaz Cloth House',
    description: 'Learn how Niaz Cloth House uses strictly necessary and preference cookies. We use zero invasive third-party ad trackers. Manage your cookie consent choices.',
    canonicalPath: '/cookie-policy',
    ogType: 'article',
    ogImage: '/src/assets/images/hero_niaz_luxury_fabric_1791569218384.jpg',
    robots: 'index, follow',
    keywords: ['cookie policy Niaz Cloth House', 'cookie preferences', 'privacy consent'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Cookies Policy', path: '/cookie-policy' },
    ],
  },
  refund: {
    title: 'Fabric Order & Delivery Terms | Niaz Cloth House',
    description: 'Our customer promise: authentic custom-cut Pakistani unstitched fabrics with careful packaging, fast dispatch, and direct WhatsApp assistance.',
    canonicalPath: '/refund-policy',
    ogType: 'article',
    ogImage: '/src/assets/images/hero_niaz_luxury_fabric_1791569218384.jpg',
    robots: 'index, follow',
    keywords: ['fabric order terms Niaz Cloth House', 'unstitched fabric dispatch', 'order policy Pakistan'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Order & Delivery Policy', path: '/refund-policy' },
    ],
  },
  admin: {
    title: 'Staff Administration & Inventory Portal | Niaz Cloth House',
    description: 'Authorized store management portal for inventory, stock updates, orders, and security audit logs.',
    canonicalPath: '/admin',
    ogType: 'website',
    ogImage: '/src/assets/images/hero_niaz_luxury_fabric_1791569218384.jpg',
    robots: 'noindex, nofollow',
    keywords: ['admin'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Admin Portal', path: '/admin' },
    ],
  },
  compare: {
    title: 'Compare Unstitched Fabrics Side-by-Side | Niaz Cloth House',
    description: 'Compare two Pakistani unstitched fabrics side-by-side. Inspect prices, seasonal usage, breathability, suit length, and weave details before ordering.',
    canonicalPath: '/compare',
    ogType: 'website',
    ogImage: '/src/assets/images/hero_niaz_luxury_fabric_1791569218384.jpg',
    robots: 'index, follow',
    keywords: ['compare fabrics Pakistan', 'Boski silk vs Latha cotton', 'Kamalia khaddar vs Karandi', 'unstitched suit comparison'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Compare Fabrics', path: '/compare' },
    ],
  },
};

export function getProductSEOMetadata(product: Product): SEOPageMetadata {
  const collectionPath =
    product.gender === 'Men'
      ? product.season === 'Summer'
        ? '/collections/men-summer'
        : '/collections/men-winter'
      : product.season === 'Summer'
      ? '/collections/women-summer'
      : '/collections/women-winter';

  const collectionName = `${product.gender}’s ${product.season} Collection`;

  const cutSummary = `${product.cutDetails.length} on ${product.cutDetails.width}`;
  const priceFormatted = `PKR ${product.price.toLocaleString()}`;

  const description = `${product.title} - Authentic unstitched Pakistani suiting in ${product.fabric}. Genuine ${cutSummary}. Available for ${priceFormatted}. 100% pure fabric guaranteed. Worldwide shipping.`;

  return {
    title: `${product.title} | ${product.fabric} Unstitched Suit - Niaz Cloth House`,
    description,
    canonicalPath: `/product/${product.slug}`,
    ogType: 'product',
    ogImage: product.primaryImage,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    keywords: [
      product.title,
      `${product.fabric} unstitched Pakistan`,
      `${product.gender} unstitched ${product.fabric.toLowerCase()}`,
      `buy ${product.title} online`,
      'Niaz Cloth House Rawalpindi',
      cutSummary,
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Shop All', path: '/shop' },
      { name: collectionName, path: collectionPath },
      { name: product.title, path: `/product/${product.slug}` },
    ],
  };
}

export function generateProductJSONLD(product: Product) {
  const productUrl = `${BASE_SITE_URL}/product/${product.slug}`;
  const images = [
    product.primaryImage.startsWith('http') ? product.primaryImage : `${BASE_SITE_URL}${product.primaryImage}`,
    ...(product.galleryImages || []).map((img) => (img.startsWith('http') ? img : `${BASE_SITE_URL}${img}`)),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: images,
    description: product.description,
    sku: product.id,
    mpn: `NCH-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Niaz Cloth House',
    },
    category: `${product.gender} > Unstitched > ${product.fabric}`,
    material: product.fabric,
    color: product.color,
    pattern: product.weaveType || 'Traditional Weave',
    countryOfOrigin: 'PK',
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Cut Length',
        value: product.cutDetails.length,
      },
      {
        '@type': 'PropertyValue',
        name: 'Fabric Width',
        value: product.cutDetails.width,
      },
      ...(product.cutDetails.suitPieces && product.cutDetails.suitPieces.length > 0
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Included Suit Pieces',
              value: product.cutDetails.suitPieces.join(', '),
            },
          ]
        : []),
      ...(product.weightGrade
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Fabric Weight Grade',
              value: product.weightGrade,
            },
          ]
        : []),
      ...(product.threadCount
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Thread Count',
              value: product.threadCount,
            },
          ]
        : []),
    ],
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'PKR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'ClothingStore',
        name: 'Niaz Cloth House',
        telephone: '+92-334-6565636',
        url: BASE_SITE_URL,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'PKR',
        },
        shippingDestination: [
          {
            '@type': 'DefinedRegion',
            addressCountry: 'PK',
          },
          {
            '@type': 'DefinedRegion',
            addressCountry: 'GB',
          },
          {
            '@type': 'DefinedRegion',
            addressCountry: 'US',
          },
        ],
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
      bestRating: '5',
      worstRating: '1',
    },
  };
}

export function generateBreadcrumbsJSONLD(breadcrumbs: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.path.startsWith('http') ? crumb.path : `${BASE_SITE_URL}${crumb.path}`,
    })),
  };
}
