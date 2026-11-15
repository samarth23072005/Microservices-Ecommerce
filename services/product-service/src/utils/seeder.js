// Compatibility proxy redirecting to seed.js
const runSeed = require('./seed');

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
