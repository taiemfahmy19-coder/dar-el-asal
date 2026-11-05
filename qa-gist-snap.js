const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('.env.local','utf8').split(/\r?\n/)) {
  const i = line.indexOf('='); if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0,i).trim()] = line.slice(i+1).trim();
}
const gistId = env.GITHUB_SYNC_GIST_ID || '6ff052b0bf27269c4937e5c2ca7d48b2';
const H = { Authorization: 'token ' + env.GITHUB_SYNC_TOKEN, Accept: 'application/vnd.github+json' };
(async () => {
  const res = await fetch('https://api.github.com/gists/' + gistId, { headers: H });
  const g = await res.json();
  const fileEntry = Object.entries(g.files).find(([n, f]) => (f.content || '').includes('"orders"'));
  const name = fileEntry[0];
  const db = JSON.parse(fileEntry[1].content);
  fs.writeFileSync('qa-gist-before.json', JSON.stringify(db));
  console.log('taken snapshot; orders:');
  for (const o of db.orders) console.log(' -', o.id, o.orderNumber, o.orderStatus, '| total:', o.totalAmount);
})();
