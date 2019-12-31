/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/**
 * Initialization Code and shared classes of library sap.ui.rta.
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Core', 'sap/ui/core/library'],
	function(jQuery, Core, coreLibrary) {
	"use strict";

	/**
	 * SAPUI5 library with RTA controls.
	 *
	 * @namespace
	 * @name sap.ui.rta
	 * @public
	 */


	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.rta",
		version: "1.46.2",
		dependencies : ["sap.ui.core","sap.m", "sap.ui.fl", "sap.ui.dt"],
		types: [
		],
		interfaces: [],
		controls: [],
		elements: [
		]
	});

	return sap.ui.rta;

}, /* bExport= */ true);