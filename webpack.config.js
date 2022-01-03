module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: [
          {
            //needed to chain sourcemaps.  see: https://webpack.js.org/loaders/source-map-loader/
            loader: 'source-map-loader',
            options: {
              filterSourceMappingUrl: (url, resourcePath) => {
                if (/.*\/node_modules\/.*/.test(resourcePath)) {
                  return false
                }
                return true
              }
            }
          }
        ],
      }
    ]
  }     
}