import {TIMER} from '@modules/TrackerModule/Types/CommonTypes';
import {INITIATED_INTENTS} from '@modules/VoiceComandModule/Types/CommonTypes';
import {NativeModules, Platform} from 'react-native';

interface SpeechDetectionProps {
  startListening(options: {
    preferredDeviceId?: number | null;
    preferredDeviceType?: number | null;
    preferredDeviceName?: string | null;
    userName?: string | null;
  }): void;
  stopListening(): void;
  setWWDetected(isDetected: boolean, intent?: INITIATED_INTENTS | null): void;
  sendEventToSpeechModule(event: string): void;
  processCaseNoteClassification(
    caseNote: string,
    caseNoteId: number,
    userName?: string | null,
  ): void;
  resetSpeechProcessing(): void;
  setWWThreshold({threshold}: {threshold?: number | null}): void;
  getAsrBaseUrl(): Promise<string>;
  switchMicrophone(options?: {
    preferredDeviceId?: number | null;
    preferredDeviceType?: number | null;
    preferredDeviceName?: string | null;
  }): void;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
  findTimer(candidateItems: Array<TIMER>, inputString: string): Promise<string>;
}

const NativeSpeechDetection: SpeechDetectionProps =
  Platform.OS === 'android'
    ? NativeModules.NativeSpeechModule
    : new Proxy(
        {
          startListening() {},
          stopListening() {},
          setWWDetected() {},
          sendEventToSpeechModule() {},
          processCaseNoteClassification() {},
          resetSpeechProcessing() {},
          setWWThreshold() {},
          getAsrBaseUrl() {
            return Promise.resolve('');
          },
          switchMicrophone() {},
          addListener() {},
          removeListeners() {},
          findTimer() {
            return Promise.resolve('');
          },
        },
        {},
      );

// Wrapper function to overload setWWDetected
export const setWWDetected = (
  isDetected: boolean,
  intent?: INITIATED_INTENTS | null,
) => {
  NativeSpeechDetection.setWWDetected(isDetected, intent ?? null);
};

export const {
  startListening,
  stopListening,
  sendEventToSpeechModule,
  processCaseNoteClassification,
  resetSpeechProcessing,
  setWWThreshold,
  getAsrBaseUrl,
  switchMicrophone,
  addListener,
  removeListeners,
  findTimer,
} = NativeSpeechDetection;

const SpeechDetection = {
  ...NativeSpeechDetection,
  setWWDetected,
};

export default SpeechDetection;
