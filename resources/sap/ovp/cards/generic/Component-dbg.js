(function() {
	"use strict";
	/*global jQuery, sap */

	jQuery.sap.declare("sap.ovp.cards.generic.Component");
	jQuery.sap.require("sap.ui.core.UIComponent");
	jQuery.sap.require("sap.ovp.cards.AnnotationHelper");
    jQuery.sap.require("sap.ovp.cards.LoadingUtils");

	sap.ui.core.UIComponent.extend("sap.ovp.cards.generic.Component", {
		// use inline declaration instead of component.json to save 1 round trip
		metadata: {
			properties: {
				"contentFragment": {
					"type": "string"
				},
				"headerExtensionFragment": {
					"type": "string"
				},
				"contentPosition": {
					"type": "string",
					"defaultValue": "Middle"
				},
				"footerFragment": {
					"type": "string"
				},
				"identificationAnnotationPath": {
					"type": "string",
					"defaultValue": "com.sap.vocabularies.UI.v1.Identification"
				},
				"selectionAnnotationPath": {
					"type": "string"
				},
				"filters": {
					"type": "object"
				},
				"addODataSelect": {
					"type": "boolean",
					"defaultValue": false
				}
			},
			version: "1.46.0",

			library: "sap.ovp",

			includes: [],

			dependencies: {
				libs: ["sap.m"],
				components: []
			},
			config: {}
		},

		/**
		 * Default "abstract" empty function.
		 * In case there is a need to enrich the default preprocessor which provided by OVP, the extended Component should provide this function and return a preprocessor object.
		 * @public
		 * @returns {Object} SAPUI5 preprocessor object
		 */
		getCustomPreprocessor: function() {},

		getPreprocessors: function(pOvplibResourceBundle) {
			var oComponentData = this.getComponentData(),
				oSettings = oComponentData.settings,
				oModel = oComponentData.model,
				oMetaModel,
				oEntityType,
				oEntityTypeContext,
				oEntitySetContext;

			//Backwards compatibility to support "description" property
			if (oSettings.description && !oSettings.subTitle) {
				oSettings.subTitle = oSettings.description;
			}
			if (oModel) {
				oMetaModel = oModel.getMetaModel();
				if (oSettings.entitySet) {
					var oEntitySet = oMetaModel.getODataEntitySet(oSettings.entitySet);
					var sEntitySetPath = oMetaModel.getODataEntitySet(oSettings.entitySet, true);
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);

					oEntitySetContext = oMetaModel.createBindingContext(sEntitySetPath);
					oEntityTypeContext = oMetaModel.createBindingContext(oEntityType.$path);
				}
			}

			var oCardProperties = this._getCardPropertyDefaults();
			var oCardLayoutData = this._completeLayoutDefaults(oCardProperties, oSettings);
            //To get Global Parameters
            var showDateInRelativeFormat;
            var disableTableCardFlexibility;
            if (oComponentData.appComponent && oComponentData.appComponent.getModel("ui") &&
                oComponentData.appComponent.getModel("ui").oData){
                showDateInRelativeFormat = oComponentData.appComponent.getModel("ui").oData.showDateInRelativeFormat;
                disableTableCardFlexibility = oComponentData.appComponent.getModel("ui").oData.disableTableCardFlexibility;
            }
            var oAdditionalData = {
                metaModel: oMetaModel,
                entityType: oEntityType,
                webkitSupport: sap.ui.Device.browser.webkit,
                layoutDetail: oCardLayoutData && oCardLayoutData.cardLayout ? oCardLayoutData.cardLayout.containerLayout : 'fixed',
                showDateInRelativeFormat : showDateInRelativeFormat,
                disableTableCardFlexibility: disableTableCardFlexibility
            };
            if (oComponentData && oComponentData.cardId) {
                var oMainComponent = oComponentData.mainComponent;
                var oTemplate = oMainComponent._getCardFromManifest(oComponentData.cardId).template;
                oAdditionalData.template = oTemplate;
            }
			//set the densityProperty for the card
			oCardProperties.densityStyle = this._setCardpropertyDensityAttribute();
			if (oCardLayoutData) {
				oAdditionalData.cardLayout = oCardLayoutData.cardLayout;
			}

			/**
             * Setting selectionAnnotationPath, presentationAnnotationPath
             * annotationPath and chartAnnotationPath
             * using selectionPresentationAnnotationPath if
             * SelectionPresentationVariant is present in annotations
             */
           if (oCardProperties.state !== "Loading") {
              if (oSettings && oSettings.selectionPresentationAnnotationPath) {
                var oSelectionPresentationVariant = oEntityType[oSettings.selectionPresentationAnnotationPath];
                if (oSelectionPresentationVariant) {
                    var oSelectionVariantPath = oSelectionPresentationVariant.SelectionVariant && oSelectionPresentationVariant.SelectionVariant.AnnotationPath;
                    if (oSelectionVariantPath) {
                        if (/^@/.test(oSelectionVariantPath)) {
                            oSelectionVariantPath = oSelectionVariantPath.slice(1);
                        }
                        oSettings.selectionAnnotationPath = oSelectionVariantPath;
                    }
                    var oPresentationVariantPath = oSelectionPresentationVariant.PresentationVariant && oSelectionPresentationVariant.PresentationVariant.AnnotationPath;
                    if (oPresentationVariantPath) {
                        if (/^@/.test(oSelectionPresentationVariant.PresentationVariant.AnnotationPath)) {
                            oPresentationVariantPath = oPresentationVariantPath.slice(1);
                        }
                        oSettings.presentationAnnotationPath = oPresentationVariantPath;
                        var sVisualizations = oEntityType[oPresentationVariantPath].Visualizations[0].AnnotationPath;
                        if (sVisualizations) {
                            if (/^@/.test(sVisualizations)) {
                                sVisualizations = sVisualizations.slice(1);
                            }
                            if (/.LineItem/.test(sVisualizations)) {
                                oSettings.annotationPath = sVisualizations;
                            }
                            if (/.Chart/.test(sVisualizations)) {
                                oSettings.chartAnnotationPath = sVisualizations;
                            }
                        }
                    }
                 }
              }
           }

            if (oCardProperties.state && (oCardProperties.state === "Loading" || oCardProperties.state === "Error") && sap.ovp.cards.LoadingUtils.bPageAndCardLoading) {
                oCardProperties.footerFragment = "sap.ovp.cards.loading.LoadingContent";
            }

			oCardProperties = jQuery.extend(true, oAdditionalData, oCardProperties, oSettings);

			var oOvpCardPropertiesModel = new sap.ui.model.json.JSONModel(oCardProperties);
			//var ovplibResourceBundle = this.getOvplibResourceBundle();

			// device model
			var oDeviceModel = new sap.ui.model.json.JSONModel(sap.ui.Device);
			oDeviceModel.setDefaultBindingMode("OneWay");

			var oDefaultPreprocessors = {
				xml: {
					bindingContexts: {
						entityType: oEntityTypeContext,
						entitySet: oEntitySetContext
					},
					models: {
						device: oDeviceModel,
						entityType: oMetaModel,
						entitySet: oMetaModel,
						ovpMeta: oMetaModel,
						ovpCardProperties: oOvpCardPropertiesModel,
						ovplibResourceBundle: pOvplibResourceBundle
					},
					ovpCardProperties: oOvpCardPropertiesModel,
					dataModel: oModel,
					_ovpCache: {}
				}
			};

			return jQuery.extend(true, {}, this.getCustomPreprocessor(), oDefaultPreprocessors);
		},

		_completeLayoutDefaults: function(oCardProperties, oSettings) {
			var oCardLayoutData = null,
				oComponentData = this.getComponentData(),
				oUiModel = null,
				oConfig = null,
				iRowHeightPx = null;
			if (oComponentData.appComponent) {
				oUiModel = oComponentData.appComponent.getModel("ui");
				oConfig = oComponentData.appComponent.getOvpConfig();
			}
			if (!oConfig) {
				return null;
			}
			if (oConfig.containerLayout === "resizable") {
				iRowHeightPx = oComponentData.appComponent.getDashboardLayoutUtil().getRowHeightPx();
				if (oSettings.defaultSpan) {
					oCardLayoutData = {
						cardLayout: {
							colSpan: oSettings.defaultSpan.cols,
							rowSpan: oSettings.defaultSpan.rows
						}
					};
				} else {
					//no defaultSapn
					oCardLayoutData = {
						cardLayout: {
							colSpan: 1,
							rowSpan: 12
						}
					};
				}

				//in resizable card layout each card may contain layout data -> use this if available
				var aDashboardLayoutData = oUiModel.getProperty("/initialDashboardLayout");
				var sCardId = oComponentData.cardId;
				for (var i = 0; i < aDashboardLayoutData.length; i++) {
					var oDashboardLayoutData = aDashboardLayoutData[i];
					if (oDashboardLayoutData[sCardId]) {
						oCardLayoutData.cardLayout = oDashboardLayoutData[sCardId];
						break;
					}
				}

				if (iRowHeightPx) {
					oCardLayoutData.cardLayout.iRowHeigthPx = iRowHeightPx;
					oCardLayoutData.cardLayout.iCardHeightPx = iRowHeightPx * oCardLayoutData.cardLayout.rowSpan;
				}

			} else {
                if (oConfig.cards[oComponentData.cardId] && oConfig.cards[oComponentData.cardId].template === "sap.ovp.cards.linklist") {
                    oCardLayoutData = {
                        cardLayout: {
                            items: 5
                        }
                    };
                }
			}

            //set container layout
            if (oCardLayoutData) {
                oCardLayoutData.cardLayout.containerLayout = oConfig.containerLayout;
            }

            return oCardLayoutData;
		},

		_getCardPropertyDefaults: function() {
			var oCardProperties = {};
			var oPropsDef = this.getMetadata().getAllProperties();
			var oPropDef;
			for (var propName in oPropsDef) {
				oPropDef = oPropsDef[propName];
				if (oPropDef.defaultValue !== undefined) {
					oCardProperties[oPropDef.name] = oPropDef.defaultValue;
				}
			}
			return oCardProperties;
		},

		getOvplibResourceBundle: function() {
			if (!this.ovplibResourceBundle) {
				var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ovp");
				this.ovplibResourceBundle = oResourceBundle ? new sap.ui.model.resource.ResourceModel({
					bundleUrl: oResourceBundle.oUrlInfo.url
				}) : null;
			}
			return this.ovplibResourceBundle;
		},

		createContent: function() {
			var oComponentData = this.getComponentData && this.getComponentData();
			var oModel = oComponentData.model;
			var pOvplibResourceBundle;
			var oPreprocessors;
			if (oComponentData && oComponentData.mainComponent) {
				pOvplibResourceBundle = oComponentData.mainComponent._getOvplibResourceBundle();				
			} else {
				pOvplibResourceBundle = this.getOvplibResourceBundle();
			}
			oPreprocessors = this.getPreprocessors(pOvplibResourceBundle);

			var oView;
			oView = sap.ui.view({
				preprocessors: oPreprocessors,
				type: sap.ui.core.mvc.ViewType.XML,
				viewName: "sap.ovp.cards.generic.Card"
			});

			oView.setModel(oModel);
			// check if i18n model is available and then add it to card view
			if (oComponentData.i18n) {
				oView.setModel(oComponentData.i18n, "@i18n");
			}
			oView.setModel(oPreprocessors.xml.ovpCardProperties, "ovpCardProperties");
			oView.setModel(pOvplibResourceBundle, "ovplibResourceBundle");
			
			return oView;
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
        getContentDensityClass: function () {
            if (this._sContentDensityClass === undefined) {
                // check whether FLP has already set the content density class; do nothing in this case
                if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
                    if (jQuery(document.body).hasClass("sapUiSizeCozy") === true) {
                        this._sContentDensityClass = "sapUiSizeCozy";
                    } else if (jQuery(document.body).hasClass("sapUiSizeCompact") === true) {
                        this._sContentDensityClass = "sapUiSizeCompact";
                    } else {
                        this._sContentDensityClass = "";
                    }
                } else if (!sap.ui.Device.support.touch) { // apply "compact" mode if touch is not supported
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        },

		_setCardpropertyDensityAttribute: function() {
			var sContentDensityClassName = this.getContentDensityClass();
			if (sContentDensityClassName === "sapUiSizeCompact") {
				return "compact";
			} else if (sContentDensityClassName === "sapUiSizeCozy") {
				return "cozy";
			} else if (!sap.ui.Device.support.touch) { // apply "compact" mode if touch is not supported
				return "compact";
			} else {
				// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
				return "cozy";
			}
		}

	});

})();