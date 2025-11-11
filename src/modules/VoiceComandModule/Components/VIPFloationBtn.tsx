import scaler from '@utils/Scaler';
import React from 'react';
import {StyleSheet} from 'react-native';
import {IconButton} from 'react-native-paper';
import {theme} from '@styles/Theme';
import {
  resetSpeechProcessing,
  setWWDetected,
} from '@nativeModules/SpeechDetection';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {VOICE_COMAND_STATUS} from '../Types/CommonTypes';
import {useKeyboard} from '@hooks/useKeyboard';
import Icons from '@assets/Icons';
import useDetectAudioDevice from '../Hooks/useDetectAudioDevice';
const {colors} = theme;

const VIPFloationBtn = () => {
  const {isKeyboardVisible} = useKeyboard();
  const {isDeviceConnected} = useDetectAudioDevice();

  return isKeyboardVisible ? null : (
    <IconButton
      icon={renderIcon}
      style={[
        styles.button,
        {
          backgroundColor: isDeviceConnected
            ? colors.background.error
            : colors.foreground.brand,
        },
      ]}
      onPress={() => {
        resetSpeechProcessing();
        setWWDetected(true);
        fireSetStausEvent(VOICE_COMAND_STATUS.LISTENING);
      }}
    />
  );
};

const renderIcon = () => {
  return <Icons.Headphone width={scaler(32)} height={scaler(32)} />;
};

export default VIPFloationBtn;

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: scaler(20),
    left: scaler(16),
    width: scaler(56),
    height: scaler(56),
    borderRadius: scaler(28),
    shadowColor: colors.background.inverse,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
