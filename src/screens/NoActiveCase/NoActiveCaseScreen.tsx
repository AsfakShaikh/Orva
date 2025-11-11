import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';
import {Strings} from '@locales/Localization';

import Container from '@components/Container';

const {colors} = theme;

const NoActiveCaseScreen = () => {
  return (
    <Container
      statusBarStyle="dark-content"
      backgroundColor={colors.background.secondary}>
      <View style={styles.mainContent}>
        <View style={styles.noActiveCaseContainer}>
          <Text style={styles.noActiveCaseTitle}>
            {Strings.No_active_case_running}
          </Text>
          <Text style={styles.noActiveCaseSubtitle}>
            {Strings.No_active_case_subtitle}
          </Text>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  noActiveCaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaler(24),
  },
  noActiveCaseTitle: {
    fontSize: scaler(32),
    fontWeight: 'bold',
    color: colors.foreground.primary,
    textAlign: 'center',
    marginBottom: scaler(16),
  },
  noActiveCaseSubtitle: {
    fontSize: scaler(24),
    color: colors.foreground.primary,
    textAlign: 'center',
    lineHeight: scaler(24),
    paddingHorizontal: scaler(32),
  },
});

export default NoActiveCaseScreen;
