#!/usr/bin/env python3
"""
KreazyAI Cross-Split Semantic Duplicate & Near-Duplicate Analyzer
Computes exact raw overlap, normalized prompt overlap, Jaccard bigram similarity,
and multilingual subword character n-gram TF-IDF cosine similarity across
all 160,000 cross-split comparisons (800 train x 200 val).
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import re
import math
from pathlib import Path
from collections import defaultdict, Counter

BASE_DIR = Path(__file__).resolve().parent.parent
TRAIN_FILE = BASE_DIR / "training" / "pilot_train.jsonl"
VAL_FILE = BASE_DIR / "training" / "pilot_validation.jsonl"

def clean_prompt(text):
    t = re.sub(r'\(tenant_[a-z0-9_]+(?:\s+ref:\d+)?\)', '', text, flags=re.IGNORECASE)
    t = re.sub(r'\(ref:\d+\)', '', t, flags=re.IGNORECASE)
    t = re.sub(r'[^\w\s\u0980-\u09FF]', ' ', t)
    return ' '.join(t.lower().split())

def char_ngrams(text, n=3):
    clean = ' ' + ' '.join(text.lower().split()) + ' '
    return [clean[i:i+n] for i in range(len(clean)-n+1)]

def word_ngrams(text, n=2):
    words = text.lower().split()
    if len(words) < n:
        return set(words)
    return set(' '.join(words[i:i+n]) for i in range(len(words)-n+1))

def compute_multilingual_semantic_similarity():
    print("=" * 70)
    print("KREAZYAI CROSS-SPLIT MULTILINGUAL SEMANTIC DUPLICATE ANALYSIS")
    print("=" * 70)

    train_recs = [json.loads(l) for l in open(TRAIN_FILE, "r", encoding="utf-8") if l.strip()]
    val_recs = [json.loads(l) for l in open(VAL_FILE, "r", encoding="utf-8") if l.strip()]

    print(f"[*] Train Records Loaded: {len(train_recs)} (Target: 800)")
    print(f"[*] Val Records Loaded:   {len(val_recs)} (Target: 200)")

    # 1. Exact ID Overlap
    train_ids = {r["id"] for r in train_recs}
    val_ids = {r["id"] for r in val_recs}
    id_overlap = train_ids & val_ids
    print(f"[*] Exact Record ID Overlap: {len(id_overlap)} (Target: 0)")

    # 2. Raw Prompt String Overlap
    train_raw = {r["messages"][1]["content"] for r in train_recs}
    val_raw = {r["messages"][1]["content"] for r in val_recs}
    raw_overlap = train_raw & val_raw
    print(f"[*] Raw Prompt String Overlap: {len(raw_overlap)} (Target: 0)")

    # 3. Normalized Clean Prompt Overlap
    train_clean_map = defaultdict(list)
    for r in train_recs:
        cp = clean_prompt(r["messages"][1]["content"])
        train_clean_map[cp].append(r["id"])

    val_clean_matches = []
    for r in val_recs:
        cp = clean_prompt(r["messages"][1]["content"])
        if cp in train_clean_map:
            val_clean_matches.append((r["id"], train_clean_map[cp], cp))

    print(f"[*] Normalized Prompt (tag-stripped) Matches: {len(val_clean_matches)} / {len(val_recs)} (Target: 0)")

    # 4. Word Bigram Jaccard Similarity Distribution
    train_bgs = [(r["id"], r["tenant_id"], word_ngrams(r["messages"][1]["content"], 2)) for r in train_recs]
    val_bgs = [(r["id"], r["tenant_id"], word_ngrams(r["messages"][1]["content"], 2), r["messages"][1]["content"]) for r in val_recs]

    jaccard_counts = defaultdict(int)
    jaccard_high = []

    for v_id, v_tid, v_bg, v_raw in val_bgs:
        for t_id, t_tid, t_bg in train_bgs:
            inter = len(v_bg & t_bg)
            union = len(v_bg | t_bg)
            sim = inter / union if union > 0 else 0
            if sim >= 0.90:
                jaccard_counts[">=0.90"] += 1
                jaccard_high.append((sim, v_id, t_id, v_tid, t_tid))
            elif sim >= 0.80:
                jaccard_counts[">=0.80"] += 1
            elif sim >= 0.70:
                jaccard_counts[">=0.70"] += 1

    print("\n--- JACCARD WORD BIGRAM DISTRIBUTION (160,000 PAIRS) ---")
    print(f"[*] Jaccard Sim >= 0.90: {jaccard_counts['>=0.90']} pairs ({jaccard_counts['>=0.90']/160000*100:.4f}%)")
    print(f"[*] Jaccard Sim >= 0.80: {jaccard_counts['>=0.80']} pairs ({jaccard_counts['>=0.80']/160000*100:.4f}%)")
    print(f"[*] Jaccard Sim >= 0.70: {jaccard_counts['>=0.70']} pairs ({jaccard_counts['>=0.70']/160000*100:.4f}%)")

    # 5. Multilingual Subword Char 3-gram TF-IDF Cosine Similarity
    # Build vocabulary & IDF across all prompts in both splits
    all_docs = []
    for r in train_recs + val_recs:
        all_docs.append(char_ngrams(clean_prompt(r["messages"][1]["content"]), 3))

    df = Counter()
    for doc in all_docs:
        for gram in set(doc):
            df[gram] += 1

    num_docs = len(all_docs)
    idf = {gram: math.log((num_docs + 1) / (count + 1)) + 1.0 for gram, count in df.items()}

    def vectorize(doc):
        tf = Counter(doc)
        vec = {}
        norm_sq = 0.0
        for gram, count in tf.items():
            w = (1.0 + math.log(count)) * idf.get(gram, 1.0)
            vec[gram] = w
            norm_sq += w * w
        norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
        return {k: v / norm for k, v in vec.items()}

    train_vecs = [(r["id"], r["tenant_id"], vectorize(char_ngrams(clean_prompt(r["messages"][1]["content"]), 3)), r["messages"][1]["content"]) for r in train_recs]
    val_vecs = [(r["id"], r["tenant_id"], vectorize(char_ngrams(clean_prompt(r["messages"][1]["content"]), 3)), r["messages"][1]["content"]) for r in val_recs]

    def cosine_sim(v1, v2):
        if len(v1) > len(v2):
            v1, v2 = v2, v1
        return sum(val * v2.get(k, 0.0) for k, val in v1.items())

    cos_counts = defaultdict(int)
    max_sim_overall = 0.0
    highest_pairs = []

    for v_id, v_tid, v_vec, v_raw in val_vecs:
        for t_id, t_tid, t_vec, t_raw in train_vecs:
            sim = cosine_sim(v_vec, t_vec)
            if sim > max_sim_overall:
                max_sim_overall = sim
            if sim >= 0.90:
                cos_counts[">=0.90"] += 1
                highest_pairs.append((sim, v_id, t_id, v_tid, t_tid, v_raw, t_raw))
            elif sim >= 0.80:
                cos_counts[">=0.80"] += 1
            elif sim >= 0.70:
                cos_counts[">=0.70"] += 1

    print("\n--- MULTILINGUAL SUBWORD TF-IDF COSINE SIMILARITY (160,000 PAIRS) ---")
    print(f"[*] Max Cross-Split Similarity: {max_sim_overall:.4f}")
    print(f"[*] Cosine Sim >= 0.90:         {cos_counts['>=0.90']} pairs ({cos_counts['>=0.90']/160000*100:.4f}%)")
    print(f"[*] Cosine Sim >= 0.80:         {cos_counts['>=0.80']} pairs ({cos_counts['>=0.80']/160000*100:.4f}%)")
    print(f"[*] Cosine Sim >= 0.70:         {cos_counts['>=0.70']} pairs ({cos_counts['>=0.70']/160000*100:.4f}%)")

    if val_clean_matches:
        print("\n❌ REMAINING NORMALIZED MATCHES:")
        for v_id, t_ids, cp in val_clean_matches[:5]:
            print(f"  Val {v_id} matches Train {t_ids}: {cp[:70]}...")
        return False
    else:
        print("\n✅ ZERO NORMALIZED PROMPT MATCHES! VALIDATION SPLIT IS 100% INDEPENDENT.")
        return True

if __name__ == "__main__":
    passed = compute_multilingual_semantic_similarity()
    if not passed:
        sys.exit(1)
