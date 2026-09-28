/**
 * =====================================================================
 * KREAZY AI - RESPONSIVE DEVICE PREVIEW CONFIGURATION
 * =====================================================================
 * Centralized, production-grade device registry.
 * Defines physical screen dimensions, device categories, pixel ratios,
 * manufacturers, and hardware profiles.
 */

export const DEVICE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'foldables', label: 'Foldables' },
  { id: 'tablets', label: 'Tablets' },
  { id: 'smart-displays', label: 'Smart Displays' },
  { id: 'desktop', label: 'Desktop' }
];

export const DEVICES = [
  // -------------------------------------------------------------------
  // 1. MOBILE
  // -------------------------------------------------------------------
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    category: 'mobile',
    manufacturer: 'Apple',
    width: 375,
    height: 667,
    pixelRatio: 2,
    type: 'phone',
    hasNotch: false,
    hasHomeBar: true,
    description: 'Compact 4.7" retina display'
  },
  {
    id: 'iphone-16',
    name: 'iPhone 16',
    category: 'mobile',
    manufacturer: 'Apple',
    width: 393,
    height: 852,
    pixelRatio: 3,
    type: 'phone',
    hasNotch: true,
    dynamicIsland: true,
    hasHomeBar: true,
    description: '6.1" OLED with Dynamic Island'
  },
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    category: 'mobile',
    manufacturer: 'Apple',
    width: 440,
    height: 956,
    pixelRatio: 3,
    type: 'phone',
    hasNotch: true,
    dynamicIsland: true,
    hasHomeBar: true,
    description: '6.9" ProMotion flagship display'
  },
  {
    id: 'pixel-9',
    name: 'Pixel 9',
    category: 'mobile',
    manufacturer: 'Google',
    width: 412,
    height: 915,
    pixelRatio: 2.625,
    type: 'phone',
    hasCameraPinhole: true,
    description: '6.3" Actua Android display'
  },
  {
    id: 'pixel-9-pro',
    name: 'Pixel 9 Pro',
    category: 'mobile',
    manufacturer: 'Google',
    width: 412,
    height: 915,
    pixelRatio: 3,
    type: 'phone',
    hasCameraPinhole: true,
    description: '6.3" Super Actua 120Hz LTPO'
  },
  {
    id: 'pixel-10',
    name: 'Pixel 10',
    category: 'mobile',
    manufacturer: 'Google',
    width: 412,
    height: 930,
    pixelRatio: 3,
    type: 'phone',
    hasCameraPinhole: true,
    description: 'Next-gen 20.3:9 elongated canvas'
  },
  {
    id: 'samsung-galaxy-a55',
    name: 'Samsung Galaxy A55',
    category: 'mobile',
    manufacturer: 'Samsung',
    width: 384,
    height: 854,
    pixelRatio: 2.5,
    type: 'phone',
    hasCameraPinhole: true,
    description: '6.6" Super AMOLED mid-tier benchmark'
  },

  // -------------------------------------------------------------------
  // 2. FOLDABLES
  // -------------------------------------------------------------------
  {
    id: 'pixel-9-pro-fold',
    name: 'Pixel 9 Pro Fold',
    category: 'foldables',
    manufacturer: 'Google',
    width: 800,
    height: 1060,
    pixelRatio: 2.625,
    type: 'foldable',
    unfolded: true,
    description: '8.0" Super Actua Flex inner display'
  },
  {
    id: 'galaxy-z-fold-6',
    name: 'Galaxy Z Fold 6',
    category: 'foldables',
    manufacturer: 'Samsung',
    width: 768,
    height: 960,
    pixelRatio: 2.5,
    type: 'foldable',
    unfolded: true,
    description: '7.6" Dynamic AMOLED 2X square canvas'
  },

  // -------------------------------------------------------------------
  // 3. TABLETS & 2-IN-1s
  // -------------------------------------------------------------------
  {
    id: 'ipad-mini',
    name: 'iPad Mini',
    category: 'tablets',
    manufacturer: 'Apple',
    width: 768,
    height: 1024,
    pixelRatio: 2,
    type: 'tablet',
    description: '8.3" Liquid Retina compact tablet'
  },
  {
    id: 'ipad-pro-13',
    name: 'iPad Pro 13',
    category: 'tablets',
    manufacturer: 'Apple',
    width: 1024,
    height: 1366,
    pixelRatio: 2,
    type: 'tablet',
    description: '13" Ultra Retina Tandem OLED'
  },
  {
    id: 'surface-pro-10',
    name: 'Surface Pro 10',
    category: 'tablets',
    manufacturer: 'Microsoft',
    width: 912,
    height: 1368,
    pixelRatio: 2,
    type: 'tablet',
    description: '13" 3:2 PixelSense Flow display'
  },

  // -------------------------------------------------------------------
  // 4. SMART DISPLAYS
  // -------------------------------------------------------------------
  {
    id: 'nest-hub-max',
    name: 'Nest Hub Max',
    category: 'smart-displays',
    manufacturer: 'Google',
    width: 1280,
    height: 800,
    pixelRatio: 1.5,
    type: 'smart-display',
    defaultOrientation: 'landscape',
    description: '10" Smart Home touch viewport'
  },

  // -------------------------------------------------------------------
  // 5. DESKTOP
  // -------------------------------------------------------------------
  {
    id: 'desktop-sm',
    name: 'Small Desktop',
    category: 'desktop',
    manufacturer: 'Standard',
    width: 1280,
    height: 800,
    pixelRatio: 1,
    type: 'desktop',
    defaultOrientation: 'landscape',
    description: '13" Laptop viewport (1280 × 800)'
  },
  {
    id: 'desktop-standard',
    name: 'Standard Desktop',
    category: 'desktop',
    manufacturer: 'Standard',
    width: 1440,
    height: 900,
    pixelRatio: 1,
    type: 'desktop',
    defaultOrientation: 'landscape',
    description: '14" / 15" Laptop viewport (1440 × 900)'
  },
  {
    id: 'desktop-lg',
    name: 'Large Desktop',
    category: 'desktop',
    manufacturer: 'Standard',
    width: 1680,
    height: 1050,
    pixelRatio: 1,
    type: 'desktop',
    defaultOrientation: 'landscape',
    description: '24" Workstation viewport (1680 × 1050)'
  },
  {
    id: 'desktop-ultrawide',
    name: 'Ultra Wide',
    category: 'desktop',
    manufacturer: 'Standard',
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    type: 'desktop',
    defaultOrientation: 'landscape',
    description: '1080p Full HD widescreen (1920 × 1080)'
  }
];

export const DEFAULT_DEVICE_ID = 'iphone-16-pro-max';

export function getDeviceById(id) {
  if (!id) return DEVICES.find(d => d.id === DEFAULT_DEVICE_ID);
  const found = DEVICES.find(d => d.id.toLowerCase() === id.toLowerCase());
  return found || DEVICES.find(d => d.id === DEFAULT_DEVICE_ID);
}

export function filterDevices(category = 'all', query = '') {
  let list = DEVICES;
  
  if (category && category !== 'all') {
    list = list.filter(d => d.category === category);
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.manufacturer.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      `${d.width}x${d.height}`.includes(q) ||
      (d.description && d.description.toLowerCase().includes(q))
    );
  }

  return list;
}

export function getGroupedDevices(category = 'all', query = '') {
  const filtered = filterDevices(category, query);
  const groups = {};

  DEVICE_CATEGORIES.forEach(cat => {
    if (cat.id === 'all') return;
    const catDevices = filtered.filter(d => d.category === cat.id);
    if (catDevices.length > 0) {
      groups[cat.id] = {
        title: cat.label,
        devices: catDevices
      };
    }
  });

  return groups;
}
