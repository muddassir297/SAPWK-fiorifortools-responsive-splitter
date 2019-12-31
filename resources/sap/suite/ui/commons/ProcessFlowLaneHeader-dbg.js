/*!
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.suite.ui.commons.ProcessFlowLaneHeader.
jQuery.sap.declare("sap.suite.ui.commons.ProcessFlowLaneHeader");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ProcessFlowLaneHeader.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getText text} : string</li>
 * <li>{@link #getIconSrc iconSrc} : sap.ui.core.URI</li>
 * <li>{@link #getPosition position} : int</li>
 * <li>{@link #getLaneId laneId} : string</li>
 * <li>{@link #getState state} : object</li>
 * <li>{@link #getZoomLevel zoomLevel} : sap.suite.ui.commons.ProcessFlowZoomLevel</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.suite.ui.commons.ProcessFlowLaneHeader#event:press press} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * This control gives you an overview of documents/items used in a process flow. The process flow is represented by the doughnut chart sections which are colored according to the documents’ status(es). This control can be used in two different ways. If you use it standalone, an event is fired and can be caught in to display the node map. If you use it with the node/document, it gives you an overview of the documents/items used in the process flow that is represented by the doughnut chart sections.
 * @extends sap.ui.core.Control
 * @version 1.46.0
 *
 * @constructor
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.suite.ui.commons.ProcessFlowLaneHeader", { metadata : {

	library : "sap.suite.ui.commons",
	properties : {

		/**
		 * Text information that is displayed in the control.
		 */
		"text" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * Icon to be displayed in the middle of the control.
		 */
		"iconSrc" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

		/**
		 * Position of the lane in the process flow control. Numbering of the position has to be sequential and needs to start from 0.
		 */
		"position" : {type : "int", group : "Misc", defaultValue : null},

		/**
		 * Internal identification of the header.
		 */
		"laneId" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * Array of the ProcessFlowLaneState. The user can explicitly set an array with the two properties state and value of the state, for example [state:sap.suite.ui.commons.ProcessFlowNodeState.Neutral, value: 20]. Possible states are states are positive, negative, neutral, and planned.
		 */
		"state" : {type : "object", group : "Misc", defaultValue : null},

		/**
		 * Current zoom level for the lane header.
		 */
		"zoomLevel" : {type : "sap.suite.ui.commons.ProcessFlowZoomLevel", group : "Misc", defaultValue : null}
	},
	events : {

		/**
		 * This event is fired when the header is clicked.
		 */
		"press" : {
			parameters : {

				/**
				 * tbd
				 */
				"oEvent" : {type : "object"}
			}
		}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.ProcessFlowLaneHeader with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader.extend
 * @function
 */

sap.suite.ui.commons.ProcessFlowLaneHeader.M_EVENTS = {'press':'press'};


/**
 * Getter for property <code>text</code>.
 * Text information that is displayed in the control.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>text</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#getText
 * @function
 */

/**
 * Setter for property <code>text</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sText  new value for property <code>text</code>
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#setText
 * @function
 */


/**
 * Getter for property <code>iconSrc</code>.
 * Icon to be displayed in the middle of the control.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>iconSrc</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#getIconSrc
 * @function
 */

/**
 * Setter for property <code>iconSrc</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sIconSrc  new value for property <code>iconSrc</code>
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#setIconSrc
 * @function
 */


/**
 * Getter for property <code>position</code>.
 * Position of the lane in the process flow control. Numbering of the position has to be sequential and needs to start from 0.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {int} the value of property <code>position</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#getPosition
 * @function
 */

/**
 * Setter for property <code>position</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {int} iPosition  new value for property <code>position</code>
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#setPosition
 * @function
 */


/**
 * Getter for property <code>laneId</code>.
 * Internal identification of the header.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>laneId</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#getLaneId
 * @function
 */

/**
 * Setter for property <code>laneId</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sLaneId  new value for property <code>laneId</code>
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#setLaneId
 * @function
 */


/**
 * Getter for property <code>state</code>.
 * Array of the ProcessFlowLaneState. The user can explicitly set an array with the two properties state and value of the state, for example [state:sap.suite.ui.commons.ProcessFlowNodeState.Neutral, value: 20]. Possible states are states are positive, negative, neutral, and planned.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object} the value of property <code>state</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#getState
 * @function
 */

/**
 * Setter for property <code>state</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object} oState  new value for property <code>state</code>
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#setState
 * @function
 */


/**
 * Getter for property <code>zoomLevel</code>.
 * Current zoom level for the lane header.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.suite.ui.commons.ProcessFlowZoomLevel} the value of property <code>zoomLevel</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#getZoomLevel
 * @function
 */

/**
 * Setter for property <code>zoomLevel</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.suite.ui.commons.ProcessFlowZoomLevel} oZoomLevel  new value for property <code>zoomLevel</code>
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#setZoomLevel
 * @function
 */


/**
 * This event is fired when the header is clicked.
 *
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#press
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent tbd
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'press' event of this <code>sap.suite.ui.commons.ProcessFlowLaneHeader</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlowLaneHeader</code>.<br/> itself. 
 *  
 * This event is fired when the header is clicked.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlowLaneHeader</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#attachPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'press' event of this <code>sap.suite.ui.commons.ProcessFlowLaneHeader</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#detachPress
 * @function
 */

/**
 * Fire event press to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> tbd</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ProcessFlowLaneHeader#firePress
 * @function
 */

// Start of sap/suite/ui/commons/ProcessFlowLaneHeader.js
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("sap.m.Image");

/*
 * Resource bundle for the localized strings
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._oResBundle = null;

sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._mergedLanePosition = null;

/**
 * Symbol type enumeration. Describes the type of the rendered control.
 * @static
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.symbolType = {
  startSymbol: "startSymbol"
  , endSymbol: "endSymbol"
  , processSymbol: "processSymbol"
  , standardType: "standardType"
};

/**
 * ProcessFlowLineHeader constants.
 * @static
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader._constants = {
  halfGapSize: 0.0241 // half gap size in radians (ca. 2 px for full gap) // 5
  , minPercentage: 0.025 // 1/40, was halfGapSize / Math.PI (percentage equal to the size of the gap) = 0.0077
  , ringThickness: 5
  , ringInnerRadius: 24
  , positionX: 32
  , positionY: 32
  , outerCircleRadius: 32
  , outerCircleStrokeColor: "OuterCircleStrikeColor"//used implicitly to set CSS class
  , outerCircleStrokeWidth: 1
  , sectorPositiveColor: "suiteUiCommonsProcessFlowHeaderPositiveColor" // CSS class
  , sectorNegativeColor: "suiteUiCommonsProcessFlowHeaderNegativeColor" // CSS class
  , sectorNeutralColor: "suiteUiCommonsProcessFlowHeaderNeutralColor" // CSS class
  , sectorCriticalColor: "suiteUiCommonsProcessFlowHeaderCriticalColor" // CSS class
  , sectorPlannedColor: "suiteUiCommonsProcessFlowHeaderPlannedColor" // CSS class
  , ellipsis: '...'
  , ellipsisLength: 3
};

/* =========================================================== */
/* Life-cycle Handling                                         */
/* =========================================================== */

sap.suite.ui.commons.ProcessFlowLaneHeader.prototype.init = function () { // EXC_JSLINT_021
  this._virtualTableSpan = 1;

  if (!this._oResBundle) {
    this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
  }
};

sap.suite.ui.commons.ProcessFlowLaneHeader.prototype.exit = function () {
  this._destroyImage();
  this.$().unbind("click", this.ontouchend);
};

sap.suite.ui.commons.ProcessFlowLaneHeader.prototype.onBeforeRendering = function () {
  this.$("lh-icon").off('click', jQuery.proxy(this.ontouchend, this));
  this.$().unbind("click", this.ontouchend);
};

sap.suite.ui.commons.ProcessFlowLaneHeader.prototype.onAfterRendering = function () {
  var $This = this.$();
  var $icon = this.$("lh-icon");
  var sClickEvent = 'click';

  if (sap.ui.Device.support.touch) {
    sClickEvent = 'touchend';
  }
  if ($icon.length > 0) {
    $icon.on(sClickEvent, jQuery.proxy(this.ontouchend, this));
    $icon.css("cursor", "inherit");
  }

  this.$().bind("click", jQuery.proxy(this.ontouchend, this));

  if (this._isHeaderMode()) {
    $This.addClass("suiteUiProcessFlowLaneHeaderPointer");
  } else {
    $This.removeClass("suiteUiProcessFlowLaneHeaderPointer");
  }

  // IE9 and FF long-word break does not work correct, so allow to break the words anywhere.
  if (sap.ui.Device.browser.msie || sap.ui.Device.browser.mozilla) {
    this.$("lh-text").css("word-break", "break-all");
  }

  // insert ellipsis for non-webkit browsers
  if (!this._ellipsisDisabled && !sap.suite.ui.commons.ProcessFlowLaneHeader._hasNativeLineClamp) {
    this._clampText();
  }
};

/* =========================================================== */
/* Event Handling                                              */
/* =========================================================== */

/**
 * Press event handler for control click.
 *
 * @private
 * @param {sap.ui.base.Event} oEvent
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype.ontouchend = function (oEvent) {
  if (oEvent && !oEvent.isDefaultPrevented()) {
    oEvent.preventDefault();
  }
  if (this) {
    this.firePress(this);
  }
  if (oEvent && !oEvent.isPropagationStopped()) {
    oEvent.stopPropagation();
  }
  if (oEvent && !oEvent.isImmediatePropagationStopped()) {
    oEvent.stopImmediatePropagation();
  }
};

/* =========================================================== */
/* Getter/Setter private methods                               */
/* =========================================================== */

/**
* Sets the position that was changed due to artificial lanes of a merged lane as hidden property.
* If it's not set here, the property _mergedLanePosition is false.
*
* @private
* @param {position}
*/
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._setMergedPosition = function (position) {
  this._mergedLanePosition = position;
};

/**
 * Getter method for the symbol type. Returns the type of the node (variation of Lane header control).
 * For details on the available types see {sap.suite.ui.commons.ProcessFlowLaneHeader.prototype.symbolType}.
 *
 * @private
 * @returns {String} symbol type to set for the control
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._getSymbolType = function () {
  return this._oSymbolType ? this._oSymbolType : sap.suite.ui.commons.ProcessFlowLaneHeader.symbolType.standardType;
};

/**
 * Setter method for the symbol type. Specifies the type of the node to display.
 * For details on the available types see {sap.suite.ui.commons.ProcessFlowLaneHeader.symbolType}.
 *
 * @private
 * @param {String} symbolType symbol type to set for the control
 * @param {Object} context the JS object context
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._setSymbolType = function (symbolType, context) {
  context._oSymbolType = symbolType;
};

/**
 * Gets the image control for the Header, creating it if it does not already exist.
 * If the control is already created and the value of src has changed then the old control will be destroyed
 * and a new control returned.
 *
 * @private
 * @param {String} id The icon control id
 * @param {sap.ui.core.URI} src The URI of the image
 * @returns {sap.ui.core.Control}
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._getImage = function (id, src) {
  this._destroyImage();

  if (this._oImageControl) {
    this._oImageControl.setSrc(src);
  } else {
    this._oImageControl = sap.ui.core.IconPool.createControlByURI(src, sap.m.Image);
    this._oImageControl.sId = id;
    this._oImageControl.setParent(this, null, true);
  }

  //disable technical tooltip for all sap.ui.core.Icons
  if (this._oImageControl instanceof sap.ui.core.Icon) {
    this._oImageControl.setUseIconTooltip(false);
  }

  return this._oImageControl;
};

/**
 * Header mode setter. Header mode is true when a hand cursor should be displayed above the control.
 *
 * @private
 * @param {Boolean} isHeaderMode true if in header mode
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._setHeaderMode = function (isHeaderMode) {
  this._bHeaderMode = isHeaderMode;
};

/**
 * Setter for the virtual table span in PF node element count.
 *
 * @private
 * @param {number} [elementsNumber] number of PF node elements which will be under this header control
 * @since 1.23
 * @see sap.suite.ui.commons.sap.suite.ui.commons.ProcessFlowLaneHeader._setVirtualTableSpan
 */
sap.suite.ui.commons.ProcessFlowLaneHeader._setVirtualTableSpan = function (elementsCount) {
  this._virtualTableSpan = elementsCount;
};

/**
 * Getter for the virtual table span in object count. The value is used by the PF renderer to set a colspan for 2*iElements+1 lanes to fit this lane header control.
 * By default is set to 1;
 *
 * @private
 * @returns {number} Number of PF node elements which will be under this header control
 * @since 1.23
 */
sap.suite.ui.commons.ProcessFlowLaneHeader._getVirtualTableSpan = function () {
  return this._virtualTableSpan;
};

/**
 * Header mode getter. Header mode is true when a hand cursor should be displayed above the control.
 *
 * @private
 * @returns {boolean} true if the control is in header mode, false otherwise
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._isHeaderMode = function () {
  return this._bHeaderMode;
};

/* =========================================================== */
/* Helper methods                                              */
/* =========================================================== */

/**
 * Method clamps the values provided in the input array to 0 in case of values lower than minValue.
 * The method modifies the input array to one with non-negative values.
 *
 * @private
 * @param {Number[]} clampValues array of values to clamp (array of numbers)
 * @param {Number} minValue minimal value which is still not clamped to clampToValue
 * @param {Number} clampToValue value set to clampValues[i] in case clampValues[i] < minValue
 * @returns {Boolean} true if at least 1 value was clamped
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._clampValues = function (clampValues, minValue, clampToValue) {
  var i = clampValues.length - 1,
    bClamped = false,
    v;

  while (i >= 0) {
    v = clampValues[i];
    if (v < minValue) {
      clampValues[i] = clampToValue;
      bClamped = true;
    }
    i--;
  }

  return bClamped;
};

/**
 * Method re-scales the values in input array rescaleValues so their sum equals to 1.
 * The method modifies the input array to a rescaled one.
 * In case all the input values in rescaleValues are 0, the array is left unchanged.
 * All the values between (0, minPercentage> are set to minPercentage and the rest is rescaled accounting this change.
 *
 * @private
 * @param {Number[]} rescaleValues array of values to re-scale (array of numbers)
 * @param {Number} minPercentage the minimal percentage to consider (lower values will be rounded up to this value)
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._rescaleToUnit = function (rescaleValues, minPercentage) {
  var iRescaledFactor
    , i
    , iValuesGreaterMinCount
    , iValuesLessMinCount
    , iRescaleOriginalValue
    , iRescaledValue
  ;

  // if undefined, null or 0 minPercentage
  if (!minPercentage) {
    minPercentage = 0;
  }

  i = rescaleValues.length - 1;
  iRescaledFactor = 0;
  iValuesGreaterMinCount = iValuesLessMinCount = 0;

  while (i >= 0) {
    iRescaleOriginalValue = rescaleValues[i];
    if (iRescaleOriginalValue > 0) {
      if (iRescaleOriginalValue <= minPercentage) {
        iValuesLessMinCount++;
      } else {
        iRescaledFactor += rescaleValues[i];
      }
      iValuesGreaterMinCount++;
    }
    i--;
  }

  iRescaledFactor -= (iValuesGreaterMinCount - iValuesLessMinCount) * minPercentage;
  iRescaledValue = (1 - iValuesGreaterMinCount * minPercentage) / iRescaledFactor;

  i = rescaleValues.length - 1;
  while (i >= 0) {
    iRescaleOriginalValue = rescaleValues[i];
    if (iRescaleOriginalValue > 0) {
      if (iRescaleOriginalValue <= minPercentage) {
        rescaleValues[i] = minPercentage;
      } else {
        rescaleValues[i] = (iRescaleOriginalValue - minPercentage) * iRescaledValue + minPercentage;
      }
    }
    i--;
  }
};

/**
 * Method retrieves the number of gaps to be put on the donut chart given the input percentages.
 * Zero percentages are ignored. For the case of 1 value there is no gap to be displayed.
 *
 * @private
 * @param {Number[]} inputPercentages array of input percentages (array of doubles)
 * @returns {Number} iGapsCount number of gaps
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._countGaps = function (inputPercentages) {
  var i = inputPercentages.length - 1,
   iGapsCount = 0;

  while (i >= 0) {
    if (inputPercentages[i] > 0) {
      iGapsCount++;
    }
    i--;
  }

  if (iGapsCount === 1) {
    iGapsCount = 0;
  }

  return iGapsCount;
};

/**
 * Method re-scales the values in aPerc array by the provided factor.
 * The method modifies the aPerc array to the rescaled one.
 *
 * @private
 * @param {Number[]} rescaleValues array of values to re-scale
 * @param {Number} factor the scaling factor
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._rescaleByFactor = function (rescaleValues, factor) {
  var i = rescaleValues.length - 1;

  while (i >= 0) {
    rescaleValues[i] *= factor;
    i--;
  }
};

/**
 * Map of donut sector positions to the sector colors.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._colorMap = [
    sap.suite.ui.commons.ProcessFlowLaneHeader._constants.sectorPositiveColor
  , sap.suite.ui.commons.ProcessFlowLaneHeader._constants.sectorNegativeColor
  , sap.suite.ui.commons.ProcessFlowLaneHeader._constants.sectorNeutralColor
  , sap.suite.ui.commons.ProcessFlowLaneHeader._constants.sectorPlannedColor
  , sap.suite.ui.commons.ProcessFlowLaneHeader._constants.sectorCriticalColor
];

/**
 * Calculation of the donut sector angle start/end definitions along with their colors.
 *
 * @private
 * @param {Number[]} inputPercentages input percentage array (should sum up to 1)
 * @param {Number} fullGap angle for the sector gap (in radians)
 * @returns {aDefinitions[]} aDefinitions
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._calculateSectorRangeDefinitions = function (inputPercentages, fullGap) {
  var aDefinitions = []
    , fCalculatedStart = -Math.PI / 2
    , fCalculatedEnd
    , iInputPercentagesCount = inputPercentages.length
    , i = 0
  ;

  while (i < iInputPercentagesCount) {
    if (inputPercentages[i] > 0) {
      fCalculatedEnd = fCalculatedStart + 2 * Math.PI * inputPercentages[i];
      aDefinitions.push({ start: fCalculatedStart, end: fCalculatedEnd, color: this._colorMap[i] });
      fCalculatedStart = fCalculatedEnd + fullGap;
    }
    i++;
  }

  return aDefinitions;
};

/**
 * Method renders the donut sectors of the control. The method reads the "amounts" property and sets the amount
 * percentages into the donut segments accordingly.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the render manager into which the control will be rendered
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._renderDonutPercentages = function (oRm) { // EXC_SAP_006_1
  var aStateAmounts = this.getState(),
      iGaps = 0,
      aSectorDefs,
      aPerc = [0, 0, 0, 0],
      fScaleFactor,
      sColor,
      fHalfGap = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.halfGapSize,
      iRadiusInner = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.ringInnerRadius,
      iRingThickness = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.ringThickness,
      iRadiusOuter = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.ringInnerRadius + iRingThickness,
      sOuterCircleStrokeColor = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.outerCircleStrokeColor,
      iOuterCircleStrokeWidth = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.outerCircleStrokeWidth,
      iOuterCircleRadius = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.outerCircleRadius,
      iPositionX = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.positionX,
      iPositionY = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.positionY,
      fMinPercentage = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.minPercentage;

  if (aStateAmounts &&
    Object.prototype.toString.call(aStateAmounts) === '[object Array]' &&
    (aStateAmounts.length > 0)) {
    aStateAmounts.forEach(function (oStateAmount) {
      switch (oStateAmount.state) {
        case sap.suite.ui.commons.ProcessFlowNodeState.Positive:
          aPerc[0] = oStateAmount.value;
        break;
        case sap.suite.ui.commons.ProcessFlowNodeState.Negative:
          aPerc[1] = oStateAmount.value;
        break;
        case sap.suite.ui.commons.ProcessFlowNodeState.Neutral:
          aPerc[2] = oStateAmount.value;
        break;
        case sap.suite.ui.commons.ProcessFlowNodeState.Planned: // EXC_JSHINT_016
          aPerc[3] = oStateAmount.value;
        break;
        case sap.suite.ui.commons.ProcessFlowNodeState.Critical:
          aPerc[4] = oStateAmount.value;
        break;
        default: // EXC_JSLINT_073
          aPerc[3] = oStateAmount.value; // planned
      }
    });

    this._clampValues(aPerc, 0, 0);

    this._rescaleToUnit(aPerc);
    this._rescaleToUnit(aPerc, fMinPercentage);

    iGaps = this._countGaps(aPerc);

    fScaleFactor = (1 - iGaps * fHalfGap / Math.PI); // adjust the percentages for the gaps
    this._rescaleByFactor(aPerc, fScaleFactor);

    this._renderCircle(oRm, sOuterCircleStrokeColor, iOuterCircleStrokeWidth,
      iPositionX, iPositionY, iOuterCircleRadius);

    if (iGaps > 0) {
      aSectorDefs = this._calculateSectorRangeDefinitions(aPerc, 2 * fHalfGap);
      this._renderDonutSectors(oRm, aSectorDefs, iPositionX, iPositionY, iRadiusInner, iRadiusOuter);
    } else {
      sColor = this._selectColor(aPerc);
      this._renderCircle(oRm, sColor, iRingThickness, iPositionX, iPositionY,
        iRadiusInner + iRingThickness / 2);
    }
  } else {
    this._renderCircle(oRm, sOuterCircleStrokeColor, iOuterCircleStrokeWidth,
      iPositionX, iPositionY, iOuterCircleRadius);
  }
};

/**
 * Method renders the white circle around the donut segments.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the render manager into which the control will be rendered
 * @param {String} sColor background color of the circle
 * @param {String} strokeColor the stroke color of the circle
 * @param {Number} strokeWidth circle stroke width in pixels
 * @param {Number} positionX coordinate x of the middle of circle in pixels
 * @param {Number} positionY coordinate y of the middle of circle in pixels
 * @param {Number} radius radius in pixels
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._renderCircle =
  function (oRm, strokeColor, strokeWidth, positionX, positionY, radius) { // EXC_JSHINT_034
    oRm.write("<circle");
    oRm.writeAttribute("id", this.getId() + "-donut-circle");
    if (strokeColor != sap.suite.ui.commons.ProcessFlowLaneHeader._constants.outerCircleStrokeColor) {
      oRm.writeAttribute("class", "suiteUiCommonsProcessFlowHeaderIconFill " + strokeColor);
    }
    else {
      oRm.writeAttribute("class", "suiteUiCommonsProcessFlowHeaderIconFill");
    }
    oRm.writeAttribute("stroke-width", strokeWidth);
    oRm.writeAttribute("cx", positionX);
    oRm.writeAttribute("cy", positionY);
    oRm.writeAttribute("r", radius);
    oRm.write("></circle>"); // div element for the outer circle
  };

/**
 * Method renders all the donut sector paths.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the render manager into which the control will be rendered
 * @param {Object[]} aSectorDefs array of donut sector definitions containing begin end and color
 * @param {Number} positionX coordinate x of the center of sector in pixels
 * @param {Number} positionY coordinate y of the center of sector in pixels
 * @param {Number} radiusInner inner radius in pixels
 * @param {Number} radiusOuter outer radius in pixels
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._renderDonutSectors =
  function (oRm, sectorDefs, positionX, positionY, radiusInner, radiusOuter) { // EXC_JSHINT_034
    var i = 0,
      iDefLength = sectorDefs.length,
      oSector,
      sPath;

    while (i < iDefLength) {
      oSector = sectorDefs[i];
      sPath = this._getDonutSectorPath(positionX, positionY, oSector.start, oSector.end, radiusInner, radiusOuter);
      oRm.write("<path");
      oRm.writeAttribute("id", this.getId() + "-donut-segment-" + i);
      oRm.writeAttribute("d", sPath);
      oRm.writeAttribute("class", oSector.color);
      oRm.writeAttribute("opacity", "1");
      oRm.write("></path>");
      i++;
    }
  };

/**
 *  Helper method for donut sector color selection.
 *
 * @private
 * @param {Number[]} aPerc array of input percentages
 * @returns {String} color selection
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._selectColor = function (percentages) {
  var sColor;

  if (percentages[0]) {
    sColor = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.sectorPositiveColor;
  } else if (percentages[1]) {
    sColor = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.sectorNegativeColor;
  } else if (percentages[2]) {
    sColor = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.sectorNeutralColor;
  } else if (percentages[3]) {
    sColor = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.sectorPlannedColor;
  } else if (percentages[4]) {
    sColor = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.sectorCriticalColor;
  } else {
    sColor = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.sectorNeutralColor;
  }

  return sColor;
};

/**
 * Helper method returning SVG path data for a single donut sector.
 *
 * @private
 * @param {Number} positionX coordinate x of the center of sector in pixels
 * @param {Number} positionY coordinate y of the center of sector in pixels
 * @param {Number} startAngle start angle in radians (rotating right - resp. negative amount of real angle)
 * @param {Number} endAngle end angle
 * @param {Number} radiusInner inner radius in pixels
 * @param {Number} radiusOuter outer radius in pixels
 * @returns {string} string definition of the SVG path put into the "d" attribute of the svg "path" element.
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._getDonutSectorPath =
    function (positionX, positionY, startAngle, endAngle, radiusInner, radiusOuter) { // EXC_JSHINT_034
      var iOuter = 0, /* outer angle flag */
        sPosition1, sPosition2, sPosition3, sPosition4,
        sSectorPath,
        fStartAngleCos, fEndAngleCos, fStartAngleSin, fEndAngleSin;

      if ((endAngle - startAngle) % (Math.PI * 2) > Math.PI) {
        iOuter = 1;
      }

      fStartAngleCos = Math.cos(startAngle);
      fEndAngleCos = Math.cos(endAngle);
      fStartAngleSin = Math.sin(startAngle);
      fEndAngleSin = Math.sin(endAngle);

      sPosition1 = (positionX + radiusInner * fStartAngleCos).toFixed(3) + ',' + (positionY + radiusInner * fStartAngleSin).toFixed(3);
      sPosition2 = (positionX + radiusOuter * fStartAngleCos).toFixed(3) + ',' + (positionY + radiusOuter * fStartAngleSin).toFixed(3);
      sPosition3 = (positionX + radiusOuter * fEndAngleCos).toFixed(3) + ',' + (positionY + radiusOuter * fEndAngleSin).toFixed(3);
      sPosition4 = (positionX + radiusInner * fEndAngleCos).toFixed(3) + ',' + (positionY + radiusInner * fEndAngleSin).toFixed(3);
      sSectorPath = "M" + sPosition1 +
        "L" + sPosition2 +
        "A" + radiusOuter + ',' + radiusOuter + " 0 " + iOuter + " 1 " + sPosition3 +
        "L" + sPosition4 +
        "A" + radiusInner + ',' + radiusInner + " 0 " + iOuter + " 0 " + sPosition1 +
        "z";

      return sSectorPath;
    };

/**
 * Resource cleanup for the control icon.
 *
 * @private
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._destroyImage = function () {
  if (this._oImageControl) {
    this._oImageControl.destroy();
  }

  this._oImageControl = null;
};

/**
 * Clamps the wrapping text to _constants.nMaxTextLines lines and appends ellipsis ('...' if needed).
 *
 * @private
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._clampText = function () { // EXC_SAP_006_1
  var $text = this.$("lh-text").length ? this.$("lh-text") : null,
    sText = this.getText(),
    sLastText = "",
    sEllipsis = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.ellipsis,
    iEllipsisLength = sap.suite.ui.commons.ProcessFlowLaneHeader._constants.ellipsisLength,
    iStartPos = iEllipsisLength + 1,
    iMidPos,
    iEndPos = sText.length,
    iMaxHeight,
    bVisibility;

  if ($text) {
    iMaxHeight = parseInt($text.css("height").slice(0, -2), 10); // i.e. parse number from "32px"

    // We expect that less than ellipsis length number of characters never needs to be clamped
    // if text overflow - clamping is needed
    if ($text[0].scrollHeight > iMaxHeight) {

      // Save the visibility state and hide the text
      bVisibility = $text.css("visibility");
      $text.css("visibility", "hidden");

      // Search by bisection to find the position of ellipsis
      sLastText = sText;
      do {

        // Check the middle position and update text
        iMidPos = (iStartPos + iEndPos) >> 1;

        $text.textContent = sText.slice(0, iMidPos - iEllipsisLength) + sEllipsis;
        // Check for text overflow
        if ($text.scrollHeight > iMaxHeight) {
          iEndPos = iMidPos;
        } else {
          iStartPos = iMidPos;
          sLastText = $text.textContent;
        }
      } while (iEndPos - iStartPos > 1);

      // Reset to the original visibility state
      $text.css("visibility", bVisibility);
    }

    // Set the last valid solution in case of overflow
    if ($text.scrollHeight > iMaxHeight) {
      $text.textContent = sLastText;
    }
  }
};

/**
 * Defines whether browser supports native line clamp or not
 *
 * @private
 * @static
 * @returns {Boolean} true if document has webkit line clamp style, false if not
 * @readonly
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlowLaneHeader._hasNativeLineClamp = (function () {
  return document.documentElement.style.webkitLineClamp !== undefined;
}());

/**
 * Returns ARIA text for current lane header object.
 *
 * @private
 * @returns {String} Message for screen reader
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._getAriaText = function () {
  var sAriaText = "";
  var oStatuses = this.getState();
  if (oStatuses) {
    var statusValues = [];
    for (var i in oStatuses) {
      statusValues.push(oStatuses[i].value);
    }

    // Needed to rescale the values to percentage
    this._clampValues(statusValues, 0, 0);
    this._rescaleToUnit(statusValues);

    sAriaText = this._oResBundle.getText('PF_ARIA_STATUS');
    for (var j in oStatuses) {
      if (oStatuses[j].value != 0) {
        var sValueText = " " + Math.round(statusValues[j] * 100) + "% " + oStatuses[j].state + ",";
        sAriaText = sAriaText.concat(sValueText);
      }
    }
    // Removes the last character which is a ','
    sAriaText = sAriaText.slice(0, -1);
  }
  return sAriaText;
};

/**
 * Returns ARIA text for symbols in lane header.
 *
 * @private
 * @returns {String} Text for screen reader
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype._getSymbolAriaText = function () {
  var sAriaText = "";
  switch (this._getSymbolType()) {
    case sap.suite.ui.commons.ProcessFlowLaneHeader.symbolType.startSymbol:
      sAriaText = this._oResBundle.getText('PF_ARIA_SYMBOL_LANE_START');
      break;
    case sap.suite.ui.commons.ProcessFlowLaneHeader.symbolType.endSymbol:
      sAriaText = this._oResBundle.getText('PF_ARIA_SYMBOL_LANE_END');
      break;
    case sap.suite.ui.commons.ProcessFlowLaneHeader.symbolType.processSymbol:
      sAriaText = this._oResBundle.getText('PF_ARIA_SYMBOL_LANE_PROCESS');
      break;
  }
  return sAriaText;
};

/**
 * Creates the start symbol at the beginning of the lane header.
 *
 * @private
 * @param {Boolean} isHeaderMode true if the hand cursor should be displayed above the header
 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader} a new start symbol node
 * @since 1.22
 */

sap.suite.ui.commons.ProcessFlowLaneHeader.createNewStartSymbol = function (isHeaderMode) {
  var oStaticHeader = sap.suite.ui.commons.ProcessFlowLaneHeader
    , oStartSymbol = new sap.suite.ui.commons.ProcessFlowLaneHeader({
      laneId: "processFlowLaneStart"
    })
  ;

  oStartSymbol._setSymbolType(oStaticHeader.symbolType.startSymbol, oStartSymbol);
  oStartSymbol._setHeaderMode(isHeaderMode);
  return oStartSymbol;
};

/**
 * Process symbol node factory method - creates a control with a square symbol used at the end of the lane header.
 *
 * @private
 * @param {Boolean} isHeaderMode true if the hand cursor should be displayed above the header
 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader} a new end symbol node
 * @since 1.22
 *
 */

sap.suite.ui.commons.ProcessFlowLaneHeader.createNewEndSymbol = function (isHeaderMode) {
  var oStaticHeader = sap.suite.ui.commons.ProcessFlowLaneHeader
    , oEndSymbol = new sap.suite.ui.commons.ProcessFlowLaneHeader({
      laneId: "processFlowLaneEnd"
    })
  ;

  oEndSymbol._setSymbolType(oStaticHeader.symbolType.endSymbol, oEndSymbol);
  oEndSymbol._setHeaderMode(isHeaderMode);
  return oEndSymbol;
};

/**
 * Process symbol node factory method - creates a control with a '>>>' symbol.
 *
 * @private
 * @param {Boolean} isHeaderMode true if the hand cursor should be displayed above the header
 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader} a new process symbol node
 * @since 1.22
 *
 */

sap.suite.ui.commons.ProcessFlowLaneHeader.createNewProcessSymbol = function (isHeaderMode) {
  var oStaticHeader = sap.suite.ui.commons.ProcessFlowLaneHeader
    , oProcessSymbol = new sap.suite.ui.commons.ProcessFlowLaneHeader({
      laneId: "processFlowLaneProcess", iconSrc: "sap-icon://process"
    })
  ;

  oProcessSymbol._setSymbolType(oStaticHeader.symbolType.processSymbol, oProcessSymbol);
  oProcessSymbol._setHeaderMode(isHeaderMode);
  return oProcessSymbol;
};

/**
 * Enable/disable ellipsis support for non-webkit browsers (for the case where there is no native ellipsis support).
 * It is recommended to disable the ellipsis support in case the control is inserted
 * into a container of variable width as the ellipsis position is not updated automatically.
 * By default the ellipsis support is enabled.
 *
 * @private
 * @param {Boolean} isSupportEnabled false if the ellipsis support is to be disabled
 * @since 1.22
 *
 */

sap.suite.ui.commons.ProcessFlowLaneHeader.enableEllipsisSupportForText = function (isSupportEnabled) {
  this._ellipsisDisabled = !isSupportEnabled;
};

/* =========================================================== */
/* Public methods                                              */
/* =========================================================== */

/**
 * Overrides the getter method for property position. It returns the position that was changed due to the artificial merged lanes.
 * Otherwise it returns the position set in the model.
 *
 * @public
 */
sap.suite.ui.commons.ProcessFlowLaneHeader.prototype.getPosition = function () {
  if (this._mergedLanePosition) {
    return this._mergedLanePosition;
  } else {
    return this.getProperty("position");
  }
};