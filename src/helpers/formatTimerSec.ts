export default function formatTimerSec(
  seconds: number = 0,
  enableShort?: boolean,
) {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = Math.floor(absSeconds % 60);

  // Pad the values to ensure two digits for hours, minutes, and seconds
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(secs).padStart(2, '0');

  let formattedTime = '';

  // If enableShort is true and hours is 0, show only minutes:seconds
  if (enableShort && hours === 0) {
    formattedTime = `${
      isNegative ? '- ' : ''
    }${formattedMinutes}:${formattedSeconds}`;
  } else {
    formattedTime = `${
      isNegative ? '- ' : ''
    }${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return {
    formattedTime,
    isNegative,
    formattedHours,
    formattedMinutes,
    formattedSeconds,
  };
}
