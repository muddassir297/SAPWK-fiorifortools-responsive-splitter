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

// Provides control sap.suite.ui.commons.TimelineItem.
jQuery.sap.declare("sap.suite.ui.commons.TimelineItem");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new TimelineItem.
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
 * <li>{@link #getDateTime dateTime} : any</li>
 * <li>{@link #getFilterValue filterValue} : string</li>
 * <li>{@link #getIcon icon} : string</li>
 * <li>{@link #getIconTooltip iconTooltip} : string</li>
 * <li>{@link #getMaxCharacters maxCharacters} : int</li>
 * <li>{@link #getReplyCount replyCount} : int</li>
 * <li>{@link #getStatus status} : string</li>
 * <li>{@link #getTitle title} : string</li>
 * <li>{@link #getText text} : string</li>
 * <li>{@link #getUserName userName} : string</li>
 * <li>{@link #getUserNameClickable userNameClickable} : boolean (default: false)</li>
 * <li>{@link #getUserPicture userPicture} : sap.ui.core.URI</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getCustomAction customAction} : sap.ui.core.CustomData[]</li>
 * <li>{@link #getCustomReply customReply} : sap.ui.core.Control</li>
 * <li>{@link #getEmbeddedControl embeddedControl} : sap.ui.core.Control</li>
 * <li>{@link #getReplyList replyList} : sap.m.List</li>
 * <li>{@link #getSuggestionItems suggestionItems} : sap.m.StandardListItem[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.suite.ui.commons.TimelineItem#event:userNameClicked userNameClicked} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.TimelineItem#event:replyPost replyPost} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.TimelineItem#event:replyListOpen replyListOpen} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.TimelineItem#event:customActionClicked customActionClicked} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.TimelineItem#event:suggest suggest} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.TimelineItem#event:suggestionItemSelected suggestionItemSelected} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * An entry posted on the timeline.
 * @extends sap.ui.core.Control
 * @version 1.46.0
 *
 * @constructor
 * @public
 * @name sap.suite.ui.commons.TimelineItem
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.suite.ui.commons.TimelineItem", { metadata : {

	publicMethods : [
		// methods
		"setCustomMessage"
	],
	library : "sap.suite.ui.commons",
	properties : {

		/**
		 * Date and time value of the timeline post. This value must be in one of the following formats:
		 * <ul>
		 * <li> A valid instance of the <code>Date</code> object. </li>
		 * <li> An integer representing Unix time (also known as POSIX or Epoch time) in milliseconds. </li>
		 * <li> A string with an integer representing Unix time in milliseconds. </li>
		 * <li> A string that contains <code>Date([number])</code>, where <code>[number]</code>
		 * represents Unix time in milliseconds. </li>
		 * </ul>
		 * If this property has any other format, the timeline will try to parse it using <code>Date.parse</code>.
		 * It is not recommended to use this functionality, as different web browsers implement this function differently,
		 * which may lead to unpredictable behavior.
		 */
		"dateTime" : {type : "any", group : "Misc", defaultValue : null},

		/**
		 * Text for the items filter name. This text will be used as the name of the items filter in the
		 * filter popover.
		 */
		"filterValue" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * Icon on the timeline axis that corresponds to the point in time when the entry was posted.
		 * Posts can be displayed in chronological or reverse chronological order.
		 */
		"icon" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * Tooltip for an icon displayed on the timeline axis.
		 */
		"iconTooltip" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * The expand and collapse feature is set by default and uses 300 characters on mobile devices
		 * and 500 characters on desktop computers as limits. Based on these values, the text of the timeline post
		 * is collapsed once it reaches these character limits. In this case, only the specified number of characters
		 * is displayed. By clicking the More link, the entire text can be displayed. Clicking Less collapses the text.
		 * The application can set the value according to its needs.
		 */
		"maxCharacters" : {type : "int", group : "Behavior", defaultValue : null},

		/**
		 * Number of replies to a timeline post.
		 */
		"replyCount" : {type : "int", group : "Misc", defaultValue : null},

		/**
		 * Indicates the post status. The status affects the post's icon color. Supported values:
		 * <ul>
		 * <li> <code>Information</code> </li>
		 * <li> <code>Success</code> </li>
		 * <li> <code>Warning</code> </li>
		 * <li> <code>Error</code> </li>
		 * </ul>
		 */
		"status" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * Text shown in the post title right after the user name.
		 */
		"title" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * Text shown inside the timeline post.
		 */
		"text" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * User name shown in the post title.
		 */
		"userName" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * Makes the user name clickable. Clicking the name fires a userNameClicked event.
		 */
		"userNameClickable" : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * Picture shown next to the user name.
		 */
		"userPicture" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null}
	},
	aggregations : {

		/**
		 * Custom actions displayed as links in the links section of the post. The key must be unique
		 * for each link. Values are used as labels for the link. When a user clicks the link, a customActionClicked
		 * event is fired.
		 */
		"customAction" : {type : "sap.ui.core.CustomData", multiple : true, singularName : "customAction"}, 

		/**
		 * A UI5 control that acts as a custom reply dialog. It is used instead of the default reply dialog
		 * that is displayed when the user clicks the Reply link. Supports UI5 controls that have an openBy method,
		 * for example, the Popup control.
		 */
		"customReply" : {type : "sap.ui.core.Control", multiple : false}, 

		/**
		 * A UI5 control that is displayed as a timeline post's content instead of the default content (text).
		 * Examples of such a control include the Panel control and the List control.
		 */
		"embeddedControl" : {type : "sap.ui.core.Control", multiple : false}, 

		/**
		 * A list of replies related to the post.
		 */
		"replyList" : {type : "sap.m.List", multiple : false}, 

		/**
		 * Suggested posts.<br>
		 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
		 * @deprecated Since version 1.46.0. 
		 * Use the Group Feed Component instead.
		 */
		"suggestionItems" : {type : "sap.m.StandardListItem", multiple : true, singularName : "suggestionItem", deprecated: true}
	},
	events : {

		/**
		 * This event is fired when a user name is clicked in the post's header section.
		 */
		"userNameClicked" : {
			parameters : {

				/**
				 * A clickable UI element representing the user name.
				 */
				"uiElement" : {type : "sap.ui.core.Control"}
			}
		}, 

		/**
		 * This event is fired when the Reply button is clicked in the links section of a timeline post.
		 */
		"replyPost" : {
			parameters : {

				/**
				 * Content of the reply to the post.
				 */
				"value" : {type : "string"}
			}
		}, 

		/**
		 * This event is fired when the Reply link is clicked to open the reply dialog.
		 */
		"replyListOpen" : {}, 

		/**
		 * Fired when custom action link is clicked.
		 */
		"customActionClicked" : {
			parameters : {

				/**
				 * Value of the custom action.
				 */
				"value" : {type : "string"}, 

				/**
				 * Key of the custom action.
				 */
				"key" : {type : "string"}, 

				/**
				 * Link on which the user clicked.
				 */
				"linkObj" : {type : "sap.m.Link"}
			}
		}, 

		/**
		 * This event is fired when the user types text into the search field and showSuggestion
		 * is set to true. Changing the suggestItems aggregation will show the suggestions inside a popup.<br>
		 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
		 * @since 1.28.1
		 * @deprecated Since version 1.46.0. 
		 * Use the Group Feed Component instead.
		 */
		"suggest" : {deprecated: true,
			parameters : {

				/**
				 * The current value that has been typed into the search field.
				 */
				"suggestValue" : {type : "string"}
			}
		}, 

		/**
		 * This event is fired when a suggested post is selected in the search suggestions popup. This event
		 * is fired only when the showSuggestion propery is set to <code>true</code> and there are
		 * suggested posts shown in the suggestions popup.<br>
		 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
		 * @since 1.28.1
		 * @deprecated Since version 1.46.0. 
		 * Use the Group Feed Component instead.
		 */
		"suggestionItemSelected" : {deprecated: true,
			parameters : {

				/**
				 * The post selected in the suggestions popup.
				 */
				"selectedItem" : {type : "sap.ui.core.Item"}
			}
		}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.TimelineItem with name <code>sClassName</code> 
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
 * @name sap.suite.ui.commons.TimelineItem.extend
 * @function
 */

sap.suite.ui.commons.TimelineItem.M_EVENTS = {'userNameClicked':'userNameClicked','replyPost':'replyPost','replyListOpen':'replyListOpen','customActionClicked':'customActionClicked','suggest':'suggest','suggestionItemSelected':'suggestionItemSelected'};


/**
 * Getter for property <code>dateTime</code>.
 * Date and time value of the timeline post. This value must be in one of the following formats:
 * <ul>
 * <li> A valid instance of the <code>Date</code> object. </li>
 * <li> An integer representing Unix time (also known as POSIX or Epoch time) in milliseconds. </li>
 * <li> A string with an integer representing Unix time in milliseconds. </li>
 * <li> A string that contains <code>Date([number])</code>, where <code>[number]</code>
 * represents Unix time in milliseconds. </li>
 * </ul>
 * If this property has any other format, the timeline will try to parse it using <code>Date.parse</code>.
 * It is not recommended to use this functionality, as different web browsers implement this function differently,
 * which may lead to unpredictable behavior.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>dateTime</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getDateTime
 * @function
 */

/**
 * Setter for property <code>dateTime</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oDateTime  new value for property <code>dateTime</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setDateTime
 * @function
 */


/**
 * Getter for property <code>filterValue</code>.
 * Text for the items filter name. This text will be used as the name of the items filter in the
 * filter popover.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>filterValue</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getFilterValue
 * @function
 */

/**
 * Setter for property <code>filterValue</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sFilterValue  new value for property <code>filterValue</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setFilterValue
 * @function
 */


/**
 * Getter for property <code>icon</code>.
 * Icon on the timeline axis that corresponds to the point in time when the entry was posted.
 * Posts can be displayed in chronological or reverse chronological order.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>icon</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getIcon
 * @function
 */

/**
 * Setter for property <code>icon</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sIcon  new value for property <code>icon</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setIcon
 * @function
 */


/**
 * Getter for property <code>iconTooltip</code>.
 * Tooltip for an icon displayed on the timeline axis.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>iconTooltip</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getIconTooltip
 * @function
 */

/**
 * Setter for property <code>iconTooltip</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sIconTooltip  new value for property <code>iconTooltip</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setIconTooltip
 * @function
 */


/**
 * Getter for property <code>maxCharacters</code>.
 * The expand and collapse feature is set by default and uses 300 characters on mobile devices
 * and 500 characters on desktop computers as limits. Based on these values, the text of the timeline post
 * is collapsed once it reaches these character limits. In this case, only the specified number of characters
 * is displayed. By clicking the More link, the entire text can be displayed. Clicking Less collapses the text.
 * The application can set the value according to its needs.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {int} the value of property <code>maxCharacters</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getMaxCharacters
 * @function
 */

/**
 * Setter for property <code>maxCharacters</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {int} iMaxCharacters  new value for property <code>maxCharacters</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setMaxCharacters
 * @function
 */


/**
 * Getter for property <code>replyCount</code>.
 * Number of replies to a timeline post.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {int} the value of property <code>replyCount</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getReplyCount
 * @function
 */

/**
 * Setter for property <code>replyCount</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {int} iReplyCount  new value for property <code>replyCount</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setReplyCount
 * @function
 */


/**
 * Getter for property <code>status</code>.
 * Indicates the post status. The status affects the post's icon color. Supported values:
 * <ul>
 * <li> <code>Information</code> </li>
 * <li> <code>Success</code> </li>
 * <li> <code>Warning</code> </li>
 * <li> <code>Error</code> </li>
 * </ul>
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>status</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getStatus
 * @function
 */

/**
 * Setter for property <code>status</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sStatus  new value for property <code>status</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setStatus
 * @function
 */


/**
 * Getter for property <code>title</code>.
 * Text shown in the post title right after the user name.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>title</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getTitle
 * @function
 */

/**
 * Setter for property <code>title</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTitle  new value for property <code>title</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setTitle
 * @function
 */


/**
 * Getter for property <code>text</code>.
 * Text shown inside the timeline post.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>text</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getText
 * @function
 */

/**
 * Setter for property <code>text</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sText  new value for property <code>text</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setText
 * @function
 */


/**
 * Getter for property <code>userName</code>.
 * User name shown in the post title.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>userName</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getUserName
 * @function
 */

/**
 * Setter for property <code>userName</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sUserName  new value for property <code>userName</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setUserName
 * @function
 */


/**
 * Getter for property <code>userNameClickable</code>.
 * Makes the user name clickable. Clicking the name fires a userNameClicked event.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>userNameClickable</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getUserNameClickable
 * @function
 */

/**
 * Setter for property <code>userNameClickable</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bUserNameClickable  new value for property <code>userNameClickable</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setUserNameClickable
 * @function
 */


/**
 * Getter for property <code>userPicture</code>.
 * Picture shown next to the user name.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>userPicture</code>
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getUserPicture
 * @function
 */

/**
 * Setter for property <code>userPicture</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sUserPicture  new value for property <code>userPicture</code>
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setUserPicture
 * @function
 */


/**
 * Getter for aggregation <code>customAction</code>.<br/>
 * Custom actions displayed as links in the links section of the post. The key must be unique
 * for each link. Values are used as labels for the link. When a user clicks the link, a customActionClicked
 * event is fired.
 * 
 * @return {sap.ui.core.CustomData[]}
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getCustomAction
 * @function
 */


/**
 * Inserts a customAction into the aggregation named <code>customAction</code>.
 *
 * @param {sap.ui.core.CustomData}
 *          oCustomAction the customAction to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the customAction should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the customAction is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the customAction is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#insertCustomAction
 * @function
 */

/**
 * Adds some customAction <code>oCustomAction</code> 
 * to the aggregation named <code>customAction</code>.
 *
 * @param {sap.ui.core.CustomData}
 *            oCustomAction the customAction to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#addCustomAction
 * @function
 */

/**
 * Removes an customAction from the aggregation named <code>customAction</code>.
 *
 * @param {int | string | sap.ui.core.CustomData} vCustomAction the customAction to remove or its index or id
 * @return {sap.ui.core.CustomData} the removed customAction or null
 * @public
 * @name sap.suite.ui.commons.TimelineItem#removeCustomAction
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>customAction</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.CustomData[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.TimelineItem#removeAllCustomAction
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.CustomData</code> in the aggregation named <code>customAction</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.CustomData}
 *            oCustomAction the customAction whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.suite.ui.commons.TimelineItem#indexOfCustomAction
 * @function
 */
	

/**
 * Destroys all the customAction in the aggregation 
 * named <code>customAction</code>.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#destroyCustomAction
 * @function
 */


/**
 * Getter for aggregation <code>customReply</code>.<br/>
 * A UI5 control that acts as a custom reply dialog. It is used instead of the default reply dialog
 * that is displayed when the user clicks the Reply link. Supports UI5 controls that have an openBy method,
 * for example, the Popup control.
 * 
 * @return {sap.ui.core.Control}
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getCustomReply
 * @function
 */


/**
 * Setter for the aggregated <code>customReply</code>.
 * @param {sap.ui.core.Control} oCustomReply
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setCustomReply
 * @function
 */
	

/**
 * Destroys the customReply in the aggregation 
 * named <code>customReply</code>.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#destroyCustomReply
 * @function
 */


/**
 * Getter for aggregation <code>embeddedControl</code>.<br/>
 * A UI5 control that is displayed as a timeline post's content instead of the default content (text).
 * Examples of such a control include the Panel control and the List control.
 * 
 * @return {sap.ui.core.Control}
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getEmbeddedControl
 * @function
 */


/**
 * Setter for the aggregated <code>embeddedControl</code>.
 * @param {sap.ui.core.Control} oEmbeddedControl
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setEmbeddedControl
 * @function
 */
	

/**
 * Destroys the embeddedControl in the aggregation 
 * named <code>embeddedControl</code>.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#destroyEmbeddedControl
 * @function
 */


/**
 * Getter for aggregation <code>replyList</code>.<br/>
 * A list of replies related to the post.
 * 
 * @return {sap.m.List}
 * @public
 * @name sap.suite.ui.commons.TimelineItem#getReplyList
 * @function
 */


/**
 * Setter for the aggregated <code>replyList</code>.
 * @param {sap.m.List} oReplyList
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#setReplyList
 * @function
 */
	

/**
 * Destroys the replyList in the aggregation 
 * named <code>replyList</code>.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#destroyReplyList
 * @function
 */


/**
 * Getter for aggregation <code>suggestionItems</code>.<br/>
 * Suggested posts.<br>
 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
 * 
 * @return {sap.m.StandardListItem[]}
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#getSuggestionItems
 * @function
 */


/**
 * Inserts a suggestionItem into the aggregation named <code>suggestionItems</code>.
 *
 * @param {sap.m.StandardListItem}
 *          oSuggestionItem the suggestionItem to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the suggestionItem should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the suggestionItem is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the suggestionItem is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#insertSuggestionItem
 * @function
 */

/**
 * Adds some suggestionItem <code>oSuggestionItem</code> 
 * to the aggregation named <code>suggestionItems</code>.
 *
 * @param {sap.m.StandardListItem}
 *            oSuggestionItem the suggestionItem to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#addSuggestionItem
 * @function
 */

/**
 * Removes an suggestionItem from the aggregation named <code>suggestionItems</code>.
 *
 * @param {int | string | sap.m.StandardListItem} vSuggestionItem the suggestionItem to remove or its index or id
 * @return {sap.m.StandardListItem} the removed suggestionItem or null
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#removeSuggestionItem
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>suggestionItems</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.m.StandardListItem[]} an array of the removed elements (might be empty)
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#removeAllSuggestionItems
 * @function
 */

/**
 * Checks for the provided <code>sap.m.StandardListItem</code> in the aggregation named <code>suggestionItems</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.m.StandardListItem}
 *            oSuggestionItem the suggestionItem whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#indexOfSuggestionItem
 * @function
 */
	

/**
 * Destroys all the suggestionItems in the aggregation 
 * named <code>suggestionItems</code>.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#destroySuggestionItems
 * @function
 */


/**
 * This event is fired when a user name is clicked in the post's header section.
 *
 * @name sap.suite.ui.commons.TimelineItem#userNameClicked
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {sap.ui.core.Control} oControlEvent.getParameters.uiElement A clickable UI element representing the user name.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'userNameClicked' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself. 
 *  
 * This event is fired when a user name is clicked in the post's header section.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#attachUserNameClicked
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'userNameClicked' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#detachUserNameClicked
 * @function
 */

/**
 * Fire event userNameClicked to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'uiElement' of type <code>sap.ui.core.Control</code> A clickable UI element representing the user name.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.TimelineItem#fireUserNameClicked
 * @function
 */


/**
 * This event is fired when the Reply button is clicked in the links section of a timeline post.
 *
 * @name sap.suite.ui.commons.TimelineItem#replyPost
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {string} oControlEvent.getParameters.value Content of the reply to the post.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'replyPost' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself. 
 *  
 * This event is fired when the Reply button is clicked in the links section of a timeline post.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#attachReplyPost
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'replyPost' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#detachReplyPost
 * @function
 */

/**
 * Fire event replyPost to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'value' of type <code>string</code> Content of the reply to the post.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.TimelineItem#fireReplyPost
 * @function
 */


/**
 * This event is fired when the Reply link is clicked to open the reply dialog.
 *
 * @name sap.suite.ui.commons.TimelineItem#replyListOpen
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'replyListOpen' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself. 
 *  
 * This event is fired when the Reply link is clicked to open the reply dialog.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#attachReplyListOpen
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'replyListOpen' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#detachReplyListOpen
 * @function
 */

/**
 * Fire event replyListOpen to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.TimelineItem#fireReplyListOpen
 * @function
 */


/**
 * Fired when custom action link is clicked.
 *
 * @name sap.suite.ui.commons.TimelineItem#customActionClicked
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {string} oControlEvent.getParameters.value Value of the custom action.
 * @param {string} oControlEvent.getParameters.key Key of the custom action.
 * @param {sap.m.Link} oControlEvent.getParameters.linkObj Link on which the user clicked.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'customActionClicked' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself. 
 *  
 * Fired when custom action link is clicked.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#attachCustomActionClicked
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'customActionClicked' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TimelineItem#detachCustomActionClicked
 * @function
 */

/**
 * Fire event customActionClicked to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'value' of type <code>string</code> Value of the custom action.</li>
 * <li>'key' of type <code>string</code> Key of the custom action.</li>
 * <li>'linkObj' of type <code>sap.m.Link</code> Link on which the user clicked.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.TimelineItem#fireCustomActionClicked
 * @function
 */


/**
 * This event is fired when the user types text into the search field and showSuggestion
 * is set to true. Changing the suggestItems aggregation will show the suggestions inside a popup.<br>
 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
 *
 * @name sap.suite.ui.commons.TimelineItem#suggest
 * @event
 * @since 1.28.1
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {string} oControlEvent.getParameters.suggestValue The current value that has been typed into the search field.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'suggest' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself. 
 *  
 * This event is fired when the user types text into the search field and showSuggestion
 * is set to true. Changing the suggestItems aggregation will show the suggestions inside a popup.<br>
 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @since 1.28.1
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#attachSuggest
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'suggest' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @since 1.28.1
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#detachSuggest
 * @function
 */

/**
 * Fire event suggest to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'suggestValue' of type <code>string</code> The current value that has been typed into the search field.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @protected
 * @since 1.28.1
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#fireSuggest
 * @function
 */


/**
 * This event is fired when a suggested post is selected in the search suggestions popup. This event
 * is fired only when the showSuggestion propery is set to <code>true</code> and there are
 * suggested posts shown in the suggestions popup.<br>
 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
 *
 * @name sap.suite.ui.commons.TimelineItem#suggestionItemSelected
 * @event
 * @since 1.28.1
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {sap.ui.core.Item} oControlEvent.getParameters.selectedItem The post selected in the suggestions popup.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'suggestionItemSelected' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself. 
 *  
 * This event is fired when a suggested post is selected in the search suggestions popup. This event
 * is fired only when the showSuggestion propery is set to <code>true</code> and there are
 * suggested posts shown in the suggestions popup.<br>
 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.TimelineItem</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @since 1.28.1
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#attachSuggestionItemSelected
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'suggestionItemSelected' event of this <code>sap.suite.ui.commons.TimelineItem</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @public
 * @since 1.28.1
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#detachSuggestionItemSelected
 * @function
 */

/**
 * Fire event suggestionItemSelected to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'selectedItem' of type <code>sap.ui.core.Item</code> The post selected in the suggestions popup.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.TimelineItem} <code>this</code> to allow method chaining
 * @protected
 * @since 1.28.1
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.TimelineItem#fireSuggestionItemSelected
 * @function
 */


/**
 * Sets a custom message that is displayed above the post's header section.
 *
 * @name sap.suite.ui.commons.TimelineItem#setCustomMessage
 * @function
 * @param {string} sMsg
 *         Message text.
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */

// Start of sap/suite/ui/commons/TimelineItem.js
///**
// * This file defines behavior for the control,
// */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/m/ToolbarDesign",
	"sap/m/Link",
	"sap/m/TextArea",
	"sap/m/Popover",
	"sap/m/PlacementType",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/List",
	"sap/m/ListMode",
	"sap/m/StandardListItem",
	"sap/ui/Device",
	"sap/suite/ui/commons/util/ManagedObjectRegister",
	"sap/suite/ui/commons/util/DateUtils"
], function (Control, Text, Toolbar, ToolbarDesign, Link, TextArea, Popover, PlacementType, ToolbarSpacer, Button,
			 List, ListMode, StandardListItem, Device, ManagedObjectRegister, DateUtils) {
	"use strict";

	var TimelineItem = sap.suite.ui.commons.TimelineItem,
		resBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons"),
		STATUS_CLASS_MAP = {
			"Warning": "sapSuiteUiCommonsTimelineStatusWarning",
			"Error": "sapSuiteUiCommonsTimelineStatusError",
			"Success": "sapSuiteUiCommonsTimelineStatusSuccess",
			"Information": "sapSuiteUiCommonsTimelineStatusInformation"
		};

	TimelineItem.prototype.init = function () {
		this._customReply = false;
		this._objects = new ManagedObjectRegister();

		this._nMaxCharactersMobile = 500;
		this._nMaxCharactersDesktop = 800;

		this._sTextShowMore = resBundle.getText("TIMELINE_TEXT_SHOW_MORE");

		this._registerControls();
		this._registerPopup();

		//notch orientation
		this._orientation = "V";
	};

	/* =========================================================== */
	/* Public API */
	/* =========================================================== */
	/**
	 * Set custom message to display
	 * @param msg
	 */
	TimelineItem.prototype.setCustomMessage = function (msg) {
		this._objects.getInfoText().setText(msg);
		this._objects.getInfoBar().setVisible(msg && msg.length > 0);
		this.invalidate();
	};

	/* =========================================================== */
	/* Private methods*/
	/* =========================================================== */
	/**
	 * Override to fix scrollbar moving after new data are loaded
	 * @private
	 */
	TimelineItem.prototype.applyFocusInfo = function () {
		this.focus();

		// scroll to visible position when scrolling not to focused item - see _moveScrollBar
		this.getParent()._moveScrollBar(true);
	};

	/**
	 * Focus handling
	 * @returns {*}
	 * @private
	 */
	TimelineItem.prototype.getFocusDomRef = function () {
		return this.$("outline")[0];
	};

	/**
	 * Trigger after reply is pressed
	 * @private
	 */
	TimelineItem.prototype._replyPost = function () {
		var replyText = this._objects.getReplyInputArea().getValue();
		this.fireReplyPost({value: replyText});
	};

	/**
	 * Register popup window for complete message
	 * @private
	 */
	TimelineItem.prototype._registerPopup = function () {
		var that = this;

		// popover content
		this._objects.register("fullText", function () {
			var oText = new Text(that.getId() + "-fullText", {
				text: that.getText()
			});
			oText.addStyleClass("sapSuiteUiCommonsTimelineItemPopoverText");
			return oText;
		});

		this._objects.register("fullTextCloseIcon", function () {
			var oIcon = new sap.ui.core.Icon({
				src: "sap-icon://decline",
				press: function () {
					that._objects.getFullTextPopover().close();
				}
			});

			oIcon.addStyleClass("sapSuiteUiCommonsTimelineItemPopoverCloseIcon");
			return oIcon;

		});

		this._objects.register("fullTextPopover", function () {
			var oPopover = new Popover({
				placement: PlacementType.Bottom,
				showArrow: false,
				showHeader: true,
				contentMinWidth: '300px',
				contentWidth: '450px',
				endButton: that._objects.getFullTextCloseIcon(),
				resizable: true,
				title: resBundle.getText("TIMELINE_FULLTEXT_TITLE"),
				content: [that._objects.getFullText()]
			});

			oPopover.addStyleClass("sapSuiteUiCommonsTimelineItemShowMorePopover");
			return oPopover;
		});
	};

	/**
	 * Opens reply dialog after reply pressed
	 * @private
	 */
	TimelineItem.prototype._openReplyDialog = function () {
		if (this._customReply) {
			this.getCustomReply().openBy(this._objects.getReplyLink());
			this.fireReplyListOpen();
		} else {
			this.fireReplyListOpen();
			this._objects.getReplyInputArea().setValue('');
			this._oldReplyInputArea = '';

			this._list = this.getReplyList();

			if (this._list !== null) {
				// we want to prevent rerender timeline item so we need to remove this aggregation from it first with 'suppressinvalidation' true
				// otherwise addContent on popover would do it when switching parents (and you can't specify whether you want invalidate)
				this.setAggregation("replyList", null, true);
			 	this._objects.getReplyPop().addContent(this._list);
			}
			this._objects.getReplyPop().addContent(this._objects.getReplyInputArea());
			this._objects.getReplyPop().openBy(this._objects.getReplyLink());
		}
	};

	/**
	 * Call parent function if there is any parent defined. Usually timeline, but there may be cases when item is standalone.
	 * @returns {Return of set function}
	 * @private
	 */
	TimelineItem.prototype._callParentFn = function () {
		var args = Array.prototype.slice.call(arguments),
			fnName = args.shift(),
			parent = this.getParent();
		if (parent && (typeof parent[fnName] === "function")) {
			return parent[fnName].apply(parent, args);
		}
	};

	/**
	 * Return correct icon for grouping based on the settings
	 * @returns {string} Icon name
	 * @private
	 */
	TimelineItem.prototype._getCorrectGroupIcon = function () {
		var sIcon = "",
			fnIsDoubleSided = function () {
				return this.getParent() && this.getParent()._renderDblSided;
			}.bind(this),
			bIsGroupCollapsed = this._isGroupCollapsed();

		if (this._orientation === "H") {
			sIcon = "navigation-right-arrow";
			if (!bIsGroupCollapsed) {
				sIcon = this._callParentFn("_isLeftAlignment") || fnIsDoubleSided() ? "navigation-down-arrow" : "navigation-up-arrow";
			}
		} else {
			sIcon = "navigation-down-arrow";
			if (bIsGroupCollapsed) {
				sIcon = this._callParentFn("_isLeftAlignment") || fnIsDoubleSided() ? "navigation-right-arrow" : "navigation-left-arrow";
			}
		}

		return sIcon;
	};

	/**
	 * @param oEvent
	 * @private
	 */
	TimelineItem.prototype.onclick = function (oEvent) {
		var that = this,
			oIcon, $this, $icon, bIsCollapsed;
		// this check whether group header was clicked
		if (jQuery.sap.containsOrEquals(this.$("outline").get(0), oEvent.target)) {
			if (this._isGroupHeader) {
				oIcon = that._objects.getGroupCollapseIcon && that._objects.getGroupCollapseIcon();
				$this = that.$();
				$icon = oIcon.$();
				bIsCollapsed = that._isGroupCollapsed();

				if (bIsCollapsed) {
					$this.removeClass("sapSuiteUiCommonsTimelineGroupCollapsed");
					$this.addClass("sapSuiteUiCommonsTimelineGroupExpanded");
				} else {
					$this.addClass("sapSuiteUiCommonsTimelineGroupCollapsed");
					$this.removeClass("sapSuiteUiCommonsTimelineGroupExpanded");
				}

				that._performExpandCollapse(that._groupID);
				oIcon.setSrc(that._getCorrectGroupIcon());
			}
		}
	};

	/**
	 * Performs expand or collapse
	 * @param {string} sGroupID group for action
	 * @private
	 */
	TimelineItem.prototype._performExpandCollapse = function (sGroupID) {
		var fnSetHeightClass = function ($item, $corrector) {
				var $line = $item.find(".sapSuiteUiCommonsTimelineItemBarV"),
					sGroup, bGroupExpanded;
				if ($corrector.get(0)) {
					sGroup = $corrector.attr("groupId");
					bGroupExpanded = !this._isGroupCollapsed(sGroup);
					if (bGroupExpanded) {
						$line.addClass("sapSuiteUiCommonsTimelineGroupNextExpanded");
					} else {
						$line.removeClass("sapSuiteUiCommonsTimelineGroupNextExpanded");
					}
				}
			}.bind(this),
			fnSetGroupFlag = function () {
				if (this.getParent()) {
					this.getParent()._collapsedGroups[sGroupID] = !bIsExpand;
				};
			}.bind(this),
			$li = this.$(),
			bIsExpand = this._isGroupCollapsed(sGroupID),
			$parent = $li.parent(),
			$bar, $next, $prev, $lastChild;

		fnSetGroupFlag();
		// setup line classes
		if (this._orientation === "H") {
			$bar = this.$("line");
		} else {
			$bar = $li.find(".sapSuiteUiCommonsTimelineGroupHeaderBarWrapper");
			$next = $parent.next().children().first();
			$prev = $parent.prev().children(":visible:last");

			// fix previous item based on whether current item is expanded
			if ($prev.get(0)) {
				fnSetHeightClass($prev, $li);
			}

			if (bIsExpand) {
				// fix last item in case next group was changed while this one was closed (so it was not affected
				// by collapsing next group)
				$lastChild = $parent.children().last();
				fnSetHeightClass($lastChild, $next);
			} else {
				// first fix current item based on whether next item is expanded group
				fnSetHeightClass($li, $next);
			}
		}

		// expanded groups don't have visible lines
		bIsExpand ? $bar.hide() : $bar.show();

		// hide (show) all group items
		this._callParentFn("_performExpandCollapse", sGroupID, bIsExpand);
	};

	/**
	 * Return class if there is any status bound to item
	 * @returns {string} status color class
	 * @private
	 */
	TimelineItem.prototype._getStatusColorClass = function () {
		var status = this.getStatus();
		return STATUS_CLASS_MAP[status] || "";
	};

	/**
	 * Return icon displayed in timeline
	 * @returns {object} icon
	 * @private
	 */
	TimelineItem.prototype._getLineIcon = function () {
		var that = this,
			oIcon;
		this._objects.register("imageControl", function () {
			var src = "sap-icon://circle-task-2",
				isGroupHeader = that.getText() === "GroupHeader";

			if (!isGroupHeader) {
				src = that.getIcon() ? that.getIcon() : "activity-items";
			}

			oIcon = new sap.ui.core.Icon(that.getId() + '-icon', {
				src: src,
				tooltip: that.getIconTooltip()
			});

			oIcon.addStyleClass("sapSuiteUiCommonsTimelineBarIcon");

			return oIcon;
		});

		return this._objects.getImageControl();
	};

	/**
	 * Indicates whether this item is in collapsed group
	 * @param {string} sId Group id to test.
	 * @private
	 */
	TimelineItem.prototype._isGroupCollapsed = function (sId) {
		var oParent = this.getParent();
		sId = sId || this._groupID;

		return oParent && oParent._collapsedGroups && oParent._collapsedGroups[sId];
	};

	/**
	 * The first this._nMaxCollapsedLength characters of the text are shown in the collapsed form, the text string ends up
	 * with a complete word, the text string contains at least one word
	 *
	 * @private
	 */
	TimelineItem.prototype._getCollapsedText = function () {
		var sShortText = this.getText().substring(0, this._nMaxCollapsedLength);
		var nLastSpace = sShortText.lastIndexOf(" ");
		if (nLastSpace > 0) {
			this._sShortText = sShortText.substr(0, nLastSpace);
		} else {
			this._sShortText = sShortText;
		}
		return this._sShortText;
	};

	/**
	 * Opens popover with whole item's text
	 * @param {object} oShowMoreBtn Show more button control
	 * @private
	 */
	TimelineItem.prototype._toggleTextExpanded = function (oShowMoreBtn) {
		var $button = oShowMoreBtn.oSource.$(),
			$text = jQuery("#" + this.getId() + "-realtext"),
			buttonHeight = $button.height(),
			topButton = $button.position().top,
			topText = $text.parent().position().top,
			OFFSET = 10;

		this._objects.getFullText().setText(this.getText());

		// if the button is at the bottom of the page, we want to enforce minimal height of the popup window
		var iDefaultOffset = topText - topButton - buttonHeight - OFFSET,
			iWindowButtonDiff = jQuery(window).height() - $button.offset().top,
			CORRECTIONMARGIN = 200;
		if (iWindowButtonDiff < CORRECTIONMARGIN) {
			iDefaultOffset -= (CORRECTIONMARGIN - iWindowButtonDiff);
		};

		this._objects.getFullTextPopover().setOffsetY(Math.floor(iDefaultOffset));
		this._objects.getFullTextPopover().openBy(this._objects.getExpandButton());
	};

	/**
	 * Gets the link for expanding/collapsing the text
	 *
	 * @private
	 */
	TimelineItem.prototype._getButtonExpandCollapse = function () {
		var that = this;
		this._objects.register("expandButton", function () {
			return new Button(that.getId() + "-fullTextBtn", {
				text: that._sTextShowMore,
				press: that._toggleTextExpanded.bind(that)
			});
		});

		return this._objects.getExpandButton();
	};

	/**
	 * Checks if the text is expandable: If maxCharacters is empty the default values are used, which are 300 characters (
	 * on mobile devices) and 500 characters ( on tablet and desktop). Otherwise maxCharacters is used as a limit. Based on
	 * this value, the text of the FeedListItem is collapsed once the text reaches this limit.
	 *
	 * @private
	 */
	TimelineItem.prototype._checkTextIsExpandable = function () {
		this._nMaxCollapsedLength = this.getMaxCharacters();

		if (this._nMaxCollapsedLength === 0) {
			this._nMaxCollapsedLength = Device.system.phone ? this._nMaxCharactersMobile : this._nMaxCharactersDesktop;
		}

		return this.getText().length > this._nMaxCollapsedLength;
	};

	TimelineItem.prototype.onBeforeRendering = function () {
		var that = this;

		//when odata update happens, only once?
		if (!this._list) {
			this._list = this.getReplyList();
		}

		if (this.getReplyCount() > 0) {
			this._objects.getReplyLink().setText(resBundle.getText("TIMELINE_REPLY") + " (" + this.getReplyCount() + ")");
		} else if (this._list && this._list.getItems().length > 0) {
			this._objects.getReplyLink().setText(resBundle.getText("TIMELINE_REPLY") + " (" + this._list.getItems().length + ")");
		}

		this._objects.getSocialBar().removeAllContent();
		if (this._callParentFn("getEnableSocial")) {
			this._objects.getSocialBar().addContent(this._objects.getReplyLink());
		}

		this._actionList = this.getCustomAction();
		for (var i = 0; i < this._actionList.length; i++) {
			var key = this._actionList[i].getKey();
			var value = this._actionList[i].getValue();
			var actionLink = new Link({
				text: value,
				tooltip: key
			});
			actionLink.addStyleClass("sapSuiteUiCommonsTimelineItemActionLink");
			actionLink.attachPress({"value": value, "key": key},
				function (oEvent, oData) {
					that.fireCustomActionClicked({
						"value": oData.value,
						"key": oData.key,
						"linkObj": this
					});
				});

			this._objects.getSocialBar().addContent(actionLink);
		}
	};

	/**
	 * Creates image control for timeline item picture
	 * @returns {object} image
	 * @private
	 */
	TimelineItem.prototype._getUserPictureControl = function () {
		var sUserPicture = this.getUserPicture(),
			sSize = "2rem",
			that = this;

		if (!sUserPicture) {
			return null;
		}

		this._objects.register("userPictureControl", function () {
			var oImage = sap.m.ImageHelper.getImageControl(that.getId() + "-userPictureControl", null, that, {
				height: sSize,
				width: sSize,
				src: sUserPicture,
				tooltip: resBundle.getText("TIMELINE_USER_PICTURE")
			});

			// Jam Can't deal with that
			oImage.setDensityAware(false);
			return oImage;
		});

		this._objects.getUserPictureControl().setSrc(sUserPicture);

		return this._objects.getUserPictureControl();
	};

	/**
	 * Creates clickable link for user name (if set)
	 * @returns {object} link
	 * @private
	 */
	TimelineItem.prototype._getUserNameLinkControl = function () {
		var that = this;

		if (this.getUserNameClickable()) {
			this._objects.register("userNameLink", function () {
				var link = new Link(that.getId() + "-userNameLink", {
					text: that.getUserName(),
					tooltip: that.getUserName(),
					press: function (oEvent) {
						that.fireUserNameClicked({uiElement: this});
					}
				});
				link.addStyleClass("sapUiSelectable");
				return link;
			});

			this._objects.getUserNameLink().setText(this.getUserName());
			this._objects.getUserNameLink().setTooltip(this.getUserName());
			return this._objects.getUserNameLink();
		}
	};

	/**
	 * Register basic controls for item
	 * @private
	 */
	TimelineItem.prototype._registerControls = function () {
		var that = this;
		this._objects.register("infoText", new Text(this.getId() + "-infoText", {
			maxLines: 1,
			width: "100%"
		}));

		this._objects.register("infoBar", new Toolbar(this.getId() + "-infoBar", {
			id: this.getId() + "-customMessageInfoBar",
			content: [this._objects.getInfoText()],
			design: ToolbarDesign.Info,
			visible: false
		}));

		this._objects.register("replyLink", function () {
			var link = new Link(that.getId() + "-replyLink", {
				text: resBundle.getText("TIMELINE_REPLY"),
				press: [that._openReplyDialog, that]
			});
			link.addStyleClass("sapSuiteUiCommonsTimelineItemActionLink");

			return link;
		});

		this._objects.register("socialBar", function () {
			var socialBar = new Toolbar(that.getId() + "-socialBar", {});
			socialBar.data("sap-ui-fastnavgroup", null);
			return socialBar;
		});

		this._objects.register("replyInputArea", new TextArea(this.getId() + "-replyInputArea", {
			height: "4rem",
			width: "100%"
		}));

		this._objects.register("replyPop", function () {
			return new Popover(that.getId() + "-replyPop", {
				initialFocus: that._objects.getReplyInputArea(),
				title: resBundle.getText("TIMELINE_REPLIES"),
				placement: PlacementType.Vertical,
				footer: new Toolbar({
					content: [//this._replyInput,
						new ToolbarSpacer(),
						new Button(that.getId() + "-replyButton", {
							text: resBundle.getText("TIMELINE_REPLY"),
							press: function () {
								that._replyPost();
								that._objects.getReplyPop().close();
							}
						})]
				}),
				contentHeight: "15rem",
				contentWidth: "20rem"
			})
		});
	};

	/**
	 * @private
	 */
	TimelineItem.prototype.exit = function () {
		this._objects.destroyAll();
	};

	/**
	 * Returns date time property without trying it parse if value is of type string.
	 * @returns {Date} Date property
	 */
	TimelineItem.prototype.getDateTimeWithoutStringParse = function () {
		var oDateTime = this.getProperty("dateTime");
		return DateUtils.parseDate(oDateTime, false);
	};

	/* =========================================================== */
	/* Setters & getters*/
	/* =========================================================== */
	TimelineItem.prototype.setCustomReply = function (oReply) {
		if (oReply) {
			this._customReply = true;
			this.setAggregation("customReply", oReply, true);

		} else {
			this._customReply = false;
		}
	};

	TimelineItem.prototype.setReplyList = function (replyList) {
		if (replyList === null) return;
		//this method get called  implicitly when open popup, thus need to check if its null
		this.setAggregation("replyList", replyList, true);

		// after update need to reset the focus
		var that = this;
		this.getReplyList().attachUpdateFinished(function (oEvent) {
			var oFocusRef = that._objects.getReplyInputArea().getDomRef("inner");
			if (oFocusRef) { //if popup already open , reset focus
				jQuery(oFocusRef.id).focus();
			}
		});
	};

	TimelineItem.prototype.getDateTime = function () {
		var oDateTime = this.getProperty("dateTime");
		return DateUtils.parseDate(oDateTime);
	};

	return TimelineItem;
});
