sap.ui.define([
	'sap/chart/coloring/ColoringUtils',
	'sap/chart/coloring/criticality/DimensionValues',
	'sap/chart/ChartLog'
], function(
	ColoringUtils,
	DimensionValues,
	ChartLog
) {
	"use strict";
	var type = jQuery.type;
	
	var Dim = {};
	Dim.qualify = function(oConfig, aMsr, aDim, aInResultDims, oActiveColoring, options) {
		return DimensionValues.qualify(oConfig, aMsr, aDim, aInResultDims, oActiveColoring, "Emphasis", options);
	};

	Dim.parse = function(oConfig, oLocale) {
		var oLegend = {};
		var sDimName = oConfig.dim;
		var oDimConfig = oConfig.setting[sDimName];

		var values = oDimConfig.Values;
		var aHighlightedValues = (type(values) === "array") ? values : [values];
		var fnHightlightCb = function (oCtx) {
			return aHighlightedValues.indexOf(oCtx[sDimName]) > -1;
		};

		if (aHighlightedValues.length > 1 && !(oDimConfig.Legend && oDimConfig.Legend.Highlighted)) {
			//clid19
			throw new ChartLog('error', 'Colorings.Emphasis.DimensionValues', 'Legend.Highlighted is mandatory when Highlight has multiple values');
		} else {
			if (oDimConfig.Legend && oDimConfig.Legend.Highlighted != null) {
				oLegend.Highlight = oDimConfig.Legend.Highlighted;
			} else {
				oLegend.Highlight = aHighlightedValues[0];
			}
		}
		if (oDimConfig.Legend && oDimConfig.Legend.Others) {
			oLegend.Others = oDimConfig.Legend.Others;
		} else {
			oLegend.Others = oLocale.getText("COLORING_TYPE_OTHER");
		}

		var mCallbacks = {
			Highlight: fnHightlightCb
		};

		return {
			callbacks: mCallbacks,
			legend: oLegend
		};
	};

	return Dim;
});
