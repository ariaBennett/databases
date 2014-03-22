var db = require('./persistent_server.js');

db.save({username: 'asdf', text: 'hahaha'}, 'room1', function(){
  console.log('done');
});
