/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.core.hierarchicalStep");
jQuery.sap.require("sap.apf.core.step");
jQuery.sap.require("sap.apf.core.utils.uriGenerator");
jQuery.sap.require("sap.ui.model.odata.v2.ODataModel");

(function() {
	'use strict';
	/**
	 * @private
	 * @class A step is a runtime container for binding and request. 
	 * @name sap.apf.core.HierarchicalStep
	 * @param {object} messageHandler Message handler instance
	 * @param {object} stepConfig Step configuration object from analytical content configuration
	 * @param {sap.apf.core.ConfigurationFactory} factory
	 * @param {string} [representationId] the representation, that shall be selected
	 * @param {sap.apf.core.Instance} coreApi
	 * @returns {sap.apf.core.HierarchicalStep} 
	 */
	sap.apf.core.HierarchicalStep = function(messageHandler, stepConfig, factory, representationId, coreApi) {
		sap.apf.core.Step.call(this, messageHandler, stepConfig, factory, representationId);

		var selectString;
		var cachedFilter;
		this.type = "hierarchicalStep";
		var service = factory.getConfigurationById(stepConfig.request).service;
		var entitySet = factory.getConfigurationById(stepConfig.request).entityType;
		var annotations = coreApi.getAnnotationsForService(service);
		var hierarchyProperty = stepConfig.hierarchyProperty;
		var metadataInitialized = jQuery.Deferred();
		jQuery.when(coreApi.getMetadata(service), coreApi.getEntityTypeMetadata(service, entitySet)).then(function(metadata, entityTypeMetadata){
			var hierarchyAnnotations = metadata.getHierarchyAnnotationsForProperty(entitySet, hierarchyProperty);
			if(hierarchyAnnotations.type === "messageObject"){
				messageHandler.putMessage(hierarchyAnnotations);
			} else {
				selectString = getSelectString(hierarchyProperty, hierarchyAnnotations);
			}
			metadataInitialized.resolve(metadata, hierarchyAnnotations, entityTypeMetadata);
		});
		var oModel = new sap.ui.model.odata.v2.ODataModel(service, {annotationURI : annotations});
		function getSelectString(hierarchyProperty, hierarchyAnnotations){
			var selectStrings = [hierarchyProperty];
			for (var key in hierarchyAnnotations){
				selectStrings.push(hierarchyAnnotations[key]);
			}
			selectStrings = selectStrings.concat(factory.getConfigurationById(stepConfig.request).selectProperties);
			return sap.apf.core.utils.uriGenerator.getSelectString(selectStrings);
		}


		this.update = function(filter, callbackAfterRequest) {
			metadataInitialized.done(function(metadata, hierarchyAnnotations, entityTypeMetadata){
				var filterForRequest = filter.restrictToProperties(metadata.getFilterableProperties(entitySet));
				var bFilterChanged = !filterForRequest.isEqual(cachedFilter);
				if(!bFilterChanged){
					callbackAfterRequest({}, true);
					return;
				}

				var path = "/" + sap.apf.core.utils.uriGenerator.generateOdataPath(messageHandler, metadata, entitySet, filter, metadata.getUriComponents(entitySet).navigationProperty);
				var controlObject = {};
				controlObject.path = path;
				if(!filterForRequest.isEmpty()){
					controlObject.filters = [filterForRequest.mapToSapUI5FilterExpression()];
				}
				controlObject.parameters = {
						select: selectString,
						operationMode: sap.ui.model.odata.OperationMode.Server,
						useServerSideApplicationFilters: true,
						treeAnnotationProperties : hierarchyAnnotations
				};
				this.getBinding().updateTreetable(controlObject, oModel, callbackAfterRequest, entityTypeMetadata);
			}.bind(this));
		};
		this.setData = function(responseData, requestFilter){
			cachedFilter = requestFilter.copy();
		};
	};
})();