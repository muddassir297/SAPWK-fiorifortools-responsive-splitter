/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
/**
 * Defines support rules of the SmartTable, ... controls of sap.ui.comp library.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library", "../table/TableHelper.support"],
	function(jQuery, SupportLib, SupportHelper) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity;	// Hint, Warning, Error
		//Audiences = SupportLib.Audiences; // Control, Internal, Application


	var aRules = [];

	function createRule(oRuleDef) {
		aRules.push(oRuleDef);
	}


	//**********************************************************
	// Rule Definitions
	//**********************************************************


	/*
	 * Check for default ODataModel
	 */
	createRule({
		id: "SMARTTABLE_MODEL_BINDING",
		categories: [Categories.Bindings],
		title: "Model and Binding",
		description: "Checks whether the default/unnamed model is present and is an ODataModel and if the binding makes use of this model",
		resolution: "Ensure that the desired ODataModel is set as an unnamed/default model on the control/view and is used in the binding accordingly",
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aSmartTables = SupportHelper.find(oScope, true, "sap/ui/comp/smarttable/SmartTable");
			var i, iLen = aSmartTables.length, oSmartTable, oModel, oInfo;
			for (i = 0; i < iLen; i++) {
				oSmartTable = aSmartTables[i];
				if (oSmartTable) {
					oModel = oSmartTable.getModel();
					// Check whether default model exists
					if (!oModel) {
						SupportHelper.reportIssue(oIssueManager, "The SmartTable expects a default/unnamed model to be present", Severity.Warning, oSmartTable.getId());
					}
					// Check if default model is an ODataModel (old/v2)
					if (!SupportHelper.isInstanceOf(oModel, "sap/ui/model/odata/ODataModel") && !SupportHelper.isInstanceOf(oModel, "sap/ui/model/odata/v2/ODataModel")) {
						SupportHelper.reportIssue(oIssueManager, "ODataModel should be used as the default/unnamed model", Severity.Warning, oSmartTable.getId());
					}
					// Check if binding on the inner UI5 table is done for an unnamed model
					oInfo = oSmartTable.getTable().getBindingInfo(oSmartTable._sAggregation);
					if (oInfo.model) {
						SupportHelper.reportIssue(oIssueManager, "For binding rows/items of the table in the SmartTable an unnamed (default) model should be used", Severity.Warning, oSmartTable.getId());
					}
				}
			}
		}
	});



	return {
		addRulesToRuleset: function(oRuleset) {
			jQuery.each(aRules, function(idx, oRuleDef){
				SupportHelper.addRuleToRuleset(oRuleDef, oRuleset);
			});
		}
	};

}, true);