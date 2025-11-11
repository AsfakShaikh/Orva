import getCaseStatusDisplayText from '@modules/CaseSelectionModule/Helpers/getCaseStatusDisplayText';
import {CASE_STATUS} from '@modules/CaseSelectionModule/Types/CommonTypes';

describe('trim function', () => {
  it('should return value for PLANNED', () => {
    expect(getCaseStatusDisplayText(CASE_STATUS.PLANNED)).toBe('Not Started');
  });

  it('should return value for ACTIVE', () => {
    expect(getCaseStatusDisplayText(CASE_STATUS.ACTIVE)).toBe('In Progress');
  });

  it('should return value for SUBMITTED', () => {
    expect(getCaseStatusDisplayText(CASE_STATUS.SUBMITTED)).toBe('Submitted');
  });

  it('should return value for different status', () => {
    expect(getCaseStatusDisplayText(CASE_STATUS.ALL_CASES)).toBe(
      CASE_STATUS.ALL_CASES,
    );
  });
});
