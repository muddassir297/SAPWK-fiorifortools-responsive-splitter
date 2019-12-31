sap.ui.define([
    "jquery.sap.global", "sap/m/library", "sap/m/P13nDimMeasurePanel"
], function(jQuery, library, P13nDimMeasurePanel) {
    "use strict";


    var P13nDimMeasurePanelExt = P13nDimMeasurePanel.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.P13nDimMeasurePanelExt",
    {
        renderer:{}
    });


    P13nDimMeasurePanelExt.prototype._includeModelItem = function(oItem, iIndex) {
        if (iIndex < 0) {
            iIndex = this._oTable.getItems().length;
        }

        var fGetAvailableRoleTypes = function() {
            return [
                {
                    key: "row",
                    text: "Row"
                }, {
                    key: "column",
                    text: "Column"
                }
            ];
        };
        var oModelItem = {
            columnKey: oItem.getColumnKey(),
            visible: true,
            text: oItem.getText(),
            tooltip: oItem.getTooltip(),
            aggregationRole: oItem.getAggregationRole(),
            availableRoleTypes: fGetAvailableRoleTypes(),

            // default value
            persistentIndex: -1,
            persistentSelected: undefined,
            role: undefined,

            tableIndex: undefined
        };
        var oModel = this.getModel("$sapmP13nDimMeasurePanel");
        oModel.getData().items.splice(iIndex, 0, oModelItem);
    };

});
