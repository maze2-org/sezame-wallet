import { Dimensions, TextStyle, ViewStyle } from "react-native"
import { color, spacing } from "theme"
const { height } = Dimensions.get("screen")

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

const BTNS_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
}
const COIN_CARD: ViewStyle = {
  flex: 1,
}
const COIN_CARD_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
}

const VERTICAL_ICON_BTN: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "transparent",
}

const VERTICAL_ICON_BTN_TEXT: TextStyle = {
  fontSize: 12,
}
const COIN_DETAILS_CONTAINER: ViewStyle = {
  marginHorizontal: spacing[3],
}
const TIMEFRAME_BTNS: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: -spacing[4],
}
const BASIC_TIMEFRAME_BTN: ViewStyle = {
  width: 45,
  margin: 4,
  display: "flex",
  alignContent: "center",
  justifyContent: "center",
  alignItems: "center",
}
const TIMEFRAME_BTN: ViewStyle = {
  ...BASIC_TIMEFRAME_BTN,
  backgroundColor: color.palette.darkBrown,
}

const TIMEFRAME_BTN_ACTIVE: ViewStyle = {
  ...BASIC_TIMEFRAME_BTN,
  backgroundColor: color.primaryDarker,
}
const TIMEFRAME_BTN_TEXT: TextStyle = {
  color: color.palette.white,
  fontSize: 13,
  fontWeight: "bold",
}
const TIMEFRAME_BTN_TEXT_ACTIVE: TextStyle = {
  color: color.palette.white,
  fontSize: 13,
  fontWeight: "bold",
}
const BALANCE_STAKING_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  marginVertical: spacing[3],
}
const BALANCE_STAKING_CARD: ViewStyle = {
  display: "flex",
  flex: 1,
  backgroundColor: color.palette.darkBrown,
  margin: spacing[2],
  borderRadius: 10,
}
const BALANCE_STAKING_CARD_BODY: ViewStyle = {
  padding: spacing[3],
}
const BALANCE_STAKING_CARD_HEADER: TextStyle = {
  color: color.primaryDarker,
  fontSize: 15,
}
const BALANCE_STAKING_CARD_AMOUNT: TextStyle = {
  color: color.palette.white,
  fontSize: 25,
  fontWeight: "bold",
}
const BALANCE_STAKING_CARD_NOTE: TextStyle = {
  color: color.palette.white,
  fontSize: 11,
}
const BALANCE_STAKING_CARD_BTN: ViewStyle = {
  backgroundColor: color.transparent,
  padding: spacing[1],
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  height: 59,
}
const BALANCE_STAKING_CARD_BTN_ICON: TextStyle = {
  color: color.palette.white,
}

const BALANCE_STAKING_CARD_BTN_TEXT: TextStyle = {
  color: color.palette.white,
  fontSize: 12,
  flex: 3,
  textAlign: "center",
}
const TRANSACTIONS_HEADER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: spacing[4],
}
const TRANSACTIONS_SORT_BTN: ViewStyle = {
  backgroundColor: color.primary,
  display: "flex",
  flexDirection: "row",
  paddingHorizontal: spacing[2],
  paddingVertical: spacing[1],
}
const TRANSACTIONS_SORT_BTN_TEXT: TextStyle = {
  color: color.palette.white,
  marginLeft: spacing[1],
  fontSize: 12,
  lineHeight: 16.34,
}
const TRANSACTIONS_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  marginTop: spacing[3],
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
const RECEIVE_MODAL_WRAPPER: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  height: height,
  backgroundColor: "rgba(0,0,0,0.3)",
}
const RECEIVE_MODAL_CONTAINER: ViewStyle = {
  width: 317,
  alignItems: "center",
  borderRadius: 8,
  backgroundColor: color.palette.noise,
  paddingHorizontal: 10,
}
const QR_CONTAINER: ViewStyle = {
  display: "flex",
  alignItems: "center",
  alignContent: "center",
  backgroundColor: color.palette.white,
  padding: 20,
  borderRadius: 8,
  marginBottom: 40,
  marginVertical: 20,
}
const RECEIVE_MODAL_CLOSE_WRAPPER: ViewStyle = {
  width: "100%",
  alignItems: "flex-end",
}
const RECEIVE_MODAL_CLOSE: ViewStyle = {
  marginTop: 10,
}
const RECEIVE_MODAL_COPY_WRAPPER: ViewStyle = {
  backgroundColor: color.palette.darkblack,
  width: 280,
  borderRadius: 8,
  alignItems: "center",
  marginBottom: 25,
}
const RECEIVE_MODAL_ADDRESS: ViewStyle = {
  padding: 20,
}
const RECEIVE_MODAL_ADDRESS_TEXT: TextStyle = {
  textAlign: "center",
}
const RECEIVE_MODAL_COPY_BUTTON: ViewStyle = {
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  height: 40,
  borderTopColor: color.palette.lineColor,
  borderTopWidth: 1,
}
const RECEIVE_MODAL_COPY_TEXT: TextStyle = {
  fontSize: 11,
}
const COPY_ICON: ViewStyle = {
  position: "absolute",
  left: -40,
}

const TOKEN_CHAINS_CONTAINER: ViewStyle = {
  display: "flex",
  marginVertical: spacing[4],
}
const TOKEN_CHAIN_ROW: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing[3],
}
const ADD_TO_PORTFOLIO_BTN: TextStyle = {
  fontSize: 13,
  fontWeight: "bold",
}
const styles = {
  ROOT,
  BTNS_CONTAINER,
  COIN_CARD,
  COIN_CARD_CONTAINER,
  VERTICAL_ICON_BTN,
  VERTICAL_ICON_BTN_TEXT,
  COIN_DETAILS_CONTAINER,
  TIMEFRAME_BTNS,
  BASIC_TIMEFRAME_BTN,
  TIMEFRAME_BTN,
  TIMEFRAME_BTN_ACTIVE,
  TIMEFRAME_BTN_TEXT,
  TIMEFRAME_BTN_TEXT_ACTIVE,
  BALANCE_STAKING_CONTAINER,
  BALANCE_STAKING_CARD,
  BALANCE_STAKING_CARD_BODY,
  BALANCE_STAKING_CARD_HEADER,
  BALANCE_STAKING_CARD_AMOUNT,
  BALANCE_STAKING_CARD_NOTE,
  BALANCE_STAKING_CARD_BTN,
  BALANCE_STAKING_CARD_BTN_ICON,
  BALANCE_STAKING_CARD_BTN_TEXT,
  TRANSACTIONS_HEADER,
  TRANSACTIONS_SORT_BTN,
  TRANSACTIONS_SORT_BTN_TEXT,
  TRANSACTIONS_CONTAINER,
  TRANSACTION_ITEM,
  TRANSACTION_ITEM_BODY,
  TRANSACTION_ITEM_HASH,
  TRANSACTION_ITEM_DATE,
  RECEIVE_MODAL_WRAPPER,
  RECEIVE_MODAL_CONTAINER,
  QR_CONTAINER,
  RECEIVE_MODAL_CLOSE_WRAPPER,
  RECEIVE_MODAL_CLOSE,
  RECEIVE_MODAL_COPY_WRAPPER,
  RECEIVE_MODAL_ADDRESS,
  RECEIVE_MODAL_ADDRESS_TEXT,
  RECEIVE_MODAL_COPY_BUTTON,
  RECEIVE_MODAL_COPY_TEXT,
  COPY_ICON,
  TOKEN_CHAINS_CONTAINER,
  TOKEN_CHAIN_ROW,
  ADD_TO_PORTFOLIO_BTN,
}

export default styles
