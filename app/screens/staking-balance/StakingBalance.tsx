import  React  from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native"

import styles from './styles'
import IonIcons from "react-native-vector-icons/Ionicons"
import icon_stack from "../../../assets/svg/stake.svg"
import icon_unStake from "../../../assets/svg/unstake.svg"
import { SvgXml } from "react-native-svg"
import { Footer, Screen } from "../../components"
import { IWalletAsset, useStores, } from "../../models"
import {
  NativeStackNavigationProp
} from "@react-navigation/native-stack"
import {
  chainSymbolsToNames
} from "../../utils/consts"

export interface StackingBalanceRouteParams {
  image: string,
  name: string,
  asset: IWalletAsset,
}

export interface StackingBalanceProps {
  route: {
    params: StackingBalanceRouteParams,
  },
  navigation: NativeStackNavigationProp<any>
}

const StakingBalance = (props: StackingBalanceProps) => {
  const {navigation, route: {params: { image, name, asset }}} = props
  const { exchangeRates } = useStores()

  const pressStackIcon = () => {
    console.log('pressStackIcon')
  }

  const pressUnsStakeIcon = () => {
    console.log('pressUnsStakeIcon')
  }


  return(
      <Screen unsafe={true} style={styles.ROOT} preset="fixed">

      <ScrollView>
      <View style={styles.HEADER}>
          <Text style={styles.BOLD_TEXT}>{name}</Text>
        <View style={styles.IMG_CONTAINER}>
          <Image source={{uri:image}}
                width={100}
                height={100}
                style={styles.IMG} />
        </View>
        <Text style={styles.BIG_TEXT}>{asset.balance} {asset.symbol}</Text>
        <Text style={styles.GOLD_TEXT}>{chainSymbolsToNames[asset.chain]}</Text>
      </View>

      <View style={styles.BODY}>
          <View style={styles.CARD}>
            <View>
                <Text style={styles.GOLD_TEXT}>Availabl Balance</Text>
              <View style={styles.ROW_ALIGN}>
                <Text style={styles.MIDDLE_TEXT}>{+(Number(asset?.balance).toFixed(4))}</Text>
                <Text style={styles.TEXT}>(~{`${(exchangeRates.getRate(asset.cid) * asset.balance).toFixed(2)}`}$)</Text>
              </View>
            </View>

            <View>
              <View style={styles.ICON_CONTAINER}>
                <TouchableOpacity onPress={pressStackIcon}
                                  activeOpacity={0.7}
                                  hitSlop={{top:15,bottom:15,left:15,right:15}}
                >
                   <SvgXml width={24} height={24} xml={icon_stack}/>
                </TouchableOpacity>
                <Text style={styles.TEXT}>Stack</Text>
              </View>
            </View>
          </View>

        <View style={styles.CARD}>
          <View>
              <Text style={styles.GOLD_TEXT}>Staking</Text>
              <Text style={styles.MIDDLE_TEXT}>{+(Number(0.894444).toFixed(4))}</Text>
              <Text style={styles.TEXT}>Available rewards 0.02 (~1$)</Text>
          </View>
          <View style={styles.ROW_ALIGN}>
            <View  style={styles.ICON_CONTAINER}>
              <TouchableOpacity onPress={pressUnsStakeIcon}
                                activeOpacity={0.7}
                                hitSlop={{top:15,bottom:15,left:10,right:15}}
              >
                 <SvgXml width={24} height={24} xml={icon_unStake}/>
              </TouchableOpacity>
              <Text style={styles.TEXT}>Unstack</Text>
            </View>
          </View>
        </View>

      </View>
      </ScrollView>

      <Footer
        RightButtonIcon={(props) => <IonIcons {...props} name="globe-outline" size={23} />}
        onLeftButtonPress={()=>navigation.goBack()}
        style={styles.FOOTER}
      />
      </Screen>
  )
}

export  default  StakingBalance
