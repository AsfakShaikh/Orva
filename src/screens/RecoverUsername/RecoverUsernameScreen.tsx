import {View, ImageBackground} from 'react-native';
import React from 'react';
import Images from '@assets/Images';
import Container from '@components/Container';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import {useTheme} from 'react-native-paper';
import RecoverUsernameForm from '@modules/AuthModule/Components/RecoverUsernameForm';

export default function RecoverUsernameScreen() {
  const {colors} = useTheme();

  return (
    <ImageBackground
      source={Images.LoginBg}
      resizeMode="cover"
      style={{flex: 1}}>
      <Container backgroundColor="transparent">
        <View style={globalStyles.colCenter}>
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
            <RecoverUsernameForm />
          </View>
        </View>
      </Container>
    </ImageBackground>
  );
}
