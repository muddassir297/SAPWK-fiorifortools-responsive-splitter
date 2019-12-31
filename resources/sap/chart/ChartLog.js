/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";function C(t,n,m){this._type=t;this._name=n;this._message=m;}C.prototype.display=function(){if(this._type==="error"){jQuery.sap.log.error("[Error in user input] "+this._name,this._message,'sap.chart');}};return C;});
