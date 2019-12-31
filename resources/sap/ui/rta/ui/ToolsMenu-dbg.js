/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

// Provides control sap.ui.rta.ToolsMenu.
sap.ui.define([
	'sap/ui/rta/library',
	'sap/ui/core/Control',
	'sap/m/Toolbar',
	'sap/m/ToolbarLayoutData',
	'sap/m/ToolbarSpacer',
	'sap/m/Label',
	'sap/ui/core/Popup',
	'sap/ui/fl/registry/Settings',
	'sap/ui/fl/Utils',
	'sap/ui/rta/Utils'
	],
	function(
		library,
		Control,
		Toolbar,
		ToolbarLayoutData,
		ToolbarSpacer,
		Label,
		Popup,
		FlexSettings,
		FlUtils,
		Utils) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.ToolsMenu control.
	 *
	 * @class
	 * Contains all the necessary Toolbars for the Runtime Authoring
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.46.2
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.ToolsMenu
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ToolsMenu = Control.extend("sap.ui.rta.ui.ToolsMenu", {
		metadata : {

			library : "sap.ui.rta",
			// ---- control specific ----
			aggregations : {
				"toolbars" : {
					type : "sap.m.Toolbar",
					multiple : true,
					singularName : "toolbar"
				}
			},
			events : {
				/**
				 * Events are fired when the Toolbar - Buttons are pressed
				 */
				"undo" : {},
				"redo" : {},
				"close" : {},
				"toolbarClose" : {},
				"restore": {},
				"transport" : {}
			}
		}

	});

	/**
	 * Initialization of the ToolsMenu Control
	 * @private
	 */
	ToolsMenu.prototype.init = function() {
		// Get messagebundle.properties for sap.ui.rta
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	};

	/**
	 * Create Toolbar
	 * @private
	 */
	ToolsMenu.prototype.createToolbar = function(bTriggeredFromDialog) {
		var sText = null;
		// calculate z-index dependent on opened popups
		var iZIndex = Popup.getNextZIndex();

		if (!this._oToolBar) {
			//create Toolbar
			var oRenderer = Utils.getFiori2Renderer();
			if (oRenderer && !bTriggeredFromDialog) {
				this._oToolBar = oRenderer.addSubHeader("sap.m.Bar", {}, false, true);
				this._oToolBar.addStyleClass("sapUiRTAFioriToolBar");
			} else {
				this._oToolBar = new Toolbar({
					active : true
				});

				// Insert a DIV-Element for Top Toolbar in the DOM
				jQuery("body").prepend('<div id="RTA-Toolbar" style="z-index: ' + iZIndex + '"></div>');
				var oTop = jQuery("#RTA-Toolbar").addClass("sapUiRTAToolsMenuWrapper");
				oTop = oTop[0];
				this.placeAt(oTop);
				this.addToolbar(this._oToolBar);
			}
			this._oToolBar.addStyleClass("sapUiRTAToolBar");

			var oAdaptModeLabel = null;
			var oButtonExit = null;
			var oSpacerTop = null;

			// Label 'Adaptation Mode'
			oAdaptModeLabel = new Label({
				text : this._oRb.getText("TOOLBAR_TITLE"),
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			oAdaptModeLabel.bAllowTextSelection = false;

			// Button 'Undo'
			sText = this._oRb.getText("BTN_UNDO");
			this._oButtonUndo = new sap.m.Button({
				type:"Transparent",
				icon: "sap-icon://undo",
				enabled : false,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			this._oButtonUndo.data("Action", "UNDO",true);
			this._oButtonUndo.attachEvent('press', this._onUndo, this);

			// Button 'Redo'
			sText = this._oRb.getText("BTN_REDO");
			this._oButtonRedo = new sap.m.Button({
				type:"Transparent",
				icon: "sap-icon://redo",
				iconFirst: false,
				enabled : false,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			this._oButtonRedo.data("Action", "REDO",true);
			this._oButtonRedo.attachEvent('press', this._onRedo, this);

			// Button 'Restore'
			sText = this._oRb.getText("BTN_RESTORE");
			this._oButtonRestore = new sap.m.Button({
				type:"Transparent",
				text : sText,
				visible: true,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			this._oButtonRestore.data("Action", "RESTORE",true);
			this._oButtonRestore.attachEvent('press', this._onRestore, this);

			// Button 'Exit'
			sText = this._oRb.getText("BTN_EXIT");
			oButtonExit = new sap.m.Button({
				type:"Transparent",
				text : sText,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			oButtonExit.data("Action", "EXIT",true);
			oButtonExit.attachEvent('press', this.close, this);

			// Button 'Publish'
			sText = this._oRb.getText("BTN_PUBLISH");
			this._oButtonPublish = new sap.m.Button({
				type:"Transparent",
				text : sText,
				visible : false,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			this._oButtonPublish.data("Action", "TRANSPORT", true);
			this._oButtonPublish.attachEvent('press', this._onTransport, this);

			// Space between Toolbar Elements
			oSpacerTop = new ToolbarSpacer();

			return FlexSettings.getInstance(FlUtils.getComponentClassName(this._oRootControl))
				.then(function(oSettings) {
					var bShowPublish = !oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured();
					this._oButtonPublish.setVisible(bShowPublish);
				}.bind(this))
				.catch(function(oError) {
					this._oButtonPublish.setVisible(false);
				}.bind(this))
				.then(function() {
					// set Content of Toolbar
					if (Utils.getFiori2Renderer()) {
						this._oToolBar.addContentLeft(oAdaptModeLabel);
						this._oToolBar.addContentRight(this._oButtonUndo);
						this._oToolBar.addContentRight(this._oButtonRedo);
						this._oToolBar.addContentRight(this._oButtonRestore);
						this._oToolBar.addContentRight(this._oButtonPublish);
						this._oToolBar.addContentRight(oButtonExit);
					} else {
						this._oToolBar.addContent(oAdaptModeLabel);
						this._oToolBar.addContent(oSpacerTop);
						this._oToolBar.addContent(this._oButtonUndo);
						this._oToolBar.addContent(this._oButtonRedo);
						this._oToolBar.addContent(this._oButtonRestore);
						this._oToolBar.addContent(this._oButtonPublish);
						this._oToolBar.addContent(oButtonExit);
					}
					sap.ui.getCore().applyChanges();
					this._oToolBar.addStyleClass("sapUiRTAToolBarContentVisible");
				}.bind(this));
		} else {
			this._oToolBar.addStyleClass("sapUiRTAToolBarContentVisible");
		}
	};

	/**
	 * Override the EXIT-Function
	 * @private
	 */
	ToolsMenu.prototype.exit = function() {
		// Remove the DOM-Element for the Toolbar
		jQuery("#RTA-Toolbar").remove();
	};

	/**
	 * Trigger transport
	 * @private
	 */
	ToolsMenu.prototype._onTransport = function() {
		this.fireTransport();
	};

	/**
	 * Makes the Toolbar(s) visible
	 * @public
	 */
	ToolsMenu.prototype.show = function() {
		var oRenderer = Utils.getFiori2Renderer();
		if (oRenderer) {
			oRenderer.showSubHeader(this._oToolBar.getId(), false, ["home", "app"]);
			oRenderer.setHeaderVisibility(false, false, ["home", "app"]);
			sap.ui.getCore().applyChanges();
		}
		this._oToolBar.addStyleClass("sapUiRTAToolBarVisible");
		this._oToolBar.removeStyleClass("sapUiRTAToolBarInvisible");
	};

	/**
	 * Makes the TOP Toolbar invisible
	 * @public
	 */
	ToolsMenu.prototype.hide = function() {
		return new Promise(function(resolve) {
			var oToolBarDOM = document.getElementsByClassName("sapUiRTAToolBar")[0];
			var fnAnimationEnd = function() {
				var oRenderer = Utils.getFiori2Renderer();
				if (oRenderer) {
					oRenderer.setHeaderVisibility(true, false, ["home", "app"]);
					oRenderer.hideSubHeader(this._oToolBar.getId(), false, ["home", "app"]);
					sap.ui.getCore().applyChanges();
					this._oToolBar.addStyleClass("sapUiRTAToolBarDisplayNone");
				}
				resolve();
				this.fireClose();
			}.bind(this);

			// all types of CSS3 animationend events for different browsers
			if (oToolBarDOM) {
				oToolBarDOM.addEventListener("webkitAnimationEnd", fnAnimationEnd);
				oToolBarDOM.addEventListener("animationend", fnAnimationEnd);
				oToolBarDOM.addEventListener("oanimationend", fnAnimationEnd);
	
				this._oToolBar.removeStyleClass("sapUiRTAToolBarContentVisible");
				this._oToolBar.removeStyleClass("sapUiRTAToolBarVisible");
				this._oToolBar.addStyleClass("sapUiRTAToolBarInvisible");
			} else {
				fnAnimationEnd();
			}
		}.bind(this));
	};

	/**
	 * Trigger undo
	 * @private
	 */
	ToolsMenu.prototype._onUndo = function() {

		this.fireUndo();
	};

	/**
	 * Trigger redo
	 * @private
	 */
	ToolsMenu.prototype._onRedo = function() {

		this.fireRedo();
	};

	/**
	 * Discard all the LREP changes and restore the default app state
	 * @private
	 */
	ToolsMenu.prototype._onRestore = function() {

		this.fireRestore();
	};

	/**
	 * Closing the ToolsMenu
	 * @public
	 */
	ToolsMenu.prototype.close = function() {

		this.fireToolbarClose();

	};

	/**
	 * Set the Application Title
	 * @param {string} sTitle Application Title
	 * @public
	 */
	// Method for setting the Application Title
	ToolsMenu.prototype.setTitle = function(sTitle) {
		var oLabel = this._oToolBar.getContent()[0];
		oLabel.setText(sTitle);
	};

	/**
	 * Set the root control
	 * @param {sap.ui.core.Control} oControl - SAPUI5 control
	 * @public
	 */
	ToolsMenu.prototype.setRootControl = function(oControl) {
		this._oRootControl = oControl;
	};

	/**
	 * Adapt the enablement of the und/redo buttons in the ToolsMenu
	 */
	ToolsMenu.prototype.adaptUndoRedoEnablement = function(bCanUndo,bCanRedo) {
		this._oButtonUndo.setEnabled(bCanUndo);
		this._oButtonRedo.setEnabled(bCanRedo);
	};

	/**
	 * Adapt the enablement of the Transport/Publish button in the ToolsMenu
	 * @param {Boolean}
	 * 			bChangesExists set to true if changes exists
	 */
	ToolsMenu.prototype.adaptTransportEnablement = function(bChangesExists) {
		this._oButtonPublish.setEnabled(bChangesExists);
	};

	/**
	 * Adapt the enablement of the Reset button in the ToolsMenu
	 * @param {Boolean}
	 * 			bChangesExists set to true if changes exists
	 */
	ToolsMenu.prototype.adaptRestoreEnablement = function(bChangesExists) {
		this._oButtonRestore.setEnabled(bChangesExists);
	};

	return ToolsMenu;

}, /* bExport= */ true);
