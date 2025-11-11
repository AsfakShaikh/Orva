import MmkvStorage from '@utils/MmkvStorage';
import {BehaviorSubject} from 'rxjs';
import {AUTH_STATE} from '../Types/CommonTypes';

export const initialAuthState: AUTH_STATE = {
  isLoggedIn: false,
  tenantId: undefined,
  hospitalId: undefined,
  userId: undefined,
  firstName: undefined,
  LastName: undefined,
  hospitalTimeZone: undefined,
  access_token: undefined,
  refresh_token: undefined,
  expires_in: undefined,
  refresh_expires_in: undefined,
  selectedOt: undefined,
  selectedOtsArr: [],
  user: undefined,
  session_state: undefined,
};

const authState$ = new BehaviorSubject<AUTH_STATE>(initialAuthState);
MmkvStorage.init('authState', authState$);

export default authState$;
