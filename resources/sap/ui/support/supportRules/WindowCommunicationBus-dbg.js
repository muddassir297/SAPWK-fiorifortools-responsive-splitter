/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([],
	function () {
		"use strict";

		var CommunicationBus = {
			channels: {}
		};

		var origin = jQuery.sap.getUriParameters().get("sap-ui-xx-support-origin");

		if (!origin) {
			// When loading from CDN
			var modulePathURI = new window.URI(jQuery.sap.getModulePath('./'));
			var protocol = modulePathURI.protocol() === "" ?
					window.location.protocol.replace(":", "") : modulePathURI.protocol();

			var host = modulePathURI.host() === "" ?
					window.location.host : modulePathURI.host();

			origin = protocol + "://" + host;
		}

		CommunicationBus.origin = origin;

		CommunicationBus.subscribe = function (channelName, callback, context) {
			if (!this.channels[channelName]) {
				this.channels[channelName] = [{
					callback : callback,
					context: context
				}];
				return;
			}

			this.channels[channelName].push({
				callback : callback,
				context: context
			});
		};

		CommunicationBus.publish = function (channelName, aParams) {
			var receivingWindow = this._getReceivingWindow(),
				dataObject = {
					channelName: channelName,
					params: aParams
				};

			// TODO: we need to find a way to make sure we're executing on the
			// correct window. Issue happen in cases where we're too fast to
			// post messages to the iframe but it is not there yet
			receivingWindow.postMessage(dataObject, this.origin);
		};

		CommunicationBus.destroyChanels = function () {
			CommunicationBus.channels = {};
		};

		CommunicationBus._getReceivingWindow = function () {
			if (document.getElementById("sap-ui-supportToolsFrame")) {
				return document.getElementById("sap-ui-supportToolsFrame").contentWindow;
			}

			return window.parent;
		};

		CommunicationBus.onmessage = function (evt) {
			var channelName = evt.data.channelName,
				params = evt.data.params,
				callbackObjects = CommunicationBus.channels[channelName];

			if (!callbackObjects) {
				return;
			}

			callbackObjects.forEach(function (cbObj) {
				cbObj.callback.apply(cbObj.context , [params]);
			});
		};

		if (window.addEventListener) {
			window.addEventListener("message", CommunicationBus.onmessage, false);
		} else {
			window.attachEvent("onmessage", CommunicationBus.onmessage);
		}

		return CommunicationBus;
	}, true);
