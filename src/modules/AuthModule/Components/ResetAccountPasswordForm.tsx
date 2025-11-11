import Button from '@components/Button';
import InputText from '@components/InputText';
import {
  getConfirmPasswordValidationRules,
  getPasswordValidationRules,
} from '@helpers/formValidationRules';
import {Strings} from '@locales/Localization';
import {theme} from '@styles/Theme';
import {passwordRequirements} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React, {FC} from 'react';
import {useForm} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import useResetPasswordMutation from '../Hooks/useResetPasswordMutation';
const {colors} = theme;

interface ResetAccountPasswordFormProps {
  email?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

const ResetAccountPasswordForm: FC<ResetAccountPasswordFormProps> = ({
  email,
  onSuccess,
  onError,
}) => {
  const {control, watch, handleSubmit} = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const isDisabled = !watch('newPassword') || !watch('confirmPassword');

  const {mutate: resetPasswordMutate, isPending: isResettingPassword} =
    useResetPasswordMutation();

  return (
    <View
      style={{
        backgroundColor: colors.onPrimary,
        width: scaler(460),
        borderRadius: scaler(16),
        padding: scaler(32),
      }}>
      <View style={{gap: scaler(24)}}>
        <View>
          <Text style={styles.heading}>
            {Strings.Reset_Your_Account_Password}
          </Text>

          <Text style={styles.body}>{Strings.Password_Req_Heading}</Text>
          {passwordRequirements?.map(item => (
            <View
              key={item}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={styles.blackDot} />
              <Text>{item}</Text>
            </View>
          ))}
        </View>

        <View style={{gap: scaler(16)}}>
          <InputText
            type="PASSWORD"
            control={control}
            name="newPassword"
            label={Strings.Enter_Password}
            rules={getPasswordValidationRules()}
          />
          <InputText
            type="PASSWORD"
            control={control}
            name="confirmPassword"
            label={Strings.Confirm_Password}
            rules={getConfirmPasswordValidationRules(watch('newPassword'))}
          />
        </View>

        <Button
          onPress={handleSubmit(val => {
            email &&
              resetPasswordMutate(
                {
                  email,
                  newPassword: val?.confirmPassword,
                },
                {onSuccess: onSuccess, onError: onError},
              );
          })}
          disabled={isDisabled || isResettingPassword}
          loading={isResettingPassword}
          mode="contained">
          {Strings.Submit}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: scaler(24),
    fontWeight: '700',
    marginBottom: scaler(16),
  },
  body: {
    fontSize: scaler(16),
  },
  link: {
    color: colors.foreground.secondary,
    textAlign: 'center',
    fontSize: scaler(12),
  },
  blackDot: {
    width: scaler(4),
    height: scaler(4),
    borderRadius: scaler(4),
    backgroundColor: '#000',
    marginHorizontal: scaler(6),
  },
});

export default ResetAccountPasswordForm;
