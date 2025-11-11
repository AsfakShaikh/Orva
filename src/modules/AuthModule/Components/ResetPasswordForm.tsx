import Button from '@components/Button';
import InputText from '@components/InputText';
import {getEmailValidationRules} from '@helpers/formValidationRules';
import {Strings} from '@locales/Localization';
import {AuthStackParamList} from '@navigation/Types/CommonTypes';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {globalStyles} from '@styles/GlobalStyles';
import {AUTH_STACK_ROUTE_NAME} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React, {FC} from 'react';
import {useForm} from 'react-hook-form';
import {Text, useTheme} from 'react-native-paper';
import useRecoverPasswordMutation from '../Hooks/useRecoverPasswordMutation';
import {View} from 'react-native';
import Images from '@assets/Images';

interface ResetPasswordFormProps {
  onSuccess?: (val?: string) => void;
}

const ResetPasswordForm: FC<ResetPasswordFormProps> = ({onSuccess}) => {
  const {goBack} =
    useNavigation<
      NavigationProp<AuthStackParamList, AUTH_STACK_ROUTE_NAME.RECOVER_USERNAME>
    >();

  const {control, handleSubmit, watch} = useForm({
    defaultValues: {
      email: '',
    },
  });

  const {mutate: recoverPasswordMutate, isPending: isSendingRequest} =
    useRecoverPasswordMutation(onSuccess);

  const {colors} = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.onPrimary,
        width: scaler(400),
        borderRadius: scaler(16),
        padding: scaler(16),
      }}>
      <View style={{alignItems: 'center'}}>
        <Images.OrvaLogo />
      </View>
      <Text style={globalStyles.recoverHeading}>{Strings.Reset_Password}</Text>
      <Text
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          textAlign: 'center',
          fontSize: scaler(16),
        }}>
        {Strings.Recover_Password_Subheading}
      </Text>
      <InputText
        style={{marginTop: scaler(18)}}
        name="email"
        control={control}
        label={Strings.Email_Address}
        isLabelDefaultBehaviour={false}
        rules={getEmailValidationRules()}
      />
      <Button
        style={{marginTop: scaler(24)}}
        disabled={!watch('email') || isSendingRequest}
        loading={isSendingRequest}
        mode="contained"
        onPress={handleSubmit(val => {
          recoverPasswordMutate(val);
        })}>
        {Strings.Submit}
      </Button>
      <Button
        disabled={isSendingRequest}
        style={{marginTop: scaler(24)}}
        onPress={goBack}>
        {Strings.Cancel_and_go_back}
      </Button>
    </View>
  );
};

export default ResetPasswordForm;
