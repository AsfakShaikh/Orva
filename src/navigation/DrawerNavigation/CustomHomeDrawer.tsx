import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React, {Dispatch, SetStateAction, useState} from 'react';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import {HOME_DRAWER_ROUTE_NAME} from '@utils/Constants';
import Icons from '@assets/Icons';
import OrvaLogo from '@assets/Images/OrvaLogo.svg';
import {Strings} from '@locales/Localization';
import {Icon, useTheme} from 'react-native-paper';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useKeyboard from '@hooks/useKeyboard';

const getTabValues = (routeName: string) => {
  let focusedIcon;
  let unfocusedIcon;
  let label;
  switch (routeName) {
    case HOME_DRAWER_ROUTE_NAME.SCHEDULE_STACK:
      focusedIcon = <Icons.Schedule fill="black" />;
      unfocusedIcon = <Icons.Schedule />;
      label = Strings.Schedule;
      break;
    case HOME_DRAWER_ROUTE_NAME.TRACKER_STACK:
      focusedIcon = <Icons.TrackerFilled />;
      unfocusedIcon = <Icons.Tracker />;
      label = Strings.Tracker;
      break;
    case HOME_DRAWER_ROUTE_NAME.CASEBOARD:
      focusedIcon = <Icons.CaseboardFilled />;
      unfocusedIcon = <Icons.Caseboard />;
      label = Strings.Caseboard;
      break;
    case HOME_DRAWER_ROUTE_NAME.CASES:
      focusedIcon = <Icons.CasesFilled />;
      unfocusedIcon = <Icons.Cases />;
      label = Strings.Cases;
      break;
    case HOME_DRAWER_ROUTE_NAME.SETTINGS_STACK:
      focusedIcon = <Icons.SettingsFilled />;
      unfocusedIcon = <Icons.Settings />;
      label = Strings.Settings;
      break;
    case HOME_DRAWER_ROUTE_NAME.SUPPORT:
      focusedIcon = <Icons.SupportFilled />;
      unfocusedIcon = <Icons.Support />;
      label = Strings.Support;
      break;
    default:
      break;
  }

  return {focusedIcon, unfocusedIcon, label};
};

export interface CustomHomeDrawerProps extends DrawerContentComponentProps {
  isDrawerExpanded?: boolean;
  setIsDrawerExpanded?: Dispatch<SetStateAction<boolean>>;
}

export default function CustomHomeDrawer(
  Props: Readonly<CustomHomeDrawerProps>,
) {
  const {state, navigation, isDrawerExpanded, setIsDrawerExpanded} = Props;
  const {routes, index: activeTabIndex} = state;
  const {colors} = useTheme();
  const {selectedOt} = useAuthValue();
  const {top} = useSafeAreaInsets();
  const {isKeyboardVisible} = useKeyboard();

  const caseboardViewAllowedRoutes = [
    HOME_DRAWER_ROUTE_NAME.SCHEDULE_STACK,
    HOME_DRAWER_ROUTE_NAME.CASEBOARD,
    HOME_DRAWER_ROUTE_NAME.SUPPORT,
  ];
  const isDisabled = (routeName: HOME_DRAWER_ROUTE_NAME) => {
    return (
      selectedOt?.isCaseboardOnly &&
      !caseboardViewAllowedRoutes.includes(routeName)
    );
  };

  const [isExpanded, setIsExpanded] = useState(isDrawerExpanded);

  const toggleDrawer = (value: boolean) => {
    setIsExpanded(value);
    setIsDrawerExpanded?.(value);
  };

  return (
    <View
      style={[
        styles.drawerContainer,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          backgroundColor: colors.surface,
          marginTop: top,
          marginBottom: isKeyboardVisible ? 0 : scaler(120),
        },
        !isExpanded && styles.drawerContainerCollapsed,
      ]}>
      {/* Orva branding with expand/collapse */}
      <TouchableOpacity
        style={styles.branding}
        onPress={() => toggleDrawer(!isExpanded)}
        activeOpacity={0.7}>
        <OrvaLogo width={scaler(56)} height={scaler(20)} fill="#65558F" />
        <Icon
          source={isExpanded ? 'chevron-right' : 'chevron-left'}
          size={scaler(24)}
        />
      </TouchableOpacity>
      {/* Main navigation items */}
      {isExpanded && (
        <View style={styles.tabsContainer}>
          {routes.map((route, index) => {
            const {name, key} = route;
            const {focusedIcon, unfocusedIcon, label} = getTabValues(name);
            const isActive = activeTabIndex === index;
            const onPress = () => {
              const event = navigation.emit({
                type: 'drawerItemPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isActive && !event.defaultPrevented) {
                if (route.name === HOME_DRAWER_ROUTE_NAME.CASES) {
                  navigation.navigate(route.name, undefined);
                } else {
                  navigation.navigate(route.name, route.params);
                }
              }
            };
            const shouldDisabled = isDisabled(name as HOME_DRAWER_ROUTE_NAME);
            const isSupportRoute = name === HOME_DRAWER_ROUTE_NAME.SUPPORT;
            return label ? (
              <TouchableOpacity
                key={key}
                onPress={shouldDisabled ? () => {} : onPress}
                activeOpacity={1}
                disabled={shouldDisabled}
                style={[
                  globalStyles.center,
                  isSupportRoute && styles.supportTab,
                  shouldDisabled && styles.inactiveTab,
                ]}>
                <View
                  style={[
                    styles.drawerItem,
                    {
                      backgroundColor: isActive
                        ? colors.secondaryContainer
                        : colors.surface,
                    },
                  ]}>
                  {isActive ? focusedIcon : unfocusedIcon}
                </View>
                <Text numberOfLines={2} style={styles.label}>
                  {label}
                </Text>
              </TouchableOpacity>
            ) : null;
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    paddingBottom: scaler(20),
    borderTopRightRadius: scaler(16),
    borderBottomRightRadius: scaler(16),
    maxWidth: scaler(100),
    minWidth: scaler(78),
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  drawerContainerCollapsed: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
    paddingBottom: 0,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaler(12),
    paddingVertical: scaler(24),
    paddingRight: scaler(8),
    paddingLeft: scaler(16),
    minWidth: scaler(80),
    maxWidth: scaler(100),
    gap: scaler(4),
  },
  drawerItem: {
    paddingHorizontal: scaler(16),
    paddingVertical: scaler(4),
    borderRadius: scaler(16),
  },
  label: {
    marginVertical: scaler(4),
    textAlign: 'center',
  },
  inactiveTab: {
    opacity: 0.2,
  },
  supportTab: {
    marginTop: 'auto',
    marginBottom: scaler(8),
  },
  tabsContainer: {
    flex: 1,
    gap: scaler(16),
    justifyContent: 'flex-start',
  },
});
