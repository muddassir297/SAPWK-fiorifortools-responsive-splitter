sap.ui.define(["jquery.sap.global", "sap/ui/base/Object"], function(jQuery, BaseObject) {
	"use strict";
	/**
	 * Non draft transaction controller to be used in extensions of AnalyticalListPage. Breakout coding can access an instance of
	 * this class via <code>EtensionAPI.getTransactionController</code>. Do not instantiate yourself.
	 *
	 * Note: Only one object can be edited at a given point in time.
	 *
	 * @class
	 * @name sap.suite.ui.generic.template.AnalyticalListPage.extensionAPI.NonDraftTransactionController
	 * @public
	 */

	function getMethods(oTemplateUtils, oController, oState) {
		var sEditingStatus = "none";

		function fnEditFinished() {
			sEditingStatus = "none";
		}

		return /** @lends sap.suite.ui.generic.template.AnalyticalListPage.extensionAPI.NonDraftTransactionController.prototype */ {
			/**
			 * Start editing one list entry
			 *
			 * @param {sap.ui.model.Context} oContext the context identifying the entry to be edited
			 * @public
			 */
			edit: function(oContext) {
				if (!oContext) {
					throw new Error("Nothing to edit provided");
				}
				if (sEditingStatus !== "none") {
					throw new Error("Attempt to edit multiple contexts (" + oContext + ")");
				}
				if (oController.getView().getModel().hasPendingChanges()) {
					throw new Error("Attempt to edit while already pending changes exist");
				}
				sEditingStatus = "editing";
			},
			/**
			 * Cancel editing
			 *
			 * @public
			 */
			cancel: function() {
				if (sEditingStatus !== "editing") {
					throw new Error("Nothing edited");
				}
				oTemplateUtils.oServices.oTransactionController.resetChanges();
				fnEditFinished();
			},
			/**
			 * Save the changes which have been applied to the OData model
			 *
			 * @return {Promise} is resolved when entry is successfully saved and rejected when saving fails
			 * @public
			 */
			save: function() {
				if (sEditingStatus !== "editing") {
					throw new Error("Nothing edited");
				}
				sEditingStatus = "saving";
				var oPromise = oTemplateUtils.oServices.oTransactionController.triggerSubmitChanges();
				oPromise.then(fnEditFinished, function() {
					sEditingStatus = "editing";
				});
				return oPromise;
			}
		};
	}

	return BaseObject.extend("sap.suite.ui.generic.template.AnalyticalListPage.extensionAPI.NonDraftTransactionController", {
		constructor: function(oTemplateUtils, oController, oState) {
			jQuery.extend(this, getMethods(oTemplateUtils, oController, oState));

		}
	});
});
