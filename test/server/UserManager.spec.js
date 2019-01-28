import { expect } from 'chai';
import _ from 'underscore';

import UserManager from '../../lib/UserManager';
import { STICKY_COLORS } from '../../lib/constants';

const code = '1a2b3c4d';
const username = 'bruce';
let manager;

describe('user manager', () => {

  beforeEach(() => {
    manager = new UserManager();
  });

  afterEach(() => {
    manager = null;
  });

  it('getRoom', () => {
    const m = manager.getRoom(code);
    expect(m.usernameToColor).to.be.an('object');
    expect(m.colors).to.have.lengthOf(6);
  });

  it('addUser', () => {
    const o = manager.addUser(code, username);
    expect(o.manager.usernameToColor).to.have.keys(username);
    expect(o.manager.colors).to.have.lengthOf(5);
    expect(o.newUser).to.equal(username);
  });

  it('addUser: data validation', () => {
    manager.addUser(code, username);
    let o = manager.addUser(code, username);
    expect(o.message).to.equal('username exists');
    o = manager.addUser(code, 'notallchars2');
    expect(o.message).to.equal('bad username');
    o = manager.addUser(code, '');
    expect(o.message).to.equal('bad username');
  });

  it('refresh', () => {
    manager.addUser(code, username);
    let o = manager.refreshUser(code, username);
    expect(o.manager.usernameToColor).to.have.all.keys([ username ]);
  });

  it('removeUser', () => {
    manager.addUser(code, username);
    manager.addUser(code, 'user');
    const m = manager.removeUser(code, username);
    expect(m.usernameToColor).to.not.have.keys(username);
  });

  it('delete room if last remaining user leaves', () => {
    manager.addUser(code, username);
    const m = manager.removeUser(code, username);
    expect(m).to.be.null;
  });

  it('replenishes colors if > 6 users join', () => {
    for (let i = 0; i < 6; i++) {
      manager.addUser(code, username + 'a'.repeat(i));
    }

    const update = manager.addUser(code, 'seventh');
    expect(update.manager.colors).to.have.length(5);

    _.each(update.manager.usernameToColor, (color) => {
      expect(color).to.be.oneOf(STICKY_COLORS);
    });
  });
});

