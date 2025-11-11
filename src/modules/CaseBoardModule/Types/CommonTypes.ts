import {
  CASE_DETAIL,
  OT_ROOM,
} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {TIMELOG} from '@modules/TrackerModule/Types/CommonTypes';

export enum ROOM_STATUS {
  ACTIVE = 'ACTIVE',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  FIRST_CASE_DELAYED = 'First Case Delayed',
  FIRST_CASE_PENDING = 'First Case Pending',
}

export type CASEBORAD_CASE_DETAIL = OT_ROOM & {
  currentCase?: Partial<CASE_DETAIL & TIMELOG>;
};
