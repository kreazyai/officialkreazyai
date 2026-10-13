# KreazyAI Multi-Tenant AI Training Pipeline

An enterprise-grade multilingual training and dataset engineering pipeline for **KreazyAI** — designed to fine-tune open-weight language models (e.g. **Qwen3 1.7B**) on external GPU environments (such as Google Colab) using **Unsloth & QLoRA**.

---

## 1. Project Overview & Hardware Constraints

- **Local Development Environment**: Windows 11, Intel Core i5 11th Gen, 8 GB RAM, Intel Iris Xe (128 MB VRAM).
- **Local Model Runtime**: Ollama with `qwen3:1.7b` (`8f68893c685c`, GGUF Q4_K_M).
- **Core Engineering Decision**: **Zero local fine-tuning**. Fine-tuning an LLM on 8 GB RAM with integrated graphics would cause catastrophic OOM (Out Of Memory) crashes and system instability. Dataset generation, schema enforcement, data leakage audits, and SFT formatting are built locally, while model fine-tuning is targeted for cloud GPUs (Google Colab with T4 / A100 GPU).

---

## 2. Directory Structure

```text
kreazyai-ai-training/
├── business_profiles/          # 10 Isolated Multi-Tenant Store Profiles (1,000 samples each)
│   ├── cosmetics.json
│   ├── electronics.json
│   ├── fashion.json
│   ├── furniture.json
│   ├── general_ecommerce.json
│   ├── grocery.json
│   ├── home_appliances.json
│   ├── jewelry.json
│   ├── mobile_accessories.json
│   └── shoes.json
├── configs/                    # Taxonomy and Schemas
│   ├── schemas.json            # JSON Schemas for SFT, Analysis & Vision
│   └── taxonomy.json           # 15 Intents, 4 Priorities, 4 Languages
├── datasets/                   # Generated Data & SFT Splits
│   ├── batches/                # 5 Audited Sequential Batches (2,000 samples each)
│   │   ├── batch_1_2000.jsonl  # Batch 1: Banglish Focus
│   │   ├── batch_2_2000.jsonl  # Batch 2: Natural Bangla Focus
│   │   ├── batch_3_2000.jsonl  # Batch 3: Natural English Focus
│   │   ├── batch_4_2000.jsonl  # Batch 4: Mixed (1,500) + Bangla (500)
│   │   └── batch_5_2000.jsonl  # Batch 5: Complex (1,000) + Banglish (1,000)
│   ├── final_10000.jsonl       # Full Merged 10,000 Production Dataset
│   ├── train.jsonl             # 8,000 Samples (80.0%) SFT Training Split
│   ├── validation.jsonl        # 1,000 Samples (10.0%) SFT Evaluation Split
│   └── test.jsonl              # 1,000 Samples (10.0%) Holdout Test Split
├── evaluation/                 # Benchmark metrics and test harnesses
│   ├── baseline_zero_shot_results.json
│   └── evaluation_plan.md      # 5 Comprehensive Evaluation Benchmark Suites
├── reports/                    # Quality Audits, Batch Reports & Ledgers
│   ├── dataset_issues.jsonl    # Itemized Audit Trail of Fixes & Review Flags
│   ├── phase3_audit_report.md  # Deep Phase 3 Audit Findings
│   ├── phase3_audit_report.json
│   ├── phase4_allocation_ledger.json  # Mathematical 10,000 Distribution Ledger
│   ├── phase4_batch_1_report.md
│   ├── phase4_batch_2_report.md
│   ├── phase4_batch_3_report.md
│   ├── phase4_batch_4_report.md
│   ├── phase4_batch_5_report.md
│   ├── phase4_final_quality_report.md # Final 10K Quality Report
│   ├── phase4_final_quality_report.json
│   └── phase4_human_review_queue.jsonl # 2,300 Flagged Operational & Critical Records
├── scripts/                    # Pure Python 3.10+ Functional Tools
│   ├── generate_10k_batches.py # Phase 4 10,000 Production Generation Engine
│   ├── quality_gate_audit.py   # Automated 14-Gate Batch Quality Auditor
│   ├── split_dataset.py        # Grouped Stratification Engine (0% Leakage)
│   ├── validate_dataset.py     # Schema & Taxonomy Validator
│   └── test_baseline_inference.py # Local Ollama CPU Probe
├── training/                   # Phase 5 Cloud GPU SFT Specifications
│   ├── qwen3_sft_dataset.jsonl # 10,000 ChatML Formatted SFT Training Records
│   └── phase5_training_requirements.md # Colab Unsloth QLoRA Spec
├── requirements.txt            # Cloud fine-tuning dependencies
└── README.md                   # This documentation
```

---

## 3. Dataset Distribution & Allocation Ledger (Exactly 10,000 Records)

| Primary Category | Target Volume | Achieved Volume | Target Compliance | Key Linguistic Focus |
|---|---|---|---|---|
| **Banglish (Romanized Bengali)** | **3,000** | **3,000** | **100.0% Exact Match** | Phonetic variants (`"dam koto"`, `"price ta koto"`, `"amr order koi"`), typos, and abbreviations (`amr`, `kn`, `tk`, `rcv`). |
| **Natural Bangla (বাংলা লিপি)** | **2,500** | **2,500** | **100.0% Exact Match** | Standard Bengali Unicode script, sizes, exchange policies, and polite formal nuances. |
| **Natural English** | **2,000** | **2,000** | **100.0% Exact Match** | International and South Asian English, technical specifications, and corporate bulk VAT inquiries. |
| **Mixed Bangla-English** | **1,500** | **1,500** | **100.0% Exact Match** | Natural code-switching combining Romanized Bengali grammar with English vocabulary. |
| **Complex & Escalation** | **1,000** | **1,000** | **100.0% Exact Match** | Edge cases, duplicate deductions, fraud allegations, DNCRP litigation threats, and physical safety hazards. |
| **TOTAL** | **10,000** | **10,000** | **100.0% Exact Match** | **0.0% Duplicates, 0.0% Data Leakage Across Splits** |

---

## 4. Multi-Tenant Representation Matrix (1,000 Examples per Tenant)

| Tenant ID | Business Name | Vertical | Core Catalog Sample | Per-Tenant Samples |
|---|---|---|---|---|
| `tenant_fashion_01` | AuraThreads BD | Premium Ethnic & Streetwear | Panjabi, Jamdani Saree, Minimalist Tee, Fleece Hoodie | 1,000 |
| `tenant_electronics_02` | VoltTech Electronics | Consumer Electronics & Audio | ANC Headphones, Bass Pro TWS, Smartwatch, Powerbank | 1,000 |
| `tenant_cosmetics_03` | GlowNest Organics | Skincare & Natural Cosmetics | Vitamin C Serum, Hydrating Sunscreen, Tea Tree Face Wash | 1,000 |
| `tenant_grocery_04` | AmarBazar Daily | Organic Groceries & Staples | Kalijira Rice, Sundarban Honey, Mustard Oil, Chia Seeds | 1,000 |
| `tenant_furniture_05` | WoodCraft Artisans | Modern Modular Furniture | Ergonomic Teak Chair, Minimalist Work Desk, Bookshelf | 1,000 |
| `tenant_mobile_acc_06` | GadgetShield BD | Mobile Accessories & Protection | 65W GaN Charger, Braided Cable, Magnetic Car Mount | 1,000 |
| `tenant_appliances_07` | ArcticHome Appliances | Kitchen & Living Appliances | Inverter Air Fryer, Digital Rice Cooker, Electric Kettle | 1,000 |
| `tenant_shoes_08` | StepCraft Footwear | Formal & Casual Footwear | Genuine Leather Loafers, Breathable Runners, Velvet Slides | 1,000 |
| `tenant_jewelry_09` | Nilima Artisanal Jewelry | Heritage & Modern Jewelry | Silver Choker, Pearl Earrings, Gold-Plated Bangle Set | 1,000 |
| `tenant_general_10` | BengalBazaar Superstore | Multi-Category General Store | Smart LED Lamp, Travel Backpack, Vacuum Insulated Flask | 1,000 |

---

## 5. How to Reproduce Dataset Generation & Auditing

To regenerate all 10,000 production records and re-run all 5 automated Quality Gates from scratch:

```bash
# Navigate to the workspace
cd kreazyai-ai-training

# Execute the complete Phase 4 pipeline (generates, audits, merges, and splits)
python scripts/generate_10k_batches.py
```

### What the script executes automatically:
1. Generates 5 batches of 2,000 examples into `datasets/batches/`.
2. Runs 14 Quality Gates on each batch; halts if any error is discovered.
3. Merges batches into `datasets/final_10000.jsonl`.
4. Executes stratified splitting with 0% data leakage into `datasets/train.jsonl` (8,000), `datasets/validation.jsonl` (1,000), and `datasets/test.jsonl` (1,000).
5. Exports ChatML SFT file to `training/qwen3_sft_dataset.jsonl`.
6. Generates markdown batch reports (`phase4_batch_1_report.md` through `phase4_batch_5_report.md`) and the final quality report (`phase4_final_quality_report.md`).

---

## 6. Next Steps: Phase 5 Cloud GPU Fine-Tuning

Refer to [training/phase5_training_requirements.md](file:///c:/Users/SADAT/OneDrive/Desktop/KreazyAI/kreazyai-ai-training/training/phase5_training_requirements.md) for the Google Colab SFT configuration using Unsloth and 4-bit QLoRA.
