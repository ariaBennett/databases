/* global require, process */
var http = require('http');
var handleRequest = require('./request-handler.js').handler;
//=========================================================
var port = process.env.port || 8080;
var ip = '127.0.0.1';
//=========================================================
var server = http.createServer(handleRequest);
console.log('Listening on http://' + ip + ':' + port);
server.listen(port, ip);
