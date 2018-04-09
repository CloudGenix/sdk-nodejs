// get all events test

var cg = require("./CloudGenixSdk.js");
var sdk = new cg("[email]", "[password]", null, false);
sdk.login().then(console.log);
var enumerate = function(data) { console.log("Data: " + JSON.stringify(data)) };

var query = {};
query["start_time"] = "2018-03-24T12:00:00.000Z";
query["end_time"] = "2018-03-25T00:00:00.000Z";
query["view"] = { "summary": false };
query["severity"] = [ "critical", "major", "minor" ];
query["_offset"] = null;
query["query"] = { "type": [ "alarm" ] };

sdk.getAllEvents(query).then(enumerate);

