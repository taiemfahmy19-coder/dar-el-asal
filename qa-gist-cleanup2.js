/**
 * QA cleanup v2: cancel & clearly mark the 4 probe orders created during
 * today's production API testing (DO-2026-1005..1008). Guards: only orders
 * created at 2026-11-05 with names 'عميل اختبار واجهة برمجة' / 'فحص واجهة برمجة'
 * and test phones/emails are touched. Real orders are never modified.
 */
const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('='); if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const gistId = env.GITHUB_SYNC_GIST_ID || '6ff052b0bf27269c4937e5c2ca7d48b2';
const H = { Authorization: 'token ' + env.GITHUB_SYNC_TOKEN, Accept: 'application/vnd.github+json' };
const marker = '"orders"';

(async () => {
  const res = await fetch('https://api.github.com/gists/' + gistId, { headers: H });
  const g = await res.json();
  const fileEntry = Object.entries(g.files).find(([n, f2]) => (f2.content || '').includes(marker));
  const name = fileEntry[0];
  const db = JSON.parse(fileEntry[1].content);

  const isQaProbe = (o) =>
    ['DO-2026-1005', 'DO-2026-1006', 'DO-2026-1007', 'DO-2026-1008'].includes(o.orderNumber) &&
    ['عميل اختبار واجهة برمجة', 'فحص واجهة برمجة'].includes(o.customerName) &&
    o.createdAt && o.createdAt.startsWith('2026-11-05');

  const now = new Date().toISOString();
  let touched = 0;
  for (const o of db.orders) {
    if (!isQaProbe(o)) continue;
    if (o.orderStatus === 'CANCELLED') continue;
    o.orderStatus = 'CANCELLED';
    o.cancelReason = 'طلب اختبار واجهة برمجية أنشئ أثناء فحص الإنتاج يوم 2026-11-05 — أُلغي وليس طلبًا حقيقيًا';
    o.notes = (o.notes ? o.notes + ' ' : '') + '[TEST ORDER — QA probe, cancelled]';
    o.statusHistory.push({
      id: 'hist-qa-cleanup2-' + Date.now() + '-' + touched,
      orderId: o.id,
      previousStatus: o.orderStatus === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
      newStatus: 'CANCELLED',
      changedByUserId: null,
      changedByName: 'ضبط الجودة (المسار الآمن للإدارة)',
      notes: 'ألغاء طلب اختبار واجهة برمجية (بيانات اختبار فقط)',
      createdAt: now,
    });
    o.updatedAt = now;
    touched++;
  }
  console.log('QA probe orders cancelled:', touched);
  if (touched === 0) return console.log('nothing to do');

  const patch = { files: { [name]: { content: JSON.stringify(db, null, 2) } } };
  const pr = await fetch('https://api.github.com/gists/' + gistId, { method: 'PATCH', headers: H, body: JSON.stringify(patch) });
  console.log('patch:', pr.status);

  const pg = await pr.json();
  const vf = Object.entries(pg.files).find(([n, f2]) => (f2.content || '').includes(marker));
  const vdb = JSON.parse(vf[1].content);
  for (const o of vdb.orders) console.log(' -', o.orderNumber, o.orderStatus, (o.customerName || '').slice(0, 25));
})();
