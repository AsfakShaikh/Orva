export enum VOICE_COMAND_STATUS {
  DEFAULT = 'DEFAULT',
  LOADING = 'LOADING',
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  LISTENING = 'LISTENING',
}

export enum CONNECTION_TYPE {
  USB = 'usb',
  BLUETOOTH = 'bluetooth',
}

export enum CASE_NOTE_EVENT {
  INITIATED = 'CASE_NOTE_INITIATED',
  COMPLETED = 'CASE_NOTE_COMPLETED',
  CANCELED = 'CASE_NOTE_CANCELED',
  TRANSCRIPTION = 'CASE_NOTE_TRANSCRIPTION',
  CLASSIFICATION = 'CASE_NOTE_CLASSIFICATION',
  PROCESSING = 'CASE_NOTE_PROCESSING',
}

export enum VOICE_CAPABILITIES_EVENT {
  WW_DETECTED = 'WW_DETECTED',
  INTENT_DETECTION = 'INTENT_DETECTION',
  AUDIO_DECIBEL = 'AUDIO_DECIBEL',
  PROCESSING_INTENT = 'PROCESSING_INTENT',
}

export enum VOICE_PANEL_EVENT {
  TRANSCRIPTION = 'VOICE_PANEL_TRANSCRIPTION',
  SILENCE_DETECTED = 'VOICE_PANEL_SILENCE_DETECTED',
}

export const ASR_LOG_EVENT = 'ASR_LOG_EVENT';
export const TOAST_MESSAGE_EVENT = 'TOAST_MESSAGE_EVENT';

export type SYSTEM_STATE = {
  connectedDevice?: AUDIO_DEVICE;
  currentDevice?: {
    deviceName: string;
  };
};

export type AUDIO_DEVICE = {
  id: number;
  type: number;
  deviceName: string;
  connectionType: CONNECTION_TYPE;
  isMicAccessible: boolean;
};

export enum VOICE_INTRACTION_PANEL_MODE {
  TRANSCRIPTION,
  PROCESSING,
  LOADING,
  DISPLAY_INFO,
  TEXT_TO_SPEECH,
}
export enum DISPLAY_INFO_PANEL_STATUS {
  SUCCESS,
  ERROR,
  DEFAULT,
}

export const VOICE_INETENT_EVENT = 'VOICE_INETENT_EVENT';
export const CASE_NOTE_INTENT_EVENT = 'CASE_NOTE_INTENT_EVENT';
export const CASE_NOTE_CLASSIFICATION_EVENT = 'CASE_NOTE_CLASSIFICATION_EVENT';
export const ORVA_STATUS_EVENT = 'ORVA_STATUS_EVENT';
export const VOICE_INTRACTION_PANEL_INTENT_EVENT =
  'VOICE_INTRACTION_PANEL_INTENT_EVENT';

export enum VOICE_INTENT {
  WHEELS_IN = 'wheels in',
  ANAESTHESIA_START = 'anaesthesia start',
  PATIENT_ASLEEP = 'patient asleep',
  PATIENT_AWAKE = 'awaken from anesthesia',
  SKIP_ANAESTHESIA_START = 'skip anaesthesia start',
  SKIP_PATIENT_ASLEEP = 'skip patient asleep',
  SKIP_PATIENT_AWAKE = 'skip patient awake',
  PATIENT_READY = 'patient ready',
  PROCEDURE_START = 'procedure start',
  PROCEDURE_END = 'procedure end',
  READY_TO_EXIT = 'ready to exit',
  WHEELS_OUT = 'wheels out',
  ROOM_CLEAN = 'room clean',
  ROOM_READY = 'room ready',
  TIMEOUT = 'timeout',
  CONFIRM_PATIENT = 'confirm patient',
  CASE_SELECT = 'case select',
  VIEW_CASE_LIST = 'case list',
  NAVIGATE_TO_SETTINGS = 'navigate to settings',
  NAVIGATE_TO_SIDEBAR = 'navigate to sidebar',
  NAVIGATE_TO_CASE_TRACKER = 'navigate to case tracker',
  VIEW_CASEBOARD = 'navigate to caseboard',
  GET_SUPPORT = 'navigate to support',
  NAVIGATE_TO_CASE_SUMMARY = 'navigate to case summary',
  NAVIGATE_TO_CASES = 'navigate to cases',
  SKIP_ENTRY = 'skip entry',
  ENTER_PATIENT_INFORMATION = 'enter patient information',
  ADD_NEW_CASE = 'add new case',
  SUBMIT_AND_CLOSE_THE_CASE = 'submit and close the case',
  VOICE_NOTE = 'voice note',
  SET_TIMER = 'set timer',
  SET_ALARM = 'set alarm',
  DELETE_ALL_TOOLS = 'cancel all tools',
  RESUME_ALL_TIMERS = 'resume all timers',
  PAUSE_ALL_TOOLS = 'pause all tools',
  DISMISS_ALL_TOOLS = 'dismiss all tools',
  DELETE_TOOL = 'cancel tool',
  RESUME_TOOL = 'resume tool',
  PAUSE_TOOL = 'pause tool',
  DISMISS_TOOL = 'dismiss tool',
  ON_DEMAND_ALERTS = 'on demand alerts',
  YES = 'yes',
  NO = 'no',
  CANCEL = 'cancel',
  UNKNOWN = 'unknown',
}

// VIP will remains open for these intents
export const VOICE_INTRACTION_PANEL_INTENTS = [
  VOICE_INTENT.WHEELS_IN,
  VOICE_INTENT.ANAESTHESIA_START,
  VOICE_INTENT.SKIP_ANAESTHESIA_START,
  VOICE_INTENT.PATIENT_READY,
  VOICE_INTENT.PROCEDURE_START,
  VOICE_INTENT.PROCEDURE_END,
  VOICE_INTENT.READY_TO_EXIT,
  VOICE_INTENT.WHEELS_OUT,
  VOICE_INTENT.ROOM_CLEAN,
  VOICE_INTENT.ROOM_READY,
  VOICE_INTENT.TIMEOUT,
  VOICE_INTENT.VOICE_NOTE,
  VOICE_INTENT.SET_TIMER,
  VOICE_INTENT.SET_ALARM,
];

export enum INITIATED_INTENTS {
  VOICE_NOTE = 'voice note',
  SET_TIMER = 'set timer',
}

export const NAVIGATION_INTENTS_ARRAY = [
  VOICE_INTENT.VIEW_CASE_LIST,
  VOICE_INTENT.NAVIGATE_TO_CASE_TRACKER,
  VOICE_INTENT.NAVIGATE_TO_SETTINGS,
  VOICE_INTENT.VIEW_CASEBOARD,
  VOICE_INTENT.GET_SUPPORT,
];
