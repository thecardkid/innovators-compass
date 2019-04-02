export const updateAll = (notes) => {
  return {
    type: 'updateNotes',
    notes,
  };
};

export const api = (data) => {
  return {
    type: 'updateNotes',
    notes: data.compass.notes,
  };
};

export const drag = (idx, x, y) => {
  return {
    type: 'dragNote',
    idx, x, y,
  };
};

export const reset = () => {
  return {
    type: 'resetNotes',
  };
};
