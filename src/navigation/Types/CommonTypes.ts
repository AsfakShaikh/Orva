import {OptionalLocaleString} from '@locales/Localization';
import {CREATE_CASE_REQUEST} from '@modules/CaseSelectionModule/Types/RequestTypes';
import {
  MAIN_STACK_ROUTE_NAME,
  AUTH_STACK_ROUTE_NAME,
  HOME_DRAWER_ROUTE_NAME,
  TRACKER_STACK_ROUTE_NAME,
  SETTING_STACK_ROUTE_NAME,
  SUBMIT_CASES_STACK_ROUTE_NAME,
  ACCOUNT_SETTING_STACK_ROUTE_NAME,
  SCHEDULE_STACK_ROUTE_NAME,
} from '@utils/Constants';

export type MainStackParamList = {
  [MAIN_STACK_ROUTE_NAME.HOME_DRAWER]?: {
    isContinueWithActiveCase?: boolean;
    screen?: HOME_DRAWER_ROUTE_NAME;
  };
  [MAIN_STACK_ROUTE_NAME.OT_SELECTION]?: {};
  [MAIN_STACK_ROUTE_NAME.WEB_VIEWER]?: {source: any};
};
export type AuthStackParamList = {
  [AUTH_STACK_ROUTE_NAME.LOGIN]?: {};
  [AUTH_STACK_ROUTE_NAME.RECOVER_USERNAME]?: {};
  [AUTH_STACK_ROUTE_NAME.RECOVER_PASSWORD]?: {};
};
export type HomeDrawerParamList = {
  [HOME_DRAWER_ROUTE_NAME.SCHEDULE_STACK]?: {screen: string};
  [HOME_DRAWER_ROUTE_NAME.TRACKER_STACK]?: {
    isContinueWithActiveCase?: boolean;
    screen?: keyof TrackerStackParamList;
  };
  [HOME_DRAWER_ROUTE_NAME.CASEBOARD]?: {};
  [HOME_DRAWER_ROUTE_NAME.CASES]?: {};
  [HOME_DRAWER_ROUTE_NAME.SETTINGS_STACK]?: {};
  [HOME_DRAWER_ROUTE_NAME.SUPPORT]?: {};
  [HOME_DRAWER_ROUTE_NAME.VOICE_RECORDING]: {};
  [HOME_DRAWER_ROUTE_NAME.ACCOUNT_SETTINGS_STACK]?: {};
  [HOME_DRAWER_ROUTE_NAME.ROOM_CLEAN]?: {};
};
export type TrackerStackParamList = {
  [TRACKER_STACK_ROUTE_NAME.NO_ACTIVE_CASE]?: {};
  [TRACKER_STACK_ROUTE_NAME.CASE_TRACKER]?: {};
  [TRACKER_STACK_ROUTE_NAME.LAST_CASE_CONFIRMATION]?: {};
};

export type SettingStackParamList = {
  [SETTING_STACK_ROUTE_NAME.SETTINGS]?: {};
  [SETTING_STACK_ROUTE_NAME.VOICE_OPTIMISATION]?: {};
};
export type AccountSettingStackParamList = {
  [ACCOUNT_SETTING_STACK_ROUTE_NAME.ACCOUNT_SETTINGS]?: {};
  [ACCOUNT_SETTING_STACK_ROUTE_NAME.CHANGE_PASSWORD]?: {};
};
export type CaseSubmittedStackParamList = {
  [SUBMIT_CASES_STACK_ROUTE_NAME.SUBMITTED_CASES]?: {};
  [SUBMIT_CASES_STACK_ROUTE_NAME.CASE_DETAIL]?: {
    caseId: number;
    isEdit?: boolean;
  };
};

export type ScheduleStackParamList = {
  [SCHEDULE_STACK_ROUTE_NAME.CASE_SCHEDULE]?: {};
  [SCHEDULE_STACK_ROUTE_NAME.CONFIRM_PATIENT]?: {
    caseDetail: CREATE_CASE_REQUEST;
    heading?: OptionalLocaleString;
  };
};

export type SettingFormValues = {
  native_language?: string;
  device_type?: string;
  time_format?: string;
  enable_earcons?: boolean;
};
