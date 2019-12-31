sap.ui.define([
	"jquery.sap.global", 
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Panel",
	"sap/m/List",
	"sap/m/ListItemBase",
	"sap/m/StandardListItem",
	"sap/m/InputListItem",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/support/supportRules/RuleSerializer"
], function ($, Controller, JSONModel, Panel, List, ListItemBase, StandardListItem, InputListItem, Button, Toolbar, ToolbarSpacer,
		Label, MessageToast, CommunicationBus, SharedModel, RuleSerializer) {
	"use strict";
	return Controller.extend("sap.ui.support.supportRules.ui.controllers.Analysis", {
		onInit: function () {
			this.model = SharedModel;
			this.setCommunicationSubscriptions();
			
			CommunicationBus.publish("analysisInit");

			this.hackListItemBase();
			this.getView().setModel(this.model);
		},
		setCommunicationSubscriptions: function () {
			CommunicationBus.subscribe("updatesupportRules", this.updatesupportRules, this);

			CommunicationBus.subscribe("verifyRuleCreateResult", function (data) {
				var result = data.result,
					newRule = RuleSerializer.deserialize(data.newRule, true);
				if (result == "success") {
					this.model.getProperty("/libraries").forEach(function (lib) {
						if (lib.title == "temporary") {
							lib.rules.push(newRule);
						}
					});
					
					var emptyRule = this.model.getProperty("/newEmptyRule");
					this.model.setProperty("/newRule", jQuery.extend(true, {}, emptyRule));
					this.goToRuleProperties();
					this.createRulesUI();
					var lastPanelItemIndex = this.getView().byId("ruleSetContainer").getContent().length - 1;
					var lastPanelItem = this.getView().byId("ruleSetContainer").getContent()[lastPanelItemIndex];
					lastPanelItem.setExpanded(true);
					 this.model.setProperty("/selectedRule", newRule);
				} else {
					MessageToast.show("Add rule failed because: " + result);
				}
			}, this);

			CommunicationBus.subscribe("verifyRuleUpdateResult", function (data) {
				var result = data.result,
					updateRule = RuleSerializer.deserialize(data.updateRule, true);

				if (result === "success") {
					var ruleSource = this.model.getProperty("/editRuleSource");
					var libraries = this.model.getProperty('/libraries');
					libraries.forEach(function(lib, libIndex){
						if (lib.title === 'temporary') {
							lib.rules.forEach(function(rule, ruleIndex){
								if (rule.id === ruleSource.id) {
									lib.rules[ruleIndex] = updateRule;
								}
							});
						}
					});

					this.model.checkUpdate(true);
					this.model.setProperty('/selectedRule', updateRule);

					this.goToRuleProperties();
				} else {
					MessageToast.show("Update rule failed because: " + result);
				}
			}, this);
		},
		createNewRulePress: function(oEvent) {
			var oItem = oEvent.getParameter("item"),
				actionToTake = oItem.getText();
			if (actionToTake === 'New Rule') {
				var emptyRule = this.model.getProperty("/newEmptyRule");
				this.model.setProperty("/newRule", jQuery.extend(true, {}, emptyRule));
				this.goToCreateRule();
			} else {
				var selectedRuleCopy = jQuery.extend(true, {}, this.model.getProperty("/selectedRule"));
				this.model.setProperty("/newRule", selectedRuleCopy);
				this.model.checkUpdate(true, false);
				this.goToCreateRule();
			}
		},
		goToRuleProperties: function () {
			var navCont = this.getView().byId("rulesNavContainer");
			navCont.to(this.getView().byId("rulesDisplayPage"), "show");
		},
		/**
		 * Here we need a new behavior for the sap.m.List - we need to be able to both click on the checkbox,
		 * and click on the whole list item, and those 2 clicks to be separate from each other (with separate
		 * event handlers) 
		 * In our case 1 list is the rules for 1 library, we have more than one list, and we need the select 
		 * state to also be shared between 2 or more lists (visualy).
		 * Could be implemented with extension control of the list item, but because we are in iframe this is also fine.
		 */
		hackListItemBase: function () {
			var that = this,
				oldTap = ListItemBase.prototype.ontap,
				oldUpdateSelectedDom = ListItemBase.prototype.updateSelectedDOM,
				oldAfterRendering = ListItemBase.prototype.onAfterRendering;

			ListItemBase.prototype.onAfterRendering = function () {
				oldAfterRendering.apply(this, arguments);
				if (this.getParent().getMode() === "MultiSelect") {
					this.$().removeClass("sapMLIBSelected");
				}
			};

			ListItemBase.prototype.ontap = function (oEvent) {
				if (this.getParent().getMode() !== "MultiSelect") {
					oldTap.call(this, oEvent);
					return;
				}
				if ($(oEvent.target).hasClass("sapMCbBg") || $(oEvent.target).hasClass("sapMCb")) {
					oldTap.call(this, oEvent);
				} else {
					that.model.setProperty("/selectedRuleStringify", "");
					that.markLIBAsSelected(this);

					var selectedRule = this.getBindingContext().getObject();
					that.model.setProperty("/selectedRule", selectedRule);
					that.model.setProperty("/selectedRuleStringify", that.createRuleString(selectedRule));
				}
			};

			ListItemBase.prototype.updateSelectedDOM = function(bSelected, $This) {
				oldUpdateSelectedDom.call(this, bSelected, $This);
				if (this.getParent().getMode() === "MultiSelect") {
					$This.removeClass("sapMLIBSelected");
				}
			};
		},
		createRuleString: function (rule) {
			var str = "{\n",
				count = 0,
				keysLength = Object.keys(rule).length;

			for (var key in rule) {
				var value = rule[key];
				count++;
				str += "\t";
				str += key + ": ";
				if (key === "check") {
					str += value.split("\n").join("\n\t");
				} else {
					str += JSON.stringify(value);
				}

				//Don't add comma after last value
				if (count < keysLength) {
					str += ",";
				}

				str += "\n";
			}
			str += "}";
			return str;
		},
		markLIBAsSelected: function (listItemBase) {
			if (!listItemBase) {
				var selectedRuleTitle = this.model.getProperty("/selectedRule/title");
				this.getView().byId("ruleSetContainer").getContent().forEach(function (libPanel) {
					libPanel.getContent()[0].getItems().forEach(function (libItem) {
						if (libItem.getLabel() === selectedRuleTitle) {
							listItemBase = libItem;
						}
					});
				});
			}

			this.getView().$().find(".sapMLIB").removeClass("sapMLIBSelected");
			listItemBase.$().addClass("sapMLIBSelected");
		},
		onAfterNavigate: function (oEvent) {
			var to = oEvent.getParameter("to"),
				that = this;

			if (to === this.getView().byId("rulesDisplayPage")) {
				setTimeout(function () {
					that.markLIBAsSelected();
				}, 250);
			}
		},
		selectAll: function (libraryIndex) {
			var that = this;
			this.visitAllRules(function (rule, ruleIndex, libIndex) {
				if (libraryIndex === libIndex) {
					that.model.setProperty("/libraries/" + libIndex + "/rules/" + ruleIndex + "/selected", true);
				}
			});
		},
		deselectAll: function (libraryIndex) {
			var that = this;
			this.visitAllRules(function (rule, ruleIndex, libIndex) {
				if (libraryIndex === libIndex) {
					that.model.setProperty("/libraries/" + libIndex + "/rules/" + ruleIndex + "/selected", false);
				}
			});
		},
		updateRule: function () {
			var oldId = this.model.getProperty("/editRuleSource/id"),
				updateObj = this.model.getProperty("/editRule");

			if (this.checkFunctionString(updateObj.check)) {
				CommunicationBus.publish("verifyUpdateRule", {
					oldId: oldId,
					updateObj: RuleSerializer.serialize(updateObj)
				});
			}
		},
		updatesupportRules: function (data) {
			data = RuleSerializer.deserialize(data);

			var libraries = [],
				that = this;

			for (var i in data) {
				var rules = [],
					ruleSets = data[i].ruleset._mRules;

				for (var j in ruleSets) {
					var rule = ruleSets[j];
					rule.libName = i;
					rule.selected = true;
					rules.push(rule);
				}

				libraries.push({
					title: i,
					type: "library",
					rules: rules
				});
			}

			var firstSelectedRule = libraries[0].rules[0];
			that.model.setProperty("/selectedRuleStringify", "");
			that.model.setProperty("/selectedRule", firstSelectedRule);
			that.model.setProperty("/selectedRuleStringify", that.createRuleString(firstSelectedRule));
			that.model.setProperty("/libraries", libraries);

			that.createRulesUI();
			var panel = that.getView().byId("ruleSetContainer").getContent()[0];
			panel.setExpanded(true);

		},
		createRulesUI: function () {
			var libs = this.model.getProperty("/libraries"),
				rulesCount = 0,
				that = this,
				vlContainer = this.getView().byId("ruleSetContainer");

			vlContainer.getContent().forEach(function (content, contentIndex) {
				vlContainer.removeContent(content);
			});

			libs.forEach(function (lib, libIndex) {
				var content = lib.title === "temporary" ? new sap.m.Button({
					icon:"sap-icon://edit",
					press: function (oEvent) {
						var sourceObject = this.getParent().getBindingContext().getObject();
						that.model.setProperty("/editRuleSource", sourceObject);
						that.model.setProperty("/editRule", jQuery.extend(true, {}, sourceObject));
						that.model.checkUpdate(true, true);
						var navCont = that.getView().byId("rulesNavContainer");
						navCont.to(that.getView().byId("ruleUpdatePage"), "show");
					}
				}) : null;
				var rulesList = new List({
					mode : "MultiSelect",
					includeItemInSelection: true,
					items: {
						path: "/libraries/" + libIndex + "/rules",
						template: new InputListItem({
							label: "{title}",
							selected: "{selected}",
							content: content
						})
					}
				});

				if (lib.rules.length === undefined) {
					rulesCount = 1;
				} else {
					rulesCount = lib.rules.length;
				}

				var libPanel = new Panel({
					width: "100%",
					expandable: true,
					expanded: false,
					content: rulesList,
					headerToolbar: new Toolbar({
						content: [
							new Label({
								text: lib.title + " (" + rulesCount + ")"
							}),
							new ToolbarSpacer(),
							new Button({
								text: "Select all",
								press: function () {
									that.selectAll(libIndex);
								}
							}),
							new Button({
								text: "Deselect all",
								press: function () {
									that.deselectAll(libIndex);
								}
							})
						]
					})
				});

				vlContainer.addContent(libPanel);
			});

		},
		addLinkToNewRule: function () {
			var tempLink = this.model.getProperty("/tempLink"),
				copy = jQuery.extend(true, {}, tempLink);
			this.model.getProperty("/newRule/resolutionurls").push(copy);
			this.model.checkUpdate(true, true);
		},
		addLinkToEditRule: function () {
			var tempLink = this.model.getProperty("/tempLink"),
				copy = jQuery.extend(true, {}, tempLink);
			this.model.getProperty("/editRule/resolutionurls").push(copy);
			this.model.checkUpdate(true, true);
		},
		goToCreateRule: function () {
			var navCont = this.getView().byId("rulesNavContainer");
			navCont.to(this.getView().byId("rulesCreatePage"), "show");
		},
		checkFunctionString: function (functionString) {
			try {
				/* eslint-disable no-eval */
				eval("var testAsignedVar = " + functionString);
				/* eslint-enable no-eval */
			} catch (err) {
				MessageToast.show("Your check function contains errors, and can't be evaluated:" + err);
				return false;
			}
			return true;
		},
		addNewRule: function () {
			var newRule = this.model.getProperty("/newRule");
			if (this.checkFunctionString(newRule.check)) {
				CommunicationBus.publish("verifyNewRule", RuleSerializer.serialize(newRule));
			}
		},
		rulesToolbarITHSelect: function (oEvent) {
			if (oEvent.getParameter("key") === "jsonOutput") {
				var newRule = this.model.getProperty("/newRule"),
					stringifiedJson = this.createRuleString(newRule);
				this.model.setProperty("/newRuleStringified", stringifiedJson);
			}
		},
		rulesToolbarEditITHSelect: function (oEvent) {
			if (oEvent.getParameter("key") === "jsonOutput") {
				var newRule = this.model.getProperty("/editRule"),
					stringifiedJson = this.createRuleString(newRule);
				this.model.setProperty("/updateRuleStringified", stringifiedJson);
			}
		},
		visitAllRules: function (callback) {
			var libs = this.model.getProperty("/libraries");
			libs.forEach(function (lib, libIndex) {
				lib.rules.forEach(function (rule, ruleIndex) {
					callback(rule, ruleIndex, libIndex);
				});
			});
		}
	});
});