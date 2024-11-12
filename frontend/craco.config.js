// craco.config.js
const path = require('path');

module.exports = {
  webpack: {
    alias: {},
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
      };
      return webpackConfig;
    },
  },
};
