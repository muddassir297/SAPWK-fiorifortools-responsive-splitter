/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

// Provides class sap.ui.dt.Plugin.
sap.ui.define([
	'sap/ui/dt/Plugin', 'sap/ui/fl/Utils', 'sap/ui/fl/registry/ChangeRegistry'
],
function(Plugin, FlexUtils, ChangeRegistry) {
	"use strict";

	/**
	 * Constructor for a new Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The Plugin allows to handle the overlays and aggregation overlays from the DesignTime
	 * The Plugin should be overriden by the real plugin implementations, which define some actions through events attached to an overlays
	 * @extends sap.ui.dt.Plugin
	 *
	 * @author SAP SE
	 * @version 1.46.2
	 *
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.plugin.Plugin
	 * @experimental Since 1.46. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var BasePlugin = Plugin.extend("sap.ui.rta.plugin.Plugin", /** @lends sap.ui.dt.Plugin.prototype */ {
		metadata : {
			"abstract" : true,
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.rta",
			properties : {
				userDependentMode: {
					type: "boolean",
					defaultValue: false
				},

				commandFactory : {
					type : "object",
					multiple : false
				}
			},
			events : {
				elementModified : {
					command : {
						type : "sap.ui.rta.command.BaseCommand"
					}
				}
			}
		}
	});

	BasePlugin.prototype._isEditable = function() {};

	BasePlugin.prototype._isEditableByPlugin = function(oOverlay) {
		var sPluginName = this.getMetadata().getName();
		var aPluginList = oOverlay.getEditableByPlugins();
		return aPluginList.indexOf(sPluginName) > -1;
	};

	BasePlugin.prototype.registerElementOverlay = function(oOverlay) {
		if (this._isEditable(oOverlay)) {
			this.addToPluginsList(oOverlay);
		}
	};

	BasePlugin.prototype.deregisterElementOverlay = function(oOverlay) {
		this.removeFromPluginsList(oOverlay);
	};

	BasePlugin.prototype.hasStableId = function(oOverlay) {
		var bStable = false;
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oElement = oOverlay.getElementInstance();
		var oParentDesignTimeMetadata = oOverlay.getPublicParentAggregationOverlay() ? oOverlay.getPublicParentAggregationOverlay().getDesignTimeMetadata() : null;

		if (!oParentDesignTimeMetadata && oOverlay.isInHiddenTree()) {
			return false;
		}

		var fnGetStableElements;
		if (oOverlay.isInHiddenTree()) {
			fnGetStableElements = oParentDesignTimeMetadata.getData().getStableElements;
		} else {
			fnGetStableElements = oDesignTimeMetadata.getData().getStableElements;
		}
		if (fnGetStableElements) {
			var aStableElements = fnGetStableElements(oElement);
			var bUnstable = aStableElements ? aStableElements.some(function(vStableElement) {
				var oControl = vStableElement.id || vStableElement;
				if (!FlexUtils.checkControlId(oControl, vStableElement.appComponent)) {
					return true;
				}
			}) : true;
			bStable = !bUnstable;
		} else {
			bStable = FlexUtils.checkControlId(oElement);
		}
		return bStable;
	};

	/**
	 * Recursively checks the Aggregations on the Relevant Container Overlay of an Overlay for a specific Action
	 * @name sap.ui.rta.plugin.Plugin.prototype.checkAggregations
	 * @return {boolean} whether the Aggregation has a valid Action
	 * @protected
	 */
	BasePlugin.prototype.checkAggregations = function(oOverlay, oRelevantContainerOverlay, sAction) {
		var bIsEditable = false;

		var fnCheckWhenOverlayIsRelevantContainerOverlay = function(oTargetOverlay, oPreviousOverlay) {
			if (oTargetOverlay === oRelevantContainerOverlay) {
				var oAction, sChangeType;
				if (oPreviousOverlay.isInHiddenTree()) {
					oAction = oPreviousOverlay.getDesignTimeMetadata().getAction(sAction, oOverlay.getElementInstance());
				} else {
					oAction = oPreviousOverlay.getDesignTimeMetadata().getAction(sAction, oTargetOverlay.getElementInstance());
				}

				sChangeType = oAction ? oAction.changeType : null;

				var oElement = oRelevantContainerOverlay.getElementInstance();

				if (sChangeType && this.hasChangeHandler(sChangeType, oElement)) {
					bIsEditable = true;
				}
			} else {
				return fnCheckWhenOverlayIsRelevantContainerOverlay.bind(this, oTargetOverlay.getParent(), oTargetOverlay)();
			}
		};

		fnCheckWhenOverlayIsRelevantContainerOverlay.bind(this, oOverlay)();

		return bIsEditable;
	};

	/**
	 * Checks the Aggregations on the Overlay for a specific Action
	 * @name sap.ui.rta.plugin.Plugin.prototype.checkAggregationsOnSelf
	 * @return {boolean} whether the Aggregation has a valid Action
	 * @protected
	 */
	BasePlugin.prototype.checkAggregationsOnSelf = function (oOverlay, sAction) {
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oElement = oOverlay.getElementInstance();
		var bIsEditable = false;

		var oAction = oDesignTimeMetadata.getAggregationAction(sAction, oOverlay.getElementInstance())[0];
		var sChangeType = oAction ? oAction.changeType : null;

		if (sChangeType && this.hasChangeHandler(sChangeType, oElement)) {
			bIsEditable = true;
		}

		return bIsEditable;
	};

	BasePlugin.prototype.removeFromPluginsList = function(oOverlay) {
		oOverlay.removeEditableByPlugin(this.getMetadata().getName());
		if (!oOverlay.getEditableByPlugins().length) {
			oOverlay.setEditable(false);
		}
	};

	BasePlugin.prototype.addToPluginsList = function(oOverlay) {
		oOverlay.addEditableByPlugin(this.getMetadata().getName());
		oOverlay.setEditable(true);
	};

	BasePlugin.prototype.hasChangeHandler = function(sChangeType, oElement) {
		var bHasChangeHandler = false;
		var sControlType = oElement.getMetadata().getName();
		var oResult = ChangeRegistry.getInstance().getRegistryItems({
			controlType : sControlType,
			changeTypeName : sChangeType
		});
		if (oResult && oResult[sControlType] && oResult[sControlType][sChangeType]) {
			var oRegItem = oResult[sControlType][sChangeType];
			bHasChangeHandler = !!oRegItem.getChangeTypeMetadata().getChangeHandler();
		}

		return bHasChangeHandler;
	};

	return BasePlugin;
}, /* bExport= */ true);