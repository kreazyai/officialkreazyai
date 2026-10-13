#!/usr/bin/env python3
"""
Baseline Zero-Shot Inference Test against local Ollama Qwen3:1.7B
Tests how the raw un-finetuned model responds to Banglish, Bangla, and Critical complaints.
DOES NOT MODIFY THE MODEL.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import urllib.request
import time

TEST_PROMPTS = [
    {
        "id": "test_zero_shot_01",
        "type": "Banglish product inquiry",
        "prompt": "Vai 2000 takar moddhe valo headphone ase?"
    },
    {
        "id": "test_zero_shot_02",
        "type": "Bangla order delivery complaint",
        "prompt": "আমি ৩ দিন আগে পেমেন্ট করেছি কিন্তু এখনো কোনো ডেলিভারি ট্র্যাকিং পাইনি। কেন এত দেরি?"
    },
    {
        "id": "test_zero_shot_03",
        "type": "Critical fraud escalation",
        "prompt": "Ami 2 bar bKash korechi taka kete nise but apnader system cancel dekhay! Amar taka ferot den nahole consumer rights e case korbo!"
    }
]

def query_ollama(prompt, system_prompt="You are KreazyAI assistant. Respond in JSON with 'analysis' and 'reply'."):
    payload = {
        "model": "qwen3:1.7b",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "stream": False,
        "options": {
            "temperature": 0.2
        }
    }
    req = urllib.request.Request(
        "http://localhost:11434/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=30) as res:
        data = json.loads(res.read().decode("utf-8"))
    elapsed = time.time() - t0
    return data["message"]["content"], elapsed

def main():
    print("=" * 70)
    print("BASELINE ZERO-SHOT BENCHMARK: Qwen3:1.7B on Local Ollama")
    print("=" * 70)

    results = []
    for test in TEST_PROMPTS:
        print(f"\n[*] Testing Prompt: '{test['prompt']}' ({test['type']})")
        try:
            resp, elapsed = query_ollama(test["prompt"])
            print(f"    Latency: {elapsed:.2f}s")
            print(f"    Raw Response Preview:\n{resp[:300]}...")
            
            # Check if JSON valid
            is_json = False
            try:
                parsed = json.loads(resp)
                is_json = "analysis" in parsed and "reply" in parsed
            except Exception:
                is_json = False

            results.append({
                "prompt": test["prompt"],
                "type": test["type"],
                "response": resp,
                "latency_sec": round(elapsed, 2),
                "is_valid_dual_json": is_json
            })
        except Exception as e:
            print(f"    [!] Error querying Ollama: {e}")
            results.append({
                "prompt": test["prompt"],
                "error": str(e)
            })

    # Save to evaluation directory
    with open("evaluation/baseline_zero_shot_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print("\n[OK] Baseline results saved to evaluation/baseline_zero_shot_results.json")

if __name__ == "__main__":
    main()
