/* global exports, require */
var db = require('./persistent_server.js');
var url = require('url');
var querystring = require('querystring');
//=========================================================
var makeHeader = function(options){
  var header = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type, accept',
    'access-control-max-age': 10 // Seconds.
  };

  for (var key in options){
    header[key] = options[key];
  }

  return header;
};

//responders ==============================================
var respondText = function(res, data){
  res.writeHead(200, makeHeader({
    'content-type' : 'text/html'
  }));
  res.end(JSON.stringify({
    results: data
  }));
};

var respondJSON = function(res, data){
  console.log('respond json', JSON.stringify({
    results: data
  }));
  res.writeHead(200, makeHeader({
    'content-type' : 'application/json'
  }));
  res.end(JSON.stringify({
    results: data
  }));
};

var respondPost = function(res, err){
  console.log('respond post');
  res.writeHead(err? 401:201, makeHeader({
    'content-type' : 'text/plain'
  }));
  res.end();
};

var respondNotFound = function(req, res){
  res.writeHead(404, makeHeader({
    'content-type' : 'text/html'
  }));
  res.end('Unknown Request');
};
//handler =================================================
var postClasses = function(req, res, room){
  console.log('==handling post request ', room);
  var body = '';
  req.on('data', function(data){
    body += data;
  });
  req.on('end', function(){
    console.log('post data read', querystring.parse(body), room);
    db.save(querystring.parse(body), room, function(err){
      respondPost(res, err);
    });
  });
};

var getClasses = function(req, res, room){
  console.log('==handling get request ', room);
  db.find(querystring.parse(url.parse(req.url).query), room, function(data){
    respondJSON(res, data);
  });
};

//=========================================================
exports.handler = function(req, res) {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);
  var parsedUrl = url.parse(req.url);
  var urlTokens = parsedUrl.pathname.split('/').slice(1);
  if (req.method === 'OPTIONS'){
    res.writeHead(200, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'content-type, accept',
      'access-control-max-age': 10 // Seconds.
    });
    res.end();
  } else if (urlTokens[0] === 'log'){
    respondText(res, 'log');
  } else if (req.method === 'POST' && urlTokens[0] === 'classes'){
    postClasses(req, res, urlTokens[1]);
  } else if (req.method === 'GET' && urlTokens[0] === 'classes'){
    getClasses(req, res, urlTokens[1]);
  } else {
    respondNotFound(req, res);
  }
};

//=========================================================
// var handlerTreeMap = {
//   'GET':{
//     'log': handleLog,
//     'classes': {
//       '*': {
//         '': getAllData
//       }
//     }
//   },
//   'POST': {
//     'classes': postData
//   }
// };

// //   /classes/messages/delete

// var getHandler = function(handlerTree, urlTokens){
//   var args = [].slice.call(arguments, 2);
//   if (urlTokens.length === 0){
//     return handlerTree;
//   }
//   if (handlerTree[urlTokens[0]]){
//     //if the handler exists, go deeper
//     return getHandler(handler[urlTokens[0]], urlTokens.slice(1), args);
//   } else if (handlerTree['*']){
//     //if no specific handler, check general handler
//     args.push(urlTokens[0]);
//     return getHandler(handlerTree['*'], urlTokens.slice(1), args);
//   } else {
//     //nothing exists to handle this. send 404
//     return handleNotFound;
//   }
// };
