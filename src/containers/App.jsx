import '../css/app.less';

import $ from 'jquery';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';

import DisableAutoEmail from '../containers/DisableAutoEmail';
import LandingPage from '../containers/LandingPage.jsx';
import NotFound from '../containers/NotFound.jsx';
import Workspace from '../containers/Workspace.jsx';

import PromptName from '../components/PromptName.jsx';

import MaybeTappable from '../utils/MaybeTappable';
import Toast from '../utils/Toast';

import Store from '../store';

(function() {
  if (GA_TRACKING_ID) {
    ReactGA.initialize(GA_TRACKING_ID, { standardImplementation: true });
    // eslint-disable-next-line no-console
    console.log('Initialized Google Analytics');
  }
})();

class App extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
  }

  componentDidMount() {
    this.toast.error('This is a test');
  }

  render() {
    return (
      <div>
        <MaybeTappable onTapOrClick={this.toast.clear}>
          <div id={'ic-toast'} />
        </MaybeTappable>
        <Provider store={Store()}>
          <Router history={browserHistory}>
            <Route path={'/'} component={LandingPage} />
            <Route path={'/compass/view/:code(/:username)'} viewOnly={true} component={Workspace} />
            <Route path={'/compass/edit/:code/:username'} viewOnly={false} component={Workspace} />
            <Route path={'/compass/edit/:code'} viewOnly={false} component={PromptName} />
            <Route path={'/disable-auto-email'} component={DisableAutoEmail} />
            <Route path={'*'} component={NotFound} />
          </Router>
        </Provider>
      </div>
    );
  }
}

$(window).ready(() => render(<App/>, document.getElementById('container')));
