/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.require('sap.apf.modeler.ui.utils.nullObjectChecker');
jQuery.sap.declare('sap.apf.modeler.ui.utils.staticValuesBuilder');
jQuery.sap.require("sap.apf.modeler.ui.utils.textManipulator");
(function() {
	'use strict';
	/**
	* @class staticValuesBuilder
	* @memberOf sap.apf.modeler.ui.utils
	* @name staticValuesBuilder
	* @description builds static model data
	*/
	sap.apf.modeler.ui.utils.StaticValuesBuilder = function(oTextReader, oOptionsValueModelBuilder) {
		this.oTextReader = oTextReader;
		this.oOptionsValueModelBuilder = oOptionsValueModelBuilder;
	};
	sap.apf.modeler.ui.utils.StaticValuesBuilder.prototype.constructor = sap.apf.modeler.ui.utils.StaticValuesBuilder;
	/**
	* @function
	* @name sap.apf.modeler.ui.utils.staticValuesBuilder#getNavTargetTypeData
	* @returns a model with navigation target types
	* */
	sap.apf.modeler.ui.utils.StaticValuesBuilder.prototype.getNavTargetTypeData = function() {
		var aNavTargetTypes = [ this.oTextReader("globalNavTargets"), this.oTextReader("stepSpecific") ];
		return this.oOptionsValueModelBuilder.convert(aNavTargetTypes, aNavTargetTypes.length);
	};
	/**
	* @function
	* @name sap.apf.modeler.ui.utils.staticValuesBuilder#getLabelDisplayOptions
	* @returns a model with values of label display option types
	* */
	sap.apf.modeler.ui.utils.StaticValuesBuilder.prototype.getLabelDisplayOptions = function() {
		var aLabelDisplayOptionTypes = [ {
			key : "key",
			name : this.oTextReader("key")
		}, {
			key : "text",
			name : this.oTextReader("text")
		}, {
			key : "keyAndText",
			name : this.oTextReader("keyAndText")
		} ];
		return this.oOptionsValueModelBuilder.prepareModel(aLabelDisplayOptionTypes, aLabelDisplayOptionTypes.length);
	};
	/**
	* @function
	* @name sap.apf.modeler.ui.utils.staticValuesBuilder#getValidatedLabelDisplayOptions
	* @returns a model with values of label display option types with Not Available prefix
	* */
	sap.apf.modeler.ui.utils.StaticValuesBuilder.prototype.getValidatedLabelDisplayOptions = function() {
		var oTextManipulator = new sap.apf.modeler.ui.utils.TextManipulator();
		var aLabelDisplayOptionTypes = [ {
			key : "key",
			name : this.oTextReader("key")
		}, {
			key : oTextManipulator.addPrefixText([ "text" ], sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE)[0],
			name : oTextManipulator.addPrefixText([ " " + this.oTextReader("text") ], sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE)[0]
		}, {
			key : oTextManipulator.addPrefixText([ "keyAndText" ], sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE)[0],
			name : oTextManipulator.addPrefixText([ " " + this.oTextReader("keyAndText") ], sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE)[0]
		} ];
		return this.oOptionsValueModelBuilder.prepareModel(aLabelDisplayOptionTypes, aLabelDisplayOptionTypes.length);
	};
	/**
	* @function
	* @name sap.apf.modeler.ui.utils.staticValuesBuilder#getSortDirections
	* @returns a model with sort directions 
	* */
	sap.apf.modeler.ui.utils.StaticValuesBuilder.prototype.getSortDirections = function() {
		var aSortDirections = [ {
			key : "true",
			name : this.oTextReader("ascending")
		}, {
			key : "false",
			name : this.oTextReader("descending")
		} ];
		return this.oOptionsValueModelBuilder.prepareModel(aSortDirections, aSortDirections.length);
	};
})();