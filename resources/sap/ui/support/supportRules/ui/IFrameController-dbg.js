sap.ui.define([
	"jquery.sap.global", 
	"sap/ui/base/ManagedObject", 
	"sap/ui/support/supportRules/WindowCommunicationBus"],
	function (jQuery, ManagedObject, CommunicationBus) {
		"use strict";

		var oIFrameController = null;

		function openFrame(sUrl) {
			var toolFrame = document.createElement("IFRAME");
			var style = toolFrame.style;

			toolFrame.id = "sap-ui-supportToolsFrame";
			toolFrame.src = sUrl;

			style.width = "100%";
			style.height = "50%";
			style.position = "absolute";
			style.left = "0";
			style.bottom = "0";
			style.border = "none";
			style.zIndex = "1001";
			// style.transition = "width 300ms ease-in-out, height 300ms ease-in-out";
			style.boxShadow = "1px -10px 42px -4px #888";

			document.body.appendChild(toolFrame);

			// This interval is needed because sometimes an app is placed at
			// the body element which involves moving everything already there
			// into a new, hidden DIV element
			var parentCheckInterval = setTimeout(function () {
				if (toolFrame.parentNode.nodeName !== "BODY") {
					document.body.appendChild(toolFrame);
				}
			}, 500);

			// The interval should run for no more than 5sec
			setTimeout(function () {
				clearInterval(parentCheckInterval);
			}, 5000);

			return toolFrame;
		}

		var IFrameController = ManagedObject.extend("sap.ui.support.IFrameController", {
			constructor: function () {
				if (!oIFrameController) {
					ManagedObject.apply(this, arguments);
					this._setCommunicationSubscriptions();
				} else {
					jQuery.sap.log.warning("Only one support tool allowed");
					return oIFrameController;
				}
			}
		});

		IFrameController.prototype._setCommunicationSubscriptions = function () {
			CommunicationBus.subscribe("ensureOpened", function(){
				if (document.getElementById("sap-ui-supportToolsFrame").style.height === "28px") {
					this.resizeFrame(true);
				}
			}, this);
			CommunicationBus.subscribe("resizeFrame", function (aParams) {
				oIFrameController.resizeFrame(aParams.bigger);
			});
		};

		IFrameController.prototype.injectFrame = function () {
			var sToolUrl = jQuery.sap.getModulePath("sap.ui.support.supportRules.ui",
					"/overlay.html?sap-ui-xx-formfactor=compact&sap-ui-xx-support-origin=" +
					window.location.protocol + "//" + window.location.host);

			openFrame(sToolUrl);
		};

		IFrameController.prototype.resizeFrame = function (bigger) {
			var toolFrameStyle = document.getElementById("sap-ui-supportToolsFrame").style;

			if (bigger) {
				if (toolFrameStyle.height === "50%") {
					toolFrameStyle.height = "100%";
				} else if (toolFrameStyle.height === "28px") {
					toolFrameStyle.height = "50%";
				}
			} else {
				if (toolFrameStyle.height === "100%") {
					toolFrameStyle.height = "50%";
				} else if (toolFrameStyle.height === "50%") {
					toolFrameStyle.height = "28px";
				}
			}
		};

		/**
		 * Toggles frame state between hidden and shown
		 * Default is shown
		 *
		 * @param hidden {boolean} should the frame hide or not
		 */
		IFrameController.prototype.toggleHide = function (hidden) {
			var toolFrameStyle = document.getElementById("sap-ui-supportToolsFrame").style;

			if (hidden) {
				this._originalSize = {
					width: toolFrameStyle.width,
					height: toolFrameStyle.height
				};

				toolFrameStyle.width = "170px";
				toolFrameStyle.height = "28px";
			} else {
				toolFrameStyle.width = this._originalSize.width;
				toolFrameStyle.height = this._originalSize.height;

				this._originalSize = null;
			}
		};

		IFrameController.prototype._stop = function () {
			this._oCssLink.parentNode.removeChild(this._oCssLink);
			this._oDomRef.parentNode.removeChild(this._oCssLink);
			this._oCore = null;
		};

		oIFrameController = new IFrameController();

		return oIFrameController;

	}, true);
