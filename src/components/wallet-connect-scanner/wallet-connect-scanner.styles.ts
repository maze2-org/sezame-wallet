import {ViewStyle, StyleSheet} from 'react-native';
import {color} from 'theme';

const WALLETCONNECT_CONTAINER: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.8)',
};

const WALLETCONNECT_CONTAINER_INNER: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 10,
};

const WALLETCONNECT_BOX: ViewStyle = {
  width: '90%',
  height: '60%',
  borderRadius: 8,
  alignItems: 'center',
  padding: 16,
  //   justifyContent: 'center',
  backgroundColor: color.palette.darkBrown,
};

export default {
  WALLETCONNECT_CONTAINER,
  WALLETCONNECT_CONTAINER_INNER,
  WALLETCONNECT_BOX,
};
