/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/chart/coloring/emphasis/DimensionValues',
	'sap/chart/coloring/ColorPalette',
	'sap/chart/ChartLog'
], function(
	DimensionValues,
	ColorPalette,
	ChartLog
) {
	"use strict";
	var SUPPORTED_TYPES = ['DimensionValues', 'MeasureValues'];

	function use(oColorings, oActiveCriticalityColoring) {
		var oParams = oActiveCriticalityColoring ? oActiveCriticalityColoring.parameters : {};
		var types = Object.keys(oColorings).filter(function(sType) {
			return !SUPPORTED_TYPES.indexOf(sType) !== -1;
		});

		if (oParams && oParams.dimension && oParams.measure) {
			//clid3
			throw new ChartLog('error', 'colorings.Emphasis', 'Both "DimensionValues" and "MeasureValues" present in coloring EMPHASIS, activeColoring.parameters is required to specify which to use');
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
		var oCandidateSetting = aCandidateSettings[0];
		var aCbs = oCandidateSetting.parsed.callbacks.Highlight || [];
		var oLegend = oCandidateSetting.parsed.legend;
		var aRules = [];
		aRules.push({
			callback: aCbs,
			properties: {
				color: ColorPalette.EMPHASIS.Highlight
			},
			displayName: oLegend.Highlight
		});

		var oOthers = {
			properties: {
				color: ColorPalette.EMPHASIS.Others
			},
			displayName: oLegend.Others
		};

		return {
			rules: aRules,
			others: oOthers
		};
	}

	function getRuleGenerator(aCandidateSettings, aLegendOrder) {
		return function() {
			var props = {
				plotArea: {
					dataPointStyle: createRules(aCandidateSettings)
				}
			};
			return {
				properties: props
			};
		};
	}

	return {
		getCandidateSetting: function(oColorings, oActiveColoring, aMsr, aDim, aInResultDims, oStatus, options, oLocale) {
			var oEmphasis = oColorings.Emphasis || {};
			var sUseType = use(oEmphasis, oActiveColoring);
			var aQualifiedSettings;

			switch (sUseType) {
				case 'DimensionValues':
					aQualifiedSettings = DimensionValues.qualify(oEmphasis.DimensionValues, aMsr, aDim, aInResultDims, oActiveColoring, options);
					if (aQualifiedSettings) {
						aQualifiedSettings.parsed = DimensionValues.parse(aQualifiedSettings, oLocale);
						aQualifiedSettings.ruleGenerator = getRuleGenerator([aQualifiedSettings]);
					}
					break;
				default:
					return {};
			}

			return aQualifiedSettings;
		}
	};
});
