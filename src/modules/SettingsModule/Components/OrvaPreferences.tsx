import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {Dispatch, FC, SetStateAction} from 'react';
import {StyleSheet, View} from 'react-native';
import EarconSettings from './EarconSettings';
import BluetoothDeviceStatus from './BluetoothDeviceStatus';
import useGetSettingConfigaQuery from '@modules/SettingsModule/Hooks/useGetSettingConfigQuery';
import {SETTINGS_REQUEST} from '../Types/RequestTypes';
import SpeechRecognitionSettings from './SpeechRecognitionSettings';
import {SETTINGS} from '../Types/CommonTypes';
import WWThresholdSettings from './WWThresholdSettings';
import AudioDeviceSelector from './AudioDeviceSelector';

const {colors} = theme;

interface OrvaPreferencesProps {
  onPreferenceChange: (values: SETTINGS_REQUEST) => void;
  setChangeDetected: (values: boolean) => void;
  setOrvaThreshold: Dispatch<SetStateAction<number | null>>;
  setOrvaThresholdChangeDetected: (values: boolean) => void;
}

const OrvaPreferences: FC<OrvaPreferencesProps> = ({
  onPreferenceChange,
  setChangeDetected,
  setOrvaThreshold,
  setOrvaThresholdChangeDetected,
}) => {
  const {data: settingsDetail} = useGetSettingConfigaQuery();

  const {enableEarcons, languageId} = settingsDetail ?? {};

  const onChange = (val: SETTINGS_REQUEST) => {
    onPreferenceChange?.(val);

    const isChangeDetect = Object.keys(val).some(key => {
      return (
        settingsDetail?.[key as keyof SETTINGS] !== val[key as keyof SETTINGS]
      );
    });

    setChangeDetected(isChangeDetect);
  };

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <SpeechRecognitionSettings
          languageId={languageId}
          onLanguageChange={val => onChange({languageId: val})}
        />
        <EarconSettings
          enableEarcons={enableEarcons}
          onValueChange={val => onChange({enableEarcons: val})}
        />

        <BluetoothDeviceStatus />
      </View>

      <View style={styles.subContainer}>
        <WWThresholdSettings
          setOrvaThreshold={setOrvaThreshold}
          setOrvaThresholdChangeDetected={setOrvaThresholdChangeDetected}
        />
        <AudioDeviceSelector />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: scaler(24),
    gap: scaler(64),
    flexDirection: 'row',
  },
  subContainer: {
    width: scaler(400),
    gap: scaler(24),
  },
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
});

export default OrvaPreferences;
