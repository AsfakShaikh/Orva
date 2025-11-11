import React, {useMemo, useState} from 'react';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Strings} from '@locales/Localization';
import CommonAlert from '@components/CommonAlert';
import useDeleteTimerMutation from '../Hooks/useDeleteTimerMutation';
import {TIMER_TYPE} from '../Types/CommonTypes';
const TIMER_DELETE_MODAL_EVENT = 'TIMER_DELETE_MODAL_EVENT';

interface DeleteTimerModalProps {
  timerId: number;
  caseId: number;
  timerType?: TIMER_TYPE;
}

export function toggleDeleteTimerModal(td?: DeleteTimerModalProps) {
  emitEvent(TIMER_DELETE_MODAL_EVENT, td);
}

const DeleteTimerModal = () => {
  const [visible, setVisible] = useState(false);
  const [timerData, setTimerData] = useState<DeleteTimerModalProps>();

  useEventEmitter(TIMER_DELETE_MODAL_EVENT, (td?: DeleteTimerModalProps) => {
    setVisible(prev => !prev);
    setTimerData(td);
  });

  const {mutate: deleteTimerMutate, isPending: isDeletingTimer} =
    useDeleteTimerMutation(toggleDeleteTimerModal);

  const {heading, subHeading} = useMemo(() => {
    let h = Strings.Delete_Timer;
    let sh = Strings.Delete_Timer_Subheading;

    if (timerData?.timerType === TIMER_TYPE.ALARM) {
      h = Strings.Delete_Alarm;
      sh = Strings.Delete_Alarm_Subheading;
    }

    return {heading: h, subHeading: sh};
  }, [timerData?.timerType]);

  return (
    <CommonAlert
      visible={visible}
      onDismiss={toggleDeleteTimerModal}
      heading={heading}
      subHeading={subHeading}
      headerTextAlign="left"
      buttonsArr={[
        {
          id: '1',
          title: heading,
          disabled: isDeletingTimer,
          loading: isDeletingTimer,
          onPress: () => {
            timerData &&
              deleteTimerMutate({
                timerId: timerData?.timerId,
                caseId: timerData?.caseId,
              });
          },
        },
        {
          id: '2',
          title: Strings.Cancel,
          onPress: () => setVisible(false),
        },
      ]}
    />
  );
};

export default DeleteTimerModal;
