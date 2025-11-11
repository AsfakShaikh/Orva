import React, {useState} from 'react';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {useTheme} from 'react-native-paper';
import scaler from '@utils/Scaler';
import {Strings} from '@locales/Localization';
import Icons from '@assets/Icons';
import CommonAlert from '@components/CommonAlert';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import useDeleteCaseMutation from '../Hooks/useDeleteCaseMutation';

const TOGGLE_CASE_DELETE_MODAL_EVENT = 'TOGGLE_CASE_DELETE_MODAL_EVENT';

type CaseDeleteModalProps = number | null;

export function toggleCaseDeleteModal(_caseId?: CaseDeleteModalProps) {
  emitEvent(TOGGLE_CASE_DELETE_MODAL_EVENT, _caseId);
}

export default function CaseDeleteModal() {
  const {colors} = useTheme();
  const {selectedOt} = useAuthValue();

  const [visible, setVisible] = useState(false);
  const [caseId, setCaseId] = useState<CaseDeleteModalProps>(null);

  const handleClose = () => {
    setVisible(false);
    setCaseId(null);
  };

  const {mutate: deleteCaseMutate, isPending: isDeletingCase} =
    useDeleteCaseMutation(handleClose);

  useEventEmitter(
    TOGGLE_CASE_DELETE_MODAL_EVENT,
    (_caseId?: CaseDeleteModalProps) => {
      setVisible(prev => !prev);
      setCaseId(_caseId ?? null);
    },
  );
  return (
    <CommonAlert
      visible={visible}
      onDismiss={handleClose}
      icon={
        <Icons.Info
          width={scaler(24)}
          height={scaler(24)}
          stroke={colors.error}
        />
      }
      heading={Strings.Case_Delete_Heading}
      subHeading={Strings.Case_Delete_Subheading}
      buttonsArr={[
        {
          id: '1',
          title: Strings.Cancel_and_go_back,
          textColor: colors.primary,
          disabled: isDeletingCase,
          onPress: handleClose,
        },
        {
          id: '2',
          title: Strings.Delete_Case,
          textColor: colors.primary,
          disabled: isDeletingCase,
          onPress: () =>
            caseId &&
            selectedOt?.uuid &&
            deleteCaseMutate({id: caseId, otId: selectedOt?.uuid}),
        },
      ]}
    />
  );
}
