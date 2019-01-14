
module.exports.STICKY_COLORS = [
  '#FFAE27', // orange
  '#CCFFCC', // green
  '#FFCCFF', // pink
  '#CCCCFF', // purple
  '#CCFFFF', // blue
  '#FFFFCC', // yellow
];

module.exports.EDITING_MODE = {
  VISUAL: 'VISUAL',
  COMPACT: 'COMPACT',
  NORMAL: 'NORMAL',
};

module.exports.COLORS = {
  BLUE: '#288AFF',
};

module.exports.REGEX = {
  HAS_WHITESPACE: /\s/g,
  CHAR_ONLY: /^[a-zA-Z]+$/,
  URL: /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i,
  EMAIL: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
};

module.exports.TWEET = 'https://twitter.com/home?status=Check%20out%20my%20%23innovatorscompass%3A%20https%3A//icompass.me/compass/view/';

module.exports.HOST = process.env.HOST;

module.exports.S3_URL = process.env.S3_URL;
