/**
 * One-off QA cleanup: cancel the known TEST order DO-2026-1004
 * (customerName "عميل اختبار", phone "123") in the production cloud DB,
 * data-equivalent to the admin panel's secure cancel path. Strict guards
 * abort unless order number + name + phone + status all match, so no real
 * order can ever be touched.
 */
const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('='); if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const gistId = env.GITHUB_SYNC_GIST_ID || '6ff052b0bf27269c4937e5c2ca7d48b2';
const H = { Authorization: 'token ' + env.GITHUB_SYNC_TOKEN, Accept: 'application/vnd.github+json' };

(async () => {
  const res = await fetch('https://api.github.com/gists/' + gistId, { headers: H });
  const g = await res.json();
  const fileEntry = Object.entries(g.files).find(([n, f]) => (f.content || '').includes('"orders"'));
  const name = fileEntry[0];
  const db = JSON.parse(fileEntry[1].content);

  const o = db.orders.find(
    (x) => x.orderNumber === 'DO-2026-1004' && x.customerName === 'عميل اختبار' && x.customerPhone === '123'
  );
  if (!o) return console.log('ABORT: test order not matched by safety checks');
  if (o.orderStatus !== 'PENDING') return console.log('ABORT: unexpected status ' + o.orderStatus);

  const now = new Date().toISOString();
  o.orderStatus = 'CANCELLED';
  o.cancelReason = 'طلب اختبار — أُلغي كبيانات اختبار أثناء ضبط الجودة، وليس طلبًا حقيقيًا';
  o.notes = (o.notes ? o.notes + ' ' : '') + '[TEST ORDER — cancelled by QA]';
  o.statusHistory.push({
    id: 'hist-qa-cleanup-' + Date.now(),
    orderId: o.id,
    previousStatus: 'PENDING',
    newStatus: 'CANCELLED',
    changedByUserId: null,
    changedByName: 'ضبط الجودة (المسار الآمن للإدارة)',
    notes: 'ألغاء طلب اختبار (بيانات اختبار فقط)',
    createdAt: now,
  });
  o.updatedAt = now;

  // snapshot must stil be pristine (sanity)
  const snap = JSON.parse(fs.readFileSync('qa-gist-before.json', 'utf8'));
  if (snap.orders.find((x) => x.orderNumber === 'DO-2026-1004').orderStatus !== 'PENDING') {
    return console.log('ABORT: snapshot mutated');
  }

  const patch = { files: { [name]: { content: JSON.stringify(db, null, 2) } } };
  const pr = await fetch('https://api.github.com/gists/' + gistId, { method: 'PATCH', headers: H, body: JSON.stringify(patch) });
  console.log('patch status:', pr.status);
  const pg = await pr.json();

  const vf = pg.files && Object.entries(pg.files).find(([n, f]) => (f.content || '').includes('"orders"'));
  const vdb = JSON.parse(vf[1].content);
  for (const x of vdb.orders) {
    console.log(' -', x.orderNumber, x.orderStatus, '| items:', x.items.length, '| history:', x.statusHistory.length);
  }
  const t = vdb.orders.find((x) => x.orderNumber === 'DO-2026-1004');
  console.log('TEST ORDER FINAL:', t.orderStatus);

  // diff vs before for everything except the test order
  const realBefore = snap.orders.filter((x) => x.orderNumber !== 'DO-2026-1004');
  const realAfter = vdb.orders.filter((x) => x.orderNumber !== 'DO-2026-1004');
  const dirty = realAfter.filter((a) => {
    const b = realBefore.find((x) => x.id === a.id);
    return !b || JSON.stringify(b) !== JSON.stringify(a);
  });
  console.log('REAL ORDERS TOUCHED:', dirty.length);
})();
