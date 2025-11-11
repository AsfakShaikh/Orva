import StepWizard from '@components/StepWizard';
import {MILESTONE_TRACKER_STEPS} from '@utils/Constants';
import React, {useEffect, useMemo, useState} from 'react';
import useTrackerValue from '../Hooks/useTrackerValues';
import {MILESTONE} from '@modules/CaseSelectionModule/Types/CommonTypes';

const CaseTrackerStepWizard = () => {
  const {currentActiveCase} = useTrackerValue();

  const [currentPosition, setCurrentPosition] = useState<number>(0);

  const isAnaesthesiaActive = useMemo(
    () =>
      currentActiveCase?.currentMilestone?.displayName ===
        MILESTONE_TRACKER_STEPS.PATIENT_READY &&
      !currentActiveCase?.anaesthesiaStart &&
      !currentActiveCase?.anaesthesiaSkip,
    [
      currentActiveCase?.anaesthesiaStart,
      currentActiveCase?.currentMilestone?.displayName,
      currentActiveCase?.anaesthesiaSkip,
    ],
  );

  const isTimeoutActive = useMemo(
    () =>
      currentActiveCase?.currentMilestone?.displayName ===
        MILESTONE_TRACKER_STEPS.PROCEDURE_START &&
      !currentActiveCase?.timeoutTime,
    [
      currentActiveCase?.currentMilestone?.displayName,
      currentActiveCase?.timeoutTime,
    ],
  );

  const activeCaseMilestones = useMemo(() => {
    return (
      currentActiveCase?.procedure?.milestones?.filter(
        (milestone: MILESTONE) =>
          milestone.displayName !== MILESTONE_TRACKER_STEPS.ROOM_CLEAN,
      ) ?? []
    );
  }, [currentActiveCase]);

  const totalSteps: number = activeCaseMilestones.length;
  const labels = activeCaseMilestones?.map(
    (step: MILESTONE) => step.displayName,
  );

  useEffect(() => {
    const currentMilestoneId = currentActiveCase?.currentMilestone?.milestoneId;
    if (currentMilestoneId) {
      const activeCaseMilestoneIndex = activeCaseMilestones?.findIndex(
        (step: MILESTONE) => step.milestoneId === currentMilestoneId,
      );
      if (activeCaseMilestoneIndex >= 0) {
        setCurrentPosition(activeCaseMilestoneIndex);
      }
    }
  }, [activeCaseMilestones, currentActiveCase]);

  const showErrorInStepWizard = useMemo(
    () => isTimeoutActive || isAnaesthesiaActive,
    [isAnaesthesiaActive, isTimeoutActive],
  );
  return (
    <StepWizard
      labels={labels}
      currentPosition={currentPosition}
      stepCount={totalSteps}
      isError={showErrorInStepWizard}
    />
  );
};

export default CaseTrackerStepWizard;
