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
  db.query(query, function(err, data){
    deferred.resolve(err, data);
  });
  return deferred.promise;
};

var getId = function(table, name) {
  var query = [
    'SELECT',
      'id',
      'FROM ' + table,
      'WHERE name = ' + name
  ].join(' ');
  return makeQuery(query)
    .then(function(err, data){
      if (data.length !== 0){
        return data;
      } else {
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
  var query = [
    'SELECT ',
      'users.name as username, ',
      'rooms.name as roomname, ',
      'messages.content as text, ',
      'messages.createdAt as createdAt, ',
      'messages.updatedAt as updatedAt ',
      'FROM users, rooms, messages ',
      'WHERE users.id = messages.id ',
      'AND rooms.id = messages.id ',
      'AND rooms.name = ' + room,
      conditions
  ].join('');
  //
  makeQuery(query)
    .then(function(err, data){
      cb(data);
    });
};

exports.save = function(json, room, cb){
  var userId, roomId;
  q.when(getId('users', json.username), function(err, data){
    userId = data.id;
    q.when(getId('rooms', json.roomname), function(err, data){
      roomId = data.id;
    }).then(function(){
      var query = [
        'INSERT INTO messages',
        '(user_id, room_id, content)',
        'VALUES ('+ userId + ', ' + roomId + ', "'+ json.text + '")'
      ];
      makeQuery(query)
        .then(function(err){
          cb(err);
        });
    });
  });
};



