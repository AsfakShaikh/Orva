import {useEffect, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';

const useInternetState = () => {
  const [isInternetConnected, setIsInternetConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsInternetConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  return {isInternetConnected};
};

export default useInternetState;
