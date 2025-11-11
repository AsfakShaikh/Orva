import React from 'react';
import {Avatar, AvatarTextProps} from 'react-native-paper';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';
import {StyleSheet} from 'react-native';

const {colors} = theme;

interface LabeledAvatarProps extends Partial<AvatarTextProps> {
  bgColor?: string;
}

const LabeledAvatar = ({
  label = 'O',
  bgColor = colors.background.primary,
  ...props
}: LabeledAvatarProps) => {
  return (
    <Avatar.Text
      size={scaler(32)}
      label={label}
      color={colors.foreground.brand}
      style={{backgroundColor: bgColor}}
      labelStyle={styles.label}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: '700',
  },
});

export default LabeledAvatar;
