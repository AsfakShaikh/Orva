import React, { FC, useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@styles/Theme';
import scaler from '@utils/Scaler';

interface CustomAlertProps {
  visible: boolean;
  onClose: () => void;
  message: string;
  timerText: string;
  title: string;
}

const CustomAlert: FC<CustomAlertProps> = ({
  visible,
  onClose,
  message,
  timerText,
  title,
}) => {
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    let countdown: NodeJS.Timeout;

    if (visible) {
      setTimer(5);

      countdown = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(countdown);
            onClose();
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(countdown);
    };
  }, [visible, onClose]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.timerText}>
            {' '}
            {timerText} {timer} seconds...
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.buttonText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { colors } = theme;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000080', // Semi-transparent background
  },
  alertContainer: {
    width: scaler(300),
    padding: scaler(20),
    borderRadius: scaler(15),
    backgroundColor: 'white',
  },
  title: {
    fontSize: scaler(20),
    fontWeight: '500',
    marginBottom: scaler(10),
    color: '#000',
  },
  message: {
    textAlign: 'left',
    marginBottom: scaler(15),
  },
  timerText: {
    textAlign: 'left',
    marginBottom: scaler(20),
    fontWeight: 'bold',
    color: '#000',
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  buttonText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default CustomAlert;
