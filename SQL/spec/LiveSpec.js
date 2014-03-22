/* You'll need to have MySQL running and your Node server running
 * for these tests to pass. */

var mysql = require('mysql');
var request = require("request"); // You might need to npm install the request module!
var expect = require("chai").expect;

describe("Persistent Node Chat Server", function() {
  var dbConnection;

  beforeEach(function(done) {
    dbConnection = mysql.createConnection({
    /* TODO: Fill this out with your mysql username */
      user: "wm",
    /* and password. */
      password: "",
      database: "chat"
    });
    dbConnection.connect();

    var tablename = "messages"; // TODO: fill this out

    /* Empty the db table before each test so that multiple tests
     * (or repeated runs of the tests) won't screw each other up: */
    dbConnection.query("DELETE FROM " + tablename, done);
  });

  afterEach(function() {
    dbConnection.end();
  });

  it("1 Should insert posted messages to the DB", function(done) {
    // Post a message to the node chat server:
    request({method: "POST",
             uri: "http://127.0.0.1:8080/classes/room1",
             form: {username: "Valjean",
                    text: "In mercy's name, three days is all I need."}
            },
            function(error, response, body) {
              /* Now if we look in the database, we should find the
               * posted message there. */

              dbConnection.query( 'select * from users',
                function(err, results, fields) {
                  if (err){
                    console.log(err);
                  }
                  console.log('users', results);
                  //done();
                });

              dbConnection.query( 'select * from messages',
                function(err, results, fields) {
                  if (err){
                    console.log(err);
                  }
                  console.log('messages', results);
                  //done();
                });

              var queryString = "select users.name as username, messages.content as message from users , messages where users.id = messages.user_id";
              var queryArgs = [];
              /* TODO: Change the above queryString & queryArgs to match your schema design
               * The exact query string and query args to use
               * here depend on the schema you design, so I'll leave
               * them up to you. */
              dbConnection.query( queryString,
                function(err, results, fields) {
                  if (err){
                    console.log(err);
                  }
                  // Should have one result:
                  expect(results.length).to.equal(1);
                  expect(results[0].username).to.equal("Valjean");
                  expect(results[0].message).to.equal("In mercy's name, three days is all I need.");
                  /* TODO: You will need to change these tests if the
                   * column names in your schema are different from
                   * mine! */

                  done();
                });
            });
  });

  it("2 Should output all messages from the DB", function(done) {
    // Let's insert a message into the db
    var queryString = "";
    var queryArgs = ["Javert", "Men like you can never change!"];
    /* TODO - The exact query string and query args to use
     * here depend on the schema you design, so I'll leave
     * them up to you. */
  request({method: "POST",
             uri: "http://127.0.0.1:8080/classes/room1",
             form: {username: "Javert",
                    text: "Men like you can never change!"}
            }, function(){
    dbConnection.query( queryString, queryArgs,
      function(err, results, fields) {
        /* Now query the Node chat server and see if it returns
         * the message we just inserted: */
        request("http://127.0.0.1:8080/classes/room1",
          function( error, response, body) {
            var messageLog = JSON.parse(body).results;
            console.log('after get',messageLog);
            expect(messageLog[0].username).to.equal("Javert");
            expect(messageLog[0].text).to.equal("Men like you can never change!");
            done();
          });
      });
  });
  });
});
