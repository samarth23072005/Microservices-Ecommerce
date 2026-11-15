require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const DUMMY_JSON_URL = 'https://dummyjson.com/products?limit=100';

/**
 * Fetch 100 products from DummyJSON with a 15-second network timeout.
 */
const fetchDummyProducts = async () => {
  console.log(`[Seed] Fetching products from ${DUMMY_JSON_URL}...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(DUMMY_JSON_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch DummyJSON products: HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.products)) {
      throw new Error('Invalid response structure: missing "products" array');
    }

    return data.products;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Network request to DummyJSON timed out after 15 seconds');
    }
    throw error;
  }
};

/**
 * Main seed function:
 * - Connects to MongoDB product_db
 * - Fetches products from DummyJSON
 * - Maps external fields (title -> name, thumbnail -> image, etc.)
 * - Checks existing sourceId & name to guarantee no duplicate imports
 * - Does not delete existing or manually created products
 * - Cleans up MongoDB connection upon completion
 */
const runSeed = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/product_db';

  try {
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to database: ${mongoose.connection.name}`);

    // 1. Fetch 100 products from DummyJSON
    const externalProducts = await fetchDummyProducts();
    console.log(`[Seed] Successfully fetched ${externalProducts.length} products from DummyJSON.`);

    // 2. Fetch existing sourceIds and names to prevent duplicates
    const existingProducts = await Product.find({}, { sourceId: 1, name: 1 }).lean();
    const existingSourceIds = new Set(
      existingProducts
        .filter((p) => p.sourceId)
        .map((p) => String(p.sourceId))
    );
    const existingNames = new Set(
      existingProducts
        .filter((p) => p.name)
        .map((p) => p.name.trim().toLowerCase())
    );

    console.log(`[Seed] Found ${existingProducts.length} existing products in database (${existingSourceIds.size} with sourceId).`);

    // 3. Map external fields and filter duplicates
    const toInsert = [];
    let duplicateCount = 0;

    for (const item of externalProducts) {
      const sourceId = String(item.id);
      const title = item.title ? item.title.trim() : '';

      if (!title) {
        continue;
      }

      const normalizedTitle = title.toLowerCase();

      // Check duplicate by external ID or product name
      if (existingSourceIds.has(sourceId) || existingNames.has(normalizedTitle)) {
        duplicateCount++;
        continue;
      }

      // Map external fields to existing Product model
      toInsert.push({
        name: title,
        description: item.description ? item.description.trim() : 'No description provided.',
        price: typeof item.price === 'number' ? item.price : Number(item.price) || 0,
        category: item.category ? item.category.trim().toLowerCase() : 'general',
        stock: typeof item.stock === 'number' ? item.stock : Number(item.stock) || 0,
        image: item.thumbnail || (item.images && item.images[0]) || '',
        imageUrl: item.thumbnail || (item.images && item.images[0]) || '',
        sourceId
      });

      // Track to avoid duplicates within the payload itself
      existingSourceIds.add(sourceId);
      existingNames.add(normalizedTitle);
    }

    // 4. Insert new products into MongoDB (non-destructive)
    if (toInsert.length > 0) {
      const inserted = await Product.insertMany(toInsert, { ordered: false });
      console.log(`[Seed] Successfully imported ${inserted.length} new products into '${mongoose.connection.name}'.`);
    } else {
      console.log('[Seed] No new products to insert. All fetched products already exist in the database.');
    }

    // 5. Display summary
    const totalCount = await Product.countDocuments();
    console.log('--------------------------------------------------');
    console.log('[Seed Summary]');
    console.log(` - Fetched from DummyJSON:  ${externalProducts.length}`);
    console.log(` - Duplicates skipped:      ${duplicateCount}`);
    console.log(` - New products inserted:   ${toInsert.length}`);
    console.log(` - Total products in DB:    ${totalCount}`);
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    process.exitCode = 1;
  } finally {
    // 6. Close MongoDB connection cleanly
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('[Seed] MongoDB connection closed cleanly.');
    }
  }
};

// Execute if run directly
if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
