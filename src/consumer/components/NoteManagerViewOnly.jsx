import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import StickyNote from './StickyNote.jsx';

class NoteManagerViewOnly extends Component {
  renderNote = (note, i) => {
    return <StickyNote key={`note${i}`} note={note} i={i} viewOnly={true} />;
  };

  render() {
    return (
      <div id="note-manager">
        {_.map(this.props.notes, this.renderNote)}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notes: state.notes,
  };
};

export default connect(mapStateToProps, null)(NoteManagerViewOnly);
