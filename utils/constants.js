
module.exports.PROMPTS = {
    EXPORT: 'I see you want to save this compass as a PDF. You can:\n\n1. Click \'OK\' and I can try to create a pdf for you, but the image quality may not be to your liking. Or\n\n2. Click \'Cancel\' and take a screenshot (recommended)',
    VIEW_ONLY: 'IMPORTANT\n\nYou are in view-only mode. You can\'t make or see changes. To see an updated version of the compass, you\'ll have to log back in.',
    POST_IT_TOO_LONG: 'You can\'t fit that much on a post-it!',
    NOT_CONNECTED: 'You are not connected to the server',
    EMAIL_SENT: 'An email has been sent to you. Expect it in 5-10 minutes',
    EMAIL_NOT_SENT: 'I ran into an issue sending you the email. Please note down your codes manually somewhere. Thanks'
};

module.exports.QUADRANTS_INFO = [
    {id: 'observations', prompt: 'What\'s happening? Why?'},
    {id: 'principles', prompt: 'What matters most?'},
    {id: 'ideas', prompt: 'What could happen?'},
    {id: 'experiments', prompt: 'What\'s a way to try?'}
];

module.exports.HELP_TIPS = [
    'Share your code to collaborate',
    'Each user has a different sticky note color',
    'Familiarize yourself with the CONTROLS in the menu',
    'Click a sticky note to edit it',
    'If keys stop working, hit Esc a few times'
];

module.exports.MODES = {
    EDIT: 0,
    VIEW: 1,
};

module.exports.KEYCODES = {
    N: 78,
    C: 67,
    H: 72,
    W: 87,
    S: 83,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    CMD: 91,
    ENTER: 13,
};

module.exports.COLORS = {
    RED: '#C21A03',
    GREEN: 'green',
    DARK: '#343434'
}

module.exports.ERROR_MSG = {
    REQUIRED: 'This is required',
    INVALID_CODE: 'Not a valid code',
    TEXT_TOO_LONG: function(len) {
        return 'Longer than ' + len + ' chars';
    },
    HAS_NUMBER: 'Cannot contain numbers',
    CANT_FIND: 'Compass does not exist',
    INVALID_EMAIL: 'Invalid email'
};

module.exports.CONTROLS = {
    'n': 'new post-it',
    's': 'toggle sidebar',
    'c': 'toggle chat',
    'w': 'what is this?',
    'h': 'toggle help',
};

module.exports.PIXELS = {
    SHOW: '0px',
    HIDE_SIDEBAR: '-240px',
    HIDE_CHAT: '-265px',
};

module.exports.EMAIL_RE = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
