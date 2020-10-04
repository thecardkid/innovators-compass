import React from 'react';

export default class DevOnly extends React.Component {
  // webpack's DefinePlugin does not work inside react
  // lifecycle methods e.g. render. See
  // https://github.com/webpack/webpack/issues/1977
  isDev() {
    return false;
    // return __DEV__;;
  }

  render() {
    if (!this.isDev()) {
      return null;
    }

    return this.props.children;
  }
}
