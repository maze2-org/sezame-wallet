import * as React from "react"
import { Image, StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Text } from "../text/text"
import { Drawer } from "components/drawer/drawer"
import { useStores } from "models"
import { Button } from "components/button/button"
import { buttons } from "theme/elements"
import styles from "./styles"
import { NETWORKS } from "config/networks"

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
  const [loading, setLoading] = React.useState({})
  const addAsset = React.useCallback((network: any) => {
    setLoading((loading) => ({ ...loading, [network.cid]: true }))
    currentWalletStore.getWallet().then((wallet) => {
      wallet
        .addAutoAsset(network)
        .then(() => {
          return currentWalletStore.setAssets(wallet.assets)
        })
        .then(() => {
          return wallet.save()
        })
        .finally(() => {
          console.log(JSON.stringify(wallet, null, 2))
          setLoading((loading) => ({ ...loading, [network.cid]: false }))
        })
    })
  }, [])

  const { currencySelectorStore, currentWalletStore } = useStores()
  console.log({ NETWORKS })
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
      {NETWORKS.sort((net1, net2) => {
        if (net1.name === net2.name) return 0
        return net1.name < net2.name ? -1 : 1
      }).map((network) => (
        <View style={styles.CURRENCY_ROW} key={network.cid}>
          <View style={styles.CURRENCY_ROW_LOGO}>
            <Image source={{ uri: network.image, width: 20, height: 20 }}></Image>
          </View>
          <Text style={styles.CURRENCY_ROW_NAME}>{network.name}</Text>
          <View style={styles.CURRENCY_ROW_BUTTON}>
            <Button
              disabled={loading[network.cid] || currentWalletStore.hasAsset(network)}
              text="ADD"
              onPress={() => addAsset(network)}
            ></Button>
          </View>
        </View>
      ))}
    </Drawer>
  )
})
