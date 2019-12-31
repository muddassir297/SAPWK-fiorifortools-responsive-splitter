(function(){"use strict";jQuery.sap.declare('sap.ushell.renderers.fiori2.search.personalization.BrowserPersonalizationStorage');jQuery.sap.require('sap.ushell.renderers.fiori2.search.personalization.Personalizer');var P=sap.ushell.renderers.fiori2.search.personalization.Personalizer;var m=sap.ushell.renderers.fiori2.search.personalization.BrowserPersonalizationStorage=function(){this.init.apply(this,arguments);};var B=m;m.prototype={init:function(){},getItem:function(k){if(!this._isStorageSupported()){throw'not supported storage';}return this._getStorage(k);},setItem:function(k,d){if(!this._isStorageSupported()){throw'not supported storage';}this._putStorage(k,d);},getPersonalizer:function(k){return new P(k,this);},_isStorageSupported:function(){if(jQuery.sap.storage&&jQuery.sap.storage.isSupported()){return true;}else{return false;}},_getStorage:function(k){return jQuery.sap.storage.get("Search.Personalization."+k);},_putStorage:function(k,s){jQuery.sap.storage.put("Search.Personalization."+k,s);}};m.getInstance=function(){return new jQuery.Deferred().resolve(new B());};})();
