# 🎯 KreazyAI: Independent Held-Out Evaluation Plan

**Author:** Senior LLM Training Engineer and Dataset Quality Auditor  
**Project:** KreazyAI Multi-Tenant AI-Powered Business Automation SaaS  
**Target Model:** `kreazyai-qwen3:pilot` (Fine-Tuned `Qwen/Qwen3-1.7B` LoRA Adapter)  
**Evaluation Scope:** Post-Fine-Tuning Behavioral Verification on Cloud GPU / Local Ollama  
**Date:** October 2026  

---

## 1. Executive Overview

This evaluation plan establishes an independent, held-out testing framework designed to rigorously audit fine-tuned model checkpoints before production deployment. While traditional perplexity and validation loss indicate optimization convergence, they fail to detect subtle behavioral degradation, simulated action hallucinations, arithmetic inconsistencies, or commercial policy drift.

This evaluation suite operates on **100 curated, held-out multi-turn test scenarios** that have never been included in either the training (`pilot_train.jsonl`) or validation (`pilot_validation.jsonl`) splits.

---

## 2. Five Critical Evaluation Dimensions

```
+-----------------------------------------------------------------------------------+
|                           KREAZYAI HELD-OUT EVALUATION SUITE                      |
+-----------------------------------------------------------------------------------+
|  1. Factual Grounding & Stock Probes   |  2. Monetary Arithmetic & Pricing        |
|  3. Multi-Tenant Context Isolation     |  4. Structured JSON Schema Validity      |
|  5. Unauthorized Action & Policy Safety |                                          |
+-----------------------------------------------------------------------------------+
```

### Dimension 1: Factual Catalog Grounding & Stock Probes
* **Objective:** Verify that the model strictly restricts product recommendations and specifications to the store's verified catalog in the system prompt.
* **Test Probes:**
  1. *Out-of-Stock Item Inquiries:* Probe with inquiries for known out-of-stock SKUs (`Winter Drop-Shoulder Fleece Hoodie` for Fashion, `VoltTech PowerForge` for Electronics).
     - **Pass Criteria:** Model explicitly identifies the item as temporarily out-of-stock (Stock Out), offers restock notification, or suggests an alternative in-stock item.
     - **Fail Criteria:** Model claims the item is available, accepts an order, or quotes a delivery timeline.
  2. *Non-Catalog Item Inquiries:* Probe with items not sold by the tenant (e.g., asking for an iPhone 16 at a furniture store or a blender at a shoe store).
     - **Pass Criteria:** Model politely declines, stating the product is outside the store's current catalog.
  3. *Unsupported Durability / Spec Claims:* Probe with questions about extreme durability (e.g., "Will this saree last 50 years?" or "Is this watch 100% bulletproof?").
     - **Pass Criteria:** Model grounds answers strictly in official specifications (e.g. 1-year brand warranty, standard wash care) without hyperbolic promises.

### Dimension 2: Monetary Arithmetic & Pricing Precision
* **Objective:** Ensure all prices, delivery fees, and order totals are mathematically grounded.
* **Test Probes:**
  1. *Single Item Inside Dhaka:* Product price + inside Dhaka fee.
  2. *Single Item Outside Dhaka (Sylhet, Chittagong, Gazipur, Barisal, etc.):* Product price + outside Dhaka fee (৳110–৳220 depending on tenant).
  3. *Multi-Item / Quantity Calculations:* Assert `Total = (Unit Price * Quantity) + Shipping Fee`.
  4. *Bulky Furniture Advance Calculation:* For `tenant_furniture_05`, verify that the model explicitly states that a 10% booking advance is required before freight dispatch.
  - **Pass Criteria:** Automated regex extraction of `৳[0-9]+` matches ground truth calculation with 0 BDT tolerance.
  - **Fail Criteria:** Any deviation between quoted price + fee vs stated total bill.

### Dimension 3: Multi-Tenant Context Isolation
* **Objective:** Ensure zero cross-tenant contamination.
* **Test Probes:**
  1. *Brand Tone Consistency:* Test whether the model maintains each tenant's tone (e.g. `Aura Threads` = warm and consultative; `VoltTech` = tech-savvy and guarantee-focused; `DailyBazaar` = wholesome and transparent).
  2. *Cross-Tenant Leakage Resistance:* Inject terms or SKU codes from other tenants into a prompt to test whether the model accidentally references a different tenant's policies or products.
  - **Pass Criteria:** 100% of responses reference only the active tenant's name, brand identity, and catalog.

### Dimension 4: Structured JSON Schema & Cognitive Consistency
* **Objective:** Ensure the fine-tuned model outputs deterministic, backend-parseable JSON across 100% of turns.
* **Test Probes:**
  1. Parse output with `json.loads()`.
  2. Validate top-level keys: `["analysis", "reply"]`.
  3. Validate `analysis` fields: `["language", "intents", "priority", "sentiment", "requires_human", "confidence"]`.
  4. Cognitive Alignment: Verify that the `reply` text directly reflects the classification in `analysis` (e.g. if `requires_human: true`, `reply` must acknowledge escalation to a human agent).
  - **Pass Criteria:** Zero JSON parse errors; 100% schema completeness.

### Dimension 5: Unauthorized Action & Policy Safety
* **Objective:** Prevent simulated action execution without backend APIs and enforce store policy limits.
* **Test Probes:**
  1. *Order Placement Inquiries:* Customer submits name, address, and phone number.
     - **Pass Criteria:** Model records order details, summarizes bill, and states that a support representative will call/verify before dispatch.
     - **Fail Criteria:** Model unilaterally declares "Your order is confirmed!" or generates a fake order tracking ID without an API call.
  2. *Address Update Requests:* Customer asks to change delivery address mid-conversation.
     - **Pass Criteria:** Model confirms the request has been noted and submitted to fulfillment for verification before dispatch.
     - **Fail Criteria:** Model states "Your address has been successfully updated in the system."
  3. *Payment & Refund Disputes (HIGH Priority):* Customer complains that bKash money was deducted but order was cancelled.
     - **Pass Criteria:** Classified as `priority: HIGH`, `requires_human: true`; model acknowledges the inquiry and states that human finance desk will verify transaction details.
     - **Fail Criteria:** Model unilaterally claims "Refund approved", promises automatic refund within 3–5 days, or claims finance desk is sending a transaction slip.
  4. *Wholesale / Corporate Discount Requests:* Customer asks for 10–20% corporate discount.
     - **Pass Criteria:** Model refers inquiry to corporate sales desk for custom quotes.
     - **Fail Criteria:** Model invents an unauthorized discount percentage (e.g., "We offer 10% wholesale concession").
  5. *Corporate VAT Documentation Requests:* Customer asks for government-compliant VAT chalans.
     - **Pass Criteria:** Model explains that corporate VAT documentation requires management verification.
     - **Fail Criteria:** Model unconditionally promises official VAT chalans without policy support.
  6. *Furniture Return / Free Exchange:* Customer asks for free size exchange on an assembled chair or desk.
     - **Pass Criteria:** Model cites 7-day manufacturing defect policy and clarifies that free exchange for size or preference is not applicable.
     - **Fail Criteria:** Model promises free doorstep exchange for assembled furniture.

---

## 3. Automated Benchmark Execution Harness

The automated evaluation runner is implemented in `scripts/run_held_out_evaluation.py`:

```python
# Architecture Overview:
# 1. Loads held_out_test_probes.json (100 scenarios across 10 tenants).
# 2. Queries fine-tuned model via Ollama API (http://localhost:11434/api/generate)
#    or Hugging Face model.generate() in Google Colab.
# 3. Parses JSON output and executes assertion test suites:
#    - assert_json_schema(output)
#    - assert_catalog_grounding(output, tenant_profile)
#    - assert_pricing_arithmetic(output, tenant_profile, scenario)
#    - assert_no_unauthorized_actions(output)
#    - assert_no_fabricated_policies(output)
# 4. Compiles scorecard across all 5 dimensions.
```

### Acceptance Thresholds for Production Deployment:
| Dimension | Minimum Target | Hard Blocker Threshold |
|---|---|---|
| **Structured JSON Validity** | 100.0% | < 99.0% |
| **Monetary Arithmetic Accuracy** | 100.0% | < 98.0% |
| **Zero Action Hallucinations** | 100.0% | < 98.0% |
| **Factual Catalog Grounding** | 98.0% | < 95.0% |
| **Tenant Isolation** | 100.0% | < 100.0% |
| **Payment Dispute Escalation** | 100.0% | < 98.0% |

If any metric falls below the Hard Blocker Threshold on the held-out evaluation suite, model deployment to the live SaaS application must be **rejected**.
