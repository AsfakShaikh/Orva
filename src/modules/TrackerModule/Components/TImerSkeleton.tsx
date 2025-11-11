import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';

const {colors} = theme;

const TImerSkeleton = () => {
  return (
    <SkeletonPlaceholder
      backgroundColor={colors.background.tertiary}
      highlightColor={colors.foreground.brand}
      speed={3000}>
      <SkeletonPlaceholder.Item
        width={82}
        height={78}
        borderRadius={18}
        marginRight={scaler(16)}
      />
    </SkeletonPlaceholder>
  );
};

export default TImerSkeleton;
