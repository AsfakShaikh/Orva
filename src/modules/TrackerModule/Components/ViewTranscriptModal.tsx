import SideModalDrawer, {
  SideModalDrawerBody,
} from '@components/SideModalDrawer';
import useEventEmitter, { emitEvent } from '@hooks/useEventEmitter';
import { Strings } from '@locales/Localization';
import scaler from '@utils/Scaler';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';

const VIEW_TRANSCRIPT_MODAL_EVENT = 'VIEW_TRANSCRIPT_MODAL_EVENT';

interface ViewTranscriptModalProps {
  text?: string;
}

export const toggleViewTranscriptModal = (
  data?: ViewTranscriptModalProps,
) => {
  emitEvent(VIEW_TRANSCRIPT_MODAL_EVENT, data);
};

const ViewTranscriptModal = () => {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<ViewTranscriptModalProps>();

  const onClose = useCallback(() => {
    setVisible(false);
  }, []);

  useEventEmitter(
    VIEW_TRANSCRIPT_MODAL_EVENT,
    (data?: ViewTranscriptModalProps) => {
      setVisible(prev => !prev);
      setDetail(data);
    },
  );

  return (
    <SideModalDrawer
      title={Strings.Voice_Note}
      visible={visible}
      onClose={onClose}>
      <SideModalDrawerBody>
        <View style={{ gap: scaler(24) }}>
          <TextInput
            mode="outlined"
            multiline
            value={detail?.text}
            style=
            {{
              backgroundColor: 'transparent',
              height: scaler(162),
              marginTop: scaler(6),
              opacity: 1, 
            }}

            label={Strings.Voice_Note_Text}
            editable={false}
          />
        </View>
      </SideModalDrawerBody>
    </SideModalDrawer>
  );
};

export default ViewTranscriptModal;
