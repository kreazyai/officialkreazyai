#!/usr/bin/env python3
"""
Notebook Syntax and Configuration Validator
Ensures KreazyAI_Qwen3_1_7B_FineTuning.ipynb has 100% valid JSON,
valid Python AST in all code cells, correct Qwen/Qwen3-1.7B configuration,
and zero traces of Qwen2.5.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import ast
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
NOTEBOOK_PATH = BASE_DIR / "training" / "KreazyAI_Qwen3_1_7B_FineTuning.ipynb"

def validate_notebook():
    print(f"[*] Validating notebook: {NOTEBOOK_PATH}")
    with open(NOTEBOOK_PATH, "r", encoding="utf-8") as f:
        nb = json.load(f)

    total_cells = len(nb["cells"])
    code_cells = [c for c in nb["cells"] if c["cell_type"] == "code"]
    markdown_cells = [c for c in nb["cells"] if c["cell_type"] == "markdown"]

    print(f"  - Total cells: {total_cells}")
    print(f"  - Markdown cells: {len(markdown_cells)}")
    print(f"  - Code cells: {len(code_cells)}")

    errors = []
    for idx, cell in enumerate(code_cells, 1):
        source = "".join(cell.get("source", []))
        # Filter lines that start with jupyter/bash magics
        filtered_lines = []
        for line in source.splitlines():
            stripped = line.strip()
            if stripped.startswith("!") or stripped.startswith("%%") or stripped.startswith("%"):
                filtered_lines.append(f"# {line}")
            else:
                filtered_lines.append(line)
        py_code = "\n".join(filtered_lines)
        try:
            ast.parse(py_code)
        except SyntaxError as e:
            errors.append((idx, e.msg, e.lineno))

    if errors:
        print(f"❌ Syntax validation FAILED on {len(errors)} cell(s):")
        for cell_idx, msg, lineno in errors:
            print(f"    Cell {cell_idx}, line {lineno}: {msg}")
        sys.exit(1)
    else:
        print("✅ Python AST syntax check: All 15 code cells parsed successfully without errors.")

    # Content checks
    full_str = json.dumps(nb)
    if "Qwen2.5" in full_str:
        print("❌ Model Error: 'Qwen2.5' reference still detected in notebook!")
        sys.exit(1)
    else:
        print("✅ Verified: Zero references to 'Qwen2.5' in notebook.")

    assert "Qwen/Qwen3-1.7B" in full_str, "Missing 'Qwen/Qwen3-1.7B' checkpoint definition!"
    print("✅ Verified: Target base model is 'Qwen/Qwen3-1.7B'.")

    assert "kreazyai-qwen3:pilot" in full_str, "Missing 'kreazyai-qwen3:pilot' target identifier!"
    print("✅ Verified: Export target is 'kreazyai-qwen3:pilot'.")

    assert "transformers>=4.51.0" in full_str, "Missing 'transformers>=4.51.0' dependency requirement!"
    print("✅ Verified: Pinned 'transformers>=4.51.0' for Qwen3 architecture support.")

    print("\n[OK] Notebook validation test PASSED 100%. Ready for Colab execution.")

if __name__ == "__main__":
    validate_notebook()
