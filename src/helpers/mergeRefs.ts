import {MutableRefObject, RefCallback} from 'react';

export default function mergeRefs(
  ref: MutableRefObject<any>,
  callbackRef: RefCallback<any>,
) {
  if (typeof callbackRef === 'function') {
    return (node: any) => {
      ref.current = node;
      callbackRef(node);
    };
  }
  ref.current = callbackRef;
  return callbackRef;
}
