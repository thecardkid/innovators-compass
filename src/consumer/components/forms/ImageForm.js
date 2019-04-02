import React, { Component } from 'react';
import DropzoneS3Uploader from 'react-dropzone-s3-uploader';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators } from 'redux';

import FormPalette from './FormPalette';

import * as uiX from '../../actions/ui';

import { REGEX, HOST, S3_URL } from '../../../../lib/constants';
import SocketSingleton from '../../../utils/Socket';
import ToastSingleton from '../../../utils/Toast';

const OneMB = 1024 * 1024;

class ImageForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgSource: props.defaultUrl || '',
      color: props.bg,
      progress: false,
      showAlt: (props.defaultAlt || '').length > 0,
      altText: props.defaultAlt || '',
    };
    this.socket = SocketSingleton.getInstance();
    this.toast = ToastSingleton.getInstance();
    this.driveUrlRegex = /https:\/\/drive\.google\.com\/file\/d\/.*\/view\?usp=sharing/;
  }

  updateImgSource = (e) => {
    const { value } = e.target;

    if (this.driveUrlRegex.test(value)) {
      const fileId = value.split('/')[5];
      const imgSource = `https://drive.google.com/thumbnail?id=${fileId}`;
      this.setState({ imgSource });
      return;
    }

    this.setState({ imgSource: value });
  };

  updateAlt = (e) => {
    this.setState({ altText: e.target.value });
  };

  setColor = (color) => {
    this.setState({ color });
    this.props.uiX.changeFormColor(color);
  };

  renderPreview = () => {
    let img;
    if (REGEX.URL.test(this.state.imgSource)) {
      img = <img src={this.state.imgSource} />;
    }

    return (
      <div className="preview">
        <div style={{minHeight: '10px'}}>
          <p>Preview</p>
          <span data-tip data-for="help-tooltip"><i className={'material-icons'}>help</i></span>
          <ReactTooltip id={'help-tooltip'} place={'top'} effect={'solid'} data-multiline={true}>
            <div className={'ic-image-help'}>
              <h1>Troubleshooting</h1>
              <p>
                If the image you are trying to upload is larger than 1MB, please upload to Google Drive first and link it from there.
              </p>
              <p>
                To insert an image from Google Drive, go that image and click on <u>Share > Get Shareable Link</u>, and use the link given (the link should end with "usp=sharing").
              </p>
              <p>
                To insert an image from Google Images, click once to expand the image, then <u>Right Click > Copy Image Address</u> and paste in the link.
              </p>
            </div>
          </ReactTooltip>
          {img}
        </div>
      </div>
    );
  };

  submit = (isDraft) => () => {
    this.props.submit(this.state, isDraft);
  };

  onImageUpload = (info) => {
    this.setState({ imgSource: info.fileUrl });
  };

  switchText = () => {
    this.props.uiX.switchToText();
  };

  switchDoodle = () => {
    this.props.uiX.switchToDoodle();
  };

  renderSwitches = () => {
    return (
      <div>
        <button className={'switch-form switch-text'}
                data-tip="Create a text note"
                data-for="text-tooltip"
                onClick={this.switchText}>
          <i className={'material-icons'}>text_format</i>
        </button>
        <ReactTooltip id={'text-tooltip'} place={'bottom'} effect={'solid'}/>
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

  dontClose(e) {
    e.stopPropagation();
  }

  onProgress = (percentage, textState) => {
    this.setState({
      progress: textState !== 'Upload completed',
    });
  };

  onRejected = (file) => {
    if (file.length < 0) return;

    if (file[0].size > OneMB) {
      this.toast.error('Image cannot be larger than 1MB');
    }
  };

  toggleAlt = () => {
    this.setState({ showAlt: !this.state.showAlt });
  };

  render() {
    const submitText = this.props.switch ? 'Publish' : 'Save';

    return (
      <div id={'ic-backdrop'} onClick={this.props.close}>
        <div className="ic-form" id="ic-image-form" onClick={this.dontClose}>
          <div className="contents">
            <div className="header">
              <h1 className="title">{this.props.title}</h1>
              <button id={'toggle-alt'}
                      className={this.state.showAlt ? 'active': ''}
                      onClick={this.toggleAlt}
                      data-tip
                      data-for={'alt-tooltip'}>
                Alt
              </button>
              <ReactTooltip id={'alt-tooltip'} place={'top'} effect={'solid'}>
                <div id={'alt-tooltip-div'}>
                  Alternative text is used by screen readers, search engines, or when the image cannot be loaded
                </div>
              </ReactTooltip>
              {this.props.colors && <FormPalette setColor={this.setColor} color={this.state.color}/>}
            </div>
            <textarea id="ic-form-text"
                      autoFocus
                      value={this.state.imgSource}
                      placeholder={'Paste image link here, or drag and drop file below'}
                      onChange={this.updateImgSource}
                      style={{ background: this.state.color }} />
            <DropzoneS3Uploader onFinish={this.onImageUpload}
                                onProgress={this.onProgress}
                                onDropRejected={this.onRejected}
                                s3Url={S3_URL}
                                upload={{server: HOST}}
                                maxSize={OneMB}
                                accept={'image/*'}
                                multiple={false}
                                name={'s3-uploader'} />
            {this.state.showAlt && <div>
              <textarea id={'ic-image-alt-text'}
                        placeholder={'Alternate text'}
                        value={this.state.altText}
                        onChange={this.updateAlt}
                        style={{ background: this.state.color }} />
              <p id={'ic-alt-text-label'}>
                This text will be used by screen readers, search engines, or when the image cannot be loaded
              </p>
            </div>}
            <span id={'s3-uploader-status'}>
              {this.state.progress ? 'Uploading...' : 'Drag and Drop'}
            </span>
            {this.renderPreview()}
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

export default connect(() => ({}), mapDispatchToProps)(ImageForm);
