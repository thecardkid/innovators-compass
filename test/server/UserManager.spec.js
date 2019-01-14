import { expect } from 'chai';
import _ from 'underscore';

import UserManager from '../../backend/lib/UserManager';
import { STICKY_COLORS } from '../../backend/lib/constants';

const code = '1a2b3c4d';
const username = 'bruce willis';
let manager;

describe('user manager', () => {

  beforeEach(() => {
    manager = new UserManager();
  });

  afterEach(() => {
    manager = null;
  });

  it('return empty manager if room does not exist', () => {
    const m = manager.getRoom(code);
    expect(m.usernameToColor).to.be.an('object');
    expect(m.colors).to.have.lengthOf(6);
  });

  it('add user without an assigned color to a room', () => {
    const o = manager.addUser(code, username);
    expect(o.manager.usernameToColor).to.have.keys(username);
    expect(o.manager.colors).to.have.lengthOf(5);
    expect(o.newUser).to.equal(username);
  });

  it('add user with an assigned color to a room', () => {
    const color = STICKY_COLORS[2];

    const o = manager.addUser(code, username, color);
    expect(o.manager.usernameToColor).to.have.keys(username);
    expect(o.manager.usernameToColor[username]).to.equal(color);
    expect(o.manager.colors).to.not.have.members([color]);
    expect(o.newUser).to.equal(username);
  });

  it('prevent duplicate usernames', () => {
    manager.addUser(code, username);
    manager.addUser(code, username);
    const o = manager.addUser(code, username);
    expect(o.manager.usernameToColor).to.have.keys(username, username + '2', username + '3');
    expect(o.manager.colors).to.have.length(3);
    expect(o.newUser).to.equal(username + '3');
  });

  it('remove a user', () => {
    manager.addUser(code, username);
    manager.addUser(code, username);
    const m = manager.removeUser(code, username);
    expect(m.usernameToColor).to.not.have.keys(username);
    expect(m.colors).to.have.length(5);
  });

  it('delete room if last remaining user leaves', () => {
    manager.addUser(code, username);
    const m = manager.removeUser(code, username);
    expect(m).to.be.null;
  });

  it('replenishes colors if > 6 users join', () => {
    for (let i = 0; i < 6; i++) {
      manager.addUser(code, `${username}i`);
    }

    const update = manager.addUser(code, `${username}6`);
    expect(update.manager.colors).to.have.length(5);

    _.each(update.manager.usernameToColor, (color) => {
      expect(color).to.be.oneOf(STICKY_COLORS);
    });
  });
});

