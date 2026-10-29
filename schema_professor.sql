-- Online Auction System - professor-aligned MySQL schema
-- Safe setup: creates a NEW database named auction_society_professor.
-- It does NOT DROP any database or table.
-- Target: MySQL 8.0.16+ (CHECK constraints enforced), InnoDB.
-- Seeded sample users have NULL password fields and are for database demonstrations only.
-- This schema is the active database contract for the Phase 3 MySQL-first server.js.
-- Run once on a fresh database connection; do not rerun to reset existing project data.

CREATE DATABASE IF NOT EXISTS auction_society_professor
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE auction_society_professor;

-- 1. CATEGORY
CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    CONSTRAINT uq_category_name UNIQUE (category_name)
) ENGINE=InnoDB;

-- 2. USERS
-- password_hash/password_salt are application-support attributes, not in the abstract's entity list.
-- Imported demo rows intentionally leave these NULL; newly registered users must have hashes.
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Buyer',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    password_hash CHAR(128) NULL,
    password_salt CHAR(32) NULL,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('Buyer', 'Seller', 'Both', 'Admin')),
    CONSTRAINT chk_users_status CHECK (status IN ('Active', 'Blocked'))
) ENGINE=InnoDB;

-- 3. USER_PHONE (multi-valued user phone attribute)
CREATE TABLE user_phone (
    user_id INT NOT NULL,
    phone_no VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, phone_no),
    CONSTRAINT fk_user_phone_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB;

-- 4. ITEM
CREATE TABLE item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    item_condition VARCHAR(50) NOT NULL,
    starting_price DECIMAL(12,2) NOT NULL,
    listed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Extra presentation fields used by the website; they are not required by the abstract.
    location VARCHAR(120) NULL,
    image_url TEXT NULL,
    CONSTRAINT chk_item_starting_price CHECK (starting_price > 0),
    CONSTRAINT chk_item_condition CHECK (item_condition IN ('New', 'Excellent', 'Very good', 'Good', 'Fair', 'Used', 'Refurbished')),
    CONSTRAINT fk_item_seller FOREIGN KEY (seller_id)
        REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_item_category FOREIGN KEY (category_id)
        REFERENCES category(category_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

-- 5. AUCTION
CREATE TABLE auction (
    auction_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    reserve_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    min_increment DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
    winner_id INT NULL,
    final_price DECIMAL(12,2) NULL,
    CONSTRAINT chk_auction_reserve CHECK (reserve_price >= 0),
    CONSTRAINT chk_auction_increment CHECK (min_increment > 0),
    CONSTRAINT chk_auction_time CHECK (end_time > start_time),
    CONSTRAINT chk_auction_status CHECK (status IN ('Scheduled', 'Active', 'Closed', 'Cancelled')),
    CONSTRAINT chk_auction_final_price CHECK (final_price IS NULL OR final_price >= 0),
    CONSTRAINT fk_auction_item FOREIGN KEY (item_id)
        REFERENCES item(item_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_auction_winner FOREIGN KEY (winner_id)
        REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

-- 6. BID
CREATE TABLE bid (
    bid_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    bidder_id INT NOT NULL,
    bid_amount DECIMAL(12,2) NOT NULL,
    bid_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    CONSTRAINT chk_bid_amount CHECK (bid_amount > 0),
    CONSTRAINT fk_bid_auction FOREIGN KEY (auction_id)
        REFERENCES auction(auction_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_bid_bidder FOREIGN KEY (bidder_id)
        REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_bid_auction_amount_time (auction_id, bid_amount DESC, bid_time ASC)
) ENGINE=InnoDB;

-- 7. PAYMENT (one payment record per auction)
CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    payer_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(30) NULL,
    due_by DATETIME NOT NULL,
    paid_at DATETIME NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    CONSTRAINT uq_payment_auction UNIQUE (auction_id),
    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    CONSTRAINT chk_payment_status CHECK (status IN ('Pending', 'Paid', 'Overdue')),
    CONSTRAINT fk_payment_auction FOREIGN KEY (auction_id)
        REFERENCES auction(auction_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_payment_payer FOREIGN KEY (payer_id)
        REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

-- 8. WATCHLIST (M:N junction table)
CREATE TABLE watchlist (
    user_id INT NOT NULL,
    auction_id INT NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, auction_id),
    CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_watchlist_auction FOREIGN KEY (auction_id)
        REFERENCES auction(auction_id) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB;

-- 9. AUDIT_LOG
CREATE TABLE audit_log (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    auction_id INT NULL,
    event_type VARCHAR(50) NOT NULL,
    summary VARCHAR(1000) NOT NULL,
    event_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_audit_auction FOREIGN KEY (auction_id)
        REFERENCES auction(auction_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_audit_event_time (event_type, event_time)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- SAMPLE DATA FROM THE PROJECT ABSTRACT
-- Dates are kept as documented in the abstract so the professor can compare them.
-- Inserted before triggers, so historic sample bids are not revalidated as new bids.
-- ---------------------------------------------------------------------------
INSERT INTO category (category_id, category_name, description) VALUES
(1, 'Electronics', 'Gadgets and appliances'),
(2, 'Books', 'Textbooks and novels'),
(3, 'Collectibles', 'Coins, stamps and antiques'),
(4, 'Furniture', 'Tables, chairs and storage');

INSERT INTO users (user_id, first_name, last_name, email, role, status, registered_at) VALUES
(1, 'Rohan', 'Mehta', 'rohan.mehta@example.com', 'Seller', 'Active', '2026-08-01 10:15:00'),
(2, 'Priya', 'Nair', 'priya.nair@example.com', 'Seller', 'Active', '2026-08-02 11:30:00'),
(3, 'Aditi', 'Rao', 'aditi.rao@example.com', 'Buyer', 'Active', '2026-08-05 09:20:00'),
(4, 'Sameer', 'Khan', 'sameer.khan@example.com', 'Buyer', 'Active', '2026-08-06 14:45:00'),
(5, 'Neha', 'Joshi', 'neha.joshi@example.com', 'Both', 'Active', '2026-08-07 16:10:00'),
(6, 'Vikram', 'Singh', 'vikram.singh@example.com', 'Buyer', 'Blocked', '2026-08-09 18:00:00'),
(7, 'Anjali', 'Desai', 'anjali.desai@example.com', 'Admin', 'Active', '2026-08-10 12:00:00');

INSERT INTO user_phone (user_id, phone_no) VALUES
(1, '9820011111'),
(1, '9820011112'),
(3, '9820033333'),
(4, '9820044444'),
(5, '9820055555');

INSERT INTO item (item_id, seller_id, category_id, title, description, item_condition, starting_price, listed_at, location) VALUES
(1, 2, 1, 'Used Gaming Console', 'Console with two controllers', 'Used', 8000.00, '2026-09-18 10:00:00', 'Mumbai'),
(2, 1, 1, 'Vintage Film Camera', '35mm film camera, working', 'Used', 4500.00, '2026-09-20 10:00:00', 'Mumbai'),
(3, 2, 2, 'Engineering Maths', 'Set of 3 textbooks', 'Used', 600.00, '2026-09-22 12:00:00', 'Mumbai'),
(4, 1, 3, 'Old Indian Coin Set', 'Collection of 25 coins', 'Used', 2500.00, '2026-09-25 09:30:00', 'Mumbai'),
(5, 5, 4, 'Wooden Study Table', 'Refurbished teak table', 'Refurbished', 3000.00, '2026-09-28 15:00:00', 'Mumbai'),
(6, 2, 1, 'Wireless Headphones', 'Bluetooth, sealed box', 'New', 1500.00, '2026-10-01 11:00:00', 'Mumbai');

INSERT INTO auction (auction_id, item_id, start_time, end_time, reserve_price, min_increment, status, winner_id, final_price) VALUES
(1, 2, '2026-10-01 10:00:00', '2026-10-08 10:00:00', 5000.00, 100.00, 'Closed', 3, 6200.00),
(2, 1, '2026-10-02 10:00:00', '2026-10-09 10:00:00', 9000.00, 200.00, 'Closed', 5, 9400.00),
(3, 3, '2026-10-05 12:00:00', '2026-10-12 12:00:00', 800.00, 50.00, 'Closed', NULL, NULL),
(4, 4, '2026-10-14 09:00:00', '2026-10-18 21:00:00', 3000.00, 100.00, 'Active', NULL, NULL),
(5, 5, '2026-10-15 10:00:00', '2026-10-20 10:00:00', 3500.00, 100.00, 'Active', NULL, NULL),
(6, 6, '2026-10-25 10:00:00', '2026-10-30 10:00:00', 1800.00, 50.00, 'Scheduled', NULL, NULL);

INSERT INTO bid (bid_id, auction_id, bidder_id, bid_amount, bid_time) VALUES
(1, 1, 4, 4600.00, '2026-10-02 11:20:00'),
(2, 2, 3, 8200.00, '2026-10-03 14:00:00'),
(3, 1, 3, 5000.00, '2026-10-04 16:05:00'),
(4, 2, 4, 8800.00, '2026-10-05 11:15:00'),
(5, 3, 4, 650.00, '2026-10-06 10:00:00'),
(6, 1, 4, 5600.00, '2026-10-06 18:30:00'),
(7, 1, 3, 6200.00, '2026-10-07 20:45:00'),
(8, 2, 5, 9400.00, '2026-10-08 20:00:00'),
(9, 3, 5, 700.00, '2026-10-09 19:10:00'),
(10, 4, 3, 2600.00, '2026-10-14 13:00:00'),
(11, 5, 3, 3100.00, '2026-10-15 12:00:00'),
(12, 4, 4, 2800.00, '2026-10-15 17:30:00');

INSERT INTO payment (payment_id, auction_id, payer_id, amount, payment_method, due_by, paid_at, status) VALUES
(1, 1, 3, 6200.00, 'UPI', '2026-10-10 10:00:00', '2026-10-09 15:20:00', 'Paid'),
(2, 2, 5, 9400.00, NULL, '2026-10-11 10:00:00', NULL, 'Overdue');

INSERT INTO watchlist (user_id, auction_id, added_at) VALUES
(3, 4, '2026-10-14 09:30:00'),
(5, 4, '2026-10-14 11:00:00'),
(4, 5, '2026-10-15 10:30:00'),
(4, 6, '2026-10-15 20:00:00');

INSERT INTO audit_log (user_id, auction_id, event_type, summary, event_time) VALUES
(1, 1, 'CREATE_LISTING', 'Seller created listing #1: Vintage Film Camera', '2026-09-20 10:00:00'),
(2, 2, 'CREATE_LISTING', 'Seller created listing #2: Used Gaming Console', '2026-09-18 10:00:00'),
(3, 1, 'PLACE_BID', 'Bid placed: 6200.00 on auction #1', '2026-10-07 20:45:00'),
(5, 2, 'PLACE_BID', 'Bid placed: 9400.00 on auction #2', '2026-10-08 20:00:00');

-- ---------------------------------------------------------------------------
-- TRIGGERS AND EVENT
-- ---------------------------------------------------------------------------
DELIMITER $$

CREATE TRIGGER trg_bid_validate
BEFORE INSERT ON bid
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20) DEFAULT NULL;
    DECLARE v_start_time DATETIME DEFAULT NULL;
    DECLARE v_end_time DATETIME DEFAULT NULL;
    DECLARE v_min_increment DECIMAL(12,2) DEFAULT NULL;
    DECLARE v_starting_price DECIMAL(12,2) DEFAULT NULL;
    DECLARE v_seller_id INT DEFAULT NULL;
    DECLARE v_bidder_status VARCHAR(20) DEFAULT NULL;
    DECLARE v_bidder_role VARCHAR(20) DEFAULT NULL;
    DECLARE v_highest_bid DECIMAL(12,2) DEFAULT NULL;

    SELECT a.status, a.start_time, a.end_time, a.min_increment, i.starting_price, i.seller_id
      INTO v_status, v_start_time, v_end_time, v_min_increment, v_starting_price, v_seller_id
    FROM auction a
    JOIN item i ON i.item_id = a.item_id
    WHERE a.auction_id = NEW.auction_id;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bid rejected: auction does not exist.';
    END IF;

    IF v_status <> 'Active' OR NOW() < v_start_time OR NOW() > v_end_time THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bid rejected: auction is not active or is outside its time window.';
    END IF;

    SELECT status, role INTO v_bidder_status, v_bidder_role
    FROM users WHERE user_id = NEW.bidder_id;

    IF v_bidder_status IS NULL OR v_bidder_status <> 'Active' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bid rejected: bidder account is not active.';
    END IF;

    IF v_bidder_role NOT IN ('Buyer', 'Both') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bid rejected: only Buyer or Both accounts may bid.';
    END IF;

    IF NEW.bidder_id = v_seller_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bid rejected: sellers cannot bid on their own item.';
    END IF;

    SELECT MAX(bid_amount) INTO v_highest_bid
    FROM bid WHERE auction_id = NEW.auction_id;

    IF NEW.bid_amount < (COALESCE(v_highest_bid, v_starting_price) + v_min_increment) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bid rejected: amount must meet the highest bid plus minimum increment.';
    END IF;
END$$

CREATE TRIGGER trg_bid_audit
AFTER INSERT ON bid
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, auction_id, event_type, summary, ip_address)
    VALUES (NEW.bidder_id, NEW.auction_id, 'PLACE_BID',
            CONCAT('Bid placed: ', FORMAT(NEW.bid_amount, 2), ' on auction #', NEW.auction_id),
            NEW.ip_address);
END$$

CREATE TRIGGER trg_auction_close_payment
AFTER UPDATE ON auction
FOR EACH ROW
BEGIN
    IF OLD.status <> 'Closed' AND NEW.status = 'Closed' THEN
        INSERT INTO audit_log (user_id, auction_id, event_type, summary)
        VALUES (NULL, NEW.auction_id, 'AUCTION_CLOSED', CONCAT('Auction #', NEW.auction_id, ' closed.'));

        IF NEW.winner_id IS NOT NULL AND NEW.final_price IS NOT NULL THEN
            INSERT INTO payment (auction_id, payer_id, amount, payment_method, due_by, status)
            VALUES (NEW.auction_id, NEW.winner_id, NEW.final_price, NULL,
                    DATE_ADD(NOW(), INTERVAL 48 HOUR), 'Pending');
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_payment_audit
AFTER UPDATE ON payment
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status AND NEW.status = 'Overdue' THEN
        INSERT INTO audit_log (user_id, auction_id, event_type, summary)
        VALUES (NULL, NEW.auction_id, 'PAYMENT_OVERDUE', CONCAT('Payment overdue for auction #', NEW.auction_id));
    ELSEIF OLD.status <> NEW.status AND NEW.status = 'Paid' THEN
        INSERT INTO audit_log (user_id, auction_id, event_type, summary)
        VALUES (NEW.payer_id, NEW.auction_id, 'SETTLE_PAYMENT', CONCAT('Payment settled for auction #', NEW.auction_id));
    END IF;
END$$

CREATE EVENT IF NOT EXISTS ev_auction_lifecycle
ON SCHEDULE EVERY 1 MINUTE
DO
BEGIN
    -- Activate scheduled auctions whose start time has arrived and whose end time is still ahead.
    UPDATE auction
       SET status = 'Active'
     WHERE status = 'Scheduled'
       AND start_time <= NOW()
       AND end_time > NOW();

    -- Close expired auctions, set the highest qualifying bid as winner, and set final_price.
    -- The auction AFTER UPDATE trigger creates the 48-hour payment when there is a qualifying winner.
    UPDATE auction a
       SET winner_id = (
               SELECT b.bidder_id
               FROM bid b
               WHERE b.auction_id = a.auction_id
                 AND b.bid_amount >= a.reserve_price
               ORDER BY b.bid_amount DESC, b.bid_time ASC, b.bid_id ASC
               LIMIT 1
           ),
           final_price = (
               SELECT b.bid_amount
               FROM bid b
               WHERE b.auction_id = a.auction_id
                 AND b.bid_amount >= a.reserve_price
               ORDER BY b.bid_amount DESC, b.bid_time ASC, b.bid_id ASC
               LIMIT 1
           ),
           status = 'Closed'
     WHERE a.status IN ('Active', 'Scheduled')
       AND a.end_time <= NOW();

    -- Persist overdue payment status. trg_payment_audit records each change.
    UPDATE payment
       SET status = 'Overdue'
     WHERE status = 'Pending'
       AND due_by < NOW();
END$$

DELIMITER ;

-- ---------------------------------------------------------------------------
-- VIEWS / DEMONSTRATION REPORTING
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW active_auctions_view AS
SELECT a.auction_id,
       i.item_id,
       i.title,
       c.category_name,
       i.item_condition,
       i.starting_price,
       COALESCE(b.current_bid, i.starting_price) AS current_bid,
       COALESCE(b.bid_count, 0) AS bid_count,
       a.min_increment,
       a.start_time,
       a.end_time,
       CONCAT(u.first_name, ' ', u.last_name) AS seller_name,
       u.user_id AS seller_id,
       i.location,
       i.image_url,
       i.description
FROM auction a
JOIN item i ON i.item_id = a.item_id
JOIN category c ON c.category_id = i.category_id
JOIN users u ON u.user_id = i.seller_id
LEFT JOIN (
    SELECT auction_id, MAX(bid_amount) AS current_bid, COUNT(*) AS bid_count
    FROM bid GROUP BY auction_id
) b ON b.auction_id = a.auction_id
WHERE a.status = 'Active' AND a.start_time <= NOW() AND a.end_time > NOW();

CREATE OR REPLACE VIEW user_bidding_activity_view AS
SELECT u.user_id,
       CONCAT(u.first_name, ' ', u.last_name) AS bidder_name,
       u.email,
       u.role,
       u.status,
       COALESCE(b.total_bids, 0) AS total_bids_submitted,
       COALESCE(b.auctions_participated, 0) AS auctions_participated,
       COALESCE(b.highest_bid_placed, 0.00) AS highest_bid_placed,
       COALESCE(w.won_auctions, 0) AS won_auctions
FROM users u
LEFT JOIN (
    SELECT bidder_id,
           COUNT(*) AS total_bids,
           COUNT(DISTINCT auction_id) AS auctions_participated,
           MAX(bid_amount) AS highest_bid_placed
    FROM bid GROUP BY bidder_id
) b ON b.bidder_id = u.user_id
LEFT JOIN (
    SELECT winner_id, COUNT(*) AS won_auctions
    FROM auction WHERE status = 'Closed' AND winner_id IS NOT NULL
    GROUP BY winner_id
) w ON w.winner_id = u.user_id;

CREATE OR REPLACE VIEW category_performance_view AS
SELECT c.category_id,
       c.category_name,
       COUNT(DISTINCT i.item_id) AS total_items,
       COUNT(DISTINCT a.auction_id) AS total_auctions,
       COALESCE(AVG(a.final_price), 0.00) AS average_final_price,
       COALESCE(MIN(i.starting_price), 0.00) AS min_starting_price,
       COALESCE(MAX(i.starting_price), 0.00) AS max_starting_price
FROM category c
LEFT JOIN item i ON i.category_id = c.category_id
LEFT JOIN auction a ON a.item_id = i.item_id
GROUP BY c.category_id, c.category_name;

CREATE OR REPLACE VIEW auction_payment_summary_view AS
SELECT a.auction_id,
       i.title,
       a.status AS auction_status,
       a.final_price,
       a.winner_id,
       p.payment_id,
       p.amount AS payment_amount,
       p.payment_method,
       p.due_by,
       p.paid_at,
       p.status AS payment_status
FROM auction a
JOIN item i ON i.item_id = a.item_id
LEFT JOIN payment p ON p.auction_id = a.auction_id;
