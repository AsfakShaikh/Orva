import {StyleSheet, View} from 'react-native';
import React from 'react';
import {Text} from 'react-native-paper';
import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';

type NoActiveCasesBlockProps = Readonly<{
  isFocused?: boolean;
}>;

export default function NoActiveCasesBlock({
  isFocused = true,
}: NoActiveCasesBlockProps) {
  return (
    <View
      style={[
        styles.container,
        isFocused ? styles.focusedView : styles.nonFocusedView,
      ]}>
      <Text
        style={[
          styles.text,
          isFocused ? styles.focusedText : styles.nonFocusedText,
        ]}>
        {Strings.No_active_case_running_for_this_OT}
      </Text>
    </View>
  );
}

const {colors} = theme;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    borderWidth: scaler(1),
    borderRadius: scaler(4),
    borderColor: colors?.border.default,
  },

  focusedView: {backgroundColor: colors.background.primary},
  nonFocusedView: {
    backgroundColor: colors.background.navigation,
  },
  text: {
    textAlign: 'center',
  },
  focusedText: {
    color: colors.foreground.primary,
  },
  nonFocusedText: {
    color: colors.foreground.inactive,
  },
});
