import MmkvStorage from '@utils/MmkvStorage';
import {BehaviorSubject} from 'rxjs';
import {TRACKER_STATE} from '../Types/CommonTypes';

export const initialTrackerState: TRACKER_STATE = {
  isGettingCurrentActiveCase: false,
  currentActiveCase: undefined,
  headerTimerValue: undefined,
  caseboardHeaderTimerValue: undefined,
  caseboardCurrentActiveCases: undefined,
};

const trackerState$ = new BehaviorSubject<TRACKER_STATE>(initialTrackerState);
MmkvStorage.init('trackerState', trackerState$);

export default trackerState$;
