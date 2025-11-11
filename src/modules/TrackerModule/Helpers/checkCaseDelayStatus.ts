import {CASE_DETAIL} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {toggleReasonForLateModal} from '../Components/ReasonForLateModal';
import {CASE_LATE_TYPE} from '../Types/CommonTypes';
import {getCaseDelayReasonsList} from '../Hooks/useGetCaseDelayReasonsListQuery';

export async function checkCaseDelayStatus(detail?: {
  caseDetail?: CASE_DETAIL;
  isFirstCase?: boolean;
  onDelayReasonSubmit?: (cb?: () => void) => void;
}): Promise<boolean> {
  const {caseDetail, isFirstCase, onDelayReasonSubmit} = detail ?? {};

  if (!caseDetail) {
    return false;
  }

  const {
    id: resCaseId,
    actualStartTime: resActualStartTime,
    startTime: resStartTime,
    actualEndTime: resActualEndTime,
    endTime: resEndTime,
  } = caseDetail ?? {};

  const caseDelayReasonsList = await getCaseDelayReasonsList(resCaseId);

  const isStartDelayAdded =
    caseDelayReasonsList?.some(
      item => item?.delayType === CASE_LATE_TYPE.START,
    ) ?? false;

  const isEndDelayAdded =
    caseDelayReasonsList?.some(
      item => item?.delayType === CASE_LATE_TYPE.END,
    ) ?? false;

  if (isStartDelayAdded && isEndDelayAdded) {
    return false;
  }

  const actualStartTimeMs = new Date(resActualStartTime).getTime();
  const startTimeMs = new Date(resStartTime).getTime();
  const actualEndTimeMs = resActualEndTime
    ? new Date(resActualEndTime).getTime()
    : new Date().getTime();
  const endTimeMs = new Date(resEndTime).getTime();

  const startDiff = actualStartTimeMs - startTimeMs;
  const startDiffInMinutes = startDiff / (1000 * 60);

  const endDiff = actualEndTimeMs - endTimeMs;
  const endDiffInMinutes = endDiff / (1000 * 60);

  const isStartDelay = actualStartTimeMs + 5000 > startTimeMs;
  const isEndDelay = actualEndTimeMs + 5000 > endTimeMs;

  if (isStartDelay && isEndDelay && !isStartDelayAdded && !isEndDelayAdded) {
    toggleReasonForLateModal({
      type: CASE_LATE_TYPE.BOTH,
      caseId: resCaseId,
      startLateBy: startDiffInMinutes,
      endLateBy: endDiffInMinutes,
      isFirstCase,
      onDelayReasonSubmit,
    });

    return true;
  }

  if (isStartDelay && !isStartDelayAdded) {
    toggleReasonForLateModal({
      type: CASE_LATE_TYPE.START,
      caseId: resCaseId,
      startLateBy: startDiffInMinutes,
      isFirstCase,
      onDelayReasonSubmit,
    });

    return true;
  }
  if (isEndDelay && !isEndDelayAdded) {
    toggleReasonForLateModal({
      type: CASE_LATE_TYPE.END,
      caseId: resCaseId,
      endLateBy: endDiffInMinutes,
      isFirstCase,
      onDelayReasonSubmit,
    });

    return true;
  }

  return false;
}
