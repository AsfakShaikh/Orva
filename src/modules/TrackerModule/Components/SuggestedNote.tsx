import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import React, {FC} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Icon} from 'react-native-paper';
import {theme} from '@styles/Theme';
import {SUGGESTED_NOTE, SUGGESTED_NOTE_OPTION} from '../Types/CommonTypes';

const {colors} = theme;

interface SuggestedNoteProps {
  width: number;
  item: SUGGESTED_NOTE;
  completedSuggestedNotes: Array<string>;
}

const SuggestedNote: FC<SuggestedNoteProps> = ({
  width,
  item,
  completedSuggestedNotes,
}) => {
  return (
    <View style={[styles.itemContainer, {width}]}>
      <Text numberOfLines={2} style={styles.subheading}>
        "e.g: {item?.description}..."
      </Text>
      <View style={[globalStyles.rowCenter, {gap: scaler(24)}]}>
        {item?.options?.map((option: SUGGESTED_NOTE_OPTION) => {
          const isCompleted = completedSuggestedNotes.includes(option?.label);
          return (
            <View
              key={option?.label}
              style={[
                styles.chip,
                {
                  paddingHorizontal: isCompleted ? scaler(10) : scaler(16),
                },
              ]}>
              {isCompleted && (
                <Icon
                  source={'check-circle'}
                  size={scaler(18)}
                  color={colors.foreground.progress}
                />
              )}
              <Text style={styles.chipText}>{option?.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    gap: scaler(24),
    justifyContent: 'flex-end',
  },
  subheading: {
    fontSize: scaler(16),
    color: colors.foreground.inactive,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaler(18),
    backgroundColor: colors.background.primary,
    gap: scaler(4),
    borderRadius: scaler(30),
    borderWidth: scaler(1),
    borderColor: colors.border.inactive,
  },
  chipText: {
    lineHeight: scaler(18),
    fontSize: scaler(16),
    fontWeight: '500',
    color: colors.foreground.primary,
  },
});

export default SuggestedNote;
