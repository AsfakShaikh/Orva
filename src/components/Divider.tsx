import { View, ViewProps } from 'react-native';
import React from 'react';
import scaler from '@utils/Scaler';
import { theme } from '@styles/Theme';

type DividerProp = {
  direction?: 'horizontal' | 'vertical';
  backgroundColor?: string;
  height?: number;
  width?: number;
} & ViewProps;

export default function Divider(Props: DividerProp) {
  const { colors } = theme;
  const {
    direction = 'horizontal',
    backgroundColor = colors.border.subtle,
    height = scaler(1),
    width = scaler(1),
    style,
    ...props
  } = Props;
  return (
    <View
      style={[
        direction === 'horizontal'
          ? { height: height }
          : { width: width, height: height },
        { backgroundColor: backgroundColor },
        style,
      ]}
      {...props}
    />
  );
}
