// NOT USED ANYWHERE
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {useState} from 'react';
import {Modal, View, Text, StyleSheet} from 'react-native';

interface CaseModalProps {
  title: string | undefined;
  time: string;
}

const FULL_SCREEN_MODAL_EVENT = 'FULL_SCREEN_MODAL_EVENT';

export const toggleFullScreenModal = (data?: CaseModalProps) => {
  emitEvent(FULL_SCREEN_MODAL_EVENT, data);
};

const FullScrrenModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState<CaseModalProps>();

  const {title, time} = details ?? {};

  useEventEmitter(FULL_SCREEN_MODAL_EVENT, (data?: CaseModalProps) => {
    setVisible(prev => !prev);
    data && setDetails(data);
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.fullScreenModal}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>
    </Modal>
  );
};
const {colors} = theme;

const styles = StyleSheet.create({
  fullScreenModal: {
    backgroundColor: colors.foreground.primary,
    ...globalStyles.colCenter,
  },
  container: {
    ...globalStyles.colCenter,
    alignSelf: 'stretch',
    gap: scaler(40),
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: scaler(98),
    fontSize: scaler(90),
  },
  time: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: scaler(98),
    fontSize: scaler(90),
  },
});

export default FullScrrenModal;
