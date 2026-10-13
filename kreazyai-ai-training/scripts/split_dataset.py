#!/usr/bin/env python3
"""
KreazyAI Dataset Stratification & Split Engine
Splits processed dataset into Train (70%), Validation (15%), and Test (15%) splits
with guaranteed ZERO data leakage between splits.
"""

import sys
import json
import random
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_FILE = BASE_DIR / "datasets" / "processed" / "pilot_clean_200.jsonl"
RAW_FILE = BASE_DIR / "datasets" / "raw" / "pilot_raw_200.jsonl"
DATASETS_DIR = BASE_DIR / "datasets"

TRAIN_FILE = DATASETS_DIR / "train.jsonl"
VAL_FILE = DATASETS_DIR / "validation.jsonl"
TEST_FILE = DATASETS_DIR / "test.jsonl"

def extract_prompt_fingerprint(record):
    """Extracts composite user query content for strict leakage prevention across all turns."""
    user_turns = [m.get("content", "").strip().lower() for m in record.get("messages", []) if m.get("role") == "user"]
    return " || ".join(user_turns) if user_turns else record.get("id", "")

def split_dataset(input_file, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42):
    random.seed(seed)

    records = []
    with open(input_file, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line.strip()))

    total = len(records)
    print(f"[*] Loaded {total} records from {input_file}")

    # Group by tenant & scenario to maintain balanced representation
    grouped = defaultdict(list)
    for r in records:
        key = (r["tenant_id"], r["language"], r["metadata"]["priority"])
        grouped[key].append(r)

    train_records = []
    val_records = []
    test_records = []

    for key, group in grouped.items():
        random.shuffle(group)
        n = len(group)
        n_train = int(round(n * train_ratio))
        n_val = int(round(n * val_ratio))
        
        # Ensure at least 1 in train if items exist
        if n_train == 0 and n > 0:
            n_train = 1

        t_slice = group[:n_train]
        v_slice = group[n_train:n_train + n_val]
        te_slice = group[n_train + n_val:]

        train_records.extend(t_slice)
        val_records.extend(v_slice)
        test_records.extend(te_slice)

    # Rebalance if small rounding difference
    all_assigned = train_records + val_records + test_records
    if len(all_assigned) != total:
        # Fallback simple deterministic split
        random.shuffle(records)
        n_tr = int(round(total * train_ratio))
        n_v = int(round(total * val_ratio))
        train_records = records[:n_tr]
        val_records = records[n_tr:n_tr + n_v]
        test_records = records[n_tr + n_v:]

    # ---------------------------------------------------------
    # STRICT ZERO DATA LEAKAGE VERIFICATION
    # ---------------------------------------------------------
    train_prompts = {extract_prompt_fingerprint(r) for r in train_records}
    val_prompts = {extract_prompt_fingerprint(r) for r in val_records}
    test_prompts = {extract_prompt_fingerprint(r) for r in test_records}

    leak_tr_val = train_prompts & val_prompts
    leak_tr_test = train_prompts & test_prompts
    leak_val_test = val_prompts & test_prompts

    assert len(leak_tr_val) == 0, f"Leakage detected between Train and Val: {leak_tr_val}"
    assert len(leak_tr_test) == 0, f"Leakage detected between Train and Test: {leak_tr_test}"
    assert len(leak_val_test) == 0, f"Leakage detected between Val and Test: {leak_val_test}"

    # Write files
    for filepath, data_slice in [(TRAIN_FILE, train_records), (VAL_FILE, val_records), (TEST_FILE, test_records)]:
        with open(filepath, "w", encoding="utf-8") as f:
            for item in data_slice:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

    print(f"[OK] Split Complete & 0% Data Leakage Verified!")
    print(f"    - Train Split:      {len(train_records)} examples ({len(train_records)/total*100:.1f}%) -> {TRAIN_FILE}")
    print(f"    - Validation Split: {len(val_records)} examples ({len(val_records)/total*100:.1f}%) -> {VAL_FILE}")
    print(f"    - Test Split:       {len(test_records)} examples ({len(test_records)/total*100:.1f}%) -> {TEST_FILE}")

def main():
    target = PROCESSED_FILE if PROCESSED_FILE.exists() else RAW_FILE
    if not target.exists():
        print(f"[!] Neither processed nor raw dataset found at {target}. Run generate_dataset.py first.")
        sys.exit(1)

    split_dataset(target)

if __name__ == "__main__":
    main()
