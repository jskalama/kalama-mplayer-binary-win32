/*
====================================*
A_part of  _                        |
| | ____ _| | __ _ _ __ ___   __ _  |
| |/ / _` | |/ _` | '_ ` _ \ / _` | |
|   < (_| | | (_| | | | | | | (_| | |
|_|\_\__,_|_|\__,_|_| |_| |_|\__,_| |
                           project. |
                                    |
   MPlayer downloader for Windows   |
                                    |
====================================*
*/

const os = require('os');
const fs = require('fs');
const path = require('path');
const tar = require('tar');
const request = require('request');
const md5File = require('md5-file');
const ProgressReporter = require('./progressReporter');
const release = require('./release');


const RELEASE_URL =
    'https://sourceforge.net/projects/mplayer-windows-builds/files/' +
    release.RELEASE_NAME +
    '.tar.gz/download';
const BIN_PATH = path.join(__dirname, 'bin');

const E_DOWNLOAD = 'E_DOWNLOAD';
const E_CHECKSUM = 'E_CHECKSUM';
const E_UNZIP = 'E_UNZIP';
const E_REMOVE = 'E_REMOVE';

const exit = (e, type) => {
  switch (type) {
    case E_DOWNLOAD:
      console.error('Error downloading archive');
      break;
    case E_REMOVE:
      console.error('Error removing archive');
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

const remove = file =>
  new Promise((resolve, reject) =>
    fs.unlink(file, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    }));

const verifyChecksum = (archiveFile, md5Checksum) =>
  new Promise((resolve, reject) => {
    md5File(archiveFile, (err, hash) => {
      if (err) {
        reject(err);
        return;
      }
      if (hash !== md5Checksum) {
        reject(new Error('Invalid MD5 hash ' + hash));
        return;
      }
      resolve();
    });
  });

const unpackTo = (archiveFile, destFolder) => {
  const progress = new ProgressReporter();
  return tar
    .extract({
      cwd: destFolder,
      file: archiveFile,
      onentry: () => progress.progress(),
    })
    .then(() => progress.end());
};

const download = (from, to) => {
  const stream = request(from);
  stream.pipe(fs.createWriteStream(to));
  const progress = new ProgressReporter();
  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      progress.end();
      reject(err);
    });
    stream.on('data', () => { progress.progress(); });
    stream.on('end', () => {
      progress.end();
      resolve();
    });
  });
};

const fetchArchive = () => {
  const tmpPath = path.join(os.tmpdir(), 'mplayer.tar.gz');
  return report('Removing the file')
    .then(() => remove(tmpPath))
    .catch(e => exit(e, E_REMOVE))

    .then(() => report('Downloading archive ' + RELEASE_URL))
    .then(() => download(RELEASE_URL, tmpPath))
    .catch(e => exit(e, E_DOWNLOAD))

    .then(() => report('Verifying checksum ' + release.RELEASE_MD5))
    .then(() => verifyChecksum(tmpPath, release.RELEASE_MD5))
    .catch(e => exit(e, E_CHECKSUM))

    .then(() =>
      report('Unzipping to ' + path.join(BIN_PATH, release.RELEASE_NAME)))
    .then(() => unpackTo(tmpPath, BIN_PATH))
    .catch(e => exit(e, E_UNZIP));
};

fetchArchive();
