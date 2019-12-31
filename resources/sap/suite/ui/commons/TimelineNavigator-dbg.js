/*!
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */

sap.ui.define([
	"sap/ui/core/delegate/ItemNavigation"
], function (ItemNavigation) {
	"use strict";

	function stringEndsWith(sString, sPattern) {
		var iDiff = sString.length - sPattern.length;
		return iDiff >= 0 && sString.lastIndexOf(sPattern) === iDiff;
	}

	/**
	 * Creates an instance of TimelineNavigator.
	 * @class TimelineNavigator An extension of ItemNavigator for Timeline.
	 *
	 * @extends sap.ui.core.delegate.ItemNavigation
	 *
	 * @param {Element} oDomRef The root DOM reference that includes all items
	 * @param {Element[]} aItemDomRefs Array of DOM references representing the items for the navigation
	 * @param {boolean} [bNotInTabChain=false] Whether the selected element should be in the tab chain or not
	 *
	 * @constructor
	 * @alias sap.suite.ui.commons.TimelineNavigator
	 * @public
	 */
	var TimelineNavigator = ItemNavigation.extend("sap.suite.ui.commons.TimelineNavigator", {
		constructor: function(oDomRef, aItemDomRefs, bNotInTabChain, aRows) {
			ItemNavigation.apply(this, arguments);
			this.setCycling(false);
			this._aRows = aRows;
		}
	});

	/**
	 * Update references to navigation objects.
	 * @param {Element} oDomRef The root DOM reference that includes all items
	 * @param {Element[]} aItemDomRefs Array of DOM references representing the items for the navigation
	 * @public
	 */
	TimelineNavigator.prototype.updateReferences = function(oDomRef, aItemDomRefs, aRows) {
		this.setRootDomRef(oDomRef);
		this.setItemDomRefs(aItemDomRefs);
		this._aRows = aRows;
	};

	/**
	 * Calls a parent function if it's defined.
	 * @param {string} sFnName Name of the function.
	 * @param {[object]} aArguments Arguments to pass into the function.
	 * @private
	 */
	TimelineNavigator.prototype._callParent = function(sFnName, aArguments) {
		if (typeof ItemNavigation.prototype[sFnName] === "function") {
			ItemNavigation.prototype[sFnName].apply(this, aArguments);
		}
	};


	/**
	 * If an element inside an item has focus, the focuse is returned to the item.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TimelineNavigator.prototype._onF7 = function(oEvent) {
		if (!jQuery.sap.containsOrEquals(this.oDomRef, oEvent.target)) {
			//Current element is not part of the navigation content
			return;
		}
		var focusedIndex = this.getFocusedIndex();
		if (focusedIndex >= 0) {
			this.focusItem(focusedIndex, oEvent);
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Same as sapenter
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TimelineNavigator.prototype.onsapspace = function(oEvent) {
		this.onsapenter(oEvent);
	};

	/**
	 * Activates the first action of an item.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TimelineNavigator.prototype.onsapenter = function(oEvent) {
		var id,
			jElement;
		if (this._skipNavigation(oEvent, false, true)) {
			return;
		}
		jElement = jQuery(this.getFocusedDomRef());
		id = jElement.attr("id");
		if (stringEndsWith(id, "-outline")) { //We have enter on timeline item
			if (jElement.hasClass("sapSuiteUiCommonsTimelineGroupHeaderMainWrapper")) {
				id = id.substr(0, id.length - "outline".length) + "groupCollapseIcon";
				jElement.find("#"+id).mousedown().mouseup().click();
			} else {
				jElement.find("div[role='toolbar']").children().first().mousedown().mouseup().click();
			}
			oEvent.preventDefault();
			oEvent.stopPropagation();
		} else if (stringEndsWith(id, "-showMoreWrapper")) { //We have enter on show more button
			jElement.find("span").mousedown().mouseup().click();
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handles the home key event.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TimelineNavigator.prototype.onsaphome = function(oEvent) {
		//Fixes bug in ItemNavigation when there are no selectable items.
		if (this.aItemDomRefs.length === 0) {
			return;
		}
		this._callParent("onsaphome", arguments);
	};

	/**
	 * Makes sure that if tab leaves item, selected item changes as well. It also handles F7 key.
	 * @param oEvent
	 * @private
	 */
	TimelineNavigator.prototype.onkeyup = function(oEvent) {
		var i,
			change = false;

		this._callParent("onkeyup", arguments);

		if (!jQuery.sap.containsOrEquals(this.oDomRef, oEvent.target)) {
			//Current element is not part of the navigation content
			return;
		}

		if (oEvent.keyCode === jQuery.sap.KeyCodes.F7) {
			this._onF7(oEvent);
		}

		if (oEvent.keyCode !== jQuery.sap.KeyCodes.TAB && oEvent.keyCode !== jQuery.sap.KeyCodes.F6) {
			return;
		}

		if (!jQuery.sap.containsOrEquals(this.getFocusedDomRef(), oEvent.target)) {
			this.iFocusedIndex = -1;
			change = true;
		}
		if (this.iFocusedIndex < 0) {
			//Try to find a newly selected item
			for (i = 0; i < this.aItemDomRefs.length; i++) {
				if (jQuery.sap.containsOrEquals(this.aItemDomRefs[i], oEvent.target)) {
					this.iFocusedIndex = i;
					change = true;
					break;
				}
			}
		}
		if (change) {
			this.setItemsTabindex();
		}
	};

	/**
	 * Fixes ItemNavigation onmousedown. ItemNavigation expect the component to have only one top element and all sub elements to be
	 * part of aItemDomRef. Timeline has multiple sub elements that are not part of the array and so the mousedown of ItemNavigation
	 * brakes focus behaviour.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TimelineNavigator.prototype.onmousedown = function(oEvent) {
		// set the focus to the clicked element or back to the last
		var oSource = oEvent.target;
		var checkFocusableParent = function( oDomRef, oItem){

			// as table cell might have focusable content that have not focusable DOM insinde
			// the table cell should not get the focus but the focusable element inside
			var bFocusableParent = false;
			var $CheckDom = jQuery(oDomRef);
			while (!$CheckDom.is(":sapFocusable") && $CheckDom.get(0) != oItem) {
				$CheckDom = $CheckDom.parent();
			}

			if ($CheckDom.get(0) != oItem) {
				// focusable Dom found inside item
				bFocusableParent = true;
			}

			return bFocusableParent;

		};

		if (jQuery.sap.containsOrEquals(this.oDomRef, oSource)) {
			// the mouse down occured inside the main dom ref
			for (var i = 0; i < this.aItemDomRefs.length; i++) {
				var oItem = this.aItemDomRefs[i];
				if (jQuery.sap.containsOrEquals(oItem, oSource)) {
					// only focus the items if the click did not happen on a
					// focusable element!
					if (oItem === oSource || !checkFocusableParent(oSource, oItem)) {
						this.focusItem(i, oEvent);

						// the table mode requires not to prevent the default
						// behavior on click since we want to allow text selection
						// click into the control, ...
					}
					return;
				}
			}

			// root DomRef of item navigation has been clicked
			// focus will also come in a moment - let it know that it was the mouse who caused the focus
			this._bMouseDownHappened = true;
			var that = this;
			window.setTimeout(
				function () {
					that._bMouseDownHappened = false;
				}, 20
			);
		}
	};

	/**
	 * Handles the onsapprevious event
	 * Sets the focus to the previous item
	 *
	 * @param {jQuery.Event} oEvent the browser event
	 * @private
	 */
	TimelineNavigator.prototype.onsapnext = function(oEvent) {
		var iIndex,
			bFirstTime = true,
			oCurrentPosition,
			oNextPosition,
			oItem;

		if (!this._aRows) {
			this._callParent("onsapnext", arguments);
			return;
		}

		// Sepcial hadling of sparce table when right key or down key was pressed.
		//debugger;
		if (this._skipNavigation(oEvent, true, false)) {
			return;
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

		if (this.getFocusedIndex() < 0) {
			// control doesn't have a focus
			return;
		}

		oCurrentPosition = this._findPosition(this.iFocusedIndex);

		if (oCurrentPosition === null) {
			throw new Error("TimelineNavigation cannot obtain a position of focused item and hance it cannot senect next.");
		}

		oNextPosition = jQuery.extend({}, oCurrentPosition);

		do {
			if (oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN) {
				oNextPosition.iY++;
				if (oNextPosition.iY >= this._aRows.length) {
					if (oNextPosition.iX + 1 >= this._aRows[this._aRows.length - 1].length) {
						// We reached the end of navigation. We should stop.
						return;
					}
					oNextPosition.iY = 0;
					oNextPosition.iX++;
				}
			} else {
				oNextPosition.iX++;
				if (oNextPosition.iX >= this._aRows[oNextPosition.iY].length) {
					if (oNextPosition.iY >= this._aRows.length) {
						// We reached the end of navigation. We should stop.
						return;
					}
					oNextPosition.iX = 0;
					oNextPosition.iY++;
				}
			}

			if (oNextPosition.iX === oCurrentPosition.iX && oNextPosition.iY === oCurrentPosition.iY) {
				if (bFirstTime) {
					bFirstTime = false;
				} else {
					// There is no other element to focus in this direction.
					return;
				}
			}
			oItem = this._aRows[oNextPosition.iY][oNextPosition.iX];
		} while (!oItem || !jQuery(oItem).is(":sapFocusable"));

		iIndex = this._findIndex(oNextPosition);

		this.focusItem(iIndex, oEvent);
	};

	/**
	 * Handles the onsapprevious event
	 * Sets the focus to the previous item
	 *
	 * @param {jQuery.Event} oEvent the browser event
	 * @private
	 */
	TimelineNavigator.prototype.onsapprevious = function(oEvent) {
		var iIndex,
			bFirstTime = true,
			oCurrentPosition,
			oNextPosition,
			oItem;

		if (!this._aRows) {
			this._callParent("onsapprevious", arguments);
			return;
		}

		// Sepcial hadling of sparce table when right key or down key was pressed.
		if (this._skipNavigation(oEvent, true, false)) {
			return;
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

		if (this.getFocusedIndex() < 0) {
			// control doesn't have a focus
			return;
		}

		oCurrentPosition = this._findPosition(this.iFocusedIndex);

		if (oCurrentPosition === null) {
			throw new Error("TimelineNavigation cannot obtain a position of focused item and hance it cannot senect next.");
		}

		oNextPosition = jQuery.extend({}, oCurrentPosition);

		do {
			if (oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP) {
				oNextPosition.iY--;
				if (oNextPosition.iY < 0) {
					if (oNextPosition.iX <= 0) {
						// We reached the beginning of navigation. We should stop.
						return;
					}
					oNextPosition.iY = this._aRows.length - 1;
					oNextPosition.iX--;
				}
			} else {
				oNextPosition.iX--;
				if (oNextPosition.iX < 0) {
					if (oNextPosition.iY <= 0) {
						// We reached the beginning of navigation. We should stop.
						return;
					}
					oNextPosition.iX = this._aRows[oNextPosition.iY].length - 1;
					oNextPosition.iY--;
				}
			}

			if (oNextPosition.iX === oCurrentPosition.iX && oNextPosition.iY === oCurrentPosition.iY) {
				if (bFirstTime) {
					bFirstTime = false;
				} else {
					// There is no other element to focus in this direction.
					return;
				}
			}
			oItem = this._aRows[oNextPosition.iY][oNextPosition.iX];
		} while (!oItem || !jQuery(oItem).is(":sapFocusable"));

		iIndex = this._findIndex(oNextPosition);

		this.focusItem(iIndex, oEvent);
	};

	/**
	 * Finds position of item given by index in _aRows.
	 *
	 * @param iIndex Index of item in aItemDomRefs
	 * @returns {Object} Object with iX, iY containing position of the item in the array.
	 * @private
	 */
	TimelineNavigator.prototype._findPosition = function (iIndex) {
		var iX,
			iY,
			oItem = this.aItemDomRefs[iIndex];

		for (iY = 0; iY < this._aRows.length; iY++) {
			for (iX = 0; iX < this._aRows[iY].length; iX++) {
				if (oItem === this._aRows[iY][iX]) {
					return {
						iX: iX,
						iY: iY
					};
				}
			}
		}
		return null;
	};

	/**
	 * Finds an index of item given by it's position in _aRows.
	 *
	 * @param oPosition Position object containing iX, iY coordinates of item in _aRows.
	 * @returns {number} Position of item in aItemDomRefs.
	 * @private
	 */
	TimelineNavigator.prototype._findIndex = function (oPosition) {
		var oItem = this._aRows[oPosition.iY][oPosition.iX],
			i;

		for (i = 0; i < this.aItemDomRefs.length; i++) {
			if (oItem === this.aItemDomRefs[i]) {
				return i;
			}
		}
		return null;
	};

	/**
	 * Determines weather given event should be handled by navigator.
	 *
	 * @param oEvent Event which happened.
	 * @param bCheckNavigationMode Flag which determines if navigation mode should disable navigator.
	 * @param bCheckItemSelected Flag which determines if no item selected should disable navigator.
	 * @returns {boolean} If true, navigator should not modify it's state for this event. False means navigation should continue.
	 * @private
	 */
	TimelineNavigator.prototype._skipNavigation = function (oEvent, bCheckNavigationMode, bCheckItemSelected) {
		return !jQuery.sap.containsOrEquals(this.oDomRef, oEvent.target) || //Current element is not part of the navigation content
			(this.getFocusedIndex() < 0 && bCheckItemSelected) || //No item selected
			jQuery.inArray(oEvent.target, this.aItemDomRefs) === -1 || //The selected element is not a timeline item. We don't want to block default element behavior in case of input fields etc.
			(jQuery(this.oDomRef).data("sap.InNavArea") && bCheckNavigationMode); // control is in navigation mode -> no ItemNavigation
	};

	return TimelineNavigator;
});