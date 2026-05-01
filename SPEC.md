# StableLobster: Technical Specification v1.0

**Project:** StableLobster (stablelobster.com)  
**Vision:** An ultra-premium, agent-driven crowd-sourced status platform for OpenClaw versions.  
**Core Metaphor:** A lobster balancing on a tightrope (Safe) vs. fallen off (Broken).  
**Philosophy:** "Pull, not Push." Passive truth-telling. No login, no ads, no fluff.

---

## 1. Business Goals & Vision
*   **Primary Goal:** Reduce failed upgrades by 90% via real-time community consensus.
*   **Data Source:** 70% Agent (auto-vote on startup), 30% Human (anonymous quick-vote).
*   **Monetization:** None for now (focus on trust).
*   **Target Audience:** OpenClaw users (devs, ops, hobbyists).
*   **Positioning:** The "Consumer Reports" for AI agents. Reactive & Solution-focused.

---

## 2. Branding & Experience
*   **Aesthetic:** Exact match to `openclaw.ai` (Dark/Light mode auto-detect).
*   **Mascot:** Lobster on a tightrope.
    *   *Safe:* Balancing smoothly.
    *   *Broken:* Fallen off (sitting at bottom, "dizzy" animation).
    *   *Spikes:* Tightrope wobbles in real-time.
*   **Status UI:** Traffic Light + Confidence Score (e.g., "🟢 Safe (94%)").
*   **Motion:** Functional only (wobbles/falls on status changes; no decorative animations).
*   **Trust Signals:**
    *   Live "Last Verified" counter (e.g., "Last vote: 14s ago").
    *   Active Agent Count (e.g., "1,243 agents monitoring").
    *   Exact timestamps on all reports.
    *   Status-change glow (pulse on green/red transitions).
*   **Personalization:** None (Fully anonymous, generic greeting).
*   **Badges:** "Verified Agent" (auto), "Trusted Contributor" (for helpful human reports).

---

## 3. User & Agent Voting Experience
*   **User Journey:**
    1.  Land on site.
    2.  See global status + latest version.
    3.  Click "Safe" (Green) or "Broken" (Red).
    4.  Select Issue Category (Required for Broken).
    5.  Vote recorded instantly (no login).
*   **Agent Logic:**
    *   **Trigger:** Vote "Safe" immediately after successful startup.
    *   **Failure:** Vote "Broken" + Category on crash.
    *   **Frequency:** One vote per `Install_ID` per `Version_ID` (ever).
    *   **Offline:** Queue vote locally, retry every 15m.
*   **Anti-Spam:**
    *   **Agents:** Hardware-hashed `Install_ID` (SHA256 of hardware fingerprint + salt).
    *   **Humans:** Session Token + IP Rate Limiting + Honeypot.
*   **Categories (Required for Broken):**
    *   Config Error
    *   Gateway Crash
    *   Network/Connectivity
    *   Performance Lag
    *   Other
*   **Comments/Uploads:** **None.** (Text-only, auto-generated fix descriptions).

---

## 4. Version Data & Granularity
*   **Listing:** Latest first, grouped by series (`2026.5.x`, `2026.4.x`).
*   **Metadata:** Version, Release Date, Safety Score, Top Issue, Link to Release Notes.
*   **Threshold:** Show score only after **5 votes**. Below 5: "Too few data points".
*   **Sub-components:** No separate tracking. All errors mapped to "Agent Status".
*   **Platform Tabs:** Global (default) + Linux, macOS, Windows, Docker.
*   **Historical Archive:** Collapsible accordion for old versions.
*   **New Releases:** "🔥 New" badge for versions <48h old.
*   **Auto-Pull:** Cron job (15m) checks GitHub Releases API.

---

## 5. Real-Time Dashboard & Graphs
*   **Layout:** Single column, card-stack (Mobile-first).
*   **Graph:** 24-hour vote volume (Line chart: Green=Safe, Red=Broken).
*   **Alerts:** Prominent banner on spikes (>20% failure rate). "ALERT: vX is failing."
*   **Details:** "Most Reported Issues" collapsible section (e.g., "Config Error: 60%").
*   **Admin Dashboard:** Internal-only raw data view (CSV export).
*   **Live Updates:** WebSocket for real-time graph/status changes.
*   **No Maps:** No geographic heatmaps.

---

## 6. OpenClaw Agent Integration
*   **Vote Payload:** `{ install_id, version_id, status, category, os, node_version, error_tail }`
*   **Security:** HTTPS + Signed Payload (local key).
*   **Rate Limiting:** Backend rejects duplicate `install_id + version_id`.
*   **CLI Commands:** None for status check. `openclaw diagnose --report` (manual force-vote) optional.
*   **Offline Handling:** Local queue with exponential backoff retry.
*   **Future Feature:** `openclaw upgrade --auto-safe` (optional flag).

---

## 7. Moderation & Privacy
*   **Moderation:** Auto-flag only (ban IP/ID on >5 votes in 1min). No human review.
*   **GDPR:** Zero-PII design (hashed IDs, no emails/names).
*   **Retention:** Raw data indefinite; aggregate archive after 1 year.
*   **Admin Tools:** Kill switch to delete specific votes/IDs.

---

## 8. Launch & Ops
*   **Launch Strategy:** Soft launch (Beta testers) -> Public.
*   **Hosting:** Bluehost (Node.js + SQLite).
*   **Domain:** `stablelobster.com`
*   **MVP Scope:**
    1.  Agent voting API.
    2.  Public dashboard (status + graph).
    3.  GitHub release auto-pull.
    4.  Admin data view.

---

## 9. Future Roadmap (Post-MVP)
*   **Phase 2:** "Sponsored Stable" badges (vendors).
*   **Phase 3:** Enterprise private forks (if demand).
*   **Phase 4:** Donations tip jar (if server costs grow).

---

*Spec approved by Mike Brown on 2026-04-30.*