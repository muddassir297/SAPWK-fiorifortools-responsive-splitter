/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
/**
 * Adds support rules to the core
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/supportRules/RuleSet"],
	function(jQuery, Ruleset) {
		"use strict";

		var oLib = {
			name: "sap.viz",
			niceName: "UI5 Charts library"
		};

		var oRuleset = new Ruleset(oLib);

		/**
		 * Checks whether the preload configuration was set correctly to async
		 */
		oRuleset.addRule({
			id : "VizCheck",
			audiences: ["Control","Internal"],
			categories: ["Performance"],
			enabled: true,
			minversion: "1.32",
			maxversion: "-",
			title: "Viz Check",
			description: "Checks whether the preload configuration was set correctly to async",
			resolution: "Add \"data-sap-ui-preload=\"async\"\" to script tag that includes \"sap-ui-core.js\"",
			resolutionurls: [{
				text: "Performance: Speed Up Your App",
				href:"https://sapui5.hana.ondemand.com/#docs/guide/408b40efed3c416681e1bd8cdd8910d4.html"
			}],
			check: function(issueManager, oCoreFacade) {
				jQuery.sap.log.info("It's from the viz library");
			}
		});

		return {
			lib: oLib,
			ruleset: oRuleset
		};
	}, true);
