import $ from 'jquery';
import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as compassX from '../actions/compass';
import * as uiX from '../actions/ui';

import SelectArea from './SelectArea';
import NoteManager from './NoteManager.jsx';
import NoteManagerViewOnly from './NoteManagerViewOnly.jsx';
import MaybeTappable from '../../utils/MaybeTappable';

import Modal from '../../utils/Modal';
import Socket from '../../utils/Socket';
import Storage from '../../utils/Storage';
import Toast from '../../utils/Toast';

import { EDITING_MODE } from '../../../lib/constants';

const QUADRANTS = [
  { id: 'observations', prompt: '2. What\'s happening? Why?' },
  { id: 'principles', prompt: '3. What matters most?' },
  { id: 'ideas', prompt: '4. What ways are there?' },
  { id: 'experiments', prompt: '5. What\'s a step to try?' },
];

class Compass extends Component {
  constructor(props) {
    super(props);

    this.hasEditingRights = !this.props.viewOnly;
    this.state = {
      showFullTopic: false,
    };

    if (this.hasEditingRights) {
      this.state.select = false;
      this.toast = Toast.getInstance();
      this.modal = Modal.getInstance();
      this.socket = Socket.getInstance();
      this.socket.subscribe({
        'center set': this.setCompassCenter,
      });
      if (props.compass.center.length === 0) {
        this.setPeopleInvolved();
      }
    }
  }

  componentDidMount() {
    this.props.uiX.setBookmark(Storage.hasBookmark(this.props.compass.editCode));
  }

  doubleClickCreate = (ev) => {
    this.setState({ select: false });

    if (ev.shiftKey) {
      this.socket.emitMetric('double click image');
      this.props.uiX.showImage(ev);
      return;
    }

    if (ev.altKey) {
      this.socket.emitMetric('double click doodle');
      this.props.uiX.showDoodle(ev);
      return;
    }

    this.socket.emitMetric('double click text');
    this.props.uiX.showNewNote(ev);
  };

  onTouchStart = (ev) => {
    // ignore if pinch
    if (isMobile && ev.touches.length === 2) {
      return;
    }
    if (this.longPress) {
      this.doubleClickCreate(ev);
    }
  };

  debouncedTouchStart = _.debounce(this.onTouchStart, 1000);

  onTouchRelease = () => {
    this.longPress = false;
  };

  onMouseDown = (ev) => {
    if (ev.target.className !== 'interactable') return;
    this.setState({ select: {x: ev.clientX, y: ev.clientY} });
  };

  onMouseUp = () => {
    this.setState({ select: false });
  };

  onClick = (ev) => {
    if (ev.target.className !== 'interactable') return;
    if (this.props.visualMode) {
      this.props.uiX.normalMode();
    }
  };

  renderQuadrant = (q) => {
    return (
      <div className="ic-quadrant"
           key={`quadrant-${q.id}`}
           style={{
             width: this.props.ui.vw / 2,
             height: this.props.ui.vh / 2,
           }}
           id={q.id}>
        <div className={'interactable'}
             onDoubleClick={this.doubleClickCreate}
             onClick={this.onClick}
             onTouchStart={(e) => {
               e.persist();
               this.longPress = true;
               this.debouncedTouchStart(e);
             }}
             onTouchEnd={this.onTouchRelease}
             onMouseDown={this.onMouseDown}
             onMouseUp={this.onMouseUp} />
        <div>
          <h1>{q.id.toUpperCase()}</h1>
          <h2>{q.prompt}</h2>
        </div>
      </div>
    );
  };

  renderLabels() {
    let left = this.props.ui.vw / 2 - 35,
      top = this.props.ui.vh / 2 - 9;

    return (
      <div>
        <div className="ic-compass-label" style={{ left: '5px', top: top }}>PRESENT</div>
        <div className="ic-compass-label" style={{ left: left, top: '5px' }}>BIG PICTURE</div>
        <div className="ic-compass-label" style={{ right: '5px', top: top }}>FUTURE</div>
        <div className="ic-compass-label" style={{ left: left, bottom: '5px' }}>DETAILS</div>
      </div>
    );
  }

  setCompassCenter = (center) => {
    if (this.props.compass.center.length === 0) {
      // animate only if setting center for a new workspace
      this.animateQuadrants = true;
    }
    this.props.compassX.setCenter(center);
  };

  fadeInQuadrants = (deltaTimeMs) => {
    const start = 50;
    setTimeout(() => $('#observations').css({opacity: 1}), start);
    setTimeout(() => $('#principles').css({opacity: 1}), start + deltaTimeMs);
    setTimeout(() => $('#ideas').css({opacity: 1}), start + (2 * deltaTimeMs));
    setTimeout(() => $('#experiments').css({opacity: 1}), start + (3 * deltaTimeMs));
  };

  getCenterCss(r) {
    return {
      top: Math.max((this.props.ui.vh - r) / 2, 0),
      left: Math.max((this.props.ui.vw - r) / 2, 0),
      width: r,
      height: r,
    };
  }

  getCenterTextCss = (charPerLine, r, width) => {
    const lineHeight = 13;

    const words = this.props.compass.center.split(' ');
    let currLine = words.shift().length;
    let numLines = 0;

    while (words.length > 0) {
      let w = words.shift();
      if (currLine + w.length + 1 > charPerLine) {
        numLines++;
        currLine = w.length;
      } else {
        currLine += w.length + 1;
      }
    }
    if (currLine > 0) numLines++;

    let textHeight = lineHeight * numLines;
    return {
      marginTop: (r - textHeight) / 2,
      width,
    };
  };

  setPeopleInvolved = () => {
    this.modal.promptForCenter(this.toast.warn, (people) => {
      this.socket.emitSetCenter(this.props.compass._id, people);
    });
  };

  editPeopleInvolved = () => {
    this.modal.editCenter(this.props.compass.center, (edited) => {
      if (!edited) {
        return;
      }

      this.socket.emitSetCenter(this.props.compass._id, edited);
    });
  };

  showOrHideFullTopic = () => {
    this.setState({ showFullTopic: !this.state.showFullTopic });
  };

  renderPromptFirstQuestion() {
    const style = Object.assign(this.getCenterCss(100, 100), {zIndex: 5});
    return (
      <div>
        <div id="center" className="wordwrap" style={style} onClick={this.setPeopleInvolved}>
          <p id="first-prompt">Start here</p>
        </div>
        <div id="hline" style={{ top: this.props.ui.vh / 2 - 2 }}/>
        <div id="vline" style={{ left: this.props.ui.vw / 2 - 2 }}/>
        {this.renderLabels()}
      </div>
    );
  }

  renderCompassStructure = () => {
    const { center, topic } = this.props.compass;
    let css, length;
    if (center.length <= 40) {
      css = this.getCenterTextCss(11, length = 100);
    } else if (center.length <= 70) {
      css = this.getCenterTextCss(14, length = 120);
    } else {
      // center text at most 100
      css = this.getCenterTextCss(16, length = 140);
    }

    let displayedTopic = topic;
    let needsTooltip = true;
    if (!this.state.showFullTopic) {
      const topicLengthCap = 35;
      if (topic.length > topicLengthCap) {
        displayedTopic = '';
        const words = topic.split(' ');
        while (displayedTopic.length + words[0].length < topicLengthCap) {
          displayedTopic += words.shift() + ' ';
        }
        displayedTopic += '...';
      } else {
        needsTooltip = false;
      }
    }

    return (
      <div>
        <div id="center"
             data-tip="Double-click to edit"
             data-for="center-tooltip"
             style={{
               ...this.getCenterCss(length, length),
               cursor: this.hasEditingRights ? 'pointer' : 'auto',
             }}
             onDoubleClick={this.hasEditingRights ? this.editPeopleInvolved : _.noop} >
          <p className="wordwrap" style={css}>{center}</p>
        </div>
        {this.hasEditingRights &&
          <ReactTooltip id={'center-tooltip'}
                        place={'bottom'}
                        type={Storage.getTooltipTypeBasedOnDarkTheme()}
                        delayShow={200}
                        effect={'solid'}/>
        }
        <div id="hline" style={{ top: this.props.ui.vh / 2 - 2 }}/>
        <div id="vline" style={{ left: this.props.ui.vw / 2 - 2 }}/>
        {_.map(QUADRANTS, this.renderQuadrant)}
        {this.renderLabels()}
        <MaybeTappable onTapOrClick={this.showOrHideFullTopic}>
          <div id={'ic-compass-topic'}
               data-tip={this.state.showFullTopic ? 'Click to truncate' : 'Click to expand'}
               data-for="topic-tooltip">
            TOPIC: {displayedTopic}
          </div>
        </MaybeTappable>
        {needsTooltip &&
        <ReactTooltip id={'topic-tooltip'}
                      place={'top'}
                      type={Storage.getTooltipTypeBasedOnDarkTheme()}
                      effect={'solid'} />
        }
      </div>
    );
  };

  render() {
    if (this.props.viewOnly) {
      this.fadeInQuadrants(0);
      return (
        <div id={'compass'}>
          <NoteManagerViewOnly/>
          {this.renderCompassStructure()}
        </div>
      );
    }

    let compass;
    if (this.props.compass.center.length === 0) {
      compass = this.renderPromptFirstQuestion();
    } else {
      if (this.animateQuadrants) {
        this.animateQuadrants = false;
        this.fadeInQuadrants(800);
        setTimeout(() => {
          this.toast.info('You\'re all set up! Double click anywhere to get started.');
        }, 3250);
      } else {
        this.fadeInQuadrants(0);
      }

      compass = this.renderCompassStructure();
    }

    return (
      <div id="compass" style={{
        width: this.props.ui.vw,
        maxWidth: this.props.ui.vw,
        height: this.props.ui.vh,
        maxHeight: this.props.ui.vh,
      }}>
        <NoteManager/>
        {this.props.ui.bookmarked && <div id={'ic-bookmark-indicator'}><i className={'material-icons'}>bookmark</i></div>}
        <SelectArea show={this.state.select} done={this.onMouseUp}/>
        {compass}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    compass: state.compass,
    ui: state.ui,
    visualMode: state.ui.editingMode === EDITING_MODE.VISUAL,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
    compassX: bindActionCreators(compassX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Compass);
