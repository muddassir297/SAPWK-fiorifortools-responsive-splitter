/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/dt/DesignTimeMetadata','sap/ui/dt/AggregationDesignTimeMetadata'],function(q,D,A){"use strict";var E=D.extend("sap.ui.dt.ElementDesignTimeMetadata",{metadata:{library:"sap.ui.dt"}});E.prototype.getDefaultData=function(d){var o=D.prototype.getDefaultData.apply(this,arguments);o.aggregations={layout:{ignore:true},dependents:{ignore:true},customData:{ignore:true},layoutData:{ignore:true},tooltip:{ignore:true}};return o;};E.prototype.hasAggregation=function(a){return!!this.getAggregations()[a];};E.prototype.getAggregation=function(a){return this.getAggregations()[a];};E.prototype.createAggregationDesignTimeMetadata=function(a){var d=this.getAggregation(a);return new A({libraryName:this.getLibraryName(),data:d});};E.prototype.getAggregations=function(){return this.getData().aggregations;};E.prototype.getRelevantContainer=function(e){var g=this.getData().getRelevantContainer;if(!g||typeof g!=="function"){return e.getParent();}return g(e);};E.prototype.getAggregationAction=function(a,e){var v;var o=this.getAggregations();var b=[];for(var s in o){if(o[s].actions&&o[s].actions[a]){v=o[s].actions[a];if(typeof v==="function"){v=v.call(null,e);}else if(typeof(v)==="string"){v={changeType:v};}if(v){v.aggregation=s;}b.push(v);}}return b;};E.prototype._getText=function(n){if(typeof n==="function"){return n();}else{return this.getLibraryText(n);}};E.prototype.getAggregationDescription=function(a,e){var c=this.getAggregation(a).childNames;if(typeof c==="function"){c=c.call(null,e);}if(c){return{singular:this._getText(c.singular),plural:this._getText(c.plural)};}};E.prototype.getName=function(e){var n=this.getData().name;if(typeof n==="function"){n=n.call(null,e);}if(n){return{singular:this._getText(n.singular),plural:this._getText(n.plural)};}};return E;},true);