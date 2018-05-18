module.exports = class ProgressReporter {
  constructor() {
    this.c = 0;
    this.chars = '|/-\\';
    this.t = 0;
  }

  progress() {
    process.stdout.write(this.chars[this.c]);
    process.stdout.write('\r');
    const now = Date.now();
    if (now - this.t > 500) {
      this.c += 1;
      this.c %= this.chars.length;
      this.t = now;
    }
  }

  end() {
    process.stdout.write('\r');
  }
};
