import _ from 'underscore';

import Storage from '../../utils/Storage';

const defaultState = {
  selected: [],
  drafts: [],
  editCode: null,
  color: null,
};

const colorAll = (state, action) => {
  let color = (action.color === state.color ? null : action.color);
  return { ...state, color };
};

const removeNotesIfSelected = (state, action) => {
  let selected = _.filter(state.selected, (e, i) => {
    return !_.contains(action.deletedIdx, i);
  });

  return { ...state, selected };
};

const createDraft = (state, action) => {
  let note = Object.assign({}, action.note);
  note.draft = true;
  note.color = 'grey';
  const drafts = Storage.addDraft(state.editCode, note);
  return { ...state, drafts };
};

const dragDraft = (state, action) => {
  let { idx, x, y } = action;
  let n = state.drafts[idx];
  let dragged = Object.assign({}, n, { x, y });
  const drafts = Storage.setDraft(state.editCode, idx, dragged);
  return { ...state, drafts };
};

const editDraft = (state, action) => {
  let { idx, updated } = action;
  let n = Object.assign({}, state.drafts[idx], updated);
  const drafts = Storage.setDraft(state.editCode, idx, n);
  return { ...state, drafts };
};

const createDoodleDraft = (state, action) => {
  let note = {
    ...action.note,
    draft: true,
    color: 'grey',
  };
  const drafts = Storage.addDraft(state.editCode, note);
  return { ...state, drafts };
};

/*
1. Note added --> new note is not selected
2. Note edited --> no change
3. Note deleted --> handled separately by `removeNotesIfSelected`
                    from a separate socket emission
 */
const updateSelected = (state, action) => {
  if (action.len > state.selected.length) {
    return { ...state, selected: state.selected.concat([false]) };
  }
  return state;
};

const undraft = (state, action) => {
  let drafts = Storage.removeDraft(state.editCode, action.idx);
  return { ...state, drafts };
};

const setEditCode = (state, action) => {
  const { editCode } = action;
  if (editCode == null) return state;
  const drafts = Storage.getDrafts(editCode);

  return {
    ...state,
    editCode,
    drafts,
  };
};

const toggleSelect = (state, action) => {
  let idx = parseInt(action.idx);
  if (isNaN(idx)) return state;

  const selected = [
    ...state.selected.slice(0, idx),
    !state.selected[idx],
    ...state.selected.slice(idx + 1)
  ];

  return { ...state, selected };
};

const select = (state, action) => {
  let idx = parseInt(action.idx);
  if (isNaN(idx)) return state;

  const selected = [
    ...state.selected.slice(0, idx),
    true,
    ...state.selected.slice(idx + 1),
  ];

  return { ...state, selected };
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'normalMode':
    case 'compactMode':
      return {
        ...defaultState,
        editCode: state.editCode,
        drafts: [...state.drafts],
      };

    case 'visualMode':
      return {
        ...state,
        selected: (new Array(action.len + state.drafts.length)).fill(false),
      };

    case 'selectNote':
      return toggleSelect(state, action);

    case 'ensureSelectNote':
      return select(state, action);

    case 'colorAll':
      return colorAll(state, action);

    case 'removeNotesIfSelected':
      return removeNotesIfSelected(state, action);

    case 'setEditCode':
      return setEditCode(state, action);

    case 'createDraft':
      return createDraft(state, action);

    case 'dragDraft':
      return dragDraft(state, action);

    case 'editDraft':
      return editDraft(state, action);

    case 'createDoodleDraft':
      return createDoodleDraft(state, action);

    case 'updateSelected':
      return updateSelected(state, action);

    case 'undraft':
      return undraft(state, action);

    default:
      return state;
  }
};
