import MmkvStorage from '@utils/MmkvStorage';
import {BehaviorSubject} from 'rxjs';
import {SYSTEM_STATE} from '../Types/CommonTypes';

export const initialSystemState: SYSTEM_STATE = {
  connectedDevice: undefined,
  currentDevice: undefined,
};

const systemState$ = new BehaviorSubject<SYSTEM_STATE>(initialSystemState);
MmkvStorage.init('systemState', systemState$);

export default systemState$;
