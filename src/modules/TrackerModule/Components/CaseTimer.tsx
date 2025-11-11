import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import scaler from '@utils/Scaler';
import Button from '@components/Button';
import GlobalTimer from '@components/GlobalTimer';
import {Strings} from '@locales/Localization';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import {theme} from '@styles/Theme';
import useEventEmitter from '@hooks/useEventEmitter';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {
  NAVIGATION_INTENTS_ARRAY,
  VOICE_COMAND_STATUS,
  VOICE_INETENT_EVENT,
  VOICE_INTENT,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import {USER_ACTION} from '../Types/CommonTypes';
import CurrentMilestoneButton, {
  CurrentMilestoneButtonRefType,
} from './CurrentMilestoneButton';
import AnesthesiaMilestoneButton, {
  AnesthesiaMilestoneButtonRefType,
} from './AnesthesiaMilestoneButton';
import TimeoutMilestoneButton, {
  TimeoutMilestoneButtonRefType,
} from './TimeoutMilestoneButton';
import {
  MILESTONE_TRACKER_STEPS,
  OPTIONAL_MILESTONE_TRACKER_STEPS,
} from '@utils/Constants';
import {BottomSnackbarHandler} from '@components/BottomSnackbar';
import {Icon} from 'react-native-paper';
import {globalStyles} from '@styles/GlobalStyles';

const {colors} = theme;

const NOT_ACCEPTED_VOICE_INTENT = new Set([
  VOICE_INTENT.VOICE_NOTE,
  VOICE_INTENT.ON_DEMAND_ALERTS,
  VOICE_INTENT.SET_TIMER,
  VOICE_INTENT.SET_ALARM,
  VOICE_INTENT.DELETE_ALL_TOOLS,
  VOICE_INTENT.PAUSE_ALL_TOOLS,
  VOICE_INTENT.RESUME_ALL_TIMERS,
  VOICE_INTENT.DISMISS_ALL_TOOLS,
  VOICE_INTENT.DISMISS_TOOL,
  VOICE_INTENT.DELETE_TOOL,
  VOICE_INTENT.PAUSE_TOOL,
  VOICE_INTENT.RESUME_TOOL,
  VOICE_INTENT.NAVIGATE_TO_CASE_SUMMARY,
  VOICE_INTENT.NAVIGATE_TO_CASES,
  VOICE_INTENT.YES,
  VOICE_INTENT.NO,
  VOICE_INTENT.CANCEL,
]);

const anesthesiaVoiceIntentMapping = {
  [VOICE_INTENT.ANAESTHESIA_START]: {
    milestone: OPTIONAL_MILESTONE_TRACKER_STEPS.ANESTHESIA_START,
    skip: false,
  },
  [VOICE_INTENT.SKIP_ANAESTHESIA_START]: {
    milestone: OPTIONAL_MILESTONE_TRACKER_STEPS.ANESTHESIA_START,
    skip: true,
  },
  [VOICE_INTENT.PATIENT_ASLEEP]: {
    milestone: OPTIONAL_MILESTONE_TRACKER_STEPS.PATIENT_ASLEEP,
    skip: false,
  },
  [VOICE_INTENT.SKIP_PATIENT_ASLEEP]: {
    milestone: OPTIONAL_MILESTONE_TRACKER_STEPS.PATIENT_ASLEEP,
    skip: true,
  },
  [VOICE_INTENT.PATIENT_AWAKE]: {
    milestone: OPTIONAL_MILESTONE_TRACKER_STEPS.PATIENT_AWAKE,
    skip: false,
  },
  [VOICE_INTENT.SKIP_PATIENT_AWAKE]: {
    milestone: OPTIONAL_MILESTONE_TRACKER_STEPS.PATIENT_AWAKE,
    skip: true,
  },
};

interface CaseTimerProps {
  setActiveTab?: Dispatch<SetStateAction<number>>;
  comments?: string;
}

const CaseTimer: React.FC<CaseTimerProps> = ({setActiveTab, comments}) => {
  const {currentActiveCase} = useTrackerValue();
  const {displayName: milestoneDisplayName, waitingText: milestoneWaitingText} =
    currentActiveCase?.currentMilestone ?? {};

  const [voiceIntent, setVoiceIntent] = useState<VOICE_INTENT>();

  const currentMilestoneButtonRef = useRef<CurrentMilestoneButtonRefType>(null);
  const anesthesiaMilestoneButtonRef =
    useRef<AnesthesiaMilestoneButtonRefType>(null);
  const timeoutMilestoneButtonRef = useRef<TimeoutMilestoneButtonRefType>(null);

  const {isDisableNextMilestoneBtn, handleNextMilestone} =
    currentMilestoneButtonRef.current ?? {};

  const {
    isAnesthesiaMilestoneActive = false,
    isAnesthesiaMilestonesCompleted = false,
    isDisableAnesthesiaMilestoneButton = false,
    currentAnesthesiaMilestoneName = '',
    showAnesthesiaMilestoneAlert,
    handleNextAnesthesiaMilestone,
  } = anesthesiaMilestoneButtonRef.current ?? {};

  const {
    isTimeoutMilestoneActive = false,
    showTimeoutMilestoneAlert,
    handleTimeoutMilestone,
  } = timeoutMilestoneButtonRef.current ?? {};

  const isWheelsOutMilestone = useMemo(
    () => milestoneDisplayName === MILESTONE_TRACKER_STEPS.WHEELS_OUT,
    [milestoneDisplayName],
  );

  const onWrongVoiceIntent = useCallback((isShowPanel: boolean = false) => {
    fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE, isShowPanel);
  }, []);

  const showMilestoneAlert = useCallback(() => {
    if (isAnesthesiaMilestoneActive) {
      showAnesthesiaMilestoneAlert?.();
      return;
    }
    if (isTimeoutMilestoneActive) {
      showTimeoutMilestoneAlert?.();
    }
  }, [
    isAnesthesiaMilestoneActive,
    isTimeoutMilestoneActive,
    showAnesthesiaMilestoneAlert,
    showTimeoutMilestoneAlert,
  ]);

  const submitMilestone = useCallback(
    (isSkipped: boolean = false) => {
      if (isDisableNextMilestoneBtn) {
        onWrongVoiceIntent();
        showMilestoneAlert();
      } else {
        fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
        handleNextMilestone?.(isSkipped, USER_ACTION.VOICE);
      }
    },
    [
      isDisableNextMilestoneBtn,
      onWrongVoiceIntent,
      showMilestoneAlert,
      handleNextMilestone,
    ],
  );

  useEventEmitter(VOICE_INETENT_EVENT, (voiceIntentData: VOICE_INTENT) => {
    if (NOT_ACCEPTED_VOICE_INTENT.has(voiceIntentData)) {
      return;
    }
    setVoiceIntent(voiceIntentData);
  });

  const handleAnesthesiaIntents = useCallback(
    (intent: VOICE_INTENT) => {
      const {milestone, skip} =
        anesthesiaVoiceIntentMapping[
          intent as keyof typeof anesthesiaVoiceIntentMapping
        ];
      if (currentAnesthesiaMilestoneName === milestone) {
        handleNextAnesthesiaMilestone?.(skip, USER_ACTION.VOICE);
      } else {
        onWrongVoiceIntent();
        isAnesthesiaMilestonesCompleted &&
          BottomSnackbarHandler.infoToast({
            title: Strings.Patient_awake_has_recorded_heading,
            description: Strings.Patient_awake_has_recorded_subheading,
          });
      }
    },
    [
      currentAnesthesiaMilestoneName,
      handleNextAnesthesiaMilestone,
      isAnesthesiaMilestonesCompleted,
      onWrongVoiceIntent,
    ],
  );

  const onVoiceIntentReceive = useCallback(() => {
    if (!voiceIntent) {
      return;
    }
    // Handle anesthesia intents
    if (voiceIntent in anesthesiaVoiceIntentMapping) {
      handleAnesthesiaIntents(voiceIntent);
      return;
    }

    switch (voiceIntent) {
      case VOICE_INTENT.TIMEOUT:
        handleTimeoutMilestone?.(USER_ACTION.VOICE);
        break;
      case VOICE_INTENT.SKIP_ENTRY:
        submitMilestone(true);
        break;
      case VOICE_INTENT.SUBMIT_AND_CLOSE_THE_CASE:
        onWrongVoiceIntent(true);
        break;
      default:
        if (isWheelsOutMilestone) {
          break;
        }
        if (
          voiceIntent?.toLowerCase() === milestoneDisplayName?.toLowerCase()
        ) {
          submitMilestone();
        }
        if (
          voiceIntent?.toLowerCase() !== milestoneDisplayName?.toLowerCase() &&
          !NAVIGATION_INTENTS_ARRAY.includes(voiceIntent as VOICE_INTENT)
        ) {
          onWrongVoiceIntent(true);
        }
        break;
    }
  }, [
    voiceIntent,
    handleAnesthesiaIntents,
    handleTimeoutMilestone,
    submitMilestone,
    onWrongVoiceIntent,
    isWheelsOutMilestone,
    milestoneDisplayName,
  ]);

  useEffect(() => {
    onVoiceIntentReceive();
    setVoiceIntent(undefined);
  }, [onVoiceIntentReceive]);

  const isAnesthesiaCase = useMemo(() => {
    return currentActiveCase?.anesthesiaType !== 'NO_ANESTHESIA';
  }, [currentActiveCase?.anesthesiaType]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>{milestoneWaitingText}</Text>
        <Button
          icon={'account-voice'}
          onPress={() => setActiveTab?.(1)}
          contentStyle={{
            height: scaler(42),
          }}
          // style={styles.btn}
          labelStyle={{fontSize: scaler(14)}}>
          "{Strings.View_Summary}"
        </Button>
      </View>

      <View
        style={[
          globalStyles.colCenter,
          {
            gap: scaler(12),
          },
        ]}>
        <GlobalTimer
          // fullWidth
          textStyle={{color: colors.foreground.primary}}
          containerStyle={{gap: scaler(14)}}
        />

        {/* Buttons Array */}
        <View style={styles.actions}>
          {/* Anaesthesia Start */}
          {isAnesthesiaCase && (
            <AnesthesiaMilestoneButton ref={anesthesiaMilestoneButtonRef} />
          )}
          {/* Timeout */}
          <TimeoutMilestoneButton ref={timeoutMilestoneButtonRef} />
          {/* Submit Current Milestone */}
          <CurrentMilestoneButton
            ref={currentMilestoneButtonRef}
            setActiveTab={setActiveTab}
            comments={comments}
            isAnesthesiaMilestoneActive={isAnesthesiaMilestoneActive}
            isTimeoutMilestoneActive={isTimeoutMilestoneActive}
            showOptionalMilestoneAlert={showMilestoneAlert}
          />
        </View>

        {/* Skip  */}
        {!isWheelsOutMilestone && (
          <View style={styles.buttonContainer}>
            {isAnesthesiaCase && !isAnesthesiaMilestonesCompleted && (
              <Button
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
                textColor={
                  isDisableAnesthesiaMilestoneButton ||
                  isDisableNextMilestoneBtn
                    ? colors.onSurfaceDisabled
                    : colors.foreground.brand
                }
                icon={() =>
                  renderButtonIcon(
                    isDisableAnesthesiaMilestoneButton ||
                      isDisableNextMilestoneBtn,
                  )
                }
                onPress={() =>
                  handleNextAnesthesiaMilestone?.(true, USER_ACTION.TAP)
                }>
                {`"${Strings.Skip} ${currentAnesthesiaMilestoneName}"`}
              </Button>
            )}
            <Button
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
              textColor={
                isDisableNextMilestoneBtn
                  ? colors.onSurfaceDisabled
                  : colors.foreground.brand
              }
              icon={() => renderButtonIcon(isDisableNextMilestoneBtn)}
              onPress={() => handleNextMilestone?.(true, USER_ACTION.TAP)}>
              {Strings.Skip_Entry}
            </Button>
          </View>
        )}
      </View>
    </View>
  );
};

const renderButtonIcon = (isDisableBtn?: boolean) => {
  return (
    <Icon
      source="account-voice"
      size={scaler(12)}
      color={isDisableBtn ? colors.onSurfaceDisabled : colors.foreground.brand}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 9,
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: scaler(16),
    padding: scaler(16),
    paddingTop: scaler(8),
  },
  actions: {
    flexDirection: 'row',
    gap: scaler(16),
    marginBottom: scaler(4),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scaler(16),
    marginTop: scaler(4),
  },
  buttonContent: {
    height: scaler(42),
  },
  buttonLabel: {
    fontSize: scaler(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaler(8),
    marginRight: -scaler(16),
  },
  heading: {
    flex: 1,
    fontSize: scaler(22),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: colors?.foreground.primary,
  },
});

export default CaseTimer;
