import {
  VOICE_INETENT_EVENT,
  CASE_NOTE_INTENT_EVENT,
  VOICE_INTENT,
  CASE_NOTE_CLASSIFICATION_EVENT,
  VOICE_INTRACTION_PANEL_INTENT_EVENT,
  VOICE_INTRACTION_PANEL_MODE,
  TOAST_MESSAGE_EVENT,
  ASR_LOG_EVENT,
  CASE_NOTE_EVENT,
  VOICE_CAPABILITIES_EVENT,
  VOICE_COMAND_STATUS,
  VOICE_PANEL_EVENT,
} from '../Types/CommonTypes';
import {emitEvent} from '@hooks/useEventEmitter';
import usePermission from '@hooks/usePermission';
import {Strings} from '@locales/Localization';
import {asrLogEventSocketInstance} from '@navigation/Router';
import {useEffect, useRef, useState} from 'react';
import {NativeEventEmitter} from 'react-native';
import {PERMISSIONS} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {SOCKET_EVENTS} from '@utils/Constants';
import Config from 'react-native-config';
import SpeechDetection from '@nativeModules/SpeechDetection';
import {resetUserInactivity} from '@modules/AuthModule/Components/DetectInactivity';
import {noteClassificationProp} from '@utils/Types';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {toggleVoiceIntractionPanel} from '../Components/VoiceIntractionPanel';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {captureSentryApiError} from '@utils/Sentry';
export function fireVoiceIntent(voiceIntent: VOICE_INTENT) {
  emitEvent(VOICE_INETENT_EVENT, voiceIntent);
}
export function fireCaseNoteEvent(data?: {
  caseIntentData?: string;
  isCaseNoteCompleted?: boolean;
  isCaseNoteInitiated?: boolean;
  isCaseNoteCanceled?: boolean;
  isCaseNoteProcessing?: boolean;
}) {
  emitEvent(CASE_NOTE_INTENT_EVENT, data);
}

export function fireVoicePanelIntentEvent(data?: {
  transcription?: string;
  isSilenceDetected?: boolean;
}) {
  emitEvent(VOICE_INTRACTION_PANEL_INTENT_EVENT, data);
}

export function fireVoiceClassificationIntent(
  noteClassificationIntent: noteClassificationProp,
) {
  emitEvent(CASE_NOTE_CLASSIFICATION_EVENT, noteClassificationIntent);
}

export default function useVoiceCapabilities(
  username?: string | null,
  cb?: (isDetected: boolean) => void,
) {
  const {requestMultiplePermission} = usePermission();
  const wakeWordDetectedRef = useRef<boolean>(false);
  const [userIp, setUserIp] = useState('');
  const startListening = (
    preferredDeviceId: number | null = null,
    preferredDeviceType: number | null = null,
    preferredDeviceName: string | null = null,
  ) => {
    requestMultiplePermission(
      [
        {
          permission: PERMISSIONS.ANDROID.RECORD_AUDIO,
          label: Strings.Record_audio,
          mandatory: true,
          errorTitle: Strings.No_Microphone_Access_Title,
          errorMessage: Strings.No_Microphone_Access_Subtitle,
        },
        {
          permission: PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          label: '',
          mandatory: true,
        },
      ],
      () => {
        SpeechDetection.startListening({
          preferredDeviceId: preferredDeviceId,
          preferredDeviceType: preferredDeviceType,
          preferredDeviceName: preferredDeviceName,
          userName: username,
        });
      },
    );
  };

  useEffect(() => {
    startListening();
    DeviceInfo.getIpAddress().then(ip => {
      setUserIp(ip);
    });
    const payload = {
      serviceName: 'ASR_Service',
      eventType: 'INFO',
      ipAddress: userIp,
      userName: username,
      env: Config.APP_ENVIRONMENT,
      metadata: '{}',
      message: '',
      timestamp: formatDateTime(
        new Date(),
        FORMAT_DATE_TYPE.NONE,
        'yyyy-MM-dd HH:mm:ss',
      ),
      updatedAt: formatDateTime(
        new Date(),
        FORMAT_DATE_TYPE.NONE,
        'yyyy-MM-dd HH:mm:ss',
      ),
    };
    const eventEmitter = new NativeEventEmitter(SpeechDetection);

    eventEmitter.addListener(
      VOICE_CAPABILITIES_EVENT.WW_DETECTED,
      isDetected => {
        wakeWordDetectedRef.current = isDetected;
        cb?.(isDetected);
        //device info
        if (isDetected) {
          resetUserInactivity();
          toggleVoiceIntractionPanel({
            isVisible: true,
            mode: VOICE_INTRACTION_PANEL_MODE.TRANSCRIPTION,
          });
        }
      },
    );

    eventEmitter.addListener(VOICE_PANEL_EVENT.TRANSCRIPTION, response => {
      try {
        fireVoicePanelIntentEvent({transcription: response});
      } catch (error) {
        wakeWordDetectedRef.current = false;
      }
    });

    eventEmitter.addListener(VOICE_PANEL_EVENT.SILENCE_DETECTED, response => {
      try {
        fireVoicePanelIntentEvent({isSilenceDetected: response});
      } catch (error) {
        wakeWordDetectedRef.current = false;
      }
    });

    eventEmitter.addListener(
      VOICE_CAPABILITIES_EVENT.INTENT_DETECTION,
      response => {
        try {
          if (wakeWordDetectedRef.current) {
            const {final_intent} = JSON.parse(response);
            console.log('************** final_intent: ' + final_intent);
            if (final_intent && final_intent !== VOICE_INTENT.UNKNOWN) {
              fireVoiceIntent(final_intent);
            } else {
              fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
            }
            cb?.(false);
            wakeWordDetectedRef.current = false;
          }
        } catch (error) {
          console.log('Intent Detection Error: ', error);
          fireVoiceIntent(VOICE_INTENT.UNKNOWN);
          fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
          cb?.(false);
          wakeWordDetectedRef.current = false;
        }
        resetUserInactivity();
      },
    );

    eventEmitter.addListener(CASE_NOTE_EVENT.TRANSCRIPTION, response => {
      try {
        fireCaseNoteEvent({caseIntentData: response});
      } catch (error) {
        wakeWordDetectedRef.current = false;
      }
    });

    eventEmitter.addListener(CASE_NOTE_EVENT.CLASSIFICATION, response => {
      try {
        console.log(
          '************** CASE_NOTE_EVENT.CLASSIFICATION: ' + response,
        );
        fireVoiceClassificationIntent(response);
      } catch (error) {
        console.error('CLASSIFICATION ERROR', error);
      }
    });

    eventEmitter.addListener(CASE_NOTE_EVENT.COMPLETED, response => {
      try {
        fireCaseNoteEvent({isCaseNoteCompleted: response});
      } catch (error) {
        wakeWordDetectedRef.current = false;
      }
    });

    eventEmitter.addListener(CASE_NOTE_EVENT.CANCELED, response => {
      try {
        fireCaseNoteEvent({isCaseNoteCanceled: response});
      } catch (error) {
        wakeWordDetectedRef.current = false;
      }
    });

    eventEmitter.addListener(CASE_NOTE_EVENT.PROCESSING, response => {
      try {
        fireCaseNoteEvent({isCaseNoteProcessing: response});
      } catch (error) {
        wakeWordDetectedRef.current = false;
      }
    });
    eventEmitter.addListener(ASR_LOG_EVENT, response => {
      const {message, ...rest} = response;
      payload.message = message;
      payload.metadata = JSON.stringify(rest);
      asrLogEventSocketInstance?.emit(SOCKET_EVENTS.ASR_LOG_EVENTS, payload);
    });
    eventEmitter.addListener(TOAST_MESSAGE_EVENT, (message: string) => {
      console.log('************** ASR API ERROR: ' + message);
      HeaderSnackbarHandler.attentionToast(Strings.Something_went_wrong);
      captureSentryApiError(message);
    });

    return () => {
      eventEmitter.removeAllListeners(VOICE_CAPABILITIES_EVENT.WW_DETECTED);
      eventEmitter.removeAllListeners(
        VOICE_CAPABILITIES_EVENT.INTENT_DETECTION,
      );
      eventEmitter.removeAllListeners(CASE_NOTE_EVENT.TRANSCRIPTION);
      eventEmitter.removeAllListeners(CASE_NOTE_EVENT.COMPLETED);
      eventEmitter.removeAllListeners(CASE_NOTE_EVENT.CANCELED);
      eventEmitter.removeAllListeners(VOICE_CAPABILITIES_EVENT.AUDIO_DECIBEL);
      eventEmitter.removeAllListeners(ASR_LOG_EVENT);
      eventEmitter.removeAllListeners(TOAST_MESSAGE_EVENT);
      SpeechDetection.stopListening();
      cb?.(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopListening = () => {
    SpeechDetection.stopListening();
    cb?.(false);
    wakeWordDetectedRef.current = false;
  };

  const setWWDetected = (isDetected: boolean) => {
    wakeWordDetectedRef.current = isDetected;
    SpeechDetection.setWWDetected(isDetected);
  };

  const resetSpeechProcessing = () => {
    wakeWordDetectedRef.current = false;
    SpeechDetection.resetSpeechProcessing();
  };

  return {
    stopListening,
    wwDetected: wakeWordDetectedRef.current,
    setWWDetected,
    resetSpeechProcessing,
  };
}
