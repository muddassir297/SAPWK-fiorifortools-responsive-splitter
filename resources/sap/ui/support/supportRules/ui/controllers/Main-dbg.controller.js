sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/ui/models/SharedModel"
], function (Controller, JSONModel, WindowCommunicationBus, SharedModel) {
	"use strict";
	return Controller.extend("sap.ui.support.supportRules.ui.controllers.Main", {
		onInit: function () {
			this.model = SharedModel;
			this.getView().setModel(this.model);
			this.resizeDown();
			this.initSettingsPopover();
			this.setCommunicationSubscriptions();

			this.hidden = false;
			this.updateShowButton();
		},

		initSettingsPopover: function () {
			this._settingsPopover = sap.ui.xmlfragment("sap.ui.support.supportRules.ui.views.AnalyzeSettings", this);
			this._settingsPopover.setModel(SharedModel);
			this.getView().addDependent(this._oPopover);
		},

		setCommunicationSubscriptions: function () {
			WindowCommunicationBus.subscribe("analyzeFinish", function (data) {
				this.ensureOpened();
				this.model.setProperty("/showProgressIndicator", false);
				this.model.setProperty("/coreStateChanged", false);
				this.model.setProperty("/lastAnalysisElapsedTime", data.elapsedTime);
				this.goToIssues();
			}, this);

			WindowCommunicationBus.subscribe("progressUpdate", function (data) {
				var currentProgress = data.currentProgress,
					pi = this.getView().byId("progressIndicator");

				pi.setDisplayValue(currentProgress + "/" + 100);
				this.model.setProperty("/progress", currentProgress);
			}, this);

			WindowCommunicationBus.subscribe("coreStateChanged", function () {
				this.model.setProperty("/coreStateChanged", true);
			}, this);

			WindowCommunicationBus.subscribe("postAvailableComponents", function (data) {
				this.model.setProperty("/availableComponents", data);
			}, this);
		},

		resizeUp: function () {
			WindowCommunicationBus.publish("resizeFrame", {bigger: true});
		},

		ensureOpened: function () {
			WindowCommunicationBus.publish("ensureOpened");
		},

		resizeDown: function () {
			WindowCommunicationBus.publish("resizeFrame", {bigger: false});
		},

		onAnalyze: function () {
			var selectedRules = this._getSelectedRules(),
				executionContext = this._getExecutionContext();
			WindowCommunicationBus.publish("onAnalyzePressed", {
				selectedRules: selectedRules,
				executionContext: executionContext
			});
			this.model.setProperty("/showProgressIndicator", true);
			this.clearProgressIndicator();
		},

		onViewReport: function () {
			var data = this._getReportData();
			WindowCommunicationBus.publish("onViewReportPressed", data);
		},

		onContextSelect: function (oEvent) {
			if (oEvent.getParameter("selected")) {
				var source = oEvent.getSource(),
					radioKey = source.getCustomData()[0].getValue(),
					execScope = this.model.getProperty("/executionScopes")[radioKey];
				this.model.setProperty("/analyzeContext", execScope);
			}
		},

		onBeforePopoverOpen: function () {
			WindowCommunicationBus.publish("getAvailableComponents");
		},

		onAnalyzeSettings: function (oEvent) {
			WindowCommunicationBus.publish("ensureOpened");
			this._settingsPopover.openBy(oEvent.getSource());
		},

		onDownloadReport: function () {
			var data = this._getReportData();
			WindowCommunicationBus.publish("onDownloadReportPressed", data);
		},

		onNavConAfterNavigate: function (oEvent) {
			var to = oEvent.getParameter("to");
			if (to === this.getView().byId("analysis")) {
				setTimeout(function () {
					to.getController().markLIBAsSelected();
				}, 250);
			}
		},
		_getReportData: function () {
			return {
				executionScopes: this.model.getProperty("/executionScopes"),
				executionScopeTitle: this.model.getProperty("/executionScopeTitle"),
				analysisDurationTitle: this.model.getProperty("/analysisDurationTitle")
			};
		},

		_getExecutionContext: function () {
			var ctx = {
				type: this.model.getProperty("/analyzeContext/key")
			};

			// TODO: these "if"s can be consistently turned into switch with constants
			if (ctx.type === "parent") {
				ctx.parentId = this.model.getProperty("/parentExecutionContextId");
			}

			if (ctx.type === "components") {
				var selectionContainer = sap.ui.getCore().byId("componentsSelectionContainer"),
					cbs = selectionContainer.getContent();

				ctx.components = [];
				cbs.forEach(function (checkBox) {
					if (checkBox.getSelected()) {
						ctx.components.push(checkBox.getText());
					}
				});
			}

			return ctx;
		},

		_getSelectedRules: function () {
			var libs = this.model.getProperty("/libraries"),
				selectedRules = [];

			libs.forEach(function (lib, libIndex) {
				lib.rules.forEach(function (rule) {
					if (rule.selected) {
						selectedRules.push({
							libName: lib.title,
							ruleId: rule.id
						});
					}
				});
			});

			return selectedRules;
		},

		goToAnalysis: function (evt) {
			var navCon = this.getView().byId("navCon");
			navCon.to(this.getView().byId("analysis"), "show");
			this.ensureOpened();
		},

		goToIssues: function () {
			var navCon = this.getView().byId("navCon");
			navCon.to(this.getView().byId("issues"), "show");
			this.ensureOpened();
		},

		goToWiki: function () {
			 window.open('https://uacp2.hana.ondemand.com/viewer/DRAFT/SAPUI5_Internal/57ccd7d7103640e3a187ed55e1d2c163.html','_blank');
		},

		clearProgressIndicator: function () {
			var pi = this.getView().byId("progressIndicator");
			pi.setDisplayValue("None");
			this.model.setProperty("/progress", 0.1);
		},

		setRulesLabel: function (libs) {
			var selectedCounter = 0;
			if (libs === null) {
				return "Manage Rules (" + selectedCounter + ")";
			} else {
				libs.forEach(function (lib, libIndex) {
					selectedCounter += lib.rules.length;
				});
				return "Manage Rules (" + selectedCounter + ")";
			}
		},

		updateShowButton: function () {
			// When hidden is true - the frame is minimized and we show the "show" button
			this.getView().byId("sapSTShowButtonBar").setVisible(this.hidden);
		},

		toggleHide: function () {
			this.hidden = !this.hidden;
			this.updateShowButton();

			WindowCommunicationBus.publish("toggleFrameHidden", this.hidden);
		}
	});
});