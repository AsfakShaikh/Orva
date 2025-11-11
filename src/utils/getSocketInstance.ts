import {getAuthValue} from '@modules/AuthModule/Hooks/useAuthValue';
import Config from 'react-native-config';
import {io} from 'socket.io-client';
import {SOCKET_EVENTS} from './Constants';

export interface QUERY {
  url: string;
  namespace: string;
  hospitalId: string;
  tenantId: string;
  userId: string;
  caseId: string;
  sessionId: string;
}
export const getSocketInstance = (query: QUERY) => {
  const socketInstance = io(`${query.url}${query.namespace}`, {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    autoConnect: true,
    reconnection: true, // Enable reconnection
    extraHeaders: {
      'x-hospital-id': query.hospitalId,
      'x-tenant-id': query.tenantId,
      'x-user-id': query.userId,
      'x-case-id': query.caseId,
      'x-session-id': query.sessionId,
    },
  });

  socketInstance.connect();
  socketInstance.on('connect', () => {
    console.log(`Connected to WebSocket server with headers:
      Namespace: ${query.namespace}
      Hospital ID: ${query.hospitalId}
      Tenant ID: ${query.tenantId}
      User ID: ${query.userId}
      Case ID: ${query.caseId}
      Session ID: ${query.sessionId}`);
  });

  socketInstance.on('disconnect', (reason: string) => {
    console.log(`Disconnected from WebSocket server: ${reason}`);
    if (reason === 'io server disconnect') {
      socketInstance?.connect();
    }
  });

  return socketInstance;
};

export const createSocketQuery = (socketEvent: SOCKET_EVENTS) => {
  const {userId, hospitalId, tenantId, session_state} = getAuthValue();
  return {
    url: Config.API_BASE_URL as any,
    namespace: socketEvent,
    hospitalId: hospitalId ?? '',
    tenantId: tenantId ?? '',
    userId: userId?.toString() ?? '',
    caseId: '',
    sessionId: session_state ?? '',
  };
};

export default getSocketInstance;
