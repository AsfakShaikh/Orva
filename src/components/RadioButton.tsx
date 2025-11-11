import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

const {colors} = theme;

interface RadioButtonProps {
  label?: string | number;
  value: any;
  onPress?: (value?: string) => void;
  isSelected?: boolean;
  size?: number;
}

const RadioButton: FC<RadioButtonProps> = ({
  label,
  value,
  onPress,
  isSelected,
  size = scaler(20),
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(value)}
      style={styles?.container}>
      <View
        style={[
          globalStyles.center,
          {
            borderWidth: scaler(1),
            borderRadius: size / 2,
            width: size,
            height: size,
            padding: scaler(4),
            borderColor: isSelected
              ? colors.border.activity
              : colors.border.inactive,
          },
        ]}>
        {isSelected && (
          <View
            style={[
              styles.selectedBox,
              {
                borderRadius: size / 2,
              },
            ]}
          />
        )}
      </View>
      {label && <Text style={styles.text}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {flexDirection: 'row', alignItems: 'center'},
  text: {fontSize: scaler(18), marginLeft: scaler(12)},
  selectedBox: {
    backgroundColor: colors.background.activity,
    width: '100%',
    height: '100%',
  },
});

export default RadioButton;
