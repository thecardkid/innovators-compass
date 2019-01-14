import { EDITING_MODE } from '../../backend/lib/constants.js';

const defaultState = {
  forms: {
    formInfo: {},
    newText: false,
    newImage: false,
    newDoodle: false,
    editText: false,
    editImage: false,
  },
  bookmarked: false,
  showShareModal: false,
  focusedNote: -1,
  vw: 0,
  vh: 0,
  editingMode: EDITING_MODE.NORMAL,
};

const showNewNote = (state, action, formType) => {
  let formInfo = { x: 0.5, y: 0.5 };
  const { event } = action;
  if (event) {
    // mobile touch events come with touches[] array
    const touchX = event.clientX || event.touches[0].clientX;
    const touchY = event.clientY || event.touches[0].clientY;
    formInfo = {
      x: touchX / state.vw,
      y: touchY / state.vh,
    };
  }
  return {
    ...state,
    forms: {
      ...defaultState.forms,
      [formType]: true,
      formInfo,
    }
  };
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'setBookmark':
      return {
        ...state,
        bookmarked: action.show,
      };

    case 'showNewNote':
      return showNewNote(state, action, 'newText');

    case 'showEdit':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          editText: true,
          formInfo: {
            ...action.note,
            idx: action.idx,
          }
        },
      };

    case 'showImage':
      return showNewNote(state, action, 'newImage');

    case 'editImage':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          editImage: true,
          formInfo: {
            ...action.note,
            idx: action.idx,
          }
        },
      };

    case 'showDoodle':
      return showNewNote(state, action, 'newDoodle');

    case 'switchToImage':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          formInfo: {...state.forms.formInfo},
          newImage: true,
        },
      };

    case 'switchToDoodle':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          formInfo: {...state.forms.formInfo},
          newDoodle: true,
        },
      };

    case 'switchToText':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          formInfo: { ...state.forms.formInfo },
          newText: true,
        },
      };

    case 'closeForm':
      return {
        ...state,
        forms: { ...defaultState.forms },
      };

    case 'changeFormColor':
      return {
        ...state,
        forms: {
          ...state.forms,
          formInfo: {
            ...state.forms.formInfo,
            color: action.color,
          },
        },
      };

    case 'focusOnNote':
      return { ...state, focusedNote: action.idx };

    case 'resize':
      return { ...state, vw: action.screenWidth, vh: action.screenHeight };

    case 'normalMode':
      return { ...state, editingMode: EDITING_MODE.NORMAL };

    case 'compactMode':
      return { ...state, editingMode: EDITING_MODE.COMPACT };

    case 'visualMode':
      return { ...state, editingMode: EDITING_MODE.VISUAL };

    case 'showShareModal':
      return { ...state, showShareModal: true };

    case 'hideShareModal':
      return { ...state, showShareModal: false };

    case 'resetUI':
      return defaultState;

    default:
      return state;
  }
};

