export function merge(...allObjects) {
  return allObjects.reduce((merge, obj) => {
    return Object.assign(merge, obj);
  }, {});
}
