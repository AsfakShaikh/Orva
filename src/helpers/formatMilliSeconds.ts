import {intervalToDuration, formatDuration} from 'date-fns';

const formatMilliSeconds = (
  milliseconds?: number | null,
  isShort?: boolean,
): string => {
  if (!milliseconds || milliseconds === 0) {
    return '0 seconds';
  }

  const duration = intervalToDuration({start: 0, end: milliseconds});

  const shortLocale = (() => {
    if (isShort) {
      return {
        formatDistance: (token: string, count: number) => {
          const format = {
            xSeconds: `${count} sec`,
            xMinutes: `${count} min`,
            xHours: `${count} hr`,
            xDays: `${count} d`,
            xMonths: `${count} mo`,
            xYears: `${count} yr`,
          };
          return format[token as keyof typeof format] || '';
        },
      };
    }
  })();

  return formatDuration(duration, {
    locale: shortLocale,
  });
};

export default formatMilliSeconds;
