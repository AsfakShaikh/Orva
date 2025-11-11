import LoginForm from '@modules/AuthModule/Components/LoginForm';
import React from 'react';
import LoginFromWraper from '@modules/AuthModule/Components/LoginFromWraper';

export default function LoginScreen() {
  return (
    <LoginFromWraper>
      <LoginForm />
    </LoginFromWraper>
  );
}
