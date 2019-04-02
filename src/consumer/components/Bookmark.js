import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { sortable } from 'react-sortable';

class Bookmark extends Component {
  navigateTo = (href) => () => {
    browserHistory.push(href);
  };

  render() {
    const { w } = this.props;
    let style = {
      height: this.props.show ? '20px' : '0px',
      marginTop: this.props.show ? '15px' : '0px',
    };
    let info = (
      <div className="ic-saved-info" style={style}>
        <p>as &quot;{w.name}&quot;</p>
        <button className="remove" onClick={this.props.remove}>remove</button>
        <button className="edit" onClick={this.props.edit}>edit</button>
      </div>
    );

    let arrow = this.props.show ?
      <span id="arrow">&#9664;</span> :
      <span id="arrow">&#9660;</span>;

    return (
      <li className="ic-saved" {...this.props} onClick={this.props.expand}>
        <a onClick={this.navigateTo(w.href)}>{w.center}</a>
        {arrow}
        {info}
      </li>
    );
  }
}

export default sortable(Bookmark);
