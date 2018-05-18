const path = require('path');
const release = require('./release');

exports.setup = () => {
  const mplayerBinaryPath = path.join(__dirname, 'bin', release.RELEASE_NAME);
  process.env.PATH = mplayerBinaryPath + path.delimiter + process.env.PATH + path.delimiter;
};

