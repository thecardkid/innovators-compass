import React, { Component } from 'react';

import TextForm from './TextForm';

import Socket from '../../../utils/Socket';

export default class CreateTextForm extends Component {
  constructor() {
    super();
    this.socket = Socket.getInstance();
  }

  make = (text, isImage, { style, color }, isDraft) => {
    if (!text) return;

    const { x, y } = this.props.info;
    let note = {
      text, isImage, x, y, style, color,
      doodle: null,
      user: this.props.user,
    };

    this.socket.emitMetric(`note ${isImage ? 'image' : 'create'}`);
    if (isDraft) this.props.asDraft(note);
    else this.props.asNote(note);
    this.props.close();
  };

  render() {
    return (
      <TextForm title={this.props.title}
                defaultText={''}
                submit={this.make}
                close={this.props.close}
                bg={this.props.info.color || this.props.bg}
                switch={true}
                colors={true}
      />
    );
  }
}
