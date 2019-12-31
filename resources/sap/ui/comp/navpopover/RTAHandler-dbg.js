/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/comp/library', 'sap/ui/comp/personalization/Controller', 'sap/ui/comp/personalization/Util', './Util', 'sap/ui/comp/navpopover/flexibility/changes/AddLink', 'sap/ui/comp/navpopover/flexibility/changes/RemoveLink', 'sap/ui/fl/changeHandler/JsControlTreeModifier', './Factory', './LinkData'
], function(jQuery, CompLibrary, Controller, PersonalizationUtil, Util, AddLink, RemoveLink, JsControlTreeModifier, Factory, LinkData) {
	"use strict";

	/**
	 * Runtime adaptation handler.
	 * 
	 * @constructor
	 * @private
	 * @since 1.44.0
	 * @alias sap.ui.comp.navpopover.RTAHandler
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RTAHandler = {};

	RTAHandler.isSettingsAvailable = function() {
		return !!Factory.getService("CrossApplicationNavigation") && Factory.getService("FlexConnector").isVendorLayer();
	};

	RTAHandler.getStableElements = function(oNavigationPopoverHandler) {
		if (!oNavigationPopoverHandler || !(oNavigationPopoverHandler instanceof sap.ui.comp.navpopover.NavigationPopoverHandler)) {
			return null;
		}
		var sStableID = oNavigationPopoverHandler.getNavigationPopoverStableId();
		if (!sStableID) {
			return null;
		}
		var oAppComponent = oNavigationPopoverHandler._getAppComponent();
		if (!oAppComponent) {
			return null;
		}
		return [
			{
				id: sStableID,
				appComponent: oAppComponent
			}
		];
	};

	RTAHandler.execute = function(oNavigationPopoverHandler, fGetUnsavedChanges) {
		return new Promise(function(resolve, reject) {
			if (!oNavigationPopoverHandler || !(oNavigationPopoverHandler instanceof sap.ui.comp.navpopover.NavigationPopoverHandler)) {
				return reject(new Error("oNavigationPopoverHandler is not of supported type sap.ui.comp.navpopover.NavigationPopoverHandler"));
			}
			var sStableID = oNavigationPopoverHandler.getNavigationPopoverStableId();
			if (!sStableID) {
				return reject(new Error("StableId is not defined. SemanticObject=" + oNavigationPopoverHandler.getSemanticObject()));
			}
			var oAppComponent = oNavigationPopoverHandler._getAppComponent();
			if (!oAppComponent) {
				return reject(new Error("AppComponent is not defined. oControl=" + oNavigationPopoverHandler.getControl()));
			}

			// Apply saved changes by creating NavigationPopover
			oNavigationPopoverHandler._getPopover().then(function(oNavigationPopover) {

				// Apply unsaved changes to NavigationPopover
				RTAHandler._applyUnsavedChanges(sStableID, fGetUnsavedChanges, oNavigationPopover, oAppComponent);

				var oSelectionWrapper = PersonalizationUtil.createSelectionWrapper(Util.getStorableAvailableActions(LinkData.convert2Json(oNavigationPopover.getAvailableActions())), true);
				oNavigationPopoverHandler._destroyPopover();

				var aChangeData = [];
				var oController = new Controller({
					table: oSelectionWrapper,
					afterP13nModelDataChange: function(oEvent) {
						aChangeData = oEvent.getParameters().changeData.selection ? oEvent.getParameters().changeData.selection.selectionItems : [];
					},
					dialogAfterClose: function() {
						var aChanges = RTAHandler._convertSelectionItemsToChangeFormat(aChangeData);
						var aChangesOfAddedLinks = aChanges.filter(function(oMLink) {
							return oMLink.visible === true;
						});
						var aChangesOfRemovedLinks = aChanges.filter(function(oMLink) {
							return oMLink.visible === false;
						});
						var aAddedLinks = RTAHandler._prepareResult(aChangesOfAddedLinks, sap.ui.comp.navpopover.ChangeHandlerType.addLink, sStableID, oAppComponent);
						var aRemovedLinks = RTAHandler._prepareResult(aChangesOfRemovedLinks, sap.ui.comp.navpopover.ChangeHandlerType.removeLink, sStableID, oAppComponent);
						resolve(aAddedLinks.concat(aRemovedLinks));
					}
				});

				oController.openDialog({
					contentWidth: "25rem",
					contentHeight: "35rem",
					showReset: false,
					selection: {
						visible: true
					}
				});
			});
		});
	};

	/**
	 * @private
	 */
	RTAHandler._convertSelectionItemsToChangeFormat = function(aMSelectionItems) {
		return aMSelectionItems.map(function(oMSelectionItem) {
			return {
				key: oMSelectionItem.columnKey,
				visible: oMSelectionItem.visible
			};
		});
	};

	/**
	 * @private
	 */
	RTAHandler._prepareResult = function(aMLinks, sChangeType, sStableID, oAppComponent) {
		return aMLinks.map(function(oMLink) {
			return {
				selectorControl: {
					id: sStableID,
					controlType: "sap.ui.comp.navpopover.NavigationPopover",
					appComponent: oAppComponent
				},
				changeSpecificData: {
					changeType: sChangeType,
					content: oMLink
				}
			};
		});
	};

	/**
	 * @private
	 */
	RTAHandler._applyUnsavedChanges = function(sStableID, fGetUnsavedChanges, oNavigationPopover, oAppComponent) {
		var aChanges = fGetUnsavedChanges(sStableID, [
			sap.ui.comp.navpopover.ChangeHandlerType.addLink, sap.ui.comp.navpopover.ChangeHandlerType.removeLink
		]);
		aChanges.forEach(function(oChange) {
			switch (oChange.getChangeType()) {
				case sap.ui.comp.navpopover.ChangeHandlerType.addLink:
					AddLink.applyChange(oChange, oNavigationPopover, {
						modifier: JsControlTreeModifier,
						appComponent: oAppComponent
					});
					break;
				case sap.ui.comp.navpopover.ChangeHandlerType.removeLink:
					RemoveLink.applyChange(oChange, oNavigationPopover, {
						modifier: JsControlTreeModifier,
						appComponent: oAppComponent
					});
					break;
			}
		});
	};

	return RTAHandler;
},
/* bExport= */true);
