const fs = require('fs').promises;
const path = require('path');
const fetch = global.fetch || require('node-fetch');

const TOKENS_FILE = path.join(process.cwd(), 'vercel', 'data', 'tokens.json');

async function getAllTokens() {
  try {
    const raw = await fs.readFile(TOKENS_FILE, 'utf8');
    return JSON.parse(raw || '[]').map(t => t.token);
  } catch (e) {
    return [];
  }
}

async function getHuaweiAccessToken() {
  const clientId = process.env.HUAWEI_CLIENT_ID;
  const clientSecret = process.env.HUAWEI_CLIENT_SECRET;
  const resp = await fetch('https://oauth-login.cloud.huawei.com/oauth2/v3/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`
  });
  if (!resp.ok) throw new Error('Failed to get Huawei access token: ' + resp.status);
  const json = await resp.json();
  return json.access_token;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { title, body, tokens } = req.body || {};
  if (!title && !body) return res.status(400).json({ error: 'title or body required' });

  try {
    const targetTokens = Array.isArray(tokens) && tokens.length ? tokens : await getAllTokens();
    if (!targetTokens.length) return res.status(400).json({ error: 'no tokens to send' });

    const accessToken = await getHuaweiAccessToken();
    const appId = process.env.HUAWEI_APP_ID;

    const payload = {
      validate_only: false,
      message: {
        notification: { title: title || '', body: body || '' },
        android: {
          notification: { title: title || '', body: body || '' }
        },
        token: targetTokens
      }
    };

    const pushResp = await fetch(`https://push-api.cloud.huawei.com/v1/${appId}/messages:send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    const result = await pushResp.json();
    return res.json({ ok: true, result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'send failed' });
  }
};
