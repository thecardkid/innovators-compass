const path = require('path');

const { root, jsxLoader, lessLoader, fileLoader } = require('./parts');

module.exports = () => ({
  entry: path.resolve(root, 'src/consumer/containers/App.jsx'),
  output: {
    path: path.resolve(root, 'public'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      jsxLoader(),
      lessLoader(),
      fileLoader(),
    ],
  },
});
