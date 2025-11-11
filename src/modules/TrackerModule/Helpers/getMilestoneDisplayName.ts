import {Strings} from '@locales/Localization';
import {OPTIONAL_MILESTONE_TRACKER_STEPS} from '@utils/Constants';

export default function getMilestoneDisplayName(milestoneName?: string | null) {
  if (!milestoneName) {
    return '';
  }
  if (milestoneName === 'Anaesthesia Start') {
    return Strings.Anesthesia_Start;
  }
  if (milestoneName === OPTIONAL_MILESTONE_TRACKER_STEPS.TIMEOUT_TIME) {
    return Strings.Timeout;
  }
  return milestoneName;
}
