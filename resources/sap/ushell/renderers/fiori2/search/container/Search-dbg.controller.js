// iteration 0: ok
// @copyright@
/* global jQuery, sap, console */

(function() {
    "use strict";


    jQuery.sap.require("sap.ushell.renderers.fiori2.search.SearchModel");

    sap.ui.controller("sap.ushell.renderers.fiori2.search.container.Search", {

        onInit: function() {
            var that = this;
            sap.ui.getCore().getEventBus().subscribe("allSearchStarted", that.getView().onAllSearchStarted, that.getView());
            sap.ui.getCore().getEventBus().subscribe("allSearchFinished", that.getView().onAllSearchFinished, that.getView());
        },

        onExit: function() {
            var that = this;
            sap.ui.getCore().getEventBus().unsubscribe("allSearchStarted", that.getView().onAllSearchStarted, that.getView());
            sap.ui.getCore().getEventBus().unsubscribe("allSearchFinished", that.getView().onAllSearchFinished, that.getView());
        }

    });
}());
