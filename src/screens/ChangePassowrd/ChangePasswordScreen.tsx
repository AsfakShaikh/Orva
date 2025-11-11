import Body from '@components/Body';
import Button from '@components/Button';
import Container from '@components/Container';
import InputText, {INPUT_TEXT_TYPE} from '@components/InputText';
import {
  getConfirmPasswordValidationRules,
  getPasswordValidationRules,
} from '@helpers/formValidationRules';
import {Strings} from '@locales/Localization';
import useGetUserConfigQuery from '@modules/AuthModule/Hooks/useGetUserConfigQuery';
import useResetPasswordMutation from '@modules/AuthModule/Hooks/useResetPasswordMutation';
import {AccountSettingStackParamList} from '@navigation/Types/CommonTypes';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import {
  ACCOUNT_SETTING_STACK_ROUTE_NAME,
  passwordRequirements,
} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React from 'react';
import {useForm} from 'react-hook-form';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {colors} = theme;

const ChangePasswordScreen = () => {
  const {goBack} =
    useNavigation<
      NavigationProp<
        AccountSettingStackParamList,
        ACCOUNT_SETTING_STACK_ROUTE_NAME.CHANGE_PASSWORD
      >
    >();

  const {control, watch, handleSubmit, reset} = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const isDisabled = !watch('newPassword') || !watch('confirmPassword');

  const {data: userConfig} = useGetUserConfigQuery();

  const {mutate: resetPasswordMutate, isPending: isResettingPassword} =
    useResetPasswordMutation(() => {
      reset();
    });

  return (
    <Container>
      <View
        style={[
          globalStyles.flex1,
          {
            paddingHorizontal: scaler(16),
          },
        ]}>
        <View style={styles.headerContainer}>
          <Pressable style={{paddingHorizontal: scaler(16)}} onPress={goBack}>
            <Ionicons
              name="chevron-back"
              size={scaler(30)}
              color={colors?.foreground.secondary}
            />
          </Pressable>
          <Text style={styles.heading}>{Strings.Account_Settings}</Text>
          <Button
            onPress={handleSubmit(val => {
              userConfig?.email &&
                resetPasswordMutate({
                  email: userConfig?.email,
                  newPassword: val?.confirmPassword,
                  authRequired: true,
                });
            })}
            disabled={isDisabled || isResettingPassword}
            loading={isResettingPassword}
            mode="contained">
            {Strings.Save_Password}
          </Button>
        </View>

        <Body>
          <View style={styles.mainContainer}>
            <Text style={styles.subheading}>{Strings.Change_Password}</Text>

            <View style={{gap: scaler(24)}}>
              <View>
                <Text>{Strings.Password_Req_Heading}</Text>
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

              <InputText
                type={INPUT_TEXT_TYPE.PASSWORD}
                control={control}
                name="newPassword"
                label={Strings.New_Password}
                rules={getPasswordValidationRules()}
              />
              <InputText
                type={INPUT_TEXT_TYPE.PASSWORD}
                control={control}
                name="confirmPassword"
                label={Strings.Re_Enter_Password}
                rules={getConfirmPasswordValidationRules(watch('newPassword'))}
              />
            </View>
          </View>
        </Body>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  mainContainer: {
    width: scaler(400),
    paddingHorizontal: scaler(24),
    paddingVertical: scaler(20),
  },
  heading: {
    flex: 1,
    fontSize: scaler(32),
    paddingVertical: scaler(20),
    fontWeight: '700',
  },
  subheading: {
    fontSize: scaler(18),
    fontWeight: '700',
    marginBottom: scaler(8),
  },
  desc: {
    fontSize: scaler(16),
  },
  blackDot: {
    width: scaler(4),
    height: scaler(4),
    borderRadius: scaler(4),
    backgroundColor: '#000',
    marginHorizontal: scaler(6),
  },
});

export default ChangePasswordScreen;
