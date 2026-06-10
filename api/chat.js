const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const rateBuckets = new Map();

const DEFAULT_ALLOWED_HOSTS = [
  'duiduih.com',
  'www.duiduih.com',
  'localhost',
  '127.0.0.1'
];

function getAllowedHosts() {
  const extra = process.env.CHAT_ALLOWED_ORIGINS || '';
  const fromEnv = extra.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return [...DEFAULT_ALLOWED_HOSTS, ...fromEnv];
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
  return false;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (typeof req.headers['x-real-ip'] === 'string' && req.headers['x-real-ip'].trim()) {
    return req.headers['x-real-ip'].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  let bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.start >= RATE_WINDOW_MS) {
    bucket = { start: now, count: 0 };
  }
  bucket.count += 1;
  rateBuckets.set(ip, bucket);

  if (rateBuckets.size > 5000) {
    for (const [key, value] of rateBuckets) {
      if (now - value.start >= RATE_WINDOW_MS) rateBuckets.delete(key);
    }
  }

  return bucket.count > RATE_MAX;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(501).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  const body = req.body || {};
  const question = String(body.question || '').trim().slice(0, 800);
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const section = body.section || {};
  const styleGuide = Array.isArray(body.styleGuide) ? body.styleGuide : [];
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

  const systemInstruction = [
    body.lang === 'en'
      ? 'You are XXD (小小对), the portfolio site\'s chat guide. Sound like her: warm, sharp, candid, slightly playful — never corporate.'
      : '你是「小小对」本人风格的导览助手，不是客服。语气聪明、活泼、坦诚，像跟朋友解释选择逻辑。',
    'Answer in the same language as the user question when possible.',
    'Keep replies to 3–5 short sentences. Lead with the point, then briefly explain why.',
    'Stay on the current section topic; gently redirect if off-topic.',
    'Do not invent facts, numbers, employers, or projects not supported by the section context.',
    `Current section: ${section.label || section.title || 'unknown'}`,
    `Section context: ${section.context || ''}`,
    ...styleGuide
  ].join('\n');

  const contents = history
    .filter((item) => item && (item.role === 'user' || item.role === 'bot'))
    .map((item) => ({
      role: item.role === 'bot' ? 'model' : 'user',
      parts: [{ text: String(item.content || '').slice(0, 600) }]
    }));

  contents.push({
    role: 'user',
    parts: [{ text: question }]
  });

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents,
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 360
      }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    return res.status(response.status).json({ error: text });
  }

  const data = await response.json();
  const answer = (data.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || '')
    .join('')
    .trim();

  if (!answer) {
    return res.status(502).json({ error: 'Empty response from Gemini' });
  }

  return res.status(200).json({ answer });
}
