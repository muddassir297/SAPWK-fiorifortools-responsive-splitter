/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
/**
 * Defines support rules of the List, Table and Tree controls of sap.m library.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library", "../ui/table/TableHelper.support"],
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
	 * Only an example.
	 */
	// TBD remove when a "real" rule is added
	createRule({
		id : "MTABLE_TEST",
		categories: [Categories.Other],
		title : "Just a test for the support rules",
		description : "Test description",
		resolution : "Test resolution",
		enabled : false,
		check : function(oIssueManager, oCoreFacade, oScope) {
			var aLists = SupportHelper.find(oScope, true, "sap/m/Table");
			if (!aLists) { // Do some suitable check instead
				SupportHelper.reportIssue(oIssueManager, "There seems to be no table", Severity.Hint);
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