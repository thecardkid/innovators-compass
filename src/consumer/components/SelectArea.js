import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';

import { EDITING_MODE } from '../../../lib/constants';

class SelectArea extends Component {
  constructor() {
    super();

    this.notePositions = {};
    this.highlighted = new Set();
  }

  componentWillUpdate(nextProps) {
    if (!nextProps.show || this.ignoreUpdate) return;

    this.notePositions = {};
    this.highlighted.clear();
    this.originallyVisualMode = this.props.visualMode;

    const notes = $('.ic-sticky-note');
    _.each(notes, (note, idx) => {
      if (note.className.includes('draft')) return;

      const { top, left } = note.style;
      const width = note.offsetWidth;
      const height = note.offsetHeight;

      const topNumber = Number(top.substring(0, top.length - 2));
      const leftNumber = Number(left.substring(0, left.length - 2));

      this.notePositions[idx] = {
        left: leftNumber,
        top: topNumber,
        right: leftNumber + width,
        bottom: topNumber + height,
      };
    });

    $(window).on('mousemove', this.onMouseMove);
    $(window).on('mouseup', this.onMouseUp);
    const { x, y } = nextProps.show;
    if (nextProps.show.x && nextProps.show.y) {
      this.anchorX = x;
      this.anchorY = y;
      this.css = {};

      this.prevDiffX = 0;
      this.prevDiffY = 0;
    }
  }

  highlightNotes(css) {
    let top, left, bottom, right;

    if (css.right) {
      right = this.props.ui.vw - css.right;
      left = right - css.width;
    } else if (css.left) {
      right = css.left + css.width;
      left = css.left;
    }

    if (css.top) {
      bottom = css.top + css.height;
      top = css.top;
    } else if (css.bottom) {
      bottom = this.props.ui.vh - css.bottom;
      top = bottom - css.height;
    }

    _.each(this.notePositions, (pos, id) => {
      if (pos.left < right && pos.right > left && pos.top < bottom && pos.bottom > top) {
        this.highlighted.add(id);
      } else {
        this.highlighted.delete(id);
      }
    });
  }

  onMouseUp = (ev) => {
    ev.preventDefault();
    if (this.highlighted.size > 0) {
      if (!this.originallyVisualMode) {
        this.ignoreUpdate = true;
        this.props.uiX.visualMode(this.props.numNotes);
      }

      this.highlighted.forEach(noteIdx => {
        let i = noteIdx;
        if (!this.originallyVisualMode) {
          i -= this.props.numDrafts;
        }
        this.props.workspaceX.ensureSelectNote(i);
      });
      this.ignoreUpdate = false;
    }

    $(window).off('mousemove', this.onMouseMove);
    $(window).off('mouseup', this.onMouseUp);
    $('#select-area').removeAttr('style');
    this.props.done();
  };

  onMouseMove = (ev) => {
    if (!this.props.show) return;

    ev.preventDefault();
    const { clientX: x, clientY: y } = ev;

    const diffX = x - this.anchorX;
    const diffY = y - this.anchorY;
    const css = {...this.css};

    if (diffX < 0 && this.prevDiffX >= 0) {
      css.right = this.props.ui.vw - this.anchorX;
      delete css.left;
    } else if (diffX > 0 && this.prevDiffX <= 0) {
      css.left = this.anchorX;
      delete css.right;
    }

    if (diffY < 0 && this.prevDiffY >= 0) {
      css.bottom = this.props.ui.vh - this.anchorY;
      delete css.top;
    } else if (diffY > 0 && this.prevDiffY <= 0) {
      css.top = this.anchorY;
      delete css.bottom;
    }

    css.width = Math.abs(x - this.anchorX);
    css.height = Math.abs(y - this.anchorY);

    this.highlightNotes(css);

    this.css = css;
    this.prevDiffX = diffX;
    this.prevDiffY = diffY;

    $('#select-area').removeAttr('style').css(css);
  };

  render() {
    if (!this.props.show) return null;

    return (
      <div id={'select-area-container'}>
        <div id={'select-area'} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ui: state.ui,
    numDrafts: state.workspace.drafts.length,
    numNotes: state.notes.length,
    visualMode: state.ui.editingMode === EDITING_MODE.VISUAL,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
    workspaceX: bindActionCreators(workspaceX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectArea);
