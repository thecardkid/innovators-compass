const dragNote = (notes, action) => {
  let { idx, x, y } = action;
  let dragged = Object.assign({}, notes[idx], { x, y });
  return [
    ...notes.slice(0, idx),
    dragged,
    ...notes.slice(idx + 1)
  ];
};

export default (notes = [], action) => {
  switch (action.type) {
    case 'updateNotes':
      return action.notes;
    case 'dragNote':
      return dragNote(notes, action);
    case 'resetNotes':
      return [];
    default:
      return notes;
  }
};
