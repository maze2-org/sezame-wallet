import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, spacing, typography } from "../../theme"
import { Text } from "../text/text"
import { Button } from "components/button/button"
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5"
import { CryptoTransaction } from "services/api"
import { IWalletAsset } from "models"
import dayjs from "dayjs"

export interface TransactionRowProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  transaction: CryptoTransaction
  asset: IWalletAsset
}

const TRANSACTION_ITEM: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  marginVertical: spacing[2],
}

const TRANSACTION_ITEM_BODY: ViewStyle = {
  display: "flex",
  flexDirection: "column",
}

const TRANSACTION_ITEM_HASH: TextStyle = {
  color: color.palette.white,
  fontWeight: "bold",
  fontSize: 15,
  textAlign: "left",
}
const TRANSACTION_ITEM_DATE: TextStyle = {
  color: color.palette.lightGrey,
  fontSize: 13,
  marginVertical: spacing[1],
}

const TRANSACTIONS_SORT_BTN: ViewStyle = {
  backgroundColor: color.primary,
  display: "flex",
  flexDirection: "row",
  paddingHorizontal: spacing[2],
  paddingVertical: spacing[1],
}

const TRANSACTIONS_SORT_BTN_RED: ViewStyle = {
  backgroundColor: color.error,
}

const TRANSACTIONS_SORT_BTN_TEXT: TextStyle = {
  color: color.palette.white,
  marginLeft: spacing[1],
  fontSize: 12,
  lineHeight: 16.34,
}

/**
 * Describe your component here
 */
export const TransactionRow = observer(function TransactionRow(props: TransactionRowProps) {
  const { transaction, asset } = props
  const truncateText = (text: string) => {
    return text.substring(0, 8) + "..." + text.substring(text.length - 8, text.length)
  }

  const txs = transaction.out ? transaction.to : transaction.from

  const myself = `${transaction.from}` === `${transaction.to}`

  return (
    <View style={TRANSACTION_ITEM}>
      <View style={TRANSACTION_ITEM_BODY}>
        <Text style={TRANSACTION_ITEM_HASH}>
          {typeof txs === "string" ? (
            <Text>{truncateText(txs)}</Text>
          ) : (
            txs.map((tx) => <Text>{truncateText(tx)}</Text>)
          )}
          {txs.length < 1 && <Text>None</Text>}
        </Text>
        <Text style={TRANSACTION_ITEM_DATE}>
          {dayjs(transaction.timestamp).format("DD/MM/YYYY HH:mm:ss")}
        </Text>
      </View>
      <View>
        <Button style={[TRANSACTIONS_SORT_BTN, transaction.out && TRANSACTIONS_SORT_BTN_RED]}>
          <FontAwesome5Icon
            name={transaction.out ? "arrow-up" : "arrow-down"}
            size={10}
            color={color.palette.white}
          />

          <Text style={TRANSACTIONS_SORT_BTN_TEXT}>
            {myself ? "MYSELF" : transaction.out ? "TO" : "FROM"}
          </Text>
        </Button>
        <Text style={TRANSACTION_ITEM_HASH}>{parseFloat(transaction.amount).toFixed(4)}</Text>
      </View>
    </View>
  )
})
