const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const merge = require('webpack-merge');

const commonConfig = require('./common');

const devConfig = () => merge(
  commonConfig(),
  {
    watch: true,
    devtool: 'eval',
    mode: 'development',
    plugins: [
      new WebpackBar(),
      new webpack.DefinePlugin({
        __DEV__: true,
        GA_TRACKING_ID: null,
        'process.env': {
          HOST: JSON.stringify('http://localhost:8080'),
          S3_URL: JSON.stringify('https://s3.us-east-2.amazonaws.com/innovatorscompass'),
          NODE_ENV: JSON.stringify('dev'),
        }
      }),
    ],
  },
);

module.exports = devConfig;
