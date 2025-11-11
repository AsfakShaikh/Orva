import { StyleSheet, Text } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import useEventEmitter, { emitEvent } from '@hooks/useEventEmitter';
import { Dialog, Portal } from 'react-native-paper';
import Button from '@components/Button';
import { Strings } from '@locales/Localization';
import { appReset } from '../Hooks/useLogoutMutation';
import { theme } from '@styles/Theme';
import scaler from '@utils/Scaler';

const CONNECTIVITY_TIMEOUT_ALERT_EVENT = 'CONNECTIVITY_TIMEOUT_ALERT_EVENT';

export const toggleConnectivityTimeoutAlert = () => {
  emitEvent(CONNECTIVITY_TIMEOUT_ALERT_EVENT);
};

const ConnectivityTimeoutAlert = () => {
  const [visible, setVisible] = useState(true);
  const [timer, setTimer] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEventEmitter(CONNECTIVITY_TIMEOUT_ALERT_EVENT, () => {
    setVisible(prev => !prev);
    setTimer(5);
  });

  useEffect(() => {
    if (visible) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [visible]);

  useEffect(() => {
    if (timer === 0) {
      clearInterval(intervalRef.current);
      appReset();
      setVisible(prev => !prev);
    }
  }, [timer]);

  return (
    <Portal>
      <Dialog visible={visible} style={styles.containerStyle}>
        <Dialog.Title style={styles.titleStyle}>
          {Strings.Connectivity_Alert_Title}
        </Dialog.Title>
        <Dialog.Content>
          <Text style={styles.messageStyle}>
            {Strings.Session_Timeout_Alert_Desc}
          </Text>
          <Text style={styles.timerTextStyle}>
            {`${Strings.Connectivity_Timeout_Timer_Text} ${timer} ${Strings.Seconds}...`}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button disabled={false} onPress={() => {
            clearInterval(intervalRef.current);
            appReset();
            setVisible(prev => !prev);
          }}>{Strings.Log_out_now}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
const {colors} = theme;

const styles = StyleSheet.create({
  containerStyle: {
    width: scaler(324),
    alignSelf: 'center',
  },
  titleStyle: {
    fontSize: scaler(24),
  },
  messageStyle: {
    textAlign: 'left',
    marginBottom: scaler(15),
    fontSize: scaler(14),
  },
  timerTextStyle: {
    textAlign: 'left',
    fontWeight: 'bold',
    color: colors.onSurfaceVariant,
    fontSize: scaler(14),
  },
});
export default ConnectivityTimeoutAlert;
