// @copyright@
(function() {
    "use strict";
    /* global jQuery, sap */
    jQuery.sap.declare("sap.ushell.components.tiles.cdm.applauncher.Component");


    sap.ui.define([
        "sap/ui/core/UIComponent"
    ], function (UIComponent) {

        return UIComponent.extend("sap.ushell.components.tiles.cdm.applauncher.Component", {
            metadata : {
                "manifest": "json"
            },

            // create content
            createContent : function () {

                // take tile configuration from manifest - if exists
                // take tile personalization from component properties - if exists
                // merging the tile configuration and tile personalization
                var oComponentData = this.getComponentData();
                var oManifestConfig = this.getManifestEntry("/sap.ui5/config") || {};
                var oP13n = oComponentData.properties.tilePersonalization || {};
                var oMergedConfig = jQuery.extend(oManifestConfig, oP13n);

                // adding sap-system to configuration
                var oStartupParams = oComponentData.startupParameters;
                if (oStartupParams && oStartupParams["sap-system"]) {
                    //sap-system is always an array. we take the first value
                    oMergedConfig["sap-system"] = oStartupParams["sap-system"][0];
                }

                var oTile = sap.ui.view({
                    type : sap.ui.core.mvc.ViewType.JS,
                    viewName : "sap.ushell.components.tiles.cdm.applauncher.StaticTile",
                    viewData: {
                        properties: oComponentData.properties,
                        configuration: oMergedConfig
                    }
                });
                this._oController = oTile.getController();
                return oTile;
            },

            // interface to be provided by the tile
            tileSetVisualProperties : function (oNewVisualProperties) {
                if (this._oController) {
                    this._oController.updatePropertiesHandler(oNewVisualProperties);
                }
            },

            // interface to be provided by the tile
            tileRefresh : function () {
                // empty implementation. currently static tile has no need in referesh handler logic
            },

            // interface to be provided by the tile
            tileSetVisible : function (bIsVisible) {
              // empty implementation. currently static tile has no need in visibility handler logic
            },

            exit : function () {
                this._oController = null;
            }
        });
    });
}());

