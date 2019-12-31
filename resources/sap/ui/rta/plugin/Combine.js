/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/plugin/Plugin','sap/ui/dt/Selection','sap/ui/dt/OverlayRegistry','sap/ui/rta/Utils'],function(P,S,O,U){"use strict";var C=P.extend("sap.ui.rta.plugin.Combine",{metadata:{library:"sap.ui.rta",properties:{},associations:{},events:{}}});C.prototype._isEditable=function(o){var d=this._getEffectiveDesignTimeMetadata(o);var e=o.getElementInstance();if(!U.getPublicParentDesigntimeMetadata(o)){return false;}var c=this._getCombineAction(o);if(c&&c.changeType){return this.hasChangeHandler(c.changeType,d.getRelevantContainer(e))&&this.hasStableId(o);}else{return false;}};C.prototype._getEffectiveDesignTimeMetadata=function(o){var d;if(o.isInHiddenTree()){var p=o.getPublicParentAggregationOverlay();d=p.getDesignTimeMetadata();}else{d=o.getDesignTimeMetadata();}return d;};C.prototype._getCombineAction=function(o){return this._getEffectiveDesignTimeMetadata(o).getAction("combine",o.getElementInstance());};C.prototype._checkForSameRelevantContainer=function(s){var e=[];var r=[];for(var i=0,n=s.length;i<n;i++){e[i]=s[i].getElementInstance();r[i]=this._getEffectiveDesignTimeMetadata(s[i]).getRelevantContainer(e[i]);if(i>0){if((r[0]!==r[i])||(e[0].getMetadata().getName()!==e[i].getMetadata().getName())){return false;}}}return true;};C.prototype.isCombineAvailable=function(o){var s=this.getDesignTime().getSelection();if(s.length<=1){return false;}return(this._checkForSameRelevantContainer(s)&&this._isEditableByPlugin(o));};C.prototype.isCombineEnabled=function(o){var s=this.getDesignTime().getSelection();if(!this.isCombineAvailable(o)||s.length<=1){return false;}var a=s.map(function(b){return b.getElementInstance();});var A=s.every(function(b){var c=this._getCombineAction(b);if(!c){return false;}if(typeof c.isEnabled!=="undefined"){if(typeof c.isEnabled==="function"){return c.isEnabled(a);}else{return c.isEnabled;}}return true;},this);return A;};C.prototype.handleCombine=function(c){var e=O.getOverlay(c);var d=this._getEffectiveDesignTimeMetadata(e);var E;if(e.isInHiddenTree()){E=e.getPublicParentElementOverlay().getElementInstance();}else{E=c;}var t=[];var s=this.getDesignTime().getSelection();for(var i=0;i<s.length;i++){var o=s[i].getElementInstance();t.push(o);}var a=this.getCommandFactory().getCommandFor(E,"combine",{source:c,combineFields:t},d);this.fireElementModified({"command":a});};return C;},true);