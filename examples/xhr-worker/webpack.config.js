const path = require('path')

module.exports = {
  entry: './main.js',
  output: {
    path: path.resolve(__dirname),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      '@uppy': path.resolve(__dirname, '../../packages/@uppy')
    }
  },
  module: {
    rules: [
      {
        test: /worker\.js$/,
        use: { loader: 'worker-loader' }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    port: 9966
  },
  mode: 'development'
}
