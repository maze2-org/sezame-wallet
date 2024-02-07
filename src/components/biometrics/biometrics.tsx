import React, { useState, useEffect } from "react"
import {
  Text,
  View,
  Alert,
  Linking,
  Platform,
  TouchableOpacity,
} from "react-native"
import PasscodeAuth from '@el173/react-native-passcode-auth';
import ReactNativeBiometrics from 'react-native-biometrics'
import { useNavigation } from "@react-navigation/native";

import fingerIcon from "@assets/svg/finger.svg"
import faceIdIcon from "@assets/svg/faceid.svg"
import { showMessage } from "react-native-flash-message";
import { load, IKeychainData } from "../../utils/keychain"
import { SvgXml } from "react-native-svg";

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

  useEffect(() => {
    focusHandler()
  }, [walletName])

  const showError = (error) => {
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
      const parsedWallet = savedData ? JSON.parse(savedData.password) : [];
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

  const authenticate = (savedData: IKeychainData | null) => {
    ReactNativeBiometrics.isSensorAvailable().then(resultObject => {
      if (Platform.OS === 'ios' || Platform.OS === 'android' && resultObject.available) {
        setBiometricType(resultObject.biometryType || ReactNativeBiometrics.TouchID)
      }
    })
      .catch(error => {
        if (Platform.OS === 'ios') {
          setBiometricType(ReactNativeBiometrics.TouchID)
        }
        console.log('ReactNativeBiometrics[isSensorAvailable]: ', error)
      })
      .finally(() => {
        const prompt = Platform.select({
          ios: promptPassCodeIOS,
          android: promptPassCodeAndroid
        })

        if (savedData) prompt(savedData);
      })
  }

  const promptPassCodeIOS = (savedData) => {
    PasscodeAuth.isSupported()
      .then(supported => {
        if (supported) {
          PasscodeAuth.authenticate('Please Authenticate')
            .then(() => {
              onLoad(keyChainData || savedData)
            })
            .catch(error => {
              showError(error.message)
            });
        }
      })
      .catch(error => {
        showError(error.message)
      });

  }

  const promptPassCodeAndroid = (savedData) => {
    ReactNativeBiometrics.isSensorAvailable().then(resultObject => {
      const { available } = resultObject;
      if (available) {
        ReactNativeBiometrics.simplePrompt({
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

  return (
    <View>
      {!!keyChainData &&
        <TouchableOpacity onPress={() => keyChainData && pressHandler()}>
          {
            biometricType === ReactNativeBiometrics.FaceID ?
              <SvgXml width={64} height={64} xml={faceIdIcon} /> :
              (!!biometricType && <SvgXml width={64} height={64} xml={fingerIcon} />)
          }
        </TouchableOpacity>
      }
    </View>
  )
}
