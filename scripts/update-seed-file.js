const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, '..', 'src', 'data', 'seed.ts');
let content = fs.readFileSync(seedFile, 'utf-8');

// Replace SEED_CATEGORIES up to SEED_SUPPLIERS
const reseedModule = require('./reseed.js');
// Let's re-read reseed data directly
const CATEGORIES = [
  {
    id: 'cat-honey',
    name: 'عسل نحل طبيعي فاخر',
    slug: 'natural-honey',
    description: 'عسل نقي 100% مفحوص مخبرياً من مناحل جبلية ومزارع معتمدة خالية من السكر والتغذية الصناعية.',
    imageUrl: '/images/honey/honey-01a-natural-plain.jpg',
    displayOrder: 1,
  },
  {
    id: 'cat-olive-oil',
    name: 'زيت زيتون بكر ممتاز',
    slug: 'olive-oil',
    description: 'معصور على البارد بنسبة حموضة أقل من 0.3% من مزارع واحة سيوة وشمال سيناء المباركة.',
    imageUrl: '/images/olive-oil/olive-oil-01a-siwa.jpg',
    displayOrder: 2,
  },
];

const dbPath = path.join(__dirname, '..', 'data', 'bazaar-store.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Format SEED_CATEGORIES
const categoriesCode = 'export const SEED_CATEGORIES: Category[] = ' + JSON.stringify(db.categories, null, 2) + ';';

// Format SEED_SUPPLIERS
const suppliersCode = 'export const SEED_SUPPLIERS: Supplier[] = ' + JSON.stringify(db.suppliers, null, 2) + ';';

// Format SEED_PRODUCTS
const productsCode = 'export const SEED_PRODUCTS: Product[] = ' + JSON.stringify(db.products, null, 2) + ';';

// Format SEED_REVIEWS
const reviewsCode = 'export const SEED_REVIEWS: Review[] = ' + JSON.stringify(db.reviews, null, 2) + ';';

// Find indices and replace
const catStart = content.indexOf('export const SEED_CATEGORIES');
const supStart = content.indexOf('export const SEED_SUPPLIERS');
const prodStart = content.indexOf('export const SEED_PRODUCTS');
const orderStart = content.indexOf('export const SEED_ORDERS');
const revStart = content.indexOf('export const SEED_REVIEWS');
const settingsStart = content.indexOf('export const SEED_STORE_SETTINGS');

// Reconstruct
const part1 = content.slice(0, catStart);
const partOrders = content.slice(orderStart, revStart);
const partSettings = content.slice(settingsStart);

const newContent = part1 + 
  categoriesCode + '\n\n' + 
  suppliersCode + '\n\n' + 
  productsCode + '\n\n' + 
  partOrders + 
  reviewsCode + '\n\n' + 
  partSettings;

fs.writeFileSync(seedFile, newContent, 'utf-8');
console.log('Successfully updated src/data/seed.ts with pure honey and olive oil!');
