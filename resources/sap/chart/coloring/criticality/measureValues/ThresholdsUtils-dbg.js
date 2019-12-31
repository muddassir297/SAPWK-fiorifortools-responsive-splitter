sap.ui.define([
	'sap/chart/coloring/ColoringUtils',
	'sap/chart/library'
], function(
	ColoringUtils,
	chartLibrary
) {
	"use strict";
	var Thresholds = {};

	var Msr = {
		formulas: {}
	};

	var NEGATIVE = chartLibrary.coloring.CriticalityType.Negative;
	var CRITICAL = chartLibrary.coloring.CriticalityType.Critical;
	var POSITIVE = chartLibrary.coloring.CriticalityType.Positive;

	function genSegment(iUpperBound, sCriticalityType, iLvl) {
		return {
			upperBound: iUpperBound,
			CriticalityType: sCriticalityType,
			level: iLvl
		};
	}

	Thresholds.MBCimprovement = function(sDir, oTolRange, oDevRange) {
		var aSegments = [];
		var aBoundaryOrder, aCriticalityOrder;
		switch (sDir) {
			case 'maximize':
				aBoundaryOrder = [oDevRange.lo, oTolRange.lo, Number.POSITIVE_INFINITY];
				aCriticalityOrder = [NEGATIVE, CRITICAL, POSITIVE];
				break;
			case 'minimize':
				aBoundaryOrder = [oTolRange.hi, oDevRange.hi, Number.POSITIVE_INFINITY];
				aCriticalityOrder = [POSITIVE, CRITICAL, NEGATIVE];
				break;
			case 'target':
				aBoundaryOrder = [oDevRange.lo, oTolRange.lo, oTolRange.hi, oDevRange.hi, Number.POSITIVE_INFINITY];
				aCriticalityOrder = [NEGATIVE, CRITICAL, POSITIVE, CRITICAL, NEGATIVE];
				break;
			default:
		}
		aSegments = aCriticalityOrder.map(function(sCriticalityType, index) {
			return genSegment(aBoundaryOrder[index], sCriticalityType, 0);
		});
		return {
			segments: aSegments,
			min: Number.POSITIVE_INFINITY,
			max: Number.NEGATIVE_INFINITY
		};
	};

	Thresholds.improvement = function(sDir, sMsr, oTolRange, oDevRange, oBreakdown) {
		var devLoFn = ColoringUtils.thresholdValue(oDevRange.lo);
		var tolLoFn = ColoringUtils.thresholdValue(oTolRange.lo);
		var devHiFn = ColoringUtils.thresholdValue(oDevRange.hi);
		var tolHiFn = ColoringUtils.thresholdValue(oTolRange.hi);

		var nNeg = ColoringUtils.assertLevel(oBreakdown, 'NegativeLevels');
		var nCrt = ColoringUtils.assertLevel(oBreakdown, 'CriticalLevels');
		var nPos = ColoringUtils.assertLevel(oBreakdown, 'PositiveLevels');
		var minFn = ColoringUtils.thresholdValue(oBreakdown.MinimumMeasureValue);
		var maxFn = ColoringUtils.thresholdValue(oBreakdown.MaximumMeasureValue);

		switch (sDir) {
			case 'maximize':
				return {
					Negative: ColoringUtils.genLevels(nNeg, Msr.formulas.maximize.negative(sMsr, nNeg, minFn, devLoFn)),
					Critical: ColoringUtils.genLevels(nCrt, Msr.formulas.maximize.critical(sMsr, nCrt, devLoFn, tolLoFn)),
					Positive: ColoringUtils.genLevels(nPos, Msr.formulas.maximize.positive(sMsr, nPos, tolLoFn, maxFn))
				};
			case 'minimize':
				return {
					Negative: ColoringUtils.genLevels(nNeg, Msr.formulas.minimize.negative(sMsr, nNeg, devHiFn, maxFn)),
					Critical: ColoringUtils.genLevels(nCrt, Msr.formulas.minimize.critical(sMsr, nCrt, tolHiFn, devHiFn)),
					Positive: ColoringUtils.genLevels(nPos, Msr.formulas.minimize.positive(sMsr, nPos, minFn, tolHiFn))
				};
			case 'target':
				return {
					Negative: ColoringUtils.genLevels(nNeg, Msr.formulas.target.negative(sMsr, nNeg, devLoFn, devHiFn, minFn, maxFn)),
					Critical: ColoringUtils.genLevels(nCrt, Msr.formulas.target.critical(sMsr, nCrt, devLoFn, tolLoFn, tolHiFn, devHiFn)),
					Positive: ColoringUtils.genLevels(nPos, Msr.formulas.target.positive(sMsr, nPos, tolLoFn, tolHiFn))
				};
			default:
				throw new Error('Unsupported ImprovementDirection: ' + sDir);
		}
	};

	Msr.formulas.maximize = {
		negative: function(sMsrName, nLvl, fnMin, fnDevLo) {
			return function(oCtx) {
				var nVal = oCtx[sMsrName];
				var nMin = fnMin(oCtx);
				var nHi = fnDevLo(oCtx);
				if (!ColoringUtils.isInRange(nVal, Number.NEGATIVE_INFINITY, nHi, null, false)) {
					return -1;
				} else if (!ColoringUtils.isNumber(nLvl, nMin) || nLvl <= 1) {
					return 1;
				} else if (nVal < nMin) {
					return nLvl;
				} else {
					return (nLvl - 1) - Math.floor((nLvl - 1) * (nVal - nMin) / (nHi - nMin));
				}
			};
		},
		critical: function(sMsrName, nLvl, fnDevLo, fnTolLo) {
			return function(oCtx) {
				var nVal = oCtx[sMsrName];
				var nLo = fnDevLo(oCtx);
				var nHi = fnTolLo(oCtx);

				if (!ColoringUtils.isInRange(nVal, nLo, nHi, true, false)) {
					return -1;
				} else if (!ColoringUtils.isNumber(nLvl) || nLvl <= 1) {
					return 1;
				} else {
					return nLvl - Math.floor(nLvl * (nVal - nLo) / (nHi - nLo));
				}
			};
		},
		positive: function(sMsrName, nLvl, fnTolLo, fnMax) {
			return function(oCtx) {
				var nVal = oCtx[sMsrName];
				var nMax = fnMax(oCtx);
				var nLo = fnTolLo(oCtx);
				if (!ColoringUtils.isInRange(nVal, nLo, Number.POSITIVE_INFINITY, true)) {
					return -1;
				} else if (!ColoringUtils.isNumber(nLvl, nMax) || nLvl <= 1) {
					return 1;
				} else if (nVal >= nMax) {
					return nLvl;
				} else {
					return Math.floor((nLvl - 1) * (nVal - nLo) / (nMax - nLo)) + 1;
				}
			};
		}
	};

	Msr.formulas.minimize = {
		negative: function(sMsrName, nLvl, fnDevHi, fnMax) {
			return function(oCtx) {
				var nVal = oCtx[sMsrName];
				var nMax = fnMax(oCtx);
				var nLo = fnDevHi(oCtx);

				if (!ColoringUtils.isInRange(nVal, nLo, Number.POSITIVE_INFINITY, false)) {
					return -1;
				} else if (!ColoringUtils.isNumber(nLvl, nMax) || nLvl <= 1) {
					return 1;
				} else if (nVal > nMax) {
					return nLvl;
				} else {
					return Math.floor((nLvl - 1) * (nVal - nLo) / (nMax - nLo)) + 1;
				}
			};
		},
		critical: function(sMsrName, nLvl, fnTolHi, fnDevHi) {
			return function(oCtx) {
				var nVal = oCtx[sMsrName];
				var nLo = fnTolHi(oCtx);
				var nHi = fnDevHi(oCtx);
				if (!ColoringUtils.isInRange(nVal, nLo, nHi, false, true)) {
					return -1;
				} else if (!ColoringUtils.isNumber(nLvl) || nLvl <= 1) {
					return 1;
				} else {
					return Math.floor(nLvl * (nVal - nLo) / (nHi - nLo)) + 1;
				}
			};
		},
		positive: function(sMsrName, nLvl, fnMin, fnTolHi) {
			return function(oCtx) {
				var nVal = oCtx[sMsrName];
				var nMin = fnMin(oCtx);
				var nHi = fnTolHi(oCtx);

				if (!ColoringUtils.isInRange(nVal, Number.NEGATIVE_INFINITY, nHi, null, true)) {
					return -1;
				} else if (!ColoringUtils.isNumber(nLvl, nMin) || nLvl <= 1) {
					return 1;
				} else if (nVal < nMin) {
					return nLvl;
				} else {
					return (nLvl - 1) - Math.floor((nLvl - 1) * (nVal - nMin) / (nHi - nMin));
				}
			};
		}
	};

	Msr.formulas.target = {
		negative: function(sMsrName, nLvl, fnDevLo, fnDevHi, fnMin, fnMax) {
			return function(oCtx) {
				var nVal = oCtx[sMsrName];
				var nLeftHi = fnDevLo(oCtx);
				var nRightLo = fnDevHi(oCtx);
				var nMin = fnMin(oCtx);
				var nMax = fnMax(oCtx);

				var inLeft = ColoringUtils.isInRange(nVal, Number.NEGATIVE_INFINITY, nLeftHi, null, false);
				var inRight = ColoringUtils.isInRange(nVal, nRightLo, Number.POSITIVE_INFINITY, false);

				if (!inLeft && !inRight) {
					return -1;
				} else if (!ColoringUtils.isNumber(nLvl) || nLvl <= 1) {
					return 1;
				} else if (inLeft) {
					if (nVal < nMin) {
						return nLvl;
					} else {
						return nLvl - (Math.floor((nVal - nMin) / ((nLeftHi - nMin) / (nLvl - 1))) + 1);
					}
				} else {
					if (nVal >= nMax) {
						return nLvl;
					} else {
						return nLvl - (Math.floor((nMax - nVal) / ((nMax - nRightLo) / (nLvl - 1))) + 1);
					}
				}
			};
		},
		critical: function(sMsrName, nLvl, fnDevLo, fnTolLo, fnTolHi, fnDevHi) {
			return function(oCtx) {
				var nVal = oCtx[sMsrName];
				var nLeftLo = fnDevLo(oCtx),
					nLeftHi = fnTolLo(oCtx);
				var nRightLo = fnTolHi(oCtx),
					nRightHi = fnDevHi(oCtx);

				var inLeft = ColoringUtils.isInRange(nVal, nLeftLo, nLeftHi, true, false);
				var inRight = ColoringUtils.isInRange(nVal, nRightLo, nRightHi, false, true);

				if (!inLeft && !inRight) {
					return -1;
				} else if (!ColoringUtils.isNumber(nLvl) || nLvl <= 1) {
					return 1;
				} else if (inLeft) {
					return nLvl - Math.floor((nVal - nLeftLo) / ((nLeftHi - nLeftLo) / nLvl));
				} else {
					return Math.floor((nRightHi - nVal) / ((nRightHi - nRightLo) / nLvl)) + 1;
				}
			};
		},
		positive: function(sMsrName, nLvl, fnTolLo, fnTolHi) {
			return function(oCtx) {
				var nVal = oCtx[sMsrName];
				var nLo = fnTolLo(oCtx);
				var nHi = fnTolHi(oCtx);

				if (!ColoringUtils.isInRange(nVal, nLo, nHi, true, true)) {
					return -1;
				} else if (!ColoringUtils.isNumber(nLvl) || nLvl <= 1) {
					return 1;
				} else {
					return Math.min(nLvl, nLvl + 1 - Math.ceil(Math.abs(nVal - (nLo + (nHi - nLo) / 2)) / ((nHi - nLo) / (2 * nLvl))));
				}
			};
		}
	};

	return Thresholds;
});