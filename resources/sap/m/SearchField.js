/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Control','sap/ui/core/EnabledPropagator','sap/ui/core/IconPool','sap/ui/core/InvisibleText','./Suggest'],function(q,l,C,E,I,a,S){"use strict";var b=C.extend("sap.m.SearchField",{metadata:{library:"sap.m",properties:{value:{type:"string",group:"Data",defaultValue:null,bindable:"bindable"},width:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:null},enabled:{type:"boolean",group:"Behavior",defaultValue:true},visible:{type:"boolean",group:"Appearance",defaultValue:true},maxLength:{type:"int",group:"Behavior",defaultValue:0},placeholder:{type:"string",group:"Misc",defaultValue:null},showMagnifier:{type:"boolean",group:"Misc",defaultValue:true,deprecated:true},showRefreshButton:{type:"boolean",group:"Behavior",defaultValue:false},refreshButtonTooltip:{type:"string",group:"Misc",defaultValue:null},showSearchButton:{type:"boolean",group:"Behavior",defaultValue:true},enableSuggestions:{type:"boolean",group:"Behavior",defaultValue:false},selectOnFocus:{type:"boolean",group:"Behavior",defaultValue:true,deprecated:true}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},defaultAggregation:"suggestionItems",aggregations:{suggestionItems:{type:"sap.m.SuggestionItem",multiple:true,singularName:"suggestionItem"}},events:{search:{parameters:{query:{type:"string"},suggestionItem:{type:"sap.m.SuggestionItem"},refreshButtonPressed:{type:"boolean"},clearButtonPressed:{type:"boolean"}}},liveChange:{parameters:{newValue:{type:"string"}}},suggest:{parameters:{suggestValue:{type:"string"}}}}}});E.call(b.prototype);I.insertFontFaceStyle();b.prototype.init=function(){this._inputEvent=sap.ui.Device.browser.internet_explorer&&sap.ui.Device.browser.version<10?"keyup":"input";var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");this.setProperty("placeholder",r.getText("FACETFILTER_SEARCH"),true);this._sAriaF5Label=new sap.ui.core.InvisibleText({text:r.getText("SEARCHFIELD_ARIA_F5")}).toStatic();};b.prototype.getFocusDomRef=function(){return this._inputElement;};b.prototype.getFocusInfo=function(){var f=C.prototype.getFocusInfo.call(this),i=this.getDomRef("I");if(i){q.extend(f,{cursorPos:q(i).cursorPos()});}return f;};b.prototype.applyFocusInfo=function(f){C.prototype.applyFocusInfo.call(this,f);if("cursorPos"in f){this.$("I").cursorPos(f.cursorPos);}return this;};b.prototype.getWidth=function(){return this.getProperty("width")||"100%";};b.prototype._hasPlacehoder=(function(){return"placeholder"in document.createElement("input");}());b.prototype.onBeforeRendering=function(){if(this._inputElement){this.$().find(".sapMSFB").off();this.$().off();q(this._inputElement).off();this._inputElement=null;}};b.prototype.onAfterRendering=function(){this._inputElement=this.getDomRef("I");this._resetElement=this.getDomRef("reset");q(this._inputElement).on(this._inputEvent,this.onInput.bind(this)).on("search",this.onSearch.bind(this)).on("focus",this.onFocus.bind(this)).on("blur",this.onBlur.bind(this));if(sap.ui.Device.system.desktop||sap.ui.Device.system.combi){this.$().on("touchstart mousedown",this.onButtonPress.bind(this));if(sap.ui.Device.browser.firefox){this.$().find(".sapMSFB").on("mouseup mouseout",function(f){q(f.target).removeClass("sapMSFBA");});}}else if(window.PointerEvent){q(this._resetElement).on("touchstart",function(){this._active=document.activeElement;}.bind(this));}};b.prototype.clear=function(O){var v=O&&O.value||"";if(!this._inputElement||this.getValue()===v){return;}this.setValue(v);u(this);this.fireLiveChange({newValue:v});this.fireSearch({query:v,refreshButtonPressed:false,clearButtonPressed:!!(O&&O.clearButton)});};b.prototype.exit=function(){if(this._oSuggest){this._oSuggest.destroy(true);this._oSuggest=null;}if(this._sAriaF5Label){this._sAriaF5Label.destroy();this._sAriaF5Label=null;}};b.prototype.onButtonPress=function(f){if(f.originalEvent.button===2){return;}if(document.activeElement===this._inputElement&&f.target!==this._inputElement){f.preventDefault();}if(sap.ui.Device.browser.firefox){var g=q(f.target);if(g.hasClass("sapMSFB")){g.addClass("sapMSFBA");}}};b.prototype.ontouchend=function(f){if(f.originalEvent.button===2){return;}var g=f.target;if(g.id==this.getId()+"-reset"){c(this);this._bSuggestionSuppressed=true;var h=!this.getValue();this.clear({clearButton:true});var i=document.activeElement;if((sap.ui.Device.system.desktop||h||/(INPUT|TEXTAREA)/i.test(i.tagName)||i===this._resetElement&&this._active===this._inputElement)&&(i!==this._inputElement)){this._inputElement.focus();}}else if(g.id==this.getId()+"-search"){c(this);if(sap.ui.Device.system.desktop&&!this.getShowRefreshButton()&&(document.activeElement!==this._inputElement)){this._inputElement.focus();}this.fireSearch({query:this.getValue(),refreshButtonPressed:!!(this.getShowRefreshButton()&&!this.$().hasClass("sapMFocus")),clearButtonPressed:false});}else{this.onmouseup(f);}};b.prototype.onmouseup=function(f){if(this.getEnabled()&&f.target.tagName=="FORM"){this._inputElement.focus();}};b.prototype.onSearch=function(f){var v=this._inputElement.value;this.setValue(v);this.fireSearch({query:v,refreshButtonPressed:false,clearButtonPressed:false});if(!sap.ui.Device.system.desktop){this._blur();}};b.prototype._blur=function(){var t=this;window.setTimeout(function(){if(t._inputElement){t._inputElement.blur();}},13);};b.prototype.onChange=function(f){this.setValue(this._inputElement.value);};b.prototype.onInput=function(f){var v=this._inputElement.value;if(v!=this.getValue()){this.setValue(v);this.fireLiveChange({newValue:v});if(this.getEnableSuggestions()){this.fireSuggest({suggestValue:v});u(this);}}};b.prototype.onkeydown=function(f){var v;if(f.which===q.sap.KeyCodes.F5||f.which===q.sap.KeyCodes.ENTER){this.$("search").toggleClass("sapMSFBA",true);f.stopPropagation();f.preventDefault();}if(f.which===q.sap.KeyCodes.ESCAPE){if(d(this)){c(this);f.setMarked();}else{v=this.getValue();if(v===this._sOriginalValue){this._sOriginalValue="";}this.clear({value:this._sOriginalValue});if(v!==this.getValue()){f.setMarked();}}f.preventDefault();}};b.prototype.onkeyup=function(f){var g;var h;if(f.which===q.sap.KeyCodes.F5||f.which===q.sap.KeyCodes.ENTER){this.$("search").toggleClass("sapMSFBA",false);if(d(this)){c(this);if((g=this._oSuggest.getSelected())>=0){h=this.getSuggestionItems()[g];this.setValue(h.getSuggestionText());}}this.fireSearch({query:this.getValue(),suggestionItem:h,refreshButtonPressed:this.getShowRefreshButton()&&f.which===q.sap.KeyCodes.F5,clearButtonPressed:false});}};b.prototype.onFocus=function(f){if(sap.ui.Device.browser.internet_explorer&&!document.hasFocus()){return;}this.$().toggleClass("sapMFocus",true);if(this.getShowRefreshButton()){this.$("search").removeAttr("title");}this._sOriginalValue=this.getValue();if(this.getEnableSuggestions()){if(!this._bSuggestionSuppressed){this.fireSuggest({suggestValue:this.getValue()});}else{this._bSuggestionSuppressed=false;}}};b.prototype.onBlur=function(f){var t;this.$().toggleClass("sapMFocus",false);if(this._bSuggestionSuppressed){this._bSuggestionSuppressed=false;}if(this.getShowRefreshButton()){t=this.getRefreshButtonTooltip();if(t){this.$("search").attr("title",t);}}};b.prototype.setValue=function(v){v=v||"";if(this._inputElement){if(this._inputElement.value!==v){this._inputElement.value=v;}var $=this.$();if($.hasClass("sapMSFVal")==!v){$.toggleClass("sapMSFVal",!!v);}}this.setProperty("value",v,true);return this;};b.prototype.onsapshow=function(f){if(this.getEnableSuggestions()){if(d(this)){c(this);}else{this.fireSuggest({suggestValue:this.getValue()});}}};b.prototype.onsaphide=function(f){this.suggest(false);};function s(f,g,i,r){var h;if(d(f)){h=f._oSuggest.setSelected(i,r);if(h>=0){f.setValue(f.getSuggestionItems()[h].getSuggestionText());}g.preventDefault();}}b.prototype.onsapdown=function(f){s(this,f,1,true);};b.prototype.onsapup=function(f){s(this,f,-1,true);};b.prototype.onsaphome=function(f){s(this,f,0,false);};b.prototype.onsapend=function(f){s(this,f,-1,false);};b.prototype.onsappagedown=function(f){s(this,f,10,true);};b.prototype.onsappageup=function(f){s(this,f,-10,true);};b.prototype.getPopupAnchorDomRef=function(){return this.getDomRef("F");};function c(f){f._oSuggest&&f._oSuggest.close();}function o(f){if(f.getEnableSuggestions()){if(!f._oSuggest){f._oSuggest=new S(f);}f._oSuggest.open();}}function d(f){return f._oSuggest&&f._oSuggest.isOpen();}b.prototype.suggest=function(f){if(this.getEnableSuggestions()){f=f===undefined||!!f;if(f&&(this.getSuggestionItems().length||sap.ui.Device.system.phone)){o(this);}else{c(this);}}return this;};function u(f){f._oSuggest&&f._oSuggest.update();}var e="suggestionItems";b.prototype.insertSuggestionItem=function(O,i,f){u(this);return C.prototype.insertAggregation.call(this,e,O,i,true);};b.prototype.addSuggestionItem=function(O,f){u(this);return C.prototype.addAggregation.call(this,e,O,true);};b.prototype.removeSuggestionItem=function(O,f){u(this);return C.prototype.removeAggregation.call(this,e,O,true);};b.prototype.removeAllSuggestionItems=function(f){u(this);return C.prototype.removeAllAggregation.call(this,e,true);};return b;},true);
