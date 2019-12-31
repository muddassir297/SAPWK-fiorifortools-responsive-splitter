sap.ui.define(["sap/m/SegmentedButtonItem", "sap/m/Button", "sap/m/ButtonType", "sap/ui/base/EventProvider", "sap/m/SegmentedButton","sap/ui/core/mvc/Controller"
    ],
    function(SegmentedButtonItem, Button, ButtonType, EventProvider, SegmentedButton, Controller) {
        "use strict";

		var	CONTAINER_VIEW_TABLE = "table",
			CONTAINER_VIEW_CHART = "chart",
			CONTAINER_VIEW_CHARTTABLE = "charttable";

		//var masterDetailViewInit = false;



		var tbController = Controller.extend("sap.suite.ui.generic.template.AnalyticalListPage.controller.ToolbarController", {
			setState:function(oState) {
				var me = this;
				me.oState = oState;
				me._uiCompRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");

				var defaultView = oState.oController.getOwnerComponent().getDefaultContentView();

				// delay insertion out custom toolbar buttons until the
				// smartTable and smartChart are properly initialized
				me.oState._pendingTableToolbarInit = true;
				me.oState._pendingChartToolbarInit = true;


				//Creating the view switch buttons for the chart and table
				if (!me.oState.alr_viewSwitchButtonOnChart || !me.oState.alr_viewSwitchButtonOnTable) {
					me.oState.alr_viewSwitchButtonOnChart = me.createViewSwitchButton(true);
					me.oState.alr_viewSwitchButtonOnTable = me.createViewSwitchButton(false);
				}

				var oTemplatePrivate = me.oState.oController.getOwnerComponent().getModel("_templPriv");
				oTemplatePrivate.setProperty('/alp/contentView', defaultView);
			},
			_addComponentInstanceToUI:function(oComponentInstance) {
				var me = this;
				var oMainVBox = me.oState.alr_detailContainer;
				sap.ui.core.ResizeHandler.register(
					oMainVBox,
					function() {
						oComponentContainer.setHeight(oMainVBox.getDomRef().clientHeight + "px");
					});

				//var metaModel = oComponentInstance.getModel().getMetaModel();

				oMainVBox.removeAllItems();

				if (oComponentInstance.getRouter() && !oComponentInstance.getRouter()._bIsInitialized) {
					oComponentInstance.getRouter().initialize();
				}

				var oComponentContainer = new sap.ui.core.ComponentContainer({
					component: oComponentInstance
				});

				if (oMainVBox.getDomRef()) {
					oComponentContainer.setHeight(oMainVBox.getDomRef().clientHeight + "px");
				}

				oMainVBox.addItem(oComponentContainer);
			},
			createViewSwitchButton:function(chartMode) {

				var buttonItems = [
					new sap.m.SegmentedButtonItem({
						tooltip:"{i18n>CONTAINER_VIEW_CHARTTABLE}",
						key:CONTAINER_VIEW_CHARTTABLE,
						icon:"sap-icon://chart-table-view"
					}),
					new sap.m.SegmentedButtonItem({
						tooltip:"{i18n>CONTAINER_VIEW_CHART}",
						key:CONTAINER_VIEW_CHART,
						icon:"sap-icon://vertical-bar-chart-2"
					}),
					new sap.m.SegmentedButtonItem({
						tooltip:"{i18n>CONTAINER_VIEW_TABLE}",
						key:CONTAINER_VIEW_TABLE,
						icon:"sap-icon://table-view"
					})
				];

				var btnSettings = {
					select:  jQuery.proxy(function(){
								this.oState.oController._templateEventHandlers.onSegmentButtonPressed(!this.oState.oController.getOwnerComponent().getProperty('smartVariantManagement'));
						}, this),
					layoutData: new sap.m.OverflowToolbarLayoutData({
						priority:sap.m.OverflowToolbarPriority.NeverOverflow
					}),
					items:buttonItems,
					selectedKey: "{_templPriv>/alp/contentView}"
				};
				if (chartMode) {
					jQuery.extend(btnSettings, {
						visible: "{= (${_templPriv>/alp/contentView} === 'chart' || ${_templPriv>/alp/contentView} === 'charttable') && !${_templPriv>/alp/fullScreen} }"
					});
					var segBtn = new SegmentedButton(btnSettings);
				} else {
					jQuery.extend(btnSettings, {
						visible: "{= (${_templPriv>/alp/contentView} === 'table') && !${_templPriv>/alp/fullScreen} }"
					});
					var segBtn = new SegmentedButton(btnSettings);
				}
				return segBtn;
			}
		});

		return tbController;
});
