/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/chart/coloring/criticality/measureValues/MeasureValues',
	'sap/chart/coloring/criticality/DimensionValues',
	'sap/chart/coloring/ColoringUtils',
	'sap/chart/coloring/ColorPalette',
	'sap/chart/ChartLog',
	'sap/chart/library'
], function(
	MeasureValues,
	DimensionValues,
	ColoringUtils,
	ColorPalette,
	ChartLog,
	chartLibrary
) {
	"use strict";
	var type = jQuery.type;
	var SUPPORTED_TYPES = ['DimensionValues', 'MeasureValues'];
	var CriticalityType = chartLibrary.coloring.CriticalityType;
	var aMeasureLegendOrder = [
		CriticalityType.Positive,
		CriticalityType.Neutral,
		CriticalityType.Critical,
		CriticalityType.Negative,
		'Unmentioned'
	];
	var aDimensionLegendOrder = [
		CriticalityType.Positive,
		CriticalityType.Critical,
		CriticalityType.Negative,
		CriticalityType.Neutral
	];

	function use(oColorings, oActiveCriticalityColoring) {
		var oParams = oActiveCriticalityColoring ? oActiveCriticalityColoring.parameters : {};
		var types = Object.keys(oColorings).filter(function(sType) {
			return !SUPPORTED_TYPES.indexOf(sType) !== -1;
		});

		if (oParams && oParams.dimension && oParams.measure) {
			//clid3
			throw new ChartLog('error', 'colorings.Criticality', 'Both "DimensionValues" and "MeasureValues" present in coloring CRITICALITY, activeColoring.parameters is required to specify which to use');
		} else if (oParams && oParams.dimension) {
			return 'DimensionValues';
		} else if (oParams && oParams.measure) {
			return 'MeasureValues';
		} else if (types.length === 1) {
			return types[0];
		} else {
			return null;
		}
	}

	function createRules(aCandidateSettings, aLegendOrder) {
		var aRules = [];
		aLegendOrder.forEach(function(sCriticalityType) {
			aCandidateSettings.forEach(function(oCandidateSetting) {
				if (oCandidateSetting.chartLog) {
					throw oCandidateSetting.chartLog;
				}
				var aCbs = oCandidateSetting.parsed.callbacks[sCriticalityType] || [];
				aCbs.forEach(function(fnCb, idx) {
					var aColors, sDisplayName;
					if (sCriticalityType === "Unmentioned") {
						aColors = ColoringUtils.assignUnmentionedColor(ColorPalette.CRITICALITY.Neutral, aCbs.length);
						sDisplayName = oCandidateSetting.parsed.legend[idx];
					} else {
						aColors = ColoringUtils.assignColor(ColorPalette.CRITICALITY[sCriticalityType], aCbs.length);
						var oLegend = oCandidateSetting.parsed.legend[sCriticalityType];
						sDisplayName = (type(oLegend) === "array") ? oLegend[idx] : oLegend;
					}
					aRules.push({
						callback: fnCb,
						properties: {
							color: aColors[idx]
						},
						displayName: sDisplayName
					});
				});
			});
		});
		return aRules;
	}

	function createScales(aCandidateSettings) {
		var oCandidate = aCandidateSettings[0];
		var oLegend = oCandidate.parsed.legend;
		
		var aPalettes = [], aBoundaries = [];
		var bNeedMin = (oLegend.segments[0].upperBound > oLegend.min) ? true : false;
		var bNeedMax = (oLegend.segments[oLegend.segments.length - 2].upperBound < oLegend.max) ? true : false;

		oLegend.segments.forEach(function(oSegment) {
			var aColors = ColoringUtils.assignColor(ColorPalette.CRITICALITY[oSegment.CriticalityType], 1);
			aPalettes.push(aColors[0]);
			aBoundaries.push(oSegment.upperBound);
		});

		if (bNeedMin) {
			aBoundaries = [oLegend.min].concat(aBoundaries);
		} else {
			aPalettes.splice(0, 1);
		}

		if (bNeedMax) {
			aBoundaries[aBoundaries.length - 1] = oLegend.max;
		} else {
			aPalettes.splice(aPalettes.length - 1, 1);
			aBoundaries.splice(aBoundaries.length - 1, 1);
		}
		
		if (aPalettes.length <= 1) {
			//cvom does not natively support one segment case in mbc legend
			return null;
		}

		return {
			feed: "color",
			palette: aPalettes,
			numOfSegments: aPalettes.length,
			legendValues: aBoundaries
		};
	}

	function getLegendProps(aCandidateSettings) {
		var oLegendProps;
		if (aCandidateSettings.legendTitle) {
			oLegendProps = {
				title: {
					text: aCandidateSettings.legendTitle,
					visible: true
				}
			};
		} else {
			oLegendProps = {
				title: {
					text: null,
					visible: false
				}
			};
		}
		return oLegendProps;
	}

	function getRuleGenerator(aCandidateSettings, aLegendOrder) {
		return function() {
			var colorScale, properties;
			if (aCandidateSettings.bMBC) {
				colorScale = createScales(aCandidateSettings);
			} else {
				var rules = createRules(aCandidateSettings, aLegendOrder);
				properties = {
					plotArea: {
						dataPointStyle: {
							rules: rules
						}
					},
					legend: getLegendProps(aCandidateSettings)
				};
			}
			return {
				colorScale: colorScale,
				properties: properties
			};
		};
	}

	return {
		getCandidateSetting: function(oColorings, oActiveColoring, aMsr, aDim, aInResultDims, oStatus, options, oLocale) {
			var bMBC = options.bMBC;
			var oCriticality = oColorings.Criticality || {};
			var sUseType = use(oCriticality, oActiveColoring);
			var oCandidateSetting = {
				additionalMeasures: [],
				additionalDimensions: []
			};
			var aQualifiedSettings, oParsed, sCriticalityMethod;

			switch (sUseType) {
				case 'DimensionValues':
					aQualifiedSettings = DimensionValues.qualify(oCriticality.DimensionValues, aMsr, aDim, aInResultDims, oActiveColoring, "Criticality", options);
					if (aQualifiedSettings) {
						aQualifiedSettings.parsed = DimensionValues.parse(aQualifiedSettings, aDim, oStatus, oLocale, options);
						oCandidateSetting.contextHandler = DimensionValues.getContextHandler(aQualifiedSettings, oLocale);
						oCandidateSetting.ruleGenerator = getRuleGenerator([aQualifiedSettings], aDimensionLegendOrder);
					}
					break;
				case 'MeasureValues':
					aQualifiedSettings = MeasureValues.qualify(oCriticality.MeasureValues, aMsr, aDim, oStatus, oActiveColoring, options);
					if (aQualifiedSettings.sMethod) {
						jQuery.each(aQualifiedSettings, function(i, oQualified) {
							oParsed = MeasureValues.parse(oQualified, aMsr, aDim, aInResultDims, oStatus, options, oLocale);
							jQuery.each(oParsed.additionalMeasures, function(i, sThresholdMsrName) {
								oCandidateSetting.additionalMeasures[sThresholdMsrName] = true;
							});
							jQuery.each(oParsed.additionalDimensions, function(i, sCalculatedName) {
								oCandidateSetting.additionalDimensions[sCalculatedName] = true;
							});
							oQualified.parsed = oParsed;
							if (oQualified.settings.Legend && oQualified.settings.Legend.Title) {
								aQualifiedSettings.legendTitle = oQualified.settings.Legend.Title;
							}
						});
						sCriticalityMethod = aQualifiedSettings.sMethod;
						oCandidateSetting.additionalMeasures = Object.keys(oCandidateSetting.additionalMeasures);
						oCandidateSetting.additionalDimensions = Object.keys(oCandidateSetting.additionalDimensions);
						oCandidateSetting.contextHandler = MeasureValues.getContextHandler(sCriticalityMethod, aQualifiedSettings, bMBC, oLocale);
						oCandidateSetting.ruleGenerator = getRuleGenerator(aQualifiedSettings, aMeasureLegendOrder);
						aQualifiedSettings.bMBC = bMBC;
					}
					break;
				default:
					return {};
			}

			return oCandidateSetting;
		}
	};
});
