/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/fl/changeHandler/BaseRename', "sap/ui/fl/Utils"
], function(jQuery, BaseRename, Utils) {
	"use strict";

	var PROPERTY_NAME = "label";
	var CHANGE_PROPERTY_NAME = "fieldLabel";
	var TT_TYPE = "XFLD";

	/**
	 * Change handler for renaming a smart form group element.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.RenameField
	 * @author SAP SE
	 * @version 1.46.2
	 * @experimental Since 1.27.0
	 */
	var RenameField = BaseRename.createRenameChangeHandler({
		changePropertyName : CHANGE_PROPERTY_NAME,
		translationTextType : TT_TYPE
	});

	/**
	 * Renames a SmartField.
	 *
	 * @param {sap.ui.fl.Change} oChange change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag property bag
	 * @param {object} mPropertyBag.modifier modifier for the control
	 * @returns {boolean} true if successful
	 * @public
	 */
	RenameField.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeDefinition = oChange.getDefinition();
		var sText = oChangeDefinition.texts[CHANGE_PROPERTY_NAME];
		var sValue = sText.value;

		if (oChangeDefinition.texts && sText && typeof (sValue) === "string") {

			// If the label is a control, the change must be done on the element for label
			var oElementForLabel;
			var sControlPropertyName;
			var aElements = oModifier.getAggregation(oControl, "elements");
			var iElementForLabelIndex = oModifier.getProperty(oControl, "elementForLabel") || 0;
			if (aElements && aElements[iElementForLabelIndex]){
				oElementForLabel = aElements[iElementForLabelIndex];
				sControlPropertyName = "textLabel";
			} else {
				oElementForLabel = oControl;
				sControlPropertyName = PROPERTY_NAME;
			}

			// The value can be a binding - e.g. for translatable values in WebIde
			// In order to properly save the undo, the label "text" property also needs to be set
			var vLabel = oModifier.getProperty(oControl, "label");
			if (Utils.isBinding(sValue)) {
				oModifier.setPropertyBinding(oElementForLabel, sControlPropertyName, sValue);
				if (typeof vLabel !== "string"){
					oModifier.setPropertyBinding(vLabel, "text", sValue);
				} else {
					oModifier.setPropertyBinding(oControl, sControlPropertyName, sValue);
				}
			} else {
				oModifier.setProperty(oElementForLabel, sControlPropertyName, sValue);
				if (typeof vLabel !== "string"){
					oModifier.setProperty(vLabel, "text", sValue);
				} else {
					oModifier.setProperty(oControl, sControlPropertyName, sValue);
				}
			}

			return true;

		} else {
			Utils.log.error("Change does not contain sufficient information to be applied: [" + oChangeDefinition.layer + "]" + oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType);
			//however subsequent changes should be applied
		}
	};

	return RenameField;
},
/* bExport= */true);