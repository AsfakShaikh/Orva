import {listDynamicSort} from '@helpers/listDynamicSort';
import {SORT_DIRECTION} from '@modules/CaseSelectionModule/Types/CommonTypes';

describe('listDynamicSort', () => {
  const sampleList = [
    {name: 'Charlie', duration: 30, date: '2024-09-25T10:30:00.000Z'},
    {name: 'Alice', duration: 25, date: '2023-01-15T08:15:00.000Z'},
    {name: 'Bob', duration: 28, date: '2023-06-20T14:45:00.000Z'},
  ];

  it('should sort by a string key in ascending order', () => {
    const result = listDynamicSort(
      [...sampleList],
      'name',
      SORT_DIRECTION.ASCENDING,
    );
    expect(result).toEqual([
      {name: 'Alice', duration: 25, date: '2023-01-15T08:15:00.000Z'},
      {name: 'Bob', duration: 28, date: '2023-06-20T14:45:00.000Z'},
      {name: 'Charlie', duration: 30, date: '2024-09-25T10:30:00.000Z'},
    ]);
  });

  it('should sort by a string key in descending order', () => {
    const result = listDynamicSort(
      [...sampleList],
      'name',
      SORT_DIRECTION.DESCENDING,
    );
    expect(result).toEqual([
      {name: 'Charlie', duration: 30, date: '2024-09-25T10:30:00.000Z'},
      {name: 'Bob', duration: 28, date: '2023-06-20T14:45:00.000Z'},
      {name: 'Alice', duration: 25, date: '2023-01-15T08:15:00.000Z'},
    ]);
  });

  it('should sort by a numeric key in ascending order', () => {
    const result = listDynamicSort(
      [...sampleList],
      'duration',
      SORT_DIRECTION.ASCENDING,
    );
    expect(result).toEqual([
      {name: 'Alice', duration: 25, date: '2023-01-15T08:15:00.000Z'},
      {name: 'Bob', duration: 28, date: '2023-06-20T14:45:00.000Z'},
      {name: 'Charlie', duration: 30, date: '2024-09-25T10:30:00.000Z'},
    ]);
  });

  it('should sort by a numeric key in descending order', () => {
    const result = listDynamicSort(
      [...sampleList],
      'duration',
      SORT_DIRECTION.DESCENDING,
    );
    expect(result).toEqual([
      {name: 'Charlie', duration: 30, date: '2024-09-25T10:30:00.000Z'},
      {name: 'Bob', duration: 28, date: '2023-06-20T14:45:00.000Z'},
      {name: 'Alice', duration: 25, date: '2023-01-15T08:15:00.000Z'},
    ]);
  });

  it('should sort by a date key in ascending order', () => {
    const result = listDynamicSort(
      [...sampleList],
      'date',
      SORT_DIRECTION.ASCENDING,
    );
    expect(result).toEqual([
      {name: 'Alice', duration: 25, date: '2023-01-15T08:15:00.000Z'},
      {name: 'Bob', duration: 28, date: '2023-06-20T14:45:00.000Z'},
      {name: 'Charlie', duration: 30, date: '2024-09-25T10:30:00.000Z'},
    ]);
  });

  it('should sort by a date key in descending order', () => {
    const result = listDynamicSort(
      [...sampleList],
      'date',
      SORT_DIRECTION.DESCENDING,
    );
    expect(result).toEqual([
      {name: 'Charlie', duration: 30, date: '2024-09-25T10:30:00.000Z'},
      {name: 'Bob', duration: 28, date: '2023-06-20T14:45:00.000Z'},
      {name: 'Alice', duration: 25, date: '2023-01-15T08:15:00.000Z'},
    ]);
  });

  it('should handle missing keys gracefully', () => {
    const listWithMissingKeys = [
      {name: 'Charlie', duration: 30, date: '2024-09-25T10:30:00.000Z'},
      {duration: 25},
      {name: 'Bob', duration: 28, date: '2023-06-20T14:45:00.000Z'},
    ];

    const result = listDynamicSort(
      [...listWithMissingKeys],
      'name',
      SORT_DIRECTION.ASCENDING,
    );
    expect(result).toEqual([
      {duration: 25},
      {name: 'Bob', duration: 28, date: '2023-06-20T14:45:00.000Z'},
      {name: 'Charlie', duration: 30, date: '2024-09-25T10:30:00.000Z'},
    ]);
  });

  it('should handle an empty list', () => {
    const result = listDynamicSort([], 'name', SORT_DIRECTION.ASCENDING);
    expect(result).toEqual([]);
  });
});
