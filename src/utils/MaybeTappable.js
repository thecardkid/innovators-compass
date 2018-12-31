/**
 * Wrapper around react-tappable's Tappable component the
 * conditionally renders <Tappable> only if device is mobile/tablet.
 * The motivation is to prevent the callback to be called twice.
 * For example, this DOM element:
 *
 * <Tappable onTap={this.handle}>
 *   <div onClick={this.handle}>
 *     <p>Click me</p>
 *   </div>
 * </Tappable>
 *
 * will call `handle` twice when clicked in the browser (but only
 * once on mobile/tablet).
 */

import React from 'react';
import { isMobile } from 'react-device-detect';
import Tappable from 'react-tappable/lib/Tappable';

export default class MaybeTappable extends React.Component {
  render() {
    // TODO extend this method to accept and replace more synthetic events
    // right now it only replaces onClick with onTap
    if (isMobile) {
      return (
        <Tappable onTap={this.props.handleTapOrClick}>
          {this.props.children}
        </Tappable>
      );
    }

    return (
      <div onClick={this.props.handleTapOrClick}>
        {this.props.children}
      </div>
    );
  }
}
