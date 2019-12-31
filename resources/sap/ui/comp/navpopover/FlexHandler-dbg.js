/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/comp/library', 'sap/ui/base/ManagedObject', 'sap/ui/comp/personalization/Util', './Util', './Factory', 'sap/ui/comp/personalization/Controller'
], function(jQuery, CompLibrary, ManagedObject, PersonalizationUtil, Util, Factory, Controller) {
	"use strict";

	/**
	 * Handler for communication with layered repository (LRep).
	 * 
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Communicates with the layered repository (LRep) and reacts on flexibility changes.
	 * @constructor
	 * @public
	 * @since 1.46.0
	 * @alias sap.ui.comp.navpopover.FlexHandler
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FlexHandler = ManagedObject.extend("sap.ui.comp.navpopover.FlexHandler", /** @lends sap.ui.comp.navpopover.FlexHandler */
	{
		constructor: function(sId, mSettings) {
			ManagedObject.apply(this, arguments);
		},
		metadata: {
			properties: {
				/**
				 * Initial state of all available actions. After the initial state has been set it cannot be changed again.
				 */
				initialSnapshot: {
					type: "object",
					defaultValue: null
				},
				/**
				 * Changes made only for USER layer.
				 */
				snapshotOfUserLayer: {
					type: "object",					
					defaultValue: null
				},
				/**
				 * Changes made for all layers except USER layer.
				 */
				snapshotOfLayersWithoutUser: {
					type: "object",
					defaultValue: null
				}
			}
		}
	});

	FlexHandler.prototype.applySettings = function(mSettings) {
		// Note: we have to initialize the properties 'snapshotOfUserLayer', 'snapshotOfLayersWithoutUser' and 'initialSnapshot' with an empty object
		// {} because the value of these properties still remains when new instance of FlexHandler is be created (reference of objects in
		// JavaScript).
		this.setInitialSnapshot({});
		this.setSnapshotOfUserLayer({});
		this.setSnapshotOfLayersWithoutUser({});

		ManagedObject.prototype.applySettings.apply(this, arguments);
	};

	FlexHandler.prototype.init = function() {
		if (JSON.parse(jQuery.sap.getUriParameters().get("sap-ui-smartlink"))) {
			Factory.getService("FlexConnector").activateApplyChangeStatistics();
		}
	};

	/**
	 * @private
	 */
	FlexHandler.prototype.updateAvailableActionOfSnapshot = function(oLinkData, sLayer) {
		if (!oLinkData || !sLayer) {
			return;
		}
		switch (sLayer) {
			case "USER":
				// Update only 'USER' snapshot
				var oSnapshot = this.getSnapshotOfUserLayer();
				oSnapshot[oLinkData.getKey()] = {
					key: oLinkData.getKey(),
					visible: oLinkData.getVisible()
				};
				this.setSnapshotOfUserLayer(oSnapshot);
				break;
			default:
				// Update all other snapshot
				var oSnapshot = this.getSnapshotOfLayersWithoutUser();
				oSnapshot[oLinkData.getKey()] = {
					key: oLinkData.getKey(),
					visible: oLinkData.getVisible()
				};
				this.setSnapshotOfLayersWithoutUser(oSnapshot);
		}
	};

	/**
	 * @private
	 */
	FlexHandler.prototype.discardAvailableActionsOfSnapshot = function(sLayer) {
		if (sLayer !== "USER") {
			return;
		}
		this.setSnapshotOfUserLayer({});
	};

	/**
	 * Current snapshot of available actions.
	 * 
	 * @private
	 */
	FlexHandler.prototype.determineSnapshotOfAvailableActions = function() {
		var oSnapshotOrigin = FlexHandler._getUnion(this.getInitialSnapshot(), this.getSnapshotOfLayersWithoutUser());
		var oSnapshotTotal = FlexHandler._getUnion(oSnapshotOrigin, this.getSnapshotOfUserLayer());
		return oSnapshotTotal;
	};

	/**
	 * Difference between initial snapshot and current snapshot.
	 * 
	 * @private
	 */
	FlexHandler.prototype.determineSnapshotOfChangedAvailableActions = function() {
		var oSnapshotTotal = this.determineSnapshotOfAvailableActions();
		var oSnapshotOfChanges = FlexHandler._getUnionCondensed(this.getInitialSnapshot(), oSnapshotTotal);
		return oSnapshotOfChanges;
	};

	/**
	 * @private
	 */
	FlexHandler.prototype.openSelectionDialog = function(oNavigationPopover) {
		var that = this;
		var oSnapshotOfLayersWithoutUserCopy = jQuery.extend(true, {}, this.getSnapshotOfLayersWithoutUser());
		var oSnapshotOfUserLayerCopy = jQuery.extend(true, {}, this.getSnapshotOfUserLayer());
		var oSnapshotOrigin = FlexHandler._getUnion(this.getInitialSnapshot(), oSnapshotOfLayersWithoutUserCopy);
		var oSnapshotTotal = FlexHandler._getUnion(oSnapshotOrigin, oSnapshotOfUserLayerCopy);

		return new Promise(function(resolve) {
			// TODO: due to performance reason - keep oController as member variable for the use-case that after OK (in Selection Dialog) the
			// Selection Dialog is opened again

			var bDialogConfirmedReset = false;

			var oController = new Controller({
				table: PersonalizationUtil.createSelectionWrapper(Util.getStorableAvailableActions(FlexHandler._convertSnapshotToObjectArray(oSnapshotOrigin)), false),
				resetToInitialTableState: true,
				afterP13nModelDataChange: function(oEvent) {
					oSnapshotTotal = FlexHandler._getUnion(oSnapshotTotal, oEvent.getParameter("changeData").selection ? FlexHandler.convertArrayToSnapshot("columnKey", oEvent.getParameter("changeData").selection.selectionItems) : {});
				},
				dialogConfirmedReset: function() {
					bDialogConfirmedReset = true;
				},
				dialogAfterClose: function() {
					var oBaseSnapshotForSave = bDialogConfirmedReset ? oSnapshotOrigin : FlexHandler._getUnion(oSnapshotOrigin, oSnapshotOfUserLayerCopy);
					if (bDialogConfirmedReset) {
						that._discardChanges(oNavigationPopover).then(function(bDiscarded) {
							if (!bDiscarded) {
								that._revertChanges(oNavigationPopover, oSnapshotOfLayersWithoutUserCopy, oSnapshotOfUserLayerCopy);
								return resolve();
							}
							that._saveChanges(oNavigationPopover, oBaseSnapshotForSave, oSnapshotTotal).then(function(bSaved) {
								if (!bSaved) {
									that._revertChanges(oNavigationPopover, oSnapshotOfLayersWithoutUserCopy, oSnapshotOfUserLayerCopy);
								}
								return resolve();
							});

						});
						return;
					}
					that._saveChanges(oNavigationPopover, oBaseSnapshotForSave, oSnapshotTotal).then(function(bSaved) {
						if (!bSaved) {
							that._revertChanges(oNavigationPopover, oSnapshotOfLayersWithoutUserCopy, oSnapshotOfUserLayerCopy);
						}
						return resolve();
					});
				}
			});

			// As variant we now set the changes of 'USER' layer
			oController.setPersonalizationData({
				selection: {
					selectionItems: FlexHandler._convertSnapshotToSelectionItems(oSnapshotOfUserLayerCopy)
				}
			});

			oController.openDialog({
				contentWidth: "25rem",
				contentHeight: "35rem",
				selection: {
					visible: true
				}
			});
		});
	};

	/**
	 * @private
	 */
	FlexHandler.prototype._revertChanges = function(oNavigationPopover, oSnapshotOfLayersWithoutUser, oSnapshotOfUserLayer) {
		this.setSnapshotOfLayersWithoutUser(oSnapshotOfLayersWithoutUser);
		this.setSnapshotOfUserLayer(oSnapshotOfUserLayer);
		oNavigationPopover._syncAvailableActions();
	};

	/**
	 * @private
	 */
	FlexHandler.prototype._discardChanges = function(oNavigationPopover) {
		return new Promise(function(resolve) {
			Factory.getService("FlexConnector").discardChangesForControl(oNavigationPopover, true).then(function() {
				return resolve(true);
			})['catch'](function(oError) {
				jQuery.sap.log.error("Changes could not be discarded in LRep: " + oError.status);
				return resolve(false);
			});
		});
	};

	/**
	 * @private
	 */
	FlexHandler.prototype._saveChanges = function(oNavigationPopover, oSnapshotBase, oSnapshotDelta) {
		var oSnapshotChanges = FlexHandler._getUnionCondensed(oSnapshotBase, oSnapshotDelta);
		var aChanges = FlexHandler._convertSnapshotToChangeFormat(oSnapshotChanges);
		var aMAddedLinks = aChanges.filter(function(oMLink) {
			return oMLink.visible === true;
		});
		var aMRemovedLinks = aChanges.filter(function(oMLink) {
			return oMLink.visible === false;
		});

		return new Promise(function(resolve) {
			Factory.getService("FlexConnector").createAndSaveChangesForControl(aMAddedLinks, aMRemovedLinks, oNavigationPopover).then(function() {
				return resolve(true);
			})['catch'](function(oError) {
				jQuery.sap.log.error("Changes could not be saved in LRep: " + oError.status);
				return resolve(false);
			});
		});
	};

	/**
	 * Updates only the existing items of <code>oSnapshotBase</code> from <code>oSnapshotDelta</code>.
	 * 
	 * @param {object} oSnapshotBase Object of format:
	 * 
	 * <pre>
	 * {
	 * 	key, text, visible, href, target, description
	 * }
	 * </pre>
	 * 
	 * @param {object} oSnapshotDelta Object of format:
	 * 
	 * <pre>
	 * {
	 * 	key, text, visible, href, target, description
	 * }
	 * </pre>
	 * 
	 * @private
	 */
	FlexHandler._getUnion = function(oSnapshotBase, oSnapshotDelta) {
		var oSnapshotBaseCopy = jQuery.extend(true, {}, oSnapshotBase);
		if (oSnapshotDelta) {
			for ( var sKey in oSnapshotBaseCopy) {
				if (oSnapshotDelta[sKey] && oSnapshotDelta[sKey].visible !== undefined) {
					oSnapshotBaseCopy[sKey].visible = oSnapshotDelta[sKey].visible;
				}
			}
		}
		return oSnapshotBaseCopy;
	};

	/**
	 * Similar to <code>_getUnion</code> method where equal items are not taken into account.
	 * 
	 * @param {object} oSnapshotBase Object of format:
	 * 
	 * <pre>
	 * {
	 * 	key, text, visible, href, target, description
	 * }
	 * </pre>
	 * 
	 * @param {object} oSnapshotDelta Object of format:
	 * 
	 * <pre>
	 * {
	 * 	key, text, visible, href, target, description
	 * }
	 * </pre>
	 * 
	 * @private
	 */
	FlexHandler._getUnionCondensed = function(oSnapshotBase, oSnapshotDelta) {
		var oSnapshotBaseCondensed = FlexHandler._condense(oSnapshotBase, oSnapshotDelta);
		var oSnapshotDeltaCondensed = FlexHandler._condense(oSnapshotDelta, oSnapshotBase);
		var oUnion = FlexHandler._getUnion(oSnapshotBaseCondensed, oSnapshotDeltaCondensed);
		return oUnion;
	};

	/**
	 * The result does not contain equal items.
	 * 
	 * @private
	 */
	FlexHandler._condense = function(oSnapshotBase, oSnapshotDelta) {
		var oSnapshotBaseCondensed = {};
		for ( var sKey in oSnapshotBase) {
			if (!PersonalizationUtil.semanticEqual(oSnapshotBase[sKey], oSnapshotDelta[sKey])) {
				oSnapshotBaseCondensed[sKey] = oSnapshotBase[sKey];
			}
		}
		return oSnapshotBaseCondensed;
	};

	/**
	 * @private
	 */
	FlexHandler.convertArrayToSnapshot = function(sKey, aItems) {
		var oSnapshot = {};
		aItems.forEach(function(oItem) {
			if (oItem[sKey] === undefined) {
				return;
			}
			oSnapshot[oItem[sKey]] = oItem;
		});
		return oSnapshot;
	};

	/**
	 * @private
	 */
	FlexHandler._convertSnapshotToObjectArray = function(oSnapshot) {
		return Object.keys(oSnapshot).map(function(sKey) {
			return oSnapshot[sKey];
		});
	};

	/**
	 * @private
	 */
	FlexHandler._convertSnapshotToSelectionItems = function(oSnapshot) {
		return FlexHandler._convertSnapshotToObjectArray(oSnapshot).map(function(oMLink) {
			return {
				columnKey: oMLink.key,
				visible: oMLink.visible
			};
		});
	};

	/**
	 * @private
	 */
	FlexHandler._convertSnapshotToChangeFormat = function(oSnapshot) {
		var aMLinks = FlexHandler._convertSnapshotToObjectArray(oSnapshot);
		return aMLinks.map(function(oMLink) {
			return {
				key: oMLink.key,
				visible: oMLink.visible
			};
		});
	};

	/* eslint-enable strict */
	return FlexHandler;
},
/* bExport= */true);
