import * as React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

const TabNft = (props) => (
  <Svg
    width={25}
    height={25}
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Circle
      cx={12.0115}
      cy={12.5}
      r={1.5}
      stroke={props.isActive ?  "#CDAA38" : "white"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.92081 7.5H8.51147C7.68305 7.5 7.01147 8.17157 7.01147 9V16C7.01147 16.8284 7.68305 17.5 8.51147 17.5H15.5115C16.3399 17.5 17.0115 16.8284 17.0115 16V9C17.0115 8.17157 16.3399 7.5 15.5115 7.5H13.0115C12.4592 7.5 12.0115 7.94772 12.0115 8.5V11"
      stroke={props.isActive ?  "#CDAA38" : "white"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      x={3.01147}
      y={3.5}
      width={18}
      height={18}
      rx={5}
      stroke={props.isActive ?  "#CDAA38" : "white"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default TabNft;
