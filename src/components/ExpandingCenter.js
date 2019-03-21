import React, { Component } from 'react';
import _ from 'underscore';

class ExpandingCenter extends Component {
  render() {
    return (
      <div id={'center'}
           data-tip={'Click to view'}
           data-for="center-tooltip"
           className={'collapsed'}
           style={{
             ...this.props.getCSSPosition(40),
             cursor: this.props.canEdit ? 'pointer' : 'auto',
           }}
           onClick={this.props.canEdit ? this.props.showPeopleGroupsModal : _.noop} >
        <i className={'material-icons'}>people</i>
      </div>
    );
  }
}

export default ExpandingCenter;
