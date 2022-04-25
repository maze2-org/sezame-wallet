import React, {
  ReactNode,
  useEffect,
  useRef,
} from "react"
import {
  Animated,
} from "react-native"

type DIRECTIONS = 'TOP' | 'BOTTOM';

interface Props {
  direction: DIRECTIONS,
  children:ReactNode
}

const AnimatedComponent = ({direction, children}: Props) => {
  const directionAnim = useRef(new Animated.Value(0)).current;

  useEffect(()=>{

    Animated.spring(directionAnim, {
      toValue: 1,
      damping: 15,
      mass:1,
      useNativeDriver: true,
    }).start()

  },[])


  const getInterpolatedStyles = ()=>{
    const opacity = directionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    })


    const DIRECTIONS_MAP = {
      TOP: -150,
      BOTTOM: 150,
    }

    const translateY = directionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [DIRECTIONS_MAP[direction], 0]
    })


    return {
      opacity,
      transform: [{translateY}]
    };
  }

  return (
    <Animated.View style={getInterpolatedStyles()}>
      {children}
    </Animated.View>
  )
}
export default AnimatedComponent
