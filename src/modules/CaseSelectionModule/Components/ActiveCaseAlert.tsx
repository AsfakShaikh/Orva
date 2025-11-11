import React, {useState} from 'react';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {useTheme} from 'react-native-paper';
import CommonAlert from '@components/CommonAlert';
import {Strings} from '@locales/Localization';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';

const TOGGLE_ACTIVE_CASE_ALERT_EVENT = 'TOGGLE_ACTIVE_CASE_ALERT_EVENT';

export function toggleActiveCaseAlert() {
  emitEvent(TOGGLE_ACTIVE_CASE_ALERT_EVENT);
}

export default function ActiveCaseAlert() {
  const {colors} = useTheme();
  const {selectedOt} = useAuthValue();
  const [visible, setVisible] = useState(false);

  useEventEmitter(TOGGLE_ACTIVE_CASE_ALERT_EVENT, () => {
    setVisible(prev => !prev);
  });

  return (
    <CommonAlert
      visible={visible}
      onDismiss={() => setVisible(false)}
      headerTextAlign="left"
      heading={`${Strings.Alert}: ${Strings.Another_Case_is_Still_Open}`}
      subHeading={`You are already tracking an active case for MRN ${selectedOt?.mrn}. ${Strings.Please_submit_and_close_your_active_case_for_this_room_before_starting_another_case}`}
      buttonsArr={[
        {
          id: 1,
          title: `"${Strings.Ok}"`,
          textColor: colors.primary,
          onPress: () => setVisible(false),
        },
      ]}
    />
  );
}
