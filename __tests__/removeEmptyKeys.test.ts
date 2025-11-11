import removeEmptyKeys from '@helpers/removeEmptyKeys';

describe('removeEmptyKeys', () => {
  it('should remove null and undefined values from a flat object', () => {
    const input = {a: 1, b: null, c: undefined, d: 'hello'};
    const expected = {a: 1, d: 'hello'};
    expect(removeEmptyKeys(input)).toEqual(expected);
  });

  it('should remove null and undefined values from a nested object', () => {
    const input = {
      a: 1,
      b: {c: 2, d: null, e: undefined, f: {g: null, h: 'world'}},
      i: undefined,
    };
    const expected = {
      a: 1,
      b: {c: 2, f: {h: 'world'}},
    };
    expect(removeEmptyKeys(input)).toEqual(expected);
  });

  it('should handle objects with no null or undefined values', () => {
    const input = {a: 1, b: {c: 2, d: {e: 'hello'}}};
    const expected = {a: 1, b: {c: 2, d: {e: 'hello'}}};
    expect(removeEmptyKeys(input)).toEqual(expected);
  });

  it('should return an empty object if all values are null or undefined', () => {
    const input = {a: null, b: undefined, c: {d: undefined, e: null}};
    const expected = {c: {}};
    expect(removeEmptyKeys(input)).toEqual(expected);
  });

  it('should not modify non-object types', () => {
    const input = 42;
    const expected = 42;
    expect(removeEmptyKeys(input)).toBe(expected);

    const inputString = 'hello';
    const expectedString = 'hello';
    expect(removeEmptyKeys(inputString)).toBe(expectedString);
  });
});
