import {NativeModules, Platform} from 'react-native';
import {AUDIO_DEVICE} from '@modules/VoiceComandModule/Types/CommonTypes';

interface AudioDeviceDetectProps {
  getConnectedAudioDevicesList(): Promise<AUDIO_DEVICE[]>;
  isMicAccessible(): Promise<boolean>;
  getConnectedAudioDevice(): Promise<AUDIO_DEVICE>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
  unregisterAudioDeviceDetect(): void;
}

const AudioDeviceDetect: AudioDeviceDetectProps =
  Platform.OS === 'android'
    ? NativeModules.AudioDeviceDetectModule
    : new Proxy(
        {
          getConnectedAudioDevicesList() {},
          isMicAccessible() {},
          getConnectedAudioDevice() {},
          addListener() {},
          removeListeners() {},
          unregisterAudioDeviceDetect() {},
        },
        {},
      );

export const {
  getConnectedAudioDevicesList,
  isMicAccessible,
  getConnectedAudioDevice,
  addListener,
  removeListeners,
  unregisterAudioDeviceDetect,
} = AudioDeviceDetect;

export default AudioDeviceDetect;
