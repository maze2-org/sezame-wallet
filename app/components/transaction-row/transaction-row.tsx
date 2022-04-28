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
  onRemove?: () => void
}

const TRANSACTION_ITEM_WRAPPER: ViewStyle = {
  display: "flex",
}

const TRANSACTION_HEAD: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: spacing[1],
  borderBottomWidth: 1,
  borderBottomColor: color.palette.lineColor,
}

const TRANSACTION_INFO: ViewStyle = {
  alignItems: "flex-end",
}

const TRANSACTION_STATUS_WRAPPER: ViewStyle = {
  borderRadius: 50,
  paddingVertical: spacing[1],
  paddingRight: spacing[3],
}

const TRANSACTION_STATUS: TextStyle = {
  color: color.error,
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

const TRANSACTIONS_REMOVE_BTN: ViewStyle = {
  backgroundColor: color.transparent,
  display: "flex",
  flexDirection: "row",
  padding: spacing[1],
}

/**
 * Describe your component here
 */
export const TransactionRow = observer(function TransactionRow(props: TransactionRowProps) {
  const { transaction, asset, onRemove = () => {} } = props || {}
  const truncateText = (text: string) => {
    return text.substring(0, 8) + "..." + text.substring(text.length - 8, text.length)
  }

  const txs = transaction.out ? transaction.to : transaction.from

  const myself = `${transaction.from}` === `${transaction.to}`

  let rowTitle: any = null

  if (transaction.reason === "unstaking") {
    rowTitle = <Text>Unstaking</Text>
  } else if (transaction.reason === "staking") {
    rowTitle = <Text>Staking</Text>
  } else if (transaction.reason === "withdraw") {
    rowTitle = <Text>Withdrawing</Text>
  } else if (typeof txs === "string") {
    rowTitle = <Text>{truncateText(txs)}</Text>
  } else if (txs.length > 0) {
    txs.map((tx) => <Text>{truncateText(tx)}</Text>)
  } else if (txs.length < 1) {
    ;<Text>None</Text>
  }

  return (
    <View style={TRANSACTION_ITEM_WRAPPER}>
      {transaction.status === "failed" && (
        <View style={TRANSACTION_HEAD}>
          <View style={TRANSACTION_STATUS_WRAPPER}>
            <Text style={TRANSACTION_STATUS}>Failed</Text>
          </View>
          <Button style={TRANSACTIONS_REMOVE_BTN} onPress={onRemove}>
            <FontAwesome5Icon name={"trash"} size={10} color={color.palette.white} />
          </Button>
        </View>
      )}
      <View style={TRANSACTION_ITEM}>
        <View style={TRANSACTION_ITEM_BODY}>
          <Text style={TRANSACTION_ITEM_HASH}>{rowTitle}</Text>
          <Text style={TRANSACTION_ITEM_DATE}>
            {dayjs(transaction.timestamp).format("DD/MM/YYYY HH:mm:ss")}
          </Text>
        </View>
        <View style={TRANSACTION_INFO}>
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
    </View>
  )
})
