import {Strings} from '@locales/Localization';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import Button from '@components/Button';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {toggleVoiceIntractionPanel} from '../../VoiceComandModule/Components/VoiceIntractionPanel';
import {
  TIMER_ACTION,
  TIMER_ACTION_CAPTURED_EVENT,
  TIMER_ACTIONS_EVENT,
  TIMER_STATUS,
  TIMER_TYPE,
  TIMERS_ACTIONS_INTENT_ARRAY,
  VOICE_NOTE_TYPE,
} from '../Types/CommonTypes';
import Timer from '../../TrackerModule/Components/Timer';
import FlatListView from '@components/FlatListView';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import useGetTimersListQuery from '../Hooks/useGetTimersListQuery';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import useDismissAllTimersMutation from '../Hooks/useDismissAllTimersMutation';
import usePauseAllTimerMutation from '../Hooks/usePauseAllTimerMutation';
import useResumeAllTimerMutation from '../Hooks/useResumeAllTimerMutation';
import useDeleteAllTimersMutation from '../Hooks/useDeleteAllTimersMutation';
import useCreateTimerMutation from '../Hooks/useCreateTimerMutation';
import {fireVoiceNoteListScrollEvent} from './VoiceNotesList';
import TImerSkeleton from '../../TrackerModule/Components/TImerSkeleton';
import Icons from '@assets/Icons';
import {IconButton} from 'react-native-paper';
import {toggleManageNotesTimerModal} from '../../TrackerModule/Components/ManageNotesTimersModal';
import {initiateSetTimer} from '../../VoiceComandModule/Helpers/initiateIntents';
import {findTimer} from '@nativeModules/SpeechDetection';
import Alarm from '../../TrackerModule/Components/Alarm';
import extractErrorMessage from '@helpers/extractErrorMessage';
import {
  VOICE_INTRACTION_PANEL_MODE,
  VOICE_COMAND_STATUS,
  DISPLAY_INFO_PANEL_STATUS,
  VOICE_INTENT,
} from '@modules/VoiceComandModule/Types/CommonTypes';

const {colors} = theme;

interface TimerActionData {
  voiceIntent?: VOICE_INTENT | null;
  voiceTranscription?: string | null;
}

export interface TimerActionsProps {
  timerId: number;
  timerAction: TIMER_ACTION;
}

export function fireTimerActionsEvent(timerActionData?: TimerActionsProps) {
  emitEvent(TIMER_ACTIONS_EVENT, timerActionData);
}

export function fireTimerActionCapturedEvent(data: TimerActionData) {
  emitEvent(TIMER_ACTION_CAPTURED_EVENT, data);
}

type TimersListProps = {
  showHeader?: boolean;
};

const TimersList = ({showHeader = true}: TimersListProps) => {
  const {currentActiveCase} = useTrackerValue();

  const [isExpanded, setIsExpanded] = useState<number | null>(null);
  const [timerActionData, setTimerActionData] = useState<TimerActionData>({
    voiceIntent: null,
    voiceTranscription: null,
  });

  const {voiceIntent, voiceTranscription} = timerActionData;

  const flatListRef = useRef<FlatList>(null);

  const {data: timersList} = useGetTimersListQuery(currentActiveCase?.id);

  const filteredTimersList = useMemo(() => {
    return timersList?.filter(timer => timer?.status !== TIMER_STATUS.STOPPED);
  }, [timersList]);

  useEventEmitter(TIMER_ACTION_CAPTURED_EVENT, (data: TimerActionData) => {
    setTimerActionData(data);
  });

  const {mutate: createTimerMutate, isPending: isCreatingTimer} =
    useCreateTimerMutation();
  const {mutate: dismissAllTimersMutate} = useDismissAllTimersMutation();
  const {mutate: pauseAllTimerMutate} = usePauseAllTimerMutation();
  const {mutate: resumeAllTimerMutate} = useResumeAllTimerMutation();
  const {mutate: deleteAllTimersMutate} = useDeleteAllTimersMutation();

  const onSetTimer = useCallback(() => {
    if (!voiceTranscription || !currentActiveCase?.id) {
      return;
    }

    createTimerMutate(
      {
        query: voiceTranscription,
        caseId: currentActiveCase?.id,
      },
      {
        onSuccess: () => {
          fireVoiceNoteListScrollEvent();
          toggleVoiceIntractionPanel({
            mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
            data: {
              title: Strings.Timer_Tracker_Captured + '!',
              type: DISPLAY_INFO_PANEL_STATUS.SUCCESS,
            },
          });
        },
        onError: error => {
          toggleVoiceIntractionPanel({
            isVisible: true,
            mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
            data: {
              title: extractErrorMessage(
                error,
                Strings.Time_Tracker_Capture_Error,
              ),
              type: DISPLAY_INFO_PANEL_STATUS.ERROR,
            },
          });
          setTimeout(() => {
            toggleVoiceIntractionPanel({isVisible: false});
            fireSetStausEvent(VOICE_COMAND_STATUS.DEFAULT);
          }, 3000);
        },
      },
    );
  }, [voiceTranscription, currentActiveCase?.id, createTimerMutate]);

  const handleTimerAction = useCallback(
    (action: TIMER_ACTION) => {
      if (
        !currentActiveCase?.id ||
        !voiceTranscription ||
        !(filteredTimersList && filteredTimersList?.length > 0)
      ) {
        fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
        return;
      }
      fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
      findTimer(filteredTimersList, voiceTranscription).then(timerId => {
        fireTimerActionsEvent({
          timerId: parseInt(timerId, 10),
          timerAction: action,
        });
      });
    },
    [currentActiveCase?.id, filteredTimersList, voiceTranscription],
  );

  // Used to handle the dismiss all timers voice intent
  const handleDismissAllTimers = useCallback(() => {
    const nonDismissableMilstoneAlarms = filteredTimersList?.reduce<
      Array<number>
    >((acc, timer) => {
      if (
        timer?.type === TIMER_TYPE.ALARM &&
        !timer?.endTime &&
        timer?.trigger?.toLowerCase() !==
          currentActiveCase?.currentMilestone?.displayName?.toLowerCase()
      ) {
        acc.push(timer?.id);
      }
      return acc;
    }, []);

    if (
      currentActiveCase?.id &&
      filteredTimersList?.length &&
      filteredTimersList?.length > 0
    ) {
      fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
      dismissAllTimersMutate({
        caseId: currentActiveCase?.id,
        excludeTimerIds: nonDismissableMilstoneAlarms,
      });
    } else {
      fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
    }
  }, [
    filteredTimersList,
    currentActiveCase?.id,
    currentActiveCase?.currentMilestone?.displayName,
    dismissAllTimersMutate,
  ]);

  // Used to handle the voice intent event
  const onVoiceIntentReceive = useCallback(() => {
    if (!currentActiveCase?.id) {
      fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
      return;
    }

    switch (voiceIntent) {
      case VOICE_INTENT.SET_TIMER:
      case VOICE_INTENT.SET_ALARM:
        onSetTimer();
        break;
      case VOICE_INTENT.DELETE_ALL_TOOLS:
        fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
        deleteAllTimersMutate({
          caseId: currentActiveCase?.id,
        });
        break;
      case VOICE_INTENT.PAUSE_ALL_TOOLS:
        fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
        pauseAllTimerMutate({caseId: currentActiveCase?.id});
        break;
      case VOICE_INTENT.RESUME_ALL_TIMERS:
        fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
        resumeAllTimerMutate({caseId: currentActiveCase?.id});
        break;
      case VOICE_INTENT.DISMISS_ALL_TOOLS:
        handleDismissAllTimers();
        break;
      case VOICE_INTENT.DELETE_TOOL:
        handleTimerAction(TIMER_ACTION.DELETE);
        break;
      case VOICE_INTENT.PAUSE_TOOL:
        handleTimerAction(TIMER_ACTION.PAUSE);
        break;
      case VOICE_INTENT.RESUME_TOOL:
        handleTimerAction(TIMER_ACTION.RESUME);
        break;
      case VOICE_INTENT.DISMISS_TOOL:
        handleTimerAction(TIMER_ACTION.DISMISS);
        break;
      default:
        break;
    }
  }, [
    currentActiveCase?.id,
    voiceIntent,
    onSetTimer,
    deleteAllTimersMutate,
    pauseAllTimerMutate,
    resumeAllTimerMutate,
    handleDismissAllTimers,
    handleTimerAction,
  ]);

  // Effect is used to handle the voice intent event
  useEffect(() => {
    if (voiceIntent) {
      if (
        voiceIntent === VOICE_INTENT.SET_TIMER ||
        voiceIntent === VOICE_INTENT.SET_ALARM ||
        (filteredTimersList?.length && filteredTimersList?.length > 0)
      ) {
        onVoiceIntentReceive();
      } else if (TIMERS_ACTIONS_INTENT_ARRAY.includes(voiceIntent)) {
        fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
      }
      setTimerActionData({
        voiceIntent: null,
        voiceTranscription: null,
      });
    }
  }, [onVoiceIntentReceive, voiceIntent, filteredTimersList?.length]);

  // Effect is used to set loading in voice intration panel
  useEffect(() => {
    if (isCreatingTimer) {
      toggleVoiceIntractionPanel({
        mode: VOICE_INTRACTION_PANEL_MODE.LOADING,
        data: {
          title: Strings.Capturing_Time_Tracker,
        },
      });
    }
  }, [isCreatingTimer]);

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.heading}>{Strings.Timers}</Text>
          <Button
            icon={'account-voice'}
            onPress={initiateSetTimer}
            contentStyle={{
              height: scaler(42),
            }}
            style={styles.btn}
            labelStyle={{fontSize: scaler(14)}}>
            "{Strings.Set_Timer}"
          </Button>
          <IconButton
            onPress={() =>
              toggleManageNotesTimerModal({
                type: VOICE_NOTE_TYPE.TIMER_NOTE,
                caseId: currentActiveCase?.id,
              })
            }
            icon={renderAddNoteButton}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              marginVertical: 0,
            }}
          />
        </View>
      )}
      <FlatListView
        ref={flatListRef}
        contentContainerStyle={{
          marginVertical: scaler(8),
        }}
        data={filteredTimersList}
        horizontal={true}
        renderItem={({item, index}) =>
          item?.type === TIMER_TYPE.TIMER ? (
            <Timer
              key={item.id + '-' + item.status}
              isExpanded={isExpanded === index}
              detail={item}
              onPress={() =>
                setIsExpanded(prev => (prev === index ? null : index))
              }
            />
          ) : (
            <Alarm
              key={item.id + '-' + item.status}
              isExpanded={isExpanded === index}
              detail={item}
              onPress={() =>
                setIsExpanded(prev => (prev === index ? null : index))
              }
            />
          )
        }
        ListEmptyComponent={
          !isCreatingTimer ? (
            <Text style={styles.placeholder}>{Strings.Timers_Placeholder}</Text>
          ) : null
        }
        ListFooterComponent={<View style={{width: scaler(3)}} />}
        ListHeaderComponent={
          <View style={{minWidth: scaler(3)}}>
            {isCreatingTimer && <TImerSkeleton />}
          </View>
        }
        itemSeperatorSize={scaler(8)}
      />
    </View>
  );
};

const renderAddNoteButton = () => {
  return <Icons.TextAdd />;
};

const styles = StyleSheet.create({
  container: {
    flex: 9,
    backgroundColor: colors.background.primary,
    borderRadius: scaler(16),
    padding: scaler(16),
    paddingTop: scaler(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -scaler(16),
  },
  heading: {
    flex: 1,
    fontSize: scaler(18),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: colors?.foreground.primary,
  },
  placeholder: {
    fontSize: scaler(16),
    color: colors.foreground.inactive,
  },
  scrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: scaler(5),
  },
  btn: {
    borderRadius: 0,
    marginRight: -scaler(16),
  },
});

export default TimersList;
