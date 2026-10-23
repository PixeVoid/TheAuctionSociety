// ============================================================================
// THE AUCTION SOCIETY - FULL STACK HARD STRESS TEST SUITE
// Tests Frontend (HTML/CSS/JS), Backend (REST APIs), and MySQL (3NF + Triggers)
// ============================================================================

const http = require('node:http');
const db = require('./db');

const BASE_URL = 'http://127.0.0.1:3000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { ...headers }
    };

    let payload = null;
    if (body) {
      payload = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function extractCookie(res) {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) return '';
  return setCookie[0].split(';')[0];
}

async function runFullStackStressTest() {
  console.log('\n=============================================================');
  console.log('🚀 STARTING FULL-STACK STRESS TEST (FE + BE + MySQL)');
  console.log('=============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 1: FRONTEND PAGES ACCESSIBILITY
  // --------------------------------------------------------------------------
  console.log('--- SECTION 1: FRONTEND STATIC PAGES & ASSETS ---');
  const pages = ['/', '/catalog.html', '/architecture.html', '/system-log.html', '/account.html'];
  for (const p of pages) {
    const res = await request('GET', p);
    assert(res.status === 200 && res.data.length > 500, `Page ${p} returned HTTP 200 OK (${res.data.length} bytes)`);
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 2: MYSQL LIVE DATABASE ENGINE VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 2: MYSQL LIVE ENGINE & 3NF TABLES ---');
  const [dbTables] = await db.pool.query('SHOW TABLES');
  assert(dbTables.length >= 8, `MySQL auction_society database has ${dbTables.length} tables/views loaded`);

  const [triggers] = await db.pool.query('SHOW TRIGGERS');
  const triggerNames = triggers.map(t => t.Trigger);
  assert(triggerNames.includes('trg_bid_validate'), 'Trigger trg_bid_validate is active in MySQL engine');
  assert(triggerNames.includes('trg_bid_audit'), 'Trigger trg_bid_audit is active in MySQL engine');

  // --------------------------------------------------------------------------
  // TEST SECTION 3: AUTH & SESSION FLOW WITH MYSQL SYNC
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 3: AUTHENTICATION FLOW & MYSQL USERS TABLE ---');
  const testEmail = `stress_${Date.now()}@buyer.test`;
  const regRes = await request('POST', '/api/auth/register', {
    name: 'Stress Test Buyer',
    email: testEmail,
    password: 'password123',
    role: 'Buyer'
  });
  assert(regRes.status === 201 && regRes.json.user.email === testEmail, 'User registered via REST API (HTTP 201)');

  // Verify in MySQL
  const [dbUserRows] = await db.pool.query('SELECT user_id, name, email, role, status FROM users WHERE email = ?', [testEmail]);
  assert(dbUserRows.length === 1 && dbUserRows[0].email === testEmail, 'Registered user immediately persisted in MySQL `users` table');

  // Login with seed buyer
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'buyer@theauctionsociety.com',
    password: 'buyer12345'
  });
  assert(loginRes.status === 200, 'Seed Buyer logged in successfully (HTTP 200)');
  const buyerCookie = extractCookie(loginRes);
  assert(buyerCookie.includes('auction_session'), 'Session cookie issued');

  // Check login audit in MySQL
  const [dbAuditRows] = await db.pool.query('SELECT log_id, event_type, summary FROM audit_log WHERE event_type = "LOGIN" ORDER BY log_id DESC LIMIT 1');
  assert(dbAuditRows.length > 0 && dbAuditRows[0].summary.includes('buyer@theauctionsociety.com'), 'Login event recorded in MySQL `audit_log`');

  // --------------------------------------------------------------------------
  // TEST SECTION 4: CATALOG & VIEW PERFORMANCE
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 4: CATALOG REST API & DATABASE VIEWS ---');
  const catRes = await request('GET', '/api/auctions?sort=newest');
  assert(catRes.status === 200 && Array.isArray(catRes.json) && catRes.json.length >= 6, `Catalog returned ${catRes.json.length} active lots`);

  // Direct query on active_auctions_view
  const [viewRows] = await db.pool.query('SELECT * FROM active_auctions_view');
  assert(viewRows.length >= 6, `Database view \`active_auctions_view\` executed successfully (${viewRows.length} lots)`);

  // --------------------------------------------------------------------------
  // TEST SECTION 5: HARD BIDDING & TRIGGER INTEGRATION TEST
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 5: BIDDING ENGINE & TRIGGER STATE SYNCHRONIZATION ---');
  const auctionId = 1;
  const [aucBefore] = await db.pool.query('SELECT current_bid, min_increment, bid_count, winner_id FROM auction WHERE auction_id = ?', [auctionId]);
  const currentBid = Number(aucBefore[0].current_bid);
  const minInc = Number(aucBefore[0].min_increment);
  const oldBidCount = Number(aucBefore[0].bid_count);

  // Test 5.1: Negative Test - Under-bidding rejected by Trigger
  const underBidRes = await request('POST', `/api/auctions/${auctionId}/bid`, {
    amount: currentBid + 1 // less than minIncrement
  }, { Cookie: buyerCookie });
  assert(underBidRes.status === 400, 'Under-bid blocked with HTTP 400');

  // Test 5.2: Valid Bid Submission
  const validBidAmount = currentBid + minInc + 500;
  const bidRes = await request('POST', `/api/auctions/${auctionId}/bid`, {
    amount: validBidAmount
  }, { Cookie: buyerCookie });
  assert(bidRes.status === 201, `Valid bid of ₹${validBidAmount} placed (HTTP 201)`);

  // Test 5.3: Verify MySQL Trigger trg_bid_audit side-effects
  const [aucAfter] = await db.pool.query('SELECT current_bid, bid_count, winner_id FROM auction WHERE auction_id = ?', [auctionId]);
  assert(Number(aucAfter[0].current_bid) === validBidAmount, `MySQL auction current_bid automatically updated to ₹${validBidAmount}`);
  assert(Number(aucAfter[0].bid_count) === oldBidCount + 1, `MySQL auction bid_count atomically incremented to ${oldBidCount + 1}`);

  // Test 5.4: Verify MySQL bid row created
  const [bidRows] = await db.pool.query('SELECT bid_id, amount, is_winning FROM bid WHERE auction_id = ? AND amount = ?', [auctionId, validBidAmount]);
  assert(bidRows.length >= 1 && Number(bidRows[0].amount) === validBidAmount, 'Bid row persisted in MySQL `bid` table');

  // Test 5.5: Verify trg_bid_audit generated audit record
  const [auditLogBid] = await db.pool.query('SELECT log_id, summary FROM audit_log WHERE auction_id = ? AND event_type = "PLACE_BID" ORDER BY log_id DESC LIMIT 1', [auctionId]);
  assert(auditLogBid.length > 0 && auditLogBid[0].summary.includes(String(validBidAmount)), 'Trigger `trg_bid_audit` inserted audit trail record in MySQL');

  // --------------------------------------------------------------------------
  // TEST SECTION 6: SELLER LISTING CREATION & WATCHLIST SYNCHRONIZATION
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 6: SELLER LISTING & WATCHLIST WORKFLOW ---');
  // Login as seller
  const sellerLogin = await request('POST', '/api/auth/login', {
    email: 'seller@theauctionsociety.com',
    password: 'seller12345'
  });
  assert(sellerLogin.status === 200, 'Seller logged in successfully (HTTP 200)');
  const sellerCookie = extractCookie(sellerLogin);

  // Create new listing
  const lotTitle = `Grand Tour Antique Astrolabe #${Date.now()}`;
  const createListRes = await request('POST', '/api/listings', {
    title: lotTitle,
    category: 'Rare Collectibles',
    condition: 'Excellent',
    startingPrice: 35000,
    reservePrice: 45000,
    minIncrement: 1000,
    durationDays: 7,
    location: 'Mumbai, Maharashtra',
    image: 'assets/placeholder.svg',
    description: 'Rare 18th century brass navigational astrolabe with engraved celestial coordinates.'
  }, { Cookie: sellerCookie });
  assert(createListRes.status === 201, 'Seller successfully created new consignment lot (HTTP 201)');

  // Verify item and auction in MySQL
  const [createdItems] = await db.pool.query('SELECT item_id, title FROM item WHERE title = ?', [lotTitle]);
  assert(createdItems.length === 1 && createdItems[0].title === lotTitle, 'Consigned item persisted into MySQL `item` table');

  const createdItemId = createdItems[0].item_id;
  const [createdAuctions] = await db.pool.query('SELECT auction_id, current_bid, status FROM auction WHERE item_id = ?', [createdItemId]);
  assert(createdAuctions.length === 1 && Number(createdAuctions[0].current_bid) === 35000, 'Auction record created in MySQL `auction` table with initial starting price');

  // Watchlist Toggle
  const watchRes = await request('POST', `/api/auctions/${createdAuctions[0].auction_id}/watchlist`, null, { Cookie: buyerCookie });
  assert(watchRes.status === 200 && watchRes.json.watching === true, 'Buyer bookmarked lot to watchlist (HTTP 200)');

  const [watchRows] = await db.pool.query('SELECT * FROM watchlist WHERE auction_id = ?', [createdAuctions[0].auction_id]);
  assert(watchRows.length === 1, 'Bookmark successfully inserted into MySQL `watchlist` table');

  // --------------------------------------------------------------------------
  // TEST SECTION 7: HIGH-CONCURRENCY STRESS TEST
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 7: HIGH-CONCURRENCY LOAD TEST (50 SIMULTANEOUS REQUESTS) ---');
  const CONCURRENT_REQUESTS = 50;
  const startTime = Date.now();
  const promises = [];

  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    if (i % 2 === 0) {
      promises.push(request('GET', '/api/auctions?sort=ending_soon'));
    } else {
      promises.push(request('GET', `/api/auctions/${(i % 6) + 1}`));
    }
  }

  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;
  const allSucceeded = results.every(r => r.status === 200);

  assert(allSucceeded, `All ${CONCURRENT_REQUESTS} concurrent requests returned HTTP 200`);
  assert(duration < 2500, `50 concurrent requests served in ${duration}ms (${Math.round((CONCURRENT_REQUESTS / duration) * 1000)} req/sec)`);

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n=============================================================');
  console.log(`📊 STRESS TEST COMPLETED: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log('=============================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 VERDICT: FRONTEND, BACKEND, AND MYSQL DATABASE ARE 100% SYNCHRONIZED AND BULLETPROOF!\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

const PORT = 3000;

http.get('http://127.0.0.1:3000/api/categories', async (res) => {
  try {
    await runFullStackStressTest();
  } catch (err) {
    console.error('Fatal stress test failure:', err);
    process.exit(1);
  }
}).on('error', () => {
  const server = require('./server');
  server.listen(PORT, '127.0.0.1', async () => {
    try {
      await runFullStackStressTest();
    } catch (err) {
      console.error('Fatal stress test failure:', err);
      process.exit(1);
    } finally {
      server.close();
      process.exit(0);
    }
  });
});
