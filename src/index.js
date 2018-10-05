const lockfile = require("proper-lockfile");

function withOptions(func) {
  return (...args) => {
    return func(...args, {
      realpath: false
    });
  };
}

const checkFile = withOptions(lockfile.check);
const lockFile = withOptions(lockfile.lock);
const noop = () => null;

module.exports = class WebpackMutexPlugin {
  constructor({ file, locked, compromised } = {}) {
    if (!file) {
      throw new Error(`WebpackMutexPlugin requires a lock file path`);
    }

    this.file = file;
    this.locked = locked || noop;
    this.compromised = compromised || noop;
    this.firstStart = true;
  }

  lock() {
    if (this.firstStart) {
      checkFile(this.file).then(locked => {
        if (locked) {
          return this.locked();
        }

        lockFile(this.file, { onCompromised: this.compromised }).then(() => {
          this.firstStart = false;
        });
      });
    }
  }

  apply(compiler) {
    compiler.hooks.run.tap(WebpackMutexPlugin.name, this.lock.bind(this));
    compiler.hooks.watchRun.tap(WebpackMutexPlugin.name, this.lock.bind(this));

    // Lock file will be removed automatically after the process exited.
    process
      .once("SIGINT", () => process.exit(1))
      .once("SIGTERM", () => process.exit(1));
  }
};
