const { override, addWebpackAlias, addWebpackExternals } = require("customize-cra");
const path = require("path");

module.exports = override(
  (config) => {
    // Allow crypto-browserify
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
    };
    
    // Optionally, add alias to avoid module path issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'crypto': require.resolve('crypto-browserify'),
    };
    
    return config;
  }
);
