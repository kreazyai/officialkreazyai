# KreazyAI — Omnichannel AI Commerce Automation Platform

KreazyAI is a high-performance, enterprise-grade AI automation platform designed specifically for modern e-commerce retailers and direct-to-consumer (D2C) brands. It consolidates omnichannel conversations, sales pipelines, live inventory synchronization, order management, and conversational AI agents into a single unified workspace.

---

## 🚀 Key Highlights & Capabilities

### 1. 🤖 Omnichannel AI Conversations & Live Chat
- **Meta & Messaging Integrations**: Seamlessly handles customer interactions across WhatsApp Business API, Instagram DM, Facebook Messenger, and Web Live Chat.
- **Autonomous AI Agents**: Resolves 75%+ of customer queries autonomously with context-aware product recommendations, FAQ handling, order lookup, and delivery tracking.
- **Seamless Human Escalation**: Real-time handoff protocol with smart agent queues and priority routing for VIP customers.

### 2. 📦 Order Management System (OMS) & Live Cart Recovery
- Real-time order tracking, status management (Processing, Shipped, Delivered, Cancelled), and instant invoice generation.
- Automated abandoned cart recovery sequences via WhatsApp & SMS with personalized discount triggers.
- Live checkout assist and payment confirmation workflows (bKash, Nagad, Stripe, SSLCommerz).

### 3. 🛍️ Dynamic Product Catalog & Real-Time Inventory Sync
- Multi-channel inventory management with SKU tracking, stock alerts, and automated catalog sync.
- AI-driven product discovery matching customer intent, style preferences, and size requirements.

### 4. 🎛️ Dual-Tier Architecture & Dedicated Admin Portal
- **Merchant SaaS Application (`:5173`)**: Front-facing marketing experience, live interactive demo, merchant portal, and real-time simulator.
- **Dedicated Platform Administration (`:5174/admin`)**: Secure, isolated administrative control plane with credentials authentication (`kreazyai@gmail.com`), platform metrics, tenant provisioning, system audit logs, and global feature toggles.

### 5. 📱 Interactive Multi-Device Responsive Preview Engine
- Integrated device frame emulator supporting Pixel 9, iPhone 16 / 16 Pro Max, Galaxy Z Fold, iPad Pro 13, and Smart Displays.
- Live orientation toggle (Portrait / Landscape), scale adjustments (50% - 125%), and direct viewport switching.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vanilla CSS Design System, Lucide React Icons
- **Bundler & Tooling**: Vite 8, Oxlint
- **Architecture**: Modular Component-Driven Architecture, LocalStorage Persistent Store, Event-Driven AI Engine
- **Styling**: Tailored Dark-Mode Glassmorphism Design System with Custom Micro-Interactions

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/sadat87/kreazyai.git
cd kreazyai

# Install dependencies
npm install
```

### Running the Development Environment

#### 1. Merchant Application & Marketing Site
```bash
npm run dev
# Running on http://localhost:5173
```

#### 2. Dedicated Platform Admin Portal
```bash
npm run admin
# Running on http://localhost:5174/admin
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔒 Security & Admin Access
The administrative portal is isolated on port `5174` (or configured via reverse proxy) and requires role-based authentication. Ensure environment credentials are properly managed in production environments.

---

## 📄 License
Proprietary & Confidential. Copyright © 2026 KreazyAI. All Rights Reserved.
