import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import htmlparser from 'htmlparser2';

import { HOST } from '../../../../lib/constants';
import ToastSingleton from '../../../utils/Toast';

export default class GDocModal extends Component {
  constructor(props) {
    super(props);
    this.toast = ToastSingleton.getInstance();
  }

  dontClose(e) {
    e.stopPropagation();
  }

  close = () => {
    this.props.close();
  };

  getDefaultDocData() {
    const data = {
      link: '',
      topic: '',
      involved: '',
      authors: new Set(),
      observations: [],
      principles: [],
      ideas: [],
      experiments: [],
    };
    data.getQuadrant = function(x, y) {
      if (x < 0.5) {
        if (y < 0.5) {
          return this.principles;
        } else {
          return this.observations;
        }
      } else {
        if (y < 0.5) {
          return this.ideas;
        } else {
          return this.experiments;
        }
      }
    };
    return data;
  }

  getPreviewSection(header, notes) {
    if (notes.length > 0) {
      let bulletPoints = `
${header}:`;
      notes.forEach(point => {
        bulletPoints += `
    - ${point.text} (${point.user})
`;
      });
      return bulletPoints;
    }
    return '';
  }

  renderBulletPoint(note) {
    if (note.isImage) {
      return <p key={note.text}>- <a href={note.text}>image</a> ({note.user})</p>;
    }
    return <p key={note.text}>- {note.text} ({note.user})</p>;
  }

  renderPreview(data) {
    return (
      <div id={'doc-preview'}>
        <p>Link: <a href={data.link}>{data.link}</a></p>
        <br/>
        <b>Authors:</b> {Array.from(data.authors).join(', ')}
        <br/><br/>
        <b>Topic:</b> {data.topic}
        <br/><br/>
        <b>Who's Involved:</b> {data.involved}
        <br/><br/>
        <b>Observations:</b>
        {data.observations.map(this.renderBulletPoint)}
        <br/>
        <b>Principles:</b>
        {data.principles.map(this.renderBulletPoint)}
        <br/>
        <b>Ideas:</b>
        {data.ideas.map(this.renderBulletPoint)}
        <br/>
        <b>Experiments:</b>
        {data.experiments.map(this.renderBulletPoint)}
      </div>
    );
  }

  copyToClipboard = () => {
    const previewNode = document.getElementById('doc-preview');
    if (document.selection) {
      document.selection.empty();
      const range = document.body.createTextRange();
      range.moveToElementText(previewNode);
      range.select();
    } else if (window.getSelection) {
      window.getSelection().removeAllRanges();
      const range = document.createRange();
      range.selectNode(previewNode);
      window.getSelection().addRange(range);
    }
    document.execCommand('copy');
    this.toast.info('Contents copied to clipboard');
  };

  render() {
    if (isMobile) {
      return (
        <div id={'ic-backdrop'} onClick={this.close}>
          <div className={'ic-gdoc ic-dynamic-modal'} onClick={this.dontClose}>
            <div className={'contents'}>
              <div className={'header'}>
                <h1 className={'title'}>Export to Google Doc</h1>
                <button className={'ic-close-window'} onClick={this.close}>X</button>
              </div>
              <div className={'warning'}>
                <b>NOTE:</b> This feature is not available on mobile/tablet. Please access this workspace on your desktop instead.
              </div>
            </div>
          </div>
        </div>
      );
    }

    const docData = this.getDefaultDocData();
    docData.link = `${HOST}/compass/view/${this.props.compass.viewCode}`;
    docData.topic = this.props.compass.topic;
    docData.involved = this.props.compass.center;
    this.props.notes.forEach(n => {
      if (n.doodle) return;
      let raw = '';
      const parser = new htmlparser.Parser({
        ontext: (text) => raw += text,
      }, { decodeEntities: true });
      parser.write(n.text);
      parser.end();
      docData.getQuadrant(n.x, n.y).push({
        text: raw,
        isImage: n.isImage,
        user: n.user,
      });
      docData.authors.add(n.user);
    });

    return (
      <div id={'ic-backdrop'} onClick={this.close}>
        <div className={'ic-gdoc ic-dynamic-modal'} onClick={this.dontClose}>
          <div className={'contents'}>
            <div className={'header'}>
              <h1 className={'title'}>Export to Google Doc</h1>
              <button className={'ic-close-window'} onClick={this.close}>X</button>
            </div>
            <div className={'warning'}>
              <b>NOTE:</b> Doodles will not be included. All formatting (bold, italics, ...) will be omitted.
            </div>
            <div className={'copy-to-clipboard'}>
              <button onClick={this.copyToClipboard}>
                Copy to Clipboard
              </button>
            </div>
            {this.renderPreview(docData)}
          </div>
        </div>
      </div>
    );
  }
}
