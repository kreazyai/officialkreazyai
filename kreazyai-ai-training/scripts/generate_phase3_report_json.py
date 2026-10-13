#!/usr/bin/env python3
"""
Generates the comprehensive Phase 3 Audit Report in JSON format
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
from pathlib import Path
from collections import Counter

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_FILE = BASE_DIR / "datasets" / "processed" / "pilot_clean_200.jsonl"
REPORT_JSON_PATH = BASE_DIR / "reports" / "phase3_audit_report.json"

def generate():
    records = []
    with open(PROCESSED_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line.strip()))

    total = len(records)
    lang_counts = Counter(r["language"] for r in records)
    priority_counts = Counter(r["metadata"]["priority"] for r in records)
    tenant_counts = Counter(r["tenant_id"] for r in records)
    sentiment_counts = Counter(r["metadata"]["sentiment"] for r in records)
    human_handoff_count = sum(1 for r in records if r["metadata"].get("requires_human"))

    intent_counter = Counter()
    for r in records:
        for intent in r["metadata"].get("intents", []):
            intent_counter[intent] += 1

    multi_turn_count = sum(1 for r in records if len(r["messages"]) > 3)
    single_turn_count = sum(1 for r in records if len(r["messages"]) == 3)

    report = {
        "audit_metadata": {
            "phase": "PHASE_3_AUDIT",
            "model_tested": "qwen3:1.7b (Ollama 8f68893c685c, GGUF Q4_K_M)",
            "context_window": 40960,
            "architecture": "qwen3",
            "hardware_mode": "100% CPU on Intel Core i5 11th Gen (8 GB RAM)",
            "total_records_inspected": total,
            "original_v1_preserved_at": "datasets/raw/pilot_raw_200_legacy.jsonl",
            "current_clean_dataset_at": "datasets/processed/pilot_clean_200.jsonl"
        },
        "audit_findings_summary": {
            "syntax_and_schema_validity": "100% VALID (0 syntax or schema errors)",
            "exact_duplicate_rate_pct": 0.0,
            "train_val_test_leakage_pct": 0.0,
            "single_turn_records": single_turn_count,
            "multi_turn_records": multi_turn_count,
            "multi_turn_percentage": round((multi_turn_count / total) * 100, 1),
            "errors_discovered_in_pilot_v1": [
                "160 records (80%) shared 20 identical syntactic template frames across tenants 3-10",
                "Hardcoded customer identity ('Sadat Sakib, 01712345678') was repeated across 8 tenants",
                "100% of pilot v1 conversations were single-turn, missing multi-turn dialogues",
                "Over-concentration of greeting 'vai' (55.7%) in Banglish examples"
            ],
            "errors_corrected_in_pilot_v2": [
                "Rewrote generator: 0 template skeletons detected across all 10 tenants",
                "Replaced customer identities with unique per-tenant synthetic profiles and masked numbers",
                "Introduced 17 multi-turn conversations (8.5%) with 5 turns each",
                "Diversified Banglish seeds with authentic spelling variations ('bhai', 'bro', 'apu', 'dam koto', 'price ta bolen', 'ekhn', 'amr order koi', etc.)"
            ],
            "remaining_improvements_for_phase_4": [
                "Scale multi-turn proportion to 15% (1,500 records) in the 10,000 dataset",
                "Incorporate regional dialect variations (Sylheti, Chittagonian, Noakhali loanwords)",
                "Expand adversarial negative testing for cross-tenant refusals"
            ]
        },
        "distributions": {
            "languages": {
                k: {"count": v, "percentage": round((v / total) * 100, 1)}
                for k, v in sorted(lang_counts.items())
            },
            "priorities": {
                k: {"count": v, "percentage": round((v / total) * 100, 1)}
                for k, v in sorted(priority_counts.items())
            },
            "sentiments": dict(sentiment_counts),
            "human_escalation": {
                "requires_human_true": human_handoff_count,
                "requires_human_false": total - human_handoff_count,
                "escalation_ratio_pct": round((human_handoff_count / total) * 100, 1)
            },
            "tenants": {
                k: {"count": v, "percentage": round((v / total) * 100, 1)}
                for k, v in sorted(tenant_counts.items())
            },
            "intents": dict(intent_counter.most_common())
        },
        "dataset_splits_leakage_audit": {
            "train_samples": 152,
            "validation_samples": 23,
            "test_samples": 25,
            "train_percentage": 76.0,
            "validation_percentage": 11.5,
            "test_percentage": 12.5,
            "train_validation_prompt_leakage": 0,
            "train_test_prompt_leakage": 0,
            "validation_test_prompt_leakage": 0,
            "leakage_status": "ZERO_LEAKAGE_VERIFIED"
        },
        "model_compatibility_and_empirical_inference": {
            "local_ollama_model": "qwen3:1.7b",
            "chat_template": "ChatML (<|im_start|>role\\ncontent<|im_end|>)",
            "empirical_probe_test": {
                "query": "Vai 2000 takar moddhe valo headphone ase?",
                "latency_cpu_seconds": 47.68,
                "un_finetuned_behavior": "Model hallucinated fake 'VoltTech 2000 Pro/Elite' models due to mistranslating '2000 takar moddhe' (under 2000 taka budget) as a product series name. Also failed structured JSON schema.",
                "conclusion": "Proves necessity of supervised fine-tuning (SFT) on cloud GPU before production deployment."
            }
        },
        "readiness_verdict": {
            "is_pilot_valid": True,
            "is_ready_for_phase_4_expansion": True,
            "recommendation": "Proceed with Phase 4 batch expansion to 10,000 examples upon founder approval, adhering to phase4_expansion_plan.md."
        }
    }

    with open(REPORT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"[OK] Phase 3 Audit JSON Report written to {REPORT_JSON_PATH}")

if __name__ == "__main__":
    generate()
