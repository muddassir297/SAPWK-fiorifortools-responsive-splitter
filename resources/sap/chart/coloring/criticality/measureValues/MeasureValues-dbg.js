sap.ui.define([
	'sap/chart/coloring/ColoringUtils',
	'sap/chart/coloring/ColorPalette',
	'sap/chart/coloring/criticality/measureValues/MeasureUtils',
	'sap/chart/ChartLog'
], function(
	ColoringUtils,
	ColorPalette,
	MeasureUtils,
	ChartLog
) {
	"use strict";
	var type = jQuery.type;
	var MeasureValues = {};

	MeasureValues.validate = function(aConfigs, aMsrs, aDims, aActiveMsrs) {
		if (aActiveMsrs.length > 1) {
			// Multiple measures with Static method
			var oCriticalityType = {};
			aConfigs.forEach(function(oConfig) {
				if (oConfig.type === "Static") {
					var sStatic = oConfig.settings.Static;
					if (oCriticalityType[sStatic]) {
						//clid4
						throw new ChartLog('error', 'Colorings.Criticality.Static', 'Measures using Static method must have different Criticality Type');
					} else {
						oCriticalityType[sStatic] = true;
					}
				} else {
					//clid5
					throw new ChartLog('error', 'Colorings.Criticality', 'Only support multiple active measures using Static method');
				}
			});
		} else if (aActiveMsrs.length < 1) {
			// activeColoring is not defined
			if (aConfigs.length > 1) {
				//clid6
				throw new ChartLog('error', 'Colorings.Criticality.MeasureValues', 'Multiple measures are defined, please resolve by activeColoring property');
			}
		}
	};

	MeasureValues.qualify = function(oConfig, aMsrs, aDims, oStatus, oActiveColoring, options) {
		var aCandidateConfigs = [];
		var sAggregationKey = aDims.map(function(oDim) {
			return oDim.getName();
		}).sort().join(",");
		var aMentionedMsrs = [];
		var aActiveMsrs = [];

		if (oActiveColoring && oActiveColoring.parameters && oActiveColoring.parameters.measure) {
			aActiveMsrs = (type(oActiveColoring.parameters.measure) === "array") ? 
			oActiveColoring.parameters.measure : [oActiveColoring.parameters.measure];
			var bActiveMsrVisible = aActiveMsrs.every(function(sMsr) {
				return ColoringUtils.find(sMsr, aMsrs);
			});
			if (!bActiveMsrVisible) {
				//clid7
				throw new ChartLog('error', 'Colorings', 'Active Dimensions/Measures should be visible');
			}
		}

		jQuery.each(oConfig, function(sMeasureName, oSetting) {
			var aSettingKeys = Object.keys(oSetting);
			var oMatchedMsr = ColoringUtils.find(sMeasureName, aMsrs);
			var aExcludeLegend = aSettingKeys.filter(function(key) {
				return key !== "Legend";
			});

			if (aActiveMsrs.length && aActiveMsrs.indexOf(sMeasureName) === -1) {
				// filter inactive config
				return;
			}
			if (aExcludeLegend.length !== 1) {
				//clid8
				throw new ChartLog('error', 'Colorings.Criticality.MeasureValues', 'One and only one of "Static", "Calculated", "DynamicThresholds", or "ConstantThresholds" is required');
			}
			if (!oMatchedMsr) {
				return;
			}

			var sKey = aExcludeLegend[0];
			aCandidateConfigs.sMethod = sKey;

			if (sKey === "ConstantThresholds") {
				var oMatchedByAggregation = null;
				for (var i = 0; i < oSetting[sKey].AggregationLevels.length; i++) {
					var sAggKeyToTest = oSetting[sKey].AggregationLevels[i].VisibleDimensions.sort().join(",");
					if (sAggKeyToTest === sAggregationKey) {
						oMatchedByAggregation = oSetting[sKey].AggregationLevels[i];
						break;
					}
				}

				if (oMatchedByAggregation) {
					aCandidateConfigs.push({
						type: sKey,
						msr: oMatchedMsr,
						settings: oSetting,
						byAggregation: oMatchedByAggregation
					});
					aMentionedMsrs.push(oMatchedMsr.getName());
				}

			} else {
				aCandidateConfigs.push({
					type: sKey,
					msr: oMatchedMsr,
					settings: oSetting
				});
				aMentionedMsrs.push(oMatchedMsr.getName());
			}
		});
	    
		if (aCandidateConfigs.length) {
			MeasureValues.validate(aCandidateConfigs, aMsrs, aDims, aActiveMsrs);
			if (options.bMBC && aCandidateConfigs[0].type != "ConstantThresholds") {
				//clid23
				throw new ChartLog('error', 'Colorings', 'Heatmap only support Criticality.MeasureValues.ConstantThresholds');
			}
			if (options.bShowUnmentionedMsr) {
				var aUnmentionedMsrs = aMsrs.filter(function(oMsr) {
					return aMentionedMsrs.indexOf(oMsr.getName()) === -1;
				});
				if (aUnmentionedMsrs.length && aUnmentionedMsrs.length <= 5) {
					aCandidateConfigs.push({
						type: "Unmentioned",
						settings: aUnmentionedMsrs
					});
				} else if (aUnmentionedMsrs.length > 5) {
					//clid18
					throw new ChartLog("warning", 'Colorings.Criticality.MeasureValues', "Too many unmentioned measures (the maximum number is 5)");
				}
			}

		}

		return aCandidateConfigs;
	};

	MeasureValues.parse = function(oConfig, aMsrs, aDims, aInResultDims, oStatus, oOptions, oLocale) {
		var bMBC = oOptions.bMBC;
		var bIsPie = oOptions.bIsPie;
		var options = {
			aMsrs: aMsrs,
			aDims: aDims,
			oStatus: oStatus
		};
		var oParsed = {
			msr: oConfig.msr,
			callbacks: {},
			additionalMeasures: [],
			additionalDimensions: [],
			legend: {}
		};
		
		if (aInResultDims.length) {
			//clid9
			throw new ChartLog('error', 'colorings.Criticality.MeasureValues', 'Semantic coloring could not be applied if inResult Dimensions exist');
		}

		var bHasSeriesDim = aDims.some(function(oDim) {
			return oDim._getFixedRole() === "series";
		});
		if (bHasSeriesDim || (bIsPie && aDims.length)) {
			// Dimensions of Pie(donut) will automatically map to color feeding
			//clid10
			throw new ChartLog('error', 'colorings.Criticality.MeasureValues', 'Semantic coloring could not be applied if chart already has coloring');
		}

		MeasureUtils[oConfig.type].parse(oConfig, options, oParsed, bMBC, oLocale);
		return oParsed;
	};

	MeasureValues.getContextHandler = function(sCriticalityMethod, aCandidateSettings, bMBC, oLocale) {
		if (MeasureUtils[sCriticalityMethod].getContextHandler) {
			return MeasureUtils[sCriticalityMethod].getContextHandler(aCandidateSettings, bMBC, oLocale);
		} else {
			return null;
		}
	};

	return MeasureValues;
});