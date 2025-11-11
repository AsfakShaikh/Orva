import scaler from '@utils/Scaler';
import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Button as PaperButton,
  ButtonProps as PaperButtonProps,
} from 'react-native-paper';

export default function Button(Props: PaperButtonProps) {
  const {children, contentStyle, style, ...props} = Props;
  return (
    <PaperButton
      contentStyle={[styles.buttonContainer, contentStyle]}
      style={[styles.buttonStyle, style]}
      {...props}>
      {children}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    height: scaler(56),
  },
  buttonStyle: {
    borderRadius: scaler(28),
  },
});
