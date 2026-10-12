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
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    credits: 5000,
    costPerReply: 5,
    maxReplies: 1000,
    priceUsdMonthly: 49,
    priceUsdAnnual: 39,
    priceBdtMonthly: 5880,
    priceBdtAnnual: 4700
  },
  growth: {
    id: 'growth',
    name: 'Growth Plan',
    credits: 25000,
    costPerReply: 5,
    maxReplies: 5000,
    priceUsdMonthly: 119,
    priceUsdAnnual: 95,
    priceBdtMonthly: 14280,
    priceBdtAnnual: 11420
  },
  scale: {
    id: 'scale',
    name: 'Scale Plan',
    credits: 125000,
    costPerReply: 5,
    maxReplies: 25000,
    priceUsdMonthly: 299,
    priceUsdAnnual: 239,
    priceBdtMonthly: 35880,
    priceBdtAnnual: 28700
  },
  // Backward compatibility aliases
  trial: {
    id: 'starter',
    name: 'Starter Plan',
    credits: 5000,
    costPerReply: 5,
    maxReplies: 1000,
    priceUsdMonthly: 49,
    priceUsdAnnual: 39,
    priceBdtMonthly: 5880,
    priceBdtAnnual: 4700
  },
  standard: {
    id: 'growth',
    name: 'Growth Plan',
    credits: 25000,
    costPerReply: 5,
    maxReplies: 5000,
    priceUsdMonthly: 119,
    priceUsdAnnual: 95,
    priceBdtMonthly: 14280,
    priceBdtAnnual: 11420
  },
  pro: {
    id: 'scale',
    name: 'Scale Plan',
    credits: 125000,
    costPerReply: 5,
    maxReplies: 25000,
    priceUsdMonthly: 299,
    priceUsdAnnual: 239,
    priceBdtMonthly: 35880,
    priceBdtAnnual: 28700
  }
};

export const COST_PER_AI_REPLY = 5;
