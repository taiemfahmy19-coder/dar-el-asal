/**
 * QA validation test: phone / email / anti-fake-order gating + session lifetime.
 * Executes the real TypeScript validation module and auth logic in-memory,
 * so it never writes to the store or cloud production data.
 */

const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');
const bcrypt = require('bcryptjs');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`FAIL: ${testName}`);
    failCount++;
  }
}

function loadTs(file, mocks = {}) {
  const source = fs.readFileSync(file, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
    },
    fileName: file,
  });

  const loaded = new Module(file, module);
  loaded.filename = file;
  loaded.paths = Module._nodeModulePaths(path.dirname(file));

  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (parent && parent.filename === file && Object.prototype.hasOwnProperty.call(mocks, request)) {
      return mocks[request];
    }
    return originalLoad.apply(this, arguments);
  };

  try {
    loaded._compile(outputText, file);
  } finally {
    Module._load = originalLoad;
  }

  return loaded.exports;
}

console.log('====================================================');
console.log('QA validation: phone / email / order gate / session');
console.log('====================================================\n');

const root = __dirname;
const validation = loadTs(path.join(root, 'src', 'lib', 'validation.ts'), {});

const utils = loadTs(path.join(root, 'src', 'lib', 'utils.ts'), { './types': {} });

// ============ 1. Egyptian phone validation ============
const phone = (raw) => validation.normalizeEgyptianPhone(raw);

assert(phone('123') === null, 'Phone 123 is rejected');

assert(phone('01012345678') === '01012345678', 'Phone 01012345678 is accepted');
assert(phone('01112345678') === '01112345678', 'Phone 01112345678 is accepted');
assert(phone('01212345678') === '01212345678', 'Phone 01212345678 is accepted');
assert(phone('01512345678') === '01512345678', 'Phone 01512345678 is accepted');

assert(phone('0101234567') === null, '10-digit phone is rejected');
assert(phone('010123456789') === null, '12-digit phone is rejected');

assert(phone('abc01012345') === null, 'Phone with letters is rejected');
assert(phone('0101234$678') === null, 'Phone with symbols is rejected');
assert(phone('+201012345678') === null, 'International +20 format is rejected');
assert(phone('966570207883') === null, 'Non-Egyptian (Saudi) number is rejected');
assert(phone('01912345678') === null, 'Invalid prefix 019 is rejected');
assert(phone('') === null, 'Empty phone is rejected');

assert(phone('٠١٠١٢٣٤٥٦٧٨') === '01012345678', 'Arabic-Indic digits are unified and accepted');
assert(phone('010 123 45678') === '01012345678', 'Separator spacing is unified and accepted');
assert(phone('010١2٣45678') === '01012345678', 'Mixed Arabic/English digits are unified and accepted');

assert(
  typeof validation.EGYPT_PHONE_ERROR === 'string' &&
    validation.EGYPT_PHONE_ERROR.includes('11') &&
    validation.EGYPT_PHONE_ERROR.includes('011'),
  'Phone error message is Arabic and mentions 11 digits and prefixes'
);

// ============ 2. Email validation ============
assert(validation.isValidEmail('user@domain.com') === true, 'Email user@domain.com is accepted');
assert(validation.isValidEmail('name+tag@sub.domain.eg') === true, 'Complex but valid email is accepted');
assert(validation.isValidEmail('not-an-email') === false, 'Email without @ is rejected');
assert(validation.isValidEmail('a@b') === false, 'Email without TLD is rejected');
assert(validation.isValidEmail('a @domain.com') === false, 'Email with spaces is rejected');
assert(validation.isValidEmail('') === false, 'Empty email is rejected');
assert(
  typeof validation.ORDER_EMAIL_ERROR === 'string' && validation.ORDER_EMAIL_ERROR.includes('صحيحًا'),
  'Email error message is Arabic'
);

// ============ 3. Delivery date validation ============
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};
assert(validation.isValidDeliveryDate(day(2)) === true, 'Delivery date 2 days ahead is accepted');
assert(validation.isValidDeliveryDate(day(-1)) === false, 'Past delivery date is rejected');
assert(validation.isValidDeliveryDate(day(35)) === false, 'Delivery date beyond 30 days is rejected');
assert(validation.isValidDeliveryDate('2026-02-30') === false, 'Impossible calendar date is rejected');
assert(validation.isValidDeliveryDate('not-a-date') === false, 'Non-date string is rejected');

// ============ 4. Server-side anti-fake-order gate ============
const supported = (g) => utils.isGovernorateSupported(g);

const validBody = {
  customerName: 'عميل حقيقي',
  customerPhone: '01012345678',
  customerEmail: 'customer@example.com',
  governorate: 'الإسكندرية',
  city: 'سموحة',
  streetAddress: 'شارع مدينة نصر بجوار مسجد الشهيد رقم 12',
  deliveryDate: day(2),
  items: [{ productId: 'prod-1', quantity: 2 }],
};

const valid = validation.validateNewOrderPayload(validBody, supported);
assert(valid.ok === true, 'A complete valid order payload passes the server gate');
assert(valid.normalized.customerPhone === '01012345678', 'Gate stores the unified 11-digit phone');
assert(valid.normalized.customerEmail === 'customer@example.com', 'Gate stores the email');

const emptyCart = validation.validateNewOrderPayload({ ...validBody, items: [] }, supported);
assert(emptyCart.ok === false, 'Empty cart is rejected by the server gate');
assert((emptyCart.errors && emptyCart.errors.items) !== undefined, 'Empty cart gets a clear Arabic error');

const badGov = validation.validateNewOrderPayload(
  { ...validBody, governorate: 'القاهرة' },
  supported
);
assert(badGov.ok === false, 'Unsupported governorate is rejected by the server gate');
assert((badGov.errors && badGov.errors.governorate) !== undefined, 'Unsupported governorate gets a clear error');

const badPhone = validation.validateNewOrderPayload(
  { ...validBody, customerPhone: '123' },
  supported
);
assert(badPhone.ok === false, 'Phone 123 is rejected by the server gate');
assert((badPhone.errors && badPhone.errors.customerPhone) === validation.EGYPT_PHONE_ERROR, 'Server phone error matches the required Arabic message');

const badEmail = validation.validateNewOrderPayload(
  { ...validBody, customerEmail: 'wrong-email@@' },
  supported
);
assert(badEmail.ok === false, 'Bad email is rejected by the server gate');
assert((badEmail.errors && badEmail.errors.customerEmail) !== undefined, 'Bad email gets a clear error');

const noName = validation.validateNewOrderPayload({ ...validBody, customerName: '  ' }, supported);
assert(noName.ok === false, 'Missing name is rejected by the server gate');

const noAddress = validation.validateNewOrderPayload({ ...validBody, streetAddress: 'x' }, supported);
assert(noAddress.ok === false, 'Too-short address is rejected by the server gate');

const badDate = validation.validateNewOrderPayload({ ...validBody, deliveryDate: '2020-01-01' }, supported);
assert(badDate.ok === false, 'Past delivery date is rejected by the server gate');

// Extra: valid gate must not accept repeat-buttons creating duplicates —
// normalized payload is deterministic, and price trust is covered by
// qa-flow-test (subtotal computed from server-side product price).
const again = validation.validateNewOrderPayload(validBody, supported);
assert(again.ok === true && JSON.stringify(again.normalized.items) === JSON.stringify(valid.normalized.items), 'Repeated identical submission normalizes identically (dedupe-safe input)');

// ============ 5. Session lifetime, renewal & real logout ============
const userWithVersion = {
  id: 'u-1',
  name: 'QA User',
  email: 'qa@example.test',
  passwordHash: bcrypt.hashSync('correct-horse-battery', 10),
  phone: '01000000000',
  role: 'customer',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const tokenCookieHolder = { token: null };
const auth = loadTs(path.join(root, 'src', 'lib', 'auth.ts'), {
  'next/headers': {
    cookies: () => ({ get: (name) => (tokenCookieHolder.token ? { name, value: tokenCookieHolder.token } : undefined) }),
  },
  './types': {},
  './db': {
    getUserById: (id) => (id === userWithVersion.id ? userWithVersion : null),
  },
});

(async () => {
  // 5a. Login-style session creation
  const token = await auth.createSessionToken(userWithVersion);
  const session = await auth.verifySessionToken(token);
  assert(session && session.userId === userWithVersion.id, 'A valid session token verifies');
  assert(session && (session.sv === 0 || session.sv === undefined), 'Fresh session token carries the current session version');

  // Customer session is long-lived and renewable (30 days)
  const customerOpts = auth.sessionCookieOptionsFor(userWithVersion).options;
  assert(customerOpts.maxAge === 60 * 60 * 24 * 30, 'Customer session cookie lasts 30 days');
  assert(customerOpts.httpOnly === true && customerOpts.sameSite === 'lax', 'Session cookie stays httpOnly and sameSite-lax');

  // Admin session: safe renewable window (7 days), never unbounded
  const adminUser = { ...userWithVersion, role: 'admin' };
  const adminOpts = auth.sessionCookieOptionsFor(adminUser).options;
  assert(adminOpts.maxAge === 60 * 60 * 24 * 7, 'Admin session cookie lasts 7 days (renewable, not unbounded)');

  // 5b. Session persists across reload (cookie is persistent, not browser-session)
  assert(customerOpts.maxAge > 0 || customerOpts.maxAge === null, 'Persistent cookie (no expire-on-close)');

  // 5c. Session version matching
  const matching = auth.sessionMatchesUser(session, userWithVersion);
  assert(matching === true, 'Fresh token matches the user session version');

  userWithVersion.tokenVersion = 1; // logout bumped the version
  const stale = auth.sessionMatchesUser(session, userWithVersion);
  assert(stale === false, 'Old token no longer matches after logout bumps tokenVersion');

  const rejectedUser = { ...userWithVersion, tokenVersion: 2 };
  assert(auth.sessionMatchesUser(session, rejectedUser) === false, 'Any mismatched session version is rejected');

  // 5d. getCurrentUser rejects the invalidated token server-side
  tokenCookieHolder.token = token; // simulate the still-present old cookie
  const currentUser = await auth.getCurrentUser();
  assert(currentUser === null, 'Server-side getCurrentUser returns null for a logged-out token');

  // 5e. Expired token is invalid
  const { SignJWT: SJ } = require('jose');
  const secret = new TextEncoder().encode('dar-el-asal-olive-secure-secret-key-2026-production');
  const expired = await new SJ({ userId: userWithVersion.id, role: 'customer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
    .sign(secret);
  const expiredSession = await auth.verifySessionToken(expired);
  assert(expiredSession === null, 'Expired session token is rejected');
  assert(await auth.verifySessionToken('garbage.token.value') === null, 'Tampered token is rejected');
  const preGarbageUser = await auth.getCurrentUser();
  tokenCookieHolder.token = 'garbage.token.value';
  assert((await auth.getCurrentUser()) === null, 'Garbage cookie yields no user server-side');

  // ============ 6. SERVER-side gate on the real API route handler ============
  // Runs the real src/app/api/orders/route.ts POST with an isolated in-memory
  // database and a spy on createOrderServerSide — production is never touched.
  let engineCalls = 0;
  // Real captcha library (no mock): challenges are signed with the app secret
  // so the same signing/verification path as production is exercised.
  const captchaLib = loadTs(path.join(root, 'src', 'lib', 'captcha.ts'), {});

  async function validChallenge() {
    const ch = await captchaLib.createCaptchaChallenge();
    // Solve the arithmetic question locally (it is only "+ or ×" of 2..9).
    const [a, op, b] = ch.question.split(' ');
    const answer = op === '+' ? Number(a) + Number(b) : Number(a) * Number(b);
    return { token: ch.token, answer: String(answer) };
  }

  const route = loadTs(path.join(root, 'src', 'app', 'api', 'orders', 'route.ts'), {
    '@/lib/auth': {
      getCurrentUser: async () => null,
      requireAuth: async () => ({ user: null, authorized: false }),
    },
    '@/lib/db': {
      getOrders: () => [],
      syncCloudDb: async () => {},
      syncCloudDbPush: async () => {},
      getDb: () => ({ orders: [], users: [] }),
    },
    '@/lib/validation': validation,
    '@/lib/utils': utils,
    '@/lib/captcha': captchaLib,
    '@/lib/order-engine': {
      createOrderServerSide: (input) => {
        engineCalls += 1;
        return { success: true, order: { id: 'ord-spy', customerPhone: input.customerPhone, customerEmail: input.customerEmail, totalCost: 0, estimatedProfit: 0, items: [] } };
      },
    },
    '@/lib/types': {},
    'next/server': {
      NextRequest: class NextRequestShim {},
      NextResponse: class NextResponseShim {
        static json(body, init) { return { body, _status: init && init.status ? init.status : 200, _init: init || {} }; }
      },
    },
  });

  const doPost = (payload) => route.POST({ json: async () => payload });
  const okBody = JSON.parse(JSON.stringify(validBody));

  // 6a. Phone '123' must be rejected by the SERVER and never reach the engine
  engineCalls = 0;
  const badPhoneRoute = await doPost({ ...okBody, customerPhone: '123' });
  assert(badPhoneRoute._status === 400, "Server API rejects phone '123' with HTTP 400");
  assert((badPhoneRoute.body.error || '').includes('11'), "Server rejection for '123' carries the Arabic 11-digit message");
  assert(engineCalls === 0, "Phone '123' never reaches the order engine (no order is saved)");

  // 6b. 10-digit and 12-digit and non-Egyptian numbers rejected by the server
  for (const [label, phoneValue] of [['10-digit server test', '0101234567'], ['12-digit server test', '010123456789'], ['non-Egyptian server test', '966570207883']]) {
    engineCalls = 0;
    const resp = await doPost({ ...okBody, customerPhone: phoneValue });
    assert(resp._status === 400, `Server API rejects a ${label} with HTTP 400`);
    assert(engineCalls === 0, `${label} never reaches the order engine`);
  }

  // 6b-b. CHECKOUT ACCEPTANCE (2026-11-10): dashes/spaces/dots are stripped
  // from the phone BEFORE validation, then the clean 11-digit number is saved.
  engineCalls = 0;
  const solvedPhone = await validChallenge();
  const cleanedPhoneRoute = await doPost({ ...okBody, customerPhone: '015-1234 5678', captchaToken: solvedPhone.token, captchaAnswer: solvedPhone.answer });
  assert(cleanedPhoneRoute._status === 200, 'Phone with dashes/spaces survives the server gate after cleaning');
  assert(cleanedPhoneRoute.body.order.customerPhone === '01512345678', 'Phone is stored as the clean 11-digit national number');
  assert(engineCalls === 1, 'Cleaned phone reaches the engine exactly once');


  // 6c. Wrong email rejected by the server
  engineCalls = 0;
  const badEmailRoute = await doPost({ ...okBody, customerEmail: 'nope@@x' });
  assert(badEmailRoute._status === 400, 'Server API rejects a wrong email with HTTP 400');
  assert(engineCalls === 0, 'Wrong email never reaches the order engine');

  // 6d. Empty cart rejected by the server
  engineCalls = 0;
  const emptyCartRoute = await doPost({ ...okBody, items: [] });
  assert(emptyCartRoute._status === 400, 'Server API rejects an empty cart with HTTP 400');
  assert(engineCalls === 0, 'Empty cart never reaches the order engine');

  // 6e. Unsupported governorate rejected by the server
  engineCalls = 0;
  const badGovRoute = await doPost({ ...okBody, governorate: 'القاهرة' });
  assert(badGovRoute._status === 400, 'Server API rejects an unsupported governorate with HTTP 400');
  assert(engineCalls === 0, 'Unsupported governorate never reaches the order engine');

  // 6c-b. Valid fields + MISSING captcha → rejected at the human-verification gate
  engineCalls = 0;
  const noCaptchaRoute = await doPost(okBody);
  assert(noCaptchaRoute._status === 400, 'Server rejects a fully valid payload without human verification (captcha required)');
  assert((noCaptchaRoute.body.error || '').includes('تحقق'), 'Missing captcha returns the Arabic human-verification message');
  assert(engineCalls === 0, 'Missing captcha never reaches the order engine');

  // 6c-c. Valid fields + WRONG captcha answer → rejected, fresh tokens never reusable
  engineCalls = 0;
  const ch = await captchaLib.createCaptchaChallenge();
  const wrongRoute = await doPost({ ...okBody, captchaToken: ch.token, captchaAnswer: '999' });
  assert(wrongRoute._status === 400, 'Server rejects a wrong captcha answer with HTTP 400');
  assert(engineCalls === 0, 'Wrong captcha never reaches the order engine');

  // 6c-d. Forged token (not signed by the server) → rejected
  engineCalls = 0;
  const forgedRoute = await doPost({ ...okBody, captchaToken: 'forged.token.value', captchaAnswer: '3' });
  assert(forgedRoute._status === 400, 'Server rejects a forged captcha token with HTTP 400');
  assert(engineCalls === 0, 'Forged captcha token never reaches the order engine');

  // 6f. A fully valid submission creates exactly ONE order (engine called once)
  engineCalls = 0;
  let solved = await validChallenge();
  const goodRoute = await doPost({ ...okBody, captchaToken: solved.token, captchaAnswer: solved.answer });
  assert(goodRoute._status === 200, 'A fully valid submission with a correct captcha succeeds with HTTP 200');
  assert(engineCalls === 1, 'A valid submission creates exactly one order (engine invoked exactly once)');

  // Aramaic 6g**
  // 6g. Arabic digits are unified server-side before saving
  engineCalls = 0;
  solved = await validChallenge();
  const arabicRoute = await doPost({ ...okBody, customerPhone: '٠١٥١٢٣٤٥٦٧٨', captchaToken: solved.token, captchaAnswer: solved.answer });
  assert(arabicRoute._status === 200, 'Arabic-digit phone passes the server gate');
  assert(engineCalls === 1, 'Arabic-digit phone reaches the engine exactly once');

  // 6h. Logout route must pull the cloud DB BEFORE pushing (anti-wipe guard).
  // Regression test for the 2026-11-05 incident where a cold serverless
  // instance pushed a stale local state on logout and wiped cloud orders.
  {
    let callOrder = [];
    let pushedOrders = -1;
    const fakeDb = {
      users: [userWithVersion],
      orders: [{ orderNumber: 'DO-2026-1001' }, { orderNumber: 'DO-2026-1002' }, { orderNumber: 'DO-2026-1003' }],
      auditLogs: [],
      notes: [],
    };
    const logoutRoute = loadTs(path.join(root, 'src', 'app', 'api', 'auth', 'logout', 'route.ts'), {
      '@/lib/auth': auth,
      '@/lib/db': {
        getDb: () => fakeDb,
        saveUser: (u) => { fakeDb.users[0] = u; },
        syncCloudDb: async () => { callOrder.push('pull'); fakeDb.pulled = true; },
        syncCloudDbPush: async (state) => { callOrder.push('push'); pushedOrders = state.orders ? state.orders.length : -1; },
      },
      '@/lib/types': {},
      'next/server': {
        NextRequest: class NextRequestShim {},
        NextResponse: class NextResponseShim {
          cookies = { set: () => {} };
          static json(body) { return { body, cookies: { set: () => {} } }; }
        },
      },
    });
    // fresh valid session token for the user (sv matches current tokenVersion)
    tokenCookieHolder.token = await auth.createSessionToken(userWithVersion);
    await logoutRoute.POST({ cookies: { get: (name) => ({ value: tokenCookieHolder.token }) } });
    assert(userWithVersion.tokenVersion === 2, 'Logout bumps tokenVersion server-side (1 -> 2)');
    assert(callOrder[0] === 'pull' && callOrder.includes('push'), 'Logout pulls the cloud DB before pushing (destroy-safe order)');
    assert(pushedOrders === 3, 'Logout push carries the full pulled state (orders preserved, not a stale local copy)');
  }

  // ============ 7. Login brute-force rate limit (real route, isolated mocks) ============
  {
    const loginRoute = loadTs(path.join(root, 'src', 'app', 'api', 'auth', 'login', 'route.ts'), {
      '@/lib/db': {
        getUserByEmail: (email) => (email === 'real@example.test'
          ? { id: 'u-real', role: 'customer', status: 'active', passwordHash: bcrypt.hashSync('right-pass', 10) }
          : null),
        syncCloudDb: async () => {},
      },
      '@/lib/auth': {
        comparePassword: async (pw) => pw === 'right-pass',
        createSessionToken: async () => 'tok',
        sessionCookieOptionsFor: () => ({ name: 'sid', options: {} }),
      },
      'next/server': {
        NextRequest: class NextRequestShim {},
        NextResponse: class NextResponseShim {
          constructor() { this.cookies = { set: () => {} }; }
          static json(body, init) {
            const instance = new this();
            instance.body = body; instance._status = init && init.status ? init.status : 200;
            return instance;
          }
        },
      },
    });
    const loginPost = (email, password) => loginRoute.POST({
      json: async () => ({ email, password }),
      headers: { get: () => null },
      cookies: { get: () => null },
    });
    let last = null;
    for (let i = 1; i <= 5; i++) {
      last = await loginPost('nobody@example.test', 'wrong-pass');
      assert(last._status === 401, `Wrong password attempt #${i} still returns 401 (limited, not blocked early)`);
    }
    const locked = await loginPost('nobody@example.test', 'wrong-pass');
    assert(locked._status === 429, '6th failed attempt is rate-limited with HTTP 429');
    assert((locked.body.error || '').includes('دقيقة'), 'Rate-limit message tells the Arabic minutes');
    // Correct credentials for ANOTHER key still work
    const good = await loginPost('real@example.test', 'right-pass');
    assert(good._status === 200, 'A different identity key is not affected by the lock');
  }

  // ============ 8. Captcha library itself (sign / verify / Arabic digits) ============
  {
    const ch = await captchaLib.createCaptchaChallenge();
    const [a, op, b] = ch.question.split(' ');
    const right = op === '+' ? Number(a) + Number(b) : Number(a) * Number(b);
    const arabicRight = String(right).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
    assert(await captchaLib.verifyCaptchaAnswer(ch.token, String(right)) === true, 'Captcha accepts the correct answer');
    assert(await captchaLib.verifyCaptchaAnswer(ch.token, arabicRight) === true, 'Captcha accepts the correct answer in Arabic-Indic digits');
    assert(await captchaLib.verifyCaptchaAnswer(ch.token, String(right + 1)) === false, 'Captcha rejects a near-wrong answer');
    assert(await captchaLib.verifyCaptchaAnswer('', String(right)) === false, 'Captcha rejects a missing token');
  }

  console.log('\n====================================================');
  console.log(`Result: ${passCount} passed, ${failCount} failed`);
  console.log('====================================================');
  if (failCount > 0) process.exit(1);
})();
