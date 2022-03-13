import * as React from "react"
import { Dimensions, StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { LineChart } from "react-native-chart-kit"
import { Text } from "../../components"

import { color } from "../../theme"
const CONTAINER: ViewStyle = {
  justifyContent: "center",
}

export interface PriceChartProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  data?: any[]
}

const chartStyle = {
  margin: 0,
  padding: 0,
}
/**
 * Describe your component here
 */
export const PriceChart = observer(function PriceChart(props: PriceChartProps) {
  const { style } = props
  const styles = Object.assign({ marginLeft: -65 }, CONTAINER, style)
  return (
    <View style={styles}>
      <LineChart
        withVerticalLabels={false}
        withHorizontalLabels={false}
        withHorizontalLines={false}
        withDots={false}
        withVerticalLines={false}
        withOuterLines={false}
        data={{
          labels: [],
          datasets: [
            {
              data: props.data || [],
            },
          ],
        }}
        width={Dimensions.get("window").width + 65} // from react-native
        height={241}
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundGradientFromOpacity: 0,
          backgroundGradientToOpacity: 0,
          color: (opacity = 1) => color.primaryDarker,
          fillShadowGradientFrom: color.primaryDarker,
          fillShadowGradientFromOpacity: 1,
          fillShadowGradientTo: color.palette.noise,
          fillShadowGradientToOpacity: 0,
          fillShadowGradientFromOffset: 0,
          fillShadowGradientToOffset: 0.8,
          propsForDots: {
            r: "2",
            strokeWidth: "2",
          },
        }}
        bezier
        style={chartStyle}
      />
    </View>
  )
})
