/**
 * QA flow test: product -> cart -> customer data -> totals -> order creation.
 * It executes the real TypeScript business logic (utils + order-engine)
 * with an in-memory database stub, so it never writes to the store or cloud.
 */

const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

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
console.log('QA flow: product -> cart -> checkout -> order');
console.log('====================================================\n');

const root = __dirname;
const store = JSON.parse(fs.readFileSync(path.join(root, 'data', 'darelasal-store.json'), 'utf8'));
const products = store.products;

const utils = loadTs(path.join(root, 'src', 'lib', 'utils.ts'), { './types': {} });

// 1. Delivery scope is Alexandria only
assert(utils.ACTIVE_GOVERNORATES.length === 1, 'Only one governorate is active for delivery');
assert(utils.ACTIVE_GOVERNORATES[0].name === 'الإسكندرية', 'The active governorate is Alexandria');
assert(utils.PLANNED_GOVERNORATES.length === utils.EGYPTIAN_GOVERNORATES.length - 1, 'All other governorates are marked as planned');
assert(utils.isGovernorateSupported('الإسكندرية') === true, 'Alexandria is accepted by the delivery check');
assert(utils.isGovernorateSupported('القاهرة') === false, 'Cairo is rejected by the delivery check');
assert(utils.getDeliveryFee('الإسكندرية') === 55, 'Alexandria delivery fee is 55 EGP');
assert(utils.getDeliveryFee('القاهرة') === 0, 'Unsupported governorates get no delivery fee quote');

// 2. Category links are normalized before filtering
assert(utils.normalizeCategoryId('cat-olive-oil') === 'cat-olive-oil', 'Canonical oil category id is preserved');
assert(utils.normalizeCategoryId('olive-oil') === 'cat-olive-oil', 'Legacy olive-oil slug maps to the canonical category');
assert(utils.normalizeCategoryId('honey') === 'cat-honey', 'Legacy honey slug maps to the canonical category');
assert(utils.normalizeCategoryId(null) === '', 'Missing category is treated as all products');

const oilProducts = products.filter(
  (product) => product.categoryId === utils.normalizeCategoryId('olive-oil')
);
const honeyProducts = products.filter(
  (product) => product.categoryId === utils.normalizeCategoryId('honey')
);
assert(oilProducts.length > 0 && oilProducts.length < products.length, 'Oil category filtering returns a real subset of products');
assert(oilProducts.every((product) => product.categoryId === 'cat-olive-oil'), 'Every filtered oil product belongs to cat-olive-oil');
assert(honeyProducts.every((product) => product.categoryId === 'cat-honey'), 'Every filtered honey product belongs to cat-honey');

// 3. Order engine executes against an in-memory DB
const savedOrders = [];
const productsById = new Map(products.map((product) => [product.id, product]));

const dbStub = {
  getDb: () => ({ orders: [], users: [] }),
  getProductById: (id) => productsById.get(id),
  saveOrder: (order) => {
    savedOrders.push(order);
    return order;
  },
  addNotification: () => {},
  addAuditLog: () => {},
  getOrderById: () => null,
  getCourierProfileByUserId: () => null,
  saveCourierProfile: () => {},
};

const orderEngine = loadTs(path.join(root, 'src', 'lib', 'order-engine.ts'), {
  './db': dbStub,
  './utils': utils,
  './types': {},
});

const availableProduct = products.find(
  (product) => product.isActive && product.status === 'AVAILABLE'
);
assert(Boolean(availableProduct), 'Store has an active available product for the cart flow');

const quantity = 2;
const customer = {
  customerName: 'عميل اختبار محلي',
  customerEmail: 'qa@example.test',
  customerPhone: '01000000000',
  city: 'الإسكندرية',
  streetAddress: 'عنوان تجريبي للاختبار فقط',
  buildingDetails: 'مبنى 1',
};

const rejected = orderEngine.createOrderServerSide({
  ...customer,
  governorate: 'القاهرة',
  items: [{ productId: availableProduct.id, quantity }],
});
assert(rejected.success === false, 'Order creation is rejected outside Alexandria');
assert(
  typeof rejected.error === 'string' && rejected.error.includes('الإسكندرية'),
  'Rejection message explains that Alexandria is the supported governorate'
);
assert(savedOrders.length === 0, 'Rejected order is never saved');

const emptyCart = orderEngine.createOrderServerSide({
  ...customer,
  governorate: 'الإسكندرية',
  items: [],
});
assert(emptyCart.success === false, 'Empty cart is rejected even inside Alexandria');
assert(savedOrders.length === 0, 'Empty cart is never saved');

const created = orderEngine.createOrderServerSide({
  ...customer,
  governorate: 'الإسكندرية',
  items: [{ productId: availableProduct.id, quantity }],
});
assert(created.success === true, 'Supported order with a real product is created');
assert(savedOrders.length === 1, 'Successful order is saved exactly once');

if (created.success) {
  const order = created.order;
  const expectedSubtotal = availableProduct.price * quantity;
  assert(order.items.length === 1, 'Order contains the cart line item');
  assert(order.items[0].quantity === quantity, 'Order keeps the requested quantity');
  assert(order.subtotal === expectedSubtotal, 'Subtotal is calculated from the server-side product price');
  assert(order.deliveryFee === 55, 'Order applies the Alexandria delivery fee');
  assert(order.totalAmount === expectedSubtotal + 55, 'Grand total equals subtotal plus delivery');
  assert(order.governorate === 'الإسكندرية', 'Order stores the supported governorate');
  assert(order.paymentMethod === 'COD', 'Cash-on-delivery is the only payment method in this flow');
  assert(order.orderStatus === 'PENDING', 'Available products start as a pending order');
  assert(Boolean(order.orderNumber && order.orderNumber.startsWith('DO-2026-')), 'Order receives a readable order number');
}

console.log('\n====================================================');
console.log(`Result: ${passCount} passed, ${failCount} failed`);
console.log('====================================================');

if (failCount > 0) process.exit(1);
