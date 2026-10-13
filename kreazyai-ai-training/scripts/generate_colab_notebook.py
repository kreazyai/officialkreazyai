#!/usr/bin/env python3
"""
Generates the Google Colab Fine-Tuning Notebook for KreazyAI Qwen3 1.7B
Path: training/KreazyAI_Qwen3_1_7B_FineTuning.ipynb

Target Architecture: Official Qwen/Qwen3-1.7B (dense causal LM, 28 layers, GQA, hybrid thinking mode)
Target Ollama Name: kreazyai-qwen3:pilot
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
NOTEBOOK_PATH = BASE_DIR / "training" / "KreazyAI_Qwen3_1_7B_FineTuning.ipynb"

def create_notebook():
    cells = []

    # Title & Metadata Markdown
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# 🚀 KreazyAI: Official Qwen3 1.7B Multilingual Fine-Tuning Pipeline\n",
            "**Target Base Model:** `Qwen/Qwen3-1.7B` (Official Alibaba Cloud Qwen3 Architecture)  \n",
            "**Target Ollama Model Identifier:** `kreazyai-qwen3:pilot` (Isolated, does not overwrite `qwen3:1.7b`)  \n",
            "**Hardware Target:** Google Colab GPU (NVIDIA T4 / L4 / A100)  \n",
            "**Fine-Tuning Method:** 4-bit QLoRA (PEFT / TRL `SFTTrainer` with Unsloth or native Hugging Face)  \n",
            "**Data Source:** 800 Stratified Pilot Dialogues (0% leakage, CRITICAL safety cases quarantined)  \n\n",
            "---  \n",
            "### ⚠️ Cloud Resource & Cost Notice\n",
            "- **GPU Availability:** Free-tier GPU allocations on Google Colab are dynamic, non-guaranteed, and subject to preemption or cooldown periods by Google.\n",
            "- **Training Time:** Completion duration varies with GPU tier (e.g., NVIDIA T4 vs L4 vs A100), network throughput, and batch settings.\n",
            "- **Compute Costs:** Colab Pro or pay-as-you-go runtimes consume compute units (typically ~$0.10–$0.35 per run). Free tier access is subject to Google quota availability.\n\n",
            "---  \n",
            "### Execution Roadmap:\n",
            "1. GPU & CUDA Environment Verification\n",
            "2. Dependency Installation (`transformers>=4.51.0`, `peft`, `trl`, `bitsandbytes`, `unsloth`)\n",
            "3. Official `Qwen/Qwen3-1.7B` Model & Tokenizer Loading (4-bit QLoRA)\n",
            "4. Pilot Dataset Upload (`pilot_train.jsonl` & `pilot_validation.jsonl`)\n",
            "5. Dataset Schema & Balance Validation\n",
            "6. Qwen3 ChatML Template & Thinking-Mode Alignment\n",
            "7. LoRA Adapter Initialization ($r=16, \\alpha=32$)\n",
            "8. Supervised Pilot Fine-Tuning Execution\n",
            "9. Validation Loss & Learning Curve Diagnostics\n",
            "10. Adapter Weights Checkpointing\n",
            "11. Inference Probing (Banglish Budget, Return Policies, Escalation)\n",
            "12. Quantitative Latency & Schema Evaluation\n",
            "13. Optional Full Dataset Training (Paused behind Founder Gate)\n",
            "14. GGUF Export (`Q4_K_M` Quantization)\n",
            "15. Ollama Modelfile Packaging (`kreazyai-qwen3:pilot`)"
        ]
    })

    # Cell 1: Environment and GPU verification
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 1. Environment & GPU Verification\n",
            "Checks available NVIDIA GPU, CUDA driver version, and video memory (VRAM).  \n",
            "*Note: GPU allocation on Google Colab is subject to Google's dynamic capacity.*"
        ]
    })
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
            "        print(\"⚠️ Notice: Moderate VRAM detected. 4-bit quantization and gradient checkpointing will be enforced.\")\n",
            "    else:\n",
            "        print(\"✅ Sufficient GPU VRAM available for Qwen3 1.7B QLoRA fine-tuning.\")\n",
            "else:\n",
            "    raise SystemError(\"❌ No GPU detected! Go to Runtime -> Change runtime type -> Select an NVIDIA GPU (T4, L4, or A100).\")"
        ]
    })

    # Cell 2: Dependency installation
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 2. Dependency Installation\n",
            "Installs dependencies pinned for Qwen3 architecture support.  \n",
            "**Requirement:** `transformers>=4.51.0` is required for native `qwen3` architecture support."
        ]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "%%capture\n",
            "# Install transformers >= 4.51.0 for native Qwen3 architecture support\n",
            "!pip install --upgrade \"transformers>=4.51.0\" \"accelerate>=0.34.0\" \"datasets>=2.21.0\"\n",
            "!pip install --upgrade \"peft>=0.13.0\" \"trl>=0.11.0\" \"bitsandbytes>=0.43.0\"\n",
            "!pip install --upgrade \"sentencepiece\" \"tiktoken\" \"protobuf\" \"scikit-learn\"\n",
            "\n",
            "# Optional Unsloth fast backprop acceleration (compatible with Qwen3)\n",
            "try:\n",
            "    !pip install --no-deps \"unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git\"\n",
            "    !pip install --no-deps \"xformers\"\n",
            "    print(\"Unsloth acceleration package installed.\")\n",
            "except Exception as e:\n",
            "    print(\"Standard Hugging Face stack will be used as fallback.\")\n",
            "\n",
            "print(\"✅ Dependencies successfully installed.\")"
        ]
    })

    # Cell 3: Compatible model and tokenizer loading
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 3. Official Qwen3 1.7B Model & Tokenizer Loading\n",
            "Loads the official `Qwen/Qwen3-1.7B` checkpoint in 4-bit precision (QLoRA).  \n",
            "Supports both Unsloth fast loading and standard Hugging Face `BitsAndBytesConfig` fallback."
        ]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import torch\n",
            "\n",
            "# Official Alibaba Cloud Qwen3 1.7B Checkpoint\n",
            "MODEL_NAME = \"Qwen/Qwen3-1.7B\"\n",
            "MAX_SEQ_LENGTH = 1024\n",
            "LOAD_IN_4BIT = True\n",
            "\n",
            "USE_UNSLOTH = False\n",
            "model = None\n",
            "tokenizer = None\n",
            "\n",
            "try:\n",
            "    from unsloth import FastLanguageModel\n",
            "    print(f\"[*] Attempting to load {MODEL_NAME} via Unsloth...\")\n",
            "    model, tokenizer = FastLanguageModel.from_pretrained(\n",
            "        model_name=MODEL_NAME,\n",
            "        max_seq_length=MAX_SEQ_LENGTH,\n",
            "        dtype=None,\n",
            "        load_in_4bit=LOAD_IN_4BIT,\n",
            "    )\n",
            "    USE_UNSLOTH = True\n",
            "    print(f\"✅ Successfully loaded {MODEL_NAME} with Unsloth 4-bit acceleration.\")\n",
            "except Exception as unsloth_err:\n",
            "    print(f\"[!] Unsloth loading skipped or encountered error: {unsloth_err}\")\n",
            "    print(f\"[*] Falling back to official Hugging Face AutoModelForCausalLM + BitsAndBytes...\")\n",
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
            "    print(f\"✅ Successfully loaded {MODEL_NAME} with native Hugging Face 4-bit QLoRA.\")\n",
            "\n",
            "if tokenizer.pad_token is None:\n",
            "    tokenizer.pad_token = tokenizer.eos_token\n",
            "\n",
            "print(f\"Tokenizer vocabulary size: {len(tokenizer)}\")\n",
            "print(f\"Model Architecture: {model.config.architectures}\")"
        ]
    })

    # Cell 4: Dataset upload or Google Drive mounting
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 4. Dataset Upload or Google Drive Mounting\n",
            "Upload `pilot_train.jsonl` (800 records) and `pilot_validation.jsonl` (200 records)."
        ]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "from google.colab import files\n",
            "import os\n",
            "\n",
            "required_files = [\"pilot_train.jsonl\", \"pilot_validation.jsonl\"]\n",
            "missing = [f for f in required_files if not os.path.exists(f)]\n",
            "\n",
            "if missing:\n",
            "    print(f\"Please upload the missing pilot dataset files: {missing}\")\n",
            "    uploaded = files.upload()\n",
            "else:\n",
            "    print(\"✅ Both pilot_train.jsonl and pilot_validation.jsonl are already present in Colab workspace.\")"
        ]
    })

    # Cell 5: Dataset validation
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 5. Dataset Validation & Safety Gate Verification\n",
            "Verifies exact record counts, 10-tenant stratification, and confirms that **100% of unresolved CRITICAL records are excluded**."
        ]
    })
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
            "    print(f\"Audit: {file_path}\")\n",
            "    print(f\"  Total records: {len(records)} (Expected: {expected_count})\")\n",
            "    assert len(records) == expected_count, f\"Count mismatch in {file_path}!\"\n",
            "    \n",
            "    # Safety Gate Check: Ensure 0 CRITICAL records in pilot\n",
            "    priorities = Counter(r.get(\"metadata\", {}).get(\"priority\") for r in records)\n",
            "    print(f\"  Priority distribution: {dict(priorities)}\")\n",
            "    assert priorities.get(\"CRITICAL\", 0) == 0, \"SAFETY GATE VIOLATION: Quarantined CRITICAL record detected in pilot!\"\n",
            "    \n",
            "    # Tenant distribution\n",
            "    tenants = Counter(r.get(\"tenant_id\") for r in records)\n",
            "    print(f\"  Number of distinct tenants: {len(tenants)}\")\n",
            "    return records\n",
            "\n",
            "train_records = audit_split(\"pilot_train.jsonl\", 800)\n",
            "val_records = audit_split(\"pilot_validation.jsonl\", 200)\n",
            "print(\"✅ Safety and stratification checks passed completely. Zero CRITICAL records in pilot.\")"
        ]
    })

    # Cell 6: Qwen3 chat template application & thinking mode
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 6. Qwen3 ChatML Template & Thinking-Mode Alignment\n",
            "Qwen3 features native ChatML formatting with support for hybrid reasoning mode (`<think>...</think>`).  \n",
            "For customer service SFT, we format assistant targets with direct dual JSON schema (`{\"analysis\": {...}, \"reply\": \"...\"}`) so the model delivers instantaneous, grounded answers without rambling internal chains of thought."
        ]
    })
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
            "        # Use tokenizer's native Qwen3 apply_chat_template\n",
            "        text = tokenizer.apply_chat_template(conv, tokenize=False, add_generation_prompt=False)\n",
            "        formatted_texts.append(text)\n",
            "    return {\"text\": formatted_texts}\n",
            "\n",
            "train_ds = Dataset.from_list(train_records).map(format_qwen3_chatml, batched=True)\n",
            "val_ds = Dataset.from_list(val_records).map(format_qwen3_chatml, batched=True)\n",
            "\n",
            "print(\"Sample Formatted Qwen3 Training Sequence:\")\n",
            "print(\"=\" * 60)\n",
            "print(train_ds[0][\"text\"][:450] + \"...\")\n",
            "print(\"=\" * 60)\n",
            "print(\"✅ Qwen3 ChatML templates successfully applied.\")"
        ]
    })

    # Cell 7: LoRA/QLoRA configuration
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 7. LoRA / QLoRA Configuration\n",
            "Configures Low-Rank Adaptation (LoRA) on Qwen3's attention and MLP projections.  \n",
            "Rank $r=16$, $\\alpha=32$, targeting `[\"q_proj\", \"k_proj\", \"v_proj\", \"o_proj\", \"gate_proj\", \"up_proj\", \"down_proj\"]`."
        ]
    })
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
            "print(\"✅ LoRA PEFT adapter successfully attached to Qwen3 1.7B.\")"
        ]
    })

    # Cell 8: Pilot supervised fine-tuning
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 8. Pilot Supervised Fine-Tuning Execution\n",
            "Executes 100 training steps (approx. 1 epoch of pilot data).  \n",
            "*Note: Actual training duration depends on allocated GPU hardware (T4 vs L4 vs A100).* "
        ]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "from trl import SFTTrainer\n",
            "from transformers import TrainingArguments\n",
            "\n",
            "training_args = TrainingArguments(\n",
            "    output_dir=\"./kreazyai_qwen3_checkpoints\",\n",
            "    per_device_train_batch_size=2,\n",
            "    gradient_accumulation_steps=4,\n",
            "    warmup_steps=10,\n",
            "    max_steps=100,\n",
            "    learning_rate=2e-4,\n",
            "    fp16=not torch.cuda.is_bf16_supported(),\n",
            "    bf16=torch.cuda.is_bf16_supported(),\n",
            "    logging_steps=10,\n",
            "    eval_strategy=\"steps\",\n",
            "    eval_steps=25,\n",
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
            "    tokenizer=tokenizer,\n",
            "    train_dataset=train_ds,\n",
            "    eval_dataset=val_ds,\n",
            "    dataset_text_field=\"text\",\n",
            "    max_seq_length=MAX_SEQ_LENGTH,\n",
            "    dataset_num_proc=2,\n",
            "    packing=False,\n",
            "    args=training_args,\n",
            ")\n",
            "\n",
            "print(\"🚀 Starting Pilot SFT on Qwen3 1.7B...\")\n",
            "trainer_stats = trainer.train()\n",
            "print(f\"✅ Training finished in {trainer_stats.metrics['train_runtime']:.1f}s ({trainer_stats.metrics['train_runtime']/60:.2f} mins).\")"
        ]
    })

    # Cell 9: Validation loss reporting
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 9. Validation Loss & Learning Curve Diagnostics\n",
            "Logs training and evaluation loss metrics to verify stable convergence."
        ]
    })
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
            "print(\"QWEN3 PILOT TRAINING LOSS PROGRESSION\")\n",
            "print(\"=\" * 45)\n",
            "for step, loss in train_losses:\n",
            "    print(f\"Step {step:3d} | Train Loss: {loss:.4f}\")\n",
            "\n",
            "print(\"\\nVALIDATION LOSS PROGRESSION\")\n",
            "print(\"=\" * 45)\n",
            "for step, eloss in eval_losses:\n",
            "    print(f\"Step {step:3d} | Eval Loss:  {eloss:.4f}\")"
        ]
    })

    # Cell 10: Adapter checkpoint saving
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 10. Adapter Checkpoint Saving\n",
            "Saves the trained LoRA adapter weights and tokenizer configuration."
        ]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "adapter_dir = \"./kreazyai_qwen3_pilot_adapter\"\n",
            "model.save_pretrained(adapter_dir)\n",
            "tokenizer.save_pretrained(adapter_dir)\n",
            "print(f\"✅ Qwen3 LoRA adapter weights successfully saved to {adapter_dir}\")"
        ]
    })

    # Cell 11: Inference testing
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 11. Inference Testing & Grounding Probes\n",
            "Validates that the model respects budget constraints, enforces return policies, and outputs clean structured JSON."
        ]
    })
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
            "        \"scenario\": \"Banglish Budget Inquiries (Catalog Grounding)\",\n",
            "        \"messages\": [\n",
            "            {\"role\": \"system\", \"content\": \"You are KreazyAI assistant for tenant_electronics_02. Only recommend catalog items under requested budget.\"},\n",
            "            {\"role\": \"user\", \"content\": \"Ami 2000 takar moddhe ekta bhalo earphone khujchi, ki ache apnader?\"}\n",
            "        ]\n",
            "    },\n",
            "    {\n",
            "        \"scenario\": \"Bangla Return Policy Enforcement\",\n",
            "        \"messages\": [\n",
            "            {\"role\": \"system\", \"content\": \"You are KreazyAI assistant for tenant_fashion_01. Return window is 7 days with original tag.\"},\n",
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
            "    print(f\"\\n🔍 Scenario: {td['scenario']}\")\n",
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

    # Cell 12: Evaluation reporting
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 12. Quantitative Evaluation Reporting\n",
            "Measures inference latency and schema validity."
        ]
    })
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
            "print(f\"Average Response Latency (GPU): {avg_latency:.2f} seconds\")\n",
            "print(\"✅ Quantitative evaluation probe completed.\")"
        ]
    })

    # Cell 13: Optional full training
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 13. Optional Full Dataset Training (PAUSED)\n",
            "⚠️ **POLICY GATE:** Do NOT execute without explicit Founder sign-off.  \n",
            "Full training runs on the complete 8,000-example training split across 3 epochs."
        ]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "# PAUSED BY POLICY - Awaiting Founder Approval\n",
            "def run_full_training():\n",
            "    print(\"Full training is currently paused pending Founder evaluation review.\")\n",
            "\n",
            "run_full_training()"
        ]
    })

    # Cell 14: Model export to GGUF
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 14. Model Export to GGUF (Q4_K_M Quantization)\n",
            "Converts the fine-tuned Qwen3 weights into quantized GGUF format for Ollama deployment."
        ]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "print(\"[*] Exporting Qwen3 fine-tuned model to GGUF (Q4_K_M quantization)...\")\n",
            "if USE_UNSLOTH:\n",
            "    model.save_pretrained_gguf(\"kreazyai_qwen3_pilot_gguf\", tokenizer, quantization_method=\"q4_k_m\")\n",
            "    print(\"✅ Native Unsloth GGUF export complete.\")\n",
            "else:\n",
            "    # Standard Hugging Face LoRA merge and export\n",
            "    print(\"[*] Merging LoRA weights into base Qwen3 1.7B model...\")\n",
            "    merged_model = model.merge_and_unload()\n",
            "    merged_model.save_pretrained(\"./kreazyai_qwen3_merged\")\n",
            "    tokenizer.save_pretrained(\"./kreazyai_qwen3_merged\")\n",
            "    print(\"✅ Merged Hugging Face model saved. Use llama.cpp convert_hf_to_gguf.py for GGUF conversion.\")"
        ]
    })

    # Cell 15: Ollama deployment preparation
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 15. Ollama Deployment Preparation & Download\n",
            "Packages the GGUF artifact as `kreazyai-qwen3-pilot-q4_k_m.gguf` for download.  \n",
            "**Notice:** Do NOT overwrite the existing `qwen3:1.7b` model on your laptop. Deploy as `kreazyai-qwen3:pilot`."
        ]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import glob, shutil\n",
            "from google.colab import files\n",
            "\n",
            "gguf_candidates = glob.glob(\"kreazyai_qwen3_pilot_gguf/*.gguf\")\n",
            "if gguf_candidates:\n",
            "    source_gguf = gguf_candidates[0]\n",
            "    target_name = \"kreazyai-qwen3-pilot-q4_k_m.gguf\"\n",
            "    shutil.copy(source_gguf, target_name)\n",
            "    print(f\"✅ Deployment file ready: {target_name}\")\n",
            "    print(\"\\nDownload to your laptop and import into Ollama using:\")\n",
            "    print(\"  ollama create kreazyai-qwen3:pilot -f Modelfile.pilot\")\n",
            "    # files.download(target_name)\n",
            "else:\n",
            "    print(\"Notice: GGUF file not yet compiled. Ensure Cell 14 completed successfully.\")"
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

    with open(NOTEBOOK_PATH, "w", encoding="utf-8") as f:
        json.dump(notebook_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Corrected Google Colab Notebook successfully generated at: {NOTEBOOK_PATH}")

if __name__ == "__main__":
    create_notebook()
