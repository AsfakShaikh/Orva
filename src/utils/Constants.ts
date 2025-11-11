import {Strings} from '@locales/Localization';
import {theme} from '@styles/Theme';
const {colors} = theme;

export enum AUTH_STACK_ROUTE_NAME {
  LOGIN = 'LOGIN',
  RECOVER_USERNAME = 'RECOVER_USERNAME',
  RECOVER_PASSWORD = 'RECOVER_PASSWORD',
}

export enum MAIN_STACK_ROUTE_NAME {
  HOME_DRAWER = 'HOME_DRAWER',
  OT_SELECTION = 'OT_SELECTION',
  WEB_VIEWER = 'WEB_VIEWER',
}

export enum HOME_DRAWER_ROUTE_NAME {
  SCHEDULE_STACK = 'SCHEDULE_STACK',
  TRACKER_STACK = 'TRACKER_STACK',
  CASEBOARD = 'CASEBOARD',
  CASES = 'CASES',
  SETTINGS_STACK = 'SETTINGS_STACK',
  SUPPORT = 'SUPPORT',
  VOICE_RECORDING = 'VOICE_RECORDING',
  ACCOUNT_SETTINGS_STACK = 'ACCOUNT_SETTINGS_STACK',
  ROOM_CLEAN = 'ROOM_CLEAN',
}
export enum TRACKER_STACK_ROUTE_NAME {
  NO_ACTIVE_CASE = 'NO_ACTIVE_CASE',
  CASE_TRACKER = 'CASE_TRACKER',
  LAST_CASE_CONFIRMATION = 'LAST_CASE_CONFIRMATION',
}

export enum SETTING_STACK_ROUTE_NAME {
  SETTINGS = 'SETTINGS',
  VOICE_OPTIMISATION = 'VOICE_OPTIMISATION',
}
export enum ACCOUNT_SETTING_STACK_ROUTE_NAME {
  ACCOUNT_SETTINGS = 'ACCOUNT_SETTINGS',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
}

export enum SUBMIT_CASES_STACK_ROUTE_NAME {
  CASE_DETAIL = 'CASE_DETAIL',
  SUBMITTED_CASES = 'SUBMITTED_CASES',
}

export enum SCHEDULE_STACK_ROUTE_NAME {
  CASE_SCHEDULE = 'CASE_SCHEDULE',
  CONFIRM_PATIENT = 'CONFIRM_PATIENT',
}

export enum NOTES_CATEGORIES {
  GENERAL_CASE_NOTE = 'General Case Note',
  ADDITIONAL_MILESTONES = 'Additional Milestones',
  // CLINICAL_OBSERVATION = 'Clinical Observations',
  CLINICAL_NOTES = 'Clinical Notes',
  PATIENT_POSITIONING = 'Patient Positioning',
  MEDICATIONS_NOTES = 'Medications Notes',
  INSTRUMENT_NOTES = 'Instrument Notes',
  IMPLANT_USAGE = 'Implant Usage',
  SUPPLIES_CONSUMABLES_NOTES = 'Supplies & Consumables Counts & Notes',
  EQUIPMENT_NOTES = 'Equipment Notes',
  // EQUIPMENT_MALFUNCTIONS = 'Equipment Malfunctions',
  // CLINICAL_FINDINGS = 'Clinical Findings',
  INTUBATION_NOTES = 'Intubation Notes',
  EXTUBATION_NOTES = 'Extubation Notes',
  // New classifications from image
  CLINICAL_FINDING = 'Clinical Finding',
  ANESTHESIA_TYPE = 'Anesthesia Type',
  TEMPERATURE_CONTROL = 'Temperature Control',
  PATIENT_POSITION = 'Patient Position',
  HEAD = 'Head',
  EYE = 'Eye',
  ARMS_POSITION = 'Arms Position',
  PRESSURE_RELIEF = 'Pressure Relief',
  DVT_PREVENTION = 'DVT Prevention',
  TOURNIQUET = 'Tourniquet',
  ENERGY_DEVICE = 'Energy Device',
  CATHETERISATION = 'Catheterisation',
  XRAY_IMAGES = 'X-Ray & Images',
  WOUND_CLASSIFICATION = 'Wound Classification',
  SKIN_PREPARATION = 'Skin Preparation',
  LOCAL_INFILTRATION = 'Local Infiltration',
  BLOOD_FLUID_LOSS = 'Blood/Fluid Loss',
  SKIN_CLOSURE = 'Skin Closure',
  DRESSING = 'Dressing',
  POP = 'POP',
  PACKS = 'Packs',
  DRAINS = 'Drains',
  POST_OP_SKIN_CONDITION = 'Post-Op Skin Condition',
  SPECIMEN = 'Specimen',
  INTRA_OPERATIVE_PROGRESS_NOTES = 'Intra-Operative Progress Notes',
  IMPLANT_RECORD = 'Implant Record',
}
export const deviceOptions = [
  {key: 'desktop', value: 'Desktop'},
  {key: 'ipad-gen-9', value: 'iPad gen 9'},
  {key: 'ipad-pro', value: 'iPad Pro'},
  {key: 'macbook-air', value: 'MacBook Air'},
  {key: 'macbook-pro-13', value: "MacBook Pro 13'"},
  {key: 'macbook-pro-14', value: "MacBook Pro 14'"},
  {key: 'macbook-pro-15', value: "MacBook Pro 15'"},
  {key: 'i-dont-know', value: "I don't know"},
  {key: 'other', value: 'Other'},
];

export const VoiceCommandLabels = [
  'Start',
  'Voice Command 1 ',
  'Voice Command 2',
  // 'Voice Command 3',
  // 'Voice Command 4 ',
  // 'Voice Command 5 ',
  'Finish',
];
export const VoiceCommandSubLabels = [
  '',
  '"Hey Orva"',
  '"Okay Orva"',
  '',
  // '"Wheels in"',
  // '"Anesthesia..."',
  // '"Procedure..."',
  // '"Ready for Transport"',
];

export const timeForat = [
  {key: '24 Hours', value: '24_HOURS'},
  {key: '12 Hours', value: '12_HOURS'},
];
export const ENABLE_EARCONS_OPTIONS = [
  {key: 'Enable', value: true},
  {key: 'Disable', value: false},
];

export const recordingStepsContent = [
  {
    step: 1,
    title: 'Say "Hey Orva" into the microphone',
  },
  {
    step: 2,
    title: 'Say "Okay Orva" into the microphone',
  },

  // {
  //   step: 3,
  //   title: 'Say "Anaesthesia" into the microphone',
  // },

  // {
  //   step: 4,
  //   title: 'Say "Procedure" into the microphone',
  // },

  // {
  //   step: 5,
  //   title: 'Say "Ready for Transport" into the microphone',
  // },
  {
    step: 3,
    title: 'Voice Optimization Complete',
  },
];
export const caseTrackerSteps = [
  {
    id: 1,
    label: Strings.Room_Ready,
    description: Strings.Preparing_for_New_Case,
  },
  {
    id: 2,
    label: Strings.Wheels_In,
    description: Strings.Awaiting_Patient_Entry,
  },
  {id: 3, label: Strings.Patient_Ready, description: Strings.Waiting_for_Block},
  {
    id: 4,
    label: Strings.Procedure_Start,
    description: Strings.Waiting_for_Procedure_to_Begin,
  },
  {
    id: 5,
    label: Strings.Procedure_End,
    description: Strings.Procedure_in_Progress,
  },
  {
    id: 6,
    label: Strings.Ready_to_Exit,
    description: Strings.Preparing_Patient_Transport,
  },
  {id: 7, label: Strings.Wheels_Out, description: Strings.Waiting_to_Transport},
  {
    id: 8,
    label: Strings.Room_Clean,
    description: Strings.Waiting_on_Housekeeping,
  },
];

export const headerColors = [
  {
    title: Strings.TurnOver_Time,
    BGcolor: colors.background.primary,
    textColor: colors.foreground.primary,
  },
  {
    title: Strings.First_Case_Start_in,
    BGcolor: colors.background.primary,
    textColor: colors.foreground.primary,
  },
  {
    title: Strings.First_Case_Delayed_by,
    BGcolor: colors.background.attention,
    textColor: colors.foreground.inverted,
  },
  {
    title: Strings.Timer_Inactive,
    BGcolor: colors.background.inactive,
    textColor: colors.foreground.inactive,
  },
];
export const caseboardHeaderColors = [
  {
    title: Strings.TurnOver_Time,
    BGcolor: colors.background.secondary,
    textColor: colors.foreground.primary,
  },
  {
    title: Strings.Case_Time,
    BGcolor: colors.background.inverse,
    textColor: colors.foreground.inverted,
  },
  {
    title: Strings.First_Case_Start_in,
    BGcolor: colors.background.secondary,
    textColor: colors.foreground.primary,
  },
  {
    title: Strings.First_Case_Delayed_by,
    BGcolor: colors.background.attention,
    textColor: colors.foreground.inverted,
  },
  {
    title: Strings.Timer_Inactive,
    BGcolor: colors.background.inactive,
    textColor: colors.foreground.inactive,
  },
];
export const DEFAULT_TIME_ZONE = 'Asia/Dubai';

export enum MILESTONE_TRACKER_STEPS {
  ROOM_READY = 'Room Ready',
  WHEELS_IN = 'Wheels In',
  PATIENT_READY = 'Patient Ready',
  PROCEDURE_START = 'Procedure Start',
  PROCEDURE_END = 'Procedure End',
  READY_TO_EXIT = 'Ready to Exit',
  WHEELS_OUT = 'Wheels Out',
  ROOM_CLEAN = 'Room Clean',
}

export enum OPTIONAL_MILESTONE_TRACKER_STEPS {
  ANESTHESIA_START = 'Anesthesia Start',
  PATIENT_ASLEEP = "Patient's Asleep",
  TIMEOUT_TIME = 'Timeout Time',
  PATIENT_AWAKE = "Patient's Awake",
}

export enum PARTICIPANT_TYPE {
  SURGEON = 'SURGEON',
  ANESTHESIOLOGIST = 'ANESTHESIOLOGIST',
}

export enum EventTypeEnum {
  UPSERT_CASE = 'UPSERT_CASE',
  UPDATE_CASE = 'UPDATE_CASE',
  DELETE_CASE = 'DELETE_CASE',
  RESET_CASE = 'RESET_CASE',
  UPDATE_CASE_STATUS = 'UPDATE_CASE_STATUS',
  UPDATE_MILESTONES = 'UPDATE_MILESTONES',
  GET_CASES = 'GET_CASES',
  GET_CASE_BY_ID = 'GET_CASE_BY_ID',
  ERROR = 'ERROR',
  UNKNOWN_EVENT = 'UNKNOWN_EVENT',
  SUBMIT_CASE = 'SUBMIT_CASE',
  KNOCK_OUT = 'KNOCK_OUT',
  LOGOUT = 'LOGOUT',
}

export const SocketEventEnum = {
  CASE_EVENTS: 'case-events',
  APP_LOG_EVENTS: 'app-log-events',
  ASR_LOG_EVENTS: 'asr-log-events',
  CASE_UPDATE_EVENT: 'CaseUpdateEvent',
};

export enum SOCKET_EVENTS {
  CASE_EVENTS = 'case-events',
  APP_LOG_EVENTS = 'app-log-events',
  ASR_LOG_EVENTS = 'asr-log-events',
}

export const REFRESH_TOKEN_BEFORE_TIME = 30 * 1000; // 30 seconds

export const caseSummaryLabels = [Strings.Voice_Notes, Strings.Comments_Label];

export const passwordRequirements = [
  Strings.Password_Req_1,
  Strings.Password_Req_2,
  Strings.Password_Req_3,
  Strings.Password_Req_4,
  Strings.Password_Req_5,
];

export const USER_GUIDE_URL =
  'https://docs.google.com/presentation/d/1cidAqnKod_4UEG06uwHKshOOZPBalt5h/preview?slide=id.p1';

export const defaultDuration = {hours: '', mins: '', secs: ''};

export const NATIVE_LANGUAGES_OPTIONS = [
  {key: 'Albanian', value: 'albanian'},
  {key: 'Amharic', value: 'amharic'},
  {key: 'Arabic - Egyptian', value: 'arabic - egyptian'},
  {key: 'Arabic - Gulf', value: 'arabic - gulf'},
  {key: 'Arabic - Levantine', value: 'arabic - levantine'},
  {key: 'Arabic - Modern Standard', value: 'arabic - modern standard'},
  {key: 'Azerbaijani', value: 'azerbaijani'},
  {key: 'Baluchi', value: 'baluchi'},
  {key: 'Basque', value: 'basque'},
  {key: 'Bengali', value: 'bengali'},
  {key: 'Bulgarian', value: 'bulgarian'},
  {key: 'Burmese', value: 'burmese'},
  {key: 'Catalan', value: 'catalan'},
  {key: 'Chinese - Mandarin', value: 'chinese - mandarin'},
  {key: 'Chinese - Wu', value: 'chinese - wu'},
  {key: 'Chinese - Yue', value: 'chinese - yue'},
  {key: 'Croatian', value: 'croatian'},
  {key: 'Czech', value: 'czech'},
  {key: 'Danish', value: 'danish'},
  {key: 'Dari', value: 'dari'},
  {key: 'Dutch', value: 'dutch'},
  {key: 'English - Australian', value: 'english - australian'},
  {key: 'English - British General', value: 'english - british general'},
  {key: 'English - Irish', value: 'english - irish'},
  {key: 'English - New Zealand', value: 'english - new zealand'},
  {key: 'English - US General', value: 'english - us general'},
  {key: 'Filipino', value: 'filipino'},
  {key: 'Finnish', value: 'finnish'},
  {key: 'French', value: 'french'},
  {key: 'German', value: 'german'},
  {key: 'Greek', value: 'greek'},
  {key: 'Gujarati', value: 'gujarati'},
  {key: 'Hausa', value: 'hausa'},
  {key: 'Hebrew', value: 'hebrew'},
  {key: 'Hindi', value: 'hindi'},
  {key: 'Hungarian', value: 'hungarian'},
  {key: 'Icelandic', value: 'icelandic'},
  {key: 'Indonesian', value: 'indonesian'},
  {key: 'Iranian Persian', value: 'iranian persian'},
  {key: 'Italian', value: 'italian'},
  {key: 'Japanese', value: 'japanese'},
  {key: 'Javanese', value: 'javanese'},
  {key: 'Kannada', value: 'kannada'},
  {key: 'Kazakh', value: 'kazakh'},
  {key: 'Korean', value: 'korean'},
  {key: 'Kurdish', value: 'kurdish'},
  {key: 'Latvian', value: 'latvian'},
  {key: 'Lithuanian', value: 'lithuanian'},
  {key: 'Malay', value: 'malay'},
  {key: 'Malayalam', value: 'malayalam'},
  {key: 'Maltese', value: 'maltese'},
  {key: 'Marathi', value: 'marathi'},
  {key: 'Nepali', value: 'nepali'},
  {key: 'Nigerian Pidgin', value: 'nigerian pidgin'},
  {key: 'Norwegian', value: 'norwegian'},
  {key: 'Pashto', value: 'pashto'},
  {key: 'Polish', value: 'polish'},
  {key: 'Portuguese', value: 'portuguese'},
  {key: 'Romanian', value: 'romanian'},
  {key: 'Russian', value: 'russian'},
  {key: 'Serbian', value: 'serbian'},
  {key: 'Sindhi', value: 'sindhi'},
  {key: 'Sinhala', value: 'sinhala'},
  {key: 'Slovak', value: 'slovak'},
  {key: 'Spanish', value: 'spanish'},
  {key: 'Swahili', value: 'swahili'},
  {key: 'Swedish', value: 'swedish'},
  {key: 'Tajik', value: 'tajik'},
  {key: 'Tamil', value: 'tamil'},
  {key: 'Telugu', value: 'telugu'},
  {key: 'Thai', value: 'thai'},
  {key: 'Turkish', value: 'turkish'},
  {key: 'Urdu', value: 'urdu'},
  {key: 'Uzbek', value: 'uzbek'},
  {key: 'Vietnamese', value: 'vietnamese'},
  {key: 'Western Punjabi', value: 'western punjabi'},
  {key: 'Other (not listed)', value: 'other (not listed)'},
];

export enum STATUS {
  ERROR = 'ERROR',
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
}

export const GENDER_LIST = [
  {key: 'Male', value: 'MALE'},
  {key: 'Female', value: 'FEMALE'},
  {key: 'Other', value: 'OTHER'},
];

export const DEFAULT_WW_THRESHOLD = 95;
