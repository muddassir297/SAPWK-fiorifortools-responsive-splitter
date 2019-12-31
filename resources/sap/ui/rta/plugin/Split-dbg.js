/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.plugin.Split.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin', 'sap/ui/dt/Selection', 'sap/ui/dt/OverlayRegistry', 'sap/ui/rta/Utils', 'sap/ui/fl/Utils'
], function(Plugin, Selection, OverlayRegistry, Utils, FlexUtils) {
	"use strict";

	/**
	 * Constructor for a new Split Plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version 1.46.2
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.plugin.Split
	 * @experimental Since 1.46. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Split = Plugin.extend("sap.ui.rta.plugin.Split", /** @lends sap.ui.rta.plugin.Split.prototype */
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
	Split.prototype._isEditable = function(oOverlay) {
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oElement = oOverlay.getElementInstance();
		if (!Utils.getPublicParentDesigntimeMetadata(oOverlay)) {
			return false;
		}
		var oSplitAction = this._getSplitAction(oOverlay);
		if (oSplitAction && oSplitAction.changeType) {
			return this.hasStableId(oOverlay) && this.hasChangeHandler(oSplitAction.changeType, oDesignTimeMetadata.getRelevantContainer(oElement));
		} else {
			return false;
		}
	};

	/**
	 * @param	{sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {sap.ui.dt.DesignTimeMetadata} oDesignTimeMetadata
	 * @private
	 */
	Split.prototype._getEffectiveDesignTimeMetadata = function(oOverlay) {
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
	Split.prototype._getSplitAction = function(oOverlay) {
		return this._getEffectiveDesignTimeMetadata(oOverlay).getAction("split", oOverlay.getElementInstance());
	};

	/**
	 * Checks if Split is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	Split.prototype.isSplitAvailable = function(oOverlay) {
		if (!this._isEditableByPlugin(oOverlay)) {
			return false;
		}

		var aSelectedOverlays = this.getDesignTime().getSelection();
		if (aSelectedOverlays.length !== 1) {
			return false;
		}

		var vSplitAction = this._getSplitAction(oOverlay);
		var oElement = aSelectedOverlays[0].getElementInstance();
		if (vSplitAction && vSplitAction.getControlsCount(oElement) <= 1) {
			return false;
		}

		return true;
	};

	/**
	 * Checks if Split is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if enabled
	 * @public
	 */
	Split.prototype.isSplitEnabled = function(oOverlay) {

		// check that each selected element has an enabled action
		var oAction = this._getSplitAction(oOverlay);
		if (!oAction || !this.isSplitAvailable(oOverlay)) {
			return false;
		}

		// actions are by default enabled
		var bActionIsEnabled = true;
		if (typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				 bActionIsEnabled = oAction.isEnabled(oOverlay.getElementInstance());
			} else {
				bActionIsEnabled = oAction.isEnabled;
			}
		}
		return bActionIsEnabled;
	};

	/**
	 * @param  {any} oSplitElement selected element
	 */
	Split.prototype.handleSplit = function(oSplitElement) {
		var oParent = oSplitElement.getParent();
		var oElementOverlay = OverlayRegistry.getOverlay(oSplitElement);
		var oDesignTimeMetadata = this._getEffectiveDesignTimeMetadata(oElementOverlay);
		var oElement;

		if (oElementOverlay.isInHiddenTree()) {
			oElement = oElementOverlay.getPublicParentElementOverlay().getElementInstance();
		} else {
			oElement = oSplitElement;
		}

		var iFieldsLength = this._getSplitAction(oElementOverlay).getControlsCount(oElement);
		var oView = FlexUtils.getViewForControl(oElement);
		var aNewElementIds = [];
		// Split needs iFieldsLength controls, only one is available so far
		for (var i = 0; i < iFieldsLength - 1; i++){
			aNewElementIds.push(oView.createId(jQuery.sap.uid()));
		}

		var oSplitCommand = this.getCommandFactory().getCommandFor(oElement, "split", {
			newElementIds : aNewElementIds,
			source : oSplitElement,
			parentElement : oParent
		}, oDesignTimeMetadata);
		this.fireElementModified({
			"command" : oSplitCommand
		});

	};

	return Split;
}, /* bExport= */true);
