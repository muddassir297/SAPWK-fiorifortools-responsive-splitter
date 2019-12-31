/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([],
	function () {
		"use strict";

		return {
			serialize: function serializeRule(rule) {
				var replacer = function (key, value) {
					if (typeof value === "function") {
						return value.toString();
					} else {
						return value;
					}
				};

				var result = JSON.stringify(rule, replacer);
				return result;
			},
			deserialize: function (serializedRule, stringifyCheck) {
				var rule = JSON.parse(serializedRule);

				/* eslint-disable no-eval */
				if (!stringifyCheck && rule.check !== undefined) {
					eval("rule.check = " + rule.check);
				}
				/* eslint-enable no-eval */

				return rule;
			}
		};
	}, true);
