sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/Context",
	"sap/suite/ui/generic/template/AnalyticalListPage/util/OperationCode"
	],	function(BaseObject, Context, OperationCode) {
		"use strict";
		var FilterUtil = BaseObject.extend("sap.suite.ui.generic.template.AnalyticalListPage.util.FilterUtil");
		/**
		 * @private
		 * This function create a title by combining the label and id
		 * @param  {string} sDimValueDisplay the label field
		 * @param  {string} sDimValue the id field
		 * @return {string} the newly created title
		 */
		FilterUtil.createTitle = function (sDimValueDisplay, sDimValue) {
			var sTitle;
			if (!sDimValueDisplay) {
				return sDimValue;
			}
			//for donut chart
			if (sDimValueDisplay.indexOf(':') !== -1 ) {
				sDimValueDisplay = sDimValueDisplay.substring(0, sDimValueDisplay.indexOf(':'));
			}
			//if not already concatenated
			if (sDimValueDisplay.indexOf(sDimValue) === -1) {
				sTitle = sDimValueDisplay + " (" +  sDimValue + ")";
			}
			else {
				sTitle = sDimValueDisplay;
			}
			return sTitle;
		};

		/**
		 * This function access nested object and returns the correct value if it exists, and undefined in all other cases
		 * @param  {object} nested object
		 * @param  {string} sNestedProperty the property string
		 * @return {object} return the required object if exist otherwise return undefined
		 */
		FilterUtil.readProperty = function(oObject, sNestedProperty) {
			var oObj = oObject, i = 0;
			var oProperties = typeof sNestedProperty === 'string' ? sNestedProperty.split(".") : [];
			while (i < oProperties.length) {
				if (!oObj) {
					return undefined;
				}
				oObj = oObj[oProperties[i++]];
			}
			return oObj;
		};
		/**
		 * This function execute a function associated with an object and return the result if the function is exists, and undefined in all other cases
		 * @param  {object}   oObject       nested object
		 * @param  {string}   sFunctionName full name of the function
		 * @param  {[object]} oArgs         array of object as arguments to the function
		 * @return {object}                 return the result after executing the function if the function is exists, otherwise return undefined 
		 */
		FilterUtil.executeFunction = function(oObject, sFunctionName, oArgs){
			var oObj = oObject, i = 0, oParent;
			var oProperties = typeof sFunctionName === 'string' ? sFunctionName.split(".") : [];
			while (i < oProperties.length) {
				if (!oObj) {
					return undefined;
				}
				oParent = oObj;
				oObj    = oObj[oProperties[i++]];
			}
			return typeof oObj === 'function' ? oObj.apply(oParent, oArgs) : undefined;
		};
		/**
		 * This function create a title from the operation code
		 * @param  {object} oFilterValueRange ranges
		 * @return {string} title
		 */
		FilterUtil.createTitleFromCode = function(oFilterValueRange) {
			var sValueA = FilterUtil.readProperty(oFilterValueRange, "value1");
			var sValueB = FilterUtil.readProperty(oFilterValueRange, "value2");
			var sOperation = FilterUtil.readProperty(oFilterValueRange, "operation");
			if ( !sValueA || !sOperation || !OperationCode[sOperation]) {
				return undefined;
			}
			var sResult;
			if (sValueB) {
				sResult = sValueA + OperationCode[sOperation].code + sValueB;
			} else if (OperationCode[sOperation].position === "last") {
				sResult = sValueA + OperationCode[sOperation].code;
			} else if (OperationCode[sOperation].position === "mid") {
				sResult = OperationCode[sOperation].code + sValueA + OperationCode[sOperation].code;
			} else {
				sResult = OperationCode[sOperation].code + sValueA;
			}
			if (oFilterValueRange.exclude) {
				sResult = "!(" + sResult + ")";
			}
			return sResult;
		};

		/**
		 * Formatter to create Filters link text
		 * @param  {Object} oContext FilterData
		 * @return {string} Text for filters link
		 */
		FilterUtil.formatFiltersLink = function(oContext) {
			var i18n = this.getModel("i18n"),
			rb = i18n.getResourceBundle();
			if (oContext) {
				var length = Object.keys(oContext).length;
				if (oContext["_CUSTOM"]) {
					//We store custom app state in _CUSTOM property which shouldnt be counted
					length--;
				}
				if (length) {
					return rb.getText("VISUAL_FILTER_FILTERS_WITH_COUNT", [length]);
				}
			}
			return rb.getText("VISUAL_FILTER_FILTERS");
		};
	return FilterUtil;
}, true);