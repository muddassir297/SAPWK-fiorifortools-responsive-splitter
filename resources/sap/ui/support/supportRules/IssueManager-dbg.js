/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define(["jquery.sap.global", "sap/ui/base/Object"],
	function (jQuery, BaseObject) {
		"use strict";

		var _aIssues = [];
		var _aHistory = [];

		var IssueManager = {
			/**
			 * Adds an issue to the list of issues found
			 * @param {object} oIssue
			 */
			addIssue: function (oIssue) {
				_aIssues.push(oIssue);
			},
			/**
			 * @param {function} fnCb Callback function to be used in the same
			 * fashion as Array.prototype.forEach
			 */
			walkIssues: function (fnCb) {
				_aIssues.forEach(fnCb);
			},
			clearIssues: function () {
				// Return if no issues
				if (!_aIssues.length) {
					return;
				}

				// Add to history. Using object for future compatibility
				_aHistory.push({
					// Copy array
					issues: _aIssues.slice()
				});

				// Reset issues array
				_aIssues = [];
			},
			/**
			 * @returns {array} Issue history - array of objects.
			 * Each history object has an issues key that contains an array of
			 * issues
			 */
			getHistory: function () {
				this.clearIssues();
				// Copy and return history
				return _aHistory.slice();
			},
			createCheckFunctionProxy: function (oRule) {
				return new CheckFunctionProxy(oRule);
			}
		};

		var CheckFunctionProxy = function (oRule) {
			this.oRule = oRule;
		};

		CheckFunctionProxy.prototype.addIssue = function (oIssue) {
			oIssue.rule = this.oRule;

			if (!sap.ui.support.Severity[oIssue.severity]) {
				throw "The issue from rule " + this.oRule.title + " does not have proper severity defined. Allowed values can be found" +
						"in sap.ui.support.Severity";
			}

			if (!oIssue.context || !oIssue.context.id) {
				throw "The issue from rule '" + this.oRule.title + "' should provide a context id.";
			}

			if (!oIssue.details) {
				throw "The issue from rule '" + this.oRule.title + "' should provide details for the generated issue.";
			}

			IssueManager.addIssue(oIssue);
		};

		return IssueManager;

	}, true);
