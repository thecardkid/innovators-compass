import React from 'react';
import { browserHistory } from 'react-router';

import Modal from '../../utils/Modal';
import Storage from '../../utils/Storage';

export default class DisableAutoEmail extends React.Component {
  componentDidMount() {
    Storage.setAlwaysSendEmail(false);

    Modal.getInstance().alert({
      heading: 'Auto-email has been turned off',
      body: 'At your request, you will no longer receive automatic emails when creating workspaces. Click below to go to the home page.',
      cb: () => browserHistory.push('/'),
    });
  }

  render() {
    return <div/>;
  }
}
