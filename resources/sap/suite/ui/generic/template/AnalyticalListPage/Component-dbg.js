sap.ui.define(["sap/suite/ui/generic/template/lib/TemplateAssembler",
	"sap/suite/ui/generic/template/AnalyticalListPage/controller/ControllerImplementation"
], function(TemplateAssembler, ControllerImplementation) {
	"use strict";

	function getMethods(oComponent,oComponentUtils) {
		return {
			oControllerSpecification: {
				getMethods: ControllerImplementation.getMethods,
				oControllerDefinition: {
					getVisibleSelectionsWithDefaults: function() {
						// We need a list of all selection fields in the SmartFilterBar for which defaults are defined
						// (see method setSmartFilterBarDefaults) and which are currently visible.
						// This is needed by _getBackNavigationParameters in the NavigationController.
						var aVisibleFields = [];
						// if(this.oView.byId(this.sPrefix + ".DateKeyDate").getVisible()){
						// aVisibleFields.push("KeyDate");
						// }
						return aVisibleFields;
					},

					// ---------------------------------------------
					// Extensions
					// ---------------------------------------------
					onInitSmartFilterBarExtension: function(oEvent) {},
					getCustomAppStateDataExtension: function(oCustomData) {},
					restoreCustomAppStateDataExtension: function(oCustomData) {},
					onBeforeRebindTableExtension: function(oEvent) {},
					onBeforeRebindChartExtension: function(oEvent) {},
					onClearFilterExtension: function(oEvent) {}
				}
			},
			init: function() {
				var oTemplatePrivate = oComponent.getModel("_templPriv");
				// Note that component properties are not yet available here
				oTemplatePrivate.setProperty("/listReport", {}); 
				// Property to store UI settings of ALP
				oTemplatePrivate.setProperty("/alp", {
					filterMode: "visual",
					contentView: "charttable",
					autoHide: true,
					visualFilter: {}
				}); // Note that component properties are not yet available here

				//Filter model
				var filterModel = new sap.ui.model.json.JSONModel();
				//Model is bound to the component as it affects various controls
				oComponent.setModel(filterModel, "_filter");
			},
			forView: {
				hasDraft: function() {
					return oComponent.getAppComponent().getTransactionController().getDraftController().getDraftContext()
					.isDraftEnabled(oComponent.getEntitySet());
				}
			},
			//Adds Pageheader to the FIORI shell
			onActivate: function() {
				oComponentUtils.setBackNavigation(undefined);
			},
			refreshBinding: function() {
				// refresh list binding
				var oView = oComponent.getAggregation("rootControl");
				if (oView instanceof sap.ui.core.mvc.XMLView) {
					// Rebind table
					var oSmartTable = oView.byId("table");
					if (oSmartTable && oSmartTable.rebindTable) {
						oSmartTable.rebindTable();
					}

					// Rebind chart
					var oSmartChart = oView.byId("chart");
					if (oSmartChart && oSmartChart.rebindChart) {
						oSmartChart.rebindChart();
					}
				}
			},
			overwrite: {
				updateBindingContext: function() {

					sap.suite.ui.generic.template.lib.TemplateComponent.prototype.updateBindingContext.apply(oComponent, arguments);

					var oBindingContext = oComponent.getBindingContext();
					if (oBindingContext) {
						oComponent.getModel().getMetaModel().loaded()
						.then(
							function() {
								var oUIModel = oComponent.getModel("ui");

									// set draft status to blank according to UI decision
									// oUIModel.setProperty("/draftStatus", "");

									var oActiveEntity = oBindingContext.getObject();
									if (oActiveEntity) {

										var oDraftController = oComponent.getAppComponent().getTransactionController()
										.getDraftController();
										var oDraftContext = oDraftController.getDraftContext();
										var bIsDraft = oDraftContext.hasDraft(oBindingContext) && !oActiveEntity.IsActiveEntity;
										//var bHasActiveEntity = oActiveEntity.HasActiveEntity;
										if (bIsDraft) {
											oUIModel.setProperty("/editable", true);
											oUIModel.setProperty("/enabled", true);
										}
									}
								});
						//fnBindBreadCrumbs();
					}
				}
			}
		};
	}

	return TemplateAssembler.getTemplateComponent(getMethods,
		"sap.suite.ui.generic.template.AnalyticalListPage", {
			metadata: {
				library: "sap.suite.ui.generic.template",
				properties: {
					"templateName": {
						"type": "string",
						"defaultValue": "sap.suite.ui.generic.template.AnalyticalListPage.view.AnalyticalListPage"
					},
					"qualifier": {
						/*
							optional qualifier for a SelectionPresentationVariant or a PresentationVariant
							annotation. If no SelectionPresentationVariant exists with or without qualifier
							a PresentationVariant with the qualifier is searched. It always falls back to default
							of first SPV and than PV if qualifier can not be found
						 */
						"type": "string",
						"defaultValue": ""
					},
					"gridTable": "boolean",
					"multiSelect": "boolean",
					"smartVariantManagement": {
						/*
							Default to page variant
						 */
						"type": "boolean",
						"defaultValue": true
					},
					"defaultContentView":{
						/*
							optional setting to set the default filter type
						 */
						"type": "string",
						"defaultValue": "charttable"
					},
					"defaultFilterMode": {
						/*
							optional setting to set the default filter type
						 */
						"type": "string",
						"defaultValue": "visual"
					},
					"keyPerformanceIndicators": "array",
					"autoHide": {
						"type": "boolean",
						"defaultValue": true
					},
					"showAutoHide": {
						"type": "boolean",
						"defaultValue": true
					},
					"hideVisualFilter": {
						"type": "boolean",
						"defaultValue": false
					},
					"showGoButtonOnFilterBar":"boolean",
					"condensedTableLayout":"boolean",
					"showClearButtonOnFilterBar": {
						"type": "boolean",
						"defaultValue": false
					}
				},
				"manifest": "json"
			}
		});
});