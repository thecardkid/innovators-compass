import React, { Component } from 'react';
import { Link } from 'react-router';

export default class NotFound extends Component {
  render() {
    return (
      <div id={'ic-404'}>
        <div id={'emoji'}>
          <img src={'https://images.emojiterra.com/twitter/v11/512px/1f615.png'} />
        </div>
        <div id={'are-you-lost'}>
          <p>
            Nothing here.
          </p>
          <h2>
            Are you lost?
          </h2>
          <h1>
            Try <Link to='/'>this compass</Link>.
          </h1>
      </div>
      </div>
    );
  }
}
