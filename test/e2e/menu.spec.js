const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup, menuActions, selectMenuOption, selectSubmenuOption } = require('./utils');

describe('workspace menu', () => {
  beforeAll(setup);

  afterAll(() => {
    b.back();
    cleanup();
  });

  describe('notes submenu', () => {
    it('new text note button', () => {
      selectSubmenuOption(menuActions.textNote);
      expect('#ic-note-form').to.be.visible();
      b.click('button[name="nvm"]');
    });

    it('new image note button', () => {
      selectSubmenuOption(menuActions.imageNote);
      expect('#ic-image-form').to.be.visible();
      b.click('button[name="nvm"]');
    });

    it('new doodle button', () => {
      selectSubmenuOption(menuActions.doodleNote);
      expect('#ic-doodle-form').to.be.visible();
      b.click('button[name="nvm"]');
    });
  });

  describe('modes submenu', () => {
    it('compact mode', () => {
      selectSubmenuOption(menuActions.compactMode);
      expect('#ic-toast').to.have.text(/compact/);
    });

    it('bulk edit mode', () => {
      selectSubmenuOption(menuActions.bulkMode);
      expect('#ic-toast').to.have.text(/bulk edit/);
    });

    it('standard mode', () => {
      selectSubmenuOption(menuActions.standardMode);
      expect('#ic-toast').to.have.text(/standard/);
    });

    it('explain modes', () => {
      selectSubmenuOption(menuActions.explainModes);
      b.waitForDisplayed('#ic-modal');
      expect('#ic-modal-body').to.have.text(/What are these modes/);
      b.click('#ic-modal-confirm');
    });
  });

  describe('exports submenu', () => {
    it('as google doc', () => {
      selectSubmenuOption(menuActions.googleDocs);
      expect('div.ic-gdoc.ic-dynamic-modal').to.be.visible();
      expect('div.ic-gdoc.ic-dynamic-modal div.copy-to-clipboard').to.be.visible();
      expect('div.ic-gdoc.ic-dynamic-modal div.warning').to.have.text(/Doodles will not be included/);
      b.click('button.ic-close-window');
    });

    it('as screenshot', () => {
      selectSubmenuOption(menuActions.screenshot);
      b.waitForDisplayed('div.ic-screenshot.ic-dynamic-modal');
      b.waitForDisplayed('div#exported-png canvas', 10000);
      expect('div#exported-png p').to.have.text(/Right click/);
      b.click('button.ic-close-window');
    });
  });

  describe('move center submenu', () => {
    let defaultCenterX, defaultCenterY;

    it('(part of test setup) set default center x/y', () => {
      const { x, y } = b.getLocation('#center');
      defaultCenterX = x;
      defaultCenterY = y;
    });

    describe('custom position', () => {
      beforeEach(() => {
        selectSubmenuOption(menuActions.customCenterPosition);
        expect('#center-drag-modal').to.be.visible();
        b.moveToObject('#center', 10, 10);
        b.buttonDown(0);
        b.moveToObject('#center', -400, -400);
        b.buttonUp(0);
      });

      it('cancel will reset', () => {
        // TODO make selector stricter
        b.click('button.cancel');
        const { x, y } = b.getLocation('#center');
        expect(x).to.equal(defaultCenterX);
        expect(y).to.equal(defaultCenterY);
      });

      it('accept will save', () => {
        // TODO make selector stricter
        b.click('button.accept');
        b.refresh();
        b.waitForDisplayed('#center', 10000);
        const { x, y } = b.getLocation('#center');
        expect(x).to.be.below(defaultCenterX);
        expect(y).to.be.below(defaultCenterY);
      });
    });

    it('reset to center', () => {
      selectSubmenuOption(menuActions.resetCenterPosition);
      const { x, y } = b.getLocation('#center');
      expect(x).to.equal(defaultCenterX);
      expect(y).to.equal(defaultCenterY);
      // Hide the menu to reset the state for the next test
      b.click('.ic-workspace-button');
    });
  });

  describe('main menu', () => {
    describe('dark theme', () => {
      it('can turn on', () => {
        b.click('.ic-workspace-button');
        b.waitForDisplayed('div.ic-workspace-menu');
        b.click('span.slider');
        b.pause(200);
        expect('.dark-theme').to.have.count(2);
      });

      it('saves in local storage', () => {
        b.refresh();
        b.waitForDisplayed('#compass');
        expect('.dark-theme').to.have.count(2);
      });

      it('can turn off', () => {
        b.click('.ic-workspace-button');
        b.waitForDisplayed('div.ic-workspace-menu');
        b.click('span.slider');
        b.pause(200);
        expect('.dark-theme').to.have.count(0);
      });

      it('saves in local storage again', () => {
        b.refresh();
        b.waitForDisplayed('#compass');
        expect('.dark-theme').to.have.count(0);
      });
    });

    describe('email reminder', () => {
      it('wrong email format displays error message', () => {
        selectMenuOption(menuActions.email);
        b.waitForDisplayed('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Receive a Link/);
        expect('#ic-modal-cancel').to.be.visible();
        expect(b.getAttribute('#ic-modal-input', 'placeholder')).to.be.empty;
        b.setValue('#ic-modal-input', 'fakeemail');
        b.click('#ic-modal-confirm');
        b.waitForDisplayed('#ic-toast');
        expect('#ic-toast').to.have.text(/not a valid email/);
      });

      it('valid email shows toast', () => {
        b.setValue('#ic-modal-input', 'fakeemail@valid.com');
        b.click('#ic-modal-confirm');
        b.waitForDisplayed('#ic-toast span');
        expect('#ic-toast span').to.have.text(/link to this workspace/);
      });
    });

    describe('share modal', () => {
      it('shows modal', () => {
        selectMenuOption(menuActions.share);
        expect('.ic-share').to.be.visible();
      });

      it('backdrop closes modal', () => {
        b.moveToObject('.ic-share', -20, -20);
        b.leftClick();
        expect('.ic-share').to.not.be.visible();
      });

      it('copy edit link', () => {
        selectMenuOption(menuActions.share);
        b.click('button.copy-edit');
        expect('#ic-toast').to.be.visible();
        // TODO re-enable when less flaky
        // expect('#ic-toast').to.have.text(/Edit link has been copied/);
      });

      it('copy view link', () => {
        b.click('button.copy-view');
        expect('#ic-toast').to.be.visible();
        expect('#ic-toast').to.have.text(/View-only link has been copied/);
      });

      it('can x out', () => {
        b.click('button.ic-close-window');
        expect('.ic-share').to.not.be.visible();
      });
    });

    describe('bookmarking', () => {
      it('bookmark indicator invisible if workspace not bookmarked', () => {
        expect('#ic-bookmark').to.not.be.visible();
      });

      it('toast displays success status', () => {
        selectMenuOption(menuActions.bookmark);
        b.waitForDisplayed('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Bookmarks give you quick access/);
        b.setValue('#ic-modal-input', 'My bookmark');
        b.click('#ic-modal-confirm');
        b.waitForDisplayed('#ic-toast span');
        expect(b.getAttribute('#ic-toast span', 'class')).to.equal('success');
        expect('#ic-toast span').to.have.text(/Bookmarked/);
        b.click('#ic-toast span');
      });

      it('bookmark indicator appears', () => {
        expect('div#ic-bookmark-indicator').to.be.visible();
      });

      it('logout button', () => {
        selectMenuOption(menuActions.logout);
        expect(b.getUrl()).to.equal('http://localhost:8080/');
      });

      describe('bookmarks', () => {
        it('can unhide bookmarks', () => {
          b.click('#bookmark-button');
          b.pause(500);
          expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('0px');
          expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('200px');
        });

        it('remembers user showed bookmarks', () => {
          b.refresh();
          b.waitForDisplayed('#bookmark-button');
          expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('0px');
          expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('200px');
        });

        it('bookmark has correct info', () => {
          b.click('.ic-saved #arrow');
          b.pause(100);
          expect('.ic-saved a').to.have.text('My bookmark');
          expect('.ic-saved .ic-saved-info p').to.have.text('as "sandbox"');
        });

        describe('search', () => {
          it('shows nothing if search does not match', () => {
            expect('.ic-saved').to.have.count(1);
            b.setValue('#bookmark-search', 'does not match');
            b.pause(100);
            expect('.ic-saved').to.have.count(0);
          });

          it('shows match if search matches', () => {
            b.setValue('#bookmark-search', 'bookmark');
            b.pause(100);
            expect('.ic-saved').to.have.count(1);
            b.clearElement('#bookmark-search');
          });
        });

        it('bookmark leads to correct workspace', () => {
          b.click('.ic-saved a');
          b.waitForDisplayed('#compass');
          expect(b.getUrl()).to.contain('http://localhost:8080/compass/edit');
        });

        it('bookmark indicator exists if workspace has been bookmarked', () => {
          expect('div#ic-bookmark-indicator').to.be.visible();
        });

        it('bookmark prompt indicates workspace is already bookmarked', () => {
          selectMenuOption(menuActions.bookmark);
          b.waitForDisplayed('#ic-modal');
          expect('#ic-modal-body').to.have.text(/Already bookmarked/);
          b.click('#ic-modal-confirm');
          b.back();
        });

        it('can edit bookmark', () => {
          b.click('.ic-saved #arrow');
          b.pause(500);
          b.click('button.edit');
          b.waitForDisplayed('#ic-modal');
          expect('#ic-modal-body').to.contain.text(/Enter a new name/);
          b.setValue('#ic-modal-input', 'Changed name');
          b.click('#ic-modal-confirm');
          expect('.ic-saved a').to.have.text('Changed name');
        });

        it('can remove bookmark', () => {
          b.click('button.remove');
          b.waitForDisplayed('#ic-modal');
          expect('#ic-modal-body').to.have.text(/Are you sure/);
          b.click('#ic-modal-confirm');
          expect('.ic-saved').to.not.be.there();
        });

        // describe('import/export bookmarks', () => {
        //   it('warns if exporting empty bookmarks', () => {
        //     b.click('button#export');
        //     b.pause(200);
        //     expect('#ic-toast').to.be.visible();
        //     expect('#ic-toast').to.have.text(/no bookmarks/);
        //   });
        //
        //   it('notifies if empty file', () => {
        //     b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/empty.json');
        //     b.pause(200);
        //     expect('#ic-toast').to.be.visible();
        //     expect('#ic-toast').to.have.text(/Nothing happened/);
        //   });
        //
        //   it('errors if not json', () => {
        //     b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/notjson.xml');
        //     b.pause(200);
        //     expect('#ic-toast').to.be.visible();
        //     expect('#ic-toast').to.have.text(/Invalid file type/);
        //   });
        //
        //   it('aborts if attribute is missing', () => {
        //     b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/missingattribute.json');
        //     b.pause(200);
        //     expect('#ic-modal').to.be.visible();
        //     expect('#ic-modal-body').to.have.text(/correct format/);
        //     b.click('#ic-modal-confirm');
        //   });
        //
        //   it('aborts if href is invalid', () => {
        //     b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/invalidhref.json');
        //     b.pause(200);
        //     expect('#ic-modal').to.be.visible();
        //     expect('#ic-modal-body').to.have.text(/correct format/);
        //     b.click('#ic-modal-confirm');
        //   });
        //
        //   it('aborts if username is invalid', () => {
        //     b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/invalidusername.json');
        //     b.pause(200);
        //     expect('#ic-modal').to.be.visible();
        //     expect('#ic-modal-body').to.have.text(/correct format/);
        //     b.click('#ic-modal-confirm');
        //   });
        //
        //   it('succeeds and adds to existing bookmarks, without checking for duplicates', () => {
        //     expect('.ic-saved').to.have.count(0);
        //     b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/valid.json');
        //     b.pause(200);
        //     expect('#ic-toast').to.be.visible();
        //     expect('#ic-toast').to.have.text(/Bookmarks imported/);
        //     expect('.ic-saved').to.have.count(1);
        //   });
        //
        //   it('prompts for email', () => {
        //     expect('#ic-modal').to.be.visible();
        //     expect('#ic-modal').to.have.text(/Email your bookmarks/);
        //     b.click('#ic-modal-cancel');
        //   });
        // });

        describe('emailing bookmarks', () => {
          it('toasts error if email invalid', () => {
            b.click('#email');
            b.waitForDisplayed('#ic-modal');
            b.setValue('#ic-modal-input', 'invalidemail@');
            b.click('#ic-modal-confirm');
            b.waitForDisplayed('#ic-toast');
            expect('#ic-toast').to.have.text(/not a valid email/);
          });

          it('toast success if email valid', () => {
            b.setValue('#ic-modal-input', 'fakeemail@test.com');
            b.click('#ic-modal-confirm');
            b.waitForDisplayed('#ic-toast');
            expect('#ic-toast').to.have.text(/link to this workspace/);
          });
        });

        it('can hide bookmarks', () => {
          b.click('#bookmark-button');
          b.pause(500);
          expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('-200px');
          expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('0px');
        });

        it('remembers user hid bookmarks', () => {
          b.refresh();
          b.waitForDisplayed('#bookmark-button');
          expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('-200px');
          expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('0px');
        });
      });
    });
  });
});
