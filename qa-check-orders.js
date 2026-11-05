const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('='); if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const gistId = env.GITHUB_SYNC_GIST_ID || '6ff052b0bf27269c4937e5c2ca7d48b2';
const marker = '"orders"';
(async () => {
  const res = await fetch('https://api.github.com/gists/' + gistId, { headers: { Authorization: 'token ' + env.GITHUB_SYNC_TOKEN, Accept: 'application/vnd.github+json' } });
  const g = await res.json();
  const f = Object.entries(g.files).find(([n, x]) => (x.content || '').includes(marker));
  const db = JSON.parse(f[1].content);
  for (const o of db.orders) console.log(' -', o.orderNumber, o.orderStatus, (o.customerName || '').slice(0, 25), '|', (o.customerPhone || '').slice(0, 14));
})();
