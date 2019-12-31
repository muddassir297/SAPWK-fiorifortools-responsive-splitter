// iteration 0 ok

// @copyright@

/* global jQuery, sap */
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchShellHelper');
var SearchShellHelper = sap.ushell.renderers.fiori2.search.SearchShellHelper;

/* global sap */
sap.ui.controller("sap.ushell.renderers.fiori2.search.container.App", {

    onInit: function() {
        "use strict";
        this.oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
        this.oShellNavigation.hashChanger.attachEvent("hashChanged", this.hashChanged);

        if (SearchShellHelper.oSearchFieldGroup === undefined) {
            SearchShellHelper.init();
        }
        SearchShellHelper.setSearchState('EXP_S');

        // do not hide search bar, when search app runs
        if (sap.ui.Device.system.tablet || sap.ui.Device.system.phone) {
            sap.ushell.services.AppConfiguration.setHeaderHiding(false);
        }

    },

    hashChanged: function(oEvent) {
        "use strict";
        var model = sap.ushell.renderers.fiori2.search.getModelSingleton();
        model.deserializeURL();
    },

    onExit: function() {
        "use strict";

        this.oShellNavigation.hashChanger.detachEvent("hashChanged", this.hashChanged);

        if (SearchShellHelper.getDefaultOpen() !== true) {
            SearchShellHelper.setSearchState('COL');
        } else {
            SearchShellHelper.setSearchState('EXP');
        }

        // allow to hide search bar, when search app exits
        if (sap.ui.Device.system.tablet || sap.ui.Device.system.phone) {
            sap.ushell.services.AppConfiguration.setHeaderHiding(true);
        }
        if (this.oView.oPage.oFacetDialog) {
            this.oView.oPage.oFacetDialog.destroy();
        }
    }

});
