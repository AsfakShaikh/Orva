import {useEffect, useState} from 'react';

export default function useDebounce(
  value: string | boolean,
  delay = 500,
): string | boolean {
  const [debounceVal, setDebounceVal] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceVal(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay, value]);

  return debounceVal;
}
