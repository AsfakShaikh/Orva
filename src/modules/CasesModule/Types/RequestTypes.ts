export type EDIT_TIMER_LABEL_REQUEST = {
  caseId: number;
  timerId: number;
  timerData: {
    description: string;
  };
};
