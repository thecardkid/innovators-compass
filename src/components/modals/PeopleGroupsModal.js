import React, { Component } from 'react';

import ToastSingleton from '../../utils/Toast';

export default class PeopleGroupsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    if (props.defaultPeopleGroups.length > 0) {
      this.state.peopleGroups = props.defaultPeopleGroups;
    } else {
      this.state.peopleGroups = [''];
    }

    this.toast = ToastSingleton.getInstance();
  }

  dontClose(e) {
    e.stopPropagation();
  }

  close = () => {
    this.props.close();
  };

  addPeopleGroup = () => {
    this.setState({
      peopleGroups: [...this.state.peopleGroups, ''],
    });
  };

  setPeopleGroup = (idx) => (e) => {
    const tmp = this.state.peopleGroups;
    tmp[idx] = e.target.value;
    this.setState({ peopleGroups: tmp });
  };

  removePeopleGroup = (idx) => () => {
    const tmp = this.state.peopleGroups;
    if (tmp.length === 1) {
      return;
    }
    tmp.splice(idx, 1);
    this.setState({ peopleGroups: tmp });
  };

  savePeopleGroups = () => {
    const { peopleGroups } = this.state;
    const valid = [];
    for (let i = 0; i < peopleGroups.length; i++) {
      if (peopleGroups[i].includes(';')) {
        this.toast.error('People group cannot contain the character ";"');
        return;
      } else if (peopleGroups[i].length === 0) {
        this.toast.warn('Empty field detected - ignored');
      } else {
        valid.push(peopleGroups[i]);
      }
    }
    if (valid.length === 0) {
      this.toast.error('There should be at least 1 people group!');
    }
    this.props.submit(valid);
    this.toast.info('Saved people groups');
    this.props.close();
  };

  renderInputs() {
    return (
      <div className={'people-group-inputs'}>
        {this.state.peopleGroups.map((value, idx) => {
          return (
            <div key={idx}
                 className={'people-group-input'}>
              <input ref={`input-${idx}`}
                     className={'people-group'}
                     value={value}
                     onChange={this.setPeopleGroup(idx)}
                     autoFocus={idx === this.state.peopleGroups.length - 1} />
              <i className={'material-icons'} onClick={this.removePeopleGroup(idx)}>delete</i>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <div id={'ic-backdrop'} onClick={this.close}>
        <div className={'ic-people-groups-modal ic-dynamic-modal'} onClick={this.dontClose}>
          <div className={'contents'}>
            <div className={'header'}>
              <h1 className={'title'}>1. Who's involved, including you?</h1>
            </div>
            <div>
              {this.renderInputs()}
              <div className={'add-people-group'} onClick={this.addPeopleGroup}>
                <i className={'material-icons'}>add</i>
                <span>Add People Group</span>
              </div>
              <div className={'actions'}>
                <button className={'save'} onClick={this.savePeopleGroups}>Save</button>
                <button className={'cancel'} onClick={this.props.close}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}