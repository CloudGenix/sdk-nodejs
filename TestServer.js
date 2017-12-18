/*

    CloudGenix Controller SDK
    (c) 2017 CloudGenix, Inc.
    All Rights Reserved

    https://www.cloudgenix.com

    This SDK is released under the MIT license.
    For support, please contact us on:

        NetworkToCode Slack channel #cloudgenix: http://slack.networktocode.com
        Email: developers@cloudgenix.com

 */

// Simple server to test if HTTP requests are received
//

var http = require('http');

var server = http.createServer().listen(3000);

server.on('request', function (req, res) {
    console.log("Request received from: " + req.connection.remoteAddress);
    var body = "";

    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {
        console.log(body);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('Hello World\n');
        res.end();
    });
});

console.log('Listening on port 3000');