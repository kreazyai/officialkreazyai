#!/usr/bin/env python3
"""
Generates the comprehensive dataset_issues.jsonl audit trail
Documenting discovered errors, applied corrections, and flagged human-review items.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ISSUES_FILE = BASE_DIR / "reports" / "dataset_issues.jsonl"

AUDIT_ISSUES = [
    {
        "issue_id": "AUDIT-001",
        "category": "TEMPLATE_REPETITION",
        "severity": "HIGH",
        "affected_records_count": 160,
        "affected_tenants": ["tenant_cosmetics_03", "tenant_grocery_04", "tenant_furniture_05", "tenant_mobile_acc_06", "tenant_appliances_07", "tenant_shoes_08", "tenant_jewelry_09", "tenant_general_10"],
        "discovery_description": "In Pilot v1, tenants 3 to 10 utilized identical syntactic sentence frames (e.g. 'vai {p1} er dam koto pore? stock e ase?'), causing a 20-template cluster repetition across 80% of the dataset.",
        "status": "RESOLVED_IN_V2",
        "resolution_details": "Completely rewrote conversation generation in generate_dataset.py (v2). Every tenant was assigned bespoke conversational scenarios with diverse vocabulary and zero cross-tenant template reuse."
    },
    {
        "issue_id": "AUDIT-002",
        "category": "SYNTHETIC_PII_REPETITION",
        "severity": "MEDIUM",
        "affected_records_count": 8,
        "affected_tenants": ["cross_tenant"],
        "discovery_description": "Hardcoded synthetic customer identity 'Name: Sadat Sakib, Dhanmondi, 01712345678' was reused across 8 different business tenants, risking model memorization and violating tenant isolation.",
        "status": "RESOLVED_IN_V2",
        "resolution_details": "Replaced hardcoded names and unmasked phone numbers with dynamic, unique synthetic profiles per tenant (e.g., Adnan Sami, Rezaul Karim, Imtiaz Shovon) and masked phone formats (e.g., 01755-11XXXX)."
    },
    {
        "issue_id": "AUDIT-003",
        "category": "CONVERSATIONAL_DEPTH_LIMITATION",
        "severity": "HIGH",
        "affected_records_count": 200,
        "affected_tenants": ["all_tenants"],
        "discovery_description": "Pilot v1 contained 100% single-turn interactions (3 messages: system, user, assistant). Multi-turn conversation capability required by Objective 1 and 7 was completely missing.",
        "status": "RESOLVED_IN_V2",
        "resolution_details": "Integrated multi-turn dialogues into Pilot v2, adding 17 multi-turn conversations (8.5% of dataset) with 5 messages each, covering follow-up queries, sizing guidance, and order flows."
    },
    {
        "issue_id": "AUDIT-004",
        "category": "BANGLISH_LEXICAL_IMBALANCE",
        "severity": "MEDIUM",
        "affected_records_count": 61,
        "affected_tenants": ["all_tenants"],
        "discovery_description": "Over-reliance on single greeting 'vai' (55.7% of Banglish examples) and limited representation of informal spelling variations like 'Bhai price ta bolen', 'Aita ki available ase?', 'Amr order koi?'.",
        "status": "RESOLVED_IN_V2",
        "resolution_details": "Diversified Banglish seeds with realistic spelling variations ('bhai', 'bro', 'apu', 'apa', 'dam koto', 'price ta bolen', 'ekhn', 'amr order koi', 'delivery eto late kn'). Reduced 'vai' concentration to 32.9%."
    },
    {
        "issue_id": "AUDIT-005",
        "category": "ZERO_SHOT_BASE_MODEL_HALLUCINATION",
        "severity": "CRITICAL",
        "affected_records_count": 1,
        "affected_tenants": ["tenant_electronics_02"],
        "discovery_description": "Baseline empirical probe of un-finetuned Qwen3 1.7B through Ollama revealed model hallucinating non-existent 'VoltTech 2000 Pro/Elite' models because it misunderstood the Banglish budget phrase '2000 takar moddhe'.",
        "status": "DOCUMENTED_FOR_SFT",
        "resolution_details": "Confirms necessity of Phase 4 dataset fine-tuning on cloud GPU. Base model cannot resolve South Asian price/budget queries without supervised fine-tuning."
    },
    {
        "issue_id": "AUDIT-006",
        "category": "HUMAN_REVIEW_FLAGGED",
        "severity": "MEDIUM",
        "affected_records_count": 11,
        "affected_tenants": ["all_tenants"],
        "discovery_description": "All 11 CRITICAL cases (fraud, police reports, safety hazards, exploding batteries) require human review by business operations and legal counsel to ensure corporate policy alignment.",
        "status": "PENDING_FOUNDER_REVIEW",
        "resolution_details": "Isolated all 11 critical records for founder review prior to Phase 4 expansion. Verified that requires_human=True and escalation_reason are populated."
    }
]

def main():
    with open(ISSUES_FILE, "w", encoding="utf-8") as f:
        for item in AUDIT_ISSUES:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"[OK] Audit issues log written to {ISSUES_FILE} ({len(AUDIT_ISSUES)} records)")

if __name__ == "__main__":
    main()
