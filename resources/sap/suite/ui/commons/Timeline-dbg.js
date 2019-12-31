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

// Provides control sap.suite.ui.commons.Timeline.
jQuery.sap.declare("sap.suite.ui.commons.Timeline");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new Timeline.
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
 * <li>{@link #getAlignment alignment} : sap.suite.ui.commons.TimelineAlignment (default: sap.suite.ui.commons.TimelineAlignment.Right)</li>
 * <li>{@link #getAxisOrientation axisOrientation} : sap.suite.ui.commons.TimelineAxisOrientation (default: sap.suite.ui.commons.TimelineAxisOrientation.Vertical)</li>
 * <li>{@link #getData data} : object</li>
 * <li>{@link #getEnableAllInFilterItem enableAllInFilterItem} : boolean (default: true)</li>
 * <li>{@link #getEnableBackendFilter enableBackendFilter} : boolean (default: true)</li>
 * <li>{@link #getEnableBusyIndicator enableBusyIndicator} : boolean (default: true)</li>
 * <li>{@link #getEnableDoubleSided enableDoubleSided} : boolean (default: false)</li>
 * <li>{@link #getEnableModelFilter enableModelFilter} : boolean (default: true)</li>
 * <li>{@link #getEnableScroll enableScroll} : boolean (default: true)</li>
 * <li>{@link #getEnableSocial enableSocial} : boolean (default: false)</li>
 * <li>{@link #getFilterTitle filterTitle} : string</li>
 * <li>{@link #getForceGrowing forceGrowing} : boolean (default: false)</li>
 * <li>{@link #getGroup group} : boolean (default: false)</li>
 * <li>{@link #getGroupBy groupBy} : string</li>
 * <li>{@link #getGroupByType groupByType} : sap.suite.ui.commons.TimelineGroupType (default: sap.suite.ui.commons.TimelineGroupType.None)</li>
 * <li>{@link #getGrowing growing} : boolean (default: true)</li>
 * <li>{@link #getGrowingThreshold growingThreshold} : int (default: 5)</li>
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize (default: '')</li>
 * <li>{@link #getLazyLoading lazyLoading} : boolean (default: false)</li>
 * <li>{@link #getNoDataText noDataText} : string</li>
 * <li>{@link #getScrollingFadeout scrollingFadeout} : sap.suite.ui.commons.TimelineScrollingFadeout (default: sap.suite.ui.commons.TimelineScrollingFadeout.None)</li>
 * <li>{@link #getShowFilterBar showFilterBar} : boolean (default: true)</li>
 * <li>{@link #getShowHeaderBar showHeaderBar} : boolean (default: true)</li>
 * <li>{@link #getShowIcons showIcons} : boolean (default: true)</li>
 * <li>{@link #getShowSearch showSearch} : boolean (default: true)</li>
 * <li>{@link #getShowSuggestion showSuggestion} : boolean (default: true)</li>
 * <li>{@link #getShowTimeFilter showTimeFilter} : boolean (default: true)</li>
 * <li>{@link #getSort sort} : boolean (default: true)</li>
 * <li>{@link #getSortOldestFirst sortOldestFirst} : boolean (default: false)</li>
 * <li>{@link #getTextHeight textHeight} : string (default: '')</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: '100%')</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getContent content} : sap.suite.ui.commons.TimelineItem[]</li>
 * <li>{@link #getCustomFilter customFilter} : sap.ui.core.Control</li>
 * <li>{@link #getFilterList filterList} : sap.suite.ui.commons.TimelineFilterListItem[]</li>
 * <li>{@link #getSuggestionItems suggestionItems} : sap.m.StandardListItem[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.suite.ui.commons.Timeline#event:addPost addPost} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.Timeline#event:customMessageClosed customMessageClosed} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.Timeline#event:filterOpen filterOpen} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.Timeline#event:filterSelectionChange filterSelectionChange} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.Timeline#event:grow grow} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.Timeline#event:itemFiltering itemFiltering} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.Timeline#event:select select} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.Timeline#event:suggest suggest} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.Timeline#event:suggestionItemSelected suggestionItemSelected} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The timeline control shows entries (such as objects, events, or posts) in chronological order.
 * <br>A common use case is to provide information about changes to an object, or events related to an
 * object.
 * These entries can be generated by the system (for example, value XY changed from A to B), or added manually.
 * <br>There are two distinct variants of the timeline: basic and social. The basic timeline is read-only,
 * while the social timeline offers a high level of interaction and collaboration, and is integrated within SAP
 * Jam.
 * @extends sap.ui.core.Control
 * @version 1.46.0
 *
 * @constructor
 * @public
 * @name sap.suite.ui.commons.Timeline
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.suite.ui.commons.Timeline", { metadata : {

	publicMethods : [
		// methods
		"adjustUI", "getCurrentFilter", "getGroups", "setCustomFilterMessage", "setCustomGrouping", "setCustomModelFilter", "setCurrentFilter", "setCurrentSearch", "setCurrentTimeFilter", "setModelFilter", "setModelFilterMessage"
	],
	library : "sap.suite.ui.commons",
	properties : {

		/**
		 * Defines the alignment of timeline posts relative to the timeline axis. This option can be
		 * used
		 * for single-sided timelines only. If the axisOrientation property is set to <code>
		 * Horizontal</code>, the <code>Right</code> value is interpreted as bottom alignment and
		 * the
		 * <code>Left</code> value as top alignment.
		 */
		"alignment" : {type : "sap.suite.ui.commons.TimelineAlignment", group : "Misc", defaultValue : sap.suite.ui.commons.TimelineAlignment.Right},

		/**
		 * Defines the orientation of the timeline. Can be set to <code>Vertical</code> or
		 * <code>Horizontal</code>.
		 */
		"axisOrientation" : {type : "sap.suite.ui.commons.TimelineAxisOrientation", group : "Misc", defaultValue : sap.suite.ui.commons.TimelineAxisOrientation.Vertical},

		/**
		 * Data for the Timeline control.
		 * @deprecated Since version 1.46.0. 
		 * As of version 1.46, this property was replaced by JSONModel context binding.
		 */
		"data" : {type : "object", group : "Misc", defaultValue : null, deprecated: true},

		/**
		 * Enables to add 'All' at the beginning of the filter list.
		 * @deprecated Since version 1.46.0. 
		 * The filter list now includes a Select All check box, so the All radio button is
		 * no longer required. This property is ignored.
		 */
		"enableAllInFilterItem" : {type : "boolean", group : "Behavior", defaultValue : true, deprecated: true},

		/**
		 * Enables fetching data from backend instead of deriving filter values from the frontend
		 * values (displayed list). <br>
		 * As of version 1.46, replaced by {@link sap.suite.ui.commons.Timeline#getEnableModelFilter}.
		 * @deprecated Since version 1.46.0. 
		 * Use the enableModelFilter property instead.
		 */
		"enableBackendFilter" : {type : "boolean", group : "Misc", defaultValue : true, deprecated: true},

		/**
		 * When this property is set to <code>true</code>, the timeline displays a busy
		 * indicator when
		 * loading data. This busy indicator blocks the interaction with the items until the data loading is
		 * complete.
		 * It is strongly recommended to use this option. Loading data without a busy indicator may confuse the
		 * users.
		 */
		"enableBusyIndicator" : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * If set to <code>true</code>, timeline posts are displayed on both sides of the
		 * timeline axis.
		 */
		"enableDoubleSided" : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * Enables filtering directly on the binding level. <br>
		 * If set to <code>true</code>, all filters are translated into the filters in the model
		 * binding.
		 * When the OData model is used, the filtering is performed on the backend side. This option is strongly
		 * recommended. <br>
		 * If set to <code>false</code>, all entries from the model need to be fetched before they can
		 * be
		 * filtered on the frontend side. Please be aware that the <code>growingThreshold</code>
		 * property
		 * determines how many entries can be rendered. Timeline requests all entries from the model before it
		 * performs
		 * the filtering.
		 * Some models may have internal limits for the number of entries that can be used in bindings. Such limits
		 * can be
		 * set using {@link sap.ui.model.Model#setSizeLimit}.
		 * @since 1.46.0
		 */
		"enableModelFilter" : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * If set to <code>true</code>, the Timeline control has its own scroll bar,
		 * with the scrolling taking place within the Timeline control itself. Scrolling is required if you want to
		 * enable the lazyLoading property.
		 */
		"enableScroll" : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * Adds a <i>Reply</i> link to the posts on a social timeline that allows users
		 * to reply to posts. When a user adds a reply, an event is fired. This event should be handled by
		 * external code.
		 */
		"enableSocial" : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * Title for the data filter. When a filter is applied, this title is displayed in the
		 * message strip along with the filter name.
		 */
		"filterTitle" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * If set to <code>true</code>, the <i>Show More</i> button is displayed
		 * when the user scrolls along the timeline axis.
		 */
		"forceGrowing" : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * Groups the timeline posts by year.<br>
		 * As of version 1.46, replaced by {@link sap.suite.ui.commons.Timeline#getGroupByType}.
		 * @deprecated Since version 1.46.0. 
		 * Use the groupByType property instead.
		 */
		"group" : {type : "boolean", group : "Misc", defaultValue : false, deprecated: true},

		/**
		 * Groups the timeline posts by a field. Only fields that contain date values are supported.
		 */
		"groupBy" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * Groups the timeline posts by a time period, including year, quarter, month, week, and day.
		 * If set to <code>None</code>, no grouping is applied. <br>
		 * If you specify a custom grouping function using the {@link sap.suite.ui.commons.Timeline#setCustomGrouping}
		 * method, this function overrides the groupByType property settings.
		 */
		"groupByType" : {type : "sap.suite.ui.commons.TimelineGroupType", group : "Misc", defaultValue : sap.suite.ui.commons.TimelineGroupType.None},

		/**
		 * If set to <code>true</code>, the timeline displays a limited number of posts
		 * with a button to show more. The displayed posts limit can be set using the growingThreshold property.<br>
		 * As of version 1.46, replaced by {@link sap.suite.ui.commons.Timeline#getGrowingThreshold}.
		 * @deprecated Since version 1.46.0. 
		 * Use the growingThreshold property instead, setting it to 0 to disable growing.
		 */
		"growing" : {type : "boolean", group : "Misc", defaultValue : true, deprecated: true},

		/**
		 * Number of posts requested from the server at a time. Each time when the timeline needs to load
		 * more posts, it will request exactly this amount. The number of posts displayed in the timeline is increased
		 * by this number. If set to <code>0</code>, all posts are fetched and displayed on the initial load.
		 */
		"growingThreshold" : {type : "int", group : "Misc", defaultValue : 5},

		/**
		 * Sets the height of the Timeline.
		 * @since 1.46.0
		 */
		"height" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : ''},

		/**
		 * Enables the Lazy Loading feature that automatically loads more posts as the user scrolls
		 * along the timeline axis. This feature works only when the enableScroll property is set to
		 * <code>true</code>. See also {@link sap.suite.ui.commons.Timeline#getEnableScroll}.
		 * @since 1.46.0
		 */
		"lazyLoading" : {type : "boolean", group : "Dimension", defaultValue : false},

		/**
		 * This text is displayed when the control has no data. The default value is loaded from the
		 * component resource bundle.
		 */
		"noDataText" : {type : "string", group : "Misc", defaultValue : null},

		/**
		 * If set to <code>Area</code>, the timeline fades into the visible area margin.
		 * If set to <code>AreaWithButtons</code>, the timeline fades into the visible area margin and
		 * scroll buttons are displayed.
		 * If set to <code>None</code>, the fading effect is not applied.
		 * This feature works only when the enableScroll property is set to
		 * <code>true</code>. See also {@link sap.suite.ui.commons.Timeline#getEnableScroll}.
		 * @since 1.46.0
		 */
		"scrollingFadeout" : {type : "sap.suite.ui.commons.TimelineScrollingFadeout", group : "Misc", defaultValue : sap.suite.ui.commons.TimelineScrollingFadeout.None},

		/**
		 * Sets the visibility of the filter in the timeline toolbar.<br>
		 * As of version 1.46, replaced by {@link sap.suite.ui.commons.Timeline#getShowHeaderBar}.
		 * @deprecated Since version 1.46.0. 
		 * Use the showHeaderBar property instead.
		 */
		"showFilterBar" : {type : "boolean", group : "Misc", defaultValue : true, deprecated: true},

		/**
		 * Shows the timeline toolbar with search and filter options.
		 */
		"showHeaderBar" : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * Shows an icon on the timeline axis as an anchor for each entry node. If set to
		 * <code>false</code>, all icons are replaced by dots.
		 */
		"showIcons" : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * Sets the search field visibility on the timeline toolbar.
		 */
		"showSearch" : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * If set to <code>true</code>, a suggest event is fired when the user enters text
		 * into the search field. Changing the suggestionItems aggregation in the suggest event listener will display
		 * suggestions inside a popup.<br>
		 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
		 * @since 1.26.1
		 * @deprecated Since version 1.46.0. 
		 * Use the Group Feed Component instead.
		 */
		"showSuggestion" : {type : "boolean", group : "Behavior", defaultValue : true, deprecated: true},

		/**
		 * Shows the time range filter in the filter menu.
		 */
		"showTimeFilter" : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * Indicates whether the data should be sorted. If set to <code>false</code> the data
		 * model's default sorting is applied.
		 */
		"sort" : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * Whether the oldest item will be displayed first.
		 */
		"sortOldestFirst" : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * Height of the timeline posts. It can be set to either of the following types of values:
		 * <ul>
		 * <li> Automatic &ndash; If set to <code>automatic</code>, the optimal post height is
		 * calculated automatically to fit the timeline height specified by the height parameter. This option works only in
		 * horizontal timelines and only when the timeline height is defined. In vertical timelines, this setting is
		 * ignored. </li>
		 * <li> Number &ndash; If set to a number, a corresponding number of text lines is displayed in every post.
		 * </li>
		 * <li> Pixels &ndash; If set to a number followed by <code>px</code>, such as
		 * <code>50px</code>, the closest number in lines is calculated and applied to the timeline posts,
		 * so that the post height corresponds to the specified number of pixels and the text lines are not cut off in the
		 * middle of a line.</li>
		 * <li> Any other valid {@link sap.ui.core.CSSSize CSSSize} value that is inserted into the text
		 * wrapper without being changed. </li>
		 * </ul>
		 */
		"textHeight" : {type : "string", group : "Misc", defaultValue : ''},

		/**
		 * Sets the width of the Timeline.
		 */
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'}
	},
	aggregations : {

		/**
		 * List of timeline posts.
		 */
		"content" : {type : "sap.suite.ui.commons.TimelineItem", multiple : true, singularName : "content"}, 

		/**
		 * A custom filter to be used instead of the default item filter. This control must have an <code>openBy</code>
		 * function that is used by the timeline to open the control.
		 */
		"customFilter" : {type : "sap.ui.core.Control", multiple : false}, 

		/**
		 * Custom filter criteria for the items filter.
		 */
		"filterList" : {type : "sap.suite.ui.commons.TimelineFilterListItem", multiple : true, singularName : "filterList"}, 

		/**
		 * Items for suggestions.<br>
		 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
		 * @deprecated Since version 1.46.0. 
		 * Use the Group Feed Component instead.
		 */
		"suggestionItems" : {type : "sap.m.StandardListItem", multiple : true, singularName : "suggestionItem", deprecated: true}
	},
	events : {

		/**
		 * This event is fired when a new post is added.<br>
		 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
		 * @deprecated Since version 1.46.0. 
		 * Use the Group Feed Component instead.
		 */
		"addPost" : {deprecated: true,
			parameters : {

				/**
				 * Post message text.
				 */
				"value" : {type : "string"}
			}
		}, 

		/**
		 * This event is fired when the user clicks the Close button on a message strip.
		 */
		"customMessageClosed" : {}, 

		/**
		 * This event is fired when the user clicks the filter icon in the timeline toolbar and opens
		 * the filter.
		 */
		"filterOpen" : {}, 

		/**
		 * This event is fired when filtering is applied to timeline posts or when a search term
		 * is entered into the search field.
		 */
		"filterSelectionChange" : {
			parameters : {

				/**
				 * Type of filter that has changed, can be an item filter or a time range
				 * filter.
				 */
				"type" : {type : "sap.suite.ui.commons.TimelineFilterType"}, 

				/**
				 * Search term entered into the search field.
				 */
				"searchTerm" : {type : "string"}, 

				/**
				 * The first criteria selected in the filter criteria list (required for backward
				 * compatibility).
				 */
				"selectedItem" : {type : "string"}, 

				/**
				 * An array with all selected filter criteria.
				 */
				"selectedItems" : {type : "object"}, 

				/**
				 * An object specifying the start date (<code>from</code>)
				 * and the end date (<code>to</code>) of the time range.
				 */
				"timeKeys" : {type : "object"}, 

				/**
				 * Is set to <code>true</code> when this event is fired by clearing
				 * the filter.
				 */
				"clear" : {type : "boolean"}
			}
		}, 

		/**
		 * This event is fired when the "More" button is clicked.
		 */
		"grow" : {}, 

		/**
		 * This event is fired for every timeline post when data filtering is being applied. It
		 * indicates whether this post is included in the filtering and why. Can be used only when the enableModelFilter
		 * property is set to <code>false</code>.
		 */
		"itemFiltering" : {
			parameters : {

				/**
				 * Timeline post that is currently being filtered.
				 */
				"item" : {type : "sap.suite.ui.commons.TimelineItem"}, 

				/**
				 * Reasons why the post is being filtered. Empty if the post is not being filtered.
				 * There are three properties available in the object: <code>Search</code>,
				 * <code>Time</code>, and <code>Data</code>. You can call
				 * preventDefault to the event object to prevent the result.
				 */
				"reasons" : {type : "object"}, 

				/**
				 * Array with keys used for data filtering.
				 */
				"dataKeys" : {type : "object"}, 

				/**
				 * An object specifying the start date (<code>from</code>)
				 * and the end date (<code>to</code>) of the time range.
				 */
				"timeKeys" : {type : "object"}, 

				/**
				 * The text string that has been typed into the search field.
				 */
				"searchTerm" : {type : "string"}
			}
		}, 

		/**
		 * This event is fired when a timeline post is selected.
		 */
		"select" : {
			parameters : {

				/**
				 * The timeline post that is selected.
				 */
				"selectedItem" : {type : "sap.suite.ui.commons.TimelineItem"}
			}
		}, 

		/**
		 * This event is fired when the user enters text into the search field, in cases when the
		 * showSuggestion property is set to <code>true</code>. Changing the suggestionItems aggregation
		 * will show the suggestions inside a popup.
		 * @since 1.26.1
		 * @deprecated Since version 1.46.0. 
		 * Replaced by {@link sap.collaboration.components.feed.Component}.
		 */
		"suggest" : {deprecated: true,
			parameters : {

				/**
				 * The text string that has been typed into the search field.
				 */
				"suggestValue" : {type : "string"}
			}
		}, 

		/**
		 * This event is fired when a suggested post is selected in the suggestions popup list. This
		 * event is only fired when the showSuggestion property is set to <code>true</code> and there
		 * is at least one post in the suggestions popup list. See also the suggestionItems aggregation.
		 * @since 1.26.1
		 * @deprecated Since version 1.46.0. 
		 * Replaced by {@link sap.collaboration.components.feed.Component}.
		 */
		"suggestionItemSelected" : {deprecated: true,
			parameters : {

				/**
				 * The item selected in the suggestions popup.
				 */
				"selectedItem" : {type : "sap.ui.core.Item"}
			}
		}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.Timeline with name <code>sClassName</code> 
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
 * @name sap.suite.ui.commons.Timeline.extend
 * @function
 */

sap.suite.ui.commons.Timeline.M_EVENTS = {'addPost':'addPost','customMessageClosed':'customMessageClosed','filterOpen':'filterOpen','filterSelectionChange':'filterSelectionChange','grow':'grow','itemFiltering':'itemFiltering','select':'select','suggest':'suggest','suggestionItemSelected':'suggestionItemSelected'};


/**
 * Getter for property <code>alignment</code>.
 * Defines the alignment of timeline posts relative to the timeline axis. This option can be
 * used
 * for single-sided timelines only. If the axisOrientation property is set to <code>
 * Horizontal</code>, the <code>Right</code> value is interpreted as bottom alignment and
 * the
 * <code>Left</code> value as top alignment.
 *
 * Default value is <code>Right</code>
 *
 * @return {sap.suite.ui.commons.TimelineAlignment} the value of property <code>alignment</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getAlignment
 * @function
 */

/**
 * Setter for property <code>alignment</code>.
 *
 * Default value is <code>Right</code> 
 *
 * @param {sap.suite.ui.commons.TimelineAlignment} oAlignment  new value for property <code>alignment</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setAlignment
 * @function
 */


/**
 * Getter for property <code>axisOrientation</code>.
 * Defines the orientation of the timeline. Can be set to <code>Vertical</code> or
 * <code>Horizontal</code>.
 *
 * Default value is <code>Vertical</code>
 *
 * @return {sap.suite.ui.commons.TimelineAxisOrientation} the value of property <code>axisOrientation</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getAxisOrientation
 * @function
 */

/**
 * Setter for property <code>axisOrientation</code>.
 *
 * Default value is <code>Vertical</code> 
 *
 * @param {sap.suite.ui.commons.TimelineAxisOrientation} oAxisOrientation  new value for property <code>axisOrientation</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setAxisOrientation
 * @function
 */


/**
 * Getter for property <code>data</code>.
 * Data for the Timeline control.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object} the value of property <code>data</code>
 * @public
 * @deprecated Since version 1.46.0. 
 * As of version 1.46, this property was replaced by JSONModel context binding.
 * @name sap.suite.ui.commons.Timeline#getData
 * @function
 */

/**
 * Setter for property <code>data</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object} oData  new value for property <code>data</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * As of version 1.46, this property was replaced by JSONModel context binding.
 * @name sap.suite.ui.commons.Timeline#setData
 * @function
 */


/**
 * Getter for property <code>enableAllInFilterItem</code>.
 * Enables to add 'All' at the beginning of the filter list.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enableAllInFilterItem</code>
 * @public
 * @deprecated Since version 1.46.0. 
 * The filter list now includes a Select All check box, so the All radio button is
 * no longer required. This property is ignored.
 * @name sap.suite.ui.commons.Timeline#getEnableAllInFilterItem
 * @function
 */

/**
 * Setter for property <code>enableAllInFilterItem</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnableAllInFilterItem  new value for property <code>enableAllInFilterItem</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * The filter list now includes a Select All check box, so the All radio button is
 * no longer required. This property is ignored.
 * @name sap.suite.ui.commons.Timeline#setEnableAllInFilterItem
 * @function
 */


/**
 * Getter for property <code>enableBackendFilter</code>.
 * Enables fetching data from backend instead of deriving filter values from the frontend
 * values (displayed list). <br>
 * As of version 1.46, replaced by {@link sap.suite.ui.commons.Timeline#getEnableModelFilter}.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enableBackendFilter</code>
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the enableModelFilter property instead.
 * @name sap.suite.ui.commons.Timeline#getEnableBackendFilter
 * @function
 */

/**
 * Setter for property <code>enableBackendFilter</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnableBackendFilter  new value for property <code>enableBackendFilter</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the enableModelFilter property instead.
 * @name sap.suite.ui.commons.Timeline#setEnableBackendFilter
 * @function
 */


/**
 * Getter for property <code>enableBusyIndicator</code>.
 * When this property is set to <code>true</code>, the timeline displays a busy
 * indicator when
 * loading data. This busy indicator blocks the interaction with the items until the data loading is
 * complete.
 * It is strongly recommended to use this option. Loading data without a busy indicator may confuse the
 * users.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enableBusyIndicator</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getEnableBusyIndicator
 * @function
 */

/**
 * Setter for property <code>enableBusyIndicator</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnableBusyIndicator  new value for property <code>enableBusyIndicator</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setEnableBusyIndicator
 * @function
 */


/**
 * Getter for property <code>enableDoubleSided</code>.
 * If set to <code>true</code>, timeline posts are displayed on both sides of the
 * timeline axis.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>enableDoubleSided</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getEnableDoubleSided
 * @function
 */

/**
 * Setter for property <code>enableDoubleSided</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bEnableDoubleSided  new value for property <code>enableDoubleSided</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setEnableDoubleSided
 * @function
 */


/**
 * Getter for property <code>enableModelFilter</code>.
 * Enables filtering directly on the binding level. <br>
 * If set to <code>true</code>, all filters are translated into the filters in the model
 * binding.
 * When the OData model is used, the filtering is performed on the backend side. This option is strongly
 * recommended. <br>
 * If set to <code>false</code>, all entries from the model need to be fetched before they can
 * be
 * filtered on the frontend side. Please be aware that the <code>growingThreshold</code>
 * property
 * determines how many entries can be rendered. Timeline requests all entries from the model before it
 * performs
 * the filtering.
 * Some models may have internal limits for the number of entries that can be used in bindings. Such limits
 * can be
 * set using {@link sap.ui.model.Model#setSizeLimit}.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enableModelFilter</code>
 * @public
 * @since 1.46.0
 * @name sap.suite.ui.commons.Timeline#getEnableModelFilter
 * @function
 */

/**
 * Setter for property <code>enableModelFilter</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnableModelFilter  new value for property <code>enableModelFilter</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @since 1.46.0
 * @name sap.suite.ui.commons.Timeline#setEnableModelFilter
 * @function
 */


/**
 * Getter for property <code>enableScroll</code>.
 * If set to <code>true</code>, the Timeline control has its own scroll bar,
 * with the scrolling taking place within the Timeline control itself. Scrolling is required if you want to
 * enable the lazyLoading property.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enableScroll</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getEnableScroll
 * @function
 */

/**
 * Setter for property <code>enableScroll</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnableScroll  new value for property <code>enableScroll</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setEnableScroll
 * @function
 */


/**
 * Getter for property <code>enableSocial</code>.
 * Adds a <i>Reply</i> link to the posts on a social timeline that allows users
 * to reply to posts. When a user adds a reply, an event is fired. This event should be handled by
 * external code.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>enableSocial</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getEnableSocial
 * @function
 */

/**
 * Setter for property <code>enableSocial</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bEnableSocial  new value for property <code>enableSocial</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setEnableSocial
 * @function
 */


/**
 * Getter for property <code>filterTitle</code>.
 * Title for the data filter. When a filter is applied, this title is displayed in the
 * message strip along with the filter name.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>filterTitle</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getFilterTitle
 * @function
 */

/**
 * Setter for property <code>filterTitle</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sFilterTitle  new value for property <code>filterTitle</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setFilterTitle
 * @function
 */


/**
 * Getter for property <code>forceGrowing</code>.
 * If set to <code>true</code>, the <i>Show More</i> button is displayed
 * when the user scrolls along the timeline axis.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>forceGrowing</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getForceGrowing
 * @function
 */

/**
 * Setter for property <code>forceGrowing</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bForceGrowing  new value for property <code>forceGrowing</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setForceGrowing
 * @function
 */


/**
 * Getter for property <code>group</code>.
 * Groups the timeline posts by year.<br>
 * As of version 1.46, replaced by {@link sap.suite.ui.commons.Timeline#getGroupByType}.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>group</code>
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the groupByType property instead.
 * @name sap.suite.ui.commons.Timeline#getGroup
 * @function
 */

/**
 * Setter for property <code>group</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bGroup  new value for property <code>group</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the groupByType property instead.
 * @name sap.suite.ui.commons.Timeline#setGroup
 * @function
 */


/**
 * Getter for property <code>groupBy</code>.
 * Groups the timeline posts by a field. Only fields that contain date values are supported.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>groupBy</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getGroupBy
 * @function
 */

/**
 * Setter for property <code>groupBy</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sGroupBy  new value for property <code>groupBy</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setGroupBy
 * @function
 */


/**
 * Getter for property <code>groupByType</code>.
 * Groups the timeline posts by a time period, including year, quarter, month, week, and day.
 * If set to <code>None</code>, no grouping is applied. <br>
 * If you specify a custom grouping function using the {@link sap.suite.ui.commons.Timeline#setCustomGrouping}
 * method, this function overrides the groupByType property settings.
 *
 * Default value is <code>None</code>
 *
 * @return {sap.suite.ui.commons.TimelineGroupType} the value of property <code>groupByType</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getGroupByType
 * @function
 */

/**
 * Setter for property <code>groupByType</code>.
 *
 * Default value is <code>None</code> 
 *
 * @param {sap.suite.ui.commons.TimelineGroupType} oGroupByType  new value for property <code>groupByType</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setGroupByType
 * @function
 */


/**
 * Getter for property <code>growing</code>.
 * If set to <code>true</code>, the timeline displays a limited number of posts
 * with a button to show more. The displayed posts limit can be set using the growingThreshold property.<br>
 * As of version 1.46, replaced by {@link sap.suite.ui.commons.Timeline#getGrowingThreshold}.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>growing</code>
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the growingThreshold property instead, setting it to 0 to disable growing.
 * @name sap.suite.ui.commons.Timeline#getGrowing
 * @function
 */

/**
 * Setter for property <code>growing</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bGrowing  new value for property <code>growing</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the growingThreshold property instead, setting it to 0 to disable growing.
 * @name sap.suite.ui.commons.Timeline#setGrowing
 * @function
 */


/**
 * Getter for property <code>growingThreshold</code>.
 * Number of posts requested from the server at a time. Each time when the timeline needs to load
 * more posts, it will request exactly this amount. The number of posts displayed in the timeline is increased
 * by this number. If set to <code>0</code>, all posts are fetched and displayed on the initial load.
 *
 * Default value is <code>5</code>
 *
 * @return {int} the value of property <code>growingThreshold</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getGrowingThreshold
 * @function
 */

/**
 * Setter for property <code>growingThreshold</code>.
 *
 * Default value is <code>5</code> 
 *
 * @param {int} iGrowingThreshold  new value for property <code>growingThreshold</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setGrowingThreshold
 * @function
 */


/**
 * Getter for property <code>height</code>.
 * Sets the height of the Timeline.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @since 1.46.0
 * @name sap.suite.ui.commons.Timeline#getHeight
 * @function
 */

/**
 * Setter for property <code>height</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @since 1.46.0
 * @name sap.suite.ui.commons.Timeline#setHeight
 * @function
 */


/**
 * Getter for property <code>lazyLoading</code>.
 * Enables the Lazy Loading feature that automatically loads more posts as the user scrolls
 * along the timeline axis. This feature works only when the enableScroll property is set to
 * <code>true</code>. See also {@link sap.suite.ui.commons.Timeline#getEnableScroll}.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>lazyLoading</code>
 * @public
 * @since 1.46.0
 * @name sap.suite.ui.commons.Timeline#getLazyLoading
 * @function
 */

/**
 * Setter for property <code>lazyLoading</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bLazyLoading  new value for property <code>lazyLoading</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @since 1.46.0
 * @name sap.suite.ui.commons.Timeline#setLazyLoading
 * @function
 */


/**
 * Getter for property <code>noDataText</code>.
 * This text is displayed when the control has no data. The default value is loaded from the
 * component resource bundle.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>noDataText</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getNoDataText
 * @function
 */

/**
 * Setter for property <code>noDataText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sNoDataText  new value for property <code>noDataText</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setNoDataText
 * @function
 */


/**
 * Getter for property <code>scrollingFadeout</code>.
 * If set to <code>Area</code>, the timeline fades into the visible area margin.
 * If set to <code>AreaWithButtons</code>, the timeline fades into the visible area margin and
 * scroll buttons are displayed.
 * If set to <code>None</code>, the fading effect is not applied.
 * This feature works only when the enableScroll property is set to
 * <code>true</code>. See also {@link sap.suite.ui.commons.Timeline#getEnableScroll}.
 *
 * Default value is <code>None</code>
 *
 * @return {sap.suite.ui.commons.TimelineScrollingFadeout} the value of property <code>scrollingFadeout</code>
 * @public
 * @since 1.46.0
 * @name sap.suite.ui.commons.Timeline#getScrollingFadeout
 * @function
 */

/**
 * Setter for property <code>scrollingFadeout</code>.
 *
 * Default value is <code>None</code> 
 *
 * @param {sap.suite.ui.commons.TimelineScrollingFadeout} oScrollingFadeout  new value for property <code>scrollingFadeout</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @since 1.46.0
 * @name sap.suite.ui.commons.Timeline#setScrollingFadeout
 * @function
 */


/**
 * Getter for property <code>showFilterBar</code>.
 * Sets the visibility of the filter in the timeline toolbar.<br>
 * As of version 1.46, replaced by {@link sap.suite.ui.commons.Timeline#getShowHeaderBar}.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showFilterBar</code>
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the showHeaderBar property instead.
 * @name sap.suite.ui.commons.Timeline#getShowFilterBar
 * @function
 */

/**
 * Setter for property <code>showFilterBar</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowFilterBar  new value for property <code>showFilterBar</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the showHeaderBar property instead.
 * @name sap.suite.ui.commons.Timeline#setShowFilterBar
 * @function
 */


/**
 * Getter for property <code>showHeaderBar</code>.
 * Shows the timeline toolbar with search and filter options.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showHeaderBar</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getShowHeaderBar
 * @function
 */

/**
 * Setter for property <code>showHeaderBar</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowHeaderBar  new value for property <code>showHeaderBar</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setShowHeaderBar
 * @function
 */


/**
 * Getter for property <code>showIcons</code>.
 * Shows an icon on the timeline axis as an anchor for each entry node. If set to
 * <code>false</code>, all icons are replaced by dots.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showIcons</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getShowIcons
 * @function
 */

/**
 * Setter for property <code>showIcons</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowIcons  new value for property <code>showIcons</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setShowIcons
 * @function
 */


/**
 * Getter for property <code>showSearch</code>.
 * Sets the search field visibility on the timeline toolbar.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showSearch</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getShowSearch
 * @function
 */

/**
 * Setter for property <code>showSearch</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowSearch  new value for property <code>showSearch</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setShowSearch
 * @function
 */


/**
 * Getter for property <code>showSuggestion</code>.
 * If set to <code>true</code>, a suggest event is fired when the user enters text
 * into the search field. Changing the suggestionItems aggregation in the suggest event listener will display
 * suggestions inside a popup.<br>
 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showSuggestion</code>
 * @public
 * @since 1.26.1
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.Timeline#getShowSuggestion
 * @function
 */

/**
 * Setter for property <code>showSuggestion</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowSuggestion  new value for property <code>showSuggestion</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @since 1.26.1
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.Timeline#setShowSuggestion
 * @function
 */


/**
 * Getter for property <code>showTimeFilter</code>.
 * Shows the time range filter in the filter menu.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showTimeFilter</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getShowTimeFilter
 * @function
 */

/**
 * Setter for property <code>showTimeFilter</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowTimeFilter  new value for property <code>showTimeFilter</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setShowTimeFilter
 * @function
 */


/**
 * Getter for property <code>sort</code>.
 * Indicates whether the data should be sorted. If set to <code>false</code> the data
 * model's default sorting is applied.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>sort</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getSort
 * @function
 */

/**
 * Setter for property <code>sort</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bSort  new value for property <code>sort</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setSort
 * @function
 */


/**
 * Getter for property <code>sortOldestFirst</code>.
 * Whether the oldest item will be displayed first.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>sortOldestFirst</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getSortOldestFirst
 * @function
 */

/**
 * Setter for property <code>sortOldestFirst</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bSortOldestFirst  new value for property <code>sortOldestFirst</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setSortOldestFirst
 * @function
 */


/**
 * Getter for property <code>textHeight</code>.
 * Height of the timeline posts. It can be set to either of the following types of values:
 * <ul>
 * <li> Automatic &ndash; If set to <code>automatic</code>, the optimal post height is
 * calculated automatically to fit the timeline height specified by the height parameter. This option works only in
 * horizontal timelines and only when the timeline height is defined. In vertical timelines, this setting is
 * ignored. </li>
 * <li> Number &ndash; If set to a number, a corresponding number of text lines is displayed in every post.
 * </li>
 * <li> Pixels &ndash; If set to a number followed by <code>px</code>, such as
 * <code>50px</code>, the closest number in lines is calculated and applied to the timeline posts,
 * so that the post height corresponds to the specified number of pixels and the text lines are not cut off in the
 * middle of a line.</li>
 * <li> Any other valid {@link sap.ui.core.CSSSize CSSSize} value that is inserted into the text
 * wrapper without being changed. </li>
 * </ul>
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>textHeight</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getTextHeight
 * @function
 */

/**
 * Setter for property <code>textHeight</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTextHeight  new value for property <code>textHeight</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setTextHeight
 * @function
 */


/**
 * Getter for property <code>width</code>.
 * Sets the width of the Timeline.
 *
 * Default value is <code>100%</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.suite.ui.commons.Timeline#getWidth
 * @function
 */

/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>100%</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setWidth
 * @function
 */


/**
 * Getter for aggregation <code>content</code>.<br/>
 * List of timeline posts.
 * 
 * @return {sap.suite.ui.commons.TimelineItem[]}
 * @public
 * @name sap.suite.ui.commons.Timeline#getContent
 * @function
 */


/**
 * Inserts a content into the aggregation named <code>content</code>.
 *
 * @param {sap.suite.ui.commons.TimelineItem}
 *          oContent the content to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the content should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the content is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the content is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#insertContent
 * @function
 */

/**
 * Adds some content <code>oContent</code> 
 * to the aggregation named <code>content</code>.
 *
 * @param {sap.suite.ui.commons.TimelineItem}
 *            oContent the content to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#addContent
 * @function
 */

/**
 * Removes an content from the aggregation named <code>content</code>.
 *
 * @param {int | string | sap.suite.ui.commons.TimelineItem} vContent the content to remove or its index or id
 * @return {sap.suite.ui.commons.TimelineItem} the removed content or null
 * @public
 * @name sap.suite.ui.commons.Timeline#removeContent
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>content</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.suite.ui.commons.TimelineItem[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.Timeline#removeAllContent
 * @function
 */

/**
 * Checks for the provided <code>sap.suite.ui.commons.TimelineItem</code> in the aggregation named <code>content</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.suite.ui.commons.TimelineItem}
 *            oContent the content whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.suite.ui.commons.Timeline#indexOfContent
 * @function
 */
	

/**
 * Destroys all the content in the aggregation 
 * named <code>content</code>.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#destroyContent
 * @function
 */


/**
 * Getter for aggregation <code>customFilter</code>.<br/>
 * A custom filter to be used instead of the default item filter. This control must have an <code>openBy</code>
 * function that is used by the timeline to open the control.
 * 
 * @return {sap.ui.core.Control}
 * @public
 * @name sap.suite.ui.commons.Timeline#getCustomFilter
 * @function
 */


/**
 * Setter for the aggregated <code>customFilter</code>.
 * @param {sap.ui.core.Control} oCustomFilter
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#setCustomFilter
 * @function
 */
	

/**
 * Destroys the customFilter in the aggregation 
 * named <code>customFilter</code>.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#destroyCustomFilter
 * @function
 */


/**
 * Getter for aggregation <code>filterList</code>.<br/>
 * Custom filter criteria for the items filter.
 * 
 * @return {sap.suite.ui.commons.TimelineFilterListItem[]}
 * @public
 * @name sap.suite.ui.commons.Timeline#getFilterList
 * @function
 */


/**
 * Inserts a filterList into the aggregation named <code>filterList</code>.
 *
 * @param {sap.suite.ui.commons.TimelineFilterListItem}
 *          oFilterList the filterList to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the filterList should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the filterList is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the filterList is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#insertFilterList
 * @function
 */

/**
 * Adds some filterList <code>oFilterList</code> 
 * to the aggregation named <code>filterList</code>.
 *
 * @param {sap.suite.ui.commons.TimelineFilterListItem}
 *            oFilterList the filterList to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#addFilterList
 * @function
 */

/**
 * Removes an filterList from the aggregation named <code>filterList</code>.
 *
 * @param {int | string | sap.suite.ui.commons.TimelineFilterListItem} vFilterList the filterList to remove or its index or id
 * @return {sap.suite.ui.commons.TimelineFilterListItem} the removed filterList or null
 * @public
 * @name sap.suite.ui.commons.Timeline#removeFilterList
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>filterList</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.suite.ui.commons.TimelineFilterListItem[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.Timeline#removeAllFilterList
 * @function
 */

/**
 * Checks for the provided <code>sap.suite.ui.commons.TimelineFilterListItem</code> in the aggregation named <code>filterList</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.suite.ui.commons.TimelineFilterListItem}
 *            oFilterList the filterList whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.suite.ui.commons.Timeline#indexOfFilterList
 * @function
 */
	

/**
 * Destroys all the filterList in the aggregation 
 * named <code>filterList</code>.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#destroyFilterList
 * @function
 */


/**
 * Getter for aggregation <code>suggestionItems</code>.<br/>
 * Items for suggestions.<br>
 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
 * 
 * @return {sap.m.StandardListItem[]}
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.Timeline#getSuggestionItems
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
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.Timeline#insertSuggestionItem
 * @function
 */

/**
 * Adds some suggestionItem <code>oSuggestionItem</code> 
 * to the aggregation named <code>suggestionItems</code>.
 *
 * @param {sap.m.StandardListItem}
 *            oSuggestionItem the suggestionItem to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.Timeline#addSuggestionItem
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
 * @name sap.suite.ui.commons.Timeline#removeSuggestionItem
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>suggestionItems</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.m.StandardListItem[]} an array of the removed elements (might be empty)
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.Timeline#removeAllSuggestionItems
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
 * @name sap.suite.ui.commons.Timeline#indexOfSuggestionItem
 * @function
 */
	

/**
 * Destroys all the suggestionItems in the aggregation 
 * named <code>suggestionItems</code>.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.Timeline#destroySuggestionItems
 * @function
 */


/**
 * This event is fired when a new post is added.<br>
 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
 *
 * @name sap.suite.ui.commons.Timeline#addPost
 * @event
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {string} oControlEvent.getParameters.value Post message text.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'addPost' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself. 
 *  
 * This event is fired when a new post is added.<br>
 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.Timeline#attachAddPost
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'addPost' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.Timeline#detachAddPost
 * @function
 */

/**
 * Fire event addPost to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'value' of type <code>string</code> Post message text.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @protected
 * @deprecated Since version 1.46.0. 
 * Use the Group Feed Component instead.
 * @name sap.suite.ui.commons.Timeline#fireAddPost
 * @function
 */


/**
 * This event is fired when the user clicks the Close button on a message strip.
 *
 * @name sap.suite.ui.commons.Timeline#customMessageClosed
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'customMessageClosed' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself. 
 *  
 * This event is fired when the user clicks the Close button on a message strip.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#attachCustomMessageClosed
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'customMessageClosed' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#detachCustomMessageClosed
 * @function
 */

/**
 * Fire event customMessageClosed to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.Timeline#fireCustomMessageClosed
 * @function
 */


/**
 * This event is fired when the user clicks the filter icon in the timeline toolbar and opens
 * the filter.
 *
 * @name sap.suite.ui.commons.Timeline#filterOpen
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'filterOpen' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself. 
 *  
 * This event is fired when the user clicks the filter icon in the timeline toolbar and opens
 * the filter.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#attachFilterOpen
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'filterOpen' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#detachFilterOpen
 * @function
 */

/**
 * Fire event filterOpen to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.Timeline#fireFilterOpen
 * @function
 */


/**
 * This event is fired when filtering is applied to timeline posts or when a search term
 * is entered into the search field.
 *
 * @name sap.suite.ui.commons.Timeline#filterSelectionChange
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {sap.suite.ui.commons.TimelineFilterType} oControlEvent.getParameters.type Type of filter that has changed, can be an item filter or a time range
 *         filter.
 * @param {string} oControlEvent.getParameters.searchTerm Search term entered into the search field.
 * @param {string} oControlEvent.getParameters.selectedItem The first criteria selected in the filter criteria list (required for backward
 *         compatibility).
 * @param {object} oControlEvent.getParameters.selectedItems An array with all selected filter criteria.
 * @param {object} oControlEvent.getParameters.timeKeys An object specifying the start date (<code>from</code>)
 *         and the end date (<code>to</code>) of the time range.
 * @param {boolean} oControlEvent.getParameters.clear Is set to <code>true</code> when this event is fired by clearing
 *         the filter.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'filterSelectionChange' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself. 
 *  
 * This event is fired when filtering is applied to timeline posts or when a search term
 * is entered into the search field.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#attachFilterSelectionChange
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'filterSelectionChange' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#detachFilterSelectionChange
 * @function
 */

/**
 * Fire event filterSelectionChange to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'type' of type <code>sap.suite.ui.commons.TimelineFilterType</code> Type of filter that has changed, can be an item filter or a time range
                    filter.
                    </li>
 * <li>'searchTerm' of type <code>string</code> Search term entered into the search field.</li>
 * <li>'selectedItem' of type <code>string</code> The first criteria selected in the filter criteria list (required for backward 
                    compatibility).
                    </li>
 * <li>'selectedItems' of type <code>object</code> An array with all selected filter criteria.</li>
 * <li>'timeKeys' of type <code>object</code> An object specifying the start date (<code>from</code>) 
                    and the end date (<code>to</code>) of the time range.</li>
 * <li>'clear' of type <code>boolean</code> Is set to <code>true</code> when this event is fired by clearing 
                    the filter.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.Timeline#fireFilterSelectionChange
 * @function
 */


/**
 * This event is fired when the "More" button is clicked.
 *
 * @name sap.suite.ui.commons.Timeline#grow
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'grow' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself. 
 *  
 * This event is fired when the "More" button is clicked.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#attachGrow
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'grow' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#detachGrow
 * @function
 */

/**
 * Fire event grow to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.Timeline#fireGrow
 * @function
 */


/**
 * This event is fired for every timeline post when data filtering is being applied. It
 * indicates whether this post is included in the filtering and why. Can be used only when the enableModelFilter
 * property is set to <code>false</code>.
 *
 * @name sap.suite.ui.commons.Timeline#itemFiltering
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {sap.suite.ui.commons.TimelineItem} oControlEvent.getParameters.item Timeline post that is currently being filtered.
 * @param {object} oControlEvent.getParameters.reasons Reasons why the post is being filtered. Empty if the post is not being filtered.
 *         There are three properties available in the object: <code>Search</code>,
 *         <code>Time</code>, and <code>Data</code>. You can call
 *         preventDefault to the event object to prevent the result.
 * @param {object} oControlEvent.getParameters.dataKeys Array with keys used for data filtering.
 * @param {object} oControlEvent.getParameters.timeKeys An object specifying the start date (<code>from</code>)
 *         and the end date (<code>to</code>) of the time range.
 * @param {string} oControlEvent.getParameters.searchTerm The text string that has been typed into the search field.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'itemFiltering' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself. 
 *  
 * This event is fired for every timeline post when data filtering is being applied. It
 * indicates whether this post is included in the filtering and why. Can be used only when the enableModelFilter
 * property is set to <code>false</code>.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#attachItemFiltering
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'itemFiltering' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#detachItemFiltering
 * @function
 */

/**
 * Fire event itemFiltering to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'item' of type <code>sap.suite.ui.commons.TimelineItem</code> Timeline post that is currently being filtered.</li>
 * <li>'reasons' of type <code>object</code> Reasons why the post is being filtered. Empty if the post is not being filtered. 
                        There are three properties available in the object: <code>Search</code>, 
                        <code>Time</code>, and <code>Data</code>. You can call
                        preventDefault to the event object to prevent the result.
                    </li>
 * <li>'dataKeys' of type <code>object</code> Array with keys used for data filtering.</li>
 * <li>'timeKeys' of type <code>object</code> An object specifying the start date (<code>from</code>) 
                    and the end date (<code>to</code>) of the time range.</li>
 * <li>'searchTerm' of type <code>string</code> The text string that has been typed into the search field.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.Timeline#fireItemFiltering
 * @function
 */


/**
 * This event is fired when a timeline post is selected.
 *
 * @name sap.suite.ui.commons.Timeline#select
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {sap.suite.ui.commons.TimelineItem} oControlEvent.getParameters.selectedItem The timeline post that is selected.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'select' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself. 
 *  
 * This event is fired when a timeline post is selected.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#attachSelect
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'select' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.Timeline#detachSelect
 * @function
 */

/**
 * Fire event select to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'selectedItem' of type <code>sap.suite.ui.commons.TimelineItem</code> The timeline post that is selected.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.Timeline#fireSelect
 * @function
 */


/**
 * This event is fired when the user enters text into the search field, in cases when the
 * showSuggestion property is set to <code>true</code>. Changing the suggestionItems aggregation
 * will show the suggestions inside a popup.
 *
 * @name sap.suite.ui.commons.Timeline#suggest
 * @event
 * @since 1.26.1
 * @deprecated Since version 1.46.0. 
 * Replaced by {@link sap.collaboration.components.feed.Component}.
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {string} oControlEvent.getParameters.suggestValue The text string that has been typed into the search field.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'suggest' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself. 
 *  
 * This event is fired when the user enters text into the search field, in cases when the
 * showSuggestion property is set to <code>true</code>. Changing the suggestionItems aggregation
 * will show the suggestions inside a popup.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @since 1.26.1
 * @deprecated Since version 1.46.0. 
 * Replaced by {@link sap.collaboration.components.feed.Component}.
 * @name sap.suite.ui.commons.Timeline#attachSuggest
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'suggest' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @since 1.26.1
 * @deprecated Since version 1.46.0. 
 * Replaced by {@link sap.collaboration.components.feed.Component}.
 * @name sap.suite.ui.commons.Timeline#detachSuggest
 * @function
 */

/**
 * Fire event suggest to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'suggestValue' of type <code>string</code> The text string that has been typed into the search field.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @protected
 * @since 1.26.1
 * @deprecated Since version 1.46.0. 
 * Replaced by {@link sap.collaboration.components.feed.Component}.
 * @name sap.suite.ui.commons.Timeline#fireSuggest
 * @function
 */


/**
 * This event is fired when a suggested post is selected in the suggestions popup list. This
 * event is only fired when the showSuggestion property is set to <code>true</code> and there
 * is at least one post in the suggestions popup list. See also the suggestionItems aggregation.
 *
 * @name sap.suite.ui.commons.Timeline#suggestionItemSelected
 * @event
 * @since 1.26.1
 * @deprecated Since version 1.46.0. 
 * Replaced by {@link sap.collaboration.components.feed.Component}.
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {sap.ui.core.Item} oControlEvent.getParameters.selectedItem The item selected in the suggestions popup.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'suggestionItemSelected' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself. 
 *  
 * This event is fired when a suggested post is selected in the suggestions popup list. This
 * event is only fired when the showSuggestion property is set to <code>true</code> and there
 * is at least one post in the suggestions popup list. See also the suggestionItems aggregation.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.Timeline</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @since 1.26.1
 * @deprecated Since version 1.46.0. 
 * Replaced by {@link sap.collaboration.components.feed.Component}.
 * @name sap.suite.ui.commons.Timeline#attachSuggestionItemSelected
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'suggestionItemSelected' event of this <code>sap.suite.ui.commons.Timeline</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @public
 * @since 1.26.1
 * @deprecated Since version 1.46.0. 
 * Replaced by {@link sap.collaboration.components.feed.Component}.
 * @name sap.suite.ui.commons.Timeline#detachSuggestionItemSelected
 * @function
 */

/**
 * Fire event suggestionItemSelected to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'selectedItem' of type <code>sap.ui.core.Item</code> The item selected in the suggestions popup.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.Timeline} <code>this</code> to allow method chaining
 * @protected
 * @since 1.26.1
 * @deprecated Since version 1.46.0. 
 * Replaced by {@link sap.collaboration.components.feed.Component}.
 * @name sap.suite.ui.commons.Timeline#fireSuggestionItemSelected
 * @function
 */


/**
 * Refreshes the UI.
 *
 * @name sap.suite.ui.commons.Timeline#adjustUI
 * @function
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Returns the keys of the currently applied filter criteria as an array of objects, containing
 * filter criteria keys (<code>key</code>) and values (<code>text</code>).
 *
 * @name sap.suite.ui.commons.Timeline#getCurrentFilter
 * @function
 * @type object
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Returns all group items.
 *
 * @name sap.suite.ui.commons.Timeline#getGroups
 * @function
 * @type object
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Sets a custom message for the filter message strip. This message is appended to the default
 * filter text.
 *
 * @name sap.suite.ui.commons.Timeline#setCustomFilterMessage
 * @function
 * @param {string} sSMessage
 *         Message to append.
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Sets custom grouping function. This function must have one parameter that is a date
 * object. This date object is used for grouping timeline posts.
 * The function should return an object that has three properties:
 * <ul>
 * <li>
 * <code>key</code> &ndash; The key of the related group.
 * </li>
 * <li>
 * <code>title</code> &ndash; The title of the related group.
 * </li>
 * <li>
 * <code>date</code> &ndash; The same value as the one entered in the input parameter.
 * </li>
 * </ul>
 *
 * @name sap.suite.ui.commons.Timeline#setCustomGrouping
 * @function
 * @param {object} oFnGroupBy
 *         Grouping function.
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Adds a custom filter in addition to the default filters: items filter, time range filter,
 * and search.
 *
 * @name sap.suite.ui.commons.Timeline#setCustomModelFilter
 * @function
 * @param {string} sSFilterId
 *         A unique filter ID that the caller can use to manipulate the filter after it has been
 *         created, for example, to remove it.
 * @param {object} oOFilter
 *         Filter object.
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Sets filter criteria keys.
 *
 * @name sap.suite.ui.commons.Timeline#setCurrentFilter
 * @function
 * @param {object} oASelectedItemKeys
 *         Filter criteria keys to select. Can be also used as a single value.
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Sets values for the search field.
 *
 * @name sap.suite.ui.commons.Timeline#setCurrentSearch
 * @function
 * @param {string} sSSearchTerm
 *         Search term value.
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Sets values for the time range filter.
 *
 * @name sap.suite.ui.commons.Timeline#setCurrentTimeFilter
 * @function
 * @param {object} oMArguments
 * 
 *         <ul>
 *         <li>
 *         <code>{Date} mArguments.from</code> &ndash;
 *         Start date of the time range filter.
 *         </li>
 *         <li>
 *         <code>{Date} mArguments.to</code> &ndash;
 *         End date of the time range filter.
 *         </li>
 *         <li>
 *         <code>{TimelineGroupType} mArguments.type</code> &ndash;
 *         The step of the time range filter scale. Can be set to day, month, quarter, or year.
 *         Week is currently not supported.
 *         </li>
 *         </ul>
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Replaces one of the default filters: items filter, time range filter, or search.
 *
 * @name sap.suite.ui.commons.Timeline#setModelFilter
 * @function
 * @param {object} oMArguments
 * 
 *         <ul>
 *         <li>
 *         <code>{TimelineFilterType} mArguments.type</code> &ndash;
 *         Type of the filter to replace.
 *         </li>
 *         <li>
 *         <code>{sap.ui.model.Filter} mArguments.filter</code> &ndash;
 *         Filter object to specify the filter criteria.
 *         </li>
 *         <li>
 *         <code>{boolean} mArguments.refresh</code> &ndash;
 *         If set to <code>true</code> (default), filters are automatically recreated,
 *         and the content is updated.
 *         </li>
 *         </ul>
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * Sets the message displayed in the filter message strip. This message overwrites the default
 * filter message.
 *
 * @name sap.suite.ui.commons.Timeline#setModelFilterMessage
 * @function
 * @param {sap.suite.ui.commons.TimelineFilterType} oSelectedItemKeys
 *         Filter type. Supports only items filter (<code>Data</code>)
 *         and time range filter (<code>Time</code>).
 * @param {string} sSMessage
 *         The message that should replace the default message.
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */

// Start of sap/suite/ui/commons/Timeline.js
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/ResizeHandler",
		"sap/ui/core/format/DateFormat",
		"sap/ui/model/odata/ODataListBinding",
		"sap/ui/model/ClientListBinding",
		"sap/ui/model/FilterType",
		"sap/ui/Device",
		"sap/suite/ui/commons/TimelineAxisOrientation",
		"sap/suite/ui/commons/TimelineFilterType",
		"sap/suite/ui/commons/TimelineNavigator",
		"sap/suite/ui/commons/TimelineGroupType",
		"sap/suite/ui/commons/util/DateUtils",
		"sap/suite/ui/commons/util/ManagedObjectRegister",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Sorter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/base/ManagedObject",
		"sap/suite/ui/commons/TimelineItem",
		"sap/ui/core/Item",
		"sap/suite/ui/commons/TimelineAlignment",
		"sap/m/MessageToast",
		"sap/suite/ui/commons/TimelineScrollingFadeout",
		"sap/suite/ui/commons/TimelineRenderManager"
	], function ($, ResizeHandler, DateFormat, ODataListBinding, ClientListBinding, FilterType, Device, TimelineAxisOrientation, TimelineFilterType,
                 TimelineNavigator, TimelineGroupType, DateUtils, ManagedObjectRegister, JSONModel, Sorter, Filter, FilterOperator,
                 ManagedObject, TimelineItem, Item, TimelineAlignment, MessageToast, ScrollingFadeout, TimelineRenderManager) {
		"use strict";

		var Timeline = sap.suite.ui.commons.Timeline,
			resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons"),
			SortOrder = Object.freeze({
				ASCENDING: "ASCENDING",
				DESCENDING: "DESCENDING"
			}),
			DateRoundType = Object.freeze({
				UP: "UP",
				DOWN: "DOWN",
				NONE: "NONE"
			}),
			// used for displaying formatted date in group header text
			DateFormats = {
				Year: DateFormat.getDateInstance({
					pattern: "YYYY"
				}),
				Quarter: DateFormat.getDateInstance({
					pattern: "QQQQ YYYY"
				}),
				Month: DateFormat.getDateInstance({
					pattern: "MMMM YYYY"
				}),
				Week: DateFormat.getDateInstance({
					pattern: "w"
				}),
				Day: DateFormat.getDateInstance({
					style: "long"
				}),
				MonthDay: DateFormat.getDateInstance({
					style: "medium"
				})
			};

		/**
		 * Compatibility wrapper around javascript Array.findIndex function. findIndex is not supported by IE.
		 *
		 * @param aArray Array to find index in.
		 * @param fnCallback Function to execute on each value in the array.
		 * @returns {number} An index in the array if an element passes the test; otherwise, -1.
		 * @private
		 */
		function findIndex(aArray, fnCallback) {
			var i;

			jQuery.sap.assert(jQuery.isArray(aArray), "aArray must be an array.");

			if (typeof aArray.findIndex === "function") {
				return aArray.findIndex(fnCallback);
			}

			for (i = 0; i < aArray.length; i++) {
				if (fnCallback(aArray[i], i, aArray)) {
					return i;
				}
			}
			return -1;
		}

		Timeline.prototype.init = function () {
			// array of selected filter items. { key; text }
			this._aFilterList = [];

			// associative array of groups which are collapsed (are in array with true value)
			this._collapsedGroups = {};

			// collection for all items (icons, buttons) which are not directly rendered but library stuff are used (like sap.m.buttons)
			// we use this collection for destroying all items by one function call when it is necessary
			this._objects = new ManagedObjectRegister();

			// indicator whether timeline is rendered as double sided. It is working only for vertical mode. The flag 'enableDoubleSided' must be true,
			// but also there have to be enough width
			this._renderDblSided = null;

			// internal counter of groups. The group iteration goes through '_createGroupHeader'
			this._groupId = 0;

			// store last scroll position. 'x' and 'y' are for scrolling buttons, 'more' is used when new load of data is loaded to scroll back to focused item
			this._lastScrollPosition = {
				x: 0,
				y: 0,
				more: 0
			};

			// indicator that scrolling buttons are already set and there is no need to recalculate them again (performance)
			this._scrollersSet = false;

			// array of objects {key; text} with data filter selected items
			this._currentFilterKeys = [];

			// storage for custom filter
			this._customFilter = false;

			// controls init
			this._initControls();

			this.setBusyIndicatorDelay(0);
		};

		/* =========================================================== */
		/* API methods */
		/* =========================================================== */
		/**
		 * Add additional default filter (time, range, search)
		 * @param sFilterId {string} Filter identifier so filter can be easily removed when needed.
		 * @param oFilter {sap.ui.model.Filter} Filter object
		 * @public
		 */
		Timeline.prototype.setCustomModelFilter = function (sFilterId, oFilter) {
			var oBinding = this.getBinding("content");

			if (oBinding) {
				var filters = oBinding.aFilters || [];

				// remove filter id from collection
				var filterIndex = findIndex(filters, function (oFilter) {
					return oFilter._customTimelineId === sFilterId;
				});

				if (filterIndex !== -1) {
					filters.splice(filterIndex, 1);
				}

				if (oFilter != null) {
					oFilter._customTimelineId = sFilterId;
					filters.push(oFilter);
				}

				oBinding.filter(filters, FilterType.Control);
			}
		};

		/**
		 * Set custom grouping function. This function must have one input parameter which is a date object which is being grouped.
		 * The function has to return an object with three properties.
		 *                key: 'Key of the related group'
		 *                title: 'Title of the related group'
		 *                date: 'The same value as was entered in the input parameter'
		 *
		 * @param fnGroupBy {object} Grouping function
		 * @public
		 */
		Timeline.prototype.setCustomGrouping = function (fnGroupBy) {
			var oBindingInfo = this.getBindingInfo("content");
			this._fnCustomGroupBy = fnGroupBy;

			if (oBindingInfo) {
				this._bindGroupingAndSorting(oBindingInfo);
				this.updateAggregation("content");
			}
		};


		/**
		 * Set values for time filter
		 * @param {object} [mArguments] Time filter arguments
		 * @param {Date} [mArguments.from] Lower limit of search
		 * @param {Date} [mArguments.to] Upper limit of search
		 * @param {TimelineGroupType} [mArguments.type] Type of range selector (week is not supported)
		 * @public
		 */
		Timeline.prototype.setCurrentTimeFilter = function (mArguments) {
			this._startDate = mArguments.from;
			this._endDate = mArguments.to;
			this._rangeFilterType = mArguments.type;
		};

		/**
		 * Set value for search textbox
		 * @param {String} sSearchTerm New text for search input
		 * @public
		 */
		Timeline.prototype.setCurrentSearch = function (sSearchTerm) {
			this._objects.getSearchField().setText(sSearchTerm);
		};

		/**
		 * Select filter values
		 * @param aSelectedItemKeys Array with items key to select. Can be used also as solo value.
		 * @public
		 */
		Timeline.prototype.setCurrentFilter = function (aSelectedItemKeys) {
			var that = this,
				fnHasKey = function (sValue) {
					for (var i = 0; i < aSelectedItemKeys.length; i++) {
						if (aSelectedItemKeys[i] === sValue) {
							return true;
						}
					}
					return false;
				};

			if (!aSelectedItemKeys) {
				return;
			}

			if (!Array.isArray(aSelectedItemKeys)) {
				aSelectedItemKeys = [aSelectedItemKeys];
			}

			if (this._aFilterList.length === 0) {
				this._setFilterList();
			}

			that._currentFilterKeys = [];
			this._aFilterList.forEach(function (oItem) {
				var sKey = oItem.key;
				if (fnHasKey(sKey)) {
					that._currentFilterKeys.push({
						key: sKey,
						text: oItem.text ? oItem.text : oItem.key
					});
				}
			});

		};

		/**
		 * Returns all groups for current items
		 * @returns {array} Timeline groups
		 * @public
		 */
		Timeline.prototype.getGroups = function () {
			return this._useBinding() ? this.getContent().filter(function (oItem) {
					return oItem._isGroupHeader;
				}) : this._aGroups;
		};

		/**
		 * Cleans up the element instance before destruction
		 * @public
		 */
		Timeline.prototype.exit = function () {
			this._objects.destroyAll();

			if (this.oItemNavigation) {
				this.removeDelegate(this.oItemNavigation);
				this.oItemNavigation.destroy();
				this.oItemNavigation = null;
			}
			if (this._oScroller) {
				this._oScroller.destroy();
				this._oScroller = null;
			}

			if (this.oResizeListener) {
				ResizeHandler.deregister(this.oResizeListener);
				this.oResizeListener = null;
			}
		};

		/**
		 * Refresh UI
		 * @public
		 */
		Timeline.prototype.adjustUI = function () {
			this._performUiChanges();
		};

		/**
		 * Set message for default filter type. This message will overwrite default filter's message.
		 * @param sType {sap.suite.ui.commons.TimelineFilterType} Type of filter. Supports only 'Data' or 'Time')
		 * @param sMessage {string} New message
		 * @public
		 */
		Timeline.prototype.setModelFilterMessage = function (sType, sMessage) {
			if (sType === TimelineFilterType.Data) {
				this._dataMessage = sMessage;
			}
			if (sType === TimelineFilterType.Time) {
				this._rangeMessage = sMessage;
			}
		};

		/**
		 * Set custom message for filter info bar which is appended after default filter text
		 * @param sMessage {String} Message to add
		 * @public
		 */
		Timeline.prototype.setCustomFilterMessage = function (sMessage) {
			this._customFilterMessage = sMessage;
		};

		/**
		 * Replaces filter select by type (date, time, search)
		 * @param mArguments
		 * @param {TimelineFilterType} mArguments.type Type of the filter to select.
		 * @param {sap.ui.model.Filter} mArguments.filter filter object to specify criteria
		 * @param {boolean} mArguments.refresh if true(default) filters are automatically recreated and content is updated
		 * @public
		 */
		Timeline.prototype.setModelFilter = function (mArguments) {
			switch (mArguments.type) {
				case TimelineFilterType.Data:
					this._dataFilter = mArguments.filter;
					break;

				case TimelineFilterType.Time:
					this._rangeFilter = mArguments.filter;
					break;

				case TimelineFilterType.Search:
					this._searchFilter = mArguments.filter;
					break;
			}

			if (mArguments.refresh !== false) {
				this.recreateFilter();
			}
		};


		/* =========================================================== */
		/* Private methods */
		/* =========================================================== */
		/**
		 * Returns key and title for oDate object based on format type (Year, Month, ...)
		 * @param oDate {date} item's date by group is determined
		 * @param sType {string} type of grouping
		 * @returns {object} group data
		 * @private
		 */
		Timeline.prototype._formatGroupBy = function (oDate, sType) {
			if (this._fnCustomGroupBy) {
				return this._fnCustomGroupBy(oDate);
			}

			var sKey = oDate,
				sTitle = oDate;
			if (oDate instanceof Date) {
				switch (sType) {
					case TimelineGroupType.Year:
						sKey = oDate.getFullYear();
						sTitle = DateFormats.Year.format(oDate);
						break;

					case TimelineGroupType.Quarter:
						sKey = oDate.getFullYear() + "/" + Math.floor(oDate.getMonth() / 4);
						sTitle = DateFormats.Quarter.format(oDate);
						break;

					case TimelineGroupType.Month:
						sKey = oDate.getFullYear() + "/" + oDate.getMonth();
						sTitle = DateFormats.Month.format(oDate);
						break;

					case TimelineGroupType.Week:
						var dateFrom = new Date(oDate),
							dateTo = new Date(oDate),
							year = oDate.getFullYear(),
							week = DateFormats.Week.format(oDate),
							sKey = year + "/" + week,

							// find first and last day of the week
							first = oDate.getDate() - oDate.getDay(),
							last = first + 6,
							firstDay = new Date(dateFrom.setDate(first)),
							lastDay = new Date(dateTo.setDate(last));

						sTitle = DateFormats.MonthDay.format(firstDay) + " \u2013 " + DateFormats.MonthDay.format(lastDay);
						break;

					case TimelineGroupType.Day:
						sKey = oDate.getFullYear() + "/" + oDate.getMonth() + "/" + oDate.getDate();
						sTitle = DateFormats.Day.format(oDate);
						break;
				}
			}

			return {
				key: sKey,
				title: sTitle,
				date: oDate
			};
		};

		/**
		 * Calculate difference between two dates based by type (Year, month, ...)
		 * @param type {TimelineGroupType} Type of return result(Year, month,)
		 * @param dateA {Date} Date A - optional
		 * @param dateB {Date} Date B - optional
		 * @returns {Number} Difference between dates
		 * @private
		 */
		Timeline.prototype._fnDateDiff = function (type, dateA, dateB) {
			var iMonths,
				iYearDiff, iDateAQuarter, iDateBQuarter;
			dateA = dateA || this._minDate;
			dateB = dateB || this._maxDate;

			switch (type) {
				case TimelineGroupType.Year:
					return dateB.getFullYear() - dateA.getFullYear();
				case TimelineGroupType.Month:
					iMonths = (dateB.getFullYear() - dateA.getFullYear()) * 12;
					iMonths += dateB.getMonth() - dateA.getMonth();
					return iMonths <= 0 ? 0 : iMonths;
				case TimelineGroupType.Quarter:
					iYearDiff = (dateB.getFullYear() - dateA.getFullYear()) * 4;
					iDateAQuarter = Math.floor(dateA.getMonth() / 3);
					iDateBQuarter = Math.floor(dateB.getMonth() / 3);

					return iYearDiff + (iDateBQuarter - iDateAQuarter);
				case TimelineGroupType.Day:
					// hours * minutes * seconds * milliseconds
					var oneDay = 24 * 60 * 60 * 1000;
					return Math.round(Math.abs((dateA.getTime() - dateB.getTime()) / (oneDay)));
			}
		};

		/**
		 * Add value to '_minDate'  based type (f.e. if type is YEAR and value is 4, we add 4 year)
		 * sDateRoundType means whether we want START of the 'interval' or its end
		 * lets say we add two years from 2014 -> we may have 2016/1/1 or 2016/12/31 depending whether we want to display 'from' or 'to'
		 * @param iValue {Number} Number of units to add to minDate (type defined by second parameter)
		 * @param sDateRoundType {TimelineGroupType} Type of date to add
		 * @returns {Date} New date created by minDate + iValue
		 * @private
		 */
		Timeline.prototype._fnAddDate = function (iValue, sDateRoundType) {
			var oNewDate, oRoundedDown, oRoundedUp,
				fnSetTime = function (iHour, iMinute, iSecond) {
					this.setHours(iHour);
					this.setMinutes(iMinute);
					this.setSeconds(iSecond);
				},
				fnReturnCorrectDate = function (oDirect, oRoundedDown, oRoundedUp) {
					if (sDateRoundType === DateRoundType.UP) {
						fnSetTime.call(oRoundedUp, 23, 59, 59);
						return new Date(Math.min.apply(null, [this._maxDate, oRoundedUp]));
					}
					if (sDateRoundType === DateRoundType.DOWN) {
						fnSetTime.call(oRoundedDown, 0, 0, 0);
						return new Date(Math.max.apply(null, [this._minDate, oRoundedDown]));
					}
					return oDirect;
				};

			switch (this._rangeFilterType) {
				case TimelineGroupType.Year:
					oNewDate = new Date(new Date(this._minDate).setFullYear(this._minDate.getFullYear() + iValue));
					oRoundedDown = new Date(oNewDate.getFullYear(), 0, 1);
					oRoundedUp = new Date(oNewDate.getFullYear(), 11, 31);
					break;

				case TimelineGroupType.Month:
					oNewDate = new Date(new Date(this._minDate).setMonth(this._minDate.getMonth() + iValue));
					oRoundedDown = new Date(oNewDate.getFullYear(), oNewDate.getMonth(), 1);
					oRoundedUp = new Date(oNewDate.getFullYear(), oNewDate.getMonth() + 1, 0);
					break;

				case TimelineGroupType.Quarter:
					oNewDate = new Date(new Date(this._minDate).setMonth(this._minDate.getMonth() + (iValue * 3)));
					var iQuarterStart = oNewDate.getMonth() % 3;
					oRoundedDown = new Date(oNewDate.getFullYear(), oNewDate.getMonth() - iQuarterStart, 1);
					oRoundedUp = new Date(oNewDate.getFullYear(), oNewDate.getMonth() + (2 - iQuarterStart) + 1, 0);
					break;

				case TimelineGroupType.Day:
					// we do this for hour rounding
					oNewDate = oRoundedDown = oRoundedUp = new Date(new Date(this._minDate).setDate(this._minDate.getDate() + iValue));

			}

			return fnReturnCorrectDate.call(this, oNewDate, oRoundedDown, oRoundedUp);
		};

		/**
		 * Set default value for time range selector based by limit values
		 * @returns {TimelineGroupType} Selected value
		 * @private
		 */
		Timeline.prototype._calculateRangeTypeFilter = function () {
			var daysDiff = this._fnDateDiff(TimelineGroupType.Day);
			if (daysDiff > 500) {
				return TimelineGroupType.Year;
			} else if (daysDiff > 200) {
				return TimelineGroupType.Quarter;
			} else if (daysDiff > 62) {
				return TimelineGroupType.Month;
			}

			return TimelineGroupType.Day;
		};

		/**
		 * Setup range filter (min and max)
		 * @private
		 */
		Timeline.prototype._setRangeFilter = function () {
			var diff = this._fnDateDiff(this._rangeFilterType);

			this._objects.getTimeRangeSlider().setMin(0);
			this._objects.getTimeRangeSlider().setMax(diff);
			this._objects.getTimeRangeSlider().setRange([0, diff]);
			this._objects.getTimeRangeSlider().invalidate();
		};

		/**
		 * Action after sort arrow is clicked
		 * @private
		 */
		Timeline.prototype._sortClick = function () {
			var oBinding, sPath;
			this._sortOrder = this._sortOrder === SortOrder.ASCENDING ? SortOrder.DESCENDING : SortOrder.ASCENDING;
			this._objects.getSortIcon().setIcon(this._sortOrder === SortOrder.ASCENDING ?
				"sap-icon://arrow-bottom" : "sap-icon://arrow-top");

			if (this._useModelFilter()) {
				oBinding = this.getBinding("content");
				sPath = this._findBindingPath("dateTime");

				oBinding.sort(this._getDefaultSorter(sPath, this._sortOrder === SortOrder.ASCENDING));
			} else {
				this.invalidate();
			}
		};

		/**
		 * Sort items
		 * @param aData {Array} Data
		 * @param sortOrder {String}
		 * @returns {Array} Sorted data
		 * @private
		 */
		Timeline.prototype._sort = function (aData, sortOrder) {
			var sSortOrder = sortOrder || this._sortOrder;
			aData.sort(function (itemA, itemB) {
				var dateA = itemA.getDateTime(),
					dateB = itemB.getDateTime(),
					sign = (sSortOrder === SortOrder.ASCENDING) ? -1 : 1;

				return dateA < dateB ? 1 * sign : -1 * sign;
			});

			return aData;
		};

		/**
		 * When user clicks 'more' button or scrolls down (when lazy loading is ON)
		 * @private
		 */
		Timeline.prototype._loadMore = function () {
			var oBindingInfo, aData,
				fnSetNewItemCount = function () {
					var increase = this._displayShowMore() ? this.getGrowingThreshold() : this._calculateItemCountToLoad(this.$());
					this._iItemCount += increase;
					// limit maximum items to binding limit
					this._iItemCount = Math.min(this._getMaxItemsCount(), this._iItemCount);
				}.bind(this);

			this._lastScrollPosition.more = this._isVertical() ? this._$content.get(0).scrollTop : this._$content.get(0).scrollLeft;

			this._setBusy(true);
			this.fireGrow();

			if (this._useBinding()) {
				if (this._isMaxed()) {
					this._setBusy(false);
					return;
				}

				fnSetNewItemCount();

				oBindingInfo = this.getBindingInfo("content");
				oBindingInfo.startIndex = 0;

				// we already loaded all data so we don't want to overwrite it now
				if (!this._loadAllData()) {
					oBindingInfo.length = this._iItemCount;
				}

				// check whether we use OData binding
				aData = this.getBinding("content").getContexts(0, oBindingInfo.length);

				// don't update for oData service
				// TL will be updated when data are loaded
				if (aData && aData.dataRequested) {
					return;
				}

				this.updateAggregation("content");
			} else {
				fnSetNewItemCount();
				this.invalidate();
			}
		};

		/**
		 * Recreate all default filters (data, time, search) and refresh content.
		 * @param bResetAll {boolean} Indicates whether to clear all current filters (including custom filters)
		 */
		Timeline.prototype.recreateFilter = function (bResetAll) {
			var oBinding = this.getBinding("content"),
				that = this,
				aFilters = [],
				aCurrentFilters = [];
			if (oBinding) {
				if (!bResetAll) {
					aFilters = oBinding.aFilters || [];
				}

				if (this._dataFilter) {
					aCurrentFilters.push(this._dataFilter);
				}

				if (this._rangeDataFilter) {
					aCurrentFilters.push(this._rangeDataFilter);
				}

				if (this._searchFilter) {
					aCurrentFilters.push(this._searchFilter);
				}
				// we don't want to override custom filters in binding, so find our filter and replace it
				if (this._filter && !bResetAll) {
					var filterIndex = findIndex(aFilters, function (oFilter) {
						return oFilter === that._filter;
					});

					if (filterIndex !== -1) {
						aFilters.splice(filterIndex, 1);
					}
				}

				// if there is any new filter add it as new one, otherwise this method only delete old filter
				if (aCurrentFilters.length > 0) {
					this._filter = new Filter(aCurrentFilters, true);
					aFilters.push(this._filter);
				}

				oBinding.filter(aFilters, FilterType.Control);
			} else {
				// for usecase without binding we just invalidate, because all filtering is done right before render is called
				this.invalidate();
			}
		};

		/**
		 * Returns either custom range message (set by function call) or create new one based on 'from' and 'to' selection from time filter.
		 * @returns {string} Message for range info bar.
		 * @private
		 */
		Timeline.prototype._getRangeMessage = function () {
			var text = this._rangeMessage;
			if (!text) {
				var titleStart = this._formatGroupBy(this._startDate, this._rangeFilterType).title,
					titleEnd = this._formatGroupBy(this._endDate, this._rangeFilterType).title;

				text = resourceBundle.getText("TIMELINE_RANGE_SELECTION") + " (";
				text += titleStart + " - " + titleEnd + ")";
			}
			return text;
		};

		/**
		 * Returns either custom data filter message (set by function call) or create new one based on selected filter items.
		 * @returns {string} Message for filter info bar.
		 * @private
		 */
		Timeline.prototype._getFilterMessage = function () {
			var sText = "";
			if (this._dataMessage) {
				sText = this._dataMessage;
			} else {
				if (this._currentFilterKeys.length > 0) {
					sText = this._currentFilterKeys.map(function (oItem) {
						return oItem.text ? oItem.text : oItem.key;
					}).join(", ");

					sText = this._getFilterTitle() + " (" + sText + ")";
				}
			}
			if (this._rangeDataFilter || this._rangeMessage || (this._startDate && this._endDate)) {
				sText = sText ? sText + ", " : "";
				sText += this._getRangeMessage();
			}
			if (this._customFilterMessage) {
				sText = sText ? sText + ", " + this._customFilterMessage : this._customFilterMessage;
			}
			if (sText) {
				return resourceBundle.getText("TIMELINE_FILTER_INFO_BY", sText);
			}
		};

		/**
		 * Proper oData handling. We call 'updateAggregation' not right away but we wait after data are loaded
		 * @private
		 */
		Timeline.prototype.refreshContent = function (sReason) {
			var oBinding = this.getBinding("content"),
				oBindingInfo = this.getBindingInfo("content");

			this._setBusy(true);

			// this is to prevent refreshing before data are loaded
			// 'updateAggregation' triggers UI update even if data are not loaded yet
			if (oBinding && oBindingInfo) {
				oBinding.getContexts(0, oBindingInfo.length);
				oBinding.attachEventOnce("dataReceived", $.proxy(function () {
					this.updateAggregation("content");
				}, this));
			} else {
				this.updateAggregation("content");
			}
		};

		/**
		 * Proper oData handling.
		 * @private
		 */
		Timeline.prototype.updateContent = function (sReason) {
			this._setBusy(false);
			this.updateAggregation("content");

			// for empty returned dataset in oData updateAggregation doesn't trigger rerender so we call it manually
			this.invalidate();
		};

		/**
		 * Destroy additional objects which are not directly in content aggregation but need to removed when content is destroyed.
		 * @private
		 */
		Timeline.prototype.destroyContent = function () {
			// if there is request pending, don't invalidate right now
			var oBinding = this.getBinding("content"),
				bSuppressInvalidate = oBinding && oBinding.bPendingRequest,
				$line = this.$("line"),
				$showMore = this.$().find(".sapSuiteUiCommonsTimelineItemGetMoreButton");

			if ($line.get(0)) {
				$line.remove();
			}

			if ($showMore.get(0)) {
				$showMore.remove();
			}

			this.destroyAggregation("content");
		};

		/**
		 * Process search
		 * @param {string} sSearchTerm term to search
		 * @private
		 */
		Timeline.prototype._search = function (sSearchTerm) {
			var that = this,
				bExecuteDefault, aTextPaths, aTitlePaths, aUserNamePaths,
				columns = [];

			this._searchValue = sSearchTerm;

			if (this._useModelFilter()) {
				bExecuteDefault = this._fireSelectionChange({
					searchTerm: this._searchValue,
					type: TimelineFilterType.Search
				});

				if (bExecuteDefault) {
					this._searchFilter = null;
					if (this._searchValue) {
						// add filter columns - by default we search in text, title and username binding fields
						aTextPaths = this._findBindingPaths("text");
						aTitlePaths = this._findBindingPaths("title");
						aUserNamePaths = this._findBindingPaths("userName");

						if (aTextPaths.length > 0) {
							columns.push(aTextPaths);
						}
						if (aTitlePaths.length > 0) {
							columns.push(aTitlePaths);
						}
						if (aUserNamePaths) {
							columns.push(aUserNamePaths);
						}
						if (columns.length > 0) {
							//create filters based on the filter columns
							this._searchFilter = new Filter(columns.map(function (paths) {
								return new Filter(paths.map(function (onePath) {
									return new Filter(onePath, FilterOperator.Contains, that._searchValue);
								}), false);
							}));
						}
					}

					this.recreateFilter();
				}
			} else {
				this.invalidate();
			}
		};

		/**
		 * @private
		 */
		Timeline.prototype._filterData = function (bRange) {
			var bExecuteDefault,
				sPath;
			this._dataMessage = "";

			if (this._useModelFilter()) {
				// filter

				this._dataFilter = null;
				bExecuteDefault = this._fireSelectionChange({
					// backward compatibility
					selectedItem: this._currentFilterKeys[0] ? this._currentFilterKeys[0].key : "",
					selectedItems: this._currentFilterKeys,
					type: TimelineFilterType.Data
				});

				if (bExecuteDefault) {
					if (this._currentFilterKeys.length > 0) {
						sPath = this._findBindingPath("filterValue");
						if (sPath) {
							this._dataFilter = new Filter(this._currentFilterKeys.map(function (oItem) {
								return new Filter(sPath, FilterOperator.EQ, oItem.key);
							}), false);
						}
					}
				}

				this._rangeDataFilter = null;
				if (bRange) {
					// range
					bExecuteDefault = this._fireSelectionChange({
						type: TimelineFilterType.Time,
						timeKeys: {
							from: this._startDate,
							to: this._endDate,
						}
					});

					if (bExecuteDefault) {
						sPath = this._findBindingPath("dateTime");
						if (sPath) {
							this._rangeDataFilter = new Filter({
								path: sPath,
								operator: FilterOperator.BT,
								value1: this._startDate,
								value2: this._endDate
							});
						}

					}
				}

				this._setBusy(true);

				this.recreateFilter();
			} else {
				this.invalidate();
			}
		};

		/**
		 * @private
		 */
		Timeline.prototype._filterRangeData = function () {
			var bExecuteDefault, sPath;
			this._rangeMessage = "";

			if (this._useModelFilter()) {
				bExecuteDefault = this._fireSelectionChange({
					from: this._startDate,
					to: this._endDate,
					type: TimelineFilterType.Time
				});

				if (bExecuteDefault) {
					sPath = this._findBindingPath("dateTime");
					this._rangeDataFilter = null;
					if (sPath) {
						this._rangeDataFilter = new Filter({
							path: sPath,
							operator: FilterOperator.BT,
							value1: this._startDate,
							value2: this._endDate
						});
					}

					this._setBusy(true);
					this.recreateFilter();
				}
			} else {
				this.invalidate();
			}
		};

		/**
		 * Override apply settings to postpone bind aggregation.
		 * Bind aggregation may be called before all settings are apllied
		 *
		 * @private
		 */
		Timeline.prototype.applySettings = function (mSettings, oScope) {
			ManagedObject.prototype.applySettings.apply(this, [mSettings, oScope]);

			this._settingsApplied = true;

			// if bind aggregation was already called (which is most likely if we use timeline content binding from XML)
			// call it now
			if (this._bindOptions) {
				this.bindAggregation("content", this._bindOptions);
				this._bindOptions = null;
			}
		};

		/**
		 * Create filters for filter dialog. If modelfilter is ON, user can set own filter items, otherwise items are
		 * grabbed from items as distinct value for {filterValue} column in data set.
		 * @private
		 */
		Timeline.prototype._setFilterList = function () {
			var bSort = false,
				aData, oItems, sKey, oJsonModel,
				oFilteredItems = {},
				oBinding, oBindingData;

			this._aFilterList = [];

			if (this._useModelFilter()) {
				this._aFilterList = this.getFilterList().map(function (oItem) {
					return {
						key: oItem.getProperty("key"),
						text: oItem.getProperty("text")
					}
				});

				if (this._aFilterList.length === 0) {
					// JSON model only, for oData model values have to be set via filter list
					oBindingData = this._findBindingData("filterValue");
					oBinding = this.getBinding("content");
					if (oBindingData && oBinding) {
						aData = oBinding.getDistinctValues(oBindingData.path);
						if (Array.isArray(aData)) {
							this._aFilterList = aData.map(function (sItem) {
								return {
									key: sItem,
									text: oBindingData.formatter ? oBindingData.formatter(sItem) : sItem
								}
							});
							this._aFilterList = this._aFilterList.filter(function (oItem) {
								return oItem.key;
							});
						}
						bSort = true;
					}
				}
			} else {
				oItems = this.getContent();
				bSort = true;
				// grab all unique values from all items
				for (var i = 0; i < oItems.length; i++) {
					sKey = oItems[i].getFilterValue();
					if (!sKey) {
						continue;
					}
					if (!(sKey in oFilteredItems)) {
						oFilteredItems[sKey] = 1;
						this._aFilterList.push({
							key: sKey,
							text: sKey
						});
					}
				}
			}

			if (bSort) {
				this._aFilterList.sort(function (a, b) {
					if (a.text.toLowerCase) {
						return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
					} else {
						return a.text > b.text;
					}
				});
			}
		};

		/**
		 * Clear data filter. Remove filter from model binding and clear all selected items for filter selection.
		 * @private
		 */
		Timeline.prototype._clearFilter = function () {
			var fnClearTimeRangeFilter = function () {
					var bExecuteDefault,
						oSlider = this._objects.getTimeRangeSlider();
					this._startDate = null;
					this._endDate = null;
					this._rangeMessage = null;

					oSlider.setRange([oSlider.getMin(), oSlider.getMax()]);

					if (this._useModelFilter()) {
						bExecuteDefault = this._fireSelectionChange({
							clear: true,
							timeKeys: {
								from: null,
								to: null
							},
							type: TimelineFilterType.Range
						});
					}
					return bExecuteDefault;
				}.bind(this),
				fnClearDataFilter = function () {
					var bExecuteDefault;

					this._currentFilterKeys = [];
					if (this._useModelFilter()) {
						bExecuteDefault = this._fireSelectionChange({
							clear: true,
							selectedItems: [],
							selectedItem: "",
							type: TimelineFilterType.Data
						});
					}
					return bExecuteDefault;
				}.bind(this);

			var bDataDefault = fnClearDataFilter(),
				bRangeDefault = fnClearTimeRangeFilter();

			// clear custom filter
			this._customFilterMessage = "";

			if (bDataDefault || bRangeDefault) {
				if (bDataDefault) {
					this._dataFilter = null;
				}

				if (bRangeDefault) {
					this._rangeDataFilter = null;
				}
				this.recreateFilter(true /*force clear custom filters*/);
			} else {
				this.invalidate();
			}
		};

		/**
		 * Open time filter dialog. IF max and min not yet set, try to find out.
		 * @private
		 */
		Timeline.prototype._getTimeFilterData = function () {
			var that = this,
				aItems, oMin, oMax, oDate,
				fnCall = function (sType, sName) {
					return fnGetLimit(sType, that[sName]).then(function (oData) {
							if (oData) {
								// ensure we have valid values
								var parsedDate = DateUtils.parseDate(oData);

								if (parsedDate instanceof Date) {
									that[sName] = parsedDate;
								}
							}
						}
					).catch(function () {
						// not setting min and max is sufficient. No additional action required
					});
				},
				fnGetLimitValue = function (asc) {
					var oModel, sDateTimePath, oSorter, oBindingInfo;

					oModel = this.getModel();
					if (!oModel) {
						return Promise.reject();
					}

					sDateTimePath = this._findBindingPath("dateTime");
					oSorter = new Sorter(sDateTimePath, asc);
					oBindingInfo = this.getBindingInfo("content");

					if (!oBindingInfo) {
						return Promise.reject();
					}

					var oBinding = oModel.bindList(oBindingInfo.path, null, oSorter, null);

					if (typeof oBinding.initialize === "function") {
						oBinding.initialize();
					}

					if (oBinding instanceof ClientListBinding) {
						if (oBinding.getLength() === 0) {
							return Promise.resolve(null);
						}

						return Promise.resolve(DateUtils.parseDate(oBinding.oList[oBinding.aIndices[0]][sDateTimePath]));
					} else if (oBinding && oBinding.attachDataReceived) {
						that._setBusy(true);
						return new Promise(function (resolve, reject) {
							oBinding.attachDataReceived(function (result) {
								that._setBusy(false);
								if (typeof result === "undefined") {
									reject();
									return;
								}
								var oData = result.getParameter("data");
								resolve(DateUtils.parseDate(oData.results[0][sDateTimePath]));
							});
							oBinding.loadData(0, 1);
						});
					}

					return Promise.reject();
				}.bind(this),
				fnGetLimit = function (sType, oDate) {
					if (oDate) {
						return Promise.resolve(oDate);
					}

					return fnGetLimitValue(sType === "max");
				},
				fnGetMinAndMax = function () {
					aItems = this.getContent();
					if (aItems.length > 0) {
						this._minDate = aItems[0].getDateTime();
						this._maxDate = aItems[0].getDateTime();

						for (var i = 1; i < aItems.length; i++) {
							oDate = aItems[i].getDateTime();
							if (oDate < this._minDate) {
								this._minDate = oDate;
							}
							if (oDate > this._maxDate) {
								this._maxDate = oDate;
							}
						}
					}
				};

			return new Promise(function (resolve, reject) {
				// if min or max date not loaded yet
				if (!that._maxDate || !that._minDate) {
					if (that._useModelFilter()) {
						// call separate OData requests for min and max
						oMin = fnCall("min", "_minDate", oMin);
						oMax = fnCall("max", "_maxDate", oMax);

						Promise.all([oMin, oMax]).then(function () {
							// wait till all requests are complete then open window
							resolve();
						}).catch(function () {
							reject();
						});
					} else {
						fnGetMinAndMax.call(that);
						resolve();
					}
				} else {
					resolve();
				}
			});
		};

		/**
		 * Opens filter dialog. Can be custom dialog.
		 * @private
		 */
		Timeline.prototype._openFilterDialog = function () {
			// if (!this._rangeFilterType) {
			// 	this._rangeFilterType = this._calculateRangeTypeFilter();
			// }

			if (this._customFilter) {
				this.getCustomFilter().openBy(this._objects.getFilterIcon());
				this.fireFilterOpen();
				return;
			}

			if (!this.getShowTimeFilter()) {
				this._objects.getFilterContent().removeAggregation("filterItems", 1);
			}

			//this._objects.getFilterDialog().openBy(this._objects.getFilterIcon());
			this._objects.getFilterContent().open();
			this.fireFilterOpen();
		};

		/**
		 * Creates group header item which is classic TimelineItem with slightly different data
		 * @param oContext {object} oContext group data with {date;key;title}
		 * @param bSkipAppend {boolean} if true, we don't call addAggregation (for cases when there is no binding)
		 * @returns {TimelineItem} newly recreated group item
		 * @private
		 */
		Timeline.prototype._createGroupHeader = function (oContext, bSkipAppend) {
			var sId = this.getId() + "-timelinegroupheader-" + this._groupId,
				sKey = oContext.key,
				oGroupItem = new TimelineItem(sId, {
					text: "GroupHeader",
					dateTime: oContext.date,
					userName: sKey,
					title: oContext.title,
					icon: "sap-icon://arrow-down"
				});

			oGroupItem._isGroupHeader = true;

			// for usage without binding we don't add groupitem to content as we recreate it every render cycle
			if (bSkipAppend) {
				oGroupItem.setParent(this, "content");
				this._aGroups.push(oGroupItem);
			} else {
				this.addAggregation("content", oGroupItem, false);
			}

			this._groupId++;
			return oGroupItem;
		};

		/**
		 * Create sorter object
		 * @param sPropertyName {string} property name by which sorting is managed
		 * @param sAscending {boolean} order of sorting
		 * @returns {Sorter} sorter object
		 * @private
		 */
		Timeline.prototype._getDefaultSorter = function (sPropertyName, sAscending) {
			var that = this;

			return new Sorter(sPropertyName, !sAscending, function (oContext) {
				var sValue = oContext.getProperty(sPropertyName),
					oDate = DateUtils.parseDate(sValue);

				return oDate instanceof Date ? that._formatGroupBy(oDate, that.getGroupByType()) : {date: oDate};
			});
		};

		/**
		 * Return binding info for given property
		 * @param sPropertyName {string} Property name we are looking for the model source
		 * @param oTemplate {object} Binding template
		 * @returns {object} Binding info
		 * @private
		 */
		Timeline.prototype._findBindingInfoFromTemplate = function (sPropertyName, oTemplate) {
			// if no template is set try to find from binding info
			// this function may be called before 'content' aggregation is initialized
			// so there is a possibility to call it with template object directly
			if (!oTemplate) {
				var oBindingInfo = this.getBindingInfo("content");

				if (oBindingInfo) {
					oTemplate = oBindingInfo.template;
				}
			}

			if (oTemplate) {
				var oInfo = oTemplate.getBindingInfo(sPropertyName);
				if (oInfo && oInfo.parts && oInfo.parts[0]) {
					return oInfo;
				}
			}

			return null;
		};

		/**
		 * Return all binding paths for property name
		 * @param sPropertyName {string} Property name we are looking for the model source
		 * @param oTemplate {object} Binding template
		 * @returns {array} All property's paths
		 * @private
		 */
		Timeline.prototype._findBindingPaths = function (sPropertyName, oTemplate) {
			var oInfo = this._findBindingInfoFromTemplate(sPropertyName, oTemplate);
			if (oInfo && oInfo.parts) {
				return oInfo.parts.map(function (oItem) {
					return oItem.path;
				});
			}

			return [];
		};

		/**
		 * Return binding path for property name
		 * @param sPropertyName {string} Property name we are looking for the model source
		 * @param oTemplate {object} Binding template
		 * @returns {string} First property path (rest are ignored)
		 * @private
		 */
		Timeline.prototype._findBindingPath = function (sPropertyName, oTemplate) {
			var oInfo = this._findBindingInfoFromTemplate(sPropertyName, oTemplate);
			if (oInfo) {
				return oInfo.parts[0].path;
			}

			return null;
		};

		/**
		 * Return information for property (path and formatter)
		 * @param sPropertyName {string} Property name we are looking for the model source
		 * @param oTemplate {object} Binding template
		 * @returns {object} Formatter and path
		 * @private
		 */
		Timeline.prototype._findBindingData = function (sPropertyName, oTemplate) {
			var oInfo = this._findBindingInfoFromTemplate(sPropertyName, oTemplate);
			if (oInfo) {
				return {
					path: oInfo.parts[0].path,
					formatter: oInfo.formatter
				}
			}
			return null;
		};

		/**
		 * Based on settings apply grouping and sorting to binding info
		 * @private
		 */
		Timeline.prototype._bindGroupingAndSorting = function (oBindingInfo) {
			// get the sorter and add to bindaggregation options
			// only if there is date time binding
			if (!this._isGrouped() && this.getSort()) {
				var sDateTimeBinding = this._findBindingPath("dateTime", oBindingInfo.template);
				if (sDateTimeBinding) {
					oBindingInfo.sorter = this._getDefaultSorter(sDateTimeBinding, this.getSortOldestFirst());
				}
			}
			oBindingInfo.groupHeaderFactory = null;
			if (this._isGrouped()) {
				// add sort by for group by field
				oBindingInfo.sorter = this._getDefaultSorter(this.getGroupBy(), this.getSortOldestFirst());

				//get group header factory and add to bindaggration options
				oBindingInfo.groupHeaderFactory = jQuery.proxy(this._createGroupHeader, this);
			}
		};

		/**
		 * Overrides ManagedObject bindAggregation function, we add some special features for binding
		 * @private
		 */
		Timeline.prototype.bindAggregation = function (sName, oOptions) {
			if (sName === "content") {
				// this prevents calling bindaggregation before all settings are loaded
				// when we have context={/...} in XML timeline definition we can't guarantee order of settings applied
				// so this method could be called before all settings are parsed from XML and setup
				// we store options parameter and called it after settings are loaded (after applysettings method is called)
				if (!this._settingsApplied) {
					this._bindOptions = oOptions;
					return;
				}

				this._bindGroupingAndSorting(oOptions);

				// if we have 'Show More' ON, limit the length to the growing treshold (stored in _itemCount)
				// otherwise download minimum limit for auto-scrolling
				if (this._lazyLoading()) {
					this._iItemCount = this._calculateItemCountToLoad($(window));
					if (!this._loadAllData(true)) {
						oOptions.length = this._iItemCount;
					}
				} else if (this._displayShowMore() && !this._loadAllData(oOptions.template)) {
					this._iItemCount = this.getGrowingThreshold();
					oOptions.length = this._iItemCount;
				}

				this._oOptions = oOptions;
			}

			return ManagedObject.prototype.bindAggregation.apply(this, [sName, oOptions]);
		};

		/**
		 * Calculate items to be loaded for lazy loading based on item size and screen size
		 * @param $parent {object} Parent object where we fit timeline
		 * @returns {number} Number of items to load
		 * @private
		 */
		Timeline.prototype._calculateItemCountToLoad = function ($parent) {
			var isVertical = TimelineAxisOrientation.Vertical === this.getAxisOrientation(),
				size = isVertical ? $parent.height() : $parent.width(),
				isDblSided = this.getEnableDoubleSided(),
				// double sided layout stores more items to one screen
				ratio = isDblSided ? 0.6 : 1,
				SIZE = isVertical ? 1200 : 2000,
				// aprox. item size with margin
				ITEM_SIZE = isVertical ? 120 : 280,
				MIN_COUNT = (13 * ratio),
				result;

			if (!size) {
				// for some reason we are not able to find out parent size -> calculate with 1200 then
				size = SIZE;
			}

			// count aprox. number of items available for one screen (multiple by 2 cause we want to be sure, scrollbar is shown)
			result = (size / (ITEM_SIZE * ratio)) * 1.5;
			return Math.floor(Math.max(result, MIN_COUNT));
		};

		/**
		 * Show or hide some items based on timeline settings
		 * @private
		 */
		Timeline.prototype._setItemVisibility = function () {
			//Hide/show Filterbar
			if (!this.getShowHeaderBar()) {
				this._objects.getHeaderBar().setVisible(false);
			}

			//hide/show search field
			if (!this.getShowSearch()) {
				this._objects.getSearchField().setVisible(false);
			}

			this._objects.getSortIcon().setVisible(this.getSort());
		};

		/**
		 * Before render event
		 * @private
		 */
		Timeline.prototype.onBeforeRendering = function () {
			var iGrowingThreshold = this.getGrowingThreshold(),
				aContent;
			this._bRtlMode = sap.ui.getCore().getConfiguration().getRTL();

			this._setItemVisibility();
			this._objects.getSortIcon().setIcon(this._sortOrder === SortOrder.ASCENDING ?
				"sap-icon://arrow-bottom" : "sap-icon://arrow-top");
			this._aGroups = [];

			aContent = this.getContent();

			// limit size for non binding lazy loading items
			if (!this._iItemCount && !this._useBinding() && this._lazyLoading()) {
				this._iItemCount = this._calculateItemCountToLoad($(window));
			}

			// limit size for growing threshold
			if (!this._iItemCount) {
				if (iGrowingThreshold != 0) {
					this._iItemCount = iGrowingThreshold;
				}
			}

			// in case growing is off we want to set itemcount to all downloaded items in case
			// data was changed meanwhile
			if (!this._iItemCount || !this._useGrowing()) {
				// if still not set all data are probably loaded -> itemCount === all content data
				this._iItemCount = aContent.filter(function (oItem) {
					return !oItem._isGroupHeader;
				}).length;
			}

			this._setOutput(aContent);
		};

		/**
		 * Function override for grouping
		 * @param context {object} data for grouping
		 * @private
		 */
		Timeline.prototype.addContentGroup = function (context) {
			//managed object requires this function to be declared to set bGrouped flag true
		};

		/**
		 * Action after user clicks scrolling button. Scrolls content to specific direction by set amount.
		 * @param size {number} number to determine how many content to scroll
		 * @private
		 */
		Timeline.prototype._performScroll = function (size) {
			var that = this,
				newScrollValue = this._isVertical() ? this._$content.get(0).scrollTop + size : this._$content.get(0).scrollLeft + size;

			if (newScrollValue > 0) {
				this._isVertical() ? this._$content.get(0).scrollTop = newScrollValue : this._$content.get(0).scrollLeft = newScrollValue;
			}

			if (this._manualScrolling) {
				setTimeout(that._performScroll.bind(that, size), 50);
			}
		};

		/**
		 * For default scrolling we use .more to store last scrolling position when load is pressed
		 * when some Timeline Item is selected it is focused by 'applyFocusInfo' which scrolls scrollbar to the focused item
		 * but we want to scroll to last visible (scrolled) position
		 * we use backup because we still want more to be erased after scrolling for cases when item is not focused so this method is called
		 * @param bUseBackup {boolean} Indicates whether store value for next use. Value is deleted after it.
		 * @private
		 */
		Timeline.prototype._moveScrollBar = function (bUseBackup) {
			if (this._lastScrollPosition.more || this._lastScrollPosition.backup) {
				if (bUseBackup) {
					this._lastScrollPosition.more = this._lastScrollPosition.backup;
				}

				this._isVertical() ? this._oScroller.scrollTo(0, this._lastScrollPosition.more) :
					this._oScroller.scrollTo(this._lastScrollPosition.more, 0);

				// store backup
				if (!bUseBackup) {
					this._lastScrollPosition.backup = this._lastScrollPosition.more;
				}

				// reset flag, wait for next data load
				this._lastScrollPosition.more = 0;
			}
		};

		/**
		 * After render event
		 * @private
		 */
		Timeline.prototype.onAfterRendering = function () {
			var $this = this.$();

			if (this._isVertical()) {
				this._$content = this.$("content");
				this._$scroll = this.$("scroll");
			} else {
				this._$content = this.$("contentH");
				this._$scroll = this.$("scrollH");
			}

			this.setBusy(false);

			if (!this._oScroller) {
				this._oScroller = new sap.ui.core.delegate.ScrollEnablement(this, this._$scroll.attr('id'), {});
			}

			this._oScroller._$Container = this._$scroll.parent();

			this._oScroller.setVertical(this._isVertical());
			this._oScroller.setHorizontal(!this._isVertical());

			this._startItemNavigation();

			// setup
			this._scrollersSet = false;
			this._scrollMoreEvent = true;
			// after rendering we always want to trigger double sided changes (if the setting is ON)
			this._lastStateDblSided = null;

			this._showCustomMessage();
			this._setupScrollEvent();
			this._performUiChanges();

			this._moveScrollBar();

			$this.css("opacity", 1);
		};

		/**
		 * Client data filtering for use cases without binding or for useModelFilter=false
		 * @param aItems {array} data to filter
		 * @returns {array} filtered data
		 * @private
		 */
		Timeline.prototype._clientFilter = function (aItems) {
			var aFilteredItems = [],
				oItem, bFilter, oReasons, iFindIndex, oDate,
				sSearchValue, sText, sTitle, sUserName,
				bReverseDefault;

			// filtering - for cases without binding (or mixed by calling addContent) - we filter and sort items
			// even thou in most cases they are already filtered and sorted out.
			for (var i = 0; i < aItems.length; i++) {
				oItem = aItems[i];
				bFilter = false;
				oReasons = {};

				// data filter
				if (this._currentFilterKeys.length > 0) {
					iFindIndex = findIndex(this._currentFilterKeys, function (oSelectedFilterItem) {
						return oSelectedFilterItem.key === oItem.getProperty("filterValue");
					});

					if (iFindIndex === -1) {
						bFilter = true;
						oReasons[TimelineFilterType.Data] = 1;
					}
				}

				// range filter
				if (this._startDate && this._endDate) {
					var oDate = oItem.getDateTime();
					if (oDate < this._startDate || oDate > this._endDate) {
						bFilter = true;
						oReasons[TimelineFilterType.Time] = 1;
					}
				}

				// search filter
				if (this._searchValue) {
					sSearchValue = this._searchValue.toLowerCase();
					sText = oItem.getProperty("text") || "";
					sTitle = oItem.getProperty("title") || "";
					sUserName = oItem.getProperty("userName") || "";

					if (!((sText.toLowerCase().indexOf(sSearchValue) != -1) ||
						(sTitle.toLowerCase().indexOf(sSearchValue) != -1) ||
						(sUserName.toLowerCase().indexOf(sSearchValue) != -1))) {
						bFilter = true;
						oReasons[TimelineFilterType.Search] = 1;
					}
				}

				bReverseDefault = !this.fireEvent("itemFiltering", {
					item: oItem,
					reasons: oReasons,
					dataKeys: this._currentFilterKeys,
					timeKeys: {
						from: this._startDate,
						to: this._endDate
					},
					searchTerm: this._searchValue
				}, true);

				if (bReverseDefault) {
					bFilter = !bFilter;
				}

				if (!bFilter) {
					aFilteredItems.push(oItem);
				}
			}

			return aFilteredItems;
		};

		/**
		 * Fills _outputItem collection which is used as items collection in renderer.
		 * @param aItems {array} data to process
		 * @private
		 */
		Timeline.prototype._setOutput = function (aItems) {
			var fnTrimDataAfterItemCount = function () {
					// for cases when growingthreshold may be changed runtime, we trim additional data
					var iNonGroupItemCount = 0,
						aTrimmedItems = [],
						i = 0,
						iMaxItems = 0;
					if (this._iItemCount != aFilteredItems.length) {
						for (; i < aFilteredItems.length; i++) {
							if (!aFilteredItems[i]._isGroupHeader) {
								iNonGroupItemCount++
							}

							if (iNonGroupItemCount > this._iItemCount) {
								break;
							}

							aTrimmedItems.push(aFilteredItems[i]);
						}

						aFilteredItems = aTrimmedItems;
					}
				},
				fnAppendGroupHeaderItemsWithoutBinding = function () {
					var aItemList = [],
						oItem, oCurrentGroupHeaderData,
						oGroupHeaderData = {
							key: ""
						};

					for (var i = 0; i < aFilteredItems.length; i++) {
						oItem = aFilteredItems[i];
						oCurrentGroupHeaderData = this._formatGroupBy(oItem.getDateTime(), this.getGroupByType());

						if (oCurrentGroupHeaderData.key != oGroupHeaderData.key) {
							// we recreate group header items for every render run
							// we don't want to add it to content as it is not recreated every render cycle when binding is not in
							aItemList.push(this._createGroupHeader(oCurrentGroupHeaderData, true));
							oGroupHeaderData = oCurrentGroupHeaderData;
						}

						aItemList.push(oItem);
					}

					return aItemList;
				},
				fnGetMinOrMaxFromItems = function () {
					var oItem;
					// first time load with no filter and search
					if (!this._maxDate && !this._minDate) {
						if (this.getSort() || this._isGrouped()) {
							// find first non group item value
							for (var i = 0; i < aItems.length; i++) {
								oItem = aItems[i];
								if (!oItem._isGroupHeader) {
									this._sortOrder === SortOrder.ASCENDING ? this._minDate = oItem.getDateTime() : this._maxDate = oItem.getDateTime();
									break;
								}
							}
						}
					}
				},
				oGroup, oConvertedDate, iGroupID, bGroupFirstItem;

			// start
			fnGetMinOrMaxFromItems.call(this);

			// sort for client filtering or for usage without binding
			if ((!this._useBinding() || !this._useModelFilter()) && this.getSort()) {
				aItems = this._sort(aItems);
			}

			// if we don't use model filter, filter data now
			var aFilteredItems = this._useModelFilter() ? aItems : this._clientFilter(aItems);

			// remove group items -> required for correct computing show more
			aFilteredItems = aFilteredItems.filter(function (item) {
				return !item._isGroupHeader;
			});

			this._showMore = false;
			if (this._displayShowMore()) {
				// there are more items to display then we can => show more for both model or client filter
				this._showMore = aFilteredItems.length > this._iItemCount;
				// for model filter we need to take care of equality of items to show and items to display
				// for client model this is already covered by first condition because aFilteredItems should contain
				// all available items
				if (!this._showMore && this._useModelFilter()) {
					this._showMore = aFilteredItems.length === this._iItemCount && this._iItemCount < this._getMaxItemsCount()
				}
			}

			// filter for visible items - both cases, model binding or content adding
			aFilteredItems = aFilteredItems.filter(function (item) {
				return item.getVisible();
			});

			fnTrimDataAfterItemCount.call(this);

			this._outputItem = [];

			// if we don't have binding we have to create groups ourself
			if (this._isGrouped()) {
				if (!this._useBinding()) {
					aItems = fnAppendGroupHeaderItemsWithoutBinding.call(this);
				}

				// get group timeline item values  eg: 2016,2015,2014 etc
				var aGroupItems = aItems.filter(function (oItem) {
					return oItem._isGroupHeader;
				});
				this._groupCount = aGroupItems.length;

				for (var i = 0; i < aGroupItems.length; i++) {
					oGroup = aGroupItems[i];
					//get the year from timelineitem
					iGroupID = oGroup.getUserName();
					// for client filtering, we want to add only groups with at least one item.
					bGroupFirstItem = true;

					oGroup._groupID = iGroupID;

					for (var k = 0; k < aFilteredItems.length; k++) {
						var item = aFilteredItems[k];

						//check if it is not a group timelineitem
						oConvertedDate = this._formatGroupBy(item.getDateTime(), this.getGroupByType());

						if (oConvertedDate.key == iGroupID && !item._isGroupHeader) {
							if (bGroupFirstItem) {
								//add group timeline item to the outputItem array
								this._outputItem.push(oGroup);
								bGroupFirstItem = false;
							}
							item._groupID = iGroupID;
							this._outputItem.push(item);
						}
					}
				}

			} else {
				this._outputItem = $.extend(true, [], aFilteredItems);
			}
		};

		/**
		 * maximum items either in binding (model) or in content (timeline without binding)
		 * @returns {Number} Maximum items for timeline
		 * @private
		 */
		Timeline.prototype._getMaxItemsCount = function () {
			var oBinding = this.getBinding("content"),
				iLen = this.getContent().length;

			if (oBinding) {
				return oBinding.getLength() || 0;
			}

			return iLen;
		};

		/**
		 * Display custom message (if there is any)
		 * @private
		 */
		Timeline.prototype._showCustomMessage = function () {
			var bShow = !!this._customMessage,
				oItem = this._objects.getMessageStrip(),
				$obj = this._objects.getMessageStrip().$();

			this._objects.getMessageStrip().setVisible(bShow);
			this._objects.getMessageStrip().setText(this._customMessage);
			bShow ? $obj.show() : $obj.hide();
		};

		/**
		 * Performs expand or collapse for group
		 * @param sGroupID {String} collapsing (expanding) group ID
		 * @param bIsExpand {boolean} Indicates whether we are expanding or collapsing.
		 * @private
		 */
		Timeline.prototype._performExpandCollapse = function (sGroupID, bIsExpand) {
			var $li, sNodeType, bIsGroupHeaderBar, bIsGroupHeader,
				$this = this.$(),
				$liItems = $this.find('li[groupid="' + sGroupID + '"]');

			for (var i = 0; i < $liItems.length; i++) {
				$li = jQuery($liItems[i]);
				sNodeType = $li.attr('nodeType');
				bIsGroupHeader = sNodeType === "GroupHeader";
				bIsGroupHeaderBar = sNodeType === "GroupHeaderBar";

				if (!bIsGroupHeader) {
					if (bIsGroupHeaderBar) {
						// bar for group header item
						if (!bIsExpand) {
							$li.addClass("sapSuiteUiCommonsTimelineItemGroupCollapsedBar")
						} else {
							$li.removeClass("sapSuiteUiCommonsTimelineItemGroupCollapsedBar");
						}
						// simple group item
					} else {
						if ($li.is(':hidden')) {
							$li.show();
						} else {
							$li.hide();
						}
					}
				}
			}

			this._performUiChanges();
		};


		/* =========================================================== */
		/* Keyboard handling */
		/* =========================================================== */
		Timeline.prototype._startItemNavigation = function (oEvent) {
			var oItemsInfo = this._getItemsForNavigation();

			if (!this.oItemNavigation) {
				this.oItemNavigation = new TimelineNavigator(this.$()[0], oItemsInfo.items, false, oItemsInfo.rows);
				this.oItemNavigation.setPageSize(10);
				this.addDelegate(this.oItemNavigation);
			} else {
				this.oItemNavigation.updateReferences(this.$()[0], oItemsInfo.items, oItemsInfo.rows);
			}
			if (oItemsInfo.columns) {
				this.oItemNavigation.setColumns(oItemsInfo.columns, false);
			}
		};

		Timeline.prototype._getItemsForNavigation = function () {
			var oItemsInfo = {},
				oShowMore,
				aTop,
				aBottom,
				aCurrentRow,
				iMaxRowSize;
			if (this.getEnableDoubleSided()) {
				if (this._isVertical()) {
					oItemsInfo.items = this._outputItem;
					oItemsInfo.rows = [];
					aCurrentRow = [];
					oItemsInfo.items.forEach(function (oItem) {
						var $item = oItem.$(),
							bIsLeft = $item.hasClass("sapSuiteUiCommonsTimelineItemWrapperVLeft") || $item.hasClass("sapSuiteUiCommonsTimelineItemOdd");
						if (bIsLeft && aCurrentRow.length == 1) {
							aCurrentRow.push(null);
						} else if (!bIsLeft && aCurrentRow.length == 0) {
							aCurrentRow.push(null);
						}
						if (aCurrentRow.length > 1) {
							oItemsInfo.rows.push(aCurrentRow);
							aCurrentRow = [];
						}
						aCurrentRow.push(oItem);
					});
					if (aCurrentRow.length > 0) {
						oItemsInfo.rows.push(aCurrentRow);
					}
				} else {
					aTop = [];
					aBottom = [];
					this._outputItem.forEach(function (oItem) {
						if (oItem._placementLine === "top") {
							aTop.push(oItem);
						} else {
							while (aBottom.length + 1 < aTop.length) {
								aBottom.push(null);
							}
							aBottom.push(oItem);
						}
					});
					oItemsInfo.items = this._outputItem;
					oItemsInfo.rows = [aTop, aBottom];
				}
			} else {
				oItemsInfo.items = this._outputItem;
			}
			oItemsInfo.items = oItemsInfo.items.map(function (oItem) {
				return oItem.getFocusDomRef();
			});
			if (oItemsInfo.rows) {
				iMaxRowSize = 0;
				oItemsInfo.rows = oItemsInfo.rows.map(function (aRow) {
					if (aRow.length > iMaxRowSize) {
						iMaxRowSize = aRow.length;
					}
					return aRow.map(function (oItem) {
						return oItem === null ? null : oItem.getFocusDomRef();
					});
				});
				// Make sure all rows have same length.
				oItemsInfo.rows.forEach(function (aRow) {
					while (aRow.length < iMaxRowSize) {
						aRow.push(null);
					}
				});
			}
			oShowMore = this.$("showMoreWrapper");
			if (oShowMore.length > 0) {
				oItemsInfo.items.push(oShowMore[0]);
				if (oItemsInfo.rows) {
					oItemsInfo.rows.push(oItemsInfo.rows[0].map(function () {
						return oShowMore;
					}));
				}
			}
			return oItemsInfo;
		};

		/* =========================================================== */
		/* Setters & getters */
		/* =========================================================== */
		Timeline.prototype._getFilterTitle = function () {
			var sValue = this.getFilterTitle();
			if (!sValue) {
				sValue = resourceBundle.getText("TIMELINE_FILTER_ITEMS");
			}
			return sValue;
		};

		Timeline.prototype.getNoDataText = function () {
			var sText = this.getProperty("noDataText");
			if (!sText) {
				sText = resourceBundle.getText('TIMELINE_NO_DATA');
			}

			return sText;
		};

		Timeline.prototype.setSortOldestFirst = function (bOldestFirst) {
			this._sortOrder = bOldestFirst ? SortOrder.ASCENDING : SortOrder.DESCENDING;
			this._objects.getSortIcon().setIcon(this._sortOrder === SortOrder.ASCENDING ?
				"sap-icon://arrow-bottom" : "sap-icon://arrow-top");

			this.setProperty("sortOldestFirst", bOldestFirst);
		};

		Timeline.prototype.setGrowingThreshold = function (growingThreshold) {
			this.setProperty("growingThreshold", growingThreshold, true);
			// if (growingThreshold != 0) {
			this._iItemCount = growingThreshold;
			// }
		};

		Timeline.prototype.setShowHeaderBar = function (oShowHeaderBar) {
			this.setProperty("showHeaderBar", oShowHeaderBar, true);
			this._objects.getHeaderBar().setVisible(oShowHeaderBar);
		};

		Timeline.prototype.setSort = function (bSort) {
			this.setProperty("sort", bSort);
		};

		Timeline.prototype.setAxisOrientation = function (bAxisOrientation) {
			this.setProperty("axisOrientation", bAxisOrientation);

			// for axis change in runtime --> scroller ID will change, so we have to recreate scroller
			if (this._oScroller) {
				this._oScroller.destroy();
				this._oScroller = null;
			}
		};

		Timeline.prototype.setEnableDoubleSided = function (sEnableDoubleSided) {
			this.setProperty("enableDoubleSided", sEnableDoubleSided);
			this._renderDblSided = sEnableDoubleSided;
		};

		Timeline.prototype.getCurrentFilter = function () {
			var selectedItems = this._currentFilterKeys.map(function (oItem) {
				return {
					key: oItem.key,
					text: oItem.text || oItem.key
				};
			});

			return selectedItems;
		};

		Timeline.prototype.setShowFilterBar = function (flag) {
			this.setProperty("showFilterBar", flag);
			this._objects.getHeaderBar().setVisible(flag);
		};

		Timeline.prototype.setShowSearch = function (flag) {
			this.setProperty("showSearch", flag);
			this._objects.getSearchField().setVisible(!!flag);
		};

		Timeline.prototype.setCustomMessage = function (sMsg) {
			this._customMessage = sMsg;
			this._showCustomMessage();
		};

		Timeline.prototype.getHeaderBar = function () {
			return this._objects.getHeaderBar();
		};

		Timeline.prototype.getMessageStrip = function () {
			return this._objects.getMessageStrip();
		};

		Timeline.prototype.setContent = function (oContents) {
			this.removeAllContent();
			var currentGroup = 0;
			for (var i = 0; i < oContents.length; i++) {
				var oItem = oContents[i];
				if (oItem instanceof TimelineItem) {
					if (this._isGrouped()) {
						var oGroup = this._formatGroupBy(oItem.getDateTime(), this.getGroupByType());
						if (oGroup.key !== currentGroup.key) {
							this._createGroupHeader(oGroup);
							currentGroup = oGroup;
						}
					}
					this.addContent(oItem);
				}
			}

			// reset itemcount and set it again in onbeforeloading
			this._iItemCount = 0;
		};

		Timeline.prototype.setData = function (oData) {
			var INTERNAL_MODEL_NAME = "sapsuiteuicommonsTimelineInternalModel",
				oInternalModel = new JSONModel(),
				sPath, oBindOptions,
				fnDefaultItemsFactory = function (sId, oContext) {
					var oTimelineItem = new TimelineItem({
						dateTime: oContext.getProperty("dateTime"),
						icon: oContext.getProperty("icon"),
						userName: oContext.getProperty("userName"),
						title: oContext.getProperty("title"),
						text: oContext.getProperty("text"),
						filterValue: oContext.getProperty("filterValue")
					});

					if (oContext.getProperty("content")) {
						oTimelineItem.setEmbeddedControl(oContext.getProperty("content"));
					}
					return oTimelineItem;
				},
				fnBuildPath = function (sPath, sModelName) {
					var sCompletePath = sPath;
					if (sModelName) {
						sCompletePath = sModelName + ">" + sPath;
					}
					return sCompletePath;
				};

			if (oData == undefined) {
				return;
			}

			sPath = fnBuildPath("/", INTERNAL_MODEL_NAME);
			oInternalModel.setData(oData);

			this.setModel(oInternalModel, INTERNAL_MODEL_NAME);
			this.setProperty("data", oData, true);

			oBindOptions = {
				path: sPath,
				sorter: this._getDefaultSorter('dateTime', this.getSortOldestFirst()),
				factory: jQuery.proxy(fnDefaultItemsFactory, this)
			};

			if (this._isGrouped()) {
				oBindOptions.groupHeaderFactory = jQuery.proxy(this._getGroupHeader, this);
			}

			this.bindAggregation("content", oBindOptions);
			return this;
		};

		Timeline.prototype.setCustomFilter = function (oFilter) {
			if (oFilter) {
				this._customFilter = true;
				this.setAggregation("customFilter", oFilter, true);
			} else {
				this._customFilter = false;
			}
		};

		Timeline.prototype.getSuspendSocialFeature = function () {
			return this._suspenseSocial;
		};

		Timeline.prototype.setSuspendSocialFeature = function (bSuspense) {
			this._suspenseSocial = bSuspense;
			if (!this.getEnableSocial()) {
				return;
			}

			var oItems = this.getContent();
			for (var i = 0; i < oItems.length; i++) {
				oItems[i]._replyLink.setEnabled(!bSuspense);
			}

			this.invalidate();
		};

		Timeline.prototype.updateFilterList = function () {
			this.updateAggregation("filterList");
			this._setFilterList();
		};

		Timeline.prototype.setGroupByType = function (sType) {
			var oBindingInfo = this.getBindingInfo("content");
			this.setProperty("groupByType", sType);

			if (oBindingInfo) {
				this._bindGroupingAndSorting(oBindingInfo);
				this.updateAggregation("content");
			}
		};

		/* =========================================================== */
		/* Backward compatibility */
		/* =========================================================== */
		Timeline.prototype.getGroup = function () {
			return this.getGroupByType() !== "None";
		};

		Timeline.prototype.setGroup = function (bGroup) {
			if (bGroup && this.getGroupByType() === TimelineGroupType.None) {
				this.setGroupByType(TimelineGroupType.Year);
			}

			if (!bGroup) {
				this.setGroupByType(TimelineGroupType.None);
			}
		};

		Timeline.prototype.setGrowing = function (bGrowing) {
			if (!bGrowing) {
				this.setGrowingThreshold(0);
			}
		};

		Timeline.prototype.getGrowing = function (bGrowing) {
			return this.getGrowingThreshold() !== 0;
		};

		Timeline.prototype.setEnableBackendFilter = function (sBackEndFilter) {
			this.setProperty("enableModelFilter", sBackEndFilter);
		};

		Timeline.prototype.getEnableBackendFilter = function () {
			return this.getProperty("enableModelFilter");
		};

		/* =========================================================== */
		/* Helper methods */
		/* =========================================================== */
		Timeline.prototype._isGrouped = function () {
			return (this.getGroupByType() !== TimelineGroupType.None || this._fnCustomGroupBy) &&
				(this.getGroupBy() !== "");
		};

		Timeline.prototype._lazyLoading = function () {
			return this.getEnableScroll() && this.getLazyLoading();
		};

		Timeline.prototype._loadAllData = function (useBinding) {
			// we load all possible data when use have modelfilter OFF -> filtering above only client data
			return !this._useModelFilter(useBinding);
		};

		Timeline.prototype._isVertical = function () {
			return TimelineAxisOrientation.Vertical === this.getAxisOrientation();
		};

		Timeline.prototype._displayShowMore = function () {
			return this.getForceGrowing() || (this.getGrowingThreshold() !== 0 && !this._lazyLoading());
		};

		Timeline.prototype._useGrowing = function () {
			return this.getForceGrowing() || this.getGrowingThreshold() !== 0 || this._lazyLoading();
		};

		Timeline.prototype._isMaxed = function () {
			return this._iItemCount >= this._getMaxItemsCount();
		};

		Timeline.prototype._useModelFilter = function (useBinding) {
			return this.getEnableModelFilter() && (useBinding || this._useTemplateBinding());
		};

		Timeline.prototype._scrollingFadeout = function (useBinding) {
			return this.getScrollingFadeout() !== ScrollingFadeout.None && this.getEnableScroll();
		};

		Timeline.prototype._setBusy = function (bBusy) {
			if (this.getEnableBusyIndicator()) {
				this.setBusy(bBusy);
			}
		};

		Timeline.prototype._fireSelectionChange = function (oParams) {
			return this.fireEvent("filterSelectionChange", oParams, true);
		};

		Timeline.prototype._isLeftAlignment = function () {
			return this.getAlignment() === TimelineAlignment.Left || this.getAlignment() === TimelineAlignment.Top;
		};

		Timeline.prototype._useBinding = function (bTemplateBinding) {
			return this.getBindingInfo("content") != null;
		};

		Timeline.prototype._useTemplateBinding = function () {
			var oContent = this.getBindingInfo("content");
			return oContent && oContent.template != null;
		};

		/**
		 * Returns number of items which are to be rendered.
		 * @returns {Number}
		 * @private
		 */
		Timeline.prototype._getItemsCount = function () {
			return this._outputItem ? this._outputItem.length : 0;
		};

		TimelineRenderManager.extendTimeline(Timeline);

		return Timeline;
	}
);