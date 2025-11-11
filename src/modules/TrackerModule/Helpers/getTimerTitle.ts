import {Strings} from '@locales/Localization';
import {TIMER_STATUS} from '@modules/TrackerModule/Types/CommonTypes';

export default function getTimerTitle(status: TIMER_STATUS, action: string) {
  switch (status) {
    case TIMER_STATUS.PAUSED:
      return Strings.Timer_Paused;
    case TIMER_STATUS.RUNNING:
      return action === 'CREATE' ? Strings.Timer_Set : Strings.Timer_Resumed;
    case TIMER_STATUS.STOPPED:
      return Strings.Timer_Ended;
  }
}
