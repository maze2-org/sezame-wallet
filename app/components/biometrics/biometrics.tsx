import React, {useState, useEffect} from "react"
import { SvgXml } from "react-native-svg"
import {
  Text,
  View,
  Alert,
  Linking,
  Platform,
  TouchableOpacity,
} from "react-native"
import ReactNativeBiometrics from 'react-native-biometrics'
import PasscodeAuth from 'react-native-passcode-auth';

import fingerIcon from "../../../assets/svg/finger.svg"
import { load, IKeychainData } from "../../utils/keychain"

interface IBiometrics {
  onLoad: (data: IKeychainData) => void
}

/**
 * An Biometrics component for handling user TouchID, FaceID or Biometrics.
 */
export function Biometrics({ onLoad }: IBiometrics) {
  const [keyChainData, setKeyChainData] = useState(null);

  const getKCData = () => {
    console.log('getKCData')
    load().then(savedData => {
      console.log('after load [savedData]', savedData)

      if (savedData && !!savedData.username && !!savedData.password && savedData.username !== '_pfo') {
        setKeyChainData(savedData);
        ReactNativeBiometrics.isSensorAvailable().then(resultObject => {
          const {available, biometryType} = resultObject;
          console.log(biometryType)
          // if (available && biometryType === ReactNativeBiometrics.TouchID) {
          //   promptBiometric(savedData);
          // }else{
            promptPassCode(savedData)
          // }
        })
          .catch(error=>{
            promptPassCode(savedData)
            console.log('ReactNativeBiometrics[isSensorAvailable]: ', error)
          });
      }
    })
      .catch(error=>{
        console.log('Keychain[Load]: ', error)
      });
  }

  useEffect(() => {
    getKCData()
  }, []);

  const promptBiometric = savedData => {
    ReactNativeBiometrics.simplePrompt({
      promptMessage: 'Confirm Fingerprint',
    })
      .then(resultObject => {
        const {success} = resultObject;
        if (success) {
          onLoad(keyChainData || savedData)
        }
      })
      .catch(error => {
        if (error.message.includes('No identities are enrolled')) {
          openAlertForBiometrics();
        }
      });
  };

  const promptPassCode = (savedData) => {
    console.log('promptPassCode',savedData)
    PasscodeAuth.isSupported()
      .then(supported => {
        // Success code
        console.log('Passcode Auth is supported.');

        PasscodeAuth.authenticate('to demo this react-native component')
          .then(success => {
            console.log('success',success)
            onLoad(keyChainData || savedData)
          })
          .catch(error => {
            console.log('error',error)
          });
      })
      .catch(error => {
        // Failure code
        console.log(error);
      });

  }

  const openAlertForBiometrics = () => {
    Alert.alert("Touch ID", 'Please Activate Touch ID', [
      {
        text: 'Cancel',
        onPress: () => {
          // @todo on close
        },
        style: 'cancel',
      },
      {
        text: "Open Settings",
        onPress: () => {
          Linking.openURL('app-settings:').catch(null);
        },
      },
    ]);
  };


  return (
    <View>
      {!!keyChainData &&
        <TouchableOpacity onPress={()=>keyChainData && getKCData()}>
          <SvgXml width={64} height={64} xml={fingerIcon} />
        </TouchableOpacity>
      }
    </View>
  )
}
