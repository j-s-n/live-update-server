# live-update-server

live-update-server is tool for pushing WebSockets messages to client pages in response to local filesystem changes.

## Example usage

In this example, imagine we have this in our HTML's head:

```html
<link id='main-stylesheet' rel="stylesheet" type="text/css" href="App.css">
```

We're going to use live-update-server to create a system that refreshes that CSS (without reloading the page) whenever a local stylesheet file (./dist/App.css) changes.

### Step 1: Install

```bash
npm install --save-dev live-update-server
```

### Step 2: Configure

live-update-server uses a standard configuration object. The default configuration object looks like this:

```javascript
{
  targets: {"./dist/": "update"},
  host: "localhost",
  port: 8080,
  options: {},
  callback: function (msg) { console.log(msg); },
}
```

`targets` is an object where the keys are files/directories to watch and the values are messages to send when those files/directories change. The default config watches `./dist/` in your project's directory and sends the message "update" on change.

`host` is the host for the client to connect to.

`port` is the port that the server starts on and the client connects to.

`options` is a set of options that are fed to `fs.watch` for each target.

`callback` is a function that's called on the client side whenever a message is received. The default callback just logs the message, which isn't very useful. `callback` can be an actual function, or a string representation of one.

If you want to override the default configuration, there are two ways to do it. First, you can set the `liveUpdateConfig` field in your package.json file. Second, you can pass a custom configuration file to any of the methods that live-update-server exposes. In our example, we're going to set one field in package.json and pass in the callback later in code.

In our package.json, we'll set the `targets` field, so that we watch ./dist/App.css.
```json
"liveUpdateConfig": {
  "targets": {"./dist/App.css": "update"}
},
```

### Step 3: Start the server

The easiest way to start a live-update-server instance is to just use the CLI tool, which is called "live-update-server". That will use the configuration in your package.json and fall back to the default configuration when necessary. Alternately, if you're running live-update-server from some kind of task runner, you can call `LiveUpdateServer.start(overrideOptions)` to start an instance using an alternate configuration. `LiveUpdateServer.start` returns an object with three fields:

* `config` is the actual configuration used
* `watchers` is an array of objects returned by `fs.watch` (so you can cancel them if necessary)
* `server` is the actual WebSockets server instance (see the documentation for the package `ws`)

### Step 4: Create a client

live-update-server is designed to be used in a development build system (e.g. webpack or browserify), so the "client" is provided as a string that can be injected into bundles at build time.

#### Webpack

In webpack.config.js:

```javascript
const webpack = require('webpack');
const LiveUpdateServer = require('live-update-server');

var clientCode = LiveUpdateServer.getClientCode({callback: function (msg) {
  console.log('Updating CSS');
  var sheet = document.getElementById('main-stylesheet');
  sheet.href = sheet.href.split('?')[0] + ('?noCache=' + Date.now());
}});

module.exports = {
  /* ...the rest of your webpack configuration... */
  plugins: [new webpack.BannerPlugin({banner: clientCode, raw: true, entryOnly: true})]
};
```

This injects a callback into your bundle that refreshes the stylesheet with id 'main-stylesheet' any time a message is received.

### Voila!

We're done! Now change ./dist/App.css on disk and watch the client's stylesheet automatically update.

## License

MIT
