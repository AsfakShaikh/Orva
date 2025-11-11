import {View} from 'react-native';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {globalStyles} from '@styles/GlobalStyles';
import InactivityAlert, {toggleInactivityAlert} from './InactivityAlert';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

const RESET_USER_INACTIVITY_EVENT = 'RESET_USER_INACTIVITY_EVENT';

export function resetUserInactivity() {
  emitEvent(RESET_USER_INACTIVITY_EVENT);
}

const INACTIVITY_TIME = 15 * 60 * 1000; // 15 minutes

type DetectInactivityProps = {
  children: any;
};

const DetectInactivity: FC<DetectInactivityProps> = ({children}) => {
  const {currentActiveCase} = useTrackerValue();

  const [intraction, setIntraction] = useState<boolean>(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout>();

  useEventEmitter(RESET_USER_INACTIVITY_EVENT, () => {
    setIntraction(prev => !prev);
  });

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      console.log('CLEAR DETECT');
      clearTimeout(inactivityTimerRef.current);
    }
    if (!currentActiveCase?.id) {
      console.log('START DETECT');

      inactivityTimerRef.current = setTimeout(
        () => toggleInactivityAlert(),
        INACTIVITY_TIME - 6000,
      );
    }
  }, [currentActiveCase?.id]);

  useEffect(() => {
    resetInactivityTimer();

    return () => {
      console.log('CLEAR DETECT');
      clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer, intraction]);

  const tapGestuure = Gesture.Tap().onStart(resetInactivityTimer).runOnJS(true);

  return (
    <>
      <GestureDetector gesture={tapGestuure}>
        <View style={globalStyles.flex1}>{children}</View>
      </GestureDetector>
      <InactivityAlert resetInactivity={resetInactivityTimer} />
    </>
  );
};

export default DetectInactivity;
