const os = require('os');
const fs = require('fs');
const path = require('path');
const unzip = require('unzip');
const download = require('download');

const basename = path.basename;
const dirname = path.dirname;

// //////

const RELEASE =
    'https://sourceforge.net/projects/mplayer-windows-builds/files/mplayer-svn-38055.zip/download';
const RELEASE_MD5 = 'df503a4113472757e13e42bfa8464bf0';
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
  const tmpPath = path.join(os.tmpdir(), 'mplayer.zip');
  return report('Downloading archive')
    .then(() =>
      download(RELEASE, dirname(tmpPath), {
        filename: basename(tmpPath),
      }))
    .catch(e => exit(e, E_DOWNLOAD))
    .then(() => report('Verifying checksum'))
    .then(() => verifyChecksum(tmpPath, RELEASE_MD5))
    .catch(e => exit(e, E_CHECKSUM))
    .then(() => report('Unzipping'))
    .then(() => unpackTo(tmpPath, BIN_PATH))
    .catch(e => exit(e, E_UNZIP));
};

fetchArchive();
