const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const SESSION_COOKIE = 'auction_session';
const SESSION_TTL = 7 * 24 * 60 * 60;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// In-memory repository for the website phase. The MySQL phase will replace this layer.
const categories = [
  { id: 1, name: 'Fine Watches', description: 'Horological masterworks and vintage chronometers' },
  { id: 2, name: 'Rare Collectibles', description: 'Fine art, sculptures, and rare museum-grade artifacts' },
  { id: 3, name: 'Vehicles', description: 'High-performance and collector automobiles' },
  { id: 4, name: 'Cameras', description: 'Film and digital cameras, lenses, and accessories' },
  { id: 5, name: 'Furniture', description: 'Furniture and useful objects for the home' },
  { id: 6, name: 'Books', description: 'Books, prints, and paper goods' }
];
const now = Date.now();
const auctions = [
  { id: 1, title: 'The Genesis Chronograph 1984', category: 'Fine Watches', condition: 'Excellent', currentBid: 72000, startingPrice: 65000, reservePrice: 85000, minIncrement: 1000, bidCount: 18, endsAt: now + 5 * 3600000 + 23 * 60000, status: 'Active', seller: 'Rohan Mehta', ownerId: null, location: 'Mumbai, Maharashtra', image: 'assets/lot_watch.jpg', description: 'Ultra-rare perpetual calendar chronometer in platinum. Features caliber 2892 automatic movement, tritium hands, and sapphire crystal exhibition caseback.' },
  { id: 2, title: 'Dutch Masters Floral Still Life (c. 1675)', category: 'Rare Collectibles', condition: 'Good', currentBid: 18500, startingPrice: 15000, reservePrice: 20000, minIncrement: 500, bidCount: 12, endsAt: now + 18 * 3600000 + 40 * 60000, status: 'Active', seller: 'Neha Joshi', ownerId: null, location: 'Pune, Maharashtra', image: 'assets/lot_art.jpg', description: 'Oil on canvas by Dutch Golden Age master. Preserved in carved gilded wood frame with historical gallery provenance records.' },
  { id: 3, title: 'Porsche Panamera Turbo Executive Edition', category: 'Vehicles', condition: 'Very good', currentBid: 168000, startingPrice: 150000, reservePrice: 185000, minIncrement: 2000, bidCount: 9, endsAt: now + 32 * 3600000, status: 'Active', seller: 'Aditi Rao', ownerId: null, location: 'Mumbai, Maharashtra', image: 'assets/lot_car.jpg', description: 'Twin-turbo V8 sports saloon in Agate Grey metallic. Dealer serviced with full inspection log, ceramic brakes, and sport chrono package.' },
  { id: 4, title: 'Vintage 35mm rangefinder camera', category: 'Cameras', condition: 'Excellent', currentBid: 6200, startingPrice: 4500, reservePrice: 5000, minIncrement: 100, bidCount: 14, endsAt: now + 48 * 3600000 + 12 * 60000, status: 'Active', seller: 'Sameer Khan', ownerId: null, location: 'Delhi, NCR', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85', description: 'A well-kept film camera with a bright viewfinder and smooth mechanical action. Includes body cap, strap, and original leather case.' },
  { id: 5, title: 'Refurbished teak study table', category: 'Furniture', condition: 'Good', currentBid: 9400, startingPrice: 3000, reservePrice: 3500, minIncrement: 100, bidCount: 8, endsAt: now + 60 * 3600000 + 8 * 60000, status: 'Active', seller: 'Priya Nair', ownerId: null, location: 'Jaipur, Rajasthan', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=85', description: 'A solid teak table, carefully refurbished and ready for a new home. Small signs of age remain and are shown in the photographs.' },
  { id: 6, title: 'Engineering mathematics · 3 volumes', category: 'Books', condition: 'Very good', currentBid: 850, startingPrice: 600, reservePrice: 800, minIncrement: 50, bidCount: 6, endsAt: now + 72 * 3600000 + 19 * 60000, status: 'Active', seller: 'Vikram Malhotra', ownerId: null, location: 'Mumbai, Maharashtra', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=85', description: 'A complete set of three engineering mathematics textbooks. Pages are clean with a few pencil notes in the margins.' }
];
const users = [];
const sessions = new Map();
const bids = [];
const auditLog = [];
const watchlists = new Map();
let nextUserId = 1;
let nextAuctionId = Math.max(...auctions.map(item => item.id)) + 1;
let nextCategoryId = Math.max(...categories.map(item => item.id)) + 1;
let nextAuditId = 1;

const sampleBidderPool = [
  'Vikram Malhotra',
  'Sunita Sharma',
  'Kabir Verma',
  'Aarav Patel',
  'Meera Sen',
  'Kavita Iyer'
];

for (const item of auctions) {
  const bidders = sampleBidderPool.filter(name => name !== item.seller);
  item.sampleBids = [
    { bidderName: bidders[0], bidder: bidders[0], amount: item.currentBid - item.minIncrement * 2, at: now - 7 * 3600000, time: now - 7 * 3600000 },
    { bidderName: bidders[1], bidder: bidders[1], amount: item.currentBid - item.minIncrement, at: now - 3 * 3600000, time: now - 3 * 3600000 },
    { bidderName: bidders[2], bidder: bidders[2], amount: item.currentBid, at: now - 45 * 60000, time: now - 45 * 60000 }
  ];
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error('Request body is too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch { reject(new Error('Request body must contain valid JSON.')); }
    });
    req.on('error', reject);
  });
}

function parseCookies(req) {
  const result = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    try { result[part.slice(0, separator).trim()] = decodeURIComponent(part.slice(separator + 1).trim()); }
    catch { /* Ignore malformed cookies. */ }
  }
  return result;
}

function getUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return users.find(user => user.id === session.userId) || null;
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, joinedAt: user.joinedAt };
}

function authorize(req, res, allowedRoles = []) {
  const user = getUser(req);
  if (!user) {
    sendJson(res, 401, { error: 'Please sign in to continue.' });
    return null;
  }
  if (user.status !== 'Active') {
    sendJson(res, 403, { error: 'This account is blocked. Contact an administrator.' });
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    sendJson(res, 403, { error: 'Your account does not have permission for this action.' });
    return null;
  }
  return user;
}

function createSession(res, user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + SESSION_TTL * 1000 });
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}`);
}

function clearSession(req, res) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function addAudit(user, action, tableName, recordId) {
  auditLog.unshift({ id: nextAuditId++, actor: user ? user.name : 'System', action, tableName, recordId, at: Date.now() });
  if (auditLog.length > 200) auditLog.pop();
}

function closeExpiredAuctions() {
  const timestamp = Date.now();
  for (const item of auctions) {
    if (item.status === 'Active' && item.endsAt <= timestamp) {
      item.status = 'Closed';
      const highest = bids.filter(bid => bid.auctionId === item.id).sort((a, b) => b.amount - a.amount || a.at - b.at)[0];
      if (highest && highest.amount >= item.reservePrice) {
        item.winnerId = highest.userId;
        item.winnerName = highest.bidderName;
        item.finalPrice = highest.amount;
        item.payment = { amount: highest.amount, dueBy: timestamp + 48 * 60 * 60 * 1000, status: 'Pending' };
      }
      addAudit(null, 'CLOSE_EXPIRED', 'auction', item.id);
    }
    if (item.payment?.status === 'Pending' && item.payment.dueBy < timestamp) {
      item.payment.status = 'Overdue';
      addAudit(null, 'MARK_OVERDUE', 'payment', item.id);
    }
  }
}

function publicAuction(item, user) {
  const realBids = bids.filter(bid => bid.auctionId === item.id);
  const recentBids = [...realBids, ...(item.sampleBids || [])]
    .sort((a, b) => b.at - a.at)
    .slice(0, 10)
    .map(bid => ({
      amount: bid.amount,
      bidderName: bid.bidderName || bid.bidder,
      bidder: bid.bidder || bid.bidderName,
      at: bid.at || bid.time,
      time: bid.time || bid.at
    }));

  const isOwner = Boolean(user && item.ownerId === user.id);
  const isAdmin = Boolean(user && user.role === 'Admin');
  const reserveMet = Boolean(item.currentBid >= item.reservePrice);

  // Redact reserve price from non-owners to protect confidentiality
  const reservePrice = (isOwner || isAdmin) ? item.reservePrice : null;
  const { ownerId, winnerId, sampleBids, ...visible } = item;

  return {
    ...visible,
    reservePrice,
    reserveMet,
    isOwner,
    watching: Boolean(user && watchlists.get(user.id)?.has(item.id)),
    recentBids,
    paymentStatus: item.payment?.status || null
  };
}

function hashPassword(password, salt = crypto.randomBytes(16)) {
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (error, key) => {
    if (error) reject(error);
    else resolve({ salt: salt.toString('hex'), hash: key.toString('hex') });
  }));
}

function parseBody(req, res) {
  return readJson(req).catch(error => {
    sendJson(res, 400, { error: error.message });
    return null;
  });
}

function findAuction(id) { return auctions.find(item => item.id === Number(id)); }
function categoryExists(name) { return categories.some(category => category.name.toLowerCase() === String(name || '').trim().toLowerCase()); }

async function api(req, res, url) {
  closeExpiredAuctions();
  let route = url.pathname;
  if (route.startsWith('/api/[...') || route.startsWith('/api/index') || !route.startsWith('/api/')) {
    const candidate = req.headers['x-matched-path'] || req.headers['x-forwarded-url'] || req.url;
    try {
      const parsed = new URL(candidate, 'http://localhost').pathname;
      if (parsed.startsWith('/api/')) route = parsed;
    } catch {
      // Keep default
    }
  }

  if (req.method === 'GET' && route === '/api/me') {
    const user = getUser(req);
    const activeUser = user?.status === 'Active' ? user : null;
    return sendJson(res, 200, { user: activeUser ? safeUser(activeUser) : null, savedCount: activeUser ? (watchlists.get(activeUser.id)?.size || 0) : 0 });
  }

  if (req.method === 'POST' && route === '/api/auth/register') {
    const body = await parseBody(req, res);
    if (!body) return;
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const role = String(body.role || 'Buyer');
    if (name.length < 2 || name.length > 80 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 120 || password.length < 8 || password.length > 128) {
      return sendJson(res, 400, { error: 'Please enter a valid name (2-80 characters), a valid email address (max 120 characters), and a password of at least 8 characters.' });
    }
    if (!['Buyer', 'Seller', 'Both'].includes(role)) return sendJson(res, 400, { error: 'Choose Buyer, Seller, or Both.' });
    if (users.some(user => user.email === email)) return sendJson(res, 409, { error: 'An account already exists with that email.' });
    const credentials = await hashPassword(password);
    const user = { id: nextUserId++, name, email, role, status: 'Active', joinedAt: Date.now(), ...credentials };
    users.push(user);
    watchlists.set(user.id, new Set());
    createSession(res, user);
    addAudit(user, 'REGISTER', 'users', user.id);
    return sendJson(res, 201, { user: safeUser(user) });
  }

  if (req.method === 'POST' && route === '/api/auth/login') {
    const body = await parseBody(req, res);
    if (!body) return;
    const email = String(body.email || '').trim().toLowerCase();
    const user = users.find(row => row.email === email);
    if (!user || user.status !== 'Active') return sendJson(res, 401, { error: 'Email or password is incorrect, or the account is blocked.' });
    const attempt = await hashPassword(String(body.password || ''), Buffer.from(user.salt, 'hex'));
    const a = Buffer.from(attempt.hash, 'hex');
    const b = Buffer.from(user.hash || user.passwordHash, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return sendJson(res, 401, { error: 'Email or password is incorrect.' });
    createSession(res, user);
    addAudit(user, 'LOGIN', 'users', user.id);
    return sendJson(res, 200, { user: safeUser(user) });
  }

  if (req.method === 'POST' && route === '/api/auth/logout') {
    const user = getUser(req);
    clearSession(req, res);
    if (user) addAudit(user, 'LOGOUT', 'users', user.id);
    return sendJson(res, 200, { message: 'Signed out.' });
  }

  if (req.method === 'GET' && route === '/api/categories') return sendJson(res, 200, categories);

  if (req.method === 'GET' && route === '/api/auctions') {
    const user = getUser(req);
    const category = url.searchParams.get('category');
    const query = (url.searchParams.get('q') || '').trim().toLowerCase();
    const status = url.searchParams.get('status');
    const sort = url.searchParams.get('sort') || 'newest';

    let rows = auctions.filter(item => item.status !== 'Cancelled'
      && (!category || category === 'All lots' || item.category === category)
      && (!status || item.status === status)
      && (!query || `${item.title} ${item.category} ${item.seller} ${item.description}`.toLowerCase().includes(query)));

    if (sort === 'bid_desc') {
      rows.sort((a, b) => b.currentBid - a.currentBid);
    } else if (sort === 'bid_asc') {
      rows.sort((a, b) => a.currentBid - b.currentBid);
    } else if (sort === 'ending_soon') {
      rows.sort((a, b) => a.endsAt - b.endsAt);
    } else { // default 'newest' / 'latest'
      rows.sort((a, b) => b.id - a.id);
    }

    return sendJson(res, 200, rows.map(item => publicAuction(item, user)));
  }

  const auctionMatch = route.match(/^\/api\/auctions\/(\d+)(?:\/(bid|watchlist|payment))?$/);
  if (auctionMatch) {
    const [, rawId, action] = auctionMatch;
    const item = findAuction(rawId);
    if (!item || item.status === 'Cancelled') return sendJson(res, 404, { error: 'Auction not found.' });
    if (req.method === 'GET' && !action) return sendJson(res, 200, publicAuction(item, getUser(req)));

    if (req.method === 'POST' && action === 'bid') {
      const user = authorize(req, res);
      if (!user) return;
      const body = await parseBody(req, res);
      if (!body) return;
      const amount = Number(body.amount);
      if (user.role === 'Admin') return sendJson(res, 403, { error: 'Admin accounts cannot place bids.' });
      if (user.role === 'Seller') return sendJson(res, 403, { error: 'Seller-only accounts cannot place bids. Use a Buyer or Both account.' });
      if (item.status !== 'Active' || item.endsAt <= Date.now()) return sendJson(res, 409, { error: 'This auction is no longer accepting bids.' });
      if (item.ownerId === user.id) return sendJson(res, 403, { error: 'You cannot bid on your own listing.' });
      const MAX_BID = 100_000_000;
      const minimumBid = item.bidCount === 0 ? item.startingPrice : item.currentBid + item.minIncrement;
      if (!Number.isFinite(amount) || amount < minimumBid || amount > MAX_BID) {
        return sendJson(res, 400, { error: `Your bid must be between ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(minimumBid)} and ₹100,000,000.` });
      }
      item.currentBid = Math.round(amount * 100) / 100;
      item.bidCount++;
      bids.push({ id: bids.length + 1, auctionId: item.id, userId: user.id, bidderName: user.name, amount: item.currentBid, at: Date.now() });
      addAudit(user, 'PLACE_BID', 'bid', bids.at(-1).id);
      return sendJson(res, 201, { message: 'Your bid has been recorded.', auction: publicAuction(item, user) });
    }

    if (req.method === 'POST' && action === 'watchlist') {
      const user = authorize(req, res);
      if (!user) return;
      if (!watchlists.has(user.id)) watchlists.set(user.id, new Set());
      const saved = watchlists.get(user.id);
      if (saved.has(item.id)) saved.delete(item.id); else saved.add(item.id);
      addAudit(user, saved.has(item.id) ? 'SAVE_AUCTION' : 'UNSAVE_AUCTION', 'watchlist', item.id);
      return sendJson(res, 200, { watching: saved.has(item.id) });
    }

    if (req.method === 'POST' && action === 'payment') {
      const user = authorize(req, res);
      if (!user) return;
      if (!item.payment || item.winnerId !== user.id) return sendJson(res, 404, { error: 'No payment is due for this account.' });
      if (!['Pending', 'Overdue'].includes(item.payment.status)) return sendJson(res, 409, { error: 'This payment has already been updated.' });
      item.payment.status = 'Paid';
      item.payment.paidAt = Date.now();
      addAudit(user, 'MARK_PAYMENT_PAID', 'payment', item.id);
      return sendJson(res, 200, { message: 'Demo payment marked as paid.' });
    }
  }

  if (req.method === 'GET' && route === '/api/dashboard') {
    const user = authorize(req, res);
    if (!user) return;
    const myBids = bids.filter(bid => bid.userId === user.id).map(bid => {
      const auction = findAuction(bid.auctionId);
      const allItemBids = bids.filter(b => b.auctionId === bid.auctionId).sort((a, b) => b.amount - a.amount || a.at - b.at);
      const isWinning = allItemBids.length > 0 && allItemBids[0].id === bid.id;
      return {
        ...bid,
        bidder: bid.bidderName || user.name,
        time: bid.at,
        isWinning: Boolean(isWinning),
        auction: auction ? publicAuction(auction, user) : null
      };
    });
    return sendJson(res, 200, {
      user: safeUser(user),
      myBids,
      myAuctions: auctions.filter(item => item.ownerId === user.id).map(item => publicAuction(item, user)),
      saved: auctions.filter(item => watchlists.get(user.id)?.has(item.id)).map(item => publicAuction(item, user)),
      won: auctions.filter(item => item.winnerId === user.id).map(item => ({
        ...publicAuction(item, user),
        paymentStatus: item.payment?.status || 'Pending'
      }))
    });
  }

  if (req.method === 'POST' && route === '/api/listings') {
    const user = authorize(req, res, ['Seller', 'Both']);
    if (!user) return;
    const body = await parseBody(req, res);
    if (!body) return;
    const item = validateListing(body, res);
    if (!item) return;
    const auction = { id: nextAuctionId++, ...item, bidCount: 0, endsAt: item.endsAt, status: 'Active', ownerId: user.id, seller: user.name, winnerId: null };
    auctions.unshift(auction);
    addAudit(user, 'CREATE_LISTING', 'auction', auction.id);
    return sendJson(res, 201, publicAuction(auction, user));
  }

  const listingMatch = route.match(/^\/api\/listings\/(\d+)$/);
  if (listingMatch) {
    const item = findAuction(listingMatch[1]);
    if (!item) return sendJson(res, 404, { error: 'Listing not found.' });
    const user = authorize(req, res, ['Seller', 'Both']);
    if (!user) return;
    if (item.ownerId !== user.id) return sendJson(res, 403, { error: 'You can only change your own listing.' });
    if (item.bidCount > 0) return sendJson(res, 409, { error: 'A listing cannot be edited or cancelled after it receives a bid.' });
    if (req.method === 'PATCH') {
      if (item.status !== 'Active') return sendJson(res, 409, { error: 'Only active listings can be edited.' });
      const body = await parseBody(req, res);
      if (!body) return;
      const updated = validateListing(body, res);
      if (!updated) return;
      Object.assign(item, updated);
      addAudit(user, 'EDIT_LISTING', 'auction', item.id);
      return sendJson(res, 200, publicAuction(item, user));
    }
    if (req.method === 'DELETE') {
      if (item.status !== 'Active') return sendJson(res, 409, { error: 'Only active listings can be cancelled.' });
      item.status = 'Cancelled';
      addAudit(user, 'CANCEL_LISTING', 'auction', item.id);
      return sendJson(res, 200, { message: 'Listing cancelled.' });
    }
  }

  if (req.method === 'GET' && route === '/api/admin/dashboard') {
    const admin = authorize(req, res, ['Admin']);
    if (!admin) return;
    return sendJson(res, 200, {
      user: safeUser(admin),
      users: users.map(safeUser),
      auctions: auctions.map(item => ({ id: item.id, title: item.title, category: item.category, status: item.status, seller: item.seller, currentBid: item.currentBid, bidCount: item.bidCount })),
      categories,
      audit: auditLog.slice(0, 80)
    });
  }

  if (req.method === 'POST' && route === '/api/admin/categories') {
    const admin = authorize(req, res, ['Admin']);
    if (!admin) return;
    const body = await parseBody(req, res);
    if (!body) return;
    const name = String(body.name || '').trim();
    if (name.length < 2 || name.length > 50) return sendJson(res, 400, { error: 'Category names must be between 2 and 50 characters.' });
    if (categoryExists(name)) return sendJson(res, 409, { error: 'That category already exists.' });
    const category = { id: nextCategoryId++, name, description: String(body.description || '').trim() };
    categories.push(category);
    addAudit(admin, 'CREATE_CATEGORY', 'category', category.id);
    return sendJson(res, 201, category);
  }

  const adminCategoryMatch = route.match(/^\/api\/admin\/categories\/(\d+)$/);
  if (adminCategoryMatch) {
    const admin = authorize(req, res, ['Admin']);
    if (!admin) return;
    const category = categories.find(row => row.id === Number(adminCategoryMatch[1]));
    if (!category) return sendJson(res, 404, { error: 'Category not found.' });
    if (req.method === 'PATCH') {
      const body = await parseBody(req, res);
      if (!body) return;
      const name = String(body.name || '').trim();
      if (name.length < 2 || name.length > 50) return sendJson(res, 400, { error: 'Category names must be between 2 and 50 characters.' });
      if (categories.some(row => row.id !== category.id && row.name.toLowerCase() === name.toLowerCase())) return sendJson(res, 409, { error: 'That category already exists.' });
      const oldName = category.name;
      category.name = name;
      category.description = String(body.description || '').trim();
      auctions.filter(item => item.category === oldName).forEach(item => { item.category = name; });
      addAudit(admin, 'EDIT_CATEGORY', 'category', category.id);
      return sendJson(res, 200, category);
    }
    if (req.method === 'DELETE') {
      if (auctions.some(item => item.category === category.name)) return sendJson(res, 409, { error: 'This category is in use by an auction and cannot be removed.' });
      categories.splice(categories.indexOf(category), 1);
      addAudit(admin, 'DELETE_CATEGORY', 'category', category.id);
      return sendJson(res, 200, { message: 'Category removed.' });
    }
  }

  const adminUserMatch = route.match(/^\/api\/admin\/users\/(\d+)\/status$/);
  if (req.method === 'PATCH' && adminUserMatch) {
    const admin = authorize(req, res, ['Admin']);
    if (!admin) return;
    const body = await parseBody(req, res);
    if (!body) return;
    const user = users.find(row => row.id === Number(adminUserMatch[1]));
    if (!user) return sendJson(res, 404, { error: 'User not found.' });
    if (user.role === 'Admin') return sendJson(res, 403, { error: 'Admin accounts cannot be blocked from this panel.' });
    if (!['Active', 'Blocked'].includes(body.status)) return sendJson(res, 400, { error: 'Status must be Active or Blocked.' });
    user.status = body.status;
    if (user.status === 'Blocked') {
      for (const [token, session] of sessions) if (session.userId === user.id) sessions.delete(token);
    }
    addAudit(admin, user.status === 'Blocked' ? 'BLOCK_USER' : 'UNBLOCK_USER', 'users', user.id);
    return sendJson(res, 200, { user: safeUser(user) });
  }

  const adminAuctionMatch = route.match(/^\/api\/admin\/auctions\/(\d+)\/cancel$/);
  if (req.method === 'POST' && adminAuctionMatch) {
    const admin = authorize(req, res, ['Admin']);
    if (!admin) return;
    const item = findAuction(adminAuctionMatch[1]);
    if (!item) return sendJson(res, 404, { error: 'Auction not found.' });
    if (item.status !== 'Active') return sendJson(res, 409, { error: 'Only active auctions can be cancelled.' });
    item.status = 'Cancelled';
    addAudit(admin, 'ADMIN_CANCEL_AUCTION', 'auction', item.id);
    return sendJson(res, 200, { message: 'Auction cancelled.' });
  }

  return sendJson(res, 404, { error: 'API route not found.' });
}

function validateListing(body, res) {
  const title = String(body.title || '').trim();
  const category = String(body.category || '').trim();
  const condition = String(body.condition || 'Good');
  const startingPrice = Number(body.startingPrice);
  const minIncrement = Number(body.minIncrement || 100);
  const reservePrice = Number(body.reservePrice || 0);
  const endsAt = body.endDate ? new Date(body.endDate).getTime() : (body.durationDays ? Date.now() + Number(body.durationDays) * 86400000 : NaN);
  if (title.length < 3 || title.length > 100) { sendJson(res, 400, { error: 'Object names must be between 3 and 100 characters.' }); return null; }
  if (!categoryExists(category)) { sendJson(res, 400, { error: 'Choose a category from the available list.' }); return null; }
  if (!['New', 'Excellent', 'Very good', 'Good', 'Fair', 'Used', 'Refurbished'].includes(condition)) { sendJson(res, 400, { error: 'Choose a valid condition.' }); return null; }
  const MAX_PRICE = 100_000_000;
  if (!Number.isFinite(startingPrice) || startingPrice <= 0 || startingPrice > MAX_PRICE ||
      !Number.isFinite(minIncrement) || minIncrement <= 0 || minIncrement > MAX_PRICE ||
      !Number.isFinite(reservePrice) || reservePrice < 0 || reservePrice > MAX_PRICE) {
    sendJson(res, 400, { error: 'Prices must be valid positive amounts up to ₹100,000,000.' });
    return null;
  }
  if (reservePrice > 0 && reservePrice < startingPrice) {
    sendJson(res, 400, { error: 'Reserve price cannot be less than the starting price.' });
    return null;
  }
  const now = Date.now();
  const minDuration = 60 * 60 * 1000; // at least 1 hour
  const maxDuration = 30 * 24 * 60 * 60 * 1000; // at most 30 days
  if (!Number.isFinite(endsAt) || endsAt < now + minDuration || endsAt > now + maxDuration) {
    sendJson(res, 400, { error: 'Auction end time must be between 1 hour and 30 days from now.' });
    return null;
  }
  const image = String(body.image || '').trim();
  if (image && !/^https:\/\/[^\s"'<>\\]+$/i.test(image)) {
    sendJson(res, 400, { error: 'Image address must be a valid https:// URL without quotes or whitespace.' });
    return null;
  }
  return {
    title, category, condition,
    currentBid: startingPrice,
    startingPrice,
    reservePrice,
    minIncrement,
    endsAt,
    location: String(body.location || 'Mumbai, Maharashtra').trim().slice(0, 100),
    image: image || 'assets/placeholder.svg',
    description: String(body.description || '').trim().slice(0, 3000)
  };
}

const ALLOWED_STATIC_EXTS = new Set([
  '.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.otf'
]);
const BLOCKED_NAMES = new Set([
  'server.js', 'package.json', 'package-lock.json', 'readme.md', 'project_checklist.md'
]);

// Pre-load core assets so Vercel NFT bundles them and requests are served with zero filesystem latency
const STATIC_CACHE = new Map();
function cacheLiteral(rel, mime, fullPath) {
  try {
    if (fs.existsSync(fullPath)) {
      STATIC_CACHE.set(rel, { content: fs.readFileSync(fullPath), mime });
    }
  } catch {
    // Ignore if missing
  }
}

cacheLiteral('index.html', 'text/html; charset=utf-8', path.join(__dirname, 'index.html'));
cacheLiteral('catalog.html', 'text/html; charset=utf-8', path.join(__dirname, 'catalog.html'));
cacheLiteral('account.html', 'text/html; charset=utf-8', path.join(__dirname, 'account.html'));
cacheLiteral('architecture.html', 'text/html; charset=utf-8', path.join(__dirname, 'architecture.html'));
cacheLiteral('system-log.html', 'text/html; charset=utf-8', path.join(__dirname, 'system-log.html'));
cacheLiteral('style.css', 'text/css; charset=utf-8', path.join(__dirname, 'style.css'));
cacheLiteral('script.js', 'text/javascript; charset=utf-8', path.join(__dirname, 'script.js'));
cacheLiteral('assets/placeholder.svg', 'image/svg+xml', path.join(__dirname, 'assets/placeholder.svg'));
cacheLiteral('assets/lot_watch.jpg', 'image/jpeg', path.join(__dirname, 'assets/lot_watch.jpg'));
cacheLiteral('assets/lot_art.jpg', 'image/jpeg', path.join(__dirname, 'assets/lot_art.jpg'));
cacheLiteral('assets/lot_car.jpg', 'image/jpeg', path.join(__dirname, 'assets/lot_car.jpg'));
cacheLiteral('assets/05.png', 'image/png', path.join(__dirname, 'assets/05.png'));
cacheLiteral('assets/06.png', 'image/png', path.join(__dirname, 'assets/06.png'));
cacheLiteral('assets/09.png', 'image/png', path.join(__dirname, 'assets/09.png'));
cacheLiteral('assets/dot.svg', 'image/svg+xml', path.join(__dirname, 'assets/dot.svg'));
cacheLiteral('assets/favicon-bleu.png', 'image/png', path.join(__dirname, 'assets/favicon-bleu.png'));
cacheLiteral('assets/sticker-fire-blue.png', 'image/png', path.join(__dirname, 'assets/sticker-fire-blue.png'));
cacheLiteral('assets/sticker-taco-green.png', 'image/png', path.join(__dirname, 'assets/sticker-taco-green.png'));
cacheLiteral('assets/sticker-trail-beer.png', 'image/png', path.join(__dirname, 'assets/sticker-trail-beer.png'));
cacheLiteral('assets/sticker-trail-eye-illu.png', 'image/png', path.join(__dirname, 'assets/sticker-trail-eye-illu.png'));
cacheLiteral('assets/sticker-trail-taco.png', 'image/png', path.join(__dirname, 'assets/sticker-trail-taco.png'));
cacheLiteral('assets/team/SAM.png', 'image/png', path.join(__dirname, 'assets/team/SAM.png'));
cacheLiteral('fonts/SpaceGrotesk-Regular.otf', 'font/otf', path.join(__dirname, 'fonts/SpaceGrotesk-Regular.otf'));
cacheLiteral('fonts/SpaceGrotesk-Medium.otf', 'font/otf', path.join(__dirname, 'fonts/SpaceGrotesk-Medium.otf'));
cacheLiteral('fonts/FKRasterRomanCompact-Smooth.ttf', 'font/ttf', path.join(__dirname, 'fonts/FKRasterRomanCompact-Smooth.ttf'));
cacheLiteral('fonts/KHTekaTRIAL-Regular.otf', 'font/otf', path.join(__dirname, 'fonts/KHTekaTRIAL-Regular.otf'));
cacheLiteral('fonts/KHInterferenceTRIAL-Regular.otf', 'font/otf', path.join(__dirname, 'fonts/KHInterferenceTRIAL-Regular.otf'));

function findFilePath(requested) {
  const candidateRoots = [
    ROOT,
    process.cwd(),
    __dirname,
    path.resolve(__dirname, '..'),
    path.resolve(process.cwd(), 'public')
  ];

  for (const rootDir of candidateRoots) {
    if (!rootDir) continue;
    try {
      let target = path.resolve(rootDir, `.${requested}`);
      if (target.startsWith(`${rootDir}${path.sep}`) || target === rootDir) {
        if (fs.existsSync(target) && fs.statSync(target).isFile()) {
          return target;
        }
        const htmlTarget = `${target}.html`;
        if (!path.extname(target) && fs.existsSync(htmlTarget) && fs.statSync(htmlTarget).isFile()) {
          return htmlTarget;
        }
      }
    } catch {
      // Continue searching
    }
  }
  return null;
}

function serveFile(req, res, url) {
  let requested = '';
  try {
    requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  } catch {
    return sendJson(res, 400, { error: 'Invalid URL encoding.' });
  }

  // Normalize and security check
  const normalized = path.normalize(requested);
  if (normalized.includes('..') || normalized.startsWith('.')) {
    return sendJson(res, 403, { error: 'Forbidden.' });
  }

  // 1. Check in-memory static cache (handles exact files & clean URLs)
  let cached = STATIC_CACHE.get(normalized);
  if (!cached && !path.extname(normalized)) {
    cached = STATIC_CACHE.get(`${normalized}.html`);
  }

  if (cached) {
    res.writeHead(200, {
      'Content-Type': cached.mime,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    });
    return res.end(cached.content);
  }

  // 2. Fallback to filesystem lookup
  const filePath = findFilePath('/' + normalized);
  if (!filePath) {
    return sendJson(res, 404, { error: 'Page not found.' });
  }

  const basename = path.basename(filePath).toLowerCase();
  const ext = path.extname(filePath).toLowerCase();

  // Protect sensitive files, hidden directories, node scripts, metadata
  if (basename.startsWith('.') || BLOCKED_NAMES.has(basename) || ext === '.json' || ext === '.md' || ext === '.sql' || !ALLOWED_STATIC_EXTS.has(ext)) {
    return sendJson(res, 404, { error: 'Page not found.' });
  }

  fs.readFile(filePath, (error, content) => {
    if (error) return sendJson(res, 404, { error: 'Page not found.' });
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    });
    res.end(content);
  });
}

async function bootstrapAccounts() {
  const accounts = [
    // 1. Administrator (both .com and .internal)
    {
      name: process.env.ADMIN_NAME || 'Administrator',
      email: String(process.env.ADMIN_EMAIL || 'admin@theauctionsociety.com').trim().toLowerCase(),
      pass: String(process.env.ADMIN_PASSWORD || 'admin12345'),
      role: 'Admin'
    },
    {
      name: 'Administrator (Internal)',
      email: 'admin@theauctionsociety.internal',
      pass: String(process.env.ADMIN_PASSWORD || 'admin12345'),
      role: 'Admin'
    },
    // 2. Pre-configured Demo Buyer (both .com and .internal)
    {
      name: 'Ankit Anand (Buyer)',
      email: 'buyer@theauctionsociety.com',
      pass: 'buyer12345',
      role: 'Buyer'
    },
    {
      name: 'Ankit Anand (Internal)',
      email: 'buyer@theauctionsociety.internal',
      pass: 'buyer12345',
      role: 'Buyer'
    },
    // 3. Pre-configured Demo Seller (both .com and .internal)
    {
      name: 'Aryaman Annavajhala (Seller)',
      email: 'seller@theauctionsociety.com',
      pass: 'seller12345',
      role: 'Seller'
    },
    {
      name: 'Aryaman Annavajhala (Internal)',
      email: 'seller@theauctionsociety.internal',
      pass: 'seller12345',
      role: 'Seller'
    },
    // 4. Pre-configured Demo Member (Both Buyer & Seller privileges)
    {
      name: 'Ankit Anand (Member - Both)',
      email: 'member@theauctionsociety.com',
      pass: 'both12345',
      role: 'Both'
    },
    {
      name: 'Member (Internal)',
      email: 'member@theauctionsociety.internal',
      pass: 'both12345',
      role: 'Both'
    },
    {
      name: 'Demo Both Account',
      email: 'both@theauctionsociety.com',
      pass: 'both12345',
      role: 'Both'
    },
    {
      name: 'Demo Both (Internal)',
      email: 'both@theauctionsociety.internal',
      pass: 'both12345',
      role: 'Both'
    }
  ];

  for (const acc of accounts) {
    if (!users.some(u => u.email === acc.email)) {
      const creds = await hashPassword(acc.pass);
      const user = {
        id: nextUserId++,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        status: 'Active',
        joinedAt: Date.now(),
        ...creds
      };
      users.push(user);
      watchlists.set(user.id, new Set());
    }
  }
}

let bootstrapped = false;
let bootstrapPromise = null;

async function ensureBootstrapped() {
  if (bootstrapped) return;
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapAccounts().then(() => {
      bootstrapped = true;
    }).catch(err => {
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}

async function requestListener(req, res) {
  try {
    await ensureBootstrapped();
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    return serveFile(req, res, url);
  } catch (error) {
    console.error('Request failed:', error.message);
    if (!res.headersSent) sendJson(res, 500, { error: 'The server could not complete that request.' });
    else res.end();
  }
}

const server = http.createServer(requestListener);

closeExpiredAuctions();
const auctionClock = setInterval(closeExpiredAuctions, 30_000);
auctionClock.unref();

if (require.main === module) {
  ensureBootstrapped().then(() => {
    server.listen(PORT, HOST, () => {
      console.log(`Auction house running at http://localhost:${PORT}`);
      console.log(`Demo accounts loaded:`);
      console.log(` - Admin:  admin@theauctionsociety.com  (pass: admin12345)`);
      console.log(` - Buyer:  buyer@theauctionsociety.com  (pass: buyer12345)`);
      console.log(` - Seller: seller@theauctionsociety.com (pass: seller12345)`);
      console.log(` - Member: member@theauctionsociety.com (pass: both12345 - Both Buyer & Seller)`);
    });
  }).catch(error => {
    console.error('Failed to start server:', error.message);
    process.exitCode = 1;
  });
} else {
  ensureBootstrapped().catch(console.error);
}

module.exports = server;
module.exports.default = requestListener;
