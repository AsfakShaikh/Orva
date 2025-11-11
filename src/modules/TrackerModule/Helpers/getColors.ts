import {theme} from '@styles/Theme';
import {GLOBAL_TIMER_TYPE} from '@components/GlobalTimer';
import {Strings} from '@locales/Localization';
import {caseboardHeaderColors, headerColors} from '@utils/Constants';
const {colors} = theme;

export const getColors = (
  title?: string,
  timerType: GLOBAL_TIMER_TYPE = GLOBAL_TIMER_TYPE.HEADER,
  isMoreThatThirtyMins: boolean = false,
) => {
  let filterColors;

  if (timerType === GLOBAL_TIMER_TYPE.HEADER) {
    if (title === Strings.TurnOver_Time && isMoreThatThirtyMins) {
      filterColors = {
        BGcolor: colors.background.attention,
        textColor: colors.foreground.inverted,
      };
    } else {
      filterColors = headerColors.find(item => item.title === title);
    }
  }
  if (timerType === GLOBAL_TIMER_TYPE.CASEBOARD_HEADER) {
    if (title === Strings.TurnOver_Time && isMoreThatThirtyMins) {
      filterColors = {
        BGcolor: colors.background.attention,
        textColor: colors.foreground.inverted,
      };
    } else {
      filterColors = caseboardHeaderColors.find(item => item.title === title);
    }
  }

  return (
    filterColors ?? {
      BGcolor: colors.background.inverse,
      textColor: colors.foreground.inverted,
    }
  );
};
