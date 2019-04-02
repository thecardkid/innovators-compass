import React, { Component } from 'react';

import Socket from '../../../utils/Socket';
import ImageForm from './ImageForm';

export default class EditImageForm extends Component {
  constructor(props) {
    super(props);
    this.socket = Socket.getInstance();
  }

  edit = ({ imgSource, color, altText }) => {
    if (!imgSource) return;

    const edited = {
      ...this.props.info,
      text: imgSource,
      color, altText,
    };
    const { idx } = edited;
    delete edited.idx;

    this.socket.emitMetric('note image edit');
    this.props.ship(edited, idx);
    this.props.close();
  };

  render() {
    return (
      <ImageForm title={this.props.title}
                 defaultUrl={this.props.info.text}
                 defaultAlt={this.props.info.altText}
                 submit={this.edit}
                 close={this.props.close}
                 bg={this.props.info.color}
                 switch={false}
                 colors={!this.props.info.draft}
      />
    );
  }
}
