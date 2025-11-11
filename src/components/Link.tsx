import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import React, {FC} from 'react';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';

const {colors} = theme;

interface LinkProps {
  onPress?: () => void;
  text?: string;
  disabled?: boolean;
  containerProps?: TouchableOpacityProps;
  textStyle?: StyleProp<TextStyle>;
}

const Link: FC<LinkProps> = ({
  onPress,
  text,
  disabled = false,
  containerProps,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      {...containerProps}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{opacity: disabled ? 0.5 : 1}}>
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    marginVertical: scaler(24),
    fontSize: scaler(18),
    color: colors.foreground.activity,
    textDecorationLine: 'underline',
  },
});

export default Link;
