sap.ui.define([
	'sap/chart/coloring/ColoringUtils',
	'sap/chart/ChartLog',
	'sap/chart/library',
	'sap/chart/data/TimeDimension'
], function(
	ColoringUtils,
	ChartLog,
	chartLibrary,
	TimeDimension
) {
	"use strict";
	var type = jQuery.type;
	var CriticalityType = chartLibrary.coloring.CriticalityType;

	var Dim = {};
	var validate = function(oMatchedDim, aMsr, aDim, aInResultDims, sColoringType, options) {
		var sRole = oMatchedDim._getFixedRole();
		var sComponent = 'Colorings.' + sColoringType + '.DimensionValues';
		if (oMatchedDim instanceof TimeDimension && oMatchedDim._getFixedRole() === "category") {
			//clid21, clid22
			throw new ChartLog('error', sComponent, 'Do not support ' + sColoringType + ' on timeAxis');
		}
		if (aInResultDims.length) {
			//clid15
			throw new ChartLog('error', sComponent, 'InResult dimension is not allowed in dimension based Criticality');
		}
		var aSeriesDims = aDim.filter(function(oDim) {
			return oDim._getFixedRole() === "series";
		});
		var aCategoryDims = aDim.filter(function(oDim) {
			return oDim._getFixedRole() === "category";
		});

		if (sRole === "category" && !options.bIsPie) {
			if (options.chartType !== "waterfall") {
				if (aSeriesDims.length > 0 || aMsr.length > 1) {
					//clid16
					throw new ChartLog('error', sComponent, 'Existing color legend shall not be changed in Criticality');
				}
			}
		} else if (sRole === "series" || options.bIsPie) {
			var bValid = false;
			switch (options.chartType) {
				case "bubble":
					if (aSeriesDims.length === 1) {
						bValid = true;
					}
					break;
				case "waterfall":
					//waterfall's mnd is always on category
					bValid = true;
					break;
				case "pie":
				case "donut":
					var aAllDims = aSeriesDims.concat(aCategoryDims);
					if (aMsr.length === 1 && aAllDims.length === 1) {
						bValid = true;
					}
					break;
				default:
					// general xy chart
					if (aMsr.length === 1 ||
						(aMsr.length > 1 && aCategoryDims.length === 0)) {
						// only mnd on category or single measure on series
						if (aSeriesDims.length === 0 ||
							(sColoringType === "Criticality" && aSeriesDims.length === 1 && aSeriesDims[0] === oMatchedDim)) {
							//no mnd or dim on series
							bValid = true;
						}
					}
			}
			if (!bValid) {
				//clid16
				throw new ChartLog('error', sComponent, 'Existing color legend shall not be changed in Criticality');
			}
		}
		return;
	};

	Dim.qualify = function(oConfig, aMsr, aDim, aInResultDims, oActiveColoring, sColoringType, options) {
		var sDimName, oCandidateSetting;
		sColoringType = sColoringType || "Criticality";
		var sComponent = 'Colorings.' + sColoringType + '.DimensionValues';

		if (options.bMBC) {
			//clid23
			throw new ChartLog('error', 'Colorings', 'Heatmap only support Criticality.MeasureValues.ConstantThresholds');
		}

		if (!oActiveColoring.parameters || !oActiveColoring.parameters.dimension) {
			if (oConfig) {
				var aKeys = Object.keys(oConfig);
				if (aKeys.length > 1) {
					//clid12
					throw new ChartLog('error', sComponent, 'Multiple dimensions are defined, please resolve by activeColoring property');
				} else if (aKeys.length === 1) {
					sDimName = aKeys[0];
				} else {
					return null;
				}
			}
		} else {
			sDimName = oActiveColoring.parameters.dimension;
		}
		
		if (sDimName) {
			var oMatchedDim = ColoringUtils.find(sDimName, aDim);
			if (!oMatchedDim || !oConfig[sDimName]) {
				//clid13
				throw new ChartLog('error', sComponent, 'Active dimension should be visible');
			} else {
				oCandidateSetting = {
					dim: sDimName,
					setting: oConfig
				};
				validate(oMatchedDim, aMsr, aDim, aInResultDims, sColoringType, options);
			}
		}

		return oCandidateSetting;
	};

	Dim.parse = function(oConfig, aDim, oStatus, oLocale, options) {
		var oSetting = {};
		var oLegend = {};
		var sDimName = oConfig.dim;
		var aCriticalityValues = [];
		var sRole = ColoringUtils.find(sDimName, aDim)._getFixedRole();
		var oDimConfig = oConfig.setting[sDimName];

		// validate settings
		jQuery.each(oDimConfig, function(key, val) {
			var alevels = (type(val) !== "array") ? [val] : val;
			alevels.forEach(function(lvl) {
				var aValues = (type(lvl.Values) !== "array") ? [lvl.Values] : lvl.Values;
				if (aValues.length > 1) {
					if (!lvl.Legend) {
						//clid14
						throw new ChartLog('error', 'Colorings.Criticality.DimensionValues', 'Legend is mandatory when one criticality type has multiple values');
					} else if (sRole === "series" || options.bIsPie) {
						//clid16
						throw new ChartLog('error', 'Colorings.Criticality.DimensionValues', 'Existing color legend shall not be changed in Criticality');
					}
				}
			});
		});

		jQuery.each(oDimConfig, function(key, val) {
			var alevels = (type(val) !== "array") ? [val] : val;
			if (key !== CriticalityType.Neutral) {
				oSetting[key] = alevels.map(function(level) {
					return (type(level.Values) === "array") ? level.Values : [level.Values];
				});
				aCriticalityValues = Array.prototype.concat.apply(aCriticalityValues, oSetting[key]);
			}
			oLegend[key] = alevels.map(function(level) {
				var sVal = (type(level.Values) === "array") ? level.Values[0] : level.Values;
				var sLegend = (level.Legend != null) ? level.Legend : sVal;
				return sLegend;
			});
		});

		var fnNeutralCb = function (oCtx) {
			return aCriticalityValues.indexOf(oCtx[sDimName]) === -1;
		};

		var aNeutralValues = [];
		if (oDimConfig.Neutral) {
			aNeutralValues = (type(oDimConfig.Neutral.Values) === "array") ? oDimConfig.Neutral.Values : [oDimConfig.Neutral.Values];
		}

		var oNeutralInfo = {
			callback: [fnNeutralCb],
			NeutralValues: aNeutralValues,
			CriticalityValues: aCriticalityValues
		};

		function genChecker(aValues) {
			return function(oCtx) {
				return aValues.indexOf(oCtx[sDimName]) !== -1;
			};
		}
		var mCallbacks = {
			Negative: (oSetting.Negative || []).map(genChecker),
			Critical: (oSetting.Critical || []).map(genChecker),
			Positive: (oSetting.Positive || []).map(genChecker)
		};

		return {
			callbacks: mCallbacks,
			legend: oLegend,
			NeutralInfo: oNeutralInfo,
			status: oStatus
		};
	};

	Dim.getContextHandler = function(oCandidateSetting, oLocale) {
		var sDim = oCandidateSetting.dim;
		var oNeutralInfo = oCandidateSetting.parsed.NeutralInfo;

		return function(oContext) {
			var sVal = oContext.getProperty(sDim);
			var status = oCandidateSetting.parsed.status;
			var oCriticalityDim = this.getDimensionByName(sDim);
			if (oNeutralInfo.CriticalityValues.indexOf(sVal) === -1) {
				// non-criticality value
				if (!status.singleOtherValue) {
					status.singleOtherValue = sVal;
				} else if (status.singleOtherValue !== sVal && oCriticalityDim._getFixedRole() === "series") {
					//clid16
					var oChartLog = new ChartLog('error', 'Colorings.Criticality.DimensionValues', 'Existing color legend shall not be changed in Criticality');
					oCandidateSetting.chartLog = oChartLog;
				}

				oCandidateSetting.parsed.callbacks.Neutral = oNeutralInfo.callback;
				if (oNeutralInfo.NeutralValues.indexOf(sVal) === -1) {
					// other value not in Neutral
					oCandidateSetting.parsed.legend.Neutral = oLocale.getText("COLORING_TYPE_OTHER");
				}
			}
		};
	};

	return Dim;
});
