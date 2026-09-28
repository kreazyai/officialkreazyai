// =====================================================================
// KREAZYAI PRODUCTION-READY MOCK DATA LAYER
// =====================================================================

export const initialProducts = [
  {
    id: "prod-1",
    name: "Artisan Linen Overshirt",
    sku: "KZ-LNN-01",
    category: "Apparel",
    price: 89.00,
    cost: 32.00,
    stock: 44,
    status: "in_stock",
    channels: ["whatsapp", "instagram", "facebook"],
    variants: ["Olive / M", "Olive / L", "Sand / M", "Sand / L"],
    aiKnowledge: "Crafted from 100% Normandy flax. Breathable, relaxed European fit. Pre-washed for soft handfeel.",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80",
    salesCount: 142
  },
  {
    id: "prod-2",
    name: "Minimalist Stoneware Carafe",
    sku: "KZ-CER-04",
    category: "Home & Living",
    price: 45.00,
    cost: 16.50,
    stock: 19,
    status: "in_stock",
    channels: ["instagram", "whatsapp"],
    variants: ["Matte Moss", "Earthy Sand"],
    aiKnowledge: "Hand-thrown stoneware carafe with 1.2L capacity. Dishwasher safe, heat-resistant up to 250°C.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&auto=format&fit=crop&q=80",
    salesCount: 88
  },
  {
    id: "prod-3",
    name: "Vegetable-Tanned Cardholder",
    sku: "KZ-LEA-09",
    category: "Accessories",
    price: 38.00,
    cost: 12.00,
    stock: 3,
    status: "low_stock",
    channels: ["whatsapp", "facebook", "instagram"],
    variants: ["Dark Olive", "Chestnut"],
    aiKnowledge: "Full grain Italian leather with 4 card slots and central folded cash compartment. Develops unique patina over time.",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&auto=format&fit=crop&q=80",
    salesCount: 215
  },
  {
    id: "prod-4",
    name: "Organic Botanical Eau De Parfum (50ml)",
    sku: "KZ-FRG-02",
    category: "Fragrance",
    price: 110.00,
    cost: 38.00,
    stock: 28,
    status: "in_stock",
    channels: ["whatsapp", "instagram"],
    variants: ["50ml Glass Flacon"],
    aiKnowledge: "Notes of vetiver, crushed cedar needles, and wild bergamot. Formulated with 100% organic sugarcane alcohol.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&auto=format&fit=crop&q=80",
    salesCount: 97
  },
  {
    id: "prod-5",
    name: "Woven Heavyweight Cotton Throw",
    sku: "KZ-HOM-08",
    category: "Home & Living",
    price: 74.00,
    cost: 26.00,
    stock: 0,
    status: "out_of_stock",
    channels: ["whatsapp", "facebook"],
    variants: ["Sage / Oatmeal 140x200cm"],
    aiKnowledge: "100% GOTS-certified organic ring-spun cotton. Jacquard waffle texture with fringed ends.",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&auto=format&fit=crop&q=80",
    salesCount: 64
  }
];

export const initialOrders = [
  {
    id: "KZ-1049",
    customer: {
      name: "Marcus Vance",
      email: "marcus.v@example.com",
      phone: "+1 (555) 432-8812",
      channel: "whatsapp"
    },
    items: [
      { name: "Artisan Linen Overshirt", variant: "Olive / L", quantity: 1, price: 89.00 }
    ],
    totalAmount: 89.00,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "WhatsApp Pay / Stripe",
    shippingAddress: "742 Evergreen Terrace, Portland, OR 97201",
    date: "10 minutes ago",
    aiProcessed: true,
    aiNotes: "AI collected shipping address, verified stock availability, and generated secure payment link.",
    trackingNumber: "TRK-984210"
  },
  {
    id: "KZ-1048",
    customer: {
      name: "Elena Rostova",
      email: "elena.design@example.com",
      phone: "+1 (555) 918-2234",
      channel: "instagram"
    },
    items: [
      { name: "Minimalist Stoneware Carafe", variant: "Matte Moss", quantity: 2, price: 45.00 },
      { name: "Vegetable-Tanned Cardholder", variant: "Dark Olive", quantity: 1, price: 38.00 }
    ],
    totalAmount: 128.00,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "Credit Card (Apple Pay)",
    shippingAddress: "1200 Beacon St, Brookline, MA 02446",
    date: "42 minutes ago",
    aiProcessed: true,
    aiNotes: "Customer purchased directly through Instagram DM product carousel.",
    trackingNumber: "TRK-984189"
  },
  {
    id: "KZ-1047",
    customer: {
      name: "Tariq Mansoor",
      email: "t.mansoor@example.com",
      phone: "+1 (555) 604-1188",
      channel: "whatsapp"
    },
    items: [
      { name: "Organic Botanical Eau De Parfum (50ml)", variant: "50ml Flacon", quantity: 1, price: 110.00 }
    ],
    totalAmount: 110.00,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    shippingAddress: "450 5th Ave, New York, NY 10018",
    date: "3 hours ago",
    aiProcessed: true,
    aiNotes: "AI auto-notified courier tracking updates to WhatsApp chat.",
    trackingNumber: "DHL-88301192"
  },
  {
    id: "KZ-1046",
    customer: {
      name: "Sarah Jenkins",
      email: "sarah.j@example.com",
      phone: "+1 (555) 234-9988",
      channel: "facebook"
    },
    items: [
      { name: "Artisan Linen Overshirt", variant: "Sand / M", quantity: 1, price: 89.00 }
    ],
    totalAmount: 89.00,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Stripe",
    shippingAddress: "88 Market St, San Francisco, CA 94105",
    date: "Yesterday",
    aiProcessed: true,
    aiNotes: "Delivered notification sent. AI solicited post-purchase feedback.",
    trackingNumber: "USPS-940011"
  },
  {
    id: "KZ-1045",
    customer: {
      name: "David Kim",
      email: "dkim99@example.com",
      phone: "+1 (555) 789-3321",
      channel: "instagram"
    },
    items: [
      { name: "Woven Heavyweight Cotton Throw", variant: "Sage / Oatmeal", quantity: 1, price: 74.00 }
    ],
    totalAmount: 74.00,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Credit Card",
    shippingAddress: "320 West End Ave, Chicago, IL 60611",
    date: "2 days ago",
    aiProcessed: false,
    aiNotes: "Customer cancelled prior to dispatch. Handed off to human agent to process refund.",
    trackingNumber: "N/A"
  }
];

export const initialConversations = [
  {
    id: "conv-1",
    channel: "whatsapp",
    customer: {
      name: "Marcus Vance",
      avatar: "MV",
      phone: "+1 (555) 432-8812",
      email: "marcus.v@example.com",
      ordersCount: 3,
      totalSpent: 268.00,
      tags: ["VIP", "Repeat Buyer", "WhatsApp VIP"]
    },
    unread: false,
    aiHandled: true,
    needsHuman: false,
    aiConfidence: 96,
    lastActivity: "2m ago",
    messages: [
      {
        id: "m-1",
        sender: "customer",
        text: "Hi! Does the Artisan Linen Overshirt fit true to size? I'm 6'1\", 185 lbs.",
        timestamp: "10:14 AM"
      },
      {
        id: "m-2",
        sender: "assistant",
        text: "Hello Marcus! For your height (6'1\") and weight, Size L is ideal. The Artisan Linen Overshirt has a relaxed tailored cut designed to drape comfortably without being baggy.",
        timestamp: "10:14 AM",
        aiAction: "Queried product sizing guidelines from knowledge base"
      },
      {
        id: "m-3",
        sender: "customer",
        text: "Awesome, can I order the Olive color in Size L right now through WhatsApp?",
        timestamp: "10:16 AM"
      },
      {
        id: "m-4",
        sender: "assistant",
        text: "Yes, absolutely! I've reserved the Olive in Size L for you. Your total is $89.00 with complimentary standard delivery (2-3 business days).\n\nTap below to confirm your shipping address and complete your checkout securely:",
        timestamp: "10:16 AM",
        productAttachment: {
          name: "Artisan Linen Overshirt - Olive / L",
          price: 89.00,
          sku: "KZ-LNN-01"
        },
        aiAction: "Generated one-click order link & reserved stock"
      },
      {
        id: "m-5",
        sender: "customer",
        text: "Paid! You guys are fast.",
        timestamp: "10:18 AM"
      },
      {
        id: "m-6",
        sender: "assistant",
        text: "Thank you Marcus! Order #KZ-1049 is confirmed. You'll receive live courier tracking right here as soon as it's packed.",
        timestamp: "10:18 AM",
        aiAction: "Created Order #KZ-1049 in ERP"
      }
    ]
  },
  {
    id: "conv-2",
    channel: "instagram",
    customer: {
      name: "Elena Rostova",
      avatar: "ER",
      phone: "+1 (555) 918-2234",
      email: "elena.design@example.com",
      ordersCount: 2,
      totalSpent: 180.00,
      tags: ["Interior Designer", "Instagram"]
    },
    unread: true,
    aiHandled: true,
    needsHuman: false,
    aiConfidence: 91,
    lastActivity: "15m ago",
    messages: [
      {
        id: "m-201",
        sender: "customer",
        text: "Saw your reel with the Minimalist Stoneware Carafe. Is the Matte Moss finish currently in stock?",
        timestamp: "09:40 AM"
      },
      {
        id: "m-202",
        sender: "assistant",
        text: "Hi Elena! Yes, we have 19 units of the Stoneware Carafe in Matte Moss ready for dispatch. It's priced at $45.",
        timestamp: "09:40 AM",
        aiAction: "Checked real-time catalog stock"
      },
      {
        id: "m-203",
        sender: "customer",
        text: "Can it be washed in a dishwasher?",
        timestamp: "09:43 AM"
      },
      {
        id: "m-204",
        sender: "assistant",
        text: "Yes, it is 100% dishwasher-safe and heat-resistant up to 250°C. Would you like me to reserve one or two for you?",
        timestamp: "09:43 AM"
      }
    ]
  },
  {
    id: "conv-3",
    channel: "facebook",
    customer: {
      name: "Julian Bennett",
      avatar: "JB",
      phone: "+1 (555) 302-9911",
      email: "j.bennett@example.com",
      ordersCount: 1,
      totalSpent: 89.00,
      tags: ["Support Case", "Handoff Requested"]
    },
    unread: false,
    aiHandled: false,
    needsHuman: true,
    aiConfidence: 68,
    lastActivity: "1h ago",
    messages: [
      {
        id: "m-301",
        sender: "customer",
        text: "Hello, my order #KZ-1041 arrived yesterday, but I would like to exchange it for a different color if possible.",
        timestamp: "08:15 AM"
      },
      {
        id: "m-302",
        sender: "assistant",
        text: "Hello Julian! We're happy to help with exchanges within our 14-day window. What color would you like instead?",
        timestamp: "08:15 AM"
      },
      {
        id: "m-303",
        sender: "customer",
        text: "I want to speak with a human support agent please to ensure the Sand shade matches my trousers.",
        timestamp: "08:20 AM"
      },
      {
        id: "m-304",
        sender: "assistant",
        text: "Of course! I have escalated your conversation to our team. Senior specialist Sarah will be with you shortly.",
        timestamp: "08:20 AM",
        aiAction: "Triggered Human Handoff workflow: reason='User requested human representative'"
      }
    ]
  }
];

export const initialAiConfig = {
  general: {
    assistantName: "Kreazy Concierge",
    tone: "Professional, warm, and concise",
    personality: "Knowledgeable retail concierge that mirrors customer tone and focuses on swift, helpful commerce.",
    languages: ["English", "Spanish", "French", "Arabic", "German"],
    autoTranslate: true,
    timezone: "UTC-5 (EST)",
    activeHours: "24/7 Autonomous"
  },
  knowledge: {
    businessDescription: "Kreazy Retail is a sustainable lifestyle brand specializing in premium linen apparel, stoneware home accessories, and botanical fragrance.",
    returnPolicy: "Complimentary exchanges and returns within 14 days of receipt on unwashed, unworn items with original tags attached.",
    shippingInfo: "Complimentary standard delivery on all domestic orders over $75 (2-4 business days). Express overnight shipping is available for $18.",
    paymentMethods: "WhatsApp Pay, Apple Pay, Google Pay, Visa, Mastercard, American Express, and Stripe checkout.",
    customFaqs: [
      { q: "Where are the products manufactured?", a: "Our linen garments are spun and sewn in Northern Portugal using European certified organic flax." },
      { q: "Can I cancel an order after placing it?", a: "Orders can be amended or cancelled autonomously within 60 minutes of confirmation before packaging begins." }
    ]
  },
  behavior: {
    salesStrategy: "Consultative (recommends items based on customer context)",
    maxDiscountAllowed: 10,
    offerDiscountOnHesitation: true,
    inventoryThresholdAlert: 5,
    autoCreateOrders: true,
    requireCustomerConfirmation: true
  },
  safety: {
    confidenceThreshold: 85,
    humanHandoffConditions: [
      "Customer explicitly asks for human",
      "Refund requested exceeds $150",
      "Negative sentiment detected repeatedly",
      "Product query outside catalog knowledge"
    ],
    bannedPhrases: ["guaranteed overnight", "free giveaway", "custom pricing override"],
    approvalRequiredActions: [
      "Issue refund over $50",
      "Apply custom discount above 10%",
      "Modify shipping address after carrier pickup"
    ]
  }
};

export const initialIntegrations = [
  {
    id: "whatsapp",
    name: "WhatsApp Cloud API",
    platform: "Meta WhatsApp Business",
    status: "connected",
    account: "+1 (555) 839-2041",
    lastSync: "3 minutes ago",
    badge: "Active Webhook",
    metrics: { messagesToday: 342, automatedRate: "94%" },
    description: "Automate direct sales, order receipts, product catalogs, and shipping notifications in WhatsApp."
  },
  {
    id: "instagram",
    name: "Instagram Professional",
    platform: "Meta Instagram Graph",
    status: "connected",
    account: "@kreazy_retail",
    lastSync: "Just now",
    badge: "Active Webhook",
    metrics: { messagesToday: 218, automatedRate: "91%" },
    description: "Handle DMs, story mentions, and post comment inquiries with instant AI product recommendations."
  },
  {
    id: "facebook",
    name: "Facebook Messenger",
    platform: "Meta Pages API",
    status: "connected",
    account: "Kreazy Brand Official Page",
    lastSync: "12 minutes ago",
    badge: "Active Webhook",
    metrics: { messagesToday: 89, automatedRate: "89%" },
    description: "Sync Page inquiries, catalog showcases, and order updates through Facebook Messenger."
  },
  {
    id: "shopify",
    name: "Shopify Store Sync",
    platform: "Shopify Storefront & Admin API",
    status: "connected",
    account: "kreazy-flagship.myshopify.com",
    lastSync: "18 minutes ago",
    badge: "Catalog Synced",
    metrics: { productsSynced: 48, ordersTracked: 1240 },
    description: "Bidirectional inventory, order fulfillment, and price sync across all social conversations."
  }
];

export const initialAiActivityTimeline = [
  {
    id: "act-1",
    time: "2 mins ago",
    channel: "whatsapp",
    title: "Autonomous Order Processed",
    description: "AI confirmed payment and generated Order #KZ-1049 for Marcus Vance ($89.00)",
    type: "success"
  },
  {
    id: "act-2",
    time: "15 mins ago",
    channel: "instagram",
    title: "Product Sizing Recommended",
    description: "Elena Rostova asked about Stoneware Carafe heat tolerance; AI answered from verified knowledge base",
    type: "info"
  },
  {
    id: "act-3",
    time: "48 mins ago",
    channel: "facebook",
    title: "Human Handoff Triggered",
    description: "Julian Bennett requested human assistance for color matching. Conversation escalated to inbox.",
    type: "warning"
  },
  {
    id: "act-4",
    time: "1 hour ago",
    channel: "shopify",
    title: "Catalog Stock Updated",
    description: "Synchronized stock update for Artisan Linen Overshirt (44 units remaining).",
    type: "info"
  }
];
