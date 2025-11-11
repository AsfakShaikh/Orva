import React, {
  Dispatch,
  forwardRef,
  SetStateAction,
  useCallback,
  useImperativeHandle,
  useMemo,
} from 'react';
import WheelsOutBtn from './WheelsOutBtn';
import Button from '@components/Button';
import useTrackerValue from '../Hooks/useTrackerValues';
import {MILESTONE_TRACKER_STEPS, SOCKET_EVENTS} from '@utils/Constants';
import {StyleSheet} from 'react-native';
import scaler from '@utils/Scaler';
import {USER_ACTION} from '../Types/CommonTypes';
import useUpdateMilestone from '../Hooks/useUpdateMilestone';
import {Strings} from '@locales/Localization';
import {UPDATE_MILESTONE_REQUEST} from '../Types/RequestTypes';
import {getAuthValue} from '@modules/AuthModule/Hooks/useAuthValue';
import {toggleVoiceIntractionPanel} from '@modules/VoiceComandModule/Components/VoiceIntractionPanel';
import {
  DISPLAY_INFO_PANEL_STATUS,
  VOICE_INTRACTION_PANEL_MODE,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import {fireMilestoneAlarmTrigger} from './Alarm';
import {appLogEventSocketInstance} from '@navigation/Router';
import {theme} from '@styles/Theme';
import {Icon} from 'react-native-paper';

const {colors} = theme;

export interface CurrentMilestoneButtonRefType {
  isDisableNextMilestoneBtn: boolean;
  handleNextMilestone: (isSkipped?: boolean, usedBy?: USER_ACTION) => void;
}

interface CurrentMilestoneButtonProps {
  setActiveTab?: Dispatch<SetStateAction<number>>;
  comments?: string;
  isAnesthesiaMilestoneActive: boolean;
  isTimeoutMilestoneActive?: boolean;
  showOptionalMilestoneAlert?: () => void;
}

const CurrentMilestoneButton = forwardRef<
  CurrentMilestoneButtonRefType,
  CurrentMilestoneButtonProps
>(
  (
    {
      setActiveTab,
      comments,
      isAnesthesiaMilestoneActive,
      isTimeoutMilestoneActive,
      showOptionalMilestoneAlert,
    },
    ref,
  ) => {
    const {currentActiveCase} = useTrackerValue();
    const {id: caseId, currentMilestone} = currentActiveCase ?? {};

    const {mutate: submitMilestoneMutate, isPending: mileStoneSubmitting} =
      useUpdateMilestone();

    const isDisableNextMilestoneBtn = useMemo(
      () =>
        mileStoneSubmitting ||
        isTimeoutMilestoneActive ||
        isAnesthesiaMilestoneActive,
      [
        isAnesthesiaMilestoneActive,
        isTimeoutMilestoneActive,
        mileStoneSubmitting,
      ],
    );

    const isWheelsOutMilestone = useMemo(
      () =>
        currentMilestone?.displayName === MILESTONE_TRACKER_STEPS.WHEELS_OUT,
      [currentMilestone?.displayName],
    );

    const handleNextMilestone = useCallback(
      (isSkipped: boolean = false, usedBy: USER_ACTION = USER_ACTION.TAP) => {
        if (!caseId || !currentMilestone) {
          return;
        }

        if (isAnesthesiaMilestoneActive || isTimeoutMilestoneActive) {
          showOptionalMilestoneAlert?.();
          return;
        }

        const {firstName, LastName, userId} = getAuthValue();
        let reqBody: UPDATE_MILESTONE_REQUEST = {
          caseId,
          currentMilestone: {
            ...currentMilestone,
            completedTimestamp: new Date(),
            usedBy: usedBy,
            skipped: isSkipped,
            loggedBy: `${firstName} ${LastName}`,
            loggedById: userId,
          },
        };

        submitMilestoneMutate(reqBody, {
          onSuccess: () => {
            toggleVoiceIntractionPanel({
              isVisible: true,
              mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
              data: {
                title:
                  (isSkipped
                    ? Strings.Milestone_Skipped
                    : Strings.Milestone_Captured) + '!',
                type: DISPLAY_INFO_PANEL_STATUS.SUCCESS,
              },
            });
          },
          onError: () => {
            toggleVoiceIntractionPanel({
              isVisible: true,
              mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
              data: {
                title: Strings.Milestone_Capture_Error,
                type: DISPLAY_INFO_PANEL_STATUS.ERROR,
              },
            });
          },
        });

        fireMilestoneAlarmTrigger(currentMilestone?.displayName);

        if (appLogEventSocketInstance) {
          const eventType = `${
            isSkipped ? 'SKIP_' : ''
          }${currentMilestone?.displayName?.toUpperCase()?.replace(' ', '_')}`;

          const message = `${currentMilestone?.displayName} ${
            isSkipped ? 'skipped' : 'started'
          }.`;
          const eventName = `${currentMilestone?.displayName} ${
            isSkipped ? 'Skip' : 'Start'
          }.`;

          appLogEventSocketInstance.emit(SOCKET_EVENTS.APP_LOG_EVENTS, {
            eventNamespace: SOCKET_EVENTS.APP_LOG_EVENTS,
            eventType,
            message,
            eventName,
            eventErrorLog: null,
          });
        }

        if (
          currentMilestone?.displayName ===
          MILESTONE_TRACKER_STEPS.READY_TO_EXIT
        ) {
          setActiveTab?.(1);
        }
      },
      [
        caseId,
        currentMilestone,
        isAnesthesiaMilestoneActive,
        isTimeoutMilestoneActive,
        submitMilestoneMutate,
        showOptionalMilestoneAlert,
        setActiveTab,
      ],
    );

    useImperativeHandle(
      ref,
      () => ({
        isDisableNextMilestoneBtn,
        handleNextMilestone,
      }),
      [isDisableNextMilestoneBtn, handleNextMilestone],
    );

    if (isWheelsOutMilestone) {
      return (
        <WheelsOutBtn
          isOnTimerScreen
          contentStyle={styles.buttonContent}
          comments={comments}
          labelStyle={styles.buttonLabel}
        />
      );
    }

    return (
      <Button
        icon={() => renderIcon(isDisableNextMilestoneBtn)}
        mode="contained"
        buttonColor={
          isDisableNextMilestoneBtn ? 'rgba(29, 27, 32, 0.12)' : undefined
        }
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        textColor={
          isDisableNextMilestoneBtn
            ? colors.onSurfaceDisabled
            : colors.foreground.inverted
        }
        loading={mileStoneSubmitting}
        onPress={() => handleNextMilestone(false, USER_ACTION.TAP)}>
        "{currentMilestone?.displayName}"
      </Button>
    );
  },
);

const renderIcon = (isDisableNextMilestoneBtn?: boolean) => {
  return (
    <Icon
      source="account-voice"
      size={scaler(12)}
      color={
        isDisableNextMilestoneBtn
          ? colors.onSurfaceDisabled
          : colors.foreground.inverted
      }
    />
  );
};

const styles = StyleSheet.create({
  buttonContent: {
    marginLeft: -scaler(2),
    marginRight: -scaler(8),
    height: scaler(42),
  },
  buttonLabel: {
    fontSize: scaler(10),
  },
});

export default CurrentMilestoneButton;
