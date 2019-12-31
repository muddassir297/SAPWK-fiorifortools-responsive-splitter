/*!
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/base/ManagedObject"],function(B,M){"use strict";var a=B.extend("sap.suite.ui.commons.util.ManagedObjectRegister",{constructor:function(){B.apply(this,arguments);this._mRegister={};}});a.prototype.register=function(k,f){k=k[0].toUpperCase()+k.substr(1);var g="get"+k;if(typeof this._mRegister[k]!=="undefined"){this.destroyObject(k);}if(typeof f==="function"){this._mRegister[k]={fFactory:f,oValue:undefined};}else if(f instanceof M){this._mRegister[k]={fFactory:undefined,oValue:f};}else{jQuery.sap.log.error("oFactoryFunction must be either a factory function or a managed object.");return;}if(g!=="getObject"){this[g]=function(){return this.getObject(k);};}};a.prototype.getObject=function(k){k=k||"Object";var r=this._mRegister[k];if(typeof r.oValue==="undefined"){r.oValue=r.fFactory(k);}return r.oValue;};a.prototype.destroyObject=function(k){var r=this._mRegister[k];if(r.oValue){r.oValue.destroy();}if(k!=="Object"){delete this["get"+k];}delete this._mRegister[k];};a.prototype.destroyAll=function(){var k,r;for(k in this._mRegister){r=this._mRegister[k];if(r.oValue){r.oValue.destroy();}if(k!=="Object"){delete this["get"+k];}}this._mRegister={};};return a;});
