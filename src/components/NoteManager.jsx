import interact from 'interactjs';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import StickyNote from './StickyNote.jsx';

import * as noteX from '../actions/notes';
import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';
import Socket from '../utils/Socket';
import Toast from '../utils/Toast';
import { EDITING_MODE } from '../../backend/lib/constants';

class NoteManager extends Component {
  constructor() {
    super();
    this.notes = [];
    this.toast = Toast.getInstance();

    this.socket = Socket.getInstance();
    this.socket.subscribe({
      'update notes': this.onUpdateNotes,
      'deleted notes': this.onDeleteNotes,
    });

    interact('.draggable').draggable({
      restrict: {
        restriction: 'parent',
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
      },
      autoScroll: true,
      onstart: this.dragStart,
      onmove: this.dragTarget,
      onend: this.dragEnd,
    });
  }

  onUpdateNotes = (notes) => {
    this.props.noteX.updateAll(notes);

    if (this.props.visualMode) {
      this.props.workspaceX.updateSelected(notes.length);
    }

    _.each(notes, (note, idx) => {
      this.setTranslation(document.getElementById(`note${idx}`), 0, 0);
    });
  };

  onDeleteNotes = (deletedIdx) => {
    if (this.props.visualMode)
      this.props.workspaceX.removeNotesIfSelected(deletedIdx);
  };

  componentWillUpdate(nextProps) {
    this.notes = this.chooseDisplayedNotes(nextProps);
  }

  chooseDisplayedNotes({ workspace, notes, visualMode }) {
    if (visualMode) {
      const visualNotes = _.map(notes, (note, i) => {
        let copy = Object.assign({}, note);
        copy.style = Object.assign({}, note.style);
        if (workspace.selected[i] && workspace.color !== null) {
          copy.color = workspace.color;
        }

        return copy;
      });
      return visualNotes.concat(workspace.drafts);
    } else {
      return workspace.drafts.concat(notes);
    }
  }

  setTranslation(target, x, y) {
    const leftPx = target.style.left;
    const topPx = target.style.top;
    const left = parseFloat(leftPx.substring(0, leftPx.length - 2));
    const top = parseFloat(topPx.substring(0, topPx.length - 2));

    const xMax = this.props.ui.vw - left - 20;
    const xMin = -left;
    const yMax = this.props.ui.vh - top - 20;
    const yMin = -top;

    x = Math.min(xMax, Math.max(xMin, x));
    y = Math.min(yMax, Math.max(yMin, y));

    target.style.webkitTransform =
      target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  dragStart = (e) => {
    e.target.dragging = true;
  };

  dragAll = (noteId, { dx, dy }) => {
    _.each(noteId, id => {
      const $note = document.getElementById(id);
      let x = (parseFloat($note.getAttribute('data-x')) || 0) + dx;
      let y = (parseFloat($note.getAttribute('data-y')) || 0) + dy;
      this.setTranslation($note, x, y);
    });
  };

  getSelectedIds = () => {
    const selectedIds = {
      htmlIds: [],
      mongoIds: [],
    };
    _.each(this.props.notes, (n, i) => {
      if (this.props.workspace.selected[i]) {
        selectedIds.htmlIds.push(`note${i}`);
        selectedIds.mongoIds.push(n._id);
      }
    });
    return selectedIds;
  };

  dragTarget = (e) => {
    if (this.props.visualMode) {
      const noteIndex = e.target.id.substring(4);
      if (!this.props.workspace.selected[noteIndex]) return;

      this.dragAll(this.getSelectedIds().htmlIds, e);
      return;
    }

    this.dragAll([e.target.id], e);
  };

  bulkDrag = (ids, { dx, dy }) => {
    dx /= this.props.ui.vw;
    dy /= this.props.ui.vh;
    this.socket.emitWorkspace('bulk drag notes', ids, { dx, dy });
  };

  dragEnd = (e) => {
    e.target.doneDrag = true;
    if (this.props.visualMode) {
      const noteIndex = e.target.id.substring(4);
      if (!this.props.workspace.selected[noteIndex]) return;

      this.bulkDrag(this.getSelectedIds().mongoIds, e);
      return;
    }

    this.setTranslation(e.target, 0, 0);

    let i = Number(e.target.id.substring(4));
    let x = this.notes[i].x + e.dx / this.props.ui.vw,
      y = this.notes[i].y + e.dy / this.props.ui.vh;
    let note = Object.assign({}, this.notes[i], { x, y });

    if (note.draft) {
      return this.props.workspaceX.dragDraft(i, x, y);
    } else {
      i -= this.props.drafts.length;
      if (this.socket.emitDragNote(note)) {
        this.props.noteX.drag(i, x, y);
      }
    }
  };

  submitDraft = (note, idx) => {
    this.props.workspaceX.undraft(idx);
    delete note.draft;
    note.color = this.props.color;
    /* Can't submit draft in visual mode, no need to check */
    this.socket.emitNewNote(note);
    this.socket.emitMetric('draft submit');
  };

  enterVisualMode = (idx) => {
    this.props.uiX.visualMode(this.props.notes.length);
    this.props.workspaceX.selectNote(idx - this.props.drafts.length);
  };

  renderNote = (note, i) => {
    return (
      <StickyNote key={`note${i}`}
                  note={note}
                  i={i}
                  submitDraft={this.submitDraft}
                  socket={this.socket}
                  enterVisualMode={this.enterVisualMode}
                  // Can't delete note in visual mode, no need to check
                  destroy={this.socket.emitDeleteNote} />
    );
  };

  render() {
    return (
      <div id="note-manager">
        {_.map(this.notes, this.renderNote)}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notes: state.notes,
    drafts: state.workspace.drafts,
    workspace: state.workspace,
    ui: state.ui,
    color: state.users.nameToColor[state.users.me],
    visualMode: state.ui.editingMode === EDITING_MODE.VISUAL || false,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    noteX: bindActionCreators(noteX, dispatch),
    uiX: bindActionCreators(uiX, dispatch),
    workspaceX: bindActionCreators(workspaceX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteManager);
