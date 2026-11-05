const P = 'https://dar-el-asal.vercel.app';
(async () => {
  const res = await fetch(P + '/admin', { redirect: 'manual' });
  console.log('admin unauth:', res.status, '->', res.headers.get('location'));
})();
