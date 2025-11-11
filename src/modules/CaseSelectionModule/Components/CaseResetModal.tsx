import React, {useState} from 'react';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {useTheme} from 'react-native-paper';
import scaler from '@utils/Scaler';
import {Strings} from '@locales/Localization';
import Icons from '@assets/Icons';
import CommonAlert from '@components/CommonAlert';
import useResetCaseMutation from '../Hooks/useResetCaseMutation';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';

const TOGGLE_CASE_RESET_MODAL_EVENT = 'TOGGLE_CASE_RESET_MODAL_EVENT';

type CaseResetModalProps = number | null;

export function toggleCaseResetModal(_caseId?: CaseResetModalProps) {
  emitEvent(TOGGLE_CASE_RESET_MODAL_EVENT, _caseId);
}

export default function CaseResetModal() {
  const {colors} = useTheme();
  const {selectedOt} = useAuthValue();
  const [visible, setVisible] = useState(false);
  const [caseId, setCaseId] = useState<CaseResetModalProps>(null);

  const handleClose = () => {
    setVisible(false);
    setCaseId(null);
  };

  const {mutate: resetCaseMutate, isPending: isResetingCase} =
    useResetCaseMutation(handleClose);

  useEventEmitter(
    TOGGLE_CASE_RESET_MODAL_EVENT,
    (_caseId?: CaseResetModalProps) => {
      setVisible(prev => !prev);
      setCaseId(_caseId ?? null);
    },
  );

  const onResetCase = () => {
    if (!caseId || !selectedOt?.uuid) {
      return;
    }
    const reason = 'OTHER';
    resetCaseMutate({
      caseId,
      otId: selectedOt?.uuid,
      reason: reason,
      customReason: reason,
    });
  };

  return (
    <CommonAlert
      visible={visible}
      onDismiss={handleClose}
      backdropBg={colors?.backdrop}
      icon={
        <Icons.Info
          width={scaler(24)}
          height={scaler(24)}
          stroke={colors.error}
        />
      }
      heading={Strings.Case_Reset_Heading}
      subHeading={Strings.Case_Reset_Subheading}
      buttonsArr={[
        {
          id: '1',
          title: Strings.Cancel_and_go_back,
          textColor: colors.primary,
          disabled: isResetingCase,
          onPress: handleClose,
        },
        {
          id: '2',
          title: Strings.Reset_Case,
          textColor: colors.primary,
          disabled: isResetingCase,
          onPress: onResetCase,
        },
      ]}
    />
  );
}
