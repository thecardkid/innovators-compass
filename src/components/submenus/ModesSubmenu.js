import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ModalSingleton from '../../utils/Modal';
import SocketSingleton from '../../utils/Socket';
import MaybeTappable from '../../utils/MaybeTappable';

import * as uiX from '../../actions/ui';

import { EDITING_MODE } from '../../../lib/constants';

class ModesSubmenu extends Component {
  constructor() {
    super();
    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  alertExplainModes = () => {
    this.modal.alertExplainModes();
    this.props.hideMenu();
  };

  render() {
    const { normal, compact, bulk } = this.props;

    return (
      <div className={'ic-menu ic-modes-submenu'}>
        <section className={'border-bottom'}>
          <MaybeTappable handleTapOrClick={this.props.changeMode('standard')}>
            <div id={'ic-standard'} className={'ic-menu-item'}>
              <span className={normal ? 'active' : 'inactive'} />
              Standard
              <span className={'ic-shortcut'}>shift+1</span>
            </div>
          </MaybeTappable>
          <MaybeTappable handleTapOrClick={this.props.changeMode('compact')}>
            <div id={'ic-compact'} className={'ic-menu-item'}>
              <span className={compact ? 'active' : 'inactive'} />
              Compact
              <span className={'ic-shortcut'}>shift+2</span>
            </div>
          </MaybeTappable>
          <MaybeTappable handleTapOrClick={this.props.changeMode('bulk')}>
            <div id={'ic-bulk'} className={'ic-menu-item'}>
              <span className={bulk ? 'active' : 'inactive'} />
              Bulk Edit
              <span className={'ic-shortcut'}>shift+click</span>
            </div>
          </MaybeTappable>
        </section>
        <section>
          <div className={'ic-menu-item'} onClick={this.alertExplainModes}>
            <span className={'inactive'} />
            What are these?
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    normal: state.ui.editingMode === EDITING_MODE.NORMAL || false,
    compact: state.ui.editingMode === EDITING_MODE.COMPACT || false,
    bulk: state.ui.editingMode === EDITING_MODE.VISUAL || false,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModesSubmenu);
