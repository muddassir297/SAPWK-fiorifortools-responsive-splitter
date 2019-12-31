sap.ui.define([
	'sap/chart/coloring/ColoringUtils',
	'sap/chart/coloring/criticality/measureValues/ThresholdsUtils',
	'sap/chart/ChartLog',
	'sap/chart/library'
], function(
	ColoringUtils,
	ThresholdsUtils,
	ChartLog,
	chartLibrary
) {
	"use strict";
	var type = jQuery.type;
	var CriticalityType = chartLibrary.coloring.CriticalityType;
	var mathSymbol = {
		ge: "\u2265", //>=
		lt: "<",
		le: "\u2264", //<=
		gt: ">"
	};

	var Msr = {
		Static: {},
		Calculated: {},
		DynamicThresholds: {},
		ConstantThresholds: {},
		Unmentioned: {}
	};

	Msr.Static.parse = function(oConfig, options, oParsed) {
		var sMsr = oConfig.msr ? oConfig.msr.getName() : undefined;
		var sStaticProperty = oConfig.settings[oConfig.type];
		oParsed.callbacks = Msr.Static.getCallbacks(sStaticProperty, sMsr);
		var oDefaultLegend = oConfig.msr.getLabel() || oConfig.msr.getName();
		var oCustomLegend = oConfig.settings.Legend || {};
		oParsed.legend[sStaticProperty] =  (oCustomLegend[sStaticProperty] != null) ? oCustomLegend[sStaticProperty] : oDefaultLegend;
	};

	Msr.Static.getCallbacks = function(sCriticalityType, sMsr) {
		var cb = {};
		cb[sCriticalityType] = [function(oCtx) {
			return oCtx.hasOwnProperty(sMsr);
		}];
		return cb;
	};

	Msr.Calculated.parse = function(oConfig, options, oParsed, bMBC) {
		var sCalculatedProperty = oConfig.settings[oConfig.type];
		if (!ColoringUtils.find(sCalculatedProperty, options.aDims)) {
			oParsed.additionalDimensions.push(sCalculatedProperty);
		}
		oParsed.status = options.oStatus;
	};

	Msr.Calculated.getCallbacks = function(sPropName, sCriticalityType, sMsr) {
		var cb = function(oCtx) {
			return (oCtx[sPropName] === sCriticalityType) && oCtx.hasOwnProperty(sMsr);
		};
		return [cb];
	};

	Msr.Calculated.getContextHandler = function(aCandidateSettings, bMBC, oLocale) {
		var oCandidate = aCandidateSettings[0];
		var sCalculatedProperty = oCandidate.settings[oCandidate.type];
		return function(oContext) {
			var oStatus = oCandidate.parsed.status;
			oStatus.legend = oStatus.legend || {};
			oStatus.callbacks = oStatus.callbacks || {};
			oCandidate.parsed.legend = oStatus.legend;
			oCandidate.parsed.callbacks = oStatus.callbacks;

			var sCriticalityType = oContext.getProperty(sCalculatedProperty);
			var oCalculatedProperty = this.getDimensionByName(sCalculatedProperty);
			var bDisplayText = this.getDimensionByName(sCalculatedProperty).getDisplayText();

			aCandidateSettings.legendTitle = aCandidateSettings.legendTitle || oCalculatedProperty.getLabel();
			if (!oCalculatedProperty) {
				//clid11
				throw new ChartLog('error', 'Colorings.Criticality.Calculated', 'Calculated property does not exist in data model');
			}
			var sCalculatedTextProperty = oCalculatedProperty.getTextProperty();
			if (sCalculatedTextProperty && bDisplayText) {
				var sCriticalityTypeText = oContext.getProperty(sCalculatedTextProperty);
				oCandidate.parsed.legend[sCriticalityType] = sCriticalityTypeText;
			} else if (sCriticalityType) {
				oCandidate.parsed.legend[sCriticalityType] = oLocale.getText("COLORING_TYPE_" + sCriticalityType.toUpperCase());
			}
			var sMsr = oCandidate.msr.getName();
			var cb = Msr.Calculated.getCallbacks(sCalculatedProperty, sCriticalityType, sMsr);
			oCandidate.parsed.callbacks[sCriticalityType] = cb;
		};
	};

	Msr.DynamicThresholds.parse = function(oConfig, options, oParsed, bMBC, oLocale) {
		var oSetting = oConfig.settings[oConfig.type];
		var sMsr = oConfig.msr ? oConfig.msr.getName() : undefined;
		var sDir = oSetting.ImprovementDirection.toLowerCase();
		var oTolRange = {
			lo: oSetting.ToleranceRangeLowValue,
			hi: oSetting.ToleranceRangeHighValue
		};
		var oDevRange = {
			lo: oSetting.DeviationRangeLowValue,
			hi: oSetting.DeviationRangeHighValue
		};
		checkThresholds(sDir, oTolRange, oDevRange);

		var oBreakdown = {};
		if (oSetting.Breakdown) {
			oBreakdown.NegativeLevels = oSetting.Breakdown.NegativeLevels;
			oBreakdown.CriticalLevels = oSetting.Breakdown.CriticalLevels;
			oBreakdown.PositiveLevels = oSetting.Breakdown.PositiveLevels;
			oBreakdown.MinimumMeasureValue = oSetting.Breakdown.MinimumMeasureValue;
			oBreakdown.MaximumMeasureValue = oSetting.Breakdown.MaximumMeasureValue;
		}

		oParsed.callbacks = ThresholdsUtils.improvement(sDir, sMsr, oTolRange, oDevRange, oBreakdown);
		oParsed.additionalMeasures = [oTolRange.lo, oTolRange.hi, oDevRange.lo, oDevRange.hi, oBreakdown.MinimumMeasureValue, oBreakdown.MaximumMeasureValue].filter(function(val) {
			return type(val) === 'string';
		});
		var oDefaultLegend = {};
		jQuery.each(CriticalityType, function(key, value) {
			oDefaultLegend[value] = oLocale.getText("COLORING_TYPE_" + value.toUpperCase());
		});
		oParsed.legend = jQuery.extend(true, {}, oDefaultLegend, oConfig.settings.Legend);
	};

	function checkThresholds(sDir, oTolRange, oDevRange, bConstant) {
		var bExist, bRange;
		switch (sDir) {
			case 'maximize':
				bExist = oDevRange.lo != undefined && oTolRange.lo != undefined;
				bRange = (ColoringUtils.isNumber(oDevRange.lo, oTolRange.lo) && (oDevRange.lo < oTolRange.lo));
				break;
			case 'minimize':
				bExist = oTolRange.hi != undefined && oDevRange.hi != undefined;
				bRange = (ColoringUtils.isNumber(oTolRange.hi, oDevRange.hi) && (oTolRange.hi < oDevRange.hi));
				break;
			case 'target':
				bExist = oDevRange.lo != undefined && oTolRange.lo != undefined && oTolRange.hi != undefined && oDevRange.hi != undefined;
				bRange = (ColoringUtils.isNumber(oDevRange.lo, oTolRange.lo, oTolRange.hi, oDevRange.hi) && 
					(oDevRange.lo < oTolRange.lo) && (oTolRange.lo < oTolRange.hi) && (oTolRange.hi < oDevRange.hi));
				break;
			default:
		}
		if (!bExist || (bConstant && !bRange)) {
			//clid17, clid20
			var sThresholds = bConstant ? "ConstantThresholds" : "DynamicThresholds";
			throw new ChartLog('error', 'Colorings.Criticality.' + sThresholds, 'Invalid Thresholds settings');
		}
	}

	Msr.ConstantThresholds.parse = function(oConfig, options, oParsed, bMBC) {
		var oSetting = oConfig.settings[oConfig.type];
		var sMsr = oConfig.msr ? oConfig.msr.getName() : undefined;
		var sDir = oSetting.ImprovementDirection.toLowerCase();
		var oTolRange = {
			lo: oConfig.byAggregation.ToleranceRangeLowValue,
			hi: oConfig.byAggregation.ToleranceRangeHighValue
		};
		var oDevRange = {
			lo: oConfig.byAggregation.DeviationRangeLowValue,
			hi: oConfig.byAggregation.DeviationRangeHighValue
		};
		checkThresholds(sDir, oTolRange, oDevRange, true);

		var oBreakdown = {};
		if (oSetting.Breakdown) {
			oBreakdown.NegativeLevels = oSetting.Breakdown.NegativeLevels;
			oBreakdown.CriticalLevels = oSetting.Breakdown.CriticalLevels;
			oBreakdown.PositiveLevels = oSetting.Breakdown.PositiveLevels;
			oBreakdown.MinimumMeasureValue = oConfig.byAggregation.Breakdown.MinimumMeasureValue;
			oBreakdown.MaximumMeasureValue = oConfig.byAggregation.Breakdown.MaximumMeasureValue;
		}

		if (bMBC) {
			oParsed.legend = ThresholdsUtils.MBCimprovement(sDir, oTolRange, oDevRange);
		} else {
			oParsed.callbacks = ThresholdsUtils.improvement(sDir, sMsr, oTolRange, oDevRange, oBreakdown);
			oParsed.additionalMeasures = [oTolRange.lo, oTolRange.hi, oDevRange.lo, oDevRange.hi, oBreakdown.MinimumMeasureValue, oBreakdown.MaximumMeasureValue].filter(function(val) {
				return type(val) === 'string';
			});
			oParsed.legend = Msr.ConstantThresholds.getLegend(sDir, sMsr, oTolRange, oDevRange);
		}
	};

	Msr.ConstantThresholds.getLegend = function(sDir, sMsr, oTolRange, oDevRange) {
		var oLegend = {};

		var maximizePositive = sMsr + ' ' + mathSymbol.ge + ' ' + oTolRange.lo;
		var maximizeCritical = oDevRange.lo + ' ' + mathSymbol.le + ' ' + sMsr + ' ' + mathSymbol.lt + ' ' + oTolRange.lo;
		var maximizeNegative = sMsr + ' ' + mathSymbol.lt + ' ' + oDevRange.lo;

		var minimizePositive = sMsr + ' ' + mathSymbol.le + ' ' + oTolRange.hi;
		var minimizeCritical = oTolRange.hi + ' ' + mathSymbol.lt + ' ' + sMsr + ' ' + mathSymbol.le + ' ' + oDevRange.hi;
		var minimizeNegative = sMsr + ' ' + mathSymbol.gt + ' ' + oDevRange.hi;

		switch (sDir) {
			case 'maximize':
				oLegend = {
					Positive: maximizePositive,
					Critical: maximizeCritical,
					Negative: maximizeNegative
				};
				break;
			case 'minimize':
				oLegend = {
					Positive: minimizePositive,
					Critical: minimizeCritical,
					Negative: minimizeNegative
				};
				break;
			case 'target':
				oLegend = {
					Positive: oTolRange.lo + ' ' + mathSymbol.le + ' ' + sMsr + ' ' + mathSymbol.le + ' ' + oTolRange.hi,
					Critical: maximizeCritical + ' , ' + minimizeCritical,
					Negative: maximizeNegative + ' , ' + minimizeNegative
				};
				break;	
			default:
		}
		return oLegend;
	};

	Msr.ConstantThresholds.getContextHandler = function(aCandidateSettings, bMBC) {
		if (bMBC) {
			var oCandidate = aCandidateSettings[0];
			var sMsr = oCandidate.msr.getName();
			var oLegend = oCandidate.parsed.legend;
			return function(oContext) {
				var iVal = oContext.getProperty(sMsr);
				oLegend.min = Math.min(oLegend.min, iVal);
				oLegend.max = Math.max(oLegend.max, iVal);
			};
		} else {
			return null;
		}
	};

	Msr.Unmentioned.getCallbacks = function(aMsrs) {
		var cb = {
			'Unmentioned': aMsrs.map(function(oMsr) {
				return function(oCtx) {
					return oCtx.hasOwnProperty(oMsr.getName());
				};
			})
		};
		return cb;
	};

	Msr.Unmentioned.parse = function(oConfig, options, oParsed) {
		oParsed.callbacks = Msr.Unmentioned.getCallbacks(oConfig.settings);
		oParsed.legend = oConfig.settings.map(function(oMsr) {
			return oMsr.getLabel() || oMsr.getName();
		});
	};

	return Msr;
});