/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
/**
 * Adds support rules of the sap.m library to the support infrastructure.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library", "sap/ui/support/supportRules/RuleSet", "./ListTable.support"],
	function(jQuery, SupportLib, Ruleset, ListTableSupport) {
	"use strict";

	// shortcuts
	//var Audiences = SupportLib.Audiences, // Control, Internal, Application
	//	Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
	//	Severity = SupportLib.Severity;	// Hint, Warning, Error

	var oLib = {
		name: "sap.ui.comp",
		niceName: "UI5 Smart Controls Library"
	};

	var oRuleset = new Ruleset(oLib);

	// Adds the rules related to sap.ui.comp.smarttable.SmartTable, ...
	ListTableSupport.addRulesToRuleset(oRuleset);

	//Add rules with the addRule method
	//oRuleset.addRule({})

	return {lib: oLib, ruleset: oRuleset};

}, true);