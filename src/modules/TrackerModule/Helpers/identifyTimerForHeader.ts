import convertToZonedTime from '@helpers/convertToZonedTime';
import {Strings} from '@locales/Localization';
import {isAfter, isBefore} from 'date-fns';
import {TIMELOG, HEADER_TIME_VALUE} from '../Types/CommonTypes';
import {
  CASE_DETAIL_TIMER_LOGS,
  CASE_STATUS,
} from '@modules/CaseSelectionModule/Types/CommonTypes';

type TimeValueType = string | number | Date;

type IdentifyTimerForHeaderProps = {
  startTime?: TimeValueType;
  isFirstCase?: boolean;
  isLastCase?: boolean;
  currentTimeLog?: Partial<TIMELOG & CASE_DETAIL_TIMER_LOGS>;
  otId?: string;
};

export default function identifyTimerForHeader({
  startTime,
  isFirstCase = false,
  isLastCase = false,
  currentTimeLog,
  otId,
}: IdentifyTimerForHeaderProps) {
  const {
    isCurrentCaseFirst,
    isCurrentCaseLast,
    currentCaseStartTime,
    currentWheelsIn,
    currentWheelsOut,
    previousWheelsOut: tlPreviousWheelOut,
    previousWheelOut,
    currentCaseStatus,
  } = currentTimeLog ?? {};

  const previousWheelsOut = previousWheelOut ?? tlPreviousWheelOut;
  const caseStartTime = startTime ?? currentCaseStartTime;
  const isFirst = isFirstCase || isCurrentCaseFirst;
  const isLast = isLastCase || isCurrentCaseLast;

  const getUserTimestamp = (time?: TimeValueType | null) =>
    convertToZonedTime(time);

  const getTimerDetails = (
    timerTitle: string,
    timerStart: TimeValueType,
    displayTimer: boolean = true,
    firstCaseStarted: boolean = false,
  ): HEADER_TIME_VALUE => {
    return {
      timerTitle,
      timerStart,
      displayTimer,
      isFirstCase: isFirst ?? false,
      firstCaseStarted,
      isLastCase: isLast ?? false,
    };
  };

  const extractTimerValue = (
    timerTitle: string,
    timerStart: TimeValueType,
    displayTimer: boolean = true,
    firstCaseStarted: boolean = false,
  ) => {
    const timerValue = getTimerDetails(
      timerTitle,
      timerStart,
      displayTimer,
      firstCaseStarted,
    );

    if (otId) {
      return {
        caseboardHeaderTimerValue: {
          otId,
          timerDetail: timerValue,
        },
      };
    }

    return {
      headerTimerValue: timerValue,
    };
  };

  const updateTimerIfBeforeOrAfter = (
    zonedTime: TimeValueType,
    stringBefore: string,
    stringAfter: string,
    caseStartValue: TimeValueType,
    isCaseFirst: boolean,
  ) => {
    if (isAfter(zonedTime, getUserTimestamp())) {
      return extractTimerValue(stringBefore, caseStartValue, true, isCaseFirst);
    }
    if (isBefore(zonedTime, getUserTimestamp())) {
      return extractTimerValue(stringAfter, caseStartValue, true, isCaseFirst);
    }
  };

  // planned first case of the day
  if (isFirst && caseStartTime && !currentWheelsIn) {
    console.log('planned first case of the day');
    const zonedCurrentCaseStartTime = getUserTimestamp(caseStartTime);
    return updateTimerIfBeforeOrAfter(
      zonedCurrentCaseStartTime,
      Strings.First_Case_Start_in,
      Strings.First_Case_Delayed_by,
      caseStartTime,
      isFirst,
    );
  }

  // only case of the Day
  if (
    isLast &&
    caseStartTime &&
    !previousWheelsOut &&
    !currentWheelsIn &&
    !currentWheelsOut
  ) {
    console.log('only case of the Day');
    const zonedCurrentCaseStartTime = getUserTimestamp(caseStartTime);
    return updateTimerIfBeforeOrAfter(
      zonedCurrentCaseStartTime,
      Strings.First_Case_Start_in,
      Strings.First_Case_Delayed_by,
      caseStartTime,
      isFirst ?? false,
    );
  }

  // last case of the Day
  if (
    isLast &&
    // previousWheelsOut &&
    currentWheelsIn &&
    currentWheelsOut &&
    currentCaseStatus === CASE_STATUS.SUBMITTED
  ) {
    console.log('last case');
    return extractTimerValue(Strings.Timer_Inactive, 0, false);
  }

  //case time
  if (
    currentWheelsIn &&
    !currentWheelsOut &&
    currentCaseStatus === CASE_STATUS.ACTIVE
  ) {
    console.log('case time');
    return extractTimerValue(Strings.Case_Time, currentWheelsIn);
  }

  //turnOver time
  if (!isLast && previousWheelsOut && currentWheelsIn && currentWheelsOut) {
    console.log('turnOver time 1');
    return extractTimerValue(Strings.TurnOver_Time, currentWheelsOut);
  }

  //turnover time (Note : Now things are managed with isLast key so not more required but still left here for safer side.)
  if (currentWheelsIn && currentWheelsOut) {
    console.log('turnOver time 2');
    return extractTimerValue(Strings.TurnOver_Time, currentWheelsOut);
  }
  //turnover time
  if (previousWheelsOut && !currentWheelsIn && !currentWheelsOut) {
    console.log('turnOver time 3');
    return extractTimerValue(Strings.TurnOver_Time, previousWheelsOut);
  }
}
