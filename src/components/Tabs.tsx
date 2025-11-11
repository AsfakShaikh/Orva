import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {Dispatch, SetStateAction} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface TabsProps {
  options: Array<{label: string; value: string | number}>;
  activeTab: string | number;
  setActiveTab: Dispatch<SetStateAction<any>>;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Tabs: React.FC<TabsProps> = ({
  options,
  setActiveTab,
  activeTab,
  containerStyle,
  textStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {options.map(option => {
        const isActive = activeTab === option.value;
        return (
          <View key={option.value}>
            <TouchableOpacity onPress={() => setActiveTab(option.value)}>
              <Text
                style={[
                  styles.tabText,
                  textStyle,
                  isActive ? styles.activeTabText : null,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
            {isActive && <View style={styles.bottomBorder} />}
          </View>
        );
      })}
    </View>
  );
};

const {colors} = theme;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomColor: colors.border.inactive,
    borderBottomWidth: scaler(1),
    gap: scaler(24),
  },
  tabText: {
    paddingTop: scaler(14),
    paddingBottom: scaler(12),
    fontSize: scaler(14),
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '500',
    color: colors.primary,
  },
  bottomBorder: {
    height: scaler(3),
    width: '100%',
    borderTopRightRadius: scaler(100),
    borderTopLeftRadius: scaler(100),
    backgroundColor: colors.primary,
    marginBottom: -scaler(1),
  },
});

export default Tabs;
