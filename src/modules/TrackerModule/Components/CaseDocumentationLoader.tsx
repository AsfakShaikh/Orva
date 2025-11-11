import scaler from '@utils/Scaler';
import React from 'react';
import {View} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {theme} from '@styles/Theme';

const {colors} = theme;
const CaseDocumentationLoader = () => {
  return (
    <View style={{gap: scaler(12), paddingVertical: scaler(16)}}>
      {Array.from({length: 8}).map((item: any, index: number) => (
        <View
          key={item + index}
          style={{
            backgroundColor: colors.background.primary,
            padding: scaler(16),
            borderRadius: scaler(16),
          }}>
          <SkeletonPlaceholder
            borderRadius={50}
            backgroundColor={colors.border.subtle}
            highlightColor={'rgba(153, 153, 153, 0.2)'}>
            <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
              <SkeletonPlaceholder.Item flex={3.5} height={scaler(20)} />
              <SkeletonPlaceholder.Item
                flex={1}
                marginLeft={scaler(32)}
                height={scaler(20)}
              />
              <SkeletonPlaceholder.Item
                flex={1}
                marginLeft={scaler(32)}
                height={scaler(20)}
              />
              <SkeletonPlaceholder.Item
                flex={1}
                marginLeft={scaler(32)}
                height={scaler(20)}
              />
              <SkeletonPlaceholder.Item
                flex={1.5}
                marginLeft={scaler(32)}
                height={scaler(20)}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </View>
      ))}
    </View>
  );
};

export default CaseDocumentationLoader;
