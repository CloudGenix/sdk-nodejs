// Dependencies:
//

'use strict';

const EndpointManager = require("./EndpointManager.js");

class CloudGenixSdk {

    // <editor-fold desc="Constructors and Factories">

    constructor(email, password, debug, callback) {
        if (!email || 0 === email.length) throw "Email is empty";
        if (!password || 0 === password.length) throw "Password is empty";
        if (!callback) throw "Callback is empty";

        this._email = email;
        this._password = password;
        this._hostname = "api.cloudgenix.com";
        this._port = 443;
        // this._hostname = "localhost";
        // this._port = 3000;
        this._ssl = true;
        this._authHeaders = {};
        this._endpoints = new EndpointManager(this._debug);
        this._debug = debug;

        this.tenantId = null;
        this.authToken = null;

        this._endpointManager = new EndpointManager();
        this._log("CloudGenix SDK initialized with email " + this._email + " host " + this._hostname + ":" + this._port);

        var self = this;
        this._login(function(data, err) {
            if (data) {
                self._log("CloudGenix SDK login succeeded");
                self._retrieveProfile(function(data, err) {
                    if (data) {
                        self._log("CloudGenix SDK retrieved tenant ID: " + self.tenantId);
                        self._retrievePermissions(function(data, err) {
                            if (data) {
                                self._log("CloudGenix SDK retrieved permissions");
                                callback(true, null);
                            }
                            else {
                                throw "Unable to retrieve permissions";
                            }
                        }
                        );
                    }
                    else {
                        throw "Unable to retrieve tenant ID";
                    }
                }
                );
            }
            else {
                throw "Unable to login to controller";
            }
        }
        );
    }

    // </editor-fold>

    // <editor-fold desc="Public Methods">

    logout(callback) {
        var self = this;
        this._restRequest(
            "GET",
            this._endpoints.getEndpoint("logout"),
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("logout response data: " + data);
                    callback(true, null);
                }
                else {
                    self._log("logout unable to logout: " + err);
                    callback(null, true);
                }
            }
        );
    }

    getAllVersions() {
        return this._endpoints.getAllVersions();
    }

    getAllEndpoints() {
        return this._endpoints.getAllEndpoints();
    }

    getContexts(callback) {
        var self = this;
        var url = this._endpoints.getEndpoint("networkcontexts");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getContexts response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getContexts unable to retrieve contexts: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getSites(callback) {
        var self = this;
        var url = this._endpoints.getEndpoint("sites");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getSites response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getSites unable to retrieve sites: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getElements(callback) {
        var self = this;
        var url = this._endpoints.getEndpoint("elements");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getElements response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getElements unable to retrieve elements: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getElementInterfaces(siteId, elementId, callback) {
        if (!siteId) throw "Site ID must not be empty";
        if (!elementId) throw "Element ID must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("interfaces");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);
        url = url.replace("%s", elementId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getElements response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getElementInterfaces unable to retrieve element interfaces: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getElementInterfaceStatus(siteId, elementId, interfaceId, callback) {
        if (!siteId) throw "Site ID must not be empty";
        if (!elementId) throw "Element ID must not be empty";
        if (!interfaceId) throw "Interface ID must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("status_interfaces");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);
        url = url.replace("%s", elementId);
        url = url.replace("%s", interfaceId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getElementInterfaceStatus response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getElementInterfaceStatus unable to retrieve element interface status: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getWanNetworks(callback) {
        var self = this;
        var url = this._endpoints.getEndpoint("wannetworks");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getWanNetworks response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getWanNetworks unable to retrieve WANs: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getLanNetworks(callback) {
        var self = this;
        var url = this._endpoints.getEndpoint("lannetworks");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getLanNetworks response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getLanNetworks unable to retrieve LANs: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getAppDefs(callback) {
        var self = this;
        var url = this._endpoints.getEndpoint("appdefs");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getAppDefs response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getAppDefs unable to retrieve application definitions: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getPolicySets(callback) {
        var self = this;
        var url = this._endpoints.getEndpoint("policysets");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getPolicySets response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getPolicySets unable to retrieve policy sets: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getPolicyRules(policySetId, callback) {
        if (!policySetId) throw "Policy set ID must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("policyrules");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", policySetId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getPolicyRules response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getPolicyRules unable to retrieve policy rules: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getSecurityZones(callback) {
        var self = this;
        var url = this._endpoints.getEndpoint("securityzones");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getSecurityZones response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getSecurityZones unable to retrieve security zones: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getSiteSecurityZones(siteId, callback) {
        if (!siteId) throw "Site ID must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("sitesecurityzones");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getSiteSecurityZones response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getSiteSecurityZones unable to retrieve site security zones: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getSecurityPolicySets(callback) {
        var self = this;
        var url = this._endpoints.getEndpoint("securitypolicysets");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getSecurityPolicySets response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getSecurityPolicySets unable to retrieve security policy sets: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getSecurityPolicyRules(secPolicySetId, callback) {
        if (!secPolicySetId) throw "Security policy set ID must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("securitypolicyrules");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", secPolicySetId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getSecurityPolicyRules response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getSecurityPolicyRules unable to retrieve security policy rules: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getSiteWanInterfaces(siteId, callback) {
        if (!siteId) throw "Site ID must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("waninterfaces");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getSiteWanInterfaces response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getSiteWanInterfaces unable to retrieve site WAN interfaces: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getSnmpAgents(siteId, elementId, callback) {
        if (!siteId) throw "Site ID must not be empty";
        if (!elementId) throw "Element ID must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("snmpagents");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);
        url = url.replace("%s", elementId);

        this._restRequest(
            "GET",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getSnmpAgents response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getSnmpAgents unable to retrieve SNMP agents: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getSiteTopology(siteId, callback) {
        if (!siteId) throw "Site ID must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("topology");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);

        var body = {};
        body["type"] = "basenet";
        body["nodes"] = [ siteId ];

        this._restRequest(
            "POST",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            JSON.stringify(body),
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getSiteTopology response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getSiteTopology unable to retrieve site topology: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getMetrics(query, callback) {
        if (!query) throw "Query must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("metrics_monitor");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "POST",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            JSON.stringify(query),
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getMetrics response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getMetrics unable to retrieve metrics: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getTopN(query, callback) {
        if (!query) throw "Query must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("topn_monitor");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "POST",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            JSON.stringify(query),
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getTopN response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getTopN unable to retrieve top N data: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getFlows(query, callback) {
        if (!query) throw "Query must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("flows_monitor");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "POST",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            JSON.stringify(query),
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getFlows response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getFlows unable to retrieve top N data: " + err);
                    callback(null, err);
                }
            }
        );
    }

    getEvents(query, callback) {
        if (!query) throw "Query must not be empty";

        var self = this;
        var url = this._endpoints.getEndpoint("query_events");
        url = url.replace("%s", self.tenantId);

        this._restRequest(
            "POST",
            url,
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            JSON.stringify(query),
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("getEvents response data: " + data);
                    callback(data, null);
                }
                else {
                    self._log("getEvents unable to retrieve events: " + err);
                    callback(null, err);
                }
            }
        );
    }

    // </editor-fold>

    // <editor-fold desc="Internal Methods">

    _log(msg) {
        if (this._debug) {
            console.log(msg);
        }
    }

    _restRequest(verb, path, host, port, headers, contentType, data, debug, callback) {
        var self = this;
        var http = require("http");
        var https = require("https");

        if (!headers) headers = {};
        if (data) headers["content-length"] = data.length;
        if (contentType) headers["content-type"] = contentType;

        var options = {
            host: host,
            port: port,
            path: path,
            headers: headers,
            method: verb
        };

        self._log("restRequest " + verb + " " + self._hostname + ":" + self._port + " " + path + " [SSL " + self._ssl + "]");
        self._log(data);

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        var callbackInternal = function (response) {
            var responseBody = '';
            var statusCode = response.statusCode;

            response.on('error', function (error) {
                self._log("restRequest error encountered: " + error);
                callback(null, error);
            });

            response.on('data', function (chunk) {
                self._log("restRequest retrieved data: " + chunk.length + " bytes");
                responseBody += chunk;
            });

            response.on('end', function () {
                self._log("restRequest status " + statusCode + ": " + responseBody.length);
                if (statusCode > 299) {
                    // error
                    setTimeout(() => callback(null, responseBody, 0));
                }
                else {
                    // data
                    setTimeout(() => callback(responseBody, null, 0));
                }
            });
        };

        var req = null;
        if (self._ssl) {
            req = https.request(options, callbackInternal);
        }
        else {
            req = http.request(options, callbackInternal);
        }

        if (data) req.write(data);
        req.end();
    }

    _login(callback) {
        var self = this;
        var authBody = {};
        authBody["email"] = this._email;
        authBody["password"] = this._password;

        this._restRequest(
            "POST",
            this._endpoints.getEndpoint("login"),
            this._hostname,
            this._port,
            null,
            "application/json",
            JSON.stringify(authBody),
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("login response data: " + data);

                    var resp = JSON.parse(data);
                    if ("x_auth_token" in resp) {
                        // set auth headers
                        self.authToken = resp["x_auth_token"];
                        self._authHeaders["x-auth-token"] = self.authToken;
                        self._log("login set auth token to: " + self.authToken);
                        callback(true, null);
                    }
                    else {
                        throw "Auth token not found in login response";
                    }
                }
                else {
                    self._log("login unable to login: " + err);
                    callback(null, true);
                }
            }
        );
    }

    _retrieveProfile(callback) {
        var self = this;
        this._restRequest(
            "GET",
            this._endpoints.getEndpoint("profile"),
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("retrieveProfile response data: " + data);

                    var resp = JSON.parse(data);
                    if ("tenant_id" in resp) {
                        self.tenantId = resp["tenant_id"];
                        self._log("retrieveProfile set tenant ID to: " + self.tenantId);
                        callback("Success", null);
                    }
                    else {
                        throw "Tenant ID not found in profile response";
                    }
                }
                else {
                    self._log("retrieveProfile unable to retrieve tenant ID: " + err);
                    callback(null, "Unable to retrieve tenant ID");
                }
            }
        );
    }

    _retrievePermissions(callback) {
        var self = this;
        this._restRequest(
            "GET",
            this._endpoints.getEndpoint("permissions"),
            this._hostname,
            this._port,
            this._authHeaders,
            "application/json",
            null,
            this._debug,
            function(data, err) {
                if (data) {
                    // process and update endpoints and versions
                    self._log("retrievePermissions response data: " + data);

                    var resp = JSON.parse(data);
                    if (!"resource_version_map" in resp) {
                        self._log("retrievePermissions resource_version_map not found in response");
                        throw "Version map not found in permissions response";
                    }

                    if (!"resource_uri_map" in resp) {
                        self._log("retrievePermissions resource_uri_map not found in response");
                        throw "Resource URI map not found in response";
                    }

                    var versions = resp["resource_version_map"];
                    var endpoints = resp["resource_uri_map"];

                    for (var curr in versions) {
                        self._endpoints.addVersion(curr, versions[curr]);
                    }

                    for (var curr in endpoints) {
                        self._endpoints.addEndpoint(curr, endpoints[curr]);
                    }

                    callback("Success", null);
                }
                else {
                    self._log("retrievePermissions unable to retrieve permissions: " + err);
                    callback(null, "Unable to retrieve permissions");
                }
            }
        );
    }

    // </editor-fold>
};

module.exports = CloudGenixSdk;
