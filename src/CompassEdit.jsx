'use strict';

import React, { Component } from 'react';
import _ from 'underscore';

import Sidebar from './Sidebar.jsx';
import NoteForm from './NoteForm.jsx';
import StickyNote from './StickyNote.jsx';
import Explanation from './Explanation.jsx';
import HelpScreen from './HelpScreen.jsx';
import Shared from './Shared.jsx';
import Chat from './Chat.jsx';
import DoodleForm from './DoodleForm.jsx';

import Helper from './CompassHelper.jsx';

import { QUADRANTS_INFO, KEYCODES, PROMPTS, COLORS } from '../utils/constants.js';

let modifier = false; // to differentiate between 'c' and 'ctrl-c'
let drag = false;

export default class CompassEdit extends Component {

	constructor(props, context) {
	    super(props, context);

	    this.state = {
            vw: window.innerWidth,
            vh: window.innerHeight,
            newNote: false,
            editNote: false,
            dragNote: false,
            doodleNote: false,
            compass: this.props.compass,
            username: this.props.username,
            users: {},
            showSidebar: true,
            showChat: true,
            showExplanation: false,
            showHelp: false,
            disconnected: false,
            unread: false,
            messages: [{
                info: true,
                text: 'These messages will be cleared when you log out'
            }]
        };

        // socket handler events
	    this.socket = io();
	    this.socket.on('assigned name', Helper.setUsername.bind(this));
        this.socket.on('update notes', Helper.updateNotes.bind(this));
        this.socket.on('user joined', Helper.handleUserJoined.bind(this));
        this.socket.on('user left', Helper.handleUserLeft.bind(this));
        this.socket.on('disconnect', Helper.handleDisconnect.bind(this));
        this.socket.on('reconnect', Helper.handleReconnect.bind(this));
        this.socket.on('new message', Helper.updateMessages.bind(this));
        this.socket.on('compass deleted', Helper.handleCompassDeleted.bind(this));

        // socket emit events
	    this.emitEditNote = Helper.emitEditNote.bind(this);
	    this.emitDragNote = Helper.emitDragNote.bind(this);
	    this.emitNewNote = Helper.emitNewNote.bind(this);
	    this.emitNewDoodle = Helper.emitNewDoodle.bind(this);
	    this.emitDeleteCompass = Helper.emitDeleteCompass.bind(this);
	    this.emitDeleteNote = Helper.emitDeleteNote.bind(this);

	    // Shared methods
	    this.renderNote = Shared.renderNote.bind(this);
	    this.center = Shared.center.bind(this);
	    this.getCompassStructure = Shared.getCompassStructure.bind(this);

	    // user events
	    this.showEditForm = this.showEditForm.bind(this);
	    this.showDoodleForm = this.showDoodleForm.bind(this);
	    this.closeForm = this.closeForm.bind(this);
	    this.showNewNote = this.showNewNote.bind(this);
	    this.toggleSidebar = this.toggleSidebar.bind(this);
	    this.toggleExplain = this.toggleExplain.bind(this);
	    this.toggleHelp = this.toggleHelp.bind(this);
	    this.toggleChat = this.toggleChat.bind(this);
	    this.renderQuadrant = Shared.renderQuadrant;

        this.keypressHandler = {
            78: this.showNewNote,
            67: this.toggleChat,
            68: this.showDoodleForm,
            72: this.toggleHelp,
            83: this.toggleSidebar,
            87: this.toggleExplain
        };
	}

	componentDidMount() {
	    $(window).on('resize', this.updateWindowSize.bind(this));
	    $(window).on('keydown', this.handleKeyDown.bind(this));
	    $(window).on('keyup', this.handleKeyUp.bind(this));
	    this.socket.emit('connect compass', {
	        code: this.state.compass.editCode,
	        username: this.state.username,
	        compassId: this.state.compass._id
	    });

        // set up draggable sticky notes
	    interact('.draggable').draggable({
            restrict: {
                restriction: "parent",
                endOnly: true,
                elementRect: {top:0, left:0, bottom:1, right:1}
            },
            autoScroll: true,
            onstart: this.beginDrag.bind(this),
            onmove: this.dragTarget.bind(this),
            onend: this.emitDragNote
        });
	}

    componentWillUnmount() {
        this.socket.disconnect();
    }

    setTranslation(target, x, y) {
        // translate the element
        target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    beginDrag(e) {
        // id of target e.g. 'note8'
        let draggedNoteIndex = Number(e.target.id.substring(4));
        this.setState({dragNote: draggedNoteIndex});
    }

    dragTarget(e) {
        drag = true;
        let x = (parseFloat(e.target.getAttribute('data-x')) || 0) + e.dx;
        let y = (parseFloat(e.target.getAttribute('data-y')) || 0) + e.dy;

        this.setTranslation(e.target, x, y);
    }

    handleKeyDown(e) {
        if (this.state.newNote || this.state.editNote || this.state.doodleNote) {
            if (e.which === 27) this.closeForm();
            return;
        }

        if (document.activeElement.id === 'message-text') return;

        if (Helper.isControlKey(e.which) && !modifier) {
            e.preventDefault();
            this.keypressHandler[e.which]();
        } else if (Helper.isModifierKey(e.which)) {
            modifier = true;
            setTimeout(() => modifier = false, 5000);
        }
    }

    handleKeyUp(e) {
        if (Helper.isModifierKey(e.which))
            modifier = false;
    }

    updateWindowSize() {
        this.setState({vw: window.innerWidth, vh: window.innerHeight});
    }

    toggleSidebar() {
        this.setState({showSidebar: !this.state.showSidebar});
    }

    toggleExplain() {
        this.setState({showExplanation: !this.state.showExplanation});
    }

    toggleHelp() {
        this.setState({showHelp: !this.state.showHelp});
    }

    toggleChat() {
        this.setState({showChat: !this.state.showChat, unread: false});
    }

    closeForm() {
        $('#form-text').val('');
        this.setState({newNote: false, editNote: false, doodleNote: false});
    }

    showNewNote() {
        this.setState({newNote: true, editNote: false, doodleNote: false});
    }

    showEditForm(note) {
        if (drag) return drag = false;
        if (note.doodle) return;
        this.setState({editNote: note, newNote: false, doodleNote: false});
    }

    showDoodleForm() {
        this.setState({editNote: false, newNote: false, doodleNote: true});
    }

    validateText() {
        let text = $('#ic-form-text').val();
        if (text === '') return false;
        if (text.length > 200) {
            alert(PROMPTS.POST_IT_TOO_LONG);
            return false;
        }
        return text;
    }

    alertInvalidAction() {
        alert(PROMPTS.NOT_CONNECTED);
        this.setState({showSidebar: true});
    }

    getForm() {
        if (this.state.newNote) {
            return <NoteForm
                style={this.center(300,230)}
                title={'Make a new post-it'}
                make={this.emitNewNote}
                close={this.closeForm}
            />
        } else if (this.state.editNote && drag === false) {
            return <NoteForm
                style={this.center(300,230)}
                title={'Edit this post-it'}
                text={this.state.editNote.text}
                make={this.emitEditNote}
                close={this.closeForm}
            />
        } else if (this.state.doodleNote) {
            return <DoodleForm
                style={this.center(450, 345)}
                bg={this.state.users.usernameToColor[this.state.username]}
                close={this.closeForm}
                save={this.emitNewDoodle}
            />
        }
        return null;
    }

    getHelpScreen() {
        if (this.state.showHelp)
            return <HelpScreen style={this.center(420,300)} close={this.toggleHelp}/>
        return null;
    }

    getExplanation() {
        if (this.state.showExplanation)
            return <Explanation close={this.toggleExplain} />;
        return null;
    }

    getStickies() {
        return _.map(this.state.compass.notes, this.renderNote);
    }

    getSidebar() {
        return (
            <Sidebar viewCode={this.state.compass.viewCode}
                editCode={this.state.compass.editCode}
                users={this.state.users.usernameToColor}
                you={this.state.username}
                show={this.state.showSidebar}
                disconnected={this.state.disconnected}
                toggleSidebar={this.toggleSidebar}
                destroy={this.emitDeleteCompass}
            />
        );
    }

    getChat() {
        return (
            <Chat messages={this.state.messages}
                colorMap={this.state.users.usernameToColor}
                username={this.state.username}
                socket={this.socket}
                show={this.state.showChat}
                toggleChat={this.toggleChat}
            />
        );
    }

	render() {
        return (
            <div id="compass">
                {this.getStickies()}
                {this.getForm()}
                {this.getHelpScreen()}
                {this.getExplanation()}
                {this.getCompassStructure(this.state.compass.center)}
                <button id="show-sidebar" onClick={this.toggleSidebar}>Show Sidebar</button>
                {this.getSidebar()}
                <button id="show-chat" onClick={this.toggleChat} style={{background: this.state.unread ? COLORS.RED : COLORS.DARK}}>Show Chat</button>
                {this.getChat()}
            </div>
		);
	}
};

