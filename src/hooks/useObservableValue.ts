import {useEffect, useRef, useState} from 'react';
import {BehaviorSubject} from 'rxjs';

function useObservableValue(observer$: BehaviorSubject<any>) {
  const observerRef = useRef(observer$);
  const [value, setValue] = useState(observer$.getValue());

  useEffect(() => {
    const subscription = observerRef.current.subscribe(setValue);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return value;
}

export default useObservableValue;
