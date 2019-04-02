import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ReactTooltip from 'react-tooltip';

import * as uiX from '../../actions/ui';

import ModalSingleton from '../../../utils/Modal';
import SocketSingleton from '../../../utils/Socket';
import FormPalette from './FormPalette';

class TextForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style: {
        ...props.defaultStyle,
      },
      color: props.bg,
      text: props.defaultText || '',
      // text includes HTML tags, which allows users to
      // save visually empty notes (perceived string lenth
      // is 0 but actual string length is > 0).
      effectiveText: props.defaultText,
    };

    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  setColor = (color) => {
    this.setState({ color });
    this.props.uiX.changeFormColor(color);
  };

  componentDidMount() {
    this.refs.quill.focus();
  }

  handleChange = (text, delta, source, editor) => {
    this.setState({ text, effectiveText: editor.getText() });
  };

  submit = (isDraft) => () => {
    const { text, effectiveText } = this.state;

    // No text edit was made
    if (effectiveText === text) {
      this.props.submit(text, false, this.state, isDraft);
      return;
    }

    if (effectiveText.trim().length === 0) return;

    this.props.submit(text, false, this.state, isDraft);
  };

  renderStyleToolbar() {
    return (
      <div id={'ic-toolbar'}>
        <div className="ic-text-ibu">
          <button name="strike" className={'ql-strike'} />
          <button name="underline" className={'ql-underline'} />
          <button name="italic" className={'ql-italic'} />
          <button name="bold" className={'ql-bold'} />
          <button name="link" className={'ql-link'} />
          {this.props.colors &&
            <FormPalette color={this.state.color} setColor={this.setColor}/>
          }
        </div>
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
                data-for="draft-tooltip">
          Draft
        </button>
        <ReactTooltip id={'draft-tooltip'} place={'bottom'} effect={'solid'} delayShow={500}/>
      </div>
    );
  };

  backdropMouseDown = (e) => {
    if (e.target.id === 'ic-backdrop') {
      this.mouseDown = true;
    }
  };

  close = (e) => {
    if (this.mouseDown && e.target.id === 'ic-backdrop') {
      this.props.close();
    }
    this.mouseDown = false;
  };

  render() {
    const submitText = this.props.switch ? 'Publish' : 'Save';

    return (
      <div id={'ic-backdrop'} onMouseDown={this.backdropMouseDown} onMouseUp={this.close}>
        <div className="ic-form" id="ic-note-form" onClick={this.dontClose}>
          <div className="contents">
            <div className="header">
              <h1 className={'title'}>{this.props.title}</h1>
              {this.renderStyleToolbar()}
            </div>
            <ReactQuill value={this.state.text}
                        onChange={this.handleChange}
                        ref={'quill'}
                        id={'ic-form-text'}
                        selection={{start:0, end:0}}
                        modules={{
                          toolbar: {
                            container: '#ic-toolbar',
                          },
                        }}
                        formats={[
                            'background',
                            'bold',
                            'italic',
                            'underline',
                            'strike',
                            'link',
                        ]}
                        style={{ background: this.state.color }}
            />
            <div className="note-form-footer">
              {this.props.switch && this.renderSwitches()}
              <button name="ship" onClick={this.submit(false)}>{submitText}</button>
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
