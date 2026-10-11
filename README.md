# Gramlink 360: Smart Village Services & Citizen Portal
**B.Tech Computer Science & Business Systems (CSBS) Mini Project**
*Theme: Digital India • e-Governance • Transparent Public Service Delivery*

---

## 🌾 1. Project Overview
**Gramlink 360** is a single-window digital governance platform engineered for rural Indian Gram Panchayats (modeled on **Gram Panchayat Shivrajpur, Baramati, Maharashtra**). 

Unlike generic college CRUD projects, Gramlink 360 addresses core **Computer Science & Business Systems (CSBS)** principles:
- **Business Process Re-engineering (BPR):** Transforming unstructured verbal/paper complaints into formal digital service tickets governed by strict **48-Hour Service Level Agreements (SLAs)**.
- **Social Auditing & Open Data:** Public transparency dashboards that benchmark ward-level performance and combat administrative opacity.
- **Digital Inclusion:** Clean, high-contrast, mobile-first UI with built-in **English and Marathi (मराठी)** language toggle for first-time rural internet users.
- **Zero-Backend Cloud Architecture (Supabase):** Secure PostgreSQL Row Level Security (RLS) policies that eliminate insecure backend code.

---

## 🚀 2. How to Run Locally

### Option A: Direct Browser Launch (Simplest)
Because Gramlink 360 is built with pure standards-compliant **HTML5, modern CSS3, and Vanilla JavaScript**, no compilation, Node.js, or build steps are required.
1. Double-click or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
2. All navigation links and features function immediately.

### Option B: Local Web Server via PowerShell
To run over a local `http://localhost` port:
1. Open PowerShell in the project directory:
   ```powershell
   # Start a lightweight built-in HTTP server on port 8080
   $listener = New-Object System.Net.HttpListener
   $listener.Prefixes.Add("http://localhost:8080/")
   $listener.Start()
   Write-Host "Server running at http://localhost:8080/"
   ```
2. Open your browser and navigate to `http://localhost:8080/`.

---

## 📂 3. File & Folder Architecture

```
Turbo.C.3.2/
├── index.html                   # Homepage: Hero, Emergency Bar, Live Ticker, Quick Tracker
├── README.md                    # Project documentation & CSBS Viva guide
├── css/
│   ├── style.css                # Master Design System (Gov-Tech palette, cards, forms, tables)
│   └── animations.css           # Hardware-accelerated reveals, floating physics, reduced-motion
├── js/
│   ├── translations.js          # Bilingual dictionary (English & Marathi) with DOM switcher
│   ├── state.js                 # Central store (localStorage persistence & Supabase-ready methods)
│   ├── main.js                  # Sticky header, mobile drawer, toasts, session badges
│   ├── services.js              # Service directory search, category filters, detail modal
│   ├── complaints.js            # Grievance validation, GPS simulation, token generator, tracker
│   ├── announcements.js         # Notice board search, urgency filters, agenda modal
│   ├── auth.js                  # Login/Register validation, role switcher, 1-click test fill
│   ├── resident.js              # Resident portal history and status counters
│   └── admin.js                 # Sarpanch desk: triage table, status dropdowns, CSV exporter
├── pages/
│   ├── village-dashboard.html   # Village Pulse: ward metrics, utilities telemetry, SLA scores
│   ├── services.html            # Searchable 6-department local services directory
│   ├── complaint-submit.html    # Citizen grievance submission form with photo preview
│   ├── complaint-track.html     # Real-time 4-step status timeline & feedback rating
│   ├── announcements.html       # Gram Sabha meetings, advisories, health immunization drives
│   ├── auth.html                # Role-based authentication portal (Resident vs Admin)
│   ├── resident-dashboard.html  # Citizen personal command center
│   └── admin-dashboard.html     # Sarpanch / Administrative control room
└── database/
    └── schema.sql               # Production Supabase PostgreSQL schema with RLS policies
```

---

## 🔑 4. Interactive Viva Demonstration Flow

When presenting this project to your college project evaluators:

### Step 1: Public Homepage & Language Switch
- Open [`index.html`](index.html).
- Show the **Emergency Helpline Strip** (108, 1091, 1551, 112).
- Click the **मराठी (Marathi)** button in the top right: show how the entire interface instantly switches to vernacular Marathi for rural villagers.
- Point out the **Hero Section** with real-time trust metrics (94.2% Resolved Rate, 48-Hour SLA guarantee).

### Step 2: Instant Public Tracking (No Login Required)
- In the Quick Track Bar, enter `GL-2026-1042` and click **Check Status**.
- It opens [`pages/complaint-track.html`](pages/complaint-track.html):
  - Point out the **4-Step Visual Stepper** (Registered ➔ Verified ➔ In Progress ➔ Resolved).
  - Show the assigned field officer (Santosh Jadhav) and the live activity log.

### Step 3: Lodging a Real Complaint
- Navigate to [`pages/complaint-submit.html`](pages/complaint-submit.html).
- Select **Drinking Water Supply**, choose **Ward 2 - Shivaji Chowk**, enter a subject and phone number.
- Click **📍 Detect GPS**: show the auto-detected coordinates.
- Click **Submit Grievance to Panchayat**:
  - A success modal appears with a newly generated reference token (e.g. `GL-2026-4819`).
  - Click **Track Status Now** to demonstrate that the new complaint was saved directly to client state!

### Step 4: Resident Portal
- Navigate to [`pages/auth.html`](pages/auth.html).
- Click the 1-click button: **Fill Resident (Ramesh)** and click **Sign In**.
- It opens [`pages/resident-dashboard.html`](pages/resident-dashboard.html):
  - View personal metrics and the historical list of filed grievances.

### Step 5: Sarpanch & Admin Control Desk
- Navigate back to [`pages/auth.html`](pages/auth.html).
- Click **Fill Admin (Sarpanch)** and click **Sign In**.
- It opens [`pages/admin-dashboard.html`](pages/admin-dashboard.html):
  - Notice the **Grievance Triage Table**.
  - Change a status from **Pending** to **In Progress** or **Resolved**.
  - Show that it immediately asks for administrative notes and updates the local state.
  - Click **📢 Broadcast Notice** to add a new Gram Sabha announcement.
  - Click **📥 Export Report (CSV)** to generate an official downloadable audit spreadsheet.

---

## 🎓 5. Examiner Viva Questions & Answers (CSBS Focus)

### Q1: What makes this a Computer Science & Business Systems (CSBS) project rather than standard CS?
> **Answer:** Standard Computer Science projects focus purely on CRUD operations and database tables. CSBS bridges technical architecture with **business and governance operations**. Gramlink 360 models:
> 1. **Service Level Agreement (SLA) Management:** Every ticket has a mandatory 48-hour countdown timer.
> 2. **Business Process Re-engineering (BPR):** Removing intermediaries, bribery, and paper delays by connecting villagers directly to assigned field officers.
> 3. **Social Auditing:** The Village Pulse page provides public transparency into ward performance and budget utilization, reducing corruption.

### Q2: Why did you choose Vanilla JavaScript instead of React or Angular?
> **Answer:** 
> 1. **Zero Runtime Overhead:** Rural internet connections often have low bandwidth. A vanilla JS application has zero bundle bloat and loads under 1 second on low-end budget smartphones.
> 2. **Engineering Fundamentals:** Demonstrates deep mastery of modern DOM APIs, asynchronous JavaScript, Web Storage APIs, and IntersectionObserver without relying on heavy third-party framework dependencies.

### Q3: How does security work if you don't have a traditional backend server?
> **Answer:** We designed the system around **Supabase Row Level Security (RLS)** in PostgreSQL (`database/schema.sql`). In PostgreSQL RLS, security policies are enforced at the database kernel level based on the user's cryptographically signed JWT token (`auth.uid()`). Even if an attacker modifies the browser JavaScript, PostgreSQL rejects any unauthorized `UPDATE` or `DELETE` query.

---

---

## ⚡ 6. Supabase Live Integration & Security Architecture

The frontend is integrated with **Supabase PostgreSQL** and **Supabase Auth** using `@supabase/supabase-js v2`.

### 6.1 Static Site Configuration Strategy
Static websites hosted on GitHub Pages, Netlify, or Vercel do not possess server-side runtimes to read `.env` files dynamically. Gramlink 360 uses a documented, static-compatible configuration module:
* **File:** [`js/config.js`](js/config.js)
* **Object:** `window.GRAMLINK_CONFIG`
* Exposes only the **publishable client key (`anon` key)**, which is safe for client-side execution under Row Level Security.
* The `service_role` (secret) key is strictly excluded.

### 6.2 Implemented Operations & Live Database Mapping

| Operation | Supabase API Method | Target PostgreSQL Table | Security Enforcement |
| :--- | :--- | :--- | :--- |
| **Resident Signup** | `supabase.auth.signUp()` | `auth.users` ➔ `profiles` | Database trigger forces `role = 'resident'`. Client role spoofing is blocked. |
| **Resident Login** | `supabase.auth.signInWithPassword()` | `auth.users` & `profiles` | Authenticated session token stored in browser localStorage. |
| **Session Detection** | `supabase.auth.getSession()` | Client-side & JWT | Header dynamically displays name & role badge; manages logout. |
| **File Complaint** | `supabase.from('complaints').insert()` | `public.complaints` | RLS enforces `auth.uid() = citizen_id` and `status = 'Pending'`. |
| **Track Complaint** | `supabase.from('complaints').select('*, complaint_status_history(*)')` | `complaints` & `complaint_status_history` | Public token lookup permitted without revealing unrelated private tickets. |
| **Resident History** | `supabase.from('complaints').select()` | `public.complaints` | RLS restricts query strictly to `citizen_id = auth.uid()`. |
| **Services Directory** | `supabase.from('services').select()` | `public.services` | Public read permitted for `is_active = true`. |
| **Announcements** | `supabase.from('announcements').select()` | `public.announcements` | Public read permitted. Writes restricted strictly to `administrator`. |
| **Admin Triage** | `supabase.from('complaints').update()` | `public.complaints` | RLS checks `public.is_admin()`. Automatic trigger logs change to `complaint_status_history`. |

### 6.3 Row Level Security (RLS) Principle of Least Privilege
Direct administrative operations are guarded at the database kernel level:
```sql
-- Prevents non-administrators from tampering with complaint statuses
CREATE POLICY "complaints_admin_officer_update"
  ON public.complaints FOR UPDATE
  TO authenticated
  USING (public.is_officer_or_admin() OR assigned_officer_id = auth.uid());
```
Even if an attacker attempts an unauthorized `fetch()` or `curl` query with the `anon` key, PostgreSQL terminates the transaction with an RLS access-denied exception.
