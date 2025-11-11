import React, { useState } from 'react';
import useEventEmitter, { emitEvent } from '@hooks/useEventEmitter';
import { Strings } from '@locales/Localization';
import CommonAlert from '@components/CommonAlert';
import { BottomSnackbarHandler } from '@components/BottomSnackbar';
import Icons from '@assets/Icons';

const DELETE_DOCUMENTATION_MODAL_EVENT = 'DELETE_DOCUMENTATION_MODAL_EVENT';

type DeleteDocumentationModalProps = {
  documentationId: number;
};

export function toggleDeleteDocumentationModal(
  documentationPropData?: DeleteDocumentationModalProps,
) {
  emitEvent(DELETE_DOCUMENTATION_MODAL_EVENT, documentationPropData);
}

const DeleteDocumentationModal = () => {
  const [visible, setVisible] = useState(false);
  const [documentationData, setDocumentationData] =
    useState<DeleteDocumentationModalProps>();

  useEventEmitter(
    DELETE_DOCUMENTATION_MODAL_EVENT,
    (documentationPropData?: DeleteDocumentationModalProps) => {
      setVisible(prev => !prev);
      setDocumentationData(documentationPropData);
    },
  );

  return (
    <CommonAlert
      visible={visible}
      onDismiss={toggleDeleteDocumentationModal}
      heading={Strings.Removing_Data_Field}
      subHeading={Strings.Removing_Data_Field_Subheading}
      headerTextAlign="left"
      backdropBg="#00000066"
      spaceBetweenBtn={true}
      buttonsArr={[
        {
          id: '1',
          title: Strings.Cancel,
          style: { display: 'flex', justifyContent: 'space-between' },
          onPress: () => toggleDeleteDocumentationModal(),
        },
        {
          id: '2',
          title: Strings.Remove,
          onPress: () => {
            BottomSnackbarHandler.successToast({ title: "Documentation is updated and synced!", rightIcon: Icons.Check, })
            documentationData && toggleDeleteDocumentationModal();
          },
        },
      ]}
    />
  );
};

export default DeleteDocumentationModal;
