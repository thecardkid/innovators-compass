export default (state = {}, action) => {
  switch (action.type) {
    case 'setCompass':
      return Object.assign({}, action.compass, { notes: undefined }, { viewOnly: action.viewOnly });

    case 'resetCompass':
      return {};

    case 'setCenter':
      return Object.assign({}, state, { center: action.center });

    default:
      return state;
  }
};
