import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, typography } from "../../theme"
import { Text } from "../text/text"
import { Drawer } from "components/drawer/drawer"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useStores } from "models"
import { Button } from "components/button/button"
import { buttons } from "theme/elements"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
}

const TEXT: TextStyle = {
  fontFamily: typography.primary,
  fontSize: 14,
  color: color.primary,
}

const COMMON = {
  privateKey: "",
  publicKey: "",
  balance: 0,
  value: 0,
  rate: 0,
  version: 1,
}

const NETWORKS = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    cid: "bitcoin",
    chain: "BTC",
    type: "coin",
    decimals: 8,
    address: "bc1qx6juea389gv4g3qzz0vwmzjjjhxwtdvzmk2e6c",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    ...COMMON,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    cid: "ethereum",
    chain: "ETH",
    type: "coin",
    decimals: 18,
    address: "0x79f01edb3ceace570587a05f5296c34fb7f400f3",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    ...COMMON,
  },
  {
    symbol: "AVN",
    name: "AVNRich",
    cid: "avnrich",
    chain: "BSC",
    type: "coin",
    decimals: 18,
    address: "0xbf151f63d8d1287db5fc7a3bc104a9c38124cdeb",
    image: "https://assets.coingecko.com/coins/images/14819/large/avn.png",
  },
  {
    symbol: "ALPH",
    name: "Alephium",
    cid: "alephium",
    chain: "ALPH",
    type: "coin",
    decimals: 18,
    address: "0x79f01edb3ceace570587a05f5296c34fb7f400f3",
    image:
      "https://assets.coingecko.com/coins/images/21598/large/Alephium-Logo_200x200_listing.png",
  },
]

export interface CurrenciesSelectorProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const CurrenciesSelector = observer(function CurrenciesSelector(
  props: CurrenciesSelectorProps,
) {
  const { style } = props
  const styles = Object.assign({}, CONTAINER, style)

  const addAssets = async (network: any) => {
    // await currentWalletStore.addAutoAsset(network)
    // await currentWalletStore.save()
    // currentWalletStore.open(storedWallet)
  }

  const closeDrawer = () => {}

  const { currencySelectorStore, currentWalletStore } = useStores()

  console.log({ currentWalletStore })

  return (
    <Drawer
      title="Choose your currencies"
      hidden={!currencySelectorStore.display}
      actions={[
        <Button
          text="CLOSE"
          style={buttons.DRAWER_BTN_OK}
          textStyle={buttons.DRAWER_BTN_TEXT}
          onPress={() => {
            currencySelectorStore.toggle()
          }}
        ></Button>,
      ]}
    >
      {NETWORKS.map((network) => (
        <TouchableOpacity
          onPress={() => {
            addAssets(network)
            closeDrawer()
          }}
          key={network.cid}
        >
          <View>
            <Text>{network.symbol}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </Drawer>
  )
})
