import isNotNull from '@helpers/isNotNull';

describe('isNotNull', () => {
  it('should return true for valid string values', () => {
    expect(isNotNull('hello')).toBe(true);
    expect(isNotNull('')).toBe(true);
    expect(isNotNull('123')).toBe(true);
  });

  it('should return true for valid number values', () => {
    expect(isNotNull(42)).toBe(true);
    expect(isNotNull(0)).toBe(true);
    expect(isNotNull(-1)).toBe(true);
    expect(isNotNull(3.14)).toBe(true);
    expect(isNotNull(Infinity)).toBe(true);
    expect(isNotNull(-Infinity)).toBe(true);
  });

  it('should return true for valid boolean values', () => {
    expect(isNotNull(true)).toBe(true);
    expect(isNotNull(false)).toBe(true);
  });

  it('should return true for valid object values', () => {
    expect(isNotNull({})).toBe(true);
    expect(isNotNull({key: 'value'})).toBe(true);
    expect(isNotNull([])).toBe(true);
    expect(isNotNull([1, 2, 3])).toBe(true);
  });

  it('should return true for valid function values', () => {
    const testFunction = () => {};
    expect(isNotNull(testFunction)).toBe(true);
    expect(isNotNull(() => {})).toBe(true);
  });

  it('should return true for valid symbol values', () => {
    const testSymbol = Symbol('test');
    expect(isNotNull(testSymbol)).toBe(true);
  });

  it('should return true for valid Date values', () => {
    const testDate = new Date();
    expect(isNotNull(testDate)).toBe(true);
  });

  it('should return true for valid RegExp values', () => {
    const testRegex = /test/;
    expect(isNotNull(testRegex)).toBe(true);
  });

  it('should return false for null values', () => {
    expect(isNotNull(null)).toBe(false);
  });

  it('should return false for undefined values', () => {
    expect(isNotNull(undefined)).toBe(false);
  });

  it('should work with TypeScript type narrowing', () => {
    const testValue: string | null | undefined = 'test';

    if (isNotNull(testValue)) {
      // TypeScript should know that testValue is string here
      expect(typeof testValue).toBe('string');
      expect(testValue.toUpperCase()).toBe('TEST');
    }
  });

  it('should work with arrays containing null/undefined', () => {
    const testArray = [1, null, 'hello', undefined, 42];
    const filteredArray = testArray.filter(isNotNull);

    expect(filteredArray).toEqual([1, 'hello', 42]);
  });

  it('should work with objects containing null/undefined values', () => {
    const testObject = {
      name: 'John',
      age: 30,
      email: null,
      phone: undefined,
      address: '123 Main St',
    };

    const filteredEntries = Object.entries(testObject).filter(([_, value]) =>
      isNotNull(value),
    );
    const filteredObject = Object.fromEntries(filteredEntries);

    expect(filteredObject).toEqual({
      name: 'John',
      age: 30,
      address: '123 Main St',
    });
  });

  it('should handle edge cases with falsy values', () => {
    // These should all return true because they are not null or undefined
    expect(isNotNull(0)).toBe(true);
    expect(isNotNull('')).toBe(true);
    expect(isNotNull(false)).toBe(true);
    expect(isNotNull(NaN)).toBe(true);
  });

  it('should work with generic types', () => {
    const stringValue: string | null | undefined = 'test';
    const numberValue: number | null | undefined = 42;
    const objectValue: {key: string} | null | undefined = {key: 'value'};

    expect(isNotNull(stringValue)).toBe(true);
    expect(isNotNull(numberValue)).toBe(true);
    expect(isNotNull(objectValue)).toBe(true);
  });
});
