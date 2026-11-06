/**
 * Production logout-safety proof: hit POST /api/auth/logout (the exact path
 * whose stale push wiped the DB on 2026-11-05) and prove the cloud order set
 * is untouched before/after. Anonymous request first (no cookie), which is the
 * only safe variant without real credentials; the pull-before-push fix covers
 * authenticated logouts too (covered by unit tests).
 */
const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('='); if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const gistId = env.GITHUB_SYNC_GIST_ID;
const H = { Authorization: 'token ' + env.GITHUB_SYNC_TOKEN, Accept: 'application/vnd.github+json' };

const orders = async () => {
  const g = await (await fetch('https://api.github.com/gists/' + gistId, { headers: H })).json();
  const f = Object.values(g.files).find((x) => x.filename === 'db.json');
  const db = JSON.parse(f.content.replace(/^\uFEFF/, ''));
  return { count: db.orders.length, nums: db.orders.map((o) => o.orderNumber).join(',') };
};

(async () => {
  const before = await orders();
  console.log('orders BEFORE anon-logout POST:', JSON.stringify(before));
  const res = await fetch('https://dar-el-asal.vercel.app/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  console.log('POST /api/auth/logout =>', res.status, (await res.text()).slice(0, 80));
  const after = await orders();
  console.log('orders AFTER anon-logout POST:', JSON.stringify(after));
  const ok = before.count === 8 && after.count === 8 && before.nums === after.nums;
  console.log('LOGOUT PATH IS DESTROY-SAFE:', ok ? 'YES ✔' : 'NO ✖');
})().catch((e) => { console.error('EXCEPTION:', e.message); process.exit(1); });
