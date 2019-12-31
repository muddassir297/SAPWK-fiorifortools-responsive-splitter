/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/chart/data/TimeDimension',
	'sap/chart/utils/MeasureSemantics',
	'sap/chart/utils/ChartUtils',
	'sap/chart/utils/DateFormatUtil'
], function(
	TimeDimension,
	MeasureSemantics,
	ChartUtils,
	DateFormatUtil
) {
	"use strict";

	function RoleMapper(sFeedingId) {
		this._bTimeFed = false;
	}

	RoleMapper.prototype.toFeedingId = function(oDim) {
		if (oDim instanceof TimeDimension && !this._bTimeFed) {
			this._bTimeFed = true;
			return "timeAxis";
		} else {
			return "@context";
		}
	};

	function trimRight(aArray) {
		while (aArray.length && !aArray[aArray.length - 1]) {
			aArray.pop();
		}
		return aArray;
	}

	function isTimeChart(chartType) {
		return ChartUtils.CONFIG.timeChartTypes.indexOf(chartType) > -1;
	}

	function isDualChart(chartType){
		return chartType.indexOf('dual') > -1;
	}

	RoleMapper.semantics = {
		semanticBulletMsrs: function(oMsrFeeds, isTimeChart) {
			var aMsrs = oMsrFeeds["@semanticBulletMsrs"];
			var mMsrs = aMsrs.reduce(function(mMsrs, oMsr) {
				mMsrs[oMsr.getName()] = oMsr;
				return mMsrs;
			}, {});
			var aSemanticTuples = MeasureSemantics.getTuples(aMsrs);

			var oSemFeeds = {
				actualValues: [],
				additionalValues: [],
				targetValues: []
			};

			jQuery.each(aSemanticTuples, function(idx, oTuple) {
				oSemFeeds.actualValues.push(oTuple.actual ? mMsrs[oTuple.actual] : null);
				oSemFeeds.additionalValues.push(oTuple.projected ? mMsrs[oTuple.projected] : null);
				oSemFeeds.targetValues.push(oTuple.reference ? mMsrs[oTuple.reference] : null);
			});

			Object.keys(oSemFeeds).forEach(function(key) {
				oSemFeeds[key] = trimRight(oSemFeeds[key]);
			});

			delete oMsrFeeds["@semanticBulletMsrs"];

			jQuery.extend(oMsrFeeds, oSemFeeds);
		},
		semanticPatternMsrs : function(oFeeds, chartType){
			var aAllSemanticTuples = [], aAllSemanticContext = [];

			Object.keys(oFeeds.msrs).forEach(function(key){
				var aSemanticContext = [];
				var aMsrs = oFeeds.msrs[key];
				var mMsrs = aMsrs.reduce(function(mMsrs, oMsr) {
					mMsrs[oMsr.getName()] = oMsr;
					return mMsrs;
				}, {});
				var aSemanticTuples = MeasureSemantics.getTuples(aMsrs);
				var hasSemanticRules = aSemanticTuples.filter(function(tuple){
						return tuple.actual && !tuple.projected && !tuple.reference;
					}).length !== aMsrs.length;
				if (oFeeds.dims.color && oFeeds.dims.color.length > 0) {
					jQuery.sap.log.warning("If Chart has series dimensions, semantic pattern rule doesn't work.");
				} else if (hasSemanticRules) {
					if (chartType && isDualChart(chartType)) {
						aSemanticTuples.forEach(function(value){
							value.valueAxisID = key;
						});
					}
					aAllSemanticTuples = aAllSemanticTuples.concat(aSemanticTuples);
					
					if (isTimeChart(chartType)) {
						//No color feeds and time axis's max size is 1
						if (oFeeds.dims.timeAxis && oFeeds.dims.timeAxis.length === 1) {
							var timeAxis = oFeeds.dims.timeAxis[0];
							var tuple;
							
							var projectedValueStartTime = timeAxis.getProjectedValueStartTime();
							if (projectedValueStartTime) {
								//Format startTime value according with timeUnit setting	
								var startTime, oDateInstance = DateFormatUtil.getInstance(timeAxis.getTimeUnit());
								if (oDateInstance) {
									if (oDateInstance.parse(projectedValueStartTime)) {
										startTime = oDateInstance.parse(projectedValueStartTime).getTime();
									}
								} else {
									startTime = new Date(projectedValueStartTime).getTime();
								}
								if (startTime) {
									if (chartType.indexOf('bullet') === -1) {
										for (var i = 0; i < aSemanticTuples.length; i++) {
											tuple = aSemanticTuples[i];
											if (tuple.actual && tuple.projected) {
												tuple.timeAxis = oFeeds.dims.timeAxis[0].getName();
												tuple.projectedValueStartTime = startTime;
												tuple.semanticMsrName = tuple.actual + "-" + tuple.projected;
												aSemanticContext.push(tuple.actual);
												aSemanticContext.push(tuple.projected);
												aMsrs.push(mMsrs[tuple.actual].clone().setName(tuple.semanticMsrName));
											}
										}
									} 
									oFeeds.msrs[key] = aMsrs.filter(function(oMsr){
										return aSemanticContext.indexOf(oMsr.getName()) === -1;
									});
									
									aAllSemanticContext = aAllSemanticContext.concat(aMsrs.filter(function(oMsr){
										return aSemanticContext.indexOf(oMsr.getName()) > -1;
									}));
								}
							}
						}
					}
					var aSemanticTuplesList = [];
					var aMsrOrder = ['actual', 'projected', 'semanticMsrName', 'reference'];

					aSemanticTuples.forEach(function(elem){
						for (var i = 0; i < aMsrOrder.length; i++) {
							if (elem[aMsrOrder[i]]) {
								aSemanticTuplesList.push(elem[aMsrOrder[i]]);	
							}
						}
					});
					oFeeds.msrs[key].sort(function(a, b){
					    return aSemanticTuplesList.indexOf(a.getName()) - aSemanticTuplesList.indexOf(b.getName());
				    });
				}
			});
			
			return {
				semanticTuples : aAllSemanticTuples,
				contexts: aAllSemanticContext
			};
		}
	};

	return RoleMapper;
});
