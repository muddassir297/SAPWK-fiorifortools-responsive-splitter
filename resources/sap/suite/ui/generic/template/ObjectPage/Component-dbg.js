sap.ui.define(["sap/m/DraftIndicatorState", "sap/suite/ui/generic/template/lib/TemplateAssembler",
	"sap/suite/ui/generic/template/lib/TemplateComponent", "sap/suite/ui/generic/template/ObjectPage/controller/ControllerImplementation"
], function(DraftIndicatorState, TemplateAssembler, TemplateComponent, ControllerImplementation) {
	"use strict";

	function getMethods(oComponent, oComponentUtils) {
		var oViewProxy = {};
		var sHeaderTitle; // initialized on demand

		return {
			oControllerSpecification: {
				getMethods: ControllerImplementation.getMethods.bind(null, oViewProxy),
				oControllerDefinition: {
					// ---------------------------------------------
					// Extensions
					// ---------------------------------------------
					onBeforeRebindTableExtension: function(oEvent) {}
				}
			},
			init: function(){
				var oTemplatePrivateModel = oComponentUtils.getTemplatePrivateModel();
				oTemplatePrivateModel.setProperty("/objectPage", {
					displayMode: 0 // 0 = unknown, 1 = display, 2 = edit, 4 = add, 6 = change (edit or add)
				});
			},
			getTemplateSpecificParameters: function(){
				return {
					breadCrumb: oComponentUtils.getBreadCrumbInfo()	
				};
			},
			getTitle: function(){
				if (!sHeaderTitle){
				// determine title
					var oMetaModel = oComponent.getModel().getMetaModel();
					var oModelEntitySet = oMetaModel.getODataEntitySet(oComponent.getEntitySet());
					var oDataEntityType = oMetaModel.getODataEntityType(oModelEntitySet.entityType);
					var oHeaderInfo = oDataEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"];
					sHeaderTitle = (oHeaderInfo && oHeaderInfo.TypeName && oHeaderInfo.TypeName.String) || "";
					if (sHeaderTitle.substr(0,7) === "{@i18n>") {
						var sSubstr = sHeaderTitle.substring(1, sHeaderTitle.length - 1);
						var aString = sSubstr.split(">");
						sHeaderTitle = oComponent.getModel(aString[0]).getResourceBundle().getText(aString[1]);
					}
				}
				return sHeaderTitle;
			},
			onActivate: function(sBindingPath) {
				// preliminary: in draft case maybe on first time property is not set
				var oUIModel = oComponent.getModel("ui");
				var oTemplatePrivateModel = oComponentUtils.getTemplatePrivateModel();
				if (oComponentUtils.getEditableNDC()) {
					oUIModel.setProperty("/editable", true);
					var bCreateMode = oComponentUtils.isNonDraftCreate();
					oUIModel.setProperty("/createMode", bCreateMode);
					oTemplatePrivateModel.setProperty("/objectPage/displayMode", bCreateMode ? 4 : 2);
				} else if (!oViewProxy.isDraftEnabled()) {
					oUIModel.setProperty("/editable", false);
					oUIModel.setProperty("/createMode", false);
					oTemplatePrivateModel.setProperty("/objectPage/displayMode", 1);
				}
				oViewProxy.onComponentActivate(sBindingPath);
			},
			refreshBinding: function(bUnconditional, mRefreshInfos) {
				// default implementation: refresh element binding
				if (bUnconditional) {
					var oElementBinding = oComponent.getComponentContainer().getElementBinding();
					if (oElementBinding) {
						oElementBinding.refresh(true);
					}
				} else {
					oViewProxy.refreshFacets(mRefreshInfos);
				}
			},
			presetDisplayMode: function(iDisplayMode, bIsAlreadyDisplayed){
				if (bIsAlreadyDisplayed){
					return; // wait for the data to come for the case that the view is already displayed
				}
				var oTemplateModel = oComponentUtils.getTemplatePrivateModel();
				oTemplateModel.setProperty("/objectPage/displayMode", iDisplayMode);
			},
			
			// This method is called when a new binding context has been retrieved for this Component.
			// If the entity is draft enabled this happens whenever a different instance is displayed or the edit status changes.
			// If the entity is not draft enabled this only happens when a different instance is displayed.
			// It does not happen when changing to edit mode or creating a new instance. In this case the adjustment of the JSON models is already done in onActivate.
			updateBindingContext: function() {

				var oBindingContext = oComponent.getBindingContext();
				var oTemplatePrivateModel = oComponentUtils.getTemplatePrivateModel();
				var oContextInfo = oComponentUtils.registerContext(oBindingContext);
				// set draft status to blank according to UI decision
				oTemplatePrivateModel.setProperty("/generic/draftIndicatorState", DraftIndicatorState.Clear);

				//call the rebindTable explicitly since the smart table enableAutoBinding=true 
				//didn't trigger GET of 1:n all cases
				oViewProxy.refreshFacets(null, true);
				
				var oActiveEntity = oBindingContext.getObject();
				var oUIModel = oComponent.getModel("ui");
				var bIsEditable;
				if (oContextInfo.bIsDraft) {
					bIsEditable = true;
					oUIModel.setProperty("/enabled", true);
					oTemplatePrivateModel.setProperty("/objectPage/displayMode", oContextInfo.bIsCreate ? 4 : 2);
				} else {
					bIsEditable = oComponentUtils.getEditableNDC();
					oTemplatePrivateModel.setProperty("/objectPage/displayMode", bIsEditable ? 2 : 1);
					var oDraftController = oComponent.getAppComponent().getTransactionController().getDraftController();
					var oDraftContext = oDraftController.getDraftContext();
					if (oActiveEntity.hasOwnProperty("HasDraftEntity") && oActiveEntity.HasDraftEntity &&
						oDraftContext.hasSiblingEntity(oComponent.getEntitySet())) {
						oUIModel.setProperty("/enabled", false);
						var oModel = oComponent.getModel();
						var oReadDraftInfoPromise = new Promise(function(fnResolve, fnReject) {
							oModel.read(
								oBindingContext.getPath(), {
									urlParameters: {
										"$expand": "SiblingEntity,DraftAdministrativeData"
									},
									success: fnResolve,
									error: fnReject
								});
						});
						var oBusyHelper = oComponentUtils.getBusyHelper();
						oBusyHelper.setBusy(oReadDraftInfoPromise);
						oReadDraftInfoPromise.then(
							function(oResponseData) {
								var oSiblingContext = oModel.getContext(
									"/" + oModel.getKey(oResponseData.SiblingEntity));
								if (oSiblingContext) {
									oViewProxy.draftResume(oSiblingContext, oActiveEntity,
										oResponseData.DraftAdministrativeData);
								}
								// enable the buttons
								oUIModel.setProperty("/enabled", true);
							},
							function(oError) {
								// open: error handling
							}
						);
					} else {
						// enable the buttons
						oUIModel.setProperty("/enabled", true);
					}
				}
				oUIModel.setProperty("/createMode", oContextInfo.bIsCreate);
				oUIModel.setProperty("/editable", bIsEditable);
			}
		};
	}

	return TemplateAssembler.getTemplateComponent(getMethods,
		"sap.suite.ui.generic.template.ObjectPage", {

			metadata: {
				library: "sap.suite.ui.generic.template",
				properties: {
					// reference to smart template
					"templateName": {
						"type": "string",
						"defaultValue": "sap.suite.ui.generic.template.ObjectPage.view.Details"
					},
					// shall button "Related Apps" be visible on the object page?
					"showRelatedApps": {
						"type": "boolean",
						"defaultValue": "false"
					},
					// shall it be possible to edit the contents of the header?
					"editableHeaderContent": {
						"type": "boolean",
						"defaultValue": "false"
					},
					"gridTable": "boolean",
					"sections": "object"
				},
				// app descriptor format
				"manifest": "json"
			}
		});
});