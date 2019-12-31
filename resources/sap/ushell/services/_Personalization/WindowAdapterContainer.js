// @copyright@
sap.ui.define(["sap/ushell/utils","sap/ushell/services/_Personalization/utils","sap/ushell/services/_Personalization/WindowAdapter"],function(u,p,W){"use strict";function a(C,s,b){this._oBackendContainer=b;this._oItemMap=new u.Map();this._sContainerKey=C;};function c(C){var i,k=C.getItemKeys();for(i=0;i<k.length;i=i+1){C.delItem(k[i]);}}a.prototype.load=function(){var d=new jQuery.Deferred(),i,k,t=this;if(W.prototype.data[this._sContainerKey]){this._oItemMap.entries=p.clone(W.prototype.data[this._sContainerKey]);if(this._oBackendContainer){c(this._oBackendContainer);k=this.getItemKeys();for(i=0;i<k.length;i=i+1){this._oBackendContainer.setItemValue(k[i],this._oItemMap.get(k[i]));}}d.resolve();}else{if(this._oBackendContainer){this._oBackendContainer.load().done(function(){k=t._oBackendContainer.getItemKeys();for(i=0;i<k.length;i=i+1){t.setItemValue(k[i],t._oBackendContainer.getItemValue(k[i]));}W.prototype.data[t._sContainerKey]=p.clone(t._oItemMap.entries);d.resolve();}).fail(function(m){d.reject(m);});}else{W.prototype.data[this._sContainerKey]={};d.resolve();}}return d.promise();};a.prototype.save=function(){var d=new jQuery.Deferred();W.prototype.data[this._sContainerKey]=p.clone(this._oItemMap.entries);if(this._oBackendContainer){this._oBackendContainer.save().done(function(){d.resolve();}).fail(function(m){d.reject(m);});}else{d.resolve();}return d.promise();};a.prototype.getItemKeys=function(){return this._oItemMap.keys();};a.prototype.containsItem=function(i){this._oItemMap.containsKey(i);};a.prototype.getItemValue=function(i){return this._oItemMap.get(i);};a.prototype.setItemValue=function(i,I){this._oItemMap.put(i,I);if(this._oBackendContainer){this._oBackendContainer.setItemValue(i,I);}};a.prototype.delItem=function(i){this._oItemMap.remove(i);if(this._oBackendContainer){this._oBackendContainer.delItem(i);}};return a;});
