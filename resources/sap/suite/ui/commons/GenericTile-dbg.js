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

// Provides control sap.suite.ui.commons.GenericTile.
jQuery.sap.declare("sap.suite.ui.commons.GenericTile");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new GenericTile.
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
 * <li>{@link #getHeader header} : string</li>
 * <li>{@link #getSubheader subheader} : string</li>
 * <li>{@link #getFailedText failedText} : string</li>
 * <li>{@link #getSize size} : sap.suite.ui.commons.InfoTileSize (default: sap.suite.ui.commons.InfoTileSize.Auto)</li>
 * <li>{@link #getFrameType frameType} : sap.suite.ui.commons.FrameType (default: sap.suite.ui.commons.FrameType.OneByOne)</li>
 * <li>{@link #getBackgroundImage backgroundImage} : sap.ui.core.URI</li>
 * <li>{@link #getHeaderImage headerImage} : sap.ui.core.URI</li>
 * <li>{@link #getState state} : sap.suite.ui.commons.LoadState (default: sap.suite.ui.commons.LoadState.Loaded)</li>
 * <li>{@link #getImageDescription imageDescription} : string</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getTileContent tileContent} : sap.suite.ui.commons.TileContent[]</li>
 * <li>{@link #getIcon icon} : sap.ui.core.Control</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.suite.ui.commons.GenericTile#event:press press} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The tile control that displays the title, description, and customizable main area.
 * @extends sap.ui.core.Control
 * @version 1.46.0
 *
 * @constructor
 * @public
 * @deprecated Since version 1.34. 
 * Deprecated. Moved to openui5.
 * @name sap.suite.ui.commons.GenericTile
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.suite.ui.commons.GenericTile", { metadata : {

	deprecated : true,
	library : "sap.suite.ui.commons",
	properties : {

		/**
		 * The header of the tile.
		 */
		"header" : {type : "string", group : "Appearance", defaultValue : null},

		/**
		 * The subheader of the tile.
		 */
		"subheader" : {type : "string", group : "Appearance", defaultValue : null},

		/**
		 * The message that appears when the control is in the Failed state.
		 * @since 1.23
		 */
		"failedText" : {type : "string", group : "Appearance", defaultValue : null},

		/**
		 * The size of the tile. If not set, then the default size is applied based on the device tile.
		 */
		"size" : {type : "sap.suite.ui.commons.InfoTileSize", group : "Misc", defaultValue : sap.suite.ui.commons.InfoTileSize.Auto},

		/**
		 * The frame type: 1x1 or 2x1.
		 */
		"frameType" : {type : "sap.suite.ui.commons.FrameType", group : "Misc", defaultValue : sap.suite.ui.commons.FrameType.OneByOne},

		/**
		 * The URI of the background image.
		 */
		"backgroundImage" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

		/**
		 * The image to be displayed as a graphical element within the header. This can be an image or an icon from the icon font.
		 */
		"headerImage" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

		/**
		 * The load status.
		 * @since 1.22
		 */
		"state" : {type : "sap.suite.ui.commons.LoadState", group : "Misc", defaultValue : sap.suite.ui.commons.LoadState.Loaded},

		/**
		 * Description of a header image that is used in the tooltip.
		 * @since 1.25
		 */
		"imageDescription" : {type : "string", group : "Misc", defaultValue : null}
	},
	aggregations : {

		/**
		 * The switchable view that depends on the tile type.
		 */
		"tileContent" : {type : "sap.suite.ui.commons.TileContent", multiple : true, singularName : "tileContent"}, 

		/**
		 * An icon or image to be displayed in the control.
		 */
		"icon" : {type : "sap.ui.core.Control", multiple : false}, 

		/**
		 * The hidden aggregation for the title.
		 */
		"titleText" : {type : "sap.m.Text", multiple : false, visibility : "hidden"}, 

		/**
		 * The hidden aggregation for the message in the failed state.
		 * @since 1.24
		 */
		"failedMessageText" : {type : "sap.m.Text", multiple : false, visibility : "hidden"}
	},
	events : {

		/**
		 * The event is fired when the user chooses the tile.
		 */
		"press" : {}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.GenericTile with name <code>sClassName</code> 
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
 * @name sap.suite.ui.commons.GenericTile.extend
 * @function
 */

sap.suite.ui.commons.GenericTile.M_EVENTS = {'press':'press'};


/**
 * Getter for property <code>header</code>.
 * The header of the tile.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>header</code>
 * @public
 * @name sap.suite.ui.commons.GenericTile#getHeader
 * @function
 */

/**
 * Setter for property <code>header</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sHeader  new value for property <code>header</code>
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#setHeader
 * @function
 */


/**
 * Getter for property <code>subheader</code>.
 * The subheader of the tile.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>subheader</code>
 * @public
 * @name sap.suite.ui.commons.GenericTile#getSubheader
 * @function
 */

/**
 * Setter for property <code>subheader</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sSubheader  new value for property <code>subheader</code>
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#setSubheader
 * @function
 */


/**
 * Getter for property <code>failedText</code>.
 * The message that appears when the control is in the Failed state.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>failedText</code>
 * @public
 * @since 1.23
 * @name sap.suite.ui.commons.GenericTile#getFailedText
 * @function
 */

/**
 * Setter for property <code>failedText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sFailedText  new value for property <code>failedText</code>
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @since 1.23
 * @name sap.suite.ui.commons.GenericTile#setFailedText
 * @function
 */


/**
 * Getter for property <code>size</code>.
 * The size of the tile. If not set, then the default size is applied based on the device tile.
 *
 * Default value is <code>Auto</code>
 *
 * @return {sap.suite.ui.commons.InfoTileSize} the value of property <code>size</code>
 * @public
 * @name sap.suite.ui.commons.GenericTile#getSize
 * @function
 */

/**
 * Setter for property <code>size</code>.
 *
 * Default value is <code>Auto</code> 
 *
 * @param {sap.suite.ui.commons.InfoTileSize} oSize  new value for property <code>size</code>
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#setSize
 * @function
 */


/**
 * Getter for property <code>frameType</code>.
 * The frame type: 1x1 or 2x1.
 *
 * Default value is <code>OneByOne</code>
 *
 * @return {sap.suite.ui.commons.FrameType} the value of property <code>frameType</code>
 * @public
 * @name sap.suite.ui.commons.GenericTile#getFrameType
 * @function
 */

/**
 * Setter for property <code>frameType</code>.
 *
 * Default value is <code>OneByOne</code> 
 *
 * @param {sap.suite.ui.commons.FrameType} oFrameType  new value for property <code>frameType</code>
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#setFrameType
 * @function
 */


/**
 * Getter for property <code>backgroundImage</code>.
 * The URI of the background image.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>backgroundImage</code>
 * @public
 * @name sap.suite.ui.commons.GenericTile#getBackgroundImage
 * @function
 */

/**
 * Setter for property <code>backgroundImage</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sBackgroundImage  new value for property <code>backgroundImage</code>
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#setBackgroundImage
 * @function
 */


/**
 * Getter for property <code>headerImage</code>.
 * The image to be displayed as a graphical element within the header. This can be an image or an icon from the icon font.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>headerImage</code>
 * @public
 * @name sap.suite.ui.commons.GenericTile#getHeaderImage
 * @function
 */

/**
 * Setter for property <code>headerImage</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sHeaderImage  new value for property <code>headerImage</code>
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#setHeaderImage
 * @function
 */


/**
 * Getter for property <code>state</code>.
 * The load status.
 *
 * Default value is <code>Loaded</code>
 *
 * @return {sap.suite.ui.commons.LoadState} the value of property <code>state</code>
 * @public
 * @since 1.22
 * @name sap.suite.ui.commons.GenericTile#getState
 * @function
 */

/**
 * Setter for property <code>state</code>.
 *
 * Default value is <code>Loaded</code> 
 *
 * @param {sap.suite.ui.commons.LoadState} oState  new value for property <code>state</code>
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @since 1.22
 * @name sap.suite.ui.commons.GenericTile#setState
 * @function
 */


/**
 * Getter for property <code>imageDescription</code>.
 * Description of a header image that is used in the tooltip.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>imageDescription</code>
 * @public
 * @since 1.25
 * @name sap.suite.ui.commons.GenericTile#getImageDescription
 * @function
 */

/**
 * Setter for property <code>imageDescription</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sImageDescription  new value for property <code>imageDescription</code>
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @since 1.25
 * @name sap.suite.ui.commons.GenericTile#setImageDescription
 * @function
 */


/**
 * Getter for aggregation <code>tileContent</code>.<br/>
 * The switchable view that depends on the tile type.
 * 
 * @return {sap.suite.ui.commons.TileContent[]}
 * @public
 * @name sap.suite.ui.commons.GenericTile#getTileContent
 * @function
 */


/**
 * Inserts a tileContent into the aggregation named <code>tileContent</code>.
 *
 * @param {sap.suite.ui.commons.TileContent}
 *          oTileContent the tileContent to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the tileContent should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the tileContent is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the tileContent is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#insertTileContent
 * @function
 */

/**
 * Adds some tileContent <code>oTileContent</code> 
 * to the aggregation named <code>tileContent</code>.
 *
 * @param {sap.suite.ui.commons.TileContent}
 *            oTileContent the tileContent to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#addTileContent
 * @function
 */

/**
 * Removes an tileContent from the aggregation named <code>tileContent</code>.
 *
 * @param {int | string | sap.suite.ui.commons.TileContent} vTileContent the tileContent to remove or its index or id
 * @return {sap.suite.ui.commons.TileContent} the removed tileContent or null
 * @public
 * @name sap.suite.ui.commons.GenericTile#removeTileContent
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>tileContent</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.suite.ui.commons.TileContent[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.GenericTile#removeAllTileContent
 * @function
 */

/**
 * Checks for the provided <code>sap.suite.ui.commons.TileContent</code> in the aggregation named <code>tileContent</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.suite.ui.commons.TileContent}
 *            oTileContent the tileContent whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.suite.ui.commons.GenericTile#indexOfTileContent
 * @function
 */
	

/**
 * Destroys all the tileContent in the aggregation 
 * named <code>tileContent</code>.
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#destroyTileContent
 * @function
 */


/**
 * Getter for aggregation <code>icon</code>.<br/>
 * An icon or image to be displayed in the control.
 * 
 * @return {sap.ui.core.Control}
 * @public
 * @name sap.suite.ui.commons.GenericTile#getIcon
 * @function
 */


/**
 * Setter for the aggregated <code>icon</code>.
 * @param {sap.ui.core.Control} oIcon
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#setIcon
 * @function
 */
	

/**
 * Destroys the icon in the aggregation 
 * named <code>icon</code>.
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#destroyIcon
 * @function
 */


/**
 * The event is fired when the user chooses the tile.
 *
 * @name sap.suite.ui.commons.GenericTile#press
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'press' event of this <code>sap.suite.ui.commons.GenericTile</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.GenericTile</code>.<br/> itself. 
 *  
 * The event is fired when the user chooses the tile.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.GenericTile</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#attachPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'press' event of this <code>sap.suite.ui.commons.GenericTile</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.GenericTile#detachPress
 * @function
 */

/**
 * Fire event press to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.GenericTile} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.GenericTile#firePress
 * @function
 */

// Start of sap/suite/ui/commons/GenericTile.js
/*!
 * ${copyright}
 */

jQuery.sap.require("sap.m.GenericTile");

sap.m.GenericTile.extend("sap.suite.ui.commons.GenericTile", /** @lends sap.suite.ui.commons.GenericTile.prototype */ {
  metadata : {
    library : "sap.suite.ui.commons"
  }
});