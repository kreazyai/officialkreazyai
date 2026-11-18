# KreazyAI Production Hosting & Deployment Architecture

> **Document Type:** Production Infrastructure & Cloud Architecture Review  
> **Platform Version:** KreazyAI 2.4.0-Production  
> **Verified Live Domain:** [https://kreazyai.com](https://kreazyai.com)  
> **API Origin Server:** [https://kreazyai.onrender.com](https://kreazyai.onrender.com)  
> **Repository:** [sadat87/Kreazyai](https://github.com/sadat87/Kreazyai) (`main` branch)  
> **Date Verified:** November 18, 2026  

---

## 1. High-Level Architecture Topology

```
                  [User Browser / Client]
                             │
                             ▼
         [Cloudflare Edge DNS / Proxy / SSL]
         (Nameservers: randy.ns.cloudflare.com, penny.ns.cloudflare.com)
                             │
     ┌───────────────────────┴───────────────────────┐
     │                                               │
     ▼ (Static Assets / SPA Routing)                 ▼ (/api/v1 Calls)
[AWS Amplify / Amazon CloudFront CDN + S3]    [Render Web Service]
(Serves Vite React Bundle from GitHub 'main') (Node.js/Express REST API Server)
                                                     │
                                                     ▼
                                     [Neon Serverless PostgreSQL]
                                     (Encrypted Database with Pooling)
```

---

## 2. Infrastructure Layer Breakdown

### Layer 1: DNS & SSL Termination — Cloudflare
- **Apex Domain:** `kreazyai.com`
- **Subdomains:** `www.kreazyai.com`, `api.kreazyai.com`
- **Nameservers:**
  - `randy.ns.cloudflare.com`
  - `penny.ns.cloudflare.com`
- **Responsibilities:**
  - DNS resolution and DNSSEC
  - Edge SSL/TLS certificate management
  - DDoS protection and Web Application Firewall (WAF)
  - Edge caching and HTTP/3 / QUIC protocol termination
- **Admin Dashboard:** [https://dash.cloudflare.com](https://dash.cloudflare.com)

### Layer 2: Frontend Web Application — AWS Amplify & CloudFront CDN
- **Origin & CDN:** Amazon CloudFront Distribution backed by Amazon S3
- **Live Telemetry Verified:**
  - `via: 1.1 ... cloudfront.net (CloudFront)`
  - `x-cache: Hit from cloudfront` / `Miss from cloudfront`
  - `x-amz-cf-pop: MCI50-P1`
- **Build & CI/CD Pipeline:**
  - Automated continuous deployment triggered on every `git push` to `main` on GitHub `sadat87/Kreazyai`.
  - Configured via `amplify.yml`:
    ```yaml
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
    ```
  - Single-Page Application (SPA) rewrite rules map all paths `/*` to `/index.html` with HTTP 200 to enable HTML5 client-side routing.
- **Admin Dashboard:** [https://console.aws.amazon.com/amplify](https://console.aws.amazon.com/amplify)

### Layer 3: Backend REST API Server — Render
- **Live Backend URL:** `https://kreazyai.onrender.com`
- **Health Probe Endpoint:** `https://kreazyai.onrender.com/api/health`
- **Runtime Target:** Node.js v22+ / Express 5.2.1
- **Live Telemetry Verified:**
  - `x-render-origin-server: Render`
  - `rndr-id: 6b236057-ef84-40c2`
- **Client Configuration:**
  - Configured dynamically in [src/api/client.js](file:///c:/Users/SADAT/OneDrive/Desktop/KreazyAI/src/api/client.js#L137-L138):
    ```javascript
    // In production on CloudFront / S3 (kreazyai.com), route to Render backend:
    return 'https://kreazyai.onrender.com/api/v1';
    ```
- **Admin Dashboard:** [https://dashboard.render.com](https://dashboard.render.com)

### Layer 4: Production Database — Neon Serverless PostgreSQL
- **Database Engine:** PostgreSQL 16 (Serverless, auto-scaling compute)
- **Connection Mode:** SSL connection pooling (`sslmode=require`)
- **Schema Management:** Dual-engine compatibility supporting both SQLite (local development) and PostgreSQL (production).
- **Admin Dashboard:** [https://console.neon.tech](https://console.neon.tech)

---

## 3. Operations & Management Matrix

| Service | Component | URL / Console | Credentials / Auth |
| :--- | :--- | :--- | :--- |
| **Cloudflare** | DNS, SSL, WAF | [dash.cloudflare.com](https://dash.cloudflare.com) | Account email |
| **AWS Amplify** | Frontend CI/CD & CDN | [console.aws.amazon.com/amplify](https://console.aws.amazon.com/amplify) | AWS Root / IAM |
| **GitHub** | Source Code & Webhooks | [github.com/sadat87/Kreazyai](https://github.com/sadat87/Kreazyai) | `sadat87` |
| **Render** | REST API Server | [dashboard.render.com](https://dashboard.render.com) | GitHub SSO / Email |
| **Neon** | Serverless PostgreSQL | [console.neon.tech](https://console.neon.tech) | Neon Account |

---

## 4. Verification Checkpoints

1. **DNS Check:** `nslookup kreazyai.com` returns active Cloudflare edge IPs.
2. **Frontend Deployment Check:** Pushing changes to `main` updates the CloudFront deployment within ~60-90 seconds.
3. **Backend Health Check:** `curl https://kreazyai.onrender.com/api/health` returns `200 OK`.
4. **CORS & Headers:** API requests from `https://kreazyai.com` are allowed via standard CORS headers.
