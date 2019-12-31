sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/d3",
    "sap/suite/ui/generic/template/AnalyticalListPage/util/KpiUtil"
], function(jQuery, Fragment, Controller, JSONModel, D3, KpiUtil) {
    "use strict";
    jQuery.sap.require("sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter");

    var cController = Controller.extend("sap.suite.ui.generic.template.AnalyticalListPage.controller.KpiCardController", {

        onInit: function(evt) {
            this.busyDelegate = {
                onBeforeRendering: function() {
                    this.setBusy(true);
                }
            };

            this.freeDelegate = {
                onAfterRendering: function() {
                    this.setBusy(false);
                }
            };
        },

        onExit: function() {

        },

        /**
        * @private
        * [updateTitle  this function calculates updates the KPI Header]
        * @param  {string} sTitle [Title obtained from Annotation]
        * @param  {integer} iScaleFactor [ScaleFactor obtained from Annotation]
        * @param  {string} sUnitOfMeasure [Unit Of Measure]
        * @param  {string} sId [Id Of Label]
        */
        _updateTitle: function(sTitle, iScaleFactor, sUnitOfMeasure, sId) {
            var oLabel = this.byId(sId);
            oLabel.setBusy(true);
            var oFixedInteger = KpiUtil.getNumberFormatter(true, iScaleFactor, 2);//Third parameter has no impact in this case
            var sFormat = oFixedInteger.oLocaleData.getDecimalFormat("short", iScaleFactor, "other");
            var sScaleValue = "";
            if (sFormat) {
                for (var i = 0; i < sFormat.length; i++) {
                    if (sFormat[i] != "0") {
                        sScaleValue += sFormat[i];
                    }
                }
            }
            if (sUnitOfMeasure === undefined || sUnitOfMeasure === "%") {
                sUnitOfMeasure = "";
            }
            var i18nModel = this.getView().getModel("i18n");
            if (!i18nModel) {
                return "";
            }
            var rb = i18nModel.getResourceBundle();
            /*
            if (sScaleValue && sUnitOfMeasure) {
                oLabel.setText(rb.getText("KPI_CARD_TITLE_SF_UNIT", [sTitle, sScaleValue, sUnitOfMeasure]));
            } else if (sUnitOfMeasure) {
                oLabel.setText(rb.getText("KPI_CARD_TITLE_UNIT", [sTitle, sUnitOfMeasure]));
            } else*/ 
            if (sScaleValue) {
                oLabel.setText(rb.getText("KPI_CARD_TITLE_SF", [sTitle, sScaleValue]));
            } else {
                oLabel.setText(rb.getText("KPI_CARD_TITLE", [sTitle]));
            }
            //oLabel.setText(rb.getText("KPI_CARD_TITLE", [sTitle]));
            oLabel.setBusy(false);
        },

        onBeforeRendering: function() {

            // todo: validate card definitions
            var vizFrame = this._getVizFrameContainer();

            //sap.ovp.cards.charts.VizAnnotationManager.getSelectedDataPoint(vizFrame, this);
            if (!vizFrame) {
                jQuery.sap.log.error("no kpi card VIZ container" +
                    ": (" + this.getView().getId() + ")");
            } else {
                vizFrame.addEventDelegate(this.busyDelegate, vizFrame);
                var oSettings = this.getView().data("qualifierSettings");
                //var oModel = this.getView().data("model");
                //var oDataPoint = this.getView().data("dataPoint");
                var oDataPointMeasure = this.getView().data("dataPointMeasure");
                var oChart = this.getView().data("chart");
                var oEntityTypeProperty = this.getView().data("entityTypeProperty");
                //var sTitle = KpiUtil.getPathOrPrimitiveValue(oModel, oDataPoint.Title);
                //var iScaleFactor = KpiUtil.getPathOrPrimitiveValue(oModel, oDataPoint.ValueFormat.ScaleFactor);
                var sUnitOfMeasure = KpiUtil.getUnitofMeasure(oSettings.model, oEntityTypeProperty);
                var iScaleFactorMeasure = "";
                var sTitleMeasure = KpiUtil.getPathOrPrimitiveValue(oChart.Title);
                if (oDataPointMeasure && oDataPointMeasure.ValueFormat && oDataPointMeasure.ValueFormat.ScaleFactor) {
                    iScaleFactorMeasure = KpiUtil.getPathOrPrimitiveValue(oDataPointMeasure.ValueFormat.ScaleFactor);
                }

                //this._updateTitle(sTitle, iScaleFactor, sUnitOfMeasure, "kpiHeaderTitle");
                this._updateTitle(sTitleMeasure, iScaleFactorMeasure, sUnitOfMeasure, "kpiChartHeaderTitle");

                //Register formatter
                sap.suite.ui.generic.template.AnalyticalListPage.util.KpiVizAnnotationHelper.formatChartAxes(iScaleFactorMeasure);

                sap.suite.ui.generic.template.AnalyticalListPage.util.KpiVizAnnotationHelper.setupChartAttributes(vizFrame,oSettings);
                var binding = vizFrame.getDataset().getBinding("data");
                if (binding.getPath()) {
                    binding.attachDataReceived(jQuery.proxy(this.onDataReceived, this));
                } else {
                    // todo: fail safe ..
                }
            }
        },

        onAfterRendering: function() {

        },

        onDataReceived: function(oEvent) {
            var vizFrame = this._getVizFrameContainer();
            vizFrame.addEventDelegate(this.freeDelegate, vizFrame);
        },

        _getVizFrameContainer: function() {
            var me = this;
            if (!me._oChart) {
                me._oChart = me.getView().byId("kpiCardChartVizFrame");
            }
            return me._oChart;
        },

        setActual: function(iActual) {
            var me = this;
            me.getView().byId("kpiCardActual").setValue(iActual);
        },

        handleNavigationPress: function(oEvent) {
            var oEventSource = oEvent.getSource();

            var navService = sap.ushell.Container.getService("CrossApplicationNavigation");

            navService.toExternal({
                target : { semanticObject : oEventSource.data("target"), action : oEvent.getSource().data("action")},
                params : JSON.parse(oEventSource.data("parameters"))
            });
        }
    });


    return cController;

});
