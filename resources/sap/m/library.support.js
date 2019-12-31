/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
/**
 * Adds support rules of the sap.m library to the support infrastructure.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library", "sap/ui/support/supportRules/RuleSet", "./ListTableTree.support"],
	function(jQuery, SupportLib, Ruleset, ListTableTreeSupport) {
	"use strict";

	// shortcuts
	//var Audiences = SupportLib.Audiences, // Control, Internal, Application
	//	Categories = SupportLib.Categories, // Accessibility, Performance, Memory, Modelbindings, ...
	//	Severity = SupportLib.Severity;	// Hint, Warning, Error

	var oLib = {
		name: "sap.m",
		niceName: "UI5 Main Library"
	};

	var oRuleset = new Ruleset(oLib);

	// Adds the rules related to sap.m.List, sap.m.Table and sap.m.Tree
	ListTableTreeSupport.addRulesToRuleset(oRuleset);

	//Add rules with the addRule method
	//oRuleset.addRule({})

	/**
	 * Checks whether the correct type of layout data is set for flex items
	 */
	oRuleset.addRule({
		id : "flexitemdatatype",
		audiences: [sap.ui.support.Audiences.Application],
		categories: [sap.ui.support.Categories.Functionality],
		enabled: true,
		minversion: "1.28",
		title: "Incorrect Flex Item Data Type",
		description: "Checks whether the correct type of layout data is set for flex items",
		resolution: "Use sap.m.FlexItemData for the layout data of flex items (the child controls of a sap.m.FlexBox\/HBox\/VBox)",
		resolutionurls: [{
			text: "Functionality: Use the correct flex item data type",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.m.FlexItemData.html"
		}],
		check: function(issueManager, oCoreFacade, oScope) {
			oScope.getElements().filter(function(oElement) {
				var oType = sap.ui.require("sap/m/FlexBox");
				return !!(oType && (oElement instanceof oType));
			}).forEach(function(oElement) {
				oElement.getItems().filter(function(oItem) {
					return (oItem.getLayoutData() && !(oItem.getLayoutData() instanceof sap.m.FlexItemData));
				}).forEach(function(oItem) {
					issueManager.addIssue({
						severity: sap.ui.support.Severity.Error,
						details: "Layout data set on " + oItem.getId() + " is not an instance of sap.m.FlexItemData.",
						context: {
							id: oItem.getId()
						}
					});
				});
			});
		}
	});

	/**
	 * Checks whether the FlexBox render type has been set explicitly
	 */
	oRuleset.addRule({
		id : "flexboxrendertype",
		audiences: [sap.ui.support.Audiences.Application],
		categories: [sap.ui.support.Categories.Functionality],
		enabled: true,
		minversion: "1.42",
		title: "Explicit setting for FlexBox render type",
		description: "Checks whether the FlexBox render type has been set explicitly",
		resolution: "In most cases, 'Bare' is the best default choice for the render type of a sap.m.FlexBox\/HBox\/VBox to avoid browser inconsistencies. It must be set explicitly.",
		resolutionurls: [{
			text: "Functionality: Set the render type to 'Bare'",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.m.FlexRendertype.html"
		}],
		check: function(issueManager, oCoreFacade, oScope) {
			oScope.getElements().filter(function(oElement) {
				var oType = sap.ui.require("sap/m/FlexBox");
				return !!(oType && (oElement instanceof oType) && !oElement.mProperties.hasOwnProperty("renderType"));
			}).forEach(function(oItem) {
				issueManager.addIssue({
					severity: sap.ui.support.Severity.Hint,
					details: "No explicit setting for the render type of " + oItem.getId() + ".",
					context: {
						id: oItem.getId()
					}
				});
			});
		}
	});

	return {lib: oLib, ruleset: oRuleset};

}, true);