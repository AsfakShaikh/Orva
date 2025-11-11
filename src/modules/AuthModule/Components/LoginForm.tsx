import InputText, {INPUT_TEXT_TYPE} from '@components/InputText';
import {Strings} from '@locales/Localization';
import {AuthStackParamList} from '@navigation/Types/CommonTypes';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {theme} from '@styles/Theme';
import {AUTH_STACK_ROUTE_NAME} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React from 'react';
import {useForm} from 'react-hook-form';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import useLoginMutation from '../Hooks/useLoginMutation';
import Button from '@components/Button';
import Link from '@components/Link';

export default function LoginForm() {
  const {navigate} =
    useNavigation<
      NavigationProp<AuthStackParamList, AUTH_STACK_ROUTE_NAME.LOGIN>
    >();

  const {control, handleSubmit, reset, watch} = useForm({
    defaultValues: {
      userName: '',
      password: '',
    },
  });

  const {mutate: loginMuate, isPending, isError} = useLoginMutation(reset);

  return (
    <>
      {isError && (
        <>
          <Text style={styles.loginErrorHeading}>
            {Strings.Could_not_log_in}
          </Text>
          <Text
            style={{
              textAlign: 'center',
            }}>
            {Strings.Login_Error_Subheading}
          </Text>
        </>
      )}
      <InputText
        name="userName"
        control={control}
        label={Strings.Username}
        style={{marginTop: scaler(24)}}
        isError={isError}
        isLabelDefaultBehaviour={false}
        autoCapitalize="none"
      />
      <Link
        text={Strings.Recover_Username}
        textStyle={styles.recoverText}
        onPress={() => navigate(AUTH_STACK_ROUTE_NAME.RECOVER_USERNAME)}
      />
      <InputText
        style={{marginTop: scaler(20)}}
        name="password"
        control={control}
        label={Strings.Password}
        type={INPUT_TEXT_TYPE.PASSWORD}
        isError={isError}
        isLabelDefaultBehaviour={false}
      />
      <Link
        text={Strings.Reset_Password}
        textStyle={styles.recoverText}
        onPress={() => navigate(AUTH_STACK_ROUTE_NAME.RECOVER_PASSWORD)}
      />
      <Button
        style={{marginTop: scaler(20)}}
        disabled={!watch('userName') || !watch('password') || isPending}
        loading={isPending}
        mode="contained"
        onPress={handleSubmit(val => {
          loginMuate(val);
        })}>
        {Strings.Log_In}
      </Button>
    </>
  );
}

const {colors} = theme;

const styles = StyleSheet.create({
  recoverText: {
    marginVertical: scaler(4),
    fontSize: scaler(16),
    color: colors.foreground.secondary,
    alignSelf: 'flex-end',
  },
  loginErrorHeading: {
    marginTop: scaler(20),
    marginBottom: scaler(4),
    textAlign: 'center',
    fontWeight: '700',
    fontSize: scaler(18),
  },
});
