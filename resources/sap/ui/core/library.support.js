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
			name: "sap.ui.core",
			niceName: "UI5 Core Library"
		};

		var oRuleset = new Ruleset(oLib);

		/**
		 * Checks whether the preload configuration was set correctly to async
		 */
		oRuleset.addRule({
			id : "preloadasynccheck",
			audiences: [sap.ui.support.Audiences.Control, sap.ui.support.Audiences.Internal],
			categories: [sap.ui.support.Categories.Performance],
			enabled: true,
			minversion: "1.32",
			maxversion: "-",
			title: "Preload Configuration",
			description: "Checks whether the preload configuration was set correctly to async",
			resolution: "Add \"data-sap-ui-preload=\"async\"\" to script tag that includes \"sap-ui-core.js\"",
			resolutionurls: [{
				text: "Performance: Speed Up Your App",
				href:"https://sapui5.hana.ondemand.com/#docs/guide/408b40efed3c416681e1bd8cdd8910d4.html"
			}],
			check: function(issueManager, oCoreFacade) {
				if (sap.ui.getCore().getConfiguration().getPreload() !== "async") {
					issueManager.addIssue({
						severity: sap.ui.support.Severity.Error,
						details: "None",
						context: {
							id: "WEBPAGE"
						}
					});
				}
			}
		});

		/**
		 * Checks whether the unsupported fakeOS parameter was used
		 */
		oRuleset.addRule({
			id : "fakeoscheck",
			audiences: [sap.ui.support.Audiences.Internal],
			categories: [sap.ui.support.Categories.Functionality],
			enabled: true,
			minversion: "1.28",
			maxversion: "-",
			title: "Usage of fakeOS parameter",
			description: "Checks whether the unsupported fakeOS parameter was used",
			resolution: "Remove the parameter 'sap-ui-xx-fakeOS' from the URL or the UI5 bootstrap tag.",
			resolutionurls: [],
			check: function(issueManager, oCoreFacade) {
				var FAKE_OS_PATTERN = /(?:\?|&)sap-ui-xx-fakeOS=([^&]+)/;
				var result = document.location.search.match(FAKE_OS_PATTERN);
				var resultUA = result && result[1] || jQuery.sap.byId("sap-ui-bootstrap").attr("data-sap-ui-xx-fakeOS");

				if (resultUA) {
					issueManager.addIssue({
						severity: sap.ui.support.Severity.Error,
						details: "None",
						context: {
							id: "WEBPAGE"
						}
					});
				}
			}
		});

		oRuleset.addRule({
			id : "errorlogs",
			audiences: ["Control","Internal"],
			categories: ["Performance"],
			enabled: true,
			minversion: "1.32",
			maxversion: "-",
			title: "Error logs",
			description: "Checks for the amount of error logs in the console",
			resolution: "Error logs should be fixed",
			resolutionurls: [],
			check: function (issueManager, oCoreFacade) {
				var count = 0,
					message = "";

				var log = jQuery.sap.log.getLog();
				log.forEach(function (logEntry) {
					if (logEntry.level === jQuery.sap.log.Level.ERROR) {
						count++;
						if (count <= 20) {
							message += "- " + logEntry.message + "\n";
						}
					}
				});

				issueManager.addIssue({
					severity: sap.ui.support.Severity.Hint,
					details: "Total error logs: " + count + "\n" + message,
					context: {
						id: "WEBPAGE"
					}
				});
			}
		});


		/**
		 * Checks whether there are orphaned controls
		 */
		oRuleset.addRule({
			id : "orphanedelement",
			audiences: [sap.ui.support.Audiences.Control, sap.ui.support.Audiences.Internal, sap.ui.support.Audiences.Application],
			categories: [sap.ui.support.Categories.Memory],
			enabled: true,
			minversion: "1.32",
			maxversion: "-",
			title: "Controls/Elements that miss a parent",
			description: "Orphaned Controls and Elements might cause memory leaks.",
			resolution: "Call the destroy method of Elements, if they are not needed anymore",
			resolutionurls: [{
				text: "Element destroy",
				href: "https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.core.Element.html#destroy"
			}],
			check: function(issueManager, oCoreFacade, oScope) {
				var mElements = oScope.getElements();
				for (var n in mElements) {
					var oElement = mElements[n];
					if (!oElement.getParent()) {
						issueManager.addIssue({
							severity: sap.ui.support.Severity.Warning,
							details: "The element " + oElement.getId() + " has no parent.",
							context: {
								id: oElement.getId()
							}
						});
					}
				}
			}
		});

		/**
		 * Checks whether there are bindings for models where the model is available but a property binding has no result (is undefined)
		 * It checks the path structure and checks for typos
		 */
		oRuleset.addRule({
			id : "unresolvedpropertybindings",
			audiences: [sap.ui.support.Audiences.Control, sap.ui.support.Audiences.Application],
			categories: [sap.ui.support.Categories.Modelbindings],
			enabled: true,
			minversion: "1.32",
			title: "Unresolved Property Bindings",
			description: "Unresolved bindings might be caused by typos in their path",
			resolution: "Check the binding path for typos",
			resolutionurls: [
				{
					href: "https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.model.Context.html",
					text: "Context class"
				},
				{
					href: "https://sapui5.hana.ondemand.com/#docs/guide/e5310932a71f42daa41f3a6143efca9c.html",
					text: "Data binding"
				},
				{
					href: "https://sapui5.hana.ondemand.com/#docs/guide/97830de2d7314e93b5c1ee3878a17be9.html",
					text: "Aggregation binding with templates"
				},
				{
					href: "https://sapui5.hana.ondemand.com/#docs/guide/6c7c5c266b534e7ea9a28f861dc515f5.html",
					text: "Element binding"
				}
			],
			check: function(issueManager, oCoreFacade, oScope) {
				var mElements = oScope.getElements();
				for (var n in mElements) {
					var oElement = mElements[n],
						mBindingInfos = oElement.mBindingInfos;
					for (var m in mBindingInfos) {
						var oBinding = mBindingInfos[m].binding;
						if (oBinding) {
							if (!(oBinding instanceof sap.ui.model.CompositeBinding) && oBinding instanceof sap.ui.model.PropertyBinding && oBinding.getModel()) {
								if (oBinding.getValue() === undefined) {
									var sPath = oBinding.getPath(),
										oContext = oBinding.getContext();
									if (oContext) {
										issueManager.addIssue({
											severity: sap.ui.support.Severity.Hint,
											details: "Element " + oElement.getId() + " has unresolved bindings.",
											context: {
												id: oElement.getId()
											}
										});
									} else if (!oContext && !jQuery.sap.startsWith(sPath, "/")) {
										issueManager.addIssue({
											severity: sap.ui.support.Severity.Hint,
											details: "Element " + oElement.getId() + " has unresolved bindings.",
											context: {
												id: oElement.getId()
											}
										});
									} else {
										var aParts = sPath.split("/");
										var oData = null;
										while (aParts.length > 0) {
											var oData = oBinding.getModel().getProperty("/" + aParts.join("/"));
											if (oData) {
												var sData = JSON.stringify(oData);
												if (sData.length > 40) {
													sData = sData.substring(0,40) + "...";
												}

												break;
											}
										}
										issueManager.addIssue({
											severity: sap.ui.support.Severity.Hint,
											details: "Element " + oElement.getId() + " has unresolved bindings.",
											context: {
												id: oElement.getId()
											}
										});
									}
								}
							}
						}
					}
				}
			}
		});

		return {
			lib: oLib,
			ruleset: oRuleset
		};
	}, true);
