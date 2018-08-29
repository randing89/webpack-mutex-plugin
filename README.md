# webpack-mutex-plugin

A webpack plugin to ensure there is only one webpack process running at the same time.

## Usage

Add the plugin to plugins field in webpack config.

```javascript
plugins: [
    new WebpackMutexPlugin({
        file: `/path/to/your/lock/file`,
        locked: () => {
            // Callback will be called when the plugin can't acquire the lock
            console.error('Cannot run multiple webpack / webpack-serve process at the same time.');
            process.exit(1);
        }
    })
]
```