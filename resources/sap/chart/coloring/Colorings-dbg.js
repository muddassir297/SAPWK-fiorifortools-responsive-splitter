/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	"sap/chart/coloring/criticality/Criticality",
	"sap/chart/coloring/emphasis/Emphasis",
	'sap/chart/ChartLog'
], function(
	Criticality,
	Emphasis,
	ChartLog
) {
	"use strict";

	var SUPPORTED_TYPES = ['Criticality', 'Emphasis'];
	function use(oColorings, oActiveColoring) {
		var use = null;
		var sColoring = oActiveColoring ? oActiveColoring.coloring : null;
		var oParams = oActiveColoring ? oActiveColoring.parameters : null;

		if (oParams && oParams.dimension && oParams.measure) {
			//clid1
			throw new ChartLog('error', 'activeColoring', "Either \"dimension\" or \"measure\" can be set in activeColoring.parameters, but not both of them");
		}

		if (SUPPORTED_TYPES.indexOf(sColoring) > -1) {
			use = sColoring;
		}

		return use;
	}

	return {
		getCandidateSetting: function(oColorings, oActiveColoring, aMsrs, aDims, aInResultDims, oStatus, sChartType, oLocale) {
			var useColoringType = use(oColorings, oActiveColoring);
			var coloringClz, options = {};
			options.bMBC = (sChartType === "heatmap") ? true : false;
			options.bShowUnmentionedMsr = (sChartType === "scatter" || sChartType === "bubble") ? false : true;
			options.bIsPie = (sChartType === "pie" || sChartType === "donut") ? true : false;
			options.chartType = sChartType;
			switch (useColoringType) {
				case 'Criticality':
					coloringClz = Criticality;
					break;
				case 'Emphasis':
					coloringClz = Emphasis;
					break;
				default:
					coloringClz = null;
					break;
			}
			if (coloringClz) {
				return coloringClz.getCandidateSetting(oColorings, oActiveColoring, aMsrs, aDims, aInResultDims, oStatus, options, oLocale);
			} else {
				return {};
			}
		}
	};
});