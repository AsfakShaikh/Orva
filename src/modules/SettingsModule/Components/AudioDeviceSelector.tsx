import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {theme} from '@styles/Theme';
import InputSelect from '@components/InputSelect';
import {useForm} from 'react-hook-form';
import AudioDeviceDetect from '@nativeModules/AudioDeviceDetect';
import {SELECT_OPTIONS} from '@utils/Types';
import {AUDIO_DEVICE} from '@modules/VoiceComandModule/Types/CommonTypes';
import useSystemValues, {
  updateSystemValue,
} from '@modules/VoiceComandModule/Hooks/useSystemValues';
import SpeechDetection from '@nativeModules/SpeechDetection';

const {colors} = theme;

const AudioDeviceSelector = () => {
  const [audioDevices, setAudioDevices] = useState<Array<AUDIO_DEVICE>>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const {connectedDevice} = useSystemValues();

  const fetchAudioDevices = async () => {
    setLoadingDevices(true);
    try {
      const list = await AudioDeviceDetect.getConnectedAudioDevicesList();
      setAudioDevices(
        list.filter((device: AUDIO_DEVICE) => device.isMicAccessible),
      );
    } catch (e) {
      console.log('Error fetching audio devices', e);
    }
    setLoadingDevices(false);
  };

  const audioDevicesList = useMemo(() => {
    return audioDevices.reduce(
      (acc: SELECT_OPTIONS, device: AUDIO_DEVICE) => {
        if (device.isMicAccessible) {
          acc.push({
            key: device.deviceName ?? '',
            value: device.id ?? '',
          });
        }
        return acc;
      },
      [{key: 'System Default', value: null}],
    );
  }, [audioDevices]);

  const {control, setValue} = useForm({
    defaultValues: {
      audioDevice: connectedDevice?.id ?? null,
    },
  });

  useEffect(() => {
    fetchAudioDevices();
    setValue('audioDevice', connectedDevice?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedDevice]);

  return (
    <View>
      <Text style={styles.title}>{Strings.Audio_Device}</Text>
      <Text style={styles.desc}>{Strings.Audio_Device_Selector_Desc}</Text>

      <InputSelect
        control={control}
        name="audioDevice"
        options={audioDevicesList}
        placeholder={Strings.Audio_Device}
        isGettingOptions={loadingDevices}
        style={styles.audioDeviceInput}
        onSelect={val => {
          const selectedDevice = audioDevices.find(device => device.id === val);

          SpeechDetection.switchMicrophone({
            preferredDeviceId: selectedDevice?.id,
            preferredDeviceType: selectedDevice?.type,
            preferredDeviceName: selectedDevice?.deviceName,
          });

          if (val) {
            updateSystemValue({
              connectedDevice: selectedDevice,
            });
          }
        }}
      />
    </View>
  );
};

export default AudioDeviceSelector;

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
  audioDeviceInput: {
    marginTop: scaler(24),
  },
});
