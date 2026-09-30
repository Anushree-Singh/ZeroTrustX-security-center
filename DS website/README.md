# ZeroTrustX Security Command Center
### A Data-Structure-Based Zero Trust Access Control & Threat Monitoring Simulator for Cloud Resources

> **Academic Project Note:**
> This project demonstrates core computer science data structures implemented in native C99 linked to a modern cybersecurity command center dashboard.
> The **C backend is the single source of truth**: all risk evaluations, identity hashes, circular queue shifts, session continuous validations, and audit logs execute in native C code and persist in POSIX flat text files.

---

## 🏛️ System Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │                 ZeroTrustX Dashboard                   │
       │           (React 19 + TypeScript + Tailwind)           │
       └───────────────────────────┬────────────────────────────┘
                                   │ HTTP REST / JSON
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │               Node.js / Express Bridge                 │
       │       (server/bridge.js & server/apiRouter.js)         │
       └───────────────────────────┬────────────────────────────┘
                                   │ Child Process Execution / CLI IPC
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                  Native C99 Backend                    │
       │    (zerotrustx / zerotrustx_api compiled with GCC)     │
       └───────────────────────────┬────────────────────────────┘
                                   │
       ┌───────────────────────────┴────────────────────────────┐
       │                Core C Data Structures                  │
       ├────────────────────────────────────────────────────────┤
       │ 1. Hash Table with Separate Chaining (user.c)          │
       │    - table[31] array of UserNode pointers              │
       │    - O(1) avg user identity & status lookup            │
       │                                                        │
       │ 2. Circular Queue (queue.c)                            │
       │    - items[100] ring buffer with FRONT & REAR pointers │
       │    - Modulo arithmetic: (index + 1) % QUEUE_SIZE       │
       │    - O(1) FIFO enqueue & dequeue (zero memory shifts)  │
       │                                                        │
       │ 3. Singly Linked List (log.c)                          │
       │    - Dynamic LogNode allocation with malloc() & free() │
       │    - Head prepending (O(1) insert, newest logs first)  │
       │                                                        │
       │ 4. Contiguous Arrays (resource.c, session.c)           │
       │    - Resource resources[100] (Cloud assets & RBAC)     │
       │    - Session sessions[100] (Continuous validation)     │
       └───────────────────────────┬────────────────────────────┘
                                   │ POSIX File I/O
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             Persistent Text-File Storage               │
       │  users.txt | resources.txt | logs.txt | sessions.txt   │
       └────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
ZeroTrustX/
├── c-backend/                       # Native C Source Code (SOURCE OF TRUTH)
│   ├── common.h                     # Data structs: User, Resource, AccessRequest, Session, LogNode
│   ├── user.h / user.c              # Hash Table with Separate Chaining (table[31])
│   ├── resource.h / resource.c      # Contiguous Array for Cloud Targets
│   ├── queue.h / queue.c            # Circular Queue with modulo buffer
│   ├── log.h / log.c                # Singly Linked List for Access Logs
│   ├── session.h / session.c        # Array of Sessions & Revalidation Logic
│   ├── security.h / security.c      # Risk scoring & Zero Trust Decision Protocol
│   ├── storage.h / storage.c        # POSIX flat-file load & save functions
│   ├── main.c                       # Original interactive terminal CLI program
│   ├── api_cli.c                    # JSON Command Dispatcher for Node.js bridge
│   ├── users.txt                    # Flat-file database for users
│   ├── resources.txt                # Flat-file database for cloud resources
│   ├── logs.txt                     # Flat-file database for audit logs
│   ├── sessions.txt                 # Flat-file database for sessions
│   └── queue.txt                    # Flat-file queue persistence
│
├── server/                          # Node.js Express Bridge
│   ├── bridge.js                    # Process execution layer calling C binary
│   ├── apiRouter.js                 # Express REST API endpoints
│   ├── apiApp.js                    # Express app wrapper
│   └── server.js                    # Fullstack production server
│
├── src/                             # React 19 Frontend
│   ├── components/
│   │   ├── Sidebar.tsx              # Cybersecurity navigation bar
│   │   └── Header.tsx               # Status, security posture, and sync controls
│   ├── pages/
│   │   ├── DashboardPage.tsx        # High-level SOC metrics, KPIs & distribution
│   │   ├── UsersPage.tsx            # Hash table bucket visualizer & user actions
│   │   ├── ResourcesPage.tsx        # Array memory model & RBAC cloud targets
│   │   ├── AccessRequestPage.tsx    # Live C risk calculator & request submission
│   │   ├── QueueVisualizerPage.tsx  # Dynamic circular buffer ring with FRONT/REAR
│   │   ├── ThreatMonitoringPage.tsx # Anomaly heuristics & repeated denial alerts
│   │   ├── AccessLogsPage.tsx       # Singly linked list visualizer & audit trail
│   │   ├── ActiveSessionsPage.tsx   # Continuous session verification with device ID
│   │   ├── DataStructuresLabPage.tsx# In-depth viva laboratory & Q&A cheat-sheet
│   │   └── AdminStoragePage.tsx     # On-disk file storage inspector (*.txt viewer)
│   ├── api.ts                       # Frontend API client
│   ├── types.ts                     # TypeScript data interfaces
│   ├── App.tsx                      # Root application controller
│   └── main.tsx                     # Entry point
│
├── vite.config.ts                   # Vite dev server with C API middleware
└── package.json                     # Project manifest and scripts
```

---

## ⚡ Zero Trust Security Logic (in C)

The C backend executes the complete Zero Trust authorization workflow:

1. **Identity & Block Check:**
   - Looks up `userID` in Hash Table (`user.c`).
   - If user is blocked (`u->blocked == 1`), decision is **`DENIED`** ("User is blocked").

2. **Role-Based Access Control (RBAC):**
   - Matches user's role against target resource's `requiredRole` (`resource.c`).
   - If mismatch, decision is **`DENIED`** ("Insufficient privileges").

3. **Contextual Risk Assessment (`security.c`):**
   - Unknown Device: **+30 points**
   - Unusual Location: **+25 points**
   - Unusual Time: **+20 points**

4. **Decision Rules:**
   - **`Risk >= 60`** ➔ **`REVIEW`** ("High risk request")
   - **`Risk >= 30`** ➔ **`REVIEW`** ("Additional verification required")
   - **`Risk < 30`** ➔ **`GRANTED`** ("Identity, role and risk checks passed")
     - Spawns a new active session with lease tracking in `sessions.txt`.

5. **Continuous Trust Validation (`session.c`):**
   - An active session is revalidated with its current hardware device ID.
   - If device ID matches: **`VALID`** (session continues).
   - If device ID mismatches: **`REVOKED`** (session terminated immediately to block hijacked tokens).

---

## 🛠️ Compilation & Running Instructions

### Prerequisites
- GCC compiler (`gcc --version`)
- Node.js 18+ and npm

### 1. Compile C Backend
```bash
# Compile original interactive CLI program:
gcc c-backend/main.c c-backend/user.c c-backend/resource.c c-backend/queue.c c-backend/log.c c-backend/session.c c-backend/security.c c-backend/storage.c -o c-backend/zerotrustx

# Compile C JSON API binary for Web Bridge:
gcc c-backend/api_cli.c c-backend/user.c c-backend/resource.c c-backend/queue.c c-backend/log.c c-backend/session.c c-backend/security.c c-backend/storage.c -o c-backend/zerotrustx_api
```

### 2. Run Interactive C CLI (Terminal Mode)
```bash
cd c-backend
./zerotrustx       # (or zerotrustx.exe on Windows)
```

### 3. Run Web Command Center (Frontend + Backend Bridge)
```bash
# In the project root:
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🧪 Testing Checklist for College Viva

1. **Hash Table Lookup:**
   - Go to **Users**, toggle **Hash Buckets**.
   - Notice how User IDs are mapped to `bucket = userID % 31`.
   - Click **Block User** on any user (e.g. Alice).
   - Submit an access request for that user; observe C return **`DENIED` (User is blocked)**.

2. **Circular Queue Modulo Visualizer:**
   - Go to **Access Requests**, uncheck "Direct Evaluation" and submit a request.
   - Go to **Request Queue**; observe the slot highlighted in the circular dial.
   - Click **Process Next Request**; watch the **`FRONT`** pointer advance clockwise using `(front + 1) % 100`.

3. **Zero Trust Risk Thresholding:**
   - In **Access Requests**, select Bob (Developer) and GitLab (Developer).
   - Check **Unknown Device (+30)** and **Unusual Time (+20)** = **50 points**.
   - Watch the live C calculation output **50 pts** and decision **`REVIEW`**.
   - Now uncheck both flags (Risk = 0); observe decision **`GRANTED`** and new Session ID provisioned.

4. **Continuous Session Revalidation:**
   - Go to **Active Sessions**. Click **Revalidate** on an active session.
   - Test with the authorized device ID ➔ C returns **`VALID`**.
   - Test with `DEV-ATTACKER-999` ➔ C identifies the device spoof and returns **`REVOKED`**!

5. **Storage Persistence:**
   - Go to **Storage & System**.
   - View the raw on-disk files (`users.txt`, `resources.txt`, `logs.txt`, `sessions.txt`).
   - Notice the pipe-delimited format matching the C structs exactly.
