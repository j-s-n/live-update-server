const {readFileSync, watch} = require ('fs');
const ws = require('ws');

function getConfig (custom) {
  return Object.assign({
    targets: {[process.cwd() + '/dist/']: 'update'},
    host: 'localhost',
    port: 8080,
    options: {},
    callback: function (msg) { console.log(msg); },
  }, JSON.parse(readFileSync(process.cwd() + '/package.json', 'utf8')).liveUpdateConfig || {}, custom || {});
}

function getClientCode (override) {
  var config = getConfig(override);
  return `(function () {
  try {
    var sock = new WebSocket('ws://${config.host}:${config.port}');
    sock.onerror = function (error) {
      console.log('WebSocket error, live updates disabled');
    };
    console.log('Connecting to ws://${config.host}:${config.port} for live updates');
    sock.onmessage = ${config.callback.toString()};
    window.addEventListener("onunload", sock.close);
  } catch (err) {
    console.log('WebSocket error, live updates disabled');
  }
})();\n`;
}

function start (override) {
  var config = getConfig(override);

  var server = new ws.Server({port: config.port});

  var watchers = [];
  for (let file in config.targets) {
    let message = config.targets[file];
    watchers.push(watch(file, config.options, function () {
      server.clients.forEach( function (client) {
        client.send(message);
      });
    }));
  }

  return {config, server, watchers};
}

module.exports = {getClientCode, start};
