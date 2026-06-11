const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const PROVIDER_TIMEOUT_MS = 10_000;
const rateBuckets = new Map();

const DEFAULT_ALLOWED_HOSTS = [
  'duiduih.com',
  'www.duiduih.com',
  'localhost',
  '127.0.0.1'
];

function getAllowedHosts() {
  const extra = process.env.CHAT_ALLOWED_ORIGINS || '';
  const fromEnv = extra
    .split(',')
    .map((s) => normalizeAllowedHost(s.trim()))
    .filter(Boolean);
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

function providerError(providerName, reason, details = {}) {
  const error = new Error(reason);
  error.providerName = providerName;
  Object.assign(error, details);
  return error;
}

function summarizeProviderError(error) {
  if (!error) return 'unknown error';
  const parts = [];
  if (error.status) parts.push(`status=${error.status}`);
  if (error.code) parts.push(`code=${error.code}`);
  if (error.reason) parts.push(`reason=${error.reason}`);
  if (error.message) parts.push(`message=${String(error.message).slice(0, 180)}`);
  return parts.join(' ') || 'unknown error';
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function readProviderError(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    const data = JSON.parse(text);
    return {
      code: data.error?.code || data.code,
      reason: data.error?.status || data.error?.type || data.error?.message || data.message
    };
  } catch {
    return {
      reason: text.slice(0, 180)
    };
  }
}

function extractGeminiAnswer(data) {
  return (data.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || '')
    .join('')
    .trim();
}

async function callGeminiProvider({
  apiKey,
  model,
  systemInstruction,
  contents,
  temperature,
  maxTokens,
  timeoutMs
}) {
  const providerName = 'Gemini';
  if (!apiKey) throw providerError(providerName, 'GEMINI_API_KEY is not configured');
  if (!model) throw providerError(providerName, 'GEMINI_MODEL is not configured');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  let response;
  try {
    response = await fetchWithTimeout(url, {
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
          temperature,
          maxOutputTokens: maxTokens
        }
      })
    }, timeoutMs);
  } catch (error) {
    throw providerError(providerName, error.name === 'AbortError' ? 'request timed out' : 'network error');
  }

  if (!response.ok) {
    const details = await readProviderError(response);
    throw providerError(providerName, 'non-OK response', {
      status: response.status,
      code: details.code,
      reason: details.reason
    });
  }

  const data = await response.json();
  const answer = extractGeminiAnswer(data);
  if (!answer) throw providerError(providerName, 'empty response');
  return answer;
}

function buildOpenAICompatibleMessages(systemInstruction, history, question) {
  const messages = [
    { role: 'system', content: systemInstruction }
  ];

  history
    .filter((item) => item && (item.role === 'user' || item.role === 'bot'))
    .slice(-8)
    .forEach((item) => {
      messages.push({
        role: item.role === 'bot' ? 'assistant' : 'user',
        content: String(item.content || '').slice(0, 600)
      });
    });

  messages.push({ role: 'user', content: question });
  return messages;
}

async function callOpenAICompatibleProvider({
  providerName,
  apiKey,
  baseUrl,
  model,
  messages,
  temperature,
  maxTokens,
  timeoutMs
}) {
  if (!apiKey) throw providerError(providerName, `${providerName} API key is not configured`);
  if (!model) throw providerError(providerName, `${providerName} model is not configured`);

  const url = `${(baseUrl || '').replace(/\/$/, '')}/chat/completions`;
  let response;
  try {
    response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    }, timeoutMs);
  } catch (error) {
    throw providerError(providerName, error.name === 'AbortError' ? 'request timed out' : 'network error');
  }

  if (!response.ok) {
    const details = await readProviderError(response);
    throw providerError(providerName, 'non-OK response', {
      status: response.status,
      code: details.code,
      reason: details.reason
    });
  }

  const data = await response.json();
  const answer = String(data.choices?.[0]?.message?.content || '').trim();
  if (!answer) throw providerError(providerName, 'empty response');
  return answer;
}

function buildDefaultAnswer({ question, section, lang }) {
  const sectionTitle = section.label || section.title || (lang === 'en' ? 'this section' : '这一页');
  const sectionContext = String(section.context || '').trim().replace(/[。.!！?？]+$/, '');

  if (lang === 'en') {
    if (!sectionContext) {
      return `I cannot connect to the language model right now, so here is a default reply: your question "${question}" relates to "${sectionTitle}". Please try again later for a fuller model-generated answer.`;
    }
    return `I cannot connect to the language model right now, so here is a default reply: based on this section, your question "${question}" relates to "${sectionTitle}". The available context is: ${sectionContext}. Please try again later for a fuller model-generated answer.`;
  }

  if (!sectionContext) {
    return `我暂时连接不上大语言模型，以下是默认回复：你问「${question}」，可以先从这一页的主题「${sectionTitle}」理解。如果你愿意，可以稍后再试一次，我会在模型恢复后给出更完整的回答。`;
  }
  return `我暂时连接不上大语言模型，以下是默认回复：我先按这一页已有的信息回答你。你问「${question}」，可以先从这一页的主题「${sectionTitle}」理解：${sectionContext}。如果你愿意，可以稍后再试一次，我会在模型恢复后给出更完整的回答。`;
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

  const temperature = 0.75;
  const maxTokens = 360;
  const messages = buildOpenAICompatibleMessages(systemInstruction, history, question);
  const providers = [
    {
      name: 'Gemini',
      call: () => callGeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        systemInstruction,
        contents,
        temperature,
        maxTokens,
        timeoutMs: PROVIDER_TIMEOUT_MS
      })
    },
    {
      name: 'Ark',
      call: () => callOpenAICompatibleProvider({
        providerName: 'Ark',
        apiKey: process.env.ARK_API_KEY,
        baseUrl: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
        model: process.env.ARK_MODEL,
        messages,
        temperature,
        maxTokens,
        timeoutMs: PROVIDER_TIMEOUT_MS
      })
    },
    {
      name: 'SiliconFlow',
      call: () => callOpenAICompatibleProvider({
        providerName: 'SiliconFlow',
        apiKey: process.env.SILICONFLOW_API_KEY,
        baseUrl: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.com/v1',
        model: process.env.SILICONFLOW_MODEL,
        messages,
        temperature,
        maxTokens,
        timeoutMs: PROVIDER_TIMEOUT_MS
      })
    }
  ];

  for (const provider of providers) {
    try {
      const answer = await provider.call();
      console.log(`[api/chat] provider succeeded: ${provider.name}`);
      return res.status(200).json({ answer });
    } catch (error) {
      console.warn(`[api/chat] provider failed: ${provider.name} ${summarizeProviderError(error)}`);
    }
  }

  console.warn('[api/chat] all providers failed; returning default answer');
  return res.status(200).json({
    answer: buildDefaultAnswer({ question, section, lang: body.lang }),
    fallback: true
  });
}
