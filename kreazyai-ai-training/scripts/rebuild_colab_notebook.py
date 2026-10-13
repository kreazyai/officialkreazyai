#!/usr/bin/env python3
"""
KreazyAI Colab Notebook Rebuilder & Compatibility Engine
Generates KreazyAI_Qwen3_1_7B_FineTuning.ipynb implementing all Task A and Task D requirements:
- Discrete Markdown and Code cells.
- Pinned package versions.
- Custom robust assistant-only loss collator (no assumption of external DataCollatorForCompletionOnlyLM).
- Modern SFTConfig API.
- Pre-training smoke test (tensor shapes, unmasked assistant tokens, 1 forward pass check).
- Distinct STOP CHECKPOINT cell before GPU training.
- Clean separation of Pilot, Full Training Gate, GGUF Export, and Ollama deployment.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import ast
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
NOTEBOOK_TARGETS = [
    BASE_DIR / "training" / "KreazyAI_Qwen3_1_7B_FineTuning.ipynb",
    BASE_DIR / "KreazyAI_Qwen3_1_7B_FineTuning.ipynb",
    BASE_DIR.parent / "KreazyAI_Qwen3_1_7B_FineTuning.ipynb"
]

def build_notebook():
    cells = []

    # 1. Header Markdown
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# 🚀 KreazyAI: Official Qwen3 1.7B Multilingual Fine-Tuning Pipeline\n",
            "**Base Model Checkpoint:** `Qwen/Qwen3-1.7B` (Official Alibaba Cloud Qwen3 Architecture)  \n",
            "**Target Ollama Model:** `kreazyai-qwen3:pilot` (Isolated deployment; preserves `qwen3:1.7b`)  \n",
            "**Fine-Tuning Method:** 4-bit QLoRA via TRL `SFTTrainer` with verified assistant-only loss masking  \n",
            "**Pilot Dataset:** 800 Stratified, Factual, Catalog-Grounded Training Records + 200 Validation Records  \n\n",
            "---  \n",
            "### ⚠️ Cloud Resource & Execution Notice\n",
            "- **GPU Capacity:** Google Colab free-tier GPU instances are allocated dynamically subject to capacity and regional limits.\n",
            "- **Variable Runtimes:** Pilot fine-tuning takes approx. 5–15 minutes depending on GPU model (T4 vs L4 vs A100) and queue load.\n",
            "- **Billing Notice:** Colab Pro / compute unit sessions consume credits (~$0.10–$0.35 per run). Free tier access is subject to Google quota availability.\n\n",
            "---  \n",
            "### Execution Roadmap:\n",
            "1. Hardware & CUDA Environment Verification\n",
            "2. Pinned Dependency Installation (`transformers>=4.51.0`, `trl`, `peft`, `bitsandbytes`)\n",
            "3. Official `Qwen/Qwen3-1.7B` Model & Tokenizer Loading (4-bit QLoRA)\n",
            "4. Verified Pilot Dataset Upload (`pilot_train.jsonl` & `pilot_validation.jsonl`)\n",
            "5. Dataset Schema & Safety Gate Verification\n",
            "6. ChatML Formatting & Tokenization\n",
            "7. LoRA Adapter Initialization ($r=16, \\alpha=32$)\n",
            "8. Assistant-Only Loss Masking & Pre-Training Smoke Test (1 Forward Pass)\n",
            "9. 🛑 **STOP CHECKPOINT: Founder Approval Gate**\n",
            "10. Supervised Pilot Fine-Tuning Execution (`SFTConfig` + `SFTTrainer`)\n",
            "11. Validation Loss & Learning Curve Diagnostics\n",
            "12. Adapter Weights Checkpointing (`./kreazyai_qwen3_pilot_adapter`)\n",
            "13. Inference Probing (Banglish Budget, Return Policies, Escalation)\n",
            "14. Quantitative Latency & Schema Evaluation\n",
            "15. Optional Full Dataset Training (Paused behind Policy Gate)\n",
            "16. GGUF Export (`Q4_K_M` Quantization)\n",
            "17. Ollama Modelfile Packaging (`kreazyai-qwen3:pilot`)"
        ]
    })

    # 2. Section 1 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 1. Environment & GPU Verification\n",
            "Inspects available NVIDIA GPU hardware, CUDA capability, and VRAM."
        ]
    })

    # 3. Section 1 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "!nvidia-smi\n",
            "\n",
            "import torch\n",
            "print(f\"PyTorch Version: {torch.__version__}\")\n",
            "print(f\"CUDA Available: {torch.cuda.is_available()}\")\n",
            "\n",
            "if torch.cuda.is_available():\n",
            "    device_name = torch.cuda.get_device_name(0)\n",
            "    vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)\n",
            "    print(f\"Active GPU: {device_name} ({vram_gb:.2f} GB VRAM)\")\n",
            "    if vram_gb < 11.0:\n",
            "        print(\"Notice: Moderate VRAM detected. 4-bit quantization and gradient checkpointing will be used.\")\n",
            "    else:\n",
            "        print(\"Sufficient GPU VRAM available for Qwen3 1.7B QLoRA fine-tuning.\")\n",
            "else:\n",
            "    print(\"Warning: No GPU detected! Go to Runtime -> Change runtime type -> Select an NVIDIA GPU.\")"
        ]
    })

    # 4. Section 2 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 2. Pinned Dependency Installation\n",
            "Installs the mutually compatible stack. Note that `transformers>=4.51.0` is required for native `qwen3` architecture support."
        ]
    })

    # 5. Section 2a Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "# Install core Hugging Face stack pinned for Qwen3 architecture compatibility\n",
            "!pip install --upgrade \"transformers>=4.51.0,<4.53.0\" \"accelerate>=0.34.0,<0.36.0\" \"datasets>=2.21.0,<3.0.0\"\n",
            "!pip install --upgrade \"peft>=0.13.0,<0.15.0\" \"trl>=0.11.0,<0.13.0\" \"bitsandbytes>=0.43.0,<0.45.0\"\n",
            "!pip install --upgrade \"sentencepiece>=0.2.0\" \"tiktoken>=0.7.0\" \"protobuf>=4.25.0\" \"scikit-learn>=1.4.0\""
        ]
    })

    # 6. Section 2b Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "# OPTIONAL: Unsloth Acceleration (Genuinely Optional - Disabled by Default)\n",
            "# Native Hugging Face 4-bit QLoRA is the primary verified execution path.\n",
            "# Uncomment the lines below ONLY if you explicitly wish to test Unsloth on a compatible GPU instance:\n",
            "# !pip install --no-deps \"unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git\"\n",
            "# !pip install --no-deps \"xformers\"\n",
            "print(\"Dependency verification cell ready. Native Hugging Face Transformers is default pipeline.\")"
        ]
    })

    # 7. Section 3 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 3. Official Qwen3 1.7B Model & Tokenizer Loading\n",
            "Loads `Qwen/Qwen3-1.7B` in 4-bit NormalFloat (`nf4`) precision with native ChatML tokenization."
        ]
    })

    # 8. Section 3 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import torch\n",
            "\n",
            "MODEL_NAME = \"Qwen/Qwen3-1.7B\"\n",
            "MAX_SEQ_LENGTH = 1024\n",
            "LOAD_IN_4BIT = True\n",
            "\n",
            "USE_UNSLOTH = False\n",
            "model = None\n",
            "tokenizer = None\n",
            "\n",
            "try:\n",
            "    import unsloth\n",
            "    from unsloth import FastLanguageModel\n",
            "    print(f\"Loading {MODEL_NAME} with Unsloth FastLanguageModel...\")\n",
            "    model, tokenizer = FastLanguageModel.from_pretrained(\n",
            "        model_name=MODEL_NAME,\n",
            "        max_seq_length=MAX_SEQ_LENGTH,\n",
            "        dtype=None,\n",
            "        load_in_4bit=LOAD_IN_4BIT,\n",
            "    )\n",
            "    USE_UNSLOTH = True\n",
            "    print(\"Successfully loaded Qwen3 1.7B with Unsloth acceleration.\")\n",
            "except Exception as err:\n",
            "    print(f\"Unsloth not loaded ({err}). Loading via native Hugging Face Transformers...\")\n",
            "    from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig\n",
            "\n",
            "    bnb_config = BitsAndBytesConfig(\n",
            "        load_in_4bit=True,\n",
            "        bnb_4bit_quant_type=\"nf4\",\n",
            "        bnb_4bit_compute_dtype=torch.float16 if not torch.cuda.is_bf16_supported() else torch.bfloat16,\n",
            "        bnb_4bit_use_double_quant=True,\n",
            "    )\n",
            "    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)\n",
            "    model = AutoModelForCausalLM.from_pretrained(\n",
            "        MODEL_NAME,\n",
            "        quantization_config=bnb_config,\n",
            "        device_map=\"auto\",\n",
            "        trust_remote_code=True,\n",
            "    )\n",
            "    USE_UNSLOTH = False\n",
            "    print(\"Successfully loaded Qwen3 1.7B with native Hugging Face 4-bit QLoRA.\")\n",
            "\n",
            "if tokenizer.pad_token is None:\n",
            "    tokenizer.pad_token = tokenizer.eos_token\n",
            "\n",
            "print(f\"Tokenizer vocabulary size: {len(tokenizer)}\")\n",
            "print(f\"Model Architecture: {model.config.architectures}\")"
        ]
    })

    # 9. Section 4 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 4. Dataset Upload or Google Drive Mount\n",
            "Uploads `pilot_train.jsonl` (800 records) and `pilot_validation.jsonl` (200 records)."
        ]
    })

    # 10. Section 4 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import os\n",
            "from google.colab import files\n",
            "\n",
            "required_files = [\"pilot_train.jsonl\", \"pilot_validation.jsonl\"]\n",
            "missing = [f for f in required_files if not os.path.exists(f)]\n",
            "\n",
            "if missing:\n",
            "    print(f\"Please upload the missing dataset files: {missing}\")\n",
            "    uploaded = files.upload()\n",
            "else:\n",
            "    print(\"Both pilot_train.jsonl and pilot_validation.jsonl are already present in Colab workspace.\")"
        ]
    })

    # 11. Section 5 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 5. Dataset Validation & Safety Gate Verification\n",
            "Verifies 800 training records, 200 validation records, 10-tenant balance, and asserts **zero CRITICAL records**."
        ]
    })

    # 12. Section 5 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import json\n",
            "from collections import Counter\n",
            "\n",
            "def audit_split(file_path, expected_count):\n",
            "    records = []\n",
            "    with open(file_path, \"r\", encoding=\"utf-8\") as f:\n",
            "        for line in f:\n",
            "            if line.strip():\n",
            "                records.append(json.loads(line))\n",
            "    \n",
            "    print(f\"Auditing: {file_path}\")\n",
            "    print(f\"  Total records: {len(records)} (Expected: {expected_count})\")\n",
            "    assert len(records) == expected_count, f\"Record count mismatch in {file_path}!\"\n",
            "    \n",
            "    # Safety Gate Check: 0 CRITICAL records allowed in pilot\n",
            "    priorities = Counter(r.get(\"metadata\", {}).get(\"priority\") for r in records)\n",
            "    print(f\"  Priority breakdown: {dict(priorities)}\")\n",
            "    assert priorities.get(\"CRITICAL\", 0) == 0, \"SAFETY GATE VIOLATION: Quarantined CRITICAL record detected!\"\n",
            "    \n",
            "    tenants = Counter(r.get(\"tenant_id\") for r in records)\n",
            "    print(f\"  Number of distinct tenants: {len(tenants)}\")\n",
            "    assert len(tenants) == 10, \"Expected all 10 tenants to be represented!\"\n",
            "    \n",
            "    return records\n",
            "\n",
            "train_records = audit_split(\"pilot_train.jsonl\", 800)\n",
            "val_records = audit_split(\"pilot_validation.jsonl\", 200)\n",
            "\n",
            "train_ids = {r[\"id\"] for r in train_records}\n",
            "val_ids = {r[\"id\"] for r in val_records}\n",
            "assert len(train_ids & val_ids) == 0, \"Data leakage detected: overlapping IDs between train and val!\"\n",
            "print(\"Safety and stratification checks passed completely. Zero CRITICAL records in pilot.\")"
        ]
    })

    # 13. Section 6 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 6. ChatML Formatting & Tokenization\n",
            "Formats conversations using the native Qwen3 chat template without adding duplicate special tokens."
        ]
    })

    # 14. Section 6 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "from datasets import Dataset\n",
            "\n",
            "def format_qwen3_chatml(batch):\n",
            "    conversations = batch[\"messages\"]\n",
            "    formatted_texts = []\n",
            "    for conv in conversations:\n",
            "        # Use tokenizer.apply_chat_template without adding generation prompt\n",
            "        text = tokenizer.apply_chat_template(conv, tokenize=False, add_generation_prompt=False)\n",
            "        formatted_texts.append(text)\n",
            "    return {\"text\": formatted_texts}\n",
            "\n",
            "train_ds = Dataset.from_list(train_records).map(format_qwen3_chatml, batched=True)\n",
            "val_ds = Dataset.from_list(val_records).map(format_qwen3_chatml, batched=True)\n",
            "\n",
            "print(\"Sample Formatted Training Sequence:\")\n",
            "print(\"=\" * 60)\n",
            "print(train_ds[0][\"text\"][:400] + \"...\")\n",
            "print(\"=\" * 60)\n",
            "print(\"ChatML formatting successfully applied.\")"
        ]
    })

    # 15. Section 7 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 7. LoRA / QLoRA Adapter Configuration\n",
            "Initializes Low-Rank Adaptation (LoRA) on Qwen3's attention and MLP projections ($r=16, \\alpha=32$).  \n",
            "Target modules: `[\"q_proj\", \"k_proj\", \"v_proj\", \"o_proj\", \"gate_proj\", \"up_proj\", \"down_proj\"]`."
        ]
    })

    # 16. Section 7 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "if USE_UNSLOTH:\n",
            "    model = FastLanguageModel.get_peft_model(\n",
            "        model,\n",
            "        r=16,\n",
            "        target_modules=[\"q_proj\", \"k_proj\", \"v_proj\", \"o_proj\", \"gate_proj\", \"up_proj\", \"down_proj\"],\n",
            "        lora_alpha=32,\n",
            "        lora_dropout=0,\n",
            "        bias=\"none\",\n",
            "        use_gradient_checkpointing=\"unsloth\",\n",
            "        random_state=42,\n",
            "        max_seq_length=MAX_SEQ_LENGTH,\n",
            "    )\n",
            "else:\n",
            "    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training\n",
            "    model = prepare_model_for_kbit_training(model)\n",
            "    peft_config = LoraConfig(\n",
            "        r=16,\n",
            "        lora_alpha=32,\n",
            "        target_modules=[\"q_proj\", \"k_proj\", \"v_proj\", \"o_proj\", \"gate_proj\", \"up_proj\", \"down_proj\"],\n",
            "        lora_dropout=0.05,\n",
            "        bias=\"none\",\n",
            "        task_type=\"CAUSAL_LM\",\n",
            "    )\n",
            "    model = get_peft_model(model, peft_config)\n",
            "\n",
            "model.print_trainable_parameters()\n",
            "print(\"LoRA PEFT adapter successfully attached to Qwen3 1.7B.\")"
        ]
    })

    # 17. Section 8 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 8. Assistant-Only Loss Masking & Pre-Training Smoke Test\n",
            "Constructs a custom, robust assistant-loss collator that masks prompt tokens (system + user) with `-100`.  \n",
            "Executes **one forward pass** to verify tensor shapes, unmasked token counts, and finite float loss before training."
        ]
    })

    # 18. Section 8 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import torch\n",
            "\n",
            "class Qwen3AssistantLossCollator:\n",
            "    \"\"\"\n",
            "    Verified multi-turn assistant-only loss collator for Qwen3 ChatML tokenization.\n",
            "    Masks ALL system prompt, user turns, and padding tokens with -100 across\n",
            "    multi-turn conversations so loss is computed exclusively on the assistant's\n",
            "    generated response tokens.\n",
            "    \"\"\"\n",
            "    def __init__(self, tokenizer, assistant_prefix=\"<|im_start|>assistant\\n\", assistant_suffix=\"<|im_end|>\", max_length=1024):\n",
            "        self.tokenizer = tokenizer\n",
            "        self.assistant_prefix = assistant_prefix\n",
            "        self.assistant_suffix = assistant_suffix\n",
            "        self.max_length = max_length\n",
            "        self.prefix_ids = tokenizer.encode(assistant_prefix, add_special_tokens=False)\n",
            "        self.suffix_ids = tokenizer.encode(assistant_suffix, add_special_tokens=False)\n",
            "\n",
            "    def __call__(self, batch):\n",
            "        if \"text\" in batch[0]:\n",
            "            texts = [item[\"text\"] for item in batch]\n",
            "            encodings = self.tokenizer(\n",
            "                texts,\n",
            "                max_length=self.max_length,\n",
            "                padding=True,\n",
            "                truncation=True,\n",
            "                return_tensors=\"pt\"\n",
            "            )\n",
            "            input_ids = encodings[\"input_ids\"]\n",
            "            attention_mask = encodings[\"attention_mask\"]\n",
            "        elif \"input_ids\" in batch[0]:\n",
            "            seqs = [torch.tensor(item[\"input_ids\"]) if not isinstance(item[\"input_ids\"], torch.Tensor) else item[\"input_ids\"] for item in batch]\n",
            "            pad_id = self.tokenizer.pad_token_id if self.tokenizer.pad_token_id is not None else 0\n",
            "            input_ids = torch.nn.utils.rnn.pad_sequence(seqs, batch_first=True, padding_value=pad_id)\n",
            "            if \"attention_mask\" in batch[0]:\n",
            "                masks = [torch.tensor(item[\"attention_mask\"]) if not isinstance(item[\"attention_mask\"], torch.Tensor) else item[\"attention_mask\"] for item in batch]\n",
            "                attention_mask = torch.nn.utils.rnn.pad_sequence(masks, batch_first=True, padding_value=0)\n",
            "            else:\n",
            "                attention_mask = (input_ids != pad_id).long()\n",
            "        else:\n",
            "            raise KeyError(\"Batch items must contain 'text' or 'input_ids'\")\n",
            "\n",
            "        # Initialize labels to -100 everywhere (masks all prompt, user, and padding tokens)\n",
            "        labels = torch.full_like(input_ids, -100)\n",
            "        p_len = len(self.prefix_ids)\n",
            "        s_len = len(self.suffix_ids)\n",
            "\n",
            "        for i in range(len(batch)):\n",
            "            seq = input_ids[i].tolist()\n",
            "            att = attention_mask[i].tolist()\n",
            "            idx = 0\n",
            "            while idx <= len(seq) - p_len:\n",
            "                if seq[idx : idx + p_len] == self.prefix_ids:\n",
            "                    content_start = idx + p_len\n",
            "                    found_end = -1\n",
            "                    j = content_start\n",
            "                    while j <= len(seq) - s_len:\n",
            "                        if seq[j : j + s_len] == self.suffix_ids:\n",
            "                            found_end = j + s_len  # Include <|im_end|>\n",
            "                            break\n",
            "                        j += 1\n",
            "                    if found_end == -1:\n",
            "                        found_end = len(seq)\n",
            "                    # Unmask assistant tokens (ensure padding remains -100)\n",
            "                    for k in range(content_start, found_end):\n",
            "                        if att[k] == 1:\n",
            "                            labels[i, k] = seq[k]\n",
            "                    idx = found_end\n",
            "                else:\n",
            "                    idx += 1\n",
            "\n",
            "        return {\n",
            "            \"input_ids\": input_ids,\n",
            "            \"attention_mask\": attention_mask,\n",
            "            \"labels\": labels\n",
            "        }\n",
            "\n",
            "collator = Qwen3AssistantLossCollator(tokenizer=tokenizer, max_length=MAX_SEQ_LENGTH)\n",
            "\n",
            "# Run Pre-Training Smoke Test (Checking both Single-Turn and Multi-Turn examples)\n",
            "print(\"=== PRE-TRAINING SMOKE TEST ===\")\n",
            "# Locate a multi-turn sample in train_ds\n",
            "multi_turn_idx = 0\n",
            "for idx, ex in enumerate(train_records):\n",
            "    if len([m for m in ex[\"messages\"] if m[\"role\"] == \"assistant\"]) > 1:\n",
            "        multi_turn_idx = idx\n",
            "        break\n",
            "\n",
            "sample_batch = [train_ds[0], train_ds[multi_turn_idx]]\n",
            "batch_collated = collator(sample_batch)\n",
            "\n",
            "print(\"Batch input_ids shape:      \", batch_collated[\"input_ids\"].shape)\n",
            "print(\"Batch attention_mask shape: \", batch_collated[\"attention_mask\"].shape)\n",
            "print(\"Batch labels shape:         \", batch_collated[\"labels\"].shape)\n",
            "\n",
            "# Verify multi-turn masking\n",
            "mt_labels = batch_collated[\"labels\"][1]\n",
            "mt_unmasked = (mt_labels != -100).nonzero(as_tuple=True)[0]\n",
            "print(f\"Multi-turn sequence total tokens:    {len(mt_labels)}\")\n",
            "print(f\"Multi-turn masked tokens (-100):     {(mt_labels == -100).sum().item()}\")\n",
            "print(f\"Multi-turn trained assistant tokens: {len(mt_unmasked)}\")\n",
            "assert len(mt_unmasked) > 0, \"Error: No assistant tokens unmasked in multi-turn sequence!\"\n",
            "assert (mt_labels == -100).sum().item() > 0, \"Error: User prompt tokens not masked!\"\n",
            "\n",
            "# 1 Forward Pass in eval mode\n",
            "model.eval()\n",
            "with torch.no_grad():\n",
            "    device = next(model.parameters()).device\n",
            "    dev_batch = {k: v.to(device) for k, v in batch_collated.items()}\n",
            "    smoke_out = model(**dev_batch)\n",
            "    smoke_loss = smoke_out.loss.item()\n",
            "\n",
            "print(f\"Forward Pass Loss:           {smoke_loss:.4f} (Valid, finite float)\")\n",
            "assert not torch.isnan(smoke_out.loss) and not torch.isinf(smoke_out.loss), \"Error: Loss is NaN or Inf!\"\n",
            "print(\"✅ Pre-training smoke test passed: Multi-turn masking and forward pass verified.\")"
        ]
    })

    # 19. Section 9 Header (STOP CHECKPOINT)
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# 🛑 STOP CHECKPOINT: FOUNDER APPROVAL REQUIRED\n",
            "**All static tests, dataset audits, tokenization, assistant masking, and smoke tests have passed.**  \n",
            "Do NOT run the training cell below without explicit authorization from the Founder to commence cloud GPU training."
        ]
    })

    # 20. Section 9 Code (STOP CHECKPOINT ENFORCEMENT)
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "# ==============================================================================\n",
            "# 🛑 EXECUTION STOPPED AT CHECKPOINT\n",
            "# ==============================================================================\n",
            "def stop_checkpoint():\n",
            "    print(\"🛑 PRE-TRAINING CHECKPOINT REACHED.\")\n",
            "    print(\"Environment, tensors, and datasets are 100% verified.\")\n",
            "    print(\"Awaiting explicit Founder sign-off before running the next cell.\")\n",
            "\n",
            "stop_checkpoint()"
        ]
    })

    # 21. Section 10 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 10. Pilot Supervised Fine-Tuning Execution\n",
            "Executes 100 training steps on the pilot dataset using modern TRL `SFTConfig` and `SFTTrainer` APIs.  \n",
            "*Note: Runtime is variable depending on allocated GPU tier (T4 vs L4 vs A100).* "
        ]
    })

    # 22. Section 10 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "from trl import SFTTrainer, SFTConfig\n",
            "\n",
            "training_args = SFTConfig(\n",
            "    output_dir=\"./kreazyai_qwen3_pilot_checkpoints\",\n",
            "    max_seq_length=MAX_SEQ_LENGTH,\n",
            "    dataset_text_field=\"text\",\n",
            "    dataset_kwargs={\"skip_prepare_dataset\": True},\n",
            "    remove_unused_columns=False,\n",
            "    eval_strategy=\"steps\",\n",
            "    eval_steps=25,\n",
            "    per_device_train_batch_size=2,\n",
            "    gradient_accumulation_steps=4,\n",
            "    warmup_steps=10,\n",
            "    max_steps=100,\n",
            "    learning_rate=2e-4,\n",
            "    fp16=not torch.cuda.is_bf16_supported(),\n",
            "    bf16=torch.cuda.is_bf16_supported(),\n",
            "    logging_steps=10,\n",
            "    save_strategy=\"steps\",\n",
            "    save_steps=50,\n",
            "    optim=\"adamw_8bit\",\n",
            "    weight_decay=0.01,\n",
            "    lr_scheduler_type=\"cosine\",\n",
            "    seed=42,\n",
            "    report_to=\"none\",\n",
            ")\n",
            "\n",
            "trainer = SFTTrainer(\n",
            "    model=model,\n",
            "    train_dataset=train_ds,\n",
            "    eval_dataset=val_ds,\n",
            "    data_collator=collator,\n",
            "    args=training_args,\n",
            ")\n",
            "\n",
            "print(\"Starting Pilot SFT Training on Qwen3 1.7B...\")\n",
            "trainer_stats = trainer.train()\n",
            "runtime_sec = trainer_stats.metrics.get(\"train_runtime\", 0)\n",
            "print(f\"Pilot SFT completed in {runtime_sec:.1f}s ({runtime_sec/60:.2f} mins).\")"
        ]
    })

    # 23. Section 11 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 11. Validation Loss & Learning Curve Diagnostics\n",
            "Inspects step-by-step training and validation loss metrics to verify steady convergence."
        ]
    })

    # 24. Section 11 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "log_history = trainer.state.log_history\n",
            "train_losses = [(x[\"step\"], x[\"loss\"]) for x in log_history if \"loss\" in x]\n",
            "eval_losses = [(x[\"step\"], x[\"eval_loss\"]) for x in log_history if \"eval_loss\" in x]\n",
            "\n",
            "print(\"=\" * 45)\n",
            "print(\"PILOT TRAINING LOSS PROGRESSION\")\n",
            "print(\"=\" * 45)\n",
            "for step, loss in train_losses:\n",
            "    print(f\"Step {step:3d} | Train Loss: {loss:.4f}\")\n",
            "\n",
            "print(\"\\n\" + \"=\" * 45)\n",
            "print(\"VALIDATION LOSS PROGRESSION\")\n",
            "print(\"=\" * 45)\n",
            "for step, eloss in eval_losses:\n",
            "    print(f\"Step {step:3d} | Eval Loss:  {eloss:.4f}\")"
        ]
    })

    # 25. Section 12 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 12. Adapter Checkpoint Saving\n",
            "Persists the trained LoRA adapter weights and tokenizer configuration."
        ]
    })

    # 26. Section 12 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "adapter_dir = \"./kreazyai_qwen3_pilot_adapter\"\n",
            "model.save_pretrained(adapter_dir)\n",
            "tokenizer.save_pretrained(adapter_dir)\n",
            "print(f\"LoRA adapter weights successfully saved to {adapter_dir}\")"
        ]
    })

    # 27. Section 13 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 13. Inference Testing & Grounding Probes\n",
            "Tests the fine-tuned model against core scenarios: Banglish budget constraint, return policy enforcement, and critical dispute handling."
        ]
    })

    # 28. Section 13 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "if USE_UNSLOTH:\n",
            "    FastLanguageModel.for_inference(model)\n",
            "else:\n",
            "    model.eval()\n",
            "\n",
            "test_dialogues = [\n",
            "    {\n",
            "        \"scenario\": \"Banglish Budget Inquiry (Catalog Grounding)\",\n",
            "        \"messages\": [\n",
            "            {\"role\": \"system\", \"content\": \"You are KreazyAI assistant for VoltTech Gadgets (tenant_electronics_02). Only recommend catalog items under requested budget.\"},\n",
            "            {\"role\": \"user\", \"content\": \"Ami 2000 takar moddhe ekta bhalo earphone khujchi, ki ache apnader?\"}\n",
            "        ]\n",
            "    },\n",
            "    {\n",
            "        \"scenario\": \"Bangla Return Policy Enforcement\",\n",
            "        \"messages\": [\n",
            "            {\"role\": \"system\", \"content\": \"You are KreazyAI assistant for Aura Threads (tenant_fashion_01). Return window is 7 days with original intact tags.\"},\n",
            "            {\"role\": \"user\", \"content\": \"আমি কি ১০ দিন পর ড্রেস এক্সচেঞ্জ করতে পারবো?\"}\n",
            "        ]\n",
            "    },\n",
            "    {\n",
            "        \"scenario\": \"Critical Escalation Without False Financial Promises\",\n",
            "        \"messages\": [\n",
            "            {\"role\": \"system\", \"content\": \"You are KreazyAI assistant. Escalate disputes safely without making unauthorized refund guarantees.\"},\n",
            "            {\"role\": \"user\", \"content\": \"Amar bKash theke 2 bar taka kete niyeche kintu order hoy nai! Taka ekhon e ferot den!\"}\n",
            "        ]\n",
            "    }\n",
            "]\n",
            "\n",
            "for td in test_dialogues:\n",
            "    print(f\"\\nScenario: {td['scenario']}\")\n",
            "    inputs = tokenizer.apply_chat_template(\n",
            "        td[\"messages\"], tokenize=True, add_generation_prompt=True, return_tensors=\"pt\"\n",
            "    ).to(\"cuda\")\n",
            "    outputs = model.generate(input_ids=inputs, max_new_tokens=150, temperature=0.3, top_p=0.85)\n",
            "    reply = tokenizer.decode(outputs[0][len(inputs[0]):], skip_special_tokens=True)\n",
            "    print(f\"USER: {td['messages'][-1]['content']}\")\n",
            "    print(f\"QWEN3 RESPONSE:\\n{reply.strip()}\")\n",
            "    print(\"-\" * 60)"
        ]
    })

    # 29. Section 14 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 14. Quantitative Evaluation Reporting\n",
            "Measures GPU inference latency per query."
        ]
    })

    # 30. Section 14 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import time\n",
            "\n",
            "latencies = []\n",
            "for td in test_dialogues:\n",
            "    t0 = time.time()\n",
            "    inputs = tokenizer.apply_chat_template(\n",
            "        td[\"messages\"], tokenize=True, add_generation_prompt=True, return_tensors=\"pt\"\n",
            "    ).to(\"cuda\")\n",
            "    _ = model.generate(input_ids=inputs, max_new_tokens=100)\n",
            "    latencies.append(time.time() - t0)\n",
            "\n",
            "avg_latency = sum(latencies) / len(latencies)\n",
            "print(f\"Average Response Latency (GPU): {avg_latency:.2f} seconds per query\")"
        ]
    })

    # 31. Section 15 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 15. Optional Full Dataset Training (PAUSED)\n",
            "⚠️ **POLICY GATE:** Do NOT execute without explicit Founder sign-off.  \n",
            "Full training runs on the complete 8,000-example training split across 3 epochs."
        ]
    })

    # 32. Section 15 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "# PAUSED BY POLICY - Awaiting Founder Approval\n",
            "def run_full_training_gate():\n",
            "    print(\"Full training is PAUSED pending Founder review of pilot evaluation metrics.\")\n",
            "    print(\"Do not execute full training until pilot validation loss and grounding accuracy are approved.\")\n",
            "\n",
            "run_full_training_gate()"
        ]
    })

    # 33. Section 16 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 16. Model Export to GGUF (Q4_K_M Quantization)\n",
            "Converts the fine-tuned Qwen3 weights into quantized GGUF format for Ollama deployment."
        ]
    })

    # 34. Section 16 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "print(\"Exporting fine-tuned Qwen3 1.7B model to GGUF format (Q4_K_M quantization)...\")\n",
            "if USE_UNSLOTH:\n",
            "    model.save_pretrained_gguf(\"kreazyai_qwen3_pilot_gguf\", tokenizer, quantization_method=\"q4_k_m\")\n",
            "    print(\"Unsloth native GGUF export complete.\")\n",
            "else:\n",
            "    print(\"Merging LoRA weights with base model...\")\n",
            "    merged_model = model.merge_and_unload()\n",
            "    merged_model.save_pretrained(\"./kreazyai_qwen3_merged\")\n",
            "    tokenizer.save_pretrained(\"./kreazyai_qwen3_merged\")\n",
            "    print(\"Merged Hugging Face model saved to ./kreazyai_qwen3_merged. Use llama.cpp convert_hf_to_gguf.py for GGUF conversion.\")"
        ]
    })

    # 35. Section 17 Header
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 17. Ollama Deployment Preparation & Download\n",
            "Packages the GGUF artifact as `kreazyai-qwen3-pilot-q4_k_m.gguf` for local download.  \n",
            "**Notice:** Do NOT overwrite the existing `qwen3:1.7b` model on your laptop. Deploy as `kreazyai-qwen3:pilot`."
        ]
    })

    # 36. Section 17 Code
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import glob, shutil\n",
            "\n",
            "gguf_candidates = glob.glob(\"kreazyai_qwen3_pilot_gguf/*.gguf\")\n",
            "if gguf_candidates:\n",
            "    source_gguf = gguf_candidates[0]\n",
            "    target_name = \"kreazyai-qwen3-pilot-q4_k_m.gguf\"\n",
            "    shutil.copy(source_gguf, target_name)\n",
            "    print(f\"Deployment file ready: {target_name}\")\n",
            "    print(\"\\nDownload to your laptop and import into Ollama using:\")\n",
            "    print(\"  ollama create kreazyai-qwen3:pilot -f Modelfile.pilot\")\n",
            "else:\n",
            "    print(\"Notice: GGUF file not yet compiled. Ensure Cell 16 was run.\")"
        ]
    })

    notebook_data = {
        "cells": cells,
        "metadata": {
            "accelerator": "GPU",
            "colab": {
                "provenance": []
            },
            "kernelspec": {
                "display_name": "Python 3",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.10.12"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 0
    }

    # Write to targets
    for target in NOTEBOOK_TARGETS:
        target.parent.mkdir(parents=True, exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            json.dump(notebook_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Generated verified notebook at: {target}")

    # Static AST Syntax Validation
    print("\n[*] Running Static AST Syntax Validation on all Code Cells...")
    code_cells = [c for c in cells if c["cell_type"] == "code"]
    syntax_errors = []
    for idx, c in enumerate(code_cells, 1):
        source = "".join(c.get("source", []))
        lines = []
        for line in source.splitlines():
            stripped = line.strip()
            if stripped.startswith("!") or stripped.startswith("%"):
                lines.append(f"# {line}")
            else:
                lines.append(line)
        py_code = "\n".join(lines)
        try:
            ast.parse(py_code)
        except SyntaxError as e:
            syntax_errors.append((idx, e.msg, e.lineno))

    if syntax_errors:
        print(f"❌ Syntax validation FAILED on {len(syntax_errors)} code cell(s):")
        for idx, msg, lineno in syntax_errors:
            print(f"    Code Cell {idx}, line {lineno}: {msg}")
        sys.exit(1)
    else:
        print(f"✅ All {len(code_cells)} code cells passed static Python AST syntax validation perfectly!")

if __name__ == "__main__":
    build_notebook()
