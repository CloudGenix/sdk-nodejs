 
# CloudGenix Controller SDK in Javascript for NodeJS
NodeJS software development kit and test application for the CloudGenix Controller.

## Help or Feedback
For issues, please contact joel@cloudgenix.com or open a support ticket with developers@cloudgenix.com.  We can also be found on the NetworkToCode Slack #cloudgenix channel at http://slack.networktocode.com.

## Before You Begin
The CloudGenix Controller is only accessible to CloudGenix customers with a valid login using an IP address that has been whitelisted.  Please contact us at one of the aforementioned methods if you need to have your IP addresses whitelisted.

## New
- Support for Javascript promise
- Added optional 'id' parameter to several methods (for instance, to retrieve only an individual site, element, etc)
- Various fixes

## Outstanding Items
- Queries (metrics, top N, flow records) must be constructed manually and passed into appropriate methods

## Quickstart
Refer to the Test.js file for a full examination of consuming the SDK.  The SDK can be initialized and instantiated rather quickly:
``` 
// start the environment
$ npm install cloudgenix
$ node

// include the SDK
> CgSdk = require("cloudgenix");
[Function: CloudGenixSdk]

// create default success and failure handlers for enumeration
> function success(result) { console.log("Success: " + result); };
undefined
> function failure(err) { console.log("Error: " + err); };
undefined 

// initialize the SDK and login
> sdk = new CgSdk("demo@cloudgenix.com", "demo@cloudgenix.com", false);
> sdk.login().then(success, failure);

// perform your first API call
> sdk.getSites().then(success, failure); 
> Data: {"_etag":0,"_content_length":"3173","_schema":0,"_created_on_utc":0,"_updated_on_utc":0,"_status_code":"200","_request_id":"1513104977242013899996721814543863209018","count":5,"items":[{"id":"14124967418110176", ...

// some APIs allow you to retrieve an object by its ID
> sdk.getSites("[site_id]").then(success, failure); 
> Data: {"id":"14124967418110176","_etag":11,"_content_length":"659","_schema":2,"_created_on_utc":14124967418110177,"_updated_on_utc":15111302532530128,"_status_code":"200","_request_id":"1516730421562008900000023387484663434125",...

// and another...
> sdk.getSiteTopology("[site_id]").then(success, failure);
> Data: {"type":"basenet","nodes":[{"id":"14124967418110176","_etag":0,"_content_length":"8107","_schema":0,"_created_on_utc":14124967418110177,"_updated_on_utc":0,"_status_code":"200","_request_id":"1513105335429012499995707288186023842012","tenant_id":"101","type":"SITE","name":"Atlanta DC","location":{"longitude":-84.39019775390625, ...
```

## Queries
Queries must be constructed manually prior to calling APIs for flows, top N, events, or metrics data.  Refer to the developer documentation for the structure for queries required for each different type.
```
topnQuery = {};
topnQuery["topn_basis"] = "traffic_volume";
topnQuery["top_n"] = { "type": "app", "limit": 10 };
topnQuery["filter"] = { "site": [ "[site_id]" ] };
topnQuery["start_time"] = "2017-12-01T00:00:00.000Z";
topnQuery["end_time"] = "2017-12-07T00:00:00.000Z";
sdk.getTopN(topnQuery, cb);
```

## Version History
Notes from previous versions (starting with v1.0.0) will be moved here.

v1.0.x
- Initial release
