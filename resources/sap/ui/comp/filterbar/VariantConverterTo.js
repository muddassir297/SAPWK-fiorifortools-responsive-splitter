/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/comp/library','sap/ui/comp/valuehelpdialog/ValueHelpDialog'],function(q,l,V){"use strict";var a=function(){};a.prototype.convert=function(k,f,d,F){var b,i;var j,J,n=null;var s={SelectionVariantID:k};if(d&&f){j=JSON.parse(d);if(j){b=this._getFields(f);if(b&&b.length>0){for(i=0;i<b.length;i++){this._convertField(s,b[i],j,F);}}if(j._CUSTOM){if(typeof j._CUSTOM==="string"){J=JSON.parse(j._CUSTOM);}else{J=j._CUSTOM;}for(n in J){if(n){this._addSingleValue(s,n,this._getValue(J[n]));}}}}}return JSON.stringify(s);};a.prototype._getParameterMetaData=function(n,f){var i,j;var g;var F=f.getFilterBarViewMetadata();if(F){for(i=0;i<F.length;i++){g=F[i];for(j=0;j<g.fields.length;j++){if(n===g.fields[j].fieldName){return g.fields[j];}}}}if(f.getAnalyticalParameters){var A=f.getAnalyticalParameters();if(A){for(j=0;j<A.length;j++){if(n===A[j].fieldName){return A[j];}}}}return null;};a.prototype._convertField=function(s,f,c,F){var o,v,O=null;var r;var b;if(c&&f&&s){o=c[f];if(o){b=this._getParameterMetaData(f,F);if(b){if(b.isCustomFilterField){return;}if(b.filterRestriction===sap.ui.comp.smartfilterbar.FilterType.single){v=(o.value===undefined)?o:o.value;v=this._getValue(v);this._addSingleValue(s,f,v);}else if(b.filterRestriction===sap.ui.comp.smartfilterbar.FilterType.interval){if(o.conditionTypeInfo){this._convertFieldByValue(s,f,c);}else{r=this._addRangeEntry(s,f);if((b.type==="Edm.DateTime")&&!o.high){o.high=o.low;}else if((b.type==="Edm.String")&&!o.high){O="EQ";}if(b.type==="Edm.Time"){this._addRangeMultipleRangeValues(r,o.ranges,true);}else{this._addRangeLowHigh(r,o,O);}}}else if(b.filterRestriction===sap.ui.comp.smartfilterbar.FilterType.multiple){r=this._addRangeEntry(s,f);if(o.items&&o.items.length>0){this._addRangeMultipleSingleValues(r,o.items);}else if(o.ranges&&o.ranges.length>0){this._addRangeMultipleRangeValues(r,o.ranges);}else{this._addRangeSingleValue(r,o.value);}}else{this._convertFieldByValue(s,f,c);}}else{this._convertFieldByValue(s,f,c);}}}};a.prototype._convertFieldByValue=function(s,f,c){var o;var r;if(c&&f&&s){o=c[f];if(o){if(o.conditionTypeInfo){if(o.ranges&&o.ranges.length>0){r=this._addRangeEntry(s,f);this._addRanges(r,o.ranges);}}else if((o.ranges!==undefined)&&(o.items!==undefined)&&(o.value!==undefined)){r=this._addRangeEntry(s,f);if(o.ranges&&o.ranges.length>0){this._addRanges(r,o.ranges);}if(o.items&&o.items.length>0){this._addRangeMultipleSingleValues(r,o.items);}if(o.value){this._addRangeSingleValue(r,o.value);}}else if((o.items!==undefined)&&o.items&&(o.items.length>0)){r=this._addRangeEntry(s,f);this._addRangeMultipleSingleValues(r,o.items);}else if((o.low!==undefined)&&o.low&&(o.high!==undefined)&&o.high){r=this._addRangeEntry(s,f);this._addRangeLowHigh(r,o);}else if((o.value!==undefined)&&o.value){this._addSingleValue(s,f,o.value);}else if(o){this._addSingleValue(s,f,o);}}}};a.prototype._addRangeEntry=function(s,f){var o={PropertyName:f,Ranges:[]};if(!s.SelectOptions){s.SelectOptions=[];}s.SelectOptions.push(o);return o.Ranges;};a.prototype._addRanges=function(r,R){var s,o,L,h;for(var i=0;i<R.length;i++){s=R[i].exclude?"E":"I";L=this._getValue(R[i].value1);h=this._getValue(R[i].value2);if(R[i].operation===sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.Contains){o="CP";if(L){L="*"+L+"*";}}else if(R[i].operation===sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.StartsWith){o="CP";if(L){L=L+"*";}}else if(R[i].operation===sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EndsWith){o="CP";if(L){L="*"+L;}}else{o=R[i].operation;}r.push({Sign:s,Option:o,Low:L,High:h});}};a.prototype._addRangeMultipleSingleValues=function(r,I){for(var i=0;i<I.length;i++){r.push({Sign:"I",Option:"EQ",Low:this._getValue(I[i].key),High:null});}};a.prototype._addRangeMultipleRangeValues=function(r,I,t){for(var i=0;i<I.length;i++){r.push({Sign:"I",Option:t?"BT":"EQ",Low:this._getValue(I[i].value1),High:t?this._getValue(I[i].value2):null});}};a.prototype._addRangeSingleValue=function(r,v){r.push({Sign:"I",Option:"EQ",Low:this._getValue(v),High:null});};a.prototype._addRangeLowHigh=function(r,L,o){var O=o||"BT";r.push({Sign:"I",Option:O,Low:this._getValue(L.low),High:this._getValue(L.high)});};a.prototype._addSingleValue=function(s,f,v){if(!s.Parameters){s.Parameters=[];}s.Parameters.push({PropertyName:f,PropertyValue:v});};a.prototype._getFields=function(f){var r=[];if(f){for(var i=0;i<f.length;i++){r.push(f[i].name);}}return r;};a.prototype._getValue=function(v){if((v===null)||(v===undefined)){return null;}return""+v;};a.prototype._getControl=function(f,n){var c=null;var F=this._getParameterMetaData(n,f);if(F){c=F.control;}return c;};return a;},true);