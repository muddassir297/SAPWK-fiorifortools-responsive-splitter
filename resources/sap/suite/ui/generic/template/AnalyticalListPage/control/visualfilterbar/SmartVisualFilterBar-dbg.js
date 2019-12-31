sap.ui.define([
	"sap/suite/ui/commons/HeaderContainer", "sap/suite/ui/generic/template/AnalyticalListPage/controller/VisualFilterDialogController",
	"sap/suite/ui/commons/HeaderCell", "sap/suite/ui/commons/HeaderCellItem", "sap/m/Label",
	"sap/ui/comp/odata/ODataModelUtil",
	"sap/ui/comp/smartfilterbar/FilterProvider", "sap/suite/ui/generic/template/AnalyticalListPage/control/visualfilterbar/VisualFilterProvider",
	"sap/ui/comp/smartvariants/PersonalizableInfo", "sap/ui/comp/smartvariants/SmartVariantManagement",
	"sap/ui/model/Filter",
	"sap/m/OverflowToolbar", "sap/m/ToolbarSpacer", "sap/m/Link", "sap/ui/comp/odata/MetadataAnalyser",
	"sap/suite/ui/generic/template/AnalyticalListPage/util/FilterUtil",
	"sap/suite/ui/generic/template/AnalyticalListPage/util/V4Terms"

], function(HeaderContainer, VisualFilterDialogController,
		HeaderCell, HeaderCellItem, Label,
		ODataModelUtil,
		FilterProvider, VisualFilterProvider,
		PersonalizableInfo, SmartVariantManagement,
		Filter,
		OverflowToolbar, ToolbarSpacer, Link, MetadataAnalyser, FilterUtil, V4Terms) {
	"use strict";

	var SmartVisualFilterBar = HeaderContainer.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.SmartVisualFilterBar", {
		metadata: {
			properties: {
				entitySet: { type: "string", group: "Misc", defaultValue: null },
				config: { type: "object", group: "Misc", defaultValue: null },
				persistencyKey: { type: "string", group: "Misc", defaultValue: null }
			},
			associations: {
				smartVariant: { type: "sap.ui.core.Control", multiple: false }
			},
			events: {
				filterChange: {}
			}
		},
		renderer: {}
	});

	SmartVisualFilterBar.prototype.init = function() {
		if (HeaderContainer.prototype.init)
			HeaderContainer.prototype.init.apply(this, arguments);

		// Default settings
		this.labelHeight = 2.0;
		this.compHeight = 7.9;
		this.cellHeightPadding = 1;
		this.cellHeight = (this.labelHeight + this.compHeight + this.cellHeightPadding) + "rem";  // Add cell padding due to the focus on the chart being clipped by the outer cell container, shouldn't have to do this
		this.cellWidth = 320;
		this._dialogFilters = {};
		this._compactFilters = {};
		this._oVariantConfig = {};
		this._smartFilterContext;

		this.addStyleClass("sapSuiteVisualFilterBar");
	};

	/**
	 * It could happen that the entity type information is set already in the view, but there is no model attached yet. This method is called once the
	 * model is set on the parent and can be used to initialise the metadata, from the model, and finally create the visual filter bar.
	 *
	 * @private
	 */
	SmartVisualFilterBar.prototype.propagateProperties = function() {
		HeaderContainer.prototype.propagateProperties.apply(this, arguments);
		this._initMetadata();
	};

	/**
	 * Initialises the OData metadata necessary to create the visual filter bar
	 *
	 * @private
	 */
	SmartVisualFilterBar.prototype._initMetadata = function() {
		if (!this.bIsInitialised)
			ODataModelUtil.handleModelInit(this, this._onMetadataInit);
	};

	/**
	 * Called once the necessary Model metadata is available
	 *
	 * @private
	 */
	SmartVisualFilterBar.prototype._onMetadataInit = function() {
		if (this.bIsInitialised)
			return;

		this._annoProvider = this._createVisualFilterProvider();
		if (!this._annoProvider)
			return;

		this.bIsInitialised = true;
		this._updateFilterBar();
	};

	/**
	 * Creates an instance of the visual filter provider
	 *
	 * @private
	 */
	SmartVisualFilterBar.prototype._createVisualFilterProvider = function() {
		var model = this.getModel();
		var entitySet = this.getEntitySet();

		if (!model || !entitySet) // Model and entity set must be available
			return null;

		return new VisualFilterProvider(this);
	};

	/*
	* @private
	* obtains the string for '_BASIC' group from i18n property
	* @return {string}
	*/
	SmartVisualFilterBar.prototype._getBasicGroupTitle = function() {
		return this.getModel("i18n").getResourceBundle().getText("VIS_FILTER_GRP_BASIC_TITLE");
	};

	SmartVisualFilterBar.prototype._getFieldGroupForProperty = function(oEntityType,sCurrentPropName) {
		return this._annoProvider ? this._annoProvider._getFieldGroupForProperty(oEntityType,sCurrentPropName) : undefined;
	};

	SmartVisualFilterBar.prototype._getGroupList = function() {
		return this._annoProvider ? this._annoProvider.getGroupList() : [];
	};

	SmartVisualFilterBar.prototype._getGroupMap = function() {
		return this._annoProvider ? this._annoProvider.getGroupMap() : {};
	};

	SmartVisualFilterBar.prototype._getMeasureMap = function() {
		return this._annoProvider ? this._annoProvider.getMeasureMap() : {};
	};

	SmartVisualFilterBar.prototype._getDimensionMap = function() {
		return this._annoProvider ? this._annoProvider.getDimensionMap() : {};
	};

	/*
	* @public
	* sets the smart filter bar reference in the visual filter
	* so that it can be accessed if required
	* @param {object} oContext reference to smart filter bar
	* @return {void}
	*/
	SmartVisualFilterBar.prototype.setSmartFilterContext = function(oContext) {
		this._smartFilterContext = oContext;
	};

	SmartVisualFilterBar.prototype._updateFilterBar = function() {
		// Centrally handle the various settings: Application Configuration, OData Annotations, Variant settings...
		// Order of precedence, highest to lowest, highest precedence overwrites the lower precedence:
		//   1. Variant
		//   2. OData Annotations


		var annoSettings = this._getAnnotationSettings();
		if (annoSettings && annoSettings.filterList) {
			var config = this._convertSettingsToConfig(annoSettings);
		} else {
			// Default, no filters
			this.setConfig({
				filterCompList: []
			});
			return;
		}
		// Variant store the variables of a property (Measure, sort order, chart type, shown in filterbar)
		var variantJSON = this._getVariantConfig();
		if (variantJSON && variantJSON.config) {
			// merge variant into config based on property
			config.filterCompList.forEach(function (element) {
				// if parent property exists in variant json override config
				if (variantJSON.config[element.component.properties.parentProperty]) {
					jQuery.extend(true, element, variantJSON.config[element.component.properties.parentProperty]);
				}
			});
			// store config only for later use after smart filter bar variant load when mergeCompactFilters is called
			this._oVariantConfig = config;
			return;
		}
		this.setConfig(config);
		return;

	};

	SmartVisualFilterBar.prototype._getAnnotationSettings = function() {
		return this._annoProvider ? this._annoProvider.getVisualFilterConfig() : null;
	};

	/*
	* @private
	* Convert setting from annotations to config for visual filter
	* @param {object} settings - parsed annotations data from visual filter provider
	* @param {boolean} bIsVariantConfig	- if called  by variant management to get variant config
	* @return {object} config used to render the charts or get variant management object based on bIsVariantConfig
	*/
	SmartVisualFilterBar.prototype._convertSettingsToConfig = function(settings, bIsVariantConfig) {
		var config = {
			filterCompList: []
		};

		// Include group information, prepare the group information by field
		var groupList = this._getGroupList();
		var groupByFieldName = {};
		for (var i = 0; i < groupList.length; i++) {
			var group = groupList[i];

			for (var j = 0; j < group.fieldList.length; j++) {
				var field = group.fieldList[j];
				groupByFieldName[field.name] = {
					name: group.name,
					label: group.label
				};
			}
		}

		// By default the basic group is all available in the filter dialog, so get all field names and in the shownInFilterDialog, set the value to true if in this list
		var groupMap = this._getGroupMap();
		var basicGroup = groupMap["_BASIC"];
		var basicFieldNameList = [];
		if (basicGroup && basicGroup.fieldList) {
			for (var i = 0; i < basicGroup.fieldList.length; i++)
				basicFieldNameList.push(basicGroup.fieldList[i].name);
		}

		var measureMap = this._getMeasureMap(),
			filterList = settings.filterList,
			oVariantConfig = {};
		for (var i = 0; i < filterList.length; i++) {
			var filterCfg = filterList[i];

			var dimField = filterCfg.dimension.field;

			var measureField = measureMap[filterCfg.collectionPath][filterCfg.measure.field];
			var bIsCurrency = false;

			if (measureField.fieldInfo[V4Terms.ISOCurrency]){
				bIsCurrency = true;
			}

			var oConfigObject = {
				shownInFilterBar: filterCfg.selected,
				component: {
					type: filterCfg.type,
					properties: {
						sortOrder : filterCfg.sortOrder,
						measureField: filterCfg.measure.field,
						parentProperty: filterCfg.parentProperty ? filterCfg.parentProperty : undefined
					}
				}
			};

			if (!bIsVariantConfig) {
				// if not variant management add other properties to config object
				var oConfigExtendedObject = {
					shownInFilterDialog: filterCfg.selected || basicFieldNameList.indexOf(dimField) != -1,
					cellHeight: this.cellHeight,
					group: groupByFieldName[filterCfg.parentProperty],
					component: {
						cellHeight: this.compHeight + "rem",
						properties: {
							scaleFactor : filterCfg.scaleFactor,
							filterRestriction: filterCfg.filterRestriction,
							width: this.cellWidth + "px",
							height: this.compHeight + "rem",
							entitySet: filterCfg.collectionPath ? filterCfg.collectionPath : this.getEntitySet(),
							dimensionField: dimField,
							dimensionFieldDisplay: filterCfg.dimension.fieldDisplay,
							dimensionFilter: filterCfg.dimensionFilter,
							measureSortDescending: filterCfg.measure.descending === true || filterCfg.measure.descending == "true",
							unitField: measureField ? measureField.fieldInfo.unit : "",
							isCurrency: bIsCurrency,
							isMandatory: filterCfg.isMandatory,
							outParameter: filterCfg.outParameter ? filterCfg.outParameter : undefined,
							inParameters: filterCfg.inParameters ? filterCfg.inParameters : undefined
						}
					}
				};
				jQuery.extend(true, oConfigObject, oConfigExtendedObject);
				// convert the filter properties from the configuration (variant, annotation) into the control specific properties
				config.filterCompList.push(oConfigObject);
			} else {
				// create variant management object
				oVariantConfig[filterCfg.parentProperty] = oConfigObject;
			}
		}

		return bIsVariantConfig ? oVariantConfig : config;
	};

	SmartVisualFilterBar.prototype._setVariantModified = function() {
		if (this._oVariantManagement)
			this._oVariantManagement.currentVariantSetModified(true);
	};

	SmartVisualFilterBar.prototype._onFilterChange = function(ev) {
		this._setVariantModified();


		// Propagate to the other filters and the Smart Chart/Table
		var itemList = this.getItems();
		var filterItemList = [];
		for (var i = 0; i < itemList.length; i++)
			filterItemList.push(itemList[i].getSouth().getContent());

		// Fire the external filter change event
		// event handler should always call setCompactFilterData with compact filter data
		this.fireFilterChange({
			filterList: ev.getParameter('filterList'),
			property: ev.getParameter('property'),
			filterRestriction: ev.getParameter('filterRestriction')
		});
		// update internal filter item
		// done after external filter change so that compact filter data is set
		// and can be used
		this._updateFilterItemList(filterItemList);
	};

	/**
	 * @private
	 * Create filter query for each filter Item based on the
	 * filter item in the bar. Also updated selected indicator for filter item
	 *
	 * @param {array} filterItemList - list of al filter item instances in the bar
	 * @returns {void}
	 */
	SmartVisualFilterBar.prototype._updateFilterItemList = function(filterItemList) {
		var filterItemWithFilters = [];

		for (var i = 0; i < filterItemList.length; i++) {
			var filterItem = filterItemList[i];

			var filterList = filterItem.getDimensionFilter();

			if (!filterList)
				filterList = [];

			filterItemWithFilters.push({
				dimensionField: filterItem.getDimensionField(),
				inParameters: filterItem.getInParameters(),
				parentProperty: filterItem.getParentProperty(),
				filterList: filterList,
				filterItem: filterItem
			});
		}

		for (var i = 0; i < filterItemWithFilters.length; i++) {
			var filterItem = filterItemWithFilters[i].filterItem;

			var filter = this._combineFilterLists(filterItemWithFilters, i);
			filterItem.setDimensionFilterExternal(filter);
		}
	};

	SmartVisualFilterBar.prototype._combineFilterLists = function(filterItemList, excludeIndex) {
		// Get all of the filter values, at the same time join filter values from different filter items which have the same dimension field
		var oPropertyFilters = {},
			inParams = (filterItemList.length > 0 && filterItemList[excludeIndex] && filterItemList[excludeIndex].inParameters) ? filterItemList[excludeIndex].inParameters : undefined,
			parentProperty = (filterItemList.length > 0 && filterItemList[excludeIndex] && filterItemList[excludeIndex].parentProperty) ? filterItemList[excludeIndex].parentProperty : undefined,
			mappedLocalDataProperty = [];

		var filters = new sap.ui.model.Filter({
			aFilters: [],
			and: true
		});

		if (inParams) {
			var replaceSPath = function (element) {
				// change property path from local data property to value list property
				// since query for filter item will be made to collection path
				element.sPath = valueListProperty;
			};
			// reverse loop since for compact filters also the last in param is considered first
			for (var key = (inParams.length - 1); key > -1; key--) {
				var localDataProperty = inParams[key].localDataProperty,
				valueListProperty = inParams[key].valueListProperty;

				// Build the set of filters


				if (localDataProperty !== parentProperty && mappedLocalDataProperty.indexOf(localDataProperty) === -1) {
					// get filters for property from smart filter bar
					oPropertyFilters = this._smartFilterContext.getFilters([localDataProperty]);
					if (oPropertyFilters && oPropertyFilters.length > 0) {
						// since filter is for specific property hence
						// there will always be one global filter with index 0
						if (oPropertyFilters[0].aFilters) {
							// if in param property is filter-restriction=multi-value
							oPropertyFilters[0].aFilters.forEach(replaceSPath.bind(this));
						} else {
							// if in param property is filter-restriction=single-value or filter-restriction=interval
							replaceSPath(oPropertyFilters[0]);
						}
						// map of properties that have already been considered for in params
						mappedLocalDataProperty.push(localDataProperty);
						// add to main filter with and condition
						filters.aFilters.push(oPropertyFilters[0]);
					}
				}
			}
		}
		return filters;
	};

	SmartVisualFilterBar.prototype._createTitleToolbar = function(props, filterItem) {
		var title = new Label({
			text: {
				path: "i18n>VIS_FILTER_TITLE_MD",
				formatter: function() {
					return filterItem.getTitle();
				}
			}
		});

		var selectedBtn = new Link({
			text: {
				path: "_filter>/" + filterItem.getParentProperty(),
				formatter: function(oContext) {
					if (oContext) {
						var count = 0;
						if (typeof oContext === "object") {	//For multi value
							if (oContext.value) {	//Add single value
								count++;
							}
							//Add items
							if (oContext.items) {	//items can be null
								count += oContext.items.length;
							}
							//Add ranges
							if (oContext.ranges) {	//ranges can be null
								count += oContext.ranges.length;
							}
						} else {	//For single value, it can be string or int
							count++;
						}

						var i18n = this.getModel("i18n");
						var rb = i18n.getResourceBundle();
						return rb.getText("VISUAL_FILTER_SELECTED_FILTERS", [count]);
					}
					return "";
				}
			},
			visible: {
				path: "_filter>/" + filterItem.getParentProperty(),
				formatter: function(oContext) {
					if (!oContext) { //No filter set for this property
						return false;
					}
					//Handle multiple values
					if (typeof oContext === "object") {
						return (oContext.value || (oContext.items && oContext.items.length) || (oContext.ranges && oContext.ranges.length)) ? true : false;
					} else if (oContext) { //Single value fields
						return true;
					}
					return false;
				}
			},
			enabled: "{= !${_templPriv>/alp/visualFilter/" + filterItem.getParentProperty() + "/hasMultiUnit} }",
			press: function(ev) {
				VisualFilterDialogController.launchAllFiltersPopup(selectedBtn, filterItem, ev.getSource().getModel('i18n'));
			},
			layoutData: new sap.m.ToolbarLayoutData({
				shrinkable: false
			})
		});

		var toolbar = new OverflowToolbar({
			design: sap.m.ToolbarDesign.Transparent,
			width: this.cellWidth + "px",
			content: [
				title,
				new ToolbarSpacer(),
				selectedBtn
			]
		});

		toolbar.addStyleClass("alr_visualFilterTitleToolbar");

		return toolbar;
	};

	SmartVisualFilterBar.prototype.getTitleByFilterItemConfig = function(filterConfig, unitValue, scaleValue) { // used when the filter item + data is not present, ideally called on the filter item iteslf
		var props = filterConfig.component.properties;
		var entitySet = props.entitySet;
		var model = this.getModel();

		if (!model)
			return "";

		var basePath = "/" + entitySet + "/";
		var measureLabel = model.getData(basePath + props.measureField + "/#@sap:label");
		var dimLabel = model.getData(basePath + props.dimensionField + "/#@sap:label");

		// Get the Unit
		if (!unitValue)
			unitValue = "";

		// Get the Scale factor
		if (!scaleValue)
			 scaleValue = "";

		var titleText = "";
		var rb = this.getModel("i18n").getResourceBundle();
		if (scaleValue && unitValue)
			titleText = rb.getText("VIS_FILTER_TITLE_MD_UNIT_CURR", [measureLabel, dimLabel, scaleValue, unitValue]);
		else if (unitValue)
			titleText = rb.getText("VIS_FILTER_TITLE_MD_UNIT", [measureLabel, dimLabel, unitValue]);
		else if (scaleValue)
			titleText = rb.getText("VIS_FILTER_TITLE_MD_UNIT", [measureLabel, dimLabel, scaleValue]);
		else
			titleText = rb.getText("VIS_FILTER_TITLE_MD", [measureLabel, dimLabel]);

		return titleText;
	};

	SmartVisualFilterBar.prototype._onTitleChange = function(ev) {
		var source = ev.getSource();

		var itemList = this.getItems();
		for (var i = 0; i < itemList.length; i++) {
			var item = itemList[i];

			var filterItem = item.getSouth().getContent();
			if (filterItem == source) {
				var labelItem = item.getNorth().getContent().getContent()[0];
				// If Mandatory Property the add an (*)
				if (source.getProperty("isMandatory")) {
					labelItem.addStyleClass("sapMLabelRequired");
				}
				labelItem.setText(filterItem.getTitle());
				labelItem.setTooltip(filterItem.getTitle());
				break;
			}
		}
	};

	SmartVisualFilterBar.prototype._getSupportedFilterItemList = function() {
		// predefined set of controls, order preserved
		if (!this._supportedFilterItemList) {
			this._supportedFilterItemList = [{
					type: "Bar",
					className: "sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.FilterItemChartBar",
					iconLink: "sap-icon://horizontal-bar-chart",
					textKey: "VISUAL_FILTER_CHART_TYPE_BAR"
				}, {
					type: "Donut",
					className: "sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.FilterItemChartDonut",
					iconLink: "sap-icon://donut-chart",
					textKey: "VISUAL_FILTER_CHART_TYPE_Donut"
				}, {
					type: "Line",
					className: "sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.FilterItemChartLine",
					iconLink: "sap-icon://line-charts",
					textKey: "VISUAL_FILTER_CHART_TYPE_Line"
				}
			];
		}

		return this._supportedFilterItemList;
	};

	SmartVisualFilterBar.prototype._getSupportedFilterItemMap = function() {
		if (!this._supportedFilterItemMap) {
			this._supportedFilterItemMap = {};

			var compList = this._getSupportedFilterItemList();
			for (var i = 0; i < compList.length; i++) {
				var comp = compList[i];
				this._supportedFilterItemMap[comp.type] = comp;
			}
		}

		return this._supportedFilterItemMap;
	};

	/**
	* set config to create visual filters
	* Will be called after all annotations + variants + application settings have been combined, will create the visual filters
	*
	* @param {object} config - config to create visual filters
	* @param {boolean} bSilentFilterChange - if true visual filter change is not fired
	* @param {boolean} bShouldNotUpdateFilterItem - whether filter item should be updated
	* @returns {object} config for the visual filter to determine behaviour of each filter item
	*/
	SmartVisualFilterBar.prototype.setConfig = function(config, bSilentFilterChange, bShouldNotUpdateFilterItem) {
		var lastConfig = this.getProperty("config");
		this.setProperty("config", config);

		this.removeAllItems();

		if (!config.filterCompList) {
			jQuery.sap.log.warning("Expecting a filterCompList as part of the configuration");
			return;
		}

		var dimMap = this._getDimensionMap();

		var filterItemList = [];
		for (var i = 0; i < config.filterCompList.length; i++) {
			var cellConfig = config.filterCompList[i];
			if (!cellConfig.shownInFilterBar) // check if should be rendered in the filterbar, or only shown in the dialog
				continue;

			var compConfig = cellConfig.component;
			compConfig.type = this._resolveChartType(compConfig.type);

			// Setup the properties
			var properties = jQuery.extend({}, compConfig.properties); // make a copy so changes can be made

			// Dealing with DateTime some charts require a different chart or axis type
			var dimField = dimMap[properties.entitySet][properties.dimensionField];
			properties.dimensionFieldIsDateTime = dimField ? dimField.fieldInfo.type == "Edm.DateTime" : false;

			// Component initialization
			var compInst = this._createFilterItemOfType(compConfig.type, properties);
			compInst.setModel(this.getModel());
			compInst.setModel(this.getModel("_templPriv"), "_templPriv");
			// Attach events
			if (compInst.attachFilterChange)
				compInst.attachFilterChange(this._onFilterChange, this);

			if (compInst.attachTitleChange)
				compInst.attachTitleChange(this._onTitleChange, this);

			// Label initialization, part of the title is derived from the component properties
			var toolbar = this._createTitleToolbar(properties, compInst);

			// Add the label and component to the Header cell
			var cell = new HeaderCell({
				height: cellConfig.cellHeight,
				north: new HeaderCellItem({
					height: this.labelHeight + "rem",
					content: toolbar
				}),
				south: new HeaderCellItem({
					height: compConfig.cellHeight,
					content: compInst
				})
			});

			filterItemList.push(compInst);

			this.addItem(cell);
		}

		if (lastConfig && !bSilentFilterChange) {
			this.fireFilterChange({
				filterItemList: filterItemList
			});
		}

		if (!bShouldNotUpdateFilterItem) {
			// update filter items as per in params
			this._updateFilterItemList(filterItemList);
		}
	};

	SmartVisualFilterBar.prototype._resolveChartType = function(type) {
		var compMap = this._getSupportedFilterItemMap();

		var compInfo = compMap[type];
		if (!compInfo) {
			var aType;
			for (aType in compMap) {
				compInfo = compMap[aType];
				break;
			}

			jQuery.sap.log.error("Could not resolve the filter component type: \"" + type + "\", falling back to " + aType);
			type = aType;
		}

		return type;
	};

	SmartVisualFilterBar.prototype._createFilterItemOfType = function(type, properties) {
		var compMap = this._getSupportedFilterItemMap();
		var compInfo = compMap[type];

		var className = compInfo.className;

		jQuery.sap.require(className);
		var compClass = jQuery.sap.getObject(className);

		var compInst = new compClass(properties); // Instantiate and apply properties
		return compInst;
	};
	/**
	* Returns config for visual filter
	*
	* @param {boolean} bIsVariantConfig - if config should be for variant or not
	* @returns {object} config for the visual filter to determine behaviour of each filter item
	*/
	SmartVisualFilterBar.prototype.getConfig = function(bIsVariantConfig) {
		var config = this.getProperty("config"),
			oVariantConfig = {};

		if (!config)
			return {filterCompList: []};

		var itemIndex = 0;
		var itemList = this.getItems();
		for (var i = 0; i < config.filterCompList.length; i++) {
			var compConfig = config.filterCompList[i];
			if (bIsVariantConfig) {
				// generate config for variant management
				oVariantConfig[compConfig.component.properties.parentProperty] = {
					shownInFilterBar: compConfig.shownInFilterBar,
					component: {
						type: compConfig.component.type,
						properties: {
							measureField: compConfig.component.properties.measureField,
							sortOrder: compConfig.component.properties.sortOrder,
							parentProperty: compConfig.component.properties.parentProperty
						}
					}
				};
			} else {
				// generate config for visual filter bar
				if (!compConfig.shownInFilterBar) // If not shown, then no changes to collect, so go to the next
					continue;

				// there will be a corresponding UI entry, ask for the latest configuration from each
				var item = itemList[itemIndex];
				if (!item) {
					jQuery.sap.log.error("The configured selected filter bar items do not correspond to the actual filter bar items.  Could be an error during initialization, e.g. a chart class not found");
					return {filterCompList: []};
				}

				itemIndex++;

				var compInst = item.getSouth().getContent();
				compConfig.component.properties = compInst.getP13NConfig();
			}
		}

		return bIsVariantConfig ? oVariantConfig : config;
	};

	/////////////////////
	// Variant handling
	/////////////////////
	SmartVisualFilterBar.prototype.setSmartVariant = function(oSmartVariantId) {
		this.setAssociation("smartVariant", oSmartVariantId);

		if (oSmartVariantId) {
	        var oPersInfo = new PersonalizableInfo({
	            type: "sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.SmartVisualFilterBar",
	            keyName: "persistencyKey"
	        });
			oPersInfo.setControl(this);
		}

		this._oVariantManagement = this._getVariantManagementControl(oSmartVariantId);
		if (this._oVariantManagement) {
			this._oVariantManagement.addPersonalizableControl(oPersInfo);
			this._oVariantManagement.initialise(this._variantInitialised, this);
			this._oVariantManagement.attachSave(this._onVariantSave, this);
		}
		else if (oSmartVariantId) {
			if (typeof oSmartVariantId === "string")
				jQuery.sap.log.error("Variant with id=" + oSmartVariantId + " cannot be found");
			else if (oSmartVariantId instanceof sap.ui.core.Control)
				jQuery.sap.log.error("Variant with id=" + oSmartVariantId.getId() + " cannot be found");
		}
		else {
			jQuery.sap.log.error("Missing SmartVariant");
		}
	};

	SmartVisualFilterBar.prototype._getVariantManagementControl = function(oSmartVariantId) {
		var oSmartVariantControl = null;
		if (oSmartVariantId) {
			oSmartVariantControl = typeof oSmartVariantId == "string" ? sap.ui.getCore().byId(oSmartVariantId) : oSmartVariantId;

			if (oSmartVariantControl && !(oSmartVariantControl instanceof SmartVariantManagement)) {
				jQuery.sap.log.error("Control with the id=" + oSmartVariantId.getId ? oSmartVariantId.getId() : oSmartVariantId + " not of expected type");
				return null;
			}
		}

		return oSmartVariantControl;
	};

	SmartVisualFilterBar.prototype._variantInitialised = function() {
		if (!this._oCurrentVariant)
			this._oCurrentVariant = "STANDARD";
	};

	SmartVisualFilterBar.prototype._onVariantSave = function() {
		if (this._oCurrentVariant == "STANDARD") // changes were made, so get the current configuration
			this._oCurrentVariant = {
				config: this.getConfig(true)
			};
	};


	SmartVisualFilterBar.prototype.applyVariant = function(oVariantJSON, sContext) {
		this._oCurrentVariant = oVariantJSON;
		if (this._oCurrentVariant == "STANDARD")
			this._oCurrentVariant = null;
		// check if this is old variant
		// old variant used to store filterCompList in config
		if (this._oCurrentVariant && this._oCurrentVariant.config && this._oCurrentVariant.config.filterCompList) {
			// if old variant, set config to null so that annotations can be considered for the chart
			this._oCurrentVariant.config = null;
		}

		if (this._oCurrentVariant && this._oCurrentVariant.config == null) { // then STANDARD, but STANDARD variant was requested before annotations were ready
			var annoSettings = this._getAnnotationSettings();
			if (annoSettings && annoSettings.filterList) {
				this._oCurrentVariant.config = this._convertSettingsToConfig(annoSettings, true);
			}
		}

		this._updateFilterBar();

		//Need to unmark the dirty flag because this is framework
		//applying the variant and firing filter to update table/chart
		if (this._oVariantManagement) {
			this._oVariantManagement.currentVariantSetModified(false);
		}
	};

	SmartVisualFilterBar.prototype._getVariantConfig = function() {
		return this._oCurrentVariant;
	};

	SmartVisualFilterBar.prototype.fetchVariant = function() {
		if (!this._oCurrentVariant || this._oCurrentVariant == "STANDARD") {
			var annoSettings = this._getAnnotationSettings();
			if (annoSettings && annoSettings.filterList) {
				this._oCurrentVariant = {
					config: this._convertSettingsToConfig(annoSettings, true)
				};
				return this._oCurrentVariant;
			}
			else {
				return {
					config: null
				};
			}
		}

		return {
			config: this.getConfig(true)
		};
	};

	//Equivalent of clear filters in compact filter
	SmartVisualFilterBar.prototype.clearFilters = function(){
		//var config = this.getConfig();
		var config = this.getProperty('config');
		for (var i = 0; i < config.filterCompList.length; i++){
			var filterItem = config.filterCompList[i];
			filterItem.component.properties.dimensionFilter = [];
		}
		this.setConfig(config);
	};
	/**
	 * Takes fitler data from compact filter and updates config for visual filter items
	 * Also triggers changes to other visual filter items and main content area.
	 *
	 * @param {object} compactpactFilters - compact filter data to be merged with visual filter
	 * @param {boolean} bIsTriggerdAfterVariantSFBLoad - whether triggered after SFB varaiant load or not
	 * @returns {void}
	 */
	SmartVisualFilterBar.prototype.mergeCompactFilters = function(compactFilters, bIsTriggerdAfterVariantSFBLoad){
		this._compactFilters = {};
		//this.clearFilters();
		if (!compactFilters) {
			return;
		}
		this._compactFilters = compactFilters;
		var aAllFilterConfig,
			oDimensionFilterByParentProp = {},
			aPropertiesMergedFromCompact = [];

		var oConfig = ( bIsTriggerdAfterVariantSFBLoad && FilterUtil.readProperty(this, "_oVariantConfig.filterCompList.length")) ? this._oVariantConfig : this.getConfig();

		if (Object.keys(oConfig).length < 0) {
			jQuery.sap.log.error('Config not ready for visual filter');
			return;
		}
		// check if config exists
		if (oConfig && oConfig.filterCompList.length > 0) {
			aAllFilterConfig = oConfig.filterCompList;

			for (var i = 0; i < aAllFilterConfig.length; i++) {
				var oFilterItemProps = aAllFilterConfig[i].component.properties,
					sOutParameter = oFilterItemProps.outParameter,
					sParentProperty = oFilterItemProps.parentProperty,
					aDimFilterList = [];

				// clearing all filters
				oFilterItemProps.dimensionFilter = [];

				if (sOutParameter) {
					var aDimFilterList = [];

					// check compact filters for out parameter
					// because out parameter is responsible for interaction between
					// visual filter and main area
					if (this._compactFilters[sOutParameter]) {
						aPropertiesMergedFromCompact.push(sOutParameter);
						aDimFilterList = this._addToFiltersFromCompact(sOutParameter);
					}
				}

				oFilterItemProps.dimensionFilter = aDimFilterList;

				oDimensionFilterByParentProp[sParentProperty] = aDimFilterList;
			}
		}
		// set config to re render filter items as per compact filters
		// pass true so that filter change is not triggered
		this.setConfig(oConfig, true);
	};
	/**
	 * @private
	 * creates filters from compact filter data
	 *
	 * @param {string} sProperty - property from compact filter data to be added to filter
	 * @returns {array} array of filters for one property with key and display value
	 */
	SmartVisualFilterBar.prototype._addToFiltersFromCompact = function (sProperty) {
		var aFilters = [],
		// The below check is to add all type of filters other than the object and undefined ones to the  filter dialog from Compact filter
		bIsSingleValue = this._compactFilters[sProperty] && (typeof this._compactFilters[sProperty] !== 'object'),
		aFilterValueItems = this._compactFilters[sProperty].items,
		aFilterValueRanges = this._compactFilters[sProperty].ranges,
		aFilterValue = this._compactFilters[sProperty].value;

		//Interval based filters
		if (this._compactFilters[sProperty].low) {
			var sLabel = this._compactFilters[sProperty].low;
			if (this._compactFilters[sProperty].high) {
				sLabel += "-" + this._compactFilters[sProperty].high;
			}
			aFilters.push({
				dimValue: sLabel,
				dimValueDisplay: sLabel
			});
		}

		if (bIsSingleValue) {
			// for sap:filter-restriction="single-value"
			aFilters.push({
				dimValue: this._compactFilters[sProperty],
				dimValueDisplay: this._compactFilters[sProperty]
			});
		}

		if (aFilterValueItems) { // for sap:filter-restriction="multi-value"
			for (var j = 0; j < aFilterValueItems.length; j++) {
				aFilters.push({
					dimValue: aFilterValueItems[j].key,
					dimValueDisplay: aFilterValueItems[j].text
				});
			}
		}

		// consider complex conditions/ defined conditions as well
		if (aFilterValueRanges) {
			for (var j = 0; j < aFilterValueRanges.length; j++) {
				//filterByDim[property].push(filterValues[j].key);
				aFilters.push({
					dimValue: aFilterValueRanges[j].tokenText ? aFilterValueRanges[j].tokenText : FilterUtil.createTitleFromCode(aFilterValueRanges[j]),
					dimValueDisplay: aFilterValueRanges[j].tokenText,
					keyField: aFilterValueRanges[j].keyField,
					operation: aFilterValueRanges[j].operation,
					tokenText: aFilterValueRanges[j].tokenText,
					value1: aFilterValueRanges[j].value1,
					value2: aFilterValueRanges[j].value2
				});
			}
		}

		// consider user typed in values
		if (aFilterValue) {
			aFilters.push({
				dimValue: aFilterValue,
				dimValueDisplay: aFilterValue,
				bIsUserTypedIn: true
			});
		}

		return aFilters;
	};

	return SmartVisualFilterBar;

}, /* bExport= */true);
