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

import Store from '../store';

ReactGA.initialize('UA-127849582-1');

class App extends Component {
  render() {
    return (
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
    );
  }
}

$(window).ready(() => render(<App/>, document.getElementById('container')));
