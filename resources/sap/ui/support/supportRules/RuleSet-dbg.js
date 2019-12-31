/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define(["jquery.sap.global", "sap/ui/base/Object"],
	function (jQuery, BaseObject) {
		"use strict";

		var mRulesets = {};

		var Ruleset = function (oSettings) {
			if (!oSettings.name) {
				jQuery.sap.log.error("Please provide a name for the Ruleset.");
			}

			if (mRulesets[oSettings.name]) {
				return mRulesets[oSettings.name];
			}
			this._oSettings = oSettings;
			this._mRules = {};
			mRulesets[oSettings.name] = this;
		};

		Ruleset.prototype.getRules = function () {
			return this._mRules;
		};

		Ruleset.prototype.updateRule = function (oldId, newSettings) {
			var verifyResult = this._verifySettingsObject(newSettings, true);

			if (verifyResult === "success") {
				delete this._mRules[oldId];
				this._mRules[newSettings.id] = newSettings;
			}

			return verifyResult;
		};

		Ruleset.prototype._verifySettingsObject = function (oSettings, update) {
			if (!oSettings.id) {
				jQuery.sap.log.info("Support rule needs an unique id.");
				return "Support rule needs an unique id.";
			}

			if (!update && this._mRules[oSettings.id]) {
				jQuery.sap.log.info("Support rule with the id " + oSettings.id + " already exists.");
				return "Support rule with the id " + oSettings.id + " already exists.";
			}

			if (!oSettings.check) {
				jQuery.sap.log.info("Support rule needs a check function.");
				return "Support rule needs a check function.";
			}

			if (!oSettings.title) {
				jQuery.sap.log.info("Support rule needs a title.");
				return "Support rule needs a title.";
			}

			if (!oSettings.description) {
				jQuery.sap.log.info("Support rule needs a description.");
				return "Support rule needs a description.";
			}

			if (!oSettings.resolution && (!oSettings.resolutionurls || !oSettings.resolutionurls.length > 0)) {
				jQuery.sap.log.info("Support rule needs either a resolution or resolutionurls or should have a ticket handler function");
				return "Support rule needs either a resolution or resolutionurls or should have a ticket handler function";
			}

			if (!oSettings.audience || oSettings.audience.length === 0) {
				jQuery.sap.log.info("Support rule should have an audience. Applying ['Control']");
				oSettings.audience = [sap.ui.support.Audiences.Control];
			}

			if (oSettings.audience && oSettings.audience.forEach) {
				var wrongAudience = false,
					audName = "";
				oSettings.audience.forEach(function (aud) {
					if (!sap.ui.support.Audiences[aud]) {
						wrongAudience = true;
						audName = aud;
					}
				});

				if (wrongAudience) {
					return "Audience " + audName + " does not exist. Please use the audiences from sap.ui.support.Audiences";
				}
			}

			if (!oSettings.categories || oSettings.categories.length === 0) {
				jQuery.sap.log.info("Support rule should have a category. Applying 'Performance'");
				oSettings.category = ["Performance"];
			}

			if (oSettings.categories && oSettings.categories.forEach) {
				var wrongCategory = false,
					catName = "";
				oSettings.categories.forEach(function (cat) {
					if (!sap.ui.support.Categories[cat]) {
						wrongCategory = true;
						catName = cat;
					}
				});

				if (wrongCategory) {
					return "Category " + catName + " does not exist. Please use the categories from sap.ui.support.Categories";
				}
			}

			return "success";
		};

		Ruleset.prototype.addRule = function (oSettings) {
			var verifyResult = this._verifySettingsObject(oSettings);

			if (verifyResult === "success") {
				this._mRules[oSettings.id] = oSettings;
				oSettings.libName = this._oSettings.name;
			}

			return verifyResult;
		};

		return Ruleset;
	}, true);
