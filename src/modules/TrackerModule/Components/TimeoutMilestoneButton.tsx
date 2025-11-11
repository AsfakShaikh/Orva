import Icons from '@assets/Icons';
import Button from '@components/Button';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
} from 'react';
import {StyleSheet} from 'react-native';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import {Strings} from '@locales/Localization';
import {USER_ACTION} from '../Types/CommonTypes';
import useTrackerValue from '../Hooks/useTrackerValues';
import {appLogEventSocketInstance} from '@navigation/Router';
import {
  MILESTONE_TRACKER_STEPS,
  OPTIONAL_MILESTONE_TRACKER_STEPS,
  SOCKET_EVENTS,
} from '@utils/Constants';
import useUpdateOptionalMilestone from '../Hooks/useUpdateOptionalMilestone';
import {getAuthValue} from '@modules/AuthModule/Hooks/useAuthValue';
import {UPDATE_MILESTONE_REQUEST} from '../Types/RequestTypes';
import {MILESTONE} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {BottomSnackbarHandler} from '@components/BottomSnackbar';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {VOICE_COMAND_STATUS} from '@modules/VoiceComandModule/Types/CommonTypes';
import {toggleVoiceIntractionPanel} from '@modules/VoiceComandModule/Components/VoiceIntractionPanel';

const {colors} = theme;

export interface TimeoutMilestoneButtonRefType {
  isTimeoutMilestoneActive: boolean;
  showTimeoutMilestoneAlert: () => void;
  handleTimeoutMilestone: (usedBy?: USER_ACTION) => void;
}

const TimeoutMilestoneButton = forwardRef<TimeoutMilestoneButtonRefType>(
  (_props, ref) => {
    const {currentActiveCase} = useTrackerValue();
    const {id: caseId, currentMilestone} = currentActiveCase ?? {};

    const {
      mutate: submitOptionalMilestoneMutate,
      isPending: optionalMilestoneSubmitting,
    } = useUpdateOptionalMilestone();

    const timeoutMilestone = useMemo(() => {
      return currentActiveCase?.procedure?.optionalMilestones?.find(
        (milestone: MILESTONE) =>
          milestone.displayName ===
          OPTIONAL_MILESTONE_TRACKER_STEPS.TIMEOUT_TIME,
      );
    }, [currentActiveCase?.procedure?.optionalMilestones]);

    const timeoutCompletedTimestamp = useMemo(() => {
      return timeoutMilestone?.completedTimestamp;
    }, [timeoutMilestone?.completedTimestamp]);

    const isTimeoutMilestoneActive = useMemo(
      () =>
        currentMilestone?.displayName ===
          MILESTONE_TRACKER_STEPS.PROCEDURE_START && !timeoutCompletedTimestamp,
      [currentMilestone?.displayName, timeoutCompletedTimestamp],
    );

    const showTimeoutMilestoneAlert = useCallback(() => {
      if (!isTimeoutMilestoneActive) {
        return;
      }
      BottomSnackbarHandler.errorToast({
        title: Strings.Timeout_not_recorded_heading,
        description: Strings.Timeout_not_recorded_subheading,
      });
    }, [isTimeoutMilestoneActive]);

    const handleTimeoutMilestone = useCallback(
      (usedBy: USER_ACTION = USER_ACTION.TAP) => {
        if (!caseId || !timeoutMilestone) {
          return;
        }

        const isVoice = usedBy === USER_ACTION.VOICE;

        if (timeoutCompletedTimestamp) {
          isVoice && fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
          BottomSnackbarHandler.infoToast({
            title: Strings.Timeout_has_recorded_heading,
            description: Strings.Timeout_has_recorded_subheading,
          });
          return;
        }

        if (isVoice) {
          fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
          toggleVoiceIntractionPanel({
            isVisible: false,
          });
        }

        const {firstName, LastName, userId} = getAuthValue();
        let reqBody: UPDATE_MILESTONE_REQUEST = {
          caseId,
          currentMilestone: {
            ...timeoutMilestone,
            completedTimestamp: new Date(),
            usedBy: usedBy,
            skipped: false,
            loggedBy: `${firstName} ${LastName}`,
            loggedById: userId,
          },
        };

        submitOptionalMilestoneMutate(reqBody);

        if (appLogEventSocketInstance) {
          appLogEventSocketInstance.emit(SOCKET_EVENTS.APP_LOG_EVENTS, {
            eventNamespace: SOCKET_EVENTS.APP_LOG_EVENTS,
            eventType: 'TIME_OUT',
            message: 'Time Out',
            eventName: 'Time Out',
            eventErrorLog: null,
          });
        }
      },
      [
        caseId,
        submitOptionalMilestoneMutate,
        timeoutCompletedTimestamp,
        timeoutMilestone,
      ],
    );

    useImperativeHandle(
      ref,
      () => ({
        isTimeoutMilestoneActive,
        showTimeoutMilestoneAlert,
        handleTimeoutMilestone,
      }),
      [
        isTimeoutMilestoneActive,
        handleTimeoutMilestone,
        showTimeoutMilestoneAlert,
      ],
    );
    return (
      <Button
        disabled={optionalMilestoneSubmitting}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{opacity: timeoutCompletedTimestamp ? 0.35 : 1}}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        textColor={timeoutCompletedTimestamp ? colors.onSurface : undefined}
        icon={() => renderTimeoutIcon(isTimeoutMilestoneActive)}
        mode={isTimeoutMilestoneActive ? 'contained' : 'outlined'}
        onPress={() => handleTimeoutMilestone()}>
        {timeoutCompletedTimestamp ? Strings.Timeout : `"${Strings.Timeout}"`}
        {timeoutCompletedTimestamp &&
          `: ${formatDateTime(
            timeoutCompletedTimestamp,
            FORMAT_DATE_TYPE.LOCAL,
            'hh:mm aaa',
          )}`}
      </Button>
    );
  },
);

const renderTimeoutIcon = (isTimeoutActivated?: boolean) => {
  return (
    <Icons.AlarmFilled
      width={scaler(13)}
      height={scaler(13)}
      fill={isTimeoutActivated ? colors.foreground.inverted : colors.primary}
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

export default TimeoutMilestoneButton;
