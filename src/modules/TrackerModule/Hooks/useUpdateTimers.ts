import {useCallback, useEffect, useMemo, useRef} from 'react';
import {GLOBAL_TIMER_TYPE} from '@components/GlobalTimer';
import {emitEvent} from '@hooks/useEventEmitter';
import getTrackerTimeDifference from '../Helpers/getTrackerTimeDifference';
import useTrackerValue from './useTrackerValues';

export const UPDATE_TIMER_EVENT = 'UPDATE_TIMER_EVENT';

export default function useUpdateTimers() {
  const {
    headerTimerValue,
    currentActiveCase,
    caseboardHeaderTimerValue,
    caseboardCurrentActiveCases,
  } = useTrackerValue();

  const timerValues = useRef<{
    headerTime: number;
    milestoneTime: number;
    caseboardHeaderTime: Array<any>;
    caseboardMilestoneTime: Array<any>;
  }>({
    headerTime: 0,
    milestoneTime: 0,
    caseboardHeaderTime: [],
    caseboardMilestoneTime: [],
  });

  // Caseboard Header Timer
  const caseboardHeaderTimerDeps = useMemo(
    () =>
      (caseboardHeaderTimerValue ?? [])?.map(cbHeader => {
        return {
          seconds: getTrackerTimeDifference(cbHeader?.timerDetail?.timerStart),
          otId: cbHeader?.otId,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(caseboardHeaderTimerValue)],
  );

  // Caseboard Milestone Timer
  const caseboardMilestoneTimerDeps = useMemo(
    () =>
      (caseboardCurrentActiveCases ?? [])?.map(cbHeader => {
        if (cbHeader?.currentCase?.currentMilestone?.startTime) {
          return {
            seconds: getTrackerTimeDifference(
              cbHeader?.currentCase?.currentMilestone?.startTime,
            ),
            otId: cbHeader?.uuid,
            milestoneId: cbHeader?.currentCase?.currentMilestone?.milestoneId,
          };
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(caseboardCurrentActiveCases)],
  );

  // Function to update timer values for header, milestone and caseboard
  const updateTimerValues = useCallback(() => {
    const headerStartTime = headerTimerValue?.timerStart
      ? getTrackerTimeDifference(headerTimerValue?.timerStart)
      : 0;

    // Milestone Timer
    const milestoneStartTime = currentActiveCase?.currentMilestone?.startTime
      ? getTrackerTimeDifference(currentActiveCase?.currentMilestone?.startTime)
      : 0;

    // Caseboard Header Timer
    const caseboardHeaderTimer = (caseboardHeaderTimerValue ?? [])?.map(
      cbHeader => {
        return {
          seconds: getTrackerTimeDifference(cbHeader?.timerDetail?.timerStart),
          otId: cbHeader?.otId,
        };
      },
    );

    // Caseboard Milestone Timer
    const caseboardMilestoneTimer = (caseboardCurrentActiveCases ?? [])?.map(
      cbHeader => {
        if (cbHeader?.currentCase?.currentMilestone?.startTime) {
          return {
            seconds: getTrackerTimeDifference(
              cbHeader?.currentCase?.currentMilestone?.startTime,
            ),
            otId: cbHeader?.uuid,
            milestoneId: cbHeader?.currentCase?.currentMilestone?.milestoneId,
          };
        }
      },
    );

    timerValues.current = {
      ...timerValues?.current,
      headerTime: headerStartTime,
      milestoneTime: milestoneStartTime,
      caseboardHeaderTime: caseboardHeaderTimer,
      caseboardMilestoneTime: caseboardMilestoneTimer,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    headerTimerValue?.timerStart,
    currentActiveCase?.currentMilestone?.startTime,
    caseboardHeaderTimerDeps,
    caseboardMilestoneTimerDeps,
  ]);

  // Fire event for each timer to send counter value
  useEffect(() => {
    const updateTimer = () => {
      updateTimerValues();

      emitEvent(UPDATE_TIMER_EVENT, {
        timerType: GLOBAL_TIMER_TYPE.HEADER,
        seconds: timerValues?.current?.headerTime,
      });

      emitEvent(UPDATE_TIMER_EVENT, {
        timerType: GLOBAL_TIMER_TYPE.MILESTONE,
        seconds: timerValues?.current?.milestoneTime,
      });

      timerValues?.current?.caseboardHeaderTime?.forEach(cbHeader => {
        emitEvent(UPDATE_TIMER_EVENT, {
          timerType: GLOBAL_TIMER_TYPE.CASEBOARD_HEADER,
          seconds: cbHeader?.seconds,
          otId: cbHeader?.otId,
        });
      });

      timerValues?.current?.caseboardMilestoneTime?.forEach(cbMilestone => {
        emitEvent(UPDATE_TIMER_EVENT, {
          timerType: GLOBAL_TIMER_TYPE.CASEBOARD_MILESTONE,
          seconds: cbMilestone?.seconds,
          otId: cbMilestone?.otId,
          milestoneId: cbMilestone?.milestoneId,
        });
      });
    };
    let intervalIdVal = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalIdVal);
  }, [timerValues, updateTimerValues]);
}
