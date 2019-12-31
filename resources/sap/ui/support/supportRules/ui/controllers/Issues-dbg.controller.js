sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/support/supportRules/ElementTree"
], function ($, Controller, JSONModel, CommunicationBus, SharedModel, ElementTree) {
	"use strict";

	var mIssueSettings = {
		severitytexts: {
			Error: "Error",
			Warning: "Warning",
			Hint: "Information",
			All: "All Severities"
		},
		severitystates: {
			Error: "Error",
			Warning: "Warning",
			Hint: "None",
			All: "None"
		},
		severityicons: {
			Error: "sap-icon://message-error",
			Warning: "sap-icon://message-warning",
			Hint: "sap-icon://message-information",
			All: "sap-icon://multiselect-all"
		}
	};

	return Controller.extend("sap.ui.support.supportRules.ui.controllers.Issues", {
		onInit: function () {
			CommunicationBus.subscribe("analyzeFinish", function (data) {
				var problematicControlsIds = {};

				data.issues.forEach(function (issue) {
					if (!issue.context || !issue.context.id) {
						return;
					}

					if (!problematicControlsIds[issue.context.id]) {
						problematicControlsIds[issue.context.id] = [issue.name];
					} else {
						problematicControlsIds[issue.context.id].push(issue.name);
					}

				});
				this.model.setSizeLimit(1000);
				this.model.setProperty("/issues", data.issues);
				this.model.setProperty("/selectedIssue", data.issues[0]);
				this.model.setProperty('/analyzePressed', true);
				this.model.setProperty("/visibleIssuesCount", data.issues.length);
				this.elementTree.setData({
					controls: data.elementTree,
					issuesIds: problematicControlsIds
				});
				this.clearFilters();
			}, this);

			this.model = SharedModel;
			this.getView().setModel(this.model);
			this.clearFilters();
		},
		onAfterRendering: function () {
			var that = this;
			this.elementTree = new ElementTree(this.getView().byId("elementTreeContainer").getId(), {
				onIssueCountClicked: function (selectedElementId) {
					that.clearFilters();
					that.model.setProperty("/elementFilter", selectedElementId);
					that.updateIssuesVisibility();
				},
				onHoverChanged: function (hoveredElementId) {
					CommunicationBus.publish("treeElementHover", hoveredElementId);
				}
			});
		},
		clearFilters: function () {
			this.model.setProperty("/severityFilter", "All");
			this.model.setProperty("/categoryFilter", "All");
			this.model.setProperty("/elementFilter", "All");
			this.model.setProperty("/audienceFilter", "All");
			this.updateIssuesVisibility();
		},
		clearFiltersAndElementSelection: function () {
			this.clearFilters();
			this.elementTree.clearSelection();
		},
		onIssuePressed: function (event) {
			var pressedLi = event.mParameters.listItem,
				selectedIssue = pressedLi.getBindingContext().getObject();
			this.model.setProperty("/selectedIssue", selectedIssue);
			this.elementTree.setSelectedElement(selectedIssue.context.id, false);
		},
		openDocumentation: function (oEvent) {
			var link = sap.ui.getCore().byId(oEvent.mParameters.id),
				url = link.getBindingContext().getProperty("href");
			CommunicationBus.publish("openUrl", url);
		},
		updateIssuesVisibility: function () {
			var visibleIssuesCount = 0;
			var issuesList = this.getView().byId("issuesList");
			issuesList.getItems().forEach(function (item) {
				item.updateProperty("visible");
			});

			issuesList.getItems().forEach(function (item) {
				if (item.getVisible()) {
					visibleIssuesCount++;
				}
			});
			this.model.setProperty("/visibleIssuesCount", visibleIssuesCount);
		},
		filterIssueListItems: function (issue) {
			var sevFilter = this.model.getProperty("/severityFilter"),
				sevFilterApplied = issue.severity === sevFilter || sevFilter === 'All',
				catFilter = this.model.getProperty("/categoryFilter"),
				catFilterApplied = $.inArray( catFilter, issue.categories ) > -1 || catFilter === 'All',
				elementFilter = this.model.getProperty("/elementFilter"),
				elementFilterApplied =  elementFilter ===  issue.context.id || elementFilter === 'All',
				audFilter = this.model.getProperty("/audienceFilter"),
				audienseFilterApplied =  $.inArray( audFilter, issue.audiences ) > -1 || audFilter === 'All';

			return sevFilterApplied && catFilterApplied && elementFilterApplied && audienseFilterApplied;
		},
		filterSevirityIcon: function(sValue) {
			return mIssueSettings.severityicons[sValue];
		},
		filterSevirityState: function(sValue) {
			return mIssueSettings.severitystates[sValue];
		},
		filterSevirityText: function(sValue) {
			return mIssueSettings.severitytexts[sValue];
		}
	});
});