import {StyleSheet, Text} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Dialog, Portal} from 'react-native-paper';
import Button from '@components/Button';
import {Strings} from '@locales/Localization';
import {appReset} from '../Hooks/useLogoutMutation';

const SESSION_TIMEOUT_ALERT_EVENT = 'SESSION_TIMEOUT_ALERT_EVENT';

export const toggleSessionTimeoutAlert = () => {
  emitEvent(SESSION_TIMEOUT_ALERT_EVENT);
};

const SessionTimeoutAlert = () => {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEventEmitter(SESSION_TIMEOUT_ALERT_EVENT, () => {
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
    }
  }, [timer]);

  return (
    <Portal>
      <Dialog visible={visible} style={styles.container}>
        <Dialog.Title style={styles.title}>
          {Strings.Inactivity_Alert_Title}
        </Dialog.Title>
        <Dialog.Content>
          <Text style={styles.message}>
            {Strings.Session_Timeout_Alert_Desc}
          </Text>
          <Text style={styles.timerText}>
            {`${Strings.Session_Timeout_Timer_Text} ${timer} ${Strings.Seconds}...`}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => appReset()}>{Strings.Log_out_now}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const {colors} = theme;

const styles = StyleSheet.create({
  container: {
    width: scaler(324),
    alignSelf: 'center',
  },
  title: {
    fontSize: scaler(24),
  },
  message: {
    textAlign: 'left',
    marginBottom: scaler(15),
    fontSize: scaler(14),
  },
  timerText: {
    textAlign: 'left',
    fontWeight: 'bold',
    color: colors.onSurfaceVariant,
    fontSize: scaler(14),
  },
});

export default SessionTimeoutAlert;
