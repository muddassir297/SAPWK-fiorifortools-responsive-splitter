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

// Provides control sap.suite.ui.commons.ProcessFlowNode.
jQuery.sap.declare("sap.suite.ui.commons.ProcessFlowNode");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ProcessFlowNode.
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
 * <li>{@link #getTitle title} : string</li>
 * <li>{@link #getIsTitleClickable isTitleClickable} : boolean (default: false)</li>
 * <li>{@link #getLaneId laneId} : string</li>
 * <li>{@link #getNodeId nodeId} : string</li>
 * <li>{@link #getState state} : sap.suite.ui.commons.ProcessFlowNodeState (default: sap.suite.ui.commons.ProcessFlowNodeState.Neutral)</li>
 * <li>{@link #getType type} : sap.suite.ui.commons.ProcessFlowNodeType (default: sap.suite.ui.commons.ProcessFlowNodeType.Single)</li>
 * <li>{@link #getChildren children} : any[]</li>
 * <li>{@link #getTitleAbbreviation titleAbbreviation} : string</li>
 * <li>{@link #getStateText stateText} : string</li>
 * <li>{@link #getTexts texts} : string[]</li>
 * <li>{@link #getHighlighted highlighted} : boolean (default: false)</li>
 * <li>{@link #getFocused focused} : boolean (default: false)</li>
 * <li>{@link #getTag tag} : object</li>
 * <li>{@link #getSelected selected} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul>
 * <li>{@link #getParents parents} : string | sap.suite.ui.commons.ProcessFlowNode</li></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.suite.ui.commons.ProcessFlowNode#event:titlePress titlePress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ProcessFlowNode#event:press press} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * This control enables you to see documents (or other items) in respect to their statuses – positive, negative, neutral, planned, planned negative. In addition to the node title (which can be optionally a hyperlink) also two other text fields are provided and can be filled. The process flow nodes consider all styles depending on the status they are in. The user can update or change the content of the node. The content of the node can be also filtered according to updated data and specific parameters set. This means that also the node’s style is affected.
 * @extends sap.ui.core.Control
 * @version 1.46.0
 *
 * @constructor
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.suite.ui.commons.ProcessFlowNode", { metadata : {

	library : "sap.suite.ui.commons",
	properties : {

		/**
		 * The node title.
		 */
		"title" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * Specifies if the node title is clickable.
		 * @deprecated Since version 1.26. 
		 * According to the new requirement there should be only one click event for each node (click on the whole node – see Press event) that is why titlePress event should not be used any longer. Hence isTitleClickable should not be used either.
		 */
		"isTitleClickable" : {type : "boolean", group : "Behavior", defaultValue : false, deprecated: true},

		/**
		 * Specifies the assignment of the node to the respective lane.
		 */
		"laneId" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * >Node identifier.
		 */
		"nodeId" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * State of the node.
		 */
		"state" : {type : "sap.suite.ui.commons.ProcessFlowNodeState", group : "Appearance", defaultValue : sap.suite.ui.commons.ProcessFlowNodeState.Neutral},

		/**
		 * Type of the node.
		 */
		"type" : {type : "sap.suite.ui.commons.ProcessFlowNodeType", group : "Appearance", defaultValue : sap.suite.ui.commons.ProcessFlowNodeType.Single},

		/**
		 * Defines an array of children of the node.
		 */
		"children" : {type : "any[]", group : "Misc", defaultValue : null},

		/**
		 * Title abbreviation is used in the compact mode.
		 */
		"titleAbbreviation" : {type : "string", group : "Data", defaultValue : null},

		/**
		 * Description of the state, for example "Status OK".
		 */
		"stateText" : {type : "string", group : "Data", defaultValue : null},

		/**
		 * The property contains the additional texts on the node. The expected type is array of strings. One array must not contain more than two strings. Additional strings in the array will be ignored.
		 */
		"texts" : {type : "string[]", group : "Misc", defaultValue : null},

		/**
		 * The parameter defines if the node should be displayed in highlighted state.
		 */
		"highlighted" : {type : "boolean", group : "Appearance", defaultValue : false},

		/**
		 * The parameter defines if the node should be displayed in focus state.
		 */
		"focused" : {type : "boolean", group : "Appearance", defaultValue : false},

		/**
		 * The user-defined object which is returned back to the user by a node click event.
		 */
		"tag" : {type : "object", group : "Misc", defaultValue : null},

		/**
		 * The parameter defines if the node should be displayed in selected state.
		 */
		"selected" : {type : "boolean", group : "Appearance", defaultValue : false}
	},
	associations : {

		/**
		 * Reference to ProcessFlowNodes which appears before this ProcessFlowNode.
		 */
		"parents" : {type : "sap.suite.ui.commons.ProcessFlowNode", multiple : true, singularName : "parent"}
	},
	events : {

		/**
		 * This event handler is executed when the user clicks the node title. This event is fired only when the title is clickable (isTitleClickable equals true).
		 * @deprecated Since version 1.26. 
		 * Should not be used any longer, use Press event instead ( click on the node)
		 */
		"titlePress" : {deprecated: true,
			parameters : {

				/**
				 * The node identification.
				 */
				"oEvent" : {type : "object"}
			}
		}, 

		/**
		 * This event is fired when the user clicks on the node. However, this event is not fired if the titlePress event has been fired.
		 */
		"press" : {
			parameters : {

				/**
				 * The node identification.
				 */
				"oEvent" : {type : "object"}
			}
		}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.ProcessFlowNode with name <code>sClassName</code> 
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
 * @name sap.suite.ui.commons.ProcessFlowNode.extend
 * @function
 */

sap.suite.ui.commons.ProcessFlowNode.M_EVENTS = {'titlePress':'titlePress','press':'press'};


/**
 * Getter for property <code>title</code>.
 * The node title.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>title</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getTitle
 * @function
 */

/**
 * Setter for property <code>title</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTitle  new value for property <code>title</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setTitle
 * @function
 */


/**
 * Getter for property <code>isTitleClickable</code>.
 * Specifies if the node title is clickable.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>isTitleClickable</code>
 * @public
 * @deprecated Since version 1.26. 
 * According to the new requirement there should be only one click event for each node (click on the whole node – see Press event) that is why titlePress event should not be used any longer. Hence isTitleClickable should not be used either.
 * @name sap.suite.ui.commons.ProcessFlowNode#getIsTitleClickable
 * @function
 */

/**
 * Setter for property <code>isTitleClickable</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bIsTitleClickable  new value for property <code>isTitleClickable</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.26. 
 * According to the new requirement there should be only one click event for each node (click on the whole node – see Press event) that is why titlePress event should not be used any longer. Hence isTitleClickable should not be used either.
 * @name sap.suite.ui.commons.ProcessFlowNode#setIsTitleClickable
 * @function
 */


/**
 * Getter for property <code>laneId</code>.
 * Specifies the assignment of the node to the respective lane.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>laneId</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getLaneId
 * @function
 */

/**
 * Setter for property <code>laneId</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sLaneId  new value for property <code>laneId</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setLaneId
 * @function
 */


/**
 * Getter for property <code>nodeId</code>.
 * >Node identifier.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>nodeId</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getNodeId
 * @function
 */

/**
 * Setter for property <code>nodeId</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sNodeId  new value for property <code>nodeId</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setNodeId
 * @function
 */


/**
 * Getter for property <code>state</code>.
 * State of the node.
 *
 * Default value is <code>Neutral</code>
 *
 * @return {sap.suite.ui.commons.ProcessFlowNodeState} the value of property <code>state</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getState
 * @function
 */

/**
 * Setter for property <code>state</code>.
 *
 * Default value is <code>Neutral</code> 
 *
 * @param {sap.suite.ui.commons.ProcessFlowNodeState} oState  new value for property <code>state</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setState
 * @function
 */


/**
 * Getter for property <code>type</code>.
 * Type of the node.
 *
 * Default value is <code>Single</code>
 *
 * @return {sap.suite.ui.commons.ProcessFlowNodeType} the value of property <code>type</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getType
 * @function
 */

/**
 * Setter for property <code>type</code>.
 *
 * Default value is <code>Single</code> 
 *
 * @param {sap.suite.ui.commons.ProcessFlowNodeType} oType  new value for property <code>type</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setType
 * @function
 */


/**
 * Getter for property <code>children</code>.
 * Defines an array of children of the node.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any[]} the value of property <code>children</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getChildren
 * @function
 */

/**
 * Setter for property <code>children</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any[]} aChildren  new value for property <code>children</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setChildren
 * @function
 */


/**
 * Getter for property <code>titleAbbreviation</code>.
 * Title abbreviation is used in the compact mode.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>titleAbbreviation</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getTitleAbbreviation
 * @function
 */

/**
 * Setter for property <code>titleAbbreviation</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTitleAbbreviation  new value for property <code>titleAbbreviation</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setTitleAbbreviation
 * @function
 */


/**
 * Getter for property <code>stateText</code>.
 * Description of the state, for example "Status OK".
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>stateText</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getStateText
 * @function
 */

/**
 * Setter for property <code>stateText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sStateText  new value for property <code>stateText</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setStateText
 * @function
 */


/**
 * Getter for property <code>texts</code>.
 * The property contains the additional texts on the node. The expected type is array of strings. One array must not contain more than two strings. Additional strings in the array will be ignored.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string[]} the value of property <code>texts</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getTexts
 * @function
 */

/**
 * Setter for property <code>texts</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string[]} aTexts  new value for property <code>texts</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setTexts
 * @function
 */


/**
 * Getter for property <code>highlighted</code>.
 * The parameter defines if the node should be displayed in highlighted state.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>highlighted</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getHighlighted
 * @function
 */

/**
 * Setter for property <code>highlighted</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bHighlighted  new value for property <code>highlighted</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setHighlighted
 * @function
 */


/**
 * Getter for property <code>focused</code>.
 * The parameter defines if the node should be displayed in focus state.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>focused</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getFocused
 * @function
 */

/**
 * Setter for property <code>focused</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bFocused  new value for property <code>focused</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setFocused
 * @function
 */


/**
 * Getter for property <code>tag</code>.
 * The user-defined object which is returned back to the user by a node click event.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object} the value of property <code>tag</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getTag
 * @function
 */

/**
 * Setter for property <code>tag</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object} oTag  new value for property <code>tag</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setTag
 * @function
 */


/**
 * Getter for property <code>selected</code>.
 * The parameter defines if the node should be displayed in selected state.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>selected</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getSelected
 * @function
 */

/**
 * Setter for property <code>selected</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bSelected  new value for property <code>selected</code>
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#setSelected
 * @function
 */


/**
 * Reference to ProcessFlowNodes which appears before this ProcessFlowNode.
 * 
 * @return {string[]}
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#getParents
 * @function
 */

	
/**
 *
 * @param {string | sap.suite.ui.commons.ProcessFlowNode} vParent
 *    Id of a parent which becomes an additional target of this <code>parents</code> association.
 *    Alternatively, a parent instance may be given. 
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#addParent
 * @function
 */

/**
 * @param {int | string | sap.suite.ui.commons.ProcessFlowNode} vParent the parent to remove or its index or id
 * @return {string} the id of the removed parent or null
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#removeParent
 * @function
 */

/**
 * @return {string[]} an array with the ids of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#removeAllParents
 * @function
 */

	
/**
 * This event handler is executed when the user clicks the node title. This event is fired only when the title is clickable (isTitleClickable equals true).
 *
 * @name sap.suite.ui.commons.ProcessFlowNode#titlePress
 * @event
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use Press event instead ( click on the node)
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent The node identification.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'titlePress' event of this <code>sap.suite.ui.commons.ProcessFlowNode</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlowNode</code>.<br/> itself. 
 *  
 * This event handler is executed when the user clicks the node title. This event is fired only when the title is clickable (isTitleClickable equals true).
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlowNode</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use Press event instead ( click on the node)
 * @name sap.suite.ui.commons.ProcessFlowNode#attachTitlePress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'titlePress' event of this <code>sap.suite.ui.commons.ProcessFlowNode</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use Press event instead ( click on the node)
 * @name sap.suite.ui.commons.ProcessFlowNode#detachTitlePress
 * @function
 */

/**
 * Fire event titlePress to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> The node identification.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @protected
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use Press event instead ( click on the node)
 * @name sap.suite.ui.commons.ProcessFlowNode#fireTitlePress
 * @function
 */


/**
 * This event is fired when the user clicks on the node. However, this event is not fired if the titlePress event has been fired.
 *
 * @name sap.suite.ui.commons.ProcessFlowNode#press
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent The node identification.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'press' event of this <code>sap.suite.ui.commons.ProcessFlowNode</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlowNode</code>.<br/> itself. 
 *  
 * This event is fired when the user clicks on the node. However, this event is not fired if the titlePress event has been fired.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlowNode</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#attachPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'press' event of this <code>sap.suite.ui.commons.ProcessFlowNode</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowNode#detachPress
 * @function
 */

/**
 * Fire event press to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> The node identification.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlowNode} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ProcessFlowNode#firePress
 * @function
 */

// Start of sap/suite/ui/commons/ProcessFlowNode.js
/**
* Process Flow Node controller.
*/
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("sap.m.Text");

/* This is a current zoom level for the node. The level of details on the node is derived from this value.*/
sap.suite.ui.commons.ProcessFlowNode.prototype._zoomLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Two;
/* The consumer defined object which is returned back to the consumer with node click event.*/
sap.suite.ui.commons.ProcessFlowNode.prototype._tag = null;
/* The display state of the node. This property dictates the regular, highlighted, dimmed visual style of the control */
sap.suite.ui.commons.ProcessFlowNode.prototype._displayState = sap.suite.ui.commons.ProcessFlowDisplayState.Regular;
/* resource bundle for the localized strings */
sap.suite.ui.commons.ProcessFlowNode.prototype._oResBundle = null;
/* This property defines the folded corners for the single node control. The values true - means folded corner
false/null/undefined - means normal corner
*/

sap.suite.ui.commons.ProcessFlowNode.prototype._mergedLaneId = null;
sap.suite.ui.commons.ProcessFlowNode.prototype._foldedCorner = false;
sap.suite.ui.commons.ProcessFlowNode.prototype._foldedCornerControl = null;
sap.suite.ui.commons.ProcessFlowNode.prototype._parent = null;
sap.suite.ui.commons.ProcessFlowNode.prototype._headerControl = null;
sap.suite.ui.commons.ProcessFlowNode.prototype._stateTextControl = null;
sap.suite.ui.commons.ProcessFlowNode.prototype._iconControl = null;
sap.suite.ui.commons.ProcessFlowNode.prototype._text1Control = null;
sap.suite.ui.commons.ProcessFlowNode.prototype._text2Control = null;
sap.suite.ui.commons.ProcessFlowNode.prototype._navigationFocus = false;
sap.suite.ui.commons.ProcessFlowNode.prototype._sMouseEvents = " mousedown mouseup mouseenter mouseleave ";
sap.suite.ui.commons.ProcessFlowNode.prototype._sMouseTouchEvents = (sap.ui.Device.support.touch) ? 'saptouchstart saptouchcancel touchstart touchend' : '';

if (sap.ui.Device.browser.msie) {
  sap.suite.ui.commons.ProcessFlowNode.prototype._grabCursorClass = "sapSuiteUiGrabCursorIEPF";
  sap.suite.ui.commons.ProcessFlowNode.prototype._grabbingCursorClass = "sapSuiteUiGrabbingCursorIEPF";
} else {
  sap.suite.ui.commons.ProcessFlowNode.prototype._grabCursorClass = "sapSuiteUiGrabCursorPF";
  sap.suite.ui.commons.ProcessFlowNode.prototype._grabbingCursorClass = "sapSuiteUiGrabbingCursorPF";
}
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeHoverClass = "sapSuiteUiCommonsProcessFlowNodeHover";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeActiveClass = "sapSuiteUiCommonsProcessFlowNodeActive";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodePlannedClass = "sapSuiteUiCommonsProcessFlowNodeStatePlanned";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodePlannedClassIdentifier = "." + sap.suite.ui.commons.ProcessFlowNode.prototype._nodePlannedClass;
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeFCHoverClass = "sapSuiteUiCommonsProcessFlowFoldedCornerNodeHover";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeFCActiveClass = "sapSuiteUiCommonsProcessFlowFoldedCornerNodeActive";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeFCIconHoverClass = "sapSuiteUiCommonsProcessFlowFoldedCornerNodeIconHover";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedClass = "sapSuiteUiCommonsProcessFlowNodeAggregated";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedHoveredClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedHovered";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedDimmedClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmed";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedFocusedClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedFocused";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedPressedClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedPressed";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedDimmedPressedClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedPressed";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedDimmedHoveredClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedHovered";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedZoomLevel4";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedHoveredClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedHoveredZoomLevel4";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedPressedClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedPressedZoomLevel4";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedDimmedClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedZoomLevel4";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedFocusedClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedFocusedZoomLevel4";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedDimmedPressedClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedPressedZoomLevel4";
sap.suite.ui.commons.ProcessFlowNode.prototype._nodeAggregatedDimmedHoveredClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedHoveredZoomLevel4";

/* =========================================================== */
/* Life-cycle Handling                                         */
/* =========================================================== */

/**
 * ProcessFlowNode initial function
 */
sap.suite.ui.commons.ProcessFlowNode.prototype.init = function () {
  sap.ui.core.IconPool.addIcon("context-menu", "businessSuite", "PFBusinessSuiteInAppSymbols", "e02b", true);
  if (!this._oResBundle) {
    this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
  }
};

/**
 * Destroys all created controls.
 */
sap.suite.ui.commons.ProcessFlowNode.prototype.exit = function () {
  if (this._foldedCornerControl) {
    this._foldedCornerControl.destroy();
    this._foldedCornerControl = null;
  }
  if (this._headerControl) {
    this._headerControl.destroy();
    this._headerControl = null;
  }
  if (this._stateTextControl) {
    this._stateTextControl.destroy();
    this._stateTextControl = null;
  }
  if (this._iconControl) {
    this._iconControl.destroy();
    this._iconControl = null;
  }
  if (this._text1Control) {
    this._text1Control.destroy();
    this._text1Control = null;
  }
  if (this._text2Control) {
    this._text2Control.destroy();
    this._text2Control = null;
  }
  this.$().unbind(this._sMouseEvents, this._handleEvents);
  if (sap.ui.Device.support.touch) {
    this.$().unbind(this._sMouseTouchEvents, this._handleEvents);
  }
};

/**
 * The event binding must be removed to avoid memory leaks
 */
sap.suite.ui.commons.ProcessFlowNode.prototype.onBeforeRendering = function () {
  this.$().unbind(this._sMouseEvents, this._handleEvents);
  if (sap.ui.Device.support.touch) {
    this.$().unbind(this._sMouseTouchEvents, this._handleEvents);
  }
};

/**
 * Handles the onAfterRendering event.
 */
sap.suite.ui.commons.ProcessFlowNode.prototype.onAfterRendering = function () {
  this._sMouseEvents = this._sMouseEvents.concat(' ', this._sMouseTouchEvents);
  this.$().bind(this._sMouseEvents, jQuery.proxy(this._handleEvents, this));
};

/* =========================================================== */
/* Event Handling                                              */
/* =========================================================== */

/**
 * Handles the click event.
 *
 * @private
 * @param {sap.ui.base.Event} oEvent
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._handleClick = function (oEvent) {
  // If the ID includes 'title', it is a title click event.
  if (this._getDisplayState() === sap.suite.ui.commons.ProcessFlowDisplayState.Dimmed ||
    this._getDisplayState() === sap.suite.ui.commons.ProcessFlowDisplayState.DimmedFocused) {
    jQuery.sap.log.info("Event ignored, node in dimmend state.");
  }
  else {
    if (this._parent) {
      if (oEvent.target.id.indexOf("title") >= 0 && this.getIsTitleClickable()) {
        this._parent.fireNodeTitlePress(this);
      }
      else {
        this._parent.fireNodePress(this);
      }
      // Changes the focus from previous node to the current one.
      this.getParent()._changeNavigationFocus(this.getParent()._getLastNavigationFocusElement(), this);
    }
  }
  if (oEvent && !oEvent.isPropagationStopped()) {
    oEvent.stopPropagation();
  }
  if (oEvent && !oEvent.isImmediatePropagationStopped()) {
    oEvent.stopImmediatePropagation();
  }
};

/**
 * Handles the onClick event.
 *
 * @private
 * @param {sap.ui.base.Event} oEvent
 */
sap.suite.ui.commons.ProcessFlowNode.prototype.onclick = function (oEvent) {
  if (oEvent && !oEvent.isDefaultPrevented()) {
    oEvent.preventDefault();
  }
  this._handleClick(oEvent);
};

/**
 * General event handler.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._handleEvents = function (oEvent) {
  var $ThisChildren = this.$().find('*');
  var $ThisAttribute = this.$().attr('id');
  var isFoldedCorner = this._getFoldedCorner();
  var oScrollContainer = this.getParent();
  if (oEvent && !oEvent.isDefaultPrevented()) {
    oEvent.preventDefault();
  }
  // If the node is aggregated, adjust the CSS classes for aggregated nodes
  if (this.getType() === sap.suite.ui.commons.ProcessFlowNodeType.Aggregated) {
    this._adjustClassesForAggregation(oEvent);
  }
  switch (oEvent.type) {
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseDown:
      this.$().removeClass(this._nodeHoverClass).addClass(this._nodeActiveClass);
      $ThisChildren.removeClass(this._nodeHoverClass).addClass(this._nodeActiveClass);
      if (isFoldedCorner) {
        jQuery('#' + $ThisAttribute).removeClass(this._nodeFCHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
        jQuery('div[id^=' + $ThisAttribute + '][id$=-corner-container]').removeClass(this._nodeFCIconHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
        jQuery('span[id^=' + $ThisAttribute + '][id$=-corner-icon]').removeClass(this._nodeFCIconHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
      }
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseUp:
      if (oScrollContainer.$().hasClass(this._grabbingCursorClass)) {
        oScrollContainer.$().removeClass(this._grabbingCursorClass);
      }
      this.$().removeClass(this._nodeActiveClass).addClass(this._nodeHoverClass);
      $ThisChildren.removeClass(this._nodeActiveClass).addClass(this._nodeHoverClass);
      if (isFoldedCorner) {
        jQuery('#' + $ThisAttribute).removeClass(this._nodeHoverClass + ' ' + this._nodeFCActiveClass).addClass(this._nodeFCHoverClass);
        jQuery('div[id^=' + $ThisAttribute + '][id$=-corner-container]').removeClass(this._nodeHoverClass + ' ' + this._nodeFCActiveClass).addClass(this._nodeFCIconHoverClass);
        jQuery('span[id^=' + $ThisAttribute + '][id$=-corner-icon]').removeClass(this._nodeHoverClass + ' ' + this._nodeFCActiveClass).addClass(this._nodeFCIconHoverClass);
      }
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseEnter:
      /* in case the cursor is in the "grabbing" state ( the user is scrolling and comes over the node) the cursor's state should not be changed to the pointer */
      if (!oScrollContainer.$().hasClass(this._grabbingCursorClass)) {
        this.$().addClass(this._nodeHoverClass);
        $ThisChildren.addClass(this._nodeHoverClass);
        this.$().find(this._nodePlannedClassIdentifier).find("*").addClass(this._nodePlannedClass);
        if (isFoldedCorner) {
          jQuery('#' + $ThisAttribute).removeClass(this._nodeHoverClass).addClass(this._nodeFCHoverClass);
          jQuery('div[id^=' + $ThisAttribute + '][id$=-corner-container]').removeClass(this._nodeHoverClass).addClass(this._nodeFCIconHoverClass);
          jQuery('span[id^=' + $ThisAttribute + '][id$=-corner-icon]').removeClass(this._nodeHoverClass).addClass(this._nodeFCIconHoverClass);
        }
      }
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseLeave:
      this.$().removeClass(this._nodeActiveClass + ' ' + this._nodeHoverClass);
      $ThisChildren.removeClass(this._nodeActiveClass + ' ' + this._nodeHoverClass);
      if (isFoldedCorner) {
        jQuery('#' + $ThisAttribute).removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCHoverClass);
        jQuery('div[id^=' + $ThisAttribute + '][id$=-corner-container]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCIconHoverClass);
        jQuery('span[id^=' + $ThisAttribute + '][id$=-corner-icon]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCIconHoverClass);
      }
      if (!oScrollContainer.$().hasClass(this._grabbingCursorClass)) {
        oScrollContainer.$().addClass(this._grabCursorClass);
      }
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.touchStart:
      if (sap.ui.Device.support.touch) {
        this.$().addClass(this._nodeActiveClass);
        $ThisChildren.addClass(this._nodeActiveClass);
        if (isFoldedCorner) {
          jQuery('#' + $ThisAttribute).removeClass(this._nodeActiveClass).addClass(this._nodeFCActiveClass);
          jQuery('div[id^=' + $ThisAttribute + '][id$=-corner-container]').removeClass(this._nodeActiveClass).addClass(this._nodeFCActiveClass);
          jQuery('span[id^=' + $ThisAttribute + '][id$=-corner-icon]').removeClass(this._nodeActiveClass).addClass(this._nodeFCActiveClass);
        }
      }
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.sapTouchStart:
      this.$().removeClass(this._nodeHoverClass).addClass(this._nodeActiveClass);
      $ThisChildren.removeClass(this._nodeHoverClass).addClass(this._nodeActiveClass);
      if (isFoldedCorner) {
        jQuery('#' + $ThisAttribute).removeClass(this._nodeFCHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
        jQuery('div[id^=' + $ThisAttribute + '][id$=-corner-container]').removeClass(this._nodeFCIconHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
        jQuery('span[id^=' + $ThisAttribute + '][id$=-corner-icon]').removeClass(this._nodeFCIconHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
      }
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.touchEnd:
      if (sap.ui.Device.support.touch) {
        this.$().removeClass(this._nodeActiveClass + ' ' + this._nodeHoverClass);
        $ThisChildren.removeClass(this._nodeActiveClass + ' ' + this._nodeHoverClass);
        if (isFoldedCorner) {
          jQuery('#' + $ThisAttribute).removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCHoverClass);
          jQuery('div[id^=' + $ThisAttribute + '][id$=-corner-container]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCIconHoverClass);
          jQuery('span[id^=' + $ThisAttribute + '][id$=-corner-icon]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCIconHoverClass);
        }
      }
      this._handleClick(oEvent);
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.sapTouchCancel:
      this.$().removeClass(this._nodeActiveClass).addClass(this._nodeHoverClass);
      $ThisChildren.removeClass(this._nodeActiveClass).addClass(this._nodeHoverClass);
      if (isFoldedCorner) {
        jQuery('#' + $ThisAttribute).removeClass(this._nodeFCActiveClass + ' ' + this._nodeHoverClass).addClass(this._nodeFCHoverClass);
        jQuery('div[id^=' + $ThisAttribute + '][id$=-corner-container]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeHoverClass).addClass(this._nodeFCIconHoverClass);
        jQuery('span[id^=' + $ThisAttribute + '][id$=-corner-icon]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeHoverClass).addClass(this._nodeFCIconHoverClass);
      }
      break;
  }
};

/* =========================================================== */
/* Getter/Setter private methods                               */
/* =========================================================== */

/**
 * Sets the artificial laneId of a merged lane as hidden property. If it's not set here, the property is false.
 *
 * @private
 * @param {laneId}
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._setMergedLaneId = function (laneId) {
   this._mergedLaneId = laneId;
};

/**
 * Setter for the parent flow control. It is used to propagate the onNodeTitlePresses event.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlow} oControl
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._setParentFlow = function (oControl) {
  this._parent = oControl;
};

/**
 * Getter for folded corner
 *
 * @private
 * @returns {sap.ui.core.Icon}
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._getFoldedCornerControl = function () {
  if (this._foldedCornerControl) {
    this._foldedCornerControl.destroy();
  }
  this._foldedCornerControl = new sap.ui.core.Icon({
    id: this.getId() + "-corner-icon",
    src: sap.ui.core.IconPool.getIconURI("context-menu", "businessSuite"),
    visible: true
  });
  this._foldedCornerControl.addStyleClass("sapUiIconPointer");

  switch (this._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      this._foldedCornerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode1ZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      this._foldedCornerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode1ZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      this._foldedCornerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode1ZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      this._foldedCornerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode1ZoomLevel4");
      break;
  }
  this._foldedCornerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode1");

  return this._foldedCornerControl;
};

/**
 * Gets header control.
 *
 * @private
 * @returns {sap.m.Text}
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._getHeaderControl = function () { // EXC_SAP_006_1
  if (this._headerControl) {
    this._headerControl.destroy();
  }

  var iLinesCount = 0;
  var sWidth = "";
  var bVisible = true;
  var sText = this.getTitle();

  switch (this._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      iLinesCount = 3;
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      iLinesCount = 3;
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      iLinesCount = 2;
      sText = this.getTitleAbbreviation();
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      sText = "";
      iLinesCount = 0;
      sWidth = "0px";
      bVisible = false;
      break;
  }
  this._headerControl = new sap.m.Text({
    id: this.getId() + "-nodeid-anchor-title",
    text: sText,
    visible: bVisible,
    wrapping: true,
    width: sWidth,
    maxLines: iLinesCount
  });
  if (this.getIsTitleClickable()) {
    this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TitleClickable");
  }
  switch (this._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel4");
      break;
  }
  this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3Title");
  return this._headerControl;
};

/**
 * Gets icon control.
 *
 * @private
 * @returns {sap.ui.core.Icon}
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._getIconControl = function () { // EXC_SAP_006_1
  if (this._iconControl) {
    this._iconControl.destroy();
  }
  var sSrc = null;
  var bVisible = true;

  // request (Dec 2014): display icon even when there's no stateText
  switch (this.getState()) {
    case sap.suite.ui.commons.ProcessFlowNodeState.Positive:
      sSrc = "sap-icon://message-success";
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Negative:
    case sap.suite.ui.commons.ProcessFlowNodeState.PlannedNegative:
      sSrc = "sap-icon://message-error";
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Planned:
      sSrc = null; // latest request: do not display state icon, was "sap-icon://to-be-reviewed"
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Neutral:
      sSrc = "sap-icon://process";
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Critical:
      sSrc = "sap-icon://message-warning";
      break;
  }
  this._iconControl = new sap.ui.core.Icon({
    id: this.getId() + "-icon",
    src: sSrc,
    visible: bVisible
  });
  this._iconControl.addStyleClass("sapUiIconPointer");

  // correct RTL behaviour for state icon
  var bRtl = sap.ui.getCore().getConfiguration().getRTL();

  if (bRtl) {
    this._iconControl.addStyleClass("sapUiIconSuppressMirrorInRTL");
  }
  switch (this._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      var sIconAlignStyle = "sapSuiteUiCommonsProcessFlowNode3StateIconLeft";

      if (bRtl) {
        sIconAlignStyle = "sapSuiteUiCommonsProcessFlowNode3StateIconRight";
      }
      this._iconControl.addStyleClass(sIconAlignStyle);
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIconCenter");
      break;
  }
  switch (this._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel4");
      break;
  }
  this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIcon");
  return this._iconControl;
};

/**
 * Gets state text control.
 *
 * @private
 * @returns {sap.m.Text}
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._getStateTextControl = function () { // EXC_SAP_006_1, EXC_JSHINT_047
  if (this._stateTextControl) {
    this._stateTextControl.destroy();
  }
  var iLinesCount = 2;
  var sWidth = "";
  var bVisible = true;
  var oState = this.getState();
  var sText = (oState === sap.suite.ui.commons.ProcessFlowNodeState.Planned) ? "" : this.getStateText(); // latest request: do not display state text for planned state
  if (oState === sap.suite.ui.commons.ProcessFlowNodeState.PlannedNegative && sText.length === 0) {
    //set default status text for status PlannedNegative when no text is provided
    sText = "Planned Negative";
  }
  // number of lines
  switch (this._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      iLinesCount = 2;
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      sText = "";
      iLinesCount = 0;
      sWidth = "0px";
      bVisible = false;
      break;
  }
  this._stateTextControl = new sap.m.Text({
    id: this.getId() + "-stateText",
    text: sText,
    visible: bVisible,
    wrapping: true,
    width: sWidth,
    maxLines: iLinesCount
  });
  switch (oState) {
    case sap.suite.ui.commons.ProcessFlowNodeState.Positive:
      this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StatePositive");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Negative:
      this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNodeStateNegative");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Planned:
      this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StatePlanned");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Neutral:
      this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateNeutral");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.PlannedNegative:
      this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StatePlanned");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Critical:
      this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateCritical");
      break;
  }
  switch (this._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel4");
      break;
  }
  this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateText");
  return this._stateTextControl;
};

/**
* Gets zoom level.
*
* @private
* @returns {object}
*/
sap.suite.ui.commons.ProcessFlowNode.prototype._getZoomLevel = function () {
  return this._zoomLevel;
};

/**
 * Sets zoom level.
 *
 * @private
 * @param {object} zoomLevel
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._setZoomLevel = function (zoomLevel) {
  this._zoomLevel = zoomLevel;
};

sap.suite.ui.commons.ProcessFlowNode.prototype._setNavigationFocus = function (navigationFocus) {
  this._navigationFocus = navigationFocus;
};

sap.suite.ui.commons.ProcessFlowNode.prototype._getNavigationFocus = function () {
  return this._navigationFocus;
};

/**
 * Sets folded corner.
 *
 * @private
 * @param {Boolean} foldedCorner
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._setFoldedCorner = function (foldedCorner) {
  this._foldedCorner = foldedCorner;
};

/**
 * Gets folded corner.
 *
 * @private
 * @returns {Boolean}
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._getFoldedCorner = function () {
  return this._foldedCorner;
};

/**
 * Sets tag.
 *
 * @private
 * @param {object} newTag
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._setTag = function (newTag) {
  this._tag = newTag;
};

/**
 * Gets tag.
 *
 * @private
 * @returns {object}
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._getTag = function () {
  return this._tag;
};

/**
 * Sets to dimmed state.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._setDimmedState = function () {
  var bIsFocused = this.getFocused();
  var bIsHighlighted = this.getHighlighted();
  var bIsSelected = this.getSelected();

  if (bIsHighlighted || bIsSelected) {
    throw new Error("Cannot set highlighed or selected node to dimmed state" + this.getNodeId());
  }
  this._displayState = sap.suite.ui.commons.ProcessFlowDisplayState.Dimmed;

  if (bIsFocused) {
    this._displayState = sap.suite.ui.commons.ProcessFlowDisplayState.DimmedFocused;
  }
};

/**
 * Sets the highlighted nodes to the regular state.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._setRegularState = function () {
  this._displayState = sap.suite.ui.commons.ProcessFlowDisplayState.Regular;
};

/**
 * Returns the lane of current ProcessFlowNode.
 *
 * @private
 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader} Lane of current node
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._getLane = function () {
  var oProcessFlow = this.getParent();
  var oLane = null;
  if (oProcessFlow) {
    oLane = oProcessFlow._getLane(this.getLaneId());
  }
  return oLane;
};

/**
 * Returns a value that indicates if the current node is dimmed or not.
 *
 * @private
 * @returns {Boolean} true if the current node is dimmed, false if the current node is not dimmed
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._getDimmed = function()  {
  if (this._displayState === sap.suite.ui.commons.ProcessFlowDisplayState.Dimmed ||
      this._displayState === sap.suite.ui.commons.ProcessFlowDisplayState.DimmedFocused) {
    return true;
  } else {
    return false;
  }
};

/* =========================================================== */
/* Helper methods                                              */
/* =========================================================== */

/**
 * Returns the ARIA details text for the current Process Flow Node.
 *
 * @private
 * @returns {String} ARIA details
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._getAriaText = function () {
  var iParentsCount = this.getParents().length;

  var iChildrenCount = 0;
  if (this._hasChildren()) {
    iChildrenCount = this.getChildren().length;
  }

  var sLaneText = "";
  var oLane = this._getLane();
  if (oLane) {
    sLaneText = oLane.getText();
    if (!sLaneText) {
      sLaneText = this._oResBundle.getText('PF_VALUE_UNDEFINED');
    }
  }

  var sContentText = "";
  var contentTexts = this.getTexts();
  if (contentTexts) {
    for (var i in contentTexts) {
      if (contentTexts[i]) {
        var valueText = contentTexts[i].concat(", ");
        sContentText = sContentText.concat(valueText);
      }
    }
    //Removes the last character which is a ' '
    sContentText = sContentText.slice(0, -1);
  }

  var sTitleText = this.getTitle();
  if (!sTitleText) {
    sTitleText = this._oResBundle.getText('PF_VALUE_UNDEFINED');
  }

  var sStateValueText = this.getState();
  if (!sStateValueText) {
    sStateValueText = this._oResBundle.getText('PF_VALUE_UNDEFINED');
  }

  var sStateText = this.getStateText();
  if (this.getState() === sap.suite.ui.commons.ProcessFlowNodeState.Planned) {
    sStateText = "";
  }

  var sAggregatedText = "";
  if (this.getType() === sap.suite.ui.commons.ProcessFlowNodeType.Aggregated) {
    sAggregatedText = this._oResBundle.getText("PF_ARIA_TYPE");
  }

  var sAriaDetails = this._oResBundle.getText('PF_ARIA_NODE', [sTitleText, sStateValueText, sStateText, sLaneText, sContentText, iParentsCount, iChildrenCount, sAggregatedText]);
  return sAriaDetails;
};

/**
 * Based on the focused and highlighted property, we define the display state.
 *
 * @private
 * @returns {object}
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._getDisplayState = function () {
  var bIsFocused = this.getFocused();
  var bIsHighlighted = this.getHighlighted();
  var bIsSelected = this.getSelected();

  //Dimmed is set externally via _setDimmedState function
  if (this._displayState === sap.suite.ui.commons.ProcessFlowDisplayState.Dimmed ||
      this._displayState === sap.suite.ui.commons.ProcessFlowDisplayState.DimmedFocused) {
    return this._displayState;
  }

  if (bIsSelected) {
    if (bIsHighlighted) {
      if (bIsFocused) {
        this._displayState = sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlightedFocused;
      } else {
        this._displayState = sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlighted;
      }
    } else if (bIsFocused) {
      this._displayState = sap.suite.ui.commons.ProcessFlowDisplayState.SelectedFocused;
    } else {
      this._displayState = sap.suite.ui.commons.ProcessFlowDisplayState.Selected;
    }
  } else if (bIsFocused && bIsHighlighted) {
    this._displayState = sap.suite.ui.commons.ProcessFlowDisplayState.HighlightedFocused;
  }
  else if (bIsFocused) {
    this._displayState = sap.suite.ui.commons.ProcessFlowDisplayState.RegularFocused;
  }
  else if (bIsHighlighted) {
    this._displayState = sap.suite.ui.commons.ProcessFlowDisplayState.Highlighted;
  }
  else { // It cannot stay in focused or highlighted mode if there is no such flag.
    if (this._displayState == sap.suite.ui.commons.ProcessFlowDisplayState.HighlightedFocused ||
        this._displayState == sap.suite.ui.commons.ProcessFlowDisplayState.RegularFocused ||
        this._displayState == sap.suite.ui.commons.ProcessFlowDisplayState.Highlighted ||
        this._displayState == sap.suite.ui.commons.ProcessFlowDisplayState.Selected) {
      this._setRegularState();
    }
  }

  return this._displayState;
};

/**
 * creates internal text control.
 *
 * @private
 * @param {String} textId
 * @param {String} textToDisplay
 * @param {sap.m.Text} oControl
 * @returns {sap.m.Text}
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._createTextControlInternal = function (textId, textToDisplay, oControl) {
  if (oControl) {
    oControl.destroy();
  }

  var iLinesCount = 2;
  var sWidth = "";
  var bVisible = true;
  var sText = textToDisplay;

  switch (this._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      iLinesCount = 2;
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      iLinesCount = 0;
      sWidth = "0px";
      bVisible = false;
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      sText = "";
      iLinesCount = 0;
      sWidth = "0px";
      bVisible = false;
      break;
  }
  if (this.getState) {
    oControl = new sap.m.Text({
      id: this.getId() + textId,
      text: sText,
      visible: bVisible,
      wrapping: true,
      width: sWidth,
      maxLines: iLinesCount
    });
  }
  return oControl;
};

/**
 * creates text1 control.
 *
 * @private
 * @returns {sap.m.Text}
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._createText1Control = function () {
  var sTextToDisplay = this.getTexts();

  if (sTextToDisplay && sTextToDisplay.length > 0) {
    sTextToDisplay = sTextToDisplay[0];
  }
  this._text1Control = this._createTextControlInternal("-text1-control", sTextToDisplay, this._text1Control);

  switch (this._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextWithGapZoomLevel1");
      this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextWithGapZoomLevel2");
      this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel4");
      break;
  }
  this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3Text");
  return this._text1Control;
};

/**
 * creates text2 control.
 *
 * @private
 * @returns {sap.m.Text}
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._createText2Control = function () {
  var sTextToDisplay = this.getTexts();

  if (sTextToDisplay && sTextToDisplay.length > 1) {
    sTextToDisplay = sTextToDisplay[1];
  }
  else {
    sTextToDisplay = "";
  }
  this._text2Control = this._createTextControlInternal("-text2-control", sTextToDisplay, this._text2Control);

  switch (this._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      this._text2Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      this._text2Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      this._text2Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      this._text2Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel4");
      break;
  }
  this._text2Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3Text");
  return this._text2Control;
};

/**
 * Adds/removes the CSS classes for aggregated nodes for each type of event.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._adjustClassesForAggregation = function (oEvent) {
  // List with the focused states
  var aFocusedStates = [sap.suite.ui.commons.ProcessFlowDisplayState.RegularFocused,
                       sap.suite.ui.commons.ProcessFlowDisplayState.HighlightedFocused,
                       sap.suite.ui.commons.ProcessFlowDisplayState.DimmedFocused];
  // List with the dimmed states
  var aDimmedStates = [sap.suite.ui.commons.ProcessFlowDisplayState.DimmedFocused,
                      sap.suite.ui.commons.ProcessFlowDisplayState.Dimmed];

  switch (oEvent.type) {
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseDown:
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.touchStart:
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.sapTouchStart:
      addAggregatedPressedClasses(this);
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseUp:
      removeAggregatedPressedClasses(this);
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.sapTouchCancel:
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.touchEnd:
      removeAggregatedPressedClasses(this);
      removeAggregatedHoveredClasses(this);
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseEnter:
      addAggregatedHoveredClasses(this);
      break;
    case sap.suite.ui.commons.ProcessFlow._mouseEvents.mouseLeave:
      removeAggregatedPressedClasses(this);
      removeAggregatedHoveredClasses(this);
      break;
  }

  /**
   * Adds the CSS classes for pressed status (mouse down).
   */
  function addAggregatedPressedClasses(that) {
    if (that._getZoomLevel() === sap.suite.ui.commons.ProcessFlowZoomLevel.Four) {
      // If the node is dimmed
      if ((jQuery.inArray(that._getDisplayState(), aDimmedStates)) >= 0) {
        that.$().removeClass(that._nodeAggregatedDimmedHoveredClassZoomLevel4).addClass(that._nodeAggregatedDimmedPressedClassZoomLevel4);
      } else {
        that.$().removeClass(that._nodeAggregatedClassZoomLevel4).removeClass(that._nodeAggregatedHoveredClassZoomLevel4).addClass(that._nodeAggregatedPressedClassZoomLevel4);
      }
    } else {
      // If the node is dimmed
      if ((jQuery.inArray(that._getDisplayState(), aDimmedStates)) >= 0) {
        that.$().removeClass(that._nodeAggregatedDimmedHoveredClass).addClass(that._nodeAggregatedDimmedPressedClass);
      } else {
        that.$().removeClass(that._nodeAggregatedClass).removeClass(that._nodeAggregatedHoveredClass).addClass(that._nodeAggregatedPressedClass);
      }
    }
  }

  /**
   * Removes the CSS classes for pressed status (mouse up or mouse leave).
   */
  function removeAggregatedPressedClasses(that) {
    // If the node is focused
    if ((jQuery.inArray(that._getDisplayState(), aFocusedStates)) >= 0 && (that.$().hasClass(that._nodeAggregatedPressedClass) || that.$().hasClass(that._nodeAggregatedPressedClassZoomLevel4))) {
      if (that._getZoomLevel() === sap.suite.ui.commons.ProcessFlowZoomLevel.Four) {
        that.$().removeClass(that._nodeAggregatedPressedClassZoomLevel4).addClass(that._nodeAggregatedFocusedClassZoomLevel4);
      } else {
        that.$().removeClass(that._nodeAggregatedPressedClass).addClass(that._nodeAggregatedFocusedClass);
      }
    }
    // If the node is dimmed
    else if (that.$().hasClass(that._nodeAggregatedDimmedPressedClass) || that.$().hasClass(that._nodeAggregatedDimmedPressedClassZoomLevel4)) {
      if (that._getZoomLevel() === sap.suite.ui.commons.ProcessFlowZoomLevel.Four) {
        that.$().removeClass(that._nodeAggregatedDimmedPressedClassZoomLevel4).addClass(that._nodeAggregatedDimmedHoveredClassZoomLevel4);
      } else {
        that.$().removeClass(that._nodeAggregatedDimmedPressedClass).addClass(that._nodeAggregatedDimmedHoveredClass);
      }
    }
    // If the node is in regular state
    else if (that.$().hasClass(that._nodeAggregatedPressedClass) || that.$().hasClass(that._nodeAggregatedPressedClassZoomLevel4)) {
      if (that._getZoomLevel() === sap.suite.ui.commons.ProcessFlowZoomLevel.Four) {
        that.$().removeClass(that._nodeAggregatedPressedClassZoomLevel4).addClass(that._nodeAggregatedClassZoomLevel4);
      } else {
        that.$().removeClass(that._nodeAggregatedPressedClass).addClass(that._nodeAggregatedClass);
      }
    }
  }

  /**
   * Adds the CSS classes for hovered status (mouse-enter).
   */
  function addAggregatedHoveredClasses(that) {
    // If the node is dimmed
    if ((jQuery.inArray(that._getDisplayState(), aDimmedStates)) >= 0) {
      if (that._getZoomLevel() === sap.suite.ui.commons.ProcessFlowZoomLevel.Four) {
        that.$().removeClass(that._nodeAggregatedDimmedClassZoomLevel4).addClass(that._nodeAggregatedDimmedHoveredClassZoomLevel4);
      } else {
        that.$().removeClass(that._nodeAggregatedDimmedClass).addClass(that._nodeAggregatedDimmedHoveredClass);
      }
    } else {
      if (that._getZoomLevel() === sap.suite.ui.commons.ProcessFlowZoomLevel.Four) {
        that.$().addClass(that._nodeAggregatedHoveredClassZoomLevel4);
      } else {
        that.$().addClass(that._nodeAggregatedHoveredClass);
      }
    }
  }

  /**
   * Removes the CSS classes for hovered status (mouse-leave).
   */
  function removeAggregatedHoveredClasses(that) {
    // If the node is dimmed
    if ((jQuery.inArray(that._getDisplayState(), aDimmedStates)) >= 0) {
      if (that._getZoomLevel() === sap.suite.ui.commons.ProcessFlowZoomLevel.Four) {
        that.$().removeClass(that._nodeAggregatedDimmedHoveredClassZoomLevel4).addClass(that._nodeAggregatedDimmedClassZoomLevel4);
      } else {
        that.$().removeClass(that._nodeAggregatedDimmedHoveredClass).addClass(that._nodeAggregatedDimmedClass);
      }
    } else {
      if (that._getZoomLevel() === sap.suite.ui.commons.ProcessFlowZoomLevel.Four) {
        that.$().removeClass(that._nodeAggregatedHoveredClassZoomLevel4);
      } else {
        that.$().removeClass(that._nodeAggregatedHoveredClass);
      }
    }
  }
};

/**
 * Checks if current node contains children.
 *
 * @private
 * @returns {boolean} Value which shows if the ProcessFlowNode has children or not
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._hasChildren = function () {
  var aChildren = this.getChildren();
  if (aChildren && aChildren.length > 0) {
    return true;
  }
  return false;
};

/**
 * Checks if the current node contains a children with the specified nodeId.
 *
 * @private
 * @param {String} childrenNodeId The children node Id which is looked for
 * @returns {boolean} If the current node has a children with the specified node Id or not
 */
sap.suite.ui.commons.ProcessFlowNode.prototype._hasChildrenWithNodeId = function (childrenNodeId) {
  var aChildren = this.getChildren();
  if (aChildren && aChildren.length > 0) {
    for (var i = 0; i < aChildren.length; i++) {
      if ((typeof aChildren[i] === 'object' && aChildren[i].nodeId === childrenNodeId) ||
          aChildren[i] === childrenNodeId) {
        return true;
      }
    }
  }
  return false;
};

/* =========================================================== */
/* Public methods                                              */
/* =========================================================== */

/**
 * Overwrites the getter method for property laneId. It returns the artificially merged laneId, if the node is in such a lane.
 * Otherwise it returns the laneId set in the model.
 *
 * @public
 *
 */
sap.suite.ui.commons.ProcessFlowNode.prototype.getLaneId = function () {
  if (this._mergedLaneId) {
    return this._mergedLaneId;
  } else {
    return this.getProperty("laneId");
  }
};