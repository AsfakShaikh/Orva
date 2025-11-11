import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import Card from '@components/Card';
import scaler from '@utils/Scaler';
import Images from '@assets/Images/index';
import {HOME_DRAWER_ROUTE_NAME} from '@utils/Constants';
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {HomeDrawerParamList} from '@navigation/Types/CommonTypes';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import {globalStyles} from '@styles/GlobalStyles';
import {Strings} from '@locales/Localization';
import useEventEmitter from '@hooks/useEventEmitter';
import {
  NAVIGATION_INTENTS_ARRAY,
  VOICE_COMAND_STATUS,
  VOICE_INETENT_EVENT,
  VOICE_INTENT,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import SubmitedCasesList from '@modules/CasesModule/Components/SubmitedCasesList';

export default function HomeScreen() {
  const {firstName} = useAuthValue();
  const [voiceIntent, setVoiceIntent] = useState<VOICE_INTENT>();
  const isFocused = useIsFocused();
  const {navigate} =
    useNavigation<
      NavigationProp<HomeDrawerParamList, HOME_DRAWER_ROUTE_NAME.SCHEDULE_STACK>
    >();
  useEventEmitter(VOICE_INETENT_EVENT, (voiceIntentData: VOICE_INTENT) => {
    setVoiceIntent(voiceIntentData);
  });

  const onVoiceIntentReceive = useCallback(() => {
    switch (voiceIntent) {
      case VOICE_INTENT.CASE_SELECT:
      case VOICE_INTENT.VIEW_CASE_LIST:
        navigate(HOME_DRAWER_ROUTE_NAME.SCHEDULE_STACK);
        fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
        break;
      case VOICE_INTENT.VOICE_NOTE:
      case VOICE_INTENT.SET_TIMER:
      case VOICE_INTENT.SET_ALARM:
        fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
        break;
      default:
        if (!NAVIGATION_INTENTS_ARRAY.includes(voiceIntent as VOICE_INTENT)) {
          fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceIntent]);

  useEffect(() => {
    if (voiceIntent) {
      if (isFocused) {
        onVoiceIntentReceive();
      } else {
        fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
      }
      setVoiceIntent(undefined);
    }
  }, [onVoiceIntentReceive, voiceIntent, isFocused]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {firstName && firstName + '!'}
        </Text>
      </View>
      <ScrollView nestedScrollEnabled={true}>
        <View style={styles.cardRow}>
          <Card
            cardImage={Images.cardImage}
            cardTitle="Log Milestones with Your Voice"
            description="Orva’s surgical milestone tracker allows hands-free logging using your voice."
            buttonText={Strings.View_Case_List}
            pressAction={() => navigate(HOME_DRAWER_ROUTE_NAME.SCHEDULE_STACK)}
          />
          <Card
            cardImage={Images.cardImage_2}
            cardTitle="View OT Status in Realtime"
            description="Orva’s caseboard provides real-time visibility into the status of each OT."
            buttonText={Strings.View_Caseboard}
            pressAction={() => navigate(HOME_DRAWER_ROUTE_NAME.CASEBOARD)}
          />
          <Card
            cardImage={Images.cardImage_3}
            cardTitle="Get Support and Share Your Feedback"
            description="Find answers to frequently asked questions and share your feedback."
            buttonText={Strings.Get_Support}
            pressAction={() => navigate(HOME_DRAWER_ROUTE_NAME.SUPPORT)}
          />
        </View>
        <View>
          <SubmitedCasesList
            isFromHome={true}
            title={Strings.submitted_cases_home_header_text}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scaler(24),
  },
  header: {
    left: scaler(6),
  },
  welcomeText: {
    ...globalStyles.screenHeader,
    marginBottom: scaler(24),
  },
  cardRow: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: scaler(24),
  },
});
