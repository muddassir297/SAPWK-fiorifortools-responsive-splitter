/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.plugin.Combine.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin', 'sap/ui/dt/Selection', 'sap/ui/dt/OverlayRegistry', 'sap/ui/rta/Utils'
], function(Plugin, Selection, OverlayRegistry, Utils) {
	"use strict";

	/**
	 * Constructor for a new Combine Plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version 1.46.2
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.plugin.Combine
	 * @experimental Since 1.46. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Combine = Plugin.extend("sap.ui.rta.plugin.Combine", /** @lends sap.ui.rta.plugin.Combine.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	/**
	 * @private
	 */
	Combine.prototype._isEditable = function(oOverlay) {
		var oDesignTimeMetadata = this._getEffectiveDesignTimeMetadata(oOverlay);
		var oElement = oOverlay.getElementInstance();
		if (!Utils.getPublicParentDesigntimeMetadata(oOverlay)) {
			return false;
		}
		var oCombineAction = this._getCombineAction(oOverlay);
		if (oCombineAction && oCombineAction.changeType) {
			return this.hasChangeHandler(oCombineAction.changeType, oDesignTimeMetadata.getRelevantContainer(oElement)) && this.hasStableId(oOverlay);
		} else {
			return false;
		}
	};

	/**
	 * @param	{sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {sap.ui.dt.DesignTimeMetadata} oDesignTimeMetadata
	 * @private
	 */
	Combine.prototype._getEffectiveDesignTimeMetadata = function(oOverlay) {
		var oDesignTimeMetadata;
		if (oOverlay.isInHiddenTree()) {
			var oPublicParentAggregationOverlay = oOverlay.getPublicParentAggregationOverlay();
			oDesignTimeMetadata = oPublicParentAggregationOverlay.getDesignTimeMetadata();
		} else {
			oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		}
		return oDesignTimeMetadata;
	};

	/**
	 * @param	{sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {sap.ui.dt.DesignTimeMetadata} oDesignTimeMetadata
	 * @private
	 */
	Combine.prototype._getCombineAction = function(oOverlay) {
		return this._getEffectiveDesignTimeMetadata(oOverlay).getAction("combine", oOverlay.getElementInstance());
	};

	Combine.prototype._checkForSameRelevantContainer = function(aSelectedOverlays) {
		var aElements = [];
		var aRelevantContainer = [];
		for (var i = 0, n = aSelectedOverlays.length; i < n; i++) {
			aElements[i] = aSelectedOverlays[i].getElementInstance();
			aRelevantContainer[i] = this._getEffectiveDesignTimeMetadata(aSelectedOverlays[i]).getRelevantContainer(aElements[i]);
			if (i > 0) {
				if ((aRelevantContainer[0] !== aRelevantContainer[i])
					|| (aElements[0].getMetadata().getName() !== aElements[i].getMetadata().getName())) {

					return false;
				}
			}
		}
		return true;
	};

	/**
	 * Checks if Combine is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	Combine.prototype.isCombineAvailable = function(oOverlay) {
		var aSelectedOverlays = this.getDesignTime().getSelection();

		if (aSelectedOverlays.length <= 1) {
			return false;
		}
		return (this._checkForSameRelevantContainer(aSelectedOverlays) && this._isEditableByPlugin(oOverlay));
	};

	/**
	 * Checks if Combine is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if enabled
	 * @public
	 */
	Combine.prototype.isCombineEnabled = function(oOverlay) {
		var aSelectedOverlays = this.getDesignTime().getSelection();

		// check that no more than 3 fields can be combined
		if (!this.isCombineAvailable(oOverlay) || aSelectedOverlays.length <= 1) {
			return false;
		}

		var aSelectedControls = aSelectedOverlays.map(function (oSelectedOverlay) {
			return oSelectedOverlay.getElementInstance();
		});

		// check that each selected element has an enabled action
		var bActionCheck = aSelectedOverlays.every(function(oSelectedOverlay) {
			var oAction = this._getCombineAction(oSelectedOverlay);
			if (!oAction) {
				return false;
			}

			// when isEnabled is not defined the default is true
			if (typeof oAction.isEnabled !== "undefined") {
				if (typeof oAction.isEnabled === "function") {
					return oAction.isEnabled(aSelectedControls);
				} else {
					return oAction.isEnabled;
				}
			}

			return true;
		}, this);

		return bActionCheck;
	};

	/**
	 * @param  {any} oCombineElement selected element
	 */
	Combine.prototype.handleCombine = function(oCombineElement) {
		var oElementOverlay = OverlayRegistry.getOverlay(oCombineElement);
		var oDesignTimeMetadata = this._getEffectiveDesignTimeMetadata(oElementOverlay);
		var oElement;

		if (oElementOverlay.isInHiddenTree()) {
			oElement = oElementOverlay.getPublicParentElementOverlay().getElementInstance();
		} else {
			oElement = oCombineElement;
		}

		var aToCombineElements = [];
		var aSelectedOverlays = this.getDesignTime().getSelection();

		for (var i = 0; i < aSelectedOverlays.length; i++) {
			var oSelectedElement = aSelectedOverlays[i].getElementInstance();
			aToCombineElements.push(oSelectedElement);
		}

		var oCombineCommand = this.getCommandFactory().getCommandFor(oElement, "combine", {
			source : oCombineElement,
			combineFields : aToCombineElements
		}, oDesignTimeMetadata);
		this.fireElementModified({
			"command" : oCombineCommand
		});

	};

	return Combine;
}, /* bExport= */true);