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
import PasscodeAuth from '@el173/react-native-passcode-auth';
import ReactNativeBiometrics from 'react-native-biometrics'
import { useNavigation } from "@react-navigation/native";

import fingerIcon from "../../../assets/svg/finger.svg"
import faceIdIcon from "../../../assets/svg/faceid.svg"
import { showMessage } from "react-native-flash-message";
import { load, IKeychainData } from "../../utils/keychain"

interface IBiometrics {
  onLoad: (data: IKeychainData) => void
}

/**
 * An Biometrics component for handling user TouchID, FaceID or Biometrics.
 */
export function Biometrics({ onLoad }: IBiometrics) {
  const navigation = useNavigation();
  const [biometricType, setBiometricType] = useState<string>('');
  const [keyChainData, setKeyChainData] = useState<IKeychainData | null>(null);

  const showError = (error)=>{
    showMessage({ message: error, type: "danger", })
  }

  const pressHandler = async () => {
    getKCData()
      .then(savedData => {
        if(savedData) {
          authenticate(savedData)
        }
      })
      .catch(error=>{
        console.log('error', error)
      })
  }

  const getKCData = () => {
    return load().then(savedData => {
      if (savedData && !!savedData.username && !!savedData.password && savedData.username !== '_pfo') {
        setKeyChainData(savedData);
        return  savedData;
      }else{
        setKeyChainData(null);
        return null;
      }
    })
  }

  const authenticate = (savedData: IKeychainData | null) => {
    ReactNativeBiometrics.isSensorAvailable().then(resultObject => {
      setBiometricType(resultObject.biometryType || ReactNativeBiometrics.TouchID)
    })
      .catch(error=>{
        setBiometricType(ReactNativeBiometrics.TouchID)
        console.log('ReactNativeBiometrics[isSensorAvailable]: ', error)
      })
      .finally(()=>{
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
        if(supported) {
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
    ReactNativeBiometrics.simplePrompt({
      promptMessage: 'Please Authenticate'
    })
      .then(({success})=>{
        if(success) {
          onLoad(keyChainData || savedData)
        }
      })
      .catch(error=>{
        showError(error.message)
      })
  }

  const focusHandler = () => {
    getKCData().then(()=>{
      authenticate(null)
    })
  }

  useEffect(()=>{
    navigation.addListener('focus', focusHandler);

    return ()=>{
      navigation.removeListener('focus', focusHandler);
    }
  },[])

  return (
    <View>
      {!!keyChainData &&
        <TouchableOpacity onPress={()=>keyChainData && pressHandler()}>
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
