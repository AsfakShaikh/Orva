import {TouchableOpacity, StyleSheet} from 'react-native';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import scaler from '@utils/Scaler';
import Icons from '@assets/Icons';
import {IconsColors, theme} from '@styles/Theme';
import {
  VOICE_CAPABILITIES_EVENT,
  VOICE_COMAND_STATUS,
} from '../Types/CommonTypes';
import useVoiceCapabilities from '../Hooks/useVoiceCapabilities';
import useAudioPlayer from '@hooks/useAudioPlayer';
import Audios from '@assets/audio';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import useGetSettingConfigaQuery from '@modules/SettingsModule/Hooks/useGetSettingConfigQuery';
import useDetectAudioDevice from '../Hooks/useDetectAudioDevice';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import useEventEmitter from '@hooks/useEventEmitter';
const {colors} = theme;

type AppBarOrvaProps = Readonly<{
  status: VOICE_COMAND_STATUS;
  setStatus: Dispatch<SetStateAction<VOICE_COMAND_STATUS>>;
}>;

export default function AppBarOrva(Props: AppBarOrvaProps) {
  const {user} = useAuthValue();

  const {status, setStatus} = Props;

  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const scaleAnim = useSharedValue(1);
  const rotateAnim = useSharedValue(0);

  const {playAudio} = useAudioPlayer();

  const {setWWDetected, resetSpeechProcessing} = useVoiceCapabilities(
    user?.username,
    (isDetected: boolean) => {
      setWakeWordDetected(isDetected);
    },
  );
  const {isDeviceConnected} = useDetectAudioDevice(); // NOTE: Make sure this must be called after useVoiceCapabilitie()
  const StatusIcons = {
    [VOICE_COMAND_STATUS.DEFAULT]: isDeviceConnected ? (
      <Icons.Headphone />
    ) : (
      <Icons.Dot />
    ),
    [VOICE_COMAND_STATUS.LISTENING]: <Icons.Microphone />,
    [VOICE_COMAND_STATUS.LOADING]: <Icons.Loading />,
    [VOICE_COMAND_STATUS.POSITIVE]: <Icons.Check />,
    [VOICE_COMAND_STATUS.NEGATIVE]: <Icons.Error />,
  };

  const handleIconPress = useCallback(() => {
    resetSpeechProcessing();
    if (wakeWordDetected) {
      setWWDetected(false);
      setStatus(VOICE_COMAND_STATUS.DEFAULT);
    } else {
      setWWDetected(true);
      setStatus(VOICE_COMAND_STATUS.LISTENING);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeWordDetected]);

  const {data: settingsDetail} = useGetSettingConfigaQuery();

  useEffect(() => {
    if (wakeWordDetected) {
      setStatus(VOICE_COMAND_STATUS.LISTENING);
      if (settingsDetail?.enableEarcons !== false) {
        playAudio(Audios.Awake);
      }
    } else {
      scaleAnim.value = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeWordDetected]);

  useEventEmitter(
    VOICE_CAPABILITIES_EVENT.AUDIO_DECIBEL,
    (audioDecibel: number = -60) => {
      scaleAnim.value = 1 + ((audioDecibel + 60) / 60) * 0.5;
    },
  );

  useEventEmitter(
    VOICE_CAPABILITIES_EVENT.PROCESSING_INTENT,
    (processingIntent: boolean) => {
      if (processingIntent) {
        setStatus(VOICE_COMAND_STATUS.LOADING);
      }
    },
  );

  useEffect(() => {
    if (status === VOICE_COMAND_STATUS.LOADING) {
      rotateAnim.value = withRepeat(
        withTiming(rotateAnim.value + 360, {
          duration: 1 * 1000, // 1 sec
        }),
        -1,
        false,
      );
    } else {
      rotateAnim.value = 0;
    }
  }, [rotateAnim, status]);

  const rotateAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotateAnim.value}deg`, // Apply rotation in degrees
        },
      ],
    };
  });

  return (
    <TouchableOpacity onPress={handleIconPress} style={styles.icon}>
      <Animated.View
        style={[
          styles.animatedView,
          {
            transform: [
              {scale: status === VOICE_COMAND_STATUS.LISTENING ? scaleAnim : 1},
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.iconView,
          {
            backgroundColor: IconsColors[status],
          },
          rotateAnimatedStyle,
        ]}>
        {StatusIcons[status]}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: scaler(56),
    width: scaler(56),
    borderRadius: scaler(16),
    backgroundColor: colors?.background.inverse,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaler(10),
  },
  iconView: {
    height: scaler(35),
    width: scaler(35),
    borderRadius: scaler(35),
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedView: {
    borderRadius: scaler(50),
    height: scaler(35),
    width: scaler(35),
    position: 'absolute',
    backgroundColor: colors?.border?.core,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
