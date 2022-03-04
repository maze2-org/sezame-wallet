import * as React from "react"
import { Dimensions, StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { LineChart } from "react-native-chart-kit"
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
  marginVertical: 8,
  borderRadius: 16,
}
/**
 * Describe your component here
 */
export const PriceChart = observer(function PriceChart(props: PriceChartProps) {
  const { style } = props
  const styles = Object.assign({}, CONTAINER, style)

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
        width={Dimensions.get("window").width} // from react-native
        height={220}
        yAxisLabel="$"
        yAxisSuffix="k"
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundGradientFrom: color.primary,
          backgroundGradientTo: color.palette.black,
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => color.primary,

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
