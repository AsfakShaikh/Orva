// Compares primitive values and handles null/undefined cases
function comparePrimitives(oldData: any, newData: any): boolean {
  // Handle null/undefined values
  if (oldData == null || newData == null) {
    return oldData !== newData;
  }

  // Handle primitive values and non-objects
  if (typeof oldData !== 'object' || typeof newData !== 'object') {
    return oldData !== newData;
  }

  return false; // Both are objects, continue with object comparison
}

// Compares two arrays for equality
function compareArrays(
  oldData: any[],
  newData: any[],
  visited: WeakSet<object>,
): boolean {
  // Check if both are arrays
  if (Array.isArray(oldData) !== Array.isArray(newData)) {
    return true;
  }

  // Compare array lengths
  if (oldData.length !== newData.length) {
    return true;
  }

  // Compare array elements
  for (let i = 0; i < oldData.length; i++) {
    if (detectChange(oldData[i], newData[i], visited)) {
      return true;
    }
  }
  return false;
}

// Compares two objects for equality
function compareObjects(
  oldData: any,
  newData: any,
  visited: WeakSet<object>,
): boolean {
  const oldKeys = Object.keys(oldData);
  const newKeys = Object.keys(newData);

  // Check if number of keys is different
  if (oldKeys.length !== newKeys.length) {
    return true;
  }

  // Create a Set for O(1) lookup instead of sorting
  const newKeysSet = new Set(newKeys);

  // Check if all keys exist in both objects
  for (const key of oldKeys) {
    if (!newKeysSet.has(key)) {
      return true;
    }
  }

  // Compare values for all keys
  for (const key of oldKeys) {
    const oldValue = oldData[key];
    const newValue = newData[key];

    // Handle functions specially
    if (typeof oldValue === 'function' || typeof newValue === 'function') {
      if (typeof oldValue !== typeof newValue) {
        return true;
      }
      // Both are functions, consider them equal
      continue;
    }

    if (detectChange(oldValue, newValue, visited)) {
      return true;
    }
  }

  return false;
}

/**
 * Detects changes between two data structures by performing deep comparison.
 *
 * This function is optimized for performance and handles various edge cases:
 * - Circular references (prevents infinite recursion)
 * - Property order independence for objects
 * - Early termination on first difference
 * - Efficient array and object comparison
 *
 * @param oldData - The original data structure
 * @param newData - The new data structure to compare against
 * @param visited - Internal parameter for tracking visited objects (prevents circular reference issues)
 * @returns true if the data structures are different, false if they are identical
 *
 * @example
 * ```typescript
 * // Basic comparison
 * detectChange({name: 'John'}, {name: 'Jane'}) // true
 * detectChange({name: 'John'}, {name: 'John'}) // false
 *
 * // Property order independence
 * detectChange({a: 1, b: 2}, {b: 2, a: 1}) // false
 *
 * // Array comparison
 * detectChange([1, 2, 3], [1, 2, 4]) // true
 * detectChange([1, 2, 3], [1, 2, 3]) // false
 * ```
 */
export function detectChange(
  oldData: any,
  newData: any,
  visited = new WeakSet(),
): boolean {
  // Early return for identical references
  if (oldData === newData) {
    return false;
  }

  // Handle primitive values and null/undefined
  const primitiveResult = comparePrimitives(oldData, newData);
  if (primitiveResult !== false) {
    return primitiveResult;
  }

  // Handle circular references
  if (visited.has(oldData) || visited.has(newData)) {
    return false; // Assume equal to prevent infinite recursion
  }

  // Add current objects to visited set
  visited.add(oldData);
  visited.add(newData);

  try {
    // Handle arrays
    if (Array.isArray(oldData) || Array.isArray(newData)) {
      return compareArrays(oldData, newData, visited);
    }

    // Handle objects
    return compareObjects(oldData, newData, visited);
  } finally {
    // Clean up visited set to prevent memory leaks
    visited.delete(oldData);
    visited.delete(newData);
  }
}
