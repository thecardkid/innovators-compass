import { expect } from 'chai';
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';
import _ from 'underscore';

import Compass from '../../models/compass';

const mockgoose = new Mockgoose(mongoose);
const TOPIC = 'test suite';
const NOTE = {
  user: 'mocha',
  color: '#FFCCFF',
  text: 'hello, world',
  doodle: null,
  isImage: false,
  x: 0.5,
  y: 0.5,
};

function addNotes(DUT, n, cb) {
  let i = 0;
  let incr = (compass) => {
    i += 1;
    if (i === n) cb(compass);
  };

  for (let j = 0; j < n; j++)
    Compass.addNote(DUT._id, NOTE, incr);
}

describe('Compass: models', () => {
  let DUT;

  before((done) => {
    mockgoose.prepareStorage().then(() => {
      mongoose.connect('mongodb://test.com/icompass-test', (err) => {
        done(err);
      });
    });
  });

  beforeEach(done => {
    Compass.makeCompass(TOPIC, c => {
      DUT = c;
      done();
    });
  });

  afterEach(done => {
    Compass.remove({ _id: DUT._id }, done);
  });

  it('#makeCompass', (done) => {
    expect(DUT.editCode).to.have.lengthOf(8);
    expect(DUT.viewCode).to.have.lengthOf(8);
    expect(DUT.topic).to.equal(TOPIC);
    expect(DUT.notes).to.be.empty;
    done();
  });

  it('#findByEditCode', (done) => {
    Compass.findByEditCode(DUT.editCode, (c) => {
      expect(c.editCode).to.not.be.undefined;
      expect(c.viewCode).to.not.be.undefined;
      expect(c.topic).to.equal(TOPIC);
      done();
    });
  });

  it('#findByViewCode', (done) => {
    Compass.findByViewCode(DUT.viewCode, (c) => {
      expect(c.editCode).to.be.undefined;
      expect(c.viewCode).to.not.be.undefined;
      expect(c.topic).to.equal(TOPIC);
      done();
    });
  });

  it('#setCenter', (done) => {
    Compass.setCenter(DUT._id, 'center', (c) => {
      expect(c.center).to.equal('center');
      done();
    });
  });

  it('#addNote', (done) => {
    Compass.addNote(DUT._id, NOTE, (c) => {
      DUT = c;
      expect(c.notes).to.have.lengthOf(1);
      done();
    });
  });

  it('#updateNote', (done) => {
    addNotes(DUT, 3, compass => {
      let updated = Object.assign({}, compass.notes[1]._doc);
      updated.text = 'Updated';
      // emulate client side request
      updated._id = updated._id.toString();
      Compass.updateNote(compass._id, updated, (c) => {
        expect(c.notes).to.have.lengthOf(3);
        expect(c.notes[1].text).to.equal('Updated');
        done();
      });
    });
  });

  it('#bulkUpdateNotes', (done) => {
    Compass.addNote(DUT._id, NOTE, (c) => {
      let noteIds = _.map(c.notes, note => note._id.toString());
      DUT = c;
      const color = '#FFAE27';

      let transformation = { color };
      Compass.bulkUpdateNotes(DUT._id, noteIds, transformation, (c) => {
        _.map(c.notes, (note) => {
          expect(note.color).to.equal(color);
        });
        done();
      });
    });
  });

  it('#deleteNote', (done) => {
    addNotes(DUT, 2, compass => {
      Compass.deleteNote(compass._id, compass.notes[1]._id.toString(), (notes, deletedIdx) => {
        expect(notes).to.have.lengthOf(1);
        expect(deletedIdx).to.have.lengthOf(1);
        expect(deletedIdx[0]).to.equal(1);
        done();
      });
    });
  });

  it('#deleteNotes', (done) => {
    addNotes(DUT, 4, compass => {
      let noteIds = _.map(compass.notes, note => note._id.toString());
      noteIds.splice(1, 1);
      expect(noteIds).to.have.lengthOf(3);

      Compass.deleteNotes(DUT._id, noteIds, (notes, deletedIdx) => {
        expect(notes).to.have.lengthOf(1);
        expect(deletedIdx).to.have.lengthOf(3);
        expect(deletedIdx[0]).to.equal(0);
        expect(deletedIdx[1]).to.equal(2);
        expect(deletedIdx[2]).to.equal(3);
        done();
      });
    });
  });
});
