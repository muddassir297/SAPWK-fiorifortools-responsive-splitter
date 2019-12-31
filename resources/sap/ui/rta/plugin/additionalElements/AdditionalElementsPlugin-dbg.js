/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define(["jquery.sap.global", "sap/ui/rta/plugin/Plugin", 'sap/ui/dt/ElementUtil', 'sap/ui/dt/OverlayRegistry', 'sap/ui/rta/Utils', 'sap/ui/core/StashedControlSupport', 'sap/ui/dt/ElementDesignTimeMetadata'],function(jQuery, Plugin, ElementUtil, OverlayRegistry, Utils, StashedControlSupport, ElementDesignTimeMetadata){
	"use strict";

	function _getParents(bSibling, oOverlay) {
		var oParentOverlay, oPublicParentOverlay;
		if (bSibling) {
			oParentOverlay = oOverlay.getParentElementOverlay();
			oPublicParentOverlay = oOverlay.getPublicParentElementOverlay();
		} else {
			oParentOverlay = oOverlay;
			if (oOverlay.isInHiddenTree()){
				oPublicParentOverlay = oOverlay.getPublicParentElementOverlay();
			} else {
				oPublicParentOverlay = oOverlay;
			}
		}
		return {
			publicParentOverlay : oPublicParentOverlay,
			parentOverlay : oParentOverlay,
			publicParent : oPublicParentOverlay.getElementInstance(),
			parent : oParentOverlay.getElementInstance()
		};
	}

	function _defaultGetAggregationName(oParent, oChild) {
		return oChild.sParentAggregationName;
	}

	function _getInvisibleElements (oElement, sAggregationName){
		var aInvisibleElements = ElementUtil.getAggregation(oElement, sAggregationName).filter(function(oElement){
			return oElement.getVisible && !oElement.getVisible();
		});
		var aStashedControls = StashedControlSupport.getStashedControls(oElement.getId());
		return aInvisibleElements.concat(aStashedControls);
	}

	function _getRevealActions (bSibling, oOverlay) {
		var mParents = _getParents(bSibling, oOverlay);

		var mReveal = {};
		if (oOverlay.isInHiddenTree()){
			mReveal = _getTypesForInHiddenTree(mReveal, mParents);
		} else {
			mReveal = _getTypesForNotInHiddenTree(mReveal, mParents, bSibling, oOverlay);
		}

		return mReveal;
	}

	function _getTypesForInHiddenTree(mReveal, mParents) {
		var oDesignTimeMetadata = mParents.publicParentOverlay.getDesignTimeMetadata();
		var mRevealAction = oDesignTimeMetadata && oDesignTimeMetadata.getAggregationAction("reveal", mParents.parent)[0];
		if (mRevealAction && mRevealAction.changeType && sap.ui.rta.plugin.Plugin.prototype.hasChangeHandler(mRevealAction.changeType, mParents.publicParent)) {
			if (!mRevealAction.getAggregationName){
				mRevealAction.getAggregationName = _defaultGetAggregationName;
			}
			var fnGetInvisibleElements = mRevealAction.getInvisibleElements || _getInvisibleElements;
			var aInvisibleElements = fnGetInvisibleElements(mParents.publicParent, mRevealAction.aggregation);

			mReveal[mRevealAction.aggregation] = {
				reveal : {
					elements : aInvisibleElements,
					types : aInvisibleElements.reduce(function(mInvisibleTypes, oElement){
						mInvisibleTypes[oElement.getMetadata().getName()] = {
							designTimeMetadata : oDesignTimeMetadata,
							action : mRevealAction
						};
						return mInvisibleTypes;
					}, {})
				}
			};
		}
		return mReveal;
	}

	function _getTypesForNotInHiddenTree(mReveal, mParents, bSibling, oOverlay) {
		var aParents = [mParents.parentOverlay];
		var oRelevantContainer = _getRelevantContainer(mParents.parent, mParents.parentOverlay.getDesignTimeMetadata());
		if (oRelevantContainer !== mParents.parent){
			aParents = ElementUtil.findAllSiblingsInContainer(mParents.parent, oRelevantContainer).map(function(oParent){
				return OverlayRegistry.getOverlay(oParent);
			});
		}
		var aAggregationNames;
		if (bSibling){
			aAggregationNames = [oOverlay.getElementInstance().sParentAggregationName];
		}
		aAggregationNames = mParents.parentOverlay.getAggregationOverlays().filter(function(oAggregationOverlay){
			return !oAggregationOverlay.getDesignTimeMetadata().isIgnored();
		}).map(function(oAggregationOverlay){
			return oAggregationOverlay.getAggregationName();
		});
		mReveal = aAggregationNames.reduce(_getRevealActionFromAggregations.bind(null, aParents), {});
		return mReveal;
	}

	function _getRevealActionFromAggregations(aParents, _mReveal, sAggregationName){
		var aInvisibleElements = aParents.reduce(function(aInvisibleChilden, oParentOverlay){
			return aInvisibleChilden.concat(_getInvisibleElements(oParentOverlay.getElementInstance(), sAggregationName));
		}, []);

		var mTypes = aInvisibleElements.reduce(function(mTypes, oElement){
			var sType = oElement.getMetadata().getName();
			if (!mTypes[sType]){
				//TODO Fix if we have the stashed type info
				if (sType === "sap.ui.core._StashedControl"){
					mTypes[sType] = _fakeStashedControlInfos();
				} else {
					var oOverlay = OverlayRegistry.getOverlay(oElement);
					if (oOverlay) {
						var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
						var mRevealAction = oDesignTimeMetadata && oDesignTimeMetadata.getAction("reveal", oElement);
						if (mRevealAction && mRevealAction.changeType && sap.ui.rta.plugin.Plugin.prototype.hasChangeHandler(mRevealAction.changeType, oElement)) {
							if (!mRevealAction.getAggregationName){
								mRevealAction.getAggregationName = _defaultGetAggregationName;
							}
							mTypes[sType] = {
								designTimeMetadata : oDesignTimeMetadata,
								action : mRevealAction
							};
						}
					}
				}
			}
			return mTypes;
		}, {});
		if (aInvisibleElements.length > 0 && Object.keys(mTypes).length > 0){
			_mReveal[sAggregationName] = {
				reveal : {
					elements : aInvisibleElements,
					types : mTypes
				}
			};
		}
		return _mReveal;
	}

	function _getAddODataPropertyActions (bSibling, oOverlay) {
		var mParents = _getParents(bSibling, oOverlay);

		var oDesignTimeMetadata = mParents.publicParentOverlay.getDesignTimeMetadata();
		var aActions = oDesignTimeMetadata.getAggregationAction("addODataProperty", mParents.parent);

		var mAddODataProperty = aActions.reduce(function(_mAddODataProperty, mAction){
			if (mAction.changeType && sap.ui.rta.plugin.Plugin.prototype.hasChangeHandler(mAction.changeType, mParents.parent)) {
				_mAddODataProperty[mAction.aggregation] = {
					addODataProperty : {
						designTimeMetadata : oDesignTimeMetadata,
						action : mAction
					}
				};
			}
			return _mAddODataProperty;
		}, {});

		return mAddODataProperty;
	}

	function _getActions (bSibling, oOverlay) {
		var mRevealActions = _getRevealActions(bSibling, oOverlay);
		var mAddODataPropertyActions = _getAddODataPropertyActions(bSibling, oOverlay);

		//join and condense both action data
		var mOverall = jQuery.extend(true, mRevealActions, mAddODataPropertyActions);
		var aAggregationNames = Object.keys(mOverall);
		if (aAggregationNames.length === 0){
			return {};
		} else if (aAggregationNames.length > 1){
			jQuery.sap.log.error("reveal or addODataProperty action defined for more than 1 aggregation, that is not yet possible");
		}
		var sAggregationName = aAggregationNames[0];
		mOverall[sAggregationName].aggregation = sAggregationName;
		return mOverall[sAggregationName];
	}

	var SINGULAR = true, PLURAL = false;
	function _getText (sRtaTextKey, mActions, oParentElement, bSingular) {
		var aNames = [];
		var mControlType;
		var sControlType;
		if (mActions.addODataProperty){
			var sAggregationName = mActions.aggregation;
			var oDesignTimeMetadata = mActions.addODataProperty.designTimeMetadata;
			mControlType = oDesignTimeMetadata.getAggregationDescription(sAggregationName, oParentElement);
			if (mControlType) {
				sControlType = bSingular ? mControlType.singular : mControlType.plural;
				aNames.push(sControlType);
			}
		}
		if (mActions.reveal){
			Object.keys(mActions.reveal.types).forEach(function(sType){
				var mType = mActions.reveal.types[sType];
				mControlType = mType.designTimeMetadata.getName(oParentElement);
				if (mControlType) {
					sControlType = bSingular ? mControlType.singular : mControlType.plural;
					aNames.push(sControlType);
				}
			});
		}
		var aNonDuplicateNames = aNames.reduce(function(_aNames, sName){
			if (_aNames.indexOf(sName) === -1) {
				_aNames.push(sName);
			}
			return _aNames;
		}, []);


		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

		if (aNonDuplicateNames.length === 1) {
			sControlType = aNonDuplicateNames[0];
		} else {
			sControlType = oTextResources.getText("MULTIPLE_CONTROL_NAME");
		}
		return oTextResources.getText(sRtaTextKey, sControlType);
	}

	function _getRelevantContainer(oParentElement, oDesignTimeMetadata) {
		if (oDesignTimeMetadata.getData().getRelevantContainer) {
			return oDesignTimeMetadata.getData().getRelevantContainer(oParentElement);
		} else {
			return oParentElement;
		}
	}

	function _fakeStashedControlInfos() {
		return {
			designTimeMetadata : new ElementDesignTimeMetadata(
				{
					data : {
						name : {
							singular : function(){
								return sap.uxap.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME");
							},
							plural : function(){
								return sap.uxap.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME_PLURAL");
							}
						},
						actions : {
							reveal : {
								changeType : "unstashControl",
								getAggregationName : _defaultGetAggregationName
							}
						}
					}
				}
			),
			action : {
				changeType : "unstashControl",
				getAggregationName : _defaultGetAggregationName
			}
		};
	}

	/**
	 * Constructor for a new Additional Elements Plugin.
	 *
	 * The AdditionalElementsPlugin should handle the orchestration
	 * of the AdditionalElementsAnalyzer, the dialog and the command creation
	 *
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The plugin allows to add additional elements that exist either hidden in the UI or in the OData service
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version 1.46.2
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var AdditionalElementsPlugin = Plugin.extend("sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin", {
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {
				analyzer: "object", //sap.ui.rta.plugin.additionalElements.AdditionalElementsAnalyzer
				dialog: "object", //sap.ui.rta.plugin.additionalElements.AddElementsDialog
				commandFactory: "object"
			},
			associations: {},
			events: {}
		},

		getContextMenuTitle: function(bOverlayIsSibling, oOverlay){
			var mParents = _getParents(bOverlayIsSibling, oOverlay);
			var mActions = _getActions(bOverlayIsSibling, oOverlay);
			return _getText("CTX_ADD_ELEMENTS", mActions, mParents.parent, SINGULAR);
		},

		isAvailable: function(bOverlayIsSibling, oOverlay){
			return this._isEditable(oOverlay, bOverlayIsSibling);
		},

		isEnabled: function(bOverlayIsSibling, oOverlay){
			if (bOverlayIsSibling) {
				if (!Utils.hasParentStableId(oOverlay)) {
					return false;
				}
			}
			var mActions = _getActions(bOverlayIsSibling, oOverlay);
			if (mActions.reveal && mActions.reveal.elements.length === 0 && !mActions.addODataProperty){
				return false;
			}
			return true;
		},

		showAvailableElements: function(bOverlayIsSibling, aOverlay) {
			var oOverlay = aOverlay[0];
			var mParents = _getParents(bOverlayIsSibling, oOverlay);
			var oSiblingElement = bOverlayIsSibling && oOverlay.getElementInstance();
			var aPromises = [];

			var mActions = _getActions(bOverlayIsSibling, oOverlay);
			if (mActions.reveal) {
				aPromises.push(this.getAnalyzer().enhanceInvisibleElements(mParents.publicParent, mActions.reveal));
			}
			if (mActions.addODataProperty){
				mActions.addODataProperty.relevantContainer = _getRelevantContainer(mParents.publicParent, mActions.addODataProperty.designTimeMetadata);
				aPromises.push(this.getAnalyzer().getUnboundODataProperties(mParents.publicParent, mActions.addODataProperty));
			}
			if (mActions.aggregation) {
				this._setDialogTitle(mActions, mParents.parent);
			}

			return Promise.resolve().then(function(){
				if (mActions.addODataProperty){
					return Utils.isServiceUpToDate(mParents.parent);
				}
			}).then(function() {
				if (mActions.addODataProperty){
					return Utils.isCustomFieldAvailable(mParents.parent);
				}
			}).then(function(oCurrentFieldExtInfo) {
				if (oCurrentFieldExtInfo) {
					this._oCurrentFieldExtInfo = oCurrentFieldExtInfo;
					this.getDialog().setCustomFieldEnabled(true);
					this.getDialog().detachEvent('openCustomField', this._onOpenCustomField, this);
					this.getDialog().attachEvent('openCustomField', null, this._onOpenCustomField, this);
				}
			}.bind(this)).then(
				_getAllElements.bind(null, aPromises)
			).then(function(aAllElements){
				this.getDialog().setElements(aAllElements);

				return this.getDialog().open().then(function() {
					this._createCommands(bOverlayIsSibling, oOverlay, mParents, oSiblingElement, mActions.designTimeMetadata, mActions);
				}.bind(this)).catch(function(oError){
					//no error means canceled dialog
					if (oError instanceof Error){
						throw oError;
					}
				});
			}.bind(this)).catch(function(oError){
				if (oError instanceof Error){
					throw oError;
				} else {
					jQuery.sap.log.info("Service not up to date, skipping add dialog", "sap.ui.rta");
				}
			});
		},

		_setDialogTitle : function(mActions, oParentElement){
			var sDialogTitle = _getText("HEADER_ADDITIONAL_ELEMENTS", mActions, oParentElement, PLURAL);
			this.getDialog().setTitle(sDialogTitle);
		},
		/**
		 * Function called when custom field button was pressed
		 *
		 * @param {sap.ui.base.Event}
		 *		  oEvent event object
		 */
		_onOpenCustomField : function (oEvent) {
			// open field ext ui
			var oCrossAppNav = sap.ushell && sap.ushell.Container
			&& sap.ushell.Container.getService("CrossApplicationNavigation");
			var sHrefForFieldExtensionUi = (oCrossAppNav && oCrossAppNav.hrefForExternal({
				target : {
					semanticObject : "CustomField",
					action : "develop"
				},
				params : {
					businessContexts : this._oCurrentFieldExtInfo.BusinessContexts,
					serviceName : this._oCurrentFieldExtInfo.ServiceName,
					serviceVersion : this._oCurrentFieldExtInfo.ServiceVersion,
					entityType : this._oCurrentFieldExtInfo.EntityType
				}
			}));
			Utils.openNewWindow(sHrefForFieldExtensionUi);
		},

		_createCommands : function(bSibling, oOverlay, mParents, oSiblingElement, oDesignTimeMetadata, mActions) {

			var aSelectedElements = this.getDialog().getSelectedElements();

			if (aSelectedElements.length > 0) {
				//at least on element selected
				var oCompositeCommand = this.getCommandFactory().getCommandFor(mParents.parent, "composite");
				aSelectedElements.forEach(function(oSelectedElement){
					var oCmd;
					switch (oSelectedElement.type) {
						case "invisible":
							oCmd = this._createRevealCommandForInvisible(oSelectedElement, mActions, mParents, oSiblingElement);
							oCompositeCommand.addCommand(oCmd);

							oCmd = this._createMoveCommandForInvisible(oSelectedElement, mActions, mParents, oSiblingElement);
							if (oCmd) {
								oCompositeCommand.addCommand(oCmd);
							} else {
								jQuery.sap.log.warning("No move action configured for " + mParents.publicParent.getMetadata().getName() + ", aggregation: " + mActions.aggregation , "sap.ui.rta");
							}
							break;
						case "odata":
							oCmd = this._createCommandsForOData(oSelectedElement, mActions, mParents, oSiblingElement);
							oCompositeCommand.addCommand(oCmd);
							break;
						default:
							// FIXME: specify default behavior
					}
				}, this);
				this.fireElementModified({
					"command" : oCompositeCommand
				});
			}
		},

		_createCommandsForOData: function(oSelectedElement, mActions, mParents, oSiblingElement) {
			var oPublicParentDesignTimeMetadata = mActions.addODataProperty.designTimeMetadata;
			var oPublicAggregationDesignTimeMetadata = oPublicParentDesignTimeMetadata.createAggregationDesignTimeMetadata(mActions.aggregation);
			var iAddTargetIndex = Utils.getIndex(mParents.parent, oSiblingElement, mActions.aggregation, oPublicAggregationDesignTimeMetadata.getData().getIndex);
			return this.getCommandFactory().getCommandFor(mParents.publicParent, "addODataProperty", {
				newControlId: Utils.createFieldLabelId(mParents.publicParent, oSelectedElement.entityType, oSelectedElement.bindingPath),
				index : iAddTargetIndex,
				label : oSelectedElement.label,
				bindingString : oSelectedElement.bindingPath
			}, oPublicParentDesignTimeMetadata);
		},

		_createRevealCommandForInvisible: function(oSelectedElement, mActions, mParents, oSiblingElement) {
			var oRevealedElement = oSelectedElement.element;
			var sType = oRevealedElement.getMetadata().getName();
			var mType = mActions.reveal.types[sType];
			var oDesignTimeMetadata = mType.designTimeMetadata;
			if (mParents.publicParent !=  mParents.parent){
				var oAggregationDesignTimeMetadata = oDesignTimeMetadata.createAggregationDesignTimeMetadata(mActions.aggregation);
				return this.getCommandFactory().getCommandFor(mParents.publicParent, "reveal", {
					revealedElementId : oRevealedElement.getId(),
					hiddenParent : mParents.parent
				}, oAggregationDesignTimeMetadata);
			} else {
				return this.getCommandFactory().getCommandFor(oRevealedElement, "reveal", { }, oDesignTimeMetadata);
			}
		},

		_createMoveCommandForInvisible: function(oSelectedElement, mActions, mParents, oSiblingElement) {
			var oRevealedElement = oSelectedElement.element;
			var sType = oRevealedElement.getMetadata().getName();
			var mType = mActions.reveal.types[sType];
			var sParentAggregationName = mType.action.getAggregationName(mParents.parent, oRevealedElement);
			var oSourceParent = _getSourceParent(oRevealedElement, mParents);
			var oTargetParent = mParents.parent;
			var iRevealTargetIndex = Utils.getIndex(mParents.parent, oSiblingElement, sParentAggregationName);
			var iRevealedSourceIndex = Utils.getIndex(oSourceParent, oRevealedElement, sParentAggregationName) - 1;

			iRevealTargetIndex = _adjustTargetIndex(oSourceParent, oTargetParent, iRevealedSourceIndex, iRevealTargetIndex);

			var oCmd;
			if (iRevealTargetIndex !== iRevealedSourceIndex || mParents.parent !== oRevealedElement.getParent()){
				var SourceParentDesignTimeMetadata = mParents.publicParentOverlay.getDesignTimeMetadata();
				oCmd = this.getCommandFactory().getCommandFor(mParents.publicParent, "move", {
					movedElements : [{
						element : oRevealedElement,
						sourceIndex : iRevealedSourceIndex,
						targetIndex : iRevealTargetIndex
					}],
					source : {
						publicParent : mParents.publicParent,
						publicAggregation: mActions.aggregation,
						parent : oSourceParent,
						aggregation : sParentAggregationName
					},
					target : {
						publicParent : mParents.publicParent,
						publicAggregation: mActions.aggregation,
						parent : oTargetParent,
						aggregation : sParentAggregationName
					}
				}, SourceParentDesignTimeMetadata);
			}
			return oCmd;
		},

		/**
		 * This function gets called twice, on startup and when we create a context menu.
		 * On Startup bOverlayIsSibling is not defined as we don't know if it is a sibling or not. In this case we check both cases.
		 * @param {sap.ui.dt.Overlay} oOverlay - overlay to be checked
		 * @param {boolean} bOverlayIsSibling - (optional) describs whether given overlay is to be checked as a sibling or as a child on editable. Expected values: [true, false, undefined]
		 * @private
		 */
		_isEditable: function(oOverlay, bOverlayIsSibling) {
			if (bOverlayIsSibling === undefined || bOverlayIsSibling === null) {
				return _isEditableCheck.call(this, oOverlay, true) || _isEditableCheck.call(this, oOverlay, false);
			} else {
				return _isEditableCheck.call(this, oOverlay, bOverlayIsSibling);
			}
		}
	});

	function _isEditableCheck (oOverlay, bOverlayIsSibling) {
		var bEditable = false;

		var oPublicParentDesigntimeMetadata = Utils.getPublicParentDesigntimeMetadata(oOverlay);
		if (!oPublicParentDesigntimeMetadata) {
			return false;
		}

		var mActions = _getActions(bOverlayIsSibling, oOverlay);

		if (mActions.addODataProperty) {
			var oAddODataPropertyAction = mActions.addODataProperty.action;
			bEditable = oAddODataPropertyAction && oAddODataPropertyAction.aggregation === oOverlay.getPublicParentAggregationOverlay().getAggregationName();
		}

		if (!bEditable && mActions.reveal) {
			bEditable = true;
		}

		if (!bEditable && !bOverlayIsSibling) {
			bEditable = _hasRevealActionsOnChildren(oOverlay);
		}

		if (!bEditable && bOverlayIsSibling) {
			bEditable = this.checkAggregations(oOverlay, oOverlay.getPublicParentAggregationOverlay(), "addODataProperty");
		}

		if (!bEditable && !bOverlayIsSibling) {
			bEditable = this.checkAggregationsOnSelf(oOverlay, "addODataProperty");
		}

		if (bEditable) {
			return this.hasStableId(oOverlay);
		} else {
			return false;
		}
	}

	function _getAllElements (aPromises) {
		return Promise.all(aPromises).then(function(aAnalyzerValues) {
			var aAllElements = aAnalyzerValues[0] || [];
			if (aAllElements && aAnalyzerValues[1]) {
				aAllElements = aAllElements.concat(aAnalyzerValues[1]);
			}
			return aAllElements;
		});
	}

	function _getSourceParent(oRevealedElement, mParents){
		var oParent = oRevealedElement.getParent();
		if (!oParent && oRevealedElement.sParentId){
			//stashed control has no parent, but remembers its parent id
			oParent = sap.ui.getCore().byId(oRevealedElement.sParentId);
		} else if (!oParent) {
			// fallback to target parent
			oParent = mParents.parent;
		}
		return oParent;
	}

	//in case an element is moved inside the same container above its current position, its own position has to be removed
	function _adjustTargetIndex (oSourceContainer, oTargetContainer, iSourceIndex, iTargetIndex) {
		if (oSourceContainer === oTargetContainer && iSourceIndex < iTargetIndex && iSourceIndex > -1) {
			return iTargetIndex - 1;
		}
		return iTargetIndex;
	}

	// _getRevealActions for isEditable check
	function _hasRevealActionsOnChildren (oOverlay){
		var mRevealActions = _getRevealActions(false, oOverlay);
		return !!mRevealActions && Object.keys(mRevealActions).length > 0;
	}

	return AdditionalElementsPlugin;
});
