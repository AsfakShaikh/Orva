export type LOGIN_RESPONSE = {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
  tenantId: string;
  hospitalId: string;
  realm: string;
  firstName: string;
  LastName: string;
  userId: number;
};
export type RECOVER_USERNAME_RESPONSE = {
  message: string;
};
export type RECOVER_PASSWORD_RESPONSE = {
  message: string;
};

export type REFRESH_ACCESS_TOKEN_RESPONSE = {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
};
