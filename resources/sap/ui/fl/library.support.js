/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
/**
 * Adds support rules of the sap.ui.
 * fl library to the support infrastructure.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library", "sap/ui/support/supportRules/RuleSet", "sap/ui/fl/Utils"],
	function(jQuery, SupportLib, Ruleset, Utils) {
	"use strict";


	var oLib = {
		name: "sap.ui.fl",
		niceName: "UI5 Flexibility Library"
	};

	var oRuleset = new Ruleset(oLib);

	function fnCheckElementIsNoClone(oElement) {
		var bElementIsNoClone = true;

		if (oElement.getBindingContext && oElement.getBindingContext()) {
			var aBindingHierarchy = oElement.getBindingContext().getPath().split("/");
			var sLowestBindingHierarchy = aBindingHierarchy[aBindingHierarchy.length - 1];
			bElementIsNoClone = isNaN(sLowestBindingHierarchy);
		}

		return bElementIsNoClone;
	}

		oRuleset.addRule({
			id : "stableId",
			audiences: [sap.ui.support.Audiences.Application],
			categories: [sap.ui.support.Categories.Functionality],
			enabled: true,
			minversion: "1.25",
			title: "ID for Flexibility Features Not Suitable",
			description: "Checks whether the IDs of controls are suitable to support flexibility features.",
			resolution: "Replace the generated control ID with an explicit ID.\nTo ensure that an update of SAPUI5 with additional flexibility functionality " +
			"will be also available in the shipped application, you must specify an explicit ID for the control.\n" +
			"For more details, see the Developer Guide.",
			resolutionurls: [{
				text: "Developer Guide: Stable IDs",
				href: "https://sapui5.hana.ondemand.com/#docs/guide/f51dbb78e7d5448e838cdc04bdf65403.html"
			}],
			check: function(issueManager, oCoreFacade, oScope) {
				var oAppComponent;

				oScope.getElements().forEach(function(oElement) {
					oAppComponent = oAppComponent || Utils.getAppComponentForControl(oElement);
					var sControlId = oElement.getId();
					var sHasConcatenatedId = sControlId.indexOf("--") !== -1;
					if (!Utils.checkControlId(sControlId, oAppComponent, true) && fnCheckElementIsNoClone(oElement)) {
						if (!sHasConcatenatedId) {
							issueManager.addIssue({
								severity: sap.ui.support.Severity.Error,
								details: "The ID '" + sControlId + "' for the control was generated and flexibility features " +
								"cannot support controls with generated IDs.",
								context: {
									id: sControlId
								}
							});
						} else {
							issueManager.addIssue({
								severity: sap.ui.support.Severity.Hint,
								details: "The ID '" + sControlId + "' for the control was concatenated and has a generated onset.\n" +
								"Therefore, flexibility features are not supported for this control.\n" +
								"To enable the control for flexibility features, you must specify an ID for the control providing the onset.\n" +
								"This control was marked with an error.",
								context: {
									id: sControlId
								}
							});
						}
					}
				});
			}
		});
	return {lib: oLib, ruleset: oRuleset};

}, true);
