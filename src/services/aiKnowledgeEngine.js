// =====================================================================
// KREAZYAI MULTI-PURPOSE KNOWLEDGE-TO-ACTION REASONING ENGINE
// =====================================================================
// Conforms to Phase 8, 9, 10, 11 Specifications:
// Modular Knowledge Schema -> Intent -> Entity Reasoning -> Safe Action Synthesis

import { productService, aiConfigService, customerCrmService, orderService } from './api.js';

export const AI_INTENTS = {
  GREETING: 'GREETING',
  PRODUCT_INQUIRY: 'PRODUCT_INQUIRY',
  PRODUCT_AVAILABILITY: 'PRODUCT_AVAILABILITY',
  PRICING_INQUIRY: 'PRICING_INQUIRY',
  DISCOUNT_REQUEST: 'DISCOUNT_REQUEST',
  PURCHASE_INTENT: 'PURCHASE_INTENT',
  RETURN_POLICY: 'RETURN_POLICY',
  SHIPPING_INQUIRY: 'SHIPPING_INQUIRY',
  ORDER_STATUS: 'ORDER_STATUS',
  HUMAN_ESCALATION: 'HUMAN_ESCALATION',
  UNKNOWN: 'UNKNOWN'
};

export class AiKnowledgeEngine {
  /**
   * Main cognitive pipeline:
   * Input Text -> Structured Knowledge Retrieval -> Reasoning -> Action Output
   */
  static async processMessage(userMessage, context = {}) {
    const rawText = (userMessage || '').trim();
    const lowerText = rawText.toLowerCase();

    // 1. Fetch live ground truth data
    const [products, config, orders] = await Promise.all([
      productService.getAll(),
      aiConfigService.getConfig(),
      orderService.getAll()
    ]);

    // 2. Classify Intent
    const intent = this.classifyIntent(lowerText);

    // 3. Extract Entities (Products, Colors, Sizes, Numbers)
    const entities = this.extractEntities(lowerText, products);

    // 4. Resolve Domain Reasoning
    switch (intent) {
      case AI_INTENTS.GREETING:
        return {
          intent,
          reply: `Hello! Welcome to ${config?.general?.assistantName || 'Kreazy AI'}. I can help you check real-time stock, sizing, return policies, or place an order directly. What are you looking for today?`,
          confidence: 99,
          source: 'Brand Persona Engine',
          action: null
        };

      case AI_INTENTS.HUMAN_ESCALATION:
        return {
          intent,
          reply: `I understand your request. I am immediately alerting our store manager to take over this conversation. A member of our customer care team will join shortly.`,
          confidence: 98,
          source: 'Escalation Policy',
          action: {
            type: 'ESCALATE_TO_HUMAN',
            reason: 'User requested human operator or complex issue flagged'
          }
        };

      case AI_INTENTS.RETURN_POLICY: {
        const returnDays = config?.knowledge?.returnDays || '14';
        const returnPolicyText = config?.knowledge?.returnPolicy || 
          `We offer hassle-free exchanges and returns within ${returnDays} days of delivery on unused items with tags attached.`;
        return {
          intent,
          reply: `${returnPolicyText} Would you like me to look up a past order to begin a return or exchange?`,
          confidence: 96,
          source: 'Store Policy Knowledge (Grounding)',
          action: null
        };
      }

      case AI_INTENTS.SHIPPING_INQUIRY: {
        const shippingInfo = config?.knowledge?.shippingInfo || 
          "Standard delivery arrives in 2-4 business days (complimentary on orders over $75). Express overnight delivery is available for $18.";
        return {
          intent,
          reply: `${shippingInfo} All shipments include live tracking updates via WhatsApp.`,
          confidence: 97,
          source: 'Fulfillment & Logistics Knowledge',
          action: null
        };
      }

      case AI_INTENTS.DISCOUNT_REQUEST: {
        const maxAllowed = parseInt(config?.safety?.maxDiscount || '10', 10);
        return {
          intent,
          reply: `I can offer you an approved welcome discount of ${maxAllowed}% on your order today! Use coupon code KREAZY${maxAllowed} at checkout, or I can apply it directly to your cart right now.`,
          confidence: 93,
          source: 'Discount Guardrail Rules',
          action: {
            type: 'APPLY_DISCOUNT',
            discountPercent: maxAllowed,
            code: `KREAZY${maxAllowed}`
          }
        };
      }

      case AI_INTENTS.PRODUCT_INQUIRY:
      case AI_INTENTS.PRODUCT_AVAILABILITY: {
        const matched = entities.matchedProduct;
        if (matched) {
          const inStock = matched.stock > 0;
          const variantsText = Array.isArray(matched.variants) ? matched.variants.join(', ') : matched.variants;
          const knowledgeExtra = matched.aiKnowledge ? ` Note: ${matched.aiKnowledge}` : '';
          return {
            intent,
            reply: `Yes! "${matched.name}" is currently ${inStock ? `in stock (${matched.stock} units available)` : 'temporarily out of stock'}. Priced at $${matched.price.toFixed(2)}. Available variants/sizes: [${variantsText}].${knowledgeExtra} Would you like to reserve one?`,
            confidence: 97,
            source: `Live Product Catalog (SKU: ${matched.sku})`,
            matchedProduct: matched,
            action: inStock ? {
              type: 'SUGGEST_PURCHASE',
              productId: matched.id,
              productName: matched.name,
              price: matched.price
            } : null
          };
        }

        // Generic catalog recommendation
        const topProduct = products[0] || { name: 'Artisan Linen Overshirt', price: 89.00 };
        return {
          intent,
          reply: `We have several popular items in stock, including our bestselling "${topProduct.name}" ($${Number(topProduct.price).toFixed(2)}). Are you looking for apparel, accessories, or footwear?`,
          confidence: 91,
          source: 'Catalog Index Recommendation',
          action: null
        };
      }

      case AI_INTENTS.PURCHASE_INTENT: {
        const targetProduct = entities.matchedProduct || products[0];
        if (targetProduct) {
          const qty = entities.quantity || 1;
          const total = (targetProduct.price * qty).toFixed(2);
          return {
            intent,
            reply: `I have prepared your order for ${qty}x "${targetProduct.name}" at $${total}. Sizing selected: ${entities.size || 'M/Standard'}. Would you like me to confirm this order now and send payment link?`,
            confidence: 95,
            source: 'In-Chat Autonomous Checkout Engine',
            matchedProduct: targetProduct,
            action: {
              type: 'DRAFT_ORDER',
              items: [
                {
                  id: targetProduct.id,
                  name: targetProduct.name,
                  price: targetProduct.price,
                  quantity: qty,
                  size: entities.size || 'Standard'
                }
              ],
              total: parseFloat(total)
            }
          };
        }
        break;
      }

      case AI_INTENTS.ORDER_STATUS: {
        if (orders.length > 0) {
          const latest = orders[0];
          return {
            intent,
            reply: `Your latest order (${latest.id}) for ${latest.items[0]?.name || 'items'} is currently status: "${latest.status.toUpperCase()}". Total: $${latest.total.toFixed(2)}.`,
            confidence: 94,
            source: 'Commerce Order Telemetry',
            action: null
          };
        }
        return {
          intent,
          reply: `Please provide your order number (e.g. ORD-1001) or phone number so I can check real-time courier tracking for you.`,
          confidence: 90,
          source: 'Order Tracking Query',
          action: null
        };
      }

      default:
        break;
    }

    // Default intelligent fallback grounded in store scope
    return {
      intent: AI_INTENTS.UNKNOWN,
      reply: `Thank you for your inquiry! I can assist you with real-time catalog stock, sizing recommendations, shipping schedules, returns, or automated checkout across WhatsApp and Instagram. How can I help you today?`,
      confidence: 88,
      source: 'General Store Concierge',
      action: null
    };
  }

  /**
   * Intent Classification Classifier
   */
  static classifyIntent(text) {
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i.test(text)) {
      return AI_INTENTS.GREETING;
    }
    if (/(human|agent|operator|manager|real person|speak to someone|handoff|talk to a person)/i.test(text)) {
      return AI_INTENTS.HUMAN_ESCALATION;
    }
    if (/(return|refund|exchange|faulty|damaged|send back|warranty)/i.test(text)) {
      return AI_INTENTS.RETURN_POLICY;
    }
    if (/(shipping|delivery|ship|courier|dispatch|arrive|how long|tracking)/i.test(text)) {
      return AI_INTENTS.SHIPPING_INQUIRY;
    }
    if (/(discount|coupon|promo|voucher|code|deal|cheaper|offer)/i.test(text)) {
      return AI_INTENTS.DISCOUNT_REQUEST;
    }
    if (/(buy|order|purchase|checkout|take it|i want to order|add to cart|i will take)/i.test(text)) {
      return AI_INTENTS.PURCHASE_INTENT;
    }
    if (/(stock|available|have in stock|sizes|color|spec|fabric|material|fit)/i.test(text)) {
      return AI_INTENTS.PRODUCT_AVAILABILITY;
    }
    if (/(price|cost|how much|rate)/i.test(text)) {
      return AI_INTENTS.PRICING_INQUIRY;
    }
    if (/(order status|where is my order|track my order|package)/i.test(text)) {
      return AI_INTENTS.ORDER_STATUS;
    }
    return AI_INTENTS.PRODUCT_INQUIRY;
  }

  /**
   * Entity Extraction from Catalog
   */
  static extractEntities(text, products) {
    let matchedProduct = null;
    let size = null;
    let quantity = 1;

    // 1. Match product by name, keyword, or SKU
    for (const p of products) {
      const pName = p.name.toLowerCase();
      const pSku = p.sku.toLowerCase();
      const keywords = pName.split(' ');

      if (text.includes(pName) || text.includes(pSku) || keywords.some(k => k.length > 3 && text.includes(k))) {
        matchedProduct = p;
        break;
      }
    }

    // 2. Extract size
    const sizeMatch = text.match(/\b(xs|s|m|l|xl|xxl|small|medium|large)\b/i);
    if (sizeMatch) {
      size = sizeMatch[1].toUpperCase();
    }

    // 3. Extract quantity
    const qtyMatch = text.match(/\b(\d+)\s*(pcs|pieces|items|units|x)?\b/);
    if (qtyMatch && parseInt(qtyMatch[1], 10) > 0 && parseInt(qtyMatch[1], 10) < 50) {
      quantity = parseInt(qtyMatch[1], 10);
    }

    return { matchedProduct, size, quantity };
  }
}
