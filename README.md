# ✦ THE AUCTION SOCIETY
### High-Concurrency Editorial Auction Engine & Academic DBMS Mini-Project
**Bharatiya Vidya Bhavan's Sardar Patel Institute of Technology (SPIT, Mumbai)**  
**Course**: Relational Database Management Systems (RDBMS)  
**Target Engine**: MySQL 8.4+ (InnoDB, 3NF Relational Schema, Triggers, Views, Events, TCL)

---

## 👥 Project Team & Architects
* **Ankit Anand** (`2025800005`) — Lead System Architect & Full-Stack Lead
* **Aryaman Annavajhala** (`2025800006`) — Co-Architect & Database Engineer (Schema, Triggers & Transactions)

---

## ⚡ Quick Start: Launching Frontend & Backend

The project uses a **unified single-process architecture**. Both the responsive frontend (HTML, CSS, JS, authentic typography) and the high-concurrency REST API run on **`http://localhost:3000`** with zero CORS issues.

```bash
# 1. Ensure local MySQL service is running
sudo systemctl start mysqld

# 2. Start the unified server (Node.js v18+)
npm start
# (Or alternatively: node server.js)

# 3. Open your browser:
http://localhost:3000
```

> **Pre-configured Accounts for Testing & Viva Demonstrations**:
> - **Administrator**: `admin@theauctionsociety.com` / `admin12345`
> - **Buyer**: `buyer@theauctionsociety.com` / `buyer12345`
> - **Seller**: `seller@theauctionsociety.com` / `seller12345`
> - **Both (Buyer & Seller)**: `member@theauctionsociety.com` / `both12345` *(Sachin)*

---

## 🗄️ Local MySQL Database & MySQL Workbench Connection

The backend connects directly to local MySQL 8.4 via an asynchronous connection pool (`db.js`).

### 1. Connection Parameters for MySQL Workbench
Open **MySQL Workbench**, click the **`+`** icon next to *MySQL Connections*, and enter:

| Field | Configuration Value |
|---|---|
| **Connection Name** | `Auction Society Local` |
| **Connection Method** | `Standard (TCP/IP)` |
| **Hostname** | `127.0.0.1` *(or `localhost`)* |
| **Port** | `3306` |
| **Username** | `auction_user` *(or `root`)* |
| **Password** | `AuctionPass123!` *(or root password `Ankitsql`)* |
| **Default Schema** | `auction_society` |

Click **Test Connection** — you will receive a green confirmation dialog: *"Successfully made the MySQL connection"*.

### 2. Loading / Resetting the Database in MySQL Workbench
1. In MySQL Workbench, click **File ➔ Open SQL Script...** and select **`schema.sql`**.
2. Click the **Execute (Lightning Bolt ⚡)** icon.
3. The script will drop and recreate `auction_society`, build all 9 tables, weak entities, triggers, views, and seed data.

---

## 🔄 Real-Time Two-Way Sync (MySQL Workbench ⇄ Live Website)

Our backend features **live database synchronization**. Any query written in MySQL Workbench updates the website instantly upon refresh, and any action on the website commits directly to MySQL!

### Test Case A: Update via MySQL Workbench ➔ Watch Website Update
1. Open MySQL Workbench query tab and run:
   ```sql
   USE auction_society;
   UPDATE auction SET current_bid = 95000.00 WHERE auction_id = 1;
   ```
2. In your browser, open or refresh **`http://localhost:3000/catalog.html`**.
3. **Result**: Lot #1 (*The Genesis Chronograph 1984*) immediately renders with the updated current bid of **₹95,000**!

### Test Case B: Place Bid on Website ➔ Inspect Live Rows in Workbench
1. On **`http://localhost:3000/catalog.html`**, log in as **Buyer** (`buyer@theauctionsociety.com` / `buyer12345`).
2. Open Lot #1 and place a bid of **₹96,000**.
3. Switch back to MySQL Workbench and run:
   ```sql
   -- 1. Inspect the new atomic bid row
   SELECT * FROM bid ORDER BY bid_id DESC LIMIT 3;

   -- 2. Observe the auction state updated automatically by trigger trg_bid_audit
   SELECT auction_id, current_bid, highest_bid, bid_count, winner_id FROM auction WHERE auction_id = 1;

   -- 3. Verify the compliance audit trail inserted by the trigger
   SELECT * FROM audit_log ORDER BY log_id DESC LIMIT 3;
   ```
4. **Result**: The trigger `trg_bid_audit` atomically incremented the bid counter, updated `current_bid` and `highest_bid`, set `winner_id = 2`, and appended a tamper-proof event to `audit_log`.

---

## 📐 Section 5 ER Diagram & 3NF Relational Mapping

Our database schema (`schema.sql`) strictly mirrors the **Section 5 ER Diagram**:

```
[Category] 1 ──────<classified as>────── N [Item] 1 ──────<put up for>────── N [Auction]
                                             │                                      │
                                             │ lists (N:1)                          │ settled by (1:1)
                                             ▼                                      ▼
                                          [Users] 1 ────────<pays>──────── N [Payment]
                                           │  │  │
                identifying "has" (1:N)    │  │  │ places (1:N)
                                           ▼  │  ▼
                                  [User_Phone]│ [Bid] ◄────── receives (1:N) ──────┘
                                (Weak Entity) │
                                              ▼
                                         [Watchlist] (Associative M:N Entity: added_at)
```

### Detailed Attribute & Entity Verification Matrix

| ER Entity | ER Attributes (from Diagram) | Relational Table & 3NF Implementation | Theoretical Notes & Compliance |
|---|---|---|---|
| **`Category`** | `category_id` (PK), `category_name`, `description` | `category(category_id, category_name, name, slug, description)` | 1:N relationship `classified as` with Item. Total participation on Item. |
| **`Users`** | `user_id` (PK), `name` (Composite: `first_name`, `last_name`), `email`, `registered_at`, `status`, `role` | `users(user_id, first_name, last_name, name, email, role, status, registered_at, password_hash, password_salt)` | Composite attribute `name` decomposed into atomic `first_name` and `last_name` (1NF). Synchronized automatically via `trg_users_before_insert`. |
| **`User_Phone`** | `user_id` (FK), `phone_no` (Partial Key) | `user_phone(user_id, phone_no)` *(Composite PK: user_id + phone_no)* | **Weak Entity** connected via identifying relationship `has` (double diamond). Models multivalued contact numbers without repeating groups. |
| **`Item`** | `item_id` (PK), `title`, `description`, `item_condition`, `starting_price`, `listed_at` | `item(item_id, seller_id, category_id, title, description, item_condition, condition_type, starting_price, location, image_url, listed_at)` | Decoupled physical lot specification. `starting_price` and `item_condition` preserved from ER diagram. |
| **`Auction`** | `auction_id` (PK), `start_time`, `end_time`, `final_price`, `reserve_price`, `min_increment`, `status`, `highest_bid` *(Derived)*, `time_remaining` *(Derived)* | `auction(auction_id, item_id, starting_price, reserve_price, min_increment, current_bid, highest_bid, final_price, bid_count, winner_id, status, start_time, end_time)` | Derived attribute `highest_bid` maintained by trigger; derived attribute `time_remaining` computed dynamically via `TIMESTAMPDIFF(SECOND, NOW(), end_time)` in view `active_auctions_view`. |
| **`Bid`** | `bid_id` (PK), `bid_amount`, `bid_time` | `bid(bid_id, auction_id, bidder_id, bid_amount, amount, bid_time, is_winning, ip_address)` | Append-only ledger. Pre-validated by trigger `trg_bid_validate`. |
| **`Payment`** | `payment_id` (PK), `amount`, `payment_method`, `due_by`, `paid_at`, `status` | `payment(payment_id, auction_id, payer_id, amount, payment_method, due_by, deadline_at, paid_at, status, payment_status, transaction_ref)` | 1:1 settlement ledger with Auction. Unique constraint on `auction_id` ensures exactly one settlement per lot. |
| **`Watchlist`** | `user_id` (PK), `auction_id` (PK), `added_at` | `watchlist(user_id, auction_id, added_at, created_at)` | Associative entity resolving M:N relationship `watches` with temporal attribute `added_at`. |
| **`Audit_Log`** | Compliance ledger | `audit_log(log_id, event_type, user_id, auction_id, summary, ip_address, created_at)` | Exp-5 compliance ledger populated by database triggers. |

> **College Curriculum Rules Strictly Maintained**:
> - 🚫 **Zero `CASCADE`**: Explicit referential constraints preventing silent cascade deletes.
> - 🚫 **Zero `UNSIGNED`**: Strictly standard ANSI SQL `INT` and `DECIMAL(12,2)`.
> - 🚫 **Zero `ENUM`**: Replaced with declarative ANSI SQL `CHECK (...)` domain constraints.

---

## 🧪 Automated Testing & Verification

### 1. Database-Only SQL Stress Test (6 Test Suites)
Tests relational integrity, self-bidding prevention trigger, minimum increment enforcement, trigger state updates, and TCL savepoint rollback:
```bash
mysql -h 127.0.0.1 -u auction_user -p'AuctionPass123!' < stress_test.sql
# Output: ALL 6 TEST SUITES EXECUTED WITH 100% SUCCESS!
```

### 2. Full-Stack End-to-End Stress Test (29 Tests)
Tests frontend static delivery, MySQL triggers, auth cookies, REST bidding engine, seller lot creation, watchlist toggling, and 50 simultaneous high-concurrency requests:
```bash
node test_full_stack_stress.js
# Output: 29/29 TESTS PASSED (100% SUCCESS)
```

---

## 🎓 Top Professor Viva Questions & Answers

### Q1: "How did you map the weak entity and multivalued attributes from the ER diagram?"
> **Answer**:  
> In Section 5 of our ER diagram, `User_Phone` is a weak entity connected to `Users` via the identifying relationship `has` with total participation. In relational 3NF (`schema.sql`), this is mapped to a dedicated relation `user_phone(user_id, phone_no)` with a composite primary key `(user_id, phone_no)`. This satisfies First Normal Form (1NF) by eliminating multivalued repeating groups while enforcing referential integrity back to `users(user_id)`.

### Q2: "How are the derived attributes from the ER diagram handled in SQL?"
> **Answer**:  
> In our ER diagram, `highest_bid` and `time_remaining` are drawn with dashed ovals, indicating they are derived attributes. In SQL:
> 1. `highest_bid` is maintained in `auction` via the database trigger `trg_bid_audit`, which atomically synchronizes `highest_bid = NEW.bid_amount` upon every valid bid.
> 2. `time_remaining` is computed dynamically in the database view `active_auctions_view` using `TIMESTAMPDIFF(SECOND, NOW(), a.end_time)`, avoiding stale data storage.

### Q3: "How does your system prevent race conditions when two buyers bid simultaneously?"
> **Answer**:  
> At the database layer, concurrency is secured using InnoDB row-level locking (`SELECT ... FOR UPDATE`) and ACID serializable transaction boundaries. The database trigger `trg_bid_validate` verifies that the incoming bid strictly exceeds `current_bid + min_increment` before allowing insertion. In Node.js, the event loop handles bid evaluations synchronously per tick.

### Q4: "Show me how MySQL Workbench updates reflect on the website in real time."
> **Answer**:  
> Our Node.js backend connects to MySQL using a connection pool. Every catalog or lot query invokes `syncFromDatabase()`, reading directly from the `auction`, `item`, and `category` tables. Running an `UPDATE auction SET current_bid = 95000 WHERE auction_id = 1;` in MySQL Workbench updates the database immediately, and refreshing the browser renders the updated price instantly.

---

## 📁 Repository Structure

```
├── index.html            # Landing page (Editorial hero, manifesto, team cards)
├── catalog.html          # Transactional catalog (Search, category filters, live bidding)
├── architecture.html     # Academic DBMS showcase (Interactive schema inspection, triggers, ACID)
├── system-log.html       # Admin desk & real-time transaction audit ledger
├── account.html          # Member authentication & dashboard (Bids, listings, watchlist, payments)
├── server.js             # High-concurrency Node.js HTTP server & REST API (Port 3000)
├── db.js                 # MySQL 8.4 connection pool & health checker
├── schema.sql            # Master DDL with 3NF tables, weak entities, triggers, views, & TCL
├── stress_test.sql       # 6-suite automated database stress test
├── test_full_stack_stress.js # 29-test end-to-end full-stack verification script
├── style.css             # Unified editorial CSS with CRT scanlines & responsive grids
├── script.js             # Interactive client-side logic & architecture inspectors
└── assets/               # Photographic lot assets and SVG placeholders
```
