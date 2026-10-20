# Online Auction System Project Checklist

This checklist follows the project brief and the DBMS assignment. We will build the website frontend and backend first, then complete the MySQL design and implementation needed for the mini-project. The website is the interface for demonstrating the database-backed auction workflow.

## Phase 1 — Website frontend (The Auction Society Editorial UI)

- [x] Bespoke editorial design language based on The Design Society (CRT scanlines, chromatic aberration, pixel art crests).
- [x] Exact custom typography: FK Raster Roman Compact Smooth, KH Teka, KH Interference, Geist Pixel Line.
- [x] Custom navigation modal overlay matching reference (Catalog, Auctions, DBMS Architecture, System Log).
- [x] Staggered 3-line hero title with transparent pixel stickers referencing MySQL 8.0+.
- [x] Team cards for Ankit Anand (2025800005) and Aryaman Annavajhala (2025800006) with pixel-art hover reveal.

- [x] Set up a dependency-free frontend (HTML, CSS, JavaScript) and Node.js backend.
- [x] Define the visual style, navigation, and responsive page layout.
- [x] Build the home page with featured and active auctions.
- [x] Build the auction browse page with search, category filters, and sorting.
- [x] Build the auction detail page with item information, auction timer, and bid form.
- [x] Build registration and sign-in screens with role selection.
- [x] Build the seller flow for listing an item and scheduling an auction.
- [x] Build the member dashboard for saved lots, bid history, won lots, listings, and simulated payment updates.
- [x] Add empty, validation, and API error states throughout the interface.
- [x] Review the running website at desktop and mobile sizes and adjust any issues found.
- [x] Add admin screens for category and user management, auction cancellation, and audit history.

## Phase 2 — Backend and API

- [x] Create the Node.js backend server.
- [x] Define API routes for authentication, auctions, bidding, watchlists, listings, category/user moderation, dashboard, audit, and demo payments.
- [ ] Add configuration for the future MySQL connection without embedding secrets in source control.
- [x] Implement registration, sign-in, password hashing, sessions, and buyer/seller role checks.
- [x] Implement in-memory auction browse/search/filter and detail endpoints.
- [x] Implement authenticated watchlist endpoints.
- [x] Implement bid submission with auction status, minimum increment, and self-bidding checks.
- [x] Implement seller listing, editing, and cancellation with authorization checks.
- [x] Implement admin category, user-status, auction-cancellation, and audit operations.
- [x] Implement payment-status display and simulated payment updates; no real payment gateway is in scope.
- [x] Connect the frontend to the API and handle API errors and session state.
- [ ] Replace temporary in-memory data with MySQL after schema design is complete.

## Phase 3 — MySQL design and DBMS deliverables

- [ ] Confirm entities, attributes, relationships, and business rules.
- [ ] Finalize the ER diagram, including cardinalities and participation.
- [ ] Convert the ER diagram into a relational schema.
- [ ] Document primary keys, foreign keys, candidate keys, and referential actions.
- [ ] Check normalization through 3NF and explain any intentional stored snapshots.
- [ ] Create the MySQL database and tables in dependency order.
- [ ] Add `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`, and index definitions.
- [ ] Insert consistent sample data covering scheduled, active, closed, cancelled, winning, and no-winner auctions.
- [ ] Implement and demonstrate bid validation, winner selection, and auction closing.
- [ ] Implement payment creation and overdue-payment handling.
- [ ] Implement audit logging for the agreed important actions.
- [ ] Create views for active auctions, winner/payment summaries, and seller earnings.
- [ ] Prepare representative joins, aggregates, subqueries, date/time queries, and syllabus examples.
- [ ] Prepare negative cases: late bid, too-small bid, seller self-bid, blocked bidder, below-reserve auction, and restricted deletion.
- [ ] Reconcile the documented rules, SQL, sample records, and website behavior so they agree.

## Phase 4 — Integration and submission

- [ ] Connect the backend to the finalized MySQL schema.
- [ ] Verify the main user flows from the website through the API to MySQL.
- [ ] Capture evidence of database structure, constraints, triggers/events, views, and query results.
- [ ] Complete the case study: requirements, working, entities/dependencies, ER diagram, schema, keys, constraints, normalization, MySQL creation, relationships, and sample data.
- [ ] Prepare a short demonstration covering buyer, seller, and admin workflows.
- [ ] Confirm project topic approval and include group member names and roll numbers in the submission.

## Decisions to record as we begin

- Frontend stack: HTML, CSS, browser JavaScript
- Backend stack: Node.js built-in HTTP server; no third-party packages
- Local development/run instructions: `npm start`, then open `http://localhost:3000`
- API contract location: routes and request handling in `server.js`
- Admin bootstrap: set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before `npm start` (see `README.md`)
- MySQL version/hosting: MySQL 8.0+ (InnoDB, 3NF/BCNF, Triggers, Views, Events)
- Group members and roll numbers: Ankit Anand (UID: 2025800005) & Aryaman Annavajhala (UID: 2025800006)

## Design questions to settle before the related implementation

- [x] Authentication approach and password hashing for the temporary backend; migrate credential records to MySQL during the database phase.
- [x] Website-phase auction status is advanced by the backend timer every 30 seconds; MySQL event design remains part of the SQL phase.
- [x] Equal bids are resolved by the earliest bid timestamp.
- [x] The simulated payment deadline is 48 hours after the backend closes the auction.
- [x] The temporary audit log records registration/login, listing changes, bids, watchlist changes, payment updates, moderation, auction closure, and overdue status.
- [x] Admin-only category, account-status, cancellation, and audit functions are restricted to the bootstrapped Admin role. Cancelled auctions stay cancelled.

## Working preference

- Remove superseded handlers, routes, styles, and notes when changing a feature. Keep one current implementation rather than leaving stale code around.

