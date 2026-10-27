-- ============================================================================
-- SARDAR PATEL INSTITUTE OF TECHNOLOGY (SPIT, MUMBAI)
-- Course: Relational Database Management Systems (RDBMS) Mini-Project
-- Project: The Auction Society (High-Concurrency Real-Time Auction Engine)
-- Architects: Ankit Anand (2025800005) & Aryaman Annavajhala (2025800006)
--
-- Curriculum Alignment:
--   Exp-1: DDL Commands with Integrity Constraints (PK, FK, UNIQUE, CHECK, DEFAULT)
--          + Weak Entity (user_phone) & Composite Attributes (first_name, last_name)
--   Exp-2: DML Commands (INSERT, UPDATE, DELETE) & Transactions (COMMIT, ROLLBACK, SAVEPOINT)
--   Exp-3: SQL Operators (Arithmetic, Comparison, Logical, BETWEEN, IN, LIKE)
--   Exp-4: Joins (Inner, Left, Natural, Equi-Join), Aggregates, GROUP BY, HAVING, Subqueries
--   Exp-5: Database Views (CREATE VIEW) & Triggers (BEFORE / AFTER INSERT)
--
-- ER Diagram Alignment (Section 5 ER Diagram):
--   - Category (category_id, category_name, description)
--   - Item (item_id, title, description, item_condition, starting_price, listed_at)
--   - Users (user_id, email, first_name, last_name, name, registered_at, status, role)
--   - User_Phone (user_id, phone_no) [Weak Entity with total participation]
--   - Auction (auction_id, start_time, end_time, final_price, reserve_price, min_increment, status, highest_bid [derived], time_remaining [derived])
--   - Bid (bid_id, bid_amount, bid_time)
--   - Payment (payment_id, amount, payment_method, due_by, paid_at, status)
--   - Watchlist (user_id, auction_id, added_at) [Associative M:N Entity]
--   - Audit_Log (log_id, event_type, user_id, auction_id, summary, ip_address, created_at)
--
-- Note: Strictly compliant with college curriculum (ZERO CASCADE, ZERO UNSIGNED, ZERO ENUM).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. DATABASE INITIALIZATION
-- ----------------------------------------------------------------------------
DROP DATABASE IF EXISTS auction_society;
CREATE DATABASE auction_society;
USE auction_society;

-- ============================================================================
-- 1. EXPERIMENT-1: DDL WITH INTEGRITY CONSTRAINTS (3NF RELATIONAL SCHEMA)
-- ============================================================================

-- TABLE 1: USERS (Account & Identity Master Ledger)
-- ER Composite Attribute: name consists of (first_name, last_name)
-- Integrity Constraints: PRIMARY KEY, UNIQUE, NOT NULL, CHECK, DEFAULT
CREATE TABLE users (
    user_id INT AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL DEFAULT '',
    last_name VARCHAR(50) NOT NULL DEFAULT '',
    name VARCHAR(100) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL,
    password_hash CHAR(128) NOT NULL,
    password_salt CHAR(32) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Buyer',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('Buyer', 'Seller', 'Both', 'Admin')),
    CONSTRAINT chk_users_status CHECK (status IN ('Active', 'Blocked'))
);

-- TABLE 2: USER_PHONE (Weak Entity & Multivalued Attribute Phone Ledger)
-- ER Diagram: Weak Entity connected via identifying relationship 'has' (double diamond)
-- Key: Composite Primary Key (user_id, phone_no)
-- Integrity Constraints: PRIMARY KEY, FOREIGN KEY, NOT NULL
CREATE TABLE user_phone (
    user_id INT NOT NULL,
    phone_no VARCHAR(20) NOT NULL,
    CONSTRAINT pk_user_phone PRIMARY KEY (user_id, phone_no),
    CONSTRAINT fk_user_phone_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- TABLE 3: CATEGORY (Editorial Curation Taxonomy)
-- ER Diagram Attributes: category_id, category_name, description
-- Integrity Constraints: PRIMARY KEY, UNIQUE, NOT NULL
CREATE TABLE category (
    category_id INT AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL DEFAULT '',
    name VARCHAR(100) NOT NULL DEFAULT '',
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    CONSTRAINT pk_category PRIMARY KEY (category_id),
    CONSTRAINT uq_category_slug UNIQUE (slug)
);

-- TABLE 4: ITEM (Consigned Physical Lot Master Specification)
-- ER Diagram Attributes: item_id, title, description, item_condition, starting_price, listed_at
-- Integrity Constraints: PRIMARY KEY, FOREIGN KEY, NOT NULL, CHECK, DEFAULT
CREATE TABLE item (
    item_id INT AUTO_INCREMENT,
    seller_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    item_condition VARCHAR(50) NOT NULL DEFAULT 'Good',
    condition_type VARCHAR(50) NOT NULL DEFAULT 'Good',
    starting_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    location VARCHAR(100) NOT NULL DEFAULT 'Mumbai, Maharashtra',
    image_url TEXT,
    listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_item PRIMARY KEY (item_id),
    CONSTRAINT fk_item_seller FOREIGN KEY (seller_id) REFERENCES users(user_id),
    CONSTRAINT fk_item_category FOREIGN KEY (category_id) REFERENCES category(category_id),
    CONSTRAINT chk_item_condition CHECK (item_condition IN ('New', 'Excellent', 'Very good', 'Good', 'Fair', 'Used', 'Refurbished')),
    CONSTRAINT chk_item_starting_price CHECK (starting_price >= 0)
);

-- TABLE 5: AUCTION (Temporal Bidding Instances & Limits)
-- ER Diagram Attributes: auction_id, start_time, end_time, final_price, reserve_price, min_increment, status, highest_bid (derived), time_remaining (derived)
-- Integrity Constraints: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, DEFAULT
CREATE TABLE auction (
    auction_id INT AUTO_INCREMENT,
    item_id INT NOT NULL,
    starting_price DECIMAL(12,2) NOT NULL,
    reserve_price DECIMAL(12,2) NOT NULL,
    min_increment DECIMAL(10,2) NOT NULL DEFAULT 100.00,
    current_bid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    highest_bid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    final_price DECIMAL(12,2) NULL,
    bid_count INT NOT NULL DEFAULT 0,
    winner_id INT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    CONSTRAINT pk_auction PRIMARY KEY (auction_id),
    CONSTRAINT uq_auction_item UNIQUE (item_id),
    CONSTRAINT fk_auction_item FOREIGN KEY (item_id) REFERENCES item(item_id),
    CONSTRAINT fk_auction_winner FOREIGN KEY (winner_id) REFERENCES users(user_id),
    CONSTRAINT chk_auction_starting_price CHECK (starting_price > 0),
    CONSTRAINT chk_auction_min_increment CHECK (min_increment > 0),
    CONSTRAINT chk_auction_reserve CHECK (reserve_price >= starting_price),
    CONSTRAINT chk_auction_status CHECK (status IN ('Active', 'Closed', 'Cancelled')),
    CONSTRAINT chk_auction_time CHECK (end_time > start_time),
    CONSTRAINT chk_auction_bid_count CHECK (bid_count >= 0)
);

-- TABLE 6: BID (Atomic Offer Transactions)
-- ER Diagram Attributes: bid_id, bid_amount, bid_time
-- Integrity Constraints: PRIMARY KEY, FOREIGN KEY, NOT NULL, CHECK, DEFAULT
CREATE TABLE bid (
    bid_id INT AUTO_INCREMENT,
    auction_id INT NOT NULL,
    bidder_id INT NOT NULL,
    bid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_winning INT NOT NULL DEFAULT 0,
    ip_address VARCHAR(45) NULL,
    CONSTRAINT pk_bid PRIMARY KEY (bid_id),
    CONSTRAINT fk_bid_auction FOREIGN KEY (auction_id) REFERENCES auction(auction_id),
    CONSTRAINT fk_bid_bidder FOREIGN KEY (bidder_id) REFERENCES users(user_id),
    CONSTRAINT chk_bid_winning CHECK (is_winning IN (0, 1))
);

-- TABLE 7: PAYMENT (Settlement Ledger)
-- ER Diagram Attributes: payment_id, amount, payment_method, due_by, paid_at, status
-- Integrity Constraints: PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, DEFAULT
CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT,
    auction_id INT NOT NULL,
    payer_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Escrow / UPI',
    due_by DATETIME NULL,
    deadline_at DATETIME NULL,
    paid_at TIMESTAMP NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    transaction_ref VARCHAR(100) NULL,
    CONSTRAINT pk_payment PRIMARY KEY (payment_id),
    CONSTRAINT uq_payment_auction UNIQUE (auction_id),
    CONSTRAINT fk_payment_auction FOREIGN KEY (auction_id) REFERENCES auction(auction_id),
    CONSTRAINT fk_payment_payer FOREIGN KEY (payer_id) REFERENCES users(user_id),
    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    CONSTRAINT chk_payment_status CHECK (status IN ('Pending', 'Paid', 'Failed'))
);

-- TABLE 8: WATCHLIST (Member Preference M:N Associative Entity)
-- ER Diagram Attributes: user_id, auction_id, added_at
-- Integrity Constraints: Composite PRIMARY KEY, FOREIGN KEY, DEFAULT
CREATE TABLE watchlist (
    user_id INT NOT NULL,
    auction_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_watchlist PRIMARY KEY (user_id, auction_id),
    CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_watchlist_auction FOREIGN KEY (auction_id) REFERENCES auction(auction_id)
);

-- TABLE 9: AUDIT_LOG (Immutable Compliance Ledger)
-- Integrity Constraints: PRIMARY KEY, FOREIGN KEY, NOT NULL, CHECK, DEFAULT
CREATE TABLE audit_log (
    log_id INT AUTO_INCREMENT,
    event_type VARCHAR(50) NOT NULL,
    user_id INT NULL,
    auction_id INT NULL,
    summary TEXT NOT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_audit_log PRIMARY KEY (log_id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_audit_auction FOREIGN KEY (auction_id) REFERENCES auction(auction_id),
    CONSTRAINT chk_audit_event CHECK (event_type IN ('REGISTER', 'LOGIN', 'PLACE_BID', 'CREATE_LISTING', 'BLOCK_USER', 'UNBLOCK_USER', 'CANCEL_AUCTION', 'SETTLE_PAYMENT'))
);

-- ============================================================================
-- 2. EXPERIMENT-2: DML COMMANDS (INSERT SEED DATA)
-- ============================================================================

-- 2.1 Insert Users with Composite Attribute (first_name, last_name)
INSERT INTO users (user_id, first_name, last_name, name, email, password_hash, password_salt, role, status) VALUES
(1, 'System', 'Administrator', 'Administrator', 'admin@theauctionsociety.com', 'b6c523875062fc6182bafc7525fd617923084594499c980b37db5da1348490a60c6a5b60c2036cc12bce066af3829384e35ae8251eeafaf8b737e760929e4f6a', '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', 'Admin', 'Active'),
(2, 'Ankit', 'Anand', 'Ankit Anand (Buyer)', 'buyer@theauctionsociety.com', 'c441f3497f29e78fde1400fe5f67e5501c1b7ae6befccbeb9199e14cb55a40bbfe5bbf32f09c8e60320a7edcd0800e5e8a439d6b271d68f878f615c21ffded37', '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e', 'Buyer', 'Active'),
(3, 'Aryaman', 'Annavajhala', 'Aryaman Annavajhala (Seller)', 'seller@theauctionsociety.com', 'bc1573a6ac5216994ad390439906550b690dbb1da2c1afa3c5a02c25514d9b5da095ff3f85370b4f8cbfd40ffec58fd014de49f5172b7905c454ba44c0ab1ac1', '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f', 'Seller', 'Active'),
(4, 'Sachin', 'Tendulkar', 'Sachin (Member - Both)', 'member@theauctionsociety.com', '33dec50dc5921b0cf57e47a223edbfd705b46a7b4ec3b705a7cd2e951d7ccc556018b38f86ca9947f36abbf4e41400ddcd0ed01ebb52f5a8a2d44f7766e538f4', '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a', 'Both', 'Active'),
(5, 'Sunita', 'Sharma', 'Sunita Sharma', 'sunita@gmail.com', 'e7f00c9185f91538126fa48fb76822e4354831021d7465f012365298045ef8761ca25634f098eb562d78432675ef890123562d4578f0901243561c78ef12342d', '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', 'Buyer', 'Active'),
(6, 'Vikram', 'Malhotra', 'Vikram Malhotra', 'vikram@gmail.com', 'f8011da2960a26492370b590c87933f5465942132e85760123476309156f09872db3674501a9fc673e89543786f0901234673e568901012354672d89f023453e', '6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c', 'Buyer', 'Active');

-- 2.2 Insert Weak Entity Phone Numbers (Multivalued Attribute)
INSERT INTO user_phone (user_id, phone_no) VALUES
(1, '+91-9820011111'),
(2, '+91-9820022222'),
(2, '+91-9820022223'), -- Demonstrates multiple phone numbers for user 2
(3, '+91-9820033333'),
(4, '+91-9820044444'),
(5, '+91-9820055555'),
(6, '+91-9820066666');

-- 2.3 Insert Categories
INSERT INTO category (category_id, category_name, name, slug, description) VALUES
(1, 'Fine Watches', 'Fine Watches', 'fine-watches', 'Horological masterworks and vintage chronometers'),
(2, 'Rare Collectibles', 'Rare Collectibles', 'rare-collectibles', 'Fine art, sculptures, and rare museum-grade artifacts'),
(3, 'Vehicles', 'Vehicles', 'vehicles', 'High-performance and collector automobiles'),
(4, 'Cameras', 'Cameras', 'cameras', 'Film and digital cameras, lenses, and accessories'),
(5, 'Furniture', 'Furniture', 'furniture', 'Furniture and useful objects for the home'),
(6, 'Books', 'Books', 'books', 'Books, prints, and paper goods');

-- 2.4 Insert Consigned Items
INSERT INTO item (item_id, seller_id, category_id, title, description, item_condition, condition_type, starting_price, location, image_url) VALUES
(1, 3, 1, 'The Genesis Chronograph 1984', 'Ultra-rare perpetual calendar chronometer in platinum. Features caliber 2892 automatic movement, tritium hands, and sapphire crystal exhibition caseback.', 'Excellent', 'Excellent', 65000.00, 'Mumbai, Maharashtra', 'assets/lot_watch.jpg'),
(2, 3, 2, 'Dutch Masters Floral Still Life (c. 1675)', 'Oil on canvas by Dutch Golden Age master. Preserved in carved gilded wood frame with historical gallery provenance records.', 'Good', 'Good', 15000.00, 'Pune, Maharashtra', 'assets/lot_art.jpg'),
(3, 3, 3, 'Porsche Panamera Turbo Executive Edition', 'Twin-turbo V8 sports saloon in Agate Grey metallic. Dealer serviced with full inspection log, ceramic brakes, and sport chrono package.', 'Very good', 'Very good', 150000.00, 'Mumbai, Maharashtra', 'assets/lot_car.jpg'),
(4, 4, 4, 'Vintage 35mm rangefinder camera', 'A well-kept film camera with a bright viewfinder and smooth mechanical action. Includes body cap, strap, and original leather case.', 'Excellent', 'Excellent', 4500.00, 'Delhi, NCR', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85'),
(5, 4, 5, 'Refurbished teak study table', 'A solid teak table, carefully refurbished and ready for a new home. Small signs of age remain and are shown in photographs.', 'Good', 'Good', 3000.00, 'Jaipur, Rajasthan', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=85'),
(6, 4, 6, 'Engineering mathematics · 3 volumes', 'A complete set of three engineering mathematics textbooks. Pages are clean with a few pencil notes in margins.', 'Very good', 'Very good', 600.00, 'Mumbai, Maharashtra', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=85');

-- 2.5 Insert Auctions
INSERT INTO auction (auction_id, item_id, starting_price, reserve_price, min_increment, current_bid, highest_bid, bid_count, winner_id, status, start_time, end_time) VALUES
(1, 1, 65000.00, 85000.00, 1000.00, 72000.00, 72000.00, 3, 2, 'Active', NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 2 DAY),
(2, 2, 15000.00, 20000.00, 500.00, 18500.00, 18500.00, 3, 2, 'Active', NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 3 DAY),
(3, 3, 150000.00, 185000.00, 2000.00, 168000.00, 168000.00, 3, 5, 'Active', NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 4 DAY),
(4, 4, 4500.00, 5000.00, 100.00, 6200.00, 6200.00, 2, 6, 'Active', NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 5 DAY),
(5, 5, 3000.00, 3500.00, 100.00, 9400.00, 9400.00, 2, 2, 'Active', NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 6 DAY),
(6, 6, 600.00, 800.00, 50.00, 850.00, 850.00, 2, 2, 'Active', NOW() - INTERVAL 3 DAY, NOW() + INTERVAL 7 DAY);

-- 2.6 Insert Sample Bids
INSERT INTO bid (bid_id, auction_id, bidder_id, bid_amount, amount, bid_time, is_winning, ip_address) VALUES
(1, 1, 2, 70000.00, 70000.00, NOW() - INTERVAL 5 HOUR, 0, '127.0.0.1'),
(2, 1, 5, 71000.00, 71000.00, NOW() - INTERVAL 3 HOUR, 0, '127.0.0.1'),
(3, 1, 2, 72000.00, 72000.00, NOW() - INTERVAL 1 HOUR, 1, '127.0.0.1'),
(4, 2, 5, 17500.00, 17500.00, NOW() - INTERVAL 6 HOUR, 0, '127.0.0.1'),
(5, 2, 6, 18000.00, 18000.00, NOW() - INTERVAL 4 HOUR, 0, '127.0.0.1'),
(6, 2, 2, 18500.00, 18500.00, NOW() - INTERVAL 2 HOUR, 1, '127.0.0.1'),
(7, 3, 6, 164000.00, 164000.00, NOW() - INTERVAL 8 HOUR, 0, '127.0.0.1'),
(8, 3, 2, 166000.00, 166000.00, NOW() - INTERVAL 5 HOUR, 0, '127.0.0.1'),
(9, 3, 5, 168000.00, 168000.00, NOW() - INTERVAL 2 HOUR, 1, '127.0.0.1'),
(10, 4, 2, 6100.00, 6100.00, NOW() - INTERVAL 3 HOUR, 0, '127.0.0.1'),
(11, 4, 6, 6200.00, 6200.00, NOW() - INTERVAL 1 HOUR, 1, '127.0.0.1'),
(12, 5, 5, 9300.00, 9300.00, NOW() - INTERVAL 4 HOUR, 0, '127.0.0.1'),
(13, 5, 2, 9400.00, 9400.00, NOW() - INTERVAL 1 HOUR, 1, '127.0.0.1'),
(14, 6, 6, 800.00, 800.00, NOW() - INTERVAL 2 HOUR, 0, '127.0.0.1'),
(15, 6, 2, 850.00, 850.00, NOW() - INTERVAL 30 MINUTE, 1, '127.0.0.1');

-- 2.7 Insert Watchlist Bookmarks
INSERT INTO watchlist (user_id, auction_id) VALUES
(2, 1),
(2, 3),
(5, 1),
(6, 2);

-- 2.8 Insert Audit Log Entries
INSERT INTO audit_log (event_type, user_id, auction_id, summary, ip_address) VALUES
('CREATE_LISTING', 3, 1, 'Seller created listing #1: The Genesis Chronograph 1984', '127.0.0.1'),
('CREATE_LISTING', 3, 2, 'Seller created listing #2: Dutch Masters Floral Still Life (c. 1675)', '127.0.0.1'),
('PLACE_BID', 2, 1, 'Bid placed: Rs. 72,000.00 on auction lot #1', '127.0.0.1'),
('PLACE_BID', 2, 2, 'Bid placed: Rs. 18,500.00 on auction lot #2', '127.0.0.1');

-- 2.9 EXPERIMENT-2: TRANSACTION CONTROL LANGUAGE (TCL: COMMIT, ROLLBACK, SAVEPOINT)
-- Demonstrates atomic transaction boundaries, savepoints, partial rollback, and final commit:
START TRANSACTION;
-- TCL Step 1: Insert an offer
INSERT INTO bid (auction_id, bidder_id, bid_amount, amount, ip_address) VALUES (1, 6, 73000.00, 73000.00, '127.0.0.1');
-- TCL Step 2: Establish a safe transaction checkpoint
SAVEPOINT sp_bid_checkpoint;
-- TCL Step 3: Simulate an accidental erroneous price update
UPDATE auction SET starting_price = 1.00 WHERE auction_id = 1;
-- TCL Step 4: Undo accidental modification using SAVEPOINT
ROLLBACK TO SAVEPOINT sp_bid_checkpoint;
-- TCL Step 5: Permanently commit the valid state
COMMIT;

-- ============================================================================
-- 3. EXPERIMENT-5: DATABASE TRIGGERS
-- ============================================================================

DELIMITER $$

-- TRIGGER: trg_users_before_insert (Synchronize ER Composite Name Attributes)
CREATE TRIGGER trg_users_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF (NEW.first_name IS NULL OR NEW.first_name = '') AND (NEW.name IS NOT NULL AND NEW.name != '') THEN
        SET NEW.first_name = SUBSTRING_INDEX(NEW.name, ' ', 1);
        IF INSTR(NEW.name, ' ') > 0 THEN
            SET NEW.last_name = SUBSTRING(NEW.name, INSTR(NEW.name, ' ') + 1);
        ELSE
            SET NEW.last_name = '';
        END IF;
    ELSEIF (NEW.name IS NULL OR NEW.name = '') AND (NEW.first_name IS NOT NULL AND NEW.first_name != '') THEN
        SET NEW.name = TRIM(CONCAT(NEW.first_name, ' ', COALESCE(NEW.last_name, '')));
    END IF;
END$$

-- TRIGGER: trg_category_before_insert (Synchronize category_name & name)
CREATE TRIGGER trg_category_before_insert
BEFORE INSERT ON category
FOR EACH ROW
BEGIN
    IF (NEW.category_name IS NULL OR NEW.category_name = '') AND (NEW.name IS NOT NULL AND NEW.name != '') THEN
        SET NEW.category_name = NEW.name;
    ELSEIF (NEW.name IS NULL OR NEW.name = '') AND (NEW.category_name IS NOT NULL AND NEW.category_name != '') THEN
        SET NEW.name = NEW.category_name;
    END IF;
END$$

-- TRIGGER: trg_item_before_insert (Synchronize item_condition & condition_type)
CREATE TRIGGER trg_item_before_insert
BEFORE INSERT ON item
FOR EACH ROW
BEGIN
    IF (NEW.item_condition IS NULL OR NEW.item_condition = '') AND (NEW.condition_type IS NOT NULL AND NEW.condition_type != '') THEN
        SET NEW.item_condition = NEW.condition_type;
    ELSEIF (NEW.condition_type IS NULL OR NEW.condition_type = '') AND (NEW.item_condition IS NOT NULL AND NEW.item_condition != '') THEN
        SET NEW.condition_type = NEW.item_condition;
    END IF;
END$$

-- TRIGGER 1: trg_bid_validate (BEFORE INSERT ON bid)
-- Enforces business rules directly in database engine:
-- 1. Auction must be Active and not expired.
-- 2. Seller cannot bid on their own consigned item.
-- 3. New bid must satisfy minimum increment threshold.
CREATE TRIGGER trg_bid_validate
BEFORE INSERT ON bid
FOR EACH ROW
BEGIN
    DECLARE v_current_bid DECIMAL(12,2);
    DECLARE v_min_increment DECIMAL(10,2);
    DECLARE v_status VARCHAR(20);
    DECLARE v_seller_id INT;
    DECLARE v_end_time DATETIME;

    -- Synchronize bid_amount and amount columns
    IF NEW.bid_amount IS NULL OR NEW.bid_amount = 0 THEN
        SET NEW.bid_amount = NEW.amount;
    ELSEIF NEW.amount IS NULL OR NEW.amount = 0 THEN
        SET NEW.amount = NEW.bid_amount;
    END IF;

    -- Fetch current auction parameters and seller ID
    SELECT a.current_bid, a.min_increment, a.status, a.end_time, i.seller_id
    INTO v_current_bid, v_min_increment, v_status, v_end_time, v_seller_id
    FROM auction a
    INNER JOIN item i ON a.item_id = i.item_id
    WHERE a.auction_id = NEW.auction_id;

    -- Exp-3 Comparison & Logical Operator: Auction must be Active and not expired
    IF v_status != 'Active' OR NOW() > v_end_time THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bidding Error: Auction is closed or expired.';
    END IF;

    -- Exp-3 Comparison Operator: Seller self-bidding prevention
    IF NEW.bidder_id = v_seller_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bidding Error: Sellers cannot bid on their own consigned items.';
    END IF;

    -- Exp-3 Arithmetic & Comparison Operator: Enforce minimum increment threshold
    IF NEW.bid_amount < (v_current_bid + v_min_increment) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bidding Error: Bid does not meet the minimum increment threshold.';
    END IF;

    -- Designate incoming offer as the active winning bid
    SET NEW.is_winning = 1;
END$$

-- TRIGGER 2: trg_bid_audit (AFTER INSERT ON bid)
-- Synchronizes database state using Exp-2 DML commands:
-- 1. Atomically updates auction current high bid, highest_bid, winner_id, and increments bid counter.
-- 2. Inserts an immutable audit record into audit_log.
CREATE TRIGGER trg_bid_audit
AFTER INSERT ON bid
FOR EACH ROW
BEGIN
    -- Exp-2 DML: Atomically update auction high bid, designate winner, and increment bid counter
    UPDATE auction
    SET current_bid = NEW.bid_amount,
        highest_bid = NEW.bid_amount,
        winner_id = NEW.bidder_id,
        bid_count = bid_count + 1
    WHERE auction_id = NEW.auction_id;

    -- Exp-2 DML: Record audit trail entry
    INSERT INTO audit_log (event_type, user_id, auction_id, summary, ip_address)
    VALUES (
        'PLACE_BID',
        NEW.bidder_id,
        NEW.auction_id,
        CONCAT('Bid placed: Rs. ', NEW.bid_amount, ' on auction lot #', NEW.auction_id),
        NEW.ip_address
    );
END$$

DELIMITER ;

-- ============================================================================
-- 4. EXPERIMENT-5: VIEWS (COMBINING EXP-4 JOINS & AGGREGATE FUNCTIONS)
-- ============================================================================

-- VIEW 1: active_auctions_view
-- Demonstrates Exp-4 Multi-Table INNER JOIN (Equi-Join) across 4 tables:
-- Computes ER Diagram Derived Attribute: time_remaining = TIMESTAMPDIFF(SECOND, NOW(), a.end_time)
CREATE OR REPLACE VIEW active_auctions_view AS
SELECT 
    a.auction_id,
    i.item_id,
    i.title,
    c.category_name,
    c.slug AS category_slug,
    i.item_condition,
    i.condition_type,
    i.starting_price,
    i.location,
    i.image_url,
    i.description,
    i.listed_at,
    a.current_bid,
    a.highest_bid,
    a.min_increment,
    a.bid_count,
    a.start_time,
    a.end_time,
    TIMESTAMPDIFF(SECOND, NOW(), a.end_time) AS time_remaining,
    u.name AS seller_name,
    u.user_id AS seller_id
FROM auction a
INNER JOIN item i ON a.item_id = i.item_id
INNER JOIN category c ON i.category_id = c.category_id
INNER JOIN users u ON i.seller_id = u.user_id
WHERE a.status = 'Active' AND a.end_time > NOW();

-- VIEW 2: user_bidding_activity_view
-- Demonstrates Exp-4 LEFT OUTER JOIN, Aggregates (COUNT, SUM, MAX), GROUP BY & HAVING:
CREATE OR REPLACE VIEW user_bidding_activity_view AS
SELECT 
    u.user_id,
    u.name AS bidder_name,
    u.first_name,
    u.last_name,
    u.email,
    u.role,
    u.status,
    COUNT(b.bid_id) AS total_bids_submitted,
    COUNT(DISTINCT b.auction_id) AS auctions_participated,
    COALESCE(MAX(b.bid_amount), 0.00) AS highest_bid_placed,
    COUNT(DISTINCT CASE WHEN a.winner_id = u.user_id AND a.status = 'Active' THEN a.auction_id END) AS active_winning_lots,
    COALESCE(SUM(DISTINCT CASE WHEN a.winner_id = u.user_id AND a.status = 'Active' THEN a.current_bid END), 0.00) AS total_winning_exposure
FROM users u
LEFT JOIN bid b ON u.user_id = b.bidder_id
LEFT JOIN auction a ON u.user_id = a.winner_id
GROUP BY u.user_id, u.name, u.first_name, u.last_name, u.email, u.role, u.status;

-- VIEW 3: category_performance_view
-- Demonstrates Exp-4 Multiple LEFT JOINs, AVG(), COUNT(), MIN(), MAX() with GROUP BY:
CREATE OR REPLACE VIEW category_performance_view AS
SELECT 
    c.category_id,
    c.category_name,
    COUNT(DISTINCT i.item_id) AS total_consignments,
    COUNT(DISTINCT a.auction_id) AS total_auctions_listed,
    COALESCE(AVG(a.current_bid), 0.00) AS avg_current_bid,
    COALESCE(MIN(a.starting_price), 0.00) AS min_starting_price,
    COALESCE(MAX(a.current_bid), 0.00) AS max_current_bid
FROM category c
LEFT JOIN item i ON c.category_id = i.category_id
LEFT JOIN auction a ON i.item_id = a.item_id
GROUP BY c.category_id, c.category_name;

-- ============================================================================
-- 5. EXPERIMENT-3 & EXPERIMENT-4: SHOWCASE QUERIES FOR VIVA & EVALUATION
-- ============================================================================

-- Query 5.1: Exp-3 Arithmetic Operator (Compute 5% Buyer Premium on Winning Bids)
SELECT 
    bid_id, 
    bid_amount AS hammer_price,
    bid_amount * 0.05 AS buyer_premium_5_percent,
    bid_amount + (bid_amount * 0.05) AS total_payable
FROM bid
WHERE is_winning = 1;

-- Query 5.2: Exp-3 Comparison & Logical Operators (BETWEEN, IN, AND)
SELECT auction_id, starting_price, current_bid, highest_bid, status
FROM auction
WHERE current_bid BETWEEN 5000.00 AND 100000.00
  AND status IN ('Active');

-- Query 5.3: Exp-4 Weak Entity Joins (Fetch User Profiles and All Registered Phones)
SELECT 
    u.user_id,
    u.name,
    u.role,
    p.phone_no
FROM users u
INNER JOIN user_phone p ON u.user_id = p.user_id;

-- Query 5.4: Exp-4 Nested Subquery with Aggregate AVG()
-- Find all active lots whose current bid exceeds catalog average
SELECT a.auction_id, i.title, a.current_bid, a.highest_bid
FROM auction a
INNER JOIN item i ON a.item_id = i.item_id
WHERE a.status = 'Active' 
  AND a.current_bid > (SELECT AVG(current_bid) FROM auction WHERE status = 'Active');

-- Query 5.5: Exp-4 Nested Subquery with NOT IN (Dormant Member Discovery)
-- Find all registered buyers who have never placed a bid
SELECT user_id, name, email, role
FROM users
WHERE role IN ('Buyer', 'Both')
  AND user_id NOT IN (SELECT DISTINCT bidder_id FROM bid);

-- Query 5.6: Exp-4 Equi-Join vs Natural Join Demonstration
-- Equi-Join: explicit equality on foreign key
SELECT item.title, category.category_name, item.location
FROM item
INNER JOIN category ON item.category_id = category.category_id;

-- Natural Join: implicit equality on identically named column (category_id)
SELECT item.title, category.category_name, item.location
FROM item
NATURAL JOIN category;

-- Query 5.7: Exp-4 GROUP BY with HAVING Clause
-- Find bidders who placed more than 2 bids
SELECT 
    b.bidder_id, 
    u.name, 
    COUNT(b.bid_id) AS bids_placed, 
    MAX(b.bid_amount) AS highest_bid
FROM bid b
INNER JOIN users u ON b.bidder_id = u.user_id
GROUP BY b.bidder_id, u.name
HAVING COUNT(b.bid_id) >= 2;
