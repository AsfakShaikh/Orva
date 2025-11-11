import {MILESTONE} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {
  CASE_LATE_TYPE,
  USER_ACTION,
  TIMER,
  TIMER_STATUS,
  TIMER_TYPE,
  NOTIFICATION_RECIPIENT_TYPE,
  NOTIFICATION_TYPE,
} from './CommonTypes';
import {DATE_TYPE} from '@utils/Types';

export type UPDATE_MILESTONE_REQUEST = {
  caseId: number;
  currentMilestone: MILESTONE;
};
export type UPDATE_ROOM_CLEAN_MILESTONE_REQUEST = {
  caseId: number;
  action: 'start' | 'end';
  startTimeLoggedBy?: string | null;
  endTimeLoggedBy?: string | null;
  milestoneId: string;
  usedBy: USER_ACTION;
  timestamp: DATE_TYPE;
};

export type CASE_WHEELS_OUT_REQUEST = {
  caseId: number;
  milestone: MILESTONE;
  comments?: string;
  otId: string;
};

export type SUBMIT_DELAY_REASON_REQUEST = {
  caseId: number;
  delayType: CASE_LATE_TYPE;
  reasonCode: string;
  customReasonText?: string | null;
  delayDurationMinutes: number;
};

export type RECORD_CASE_NOTE_REQUEST = {
  note: string;
  caseId: number;
  tag: string;
  loggedById?: number | null;
};

export type DELETE_VOCE_NOTE_REQUEST = {
  noteId?: number;
  caseId?: number;
};

export type EDIT_VOCE_NOTE_REQUEST = {
  noteId?: number | null;
  caseId?: number | null;
  note: string;
};

export type EDIT_VOCE_NOTE_CLASSIFICATION_REQUEST = {
  noteId?: number;
  caseId?: number;
  classificationId?: number;
  isEnabled: boolean;
  isAIGenerated: boolean;
};

export type DELETE_TIMER_REQUEST = {
  timerId: number;
  caseId: number;
};
export type PAUSE_ALL_TIMER_REQUEST = {
  caseId: number;
};
export type RESUME_ALL_TIMER_REQUEST = {
  caseId: number;
};
export type DELETE_ALL_TIMER_REQUEST = {
  caseId: number;
};
export type DISMISS_ALL_TIMER_REQUEST = {
  caseId: number;
  excludeTimerIds?: Array<number>;
};
export type CREATE_TIMER_REQUEST = {
  query: string;
  caseId: number;
};
export type CREATE_MANUAL_TIMER_REQUEST = {
  caseId: number;
  type: TIMER_TYPE;
  status: TIMER_STATUS;
  startTime: Date;
  duration: number;
  completedDuration: number;
  endTime: Date;
  description: string;
};

export type UPDATE_TIMER_REQUEST = {
  timerId: number;
  caseId: number;
  timerData: Partial<TIMER>;
};

export type FILTER_USERS_TO_SEND_SMS_REQUEST = {
  personnel_database: Array<{
    id: number;
    first_name: string;
    last_name: string;
    role: string;
    department: string;
  }>;
  user_query: string;
};

export type NOTIFICATION_LOG_REQUEST = {
  caseId: number;
  message: string;
  recipientType: NOTIFICATION_RECIPIENT_TYPE;
  recipientValue: string;
  notificationType: NOTIFICATION_TYPE;
};

export type SEND_SMS_REQUEST = {
  receiverName: string;
  receiverNumber: string;
  message: string;
  actualMessage?: string | null;
} & Partial<NOTIFICATION_LOG_REQUEST>;
