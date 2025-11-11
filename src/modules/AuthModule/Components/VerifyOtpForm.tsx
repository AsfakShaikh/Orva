import React, {FC} from 'react';
import useRecoverPasswordMutation from '../Hooks/useRecoverPasswordMutation';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import scaler from '@utils/Scaler';
import {Strings} from '@locales/Localization';
import Button from '@components/Button';
import Link from '@components/Link';
import {theme} from '@styles/Theme';
import InputOtp from '@components/InputOtp';
import {useForm} from 'react-hook-form';
import useVerifyOTPMutation from '../Hooks/useVerifyOTPMutation';
import Icons from '@assets/Icons';
import {globalStyles} from '@styles/GlobalStyles';
import extractErrorMessage from '@helpers/extractErrorMessage';
const {colors} = theme;

interface VerifyOtpFormProps {
  email?: string;
  onSuccess?: () => void;
}

const VerifyOtpForm: FC<VerifyOtpFormProps> = ({onSuccess, email}) => {
  const {control, watch, reset, handleSubmit} = useForm({
    defaultValues: {otp: ''},
    mode: 'onChange',
  });

  const {mutate: recoverPasswordMutate, isPending: isSendingRequest} =
    useRecoverPasswordMutation(() => {
      reset();
      resetVerifyOtpState();
    });

  const {
    mutate: verifyOtpMutate,
    isPending: isVerifingOtp,
    error: verifyOtpError,
    reset: resetVerifyOtpState,
  } = useVerifyOTPMutation(onSuccess);

  const isSubmitDisable =
    watch('otp')?.length < 4 || isVerifingOtp || isSendingRequest;

  const isOtpExpired = extractErrorMessage(verifyOtpError)?.includes('expired');

  return (
    <View
      style={{
        backgroundColor: colors.onPrimary,
        width: scaler(460),
        borderRadius: scaler(16),
        padding: scaler(32),
        paddingBottom: scaler(8),
      }}>
      <View style={{gap: scaler(16)}}>
        <Text style={styles.heading}>{Strings.Enter_One_Time_Password}</Text>
        <Text style={styles.body}>{Strings.Enter_Otp_Text}</Text>
        <Text style={styles.body}>{Strings.Otp_Note}</Text>
      </View>

      <View style={{marginVertical: scaler(24), gap: scaler(18)}}>
        {verifyOtpError && (
          <View style={globalStyles.rowCenter}>
            <Icons.InfoFill width={scaler(16)} height={scaler(16)} />
            <Text
              style={{
                color: colors.foreground.attention,
                marginLeft: scaler(8),
              }}>
              {isOtpExpired
                ? Strings.Expired_OTP_error
                : Strings.Invalid_OTP_error}
            </Text>
          </View>
        )}

        <InputOtp isError={!!verifyOtpError} control={control} name="otp" />
      </View>

      <Button
        onPress={handleSubmit(val => {
          verifyOtpMutate({email, otp: val?.otp});
        })}
        disabled={isSubmitDisable}
        mode="contained"
        loading={isVerifingOtp}>
        {Strings.Submit}
      </Button>
      <Link
        disabled={isSendingRequest || isVerifingOtp}
        onPress={() => {
          email && recoverPasswordMutate({email});
        }}
        textStyle={styles.link}
        text={Strings.Resend_one_time_password}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: scaler(24),
    fontWeight: '700',
  },
  body: {
    fontSize: scaler(16),
  },
  link: {
    color: colors.foreground.secondary,
    textAlign: 'center',
    fontSize: scaler(16),
  },
});

export default VerifyOtpForm;
