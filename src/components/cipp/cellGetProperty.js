export default function cellGetProperty(row, index, column, id) {
  if (typeof column.selector === 'function') {
    return column.selector(row)
  } else if (typeof column.selector === 'string') {
    // library itself does it complicated like:
    // https://github.com/jbetancur/react-data-table-component/blob/d52be9780ac176bb570834b27727ded9cccc3274/src/DataTable/util.ts#L68-L83
    // string based selectors will be removed in v8
    return column.selector?.split('.').reduce((acc, part) => {
      // O(n2) when querying for an array (e.g. items[0].name)
      // Likely, the object depth will be reasonable enough that performance is not a concern
      const arr = part.match(/[^\]\\[.]+/g)
      if (arr && arr.length > 1) {
        for (let i = 0; i < arr.length; i++) {
          return acc[arr[i]][arr[i + 1]]
        }
      }

      return acc[part]
    }, row)
  }
}
