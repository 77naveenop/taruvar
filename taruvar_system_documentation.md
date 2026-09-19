# TARUVAR — Complete System, Architecture & Operations Documentation (v3.0)

> **Official System, Architecture & Operational Manual**  
> **Domain**: [taruvar.org](https://taruvar.org) | **Repository**: [github.com/77naveenop/taruvar](https://github.com/77naveenop/taruvar)  
> **Date**: September 2026 | **Status**: Production Live

---

## 1. Executive Summary & Core Mission

**TARUVAR** (*"One Person. One Tree. / एक व्यक्ति, एक पेड़"*) is an environmental movement built on the foundational principle that **planting a tree is only the beginning**. 

### The 5-Step "Paalna" (Nurturing) Pipeline
1. **Plant (पौधा लगाना)**: An individual or organization plants a climate-appropriate sapling, selects species, names their tree, and records the initial plantation photo.
2. **Care (देखभाल / Paalna)**: The guardian waters, guards, and nurtures the sapling through critical early seasonal cycles.
3. **Document (तस्वीर व लॉग)**: The guardian logs monthly growth progress photos and field updates through their digital profile.
4. **Grow (निरंतर विकास)**: Progresses through a structured 5-Month verification journey validated by the Taruvar team.
5. **Inspire (प्रेरणा)**: Verified guardians receive official Level 5 Eco-Guardian Badges, verified digital certificates, printable PVC IDs, and climb the public community leaderboard.

---

## 2. Technical Stack & Architecture

| Layer | Service / Technology | Key Features & Implementation |
|---|---|---|
| **Frontend Framework** | React 18, Vite 5, Tailwind CSS | Ultra-fast SPA with reactive client-side routing |
| **PWA & Offline** | Service Worker (`sw.js`) + Manifest | 1-tap installable app with cache bypass for live updates |
| **Cloud Database** | GitHub REST API (`live-data` branch) | High-reliability JSON data store with auto-conflict retries (`putGithubJsonWithRetry`) |
| **Local Cache** | LocalStorage Persistence | Instant offline-first rendering with background cloud synchronization |
| **Navigation & UI** | Top Header & Bottom Bar | Dynamic desktop/mobile top navbar with role-aware Admin Desk button & bottom bar |
| **Tree Growth Canvas** | HTML5 Canvas 2D Engine (60 FPS) | Real-time procedural tree generation algorithm |
| **Card / ID Engine** | Printable CR80 PVC Generator | Standard 85.6mm × 53.98mm format with dynamic QR code & 5-month stamp card |
| **Hosting & CI/CD** | Vercel Edge Network | Zero-downtime automatic builds triggered upon push to `main` |
| **Domain & DNS** | GoDaddy Registrar (`taruvar.org`) | Apex A record configured to `216.198.79.1` |

---

## 3. Cloud Database & Data Flow Architecture

The Taruvar platform uses an atomic, serverless cloud data persistence layer hosted on GitHub (`77naveenop/taruvar` branch `live-data`).

### Data Entities:
1. `pending_adoptions.json`: New adoption requests submitted by users awaiting administrative verification.
2. `approved_adoptions.json`: Approved trees visible on public community feeds, leaderboards, and guardian profiles.

### Conflict-Resilient Synchronization (`putGithubJsonWithRetry`):
- To prevent `409 Conflict` errors during concurrent user submissions, the client uses an exponential backoff retry algorithm (up to 5 attempts).
- Each retry fetches the latest file SHA from the GitHub REST API before committing the update, ensuring zero data loss.

---

## 4. Unique ID Generator & Printable PVC Card System

### ID Formats:
- **Member ID (Guardian)**: `TRV-IND-2026-XXXX` (Permanent Eco-Guardian Identification)
- **Tree Passport ID (Tree)**: `TRV-TREE-XXXX` (Unique Tree Adoption Serial Number)

### Digital & Printable PVC Card Specifications:
- **Form Factor**: ISO/IEC 7810 ID-1 (CR80 standard: 85.60 mm × 53.98 mm).
- **Front Side**: Holographic security emblem, Guardian Name, Tree Name, Species, Planted Date, GPS Location, Verification Status, and QR code linked to `taruvar.org/journey`.
- **Back Side**: 5-Month Growth Verification Stamp Matrix (`M1` to `M5`), Guardian Pledge Oath, and Taruvar Foundation contact details.
- **Print Engine**: Dedicated print CSS stylesheet with `@media print` rules allowing direct 1-click printing to standard PVC badge and card printers.

---

## 5. User Roles & Administrative Controls

| Role | Access Level | Capabilities |
|---|---|---|
| **Public / Visitor** | Read-Only | Browse landing page, explore initiatives, view community stories, try interactive sandbox. |
| **Eco-Guardian (User)**| Authenticated | Adopt individual/bulk trees, submit 5-month growth logs, upvote community trees, access PVC ID card. |
| **Admin / Core Team** | Superuser | Review and approve/reject tree adoptions, verify 5-month photo logs, access Admin Desk from top navbar. |

- **Admin Passkey Authentication**: Permanent admin access can be granted using the secure key `TARUVAR_ADMIN_2026` via `/admin` or dedicated admin login triggers.
- **Top Bar Integration**: When logged in as an Admin, an **Admin Desk** button automatically renders in the top navigation bar beside the user profile avatar across both desktop and mobile views.

---

## 6. Leadership & Core Team Structure

| Name | Role | Designation |
|---|---|---|
| **Naveen Sharma** | Founder & Lead Steward | संस्थापक एवं मुख्य संचालक |
| **Dr. Anita Verma** | Botanical & Plantation Advisor | वानस्पतिक सलाहकार |
| **Rahul Mishra** | Community Operations Lead | सामुदायिक अभियान प्रमुख |
| **Pooja Sundaram** | Taruvar Green Shakti Lead | महिला नेतृत्व संयोजक |
| **Aman Deep Singh** | Youth & Campus Coordinator | युवा व विश्वविद्यालय समन्वयक |
| **Sneha Patel** | Tree Journey Platform & Tech Lead | तकनीक प्रमुख |
| **Vikram Joshi** | Partnerships & Outreach Coordinator | साझेदारी प्रमुख |

---

## 7. Official Contact Matrix

- **Official Movement Email**: `teamtaruvar@gmail.com`
- **Voice Support Line**: `+91 8543964107`
- **WhatsApp Support & Helpdesk**: `+91 7887254107`
- **Instagram Handle**: `@taruvarfoundation_`
- **Official Web Portal**: `https://taruvar.org`

---

## 8. Development & Deployment Procedures

### Local Development:
```bash
# Clone the repository
git clone https://github.com/77naveenop/taruvar.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

### Production Deployment:
```bash
git add .
git commit -m "Your update message"
git push origin main
```
The Vercel Edge CI/CD pipeline automatically compiles and deploys the production bundle to **`https://taruvar.org`** within seconds.
