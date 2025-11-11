import useObservableValue from '@hooks/useObservableValue';
import authState$, {initialAuthState} from '../Observables/authState$';
import {AUTH_STATE} from '../Types/CommonTypes';

function useAuthValue(): AUTH_STATE {
  return useObservableValue(authState$);
}

export default useAuthValue;

export const getAuthValue = () => authState$.getValue();

export const setAuthValue = (authState: AUTH_STATE) => {
  authState$.next(authState);
};
export const updateAuthValue = (authState: Partial<AUTH_STATE>) => {
  authState$.next({...authState$.getValue(), ...authState});
};

export const resetAuthValue = () => setAuthValue(initialAuthState);
