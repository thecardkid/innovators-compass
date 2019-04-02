import React, { Component } from 'react';

import Socket from '../../../utils/Socket';

import TextForm from './TextForm';

export default class EditTextForm extends Component {
  constructor() {
    super();
    this.socket = Socket.getInstance();
  }

  edit = (text, isImage, { style, color }) => {
    if (!text) return;

    const edited = {
      ...this.props.info,
      text,
      isImage,
      style,
      color,
    };
    const { idx } = edited;
    delete edited.idx;

    this.socket.emitMetric('note edit');
    this.props.ship(edited, idx);
    this.props.close();
  };

  render() {
    return (
      <TextForm title={this.props.title}
                defaultStyle={this.props.info.style}
                defaultText={this.props.info.text}
                submit={this.edit}
                close={this.props.close}
                bg={this.props.info.color}
                switch={false}
                colors={!this.props.info.draft}
      />
    );
  }
}
