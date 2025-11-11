import {Dimensions, Platform} from 'react-native';

const DesignWidth = 1280;
const DesignHeight = 800;
export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

const CURRENT_RESOLUTION = Math.sqrt(
  screenHeight * screenHeight + screenWidth * screenWidth,
);

const scaler = (px: number) => {
  const DESIGN_RESOLUTION = Math.sqrt(
    DesignHeight * DesignHeight + DesignWidth * DesignWidth,
  );
  const RESOLUTIONS_PROPORTION = CURRENT_RESOLUTION / DESIGN_RESOLUTION;
  return RESOLUTIONS_PROPORTION * px;
};

export const reverseScaling = (px: number, disableIos: boolean = true) => {
  const DESIGN_RESOLUTION = Math.sqrt(
    DesignHeight * DesignHeight + DesignWidth * DesignWidth,
  );
  const RESOLUTIONS_PROPORTION = CURRENT_RESOLUTION / DESIGN_RESOLUTION;

  const isReverseScaling = Platform.OS === 'ios' ? disableIos : false;
  return px / (isReverseScaling ? 1 : RESOLUTIONS_PROPORTION);
};

export default scaler;
