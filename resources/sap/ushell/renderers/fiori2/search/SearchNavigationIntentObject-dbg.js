/* global jQuery, sap, window, document, console */
(function() {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchNavigationObject');

    var _oCrossAppNav = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");

    sap.ushell.renderers.fiori2.search.SearchNavigationObject.extend("sap.ushell.renderers.fiori2.search.SearchNavigationIntentObject", {

        constructor: function(params) {
            sap.ushell.renderers.fiori2.search.SearchNavigationObject.prototype.constructor.apply(this, arguments);
            this._externalTarget = params.externalTarget;
        },

        performNavigation: function() {
            if (_oCrossAppNav) {
                _oCrossAppNav.toExternal(this._externalTarget);
            } else {
                sap.ushell.renderers.fiori2.search.SearchNavigationObject.prototype.performNavigation.apply(this, arguments);
            }
        }


    });
})();
