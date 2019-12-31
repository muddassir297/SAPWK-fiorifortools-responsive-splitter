sap.ui.define(["sap/ui/core/Component", 
	"sap/ui/model/resource/ResourceModel", 
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator"], function(
		Component,
		ResourceModel,
		MessageBox,
		BusyIndicator ) {

	"use strict";

	/*global jQuery, sap, localStorage, window */

	var sComponentName = "sap.ushell.plugins.rta";

	var RTAPlugin = sap.ui.core.Component.extend("sap.ushell.plugins.rta.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject("Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererCreated' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		},

		init: function () {
			var that = this;
			this.i18n = this.getModel("i18n").getResourceBundle();
			this._getRenderer().fail(function (sErrorMessage) {
				jQuery.sap.log.error(sErrorMessage, undefined, sComponentName);
			})
			.done(function (oRenderer) {

				var oAppLifeCycleService = sap.ushell.Container.getService("AppLifeCycle");
				
				/**
				 * Check if we are in a SAPUI5 application not on the Shell 
				 * and then check for RTA restart
				 */
				oAppLifeCycleService.attachAppLoaded(function (oEvent) {
					
					var bUI5App = that._checkUI5App();
					
					if (bUI5App && !oEvent.mParameters.homePage) {
						that._checkRestartRTA();
					}
				});

				/**
				 * Event handler for the "Adapt" button of the RTA FLP Plugin
				 * Checks the supported browsers and starts the RTA
				 * @param  {sap.ui.base.Event} oEvent the button click event
				 * @private
				 */
				var _fOnAdapt = function(oEvent) {
					var bSupportedBrowser = ((sap.ui.Device.browser.msie && sap.ui.Device.browser.version > 10) || sap.ui.Device.browser.webkit || sap.ui.Device.browser.firefox);
					
					if (!bSupportedBrowser) {
						MessageBox.error(that.i18n.getText("MSG_UNSUPPORTED_BROWSER"), {
							title: that.i18n.getText("ERROR_TITLE"),
							onClose: null
						});
					} else {
						window.setTimeout(function() {
							that._switchToAdaptionMode();
						},0);
					}
				};
				//Button will only be added once even when more instances of this component are created
				oRenderer.addActionButton("sap.ushell.ui.launchpad.ActionItem", {
					id: "RTA_Plugin_ActionButton",
					text: that.i18n.getText("RTA_BUTTON_TEXT"),
					icon: "sap-icon://wrench",
					press: _fOnAdapt
				}, true, false, [oRenderer.LaunchpadState.App]);
			});
		},

		exit: function () {
			if (this._oShellContainer && this._onRendererCreated) {
				this._oShellContainer.detachRendererCreatedEvent(this._onRendererCreated);
			}
		},

		/**
		 * Check if we are in a SAPUI5 application
		 * @private
		 * @returns {Boolean} if we are in a SAPUI5 application
		 */
		_checkUI5App: function() {
			var oCurrentApplication = this._getCurrentRunningApplication();
			var bUI5App = oCurrentApplication && oCurrentApplication.applicationType === "UI5";
			return bUI5App;
		},
		
		/**
		 * Checks if RTA needs to be restarted, e.g after 'Reset to default'
		 * @private
		 */
		_checkRestartRTA: function() {
			var bRestart = !!window.localStorage.getItem("sap.ui.rta.restart");
			
			if (bRestart) {
				window.localStorage.removeItem("sap.ui.rta.restart");
				this._switchToAdaptionMode();
			}
		},

		/**
		 * Gets the current root application
		 * @private
		 */
		_getCurrentRunningApplication: function() {
			var oAppLifeCycleService = sap.ushell.Container.getService("AppLifeCycle");
			var oApp = oAppLifeCycleService.getCurrentApplication();

			return oApp;
		},

		/**
		 * Leaves the RTA adaption mode and destroys the RTA
		 * @private
		 */
		_switchToDefaultMode: function() {
			if (this._oRTA) {
				this._oRTA.destroy();
				this._oRTA = null;
			}
		},

		/**
		 * Turns on the adaption mode of the RTA FLP plugin
		 * @private
		 */
		_switchToAdaptionMode: function() {
			var that = this;
			var bUI5App = this._checkUI5App();
			
			if (!bUI5App) {
				MessageBox.error(this.i18n.getText("MSG_UNSUPPORTED_APP"), {
					title: this.i18n.getText("ERROR_TITLE"),
					onClose: null
				});
				return;
			}
			var oCurrentRunningApp = this._getCurrentRunningApplication();
			var oRootControl = oCurrentRunningApp.componentInstance.getAggregation("rootControl");
			
			// Start Runtime Authoring
			if (!this._oRTA) {
				BusyIndicator.show(0);
				//load it on demand
				sap.ui.getCore().loadLibraries(["sap.ui.dt","sap.ui.rta"], {async: true}).then(function(){
					sap.ui.require(["sap/ui/rta/RuntimeAuthoring"], function(RuntimeAuthoring) {
						try {
							that._oRTA = new RuntimeAuthoring({
								rootControl: oRootControl
							});
	
							that._oRTA.attachEvent('start', function() {
								BusyIndicator.hide();
							}, that);
	
							that._oRTA.attachEvent('failed', function() {
								BusyIndicator.hide();
								that._switchToDefaultMode();
								MessageBox.error(this.i18n.getText("MSG_ADAPTUI_FAILED"), {
									title: this.i18n.getText("ERROR_TITLE"),
									onClose: null
								});
							}, that);
	
							that._oRTA.start();
	
							that._oRTA.attachEvent('stop', that._switchToDefaultMode, that);
						} catch (oError) {
							BusyIndicator.hide();
							jQuery.sap.log.error("exception occured while starting sap.ui.rta", oError.stack);
							that._switchToDefaultMode();
							MessageBox.error(that.i18n.getText("MSG_ADAPTUI_FAILED"), {
								title: that.i18n.getText("ERROR_TITLE"),
								onClose: null
							});
						}
					});
				});
			}
		}
	});
	return RTAPlugin;

}, /* bExport= */true);