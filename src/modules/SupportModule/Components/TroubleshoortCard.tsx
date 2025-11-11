import Images from '@assets/Images';
import Button from '@components/Button';
import {Strings} from '@locales/Localization';
import {HomeDrawerParamList} from '@navigation/Types/CommonTypes';
import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {theme} from '@styles/Theme';
import {
  HOME_DRAWER_ROUTE_NAME,
  MAIN_STACK_ROUTE_NAME,
  USER_GUIDE_URL,
} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

const {colors} = theme;

const TroubleshoortCard = () => {
  const {getParent} =
    useNavigation<
      NavigationProp<HomeDrawerParamList, HOME_DRAWER_ROUTE_NAME.SUPPORT>
    >();
  return (
    <View style={styles.container}>
      <Image source={Images.Troubleshoot} style={styles.image} />
      <View style={styles.card}>
        <View>
          <Text style={styles.cardHeader}>
            {Strings.onboarding_and_troubleshooting}
          </Text>
          <Text style={styles.cardDesc}>
            {Strings.onboarding_and_troubleshooting_desc}
          </Text>
        </View>

        <Button
          onPress={() =>
            getParent()?.dispatch(
              CommonActions.navigate(MAIN_STACK_ROUTE_NAME.WEB_VIEWER, {
                source: USER_GUIDE_URL,
              }),
            )
          }
          mode="contained">
          {Strings.View_Support_Guide}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: scaler(16),
    overflow: 'hidden',
    backgroundColor: colors.background.primary,
  },
  card: {
    padding: scaler(24),
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    fontSize: scaler(24),
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  cardDesc: {
    fontSize: scaler(18),
    marginTop: scaler(4),
    lineHeight: scaler(24),
  },
  image: {
    height: scaler(132),
    resizeMode: 'cover',
    width: '100%',
  },
});

export default TroubleshoortCard;
