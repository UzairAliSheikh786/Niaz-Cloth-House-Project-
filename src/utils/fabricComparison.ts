import { Product } from '../types';

export interface SeasonalSpec {
  seasonLabel: string;
  recommendedTemp: string;
  breathability: string;
  insulation: string;
  bestOccasions: string[];
  climateVerdict: string;
}

export interface CuratedComparisonPair {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  productAId: string;
  productBId: string;
}

export const CURATED_COMPARISONS: CuratedComparisonPair[] = [
  {
    id: 'boski-vs-latha',
    title: 'Pure Boski Silk vs Egyptian Latha Cotton',
    subtitle: 'Soft Chinese silk fall vs Crisp Egyptian cotton collar and cuff press.',
    badge: "Men's Summer & Festive",
    productAId: 'nch-001', // 8-Pound Boski Silk
    productBId: 'nch-002', // Egyptian Latha Cotton
  },
  {
    id: 'khaddar-vs-karandi',
    title: 'Kamalia Handloom Khaddar vs Handwoven Karandi',
    subtitle: 'Warm handspun cotton vs Silk-cotton Karandi texture for winter.',
    badge: "Men's Winter Suiting",
    productAId: 'nch-005', // Kamalia Khaddar
    productBId: 'nch-006', // Handwoven Karandi
  },
  {
    id: 'tawakkal-vs-johara',
    title: 'Tawakkal Embroidered Lawn vs Johara Luxury Chiffon',
    subtitle: 'Daytime fine lawn embroidery vs Evening pure chiffon festive suit.',
    badge: "Women's Festive Wear",
    productAId: 'nch-004', // Tawakkal
    productBId: 'nch-007', // Johara
  },
  {
    id: 'binsaeed-vs-safina',
    title: 'Bin Saeed Digital Lawn vs Safina Classic Printed',
    subtitle: 'Bin Saeed 80s lawn print vs Safina floral print for daily summer wear.',
    badge: "Women's Printed 3-Piece",
    productAId: 'nch-020', // Bin Saeed Printed
    productBId: 'nch-022', // Safina Printed
  },
];

export function getFabricSeasonalSpec(product: Product): SeasonalSpec {
  const fabricLower = (product.fabric || '').toLowerCase();
  const season = product.season || 'All Season';
  const weightCategory = product.fabricWeightCategory || 'Medium Weight';

  if (season === 'Winter' || fabricLower.includes('khaddar') || fabricLower.includes('karandi') || fabricLower.includes('pashmina') || fabricLower.includes('jacquard')) {
    if (fabricLower.includes('khaddar')) {
      return {
        seasonLabel: 'Peak Winter (November – February)',
        recommendedTemp: '5°C – 18°C',
        breathability: 'Moderate',
        insulation: 'Heavy Thermal Shield',
        bestOccasions: ['Casual Winter Wear', 'Outdoor Jummah', 'Traditional Gatherings', 'Daily Cold Weather'],
        climateVerdict: 'Dense handspun yarn traps body heat exceptionally well against Rawalpindi and Punjab winter chill.',
      };
    }
    if (fabricLower.includes('karandi')) {
      return {
        seasonLabel: 'Mid to Late Winter',
        recommendedTemp: '8°C – 22°C',
        breathability: 'Moderate',
        insulation: 'Moderate Warmth',
        bestOccasions: ['Semi-Formal Dinners', 'Family Gatherings', 'Friday Prayers', 'Winter Evenings'],
        climateVerdict: 'Raw silk slubs combined with twisted cotton yarn provide comfortable thermal retention without excessive weight.',
      };
    }
    return {
      seasonLabel: 'Winter & Festive Season',
      recommendedTemp: '8°C – 20°C',
      breathability: 'Moderate',
      insulation: 'Moderate Warmth',
      bestOccasions: ['Winter Weddings', 'Evening Banquets', 'Formal Receptions'],
      climateVerdict: 'Rich structural weave creates an insulated barrier suited for chilly indoor and marquee gatherings.',
    };
  }

  if (season === 'Summer' || fabricLower.includes('lawn') || fabricLower.includes('latha') || fabricLower.includes('voile') || fabricLower.includes('chiffon')) {
    if (fabricLower.includes('latha')) {
      return {
        seasonLabel: 'Peak Summer (April – September)',
        recommendedTemp: '30°C – 45°C',
        breathability: 'Very High',
        insulation: 'Cooling / Airy',
        bestOccasions: ['Executive Daytime Wear', 'Daily Jummah Prayers', 'Formal Summer Gatherings'],
        climateVerdict: 'Long-staple Egyptian cotton absorbs perspiration rapidly while holding a crisp, starched collar line under scorching heat.',
      };
    }
    if (fabricLower.includes('lawn')) {
      return {
        seasonLabel: 'High Summer & Monsoons',
        recommendedTemp: '28°C – 44°C',
        breathability: 'Very High',
        insulation: 'Cooling / Airy',
        bestOccasions: ['Daily Wear', 'Festive Eid Mornings', 'Outdoor Daytime Functions'],
        climateVerdict: 'Fine 80s yarn allows maximum airflow and rapid heat dissipation, making it Pakistan’s premier summer choice.',
      };
    }
    if (fabricLower.includes('chiffon') || fabricLower.includes('voile')) {
      return {
        seasonLabel: 'Summer Evenings & Festive',
        recommendedTemp: '26°C – 38°C',
        breathability: 'Very High',
        insulation: 'Cooling / Airy',
        bestOccasions: ['Summer Weddings', 'Mehndi & Mayun Functions', 'Festive Dinners'],
        climateVerdict: 'Ultra-light sheer drape provides effortless movement and breathability during humid summer celebrations.',
      };
    }
    return {
      seasonLabel: 'Summer & Warm Weather',
      recommendedTemp: '28°C – 42°C',
      breathability: 'High',
      insulation: 'Cooling / Airy',
      bestOccasions: ['Daytime Casual', 'Summer Travel', 'Daily Functions'],
      climateVerdict: 'Breathable weave structure keeps the skin aerated in dry or humid summer conditions.',
    };
  }

  // All Season / Boski Silk
  if (fabricLower.includes('boski') || season === 'All Season') {
    return {
      seasonLabel: 'All Season (Spring, Summer & Winter Evenings)',
      recommendedTemp: '16°C – 34°C',
      breathability: 'High',
      insulation: 'Comfortable & Light',
      bestOccasions: ['Weddings & Baraat', 'Eid Prayers', 'Jummah Prayers', 'Special Family Gatherings'],
      climateVerdict: 'Pure Chinese spun silk keeps you cool in warm weather and comfortable in air-conditioned halls or mild winter.',
    };
  }

  return {
    seasonLabel: 'All Season & Daily Wear',
    recommendedTemp: '20°C – 32°C',
    breathability: 'High',
    insulation: 'Light & Breathable',
    bestOccasions: ['Everyday Suiting', 'Office & Daily Wear'],
    climateVerdict: 'Comfortable balanced cloth suitable for everyday wear in Pakistani weather.',
  };
}

export function generateComparisonVerdict(productA: Product, productB: Product): string {
  const priceDiff = Math.abs(productA.price - productB.price);
  const diffPercent = Math.round((priceDiff / Math.min(productA.price, productB.price)) * 100);
  const moreExpensive = productA.price >= productB.price ? productA : productB;
  const lessExpensive = productA.price < productB.price ? productA : productB;

  const specA = getFabricSeasonalSpec(productA);
  const specB = getFabricSeasonalSpec(productB);

  // If both have different seasonal profiles
  if (productA.season !== productB.season) {
    return `Different weather suitability: ${productA.title} is designed for ${productA.season || 'All Season'} wear (${specA.recommendedTemp}), while ${productB.title} is designed for ${productB.season || 'All Season'} wear (${specB.recommendedTemp}).`;
  }

  // Same season comparison
  if (priceDiff === 0) {
    return `Both fabrics have the same price of ₨ ${productA.price.toLocaleString('en-PK')}. Choose based on your feel: ${productA.fabric} gives ${productA.weaveType || 'a traditional feel'}, while ${productB.fabric} offers ${productB.weaveType || 'its own distinct texture'}.`;
  }

  return `${moreExpensive.title} is ₨ ${priceDiff.toLocaleString('en-PK')} higher than ${lessExpensive.title}. Both are 100% original unstitched fabrics made for ${productA.season || 'Pakistani weather'}.`;
}
