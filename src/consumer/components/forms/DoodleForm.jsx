import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as uiX from '../../actions/ui';

import Socket from '../../../utils/Socket';
import FormPalette from './FormPalette';

let paint = false;

class DoodleForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      color: props.info.color || props.bg,
      strokes: [],
      redoStack: [],
    };
    this.socket = Socket.getInstance();
  }

  setColor = (color) => {
    this.setState({ color });
    this.props.uiX.changeFormColor(color);
  };

  componentDidMount() {
    this.$canvas = $('#ic-doodle');
    $(document).on('touchstart', this.preventDefaultIfCanvas);
    $(document).on('touchmove', this.preventDefaultIfCanvas);
  }

  componentWillUnmount() {
    $(document).off('touchstart', this.preventDefaultIfCanvas);
    $(document).off('touchmove', this.preventDefaultIfCanvas);
  }

  componentDidUpdate() {
    this.drawCanvas();
  }

  preventDefaultIfCanvas(e) {
    if (e.target === document.getElementById('ic-doodle')) {
      e.preventDefault();
    }
  }

  beginStroke = (x, y) => {
    const { strokes } = this.state;
    strokes.push([{
      x: x - this.$canvas.offset().left,
      y: y - this.$canvas.offset().top,
    }]);
    this.setState({ strokes, redoStack: [] });
  };

  strokeTo = (x, y) => {
    const { strokes } = this.state;
    strokes[strokes.length -1].push({
      x: x - this.$canvas.offset().left,
      y: y - this.$canvas.offset().top,
    });
    this.setState({ strokes });
  };

  beginDraw = (e) => {
    paint = true;
    this.beginStroke(e.clientX, e.clientY);
  };

  draw = (e) => {
    if (paint) this.strokeTo(e.clientX, e.clientY);
  };

  stopDraw = () => {
    paint = false;
  };

  beginTouchDraw = (e) => {
    paint = true;
    this.beginStroke(e.touches[0].clientX, e.touches[0].clientY);
  };

  touchDraw = (e) => {
    if (paint) this.strokeTo(e.touches[0].clientX, e.touches[0].clientY);
  };

  undo = () => {
    const { strokes, redoStack } = this.state;
    if (strokes.length > 0) {
      redoStack.push(strokes.pop());
    }
    this.setState({ strokes, redoStack });
  };

  redo = () => {
    const { strokes, redoStack } = this.state;
    if (redoStack.length > 0) {
      strokes.push(redoStack.pop());
    }
    this.setState({ strokes, redoStack });
  };

  drawCanvas = () => {
    if (!this.$canvas) return;

    const ctx = this.refs.canvas.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;

    const { strokes } = this.state;

    _.each(strokes, stroke => {
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);

      _.each(stroke, point => {
        ctx.lineTo(point.x, point.y);
        ctx.moveTo(point.x, point.y);
      });

      ctx.closePath();
      ctx.stroke();
    });
  };

  submit = (isDraft) => () => {
    if (this.state.strokes.length === 0) return;
    this.socket.emitMetric('note doodle');
    const { x, y } = this.props.info;
    const note = {
      text: null,
      doodle: document.getElementById('ic-doodle').toDataURL(),
      color: this.state.color,
      user: this.props.user,
      x, y,
    };

    if (isDraft) this.props.asDraft(note);
    else this.props.asNote(note);
    this.props.close();
  };

  clearCanvas = () => {
    this.setState({ strokes: [], redoStack: [] });
  };

  switchText = () => {
    this.socket.emitMetric('switch doodle to text');
    this.props.uiX.switchToText();
  };

  switchImage = () => {
    this.socket.emitMetric('switch doodle to image');
    this.props.uiX.switchToImage();
  };

  dontClose(e) {
    e.stopPropagation();
  }

  render() {
    this.drawCanvas();

    return (
      <div id={'ic-backdrop'} onClick={this.props.close}>
        <div className="ic-form" id="ic-doodle-form" onClick={this.dontClose}>
          <div className={'contents'}>
            <div className={'header'}>
              <h1 className={'title'}>Create a sketch</h1>
              <div id={'ic-doodle-controls'}>
                <button name="clear" onClick={this.clearCanvas}>clear</button>
                <button name="redo" onClick={this.redo}>
                  <i className="material-icons">redo</i>
                </button>
                <button name="undo" onClick={this.undo}>
                  <i className="material-icons">undo</i>
                </button>
              </div>
              <FormPalette setColor={this.setColor} color={this.state.color}/>
            </div>
            <canvas id="ic-doodle"
                    ref="canvas"
                    width="410"
                    height="250"
                    onMouseDown={this.beginDraw}
                    onMouseMove={this.draw}
                    onMouseLeave={this.stopDraw}
                    onMouseUp={this.stopDraw}
                    onTouchStart={this.beginTouchDraw}
                    onTouchMove={this.touchDraw}
                    onTouchEnd={this.stopDraw}
                    style={{ background: this.state.color }}>
            </canvas>
            <div className="note-form-footer">
              <div>
                <button className={'switch-form switch-text'}
                        data-tip="Create a text note"
                        data-for="text-tooltip"
                        onClick={this.switchText}>
                  <i className={'material-icons'}>text_format</i>
                </button>
                <ReactTooltip id={'text-tooltip'} place={'bottom'} effect={'solid'}/>
                <button className={'switch-form switch-image'}
                        data-tip="Insert a photo"
                        data-for="doodle-tooltip"
                        onClick={this.switchImage}>
                  <i className={'material-icons'}>photo</i>
                </button>
                <ReactTooltip id={'doodle-tooltip'} place={'bottom'} effect={'solid'}/>
              </div>
              <button name="ship" onClick={this.submit(false)}>Publish</button>
              <button name={'draft'}
                      onClick={this.submit(true)}
                      data-tip="Drafts are invisible to others until you submit them"
                      data-for="draft-tooltip"
                      >Draft</button>
              <ReactTooltip id={'draft-tooltip'} place={'bottom'} effect={'solid'} delayShow={500}/>
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

export default connect(() => ({}), mapDispatchToProps)(DoodleForm);
