import {DATE_TYPE} from '@utils/Types';

export default function checkIsBeforeDayEnd(timestamp: DATE_TYPE) {
  const date = new Date(timestamp);
  date.setUTCHours(23, 59, 59, 999);

  const now = new Date();
  return now <= date;
}
