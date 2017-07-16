'use strict';

import React, { Component } from 'react';
import Tappable from 'react-tappable/lib/Tappable';
import deepEqual from 'deep-equal';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as uiActions from 'Actions/ui';
import * as workspaceActions from 'Actions/workspace';

import { PROMPTS, COLORS, EDITING_MODE } from 'Lib/constants';

class StickyNote extends Component {
    constructor(props) {
        super(props);

        this.confirmDelete = this.confirmDelete.bind(this);
        this.getContents = this.getContents.bind(this);
        this.getX = this.getX.bind(this);
        this.edit = this.edit.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.renderDoodle = this.renderDoodle.bind(this);
        this.renderText = this.renderText.bind(this);
        this.submitDraft = this.submitDraft.bind(this);

        this.hasEditingRights = !this.props.compass.viewOnly;
        this.compactMode = this.visualMode = this.draftMode = false;
    }

    shouldComponentUpdate(nextProps) {
        return (
            !deepEqual(this.props.note, nextProps.note) ||
            this.props.ui.vw !== nextProps.ui.vw ||
            this.props.ui.vh !== nextProps.ui.vh ||
            this.props.i !== nextProps.i ||
            this.props.ui.focusedNote !== nextProps.ui.focusedNote ||
            this.props.ui.editingMode === EDITING_MODE.VISUAL ||
            this.props.ui.editingMode !== nextProps.ui.editingMode
        );
    }

    componentWillUpdate(nextProps) {
        this.compactMode = nextProps.ui.editingMode === EDITING_MODE.COMPACT || false;
        this.visualMode = nextProps.ui.editingMode === EDITING_MODE.VISUAL || false;
        this.draftMode = nextProps.ui.editingMode === EDITING_MODE.DRAFT || false;
    }

    confirmDelete() {
        if (!this.visualMode && confirm(PROMPTS.CONFIRM_DELETE_NOTE))
            this.props.destroy(this.props.note._id);
    }

    submitDraft() {
        this.props.submitDraft(this.props.note, this.props.i);
    }

    getTooltip(n) {
        if (n.draft) {
            return <p className="ic-tooltip submit" onClick={this.submitDraft}>submit</p>;
        } else {
            return <p className="ic-tooltip">{n.user}</p>
        }
    }

    renderDoodle(n) {
        let s = {
            background: n.color,
            padding: n.isImage ? '3px' : '0',
        };

        return (
            <a className="ic-img" style={s}>
                <img src={n.doodle || n.text}
                    width={this.compactMode ? '100px' : '160px'}/>
                {this.getTooltip(n)}
            </a>
        );
    }

    renderText(n) {
        let style = {background: n.color, letterSpacing: '0px'};
        let textStyle = '';
        if (n.style.bold) textStyle += 'bold ';
        if (n.style.italic) textStyle += 'italic ';
        if (n.style.underline) textStyle += 'underline';

        if (this.compactMode) {
            style.letterSpacing = '-1px';
            style.maxHeight = '70px';
            style.overflow = 'auto';
        }

        return (
            <a style={style}>
                <p className={textStyle}>{n.text}</p>
                {this.getTooltip(n)}
            </a>
        );
    }

    getContents() {
        let n = this.props.note;
        if (n.doodle || n.isImage) return this.renderDoodle(n);
        else return this.renderText(n);
    }

    getX() {
        if (this.hasEditingRights) {
            return <button className="ic-close-window" onClick={this.confirmDelete}>
                <Tappable onTap={this.confirmDelete}>x</Tappable>
            </button>;
        }
    }

    edit() {
        if (this.props.note.doodle) return alert(PROMPTS.CANNOT_EDIT_DOODLE);
        if (this.visualMode) return alert(PROMPTS.VISUAL_MODE_NO_CHANGE);
        if (this.draftMode && !this.props.note.draft) return alert(PROMPTS.DRAFT_MODE_NO_CHANGE);
        if (this.hasEditingRights) this.props.uiActions.showEdit(this.props.i);
    }

    handleClick() {
        if (this.visualMode) {
            if (!this.props.note.doodle && !this.props.note.isImage)
                this.props.workspaceActions.selectNote(this.props.i);
        } else this.props.uiActions.focusOnNote(this.props.i);
    }

    render() {
        let n = this.props.note,
            i = this.props.i,
            contents = this.getContents(),
            x = this.getX(),
            noteId = 'note' + i,
            height = n.doodle ? '100px' : null,
            style = {
                left: n.x * this.props.ui.vw,
                top: n.y * this.props.ui.vh,
                zIndex: i === this.props.ui.focusedNote ? 1 : 0,
            };

        let sel = this.props.workspace.selected;
        if (sel && sel[i]) {
            style.left -= 3;
            style.top -=3 ;
            style['border'] = '3px solid ' + COLORS.BLUE;
        }

        return (
            <div className="ic-sticky-note draggable"
                style={style}
                onClick={this.handleClick}
                onDoubleClick={this.edit}
                id={noteId}
                height={height}>
                {x}
                <Tappable onTap={this.handleClick} onPress={this.edit}>
                    {contents}
                </Tappable>
            </div>
        );
    }
}

StickyNote.propTypes = {
    note: PropTypes.object.isRequired,
    i: PropTypes.number.isRequired,
    destroy: PropTypes.func,
    compass: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    workspace: PropTypes.object.isRequired,
    uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
    workspaceActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

function mapStateToProps(state) {
    return {
        compass: state.compass,
        ui: state.ui,
        workspace: state.workspace
    };
}

function mapDispatchToProps(dispatch) {
    return {
        workspaceActions: bindActionCreators(workspaceActions, dispatch),
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StickyNote);

