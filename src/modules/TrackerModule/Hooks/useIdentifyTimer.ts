/* eslint-disable react-hooks/exhaustive-deps */
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import useGetTimelogByOt from './useGetTimelogByOtQuery';
import useGetCaseDetailQuery from '@modules/CasesModule/Hooks/useGetCaseDetailQuery';
import {useCallback, useEffect} from 'react';
import identifyTimerForHeader from '../Helpers/identifyTimerForHeader';
import useGetCaseByOtsQuery from '@modules/CaseSelectionModule/Hooks/useGetCaseByOtsQuery';
import {updateTrackerValue} from './useTrackerValues';
import {CASE_STATUS} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {Strings} from '@locales/Localization';

export default function useIdentifyTimer() {
  const {selectedOt} = useAuthValue();
  const {uuid = '', caseId, mrn} = selectedOt ?? {};

  const {data: timeLogs = []} = useGetTimelogByOt(uuid);
  const {data: caseDetail, isPending: isGettingCaseDetail} =
    useGetCaseDetailQuery(caseId, true);

  const {data: plannedCases = []} = useGetCaseByOtsQuery({
    otIds: uuid,
    caseStatus: CASE_STATUS.PLANNED,
  });

  useEffect(() => {
    updateTrackerValue({
      isGettingCurrentActiveCase: isGettingCaseDetail,
    });
  }, [isGettingCaseDetail]);

  const identifyTimer = useCallback(async () => {
    const isActiveCase =
      caseId && mrn && caseDetail?.status === CASE_STATUS.ACTIVE;
    const activeCaseList = isActiveCase ? [caseDetail] : [];

    const finalCase: any = (function () {
      const pickedCase = [
        ...timeLogs,
        ...activeCaseList,
        plannedCases?.[0],
      ]?.reduce((finalObj: any, item) => {
        const alreadyItem = finalObj?.[item?.otId];

        if (
          !alreadyItem ||
          ((alreadyItem?.status === CASE_STATUS.SUBMITTED ||
            alreadyItem?.currentCaseStatus === CASE_STATUS.SUBMITTED) &&
            alreadyItem?.isCurrentCaseLast)
        ) {
          finalObj[item?.otId] = item;
        }
        return finalObj;
      }, {});

      return Object.values(pickedCase)?.[0];
    })();

    const timerValue = identifyTimerForHeader({
      startTime: finalCase?.startTime,
      isFirstCase: finalCase?.isFirstCase,
      isLastCase: finalCase?.isLastCase,
      currentTimeLog: finalCase?.timerLogs ?? finalCase,
    });
    updateTrackerValue({
      headerTimerValue: finalCase
        ? timerValue?.headerTimerValue
        : {
            timerTitle: Strings.Timer_Inactive,
            timerStart: 0,
            displayTimer: false,
            isFirstCase: false,
            firstCaseStarted: false,
            isLastCase: false,
          },
    });
  }, [
    caseDetail?.timerLogs,
    uuid,
    caseId,
    mrn,
    JSON.stringify(plannedCases),
    JSON.stringify(timeLogs),
  ]);

  useEffect(() => {
    identifyTimer();
  }, [identifyTimer]);
}
