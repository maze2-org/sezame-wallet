/**
 * @format
 */
// global.crypto = require("react-native-quick-crypto")

import { AppRegistry } from 'react-native';
import "fast-text-encoding";
import 'react-native-url-polyfill/auto';
import App from './src/app';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
