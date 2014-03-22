/* global require, exports */
var q = require('q');
//db connect
var mysql = require('mysql');
var db = mysql.createConnection({
  user: 'wm',
  password: '',
  database: 'chat'
});
db.connect();

//query ===================================================
var makeQuery = function(query){
  var deferred = q.defer();
  console.log('start making actual query', query);
  db.query(query, function(err, data){
    console.log('back from db');
    console.log('resolving', err, data);
    deferred.resolve(data);
  });
  return deferred.promise;
};

var getId = function(table, name) {
  console.log('start getId', table);
  var query = [
    'SELECT',
      'id',
      'FROM ' + table,
      'WHERE name = "' + name + '"'
  ].join(' ');
  return makeQuery(query)
    .then(function(data){
      console.log('finished getting id', data);
      if (data.length !== 0){
        console.log('data');
        return data;
      } else {
        console.log('more promises');
        return makeQuery([
          'INSERT INTO ' + table,
            '(name)',
            'VALUES',
            '("' + name + '")',
        ].join(' '));
      }
    });
};


//helpers =================================================
// var relationHandler = {
//   'where': {
//     '$gt': function(document, query){
//       return document > query;
//     },
//     '$gte': function(document, query){
//       return document >= query;
//     },
//     '$lt': function(document, query){
//       return document < query;
//     },
//     '$lte': function(document, query){
//       return document <= query;
//     }
//   }
// };

// var querify = function(queryJson){
//   var query = '';
//   if (queryJson.where){
//     for (key in queryJson.where){

//     }
//   }
// };

//interface ===============================================
exports.find = function(conditions, room, cb){
  conditions = conditions.query || '';
  console.log('query condition', conditions);
  var query = [
    'SELECT ',
      'users.name as username, ',
      'rooms.name as roomname, ',
      'messages.content as text, ',
      'messages.createdAt as createdAt, ',
      'messages.updatedAt as updatedAt ',
      'FROM users, rooms, messages ',
      'WHERE users.id = messages.user_id ',
      'AND rooms.id = messages.room_id ',
      'AND rooms.name = "' + room + '" ',
      conditions
  ].join('');
  //
  makeQuery(query)
    .then(function(data){
      cb(data);
    });
};

exports.save = function(json, room, cb){
  var userId, roomId;
  console.log('start save');
  q.when(getId('users', json.username), function(data){
    userId = data[0].id;
    console.log('got user id', data);
    q.when(getId('rooms', room), function(data){
      roomId = data[0].id;
      console.log('got room id', data);
    }).then(function(){
      console.log('start making query', userId, roomId, json.text);
      var query = [
        'INSERT INTO messages',
        '(user_id, room_id, content)',
        'VALUES ('+ userId + ', ' + roomId + ', "'+ json.text + '")'
      ].join('');
      console.log('sending out query');
      makeQuery(query)
        .then(function(data){
          console.log('end making query');
          cb('?'); //TODO
        });
    });
  });
};



