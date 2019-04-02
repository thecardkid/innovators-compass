import React, { Component } from 'react';

import SocketSingleton from '../../../utils/Socket';
import ToastSingleton from '../../../utils/Toast';

import { REGEX } from '../../../../lib/constants';

export default class FeedbackModal extends Component {
  constructor(props) {
    super(props);
    this.toast = ToastSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  dontClose(e) {
    e.stopPropagation();
  }

  close = () => {
    this.props.close();
  };

  submitFeedback = () => {
    const email = this.refs.email.value;
    const note = this.refs.note.value;

    if (email && !REGEX.EMAIL.test(email)) {
      this.toast.warn('Please check the email you provided');
      return;
    }

    if (!note) {
      this.toast.warn('Please include some text in the note');
      return;
    }

    this.socket.emitSendFeedback(email, note);
    this.props.close();
  };

  render() {
    return (
      <div id={'ic-backdrop'} onClick={this.close}>
        <div className={'ic-feedback ic-dynamic-modal'} onClick={this.dontClose}>
          <div className={'contents'}>
            <div className={'header'}>
              <h1 className={'title'}>I'd love to hear from you!</h1>
              <button className={'ic-close-window'} onClick={this.close}>X</button>
            </div>
            <div className={'explain'}>
              Have an idea for a new feature? Or saw something go wrong that shouldn't have? Leave me a note, and I'll get back to you as soon as I can!
              <br/><br/>
              You don't have to include your email, but I would understand your feedback much better if I could reach out to you directly about it.
            </div>
            <input placeholder={'Your email (optional)'}
                   ref={'email'}
                   autoFocus
                   className={'feedback-email disable-shortcuts'} />
            <textarea placeholder={'Your note...'}
                      ref={'note'}
                      className={'feedback-note disable-shortcuts'} />
            <div className={'send'}>
              <button onClick={this.submitFeedback}>Send</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
