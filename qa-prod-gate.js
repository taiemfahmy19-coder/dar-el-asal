const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('='); if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const P = 'https://dar-el-asal.vercel.app';
const mk = (patch) => Object.assign({
  customerName: 'فحص واجهة برمجة',
  customerPhone: '123',
  customerEmail: 'qa-probe@example.com',
  governorate: 'الإسكندرية',
  city: 'سموحة',
  streetAddress: 'عنوان فحص رقم 3',
  deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
  items: [{ productId: 'prod-honey-creamed-nuts', quantity: 1 }],
}, patch);

(async () => {
  // A: phone '123' only — must 400
  let r = await fetch(P + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mk({})) });
  let t = await r.text();
  console.log('A phone=123 :', r.status, t.slice(0, 200));

  // B: 10-digit phone — must 400
  r = await fetch(P + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mk({ customerPhone: '0101234567' })) });
  t = await r.text();
  console.log('B phone=10dig:', r.status, t.slice(0, 200));

  // C: bad email + otherwise fine — must 400
  r = await fetch(P + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mk({ customerPhone: '01012345678', customerEmail: 'nope@@x' })) });
  t = await r.text();
  console.log('C bad email  :', r.status, t.slice(0, 200));

  // D: empty cart — must 400
  r = await fetch(P + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mk({ customerPhone: '01012345678', customerEmail: 'qa-probe@example.com', items: [] })) });
  t = await r.text();
  console.log('D empty cart :', r.status, t.slice(0, 200));
})();
