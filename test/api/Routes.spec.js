import { expect } from 'chai';
import request from 'supertest';

import app from '../../icompass';
import Compass from '../../backend/models/compass';

const TOPIC = 'test suite';

describe('Routes', () => {
  let DUT;
  let agent;
  
  before(() => {
    agent = request.agent(app);
  });

  beforeEach(async () => {
    DUT = await Compass.makeCompass(TOPIC);
  });

  afterEach(done => {
    Compass.remove({ _id: DUT._id }, done);
  });

  it('#getByView', (done) => {
    agent
      .get('/api/v1/workspace/view')
      .query({ id: DUT.viewCode })
      .end((err, res) => {
        if (err) throw err;
        expect(res.body.compass.editCode).to.be.undefined;
        expect(res.body.compass.viewCode).to.equal(DUT.viewCode);
        done();
      });
  });
});

