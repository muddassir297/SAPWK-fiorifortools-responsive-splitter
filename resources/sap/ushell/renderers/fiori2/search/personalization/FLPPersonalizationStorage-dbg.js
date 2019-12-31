/* global sap, jQuery*/
(function() {
    "use strict";


    // =======================================================================
    // declare package
    // =======================================================================
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.personalization.FLPPersonalizationStorage');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.personalization.Personalizer');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');

    var Personalizer = sap.ushell.renderers.fiori2.search.personalization.Personalizer;
    var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    // =======================================================================
    // flp personalization storage
    // =======================================================================
    var module = sap.ushell.renderers.fiori2.search.personalization.FLPPersonalizationStorage = function() {
        this.init.apply(this, arguments);
    };
    var FLPPersonalizationStorage = module;

    module.prototype = {

        init: function(container) {
            this.container = container;
            this.save = SearchHelper.delayedExecution(this.save, 2000);
        },

        save: function() {
            this.container.save();
        },

        getItem: function(key) {
            key = this.limitLength(key);
            if (!this._isStorageSupported()) {
                throw 'not supported storage';
            }
            return this.container.getItemValue(key);
        },

        setItem: function(key, data) {
            key = this.limitLength(key);
            if (!this._isStorageSupported()) {
                throw 'not supported storage';
            }
            this.container.setItemValue(key, data);
            this.save();
        },

        limitLength: function(key) {
            return key.slice(-40);
        },

        getPersonalizer: function(key) {
            return new Personalizer(key, this);
        },

        _isStorageSupported: function() {
            if (jQuery.sap.storage && jQuery.sap.storage.isSupported()) {
                return true;
            } else {
                return false;
            }
        }

    };

    module.getInstance = function() {
        var personalizationService = sap.ushell.Container.getService("Personalization");
        return personalizationService.getContainer("ushellSearchPersoServiceContainer").then(function(container) {
            return new FLPPersonalizationStorage(container);
        });
    };

})();
