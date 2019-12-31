/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare('sap.apf.modeler.ui.utils.textManipulator');
(function() {
	'use strict';
	/**
	* @class textManipulator
	* @memberOf sap.apf.modeler.ui.utils
	* @name textManipulator
	* @description Helps in adding and removing prefix on the properties
	*/
	sap.apf.modeler.ui.utils.TextManipulator = function() {
	};
	sap.apf.modeler.ui.utils.TextManipulator.prototype.constructor = sap.apf.modeler.ui.utils.TextManipulator;
	/**
	* @function
	* @name sap.apf.modeler.ui.utils.TextManipulator#addPrefixText
	* @description Adds "Not Available" as the prefix to the properties
	* @param accepts an array of properties
	* @param {String} accepts text which has to be prefixed
	* */
	sap.apf.modeler.ui.utils.TextManipulator.prototype.addPrefixText = function(aProperties, text) {
		var aPropertiesWithPrefix = [];
		if (aProperties) {
			aPropertiesWithPrefix = aProperties.map(function(sProperty) {
				return text + sProperty;
			});
		}
		return aPropertiesWithPrefix;
	};
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.utils.TextManipulator#removePrefixText
	* @description Removes "Not Available" as the prefix to the properties
	* @param accepts the property whose prefix has to be removed
	* @param {String} accepts a text which has to be removed
	* */
	sap.apf.modeler.ui.utils.TextManipulator.prototype.removePrefixText = function(sProperty, text) {
		return sProperty.replace(text, "");
	};
})();