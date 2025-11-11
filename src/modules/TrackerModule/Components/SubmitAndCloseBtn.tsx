// Not in use
import React, {useCallback, useEffect, useState} from 'react';
import Button from '@components/Button';
import useTrackerValue from '../Hooks/useTrackerValues';
import {Strings} from '@locales/Localization';
import useEventEmitter from '@hooks/useEventEmitter';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {
  VOICE_COMAND_STATUS,
  VOICE_INETENT_EVENT,
  VOICE_INTENT,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import useCaseSubmitMutation from '../Hooks/useCaseSubmitMutation';
import {
  CASE_DETAIL,
  MILESTONE,
} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {appLogEventSocketInstance} from '@navigation/Router';
import {TrackerStackParamList} from '@navigation/Types/CommonTypes';
import {
  useNavigation,
  NavigationProp,
  CommonActions,
} from '@react-navigation/native';
import {
  TRACKER_STACK_ROUTE_NAME,
  SOCKET_EVENTS,
  SCHEDULE_STACK_ROUTE_NAME,
} from '@utils/Constants';
import useGetMilestoneRevisionQuery from '@modules/CaseSelectionModule/Hooks/useGetMilestoneRevisionQuery';
import {checkCaseDelayStatus} from '../Helpers/checkCaseDelayStatus';

const NOT_ACCEPTED_VOICE_INTENT = new Set([
  VOICE_INTENT.VOICE_NOTE,
  VOICE_INTENT.NAVIGATE_TO_CASE_SUMMARY,
  VOICE_INTENT.NAVIGATE_TO_CASES,
]);

const SubmitAndCloseBtn = ({comments}: {comments: string}) => {
  const {reset, getParent} =
    useNavigation<
      NavigationProp<
        TrackerStackParamList,
        TRACKER_STACK_ROUTE_NAME.CASE_TRACKER
      >
    >();
  const {currentActiveCase} = useTrackerValue();

  const [voiceIntent, setVoiceIntent] = useState<VOICE_INTENT>();

  const {data: milestoneRevisionData} = useGetMilestoneRevisionQuery();

  const disableButton =
    currentActiveCase?.procedure?.milestones?.some((step: MILESTONE) => {
      const {completedTimestamp, skipped, milestoneId} = step;

      if (!completedTimestamp) {
        return true;
      }

      const currentMilestoneRevisons =
        milestoneRevisionData?.find(i => i?.milestoneUUID === milestoneId)
          ?.revisions ?? [];
      if (skipped && currentMilestoneRevisons?.length <= 1) {
        return true;
      }

      return false;
    }) ||
    (currentActiveCase?.anaesthesiaSkip &&
      currentActiveCase?.anaesthesiaStart === null);
  const redirectScreen = (isLastCase: boolean) => {
    if (isLastCase) {
      reset({
        index: 3,
        routes: [{name: TRACKER_STACK_ROUTE_NAME.LAST_CASE_CONFIRMATION}],
      });
    } else {
      getParent()?.dispatch(
        CommonActions.navigate(SCHEDULE_STACK_ROUTE_NAME.CASE_SCHEDULE),
      );
    }
  };

  const {mutate: caseSubmit, isPending: isCaseSubmiting} =
    useCaseSubmitMutation((isLastCase: boolean) => redirectScreen(isLastCase));

  const submitCase = useCallback(() => {
    if (currentActiveCase?.id) {
      const payload: CASE_DETAIL = {
        ...currentActiveCase,
        comments,
      };
      caseSubmit(payload);
      if (appLogEventSocketInstance) {
        appLogEventSocketInstance.emit(SOCKET_EVENTS.APP_LOG_EVENTS, {
          eventNamespace: SOCKET_EVENTS.APP_LOG_EVENTS,
          eventType: 'CASE_SUBMIT',
          message: 'Case Submited.',
          eventName: 'Case Submit',
          eventErrorLog: null,
        });
      }
    }
  }, [caseSubmit, comments, currentActiveCase]);

  const handleSummarySubmit = useCallback(async () => {
    if (currentActiveCase?.id) {
      const isCaseDelayed = await checkCaseDelayStatus({
        caseDetail: currentActiveCase,
      });

      if (isCaseDelayed) {
        return;
      }

      submitCase();
    }
  }, [currentActiveCase, submitCase]);

  useEventEmitter(VOICE_INETENT_EVENT, (voiceIntentData: VOICE_INTENT) => {
    if (NOT_ACCEPTED_VOICE_INTENT.has(voiceIntentData)) {
      return;
    }
    setVoiceIntent(voiceIntentData);
  });

  const onVoiceIntentReceive = useCallback(() => {
    if (voiceIntent === VOICE_INTENT.SUBMIT_AND_CLOSE_THE_CASE) {
      if (disableButton) {
        fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
      } else {
        handleSummarySubmit();
        fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
        setVoiceIntent(undefined);
      }
    } else {
      fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
      setVoiceIntent(undefined);
    }
  }, [disableButton, handleSummarySubmit, voiceIntent]);

  useEffect(() => {
    if (voiceIntent) {
      onVoiceIntentReceive();
      setVoiceIntent(undefined);
    }
  }, [onVoiceIntentReceive, voiceIntent]);

  return (
    <Button
      loading={isCaseSubmiting}
      onPress={handleSummarySubmit}
      mode="contained"
      icon="account-voice"
      disabled={disableButton || isCaseSubmiting}>
      {`"${Strings.Submit_and_Close_Case}"`}
    </Button>
  );
};

export default SubmitAndCloseBtn;
