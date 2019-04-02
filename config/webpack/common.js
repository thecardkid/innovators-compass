const path = require('path');

const { root, jsxLoader, lessLoader, fileLoader } = require('./parts');

module.exports = () => ({
  entry: {
    consumer: path.resolve(root, 'src/consumer/containers/App.jsx'),
  },
  output: {
    path: path.resolve(root, 'public'),
    filename: '[name]_bundle.js',
  },
  module: {
    rules: [
      jsxLoader(),
      lessLoader(),
      fileLoader(),
    ],
  },
});
