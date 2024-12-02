import { BaseWalletDescription, IWalletAsset } from "models"
import React from "react"
import { Linking, Text, View } from "react-native"
import { Card } from "components/card/card.component"

import styles from "./bridge-card.styles"
import { spacing } from "theme"
import { Button } from "components/button/button"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { NavigatorParamList } from "navigators"
import { PRIMARY_OUTLINE_BTN_WITH_BORDER } from "theme/elements.ts"
import { palette } from "theme/palette.ts"

type BridgeCardPropsType = {
  from: BaseWalletDescription;
};

export function BridgeCard({ from }: BridgeCardPropsType) {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  const navigateToBridge = (e: any) => {
    navigation.navigate("bridge", {
      coinId: from.cid,
      chain: from.chain,
    })

    // Linking.openURL("https://bridge.alephium.org/#/transfer");
  }

  return (
    <Card title="Bridge">
      <View style={{ paddingTop: spacing[4] }}>
        {from.group !== "0" && from.chain === "ALPH" ? (
          <Text style={styles.DANGER}>
            Brige is only compatible with addresses on group 0. The current one
            is on group {from.group}
          </Text>
        ) : (
          <View style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <Text style={styles.BODY}>Send your {from.chain === "ALPH" ? "Alephium" : "Etherum"} to the{" "}
              {from.chain === "ALPH" ? "Etherum" : "Alephium"} network</Text>
            <Button
              style={{ ...PRIMARY_OUTLINE_BTN_WITH_BORDER, width: "auto", paddingHorizontal: 24 }}
              textStyle={{ color: palette.white }}
              text="Open Bridge"
              onPress={navigateToBridge}
            />
            {/*<Text style={styles.BODY}>* Soon embeded in sezame</Text>*/}
          </View>
        )}
      </View>
    </Card>
  )
}
