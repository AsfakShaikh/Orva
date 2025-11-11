// Not Using - Unmark when start using
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {Strings} from '@locales/Localization';
import {Text} from 'react-native-paper';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';
import useGetVoiceTraningStatusQuery from '../Hooks/useGetVoiceTraningStatusQuery';
import Config from 'react-native-config';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {HomeDrawerParamList} from '@navigation/Types/CommonTypes';
import {HOME_DRAWER_ROUTE_NAME} from '@utils/Constants';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';

const {colors} = theme;

export default function AboutSection() {
  const {navigate} =
    useNavigation<
      NavigationProp<HomeDrawerParamList, HOME_DRAWER_ROUTE_NAME.SETTINGS_STACK>
    >();
  const {selectedOt} = useAuthValue();

  const {data: voiceTraningData} = useGetVoiceTraningStatusQuery();

  const about = {
    Version: Config.APP_VERSION,
    Voice_Training: voiceTraningData ? 'Complete' : 'Incomplete',
    Voice_Model: Config.ASR_MODEL,
    ASR_Environment: Config.ASR_ENVIRONMENT,
  };

  return (
    <View>
      <Text variant="headlineSmall">{Strings.About}</Text>
      <View style={styles.detailView}>
        <View style={{gap: scaler(10)}}>
          {Object.keys(about)?.map(item => {
            return (
              <Text key={item} style={{fontSize: scaler(16)}}>
                {Strings?.[item]}:
              </Text>
            );
          })}
        </View>
        <View style={{gap: scaler(10)}}>
          {Object.keys(about)?.map(item => {
            const isVoiceTraning = item === 'Voice_Training';

            return (
              <Text key={item} style={{fontSize: scaler(16)}}>
                {about?.[item] ?? '--'}
                {isVoiceTraning && ' - '}
                {isVoiceTraning && (
                  <Text
                    onPress={() => {
                      !selectedOt?.isCaseboardOnly &&
                        navigate(HOME_DRAWER_ROUTE_NAME.SETTINGS_STACK);
                    }}
                    style={styles.voiceOptimizeText}>
                    {Strings.Optimize_Voice}
                  </Text>
                )}
              </Text>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  voiceOptimizeText: {
    textDecorationLine: 'underline',
    color: colors.foreground.secondary,
  },
  detailView: {
    flexDirection: 'row',
    gap: scaler(36),
    marginTop: scaler(16),
  },
});
