import {checkCaseDelayStatus} from '../src/modules/TrackerModule/Helpers/checkCaseDelayStatus';
import {CASE_LATE_TYPE} from '../src/modules/TrackerModule/Types/CommonTypes';
import {CASE_DETAIL} from '../src/modules/CaseSelectionModule/Types/CommonTypes';

// Mock the toggleReasonForLateModal function
jest.mock('../src/modules/TrackerModule/Components/ReasonForLateModal', () => ({
  toggleReasonForLateModal: jest.fn(),
}));

import {toggleReasonForLateModal} from '../src/modules/TrackerModule/Components/ReasonForLateModal';

const mockToggleReasonForLateModal =
  toggleReasonForLateModal as jest.MockedFunction<
    typeof toggleReasonForLateModal
  >;

describe('checkCaseDelayStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create a mock case detail
  const createMockCaseDetail = (
    overrides: Partial<CASE_DETAIL> = {},
  ): CASE_DETAIL => ({
    id: 1,
    startTime: new Date('2024-01-01T09:00:00Z'),
    endTime: new Date('2024-01-01T11:00:00Z'),
    actualStartTime: new Date('2024-01-01T09:00:00Z'),
    actualEndTime: new Date('2024-01-01T11:00:00Z'),
    procedureId: 'PROC001',
    assignedSurgeon: 'Dr. Smith',
    assignedAnaesthelogist: 'Dr. Johnson',
    isFirstCase: false,
    isLastCase: false,
    otId: 'OT001',
    status: 'ACTIVE',
    procedure: {
      name: 'Test Procedure',
      procedureId: 'PROC001',
      cptCode: 'CPT001',
      milestones: [],
    },
    patient: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      mrn: 'MRN001',
      dob: '1990-01-01',
    },
    currentMilestone: {
      id: 1,
      milestoneId: 'MIL001',
      order: 1,
      usedBy: null,
      completedTimestamp: '',
      startTime: '',
      loggedBy: null,
      skipped: false,
      activeColor: '#000000',
      waitingText: 'Waiting',
      displayName: 'Test Milestone',
      revisions: [],
    },
    timerLogs: {
      caseTime: null,
      currentWheelsIn: null,
      delayTime: null,
      currentWheelsOut: null,
      previousWheelOut: null,
      turnOverTime: null,
      id: 1,
    },
    participants: [],
    ...overrides,
  });

  describe('Input validation and edge cases', () => {
    test('should return false when no detail is provided', () => {
      const result = checkCaseDelayStatus();
      expect(result).toBe(false);
      expect(mockToggleReasonForLateModal).not.toHaveBeenCalled();
    });

    test('should return false when caseDetail is null', () => {
      const result = checkCaseDelayStatus({
        caseDetail: null as any,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(false);
      expect(mockToggleReasonForLateModal).not.toHaveBeenCalled();
    });

    test('should return false when caseDetail is undefined', () => {
      const result = checkCaseDelayStatus({
        caseDetail: undefined,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(false);
      expect(mockToggleReasonForLateModal).not.toHaveBeenCalled();
    });

    test('should return false when both delays are already added', () => {
      const caseDetail = createMockCaseDetail();
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: true,
        isEndDelayAdded: true,
      });
      expect(result).toBe(false);
      expect(mockToggleReasonForLateModal).not.toHaveBeenCalled();
    });

    test('should return false when caseDetail has missing time properties', () => {
      const caseDetail = createMockCaseDetail({
        actualStartTime: undefined as any,
        actualEndTime: undefined as any,
        startTime: undefined as any,
        endTime: undefined as any,
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(false);
      expect(mockToggleReasonForLateModal).not.toHaveBeenCalled();
    });
  });

  describe('No delay scenarios', () => {
    test('should return false when case starts and ends on time', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T08:55:00Z'), // 5 minutes early
        actualEndTime: new Date('2024-01-01T10:55:00Z'), // 5 minutes early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(false);
      expect(mockToggleReasonForLateModal).not.toHaveBeenCalled();
    });

    test('should return false when case starts and ends exactly on time', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T08:59:55Z'), // 5 seconds early
        actualEndTime: new Date('2024-01-01T10:59:55Z'), // 5 seconds early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(false);
      expect(mockToggleReasonForLateModal).not.toHaveBeenCalled();
    });

    test('should return false when delays are within 5 seconds tolerance', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T08:59:50Z'), // 10 seconds early
        actualEndTime: new Date('2024-01-01T10:59:50Z'), // 10 seconds early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(false);
      expect(mockToggleReasonForLateModal).not.toHaveBeenCalled();
    });
  });

  describe('Start delay scenarios', () => {
    test('should trigger start delay modal when case starts late and no delay added', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:10:00Z'), // 10 minutes late
        actualEndTime: new Date('2024-01-01T10:59:55Z'), // 5 seconds early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.START,
        caseId: 1,
        startLateBy: 10,
        isFirstCase: undefined,
      });
    });

    test('should not trigger start delay modal when start delay already added', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:10:00Z'), // 10 minutes late
        actualEndTime: new Date('2024-01-01T10:59:55Z'), // 5 seconds early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: true,
        isEndDelayAdded: false,
      });
      expect(result).toBe(false);
      expect(mockToggleReasonForLateModal).not.toHaveBeenCalled();
    });

    test('should handle start delay with isFirstCase flag', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:15:00Z'), // 15 minutes late
        actualEndTime: new Date('2024-01-01T10:59:55Z'), // 5 seconds early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
        isFirstCase: true,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.START,
        caseId: 1,
        startLateBy: 15,
        isFirstCase: true,
      });
    });

    test('should handle large start delay (more than 1 hour)', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T10:30:00Z'), // 1.5 hours late
        actualEndTime: new Date('2024-01-01T10:59:55Z'), // 5 seconds early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.START,
        caseId: 1,
        startLateBy: 90,
        isFirstCase: undefined,
      });
    });
  });

  describe('End delay scenarios', () => {
    test('should trigger end delay modal when case ends late and no delay added', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T08:59:55Z'), // 5 seconds early
        actualEndTime: new Date('2024-01-01T11:20:00Z'), // 20 minutes late
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.END,
        caseId: 1,
        endLateBy: 20,
        isFirstCase: undefined,
      });
    });

    test('should not trigger end delay modal when end delay already added', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T08:59:55Z'), // 5 seconds early
        actualEndTime: new Date('2024-01-01T11:20:00Z'), // 20 minutes late
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: true,
      });
      expect(result).toBe(false);
      expect(mockToggleReasonForLateModal).not.toHaveBeenCalled();
    });

    test('should handle end delay with isFirstCase flag', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T08:59:55Z'), // 5 seconds early
        actualEndTime: new Date('2024-01-01T11:45:00Z'), // 45 minutes late
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
        isFirstCase: true,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.END,
        caseId: 1,
        endLateBy: 45,
        isFirstCase: true,
      });
    });

    test('should handle large end delay (more than 2 hours)', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T08:59:55Z'), // 5 seconds early
        actualEndTime: new Date('2024-01-01T13:30:00Z'), // 2.5 hours late
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.END,
        caseId: 1,
        endLateBy: 150,
        isFirstCase: undefined,
      });
    });
  });

  describe('Both start and end delay scenarios', () => {
    test('should trigger both delay modal when case starts and ends late', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:15:00Z'), // 15 minutes late
        actualEndTime: new Date('2024-01-01T11:30:00Z'), // 30 minutes late
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.BOTH,
        caseId: 1,
        startLateBy: 15,
        endLateBy: 30,
        isFirstCase: undefined,
      });
    });

    test('should not trigger both delay modal when start delay already added', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:15:00Z'), // 15 minutes late
        actualEndTime: new Date('2024-01-01T11:30:00Z'), // 30 minutes late
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: true,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.END,
        caseId: 1,
        endLateBy: 30,
        isFirstCase: undefined,
      });
    });

    test('should not trigger both delay modal when end delay already added', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:15:00Z'), // 15 minutes late
        actualEndTime: new Date('2024-01-01T11:30:00Z'), // 30 minutes late
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: true,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.START,
        caseId: 1,
        startLateBy: 15,
        isFirstCase: undefined,
      });
    });

    test('should handle both delays with isFirstCase flag', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:20:00Z'), // 20 minutes late
        actualEndTime: new Date('2024-01-01T11:40:00Z'), // 40 minutes late
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
        isFirstCase: true,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.BOTH,
        caseId: 1,
        startLateBy: 20,
        endLateBy: 40,
        isFirstCase: true,
      });
    });
  });

  describe('Edge cases and boundary conditions', () => {
    test('should handle case with 5.1 second delay (just over tolerance)', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:00:05.1Z'), // 5.1 seconds late
        actualEndTime: new Date('2024-01-01T10:59:55Z'), // 5 seconds early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.START,
        caseId: 1,
        startLateBy: 0.085, // 5.1 seconds = 0.085 minutes
        isFirstCase: undefined,
      });
    });

    test('should handle case with negative time differences (early start/end)', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T08:45:00Z'), // 15 minutes early
        actualEndTime: new Date('2024-01-01T10:45:00Z'), // 15 minutes early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(false);
      expect(mockToggleReasonForLateModal).not.toHaveBeenCalled();
    });

    test('should handle case with very small delays (fractional minutes)', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:00:30Z'), // 30 seconds late
        actualEndTime: new Date('2024-01-01T10:59:55Z'), // 5 seconds early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.START,
        caseId: 1,
        startLateBy: 0.5, // 30 seconds = 0.5 minutes
        isFirstCase: undefined,
      });
    });

    test('should handle case with different case IDs', () => {
      const caseDetail = createMockCaseDetail({
        id: 999,
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:10:00Z'), // 10 minutes late
        actualEndTime: new Date('2024-01-01T10:59:55Z'), // 5 seconds early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.START,
        caseId: 999,
        startLateBy: 10,
        isFirstCase: undefined,
      });
    });
  });

  describe('Complex scenarios', () => {
    test('should handle case where start is early but end is late', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T08:45:00Z'), // 15 minutes early
        actualEndTime: new Date('2024-01-01T11:30:00Z'), // 30 minutes late
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.END,
        caseId: 1,
        endLateBy: 30,
        isFirstCase: undefined,
      });
    });

    test('should handle case where start is late but end is early', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:20:00Z'), // 20 minutes late
        actualEndTime: new Date('2024-01-01T10:45:00Z'), // 15 minutes early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.START,
        caseId: 1,
        startLateBy: 20,
        isFirstCase: undefined,
      });
    });

    test('should handle case with partial delay flags (start added, end not added)', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:15:00Z'), // 15 minutes late
        actualEndTime: new Date('2024-01-01T11:25:00Z'), // 25 minutes late
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: true,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.END,
        caseId: 1,
        endLateBy: 25,
        isFirstCase: undefined,
      });
    });

    test('should handle case with partial delay flags (end added, start not added)', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:15:00Z'), // 15 minutes late
        actualEndTime: new Date('2024-01-01T11:25:00Z'), // 25 minutes late
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: true,
      });
      expect(result).toBe(true);
      expect(mockToggleReasonForLateModal).toHaveBeenCalledWith({
        type: CASE_LATE_TYPE.START,
        caseId: 1,
        startLateBy: 15,
        isFirstCase: undefined,
      });
    });
  });

  describe('Return value verification', () => {
    test('should return true when delay modal is triggered', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T09:10:00Z'), // 10 minutes late
        actualEndTime: new Date('2024-01-01T11:00:00Z'), // on time
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(true);
    });

    test('should return false when no delay modal is triggered', () => {
      const caseDetail = createMockCaseDetail({
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        actualStartTime: new Date('2024-01-01T08:55:00Z'), // 5 minutes early
        actualEndTime: new Date('2024-01-01T10:55:00Z'), // 5 minutes early
      });
      const result = checkCaseDelayStatus({
        caseDetail,
        isStartDelayAdded: false,
        isEndDelayAdded: false,
      });
      expect(result).toBe(false);
    });
  });
});
