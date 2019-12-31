/* global jQuery, sap, window */

(function() {
    "use strict";

    // =======================================================================
    // declare package
    // =======================================================================
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchConfiguration');

    // =======================================================================
    // import packages
    // =======================================================================
    var DefaultSearchResultListSelectionHandler = 'sap.ushell.renderers.fiori2.search.controls.SearchResultListSelectionHandler';
    jQuery.sap.require(DefaultSearchResultListSelectionHandler);
    var DefaultSearchResultListSelectionHandlerControl = jQuery.sap.getObject(DefaultSearchResultListSelectionHandler);

    // =======================================================================
    // url parameter meta data
    // =======================================================================
    var urlParameterMetaData = {
        multiSelect: {
            type: 'bool'
        },
        odataProvider: {
            type: 'bool'
        },
        searchBusinessObjects: {
            type: 'bool'
        },
        charts: {
            type: 'bool'
        },
        maps: {
            type: 'bool'
        },
        newpie: {
            type: 'bool'
        },
        personalizationStorage: {
            type: 'string'
        }
    };

    // =======================================================================
    // search configuration
    // =======================================================================
    var SearchConfiguration = sap.ushell.renderers.fiori2.search.SearchConfiguration = function() {
        this.init.apply(this, arguments);
    };

    SearchConfiguration.prototype = {

        init: function(params) {
            // read global config
            try {
                var config = window['sap-ushell-config'].renderers.fiori2.componentData.config.esearch;
                jQuery.extend(true, this, config);
            } catch (e) { /* nothing to do.. */ }
            // handle outdated parameters
            this.handleOutdatedConfigurationParameters();
            // for parameters without values set the defaults
            this.setDefaults();
            // overwrite parameters by url
            this.readUrlParameters();
            // set module load paths
            this.setModulePaths();
        },

        setModulePaths: function() {
            if (!this.modulePaths) {
                return;
            }
            for (var i = 0; i < this.modulePaths.length; ++i) {
                var modulePath = this.modulePaths[i];
                jQuery.sap.registerModulePath(modulePath.moduleName, modulePath.urlPrefix);
            }
        },

        handleOutdatedConfigurationParameters: function() {
            try {

                // get config
                var config = window['sap-ushell-config'].renderers.fiori2.componentData.config;

                // due to historical reasons the config parameter searchBusinessObjects is not in esearch but in parent object
                // copy this parameter to config object
                if (config.searchBusinessObjects !== undefined && this.searchBusinessObjects === undefined) {
                    if (config.searchBusinessObjects === 'hidden' || config.searchBusinessObjects === false) {
                        this.searchBusinessObjects = false;
                    } else {
                        this.searchBusinessObjects = true;
                    }
                }

                // copy shell configuration parameter enableSearch to config object
                if (config.enableSearch !== undefined && this.enableSearch === undefined) {
                    this.enableSearch = config.enableSearch;
                }

            } catch (e) { /* nothing to do.. */ }
        },

        setDefaults: function() {
            if (this.searchBusinessObjects === undefined) {
                this.searchBusinessObjects = true;
            }
            if (this.odataProvider === undefined) {
                this.odataProvider = false;
            }
            if (this.multiSelect === undefined) {
                this.multiSelect = true;
            }
            if (this.charts === undefined) {
                this.charts = true;
            }
            if (this.maps === undefined) {
                this.maps = false;
            }
            if (this.newpie === undefined) {
                this.newpie = false;
            }
            if (this.dataSources === undefined) {
                this.dataSources = {};
            }
            if (this.enableSearch === undefined) {
                this.enableSearch = true;
            }
            if (this.personalizationStorage === undefined) {
                this.personalizationStorage = 'auto';
            }
        },

        readUrlParameters: function() {
            var parameters = this.parseUrlParameters();
            for (var parameter in parameters) {
                if (parameter === 'demoMode') {
                    this.searchBusinessObjects = true;
                    this.enableSearch = true;
                    continue;
                }
                var parameterMetaData = urlParameterMetaData[parameter];
                if (!parameterMetaData) {
                    continue;
                }
                var value = parameters[parameter];
                switch (parameterMetaData.type) {
                    case 'bool':
                        value = (value === 'true' || value === '');
                        break;
                    default:
                }
                this[parameter] = value;
            }
        },

        parseUrlParameters: function() {
            var oURLParsing = sap.ushell.Container.getService("URLParsing");
            var params = oURLParsing.parseParameters(window.location.search);
            var newParams = {};
            // params is an object with name value pairs. value is always an array with values
            // (useful if url parameter has multiple values)
            // Here only the first value is relevant
            for (var key in params) {
                var value = params[key];
                if (value.length !== 1) {
                    continue;
                }
                value = value[0];
                if (typeof value !== 'string') {
                    continue;
                }
                newParams[key] = value;
            }
            return newParams;
        },

        getDataSourceConfig: function(dataSource) {

            var config;
            var semanticObjectType = dataSource.semanticObjectType;
            if (!semanticObjectType && dataSource.semanticObjectTypes && dataSource.semanticObjectTypes.length == 1) {
                semanticObjectType = dataSource.semanticObjectTypes[0];
            }
            if (this.semanticObjects && semanticObjectType) {
                config = this.semanticObjects[semanticObjectType];
            }

            if (!config && dataSource.semanticObjectType === 'fileprocessorurl') {
                try {
                    config = {
                        searchResultListItem: 'sap.ushell.renderers.fiori2.search.controls.SearchResultListItemDocument'
                    }
                    jQuery.sap.require(config.searchResultListItem);
                    config.searchResultListItemControl = jQuery.sap.getObject(config.searchResultListItem);
                } catch (e) {
                    //console.log(">>>" + e);
                    config = undefined;
                }
            }

            // no config -> create default config
            if (!config) {
                if (!this._defaultConfig) {
                    this._defaultConfig = {
                        //                         searchResultListItem: DefaultSearchResultListItem,
                        //                         searchResultListItemControl: DefaultSearchResultListItemControl,

                        searchResultListItemContent: undefined,
                        searchResultListItemContentControl: undefined,

                        searchResultListSelectionHandler: DefaultSearchResultListSelectionHandler,
                        searchResultListSelectionHandlerControl: DefaultSearchResultListSelectionHandlerControl
                    };
                }
                config = this._defaultConfig;
                if (semanticObjectType) {
                    this.semanticObjects = this.semanticObjects || [];
                    this.semanticObjects[semanticObjectType] = config;
                }
            }

            // no value for control -> set default control
            if (config.searchResultListItemContent && !config.searchResultListItemContentControl) {

                try {
                    jQuery.sap.require(config.searchResultListItemContent);
                    config.searchResultListItemContentControl = jQuery.sap.getObject(config.searchResultListItemContent);
                } catch (e) {
                    //console.log(">>>" + e);
                }
            }

            //             if (!config.searchResultListItemControl) {
            //                 config.searchResultListItemControl = DefaultSearchResultListItemControl;
            //             }

            //             try {
            //                 // load control
            //                 if (!config.searchResultListItemControl) {
            //                     jQuery.sap.require(config.searchResultListItem);
            //                     config.searchResultListItemControl = jQuery.sap.getObject(config.searchResultListItem);
            //                 }
            //             } catch (e) {
            //                 //console.log(">>>" + e);
            //             }

            config.searchResultListSelectionHandler = config.searchResultListSelectionHandler || DefaultSearchResultListSelectionHandler;

            try {
                // load control
                if (!config.searchResultListSelectionHandlerControl) {
                    jQuery.sap.require(config.searchResultListSelectionHandler);
                    config.searchResultListSelectionHandlerControl = jQuery.sap.getObject(config.searchResultListSelectionHandler);
                }
            } catch (e) {
                //console.log(">>>" + e);
            }

            return config;
        },

        isLaunchpad: function() {
            try {
                return !!sap.ushell.Container.getService("CrossApplicationNavigation");
            } catch (e) {
                return false;
            }
        },

        getSina: function() {
            jQuery.sap.require("sap.ushell.renderers.fiori2.search.esh.api.release.sina");
            if (!this.isSinaRegistered) {
                if (!this.odataProvider && this.isLaunchpad()) {
                    // inav2
                    sap.ushell.Container.addRemoteSystem(
                        new sap.ushell.System({
                            alias: "ENTERPRISE_SEARCH",
                            platform: "abap",
                            baseUrl: "/ENTERPRISE_SEARCH"
                        })
                    );
                    this.sina = window.sina.getSina();
                } else {
                    this.sina = window.sina.getSina({
                        'impl_type': "odata2"
                    });
                }
            }
            this.isSinaRegistered = true;
            return this.sina;
        }

    };

    var searchConfiguration;

    SearchConfiguration.getInstance = function() {
        if (searchConfiguration) {
            return searchConfiguration
        }
        searchConfiguration = new SearchConfiguration();
        return searchConfiguration;
    }

})();
