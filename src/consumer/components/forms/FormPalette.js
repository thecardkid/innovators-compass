import React, { Component } from 'react';
import _ from 'underscore';

import { STICKY_COLORS } from '../../../../lib/constants';

export default class FormPalette extends Component {
  state = {
    show: false,
  };

  setOrToggle = (val) => () => {
    this.setState({ show: val == null ? !this.state.show: val });
  };

  setColor = (color) => () => {
    this.props.setColor(color);
    this.setOrToggle(false)();
  };

  render() {
    const options = _.map(STICKY_COLORS, color => {
      return (
        <span style={{background: color}}
              key={color}
              onClick={this.setColor(color)}
              className={'ic-color'}
        />
      );
    });

    return (
      <div className={'ic-form-palette'}>
        <button style={{background: this.props.color}}
              className={'icon'}
              onBlur={this.setOrToggle(false)}
              onClick={this.setOrToggle()}>
          A
          {this.state.show &&
            <div className={'ic-options'}>
              {options}
            </div>
          }
        </button>
      </div>
    );
  }
}
