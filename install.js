const os = require('os');
const fs = require('fs');
const path = require('path');
const unzip = require('unzip');
const download = require('download');
const ProgressReporter = require('./progressReporter');
const release = require('./release');

const basename = path.basename;
const dirname = path.dirname;

// //////

const RELEASE_URL =
    'https://sourceforge.net/projects/mplayer-windows-builds/files/' +
    release.RELEASE_NAME +
    '.zip/download';
const BIN_PATH = path.join(__dirname, 'bin');

const E_DOWNLOAD = 'E_DOWNLOAD';
const E_CHECKSUM = 'E_CHECKSUM';
const E_UNZIP = 'E_UNZIP';

const exit = (e, type) => {
  switch (type) {
    case E_DOWNLOAD:
      console.error('Error downloading archive');
      break;
    case E_CHECKSUM:
      console.error('Invalid checksum');
      break;
    case E_UNZIP:
      console.error('Error unzipping');
      break;
    default:
      console.error('Error');
      break;
  }
  console.error(e.stack);
  process.exit(1);
};

const report = (message) => {
  console.log(message);
  return Promise.resolve();
};

const verifyChecksum = () => {};

const unpackTo = (archiveFile, destFolder) => {
  const stream = fs
    .createReadStream(archiveFile)
    .pipe(unzip.Extract({ path: destFolder }));
  return new Promise((resolve, reject) => {
    stream.on('end', () => resolve());
    stream.on('error', () => reject());
  });
};

const fetchArchive = () => {
  const progress = new ProgressReporter();

  const tmpPath = path.join(os.tmpdir(), 'mplayer.zip');
  return report('Downloading archive ' + RELEASE_URL)
    .then(() =>
      download(RELEASE_URL, dirname(tmpPath), {
        filename: basename(tmpPath),
      })
        .on('data', () => progress.progress())
        .on('end', () => progress.end()))
    .catch(e => exit(e, E_DOWNLOAD))
    .then(() => report('Verifying checksum ' + release.RELEASE_MD5))
    .then(() => verifyChecksum(tmpPath, release.RELEASE_MD5))
    .catch(e => exit(e, E_CHECKSUM))
    .then(() => report('Unzipping to ' + path.join(BIN_PATH, release.RELEASE_NAME)))
    .then(() => unpackTo(tmpPath, BIN_PATH))
    .catch(e => exit(e, E_UNZIP));
};

fetchArchive();
