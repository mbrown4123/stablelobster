# StableLobster: Project Plan v1.0

**Status:** Spec Approved & Locked  
**Target Launch:** Soft Launch (Beta) in 7 days  
**Hosting:** Bluehost (Node.js + SQLite)  
**Philosophy:** Build fast, keep it simple, prioritize trust over features.

---

## 🏗️ Phase 1: Foundation & API (Days 1-2)
*Goal: Get the backend running, accept votes, and store data.*

### **1.1 Environment Setup**
- [ ] Initialize `stablelobster/` project structure.
- [ ] Create `package.json` (Node.js + Express + Socket.io + SQLite).
- [ ] Configure ESLint/Prettier for clean code.
- [ ] Set up `.env` for secrets (DB path, GitHub API key).

### **1.2 Database Schema**
- [ ] **Table `versions`:** `id`, `version_str`, `release_date`, `github_url`, `status` (pending/safe/broken).
- [ ] **Table `votes`:** `id`, `version_id`, `install_id` (hashed), `source` (agent/human), `status` (safe/broken), `category`, `os`, `timestamp`.
- [ ] **Table `agents`:** `install_id`, `last_seen`, `os`, `node_version`.
- [ ] **Table `issues`:** `version_id`, `category`, `count`, `percentage`.

### **1.3 API Endpoints**
- [ ] `POST /api/vote` (Agent/Human):
    - Validate `install_id` (one per version).
    - Auto-categorize if agent (parse error log).
    - Reject duplicates.
- [ ] `GET /api/status/:version`:
    - Return aggregate stats (score, top category).
    - Return platform-specific stats if requested.
- [ ] `GET /api/versions`:
    - List all versions (latest first).
    - Auto-populate from GitHub API (cron job).
- [ ] `POST /api/refresh` (Admin):
    - Trigger manual GitHub sync.

### **1.4 Anti-Spam & Security**
- [ ] Implement **Install ID Hashing** (SHA256 + salt) for agents.
- [ ] Implement **Session Token** for humans (localStorage).
- [ ] Rate limiter (IP + Token) for human votes.
- [ ] Payload signature validation for agents (HMAC).

---

## 🎨 Phase 2: Frontend Dashboard (Days 3-4)
*Goal: Build the Downdetector-style UI with real-time updates.*

### **2.1 Layout & Branding**
- [ ] Create React + Vite app.
- [ ] Integrate `openclaw.ai` theme (colors, fonts).
- [ ] Implement **Dark/Light mode auto-detect**.
- [ ] Design **Lobster Tightrope** component (SVG/Canvas).
    - *Safe:* Balancing animation.
    - *Broken:* Fallen animation.
    - *Spike:* Wobble effect.

### **2.2 Core Components**
- [ ] **Status Card:**
    - Traffic Light (🟢/🟡/🔴).
    - Confidence Score (%).
    - "Last Verified" live counter.
- [ ] **Version List:**
    - Grouped by series.
    - "🔥 New" badge for <48h.
    - Collapsible "Previous Versions".
- [ ] **Graph Component:**
    - Line chart (24h vote volume).
    - WebSocket live updates.
    - Green/Red lines for Safe/Broken.
- [ ] **Issue Breakdown:**
    - Collapsible section with percentages.
    - "Known Issue: Fixed in vX" badge logic.

### **2.3 User Interaction**
- [ ] **Vote Buttons:** Large "Safe" / "Broken" buttons.
- [ ] **Category Dropdown:** Appears only if "Broken" selected.
- [ ] **Platform Tabs:** Global, Linux, macOS, Windows, Docker.
- [ ] **WebSocket Client:** Auto-connect for live graph/status.

### **2.4 Admin View (Internal)**
- [ ] Simple password-protected route `/admin`.
- [ ] Raw data table (Install ID, Version, Vote, Timestamp).
- [ ] CSV Export button.
- [ ] "Kill Switch" to delete specific votes.

---

## 🤖 Phase 3: Agent Integration (Day 5)
*Goal: Make the OpenClaw agent vote automatically.*

### **3.1 Agent Module**
- [ ] Create `stablelobster_client.py` (Python module).
- [ ] **Install ID Generator:**
    - Hash hardware fingerprint + salt.
    - Store salt in `~/.openclaw/stablelobster_salt`.
- [ ] **Vote Logic:**
    - Hook into `gateway startup` event.
    - If success -> `POST /api/vote` (status=safe).
    - If crash -> `POST /api/vote` (status=broken + error_tail).
- [ ] **Offline Queue:**
    - Local DB (SQLite) for failed votes.
    - Retry loop (exponential backoff).

### **3.2 CLI Command (Optional)**
- [ ] `openclaw diagnose --report` (Force manual vote).
- [ ] `openclaw status --check` (Read-only fetch, if requested later).

### **3.3 Testing**
- [ ] Simulate successful startup -> Verify "Safe" vote received.
- [ ] Simulate crash -> Verify "Broken" vote + category.
- [ ] Verify duplicate rejection.

---

## 🚀 Phase 4: Deployment & Launch (Days 6-7)
*Goal: Soft launch with beta testers.*

### **4.1 Infrastructure**
- [ ] Configure Bluehost Node.js app.
- [ ] Set up SQLite database (or migrate to Postgres if needed).
- [ ] Configure WebSocket proxy (if required by host).
- [ ] Set up GitHub API cron job (15m intervals).

### **4.2 Security Hardening**
- [ ] Enable HTTPS (Let's Encrypt).
- [ ] Verify payload signature logic.
- [ ] Test rate limiting with fake bots.

### **4.3 Soft Launch**
- [ ] Invite 10 beta testers (Discord/Telegram).
- [ ] Provide beta install ID salt for testing.
- [ ] Monitor real-time graph for activity.
- [ ] Fix critical bugs.

### **4.4 Public Go-Live**
- [ ] Remove "Beta" banner.
- [ ] Share link on OpenClaw Discord/GitHub.
- [ ] Monitor server load.

---

## 📅 Post-Launch Roadmap
- **Week 2:** Add "Known Issue" auto-labeling logic.
- **Week 3:** Implement "Auto-upgrade safe" CLI flag.
- **Week 4:** Add admin analytics dashboard (charts).
- **Month 2:** Explore "Sponsored Stable" badges.

---

## 🛠️ Tech Stack Summary
- **Backend:** Node.js, Express, Socket.io, SQLite.
- **Frontend:** React, Vite, Tailwind CSS, Recharts (graphs), Framer Motion (animations).
- **Agent:** Python (OpenClaw core), requests, hashlib.
- **Hosting:** Bluehost (Node.js support).
- **Data Source:** GitHub Releases API.

---

*Plan created 2026-04-30. Ready for execution.*