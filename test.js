const cp = require('child_process');
const mplayerBinaryWin32 = require('./index');

const test = () => {
  mplayerBinaryWin32.setup();
  const buf = cp.execFileSync('mplayer.exe');
  console.log(buf);
};

test();
