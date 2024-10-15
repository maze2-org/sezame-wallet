import React, { useEffect, useMemo } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { palette } from "theme/palette.ts"

import stakeIcon from "@assets/icons/stake.svg"
import copyIcon from "@assets/icons/copy.svg"
import { SvgXml } from "react-native-svg"
import { useStores } from "models"
import { Chains, NodeProviderGenerator } from "@maze2/sezame-sdk"
import { PrivateKeyWallet } from "@alephium/web3-wallet"

interface iAlephimPendingBride {
  onPressRedeem?: () => void
  onPressCopyTxId?: () => void
  hideRedeem?: boolean
  asset: any
}

type IProps = React.FC<iAlephimPendingBride>

const AlephimPendingBride: IProps = ({ onPressRedeem, onPressCopyTxId, hideRedeem = false, asset }) => {
  const { currentWalletStore, pendingTransactions, exchangeRates } = useStores()
  const { assets } = currentWalletStore

  const onPressRedeemHandler = () => {
  }

  const onPressCopyTxIdHandler = () => {
  }

  const percent = useMemo(() => (34 / 40 * 100), [])


  const getTransfer = async () => {
    const nodeProvider = await NodeProviderGenerator.getNodeProvider(
      asset.chain as Chains,
    )

    const wallet = new PrivateKeyWallet({
      privateKey: asset.privateKey,
      nodeProvider,
    })
    console.log('wallet',wallet)
  }
  useEffect(() => {
    getTransfer()
  }, [])
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>Pending bridge</Text>
        <Text style={styles.description}>You initiated a bridge operation from Alephium to Ethereum</Text>
        <View style={styles.progressWrapper}>
          <View style={styles.progress}>
            <View style={[styles.progressInner, { width: `${percent}%` }]}></View>
          </View>
          <Text style={styles.progressText}>34/40 confirmations</Text>
        </View>
        <View>
          <Text style={styles.txIdTitle}>Tx ID</Text>
          <Text style={styles.txId}>ds98fsdfj9asdfas...df7asd9fsd8fjs9df</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {!hideRedeem &&
          <>
            <TouchableOpacity activeOpacity={0.8} onPress={onPressRedeemHandler} style={styles.footerBlock}>
              <SvgXml width={20} height={20} xml={stakeIcon} />
              <Text style={styles.footerBlockText}>REDEEM</Text>
            </TouchableOpacity>
            <View style={styles.footerLine} />
          </>
        }
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressCopyTxIdHandler}
          style={[styles.footerBlock, styles.footerBlockRight]}>
          <SvgXml width={20} height={20} xml={copyIcon} />
          <Text style={styles.footerBlockText}>COPY TX ID</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default AlephimPendingBride


const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    width: "100%",
    borderRadius: 6,
    marginBottom: 35,
    backgroundColor: palette.darkBlack,
  },
  container: {
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 11,
    color: "#DBAF00",
    fontWeight: "500",
  },
  description: {
    fontSize: 10.7,
    marginTop: -5,
    color: palette.offWhite,
  },
  progressWrapper: {
    gap: 8,
    alignItems: "center",
  },
  progress: {
    height: 6,
    width: "100%",
    borderRadius: 100,
    overflow: "hidden",
    backgroundColor: palette.black,
  },
  progressInner: {
    height: "100%",
    borderRadius: 100,
    backgroundColor: "#DBAF00",
  },
  progressText: {
    fontSize: 11,
    fontWeight: "700",
    color: palette.white,
  },
  txIdTitle: {
    fontSize: 11,
    color: "#DBAF00",
    fontWeight: "700",
  },
  txId: {
    fontSize: 10,
    marginTop: 2,
    color: palette.offWhite,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
  },
  footerBlock: {
    gap: 12,
    flexGrow: 2,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 6,
  },
  footerBlockRight: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 6,
  },
  footerBlockText: {
    fontSize: 11,
    color: palette.offWhite,
  },

  footerLine: {
    width: 2,
    height: 28,
    backgroundColor: palette.black,
  },
})
