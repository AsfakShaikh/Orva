import useObservableValue from '@hooks/useObservableValue';
import systemState$, {initialSystemState} from '../Observables/systemState$';
import {SYSTEM_STATE} from '../Types/CommonTypes';

function useSystemValues(): SYSTEM_STATE {
  return useObservableValue(systemState$);
}

export default useSystemValues;

export const getSystemValue = () => systemState$.getValue();

export const setSystemValue = (systemState: SYSTEM_STATE) => {
  systemState$.next(systemState);
};

export const updateSystemValue = (systemState: Partial<SYSTEM_STATE>) => {
  systemState$.next({...systemState$.getValue(), ...systemState});
};

export const resetSystemValue = () => setSystemValue(initialSystemState);
