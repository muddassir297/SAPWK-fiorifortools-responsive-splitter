/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","sap/m/ToolbarSpacer","sap/m/ButtonType","./SemanticConfiguration","./SemanticContainer"],function(q,T,B,S,a){"use strict";var b=a.extend("sap.f.semantic.SemanticFooter",{constructor:function(c,p){a.call(this,c,p);this._aCustomContent=[];this._aSemanticRightContent=[];this._iSemanticLeftContentCount=1;this._fnParentSubstitute=function(){return this._oParent;}.bind(this);this._insertSpacer();}});b.mPlacementMethodMap={footerLeft:"LeftContent",footerRight:"RightContent"};b.prototype.addCustomAction=function(c){c.setType(B.Transparent);this._callContainerAggregationMethod("addContent",c);this._aCustomContent.push(c);return this;};b.prototype.insertCustomAction=function(c,i){var C=this._getCustomContentInsertIndex(i);c.setType(B.Transparent);this._callContainerAggregationMethod("insertContent",c,C);this._aCustomContent.splice(i,0,c);return this;};b.prototype.getCustomActions=function(){return this._aCustomContent;};b.prototype.indexOfCustomAction=function(c){return this._aCustomContent.indexOf(c);};b.prototype.removeCustomAction=function(c){var r=this._callContainerAggregationMethod("removeContent",c);this._aCustomContent.splice(this._aCustomContent.indexOf(c),1);return r;};b.prototype.removeAllCustomActions=function(){var r=[];this._aCustomContent.forEach(function(c){var R=this._callContainerAggregationMethod("removeContent",c);if(R){r.push(c);}},this);this._aCustomContent=[];return r;};b.prototype.destroyCustomActions=function(){this.removeAllCustomActions(true).forEach(function(c){c.destroy();});return this;};b.prototype.addContent=function(s,p){this["_insertSemantic"+b.mPlacementMethodMap[p]].call(this,s);return this;};b.prototype.removeContent=function(s,p){this["_removeSemantic"+b.mPlacementMethodMap[p]].call(this,s);return this;};b.prototype.destroy=function(){this._aCustomContent=null;this._aSemanticRightContent=null;this._oSpacer=null;return a.prototype.destroy.call(this);};b.prototype._insertSemanticLeftContent=function(s){var c=this._getControl(s),C=this._getControlOrder(s),i=this._getSemanticLeftContentInsertIndex(C);this._callContainerAggregationMethod("insertContent",c,i);this._iSemanticLeftContentCount++;this._preProcessControl(c);return this;};b.prototype._insertSemanticRightContent=function(s){var c=this._getControl(s);this._aSemanticRightContent.push(s);this._callContainerAggregationMethod("insertContent",c,this._getSemanticRightContentInsertIndex(s));return this;};b.prototype._removeSemanticLeftContent=function(s){var c=this._getControl(s);this._callContainerAggregationMethod("removeContent",c);this._iSemanticLeftContentCount--;this._postProcessControl(c);return s;};b.prototype._removeSemanticRightContent=function(s){var c=this._getControl(s);this._callContainerAggregationMethod("removeContent",c);this._aSemanticRightContent.splice(this._aSemanticRightContent.indexOf(s),1);return s;};b.prototype._getSemanticLeftContentInsertIndex=function(c){return this._iSemanticLeftContentCount>1?c:0;};b.prototype._getSemanticRightContentInsertIndex=function(s){this._aSemanticRightContent.sort(this._sortControlByOrder.bind(this));return this._iSemanticLeftContentCount+this._aSemanticRightContent.indexOf(s);};b.prototype._getCustomContentInsertIndex=function(i){return i+this._iSemanticLeftContentCount+this._aSemanticRightContent.length;};b.prototype._insertSpacer=function(){this._callContainerAggregationMethod("addContent",this._getSpacer());return this;};b.prototype._getSpacer=function(){if(!this._oSpacer){this._oSpacer=new T();}return this._oSpacer;};b.prototype._preProcessControl=function(c){if(!(typeof c._fnOriginalGetParent==="function")){c._fnOriginalGetParent=c.getParent;c.getParent=this._fnParentSubstitute;}};b.prototype._postProcessControl=function(c){if(c._fnOriginalGetParent){c.getParent=c._fnOriginalGetParent;delete c._fnOriginalGetParent;}};return b;},false);