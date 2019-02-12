import React, { Component } from 'react';

import ToastSingleton from '../../utils/Toast';

export default class PeopleGroupsModal extends Component {
  constructor(props) {
    super(props);
    this.state = { peopleGroups: [] };
    this.toast = ToastSingleton.getInstance();
  }

  dontClose(e) {
    e.stopPropagation();
  }

  close = () => {
    this.props.close();
  };

  render() {
    return (
      <div id={'ic-backdrop'} onClick={this.close}>
        <div className={'ic-people-groups ic-dynamic-modal'} onClick={this.dontClose}>
          <div className={'contents'}>
            <div className={'header'}>
              <h1 className={'title'}>1. Who's involved, including you?</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
