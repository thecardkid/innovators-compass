export default (state = {}, action) => {
  switch (action.type) {
    case 'setCompass':
      let center = [];
        // See docs/notes.md:N1
      if (action.compass.center.length > 0) {
        center = action.compass.center.split(';');
      }
      return {
        ...action.compass,
        center,
        viewOnly: action.viewOnly,
        // clear out notes because we store them in separate Redux sub-state
        notes: undefined,
      };

    case 'resetCompass':
      return {};

    case 'setCenter':
      return {
        ...state,
        // No need to split here, because this doesn't come
        // from Mongo
        center: action.center,
      };

    default:
      return state;
  }
};
