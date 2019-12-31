sap.ui.define([], function(
) {
	"use strict";
	var type = jQuery.type;

	var Util = {};
	Util.find = function(sMsrName, aList) {
		for (var i = 0; i < aList.length; i++) {
			if (sMsrName === aList[i].getName()) {
				return aList[i];
			}
		}
		return null;
	};

	Util.isNumber = function() {
		for (var i = 0; i < arguments.length; i++) {
			if (type(arguments[i]) !== 'number') {
				return false;
			}
		}
		return true;
	};

	Util.assertLevel = function(oBreakdown, sLevelType) {
		var iLevel = oBreakdown[sLevelType];
		if (iLevel === null || iLevel === undefined) {
			return 1;
		} else if ([1, 2, 3, 4, 5, 6].indexOf(iLevel) !== -1) {
			return iLevel;
		} else {
			throw new Error("Colorings.Criticality.<MeasureName>.Breakdown." + sLevelType + " must be an integer from 1 to 6, received " + iLevel);
		}
	};

	Util.thresholdValue = function(oThreshold) {
		if (type(oThreshold) === 'string') {
			return function(oCtx) {
				return oCtx[oThreshold];
			};
		} else {
			return function(oCtx) {
				return oThreshold;
			};
		}
	};

	Util.isInRange = function(val, lo, hi, loInclusive, hiInclusive) {
		if (!Util.isNumber(val, lo, hi)) {
			return false;
		}
		var loTest = loInclusive ? (lo <= val) : (lo < val);
		var hiTest = hiInclusive ? (val <= hi) : (val < hi);

		return loTest && hiTest;
	};

	Util.genLevels = function(nLvls, fnLevels) {
		var aLevels = [];
		for (var i = 0; i < nLvls; i++) {
			aLevels.push(i + 1);
		}
		return aLevels.map(function(nLevel) {
			return function(oCtx) {
				return fnLevels(oCtx) === nLevel;
			};
		});
	};

	Util.assignColor = function(aColors, iLvls) {
		switch (iLvls) {
			case 1:
				return [aColors[3]];
			case 2:
				return [aColors[1], aColors[3]];
			case 3:
				return [aColors[1], aColors[3], aColors[5]];
			case 4:
				return aColors.slice(1, 5);
			case 5:
				return aColors.slice(1, 6);
			case 6:
				return aColors.slice(0, 6);
			default:
				return null;
		}
	};

	Util.assignUnmentionedColor = function(aColors, iLvls) {
		switch (iLvls) {
			case 1:
				return [aColors[1]];
			case 2:
				return [aColors[1], aColors[5]];
			case 3:
				return [aColors[1], aColors[2], aColors[4]];
			case 4:
				return [aColors[1], aColors[2], aColors[4], aColors[5]];
			case 5:
			    return aColors.filter(function(idx) {
				    return idx !== 3;
			    });
			default:
				return null;
		}
	};

	// Util.createRules = function(oRuleSetting, oMsr) {
	// 	var aRules = [];
	// 	jQuery.each(oRuleSetting.callbacks, function(sCategory, aCbs) {
	// 		var aColors = Palette.assignColor(Palette.COLORS[sCategory.toLowerCase()], aCbs.length);
	// 		jQuery.each(aCbs, function(idx, fnCb) {
	// 			var sDisplayName = [];
	// 			if (oMsr) {
	// 				sDisplayName.push(oMsr.getLabel() || oMsr.getName());
	// 			}
	// 			sDisplayName.push(sCategory.charAt(0).toUpperCase() + sCategory.slice(1));
	// 			sDisplayName = sDisplayName.join(' - ');
	// 			aRules.push({
	// 				callback: fnCb,
	// 				properties: {
	// 					color: aColors[idx]
	// 				},
	// 				displayName: aCbs.length > 1 ? (sDisplayName + ' ' + (idx + 1)) : sDisplayName
	// 			});
	// 		});
	// 	});
	// 	return aRules;
	// };

	return Util;
});
