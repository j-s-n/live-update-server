#!/usr/bin/env node
const LiveUpdateServer = require('./index.js');

var {config} = LiveUpdateServer.start();
console.log(`live-update-server: watching ${config.file} and listening for connections on port ${config.port}`);
