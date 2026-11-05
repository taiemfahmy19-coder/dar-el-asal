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
  // E: Arabic-digit phone + empty cart → phone must pass, error must be about the cart
  let r = await fetch(P + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mk({ customerPhone: '٠١٠١٢٣٤٥٦٧٨', items: [] })) });
  let t = await r.text();
  console.log('E ar-digits + empty cart:', r.status, t.slice(0, 160));

  // F: valid phone, unsupported governorate — must 400
  r = await fetch(P + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mk({ customerPhone: '01012345678', governorate: 'القاهرة' })) });
  t = await r.text();
  console.log('F CAIRO govt:')
  console.log(r.status, t.slice(0, 160));

  // G: past delivery date — must 400
  r = await fetch(P + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mk({ customerPhone: '01012345678', deliveryDate: '2026-10-31' })) });
  t = await r.text();
  console.log('G past date: '.trim());
  console.log(r.status, t.slice(0, 160));
})();
