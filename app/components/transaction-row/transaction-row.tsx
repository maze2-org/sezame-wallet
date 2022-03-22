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
  textAlign: "right",
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
  const truncateHash = (hash: string) => {
    return hash.substring(0, 15) + "..." + hash.substring(hash.length - 15, hash.length)
  }

  const receive = asset.address !== transaction.from

  return (
    <View style={TRANSACTION_ITEM}>
      <View style={TRANSACTION_ITEM_BODY}>
        <Text style={TRANSACTION_ITEM_HASH}>{truncateHash(transaction.hash)}</Text>
        <Text style={TRANSACTION_ITEM_DATE}>
          {dayjs(transaction.date).format("MM/DD/YYYY HH:mm:ss")}
        </Text>
      </View>
      <View>
        <Button style={[TRANSACTIONS_SORT_BTN, !receive && TRANSACTIONS_SORT_BTN_RED]}>
          <FontAwesome5Icon
            name={receive ? "arrow-down" : "arrow-up"}
            size={10}
            color={color.palette.white}
          />

          <Text style={TRANSACTIONS_SORT_BTN_TEXT}>{receive ? "FROM" : "TO"}</Text>
        </Button>
        <Text style={TRANSACTION_ITEM_HASH}>
          {receive ? "+" : "-"} {transaction.amount}
        </Text>
      </View>
    </View>
  )
})
