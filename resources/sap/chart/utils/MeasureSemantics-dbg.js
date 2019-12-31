/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([], function() {
	"use strict";
	
	var COLOR_PALETTE = ['sapUiChartPaletteQualitativeHue1',
						 'sapUiChartPaletteQualitativeHue2',
						 'sapUiChartPaletteQualitativeHue3',
						 'sapUiChartPaletteQualitativeHue4',
						 'sapUiChartPaletteQualitativeHue5',
						 'sapUiChartPaletteQualitativeHue6',
						 'sapUiChartPaletteQualitativeHue7',
						 'sapUiChartPaletteQualitativeHue8',
						 'sapUiChartPaletteQualitativeHue9',
						 'sapUiChartPaletteQualitativeHue10',
						 'sapUiChartPaletteQualitativeHue11'
					 ],
		DUAL_COLOR_PALETTE = [['sapUiChartPaletteSequentialHue1',
                    'sapUiChartPaletteSequentialHue1Light2',
                    'sapUiChartPaletteSequentialHue1Dark1'
                ],
                ['sapUiChartPaletteSequentialHue2',
                    'sapUiChartPaletteSequentialHue2Light2',
                    'sapUiChartPaletteSequentialHue2Dark1'
                ]],
		SINGLE_TARGET_COLOR = 'sapUiChartPaletteSequentialNeutralDark2',
		LINE_TYPE = {
			actual : 'solid',
			projected : 'dash',
			reference : 'dot'
		}, 
		PATTERN = {
			projected : 'diagonalLightStripe',
			reference : 'noFill'
		};

	function rel(oMsr) {
		var oResult = {};
		if (oMsr.getSemanticallyRelatedMeasures) {
			var oRel = oMsr.getSemanticallyRelatedMeasures();
			if (oRel) {
				if (oRel.projectedValueMeasure) {
					oResult.projected = oRel.projectedValueMeasure;
				}
				if (oRel.referenceValueMeasure) {
					oResult.reference = oRel.referenceValueMeasure;
				}
				return oResult;
			}
		}

		return oResult;
	}

	function calc(aMsrs) {
		var mComputed = aMsrs.reduce(function(mComputed, oMsr) {
			mComputed[oMsr.getName()] = {
				msr: oMsr,
				sem: (oMsr.getSemantics && oMsr.getSemantics()) || "actual",
				rel: rel(oMsr)
			};
			return mComputed;
		}, {});

		// remove mis matched (semantics, relation semantics) from each semantic
		// relation
		jQuery.each(mComputed, function(sMsr, oCfg) {
			if (oCfg.sem === "actual") {
				jQuery.each(oCfg.rel, function(sSem, sTargetMsr) {
					if (mComputed[sTargetMsr] && mComputed[sTargetMsr].sem !== sSem) {
						delete oCfg.rel[sSem];
					} else {
						jQuery.sap.log.warning("Analytical Chart", "Related measures don't match its semantic role.");
					}
				});
			}
		});

		return mComputed;
	}

	function makeTuples(aMsrs, mSems) {
		var aTuples = [], index = 0;

		jQuery.each(aMsrs.slice().sort(function(a, b) {
			var semA = mSems[a.getName()].sem,
				semB = mSems[b.getName()].sem;
			if (semA < semB) {
				return -1;
			} else if (semA > semB) {
				return 1;
			} else {
				return aMsrs.indexOf(a) - aMsrs.indexOf(b);
			}
		}), function(idx, oMsr) {
			var sName = oMsr.getName();
			if (!mSems[sName]) {
				return;
			}

			var oSemCfg = mSems[sName];
			var oTuple = {};
			var sLabel;

			oTuple[oSemCfg.sem] = sName;
			if (oMsr.getLabel) {
				sLabel = oMsr.getLabel();
				if (sLabel) {
					oTuple.labels = {};
					oTuple.labels[oSemCfg.sem] = sLabel;
				}
			}
			oTuple.index = index++;

			if (oSemCfg.sem === "actual") {
				if (oSemCfg.rel.projected && mSems[oSemCfg.rel.projected]) {
					oTuple.projected = oSemCfg.rel.projected;
					//Keep labels
					if (mSems[oSemCfg.rel.projected].msr.getLabel) {
						sLabel = mSems[oSemCfg.rel.projected].msr.getLabel();
						if (sLabel) {
							oTuple.labels = jQuery.extend(true, oTuple.labels, {
								projected: sLabel
							});
						}
					}
					delete mSems[oSemCfg.rel.projected];
				}
				if (oSemCfg.rel.reference && mSems[oSemCfg.rel.reference]) {
					oTuple.reference = oSemCfg.rel.reference;
					if (mSems[oSemCfg.rel.reference].msr.getLabel) {
						sLabel = mSems[oSemCfg.rel.reference].msr.getLabel();
						if (sLabel) {
							oTuple.labels = jQuery.extend(true, oTuple.labels, {
								reference: sLabel
							});
						}
					}
					delete mSems[oSemCfg.rel.reference];
				}
				delete mSems[sName];
			}

			aTuples.push(oTuple);

		});

		return aTuples;
	}
	
	var getSemanticVizProperties = function(chartType, semanticTuples){
		var semanticProps = {
			dataPointStyle : null,
			seriesStyle : null
		};
		if (semanticTuples) {
			var hasProjectedValueStartTime = semanticTuples.some(function(tuple){
				return tuple.projectedValueStartTime;
			}),
			hasSingleReference = (semanticTuples.filter(function(tuple){
				return tuple.reference;
			}).length === 1);

			var addDataPointStyleRules = function(rule){
				if (!semanticProps.dataPointStyle) {
					semanticProps = jQuery.extend(true, semanticProps, {
						"dataPointStyle": {
							"rules": [],
							others : null
						}
					});
				}
				semanticProps.dataPointStyle.rules.push(rule);
			};
			var addSeriesStyleRules = function(rule){
				if (!semanticProps.seriesStyle) {
					semanticProps = jQuery.extend(true, semanticProps, {
						"seriesStyle": {
							"rules": []
						}
					});
				}
				semanticProps.seriesStyle.rules.push(rule);
			};

			var getSemanticColors = function(index, valueAxisID){
				var length, colorPalette;
				if (chartType.indexOf('dual') === -1) {	
					colorPalette = COLOR_PALETTE;
					length = COLOR_PALETTE.length;
				} else {
					var axisIndex = (valueAxisID === 'valueAxis') ? 0 : 1;
					colorPalette = DUAL_COLOR_PALETTE[axisIndex];
					length = colorPalette.length;
				}
				return {
					actual : colorPalette[ index % length],
					projected : colorPalette[ index % length],
					reference : colorPalette[ index % length]
				};
			};
			
			var tuple, rule, colors, color, dataName, forecastCallbackFunc = function(timeAxis, projectedValueStartTime, semanticMsrName){
				return function(ctx){
					return (ctx.measureNames === semanticMsrName) && (new Date(ctx[timeAxis]).getTime() >= projectedValueStartTime);
				};
			},actualCallbackFunc = function(timeAxis, projectedValueStartTime, semanticMsrName){
				return function(ctx){
					return (ctx.measureNames === semanticMsrName) && (new Date(ctx[timeAxis]).getTime() < projectedValueStartTime);
				};
			}, tuplesLength = semanticTuples.length, key, sLabel;
			for (var i = 0; i < tuplesLength; i++) {
				tuple = semanticTuples[i];
				colors = getSemanticColors(tuple.index, tuple.valueAxisID);
				if (hasProjectedValueStartTime) {
					//With continues semantic pattern. Use dataPointStyle.
					if (tuple.projectedValueStartTime && tuple.timeAxis) {
						// Use dataPointStyle to draw continues semantic
						//Time Dual isn't supported. 
						dataName = {};
						sLabel = (tuple.labels && tuple.labels.actual) ? tuple.labels.actual : tuple.actual;
						dataName[tuple.semanticMsrName] = sLabel;
						addDataPointStyleRules({
							"callback" : actualCallbackFunc(tuple.timeAxis, tuple.projectedValueStartTime, tuple.semanticMsrName),
							"properties" : {
								"lineType" : LINE_TYPE.actual,
								"color" : colors.actual,
								"lineColor" : colors.actual
							},
							"displayName" : sLabel,
							"dataName" : dataName
						});
						dataName = {};
						sLabel = (tuple.labels && tuple.labels.projected) ? tuple.labels.projected : tuple.projected;
						dataName[tuple.semanticMsrName] = sLabel;
						addDataPointStyleRules({
							"callback" : forecastCallbackFunc(tuple.timeAxis, tuple.projectedValueStartTime, tuple.semanticMsrName),
							"properties" : {
								"lineType" : LINE_TYPE.projected,
								"pattern" : PATTERN.projected,
								"color" : colors.projected,
								"lineColor" : colors.projected
							},
							"displayName" : sLabel,
							"dataName" : dataName
						});
						if (tuple.reference) {
							rule = {};
							rule[tuple.reference] = '*';
							color = hasSingleReference ? SINGLE_TARGET_COLOR : colors.reference;
							sLabel = (tuple.labels && tuple.labels.reference) ? tuple.labels.reference : tuple.reference;
							addDataPointStyleRules({
								"dataContext" : [rule],
								"properties" : {
									"lineType" : LINE_TYPE.reference,
									"color" : color,
									"lineColor" : color,
									"pattern" : PATTERN.reference
								},
								"displayName" : sLabel
							});
						}
					} else {
						//Series without semantic relation in continue series chart.
						//Draw its normal style accroding with UX design.
						for (key in tuple) {
							if (tuple.hasOwnProperty(key) && key !== 'valueAxisID' && key !== 'index') {
								rule = {};
								rule[tuple[key]] = '*';
								sLabel = (tuple.labels && tuple.labels[key]) ? tuple.labels[key] : tuple[key];

								color = (hasSingleReference && key === 'reference') ? SINGLE_TARGET_COLOR : colors[key];
								
								addDataPointStyleRules({
									"dataContext" : [rule],
									"properties" : {
										"lineType" : LINE_TYPE[key],
										"color" : color,
										"lineColor" : color,
										"pattern" : PATTERN[key]
									},
									"displayName" : sLabel
								});
							}
						}
					}
				} else if (chartType && chartType.indexOf('bullet') === -1) {
					for (key in tuple) {
						if (tuple.hasOwnProperty(key) && key !== 'valueAxisID' && key !== 'index') {
							rule = {};
							rule[tuple[key]] = '*';

							color = ( hasSingleReference && key === 'reference' ) ? SINGLE_TARGET_COLOR : colors[key];

							addSeriesStyleRules({
								"dataContext" : [rule],
								"properties" : {
									"dataPoint": {
										"color" : color,
										"pattern" : PATTERN[key]
									}, 
									"line":{
										"type": LINE_TYPE[key],
										"color" : color
									}
								},
								"displayName" : tuple[key]
							});
						}
					}
				}			
			}
		}
		return {
			"plotArea" : semanticProps
		};
	};

	return {
		getTuples: function(aMsrs) {
			return makeTuples(aMsrs, calc(aMsrs));
		},
		getSemanticVizProperties : getSemanticVizProperties
	};
});
