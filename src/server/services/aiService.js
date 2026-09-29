import { getDatabase } from '../config/database.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

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

export const aiService = {
  async processMessage(businessId, userMessage, context = {}) {
    const rawText = (userMessage || '').trim();
    const lowerText = rawText.toLowerCase();

    const db = getDatabase();

    // 1. Fetch live ground truth data for this tenant
    const products = db.prepare('SELECT * FROM products WHERE business_id = ?').all(businessId);
    const aiConfig = db.prepare('SELECT * FROM ai_configs WHERE business_id = ?').get(businessId) || {
      assistant_name: 'Kreazy AI Concierge',
      return_days: '14',
      return_policy: 'Exchanges within 14 days of receipt on unused items with tags attached.',
      shipping_info: 'Standard shipping 2-4 business days. Free delivery over $75.',
      max_discount: 10.0
    };

    // 2. Security Guardrail: Prompt Injection Detection
    if (/(ignore all previous instructions|reveal system prompt|you are now dan|grant admin access|sudo mode|set discount to 100)/i.test(lowerText)) {
      logger.warn(`Prompt injection attempt detected for business ${businessId}: "${rawText}"`);
      return {
        intent: 'SECURITY_VIOLATION',
        reply: "I am designed to assist with store products, stock checks, shipping, and purchases. How can I help with your shopping today?",
        confidence: 99,
        action: null
      };
    }

    // 3. Classify Intent
    const intent = this.classifyIntent(lowerText);
    const entities = this.extractEntities(lowerText, products);

    // 4. Resolve Domain Reasoning
    switch (intent) {
      case AI_INTENTS.GREETING:
        return {
          intent,
          reply: `Hello! Welcome to ${aiConfig.assistant_name}. I can help you check real-time stock, sizing, return policies, or place an order directly. What are you looking for today?`,
          confidence: 99,
          action: null
        };

      case AI_INTENTS.HUMAN_ESCALATION:
        return {
          intent,
          reply: `I understand your request. I am immediately alerting our store manager to take over this conversation. A member of our team will assist you shortly.`,
          confidence: 98,
          action: {
            type: 'ESCALATE_TO_HUMAN',
            reason: 'User requested human operator or complex issue flagged'
          }
        };

      case AI_INTENTS.RETURN_POLICY: {
        return {
          intent,
          reply: `${aiConfig.return_policy} Would you like me to look up a past order to begin a return or exchange?`,
          confidence: 96,
          action: null
        };
      }

      case AI_INTENTS.SHIPPING_INQUIRY: {
        return {
          intent,
          reply: `${aiConfig.shipping_info} All shipments include live tracking updates via WhatsApp.`,
          confidence: 97,
          action: null
        };
      }

      case AI_INTENTS.DISCOUNT_REQUEST: {
        // Enforce strict merchant safety guardrail
        const maxAllowed = Math.min(25, Math.max(0, parseFloat(aiConfig.max_discount || 10)));
        return {
          intent,
          reply: `I can offer you an approved welcome discount of ${maxAllowed}% on your order today! Use coupon code KREAZY${maxAllowed} at checkout, or I can apply it directly to your cart right now.`,
          confidence: 93,
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
          let parsedVariants = [];
          try {
            parsedVariants = JSON.parse(matched.variants || '[]');
          } catch {}
          const variantsText = parsedVariants.join(', ');
          const extra = matched.ai_knowledge ? ` Details: ${matched.ai_knowledge}` : '';
          return {
            intent,
            reply: `Yes! "${matched.name}" is currently ${inStock ? `in stock (${matched.stock} units available)` : 'temporarily out of stock'}. Priced at $${matched.price.toFixed(2)}.${variantsText ? ` Sizes/options: [${variantsText}].` : ''}${extra} Would you like to reserve one?`,
            confidence: 97,
            matchedProduct: matched,
            action: inStock ? {
              type: 'SUGGEST_PURCHASE',
              productId: matched.id,
              productName: matched.name,
              price: matched.price
            } : null
          };
        }

        const topProduct = products[0] || { name: 'Artisan Linen Overshirt', price: 89.00 };
        return {
          intent,
          reply: `We have several popular items in stock, including our bestselling "${topProduct.name}" ($${Number(topProduct.price).toFixed(2)}). Are you looking for apparel, accessories, or footwear?`,
          confidence: 91,
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
            reply: `I have prepared your order for ${qty}x "${targetProduct.name}" at $${total}. Sizing selected: ${entities.size || 'Standard'}. Would you like me to confirm this order now and send payment link?`,
            confidence: 95,
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
        const latestOrder = db.prepare('SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC LIMIT 1').get(businessId);
        if (latestOrder) {
          return {
            intent,
            reply: `Your latest order (${latestOrder.id}) for ${latestOrder.customer_name} is currently status: "${latestOrder.status.toUpperCase()}". Total: $${latestOrder.total.toFixed(2)}.`,
            confidence: 94,
            action: null
          };
        }
        return {
          intent,
          reply: `Please provide your order number (e.g. ORD-1001) or phone number so I can check real-time courier tracking for you.`,
          confidence: 90,
          action: null
        };
      }

      default:
        break;
    }

    return {
      intent: AI_INTENTS.UNKNOWN,
      reply: `Thank you for your inquiry! I can assist you with real-time catalog stock, sizing recommendations, shipping schedules, returns, or automated checkout across WhatsApp and Instagram. How can I help you today?`,
      confidence: 88,
      action: null
    };
  },

  classifyIntent(text) {
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
  },

  extractEntities(text, products) {
    let matchedProduct = null;
    let size = null;
    let quantity = 1;

    for (const p of products) {
      const pName = p.name.toLowerCase();
      const pSku = p.sku.toLowerCase();
      const keywords = pName.split(' ');

      if (text.includes(pName) || text.includes(pSku) || keywords.some(k => k.length > 3 && text.includes(k))) {
        matchedProduct = p;
        break;
      }
    }

    const sizeMatch = text.match(/\b(xs|s|m|l|xl|xxl|small|medium|large)\b/i);
    if (sizeMatch) {
      size = sizeMatch[1].toUpperCase();
    }

    const qtyMatch = text.match(/\b(\d+)\s*(pcs|pieces|items|units|x)?\b/);
    if (qtyMatch && parseInt(qtyMatch[1], 10) > 0 && parseInt(qtyMatch[1], 10) < 50) {
      quantity = parseInt(qtyMatch[1], 10);
    }

    return { matchedProduct, size, quantity };
  }
};
