const MAX_ITEMS = 120;
const NAME_MAX = 10;
const MESSAGE_MAX = 80;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 8;
const KEY = 'duidui:danmaku:v1';
const memoryItems = [];
const rateBuckets = new Map();

const DEFAULT_ALLOWED_HOSTS = [
  'duiduih.com',
  'www.duiduih.com',
  'localhost',
  '127.0.0.1'
];

const BAD_WORDS = [
  '傻逼','傻b','煞笔','sb','cnm','nmsl','草你','操你','艹你','妈的','你妈','他妈','去死','死全家',
  'fuck','shit','bitch','asshole','dick','cunt','fucker','motherfucker','idiot'
];

function getAllowedHosts() {
  const extra = process.env.CHAT_ALLOWED_ORIGINS || process.env.DANMAKU_ALLOWED_ORIGINS || '';
  const fromEnv = extra.split(',').map((s) => normalizeAllowedHost(s.trim())).filter(Boolean);
  return [...DEFAULT_ALLOWED_HOSTS, ...fromEnv];
}

function normalizeAllowedHost(value) {
  if (!value) return null;
  const raw = value.toLowerCase();
  try {
    return new URL(raw).hostname;
  } catch {
    return raw.split('/')[0].split(':')[0];
  }
}

function hostAllowed(hostname) {
  if (!hostname) return false;
  const host = hostname.toLowerCase().split(':')[0];
  if (host.endsWith('.vercel.app')) return true;
  return getAllowedHosts().some((allowed) => {
    if (allowed.startsWith('*.')) {
      const root = allowed.slice(2);
      return host === root || host.endsWith('.' + root);
    }
    return host === allowed;
  });
}

function hostFromHeader(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function isAllowedOrigin(req) {
  const originHost = hostFromHeader(req.headers.origin);
  const refererHost = hostFromHeader(req.headers.referer);
  if (originHost && hostAllowed(originHost)) return true;
  if (refererHost && hostAllowed(refererHost)) return true;
  return !originHost && !refererHost;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim();
  if (typeof req.headers['x-real-ip'] === 'string' && req.headers['x-real-ip'].trim()) return req.headers['x-real-ip'].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  let bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.start >= RATE_WINDOW_MS) bucket = { start: now, count: 0 };
  bucket.count += 1;
  rateBuckets.set(ip, bucket);
  return bucket.count > RATE_MAX;
}

function cleanText(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function normalizedForFilter(value) {
  return String(value || '').toLowerCase().replace(/[\s._\-*~!！?？。,.，、]/g, '');
}

function hasBadWords(...values) {
  const merged = normalizedForFilter(values.join(' '));
  return BAD_WORDS.some((word) => merged.includes(normalizedForFilter(word)));
}

function publicItem(item) {
  return {
    id: item.id,
    name: item.name || '匿名',
    message: item.message,
    ts: item.ts
  };
}

async function redisCommand(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  });
  if (!response.ok) throw new Error(`Redis command failed: ${response.status}`);
  const data = await response.json();
  return data.result;
}

async function readItems() {
  const stored = await redisCommand(['LRANGE', KEY, 0, -1]);
  if (!stored) return memoryItems;
  return stored.map((raw) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

async function writeItem(item) {
  const payload = JSON.stringify(item);
  const wrote = await redisCommand(['RPUSH', KEY, payload]);
  if (wrote !== null) {
    await redisCommand(['LTRIM', KEY, -MAX_ITEMS, -1]);
    return;
  }
  memoryItems.push(item);
  while (memoryItems.length > MAX_ITEMS) memoryItems.shift();
}

export default async function handler(req, res) {
  if (!isAllowedOrigin(req)) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const items = await readItems();
      return res.status(200).json({ items: items.map(publicItem).slice(-MAX_ITEMS) });
    } catch (error) {
      return res.status(500).json({ error: 'Danmaku storage unavailable' });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Too many danmaku. Please wait a moment.' });
  }

  const body = req.body || {};
  const name = cleanText(body.name, NAME_MAX) || '匿名';
  const message = cleanText(body.message, MESSAGE_MAX);
  if (!message) return res.status(400).json({ error: 'Message is required' });
  if (hasBadWords(name, message)) return res.status(400).json({ error: 'CIVILITY_REQUIRED' });

  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    message,
    ts: Date.now()
  };

  try {
    await writeItem(item);
    return res.status(200).json({ item: publicItem(item) });
  } catch (error) {
    return res.status(500).json({ error: 'Danmaku storage unavailable' });
  }
}
