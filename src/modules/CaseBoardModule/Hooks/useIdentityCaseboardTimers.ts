import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import useGetCaseByOtsQuery from '@modules/CaseSelectionModule/Hooks/useGetCaseByOtsQuery';
import useGetOtsListQuery from '@modules/CaseSelectionModule/Hooks/useGetOtsListQuery';
import {CASE_STATUS} from '@modules/CaseSelectionModule/Types/CommonTypes';
import identifyTimerForHeader from '@modules/TrackerModule/Helpers/identifyTimerForHeader';
import useGetTimelogByOt from '@modules/TrackerModule/Hooks/useGetTimelogByOtQuery';
import {updateTrackerValue} from '@modules/TrackerModule/Hooks/useTrackerValues';
import {useEffect, useMemo} from 'react';
import {CASEBORAD_CASE_DETAIL} from '../Types/CommonTypes';
import {CASEBOARD_HEADER_TIME_VALUE} from '@modules/TrackerModule/Types/CommonTypes';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
const CASEBOARD_UPDATE_EVENT = 'CASEBOARD_UPDATE_EVENT';
export const emitCaseBoardUpdateEvent = () => {
  emitEvent(CASEBOARD_UPDATE_EVENT);
};
export default function useIdentifyCaseboardTimers() {
  const {hospitalId} = useAuthValue();

  const {data: otsListData, isLoading: isGettingOtsList} =
    useGetOtsListQuery(hospitalId);

  const otIds = useMemo(
    () => otsListData?.map(ot => ot?.uuid)?.join(',') ?? '',
    [otsListData],
  );

  const {
    data: plannedCaseListData = [],
    isLoading: isGettingPlannedCases,
    refetch: refetchPlannedCaseList,
  } = useGetCaseByOtsQuery({
    otIds: otIds,
    caseStatus: CASE_STATUS.PLANNED,
  });

  const {
    data: activeCaseListData = [],
    isLoading: isGettingActiveCases,
    refetch: refetchActiveCaseList,
  } = useGetCaseByOtsQuery({
    otIds: otIds,
    caseStatus: CASE_STATUS.ACTIVE,
  });

  const {
    data: timeLogs = [],
    isLoading: isGettingTimeLog,
    refetch: refetchOtsTimeLogs,
  } = useGetTimelogByOt(otIds);
  const reSyncData = () => {
    refetchPlannedCaseList();
    refetchActiveCaseList();
    refetchOtsTimeLogs();
  };
  useEventEmitter(CASEBOARD_UPDATE_EVENT, () => {
    reSyncData();
  });
  const mergedCaseList = (function () {
    const mergedList = [
      ...timeLogs,
      ...activeCaseListData,
      ...plannedCaseListData,
    ]?.reduce((map, item) => {
      const alreadyItem = map.get(item.otId);

      if (
        !alreadyItem ||
        ((alreadyItem?.status === CASE_STATUS.SUBMITTED ||
          alreadyItem?.currentCaseStatus === CASE_STATUS.SUBMITTED) &&
          alreadyItem?.isCurrentCaseLast)
      ) {
        map.set(item.otId, item);
      }

      return map;
    }, new Map());
    return Array.from(mergedList.values());
  })();

  const getCaseboardsDetails = () => {
    if (!otsListData || otsListData?.length <= 0) {
      updateTrackerValue({
        caseboardHeaderTimerValue: undefined,
        caseboardCurrentActiveCases: undefined,
      });
      return;
    }

    let caseboardDetailsArr: Array<CASEBORAD_CASE_DETAIL> = [];
    let caseboardHeaderTimerValue: Array<CASEBOARD_HEADER_TIME_VALUE> = [];

    otsListData?.forEach(ot => {
      const caseDetail = mergedCaseList?.find(
        caseInfo => caseInfo?.otId === ot?.uuid,
      );

      if (caseDetail) {
        const timerValue = identifyTimerForHeader({
          otId: ot?.uuid,
          startTime: caseDetail?.startTime,
          isFirstCase: caseDetail?.isFirstCase,
          isLastCase: caseDetail?.isLastCase,
          currentTimeLog: caseDetail?.timerLogs ?? caseDetail,
        });

        if (timerValue?.caseboardHeaderTimerValue) {
          caseboardHeaderTimerValue.push(timerValue?.caseboardHeaderTimerValue);
        }

        caseboardDetailsArr.push({
          ...ot,
          currentCase: caseDetail?.currentCaseDetail ?? caseDetail,
        });
      } else {
        caseboardDetailsArr.push(ot);
      }
    });
    updateTrackerValue({
      caseboardCurrentActiveCases: caseboardDetailsArr,
      caseboardHeaderTimerValue,
    });
  };

  useEffect(() => {
    if (
      mergedCaseList &&
      !isGettingPlannedCases &&
      !isGettingActiveCases &&
      !isGettingTimeLog
    ) {
      getCaseboardsDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isGettingActiveCases,
    isGettingPlannedCases,
    isGettingTimeLog,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(mergedCaseList),
  ]);

  return {
    isIdentifyingCaseboard:
      isGettingOtsList ||
      isGettingActiveCases ||
      isGettingPlannedCases ||
      isGettingTimeLog,
  };
}
