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

'use strict';

class EndpointManager {

    // <editor-fold desc="Constructors and Factories">

    constructor(debug) {
        this._versions = {};
        this._endpoints = {};
        this._debug = debug;

        // static versions
        this.addVersion("login", "v2.0");
        this.addVersion("logout", "v2.0");
        this.addVersion("permissions", "v2.0");
        this.addVersion("profile", "v2.0");
        this.addVersion("flows_monitor", "v3.0");
        this.addVersion("query_events", "v2.0");

        // static endpoints
        this.addEndpoint("login", "/%s/api/login");
        this.addEndpoint("logout", "/%s/api/logout");
        this.addEndpoint("permissions", "/%s/api/permissions");
        this.addEndpoint("profile", "/%s/api/profile");
        this.addEndpoint("flows_monitor", "/%s/api/tenants/%s/monitor/flows");
        this.addEndpoint("query_events", "/%s/api/tenants/%s/events/query");
    }

    // </editor-fold>

    // <editor-fold desc="Public Methods">

    addVersion(api, version) {
        if (api in this._versions) {
            // do not override static mappings
            this._log("addVersion skipping add version for api " + api + ": static mapping exists");
            return;
        }
        this._log("addVersion added version for api: " + api + " " + version);
        this._versions[api] = version;
    }

    getVersion(api) {
        if (api in this._versions) {
            this._log("addVersion returning version for api " + api + ": " + this._versions[api]);
            return this._versions[api];
        }
        return null;
    }

    getAllVersions() {
        return this._versions;
    }

    addEndpoint(api, url) {
        if (api in this._endpoints) {
            // do not override static mappings
            this._log("addEndpoint skipping add endpoint for endpoint " + api + ": static mapping exists");
            return;
        }

        // get the version
        if (api in this._versions) {
            var version = this._versions[api];
            var amendedUrl = url.replace("%s", version);
            this._log("addEndpoint added endpoint for api " + api + ": " + amendedUrl);
            this._endpoints[api] = amendedUrl;
            return;
        }
        else {
            this._log("addEndpoint unable to find version for api: " + api);
            return;
        }
    }

    getEndpoint(api) {
        if (api in this._endpoints) {
            this._log("getEndpoint returning endpoint for api " + api + ": " + this._endpoints[api]);
            return this._endpoints[api];
        }
        else {
            this._log("getEndpoint unable to find endpoint for api " + api);
            return null;
        }
    }

    getAllEndpoints() {
        return this._endpoints;
    }

    // </editor-fold>

    // <editor-fold desc="Internal Methods">

    _log(msg) {
        if (this._debug) {
            console.log(msg);
        }
    }

    // </editor-fold>
};

module.exports = EndpointManager;
