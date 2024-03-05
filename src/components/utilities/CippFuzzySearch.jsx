// var _fuse = _interopRequireDefault(require('fuse.js'))
import Fuse from 'fuse.js'

function CippfuzzySearch(options) {
  const fuse = new Fuse(options, {
    keys: ['name', 'groupName', 'items.name'],
    threshold: 0.5,
    location: 0,
    ignoreLocation: true,
    useExtendedSearch: true,
    includeMatches: true,
    includeScore: true,
  })
  return function (value) {
    if (!value.length) {
      return options
    }

    return fuse.search(value).map((_ref) => {
      let { item } = _ref
      return item
    })
  }
}
export default CippfuzzySearch
