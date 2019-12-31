/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";var C={channels:{}};var o=jQuery.sap.getUriParameters().get("sap-ui-xx-support-origin");if(!o){var m=new window.URI(jQuery.sap.getModulePath('./'));var p=m.protocol()===""?window.location.protocol.replace(":",""):m.protocol();var h=m.host()===""?window.location.host:m.host();o=p+"://"+h;}C.origin=o;C.subscribe=function(c,a,b){if(!this.channels[c]){this.channels[c]=[{callback:a,context:b}];return;}this.channels[c].push({callback:a,context:b});};C.publish=function(c,P){var r=this._getReceivingWindow(),d={channelName:c,params:P};r.postMessage(d,this.origin);};C.destroyChanels=function(){C.channels={};};C._getReceivingWindow=function(){if(document.getElementById("sap-ui-supportToolsFrame")){return document.getElementById("sap-ui-supportToolsFrame").contentWindow;}return window.parent;};C.onmessage=function(e){var c=e.data.channelName,a=e.data.params,b=C.channels[c];if(!b){return;}b.forEach(function(d){d.callback.apply(d.context,[a]);});};if(window.addEventListener){window.addEventListener("message",C.onmessage,false);}else{window.attachEvent("onmessage",C.onmessage);}return C;},true);
