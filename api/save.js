const OWNER = process.env.GH_OWNER || 'thanhlv1186-coder';
const REPO  = process.env.GH_REPO  || 'ThoDMX';
const BRANCH= process.env.GH_BRANCH|| 'main';
const PATH  = 'data.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'Chưa cấu hình GITHUB_TOKEN trên Vercel' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const WRITE_KEY = process.env.WRITE_KEY || '';
    if (WRITE_KEY && String(body.key || '') !== WRITE_KEY) return res.status(401).json({ error: 'Sai mật khẩu (WRITE_KEY)' });
    const store = body.store || {};
    const contentStr = JSON.stringify({ store, updatedAt: new Date().toISOString() });
    const b64 = Buffer.from(contentStr, 'utf-8').toString('base64');
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'thodmx', 'Content-Type': 'application/json' };
    let sha;
    const g = await fetch(`${apiUrl}?ref=${BRANCH}`, { headers });
    if (g.ok) { const gj = await g.json(); sha = gj.sha; }
    const put = await fetch(apiUrl, { method: 'PUT', headers, body: JSON.stringify({ message: 'Cap nhat du lieu dashboard', content: b64, branch: BRANCH, sha }) });
    if (!put.ok) { const t = await put.text(); return res.status(500).json({ error: 'GitHub ' + put.status, detail: t.slice(0,300) }); }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
