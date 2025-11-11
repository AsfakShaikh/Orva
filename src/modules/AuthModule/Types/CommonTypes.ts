import {
  ACTIVE_CASE,
  OT_ROOM,
} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {DATE_TYPE} from '@utils/Types';

export type SELECTED_OT = OT_ROOM &
  Partial<
    Pick<
      ACTIVE_CASE,
      | 'caseId'
      | 'userId'
      | 'username'
      | 'mrn'
      | 'isCaseboardOnly'
      | 'currentMilestone'
    >
  >;

export type USER_SELECTED_OT =
  | (SELECTED_OT & {isCaseboardOnly: false})
  | (Partial<SELECTED_OT> & {isCaseboardOnly: true});

export type HOSPITAL = {
  name: string;
  timeZone: string;
  uuid: string;
  tenantId: string;
  active: boolean;
  dayStartTime: string;
  physicalAddress: string;
  city: string;
  country: string;
  state: string;
};

export type VOICE = {
  nativeLanguage: string;
  deviceType: string;
  intent: string;
  ipAddress: string;
  isFinalUpload?: boolean;
  file: string;
};

export enum USER_STATUS {
  ACTIVE = 'Active',
  DEACTIVATE = 'Deactivate',
  PENDING = 'Pending',
  INCOMPLETE = 'Incomplete',
}

export enum USER_ROLES {
  NURSE = 'Nurse',
  CHARGE_NURSE = 'Charge Nurse',
  OT_MANAGER = 'O T Manager',
  ADMIN = 'Admin',
  CODING_ADMIN = 'Coding Admin',
  SURGEON = 'Surgeon',
  ANESTHELOGIST = 'Anesthesiologist',
  ROOM_CLEAN_MANAGER = 'Room Clean Manager',
}

export enum USER_PERMISSIONS {
  NURSE = 'Nurse',
  CHARGE_NURSE = 'Charge Nurse',
  OT_MANAGER = 'O T Manager',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super Admin',
  CODING_ADMIN = 'Coding Admin',
  ANESTHELOGIST = 'Anesthesiologist',
  SURGEON = 'Surgeon',
  ROOM_CLEAN_MANAGER = 'Room Clean Manager',
}

export type USER = {
  username?: string | null;
  id: number;
  isSuperUser: boolean;
  active: boolean;
  lastName: string;
  firstName: string;
  email?: string | null;
  tenantId: string;
  hospitalId: string;
  role: USER_ROLES | string;
  department?: string;
  permission: Array<USER_PERMISSIONS>;
  dateJoined: DATE_TYPE;
  realm: string;
  emrStatus: boolean;
  iamId?: string | null;
  status: USER_STATUS;
  primaryColor?: string;
  secondaryColor?: string;
  notificationConfig: {
    id: number;
    countryCode: string;
    phoneNumber: string;
    turnoverTimeToggle: boolean;
    firstCaseTimeToggle: boolean;
    createdAt: DATE_TYPE;
    updatedAt: DATE_TYPE;
  };
  emrDetail: {
    id: number;
    emrResourceType: string | null;
    emrId: string | null;
    emrName: string | null;
    emrStatus: boolean | null;
    createdAt: DATE_TYPE;
    updatedAt: DATE_TYPE;
  };
};

export type AUTH_STATE = {
  isLoggedIn: boolean;
  tenantId?: string;
  hospitalId?: string;
  userId?: number;
  firstName?: string;
  LastName?: string;
  hospitalTimeZone?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  refresh_expires_at?: number;
  expires_in?: number;
  refresh_expires_in?: number;
  selectedOt?: USER_SELECTED_OT;
  user?: USER;
  session_state?: string;
  realm?: string;
  tenantLogo?: string;
  hospitalName?: string;
  hospitalRegion?: string;
  selectedOtsArr?: Array<Pick<OT_ROOM, 'uuid' | 'name'>>;
};
