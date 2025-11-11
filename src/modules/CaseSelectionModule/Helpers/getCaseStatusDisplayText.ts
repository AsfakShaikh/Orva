import {CASE_STATUS} from '../Types/CommonTypes';

const STATUS_DISPLAY_MAP: Record<string, string> = {
  [CASE_STATUS.PLANNED]: 'Not Started',
  [CASE_STATUS.ACTIVE]: 'In Progress',
  [CASE_STATUS.SUBMITTED]: 'Submitted',
  [CASE_STATUS.SUSPENDED]: 'Suspended',
  [CASE_STATUS.NO_SHOW]: 'Suspended',
} as const;

export default function getCaseStatusDisplayText(caseStatus: string) {
  return STATUS_DISPLAY_MAP[caseStatus] ?? caseStatus ?? '';
}
