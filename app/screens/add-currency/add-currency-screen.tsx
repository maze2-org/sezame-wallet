import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { TextInput, View, Image, TouchableOpacity, ImageBackground } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import BigList from "react-native-big-list"
import { NavigatorParamList } from "../../navigators"
import { AppScreen, Button, Footer, Text, Screen } from "../../components"
import styles from "./styles"

import { useNavigation } from "@react-navigation/native"
import { BackgroundStyle, MainBackground, RootPageStyle, SEPARATOR } from "theme/elements"

const tokens = require("../../config/tokens.json")

export const AddCurrencyScreen: FC<StackScreenProps<NavigatorParamList, "addCurrency">> = observer(
  function AddCurrencyScreen() {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()
    const [selectedTokens, setSelectedTokens] = React.useState<string[]>(tokens)
    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

    // useEffect(() => {
    //   setSelectedTokens(tokens.slice(0, 10))
    // }, [])

    const goBack = () => navigation.goBack()

    const searchTokens = (text: string) => {
      const matches = tokens.filter((token) => {
          return token.name.toLowerCase().includes(text.toLowerCase()) ||
            token.symbol.toLowerCase().includes(text.toLowerCase())
        },
      )
      setSelectedTokens(matches)
    }

    const getData = () => {
      return selectedTokens
    }

    const renderItem = ({ item }) => {
      return (
        <TouchableOpacity
          style={styles.CURRENCY_ROW}
          key={item.cid}
          onPress={() => navigation.navigate("coinDetails", { fromAddCurrency: true, coinId: item.id })}
        >
          <View style={styles.CURRENCY_ROW_LOGO}>
            <Image source={{ uri: item.thumb, width: 20, height: 20 }}></Image>
          </View>
          <Text style={styles.CURRENCY_ROW_NAME}>{item.name}</Text>

          <View style={SEPARATOR}></View>
        </TouchableOpacity>
      )
    }

    return (
      <Screen unsafe preset="fixed" style={RootPageStyle}>
        <ImageBackground source={MainBackground} style={BackgroundStyle}>
            <View style={styles.SEARCH_INPUT_CONTAINER}>
              <TextInput
                style={styles.SEARCH_INPUT}
                // autoFocus
                autoCorrect={false}
                onChangeText={(text) => searchTokens(text)}
                placeholder={"Search coins"}
              />
            </View>

            <BigList data={selectedTokens} renderItem={renderItem} itemHeight={50} />

            <Footer onLeftButtonPress={goBack}></Footer>
        </ImageBackground>
      </Screen>
    )
  },
)
