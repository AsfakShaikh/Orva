/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {theme} from '@styles/Theme';
import {Text} from 'react-native-paper';
import {Strings} from '@locales/Localization';
import {StyleSheet, View} from 'react-native';
import scaler from '@utils/Scaler';
import FeedbackForm from '@modules/SupportModule/Components/FeedbackForm';
import Body from '@components/Body';
import {globalStyles} from '@styles/GlobalStyles';
import TroubleshoortCard from '@modules/SupportModule/Components/TroubleshoortCard';
import Config from 'react-native-config';

const {colors} = theme;

export default function SupportScreen() {
  return (
    <Body>
      <View style={styles.container}>
        <Text style={globalStyles.screenHeader}>{Strings.Orva_Support}</Text>

        <View style={styles.cardContainer}>
          <View
            style={{
              flex: 3,
              gap: scaler(24),
            }}>
            {/* Contact Us */}
            <View style={styles.cardView}>
              <Text style={styles.cardHeader}>{Strings.contact_us}</Text>
              <Text style={styles.cardDesc}>
                {Strings.Email_us_anytime_at}{' '}
                <Text style={{fontWeight: 'bold'}}>support@orva.app</Text>{' '}
                {Strings.Email_us_end_text}
              </Text>
            </View>
            {/* Onboarding & Troubleshoot */}
            <TroubleshoortCard />
          </View>
          <View
            style={{
              flex: 2,
            }}>
            <View style={[styles.cardView, globalStyles.flex1]}>
              <FeedbackForm />
            </View>
          </View>
        </View>

        <Text
          style={
            styles.version
          }>{`${Strings.Version}: ${Config.APP_VERSION}`}</Text>
      </View>
    </Body>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scaler(24),
    paddingBottom: scaler(8),
  },
  cardView: {
    backgroundColor: colors.background.primary,
    borderRadius: scaler(16),
    padding: scaler(24),
  },
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: scaler(24),
    marginVertical: scaler(24),
  },
  cardHeader: {
    fontSize: scaler(24),
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  cardDesc: {
    fontSize: scaler(18),
    marginTop: scaler(12),
    lineHeight: scaler(24),
  },
  version: {fontSize: scaler(16), alignSelf: 'flex-end'},
});
