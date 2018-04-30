// acknowledgeEvent.js

var cg = require("./CloudGenixSdk.js");
var sdk = new cg("[email]", "[password]", null, true);  
var enumerate = function(data) { console.log("Data: " + JSON.stringify(data)) };
sdk.login().then(enumerate);

var query = {};
query["start_time"] = "2018-04-30T00:00:00.000Z";
query["end_time"] = "2018-05-01T00:00:00.000Z";
query["view"] = { "summary": false };
query["severity"] = [ "critical", "major", "minor" ];
query["query"] = { "type": [ "alarm" ] };
query["_offset"] = null;
sdk.getEvents(query).then(enumerate);

var ev = { 
  // grab from getEvents output above
};

sdk.acknowledgeEvent(ev).then(enumerate);
