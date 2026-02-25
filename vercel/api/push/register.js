const fs = require('fs').promises;
const path = require('path');

const TOKENS_FILE = path.join(process.cwd(), 'vercel', 'data', 'tokens.json');

async function readTokens() {
  try {
    const raw = await fs.readFile(TOKENS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

async function writeTokens(tokens) {
  await fs.mkdir(path.dirname(TOKENS_FILE), { recursive: true });
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf8');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, platform } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token required' });

  try {
    const tokens = await readTokens();
    if (!tokens.find(t => t.token === token)) tokens.push({ token, platform: platform || 'unknown', added: Date.now() });
    await writeTokens(tokens);
    return res.json({ ok: true, count: tokens.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to store token' });
  }
};
