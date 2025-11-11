export type LOGIN_REQUEST = {
  password: string;
  userName: string;
};
export type RECOVER_USERNAME_REQUEST = {
  email: string;
};
export type RECOVER_PASSWORD_REQUEST = {
  email: string;
};
export type RESET_PASSWORD_REQUEST = {
  email: string;
  newPassword: string;
  authRequired?: boolean;
};

export type REFRESH_ACCESS_TOKEN_REQUEST = {
  refreshToken?: string;
  realm?: string;
};

export type VERIFY_OTP_REQUEST = {
  email?: string;
  otp?: string;
};
