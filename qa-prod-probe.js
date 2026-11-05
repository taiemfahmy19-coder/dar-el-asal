const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('='); if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const P = 'https://dar-el-asal.vercel.app';
const body = {
  customerName: 'فحص برمجي ثانٍ',
  customerPhone: '966570207883',
  customerEmail: 'not-an-email@@',
  governorate: 'القاهرة',
  city: 'القاهرة',
  streetAddress: 'اختبار',
  deliveryDate: '2026-10-31',
  items: [{ productId: 'prod-honey-creamed-nuts', quantity: 1 }],
};
(async () => {
  // 1) POST with a fully-invalid payload (multiple violations)
  const res = await fetch(P + '/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log('multi-invalid POST:', res.status, text.slice(0, 300));

  // 2) probe deployed asset baily: which build? check build id marker in HTML
  const page = await fetch(P + '/auth/login?cb=' + Date.now(), { cache: 'no-store' });
  const html = await page.text();
  console.log('login has نسيت:', html.includes('نسيت كلمة المرور؟'));
  console.log('login HTML bytes:', html.length);
})();
