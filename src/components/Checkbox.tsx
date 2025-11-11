import scaler from '@utils/Scaler';
import React from 'react';
import {Icon, useTheme} from 'react-native-paper';

type CheckboxProps = Readonly<{
  isChecked?: boolean;
  size?: number;
}>;

export default function Checkbox(Props: CheckboxProps) {
  const {isChecked, size = scaler(24)} = Props;

  const {colors} = useTheme();
  return (
    <Icon
      source={isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
      size={size}
      color={isChecked ? colors.primary : colors.onSurfaceVariant}
    />
  );
}
