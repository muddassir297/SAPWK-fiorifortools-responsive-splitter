sap.ui.define(["jquery.sap.global", "sap/ui/base/Object", "sap/ui/core/format/DateFormat", "sap/m/ComboBox", "sap/m/MessageBox", "sap/m/MessageToast", "sap/m/Table",
	"sap/ui/model/Filter", "sap/ui/model/Sorter", "sap/ui/comp/smartfilterbar/SmartFilterBar","sap/ui/table/AnalyticalTable", "sap/ui/table/Table", "sap/ui/model/odata/type/Time",
	"sap/suite/ui/generic/template/lib/testableHelper"
], function(jQuery, BaseObject, DateFormat, ComboBox, MessageBox, MessageToast, Table, Filter, Sorter,
	SmartFilterBar, AnalyticalTable, UiTable, Time, testableHelper) {

	"use strict";

	function fnGroupFunction(sPath) {
		// coding for finding the right key and label for the grouping row of a table
		// hope to replace this by core functionality soon
		var sText = "";
		var mTypeMap = []; // buffer for subsequent calls
		return function(oContext) {
			var sLabel = "";
			var sTextPath = sPath;
			var oTypeMap;
			// check for existing entry in buffer
			for (var h in mTypeMap) {
				if (mTypeMap[h].path === sPath) {
					oTypeMap = mTypeMap[h];
					break;
				}
			}
			if (!oTypeMap) {
				// not in buffer
				var oMetaModel = oContext.getModel("entitySet").getMetaModel();
				// var oMetaEntityType = oMetaModel.getObject(oMetaModel.getMetaContext(oContext.sPath).sPath);
				var oProperty = oMetaModel.getObject(oMetaModel.getMetaContext(oContext.sPath + "/" + sPath).sPath);

				if (oProperty) {
					var sFormat = " ";
					for (var k = 0; k < oProperty.extensions.length; k++) {
						if (oProperty.extensions[k].namespace === "http://www.sap.com/Protocols/SAPData") {
							switch (oProperty.extensions[k].name) {
								case "display-format":
									sFormat = oProperty.extensions[k].value;
									break;
								case "label":
									sLabel = oProperty.extensions[k].value;
									break;
								case "text":
									var sTextProperty = oProperty.extensions[k].value;
									var aSplitPath = sPath.split("/");
									aSplitPath[aSplitPath.length - 1] = sTextProperty;
									sTextPath = aSplitPath.join("/");
									break;
								default:
									break;
							}
						}
					}
					if (sLabel === "") {
						sLabel = sPath;
					}
					// fill buffer
					oTypeMap = {
						path: sPath,
						data: {
							type: oProperty.type,
							displayFormat: sFormat,
							label: sLabel,
							textPath: sTextPath
						}
					};
					mTypeMap.push(oTypeMap);
				}
			}
			// Now it's time to fix the right label
			sLabel = oTypeMap.data.label;
			if (oTypeMap.data.textPath !== "") {
				if (oTypeMap.data.textPath === sPath) { // when there is no text property or text association
					sText = oContext.getProperty(oTypeMap.data.textPath);
				} else { // when there is text property or text association
					sText = oContext.getProperty(oTypeMap.data.textPath) + " (" + oContext.getProperty(sPath) + ")";
				}
				if (sText === null || sText === undefined) {
					sText = "";
				}
			} else if (oContext.getProperty(sPath) !== "") {
				sText = oContext.getProperty(sPath);
			}
			switch (oTypeMap.data.type) {
				case "Edm.DateTime":
					if (oTypeMap.data.displayFormat === "Date") {
						var dateFormat = DateFormat.getDateInstance({style : "medium"}); //better than specifying with a pattern since the language can be considered
						var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
						if (sText && sText !== "" && sText.getTime){
							sText = dateFormat.format(new Date(sText.getTime() + TZOffsetMs));
						}
					}
					break;
				case "Edm.Time":
						if (sText && sText !== ""){
							var oTime = new Time(); 
							sText = oTime.formatValue(sText, "string");
						}
					break;
				case "Edm.Boolean":
					if (sText === true) {
						sText = "{i18n>YES}";
					} else if (sText === false) {
						sText = "{i18n>NO}";
					}
					break;
				default:
					break;
			}
			return {
				key: sText ? sText : sPath,
				text: sLabel ? sLabel + ": " + sText : sText
			};
		};
	}

	function getMethods(oController, oComponentUtils, oServices, oCommonUtils) {

		function fnEvaluateParameters(oParameters){
			var result = {};
			for (var prop in oParameters){
				var oParameterValue = oParameters[prop];

				if (typeof oParameterValue === "string"){
					result[prop] = oParameterValue;
				} else if (typeof oParameterValue === "object"){
					if (oParameterValue.value){
						result[prop] = fnEvaluateParameters(oParameterValue).value;
					} else {
						result[prop] = oParameterValue;
					}
				}
			}
			return result;
		}

		// TODO: Check
		function fnHandleError(oError) {
			if (oError instanceof sap.ui.generic.app.navigation.service.NavError) {
				sap.m.MessageBox.show(oError.getErrorCode(), {
					title: oCommonUtils.getText("ST_GENERIC_ERROR_TITLE")
				});
			}
		}

		function getActiveSibling() {
			var oContext = oController.getView().getBindingContext();
			return oServices.oApplication.getDraftSiblingPromise(oContext);
		}
		
		var bIsDiscardDraftPopoverActive; // This variable (and its use) is necessary until BLI 3459 is solved
        var oCurrentActiveSiblingPromise; // Needed to store ActiveSiblingPromise in a global variable
		function getDiscardDraftPopover(oActiveSiblingPromise) {
			bIsDiscardDraftPopoverActive = true;
			oCurrentActiveSiblingPromise = oActiveSiblingPromise; // move variable to more global scope
			var oDraftPopover = oCommonUtils.getDialogFragment("sap.suite.ui.generic.template.fragments.DiscardDraftPopover", {
				onDiscardConfirm: function() {
					jQuery.sap.log.info("Draft cancellation confirmed");
					if (!bIsDiscardDraftPopoverActive) {
						jQuery.sap.log.info("Draft popover no longer active -> Ignore.");
						return;
					}
					var oBusyHelper = oServices.oApplication.getBusyHelper();
					if (oBusyHelper.isBusy()) {
						jQuery.sap.log.info("Ignore discarding confirmation as app is already busy");
						return; // avoid firing the AfterCancel-event in this case
					}
					jQuery.sap.log.info("Discarding was confirmed, draft will be discarded");
					oBusyHelper.setBusy(oCurrentActiveSiblingPromise);
					oCurrentActiveSiblingPromise.then(function(oActive) {
						jQuery.sap.log.info("Active information for current draft has been read. Start discarding the draft");
						var oActiveObject = oActive && oActive.getObject();
						var bIsActiveEntity = oActiveObject && oActiveObject.IsActiveEntity;
						var oTargetPromise = bIsActiveEntity ? oServices.oApplication.getTargetAfterCancelPromise(oActive) : Promise.resolve();
						oTargetPromise.then(function(vTarget){ // vTarget will be undefined when create draft is discarded; either a context or context path
							var oDiscardPromise = oServices.oCRUDManager.deleteEntity();
							oDiscardPromise.then(function() {
								jQuery.sap.log.info("Draft was discarded successfully");
								bIsDiscardDraftPopoverActive = false;
								oDraftPopover.close();
								jQuery.sap.log.info("Draft popover closed");
								oServices.oViewDependencyHelper.setRootPageToDirty();
								oServices.oViewDependencyHelper.unbindChildren(oController.getOwnerComponent());
								if (vTarget) {
									jQuery.sap.log.info("Navigate to active entityy");
									oServices.oNavigationController.navigateToContext(vTarget, null, true, 1);
								} else {
									jQuery.sap.log.info("Deleted draft was create draft. Navigate back");
									// new document discarded, go back to previous page
									var oGlobalModel = oController.getOwnerComponent().getModel("_templPrivGlobal");
									var bForceFullscreenCreate = oGlobalModel.getProperty("/generic/forceFullscreenCreate");
									if (bForceFullscreenCreate){
										oServices.oNavigationController.navigateBack(); // this should lead us back to the App where we have come from
									} else {
										oServices.oNavigationController.navigateToRoot(true);	
									}
								}
							});
							var oEvent = {
								discardPromise: oDiscardPromise
							};
							oComponentUtils.fire(oController, "AfterCancel", oEvent);
						});
					}, function(oError) {
						// open: error handling
						oDraftPopover.close();
					});
				}
			}, "discard");
			return oDraftPopover;
		}

		var bIsDiscardSubItemPopoverActive; // This variable (and its use) is necessary until BLI 3459 is solved
        function getDiscardSubItemPopover() {
			bIsDiscardSubItemPopoverActive = true;
			var oPopover = oCommonUtils.getDialogFragment("sap.suite.ui.generic.template.fragments.DiscardSubItemPopover", {
				onDiscardConfirm: function() {
					jQuery.sap.log.info("Sub item cancellation confirmed");
					if (!bIsDiscardSubItemPopoverActive) {
						jQuery.sap.log.info("Sub item popover no longer active -> Ignore.");
						return;
					}
					var oDeleteEntityPromise = oServices.oCRUDManager.deleteEntity(false, true); //no message toast here
					oDeleteEntityPromise.then(function() {
						var oComponent = oController.getOwnerComponent();
						oServices.oViewDependencyHelper.setParentToDirty(oComponent, oComponent.getNavigationProperty());
						oServices.oViewDependencyHelper.unbindChildren(oComponent, true);
						oPopover.close();
						bIsDiscardSubItemPopoverActive = false;
						// document was deleted, go back to previous page
						oServices.oNavigationController.navigateBack();
					});
					var oEvent = {
						deleteEntityPromise: oDeleteEntityPromise
					};
					oComponentUtils.fire(oController, "AfterDelete", oEvent);
				}
			}, "discard");
			return oPopover;
		}

        function storeObjectPageNavigationRelatedInformation(oEventSource) {
			var oRow = oEventSource;
			var iIdx = -1, iMaxIdx = -1;
			var oTable = oCommonUtils.getOwnerControl(oEventSource);


			if (oTable.getTable) {
				oTable = oTable.getTable();
			}

			var bIsAnalyticalTbl = oTable instanceof AnalyticalTable;

			if (!bIsAnalyticalTbl) { // up/down navigation is not enabled in the analytical table scenario

				// get the table list binding now
				var oTableBinding = oCommonUtils.getTableBinding(oTable);
				var oListBinding = oTableBinding && oTableBinding.binding;
				var aCurrContexts = null;

				if (oListBinding) {
					if (oTable instanceof UiTable) {
						// possibly a bug in the UI5 framework itself .. getCurrentContexts() only returns the contexts of selected rows in the table
						aCurrContexts = oListBinding.getContexts();
					} else if (oTable instanceof Table) {
						aCurrContexts = oListBinding.getCurrentContexts();
					}
				}

				var oContext = null;
				var aSelectedContexts = oCommonUtils.getSelectedContexts(oTable);
				var sSelectedBindingPath = null;

				if (aSelectedContexts && aSelectedContexts.length > 0) {
					sSelectedBindingPath = aSelectedContexts[0].getPath();
				} else if (oRow) {
					if (oTable instanceof Table) {
						// could be a list tab navigation - rows are not selected explicitly - can only be possible with a list/m.table navigation (by default)
						sSelectedBindingPath = oRow.getBindingContext() ? oRow.getBindingContext().sPath : null;
					}
				}

				// get index of selected item
				if (oListBinding && oListBinding.getContexts && sSelectedBindingPath) {
					for (var i = 0; i < aCurrContexts.length; i++) {
						oContext = aCurrContexts[i];
						if (oContext.getPath() === sSelectedBindingPath) {
							iIdx = i;
							break;
						}
					}
				}

				if (oTable && iIdx !== -1) {
					iMaxIdx = oListBinding.getLength();
					var iThreshold = Math.floor(iMaxIdx / 5); // default

					if (oTable instanceof Table) {
						iThreshold = oTable.getGrowingThreshold();
					} else if (oTable instanceof UiTable) {
						iThreshold = oTable.getThreshold();
					}

					// Populate the data to be passed to the next screen
					var aNewListBindingContexts = null;

					if (oListBinding && oTable instanceof UiTable) {
						// possibly a bug in the UI5 framework itself .. getCurrentContexts() only returns the contexts of selected rows in the table
						aNewListBindingContexts = oListBinding.getContexts();
					} else if (oListBinding && oTable instanceof Table) {
						aNewListBindingContexts = oListBinding.getCurrentContexts();
					}

					var oPaginatorInformation = aNewListBindingContexts && {
						listBinding: oListBinding,
						tableMaxItems: iMaxIdx,
						growingThreshold: iThreshold,
						selectedRelativeIndex: iIdx,
						objectPageNavigationContexts: aNewListBindingContexts,
						tableNavFrom: oTable,
						endIndex: aNewListBindingContexts.length - 1
					};

					var oTemplatePrivateModel = oComponentUtils.getTemplatePrivateModel();
					var iViewLevel = oTemplatePrivateModel.getProperty("/generic/viewLevel");
					var oTemplatePrivateGlobalModel = oController.getOwnerComponent().getModel("_templPrivGlobal");
					oTemplatePrivateGlobalModel.setProperty("/generic/paginatorInfo/" + iViewLevel, oPaginatorInformation);
				}
			}
		}

		// injection of $select for smart table - only subset of fields is requested (line items) but technical fields
		// are; required as well: semantic
		// key, technical key + IsDraft / HasTwin
		function getTableQueryParameters(sEntitySet, oExistingQueryParameters) { // #ListController
			var oMetaModel = oController.getView().getModel().getMetaModel();
			var oBindingParams = oExistingQueryParameters;
			var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet, false);
			var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType, false);
			var aMandatoryFields = oEntityType.key.propertyRef;
			var i;

			var oDraftContext = oServices.oDraftController.getDraftContext();
			if (oDraftContext.isDraftEnabled(sEntitySet)) {
				aMandatoryFields = aMandatoryFields.concat(oDraftContext.getSemanticKey(sEntitySet));
				aMandatoryFields.push({
					name: "IsActiveEntity"
				}, {
					name: "HasDraftEntity"
				}, {
					name: "HasActiveEntity"
				});
			}

			if (oBindingParams.parameters.select && oBindingParams.parameters.select.length > 0) {
				// at least one select parameter
				var aSelects = oBindingParams.parameters.select.split(",");
				for (i = 0; i < aMandatoryFields.length; i++) {
					if (jQuery.inArray(aMandatoryFields[i].name, aSelects) === -1) {
						oBindingParams.parameters.select += "," + aMandatoryFields[i].name;
					}
				}
			}
			return oBindingParams;
		}

		function onSmartFieldUrlPressed(oEvent, oState) {
			var sUrl = oEvent.getSource().getUrl();
			oEvent.preventDefault();
			//determination if Url is pointing externally, and only then open in a new window - not yet implemented
			//only then the data loss popup is needed when replacing the existing page
			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				sap.m.URLHelper.redirect(sUrl, false);
				}, jQuery.noop, oState);
		}

		function onBreadCrumbUrlPressed(oEvent, oState) {
			oEvent.preventDefault();
			/*Lokal - oEvent.getSource().getHref() returns #/STTA_C_SO_SalesOrder_ND('500000011')
			  HCP   - oEvent.getSource().getHref() returns #EPMSalesOrderND-manage_sttasond&//STTA_C_SO_SalesOrder_ND('500000011')
			  Techn - oEvent.getSource().getHref() returns #EPMProduct-manage_stta&/STTA_C_MP_Product(ProductDraftUUID=guid'00000000-0000-0000-0000-000000000000',ActiveProduct='HT-1001')/to_ProductText(ProductTextDraftUUID=guid'00000000-0000-0000-0000-000000000000',ActiveProduct='HT-1001',ActiveLanguage='ZH')*/
			var sHref = oEvent.getSource().getHref(); //return the hash that has been set during fnBindBreadcrumbs in OP controller
			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				window.location.hash = sHref; //also updates the browser history
				}, jQuery.noop, oState);
		}

		/**
		 * Return an instance of the DeleteConfirmation fragment
		 *
		 * @param {sap.m.Table} table
		 * @return {sap.m.Dialog} - returns the Delete Confirmation Dialog
		 * @private
		 */
		function getDeleteDialog(smartTable) {
			return oCommonUtils.getDialogFragment("sap.suite.ui.generic.template.ListReport.view.fragments.DeleteConfirmation", {
				onCancel: function(oEvent) {
					var oDialog = oEvent.getSource().getParent();
					oDialog.close();
				},
				onDelete: function(oEvent) {
					var oDialog = oEvent.getSource().getParent();
					var oDialogModel = oDialog.getModel("delete");
					var aSelectedItems = oDialogModel.getProperty("/items");
					var aPathsToBeDeleted = [];
					// determine which items to delete
					for (var i = 0; i < aSelectedItems.length; i++) {
						if (!aSelectedItems[i].draftStatus.locked && aSelectedItems[i].deletable) {
							if (aSelectedItems.length === oDialogModel.getProperty("/unsavedChangesItemsCount") || !aSelectedItems[i].draftStatus.unsavedChanges ||
								oDialogModel.getProperty("/checkboxSelected")) {
								aPathsToBeDeleted.push(aSelectedItems[i].context.getPath());
							}
						}
					}
					// delete
					oServices.oCRUDManager.deleteEntities(aPathsToBeDeleted).then(
						function(aFailedPath) {
							// remove selections from the table and set the delete button to disabled
							var oTable = smartTable.getTable();
							oTable.getModel("_templPriv").setProperty("/listReport/deleteEnabled", false);

							var iSuccessfullyDeleted = aPathsToBeDeleted.length - aFailedPath.length;
							if (aFailedPath.length > 0) {
								var sErrorMessage = "";
								if (iSuccessfullyDeleted > 0) {

									// successful delete
									sErrorMessage += (iSuccessfullyDeleted > 1) ?
										oCommonUtils.getText("ST_GENERIC_DELETE_SUCCESS_PLURAL_WITH_COUNT", [iSuccessfullyDeleted]) :
										oCommonUtils.getText("ST_GENERIC_DELETE_SUCCESS_WITH_COUNT", [iSuccessfullyDeleted]);

									// failed deletes
									sErrorMessage += "\n";
									sErrorMessage += (aFailedPath.length > 1) ?
										oCommonUtils.getText("ST_GENERIC_DELETE_ERROR_PLURAL_WITH_COUNT", [aFailedPath.length]) :
										oCommonUtils.getText("ST_GENERIC_DELETE_ERROR_WITH_COUNT", [aFailedPath.length]);

								} else {
									sErrorMessage = (aFailedPath.length > 1) ?
										oCommonUtils.getText("ST_GENERIC_DELETE_ERROR_PLURAL") :
										oCommonUtils.getText("ST_GENERIC_DELETE_ERROR");
								}

								MessageBox.error(sErrorMessage);

							} else {
								var sSuccessMessage = "";
								sSuccessMessage = (iSuccessfullyDeleted > 1) ?
									oCommonUtils.getText("ST_GENERIC_DELETE_SUCCESS_PLURAL") :
									oCommonUtils.getText("ST_GENERIC_OBJECT_DELETED");

								MessageToast.show(sSuccessMessage);
							}
							
							// after rebindTable is complete we need to update the enablement of the toolbar buttons (selected contexts have changed) - we attach (once) a handler to the table's event "updateFinished"
							smartTable.getTable().attachEventOnce("updateFinished", function () {
								oCommonUtils.setEnabledToolbarButtons(smartTable);
							});
							smartTable.rebindTable();
						},
						function(oError) {
							// this could be a different message b/c the batch request has failed here
							MessageBox.error(oCommonUtils.getText("ST_GENERIC_DELETE_ERROR_PLURAL", [aPathsToBeDeleted.length]), {
								styleClass: oCommonUtils.getContentDensityClass()
							});
						}
					);
					oDialog.close();
				}
			}, "delete");
		}
		/**
		 * Return the data necessary for the Delete Confirmation Dialog
		 *
		 * @param [sap.m.ListItemBase] selectedItems
		 * @return {map} JSON map containing the data for the Delete Confirmation Dialog
		 * @private
		 */
		function getDataForDeleteDialog(selectedItems) {
			var oModel = oController.getView().getModel();
			var oMetaModel = oModel.getMetaModel();
			var oEntitySet = oMetaModel.getODataEntitySet(oController.getOwnerComponent().getEntitySet());
			var oDeleteRestrictions = oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"];
			var sDeletablePath = (oDeleteRestrictions && oDeleteRestrictions.Deletable &&  oDeleteRestrictions.Deletable.Path) ? oDeleteRestrictions.Deletable.Path : "";

			var mJSONData = {
				items: undefined,
				itemsCount: selectedItems.length,
				text: {
					title: undefined,
					shortText: undefined,
					unsavedChanges: undefined,
					longText: undefined,
					undeletableText: undefined
				},
				lockedItemsCount: 0,
				unsavedChangesItemsCount: 0,
				undeletableCount: 0,
				checkboxSelected: true
			};

			// Enhance the items with their context and draft status. Also keep track of the number of locked and unsaved items
			// + Enhance with undeletable status and track number of undeletable items
			var aItems = [];
			for (var i = 0; i < selectedItems.length; i++) {
				var oEntity = oModel.getObject(selectedItems[i].getPath());
				var mDraftStatus = {};
				var bDeletable = true;

				if (!oEntity.IsActiveEntity) { // if the entity is not an active entity, we can assume it is a draft
					mDraftStatus.draft = true;

				} else if (oEntity.HasDraftEntity) { // if the entity is an active entity AND has a draft entity, we can assume someone else has a draft of the entity
					var sLockedBy = oModel.getProperty("DraftAdministrativeData/InProcessByUser", selectedItems[i]);
					if (sLockedBy) { // if there is a user processing the entity, it is locked
						mDraftStatus.locked = true;
						mDraftStatus.user = sLockedBy;
						mJSONData.lockedItemsCount++;
					} else { // else the entity has unsaved changes
						mDraftStatus.unsavedChanges = true;
						mDraftStatus.user = oModel.getProperty("DraftAdministrativeData/LastChangedByUser", selectedItems[i]);
						mJSONData.unsavedChangesItemsCount++;
					}
				}

				if (sDeletablePath && sDeletablePath !== "") {
					if (oModel.getProperty(sDeletablePath, selectedItems[i]) === false) {
						bDeletable = false;
						mJSONData.undeletableCount++;
					}
				}

				aItems.push({
					context: selectedItems[i],
					draftStatus: mDraftStatus,
					deletable: bDeletable
				});
			}
			mJSONData.items = aItems;

			// determine Dialog title
			if (mJSONData.lockedItemsCount === mJSONData.itemsCount) {
				mJSONData.text.title = oCommonUtils.getText("ST_GENERIC_ERROR_TITLE");
			} else {
				mJSONData.text.title = (mJSONData.itemsCount > 1) ?
					oCommonUtils.getText("ST_GENERIC_DELETE_TITLE_WITH_COUNT", [mJSONData.itemsCount]) :
					oCommonUtils.getText("ST_GENERIC_DELETE_TITLE");
			}

			// determine unsavedChanges Checkbox text
			mJSONData.text.unsavedChanges = oCommonUtils.getText("ST_GENERIC_UNSAVED_CHANGES_CHECKBOX");

			// determine short text
			if (mJSONData.itemsCount > 1) {
				if (mJSONData.lockedItemsCount === mJSONData.itemsCount) {
					mJSONData.text.shortText = oCommonUtils.getText("ST_GENERIC_DELETE_LOCKED_PLURAL");
				} else if (mJSONData.unsavedChangesItemsCount === mJSONData.itemsCount) {
					mJSONData.text.shortText = oCommonUtils.getText("ST_GENERIC_DELETE_UNSAVED_CHANGES_PLURAL");
				} else if (mJSONData.lockedItemsCount > 0) {
					var iRemainingItems = mJSONData.itemsCount - mJSONData.lockedItemsCount;
					// 1st part of message
					mJSONData.text.shortText = (mJSONData.lockedItemsCount > 1) ?
						oCommonUtils.getText("ST_GENERIC_CURRENTLY_LOCKED_PLURAL", [mJSONData.lockedItemsCount, mJSONData.itemsCount]) :
						oCommonUtils.getText("ST_GENERIC_CURRENTLY_LOCKED", [mJSONData.itemsCount]);

					mJSONData.text.shortText += "\n";
					// 2nd part of message
					if (iRemainingItems === mJSONData.unsavedChangesItemsCount) {
						mJSONData.text.shortText += (iRemainingItems > 1) ?
							oCommonUtils.getText("ST_GENERIC_DELETE_REMAINING_UNSAVED_CHANGES_PLURAL") :
							oCommonUtils.getText("ST_GENERIC_DELETE_REMAINING_UNSAVED_CHANGES");
					} else {
						mJSONData.text.shortText += (iRemainingItems > 1) ?
							oCommonUtils.getText("ST_GENERIC_DELETE_REMAINING_PLURAL", [iRemainingItems]) :
							oCommonUtils.getText("ST_GENERIC_DELETE_REMAINING");
					}
				} else {
					mJSONData.text.shortText = oCommonUtils.getText("ST_GENERIC_DELETE_SELECTED_PLURAL");
				}

				if (mJSONData.undeletableCount > 0) {
					mJSONData.text.undeletableText = oCommonUtils.getText("ST_GENERIC_DELETE_UNDELETABLE", [mJSONData.undeletableCount, mJSONData.itemsCount]);
				}
			} else {
				if (mJSONData.lockedItemsCount > 0) {
					mJSONData.text.shortText = oCommonUtils.getText("ST_GENERIC_DELETE_LOCKED", [" ", mJSONData.items[0].draftStatus.user]);
				} else if (mJSONData.unsavedChangesItemsCount > 0) {
					mJSONData.text.shortText = oCommonUtils.getText("ST_GENERIC_DELETE_UNSAVED_CHANGES", [" ", mJSONData.items[0].draftStatus.user]);
				} else {
					mJSONData.text.shortText = oCommonUtils.getText("ST_GENERIC_DELETE_SELECTED");
				}
			}

			return mJSONData;
		}

		function fnShowError(sErrorMessageKey) {
			MessageBox.error(oCommonUtils.getText(sErrorMessageKey), {
				styleClass: oCommonUtils.getContentDensityClass()
			});
		}

		function fnBuildSelectionVariantForNavigation(oOutbound, oLineContext, oPageContext, sFilterBarSelectionVariant){
			var oNavigationHandler = oCommonUtils.getNavigationHandler();
			var oOutboundParametersEmpty = {};
			var oOutboundParameters = {};
			for (var prop in oOutbound.parameters){
				if (jQuery.isEmptyObject(oOutbound.parameters[prop])){
					oOutboundParametersEmpty[prop] = oOutbound.parameters[prop];
				} else {
					oOutboundParameters[prop] = oOutbound.parameters[prop];
				}
			}
			oOutboundParameters = fnEvaluateParameters(oOutboundParameters);
			oNavigationHandler.mixAttributesAndSelectionVariant({}, sFilterBarSelectionVariant).getParameterNames().forEach(
					function(prop) {delete oOutboundParametersEmpty[prop];});
			var oPageContextObject = oPageContext && oPageContext.getObject();
			var oLineContextObject = oLineContext && oLineContext.getObject();
			var oMixedContextObject = jQuery.extend({}, oOutboundParametersEmpty, oPageContextObject, oLineContextObject, oOutboundParameters);
			return oNavigationHandler.mixAttributesAndSelectionVariant(oMixedContextObject, sFilterBarSelectionVariant);
		}

		function fnNavigateIntent(oOutbound, oContext, oSmartFilterBar, oSmartTable) {
			var oNavigationHandler = oCommonUtils.getNavigationHandler();

			var sSelectionVariant;
			if (oSmartFilterBar) {
				sSelectionVariant = oSmartFilterBar.getDataSuiteFormat();
			}
			var oSelectionVariant = fnBuildSelectionVariantForNavigation(oOutbound, oContext, oController.getView().getBindingContext(), sSelectionVariant);

			oNavigationHandler.navigate(oOutbound.semanticObject, oOutbound.action, oSelectionVariant.toJSONString(),
					null, fnHandleError);
			//null object has to be passed to the NavigationHandler as an
			//indicator that the state should not be overwritten
		}

		function fnNavigateIntentManifest(oEventSource, oContext, oSmartFilterBar) {
			var oManifestEntry = oController.getOwnerComponent().getAppComponent().getManifestEntry("sap.app");
			var oOutbound = oManifestEntry.crossNavigation.outbounds[oEventSource.data("CrossNavigation")];
			var oSmartTable;
			if (oSmartFilterBar) {
				oSmartTable = oCommonUtils.getOwnerControl(oEventSource).getParent();
			}
			fnNavigateIntent(oOutbound, oContext, oSmartFilterBar, oSmartTable);
		}

		function fnExpandOnNavigationProperty (aPath, aExpands) {
			// check if any expand is neccessary
			for (var i = 0; i < aPath.length; i++) {
				// check if expand is neccessary
				if (aPath[i].indexOf("/") !== -1) {
					var aParts = aPath[i].split("/");
					// remove property from path
					aParts.pop();
					var sNavigation = aParts.join("/");
					if (aExpands.indexOf(sNavigation) === -1) {
						aExpands.push(sNavigation);
					}
				}
			}
		}

		function fnSemanticObjectLinkPopoverLinkPressed (oEvent, oState){
			//TODO: check if we need it ??? my Answer is NO.
			/*oEvent.preventDefault();
			var oTempEvent = jQuery.extend(true, {}, oEvent);
			oCommonUtils.processDataLossConfirmationIfNonDraft(function(){
				//retrigger the navigation, but how?
			}, jQuery.noop, oState, jQuery.noop, true);
			*/
		}
		
		// TABLE TAB POC ONLY
		function fnBuildSelectionVariantFilters(oEntityType) {
			var oManifest = oController.getOwnerComponent().getAppComponent().getManifestEntry("sap.ui.generic.app");
			var oManifestTabs = {};
			if (oManifest && oManifest.pages[0] && oManifest.pages[0].component && oManifest.pages[0].component.settings) {
				oManifestTabs = oManifest.pages[0].component.settings.tableTabs;
			}
			var aSelectionVariantFilters = []; // a[x][y] = y-th filter of x-th filter tab
			
			for (var iTab in oManifestTabs) {
				var sQualifier = oManifestTabs[iTab].qualifier;
				if (sQualifier) {
					aSelectionVariantFilters[iTab] = []; 
					var oVariant = oEntityType[sQualifier];
					for (var i in oVariant.SelectOptions) {
						if (oVariant.SelectOptions[i].PropertyName) {
							var sPath = oVariant.SelectOptions[i].PropertyName.PropertyPath;
							for (var j in oVariant.SelectOptions[i].Ranges) {
								var oOperator = oVariant.SelectOptions[i].Ranges[j].Option;
								oOperator.EnumMember = oOperator.EnumMember.replace("com.sap.vocabularies.UI.v1.SelectionRangeOptionType/", "");
								var oValueLow = oVariant.SelectOptions[i].Ranges[j].Low;
								var oValueHigh = oVariant.SelectOptions[i].Ranges[j].High;
								if (oValueHigh) {
									aSelectionVariantFilters[iTab].push(new Filter(sPath, oOperator.EnumMember, oValueLow.String, oValueHigh.String));
								} else {
									aSelectionVariantFilters[iTab].push(new Filter(sPath, oOperator.EnumMember, oValueLow.String));
								}
							}
						}
					}
				}
			}
			return aSelectionVariantFilters;
		}
		
		// TABLE TAB POC ONLY
		function fnVisitFiltersFromSmartFilterBar(oController, oSmartFilterBar, oSmartTable, oBindingParams) {
			var oManifest = oController.getOwnerComponent().getAppComponent().getManifestEntry("sap.ui.generic.app");
			if (oController.getMetadata().getName() === 'sap.suite.ui.generic.template.ListReport.view.ListReport'
					&& oManifest && oManifest.pages[0] && oManifest.pages[0].component && oManifest.pages[0].component.settings && oManifest.pages[0].component.settings.tableTabs) {
				// apply filters from smart filter bar
				var aFilters = oSmartFilterBar.getFilters();
				if (aFilters[0] && aFilters[0]._bMultiFilter) {
					// multiple filters seem to be stored in inner array (TODO check with smart controls!)
					aFilters = aFilters[0].aFilters;
				}
				if (aFilters) {
					for (var i in aFilters) {
						oBindingParams.filters.push(aFilters[i]);
					}
				}
			}
		}
		
		function onBeforeRebindTable(oEvent) {
			// For line item actions, popin display must not have a label
			var oSmartTable = oEvent.getSource();
			var oTable = oSmartTable.getTable();
			if (oTable instanceof Table) {
				var oColumns = oTable.getColumns();
				for (var iColumn = 0; iColumn < oColumns.length; iColumn++) {
					if (oColumns[iColumn].getCustomData()[0].getValue() && oColumns[iColumn].getCustomData()[0].getValue()["actionButton"] === "true") {
						oColumns[iColumn].setPopinDisplay("WithoutHeader");
					}
				}
			}
			// still open
			var oBindingParams = oEvent.getParameter("bindingParams");
			oBindingParams.parameters = oBindingParams.parameters || {};

			var oSmartFilterBar = oController.byId(oSmartTable.getSmartFilterId());

			// TABLE TAB POC ONLY
			if (!oSmartFilterBar) {
				oSmartFilterBar = oController.byId("listReportFilter");
				fnVisitFiltersFromSmartFilterBar(oController, oSmartFilterBar, oSmartTable, oBindingParams);
			}
			// (END) TABLE TAB POC ONLY

			if (oSmartFilterBar instanceof SmartFilterBar) {
				var oCustomControl = oSmartFilterBar.getControlByKey("EditState");
				if (oCustomControl instanceof ComboBox) {
					var vDraftState = oCustomControl.getSelectedKey();
					switch (vDraftState) {
						case "1": // Unchanged
							// IsActiveDocument and siblingEntity eq null
							oBindingParams.filters.push(new Filter("IsActiveEntity", "EQ", true));
							oBindingParams.filters.push(new Filter("HasDraftEntity", "EQ", false));
							break;
						case "2": // Draft
							oBindingParams.filters.push(new Filter("IsActiveEntity", "EQ", false));
							break;
						case "3": // Locked
							oBindingParams.filters.push(new Filter("IsActiveEntity", "EQ", true));
							oBindingParams.filters.push(new Filter("SiblingEntity/IsActiveEntity", "EQ", null));
							oBindingParams.filters.push(new Filter("DraftAdministrativeData/InProcessByUser", "NE", ""));
							break;
						case "4": // Unsaved changes
							oBindingParams.filters.push(new Filter("IsActiveEntity", "EQ", true));
							oBindingParams.filters.push(new Filter("SiblingEntity/IsActiveEntity", "EQ", null));
							oBindingParams.filters.push(new Filter("DraftAdministrativeData/InProcessByUser", "EQ", ""));
							break;
						default: // All ==> Special handling for multiple multi-filters
							var oOwnMultiFilter = new Filter({
								filters: [new Filter("IsActiveEntity", "EQ", false),
								          new Filter("SiblingEntity/IsActiveEntity", "EQ", null)
								],
								and: false
							});
						if (oBindingParams.filters[0] && oBindingParams.filters[0].aFilters) {
							var oSmartTableMultiFilter = oBindingParams.filters[0];
							oBindingParams.filters[0] = new Filter([oSmartTableMultiFilter, oOwnMultiFilter], true);
						} else {
							oBindingParams.filters.push(oOwnMultiFilter);
						}
						break;
					}
				}
			}
			//--- begin: expand binding --------------------------------------------------------------------------------------
			getTableQueryParameters(oSmartTable.getEntitySet(), oBindingParams);
			var aSelect = oBindingParams.parameters.select && oBindingParams.parameters.select.split(",") || [];
			var aExpands = oBindingParams.parameters && oBindingParams.parameters.expand && oBindingParams.parameters.expand.split(",") || [];
			var sEntitySet = oSmartTable.getEntitySet();

			if (aSelect && aSelect.length > 0) {
				var oMetaModel = oSmartTable.getModel().getMetaModel();
				var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);

				//needed for activating field control for DataField Annotation & when using the setting to add new columns
				var oProperty = {};
				var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
				for (var index = 0; index < aSelect.length; index++) {
					var sSelect = aSelect[index];
					if (sSelect){
						var oProperty = oMetaModel.getODataProperty(oEntityType, sSelect);
						if (oProperty && oProperty["com.sap.vocabularies.Common.v1.FieldControl"] && oProperty["com.sap.vocabularies.Common.v1.FieldControl"].Path){
							var sPropertyFieldControl = oProperty["com.sap.vocabularies.Common.v1.FieldControl"].Path;
							if (sPropertyFieldControl !== " " && oBindingParams.parameters.select.search(sPropertyFieldControl) === -1) {
								oBindingParams.parameters.select += "," + sPropertyFieldControl;
								aSelect.push(sPropertyFieldControl);
							}
						}
					}
				}

				// Make sure sorter text property in select and expand list for grouping selection where column is not visible
				if (oTable instanceof Table) {
					var oSorter = oBindingParams.sorter[0];
					// Check if sorter is for Grouping
					if (oSorter && oSorter.vGroup) {
						var oSorterObject = oMetaModel.getODataProperty(oEntityType, oSorter.sPath);
						var sSorterText = oSorterObject["sap:text"] || (oSorterObject["com.sap.vocabularies.Common.v1.Text"] || "").Path || "";
						if (sSorterText) {
							if (jQuery.inArray(sSorterText, aSelect) === -1) {
								oBindingParams.parameters.select += "," + sSorterText;
								aSelect.push(sSorterText);
							}
						}
					}
				}

				// add deletable-path properties
				var oDeleteRestrictions = oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"];
				if (oDeleteRestrictions && oDeleteRestrictions.Deletable &&  oDeleteRestrictions.Deletable.Path &&
					oBindingParams.parameters.select.search(oDeleteRestrictions.Deletable.Path) === -1) {
						oBindingParams.parameters.select += "," + oDeleteRestrictions.Deletable.Path;
						aSelect.push(oDeleteRestrictions.Deletable.Path);
				}
				// add applicable-path properties for annotated actions
				var sFunctionImport,
					oFunctionImport;
				var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
				var oLineItem = oEntityType["com.sap.vocabularies.UI.v1.LineItem"] || [];
				for (var index = 0; index < oLineItem.length; index++) {
					if (oLineItem[index].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
						sFunctionImport = oMetaModel.getODataFunctionImport(oLineItem[index].Action.String, true);
						if (sFunctionImport) {   //else: break-out action, no backend data needed
							oFunctionImport = oMetaModel.getObject(sFunctionImport);
							if (oFunctionImport["sap:action-for"] !== " " && oFunctionImport["sap:applicable-path"] !== " " &&
									oBindingParams.parameters.select.search(oFunctionImport["sap:applicable-path"]) === -1) {
								oBindingParams.parameters.select += "," + oFunctionImport["sap:applicable-path"];
								aSelect.push(oFunctionImport["sap:applicable-path"]);
							}
						}
					}
				}
				// add applicablePath properties for breakout actions
				var aButtons = oCommonUtils.getBreakoutActionsForTable(oSmartTable, oController);
				var oBreakoutActions = oCommonUtils.getBreakoutActionsFromManifest(oTable.getModel());
				for (var sAction in oBreakoutActions) {
					if (jQuery.inArray(oBreakoutActions[sAction].id, aButtons) !== -1) {
						if (oBreakoutActions[sAction].requiresSelection && oBreakoutActions[sAction].applicablePath) {
							if (oBindingParams.parameters.select.search(oBreakoutActions[sAction].applicablePath) === -1) {
								oBindingParams.parameters.select += "," + oBreakoutActions[sAction].applicablePath;
								aSelect.push(oBreakoutActions[sAction].applicablePath);
							}
						}
					}
				}
			}
			fnExpandOnNavigationProperty(aSelect, aExpands);

			// add Draft Admin Data to expand if entity is Draft and Draft Root and has Draft Admin Data
			var oDraftContext = oServices.oDraftController.getDraftContext();
			if (oDraftContext.isDraftEnabled(sEntitySet) && oDraftContext.isDraftRoot(sEntitySet)) {
				if (oDraftContext.hasDraftAdministrativeData(sEntitySet)) {

					if (aSelect && aSelect.length > 0) {
						if (aSelect.indexOf("DraftAdministrativeData") === -1) {
							oBindingParams.parameters.select = oBindingParams.parameters.select + ",DraftAdministrativeData";
						}
					}

					if (aExpands.indexOf("DraftAdministrativeData") === -1) {
						aExpands.push("DraftAdministrativeData");
					}
				}
			}

			if (aExpands.length > 0) {
				oBindingParams.parameters.expand = aExpands.join(",");
			}

			// sortOrder Annotation of presentation variant - only relevant for sap.m.Table
			var aCustomData = oSmartTable.getCustomData();
			var oCustomData = {};
			for (var k = 0; k < aCustomData.length; k++) {
				oCustomData[aCustomData[k].getKey()] = aCustomData[k].getValue();
			}
			var oVariant = oSmartTable.fetchVariant();
			if ((!oVariant || !oVariant.sort) && oTable instanceof Table && oCustomData.TemplateSortOrder) {
				var aSortOrder = oCustomData.TemplateSortOrder.split(", ");
				for (var j = 0; j < aSortOrder.length; j++) {
					var aSort = aSortOrder[j].split(" ");
					if (aSort.length > 1) {
						oBindingParams.sorter.push(new Sorter(aSort[0], aSort[1] === "true"));
					} else {
						oBindingParams.sorter.push(new Sorter(aSort[0]));
					}
				}
			}

			if (oTable instanceof Table) {
				// Define grouping (wiki: SmartTable FAQs)
				var oSorter = oBindingParams.sorter[0];
				// Check if sorter is for Grouping
				if (oSorter && oSorter.vGroup) {
					// Replace the Group function
					oSorter.fnGroup = fnGroupFunction(oSorter.sPath);
				}
			}

			oSmartTable.getTable().attachEventOnce("updateFinished", function () {
				oCommonUtils.setEnabledToolbarButtons(oSmartTable);
				oCommonUtils.setEnabledFooterButtons(oSmartTable, oController);
			});
		}
		
		// TABLE TAB POC ONLY
		function fnSetCount(aFilterTabs, index, oData) {
			// based on the assumption that the $count responses 
			aFilterTabs[index].setCount(oData); 
		}
		
		// TABLE TAB POC ONLY
		function onBeforeRebindTableFinally(oEvent) {
			// Table Tab POC: update tab counts
			// TODO initialize aFilter ONE time (at the beginning)
			// for productization, analyze annotations one time and store all filter/tab/table information centrally in one robust and convenient-to-handle data structure (map?)
			var oManifest = oController.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui.generic.app");
			if (oManifest && oManifest.pages[0] && oManifest.pages[0].component && oManifest.pages[0].component.settings && oManifest.pages[0].component.settings.tableTabs) {
				var oBindingParams = oEvent.getParameter("bindingParams");
				oBindingParams.parameters = oBindingParams.parameters || {};

				var oSmartTable = oEvent.getSource();
				var oModel = oSmartTable.getModel();
				var oMetaModel = oModel.getMetaModel();
				var sEntitySet = oSmartTable.getEntitySet();
				var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
				var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
				var aSelectionVariantFilters = fnBuildSelectionVariantFilters(oEntityType);
				
				var oIconTabBar = oController.byId("iconTabBar");
				var sTabKey = oIconTabBar.getSelectedKey();
				var aFilterTabs = oIconTabBar.getItems();

				for (var iTabIdx in aFilterTabs) {
					var aFilters = [];
					for (var i in oBindingParams.filters) {
						aFilters.push(oBindingParams.filters[i]); // copy array content to prevent call by reference
					}
					for (var i in aSelectionVariantFilters[iTabIdx]) {
						aFilters.push(aSelectionVariantFilters[iTabIdx][i]);
					}
					
					var oThisTable = oController.byId("listReport-" + iTabIdx);
					var sEntitySet = oThisTable.getEntitySet();
					oModel.read("/" + sEntitySet + "/$count", {
						urlParameters: oBindingParams.parameters, // not needed, but for improving performance?
						filters: aFilters,
						groupId: "updateTabs",
						success: fnSetCount.bind(null, aFilterTabs, iTabIdx),
						error: function(oData, oResponse) {
							// clarify: how to indicate/handle errors?
						}
					});
				}
				
				// Table Tab POC: add filters of selected tab to oBindingParams.filters
				for (var i in aSelectionVariantFilters[sTabKey]) {
					oBindingParams.filters.push(aSelectionVariantFilters[sTabKey][i]);
				}
			}
		}

		/**
		 * Navigation from table
		 * @param {sap.ui.base.EventProvider} oEventSource - The source of the triggered event
		 * @param {object} oState
		 */
		function onListNavigate(oEventSource, oState) {
			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				if (oEventSource.data("CrossNavigation")) {
					// intent based navigation
					fnNavigateIntentManifest(oEventSource, oEventSource.getBindingContext(), oState.oSmartFilterbar);
					return;
				}
				// Get parent table from the event source
				var oTable = oCommonUtils.getOwnerControl(oEventSource);
				storeObjectPageNavigationRelatedInformation(oEventSource);
				oCommonUtils.navigateFromListItem(oEventSource.getBindingContext(), oTable);
			}, jQuery.noop, oState);
		}

		function onShowDetails(oEventSource, oState) {
			var oTable = oEventSource.getParent().getParent().getTable();
			var aContexts = oCommonUtils.getSelectedContexts(oTable);
			switch (aContexts.length) {
				case 0:
					fnShowError("ST_GENERIC_NO_ITEM_SELECTED");
					return;
				case 1:
					oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
						//processing allowed
						if (oEventSource.data("CrossNavigation")){
							// intent based navigation
							fnNavigateIntentManifest(oEventSource, aContexts[0], oState.oSmartFilterbar);
							return;
						}
						// internal navigation
						storeObjectPageNavigationRelatedInformation(oEventSource);
						oCommonUtils.navigateFromListItem(aContexts[0], oTable);
					}, jQuery.noop, oState);
					return;
				default:
					fnShowError("ST_GENERIC_MULTIPLE_ITEMS_SELECTED");
				return;
			}
		}

		function onDataFieldForIntentBasedNavigation(oEvent, oState) {
			var oEventSource = oEvent.getSource();
			var oControl = oCommonUtils.getOwnerControl(oEventSource);
			var aContexts = oCommonUtils.getSelectedContexts(oControl);
			switch (aContexts.length) {
				case 0:
				case 1:
					oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
						var oOutbound = {
								action: oEventSource.data('Action'),
								semanticObject:	oEventSource.data('SemanticObject')
						};
						fnNavigateIntent(oOutbound, aContexts[0], oState.oSmartFilterbar || undefined, oState.oSmartTable || undefined);
					}, jQuery.noop, oState);
					return;
				default:
					fnShowError("ST_GENERIC_MULTIPLE_ITEMS_SELECTED");
				return;
			}
		}

		function onDataFieldWithIntentBasedNavigation(oEvent, oState) {
			var oEventSource = oEvent.getSource();
			var oContext = oEventSource.getParent().getBindingContext();
			var sSemanticObject = oEventSource.data('SemanticObject');
			var sAction = oEventSource.data('Action');

			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				var oOutbound = {
						action: sAction,
						semanticObject:	sSemanticObject
				};
				fnNavigateIntent(oOutbound, oContext, oState.oSmartFilterbar || undefined, oState.oSmartTable || undefined);
			}, jQuery.noop, oState);
		}

		function onDataFieldForIntentBasedNavigationSelectedContext(oContext, oCustomData, oState) {
			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				var oOutbound = {
						action: oCustomData.Action,
						semanticObject:	oCustomData.SemanticObject
				};
				fnNavigateIntent(oOutbound, oContext, oState.oSmartFilterbar, oState.oSmartTable);
			}, jQuery.noop, oState);
		}

		function onInlineDataFieldForIntentBasedNavigation(oEventSource, oState){
			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				var oOutbound = {
						semanticObject: oEventSource.data("SemanticObject"),
						action: oEventSource.data("Action")
				};
				var oContext = oEventSource.getParent().getBindingContext();
				fnNavigateIntent(oOutbound, oContext, oState.oSmartFilterbar, oState.oSmartTable);
			}, jQuery.noop, oState);
		}

		/**
		 * Action triggered from Control's toolbar
		 * @param {sap.ui.base.Event} oEvent - the triggered event (most likely a 'click')
		 * @param {object} oState
		 */
		function onCallActionFromToolBar(oEvent, oState) {
			var oSourceControl, sBindingPath = "";
			var oControl = oCommonUtils.getOwnerControl(oEvent.getSource());
			var oCustomData = oEvent.getSource().data();
			var aContexts = oCommonUtils.getSelectedContexts(oControl);
			var sControlName = oControl.getMetadata().getName();

			if (sControlName === "sap.ui.comp.smarttable.SmartTable") {
				oSourceControl = oControl.getTable();
				sBindingPath = oControl.getTableBindingPath();

			} else if (sControlName === "sap.ui.comp.smartchart.SmartChart") {
				oSourceControl = oControl.getChart();
				sBindingPath = oControl.getChartBindingPath();
			}

			CRUDManagerCallAction({
				functionImportPath: oCustomData.Action,
				contexts: aContexts,
				sourceControl: oSourceControl,
				label: oCustomData.Label,
				operationGrouping: oCustomData.InvocationGrouping,
				navigationProperty: ""
			}, oState, sBindingPath);
		}

		/**
		 * Call the CRUDManager callAction method
		 * @param {map} mParams - a map containing the parameters for the CRUDManager callAction method
		 * @param {object} oState
		 * @param {string} sBindingPath - the control's binding path
		 * @private
		 */
		function CRUDManagerCallAction(mParams, oState, sBindingPath) {
			var oResponse;

			// only for oCustomData.Type === "com.sap.vocabularies.UI.v1.DataFieldForAction"
			// DataFieldForIntentBasedNavigation separated within ToolbarButton.fragment, uses other event handler
			// NO ITEM SELECTED: supported - if selection is required then button will be disabled via applicable-path otherwise the button will always be enabled
			// ONE ITEM SELECTED: supported
			// MULTIPLE ITEMS SELECTED: supported
			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				//processing allowed
				// TODO check Denver implementation
				oServices.oCRUDManager.callAction({
					functionImportPath: mParams.functionImportPath,
					contexts: mParams.contexts,
					sourceControl: mParams.sourceControl,
					label: mParams.label,
					operationGrouping: mParams.operationGrouping,
					navigationProperty: mParams.navigationProperty
				}, oState).then(function(aResponses) {
					if (aResponses && aResponses.length && aResponses.length === 1) {
						oResponse = aResponses[0];

						if (oResponse.response && oResponse.response.context && (!oResponse.actionContext || oResponse.actionContext && oResponse.response
								.context.getPath() !== oResponse.actionContext.getPath())) {
							oServices.oViewDependencyHelper.setMeToDirty(oController.getOwnerComponent(), sBindingPath);
						}
					}
				});
			}, jQuery.noop, oState, "Proceed");
		}

		function onDiscardDraft(oEvent) {
			var oSource = oEvent.getSource();
			var oActiveSiblingPromise = getActiveSibling();
			var oDiscardPopover = getDiscardDraftPopover(oActiveSiblingPromise);
			var oDiscardModel = oDiscardPopover.getModel("discard");
			oDiscardModel.setProperty("/placement", sap.m.PlacementType.Top);
			var oContext = oController.getView().getBindingContext();
			var oEntity = oContext.getObject();
			var bIsCreateDraft = oEntity.hasOwnProperty("HasActiveEntity") && !oContext.getProperty("IsActiveEntity") && !oContext.getProperty(
			"HasActiveEntity");
			oDiscardModel.setProperty("/isCreateDraft", bIsCreateDraft);
			oDiscardPopover.openBy(oSource);
		}

		function onDiscardSubItem(oEvent) {
			var oSource = oEvent.getSource();
			var aCustomData = oSource.getCustomData();
			var oDiscardPopover = getDiscardSubItemPopover();
			var oDiscardModel = oDiscardPopover.getModel("discard");
			var sPlacement = aCustomData && aCustomData[0] ? aCustomData[0].getValue() : sap.m.PlacementType.Top;
			oDiscardModel.setProperty("/placement", sPlacement);
			oDiscardPopover.openBy(oSource);
		}

		function addEntry(oEventSource, bSuppressNavigation, oSmartFilterBar) {
			if (oEventSource.data("CrossNavigation")) {
				// intent based navigation
				fnNavigateIntentManifest(oEventSource, oEventSource.getBindingContext(), oSmartFilterBar);
				return new Promise(function(resolve) {
					resolve();
				});
			}

			var oTable = oCommonUtils.getOwnerControl(oEventSource);
			var sTablePath = oTable.getTableBindingPath();
			var oComponent = oController.getOwnerComponent();

			var oReturn = oServices.oCRUDManager.addEntry(oTable).then(
					function(oTargetInfo) {
						if (!bSuppressNavigation) {
							oServices.oNavigationController.navigateToContext(oTargetInfo.newContext,
									oTargetInfo.tableBindingPath, false, 4);
							oServices.oViewDependencyHelper.setMeToDirty(oComponent, sTablePath);
						} else {
							oTable.rebindTable();
						}
					});
			
			oReturn.catch(jQuery.noop);
			return oReturn;
		}
		/**
		 * Event handler for Delete on the List Report
		 * @param {sap.ui.base.Event} oEvent
		 * @public
		 */
		function deleteEntries(oEvent) {
			var oSmartTable = oCommonUtils.getOwnerControl(oEvent.getSource());
			var aSelectedItems = oCommonUtils.getSelectedContexts(oSmartTable);

			if (aSelectedItems && aSelectedItems.length > 0) {
				var mJSONData = getDataForDeleteDialog(aSelectedItems);
				var oDeleteDialog = getDeleteDialog(oSmartTable);
				var oDeleteDialogModel = oDeleteDialog.getModel("delete");

				oDeleteDialogModel.setData(mJSONData);
				oDeleteDialog.open();
			} else {
				MessageBox.error(oCommonUtils.getText("ST_GENERIC_NO_ITEM_SELECTED"), {
					styleClass: oCommonUtils.getContentDensityClass()
				});
			}
		}

		function onContactDetails(oEvent) {
			var oPopover;
			if (oEvent.getSource().data("Location") === "Header") {
				oPopover = oEvent.getSource().getParent().getAggregation("items")[0];
			} else if (oEvent.getSource().data("Location") === "Section") {		//ContactPopUpover in Section 
				oPopover = oEvent.getSource().getParent().getAggregation("items")[0];
			} else if (oEvent.getSource().data("Location") === "SmartTable") {	//ContactPopUpOver in SmartTable
				oPopover = oEvent.getSource().getParent().getAggregation("items")[0];
			} else {
				oPopover = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getAggregation(
						"items")[1];
			}
			oPopover.bindElement(oEvent.getSource().getBindingContext().getPath());
			oPopover.openBy(oEvent.getSource());
		}

		/* eslint-disable */
		var fnBuildSelectionVariantForNavigation = testableHelper.testable(fnBuildSelectionVariantForNavigation, "fnBuildSelectionVariantForNavigation");
		var fnEvaluateParameters = testableHelper.testable(fnEvaluateParameters, "fnEvaluateParameters");
		/* eslint-enable */

		return {
			onBeforeRebindTable: onBeforeRebindTable,
			onBeforeRebindTableFinally: onBeforeRebindTableFinally,
			onListNavigate: onListNavigate,
			onShowDetails: onShowDetails,
			onEditNavigateIntent: fnNavigateIntentManifest,
			onSemanticObjectLinkPopoverLinkPressed: fnSemanticObjectLinkPopoverLinkPressed,
			onDataFieldForIntentBasedNavigation: onDataFieldForIntentBasedNavigation,
			onDataFieldForIntentBasedNavigationSelectedContext: onDataFieldForIntentBasedNavigationSelectedContext,
			onInlineDataFieldForIntentBasedNavigation: onInlineDataFieldForIntentBasedNavigation,
			onDataFieldWithIntentBasedNavigation: onDataFieldWithIntentBasedNavigation,
			onSmartFieldUrlPressed: onSmartFieldUrlPressed,
			onBreadCrumbUrlPressed: onBreadCrumbUrlPressed,
			onCallActionFromToolBar: onCallActionFromToolBar,
			onDiscardDraft: onDiscardDraft,
			onDiscardSubItem: onDiscardSubItem,
			addEntry: addEntry,
			deleteEntries: deleteEntries,
			onContactDetails: onContactDetails
		};
	}

	return BaseObject.extend("sap.suite.ui.generic.template.lib.CommonEventHandlers", {
		constructor: function(oController, oComponentUtils, oServices, oCommonUtils) {
			jQuery.extend(this, getMethods(oController, oComponentUtils, oServices, oCommonUtils));
		}
	});
});