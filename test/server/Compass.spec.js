import 'babel-polyfill';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';
import _ from 'underscore';

import Compass from '../../backend/models/compass';

const mockgoose = new Mockgoose(mongoose);
const topic = 'test suite';
const note = {
  user: 'mocha',
  color: '#FFCCFF',
  text: 'hello, world',
  doodle: null,
  isImage: false,
  x: 0.5,
  y: 0.5,
  upvotes: 0,
};

const addNotes = async (workspace, n) => {
  for (let i = 0; i < n - 1; i++) {
    await workspace.addNote(note);
  }

  return await workspace.addNote(note);
};

describe('Compass: models', () => {
  let workspace;

  before(async () => {
    await mockgoose.prepareStorage();
    mongoose.connect('mongodb://test.com/icompass-test');
  });

  beforeEach(async () => {
    workspace = await Compass.makeCompass(topic);
  });

  describe('statics', () => {
    it('#makeCompass', (done) => {
      expect(workspace.editCode).to.have.lengthOf(8);
      expect(workspace.viewCode).to.have.lengthOf(8);
      expect(workspace.topic).to.equal(topic);
      expect(workspace.notes).to.be.empty;
      done();
    });

    it('#findByEditCode', async () => {
      const c = await Compass.findByEditCode(workspace.editCode);
      expect(c.editCode).to.equal(workspace.editCode);
      expect(c.viewCode).to.equal(workspace.viewCode);
      expect(c.topic).to.equal(topic);
    });

    it('#findByViewCode', async () => {
      const c = await Compass.findByViewCode(workspace.viewCode);
      expect(c.editCode).to.be.undefined;
      expect(c.viewCode).to.equal(workspace.viewCode);
      expect(c.topic).to.equal(topic);
    });
  });

  describe('methods', () => {
    it('#setCenter', async () => {
      const c = await workspace.setCenter('center');
      expect(c.center).to.equal('center');
    });

    it('#addNote', async () => {
      const c = await workspace.addNote(note);
      expect(c.notes).to.have.lengthOf(1);
    });

    it('#updateNote', async () => {
      let c = await addNotes(workspace, 3);

      // emulate client side request
      const updated = Object.assign({}, c.notes[1]._doc);
      updated.text = 'Updated';
      updated._id = updated._id.toString();

      c = await workspace.updateNote(updated);
      expect(c.notes).to.have.lengthOf(3);
      expect(c.notes[1].text).to.equal('Updated');
    });

    it('#plusOneNote', async () => {
      workspace = await workspace.addNote(note);
      expect(workspace.notes).to.have.length(1);
      expect(workspace.notes[0].upvotes).to.equal(0);

      workspace = await workspace.plusOneNote(workspace.notes[0]._id.toString());
      expect(workspace.notes).to.have.length(1);
      expect(workspace.notes[0].upvotes).to.equal(1);
    });

    it('#bulkUpdateNotes', async () => {
      let c = await addNotes(workspace, 2);

      const noteIds = _.map(c.notes, note => note._id.toString());
      const color = '#FFAE27';
      const transformation = { color };

      c = await workspace.bulkUpdateNotes(noteIds, transformation);
      expect(c.notes).to.have.length(2);
      _.each(c.notes, note => expect(note.color).to.equal(color));
    });

    it('#bulkDragNotes', async () => {
      const note1 = Object.assign({}, note, { x: 0.9, y: 0.9 });
      const note2 = Object.assign({}, note, { x: 0.1, y: 0.1 });

      await workspace.addNote(note1);
      workspace = await workspace.addNote(note2);

      const noteIds = _.map(workspace.notes, n => n._id.toString());

      workspace = await workspace.bulkDragNotes(noteIds, { dx: 0.3, dy: 0.3 });
      expect(workspace.notes).to.have.length(2);
      expect(workspace.notes[0]).to.have.property('x', 0.98);
      expect(workspace.notes[0]).to.have.property('y', 0.98);
      expect(workspace.notes[1]).to.have.property('x', 0.4);
      expect(workspace.notes[1]).to.have.property('y', 0.4);

      workspace = await workspace.bulkDragNotes(noteIds, { dx: -0.5, dy: -0.5 });
      expect(workspace.notes).to.have.length(2);
      expect(workspace.notes[0]).to.have.property('x', 0.48);
      expect(workspace.notes[0]).to.have.property('y', 0.48);
      expect(workspace.notes[1]).to.have.property('x', 0);
      expect(workspace.notes[1]).to.have.property('y', 0);
    });

    it('#deleteNote', async () => {
      const c = await addNotes(workspace, 2);
      const { compass, deletedIdx } = await workspace.deleteNote(c.notes[1]._id.toString());
      expect(compass.notes).to.have.lengthOf(1);
      expect(deletedIdx).to.have.lengthOf(1);
      expect(deletedIdx[0]).to.equal(1);
    });

    it('#deleteNotes', async () => {
      const c = await addNotes(workspace, 4);
      const noteIds = _.map(c.notes, note => note._id.toString());
      noteIds.splice(1, 1);
      expect(noteIds).to.have.lengthOf(3);

      const { compass, deletedIdx } = await workspace.deleteNotes(noteIds);
      expect(compass.notes).to.have.lengthOf(1);
      expect(deletedIdx).to.have.lengthOf(3);
      expect(deletedIdx).to.have.members([0, 2, 3]);
    });
  });
});
