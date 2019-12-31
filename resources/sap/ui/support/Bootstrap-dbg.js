/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

// Provides control sap.ui.support.Bootstrap.
sap.ui.define(["jquery.sap.global", "./library", "sap/ui/support/supportRules/Main"],
	function (jQuery, library, Main) {
		"use strict";

	var Bootstrap = {
		initSupportRules: function (settings) {
			if (settings[0].toLowerCase() === "true" || settings[0].toLowerCase() === "silent") {
				Main.startPlugin();
				/**
				 * Enables the additional logging capabilites of the logger,
				 * allowing the developers to pass custom data, that is later going to be added
				 * to the executionScope of the rules
				 */
				jQuery.sap.log.logSupportInfo(true);
			}
		}
	};

	return Bootstrap;
});
