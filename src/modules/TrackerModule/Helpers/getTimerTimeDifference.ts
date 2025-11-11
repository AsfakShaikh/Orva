import convertToZonedTime from '@helpers/convertToZonedTime';

export default function getTrackerTimeDifference(
  time: Date | string | number | null,
) {
  const currentTimeInSeconds = Math.floor(
    convertToZonedTime().getTime() / 1000,
  );

  const startMilesStoneSec = Math.floor(
    convertToZonedTime(time).getTime() / 1000,
  );

  return startMilesStoneSec - currentTimeInSeconds;
}
