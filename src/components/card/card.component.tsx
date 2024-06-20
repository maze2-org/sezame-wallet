import React, {PropsWithChildren} from 'react';
import {Text, View} from 'react-native';
import styles from './card.styles';

type CardPropsType = PropsWithChildren & {
  title: string;
};

export function Card({children, title}: CardPropsType) {
  return (
    <View style={styles.CARD}>
      <View style={styles.CARD_BODY}>
        <Text style={styles.CARD_HEADER}>{title}</Text>
        {children}
      </View>
    </View>
  );
}
