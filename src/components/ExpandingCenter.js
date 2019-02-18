import React, { Component } from 'react';
import _ from 'underscore';

class ExpandingCenter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: true,
    };
  }

  expandCenter = () => {
    this.setState({ expanded: true });
  };

  collapseCenter = () => {
    this.setState({ expanded: false });
  };

  render() {
    if (!this.state.expanded) {
      return (
        <div id={'center'}
             data-tip={'Click to collapse. Double-click to edit'}
             data-for="center-tooltip"
             className={'collapsed'}
             onClick={this.expandCenter}
             style={{
               ...this.props.getCSSPosition(40),
               cursor: this.props.canEdit ? 'pointer' : 'auto',
             }}
             onDoubleClick={this.props.canEdit ? this.props.showPeopleGroupsModal : _.noop} >
          <i className={'material-icons'}>people</i>
        </div>
      );
    }

    return (
      <div id={'center'}
           className={'expanded'}
           style={{
             ...this.props.getCSSPosition(250),
             cursor: this.props.canEdit ? 'pointer' : 'auto',
           }}
           onDoubleClick={this.props.canEdit ? this.props.showPeopleGroupsModal : _.noop} >
        <i className={'material-icons close'} onClick={this.collapseCenter}>call_received</i>
        <div className={'text'}>
          {this.props.peopleGroups.map(pg => (
            <div key={pg}>{pg}</div>
          ))}
        </div>
      </div>
    );
  }
}

export default ExpandingCenter;
