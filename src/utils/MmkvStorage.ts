import {MMKV} from 'react-native-mmkv';
import {BehaviorSubject} from 'rxjs';

function createMmkvStorage() {
  const storage = new MMKV();

  const setItem = (key: string, value: string) => storage.set(key, value);

  const getItem = (key: string) => storage.getString(key);

  const removeItem = (key: string) => storage.delete(key);

  const clear = () => storage.clearAll();

  const init = (key: string, observer: BehaviorSubject<any>) => {
    const lastDataString = getItem(key);

    if (lastDataString) {
      observer.next(JSON.parse(lastDataString));
    }

    observer.subscribe(next => setItem(key, JSON.stringify(next)));
  };

  return {storage, setItem, getItem, removeItem, clear, init};
}

const MmkvStorage = createMmkvStorage();

export default MmkvStorage;
