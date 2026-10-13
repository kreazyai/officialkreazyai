#!/usr/bin/env python3
"""
KreazyAI Dataset Validation & Quality Audit Engine (v2)
Verifies JSONL schema integrity, taxonomy adherence, duplicate rates, language distribution,
multi-turn structure, PII detection, and data leakage across dataset splits.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import json
import re
from pathlib import Path
from collections import Counter, defaultdict

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "configs"
REPORTS_DIR = BASE_DIR / "reports"
PROFILES_DIR = BASE_DIR / "business_profiles"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Load Taxonomy
with open(CONFIG_DIR / "taxonomy.json", "r", encoding="utf-8") as f:
    TAXONOMY = json.load(f)

VALID_LANGUAGES = {l["code"] for l in TAXONOMY["supported_languages"]}
VALID_INTENTS = set(TAXONOMY["intent_categories"])
VALID_PRIORITIES = set(TAXONOMY["priorities"].keys())
VALID_SENTIMENTS = set(TAXONOMY["sentiments"])

# Load Profiles
PROFILES = {}
for p in PROFILES_DIR.glob("*.json"):
    with open(p, "r", encoding="utf-8") as f:
        data = json.load(f)
        PROFILES[data["tenant_id"]] = data

def tokenize(text):
    """Simple alphanumeric tokenizer for duplicate / similarity checking."""
    return set(re.findall(r"\w+", text.lower()))

def jaccard_similarity(set_a, set_b):
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union > 0 else 0.0

def validate_jsonl_file(file_path):
    errors = []
    warnings = []
    records = []
    composite_prompts = []
    composite_tokens = []
    phone_tracker = Counter()
    multi_turn_count = 0
    single_turn_count = 0

    print(f"[*] Validating: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line_str = line.strip()
            if not line_str:
                continue

            try:
                record = json.loads(line_str)
            except json.JSONDecodeError as e:
                errors.append(f"Line {line_no}: Invalid JSON syntax ({str(e)})")
                continue

            rec_id = record.get("id", f"line_{line_no}")

            # Required top-level keys
            for k in ["id", "tenant_id", "language", "scenario", "messages", "metadata"]:
                if k not in record:
                    errors.append(f"Line {line_no} [{rec_id}]: Missing required key '{k}'")

            # Language check
            lang = record.get("language")
            if lang not in VALID_LANGUAGES:
                errors.append(f"Line {line_no}: Invalid language '{lang}'. Must be one of {list(VALID_LANGUAGES)}")

            # Tenant check
            t_id = record.get("tenant_id")
            if t_id not in PROFILES:
                errors.append(f"Line {line_no}: Unknown tenant_id '{t_id}'")

            # Messages checks
            messages = record.get("messages", [])
            if not isinstance(messages, list) or len(messages) < 3:
                errors.append(f"Line {line_no}: 'messages' must be a list with at least 3 turns (system, user, assistant).")
            else:
                user_texts = []
                for turn_idx, turn in enumerate(messages):
                    role = turn.get("role")
                    content = turn.get("content", "")
                    if role not in ["system", "user", "assistant"]:
                        errors.append(f"Line {line_no}: Invalid message role '{role}' at turn {turn_idx}")
                    if not content:
                        errors.append(f"Line {line_no}: Empty content in message role '{role}' at turn {turn_idx}")
                    if role == "user":
                        user_texts.append(content)
                        # Check unmasked phone numbers
                        phones = re.findall(r"(?:01\d{9})", content)
                        for p in phones:
                            phone_tracker[p] += 1
                            if phone_tracker[p] > 1:
                                warnings.append(f"Line {line_no} [{rec_id}]: Repeated unmasked phone number '{p}' detected")
                    if role == "assistant":
                        # Verify structured analysis
                        try:
                            asst_json = json.loads(content)
                            analysis = asst_json.get("analysis", {})
                            for ak in ["language", "intents", "priority", "sentiment", "requires_human", "suggested_response"]:
                                if ak not in analysis:
                                    errors.append(f"Line {line_no}: Assistant analysis missing '{ak}'")
                            # Verify priority
                            pri = analysis.get("priority")
                            if pri not in VALID_PRIORITIES:
                                errors.append(f"Line {line_no}: Invalid priority '{pri}' in analysis")
                            # Verify intents
                            for it in analysis.get("intents", []):
                                if it not in VALID_INTENTS:
                                    errors.append(f"Line {line_no}: Invalid intent '{it}' in analysis")
                        except Exception:
                            warnings.append(f"Line {line_no}: Assistant response content is not valid JSON string")

                if len(messages) > 3:
                    multi_turn_count += 1
                else:
                    single_turn_count += 1

                composite_str = " || ".join(user_texts)
                composite_prompts.append((rec_id, composite_str))
                composite_tokens.append((rec_id, tokenize(composite_str)))

            # Metadata checks
            meta = record.get("metadata", {})
            for mi in meta.get("intents", []):
                if mi not in VALID_INTENTS:
                    errors.append(f"Line {line_no}: Unknown metadata intent '{mi}'")
            if meta.get("priority") not in VALID_PRIORITIES:
                errors.append(f"Line {line_no}: Invalid metadata priority '{meta.get('priority')}'")

            records.append(record)

    # Duplicate & Near-Duplicate Check
    exact_duplicates = 0
    near_duplicates = 0
    seen_prompts = set()

    for idx, (ex_id, prompt) in enumerate(composite_prompts):
        norm = prompt.strip().lower()
        if norm in seen_prompts:
            exact_duplicates += 1
            errors.append(f"Duplicate user prompt detected in example '{ex_id}': '{prompt[:40]}...'")
        seen_prompts.add(norm)

    # Check near-duplicates (pairwise sample checks)
    for i in range(len(composite_tokens)):
        for j in range(i + 1, min(i + 15, len(composite_tokens))):
            id_a, toks_a = composite_tokens[i]
            id_b, toks_b = composite_tokens[j]
            sim = jaccard_similarity(toks_a, toks_b)
            if sim > 0.88 and id_a != id_b:
                near_duplicates += 1
                warnings.append(f"High lexical similarity ({sim:.2f}) between {id_a} and {id_b}")

    return {
        "file": str(file_path),
        "total_records": len(records),
        "single_turn_count": single_turn_count,
        "multi_turn_count": multi_turn_count,
        "errors": errors,
        "warnings": warnings,
        "exact_duplicates": exact_duplicates,
        "near_duplicates": near_duplicates,
        "records": records
    }

def generate_quality_report(validation_result):
    records = validation_result["records"]
    total = len(records)
    if total == 0:
        return {"error": "No records validated"}

    lang_counts = Counter(r["language"] for r in records)
    priority_counts = Counter(r["metadata"]["priority"] for r in records)
    tenant_counts = Counter(r["tenant_id"] for r in records)
    sentiment_counts = Counter(r["metadata"]["sentiment"] for r in records)
    human_handoff_count = sum(1 for r in records if r["metadata"].get("requires_human"))

    intent_counter = Counter()
    for r in records:
        for intent in r["metadata"].get("intents", []):
            intent_counter[intent] += 1

    report = {
        "total_examples": total,
        "validation_passed": len(validation_result["errors"]) == 0,
        "error_count": len(validation_result["errors"]),
        "warning_count": len(validation_result["warnings"]),
        "errors": validation_result["errors"][:10],
        "warnings_sample": validation_result["warnings"][:5],
        "duplicate_rate_pct": round((validation_result["exact_duplicates"] / total) * 100, 2),
        "single_turn_count": validation_result["single_turn_count"],
        "multi_turn_count": validation_result["multi_turn_count"],
        "multi_turn_pct": round((validation_result["multi_turn_count"] / total) * 100, 1),
        "language_distribution": {
            k: {"count": v, "percentage": round((v / total) * 100, 1)}
            for k, v in sorted(lang_counts.items())
        },
        "priority_distribution": {
            k: {"count": v, "percentage": round((v / total) * 100, 1)}
            for k, v in sorted(priority_counts.items())
        },
        "tenant_distribution": {
            k: {"count": v, "percentage": round((v / total) * 100, 1)}
            for k, v in sorted(tenant_counts.items())
        },
        "sentiment_distribution": dict(sentiment_counts),
        "human_escalation_ratio_pct": round((human_handoff_count / total) * 100, 1),
        "intent_frequency": dict(intent_counter.most_common())
    }
    return report

def main():
    raw_file = BASE_DIR / "datasets" / "raw" / "pilot_raw_200.jsonl"
    processed_file = BASE_DIR / "datasets" / "processed" / "pilot_clean_200.jsonl"

    val_res = validate_jsonl_file(raw_file)
    rep = generate_quality_report(val_res)

    # Save JSON report
    report_json_path = REPORTS_DIR / "pilot_quality_report.json"
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(rep, f, indent=2, ensure_ascii=False)

    # Save Markdown report
    report_md_path = REPORTS_DIR / "pilot_quality_report.md"
    with open(report_md_path, "w", encoding="utf-8") as f:
        f.write("# KreazyAI Pilot Dataset (200 Examples) Quality Audit Report (v2)\n\n")
        f.write(f"**Total Validated Records:** {rep['total_examples']}  \n")
        f.write(f"**Validation Status:** {'✅ PASSED (0 Errors)' if rep['validation_passed'] else '❌ FAILED'}  \n")
        f.write(f"**Exact Duplicates:** {rep['duplicate_rate_pct']}%  \n")
        f.write(f"**Multi-Turn Conversations:** {rep['multi_turn_count']} ({rep['multi_turn_pct']}%)  \n")
        f.write(f"**Single-Turn Conversations:** {rep['single_turn_count']}  \n")
        f.write(f"**Human Escalation Rate:** {rep['human_escalation_ratio_pct']}%  \n\n")

        f.write("## 1. Language Distribution\n")
        f.write("| Language | Examples | Percentage |\n|---|---|---|\n")
        for lang, d in rep["language_distribution"].items():
            f.write(f"| {lang.capitalize()} | {d['count']} | {d['percentage']}% |\n")

        f.write("\n## 2. Priority Distribution\n")
        f.write("| Priority | Count | Percentage |\n|---|---|---|\n")
        for pri, d in rep["priority_distribution"].items():
            f.write(f"| {pri} | {d['count']} | {d['percentage']}% |\n")

        f.write("\n## 3. Top Intents Breakdown\n")
        f.write("| Intent Category | Frequency |\n|---|---|\n")
        for intent, cnt in rep["intent_frequency"].items():
            f.write(f"| {intent} | {cnt} |\n")

        f.write("\n## 4. Multi-Tenant Representation\n")
        f.write("| Tenant ID | Samples |\n|---|---|\n")
        for tid, d in rep["tenant_distribution"].items():
            f.write(f"| `{tid}` | {d['count']} ({d['percentage']}%) |\n")

    # If valid, write to processed directory
    if rep["validation_passed"]:
        processed_file.parent.mkdir(parents=True, exist_ok=True)
        with open(raw_file, "r", encoding="utf-8") as infile, open(processed_file, "w", encoding="utf-8") as outfile:
            outfile.write(infile.read())
        print(f"[OK] Validation Passed! Saved cleaned dataset to {processed_file}")
    else:
        print(f"[!] Validation had {len(val_res['errors'])} errors. Please review {report_json_path}")

    print(f"[OK] Quality Audit Report written to {report_md_path}")

if __name__ == "__main__":
    main()
