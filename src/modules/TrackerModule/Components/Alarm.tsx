import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {TimerProps} from './Timer';
import {differenceInMilliseconds} from 'date-fns';
import useAudioPlayer from '@hooks/useAudioPlayer';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import {TimerActionsProps} from './TimersList';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {VOICE_COMAND_STATUS} from '../../VoiceComandModule/Types/CommonTypes';
import {
  TIMER_ACTION,
  TIMER_STATUS,
  TIMER_ACTIONS_EVENT,
} from '../Types/CommonTypes';
import getTimerTimeDifference from '../Helpers/getTimerTimeDifference';
import Audios from '@assets/audio';
import useUpdateTimerMutation from '../Hooks/useUpdateTimerMutation';
import Animated, {
  Easing,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {theme} from '@styles/Theme';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import BorderProgress from '@components/BorderProgress';
import scaler from '@utils/Scaler';
import {Card, IconButton} from 'react-native-paper';
import {StyleSheet, Text, View} from 'react-native';
import {toggleDeleteTimerModal} from './DeleteTimerModal';
import Button from '@components/Button';
import {Strings} from '@locales/Localization';
import {globalStyles} from '@styles/GlobalStyles';
import Icons from '@assets/Icons';
import capitalize from '@helpers/capitalize';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import useDeleteTimerMutation from '../Hooks/useDeleteTimerMutation';
import checkIsMilestonePassed from '../Helpers/checkIsMilestonePassed';

const {colors} = theme;

const MILESTONE_ALARM_TRIGGER_EVENT = 'MILESTONE_ALARM_TRIGGER_EVENT';

export const fireMilestoneAlarmTrigger = (milestoneName?: string) => {
  emitEvent(MILESTONE_ALARM_TRIGGER_EVENT, milestoneName);
};

interface AlarmProps extends TimerProps {}

const Alarm: FC<AlarmProps> = ({detail, isExpanded = false, onPress}) => {
  const {duration, description, type, endTime, trigger} = detail ?? {};

  const isMilestoneAlarm = useMemo(() => {
    return !endTime;
  }, [endTime]);

  const completedDuration = useMemo(() => {
    if (endTime) {
      return (
        duration - Math.max(0, differenceInMilliseconds(endTime, new Date()))
      );
    }
    return 0;
  }, [duration, endTime]);

  const remainingDuration = useMemo(() => {
    if (endTime) {
      return Math.max(0, differenceInMilliseconds(endTime, new Date()));
    }
    return 0;
  }, [endTime]);

  const remainingDurationSeconds = useMemo(
    () => Math.floor(remainingDuration / 1000),
    [remainingDuration],
  );

  const {currentActiveCase} = useTrackerValue();
  const {playAudio} = useAudioPlayer();

  const [countdownDuration, setCountdownDuration] = useState(
    remainingDurationSeconds,
  );
  const [isDismissEnable, setIsDismissEnable] = useState(
    !isMilestoneAlarm && remainingDurationSeconds <= 0,
  );
  const [alarmActionData, setAlarmActionData] = useState<TimerActionsProps>();
  const [milestoneAlarmTrigger, setMilestoneAlarmTrigger] = useState<string>();

  const {mutate: updateTimerMutate} = useUpdateTimerMutation();
  const {mutate: deleteTimerMutate} = useDeleteTimerMutation();

  useEventEmitter(TIMER_ACTIONS_EVENT, (data?: TimerActionsProps) => {
    setAlarmActionData(data);
  });

  useEventEmitter(MILESTONE_ALARM_TRIGGER_EVENT, (data?: string) => {
    setMilestoneAlarmTrigger(data);
  });

  // Dismiss Alarm Effect
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (!isMilestoneAlarm && remainingDuration <= 0) {
      setIsDismissEnable(true);
    }
    if (!isMilestoneAlarm && remainingDuration > 0) {
      timeout = setTimeout(() => {
        setIsDismissEnable(true);
        playAudio(Audios.Alarm);
      }, remainingDuration);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingDurationSeconds, isMilestoneAlarm]);

  // Dismiss Milestone Alarm Effect
  useEffect(() => {
    if (isMilestoneAlarm) {
      if (milestoneAlarmTrigger?.toLowerCase() === trigger?.toLowerCase()) {
        setIsDismissEnable(true);
        playAudio(Audios.Alarm);
        return;
      }
      if (
        checkIsMilestonePassed(
          currentActiveCase?.currentMilestone?.milestoneId,
          trigger,
          currentActiveCase?.procedure?.milestones,
        )
      ) {
        setIsDismissEnable(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isMilestoneAlarm,
    currentActiveCase?.currentMilestone?.milestoneId,
    trigger,
    milestoneAlarmTrigger,
  ]);

  // Countdown Alarm effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (
      !(isDismissEnable && countdownDuration <= 0) &&
      remainingDurationSeconds > 0 &&
      endTime
    ) {
      interval = setInterval(() => {
        setCountdownDuration(getTimerTimeDifference(endTime));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isDismissEnable, remainingDurationSeconds, countdownDuration, endTime]);

  const widthAnimatedStyle = useAnimatedStyle(() => {
    let alarmWidth = 88;
    if (isExpanded) {
      alarmWidth = 300;
    }
    if (!isExpanded && isDismissEnable) {
      alarmWidth = 300;
    }

    return {
      width: withTiming(alarmWidth, {
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

  const onDismissAlarm = useCallback(() => {
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

  // Effect to handle Alarm Action from Voice Command
  useEffect(() => {
    if (alarmActionData && alarmActionData?.timerId === detail?.id) {
      switch (alarmActionData.timerAction) {
        case TIMER_ACTION.PAUSE:
        case TIMER_ACTION.RESUME:
          fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
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
            onDismissAlarm();
          } else {
            fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
          }
          break;
        default:
          break;
      }
    }
  }, [
    detail?.id,
    isDismissEnable,
    onDismissAlarm,
    alarmActionData,
    currentActiveCase?.id,
    deleteTimerMutate,
  ]);

  if (!currentActiveCase) {
    return null;
  }

  const isExpandedOrDismissEnable = isExpanded || isDismissEnable;

  const renderAlarm = () => (
    <Card onPress={onPress} style={styles.card}>
      <Animated.View style={[styles.cardContent, bgAnimatedStyle]}>
        <View style={styles.container}>
          <Text numberOfLines={1} style={styles.cardText}>
            {endTime
              ? formatDateTime(endTime, FORMAT_DATE_TYPE.UTC, 'hh:mm a')
              : capitalize(trigger)}
          </Text>
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
              onPress={onDismissAlarm}
              labelStyle={styles.btnLabelStyle}
              compact
              style={styles.btnStyle}
              contentStyle={styles.btnContentStyle}>
              "{Strings.Dismiss}"
            </Button>
          )}
        </View>
        <View style={styles.bodyContainer}>
          {isExpandedOrDismissEnable && <Icons.AlarmClock />}
          <View style={globalStyles.flex1}>
            <Text
              numberOfLines={isExpandedOrDismissEnable ? 1 : 3}
              style={
                isExpandedOrDismissEnable ? styles.title : styles.collapsedTitle
              }>
              {description}
            </Text>
            {isExpandedOrDismissEnable && (
              <Text style={styles.type}>{capitalize(type)}</Text>
            )}
          </View>
        </View>
      </Animated.View>
    </Card>
  );

  return (
    <Animated.View style={[widthAnimatedStyle, {marginVertical: scaler(3)}]}>
      {!isMilestoneAlarm ? (
        <BorderProgress
          duration={duration}
          completedDuration={completedDuration}>
          {renderAlarm()}
        </BorderProgress>
      ) : (
        renderAlarm()
      )}
    </Animated.View>
  );
};

export default Alarm;

const styles = StyleSheet.create({
  card: {
    borderRadius: scaler(18),
    backgroundColor: colors.background.primary,
    width: '100%',
    overflow: 'hidden',
  },
  cardContent: {
    padding: scaler(16),
    minHeight: scaler(92),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bodyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: scaler(8),
    gap: scaler(6),
  },
  cardText: {
    marginLeft: scaler(2),
    fontWeight: '600',
    fontSize: scaler(14),
    color: colors.foreground.primary,
    flex: 1,
  },
  title: {
    fontSize: scaler(16),
    fontWeight: '500',
    color: colors.foreground.primary,
    marginTop: -scaler(3),
  },
  collapsedTitle: {
    fontSize: scaler(10),
    fontWeight: '500',
    color: colors.foreground.primary,
    marginTop: -scaler(3),
  },
  type: {
    fontSize: scaler(10),
    color: colors.foreground.primary,
  },
  btnStyle: {
    borderRadius: 0,
  },
  btnLabelStyle: {
    fontSize: scaler(12),
    lineHeight: scaler(16),
    marginVertical: 0,
    marginRight: 0,
    marginLeft: scaler(4),
  },
  btnContentStyle: {
    height: null,
  },
});
