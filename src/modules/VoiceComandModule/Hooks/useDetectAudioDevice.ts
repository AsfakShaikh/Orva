import {Linking, NativeEventEmitter} from 'react-native';
import {useCallback, useEffect, useState} from 'react';
import {Strings} from '@locales/Localization';
import AudioDeviceDetect from '@nativeModules/AudioDeviceDetect';
import useSystemValues, {updateSystemValue} from './useSystemValues';
import {getDeviceName} from 'react-native-device-info';
import {AUDIO_DEVICE} from '../Types/CommonTypes';
import {BottomSnackbarHandler} from '@components/BottomSnackbar';
import Icons from '@assets/Icons';

export default function useDetectAudioDevice() {
  const {connectedDevice, currentDevice} = useSystemValues();
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>();

  const getCurrentDeviceName = async () => {
    const currentDeviceName = await getDeviceName();

    updateSystemValue({
      currentDevice: {deviceName: currentDeviceName},
    });
  };

  const getConnectedAudioDevice = useCallback(async () => {
    const device: AUDIO_DEVICE =
      await AudioDeviceDetect.getConnectedAudioDevice();
    if (device) {
      updateSystemValue({
        connectedDevice: device,
      });

      if (device?.isMicAccessible) {
        BottomSnackbarHandler.successToast({
          title: `${connectedDevice?.deviceName} ${Strings.Connected}`,
          description: `${device?.deviceName} has been detected via ${String(
            device?.connectionType,
          ).toLowerCase()} and is ready for use with Orva.`,
          rightIcon: Icons.Headphone,
        });
      } else {
        BottomSnackbarHandler.errorToast({
          title: Strings.No_Microphone_Access_Title,
          description: Strings.No_Microphone_Access_Subtitle,
          actionBtnDetails: {
            label: Strings.Open_Settings,
            onPress: Linking.openSettings,
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getCurrentDeviceName();

    AudioDeviceDetect.getConnectedAudioDevice().then((res: AUDIO_DEVICE) => {
      if (res) {
        setIsDeviceConnected(true);
        updateSystemValue({
          connectedDevice: res,
        });
      }
    });

    const eventEmitter = new NativeEventEmitter(AudioDeviceDetect);

    eventEmitter.addListener('AUDIO_DEVICE_STATE_CHANGE_EVENT', state => {
      setIsDeviceConnected(state?.isAudioDeviceConnected);
    });

    return () => {
      eventEmitter.removeAllListeners('AUDIO_DEVICE_STATE_CHANGE_EVENT');
    };
  }, []);

  useEffect(() => {
    if (isDeviceConnected === true) {
      setTimeout(() => {
        getConnectedAudioDevice();
      }, 1000);
    }
    if (isDeviceConnected === false) {
      BottomSnackbarHandler.errorToast({
        title: Strings.Bluetooth_device_Disconnected,
        description: `${connectedDevice?.deviceName} has been disconnected. Audio and microphone will revert back to ${currentDevice?.deviceName}`,
        rightIcon: Icons.Headphone,
      });
      setTimeout(() => {
        updateSystemValue({
          connectedDevice: undefined,
        });
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDevice?.deviceName, getConnectedAudioDevice, isDeviceConnected]);

  return {
    isDeviceConnected,
  };
}
