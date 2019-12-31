sap.ui
	.define(
		["jquery.sap.global", "sap/ui/base/Object", "sap/ui/core/format/DateFormat", "sap/ui/core/routing/HashChanger",
			"sap/m/MessageBox", "sap/m/MessageToast", "sap/ui/model/Filter", "sap/ui/model/Sorter",
			"sap/ui/table/AnalyticalTable", "sap/ui/comp/smarttable/SmartTable", "sap/ui/generic/app/navigation/service/SelectionVariant",
			"sap/suite/ui/generic/template/lib/MessageButtonHelper", "sap/suite/ui/generic/template/lib/testableHelper",
			"sap/suite/ui/generic/template/ObjectPage/extensionAPI/ExtensionAPI", "sap/ui/model/json/JSONModel","sap/suite/ui/generic/template/js/AnnotationHelper", "sap/ui/core/mvc/ViewType"
		],
		function(jQuery, BaseObject, DateFormat, HashChanger, MessageBox, MessageToast, Filter, Sorter,
			AnalyticalTable, SmartTable, SelectionVariant, MessageButtonHelper, testableHelper, ExtensionAPI, JSONModel, AnnotationHelper, ViewType) {
			"use strict";
			function fnIsEventForTableWithInlineCreate(oSmartTable){
				return oSmartTable.data("inlineCreate") === "true";
			}
			
			return {
				getMethods: function(oViewProxy, oTemplateUtils, oController) {
					var oState = {
						aUnsavedDataCheckFunctions: [] //array for external unsaved data check functions that can be registered
					}; // contains attributes oSmartFilterbar and oSmartTable. Initialized in onInit.
					var bIsObjectRoot; // will currently be set first time, when edit button is pressed
					var fnFclNavigteToDraft;
					var bIsContainedInFCL;
					var aEntitySets; // initialized in onInit
					var sLinkUp;
					
					function onActivateImpl() {
						if (oTemplateUtils.oServices.oApplication.getBusyHelper().isBusy()){
							jQuery.sap.log.info("Activation of object suppressed, since App is currently busy");
							return; // this is again tested by the CRUDManager. But in order to suppress the AfterActivate-Event in the busy case we also need to check this here.
						}
						jQuery.sap.log.info("Activate object");
						var oActivationPromise = oTemplateUtils.oServices.oCRUDManager.activateDraftEntity();
						oActivationPromise.then(function(oResponse) {
							oTemplateUtils.oServices.oApplication.showMessageToast(oTemplateUtils.oCommonUtils.getText("OBJECT_SAVED"));
							if (oResponse && oResponse.context) {
								// it's not enough to set root to dirty: Scenario: subitem has been displayed (active document), then changed (draft) and shall be
								// displayed again after activation - now data has to be read again
								// therefore we set all pages to dirty, excluding the current one (here the active data is already returned by the function import)
								oTemplateUtils.oServices.oViewDependencyHelper.setAllPagesDirty([oController.getOwnerComponent().getId()]);
								oTemplateUtils.oServices.oViewDependencyHelper.unbindChildren(oController.getOwnerComponent());
								// navigate to activate document
								oTemplateUtils.oServices.oNavigationController.navigateToContext(
									oResponse.context, undefined, true);
							}
						});
						var oEvent = {
							activationPromise: oActivationPromise
						};
						oTemplateUtils.oComponentUtils.fire(oController, "AfterActivate", oEvent);
					}
					
					function onActivate(){
						oTemplateUtils.oServices.oApplication.performAfterSideEffectExecution(onActivateImpl);                         	
					}
					
					function setEditable(bIsEditable) {
						var oUIModel = oController.getView().getModel("ui");
						oUIModel.setProperty("/editable", bIsEditable);
						if (bIsObjectRoot && !oTemplateUtils.oCommonUtils.isDraftEnabled()) {
							oTemplateUtils.oComponentUtils.setEditableNDC(bIsEditable);
						}
					}
					function fnAdaptBindingParamsForInlineCreate(oEvent) {
						if (fnIsEventForTableWithInlineCreate(oEvent.getSource())) {
							var oBindingParams = oEvent.getParameter("bindingParams");
							if (oBindingParams.filters && oBindingParams.filters.length) {
								var oNewLineFilter = new Filter({
									path: "HasActiveEntity",
									operator: "EQ",
									value1: false
								});
								oBindingParams.filters = [new Filter({
									filters: [new Filter(oBindingParams.filters), oNewLineFilter],
									and: false,
									bAnd: false
								})];
							}
							var fnGroup = oBindingParams.sorter[0] && oBindingParams.sorter[0].getGroupFunction();
							var fnGroupExtended = fnGroup && function(oContext){
								var oObject = oContext.getObject();
								if (oObject.IsActiveEntity || oObject.HasActiveEntity){
									var oRet =  jQuery.extend({}, fnGroup(oContext));
									oRet.key = oRet.key.charAt(0) === "§" ? "§" + oRet.key : oRet.key;
									return oRet;
								}
								return {
									key: "§",
									text: oTemplateUtils.oCommonUtils.getText("NEW_ENTRY_GROUP")
								};
							};
							oBindingParams.sorter.unshift(new Sorter("HasActiveEntity", false, fnGroupExtended));
						}
					}
					function fnOnShareObjectPageEmailPress(sObjectTitle, sObjectSubtitle) {
						var sEmailSubject = sObjectTitle;
						if (sObjectSubtitle) {
							sEmailSubject = sEmailSubject + " - " + sObjectSubtitle;
						}
						sap.m.URLHelper.triggerEmail(null, sEmailSubject, document.URL);
					}
					function fnOnShareObjectPageInJamPress(sObjectTitle, sObjectSubtitle) {
						var oShareDialog = sap.ui.getCore().createComponent({
							name: "sap.collaboration.components.fiori.sharing.dialog",
							settings: {
								object: {
									id: document.URL,
									share: sObjectTitle + " " + sObjectSubtitle
								}
							}
						});
						oShareDialog.open();
					}

					function getObjectHeader() {
						var oObjectPage = oController.byId("objectPage");
						return oObjectPage.getHeaderTitle();
					}

					function onShareObjectPageActionButtonPress(oEvent) {
						var oShareActionSheet = oTemplateUtils.oCommonUtils.getDialogFragment(
							"sap.suite.ui.generic.template.fragments.ShareSheet", {
								shareEmailPressed: function() {
									var oShareModel = oShareActionSheet.getModel("share");
									fnOnShareObjectPageEmailPress(oShareModel.getProperty("/objectTitle"), oShareModel
										.getProperty("/objectSubtitle"));
								},
								shareJamPressed: function() {
									var oShareModel = oShareActionSheet.getModel("share");
									fnOnShareObjectPageInJamPress(oShareModel.getProperty("/objectTitle"), oShareModel
										.getProperty("/objectSubtitle"));
								}
							}, "share", function(oFragment, oShareModel) {
								var oResource = sap.ui.getCore().getLibraryResourceBundle("sap.m");
								oShareModel.setProperty("/emailButtonText", oResource.getText("SEMANTIC_CONTROL_SEND_EMAIL"));
								oShareModel.setProperty("/jamButtonText", oResource.getText("SEMANTIC_CONTROL_SHARE_IN_JAM"));
								oShareModel
									.setProperty("/bookmarkButtonText", oResource.getText("SEMANTIC_CONTROL_SAVE_AS_TILE"));
								var fnGetUser = jQuery.sap.getObject("sap.ushell.Container.getUser");
								oShareModel.setProperty("/jamVisible", !!fnGetUser && fnGetUser().isJamActive());
							});
						var oShareModel = oShareActionSheet.getModel("share");
						var oObjectHeader = getObjectHeader();
						oShareModel.setProperty("/objectTitle", oObjectHeader.getProperty("objectTitle"));
						oShareModel.setProperty("/objectSubtitle", oObjectHeader.getProperty("objectSubtitle"));
						oShareModel.setProperty("/bookmarkCustomUrl", document.URL);
						oShareActionSheet.openBy(oEvent.getSource());
					}

					function getRelatedAppsSheet() {
						var oRelatedAppsSheet = oTemplateUtils.oCommonUtils.getDialogFragment(
							"sap.suite.ui.generic.template.ObjectPage.view.fragments.RelatedAppsSheet", {
								buttonPressed: function(oEvent) {
									var oButton = oEvent.getSource();
									var oButtonsContext = oButton.getBindingContext("buttons");
									var oLink = oButtonsContext.getProperty("link");
									var oParam = oButtonsContext.getProperty("param");
									var str = oLink.intent;
									var sSemanticObject = str.split('#')[1].split('-')[0];
									var sAction = str.split('-')[1].split('?')[0].split('~')[0];
									var oNavArguments = {
										target: {
											semanticObject: sSemanticObject,
											action: sAction
										},
										params: oParam
									};
									sap.ushell.Container.getService("CrossApplicationNavigation").toExternal(oNavArguments);
								}
							}, "buttons");
						return oRelatedAppsSheet;
					}
					
					function fnNavigateUp(){
						if (sLinkUp){
							oTemplateUtils.oServices.oNavigationController.navigateToContext(sLinkUp, "", true);
						} else {
							oTemplateUtils.oServices.oNavigationController.navigateToRoot(true);	
						}
					}

					function showDeleteMsgBox() {
						var oComponent = oController.getOwnerComponent();
						var sNavigationProperty = oComponent.getNavigationProperty();
						var oUtils = oTemplateUtils.oCommonUtils;
						var oPageHeader = oController.byId("objectPageHeader");
						if (oPageHeader.getProperty("objectTitle") !== "") {
							if (oPageHeader.getProperty("objectSubtitle") !== "") {
								var aParams = [" ", oPageHeader.getProperty("objectTitle").trim(), oPageHeader.getProperty("objectSubtitle")];
								var sMessageText = oUtils.getText("DELETE_WITH_OBJECTINFO", aParams);
							} else {
								var aParams = [oPageHeader.getProperty("objectTitle").trim()];
								var sMessageText = oUtils.getText("DELETE_WITH_OBJECTTITLE", aParams);
							}
						} else {
							var sMessageText = oUtils.getText("ST_GENERIC_DELETE_SELECTED");
						}
						MessageBox.show(sMessageText, {
							icon: MessageBox.Icon.WARNING,
							styleClass: oTemplateUtils.oCommonUtils.getContentDensityClass(),
							title: oUtils.getText("DELETE"),
							actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
							onClose: function(oAction) {
								if (oAction === MessageBox.Action.DELETE) {
									var oDeleteEntityPromise = oTemplateUtils.oServices.oCRUDManager.deleteEntity();
									oDeleteEntityPromise.then(function() {
										oTemplateUtils.oServices.oViewDependencyHelper.setParentToDirty(oComponent, sNavigationProperty);
										oTemplateUtils.oServices.oViewDependencyHelper.unbindChildren(oComponent, true);

										// document was deleted, go back to previous page
										fnNavigateUp();
									});
									var oEvent = {
										deleteEntityPromise: oDeleteEntityPromise
									};
									oTemplateUtils.oComponentUtils.fire(oController, "AfterDelete", oEvent);
								}
							}
						});
					}
					
					// This method is called when editing of an entity has started and the corresponding context is available
					function fnStartEditing(oResult){
						var oDraft, oContext;
						if (oResult) {
							oContext = oResult.context || oResult;
							if (oTemplateUtils.oServices.oDraftController.getDraftContext().hasDraft(oContext)) {
								oTemplateUtils.oServices.oViewDependencyHelper.setRootPageToDirty();
								oDraft = oResult.context && oResult.context.context || oResult.context || oResult;
							}
						}
						if (oDraft) {
							// navigate to draft
							if (fnFclNavigteToDraft) {
								fnFclNavigteToDraft(oDraft);
							} else {
								oTemplateUtils.oServices.oNavigationController.navigateToContext(oDraft, undefined, true, 2);
							}
						} else {
							var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel();
							oTemplatePrivateModel.setProperty("/objectPage/displayMode", 2);
						}
						//set Editable independent of the fact that the instance is a draft or not
						setEditable(true);
					}

					var fnExpiredLockDialog;  // declare function already here, to avoid usage before declaration
					// This method is called when the user decides to edit an entity.
					// Parameter bUnconditional contains the information, whether the user has already confirmed to take over unsaved changes of another user, or whether this is still open
					function fnEditEntity(bUnconditional) {
						oTemplateUtils.oServices.oCRUDManager.editEntity(bUnconditional).then(function(oEditInfo){
							if (oEditInfo.draftAdministrativeData){
								fnExpiredLockDialog(oEditInfo.draftAdministrativeData.CreatedByUserDescription || oEditInfo.draftAdministrativeData.CreatedByUser);
							} else {
								fnStartEditing(oEditInfo.context);
							}
						});
					}
					
					function fnOnSemanticObjectLinkNavigationTargetObtained(oEvent) {
						
						
						var proceedWithClickedField = function(oEvent, oReferentialConstraint){
							
							var sPropertyRefName = oReferentialConstraint.dependent.propertyRef[0].name;
							var sClickedFieldId = oEvent.getParameters().originalId;
							
							//this works for fields on the object header which have a view relative id, but not for smart 
							var oControl = oController.getView().byId(sClickedFieldId);
							if (oControl && oControl.mProperties.fieldName === sPropertyRefName){
								return true;
							}
							
							//table fields get an absolute id "__link0-__clone34" - then jQuery is used to retrieve this absolut id (jQuery doesn't work with "::" as in ::Field-sl)
							if (!oControl ){
								var oElement = jQuery( "#" + sClickedFieldId.replace( /(:|\.|\[|\]|,|=)/g, "\\$1" ) );
								if (oElement){
									oControl = oElement.control(0);
									if (oControl && oControl.mProperties.fieldName === sPropertyRefName){
										return true;
									}
								}
							}
							
							return false;
						};
						
						var getQuickView = function(oEvent) {
							/*  1.	Loop over all Navigation properties
								2.	Look into corresponding association
								3.	Look into referential constraint
								4.	If dependent role PropertyRef = property ==> success QuickView Facets from this entity type can be retrieved
							*/
							var oQuickViewAnnotation, oMetaModel, oEntitySet, oEntityType, oNavProp, oAssociationEnd, oTargetEntityType;
							oMetaModel = oEvent.getSource().getModel().getMetaModel();
							oEntitySet = oMetaModel.getODataEntitySet(oEvent.getSource().getEntitySet());
							oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
							
							if (!oEntityType || !oEntityType.navigationProperty){
								return;
							}
							
							for (var i = 0; i < oEntityType.navigationProperty.length; i++) {
								
								oNavProp = oEntityType.navigationProperty[i];
								if (oNavProp.name === "SiblingEntity" ||  oNavProp.name === "DraftAdministrativeData"){
									continue;
								}
								
								var sQualifiedName = oNavProp.relationship;
								var iSeparatorPos = sQualifiedName.lastIndexOf(".");
								var sNamespace = sQualifiedName.slice(0, iSeparatorPos);
								var sName = sQualifiedName.slice(iSeparatorPos + 1);
								var aSchemas = oMetaModel.getObject("/dataServices/schema");
								var oSchema;
								
								for (var j in aSchemas) {
									if (aSchemas[j].namespace === sNamespace) {
										oSchema = aSchemas[j];
										break;
									}
								}
								
								var aArray = oSchema.association;
								var oAssociation;
								
								for (var j in aArray) {
									if (aArray[j].name === sName) {
										oAssociation = aArray[j];
										break;
									}
								}
								
								var oReferentialConstraint = oAssociation.referentialConstraint;
								if (oReferentialConstraint && oReferentialConstraint.dependent && oReferentialConstraint.dependent.propertyRef) {
									var bProceed = proceedWithClickedField(oEvent, oReferentialConstraint);
									if (bProceed){
										oAssociationEnd = oMetaModel.getODataAssociationEnd(oEntityType, oNavProp.name); //to_Supplier
										oTargetEntityType = oMetaModel.getODataEntityType(oAssociationEnd.type);
										
										if (oTargetEntityType["com.sap.vocabularies.UI.v1.QuickViewFacets"]) {
											
											var oEntityContainer = oMetaModel.getODataEntityContainer();
											var sTargetEntitySet = "";
											var sTargetEntityType = "";
											for (var j = 0; j < oEntityContainer.entitySet.length; j++) {
												if (oEntityContainer.entitySet[j].entityType === oTargetEntityType.entityType) {
													sTargetEntitySet =  oEntityContainer.entitySet[j].name;
													sTargetEntityType = oEntityContainer.entitySet[j].entityType;
													break;
												}
											}
											
											var sODataQuickViewFacetPath = oMetaModel.getODataEntityType(sTargetEntityType, true) + "/com.sap.vocabularies.UI.v1.QuickViewFacets";
											//this is only used if the Groups should get a "title"
											//var sODataQuickViewHeaderInfoPath = oMetaModel.getODataEntityType(sTargetEntityType, true) + "/com.sap.vocabularies.UI.v1.HeaderInfo";
											
											oQuickViewAnnotation = {
												navigation: oNavProp.name,
												entitySet: sTargetEntitySet,
												//quickViewFacetODataHeaderInfoPath: sODataQuickViewHeaderInfoPath,
												quickViewFacetODataPath: sODataQuickViewFacetPath // e.g. /dataServices/schema/0/entityType/23/com.sap.vocabularies.UI.v1.QuickViewFacets/0/
											};
											
											return oQuickViewAnnotation;
										}
									} 
								}
							}
							return oQuickViewAnnotation;
						};
						
						var oQuickViewAnnotation = getQuickView(oEvent);

						var oParameters = oEvent.getParameters();
						if (oQuickViewAnnotation){
							var oComponent = oController.getOwnerComponent();
							var oModel = oComponent.getModel();
							var oMetaModel = oModel.getMetaModel();
							var oEntitySet = oMetaModel.getODataEntitySet(oComponent.getEntitySet());
							
							// QuickViewIndicator model
							var oQuickViewModel = new JSONModel({fieldsEnabled:  	false,
																 navigationPath: 	oQuickViewAnnotation.navigation});
							oQuickViewModel.setDefaultBindingMode("OneWay");
							
							var oSmartFormSimpleView = sap.ui.view({
								async: true,
								preprocessors: {
									xml: {
										bindingContexts: {
											meta: oMetaModel.createBindingContext(oMetaModel.getODataEntityType(oEntitySet.entityType, true)),
											entitySet: oMetaModel.createBindingContext(oMetaModel.getODataEntitySet(oQuickViewAnnotation.entitySet, true)), //is it correct to path this entityset???
											//header: oMetaModel.createBindingContext(oQuickViewAnnotation.quickViewFacetODataHeaderInfoPath, true),
											facetCollection: oMetaModel.createBindingContext(oQuickViewAnnotation.quickViewFacetODataPath, true)
										},
										models: {
											quickView: oQuickViewModel,
											meta: oMetaModel,
											entitySet: oMetaModel,
											//header: oMetaModel,
											facetCollection: oMetaModel
										},
										preprocessorsData : oTemplateUtils.oComponentUtils.getPreprocessorsData()     
									}
								},
								type: ViewType.XML,
								viewName: "sap.suite.ui.generic.template.ObjectPage.view.QuickViewSmartForm",
								height: "100%"
							});
							
							oParameters.show(undefined, undefined, undefined, oSmartFormSimpleView);
							//oParameters.show(" ", undefined, undefined, oSmartFormSimpleView); //with this the header should be surpessed - not working
						} else {
							oParameters.show();
						}
					}

					// This method is called when the user wants to edit an entity, for which a non-locking draft of another user exists.
					// The method asks the user, whether he wants to continue editing anyway. If this is the case editing is triggered.
					// sCreatedByUser is the name of the user possessing the non-locking draft
					fnExpiredLockDialog = function(sCreatedByUser) {
						var oUnsavedChangesDialog = oTemplateUtils.oCommonUtils.getDialogFragment(
							"sap.suite.ui.generic.template.ObjectPage.view.fragments.UnsavedChangesDialog", {
								onEdit: function() {
									oUnsavedChangesDialog.close();
									fnEditEntity(true);
								},
								onCancel: function() {
									oUnsavedChangesDialog.close();
								}
							}, "Dialog");
						var oDialogModel = oUnsavedChangesDialog.getModel("Dialog");
						var sDialogContentText = oTemplateUtils.oCommonUtils.getText("DRAFT_LOCK_EXPIRED", [sCreatedByUser]);
						oDialogModel.setProperty("/unsavedChangesQuestion", sDialogContentText);
						oUnsavedChangesDialog.open();
					};

					var sDefaultObjectTitleForCreated; // instantiated on demand

					function getDefaultObjectTitleForCreated() {
						sDefaultObjectTitleForCreated = sDefaultObjectTitleForCreated || oTemplateUtils.oCommonUtils.getText("NEW_OBJECT");
						return sDefaultObjectTitleForCreated;
					}

					// Helper functions for view-proxy for component
					var oHashChanger; // initialized on first use
					function fnGetHashChangerInstance() {
						return oHashChanger || HashChanger.getInstance();
					}

					function fnRefreshBlock(oBlock, mRefreshInfos, bForceRefresh){
						if (!oBlock.getContent){ // dummy-blocks need not to be refreshed
							return;
						}
						oBlock.getContent().forEach(function (oContent) {
							if (oContent instanceof SmartTable) {
								if (bForceRefresh || mRefreshInfos[oContent.getTableBindingPath()]) {
									if (oContent.isInitialised()){
										oContent.rebindTable(bForceRefresh);
									} else {
										oContent.attachInitialise(function(){
											oContent.rebindTable(bForceRefresh);
										});
									}

									if (!bForceRefresh) {
										oTemplateUtils.oServices.oApplicationController.executeSideEffects(oController.getOwnerComponent().getBindingContext(), [], [oContent.getTableBindingPath()]);
									}
								}
							}
						});
					}

					function setLockButtonVisible(bVisible) {
						var oLockButton = sap.ui.getCore().byId(getObjectHeader().getId() + "-lock");
						oLockButton.setVisible(bVisible);
					}

					function getSelectionVariant() {
						// oTemplateUtils, oController
						// if there is no selection we pass an empty one with the important escaping of ", passing "" or
						// null...was not possible
						// "{\"SelectionVariantID\":\"\"}";
						var sResult = "{\"SelectionVariantID\":\"\"}";

						/*
						 * rules don't follow 1:1 association, only header entity type fields don't send fields with empty
						 * values also send not visible fields remove Ux fields (e.g. UxFcBankStatementDate) send all kinds of
						 * types String, Boolean, ... but stringify all types
						 */

						var oComponent = oController.getOwnerComponent();
						var sEntitySet = oComponent.getEntitySet();
						var model = oComponent.getModel();
						var oMetaModel = model.getMetaModel();
						var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
						var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
						var aAllFieldsMetaModel = oEntityType.property;

						// collect the names of attributes to be deleted (objects with existing sap:field-control attribute)
						var aFieldsToBeIgnored = [];
						for (var x in aAllFieldsMetaModel) {
							var controlname = aAllFieldsMetaModel[x]["sap:field-control"];
							if (controlname && aFieldsToBeIgnored.indexOf(controlname) < 0) {
								aFieldsToBeIgnored.push(aAllFieldsMetaModel[x]["sap:field-control"]);
							}
						}

						var context = oController.getView().getBindingContext();
						var object = context.getObject();

						var oSelectionVariant = new SelectionVariant();
						for (var i in aAllFieldsMetaModel) {
							var type = aAllFieldsMetaModel[i].type;
							var name = aAllFieldsMetaModel[i].name;
							var value = object[aAllFieldsMetaModel[i].name];

							if (aFieldsToBeIgnored.indexOf(name) > -1) {
								continue;
							}

							if (name && (value || type === "Edm.Boolean")) { // also if boolean is false this must be sent
								if (type === "Edm.Time" && value.ms !== undefined) { // in case of Time an object is returned
									value = value.ms;
								}
								if (typeof value !== "string") {
									try {
										value = value.toString();
									} catch (e) {
										value = value + "";
									}
								}
								oSelectionVariant.addParameter(name, value);
							}
						}

						sResult = oSelectionVariant.toJSONString();
						return sResult;
					}

					function fnIsEntryDeletable(oContext, oSmartTable) {
						var bDeletable = true;
						var oModel = oSmartTable.getModel();
						var oDeleteRestrictions = oTemplateUtils.oCommonUtils.getDeleteRestrictions(oSmartTable);
						var sDeletablePath = oDeleteRestrictions && oDeleteRestrictions.Deletable && oDeleteRestrictions.Deletable.Path;
						if (sDeletablePath) {
							 bDeletable = oModel.getProperty(sDeletablePath, oContext);
						}
						return bDeletable;
					}
					
					function fnDeleteEntries(oEvent){
						var oBusyHelper = oTemplateUtils.oServices.oApplication.getBusyHelper();
						if (oBusyHelper.isBusy()){
							return; // this is again tested by the CRUDManager. But in order to suppress the check for selected lines in the busy case we also need to check this here.
						}
						var oEventSource = oEvent.getSource();
						var oSmartTable = oTemplateUtils.oCommonUtils.getOwnerControl(oEventSource);
						var aContexts = oTemplateUtils.oCommonUtils.getSelectedContexts(oSmartTable);
						if (aContexts.length === 0){
							MessageBox.error(oTemplateUtils.oCommonUtils.getText("ST_GENERIC_NO_ITEM_SELECTED"), {
								styleClass: oTemplateUtils.oCommonUtils.getContentDensityClass()
							});
							return;
						}
						var aPath = [];
						var aNonDeletableContext = [];
						for (var i = 0; i < aContexts.length; i++){
							// check if item is deletable
							if (fnIsEntryDeletable(aContexts[i], oSmartTable)) {
							aPath.push(aContexts[i].getPath());
							} else {
								aNonDeletableContext.push(aContexts[i]);
							}
						}
						if (aNonDeletableContext.length > 0) {
							MessageBox.error(oTemplateUtils.oCommonUtils.getText("ST_GENERIC_DELETE_UNDELETABLE_SUBITEMS", [aNonDeletableContext.length, aContexts.length]), {
								styleClass: oTemplateUtils.oCommonUtils.getContentDensityClass()
							});
						}
						
						var oDeletePromise = oTemplateUtils.oServices.oCRUDManager.deleteEntities(aPath);
						oBusyHelper.setBusy(oDeletePromise);

						oDeletePromise.then(function() {
							oTemplateUtils.oServices.oViewDependencyHelper.unbindChildren(oController.getOwnerComponent());
							// after rebindTable is complete we need to update the enablement of the toolbar buttons (selected contexts have changed) - we attach (once) a handler to the table's event "updateFinished"
							oSmartTable.getTable().attachEventOnce("updateFinished", function () {
								oTemplateUtils.oCommonUtils.setEnabledToolbarButtons(oSmartTable);
							});
							oSmartTable.rebindTable();
						});
					}

					function getImageDialog() {
						var oImageDialog = oController.byId("imageDialog") || oTemplateUtils.oCommonUtils.getDialogFragment(
							"sap.suite.ui.generic.template.ObjectPage.view.fragments.ImageDialog", {
								onImageDialogClose: function() {
									oImageDialog.close();
								}
							}, "headerImage");

						return oImageDialog;
					}
                    
                    function getPaginatorInfoPath(){
						var oComponent = oController.getOwnerComponent();
						var oTemplatePrivateModel = oComponent.getModel("_templPriv");
                        var iViewLevel = oTemplatePrivateModel.getProperty("/generic/viewLevel") - 1;
                        return "/generic/paginatorInfo/" + iViewLevel;
                    }
                    
                    function getPaginatorInformation() {
						var oComponent = oController.getOwnerComponent();
                        var oTemplatePrivateGlobalModel = oComponent.getModel("_templPrivGlobal");
                        var oPaginatorInfo = oTemplatePrivateGlobalModel.getProperty(getPaginatorInfoPath());
                        return oPaginatorInfo;
                    }

                    function computeAndSetVisibleParamsForNavigationBtns() {
                        var oComponent = oController.getOwnerComponent();
                        var oTemplatePrivateModel = oComponent.getModel("_templPriv");
                        var oTemplatePrivateGlobalModel = oComponent.getModel("_templPrivGlobal");
                        var oPaginatorInfo = getPaginatorInformation();
                        var bPaginatorAvailable = !!oPaginatorInfo && (!bIsContainedInFCL || oTemplatePrivateGlobalModel.getProperty("/generic/FCL/isLogicallyFullScreen"));
                        var bNavDownEnabled = bPaginatorAvailable && (oPaginatorInfo.selectedRelativeIndex !== (oPaginatorInfo.listBinding.getLength() - 1));
                        var bNavUpEnabled =  bPaginatorAvailable && oPaginatorInfo.selectedRelativeIndex > 0;
                        oTemplatePrivateModel.setProperty("/objectPage/navButtons/navUpEnabled", bNavUpEnabled);
                        oTemplatePrivateModel.setProperty("/objectPage/navButtons/navDownEnabled", bNavDownEnabled);
                        
                        // if both buttons are disabled - hide them all
                        oTemplatePrivateModel.setProperty("/objectPage/navButtons/navBtnsVisible", bNavDownEnabled || bNavUpEnabled);
                    }

					function fnOnBack() {
						oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
							// only for Non-Draft the editable must be set to false
							var bIsDraft = oTemplateUtils.oCommonUtils.isDraftEnabled();
							if (bIsObjectRoot && !bIsDraft){
								setEditable(false);
							}
							oTemplateUtils.oServices.oNavigationController.navigateBack();
						}, jQuery.noop, oState);
					}
					
					function getApplyChangesPromise(oControl){
						oController.oComponent = oController.getOwnerComponent() || oController.getView().getViewData().component;
	                    var oView = oController.getView();
	                    oView.setModel(oController.oComponent.getModel());
	                    oController.sEntitySet = oController.oComponent.getEntitySet();
						oController.oDraftController = oController.oComponent.getAppComponent().getTransactionController().getDraftController();
						oController.bDraftEnabled = oController.oDraftController.getDraftContext().isDraftEnabled(oController.sEntitySet);
			            if (oController.bDraftEnabled) {
							var oContext = oControl.getBindingContext();
							var oApplicationController = oController.oComponent.getAppComponent().getApplicationController();
							if (!oApplicationController.getTransactionController().getDraftController().getDraftContext().hasDraft(oContext)) {
								return Promise.resolve();
							}
							var oRouter = oController.getOwnerComponent().getRouter();
							var sHash = oRouter.oHashChanger.getHash();
							return oApplicationController.propertyChanged(sHash, oContext);
			            }
					}
					
					// Event handler for the Apply button. Only visible in draft scenarios and not on the object root.
					function fnApplyAndUp(oEvent) {
						var oControl = oEvent.getSource();
						oTemplateUtils.oServices.oApplication.performAfterSideEffectExecution(function(){
							var oBusyHelper = oTemplateUtils.oServices.oApplication.getBusyHelper();
							if (oBusyHelper.isBusy()){
								return; // Ignore the button if something is already running
							}
							var oUIModel = oController.getView().getModel("ui");
							oUIModel.setProperty("/enabled", false);
							var oApplyPromise = getApplyChangesPromise(oControl).then(function(oReponse){
								var oTemplatePrivateGlobalModel = oController.getOwnerComponent().getModel("_templPrivGlobal");
								if (!bIsContainedInFCL || oTemplatePrivateGlobalModel.getProperty("/generic/FCL/isLogicallyFullScreen")){
									fnNavigateUp();
									oTemplateUtils.oServices.oApplication.showMessageToast(oTemplateUtils.oCommonUtils.getText("ST_CHANGES_APPLIED"));
								}
							}, function(){
								oBusyHelper.getUnbusy().then(function(oReponse){
									oUIModel.setProperty("/enabled", true);
									oTemplateUtils.oCommonUtils.processDataLossTechnicalErrorConfirmation(function() {
										fnNavigateUp();
									}, jQuery.noop, oState );
								});
							});
							oBusyHelper.setBusy(oApplyPromise);
						});
					}					
					
					function handleNavigateToObject(oContext, oTable) {
                        // Get navigation property.. to be used in construction of new URL
						// check if it is to be navigation using a nav property
						var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel();
						var iViewLevel = oTemplatePrivateModel.getProperty("/generic/viewLevel");
						var sNavigationProperty = iViewLevel > 1 ? oTemplateUtils.oCommonUtils.getTableBinding(oTable).path : null;
						oTemplateUtils.oServices.oNavigationController.navigateToContext(oContext, sNavigationProperty, true);
                    }
                    
					function fnAddNavButtonPropertiesToObjectPageData(){
						var oResource = sap.ui.getCore().getLibraryResourceBundle("sap.m");
						var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel();
						oTemplatePrivateModel.setProperty("/objectPage/navButtons", {
							navDownTooltip: oResource.getText("FACETFILTER_NEXT"),
							navUpTooltip: oResource.getText("FACETFILTER_PREVIOUS"),
							navDownEnabled: false,
							navUpEnabled: false,
							navBtnsVisible: false
						});
					}
					
					// Begin: Filling the viewProxy with functions provided for the TemplateComponent to be called on the view
					
					oViewProxy.refreshFacets = function(mRefreshInfos, bForceRefresh) {
						oController.byId("objectPage").getSections().forEach(function (oSection) {
							oSection.getSubSections().forEach(function (oSubSection) {
								oSubSection.getBlocks().forEach(function (oBlock) {
									fnRefreshBlock(oBlock, mRefreshInfos, bForceRefresh);
								});

								oSubSection.getMoreBlocks().forEach(function (oBlock) {
									fnRefreshBlock(oBlock, mRefreshInfos, bForceRefresh);
								});
							});
						});
					};
					
					function fnAdaptLinksToUpperLevels(){
						var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel();
						var iUpLinksCount = oTemplatePrivateModel.getProperty("/generic/viewLevel") - 1;
						var aSections = iUpLinksCount ? oTemplateUtils.oServices.oApplication.getHierarchySectionsFromCurrentHash() : [];

						// there's at least one section left - create / bind breadcrumbs
						var oTitle = getObjectHeader();
						var aBreadCrumbs = oTitle && oTitle.getBreadCrumbsLinks();

						oHashChanger = fnGetHashChangerInstance();

						sLinkUp = "";
						var sDelimiter = "";
						for (var i = 0; i < iUpLinksCount; i++) {
							var sSection = aSections[i];
							sLinkUp = sLinkUp + sDelimiter + sSection;
							sDelimiter = "/";

							/*
							 * we don't use the navigation path but the canonical URL. The reason for this is that there's no
							 * join done in the backend, therefore the GET-request is much faster in deeper breadcrumbs. Also
							 * the UI5 Odata model keeps track of already requested ressources, so if user navigates from the
							 * top level there's no additional request, if he uses a bookmark the request is only done once. We
							 * assume that the key of the navigation path is the same as the canonical URL. This is an
							 * assumption that does not fit to all ODATA services (but 99% of them) - BUT: Smart Templates and
							 * the navigation controller already takes this assumption. Once this is changed also this coding
							 * needs to be changed. Ideally with a configuration as most of the ODATA services have a big
							 * benefit through reading with the canonical URL
							 */
							var sEntitySet = aEntitySets[i];
							var aSubSections = sSection.split("(");
							if (aSubSections && aSubSections[1]) {
								var oLink = aBreadCrumbs && aBreadCrumbs[i];
								if (oLink){
									var sHash = oHashChanger.hrefForAppSpecificHash ? oHashChanger.hrefForAppSpecificHash(sLinkUp) : "#/" + sLinkUp;
									sHash = oTemplateUtils.oServices.oApplication.adaptBreadCrumbUrl(sHash, i + 1);
									var sCanonicalUrl = "/" + sEntitySet + "(" + aSubSections[1];
									oLink.setHref(sHash);
									oLink.bindElement(sCanonicalUrl);
								}
							}
						}
					}
					
					oViewProxy.onComponentActivate = function(sBindingPath) {
						oState.messageButtonHelper.adaptToContext(sBindingPath);
                        // set visibility of up/down buttons based for back navigation scenario
                        computeAndSetVisibleParamsForNavigationBtns();
						oTemplateUtils.oComponentUtils.setBackNavigation(fnOnBack);
						fnAdaptLinksToUpperLevels();
					};
					
					//Function is called if there is a draft document and the user navigate via bookmark to the active document
					oViewProxy.draftResume = function(oSiblingContext, oActiveEntity, oDraftAdministrativeData) {
						var oSiblingEntity = oSiblingContext.getObject();
						if (!oSiblingEntity || !oSiblingEntity.hasOwnProperty("IsActiveEntity") || oSiblingEntity.IsActiveEntity !== false) {
							return;
						}

						var oModel = oController.getView().getModel();
						var oMetaModel = oModel.getMetaModel();
						var oModelEntitySet = oMetaModel.getODataEntitySet(oController.getOwnerComponent().getEntitySet());
						var oDataEntityType = oMetaModel.getODataEntityType(oModelEntitySet.entityType);

						var sType = "";
						var sObjectKey = "";
						var aSemKey = oDataEntityType["com.sap.vocabularies.Common.v1.SemanticKey"];
						for (var i in aSemKey) {
							var oPropertyRef = aSemKey[i];
							if (sObjectKey === "") {
								sObjectKey = oActiveEntity[oPropertyRef.PropertyPath];
							} else {
								sObjectKey = sObjectKey + "-" + oActiveEntity[oPropertyRef.PropertyPath];
							}
						}

						var sChangedAt = "-";
						if (oDraftAdministrativeData && oDraftAdministrativeData.LastChangeDateTime !== null) {
							var oDateFormatter = DateFormat.getDateTimeInstance({
								pattern: "MMMM d, yyyy HH:mm",
								style: "long"
							});
							sChangedAt = oDateFormatter.format(oDraftAdministrativeData.LastChangeDateTime);
						}

						var aParams = [sType, sObjectKey, sChangedAt];
						var sDraftFoundText = oTemplateUtils.oCommonUtils.getText("DRAFT_FOUND_RESUME", aParams);

						var oDialogModel;
						var oResumeDialog = oTemplateUtils.oCommonUtils.getDialogFragment(
							"sap.suite.ui.generic.template.ObjectPage.view.fragments.DraftResumeDialog", {
								onDraftResume: function() {
									oResumeDialog.close();
									// Do not use variable oSiblingContext directly, because this will always be the instance used
									// at the first use of this fragment!
									oTemplateUtils.oServices.oNavigationController.navigateToContext(
										oDialogModel.getProperty("/siblingContext"), null, true);
								},
								onDraftDiscard: function() {
									oResumeDialog.close();
									// enable the buttons
									oController.getView().getModel("ui").setProperty("/enabled", true);
									// delete the draft node
									oTemplateUtils.oServices.oCRUDManager.deleteEntity(true);
									setLockButtonVisible(false);
									// Do not use variable oActiveEntity directly, because this will always be the instance used at
									// the first use of this fragment!
									oDialogModel.getProperty("/activeEntity").HasDraftEntity = false;
									// refresh the nodes
									oTemplateUtils.oServices.oViewDependencyHelper.setAllPagesDirty();
								},
								onResumeDialogClosed: function() {
									// support garbage collection
									oDialogModel.setProperty("/siblingContext", null);
									oDialogModel.setProperty("/activeEntity", null);
								}
							}, "Dialog");
						oDialogModel = oResumeDialog.getModel("Dialog");
						oDialogModel.setProperty("/draftResumeText", sDraftFoundText);
						oDialogModel.setProperty("/siblingContext", oSiblingContext);
						oDialogModel.setProperty("/activeEntity", oActiveEntity);
						oResumeDialog.open();
					};
					
					// End: Filling the viewProxy with functions provided for the TemplateComponent to be called on the view.
					// Note that one last member is added to the viewProxy in onInit, since it is only available at this point in time.

					// Expose selected private functions to unit tests
					/* eslint-disable */
					var fnEditEntity = testableHelper.testable(fnEditEntity, "editEntity");
					var fnGetHashChangerInstance = testableHelper.testable(fnGetHashChangerInstance, "getHashChangerInstance");
					var fnIsEntryDeletable = testableHelper.testable(fnIsEntryDeletable, "isEntryDeletable");
					var fnAdaptLinksToUpperLevels = testableHelper.testable(fnAdaptLinksToUpperLevels, "adaptLinksToUpperLevels");
					/* eslint-enable */

					// Generation of Event Handlers
					var oControllerImplementation = {
						onInit: function() {
							fnAddNavButtonPropertiesToObjectPageData();
							oTemplateUtils.oCommonUtils.executeGlobalSideEffect();
							oState.messageButtonHelper = new MessageButtonHelper(oTemplateUtils.oCommonUtils, oController);
							oTemplateUtils.oServices.oTemplateCapabilities.oMessageButtonHelper = oState.messageButtonHelper;
							oViewProxy.isDraftEnabled = oTemplateUtils.oCommonUtils.isDraftEnabled;
							aEntitySets = oTemplateUtils.oServices.oApplication.getSections(oController.getOwnerComponent().getEntitySet(), true);
						},

						handlers: {
							addEntry: function(oEvent) {
								var oEventSource = oEvent.getSource();
								var oSmartTable = oTemplateUtils.oCommonUtils.getOwnerControl(oEventSource);
								var bSuppressNavigation = fnIsEventForTableWithInlineCreate(oSmartTable);

								if (!oEventSource.data("CrossNavigation") && bSuppressNavigation) {
									oTemplateUtils.oCommonEventHandlers.addEntry(oEventSource, true);
									return;
								}
								oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft(function(){
									oTemplateUtils.oCommonEventHandlers.addEntry(oEventSource, false);
								}, jQuery.noop, oState);
							},

							deleteEntries: fnDeleteEntries,

							onSelectionChange: function(oEvent) {
								oTemplateUtils.oCommonUtils.setEnabledToolbarButtons(oEvent.getSource());
							},

							onBack: fnOnBack,
							
							applyAndUp: fnApplyAndUp,

							//Cancel event is only triggered in non-draft scenario. For draft see onDiscardDraft
							onCancel: function() {
								var sMode = "Proceed";
								if (oTemplateUtils.oComponentUtils.isNonDraftCreate() || !bIsObjectRoot){
									sMode = "LeavePage";
								}

								oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
									if (bIsObjectRoot){
										setEditable(false);
									}
									if (oTemplateUtils.oComponentUtils.isNonDraftCreate() || !bIsObjectRoot) {
										oTemplateUtils.oServices.oNavigationController.navigateBack();
									}
								}, jQuery.noop, oState, sMode);
							},

							onContactDetails: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onContactDetails(oEvent);
							},
							onPressDraftInfo: function(oEvent) {
								var oBindingContext = oController.getView().getBindingContext();
								var oLockButton = sap.ui.getCore().byId(
									oEvent.getSource().getId() + (oEvent.getId() === "markChangesPress" ? "-changes" : "-lock"));

								oTemplateUtils.oCommonUtils.showDraftPopover(oBindingContext, oLockButton);
							},
							onShareObjectPageActionButtonPress: onShareObjectPageActionButtonPress,
							onRelatedApps: function(oEvent) {
								var oButton, oURLParsing, oParsedUrl, oViewBindingContext, oAppComponent, oXApplNavigation, oLinksDeferred;
								var oActionSheet, oButtonsModel, oUshellContainer, sCurrentSemObj, sCurrentAction;
								oButton = oEvent.getSource();
								oUshellContainer = sap.ushell && sap.ushell.Container;
								oURLParsing = oUshellContainer && oUshellContainer.getService("URLParsing");
								oParsedUrl = oURLParsing.parseShellHash(
									document.location.hash);
								sCurrentSemObj = oParsedUrl.semanticObject;
								sCurrentAction = oParsedUrl.action;
								oViewBindingContext = oController.getView && oController.getView().getBindingContext();

								var oMetaModel = oController.getOwnerComponent().getModel().getMetaModel();

								var oEntity = oViewBindingContext.getObject();
								var sEntityType = oEntity.__metadata.type;
								var oDataEntityType = oMetaModel.getODataEntityType(sEntityType);
								var aSemKey = oDataEntityType["com.sap.vocabularies.Common.v1.SemanticKey"];
								var oParam = {};
								// var oSemKeyParam = {};
								if (aSemKey && aSemKey.length > 0) {
									for (var j = 0; j < aSemKey.length; j++) {
										var sSemKey = aSemKey[j].PropertyPath;
										if (!oParam[sSemKey]) {
											oParam[sSemKey] = [];
											oParam[sSemKey].push(oEntity[sSemKey]);
										}
									}
								} else {
									// Fallback if no SemanticKey
									for (var k in oDataEntityType.key.propertyRef) {
										var sObjKey = oDataEntityType.key.propertyRef[k].name;
										if (!oParam[sObjKey]) {
											oParam[sObjKey] = [];
											oParam[sObjKey].push(oEntity[sObjKey]);
										}
									}
								}

								oAppComponent = oController.getOwnerComponent().getAppComponent();
								oXApplNavigation = oUshellContainer && oUshellContainer.getService("CrossApplicationNavigation");

								oLinksDeferred = oXApplNavigation.getLinks({
									semanticObject: sCurrentSemObj,
									params: oParam,
									ui5Component: oAppComponent
								});

								oActionSheet = getRelatedAppsSheet();
								oButtonsModel = oActionSheet.getModel("buttons");
								oButtonsModel.setProperty("/buttons", []);
								oActionSheet.openBy(oButton);
								oLinksDeferred
									.done(function(aLinks) {
										var aButtons = [];
										// filter current semanticObject-action
										for (var i = 0; i < aLinks.length; i++) {
											var oLink = aLinks[i];
											var sIntent = oLink.intent;
											var sAction = sIntent.split("-")[1].split("?")[0];
											if (sAction != sCurrentAction) {
												aButtons.push({
													enabled: true, // used in declarative binding
													text: oLink.text, // used in declarative binding
													link: oLink, // used by the event handler
													param: oParam
													// used by the event handler
												});
											}
										}
										if (aButtons.length === 0) {
											aButtons.push({
												enabled: false, // used in declarative binding
												text: oTemplateUtils.oCommonUtils.getText("NO_RELATED_APPS")
												// used in declarative binding
											});
										}
										oButtonsModel.setProperty("/buttons", aButtons);
									});
							},
							onSemanticObjectLinkPopoverLinkPressed: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onSemanticObjectLinkPopoverLinkPressed(oEvent, oState);
							},

							handleShowNextObject: function (oEvent) {
								var oBusyHelper = oTemplateUtils.oServices.oApplication.getBusyHelper();
								if (oBusyHelper.isBusy()){
									return;
								}
								// now navigate to next object page
								var oPaginatorInfo = getPaginatorInformation();
								var oListBinding = oPaginatorInfo.listBinding;
								var iEndIdx = oPaginatorInfo.endIndex;
								var iNextIdx = oPaginatorInfo.selectedRelativeIndex + 1;
								var aAllContexts = oPaginatorInfo.objectPageNavigationContexts;
								var iTableGrowingIncrement = oPaginatorInfo.growingThreshold;
								var oTemplatePrivateGlobalModel = oController.getOwnerComponent().getModel("_templPrivGlobal");
								var sPaginatorInfoPath = getPaginatorInfoPath();

								if (iNextIdx && aAllContexts) {
									var oNextContext = aAllContexts[iNextIdx];

									if (oNextContext) {
										oTemplatePrivateGlobalModel.setProperty(sPaginatorInfoPath + "/selectedRelativeIndex", iNextIdx);
										handleNavigateToObject(oNextContext, oPaginatorInfo.tableNavFrom);
									} else {
										var oFetchNewRecordsPromise = new Promise(function(fnResolve, fnReject){
											var newEndIdx = iEndIdx + 1 + iTableGrowingIncrement;
											var fetchAndUpdateRecords = function (mParameters) {
												// get new fetched contexts and do stuff
												var aNewAllContexts = mParameters.getSource().getContexts(0, newEndIdx);
												oTemplatePrivateGlobalModel.setProperty(sPaginatorInfoPath + "/objectPageNavigationContexts", aNewAllContexts);
												oTemplatePrivateGlobalModel.setProperty(sPaginatorInfoPath + "/endIndex", newEndIdx);
												oNextContext = aNewAllContexts[iNextIdx];
												oListBinding.detachDataReceived(fetchAndUpdateRecords);
												// also.. navigate
												oTemplatePrivateGlobalModel.setProperty(sPaginatorInfoPath + "/selectedRelativeIndex", iNextIdx);
												handleNavigateToObject(oNextContext, oPaginatorInfo.tableNavFrom);
												fnResolve();
											};
											oListBinding.attachDataReceived(fetchAndUpdateRecords);
											oListBinding.loadData(0, newEndIdx);
										});
										oBusyHelper.setBusy(oFetchNewRecordsPromise);
									} 
								}
							},

							handleShowPrevObject: function (oEvent) {
								if (oTemplateUtils.oServices.oApplication.getBusyHelper().isBusy()){
									return;
								}
								var oPaginatorInfo = getPaginatorInformation();
								var iNextIdx = oPaginatorInfo.selectedRelativeIndex - 1;
								var aAllContexts = oPaginatorInfo.objectPageNavigationContexts;
								var oComponent = oController.getOwnerComponent();
								var oTemplatePrivateGlobalModel = oComponent.getModel("_templPrivGlobal");

								if (aAllContexts) {
									var oNextContext = aAllContexts[iNextIdx];
									if (oNextContext &&
										oNextContext.getPath) {
										oTemplatePrivateGlobalModel.setProperty(getPaginatorInfoPath() + "/selectedRelativeIndex", iNextIdx);
										handleNavigateToObject(oNextContext, oPaginatorInfo.tableNavFrom);
									}
								}
							},
							onShowMessages: function() {
								oState.messageButtonHelper.toggleMessagePopover();
							},
							onEdit: function(oEvent) {
								var oEventSource = oEvent.getSource();
								if (oEventSource.data("CrossNavigation")) {
									// intent based navigation
									oTemplateUtils.oCommonEventHandlers.onEditNavigateIntent(oEventSource);
									return;
								}
								bIsObjectRoot = true; // temporarily logic until we know how to decide this in onInit
								fnEditEntity();
							},
							// The event is only called in a non-draft scenario. For draft see onActivate
							onSave: function() {
								if (oTemplateUtils.oServices.oApplication.getBusyHelper().isBusy()){
									return; // this is again tested by the CRUDManager. But in order to suppress the AfterSave-Event in the busy case we also need to check this here.
								}
								var oCurrentContext = oController.getView().getBindingContext();
								var oPendingChanges =  oController.getView().getModel().getPendingChanges();
								oPendingChanges = oPendingChanges && oPendingChanges[oCurrentContext.getPath().replace("/", "")] || {};
								var aPendingChanges = Object.keys(oPendingChanges) || [];
								var bCreateMode = oTemplateUtils.oComponentUtils.isNonDraftCreate();
								/*	The OData model returns also a __metadata object with the canonical URL and further
									information. As we don't want to check if sideEffects are annotated for this
									property we remove it from the pending changes
								*/
								var iMetaDataIndex = aPendingChanges.indexOf("__metadata");
								if (iMetaDataIndex > -1){
									aPendingChanges.splice(iMetaDataIndex,1);
								}

								var oSaveEntityPromise = oTemplateUtils.oServices.oCRUDManager.saveEntity();
								oSaveEntityPromise.then(function(oContext) {

									//	switch to display mode
									if (!oTemplateUtils.oCommonUtils.isDraftEnabled() && bIsObjectRoot) {
										setEditable(false);
									}else if ( oTemplateUtils.oCommonUtils.isDraftEnabled() ){
										setEditable(false);
									}

									if (bCreateMode) {
										// in case of create mode navigate to new item
										if (oContext && oContext.getPath() !== "/undefined") {
											oTemplateUtils.oServices.oNavigationController.navigateToContext(oContext, undefined, true);
										} else {
											// fallback no context returned / correct path determined by transaction controller
											setEditable(false);
											oTemplateUtils.oServices.oNavigationController.navigateBack();
										}
										oTemplateUtils.oServices.oApplication.showMessageToast(oTemplateUtils.oCommonUtils.getText("OBJECT_CREATED"));
									} else {
										oTemplateUtils.oServices.oApplication.showMessageToast(oTemplateUtils.oCommonUtils.getText("OBJECT_SAVED"));
										//for NON-Draft: navigate back after save if not root object
										if (!oTemplateUtils.oCommonUtils.isDraftEnabled() && !bIsObjectRoot) {
											oTemplateUtils.oServices.oNavigationController.navigateBack();
										}
									}
									if (aPendingChanges.length > 0){
										oTemplateUtils.oServices.oApplicationController.executeSideEffects(oCurrentContext, aPendingChanges);
									}
								});
								var oEvent = {
									saveEntityPromise: oSaveEntityPromise
								};
								oTemplateUtils.oComponentUtils.fire(oController, "AfterSave", oEvent);
							},
							onActivate: onActivate,
							onSmartFieldUrlPressed: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onSmartFieldUrlPressed(oEvent, oState);
							},
							onBreadCrumbUrlPressed: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onBreadCrumbUrlPressed(oEvent, oState);
							},
							onDiscardDraft: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onDiscardDraft(oEvent);
							},
							onDiscardSubItem: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onDiscardSubItem(oEvent);
							},
							onDelete: function(oEvent) {
								if (oTemplateUtils.oServices.oApplication.getBusyHelper().isBusy()){
									return;
								}
								showDeleteMsgBox();
							},
							onCallActionFromToolBar: function (oEvent) {
								oTemplateUtils.oCommonEventHandlers.onCallActionFromToolBar(oEvent, oState);
							},
							onCallAction: function(oEvent) {
								var oComponent = oController.getOwnerComponent();
								var sNavigationProperty = oComponent.getNavigationProperty();
								var oCustomData = oTemplateUtils.oCommonUtils.getCustomData(oEvent);
								var aContext = [];
								aContext.push(oController.getView().getBindingContext());
								if (aContext[0] && oCustomData.Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
									//var oEventSource = oEvent.getSource();
									oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
										var mParameters = {
											functionImportPath: oCustomData.Action,
											contexts: aContext,
											sourceControl: "",
											label: oCustomData.Label,
											operationGrouping: oCustomData.InvocationGrouping,
											navigationProperty: oController.getOwnerComponent().getNavigationProperty()
										};
										oTemplateUtils.oServices.oCRUDManager.callAction(mParameters).then(function(aResponses){
											var oResponse = aResponses && aResponses[0];
											if (oResponse && oResponse.response && oResponse.response.context && (!oResponse.actionContext || oResponse.actionContext && oResponse.response.context.getPath() !== oResponse.actionContext.getPath())){
												// set my parent page to dirty
												oTemplateUtils.oServices.oViewDependencyHelper.setParentToDirty(oComponent, sNavigationProperty);
											}
										});
									}, jQuery.noop, oState, "Proceed");
								}
							},
							onDataFieldForIntentBasedNavigation: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onDataFieldForIntentBasedNavigation(oEvent, oState);
							},
							onDataFieldWithIntentBasedNavigation: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onDataFieldWithIntentBasedNavigation(oEvent, oState);
							},
							onChartInit: function (oEvent) {
								var oChart = oEvent.getSource().getChart();
								var fnOnSelectionChange = oController._templateEventHandlers.onSelectionChange;
								oChart.attachSelectData(fnOnSelectionChange).attachDeselectData(fnOnSelectionChange);
							},
							onBeforeRebindDetailTable: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onBeforeRebindTable(oEvent);
								oController.onBeforeRebindTableExtension(oEvent);
								fnAdaptBindingParamsForInlineCreate(oEvent);
								if (oEvent.getSource().getTable() instanceof AnalyticalTable) {
									var oBindingParams = oEvent.getParameter("bindingParams");
									oBindingParams.parameters.entitySet = oEvent.getSource().getEntitySet();
								}
							},
							onShowDetails: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onShowDetails(oEvent.getSource(), oState);
							},
							onListNavigate: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onListNavigate(oEvent.getSource(), oState);
							},
							onBeforeSemanticObjectLinkPopoverOpens: function(oEvent) {
								var oEventParameters = oEvent.getParameters();
								oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft(function(){
									//Success function
									var oNavigationHandler = oTemplateUtils.oCommonUtils.getNavigationHandler();
									if (oNavigationHandler) {
										var sSelectionVariant = getSelectionVariant();
										oNavigationHandler.processBeforeSmartLinkPopoverOpens(oEventParameters, sSelectionVariant);
									} else {
										oEventParameters.open();
									}
								}, jQuery.noop, oState, jQuery.noop);
							},
							onSemanticObjectLinkNavigationTargetObtained : function(oEvent) {
								fnOnSemanticObjectLinkNavigationTargetObtained(oEvent);
							}, 
							onHeaderImagePress: function(oEvent) {
								var oImageDialog = getImageDialog();
								var sId = oEvent.getSource().getId();
								oImageDialog.addAriaLabelledBy(sId);
								var oImageDialogModel = oImageDialog.getModel("headerImage");
								oImageDialogModel.setProperty("/src", oEvent.getSource().getSrc());
								if (sap.ui.Device.system.phone) {
									oImageDialog.setProperty("stretch", true);
								}
								oImageDialog.open();
							},
							onInlineDataFieldForAction: function(oEvent) {
								var oEventSource = oEvent.getSource();
								var oCustomData = oTemplateUtils.oCommonUtils.getElementCustomData(oEventSource);
								var oTable = oTemplateUtils.oCommonUtils.getOwnerControl(oEventSource);
								var sTableBindingPath = oTable.getParent().getTableBindingPath();
								var aContexts = [oEventSource.getBindingContext()];
								oTemplateUtils.oCommonUtils.triggerAction(aContexts, sTableBindingPath, oCustomData, oEventSource, oState);
							},
							onInlineDataFieldForIntentBasedNavigation: function(oEvent) {
								oTemplateUtils.oCommonEventHandlers.onInlineDataFieldForIntentBasedNavigation(oEvent.getSource(), oState);
							},
							onDeterminingDataFieldForAction: function(oEvent) {
								var aContexts = [this.getView().getBindingContext()];
								var oButton = oEvent.getSource();
								var oCustomData = oTemplateUtils.oCommonUtils.getElementCustomData(oButton);
								var sBindingPath = this.getView().getBindingPath();
								oTemplateUtils.oCommonUtils.triggerAction(aContexts, sBindingPath, oCustomData);
							},
							onBeforeRebindChart: function(oEvent) {
								var oSmartChart = oEvent.getSource();
								oSmartChart.oModels = oSmartChart.getChart().oPropagatedProperties.oModels;
							},
							onTableInit: function(oEvent) {
								var oSmartTable = oEvent.getSource();
								var oTemplatePrivateModel = oController.getOwnerComponent().getModel("_templPriv");
								oTemplateUtils.oCommonUtils.checkToolbarIntentsSupported(oSmartTable, oTemplatePrivateModel);
							}
						},
						formatters: {
							formatDefaultObjectTitle: function(bCreateMode, sHeaderInfoTitle) {
								// return DefaultTitle in createMode
								if (sHeaderInfoTitle || !bCreateMode) {
									return;
								}
								var oContext = oController.getView().getBindingContext();
								var oObject = oContext && oContext.getObject();
								if (bCreateMode && oObject && (oObject.IsActiveEntity === undefined || oObject.IsActiveEntity === false || oObject.HasActiveEntity ===
									false)) {
									return getDefaultObjectTitleForCreated();
								}
							}
						},
						extensionAPI: new ExtensionAPI(oTemplateUtils, oController, oState)
					};
					var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel();
					var iViewLevel = oTemplatePrivateModel.getProperty("/generic/viewLevel");
					var oFclProxy = oTemplateUtils.oServices.oApplication.getFclProxy(iViewLevel);
					if (oFclProxy.oActionButtonHandlers){
						oControllerImplementation.handlers.fclActionButtonHandlers = oFclProxy.oActionButtonHandlers;
						bIsContainedInFCL = true;
					}
					fnFclNavigteToDraft = oFclProxy.navigateToDraft;
					
					return oControllerImplementation;
				}
			};
		});