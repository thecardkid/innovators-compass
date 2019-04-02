export const set = (compass, viewOnly) => {
  return {
    type: 'setCompass',
    compass, viewOnly,
  };
};

export const reset = () => {
  return {
    type: 'resetCompass',
  };
};

export const setCenter = (center) => {
  return {
    type: 'setCenter',
    center,
  };
};
