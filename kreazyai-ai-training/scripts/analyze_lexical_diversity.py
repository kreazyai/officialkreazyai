#!/usr/bin/env python3
"""
Deep linguistic and template analysis of the 200 pilot examples.
Detects repetitive template clusters, PII leaks, multi-turn absence, and lexicon patterns.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import re
from pathlib import Path
from collections import defaultdict, Counter

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_FILE = BASE_DIR / "datasets" / "processed" / "pilot_clean_200.jsonl"
ISSUES_FILE = BASE_DIR / "reports" / "dataset_issues.jsonl"

def analyze():
    records = []
    with open(PROCESSED_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line.strip()))

    issues = []
    
    # 1. PII and Repeated Identity Detection
    name_counter = Counter()
    phone_counter = Counter()
    
    for r in records:
        user_text = r["messages"][1]["content"]
        # Find names and phone numbers
        phones = re.findall(r"(?:01\d{9})", user_text)
        for p in phones:
            phone_counter[p] += 1
            if phone_counter[p] > 1:
                issues.append({
                    "id": r["id"],
                    "tenant_id": r["tenant_id"],
                    "category": "PII_OR_SYNTHETIC_OVERFIT",
                    "severity": "MEDIUM",
                    "description": f"Repeated phone number '{p}' found across multiple examples ({phone_counter[p]} times).",
                    "content_snippet": user_text
                })

        # Check for repeated customer names like Sadat Sakib
        names_found = re.findall(r"Name:\s*([A-Za-z\s]+?)(?:,|$)", user_text)
        for n in names_found:
            clean_n = n.strip()
            name_counter[clean_n] += 1
            if name_counter[clean_n] > 1:
                issues.append({
                    "id": r["id"],
                    "tenant_id": r["tenant_id"],
                    "category": "PII_OR_SYNTHETIC_OVERFIT",
                    "severity": "LOW",
                    "description": f"Repeated customer name '{clean_n}' found across multiple tenant examples ({name_counter[clean_n]} times).",
                    "content_snippet": user_text
                })

    # 2. Template Pattern Repetition Detection
    # Strip product names and tenant names to extract template skeletons
    template_skeletons = defaultdict(list)
    for r in records:
        scenario = r.get("scenario", "")
        # Extract the base scenario pattern
        # e.g., "cosmetics_price_stock", "grocery_price_stock" -> "_price_stock"
        base_scenario = re.sub(r"^[a-z_]+?(price_stock|usage|specs|delivery_fees|double_charge|courier_delay|compare|photo_req|confirm_order|return_policy|promo|no_advance|bulk_purchase|box_inspection|manager_handoff|typo_query|cancel_dup|tracking_status|morning_express|bestseller)", r"\1", scenario)
        template_skeletons[base_scenario].append(r["id"])

    repetitive_templates = {k: v for k, v in template_skeletons.items() if len(v) >= 5}
    print(f"[*] Repetitive Template Skeletons detected: {len(repetitive_templates)}")
    for skel, ids in repetitive_templates.items():
        print(f"    - Pattern '{skel}': {len(ids)} examples ({ids[:3]}...)")
        issues.append({
            "id": ids[0],
            "tenant_id": "cross_tenant",
            "category": "TEMPLATE_REPETITION",
            "severity": "MEDIUM",
            "description": f"Scenario skeleton '{skel}' is repeated identically across {len(ids)} tenants.",
            "content_snippet": f"Affects examples: {', '.join(ids[:5])}..."
        })

    # 3. Multi-turn Turn Count Analysis
    single_turn_count = 0
    multi_turn_count = 0
    for r in records:
        # system, user, assistant = 3 messages = 1 turn conversation
        # multi-turn would have len(messages) >= 5 (system, user, asst, user, asst)
        if len(r["messages"]) == 3:
            single_turn_count += 1
        elif len(r["messages"]) > 3:
            multi_turn_count += 1

    print(f"\n[*] Conversation Turns:")
    print(f"    - Single-turn (3 messages): {single_turn_count} ({single_turn_count/len(records)*100:.1f}%)")
    print(f"    - Multi-turn (>3 messages):  {multi_turn_count} ({multi_turn_count/len(records)*100:.1f}%)")

    if multi_turn_count == 0:
        issues.append({
            "id": "ALL_PILOT_RECORDS",
            "tenant_id": "all",
            "category": "CONVERSATION_DEPTH_LIMITATION",
            "severity": "HIGH",
            "description": "100% of pilot records are single-turn (system -> user -> assistant). Multi-turn conversations required by Objective 1 and 7 are absent from the pilot.",
            "content_snippet": "All 200 records contain exactly 3 message objects."
        })

    # 4. Banglish Linguistic Depth Analysis
    banglish_records = [r for r in records if r["language"] == "banglish"]
    slang_markers = ["vai", "bhai", "bhaiya", "bro", "apa", "apu", "dam", "koto", "pore", "ase", "amr", "apnr", "kn", "kbe", "ekhn", "plz", "tk", "rcv"]
    slang_counts = Counter()
    for br in banglish_records:
        txt = br["messages"][1]["content"].lower()
        for sm in slang_markers:
            if re.search(r"\b" + re.escape(sm) + r"\b", txt):
                slang_counts[sm] += 1

    print(f"\n[*] Banglish Slang/Marker Frequencies across {len(banglish_records)} Banglish records:")
    for sm, cnt in slang_counts.most_common(10):
        print(f"    - '{sm}': {cnt} ({cnt/len(banglish_records)*100:.1f}%)")

    # Write issues to dataset_issues.jsonl
    with open(ISSUES_FILE, "w", encoding="utf-8") as f:
        for iss in issues:
            f.write(json.dumps(iss, ensure_ascii=False) + "\n")

    print(f"\n[OK] Found {len(issues)} specific dataset audit issues/observations.")
    print(f"[OK] Written to {ISSUES_FILE}")

if __name__ == "__main__":
    analyze()
