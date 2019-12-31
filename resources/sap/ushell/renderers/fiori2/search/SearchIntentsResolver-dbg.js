/* global $,jQuery,window */
// iteration 0

(function() {
    "use strict";
    /* eslint no-warning-comments:0 */

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchNavigationIntentObject');
    var SearchNavigationIntentObject = sap.ushell.renderers.fiori2.search.SearchNavigationIntentObject;

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchIntentsResolver');
    var module = sap.ushell.renderers.fiori2.search.SearchIntentsResolver = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = {
        init: function(model) {
            this._oCrossAppNav = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
            this._model = model;
        },

        resolveIntents: function(results) {
            var that = this;

            // Synchronize all intent requests through one additional deferred object
            var dfd = new $.Deferred();

            if (!that._oCrossAppNav) {
                dfd.resolve();
                return dfd.promise();
            }

            that._model.sina.sinaSystem().getServerInfo().then(
                function(serverInfo) {
                    var semanticObjectTypeSupported = false;
                    if (serverInfo && serverInfo.rawServerInfo && serverInfo.rawServerInfo.Services) {
                        for (var i = 0; i < serverInfo.rawServerInfo.Services.length; ++i) {
                            var service = serverInfo.rawServerInfo.Services[i];
                            if (service.Service === 'Search') {
                                for (var j = 0; j < service.Capabilities.length; ++j) {
                                    var capability = service.Capabilities[j];
                                    if (capability.Capability === 'SemanticObjectType') {
                                        semanticObjectTypeSupported = true;
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    } else {
                        semanticObjectTypeSupported = true;
                    }

                    if (!semanticObjectTypeSupported) {
                        dfd.resolve();
                    } else {
                        var proms = [];
                        for (var k = 0; k < results.length; k++) {
                            var result = results[k];

                            if (result.semanticObjectType && result.semanticObjectType.length > 0) {
                                var prom = that._doResolveIntents(result);
                                proms.push(prom);
                            }
                        }

                        //var dfd = new $.Deferred();
                        $.when.apply(null, proms).always(function(args) { //TODO: error handling
                            dfd.resolve();
                        });
                    }
                }
            );

            return dfd.promise();
        },

        _doResolveIntents: function(result) {
            var that = this;

            // reset main URL
            if (result.titleNavigationIsOldURL) {
                result.titleNavigation = undefined;
            }

            // additional deferredObject is necessary, because if one of the inner
            // promise objects fails, $.when.always (see below) resolves immediately
            // and does not wait for the other inner proms to either resolve or fail.
            var prom, outerProm = new $.Deferred();
            if (that._oCrossAppNav.getLinks) {
                prom = that._oCrossAppNav.getLinks({
                    semanticObject: result.semanticObjectType,
                    params: result.semanticObjectTypeAttrs,
                    withAtLeastOneUsedParam: true,
                    sortResultOnTexts: true
                });
            } else {
                prom = that._oCrossAppNav.getSemanticObjectLinks(result.semanticObjectType, result.semanticObjectTypeAttrs);
            }
            prom.done(function(intents) {
                var factSheetAction = "-displayFactSheet";
                var foundFactSheet = result.titleNavigation !== undefined;

                var sapSystemIntentParameter;
                if (result.systemId && result.client) {
                    sapSystemIntentParameter = "sap-system=sid(" + result.systemId + "." + result.client + ")";
                }

                result.intents = [];

                if (!result.navigationObjects) {
                    result.navigationObjects = [];
                }

                for (var i = 0; i < intents.length; i++) {
                    var intent = intents[i];

                    var shellHash = intent.intent;

                    if (sapSystemIntentParameter) {
                        if (shellHash.indexOf('?') === -1) {
                            shellHash += "?";
                        } else {
                            shellHash += "&";
                        }
                        shellHash += sapSystemIntentParameter;
                    }

                    var externalTarget = {
                        target: {
                            shellHash: shellHash
                        }
                    };
                    var externalHash = that._oCrossAppNav.hrefForExternal(externalTarget);

                    var navigationObject = new SearchNavigationIntentObject({
                        text: intent.text,
                        href: externalHash,
                        externalTarget: externalTarget
                    });

                    if (!foundFactSheet && intent.intent.substring(intent.intent.indexOf("-"), intent.intent.indexOf("?")) === factSheetAction) {
                        result.uri = externalHash;

                        result.titleNavigation = navigationObject;
                        foundFactSheet = true;
                    } else {
                        intent.target = externalTarget.target;
                        intent.externalHash = externalHash;
                        result.intents.push(intent);

                        result.navigationObjects.push(navigationObject);
                    }
                }

                outerProm.resolve();
            });
            prom.fail(function(arg) {
                outerProm.resolve();
            });
            return outerProm;
        }
    };

})();
