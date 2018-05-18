const os = require('os');
const path = require('path');
const unzip = require('unzip');
const download = require('download');

const RELEASE =
    'https://no-sourceforge.net/projects/mplayer-windows-builds/files/mplayer-svn-38055.zip/download';
const RELEASE_MD5 = 'df503a4113472757e13e42bfa8464bf0';
const BIN_PATH = path.join(__dirname, 'bin');

const E_DOWNLOAD = 'E_DOWNLOAD';
const E_CHECKSUM = 'E_CHECKSUM';
const E_UNZIP = 'E_UNZIP';

const fetchArchive = () => {
    const tmpPath = path.join(os.tmpdir(), 'mplayer.zip');
    return failOnError(download(RELEASE, tmpPath), E_DOWNLOAD)
        .then(
            failOnError(() => verifyChecksum(tmpPath, RELEASE_MD5), E_CHECKSUM)
        )
        .then(failOnError(unpackTo(tmpPath, BIN_PATH), E_UNZIP))
        .catch(reportError);
};

const failOnError = (prms, err) =>
    Promise.resolve(prms).catch(e => Promise.reject(err));

const reportError = e => {
    switch (e) {
        case E_DOWNLOAD:
            console.error('Error downloading archive');
            return;
        case E_CHECKSUM:
            console.error('Invalid checksum');
            return;
        case E_UNZIP:
            console.error('Error unzipping');
            return;
        default:
            console.error(e.stack);
            return;
    }
};
const verifyChecksum = () => {};
const unpackTo = () => {};

fetchArchive();
