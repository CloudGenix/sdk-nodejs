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

//
// Test.js
//
// CloudGenix SDK test application
// SDK is initialized with debug ENABLED - disable debug to reduce console output
//
// Dependencies:
//   CloudGenixSdk          require("./CloudGenixSdk.js");
//

const CgSdk = require("./CloudGenixSdk.js");

function menu() {
    console.log("Available commands:");
    console.log("  help             help, this menu");
    console.log("  q                quit");
    console.log("  cls              clear console");
    console.log("  login            login to the controller");
    console.log("  logout           logout of the controller");
    console.log("  show             show commands");
    console.log("                   | token   tenant_id   versions   endpoints");
    console.log("                   | site_id   element_id   interface_id   policy_set_id");
    console.log("  set <cmd> <val>  set values");
    console.log("                   | site_id   element_id   interface_id   policy_set_id");
    console.log("  get <cmd>        retrieve objects");
    console.log("                   | contexts   sites   elements   interfaces   ifstatus");
    console.log("                   | wans   lans   appdefs   policysets   policyrules");
    console.log("                   | seczones   siteseczones   secpolsets   secpolrules");
    console.log("                   | sitewanifs   topology   snmpagents");
    console.log("");
}

function processCommands(sdk) {
    console.log("CloudGenix SDK Interactive Console");
    console.log("Type '?' for help, or CTRL-C to end");

    var siteId = null;
    var elementId = null;
    var interfaceId = null;
    var policySetId = null;

    var stdin = process.openStdin();

    stdin.addListener("data", function(cmd) {
        // note: cmd is an object, and when converted to a string it will
        // end with a linefeed.  so we (rather crudely) account for that
        // with toString() and then trim()
        if (!cmd) return;
        cmd = cmd.toString().trim();

        if (cmd.startsWith("set")) {
            // <editor-fold Desc="Set Variables">

            var args = cmd.split(" ");
            if (args.length != 3) {
                console.log("Set commands must be of the form: set <var> <val> where:");
                console.log("  <var> is the variable to set");
                console.log("        site_id   element_id   interface_id   policy_set_id");
                console.log("  <val> is the value to apply to that variable");
            }
            else {
                var v = args[1];
                switch (v) {
                    case "site_id":
                        siteId = args[2];
                        console.log("site_id = " + siteId);
                        break;

                    case "element_id":
                        elementId = args[2];
                        console.log("element_id = " + elementId);
                        break;

                    case "interface_id":
                        interfaceId = args[2];
                        console.log("interface_id = " + interfaceId);
                        break;

                    case "policy_set_id":
                        policySetId = args[2];
                        console.log("policy_set_id = " + policySetId);
                        break;

                    default:
                        console.log("Unknown variable name specified");
                }
            }

            // </editor-fold>
        }
        else {
            // <editor-fold Desc="Other Commands">

            switch (cmd) {
                case "?":
                    menu();
                    break;

                case "q":
                    process.exit(0);
                    break;

                case "cls":
                    console.API.clear();
                    break;

                case "login":
                    sdk.login().then(success, failure);
                    break;

                case "logout":
                    sdk.logout().then(success, failure);;
                    break;

                // <editor-fold desc="Show Commands">

                case "show token":
                    console.log(sdk.authToken);
                    break;

                case "show tenant_id":
                    console.log(sdk.tenantId);
                    break;

                case "show versions":
                    console.log(JSON.stringify(sdk.getAllVersions()));
                    break;

                case "show endpoints":
                    console.log(JSON.stringify(sdk.getAllEndpoints()));
                    break;

                case "show site_id":
                    console.log(siteId);
                    break;

                case "show element_id":
                    console.log(elementId);
                    break;

                case "show interface_id":
                    console.log(interfaceId);
                    break;

                case "show policy_set_id":
                    console.log(policySetId);
                    break;

                // </editor-fold>

                // <editor-fold desc="Get Commands">

                case "get contexts":
                    sdk.getContexts().then(success, failure);
                    break;

                case "get sites":
                    sdk.getSites().then(success, failure);
                    break;

                case "get elements":
                    sdk.getElements().then(success, failure);
                    break;

                case "get interfaces":
                    sdk.getElementInterfaces(siteId, elementId).then(success, failure);
                    break;

                case "get ifstatus":
                    sdk.getElementInterfaceStatus(siteId, elementId, interfaceId).then(success, failure);
                    break;

                case "get wans":
                    sdk.getWanNetworks().then(success, failure);
                    break;

                case "get lans":
                    sdk.getLanNetworks(siteId).then(success, failure);
                    break;

                case "get appdefs":
                    sdk.getAppDefs().then(success, failure);
                    break;

                case "get policysets":
                    sdk.getPolicySets().then(success, failure);
                    break;

                case "get policyrules":
                    sdk.getPolicyRules(policySetId).then(success, failure);
                    break;

                case "get seczones":
                    sdk.getSecurityZones().then(success, failure);
                    break;

                case "get siteseczones":
                    sdk.getSiteSecurityZones(siteId).then(success, failure);
                    break;

                case "get secpolsets":
                    sdk.getSecurityPolicySets().then(success, failure);
                    break;

                case "get secpolrules":
                    sdk.getSecurityPolicyRules(policySetId).then(success, failure);
                    break;

                case "get sitewanifs":
                    sdk.getSiteWanInterfaces(siteId).then(success, failure);
                    break;

                case "get topology":
                    sdk.getSiteTopology(siteId).then(success, failure);
                    break;

                case "get snmpagents":
                    sdk.getSnmpAgents(siteId, elementId).then(success, failure);
                    break;

                // </editor-fold>

                default:
                    break;
            }
        }
    });
}

function success(result) {
    console.log("Success: " + result);
}

function failure(err) {
    console.log("Error: " + err);
}

//<editor-fold desc="Test">

let sdk = new CgSdk("demo@cloudgenix.com", "demo@cloudgenix.com", true);
processCommands(sdk);

//</editor-fold>