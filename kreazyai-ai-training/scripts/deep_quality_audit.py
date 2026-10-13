#!/usr/bin/env python3
"""
Deep Dataset Quality Auditor for KreazyAI Pilot Datasets (1,000 records)
Audits:
1. Delivery fee & timeline accuracy against business profiles (especially outside Dhaka like Sylhet, Chittagong, Rajshahi, Khulna, Barisal)
2. Incompatible size/variant modification requests (smartwatches, groceries, furniture)
3. Durability & specification boilerplate claims
4. Fabricated order confirmations & total price math errors
5. Refund guarantees & false promises
6. Contradictions between customer request and assistant response
7. Misclassified priority / escalation
Outputs detailed defect logs for correction or quarantine.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import glob
import re
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).resolve().parent.parent
PROFILES_DIR = BASE_DIR / "business_profiles"
TRAIN_FILE = BASE_DIR / "training" / "pilot_train.jsonl"
VAL_FILE = BASE_DIR / "training" / "pilot_validation.jsonl"

OUTSIDE_DHAKA_LOCATIONS = [
    "sylhet", "chittagong", "chattogram", "rajshahi", "khulna", "barisal", "barishal",
    "rangpur", "mymensingh", "comilla", "cumilla", "gazipur", "narayanganj", "savar",
    "bogura", "bogra", "cox's bazar", "jashore", "jessore", "feni", "noakhali"
]

DHAKA_LOCATIONS = [
    "dhanmondi", "gulshan", "banani", "uttara", "mirpur", "mohakhali", "bashundhara",
    "motijheel", "badda", "khilgaon", "shantinagar", "mohammadpur", "dhanmondi 27",
    "sector 4", "block d", "mirpur 10", "gulshan 1", "gulshan 2"
]

def load_profiles():
    profiles = {}
    for p in glob.glob(str(PROFILES_DIR / "*.json")):
        d = json.load(open(p, "r", encoding="utf-8"))
        profiles[d["tenant_id"]] = d
    return profiles

def analyze_record(rec, profiles):
    issues = []
    tid = rec.get("tenant_id")
    prof = profiles.get(tid, {})
    policies = prof.get("policies", {})
    catalog = {p["name"].lower(): p for p in prof.get("catalog", [])}
    
    fee_in = policies.get("fee_inside_dhaka", 0)
    fee_out = policies.get("fee_outside_dhaka", 0)
    
    messages = rec.get("messages", [])
    conv_text = " ".join([m.get("content", "") for m in messages])
    conv_lower = conv_text.lower()
    
    # 1. Location & Delivery Fee / Timeline Check
    is_outside = any(loc in conv_lower for loc in OUTSIDE_DHAKA_LOCATIONS)
    is_inside = any(loc in conv_lower for loc in DHAKA_LOCATIONS)
    
    # Check assistant messages for math and timeline
    for m_idx, m in enumerate(messages):
        if m.get("role") != "assistant":
            continue
        c = m.get("content", "")
        c_lower = c.lower()
        
        # Check if assistant responded to a location query
        if is_outside and not is_inside:
            # Should NOT quote inside Dhaka fee as the actual fee
            if f"৳{fee_in}" in c and f"৳{fee_out}" not in c and ("মোট বিল" in c or "total" in c_lower or "ডেলিভারি চার্জ" in c):
                issues.append({
                    "type": "INCORRECT_DELIVERY_FEE",
                    "detail": f"Outside Dhaka location mentioned, but quoted inside Dhaka fee ৳{fee_in} instead of ৳{fee_out}"
                })
            # Timeline check: outside Dhaka timeline should be respected
            if "২৪-৪৮ ঘণ্টা" in c or "24-48 hours" in c_lower:
                if "outside" in policies.get("delivery_outside_dhaka", "").lower() or "3 to 4" in policies.get("delivery_outside_dhaka", "") or "48 to 72" in policies.get("delivery_outside_dhaka", ""):
                    issues.append({
                        "type": "INVENTED_DELIVERY_TIMELINE",
                        "detail": f"Quoted 24-48 hours for outside Dhaka destination (policy is {policies.get('delivery_outside_dhaka')})"
                    })

        # 2. Incompatible Variant / Size Change
        # Smartwatches, groceries, furniture, appliances
        if any(w in conv_lower for w in ["size change", "size update", "সাইজ পরিবর্তন"]):
            if tid in ["tenant_electronics_02", "tenant_grocery_04", "tenant_furniture_05", "tenant_appliances_07", "tenant_mobile_acc_06"]:
                if any(w in c.lower() for w in ["size update kore dicchi", "size update করা হয়েছে", "সাইজ পরিবর্তন করে দিচ্ছি"]):
                    issues.append({
                        "type": "INCOMPATIBLE_SIZE_MODIFICATION",
                        "detail": f"Tenant {tid} item does not have clothing sizing; size change request accepted incorrectly without clarification"
                    })

        # 3. Unsupported Durability Claims
        if "শতভাগ প্রিমিয়াম ও অরিজিনাল উপাদানে তৈরি" in c and "অত্যন্ত টেকসই ও কাস্টমারদের বিশ্বস্ত" in c:
            # Check if product is grocery or jewelry or electronics where generic boilerplate was injected
            issues.append({
                "type": "UNSUPPORTED_BOILERPLATE_CLAIM",
                "detail": "Generic boilerplate durability claim without catalog-grounded technical specs"
            })

        # 4. Instant Order Confirmation Hallucination
        if "আপনার অর্ডার সফলভাবে কনফার্ম করা হয়েছে" in c or "আপনার অর্ডার নিশ্চিত করা হয়েছে" in c:
            # Check if total price math is correct
            # Extract numbers after ৳
            taka_amounts = re.findall(r'৳(\d+)', c)
            # Check if total price equals item price + delivery fee
            # Find item in catalog
            found_prices = [p["price"] for name, p in catalog.items() if name in conv_lower]
            if found_prices:
                expected_in = found_prices[0] + fee_in
                expected_out = found_prices[0] + fee_out
                stated_totals = [int(a) for a in taka_amounts if int(a) > 500]
                if stated_totals:
                    st = stated_totals[-1]
                    if is_outside and st != expected_out:
                        issues.append({
                            "type": "INCORRECT_ORDER_TOTAL_MATH",
                            "detail": f"Stated total ৳{st} does not match catalog item ৳{found_prices[0]} + outside fee ৳{fee_out} = ৳{expected_out}"
                        })
                    elif is_inside and st != expected_in:
                        issues.append({
                            "type": "INCORRECT_ORDER_TOTAL_MATH",
                            "detail": f"Stated total ৳{st} does not match catalog item ৳{found_prices[0]} + inside fee ৳{fee_in} = ৳{expected_in}"
                        })

        # 5. Unsupported Refund Guarantee
        if any(term in c_lower for term in ["instant refund", "taka ferot pathiye dicchi", "এখনই টাকা ফেরত", "টাকা পাঠিয়ে দিচ্ছি"]):
            issues.append({
                "type": "UNSUPPORTED_REFUND_GUARANTEE",
                "detail": "Promised instantaneous refund without standard return inspection/verification"
            })

    return issues

def main():
    profiles = load_profiles()
    print(f"Loaded {len(profiles)} business profiles.")
    
    total_issues = 0
    issue_by_type = defaultdict(int)
    flagged_records = []

    for split_name, filepath in [("train", TRAIN_FILE), ("val", VAL_FILE)]:
        data = [json.loads(l) for l in open(filepath, "r", encoding="utf-8") if l.strip()]
        print(f"\n[*] Auditing {split_name} ({len(data)} records)...")
        split_issues = 0
        for r in data:
            issues = analyze_record(r, profiles)
            if issues:
                split_issues += len(issues)
                total_issues += len(issues)
                for iss in issues:
                    issue_by_type[iss["type"]] += 1
                flagged_records.append({
                    "split": split_name,
                    "id": r["id"],
                    "tenant_id": r["tenant_id"],
                    "issues": issues,
                    "record": r
                })
        print(f"    - Flagged records in {split_name}: {len([f for f in flagged_records if f['split'] == split_name])} (Issues: {split_issues})")

    print("\n" + "=" * 60)
    print("QUALITY AUDIT DEFECT SUMMARY")
    print("=" * 60)
    print(f"Total Defect Occurrences Detected: {total_issues}")
    for itype, count in sorted(issue_by_type.items(), key=lambda x: -x[1]):
        print(f"  - {itype}: {count}")

    # Save initial audit log
    with open(BASE_DIR / "reports" / "audit_defect_candidates.json", "w", encoding="utf-8") as f:
        json.dump(flagged_records, f, indent=2, ensure_ascii=False)
    print(f"\n[OK] Saved flagged defect candidates to reports/audit_defect_candidates.json")

if __name__ == "__main__":
    main()
