module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [

    [
      "babel-plugin-inline-import",
      {
        "extensions": [".svg"]
      }
    ],

    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.svg'],
        alias: {
          '@components': './src/components',
          '@config': './src/config',
          '@assets': './src/assets',
          '@models': './src/models',
          '@theme': './src/theme',
          '@screens': './src/screens',
          '@i18n': './src/i18n',
          '@services': './src/services',
          '@types': './src/types',
          '@utils': './src/utils',
          '@navigators': './src/navigators'
        },
      },
    ],
  ],
};