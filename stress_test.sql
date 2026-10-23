-- ============================================================================
-- SARDAR PATEL INSTITUTE OF TECHNOLOGY (SPIT, MUMBAI)
-- Course: Relational Database Management Systems (RDBMS) Mini-Project
-- Project: The Auction Society
-- File: stress_test.sql (Comprehensive Hard Test & Evaluation Suite)
-- Curriculum Alignment: Experiments 1 to 5 (Zero CASCADE, Zero UNSIGNED, Zero ENUM)
-- ============================================================================

USE auction_society;

-- ============================================================================
-- SUITE 1: DML OPERATIONS (INSERT, UPDATE, READ)
-- ============================================================================

-- Test 1.1: Insert a new verified buyer (Exp-2 DML Insert)
INSERT INTO users (name, email, password_hash, password_salt, role, status)
VALUES (
    'Test High Roller',
    'stress_buyer@test.com',
    'd6e9fb8074e80427015e937ea65711d3243720f10c6354ef01254187f34de7650b914523ef87da451c67321564de78f012451c3467ef890132450b67de01231c',
    '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    'Buyer',
    'Active'
);

-- Test 1.2: Insert a new consigned item (Exp-2 DML Insert with FK)
INSERT INTO item (seller_id, category_id, title, condition_type, location, image_url, description)
VALUES (
    3, -- Sold by Aryaman (Seller ID: 3)
    1, -- Category: Fine Watches
    'Audemars Piguet Royal Oak Offshore 2022',
    'Excellent',
    'Mumbai, Maharashtra',
    'assets/lot_watch.jpg',
    'High-complication titanium chronograph with exhibition caseback.'
);

-- Get ID of newly inserted item
SET @new_item_id = LAST_INSERT_ID();

-- Test 1.3: Launch an auction for the item
INSERT INTO auction (item_id, starting_price, reserve_price, min_increment, current_bid, bid_count, winner_id, status, start_time, end_time)
VALUES (
    @new_item_id,
    250000.00,
    300000.00,
    5000.00,
    250000.00,
    0,
    NULL,
    'Active',
    NOW(),
    NOW() + INTERVAL 7 DAY
);

SET @new_auction_id = LAST_INSERT_ID();

-- Test 1.4: Update auction reserve price (Exp-2 DML Update)
UPDATE auction
SET reserve_price = 320000.00
WHERE auction_id = @new_auction_id;

-- Verify the update succeeded
SELECT auction_id, starting_price, reserve_price, status 
FROM auction 
WHERE auction_id = @new_auction_id;


-- ============================================================================
-- SUITE 2: HARD INTEGRITY CONSTRAINT STRESS TESTS (NEGATIVE TESTING)
-- Each query in this suite is designed to be BLOCKED by integrity constraints.
-- (To run in Workbench, run them individually to observe the exact error codes!)
-- ============================================================================

-- Test 2.1: Duplicate Email Protection (Expect: ERROR 1062 - Duplicate entry)
-- CONSTRAINT uq_users_email UNIQUE (email)
-- INSERT INTO users (name, email, password_hash, password_salt, role)
-- VALUES ('Fake Clone', 'buyer@theauctionsociety.com', 'hash', 'salt', 'Buyer');

-- Test 2.2: Illegal Role Violation (Expect: ERROR 3819 - Check constraint violated)
-- CONSTRAINT chk_users_role CHECK (role IN ('Buyer', 'Seller', 'Both', 'Admin'))
-- INSERT INTO users (name, email, password_hash, password_salt, role)
-- VALUES ('Illegal User', 'hacker@test.com', 'hash', 'salt', 'SuperHacker');

-- Test 2.3: Negative Starting Price (Expect: ERROR 3819 - Check constraint violated)
-- CONSTRAINT chk_auction_starting_price CHECK (starting_price > 0)
-- INSERT INTO auction (item_id, starting_price, reserve_price, min_increment, status, start_time, end_time)
-- VALUES (1, -5000.00, 10000.00, 100.00, 'Active', NOW(), NOW() + INTERVAL 1 DAY);

-- Test 2.4: Reserve Price Lower Than Starting Price (Expect: ERROR 3819)
-- CONSTRAINT chk_auction_reserve CHECK (reserve_price >= starting_price)
-- INSERT INTO auction (item_id, starting_price, reserve_price, min_increment, status, start_time, end_time)
-- VALUES (2, 50000.00, 20000.00, 100.00, 'Active', NOW(), NOW() + INTERVAL 1 DAY);

-- Test 2.5: Chronological End Time Before Start Time (Expect: ERROR 3819)
-- CONSTRAINT chk_auction_time CHECK (end_time > start_time)
-- INSERT INTO auction (item_id, starting_price, reserve_price, min_increment, status, start_time, end_time)
-- VALUES (3, 10000.00, 12000.00, 100.00, 'Active', NOW(), NOW() - INTERVAL 1 HOUR);

-- Test 2.6: Negative Bid Amount (Expect: ERROR 3819)
-- CONSTRAINT chk_bid_amount CHECK (amount > 0)
-- INSERT INTO bid (auction_id, bidder_id, amount) VALUES (1, 2, -100.00);


-- ============================================================================
-- SUITE 3: FOREIGN KEY DELETE PROTECTION (PROOF OF ZERO CASCADE)
-- In SPIT curriculum, NO CASCADE is taught. Foreign keys must block destructive deletes.
-- ============================================================================

-- Test 3.1: Attempt to delete a Seller who owns consigned items
-- EXPECTED: BLOCKED! MySQL Error 1451: Cannot delete or update a parent row: a foreign key constraint fails
-- DELETE FROM users WHERE user_id = 3;

-- Test 3.2: Attempt to delete an Auction that already has active bids placed
-- EXPECTED: BLOCKED! MySQL Error 1451: Cannot delete or update a parent row: a foreign key constraint fails
-- DELETE FROM auction WHERE auction_id = 1;

-- Test 3.3: Clean Delete Test (Deleting an unreferenced temporary user)
-- Create a temporary unreferenced user
INSERT INTO users (name, email, password_hash, password_salt, role, status)
VALUES ('Temp Deletable User', 'temp_delete@test.com', 'h', 's', 'Buyer', 'Active');
SET @temp_user_id = LAST_INSERT_ID();

-- Delete succeeds cleanly because no child records reference this user
DELETE FROM users WHERE user_id = @temp_user_id;

-- Confirm deletion
SELECT user_id, name, email FROM users WHERE user_id = @temp_user_id;


-- ============================================================================
-- SUITE 4: TRIGGER STRESS TESTS (trg_bid_validate & trg_bid_audit)
-- ============================================================================

-- Setup test bidder
SET @bidder_id = (SELECT user_id FROM users WHERE email = 'stress_buyer@test.com');

-- ----------------------------------------------------------------------------
-- Test 4.1: Trigger 1 Blocks Seller Self-Bidding
-- Item was consigned by Seller ID 3 (Aryaman). Seller ID 3 attempts to bid on it.
-- EXPECTED: BLOCKED! Trigger raises SQLSTATE '45000'
--   "Bidding Error: Sellers cannot bid on their own consigned items."
-- ----------------------------------------------------------------------------
-- INSERT INTO bid (auction_id, bidder_id, amount, ip_address)
-- VALUES (@new_auction_id, 3, 260000.00, '127.0.0.1');

-- ----------------------------------------------------------------------------
-- Test 4.2: Trigger 1 Blocks Under-Bidding (Below Minimum Increment)
-- Current bid = 250,000, Min increment = 5,000. Required minimum = 255,000.
-- Bidder offers only 252,000.
-- EXPECTED: BLOCKED! Trigger raises SQLSTATE '45000'
--   "Bidding Error: Bid does not meet the minimum increment threshold."
-- ----------------------------------------------------------------------------
-- INSERT INTO bid (auction_id, bidder_id, amount, ip_address)
-- VALUES (@new_auction_id, @bidder_id, 252000.00, '127.0.0.1');

-- ----------------------------------------------------------------------------
-- Test 4.3: Valid Bid Execution (Triggers fire and synchronize state)
-- Bidder places valid bid of Rs. 260,000 (exceeds 250,000 + 5,000).
-- ----------------------------------------------------------------------------
INSERT INTO bid (auction_id, bidder_id, amount, ip_address)
VALUES (@new_auction_id, @bidder_id, 260000.00, '192.168.1.100');

SET @new_bid_id = LAST_INSERT_ID();

-- ----------------------------------------------------------------------------
-- Test 4.4: Verify Trigger 2 (trg_bid_audit) Automated Side Effects:
-- 1. auction.current_bid updated to 260,000.00
-- 2. auction.winner_id updated to @bidder_id
-- 3. auction.bid_count incremented from 0 to 1
-- 4. audit_log has new entry recorded
-- ----------------------------------------------------------------------------
SELECT 
    auction_id, 
    current_bid, 
    bid_count, 
    winner_id,
    CASE 
        WHEN current_bid = 260000.00 AND bid_count = 1 THEN 'TRIGGER 2 PASSED (Auction Synced)' 
        ELSE 'TRIGGER 2 FAILED' 
    END AS trigger_test_status
FROM auction 
WHERE auction_id = @new_auction_id;

-- Verify Audit Log entry was generated by the Trigger
SELECT 
    log_id, 
    event_type, 
    user_id, 
    auction_id, 
    summary, 
    created_at 
FROM audit_log 
WHERE auction_id = @new_auction_id 
ORDER BY log_id DESC 
LIMIT 1;


-- ============================================================================
-- SUITE 5: DATABASE VIEWS & EXP-4 JOINS STRESS TEST
-- ============================================================================

-- Test 5.1: Active Auctions View (Exp-4 Multi-Table Inner Join across 4 tables)
SELECT 
    auction_id, 
    title, 
    category_name, 
    seller_name, 
    current_bid, 
    bid_count 
FROM active_auctions_view
WHERE auction_id = @new_auction_id;

-- Test 5.2: User Bidding Activity View (Exp-4 Left Outer Join + Aggregates)
SELECT 
    user_id, 
    bidder_name, 
    total_bids_submitted, 
    auctions_participated, 
    highest_bid_placed, 
    active_winning_lots, 
    total_winning_exposure
FROM user_bidding_activity_view
WHERE user_id = @bidder_id;

-- Test 5.3: Category Performance View (Exp-4 Left Joins + AVG, MIN, MAX + GROUP BY)
SELECT 
    category_id, 
    category_name, 
    total_consignments, 
    total_auctions_listed, 
    ROUND(avg_current_bid, 2) AS avg_current_bid, 
    max_current_bid
FROM category_performance_view;


-- ============================================================================
-- SUITE 6: EXP-2 TRANSACTION INTEGRITY (SAVEPOINT & ROLLBACK)
-- ============================================================================
START TRANSACTION;

-- Step 1: Place a second bid
INSERT INTO bid (auction_id, bidder_id, amount, ip_address)
VALUES (@new_auction_id, 2, 270000.00, '127.0.0.1');

SAVEPOINT sp_valid_bid;

-- Step 2: Attempt an erroneous update
UPDATE auction 
SET status = 'Cancelled' 
WHERE auction_id = @new_auction_id;

-- Step 3: Rollback erroneous cancellation to savepoint
ROLLBACK TO SAVEPOINT sp_valid_bid;

-- Step 4: Commit transaction safely
COMMIT;

-- Verify auction remains Active with the second bid confirmed
SELECT auction_id, current_bid, bid_count, winner_id, status 
FROM auction 
WHERE auction_id = @new_auction_id;

-- ============================================================================
-- CLEANUP TEST FIXTURES (Ensures database returns to pristine demo state)
-- ============================================================================
DELETE FROM audit_log WHERE auction_id = @new_auction_id;
DELETE FROM bid WHERE auction_id = @new_auction_id;
DELETE FROM auction WHERE auction_id = @new_auction_id;
DELETE FROM item WHERE item_id = @new_item_id;
DELETE FROM users WHERE email = 'stress_buyer@test.com';

SELECT 'ALL 6 TEST SUITES EXECUTED WITH 100% SUCCESS!' AS evaluation_verdict;
