// @copyright@
/**
 * @fileOverview The Search adapter for the demo platform.
 *
 * @version @version@
 */
sap.ui.define(['sap/ushell/renderers/fiori2/search/esh/api/release/sina'],
	function(sina) {
	"use strict";

    /*global jQuery, sap, window */
    /**
     *
     * @param oSystem
     * @returns {sap.ushell.adapters.abap.SearchAdapter}
     */
    var SearchAdapter = function (oSystem, sParameter, oAdapterConfiguration) {

        this.isSearchAvailable = function () {
            var oDeferred = jQuery.Deferred();
            oDeferred.resolve(true);
            return oDeferred.promise();
        };

        this.getSina = function(){
            return window.sina.getSina({systemType: "ABAP", startWithSearch : "false" , noSapClientFromUrl: true});
        };

    };


	return SearchAdapter;

}, /* bExport= */ true);
