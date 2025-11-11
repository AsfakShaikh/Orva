import Switch from '@components/Switch';
import {Strings} from '@locales/Localization';
import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {FC} from 'react';
import {StyleSheet, Text, View} from 'react-native';
const {colors} = theme;

interface EarconSettingsProps {
  enableEarcons?: boolean;
  onValueChange?: (val: boolean) => void;
}

const EarconSettings: FC<EarconSettingsProps> = ({
  enableEarcons,
  onValueChange,
}) => {
  return (
    <View>
      <Text style={styles.title}>{Strings.Earcon_Notifications}</Text>

      <View style={styles.earconSettingsCard}>
        <View style={globalStyles.flex1}>
          <Text style={[globalStyles.blackText, {marginBottom: scaler(2)}]}>
            {Strings.Allow_audio_alerts}
          </Text>
          <Text style={styles.desc}>{Strings.Allow_audio_alerts_desc}</Text>
        </View>

        <Switch value={enableEarcons} onValueChange={onValueChange} />
      </View>
    </View>
  );
};

export default EarconSettings;

const styles = StyleSheet.create({
  title: {
    fontSize: scaler(18),
    fontWeight: '700',
    lineHeight: scaler(24),
    color: colors.foreground.primary,
    marginBottom: scaler(6),
  },
  desc: {
    fontSize: scaler(12),
    lineHeight: scaler(18),
    color: colors.foreground.primary,
  },
  earconSettingsCard: {
    flexDirection: 'row',
    gap: scaler(48),
  },
});
