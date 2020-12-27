const { setup, getElemWithDataCy, waitForVisible } = require('./utils');
const { contextMenu } = require('./data_cy');
const imageUrl = 'https://icompass-testing.s3-us-west-1.amazonaws.com/pup.jpg';


describe('context menus', () => {
  before(setup);
  const x = 100, y = 200;

  beforeEach(() => {
    cy.get('#note0').rightclick();
    waitForVisible('.context-menu');
  });

  afterEach(() => {
    cy.get('body').click();
  });

  describe('text note context menu', () => {
    before(() => {
      cy.get('body').dblclick(x, y);
      cy.get('#ic-form-text .ql-editor').type('text note');
      cy.get('button[name=ship]').click();
      cy.wait(200);
      cy.get('div.ic-sticky-note').should('have.length', 1);
    });

    it('correct options enabled', () => {
      cy.get('.ic-menu-item').should('have.length', 7);
      cy.get('.ic-menu-item.disabled').should('have.length', 1);
    });

    it('clicking away dismisses context menu', () => {
      cy.get('div#ideas').click();
      cy.get('.context-menu').should('not.exist');
    });

    it('"edit" action', () => {
      getElemWithDataCy(contextMenu.editAction).click();
      cy.get('#ic-form-text').should('contain', 'text note');
      cy.get('button[name=nvm]').click();
    });

    it('"upvote" action', () => {
      getElemWithDataCy(contextMenu.upvoteAction).click();
      cy.get('#note0 .ic-upvote').should('contain', '+1');
    });

    it('ignore "view image" action if note is text', () => {
      getElemWithDataCy(contextMenu.zoomAction).click();
      cy.get('#ic-modal-image').should('not.exist');
    });

    it('"bring to front" action', () => {
      getElemWithDataCy(contextMenu.bringToFrontAction).click();
      cy.get('#note0').should('have.css', 'z-index', '3');
    });

    it('"select" action', () => {
      getElemWithDataCy(contextMenu.selectAction).click();
      cy.get('#ic-visual-toolbar').should('be.visible');
      cy.get('#note0').should('have.css', 'border-color', 'rgb(40, 138, 255)');
    });

    it('delete', () => {
      getElemWithDataCy(contextMenu.discardAction).click();
      cy.get('#ic-modal').should('be.visible');
      cy.get('#ic-modal').should('contain', 'Are you sure');
      cy.get('#ic-modal-confirm').click();
      cy.wait(200);
      cy.get('.ic-sticky-note').should('have.length', 0);
    });
  });

  describe('image note context menu', () => {
    before(() => {
      cy.get('body').dblclick(x, y, { shiftKey: true });
      cy.get('#ic-form-text').type(imageUrl);
      cy.get('button[name=ship]').click();
      cy.get('div.ic-sticky-note').should('have.length', 1);
    });

    it('correct options enabled', () => {
      cy.get('.ic-menu-item').should('have.length', 7);
      cy.get('.ic-menu-item.disabled').should('have.length', 0);
    });

    it('edit', () => {
      getElemWithDataCy(contextMenu.editAction).click();
      cy.get('#ic-form-text').should('contain', imageUrl);
      cy.get('button[name=nvm]').click();
    });

    it('upvote', () => {
      getElemWithDataCy(contextMenu.upvoteAction).click();
      cy.get('#note0 .ic-upvote').should('contain', '+1');
    });

    it('view image', () => {
      getElemWithDataCy(contextMenu.zoomAction).click();
      cy.wait(200);
      cy.get('#ic-modal-image img').should('have.attr', 'src').should('contain', imageUrl);
      cy.get('#ic-backdrop').click();
      cy.get('#ic-modal-image').should('not.exist');
    });

    it('focus', () => {
      getElemWithDataCy(contextMenu.bringToFrontAction).click();
      cy.get('#note0').should('have.css', 'z-index', '3');
    });

    it('select', () => {
      getElemWithDataCy(contextMenu.selectAction).click();
      cy.get('#ic-visual-toolbar').should('be.visible');
      cy.get('#note0').should('have.css', 'border-color', 'rgb(40, 138, 255)');
    });

    it('delete', () => {
      getElemWithDataCy(contextMenu.discardAction).click();
      cy.get('#ic-modal').should('contain', 'Are you sure');
      cy.get('#ic-modal-confirm').click();
      cy.wait(200);
      cy.get('.ic-sticky-note').should('have.length', 0);
    });
  });
  //
  // describe('doodle note context menu', () => {
  //   beforeAll(() => {
  //     b.moveToObject('body', x, y);
  //     b.keys('Alt');
  //     b.doDoubleClick();
  //     b.keys('Alt');
  //     b.waitForVisible('#ic-doodle-form');
  //
  //     // draw doodle
  //     b.moveToObject('#ic-doodle', 155, 75);
  //     b.buttonDown(0);
  //     b.moveToObject('#ic-doodle', 255, 175);
  //     b.buttonUp(0);
  //     cy.wait(200);
  //
  //     b.click('button[name=ship]');
  //     cy.wait(200);
  //     expect('div.ic-sticky-note').to.have.count(1);
  //   });
  //
  //   it('correct options enabled', () => {
  //     expect('.ic-menu-item').to.have.count(7);
  //     expect('.ic-menu-item.disabled').to.have.count(2);
  //   });
  //
  //   it('edit is disabled', () => {
  //     b.elements('.ic-menu-item').value[0].click();
  //     expect('#ic-toast').to.be.visible();
  //     expect('#ic-toast').to.have.text(/cannot be edited/);
  //   });
  //
  //   it('upvote', () => {
  //     b.elements('.ic-menu-item').value[1].click();
  //     expect('#note0 .ic-upvote').to.be.visible();
  //     expect('#note0 .ic-upvote').to.have.text(/\+1/);
  //   });
  //
  //   it('view sketch', () => {
  //     b.elements('.ic-menu-item').value[3].click();
  //     cy.wait(200);
  //     expect('#ic-modal-image').to.be.visible();
  //     expect(b.getAttribute('#ic-modal-image img', 'src')).to.include('data:image/png;base64');
  //     b.moveToObject('#ic-modal-image img', -10, -10);
  //     b.leftClick();
  //     expect('#ic-modal-image').to.not.be.visible();
  //   });
  //
  //   it('focus', () => {
  //     b.elements('.ic-menu-item').value[4].click();
  //     expect(b.getCssProperty('#note0', 'z-index').value).to.equal(3);
  //   });
  //
  //   it('select', () => {
  //     b.elements('.ic-menu-item').value[5].click();
  //     expect('#ic-visual-toolbar').to.be.visible();
  //     expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(40,138,255)');
  //   });
  //
  //   it('delete', () => {
  //     b.elements('.ic-menu-item').value[6].click();
  //     expect('#ic-modal').to.be.visible();
  //     expect('#ic-modal').to.be.have.text(/Are you sure/);
  //     b.click('#ic-modal-confirm');
  //     cy.wait(200);
  //     expect('.ic-sticky-note').to.have.count(0);
  //   });
  // });
  //
  // describe('text draft context menu', () => {
  //   beforeAll(() => {
  //     b.moveToObject('body', x, y);
  //     b.doDoubleClick();
  //     b.waitForVisible('#ic-note-form');
  //     b.setValue('#ic-form-text .ql-editor', 'text note');
  //     b.click('button[name=draft]');
  //     cy.wait(200);
  //     expect('div.ic-sticky-note').to.have.count(1);
  //   });
  //
  //   it('correct options enabled', () => {
  //     expect('.ic-menu-item').to.have.count(7);
  //     expect('.ic-menu-item.disabled').to.have.count(3);
  //   });
  //
  //   it('edit', () => {
  //     b.elements('.ic-menu-item').value[0].click();
  //     expect('#ic-note-form').to.be.visible();
  //     expect('#ic-form-text').to.have.text(/text note/);
  //     b.click('button[name=nvm]');
  //   });
  //
  //   it('upvote disabled', () => {
  //     b.elements('.ic-menu-item').value[1].click();
  //     expect('#note0 .ic-upvote').to.not.be.visible();
  //   });
  //
  //   it('view image disabled', () => {
  //     b.elements('.ic-menu-item').value[3].click();
  //     cy.wait(200);
  //     expect('#ic-modal-image').to.not.be.visible();
  //   });
  //
  //   it('focus', () => {
  //     b.elements('.ic-menu-item').value[4].click();
  //     expect(b.getCssProperty('#note0', 'z-index').value).to.equal(3);
  //   });
  //
  //   it('select disabled', () => {
  //     b.elements('.ic-menu-item').value[5].click();
  //     expect('#ic-visual-toolbar').to.not.be.visible();
  //     expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(0,0,0)');
  //   });
  //
  //   it('discard', () => {
  //     b.elements('.ic-menu-item').value[6].click();
  //     expect('#ic-modal').to.be.visible();
  //     expect('#ic-modal').to.be.have.text(/Are you sure/);
  //     b.click('#ic-modal-confirm');
  //     cy.wait(200);
  //     expect('.ic-sticky-note').to.have.count(0);
  //   });
  // });
  //
  // describe('image draft context menu', () => {
  //   beforeAll(() => {
  //     b.moveToObject('body', x, y);
  //     b.keys('Shift');
  //     b.doDoubleClick();
  //     b.keys('Shift');
  //     b.waitForVisible('#ic-image-form');
  //     b.setValue('#ic-form-text', imageUrl);
  //     b.click('button[name=draft]');
  //     cy.wait(200);
  //     expect('div.ic-sticky-note').to.have.count(1);
  //   });
  //
  //   it('correct options enabled', () => {
  //     expect('.ic-menu-item').to.have.count(7);
  //     expect('.ic-menu-item.disabled').to.have.count(2);
  //   });
  //
  //   it('edit', () => {
  //     b.elements('.ic-menu-item').value[0].click();
  //     expect('#ic-image-form').to.be.visible();
  //     expect('#ic-form-text').to.have.text(/cesarsway/);
  //     b.click('button[name=nvm]');
  //   });
  //
  //   it('upvote disabled', () => {
  //     b.elements('.ic-menu-item').value[1].click();
  //     expect('#note0 .ic-upvote').to.not.be.visible();
  //   });
  //
  //   it('view image', () => {
  //     b.elements('.ic-menu-item').value[3].click();
  //     cy.wait(200);
  //     expect('#ic-modal-image').to.be.visible();
  //     expect(b.getAttribute('#ic-modal-image img', 'src')).to.contain('cesarsway');
  //     b.moveToObject('#ic-modal-image img', -10, -10);
  //     b.leftClick();
  //     expect('#ic-modal-image').to.not.be.visible();
  //   });
  //
  //   it('focus', () => {
  //     b.elements('.ic-menu-item').value[4].click();
  //     expect(b.getCssProperty('#note0', 'z-index').value).to.equal(3);
  //   });
  //
  //   it('select disabled', () => {
  //     b.elements('.ic-menu-item').value[5].click();
  //     expect('#ic-visual-toolbar').to.not.be.visible();
  //     expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(0,0,0)');
  //   });
  //
  //   it('discard', () => {
  //     b.elements('.ic-menu-item').value[6].click();
  //     expect('#ic-modal').to.be.visible();
  //     expect('#ic-modal').to.be.have.text(/Are you sure/);
  //     b.click('#ic-modal-confirm');
  //     cy.wait(200);
  //     expect('.ic-sticky-note').to.have.count(0);
  //   });
  // });
  //
  // describe('doodle note context menu', () => {
  //   beforeAll(() => {
  //     b.moveToObject('body', x, y);
  //     b.keys('Alt');
  //     b.doDoubleClick();
  //     b.keys('Alt');
  //     b.waitForVisible('#ic-doodle-form');
  //
  //     // draw doodle
  //     b.moveToObject('#ic-doodle', 155, 75);
  //     b.buttonDown(0);
  //     b.moveToObject('#ic-doodle', 255, 175);
  //     b.buttonUp(0);
  //     cy.wait(200);
  //
  //     b.click('button[name=draft]');
  //     cy.wait(200);
  //     expect('div.ic-sticky-note').to.have.count(1);
  //   });
  //
  //   it('correct options enabled', () => {
  //     expect('.ic-menu-item').to.have.count(7);
  //     expect('.ic-menu-item.disabled').to.have.count(4);
  //   });
  //
  //   it('edit is disabled', () => {
  //     b.elements('.ic-menu-item').value[0].click();
  //     expect('#ic-toast').to.be.visible();
  //     expect('#ic-toast').to.have.text(/cannot be edited/);
  //   });
  //
  //   it('upvote disabled', () => {
  //     b.elements('.ic-menu-item').value[1].click();
  //     expect('#note0 .ic-upvote').to.not.be.visible();
  //   });
  //
  //   it('view sketch', () => {
  //     b.elements('.ic-menu-item').value[3].click();
  //     cy.wait(200);
  //     expect('#ic-modal-image').to.be.visible();
  //     expect(b.getAttribute('#ic-modal-image img', 'src')).to.include('data:image/png;base64');
  //     b.moveToObject('#ic-modal-image img', -10, -10);
  //     b.leftClick();
  //     expect('#ic-modal-image').to.not.be.visible();
  //   });
  //
  //   it('focus', () => {
  //     b.elements('.ic-menu-item').value[4].click();
  //     expect(b.getCssProperty('#note0', 'z-index').value).to.equal(3);
  //   });
  //
  //   it('select disabled', () => {
  //     b.elements('.ic-menu-item').value[5].click();
  //     expect('#ic-visual-toolbar').to.not.be.visible();
  //     expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(0,0,0)');
  //   });
  //
  //   it('discard', () => {
  //     b.elements('.ic-menu-item').value[6].click();
  //     expect('#ic-modal').to.be.visible();
  //     expect('#ic-modal').to.be.have.text(/Are you sure/);
  //     b.click('#ic-modal-confirm');
  //     cy.wait(200);
  //     expect('.ic-sticky-note').to.have.count(0);
  //   });
  // });
});
