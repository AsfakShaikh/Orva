import {StyleSheet, Text} from 'react-native';
import React, {FC, useEffect, useRef, useState} from 'react';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Dialog, Portal} from 'react-native-paper';
import Button from '@components/Button';
import useLogoutMutation from '../Hooks/useLogoutMutation';
import {Strings} from '@locales/Localization';

const INACTIVITY_ALERT_EVENT = 'INACTIVITY_ALERT_EVENT';

export const toggleInactivityAlert = () => {
  emitEvent(INACTIVITY_ALERT_EVENT);
};

type InactivityAlertProps = {
  resetInactivity: () => void;
};

const InactivityAlert: FC<InactivityAlertProps> = ({resetInactivity}) => {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEventEmitter(INACTIVITY_ALERT_EVENT, () => {
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

  const {mutate: logoutMutate, isPending: isLoggingOut} = useLogoutMutation(
    toggleInactivityAlert,
  );

  useEffect(() => {
    if (timer === 0) {
      clearInterval(intervalRef.current);
      logoutMutate();
    }
  }, [logoutMutate, timer]);

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={() => {
          !isLoggingOut && toggleInactivityAlert();
        }}
        style={styles.container}>
        <Dialog.Title style={styles.title}>
          {Strings.Inactivity_Alert_Title}
        </Dialog.Title>
        <Dialog.Content>
          <Text style={styles.message}>{Strings.Inactivity_Alert_Desc}</Text>
          <Text style={styles.timerText}>
            {`${Strings.Inactivity_Timer_Text} ${timer} ${Strings.Seconds}...`}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            loading={isLoggingOut}
            disabled={isLoggingOut}
            onPress={() => logoutMutate()}>
            {Strings.Log_out_now}
          </Button>
          <Button
            disabled={isLoggingOut}
            onPress={() => {
              resetInactivity();
              toggleInactivityAlert();
            }}>
            {Strings.Stay_logged_in}
          </Button>
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

export default InactivityAlert;
