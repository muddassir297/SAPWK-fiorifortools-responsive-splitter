sap.ui.define(["jquery.sap.global", "sap/ui/base/Object", "sap/ui/model/Context", "sap/suite/ui/generic/template/lib/MessageUtils"],
	function(jQuery, BaseObject, Context, MessageUtils) {
		"use strict";

		function create(oDraftController, sEntitySet, sBindingPath, oModel, setEditableNDC) {
			sBindingPath = sBindingPath || "/" + sEntitySet;
			return new Promise(function(resolve, reject) {
				if (oDraftController.getDraftContext().isDraftEnabled(sEntitySet)) {
					oDraftController.createNewDraftEntity(sEntitySet, sBindingPath).then(function(oResponse) {
						resolve(oResponse.context);
					}, function(oError) {
						reject(oError);
					});
				} else {
					setEditableNDC(true);
					return resolve(oModel.createEntry(sBindingPath, {
						batchGroupId: "Changes",
						changeSetId: "Changes"
					}));
				}
			});
		}

		function fnReadDraftAdminstrativeData(oModel, sBindingPath, oTemplateContract) {
			var oPromise = new Promise(function(resolve, reject) {
				oModel.read(sBindingPath, {
					urlParameters: {
						"$expand": "DraftAdministrativeData"
					},
					success: function(oResponse) {
						resolve(oResponse);
					},
					error: function(oResponse) {
						reject(oResponse);
					}
				});
			});
			// not really needed for navigation (as there is always another promise still running), but maybe for internal
			// edit - and it doesn't hurt anyway
			oTemplateContract.oBusyHelper.setBusy(oPromise, true);
			return oPromise;
		}

		/*
		 * Calls the propertyChanged method in the transaction controller and takes care of error handling
		 *
		 * @param {string} sPath Path to the changed property
		 * @param {sap.ui.model.Context} oContext The given binding context
		 * @param {object} oTemplateContract Reference to TemplateContract
		 * @returns {Promise} A <code>Promise</code> for asynchronous execution
		 * @private
		 */
		function propertyChange(sPath, oContext, oTemplateContract, oAppComponent) {
			var oApplicationController = oAppComponent.getApplicationController();

			if (!oApplicationController.getTransactionController().getDraftController().getDraftContext().hasDraft(oContext)) {
				return Promise.resolve();
			}

			return oApplicationController.propertyChanged(sPath, oContext).catch(
				function(oError) {
					/* TODO: change handleError API
				 we anyway want to modify the API for the handleError method. Until then we use the
				 mParameters to pass the needed resourceBundle and navigation Controller
							 */
							 
					oTemplateContract.oApplicationProxy.getResourceBundleForEditPromise().then(function(oResourceBundle){		 
						var oNavigationController = oAppComponent.getNavigationController();
						var oModel = oAppComponent.getModel();

						MessageUtils.handleError(MessageUtils.operations.modifyEntity, null, null, oError, {
							resourceBundle: oResourceBundle,
							navigationController: oNavigationController,
							model: oModel
						});

						MessageUtils.handleTransientMessages(oTemplateContract.oApplicationProxy.getDialogFragment);
					});
				}
			);
		}

		function fnUnsavedChangesDialog(oTemplateContract, oDraftAdministrativeData, fnBeforeDialogCallback) {
			return new Promise(function(resolve, reject) {
				var oUnsavedChangesDialog = oTemplateContract.oApplicationProxy.getDialogFragment(
					// todo: To avoid this undesired call from lib to object page, maybe the fragment should be moved to lib
					"sap.suite.ui.generic.template.ObjectPage.view.fragments.UnsavedChangesDialog", {
						onEdit: function() {
							oUnsavedChangesDialog.close();
							resolve();
						},
						onCancel: function() {
							oUnsavedChangesDialog.close();
							reject();
						}
					}, "Dialog");
				var sUnsavedChangesQuestion = oTemplateContract.getText("DRAFT_LOCK_EXPIRED", [oDraftAdministrativeData.LastChangedByUserDescription ||
					oDraftAdministrativeData.LastChangedByUser
				]);
				oUnsavedChangesDialog.getModel("Dialog").setProperty("/unsavedChangesQuestion", sUnsavedChangesQuestion);
				// promise from navigation controller needs to be resolved, as otherwise busyHelper would block the dialog
				(fnBeforeDialogCallback || jQuery.noop)();
				oTemplateContract.oBusyHelper.getUnbusy().then(function() {
					oUnsavedChangesDialog.open();
				});
			});
		}

		function edit(oTransactionController, sEntitySet, sBindingPath, oModel, oTemplateContract,
			fnBeforeDialogCallback) {
			var oDraftContext = oTransactionController.getDraftController().getDraftContext();
			var oBindingContext = new Context(oModel, sBindingPath);
			if (oDraftContext.isDraftEnabled(sEntitySet)) {
				// todo: enable preserveChanges
				if (true || !oDraftContext.hasPreserveChanges(oBindingContext)) {
					return new Promise(function(resolve, reject) {
						fnReadDraftAdminstrativeData(oModel, sBindingPath, oTemplateContract).then(
							function(oResponse) {
								if (!oResponse.DraftAdministrativeData || oResponse.DraftAdministrativeData.DraftIsCreatedByMe) {
									// no or own draft
									resolve(oTransactionController.editEntity(oBindingContext, false));
								} else if (oResponse.DraftAdministrativeData.InProcessByUser) { // locked
									reject({
										lockedByUser: oResponse.DraftAdministrativeData.InProcessByUserDescription || oResponse.DraftAdministrativeData.InProcessByUser
									});
								} else { // unsaved changes
									fnUnsavedChangesDialog(oTemplateContract, oResponse.DraftAdministrativeData,
										fnBeforeDialogCallback).then(
										function() {
											resolve(oTransactionController.editEntity(oBindingContext, false));
										},
										function() {
											reject({
												lockedByUser: oResponse.DraftAdministrativeData.LastChangedByUserDescription || oResponse.DraftAdministrativeData.LastChangedByUser
											});
										});
								}
							},
							function(oResponse) {
								// DraftAdminData read failed
								reject({
									draftAdminReadResponse: oResponse
								});
							});

					});
				}
			} else {
				oTemplateContract.oApplicationProxy.setEditableNDC(true);
				return Promise.resolve({
					context: oBindingContext
				});
			}
		}

		return {
			create: create,
			edit: edit,
			propertyChange: propertyChange
		};
	}
);