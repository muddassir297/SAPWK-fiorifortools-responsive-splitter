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

// Provides control sap.suite.ui.commons.ProcessFlow.
jQuery.sap.declare("sap.suite.ui.commons.ProcessFlow");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ProcessFlow.
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
 * <li>{@link #getFoldedCorners foldedCorners} : boolean (default: false)</li>
 * <li>{@link #getScrollable scrollable} : boolean (default: true)</li>
 * <li>{@link #getWheelZoomable wheelZoomable} : boolean (default: true)</li>
 * <li>{@link #getShowLabels showLabels} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getNodes nodes} : sap.suite.ui.commons.ProcessFlowNode[]</li>
 * <li>{@link #getLanes lanes} <strong>(default aggregation)</strong> : sap.suite.ui.commons.ProcessFlowLaneHeader[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.suite.ui.commons.ProcessFlow#event:nodeTitlePress nodeTitlePress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ProcessFlow#event:nodePress nodePress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ProcessFlow#event:labelPress labelPress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ProcessFlow#event:headerPress headerPress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ProcessFlow#event:onError onError} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Complex control that enables you to display documents or other items in their flow.
 * @extends sap.ui.core.Control
 *
 * @author SAP SE
 * @version 1.46.0
 *
 * @constructor
 * @public
 * @name sap.suite.ui.commons.ProcessFlow
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.suite.ui.commons.ProcessFlow", { metadata : {

	publicMethods : [
		// methods
		"getZoomLevel", "setZoomLevel", "zoomIn", "zoomOut", "updateModel", "getFocusedNode", "updateNodesOnly", "setSelectedPath"
	],
	library : "sap.suite.ui.commons",
	properties : {

		/**
		 * This property defines the folded corners for the single node control. The following values exist:
		 * - true: means folded corner
		 * - false/null/undefined: means normal corner
		 */
		"foldedCorners" : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * By default, the control body is embedded into a scroll container of fixed size, so the user
		 * can put the control into a fixe sized layout.
		 * When the control body (the graph) gets larger than the container cuts the overflowing parts of the graph and the cut parts can be viewed by scroling the control body.
		 * When the control body fits into the container limits, obviously no scrolling is possible (and makes sense).
		 * 
		 * The scrolling feature can be turned off by setting this property value to false,
		 * so the width/height of the whole control will change as the flow graph gets smaller/larger.
		 * In this case the control body could not be scrolled, as the control body size matches the control container size.
		 */
		"scrollable" : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * The property specifies if to enable semantic zooming by mouse wheel events on desktop browsers.
		 */
		"wheelZoomable" : {type : "boolean", group : "Behavior", defaultValue : true},

		/**
		 * Defines if the connection labels are shown or not.
		 */
		"showLabels" : {type : "boolean", group : "Appearance", defaultValue : false}
	},
	defaultAggregation : "lanes",
	aggregations : {

		/**
		 * This is the aggregation of the connection controls put into the table to the calculated cells.
		 */
		"_connections" : {type : "sap.suite.ui.commons.ProcessFlowConnection", multiple : true, singularName : "_connection", visibility : "hidden"}, 

		/**
		 * This is the aggregation of the node controls put into the table to the calculated cells.
		 */
		"nodes" : {type : "sap.suite.ui.commons.ProcessFlowNode", multiple : true, singularName : "node"}, 

		/**
		 * This is a header of the table for the process flow control.
		 */
		"lanes" : {type : "sap.suite.ui.commons.ProcessFlowLaneHeader", multiple : true, singularName : "lane"}
	},
	events : {

		/**
		 * This event is fired when a process flow node title was
		 * clicked. The user can access the clicked process flow node control object which is the only argument of the event handler.
		 * @deprecated Since version 1.26. 
		 * Should not be used any longer, use nodePress event instead ( click on the node)
		 */
		"nodeTitlePress" : {deprecated: true,
			parameters : {

				/**
				 * This object represents the wrapped process flow node object.
				 */
				"oEvent" : {type : "object"}
			}
		}, 

		/**
		 * This event is fired when a process flow node was clicked.
		 */
		"nodePress" : {
			parameters : {

				/**
				 * This object represents the wrapped process flow node object.
				 */
				"oEvent" : {type : "object"}
			}
		}, 

		/**
		 * This event is fired when a process flow connection label was clicked.
		 */
		"labelPress" : {
			parameters : {

				/**
				 * This object represents the label information.
				 */
				"oEvent" : {type : "object"}
			}
		}, 

		/**
		 * This event is fired when the header column was clicked.
		 */
		"headerPress" : {
			parameters : {

				/**
				 * This object represents the wrapped process flow lane header object.
				 */
				"oEvent" : {type : "object"}
			}
		}, 

		/**
		 * This event is fired when an issue occurs with the process flow calculation. In most cases, there is an issue with the data. The console contains the detailed error description with the errors.
		 */
		"onError" : {
			parameters : {

				/**
				 * This parameters contains the localized string with error message.
				 */
				"oEvent" : {type : "object"}
			}
		}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.ProcessFlow with name <code>sClassName</code> 
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
 * @name sap.suite.ui.commons.ProcessFlow.extend
 * @function
 */

sap.suite.ui.commons.ProcessFlow.M_EVENTS = {'nodeTitlePress':'nodeTitlePress','nodePress':'nodePress','labelPress':'labelPress','headerPress':'headerPress','onError':'onError'};


/**
 * Getter for property <code>foldedCorners</code>.
 * This property defines the folded corners for the single node control. The following values exist:
 * - true: means folded corner
 * - false/null/undefined: means normal corner
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>foldedCorners</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getFoldedCorners
 * @function
 */

/**
 * Setter for property <code>foldedCorners</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bFoldedCorners  new value for property <code>foldedCorners</code>
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#setFoldedCorners
 * @function
 */


/**
 * Getter for property <code>scrollable</code>.
 * By default, the control body is embedded into a scroll container of fixed size, so the user
 * can put the control into a fixe sized layout.
 * When the control body (the graph) gets larger than the container cuts the overflowing parts of the graph and the cut parts can be viewed by scroling the control body.
 * When the control body fits into the container limits, obviously no scrolling is possible (and makes sense).
 * 
 * The scrolling feature can be turned off by setting this property value to false,
 * so the width/height of the whole control will change as the flow graph gets smaller/larger.
 * In this case the control body could not be scrolled, as the control body size matches the control container size.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>scrollable</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getScrollable
 * @function
 */

/**
 * Setter for property <code>scrollable</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bScrollable  new value for property <code>scrollable</code>
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#setScrollable
 * @function
 */


/**
 * Getter for property <code>wheelZoomable</code>.
 * The property specifies if to enable semantic zooming by mouse wheel events on desktop browsers.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>wheelZoomable</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getWheelZoomable
 * @function
 */

/**
 * Setter for property <code>wheelZoomable</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bWheelZoomable  new value for property <code>wheelZoomable</code>
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#setWheelZoomable
 * @function
 */


/**
 * Getter for property <code>showLabels</code>.
 * Defines if the connection labels are shown or not.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showLabels</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getShowLabels
 * @function
 */

/**
 * Setter for property <code>showLabels</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowLabels  new value for property <code>showLabels</code>
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#setShowLabels
 * @function
 */


/**
 * Getter for aggregation <code>nodes</code>.<br/>
 * This is the aggregation of the node controls put into the table to the calculated cells.
 * 
 * @return {sap.suite.ui.commons.ProcessFlowNode[]}
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getNodes
 * @function
 */


/**
 * Inserts a node into the aggregation named <code>nodes</code>.
 *
 * @param {sap.suite.ui.commons.ProcessFlowNode}
 *          oNode the node to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the node should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the node is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the node is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#insertNode
 * @function
 */

/**
 * Adds some node <code>oNode</code> 
 * to the aggregation named <code>nodes</code>.
 *
 * @param {sap.suite.ui.commons.ProcessFlowNode}
 *            oNode the node to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#addNode
 * @function
 */

/**
 * Removes an node from the aggregation named <code>nodes</code>.
 *
 * @param {int | string | sap.suite.ui.commons.ProcessFlowNode} vNode the node to remove or its index or id
 * @return {sap.suite.ui.commons.ProcessFlowNode} the removed node or null
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#removeNode
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>nodes</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.suite.ui.commons.ProcessFlowNode[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#removeAllNodes
 * @function
 */

/**
 * Checks for the provided <code>sap.suite.ui.commons.ProcessFlowNode</code> in the aggregation named <code>nodes</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.suite.ui.commons.ProcessFlowNode}
 *            oNode the node whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#indexOfNode
 * @function
 */
	

/**
 * Destroys all the nodes in the aggregation 
 * named <code>nodes</code>.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#destroyNodes
 * @function
 */


/**
 * Getter for aggregation <code>lanes</code>.<br/>
 * This is a header of the table for the process flow control.
 * 
 * <strong>Note</strong>: this is the default aggregation for ProcessFlow.
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader[]}
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getLanes
 * @function
 */


/**
 * Inserts a lane into the aggregation named <code>lanes</code>.
 *
 * @param {sap.suite.ui.commons.ProcessFlowLaneHeader}
 *          oLane the lane to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the lane should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the lane is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the lane is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#insertLane
 * @function
 */

/**
 * Adds some lane <code>oLane</code> 
 * to the aggregation named <code>lanes</code>.
 *
 * @param {sap.suite.ui.commons.ProcessFlowLaneHeader}
 *            oLane the lane to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#addLane
 * @function
 */

/**
 * Removes an lane from the aggregation named <code>lanes</code>.
 *
 * @param {int | string | sap.suite.ui.commons.ProcessFlowLaneHeader} vLane the lane to remove or its index or id
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader} the removed lane or null
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#removeLane
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>lanes</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#removeAllLanes
 * @function
 */

/**
 * Checks for the provided <code>sap.suite.ui.commons.ProcessFlowLaneHeader</code> in the aggregation named <code>lanes</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.suite.ui.commons.ProcessFlowLaneHeader}
 *            oLane the lane whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#indexOfLane
 * @function
 */
	

/**
 * Destroys all the lanes in the aggregation 
 * named <code>lanes</code>.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#destroyLanes
 * @function
 */


/**
 * This event is fired when a process flow node title was
 * clicked. The user can access the clicked process flow node control object which is the only argument of the event handler.
 *
 * @name sap.suite.ui.commons.ProcessFlow#nodeTitlePress
 * @event
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use nodePress event instead ( click on the node)
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent This object represents the wrapped process flow node object.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'nodeTitlePress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself. 
 *  
 * This event is fired when a process flow node title was
 * clicked. The user can access the clicked process flow node control object which is the only argument of the event handler.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use nodePress event instead ( click on the node)
 * @name sap.suite.ui.commons.ProcessFlow#attachNodeTitlePress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'nodeTitlePress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use nodePress event instead ( click on the node)
 * @name sap.suite.ui.commons.ProcessFlow#detachNodeTitlePress
 * @function
 */

/**
 * Fire event nodeTitlePress to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> This object represents the wrapped process flow node object.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @protected
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use nodePress event instead ( click on the node)
 * @name sap.suite.ui.commons.ProcessFlow#fireNodeTitlePress
 * @function
 */


/**
 * This event is fired when a process flow node was clicked.
 *
 * @name sap.suite.ui.commons.ProcessFlow#nodePress
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent This object represents the wrapped process flow node object.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'nodePress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself. 
 *  
 * This event is fired when a process flow node was clicked.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#attachNodePress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'nodePress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#detachNodePress
 * @function
 */

/**
 * Fire event nodePress to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> This object represents the wrapped process flow node object.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ProcessFlow#fireNodePress
 * @function
 */


/**
 * This event is fired when a process flow connection label was clicked.
 *
 * @name sap.suite.ui.commons.ProcessFlow#labelPress
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent This object represents the label information.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'labelPress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself. 
 *  
 * This event is fired when a process flow connection label was clicked.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#attachLabelPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'labelPress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#detachLabelPress
 * @function
 */

/**
 * Fire event labelPress to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> This object represents the label information.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ProcessFlow#fireLabelPress
 * @function
 */


/**
 * This event is fired when the header column was clicked.
 *
 * @name sap.suite.ui.commons.ProcessFlow#headerPress
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent This object represents the wrapped process flow lane header object.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'headerPress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself. 
 *  
 * This event is fired when the header column was clicked.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#attachHeaderPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'headerPress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#detachHeaderPress
 * @function
 */

/**
 * Fire event headerPress to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> This object represents the wrapped process flow lane header object.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ProcessFlow#fireHeaderPress
 * @function
 */


/**
 * This event is fired when an issue occurs with the process flow calculation. In most cases, there is an issue with the data. The console contains the detailed error description with the errors.
 *
 * @name sap.suite.ui.commons.ProcessFlow#onError
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent This parameters contains the localized string with error message.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'onError' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself. 
 *  
 * This event is fired when an issue occurs with the process flow calculation. In most cases, there is an issue with the data. The console contains the detailed error description with the errors.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#attachOnError
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'onError' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#detachOnError
 * @function
 */

/**
 * Fire event onError to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> This parameters contains the localized string with error message.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ProcessFlow#fireOnError
 * @function
 */


/**
 * This method returns the current zoom level of the control.
 *
 * @name sap.suite.ui.commons.ProcessFlow#getZoomLevel
 * @function
 * @type sap.suite.ui.commons.ProcessFlowZoomLevel
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method sets the new zoom level. If the input is wrong, it is ignored and the previous value stays.
 *
 * @name sap.suite.ui.commons.ProcessFlow#setZoomLevel
 * @function
 * @param {sap.suite.ui.commons.ProcessFlowZoomLevel} oNewZoomLevel
 *         This method sets new zoom level. The enumeration ensures that only available levels are used.
 * @type sap.suite.ui.commons.ProcessFlowZoomLevel
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method decreases the zoom level. More details are displayed in the node.
 *
 * @name sap.suite.ui.commons.ProcessFlow#zoomIn
 * @function
 * @type sap.suite.ui.commons.ProcessFlowZoomLevel
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method increases the zoom level. Less details are displayed in the node.
 *
 * @name sap.suite.ui.commons.ProcessFlow#zoomOut
 * @function
 * @type sap.suite.ui.commons.ProcessFlowZoomLevel
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method triggers the update of the model and correspondingly the rerender method.
 *
 * @name sap.suite.ui.commons.ProcessFlow#updateModel
 * @function
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method returns the nodeId of the node, which is focused.
 *
 * @name sap.suite.ui.commons.ProcessFlow#getFocusedNode
 * @function
 * @type string
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method should be called when the contents of the nodes were changed. It updates only the nodes and rerenders the ProcessFlow.
 *
 * @name sap.suite.ui.commons.ProcessFlow#updateNodesOnly
 * @function
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method sets or resets the selected path between two nodes. To reset the selected path, the method has to be called with null/null.
 *
 * @name sap.suite.ui.commons.ProcessFlow#setSelectedPath
 * @function
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */

// Start of sap/suite/ui/commons/ProcessFlow.js
///**
// * This file defines behavior for the control.
// */

jQuery.sap.require("sap.m.Image");

/* =========================================================== */
/* Variables and Constants                                     */
/* =========================================================== */

/*
 * Resource bundle for the localized strings.
 */
sap.suite.ui.commons.ProcessFlow.prototype._resBundle = null;

/**
 * Cell edge manipulation constants
 *
 * @static
 */
sap.suite.ui.commons.ProcessFlow._cellEdgeConstants = {
  'LU': 'tl', //It is going from the left to the middle and afterwards up
  'LD': 'lb', //It is going from the left to the middle and afterwards down
  'DU': 'tb', //It is going from the bottom to the middle and afterwards up
  'LR': 'rl', //It is going from the left to the middle and afterwards to the right
  'DR': 'rt', //It is going from the bottom to the middle and afterwards to the right
  'UR': 'rb'  //It is going from the top to the middle and afterwards to the right
};

/**
 * ProcessFlow constants
 * @static
 */
sap.suite.ui.commons.ProcessFlow._constants = {
    scrollContainer:        "scrollContainer",
    counterLeft:            "counterLeft",
    counterRight:           "counterRight",
    arrowScrollRight:       "arrowScrollRight",
    arrowScrollRightMinus:  "-arrowScrollRight",
    arrowScrollLeft:        "arrowScrollLeft",
    arrowScrollLeftMinus:   "-arrowScrollLeft",
    top:                    "top",
    px:                     "px",
    parents:                "parents",
    left:                   "left",
    right:                  "right"
 };

/**
 * ProcessFlow mouse events constants
 * @static
 */
sap.suite.ui.commons.ProcessFlow._mouseEvents = {
    mouseMove:      'mousemove',
    mouseDown:      'mousedown',
    mouseUp:        'mouseup',
    mouseLeave:     'mouseleave',
    mouseEnter:     'mouseenter',
    touchStart:     'touchstart',
    sapTouchStart:  'saptouchstart',
    touchEnd:       'touchend',
    sapTouchCancel: 'saptouchcancel'
};

/**
 * Move Enumeration.
 *
 * @static
 */
sap.suite.ui.commons.ProcessFlow._enumMoveDirection = {
    'LEFT': 'left',
    'RIGHT': 'right',
    'UP': 'up',
    'DOWN': 'down'
};

/**
 * Zoom level for the control. It is propagated to all created sub controls.
 */
sap.suite.ui.commons.ProcessFlow.prototype._zoomLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Two;

/**
 * The wheel events time-out.
 */
sap.suite.ui.commons.ProcessFlow.prototype._wheelTimeout = null;

/**
 * Set to true when the focus is changing to another element.
 */
sap.suite.ui.commons.ProcessFlow.prototype._isFocusChanged = false;

/**
 * The wheel events time stamp for the last wheel event occurrence.
 */
sap.suite.ui.commons.ProcessFlow.prototype._wheelTimestamp = null;

/**
 * The wheel events flag, if a wheel event was recently processed.
 */
sap.suite.ui.commons.ProcessFlow.prototype._wheelCalled = false;

/**
 * The internal matrix after calculation. Use for keyboard movement.
 */
sap.suite.ui.commons.ProcessFlow.prototype._internalCalcMatrix = false;

/**
 * The internal list of connection mappings (source/target/connectionParts)
 */
sap.suite.ui.commons.ProcessFlow.prototype._internalConnectionMap = null;

/**
 * Internal lanes, which can differ from original ones. Especially when more elements are in
 * the same lane.
 */
sap.suite.ui.commons.ProcessFlow.prototype._internalLanes = false;

/**
 * Definition for jump over more elements based on the visual design.
 */
sap.suite.ui.commons.ProcessFlow.prototype._jumpOverElements = 5;

/**
 * Last (node or connectionLabel) element with navigation focus. It is marked when the focus out event
 * is handled.
 */
sap.suite.ui.commons.ProcessFlow.prototype._lastNavigationFocusElement = null;

/**
 * Internal PF flag showing whether we operate in highlighted mode.
 */
sap.suite.ui.commons.ProcessFlow.prototype._bHighlightedMode = false;

/**
 * Internal PF flag showing whether we operate in layout-optimized mode.
 */
sap.suite.ui.commons.ProcessFlow.prototype._isLayoutOptimized = false;

/**
 * Set up the cursor classes.
 */
sap.suite.ui.commons.ProcessFlow.prototype._defaultCursorClass = "sapSuiteUiDefaultCursorPF";

if (sap.ui.Device.browser.msie) {
  sap.suite.ui.commons.ProcessFlow.prototype._grabCursorClass = "sapSuiteUiGrabCursorIEPF";
  sap.suite.ui.commons.ProcessFlow.prototype._grabbingCursorClass = "sapSuiteUiGrabbingCursorIEPF";
} else {
  sap.suite.ui.commons.ProcessFlow.prototype._grabCursorClass = "sapSuiteUiGrabCursorPF";
  sap.suite.ui.commons.ProcessFlow.prototype._grabbingCursorClass = "sapSuiteUiGrabbingCursorPF";
}

sap.suite.ui.commons.ProcessFlow.prototype._mousePreventEvents = 'contextmenu dblclick';
sap.suite.ui.commons.ProcessFlow.prototype._mouseEvents = 'contextmenu mousemove mouseleave mousedown mouseup mouseenter';
sap.suite.ui.commons.ProcessFlow.prototype._mouseWheelEvent = (sap.ui.Device.browser.mozilla) ? 'DOMMouseScroll MozMousePixelScroll' : 'mousewheel wheel';
sap.suite.ui.commons.ProcessFlow.prototype._headerHasFocus = false;
sap.suite.ui.commons.ProcessFlow.prototype._isInitialZoomLevelNeeded = true;

/**
 * Variables used for overflow scrolling.
 */
sap.suite.ui.commons.ProcessFlow.prototype._bDoScroll = !sap.ui.Device.system.desktop || (sap.ui.Device.os.windows && sap.ui.Device.os.version === 8);
sap.suite.ui.commons.ProcessFlow.prototype._scrollStep = 192;
sap.suite.ui.commons.ProcessFlow.prototype._bPreviousScrollForward = false; //Remember the item overflow state.
sap.suite.ui.commons.ProcessFlow.prototype._bPreviousScrollBack = false;
sap.suite.ui.commons.ProcessFlow.prototype._iInitialArrowTop = undefined;
sap.suite.ui.commons.ProcessFlow.prototype._iInitialCounterTop = undefined;
sap.suite.ui.commons.ProcessFlow.prototype._bRtl = false;
sap.suite.ui.commons.ProcessFlow.prototype._arrowScrollable = null;
sap.suite.ui.commons.ProcessFlow.prototype._iTouchStartScrollTop = undefined;
sap.suite.ui.commons.ProcessFlow.prototype._iTouchStartScrollLeft = undefined;

sap.suite.ui.commons.ProcessFlow.prototype._bSetFocusOnce = true;

/* =========================================================== */
/* Life-cycle Handling                                         */
/* =========================================================== */

sap.suite.ui.commons.ProcessFlow.prototype.init = function () {
  this._bRtl = sap.ui.getCore().getConfiguration().getRTL();

  if (!this._resBundle) {
    this._resBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
  }
  this._internalLanes = [];

  //bind the events
  if (this._getScrollContainer()) {
    this._getScrollContainer().bind('keydown', jQuery.proxy(this.onkeydown, this));
  }
};

sap.suite.ui.commons.ProcessFlow.prototype.exit = function () {
  var aNodes = this.getNodes();
  if (aNodes) {
    for (var i = 0; i < aNodes.length; i++) {
      if (aNodes[i]) {
        aNodes[i].destroy();
      }
    }
    aNodes = null;
  }

  if (this._internalLanes) {
    for (var i = 0; i < this._internalLanes.length; i++) {
      this._internalLanes[i].destroy();
    }
    this._internalLanes = null;
  }
  var aInternalConnectionAgg = this.getAggregation("_connections");
  if (aInternalConnectionAgg) {
    for (var i = 0; i < aInternalConnectionAgg.length; i++) {
      aInternalConnectionAgg[i].destroy();
    }
    aInternalConnectionAgg = null;
  }
  if (this._oArrowLeft) {
    this._oArrowLeft.destroy();
  }
  if (this._oArrowRight) {
    this._oArrowRight.destroy();
  }

  if (this._resizeRegId) {
    sap.ui.core.ResizeHandler.deregister(this._resizeRegId);
  }
  if (this._internalCalcMatrix) {
    delete this._internalCalcMatrix;
    this._internalCalcMatrix = null;
  }
  if (this._getScrollContainer()) {
    this._getScrollContainer().unbind(this._mousePreventEvents, this._handlePrevent);
    this._getScrollContainer().unbind(this._mouseEvents, jQuery.proxy(this._registerMouseEvents, this));
    this._getScrollContainer().unbind(this._mouseWheelEvent, jQuery.proxy(this._registerMouseWheel, this));
    this._getScrollContainer().unbind('keydown', jQuery.proxy(this.onkeydown, this));
    this._getScrollContainer().unbind('scroll', jQuery.proxy(this._onScroll, this));
  }
};

/**
 * Standard method called before control rendering.
 */
sap.suite.ui.commons.ProcessFlow.prototype.onBeforeRendering = function () {

  if (this._getScrollContainer()) {
    this._getScrollContainer().unbind(this._mousePreventEvents, this._handlePrevent);
    this._getScrollContainer().unbind(this._mouseEvents, jQuery.proxy(this._registerMouseEvents, this));
    this._getScrollContainer().unbind(this._mouseWheelEvent, jQuery.proxy(this._registerMouseWheel, this));
    this._getScrollContainer().unbind('keydown', jQuery.proxy(this.onkeydown, this));
    this._getScrollContainer().unbind('scroll', jQuery.proxy(this._onScroll, this));
  }
};

/**
 * Standard method called after control rendering.
 */
sap.suite.ui.commons.ProcessFlow.prototype.onAfterRendering = function () {
  var bScrollable = false,
      $content = this.$("scroll-content"),
      iHeight,
      iWidth,
      iScrollWidth,
      iScrollHeight;

  //Initializes scrolling.
  this._checkOverflow(this._getScrollContainer().get(0), this.$());

  this.iCursorPositionX = 0;
  this.iCursorPositionY = 0;

  if ($content && $content.length) {
    //Sets PF node icon cursors as inline styles, so they cannot be overwritten by applying a CSS class.
    this._getScrollContainer().find('.sapSuiteUiCommonsProcessFlowNode .sapUiIcon').css("cursor", "inherit");

    if (this.getScrollable()) {
      iHeight = parseInt(this._getScrollContainer().css("height").slice(0, -2), 10);
      iWidth = parseInt(this._getScrollContainer().css("width").slice(0, -2), 10);
      iScrollHeight = $content[0].scrollHeight;
      iScrollWidth = $content[0].scrollWidth;

      if (iScrollHeight <= iHeight && iScrollWidth <= iWidth) {
        this._clearHandlers(this._getScrollContainer());
        //No scrolling makes sense, so clean up the mouse handlers and switch the cursors.
        this._switchCursors(this._getScrollContainer(), this._grabCursorClass, this._defaultCursorClass);
      } else {
        this._switchCursors(this._getScrollContainer(), this._defaultCursorClass, this._grabCursorClass);
        bScrollable = true;
      }
    } else {
      this._clearHandlers(this._getScrollContainer());
      this._switchCursors(this._getScrollContainer(), this._grabCursorClass, this._defaultCursorClass);
      $content.css("position", "static");
    }
    if (bScrollable) {
      //Initialize top margin of arrow and counter.
      if (!this._iInitialArrowTop || !this._iInitialCounterTop) {
        this._iInitialArrowTop = parseInt(this.$(sap.suite.ui.commons.ProcessFlow._constants.arrowScrollRight).css(sap.suite.ui.commons.ProcessFlow._constants.top), 10);
        this._iInitialCounterTop = parseInt(this.$(sap.suite.ui.commons.ProcessFlow._constants.counterRight).css(sap.suite.ui.commons.ProcessFlow._constants.top), 10);
      }

      if (sap.ui.Device.os.windows && sap.ui.Device.system.combi && sap.ui.Device.browser.chrome) {
        //Win8 Surface: Chrome.
        this._getScrollContainer().bind(this._mouseEvents, jQuery.proxy(this._registerMouseEvents, this));
        this._getScrollContainer().css("overflow", "auto");
      } else if (sap.ui.Device.os.windows && sap.ui.Device.system.combi && sap.ui.Device.browser.msie && (sap.ui.Device.browser.version > 9)) {
        //Win8 Surface: IE 10 and higher.
        this._getScrollContainer().bind(this._mouseEvents, jQuery.proxy(this._registerMouseEvents, this));
        this._getScrollContainer().css("overflow", "auto");
        this._getScrollContainer().css("-ms-overflow-style", "none");
      } else if (!sap.ui.Device.support.touch && !jQuery.sap.simulateMobileOnDesktop) {
        // Desktop
        this._getScrollContainer().bind(this._mouseEvents, jQuery.proxy(this._registerMouseEvents, this));
      } else {
        // Mobile: use native scrolling.
        this._clearHandlers(this._getScrollContainer());
        this._getScrollContainer().css("overflow", "auto");
      }
    } else { //Not scrollable ProcessFlow: Set overflow for chevron navigation anyway.
      if (this._bDoScroll) {
        //Is Not Desktop OR Is Win8.
        this._getScrollContainer().css("overflow", "auto");
      } else {
        this._getScrollContainer().css("overflow", "hidden");
      }
    }
    if (this.getWheelZoomable() && sap.ui.Device.system.desktop && !this._isHeaderMode()) {
      this._getScrollContainer().bind(this._mouseWheelEvent, jQuery.proxy(this._registerMouseWheel, this));
    }
    if (this._bDoScroll) {
      //Bind scroll event for mobile.
      this._getScrollContainer().bind("scroll", jQuery.proxy(this._onScroll, this));
    }
    this._resizeRegId = sap.ui.core.ResizeHandler.register(this, jQuery.proxy(sap.suite.ui.commons.ProcessFlow.prototype._onResize, this));
    if (this._isInitialZoomLevelNeeded) {
      this._initZoomLevel();
    }
    //Sets the focus to the next node if PF was in headers mode before rerendering.
    if (this._headerHasFocus) {
      this._headerHasFocus = false;
      var $nodeToFocus = this.$("scroll-content").children().children().children(1).children("td[tabindex='0']").first().children();
      var oNodeToFocus = sap.ui.getCore().byId($nodeToFocus[0].id);
      this._changeNavigationFocus(null, oNodeToFocus);
    }
  }
};

/* =========================================================== */
/* Event Handling                                              */
/* =========================================================== */

/**
 * Handles the on-touch-end event.
 *
 * @private
 * @param {sap.ui.base.Event} oEvent
 */
sap.suite.ui.commons.ProcessFlow.prototype.ontouchend = function (oEvent) {
  if (oEvent.target && oEvent.target.id.indexOf("arrowScroll") != -1) {
    this._onArrowClick(oEvent);
  }
  else {
    if (!sap.ui.Device.support.touch && !jQuery.sap.simulateMobileOnDesktop) {
      this.onAfterRendering();
    } else {
      this._adjustAndShowArrow();
    }
    if (oEvent === null || oEvent.oSource === undefined) {
      return;
    }
    oEvent.preventDefault();

    if (this && this._isHeaderMode()) {
      //Reset lanes as they could be redefined completely in headerPress Event - also necessary for merged lanes.
      this._internalLanes = [];
      this.fireHeaderPress(this);
    }
  }
};

/**
 * Handles the prevent functionality of the events
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._handlePrevent = function (oEvent) {
  if (oEvent && !oEvent.isDefaultPrevented()) {
    oEvent.preventDefault();
  }
  if (oEvent && !oEvent.isPropagationStopped()) {
    oEvent.stopPropagation();
  }
  if (oEvent && !oEvent.isImmediatePropagationStopped()) {
    oEvent.stopImmediatePropagation();
  }
};

/**
 * Control resize handler for setting the cursor type/scroll setup.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._onResize = function () {
  var iActualTime = new Date().getTime();

  if (!this._iLastResizeEventTime || ((iActualTime - this._iLastResizeEventTime) < 50)) {
    //Start to handle after the second resize event (below 50ms).
    if (!this._iLastResizeHandlingTime || (iActualTime - this._iLastResizeHandlingTime > 500)) { //Handle each .5s.
      this.onAfterRendering();
      this._iLastResizeHandlingTime = new Date().getTime();
    }
  } else {
    this._iLastResizeHandlingTime = null;
  }

  this._iLastResizeEventTime = new Date().getTime();
};

/**
 * Registration of mouse events
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._registerMouseEvents = function (oEvent) {
  if (oEvent && !oEvent.isDefaultPrevented()) {
    oEvent.preventDefault();
  }
  switch (oEvent.type) {
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseMove:
      if (this._getScrollContainer().hasClass(this._grabbingCursorClass)) {
        if (sap.ui.getCore().getConfiguration().getRTL()) {
          this._getScrollContainer().scrollLeftRTL(this.iCursorPositionX - oEvent.pageX);
        } else {
          this._getScrollContainer().scrollLeft(this.iCursorPositionX - oEvent.pageX);
        }
        this._getScrollContainer().scrollTop(this.iCursorPositionY - oEvent.pageY);
        this._adjustAndShowArrow();
      }
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseDown:
      this._switchCursors(this._getScrollContainer(), this._defaultCursorClass, this._grabbingCursorClass);
      if (sap.ui.getCore().getConfiguration().getRTL()) {
        this.iCursorPositionX = this._getScrollContainer().scrollLeftRTL() + oEvent.pageX;
      } else {
        this.iCursorPositionX = this._getScrollContainer().scrollLeft() + oEvent.pageX;
      }
      this.iCursorPositionY = this._getScrollContainer().scrollTop() + oEvent.pageY;
      if (sap.ui.Device.system.combi) {
        //For Win8 surface no touch-start event is fired, but the mouse-down event instead do initialization here
        this._iTouchStartScrollLeft = this._getScrollContainer().scrollLeft();
        if (this.getScrollable()) {
          this._iTouchStartScrollTop = this._getScrollContainer().scrollTop();
        }
      }
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseUp:
      this._switchCursors(this._getScrollContainer(), this._grabbingCursorClass, this._grabCursorClass);
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseLeave:
      this._getScrollContainer().removeClass(this._grabbingCursorClass);
      this._getScrollContainer().removeClass(this._grabCursorClass);
      this._getScrollContainer().addClass(this._defaultCursorClass);
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseEnter:
      this._getScrollContainer().removeClass(this._defaultCursorClass);
      if (oEvent.buttons === null) {
        if (oEvent.which === 1) {
          this._getScrollContainer().addClass(this._grabbingCursorClass);
        } else {
          this._getScrollContainer().addClass(this._grabCursorClass);
        }
      } else {
        if (oEvent.buttons === 0) {
          this._getScrollContainer().addClass(this._grabCursorClass);
        } else if (oEvent.buttons === 1) {
          this._getScrollContainer().addClass(this._grabbingCursorClass);
        }
      }
      break;
  }
  //Check if the event was triggered by a click on a Connection Label and allow the propagation of the event.
  //Otherwise default click event in Connection Label is interrupted.
  if (oEvent.target && oEvent.target.parentElement && oEvent.target.parentElement.parentElement &&
      oEvent.target.parentElement.parentElement instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
    if (oEvent && !oEvent.isPropagationStopped()) {
      oEvent.stopPropagation();
    }
    if (oEvent && !oEvent.isImmediatePropagationStopped()) {
      oEvent.stopImmediatePropagation();
    }
  }
};

/**
 * ProcessFlow has the focus, therefore it is necessary to set the navigation focus.
 * The method is called both when ProcessFlow gets the focus and at any click event.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype.onfocusin = function (oEvent) {
  var oTarget;
  if (oEvent && oEvent.target && oEvent.target.id) {
    oTarget = sap.ui.getCore().byId(oEvent.target.id);
  }
  //Set the navigation focus on the lane header if in lanes-only mode.
  if (this._isHeaderMode()) {
    this._setFocusOnHeader(true);
  }
  else { //set the focus on the first node, if event target is not ConnectionLabel
    if (this._bSetFocusOnce) {
      this._bSetFocusOnce = false;
      if (oTarget && oTarget instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
        this._changeNavigationFocus(null, oTarget);
      }
      else {
        if (!this._lastNavigationFocusElement) {
          var $nodeToFocus = this.$("scroll-content").children().children().children(1).children("td[tabindex='0']").first().children();
          var oNodeToFocus = sap.ui.getCore().byId($nodeToFocus[0].id);
          this._changeNavigationFocus(null, oNodeToFocus);
        } else {//there is a previous focus on process flow
          this._changeNavigationFocus(null, this._lastNavigationFocusElement);
        }
      }
    }
  }
};

/**
 * ProcessFlow has the focus, therefore it is necessary to set the navigation focus.
 * The method is called both when ProcessFlow loses the focus and at any click event.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype.onfocusout = function (oEvent) {
  this._bSetFocusOnce = true;
  if (this._lastNavigationFocusElement && this._lastNavigationFocusElement._getNavigationFocus()) {
    this._lastNavigationFocusElement._setNavigationFocus(false);
    if (this._lastNavigationFocusElement instanceof sap.suite.ui.commons.ProcessFlowNode) {
      this._lastNavigationFocusElement.rerender();
    }
  }
};

/**
 * Method called if the ProcessFlow has the navigation focus and the plus sign is pressed
 *
 * @private
 * @since 1.26
 */
sap.suite.ui.commons.ProcessFlow.prototype.onsapplus = function (oEvent) {
  this._isFocusChanged = true;
  this.zoomIn();
};

/**
 * Method called if the ProcessFlow has the navigation focus and the minus sign is pressed
 *
 * @private
 * @since 1.26
 */
sap.suite.ui.commons.ProcessFlow.prototype.onsapminus = function (oEvent) {
  this._isFocusChanged = true;
  this.zoomOut();
};

/**
 * Method called if ProcessFlow has the navigation focus and the Tab key is pressed.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype.onsaptabnext = function (oEvent) {
  var bNextElementToFocus = true;
  var $activeElement = oEvent.target;
  if (oEvent.target && oEvent.target.childElementCount > 0) {
    $activeElement = oEvent.target.childNodes[0];
  }
  var oActiveElement = sap.ui.getCore().byId($activeElement.id);

  if (!(oActiveElement instanceof sap.suite.ui.commons.ProcessFlowNode) && !(oActiveElement instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel)) {
    if (!this._isHeaderMode() && !this._lastNavigationFocusElement) {
      var $nodeToFocus = this.$("scroll-content").children().children().children(1).children("td[tabindex='0']").first().children();
      var oNodeToFocus = sap.ui.getCore().byId($nodeToFocus[0].id);
      this._changeNavigationFocus(null, oNodeToFocus);
      bNextElementToFocus = false;
    } else if (this._lastNavigationFocusElement) {
      this._changeNavigationFocus(null, this._lastNavigationFocusElement);
      bNextElementToFocus = false;
    }
  }
  if (this._isHeaderMode() && bNextElementToFocus) { //lanes-only
    if (!this._headerHasFocus) {
      this._setFocusOnHeader(true);
    } else {
      this._setFocusOnHeader(false);
    }
  } else {
      if ((this._lastNavigationFocusElement instanceof sap.suite.ui.commons.ProcessFlowNode)) {
        this._lastNavigationFocusElement.rerender();
      }
  }

  //release focus
  if (bNextElementToFocus) {
    var oNextElementToFocus = this.$().nextAll().find(":focusable").first();

    if (oNextElementToFocus.length === 0) {
      setNextFocusableElement.bind(this)();
    }
    oNextElementToFocus.focus();
    jQuery.sap.log.debug("saptabnext: Keyboard focus has been changed to element:  id='" + oNextElementToFocus.id + "' outerHTML='" + bNextElementToFocus.outerHTML + "'");
    oNextElementToFocus = null;
  }
  oEvent.preventDefault();

  function setNextFocusableElement() {
    //set focus on the next element outside the ProcessFlow control
    var $parent = this.$().parent();
    do {
      oNextElementToFocus = $parent.next(":focusable");
      if (oNextElementToFocus.length === 0) {
        oNextElementToFocus = $parent.nextAll().find(":focusable").first();
      }
      $parent = $parent.parent();
    } while (($parent.length !== 0) && (oNextElementToFocus.length === 0));
    return;
  }
};

/**
 * Method called if ProcessFlow has the navigation focus and Tab and Shift keys are pressed simultaneously.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype.onsaptabprevious = function (oEvent) {
  var oPrevElementToFocus = null;
  var $activeElement = oEvent.target;
  if ((!this._lastNavigationFocusElement || !this._lastNavigationFocusElement._getNavigationFocus()) && oEvent.target && oEvent.target.childElementCount > 0) {
    $activeElement = oEvent.target.childNodes[0];
  }
  var oActiveElement = sap.ui.getCore().byId($activeElement.id);

  if (oActiveElement && ((oActiveElement instanceof sap.suite.ui.commons.ProcessFlowNode) || (oActiveElement instanceof sap.suite.ui.commons.ProcessFlowConnection))) {
    if (!this._isHeaderMode() && !this._lastNavigationFocusElement) {
      var $nodeToFocus = this.$("scroll-content").children().children().children(1).children("td[tabindex='0']").first().children();
      var oNodeToFocus = sap.ui.getCore().byId($nodeToFocus[0].id);
      this._changeNavigationFocus(null, oNodeToFocus);
    } else if (this._lastNavigationFocusElement) {//there is a previous focus on process flow
      this._changeNavigationFocus(null, this._lastNavigationFocusElement);
      oEvent.preventDefault();
      return;
    }
  }
  if (this._isHeaderMode()) { //lanes-only.
    if (!this._headerHasFocus) {
      this._setFocusOnHeader(true);
    } else {
      this._setFocusOnHeader(false);
      oPrevElementToFocus = this.$().prevAll().find(":focusable").first();
    }
  } else {
    oPrevElementToFocus = this.$().prev(":focusable");
    if (oPrevElementToFocus.length === 0) {
      oPrevElementToFocus = this.$().prevAll().find(":focusable").first();
    }
    if (this._lastNavigationFocusElement) {
      this._lastNavigationFocusElement._setNavigationFocus(false);
    }
    if (this._lastNavigationFocusElement instanceof sap.suite.ui.commons.ProcessFlowNode) {
      this._lastNavigationFocusElement.rerender();
    }
  }

  //release focus
  if (oPrevElementToFocus) {
    //set focus on the previous element outside the ProcessFlow control
    if (oPrevElementToFocus.length === 0) {
      setPrevFocusableElement.bind(this)();
    } else if (oPrevElementToFocus.first().length !== 0) {
      oPrevElementToFocus = jQuery(oPrevElementToFocus.first());
    }
    oPrevElementToFocus.focus();
    jQuery.sap.log.debug("saptabnext: Keyboard focus has been set on element:  id='" + oPrevElementToFocus.id + "' outerHTML='" + oPrevElementToFocus.outerHTML + "'");
    oPrevElementToFocus = null;
  }

  oEvent.preventDefault();

  function setPrevFocusableElement() {
    var $parent = this.$();
    do {
      oPrevElementToFocus = $parent.prev(":focusable");
      if (oPrevElementToFocus.length === 0) {
        oPrevElementToFocus = $parent.prevAll().find(":focusable").last();
      }
      $parent = $parent.parent();
    } while (($parent.length !== 0) && (oPrevElementToFocus.length === 0));
    return;
  }


};

/**
 * Method called if ProcessFlow has the navigation focus and Spacebar or Enter key are pressed.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype.onsapselect = function (oEvent) {
  if (this._isHeaderMode()) { //lanes-only.
    this._internalLanes = [];
    this.fireHeaderPress(this);
    var $nodeToFocus = this.$("scroll-content").children().children().children(1).children("td[tabindex='0']").first().children();
    var oNodeToFocus = sap.ui.getCore().byId($nodeToFocus[0].id);
    this._changeNavigationFocus(null, oNodeToFocus);
  } else {
    if (this._lastNavigationFocusElement instanceof sap.suite.ui.commons.ProcessFlowNode && this._lastNavigationFocusElement._getNavigationFocus()) {
      this.fireNodePress(this._lastNavigationFocusElement);
    }
  }
};

/**
 * Method called if ProcessFlow has the navigation focus and the Down arrow key is pressed
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype.onkeydown = function (oEvent) {
  var keycode = (oEvent.keyCode ? oEvent.keyCode : oEvent.which);
  jQuery.sap.log.debug("ProcessFlow::keyboard input has been catched and action going to start: keycode=" + keycode);

  var bElementFocusChanged = false;
  var ctrlKeyPressed = oEvent.ctrlKey;
  var altKeyPressed = oEvent.altKey;
  var oPreviousNavigationElement = this._lastNavigationFocusElement;

  switch (keycode) {
    case jQuery.sap.KeyCodes.ARROW_RIGHT:
      bElementFocusChanged = this._moveToNextElement(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT);
      break;
    case jQuery.sap.KeyCodes.ARROW_LEFT:
      bElementFocusChanged = this._moveToNextElement(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT);
      break;
    case jQuery.sap.KeyCodes.ARROW_DOWN:
      bElementFocusChanged = this._moveToNextElement(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.DOWN);
      break;
    case jQuery.sap.KeyCodes.ARROW_UP:
      bElementFocusChanged = this._moveToNextElement(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP);
      break;
    case jQuery.sap.KeyCodes.PAGE_UP:
      bElementFocusChanged = this._moveOnePage(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP, altKeyPressed);
      break;
    case jQuery.sap.KeyCodes.PAGE_DOWN:
      bElementFocusChanged = this._moveOnePage(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.DOWN, altKeyPressed);
      break;
    case jQuery.sap.KeyCodes.HOME:
      bElementFocusChanged = this._moveHomeEnd(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT, ctrlKeyPressed);
      break;
    case jQuery.sap.KeyCodes.END:
      bElementFocusChanged = this._moveHomeEnd(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT, ctrlKeyPressed);
      break;
    case jQuery.sap.KeyCodes.NUMPAD_0:
    case jQuery.sap.KeyCodes.DIGIT_0:
      this._initZoomLevel();
      break;
    case jQuery.sap.KeyCodes.ENTER:
    case jQuery.sap.KeyCodes.SPACE:
      //ENTER and SPACE (or sapselect) are fired according to the spec, but we need to prevent the default behavior.
      oEvent.preventDefault();
      return;
    default:
      //It was not our key, let default action be executed if any.
      return;
  }

  //It was our key, default action has to suppressed.
  oEvent.preventDefault();

  if (bElementFocusChanged) {
    //We have to re-render when we changed Element-focus inside our control.
    this._changeNavigationFocus(oPreviousNavigationElement, this._lastNavigationFocusElement);
  }
};

/**
 * Handles the click on the arrows.
 *
 * @private
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._onArrowClick = function (oEvent) {
  var sTargetId = oEvent.target.id;
  if (sTargetId) {
    var sId = this.getId();
    //For scroll buttons: Prevent IE from firing beforeunload event -> see CSN 4378288 2012
    oEvent.preventDefault();
    //On mobile devices, the click on arrows has no effect.
    if (sTargetId == sId + sap.suite.ui.commons.ProcessFlow._constants.arrowScrollLeftMinus && sap.ui.Device.system.desktop) {
      //Scroll back/left button.
      this._scroll(-this._scrollStep, 500);
    } else if (sTargetId == sId + sap.suite.ui.commons.ProcessFlow._constants.arrowScrollRightMinus && sap.ui.Device.system.desktop) {
      //Scroll forward/right button.
      this._scroll(this._scrollStep, 500);
    }
  }
};

/**
 * Handles the onScroll event.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._onScroll = function (oEvent) {
  var iScrollLeft = this._getScrollContainer().scrollLeft();
  var iDelta = Math.abs(iScrollLeft - this._iTouchStartScrollLeft);
  //Only valid if the focus does not change.
  if (iDelta > (this._scrollStep / 4) && !this._isFocusChanged) {
    //Update arrows when 1/4 lane was scrolled.
    this._adjustAndShowArrow();
    this._iTouchStartScrollLeft = iScrollLeft;
  }
  else {
    //Update vertical alignment of arrows if only vertical scrolling is possible.
    if (this.getScrollable()) {
      var iScrollTop = this._getScrollContainer().scrollTop();
      var iDeltaTop = Math.abs(iScrollTop - this._iTouchStartScrollTop);
      if (iDeltaTop > 10) {
        this._moveArrowAndCounterVertical();
        this._iTouchStartScrollTop = iScrollTop;
      }
    }
  }
};

/**
 * Initializes left and upper distance when scrolling starts.
 *
 * @private
 * @param {jQuery.Event} oEvent
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype.ontouchstart = function (oEvent) {
  this._iTouchStartScrollLeft = this._getScrollContainer().scrollLeft();
  if (this.getScrollable()) {
    this._iTouchStartScrollTop = this._getScrollContainer().scrollTop();
  }
};

/**
 * Handles the click of labels and triggers the related ProcessFlow event.
 *
 * @private
 * @params {Object} Event Args, containing the label and related information
 */
sap.suite.ui.commons.ProcessFlow.prototype._handleLabelClick = function (oEvent) {
  if (oEvent) {
    var oConnectionLabel = oEvent.getSource();
    //Check if user clicked on icon.
    if (oConnectionLabel instanceof sap.ui.core.Icon) {
        oConnectionLabel = oConnectionLabel.getParent();
     }
    if (oConnectionLabel instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
      var aRelevantConnectionMapEntries = this._getConnectionMapEntries(oConnectionLabel);
      var eventArgsToFire = this._createLabelPressEventArgs(oConnectionLabel, aRelevantConnectionMapEntries);
      this.fireLabelPress(eventArgsToFire);
    }
  }
};

/**
 * Method called on navigation focus change.
 * Scrolls the PF content, so the element is as close to the middle of the scroll container viewport as possible.
 *
 * @private
 * @since 1.23
 */
sap.suite.ui.commons.ProcessFlow.prototype._onFocusChanged = function () {
  var oFocusedElement = this._lastNavigationFocusElement,
      $focusedElement = oFocusedElement ? oFocusedElement.$() : null,
      iScrollContainerInnerWidth,
      iScrollContainerInnerHeight,
      iScrollLeft,
      iScrollTop,
      $scrollContent,
      iContentInnerWidth,
      iContentInnerHeight,
      iElementOuterWidth,
      iElementOuterHeight,
      oPositionInContent,
      iElementLeftPosition,
      iElementTopPosition,
      iElementRightPosition,
      iElementBottomPosition,
      iCorrectionLeft, iCorrectionTop,
      iScrollTimeInMillis = 500;

  if (oFocusedElement && this.getScrollable()) {
    jQuery.sap.log.debug("The actually focused element is " + oFocusedElement.getId());

    //If the element (oNode or label) is a label, get data from the TD parent element. Otherwise it does not work precisely
    if (oFocusedElement instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
      iElementOuterWidth = $focusedElement.parent().parent().parent().outerWidth();
      iElementOuterHeight = $focusedElement.parent().parent().parent().outerHeight();
      oPositionInContent = $focusedElement.parent().parent().parent().position();
    } else {
      iElementOuterWidth = $focusedElement.outerWidth();
      iElementOuterHeight = $focusedElement.outerHeight();
      oPositionInContent = $focusedElement.position();
    }
    jQuery.sap.log.debug("Element outer width x height [" + iElementOuterWidth + " x " + iElementOuterHeight + "]");
    jQuery.sap.log.debug("Position of element in the content is [" + oPositionInContent.left + ", " + oPositionInContent.top + "]");

    $scrollContent = this.$("scroll-content");
    iScrollContainerInnerWidth = this._getScrollContainer().innerWidth();
    iScrollContainerInnerHeight = this._getScrollContainer().innerHeight();
    jQuery.sap.log.debug("Scroll container inner width x height [" + iScrollContainerInnerWidth + " x " + iScrollContainerInnerHeight + "]");

    iScrollLeft = this._getScrollContainer().scrollLeft();
    iScrollTop = this._getScrollContainer().scrollTop();
    jQuery.sap.log.debug("Current scroll offset is [" + iScrollLeft + ", " + iScrollTop + "]");

    iContentInnerWidth = $scrollContent.innerWidth();
    iContentInnerHeight = $scrollContent.innerHeight();
    jQuery.sap.log.debug("Scroll content inner width x height [" + iContentInnerWidth + " x " + iContentInnerHeight + "]");

    //Defines 4 borders (L: Left, R: Right, T: Top, B: Bottom) for position of the clicked node in the visible content.
    iElementLeftPosition = -iScrollLeft + oPositionInContent.left;
    iElementRightPosition = iElementLeftPosition + iElementOuterWidth;
    iElementTopPosition = -iScrollTop + oPositionInContent.top;
    iElementBottomPosition = iElementTopPosition + iElementOuterHeight;

    //Checks if the node is located (even in part) outside the visible part of the scroll container.
    if ((iElementRightPosition > iScrollContainerInnerWidth) || (iElementLeftPosition < 0) || (iElementBottomPosition > iScrollContainerInnerHeight) || (iElementTopPosition < 0)) {
      //iCorrectionLeft, correction on left direction to center the node.
      iCorrectionLeft = Math.round((iScrollContainerInnerWidth - iElementOuterWidth) / 2);
      iCorrectionLeft = Math.max(iScrollContainerInnerWidth - iContentInnerWidth + oPositionInContent.left, iCorrectionLeft);
      iCorrectionLeft = Math.min(oPositionInContent.left, iCorrectionLeft);

      //iCorrectionTop, correction on upwards to center the node.
      iCorrectionTop = Math.round((iScrollContainerInnerHeight - iElementOuterHeight) / 2);
      iCorrectionTop = Math.max(iScrollContainerInnerHeight - iContentInnerHeight + oPositionInContent.top, iCorrectionTop);
      iCorrectionTop = Math.min(oPositionInContent.top, iCorrectionTop);
      jQuery.sap.log.debug("Element lies outside the scroll container, scrolling from [" + iElementLeftPosition + "," + iElementTopPosition + "] to [" + iCorrectionLeft + "," + iCorrectionTop + "]");
      this._isFocusChanged = true;
      this._getScrollContainer().animate({
        scrollTop: oPositionInContent.top - iCorrectionTop,
        scrollLeft: oPositionInContent.left - iCorrectionLeft
      }, iScrollTimeInMillis, "swing", jQuery.proxy(this._adjustAndShowArrow, this));
    } else {
      jQuery.sap.log.debug("Element lies inside the scroll container, no scrolling happens.");
      this._setFocusToNode(oFocusedElement);
    }
  } else { //Non scrollable needs also to set the focus.
    this._setFocusToNode(oFocusedElement);
    this._adjustAndShowArrow();
  }
};

/* =========================================================== */
/* Getter/Setter private methods                               */
/* =========================================================== */

/**
 * Sets the scroll width depending on the zoom level.
 *
 * @private
 * @param scrollContainer the scroll container
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._setScrollWidth = function () {
  //The distance to scroll depends on the ZoomLevel.
  switch (this.getZoomLevel()) {
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.One):
      this._scrollStep = 240;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Two):
      this._scrollStep = 192;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Three):
      this._scrollStep = 168;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Four):
      this._scrollStep = 128;
      break;
  }
};

/**
 * Returns the last element that had the navigation focus before passing it to the current element
 *
 * @private
 * @returns {sap.suite.ui.commons.ProcessFlowNode} found ProcessFlow node or connection
 */
sap.suite.ui.commons.ProcessFlow.prototype._getLastNavigationFocusElement = function () {
  return this._lastNavigationFocusElement;
};

/**
 * Returns the node from the given array which matches to the given nodeId.
 *
 * @private
 * @param {String} nodeId Id of node to retrieve
 * @param {sap.suite.ui.commons.ProcessFlowNode[]} internalNodes Array of nodes to search in
 * @returns {sap.suite.ui.commons.ProcessFlowNode} Found ProcessFlow node
 */
sap.suite.ui.commons.ProcessFlow.prototype._getNode = function (nodeId, internalNodes) {
  for (var i = 0; i < internalNodes.length; i++) {
    if (internalNodes[i].getNodeId() === nodeId.toString()) {
      return internalNodes[i];
    }
  }
};

/**
 * Returns the lane from the _internalLanes array which matches to the given laneId.
 *
 * @private
 * @param {String} laneId Id of lane to retrieve
 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader} The lane header element
 */
sap.suite.ui.commons.ProcessFlow.prototype._getLane = function (laneId) {
  for (var i = 0; i < this._internalLanes.length; i++) {
    if (this._internalLanes[i].getLaneId() === laneId) {
      return this._internalLanes[i];
    }
  }
};

/**
 * Returns the id of the given child node element. Since child elements can be strings or objects, this function checks the type and
 * returns the nodeId.
 *
 * @private
 * @param {Object/String} The child element containing the nodeId
 * @returns {Number} The id of the child element
 */
sap.suite.ui.commons.ProcessFlow._getChildIdByElement = function (childElement) {
  if (typeof childElement === 'object') {
    return childElement.nodeId;
  } else {
    return childElement;
  }
};

/**
 * Checks if ProcessFlow is in header mode.
 *
 * @private
 * @returns {Boolean} Value which describes if ProcessFlow is in header mode
 */
sap.suite.ui.commons.ProcessFlow.prototype._isHeaderMode = function () {
  var aNodes = this.getNodes();
  return !aNodes || (aNodes.length === 0);
};

/* =========================================================== */
/* Helper methods                                              */
/* =========================================================== */

/**
 * Function retrieves the scroll container object
 *
 * @private
 * @returns {Object} scroll container DOM object
 */
sap.suite.ui.commons.ProcessFlow.prototype._getScrollContainer = function () {
  return this.$(sap.suite.ui.commons.ProcessFlow._constants.scrollContainer);
};

/**
 * Function handles the exception based on the business requirements.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._handleException = function (exc) {
  var sTextToDisplay = this._resBundle.getText('PF_ERROR_INPUT_DATA');
  this.fireOnError({ text: sTextToDisplay });
  jQuery.sap.log.error("Error loading data for the process flow with id : " + this.getId());

  if (exc instanceof Array) {
    for (var i = 0 ; i < exc.length; i++) {
      jQuery.sap.log.error("Detailed description (" + i + ") :" + exc[i]);
    }
  } else {
    jQuery.sap.log.error("Detailed description  :" + exc);
  }
};

/**
 * Returns ARIA text for ProcessFlow table.
 *
 * @private
 * @returns {String} Text for screen reader
 */
sap.suite.ui.commons.ProcessFlow.prototype._getAriaText = function () {
  var sAriaText =  this._resBundle.getText('PF_ARIA_PROCESS_FLOW');
  return sAriaText;
};

/**
 * Function updates the lanes, if more nodes belong to the same lane
 * it must check the node consistency, so this is done the first time the consistency check runs.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._updateLanesFromNodes = function () {
  sap.suite.ui.commons.ProcessFlow.NodeElement._createNodeElementsFromProcessFlowNodes(this.getNodes(), this.getLanes());
  var aInternalNodes = this._arrangeNodesByParentChildRelation(this.getNodes());
  this._internalLanes = sap.suite.ui.commons.ProcessFlow.NodeElement._updateLanesFromNodes(this.getLanes(), aInternalNodes).lanes;
};

/**
 * Function creates the lane header objects.
 *
 * @private
 * @returns {Object} array of lane positions to lane header element control instances
 */
sap.suite.ui.commons.ProcessFlow.prototype._getOrCreateLaneMap = function () {
  if (!this._internalLanes || this._internalLanes.length <= 0) {
    this._updateLanesFromNodes();
  }
  var aLaneHeaderPositions = sap.suite.ui.commons.ProcessFlow.NodeElement._createMapFromLanes(this._internalLanes,
      jQuery.proxy(this.ontouchend, this), this._isHeaderMode()).positionMap;
  return aLaneHeaderPositions;
};

/**
 * This function sorts the internal array of nodes in terms all parents are followed by their children, i.e. no child occurs before his parent in the array.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowNode[]} internalNodes an internal array of nodes to be sorted.
 * @returns {sap.suite.ui.commons.ProcessFlowNode[]} internalNodes sorted internal array of nodes.
 * @since 1.26
 */
sap.suite.ui.commons.ProcessFlow.prototype._arrangeNodesByParentChildRelation = function (internalNodes) {
  var iInternalNodesLength = internalNodes ? internalNodes.length : 0;
  var aChildren = [];
  var i, j;
  // Move parents before their children, if they are in the same lane.
  if (iInternalNodesLength > 0) {
    this._setParentForNodes(internalNodes);
    for (i = 0; i < iInternalNodesLength; i++) {
      aChildren = internalNodes[i].getChildren();
      if (aChildren) {
        var iChildrenCount = aChildren.length;
        for (j = 0; j < iChildrenCount; j++) {
          aChildren[j] = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]).toString();
        }
      }
      for (j = 0; j < i; j++) {
        if (jQuery.inArray(internalNodes[j].getNodeId(), aChildren) > -1 && internalNodes[j].getLaneId() === internalNodes[i].getLaneId()) {
          internalNodes.splice(j, 0, internalNodes[i]);
          internalNodes.splice(i + 1, 1);
          internalNodes = this._arrangeNodesByParentChildRelation(internalNodes);
          break;
        }
      }
    }
  }
  return internalNodes;
};

/**
 * Function creates matrix with positions of nodes and connections. This is
 * relative node connection representation and does not cover real page layout.
 *
 * @private
 * @returns The created ProcessFlow control
 */
sap.suite.ui.commons.ProcessFlow.prototype._getOrCreateProcessFlow = function () {
  if (!this._internalLanes || this._internalLanes.length <= 0) {
    this._updateLanesFromNodes();
  }

  this.applyNodeDisplayState();
  var aInternalNodes = this.getNodes();

  var oResult = sap.suite.ui.commons.ProcessFlow.NodeElement._createNodeElementsFromProcessFlowNodes(aInternalNodes, this._internalLanes);
  var aElementById = oResult.elementById;
  var aElementsByLane = oResult.elementsByLane;

  sap.suite.ui.commons.ProcessFlow.NodeElement._calculateLaneStatePieChart(aElementsByLane, this._internalLanes, aInternalNodes, this);

  var mCalculatedMatrix = this._calculateMatrix(aElementById);
  mCalculatedMatrix = this._addFirstAndLastColumn(mCalculatedMatrix);
  //Convert NodeElements back to ProcessFlowNodes.
  for (var i = 0; i < mCalculatedMatrix.length; i++) {
    for (var j = 0; j < mCalculatedMatrix[i].length; j++) {
      if (mCalculatedMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlow.NodeElement) {
        mCalculatedMatrix[i][j] = aElementById[mCalculatedMatrix[i][j].nodeId].oNode;
      }
    }
  }
  this._internalCalcMatrix = mCalculatedMatrix;
  return mCalculatedMatrix;
};

/**
 * Function adds first and last column, which serves for the special header signs. It has to add
 * single cell to all internal arrays.
 *
 * @private
 * @param calculatedMatrix
 * @returns {Array} The calculated matrix including first and last column
 */
sap.suite.ui.commons.ProcessFlow.prototype._addFirstAndLastColumn = function (calculatedMatrix) {

  if (!calculatedMatrix || calculatedMatrix.length <= 0) {
    return [];
  }

  var originalX = calculatedMatrix.length;

  for (var i = 0; i < originalX; i++) {
    calculatedMatrix[i].unshift(null);
    calculatedMatrix[i].push(null);
  }

  return calculatedMatrix;
};

/**
 * Function calculates a virtual matrix with nodes and connections.
 *
 * @private
 * @param elementById contains a map of the node id's to node elements
 * @throws an array with messages on processing errors
 * @returns {Array} The composed virtual matrix
 */
sap.suite.ui.commons.ProcessFlow.prototype._calculateMatrix = function (elementById) {
  var oInternalMatrixCalculation,
      oElementInfo,
      iLaneHighestNumber,
      iRowsCount,
      mCalculatedMatrix;

  //No calculation in case of zero input.
  if (!elementById || (elementById.length === 0)) {
    return [];
  }

  oInternalMatrixCalculation = new sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation(this);
  oInternalMatrixCalculation.checkInputNodeConsistency(elementById);
  oElementInfo = oInternalMatrixCalculation._retrieveInfoFromInputArray(elementById);
  oInternalMatrixCalculation._resetPositions();
  iLaneHighestNumber = oElementInfo.highestLanePosition + 1;

  // Worst case, all children are in the same lane with so many rows.
  iRowsCount = Math.max(Object.keys(elementById).length, 2);
  mCalculatedMatrix = oInternalMatrixCalculation._createMatrix(iRowsCount, iLaneHighestNumber);

  for (var i = 0; i < oElementInfo.rootElements.length; i++) {
    oInternalMatrixCalculation.iPositionY = oElementInfo.rootElements[i].lane;
    mCalculatedMatrix = oInternalMatrixCalculation.processCurrentElement(oElementInfo.rootElements[i], elementById, mCalculatedMatrix);
  }
  if (this._isLayoutOptimized) {
    oInternalMatrixCalculation._optimizeMatrix(mCalculatedMatrix, elementById);
  }
  mCalculatedMatrix = oInternalMatrixCalculation._doubleColumnsInMatrix(mCalculatedMatrix);
  mCalculatedMatrix = oInternalMatrixCalculation._calculatePathInMatrix(mCalculatedMatrix);
  mCalculatedMatrix = oInternalMatrixCalculation._removeEmptyLines(mCalculatedMatrix);
  return mCalculatedMatrix;
};

/**
 * This is a virtual node holding necessary data to create virtual matrix.
 *
 * @private
 * @param {string} id id of the PF node
 * @param {number} lane lane position of the node
 * @param {sap.suite.ui.commons.ProcessFlowNode} node a PF node
 * @param {Number[]} aNodeParents array of parent id's of the node
 */
sap.suite.ui.commons.ProcessFlow.NodeElement = function (id, lane, node, nodeParents) {
  this.nodeId = id;
  this.lane = lane;
  this.state = node.getState();
  this.displayState = node._getDisplayState();
  this.isProcessed = false;

  if (jQuery.isArray(nodeParents)) {
    this.aParent = nodeParents;
  } else {
    this.oParent = nodeParents;
  }
  this.oNode = node;
};

/**
 * Another type of the node element constructor.
 *
 * @private
 * @param id node id
 * @param lane lane position
 * @param node reference to a PF node control
 * @param nodeParents reference to the ids of parents of the oNode
 * @returns A new node element
 */
sap.suite.ui.commons.ProcessFlow.NodeElement._initNodeElement = function (id, lane, node, nodeParents) {
  return new sap.suite.ui.commons.ProcessFlow.NodeElement(id, lane, node, nodeParents);
};

/**
 * Extend the NodeElement object with to String function.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.NodeElement.prototype = {
  toString: function () {
    return this.nodeId;
  },
  containsChildren: function (that) {
    if (!that) {
      return false;
    }
    if (!(that instanceof sap.suite.ui.commons.ProcessFlow.NodeElement)) {
      return false;
    }
    if (this.oNode.getChildren() && that.oNode.getChildren() && this.oNode.getChildren().length && that.oNode.getChildren().length) {
      for (var i = 0; i < this.oNode.getChildren().length; i++) {
        if (that.oNode.getChildren().indexOf(this.oNode.getChildren()[i]) >= 0) {
          return true;
        }
      }
    }
    return false;
  }
};

/**
 * Function calculates the state part of the lane from nodes belong to this lane.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.NodeElement._calculateLaneStatePieChart = function (laneElements, lanes, internalNodes, processFlow) {
  // Check input parameters.
  if (!laneElements || !lanes || !internalNodes) {
    return;
  }

  //First, check if all nodes are in the regular state. If not, only the highlighted ones are taken into calculation.
  for (var i = 0; i < internalNodes.length; i++) {
    processFlow._bHighlightedMode = internalNodes[i].getHighlighted();
    if (processFlow._bHighlightedMode) {
      break;
    }
  }

  var iPositiveCount, iNegativeCount, iNeutralCount, iPlannedCount, iCriticalCount;
  for (var i = 0; i < lanes.length; i++) {
    var oLane = lanes[i];
    var oLaneElements = laneElements[oLane.getLaneId()];

    //If we do not have nodes, nothing needs to be calculated.
    if (!oLaneElements) {
      continue;
    }

    iPositiveCount = 0;
    iNegativeCount = 0;
    iNeutralCount = 0;
    iPlannedCount = 0;
    iCriticalCount = 0;

    for (var j = 0; j < oLaneElements.length; j++) {
      //Maybe ...oNode.getHighlighted() can be used instead of the big selector which needs to be maintained in case of extensions.
      if (!processFlow._bHighlightedMode ||
          (oLaneElements[j].oNode._getDisplayState() == sap.suite.ui.commons.ProcessFlowDisplayState.Highlighted ||
           oLaneElements[j].oNode._getDisplayState() == sap.suite.ui.commons.ProcessFlowDisplayState.HighlightedFocused ||
           oLaneElements[j].oNode._getDisplayState() == sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlighted ||
           oLaneElements[j].oNode._getDisplayState() == sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlightedFocused)) {
        switch (oLaneElements[j].oNode.getState()) {
          case sap.suite.ui.commons.ProcessFlowNodeState.Positive:
            iPositiveCount++;
            break;
          case sap.suite.ui.commons.ProcessFlowNodeState.Negative:
            iNegativeCount++;
            break;
          case sap.suite.ui.commons.ProcessFlowNodeState.Planned:
            iPlannedCount++;
            break;
          case sap.suite.ui.commons.ProcessFlowNodeState.Neutral:
            iNeutralCount++;
            break;
            //plannedNegative belong to the Negative group
          case sap.suite.ui.commons.ProcessFlowNodeState.PlannedNegative:
            iNegativeCount++;
            break;
          case sap.suite.ui.commons.ProcessFlowNodeState.Critical:
            iCriticalCount++;
            break;
        }
      }
    } // End of nodes for single lane.
    var oState = [{state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, value: iPositiveCount},
                     {state: sap.suite.ui.commons.ProcessFlowNodeState.Negative, value: iNegativeCount},
                     {state: sap.suite.ui.commons.ProcessFlowNodeState.Neutral, value: iNeutralCount},
                     {state: sap.suite.ui.commons.ProcessFlowNodeState.Planned, value: iPlannedCount},
                     {state: sap.suite.ui.commons.ProcessFlowNodeState.Critical, value: iCriticalCount}];
    oLane.setState(oState);
  }
};

/**
 * This function must check and calculate the potentially new lanes.
 * This is, because more nodes can be located in the same lane. In this case,
 * the new artificial lane is created and positioned just after original one.
 *
 * @private
 * @param processFlowLanes the original lane array
 * @param internalNodes internal nodes
 * @returns {Object} Dynamic object containing laines and nodes
 */
sap.suite.ui.commons.ProcessFlow.NodeElement._updateLanesFromNodes = function (processFlowLanes, internalNodes) {
  var oResult = sap.suite.ui.commons.ProcessFlow.NodeElement._createMapFromLanes(processFlowLanes, null, false);
  var aLanePositions = oResult.positionMap;
  var aLaneIds = oResult.idMap;
  var oNode = {};
  var aTempProcessFlowLanes = processFlowLanes.slice();
  var bPotentialNewLaneExists;
  var aTempLanesPositions = {};
  var iPosition = 0;

  for (var i = 0; i < internalNodes.length; i++) {
    oNode[internalNodes[i].getNodeId()] = internalNodes[i];
  }

  for (var i = 0; i < internalNodes.length; i++) {
    var oCurrentNode = internalNodes[i];
    var oCurrentNodeChildren = oCurrentNode.getChildren() || [];
    var iPositionUp = 1; //Check the move up for the given sublanes of the lane. Every new sublane creation.
    var iNewLaneId = null;
    var oNewLane = null;
    // Makes plus 1 effect.
    for (var j = 0; j < oCurrentNodeChildren.length; j++) { // Check the children.
      var iChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(oCurrentNodeChildren[j]);
      var oNodeChild = oNode[iChildId];
      if (!oNodeChild) {
        jQuery.sap.log.error("Node " + iChildId + " is not defined but used as child of node " + oCurrentNode.getNodeId());
      }
      if (oNodeChild && (oCurrentNode.getLaneId() == oNodeChild.getLaneId())) {
        // Create new lane id and check the lane.
        iNewLaneId = oNodeChild.getLaneId() + iPositionUp;
        oNewLane = aLaneIds[iNewLaneId];
        if (!oNewLane) { // If we have the lane already.
          var oCurrentLane = aLaneIds[oCurrentNode.getLaneId()];
          oNewLane = sap.suite.ui.commons.ProcessFlow.NodeElement._createNewProcessFlowElement(oCurrentLane, iNewLaneId, oCurrentLane.getPosition() + iPositionUp);
          // Update the maps and output array.
          aLaneIds[oNewLane.getLaneId()] = oNewLane;
          aTempProcessFlowLanes.splice(oNewLane.getPosition(), 0, oNewLane);
        }
        // Assign new lane to children
        // The new laneId should not override the old one, therefore it is stored in a hidden property
        oNodeChild._setMergedLaneId(oNewLane.getLaneId());
      }
      // Move also the assignment of this lane for all children. Otherwise it is bad ...
      // so, take the children of current children and move the lane position to the new lane, if necessary
      // it is in the case when the lane is the same as was PARENT node. this is important to understand,
      // that this children is already moved to new one, so parent lane is compared.
      // This is a recursion.
      sap.suite.ui.commons.ProcessFlow.NodeElement._changeLaneOfChildren(oCurrentNode.getLaneId(), oNodeChild, oNode);
    }
    // Now we should move all positions up about the number iPositionUp.
    // Also the position map is in wrong state now.
    // Now work with all vector, later on we can move only to lanes with higher position than working one.
    if (oNewLane) {
      aTempLanesPositions = {};
      bPotentialNewLaneExists = false;
      for (var iKey in aLanePositions) {
        if (oNewLane.getLaneId() == aLanePositions[iKey].getLaneId()) {
          bPotentialNewLaneExists = true;
          break;
        }
        if (parseInt(iKey) >= oNewLane.getPosition()) {
          var oTempLane = aLanePositions[iKey];
          aTempLanesPositions[oTempLane.getPosition() + iPositionUp] = oTempLane;
          // tempLaneObject.setPosition(tempLaneObject.getPosition()+iPositionUp);
        }
      }
      if (!bPotentialNewLaneExists) {
        for (var iTempLanePos in aTempLanesPositions) {
          iPosition = parseInt(iTempLanePos);
       // The moved position should not override the old one, therefore it is stored in a hidden property
          aTempLanesPositions[iPosition]._setMergedPosition(iPosition);
        }
        aTempLanesPositions[oNewLane.getPosition()] = oNewLane;
        for (var v = 0; v < oNewLane.getPosition(); v++) {
          aTempLanesPositions[v] = aLanePositions[v];
        }
        aLanePositions = aTempLanesPositions;
      }
    }
  }
  return { lanes: aTempProcessFlowLanes, nodes: internalNodes };
};

/**
 * This function changes the lane of child elements
 * It works recursively in order to reach all the child elements to the last levels.
 *
 * @private
 * @param laneId the id of the original lane
 * @param currentNode the current processed node
 * @param nodes the array of nodes
 */
sap.suite.ui.commons.ProcessFlow.NodeElement._changeLaneOfChildren = function (laneId, currentNode, nodes) {
  var aChildren = currentNode.getChildren();
  if (aChildren) {
    for (var i = 0; i < aChildren.length; i++) {
      var sChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[i]);
      var oChildrenNode = nodes[sChildId];
      if (oChildrenNode.getLaneId() == laneId) {
        oChildrenNode._setMergedLaneId(currentNode.getLaneId());
        sap.suite.ui.commons.ProcessFlow.NodeElement._changeLaneOfChildren(laneId, oChildrenNode, nodes);
      }
    }
  }
};

/**
 * This function creates a new ProcessFlow lane header element.
 *
 * @private
 * @param originalElement the original lane element
 * @param newLaneId the new lane id
 * @param newPosition the new lane position
 * @returns {Object} Dynamic object containing the new element
 */
sap.suite.ui.commons.ProcessFlow.NodeElement._createNewProcessFlowElement = function (originalElement, newLaneId, newPosition) {
  var oCloneElement = new sap.suite.ui.commons.ProcessFlowLaneHeader({
    laneId: newLaneId,
    iconSrc: originalElement.getIconSrc(),
    text: originalElement.getText(),
    state: originalElement.getState(),
    position: newPosition,
    zoomLevel: originalElement.getZoomLevel()
  });
  return oCloneElement;
};

/**
 * This function creates the map where key = position value - lane element.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowLaneHeader[]} processFlowLanes array of lanes
 * @param {function} tapHandler tap handler for the lane header element
 * @param {boolean} isInHeaderMode should be true, if the process flow is in the header mode
 * @returns {Object} Map of lane positions to lane header element control instances
 */
sap.suite.ui.commons.ProcessFlow.NodeElement._createMapFromLanes = function (processFlowLanes, tapHandler, isInHeaderMode) {
  var oLane,
      aLanePositions = {},
      aLaneIds = {},
      iLanesCount = processFlowLanes ? processFlowLanes.length : 0,
      i = 0;

  if (!iLanesCount) {
    return {};
  } else {
    while (i < iLanesCount) {
      oLane = processFlowLanes[i];
      if (oLane instanceof sap.suite.ui.commons.ProcessFlowLaneHeader) {
        aLanePositions[oLane.getPosition()] = oLane;
        aLaneIds[oLane.getLaneId()] = oLane;
        // Forward the icon click events from the lane header items to the ProcessFlow control.
        if (tapHandler) {
          oLane.attachPress(tapHandler);
        }
        oLane._setHeaderMode(isInHeaderMode);
      }
      i++;
    }

    return { positionMap: aLanePositions, idMap: aLaneIds };
  }
};

/**
*
* This function transforms from process flow node element into the internal
* node element. The strategy is to work inside algorithm only with internal
* representation.
*
* @private
* @parameter processFlowNodes PF nodes from the controls interface, preprocessed - so they all have a valid (user entered, resp. generated) lane id
* @parameter elementsByLane
* @returns {Object} Element containing elementById(NodeElement) and elementsByLane (NodeElement[])
*/
sap.suite.ui.commons.ProcessFlow.NodeElement._createNodeElementsFromProcessFlowNodes = function (processFlowNodes, processFlowLanes) {
  var aLanePositions = {}, // holds the transition between lane id and position.
      aLaneElements = {}, // holds the array of the elements for given laneId.
      aParents = {},
      oNode,
      iNodeCount = processFlowNodes ? processFlowNodes.length : 0,
      sNodeId,
      oLane,
      iLaneCount = processFlowLanes ? processFlowLanes.length : 0,
      sLaneId,
      aPositions = [],
      iLanePosition,
      aChildren,
      sChild,
      iChildCount,
      i,
      j,
      aIdElements = {};//array of elements identified by elementId

  if (iNodeCount === 0) {
    return { elementById: {}, elementsByLane: {} };
  }

  if (iLaneCount === 0) {
    throw ["No lane definition although there is a node definition."];
  }

  i = 0;
  while (i < iLaneCount) {
    oLane = processFlowLanes[i];
    sLaneId = oLane.getLaneId();
    iLanePosition = oLane.getPosition();

    if (aLanePositions[sLaneId]) {
      throw ["The lane with id: " + sLaneId + " is defined at least twice. (Lane error)"];
    }

    aLanePositions[sLaneId] = iLanePosition;

    if (jQuery.inArray(iLanePosition, aPositions) > -1) {
      throw ["The position " + iLanePosition + " is defined at least twice. (Lane error)."];
    } else {
      aPositions.push(iLanePosition);
    }

    aLaneElements[sLaneId] = [];
    i++;
  }

  // search for the parent
  i = 0;
  while (i < iNodeCount) {
    oNode = processFlowNodes[i];
    if (oNode instanceof sap.suite.ui.commons.ProcessFlowNode) {
      sNodeId = oNode.getNodeId();
      sLaneId = oNode.getLaneId();

      aChildren = oNode.getChildren() || [];
      iChildCount = aChildren.length;
      j = 0;
      while (j < iChildCount) {
        sChild = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]);
        aParents[sChild] = aParents[sChild] || [];
        aParents[sChild].push(sNodeId);
        j++;
      }
    }
    i++;
  }

  i = 0;
  while (i < iNodeCount) {
    oNode = processFlowNodes[i];
    if (oNode instanceof sap.suite.ui.commons.ProcessFlowNode) {
      sNodeId = oNode.getNodeId();

      if (!sNodeId) {
        throw ["There is a node which has no node id defined. (Title=" + oNode.getTitle() + ") and array position: " + i];
      }

      sLaneId = oNode.getLaneId();

      iLanePosition = aLanePositions[sLaneId];
      if (typeof iLanePosition !== 'number') {
        throw ["For the node " + sNodeId + " position (lane) is not defined."];
      }

      if (!aIdElements[sNodeId]) {
        aIdElements[sNodeId] = sap.suite.ui.commons.ProcessFlow.NodeElement._initNodeElement(sNodeId, iLanePosition, oNode, aParents[sNodeId]);

        aLaneElements[sLaneId].push(aIdElements[sNodeId]);
      } else {
        throw ["The node id " + sNodeId + " is used second time."];
      }
    }
    i++;
  }

  return { elementById: aIdElements, elementsByLane: aLaneElements };
};

/**
 * Constructor of the algorithm object.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation = function (parentControl) {
  this.parentControl = parentControl;
  this.iPositionX = 0;
  this.iPositionY = 0;

  this.nodePositions = {};
  this.mapChildToNode = {};
};

/**
 * Optimizes the matrix by removing the unnecessary empty spaces among nodes from the same lane
 *
 * @private
 * @param {Object} matrix The process flow matrix
 * @param {Object} elementById It contains a map with the mappings between node Ids to node elements
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._optimizeMatrix = function (matrix, elementById) {
  var bLaneOptimized;
  do {
    bLaneOptimized = false;
    for (var idxLane = 0; idxLane < matrix[0].length; idxLane++) {
      for (var idxRow = 0; idxRow < matrix.length - 1; idxRow++) {
        if (!matrix[idxRow][idxLane]) {
          // finds the next node on the lane
          var bNodesExist = false;
          for (var i = idxRow + 1; i < matrix.length; i++) {
            if (matrix[i][idxLane]) {
              bNodesExist = true;
              break;
            }
          }
          // if no further nodes available, goes to the next lane
          if (!bNodesExist) {
            break;
          }
          // removes the empty element inside the lane, if possible
          if (this._optimizeLane(matrix, idxRow, idxLane, elementById)) {
            bLaneOptimized = true;
          }
        }
      }
    }
  } while (bLaneOptimized);
};

/**
 * Optimizes the lane by removing the unnecessary empty spaces among nodes
 *
 * @private
 * @param {Object} matrix The process flow matrix
 * @param {Int} row The row number of the empty space element inside the matrix
 * @param {Int} lane The lane number of the empty space element inside the matrix
 * @param {Object} elementById It contains a map with the mappings between node Ids to node elements
 * @returns {boolean} True if the lane was optimized; otherwise false
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._optimizeLane = function (matrix, row, lane, elementById) {
  // find out if there are nodes on the lane to be moved instead the found empty space
  for (var i = row + 1; i < matrix.length; i++) {
    // there is a node that could be moved
    if (matrix[i][lane]) {
      var oNode = matrix[i][lane];
      // verify if the position is valid
      if (this._verifyOptimizeLane(matrix, row, i, lane, elementById)) {
        // move the element instead empty space
        matrix[row][lane] = oNode;
        this.nodePositions[oNode.nodeId].x = row;
        matrix[i][lane] = null;
        return true;
      } else {
        // do not spring over the nodes
        return false;
      }
    }
  }

  return false;
};

/**
 * Verifies if the lane can be optimized at the specified empty space position inside the lane
 *
 * @private
 * @param {Object} matrix The process flow matrix
 * @param {Int} row The row number of the empty space element inside the lane
 * @param {Int} elemRow The row number of the node that could replace the empty space inside the lane
 * @param {Int} lane The number of the lane that should be optimized
 * @param {Object} elementById It contains a map with the mappings between node Ids to node elements
 * @returns {boolean} True if the lane can be optimized at the specified position; false otherwise
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._verifyOptimizeLane = function (matrix, row, elemRow, lane, elementById) {
  // case1: between the node and children there is a valid path
  var oNode = matrix[elemRow][lane].oNode;
  if (oNode && oNode.getChildren()) {
    var aChildren = matrix[elemRow][lane].oNode.getChildren();
    for (var i = 0; i < aChildren.length; i++) {
      var sNodeId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[i]);
      var iChildLane = elementById[sNodeId].lane;
      // case 1a: empty path (child on the next lane)
      // case 2a: empty path (child on any lane but no nodes in between on the same row
      for (var j = lane + 1; j < iChildLane; j++) {
        if (matrix[row][j]) {
          return false;
        }
      }
    }
  }

  // case 2: between the node and parents there is a valid path
  var sOrigNodeId = matrix[elemRow][lane].nodeId;
  var oOrigPositionNode = this.nodePositions[sOrigNodeId];
  var aParents = matrix[elemRow][lane].aParent;
  if (aParents) {
    for (var i = 0; i < aParents.length; i++) {
      // case 2a: empty path (parent only on the previous lane)
      var sNodeId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aParents[i]);
      if (lane - 1 !== elementById[sNodeId].lane) {
        return false;
      }
      // case 2b: only nodes whose parents are below the child nodes on the row
      var oOrigPositionNodeParent = this.nodePositions[sNodeId];
      if (oOrigPositionNodeParent.x >= oOrigPositionNode.x) {
        return false;
      }
    }
  }

  // case 3: on the left part of the node, there are no overlapping connections between nodes and children (nodes and children are on the same side)
  for (var i = 0; i < lane; i++) {
    for (var j = 0; j < matrix.length; j++) {
      if (matrix[j][i] && matrix[j][i].oNode) {
        var sNodeId = matrix[j][i].nodeId;
        var oPositionElem = this.nodePositions[sNodeId];
        var aChildren = matrix[j][i].oNode.getChildren();
        if (aChildren) {
          for (var k = 0; k < aChildren.length; k++) {
            var sNodeChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[k]);
            var oPositionChild = this.nodePositions[sNodeChildId];
            if (elementById[sNodeChildId].lane > lane &&
                // the existing nodes and their children are either on the upper or lower side of the new node
                !((oPositionElem.x < row && oPositionChild.x < row) || ((oPositionElem.x > row && oPositionChild.x > row)))) {
              return false;
            }
          }
        }
      }
    }
  }

  // case 4: when the node has children: on the lane before the new position, there are no overlapping connections between nodes and children
  if (oNode._hasChildren()) {
    for (var i = 0; i < row; i++) {
      if (matrix[i][lane]) {
        var aChildren = matrix[i][lane].oNode.getChildren();
        if (aChildren) {
          for (var j = 0; j < aChildren.length; j++) {
            var sNodeId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]);
            var oElem = elementById[sNodeId];
            var oPosition = this.nodePositions[sNodeId];
            if (oElem.lane > lane && oPosition.x >= row && !oNode._hasChildrenWithNodeId(sNodeId)) {
              return false;
            }
          }
        }
      }
    }
  }

  return true;
};

/**
 * Function checks consistency of the node array. It checks,
 * if all children defined for the nodes are also presented as the nodes themselves.
 *
 * @public
 * @param elementForId Map of node id's to NodeElements. Expectation is to have at least 1 element there. No check for empty array.
 * @throws array of error messages produced during the consistency check
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.checkInputNodeConsistency = function (elementForId) {
  var returnArr = [],
      j,
      sChildId,
      nChildCount,
      aChildren,
      oElement;

  //Preparation phase
  Object.keys(elementForId).forEach(function (sElementId) {
    oElement = elementForId[sElementId];
    aChildren = oElement.oNode.getChildren();
    nChildCount = aChildren ? aChildren.length : 0;

    j = 0;
    while (j < nChildCount) {
      sChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]);
      if (!elementForId[sChildId]) {
        returnArr.push("Node identificator " + sChildId + " used in children definition is not presented as the node itself. Element : " + oElement.nodeId);
      }
      j++;
    }
  });

  if (returnArr.length > 0) {
    throw returnArr;
  }
};

/**
 * Function resets the positions into initial one to keep new calculation
 * without side effects.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._resetPositions = function () {
  this.iPositionX = 0;
  this.iPositionY = 0;

  delete this.nodePositions;
  delete this.mapChildToNode;

  this.nodePositions = {};
  this.mapChildToNode = {};
};

/**
 * Function creates matrix based on the length.
 *
 * @private
 * @param {String} length number of columns
 * @returns {Array} Array with two dimensions
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._createMatrix = function (length) {
  length = parseInt(length, 10);
  var aCalculatedMatrix = new Array(length || 0);
  var i = length;

  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    while (i--) {
      aCalculatedMatrix[length - 1 - i] = this._createMatrix.apply(this, args);
    }
  }
  return aCalculatedMatrix;
};

/**
 * Function retrieves the important information from input array.
 *
 * @private
 * @param elementById map of element id's to elements
 * @returns {Object} Element containing highestLanePosition(number) and rootElements (Element[])
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._retrieveInfoFromInputArray = function (elementById) {

  var iLanePositionHighest = 0,
      aRootElements = [],
      oElement;

  Object.keys(elementById).forEach(function (sElementId) {
    oElement = elementById[sElementId];

    if (!oElement.oParent && !oElement.aParent) {
      aRootElements.push(oElement);
    }

    if (iLanePositionHighest < oElement.lane) {
      iLanePositionHighest = oElement.lane;
    }
  });

  return {
    'highestLanePosition': iLanePositionHighest,
    'rootElements': aRootElements
  };
};

/**
 * Function doubles the matrix for drawing purposes and it only doubles the columns and add undefined values there.
 *
 * @private
 * @returns {Array} Array with doubled colummns
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._doubleColumnsInMatrix = function (currentMatrix) {
  var iMatrixY = 0;

  for (var i = 0; i < currentMatrix.length; i++) {
    iMatrixY = iMatrixY > currentMatrix[i].length ? iMatrixY : currentMatrix[i].length;
  }

  var mTempMatrix = new Array(currentMatrix.length || 0);

  for (var i = 0; i < mTempMatrix.length; i++) {
    mTempMatrix[i] = new Array(iMatrixY * 2 - 1);
    for (var j = 0; j < iMatrixY; j++) {
      if (currentMatrix[i][j]) {
        mTempMatrix[i][2 * j] = currentMatrix[i][j];
      }
    }
  }
  return mTempMatrix;
};

/**
 * Function removes empty lines from the matrix.
 *
 * @private
 * @returns {Array} Array where empty lines have been removed
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._removeEmptyLines = function (originalMatrix) {
  //First check the number of valid lines.
  var iLinesNumber = 0;
  for (var i = 0; i < originalMatrix.length; i++) {
    for (var j = 0; j < originalMatrix[i].length; j++) {
      if (originalMatrix[i][j]) {
        iLinesNumber++;
        break;
      }
    }
  }

  var mReturnMatrix = this._createMatrix(iLinesNumber, originalMatrix[0].length);

  for (var i = 0; i < iLinesNumber; i++) {
    for (var j = 0; j < originalMatrix[i].length; j++) {
      mReturnMatrix[i][j] = null; // everything is at least null
      if (originalMatrix[i][j]) {
        mReturnMatrix[i][j] = originalMatrix[i][j];
      }
    }
  }
  return mReturnMatrix;
};

/**
 * Sort based on the child proximity. If 2 children has some common children they get next to each other.
 *
 * @private
 * @param nodeChildIds child ids of the currently processed node
 * @param elementById  contains a map of the node id's to node elements
 * @returns {Array} Array containing sorted child elements (first sort by lanes, than the elements having the same children gets next to each other)
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._sortBasedOnChildren = function (nodeChildIds, elementById) {
  var aElementsByLane = {},
      aElements,
      sLaneId = null,
      aLaneIds,
      iChildrenElement1Count,
      iChildrenElement2Count,
      aSortedContent = [],
      aSingleLaneContent,
      aSingleContent,
      oProcessedChildElement;

  if (nodeChildIds) {
    nodeChildIds.forEach(function (oChildId) {
      var sChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(oChildId);
      aElements = aElementsByLane[elementById[sChildId].lane];
      if (!aElements) {
        aElementsByLane[elementById[sChildId].lane] = aElements = [];
      }
      aElements.push(elementById[sChildId]);
    });
  } else {
    return [];
  }

  aLaneIds = [];
  for (sLaneId in aElementsByLane) {
    aLaneIds.push(sLaneId);
    //Sort the Nodes (related to currend lane) descending by amount of children.
    aElementsByLane[sLaneId].sort(function (element1, element2) {
      //Lane needs not to be checked.
      //If it is the same one, check for the same children.
      //In this case return 0
      iChildrenElement1Count = (element1.oNode.getChildren() || []).length;
      iChildrenElement2Count = (element2.oNode.getChildren() || []).length;
      return iChildrenElement2Count - iChildrenElement1Count;
    });
  }

  //Sort the Lanes descending by sLaneId.
  aLaneIds = aLaneIds.sort(function (element1, element2) {
    return element2 - element1;
  });

  //Now we have in aLaneIds the lane orderd (descending by sLaneId)
  //Based on that we take from map the elements for the lanes.
  //Now order based on the children.
  aLaneIds.forEach(function (laneId) {
    aSingleLaneContent = aElementsByLane[laneId];

    if (aSingleLaneContent.length > 1) {
      aSingleContent = [];
      //We iterate through all the children and
      //put all the nodes having at least 1 common child next to each other.
      oProcessedChildElement = aSingleLaneContent.shift();
      while (oProcessedChildElement) {
        if (aSingleContent.indexOf(oProcessedChildElement) < 0) {
          aSingleContent.push(oProcessedChildElement);
        }

        aSingleLaneContent.forEach(function (oSiblingElement) {
          if (oProcessedChildElement.containsChildren(oSiblingElement)) {
            aSingleContent.push(oSiblingElement);
          }
        });
        oProcessedChildElement = aSingleLaneContent.shift();
      }
      aSortedContent = aSortedContent.concat(aSingleContent);
    } else {
      aSortedContent = aSortedContent.concat(aSingleLaneContent);
    }
  });
  return aSortedContent;
};

/**
 * Function calculates the connection and writes into the virtual matrix. It gets the matrix plus
 * parent children relationship.
 *
 * @private
 * @param OriginalMatrix the matrix with the setup of nodes
 * @returns {Object} The matrix updated with the calculated paths
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._calculatePathInMatrix = function (originalMatrix) {
  var oCurrentElement = null;
  for (var key in this.nodePositions) {
    if (this.nodePositions.hasOwnProperty(key)) {
      oCurrentElement = this.nodePositions[key];
      var aChildren = oCurrentElement.c.oNode.getChildren();
      for (var i = 0; aChildren && i < aChildren.length; i++) {
        var sChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[i]);
        var positionChildrenObject = this.nodePositions[sChildId];
        originalMatrix = this._calculateSingleNodeConnection(oCurrentElement,
                         positionChildrenObject, oCurrentElement.x, oCurrentElement.y,
                         positionChildrenObject.x, positionChildrenObject.y, originalMatrix);
      }
    }
  }
  return originalMatrix;
};

/**
 * Function based on the parent children position calculated the path from parent to children. The idea is like following
 * go from parent half right and use next connection column to go up or down. Afterwards on the line with children go
 * horizontal.
 *
 * @private
 * @param nodeParent
 * @param nodeChildren
 * @param parentX
 * @param parentY
 * @param childrenX
 * @param childrenY
 * @param originalMatrix
 * @returns {Object[]} The original Matrix
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._calculateSingleNodeConnection = function (
    nodeParent, nodeChildren, parentX, parentY, childrenX, childrenY, originalMatrix) {
  var iHorizontal = childrenY - parentY;
  var iVertical = childrenX - parentX;
  if (iHorizontal < 0) {
    var sErrorMessage = ["Problem with negative horizontal movement",
                  "Parent node is " + nodeParent.c.toString(),
                  "Children node is " + nodeChildren.c.toString(),
                  "Coordinates : '" + parentX + "','" + parentY + "','" + childrenX + "','" + childrenY + "'"];
    throw sErrorMessage;
  } else if (iVertical <= -1) {
    // Half left and up
    var bNormalHorizontalLinePossible = this._checkIfHorizontalLinePossible(originalMatrix, childrenX, parentY + 2, childrenY);
    var iPositionY = childrenY - 1;
    if (bNormalHorizontalLinePossible) {
      iPositionY = parentY + 1;
    }
    var iPositionX = parentX;
    if (bNormalHorizontalLinePossible) {
      iPositionX = childrenX;
    }
    originalMatrix[parentX][iPositionY] = this._createConnectionElement(
        originalMatrix[parentX][iPositionY], sap.suite.ui.commons.ProcessFlow._cellEdgeConstants.LU,
        nodeParent, nodeChildren, false);

    //Going up to the children.
    originalMatrix = this._writeVerticalLine(originalMatrix, parentX, childrenX, iPositionY, nodeParent, nodeChildren);

    originalMatrix[childrenX][iPositionY] =
      this._createConnectionElement(originalMatrix[childrenX][iPositionY],
      sap.suite.ui.commons.ProcessFlow._cellEdgeConstants.UR, nodeParent,
      nodeChildren, (iPositionY == childrenY - 1));
    //Pure right.
    var iStartY = parentY + 2;
    var iEndY = childrenY;
    if (!bNormalHorizontalLinePossible) {
      iStartY = parentY + 1;
      iEndY = iPositionY + 1;
    }
    originalMatrix = this._writeHorizontalLine(originalMatrix, iPositionX, iStartY, iEndY, nodeParent, nodeChildren);
  } else if (iVertical === 0) {
    originalMatrix = this._writeHorizontalLine(originalMatrix, parentX, parentY + 1, childrenY, nodeParent, nodeChildren);
  } else if (iVertical === 1) {
    //1 row down and do horizontal line.
    //Half and down.
    originalMatrix[parentX][parentY + 1] = this._createConnectionElement(originalMatrix[parentX][parentY + 1],
                                           sap.suite.ui.commons.ProcessFlow._cellEdgeConstants.LD, nodeParent,
                                           nodeChildren, false);
    //Down and right.
    originalMatrix[childrenX][parentY + 1] = this._createConnectionElement(originalMatrix[childrenX][parentY + 1],
                                             sap.suite.ui.commons.ProcessFlow._cellEdgeConstants.DR, nodeParent,
                                             nodeChildren, (parentY + 1) === (childrenY - 1));
    //Horizontal line to the target.
    originalMatrix = this._writeHorizontalLine(originalMatrix, childrenX, parentY + 2, childrenY, nodeParent, nodeChildren);
  } else { //iVertical > 1
    //Go down until children and do horizontal line.
    //Half left and down.
    originalMatrix[parentX][parentY + 1] = this._createConnectionElement(originalMatrix[parentX][parentY + 1],
                                           sap.suite.ui.commons.ProcessFlow._cellEdgeConstants.LD, nodeParent,
                                           nodeChildren, false);
    originalMatrix = this._writeVerticalLine(originalMatrix, childrenX, parentX, parentY + 1, nodeParent, nodeChildren);
    //Half down and right.
    originalMatrix[childrenX][parentY + 1] = this._createConnectionElement(originalMatrix[childrenX][parentY + 1],
                                             sap.suite.ui.commons.ProcessFlow._cellEdgeConstants.DR, nodeParent,
                                             nodeChildren, (parentY + 1) === (childrenY - 1));
    originalMatrix = this._writeHorizontalLine(originalMatrix, childrenX, parentY + 2, childrenY, nodeParent, nodeChildren);
  }
  return originalMatrix;
};

/**
 * Write vertical line from firstrow to lastrow on the column position.
 *
 * @private
 * @returns {Object[]} The original matrix containing vertical line connections
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._writeVerticalLine = function (originalMatrix, firstRow, lastRow, column, nodeParent, nodeChildren) {
  for (var j = firstRow - 1; j > lastRow; j--) {
    originalMatrix[j][column] = this._createConnectionElement(originalMatrix[j][column],
                                sap.suite.ui.commons.ProcessFlow._cellEdgeConstants.DU, nodeParent,
                                nodeChildren, false);
  }
  return originalMatrix;
};

/**
 * Checks if the horizontal line is possible.
 *
 * @private
 * @param originalMatrix
 * @param row
 * @param firstColumn
 * @param lastColumn
 * @returns {boolean} Function return true, if the path is free, otherwise false
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._checkIfHorizontalLinePossible = function (
    originalMatrix, row, firstColumn, lastColumn) {
  var bLinePossible = true;
  for (var i = firstColumn; i < lastColumn; i++) {
    if (originalMatrix[row][i] instanceof sap.suite.ui.commons.ProcessFlow.NodeElement) {
      bLinePossible = false;
      break;
    }
  }

  return bLinePossible;
};

/**
 * Function calculated and writes horizontal line.
 *
 * @private
 * @param originalMatrix matrix to write to
 * @param row the horizontal position
 * @param firstColumn where to start
 * @param lastColumn where to stop
 * @param nodeParent definition of initial node
 * @param nodeChildren definition of target node
 * @returns {Object[]} The original Matrix including the horizontal lines
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._writeHorizontalLine = function (
    originalMatrix, row, firstColumn, lastColumn, nodeParent, nodeChildren) {
  var bPotentialArrow = (row == nodeChildren.x);
  //No arrow, no last line ... somewhere else will be (up and right).
  if (!bPotentialArrow) {
    lastColumn--;
  }
  for (var i = firstColumn; i < lastColumn; i++) {
    originalMatrix[row][i] =
      this._createConnectionElement(originalMatrix[row][i], sap.suite.ui.commons.ProcessFlow._cellEdgeConstants.LR, nodeParent, nodeChildren, (i == (lastColumn - 1)) && bPotentialArrow);
  }
  return originalMatrix;
};

/**
 * Function adds new connection element to the cell in the matrix. It is an additive approach where during the
 * drawing phase all the connections in one cell will be joined together.
 *
 * @private
 * @param originalConnection
 * @param addStringValue
 * @param initialNode
 * @param targetNode
 * @param isArrowRequired
 * @returns {sap.suite.ui.commons.ProcessFlowConnection} The connection element
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._createConnectionElement = function (originalConnection, addStringValue, initialNode, targetNode, isArrowRequired) {

  var oNewConnection = originalConnection;
  if (!oNewConnection) {
    oNewConnection = new sap.suite.ui.commons.ProcessFlowConnection();
  }
  if (oNewConnection instanceof sap.suite.ui.commons.ProcessFlowConnection) {
    var displayState = this._calculateConnectionDisplayStateBySourceAndTargetNode(initialNode.c.oNode, targetNode.c.oNode);
    var oConnection = {
      flowLine: addStringValue,
      targetNodeState: targetNode.c.state,
      displayState: displayState,
      hasArrow: isArrowRequired
    };
    oNewConnection.addConnectionData(oConnection);
  }
  return oNewConnection;
};

/**
 * Calculates the correct display state for a connection based on the source and the target node.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowNode} sourceNode for calculation
 * @param {sap.suite.ui.commons.ProcessFlowNode} targetNode for calculation
 * @returns {sap.suite.ui.commons.ProcessFlowDisplayState} The resulting displayState
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._calculateConnectionDisplayStateBySourceAndTargetNode = function (sourceNode, targetNode) {
  var bSourceIsHighlighted = sourceNode.getHighlighted();
  var bSourceIsSelected = sourceNode.getSelected();
  var bSourceIsDimmed = sourceNode._getDimmed();
  var bTargetIsHighlighted = targetNode.getHighlighted();
  var bTargetIsSelected = targetNode.getSelected();
  var bTargetIsDimmed = targetNode._getDimmed();

  var oDisplayState = sap.suite.ui.commons.ProcessFlowDisplayState.Regular;
  if (bSourceIsSelected && bTargetIsSelected) {
    oDisplayState = sap.suite.ui.commons.ProcessFlowDisplayState.Selected;
  } else if (bSourceIsHighlighted && bTargetIsHighlighted) {
    oDisplayState = sap.suite.ui.commons.ProcessFlowDisplayState.Highlighted;
  } else if ((bSourceIsDimmed || bTargetIsDimmed) ||
              bSourceIsHighlighted && bTargetIsSelected ||
              bSourceIsSelected && bTargetIsHighlighted) {
    //If the node is not in state dimmed and no direct connection between select/highlighted nodes is available, set dimmed state.
    oDisplayState = sap.suite.ui.commons.ProcessFlowDisplayState.Dimmed;
  }

  return oDisplayState;
};

/**
 * Function sets a node inside the aggregation
 *
 * @private
  */
sap.suite.ui.commons.ProcessFlow.prototype.addNode = function (node) {
  return this.addAggregation("nodes", node, false);
};

/**
 * Switch cursors for scrollable/non-scrollable content.
 *
 * @private
 * @param {object} $scrollContainer the affected scroll container (jQuery object)
 * @param {String} cursorClassFrom class containing the original cursor definition
 * @param {String} cursorClassTo class containing the new cursor definition
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlow.prototype._switchCursors = function ($scrollContainer, cursorClassFrom, cursorClassTo) {
  if ($scrollContainer.hasClass(cursorClassFrom)) {
    $scrollContainer.removeClass(cursorClassFrom);
  }
  if (!$scrollContainer.hasClass(cursorClassTo)) {
    $scrollContainer.addClass(cursorClassTo);
  }
};

/**
 * Clear the mouse handlers for the scrolling functionality.
 *
 * @private
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlow.prototype._clearHandlers = function ($scrollContainer) {
  $scrollContainer.bind(this._mousePreventEvents, jQuery.proxy(this._handlePrevent, this));
};

/**
 * Initializes the zoom level for different devices.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._initZoomLevel = function () {
  //Set initial ZoomLevel according to ProcessFlow container size.
  //Breakpoints: until 599px = Level 4 / 600px-1023px = Level 3 / from 1024px = Level 2.
  if (this.$()) {
    var iWidth = this.$().width();
    if (iWidth) {
      if (iWidth < sap.m.ScreenSizes.tablet) {
        this.setZoomLevel(sap.suite.ui.commons.ProcessFlowZoomLevel.Four);
      } else if (iWidth < sap.m.ScreenSizes.desktop) {
        this.setZoomLevel(sap.suite.ui.commons.ProcessFlowZoomLevel.Three);
      } else {
        this.setZoomLevel(sap.suite.ui.commons.ProcessFlowZoomLevel.Two);
      }
    }
  }
};

/**
 * Register mouse wheel event
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._registerMouseWheel = function (oEvent) {
  var oDirection = oEvent.originalEvent.wheelDelta || -oEvent.originalEvent.detail;
  if (oDirection === 0) {
    //for IE only
    oDirection = -oEvent.originalEvent.deltaY;
  }
  var that = this;
  if (oEvent && !oEvent.isDefaultPrevented()) {
    oEvent.preventDefault();
    oEvent.originalEvent.returnValue = false;
  }

  var iWaitTime = 300;
  var fnDoNotListen = function () {
    var iDiffTime = new Date() - that._wheelTimestamp;
    if (iDiffTime < iWaitTime) {
      that._wheelTimeout = jQuery.sap.delayedCall(iWaitTime - iDiffTime, that, fnDoNotListen);
    } else {
      that._wheelTimeout = null;
      that._wheelCalled = false;
    }
  };
  if (!that._wheelCalled) {
    that._wheelCalled = true;

    if (oDirection < 0) {
      this._isFocusChanged = true;
      that.zoomOut();
    } else {
      this._isFocusChanged = true;
      that.zoomIn();
    }
  }
  if (!that._wheelTimeout) {
    that._wheelTimestamp = new Date();
    that._wheelTimeout = jQuery.sap.delayedCall(iWaitTime, that, fnDoNotListen);
  }
  if (oEvent && !oEvent.isPropagationStopped()) {
    oEvent.stopPropagation();
  }
  if (oEvent && !oEvent.isImmediatePropagationStopped()) {
    oEvent.stopImmediatePropagation();
  }
};

/** Sets the tab focus on the given element or to _lastNavigationFocusElement if no parameter is given. If no parameter
 * is given and _lastNavigationFocusElement is false, nothing happens.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowNode} the node to focus.
*/
sap.suite.ui.commons.ProcessFlow.prototype._setFocusToNode = function (node) {
  //If there's a node as parameter.
  if (node) {
    if (node instanceof sap.suite.ui.commons.ProcessFlowNode) {
      jQuery("#" + node.sId).parent().focus();
      node._setNavigationFocus(true);
      node.rerender();
    } else if (node instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
      node.$().focus();
      node._setNavigationFocus(true);
    }
    // If there's no parameter, set the focus to _lastNavigationFocusElement if is not false
  } else if (this._lastNavigationFocusElement) {
    if (this._lastNavigationFocusElement instanceof sap.suite.ui.commons.ProcessFlowNode) {
      jQuery("#" + this._lastNavigationFocusElement.sId).parent().focus();
      this._lastNavigationFocusElement._setNavigationFocus(true);
      this._lastNavigationFocusElement.rerender();
    } else if (this._lastNavigationFocusElement instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
      this._lastNavigationFocusElement.$().focus();
      this._lastNavigationFocusElement._setNavigationFocus(true);
    }
  }
};

/**
 * Changes the navigation focus from the actual node to the node specified as parameter.
 * Calls rerender on both nodes.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowNode} nodeFrom the old focused node
 * @param {sap.suite.ui.commons.ProcessFlowNode} nodeTo the new node to focus to
 * @since 1.23
 */
sap.suite.ui.commons.ProcessFlow.prototype._changeNavigationFocus = function (nodeFrom, nodeTo) {
  if (nodeFrom && nodeTo && (nodeFrom.getId() !== nodeTo.getId())) {
    jQuery.sap.log.debug("Rerendering PREVIOUS node with id '" + nodeFrom.getId() +
                         "' navigation focus : " + nodeFrom._getNavigationFocus());
    nodeFrom._setNavigationFocus(false);
    if (nodeFrom instanceof sap.suite.ui.commons.ProcessFlowNode) {
      nodeFrom.rerender();
    }
  }

  if (nodeTo) {
    jQuery.sap.log.debug("Rerendering CURRENT node with id '" + nodeTo.getId() +
        "' navigation focus : " + nodeTo._getNavigationFocus());
    nodeTo._setNavigationFocus(true);
    if (nodeTo instanceof sap.suite.ui.commons.ProcessFlowNode) {
      nodeTo.rerender();
    }
    this._lastNavigationFocusElement = nodeTo;
    this._onFocusChanged();
  }
};

/**
 * Function reacts on page up and page down. It should go 5 lines up or down
 * or little bit less if there is not enough space.
 * With alt page up move focus left by 5 items maximum.
 * With alt page down move focus right by 5 items maximum.
 *
 * @private
 * @param direction please see sap.suite.ui.commons.ProcessFlow._enumMoveDirection
 * @param altKey, true if alt key is pressed, false otherwise
 * @returns {Boolean} Value describes if a new node was found
 */
sap.suite.ui.commons.ProcessFlow.prototype._moveOnePage = function (direction, altKey) {
  direction = direction || sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP;
  altKey = altKey || false;
  //Search for navigated element.
  var iPositionOriginalX = 0, iPositionOriginalY = 0;
  var iPositionNewX = 0, iPositionNewY = 0;
  var iNodesOverCount = 0;
  var bNewElementFound = false;
  for (var i = 0; i < this._internalCalcMatrix.length; i++) {
    for (var j = 0; j < this._internalCalcMatrix[i].length; j++) {
      if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowNode && this._internalCalcMatrix[i][j]._getNavigationFocus()) {
        iPositionOriginalX = i;
        iPositionOriginalY = j;
        break;
      } else if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
        var oLabel = this._internalCalcMatrix[i][j]._getVisibleLabel();
        if (oLabel && oLabel._getNavigationFocus()) {
          iPositionOriginalX = i;
          iPositionOriginalY = j;
          break;
        }
      }
    }
  }

  //Going 5 elements on the same row.
  if (altKey) {
    if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP) {
      for (var j = iPositionOriginalY - 1; j >= 0 && iNodesOverCount < this._jumpOverElements; j--) {
        if (this._internalCalcMatrix[iPositionOriginalX][j] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[iPositionOriginalX][j].getHighlighted())) {
          iNodesOverCount++;
          iPositionNewX = iPositionOriginalX;
          iPositionNewY = j;
          bNewElementFound = true;
        } else if (this._internalCalcMatrix[iPositionOriginalX][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[iPositionOriginalX][j]._getVisibleLabel();
          if (oLabel && oLabel.getEnabled()) {
            iNodesOverCount++;
            iPositionNewX = iPositionOriginalX;
            iPositionNewY = j;
            bNewElementFound = true;
          }
        }
      }
    } else if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.DOWN) {
      for (var j = iPositionOriginalY + 1; j < this._internalCalcMatrix[iPositionOriginalX].length && iNodesOverCount < this._jumpOverElements; j++) {
        if (this._internalCalcMatrix[iPositionOriginalX][j] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[iPositionOriginalX][j].getHighlighted())) {
          iNodesOverCount++;
          iPositionNewX = iPositionOriginalX;
          iPositionNewY = j;
          bNewElementFound = true;
        } else if (this._internalCalcMatrix[iPositionOriginalX][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[iPositionOriginalX][j]._getVisibleLabel();
          if (oLabel && oLabel.getEnabled()) {
            iNodesOverCount++;
            iPositionNewX = iPositionOriginalX;
            iPositionNewY = j;
            bNewElementFound = true;
          }
        }
      }
    }
  } else {
    if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP) {
      for (var i = iPositionOriginalX - 1; i >= 0 && iNodesOverCount < this._jumpOverElements; i--) {
        if (this._internalCalcMatrix[i][iPositionOriginalY] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[i][iPositionOriginalY].getHighlighted())) {
          iNodesOverCount++;
          iPositionNewX = i;
          iPositionNewY = iPositionOriginalY;
          bNewElementFound = true;
        } else if (this._internalCalcMatrix[i][iPositionOriginalY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[i][iPositionOriginalY]._getVisibleLabel();
          if (oLabel && oLabel.getEnabled()) {
            iNodesOverCount++;
            iPositionNewX = i;
            iPositionNewY = iPositionOriginalY;
            bNewElementFound = true;
          }
        }
      }
    } else if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.DOWN) {
      for (var i = iPositionOriginalX + 1; i < this._internalCalcMatrix.length && iNodesOverCount < this._jumpOverElements; i++) {
        if (this._internalCalcMatrix[i][iPositionOriginalY] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[i][iPositionOriginalY].getHighlighted())) {
          iNodesOverCount++;
          iPositionNewX = i;
          iPositionNewY = iPositionOriginalY;
          bNewElementFound = true;
        } else if (this._internalCalcMatrix[i][iPositionOriginalY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[i][iPositionOriginalY]._getVisibleLabel();
          if (oLabel && oLabel.getEnabled()) {
            iNodesOverCount++;
            iPositionNewX = i;
            iPositionNewY = iPositionOriginalY;
            bNewElementFound = true;
          }
        }
      }
    }
  }

  if (bNewElementFound) {
    if (this._internalCalcMatrix[iPositionOriginalX][iPositionOriginalY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
      this._internalCalcMatrix[iPositionOriginalX][iPositionOriginalY]._getVisibleLabel()._setNavigationFocus(false);
    } else {
      this._internalCalcMatrix[iPositionOriginalX][iPositionOriginalY]._setNavigationFocus(false);
    }
    if (this._internalCalcMatrix[iPositionNewX][iPositionNewY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
      var oLabel = this._internalCalcMatrix[iPositionNewX][iPositionNewY]._getVisibleLabel();
      oLabel._setNavigationFocus(true);
      this._lastNavigationFocusElement = oLabel;
    } else {
      this._internalCalcMatrix[iPositionNewX][iPositionNewY]._setNavigationFocus(true);
      this._lastNavigationFocusElement = this._internalCalcMatrix[iPositionNewX][iPositionNewY];
    }
  }
  return bNewElementFound;
};

/**
 * Function reacts on home/end. it should go to the first/last element on given row.
 * With ctrl it goes to the first/last active element on the process flow
 * or little bit less if there is not enough space.
 *
 * @private
 * @param direction please see sap.suite.ui.commons.ProcessFlow._enumMoveDirection LEFT -> HOME, RIGHT -> END
 * @param ctrlKey, true if ctrl key is pressed
 * @returns {Boolean} Value describes if a new node was found
 */
sap.suite.ui.commons.ProcessFlow.prototype._moveHomeEnd = function (direction, ctrlKey) {
  direction = direction || sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT;
  ctrlKey = ctrlKey || false;
  //Search for navigated element.
  var iPositionOriginalX = 0, iPositionOriginalY = 0;
  var iPositionNewX = 0, iPositionNewY = 0;
  var bNewElementFound = false;
  for (var i = 0; i < this._internalCalcMatrix.length; i++) {
    for (var j = 0; j < this._internalCalcMatrix[i].length; j++) {
      if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowNode && this._internalCalcMatrix[i][j]._getNavigationFocus()) {
        iPositionOriginalX = i;
        iPositionOriginalY = j;
        break;
      } else if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
        var oLabel = this._internalCalcMatrix[i][j]._getVisibleLabel();
        if (oLabel && oLabel._getNavigationFocus()) {
          iPositionOriginalX = i;
          iPositionOriginalY = j;
          break;
        }
      }
    }
  }

  //Going to the first / last element on the given column.
  if (ctrlKey) {
    if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT) {
      for (var i = 0; i < iPositionOriginalX ; i++) {
        if (this._internalCalcMatrix[i][iPositionOriginalY] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[i][iPositionOriginalY].getHighlighted())) {
          iPositionNewX = i;
          iPositionNewY = iPositionOriginalY;
          bNewElementFound = true;
          break;
        } else if (this._internalCalcMatrix[i][iPositionOriginalY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[i][iPositionOriginalY]._getVisibleLabel();
          if (oLabel && oLabel.getEnabled()) {
            iPositionNewX = i;
            iPositionNewY = iPositionOriginalY;
            bNewElementFound = true;
            break;
          }
        }
      }
    } else if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT) {
      for (var i = this._internalCalcMatrix.length - 1; i > iPositionOriginalX; i--) {
        if (this._internalCalcMatrix[i][iPositionOriginalY] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[i][iPositionOriginalY].getHighlighted())) {
          iPositionNewX = i;
          iPositionNewY = iPositionOriginalY;
          bNewElementFound = true;
          break;
        } else if (this._internalCalcMatrix[i][iPositionOriginalY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[i][iPositionOriginalY]._getVisibleLabel();
          if (oLabel && oLabel.getEnabled()) {
            iPositionNewX = i;
            iPositionNewY = iPositionOriginalY;
            bNewElementFound = true;
            break;
          }
        }
      }
    }
  } else { //Going to the first/last element of the row.
    if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT) {
      for (var j = 0; j < iPositionOriginalY; j++) {
        if (this._internalCalcMatrix[iPositionOriginalX][j] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[iPositionOriginalX][j].getHighlighted())) {
          iPositionNewX = iPositionOriginalX;
          iPositionNewY = j;
          bNewElementFound = true;
          break;
        } else if (this._internalCalcMatrix[iPositionOriginalX][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[iPositionOriginalX][j]._getVisibleLabel();
          if (oLabel && oLabel.getEnabled()) {
            iPositionNewX = iPositionOriginalX;
            iPositionNewY = j;
            bNewElementFound = true;
            break;
          }
        }
      }
    } else if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT) {
      for (var j = this._internalCalcMatrix[iPositionOriginalX].length - 1; j > iPositionOriginalY; j--) {
        if (this._internalCalcMatrix[iPositionOriginalX][j] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[iPositionOriginalX][j].getHighlighted())) {
          iPositionNewX = iPositionOriginalX;
          iPositionNewY = j;
          bNewElementFound = true;
          break;
        } else if (this._internalCalcMatrix[iPositionOriginalX][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[iPositionOriginalX][j]._getVisibleLabel();
          if (oLabel && oLabel.getEnabled()) {
            iPositionNewX = iPositionOriginalX;
            iPositionNewY = j;
            bNewElementFound = true;
            break;
          }
        }
      }
    }
  }

  if (bNewElementFound) {
    if (this._internalCalcMatrix[iPositionOriginalX][iPositionOriginalY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
      this._internalCalcMatrix[iPositionOriginalX][iPositionOriginalY]._getVisibleLabel()._setNavigationFocus(false);
    } else {
      this._internalCalcMatrix[iPositionOriginalX][iPositionOriginalY]._setNavigationFocus(false);
    }
    if (this._internalCalcMatrix[iPositionNewX][iPositionNewY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
      var oLabel = this._internalCalcMatrix[iPositionNewX][iPositionNewY]._getVisibleLabel();
      oLabel._setNavigationFocus(true);
      this._lastNavigationFocusElement = oLabel;
    } else {
      this._internalCalcMatrix[iPositionNewX][iPositionNewY]._setNavigationFocus(true);
      this._lastNavigationFocusElement = this._internalCalcMatrix[iPositionNewX][iPositionNewY];
    }
  }
  return bNewElementFound;
};

/**
 * Function moves the focus to the next node based on tab behaviour.
 * First going left, after to the next row.
 *
 * @private
 * @param direction please see enumeration Direction ( sap.suite.ui.commons.ProcessFlow._enumMoveDirection )
 * @returns {Boolean} true if the next element is possible to set. False if there is not more elements to set.
 */
sap.suite.ui.commons.ProcessFlow.prototype._moveToNextElement = function (direction, step) {
  //First find the current focus element.
  direction = direction || sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT;

  if (sap.ui.getCore().getConfiguration().getRTL()) {
    if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT) {
      direction = sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT;
    } else if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT) {
      direction = sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT;
    }
  }

  step = step || 1;

  var bFocusElementFound = false;
  var bNewElementSet = false;
  var iPositionOriginalX = 0, iPositionOriginalY = 1;
  if (!this._internalCalcMatrix) {
    return;
  }
  //First search for node which is focused.
  var iPositionX = 0, iPositionY = 0;
  for (var i = 0; i < this._internalCalcMatrix.length; i++) {
    for (var j = 0; j < this._internalCalcMatrix[i].length; j++) {
      if (this._internalCalcMatrix[i][j]) {
        if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowNode && this._internalCalcMatrix[i][j]._getNavigationFocus()) {
          iPositionOriginalX = iPositionX = i;
          iPositionOriginalY = iPositionY = j;
          bFocusElementFound = true;
          break;
        } else if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[i][j]._getVisibleLabel();
          if (oLabel && oLabel._getNavigationFocus() && oLabel.getEnabled()) {
            iPositionOriginalX = iPositionX = i;
            iPositionOriginalY = iPositionY = j;
            bFocusElementFound = true;
            break;
          }
        }
      }
    }
    if (bFocusElementFound) {
      break;
    }
  }

  if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT) {
    for (var i = iPositionX; i < this._internalCalcMatrix.length; i++) {
      for (var j = iPositionY + 1; j < this._internalCalcMatrix[i].length; j++) {
        if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusElementFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][j].getHighlighted())) {
            this._internalCalcMatrix[i][j]._setNavigationFocus(true);
            this._lastNavigationFocusElement = this._internalCalcMatrix[i][j];
            bNewElementSet = true;
            break;
          }
        } else if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[i][j]._getVisibleLabel();
          if (oLabel && bFocusElementFound && oLabel.getEnabled()) {
            oLabel._setNavigationFocus(true);
            this._lastNavigationFocusElement = oLabel;
            bNewElementSet = true;
            break;
          }
        }
      }
      //Shortcut, we have done already everything.
      iPositionY = 0; //First iPositionX line was from iPositionY, now from zero again. The plus one does not hurt, because first column is empty.
      if (bNewElementSet) {
        break;
      }
    }
  }

  if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT) {
    for (var i = iPositionX; i >= 0 ; i--) {
      for (var j = iPositionY - 1; j >= 0; j--) {
        if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusElementFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][j].getHighlighted())) {
            this._lastNavigationFocusElement = this._internalCalcMatrix[i][j]._setNavigationFocus(true);
            this._lastNavigationFocusElement = this._internalCalcMatrix[i][j];
            bNewElementSet = true;
            break;
          }
        } else if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[i][j]._getVisibleLabel();
          if (oLabel && bFocusElementFound && oLabel.getEnabled()) {
            oLabel._setNavigationFocus(true);
            this._lastNavigationFocusElement = oLabel;
            bNewElementSet = true;
            break;
          }
        }
      }
      if (i > 0) {
        iPositionY = this._internalCalcMatrix[i - 1].length;
      }
      //Shortcut, we have done already everything.
      if (bNewElementSet) {
        break;
      }
    }
  }

  var iDeviation,
      iPositionLeftY,
      iPositionRightY;
  if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP) {
    for (var i = iPositionX - 1; i >= 0 ; i--) {
      //We have single line, check from iPositionY first left, after right.
      iDeviation = 0;
      while (!bNewElementSet) {
        iPositionLeftY = iPositionY - iDeviation;
        iPositionRightY = iPositionY + iDeviation;
        if (iPositionLeftY >= 0 && this._internalCalcMatrix[i][iPositionLeftY] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusElementFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][iPositionLeftY].getHighlighted())) {
            this._internalCalcMatrix[i][iPositionLeftY]._setNavigationFocus(true);
            this._lastNavigationFocusElement = this._internalCalcMatrix[i][iPositionLeftY];
            bNewElementSet = true;
            break;
          }
        } else if (iPositionLeftY >= 0 && this._internalCalcMatrix[i][iPositionLeftY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[i][iPositionLeftY]._getVisibleLabel();
          if (oLabel && bFocusElementFound && oLabel.getEnabled()) {
            oLabel._setNavigationFocus(true);
            this._lastNavigationFocusElement = oLabel;
            bNewElementSet = true;
            break;
          }
        }//End of processflownode for left.
        if (iPositionRightY < this._internalCalcMatrix[i].length && this._internalCalcMatrix[i][iPositionRightY] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusElementFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][iPositionRightY].getHighlighted())) {
            this._internalCalcMatrix[i][iPositionRightY]._setNavigationFocus(true);
            this._lastNavigationFocusElement = this._internalCalcMatrix[i][iPositionRightY];
            bNewElementSet = true;
            break;
          }
        } else if (iPositionRightY >= 0 && this._internalCalcMatrix[i][iPositionRightY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[i][iPositionRightY]._getVisibleLabel();
          if (oLabel && bFocusElementFound && oLabel.getEnabled()) {
            oLabel._setNavigationFocus(true);
            this._lastNavigationFocusElement = oLabel;
            bNewElementSet = true;
            break;
          }
        } //End of processflownode for right.
        //We are out of this line for Y position.
        if (iPositionLeftY < 0 && iPositionRightY > this._internalCalcMatrix[i].length) {
          break;
        }
        iDeviation++;
      }
    }
  }

  if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.DOWN) {
    for (var i = iPositionX + 1; i < this._internalCalcMatrix.length ; i++) {
      //We have single line, check from iPositionY first left, after right.
      iDeviation = 0;
      while (!bNewElementSet) {
        iPositionLeftY = iPositionY - iDeviation;
        iPositionRightY = iPositionY + iDeviation;
        if (iPositionLeftY >= 0 && this._internalCalcMatrix[i][iPositionLeftY] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusElementFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][iPositionLeftY].getHighlighted())) {
            this._lastNavigationFocusElement = this._internalCalcMatrix[i][iPositionLeftY]._setNavigationFocus(true);
            this._lastNavigationFocusElement = this._internalCalcMatrix[i][iPositionLeftY];
            bNewElementSet = true;
            break;
          }
        } else if (iPositionLeftY >= 0 && this._internalCalcMatrix[i][iPositionLeftY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[i][iPositionLeftY]._getVisibleLabel();
          if (oLabel && bFocusElementFound && oLabel.getEnabled()) {
            oLabel._setNavigationFocus(true);
            this._lastNavigationFocusElement = oLabel;
            bNewElementSet = true;
            break;
          }
        }//End of processflownode for left.
        if (iPositionRightY < this._internalCalcMatrix[i].length && this._internalCalcMatrix[i][iPositionRightY] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusElementFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][iPositionRightY].getHighlighted())) {
            this._lastNavigationFocusElement = this._internalCalcMatrix[i][iPositionRightY]._setNavigationFocus(true);
            this._lastNavigationFocusElement = this._internalCalcMatrix[i][iPositionRightY];
            bNewElementSet = true;
            break;
          }
        } else if (iPositionRightY >= 0 && this._internalCalcMatrix[i][iPositionRightY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var oLabel = this._internalCalcMatrix[i][iPositionRightY]._getVisibleLabel();
          if (oLabel && bFocusElementFound && oLabel.getEnabled()) {
            oLabel._setNavigationFocus(true);
            this._lastNavigationFocusElement = oLabel;
            bNewElementSet = true;
            break;
          }
        }//End of processflownode for right.
        //We are out of this line for Y position.
        if (iPositionLeftY < 0 && iPositionRightY > this._internalCalcMatrix[i].length) {
          break;
        }
        iDeviation++;
      }
    }
  }

  if (bNewElementSet) {
    if (this._internalCalcMatrix[iPositionOriginalX][iPositionOriginalY] instanceof sap.suite.ui.commons.ProcessFlowNode) {
      this._internalCalcMatrix[iPositionOriginalX][iPositionOriginalY]._setNavigationFocus(false);
    } else {
      this._internalCalcMatrix[iPositionOriginalX][iPositionOriginalY]._getVisibleLabel()._setNavigationFocus(false);
    }
  }
  return bNewElementSet;
};

/**
 * Method called on zoom change.
 * Scrolls the PF content after a zoom change so, that the focused content of the scroll container stays in focus (if possible).
 *
 * @private
 * @returns {Object} The scroll container context
 * @since 1.26
 */
sap.suite.ui.commons.ProcessFlow.prototype._getScrollContainerOnZoomChanged = function (scrollContainerContext, $scrollContainer) {
  scrollContainerContext.scrollLeft = Math.round($scrollContainer.context.scrollWidth / scrollContainerContext.scrollWidth * scrollContainerContext.scrollLeft);
  scrollContainerContext.scrollTop = Math.round($scrollContainer.context.scrollHeight / scrollContainerContext.scrollHeight * scrollContainerContext.scrollTop);
  scrollContainerContext.scrollWidth = $scrollContainer.context.scrollWidth;
  scrollContainerContext.scrollHeight = $scrollContainer.context.scrollHeight;

  return scrollContainerContext;
};

/**
 * Merge values of node states for several nodes.
 *
 * @private
 * @param {array} laneIdNodeStates node states for all nodes of the same laneId
 * @param altKey, true if alt key is pressed, false otherwise
 * @returns {Array} aResult Array of cumulated node states for aLaneIdNodeStates
 */
sap.suite.ui.commons.ProcessFlow.prototype._mergeLaneIdNodeStates = function (laneIdNodeStates) {
  var iPositive = 0;
  var iNegative = 0;
  var iNeutral = 0;
  var iPlanned = 0;
  var iCritical = 0;

  for (var iState = 0; iState < 5; iState++) {
    for (var iNode = 0; iNode < laneIdNodeStates.length; iNode++) {
      switch (laneIdNodeStates[iNode][iState].state) {
        case sap.suite.ui.commons.ProcessFlowNodeState.Positive:
          iPositive = iPositive + laneIdNodeStates[iNode][iState].value;
          break;
        case sap.suite.ui.commons.ProcessFlowNodeState.Negative:
          iNegative = iNegative + laneIdNodeStates[iNode][iState].value;
          break;
        case sap.suite.ui.commons.ProcessFlowNodeState.Neutral:
          iNeutral = iNeutral + laneIdNodeStates[iNode][iState].value;
          break;
        case sap.suite.ui.commons.ProcessFlowNodeState.Planned:
          iPlanned = iPlanned + laneIdNodeStates[iNode][iState].value;
          break;
          //plannedNegative belong to Negative group
        case sap.suite.ui.commons.ProcessFlowNodeState.PlannedNegative:
          iNegative = iNegative + laneIdNodeStates[iNode][iState].value;
          break;
        case sap.suite.ui.commons.ProcessFlowNodeState.Critical:
          iCritical = iCritical + laneIdNodeStates[iNode][iState].value;
          break;
      }
    }
  }

  var aResult = [{ state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, value: iPositive },
                 { state: sap.suite.ui.commons.ProcessFlowNodeState.Negative, value: iNegative },
                 { state: sap.suite.ui.commons.ProcessFlowNodeState.Neutral, value: iNeutral },
                 { state: sap.suite.ui.commons.ProcessFlowNodeState.Planned, value: iPlanned },
                 { state: sap.suite.ui.commons.ProcessFlowNodeState.Critical, value: iCritical }];

  return aResult;
};

/**
 * Sets or removes navigation focus on the Lane header ( for keyboard support ).
 *
 * @private
 * @param {boolean} if true the navigation focus is set, if false the navigation focus is removed
 * @since 1.26
 */
sap.suite.ui.commons.ProcessFlow.prototype._setFocusOnHeader = function (navigationFocusFlag) {
  var thead = jQuery.sap.byId(this.getId() + "-thead");
  if (navigationFocusFlag) {
    thead.focus();
    thead.addClass("sapSuiteUiCommonsPFHeaderFocused");
    this._headerHasFocus = true;
  }
  else {
    thead.removeClass("sapSuiteUiCommonsPFHeaderFocused");
    this._headerHasFocus = false;
  }
};

/**
 * Scrolls the header if possible, using an animation.
 *
 * @private
 * @param delta how far to scroll
 * @param iDuration how long to scroll (ms)
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._scroll = function (delta, duration) {
  var oDomRef = this._getScrollContainer().get(0);
  var iScrollLeft = oDomRef.scrollLeft;
  if (!!!sap.ui.Device.browser.internet_explorer && this._bRtl) {
    delta = -delta;
  } //RTL lives in the negative space.
  var iScrollTarget = iScrollLeft + delta;
  jQuery(oDomRef).stop(true, true).animate({ scrollLeft: iScrollTarget }, duration, jQuery.proxy(this._adjustAndShowArrow, this));
};

/**
 * Adjusts the arrow position and shows the arrow.
 *
 * @private
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._adjustAndShowArrow = function () {
  this._checkOverflow(this._getScrollContainer().get(0), this.$());
  if (this.getScrollable()) {
    this._moveArrowAndCounterVertical();
  }
  if (this._isFocusChanged) {
    this._setFocusToNode(this._lastNavigationFocusElement);
    this._isFocusChanged = false;
  }
};

/**
 * Gets the icon of the requested arrow (left/right).
 *
 * @private
 * @param direction left or right
 * @returns icon of the requested arrow
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._getScrollingArrow = function (direction) {
  var sSrc;

  if (sap.ui.Device.system.desktop) {
    //Use navigation arrows on desktop and win8 combi devices.
    sSrc = "sap-icon://navigation-" + direction + "-arrow";
  } else {
    //Use slim arrows on mobile devices.
    sSrc = "sap-icon://slim-arrow-" + direction;
  }

  var mProperties = {
    src: sSrc
  };

  var sLeftArrowClass = "sapPFHArrowScrollLeft";
  var sRightArrowClass = "sapPFHArrowScrollRight";
  var aCssClassesToAddLeft = ["sapPFHArrowScroll", sLeftArrowClass];
  var aCssClassesToAddRight = ["sapPFHArrowScroll", sRightArrowClass];

  if (direction === sap.suite.ui.commons.ProcessFlow._constants.left) {
    if (!this._oArrowLeft) {
      this._oArrowLeft = sap.m.ImageHelper.getImageControl(this.getId() + sap.suite.ui.commons.ProcessFlow._constants.arrowScrollLeftMinus, null, this, mProperties, aCssClassesToAddLeft);
    }
    return this._oArrowLeft;
  }
  if (direction === sap.suite.ui.commons.ProcessFlow._constants.right) {
    if (!this._oArrowRight) {
      this._oArrowRight = sap.m.ImageHelper.getImageControl(this.getId() + sap.suite.ui.commons.ProcessFlow._constants.arrowScrollRightMinus, null, this, mProperties, aCssClassesToAddRight);
    }
    return this._oArrowRight;
  }
};

/**
 * Checks if scrolling is needed.
 *
 * @private
 * @param oScrollContainer the scroll container
 * @param $processFlow the ProcessFlow container
 * @returns true if scrolling is needed, otherwise false
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._checkScrolling = function (oScrollContainer, $processFlow) {
  var bScrolling = false;

  //Check if there are more lanes than displayed.
  if (oScrollContainer) {
    if (oScrollContainer.scrollWidth > oScrollContainer.clientWidth) {
      //Scrolling possible.
      bScrolling = true;
    }
  }

  if (this._arrowScrollable !== bScrolling) {
    $processFlow.toggleClass("sapPFHScrollable", bScrolling);
    $processFlow.toggleClass("sapPFHNotScrollable", !bScrolling);
    this._arrowScrollable = bScrolling;
  }

  return bScrolling;
};

/**
 * Calculates the left counter.
 *
 * @private
 * @returns {Number} The left counter
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._updateLeftCounter = function () {
  var iScrollDelta;
  if (!this._bRtl) { //Normal LTR mode.
    iScrollDelta = this._getScrollContainer().scrollLeft();
  }
  else { //RTL mode.
    iScrollDelta = this._getScrollContainer().scrollRightRTL();
  }
  var iCounterLeft = Math.round(iScrollDelta / this._scrollStep);
  this.$(sap.suite.ui.commons.ProcessFlow._constants.counterLeft).text(iCounterLeft.toString());
  return iCounterLeft;
};

/**
 * Calculates the right counter.
 *
 * @private
 * @param scrollContainerAvailableWidth
 * @param scrollContainerRealWidth
 * @returns {Number} The right counter
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._updateRightCounter = function (scrollContainerAvailableWidth, scrollContainerRealWidth ) {
  var iScrollDelta;
  var iCounterRight;
  if (!this._bRtl) { //Normal LTR mode.
    iScrollDelta = this._getScrollContainer().scrollLeft();
    iCounterRight = Math.round((scrollContainerRealWidth  - iScrollDelta - scrollContainerAvailableWidth) / this._scrollStep);
  }
  else { //RTL mode.
    iScrollDelta = this._getScrollContainer().scrollLeftRTL();
    iCounterRight = Math.round(iScrollDelta / this._scrollStep);
  }
  this.$(sap.suite.ui.commons.ProcessFlow._constants.counterRight).text(iCounterRight.toString());
  return iCounterRight;
};

/**
 * For scrollable ProcessFlow : move arrows and counter vertically when scrolling.
 *
 * @private
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._moveArrowAndCounterVertical = function () {
  var iScrollTop = this._getScrollContainer().scrollTop();
  if (iScrollTop > 0) {
    var iArrowTop = this._iInitialArrowTop - iScrollTop;
    var iCounterTop = this._iInitialCounterTop - iScrollTop;
    var iDiffArrowCounter = this._iInitialCounterTop - this._iInitialArrowTop;
    if (iArrowTop > 0) {
      this.$(sap.suite.ui.commons.ProcessFlow._constants.arrowScrollRight).css(sap.suite.ui.commons.ProcessFlow._constants.top, iArrowTop + sap.suite.ui.commons.ProcessFlow._constants.px);
      this.$(sap.suite.ui.commons.ProcessFlow._constants.arrowScrollLeft).css(sap.suite.ui.commons.ProcessFlow._constants.top, iArrowTop + sap.suite.ui.commons.ProcessFlow._constants.px);
    }
    else {
      this.$(sap.suite.ui.commons.ProcessFlow._constants.arrowScrollRight).css(sap.suite.ui.commons.ProcessFlow._constants.top, "0px");
      this.$(sap.suite.ui.commons.ProcessFlow._constants.arrowScrollLeft).css(sap.suite.ui.commons.ProcessFlow._constants.top, "0px");
    }
    if (iCounterTop > iDiffArrowCounter) {
      this.$(sap.suite.ui.commons.ProcessFlow._constants.counterRight).css(sap.suite.ui.commons.ProcessFlow._constants.top, iCounterTop + sap.suite.ui.commons.ProcessFlow._constants.px);
      this.$(sap.suite.ui.commons.ProcessFlow._constants.counterLeft).css(sap.suite.ui.commons.ProcessFlow._constants.top, iCounterTop + sap.suite.ui.commons.ProcessFlow._constants.px);
    }
    else {
      this.$(sap.suite.ui.commons.ProcessFlow._constants.counterRight).css(sap.suite.ui.commons.ProcessFlow._constants.top, iDiffArrowCounter + sap.suite.ui.commons.ProcessFlow._constants.px);
      this.$(sap.suite.ui.commons.ProcessFlow._constants.counterLeft).css(sap.suite.ui.commons.ProcessFlow._constants.top, iDiffArrowCounter + sap.suite.ui.commons.ProcessFlow._constants.px);
    }
  }
  else {
    this.$(sap.suite.ui.commons.ProcessFlow._constants.arrowScrollRight).css(sap.suite.ui.commons.ProcessFlow._constants.top, this._iInitialArrowTop + sap.suite.ui.commons.ProcessFlow._constants.px);
    this.$(sap.suite.ui.commons.ProcessFlow._constants.arrowScrollLeft).css(sap.suite.ui.commons.ProcessFlow._constants.top, this._iInitialArrowTop + sap.suite.ui.commons.ProcessFlow._constants.px);
    this.$(sap.suite.ui.commons.ProcessFlow._constants.counterRight).css(sap.suite.ui.commons.ProcessFlow._constants.top, this._iInitialCounterTop + sap.suite.ui.commons.ProcessFlow._constants.px);
    this.$(sap.suite.ui.commons.ProcessFlow._constants.counterLeft).css(sap.suite.ui.commons.ProcessFlow._constants.top, this._iInitialCounterTop + sap.suite.ui.commons.ProcessFlow._constants.px);
  }
};

/**
 * Changes the state of the scroll arrows depending on whether they are required due to overflow.
 *
 * @private
 * @param scrollContainer the scroll container
 * @param $processFlow the ProcessFlow container
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._checkOverflow = function (scrollContainer, $processFlow) {
  if (this._checkScrolling(scrollContainer, $processFlow) && scrollContainer) {
    this._setScrollWidth();
    //Check whether scrolling to the left is possible.
    var bScrollBack = false;
    var bScrollForward = false;
    var iOffset = 20; //Display arrow and counter only if the distance to the end of the scroll container is at least 20px.
    var iScrollLeft = this._getScrollContainer().scrollLeft();
    var iScrollContainerRealWidth  = scrollContainer.scrollWidth;
    var iScrollContainerAvailableWidth = scrollContainer.clientWidth;
    if (Math.abs(iScrollContainerRealWidth  - iScrollContainerAvailableWidth) == 1) { //Avoid rounding issues see CSN 1316630 2013
      iScrollContainerRealWidth  = iScrollContainerAvailableWidth;
    }

    if (!this._bRtl) { //Normal LTR mode.
      if (iScrollLeft > iOffset) {
        bScrollBack = true;
      }
      if ((iScrollContainerRealWidth  > iScrollContainerAvailableWidth) && (iScrollLeft + iScrollContainerAvailableWidth + iOffset < iScrollContainerRealWidth )) {
        bScrollForward = true;
      }
    } else { //RTL mode.
      var $ScrollContainer = jQuery(scrollContainer);
      if ($ScrollContainer.scrollLeftRTL() > iOffset) {
        bScrollForward = true;
      }
      if ($ScrollContainer.scrollRightRTL() > iOffset) {
        bScrollBack = true;
      }
    }
    //Update left and right counter.
    this._updateLeftCounter();
    this._updateRightCounter(iScrollContainerAvailableWidth, iScrollContainerRealWidth );

    //Only do DOM changes if the state changed to avoid periodic application of identical values.
    if ((bScrollForward !== this._bPreviousScrollForward) || (bScrollBack !== this._bPreviousScrollBack)) {
      this._bPreviousScrollForward = bScrollForward;
      this._bPreviousScrollBack = bScrollBack;
      $processFlow.toggleClass("sapPFHScrollBack", bScrollBack);
      $processFlow.toggleClass("sapPFHNoScrollBack", !bScrollBack);
      $processFlow.toggleClass("sapPFHScrollForward", bScrollForward);
      $processFlow.toggleClass("sapPFHNoScrollForward", !bScrollForward);
    }
  } else {
    this._bPreviousScrollForward = false;
    this._bPreviousScrollBack = false;
  }
};

/**
 * Sets the parent association for given nodes.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowNode[]} internalNodes Array of nodes to set parents on
 */
sap.suite.ui.commons.ProcessFlow.prototype._setParentForNodes = function (internalNodes) {
  var iInternalNodesLength = internalNodes ? internalNodes.length : 0;
  var aChildren;
  var i, j;
  //Cleanup association to avoid duplicates.
  for (var oCurrentNode in internalNodes) {
    internalNodes[oCurrentNode].removeAllAssociation(sap.suite.ui.commons.ProcessFlow._constants.parents, true);
  }
  for (i = 0; i < iInternalNodesLength; i++) {
    aChildren = internalNodes[i].getChildren();
    if (aChildren) {
      for (j = 0; j < aChildren.length; j++) {
        var oChildNode = this._getNode(sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]), internalNodes);
        if (oChildNode) {
          oChildNode.addAssociation(sap.suite.ui.commons.ProcessFlow._constants.parents, internalNodes[i], true);
        }
      }
    }
  }
};

/**
 * Creates the connection map objects between the source and target nodes
 * incl. label information and connection parts, based on the calculated matrix.
 *
 * @private
 * @returns {Array} The Connection array
 */
sap.suite.ui.commons.ProcessFlow.prototype._getConnectionsMap = function () {

  //Example:
  //  var connectionMap = [];
  //  var connectionMapEntry = {};
  //  connectionMapEntry.sourceNode = matrix[0][1];
  //  connectionMapEntry.targetNode = matrix[4][3];
  //  connectionMapEntry.label = "label from code, needs to be mapped";
  //  connectionMapEntry.connectionParts = [
  //                                   {x:0, y:2},
  //                                   {x:1, y:2},
  //                                   {x:2, y:2},
  //                                   {x:3, y:2},
  //                                   {x:4, y:2}
  //                                   ];

  var aConnections = [];
  var aNodes = this.getNodes();
  for (var i = 0; i < aNodes.length; i++) {
    var oPositionSourceNode = this._getPositionOfNodeInMatrix(this._internalCalcMatrix, aNodes[i]);
    var aChildren = aNodes[i].getChildren();
    if (aChildren) {
      for (var j = 0; j < aChildren.length; j++) {
        var oConnectionMapEntry = {};
        oConnectionMapEntry.sourceNode = aNodes[i];
        var iChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]);
        var oChildNode = this._getNode(iChildId, aNodes);
        if (oChildNode) {
          if (typeof aChildren[j] === 'object') {
            oConnectionMapEntry.label = aChildren[j].connectionLabel;
          }
          oConnectionMapEntry.targetNode = oChildNode;
          //Find position in matrix
          var oPositionTargetNode = this._getPositionOfNodeInMatrix(this._internalCalcMatrix, oConnectionMapEntry.targetNode);
          oConnectionMapEntry.connectionParts = this._calculateConnectionParts(oPositionSourceNode, oPositionTargetNode);
          aConnections.push(oConnectionMapEntry);
        }
      }
    }
  }
  this._internalConnectionMap = aConnections;
  return aConnections;
};

/**
 * Returns the position (coordinates x/y) of the given ProcessFlowNode in calculated matrix of ProcessFlow.
 *
 * @private
 * @param {Object} The calculated matrix of the current ProcessFlow
 * @param {sap.suite.ui.commons.ProcessFlowNode} The node for which the position is required
 * @returns {Object} The position of the node in the calculated matrix (x/y)
 */
sap.suite.ui.commons.ProcessFlow.prototype._getPositionOfNodeInMatrix = function (matrix, node) {
  var oPosition = {};
  for (var i = 0; i < matrix.length; i++) {
    var aCurrentLine = matrix[i];
    for (var j = 0; j < aCurrentLine.length; j++) {
      var currentCell = aCurrentLine[j];
      if (currentCell &&
          currentCell instanceof sap.suite.ui.commons.ProcessFlowNode &&
          currentCell.getNodeId() === node.getNodeId()) {
        oPosition.y = i;
        oPosition.x = j;
        return oPosition;
      }
    }
  }
  return oPosition;
};

/**
 * Calculates the connection parts (coordinates in matrix) between source and target node.
 *
 * @private
 * @param {Object} The position of the source node in the calculated matrix (x/y)
 * @param {Object} The position of the target node in the calculated matrix (x/y)
 * @returns {Array} Array of all connection parts, relevant for connection between source and target node
 */
sap.suite.ui.commons.ProcessFlow.prototype._calculateConnectionParts = function (positionSourceNode, positionTargetNode) {

  //Example:
  //var connectionParts = [
  //    {x:0, y:2},
  //    {x:1, y:2},
  //    {x:2, y:2},
  //    {x:3, y:2},
  //    {x:4, y:2}
  //  ];

  var aConnectionParts = [];
  var iSouceNodeY = positionSourceNode.y;
  var iSouceNodeX = positionSourceNode.x;

  //Increase column+1 (step 1 right), independent from target position since target will ever be right from source.
  iSouceNodeX++;
  aConnectionParts.push({ x: iSouceNodeX, y: iSouceNodeY });

  //Increase (row+1) till we are in the row of target node (n steps down) if target is below source in matrix.
  //Decrease (row-1) till we are in the row of target node (n steps up) if target is above source in matrix.
  if (positionTargetNode.y >= positionSourceNode.y) {
    while (iSouceNodeY < positionTargetNode.y) {
      iSouceNodeY++;
      aConnectionParts.push({ x: iSouceNodeX, y: iSouceNodeY });
    }
  } else {
    while (iSouceNodeY > positionTargetNode.y) {
      iSouceNodeY--;
      aConnectionParts.push({ x: iSouceNodeX, y: iSouceNodeY });
    }
  }

  //Increase column+1 till we are in column of target node (n steps right)
  while (iSouceNodeX < positionTargetNode.x - 1) {
    iSouceNodeX++;
    aConnectionParts.push({ x: iSouceNodeX, y: iSouceNodeY });
  }
  return aConnectionParts;
};

/**
 * Returns the connectionMapEntries which are relevant for the given sap.suite.ui.commonsProcessFlowConnectionLabel.
 * Means all entries having the same target node as current entry (based on current label).
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowConnectionLabel} The label for which the map entries are required
 * @returns {Array} Array with relevant connectionMapEntries for the given label
 */
sap.suite.ui.commons.ProcessFlow.prototype._getConnectionMapEntries = function (connectionLabel) {
  var aFilteredConnectionMaps = [];
  var oConnectionMapWithLabel = null;
  var oEntry = null;

  //Find relevant connectionMapEntry, containing given Label.
  if (this._internalConnectionMap) {
    for (var i = 0; i < this._internalConnectionMap.length; i++) {
      oEntry = this._internalConnectionMap[i];
      if (oEntry.label &&
          oEntry.label.getId() === connectionLabel.getId()) {
        oConnectionMapWithLabel = oEntry;
        break;
      }
    }

    //Collect all connectionMapEntries with same target node as the one, containing the Label.
    oEntry = null;
    for (var j = 0; j < this._internalConnectionMap.length; j++) {
      oEntry = this._internalConnectionMap[j];
      if (oEntry.targetNode &&
          oEntry.targetNode.getNodeId() === oConnectionMapWithLabel.targetNode.getNodeId()) {
        aFilteredConnectionMaps.push(oEntry);
      }
    }
  }
  return aFilteredConnectionMaps;
};

/**
 * Creates the eventArgs for fireLabelPress of ProcessFlow.
 * Additional object is necessary, since connectionmaps are containing too much information (e.g. parts).
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowConnectionlabel} Label which has been selected by user (clicked)
 * @param {Object[]} The relevant connection maps for the selected label
 * @returns {Object} Event args for fireLabelPress
 */
sap.suite.ui.commons.ProcessFlow.prototype._createLabelPressEventArgs = function (connectionLabel, connectionMapEntries) {
  var oEvent = {};
  var aEventArgsConnectionValues = [];

  if (connectionMapEntries) {
    for (var i = 0; i < connectionMapEntries.length; i++) {
      var oEventArgsConnectionValue = {
        sourceNode: connectionMapEntries[i].sourceNode,
        targetNode: connectionMapEntries[i].targetNode,
        label: connectionMapEntries[i].label
      };
      aEventArgsConnectionValues.push(oEventArgsConnectionValue);
    }
  }

  oEvent.selectedLabel = connectionLabel;
  oEvent.connections = aEventArgsConnectionValues;
  return oEvent;
};

/**
 * Function applies the changes to the display state based on the requirements.
 * If any node is in the highlighted state all others are set to the dimmed state.
 *
 * @public
 * @deprecation Since 1.38.0
 */
//deprecation in order to set the method as private later on
sap.suite.ui.commons.ProcessFlow.prototype.applyNodeDisplayState = function () {
  var aInternalNodes = this.getNodes(),
      iNodeCount = aInternalNodes ? aInternalNodes.length : 0,
      i = 0;

  if (iNodeCount === 0) {
    return;
  } else {
    // First put all the nodes to the regular state - if possible
    while (i < iNodeCount) {
      aInternalNodes[i]._setRegularState();
      i++;
    }

    // Check for the highlighted or selected node- at least one is required
    i = 0;
    while ((i < iNodeCount) && !aInternalNodes[i].getHighlighted() && !aInternalNodes[i].getSelected()) {
      i++;
    }

    // If a highlighted or selected node was found, set the others to dimmed state
    if (i < iNodeCount) {
      i = 0;
      while (i < iNodeCount) {
        if (!aInternalNodes[i].getHighlighted() && !aInternalNodes[i].getSelected()) {
          aInternalNodes[i]._setDimmedState();
        }
        i++;
      }
    }
  }
};

/**
 * Function checks consistency of the node array. It checks,
 * if all child elements defined for the nodes are also presented as the nodes themselves
 *
 * @public
 * @param elementById Map of node id's to NodeElements. Expectation is to have at least 1 element there. No check for empty array.
 * @returns {Boolean} Value, where true means no activity, false means set the focus on top left root node
 * @throws array of error messages produced during the consistency check
 * @deprecation Since 1.38.0
 */
//deprecation in order to set the method as private later on
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.checkInputNodeConsistency = function (elementById) {
  var aErrorMesagges = [],
      j,
      sChildId,
      iChildCount,
      aChildren,
      oElement,
      iFocusNodesCount = 0;

  //Preparation phase
  Object.keys(elementById).forEach(function (sElementId) {
    oElement = elementById[sElementId];
    aChildren = oElement.oNode.getChildren();
    iChildCount = aChildren ? aChildren.length : 0;

    if (oElement.oNode.getFocused()) {
      iFocusNodesCount++;
    }

    j = 0;
    while (j < iChildCount) {
      sChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]);
      if (!elementById[sChildId]) {
        aErrorMesagges.push("Node identificator " + sChildId + " used in children definition is not presented as the node itself. Element : " + oElement.nodeId);
      }
      j++;
    }
  });

  if (aErrorMesagges.length > 0) {
    throw aErrorMesagges;
  }
  return iFocusNodesCount > 1;
};

/**
 * Creates the matrix where the nodes are already positioned correctly.
 *
 * @public
 * @param currentElement actually processed element
 * @param elementById map of all the available elements
 * @param matrix the updated virtual matrix
 * @returns The updated virtual matrix
 * @deprecation Since 1.38.0
 */
//deprecation in order to set the method as private later on
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.processCurrentElement = function (currentElement, elementById, matrix) {
  var aElementsChildIds,
      aElementsChildren,
      that = this,
      bNoChildInUpperRow = true, // If there is a child element already drawn in an upper row, it is required to move to the next line
      bMoveToNextLine = true; // This is the check for repeated parent-child relationship. The childrenArr is not empty but
  // in fact it is required to move to the next line.

  if (currentElement.isProcessed) {
    return matrix;
  }

  this.nodePositions[currentElement.nodeId] = {
    'c': currentElement,
    'x': this.iPositionX,
    'y': this.iPositionY * 2
  };

  matrix[this.iPositionX][this.iPositionY++] = currentElement;
  aElementsChildIds = currentElement.oNode.getChildren();
  currentElement.isProcessed = true;
  aElementsChildren = this._sortBasedOnChildren(aElementsChildIds, elementById);

  if (aElementsChildren) {
    aElementsChildren.forEach(function (oChild) {
      if (!oChild.isProcessed) {
        bMoveToNextLine = false;
        while (that.iPositionY < oChild.lane) {
          matrix[that.iPositionX][that.iPositionY++] = null;
        }
        matrix = that.processCurrentElement(oChild, elementById, matrix);
      }
      else {
        // Child element has already been processed, which means there is a connection pointing to the right.
        // Therefore it is necessary to move to the next line so that the next child element is not drawn in the connection.
        if (bNoChildInUpperRow && bMoveToNextLine) {
          that.iPositionX++;
          bNoChildInUpperRow = false;
        }
      }
    });
  }

  if (!aElementsChildIds || bMoveToNextLine) {
      // Check if we moved already to the next line in the forEach loop
    if (bNoChildInUpperRow) {
      this.iPositionX++;
    }
    this.iPositionY = 0;
  }

  return matrix;
};

/* =========================================================== */
/* Public methods                                              */
/* =========================================================== */

/**
 * Function returns current zoom level.
 *
 * @public
 * @returns {String} The zoomLevel
*/
sap.suite.ui.commons.ProcessFlow.prototype.getZoomLevel = function () {
  return this._zoomLevel;
};

/**
 * Function sets the zoom level.
 *
 * @public
 * @param zoomLevel. this is a new zoom level of the type sap.suite.ui.commons.ProcessFlowZoomLevel
 */
sap.suite.ui.commons.ProcessFlow.prototype.setZoomLevel = function (zoomLevel) {
  if (!this._getScrollContainer()) {
    return;
  }

  var $scrollContainer = this._getScrollContainer();
  var oScrollContainerContextOld = null;
  var oScrollContainerContextNew;
  if ($scrollContainer.context) {
    oScrollContainerContextOld = {
      scrollWidth: $scrollContainer.context.scrollWidth,
      scrollHeight: $scrollContainer.context.scrollHeight,
      scrollLeft: $scrollContainer.context.scrollLeft,
      scrollTop: $scrollContainer.context.scrollTop
    };
    oScrollContainerContextNew = oScrollContainerContextOld;
    if (this._zoomLevel === zoomLevel) {
      this._isInitialZoomLevelNeeded = false;
      return;
    }
  }
  if (!(zoomLevel in sap.suite.ui.commons.ProcessFlowZoomLevel)) { // Enumeration
    this._handleException("\"" + zoomLevel + "\" is not a valid entry of the enumeration for property zoom level of ProcessFlow");
    return;
  }
  this._zoomLevel = zoomLevel;
  //When setting the initial zoomlevel, invalidate() has to be called,
  //because the method call comes from onAfterRendering() and to call the rerender() is not allowed.
  if (this._isInitialZoomLevelNeeded) {
    this._isInitialZoomLevelNeeded = false;
    this.invalidate();
    //In all other cases, the rerender() has to be called, so that the offset can be set afterwards.
  } else {
    this.rerender();
  }

  if (oScrollContainerContextOld) {
    //Set the grab cursor class in case for touch devices
    if (sap.ui.Device.support.touch || jQuery.sap.simulateMobileOnDesktop) {
      var iHeight = parseInt(this._getScrollContainer().css("height").slice(0, -2), 10);
      var iWidth = parseInt(this._getScrollContainer().css("width").slice(0, -2), 10);
      var iScrollHeight = this._getScrollContainer()[0].scrollHeight;
      var iScrollWidth = this._getScrollContainer()[0].scrollWidth;
      if (this.getScrollable() && (iScrollHeight > iHeight || iScrollWidth > iWidth)) {
        this._switchCursors(this._getScrollContainer(), this._defaultCursorClass, this._grabCursorClass);
        this._getScrollContainer().css("overflow", "auto");
      }
    }
    //Sets the scroll offset to the scrollContainer.
    $scrollContainer = this._getScrollContainer();
    oScrollContainerContextNew = this._getScrollContainerOnZoomChanged(oScrollContainerContextOld, $scrollContainer);
    $scrollContainer.scrollLeft(oScrollContainerContextNew.scrollLeft);
    $scrollContainer.scrollTop(oScrollContainerContextNew.scrollTop);
    this._adjustAndShowArrow();
    //Avoids not setting the focus on clickable elements.
    if (this._isFocusChanged) {
      this._setFocusToNode();
      this._isFocusChanged = false;
    }
  }
};

/**
 * Function sets new zoom level with smaller level of details. Having the least detail view it stays as it is.
 *
 * @public
 * @returns {String} The updated zoomLevel
 */
sap.suite.ui.commons.ProcessFlow.prototype.zoomOut = function () {
  var sCurrentZoomLevel = this.getZoomLevel();
  var sNewZoomLevel = sCurrentZoomLevel;
  switch (sCurrentZoomLevel) {
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.One):
      sNewZoomLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Two;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Two):
      sNewZoomLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Three;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Three):
      sNewZoomLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Four;
      break;
  }
  this.setZoomLevel(sNewZoomLevel);
  return this.getZoomLevel();
};

/**
 * Function sets new zoom level with higher level of details. Having max details it stays as it is.
 *
 * @public
 * @returns {String} The updated zoomLevel
 */
sap.suite.ui.commons.ProcessFlow.prototype.zoomIn = function () {
  var sCurrentZoomLevel = this.getZoomLevel();
  var sNewZoomLevel = sCurrentZoomLevel;
  switch (sCurrentZoomLevel) {
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Four):
      sNewZoomLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Three;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Three):
      sNewZoomLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Two;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Two):
      sNewZoomLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.One;
      break;
  }
  this.setZoomLevel(sNewZoomLevel);
  return this.getZoomLevel();
};

/**
 * Updates the model and rerenders the control.
 *
 * @public
 */
sap.suite.ui.commons.ProcessFlow.prototype.updateModel = function () {
  //reset nodes' laneIds for merged lanes
  var aNodes = this.getNodes();
  aNodes.forEach(function(oNode) {
   oNode._mergedLaneId = false;
  });
  // reset lanes' position that was created for merged lanes
  var aLanes = this.getLanes();
  aLanes.forEach(function(oLane) {
    oLane._mergedLanePosition = false;
  });

  //Initialize internalLanes so that they get recalculated from the new nodes.
  this._internalLanes = [];
  if (this._isHeaderMode()) {
    var oLaneModel = this.getBindingInfo("lanes");
    this.getModel(oLaneModel.model).refresh();
  }
  else {
    var oNodeModel = this.getBindingInfo("nodes");
    this.getModel(oNodeModel.model).refresh();
  }
  this.rerender();
};

/**
 * Optimizes the layout and updates the model. To be used carefully because of its possible side effects on the performance.
 *
 * @public
 * @param {Boolean} isOptimized True if the layout should be optimized; false if the layout should be brought to the initial state.
 * @returns {sap.suite.ui.commons.ProcessFlow} this to allow method chaining
 * @since 1.44
 */
sap.suite.ui.commons.ProcessFlow.prototype.optimizeLayout = function (isOptimized) {
  if (isOptimized === undefined) {
    isOptimized = true;
  }
  // apply the logic only in case of mode change
  if (this._isLayoutOptimized !== isOptimized) {
    this._isLayoutOptimized = isOptimized;
    this.updateModel();
  }

  return this;
};

/**
 * Function returns the nodeId of the node which is focused.
 *
 * @public
 * @returns {String} The id of focused node
 */
sap.suite.ui.commons.ProcessFlow.prototype.getFocusedNode = function () {
  if (this._lastNavigationFocusElement) {
    return this._lastNavigationFocusElement.sId;
  }
};

/**
 * Updates the nodes and rerenders the control.
 *
 * @public
 */
sap.suite.ui.commons.ProcessFlow.prototype.updateNodesOnly = function () {
  var oNodeModel = this.getBindingInfo("nodes");
  this.getModel(oNodeModel.model).refresh();
  this.rerender();
};

/**
 * Sets the path between source and target node to selected status and rerenders the control. If parameters are null, sets all nodes to normal status.
 *
 * @public
 * @param {String} sourceNodeId of the path or null
 * @param {String} targetNodeId of the path or null
 * @since 1.32
 */
sap.suite.ui.commons.ProcessFlow.prototype.setSelectedPath = function (sourceNodeId, targetNodeId) {
  var aNodes = this.getNodes();
  if (aNodes) {
    if (sourceNodeId && targetNodeId) {
      var cNodesFound = 0;
      for (var i = 0; i < aNodes.length; i++) {
        if (aNodes[i].getNodeId() === sourceNodeId || aNodes[i].getNodeId() === targetNodeId) {
          aNodes[i].setSelected(true);
          cNodesFound++;
        } else {
          aNodes[i].setSelected(false);
        }
      }
      if (cNodesFound == 2) {
        this.rerender();
      }
    } else if (!sourceNodeId && !targetNodeId) {
      for (var i = 0; i < aNodes.length; i++) {
        aNodes[i].setSelected(false);
      }
      this.rerender();
    }
  }
};

/**
 * Overwrites setShowLabels of ProcessFlow control to apply additional functionality.
 *
 * @public
 * @param {Boolean} New value for showLabels
 */
sap.suite.ui.commons.ProcessFlow.prototype.setShowLabels = function (value) {
  var bOldValue = this.getShowLabels();
  if (bOldValue && !value) { //Only if status has been changed from show to hide
    this.setProperty("showLabels", value, true);
    // Resets the selected path in case labels have been disabled for the current control.
    if (!this.getShowLabels()) {
      this.setSelectedPath(null, null);
    }
  } else {
    this.setProperty("showLabels", value);
  }
};

/**
 * Sets the focus to the given Label
 *
 * @public
 * @param {sap.suite.ui.commons.ProcessFlowConnectionlabel} Label to focus
 * @since 1.32
 */
sap.suite.ui.commons.ProcessFlow.prototype.setFocusToLabel = function (label) {
  this._changeNavigationFocus(this._lastNavigationFocusElement, label);
};

/**
 * Returns a node from the aggregation named 'nodes' by comparing the nodeId property of node.
 *
 * @public
 * @since 1.46.0
 * @param {String} sNodeId ID of node to return
 * @returns {sap.suite.ui.commons.ProcessFlowNode} the requested node or null
 */
sap.suite.ui.commons.ProcessFlow.prototype.getNode = function (sNodeId) {
  var aNodes = this.getNodes();
  for (var i = 0; i < aNodes.length; i++) {
    if (aNodes[i].getProperty("nodeId") === sNodeId ) {
      return aNodes[i];
    }
  }
};

/**
 * Returns a lane from the aggregation named 'lanes' by comparing the laneId property of lane.
 *
 * @public
 * @since 1.46.0
 * @param {String} sLaneId ID of the lane to return
 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader} the requested lane or null
 */
sap.suite.ui.commons.ProcessFlow.prototype.getLane = function (sLaneId) {
  var aLanes = this.getLanes();
  for (var i = 0; i < aLanes.length; i++) {
    if (aLanes[i].getProperty("laneId") === sLaneId ) {
      return aLanes[i];
    }
  }
};