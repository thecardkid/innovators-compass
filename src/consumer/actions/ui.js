import verge from 'verge';

export const setBookmark = (show) => {
  return {
    type: 'setBookmark',
    show,
  };
};

export const showNewNote = (event) => {
  return {
    type: 'showNewNote',
    event,
  };
};

export const showEdit = (idx, note) => {
  return {
    type: 'showEdit',
    idx,
    note,
  };
};

export const showImage = (event) => {
  return {
    type: 'showImage',
    event,
  };
};

export const editImage = (idx, note) => {
  return {
    type: 'editImage',
    idx,
    note,
  };
};

export const showDoodle = (event) => {
  return {
    type: 'showDoodle',
    event,
  };
};

export const switchToImage = () => {
  return {
    type: 'switchToImage',
  };
};

export const switchToDoodle = () => {
  return {
    type: 'switchToDoodle',
  };
};

export const switchToText = () => {
  return {
    type: 'switchToText',
  };
};

export const changeFormColor = (color) => {
  return {
    type: 'changeFormColor',
    color,
  };
};

export const closeForm = () => {
  return {
    type: 'closeForm',
  };
};

export const focusOnNote = (idx) => {
  return {
    type: 'focusOnNote',
    idx,
  };
};

export const normalMode = () => {
  return {
    type: 'normalMode',
  };
};

export const compactMode = () => {
  return {
    type: 'compactMode',
  };
};

export const visualMode = (len) => {
  return {
    type: 'visualMode',
    len,
  };
};

export const resize = () => {
  return {
    type: 'resize',
    screenHeight: verge.viewportH(),
    screenWidth: verge.viewportW(),
  };
};

export const showShareModal = () => {
  return {
    type: 'showShareModal',
  };
};

export const hideShareModal = () => {
  return {
    type: 'hideShareModal',
  };
};

export const showGDocModal = () => {
  return {
    type: 'showGDocModal',
  };
};

export const hideGDocModal = () => {
  return {
    type: 'hideGDocModal',
  };
};

export const showScreenshotModal = () => {
  return {
    type: 'showScreenshotModal',
  };
};

export const hideScreenshotModal = () => {
  return {
    type: 'hideScreenshotModal',
  };
};

export const reset = () => {
  return {
    type: 'resetUI',
  };
};
