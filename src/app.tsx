/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */

global.Buffer = require('buffer').Buffer;
import './i18n';
import './utils/ignore-warnings';
import React, {useState, useEffect} from 'react';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import {initFonts} from './theme/fonts'; // expo
import * as storage from './utils/storage';
import {AppNavigator, useNavigationPersistence} from './navigators';
import {RootStore, RootStoreProvider, setupRootStore} from './models';
import {ErrorBoundary} from './screens/error/error-boundary';
import FlashMessage from 'react-native-flash-message';
import {WalletGenerator} from '@maze2/sezame-sdk';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {CONFIG} from '@maze2/sezame-sdk';
import {install} from 'react-native-quick-crypto';

install();

// This puts screens in a native ViewController or Activity. If you want fully native
// stack navigation, use `createNativeStackNavigator` in place of `createStackNavigator`:
// https://github.com/kmagiera/react-native-screens#using-native-stack-navigator

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';

/**
 * This is the root component of our app.
 */
function App() {
  WalletGenerator.generateMnemonic(128);
  // @TODO : Remove this line in order not to run the wallet in testmode by default
  // if (CONFIG) CONFIG.setTESTNET(true);

  const [rootStore, setRootStore] = useState<RootStore | undefined>(undefined);
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY);

  // // Kick off initial async loading actions, like loading fonts and RootStore
  useEffect(() => {
    (async () => {
      await initFonts(); // expo
      setupRootStore().then(setRootStore);
    })();
  }, []);

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!rootStore || !isNavigationStateRestored) return null;

  // otherwise, we're ready to render the app
  return (
    // <ToggleStorybook>
    <GestureHandlerRootView style={{flex: 1}}>
      <RootStoreProvider value={rootStore}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ErrorBoundary catchErrors={'always'}>
            <AppNavigator
              initialState={initialNavigationState}
              onStateChange={onNavigationStateChange}
            />
          </ErrorBoundary>
          <FlashMessage position="bottom" />
        </SafeAreaProvider>
      </RootStoreProvider>
    </GestureHandlerRootView>
    // </ToggleStorybook>
  );
}

export default App;
