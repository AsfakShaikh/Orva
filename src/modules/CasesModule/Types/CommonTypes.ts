import {DATE_TYPE} from '@utils/Types';
import {REVISION} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {VOICE_NOTE_CLASSIFICATON} from '@modules/TrackerModule/Types/CommonTypes';

export enum CASE_TIMELINE_TYPE {
  MILESTONE = 'milestone',
  VOICE_NOTE = 'note',
  TIMER = 'timer',
  NOTIFICATION = 'notification',
}

export type MILESTONE_TIMELINE = {
  type: CASE_TIMELINE_TYPE.MILESTONE;
  title: string;
  revision?: Array<REVISION>;
  timestamp: DATE_TYPE | null;
  loggedBy: string | null;
  milestoneId: number;
  milestoneUUID: string;
  caseId?: number;
  isOptionalMilestone?: boolean;
  createdAt: DATE_TYPE;
};
export type VOICE_NOTE_TIMELINE = {
  type: CASE_TIMELINE_TYPE.VOICE_NOTE;
  id?: number | null;
  note: string;
  timestamp: DATE_TYPE;
  updatedAt?: DATE_TYPE | null;
  loggedBy?: string | null;
  classifications?: Array<VOICE_NOTE_CLASSIFICATON>;
  caseId?: number;
  createdAt: DATE_TYPE;
};
export type TIMER_TIMELINE = {
  title: string;
  type: CASE_TIMELINE_TYPE.TIMER;
  id?: number | null;
  timerId?: number;
  desc?: string | null;
  timestamp: DATE_TYPE;
  loggedBy?: string | null;
  duration?: number;
  caseId?: number;
  action?: string;
  timerCreatedAt?: Date | null;
  createdAt: DATE_TYPE;
};
export type NOTIFICATION_TIMELINE = {
  type: CASE_TIMELINE_TYPE.NOTIFICATION;
  id?: number | null;
  sendTo: string;
  message: string;
  loggedBy: string;
  createdAt: DATE_TYPE;
};
