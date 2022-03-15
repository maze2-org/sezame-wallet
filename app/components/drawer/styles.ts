import { StyleSheet, TextStyle, ViewStyle } from "react-native"

const overlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  alignContent: "center",
  display: "flex",
  backgroundColor: "rgba(0, 0, 0, 0.93)",
  zIndex: 100,
}

const popup: ViewStyle = {
  position: "absolute",
  left: -1,
  bottom: 0,
  right: -1,
  top: 80,
  backgroundColor: "#111111",
  alignItems: "center",
  paddingTop: 10,
  flexGrow: 1,
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  elevation: 20,
  shadowColor: "#52006A",
  borderColor: "#333",
  borderWidth: 1,
  borderBottomWidth: 0,
  paddingHorizontal: 20,
}

const title: TextStyle = {
  textAlign: "left",
  color: "white",
  alignSelf: "flex-start",
  fontSize: 18,
  fontWeight: "bold",
  marginVertical: 10,
}

const body: ViewStyle = {
  flexGrow: 1,
}

const actions: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "stretch",
  width: "100%",
}

const actionBtn: ViewStyle = {
  flexGrow: 1,
}

const actionBtnMarginRight: ViewStyle = {
  marginRight: 5,
}

const actionBtnMarginLeft: ViewStyle = {
  marginLeft: 5,
}

const styles = {
  overlay,
  popup,
  title,
  body,
  actions,
  actionBtn,
  actionBtnMarginRight,
  actionBtnMarginLeft,
}

export default styles
