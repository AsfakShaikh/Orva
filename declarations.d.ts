declare module '*.svg' {
  import React from 'react';
  import {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Jest global types
declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any> {
      (...args: Y): T;
      mock: {
        calls: Y[];
        instances: T[];
        contexts: T[];
        results: Array<{
          type: 'return' | 'throw';
          value: T;
        }>;
        lastCall: Y;
      };
      mockClear(): Mock<T, Y>;
      mockReset(): Mock<T, Y>;
      mockRestore(): Mock<T, Y>;
      mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
      mockImplementationOnce(fn: (...args: Y) => T): Mock<T, Y>;
      mockReturnThis(): Mock<T, Y>;
      mockReturnValue(value: T): Mock<T, Y>;
      mockReturnValueOnce(value: T): Mock<T, Y>;
      mockResolvedValue(value: T extends Promise<infer U> ? U : T): Mock<T, Y>;
      mockResolvedValueOnce(
        value: T extends Promise<infer U> ? U : T,
      ): Mock<T, Y>;
      mockRejectedValue(value: T extends Promise<infer U> ? U : T): Mock<T, Y>;
      mockRejectedValueOnce(
        value: T extends Promise<infer U> ? U : T,
      ): Mock<T, Y>;
    }

    type MockedFunction<T extends (...args: any[]) => any> = Mock<
      ReturnType<T>,
      Parameters<T>
    >;
  }

  const describe: (name: string, fn: () => void) => void;
  const test: (name: string, fn: () => void | Promise<void>) => void;
  const it: (name: string, fn: () => void | Promise<void>) => void;
  const expect: any;
  const beforeEach: (fn: () => void | Promise<void>) => void;
  const afterEach: (fn: () => void | Promise<void>) => void;
  const beforeAll: (fn: () => void | Promise<void>) => void;
  const afterAll: (fn: () => void | Promise<void>) => void;
  const jest: any;
}
