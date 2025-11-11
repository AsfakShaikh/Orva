import scaler from '@utils/Scaler';
import {Appearance} from 'react-native';
import {
  MD3LightTheme as DefaultLightTheme,
  MD3DarkTheme as DefaultDarkTheme,
  configureFonts,
} from 'react-native-paper';
import {MD3Typescale} from 'react-native-paper/lib/typescript/types';
import {VOICE_COMAND_STATUS} from '@modules/VoiceComandModule/Types/CommonTypes.ts';
import {HEADER_SNACKBAR_TYPE} from '@utils/Types';

export enum APP_THEME {
  LIGHT = 'light',
  DARK = 'dark',
}

const Colors = {
  darkColors: {
    background: {
      primary: 'rgba(0, 0, 0, 1)',
      secondary: 'rgba(19, 19, 19, 1)',
      tertiary: 'rgba(232, 222, 248, 1)',
      inactive: 'rgba(52, 52, 52, 1)',
      navigation: 'rgba(37, 37, 37, 1)',
      inverse: 'rgba(178, 178, 178, 1)',
      activity: 'rgba(39, 70, 244, 1)',
      attention: 'rgba(222, 33, 33, 1)',
      error: 'rgba(179, 38, 30, 1)',
      progress: 'rgba(0, 138, 2, 1)',
      brand: 'rgba(89, 33, 242, 1)',
      warning: 'rgba(236, 164, 62, 1)',
    },
    foreground: {
      primary: 'rgba(255, 255, 255, 1)',
      secondary: 'rgba(153, 153, 153, 1)',
      inactive: 'rgba(89, 89, 89, 1)',
      inverted: 'rgba(0, 0, 0, 1)',
      activity: 'rgba(39, 70, 244, 1)',
      attention: 'rgba(222, 33, 33, 1)',
      error: 'rgba(179, 38, 30, 1)',
      progress: 'rgba(0, 138, 2, 1))',
      brand: 'rgba(143, 131, 192, 1)',
      warning: 'rgba(236, 164, 62, 1)',
    },
    border: {
      default: 'rgba(89, 89, 89, 1)',
      subtle: 'rgba(52, 52, 52, 1)',
      strong: 'rgba(255, 255, 255, 1)',
      inactive: 'rgba(52, 52, 52, 1)',
      activity: 'rgba(39, 70, 244, 1)',
      attention: 'rgba(222, 33, 33, 1)',
      error: 'rgba(179, 38, 30, 1)',
      progress: 'rgba(0, 138, 2, 1)',
      brand: 'rgba(89, 33, 242, 1)',
      core: 'rgba(50, 194, 27, 1)',
      warning: 'rgba(236, 164, 62, 1)',
    },
  },
  lightColors: {
    background: {
      primary: 'rgba(255, 255, 255, 1)',
      secondary: 'rgba(243, 243, 243, 1)',
      tertiary: 'rgba(232, 222, 248, 1)',
      inactive: 'rgba(238, 238, 238, 1)',
      navigation: 'rgba(247, 247, 247, 1)',
      inverse: 'rgba(37, 37, 37, 1)',
      activity: 'rgba(33, 63, 232, 1)',
      attention: 'rgba(224, 0, 0, 1)',
      error: 'rgba(179, 38, 30, 1)',
      progress: 'rgba(0, 122, 2, 1)',
      brand: 'rgba(89, 33, 242, 1)',
      warning: 'rgba(236, 164, 62, 1)',
    },
    foreground: {
      primary: 'rgba(0, 0, 0, 1)',
      secondary: 'rgba(89, 89, 89, 1)',
      inactive: 'rgba(178, 178, 178, 1)',
      inverted: 'rgba(255, 255, 255, 1)',
      activity: 'rgba(33, 63, 232, 1)',
      attention: 'rgba(224, 0, 0, 1)',
      error: 'rgba(179, 38, 30, 1)',
      progress: 'rgba(0, 122, 2, 1)',
      brand: 'rgba(96, 64, 135, 1)',
      warning: 'rgba(236, 164, 62, 1)',
    },
    border: {
      default: 'rgba(153, 153, 153, 1)',
      subtle: 'rgba(238, 238, 238, 1)',
      strong: 'rgba(0, 0, 0, 1)',
      inactive: 'rgba(178, 178, 178, 1)',
      activity: 'rgba(33, 63, 232, 1)',
      attention: 'rgba(224, 0, 0, 1)',
      error: 'rgba(179, 38, 30, 1)',
      progress: 'rgba(0, 122, 2, 1)',
      brand: 'rgba(89, 33, 242, 1)',
      core: 'rgba(50, 194, 27, 1)',
      warning: 'rgba(236, 164, 62, 1)',
    },
  },
};

const fontConfig: MD3Typescale = {
  displaySmall: {
    fontFamily: 'Inter',
    fontSize: scaler(36),
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: scaler(44),
  },
  displayMedium: {
    fontFamily: 'Inter',
    fontSize: scaler(45),
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 52,
  },
  displayLarge: {
    fontFamily: 'Inter',
    fontSize: scaler(57),
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: scaler(64),
  },
  headlineSmall: {
    fontFamily: 'Inter',
    fontSize: scaler(24),
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: scaler(32),
  },
  headlineMedium: {
    fontFamily: 'Inter',
    fontSize: scaler(28),
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: scaler(36),
  },
  headlineLarge: {
    fontFamily: 'Inter',
    fontSize: scaler(32),
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: scaler(40),
  },
  titleSmall: {
    fontFamily: 'Inter',
    fontSize: scaler(14),
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: scaler(20),
  },
  titleMedium: {
    fontFamily: 'Inter',
    fontSize: scaler(16),
    fontWeight: '500',
    letterSpacing: 0.15,
    lineHeight: scaler(24),
  },
  titleLarge: {
    fontFamily: 'Inter',
    fontSize: scaler(22),
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: scaler(28),
  },
  labelSmall: {
    fontFamily: 'Inter',
    fontSize: scaler(11),
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: scaler(16),
  },
  labelMedium: {
    fontFamily: 'Inter',
    fontSize: scaler(12),
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: scaler(16),
  },
  labelLarge: {
    fontFamily: 'Inter',
    fontSize: scaler(14),
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: scaler(20),
  },
  bodySmall: {
    fontFamily: 'Inter',
    fontSize: scaler(12),
    fontWeight: '400',
    letterSpacing: 0.4,
    lineHeight: scaler(16),
  },
  bodyMedium: {
    fontFamily: 'Inter',
    fontSize: scaler(14),
    fontWeight: '400',
    letterSpacing: 0.25,
    lineHeight: scaler(20),
  },
  bodyLarge: {
    fontFamily: 'Inter',
    fontSize: scaler(16),
    fontWeight: '400',
    letterSpacing: 0.15,
    lineHeight: scaler(24),
  },
  default: {
    fontFamily: 'Inter',
    fontWeight: '400',
    letterSpacing: 0,
  },
};

export const statusColor = {
  [VOICE_COMAND_STATUS.DEFAULT]: ['#4E4E4E', '#252525'],
  [VOICE_COMAND_STATUS.LISTENING]: ['black', 'black'],
  [VOICE_COMAND_STATUS.LOADING]: ['black', 'black'],
  [VOICE_COMAND_STATUS.POSITIVE]: ['#007A02', '#007A02'],
  [VOICE_COMAND_STATUS.NEGATIVE]: ['red', 'red'],
};

export const IconsColors = {
  [VOICE_COMAND_STATUS.DEFAULT]: '#252525',
  [VOICE_COMAND_STATUS.LISTENING]: 'red',
  [VOICE_COMAND_STATUS.LOADING]: '#252525',
  [VOICE_COMAND_STATUS.POSITIVE]: '#007A02',
  [VOICE_COMAND_STATUS.NEGATIVE]: '#252525',
};

export const SnackbarColor = {
  [HEADER_SNACKBAR_TYPE.ATTENTION]: '#E00000',
  [HEADER_SNACKBAR_TYPE.SUCCESS]: '#007A02',
  [HEADER_SNACKBAR_TYPE.NEUTRAL]: '#000000',
  [HEADER_SNACKBAR_TYPE.SUPPORT]: '#5921F2',
  [HEADER_SNACKBAR_TYPE.DEFAULT]: '#FFFFFF',
};
const initialColorScheme = Appearance.getColorScheme();
export const isDarkMode = initialColorScheme === APP_THEME.DARK;

const DefaultColors = isDarkMode ? Colors?.darkColors : Colors?.lightColors;

const DefaultTheme = isDarkMode ? DefaultDarkTheme : DefaultLightTheme;

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...DefaultColors,
  },
  fonts: configureFonts({config: fontConfig, isV3: true}),
};
