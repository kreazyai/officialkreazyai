#!/usr/bin/env python3
"""
KreazyAI Pilot Dataset Deep Audit Script
Inspects raw, processed, train, validation, and test datasets.
Verifies schemas, taxonomies, linguistic variations, tenant isolation, and leakage.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import re
from pathlib import Path
from collections import Counter, defaultdict

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "configs"
DATASETS_DIR = BASE_DIR / "datasets"
PROFILES_DIR = BASE_DIR / "business_profiles"
REPORTS_DIR = BASE_DIR / "reports"

# 1. Load Taxonomy & Schemas
with open(CONFIG_DIR / "taxonomy.json", "r", encoding="utf-8") as f:
    TAXONOMY = json.load(f)

VALID_LANGUAGES = {l["code"] for l in TAXONOMY["supported_languages"]}
VALID_INTENTS = set(TAXONOMY["intent_categories"])
VALID_PRIORITIES = set(TAXONOMY["priorities"].keys())
VALID_SENTIMENTS = set(TAXONOMY["sentiments"])

# Load all 10 business profiles
PROFILES = {}
for p in PROFILES_DIR.glob("*.json"):
    with open(p, "r", encoding="utf-8") as f:
        data = json.load(f)
        PROFILES[data["tenant_id"]] = data

def inspect_file(filepath):
    """Loads all records from a jsonl file."""
    records = []
    syntax_errors = []
    if not filepath.exists():
        return records, [f"File not found: {filepath}"]
    
    with open(filepath, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f, start=1):
            line_str = line.strip()
            if not line_str:
                continue
            try:
                rec = json.loads(line_str)
                records.append((idx, rec))
            except Exception as e:
                syntax_errors.append((idx, str(e)))
    return records, syntax_errors

def run_deep_audit():
    print("=" * 70)
    print("KREAZYAI PILOT DATASET DEEP AUDIT")
    print("=" * 70)

    # 1. Inspect file counts
    raw_path = DATASETS_DIR / "raw" / "pilot_raw_200.jsonl"
    clean_path = DATASETS_DIR / "processed" / "pilot_clean_200.jsonl"
    train_path = DATASETS_DIR / "train.jsonl"
    val_path = DATASETS_DIR / "validation.jsonl"
    test_path = DATASETS_DIR / "test.jsonl"

    raw_recs, raw_errs = inspect_file(raw_path)
    clean_recs, clean_errs = inspect_file(clean_path)
    train_recs, train_errs = inspect_file(train_path)
    val_recs, val_errs = inspect_file(val_path)
    test_recs, test_errs = inspect_file(test_path)

    print(f"1. File Record Counts:")
    print(f"   - Raw:        {len(raw_recs)} records (Syntax errors: {len(raw_errs)})")
    print(f"   - Clean:      {len(clean_recs)} records (Syntax errors: {len(clean_errs)})")
    print(f"   - Train:      {len(train_recs)} records (Syntax errors: {len(train_errs)})")
    print(f"   - Validation: {len(val_recs)} records (Syntax errors: {len(val_errs)})")
    print(f"   - Test:       {len(test_recs)} records (Syntax errors: {len(test_errs)})")
    total_split = len(train_recs) + len(val_recs) + len(test_recs)
    print(f"   - Sum of Splits: {total_split} (Matches clean: {total_split == len(clean_recs)})")

    # 2. Detailed audit of clean records
    issues = []
    linguistic_audit = {
        "banglish_variations": [],
        "bangla_script": [],
        "english_queries": [],
        "mixed_queries": [],
        "typos_informal": []
    }

    intent_counter = Counter()
    priority_counter = Counter()
    sentiment_counter = Counter()
    lang_counter = Counter()
    tenant_counter = Counter()
    requires_human_counter = Counter()
    
    # Store prompts for leakage and duplication analysis
    prompts_seen = {}
    templates_seen = defaultdict(list)

    for line_no, rec in clean_recs:
        rec_id = rec.get("id", f"line_{line_no}")
        t_id = rec.get("tenant_id")
        lang = rec.get("language")
        meta = rec.get("metadata", {})
        msgs = rec.get("messages", [])

        # Schema checks
        for req_k in ["id", "tenant_id", "language", "scenario", "messages", "metadata"]:
            if req_k not in rec:
                issues.append({"id": rec_id, "type": "SCHEMA_ERROR", "detail": f"Missing top-level key '{req_k}'"})

        # Language validation
        if lang not in VALID_LANGUAGES:
            issues.append({"id": rec_id, "type": "TAXONOMY_ERROR", "detail": f"Invalid language '{lang}'"})
        lang_counter[lang] += 1

        # Tenant validation
        if t_id not in PROFILES:
            issues.append({"id": rec_id, "type": "TENANT_ERROR", "detail": f"Unknown tenant_id '{t_id}'"})
        tenant_counter[t_id] += 1

        tenant_profile = PROFILES.get(t_id, {})
        valid_skus = {p["sku"] for p in tenant_profile.get("catalog", [])}
        valid_prod_names = [p["name"].lower() for p in tenant_profile.get("catalog", [])]

        # Metadata validation
        pri = meta.get("priority")
        sent = meta.get("sentiment")
        intents = meta.get("intents", [])
        req_h = meta.get("requires_human")

        if pri not in VALID_PRIORITIES:
            issues.append({"id": rec_id, "type": "TAXONOMY_ERROR", "detail": f"Invalid priority '{pri}'"})
        priority_counter[pri] += 1

        if sent not in VALID_SENTIMENTS:
            issues.append({"id": rec_id, "type": "TAXONOMY_ERROR", "detail": f"Invalid sentiment '{sent}'"})
        sentiment_counter[sent] += 1

        requires_human_counter[req_h] += 1

        for it in intents:
            if it not in VALID_INTENTS:
                issues.append({"id": rec_id, "type": "TAXONOMY_ERROR", "detail": f"Invalid intent '{it}'"})
            intent_counter[it] += 1

        # Check messages structure
        if len(msgs) < 3:
            issues.append({"id": rec_id, "type": "SCHEMA_ERROR", "detail": f"Messages list has < 3 turns ({len(msgs)})"})
            continue

        sys_msg = msgs[0]
        user_msg = msgs[1]
        asst_msg = msgs[2]

        user_content = user_msg.get("content", "").strip()
        asst_content = asst_msg.get("content", "").strip()

        # Check duplicate prompts
        norm_user = user_content.lower()
        if norm_user in prompts_seen:
            issues.append({
                "id": rec_id,
                "type": "DUPLICATE_PROMPT",
                "detail": f"Prompt identical to {prompts_seen[norm_user]}: '{user_content[:40]}...'"
            })
        else:
            prompts_seen[norm_user] = rec_id

        # Assistant JSON parse
        try:
            asst_data = json.loads(asst_content)
            if "analysis" not in asst_data:
                issues.append({"id": rec_id, "type": "OUTPUT_FORMAT_ERROR", "detail": "Missing 'analysis' block in assistant JSON"})
            if "reply" not in asst_data:
                issues.append({"id": rec_id, "type": "OUTPUT_FORMAT_ERROR", "detail": "Missing 'reply' block in assistant JSON"})

            analysis = asst_data.get("analysis", {})
            # Verify consistency between metadata and analysis
            if analysis.get("priority") != pri:
                issues.append({"id": rec_id, "type": "METADATA_MISMATCH", "detail": f"Analysis priority {analysis.get('priority')} != metadata priority {pri}"})
            if analysis.get("language") != lang:
                issues.append({"id": rec_id, "type": "METADATA_MISMATCH", "detail": f"Analysis language {analysis.get('language')} != metadata language {lang}"})
            if analysis.get("requires_human") != req_h:
                issues.append({"id": rec_id, "type": "METADATA_MISMATCH", "detail": f"Analysis requires_human {analysis.get('requires_human')} != metadata requires_human {req_h}"})

            # Check critical logic:
            if pri in ["HIGH", "CRITICAL"] and not req_h:
                issues.append({"id": rec_id, "type": "POLICY_INCONSISTENCY", "detail": f"Priority is {pri} but requires_human is False"})
            if pri in ["HIGH", "CRITICAL"] and not analysis.get("escalation_reason"):
                issues.append({"id": rec_id, "type": "POLICY_INCONSISTENCY", "detail": f"Priority is {pri} but escalation_reason is null"})

            # Check customer reply: Does customer reply leak internal JSON or metadata?
            reply_text = asst_data.get("reply", "")
            for internal_marker in ["requires_human", "escalation_reason", "intent_categories", "confidence", "sft_training"]:
                if internal_marker in reply_text.lower():
                    issues.append({"id": rec_id, "type": "INTERNAL_LEAKAGE", "detail": f"Customer reply contains internal metadata string: '{internal_marker}'"})

            # Cross-tenant data contamination check:
            # Does the reply reference products or names of OTHER tenants?
            for other_tid, other_profile in PROFILES.items():
                if other_tid == t_id:
                    continue
                # Check if other tenant's brand name appears in reply
                other_biz = other_profile.get("business_name")
                if other_biz and other_biz.lower() in reply_text.lower():
                    issues.append({"id": rec_id, "type": "TENANT_CONTAMINATION", "detail": f"Reply mentions other business '{other_biz}' (tenant: {other_tid})"})

        except json.JSONDecodeError:
            issues.append({"id": rec_id, "type": "OUTPUT_FORMAT_ERROR", "detail": "Assistant content is not valid JSON string"})

        # Linguistic characterization
        if lang == "banglish":
            linguistic_audit["banglish_variations"].append({
                "id": rec_id,
                "prompt": user_content,
                "intents": intents,
                "priority": pri
            })
        elif lang == "bangla":
            linguistic_audit["bangla_script"].append({
                "id": rec_id,
                "prompt": user_content,
                "intents": intents,
                "priority": pri
            })
        elif lang == "english":
            linguistic_audit["english_queries"].append({
                "id": rec_id,
                "prompt": user_content,
                "intents": intents,
                "priority": pri
            })
        elif lang == "mixed":
            linguistic_audit["mixed_queries"].append({
                "id": rec_id,
                "prompt": user_content,
                "intents": intents,
                "priority": pri
            })

    # 3. Check Data Leakage across splits
    train_prompts = {r.get("messages", [{}, {}])[1].get("content", "").strip().lower(): r.get("id") for _, r in train_recs}
    val_prompts = {r.get("messages", [{}, {}])[1].get("content", "").strip().lower(): r.get("id") for _, r in val_recs}
    test_prompts = {r.get("messages", [{}, {}])[1].get("content", "").strip().lower(): r.get("id") for _, r in test_recs}

    leak_tr_val = set(train_prompts.keys()) & set(val_prompts.keys())
    leak_tr_test = set(train_prompts.keys()) & set(test_prompts.keys())
    leak_val_test = set(val_prompts.keys()) & set(test_prompts.keys())

    leakage_findings = {
        "train_val_overlap": len(leak_tr_val),
        "train_test_overlap": len(leak_tr_test),
        "val_test_overlap": len(leak_val_test)
    }

    print("\n2. Quality Audit Summary:")
    print(f"   - Total records inspected: {len(clean_recs)}")
    print(f"   - Total issues identified: {len(issues)}")
    print(f"   - Exact duplicate prompts: {len([i for i in issues if i['type'] == 'DUPLICATE_PROMPT'])}")
    print(f"   - Schema / JSON errors:    {len([i for i in issues if 'ERROR' in i['type']])}")
    print(f"   - Leakage Train-Val:        {len(leak_tr_val)}")
    print(f"   - Leakage Train-Test:       {len(leak_tr_test)}")
    print(f"   - Leakage Val-Test:         {len(leak_val_test)}")

    print("\n3. Distributions:")
    print("   Languages:", dict(lang_counter))
    print("   Priorities:", dict(priority_counter))
    print("   Sentiments:", dict(sentiment_counter))
    print("   Human Escalation (requires_human):", dict(requires_human_counter))

    # Output detailed findings to a json file
    audit_results = {
        "total_records": len(clean_recs),
        "issues_count": len(issues),
        "issues": issues,
        "language_distribution": dict(lang_counter),
        "priority_distribution": dict(priority_counter),
        "sentiment_distribution": dict(sentiment_counter),
        "tenant_distribution": dict(tenant_counter),
        "intent_distribution": dict(intent_counter),
        "human_escalation_distribution": dict(requires_human_counter),
        "leakage_findings": leakage_findings
    }

    with open(REPORTS_DIR / "phase3_audit_raw_results.json", "w", encoding="utf-8") as f:
        json.dump(audit_results, f, indent=2, ensure_ascii=False)

    print(f"\n[OK] Deep Audit Completed! Results saved to {REPORTS_DIR / 'phase3_audit_raw_results.json'}")

if __name__ == "__main__":
    run_deep_audit()
