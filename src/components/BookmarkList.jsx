import React, { Component } from 'react';
import _ from 'underscore';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket';
import Storage from '../utils/Storage';
import ToastSingleton from '../utils/Toast';

import { MODALS, REGEX } from '../../lib/constants';
import Bookmark from './Bookmark';

export default class BookmarkList extends Component {
  constructor(props) {
    super(props);
    this.modal = Modal.getInstance();
    this.socket = Socket.getInstance();
    this.toast = ToastSingleton.getInstance();

    let b = Storage.getBookmarks();
    this.state = {
      bookmarks: b,
      show: new Array(b.length).fill(false),
      showBookmarks: Storage.getShowBookmarks(),
    };
  }

  edit = (idx) => (e) => {
    e.stopPropagation();
    this.modal.prompt(MODALS.EDIT_BOOKMARK, (updated, newName) => {
      if (updated && newName) {
        let bookmarks = Storage.updateName(idx, newName);
        this.setState({ bookmarks });
      }
    }, this.state.bookmarks[idx].center);
  };

  remove = (idx) => (e) => {
    e.stopPropagation();
    this.modal.confirm(MODALS.DELETE_BOOKMARK, (deleteBookmark) => {
      if (deleteBookmark) {
        let bookmarks = Storage.removeBookmark(idx);
        let show = this.state.show;
        show.splice(idx, 1);
        this.setState({ bookmarks, show });
      }
    });
  };

  expand = (idx) => () => {
    let show = this.state.show;
    show[idx] = !show[idx];
    this.setState({ show });
  };

  renderBookmark = (w, idx) => {
    return (
      <Bookmark expand={this.expand(idx)}
                remove={this.remove(idx)}
                onSortItems={this.onSort}
                items={this.state.bookmarks}
                sortId={idx}
                edit={this.edit(idx)}
                w={w}
                key={idx}
                show={this.state.show[idx]}
      />
    );
  };

  toggleBookmarks = () => {
    const showBookmarks = Storage.setShowBookmarks(!this.state.showBookmarks);
    this.setState({ showBookmarks });
  };

  importBookmarks = (e) => {
    const file = e.target.files[0];

    if (file.type !== 'application/json') {
      return this.toast.error('Invalid file type - must be .json file');
    }

    const reader = new FileReader();
    reader.onload = this.onReaderLoad;
    reader.readAsText(file);
    e.target.value = null;
  };

  isValidBookmark({ center, href, name }) {
    if (!center || !href || !name) {
      return false;
    }

    const hrefRegex = /^\/compass\/edit\/[a-zA-Z0-9]{8}\/[a-zA-Z]{1,15}$/;
    if (!hrefRegex.test(href)) return false;

    const usernameRegex = /^[a-zA-Z]{1,15}$/;
    return usernameRegex.test(name);
  }

  onReaderLoad = (ev) => {
    const uploadedJSON = ev.target.result;

    try {
      const bookmarks = JSON.parse(uploadedJSON);

      if (_.isEmpty(bookmarks)) {
        return this.toast.info('Nothing happened - the file was empty');
      }

      const validBookmarks = [];
      for (let i = 0; i < bookmarks.length; i++) {
        const { center, href, name } = bookmarks[i];
        if (!this.isValidBookmark({ center, href, name })) {
          throw new Error;
        }

        validBookmarks.push({ center, href, name });
      }

      Storage.addAllBookmarks(validBookmarks);
      const newBookmarks = Storage.getBookmarks();

      this.setState({
        bookmarks: newBookmarks,
        show: new Array(newBookmarks.length).fill(false),
      });
      this.toast.success('Bookmarks imported!');
      this.emailBookmarks();
    } catch (ex) {
      this.modal.alert('<h3>Whoops</h3><p>The file you uploaded does not have the correct format. Please export your bookmarks again and retry with the new file.</p>');
    }
  };

  exportBookmarks = () => {
    if (_.isEmpty(this.state.bookmarks)) {
      return this.toast.warn('You have no bookmarks to export to file');
    }

    this.modal.prompt(
      '<h3>Export bookmarks</h3><p>Enter a name for the file:</p>',
      (accepted, filename) => {
        if (!accepted || !filename) return;

        const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(Storage.getBookmarks()));
        const anchor = this.refs.exporter;
        anchor.setAttribute('href', data);
        anchor.setAttribute('download', `${filename}.json`);
        anchor.click();
      },
      'icompass-bookmarks',
    );
  };

  clickFile = () => {
    this.refs.importer.click();
  };

  emailBookmarks = (currentEmail) => {
    currentEmail = typeof currentEmail === 'string' ? currentEmail : null;

    this.modal.prompt(
      '<h3>Email your bookmarks</h3><p>Enter your email below to receive all links to your bookmarked workspaces.</p><p>I will not store your email address or send you spam.</p>',
      (accepted, email) => {
        if (!accepted) return;

        if (!email.length) return;

        if (!REGEX.EMAIL.test(email)) {
          this.toast.error(`"${email}" is not a valid email address`);
          this.emailBookmarks(email);
          return;
        }

        this.socket.emitWorkspace('send mail bookmarks', {
          bookmarks: this.state.bookmarks,
          email,
        });
      },
      currentEmail,
    );
  };

  onSort = (bookmarks) => {
    Storage.setBookmarks(bookmarks);
    this.setState({ bookmarks });
  };

  filter = (e) => {
    const search = e.target.value.toLowerCase();
    const storageBookmarks = Storage.getBookmarks();

    let bookmarks;
    if (search) {
      bookmarks = _.filter(storageBookmarks, bookmark => {
        const name = bookmark.center.toLowerCase();
        return name.includes(search);
      });
    } else {
      bookmarks = storageBookmarks;
    }
    this.setState({ bookmarks });
  };

  render() {
    let list = _.map(this.state.bookmarks, this.renderBookmark);
    const { showBookmarks } = this.state;

    return (
      <div id={'ic-bookmarks'} style={{left: showBookmarks ? '0' : '-200px'}}>
        <div id={'bookmark-button'}
             style={{left: showBookmarks ? '200px' : '0'}}
             onClick={this.toggleBookmarks}>
          <i className="material-icons">bookmark</i>
        </div>
        <div id="contents">
          <h1>Bookmarks</h1>
          <input placeholder={'Search'}
                 id={'bookmark-search'}
                 onChange={this.filter} />
          <ul className={'sortable-list'}>{list}</ul>
        </div>
        <div id={'ic-bookmark-footer'}>
          <button id={'email'} onClick={this.emailBookmarks}>Email</button>
          <button id={'import'} onClick={this.clickFile}>Import</button>
          <button id={'export'} onClick={this.exportBookmarks}>Export</button>
          <a className={'hidden'} ref={'exporter'} />
          <input className={'hidden'}
                 type={'file'}
                 ref={'importer'}
                 multiple={false}
                 onChange={this.importBookmarks}/>
        </div>
      </div>
    );
  }
}
