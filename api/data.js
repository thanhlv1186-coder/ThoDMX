const OWNER = process.env.GH_OWNER || 'thanhlv1186-coder';
const REPO  = process.env.GH_REPO  || 'ThoDMX';
const BRANCH= process.env.GH_BRANCH|| 'main';
const PATH  = 'data.json';

export default async function handler(req, res) {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`;
    const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'thodmx' };
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    const r = await fetch(url, { headers });
    if (r.status === 404) { res.setHeader('Cache-Control','no-store'); return res.status(200).json({ store: {} }); }
    if (!r.ok) { return res.status(200).json({ store: {}, error: 'github ' + r.status }); }
    const j = await r.json();
    const content = Buffer.from(j.content, 'base64').toString('utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(JSON.parse(content));
  } catch (e) {
    return res.status(200).json({ store: {}, error: String(e) });
  }
}
