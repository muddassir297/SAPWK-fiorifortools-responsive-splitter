/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/*global sap*/
jQuery.sap.require("sap.apf.modeler.ui.utils.textManipulator");
jQuery.sap.require("sap.apf.utils.utils");
sap.ui.define([ "sap/apf/modeler/ui/controller/propertyType" ], function(BaseController) {
	"use strict";
	var oTextManipulator = new sap.apf.modeler.ui.utils.TextManipulator();
	return BaseController.extend("sap.apf.modeler.ui.controller.representationProperty", {
		onBeforeRendering : function() {
			var oController = this;
			if (oController.byId("idLabelDisplayOptionType")) {
				oController.byId("idLabelDisplayOptionType").destroy();
			}
			oController.byId("idPropertyTypeLayout").setSpan("L4 M4 S4");
		},
		getAllPropertiesAsPromise : function() {
			var oController = this, sSelectedKey, aPropertiesWithSelectedKey, aProperties = [];
			var oStep = oController.oStepPropertyMetadataHandler.oStep;
			var deferred = jQuery.Deferred();
			oStep.getConsumablePropertiesForRepresentation(oController.oRepresentation.getId()).done(function(oResponse) {
				oResponse.consumable.forEach(function(sProperty) {
					oController.oStepPropertyMetadataHandler.getProperties().forEach(function(sSelectProperty) {
						if (sProperty === sSelectProperty) {
							aProperties.push(sProperty);
						}
					});
				});
				sSelectedKey = oController.getSelectedProperty();
				if (sSelectedKey !== oController.oTextReader("none") && sSelectedKey !== undefined) {
					aPropertiesWithSelectedKey = aProperties.indexOf(sSelectedKey) !== -1 ? aProperties : aProperties.concat(sSelectedKey);
					if (oResponse.available.indexOf(sSelectedKey) !== -1 || sSelectedKey === oController.oTextReader("none")) {
						aProperties = aPropertiesWithSelectedKey;
						sSelectedKey = sSelectedKey;
					} else {
						aProperties = aProperties.concat(oTextManipulator.addPrefixText([ sSelectedKey ], sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE));
						sSelectedKey = oTextManipulator.addPrefixText([ sSelectedKey ], sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE)[0];
					}
				}
				if (oController.oStepPropertyMetadataHandler.getStepType() === "hierarchicalStep") {
					aProperties.splice(0, 0, oController.oTextReader("none"));
				}
				deferred.resolve({
					aAllProperties : aProperties,
					sSelectedKey : sSelectedKey
				});
			});
			return deferred.promise();
		},
		getPropertyTextLabelKey : function(sPropertyName) {
			var oController = this;
			return oController.oRepresentation.getPropertyTextLabelKey(sPropertyName);
		},
		updateProperties : function(aPropertiesInformation) {
			var oController = this;
			oController.oRepresentation.getProperties().forEach(function(sMeasure) {
				oController.oRepresentation.removeProperty(sMeasure);
			});
			aPropertiesInformation.forEach(function(oPropertiesInformation) {
				oController.oRepresentation.addProperty(oPropertiesInformation.sProperty);
				oController.oRepresentation.setPropertyKind(oPropertiesInformation.sProperty, oPropertiesInformation.sKind);
				oController.oRepresentation.setPropertyTextLabelKey(oPropertiesInformation.sProperty, oPropertiesInformation.sTextLabelKey);
			});
		},
		createNewPropertyInfoAsPromise : function(sNewProperty) {
			var oController = this, oNewPropertyInfo = {};
			oNewPropertyInfo.sProperty = sNewProperty;
			oNewPropertyInfo.sKind = oController.getView().getViewData().oPropertyTypeData.sContext;
			oNewPropertyInfo.sTextLabelKey = undefined;
			return sap.apf.utils.createPromise(oNewPropertyInfo);
		},
		createCurrentProperiesInfo : function(sProperty) {
			var oCurrentPropertiesInformation = {}, oController = this;
			oCurrentPropertiesInformation.sProperty = sProperty;
			oCurrentPropertiesInformation.sKind = oController.oRepresentation.getPropertyKind(sProperty);
			oCurrentPropertiesInformation.sTextLabelKey = oController.oRepresentation.getPropertyTextLabelKey(sProperty);
			return oCurrentPropertiesInformation;
		},
		setPropertyTextLabelKey : function(sPropertyName, sLabelTextKey) {
			var oController = this;
			oController.oRepresentation.setPropertyTextLabelKey(sPropertyName, sLabelTextKey);
		},
		setNextPropertyInParentObject : function() {
			var oController = this;
			var sProperty = oController.getView().getViewData().oPropertyTypeData.sProperty;
			var sKind = oController.getView().getViewData().oPropertyTypeData.sContext;
			oController.oRepresentation.addProperty(sProperty);
			oController.oRepresentation.setPropertyKind(sProperty, sKind);
			oController.setPropertyTextLabelKey(sProperty, undefined);
			oController.setDetailData();
		},
		removePropertyFromParentObject : function() {
			var oController = this;
			oController.oRepresentation.removeProperty(oTextManipulator.removePrefixText(oController.byId("idPropertyType").getSelectedKey(), sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE));
		},
		addPropertyAsPromise : function() {
			var oController = this, aProperties = [];
			var oStep = oController.oStepPropertyMetadataHandler.oStep;
			var oConstants = sap.apf.modeler.ui.utils.CONSTANTS;
			oStep.getConsumablePropertiesForRepresentation(oController.oRepresentation.getId()).done(function(oResponse) {
				oResponse.consumable.forEach(function(sProperty) {
					oController.oStepPropertyMetadataHandler.getProperties().forEach(function(sSelectProperty) {
						if (sProperty === sSelectProperty) {
							aProperties.push(sProperty);
						}
					});
				});
				oController.getView().fireEvent(oConstants.events.ADDPROPERTY, {
					"sProperty" : aProperties[0],
					"sContext" : oController.getView().getViewData().oPropertyTypeData.sContext
				});
				oController.oConfigurationEditor.setIsUnsaved();
			});
		},
		addRemovedProperty : function(oEvent) {
			var oController = this;
			var sProperty = oEvent.getParameter("sProperty");
			if (sProperty !== oController.oTextReader("none")) {
				var oItem = new sap.ui.core.Item({
					key : sProperty,
					text : sProperty
				});
				oController.byId("idPropertyType").addItem(oItem);
			}
		},
		removeAddedProperty : function(oEvent) {
			var oController = this;
			var sProperty = oEvent.getParameter("sProperty");
			var aItems = oController.byId("idPropertyType").getItems();
			aItems.forEach(function(oItem) {
				if (oItem.getKey() === sProperty && sProperty !== oController.oTextReader("none")) {
					oController.byId("idPropertyType").removeItem(oItem);
				}
			});
		}
	});
});