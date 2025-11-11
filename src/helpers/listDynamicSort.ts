import {SORT_DIRECTION} from '@modules/CaseSelectionModule/Types/CommonTypes';

export function listDynamicSort(
  list: Array<any>,
  key: string,
  sortDirection: SORT_DIRECTION = SORT_DIRECTION.ASCENDING,
) {
  return list.sort((a, b) => {
    const valA = a[key] || '';
    const valB = b[key] || '';

    let comparison = 0;

    if (typeof valA === 'string' && typeof valB === 'string') {
      comparison = valA.localeCompare(valB);
    }
    if (valA > valB) {
      comparison = 1;
    }
    if (valA < valB) {
      comparison = -1;
    }

    return sortDirection === SORT_DIRECTION.ASCENDING
      ? comparison
      : -comparison;
  });
}
