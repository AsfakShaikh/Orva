import {ScrollView, View} from 'react-native';
import React from 'react';
import CaseBoardCard from '@modules/CaseBoardModule/Components/CaseboardCard';
import {globalStyles} from '@styles/GlobalStyles';

const CaseBoardScreen = () => {
  return (
    <View style={globalStyles.flex1}>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={globalStyles.flex1}>
        <CaseBoardCard />
      </ScrollView>
    </View>
  );
};

export default CaseBoardScreen;
