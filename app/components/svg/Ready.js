import * as React from "react";
import Svg, { Path, Circle } from "react-native-svg";

const Ready = (props) => (
  <Svg
    width={25}
    height={25}
    viewBox="0 0 85 86"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M74.1461 34.3287V23.78C74.1461 18.9251 70.2104 14.9894 65.3555 14.9894H19.6445C14.7896 14.9894 10.8539 18.9251 10.8539 23.78V36.0868"
      stroke={props.isActive ?  "#CDAA38" : "white"}
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M74.1461 51.9095V62.4583C74.1461 67.3132 70.2104 71.2488 65.3555 71.2488H46.0162"
      stroke={props.isActive ?  "#CDAA38" : "white"}
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M65.3558 34.3284H74.1464C76.0883 34.3284 77.6626 35.9026 77.6626 37.8446V48.3933C77.6626 50.3353 76.0883 51.9095 74.1464 51.9095H65.3558C60.5009 51.9095 56.5652 47.9739 56.5652 43.119V43.119C56.5652 38.264 60.5009 34.3284 65.3558 34.3284V34.3284Z"
      stroke={props.isActive ?  "#CDAA38" : "white"}
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx={23.1609}
      cy={58.9422}
      r={15.8231}
      stroke={props.isActive ?  "#CDAA38" : "white"}
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M28.4815 55.8091L21.8359 62.4508L17.8406 58.4674"
      stroke={props.isActive ?  "#CDAA38" : "white"}
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Ready;
