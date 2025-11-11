import scaler from '@utils/Scaler';
import React, {FC} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import HeaderTimer from '@modules/TrackerModule/Components/HeaderTimer';
import HeaderSnackbar from './HeaderSnackbar';
import TrackerHeader from '@modules/TrackerModule/Components/TrackerHeader';
import {theme} from '@styles/Theme';
import {globalStyles} from '@styles/GlobalStyles';
import {Strings} from '@locales/Localization';
import {RouteProp, useRoute} from '@react-navigation/native';
import {HomeDrawerParamList} from '@navigation/Types/CommonTypes';
import {HOME_DRAWER_ROUTE_NAME} from '@utils/Constants';
import CaseTrackerStepWizard from '@modules/TrackerModule/Components/CaseTrackerStepWizard';
import AccountBlock from '@modules/AuthModule/Components/AccountBlock';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';

const {colors} = theme;

export interface AppBarProps {
  isDrawerExpanded?: boolean;
  isRoomCleanActive?: boolean;
}

const AppBar: FC<AppBarProps> = ({isDrawerExpanded, isRoomCleanActive}) => {
  const {name} = useRoute<RouteProp<HomeDrawerParamList, any>>();

  const {selectedOt} = useAuthValue();
  const {currentActiveCase} = useTrackerValue();
  const {top} = useSafeAreaInsets();

  const isCaseboardView = selectedOt?.isCaseboardOnly;
  const isTrackerStack = name === HOME_DRAWER_ROUTE_NAME.TRACKER_STACK;
  const isCaseboardStack = name === HOME_DRAWER_ROUTE_NAME.CASEBOARD;

  return (
    <View style={{marginTop: top}}>
      <View
        style={[
          styles.container,
          {
            paddingBottom:
              isTrackerStack && currentActiveCase ? scaler(6) : scaler(12),
          },
        ]}>
        <View
          style={[
            styles.headerView,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              marginLeft: isDrawerExpanded ? 0 : scaler(100),
            },
          ]}>
          {!isCaseboardView ? (
            <HeaderTimer />
          ) : (
            <View style={globalStyles.flex1}>
              {isCaseboardStack && (
                <Text style={styles.headerText}>{Strings.Caseboard}</Text>
              )}
            </View>
          )}

          <TrackerHeader isRoomCleanActive={isRoomCleanActive} />
          <AccountBlock />
        </View>
        {isTrackerStack && currentActiveCase && <CaseTrackerStepWizard />}
      </View>
      <HeaderSnackbar />
    </View>
  );
};

export default AppBar;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: scaler(16),
    paddingHorizontal: scaler(18),
    paddingTop: scaler(12),
    backgroundColor: colors.background.primary,
    borderRadius: scaler(16),
    gap: scaler(10),
  },
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scaler(16),
  },
  icon: {
    height: scaler(56),
    width: scaler(56),
    borderRadius: 16,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileView: {
    marginLeft: 'auto',
    borderRadius: 50,
    padding: scaler(4),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  ot: {
    height: scaler(36),
    width: scaler(36),
    borderRadius: 40,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hosp: {
    height: scaler(36),
    width: scaler(96),
    overflow: 'hidden',
    borderRadius: 40,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scaler(8),
  },
  otTxt: {color: colors.foreground.primary, fontWeight: '700'},
  img: {
    resizeMode: 'contain',
    marginHorizontal: scaler(25),
    width: scaler(60),
    height: 'auto',
    aspectRatio: 1,
  },
  headerText: {
    fontSize: scaler(32),
    fontWeight: '700',
    color: colors.foreground.primary,
  },
});
