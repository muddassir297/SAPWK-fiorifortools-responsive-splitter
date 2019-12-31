/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.plugin.RTAElementMover.
sap.ui.define([
  'sap/ui/dt/plugin/ElementMover',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/ElementUtil',
	'sap/ui/fl/Utils',
	'sap/ui/rta/Utils',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/dt/OverlayRegistry'
],
function(ElementMover, OverlayUtil, ElementUtil, FlexUtils, Utils, CommandFactory, Plugin, OverlayRegistry) {
	"use strict";

	/**
	 * Constructor for a new RTAElementMover.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The RTAElementMover is responsible for the RTA specific adaptation of element movements.
	 *
	 * @author SAP SE
	 * @version 1.46.2
	 *
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.RTAElementMover
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var RTAElementMover = ElementMover.extend("sap.ui.rta.plugin.RTAElementMover", /** @lends sap.ui.rta.plugin.RTAElementMover.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.rta",
			properties : {
				commandFactory : {
					type : "any",
					defaultValue : CommandFactory
				},
				movableTypes : {
					type : "string[]",
					defaultValue : ["sap.ui.core.Element"]
				}
			},
			associations : {
			},
			events : {
			}
		}
	});

	/**
	 * Returns the relevant container for the move based on the passed overlay
	 * @param  {sap.ui.dt.Overlay} oOverlay The overlay for which to retrieve the relevant container
	 * @param  {boolean} bIsParentOverlay If the passed overlay is a parent or not
	 * @return {sap.ui.core.Element} The relevant container for the overlay
	 */
	function fnGetRelevantContainer(oOverlay, bIsParentOverlay) {
		var oRelevantContainer;
		if (oOverlay.isInHiddenTree() && oOverlay.getPublicParentElementOverlay()) {
			oRelevantContainer = oOverlay.getPublicParentElementOverlay().getElementInstance();
		} else if (!oOverlay.isInHiddenTree()) {
			var oElement = oOverlay.getElementInstance();
			var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
			if (bIsParentOverlay && !oDesignTimeMetadata.getData().getRelevantContainer) {
				oRelevantContainer = oElement;
			} else {
				oRelevantContainer = oDesignTimeMetadata.getRelevantContainer(oElement);
			}
		}
		return oRelevantContainer;
	}

	/**
	 * Check if the element is editable for the move
	 * @param  {sap.ui.dt.Overlay}  oOverlay The overlay being moved or the aggregation overlay
	 * @param  {[type]}  oMovedElement The element being moved if the aggregation overlay is present
	 * @return {Boolean} true if editable
	 */
	function fnIsValidForMove(oOverlay) {
		var bValid = false;
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();

		if (!oDesignTimeMetadata) {
			return false;
		}

		var oRelevantContainer = fnGetRelevantContainer(oOverlay);
		var oParentDesignTimeMetadata;

		var oRelevantContainerOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oRelevantContainer);
		if (oRelevantContainerOverlay) {
			oParentDesignTimeMetadata = oRelevantContainerOverlay.getDesignTimeMetadata();
		}
		if (!oParentDesignTimeMetadata) {
			return false;
		}

		if (!bValid) {
			bValid = Plugin.prototype.checkAggregations(oOverlay, oRelevantContainerOverlay, "move");
		}

		if (bValid) {
			if (!oOverlay.isInHiddenTree()) {
				bValid = Plugin.prototype.hasStableId(oOverlay) && Plugin.prototype.hasStableId(oRelevantContainerOverlay) && Plugin.prototype.hasStableId(oOverlay.getParentElementOverlay());
			} else {
				bValid = Plugin.prototype.hasStableId(oOverlay) && Plugin.prototype.hasStableId(oRelevantContainerOverlay);
			}
		}

		return bValid;
	}

	function fnHasMoveAction(oAggregationOverlay, oElement) {
		var oPublicAggregationDTMetadata = oAggregationOverlay.getDesignTimeMetadata();
		return !!oPublicAggregationDTMetadata.getMoveAction(oElement);
	}

	function fnHasParentAggregationMoveAction(oOverlay, oElement) {
		var oPublicParentAggregationOverlay = oOverlay.getPublicParentAggregationOverlay();
		if (oPublicParentAggregationOverlay){
			return fnHasMoveAction(oPublicParentAggregationOverlay, oElement);
		}
		return false;
	}

	/**
	 * Predicate to compute movability of a type
	 * @param {any} oElement given element
	 * @public
	 * @return {boolean} true if type is movable, false otherwise
	 */
	ElementMover.prototype.isMovableType = function(oElement) {
		//real check is part of checkMovable which has the overlay
		return true;
	};

	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if embedded, false if not
	 * @override
	 */
	RTAElementMover.prototype.checkMovable = function(oOverlay) {
		return fnIsValidForMove(oOverlay);
	};

	/**
	 * Checks drop ability for aggregation overlays
	 * @param  {sap.ui.dt.Overlay} oAggregationOverlay aggregation overlay object
	 * @return {boolean} true if aggregation overlay is droppable, false if not
	 * @override
	 */
	RTAElementMover.prototype.checkTargetZone = function(oAggregationOverlay) {
		var bTargetZone = ElementMover.prototype.checkTargetZone.call(this, oAggregationOverlay);
		var bValid, bMovable = false;
		var oMovedOverlay, oTargetOverlay;
		var oMovedElement, oTargetElement, oMovedElementContainer, oTargetZoneRelevantContainer;

		if (bTargetZone) {
			// check for same container
			oMovedOverlay = this.getMovedOverlay();
			oTargetOverlay = oAggregationOverlay.getParent();
			oMovedElementContainer = fnGetRelevantContainer(oMovedOverlay, false);
			oTargetZoneRelevantContainer = fnGetRelevantContainer(oTargetOverlay, true);

			if (!oMovedElementContainer || !oTargetZoneRelevantContainer) {
				return false;
			} else {
				oMovedElement = oMovedOverlay.getElementInstance();
				oTargetElement = oTargetOverlay.getElementInstance();

				bValid = fnIsValidForMove(oMovedOverlay);

				if (oTargetElement === oTargetZoneRelevantContainer) {
					bMovable = fnHasMoveAction(oAggregationOverlay, oMovedElement);
				} else {
					bMovable = fnHasParentAggregationMoveAction(oTargetOverlay, oMovedElement);
				}
				bTargetZone = (oMovedElementContainer === oTargetZoneRelevantContainer) && bValid && bMovable;
			}
		}

		return bTargetZone;
	};

	/**
	 * Builds the Move command
	 * @return {any} Move command object
	 */
	RTAElementMover.prototype.buildMoveCommand = function() {

		var oMovedOverlay = this.getMovedOverlay();
		var oMovedElement = oMovedOverlay.getElementInstance();
		var oSource = this._getSource();
		var oPublicSourceParent = oSource.publicParent;
		var oSourceParentOverlay = OverlayRegistry.getOverlay(oPublicSourceParent);
		var oTarget = OverlayUtil.getParentInformation(oMovedOverlay);
		var iSourceIndex = oSource.index;
		var iTargetIndex = oTarget.index;

		var bSourceAndTargetAreSame = this._compareSourceAndTarget(oSource, oTarget);

		if (bSourceAndTargetAreSame) {
			return undefined;
		}
		delete oSource.index;
		delete oTarget.index;

		var oMove = this.getCommandFactory().getCommandFor(oPublicSourceParent, "Move", {
			movedElements : [{
				element : oMovedElement,
				sourceIndex : iSourceIndex,
				targetIndex : iTargetIndex
			}],
			source : oSource,
			target : oTarget
		}, oSourceParentOverlay.getDesignTimeMetadata());

		return oMove;

	};

	return RTAElementMover;
}, /* bExport= */ true);
