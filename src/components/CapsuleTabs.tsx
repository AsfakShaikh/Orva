import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
} from 'react-native';
import scaler from '@utils/Scaler';
import {Icon} from 'react-native-paper';
import {theme} from '@styles/Theme';

type CapsuleTabsProps = {
  labels: string[];
  activeTab: number;
  setActiveTab: (index: number) => void;
  style?: StyleProp<any>;
};
const {colors} = theme;

const CapsuleTabs: React.FC<CapsuleTabsProps> = ({
  labels,
  activeTab,
  setActiveTab,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {labels.map((label, index) => (
        <TouchableOpacity
          key={label}
          style={[
            styles.tab,
            index === activeTab && styles.activeTab,
            index !== labels.length - 1 && styles.tabSeparator,
          ]}
          onPress={() => setActiveTab(index)}>
          <View style={styles.tabContent}>
            {index === activeTab && (
              <View style={styles.iconContainer}>
                <Icon
                  source={'check'}
                  size={scaler(16)}
                  color={colors.onSecondaryContainer}
                />
              </View>
            )}
            <Text
              style={[
                styles.tabText,
                index === activeTab && styles.activeTabText,
              ]}>
              {label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: scaler(20),
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: scaler(10),
    paddingHorizontal: scaler(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.secondaryContainer,
  },
  tabText: {
    color: colors.onSecondaryContainer,
    backgroundColor: 'transparent',
  },
  activeTabText: {
    color: colors.onSecondaryContainer,
  },
  tabSeparator: {
    borderRightWidth: 1,
    borderRightColor: colors.primary,
  },
  iconContainer: {
    marginRight: scaler(10),
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CapsuleTabs;
