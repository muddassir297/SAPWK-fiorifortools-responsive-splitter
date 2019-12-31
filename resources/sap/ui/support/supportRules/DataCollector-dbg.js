/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/**
 * Creates a DataCollection that can be loaded from or downloaded to a zip file.
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/thirdparty/jszip', 'sap/ui/core/support/ToolsAPI', 'sap/ui/thirdparty/URI'],
	function (jQuery, JSZip, ToolsAPI, URI) {
	"use strict";

	/**
	 * The data collector collects files for zip download
	 */
	var DataCollector = function(oCore) {
		this._mData = {};
		this._oCore = oCore;
	};

	/**
	 * @returns {Array} All loaded manifest.json files.
	 */
	DataCollector.prototype.getAppInfo = function() {
		var appInfos = [];
		for (var componentName in this._oCore.mObjects.component) {
			var component = this._oCore.mObjects.component[componentName];
			var sapApp = component.getMetadata().getManifestEntry('sap.app');
			appInfos.push(sapApp);
		}
		return appInfos;
	};

	/**
	 * Retrieves all technical information. Reused from diagnostics tools.
	 * @returns {Object}
	 */
	DataCollector.prototype.getTechInfoJSON = function() {
		var oCfg = ToolsAPI.getFrameworkInformation();
		var oTechData = {
			sapUi5Version: null,
			version: oCfg.commonInformation.version,
			build: oCfg.commonInformation.buildTime,
			change: oCfg.commonInformation.lastChange,
			jquery: oCfg.commonInformation.jquery,
			useragent: oCfg.commonInformation.userAgent,
			docmode: oCfg.commonInformation.documentMode,
			debug: oCfg.commonInformation.debugMode,
			bootconfig: oCfg.configurationBootstrap,
			config:  oCfg.configurationComputed,
			libraries: oCfg.libraries,
			loadedLibraries: oCfg.loadedLibraries,
			modules: oCfg.loadedModules,
			uriparams: oCfg.URLParameters,
			appurl: oCfg.commonInformation.applicationHREF,
			title: oCfg.commonInformation.documentTitle,
			statistics: oCfg.commonInformation.statistics,
			resourcePaths: [],
			themePaths : [],
			locationsearch: document.location.search,
			locationhash: document.location.hash
		};

		//add absolute paths for resources
		var aModules = jQuery.sap.getAllDeclaredModules();
		var aResults = [];
		for (var i = 0; i < aModules.length; i++) {
			aResults.push({
				moduleName : aModules[i],
				relativePath: jQuery.sap.getResourcePath(aModules[i]),
				absolutePath: URI(jQuery.sap.getResourcePath(aModules[i])).absoluteTo(document.location.origin + document.location.pathname).toString()
			});
		}
		oTechData.resourcePaths = aResults;

		//add theme paths
		var mLibraries = this._oCore.getLoadedLibraries();
		aResults = [];
		for (var n in mLibraries) {
			var sPath = this._oCore._getThemePath(n, this._oCore.oConfiguration.theme);
			aResults.push({
				theme : this._oCore.oConfiguration.theme,
				library: n,
				relativePath: sPath,
				absolutePath: URI(sPath).absoluteTo(document.location.origin + document.location.pathname).toString()
			});
		}
		oTechData.themePaths = aResults;

		//add SAPUI5 version object
		try {
			oTechData.sapUi5Version = {
				version: sap.ui.getVersionInfo(),
				path: sap.ui.resource("", "sap-ui-version.json")
			};
		} catch (ex) {
			oTechData.sapUi5Version = null;
		}

		return oTechData;
	};

	/**
	 * Adds vData with the name to the data collection. sType json and has will use JSON.stringify
	 */
	DataCollector.prototype.add = function(sName, vData, sType) {
		if (!sName) {
			jQuery.sap.log.error("DataCollector: No name was given.");
			return false;
		}
		if (!vData) {
			jQuery.sap.log.error("DataCollector: No data was given.");
			return false;
		}
		if (typeof vData === "string") {
			this._mData[sName] = vData;
			return true;
		} else if (sType) {
			if ((sType === "json" || sType === "har") && (jQuery.isPlainObject(vData) || jQuery.isArray(vData))) {
				try {
					this._mData[sName] = JSON.stringify(vData);
					return true;
				} catch (ex) {
					jQuery.sap.log.error("DataCollector: JSON data could not be serialized for " + sName);
				}
			} else {
				jQuery.sap.log.error("DataCollector: JSON data could not be serialized for " + sType + ". Either the type is unknown or the data has a wrong format.");
			}
		} else {
			jQuery.sap.log.error("DataCollector: Data could not be serialized for " + sName + ". Data is is not a string or has a an invalid type.");
			return false;
		}
		return false;
	};

	/**
	 * Downloads a zip
	 */
	DataCollector.prototype.download = function() {
		var oZip = new JSZip();

		if (oZip) {
			for (var n in this._mData) {
				oZip.file(n, this._mData[n]);
			}

			var oContent = oZip.generate({
				base64 : true
			});
			var vRaw = window.atob(oContent),
				uInt8Array = new Uint8Array(vRaw.length);

			for (var i = 0; i < uInt8Array.length; ++i) {
				uInt8Array[i] = vRaw.charCodeAt(i);
			}

			var oBlob = new Blob([ uInt8Array ], {
				type : 'application/zip'
			});

			window.open(URL.createObjectURL(oBlob));
		}
	};

	DataCollector.prototype.clear = function() {
		this._mData = {};
		return true;
	};

	DataCollector.prototype.hasData = function(sName) {
		if (sName !== undefined) {
			return this._mData.hasOwnProperty(sName);
		}
		return Object.keys(this._mData).length > 0;
	};

	return DataCollector;
}, true);
