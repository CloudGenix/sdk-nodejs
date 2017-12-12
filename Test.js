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
    console.log("  show             show commands");
    console.log("                   | token   tenant_id   versions   endpoints");
    console.log("  set <cmd> <val>  set values");
    console.log("                   | site_id   element_id");
    console.log("  get <cmd>        retrieve objects");
    console.log("                   | contexts   sites   elements   interfaces   ifstatus");
    console.log("                   | wans   lans   appdefs   policysets   policyrules");
    console.log("                   | seczones   siteseczones   secpolsets   secpolrules");
    console.log("                   | sitewanifs   topology   snmpagents");
    console.log("  metrics <cmd>    retrieve metrics");
    console.log("                   | clear   show   build   addmetric   addfilter   submit");
    console.log("  topn <cmd>       retrieve top N statistics");
    console.log("                   | clear   show   build   addfilter   submit");
    console.log("  flows <cmd>      retrieve flows");
    console.log("                   | clear   show   build   addfilter   submit");
    console.log("  events <cmd>     retrieve events");
    console.log("                   | clear   show   build   submit   summary");
    console.log("");
}

function processCommands(sdk) {
    console.log("CloudGenix SDK Interactive Console");
    console.log("Type '?' for help, or CTRL-C to end");

    var siteId = null;
    var elementId = null;
    var interfaceId = null;
    var policySetId = null;

    var metricsQuery = null;

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

                case "logout":
                    sdk.logout(cb);
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

                // </editor-fold>

                // <editor-fold desc="Get Commands">

                case "get contexts":
                    sdk.getContexts(cb);
                    break;

                case "get sites":
                    sdk.getSites(cb);
                    break;

                case "get elements":
                    sdk.getElements(cb);
                    break;

                case "get interfaces":
                    sdk.getElementInterfaces(siteId, elementId, cb);
                    break;

                case "get ifstatus":
                    sdk.getElementInterfaceStatus(siteId, elementId, interfaceId, cb);
                    break;

                case "get wans":
                    sdk.getWanNetworks(cb);
                    break;

                case "get lans":
                    sdk.getLanNetworks(cb);
                    break;

                case "get appdefs":
                    sdk.getAppDefs(cb);
                    break;

                case "get policysets":
                    sdk.getPolicySets(cb);
                    break;

                case "get policyrules":
                    sdk.getPolicyRules(policySetId, cb);
                    break;

                case "get seczones":
                    sdk.getSecurityZones(cb);
                    break;

                case "get siteseczones":
                    sdk.getSiteSecurityZones(siteId, cb);
                    break;

                case "get secpolsets":
                    sdk.getSecurityPolicySets(cb);
                    break;

                case "get secpolrules":
                    sdk.getSecurityPolicyRules(policySetId, cb);
                    break;

                case "get sitewanifs":
                    sdk.getSiteWanInterfaces(siteId, cb);
                    break;

                case "get topology":
                    sdk.getSiteTopology(siteId, cb);
                    break;

                case "get snmpagents":
                    sdk.getSnmpAgents(siteId, elementId, cb);
                    break;

                // </editor-fold>

                default:
                    break;
            }
        }
    });
}

function cb(data, err) {
    if (data) {
        console.log("Data: " + data);
    }
    else {
        console.log("Error: " + err);
    }
}

//<editor-fold desc="Test">

let sdk = new CgSdk("demo@cloudgenix.com", "demo@cloudgenix.com", true, function(data, err) {
    if (data) {
        console.log("Successfully logged in");
        processCommands(sdk);
    }
    else {
        throw "Unable to login";
    }
});

//</editor-fold>