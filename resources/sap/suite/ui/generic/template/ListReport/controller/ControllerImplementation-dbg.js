/* global hasher */
sap.ui.define(["jquery.sap.global", "sap/ui/base/Object", "sap/ui/model/json/JSONModel", "sap/m/ObjectIdentifier", "sap/m/Table",
		"sap/m/Text", "sap/ui/comp/smartfield/SmartField", "sap/ui/generic/app/navigation/service/SelectionVariant",
		"sap/suite/ui/generic/template/ListReport/extensionAPI/ExtensionAPI", "sap/m/MessageBox", "sap/suite/ui/generic/template/js/AnnotationHelper",
		"sap/suite/ui/generic/template/lib/MessageUtils", "sap/suite/ui/generic/template/ListReport/controller/IappStateHandler", "sap/ui/table/Table", "sap/ui/table/AnalyticalTable", "sap/ui/model/Filter"],
	function(jQuery, BaseObject, JSONModel, ObjectIdentifier, Table, Text, SmartField, SelectionVariant, ExtensionAPI, MessageBox, AnnotationHelper, MessageUtils, IappStateHandler, UiTable, AnalyticalTable, Filter) {
		"use strict";

		return {
			getMethods: function(oViewProxy, oTemplateUtils, oController) {
				var oState = {}; // contains attributes oSmartFilterbar, oSmartTable and (from oIappStateHandler) function getCurrentAppState. Initialized in onInit.
				var oIappStateHandler;
				var bIsStartingUp = true;

				// -- Begin of methods that are used in onInit only
				function fnSetIsLeaf() {
					var oComponent = oController.getOwnerComponent();
					var oTemplatePrivateModel = oComponent.getModel("_templPriv");
					oTemplatePrivateModel.setProperty("/listReport/isLeaf", oComponent.getIsLeaf());
				}

				function fnSetShareModel() {
					var fnGetUser = jQuery.sap.getObject("sap.ushell.Container.getUser");
					var oManifest = oController.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui");
					var sBookmarkIcon = (oManifest && oManifest.icons && oManifest.icons.icon) || "";
					// share Model: holds all the sharing relevant texts and info used in the XML view
					var oShareInfo = {
						// BOOKMARK
						bookmarkIcon: sBookmarkIcon,
						bookmarkCustomUrl: function() {
							var sHash = hasher.getHash();
							return sHash ? ("#" + sHash) : window.location.href;
						},
						bookmarkServiceUrl: function() {
							var oTable = oState.oSmartTable.getTable();
							var oBinding = oTable.getBinding("rows") || oTable.getBinding("items");
							return oBinding ? oBinding.getDownloadUrl() + "&$top=0&$inlinecount=allpages" : "";
						},
						// JAM
						isShareInJamActive: !!fnGetUser && fnGetUser().isJamActive()
					};
					var oTemplatePrivateModel = oController.getOwnerComponent().getModel("_templPriv");
					oTemplatePrivateModel.setProperty("/listReport/share", oShareInfo);
				}
				// -- End of used in onInit only

				function onSmartFilterBarInitialise(oEvent){
					oController.onInitSmartFilterBarExtension(oEvent);
					oIappStateHandler.onSmartFilterBarInitialise();
				}

				function onSmartFilterBarInitialized(){
					var oAppStatePromise = oIappStateHandler.parseUrlAndApplyAppState();
					oAppStatePromise.then(function(){
						bIsStartingUp = false;	
					}, function(oError){ // improve?
						if (oError instanceof Error) {
							oError.showMessageBox(); // improve?
							bIsStartingUp = false;
						}						
					});
				}
				
				function onFilterChange(){
					if (!bIsStartingUp){
						oIappStateHandler.changeIappState(true, false);
					}
				}
				
				// TABLE TAB POC ONLY
				function fnPrepareForTableTabs() {
					// get all table instances
					var oManifest = oController.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui.generic.app");
					if (oManifest && oManifest.pages[0] && oManifest.pages[0].component && oManifest.pages[0].component.settings && oManifest.pages[0].component.settings.tableTabs) {
						var oTmpTable;
						oState.aSmartTables = [];
						for (var i in oManifest.pages[0].component.settings.tableTabs) {
							var sKey = oManifest.pages[0].component.settings.tableTabs[i].key;
							oTmpTable = oController.byId("listReport-" + sKey);
							oState.aSmartTables.push(oTmpTable);
							
						}
						oState.oSmartTable = oState.aSmartTables[0];
						for (i = 1; i < oState.aSmartTables.length; i++) {
							oState.aSmartTables[i].setVisible(false);
						}
					}
					
					// Attach to “Search” event on SmartFilterBar (in init of the view controller)
					oState.oSmartFilterbar.attachSearch(function(oEvent){
						oState.oSmartTable._reBindTable(oEvent);
					});
				}

				// Generation of Event Handlers
				return {
					onInit: function() {
						oState.oSmartFilterbar = oController.byId("listReportFilter");
						oState.oSmartTable = oController.byId("listReport");

						// TABLE TAB POC ONLY
						fnPrepareForTableTabs();
						// (END) TABLE TAB POC ONLY
						
						oIappStateHandler = new IappStateHandler(oState, oController, oTemplateUtils.oCommonUtils.getNavigationHandler());
						oTemplateUtils.oServices.oApplication.registerStateChanger({
							isStateChange: oIappStateHandler.isStateChange	
						});
						// Give component access to some methods
						oViewProxy.getUrlParameterInfo = oIappStateHandler.getUrlParameterInfo;
						oViewProxy.onComponentActivate = function(){
							if (!bIsStartingUp){
								oIappStateHandler.parseUrlAndApplyAppState();
							}
						};
						oViewProxy.refreshBinding = function(){
							// refresh list, but only if the list is currently showing data
							if (oIappStateHandler.areDataShownInTable()){
								oState.oSmartTable.rebindTable();
							}
						};

						fnSetIsLeaf();
						fnSetShareModel();
						var oComponent = oController.getOwnerComponent();
						oController.byId("template::FilterText").attachBrowserEvent("click", function () {
							oController.byId("page").setHeaderExpanded(true);
						});
						var oTemplatePrivateModel = oComponent.getModel("_templPriv");
						oTemplatePrivateModel.setProperty("/listReport/isHeaderExpanded", true);
						
						// set property for enable/disable of the Delete button
						oTemplatePrivateModel.setProperty("/listReport/deleteEnabled", false);
						
						//the following layout definition should only be executed for the List Report (Object Page will use here the new complex table concept)
						//condensed shouldn't be the default, only if the manifest specifies it
						//compare the following logic with Application.js->getContentDensityClass:
						//compact and condensed needs to be set together
						var oTable = oState.oSmartTable.getTable();
						var sCozyClass = "sapUiSizeCozy", sCompactClass = "sapUiSizeCompact", sCondensedClass = "sapUiSizeCondensed";
						if ( oTable instanceof UiTable || oTable instanceof AnalyticalTable) {
							var oView = oController.getView();
							var oBody = jQuery(document.body);
							if (oBody.hasClass(sCozyClass) || oView.hasStyleClass(sCozyClass)){
								oState.oSmartTable.addStyleClass(sCozyClass);
							} else if (oBody.hasClass(sCompactClass) || oView.hasStyleClass(sCompactClass)){
								var bCondensedTableLayout = oComponent.getComponentContainer().getSettings().condensedTableLayout;
								if (bCondensedTableLayout === true){
									//https://openui5.hana.ondemand.com/#docs/guide/13e6f3bfc54c4bd7952403e20ff447e7.html
									//setting sapUiSizeCompact AND sapUiSizeCondensed might mix up the required css
									//oState.oSmartTable.addStyleClass(sCompactClass);
									oState.oSmartTable.addStyleClass(sCondensedClass);
								} else {
									oState.oSmartTable.addStyleClass(sCompactClass);
								}
							}
						}
					},

					handlers: {
						onBack: function() {
							oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
								oTemplateUtils.oServices.oNavigationController.navigateBack();
							}, jQuery.noop, oState);
						},
						addEntry: function(oEvent) {
							var oEventSource = oEvent.getSource();
							oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft(function(){
								oTemplateUtils.oCommonEventHandlers.addEntry(oEventSource, false, oState.oSmartFilterbar);
							}, jQuery.noop, oState);
						},
						deleteEntries: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.deleteEntries(oEvent);
						},
						onSelectionChange: function(oEvent) {
							var oTable = oEvent.getSource(),
								oModel = oTable.getModel(),
								oPrivModel = oTable.getModel("_templPriv");

							var oMetaModel = oModel.getMetaModel(),
								oEntitySet = oMetaModel.getODataEntitySet(this.getOwnerComponent().getEntitySet()),
								oDeleteRestrictions = oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"];

							var bDeleteEnabled = false;

							if (sap.suite.ui.generic.template.js.AnnotationHelper.areDeleteRestrictionsValid(oMetaModel, oEntitySet.entityType, oDeleteRestrictions)) {

								var sDeletablePath = (oDeleteRestrictions && oDeleteRestrictions.Deletable && oDeleteRestrictions.Deletable.Path) ? oDeleteRestrictions.Deletable.Path : "";
								var bAllLocked = true;
								var bAllNotDeletable = (sDeletablePath && sDeletablePath !== ""); // if Deletable-Path is undefined, then the items are deletable.

								var aContexts = oTemplateUtils.oCommonUtils.getSelectedContexts(oTable);
								if (aContexts.length > 0) {
									for (var i = 0; i < aContexts.length; i++) {
										var oObject = oModel.getObject(aContexts[i].getPath());

										// check if item is locked
										if (!(oObject.IsActiveEntity && oObject.HasDraftEntity && oObject.DraftAdministrativeData && oObject.DraftAdministrativeData.InProcessByUser)) {
											bAllLocked = false;
										}
										// check if item is deletable
										if (bAllNotDeletable) {
											if (oModel.getProperty(sDeletablePath, aContexts[i])) {
												bAllNotDeletable = false;
											}
										}
										if (!bAllLocked && !bAllNotDeletable) {
											bDeleteEnabled = true;
											break;
										}
									}
								}
							}
							oPrivModel.setProperty("/listReport/deleteEnabled", bDeleteEnabled);
							
							oTemplateUtils.oCommonUtils.setEnabledToolbarButtons(oTable);
							oTemplateUtils.oCommonUtils.setEnabledFooterButtons(oTable, this);
						},
						onChange: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.onChange(oEvent);
						},
						onSmartFieldUrlPressed: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.onSmartFieldUrlPressed(oEvent, oState);
						},
						onBreadCrumbUrlPressed: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.onBreadCrumbUrlPressed(oEvent, oState);
						},
						onContactDetails: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.onContactDetails(oEvent);
						},
						onSmartFilterBarInitialise: onSmartFilterBarInitialise,
						onSmartFilterBarInitialized: onSmartFilterBarInitialized,

						onBeforeSFBVariantSave: function() {
							oIappStateHandler.onBeforeSFBVariantSave();
						},
						
						onAfterSFBVariantSave: function(){
							oIappStateHandler.onAfterSFBVariantSave();	
						},
						
						onAfterSFBVariantLoad: function(oEvent) {
							oIappStateHandler.onAfterSFBVariantLoad(oEvent);
						},
						onBeforeRebindTable: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.onBeforeRebindTable(oEvent);
							oController.onBeforeRebindTableExtension(oEvent);
							// TABLE TAB POC ONLY
							oTemplateUtils.oCommonEventHandlers.onBeforeRebindTableFinally(oEvent);
							// (END) TABLE TAB POC ONLY
						},
						onShowDetails: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.onShowDetails(oEvent.getSource(), oState);
						},
						onListNavigate: function(oEvent) {
							if (!oController.onListNavigationExtension(oEvent)) {
								oTemplateUtils.oCommonEventHandlers.onListNavigate(oEvent.getSource(), oState);
							}
						},
						onCallActionFromToolBar: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.onCallActionFromToolBar(oEvent, oState);
						},
						onDataFieldForIntentBasedNavigation: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.onDataFieldForIntentBasedNavigation(oEvent, oState);
						},
						onDataFieldWithIntentBasedNavigation: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.onDataFieldWithIntentBasedNavigation(oEvent, oState);
						},
						onBeforeSemanticObjectLinkPopoverOpens: function(oEvent) {
							
							var oEventParameters = oEvent.getParameters();
							
							oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft(function(){
							  //Success function
								var oNavigationHandler = oTemplateUtils.oCommonUtils.getNavigationHandler();
								if (oNavigationHandler) {
									var sSelectionVariant = oState.oSmartFilterbar.getDataSuiteFormat();
									oNavigationHandler.processBeforeSmartLinkPopoverOpens(oEventParameters, sSelectionVariant);
								} else {
									oEventParameters.open();
								}
							}, jQuery.noop, oState, jQuery.noop);
						},
						onDraftLinkPressed: function(oEvent) {
							var oButton = oEvent.getSource();
							var oBindingContext = oButton.getBindingContext();
							oTemplateUtils.oCommonUtils.showDraftPopover(oBindingContext, oButton);
						},
						onAssignedFiltersChanged: function(oEvent) {
							if (oEvent.getSource()) {
								oController.byId("template::FilterText").setText(oEvent.getSource().retrieveFiltersWithValuesAsText());
							}
						},
						onFilterChange: onFilterChange,
						onToggleFiltersPressed: function() {
							var oComponent = oController.getOwnerComponent();
							var oTemplatePrivateModel = oComponent.getModel("_templPriv");
							oTemplatePrivateModel.setProperty("/listReport/isHeaderExpanded", !oTemplatePrivateModel.getProperty("/listReport/isHeaderExpanded"));
						},
						// ---------------------------------------------
						// store navigation context
						// note: function itself is handled by the corresponding control
						// ---------------------------------------------
						onSearchButtonPressed: function() {
							var oModel = oController.getOwnerComponent().getModel();
							var fnRequestFailed = function(oEvent) {
								MessageUtils.handleError("getCollection", oController, oTemplateUtils.oServices, oEvent.getParameters());
								oState.oSmartTable.getTable().setBusy(false);
								MessageUtils.handleTransientMessages(oTemplateUtils.oServices.oApplication.getDialogFragmentForView.bind(null, oController.getView()));
							};
							oIappStateHandler.changeIappState(false, true);
							oModel.attachEvent('requestFailed', fnRequestFailed);
							oModel.attachEventOnce('requestCompleted', function() {
								oModel.detachEvent('requestFailed', fnRequestFailed);
							});
						},
						onSemanticObjectLinkPopoverLinkPressed: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.onSemanticObjectLinkPopoverLinkPressed(oEvent, oState);
						},
						onAfterTableVariantSave: function() {
							oIappStateHandler.onAfterTableVariantSave();
						},
						onAfterApplyTableVariant: function() {
							oIappStateHandler.onAfterApplyTableVariant();
						},
						
						// ---------------------------------------------
						// END store navigation context
						// ---------------------------------------------

						onShareListReportActionButtonPress: function (oEvent) {
							var oShareActionSheet = oTemplateUtils.oCommonUtils.getDialogFragment(
								"sap.suite.ui.generic.template.ListReport.view.fragments.ShareSheet", {
									shareEmailPressed: function() {
										sap.m.URLHelper.triggerEmail(null, oTemplateUtils.oCommonUtils.getText("EMAIL_HEADER", [oTemplateUtils.oCommonUtils.getText(
											"PAGEHEADER")]), document.URL);
									},
									shareJamPressed: function() {
										var oShareDialog = sap.ui.getCore().createComponent({
											name: "sap.collaboration.components.fiori.sharing.dialog",
											settings: {
												object: {
													id: document.URL,
													share: oTemplateUtils.oCommonUtils.getText("PAGEHEADER")
												}
											}
										});
										oShareDialog.open();
									}

								}, "share", function(oFragment, oShareModel) {
									var oResource = sap.ui.getCore().getLibraryResourceBundle("sap.m");
									oShareModel.setProperty("/emailButtonText", oResource.getText("SEMANTIC_CONTROL_SEND_EMAIL"));
									oShareModel.setProperty("/jamButtonText", oResource.getText("SEMANTIC_CONTROL_SHARE_IN_JAM"));
									oShareModel.setProperty("/bookmarkButtonText", oResource.getText("SEMANTIC_CONTROL_SAVE_AS_TILE"));
									var fnGetUser = jQuery.sap.getObject("sap.ushell.Container.getUser");
									oShareModel.setProperty("/jamVisible", !!fnGetUser && fnGetUser().isJamActive());
								});
							oShareActionSheet.openBy(oEvent.getSource());

							// workaround for focus loss issue for AddBookmarkButton ("save as tile" button)
							var oShareButton = this.getView().byId("template::Share");
							var oBookmarkButton = this.getView().byId("bookmarkButton");
							oBookmarkButton.setBeforePressHandler(function() {
								// set the focus to share button
								oShareButton.focus();
							});
						},
						onInlineDataFieldForAction: function(oEvent) {
							var oEventSource = oEvent.getSource();
							var oCustomData = oTemplateUtils.oCommonUtils.getElementCustomData(oEventSource);
							var oTable = oTemplateUtils.oCommonUtils.getOwnerControl(oEventSource);
							var sTableBindingPath = oTable.getParent().getTableBindingPath();
							var aContexts = [oEventSource.getBindingContext()];
							oTemplateUtils.oCommonUtils.triggerAction(aContexts, sTableBindingPath, oCustomData, oTable, oState);
						},
						onInlineDataFieldForIntentBasedNavigation: function(oEvent) {
							oTemplateUtils.oCommonEventHandlers.onInlineDataFieldForIntentBasedNavigation(oEvent.getSource(), oState);
						},
						onDeterminingDataFieldForAction: function(oEvent) {
							var oTable = oState.oSmartTable.getTable();
							var aContexts = oTemplateUtils.oCommonUtils.getSelectedContexts(oTable);
							if (aContexts.length === 0) {
								MessageBox.error(oTemplateUtils.oCommonUtils.getText("ST_GENERIC_NO_ITEM_SELECTED"), {
									styleClass: oTemplateUtils.oCommonUtils.getContentDensityClass()
								});
							} else {
								var oButton = oEvent.getSource();
								var oCustomData = oTemplateUtils.oCommonUtils.getElementCustomData(oButton);
								var sTableBindingPath = oState.oSmartTable.getTableBindingPath();
								oTemplateUtils.oCommonUtils.triggerAction(aContexts, sTableBindingPath, oCustomData, oTable);
							}
						},
						onDeterminingDataFieldForIntentBasedNavigation: function(oEvent) {
							var oButton = oEvent.getSource();
							var oCustomData = oTemplateUtils.oCommonUtils.getElementCustomData(oButton);
							var oTable = oState.oSmartTable.getTable();
							var aContexts = oTemplateUtils.oCommonUtils.getSelectedContexts(oTable);
							var bRequiresContext = !(oCustomData.RequiresContext && oCustomData.RequiresContext === "false");
							if (bRequiresContext && aContexts.length === 0) {
								MessageBox.error(oTemplateUtils.oCommonUtils.getText("ST_GENERIC_NO_ITEM_SELECTED"), {
									styleClass: oTemplateUtils.oCommonUtils.getContentDensityClass()
								});
							} else if (bRequiresContext && aContexts.length > 1) {
								MessageBox.error(oTemplateUtils.oCommonUtils.getText("ST_GENERIC_MULTIPLE_ITEMS_SELECTED"), {
									styleClass: oTemplateUtils.oCommonUtils.getContentDensityClass()
								});
							} else {
								var oContext = bRequiresContext ? aContexts[0] : null;
								oTemplateUtils.oCommonEventHandlers.onDataFieldForIntentBasedNavigationSelectedContext(oContext, oCustomData, oState);
							}
						},
						// TABLE TAB POC ONLY
						onIconTabBarSelect: function(oEvent) {
							var sKey = oEvent.getSource().getSelectedKey();
							var oSmartTableOld, oSmartTableNew;
							oSmartTableOld = oState.oSmartTable;
							oSmartTableNew = oController.byId("listReport-" + sKey);
							if (oSmartTableNew) {
								oState.oSmartTable = oSmartTableNew;
								oSmartTableOld.setVisible(false);
								oState.oSmartTable.setVisible(true);
								oState.oSmartTable.rebindTable();
							}
						},

						onTableInit: function(oEvent) {
							var oSmartTable = oEvent.getSource();
							var oTemplatePrivateModel = oController.getOwnerComponent().getModel("_templPriv");
							oTemplateUtils.oCommonUtils.checkToolbarIntentsSupported(oSmartTable, oTemplatePrivateModel);
						}
					},
					formatters: {
						formatDraftType: function(oDraftAdministrativeData, bIsActiveEntity, bHasDraftEntity) {
							if (oDraftAdministrativeData && oDraftAdministrativeData.DraftUUID) {
								if (!bIsActiveEntity) {
									return sap.m.ObjectMarkerType.Draft;
								} else if (bHasDraftEntity) {
									return oDraftAdministrativeData.InProcessByUser ? sap.m.ObjectMarkerType.Locked : sap.m.ObjectMarkerType.Unsaved;
								}
							}
							return sap.m.ObjectMarkerType.Flagged;
						},

						formatDraftVisibility: function(oDraftAdministrativeData, bIsActiveEntity) {
							if (oDraftAdministrativeData && oDraftAdministrativeData.DraftUUID) {
								if (!bIsActiveEntity) {
									return sap.m.ObjectMarkerVisibility.TextOnly; //for Draft mode only the text will be shown 
								}
							}
							return sap.m.ObjectMarkerVisibility.IconAndText; //Default text and icon
						},

						formatDraftLineItemVisible: function(oDraftAdministrativeData) {
							if (oDraftAdministrativeData && oDraftAdministrativeData.DraftUUID) {
								return true;
							}
							return false;
						},
						
						// Returns full user name or ID of owner of a draft with status "unsaved changes" or "locked" in the format "by full name" or "by UserId"
						// If the user names and IDs are not maintained we display for example "locked by another user"
						formatDraftOwner: function(oDraftAdministrativeData, bHasDraftEntity) {
							var sDraftOwnerDescription = "";
							if (oDraftAdministrativeData && oDraftAdministrativeData.DraftUUID && bHasDraftEntity) {
								var sUserDescription = oDraftAdministrativeData.InProcessByUserDescription || oDraftAdministrativeData.InProcessByUser || oDraftAdministrativeData.LastChangedByUserDescription || oDraftAdministrativeData.LastChangedByUser;
								if (sUserDescription){
									sDraftOwnerDescription = oTemplateUtils.oCommonUtils.getText("ST_DRAFT_OWNER", [sUserDescription]);
								} else {
									sDraftOwnerDescription = oTemplateUtils.oCommonUtils.getText("ST_DRAFT_ANOTHER_USER");
								}
							}
							return sDraftOwnerDescription;
						}
					},

					extensionAPI: new ExtensionAPI(oTemplateUtils, oController, oState)
				};
			}
		};

	});