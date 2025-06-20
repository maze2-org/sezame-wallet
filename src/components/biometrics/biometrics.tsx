import React, { useState, useEffect } from "react"
import {
  View,
  Platform,
  TouchableOpacity,
} from "react-native"
import PasscodeAuth from '@el173/react-native-passcode-auth';
import ReactNativeBiometrics,  { BiometryTypes } from 'react-native-biometrics'
import { useNavigation } from "@react-navigation/native";

import fingerIcon from "@assets/svg/finger.svg"
import faceIdIcon from "@assets/svg/faceid.svg"
import { showMessage } from "react-native-flash-message";
import { load, IKeychainData } from "utils/keychain.ts"
import { SvgXml } from "react-native-svg"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface IBiometrics {
  walletName: string,
  onLoad: (data: IKeychainData) => void
}

/**
 * An Biometrics component for handling user TouchID, FaceID or Biometrics.
 */
export function Biometrics({ walletName, onLoad }: IBiometrics) {
  const navigation = useNavigation();
  const [biometricType, setBiometricType] = useState<string>('');
  const [keyChainData, setKeyChainData] = useState<IKeychainData | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    focusHandler()
  }, [walletName])

  const showError = (error: string) => {
    showMessage({ message: error, type: "danger", })
  }

  const pressHandler = async () => {
    getKCData()
      .then(savedData => {
        if (savedData) {
          authenticate(savedData)
        }
      })
      .catch(error => {
        console.log('error', error)
      })
  }

  const getKCData = () => {
    return load().then(savedData => {
      const parsedWallet = savedData ? JSON.parse(savedData.password as string) : [];
      if (savedData && !!savedData.password && Array.isArray(parsedWallet)) {
        if (parsedWallet.length) {
          let newSaveData = parsedWallet.find((wallet) => wallet.walletName === walletName)
          if (newSaveData) {
            const data = {
              username: newSaveData.walletName,
              password: newSaveData.walletPassword,
              server: null,
            }
            setKeyChainData(data);
            return data;
          }
          setKeyChainData(null);
          return null
        }
        return null
      } else {
        setKeyChainData(null);
        return null;
      }
    })
      .catch(error => {
      })
  }

  const authenticate = async (savedData: IKeychainData | null) => {
    const rnBiometrics = new ReactNativeBiometrics();

    rnBiometrics.isSensorAvailable().then(resultObject => {
      if (Platform.OS === 'ios' || Platform.OS === 'android' && resultObject.available) {
        setBiometricType(resultObject.biometryType || BiometryTypes.TouchID)
      }
    })
      .catch(error => {
        if (Platform.OS === 'ios') {
          setBiometricType(BiometryTypes.TouchID)
        }
        console.log('ReactNativeBiometrics[isSensorAvailable]: ', error)
      })
      .finally(() => {
        const prompt = Platform.select({
          ios: promptPassCodeIOS,
          android: promptPassCodeAndroid
        })

        if (savedData) if (prompt) {
          prompt(savedData)
        }
      })
  }

  const promptPassCodeIOS = (savedData: IKeychainData) => {
    PasscodeAuth.isSupported()
      .then((supported: any) => {
        if (supported) {
          PasscodeAuth.authenticate('Please Authenticate')
            .then(() => {
              onLoad(keyChainData || savedData)
            })
            .catch((error: { message: string; }) => {
              showError(error.message)
            });
        }
      })
      .catch((error: { message: string; }) => {
        showError(error.message)
      });

  }

  const promptPassCodeAndroid = (savedData: IKeychainData) => {
    const rnBiometrics = new ReactNativeBiometrics()

    rnBiometrics.isSensorAvailable().then(resultObject => {
      const { available } = resultObject;
      if (available) {
        rnBiometrics.simplePrompt({
          promptMessage: 'Please Authenticate'
        })
          .then(({ success }) => {
            if (success) {
              onLoad(keyChainData || savedData)
            }
          })
          .catch(error => {
            showError(error.message)
          })
      }
    })
  }

  const focusHandler = () => {
    getKCData().then(() => {
      authenticate(null)
    })
  }

  useEffect(() => {
    navigation.addListener('focus', focusHandler);

    return () => {
      navigation.removeListener('focus', focusHandler);
    }
  }, [])

  const fetchBiometricPreference = async () => {
    const enabled = await AsyncStorage.getItem('biometricEnabled');
    const isEnabled = enabled === 'true' || !enabled;
    setIsBiometricEnabled(isEnabled);
  };


  useEffect(() => {
    fetchBiometricPreference();
  }, []);

  return (
    <View>
      {(!!keyChainData && isBiometricEnabled) &&
        <TouchableOpacity onPress={() => keyChainData && pressHandler()}>
          {
            biometricType === BiometryTypes.FaceID ?
              <SvgXml width={64} height={64} xml={faceIdIcon} /> :
              (!!biometricType && <SvgXml width={64} height={64} xml={fingerIcon} />)
          }
        </TouchableOpacity>
      }
    </View>
  )
}
