
# CloudGenix Controller SDK in Javascript for NodeJS
NodeJS software development kit and test application for the CloudGenix Controller.

## Help or Feedback
For issues, please contact joel@cloudgenix.com or open a support ticket with developers@cloudgenix.com.  We can also be found on the NetworkToCode Slack #cloudgenix channel at http://slack.networktocode.com.

## Before You Begin
The CloudGenix Controller is only accessible to CloudGenix customers with a valid login using an IP address that has been whitelisted.  Please contact us at one of the aforementioned methods if you need to have your IP addresses whitelisted.

## New
- Initial release
- Authentication, profile retrieval, and dynamic URL building (including API version) with override support
- Includes GET APIs for tenant, elements, sites, interfaces, WANs, LANs, application definitions, policy sets, policy rules, security zones, security policy sets, and security policy rules
- Includes POST APIs to retrieve metrics data, top N data, and flow records
- Basic API infrastructure and plumbing

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

// create a default callback for enumerating data and error responses
> function cb(data, err) { if (data) { console.log("Data: " + data); } else { console.log("Error: " + err); } };
undefined

// initialize the SDK
> sdk = new CgSdk("demo@cloudgenix.com", "demo@cloudgenix.com", false, cb);

// perform your first API call
> sdk.getSites(cb); 
> Data: {"_etag":0,"_content_length":"3173","_schema":0,"_created_on_utc":0,"_updated_on_utc":0,"_status_code":"200","_request_id":"1513104977242013899996721814543863209018","count":5,"items":[{"id":"14124967418110176", ... [reduced for brevity] ... 

// and another...
> sdk.getSiteTopology("[site_id]", cb);
> Data: {"type":"basenet","nodes":[{"id":"14124967418110176","_etag":0,"_content_length":"8107","_schema":0,"_created_on_utc":14124967418110177,"_updated_on_utc":0,"_status_code":"200","_request_id":"1513105335429012499995707288186023842012","tenant_id":"101","type":"SITE","name":"Atlanta DC","location":{"longitude":-84.39019775390625, ... [reduced for brevity] ...
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

v1.0.0
- Initial release
