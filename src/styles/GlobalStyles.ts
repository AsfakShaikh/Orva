import scaler from '@utils/Scaler';
import {StyleSheet} from 'react-native';
import {theme} from './Theme';

const {colors} = theme;

export const globalStyles = StyleSheet.create({
  flex1: {flex: 1},

  colCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
  },

  verticalCenter: {
    justifyContent: 'center',
  },

  horizontalCenter: {
    alignItems: 'center',
  },

  fullFlexLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  absoluteCenter: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullFlexImage: {
    width: '100%',
    height: '100%',
  },

  recoverHeading: {
    textTransform: 'capitalize',
    marginTop: scaler(16),
    textAlign: 'center',
    fontWeight: '700',
    fontSize: scaler(18),
    marginBottom: scaler(4),
  },

  dialogContainer: {
    backgroundColor: 'rgba(236, 230, 240, 1)',
    width: scaler(312),
    padding: scaler(24),
    alignSelf: 'center',
    borderRadius: scaler(16),
  },

  screenHeader: {
    fontSize: scaler(32),
    fontWeight: 'bold',
    color: colors.foreground.primary,
  },

  multilineInput: {
    justifyContent: 'flex-start',
    height: scaler(200),
  },

  blackText: {
    color: colors.foreground.primary,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
});
