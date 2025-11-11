import {View, ImageBackground} from 'react-native';
import React from 'react';
import Images from '@assets/Images';
import Body from '@components/Body';
import Container from '@components/Container';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import {useTheme} from 'react-native-paper';

type LoginFromWraperProps = Readonly<{
  children: JSX.Element | Array<JSX.Element>;
}>;

export default function LoginFromWraper({children}: LoginFromWraperProps) {
  const {colors} = useTheme();

  return (
    <ImageBackground
      source={Images.LoginBg}
      resizeMode="cover"
      style={{flex: 1}}>
      <Container backgroundColor="transparent">
        <Body>
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
              {children}
            </View>
          </View>
        </Body>
      </Container>
    </ImageBackground>
  );
}
