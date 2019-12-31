/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/**
 * Initialization Code and shared classes of library sap.chart.
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/ui/core/library', // library dependency
	'sap/viz/library',
	'sap/chart/utils/RoleFitter',
	'sap/chart/ChartType'
], function(jQuery, ChartFormatter, corelib, vizlib, RoleFitter, ChartType) {
	"use strict";

	/**
	 * Chart controls based on Vizframe
	 *
	 * @namespace
	 * @name sap.chart
	 * @public
	 */

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name: "sap.chart",
		dependencies: ["sap.ui.core", "sap.viz"],
		types: [
			"sap.chart.data.MeasureSemantics"
		],
		interfaces: [],
		controls: [
			"sap.chart.Chart"
		],
		elements: [
			"sap.chart.data.Dimension",
			"sap.chart.data.TimeDimension",
			"sap.chart.data.Measure"
		],
		noLibraryCSS: true,
		version: "1.46.2"
	});


	/**
	 * @class
	 * Enumeration for supported selection mode in analytical chart
	 *
	 * @static
	 * @public
	 * @alias sap.chart.SelectionMode
	 */
	sap.chart.SelectionMode = {
		/**
		 * Multi selection mode, multiple sets of data points can be selected at once.
		 * @public
		 */
		Multi: "MULTIPLE",
		/**
		 * Single selection mode, only one set of data points can be selected at once.
		 * @public
		 */
		Single: "SINGLE",
		/**
		 * None selection mode, no data points can be selected.
		 * @public
		 */
		None : "NONE"
	};

	/**
	 * @class
	 * Enumeration for supported selection behavior in analytical chart
	 *
	 * @static
	 * @public
	 * @alias sap.chart.SelectionBehavior
	 */
	sap.chart.SelectionBehavior = {
		/**
		 * Data point selection behavior, only one data point can be selected at once.
		 * @public
		 */
		DataPoint: "DATAPOINT",
		/**
		 * Category selection behavior, one category of data points can be selected at once.
		 * @public
		 */
		Category: "CATEGORY",
		/**
		 * Series selection behavior, one seies of data points can be selected at once.
		 * @public
		 */
		Series: "SERIES"
	};
	
	/**
	 * @class
	 * Enumeration for supported message types in analytical chart.
	 *
	 * @static
	 * @public
	 * @alias sap.chart.MessageId
	 */
	sap.chart.MessageId = {
		/**
		 * No data message, metadata is defined but all data values are empty.
		 * @public
		 */
		NoData: "NO_DATA",
		/**
		 * Multiple units message, multiple unites are not allowed in one measure for analytical chart.
		 * @public
		 */
		MultipleUnits: "MULTIPLE_UNITS"
	};

	/**
	 * Package with additional chart APIs
	 * @namespace
	 * @public
	 */
	sap.chart.api = {};

	/**
	 * Returns all chart types currently supported by chart control (subset of viz types).
	 *
	 * @public
	 * @returns {object} a map with chartType as key, localized chart name as value.
	 */
	sap.chart.api.getChartTypes = function() {
		var sPath = jQuery.sap.getModulePath("sap.chart");
		var oBundle = jQuery.sap.resources({
			url: sPath + "/i18n/i18n.properties"
		});

		return Object.keys(sap.chart.ChartType).reduce(function(oMap, sChartTypeKey) {
			var sChartType = sap.chart.ChartType[sChartTypeKey];
			oMap[sChartType] = oBundle.getText("info/" + sChartType);
			return oMap;
		}, {});
	};

	/**
	 * Package with additional chart data APIs
	 * @namespace
	 * @public
	 */
	sap.chart.data = sap.chart.data || {};

	/**
	 * Enum of available semantics value for Measure.
	 *
	 * @enum {string}
	 * @public
	 */
	sap.chart.data.MeasureSemantics = {
		/**
		 * facts that happened in the past.
		 * @public
		 */
		Actual: "actual",
		/**
		 * where values will be, e.g.: forecasts, estimations, predictions.
		 * @public
		 */
		Reference: "reference",
		/**
		 * where values should be, e.g.: thresholds, targets.
		 * @public
		 */
		Projected: "projected"
	};

	/**
	 * Package with colorings enumeration
	 * @namespace
	 * @public
	 */
	sap.chart.coloring = sap.chart.coloring || {};

	/**
	 * Enum of available colorings.
	 *
	 * @enum {string}
	 * @public
	 */
	sap.chart.ColoringType = {
		/**
		 * Criticality is based on the semantic color palette. 
		 *
		 * It can be defined for measure values and dimension values.
		 * <pre>
		 * Criticality: {
         *     MeasureValues: {
         *         ...
         *     },
         *     DimensionValues: {
         *         ...
         *     }
		 * }
		 * </pre>
		 *
		 * <b>For measure values</b>, criticality can be based on <code>static</code>, <code>calculated</code>, <code>DynamicThresholds</code> and <code>ConstantThresholds</code>
		 *
		 * <code>Legend</code> is <b>optional</b> and can be used for custom legend labels.
		 * <pre>
         * MeasureValues: {
         *     'measureName': {
         *         Static: ... ,
         *         Calculated: ... ,
         *         DynamicThresholds: {
		 *             ...
         *         },
         *         ConstantThresholds: {
         *             ...
         *         },
         *         Legend: {
         *             Title: string,    // (optional) fixed, localized label
         *             Positive: string, // fixed, localized label
         *             Critical: string, // fixed, localized label
         *             Negative: string, // fixed, localized label
         *             Neutral:  string  // fixed, localized label
         *         }
         *     },
         *     'measureName': { 
         *         ...
         *     }
         * }
         * </pre>
		 * <ul>
		 *   <li><code>static</code>
		 *
		 *   It indicates that the measure is always considered in the same way, for example positive.
		 *
		 *   The value of <code>static</code> is listed in {@link sap.chart.coloring.CriticalityType}
		 *
		 *   Example:
		 *
		 *   In this case, all 'Profit' datapoints shall use Positive semantic color and all 'Revenue' datapoints shall use Negative semantic color.
		 *   <pre>
		 *   var oColorings = {
		 *       Criticality: {
         *           MeasureValues: {
         *               Profit: {
		 *                   Static: sap.chart.ColoringType.Positive
         *               },
         *               Revenue: {
		 *                   Static: sap.chart.ColoringType.Negative
		 *               }
         *           }
         *       }
		 *   };
		 *   var oActiveColoring = {
		 *       coloring: sap.chart.ColoringType.Criticality,
		 *       parameters: {
		 *           measure: ['Profit', 'Revenue']
		 *       }
		 *   };
		 *   </pre>
		 *   </li>
		 *   <li><code>Calculated</code>
		 *
		 *   Criticality is calculated by the backend service.
		 *
		 *   The value of <code>Calculated</code> is a dimension name. The criticality of the measure of a datapoint is determined by the value of this dimension
		 *   and its textProperty(if exists) will be used as legend label.
		 *
		 *   The possible values of this certain dimension are listed in {@link sap.chart.coloring.CriticalityType}.
		 *
		 *   Example:
		 *
		 *   In this case, the criticality of 'Profit' measure is determined by the value of 'ProfitCriticality' dimension which is calculated by backend service.
		 *   <pre>
		 *   var oColorings = {
		 *       Criticality: {
         *           MeasureValues: {
         *               Profit: {
		 *                   Calculated: 'ProfitCriticality'
         *               }
         *           }
         *       }
		 *   };
		 *   var oActiveColoring = {
		 *       coloring: sap.chart.ColoringType.Criticality,
		 *       parameters: {
		 *           measure: ['Profit']
		 *       }
		 *   };
		 *   </pre>
		 *   </li>
		 *   <li><code>DynamicThresholds</code>
		 *
		 *   Criticality is expressed with thresholds for the boundaries between negative, critical, and positive.
		 *
		 *   The direction of improvement for measure values is mandatory, combined with corresponding thresholds.
		 *
		 *   Please refer to {@link sap.chart.coloring.ImprovementDirectionType} for detailed usage.
		 *   <pre>
		 *   DynamicThresholds: {
         *       ImprovementDirection: string,    // refer to sap.chart.coloring.ImprovementDirectionType for detailed definition
         *       ToleranceRangeLowValue: string,  // measure name
         *       ToleranceRangeHighValue: string, // measure name
         *       DeviationRangeLowValue: string,  // measure name
         *       DeviationRangeHighValue: string, // measure name
         *   }
         *   </pre>
         *   Example:
		 *
		 *   In this case, the criticality of 'Profit' measure is determined by the value of 'ProfitToleranceRangeLowValue' and 'ProfitDeviationRangeLowValue' measure calculated with improvement direction <code>'Maximize'</code>.
		 *   <pre>
		 *   var oColorings = {
		 *       Criticality: {
         *           MeasureValues: {
         *               Profit: {
		 *                    DynamicThresholds : {
         *                        ImprovementDirection: sap.chart.coloring.ImprovementDirectionType.Maximize,
         *                        ToleranceRangeLowValue: 'ProfitToleranceRangeLowValue',
         *                        DeviationRangeLowValue: 'ProfitDeviationRangeLowValue'
		 *                    }
         *               }
         *           }
         *       }
		 *   };
		 *   var oActiveColoring = {
		 *       coloring: sap.chart.ColoringType.Criticality,
		 *       parameters: {
		 *           measure: ['Profit']
		 *       }
		 *   };
		 *   </pre>
		 *   </li>
		 *   <li><code>ConstantThresholds</code>
		 *
		 *   Criticality is expressed with thresholds for the boundaries between negative, critical, and positive.
		 *
		 *   The direction of improvement for measure values is mandatory, combined with corresponding thresholds.
		 *
		 *   Also Aggregation level (the visible dimensions) must be specified for providing the context for assessing the criticality.
		 *
		 *   Legend label is shown as value range and do not support customization in ConstantThresholds.
		 *
		 *   Please refer to {@link sap.chart.coloring.ImprovementDirectionType} for detailed usage. 
		 *   <pre>
		 *   ConstantThresholds: {
         *       ImprovementDirection: string, refer to sap.chart.coloring.ImprovementDirectionType for detailed definition
         *       AggregationLevels: [{
         *            VisibleDimensions: ['dimensionName', ...],
         *            ToleranceRangeLowValue: Number,
         *            ToleranceRangeHighValue: Number,
         *            DeviationRangeLowValue: Number,
         *            DeviationRangeHighValue: Number
         *       },
         *       ...]
         *   }
         *   </pre>
         *   Example:
		 *
		 *   In this case, the criticality of 'Profit' measure is determined by two concrete thresholds calculated with improvement direction <code>'Maximize'</code>.
		 *   <pre>
		 *   var oColorings = {
		 *       Criticality: {
         *           MeasureValues: {
         *               Profit: {
		 *                    ConstantThresholds : {
         *                        ImprovementDirection: sap.chart.coloring.ImprovementDirectionType.Maximize,
         *                        ToleranceRangeLowValue: 80,
         *                        DeviationRangeLowValue: 60
		 *                    }
         *               }
         *           }
         *       }
		 *   };
		 *   var oActiveColoring = {
		 *       coloring: sap.chart.ColoringType.Criticality,
		 *       parameters: {
		 *           measure: ['Profit']
		 *       }
		 *   };
		 *   </pre>
		 *   </li>
		 * </ul>
		 *
		 * <b>For dimension values</b>
		 *
		 * Criticality can be expressed by assigning values to negative, critical, and positive. Unassigned dimension values are automatically assigned to neutral.
		 *
		 * <code>'Values'</code> is used to specify concrete dimension value(s). <code>'Legend'</code> is used to customize legend label which is mandatory when multiple dimension values defined in <code>'Values'</code>.
		 *
		 * <pre> 
		 * DimensionValues: { 
		 *     'dimensionName': {
		 *          Positive: {
		 *              Values: 'dimensionValue' or ['dimensionValue', ...]
		 *              Legend: string // mandatory for value array
		 *          },
         *          Critical: {
         *              Values: 'dimensionValue' or ['dimensionValue', ...]
		 *              Legend: string // mandatory for value array
         *          },
         *          Negative: {
         *              Values: 'dimensionValue' or ['dimensionValue', ...]
		 *              Legend: string // mandatory for value array
         *          },
         *          Neutral: {
         *              Values: 'dimensionValue' or ['dimensionValue', ...]
		 *              Legend: string // mandatory for value array
         *          }
         *     },
         *     'dimensionName': {
         *         ... 
         *     } 
         * }
         * </pre>
         * Example:
		 *
		 * In this case, the criticality of 'OrderStatus' dimension is determined by values specified to different criticality classes.
		 * <pre>
		 * var oColorings = {
		 *     Criticality: {
         *         DimensionValues: {
         *             OrderStatus: {
		 *                  Positive : {
         *                      Values: 'Finished'
		 *                  },
		 *                  Critical : {
         *                      Values: 'Pending'
		 *                  },
		 *                  Negative : {
         *                      Values: ['Stopped', 'Not Started'],
         *                      Legend: 'Alert'
		 *                  },
		 *                  Neutral : {
         *                      Values: ['Processing', 'Surveyed'],
         *                      Legend: 'Normal'
		 *                  }
         *             }
         *         }
         *     }
		 * };
		 * var oActiveColoring = {
		 *     coloring: sap.chart.ColoringType.Criticality,
		 *     parameters: {
		 *         dimension: ['OrderStatus']
		 *     }
		 * };
		 * </pre>
		 * @public
		 */
		Criticality: "Criticality",
		/**
		 * Emphasis is about highlighting certain data points in a chart.
		 *
		 * It can be defined for dimension values.
		 * <pre>
		 * Emphasis: {
         *     DimensionValues: {
         *         ...
         *     }
		 * }
		 * </pre>
		 * <b>For dimension values</b>
		 *
		 * Highlight a specified set of values of a dimension visible in the current chart layout. The qualitative color palette is used.
		 *
		 * <code>'Values'</code> is used to specify dimension value(s) for highlight. <code>'Legend'</code> is used to customize legend label whose <code>'Hightlighted'</code> is mandatory when multiple dimension values defined in <code>'Values'</code>.
		 * <pre>
		 * DimensionValues: {
         *     'dimensionName': {
         *         Values: 'dimensionValue' or ['dimensionValue', ...],
         *         Legend: {
         *            Highlighted: string // mandatory for value array
         *            Others: string      // optional
         *         }
         *     },
         *     'dimensionName': {
         *         ...
         *     }
         * }
		 * </pre>
		 * Example:
		 *
		 * In this case, 'German' and 'France' are highlighted in 'Country' dimension with customized legend label 'Europe'.
		 * <pre>
		 * var oColorings = {
		 *     Emphasis: {
         *         DimensionValues: {
         *             Country: {
         *                 Values: ['German', 'France']
         *                 Legend: 'Europe'
		 *             }
         *         }
         *     }
		 * };
		 * var oActiveColoring = {
		 *     coloring: sap.chart.ColoringType.Emphasis,
		 *     parameters: {
		 *         dimension: ['Country']
		 *     }
		 * };
		 * </pre>
		 * @public
		 */
		Emphasis: "Emphasis"
	};

	/**
	* Enumeration for supported criticality types in analytical chart
	*
	* @enum {string}
	* @public
	* @alias sap.chart.coloring.CriticalityType
	*/
	sap.chart.coloring.CriticalityType = {
		/**
		 * Negative
		 * @public
		 */
		Negative: "Negative",

		/**
		 * Critical
		 * @public
		 */
		Critical: "Critical",

		/**
		 * Positive
		 * @public
		 */
		Positive: "Positive",

		/**
		 * Neutral
		 * @public
		 */
		Neutral: "Neutral"
	};

	/**
	* Enumeration for supported ImprovementDirection types in analytical chart
	*
	* @enum {string}
	* @public
	* @alias sap.chart.coloring.ImprovementDirectionType
	*/
	sap.chart.coloring.ImprovementDirectionType = {
		/**
		 * Lower is better.
		 * 
		 * Positive if the value is lower than or equal to <code>ToleranceRangeHighValue</code>.
		 * 
		 * Critical if the value is greater than <code>ToleranceRangeHighValue</code> and lower than or equal to <code>DeviationRangeHighValue</code>.
		 * 
		 * Negative if the value is greater than <code>DeviationRangeHighValue</code>.
		 * @public
		 */
		Minimize: "Minimize",

		/**
		 * Closer to the target is better.
		 * 
		 * Positive if the value is greater than or equal to <code>ToleranceRangeLowValue</code> and lower than or equal to <code>ToleranceRangeHighValue</code>.
		 * 
		 * Critical if the value is greater than or equal to <code>DeviationRangeLowValue</code> and lower than <code>ToleranceRangeLowValue</code> OR greater than <code>ToleranceRangeHighValue</code> and lower than or equal to <code>DeviationRangeHighValue</code>.
		 * 
		 * Negative if the value is lower than <code>DeviationRangeLowValue</code> or greater than <code>DeviationRangeHighValue</code>.
		 * @public
		 */
		Target: "Target",

		/**
		 * Higher is better.
		 * 
		 * Positive if the value is greater than or equal to <code>ToleranceRangeLowValue</code>.
		 * 
		 * Critical if the value is lower than <code>ToleranceRangeLowValue</code> and greater than or equal to <code>DeviationRangeLowValue</code>.
		 * 
		 * Negative if the value is lower than <code>DeviationRangeLowValue</code>.
		 * @public
		 */
		Maximize: "Maximize"
	};

	/**
	 * Get the Dimensions and Measures layout for a certain ChartType with provided Dimensions and Measures.
	 *
	 * @param {string} sChartType chart type
	 * @param {object[]} aDimensions visible Dimensions of the form {name: sName}
	 * @param {object[]} aMeasures visible Measures of the form {name: sName}.
	 *
	 * @public
	 * @returns {object} the chart layout object of the following form:
	 * <pre>
	 * {
	 *   dimensions: [],     // names of dimensions that will be rendered
	 *	 measures:	 [],     // names of measures that will be rendered
	 *	 errors:	 [],     // reasons of why the chart cannot be rendered with the given (chartType, dimensions, measures) combination
	 * }
	 */
	sap.chart.api.getChartTypeLayout = function(sChartType, aDimensions, aMeasures) {
		var aDims, aMsrs;
		if (!sChartType) {
			throw new Error("Invalid chart type: " + String(sChartType));
		}
		if (aDimensions) {
			aDims = aDimensions.map(function(oDimCfg, i) {
				if (oDimCfg && oDimCfg.name) {
					return {
						getName: function() {return oDimCfg.name;},
						getRole: function() {return oDimCfg.role || "category";}
					};
				} else {
					throw new Error("Invalid Dimension at [" + i + "]: " + String(oDimCfg) + ". Dimension should be an object of the format{name:'name'}.");
				}
			});
		} else {
			aDims = [];
		}
		if (aMeasures) {
			aMsrs = aMeasures.map(function(oMsrCfg, i) {
				if (oMsrCfg && oMsrCfg.name) {
					return {
						getName: function() {return oMsrCfg.name;},
						getRole: function() {return oMsrCfg.role || "axis1";}
					};
				} else {
					throw new Error("Invalid Measure at [" + i + "]: " +  String(oMsrCfg) + ". Measure should be an object of the format{name:'name'}.");
				}
			});
		} else {
			aMsrs = [];
		}

		var oCompatibility = RoleFitter.compatible(sChartType, aDims, aMsrs);

		return {
			dimensions: oCompatibility.used.Dimension || [],
			measures: oCompatibility.used.Measure || [],
			errors: Object.keys(oCompatibility.error || {}).reduce(function(aErrs, sCause) {
				return aErrs.concat({cause: sCause, detail: oCompatibility.error[sCause]});
			}, [])
		};
	};

	var FIORI_LABEL_SHORTFORMAT_10 = "__UI5__ShortIntegerMaxFraction10";
	var FIORI_LABEL_FORMAT_2 = "__UI5__FloatMaxFraction2";
	var FIORI_LABEL_SHORTFORMAT_2 = "__UI5__ShortIntegerMaxFraction2";

	var chartFormatter = ChartFormatter.getInstance();
	chartFormatter.registerCustomFormatter(FIORI_LABEL_SHORTFORMAT_10, function(value) {
		var fixedInteger = sap.ui.core.format.NumberFormat.getIntegerInstance({style: "short",
			maxFractionDigits: 10});
		return fixedInteger.format(value);
	});
	chartFormatter.registerCustomFormatter(FIORI_LABEL_FORMAT_2, function(value) {
		var fixedFloat = sap.ui.core.format.NumberFormat.getFloatInstance({style: 'Standard',
			maxFractionDigits: 2});
		return fixedFloat.format(value);
	});
	chartFormatter.registerCustomFormatter(FIORI_LABEL_SHORTFORMAT_2, function(value) {
		var fixedInteger = sap.ui.core.format.NumberFormat.getIntegerInstance({style: "short",
			maxFractionDigits: 2});
		return fixedInteger.format(value);
	});
	this._oChartForamtter = chartFormatter;

	if (!(sap.viz.api.env.Format.numericFormatter() instanceof ChartFormatter)) {
		sap.viz.api.env.Format.numericFormatter(chartFormatter);
	}

	return sap.chart;

});
