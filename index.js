/**
 * @format
 */
// global.crypto = require("react-native-quick-crypto")

import { AppRegistry } from 'react-native';
import App from './src/app';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
