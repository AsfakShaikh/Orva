import {View, ImageBackground, StyleSheet} from 'react-native';
import React, {useState} from 'react';
import Images from '@assets/Images';
import Container from '@components/Container';
import {globalStyles} from '@styles/GlobalStyles';
import ResetPasswordForm from '@modules/AuthModule/Components/ResetPasswordForm';
import VerifyOtpForm from '@modules/AuthModule/Components/VerifyOtpForm';
import ResetAccountPasswordForm from '@modules/AuthModule/Components/ResetAccountPasswordForm';
import {Text} from 'react-native-paper';
import {Strings} from '@locales/Localization';
import Link from '@components/Link';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AuthStackParamList} from '@navigation/Types/CommonTypes';
import {AUTH_STACK_ROUTE_NAME} from '@utils/Constants';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';

const {colors} = theme;

export default function RecoverPasswordScreen() {
  const {goBack} =
    useNavigation<
      NavigationProp<AuthStackParamList, AUTH_STACK_ROUTE_NAME.RECOVER_PASSWORD>
    >();
  const [email, setEmail] = useState<string>();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [completeType, setCompleteType] = useState<string>();

  const isSuccess = completeType === 'SUCCESS';

  function renderForm() {
    if (!isOtpSent) {
      return (
        <ResetPasswordForm
          onSuccess={val => {
            setEmail(val);
            setIsOtpSent(true);
            HeaderSnackbarHandler.successToast(
              Strings.One_time_password_sent,
              Strings.Check_the_inbox_associated_with_your_account,
            );
          }}
        />
      );
    }
    if (!isOtpVerified) {
      return (
        <VerifyOtpForm email={email} onSuccess={() => setIsOtpVerified(true)} />
      );
    }

    if (completeType) {
      return (
        <View style={styles.successContainer}>
          <Text style={styles.heading}>
            {isSuccess
              ? Strings.Password_Change_Success_Heading
              : Strings.Password_Change_Error_Heading}
          </Text>
          <Text style={styles.body}>
            {isSuccess
              ? Strings.Password_Change_Success_Desc
              : Strings.Password_Change_Error_Desc}
          </Text>
          <Link
            onPress={goBack}
            textStyle={styles.link}
            text={Strings.Back_to_Login}
          />
        </View>
      );
    }

    return (
      <ResetAccountPasswordForm
        email={email}
        onSuccess={() => setCompleteType('SUCCESS')}
        onError={() => setCompleteType('ERROR')}
      />
    );
  }

  return (
    <ImageBackground
      source={Images.LoginBg}
      resizeMode="cover"
      style={{flex: 1}}>
      <Container backgroundColor="transparent">
        <View style={globalStyles.colCenter}>{renderForm()}</View>
      </Container>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    backgroundColor: colors.onPrimary,
    width: scaler(460),
    borderRadius: scaler(16),
    padding: scaler(32),
    paddingBottom: scaler(8),
  },
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
    fontSize: scaler(16),
  },
});
