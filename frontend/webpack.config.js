// webpack.config.js
const path = require('path');

module.exports = {
  // Other configuration options...
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
    },
  },
};

