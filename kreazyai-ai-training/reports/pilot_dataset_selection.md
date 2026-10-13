# KreazyAI Pilot Training Dataset Selection Report

**Status:** ✅ APPROVED FOR GOOGLE COLAB PILOT SFT  
**Pilot Training Records:** 800  
**Pilot Validation Records:** 200  
**Data & Family Leakage:** 0.0% Verified (Zero prompt or scenario family overlap)  
**Multi-Turn Conversations:** 172 (21.5%)  
**Quarantined High-Risk Cases:** 100% Excluded from Pilot  

## 1. Selection Philosophy & Family-Level Isolation
To ensure complete evaluation integrity, the pilot dataset enforces two layers of separation:
1. **Quarantine Gate:** 100% of the 1,150 CRITICAL fraud and safety hazard records remain quarantined.
2. **Family Isolation:** Conversation families, reference tags (e.g. `(tenant_xyz ref:1)`), and scenario templates in the validation set are strictly barred from appearing in the training set.

## 2. Language Stratification
| Language | Records | Percentage |
|---|---|---|
| Bangla | 222 | 27.8% |
| Banglish | 264 | 33.0% |
| English | 183 | 22.9% |
| Mixed | 131 | 16.4% |

## 3. Multi-Tenant Representation (Exactly 80 per Business)
| Tenant ID | Vertical | Sample Volume |
|---|---|---|
| `tenant_appliances_07` | Vertical SaaS Store | 80 (10.0%) |
| `tenant_cosmetics_03` | Vertical SaaS Store | 80 (10.0%) |
| `tenant_electronics_02` | Vertical SaaS Store | 80 (10.0%) |
| `tenant_fashion_01` | Vertical SaaS Store | 80 (10.0%) |
| `tenant_furniture_05` | Vertical SaaS Store | 80 (10.0%) |
| `tenant_general_10` | Vertical SaaS Store | 80 (10.0%) |
| `tenant_grocery_04` | Vertical SaaS Store | 80 (10.0%) |
| `tenant_jewelry_09` | Vertical SaaS Store | 80 (10.0%) |
| `tenant_mobile_acc_06` | Vertical SaaS Store | 80 (10.0%) |
| `tenant_shoes_08` | Vertical SaaS Store | 80 (10.0%) |

## 4. Priority Breakdown
| Priority | Count | Percentage |
|---|---|---|
| HIGH | 116 | 14.5% |
| LOW | 648 | 81.0% |
| MEDIUM | 36 | 4.5% |

## 5. Top 10 Supported Intents
| Intent Category | Frequency |
|---|---|
| Product inquiry | 410 |
| General customer support | 261 |
| Product availability | 186 |
| Price inquiry | 138 |
| Image request | 118 |
| Delivery complaint | 90 |
| Order tracking | 82 |
| Customer dissatisfaction | 79 |
| Product recommendation | 74 |
| Product comparison | 60 |
