/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
		"jquery.sap.global",
		"sap/ui/base/ManagedObject",
		"sap/ui/model/json/JSONModel",
		"sap/ui/support/supportRules/Analyzer",
		"sap/ui/support/supportRules/CoreFacade",
		"sap/ui/support/supportRules/ExecutionScope",
		"sap/ui/support/supportRules/Highlighter",
		"sap/ui/support/supportRules/WindowCommunicationBus",
		"sap/ui/support/supportRules/RuleSerializer",
		"sap/ui/support/supportRules/RuleSet",
		"sap/ui/support/supportRules/IssueManager",
		"sap/ui/support/supportRules/DataCollector",
		"sap/ui/support/supportRules/ReportProvider"
	],
	function (jQuery, ManagedObject, JSONModel, Analyzer, CoreFacade,
			ExecutionScope, Highlighter, CommunicationBus, RuleSerializer,
			Ruleset, IssueManager, DataCollector, ReportProvider) {
		"use strict";

		var IFrameController = null;
		var oMain = null;

		/**
		 * Controller for the support tools
		 * Provides integration with respective data services
		 */
		var Main = ManagedObject.extend("sap.ui.support.Main", {
			constructor: function () {
				if (!oMain) {
					var that = this;
					this._oCore = null;
					this._rulesCreated = false;
					this._mRulesets = {};
					this._setCommunicationSubscriptions();
					this._oAnalyzer = new Analyzer();
					ManagedObject.apply(this, arguments);

					jQuery.sap.support = {
							analyze: function () {
								return oMain.analyzeAll();
							},
							getIssueHistory: function () {
								if (that._oAnalyzer.running()) {
									return null;
								}

								return IssueManager.getHistory();
							}
							
					};
					var evt = document.createEvent("CustomEvent");
					evt.initCustomEvent("supportToolLoaded", true, true, {});
					
				} else {
					jQuery.sap.log.warning("Only one support tool allowed");

					return oMain;
				}
			}
		});

		/**
		 * This controller is started by the core as plugin
		 */
		Main.prototype.startPlugin = function () {
			var that = this;
			sap.ui.getCore().registerPlugin({
				startPlugin: function (oCore) {
					that._oCore = oCore;
					that._oDataCollector = new DataCollector(oCore);
					that._oCoreFacade = CoreFacade(oCore);
					that._oExecutionScope = null;
					that._createCoreSpies();
					oCore.attachLibraryChanged(that._onLibraryChanged, that);

					var supportModeConfig = oCore.getConfiguration()["xx-support"];

					if (supportModeConfig.indexOf("silent") === -1) {
						// Lazily, asynchronously load the frame controller
						sap.ui.require([
							"sap/ui/support/supportRules/ui/IFrameController"
						], function(IFrameCtrl) {
							IFrameController = IFrameCtrl;
							IFrameController.injectFrame();
						});
					} else {
						that._updatesupportRules();
					}
				},
				stopPlugin: function () {
					IFrameController._stop();
					that._oCore = null;
					that._oCoreFacade = null;
					that._oDataCollector = null;
					that._oExecutionScope = null;
				}
			});
		};

		Main.prototype._onLibraryChanged = function (oEvent) {
			if (oEvent.getParameter("stereotype") === "library" && this._rulesCreated) {
				this._updatesupportRules();
			}
		};

		Main.prototype._createCoreSpies = function () {
			var that = this,
				notifyDirtyStateInterval = 500;

			this._dirtyTimeoutHandle = null;

			var spyFunction = function (fnName) {
				var oldFunction = that._oCore[fnName];
				that._oCore[fnName] = function () {
					oldFunction.apply(that._oCore, arguments);
					/**
					 * If we have 50 new elements in the core, don't send 50 new messages for
					 * dirty state instead wait 500ms and send one message.
					 */
					clearTimeout(that._dirtyTimeoutHandle);
					that._dirtyTimeoutHandle = setTimeout(function () {
						CommunicationBus.publish("coreStateChanged");
					}, notifyDirtyStateInterval);
				};
			};

			spyFunction("registerElement");
			spyFunction("deregisterElement");
		};

		Main.prototype._setCommunicationSubscriptions = function () {
			CommunicationBus.subscribe("verifyNewRule", function (tempRuleSerialized) {
				var tempRule = RuleSerializer.deserialize(tempRuleSerialized),
					tempRuleSet = this._mRulesets.temporary.ruleset,
					result = tempRuleSet.addRule(tempRule);
				CommunicationBus.publish("verifyRuleCreateResult", {
					result: result,
					newRule: RuleSerializer.serialize(tempRule)
				});
			}, this);

			CommunicationBus.subscribe("verifyUpdateRule", function (data) {
				var tempRule = RuleSerializer.deserialize(data.updateObj),
					tempRuleSet = this._mRulesets.temporary.ruleset,
					result = tempRuleSet.updateRule(data.oldId, tempRule);
				CommunicationBus.publish("verifyRuleUpdateResult", {
					result: result,
					updateRule: RuleSerializer.serialize(tempRule)
				});
			}, this);

			CommunicationBus.subscribe("getAvailableComponents", function () {
				CommunicationBus.publish("postAvailableComponents", Object.keys(this._oCore.mObjects.component));
			}, this);

			CommunicationBus.subscribe("onAnalyzePressed", function (data) {
				this.analyze(data.selectedRules, data.executionContext);
			}, this);

			CommunicationBus.subscribe("analysisInit", function () {
				this._updatesupportRules();
			}, this);

			CommunicationBus.subscribe("onViewReportPressed", function (reportConstants) {
				var data = this._getReportData(reportConstants);
				var html = ReportProvider.getReportHtml(data);
				var reportWindow = window.open("", "_blank");
				// Sometimes document.write overwrites the document html and sometimes it appends to it so we need a wrapper div.
				if (reportWindow.document.getElementById("sap-report-content")) {
					reportWindow.document.getElementById("sap-report-content").innerHtml = html;
				} else {
					reportWindow.document.write('<div id="sap-report-content">' + html + '</div>');
				}
				reportWindow.document.title = "Report";
			}, this);

			CommunicationBus.subscribe("onDownloadReportPressed", function (reportConstants) {
				var data = this._getReportData(reportConstants);
				var html = ReportProvider.getReportHtml(data);
				var report = '<!DOCTYPE HTML><html><head><title>Report</title></head><body><div id="sap-report-content">' + html + '</div></body></html>';
				var issues = { "issues": data.issues };
				var appInfos = { "appInfos": data.application };
				this._oDataCollector.add("technicalInfo.json", data.technical, "json");
				this._oDataCollector.add("issues.json", issues, "json");
				this._oDataCollector.add("appInfos.json", appInfos, "json");
				this._oDataCollector.add("report.html", report);
				this._oDataCollector.download();
				this._oDataCollector.clear();
			}, this);

			CommunicationBus.subscribe("markElement", function (id) {
				var $domElem = sap.ui.getCore().byId(id).$();
				$domElem.css("background-color", "red");
			}, this);

			CommunicationBus.subscribe("openUrl", function (url) {
				var win = window.open(url, "_blank");
				win.focus();
			}, this);

			CommunicationBus.subscribe("treeElementHover", function (elementId) {
				Highlighter.highlight(elementId);
			}, this);

			CommunicationBus.subscribe("toggleFrameHidden", function (hidden) {
				IFrameController.toggleHide(hidden);
			});
		};

		Main.prototype._updatesupportRules = function () {
			var mLibraries = sap.ui.getCore().getLoadedLibraries();
			for (var n in mLibraries) {
				try {
					if (!this._mRulesets[n]) {
						sap.ui.requireSync([n.replace(/\./g, "/") + "/library.support"]);
						this._mRulesets[n] = jQuery.sap.getObject(n).library.support;
					}
				} catch (ex) {
					jQuery.sap.log.info("No support file found.");
				}
			}

			this._initTempRulesLib();
			this._rulesCreated = true;

			CommunicationBus.publish("updatesupportRules", RuleSerializer.serialize(this._mRulesets));
		};

		Main.prototype._initTempRulesLib = function () {
			if (this._mRulesets.temporary) {
				return;
			}

			this._mRulesets.temporary = {
				lib: {
					name: "temporary"
				},
				ruleset: new Ruleset({
					name: "temporary",
					niceName: "Temporary ruleset"
				})
			};
		};

		Main.prototype.analyze = function (ruleDescriptors, executionContext) {
			if (this._oAnalyzer && this._oAnalyzer.running()) {
				return;
			}

			this._oAnalyzer.reset();

			var that = this;

			this._oExecutionScope = ExecutionScope(this._oCore, executionContext);
			ruleDescriptors.forEach(function (ruleDescriptor) {
				var libWithRules = that._mRulesets[ruleDescriptor.libName],
					executedRule = libWithRules.ruleset.getRules()[ruleDescriptor.ruleId];
					that._oAnalyzer.addTask([executedRule.title], function (oObject) {
						that._analyzeSupportRule(oObject, executionContext);
					}, [executedRule]);
			});

			IssueManager.clearIssues();

			return this._oAnalyzer.start();
		};

		/**
		 * @returns {promise} to notify of finished state
		 */
		Main.prototype.analyzeAll = function () {
			if (this._oAnalyzer && this._oAnalyzer.running()) {
				return;
			}

			this._oAnalyzer.reset();

			var that = this;

			this._oExecutionScope = ExecutionScope(this._oCore, {
				type: "core"
			});
			Object.keys(that._mRulesets).map(function (libName) {
				var rulesetRules = that._mRulesets[libName].ruleset.getRules();
				Object.keys(rulesetRules).map(function(ruleId) {
					var rule = rulesetRules[ruleId];
					that._oAnalyzer.addTask([rule.title], function (oObject) {
						that._analyzeSupportRule(oObject, {type: "core"});
					}, [rule]);
				});
			});
			IssueManager.clearIssues();
			return this._oAnalyzer.start();
		};

		/**
		 * Called after the analyzer finished and reports whether there are issues or not.
		 */
		Main.prototype._done = function () {
			var issues = this._createIssuesViewModel(),
				elementTree = this._createElementTree();

			CommunicationBus.publish("analyzeFinish", {
				issues: issues,
				elementTree: elementTree,
				elapsedTime: this._oAnalyzer.getElapsedTimeString()
			});
		};

		Main.prototype._createElementTree = function () {
			var	contextElements = this._copyElementsStructure(),
				elementTree = [];

			this._setContextElementReferences(contextElements);

			for (var i in contextElements) {
				if (contextElements[i].skip) {
					continue;
				}
				elementTree.push(contextElements[i]);
			}

			return [{
				content: elementTree,
				id: "WEBPAGE",
				name: "WEBPAGE"
			}];
		};

		Main.prototype._setContextElementReferences = function (contextElements) {
			var coreElements = this._oCore.mElements;

			for (var elementId in contextElements) {
				var element = contextElements[elementId],
					parent = coreElements[elementId] == undefined ? undefined : coreElements[elementId].getParent();

				if (coreElements[elementId] instanceof sap.ui.core.ComponentContainer) {
					var componentContainer = coreElements[elementId],
						componentId = componentContainer.getComponent();
					element.content.push(contextElements[componentId]);
					contextElements[componentId].skip = true;
				}

				if (parent) {
					var parentId = parent.getId();
					if (!contextElements[parentId]) {
						continue;
					}
					contextElements[parentId].content.push(contextElements[elementId]);
					contextElements[elementId].skip = true;
				}
			}
		};

		// TODO: the element crushing needs to be encapsulated on it's own 
		Main.prototype._copyElementsStructure = function () {
			var copy = {},
				that = this;

			var copyElementsFromCoreObject = function (coreObject, elemNames) {
				for (var i in coreObject) {
					var element = coreObject[i],
						elementCopy = {
							content: [],
							id: element.getId(),
							name: (elemNames == undefined) ? element.getMetadata().getName() : elemNames
						};
					copy[element.getId()] = elementCopy;
				}
			};

			copyElementsFromCoreObject(this._oExecutionScope.getElements());

			this._oExecutionScope.getElements().forEach(function (element) {
				if (element instanceof sap.ui.core.ComponentContainer) {
					var componentId = element.getComponent(),
						component = that._oCore.mObjects.component[componentId];
					copyElementsFromCoreObject([component], "sap-ui-component");
				}
			});

			// TODO: we need to make those "case"s using constants
			switch (this._oExecutionScope._getType()) {
				case "core":
					copyElementsFromCoreObject(this._oCoreFacade.getUIAreas(), "sap-ui-area");
					copyElementsFromCoreObject(this._oCoreFacade.getComponents(), "sap-ui-component");
					break;

				case "parent":
					var parentId = this._oExecutionScope._getContext().parentId;
					copyElementsFromCoreObject([this._oCore.mElements[parentId]]);
					break;

				case "components":
					var components = this._oExecutionScope._getContext().components;
					components.forEach(function (componentId) {
						copyElementsFromCoreObject([that._oCore.mObjects.component[componentId]], "sap-ui-component");
					});
					break;
			}

			return copy;
		};

		Main.prototype._createIssuesViewModel = function () {
			var viewModel = [];
			IssueManager.walkIssues(function (issue) {
				//TODO: What is the ID of the core ?!
				var className = issue.context.id === "WEBPAGE" ? "sap.ui.core" : sap.ui.getCore().byId(issue.context.id).getMetadata().getName();
				viewModel.push({
					severity: issue.severity,
					name: issue.rule.title,
					description: issue.rule.description,
					resolution: issue.rule.resolution,
					resolutionUrls: issue.rule.resolutionurls,
					audiences: issue.rule.audiences,
					categories: issue.rule.categories,
					details: issue.details,
					ruleLibName: issue.rule.libName,
					ruleId: issue.rule.id,
					context: {
						className: className,
						id: issue.context.id
					}
				});
			});

			return viewModel;
		};

		Main.prototype._getReportData = function (reportConstants) {
			return {
				issues: this._createIssuesViewModel(),
				technical: this._oDataCollector.getTechInfoJSON(),
				application: this._oDataCollector.getAppInfo(),
				scope: {
					executionScope: this._oExecutionScope,
					scopeDisplaySettings: {
						executionScopes: reportConstants.executionScopes,
						executionScopeTitle: reportConstants.executionScopeTitle
					}
				},
				analysisDuration: this._oAnalyzer.getElapsedTimeString(),
				analysisDurationTitle: reportConstants.analysisDurationTitle
			};
		};

		/**
		 * Callback for checking a support rule from the analyzer
		 *
		 * @param oRule
		 */
		Main.prototype._analyzeSupportRule = function (oRule, executionContext) {
			oRule.check(IssueManager.createCheckFunctionProxy(oRule), this._oCoreFacade, this._oExecutionScope);

			CommunicationBus.publish("progressUpdate", {
				currentProgress: this._oAnalyzer.getProgress()
			});

			if (this._iDoneTimer) {
				jQuery.sap.clearDelayedCall(this._iDoneTimer);
			}

			this._iDoneTimer = jQuery.sap.delayedCall(100, this, "_done");
		};

		var oMain = new Main();

		return oMain;

	}, true);
