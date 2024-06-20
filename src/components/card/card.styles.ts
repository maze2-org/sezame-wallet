import {TextStyle, ViewStyle} from 'react-native';
import {color, spacing} from 'theme';

const CARD: ViewStyle = {
  display: 'flex',
  flex: 1,
  backgroundColor: color.palette.darkBrown,
  margin: spacing[2],
  borderRadius: 10,
};

const CARD_BODY: ViewStyle = {
  padding: spacing[3],
};
const CARD_HEADER: TextStyle = {
  color: color.primaryDarker,
  fontSize: 15,
};

export default {CARD, CARD_BODY, CARD_HEADER};
