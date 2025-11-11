import useObservableValue from '@hooks/useObservableValue';
import trackerState$, {initialTrackerState} from '../Observables/trackerState$';
import {TRACKER_STATE} from '../Types/CommonTypes';

function useTrackerValue(): TRACKER_STATE {
  return useObservableValue(trackerState$);
}

export default useTrackerValue;

export const getTrackerValue = () => trackerState$.getValue();

export const setTrackerValue = (trackerState: TRACKER_STATE) => {
  trackerState$.next(trackerState);
};

export const updateTrackerValue = (trackerState: Partial<TRACKER_STATE>) => {
  trackerState$.next({...trackerState$.getValue(), ...trackerState});
};

export const resetTrackerValue = () => setTrackerValue(initialTrackerState);

