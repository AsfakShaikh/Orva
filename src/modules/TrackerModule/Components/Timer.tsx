import scaler from '@utils/Scaler';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Card, Icon, IconButton} from 'react-native-paper';
import {VOICE_COMAND_STATUS} from '../../VoiceComandModule/Types/CommonTypes';
import {
  TIMER,
  TIMER_ACTION,
  TIMER_ACTIONS_EVENT,
  TIMER_STATUS,
} from '../Types/CommonTypes';
import {theme} from '@styles/Theme';
import {toggleDeleteTimerModal} from './DeleteTimerModal';
import {globalStyles} from '@styles/GlobalStyles';
import BorderProgress from '@components/BorderProgress';
import Animated, {
  Easing,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import {Strings} from '@locales/Localization';
import Button from '@components/Button';
import useUpdateTimerMutation from '../Hooks/useUpdateTimerMutation';
import useDebounce from '@hooks/useDebounce';
import formatTimerSec from '@helpers/formatTimerSec';
import useAudioPlayer from '@hooks/useAudioPlayer';
import Audios from '@assets/audio';
import getTimerTimeDifference from '../Helpers/getTimerTimeDifference';
import useEventEmitter from '@hooks/useEventEmitter';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {TimerActionsProps} from './TimersList';
import capitalize from '@helpers/capitalize';
import {differenceInMilliseconds} from 'date-fns';
import useDeleteTimerMutation from '../Hooks/useDeleteTimerMutation';
import formatMilliSeconds from '@helpers/formatMilliSeconds';
const {colors} = theme;

export interface TimerProps {
  detail: TIMER;
  onPress?: () => void;
  isExpanded?: boolean;
}

const MAX_PAUSE_DURATION = 1000 * 60 * 10; // 10 minutes

const Timer: FC<TimerProps> = ({detail, isExpanded = false, onPress}) => {
  const {
    status,
    duration,
    description,
    type,
    completedDuration: completedDurationMs,
    pauseTime,
    endTime,
  } = detail ?? {};
  const isPaused = status === TIMER_STATUS.PAUSED;

  const completedDuration = useMemo(() => {
    let cd = completedDurationMs;
    if (endTime) {
      cd =
        duration - Math.max(0, differenceInMilliseconds(endTime, new Date()));
    }
    return Math.max(0, cd);
  }, [endTime, completedDurationMs, duration]);

  const remainingDuration = useMemo(() => {
    let rd = duration - completedDuration;
    return Math.max(0, rd);
  }, [duration, completedDuration]);

  const remainingDurationSeconds = useMemo(
    () => Math.floor(remainingDuration / 1000),
    [remainingDuration],
  );

  const {isLongPause, remainingPauseDuration} = useMemo(() => {
    const pauseDuration =
      isPaused && pauseTime instanceof Date
        ? Date.now() - pauseTime.getTime()
        : 0;
    return {
      isLongPause: pauseDuration >= MAX_PAUSE_DURATION,
      remainingPauseDuration: MAX_PAUSE_DURATION - pauseDuration,
    };
  }, [isPaused, pauseTime]);

  const {currentActiveCase} = useTrackerValue();
  const {playAudio} = useAudioPlayer();

  const nowRef = useRef(new Date());
  const timerControlPressedRef = useRef(false);
  const longPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [countdownDuration, setCountdownDuration] = useState(
    remainingDurationSeconds,
  );
  const [paused, setPaused] = useState(isPaused);
  const [longPaused, setLongPaused] = useState(isLongPause);
  const [isDismissEnable, setIsDismissEnable] = useState(
    completedDuration >= duration,
  );
  const [timerActionData, setTimerActionData] = useState<TimerActionsProps>();

  const debouncedPaused = useDebounce(paused, 300) as boolean;

  const finalEndTime = useMemo(() => {
    if (isPaused && !debouncedPaused && endTime && pauseTime) {
      const endTimeMs = new Date(endTime).getTime();
      const pauseTimeMs = new Date(pauseTime).getTime();
      const nowMs = nowRef.current.getTime();
      return new Date(endTimeMs + (nowMs - pauseTimeMs));
    }
    return endTime;
  }, [debouncedPaused, endTime, pauseTime, isPaused]);

  const {mutate: updateTimerMutate} = useUpdateTimerMutation();
  const {mutate: deleteTimerMutate} = useDeleteTimerMutation();

  useEventEmitter(TIMER_ACTIONS_EVENT, (data?: TimerActionsProps) => {
    setTimerActionData(data);
  });

  // Dismiss Timer Effect
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (!debouncedPaused) {
      if (remainingDuration <= 0) {
        setIsDismissEnable(true);
      }
      if (remainingDuration > 0) {
        timeout = setTimeout(() => {
          setIsDismissEnable(true);
          playAudio(Audios.Alarm);
        }, remainingDuration);
      }
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPaused, remainingDurationSeconds]);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (
      !(isDismissEnable && countdownDuration <= 0) &&
      !debouncedPaused &&
      remainingDurationSeconds > 0 &&
      finalEndTime
    ) {
      interval = setInterval(() => {
        setCountdownDuration(getTimerTimeDifference(finalEndTime));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    debouncedPaused,
    isDismissEnable,
    remainingDurationSeconds,
    finalEndTime,
    countdownDuration,
  ]);

  // Setting Long Pause effect
  useEffect(() => {
    if (debouncedPaused && !isLongPause) {
      longPauseTimeoutRef.current = setTimeout(() => {
        setLongPaused(true);
      }, remainingPauseDuration);
    }
    if (!debouncedPaused && longPauseTimeoutRef.current) {
      clearTimeout(longPauseTimeoutRef.current);
      longPauseTimeoutRef.current = null;
    }
    if (!debouncedPaused && longPaused) {
      setLongPaused(false);
    }
    return () => {
      if (longPauseTimeoutRef.current) {
        clearTimeout(longPauseTimeoutRef.current);
        longPauseTimeoutRef.current = null;
      }
    };
  }, [debouncedPaused, isLongPause, remainingPauseDuration, longPaused]);

  // Update Timer Effect
  useEffect(() => {
    if (currentActiveCase?.id && timerControlPressedRef.current) {
      updateTimerMutate({
        timerId: detail?.id,
        caseId: currentActiveCase?.id,
        timerData: {
          status: debouncedPaused ? TIMER_STATUS.PAUSED : TIMER_STATUS.RUNNING,
          pauseTime: debouncedPaused ? nowRef.current : null,
          resumeTime: debouncedPaused ? null : nowRef.current,
        },
      });
    }
    timerControlPressedRef.current = false;
  }, [currentActiveCase?.id, debouncedPaused, detail?.id, updateTimerMutate]);

  const widthAnimatedStyle = useAnimatedStyle(() => {
    let timerWidth = 88;
    if (isExpanded) {
      timerWidth = 300;
    }
    if (!isExpanded && isDismissEnable) {
      timerWidth = 300;
    }

    return {
      width: withTiming(timerWidth, {
        duration: 500,
        easing: Easing.inOut(Easing.quad),
      }),
    };
  });

  const bgAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: isDismissEnable
        ? withRepeat(
            withSequence(
              withTiming(colors.background.tertiary, {duration: 500}),
              withTiming(colors.background.primary, {duration: 500}),
            ),
            -1,
            true,
          )
        : colors.background.primary,
    };
  });

  const onDismissTimer = useCallback(() => {
    currentActiveCase?.id &&
      updateTimerMutate({
        timerId: detail?.id,
        caseId: currentActiveCase?.id,
        timerData: {
          status: TIMER_STATUS.STOPPED,
          dismissTime: new Date(),
        },
      });
  }, [currentActiveCase?.id, detail?.id, updateTimerMutate]);

  const onResumePauseTimer = useCallback(() => {
    nowRef.current = new Date();
    setPaused(prev => !prev);
    timerControlPressedRef.current = true;
  }, []);

  // Effect to handle Timer Action from Voice Command
  useEffect(() => {
    if (timerActionData && timerActionData?.timerId === detail?.id) {
      switch (timerActionData.timerAction) {
        case TIMER_ACTION.PAUSE:
          !paused && onResumePauseTimer();
          break;
        case TIMER_ACTION.RESUME:
          paused && onResumePauseTimer();
          break;
        case TIMER_ACTION.DELETE:
          !isDismissEnable &&
            currentActiveCase?.id &&
            deleteTimerMutate({
              caseId: currentActiveCase?.id,
              timerId: detail?.id,
            });
          break;
        case TIMER_ACTION.DISMISS:
          if (isDismissEnable) {
            onDismissTimer();
          } else {
            fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
          }
          break;
        default:
          break;
      }
    }
  }, [
    currentActiveCase?.id,
    deleteTimerMutate,
    detail?.id,
    isDismissEnable,
    onDismissTimer,
    onResumePauseTimer,
    paused,
    timerActionData,
  ]);

  if (!currentActiveCase) {
    return null;
  }

  const timerIcon = (() => {
    if (longPaused) {
      return 'information';
    }
    if (paused) {
      return 'play';
    }
    return 'pause';
  })();

  const isExpandedOrDismissEnable = isExpanded || isDismissEnable;

  return (
    <Animated.View style={[widthAnimatedStyle, {marginVertical: scaler(3)}]}>
      <BorderProgress
        filledColor={debouncedPaused ? '#888888' : '#65558F'}
        duration={duration}
        completedDuration={completedDuration}
        isPaused={debouncedPaused}>
        <Card onPress={onPress} style={styles.card_t}>
          <Animated.View style={[styles.cardContent_t, bgAnimatedStyle]}>
            <View style={styles.container_t}>
              {!isDismissEnable && (
                <IconButton
                  style={{
                    width: scaler(16),
                    height: scaler(16),
                    margin: scaler(0),
                  }}
                  size={scaler(16)}
                  icon={timerIcon}
                  iconColor={
                    longPaused ? colors.foreground.warning : colors.primary
                  }
                  onPress={onResumePauseTimer}
                />
              )}
              <Text style={styles.cardText_t}>
                {
                  formatTimerSec(
                    countdownDuration < 0 ? 0 : countdownDuration,
                    true,
                  ).formattedTime
                }
              </Text>
              <View style={globalStyles.flex1} />
              {isExpanded && !isDismissEnable && (
                <IconButton
                  onPress={() =>
                    toggleDeleteTimerModal({
                      timerId: detail?.id,
                      caseId: currentActiveCase?.id,
                      timerType: type,
                    })
                  }
                  style={{
                    width: scaler(16),
                    height: scaler(16),
                    margin: scaler(0),
                  }}
                  size={scaler(16)}
                  icon="delete-outline"
                  iconColor={colors?.foreground?.attention}
                />
              )}
              {isDismissEnable && (
                <Button
                  icon={'account-voice'}
                  onPress={onDismissTimer}
                  labelStyle={styles.btnLabelStyle_t}
                  compact
                  style={styles.btnStyle_t}
                  contentStyle={styles.btnContentStyle_t}>
                  "{Strings.Dismiss}"
                </Button>
              )}
            </View>
            <View style={styles.bodyContainer_t}>
              {isExpandedOrDismissEnable && (
                <Icon size={scaler(18)} source="history" color="#000" />
              )}
              <View style={globalStyles.flex1}>
                <Text
                  numberOfLines={isExpandedOrDismissEnable ? 1 : 3}
                  style={
                    isExpandedOrDismissEnable
                      ? styles.title_t
                      : styles.collapsedTitle_t
                  }>
                  {longPaused ? Strings.Paused_for_10_min : description}
                </Text>
                {isExpandedOrDismissEnable && (
                  <View
                    style={[
                      globalStyles.row,
                      {justifyContent: 'space-between'},
                    ]}>
                    <Text style={styles.type_t}>{capitalize(type)}</Text>
                    {(isExpanded || isDismissEnable) && (
                      <Text style={styles.type_t}>
                        {formatMilliSeconds(duration, true)}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        </Card>
      </BorderProgress>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card_t: {
    borderRadius: scaler(18),
    backgroundColor: colors.background.primary,
    width: '100%',
    overflow: 'hidden',
  },
  cardContent_t: {
    padding: scaler(16),
    minHeight: scaler(92),
  },
  container_t: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bodyContainer_t: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: scaler(8),
    gap: scaler(6),
  },
  cardText_t: {
    marginLeft: scaler(2),
    fontWeight: '600',
    fontSize: scaler(14),
    color: colors.foreground.primary,
  },
  title_t: {
    fontSize: scaler(16),
    fontWeight: '500',
    color: colors.foreground.primary,
    marginTop: -scaler(3),
  },
  collapsedTitle_t: {
    fontSize: scaler(10),
    fontWeight: '500',
    color: colors.foreground.primary,
    marginTop: -scaler(3),
  },
  type_t: {
    fontSize: scaler(10),
    color: colors.foreground.primary,
  },
  btnStyle_t: {
    borderRadius: 0,
  },
  btnLabelStyle_t: {
    fontSize: scaler(12),
    lineHeight: scaler(16),
    marginVertical: 0,
    marginRight: 0,
    marginLeft: scaler(4),
  },
  btnContentStyle_t: {
    height: null,
  },
});

export default Timer;
