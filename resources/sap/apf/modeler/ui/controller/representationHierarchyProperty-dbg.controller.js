/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/*global sap*/
jQuery.sap.require("sap.apf.modeler.ui.utils.textManipulator");
sap.ui.define([ "sap/apf/modeler/ui/controller/propertyType" ], function(BaseController) {
	"use strict";
	var oTextManipulator = new sap.apf.modeler.ui.utils.TextManipulator();
	return BaseController.extend("sap.apf.modeler.ui.controller.representationHierarchyProperty", {
		onBeforeRendering : function() {
			var oController = this;
			if (oController.byId("idLabelDisplayOptionType")) {
				oController.byId("idLabelDisplayOptionType").destroy();
			}
			oController.byId("idPropertyTypeLayout").setSpan("L4 M4 S4");
			oController.byId("idPropertyType").setEnabled(false);
		},
		getAllPropertiesAsPromise : function() {
			var oController = this, sSelectedKey, aPropertiesWithSelectedKey, aHierarchicalProperties = [];
			var oStep = oController.oStepPropertyMetadataHandler.oStep;
			var deferred = jQuery.Deferred();
			oStep.getConsumablePropertiesForRepresentation(oController.oRepresentation.getId()).done(function(oResponse) {
				oResponse.available.forEach(function(sProperty) {
					if (sProperty === oController.oStepPropertyMetadataHandler.getHierarchicalProperty()) {
						aHierarchicalProperties.push(sProperty);
					}
				});
				sSelectedKey = oController.getSelectedProperty();
				if (sSelectedKey !== undefined) {
					aPropertiesWithSelectedKey = aHierarchicalProperties.indexOf(sSelectedKey) !== -1 ? aHierarchicalProperties : aHierarchicalProperties.concat(sSelectedKey);
					if (oResponse.available.indexOf(sSelectedKey) !== -1) {
						aHierarchicalProperties = aPropertiesWithSelectedKey;
						sSelectedKey = sSelectedKey;
					} else {
						aHierarchicalProperties = aHierarchicalProperties.concat(oTextManipulator.addPrefixText([ sSelectedKey ], sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE));
						sSelectedKey = oTextManipulator.addPrefixText([ sSelectedKey ], sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE)[0];
					}
				}
				deferred.resolve({
					aAllProperties : aHierarchicalProperties,
					sSelectedKey : sSelectedKey
				});
			});
			return deferred.promise();
		},
		getPropertyTextLabelKey : function() {
			var oController = this;
			return oController.oRepresentation.getHierarchyPropertyTextLabelKey();
		},
		setPropertyTextLabelKey : function(sPropertyName, sLabelTextKey) {
			var oController = this;
			oController.oRepresentation.setHierarchyPropertyTextLabelKey(sLabelTextKey);
		},
		setNextPropertyInParentObject : function() {
			return;
		},
		removeAddedProperty : function() {
			return;
		},
		addRemovedProperty : function() {
			return;
		},
		removePropertyFromParentObject : function() {
			return;
		},
		setFocusOnRemoveIcons : function() {
			return;
		}
	});
});