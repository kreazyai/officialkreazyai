# KREAZYAI AUDIT BASELINE SNAPSHOT
**Document ID:** `KREAZYAI_AUDIT_BASELINE.md`  
**Classification:** Baseline Environment, Repository & Tooling Snapshot  
**Execution Timestamp:** 2026-09-29T23:48:45+06:00  
**Phase:** Discovery & Non-Destructive Audit Only (Step 1)  

---

## 1. REPOSITORY & ENVIRONMENT SNAPSHOT

| Attribute | Verified Value | Evidence Source |
| :--- | :--- | :--- |
| **Repository Root** | `c:\Users\SADAT\OneDrive\Desktop\KreazyAI` | Working directory |
| **Active Git Branch** | `main` | `git branch` |
| **Upstream Remote** | `origin/main` (Up to date) | `git status` |
| **Latest Commit Hash** | `b48dae3` | `git log -1 --oneline` |
| **Commit Message** | `fix(customers): ensure clean customer directory for new signups and auto-synthesize CRM profile from inbound conversations` | `git log` |
| **Node.js Runtime** | `v25.2.1` | `node -v` |
| **Package Manager / CLI** | `npm v11.6.2` | `npm -v` |
| **Frontend Framework** | React `19.2.8` | `package.json` |
| **Build & Bundler Tool** | Vite `8.3.0` (`@vitejs/plugin-react` `6.1.1`) | `package.json` |
| **Linter** | Oxlint `1.81.0` | `package.json` |
| **Icon Library** | `lucide-react` `1.48.0` | `package.json` |
| **Backend Framework** | **NONE / UNKNOWN (Missing)** | Source audit: 0 server files in `package.json` |
| **Database System** | **NONE / SIMULATED (Missing)** | Data persisted only in `window.localStorage` |
| **ORM / Query Builder** | **NONE (Missing)** | No ORM or DB driver installed |
| **Environment Config** | **NONE (Missing)** | No `.env` or `.env.example` in repo |
| **CI / CD Pipelines** | **NONE (Missing)** | No `.github/workflows` or CI configs |
| **Deployment Target** | **UNKNOWN / CLIENT SPA ONLY** | Standard `vite build` outputs static files to `dist/` |

---

## 2. REPOSITORY INTEGRITY & GIT STATUS

```bash
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
	modified:   src/components/website/Navbar.jsx
	modified:   src/styles/website.css

Untracked files:
	KREAZYAI_SYSTEM_AUDIT.md
```

- **Unstaged changes in working tree:**
  - `src/components/website/Navbar.jsx`: Mobile header button visibility and drawer container fix.
  - `src/styles/website.css`: Responsive navbar media queries.
  - `KREAZYAI_SYSTEM_AUDIT.md`: Phase 0 preliminary audit report.
- **No destructive modifications have been committed.**

---

## 3. DEPENDENCY INVENTORY

### Production Dependencies (`dependencies`):
- `lucide-react`: `^1.48.0` (UI SVG icon set)
- `react`: `^19.2.8` (Core component rendering library)
- `react-dom`: `^19.2.8` (DOM renderer for React 19)

### Developer Dependencies (`devDependencies`):
- `@types/react`: `^19.2.18` (TypeScript typing definitions)
- `@types/react-dom`: `^19.2.7` (TypeScript typing definitions)
- `@vitejs/plugin-react`: `^6.1.1` (Vite JSX/React transform)
- `oxlint`: `^1.81.0` (High-speed Rust-based JavaScript/JSX linter)
- `vite`: `^8.3.0` (Local dev server and bundler)

### Identified Dependency Gaps:
- No HTTP server library (`express`, `fastify`, `koa`, `hono`, `nest`).
- No database driver (`pg`, `mysql2`, `better-sqlite3`).
- No ORM/query builder (`prisma`, `drizzle-orm`, `knex`, `typeorm`).
- No validation library (`zod`, `yup`, `joi`).
- No authentication/cryptography library (`bcrypt`, `argon2`, `jsonwebtoken`).
- No HTTP client (`axios`).
- No router library (`react-router-dom`, `tanstack-router`).
- No real LLM SDK (`@google/genai`, `openai`, `@anthropic-ai/sdk`).
- No testing framework (`vitest`, `jest`, `playwright`, `cypress`).

---

## 4. BASELINE EXECUTION VERIFICATION

1. **Build Verification (`npm run build`):**
   - Output: `dist/index.html` (2.56 kB), `dist/assets/index-BZ1xviVR.css` (42.09 kB), `dist/assets/index-S1m-D8Lz.js` (557.55 kB).
   - Exit code: 0 (Successful static bundle generation).
2. **Test Script Execution (`npm test`):**
   - Script: `node ./scripts/run-production-tests.mjs`.
   - Output: 18 tests executed in 54ms, 18 passed, 0 failed.
   - Note: Tests execute purely against synchronous in-memory JavaScript methods in `src/services/api.js` and `aiKnowledgeEngine.js`. They do not test network HTTP endpoints or database engines.
3. **Local Dev Server:**
   - Active command: `npm run dev` running on `http://localhost:5173`.
   - Admin command defined in `package.json`: `npm run admin` -> `vite --port 5174`.

---
**Baseline Snapshot Verified. No code modified.**
