/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.plugin.Selection.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/Utils',
	'sap/ui/fl/Utils'
],
function(Plugin, Utils, FlexUtils) {
	"use strict";

	/**
	 * Constructor for a new Selection plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The Selection plugin allows you to select or focus overlays with mouse or keyboard and navigate to others.
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version 1.46.2
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.Selection
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Selection = Plugin.extend("sap.ui.rta.plugin.Selection", /** @lends sap.ui.dt.Plugin.prototype */
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
	 *
	 */
	Selection.prototype._checkVendorLayer = function(oOverlay) {
		if (oOverlay.getDesignTimeMetadata()) {
			if (this.hasStableId(oOverlay) && FlexUtils.isVendorLayer()) {
				oOverlay.setEditable(true);
				oOverlay.setSelectable(true);
				return true;
			}
		}
		return false;
	};

	/**
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Selection.prototype.registerElementOverlay = function(oOverlay) {
		if (!this._checkVendorLayer(oOverlay)) {
			oOverlay.attachEditableChange(this._onEditableChange, this);
			this._adaptSelectable(oOverlay);
		}

		oOverlay.attachBrowserEvent("click", this._onClick, this);
		oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.attachBrowserEvent("mousedown", this._onMouseDown, this);
	};

	Selection.prototype._onEditableChange = function(oEvent) {
		var oOverlay = oEvent.getSource();
		this._adaptSelectable(oOverlay);
	};

	Selection.prototype._adaptSelectable = function(oOverlay) {
		var bSelectable = oOverlay.getEditable();
		if (oOverlay.getSelectable() !== bSelectable) {
			oOverlay.setSelectable(bSelectable);
		}
	};

	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Selection.prototype.deregisterElementOverlay = function(oEvent) {
		var oOverlay = oEvent.getSource();
		oOverlay.detachBrowserEvent("click", this._onClick, this);
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.detachBrowserEvent("mousedown", this._onMouseDown, this);

		oOverlay.detachEditableChange(this._onEditableChange, this);
	};

	/**
	 * Handle keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onKeyDown = function(oEvent) {
		var oOverlay = Utils.getFocusedOverlay();
		if (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER) {
			if ((oOverlay) && (!oOverlay.isSelected())) {
				oOverlay.setSelected(true);
				oEvent.stopPropagation();
			}
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oParentOverlay = oOverlay.getParentElementOverlay();
				if (oParentOverlay && oParentOverlay.getSelectable()) {
					oParentOverlay.focus();
					oEvent.stopPropagation();
				}
			}
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oFirstChildOverlay = Utils.getFirstFocusableChildOverlay(oOverlay);
				if (oFirstChildOverlay) {
					oFirstChildOverlay.focus();
					oEvent.stopPropagation();
				}
			}
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oPrevSiblingOverlay = Utils.getPreviousFocusableSiblingOverlay(oOverlay);
				if (oPrevSiblingOverlay) {
					oPrevSiblingOverlay.focus();
					oEvent.stopPropagation();
				}
			}
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_RIGHT) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oNextSiblingOverlay = Utils.getNextFocusableSiblingOverlay(oOverlay);
				if (oNextSiblingOverlay) {
					oNextSiblingOverlay.focus();
					oEvent.stopPropagation();
				}
			}
		}
	};

	/**
	 * Handle MouseDown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onMouseDown = function(oEvent) {
		if (sap.ui.Device.browser.name == "ie"){
			var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
			if (oOverlay.getSelectable()){
				oOverlay.focus();
				oEvent.stopPropagation();
			} else {
				oOverlay.getDomRef().blur();
			}
			oEvent.preventDefault();
		}
	};

	/**
	 * Handle click event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onClick = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		if (oOverlay.getSelectable()) {
			oOverlay.setSelected(!oOverlay.getSelected());
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	return Selection;
}, /* bExport= */true);
