import {useEffect, useRef} from 'react';
import {DeviceEventEmitter} from 'react-native';

export default function useEventEmitter(
  event: string,
  onEvent: (data: any) => void,
) {
  const eventRef = useRef(event);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    const subscribe = DeviceEventEmitter.addListener(
      eventRef.current,
      onEventRef.current,
    );

    return () => {
      subscribe.remove();
    };
  }, []);
}

export const emitEvent = (event: string, ...params: any[]) => {
  DeviceEventEmitter.emit(event, ...params);
};
