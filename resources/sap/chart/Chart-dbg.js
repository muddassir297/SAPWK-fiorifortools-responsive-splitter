/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define([
	'sap/chart/library',
	'sap/viz/ui5/controls/VizFrame',
	'sap/viz/ui5/controls/common/BaseControl',
	'sap/viz/ui5/data/Dataset',
	'sap/viz/ui5/data/FlattenedDataset',
	'sap/viz/ui5/data/DimensionDefinition',
	'sap/viz/ui5/data/MeasureDefinition',
	'sap/chart/data/Dimension',
	'sap/chart/data/TimeDimension',
	'sap/chart/data/Measure',
	'sap/ui/model/analytics/ODataModelAdapter',
	'sap/chart/utils/RoleFitter',
	'sap/chart/utils/ChartUtils',
	'sap/chart/utils/SeriesColorTracker',
	'sap/chart/utils/ChartTypeAdapterUtils',
	'sap/chart/utils/DateFormatUtil',
	'sap/chart/utils/DataSourceUtils',
	'sap/chart/utils/SelectionAPIUtils',
	'sap/chart/utils/MeasureSemantics',
	'sap/viz/ui5/controls/common/feeds/FeedItem',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/analytics/odata4analytics',
	'sap/ui/model/Sorter',
	'sap/chart/TimeUnitType',
	'sap/chart/coloring/Colorings',
	'sap/chart/ChartLog'
], function(
	library,
	VizFrame,
	BaseControl,
	Dataset,
	FlattenedDataset,
	DimensionDefinition,
	MeasureDefinition,
	Dimension,
	TimeDimension,
	Measure,
	ODataModelAdapter,
	RoleFitter,
	ChartUtils,
	SeriesColorTracker,
	ChartTypeAdapterUtils,
	DateFormatUtil,
	DataSourceUtils,
	SelectionAPIUtils,
	MeasureSemanticsUtils,
	FeedItem,
	Filter,
	FilterOperator,
	odata4analytics,
	Sorter,
	TimeUnitType,
	Colorings,
	ChartLog
) {
	"use strict";

	var SelectionMode = sap.chart.SelectionMode;

	/**
	 * Constructor for a new Chart.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * UI5 Chart control
	 *
	 * @extends sap.viz.ui5.controls.common.BaseControl
	 *
	 * @constructor
	 * @public
	 * @since 1.32.0
	 * @alias sap.chart.Chart
	 */
	var Chart = BaseControl.extend("sap.chart.Chart", {
		metadata: {
			library: "sap.chart",
			properties: {
				/**
				 * Type of the Chart.
				 *
				 */
				chartType						: {type: "string", defaultValue: "bar"},
				/**
				 * Configuration for initialization to VizControl. This property could only set via settings parameter in Constructor.
			 	 */
				uiConfig : {type : "object", group : "Misc"},
				/**
				 * Names of the Dimensions to be displayed in the Chart, all available dimensions will automatically append when the property isAnalytical is false.
				 *
				 * Depending on chart type, insufficient number of visible <code>Dimension</code>s will cause error.
				 */
				visibleDimensions						: {type: "string[]", defaultValue: []},
				/**
				 * Names of the inResult dimensions.
				 *
				 * inResult dimension do not show up in chart layout, i.e. axis/legend. They do show in tooltip, popover, and in selection results.
				 */
				inResultDimensions						: {type: "string[]", defaultValue: []},
				/**
				 * Names of the Measures to be displayed in the Chart.
				 *
				 * Depending on chart type, insufficient number of visible <code>Measure</code>s will cause errors.
				 */
				visibleMeasures						  : {type: "string[]", defaultValue: []},
				/** Chart properties, refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details. */
				vizProperties								: {type: "object", group: "Misc"},/**
				/** Chart scales, refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details. */
				vizScales										: {type : "object[]", group : "Misc"},
				/** Whether or not an aggregated entity set is bound to the chart. */
				isAnalytical								 : {type: "boolean"},
				/**
				 * Chart selection behavior.
				 *
				 */
				selectionBehavior						: {type: "sap.chart.SelectionBehavior", defaultValue: sap.chart.SelectionBehavior.DataPoint},
				/**
				 * Chart selection mode.
				 *
				 */
				selectionMode			: {type: "sap.chart.SelectionMode", defaultValue: sap.chart.SelectionMode.Multi},
				/**
				 * Enable pagination mode.
				 *
				 * Pagination mode empowers users to visualize dataset page by page by scrolling back or forth. Currently there are some limitations of this mode in some chart transversal features, such as:
				 * <ol>
				 *   <li>Selection status might lost for new batch data</li>
				 *   <li>Keyboard navigation will be only available for current continuous batch data</li>
				 *	 <li>Zoom out might have inconsistent behavior, Hence the gesture in mobile might have the same issue</li>
				 *	 <li>Time charts did not enable pagination yet</li>
				 *	 <li>Series color might be inconsistent before/after jump pages</li>
				 * </ol>
				 * Please refer to release notes for details.
				 */
				enablePagination			 : {type: "boolean", defaultValue: false},
				/**
				 * 
				 Chart custom messages.
				*/
				customMessages				  : {type: "object", defaultValue: null},
				/**
				 * Chart colorings.
				 * 
				 * Holds an object with information about the possible options how colors can be applied for indicating <code>Criticality</code> or <code>Emphasis</code> in the chart. 
				 * <pre>
				 * Colorings: {
				 *     Criticality: { 
				 *         …
				 *     },
				 *     Emphasis: {
				 *         …
				 *     }
				 * }
				 * </pre>
				 *  
				 * Refer to<br/>
				 *   {@link sap.chart.ColoringType.Criticality}<br/>
				 *   {@link sap.chart.ColoringType.Emphasis}<br/>
				 * for detailed usage
				 */
				colorings: {type: "object", defaultValue: null},
				/**
				 * Active coloring configurations.
				 *
				 * specifies which coloring of the possible colorings is to be applied for the current chart layout. It holds an object with two properties：
				 *
				 * <ol>
				 *   <li>coloring: <b>mandatory</b>, specify which kind of coloring should take effect in current chart layout. Possible values refer to {@link sap.chart.ColoringType}</li>
				 *   <li>parameters:
				 *     <ul>
				 *       <li>
				 *         <code>Criticality</code> supports two parameters: <code>"dimension"</code> and <code>"measure"</code>. Both are <b>optional</b>, one (and only one) must be provided.
				 *         This setting disambiguates when multiple colorings for different visible dimensions and measures are applicable.
				 *
				 *         <code>"measure"</code> supports two input types:
				 *           <ol>
				 *             <li><code>string</code> for single measure name</li>
				 *             <li><code>string[]</code> of multiple measure names(only supported in <b>static</b>), which is relevant in case of a <b>static</b> measure criticality defined on multiple measures.</li>
				 *           </ol>
				 *         <code>"dimension"</code> holds the dimension name as string value.
				 *       </li>
				 *       <li>
				 *         <code>Emphasis</code> supports only one parameter: <code>"dimension"</code> which is <b>optional</b>.
				 *
				 *         <code>"dimension"</code> holds the dimension name as string value.
				 *       </li>
				 *     </ul>
				 *   </li>
				 * </ol>
				 *
				 * Example:
				 * <pre>
				 * activeColoring: {
				 *     coloring: sap.chart.ColoringType.Criticality,
				 *     parameters: {
				 *         dimension: "AvailabilityStatus”
				 *     }
				 * }
				 * </pre>
				 */
				activeColoring: {type: "object", defaultValue: null}

			},
			aggregations: {
				/** Actual data. It can be bound to an (analytical) OData model. */
				data	   : {type: "sap.ui.core.Element", multiple: true, bindable: "bindable"},
				/** Internal VizFrame instance which does the actual rendering work. */
				_vizFrame  : {type: "sap.viz.ui5.controls.VizFrame", multiple: false, visibility: "hidden"},
				/** Dimensions of the data. */
				dimensions : {type: "sap.chart.data.Dimension", multiple: true},
				/** Measures of the data. */
				measures   : {type: "sap.chart.data.Measure", multiple: true}
			},
			events: {
				/** fired after a drill-down operation */
				drilledDown : {
					parameters : {
						/** array of strings holding the names of the added dimensions */
						dimensions : {type : "string[]"}
					}
				},
				/** fired after a drill-up operation */
				drilledUp : {
					parameters : {
						/** array of strings holding the names of the removed dimensions */
						dimensions : {type : "string[]"}
					}
				},
				/** Event fires when the rendering ends. */
				renderComplete : {},
				/** Event fires when certain data point(s) is(are) selected, data context of selected item(s) would be passed in. */
				selectData	   : {},
				/** Event fires when certain data point(s) is(are) deselected, data context of deselected item(s) would be passed in */
				deselectData   : {}
			}
		},
		renderer: function(oRm, oControl) {
			// write the HTML into the render manager
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addStyle("width", oControl.getWidth());
			oRm.addStyle("height", oControl.getHeight());
			oRm.writeStyles();
			oRm.write(">");

			oRm.renderControl(oControl.getAggregation("_vizFrame"));

			oRm.write("</div>");
		}
	});

	Chart.getMetadata().getAggregation("data")._doesNotRequireFactory = true;

	// ******** Overridden property getters/setters ********

	function vizFrameSize (sValue) {
		return sValue.indexOf("%") !== -1 ? "100%" : sValue;
	}
	Chart.prototype.setHeight = function(sValue) {
		this.setProperty("height", sValue);
		var oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			oVizFrame.setHeight(vizFrameSize(this.getProperty("height")));
		}
		return this;
	};

	Chart.prototype.setWidth = function(sValue) {
		this.setProperty("width", sValue);
		var oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			oVizFrame.setWidth(vizFrameSize(this.getProperty("width")));
		}
		return this;
	};

	Chart.prototype.setChartType = function(sChartType, bSuppressInvalidate) {
		this.setProperty("chartType", sChartType, bSuppressInvalidate);
		this._bIsPagingChartType =  ChartUtils.CONFIG.pagingChartTypes.indexOf(sChartType) > -1;
		if (this._isEnablePaging()) {
			this._initPagination(true);
		} else {
			var oDataset = this._getDataset();
			if (oDataset) {
				oDataset.setPagingOption(null);
			}
		}
		this._invalidateBy({
			source: this,
			keys: {
				vizFrame: true
			}
		});

		this._bNeedToApplyDefaultProperties = true;
		return this;
	};

	Chart.prototype.setColorings = function(oValue) {
		this.setProperty("colorings", oValue);

		this._invalidateBy({
			source: this,
			keys: {
				vizFrame: true,
				checkBinding: true
			}
		});

		return this;
	};

	Chart.prototype.setActiveColoring = function(oValue) {
		this.setProperty("activeColoring", oValue);

		this._invalidateBy({
			source: this,
			keys: {
				vizFrame: true,
				checkBinding: true
			}
		});

		return this;
	};

	/**
	 * Removes a dimension from the aggregation dimensions, remove a visible dimension is unsupported when the property isAnalytical is false.
	 *
	 * @public
	 *
	 * @param {int|string|sap.chart.data.Dimension} oDimension
	 * The dimension to remove or its index or id.
	 *
	 * @return {sap.chart.data.Dimension} The removed dimension or null
	 */
	Chart.prototype.removeDimension = function(oDimension) {
		var aVisibleDimensions = this._getVisibleDimensions() || [];
		var iIndex;
		if (this.getIsAnalytical() === false && oDimension && oDimension.getName()) {
			iIndex = aVisibleDimensions.indexOf(oDimension.getName());
			if (iIndex !== -1) {
				jQuery.sap.log.error('Data source does not support aggregation. The method "removeDimension" therefore cannot be used!');
				return;
			}
		}
		var oResult = this.removeAggregation("dimensions", oDimension);

		if (oResult) {
			iIndex = aVisibleDimensions.indexOf(oResult.getName());
			if (iIndex !== -1) {
				aVisibleDimensions.splice(iIndex, 1);
				this.setVisibleDimensions(aVisibleDimensions);
			}
			var aInResultDimensions = this.getInResultDimensions() || [];
			iIndex = aInResultDimensions.indexOf(oResult.getName());
			if (iIndex !== -1) {
				aInResultDimensions.splice(iIndex, 1);
				this.setInResultDimensions(aInResultDimensions);
			}
		}
		return oResult;
	};

	/**
	 * Removes all the controls from the aggregation dimensions, only works when the property isAnalytical is true.
	 *
	 * Additionally, it unregisters them from the hosting UIArea.
	 *
	 * @public
	 *
	 * @return {sap.chart.data.Dimension[]} An array of the removed elements (might be empty)
	 */
	Chart.prototype.removeAllDimensions = function() {
		var oResult;
		if (this.getIsAnalytical() === false) {
			jQuery.sap.log.error('Data source does not support aggregation. The method "removeAllDimensions" therefore cannot be used!');
		} else {
			oResult = this.removeAllAggregation("dimensions");
			this.setVisibleDimensions([]);
			this.setInResultDimensions([]);
		}
		return oResult;
	};

	/**
	 * Destroys all the dimensions in the aggregation dimensions, only works when the property isAnalytical is true.
	 * 
	 * @public
	 *
	 * @return {sap.chart.Chart} Reference to this in order to allow method chaining
	 */
	Chart.prototype.destroyDimensions = function() {
		var oResult;
		if (this.getIsAnalytical() === false) {
			jQuery.sap.log.error('Data source does not support aggregation. The method "destroyDimensions" therefore cannot be used!');
		} else {
			oResult = this.destroyAggregation("dimensions");
			this.setVisibleDimensions([]);
			this.setInResultDimensions([]);
		}
		return oResult;
	};

	Chart.prototype.removeMeasure = function(oMeasure) {
		var oResult = this.removeAggregation("measures", oMeasure);

		if (oResult) {
			var aVisibleMeasures = this._getVisibleMeasures() || [],
			iIndex = aVisibleMeasures.indexOf(oResult.getName());
			if (iIndex !== -1) {
				aVisibleMeasures.splice(iIndex, 1);
				this.setVisibleMeasures(aVisibleMeasures);
			}
		}
		return oResult;
	};

	Chart.prototype.removeAllMeasures = function() {
		var oResult = this.removeAllAggregation("measures");
		this.setVisibleMeasures([]);
		return oResult;
	};

	Chart.prototype.destroyMeasures = function() {
		var oResult = this.destroyAggregation("measures");
		this.setVisibleMeasures([]);
		return oResult;
	};
	Chart.prototype._getVisibleDimensions = function(bNormalize) {
		var oStackTop = this._getDrillStateTop();
		var aDims = oStackTop ? oStackTop.dimensions : this.getProperty("visibleDimensions");
		return bNormalize ? this._normalizeDorM(aDims, true) : aDims;
	};

	Chart.prototype.getVisibleDimensions = function() {
		var aVisibleDimensions = this._getVisibleDimensions();
		return this._aFeeds ? aVisibleDimensions.filter(function(d) {
			return this._aFeeds._unused.indexOf(d) === -1;
		}, this) : aVisibleDimensions;
	};

	Chart.prototype._getVisibleMeasures = function(bNormalize) {
		var oStackTop = this._getDrillStateTop();
		var aMsrs = oStackTop ? oStackTop.measures : this.getProperty("visibleMeasures");
		return bNormalize ? this._normalizeDorM(aMsrs) : aMsrs;
	};

	Chart.prototype.getVisibleMeasures = function() {
		var aVisibleMeasures = this._getVisibleMeasures();
		return this._aFeeds ? aVisibleMeasures.filter(function(d) {
			return this._aFeeds._unused.indexOf(d) === -1;
		}, this) : aVisibleMeasures;
	};

	/**
	 * Sets a new value for property visibleDimensions.
	 * 
	 * Names of the Dimensions to be displayed in the Chart, all available dimensions will automatically append when the property isAnalytical is false.
	 * 
	 * Depending on chart type, insufficient number of visible Dimensions will cause error.
	 * 
	 * When called with a value of null or undefined, the default value of the property will be restored.
	 * 
	 * Default value is [].
	 *
	 * @public
	 *
	 * @param {string[]} sVisibleDimensions
	 * New value for property visibleDimensions
	 *
	 * @return {sap.chart.Chart} Reference to this in order to allow method chaining
	 */
	Chart.prototype.setVisibleDimensions = function(sVisibleDimensions, bSuppressInvalidate) {
		var mSanity = this._dimensionSanityCheck({visible: sVisibleDimensions});
		this.setProperty("visibleDimensions", sVisibleDimensions, bSuppressInvalidate);
		this.setProperty("inResultDimensions", mSanity.inResult, bSuppressInvalidate);
		this._createDrillStack();
		this._invalidateBy({
			source: this,
			keys: {
				binding: true,
				dataSet: true,
				vizFrame: true
			}
		});

		return this;
	};

	Chart.prototype.setInResultDimensions = function(aInResultDimensionNames, bSuppressInvalidate) {
		var mSanity = this._dimensionSanityCheck({inResult: aInResultDimensionNames});
		this.setProperty("inResultDimensions", aInResultDimensionNames, bSuppressInvalidate);
		this.setProperty("visibleDimensions", mSanity.visible, bSuppressInvalidate);
		this._createDrillStack();
		this._invalidateBy({
			source: this,
			keys: {
				binding: true,
				dataSet: true,
				vizFrame: true
			}
		});
	};

	Chart.prototype.setVisibleMeasures = function(aMeasureNames, bSuppressInvalidate) {
		this.setProperty("visibleMeasures", aMeasureNames, bSuppressInvalidate);
		this._createDrillStack();
		this._invalidateBy({
			source: this,
			keys: {
				binding: true,
				dataSet: true,
				vizFrame: true
			}
		});
		return this;
	};

	/**
	 * Sets a new value for property enablePagination, only works for oData model.
	 *
	 * Enable pagination mode.
	 * 
	 * Pagination mode empowers users to visualize dataset page by page by scrolling back or forth. Currently there are some limitations of this mode in some chart transversal features, such as:
	 * <ol>
	 *   <li>Selection status might lost for new batch data</li>
	 *   <li>Keyboard navigation will be only available for current continuous batch data</li>
	 *	 <li>Zoom out might have inconsistent behavior, hence the gesture in mobile might have the same issue</li>
	 *	 <li>Time charts did not enable pagination yet</li>
	 *	 <li>Series color might be inconsistent before/after jump pages</li>
	 * </ol>
	 * Please refer to release notes for details.
	 *
	 * When called with a value of null or undefined, the default value of the property will be restored.
	 * NOTE: setEnablePagination currently only works in constructor
	 * 
	 * Default value is false.
	 *
	 * @public
	 *
	 * @param {boolean}	bEnablePagination
	 * New value for property enablePagination
	 *
	 * @return {sap.chart.Chart} Reference to this in order to allow method chaining
	 */
	Chart.prototype.setEnablePagination = function(bEnablePagination, bSuppressInvalidate) {
		if (!this._bIsInitialized) {
			this.setProperty("enablePagination", bEnablePagination, bSuppressInvalidate);

			this._invalidateBy({
				source: this,
				keys: {
					binding: true,
					dataSet: true,
					vizFrame: true,
					drillStack: true
				}
			});
		}
		return this;
	};

	// ******** Private helper functions ********
	/*
	 * Since we allow inResult and visible to race for a Dimension, we need to move a Dimension out of visible if it's
	 * being set as InResult, and vice versa.
	 */
	Chart.prototype._dimensionSanityCheck = function(oDims) {
		var aVisibles = oDims.visible || this.getVisibleDimensions() || [],
			aInResult = oDims.inResult || this.getInResultDimensions() || [];

		var mSummary = [].concat(aVisibles).concat(aInResult).reduce(function(mSumm, sId) {
			var bVisible  = aVisibles.indexOf(sId) !== -1,
				bInResult = aInResult.indexOf(sId) !== -1;
			if (bVisible && bInResult) {
				mSumm.common[sId] = true;
			} else if (bVisible) {
				mSumm.visible[sId] = true;
			} else if (bInResult) {
				mSumm.inResult[sId] = true;
			}

			return mSumm;
		}, {
			visible: {},
			inResult:{},
			common:  {}
		});

		mSummary.visible = Object.keys(mSummary.visible);
		mSummary.inResult = Object.keys(mSummary.inResult);
		mSummary.common = Object.keys(mSummary.common);

		return mSummary;
	};

	Chart.prototype._prepareFeeds = function() {
		if (!this._aFeeds) {
			var aDimensions = this._normalizeDorM(this._getVisibleDimensions(), true),
				aMeasures = this._normalizeDorM(this._getVisibleMeasures(), false),
				aInResults = this._normalizeDorM(this.getInResultDimensions(), true);
			this._sAdapteredChartType = this.getEnablePagination() ? this.getChartType() : ChartTypeAdapterUtils.adaptChartType(this.getChartType(), aDimensions);
			this._aFeeds = RoleFitter.fit(this._sAdapteredChartType, aDimensions, aMeasures, aInResults, this._enableSemanticPattern());
			if ((!this._aFeeds._valid || this._aFeeds._unused.length) && this._sAdapteredChartType !== this.getChartType()) {
				// fall back to original chart type if feeding is invalid for adapted chart type
				this._sAdapteredChartType = this.getChartType();
				this._aFeeds = RoleFitter.fit(this._sAdapteredChartType, aDimensions, aMeasures, aInResults);
			}
			if (this._sAdapteredChartType !== this.getChartType()) {
				this._bNeedToApplyDefaultProperties = true;
			}
		}
		return this._aFeeds;
	};



	/**
	 * Convert an array containing any number of Dimension/Measure instances (object) and Dimension/Measure names (string)
	 * an array of Dimension/Measure instances. And filter out any Dimensions/Measures that are not in the Dimension/Measure
	 * aggregation.
	 *
	 * @param {array} aMixed the mixed array of Dimension/Measure instances and names
	 * @param {boolean} bIsDimension whether the input array are Dimensions
	 * @return {array} an array of Dimension/Measure instances that present in the visible Dimension/Measure aggregation
	 *				   result.error will contain all the non-normalizable input from the mixed array passed in
	 * @private
	 */
	Chart.prototype._normalizeDorM = function(aMixed, bIsDimension) {
		var aAll = bIsDimension ? this.getDimensions() : this.getMeasures(),
			mLookUp = aAll.reduce(function(mMap, oDimOrMsr) {
				mMap[oDimOrMsr.getName()] = oDimOrMsr;
				return mMap;
			}, {}),
			clazz = bIsDimension ? Dimension : Measure;

		var oResult = aMixed.reduce(function(oResult, oNameOrDM) {
			var sName;
			if (typeof oNameOrDM === "string") {
				sName = oNameOrDM;
			} else if (oNameOrDM instanceof clazz) {
				sName = oNameOrDM.getName();
			} else {
				oResult.errors.push(oNameOrDM);
			}
			if (mLookUp[sName]) {
				oResult.normalized.push(mLookUp[sName]);
			} else {
				oResult.errors.push(oNameOrDM);
			}
			return oResult;
		}, {
			normalized: [],
			errors: []
		});

		var aNormalized = oResult.normalized;
		if (oResult.errors.length > 0) {
			aNormalized.errors = oResult.errors;
		}

		return aNormalized;
	};

	/**
	 * Calculate redundant Dimensions and Measures from selected data points (selection)
	 * against visible Dimensions and Measures.
	 *
	 * A Dimension is considered to be redundant if all selected data points share the same value for it.
	 * A Measure is considered to be redundant if none of the selected data point are of this measure.
	 *
	 * @return {object} key, value pairs for redundant Dimensions and Measures.
	 *					For Dimensions, key is the Dimension name and value is the redundant value;
	 *					For Measures, key is "measureNames" and value is an map having the redundant Measure names as keys
	 * @private
	 */
	Chart.prototype._redundantsFromSelection = function() {
		var aSelections = this._getVizFrame().vizSelection();
		if (!aSelections || aSelections.length === 0) {
			return {measureNames: {}};
		}
		var oSemanticTuples = this._getContinuesSemanticTuples();	

		var mSelectionSummary = aSelections.reduce(function(mSummary, oSelection) {
			var aInvisibleSemMsr = [];
			for (var tuple in oSemanticTuples) {
				if (oSemanticTuples.hasOwnProperty(tuple)) {
					var semanticRule = oSemanticTuples[tuple];
					if (oSelection.data[tuple]) {
						//Filter measures according with semantic relations
						aInvisibleSemMsr.push((oSelection.data[semanticRule.timeAxis] < semanticRule.projectedValueStartTime) ? semanticRule.projected : semanticRule.actual);
					} else {
						//Filter internal unbound measures which is invisible for chart.
						aInvisibleSemMsr.push(semanticRule.actual);
						aInvisibleSemMsr.push(semanticRule.projected);
					}	
				}
			}

			jQuery.each(oSelection.data, function(k, v) {
				if (!(aInvisibleSemMsr.length > 0 && aInvisibleSemMsr.indexOf(k) > -1)) {
					if (!mSummary[k]) {
						mSummary[k] = [];
					}
					if (mSummary[k].indexOf(v) === -1) {
						mSummary[k].push(v);	
					}
				}
			});
			return mSummary;
		}, {});

		var mRedundants = this._getVisibleDimensions().reduce(function(mRedundantDimensions, sDimensionName) {
			var aValues = mSelectionSummary[sDimensionName];
			if (aValues.length === 1) {
				mRedundantDimensions[sDimensionName] = aValues[0];
			}
			return mRedundantDimensions;
		}, {});

		mRedundants.measureNames = this._getVisibleMeasures().reduce(function(mRedundantMeasures, sMsrName) {
			if (!mSelectionSummary[sMsrName]) {
				mRedundantMeasures[sMsrName] = true;
			}
			return mRedundantMeasures;
		}, {});

		return mRedundants;
	};

	/**
	 * Derive a filter from the selected data points (selection).
	 * The returned Filter will make sure only the Dimension values that presents in the selection are retained.
	 *
	 * NOTE: Redundant Measures is to be handled in the request rather than here in Filter
	 *
	 * @return {sap.ui.model.Filter} the Filter instance
	 * @private
	 */
	Chart.prototype._deriveFilterFromSelection = function() {
		var aVisibleDimensions = this._getVisibleDimensions();
		var that = this;
		var aFilterCfgs = this._getVizFrame().vizSelection().map(function(oSelection) {
			var oConfig = aVisibleDimensions.reduce(function(oFilterCfg, sDimensionName) {
				var oDimension = that.getDimensionByName(sDimensionName);
				var value;
				value = oSelection.data[sDimensionName];
				if (ChartUtils.CONFIG.timeChartTypes.indexOf(that._sAdapteredChartType) > -1 &&
					 oDimension instanceof TimeDimension) {
					var oDateInstance = DateFormatUtil.getInstance(oDimension.getTimeUnit());
					if (oDateInstance) {
						var fnFormat = oDateInstance.format.bind(oDateInstance);
						value = fnFormat(new Date(oSelection.data[sDimensionName]));
					}
				}
				oFilterCfg.filters.push(new Filter({path: sDimensionName, operator: FilterOperator.EQ, value1: value}));
				oFilterCfg.signature.push(sDimensionName + "=" + oSelection.data[sDimensionName]);
				return oFilterCfg;
			}, {
				filters: [],
				signature: []
			});
			oConfig.signature = oConfig.signature.join(";");
			return oConfig;
		});

		var mUniqFilters = aFilterCfgs.reduce(function(mFilters, oCfg) {
			if (!mFilters[oCfg.signature] && oCfg.filters.length > 0) {
				mFilters[oCfg.signature] = new Filter(oCfg.filters, true);
			}
			return mFilters;
		}, {});

		var aFilters = Object.keys(mUniqFilters).map(function(k) {
			return mUniqFilters[k];
		});
		if (aFilters.length > 1) {
			return new sap.ui.model.Filter(aFilters, false);
		} else if (aFilters.length === 1) {
			return aFilters[0];
		} else {
			return null;
		}
	};

	/**
	 * Check that the dimension to be drilled down actually can be drilled down
	 *
	 * @private
	 * @param {array} aIncomingDimensions an array of Dimensions to be drilled down
	 * @return {boolean} true if the chart can drill down on all provided Dimensions, otherwise return false
	 */
	Chart.prototype._checkDrilldownValid = function(aIncomingDimensions) {
		var mVisibleDimensions = this._getVisibleDimensions().concat(this.getInResultDimensions()).reduce(function(mMap, sDimensionName) {
			mMap[sDimensionName] = true;
			return mMap;
		}, {});

		// Prevent drill down again on dimensions that are visible already
		if (aIncomingDimensions.some(function(oDim) {
			return mVisibleDimensions[oDim.getName()];
		})) {
			jQuery.sap.log.error("Drill down not possible, because one of the given dimensions is already drilled down!");
			return false;
		}

		var mArgumentDimensionNames = aIncomingDimensions.reduce(function(oResult, oDimension) {
			oResult[oDimension.getName()] = oDimension;
			return oResult;
		}, {});

		// recursively check the filter tree for a dimension which we want to drill down into
		function findFilter(oFilter) {
			if (jQuery.isArray(oFilter.aFilters)) { // Subtree
				return oFilter.aFilters.some(findFilter);
			} else { // Leaf
				return !!mArgumentDimensionNames[oFilter.sPath];
			}
		}

		var oStackTop = this._getDrillStateTop();
		if (oStackTop && oStackTop.filter && findFilter(oStackTop.filter)) {
			jQuery.sap.log.error("Drill down not possible, because one of the given dimensions is already filtered!");
			return false;
		}

		return true;
	};

	/**
	 * Create the drill stack from visible Dimensions and Measures.
	 *
	 * The created drill stack should allow user to drill up by removing one visible Dimension
	 * each time until no Dimension is left
	 * @private
	 */
	Chart.prototype._createDrillStack = function() {
		var aVisibleDimensions = this.getProperty("visibleDimensions") || [],
			aVisibleMeasures = this.getProperty("visibleMeasures") || [],
			aStack = [{
				dimensions: [],
				measures: aVisibleMeasures,
				filter: undefined
			}],
			aStackDimensions = [];

		for (var i = 0; i < aVisibleDimensions.length; i++) {
			aStackDimensions.push(aVisibleDimensions[i]);
			aStack.push({
				dimensions: aStackDimensions.slice(),
				measures: aVisibleMeasures,
				filter: undefined
			});
		}

		this._drillStateStack = aStack;
	};

	/**
	 * Invalidate certain aspect of the Chart control so it gets updated accordingly on the re-render phase.
	 *
	 * It is not required to update all aspects on each invalidation because some causes only changes certain, but not all, aspect.
	 * For example
	 *	 a. If the cause is Dimension/Measure property (label, role, or format etc) change, it is not necessary to update the binding and drill state;
	 *	 b. If the cause is visibleDimensions/visibleMeasures change, it is required to update almost everything.
	 * and the cases goes on.
	 *
	 * @param {object} oCause the cause of the invalidation
	 * @private
	 */
	Chart.prototype._invalidateBy = function(oCause) {
		var oSource = oCause.source;

		var aAdditionalDims = this._oCandidateColoringSetting ? (this._oCandidateColoringSetting.additionalDimensions || []) : [];
		if (oSource === this) {
			jQuery.each(oCause.keys || {}, function(k, v) {
				this._markForUpdate(k, v);
			}.bind(this));
		} else if (oSource instanceof Measure && this._getVisibleMeasures().indexOf(oSource.getName()) !== -1) {
			this._markForUpdate("dataSet", true);
			this._markForUpdate("vizFrame", true);
			if (oCause.property === "unitBinding") {
				this._markForUpdate("binding", true);
			}
		} else if (oSource instanceof Dimension && this._getVisibleDimensions().concat(aAdditionalDims).indexOf(oSource.getName()) !== -1) {
			this._markForUpdate("dataSet", true);
			this._markForUpdate("vizFrame", true);
			if (oSource.getDisplayText() && (oCause.property === "textProperty" || oCause.property === "displayText" )) {
				this._markForUpdate("binding", true);
			}
		}

		this.invalidate(oCause);
	};

	Chart.prototype._handleNonAnalyticalFeeding = function() {
		var that = this;
		var inResult = this.getInResultDimensions();
		var visibleDimensions = this._getVisibleDimensions(),
			allDimensions = this.getDimensions().map(function(oValue) {
				return oValue.getName();
			});
		//arr contains textProperty
		var arr = [];
		allDimensions.forEach(function(dimension) {
			if (that.getDimensionByName(dimension)) {
				var textProperty = that.getDimensionByName(dimension).getTextProperty();
				if (textProperty) {
					arr.push(textProperty);
				}
			}
		});

		/*Merge visibleDimensions and allDimensions, remove duplicate items, and textProperty and inresultDimension.
		 *Keep the user settings of visinleDimensions, then auto append other dimensions for user.
		 *Filter unitBinding/textProperty/inResult behind auto appending to prevent this three dimensions are already exist in visibleDimensons.
		 */
		var vDimensions = visibleDimensions.concat(allDimensions.filter(function(item) {
			return (visibleDimensions.indexOf(item) < 0);
		})).filter(function(item) {
			return (arr.indexOf(item) < 0) && (inResult.indexOf(item) < 0);
		});
		this.setProperty("visibleDimensions", vDimensions);
		this._createDrillStack();
	};

	// ******** Private updaters. These updaters are meant to be triggered by the _render function. ********

	Chart.prototype._markForUpdate = function(key, bNeedUpdate) {
		if (!this._mNeedToUpdate) {
			this._mNeedToUpdate = {};
		}
		this._mNeedToUpdate[key] = bNeedUpdate;
		var fnOnInvalidate = this._updaters.onInvalidate[key];
		if (fnOnInvalidate) {
			fnOnInvalidate.call(this);
		}
	};
	Chart.prototype._updaters = (function() {
		return {
			onInvalidate: {
				vizFrame: function() {
					this._aFeeds = null;
					this._bColoringParsed = null;
				},
				checkBinding: function() {
					this._bColoringParsed = null;
				},
				binding: function() {
					this._bColoringParsed = null;
				}
			},
			checkBinding: function() {
				// sync point for colorings & activeColoring properties to decide if binding should be updated
				var oCandidateColoringSetting = this._getCandidateColoringSetting();
				var aAdditionalDimensions = oCandidateColoringSetting.additionalDimensions;
				var aAdditionalMeasures = oCandidateColoringSetting.additionalMeasures;
				if ((aAdditionalDimensions && aAdditionalDimensions.length) || 
					(aAdditionalMeasures && aAdditionalMeasures.length)) {
					this._markForUpdate("binding", true);
				}
			},
			drillStack: function() {
				this._createDrillStack();
			},
			dataSet: function() {
				var oDataset = this._getDataset();
				oDataset.updateData.apply(oDataset, arguments);
			},
			/* This BINDING is NOT the chart binding */
			binding: function() {
				var oBinding = this._getDataset().getBinding("data"),
					inResult = this.getInResultDimensions();
				if (!oBinding) {
					return;
				}


				var aDimensions = this._getVisibleDimensions(true).concat(this._normalizeDorM(inResult, true));
				var aMeasures = this._getVisibleMeasures(true);
				DataSourceUtils.updateModel(this.getIsAnalytical())(this, aDimensions, aMeasures);

				var oStackTop = this._getDrillStateTop();
				if (aDimensions.length > 0 || aMeasures.length > 0) {
					this._getVizFrame()._pendingDataRequest(true); // prevent vizFrame from updating by an empty dataset before data is received
					this.setBusy(true);
				}
				oBinding.filter((oStackTop && oStackTop.filter) ? oStackTop.filter : undefined);

				this._resetPagingOptions();
			},
			vizFrame: function() {
				var that = this,
					oDataset = this._getDataset(),
					oVizFrame = this._getVizFrame(),
					mMeasureRange = this._mMeasureRange || {};

				oDataset.removeAllAggregation("dimensions", true);
				oDataset.removeAllAggregation("measures", true);

				oVizFrame.removeAllAggregation("feeds", true);

				if (this.getIsAnalytical() === false) {
					this._handleNonAnalyticalFeeding();
				}

				var aFeeds = this._prepareFeeds();
				aFeeds._def.dim.forEach(function(oDim) {
					oDataset.addAggregation("dimensions", oDim, true);
				}, this);
				aFeeds._def.msr.forEach(function(oMsr) {
					if (oMsr) {
						var oRange = mMeasureRange[oMsr.getIdentity()];
						if (oRange) {
							oMsr.setRange([oRange.min, oRange.max]);
						}
						if (!that.getDimensionByName(oMsr.getUnit())) {
							oMsr.setUnit(null);
						}
						oDataset.addAggregation("measures", oMsr, true);
					}
				}, this);
				aFeeds.forEach(function(oFeedItem) {
					oVizFrame.addFeed(oFeedItem);
				});
				this._semanticTuples = aFeeds._semanticTuples;

				var aDatasetContexts = aFeeds._context || [];
				var oCandidateColoringSetting = this._getCandidateColoringSetting();
				var aAdditionalMeasures = oCandidateColoringSetting.additionalMeasures || [];
				var aAdditionalDimensions = oCandidateColoringSetting.additionalDimensions || [];

				aAdditionalMeasures.forEach(function(sMsr) {
					aDatasetContexts.push({
						id: sMsr,
						showInTooltip: false
					});
					oDataset.addMeasure(new MeasureDefinition({
						name: sMsr,
						identity: sMsr,
						value: '{' + sMsr + '}'
					}));
				});

				aAdditionalDimensions.forEach(function(sDim) {
					aDatasetContexts.push({
						id: sDim,
						showInTooltip: false
					});
					oDataset.addDimension(new DimensionDefinition({
						name: sDim,
						identity: sDim,
						value: '{' + sDim + '}'
					}));
				});

				if (!this._mNeedToUpdate['binding']) {
					// loop cached data if there is no binding change
					this._markForUpdate('loopData', true);
				}
				oDataset.setContext(aDatasetContexts);

				oVizFrame.invalidate();
				oDataset.invalidate();
				oVizFrame.setVizType(this._sAdapteredChartType);
				
				oVizFrame.setVizProperties(this._getEffectiveProperties());
				oVizFrame._setCustomMessages(this.getCustomMessages());
			},
			loopData: function() {
				var oVizFrame = this._getVizFrame();
				try {
					this._prepareData();
				} catch (e) {
					if (e instanceof ChartLog) {
						e.display();
					} else {
						throw e;
					}
				}
				var oVizProperties = this._getEffectiveProperties();
				//TODO: merge 'using DisplayName' logic into one loop in 'prepareData'
				this._usingDisplayNameForSemantics(oVizProperties);
				oVizFrame.setVizProperties(oVizProperties);
				this._setEffectiveScales();
			}
		};

		//return [oDrillStackUpdater, oDataSetUpdater, oVizFrameUpdater, oBindingUpdater];
	})();

	// ******** Private Accessors ********
	Chart.prototype._getDrillStateTop = function() {
		return this._drillStateStack ? this._drillStateStack[this._drillStateStack.length - 1] : null;
	};

	Chart.prototype._getVizFrame = function() {
		return this.getAggregation("_vizFrame");
	};

	Chart.prototype._getDataset = function() {
		var oVizFrame = this._getVizFrame();
		return oVizFrame ? oVizFrame.getDataset() : null;
	};

	Chart.prototype._restoreUserSemanticColoringProperties = function() {
		// restore user's dataPointStyle in properties since Coloring use the same entry
		this._oColoringsDataPointStyle = {
			plotArea: {
				dataPointStyle: this._oDataPointStyle
			},
			legend: {
				title: this._oLegendtitle
			}
		};
		this._oColoringScale = null;
	};

	Chart.prototype._prepareData = function() {
		// 1) get context handler of Colorings
		var oCandidateColoringSetting = {}, oColoringHandler;
		var bSemanticPattern = this.getVisibleMeasures().some(function(sMsr) {
			return this.getMeasureByName(sMsr).getSemantics() !== sap.chart.data.MeasureSemantics.Actual;
		}.bind(this));
		// do not consider combination usage with Semantic Pattern in initial implementation
		if (!bSemanticPattern && 
		  ((this._sAdapteredChartType === "heatmap" && this._oVizColorScale === undefined) ||
		  (this._sAdapteredChartType !== "heatmap" && !this._oDataPointStyle))) {
			oCandidateColoringSetting = this._getCandidateColoringSetting();
			oColoringHandler = oCandidateColoringSetting.contextHandler;
		}

		// 2) loop context if necessary in Colorings
		var aContextHandlers = [];
		if (oColoringHandler) {
			aContextHandlers.push(oColoringHandler);
			this._loopContext(aContextHandlers);
		}

		// 3) Generate semantic rules with parsed Colorings
		if (!bSemanticPattern) {
			if (oCandidateColoringSetting.ruleGenerator) {
				var rule;
				try {
					rule = oCandidateColoringSetting.ruleGenerator();
					this._oColoringsDataPointStyle = rule.properties;
					this._oColoringScale = rule.colorScale;
				} catch (e) {
					if (e instanceof ChartLog) {
						e.display();
					} else {
						throw e;
					}
					this._restoreUserSemanticColoringProperties();
				}
			} else {
				this._restoreUserSemanticColoringProperties();
			}
		}
	};

	Chart.prototype._getContexts = function() {
		var oBinding = this.getBinding("data");
		if (oBinding) {
			var iStart, iLength;
			if (this._isEnablePaging() && this._bNeedPaging) {
				iStart = this._oPagingOption.iStartIndex;
				if (this._oPagingOption.iPageNo === 0) {
					iLength = this._oPagingOption.iLength * 2;
				} else {
					iLength = this._oPagingOption.iLength;
				}
			} else {
				iStart = 0;
				iLength = oBinding instanceof sap.ui.model.analytics.AnalyticalBinding ? oBinding.getTotalSize() : oBinding.getLength();
			}
			return oBinding.getContexts(iStart, iLength);
		} else {
			return [];
		}
	};

	Chart.prototype._loopContext = function(aContextHandlers) {
		var aContexts = this._getContexts();
		if (aContexts.length > 0 && !aContexts.dataRequested) {
			var that = this;
			aContexts.forEach(function(oContext) {
				aContextHandlers.forEach(function(fnContextHandler) {
					fnContextHandler.call(that, oContext);
				});	
			});
		}
	};

	Chart.prototype._bindingChangeListener = function() {
		var oVizFrame = this._getVizFrame();

		//Here we can get the source dataset, and then set the data's displayValue to lengend's displayName in the semantic rules of vizProperties automatically for specific requirement.
		oVizFrame.invalidate(); // prevent an unnecessary immediate VizFrame re-render, re-render should happen after all invalidates
		this.setBusy(false);
		if (this._isEnablePaging()) {
			if (this._bNeedTotal) {
				this._initPagination();
				this._bNeedTotal = false;
			} else if (this._bNeedPaging) {
				var thumbPosition = oVizFrame._states().plot.transform.translate.position;
				this._updatePage(thumbPosition);
			}
		} else {
			this._mMeasureRange = {};
			oVizFrame._pendingDataRequest(false);
			oVizFrame.invalidate();
		}
		
		try {
			this._prepareData();
		} catch (e) {
			if (e instanceof ChartLog) {
				e.display();
			}
		}

		var oVizProperties = this._getEffectiveProperties();
		//TODO: merge 'using DisplayName' logic into one loop in 'prepareData'
		this._usingDisplayNameForSemantics(oVizProperties);

		oVizFrame.setVizProperties(oVizProperties);
		this._setEffectiveScales();
	};

	Chart.prototype._initPagination = function(bNoQueryMinMax) {
		var oBinding = this.getBinding("data");
		if (!oBinding) {
			return;
		}
		var iTotalSize = oBinding instanceof sap.ui.model.analytics.AnalyticalBinding ? oBinding.getTotalSize() : oBinding.getLength();
		if (iTotalSize >= 0) {
			this._iTotalSize = iTotalSize;
			if (this._iTotalSize > this._iPageSize * 2) {
				this._iMaxPageNo = Math.floor(this._iTotalSize / this._iPageSize) - 1;
				this._iRemainingRecords = this._iTotalSize % this._iPageSize;
				this._bNeedPaging = true;
				this._iOffset = null;
				var dataRatio = this._iPageSize / this._iTotalSize;
				this._oPagingOption = {
					bEnabled: true,
					iStartIndex: 0,
					iLength: this._iPageSize,
					sMode: "reset",
					thumbRatio: dataRatio,
					iPageNo: 0
				};
				if (bNoQueryMinMax) {
					this._getVizFrame()._pendingDataRequest(false);
				} else {
					//invalidate vizframe until we got minMax
					this._getVizFrame()._pendingDataRequest(true);
					this._queryMinMax(this._measureRangeReceivedHandler.bind(this));
				}
			} else {
				this._mMeasureRange = {};
				this._bNeedPaging = false;
				this._oPagingOption = {
					bEnabled: false,
					iStartIndex: 0,
					iLength: this._iTotalSize
				};
				this._getVizFrame()._pendingDataRequest(false);
			}
			this._getDataset().setPagingOption(this._oPagingOption);
		}
	};

	Chart.prototype._resetPagingOptions = function() {
		var that = this;
		var oBinding = this.getBinding("data");
		var oDataset = this._getDataset();
		if (!oDataset || !oBinding) {
			return;
		}
		if (this._isEnablePaging()) {
			var aFeeds = this._prepareFeeds();
			aFeeds._order = aFeeds._order.filter(function(sFeed) {
				return sFeed !== "MND" && that.getDimensions().map(function(oValue){return oValue.getName();}).indexOf(sFeed) > -1;
			});
			if (aFeeds._order.length) {
				var aSorters = this._aFeeds._order.map(function(sProperty) {
					return new Sorter(sProperty);
				});
				oBinding.sort(aSorters);
			}

			this._bNeedTotal = true;
			this._oPagingOption = {
				bEnabled: false,
				iStartIndex: 0,
				iLength: this._iPageSize * 2,
				iPageNo: 0
			};
			oDataset.setPagingOption(this._oPagingOption);

			this._oColorTracker.clear();
			this._getVizFrame()._runtimeScales(this._oColorTracker.get(), true);
		} else {
			oDataset.setPagingOption(null);
		}
		this._oColoringStatus = {};
		this._mMeasureRange = {};
	};
	/************* Semantic Pattern's internal method *******************/
	Chart.prototype._enableSemanticPattern = function(){
		//If dataPointStyle or seriesStyle are set by user, semantic pattern shouldn't work. 
		return !(this._oDataPointStyle || this._oSeriesStyle);
	};

	Chart.prototype._hasSemanticPattern = function(){
		return this._semanticTuples && this._semanticTuples.length > 0;
	};

	Chart.prototype._getContinuesSemanticTuples = function(){
		var tuples = {};
		if (this._hasSemanticPattern()) {
			tuples = this._semanticTuples.reduce(function(arrs, tuple){
				if (tuple.semanticMsrName) {
					arrs[tuple.semanticMsrName] = tuple; 
				}
				return arrs;
			}, {});
		}
		return tuples;
	};

	Chart.prototype._getContinuesSemanticMap = function(){
		var tuples = [];
		if (this._hasSemanticPattern()) {
			tuples = this._semanticTuples.filter(function(tuple){
				return tuple.projectedValueStartTime;
			});
		}
		return tuples;
	};

	Chart.prototype._getInternalVisibleMeasures = function(){
		var aMsrs = this._getVisibleMeasures();
		if (this._hasSemanticPattern()) {
			aMsrs = aMsrs.concat(this._getContinuesSemanticMap().map(function(tuple){
				return tuple.semanticMsrName;
			}));
		}
		return aMsrs;
	};

	Chart.prototype._buildSelectedDataPoints = function(oBinding, aDataPoints){
		//For get/setSelectedDataPoints API
		//Build vizframe's selected datapoint structure. 
		var aMsrs = this._getInternalVisibleMeasures(),
			aDims = this._getVisibleDimensions().concat(this.getInResultDimensions()),
			aSelectedDataPoints = this._getEffectiveContinuesDataPoints(aDataPoints);
		return SelectionAPIUtils.buildSelectionVizCtx(aMsrs, aDims, oBinding, aSelectedDataPoints);
	};

	Chart.prototype._getEffectiveContinuesSeries = function(aSeries){
		var aSelectedSeries = aSeries.slice(), continuesSemanticTuples = this._getContinuesSemanticMap();
		if (this._hasSemanticPattern()) {
			var msrsMap = aSelectedSeries.map(function(series){
				return series.measures;
			});

			continuesSemanticTuples.forEach(function(tuple){
				if (msrsMap.indexOf(tuple.actual) > -1 || msrsMap.indexOf(tuple.projected) > -1) {
					aSelectedSeries = aSelectedSeries.filter(function(series){
						return series.measures !== tuple.actual && series.measures !== tuple.projected;
					});
					if (msrsMap.indexOf(tuple.actual) > -1 && msrsMap.indexOf(tuple.projected) > -1) {
						aSelectedSeries.push({
							measures : tuple.semanticMsrName
						});
					}
				}
			});
		}
		return aSelectedSeries;
	};

	Chart.prototype._getEffectiveContinuesDataPoints = function(aDataPoints){
		var aSelectedDataPoints = aDataPoints.slice(),  continuesSemanticTuples = this._getContinuesSemanticMap();
		if (this._hasSemanticPattern()) {
			var actIndex, proIndex, measures, tuple;
			for (var i = 0; i < aSelectedDataPoints.length; i++) {
				measures = aSelectedDataPoints[i].measures;
				for (var j = 0; j < continuesSemanticTuples.length; j++) {
					tuple = continuesSemanticTuples[j];
					actIndex = measures.indexOf(tuple.actual);
					if (actIndex > -1) {
						measures.splice(actIndex, 1);
					}
					proIndex = measures.indexOf(tuple.projected);
					if (proIndex > -1) {
						measures.splice(proIndex, 1);
					}
					if (actIndex > -1 || proIndex > -1) {
						measures.push(tuple.semanticMsrName);
					}
				}
			}	
		}
		return aSelectedDataPoints;
	};

	Chart.prototype._buildSelectEventData = function(data) {
		if (data && data.length > 0 && this._hasSemanticPattern()) {
			var value, tuple;
			var continuesSemanticTuples = this._getContinuesSemanticMap();
			for (var i = 0; i < data.length; i++) {
				value = jQuery.extend(true, {}, data[i].data);
				for (var j = 0; j < continuesSemanticTuples.length; j++) {
					tuple = continuesSemanticTuples[j];
					if (value.measureNames === tuple.semanticMsrName) {
						//Need to filter interval unbound measures
						//TODO check null value case 
						if (value[tuple.timeAxis] < tuple.projectedValueStartTime) {
							value.measureNames = tuple.actual;
							delete value[tuple.projected];
							delete value[tuple.semanticMsrName];
						} else {
							value.measureNames = tuple.projected;
							delete value[tuple.actual];
							delete value[tuple.semanticMsrName];
						}
					} else {
						if (value[tuple.actual] && value.measureNames !== tuple.actual) {
							delete value[tuple.actual];	
						}
						if (value[tuple.projected] && value.measureNames !== tuple.projected) {
							delete value[tuple.projected];
						}
					}
				}
				data[i].data = value;
			}
		}
	};
	// ******** overridden functions ********

	// override standard aggregation methods for 'data' and report an error when they are used
	/**
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "addData" therefore cannot be used programmatically!
	 *
	 * @public
	 */
	Chart.prototype.addData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "addData" therefore cannot be used programmatically!');
	};

	/**
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "destroyData" therefore cannot be used programmatically!
	 *
	 * @public
	 */
	Chart.prototype.destroyData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "destroyData" therefore cannot be used programmatically!');
	};

	/**
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "getData" therefore cannot be used programmatically!
	 *
	 * @public
	 */
	Chart.prototype.getData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "getData" therefore cannot be used programmatically!');
	};

	/**
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "indexOfData" therefore cannot be used programmatically!
	 *
	 * @public
	 */
	Chart.prototype.indexOfData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "indexOfData" therefore cannot be used programmatically!');
	};

	/**
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "insertData" therefore cannot be used programmatically!
	 *
	 * @public
	 */
	Chart.prototype.insertData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "insertData" therefore cannot be used programmatically!');
	};

	/**
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "removeData" therefore cannot be used programmatically!
	 *
	 * @public
	 */
	Chart.prototype.removeData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "removeData" therefore cannot be used programmatically!');
	};

	/**
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "removeAllData" therefore cannot be used programmatically!
	 *
	 * @public
	 */
	Chart.prototype.removeAllData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "removeAllData" therefore cannot be used programmatically!');
	};

    Chart.prototype._createOData4SAPAnalyticsModel = function(oModel) {
		var oOData4SAPAnalyticsModel = null;
		try {
			oOData4SAPAnalyticsModel = new odata4analytics.Model(new odata4analytics.Model.ReferenceByModel(oModel));
		} catch (exception) {
			return undefined;
		}
		return oOData4SAPAnalyticsModel;

	};

	/**
	 * Gets current value of property isAnalytical.
	 * 
	 * Whether or not an aggregated entity set is bound to the chart.
	 *
	 * The proeprty isAnalytical will programmatically set according to data source. When the data source has an aggregated entity set, isAnalytical is true, otherwise it's false.
	 *
	 * @public
	 *
	 * @return {boolean} Value of property isAnalytical
	 */
	Chart.prototype.getIsAnalytical = function() {
		return this.getProperty("isAnalytical");
	};

	/**
	 * Whether or not an aggregated entity set is bound to the chart. Deprecated.
	 * 
	 * @public
	 */
	Chart.prototype.setIsAnalytical = function(oValue, bSuppressInvalidate) {
		if (this._bIsInitialized) {
			jQuery.sap.log.error('The proeprty isAnalytical will programmatically set according to data source. The method "setIsAnalytical" therefore cannot be used!');
		} else {
			this.setProperty("isAnalytical", oValue, bSuppressInvalidate);
		}
	};

	Chart.prototype._setIsAnalyticalProperty = function(oOData4SAPAnalyticsModel, oBindingInfo) {
		var oValue = oOData4SAPAnalyticsModel.findQueryResultByName(DataSourceUtils.getEntitySet(this.getIsAnalytical())(oBindingInfo)) !== undefined;
		if (this.getIsAnalytical() !== oValue) {
			this.setProperty("isAnalytical", oValue);
		}
	};

	Chart.prototype.bindAggregation = function(sName, oBindingInfo) {
		if (sName === "data") {
			// This may fail, in case the model is not yet set.
			// If this case happens, the ODataModelAdapter is added by the overriden _bindAggregation,
			// which is called during setModel(...)
			var oModel = this.getModel(oBindingInfo.model);
			var oOData4SAPAnalyticsModel;
			if (oModel) {
				if (oModel instanceof sap.ui.model.json.JSONModel) {
					if (this.getIsAnalytical() !== false) {
						this.setProperty("isAnalytical", false);
					} else if (this.getEnablePagination() !== false) {
						this.setProperty("enablePagination", false);
					}
				} else {
					oOData4SAPAnalyticsModel = this._createOData4SAPAnalyticsModel(oModel);
					this._setIsAnalyticalProperty(oOData4SAPAnalyticsModel, oBindingInfo);
				}
				if (this.getIsAnalytical()) {
					if (oBindingInfo) {
						oBindingInfo.parameters = jQuery.extend(true, {}, {
									analyticalInfo: [{name: ""}] ,
									useBatchRequests: true,
									provideGrandTotals: false,
									provideTotalsResultSize: false,
									autoexpand: false,
									reloadSingleUnitMeasures: true,
									noPaging: true
								},
								oBindingInfo.parameters);

						if (this._isEnablePaging()) {
							var oPagingBindingInfo = {
										noPaging: false
							};
							oBindingInfo.parameters = jQuery.extend(true, oBindingInfo.parameters, oPagingBindingInfo);
						}
					}

					ODataModelAdapter.apply(oModel);
					if (oOData4SAPAnalyticsModel) {
						oModel.setAnalyticalExtensions(oOData4SAPAnalyticsModel);
					}
				}
			}
		}
		return BaseControl.prototype.bindAggregation.apply(this, arguments);
	};

	Chart.prototype._bindAggregation = function(sName, oBindingInfo) {
		if (sName === "data") {
			// This may fail, in case the model is not yet set.
			// If this case happens, the ODataModelAdapter is added by the overriden _bindAggregation, which is called during setModel(...)
			var oModel = this.getModel(oBindingInfo.model);
			if (oModel) {
				if (oModel instanceof sap.ui.model.json.JSONModel) {
					if (this.getIsAnalytical() !== false) {
						this.setProperty("isAnalytical", false);
					} else if (this.getEnablePagination() !== false) {
						this.setProperty("enablePagination", false);
					}
				} else {
					var oOData4SAPAnalyticsModel = this._createOData4SAPAnalyticsModel(oModel);
					this._setIsAnalyticalProperty(oOData4SAPAnalyticsModel, oBindingInfo);
				}
				if (this.getIsAnalytical()) {
					if (oBindingInfo) {
						oBindingInfo.parameters = jQuery.extend(true, {}, {
									analyticalInfo: [{name: ""}] ,
									useBatchRequests: true,
									provideGrandTotals: false,
									provideTotalsResultSize: false,
									autoexpand: false,
									reloadSingleUnitMeasures: true,
									noPaging: true
								},
								oBindingInfo.parameters);

						if (this._isEnablePaging()) {
							var oPagingBindingInfo = {
								noPaging: false
							};
							oBindingInfo.parameters = jQuery.extend(true, oBindingInfo.parameters, oPagingBindingInfo);
						}

					}

					ODataModelAdapter.apply(oModel);
					if (oOData4SAPAnalyticsModel) {
						oModel.setAnalyticalExtensions(oOData4SAPAnalyticsModel);
					}
				}

				this._deriveColumns(oModel, oBindingInfo);
			}
			var oDataset = this._getDataset(),
				oOldDataBinding = oDataset.getBinding("data");

			if (oOldDataBinding) {
				oOldDataBinding.detachChange(this._bindingChangeListener, this);
			}
			oDataset.bindAggregation("data", oBindingInfo);

			var oNewDataBinding = oDataset.getBinding("data");
			if (oNewDataBinding) {
				oDataset.getBinding("data").attachChange(this._bindingChangeListener, this);
			}

			this._invalidateBy({
				source: this,
				keys: {
					binding: true,
					vizFrame: true
				}
			});
		} else {
			BaseControl.prototype._bindAggregation.apply(this, arguments);
		}
	};

	Chart.prototype.unbindAggregation = function(sName, bSuppressReset) {
		if (sName === "data") {
			var oDataset = this._getDataset();
			if (oDataset) {
				oDataset.unbindAggregation.apply(oDataset, arguments);
			}
			bSuppressReset = true; // since we explicitly prohibit call to destroyData
		}
		return BaseControl.prototype.unbindAggregation.apply(this, [sName, bSuppressReset]);
	};

	Chart.prototype.unbindData = function() {
		//remove all dimensions/visibleDimensions,measures/visibleMeasures
		if (!this.getIsAnalytical()) {
			this.removeAllAggregation("dimensions");
			this.removeAllAggregation("measures");
			this.setProperty("visibleDimensions", []);
			this.setProperty("inResultDimensions", []);
			this.setProperty("visibleMeasures", []);
			this._createDrillStack();
		}
		this.unbindAggregation("data");
	};

	Chart.prototype._deriveColumns = function(oModel, oBindingInfo) {
		// derive dimensions and measures from metadata, if not yet set
		var aDimensions = this.getAggregation("dimensions");
		var aMeasures = this.getAggregation("measures");
		if ((aDimensions === null || aDimensions.length === 0) && (aMeasures === null || aMeasures.length === 0)) {
			var mColumns = DataSourceUtils.deriveColumns(this.getIsAnalytical())(oModel, oBindingInfo);
			mColumns.dimensions.forEach(this.addDimension.bind(this));
			mColumns.measures.forEach(this.addMeasure.bind(this));
		}
	};

	/*
	 * @override
	 * @private
	 */
	Chart.prototype.onBeforeRendering = function() {
		BaseControl.prototype.onBeforeRendering.apply(this, arguments);
		var aOrder = ["onInvalidate", "drillStack", "dataSet", "vizFrame", "checkBinding", "binding", "loopData"];
		// ensure "vizFrame" updaters earlier than binding since semantic coloring depends on auto-feeding
		aOrder.forEach(function(key) {
			if (this._mNeedToUpdate[key]) {
				this._updaters[key].call(this);
			}
		}.bind(this));

		jQuery.each(this._mNeedToUpdate, function(key) {
			this._mNeedToUpdate[key] = false;
		}.bind(this));
	};

	// Override to prevent Basecontrol._render from createing DOM node, since Chart performs rendering via _vizFrame
	Chart.prototype.onAfterRendering = function () {
		this._showLoading(this._bLoading);
	};

	Chart.prototype.onlocalizationChanged = function() {
		this._invalidateBy({
			source: this,
			keys: {
				vizFrame: true
			}
		});
	};

	/*
	 * @override
	 */
	Chart.prototype.exit = function() {
		this._getDataset().unbindAggregation('data', true);
		BaseControl.prototype.exit.apply(this, arguments);
		var oVizFrame = this._getVizFrame();
		if (this._delegateEventHandlers) {
			this._delegateEventHandlers.forEach(function(oHandler) {
				oVizFrame["detach" + oHandler.name](oHandler.handler, this);
				delete oHandler.handler;
			}, this);
			delete this._delegateEventHandlers;
		}
		oVizFrame.detachRenderComplete(this._vizFrameRenderCompleteHandler, this);
	};

	
	/*
	 * @override
	 */
	Chart.prototype.applySettings = function() {
		this._oDataPointStyle = null;
		this._oSeriesStyle = null;
		
		sap.ui.core.Control.prototype.applySettings.apply(this, arguments);

		var oDataset = new FlattenedDataset();

		// make applicationSet : fiori as default. If we write it in the metadata, the jsdoc could not be generated correctly.
		var uiConfig = jQuery.extend(true, {}, {
			'applicationSet': 'fiori'
		}, this.getUiConfig());
		this.setUiConfig(uiConfig);
		this._bNeedToApplyDefaultProperties = true;

		var oVizFrame = new VizFrame({
			width: vizFrameSize(this.getWidth()),
			height: vizFrameSize(this.getHeight()),
			vizType: this.getChartType(),
			uiConfig: this.getUiConfig(),
			vizProperties: jQuery.extend(true, {
				'title' : {
					'visible' : false
				}
			}, this._getEffectiveProperties())
		});

		oVizFrame.setDataset(oDataset);
		oVizFrame.attachRenderComplete(null, this._updateLoadingIndicator.bind(this));

		this._rendered = false;

		oVizFrame.attachEventOnce("renderComplete", function() {
			this._rendered = true;
		}, this);

		// The loading page should hide after renderfail when in pagination.
		oVizFrame.attachEvent("renderFail", null, function(e) {
			this._showLoading(false);
		}, this);

		oVizFrame._pendingDataRequest(true);
		this.setAggregation("_vizFrame", oVizFrame);
		this._delegateEvents();

		this._bNeedTotal = true;
		this._bNeedPaging = false;
		this._iPageSize = 500;
		this._oColorTracker = new SeriesColorTracker();
		this._sAdapteredChartType = this.getChartType();
		this._bIsInitialized = true;
		this._oCandidateColoringSetting = {};

		this._oDataPointStyle = null;
		this._oLegendtitle = null;
		this._oColoringStatus = {};
	};

	/**
	 * Set the chart custom messages. Supported messages please refer to enum {@link sap.chart.MessageId}.
	 *
	 * The user should handle the message localization.
	 *
	 * Example:
	 *
	 * <pre>
	 * oChart.setCustomMessages({
	 *	 'NO_DATA': "No data. Please change your filter"
	 * });
	 * </pre>
	 *
	 *When called with an invalid value, the default value will be restored.
	 *
	 * @param {object} oCustomMessages object containing customMessage values to update
	 * @public
	 * @returns {sap.chart.Chart} 
	 */
	Chart.prototype.setCustomMessages = function(oCustomMessages) {
		this.setProperty("customMessages", oCustomMessages);
		var oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			oVizFrame._setCustomMessages(oCustomMessages);
		}
		return this;
	};


	// ******** Public API ********

	/**
	 * Reset to visible layout.
	 * @public
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.resetLayout = function() {
		this._invalidateBy({
			source: this,
			keys: {
				binding: true,
				vizFrame: true,
				drillStack: true,
				dataSet: true
			}
		});
		return this;
	};

	// ******************** Datapoint Selection ********************
	/**
	 * Select one or more data points, specified by datapoint objects.
	 *
	 * Datapoint object has the following structure:
	 * <pre>
	 * {
	 * 		groupId:  "groupId",		  // group ID (optional)
	 * 		index:		index,				  // index of the data in the group
	 * 		measures: ["measureId"]   // measure IDs
	 * }
	 * </pre>
	 *
	 * Only works when selectionBehavior is "DATAPOINT"
	 *
	 * @param {array} aDataPoints an array of datapoint objects.
	 *
	 * @public
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.setSelectedDataPoints = function(aDataPoints) {
		if (this.getSelectionMode() !== SelectionMode.None) {
			var oBinding = this.getBinding("data"),
			oVizFrame = this._getVizFrame();
			if (!oBinding || !oVizFrame || this.getSelectionBehavior().toUpperCase() !== "DATAPOINT") {
				return this;
			}
			oVizFrame.vizSelection([], {clearSelection: true});
			oVizFrame.vizSelection(this._buildSelectedDataPoints(oBinding, aDataPoints), {
				selectionMode: this.getSelectionMode()
			});
		}
		return this;

	};

	/**
	 * Add one or more data points to current data point selection, specified by datapoint objects.
	 *
	 * Datapoint object has the following structure:
	 * <pre>
	 * {
	 * 		groupId:  "groupId",		  // group ID (optional)
	 * 		index:		index,				  // index of the data in the group
	 * 		measures: ["measureId"]   // measure IDs
	 * }
	 * </pre>
	 *
	 * Only works when selectionBehavior is "DATAPOINT"
	 *
	 * @param {array} aDataPoints an array of datapoint objects.
	 *
	 * @public
	 *
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.addSelectedDataPoints = function(aDataPoints) {
		if (this.getSelectionMode() !== SelectionMode.None) {
			var oBinding = this.getBinding("data"),
			oVizFrame = this._getVizFrame();
			if (!oBinding || !oVizFrame || this.getSelectionBehavior().toUpperCase() !== "DATAPOINT") {
				return this;
			}
			oVizFrame.vizSelection(this._buildSelectedDataPoints(oBinding, aDataPoints), {
				selectionMode: SelectionMode.Multi
			});
		}
		return this;
	};

	/**
	 * Return a total number and an array of datapoint objects (including a Context object) of currently selected data points.
	 *
	 * Datapoint object has the following structure:
	 * <pre>
	 * {
	 * 		index:		index,		  // index of the data in the group
	 * 		measures: ["measureId"]   // measure IDs (data points created from the same Context object
	 * 														  // differing only in measure names are merged together)
	 * 		context:  [Context]		   // Context object
	 *		unit: {
	 *			measureId : ""	  // unit of measure
	 *		}
	 *		dataName: {
	 *			measureId or dimensionId : ""      // dataName of measure or dimension
	 *		}
	 * }
	 * </pre>
	 *
	 * Only works when selectionBehavior is "DATAPOINT"
	 *
	 * @public
	 *
	 * @return {object} a total number of selected data points, and an array of datapoint objects.
	 */
	Chart.prototype.getSelectedDataPoints = function() {
		var oVizFrame = this._getVizFrame();
		if (!oVizFrame || this.getSelectionBehavior().toUpperCase() !== "DATAPOINT") {
			return {
				count: 0,
				dataPoints: []
			};
		}
		var oSemanticTuples = this._getContinuesSemanticTuples();
		var mVisibleMsrs = this._getVisibleMeasures(),
			oDataSet = this._getDataset(),
			aSelectedDataPoints = oVizFrame.vizSelection(), mSelectedDataPoints = {};
		for (var i = 0, len = aSelectedDataPoints.length; i < len; i++) {
			var dataPoint = aSelectedDataPoints[i],
				idx = dataPoint.data._context_row_number;
			if (!mSelectedDataPoints[idx]) {
				mSelectedDataPoints[idx] = {
					index: idx,
					measures: [],
					context: oDataSet.findContext({"_context_row_number": idx})
				};
			}
			dataPoint.measures = SelectionAPIUtils.filterVisibleMsr(dataPoint.data, mVisibleMsrs);
			if (!jQuery.isEmptyObject(oSemanticTuples)) {
				SelectionAPIUtils.filterSemMsr(oSemanticTuples, mVisibleMsrs, dataPoint);
			}
			mSelectedDataPoints[idx].measures = mSelectedDataPoints[idx].measures.concat(dataPoint.measures);
			if (dataPoint.unit) {
				mSelectedDataPoints[idx].unit = jQuery.extend(true, mSelectedDataPoints[idx].unit, dataPoint.unit);
			}
			if (dataPoint.dataName) {
				mSelectedDataPoints[idx].dataName = jQuery.extend(true, mSelectedDataPoints[idx].dataName, dataPoint.dataName);
			}
		}
		return {
			count: aSelectedDataPoints.length,
			dataPoints: Object.keys(mSelectedDataPoints).map(function(id) {
				return mSelectedDataPoints[id];
			})
		};
	};

	/**
	 * Deselect one or more data points from current data point selections, specified by datapoint objects.
	 *
	 * Datapoint object has the following structure:
	 * <pre>
	 * {
	 * 		groupId:  "groupId",		  // group ID (optional)
	 * 		index:		index,				  // index of the data in the group
	 * 		measures: ["measureId"]   // measure IDs
	 * }
	 * </pre>
	 *
	 * Only works when selectionBehavior is "DATAPOINT"
	 *
	 * @public
	 *
	 * @param {array} aDataPoints an array of datapoint objects.
	 *
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.removeSelectedDataPoints = function(aDataPoints) {
		if (this.getSelectionMode() !== SelectionMode.None) {
			var oBinding = this.getBinding("data"),
			oVizFrame = this._getVizFrame();
			if (!oVizFrame || this.getSelectionBehavior().toUpperCase() !== "DATAPOINT") {
				return this;
			}
			var aToRemove = this._buildSelectedDataPoints(oBinding, aDataPoints);
			oVizFrame.vizSelection(aToRemove, {
				deselection: true
			});
		}
		return this;
	};

	// ******************** Category Selection ********************
	/**
	 * Select one or more categories, specified by category objects.
	 *
	 * Category object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 *
	 * Only works when selectionBehavior is "CATEGORY"
	 *
	 * @public
	 *
	 * @param {array} aCategories an array of category objects
	 *
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.setSelectedCategories = function(aCategories) {
		if (this.getSelectionMode() !== SelectionMode.None) {
			var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
			if (!oVizFrame || sBehavior !== "CATEGORY") {
				return this;
			}
			oVizFrame.vizSelection([], {clearSelection: true});
			oVizFrame.vizSelection(aCategories.map(SelectionAPIUtils.toVizCSCtx), {
				selectionMode: this.getSelectionMode()
			});
		}
		return this;
	};

	/**
	 * Add one or more categories to current category selections, specified by category objects.
	 *
	 * Category object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 *
	 * Only works when selectionBehavior is "CATEGORY"
	 *
	 * @public
	 *
	 * @param {array} aCategories an array of category objects
	 *
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.addSelectedCategories = function(aCategories) {
		if (this.getSelectionMode() !== SelectionMode.None) {
			var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
			if (!oVizFrame || sBehavior !== "CATEGORY") {
				return this;
			}
			oVizFrame.vizSelection(aCategories.map(SelectionAPIUtils.toVizCSCtx), {
				selectionMode: SelectionMode.Multi
			});
		}
		return this;
	};

	/**
	 * Deselect one or more categories from current category selections, specified by category objects.
	 *
	 * Category object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 *
	 * Only works when selectionBehavior is "CATEGORY"
	 *
	 * @public
	 *
	 * @param {array} aCategories an array of category objects
	 *
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.removeSelectedCategories = function(aCategories) {
		if (this.getSelectionMode() !== SelectionMode.None) {
			var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
			if (!oVizFrame || sBehavior !== "CATEGORY") {
				return this;
			}
			oVizFrame.vizSelection(aCategories.map(SelectionAPIUtils.toVizCSCtx), {
				deselection: true
			});
		}
		return this;
	};

	/**
	 * Return category objects of currently selected categories and a total number of selected data points.
	 *
	 * Category object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 *
	 * Return 0 and empty list if selectionBehavior is not "CATEGORY"
	 *
	 * @public
	 *
	 * @return {object} a total number of selected data points, and an array of category objects for selected categories.
	 */
	Chart.prototype.getSelectedCategories = function() {
		var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
		if (!oVizFrame || sBehavior !== "CATEGORY") {
			return {
				count: 0,
				categories: []
			};
		} else {
			var aSelections = oVizFrame.vizSelection();
			return {
				count: aSelections.length,
				categories: (aSelections.category || []).map(SelectionAPIUtils.fromVizCSCtx)
			};
		}
	};

	// ******************** Series Selection ********************
	/**
	 * Select one or more series, specified by series objects.
	 *
	 * Series object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 *
	 * Only works when selectionBehavior is "SERIES"
	 *
	 * @public
	 *
	 * @param {array} aSeries an array of series objects
	 *
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.setSelectedSeries = function(aSeries) {
		if (this.getSelectionMode() !== SelectionMode.None) {
			var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
			if (!oVizFrame || sBehavior !== "SERIES") {
				return this;
			}
			oVizFrame.vizSelection([], {clearSelection: true});
			var aSelectedSeries = this._getEffectiveContinuesSeries(aSeries);
			oVizFrame.vizSelection(aSelectedSeries.map(SelectionAPIUtils.toVizCSCtx), {
				selectionMode: this.getSelectionMode()
			});
		}
		return this;
	};

	/**
	 * Add one or more series to current series selections, specified by series objects.
	 *
	 * Series object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 *
	 * Only works when selectionBehavior is "SERIES"
	 *
	 * @public
	 *
	 * @param {array} aSeries an array of series objects
	 *
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.addSelectedSeries = function(aSeries) {
		if (this.getSelectionMode() !== SelectionMode.None) {
			var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
			if (!oVizFrame || sBehavior !== "SERIES") {
				return this;
			}
			var aSelectedSeries = this._getEffectiveContinuesSeries(aSeries);
			oVizFrame.vizSelection(aSelectedSeries.map(SelectionAPIUtils.toVizCSCtx), {
				selectionMode: SelectionMode.Multi
			});
		}
		return this;
	};

	/**
	 * Deselect one or more series from current series selections, specified by series objects.
	 *
	 * Series object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 *
	 * Only works when selectionBehavior is "SERIES"
	 *
	 * @public
	 *
	 * @param {array} aSeries an array of series objects
	 *
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.removeSelectedSeries = function(aSeries) {
		if (this.getSelectionMode() !== SelectionMode.None) {
			var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
			if (!oVizFrame || sBehavior !== "SERIES") {
				return this;
			}
			var aSelectedSeries = this._getEffectiveContinuesSeries(aSeries);
			oVizFrame.vizSelection(aSelectedSeries.map(SelectionAPIUtils.toVizCSCtx), {
				deselection: true
			});
		}
		return this;
	};

	/**
	 * Return series objects of currently selected series and a total number of selected data points.
	 *
	 * Series object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 *
	 * Return 0 and empty list if selectionBehavior is not "SERIES"
	 *
	 * @public
	 *
	 * @return {object} object containing a total number of selected data points,
	 * and an array of series objects for selected series.
	 *
	 */
	Chart.prototype.getSelectedSeries = function() {
		var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
		if (!oVizFrame || sBehavior !== "SERIES") {
			return {
				count: 0,
				series: []
			};
		} else {
			var aSelections = oVizFrame.vizSelection(),
				aSeries = (aSelections.series || []).map(SelectionAPIUtils.fromVizCSCtx),
				aSemanticMsrs = [], semanticTuples = this._getContinuesSemanticTuples();

			aSeries = aSeries.filter(function(series){
				var accepted = true;
				if (series && series.measures) {
					var semanticTuple = semanticTuples[series.measures];
					if (semanticTuple &&  semanticTuple.semanticMsrName === series.measures) {
						aSemanticMsrs.push({
							measures : semanticTuple.actual
						});
						aSemanticMsrs.push({
							measures : semanticTuple.projected
						});
						accepted = false;
					}
				}
				return accepted;
			});
			aSeries = aSeries.concat(aSemanticMsrs);
			return {
				count: aSelections.length,
				series: aSeries
			};
		}
	};

	// ******** Drill down/up API ********

	/**
	 * Drill down on specific Dimension(s), only works when the property isAnalytical is true.
	 * 
	 * The drill down Dimension(s) must present in the Dimension aggregation
	 * and must NOT present in previous drill down or be visible already.
	 *
	 * @public
	 *
	 * @param {array} vDimensions an array, or just a single instance, of either Dimension instance or Dimension name to drill down
	 */
	Chart.prototype.drillDown = function(vDimensions) {
		if (this.getIsAnalytical() === false) {
			jQuery.sap.log.error('Data source does not support drillDown/drillUp. The method "drillDown" therefore cannot be used!');
			return;
		}
		// make sure that only dimensions are drilled down
		if (vDimensions && !(vDimensions instanceof Array)) {
			vDimensions = [vDimensions];
		}
		var aDimensions = this._normalizeDorM(vDimensions, true);

		if (aDimensions.length === 0) {
			return;
		}
		if (!this._checkDrilldownValid(aDimensions)) {
			jQuery.sap.log.warning("Drill down not possible for " + aDimensions + ". Already drilled down.");
			return;
		}

		var oStackTop = this._getDrillStateTop(),
			mRedundants = this._redundantsFromSelection(),
			oSelectionFilter = this._deriveFilterFromSelection();

		var oNewFilter;
		if (oSelectionFilter) {
			oNewFilter = !(oStackTop && oStackTop.filter) ? oSelectionFilter : new Filter([oSelectionFilter, oStackTop.filter], true);
		}

		// dimension(s) can be used for drill down
		this._drillStateStack.push({
			dimensions: oStackTop.dimensions.slice().concat(aDimensions.map(function(oDim) {
				return oDim.getName();
			})).filter(function(sDim) {
				return !mRedundants[sDim];
			}),
			measures:  oStackTop.measures.filter(function(sMsr) {
				return !mRedundants.measureNames[sMsr];
			}),
			filter: oNewFilter,
			redundant: mRedundants
		});

		var aDimensionNames = aDimensions.map(function(oDim) {
			return oDim.getName();
		});
		this.fireDrilledDown({
			dimensions: aDimensionNames
		});
		this._invalidateBy({
			source: this,
			keys: {
				binding: true,
				vizFrame: true
			}
		});
	};

	/**
	 * Drill up to previous drill down state, only works when the property isAnalytical is true.
	 *
	 * @param {Integer} iIndex index of drill state in history to drill up. Default to the previous state in history if available.
	 *
	 * @public
	 */
	Chart.prototype.drillUp = function(iIndex) {
		if (this.getIsAnalytical() === false) {
			jQuery.sap.log.error('Data source does not support drillDown/drillUp. The method "drillUp" therefore cannot be used!');
			return;
		}
        if (arguments.length === 0) {
			iIndex = this._drillStateStack.length - 2;
		}
		var oNewStackTop = this._drillStateStack[iIndex];
		if (oNewStackTop && iIndex != this._drillStateStack.length - 1) {
			var oPreviousState = this._drillStateStack.pop();
			this._drillStateStack.splice(iIndex + 1);
			this.fireDrilledUp({
				dimensions: oPreviousState.dimensions.filter(function(d) {
					return oNewStackTop.dimensions.indexOf(d) === -1;
				})
			});
			this._invalidateBy({
				source: this,
				keys: {
					binding: true,
					vizFrame: true
				}
			});
		}
	};

	/**
	 * Return all drill down states, only works when the property isAnalytical is true.
	 * 
	 * @return {Object[]} array of drill state objects
	 * @public
	 */
	Chart.prototype.getDrillStack = function() {
		if (this.getIsAnalytical() === false) {
			jQuery.sap.log.error('Data source does not support drillDown/drillUp. The method "getDrillStack" therefore cannot be used!');
			return;
		} 
		return jQuery.map(this._drillStateStack || [], function(oState, i) {
			return {
				dimension: oState.dimensions.slice(),
				measure: oState.measures.slice(),
				filter: oState.filter
			};
		});
	};

	/**
		 * Setter for property uiConfig. uiConfig could only set via settings parameter
		 * of constructor.
		 *
		 * uiConfig from base type could config the instance. Supported uiConfig
		 * keyword: applicationSet, showErrorMessage
		 *
		 * Example:
		 *
		 * <pre>
		 * var chart = new sap.chart.Chart({
		 *  'chartType' : 'bar',
		 *  'uiConfig' : {
		 *		  'applicationSet' : 'fiori',
		 *		  'showErrorMessage' : true
		 *  }
		 * });
		 * </pre>
		 *
		 * @param {object}
		 *						oUiConfig the UI configuration
		 * @public
		 * @name sap.chart.Chart#setUiConfig
		 * @function
		 */
	Chart.prototype.setUiConfig = function(oUiConfig) {
		this.setProperty("uiConfig", oUiConfig);
		if (this._getVizFrame()) {
			this._getVizFrame().setUiConfig(oUiConfig);
		}
	};

	var VizPropertiesHelper = (function() {
		var BLACKLIST = [
			"interaction.selectability.mode",		// via setSelectionMode API
			"interaction.selectability.behavior"	// via setSelectionBehavior API
		];

		function deleteProp(obj, propPath) {
			var target = obj,
				vals;
			vals = propPath.reduce(function(entries, prop) {
				if (target.hasOwnProperty(prop)) {
					entries.push({parent: target, val: target[prop], key:prop});
					target = target[prop];
				}
				return entries;
			}, []);
			if (vals.length !== propPath.length) {
				return;
			}
			var entry = vals.pop();
			delete entry.parent[entry.key];
			while (vals.length > 0) {
				entry = vals.pop();
				if (Object.keys(entry.val).length > 0) {
					return;
				} else {
					delete entry.parent[entry.key];
				}
			}
		}

		function sanitize(oVizProperties, type) {
			var oResult = jQuery.extend(true, {}, oVizProperties);
			BLACKLIST.forEach(function(prop) {
				delete oResult[prop];
				deleteProp(oResult, prop.split("."));
			});
			return oResult;
		}
		return {
			sanitize: sanitize,
			modify: function(oProps, sKey, fnReplace) {
				var aPath = sKey.split("."),
					oNode = oProps;
				while (aPath.length > 1 && oNode.hasOwnProperty(aPath[0])) {
					oNode = oNode[aPath.shift()];
				}
				var sProp = aPath[0];
				if (aPath.length === 1 && oNode.hasOwnProperty(sProp)) {
					oNode[sProp] = fnReplace(oNode[sProp]);
				}
			}
		};
	})();

	/**
	 * Change Chart's properties.
	 *
	 * Chart's properties will be updated with the parameter.
	 *
	 * Refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details.
	 *
	 * @param {object}
	 *			  oVizProperties object containing vizProperty values to update
	 * @public
	 */
	Chart.prototype.setVizProperties = function(oVizProperties) {
		oVizProperties = VizPropertiesHelper.sanitize(oVizProperties);
		this.setProperty("vizProperties", oVizProperties);
		this._oLegendtitle = oVizProperties.legend ? oVizProperties.legend.title : null;
		
		if (oVizProperties.plotArea) {
			if (oVizProperties.plotArea.dataPointStyle) {
				this._oDataPointStyle = oVizProperties.plotArea.dataPointStyle;
				this._invalidateBy({
					source: this,
					keys: {
						loopData: true
					}
				});
			}
			if (oVizProperties.plotArea.seriesStyle) {
				this._oSeriesStyle = oVizProperties.plotArea.seriesStyle;
			}
		}

		if (this._getVizFrame()) {
			this._getVizFrame().setVizProperties(this._getEffectiveProperties());
		}
	};

	/**
	 * Return Chart's properties.
	 *
	 * Refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details.
	 *
	 * @returns {object} the Chart properties object
	 * @public
	 */
	Chart.prototype.getVizProperties = function() {
		var oVizFrame = this._getVizFrame();
		var oVizProps = VizPropertiesHelper.sanitize(oVizFrame ? oVizFrame.getVizProperties() : this.getProperty("vizProperties"));

		function stripUnit(oFmtStr) {
			var oFormatter = sap.viz.api.env.Format.numericFormatter();
			if (!oFormatter || jQuery.type(oFormatter.stripUnit) !== "function") {
				return oFmtStr;
			}

			if (jQuery.type(oFmtStr) === "string") {
				return oFormatter.stripUnit(oFmtStr);
			} else if (jQuery.type(oFmtStr) === "object") {
				jQuery.each(oFmtStr, function(k, v){
					oFmtStr[k] = oFormatter.stripUnit(v);
				});
				return oFmtStr;
			} else {
				return oFmtStr;
			}
		}

		VizPropertiesHelper.modify(oVizProps, "plotArea.dataLabel.formatString", stripUnit);
		VizPropertiesHelper.modify(oVizProps, "tooltip.formatString", stripUnit);

		return oVizProps;
	};

	/**
	 * Change Chart's scales.
	 *
	 * Chart's scales will be updated with the parameters.
	 *
	 * Refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details.
	 *
	 * @param {object[]}
	 *			  oVizScales array of vizScale objects
	 * @public
	 */
	Chart.prototype.setVizScales = function(oVizScales) {
		this.setProperty("vizScales", oVizScales);
		this._oVizColorScale = oVizScales.filter(function(oVizScale) {
			return oVizScale.feed === "color";
		})[0];
		if (this._getVizFrame()) {
			this._getVizFrame().setVizScales(oVizScales);
		}
	};

	/**
	 * Return Chart's scales.
	 *
	 * Refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details.
	 *
	 * @returns {object[]} an array of scale objects
	 * @public
	 */
	Chart.prototype.getVizScales = function() {
		var oVizFrame = this._getVizFrame();
		return oVizFrame ? oVizFrame.getVizScales() : this.getProperty("vizScales");

	};

	// ******** Delegations of VizFrame API ********
	/**
	 * Get the UID for Chart. It supports other controls to connect to a viz instance.
	 *
	 * @return {string} Chart UID
	 * @public
	 */
	Chart.prototype.getVizUid = function() {
		return this._getVizFrame().getVizUid();
	};

	/**
	 * Zoom the chart plot.
	 *
	 * Example:
	 * <pre>
	 *	var oChart = new sap.chart.Chart(...);
	 *	oChart.zoom({direction: "in"});
	 * </pre>
	 *
	 * @param {object} oConfig
	 *			  contains a "direction" attribute with value "in" or "out" indicating zoom to enlarge or shrink respectively
	 * @public
	 */
	Chart.prototype.zoom = function(oConfig) {
		this._getVizFrame().zoom(oConfig);
	};

	// ******** Delegations of VizFrame events ********
	var DELEGATED_EVENTS = ["selectData", "deselectData"];
	Chart.prototype._delegateEvents = function() {
		if (this._delegateEventHandlers) {
			return;
		}
		var oVizFrame = this._getVizFrame();
		this._delegateEventHandlers = DELEGATED_EVENTS.map(function(sEvent) {
			var sName = sEvent.charAt(0).toUpperCase() + sEvent.slice(1);
			var handler = function(oEvent) {
				var oParameters = oEvent.getParameters();
				this._buildSelectEventData(oParameters.data);
				delete oParameters.id;
				this.fireEvent(sEvent, oParameters);
			};
			handler = handler.bind(this);

			oVizFrame["attach" + sName](null, handler);
			return {
				name: sName,
				handler: handler
			};
		}, this);

		this._vizFrameRenderCompleteHandler = vizFrameRenderCompleteHandler.bind(this);
		oVizFrame.attachRenderComplete(null, this._vizFrameRenderCompleteHandler);
		oVizFrame.attachEvent("_scroll", scrollHandler.bind(this));
	};

	/**
	 * @private
	 */
	Chart.getChartTypes = sap.chart.api.getChartTypes;

	/**
	 * Returns available and unavailable chart types with current Dimensions and Measures.
	 * An error info will be returned along with each unavailable chart types.
	 *
	 * <pre>
	 * {
	 *		 available: [{
	 *				 chart: "chartType"
	 *		 }, ...],
	 *		 unavailable: [{
	 *				 chart: "chartType"
	 *				 error: {
	 *						 missing: {
	 *								 Dimension: n,
	 *								 Measure: n,
	 *								 DateTimeDimension: n
	 *						 }
	 *				 }
	 *		 }, ...]
	 * }
	 * </pre>
	 *
	 * @public
	 *
	 * @returns {object} chart types and errors for unavailable chart types, grouped by availability
	 */
	Chart.prototype.getAvailableChartTypes = function () {
		var aDims = this._getVisibleDimensions(true),
			aMsrs = this._getVisibleMeasures(true);
		return ChartUtils.CONFIG.chartTypes.reduce(function(oResult, sChartType) {
			var oCompatibility = RoleFitter.compatible(sChartType, aDims, aMsrs);
			if (oCompatibility.compatible) {
				oResult.available.push({chart: sChartType});
			} else {
				var oMissing = {};
				if (oCompatibility.error.missing.dim) {
					oMissing.Dimension = oCompatibility.error.missing.dim;
				}
				if (oCompatibility.error.missing.time) {
					oMissing.DateTimeDimension = oCompatibility.error.missing.time;
				}
				if (oCompatibility.error.missing.msr) {
					oMissing.Measure = oCompatibility.error.missing.msr;
				}
				oResult.unavailable.push({
					chart: sChartType,
					error: oMissing
				});
			}
			return oResult;
		}, {
			available: [],
			unavailable: []
		});
	};

	/*
	Chart.prototype._openContextMenu = function(oEvent) {
		var oMenu = this.getContextMenu();
		var bKeyboard = oEvent.type == "keyup";
		var eDock = sap.ui.core.Popup.Dock;
		var oSource = oEvent.getSource();
		oMenu.open(bKeyboard, oSource, eDock.BeginTop, eDock.BeginBottom, oSource);
	};

	Chart.prototype._initContextMenu = function()  {
		if (! this._mContextMenuItem){
			this._mContextMenuItem = {};
		}
		if (! this._mDimensionMenuItem){
			this._mDimensionMenuItem = {};
		}
		if (! this._mChartTypeMenuItem){
			this._mChartTypeMenuItem = {};
		}
		var oContextMenu = new Menu(this.getId() + "-ContextMenu");
		var aItems = this._getContextMenuItems(oContextMenu.sId);
		for (var i = 0; i < aItems.length; i++) {
			var aSubItems = this._getContextMenuItems(aItems[i].sId);
			if (aSubItems && aSubItems.length > 0 ) {
				var oSubmenu = new Menu();
				for (var j = 0; j < aSubItems.length; j++) {
					oSubmenu.addItem(aSubItems[j]);
				}
				aItems[i].setSubmenu(oSubmenu);
			};
			oContextMenu.addItem(aItems[i]);
		}
		this.setContextMenu(oContextMenu);
	};

	Chart.prototype.getContextMenu = function() {
		// initialize context menu on first get request (may come from hosting app )
		if (!this.getAggregation("contextMenu")) {
			this._initContextMenu();
		}
		return this.getAggregation("contextMenu");
	};

	Chart.prototype.ngetContextMenuItems = function() {
		this.getContextMenu(); // make sure it is initialized

		return this._mContextMenuItem;
	};

	Chart.prototype._getContextMenuItems = function(sId) {
		var aItems = [];
		var that = this;
		var sSubId = sId.slice(sId.indexOf("-")+1);
		var sSubIdLast = sId.slice(sId.lastIndexOf("-")+1);

		if (sSubIdLast == "ContextMenu") {

			// add drill down sub menu
			this._mDimensionMenuItem["@@drillDownMenuItem@@"] = this._createContextMenuItem(
				sSubId + "-DrillDownBy", "Drill Down By", null, null,	null, null
			);
			aItems.push(this._mDimensionMenuItem["@@drillDownMenuItem@@"]);
			this._mContextMenuItem["DRILL_DOWN"] = this._mDimensionMenuItem["@@drillDownMenuItem@@"];

			// add drill up item
			this._mDimensionMenuItem["@@drillUpMenuItem@@"] = this._createContextMenuItem(
				sSubId + "-DrillUp", "Drill Up",	null, null, null, function() {
					that.drillUp();
				}
			);
			aItems.push(this._mDimensionMenuItem["@@drillUpMenuItem@@"]);
			this._mContextMenuItem["DRILL_UP"] = this._mDimensionMenuItem["@@drillUpMenuItem@@"];

			// add chart types sub menu
			var oSubMenu = this._createContextMenuItem(
				sSubId + "-ChartType", "Set Chart Type", null, null, null, null
			);

			oSubMenu.getSubmenu = function() {
				// update menu items for available chart types
				var aAvailableChartTypeName = that.getAvailableChartTypes();
				for (var sChartTypeMenuItemName in that._mChartTypeMenuItem) {
					var bIsAvailable = aAvailableChartTypeName.indexOf(sChartTypeMenuItemName) != -1;
					that._mChartTypeMenuItem[sChartTypeMenuItemName].setVisible(bIsAvailable);
				}
				that._mChartTypeMenuItem[that.getProperty("chartType")].setVisible(false);

				// this._mChartTypeMenuItem
				return sap.ui.unified.MenuItemBase.prototype.getSubmenu.apply(this);
			}
			aItems.push(oSubMenu);
			this._mContextMenuItem["SET_CHART_TYPE"] = oSubMenu;
		} else if (sSubIdLast == "ChartType") {

			var aChartTypes = this.getChartTypes();
			for (var i = 0; i < aChartTypes.length; i++) {
				this._mChartTypeMenuItem[aChartTypes[i]] = this._createContextMenuItem(
					sSubId + "-" + aChartTypes[i],
					that.getChartTypeLabel(aChartTypes[i]),
					null,
					"chartType",
					aChartTypes[i],
					function(oEvent) {
						that.setChartType(oEvent.getParameter("item").data("chartType"));
						//							that._updateFeeds();
					}
				);
				aItems.push(this._mChartTypeMenuItem[aChartTypes[i]]);
			}

		} else if (sSubIdLast == "DrillDownBy" ) {
			var aAggregationDimensions = this.getDimensions();
			var aVisibleDimensions = this.getVisibleDimensions();
			var mVisibleDimensionNames = aVisibleDimensions.reduce(function(oResult, oDimension) {
				oResult[oDimension.getName()] = oDimension;
				return oResult;
			}, {});

			// create drill down menu items
			for (var i = 0; i < aAggregationDimensions.length; i++) {
				var oDimension = aAggregationDimensions[i];
				this._mDimensionMenuItem[oDimension.getName()] = this._createContextMenuItem(
					sSubId + "-" + oDimension.getName(),
					oDimension.getLabel(),
					null,
					"dimensionName",
					oDimension.getName(),
					function(oEvent) {
						oEvent.oSource.setVisible(false);
						that.drillDown(oEvent.getParameter("item").data("dimensionName"));
					}
				); // TODO change to ID
				if (mVisibleDimensionNames[oDimension.getName()]) {
					this._mDimensionMenuItem[oDimension.getName()].setVisible(false);
				}
				aItems.push(this._mDimensionMenuItem[oDimension.getName()]);
			}
		}

		return aItems;
	};

	Chart.prototype._createContextMenuItem = function(sId, sTextI18nKey, sIcon, sDataKey, sDataValue, fHandler) {
		return new MenuItem(this.getId() + "-" + sId, {
			text: sTextI18nKey, //this.oResBundle.getText(sTextI18nKey),
			icon: sIcon ? "sap-icon://" + sIcon : null,
			customData: [{key: sDataKey, value: sDataValue}],
			select: fHandler || function() {}
		});
	};
	*/



	Chart.prototype._getEffectiveProperties = function() {
		var oVizProperties = {};
		if (this._bNeedToApplyDefaultProperties) {
			oVizProperties = jQuery.extend(true, oVizProperties, this._getDefaultVizProperties());
			this._bNeedToApplyDefaultProperties = false;
		}
		oVizProperties = jQuery.extend(true, oVizProperties,
			MeasureSemanticsUtils.getSemanticVizProperties(this._sAdapteredChartType, this._semanticTuples),
			this._oColoringsDataPointStyle,
			this.getProperty("vizProperties"), 
			this._getHostedVizProperties(), 
			this._getPagingVizProperties(),
			this._getTimeProperties());

		return oVizProperties;
	};

	Chart.prototype._setEffectiveScales = function() {
		var oVizFrame = this._getVizFrame();
		if (this._oColoringScale) {
			oVizFrame.setVizScales([this._oColoringScale]);
		}
		// TODO: reset color scale in future since this feature is not ready currently
	};

	Chart.prototype._usingDisplayNameForSemantics = function(oVizProperties) {
		//check whether the parameter is undefined or null
		var isExist = function(o) {
			if ((typeof (o) === 'undefined') || (o === null)) {
				return false;
			}
			return true;
		};

		if (oVizProperties.plotArea && oVizProperties.plotArea.dataPointStyle && oVizProperties.plotArea.dataPointStyle.rules) {
			
			/*
			If semantic rules meet the following 4 conditions:
			(1) aRules[i].displayName === undefined : displayName isn’t defined
			(2) akeys.length === 1 : Only one sematic rules condition;
			(3) oDataContext[key].hasOwnProperty("equal") == true : use ‘equal’ label;
			(4) aVisibleDimensions.indexOf(key) !== -1 : the condition is for dimension;
			Then if the value of 'equal' is equal to some value in oBindingData, when meet the any of the following 2 conditions:
			(1) this.getDimensionByName(key).getTextProperty() === undefined
			(2) this.getDimensionByName(key).getDisplayText() === false
			set the corresponding value of 'equal' to the the rule's displayName. otherwise, set the displayText to the rule's displayName.
			Otherwise show the default "Semantic Range1".
			*/

			//currently, there are only two types of binding 
			var aContexts = this._getContexts();
			if (aContexts.length > 0 && !aContexts.hasOwnProperty("dataRequested")) {
				var aVisibleDimensions = this.getVisibleDimensions(),
					aRules = oVizProperties.plotArea.dataPointStyle.rules;
				for (var i = 0; i < aRules.length; i++) {
					var oDataContext = aRules[i].dataContext;
					if (oDataContext && oDataContext.length !== 0) {
						var akeys = Object.keys(oDataContext);
						if ( !isExist(aRules[i].displayName) && akeys.length === 1) {
							var key = akeys[0];
							if (oDataContext[key].hasOwnProperty("equal") && aVisibleDimensions.indexOf(key) !== -1) {
								var sTextProperty = this.getDimensionByName(key).getTextProperty();
								for (var j = 0; j < aContexts.length; j++) {
									if (aContexts[j].getProperty(key) === oDataContext[key].equal) {
										var sDisplayName = aContexts[j].getProperty(sTextProperty);
										if (!isExist(sTextProperty) || !isExist(sDisplayName) || typeof (sDisplayName) === "object" || this.getDimensionByName(key).getDisplayText() === false) {
											aRules[i].displayName = oDataContext[key].equal;
											break;
										} else {
											aRules[i].displayName = sDisplayName;
											break;
										}
									}
								}
							}
						}
					}
				}
			}	
		}
	};

	Chart.prototype._getCandidateColoringSetting = function() {
		if (!this._bColoringParsed) {
			this._bColoringParsed = true;
			this._oCandidateColoringSetting = {};
			var oColoring = this.getColorings();
			var oActiveColoring = this.getActiveColoring();
			var aMsrs = this._normalizeDorM(this.getVisibleMeasures());
			var aDims = this._normalizeDorM(this.getVisibleDimensions(), true);
			var aInResultDims = this._normalizeDorM(this.getInResultDimensions(), true);

			if (oColoring) {
				try {
					var sUrl = jQuery.sap.getResourcePath("sap/chart/i18n/i18n.properties");
					var oBundle = jQuery.sap.resources({
						url: sUrl
					});
					this._oCandidateColoringSetting = Colorings.getCandidateSetting(oColoring, oActiveColoring, aMsrs, aDims, aInResultDims, this._oColoringStatus || {}, this.getChartType(), oBundle);
					//use original chartType here since adapted chartType is not ready in some workflow
				} catch (e) {
					if (e instanceof ChartLog) {
						e.display();
					} else {
						throw e;
					}
				}
			}
		}
		return this._oCandidateColoringSetting;
	};


	// ---------------- Hosted VizProperties ----------------
	Chart.prototype._hostedVizProperties = {
		selectionMode: {prop: "interaction.selectability.mode"},
		selectionBehavior: {prop: "interaction.selectability.behavior"}
	};

	Chart.prototype._getHostedVizProperties = function() {
		return Object.keys(this._hostedVizProperties).reduce(function(obj, prop) {
			var oSubProp = this._hostedVizProperties[prop].prop.split(".").reverse().reduce(function(obj, path) {
				var result = {};
				result[path] = obj;
				return result;
			}, this.getProperty(prop));
			return jQuery.extend(true, obj, oSubProp);
		}.bind(this), {});

    };

	var FIORI_LABEL_SHORTFORMAT_10 = "__UI5__ShortIntegerMaxFraction10";
	var FIORI_LABEL_FORMAT_2 = "__UI5__FloatMaxFraction2";
	var FIORI_LABEL_SHORTFORMAT_2 = "__UI5__ShortIntegerMaxFraction2";
	Chart.prototype._getDefaultVizProperties = function() {
		// Use UI5 formatter by default in analytic chart
		var type = 'info/' + (this._sAdapteredChartType || this.getChartType());
		var bIsPercentage = (type.indexOf("info/100_") === 0);
		var bIsPie = (type === "info/pie" || type === "info/donut");
		var oDefaults = {
			interaction: {
				extraEventInfo: true
			}
		};
		return jQuery.extend(true, oDefaults,
							 applyDefaultFormatString({}, type,
													  ["valueAxis.label.formatString", "valueAxis2.label.formatString"],
													  bIsPercentage ? '' : FIORI_LABEL_SHORTFORMAT_10),
							 applyDefaultFormatString({}, type,
													  ["legend.formatString", "sizeLegend.formatString"],
													  FIORI_LABEL_SHORTFORMAT_2),
							 applyDefaultFormatString({}, type,
													  ["plotArea.dataLabel.formatString"],
													  bIsPie ? '' : FIORI_LABEL_SHORTFORMAT_2),
							 applyDefaultFormatString({}, type,
													  ["tooltip.formatString"],
													  bIsPercentage ? '' : FIORI_LABEL_FORMAT_2));

		function setPropertiesValue(properties, path, value) {
			if (path.length === 0) {
				return value;
			}
			properties = properties || {};
			var p = properties[path[0]];
			properties[path[0]] = setPropertiesValue(p, path.slice(1), value);
			return properties;
		}

		function getPropertiesDefination(propDef, path) {
			if (propDef == null || path.legnth === 0) {
				return propDef;
			}
			var e = propDef[path[0]];
			if (e && e.children) {
				return getPropertiesDefination(e.children, path.slice(1));
			}
			return e;
		}

		function applyDefaultFormatString(properties, chartType, formatStringPaths, formatString) {
			var metadata = sap.viz.api.metadata.Viz.get(chartType);
			if (metadata) {
				var propDef = metadata.properties;
				formatStringPaths.forEach(function(path) {
					path = path.split(".");
					var p = getPropertiesDefination(propDef, path);
					if (p && p.hasOwnProperty("defaultValue")) {
						setPropertiesValue(properties, path, formatString);
					}
				});
			}
			return properties;
		}
	};

	Chart.prototype._getPagingVizProperties = function() {
		if (this._isEnablePaging()) {
			var oPagingProperties = {
				interaction: {
					zoom: {
						enablement: false
					},
					selectability: {
						mode: "NONE"
					}
				},
				plotArea: {
					isFixedDataPointSize: true
				}
			};
			return oPagingProperties;
		} else {
			return {};
		}
	};

	Chart.prototype._getTimeProperties = function() {
		var aTimeLevels = ["year", "month", "day"]; //default value
		var oFiscalYearPeriodCount = null;  //default value
		var that = this;
		var sTimeDim = this.getVisibleDimensions().filter(function(sDim) {
			var oDim = that.getDimensionByName(sDim);
			return (oDim instanceof sap.chart.data.TimeDimension && oDim._getFixedRole() === "category");
		})[0];

		if (sTimeDim) {
			var oTimeDim = this.getDimensionByName(sTimeDim);
			switch (oTimeDim.getTimeUnit()) {
				case TimeUnitType.yearmonthday:
					aTimeLevels = ["year", "month", "day"];
					break;
				case TimeUnitType.yearquarter:
					aTimeLevels = ["year", "quarter"];
					break;
				case TimeUnitType.yearmonth:
					aTimeLevels = ["year", "month"];
					break;
				case TimeUnitType.fiscalyear:
					aTimeLevels = ["fiscal_year"];
					break;
				case TimeUnitType.fiscalyearperiod:
					aTimeLevels = ["fiscal_period", "fiscal_year"];
					break;
				default:
			}
			
			oFiscalYearPeriodCount = oTimeDim.getFiscalYearPeriodCount();
		}

		var oProps = this.getProperty("vizProperties");
		if (oProps && oProps.timeAxis) {
			// user properties have higher priority
			var timeAxis = oProps.timeAxis;
			if (timeAxis.levels) {
				aTimeLevels = timeAxis.levels;
			}
			if (timeAxis.fiscal && timeAxis.fiscal.periodNumbers) {
				oFiscalYearPeriodCount = timeAxis.fiscal.periodNumbers;
			}
		}

		return {
			"timeAxis": {
				"levels": aTimeLevels,
				"fiscal": {
					"periodNumbers": oFiscalYearPeriodCount
				}
			}
		};
	};

	Chart.prototype.setSelectionMode = function (oValue) {
		this.setProperty("selectionMode", oValue);
		var oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			oVizFrame.setVizProperties({interaction: {selectability: {mode: oValue}}});
		}
		return this;
	};

	Chart.prototype.getSelectionMode = function () {
		var oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			return oVizFrame.getVizProperties().interaction.selectability.mode;
		} else {
			return this.getProperty("selectionMode");
		}
	};

	Chart.prototype.setSelectionBehavior = function(oValue){
		this.setProperty("selectionBehavior", oValue);
		var oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			oVizFrame.setVizProperties({interaction: {selectability: {behavior: oValue}}});
		}
		return this;
	};

	Chart.prototype.getSelectionBehavior = function () {
		var oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			return oVizFrame.getVizProperties().interaction.selectability.behavior;
		} else {
			return this.getProperty("selectionBehavior");
		}
	};

	// ---------------- Public Helpers ----------------
	/**
	 * Return Dimension with the given name.
	 *
	 * @param {string} sName name of the Dimension to get
	 * @public
	 * @return {sap.chart.data.Dimension} Dimension of the specified name.
	 */
	Chart.prototype.getDimensionByName = function(sName) {
		return this.getDimensions().filter(function(d) {return d.getName() === sName;})[0];
	};
	/**
	 * Return Measure with the given name.
	 *
	 * @param {string} sName name of the Measure to get
	 * @public
	 * @return {sap.chart.data.Measure} Measure of the specified name.
	 */
	Chart.prototype.getMeasureByName = function(sName) {
		return this.getMeasures().filter(function(m) {return m.getName() === sName;})[0];
	};
	/**
	 * Return all TimeDimensions from current Dimensions.
	 *
	 * @public
	 * @return {array} Dimensions which are instance of TimeDimension.
	 */
	Chart.prototype.getTimeDimensions = function() {
		return this.getDimensions().filter(function(d) {return d instanceof TimeDimension;});
	};

	function scrollHandler(oEvent) {
		if (this._isEnablePaging() && this._bNeedPaging) {
			//var oVizFrame = this._getVizFrame();
			var ratio = oEvent.getParameters().position;
			this._updatePage(ratio);
		}
	}

	Chart.prototype._isEnablePaging = function() {
		this._bMobile = sap.ui.Device.system.tablet || sap.ui.Device.system.phone;
		var ret = this.getEnablePagination() && this._bIsPagingChartType && !this._bMobile;
		return ret;
	};

	Chart.prototype._updatePage = function(ratio) {
		var oVizFrame = this._getVizFrame();
		var iCurrentPageNo = Math.floor(this._iTotalSize * ratio / this._iPageSize);
		//we merge last two pages in case last page does not reach pageSize
		iCurrentPageNo = Math.min(iCurrentPageNo, this._iMaxPageNo);
		this._iOffset = null;

		var iStartIndex = Math.max((iCurrentPageNo - 1) * this._iPageSize, 0);
		var iLength, domain;

		if (iCurrentPageNo === 0) {
			iLength = this._iPageSize;
				domain = this._iPageSize;
		} else if (iCurrentPageNo === this._iMaxPageNo){
			iLength = this._iPageSize * 2 + this._iRemainingRecords;
			domain = this._iPageSize + this._iRemainingRecords;
		} else {
			iLength = this._iPageSize * 2;
			domain = this._iPageSize;
		}
		this._iOffset = (this._iTotalSize * ratio - iCurrentPageNo * this._iPageSize) / domain;

        var oDataset = this._getDataset();

		if (oDataset.getRenderedPageNo() === iCurrentPageNo) {
			//current page is rendered
			var translate = {
				plot: {
					transform: {
						translate: {
							translateByPage: {
								context: this._middleCtx,
								offset: this._iOffset
							}
						}
					}
				}
			};
			oVizFrame._states(translate);
			this._showLoading(false);
		} else {
			if (this._pagingTimer) {
				jQuery.sap.clearDelayedCall(this._pagingTimer);
			}
			this._pagingTimer = jQuery.sap.delayedCall(50, this, function() {
				this._oPagingOption = {
					bEnabled: true,
					iStartIndex: iStartIndex,
					iLength: iLength,
					sMode: "update",
					thumbRatio: null,
					iPageNo: iCurrentPageNo
				};
				var aContexts = this.getBinding("data").getContexts(iStartIndex, iLength),
				bNoContexts;
				if (aContexts.dataRequested) {
					bNoContexts = true;
				} else {
					bNoContexts = aContexts.some(function(oContext) {
						return oContext === undefined;
					});
				}
				if (bNoContexts) {
					//need request new data
					oDataset.suppressInvalidate();
				} else {
					//analytical binding has these data in local
					//current page is not rendered
					oDataset.setPagingOption(this._oPagingOption);
					oDataset.updateData();
					oVizFrame.invalidate();
					this._oColorTracker.add(this._getVizFrame()._runtimeScales());
					this._getVizFrame()._runtimeScales(this._oColorTracker.get(), true);
				}
			});
			this._sLoadingTimer = this._sLoadingTimer || jQuery.sap.delayedCall(200, this, function() {
				this._showLoading(true);
			});
		}
	};

	function vizFrameRenderCompleteHandler(oEvent) {
		var oParameters = oEvent.getParameters();
		delete oParameters.id;

		if (this._isEnablePaging() && this._bNeedPaging) {
			if (this._sLoadingTimer) {
				jQuery.sap.clearDelayedCall(this._sLoadingTimer);
                this._sLoadingTimer = null;
			}
			var oVizFrame = this._getVizFrame();
			var oBinding = this.getBinding("data");
			var oDataset = this._getDataset();
			var iRenderedPageNo = oDataset.getRenderedPageNo();
			if (iRenderedPageNo !==  0) {
				var iMidRecordNo = iRenderedPageNo * this._iPageSize - 1;
				this._middleCtx = oBinding.getContexts(iMidRecordNo, 1)[0].getObject();
			} else {
				this._middleCtx = null;
			}
			if (this._middleCtx || this._iOffset) {
					var translate = {
							plot: {
								transform: {
									translate: {
										translateByPage: {
											context: this._middleCtx,
											offset: this._iOffset
										}
									}
								}
							}
						};
				oVizFrame._states(translate);
			}
			this._showLoading(false);
		}

		this.fireEvent("renderComplete", oParameters);
	}

	/*
	 * TODO: Comment this function later
	 * debug function to draw page scale on scroll bar
	 */
//		Chart.prototype._drawPageScale = function() {
//			var dataLength = this._iTotalSize;
//			var pageLength = this._iPageSize;
//				var thumb = $(".v-m-scrollbarThumb")[0].getBoundingClientRect();
//				var track = $(".v-m-scrollbarTrack")[0].getBoundingClientRect();
//
//				for (var i = 0; i * pageLength < dataLength; ++i) {
//						var line = $("<line>");
//						$("body").append(line);
//						line.css({
//								position: "absolute",
//								"background-color": "red",
//								width: 1,
//								height: thumb.height,
//								left: thumb.right + i * pageLength / dataLength * (track.width - thumb.width),
//								top: thumb.top
//						});
//				}
//		};

	Chart.prototype._showLoading = function(bLoading) {
		var $this = this.$();
		if (!$this) {
			return;
		}

		if (!bLoading) {
			if (this._$loadingIndicator) {
				this._$loadingIndicator.remove();
			}
		} else {
			if (!this._$loadingIndicator) {
				this._$loadingIndicator = this._createLoadingIndicator();
			}
			this._updateLoadingIndicator();
			$this.append(this._$loadingIndicator);
		}
		this._bLoading = bLoading;
	};

	Chart.prototype._createLoadingIndicator = function() {
		var $indicator = jQuery(sap.ui.core.BusyIndicatorUtils.getElement());
		var $text = jQuery("<p>").attr("class", "loading-text").text("Loading");
		$text.css({
			"position": "absolute",
			"transform": "translateY(-3em)",
			"width": "100%",
			"text-align": "center"
		});
		$text.insertBefore($indicator.children()[0]);
		$indicator.css({opacity: 1});
		return $indicator;
	};

	Chart.prototype._updateLoadingIndicator = function() {
		var $this = this.$();
		if (!$this || !this._$loadingIndicator) {
			return;
		}
		var sChartType = this._sAdapteredChartType,
			bHorizontal = sChartType === "bar" || sChartType.indexOf("horizontal") !== -1;
		var $plot = $this.find(".v-plot-bound"),

			oThisOffset = $this.offset(),
			oPosition = {
				top: oThisOffset.top,
				left: oThisOffset.left,
				width: $this.width(),
				height: $this.height()
			};

		if ($plot.length) {
			var oPlotOffset = $plot.offset(),
				oPlotBound = $plot[0].getBoundingClientRect(); // jQuery returns 0 for width/height of this element somehow
			oPosition.top = oPlotOffset.top - 1;
			oPosition.left = oPlotOffset.left;

			oPosition.width = oPlotBound.width + 1;
			if (bHorizontal) {
				oPosition.height = Math.ceil(oPlotBound.height + 1);
			} else {
				oPosition.height = Math.floor(oPlotBound.height + 1);
			}
		}
		this._$loadingIndicator.css(oPosition);

		var $text = this._$loadingIndicator.find(".loading-text");
		//var $next = $text.next();
		$text.css({
			"top": oPosition.height / 2,
			"font-weight": sap.ui.core.theming.Parameters.get("sapUiChartTitleFontWeight"),
			"font-size": sap.ui.core.theming.Parameters.get("sapUiChartMainTitleFontSize"),
			"color": sap.ui.core.theming.Parameters.get("sapUiChartMainTitleFontSize")
		});

		this._$loadingIndicator.css({
			"background-color": sap.ui.core.theming.Parameters.get("sapUiExtraLightBG")
		});
	};

	Chart.prototype._getRequiredDimensions = function() {
		var aVisDims = this._getVisibleDimensions(),
			aInResultDims = this.getInResultDimensions();
		return this._normalizeDorM(aVisDims.concat(aInResultDims), true);
	};

	Chart.prototype._getRequiredMeasures = function() {
		return this._getVisibleMeasures(true);
	};

	// Request for the min/max at current aggregation level for all visible measures
	Chart.prototype._queryMinMax = function(fnCallback) {
		var aDims = this._getRequiredDimensions().map(function(oDim) {
				return oDim.getName();
			}),
			aMsrs = this._getRequiredMeasures().map(function(oMsr) {
				return oMsr.getName();
			});

		var oResult = aMsrs.reduce(function(oResult, sMsr) {
			oResult[sMsr] = {min: {}, max: {}};
			return oResult;
		}, {});

		function checkComplete() {
			var bAllComplete = aMsrs.every(function(sMsr) {
				return oResult[sMsr].min.requested && oResult[sMsr].max.requested;
			});
			if (bAllComplete) {
				fnCallback(oResult);
			}
		}

		function onsuccess(sMsr, sKey, oData) {
			oResult[sMsr][sKey].requested = true;
			oResult[sMsr][sKey].value = parseFloat(oData && oData.results[0][sMsr]);
			checkComplete();
		}

		function onerror(sMsr, sKey, oData) {
			oResult[sMsr][sKey].requested = true;
			oResult[sMsr][sKey].error = oData;
			checkComplete();
		}

		var aQueries = aMsrs.reduce(function(aQueries, sMsr) {
			return aQueries.concat({
				urlParameters: {
					"$select": aDims.concat(sMsr).join(","),
					"$top": 1,
					"$orderby": sMsr + " asc"
				},
				success: onsuccess.bind(null, sMsr, "min"),
				error: onerror.bind(null, sMsr, "min")
			}, {
				urlParameters: {
					"$select": aDims.concat(sMsr).join(","),
					"$top": 1,
					"$orderby": sMsr + " desc"
				},
				success: onsuccess.bind(null, sMsr, "max"),
				error: onerror.bind(null, sMsr, "max")
			});
		}, []);

		var oBinding = this.getBinding("data"),
			sPath = oBinding.getPath(),
			oModel = oBinding.getModel();
		aQueries.forEach(function(oQuery) {
			oModel.read(sPath, oQuery);
		});

		return aQueries;
    };

	Chart.prototype._measureRangeReceivedHandler = function(oQueryResult) {
		var mMeasureRange = {};
		jQuery.each(oQueryResult, function(sMsrId, oResult) {
			mMeasureRange[sMsrId] = {
					min: oResult.min.value,
					max: oResult.max.value
			};
		});
		this._mMeasureRange = mMeasureRange;
		var oVizFrame = this._getVizFrame();
		oVizFrame._pendingDataRequest(false);
		this._invalidateBy({
			source: this,
			keys: {
				vizFrame: true
			}
		});
		this.setBusy(false);
	};

	/**
     * Export the current chart as SVG String.
     * The chart is ready to be exported to SVG ONLY after the initialization is finished.
     * Any attempt to export to SVG before that will result in an empty SVG string.
     * @public
     * @param {Object} [option]
     * <pre>
     * {
     *     width: Number - the exported svg will be scaled to the specific width.
     *     height: Number - the exported svg will be scaled to the specific height.
     *     hideTitleLegend: Boolean - flag to indicate if the exported SVG includes the original title and legend.
     *     hideAxis: Boolean - flag to indicate if the exported SVG includes the original axis.
     * }
     * </pre>
     * @return {string} the SVG string of the current viz or empty svg if error occurs.
     */
	Chart.prototype.exportToSVGString = function(option) {
		var sSVGString = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\"/>",
			oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			sSVGString = oVizFrame.exportToSVGString(option);
		}
		return sSVGString;
	};

	return Chart;
});
