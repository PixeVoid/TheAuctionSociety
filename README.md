# ✦ THE AUCTION SOCIETY
### High-Concurrency Editorial Auction Engine & Academic DBMS Mini-Project
**Bharatiya Vidya Bhavan's Sardar Patel Institute of Technology (SPIT, Mumbai)**  
**Course**: Relational Database Management Systems (RDBMS)  
**Target Engine**: MySQL 8.0+ (InnoDB, 3NF/BCNF, Triggers, Views, Events)

---

## 👥 Project Team & Architects
* **Ankit Anand** (`2025800005`) — Lead System Architect & Full-Stack Lead
* **Aryaman Annavajhala** (`2025800006`) — Co-Architect & Database Engineer (Schema, Triggers & Transactions)

---

## ⚡ Quick Start (1 Command Launch)

No third-party packages or heavy installs required. Runs natively on standard **Node.js (v18+)**:

```bash
# 1. Start the server (demo accounts are bootstrapped automatically):
npm start

# (Optional: override administrator credentials via environment variables)
ADMIN_EMAIL="admin@theauctionsociety.com" ADMIN_PASSWORD="admin12345" npm start

# 2. Open in your browser:
http://localhost:3000
```

> **Pre-configured Accounts for Viva Demonstration**:
> - **Administrator**: `admin@theauctionsociety.com` (or `admin@theauctionsociety.internal`) / `admin12345`
> - **Buyer**: `buyer@theauctionsociety.com` (or `buyer@theauctionsociety.internal`) / `buyer12345`
> - **Seller**: `seller@theauctionsociety.com` (or `seller@theauctionsociety.internal`) / `seller12345`
> - **Both (Buyer & Seller)**: `member@theauctionsociety.com` (or `both@theauctionsociety.com`) / `both12345`

### 🌐 Live Production Deployment
* **Vercel Live URL**: [https://the-auction-society.vercel.app](https://the-auction-society.vercel.app)
* **GitHub Repository**: [https://github.com/PixeVoid/TheAuctionSociety.git](https://github.com/PixeVoid/TheAuctionSociety.git)
* **Serverless Architecture**: Configured via `vercel.json` with edge static asset caching (`handle: "filesystem"`) and automated Node.js serverless routing for `/api/*` endpoints.

---

## 🗺️ Visual Architecture Map (Pictograph)

```
========================================================================================
                          BROWSER CLIENT (EDITORIAL FRONTEND)
========================================================================================
   [ index.html ]        [ catalog.html ]       [ architecture.html ]   [ system-log.html ]   [ account.html ]
   Editorial Hero        Live Bidding Grid      SPIT 3NF Schema         Admin Moderation      Member Dashboard
   Featured Lots         Search & Filters       Triggers & ACID View    Audit Log Stream      Auth / My Lots
         │                      │                      │                       │                     │
         └──────────────────────┴───────────────┬──────┴───────────────────────┴─────────────────────┘
                                                │ REST API Calls (fetch) + HTTP-Only Session Cookie
                                                ▼
========================================================================================
                       UNIFIED BACKEND ENGINE (server.js @ Port 3000)
========================================================================================
  ┌──────────────────────────────────────────────────────────────────────────────────┐
  │                               HTTP ROUTER & STATIC FILES                          │
  │  - Serves static assets: CSS (CRT Shaders), JS, Fonts (FK Raster, Space Grotesk)  │
  │  - Resolves extensionless clean URLs: /catalog, /architecture, /account, etc.     │
  └─────────────────────────────────────┬────────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┼─────────────────────────────┐
           ▼                            ▼                             ▼
  ┌─────────────────┐          ┌──────────────────┐          ┌───────────────────┐
  │  AUTH & RBAC    │          │ AUCTION LIFECYCLE│          │   ADMIN DESK      │
  │  Scrypt Hashing │          │ 30s Expiry Daemon│          │   Category Editor │
  │  Session Tokens │          │ Winner Picker    │          │   Member Status   │
  │  Buyer / Seller │          │ 48h Payment Lock │          │   Live Audit Log  │
  └────────┬────────┘          └────────┬─────────┘          └─────────┬─────────┘
           │                            │                              │
           └────────────────────────────┼──────────────────────────────┘
                                        ▼
========================================================================================
                      CORE DATA LAYER (In-Memory -> MySQL 8.0 DDL)
========================================================================================
  ┌──────────────────────────────────────────────────────────────────────────────────┐
  │  8 Relational 3NF Entities (SPIT Exp-1 DDL with Integrity Constraints):          │
  │  users ──< item ──< auction ──< bid ──< payment                                  │
  │     │       │          │                                                         │
  │     │   category   watchlist                                  audit_log          │
  │     └─────────────────────────────────────────────────────────────┘              │
  └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 Connection Matrix: Which Page Calls Which API?

| Page | Role & Purpose | API Endpoints Called | What Happens Under the Hood |
|---|---|---|---|
| **`index.html`** | Editorial landing & brand showcase | `GET /api/auctions` | Fetches active lots for the featured lots teaser slider. |
| **`catalog.html`** | Transactional browsing & bidding | `GET /api/categories`<br>`GET /api/auctions`<br>`POST /api/auctions/:id/bid`<br>`POST /api/auctions/:id/watchlist` | - Filters/sorts auctions in real-time.<br>- Submits atomic bids (checks minimum increment & self-bid).<br>- Toggles saved lots to member watchlist. |
| **`architecture.html`** | Academic DBMS showcase | *Static / Informational* | Demonstrates the 8-table schema (Exp-1), SQL triggers (Exp-5), Joins/Views/Subqueries (Exp-4), 3NF normalization, and ACID concurrency engine to professors. |
| **`system-log.html`** | Admin desk & audit ledger | `GET /api/admin/dashboard`<br>`POST /api/admin/categories`<br>`PATCH /api/admin/users/:id/status`<br>`POST /api/admin/auctions/:id/cancel` | - Streams live audit history.<br>- Adds/renames auction categories.<br>- Blocks/unblocks fraudulent users.<br>- Forces emergency auction cancellations. |
| **`account.html`** | Member login, register & dashboard | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`POST /api/auth/logout`<br>`GET /api/me`<br>`GET /api/dashboard`<br>`POST /api/listings`<br>`POST /api/auctions/:id/payment` | - Registers new users as Buyer, Seller, or Both.<br>- Logs in and receives secure session cookie.<br>- Displays user's active bids, won lots, and watchlist.<br>- Allows sellers to create new auction listings.<br>- Simulates 48-hour payment settlement for winners. |

---

## 🔄 Auction & Bidding Lifecycle (State Machine)

```
  [ Seller Form ]
        │
        ▼ (POST /api/listings)
  ┌───────────┐         Starts at Start Time
  │ SCHEDULED │ ──────────────────────────────────────┐
  └───────────┘                                       ▼
        │                                       ┌───────────┐
        │ Cancelled by Admin / Seller           │  ACTIVE   │ ◄───┐
        ▼                                       └─────┬─────┘     │
  ┌───────────┐                                       │           │ Atomic Bids
  │ CANCELLED │                                       │ Bidding   │ (POST /api/auctions/:id/bid)
  └───────────┘                                       ▼           │
                                                [ Bid Validation ] ──┘
                                                - User != Seller?
                                                - Bid >= Current + Min Increment?
                                                - Auction status == ACTIVE?
                                                - Timestamp tie-breaker?
                                                      │
                                                      │ 30s Server Clock Ticks
                                                      ▼ End Time Elapsed
                                                ┌───────────┐
                                                │  CLOSED   │
                                                └─────┬─────┘
                                                      │
                            ┌─────────────────────────┴────────────────────────┐
                            ▼                                                  ▼
                  Reserve Price Met?                                 Reserve Not Met?
                            │                                                  │
                            ▼                                                  ▼
                     [ Winner Picked ]                                   [ No Sale ]
                            │                                                  │
                            ▼                                                  ▼
                   ┌─────────────────┐                                  ┌─────────────┐
                   │ PAYMENT PENDING │                                  │ UNSOLD_LOT  │
                   └────────┬────────┘                                  └─────────────┘
                            │
                            │ Buyer Settles (POST /api/auctions/:id/payment)
                            ▼
                   ┌─────────────────┐
                   │      PAID       │ (Simulated 48h settlement)
                   └─────────────────┘
```

---

## 🎓 Professor Viva Cheat-Sheet (Top 5 Questions & Answers)

### Q1: "How do you run the frontend and backend together?"
> **Answer**:  
> The project runs on a **unified local origin** (`http://localhost:3000`) powered by Node.js built-in `http` module with **zero external npm dependencies**. The server serves the HTML/CSS/JS frontend files statically and handles all `/api/*` REST endpoints on the exact same port, preventing CORS errors.

### Q2: "How does the system prevent race conditions when two people bid at the exact same millisecond?"
> **Answer**:  
> In Node.js, request processing on the event loop is single-threaded. Each bid evaluation (reading current price, checking the minimum increment, verifying the user is not the seller, and writing the new high bid) executes **atomically within a synchronous turn**. In MySQL, this is enforced using `SELECT ... FOR UPDATE` row-level locks and `SERIALIZABLE` transaction isolation in InnoDB.

### Q3: "How is user authentication secured?"
> **Answer**:  
> Passwords are never stored in plaintext. They are hashed using Node.js's native **`crypto.scrypt`** algorithm with unique random 16-byte cryptographic salts. Authenticated sessions use randomized 64-character hex tokens stored in server memory and delivered via **`HttpOnly; SameSite=Lax`** cookies to protect against XSS and CSRF attacks.

### Q4: "How does the site close auctions automatically without a cron job?"
> **Answer**:  
> The backend runs a lightweight 30-second interval timer daemon (`setInterval`). Every 30 seconds, it queries for auctions whose `endTime <= now` and status is `ACTIVE`. It automatically marks them `CLOSED`, evaluates whether the reserve price was met, designates the highest bidder as the winner, and generates a payment obligation with a 48-hour deadline.

### Q5: "Where are the team members credited and how is academic DBMS represented?"
> **Answer**:  
> Architects **Ankit Anand** (`2025800005`) and **Aryaman Annavajhala** (`2025800006`) are showcased on the home page ([index.html](file:///home/void/Documents/antigravity/bold-heisenberg/index.html)) with pixel-art hover cards. The dedicated [architecture.html](file:///home/void/Documents/antigravity/bold-heisenberg/architecture.html) page details the 8-entity relational schema (Exp-1), 3NF normalization proofs, SQL triggers (Exp-5: `trg_bid_validate`, `trg_bid_audit`), analytical views & subqueries (Exp-4), and ACID compliance model.

---

## 📁 Repository File Map

```
├── index.html            # Landing page (Hero, stickers, manifesto, team cards, footer)
├── catalog.html          # Transactional catalog (Search, category filters, bidding modal)
├── architecture.html     # Academic DBMS showcase (Schema, 3NF proofs, triggers, ACID)
├── system-log.html       # Admin desk & real-time transaction audit ledger
├── account.html          # Member authentication & dashboard (Bids, listings, watchlist)
├── server.js             # Dependency-free Node.js HTTP server & REST API (Port 3000)
├── style.css             # Unified CSS (Design Society theme, CRT scanlines, layouts)
├── script.js             # Global interactivity (Lenis smooth scroll, scramblers, nav)
├── fonts/                # Authentic bespoke fonts (FK Raster Roman, Space Grotesk, KH Teka)
└── assets/               # Pixel-art SVG stickers, crests, and media
```
