jQuery.sap.declare('sap.apf.ui.utils.decimalFormatter');
(function() {
	"use strict";
	sap.apf.ui.utils.decimalFormatter = function() {
		this.oSemanticsFormatterMap = _getMapForSemantic();
	};
	sap.apf.ui.utils.decimalFormatter.prototype.constructor = sap.apf.ui.utils.decimalFormatter;
	function _getMapForSemantic() {
		var semanticsFormatterMap = new Map();
		semanticsFormatterMap.set("currency-code", _currencyFormatter);
		semanticsFormatterMap.set(undefined, _defaultFormatter);
		return semanticsFormatterMap;
	}
	function _currencyFormatter(oMetaData, originalFieldValue) {
		var currencyFormatter = sap.ui.core.format.NumberFormat.getCurrencyInstance();
		return currencyFormatter.format(originalFieldValue);
	}
	function _defaultFormatter(oMetaData, originalFieldValue, precision) {
		var fixedFloat = sap.ui.core.format.NumberFormat.getFloatInstance({
			style : 'standard',
			minFractionDigits : precision
		});
		return fixedFloat.format(originalFieldValue);
	}
	sap.apf.ui.utils.decimalFormatter.prototype.getFormattedValue = function(oMetaData, originalFieldValue, precision) {
		var semantics = oMetaData["semantics"] !== undefined ? oMetaData["semantics"] : undefined;
		return this.oSemanticsFormatterMap.get(semantics).call(self, oMetaData, originalFieldValue, precision);
	}
}());
