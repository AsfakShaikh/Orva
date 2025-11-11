import {StyleProp, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import React from 'react';
import {Control, Controller, RegisterOptions} from 'react-hook-form';
import {Icon, Text, useTheme} from 'react-native-paper';
import scaler from '@utils/Scaler';

export type InputCheckboxProps = Readonly<{
  control: Control<any>;
  name: string;
  rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
  isError?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}>;

export default function InputCheckbox(Props: InputCheckboxProps) {
  const {control, name, rules, label = 'Label', style} = Props;
  const {colors} = useTheme();
  return (
    <Controller
      control={control}
      rules={rules}
      name={name}
      render={({field}) => {
        const fieldValue = field?.value;
        return (
          <TouchableOpacity
            onPress={() => field?.onChange(!fieldValue)}
            style={[styles.container, style]}>
            <Icon
              source={fieldValue ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={scaler(24)}
              color={fieldValue ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={{fontSize: scaler(16), marginLeft: scaler(24)}}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: scaler(10),
  },
});
