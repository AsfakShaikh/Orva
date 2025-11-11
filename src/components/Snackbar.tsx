import useEventEmitter, { emitEvent } from '@hooks/useEventEmitter';
import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { Button, Snackbar as PaperSnackbar } from 'react-native-paper';
import { SNACKBAR_TYPE } from '@utils/Types';
import { $RemoveChildren } from 'react-native-paper/lib/typescript/types';

const SHOW_SNACKBAR_EVENT = 'SHOW_SNACKBAR_EVENT';

type SnackbarOptionsProps = {
  type?: SNACKBAR_TYPE;
  action?: $RemoveChildren<typeof Button> & { label: string };
  duration?: number;
};

function createSnackbarHandler() {
  const errorToast = (text: string, options?: SnackbarOptionsProps) => {
    Keyboard.dismiss();
    emitEvent(SHOW_SNACKBAR_EVENT, {
      text,
      options: { type: SNACKBAR_TYPE.ERROR, ...options },
    });
  };
  const successToast = (text: string, options?: SnackbarOptionsProps) => {
    Keyboard.dismiss();
    emitEvent(SHOW_SNACKBAR_EVENT, {
      text,
      options: { type: SNACKBAR_TYPE.SUCCESS, ...options },
    });
  };
  const normalToast = (text: string, options?: SnackbarOptionsProps) => {
    Keyboard.dismiss();
    emitEvent(SHOW_SNACKBAR_EVENT, {
      text,
      options: { type: SNACKBAR_TYPE.NORMAL, ...options },
    });
  };

  return { errorToast, successToast, normalToast };
}

const SnackbarHandler = createSnackbarHandler();
export { SnackbarHandler };

export default function Snackbar() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [barOptions, setBarOptions] = useState<SnackbarOptionsProps>({});

  useEventEmitter(
    SHOW_SNACKBAR_EVENT,
    ({ text, options }: { text: string; options?: any }) => {
      setVisible(true);
      setMessage(text);
      setBarOptions(options);
    },
  );

  const { type, action, duration = 3000 } = barOptions;

  const backgroundColor = type === SNACKBAR_TYPE.ERROR ? '#DB4848' : '#65B741';

  return (
    <PaperSnackbar
      visible={visible}
      onDismiss={() => setVisible(false)}
      duration={duration}
      style={{ backgroundColor: backgroundColor, position: 'absolute' }}
      action={action}
      icon="close"
      onIconPress={() => { }}>
      {message}
    </PaperSnackbar>
  );
}
