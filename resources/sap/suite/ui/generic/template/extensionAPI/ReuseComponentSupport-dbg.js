/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define(["jquery.sap.global", "sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel",
		"sap/suite/ui/generic/template/extensionAPI/extensionAPI"
	],
	function(jQuery, UIComponent, JSONModel, extensionAPI) {
		"use strict";
		var ReuseComponentSupport = {},
			sJQueryDebugLogName = "sap.suite.ui.generic.template.extensionAPI.ReuseComponentSupport";

		function fnAttachContextReady(oComponent) {
			oComponent.attachEvent("modelContextChange", function() {
				var oDefaultModelBindingContext = oComponent.getBindingContext(),
					oModel = oComponent.getModel(),
					sBindingContextPath = oDefaultModelBindingContext && oDefaultModelBindingContext.getPath();
				jQuery.sap.log.debug(oComponent.getId() + ":" + oComponent.getMetadata().getName() + ": modelAvailable=" + !!oModel +
					" : context=" + sBindingContextPath, sJQueryDebugLogName);
				if (oModel && sBindingContextPath && oComponent._stContext.lastBindingContextPath !== sBindingContextPath) {
					//Remember the current binding context
					oComponent._stContext.lastBindingContextPath = sBindingContextPath;

					//Context has changed
					var fnCurrentCallback = (oComponent._stContext.firstTime && oComponent.stStart) || oComponent.stRefresh;
					if (fnCurrentCallback){
						oComponent._stContext.extensionAPIPromise = oComponent._stContext.extensionAPIPromise || extensionAPI.getExtensionAPIPromise(oComponent.oContainer);
				// The callback is called as soon as the extensionAPI is available. Note that the promise resolves to the extensionAPI. Thus, we finally call fnCurrentCallback(oModel, oDefaultModelBindingContext, oExtensionAPI) on oComponent.
						oComponent._stContext.extensionAPIPromise.then(fnCurrentCallback.bind(oComponent, oModel, oDefaultModelBindingContext));
					}
					oComponent._stContext.firstTime = false;
				}
			});
		}

		function mixInto(oComponent, sComponentModelName) {
			/* Initialize smart template context at component */
			oComponent._stContext = {
				lastBindingContextPath: "",
				firstTime: true
			};

			//Subscribe to context ready-events (only if the reuse components shows interest by defining at least one of the corresponding functions)
			if (oComponent.stRefresh || oComponent.stStart) {
				fnAttachContextReady(oComponent);
			}

			//Create component model in case specified
			if (sComponentModelName) {
				var oProperties = oComponent.getMetadata().getProperties();
				var oModelData = {}; // initial data for the component model
				for (var sProperty in oProperties){
					oModelData[sProperty] = oComponent.getProperty(sProperty);	// transfer property values to the model
				}				
				var oComponentModel = new JSONModel(oModelData);
				oComponent.setModel(oComponentModel, sComponentModelName);
				var fnSetProperty = oComponent.setProperty || jQuery.noop;
				//overwrite set property
				oComponent.setProperty = function(sName, value) {
					/* we overwrite the set property function of UI5 to automatically update the component model
					 * but first we need to call the original (aka super in other languages)
					 */
					fnSetProperty.apply(this, arguments);
					oComponentModel.setProperty("/" + sName, value);
					jQuery.sap.log.debug(this.getId() + ":" + this.getMetadata().getName() + ": setProperty " + sName + "=" + value, sJQueryDebugLogName);
				};
				oComponent.getComponentModel = oComponent.getComponentModel || function(){ return oComponentModel; };
			}
		}

		/**
		 * Mixin function to transform a regular UIComponent instance into a reuse component for smart templates
		 *
		 * By using the mixInto method the existing component is checked if it implements the following functions:
		 * <ul>
		 *  <li><code>stStart(oModel, oBindingContext, oExtensionAPI)</code> - is called when the model and the context is set for the first time above the compoenent</li>
		 *  <li><code>stRefresh(oModel, oBindingContext, oExtensionAPI)</code> - is called everytime a new context is set above the component</li>
		 * </ui>
		 *
		 * @name sap.suite.ui.generic.template.extensionAPI.ReuseComponentSupport.mixInto
		 * @param {sap.ui.core.UIComponent} oComponent the component to be transformed. The following restrictions apply to this component:
		 * <ul>
		 *  <li>The object must not define or access any properties or methods starting with <code>_st</code>. This namespace is reserved for smart template specific coding.
		 *	<li>The object must not define any property or method starting with <code>st</code> with the exception of the methods described above.
		 * </ul>
		 * @param {string} [componentModelName] if this paramater is truthy a JSON model will created that contains the properties defined in the meatdata of <code>oComponent</code>.
		 * The model will be attached to the component with the given name. Moreover, a method <code>getComponentModel</code> will be added to <code>oComponent</code> giving access
		 * to this model.
		 * The properties in the model will be automatically synced with the corresponding properties of <code>oComponent</code>.
		 *
		 * @public
		 */
		ReuseComponentSupport.mixInto = function(oComponent, sComponentModelName) {
		    if (!(oComponent instanceof UIComponent)){
				throw new Error("Reuse component must be an instance of sap.ui.core.UIComponent");
			}
			mixInto(oComponent, sComponentModelName);
		};

		return ReuseComponentSupport;
	});