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
  const styles = Object.assign({ marginLeft: -68 }, CONTAINER, style)

  const graphColor =
    props.data[props.data.length - 1] > props.data[props.data.length - 2] ? "#cdff38" : "#cd5d38"

  return (
    <View style={styles}>
      <LineChart
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withHorizontalLines={true}
        withDots={false}
        withVerticalLines={false}
        withOuterLines={false}
        data={{
          labels: [],
          datasets: [
            {
              color: (opacity = 1) => graphColor,
              data: props.data || [],
            },
          ],
        }}
        width={Dimensions.get("window").width + 65} // from react-native
        height={180}
        yAxisLabel="$"
        chartConfig={{
          strokeWidth: 1,

          propsForBackgroundLines: {
            opacity: 0.2,
            strokeDasharray: "2,3",
          },
          propsForLabels: {
            fontSize: "8",
            dx: "70",
            dy: "-2",
            fontWeight: "bold",
          },
          backgroundGradientFromOpacity: 0,
          backgroundGradientToOpacity: 0,
          color: (opacity = 1) => "white",

          fillShadowGradientFrom: graphColor,
          fillShadowGradientFromOpacity: 0.5,
          fillShadowGradientTo: color.palette.noise,
          fillShadowGradientToOpacity: 0,
          fillShadowGradientFromOffset: 0,
          fillShadowGradientToOffset: 0.8,
          propsForDots: {
            r: "1",
            strokeWidth: "2",
          },
        }}
        bezier
        style={chartStyle}
      />
    </View>
  )
})
