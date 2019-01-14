let mongoose = require('mongoose');
let _ = require('underscore');

let DefaultCompass = require('./defaultCompass');
const { STICKY_COLORS } = require('../lib/constants');

function generateUUID() {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

mongoose.Promise = global.Promise;
let compassSchema = mongoose.Schema({
  editCode: String,
  viewCode: String,
  topic: String,
  center: String,
  notes: [{
    user: String,
    color: String,
    text: String,
    doodle: String,
    isImage: Boolean,
    x: Number,
    y: Number,
    upvotes: Number,
    altText: String,
  }],
});

const isValidColor = (color) => {
  return _.contains(STICKY_COLORS, color);
};

const isValidNote = (note) => {
  if (!isValidColor(note.color)) {
    return false;
  }

  if (
    (note.doodle != null && note.isImage) ||
    (note.doodle != null && note.text)
  ) {
    return false;
  }

  return true;
};

compassSchema.statics.makeCompass = function(topic) {
  return new Promise((resolve, reject) => {
    const newCompass = Object.assign({}, DefaultCompass, {
      editCode: generateUUID(),
      viewCode: generateUUID(),
      topic: topic,
    });
    this.create(newCompass, function(err, compass) {
      if (err) {
        reject('Failed to create compass');
      }

      resolve(compass);
    });
  });
};

compassSchema.statics.findByEditCode = function(code) {
  return new Promise((resolve, reject) => {
    this.findOne({ editCode: code }, function(err, c) {
      if (err) {
        reject('Could not find compass for editing', code, err);
      }

      resolve(c);
    });
  });
};

compassSchema.statics.findByViewCode = function(code) {
  return new Promise((resolve, reject) => {
    this.findOne({ viewCode: code }, function(err, c) {
      if (err) {
        reject('Could not find compass for viewing', code, err);
      }

      if (c === null) {
        return resolve(null);
      }

      const clone = JSON.parse(JSON.stringify(c));
      delete clone.editCode;
      resolve(clone);
    });
  });
};

compassSchema.methods.setCenter = function(center) {
  return new Promise((resolve, reject) => {
    const { _id } = this;
    this.model('Compass').findByIdAndUpdate(
      _id,
      { $set: { center: center } },
      { $safe: true, upsert: false, new: true },
      function(err, compass) {
        if (err) {
          reject(`Could not set center to ${center} for compass ${_id}`);
        }

        resolve(compass);
      }
    );
  });
};

compassSchema.methods.addNote = function(newNote) {
  return new Promise((resolve, reject) => {
    if (!isValidNote(newNote)) {
      reject('Invalid data');
    }

    const { _id } = this;
    this.model('Compass').findByIdAndUpdate(
      _id,
      { $push: { notes: newNote } },
      { $safe: true, upsert: false, new: true },
      (err, compass) => {
        if (err) {
          reject('Could not add note to compass', _id, newNote, err);
        }

        resolve(compass);
      }
    );
  });
};

compassSchema.methods.updateNote = function(updatedNote) {
  return new Promise((resolve, reject) => {
    if (!isValidNote(updatedNote)) {
      reject('Invalid data');
    }

    const { _id } = this;
    this.model('Compass').findOne({ _id }, function(err, c) {
      if (err) {
        reject('Could not find compass to update note', _id, updatedNote, err);
      }

      for (let i = 0; i < c.notes.length; i++) {
        const note = c.notes[i];
        if (note._id.toString() === updatedNote._id) {
          Object.assign(note, updatedNote);
          note.x = Math.min(0.98, Math.max(0, note.x));
          note.y = Math.min(0.98, Math.max(0, note.y));
        }
      }

      c.save(function (err, updatedCompass) {
        if (err) {
          reject('Could not update note in compass', _id, updatedNote, err);
        }

        resolve(updatedCompass);
      });
    });
  });
};

compassSchema.methods.plusOneNote = function(noteId) {
  return new Promise((resolve, reject) => {
    const { _id } = this;
    this.model('Compass').findOne({ _id }, function(err, c) {
      if (err) {
        reject('Could not find compass to update note', _id, noteId, err);
      }

      let note;
      for (let i = 0; i < c.notes.length; i++) {
        note = c.notes[i];
        if (note._id.toString() === noteId) {
          note.upvotes = (note.upvotes || 0) + 1;
        }
      }

      c.save(function(err, updatedCompass) {
        if (err) {
          reject('Could not update note in compass', _id, noteId, err);
        }

        resolve(updatedCompass);
      });
    });
  });
};

compassSchema.methods.bulkUpdateNotes = function(noteIds, transformation) {
  return new Promise((resolve, reject) => {
    if (!isValidColor(transformation.color)) {
      reject('Invalid data');
    }

    const { _id } = this;
    this.model('Compass').findOne({ _id }, function(err, c) {
      if (err) {
        reject('Could not find compass to update note', _id, noteIds, err);
      }

      c.notes = _.map(c.notes, function(note) {
        if (_.contains(noteIds, note._id.toString())) {
          if (transformation.color) note.color = transformation.color;
        }
        return note;
      });

      c.save(function(err, updatedCompass) {
        if (err) {
          reject('Could not update notes in compass', _id, noteIds, err);
        }

        resolve(updatedCompass);
      });
    });
  });
};

compassSchema.methods.bulkDragNotes = function(noteIds, { dx, dy }) {
  return new Promise((resolve, reject) => {
    const { _id } = this;
    this.model('Compass').findOne({ _id }, function(err, c) {
      if (err) {
        reject('Could not find compass to update note', _id, noteIds, err);
      }

      c.notes = _.map(c.notes, function(note) {
        if (_.contains(noteIds, note._id.toString())) {
          note.x += dx;
          note.y += dy;

          note.x = Math.min(0.98, Math.max(0, note.x));
          note.y = Math.min(0.98, Math.max(0, note.y));
        }
        return note;
      });

      c.save(function(err, updatedCompass) {
        if (err) {
          reject('Could not update notes in compass', _id, noteIds, err);
        }

        resolve(updatedCompass);
      });
    });
  });
};

compassSchema.methods.deleteNote = function(noteId) {
  return this.deleteNotes([noteId]);
};

compassSchema.methods.deleteNotes = function(noteIds) {
  return new Promise((resolve, reject) => {
    const { _id } = this;
    this.model('Compass').findOne({ _id }, function(err, c) {
      if (err) {
        reject('Could not find compass to delete notes', _id, noteIds, err);
      }

      const deletedIdx = [];
      c.notes = _.filter(c.notes, function(e, idx) {
        if (_.contains(noteIds, e._id.toString())) {
          deletedIdx.push(idx);
          return false;
        }

        return true;
      });

      c.save(function(err, updatedCompass) {
        if (err) {
          reject('Could not delete notes', _id, noteIds, err);
        }

        resolve({
          compass: updatedCompass,
          deletedIdx,
        });
      });
    });
  });
};

module.exports = mongoose.model('Compass', compassSchema);
