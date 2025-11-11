import {DATE_TYPE} from '@utils/Types';
import {CASE_DETAIL, CASE_LIST_ITEM, NOTIFICATION_PREF} from './CommonTypes';
import {PARTICIPANT_TYPE} from '@utils/Constants';
import {
  USER_PERMISSIONS,
  USER_ROLES,
} from '@modules/AuthModule/Types/CommonTypes';
import {USER_ACTION} from '@modules/TrackerModule/Types/CommonTypes';

export type SWICTH_CASE_SELECTION_REQUEST = {
  location_id: string;
};

export type GET_CASE_BY_OTS_REQUEST = {
  otIds: string;
  caseStatus?: string;
};
export interface PARTICIPANT {
  emrName: string;
  emrResourceType: string;
  emrId: string;
  participantPrimaryColor?: string | null;
  participantSecondaryColor?: string | null;
  participantType: PARTICIPANT_TYPE;
  participantId: string;
  participantFirstName: string;
  participantLastName: string;
  participantPhone: string;
  participantEmail: string;
}
export type CREATE_CASE_REQUEST = {
  startTime: string | Date;
  endTime: string | Date;
  procedure: {
    cptCode: string;
    name: string;
    description: string;
  } | null;
  participants: PARTICIPANT[];
  assignedSurgeon: string;
  assignedAnaesthelogist: string;
  isLastCase?: boolean;
  otId: string;
  status: string;
  patient: {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    mrn: string;
    dob?: string | null;
  };
  duration: number;
  newOtId?: string;
  id?: number;
};
export type UPDATE_CASE_REQUEST = Partial<CASE_DETAIL> & {
  caseId: number;
};
export type ANAESTHESIA_START_REQUEST = {
  caseId: number;
  anaesthesiaStart?: Date | string | number;
  anaesthesiaSkip?: boolean;
  timeoutTime?: Date | string | number;
};

export type GET_MILESTONE_REVISION_REQUEST = {
  caseId?: number;
  otId?: string;
};

export type UPDATE_MILESTONE_REVISION_REQUEST = {
  caseId: number;
  milestoneId: number;
  milestoneUUID: string;
  milestoneRevisedByUserId: number;
  milestoneRevisedByUserName: string;
  action?: 'start' | 'end';
  createdAt?: DATE_TYPE;
} & (
  | {
      milestoneEndTime: DATE_TYPE;
      milestoneStartTime?: never;
    }
  | {
      milestoneEndTime?: never;
      milestoneStartTime: DATE_TYPE;
    }
);
export type UPDATE_OPTIONAL_MILESTONE_REVISION_REQUEST = {
  caseId: number;
  milestoneName: string;
  milestoneEndTime: DATE_TYPE;
  otId: string;
  milestoneRevisedByUserName: string;
  milestoneRevisedByUserId: number;
  action: USER_ACTION;
  optionalMilestoneId: number;
  milestoneUUID: string;
  createdAt?: DATE_TYPE;
};

export type UPDATE_NOTIFICATION_PREF_REQUEST = NOTIFICATION_PREF;

export type ADD_ANAESTHESIOLOGIST_REQUEST = {
  firstName: string;
  lastName: string;
  primaryColor?: string;
  secondaryColor?: string;
  hospitalId: string;
};
export type ADD_SURGEON_REQUEST = {
  firstName: string;
  lastName: string;
  primaryColor?: string;
  secondaryColor?: string;
  hospitalId: string;
};

export type UPSERT_PROCEDURE_REQUEST = {
  cptCode?: string | null;
  name: string;
  description?: string;
  hospitalId: string;
};

export type DELETE_CASE_REQUEST = {
  id: number;
  otId: string;
};

export type RESET_CASE_REQUEST = {
  caseId: number;
  otId: string;
  reason: string;
  customReason?: string;
};

export type ADD_USER_REQUEST = {
  firstName: string;
  lastName: string;
  role: USER_ROLES;
  permission: Array<USER_PERMISSIONS>;
};

export type MOVE_CASE_REQUEST = {
  newOtId: string;
  caseDetail: CASE_LIST_ITEM;
};
