var _fuse = _interopRequireDefault(require('fuse.js'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

function CippfuzzySearch(options) {
  var fuse = new _fuse['default'](options, {
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
