/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.Main.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject', 'sap/ui/rta/ui/ToolsMenu', 'sap/ui/dt/ElementUtil',
		'sap/ui/dt/DesignTime', 'sap/ui/dt/OverlayRegistry', 'sap/ui/dt/Overlay', 'sap/ui/rta/command/Stack',
		'sap/ui/rta/command/CommandFactory', 'sap/ui/rta/command/LREPSerializer', 'sap/ui/rta/plugin/Rename',
		'sap/ui/rta/plugin/DragDrop', 'sap/ui/rta/plugin/RTAElementMover', 'sap/ui/rta/plugin/CutPaste',
		'sap/ui/rta/plugin/Remove', 'sap/ui/rta/plugin/CreateContainer',
		'sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin','sap/ui/rta/plugin/additionalElements/AddElementsDialog',
		'sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer', 'sap/ui/rta/plugin/Combine', 'sap/ui/rta/plugin/Split',
		'sap/ui/rta/plugin/Selection', 'sap/ui/rta/plugin/MultiSelection', 'sap/ui/rta/plugin/Settings',
		'sap/ui/dt/plugin/ContextMenu', 'sap/ui/dt/plugin/TabHandling', 'sap/ui/fl/FlexControllerFactory',
		'sap/ui/rta/ui/SettingsDialog', './Utils',
		'sap/ui/fl/transport/Transports', 'sap/ui/fl/transport/TransportSelection','sap/ui/fl/Utils', 'sap/ui/fl/registry/Settings', 'sap/m/MessageBox', 'sap/m/MessageToast'],
		function(
		jQuery, ManagedObject, ToolsMenu, ElementUtil, DesignTime, OverlayRegistry, Overlay, CommandStack,
		CommandFactory, LREPSerializer, RTARenamePlugin, RTADragDropPlugin, RTAElementMover, CutPastePlugin,
		RemovePlugin, CreateContainerPlugin, AdditionalElementsPlugin, AdditionalElementsDialog, AdditionalElementsAnalyzer,
		CombinePlugin, SplitPlugin, SelectionPlugin, RTAMultiSelectionPlugin, SettingsPlugin, ContextMenuPlugin, TabHandlingPlugin, FlexControllerFactory,
		SettingsDialog, Utils,  Transports, TransportSelection, FlexUtils, FlexSettings, MessageBox, MessageToast) {
	"use strict";
	/**
	 * Constructor for a new sap.ui.rta.RuntimeAuthoring class.
	 *
	 * @class The runtime authoring allows to adapt the fields of a running application.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version 1.46.2
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.rta.RuntimeAuthoring
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API
	 *               might be changed in future.
	 */
	var RuntimeAuthoring = ManagedObject.extend("sap.ui.rta.RuntimeAuthoring", /** @lends sap.ui.rta.RuntimeAuthoring.prototype */
	{
		metadata : {
			// ---- control specific ----
			library : "sap.ui.rta",
			associations : {
				/** The root control which the runtime authoring should handle */
				"rootControl" : {
					type : "sap.ui.core.Control"
				}
			},
			properties : {
				/** The URL which is called when the custom field dialog is opened */
				"customFieldUrl" : "string",

				/** Whether the create custom field button should be shown */
				"showCreateCustomField" : "boolean",

				/** Whether the create custom field button should be shown */
				"showToolbars" : {
					type : "boolean",
					defaultValue : true
				},

				/** Whether rta is triggered from a dialog button */
				"triggeredFromDialog" : {
					type : "boolean",
					defaultValue : false
				},

				/** Temporary property : whether to show a dialog for changing control's properties#
				 * should be removed after DTA will fully switch to a property panel
				 */
				"showSettingsDialog" : {
					type : "boolean",
					defaultValue : true
				},

				/** Whether the window unload dialog should be shown */
				"showWindowUnloadDialog" : {
					type : "boolean",
					defaultValue : true
				},

				"commandStack" : {
					type : "sap.ui.rta.command.Stack"
				},

				/** Map indicating plugins in to be loaded or in use by RuntimeAuthoring and DesignTime  */
				"plugins" : {
					type : "any",
					defaultValue : {}
				}
			},
			events : {
				/** Fired when the runtime authoring is started */
				"start" : {},

				/** Fired when the runtime authoring is stopped */
				"stop" : {},

				/** Fired when the runtime authoring failed to start */
				"failed" : {},

				/**
				 * Event fired when a DesignTime selection is changed
				 */
				"selectionChange" : {
					parameters : {
						selection : { type : "sap.ui.dt.Overlay[]" }
					}
				},

				/**
				 * Fired when the undo/redo stack has changed, undo/redo buttons can be updated
				 */
				"undoRedoStackModified" : {}
			}
		},
		_sAppTitle : null

	});

	/**
	 * Returns (and creates) the default plugins of RuntimeAuthoring
	 *
	 * These are AdditionalElements, ContextMenu, CreateContainer, CutPaste,
	 * DragDrop, MultiSelection, Remove, Rename, Selection, Settings, TabHandling
	 *
	 * Method uses a local cache to hold the default plugins: Then on multiple access
	 * always the same instances get returned.
	 *
	 * @public
	 * @return {map} Map with plugins
	 */
	RuntimeAuthoring.prototype.getDefaultPlugins = function() {

		if (!this._mDefaultPlugins) {

			// Initialize local cache
			this._mDefaultPlugins = {};

			// Selection
			var oSelectionPlugin = new SelectionPlugin();
			this._mDefaultPlugins["selection"] = oSelectionPlugin;

			// Drag drop plugin
			var oRTAElementMover = new RTAElementMover();
			oRTAElementMover.setCommandFactory(CommandFactory);

			var oRTADragDropPlugin = new RTADragDropPlugin({
				elementMover : oRTAElementMover,
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);
			oRTADragDropPlugin.attachDragStarted(this._handleStopCutPaste, this);
			this._mDefaultPlugins["dragDrop"] = oRTADragDropPlugin;

			// Cut paste
			var oRTACutPastePlugin = new CutPastePlugin({
				elementMover : oRTAElementMover,
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);
			this._mDefaultPlugins["cutPaste"] = oRTACutPastePlugin;

			// Remove
			var oRemovePlugin = new RemovePlugin({
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);
			this._mDefaultPlugins["remove"] = oRemovePlugin;

			// Additional elements
			var oAdditionalElementsPlugin = new AdditionalElementsPlugin({
				commandFactory : CommandFactory,
				analyzer : AdditionalElementsAnalyzer,
				dialog : new AdditionalElementsDialog()
			}).attachElementModified(this._handleElementModified, this);
			this._mDefaultPlugins["additionalElements"] = oAdditionalElementsPlugin;

			// Rename
			var oRenamePlugin = new RTARenamePlugin({
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);
			oRenamePlugin.attachEditable(this._handleStopCutPaste, this);
			this._mDefaultPlugins["rename"] = oRenamePlugin;

			// Multi selection
			var oMultiSelectionPlugin = new RTAMultiSelectionPlugin({
				multiSelectionTypes : ["sap.ui.comp.smartform.GroupElement"]
			});
			this._mDefaultPlugins["multiSelection"] = oMultiSelectionPlugin;

			// Settings
			var oSettingsPlugin = new SettingsPlugin({
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);
			this._mDefaultPlugins["settings"] = oSettingsPlugin;

			// Create container
			var oCreateContainerPlugin = new CreateContainerPlugin({
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);
			this._mDefaultPlugins["createContainer"] = oCreateContainerPlugin;

			// Combine
			var oCombinePlugin = new CombinePlugin({
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);
			this._mDefaultPlugins["combine"] = oCombinePlugin;

			// Split
			var oSplitPlugin = new SplitPlugin({
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);
			this._mDefaultPlugins["split"] = oSplitPlugin;

			// Context Menu
			var oContextMenuPlugin = new ContextMenuPlugin();
			this._mDefaultPlugins["contextMenu"] = oContextMenuPlugin;

			// TabHandling
			var oTabHandlingPlugin = new TabHandlingPlugin();
			this._mDefaultPlugins["tabHandling"] = oTabHandlingPlugin;
		}

		return jQuery.extend({}, this._mDefaultPlugins);


	};

	/**
	 * In order to clear the cache and to destroy the default plugins on exit use
	 * _destroyDefaultPlugins()
	 *
	 * In order to destroy default plugins not used, because replaced or removed,
	 * pass the list of active plugins: _destroyDefaultPlugins( mPluginsToKeep ).
	 *
	 * @param {map} mPluginsToKeep - list of active plugins to keep in _mDefaultPlugins
	 * @private
	 */
	RuntimeAuthoring.prototype._destroyDefaultPlugins = function (mPluginsToKeep) {
		// Destroy default plugins and clear cache
		// ... but keep those in mPluginsToKeep
		for (var sDefaultPluginName in this._mDefaultPlugins) {
			var oDefaultPlugin = this._mDefaultPlugins[sDefaultPluginName];

			if (oDefaultPlugin && !oDefaultPlugin.bIsDestroyed) {
				if (!mPluginsToKeep || mPluginsToKeep[sDefaultPluginName] !== oDefaultPlugin) {
					oDefaultPlugin.destroy();
				}
			}
		}
		if (!mPluginsToKeep) {
			this._mDefaultPlugins = null;
		}
	};

	/**
	 * @override
	 */
	RuntimeAuthoring.prototype.init = function() {
		this._onCommandStackModified = this._onStackModified.bind(this);
	};

	RuntimeAuthoring.prototype.setPlugins = function(mPlugins) {
		if (this._oDesignTime) {
			throw new Error('Cannot replace plugins: runtime authoring already started');
		}
		this.setProperty("plugins", mPlugins);
	};

	/**
	 * Start Runtime Authoring
	 *
	 * @public
	 */
	RuntimeAuthoring.prototype.start = function() {
		this._aPopups = [];

		this._oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		this._aSupportedControls = ["sap.ui.comp.smartform.Group", "sap.uxap.ObjectPageSection",
				"sap.uxap.ObjectPageLayout"];

		// Create DesignTime
		if (!this._oDesignTime) {

			this._oRootControl = sap.ui.getCore().byId(this.getRootControl());

			// Take default plugins if no plugins handed over
			if (!this.getPlugins() || !Object.keys(this.getPlugins()).length) {
				this.setPlugins(this.getDefaultPlugins());
			}

			// Destroy default plugins instantiated but not in use
			this._destroyDefaultPlugins(this.getPlugins());

			// Hand over currrent command stack to setting plugin
			if (this.getPlugins()["settings"]) {
				this.getPlugins()["settings"].setCommandStack(this.getCommandStack());
			}

			this._buildContextMenu();

			// Create design time
			var aKeys = Object.keys(this.getPlugins());
			var aPlugins = aKeys.map(function(sKey) {
				return this.getPlugins()[sKey];
			}, this);

			jQuery.sap.measure.start("rta.dt.startup","Measurement of RTA: DesignTime start up");
			this._oDesignTime = new DesignTime({
				rootElements : [this._oRootControl],
				plugins : aPlugins
			});

			jQuery(Overlay.getOverlayContainer()).addClass("sapUiRta");

			this._oDesignTime.attachSelectionChange(function(oEvent) {
				this.fireSelectionChange({selection: oEvent.getParameter("selection")});
			}, this);

			this._oDesignTime.attachEventOnce("synced", function() {
				this.fireStart();
				jQuery.sap.measure.end("rta.dt.startup","Measurement of RTA: DesignTime start up");
			}, this);

			this._oDesignTime.attachEventOnce("syncFailed", function() {
				this.fireFailed();
			}, this);

			// attach RuntimeAuthoring event to $document
			this.$document = jQuery(document);
			this.fnKeyDown = this._onKeyDown.bind(this);
			this.$document.on("keydown", this.fnKeyDown);
		}

		if (this.getShowToolbars()) {
			// Create ToolsMenu
			this._createToolsMenu();
			// set focus initially on top toolbar
			var oDelegate = {
				"onAfterRendering" : function() {
					this._oToolsMenu._oToolBar.focus();
					this._oToolsMenu._oToolBar.removeEventDelegate(oDelegate, this);
				}
			};
			this._oToolsMenu._oToolBar.addEventDelegate(oDelegate, this);

			// Show Toolbar(s)
			this._oToolsMenu.show();
		}

		// Register function for checking unsaved before leaving RTA
		this._oldUnloadHandler = window.onbeforeunload;
		window.onbeforeunload = this._onUnload.bind(this);

		sap.ui.getCore().getEventBus().subscribe("sap.ushell.renderers.fiori2.Renderer", "appClosed", this._onAppClosed, this);

	};

	var fnShowTechnicalError = function(vError) {
		var sErrorMessage = vError.message || vError.status || vError;
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		jQuery.sap.log.error("Failed to transfer runtime adaptation changes to layered repository", sErrorMessage);
		jQuery.sap.require("sap.m.MessageBox");
		var sMsg = oTextResources.getText("MSG_LREP_TRANSFER_ERROR") + "\n"
				+ oTextResources.getText("MSG_ERROR_REASON", sErrorMessage);
		sap.m.MessageBox.error(sMsg);
	};

	RuntimeAuthoring.prototype._onAppClosed = function() {
		this.stop(true);
	};

	/**
	 * @override
	 */
	RuntimeAuthoring.prototype.setCommandStack = function(oCommandStack) {
		var  oOldCommandStack = this.getProperty("commandStack");
		if (oOldCommandStack) {
			oOldCommandStack.detachModified(this._onCommandStackModified);
		}

		if (this._oInternalCommandStack) {
			this._oInternalCommandStack.destroy();
			delete this._oInternalCommandStack;
		}

		var oResult = this.setProperty("commandStack", oCommandStack);

		if (oCommandStack) {
			oCommandStack.attachModified(this._onCommandStackModified);
		}

		if (this.getPlugins() && this.getPlugins()["settings"]) {
			this.getPlugins()["settings"].setCommandStack(oCommandStack);
		}

		return oResult;
	};

	/**
	 *
	 * @override
	 */
	RuntimeAuthoring.prototype.getCommandStack = function() {
		var oCommandStack = this.getProperty("commandStack");
		if (!oCommandStack) {
			oCommandStack = new CommandStack();
			this._oInternalCommandStack = oCommandStack;
			this.setCommandStack(oCommandStack);
		}

		return oCommandStack;
	};

	/**
	 * adapt the enablement of undo/redo/reset/transport button
	 * @private
	 */
	RuntimeAuthoring.prototype._onStackModified = function() {
		var oCommandStack = this.getCommandStack();
		var bCanUndo = oCommandStack.canUndo();
		var bCanRedo = oCommandStack.canRedo();
		var oUshellContainer = Utils.getUshellContainer();

		if (this.getShowToolbars()) {
			this._oToolsMenu.adaptUndoRedoEnablement(bCanUndo, bCanRedo);
			this._oToolsMenu.adaptTransportEnablement(this._bChangesExist || bCanUndo);
			this._oToolsMenu.adaptRestoreEnablement(this._bChangesExist || bCanUndo);
		}
		this.fireUndoRedoStackModified();

		if (oUshellContainer) {
			if (bCanUndo) {
				oUshellContainer.setDirtyFlag(true);
			} else {
				oUshellContainer.setDirtyFlag(false);
			}
		}
	};

	RuntimeAuthoring.prototype._closeToolBars = function() {
		if (this.getShowToolbars()) {
			return this._oToolsMenu.hide();
		} else {
			return Promise.resolve();
		}
	};

	/**
	 * Returns a selection from the DesignTime
	 * @return {sap.ui.dt.Overlay[]} selected overlays
	 * @public
	 */
	RuntimeAuthoring.prototype.getSelection = function() {
		if (this._oDesignTime) {
			return this._oDesignTime.getSelection();
		} else {
			return [];
		}
	};

	/**
	 * stop Runtime Authoring
	 *
	 * @public
	 * @param {boolean} bDontSaveChanges - stop RTA with or w/o saving changes
	 * @returns {Promise} promise with no parameters
	 */
	RuntimeAuthoring.prototype.stop = function(bDontSaveChanges) {
		return ((bDontSaveChanges) ? Promise.resolve() : this._serializeToLrep())
			.then(this._closeToolBars.bind(this))
				.then(function(){
					this.exit();
					this.fireStop();
		}.bind(this))['catch'](fnShowTechnicalError);
	};

	RuntimeAuthoring.prototype.restore = function() {
		this._onRestore();
	};

	RuntimeAuthoring.prototype.transport = function() {
		this._onTransport();
	};

	// ---- backward compatibility API
	RuntimeAuthoring.prototype.undo = function() {
		this._onUndo();
	};

	RuntimeAuthoring.prototype.redo = function() {
		this._onRedo();
	};

	RuntimeAuthoring.prototype.canUndo = function() {
		return this.getCommandStack().canUndo();
	};

	RuntimeAuthoring.prototype.canRedo = function() {
		return this.getCommandStack().canRedo();
	};
	// ---- backward compatibility API

	RuntimeAuthoring.prototype._onKeyDown = function(oEvent) {
		// on macintosh os cmd-key is used instead of ctrl-key
		var bCtrlKey = sap.ui.Device.os.macintosh ? oEvent.metaKey : oEvent.ctrlKey;
		if ((oEvent.keyCode === jQuery.sap.KeyCodes.Z) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (bCtrlKey === true)) {
			// CTRL+Z
			this._onUndo();
			oEvent.stopPropagation();
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.Z) && (oEvent.shiftKey === true) && (oEvent.altKey === false) && (bCtrlKey === true)) {
			// CTRL+SHIFT+Z
			this._onRedo();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handle RuntimeAuthoring events attached by 
	 * $<element>.addEventListener(<event.type>, this, false);
	 * 
	 * @param {sap.ui.base.Event} oEvent - passed event
	 * @private
	 */
	RuntimeAuthoring.prototype.handleEvent = function(oEvent) {
		if (oEvent.type === "keydown") {
			this._onKeyDown(oEvent);
		}
	};

	/**
	 * Check for unsaved changes before Leaving Runtime Authoring
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._onUnload = function() {
		var oCommandStack = this.getCommandStack();
		var bUnsaved = oCommandStack.canUndo() || oCommandStack.canRedo();
		if (bUnsaved && this.getShowWindowUnloadDialog()) {
			var sMessage = this._oTextResources.getText("MSG_UNSAVED_CHANGES");
			return sMessage;
		} else {
			window.onbeforeunload = this._oldUnloadHandler;
		}
	};

	RuntimeAuthoring.prototype._serializeToLrep = function() {
		var oSerializer = new LREPSerializer({commandStack : this.getCommandStack(), rootControl : this.getRootControl()});
		return oSerializer.saveCommands();
	};

	RuntimeAuthoring.prototype._onUndo = function() {
		this._handleStopCutPaste();

		this.getCommandStack().undo();
	};

	RuntimeAuthoring.prototype._onRedo = function() {
		this._handleStopCutPaste();

		this.getCommandStack().redo();
	};

	RuntimeAuthoring.prototype._createToolsMenu = function() {
		if (!this._oToolsMenu) {
			this._oToolsMenu = new ToolsMenu();
			this._oToolsMenu.setRootControl(this._oRootControl);
			this._oToolsMenu.createToolbar(this.getTriggeredFromDialog());
			this._checkChangesExist().then(function(bResult){
				this._bChangesExist = bResult;
				this._oToolsMenu.adaptTransportEnablement(bResult);
				this._oToolsMenu.adaptRestoreEnablement(bResult);
			}.bind(this));
			this._oToolsMenu.attachToolbarClose(this.stop.bind(this, false), this);
			this._oToolsMenu.attachTransport(this._onTransport, this);
			this._oToolsMenu.attachRestore(this._onRestore, this);
			this._oToolsMenu.attachUndo(this._onUndo, this);
			this._oToolsMenu.attachRedo(this._onRedo, this);
		}
	};

	/**
	 * Exit Runtime Authoring - destroy all controls and plugins
	 *
	 * @protected
	 */
	RuntimeAuthoring.prototype.exit = function() {
		if (this._oDesignTime) {
			jQuery(Overlay.getOverlayContainer()).removeClass("sapUiRta");
			this._oDesignTime.destroy();
			this._oDesignTime = null;

			// detach browser events
			this.$document.off("keydown", this.fnKeyDown);
			// Destroy default plugins
			this._destroyDefaultPlugins();
			// plugins have been destroyed as _oDesignTime.destroy()
			// plugins are set to defaultValue if parameter is null
			this.setPlugins(null);
		}
		if (this._oToolsMenu) {
			this._oToolsMenu.destroy();
			this._oToolsMenu = null;
		}
		this.setCommandStack(null);

		var oUshellContainer = Utils.getUshellContainer();
		if (oUshellContainer) {
			oUshellContainer.setDirtyFlag(false);
		}

		window.onbeforeunload = this._oldUnloadHandler;
	};

	/**
	 * Function to handle ABAP transport of the changes
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._onTransport = function() {
		var fnHandleAllErrors = function (oError) {
			if (oError.message !== 'createAndApply failed') {
				FlexUtils.log.error("transport error" + oError);
				return this._showMessage(MessageBox.Icon.ERROR, "HEADER_TRANSPORT_ERROR", "MSG_TRANSPORT_ERROR", oError);
			}
		}.bind(this);

		this._handleStopCutPaste();

		return this._openSelection()
			.then(this._checkTransportInfo)
			.then(function(oTransportInfo) {
				if (oTransportInfo) {
					var oFlexController = FlexControllerFactory.createForControl(this._oRootControl);
					return this._serializeToLrep().then(function () {
						return oFlexController.getComponentChanges().then(function (aAllLocalChanges) {
							if (aAllLocalChanges.length > 0) {
								return this._createAndApplyChanges(aAllLocalChanges, oFlexController)
									.then(this._transportAllLocalChanges.bind(this, oTransportInfo, oFlexController))
										['catch'](fnHandleAllErrors);
							}
						}.bind(this));
					}.bind(this))['catch'](fnShowTechnicalError);
				}
			}.bind(this)
		);
	};

	RuntimeAuthoring.prototype._checkTransportInfo = function(oTransportInfo) {
		if (oTransportInfo && oTransportInfo.transport && oTransportInfo.packageName !== "$TMP") {
			return oTransportInfo;
		} else {
			return false;
		}
	};

	RuntimeAuthoring.prototype._openSelection = function () {
	   return new TransportSelection().openTransportSelection(null, this._oRootControl);
	};

	/**
	 * Create and apply changes
	 *
	 * Function is copied from FormP13nHandler. We need all changes for various controls.
	 * The function _createAndApplyChanges in the FormP13Handler calls that._getFlexController()
	 * which is specific for the SmartForm
	 *
	 * @private
	 * @param {array} aChangeSpecificData - array of objects with change specific data
	 * @param {sap.ui.fl.FlexController} - instance of FlexController
	 * @returns {Promise} promise that resolves with no parameters
	 */
	RuntimeAuthoring.prototype._createAndApplyChanges = function(aChangeSpecificData, oFlexController) {
		return Promise.resolve().then(function() {

			function fnValidChanges(oChangeSpecificData) {
				return oChangeSpecificData && oChangeSpecificData.selector && oChangeSpecificData.selector.id;
			}

			aChangeSpecificData.filter(fnValidChanges).forEach(function(oChangeSpecificData) {
				var oControl = sap.ui.getCore().byId(oChangeSpecificData.selector.id);
				oFlexController.createAndApplyChange(oChangeSpecificData, oControl);
			});
		})['catch'](function(oError) {
			FlexUtils.log.error("Create and apply error: " + oError);
			return oError;
		}).then(function(oError) {
			return oFlexController.saveAll().then(function() {
				if (oError) {
					throw oError;
				}
			});
		})['catch'](function(oError) {
			FlexUtils.log.error("Create and apply and/or save error: " + oError);
			return this._showMessage(MessageBox.Icon.ERROR, "HEADER_TRANSPORT_APPLYSAVE_ERROR", "MSG_TRANSPORT_APPLYSAVE_ERROR", oError);
		}.bind(this));
	};

	/**
	 * Delete all changes for current layer and root control's component
	 *
	 * @private
	 * @return {Promise} the promise from the FlexController
	 */
	RuntimeAuthoring.prototype._deleteChanges = function() {
		var oTransportSelection = new TransportSelection();
		var oFlexController = FlexControllerFactory.createForControl(this._oRootControl);

		oFlexController.getComponentChanges().then(function(aChanges) {
			return FlexSettings.getInstance(FlexUtils.getComponentClassName(this._oRootControl)).then(function(oSettings) {
				if (!oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured()) {
					return oTransportSelection.setTransports(aChanges, this._oRootControl);
				}
			}.bind(this)).then(function() {
				return oFlexController.discardChanges(aChanges);
			}).then(function() {
				return window.location.reload();
			});
		}.bind(this))["catch"](function(oError) {
			return this._showMessage(MessageBox.Icon.ERROR, "HEADER_RESTORE_FAILED", "MSG_RESTORE_FAILED", oError);
		}.bind(this));
	};

	/**
	 * @private
	 */
	RuntimeAuthoring.prototype._showMessage = function(oMessageType, sTitleKey, sMessageKey, oError) {
		var sMessage = this._oTextResources.getText(sMessageKey, oError ? [oError.message || oError] : undefined);
		var sTitle = this._oTextResources.getText(sTitleKey);

		return new Promise(function(resolve) {
			MessageBox.show(sMessage, {
				icon: oMessageType,
				title: sTitle,
				onClose: resolve
			});
		});
	};

	/**
	 * @private
	 */
	RuntimeAuthoring.prototype._showMessageToast = function(sMessageKey) {
		var sMessage = this._oTextResources.getText(sMessageKey);

		MessageToast.show(sMessage);
	};

	/**
	 * Check if restart of RTA is needed
	 * the RTA FLP plugin will check this
	 * and restart RTA if needed
	 *
	 * @public
	 * @static
	 * @returns {Boolean} if restart is needed
	 */
	RuntimeAuthoring.needsRestart = function() {

		var bRestart = !!window.localStorage.getItem("sap.ui.rta.restart");
		return bRestart;
	};

	/**
	 * Enable restart of RTA
	 * the RTA FLP plugin would handle the restart
	 *
	 * @public
	 * @static
	 */
	RuntimeAuthoring.enableRestart = function() {

		window.localStorage.setItem("sap.ui.rta.restart", true);
	};

	/**
	 * Disable restart of RTA
	 * the RTA FLP plugin whould handle the restart
	 *
	 * @public
	 * @static
	 */
	RuntimeAuthoring.disableRestart = function() {

		window.localStorage.removeItem("sap.ui.rta.restart");
	};

	/**
	 * Discard all LREP changes and restores the default app state,
	 * opens a MessageBox where the user can confirm
	 * the restoring to the default app state
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._onRestore = function() {
		var sMessage = this._oTextResources.getText("FORM_PERS_RESET_MESSAGE");
		var sTitle = this._oTextResources.getText("FORM_PERS_RESET_TITLE");

		var fnConfirmDiscardAllChanges = function (sAction) {
			if (sAction === "OK") {
				this.getCommandStack().removeAllCommands();
				RuntimeAuthoring.enableRestart();
				this._deleteChanges();
			}
		}.bind(this);

		this._handleStopCutPaste();

		MessageBox.confirm(sMessage, {
			icon: MessageBox.Icon.WARNING,
			title : sTitle,
			onClose : fnConfirmDiscardAllChanges
		});
	};

	/**
	 * Prepare all changes and assign them to an existing transport
	 *
	 * @private
	 * @param {object} oTransportInfo - information about the selected transport
	 * @param {sap.ui.fl.FlexController} - instance of FlexController
	 * @returns {Promise} Promise which resolves without parameters
	 */
	RuntimeAuthoring.prototype._transportAllLocalChanges = function(oTransportInfo, oFlexController) {
		return oFlexController.getComponentChanges().then(function(aAllLocalChanges) {

			// Pass list of changes to be transported with transport request to backend
			var oTransports = new Transports();
			var aTransportData = oTransports._convertToChangeTransportData(aAllLocalChanges);
			var oTransportParams = {};
			//packageName is '' in CUSTOMER layer (no package input field in transport dialog)
			oTransportParams.package = oTransportInfo.packageName;
			oTransportParams.transportId = oTransportInfo.transport;
			oTransportParams.changeIds = aTransportData;

			return oTransports.makeChangesTransportable(oTransportParams).then(function() {

				// remove the $TMP package from all changes; has been done on the server as well,
				// but is not reflected in the client cache until the application is reloaded
				aAllLocalChanges.forEach(function(oChange) {

					if (oChange.getPackage() === '$TMP') {
						var oDefinition = oChange.getDefinition();
						oDefinition.packageName = oTransportInfo.packageName;
						oChange.setResponse(oDefinition);
					}
				});
			}).then(function() {
				this._showMessageToast("MSG_TRANSPORT_SUCCESS");
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Checks the two parent-information maps for equality
	 *
	 * @param {object}
	 *          oInfo1 *
	 * @param {object}
	 *          oInfo2
	 * @return {boolean} true if equal, false otherwise
	 * @private
	 */
	RuntimeAuthoring.prototype._isEqualParentInfo = function(oInfo1, oInfo2) {
		var oResult = !!oInfo1 && !!oInfo2;
		if (oResult && (oInfo1.parent && oInfo2.parent)) {
			oResult = oInfo1.parent.getId() === oInfo2.parent.getId();
		}
		if (oResult && (oInfo1.index || oInfo2.index)) {
			oResult = oInfo1.index === oInfo2.index;
		}
		if (oResult && (oInfo1.aggregation || oInfo2.aggregation)) {
			oResult = oInfo1.aggregation === oInfo2.aggregation;
		}
		return oResult;
	};

	/**
	 * Function to handle modification of an element
	 *
	 * @param {sap.ui.base.Event}
	 *          oEvent event object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleElementModified = function(oEvent) {
		this._handleStopCutPaste();

		var oCommand = oEvent.getParameter("command");
		if (oCommand instanceof sap.ui.rta.command.BaseCommand) {
			this.getCommandStack().pushAndExecute(oCommand);
		}
	};

	/**
	 * Function to handle hiding an element by the context menu
	 *
	 * @param {object}
	 *          oOverlay object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleRemoveElement = function(aOverlays) {
		this.getPlugins()["remove"].removeElement(aOverlays);
	};

	/**
	 * @private
	 */
	RuntimeAuthoring.prototype._openSettingsDialog = function(oEventOrOverlays) {
		var aSelectedOverlays = (oEventOrOverlays.mParameters) ? oEventOrOverlays.getParameter("selectedOverlays") : oEventOrOverlays;
		var oElement = aSelectedOverlays[0].getElementInstance();
		this._handleStopCutPaste();

		if (!this._oSettingsDialog) {
			this._oSettingsDialog = new SettingsDialog();
		}
		this._oSettingsDialog.setCommandStack(this.getCommandStack());
		this._oSettingsDialog.open(oElement);
	};


	var fnMultiSelectionInactive = function(oOverlay) {
		return this._oDesignTime.getSelection().length < 2;
	};

	var fnIsMovable = function(oOverlay) {
		return oOverlay.getMovable();
	};

	var fnIsRemoveAvailable = function(oOverlay) {
		return this.getPlugins()["remove"].isRemoveAvailable(oOverlay);
	};

	var fnIsRemoveEnabled = function(oOverlay) {
		return this.getPlugins()["remove"].isRemoveEnabled(oOverlay);
	};

	var fnIsRenameAvailable = function(oOverlay) {
		return this.getPlugins()["rename"].isRenameAvailable(oOverlay);
	};

	var fnIsRenameEnabled = function(oOverlay) {
		return this.getPlugins()["rename"].isRenameEnabled(oOverlay);
	};

	var fnIsSettingsAvailable = function(oOverlay) {
		return this.getPlugins()["settings"].isSettingsAvailable(oOverlay);
	};

	var fnIsSettingsEnabled = function(oOverlay) {
		return this.getPlugins()["settings"].isSettingsEnabled(oOverlay);
	};

	var fnIsCombineAvailable = function(oOverlay) {
		return this.getPlugins()["combine"].isCombineAvailable(oOverlay);
	};

	var fnIsCombineEnabled = function(oOverlay) {
		return this.getPlugins()["combine"].isCombineEnabled(oOverlay);
	};

	var fnIsSplitAvailable = function(oOverlay) {
		return this.getPlugins()["split"].isSplitAvailable(oOverlay);
	};

	var fnIsSplitEnabled = function(oOverlay) {
		return this.getPlugins()["split"].isSplitEnabled(oOverlay);
	};

	RuntimeAuthoring.prototype._buildContextMenu = function() {
		// Return if plugin missing
		var oContextMenuPlugin = this.getPlugins()["contextMenu"];
		if (!oContextMenuPlugin) {
			return;
		}

		var oAdditionalElementsPlugin = this.getPlugins()["additionalElements"];
		var oCreateContainerPlugin = this.getPlugins()["createContainer"];

		if (this.getPlugins()["rename"]) {

			oContextMenuPlugin.addMenuItem({
				id : "CTX_RENAME_LABEL",
				text : this._oTextResources.getText("CTX_RENAME"),
				handler : this._handleRename.bind(this),
				available : fnIsRenameAvailable.bind(this),
				enabled : function(oOverlay) {
					return (fnMultiSelectionInactive.call(this, oOverlay) && fnIsRenameEnabled.call(this, oOverlay));
				}.bind(this)
			});
		}

		if (oAdditionalElementsPlugin){
			oContextMenuPlugin.addMenuItem({
				id : "CTX_ADD_ELEMENTS_AS_SIBLING",
				text : oAdditionalElementsPlugin.getContextMenuTitle.bind(oAdditionalElementsPlugin, true),
				handler : oAdditionalElementsPlugin.showAvailableElements.bind(oAdditionalElementsPlugin, true),
				available : oAdditionalElementsPlugin.isAvailable.bind(oAdditionalElementsPlugin, true),
				enabled : function(oOverlay) {
					return fnMultiSelectionInactive.call(this, oOverlay) && oAdditionalElementsPlugin.isEnabled(true, oOverlay);
				}.bind(this)
			});

			oContextMenuPlugin.addMenuItem({
				id : "CTX_ADD_ELEMENTS_AS_CHILD",
				text : oAdditionalElementsPlugin.getContextMenuTitle.bind(oAdditionalElementsPlugin, false),
				handler : oAdditionalElementsPlugin.showAvailableElements.bind(oAdditionalElementsPlugin, false),
				available : oAdditionalElementsPlugin.isAvailable.bind(oAdditionalElementsPlugin, false),
				enabled : function(oOverlay) {
					return fnMultiSelectionInactive.call(this, oOverlay) && oAdditionalElementsPlugin.isEnabled(false, oOverlay);
				}.bind(this)
			});

		}

		if (oCreateContainerPlugin) {

			oContextMenuPlugin.addMenuItem({
				id : "CTX_CREATE_CHILD_CONTAINER",
				text : oCreateContainerPlugin.getCreateContainerText.bind(oCreateContainerPlugin, false),
				handler : this._createContainer.bind(this, false),
				available : oCreateContainerPlugin.isCreateAvailable.bind(oCreateContainerPlugin, false),
				enabled : oCreateContainerPlugin.isCreateEnabled.bind(oCreateContainerPlugin, false)
			});

			oContextMenuPlugin.addMenuItem({
				id : "CTX_CREATE_SIBLING_CONTAINER",
				text : oCreateContainerPlugin.getCreateContainerText.bind(oCreateContainerPlugin, true),
				handler : this._createContainer.bind(this, true),
				available : oCreateContainerPlugin.isCreateAvailable.bind(oCreateContainerPlugin, true),
				enabled : oCreateContainerPlugin.isCreateEnabled.bind(oCreateContainerPlugin, true)
			});
		}

		if (this.getPlugins()["remove"]) {

			oContextMenuPlugin.addMenuItem({
				id : "CTX_REMOVE",
				text : this._oTextResources.getText("CTX_REMOVE"), // text can be defined also in designtime metadata
				handler : this._handleRemoveElement.bind(this),
				available : fnIsRemoveAvailable.bind(this),
				enabled : fnIsRemoveEnabled.bind(this)
			});
		}

		oContextMenuPlugin.addMenuItem({
			id : "CTX_CUT",
			text : this._oTextResources.getText("CTX_CUT"),
			handler : this._handleCutElement.bind(this),
			available : fnIsMovable,
			enabled : function () {
				return this._oDesignTime.getSelection().length === 1;
			}.bind(this)
		});

		if (this.getPlugins()["cutPaste"]) {

			oContextMenuPlugin.addMenuItem({
				id : "CTX_PASTE",
				text : this._oTextResources.getText("CTX_PASTE"),
				handler : this._handlePasteElement.bind(this),
				available : fnIsMovable,
				enabled : function(oOverlay) {
					return this.getPlugins()["cutPaste"].isElementPasteable(oOverlay);
				}.bind(this)
			});
		}

		oContextMenuPlugin.addMenuItem({
			id : "CTX_GROUP_FIELDS",
			text : this._oTextResources.getText("CTX_GROUP_FIELDS"),
			handler : this._handleCombineElements.bind(this),
			available : fnIsCombineAvailable.bind(this),
			enabled : fnIsCombineEnabled.bind(this)
		});

		oContextMenuPlugin.addMenuItem({
			id : "CTX_UNGROUP_FIELDS",
			text : this._oTextResources.getText("CTX_UNGROUP_FIELDS"),
			handler : this._handleSplitElements.bind(this),
			available : fnIsSplitAvailable.bind(this),
			enabled : fnIsSplitEnabled.bind(this)
		});

		if (this.getPlugins()["settings"]) {

			oContextMenuPlugin.addMenuItem({
				id : "CTX_SETTINGS",
				text : this._oTextResources.getText("CTX_SETTINGS"),
				handler : this._handleSettings.bind(this),
				available : fnIsSettingsAvailable.bind(this),
				enabled : fnIsSettingsEnabled.bind(this)
			});
		}
	};

	RuntimeAuthoring.prototype._createContainer = function(bSibling, aOverlays) {
		this._handleStopCutPaste();

		var oOverlay = aOverlays[0];
		var oNewContainerOverlay = this.getPlugins()["createContainer"].handleCreate(bSibling, oOverlay);

		if (this.getPlugins()["rename"]) {

			var oDelegate = {
				"onAfterRendering" : function() {
					// TODO : remove timeout
					setTimeout(function() {
						this.getPlugins()["rename"].startEdit(oNewContainerOverlay);
					}.bind(this), 0);
					oNewContainerOverlay.removeEventDelegate(oDelegate);
				}.bind(this)
			};

			oNewContainerOverlay.addEventDelegate(oDelegate);
		}

	};

	/**
	 * Function to handle renaming a label
	 *
	 * @param {array}
	 *          aOverlays list of selected overlays
	 * @private
	 */
	RuntimeAuthoring.prototype._handleRename = function(aOverlays) {
		var oOverlay = aOverlays[0];
		this.getPlugins()["rename"].startEdit(oOverlay);
	};

	/**
	 * Function to handle cutting an element
	 *
	 * @param {array}
	 *          aOverlays list of selected overlays
	 * @private
	 */
	RuntimeAuthoring.prototype._handleCutElement = function(aOverlays) {
		var oOverlay = aOverlays[0];
		this.getPlugins()["cutPaste"].cut(oOverlay);
	};

	/**
	 * Function to handle pasting an element
	 *
	 * @param {array}
	 *          aOverlays list of selected overlays
	 * @private
	 */
	RuntimeAuthoring.prototype._handlePasteElement = function(aOverlays) {
		var oOverlay = aOverlays[0];
		this.getPlugins()["cutPaste"].paste(oOverlay);
	};

	/**
	 * Handler function to stop cut and paste, because some other operation has started
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleStopCutPaste = function() {
		this.getPlugins()["cutPaste"].stopCutAndPaste();
	};

	/**
	 * Function to handle combining of elements
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleCombineElements = function() {
		this._handleStopCutPaste();

		var oSelectedElement = this.getPlugins()["contextMenu"].getContextElement();
		this.getPlugins()["combine"].handleCombine(oSelectedElement);
	};

	/**
	 * Function to handle ungrouping of sap.ui.comp.smartform.GroupElements
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleSplitElements = function() {
		this._handleStopCutPaste();

		var oSelectedElement = this.getPlugins()["contextMenu"].getContextElement();
		this.getPlugins()["split"].handleSplit(oSelectedElement);
	};

	/**
	 * Function to handle settings
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleSettings = function(aOverlays) {
		this.getPlugins()["settings"].handleSettings(aOverlays);
	};

	/**
	 * @param {sap.ui.core.Element}
	 *          oElement The element which exists in the smart form
	 * @return {sap.ui.comp.smartform.SmartForm} the closest smart form found
	 * @private
	 */
	RuntimeAuthoring.prototype._getSmartFormForElement = function(oElement) {
		while (oElement && !ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.SmartForm")) {
			oElement = oElement.getParent();
		}

		return oElement;
	};

	/**
	 * Get the Title of the Application from the manifest.json
	 *
	 * @private
	 * @returns {String} the application title or empty string
	 */
	RuntimeAuthoring.prototype._getApplicationTitle = function() {

		var sTitle = "";
		var oComponent = sap.ui.core.Component.getOwnerComponentFor(this._oRootControl);
		if (oComponent) {
			sTitle = oComponent.getMetadata().getManifestEntry("sap.app").title;
		}
		return sTitle;
	};

	/**
	 * Check if Changes exists
	 * @private
	 * @returns {Promise}
	 */
	RuntimeAuthoring.prototype._checkChangesExist = function() {
		var oFlexController = FlexControllerFactory.createForControl(this._oRootControl);
		if (oFlexController.getComponentName().length > 0) {
			return oFlexController.getComponentChanges().then(function(aAllLocalChanges) {
				return aAllLocalChanges.length > 0;
			});
		} else {
			return Promise.resolve(false);
		}
	};

	return RuntimeAuthoring;

}, /* bExport= */true);
