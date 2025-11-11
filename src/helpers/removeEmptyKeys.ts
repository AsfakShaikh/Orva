export default function removeEmptyKeys(obj: any) {
  const objct = obj;
  if (typeof objct === 'object') {
    for (const key in objct) {
      if (objct[key] === null || objct[key] === undefined) {
        delete objct[key];
      } else if (typeof objct[key] === 'object') {
        removeEmptyKeys(obj[key]);
      }
    }
  }

  return objct;
}
