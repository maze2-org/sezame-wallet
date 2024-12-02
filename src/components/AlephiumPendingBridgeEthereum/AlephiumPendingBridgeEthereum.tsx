import React, { useEffect, useMemo, useRef } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { palette } from "theme/palette.ts"

import stakeIcon from "@assets/icons/stake.svg"
import copyIcon from "@assets/icons/copy.svg"
import { SvgXml } from "react-native-svg"
import Clipboard from "@react-native-clipboard/clipboard"
import FlashMessage, { showMessage } from "react-native-flash-message"
import alephiumBridgeStore from "mobx/alephiumBridgeStore.tsx"

interface IAlephiumPendingBridgeEthereum {
  isTransferringFromETH: boolean,
  isGettingSignedVAA: boolean,
  waitForTransferCompleted: boolean,
  txId?: string
  startBlock?: number
  currentBlock?: number
  targetBlock?: number
}

type IProps = React.FC<IAlephiumPendingBridgeEthereum>

const AlephiumPendingBridgeEthereum: IProps = ({
                                                 txId,
                                                 startBlock,
                                                 currentBlock,
                                                 targetBlock,
                                                 isTransferringFromETH,
                                                 isGettingSignedVAA,
                                                 waitForTransferCompleted,
                                               }) => {
  const modalFlashRef = useRef<FlashMessage>()

  const truncateText = (text?: string) => {
    if (!text) return text

    return (
      text.substring(0, 16) +
      "..." +
      text.substring(text.length - 16, text.length)
    )
  }

  const onPressCopyTxIdHandler = () => {
    if (!!txId) {
      Clipboard.setString(txId)
      showMessage({
        type: "success",
        message: "Copied to clipboard",
      })
    }
  }

  const percent = useMemo(() => {
    if (!currentBlock || !startBlock || !targetBlock || targetBlock <= startBlock) return 0

    const normalizedProgress = (currentBlock - startBlock) / (targetBlock - startBlock)
    return Math.min(Math.max(normalizedProgress * 100, 0), 100)
  }, [currentBlock, startBlock, targetBlock])

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>Pending bridge</Text>
        <Text style={styles.description}>You initiated a bridge operation from Ethereum to Alephium</Text>
        <View style={styles.progressWrapper}>
          <View style={styles.progress}>
            <View style={[styles.progressInner, { width: `${percent}%` }]}></View>
          </View>
          {isTransferringFromETH ?
            (!!currentBlock ?
                <Text style={styles.progressText}>
                  Waiting for finality on Ethereum which may take up to 15 minutes. Last finalized block number{" "}
                  {currentBlock} {targetBlock}
                </Text>
                :
                <Text style={styles.progressText}>
                  Waiting for transaction confirmation...
                </Text>
            )
            : isGettingSignedVAA ?
              <Text style={styles.progressText}></Text>
              : waitForTransferCompleted ?
                <Text style={styles.progressText}>Waiting for a relayer to process your transfer.</Text>
                : null
          }
        </View>
        {!!txId &&
          <View>
            <Text style={styles.txIdTitle}>Tx ID</Text>
            <Text style={styles.txId}>{truncateText(txId)}</Text>
          </View>
        }
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressCopyTxIdHandler}
          style={[styles.footerBlock, styles.footerBlockRight]}>
          <SvgXml width={20} height={20} xml={copyIcon} />
          <Text style={styles.footerBlockText}>COPY TX ID</Text>
        </TouchableOpacity>
      </View>
      <FlashMessage ref={modalFlashRef} position="bottom" />
    </View>
  )
}

export default AlephiumPendingBridgeEthereum


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
    paddingHorizontal: 16,
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
