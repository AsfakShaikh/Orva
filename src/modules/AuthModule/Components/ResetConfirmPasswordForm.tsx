// Not using right now

import Button from '@components/Button';
import InputText, {INPUT_TEXT_TYPE} from '@components/InputText';
import {getConfirmPasswordValidationRules} from '@helpers/formValidationRules';
import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import React from 'react';
import {useForm} from 'react-hook-form';
import {Text} from 'react-native-paper';
import useResetPasswordMutation from '../Hooks/useResetPasswordMutation';
import {AuthStackParamList} from '@navigation/Types/CommonTypes';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {AUTH_STACK_ROUTE_NAME} from '@utils/Constants';
import {globalStyles} from '@styles/GlobalStyles';

type ResetConfirmPasswordFormProps = {
  userName?: string;
};

export default function ResetConfirmPasswordForm(
  Props: ResetConfirmPasswordFormProps,
) {
  const {userName} = Props;

  const {goBack} =
    useNavigation<
      NavigationProp<AuthStackParamList, AUTH_STACK_ROUTE_NAME.RECOVER_PASSWORD>
    >();

  const {control, handleSubmit, watch} = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    mutate: resetPasswordMutate,
    isPending,
    isSuccess,
  } = useResetPasswordMutation();

  return isSuccess ? (
    <>
      <Text style={globalStyles.recoverHeading}>
        {Strings.Password_Reset_Request_Submitted}
      </Text>
      <Text
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          textAlign: 'center',
        }}>
        {Strings.Password_Reset_Request_Submitted_Desc}
      </Text>
      <Button style={{marginTop: scaler(24)}} mode="text" onPress={goBack}>
        {Strings.Back_to_Login}
      </Button>
    </>
  ) : (
    <>
      <Text style={globalStyles.recoverHeading}>{Strings.Reset_Password}</Text>
      <Text
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          textAlign: 'center',
        }}>
        {Strings.Recover_Confirm_Password_Subheading}
      </Text>
      <InputText
        style={{marginTop: scaler(18)}}
        name="newPassword"
        control={control}
        label={Strings.Enter_Password}
        type={INPUT_TEXT_TYPE.PASSWORD}
        isLabelDefaultBehaviour={false}
        rules={{
          minLength: {
            value: 8,
            message: Strings.New_Password_Min_Length,
          },
        }}
      />
      <InputText
        style={{marginTop: scaler(18)}}
        name="confirmPassword"
        control={control}
        label={Strings.Confirm_Password}
        type={INPUT_TEXT_TYPE.PASSWORD}
        isLabelDefaultBehaviour={false}
        rules={getConfirmPasswordValidationRules(watch('newPassword'))}
      />
      <Button
        style={{marginTop: scaler(24)}}
        disabled={
          !watch('newPassword') || !watch('confirmPassword') || isPending
        }
        loading={isPending}
        mode="contained"
        onPress={handleSubmit(val => {
          userName &&
            resetPasswordMutate({
              email: userName,
              newPassword: val?.newPassword,
            });
        })}>
        {Strings.Submit}
      </Button>
      <Button
        style={{marginTop: scaler(24)}}
        disabled={isPending}
        onPress={goBack}>
        {Strings.Cancel_and_go_back}
      </Button>
    </>
  );
}
