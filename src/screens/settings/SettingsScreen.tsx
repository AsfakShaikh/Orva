import Button from '@components/Button';
import {Strings} from '@locales/Localization';
import useSaveSettingsMutation from '@modules/SettingsModule/Hooks/useSaveSettingsMutation';
import OrvaPreferences from '@modules/SettingsModule/Components/OrvaPreferences';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SETTINGS_REQUEST} from '@modules/SettingsModule/Types/RequestTypes';
import {setWWThreshold} from '@nativeModules/SpeechDetection';

export default function SettingsScreen() {
  const [orvaPreferences, setOrvaPreferences] = useState<SETTINGS_REQUEST>({
    enableEarcons: true,
  });
  const [orvaThreshold, setOrvaThreshold] = useState<number | null>(null);
  const [orvaThresholdChangeDetected, setOrvaThresholdChangeDetected] =
    useState(false);
  const [orvaPrefChangeDetected, setOrvaPrefChangeDetected] = useState(false);

  const {mutate: saveSettingMutate, isPending: isSavingSetting} =
    useSaveSettingsMutation(() => setOrvaPrefChangeDetected(false));

  const saveSettings = () => {
    if (orvaPrefChangeDetected) {
      saveSettingMutate({
        timeFormat: '24_HOURS',
        enableEarcons: orvaPreferences.enableEarcons,
        languageId: orvaPreferences.languageId,
      });
    }
    if (orvaThresholdChangeDetected) {
      setWWThreshold({threshold: orvaThreshold});
      setOrvaThresholdChangeDetected(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.subMain}>
        <Text style={styles.settings}>{Strings.Settings}</Text>
        <Button
          mode="contained"
          onPress={saveSettings}
          loading={isSavingSetting}
          disabled={
            !(orvaPrefChangeDetected || orvaThresholdChangeDetected) ||
            isSavingSetting
          }>
          {Strings.Save_Settings}
        </Button>
      </View>
      <OrvaPreferences
        onPreferenceChange={val =>
          setOrvaPreferences(prev => ({...prev, ...val}))
        }
        setChangeDetected={setOrvaPrefChangeDetected}
        setOrvaThreshold={setOrvaThreshold}
        setOrvaThresholdChangeDetected={setOrvaThresholdChangeDetected}
      />
    </View>
  );
}

const {colors} = theme;

const styles = StyleSheet.create({
  subMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settings: {
    fontSize: scaler(32),
    fontWeight: '700',
    color: '#000',
  },
  commonBtn: {
    width: scaler(320),
  },
  mainContainer: {
    width: '100%',
    paddingVertical: scaler(16),
    paddingHorizontal: scaler(28),
    backgroundColor: colors.background.secondary,
  },
  container: {gap: scaler(32), alignItems: 'center', marginTop: scaler(24)},

  iconButton: {
    height: scaler(96),
    width: scaler(96),
    margin: 0,
    borderRadius: scaler(28),
  },
  title: {
    color: colors.foreground.primary,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: scaler(38),
    fontWeight: '700',
    fontSize: scaler(32),
  },
  description: {
    color: colors.foreground.primary,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: scaler(30),
    fontSize: scaler(24),
    textAlign: 'center',
  },
});
