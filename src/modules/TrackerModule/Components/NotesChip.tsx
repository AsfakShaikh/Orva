import scaler from '@utils/Scaler';
import React, {FC} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import {theme} from '@styles/Theme';

const {colors} = theme;

type NotesChipProps = ViewStyle &
  (
    | {
        iconName: string;
        label: string;
        icon?: React.ReactNode;
      }
    | {
        icon: React.ReactNode;
        label: string;
        iconName?: string;
      }
  );

const NotesChip: FC<NotesChipProps> = ({
  iconName,
  label,
  icon,
  ...styleProps
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.chip, styleProps]}>
        {icon ?? <Icon size={scaler(16)} source={iconName} />}
        <Text style={styles.chipText}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: scaler(4),
    alignItems: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scaler(4),
    marginRight: scaler(8),
    paddingVertical: scaler(2),
    paddingHorizontal: scaler(8),
    marginTop: scaler(4),
    backgroundColor: colors.background.tertiary,
  },
  chipText: {
    fontSize: scaler(13),
    padding: scaler(2),
    color: colors.foreground.secondary,
  },
});

export default NotesChip;
