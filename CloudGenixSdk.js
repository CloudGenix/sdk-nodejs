/*

    CloudGenix Controller SDK
    (c) 2018 CloudGenix, Inc.
    All Rights Reserved

    https://www.cloudgenix.com

    This SDK is released under the MIT license.
    For support, please contact us on:

        NetworkToCode Slack channel #cloudgenix: http://slack.networktocode.com
        Email: developers@cloudgenix.com

 */

'use strict';

const EndpointManager = require("./EndpointManager.js");

class CloudGenixSdk {

    // <editor-fold desc="Constructors and Factories">

    constructor(email, password, token, debug) {
        this._email = email;
        this._password = password;
        this._token = token;
        this._samlRequestId = null;
        this._samlUrl = null;

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
        this.operatorId = null;

        this._loggedIn = false;
        this._clients = null;
        this._clientPerms = null;

        this._endpointManager = new EndpointManager();

        this._log("CloudGenix SDK initialized with host " + this._hostname + ":" + this._port);

        if (this._token && this._token.length > 0) 
        {
            this.authToken = this._token;
            this._log("Using static authentication token");
        } 
    }

    // </editor-fold>

    // <editor-fold desc="Public Methods">

    login() {
        var self = this;
        if (!self._email || 0 === self._email.length) throw "Email is empty";
        if (!self._password || 0 === self._password.length) throw "Password is empty";

        return new Promise(function(resolve, reject) {
            self._login(function(data, err) {
                if (data) {
                    self._log("CloudGenix SDK login succeeded");
                    self._retrieveProfile(function(data, err) {
                        if (data) {
                            self._log("CloudGenix SDK retrieved tenant ID: " + self.tenantId);
                            self._retrievePermissions(function(data, err) {
                                if (data) {
                                    self._log("CloudGenix SDK retrieved permissions");
                                    self._loggedIn = true;
                                    resolve(true);
                                }
                                else {
                                    reject(Error("Unable to retrieve permissions"));
                                }
                            });
                        }
                        else {
                            reject(Error("Unable to retrieve tenant ID"));
                        }
                    });
                }
                else {
                    reject(Error("Unable to login to controller"));
                }
            });
        });
    }

    loginWithToken() {
        var self = this;
        if (!self._token || 0 === self._token.length) throw "Token is empty";
        self._authHeaders["x-auth-token"] = self.authToken;
                        
        return new Promise(function(resolve, reject) { 
            self._retrieveProfile(function(data, err) {
                if (data) {
                    self._log("CloudGenix SDK retrieved tenant ID: " + self.tenantId);
                    self._retrievePermissions(function(data, err) {
                        if (data) {
                            self._log("CloudGenix SDK retrieved permissions");
                            self._loggedIn = true;
                            resolve(true);
                        }
                        else {
                            reject(Error("Unable to retrieve permissions"));
                        }
                    });
                }
                else {
                    reject(Error("Unable to retrieve tenant ID"));
                }
            });  
        });
    }

    loginSamlStart() {
        var self = this;

        return new Promise(function(resolve, reject) {
            self._log("CloudGenix SDK SAML login started");
            self._loginSamlStart(function(data, err) {
                if (data) {
                    self._log("CloudGenix SDK SAML retrieved login URL " + self._samlUrl + " for request ID " + self._samlRequestId);
                    resolve(self._samlUrl);
                }
                else {
                    reject(Error("Unable to retrieve SAML login details"));
                }
            });
        });
    }

    loginSamlFinish() {
        var self = this;

        return new Promise(function(resolve, reject) {
            self._log("CloudGenix SDK SAML login attempting to finish");
            self._loginSamlFinish(function(data, err) {
                if (data) {
                    self._log("CloudGenix SDK SAML succeeded");
                    self._retrieveProfile(function(data, err) {
                        if (data) {
                            self._log("CloudGenix SDK retrieved tenant ID: " + self.tenantId);
                            self._retrievePermissions(function(data, err) {
                                if (data) {
                                    self._log("CloudGenix SDK retrieved permissions");
                                    self._loggedIn = true;
                                    resolve(true);
                                }
                                else {
                                    reject(Error("Unable to retrieve permissions"));
                                }
                            });
                        }
                        else {
                            reject(Error("Unable to retrieve tenant ID"));
                        }
                    });
                }
                else {
                    reject(Error("Unable to retrieve SAML login details"));
                }
            });
        });
    }

    logout() {
        var self = this;
        if (!this._loggedIn) throw "Please login() first";

        return new Promise(function (resolve, reject) {
            self._restRequest(
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
                        resolve(true);
                    }
                    else {
                        self._log("logout unable to logout: " + err);
                        reject(Error("Unable to logout"));
                    }
                }
            );
        });
    }

    getAllVersions() {
        return this._endpoints.getAllVersions();
    }

    getAllEndpoints() {
        return this._endpoints.getAllEndpoints();
    }

    getClients() {
        var self = this;
        if (!self._loggedIn) throw "Please login() first";
        if (self.operatorId === undefined || self.operatorId === null) {
            throw "Only available to ESP/MSP accounts";
        }

        var clientsUrl = self._endpoints.getEndpoint("clients_t");
        if (!clientsUrl || clientsUrl === undefined || clientsUrl === null) {
            throw "Only available to ESP/MSP accounts";
        }

        clientsUrl = clientsUrl.replace("%s", self.tenantId); 

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                clientsUrl,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getClients clients response data: " + data);
                        self._clients = JSON.parse(data);

                        // now get clients to which we have permissions
                        // permissions_clients_d: '/v2.0/api/tenants/%s/operators/%s/clients/permissions',

                        var permsUrl = self._endpoints.getEndpoint("permissions_clients_d");
                        if (!permsUrl || permsUrl === undefined || permsUrl === null) {
                            throw "Only available to ESP/MSP accounts";
                        }

                        permsUrl = permsUrl.replace("%s", self.tenantId);
                        permsUrl = permsUrl.replace("%s", self.operatorId);

                        self._restRequest(
                            "GET",
                            permsUrl,
                            self._hostname, 
                            self._port,
                            self._authHeaders,
                            "application/json",
                            null,
                            self._debug,
                            function(data, err) {
                                if (data) {
                                    self._log("getClients permissions response data: " + data);
                                    self._clientPerms = JSON.parse(data);

                                    // now create a new dictionary with clients to which
                                    // we have permissions

                                    var clients = [];

                                    for (var i = 0; i < self._clients.items.length; i++) {
                                        for (var j = 0; j < self._clientPerms.items.length; j++) {
                                            if (self._clients.items[i].tenant_id
                                                === self._clientPerms.items[j].client_id) {
                                                var currClient = {
                                                    "client_id": self._clientPerms.items[j].client_id,
                                                    "name": self._clients.items[i].name
                                                };
                                                self._log("getClients adding ID " + 
                                                    currClient.client_id + ": " + 
                                                    currClient.name);

                                                clients.push(currClient);
                                                break;
                                            }
                                        }
                                    }

                                    self._log("getClients returning " + clients.length + " clients");
                                    resolve(clients);
                                }
                                else {
                                    self._log("getClients unable to retrieve client permissions: " + err);
                                    reject(Error(err));                                    
                                }
                            }
                        ); 
                    }
                    else {
                        self._log("getClients unable to retrieve clients list: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    emulateClient(id) {
        var self = this;
        if (!self._loggedIn) throw "Please login() first";
        if (!id) throw "ID must be supplied";
        if (self.operatorId === undefined || self.operatorId === null) {
            throw "Only available to ESP/MSP accounts";
        }

        var url = self._endpoints.getEndpoint("login_clients");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", id);
        var reqBody = { };

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "POST",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                JSON.stringify(reqBody),
                self._debug,
                function (data, err) {
                    if (data) {
                        self._log("emulateClient response data: " + data);
                        var resp = JSON.parse(data);
                        if ("x_auth_token" in resp) {
                            // set auth headers
                            self.authToken = resp["x_auth_token"];
                            self._authHeaders["x-auth-token"] = self.authToken;
                            self._log("emulateClient set auth token to: " + self.authToken + " for client ID " + id);
                        }
                        else {
                            throw "No auth token found for client ID " + id;
                        }

                        self._log("CloudGenix SDK login succeeded for client ID " + id);
                        self._retrieveProfile(function(data, err) {
                            if (data) {
                                self._log("CloudGenix SDK retrieved tenant ID: " + self.tenantId);
                                self._retrievePermissions(function(data, err) {
                                    if (data) {
                                        self._log("CloudGenix SDK retrieved permissions");
                                        self._loggedIn = true;
                                        resolve(true);
                                    }
                                    else {
                                        reject(Error("Unable to retrieve permissions"));
                                    }
                                });
                            }
                            else {
                                reject(Error("Unable to retrieve tenant ID"));
                            }
                        });
                    }
                    else {
                        self._log("emulateClient unable to login as client: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getContexts(id) {
        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("networkcontexts");
        url = url.replace("%s", self.tenantId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function (data, err) {
                    if (data) {
                        self._log("getContexts response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getContexts unable to retrieve contexts: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getSites(id) {
        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("sites");
        url = url.replace("%s", self.tenantId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getSites response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getSites unable to retrieve sites: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getElements(id) {
        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("elements");
        url = url.replace("%s", self.tenantId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getElements response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getElements unable to retrieve elements: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getElementInterfaces(siteId, elementId, id) {
        if (!siteId) throw "Site ID must not be empty";
        if (!elementId) throw "Element ID must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("interfaces");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);
        url = url.replace("%s", elementId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getElementInterfaces response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getElementInterfaces unable to retrieve elements: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getElementInterfaceStatus(siteId, elementId, interfaceId) {
        if (!siteId) throw "Site ID must not be empty";
        if (!elementId) throw "Element ID must not be empty";
        if (!interfaceId) throw "Interface ID must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("status_interfaces");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);
        url = url.replace("%s", elementId);
        url = url.replace("%s", interfaceId);

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getElementInterfaceStatus response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getElementInterfaceStatus unable to retrieve element interface status: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getWanNetworks(id) {
        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("wannetworks");
        url = url.replace("%s", self.tenantId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getWanNetworks response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getWanNetworks unable to retrieve WANs: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getLanNetworks(siteId, id) {
        if (!siteId) throw "Site ID must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("lannetworks");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getLanNetworks response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getLanNetworks unable to retrieve LANs: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getAppDefs(id) {
        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("appdefs");
        url = url.replace("%s", self.tenantId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getAppDefs response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getAppDefs unable to retrieve application definitions: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getPolicySets(id) {
        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("policysets");
        url = url.replace("%s", self.tenantId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getPolicySets response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getPolicySets unable to retrieve policy sets: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getPolicyRules(policySetId, id) {
        if (!policySetId) throw "Policy set ID must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("policyrules");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", policySetId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getPolicyRules response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getPolicyRules unable to retrieve policy rules: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getSecurityZones(id) {
        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("securityzones");
        url = url.replace("%s", self.tenantId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getSecurityZones response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getSecurityZones unable to retrieve security zones: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getSiteSecurityZones(siteId, id) {
        if (!siteId) throw "Site ID must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("sitesecurityzones");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getSiteSecurityZones response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getSiteSecurityZones unable to retrieve security zones: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getSecurityPolicySets(id) {
        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("securitypolicysets");
        url = url.replace("%s", self.tenantId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getSecurityPolicySets response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getSecurityPolicySets unable to retrieve security policy sets: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getSecurityPolicyRules(secPolicySetId, id) {
        if (!secPolicySetId) throw "Security policy set ID must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("securitypolicyrules");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", secPolicySetId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getSecurityPolicyRules response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getSecurityPolicyRules unable to retrieve security policy rules: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getSiteWanInterfaces(siteId, id) {
        if (!siteId) throw "Site ID must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("waninterfaces");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getSiteWanInterfaces response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getSiteWanInterfaces unable to retrieve site WAN interfaces: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getSnmpAgents(siteId, elementId, id) {
        if (!siteId) throw "Site ID must not be empty";
        if (!elementId) throw "Element ID must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("snmpagents");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);
        url = url.replace("%s", elementId);
        if (typeof(id) !== "undefined" && id !== null) url += "/" + id;

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "GET",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                null,
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getSnmpAgents response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getSnmpAgents unable to retrieve SNMP agents: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getSiteTopology(siteId) {
        if (!siteId) throw "Site ID must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("topology");
        url = url.replace("%s", self.tenantId);
        url = url.replace("%s", siteId);

        var body = {};
        body["type"] = "basenet";
        body["nodes"] = [ siteId ];

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "POST",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                JSON.stringify(body),
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getSiteTopology response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getSiteTopology unable to retrieve site topology: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getMetrics(query) {
        if (!query) throw "Query must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("metrics_monitor");
        url = url.replace("%s", self.tenantId);

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "POST",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                JSON.stringify(query),
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getMetrics response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getMetrics unable to retrieve metrics: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getTopN(query) {
        if (!query) throw "Query must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("topn_monitor");
        url = url.replace("%s", self.tenantId);

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "POST",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                JSON.stringify(query),
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getTopN response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getTopN unable to retrieve top N data: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getFlows(query) {
        if (!query) throw "Query must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("flows_monitor");
        url = url.replace("%s", self.tenantId);

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "POST",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                JSON.stringify(query),
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getFlows response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getFlows unable to retrieve flows: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getEvents(query) {
        if (!query) throw "Query must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint("query_events");
        url = url.replace("%s", self.tenantId);

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "POST",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                JSON.stringify(query),
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("getEvents response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("getEvents unable to retrieve events: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
    }

    getAllEvents(query) {
        if (!query) throw "Query must not be empty";
        if (!global._eventsResponse) {
            global._eventsResponse = {
                _offset: null,
                _status_code: 200,
                included_count: 0,
                items: [],
                total_count: 0
            };
        }
        
        global._eventsQuery = query;
        
        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        // console.log("getAllEvents entering");

        return new Promise(function(resolve, reject) {
            function success(data) {
                if (!data 
                    || !data["items"] 
                    || data["items"] === null 
                    || data["items"] === undefined 
                    || data["items"].length < 1) {
                    var ret = global._eventsResponse;
                    global._eventsResponse = null;
                    global._eventsQuery = null;
                    // console.log("getAllEvents finished with no items");
                    resolve(ret);
                }
 
                // console.log("getAllEvents received data with " + data.items.length + " entries");

                for (var i = 0; i < data["items"].length; i++) {
                    global._eventsResponse.items.push(data["items"][i]);
                }

                global._eventsResponse["included_count"] += data["items"].length;
                global._eventsResponse["total_count"] += data["items"].length;
                global._eventsResponse["_status_code"] = data["_status_code"];
                global._eventsResponse["_offset"] = data["_offset"];
                global._eventsQuery["_offset"] = data["_offset"];

                if (data["_offset"] !== null && data["_offset"] !== undefined) {
                    // console.log("getAllEvents offset found: " + data["_offset"]);
                    resolve(self.getAllEvents(global._eventsQuery));
                }
                else {
                    var ret = global._eventsResponse;
                    global._eventsResponse = null;
                    global._eventsQuery = null;
                    // console.log("getAllEvents finished, no offset found, returning " + ret.items.length + " entries");
                    resolve(ret);
                }
            };

            function failure(data) {
                // console.log("getAllEvents error received: " + data);
                reject(data);
            }

            self.getEvents(global._eventsQuery).then(success, failure);
        });
    }

    query(objType, params) {
        if (!objType) throw "Object type must not be empty";
        if (!params) throw "Params must not be empty";

        var self = this;
        if (!self._loggedIn) throw "Please login() first";

        var url = self._endpoints.getEndpoint(objType);
        if (!objType) throw "Unknown object type";
        url = url.replace("%s", self.tenantId);
        url += "/query";

        return new Promise(function (resolve, reject) {
            self._restRequest(
                "POST",
                url,
                self._hostname,
                self._port,
                self._authHeaders,
                "application/json",
                JSON.stringify(params),
                self._debug,
                function(data, err) {
                    if (data) {
                        self._log("query response data: " + data);
                        resolve(JSON.parse(data));
                    }
                    else {
                        self._log("query unable to retrieve response: " + err);
                        reject(Error(err));
                    }
                }
            );
        });
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
        else headers["content-length"] = 0;

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

    _loginSamlStart(callback) {
        var self = this;
        var authBody = {};
        authBody["email"] = this._email; 

        var refererUrl = "";
        if (self._ssl) refererUrl = "https://";
        else refererUrl = "http://";
        refererUrl += self._hostname + ":" + self._port + "/v2.0/api/login";

        var headers = {};
        headers["Referer"] = refererUrl;

        this._restRequest(
            "POST",
            this._endpoints.getEndpoint("login"),
            this._hostname,
            this._port,
            headers,
            "application/json",
            JSON.stringify(authBody),
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("loginSaml response data: " + data);

                    var resp = JSON.parse(data);
                    if ("url" in resp && "requestId" in resp) {
                        // set auth headers
                        self._samlRequestId = resp["requestId"];
                        self._samlUrl = resp["urlpath"];
                        self._log("loginSaml SAML URL set to " + self._samlUrl + " for request ID " + self._samlRequestId);
                        callback(true, null);
                    }
                    else {
                        throw "SAML details not found in login response";
                    }
                }
                else {
                    self._log("loginSaml unable to login: " + err);
                    callback(null, true);
                }
            }
        );
    }

    _loginSamlFinish(callback) {
        var self = this;
        var authBody = {};
        authBody["email"] = this._email; 
        authBody["requestId"] = this._samlRequestId;

        var refererUrl = "";
        if (self._ssl) refererUrl = "https://";
        else refererUrl = "http://";
        refererUrl += self._hostname + ":" + self._port + "/v2.0/api/login";

        var headers = {};
        headers["Referer"] = refererUrl;

        this._restRequest(
            "POST",
            this._endpoints.getEndpoint("login"),
            this._hostname,
            this._port,
            headers,
            "application/json",
            JSON.stringify(authBody),
            this._debug,
            function(data, err) {
                if (data) {
                    self._log("loginSamlFinish response data: " + data);

                    var resp = JSON.parse(data);
                    if ("x_auth_token" in resp) {
                        // set auth headers
                        self.authToken = resp["x_auth_token"];
                        self._authHeaders["x-auth-token"] = self.authToken;
                        self._log("loginSamlFinish set auth token to: " + self.authToken);
                        callback(true, null);
                    }
                    else {
                        throw "Auth token not found in login response";
                    }
                }
                else {
                    self._log("loginSamlFinish unable to login: " + err);
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

                        if (resp["id"] !== undefined && resp["id"] !== null) {
                            self.operatorId = resp["id"];
                            self._log("retrieveProfile set operator ID to: " + self.operatorId);
                        }

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
