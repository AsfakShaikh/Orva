import {DATE_TYPE} from '@utils/Types';
import {
  USER_ACTION,
  VOICE_NOTE,
  TIMER,
  NOTIFICATION,
} from '@modules/TrackerModule/Types/CommonTypes';
import {PARTICIPANT} from './RequestTypes';

export enum CASE_STATUS {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  SUBMITTED = 'SUBMITTED',
  SUSPENDED = 'SUSPENDED',
  NO_SHOW = 'NO_SHOW',
  ALL_CASES = 'PLANNED,ACTIVE,SUBMITTED,SUSPENDED,NO_SHOW',
}

export type OT_ROOM = {
  name: string | undefined;
  procedure: string;
  updatedAt: string;
  createdAt: string;
  tenantId: string;
  hospitalId: string;
  uuid: string;
};

export type MILESTONE = {
  id: number;
  milestoneId: string;
  order?: number;
  milestoneKey?: string;
  usedBy?: USER_ACTION | null;
  completedTimestamp: string | Date | number | null;
  startTime: string | Date | number | null;
  loggedBy: string | null;
  loggedById?: number | null;
  skipped: boolean;
  activeColor: string;
  waitingText: string;
  displayName: string;
  revisions: Array<REVISION>;
  startTimeLoggedBy?: string | null;
  endTimeLoggedBy?: number | null;
  action?: 'start' | 'end';
  isOptionalMilestone?: boolean;
};

export type CASE_DETAIL_TIMER_LOGS = {
  caseTime: string | null;
  currentWheelsIn: string | null;
  delayTime: string | null;
  currentWheelsOut: string | null;
  previousWheelOut: string | null;
  previousProcedureEnd: string | null;
  previousRoomClean: string | null;
  currentProcedureStart: string | null;
  currentRoomReady: string | null;
  turnOverTime: string | null;
  id: number;
};

export type CASE_DETAIL = {
  id: number;
  comment?: string;
  startTime: DATE_TYPE;
  endTime: DATE_TYPE;
  actualStartTime: DATE_TYPE | null;
  actualEndTime: DATE_TYPE | null;
  procedureId: string;
  assignedSurgeon: string;
  assignedAnaesthelogist: string;
  anesthesiaType?: string;
  remarks?: string;
  timeoutTime?: DATE_TYPE | null;
  isFirstCase: boolean;
  isLastCase: boolean;
  anaesthesiaStart?: DATE_TYPE | null;
  anaesthesiaSkip?: boolean | null;
  otId: string;
  status: string;
  procedure: {
    name: string;
    procedureId: string;
    cptCode: string;
    milestones: Array<MILESTONE>;
    optionalMilestones: Array<MILESTONE>;
  };
  patient: {
    id: number;
    name?: string | null;
    firstName: string | null;
    lastName: string | null;
    mrn: string;
    dob: string | null | Date;
    gender?: string | null;
  };
  currentMilestone: MILESTONE;
  timerLogs: CASE_DETAIL_TIMER_LOGS;
  comments?: string | null;
  caseNotes?: Array<VOICE_NOTE>;
  timers?: Array<TIMER>;
  isDeleted?: boolean;
  missingMandatoryData?: boolean;
  actualDuration?: number | null;
  duration?: number | null;
  participants: Array<PARTICIPANT>;
  submittedBy?: {
    userId: number | null;
    userName: string | null;
  };
  notifications?: Array<NOTIFICATION>;
};

export type SURGEON = {
  tenantId: string;
  hospitalId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  primaryColor?: string;
  secondaryColor?: string;
  emrId?: string;
  emrName?: string;
  emrResourceType?: string;
  uuid: string;
  updatedAt: string;
  createdAt: string;
};
export type ANESTHELOGIST = {
  tenantId: string;
  hospitalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emrId: string;
  emrName: string;
  emrResourceType: string;
  uuid: string;
  updatedAt: string;
  createdAt: string;
};

export type CASE_LIST_ITEM = {
  id?: number;
  patient: {
    id?: number;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    mrn: string;
    dob?: string | null;
  };
  dob?: string | null;
  procedureId: string;
  procedureName: string;
  assignedSurgeon: string;
  assignedAnaesthelogist: string;
  startTime: Date;
  endTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: string;
  statusDisplayText: string;
  isLastCase: boolean;
  otId: string;
  missingMandatoryData?: boolean;
};

export type REVISED_TIME_ITEM = {
  id?: number;
  patient: {
    id?: number;
    name?: string | null;
    mrn: string;
  };

  startTime: string;
  otId: string;
};

export enum SORT_DIRECTION {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}

export type ACTIVE_CASE = {
  caseId: number;
  otId: string;
  username: string;
  userId: number;
  hospitalId: string;
  tenantId: string;
  mrn: string;
  isCaseboardOnly: boolean;
  currentMilestone: string;
};

export type PROCEDURE = {
  tenantId?: string;
  hospitalId?: string;
  name: string;
  uuid: string;
  updatedAt: string;
  createdAt: DATE_TYPE;
  displayName: string;
  cptCode?: string;
  status: string;
  milestones: Array<MILESTONE>;
};

export type HEADER_ARRAY = Array<{
  key: string;
  value: string;
  position?: 'flex-start' | 'flex-end';
  flex?: number;
  sortableDisable?: boolean;
}>;

export type MILESTONE_REVISION = {
  milestoneId: number;
  milestoneUUID: string;
  revisions: Array<REVISION>;
};
export type REVISION = {
  id: number;
  milestoneId: number;
  milestoneUUID: string;
  milestoneRevisedByUserId: number;
  milestoneRevisedByUserName: string;
  action?: 'start' | 'end'; // this is to identify room clean start or room clean end
  createdAt: DATE_TYPE;
} & (
  | {
      startTimeLoggedBy: string | null;
      milestoneStartTime: DATE_TYPE;
      endTimeLoggedBy?: never;
      milestoneEndTime?: never;
    }
  | {
      endTimeLoggedBy: string | null;
      milestoneEndTime: DATE_TYPE;
      startTimeLoggedBy?: never;
      milestoneStartTime?: never;
    }
);

export type OPTIONAL_MILESTONE_REVISION = {
  milestoneName: string;
  revisions: Array<OPTIONAL_REVISION>;
};

export type OPTIONAL_REVISION = {
  milestoneName: string;
  userId: number;
  userName: string;
  revisedEndTime: DATE_TYPE;
  createdAt: DATE_TYPE;
  updatedAt: DATE_TYPE;
};

export type CASE_SUBMITTED = {
  mrn: string;
  room: string | null;
  surgeon: string;
  patientName: string;
  procedureName: string;
  owner: string | null;
  submitted: DATE_TYPE;
  caseId: number;
  otId: string;
};

export type NOTIFICATION_PREF = {
  countryCode: string;
  phoneNumber: string;
  turnoverTimeToggle: boolean;
  firstCaseTimeToggle: boolean;
};

export enum PROCEDURE_STATUS {
  ACTIVE = 'Active',
  INCOMPLETE = 'Incomplete',
  DEACTIVE = 'Deactivated',
}

export type USER_ROLE_DEPT_MAPPING = {
  id: number;
  tenantId: string;
  hospitalId: string;
  role: string;
  department: string;
  createdAt: DATE_TYPE;
  updatedAt: DATE_TYPE;
};
