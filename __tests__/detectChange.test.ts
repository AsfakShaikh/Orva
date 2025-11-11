import {detectChange} from '@helpers/detectChange';

describe('detectChange function', () => {
  describe('primitive values', () => {
    it('should detect changes in strings', () => {
      expect(detectChange('hello', 'world')).toBe(true);
      expect(detectChange('hello', 'hello')).toBe(false);
      expect(detectChange('', 'hello')).toBe(true);
      expect(detectChange('hello', '')).toBe(true);
    });

    it('should detect changes in numbers', () => {
      expect(detectChange(1, 2)).toBe(true);
      expect(detectChange(1, 1)).toBe(false);
      expect(detectChange(0, 1)).toBe(true);
      expect(detectChange(1, 0)).toBe(true);
    });

    it('should detect changes in booleans', () => {
      expect(detectChange(true, false)).toBe(true);
      expect(detectChange(false, true)).toBe(true);
      expect(detectChange(true, true)).toBe(false);
      expect(detectChange(false, false)).toBe(false);
    });

    it('should detect changes in null and undefined', () => {
      expect(detectChange(null, undefined)).toBe(true);
      expect(detectChange(undefined, null)).toBe(true);
      expect(detectChange(null, null)).toBe(false);
      expect(detectChange(undefined, undefined)).toBe(false);
    });
  });

  describe('objects', () => {
    it('should detect changes in flat objects', () => {
      const oldObj = {name: 'John', age: 30};
      const newObj = {name: 'Jane', age: 30};
      expect(detectChange(oldObj, newObj)).toBe(true);
    });

    it('should not detect changes when objects are identical', () => {
      const oldObj = {name: 'John', age: 30};
      const newObj = {name: 'John', age: 30};
      expect(detectChange(oldObj, newObj)).toBe(false);
    });

    it('should detect changes when properties are added', () => {
      const oldObj = {name: 'John'};
      const newObj = {name: 'John', age: 30};
      expect(detectChange(oldObj, newObj)).toBe(true);
    });

    it('should detect changes when properties are removed', () => {
      const oldObj = {name: 'John', age: 30};
      const newObj = {name: 'John'};
      expect(detectChange(oldObj, newObj)).toBe(true);
    });

    it('should not detect changes when only property order changes', () => {
      const oldObj = {name: 'John', age: 30};
      const newObj = {age: 30, name: 'John'};
      expect(detectChange(oldObj, newObj)).toBe(false); // Property order changes should not be detected as changes
    });

    it('should not detect changes when only property order changes in nested objects', () => {
      const oldObj = {
        user: {name: 'John', age: 30},
        settings: {theme: 'dark', language: 'en'},
      };
      const newObj = {
        settings: {language: 'en', theme: 'dark'},
        user: {age: 30, name: 'John'},
      };
      expect(detectChange(oldObj, newObj)).toBe(false);
    });
  });

  describe('arrays', () => {
    it('should detect changes in array elements', () => {
      const oldArray = [1, 2, 3];
      const newArray = [1, 2, 4];
      expect(detectChange(oldArray, newArray)).toBe(true);
    });

    it('should not detect changes when arrays are identical', () => {
      const oldArray = [1, 2, 3];
      const newArray = [1, 2, 3];
      expect(detectChange(oldArray, newArray)).toBe(false);
    });

    it('should detect changes when array length changes', () => {
      const oldArray = [1, 2, 3];
      const newArray = [1, 2, 3, 4];
      expect(detectChange(oldArray, newArray)).toBe(true);
    });

    it('should detect changes in nested arrays', () => {
      const oldArray = [
        [1, 2],
        [3, 4],
      ];
      const newArray = [
        [1, 2],
        [3, 5],
      ];
      expect(detectChange(oldArray, newArray)).toBe(true);
    });
  });

  describe('nested structures', () => {
    it('should detect changes in nested objects', () => {
      const oldData = {
        user: {
          name: 'John',
          address: {
            city: 'New York',
            country: 'USA',
          },
        },
      };
      const newData = {
        user: {
          name: 'John',
          address: {
            city: 'Los Angeles',
            country: 'USA',
          },
        },
      };
      expect(detectChange(oldData, newData)).toBe(true);
    });

    it('should detect changes in mixed structures', () => {
      const oldData = {
        users: [
          {name: 'John', age: 30},
          {name: 'Jane', age: 25},
        ],
        settings: {
          theme: 'dark',
          notifications: true,
        },
      };
      const newData = {
        users: [
          {name: 'John', age: 31}, // age changed
          {name: 'Jane', age: 25},
        ],
        settings: {
          theme: 'dark',
          notifications: true,
        },
      };
      expect(detectChange(oldData, newData)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects and arrays', () => {
      expect(detectChange({}, {})).toBe(false);
      expect(detectChange([], [])).toBe(false);
      expect(detectChange({}, [])).toBe(true);
      expect(detectChange([], {})).toBe(true);
    });

    it('should handle functions (JSON.stringify converts them to undefined)', () => {
      const oldData = {fn: () => {}};
      const newData = {fn: () => {}};
      expect(detectChange(oldData, newData)).toBe(false); // Both become {fn: undefined}
    });

    it('should handle circular references gracefully', () => {
      const obj1: any = {name: 'test'};
      obj1.self = obj1;

      const obj2: any = {name: 'test'};
      obj2.self = obj2;

      // Should handle circular references gracefully without throwing
      expect(() => detectChange(obj1, obj2)).not.toThrow();
      expect(detectChange(obj1, obj2)).toBe(false); // Should consider them equal
    });

    it('should handle different data types', () => {
      expect(detectChange('string', 123)).toBe(true);
      expect(detectChange(123, true)).toBe(true);
      expect(detectChange(true, [])).toBe(true);
      expect(detectChange([], {})).toBe(true);
    });

    it('should handle undefined and null inputs', () => {
      expect(detectChange(undefined, null)).toBe(true);
      expect(detectChange(null, undefined)).toBe(true);
      expect(detectChange(undefined, undefined)).toBe(false);
      expect(detectChange(null, null)).toBe(false);
    });
  });

  describe('real-world scenarios', () => {
    it('should detect changes in user profile data', () => {
      const oldProfile = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        preferences: {
          theme: 'dark',
          language: 'en',
        },
      };
      const newProfile = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com', // email changed
        preferences: {
          theme: 'dark',
          language: 'en',
        },
      };
      expect(detectChange(oldProfile, newProfile)).toBe(true);
    });

    it('should detect changes in form data', () => {
      const oldFormData = {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        hobbies: ['reading', 'gaming'],
      };
      const newFormData = {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        hobbies: ['reading', 'gaming', 'cooking'], // new hobby added
      };
      expect(detectChange(oldFormData, newFormData)).toBe(true);
    });
  });
});
