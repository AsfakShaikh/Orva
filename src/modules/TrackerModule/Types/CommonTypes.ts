import {CASEBORAD_CASE_DETAIL} from '@modules/CaseBoardModule/Types/CommonTypes';
import {
  CASE_DETAIL,
  CASE_STATUS,
} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {VOICE_INTENT} from '@modules/VoiceComandModule/Types/CommonTypes';
import {NOTES_CATEGORIES} from '@utils/Constants';
import {DATE_TYPE} from '@utils/Types';

export const TIMER_ACTION_CAPTURED_EVENT = 'TIMER_ACTION_CAPTURED_EVENT';
export const TIMER_ACTIONS_EVENT = 'TIMER_ACTIONS_EVENT';

export type HEADER_TIME_VALUE = {
  timerTitle: string;
  timerStart: DATE_TYPE;
  displayTimer: boolean;
  firstCaseStarted: boolean;
  isFirstCase: boolean;
  isLastCase: boolean;
};
export type CASEBOARD_HEADER_TIME_VALUE = {
  otId: string;
  timerDetail: HEADER_TIME_VALUE;
};

export type TRACKER_STATE = {
  isGettingCurrentActiveCase?: boolean;
  currentActiveCase?: CASE_DETAIL;
  headerTimerValue?: HEADER_TIME_VALUE;
  caseboardHeaderTimerValue?: Array<CASEBOARD_HEADER_TIME_VALUE>;
  caseboardCurrentActiveCases?: Array<CASEBORAD_CASE_DETAIL>;
};

export type TIMELOG = {
  otId: string;
  caseTime: string | null;
  previousWheelsOut: string | null;
  currentWheelsIn: string | null;
  currentWheelsOut: string | null;
  delayTime: string | null;
  turnOverTime: string | null;
  previousCaseId: number;
  currentCaseId: number;
  currentCaseStatus: CASE_STATUS;
  isCurrentCaseFirst: boolean;
  isCurrentCaseLast: boolean;
  currentCaseStartTime: string;
  currentCaseDetail: Omit<CASE_DETAIL, 'timerLogs'>;
};

export enum USER_ACTION {
  TAP = 'tap',
  VOICE = 'voice',
}
export type VOICE_NOTE = {
  id: number;
  note: string;
  loggedBy?: string | null;
  caseId?: number;
  hospitalId?: string | null;
  tenantId?: string | null;
  timestamp: DATE_TYPE;
  tag?: string | null;
  active: boolean;
  edited: boolean;
  updatedAt?: DATE_TYPE | null;
  classifications?: Array<VOICE_NOTE_CLASSIFICATON>;
  isClassifying?: boolean;
};
export type VOICE_NOTE_CLASSIFICATON = {
  colorCode: string;
  id?: number;
  isEnabled: boolean;
  isAIGenerated: boolean;
  noteId?: number;
  type: string;
};

export type CaseNoteCategory = {
  caseNoteId: number;
  categories: Array<keyof NOTES_CATEGORIES>;
};

export enum CASE_LATE_TYPE {
  START = 'START',
  END = 'END',
  BOTH = 'BOTH',
}

export type DELAY_REASON = {
  id: number;
  reasonCode: string;
  reasonName: string;
  description: string;
  category: string;
  type: string;
  caseTiming: CASE_LATE_TYPE;
  whenToShow: string;
  isActive: boolean;
  hospitalId: string | null;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CASE_DELAY_REASON = {
  id: number;
  caseId: number;
  delayType: CASE_LATE_TYPE;
  reasonCode: string;
  customReasonText: null;
  milestoneId: string;
  delayDurationMinutes: number;
  recordedByUserId: number;
  hospitalId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
};

export enum CASE_DELAY_OTHER_REASON_CODE {
  OTHER_START = 'OTHER_START',
  OTHER_END = 'OTHER_END',
}

export enum VOICE_NOTE_TYPE {
  VOICE_NOTE = 'VOICE_NOTE',
  TIMER_NOTE = 'TIMER_NOTE',
  NOTIFICATION_NOTE = 'NOTIFICATION_NOTE',
}

export enum TIMER_TYPE {
  TIMER = 'TIMER',
  ALARM = 'ALARM',
  STOPWATCH = 'STOPWATCH',
}

export enum TIMER_STATUS {
  PAUSED = 'PAUSED',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
}

export type TIMER_LOGS = {
  id: number;
  timerId: number;
  caseId: number;
  previousStatus: TIMER_STATUS;
  newStatus: TIMER_STATUS;
  userId: number;
  userName: string;
  timestamp: DATE_TYPE;
  metaData: {
    action: string;
    endTime: DATE_TYPE;
    pauseTime: DATE_TYPE;
    resumeTime: DATE_TYPE;
    description?: string;
    duration?: number;
  };
};

export type TIMER = {
  id: number;
  type: TIMER_TYPE;
  status: TIMER_STATUS;
  startTime?: Date | null;
  resumeTime?: Date | null;
  pauseTime?: Date | null;
  endTime?: Date | null;
  duration: number;
  completedDuration: number;
  elapsed?: number | null;
  description?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  dismissTime?: Date | null;
  trigger?: string | null;
  timerlogs: Array<TIMER_LOGS>;
};

export enum TIMER_ACTION {
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  DISMISS = 'DISMISS',
  DELETE = 'DELETE',
}

export const ANAESTHESIA_START_MILESTONE_UUID = 'Anaesthesia Start';
export const TIMEOUT_MILESTONE_UUID = 'Timeout';

export const TIMERS_ACTIONS_INTENT_ARRAY = [
  VOICE_INTENT.SET_TIMER,
  VOICE_INTENT.SET_ALARM,
  VOICE_INTENT.DELETE_ALL_TOOLS,
  VOICE_INTENT.PAUSE_ALL_TOOLS,
  VOICE_INTENT.RESUME_ALL_TIMERS,
  VOICE_INTENT.DISMISS_ALL_TOOLS,
  VOICE_INTENT.DELETE_TOOL,
  VOICE_INTENT.PAUSE_TOOL,
  VOICE_INTENT.RESUME_TOOL,
  VOICE_INTENT.DISMISS_TOOL,
];

export type SUGGESTED_NOTE_OPTION = {
  id: string;
  label: string;
};

export type SUGGESTED_NOTE = {
  title: string;
  description: string;
  options: SUGGESTED_NOTE_OPTION[];
};

export type FILTERED_USERS_TO_SEND_SMS = {
  action: string;
  intent: string;
  object: string;
  parameters: {
    message: string;
    original_query: string;
    repeat: string;
    requires_confirmation: boolean;
    time: number | null;
    time_in_seconds: number | null;
    trigger: string | null;
  };
  recipient_count: number;
  recipient_type: string;
  recipients: Array<{
    department: string;
    first_name: string;
    id: number;
    last_name: string;
    role: string;
    phoneNumber: string;
  }>;
  status: {
    code: number;
    confidence_score: number;
    corrections_applied: Array<string>;
    disambiguation_info: string;
    extraction_details: {
      broadcast_type: string | null;
      department_specified: string | null;
      extracted_name: string;
      is_broadcast: boolean;
      role_specified: string | null;
    };
    is_ambiguous: boolean;
    matching_confidence: string;
    message: string;
  };
};

export type NOTIFICATION = {
  id: number;
  message: string;
  recipientType: NOTIFICATION_RECIPIENT_TYPE;
  recipientValue: string;
  notificationType: NOTIFICATION_TYPE;
  createdAt: DATE_TYPE;
  updatedAt: DATE_TYPE;
  caseId: number;
  hospitalId: string;
  tenantId: string;
  loggedBy: string;
  loggedById: number;
  loggedAt: DATE_TYPE;
  recipients: Array<{
    id: number;
    userId: number;
    userName: string;
  }>;
};

export enum NOTIFICATION_TYPE {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
}

export enum NOTIFICATION_RECIPIENT_TYPE {
  USER = 'USER',
  ROLE = 'ROLE',
  DEPARTMENT = 'DEPARTMENT',
}
