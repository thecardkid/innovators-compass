import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ReactTooltip from 'react-tooltip';

import * as uiX from '../../actions/ui';

import { COLORS, MODALS, PROMPTS, REGEX } from '../../../lib/constants';
import ModalSingleton from '../../utils/Modal';
import SocketSingleton from '../../utils/Socket';
import FormPalette from './FormPalette';

class TextForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style: {
        bold: false,
        italic: false,
        underline: false,
        ...props.defaultStyle,
      },
      color: props.bg,
      charCount: (props.defaultText || '').length,
    };

    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  toggleStyle = (style) => () => {
    this.setState({
      style: {
        ...this.state.style,
        [style]: !this.state.style[style]
      },
    });
  };

  setColor = (color) => () => {
    this.setState({ color });
  };

  handleChange = () => {
    this.setState({ charCount: this.refs.text.value.length });
  };

  getText(cb) {
    let text = this.refs.text.value;
    if (!text) cb({});

    if (REGEX.URL.test(text)) {
      return this.modal.confirm(MODALS.IMPORT_IMAGE, (isImage) => cb({ text, isImage }));
    }

    if (text.length > 300) {
      this.toast.error(PROMPTS.POST_IT_TOO_LONG);
      return cb({});
    }

    cb({ text, isImage: false });
  }

  submit = (isDraft) => () => {
    this.getText(({ text, isImage }) => {
      this.props.submit(text, isImage, this.state, isDraft);
    });
  };

  renderStyleToolbar() {
    const selectedStyle = { background: COLORS.DARK, color: 'white' };

    return (
      <div>
        <div className="ic-text-ibu">
          <button name="underline"
                  style={this.state.style.underline ? selectedStyle : null}
                  onClick={this.toggleStyle('underline')}>
            <u>U</u>
          </button>
          <button name="italic"
                  style={this.state.style.italic ? selectedStyle : null}
                  onClick={this.toggleStyle('italic')}>
            <i>I</i>
          </button>
          <button name="bold"
                  style={this.state.style.bold ? selectedStyle : null}
                  onClick={this.toggleStyle('bold')}>
            <b>B</b>
          </button>
        </div>
        {this.props.colors && <FormPalette setColor={this.setColor}/>}
      </div>
    );
  }

  switchImage = () => {
    this.socket.emitMetric('switch text to image');
    this.props.uiX.switchToImage();
  };

  switchDoodle = () => {
    this.socket.emitMetric('switch text to doodle');
    this.props.uiX.switchToDoodle();
  };

  renderSwitches = () => {
    return (
      <div>
        <button className={'switch-form switch-image'}
                data-tip="Insert a photo"
                data-for="image-tooltip"
                onClick={this.switchImage}>
          <i className={'material-icons'}>photo</i>
        </button>
        <ReactTooltip id={'image-tooltip'} place={'bottom'} effect={'solid'}/>
        <button className={'switch-form switch-doodle'}
                data-tip="Create a sketch"
                data-for="doodle-tooltip"
                onClick={this.switchDoodle}>
          <i className={'material-icons'}>brush</i>
        </button>
        <ReactTooltip id={'doodle-tooltip'} place={'bottom'} effect={'solid'}/>
      </div>
    );
  };

  dontClose(e) {
    e.stopPropagation();
  }

  renderDraftButton = () => {
    return (
      <div>
        <button name={'draft'}
                onClick={this.submit(true)}
                data-tip="Drafts are invisible to others until you submit them"
                data-for="draft-tooltip"
        >Draft</button>
        <ReactTooltip id={'draft-tooltip'} place={'bottom'} effect={'solid'} delayShow={500}/>
      </div>
    );
  };

  render() {
    const spanStyle = { color: this.state.charCount > 300 ? 'red' : 'black' };

    let textStyle = '';
    if (this.state.style.bold) textStyle += 'bold ';
    if (this.state.style.italic) textStyle += 'italic ';
    if (this.state.style.underline) textStyle += 'underline';

    return (
      <div id={'ic-backdrop'} onClick={this.props.close}>
        <div className="ic-form" id="ic-note-form" onClick={this.dontClose}>
          <div className="contents">
            <div className="header">
              <h1 className={'title'}>
                {this.props.title}
                <span style={spanStyle}> {this.state.charCount}/300</span>
              </h1>
              {this.renderStyleToolbar()}
            </div>
            <textarea id="ic-form-text"
                      className={textStyle}
                      ref={'text'}
                      autoFocus
                      defaultValue={this.props.defaultText || ''}
                      onChange={this.handleChange}
                      style={{ background: this.state.color }}/>
            <div className="note-form-footer">
              {this.props.switch && this.renderSwitches()}
              <button name="ship" onClick={this.submit(false)}>Submit</button>
              {this.props.switch && this.renderDraftButton()}
              <button name="nvm" onClick={this.props.close}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(() => ({}), mapDispatchToProps)(TextForm);
