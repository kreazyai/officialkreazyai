/**
 * Official KreazyAI Pricing Plans and AI Credit Allowances
 * Matches the existing pricing tiers in src/components/website/PricingTiersSection.jsx
 */
export const PLAN_CONFIG = {
  FREE_TRIAL: {
    id: 'free_trial',
    name: '7-Day Free Trial',
    credits: 125,
    durationDays: 7,
    costPerReply: 5,
    maxReplies: 25,
    priceUsdMonthly: 0,
    priceBdtMonthly: 0
  },
  trial: {
    id: 'trial',
    name: 'Trial plan',
    credits: 6600,
    costPerReply: 5,
    maxReplies: 1320,
    priceUsdMonthly: 49,
    priceUsdAnnual: 39,
    priceBdtMonthly: 4999,
    priceBdtAnnual: 3999
  },
  standard: {
    id: 'standard',
    name: 'Standard plan',
    credits: 18000,
    costPerReply: 5,
    maxReplies: 3600,
    priceUsdMonthly: 119,
    priceUsdAnnual: 95,
    priceBdtMonthly: 12500,
    priceBdtAnnual: 9990
  },
  pro: {
    id: 'pro',
    name: 'Pro plan',
    credits: 40000,
    costPerReply: 5,
    maxReplies: 8000,
    priceUsdMonthly: 249,
    priceUsdAnnual: 199,
    priceBdtMonthly: 26000,
    priceBdtAnnual: 20800
  }
};

export const COST_PER_AI_REPLY = 5;
