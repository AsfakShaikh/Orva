import {useEffect, useState} from 'react';
import {Keyboard, KeyboardEvent} from 'react-native';

interface KeyboardState {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

const initialKeyboardState: KeyboardState = {
  isKeyboardVisible: false,
  keyboardHeight: 0,
};

export const useKeyboard = (): KeyboardState => {
  const [keyboardState, setKeyboardState] =
    useState<KeyboardState>(initialKeyboardState);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event: KeyboardEvent) => {
        setKeyboardState({
          isKeyboardVisible: true,
          keyboardHeight: event.endCoordinates.height,
        });
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardState({
          isKeyboardVisible: false,
          keyboardHeight: 0,
        });
      },
    );

    // For iOS
    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      (event: KeyboardEvent) => {
        setKeyboardState({
          isKeyboardVisible: true,
          keyboardHeight: event.endCoordinates.height,
        });
      },
    );

    // For iOS
    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => {
        setKeyboardState({
          isKeyboardVisible: false,
          keyboardHeight: 0,
        });
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  return keyboardState;
};

export default useKeyboard;
