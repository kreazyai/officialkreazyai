# KreazyAI Official Qwen3 1.7B Pilot Fine-Tuning Guide (Google Colab)

This guide provides instructions for running the **KreazyAI Pilot Supervised Fine-Tuning (SFT)** pipeline on Google Colab using a compatible NVIDIA GPU (such as T4, L4, or A100).

---

## 1. Verified Architecture & Base Model Specification

- **Target Model:** [`Qwen/Qwen3-1.7B`](https://huggingface.co/Qwen/Qwen3-1.7B) (Official Alibaba Cloud checkpoint)
- **Architecture Family:** `qwen3` (Dense causal transformer, 28 layers, 16 query heads / 8 KV heads with Grouped-Query Attention, 2048 hidden size, SwiGLU feed-forward)
- **Tokenization:** Native ChatML with hybrid reasoning mode (`<think>...</think>`)
- **Compatibility Requirement:** `transformers>=4.51.0` is required for native `qwen3` architecture support
- **Fine-Tuning Method:** 4-bit QLoRA with rank $r=16, \alpha=32$ on attention and MLP projections
- **Local Ollama Target Identifier:** `kreazyai-qwen3:pilot` (Isolated deployment; does **NOT** modify or overwrite the existing `qwen3:1.7b` base model)

---

## 2. Prerequisites & Files to Upload

Upload the following three files from `kreazyai-ai-training/` to Google Colab:
1. **`training/KreazyAI_Qwen3_1_7B_FineTuning.ipynb`** — The verified fine-tuning notebook.
2. **`training/pilot_train.jsonl`** — 800 stratified dialogues (80 per tenant, 0% data leakage, all CRITICAL payment/hazard records quarantined).
3. **`training/pilot_validation.jsonl`** — 200 holdout validation dialogues (20 per tenant).

---

## 3. Step-by-Step Google Colab Execution Workflow

### Step 1: Open Google Colab & Select GPU Runtime
1. Open [Google Colab](https://colab.research.google.com/).
2. Click **File** -> **Upload notebook** and select `KreazyAI_Qwen3_1_7B_FineTuning.ipynb`.
3. Select an active GPU:
   - Click **Runtime** -> **Change runtime type**.
   - Hardware accelerator: **NVIDIA GPU** (e.g., T4, L4, or A100).
   - Click **Save**.

### Step 2: Run Cell 1 — Environment & GPU Verification
- Runs `nvidia-smi` and checks CUDA capability and available VRAM.

### Step 3: Run Cell 2 — Install Dependencies
- Upgrades `transformers>=4.51.0` (required for Qwen3 architecture).
- Installs `peft`, `trl`, `accelerate`, `bitsandbytes`, and Unsloth acceleration utilities.

### Step 4: Run Cell 3 — Load Official Qwen3 1.7B Checkpoint
- Loads `Qwen/Qwen3-1.7B` in 4-bit precision.
- Includes automatic fallback to native Hugging Face `AutoModelForCausalLM` + `BitsAndBytesConfig` if Unsloth is unavailable.

### Step 5: Run Cell 4 & 5 — Upload & Validate Pilot Datasets
- Upload `pilot_train.jsonl` and `pilot_validation.jsonl`.
- Automated assertions confirm exactly 800 training and 200 validation records, 10-tenant balance, and verify that **0 unresolved CRITICAL records** are present.

### Step 6: Run Cell 6 & 7 — Apply Qwen3 Chat Template & Configure LoRA
- Maps dialogues into Qwen3 ChatML format.
- Configures LoRA adapter ($r=16, \alpha=32$) targeting all linear projection layers.

### Step 7: Run Cell 8 — Execute Pilot Supervised Fine-Tuning
- Executes 100 training steps (approx. 1 epoch of pilot data).
- Gradient accumulation: 4 steps, per-device batch size: 2, cosine learning rate schedule ($2 \times 10^{-4}$).

### Step 8: Run Cell 9 & 10 — Loss Progression & Save Adapter
- Inspects training and evaluation loss metrics to confirm stable convergence.
- Saves LoRA adapter weights to `./kreazyai_qwen3_pilot_adapter`.

### Step 9: Run Cell 11 & 12 — Inference Probing & Latency Check
- Tests Banglish budget queries (*"2000 takar moddhe valo earphone"*), return policies, and dispute escalation.
- Verifies that the model outputs structured dual JSON directly without leaking internal thoughts.

### Step 10: Run Cell 14 & 15 — Export GGUF & Download
- Converts fine-tuned adapter into quantized GGUF format (`Q4_K_M` quantization).
- Packages `kreazyai-qwen3-pilot-q4_k_m.gguf` for local download.

---

## 4. Local Ollama Registration & Testing

Once `kreazyai-qwen3-pilot-q4_k_m.gguf` is downloaded to your laptop:

1. Place the file in `kreazyai-ai-training/training/ollama/`:
   ```powershell
   Move-Item -Path "C:\Users\SADAT\Downloads\kreazyai-qwen3-pilot-q4_k_m.gguf" -Destination "c:\Users\SADAT\OneDrive\Desktop\KreazyAI\kreazyai-ai-training\training\ollama\"
   ```

2. Register the model using the provided Qwen3 Modelfile:
   ```powershell
   cd c:\Users\SADAT\OneDrive\Desktop\KreazyAI\kreazyai-ai-training\training\ollama
   ollama create kreazyai-qwen3:pilot -f Modelfile.pilot
   ```

3. Test local inference:
   ```powershell
   ollama run kreazyai-qwen3:pilot "Ami 2000 takar moddhe ekta wireless earphone khujchi, ki ache apnader?"
   ```
   *Your installed base model `qwen3:1.7b` remains completely intact and accessible.*

---

## 5. Cloud Resources, GPU Availability & Realistic Cost Considerations

- **GPU Availability:** Free GPU availability on Google Colab is managed dynamically by Google. Availability is not guaranteed and sessions may be subjected to CAPTCHA verifications, preemption, or temporary resource limits during peak cloud hours.
- **Variable Training Time:** Training runtime varies depending on the GPU model assigned (e.g., T4 vs L4 vs A100), network download speeds for model checkpoints, and Colab infrastructure load (typically 5 to 15 minutes for 100 pilot steps).
- **Compute Costs:** Free-tier accounts incur $0 direct billing when capacity is available. Users utilizing Colab Pro or pay-as-you-go compute units will consume cloud credits (typically ~$0.10 to ~$0.35 per pilot run depending on GPU tier). Costs are dependent on user subscription tier.
- **Laptop Hardware Role:** Fine-tuning must never be executed on the local laptop (Intel Core i5, 8GB RAM, integrated GPU). The laptop is reserved exclusively for dataset curation, script validation, and lightweight local GGUF inference.
