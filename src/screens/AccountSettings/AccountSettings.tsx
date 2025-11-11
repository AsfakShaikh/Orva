import React, {useMemo} from 'react';
import Container from '@components/Container';
import {StyleSheet, View} from 'react-native';
import scaler from '@utils/Scaler';
import {Text} from 'react-native-paper';
import {Strings} from '@locales/Localization';
import {useForm} from 'react-hook-form';
import InputText from '@components/InputText';
import Link from '@components/Link';
import useGetUserConfigQuery from '@modules/AuthModule/Hooks/useGetUserConfigQuery';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AccountSettingStackParamList} from '@navigation/Types/CommonTypes';
import {ACCOUNT_SETTING_STACK_ROUTE_NAME} from '@utils/Constants';

const AccountSettings = () => {
  const {navigate} =
    useNavigation<
      NavigationProp<
        AccountSettingStackParamList,
        ACCOUNT_SETTING_STACK_ROUTE_NAME.ACCOUNT_SETTINGS
      >
    >();

  const {data: userConfig} = useGetUserConfigQuery();

  const userDetail = useMemo(() => userConfig, [userConfig]);

  const {control} = useForm({
    defaultValues: {
      username: userDetail?.username ?? '',
      email: userDetail?.email ?? '',
    },
  });

  return (
    <Container>
      <View
        style={{
          paddingHorizontal: scaler(16),
        }}>
        <View style={styles.mainContainer}>
          <Text style={styles.heading}>{Strings.Account_Settings}</Text>

          <Text style={styles.subheading}>{Strings.Account_Information}</Text>

          <View style={{gap: scaler(24)}}>
            <Text>{Strings.Account_Information_Desc}</Text>

            <InputText
              control={control}
              name="username"
              editable={false}
              label={Strings.Username}
            />
            <InputText
              control={control}
              name="email"
              editable={false}
              label={Strings.Email_Address}
            />
          </View>

          <Link
            text={Strings.Reset_Password}
            onPress={() => {
              navigate(ACCOUNT_SETTING_STACK_ROUTE_NAME.CHANGE_PASSWORD);
            }}
          />
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: scaler(400),
    paddingHorizontal: scaler(12),
  },
  heading: {
    fontSize: scaler(32),
    paddingVertical: scaler(20),
    fontWeight: '700',
  },
  subheading: {
    fontSize: scaler(18),
    fontWeight: '700',
    marginTop: scaler(20),
    marginBottom: scaler(8),
  },
  desc: {
    fontSize: scaler(16),
  },
});

export default AccountSettings;
