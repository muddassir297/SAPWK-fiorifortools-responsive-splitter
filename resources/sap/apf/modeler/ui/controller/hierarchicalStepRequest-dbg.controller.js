/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/*global sap*/
jQuery.sap.require("sap.apf.modeler.ui.utils.textManipulator");
sap.ui.define([ "sap/apf/modeler/ui/controller/stepRequest.controller" ], function(BaseController) {
	"use strict";
	var textManipulator = new sap.apf.modeler.ui.utils.TextManipulator();
	var optionsValueModelBuilder = new sap.apf.modeler.ui.utils.OptionsValueModelBuilder();
	var nullObjectChecker = new sap.apf.modeler.ui.utils.NullObjectChecker();
	return BaseController.extend("sap.apf.modeler.ui.controller.hierarchicalStepRequest", {
		// Sets visibility of select box to true for hierarchical and selectable property 
		onBeforeRendering : function() {
			var oController = this;
			oController.byId("idOptionalPropertyLabel").setVisible(true);
			oController.byId("idOptionalProperty").setVisible(true);
		},
		setDisplayText : function() {
			var oController = this;
			var oTextReader = oController.getView().getViewData().oTextReader;
			oController.byId("idSourceLabel").setText(oTextReader("source"));
			oController.byId("idEntityLabel").setText(oTextReader("hierarchicalEntity"));
			oController.byId("idOptionalPropertyLabel").setText(oTextReader("hierarchicalProperty"));
			oController.byId("idSelectPropertiesLabel").setText(oTextReader("nonHierarchicalProperty"));
			oController.byId("idOptionalRequestFieldLabel").setText(oTextReader("requiredFilters"));
		},
		setOptionalHierarchicalProperty : function() {
			var oController = this;
			var deferred = jQuery.Deferred();
			var oModelForHierarchicalProperty, sSource, sHierarchicalEntitySet, aValidatedValues;
			sSource = oController.byId("idSource").getValue();
			sHierarchicalEntitySet = oController.byId("idEntity").getSelectedKey();
			// Default State
			oController.byId("idOptionalProperty").setModel(null);
			oController.byId("idOptionalProperty").clearSelection();
			if (!nullObjectChecker.checkIsNotNullOrUndefinedOrBlank(sSource)) {
				deferred.resolve();
				return deferred.promise();
			}
			oController.getHierarchicalProperty(sSource, sHierarchicalEntitySet).done(function(aAllHierarchicalEntitiesInPromise) {
				var sSelectedHierarchicalProperty = oController.getSelectedHierarchicalProperty();
				// Validate previously selected values
				if (nullObjectChecker.checkIsNotNullOrUndefinedOrBlank(sSelectedHierarchicalProperty)) {
					aValidatedValues = oController.validateSelectedValues(oController, [ sSelectedHierarchicalProperty ], aAllHierarchicalEntitiesInPromise);
					aAllHierarchicalEntitiesInPromise = aValidatedValues.aValues;
					sSelectedHierarchicalProperty = aValidatedValues.aSelectedValues[0];
				}
				// setModel
				oModelForHierarchicalProperty = optionsValueModelBuilder.convert(aAllHierarchicalEntitiesInPromise);
				oController.byId("idOptionalProperty").setModel(oModelForHierarchicalProperty);
				// setSelectedKey as 0th entity -> in case new parent object(no entity available for new parent object)/ in case of change of source(if old entity is not present in the entities of new source)
				if (!nullObjectChecker.checkIsNotNullOrUndefinedOrBlank(sSelectedHierarchicalProperty) || aAllHierarchicalEntitiesInPromise.indexOf(sSelectedHierarchicalProperty) === -1) {
					oController.getHierarchicalProperty(sSource, sHierarchicalEntitySet).done(function(hierarchicalEntities) {
						sSelectedHierarchicalProperty = hierarchicalEntities[0];
						if (nullObjectChecker.checkIsNotNullOrUndefinedOrBlank(sSelectedHierarchicalProperty)) {
							oController.byId("idOptionalProperty").setSelectedKey(sSelectedHierarchicalProperty);
						}
						deferred.resolve();
					});
				} else if (nullObjectChecker.checkIsNotNullOrUndefinedOrBlank(sSelectedHierarchicalProperty)) {
					oController.byId("idOptionalProperty").setSelectedKey(sSelectedHierarchicalProperty);
					deferred.resolve();
				}
			});
			return deferred.promise();
		},
		addOrRemoveMandatoryFieldsAndRequiredFlag : function(bRequired) {
			var oController = this;
			if (bRequired === false) {
				return;
			}
			oController.byId("idSourceLabel").setRequired(bRequired);
			oController.byId("idEntityLabel").setRequired(bRequired);
			oController.byId("idOptionalPropertyLabel").setRequired(bRequired);
			oController.viewValidator.addFields([ "idSource", "idEntity", "idOptionalProperty" ]);
		},
		handleChangeForOptionalHierarchicalProperty : function(oEvt) {
			var oController = this;
			var sHierarchicalProperty = [ textManipulator.removePrefixText(oController.byId("idOptionalProperty").getSelectedKey(), sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE) ];
			oController.updateHierarchicalProperty(sHierarchicalProperty);
			oController.oConfigurationEditor.setIsUnsaved();
			oController.fireRelevantEvents(oEvt);
		},
		getAllEntitiesAsPromise : function(sSource) {
			var oController = this;
			return oController.oConfigurationEditor.getAllHierarchicalEntitySetsOfServiceAsPromise(sSource);
		},
		getHierarchicalProperty : function(sSource, sEntitySet) {
			var oController = this;
			return oController.oConfigurationEditor.getHierarchicalPropertiesOfEntitySetAsPromise(sSource, sEntitySet);
		},
		getSelectedHierarchicalProperty : function() {
			var oController = this;
			return oController.oParentObject.getHierarchyProperty();
		},
		getAllEntitySetPropertiesAsPromise : function(sSource, sEntitySet) {
			var oController = this;
			return oController.oConfigurationEditor.getNonHierarchicalPropertiesOfEntitySet(sSource, sEntitySet);
		},
		resetEntityAndProperties : function() {
			var oController = this;
			oController.clearEntity();
			oController.byId("idEntity").setModel(null);
			oController.byId("idEntity").setSelectedKey(undefined);
			oController.clearHierarchicalEntity();
			oController.byId("idOptionalProperty").setModel(null);
			oController.byId("idOptionalProperty").setSelectedKey(undefined);
			oController.clearSelectProperties();
			oController.byId("idSelectProperties").setModel(null);
			oController.byId("idSelectProperties").setSelectedKeys([]);
		},
		clearHierarchicalEntity : function() {
			var oController = this;
			oController.oParentObject.setHierarchyProperty(undefined);
		},
		updateHierarchicalProperty : function(sHierarchicalEntity) {
			var oController = this;
			oController.clearHierarchicalEntity();
			oController.oParentObject.setHierarchyProperty(sHierarchicalEntity);
		}
	});
});