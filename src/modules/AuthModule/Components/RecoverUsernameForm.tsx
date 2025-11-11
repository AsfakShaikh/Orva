import Button from '@components/Button';
import InputText from '@components/InputText';
import {getEmailValidationRules} from '@helpers/formValidationRules';
import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import React from 'react';
import {useForm} from 'react-hook-form';
import {Text} from 'react-native-paper';
import useRecoverUsernameMutation from '../Hooks/useRecoverUsernameMutation';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AuthStackParamList} from '@navigation/Types/CommonTypes';
import {AUTH_STACK_ROUTE_NAME} from '@utils/Constants';
import {globalStyles} from '@styles/GlobalStyles';

export default function RecoverUsernameForm() {
  const {goBack} =
    useNavigation<
      NavigationProp<AuthStackParamList, AUTH_STACK_ROUTE_NAME.RECOVER_USERNAME>
    >();
  const {control, handleSubmit, reset, watch} = useForm({
    defaultValues: {
      email: '',
    },
  });

  const {
    mutate: recoverUsernameMutate,
    isPending,
    isSuccess,
  } = useRecoverUsernameMutation(reset);

  return isSuccess ? (
    <>
      <Text style={globalStyles.recoverHeading}>
        {Strings.Recovery_Request_Submitted}
      </Text>
      <Text
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          textAlign: 'center',
        }}>
        {Strings.Recovery_Request_Submitted_Desc}
      </Text>
      <Button style={{marginTop: scaler(24)}} mode="text" onPress={goBack}>
        {Strings.Back_to_Login}
      </Button>
    </>
  ) : (
    <>
      <Text style={globalStyles.recoverHeading}>
        {Strings.Recover_Username}
      </Text>
      <Text
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          textAlign: 'center',
        }}>
        {Strings.Recover_Username_Subheading}
      </Text>
      <InputText
        style={{marginTop: scaler(18)}}
        name="email"
        control={control}
        label={Strings.Email_Address}
        rules={getEmailValidationRules()}
        isLabelDefaultBehaviour={false}
        autoCapitalize="none"
      />
      <Button
        style={{marginTop: scaler(24)}}
        disabled={!watch('email') || isPending}
        loading={isPending}
        mode="contained"
        onPress={handleSubmit(val => {
          recoverUsernameMutate(val);
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
