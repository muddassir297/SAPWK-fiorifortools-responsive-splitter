/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
/*global Promise*/
// Provides object sap.ui.rta.Utils.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/fl/Utils',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/comp/odata/FieldSelectorModelConverter',
	'sap/ui/fl/registry/Settings'],
	function(jQuery, FlexUtils, OverlayUtil, FieldSelectorModelConverter, Settings) {
		"use strict";

		/**
		 * Class for Utils.
		 *
		 * @class Utility functionality to work with controls, e.g. iterate through aggregations, find parents, etc.
		 *
		 * @author SAP SE
		 * @version 1.46.2
		 *
		 * @private
		 * @static
		 * @since 1.30
		 * @alias sap.ui.rta.Utils
		 * @experimental Since 1.30. This class is experimental and provides only limited functionality.
		 * API of this class might be changed in the future.
		 */

		var Utils = {};

		Utils.RESOLVED_PROMISE = Promise.resolve(true);

		Utils._sFocusableOverlayClass = ".sapUiDtOverlaySelectable";

		/**
		 * Utility function to check if extensibility is enabled in the current system
		 *
		 * @param {sap.ui.core.Control} oControl - Control to be checked
		 * @returns {Promise} resolves a boolean
		 */
		Utils.isExtensibilityEnabledInSystem = function(oControl) {
			var sComponentName = FlexUtils.getComponentClassName(oControl);
			if (!sComponentName || sComponentName == "") {
				return Promise.resolve(false);
			}
			return Settings.getInstance(sComponentName).then(function(oSettings) {
				if (oSettings.isModelS) {
					return oSettings.isModelS();
				}
				return false;
			});
		};

		/**
		 * Utility function for retrieving designtime metadata from the parent for a specified overlay object
		 *
		 * @param {sap.ui.dt.Overlay} oOverlay - Overlay object
		 * @returns {Object|undefined} Metadata object or false if there is no aggregation
		 */
		Utils.getPublicParentDesigntimeMetadata = function(oOverlay) {
			var oPublicParentAggregationOverlay = oOverlay.getPublicParentAggregationOverlay();
			if (oPublicParentAggregationOverlay) {
				return oPublicParentAggregationOverlay.getDesignTimeMetadata();
			}
		};

		/**
		 * Utility function to check if the public parent element has a stable id
		 *
		 * @param  {sap.ui.dt.Overlay} oOverlay - Overlay object
		 * @return {boolean} true if parent has stable Id, otherwise false
		 */
		Utils.hasParentStableId = function(oOverlay) {
			var oBlockOverlay = oOverlay.getPublicParentElementOverlay();
			var oBlock = oBlockOverlay ? oBlockOverlay.getElementInstance() : null;

			return oBlock && FlexUtils.checkControlId(oBlock);
		};

		/**
		 * Utility function to check if the OData service is updated in the meantime
		 *
		 * @param {sap.ui.core.Control} oControl - Control to be checked
		 * @returns {Promise} resolves if service is up to date, rejects otherwise
		 */
		Utils.isServiceUpToDate = function(oControl) {
			return this.isExtensibilityEnabledInSystem(oControl).then(function(bEnabled) {
				if (bEnabled) {
					jQuery.sap.require("sap.ui.fl.fieldExt.Access");
					var oModel = oControl.getModel();
					if (oModel) {
						var bServiceOutdated = sap.ui.fl.fieldExt.Access.isServiceOutdated(oModel.sServiceUrl);
						if (bServiceOutdated) {
							sap.ui.fl.fieldExt.Access.setServiceValid(oModel.sServiceUrl);
							//needs FLP to trigger UI restart popup
							sap.ui.getCore().getEventBus().publish("sap.ui.core.UnrecoverableClientStateCorruption","RequestReload",{});
							return Promise.reject();
						}
					}
				}
			});
		};

		/**
		 * Utility function to check via backend calls if the custom field button shall be enabled or not
		 *
		 * @param {sap.ui.core.Control} oControl - Control to be checked
		 * @returns {Boolean} true if CustomFieldCreation functionality is to be enabled, false if not
		 */
		Utils.isCustomFieldAvailable = function(oControl) {
			return this.isExtensibilityEnabledInSystem(oControl).then(function(bShowCreateExtFieldButton) {
				if (!bShowCreateExtFieldButton) {
					return false;
				} else if (!oControl.getModel()) {
					return false;
				} else {
					var sServiceUrl = oControl.getModel().sServiceUrl;
					var sEntityType = this.getBoundEntityType(oControl);
					try {
						jQuery.sap.require("sap.ui.fl.fieldExt.Access");
						var oJQueryDeferred = sap.ui.fl.fieldExt.Access.getBusinessContexts(sServiceUrl,
								sEntityType);
						return Promise.resolve(oJQueryDeferred).then(function(oResult) {
							if (oResult) {
								if (oResult.BusinessContexts) {
									if (oResult.BusinessContexts.length > 0) {
										oResult.EntityType = sEntityType;
										return oResult;
									}
								}
							} else {
								return false;
							}
						}).catch(function(oError){
							if (oError) {
								if (jQuery.isArray(oError.errorMessages)) {
									for (var i = 0; i < oError.errorMessages.length; i++) {
										jQuery.sap.log.error(oError.errorMessages[i].text);
									}
								}
							}
							return false;
						});
					} catch (oError) {
						jQuery.sap.log
								.error("exception occured in sap.ui.fl.fieldExt.Access.getBusinessContexts", oError);
						return false;
					}
				}
			}.bind(this));
		};

		/**
		 * Opens a confirmation dialog indicating mandatory fields if necessary.
		 *
		 * @param {Object} oElement - The analyzed control
		 * @param {String} sText - Custom text for the dialog
		 * @return {Promise} The Promise which resolves when popup is closed (via Remove OR Cancel actions)
		 */
		Utils.openRemoveConfirmationDialog = function(oElement, sText) {
			var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			var sTitle;
			return new Promise(
				function(resolve, reject) {

					sTitle = oTextResources.getText("CTX_REMOVE_TITLE");

					// create some dummy JSON data and create a Model from it
					var data = {
						messageText : sText,
						titleText : sTitle,
						icon : "sap-icon://question-mark",
						removeText : oTextResources.getText("BTN_FREP_REMOVE"),
						cancelText : oTextResources.getText("BTN_FREP_CANCEL")
					};
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(data);

					var oFragmentDialog;
					var fnCleanUp = function() {
						if (oFragmentDialog) {
							oFragmentDialog.close();
							oFragmentDialog.destroy();
							oFragmentDialog = null;
						}
					};

					// create a controller for the action in the Dialog
					var oFragmentController = {
						removeField : function() {
							fnCleanUp();
							resolve(true);
						},
						closeDialog : function() {
							fnCleanUp();
							resolve(false);
						}
					};

					// instantiate the Fragment if not done yet
					if (!oFragmentDialog) {
						oFragmentDialog = sap.ui.xmlfragment("sap.ui.rta.view.RemoveElementDialog", oFragmentController);
						oFragmentDialog.setModel(oModel);
					}
					oFragmentDialog.open();
				}
			);
		};

		/**
		 * Checks if overlay is selectable in RTA (selectable also means focusable for RTA)
		 *
		 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay object
		 * @returns {boolean} if it's selectable
		 * @private
		 */
		Utils.isOverlaySelectable = function(oOverlay) {
			// check the real DOM visibility should be preformed while oOverlay.isVisible() can be true, but if element
			// has no geometry, overlay will not be visible in UI
			return oOverlay.isSelectable() && oOverlay.$().is(":visible");
		};

		/**
		 * Utility function for retrieving property values for a specified Element
		 *
		 * @param {sap.ui.core.Element} oElement - Any element
		 * @param {String} sPropertyName - Name of the property
		 * @returns {*} value of the property, could be any value
		 */
		Utils.getPropertyValue = function(oElement, sPropertyName) {
			var oMetadata = oElement.getMetadata().getPropertyLikeSetting(sPropertyName);
			var sPropertyGetter = oMetadata._sGetter;
			return oElement[sPropertyGetter]();
		};

		/**
		 * Returns overlay instance for an overlay's dom element
		 *
		 * @param {document.documentElement} oDomRef - DOM Element
		 * @returns {sap.ui.dt.ElementOverlay} Overlay object
		 * @private
		 */
		Utils.getOverlayInstanceForDom = function(oDomRef) {
			var sId = jQuery(oDomRef).attr("id");
			if (sId) {
				return sap.ui.getCore().byId(sId);
			}
		};

		/**
		 * Returns the focused overlay
		 *
		 * @returns {sap.ui.dt.ElementOverlay} Overlay object
		 * @private
		 */
		Utils.getFocusedOverlay = function() {
			if (document.activeElement) {
				var oElement = sap.ui.getCore().byId(document.activeElement.id);
				if (oElement instanceof sap.ui.dt.ElementOverlay) {
					return oElement;
				}
			}
		};

		/**
		 * Returns the first focusable child overlay
		 *
		 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay object
		 * @returns {sap.ui.dt.ElementOverlay} Found overlay object
		 * @private
		 */
		Utils.getFirstFocusableChildOverlay = function(oOverlay) {
			var oFirstFocusableChildOverlay = OverlayUtil.getFirstChildOverlay(oOverlay);

			while (oFirstFocusableChildOverlay && !this.isOverlaySelectable(oFirstFocusableChildOverlay)) {
				oFirstFocusableChildOverlay = OverlayUtil.getNextSiblingOverlay(oFirstFocusableChildOverlay);
			}
			return oFirstFocusableChildOverlay;
		};

		/**
		 * Returns the next focusable sibling overlay
		 *
		 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay object
		 * @returns {sap.ui.dt.ElementOverlay} Found overlay object
		 * @private
		 */
		Utils.getNextFocusableSiblingOverlay = function(oOverlay) {
			var oNextFocusableSiblingOverlay = OverlayUtil.getNextSiblingOverlay(oOverlay);

			while (oNextFocusableSiblingOverlay && !this.isOverlaySelectable(oNextFocusableSiblingOverlay)) {
				oNextFocusableSiblingOverlay = OverlayUtil.getNextSiblingOverlay(oNextFocusableSiblingOverlay);
			}
			return oNextFocusableSiblingOverlay;
		};

		/**
		 * Returns the previous focusable sibling overlay
		 *
		 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay object
		 * @returns {sap.ui.dt.ElementOverlay} Found overlay object
		 * @private
		 */
		Utils.getPreviousFocusableSiblingOverlay = function(oOverlay) {
			var oPreviousFocusableSiblingOverlay = OverlayUtil.getPreviousSiblingOverlay(oOverlay);

			while (oPreviousFocusableSiblingOverlay && !this.isOverlaySelectable(oPreviousFocusableSiblingOverlay)) {
				oPreviousFocusableSiblingOverlay = OverlayUtil
						.getPreviousSiblingOverlay(oPreviousFocusableSiblingOverlay);
			}
			return oPreviousFocusableSiblingOverlay;
		};

		/**
		 * Utility function for retrieving Element position in the specified Parent
		 *
		 * @param {sap.ui.core.Element} oParentElement - Parent Element
		 * @param {sap.ui.core.Element} oChildElement - Element which position is being looked for
		 * @param {String} sAggregationName - Aggregation name
		 * @param {Function} [fnGetIndex] - Custom handler for retreiving index
		 * @returns {Number} index of the element
		 */
		Utils.getIndex = function(oParentElement, oChildElement, sAggregationName, fnGetIndex) {
			var iIndex;
			if (fnGetIndex && typeof fnGetIndex === "function") {
				// fnGetIndex usually comes from designtime metadata, so aggregation name is clear and available in it
				iIndex = fnGetIndex.call(null, oParentElement, oChildElement);
			} else {
				var oMetadata = oParentElement.getMetadata();
				var oAggregation = oMetadata.getAggregation(sAggregationName);
				var sGetter = oAggregation._sGetter;
				var aContainers = oParentElement[sGetter]();

				if (oChildElement) {
					iIndex = aContainers.indexOf(oChildElement) + 1;
				} else {
					iIndex = aContainers.length;
				}
			}
			return iIndex;
		};

		/**
		 * Creates a unique id for a new control based on its parent control, entityType and binding path.
		 *
		 * @param {*} oParentControl - Parent control.
		 * @param {String} sEntityType - EntityType which is bound to the parent control
		 * @param {String} sBindingPath - Binding path of the control for which a new Id should be created
		 * @returns {String} New string Id
		 * @private
		 */
		Utils.createFieldLabelId = function(oParentControl, sEntityType, sBindingPath) {
			return (oParentControl.getId() + "_" + sEntityType + "_" + sBindingPath).replace("/", "_");
		};

		/**
		 * Secure extract a label from an element
		 *
		 * @param {sap.ui.core.Element} oElement - Any Object
		 * @param {Function} [fnFunction] - Custom function for retrieving label
		 * @return {String|undefined} Label string or undefined
		 */
		Utils.getLabelForElement = function(oElement, fnFunction) {
			// if there is a function, only the function is executed
			if (fnFunction) {
				return fnFunction(oElement);
			} else {
				// first try getText(), then getlabelText(), if not available try getLabel().getText(), then getTitle(), then getId()
				var sFieldLabel = oElement.getText && oElement.getText();
				if (!sFieldLabel) {
					sFieldLabel = oElement.getLabelText && oElement.getLabelText();
				}
				if (!sFieldLabel) {
					sFieldLabel = oElement.getLabel && oElement.getLabel();
					if (sFieldLabel && sFieldLabel.getText){
						sFieldLabel = sFieldLabel.getText();
					}
				}
				if (!sFieldLabel) {
					sFieldLabel = oElement.getTitle && oElement.getTitle();
				}
				if (!sFieldLabel) {
					sFieldLabel = oElement.getId && oElement.getId();
				}
				return (typeof sFieldLabel) === "string" ? sFieldLabel : undefined;
			}
		};

		/**
		 * Secure extract path for a binding info.
		 *
		 * @param {Object} oInfo - Any Object
		 * @param {Object} mBindingInfo - Object with binding information
		 * @return {String|undefined} The path string or undefined
		 */
		Utils.getPathFromBindingInfo = function(oInfo, mBindingInfo) {
			var sPath = mBindingInfo[oInfo] ? mBindingInfo[oInfo] : undefined;
			if (sPath) {
				if ((sPath.parts instanceof Array) && sPath.parts.length > 0) {
					sPath = sPath.parts[0] ? sPath.parts[0] : undefined;
				}
				sPath = ((typeof sPath.path) === "string") ? sPath.path : sPath;
			}
			if ((typeof sPath) === "string") {
				sPath = sPath;
			} else {
				sPath = undefined;
			}
			return sPath;
		};

		/**
		 * Get the entity type based on the binding of a control
		 *
		 * @param {sap.ui.core.Element} oElement - Any Object
		 * @param {sap.ui.model.odata.ODataModel} oModel - Data model
		 * @return {String} Entity type without namespace
		 */
		Utils.getBoundEntityType = function(oElement, oModel) {
			var _oModel = oModel ? oModel : oElement.getModel();
			var oBindingContext = oElement.getBindingContext();
			if (oBindingContext) {
				var oEntityTypeMetadata = _oModel.oMetadata._getEntityTypeByPath(oBindingContext.getPath());
				return oEntityTypeMetadata.name;
			}
			return "";
		};

		/**
		 * Allow window.open to be stubbed in tests
		 *
		 * @param {String} sUrl - url string
		 */
		Utils.openNewWindow = function(sUrl) {
			window.open(sUrl, "_blank");
		};

		/**
		 * Function to find the binding paths of a given UI5 Element
		 *
		 * @param {sap.ui.core.Element} oElement - Element for which the binding info should be found
		 * @returns {Object} valueProperty: the name of the property which is bound
		 * @private
		 */
		Utils.getElementBindingPaths = function(oElement) {
			var aPaths = {};
			if (oElement.mBindingInfos) {
				for ( var oInfo in oElement.mBindingInfos) {
					var sPath = oElement.mBindingInfos[oInfo].parts[0].path
							? oElement.mBindingInfos[oInfo].parts[0].path
							: "";
					sPath = sPath.split("/")[sPath.split("/").length - 1];
					aPaths[sPath] = {
							valueProperty : oInfo
					};
				}
			}
			return aPaths;
		};

		/**
		 * Function to get the Fiori2 Renderer
		 *
		 * @returns {sap.ushell.renderers.fiori2.Renderer|undefined} renderer or null if there is no one
		 */
		Utils.getFiori2Renderer = function() {
			var oContainer = Utils.getUshellContainer() || {};
			return typeof oContainer.getRenderer === "function" ? oContainer.getRenderer("fiori2") : undefined;
		};

		/**
		 * Function to get the Fiori Container
		 *
		 * @returns {Object|undefined} ushell container or null if there is no one
		 */
		Utils.getUshellContainer = function() {
			return sap.ushell && sap.ushell.Container;
		};

		return Utils;
	}, /* bExport= */true);
