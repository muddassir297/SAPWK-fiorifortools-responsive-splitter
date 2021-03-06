/* -----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ----------------------------------------------------------------------------------- */

/**
 * Initialization Code and shared classes of library sap.apf (1.46.0)
 */
jQuery.sap.declare("sap.apf.library");
jQuery.sap.require("sap.ui.core.Core");
/**
 * Analysis Path Framework
 *
 * @namespace
 * @name sap.apf
 * @public
 */


// library dependencies
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.layout.library");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.viz.library");

// delegate further initialization of this library to the Core
sap.ui.getCore().initLibrary({
	name : "sap.apf",
	dependencies : ["sap.ui.core","sap.suite.ui.commons","sap.m","sap.ui.layout","sap.ushell","sap.viz"],
	types: [],
	interfaces: [],
	controls: [],
	elements: [],
	noLibraryCSS: true,
	version: "1.46.0"
});

