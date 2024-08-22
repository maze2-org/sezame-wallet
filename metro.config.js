const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const cfg = getDefaultConfig(__dirname);
cfg.resolver.extraNodeModules = {
  crypto: `${__dirname}/node_modules/react-native-quick-crypto`,
  stream: `${__dirname}/node_modules/stream-browserify`,
  buffer: `${__dirname}/node_modules/@craftzdog/react-native-buffer`,
  path: `${__dirname}/node_modules/path-browserify`,
  os: `${__dirname}/node_modules/react-native-os`,
  http: `${__dirname}/node_modules/@tradle/react-native-http`,
  https: `${__dirname}/node_modules/https-browserify`,
  assert: require.resolve('assert'),
};

const svgConfig = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

console.warn(cfg);
module.exports = mergeConfig(cfg, svgConfig);
