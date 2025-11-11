import Button from '@components/Button';
import {Strings} from '@locales/Localization';
import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import useTrackerValue from '../Hooks/useTrackerValues';
import {MILESTONE_TRACKER_STEPS} from '@utils/Constants';
import {MILESTONE} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {theme} from '@styles/Theme';
import {USER_ACTION} from '../Types/CommonTypes';
import {checkCaseDelayStatus} from '../Helpers/checkCaseDelayStatus';
import {
  DISPLAY_INFO_PANEL_STATUS,
  VOICE_COMAND_STATUS,
  VOICE_INETENT_EVENT,
  VOICE_INTENT,
  VOICE_INTRACTION_PANEL_MODE,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import useEventEmitter from '@hooks/useEventEmitter';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {CASE_WHEELS_OUT_REQUEST} from '../Types/RequestTypes';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import {StyleSheet} from 'react-native';
import scaler from '@utils/Scaler';
import {ButtonProps} from 'react-native-paper';
import useCaseWheelsOutMutation from '../Hooks/useCaseWheelsOutMutation';
import {toggleVoiceIntractionPanel} from '@modules/VoiceComandModule/Components/VoiceIntractionPanel';

const {colors} = theme;

interface WheelsOutBtnProps extends Omit<ButtonProps, 'children'> {
  isOnTimerScreen?: boolean;
  comments?: string;
}

const WheelsOutBtn: FC<WheelsOutBtnProps> = ({
  comments,
  isOnTimerScreen = false,
  ...props
}) => {
  const {firstName, LastName, userId} = useAuthValue();
  const {currentActiveCase} = useTrackerValue();

  const [voiceIntent, setVoiceIntent] = useState<VOICE_INTENT>();

  useEventEmitter(VOICE_INETENT_EVENT, (voiceIntentData: VOICE_INTENT) => {
    setVoiceIntent(voiceIntentData);
  });

  const {mutate: wheelsOutMutate, isPending: isWheelsOutSubmitting} =
    useCaseWheelsOutMutation();

  const allMilestones = currentActiveCase?.procedure?.milestones.concat(
    currentActiveCase?.procedure?.optionalMilestones,
  );

  const isWheelsOutDisabled = useMemo(() => {
    if (isWheelsOutSubmitting) {
      return true;
    }

    if (!allMilestones) {
      return false;
    }

    return allMilestones?.some((step: MILESTONE) => {
      if (!step) {
        return false;
      }
      const {completedTimestamp, skipped, displayName, revisions} = step;

      if (
        displayName === MILESTONE_TRACKER_STEPS.WHEELS_OUT ||
        displayName === MILESTONE_TRACKER_STEPS.ROOM_CLEAN
      ) {
        return false;
      }

      if (!completedTimestamp) {
        return true;
      }

      if (completedTimestamp && skipped && revisions.length <= 1) {
        return true;
      }
      return false;
    });
  }, [allMilestones, isWheelsOutSubmitting]);

  const handleWheelsOut = useCallback(
    async (usedBy: USER_ACTION) => {
      if (currentActiveCase?.id) {
        const activeMilestone = currentActiveCase?.currentMilestone;
        let reqBody: CASE_WHEELS_OUT_REQUEST = {
          caseId: currentActiveCase?.id,
          milestone: {
            ...activeMilestone,
            completedTimestamp: new Date(),
            usedBy: usedBy,
            skipped: false,
            loggedBy: `${firstName} ${LastName}`,
            loggedById: userId,
          },
          comments: comments,
          otId: currentActiveCase?.otId,
        };

        const isCaseDelayed = await checkCaseDelayStatus({
          caseDetail: currentActiveCase,
          onDelayReasonSubmit: (cb?: () => void) =>
            wheelsOutMutate(reqBody, {onSettled: cb}),
        });

        if (isCaseDelayed) {
          return;
        }

        wheelsOutMutate(reqBody);
      }
    },
    [currentActiveCase, firstName, LastName, userId, comments, wheelsOutMutate],
  );

  const onVoiceIntentReceive = useCallback(() => {
    if (voiceIntent === VOICE_INTENT.WHEELS_OUT) {
      if (isWheelsOutDisabled) {
        fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
      } else {
        toggleVoiceIntractionPanel({
          isVisible: true,
          mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
          data: {
            title: Strings.Milestone_Captured + '!',
            type: DISPLAY_INFO_PANEL_STATUS.SUCCESS,
          },
        });
        fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
        setVoiceIntent(undefined);
        handleWheelsOut(USER_ACTION.VOICE);
      }
    }
    if (voiceIntent !== VOICE_INTENT.WHEELS_OUT && !isOnTimerScreen) {
      fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
    }
  }, [handleWheelsOut, isOnTimerScreen, isWheelsOutDisabled, voiceIntent]);

  useEffect(() => {
    if (voiceIntent) {
      onVoiceIntentReceive();
      setVoiceIntent(undefined);
    }
  }, [onVoiceIntentReceive, voiceIntent]);

  return (
    <Button
      icon="account-voice"
      mode="contained"
      disabled={isWheelsOutDisabled}
      buttonColor={isWheelsOutDisabled ? 'rgba(29, 27, 32, 0.12)' : undefined}
      labelStyle={styles.buttonLabel}
      textColor={isWheelsOutDisabled ? colors.onSurfaceDisabled : undefined}
      loading={isWheelsOutSubmitting}
      onPress={() => handleWheelsOut(USER_ACTION.TAP)}
      {...props}>
      {Strings.Wheels_Out}
    </Button>
  );
};

export default WheelsOutBtn;

const styles = StyleSheet.create({
  buttonLabel: {
    fontSize: scaler(14),
  },
});
