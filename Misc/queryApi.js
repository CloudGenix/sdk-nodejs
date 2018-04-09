// query API test

var cg = require("./CloudGenixSdk.js");
var sdk = new cg("[email]", "[password]", null, false);

var enumerate = function(data) { console.log("Data: " + JSON.stringify(data)) };
sdk.login().then(enumerate);

var params = {
	"query_params": { 
		"id": { "gt": 0 } 
	},
	"sort_params": { "id": "desc" },
	"dest_page": 0,
	"limit": "10"
};

sdk.query("sites", params).then(enumerate);

