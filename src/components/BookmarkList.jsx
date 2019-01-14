import React, { Component } from 'react';
import ReactGA from 'react-ga';
import ReactTooltip from 'react-tooltip';
import _ from 'underscore';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket';
import Storage from '../utils/Storage';
import ToastSingleton from '../utils/Toast';

import { REGEX } from '../../backend/lib/constants';
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
    ReactGA.modalview('modals/bookmarks-edit');
    this.modal.prompt({
      heading: 'Edit bookmark',
      body: 'Enter a new name for your bookmark:',
      defaultValue: this.state.bookmarks[idx].center,
      cb: (updated, newName) => {
        if (updated && newName) {
          let bookmarks = Storage.updateName(idx, newName);
          this.setState({ bookmarks });
        }
      },
    });
  };

  remove = (idx) => (e) => {
    e.stopPropagation();
    ReactGA.modalview('modals/bookmarks-remove');
    this.modal.confirm({
      body: 'You are about to remove this bookmark. This action cannot be undone.',
      confirmText: 'Delete',
      cb: (confirmed) => {
        if (confirmed) {
          let bookmarks = Storage.removeBookmark(idx);
          let show = this.state.show;
          show.splice(idx, 1);
          this.setState({ bookmarks, show });
        }
      },
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
      ReactGA.exception({
        description: 'Invalid bookmarks json file format/contents',
      });
      this.modal.alert({
        heading: 'Whoops...',
        body: 'The file you uploaded does not have the correct format. Please export your bookmarks again and retry with the new file.',
      });
    }
  };

  exportBookmarks = () => {
    if (_.isEmpty(this.state.bookmarks)) {
      return this.toast.warn('You have no bookmarks to export to file');
    }
    ReactGA.modalview('modals/bookmarks-export');
    this.modal.prompt({
      heading: 'Export bookmarks',
      body: 'Enter a name for the file:',
      defaultValue: 'icompass-bookmarks',
      cb: (accepted, filename) => {
        if (!accepted || !filename) return;

        const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(Storage.getBookmarks()));
        const anchor = this.refs.exporter;
        anchor.setAttribute('href', data);
        anchor.setAttribute('download', `${filename}.json`);
        anchor.click();
      },
    });
  };

  clickFile = () => {
    this.refs.importer.click();
  };

  emailBookmarks = (currentEmail) => {
    currentEmail = typeof currentEmail === 'string' ? currentEmail : '';
    ReactGA.modalview('modals/bookmarks-email');
    this.modal.prompt({
      heading: 'Email your bookmarks',
      body: [
        'Enter your email below to receive all links to your bookmarked workspaces.',
        'I will not store your email address or send you spam.',
      ],
      defaultValue: currentEmail,
      cb: (accepted, email) => {
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
    });
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

  renderActions = () => {
    return (
      <div className={'actions'}>
        <button id={'email'} onClick={this.emailBookmarks} data-tip data-for="email-tooltip">
          <i className={'material-icons'}>email</i>
        </button>
        <ReactTooltip id={'email-tooltip'} place={'right'} effect={'solid'}>
          <div className={'bookmark-tooltip'}>
            Receive an email with a list of all your bookmarks
          </div>
        </ReactTooltip>
        <button id={'export'} onClick={this.exportBookmarks} data-tip data-for="export-tooltip">
          <i className={'material-icons'}>cloud_download</i>
        </button>
        <ReactTooltip id={'export-tooltip'} place={'right'} effect={'solid'}>
          <div className={'bookmark-tooltip'}>
            Download your bookmarks as a .json file that you can upload to the app. Useful when you are changing devices, or if you are about to clear your cache data.
          </div>
        </ReactTooltip>
        <button id={'import'} onClick={this.clickFile} data-tip data-for="import-tooltip">
          <i className={'material-icons'}>cloud_upload</i>
        </button>
        <ReactTooltip id={'import-tooltip'} place={'right'} effect={'solid'}>
          <div className={'bookmark-tooltip'}>
            Upload the .json file you downloaded from another device to restore those bookmarks.
          </div>
        </ReactTooltip>
        <a className={'hidden'} ref={'exporter'} />
        <input className={'hidden'}
               type={'file'}
               ref={'importer'}
               multiple={false}
               onChange={this.importBookmarks}/>
      </div>
    );
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
          {this.renderActions()}
          <ul className={'sortable-list'}>{list}</ul>
        </div>
      </div>
    );
  }
}
