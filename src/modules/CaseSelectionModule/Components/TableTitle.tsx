import scaler from '@utils/Scaler';
import React, {ReactNode} from 'react';
import {StyleProp, ViewStyle, TouchableOpacity, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

type TableTitleProps = Readonly<{
  title?: string;
  children?: ReactNode;
  rightIcon?: any;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}>;

export default function TableTitle({
  title,
  children,
  rightIcon,
  onPress,
  containerStyle,
}: TableTitleProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tableHeaderCell, containerStyle]}>
      {title || typeof children === 'string' ? (
        <Text
          variant="bodyLarge"
          numberOfLines={1}
          // eslint-disable-next-line react-native/no-inline-styles
          style={[styles.boldTitle, {marginRight: rightIcon ? scaler(8) : 0}]}>
          {title ?? children}
        </Text>
      ) : (
        children
      )}
      {rightIcon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tableHeaderCell: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  boldTitle: {
    fontWeight: 'bold',
  },
});
