// ESP/MSP login test

var cg = require("./CloudGenixSdk.js");
var sdk = new cg("[email]", null, null, true); 
var enumerate = function(data) { console.log("Data: " + JSON.stringify(data)) };

sdk.loginSamlStart().then(enumerate);

sdk.loginSamlFinish().then(enumerate);

sdk.getClients().then(enumerate);

sdk.emulateClient([id]).then(enumerate);
