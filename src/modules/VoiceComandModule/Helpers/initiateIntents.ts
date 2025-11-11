import {setWWDetected} from '@nativeModules/SpeechDetection';
import {INITIATED_INTENTS} from '../Types/CommonTypes';

export function initiateVoiceNote() {
  setWWDetected(true, INITIATED_INTENTS.VOICE_NOTE);
}

export function initiateSetTimer() {
  setWWDetected(true, INITIATED_INTENTS.SET_TIMER);
}
