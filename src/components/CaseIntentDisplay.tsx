// Not in use

import React from 'react';
import scaler from '@utils/Scaler';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '@styles/Theme';
const {colors} = theme;

const CaseIntentDisplay = ({caseIntent}: {caseIntent: string}) => {
  return (
    <View>
      <Text style={styles.caseIntent}>{caseIntent}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  caseIntent: {
    fontSize: scaler(24),
    marginRight: scaler(8),
    paddingLeft: scaler(25),
    paddingRight: scaler(3),
    color: colors?.foreground?.inverted,
  },
});

export default CaseIntentDisplay;
