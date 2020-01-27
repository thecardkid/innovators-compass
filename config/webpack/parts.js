const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const root = path.resolve(__dirname, '../../');

const jsxLoader = () => ({
  test: /\.jsx?/,
  include: path.resolve(root, 'src'),
  loader: 'babel-loader',
  query: {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
    ],
    plugins: [
      '@babel/plugin-proposal-async-generator-functions',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-transform-runtime',
    ],
  },
});

const lessLoader = () => ({
  test: /\.less$/,
  include: path.resolve(root, 'src/css'),
  use: [
    {
      loader: 'style-loader'
    },
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
      },
    },
    {
      loader: 'less-loader'
    },
  ],
});

const fileLoader = () => ({
  test: /\.(png|jpg|jpeg|mp4)$/,
  include: path.resolve(root, 'public/static'),
  loader: 'file-loader',
});

const uglifyJsPlugin = () => new UglifyJsPlugin({
  uglifyOptions: {
    ecma: 8,
    ie8: false,
    safari10: false,
    sourceMap: true,
    mangle: true,
    output: {
      comments: false,
      beautify: false,
    },
    exclude: [/\.min\.js$/gi]
  },
});

const compressionPlugin = () => new CompressionPlugin({
  filename: '[path].gz[query]',
  algorithm: 'gzip',
  test: /\.js$|\.css$|\.html$/,
  threshold: 1024 * 10,
  minRatio: 0,
});

module.exports = {
  root,
  jsxLoader,
  lessLoader,
  fileLoader,
  uglifyJsPlugin,
  compressionPlugin,
};
