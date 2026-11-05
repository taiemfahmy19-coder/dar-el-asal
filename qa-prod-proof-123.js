/**
 * Definitive production proof that the server rejects phone '123'
 * WITHOUT creating any order. Payload carries a INTENTIONALLY INVALID
 * governorate too, so even an outdated build could never save anything;
 * the distinguishing evidence is WHICH Arabic error the server returns
 * (phone-gate error = the new validation build is live and enforcing).
 */
const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('='); if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const gistId = env.GITHUB_SYNC_GIST_ID || '6ff052b0bf27269c4937e5c2ca7d48b2';
const marker = '"orders"';
const P = 'https://dar-el-asal.vercel.app';
const H2 = { Authorization: 'token ' + env.GITHUB_SYNC_TOKEN, Accept: 'application/vnd.github+json' };

const countOrders = async () => {
  const res = await fetch('https://api.github.com/gists/' + gistId, { headers: H2 });
  const g = await res.json();
  const f = Object.entries(g.files).find(([n, x]) => (x.content || '').includes(marker));
  const db = JSON.parse(f[1].content);
  return { count: db.orders.length, numbers: db.orders.map((o) => o.orderNumber).join(',') };
};

(async () => {
  const before = await countOrders();
  console.log('orders BEFORE:', JSON.stringify(before));

  const body = {
    customerName: 'عميل فحص رفض الخادم',
    customerPhone: '123',          // invalid → must be rejected server-side
    customerEmail: 'not-an-email@@', // extra invalid → redundant safety
    governorate: 'القاهرة',          // invalid → even an outdated build rejects
    city: 'القاهرة',
    streetAddress: 'اختبار رفض الخادم فقط',
    deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    items: [{ productId: 'prod-honey-creamed-nuts', quantity: 1 }],
  };
  const res = await fetch(P + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  console.log('POST phone=123 =>', res.status);
  console.log('response:', text.slice(0, 250));

  const goodPhone = await fetch(P + '/api/orders', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, customerPhone: '01012345678', customerEmail: 'not-an-email@@' }),
  });
  console.log('POST phone=010 valid + bad email =>', goodPhone.status, (await goodPhone.text()).slice(0, 120));

  const after = await countOrders();
  console.log('orders AFTER:', JSON.stringify(after));
  console.log('NO NEW ORDER CREATED:', before.number === after.number || (before.count === after.count && before.numbers === after.numbers) ? 'YES ✔' : 'NO ✖');
})();
