export const objFromArray = (arr, key = 'id') => arr.reduce((accumulator, current) => {
  accumulator[current[key]] = current;
  return accumulator;
}, {});
