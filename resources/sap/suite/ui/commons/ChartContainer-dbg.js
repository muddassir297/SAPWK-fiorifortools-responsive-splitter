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

// Provides control sap.suite.ui.commons.ChartContainer.
jQuery.sap.declare("sap.suite.ui.commons.ChartContainer");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ChartContainer.
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
 * <li>{@link #getShowPersonalization showPersonalization} : boolean (default: false)</li>
 * <li>{@link #getShowFullScreen showFullScreen} : boolean (default: false)</li>
 * <li>{@link #getFullScreen fullScreen} : boolean (default: false)</li>
 * <li>{@link #getShowLegend showLegend} : boolean (default: true)</li>
 * <li>{@link #getTitle title} : string (default: '')</li>
 * <li>{@link #getSelectorGroupLabel selectorGroupLabel} : string</li>
 * <li>{@link #getAutoAdjustHeight autoAdjustHeight} : boolean (default: false)</li>
 * <li>{@link #getShowZoom showZoom} : boolean (default: true)</li>
 * <li>{@link #getShowLegendButton showLegendButton} : boolean (default: true)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getDimensionSelectors dimensionSelectors} : sap.ui.core.Control[]</li>
 * <li>{@link #getContent content} <strong>(default aggregation)</strong> : sap.suite.ui.commons.ChartContainerContent[]</li>
 * <li>{@link #getToolbar toolbar} : sap.m.OverflowToolbar</li>
 * <li>{@link #getCustomIcons customIcons} : sap.ui.core.Icon[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.suite.ui.commons.ChartContainer#event:personalizationPress personalizationPress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ChartContainer#event:contentChange contentChange} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ChartContainer#event:customZoomInPress customZoomInPress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ChartContainer#event:customZoomOutPress customZoomOutPress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Provides a toolbar with generic functions for tables and charts based on the VizFrame control like zoom, display in fullscreen mode, toggle the legend, switch between chart types, and changes of the chart dimension. The controls of the content aggregation are positioned below the toolbar. Additional functions can be added to the toolbar with the customIcons aggregation.
 * @extends sap.ui.core.Control
 *
 * @author SAP SE
 * @version 1.46.0
 *
 * @constructor
 * @public
 * @name sap.suite.ui.commons.ChartContainer
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.suite.ui.commons.ChartContainer", { metadata : {

	publicMethods : [
		// methods
		"switchChart", "updateChartContainer", "getSelectedContent"
	],
	library : "sap.suite.ui.commons",
	properties : {

		/**
		 * Set to true to display the personalization icon. Set to false to hide it.
		 */
		"showPersonalization" : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * Set to true to display the full screen icon. Set to false to hide it.
		 */
		"showFullScreen" : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * Display the chart and the toolbar in full screen or normal mode.
		 */
		"fullScreen" : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * Set to true to display the charts' legends. Set to false to hide them. See also showLegendButton.
		 */
		"showLegend" : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * String shown if there are no dimensions to display.
		 */
		"title" : {type : "string", group : "Misc", defaultValue : ''},

		/**
		 * Custom Label for Selectors Group.
		 * @deprecated Since version 1.32.0. 
		 * Obsolete property as sap.m.Toolbar is replaced by sap.m.OverflowToolbar.
		 */
		"selectorGroupLabel" : {type : "string", group : "Misc", defaultValue : null, deprecated: true},

		/**
		 * Determine whether to stretch the chart height to the maximum possible height of ChartContainer's parent container. As a prerequisite, the parent container needs to have a fixed value height or be able to determine height from its parent.
		 */
		"autoAdjustHeight" : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * Set to true to display zoom icons. Set to false to hide them.
		 */
		"showZoom" : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * Set to true or false to display or hide a button for controlling the visbility of the chart's legend. Please be aware that setting this property to true indirectly is setting showLegend to false. If you need to hide the button but to show the legend, you need to set showLegend at a later point in time (onBeforeRendering). The execution order of the combined properties is not guaranteed by the control.
		 */
		"showLegendButton" : {type : "boolean", group : "Misc", defaultValue : true}
	},
	defaultAggregation : "content",
	aggregations : {

		/**
		 * Dimension Selects.
		 */
		"dimensionSelectors" : {type : "sap.ui.core.Control", multiple : true, singularName : "dimensionSelector"}, 

		/**
		 * ChartToolBar Content aggregation. Only sap.viz.ui5.controls.VizFrame, sap.m.Table and sap.ui.table.Table can be embedded.
		 * If not specified explicitly, the rendering order of the charts is determined by the sequence of contents provided by the application via this aggregation. This means, per default the first chart of the aggregation will be rendered within the container.
		 */
		"content" : {type : "sap.suite.ui.commons.ChartContainerContent", multiple : true, singularName : "content"}, 

		/**
		 * Overflow ToolBar. If an external toolbar is used, it will be integrated with the embedded toolbar via a placeholder.
		 * This placeholder is mandatory, and it needs to be of type 'sap.suite.ui.commons.ChartContainerToolbarPlaceholder'.
		 */
		"toolbar" : {type : "sap.m.OverflowToolbar", multiple : false}, 

		/**
		 * This aggregation contains the custom icons that should be displayed additionally on the toolbar.
		 * It is not guaranteed that the same instance of the sap.ui.core.Icon control will be used within the toolbar,
		 * but the toolbar will contain a sap.m.OverflowToolbarButton with an icon property equal to the src property
		 * of the sap.ui.core.Icon provided in the aggregation.
		 * If a press event is triggered by the icon displayed on the toolbar, then the press handler of
		 * the original sap.ui.core.Icon control is used. The instance of the control, that has triggered the press event,
		 * can be accessed using the "controlReference" parameter of the event object.
		 */
		"customIcons" : {type : "sap.ui.core.Icon", multiple : true, singularName : "customIcon"}
	},
	events : {

		/**
		 * Event fired when a user clicks on the personalization icon.
		 */
		"personalizationPress" : {}, 

		/**
		 * Event fired when a user changes the displayed content.
		 */
		"contentChange" : {
			parameters : {

				/**
				 * Id of the selected item.
				 */
				"selectedItemId" : {type : "string"}
			}
		}, 

		/**
		 * Custom event for zoom in.
		 */
		"customZoomInPress" : {}, 

		/**
		 * Custom event for zoom out.
		 */
		"customZoomOutPress" : {}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.ChartContainer with name <code>sClassName</code> 
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
 * @name sap.suite.ui.commons.ChartContainer.extend
 * @function
 */

sap.suite.ui.commons.ChartContainer.M_EVENTS = {'personalizationPress':'personalizationPress','contentChange':'contentChange','customZoomInPress':'customZoomInPress','customZoomOutPress':'customZoomOutPress'};


/**
 * Getter for property <code>showPersonalization</code>.
 * Set to true to display the personalization icon. Set to false to hide it.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showPersonalization</code>
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getShowPersonalization
 * @function
 */

/**
 * Setter for property <code>showPersonalization</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowPersonalization  new value for property <code>showPersonalization</code>
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#setShowPersonalization
 * @function
 */


/**
 * Getter for property <code>showFullScreen</code>.
 * Set to true to display the full screen icon. Set to false to hide it.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showFullScreen</code>
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getShowFullScreen
 * @function
 */

/**
 * Setter for property <code>showFullScreen</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowFullScreen  new value for property <code>showFullScreen</code>
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#setShowFullScreen
 * @function
 */


/**
 * Getter for property <code>fullScreen</code>.
 * Display the chart and the toolbar in full screen or normal mode.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>fullScreen</code>
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getFullScreen
 * @function
 */

/**
 * Setter for property <code>fullScreen</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bFullScreen  new value for property <code>fullScreen</code>
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#setFullScreen
 * @function
 */


/**
 * Getter for property <code>showLegend</code>.
 * Set to true to display the charts' legends. Set to false to hide them. See also showLegendButton.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showLegend</code>
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getShowLegend
 * @function
 */

/**
 * Setter for property <code>showLegend</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowLegend  new value for property <code>showLegend</code>
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#setShowLegend
 * @function
 */


/**
 * Getter for property <code>title</code>.
 * String shown if there are no dimensions to display.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>title</code>
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getTitle
 * @function
 */

/**
 * Setter for property <code>title</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTitle  new value for property <code>title</code>
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#setTitle
 * @function
 */


/**
 * Getter for property <code>selectorGroupLabel</code>.
 * Custom Label for Selectors Group.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>selectorGroupLabel</code>
 * @public
 * @deprecated Since version 1.32.0. 
 * Obsolete property as sap.m.Toolbar is replaced by sap.m.OverflowToolbar.
 * @name sap.suite.ui.commons.ChartContainer#getSelectorGroupLabel
 * @function
 */

/**
 * Setter for property <code>selectorGroupLabel</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sSelectorGroupLabel  new value for property <code>selectorGroupLabel</code>
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.32.0. 
 * Obsolete property as sap.m.Toolbar is replaced by sap.m.OverflowToolbar.
 * @name sap.suite.ui.commons.ChartContainer#setSelectorGroupLabel
 * @function
 */


/**
 * Getter for property <code>autoAdjustHeight</code>.
 * Determine whether to stretch the chart height to the maximum possible height of ChartContainer's parent container. As a prerequisite, the parent container needs to have a fixed value height or be able to determine height from its parent.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>autoAdjustHeight</code>
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getAutoAdjustHeight
 * @function
 */

/**
 * Setter for property <code>autoAdjustHeight</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bAutoAdjustHeight  new value for property <code>autoAdjustHeight</code>
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#setAutoAdjustHeight
 * @function
 */


/**
 * Getter for property <code>showZoom</code>.
 * Set to true to display zoom icons. Set to false to hide them.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showZoom</code>
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getShowZoom
 * @function
 */

/**
 * Setter for property <code>showZoom</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowZoom  new value for property <code>showZoom</code>
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#setShowZoom
 * @function
 */


/**
 * Getter for property <code>showLegendButton</code>.
 * Set to true or false to display or hide a button for controlling the visbility of the chart's legend. Please be aware that setting this property to true indirectly is setting showLegend to false. If you need to hide the button but to show the legend, you need to set showLegend at a later point in time (onBeforeRendering). The execution order of the combined properties is not guaranteed by the control.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showLegendButton</code>
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getShowLegendButton
 * @function
 */

/**
 * Setter for property <code>showLegendButton</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowLegendButton  new value for property <code>showLegendButton</code>
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#setShowLegendButton
 * @function
 */


/**
 * Getter for aggregation <code>dimensionSelectors</code>.<br/>
 * Dimension Selects.
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getDimensionSelectors
 * @function
 */


/**
 * Inserts a dimensionSelector into the aggregation named <code>dimensionSelectors</code>.
 *
 * @param {sap.ui.core.Control}
 *          oDimensionSelector the dimensionSelector to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the dimensionSelector should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the dimensionSelector is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the dimensionSelector is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#insertDimensionSelector
 * @function
 */

/**
 * Adds some dimensionSelector <code>oDimensionSelector</code> 
 * to the aggregation named <code>dimensionSelectors</code>.
 *
 * @param {sap.ui.core.Control}
 *            oDimensionSelector the dimensionSelector to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#addDimensionSelector
 * @function
 */

/**
 * Removes an dimensionSelector from the aggregation named <code>dimensionSelectors</code>.
 *
 * @param {int | string | sap.ui.core.Control} vDimensionSelector the dimensionSelector to remove or its index or id
 * @return {sap.ui.core.Control} the removed dimensionSelector or null
 * @public
 * @name sap.suite.ui.commons.ChartContainer#removeDimensionSelector
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>dimensionSelectors</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.ChartContainer#removeAllDimensionSelectors
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>dimensionSelectors</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oDimensionSelector the dimensionSelector whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.suite.ui.commons.ChartContainer#indexOfDimensionSelector
 * @function
 */
	

/**
 * Destroys all the dimensionSelectors in the aggregation 
 * named <code>dimensionSelectors</code>.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#destroyDimensionSelectors
 * @function
 */


/**
 * Getter for aggregation <code>content</code>.<br/>
 * ChartToolBar Content aggregation. Only sap.viz.ui5.controls.VizFrame, sap.m.Table and sap.ui.table.Table can be embedded.
 * If not specified explicitly, the rendering order of the charts is determined by the sequence of contents provided by the application via this aggregation. This means, per default the first chart of the aggregation will be rendered within the container.
 * 
 * <strong>Note</strong>: this is the default aggregation for ChartContainer.
 * @return {sap.suite.ui.commons.ChartContainerContent[]}
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getContent
 * @function
 */


/**
 * Inserts a content into the aggregation named <code>content</code>.
 *
 * @param {sap.suite.ui.commons.ChartContainerContent}
 *          oContent the content to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the content should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the content is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the content is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#insertContent
 * @function
 */

/**
 * Adds some content <code>oContent</code> 
 * to the aggregation named <code>content</code>.
 *
 * @param {sap.suite.ui.commons.ChartContainerContent}
 *            oContent the content to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#addContent
 * @function
 */

/**
 * Removes an content from the aggregation named <code>content</code>.
 *
 * @param {int | string | sap.suite.ui.commons.ChartContainerContent} vContent the content to remove or its index or id
 * @return {sap.suite.ui.commons.ChartContainerContent} the removed content or null
 * @public
 * @name sap.suite.ui.commons.ChartContainer#removeContent
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>content</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.suite.ui.commons.ChartContainerContent[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.ChartContainer#removeAllContent
 * @function
 */

/**
 * Checks for the provided <code>sap.suite.ui.commons.ChartContainerContent</code> in the aggregation named <code>content</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.suite.ui.commons.ChartContainerContent}
 *            oContent the content whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.suite.ui.commons.ChartContainer#indexOfContent
 * @function
 */
	

/**
 * Destroys all the content in the aggregation 
 * named <code>content</code>.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#destroyContent
 * @function
 */


/**
 * Getter for aggregation <code>toolbar</code>.<br/>
 * Overflow ToolBar. If an external toolbar is used, it will be integrated with the embedded toolbar via a placeholder.
 * This placeholder is mandatory, and it needs to be of type 'sap.suite.ui.commons.ChartContainerToolbarPlaceholder'.
 * 
 * @return {sap.m.OverflowToolbar}
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getToolbar
 * @function
 */


/**
 * Setter for the aggregated <code>toolbar</code>.
 * @param {sap.m.OverflowToolbar} oToolbar
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#setToolbar
 * @function
 */
	

/**
 * Destroys the toolbar in the aggregation 
 * named <code>toolbar</code>.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#destroyToolbar
 * @function
 */


/**
 * Getter for aggregation <code>customIcons</code>.<br/>
 * This aggregation contains the custom icons that should be displayed additionally on the toolbar.
 * It is not guaranteed that the same instance of the sap.ui.core.Icon control will be used within the toolbar,
 * but the toolbar will contain a sap.m.OverflowToolbarButton with an icon property equal to the src property
 * of the sap.ui.core.Icon provided in the aggregation.
 * If a press event is triggered by the icon displayed on the toolbar, then the press handler of
 * the original sap.ui.core.Icon control is used. The instance of the control, that has triggered the press event,
 * can be accessed using the "controlReference" parameter of the event object.
 * 
 * @return {sap.ui.core.Icon[]}
 * @public
 * @name sap.suite.ui.commons.ChartContainer#getCustomIcons
 * @function
 */


/**
 * Inserts a customIcon into the aggregation named <code>customIcons</code>.
 *
 * @param {sap.ui.core.Icon}
 *          oCustomIcon the customIcon to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the customIcon should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the customIcon is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the customIcon is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#insertCustomIcon
 * @function
 */

/**
 * Adds some customIcon <code>oCustomIcon</code> 
 * to the aggregation named <code>customIcons</code>.
 *
 * @param {sap.ui.core.Icon}
 *            oCustomIcon the customIcon to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#addCustomIcon
 * @function
 */

/**
 * Removes an customIcon from the aggregation named <code>customIcons</code>.
 *
 * @param {int | string | sap.ui.core.Icon} vCustomIcon the customIcon to remove or its index or id
 * @return {sap.ui.core.Icon} the removed customIcon or null
 * @public
 * @name sap.suite.ui.commons.ChartContainer#removeCustomIcon
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>customIcons</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Icon[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.ChartContainer#removeAllCustomIcons
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Icon</code> in the aggregation named <code>customIcons</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Icon}
 *            oCustomIcon the customIcon whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.suite.ui.commons.ChartContainer#indexOfCustomIcon
 * @function
 */
	

/**
 * Destroys all the customIcons in the aggregation 
 * named <code>customIcons</code>.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#destroyCustomIcons
 * @function
 */


/**
 * Event fired when a user clicks on the personalization icon.
 *
 * @name sap.suite.ui.commons.ChartContainer#personalizationPress
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'personalizationPress' event of this <code>sap.suite.ui.commons.ChartContainer</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ChartContainer</code>.<br/> itself. 
 *  
 * Event fired when a user clicks on the personalization icon.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ChartContainer</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#attachPersonalizationPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'personalizationPress' event of this <code>sap.suite.ui.commons.ChartContainer</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#detachPersonalizationPress
 * @function
 */

/**
 * Fire event personalizationPress to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ChartContainer#firePersonalizationPress
 * @function
 */


/**
 * Event fired when a user changes the displayed content.
 *
 * @name sap.suite.ui.commons.ChartContainer#contentChange
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {string} oControlEvent.getParameters.selectedItemId Id of the selected item.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'contentChange' event of this <code>sap.suite.ui.commons.ChartContainer</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ChartContainer</code>.<br/> itself. 
 *  
 * Event fired when a user changes the displayed content.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ChartContainer</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#attachContentChange
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'contentChange' event of this <code>sap.suite.ui.commons.ChartContainer</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#detachContentChange
 * @function
 */

/**
 * Fire event contentChange to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'selectedItemId' of type <code>string</code> Id of the selected item.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ChartContainer#fireContentChange
 * @function
 */


/**
 * Custom event for zoom in.
 *
 * @name sap.suite.ui.commons.ChartContainer#customZoomInPress
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'customZoomInPress' event of this <code>sap.suite.ui.commons.ChartContainer</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ChartContainer</code>.<br/> itself. 
 *  
 * Custom event for zoom in.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ChartContainer</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#attachCustomZoomInPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'customZoomInPress' event of this <code>sap.suite.ui.commons.ChartContainer</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#detachCustomZoomInPress
 * @function
 */

/**
 * Fire event customZoomInPress to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ChartContainer#fireCustomZoomInPress
 * @function
 */


/**
 * Custom event for zoom out.
 *
 * @name sap.suite.ui.commons.ChartContainer#customZoomOutPress
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'customZoomOutPress' event of this <code>sap.suite.ui.commons.ChartContainer</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ChartContainer</code>.<br/> itself. 
 *  
 * Custom event for zoom out.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ChartContainer</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#attachCustomZoomOutPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'customZoomOutPress' event of this <code>sap.suite.ui.commons.ChartContainer</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ChartContainer#detachCustomZoomOutPress
 * @function
 */

/**
 * Fire event customZoomOutPress to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ChartContainer} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ChartContainer#fireCustomZoomOutPress
 * @function
 */


/**
 * Switch display content in the container.
 *
 * @name sap.suite.ui.commons.ChartContainer#switchChart
 * @function
 * @type sap.suite.ui.commons.ChartContainerContent
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Update ChartContainer rerendering all its contents.
 *
 * @name sap.suite.ui.commons.ChartContainer#updateChartContainer
 * @function
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Returns the currently selected content control.
 *
 * @name sap.suite.ui.commons.ChartContainer#getSelectedContent
 * @function
 * @type sap.ui.core.Control
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */

// Start of sap/suite/ui/commons/ChartContainer.js
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.m.ButtonType");
jQuery.sap.require("sap.m.Title");
jQuery.sap.require("sap.m.OverflowToolbarButton");
jQuery.sap.require("sap.m.Select");
jQuery.sap.require("sap.m.SegmentedButton");
jQuery.sap.require("sap.m.ToolbarSpacer");
jQuery.sap.require("sap.ui.core.CustomData");
jQuery.sap.require("sap.ui.core.delegate.ScrollEnablement");
jQuery.sap.require("sap.ui.core.Popup");
jQuery.sap.require("sap.ui.core.ResizeHandler");
jQuery.sap.require("sap.ui.Device");
sap.ui.getCore().loadLibrary("sap.viz");

/* ============================================================ */
/* Life-cycle Handling                                          */
/* ============================================================ */

sap.suite.ui.commons.ChartContainer.prototype.init = function() {
	//private properties
	this._aUsedContentIcons = [];
	this._aCustomIcons = [];
	this._oToolBar = null;
	this._aToolbarContent; // application toolbar content
	this._aDimensionSelectors = [];
	this._bChartContentHasChanged = false;
	this._bControlNotRendered = true;
	this._bSegmentedButtonSaveSelectState = false;
	this._mOriginalVizFrameHeights = {};
	this._oActiveChartButton = null;
	this._oSelectedContent = null;
	this._sResizeListenerId = null;
	this._bHasApplicationToolbar = false;
	this._iPlaceholderPosition = 0; // Index of the placeholder inside application toolbar

	//Resource bundle
	this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	//Right side..

	//Full screen button
	this._oFullScreenButton = new sap.m.ToggleButton({
		icon : "sap-icon://full-screen",
		type : sap.m.ButtonType.Transparent,
		tooltip : this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN"),
		press : this._onFullScreenButtonPress.bind(this)
	});

	//Popup for chart content
	this._oPopup = new sap.ui.core.Popup({
		modal : true,
		shadow : false,
		autoClose : false
	});

	//legend button
	this._oShowLegendButton = new sap.m.OverflowToolbarButton({
		icon : "sap-icon://legend",
		type : sap.m.ButtonType.Transparent,
		text : this._oResBundle.getText("CHARTCONTAINER_LEGEND"),
		tooltip : this._oResBundle.getText("CHARTCONTAINER_LEGEND"),
		press : this._onShowLegendButtonPress.bind(this)
	});

	//personalization button
	this._oPersonalizationButton = new sap.m.OverflowToolbarButton({
		icon : "sap-icon://action-settings",
		type : sap.m.ButtonType.Transparent,
		text : this._oResBundle.getText("CHARTCONTAINER_PERSONALIZE"),
		tooltip : this._oResBundle.getText("CHARTCONTAINER_PERSONALIZE"),
		press : this._onPersonalizationButtonPress.bind(this)
	});

	//zoom in button
	this._oZoomInButton = new sap.m.OverflowToolbarButton({
		icon : "sap-icon://zoom-in",
		type : sap.m.ButtonType.Transparent,
		text : this._oResBundle.getText("CHARTCONTAINER_ZOOMIN"),
		tooltip : this._oResBundle.getText("CHARTCONTAINER_ZOOMIN"),
		press : this._zoom.bind(this, true)
	});

	//zoom out button
	this._oZoomOutButton = new sap.m.OverflowToolbarButton({
		icon : "sap-icon://zoom-out",
		type : sap.m.ButtonType.Transparent,
		text : this._oResBundle.getText("CHARTCONTAINER_ZOOMOUT"),
		tooltip : this._oResBundle.getText("CHARTCONTAINER_ZOOMOUT"),
		press : this._zoom.bind(this, false)
	});

	//segmentedButton for chart and table
	this._oChartSegmentedButton = new sap.m.SegmentedButton({
		select : this._onChartSegmentButtonSelect.bind(this)
	});

	//Left side...
	//display title if no dimension selectors
	this._oChartTitle = new sap.m.Title();
};

sap.suite.ui.commons.ChartContainer.prototype.onAfterRendering = function() {
	this._sResizeListenerId = sap.ui.core.ResizeHandler.register(this, this._performHeightChanges.bind(this));
	if (!sap.ui.Device.system.desktop) {
		sap.ui.Device.resize.attachHandler(this._performHeightChanges, this);
	}

	if (this.getAutoAdjustHeight() || this.getFullScreen()) {
		//fix the flickering issue when switch chart in full screen mode
		jQuery.sap.delayedCall(500, this, this._performHeightChanges.bind(this));
	}
	var oSelectedContent = this.getSelectedContent();
	var bVizFrameSelected = oSelectedContent && oSelectedContent.getContent() instanceof sap.viz.ui5.controls.VizFrame;
	this._oScrollEnablement = new sap.ui.core.delegate.ScrollEnablement(this, this.getId() + "-wrapper", {
		horizontal : !bVizFrameSelected,
		vertical : !bVizFrameSelected
	});
	this._bControlNotRendered = false;
};

sap.suite.ui.commons.ChartContainer.prototype.onBeforeRendering = function() {
	if (this._sResizeListenerId) {
		sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
		this._sResizeListenerId = null;
	}
	if (!sap.ui.Device.system.desktop) {
		sap.ui.Device.resize.detachHandler(this._performHeightChanges, this);
	}

	if (this._bChartContentHasChanged || this._bControlNotRendered) {
		this._chartChange();
	}

	var aCustomIconsToBeDeleted = this._aCustomIcons; // Buttons in array have to be destroyed later on
	this._aCustomIcons = []; // Array has to be deleted to be synched with aggregation "customIcons"
	var aCustomIcons = this.getAggregation("customIcons");
	if (aCustomIcons && aCustomIcons.length > 0) {
		for (var i = 0; i < aCustomIcons.length; i++) {
			this._addButtonToCustomIcons(aCustomIcons[i]);
		}
	}

	//integrate toolbar inside the chart
	if (this._bControlNotRendered) {
		if (!this.getToolbar()) {
			//overflow embedded toolbar
			this.setAggregation("toolbar", new sap.m.OverflowToolbar({design:"Transparent"}));
		}
	}
	this._adjustDisplay();
	this._destroyButtons(aCustomIconsToBeDeleted); // Destroy buttons from custom icons array
};

sap.suite.ui.commons.ChartContainer.prototype.exit = function() {
	if (this._oFullScreenButton) {
		this._oFullScreenButton.destroy();
		this._oFullScreenButton = undefined;
	}
	if (this._oPopup) {
		this._oPopup.destroy();
		this._oPopup = undefined;
	}
	if (this._oShowLegendButton) {
		this._oShowLegendButton.destroy();
		this._oShowLegendButton = undefined;
	}
	if (this._oPersonalizationButton) {
		this._oPersonalizationButton.destroy();
		this._oPersonalizationButton = undefined;
	}
	if (this._oActiveChartButton) {
		this._oActiveChartButton.destroy();
		this._oActiveChartButton = undefined;
	}
	if (this._oChartSegmentedButton) {
		this._oChartSegmentedButton.destroy();
		this._oChartSegmentedButton = undefined;
	}
	if (this._oSelectedContent) {
		this._oSelectedContent.destroy();
		this._oSelectedContent = undefined;
	}
	if (this._oToolBar) {
		this._oToolBar.destroy();
		this._oToolBar = undefined;
	}
	if (this._aDimensionSelectors) {
		for (var i = 0; i < this._aDimensionSelectors.length; i++){
			if (this._aDimensionSelectors[i]) {
				this._aDimensionSelectors[i].destroy();
			}
		}
		this._aDimensionSelectors = undefined;
	}
	if (this._oScrollEnablement) {
		this._oScrollEnablement.destroy();
		this._oScrollEnablement = undefined;
	}
	if (this._sResizeListenerId) {
		sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
		this._sResizeListenerId = null;
	}
	if (!sap.ui.Device.system.desktop) {
		sap.ui.Device.resize.detachHandler(this._performHeightChanges, this);
	}
	if (this._oZoomInButton) {
		this._oZoomInButton.destroy();
		this._oZoomInButton = undefined;
	}
	if (this._oZoomOutButton) {
		this._oZoomOutButton.destroy();
		this._oZoomOutButton = undefined;
	}
};

/* =========================================================== */
/* Event Handling                                              */
/* =========================================================== */

/**
 * Button icon press event handler.
 *
 * @param {sap.ui.base.Event} oEvent Event object
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._onButtonIconPress = function(oEvent) {
	var sChartId = oEvent.getSource().getCustomData()[0].getValue();
	this._switchChart(sChartId);
};

/**
 * Full screen button press event handler.
 *
 * @param {sap.ui.base.Event} oEvent Event object
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._onFullScreenButtonPress = function(oEvent) {
	if (oEvent.getParameter("pressed") === true) {
		this._oFullScreenButton.setTooltip(this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN_CLOSE"));
		this._oFullScreenButton.setIcon("sap-icon://exit-full-screen");
	} else {
		this._oFullScreenButton.setTooltip(this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN"));
		this._oFullScreenButton.setIcon("sap-icon://full-screen");
	}
	this._bSegmentedButtonSaveSelectState = true;
	this._toggleFullScreen();
	this._oFullScreenButton.focus();
};

/**
 * Show legend button press event handler.
 *
 * @param {sap.ui.base.Event} oEvent Event object
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._onShowLegendButtonPress = function(oEvent) {
	this._bSegmentedButtonSaveSelectState = true;
	this._onLegendButtonPress();
};

/**
 * Chart segment button select event handler.
 *
 * @param {sap.ui.base.Event} oEvent Event object
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._onChartSegmentButtonSelect = function(oEvent) {
	var sChartId = oEvent.getParameter("button").getCustomData()[0].getValue();
	this._bSegmentedButtonSaveSelectState = true;
	this._switchChart(sChartId);
};

/**
 * Overflow Toolbar button press event handler.
 *
 * @param {sap.ui.base.Event} oEvent Event object
 * @param {Object} data Press event data
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._onOverflowToolbarButtonPress = function(oEvent, data) {
	data.icon.firePress({
		controlReference : oEvent.getSource()
	});
};

/**
 * Legend button press event handler.
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._onLegendButtonPress = function() {
	var oSelectedContent = this.getSelectedContent();
	if (oSelectedContent) {
		var selectedChart = oSelectedContent.getContent();
		//only support if content has legendVisible property
		if (jQuery.isFunction(selectedChart.getLegendVisible)) {
			var legendOn = selectedChart.getLegendVisible();
			selectedChart.setLegendVisible(!legendOn);
			this.setShowLegend(!legendOn);
		} else {
			this.setShowLegend(!this.getShowLegend());
		}
	} else {
		this.setShowLegend(!this.getShowLegend());
	}
};

/**
 * Personalization button press event handler.
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._onPersonalizationButtonPress = function() {
	this.firePersonalizationPress();
};

/* =========================================================== */
/* Getter/Setter private methods                               */
/* =========================================================== */

/**
 * Setter for private property oSelectedContent.
 *
 * @private
 * @param {sap.ui.core.Control} selectedContent The object to be set as currently viewed
 * @returns {sap.suite.ui.commons.ChartContainer} Reference to this in order to allow method chaining
 */
sap.suite.ui.commons.ChartContainer.prototype._setSelectedContent = function(selectedContent) {
	if (this.getSelectedContent() === selectedContent) {
		return this;
	}
	if (selectedContent === null) {
		this._oShowLegendButton.setVisible(false);
		return this;
	}
	//show/hide the showLegend buttons
	var oChart = selectedContent.getContent();
	this._toggleShowLegendButtons(oChart);

	var bShowChart = (oChart instanceof sap.viz.ui5.controls.VizFrame) || (jQuery.isFunction(oChart.setLegendVisible)); //hide legend icon if table, show if chart
	if (this.getShowLegendButton()){
		this._oShowLegendButton.setVisible(bShowChart);
	}
	var bShowZoom = (this.getShowZoom()) && (sap.ui.Device.system.desktop) && (oChart instanceof sap.viz.ui5.controls.VizFrame);
	this._oZoomInButton.setVisible(bShowZoom);
	this._oZoomOutButton.setVisible(bShowZoom);
	this._oSelectedContent = selectedContent;
	return this;
};

/**
 * Toggles the showLegend buttons.
 *
 * @private
 * @param {sap.ui.core.Control} chart Selected content
 */
sap.suite.ui.commons.ChartContainer.prototype._toggleShowLegendButtons = function(chart) {
	var sChartId = chart.getId();
	var oRelatedButton = null;
	for (var i = 0; !oRelatedButton && i < this._aUsedContentIcons.length; i++) {
		if (this._aUsedContentIcons[i].getCustomData()[0].getValue() === sChartId && chart.getVisible() === true) {
			oRelatedButton = this._aUsedContentIcons[i];
			this._oChartSegmentedButton.setSelectedButton(oRelatedButton);
			break;
		}
	}
};

/**
 * Setter for the selected button of the chart segmented button.
 *
 * The first button inside the segmented button is only set as default if the
 * user did not click explicitly on another button inside the segmented button.
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._setDefaultOnSegmentedButton = function() {
	if (!this._bSegmentedButtonSaveSelectState) {
		this._oChartSegmentedButton.setSelectedButton(null);
	}
	this._bSegmentedButtonSaveSelectState = false;
};

/* =========================================================== */
/* Helper methods                                              */
/* =========================================================== */

/**
 * Toggles between normal and full screen modes.
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._toggleFullScreen = function() {
	var bFullScreen = this.getProperty("fullScreen");
	if (bFullScreen) {
		var aContent = this.getAggregation("content");
		this._closeFullScreen();
		this.setProperty("fullScreen", false, true);
		var oContent;
		var sHeight;
		for (var i = 0; i < aContent.length; i++) {
			oContent = aContent[i].getContent();
			oContent.setWidth("100%");
			sHeight = this._mOriginalVizFrameHeights[oContent.getId()];
			if (sHeight) {
				oContent.setHeight(sHeight);
			}
		}
		this.invalidate();
	} else {
		//Make sure the cart doesn't disappear when it's toggled with the full screen button.
		//By suppressing the bSuppressInvalidate argument for the setProperty, this delay shouldn't be needed.
		this._openFullScreen();
		this.setProperty("fullScreen", true, true);
	}
};

/**
 * Opens ChartContainer content with Full Screen.
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._openFullScreen = function() {
	var eDock = sap.ui.core.Popup.Dock;
	this.$content = this.$();
	if (this.$content) {
		this.$tempNode = jQuery("<div></div>");
		this.$content.before(this.$tempNode);
		this._$overlay = jQuery("<div id='" + jQuery.sap.uid() + "'></div>");
		this._$overlay.addClass("sapSuiteUiCommonsChartContainerOverlay");
		this._$overlay.append(this.$content);
		this._oPopup.setContent(this._$overlay);
	} else {
		jQuery.sap.log.warn("Overlay: content does not exist or contains more than one child");
	}
	this._oPopup.open(200, eDock.BeginTop, eDock.BeginTop, jQuery("body"));
	if (!sap.ui.Device.system.desktop) {
		// Fixes missing height adjustment on mobile devices
		jQuery.sap.delayedCall(500, this, this._performHeightChanges.bind(this));
	}
};

/**
 * Closes Full Screen and returns to normal mode.
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._closeFullScreen = function() {
	if (this._oScrollEnablement !== null) {
		this._oScrollEnablement.destroy();
		this._oScrollEnablement = null;
	}
	this.$tempNode.replaceWith(this.$content);
	this._oToolBar.setDesign(sap.m.ToolbarDesign.Auto);
	this._oPopup.close();
	this._$overlay.remove();
};

/**
 * Performs height changes needed when toggling between full screen and normal modes.
 *
 * If mobile mode is used, swaps between portrait and landscape trigger height changes too.
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._performHeightChanges = function() {
	var $Toolbar,
		$VizFrame;

	if (this.getAutoAdjustHeight() || this.getFullScreen()) {
		var $this = this.$(),
			oSelectedContent,
			oInnerChart;

		$Toolbar = $this.find(".sapSuiteUiCommonsChartContainerToolBarArea :first");
		//Only adjust height after both toolbar and chart are rendered in the DOM.
		$VizFrame = $this.find(".sapSuiteUiCommonsChartContainerChartArea :first");
		oSelectedContent = this.getSelectedContent();
		if ($Toolbar[0] && $VizFrame[0] && oSelectedContent) {
			var iChartContainerHeight = $this.height();
			var iToolBarHeight = $Toolbar.height();
			var iToolbarBottomBorder = Math.round(parseFloat($Toolbar.css("borderBottomWidth")));
			var iNewChartHeight = iChartContainerHeight - iToolBarHeight - iToolbarBottomBorder;
			var iExistingChartHeight = $VizFrame.height();
			oInnerChart = oSelectedContent.getContent();
			if ((oInnerChart instanceof sap.viz.ui5.controls.VizFrame) || (sap.chart && sap.chart.Chart && oInnerChart instanceof sap.chart.Chart)) {
				if (iNewChartHeight > 0 && iNewChartHeight !== iExistingChartHeight) {
					this._rememberOriginalHeight(oInnerChart);
					oInnerChart.setHeight(iNewChartHeight + "px");
				}
			} else if (oInnerChart.getDomRef().offsetWidth !== this.getDomRef().clientWidth) {
				//For table/non-vizFrame case, if width changes on the re-size event, force a re-render to have it fit in 100% width.
				this.rerender();
			}
		}
	}
};

/**
 * Updates the mOriginalVizFrameHeights property to reflect the height of the specified chart.
 *
 * In the full screen mode it is necessary to remember the original height of the current chart.
 * This allows restoring it later on in non-full screen mode.
 *
 * @private
 * @param {sap.chart.Chart|sap.viz.ui5.controls.VizFrame} chart Current chart or vizframe
 */
sap.suite.ui.commons.ChartContainer.prototype._rememberOriginalHeight = function(chart) {
	var sHeight;
	if (jQuery.isFunction(chart.getHeight)) {
		sHeight = chart.getHeight();
	} else {
		sHeight = 0;
	}
	this._mOriginalVizFrameHeights[chart.getId()] = sHeight;
};

/**
 * Switches the currently selected chart.
 *
 * @private
 * @param {String} chartId The ID of the chart to be searched
 */
sap.suite.ui.commons.ChartContainer.prototype._switchChart = function(chartId) {
	var oChart = this._findChartById(chartId);

	this._setSelectedContent(oChart);

	this.fireContentChange({
		selectedItemId : chartId
	}); //Fires the change event with the ID of the newly selected item.
	this.rerender();
};

/**
 * Collects all charts.
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._chartChange = function() {
	var aCharts = this.getContent();
	this._destroyButtons(this._aUsedContentIcons);
	this._aUsedContentIcons = [];
	if (this.getContent().length === 0) {
		this._oChartSegmentedButton.removeAllButtons();
		this._setDefaultOnSegmentedButton();
		this.switchChart(null);
	}
	if (aCharts) {
		var bShowLegend = this.getShowLegend();
		var oInnerChart;
		var oButtonIcon;
		for (var i = 0; i < aCharts.length; i++) {
			// In case the content is not visible, skip this content.
			if (!aCharts[i].getVisible()) {
				continue;
			}
			oInnerChart = aCharts[i].getContent();
			if (jQuery.isFunction(oInnerChart.setVizProperties)) {
				oInnerChart.setVizProperties({
					legend : {
						visible : bShowLegend
					},
					sizeLegend : {
						visible : bShowLegend
					}
				});
			}
			if (jQuery.isFunction(oInnerChart.setWidth)) {
				oInnerChart.setWidth("100%");
			}
			if (jQuery.isFunction(oInnerChart.setHeight) && this._mOriginalVizFrameHeights[oInnerChart.getId()]) {
				oInnerChart.setHeight(this._mOriginalVizFrameHeights[oInnerChart.getId()]);
			}
			oButtonIcon = new sap.m.Button({
				icon : aCharts[i].getIcon(),
				type : sap.m.ButtonType.Transparent,
				//Fixes the bug where the chart button and the chart itself disappears when chart switches to full screen mode.
				width: "3rem",
				tooltip : aCharts[i].getTitle(),
				customData : [new sap.ui.core.CustomData({
					key : 'chartId',
					value : oInnerChart.getId()
				})],
				press : this._onButtonIconPress.bind(this)
			});
			this._aUsedContentIcons.push(oButtonIcon);

			if (i === 0) {
				this._setSelectedContent(aCharts[i]);
				this._oActiveChartButton = oButtonIcon;
			}
		}
	}
	this._bChartContentHasChanged = false;
};

/**
 * Get the chart inside the content aggregation by id.
 *
 * @private
 * @param {String} id The ID of the content control being searched for
 * @returns {sap.ui.core.Control|null} The object found or null
 */
sap.suite.ui.commons.ChartContainer.prototype._findChartById = function(id) {
	var aObjects = this.getAggregation("content");
	if (aObjects) {
		for (var i = 0; i < aObjects.length; i++) {
			if (aObjects[i].getContent().getId() === id) {
				return aObjects[i];
			}
		}
	}
	return null;
};

/**
 * Gets the exact position of the placeholder inside the toolbar
 *
 * @private
 * @param {sap.m.OverflowToolbar} toolbar Toolbar where to find the placeholder
 * @return {Number} The position of the placeholder or -1 if there is no placeholder
 */
sap.suite.ui.commons.ChartContainer.prototype._getToolbarPlaceHolderPosition = function(toolbar) {
	for (var i = 0; i < toolbar.getContent().length; i++) {
		if (toolbar.getContent()[i] instanceof sap.suite.ui.commons.ChartContainerToolbarPlaceholder) {
			return i;
		}
	}

	return -1;
};

/**
 * Adds content to the toolbar at the provided position
 *
 * @private
 * @param {Object} content The content to be added
 * @param {Number} position The position where the content should be added
 */
sap.suite.ui.commons.ChartContainer.prototype._addContentToolbar = function(content, position) {
	if (!this._bHasApplicationToolbar) {
		if (!position) {
			this._oToolBar.addContent(content);
		} else {
			this._oToolBar.insertContent(content, position);
		}
	} else {
		// when an external toolbar is available, no embedded spacer is needed
		// all embedded standard buttons are arranged after the embedded spacer
		if (content instanceof sap.m.ToolbarSpacer) {
			this._iPlaceholderPosition = this._getToolbarPlaceHolderPosition(this._oToolBar);
			return;
		}
		if (position) {
			this._iPlaceholderPosition = this._iPlaceholderPosition + position;
		}
		this._oToolBar.insertAggregation("content", content, this._iPlaceholderPosition, true);
		this._iPlaceholderPosition = this._iPlaceholderPosition + 1;
	}
};

/**
 * Re-arranges the content inside the toolbar
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._rearrangeToolbar = function() {
	var iToolbarLength = this._aToolbarContent.length;
	for (var i = 0; i < iToolbarLength; i++) {
		this._oToolBar.insertContent(this._aToolbarContent[i], i);
	}
};

/**
 * Adjusts customizable icons of overflow toolbar, displays chart buttons.
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._adjustIconsDisplay = function() {
	if (this.getShowLegendButton()){
		this._addContentToolbar(this._oShowLegendButton);
	}
	if (this.getShowZoom() && sap.ui.Device.system.desktop) {
		this._addContentToolbar(this._oZoomInButton);
		this._addContentToolbar(this._oZoomOutButton);
	}
	if (this.getShowPersonalization()) {
		this._addContentToolbar(this._oPersonalizationButton);
	}
	if (this.getShowFullScreen()) {
		this._addContentToolbar(this._oFullScreenButton);
	}

	for (var i = 0; i < this._aCustomIcons.length; i++ ) {
		this._addContentToolbar(this._aCustomIcons[i]);
	}
	if (!this._bControlNotRendered) {
		this._oChartSegmentedButton.removeAllButtons();
	}

	// ChartContainer with one chart does not have a segment container
	var iIconsCount = this._aUsedContentIcons.length;
	if (iIconsCount > 1) {
		for (var i = 0; i < iIconsCount; i++) {
			this._oChartSegmentedButton.addButton(this._aUsedContentIcons[i]);
		}
		this._addContentToolbar(this._oChartSegmentedButton);
	}
};

/**
 * Adjusts dimension selector displays.
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._adjustSelectorDisplay = function() {
	if (this._aDimensionSelectors.length === 0) {
		this._oChartTitle.setVisible(true);
		this._addContentToolbar(this._oChartTitle);
		return;
	}

	for (var i = 0; i < this._aDimensionSelectors.length; i++) {
		if (jQuery.isFunction(this._aDimensionSelectors[i].setAutoAdjustWidth)) {
			this._aDimensionSelectors[i].setAutoAdjustWidth(true);
		}
		this._addContentToolbar(this._aDimensionSelectors[i]);
	}
};

/**
 * Re-creates the toolbar.
 *
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._adjustDisplay = function() {
	this._oToolBar = this.getToolbar();
	this._oToolBar.removeAllContent();
	this._oToolBar.setProperty("height", "3rem", true);
	if (this._bHasApplicationToolbar) {
		// rearranges the application toolbar
		this._rearrangeToolbar();
		this._iPlaceholderPosition = 0;
	}
	this._adjustSelectorDisplay();
	this._addContentToolbar(new sap.m.ToolbarSpacer());
	this._adjustIconsDisplay();
};

/**
 * Adds a new button to Custom Icons array.
 *
 * @param {sap.ui.core.Icon} icon to be added to toolbar
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._addButtonToCustomIcons = function(icon) {
	var oIcon = icon;
	var sIconTooltip = oIcon.getTooltip();
	var oButton = new sap.m.OverflowToolbarButton({
		icon : oIcon.getSrc(),
		text : sIconTooltip,
		tooltip : sIconTooltip,
		type : sap.m.ButtonType.Transparent,
		width : "3rem",
		press: [{icon: oIcon}, this._onOverflowToolbarButtonPress.bind(this)]
	});
	this._aCustomIcons.push(oButton);
};

/**
 * Zooms in or out of ChartContainer content.
 *
 * @param {boolean} zoomIn Flag showing if zoom in or out should be performed
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._zoom = function(zoomIn) {
	var oChart = this.getSelectedContent().getContent();
	if (oChart instanceof sap.viz.ui5.controls.VizFrame) {
		if (zoomIn) {
			oChart.zoom({"direction": "in"});
		} else {
			oChart.zoom({"direction": "out"});
		}
	}
	if (zoomIn){
		this.fireCustomZoomInPress();
	} else {
		this.fireCustomZoomOutPress();
	}
};

/**
 * Destroys all the buttons that are passed.
 *
 * @param {sap.ui.core.Control[]} buttons The buttons which need to be destroyed
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._destroyButtons = function(buttons) {
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].destroy();
	}
};

/**
 * Updates legendVisible property for all inner charts in the content.
 *
 * @param {Boolean} showLegend Flag showing if legend should be shown
 * @private
 */
sap.suite.ui.commons.ChartContainer.prototype._setShowLegendForAllCharts = function(showLegend) {
	var aContents = this.getContent();
	var oInnerChart;
	for (var i = 0; i < aContents.length; i++) {
		oInnerChart = aContents[i].getContent();
		if (jQuery.isFunction(oInnerChart.setLegendVisible)) {
			oInnerChart.setLegendVisible(showLegend);
		} else {
			jQuery.sap.log.info("ChartContainer: chart with id " + oInnerChart.getId() + " is missing the setVizProperties property");
		}
	}
}

/* =========================================================== */
/* Public property getters/setters                             */
/* =========================================================== */

sap.suite.ui.commons.ChartContainer.prototype.setFullScreen = function(fullscreen){
	if (this._bControlNotRendered) {
		//Can't set the full screen and toggle when the DOM is not loaded yet.
		return this;
	}
	if (this.getFullScreen() === fullscreen) {
		return this;
	}
	if (this.getProperty("fullScreen") !== fullscreen) {
		this._toggleFullScreen();
	}
	return this;
};

sap.suite.ui.commons.ChartContainer.prototype.setTitle = function(title) {
	if (this.getTitle() === title) {
		return this;
	}
	this._oChartTitle.setText(title);
	this.setProperty("title", title, true);
	return this;
};

sap.suite.ui.commons.ChartContainer.prototype.setShowLegendButton = function(showLegendButton) {
	if (this.getShowLegendButton() === showLegendButton) {
		return this;
	}
	this.setProperty("showLegendButton", showLegendButton, true);
	if (!this.getShowLegendButton()) {
		this.setShowLegend(false);
	}
	return this;
};

/**
 * Getter for property selectorGroupLabel. Custom Label for Selectors Group.
 *
 * Default value is empty/undefined
 *
 * @deprecated
 * @param {String} selectorGroupLabel The new value for property selectorGroupLabel
 * @returns {sap.suite.ui.commons.ChartContainer} this to allow method chaining
 */
sap.suite.ui.commons.ChartContainer.prototype.setSelectorGroupLabel = function(selectorGroupLabel) {
	if (this.getSelectorGroupLabel() === selectorGroupLabel) {
		return this;
	}
	this.setProperty("selectorGroupLabel", selectorGroupLabel, true);
	return this;
};

sap.suite.ui.commons.ChartContainer.prototype.setShowLegend = function(showLegend) {
	if (this.getShowLegend() === showLegend) {
		return this;
	}
	this.setProperty("showLegend", showLegend, true);

	//Propagate to all charts.
	this._setShowLegendForAllCharts(showLegend);

	return this;
};

/* =========================================================== */
/* Public aggregation getters/setters                          */
/* =========================================================== */

sap.suite.ui.commons.ChartContainer.prototype.setToolbar = function(toolbar) {
	if (!toolbar || this._getToolbarPlaceHolderPosition(toolbar) === -1) {
		jQuery.sap.log.info("A placeholder of type 'sap.suite.ui.commons.ChartContainerToolbarPlaceholder' needs to be provided. Otherwise, the toolbar will be ignored");
		return this;
	}
	if (this.getToolbar() !== toolbar) {
		this.setAggregation("toolbar", toolbar);
	}
	if (this.getToolbar()) {
		this._aToolbarContent = this.getToolbar().getContent();
		this._bHasApplicationToolbar = true;
	} else {
		this._aToolbarContent = null;
		this._bHasApplicationToolbar = false;
	}
	this.invalidate();
	return this;
};

sap.suite.ui.commons.ChartContainer.prototype.getDimensionSelectors = function() {
	return this._aDimensionSelectors;
};

sap.suite.ui.commons.ChartContainer.prototype.indexOfDimensionSelector = function(dimensionSelector) {
	for (var i = 0; i < this._aDimensionSelectors.length; i++) {
		if (this._aDimensionSelectors[i] === dimensionSelector) {
			return i;
		}
	}
	return -1;
};

sap.suite.ui.commons.ChartContainer.prototype.addDimensionSelector = function(dimensionSelector) {
	this._aDimensionSelectors.push(dimensionSelector);
	return this;
};

sap.suite.ui.commons.ChartContainer.prototype.insertDimensionSelector = function(dimensionSelector, index) {
	if (!dimensionSelector) {
		return this;
	}
	var i;
	if (index < 0) {
		i = 0;
	} else if (index > this._aDimensionSelectors.length) {
		i = this._aDimensionSelectors.length;
	} else {
		i = index;
	}
	if (i !== index) {
		jQuery.sap.log.warning("ManagedObject.insertAggregation: index '" + index + "' out of range [0," + this._aDimensionSelectors.length + "], forced to " + i);
	}
	this._aDimensionSelectors.splice(i, 0, dimensionSelector);
	return this;
};

sap.suite.ui.commons.ChartContainer.prototype.destroyDimensionSelectors = function() {
	if (this._oToolBar) {
		for (var i = 0; i < this._aDimensionSelectors.length; i++) {
			if (this._aDimensionSelectors[i]) {
				this._oToolBar.removeContent(this._aDimensionSelectors[i]);
				this._aDimensionSelectors[i].destroy();
			}
		}
	}

	this._aDimensionSelectors = [];
	return this;
};

sap.suite.ui.commons.ChartContainer.prototype.removeDimensionSelector = function(dimensionSelector) {
	if (!dimensionSelector) {
		return null;
	}
	if (this._oToolBar) {
		this._oToolBar.removeContent(dimensionSelector);
	}
	var iDimensionSelectorIndex = this.indexOfDimensionSelector(dimensionSelector);
	if (iDimensionSelectorIndex === -1) {
		return null;
	} else {
		// return the removed dimension selector
		return this._aDimensionSelectors.splice(iDimensionSelectorIndex, 1)[0];
	}
};

sap.suite.ui.commons.ChartContainer.prototype.removeAllDimensionSelectors = function() {
	var aDimensionSelectors = this._aDimensionSelectors.slice();
	if (this._oToolBar) {
		for (var i = 0; i < this._aDimensionSelectors.length; i++) {
			if (this._aDimensionSelectors[i]) {
				this._oToolBar.removeContent(this._aDimensionSelectors[i]);
			}
		}
	}
	this._aDimensionSelectors = [];
	return aDimensionSelectors;
};

sap.suite.ui.commons.ChartContainer.prototype.addContent = function(content) {
	this.addAggregation("content", content);
	this._bChartContentHasChanged = true;
	return this;
};

sap.suite.ui.commons.ChartContainer.prototype.insertContent = function(content, index) {
	this.insertAggregation("content", content, index);
	this._bChartContentHasChanged = true;
	return this;
};

/**
 * @deprecated Not supported anymore
 */
sap.suite.ui.commons.ChartContainer.prototype.updateContent = function() {
	this.updateAggregation("content");
	this._bChartContentHasChanged = true;
};

sap.suite.ui.commons.ChartContainer.prototype.addAggregation = function(aggregationName, object, suppressInvalidate) {
	if (aggregationName === "dimensionSelectors") {
		return this.addDimensionSelector(object);
	} else {
		return sap.ui.base.ManagedObject.prototype.addAggregation.apply(this, arguments);
	}
};

sap.suite.ui.commons.ChartContainer.prototype.getAggregation = function(aggregationName, defaultForCreation) {
	if (aggregationName === "dimensionSelectors") {
		return this.getDimensionSelectors();
	} else {
		return sap.ui.base.ManagedObject.prototype.getAggregation.apply(this, arguments);
	}
};

sap.suite.ui.commons.ChartContainer.prototype.indexOfAggregation = function(aggregationName, object) {
	if (aggregationName === "dimensionSelectors") {
		return this.indexOfDimensionSelector(object);
	} else {
		return sap.ui.base.ManagedObject.prototype.indexOfAggregation.apply(this, arguments);
	}
};

sap.suite.ui.commons.ChartContainer.prototype.insertAggregation = function(aggregationName, object, index, suppressInvalidate) {
	if (aggregationName === "dimensionSelectors") {
		return this.insertDimensionSelector(object, index);
	} else {
		return sap.ui.base.ManagedObject.prototype.insertAggregation.apply(this, arguments);
	}
};

sap.suite.ui.commons.ChartContainer.prototype.destroyAggregation = function(aggregationName, suppressInvalidate) {
	if (aggregationName === "dimensionSelectors") {
		return this.destroyDimensionSelectors();
	} else {
		return sap.ui.base.ManagedObject.prototype.destroyAggregation.apply(this, arguments);
	}
};

sap.suite.ui.commons.ChartContainer.prototype.removeAggregation = function(aggregationName, object, suppressInvalidate) {
	if (aggregationName === "dimensionSelectors") {
		return this.removeDimensionSelector(object);
	} else {
		return sap.ui.base.ManagedObject.prototype.removeAggregation.apply(this, arguments);
	}
};

sap.suite.ui.commons.ChartContainer.prototype.removeAllAggregation = function(aggregationName, suppressInvalidate) {
	if (aggregationName === "dimensionSelectors") {
		return this.removeAllDimensionSelectors();
	} else {
		return sap.ui.base.ManagedObject.prototype.removeAllAggregation.apply(this, arguments);
	}
};

/* =========================================================== */
/* Public methods                                              */
/* =========================================================== */

/**
 * Returns the currently selected content control.
 *
 * @public
 * @returns  {sap.ui.core.Control} The currently selected content
 */
sap.suite.ui.commons.ChartContainer.prototype.getSelectedContent = function() {
	return this._oSelectedContent;
};

/**
 * Returns the current instance of the delegate to other controls.
 *
 * @protected
 * @returns {sap.ui.core.delegate.ScrollEnablement} The current instance of the delegate
 */
sap.suite.ui.commons.ChartContainer.prototype.getScrollDelegate = function() {
	return this._oScrollEnablement;
};

/**
 * Switches the currently viewed content (triggers re-rendering).
 *
 * @public
 * @param {sap.ui.core.Control} chart The new content (Chart or Table) to be displayed
 */
sap.suite.ui.commons.ChartContainer.prototype.switchChart = function(chart) {
	this._setSelectedContent(chart);
	//Fires the change event with the ID of the newly selected item.
	this.rerender();
};

/**
 * Updates ChartContainer and re-renders all its contents.
 *
 * @public
 * @returns {sap.suite.ui.commons.ChartContainer} Reference to this in order to allow method chaining
 */
sap.suite.ui.commons.ChartContainer.prototype.updateChartContainer = function() {
	this._bChartContentHasChanged = true;
	this.rerender();
	return this;
};