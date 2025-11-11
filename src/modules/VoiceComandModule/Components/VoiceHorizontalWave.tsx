import useEventEmitter from '@hooks/useEventEmitter';
import React, {FC} from 'react';
import {ViewStyle} from 'react-native';
import {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {VOICE_CAPABILITIES_EVENT} from '../Types/CommonTypes';

import SignalBar from '@components/SignalBar';

interface VoiceHorizontalWaveProps extends ViewStyle {}

const VoiceHorizontalWave: FC<VoiceHorizontalWaveProps> = props => {
  const flexAnim = useSharedValue(0);

  useEventEmitter(
    VOICE_CAPABILITIES_EVENT.AUDIO_DECIBEL,
    (audioDecibel: number = -60) => {
      flexAnim.value = (audioDecibel + 60) / 60;
    },
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      flex: flexAnim.value,
    };
  });

  return <SignalBar.Wave animatedStyle={animatedStyle} {...props} />;
};

export default VoiceHorizontalWave;
