import NetInfo from '@react-native-community/netinfo';
import {QueryClient, focusManager, onlineManager} from '@tanstack/react-query';
import MmkvStorage from './MmkvStorage';
import {AppState} from 'react-native';
import {enableApiHeaders, onError, onSuccess} from './Axios';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';

// uncommect below to logout user when ever app restarts
// resetAuthValue();

enableApiHeaders();

export const mmkvPersistor = createAsyncStoragePersister({
  storage: MmkvStorage,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
      staleTime: 0,
      retry: 0,
      throwOnError: () => {
        return false;
      },
    },
    mutations: {
      onError: onError,
      onSuccess: onSuccess,
      retry: 0,
    },
  },
});

onlineManager.setEventListener(setOnline => {
  return NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected);
  });
});

focusManager.setEventListener((handleFocus: any) => {
  const listener = AppState.addEventListener('change', handleFocus);
  return () => {
    listener.remove();
  };
});
