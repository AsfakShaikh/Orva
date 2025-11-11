//Not in use
import React, {useState} from 'react';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Strings} from '@locales/Localization';
import CommonAlert from '@components/CommonAlert';
import useDeleteAllTimersMutation from '../Hooks/useDeleteAllTimersMutation';
const ALL_TIMER_DELETE_MODAL_EVENT = 'ALL_TIMER_DELETE_MODAL_EVENT';

interface AllTimersDeleteModalProps {
  caseId?: number;
}

export function toggleAllTimersDeleteModal(td?: AllTimersDeleteModalProps) {
  emitEvent(ALL_TIMER_DELETE_MODAL_EVENT, td);
}

export default function AllTimersDeleteModal() {
  const [visible, setVisible] = useState(false);
  const [timerData, setTimerData] = useState<AllTimersDeleteModalProps>();

  useEventEmitter(
    ALL_TIMER_DELETE_MODAL_EVENT,
    (td?: AllTimersDeleteModalProps) => {
      setVisible(prev => !prev);
      setTimerData(td);
    },
  );

  const {mutate: deleteAllTimersMutate, isPending: isDeletingTimer} =
    useDeleteAllTimersMutation(toggleAllTimersDeleteModal);

  return (
    <CommonAlert
      visible={visible}
      onDismiss={toggleAllTimersDeleteModal}
      heading={Strings.Delete_All_Timers}
      subHeading={Strings.Delete_All_Timer_Subheading}
      headerTextAlign="left"
      buttonsArr={[
        {
          id: '1',
          title: Strings.Delete_All_Timers,
          disabled: isDeletingTimer,
          loading: isDeletingTimer,
          onPress: () => {
            timerData?.caseId &&
              deleteAllTimersMutate({
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
}
