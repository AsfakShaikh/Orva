import {View, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import React, {ReactNode} from 'react';
import {Text} from 'react-native-paper';
import scaler from '@utils/Scaler';

type TableCellProps = Readonly<{
  title?: string;
  children?: string | ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}>;

export default function TableCell({
  title,
  children,
  containerStyle,
}: TableCellProps) {
  return (
    <View style={[styles.tableCell, containerStyle]}>
      {title || typeof children === 'string' ? (
        <Text
          variant="bodyLarge"
          numberOfLines={2}
          style={[{textTransform: 'capitalize'}]}>
          {title ?? children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tableCell: {flex: 1, paddingHorizontal: scaler(0)},
});
