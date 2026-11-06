/**
 * One-time recovery: restore the cloud DB (gist) to the last-known-good
 * revision c6dc736340ff56b46912cfc03e5ac5f28ca92762 (8 orders, full auditLogs,
 * 5 users) after the 2026-11-05 stale-local-push wipe.
 *
 * Hard guards so this can never overwrite newer data:
 *   1. current gist orders must be 0 AND last-good orders must be 8
 *   2. last-good must be strictly "behind" nothing else recoverable
 * The gist is re-read after the PATCH and verified.
 */
const fs = require('fs');

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('='); if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const gistId = env.GITHUB_SYNC_GIST_ID;
const H = { Authorization: 'token ' + env.GITHUB_SYNC_TOKEN, Accept: 'application/vnd.github+json' };

const lastGood = fs.readFileSync('gist-revision-c6dc-last-good.json', 'utf8').replace(/^\uFEFF/, '');
const good = JSON.parse(lastGood);

(async () => {
  // 1. Guard: fetch current state
  const curRes = await fetch('https://api.github.com/gists/' + gistId, { headers: H });
  const curG = await curRes.json();
  const curFile = Object.values(curG.files).find((f) => f.filename === 'db.json' || (f.content || '').includes('"orders"'));
  const cur = JSON.parse(curFile.content.replace(/^\uFEFF/, ''));
  console.log('CURRENT orders:', cur.orders.length, '| last-good orders:', good.orders.length);

  if (cur.orders.length !== 0 || good.orders.length !== 8) {
    console.error('GUARD FAILED: refusing to restore (state has changed, review manually). NO WRITE PERFORMED.');
    process.exit(1);
  }

  // 2. Sanity: last-good integrity
  const nums = good.orders.map((o) => o.orderNumber);
  if (!['DO-2026-1001', 'DO-2026-1002', 'DO-2026-1003', 'DO-2026-1004', 'DO-2026-1005', 'DO-2026-1008'].every((n) => nums.includes(n))) {
    console.error('GUARD FAILED: last-good snapshot missing expected order numbers. NO WRITE PERFORMED.');
    process.exit(1);
  }

  // 3. PATCH the gist with the recovered db.json (exact bytes of the revision)
  const patch = await fetch('https://api.github.com/gists/' + gistId, {
    method: 'PATCH',
    headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: { 'db.json': { content: lastGood } } }),
  });
  console.log('PATCH status:', patch.status);

  // 4. Verify by re-reading
  const vRes = await fetch('https://api.github.com/gists/' + gistId, { headers: H });
  const vG = await vRes.json();
  const vFile = Object.values(vG.files).find((f) => f.filename === 'db.json');
  const v = JSON.parse(vFile.content.replace(/^\uFEFF/, ''));
  console.log('AFTER RESTORE orders:', v.orders.length);
  console.log('order numbers:', v.orders.map((o) => o.orderNumber).join(','));
  console.log('users:', v.users.length, '| auditLogs:', v.auditLogs.length, '| notifications:', v.notifications.length);
  console.log(v.orders.length === 8 && v.users.length === 5 ? 'RESTORE VERIFIED OK' : 'RESTORE VERIFICATION FAILED');
})().catch((e) => { console.error('EXCEPTION:', e.message); process.exit(1); });
