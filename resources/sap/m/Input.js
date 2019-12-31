/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./Bar','./Dialog','./InputBase','./List','./Popover','sap/ui/core/Item','./ColumnListItem','./StandardListItem','./DisplayListItem','sap/ui/core/ListItem','./Table','./Toolbar','./ToolbarSpacer','./library','sap/ui/core/IconPool','sap/ui/core/InvisibleText'],function(q,B,D,I,L,P,a,C,S,b,c,T,d,e,l,f,g){"use strict";var h=I.extend("sap.m.Input",{metadata:{library:"sap.m",properties:{type:{type:"sap.m.InputType",group:"Data",defaultValue:sap.m.InputType.Text},maxLength:{type:"int",group:"Behavior",defaultValue:0},dateFormat:{type:"string",group:"Misc",defaultValue:'YYYY-MM-dd',deprecated:true},showValueHelp:{type:"boolean",group:"Behavior",defaultValue:false},showSuggestion:{type:"boolean",group:"Behavior",defaultValue:false},valueHelpOnly:{type:"boolean",group:"Behavior",defaultValue:false},filterSuggests:{type:"boolean",group:"Behavior",defaultValue:true},maxSuggestionWidth:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:null},startSuggestion:{type:"int",group:"Behavior",defaultValue:1},showTableSuggestionValueHelp:{type:"boolean",group:"Behavior",defaultValue:true},description:{type:"string",group:"Misc",defaultValue:null},fieldWidth:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:'50%'},valueLiveUpdate:{type:"boolean",group:"Behavior",defaultValue:false},selectedKey:{type:"string",group:"Data",defaultValue:""},textFormatMode:{type:"sap.m.InputTextFormatMode",group:"Misc",defaultValue:sap.m.InputTextFormatMode.Value},textFormatter:{type:"any",group:"Misc",defaultValue:""},suggestionRowValidator:{type:"any",group:"Misc",defaultValue:""},enableSuggestionsHighlighting:{type:"boolean",group:"Behavior",defaultValue:true}},defaultAggregation:"suggestionItems",aggregations:{suggestionItems:{type:"sap.ui.core.Item",multiple:true,singularName:"suggestionItem"},suggestionColumns:{type:"sap.m.Column",multiple:true,singularName:"suggestionColumn",bindable:"bindable"},suggestionRows:{type:"sap.m.ColumnListItem",multiple:true,singularName:"suggestionRow",bindable:"bindable"}},associations:{selectedItem:{type:"sap.ui.core.Item",multiple:false},selectedRow:{type:"sap.m.ColumnListItem",multiple:false}},events:{liveChange:{parameters:{value:{type:"string"}}},valueHelpRequest:{parameters:{fromSuggestions:{type:"boolean"}}},suggest:{parameters:{suggestValue:{type:"string"},suggestionColumns:{type:"sap.m.ListBase"}}},suggestionItemSelected:{parameters:{selectedItem:{type:"sap.ui.core.Item"},selectedRow:{type:"sap.m.ColumnListItem"}}},submit:{parameters:{value:{type:"string"}}}}}});f.insertFontFaceStyle();h._wordStartsWithValue=function(t,v){var i;while(t){if(q.sap.startsWithIgnoreCase(t,v)){return true;}i=t.indexOf(' ');if(i==-1){break;}t=t.substring(i+1);}return false;};h._DEFAULTFILTER=function(v,i){if(i instanceof c&&h._wordStartsWithValue(i.getAdditionalText(),v)){return true;}return h._wordStartsWithValue(i.getText(),v);};h._DEFAULTFILTER_TABULAR=function(v,o){var j=o.getCells(),i=0;for(;i<j.length;i++){if(j[i].getText){if(h._wordStartsWithValue(j[i].getText(),v)){return true;}}}return false;};h._DEFAULTRESULT_TABULAR=function(o){var j=o.getCells(),i=0;for(;i<j.length;i++){if(j[i].getText){return j[i].getText();}}return"";};h.prototype.init=function(){I.prototype.init.call(this);this._fnFilter=h._DEFAULTFILTER;this._bUseDialog=sap.ui.Device.system.phone;this._bFullScreen=sap.ui.Device.system.phone;this._iSetCount=0;this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.m");if(!h._sAriaPopupLabelId){h._sAriaPopupLabelId=new g({text:this._oRb.getText("INPUT_AVALIABLE_VALUES")}).toStatic().getId();}};h.prototype.exit=function(){this._deregisterEvents();this.cancelPendingSuggest();if(this._iRefreshListTimeout){q.sap.clearDelayedCall(this._iRefreshListTimeout);this._iRefreshListTimeout=null;}if(this._oSuggestionPopup){this._oSuggestionPopup.destroy();this._oSuggestionPopup=null;}if(this._oList){this._oList.destroy();this._oList=null;}if(this._oValueHelpIcon){this._oValueHelpIcon.destroy();this._oValueHelpIcon=null;}if(this._oSuggestionTable){this._oSuggestionTable.destroy();this._oSuggestionTable=null;}if(this._oButtonToolbar){this._oButtonToolbar.destroy();this._oButtonToolbar=null;}if(this._oShowMoreButton){this._oShowMoreButton.destroy();this._oShowMoreButton=null;}};h.prototype._resizePopup=function(){var t=this;if(this._oList&&this._oSuggestionPopup){if(this.getMaxSuggestionWidth()){this._oSuggestionPopup.setContentWidth(this.getMaxSuggestionWidth());}else{this._oSuggestionPopup.setContentWidth((this.$().outerWidth())+"px");}setTimeout(function(){if(t._oSuggestionPopup&&t._oSuggestionPopup.isOpen()&&t._oSuggestionPopup.$().outerWidth()<t.$().outerWidth()){t._oSuggestionPopup.setContentWidth((t.$().outerWidth())+"px");}},0);}};h.prototype.onBeforeRendering=function(){I.prototype.onBeforeRendering.call(this);this._deregisterEvents();};h.prototype.onAfterRendering=function(){var t=this;I.prototype.onAfterRendering.call(this);if(!this._bFullScreen){this._resizePopup();this._sPopupResizeHandler=sap.ui.core.ResizeHandler.register(this.getDomRef(),function(){t._resizePopup();});}if(this._bUseDialog&&this.getEditable()){this.$().on("click",q.proxy(function(E){if(this._onclick){this._onclick(E);}if(this.getShowSuggestion()&&this._oSuggestionPopup&&E.target.id!=this.getId()+"-vhi"){this._oSuggestionPopup.open();}},this));}};h.prototype._getDisplayText=function(i){var t=this.getTextFormatter();if(t){return t(i);}var s=i.getText(),k=i.getKey(),j=this.getTextFormatMode();switch(j){case sap.m.InputTextFormatMode.Key:return k;case sap.m.InputTextFormatMode.ValueKey:return s+' ('+k+')';case sap.m.InputTextFormatMode.KeyValue:return'('+k+') '+s;default:return s;}};h.prototype._onValueUpdated=function(n){if(this._bSelectingItem||n===this._sSelectedValue){return;}var k=this.getSelectedKey();if(k===''){return;}this.setProperty("selectedKey",'',true);this.setAssociation("selectedRow",null,true);this.setAssociation("selectedItem",null,true);this.fireSuggestionItemSelected({selectedItem:null,selectedRow:null});};h.prototype.setSelectionItem=function(i,j){if(!i){this.setAssociation("selectedItem",null,true);this.setProperty("selectedKey",'',true);this.setValue('');return;}this._bSelectingItem=true;var k=this._iSetCount,n;this.setAssociation("selectedItem",i,true);this.setProperty("selectedKey",i.getKey(),true);if(j){this.fireSuggestionItemSelected({selectedItem:i});}if(k!==this._iSetCount){n=this.getValue();}else{n=this._getDisplayText(i);}this._sSelectedValue=n;if(this._bUseDialog){this._oPopupInput.setValue(n);this._oPopupInput._doSelect();}else{this._$input.val(this._getInputValue(n));this.onChange();}this._iPopupListSelectedIndex=-1;if(!(this._bUseDialog&&this instanceof sap.m.MultiInput&&this._isMultiLineMode)){this._closeSuggestionPopup();}if(!sap.ui.Device.support.touch){this._doSelect();}this._bSelectingItem=false;};h.prototype.setSelectedItem=function(i){if(typeof i==="string"){i=sap.ui.getCore().byId(i);}if(i!==null&&!(i instanceof a)){return this;}this.setSelectionItem(i);return this;};h.prototype.setSelectedKey=function(k){k=this.validateProperty("selectedKey",k);if(this._hasTabularSuggestions()){this.setProperty("selectedKey",k,true);return this;}if(!k){this.setSelectionItem();return this;}var i=this.getSuggestionItemByKey(k);this.setSelectionItem(i);return this;};h.prototype.getSuggestionItemByKey=function(k){var j=this.getSuggestionItems()||[],o,i;for(i=0;i<j.length;i++){o=j[i];if(o.getKey()===k){return o;}}};h.prototype.setSelectionRow=function(o,i){if(!o){this.setAssociation("selectedRow",null,true);this.setProperty("selectedKey",'',true);this.setValue('');return;}this._bSelectingItem=true;var j,s=this.getSuggestionRowValidator();if(s){j=s(o);if(!(j instanceof a)){j=null;}}var k=this._iSetCount,K="",n;this.setAssociation("selectedRow",o,true);if(j){K=j.getKey();}this.setProperty("selectedKey",K,true);if(i){this.fireSuggestionItemSelected({selectedRow:o});}if(k!==this._iSetCount){n=this.getValue();}else{if(j){n=this._getDisplayText(j);}else{n=this._fnRowResultFilter(o);}}this._sSelectedValue=n;if(this._bUseDialog){this._oPopupInput.setValue(n);this._oPopupInput._doSelect();}else{this._$input.val(this._getInputValue(n));this.onChange();}this._iPopupListSelectedIndex=-1;if(!(this._bUseDialog&&this instanceof sap.m.MultiInput&&this._isMultiLineMode)){this._closeSuggestionPopup();}if(!sap.ui.Device.support.touch){this._doSelect();}this._bSelectingItem=false;};h.prototype.setSelectedRow=function(o){if(typeof o==="string"){o=sap.ui.getCore().byId(o);}if(o!==null&&!(o instanceof C)){return this;}this.setSelectionRow(o);return this;};h.prototype._getValueHelpIcon=function(){var t=this;if(!this._oValueHelpIcon){var u=f.getIconURI("value-help");this._oValueHelpIcon=f.createControlByURI({id:this.getId()+"-vhi",src:u,useIconTooltip:false,noTabStop:true});this._oValueHelpIcon.addStyleClass("sapMInputValHelpInner");this._oValueHelpIcon.attachPress(function(i){if(!t.getValueHelpOnly()){t.fireValueHelpRequest({fromSuggestions:false});}});}return this._oValueHelpIcon;};h.prototype._fireValueHelpRequestForValueHelpOnly=function(){if(this.getEnabled()&&this.getEditable()&&this.getShowValueHelp()&&this.getValueHelpOnly()){this.fireValueHelpRequest({fromSuggestions:false});}};h.prototype.ontap=function(E){I.prototype.ontap.call(this,E);this._fireValueHelpRequestForValueHelpOnly();};h.prototype.setWidth=function(w){return I.prototype.setWidth.call(this,w||"100%");};h.prototype.getWidth=function(){return this.getProperty("width")||"100%";};h.prototype.setFilterFunction=function(F){if(F===null||F===undefined){this._fnFilter=h._DEFAULTFILTER;return this;}this._fnFilter=F;return this;};h.prototype.setRowResultFunction=function(F){if(F===null||F===undefined){this._fnRowResultFilter=h._DEFAULTRESULT_TABULAR;return this;}this._fnRowResultFilter=F;return this;};h.prototype.setShowValueHelp=function(s){this.setProperty("showValueHelp",s);if(s&&!h.prototype._sAriaValueHelpLabelId){h.prototype._sAriaValueHelpLabelId=new g({text:this._oRb.getText("INPUT_VALUEHELP")}).toStatic().getId();}return this;};h.prototype.setValueHelpOnly=function(v){this.setProperty("valueHelpOnly",v);if(v&&!h.prototype._sAriaInputDisabledLabelId){h.prototype._sAriaInputDisabledLabelId=new g({text:this._oRb.getText("INPUT_DISABLED")}).toStatic().getId();}return this;};h.prototype._doSelect=function(s,E){if(sap.ui.Device.support.touch){return;}var o=this._$input[0];if(o){var r=this._$input;o.focus();r.selectText(s?s:0,E?E:r.val().length);}return this;};h.prototype._scrollToItem=function(i){var p=this._oSuggestionPopup,o=this._oList,s,j,k,t,m;if(!(p instanceof P)||!o){return;}s=p.getScrollDelegate();if(!s){return;}var n=o.getItems()[i],r=n&&n.getDomRef();if(!r){return;}j=p.getDomRef("cont").getBoundingClientRect();k=r.getBoundingClientRect();t=j.top-k.top;m=k.bottom-j.bottom;if(t>0){s.scrollTo(s._scrollX,Math.max(s._scrollY-t,0));}else if(m>0){s.scrollTo(s._scrollX,s._scrollY+m);}};h.prototype._isSuggestionItemSelectable=function(i){return i.getVisible()&&(this._hasTabularSuggestions()||i.getType()!==sap.m.ListType.Inactive);};h.prototype._onsaparrowkey=function(E,s,i){if(!this.getEnabled()||!this.getEditable()){return;}if(!this._oSuggestionPopup||!this._oSuggestionPopup.isOpen()){return;}if(s!=="up"&&s!=="down"){return;}E.preventDefault();E.stopPropagation();var F=false,o=this._oList,j=this.getSuggestionItems(),k=o.getItems(),m=this._iPopupListSelectedIndex,n,O=m;if(s==="up"&&m===0){return;}if(s=="down"&&m===k.length-1){return;}var p;if(i>1){if(s=="down"&&m+i>=k.length){s="up";i=1;k[m].setSelected(false);p=m;m=k.length-1;F=true;}else if(s=="up"&&m-i<0){s="down";i=1;k[m].setSelected(false);p=m;m=0;F=true;}}if(m===-1){m=0;if(this._isSuggestionItemSelectable(k[m])){O=m;F=true;}else{s="down";}}if(s==="down"){while(m<k.length-1&&(!F||!this._isSuggestionItemSelectable(k[m]))){k[m].setSelected(false);m=m+i;F=true;i=1;if(p===m){break;}}}else{while(m>0&&(!F||!k[m].getVisible()||!this._isSuggestionItemSelectable(k[m]))){k[m].setSelected(false);m=m-i;F=true;i=1;if(p===m){break;}}}if(!this._isSuggestionItemSelectable(k[m])){if(O>=0){k[O].setSelected(true).updateAccessibilityState();this.$("inner").attr("aria-activedescendant",k[O].getId());}return;}else{k[m].setSelected(true).updateAccessibilityState();this.$("inner").attr("aria-activedescendant",k[m].getId());}if(sap.ui.Device.system.desktop){this._scrollToItem(m);}if(sap.m.ColumnListItem&&k[m]instanceof sap.m.ColumnListItem){n=this._getInputValue(this._fnRowResultFilter(k[m]));}else{var r=(j[0]instanceof c?true:false);if(r){n=this._getInputValue(k[m].getLabel());}else{n=this._getInputValue(k[m].getTitle());}}this._$input.val(n);this._sSelectedSuggViaKeyboard=n;this._doSelect();this._iPopupListSelectedIndex=m;};h.prototype.onsapup=function(E){this._onsaparrowkey(E,"up",1);};h.prototype.onsapdown=function(E){this._onsaparrowkey(E,"down",1);};h.prototype.onsappageup=function(E){this._onsaparrowkey(E,"up",5);};h.prototype.onsappagedown=function(E){this._onsaparrowkey(E,"down",5);};h.prototype.onsaphome=function(E){if(this._oList){this._onsaparrowkey(E,"up",this._oList.getItems().length);}};h.prototype.onsapend=function(E){if(this._oList){this._onsaparrowkey(E,"down",this._oList.getItems().length);}};h.prototype.onsapescape=function(E){var i;if(this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()){E.originalEvent._sapui_handledByControl=true;this._iPopupListSelectedIndex=-1;this._closeSuggestionPopup();if(this._sBeforeSuggest!==undefined){if(this._sBeforeSuggest!==this.getValue()){i=this._lastValue;this.setValue(this._sBeforeSuggest);this._lastValue=i;}this._sBeforeSuggest=undefined;}return;}if(I.prototype.onsapescape){I.prototype.onsapescape.apply(this,arguments);}};h.prototype.onsapenter=function(E){if(I.prototype.onsapenter){I.prototype.onsapenter.apply(this,arguments);}this.cancelPendingSuggest();if(this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()){var s=this._oList.getSelectedItem();if(s){if(this._hasTabularSuggestions()){this.setSelectionRow(s,true);}else{this.setSelectionItem(s._oItem,true);}}else{if(this._iPopupListSelectedIndex>=0){this._fireSuggestionItemSelectedEvent();this._doSelect();this._iPopupListSelectedIndex=-1;}this._closeSuggestionPopup();}}if(this.getEnabled()&&this.getEditable()&&!(this.getValueHelpOnly()&&this.getShowValueHelp())){this.fireSubmit({value:this.getValue()});}};h.prototype.onsapfocusleave=function(E){var p=this._oSuggestionPopup;if(p instanceof P){if(E.relatedControlId&&q.sap.containsOrEquals(p.getDomRef(),sap.ui.getCore().byId(E.relatedControlId).getFocusDomRef())){this._bPopupHasFocus=true;this.focus();}else{if(this._$input.val()===this._sSelectedSuggViaKeyboard){this._sSelectedSuggViaKeyboard=null;}}}var F=sap.ui.getCore().byId(E.relatedControlId);if(!(p&&F&&q.sap.containsOrEquals(p.getDomRef(),F.getFocusDomRef()))){I.prototype.onsapfocusleave.apply(this,arguments);}};h.prototype.onmousedown=function(E){var p=this._oSuggestionPopup;if((p instanceof P)&&p.isOpen()){E.stopPropagation();}};h.prototype._deregisterEvents=function(){if(this._sPopupResizeHandler){sap.ui.core.ResizeHandler.deregister(this._sPopupResizeHandler);this._sPopupResizeHandler=null;}if(this._bUseDialog&&this._oSuggestionPopup){this.$().off("click");}};h.prototype.updateSuggestionItems=function(){this.updateAggregation("suggestionItems");this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return this;};h.prototype.cancelPendingSuggest=function(){if(this._iSuggestDelay){q.sap.clearDelayedCall(this._iSuggestDelay);this._iSuggestDelay=null;}};h.prototype._triggerSuggest=function(v){this.cancelPendingSuggest();this._bShouldRefreshListItems=true;if(!v){v="";}if(v.length>=this.getStartSuggestion()){this._iSuggestDelay=q.sap.delayedCall(300,this,function(){this._bBindingUpdated=false;this.fireSuggest({suggestValue:v});if(!this._bBindingUpdated){this._refreshItemsDelayed();}});}else if(this._bUseDialog){if(this._oList instanceof T){this._oList.addStyleClass("sapMInputSuggestionTableHidden");}else if(this._oList&&this._oList.destroyItems){this._oList.destroyItems();}}else if(this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()){this._iPopupListSelectedIndex=-1;this._closeSuggestionPopup();}};(function(){h.prototype.setShowSuggestion=function(v){this.setProperty("showSuggestion",v,true);this._iPopupListSelectedIndex=-1;if(v){this._lazyInitializeSuggestionPopup(this);}else{m(this);}return this;};h.prototype.setShowTableSuggestionValueHelp=function(v){this.setProperty("showTableSuggestionValueHelp",v,true);if(!this._oSuggestionPopup){return this;}if(v){this._addShowMoreButton();}else{this._removeShowMoreButton();}return this;};h.prototype._getShowMoreButton=function(){var t=this,M=this._oRb;return this._oShowMoreButton||(this._oShowMoreButton=new sap.m.Button({text:M.getText("INPUT_SUGGESTIONS_SHOW_ALL"),press:function(){if(t.getShowTableSuggestionValueHelp()){t.fireValueHelpRequest({fromSuggestions:true});t._iPopupListSelectedIndex=-1;t._closeSuggestionPopup();}}}));};h.prototype._getButtonToolbar=function(){var s=this._getShowMoreButton();return this._oButtonToolbar||(this._oButtonToolbar=new d({content:[new e(),s]}));};h.prototype._addShowMoreButton=function(t){if(!this._oSuggestionPopup||!t&&!this._hasTabularSuggestions()){return;}if(this._oSuggestionPopup instanceof D){var s=this._getShowMoreButton();this._oSuggestionPopup.setEndButton(s);}else{var i=this._getButtonToolbar();this._oSuggestionPopup.setFooter(i);}};h.prototype._removeShowMoreButton=function(){if(!this._oSuggestionPopup||!this._hasTabularSuggestions()){return;}if(this._oSuggestionPopup instanceof D){this._oSuggestionPopup.setEndButton(null);}else{this._oSuggestionPopup.setFooter(null);}};h.prototype.oninput=function(E){I.prototype.oninput.call(this,E);if(E.isMarked("invalid")){return;}var v=this._$input.val();if(this.getValueLiveUpdate()){this.setProperty("value",v,true);this._onValueUpdated(v);}this.fireLiveChange({value:v,newValue:v});if(this.getShowSuggestion()&&!this._bUseDialog){this._triggerSuggest(v);}};h.prototype.getValue=function(){return this.getDomRef("inner")&&this._$input?this._$input.val():this.getProperty("value");};h.prototype._refreshItemsDelayed=function(){q.sap.clearDelayedCall(this._iRefreshListTimeout);this._iRefreshListTimeout=q.sap.delayedCall(0,this,r,[this]);};h.prototype.addSuggestionItem=function(i){this.addAggregation("suggestionItems",i,true);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();k(this);return this;};h.prototype.insertSuggestionItem=function(i,n){this.insertAggregation("suggestionItems",n,i,true);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();k(this);return this;};h.prototype.removeSuggestionItem=function(i){var n=this.removeAggregation("suggestionItems",i,true);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return n;};h.prototype.removeAllSuggestionItems=function(){var i=this.removeAllAggregation("suggestionItems",true);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return i;};h.prototype.destroySuggestionItems=function(){this.destroyAggregation("suggestionItems",true);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return this;};h.prototype.addSuggestionRow=function(i){i.setType(sap.m.ListType.Active);this.addAggregation("suggestionRows",i);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();k(this);return this;};h.prototype.insertSuggestionRow=function(i,n){i.setType(sap.m.ListType.Active);this.insertAggregation("suggestionRows",n,i);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();k(this);return this;};h.prototype.removeSuggestionRow=function(i){var n=this.removeAggregation("suggestionRows",i);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return n;};h.prototype.removeAllSuggestionRows=function(){var i=this.removeAllAggregation("suggestionRows");this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return i;};h.prototype.destroySuggestionRows=function(){this.destroyAggregation("suggestionRows");this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return this;};h.prototype.bindAggregation=function(){var i=Array.prototype.slice.call(arguments);if(i[0]==="suggestionRows"||i[0]==="suggestionColumns"||i[0]==="suggestionItems"){k(this,i[0]==="suggestionRows"||i[0]==="suggestionColumns");this._bBindingUpdated=true;}this._callMethodInManagedObject.apply(this,["bindAggregation"].concat(i));return this;};h.prototype._lazyInitializeSuggestionPopup=function(){if(!this._oSuggestionPopup){j(this);}};h.prototype._closeSuggestionPopup=function(){if(this._oSuggestionPopup){this._bShouldRefreshListItems=false;this.cancelPendingSuggest();this._oSuggestionPopup.close();this.$("SuggDescr").text("");this.$("inner").removeAttr("aria-haspopup");this.$("inner").removeAttr("aria-activedescendant");}};function j(i){var M=i._oRb;if(i._bUseDialog){i._oPopupInput=new h(i.getId()+"-popup-input",{width:"100%",valueLiveUpdate:true,showValueHelp:i.getShowValueHelp(),valueHelpRequest:function(E){i.fireValueHelpRequest({fromSuggestions:true});i._iPopupListSelectedIndex=-1;i._closeSuggestionPopup();},liveChange:function(E){var v=E.getParameter("newValue");i._$input.val(i._getInputValue(i._oPopupInput.getValue()));i._triggerSuggest(v);i.fireLiveChange({value:v,newValue:v});}}).addStyleClass("sapMInputSuggInDialog");}i._oSuggestionPopup=!i._bUseDialog?(new P(i.getId()+"-popup",{showArrow:false,showHeader:false,placement:sap.m.PlacementType.Vertical,initialFocus:i}).attachAfterClose(function(){if(i._iPopupListSelectedIndex>=0){i._fireSuggestionItemSelectedEvent();}if(i._oList instanceof T){i._oList.removeSelections(true);}else{i._oList.destroyItems();}}).attachBeforeOpen(function(){i._sBeforeSuggest=i.getValue();})):(new D(i.getId()+"-popup",{beginButton:new sap.m.Button(i.getId()+"-popup-closeButton",{text:M.getText("MSGBOX_CLOSE"),press:function(){i._closeSuggestionPopup();}}),stretch:i._bFullScreen,contentHeight:i._bFullScreen?undefined:"20rem",customHeader:new B(i.getId()+"-popup-header",{contentMiddle:i._oPopupInput.addEventDelegate({onsapenter:function(){if(!(sap.m.MultiInput&&i instanceof sap.m.MultiInput)){i._closeSuggestionPopup();}}},this)}),horizontalScrolling:false,initialFocus:i._oPopupInput}).attachBeforeOpen(function(){i._oPopupInput.setPlaceholder(i.getPlaceholder());i._oPopupInput.setMaxLength(i.getMaxLength());}).attachBeforeClose(function(){i._$input.val(i._getInputValue(i._oPopupInput.getValue()));i.onChange();if(i instanceof sap.m.MultiInput&&i._bUseDialog){i._onDialogClose();}}).attachAfterClose(function(){if(i instanceof sap.m.MultiInput&&i._isMultiLineMode){i._showIndicator();}if(i._oList){if(T&&!(i._oList instanceof T)){i._oList.destroyItems();}else{i._oList.removeSelections(true);}}}).attachAfterOpen(function(){var v=i.getValue();i._oPopupInput.setValue(v);i._triggerSuggest(v);r(i);}));i._oSuggestionPopup.addStyleClass("sapMInputSuggestionPopup");i._oSuggestionPopup.addAriaLabelledBy(h._sAriaPopupLabelId);i.addDependent(i._oSuggestionPopup);if(!i._bUseDialog){o(i._oSuggestionPopup,i);}if(i._oList){i._oSuggestionPopup.addContent(i._oList);}if(i.getShowTableSuggestionValueHelp()){i._addShowMoreButton();}}function k(i,t){if(i._oList){return;}if(!i._hasTabularSuggestions()&&!t){i._oList=new L(i.getId()+"-popup-list",{width:"100%",showNoData:false,mode:sap.m.ListMode.SingleSelectMaster,rememberSelections:false,itemPress:function(E){var p=E.getParameter("listItem");i.setSelectionItem(p._oItem,true);}});i._oList.addEventDelegate({onAfterRendering:i._highlightListText.bind(i)});}else{if(i._fnFilter===h._DEFAULTFILTER){i._fnFilter=h._DEFAULTFILTER_TABULAR;}if(!i._fnRowResultFilter){i._fnRowResultFilter=h._DEFAULTRESULT_TABULAR;}i._oList=i._getSuggestionsTable();if(i.getShowTableSuggestionValueHelp()){i._addShowMoreButton(t);}}if(i._oSuggestionPopup){if(i._bUseDialog){i._oSuggestionPopup.addAggregation("content",i._oList,true);var R=i._oSuggestionPopup.$("scrollCont")[0];if(R){var n=sap.ui.getCore().createRenderManager();n.renderControl(i._oList);n.flush(R);n.destroy();}}else{i._oSuggestionPopup.addContent(i._oList);}}}function m(i){if(i._oSuggestionPopup){if(i._oList instanceof T){i._oSuggestionPopup.removeAllContent();i._removeShowMoreButton();}i._oSuggestionPopup.destroy();i._oSuggestionPopup=null;}if(i._oList instanceof L){i._oList.destroy();i._oList=null;}}function o(p,i){p.open=function(){this.openBy(i,false,true);};p.oPopup.setAnimations(function(R,n,O){O();},function(R,n,s){s();});}function r(n){var s=n.getShowSuggestion();var R=n._oRb;n._iPopupListSelectedIndex=-1;if(!s||!n._bShouldRefreshListItems||!n.getDomRef()||(!n._bUseDialog&&!n.$().hasClass("sapMInputFocused"))){return false;}var p,t=n.getSuggestionItems(),u=n.getSuggestionRows(),v=n._$input.val()||"",w=n._oList,F=n.getFilterSuggests(),H=[],x=0,y=n._oSuggestionPopup,z={ontouchstart:function(J){(J.originalEvent||J)._sapui_cancelAutoClose=true;}},A,i;if(n._oList){if(n._oList instanceof T){w.removeSelections(true);}else{w.destroyItems();}}if(v.length<n.getStartSuggestion()){if(!n._bUseDialog){n._iPopupListSelectedIndex=-1;this.cancelPendingSuggest();y.close();}else{if(n._hasTabularSuggestions()&&n._oList){n._oList.addStyleClass("sapMInputSuggestionTableHidden");}}n.$("SuggDescr").text("");n.$("inner").removeAttr("aria-haspopup");n.$("inner").removeAttr("aria-activedescendant");return false;}if(n._hasTabularSuggestions()){if(n._bUseDialog&&n._oList){n._oList.removeStyleClass("sapMInputSuggestionTableHidden");}for(i=0;i<u.length;i++){if(!F||n._fnFilter(v,u[i])){u[i].setVisible(true);H.push(u[i]);}else{u[i].setVisible(false);}}this._oSuggestionTable.invalidate();}else{var E=(t[0]instanceof c?true:false);for(i=0;i<t.length;i++){p=t[i];if(!F||n._fnFilter(v,p)){if(E){A=new b(p.getId()+"-dli");A.setLabel(p.getText());A.setValue(p.getAdditionalText());}else{A=new S(p.getId()+"-sli");A.setTitle(p.getText());}A.setType(p.getEnabled()?sap.m.ListType.Active:sap.m.ListType.Inactive);A._oItem=p;A.addEventDelegate(z);H.push(A);}}}x=H.length;var G="";if(x>0){if(x==1){G=R.getText("INPUT_SUGGESTIONS_ONE_HIT");}else{G=R.getText("INPUT_SUGGESTIONS_MORE_HITS",x);}n.$("inner").attr("aria-haspopup","true");if(!n._hasTabularSuggestions()){for(i=0;i<x;i++){w.addItem(H[i]);}}if(!n._bUseDialog){if(n._sCloseTimer){clearTimeout(n._sCloseTimer);n._sCloseTimer=null;}if(!y.isOpen()&&!n._sOpenTimer&&(this.getValue().length>=this.getStartSuggestion())){n._sOpenTimer=setTimeout(function(){n._resizePopup();n._sOpenTimer=null;y.open();},0);}}}else{G=R.getText("INPUT_SUGGESTIONS_NO_HIT");n.$("inner").removeAttr("aria-haspopup");n.$("inner").removeAttr("aria-activedescendant");if(!n._bUseDialog){if(y.isOpen()){n._sCloseTimer=setTimeout(function(){n._iPopupListSelectedIndex=-1;n.cancelPendingSuggest();y.close();},0);}}else{if(n._hasTabularSuggestions()&&n._oList){n._oList.addStyleClass("sapMInputSuggestionTableHidden");}}}n.$("SuggDescr").text(G);}})();h.prototype._createHighlightedText=function(i){var t=i.innerText,v=this.getValue().toLowerCase(),j=v.length,k=t.toLowerCase(),s,n='';if(!h._wordStartsWithValue(t,v)){return t;}var m=k.indexOf(v);if(m>0){m=k.indexOf(' '+v)+1;}if(m>-1){n+=t.substring(0,m);s=t.substring(m,m+j);n+='<span class="sapMInputHighlight">'+s+'</span>';n+=t.substring(m+j);}else{n=t;}return n;};h.prototype._highlightListText=function(){if(!this.getEnableSuggestionsHighlighting()){return;}var i,j,k=this._oList.$().find('.sapMDLILabel, .sapMSLITitleOnly, .sapMDLIValue');for(i=0;i<k.length;i++){j=k[i];j.innerHTML=this._createHighlightedText(j);}};h.prototype._highlightTableText=function(){if(!this.getEnableSuggestionsHighlighting()){return;}var i,j,k=this._oSuggestionTable.$().find('tbody .sapMLabel');for(i=0;i<k.length;i++){j=k[i];j.innerHTML=this._createHighlightedText(j);}};h.prototype.onfocusin=function(E){I.prototype.onfocusin.apply(this,arguments);this.$().addClass("sapMInputFocused");if(!this._bPopupHasFocus&&!this.getStartSuggestion()&&!this.getValue()){this._triggerSuggest(this.getValue());}this._bPopupHasFocus=undefined;};h.prototype.onsapshow=function(E){if(!this.getEnabled()||!this.getEditable()||!this.getShowValueHelp()){return;}this.fireValueHelpRequest({fromSuggestions:false});E.preventDefault();E.stopPropagation();};h.prototype.onsaphide=h.prototype.onsapshow;h.prototype.onsapselect=function(E){this._fireValueHelpRequestForValueHelpOnly();};h.prototype.onfocusout=function(E){I.prototype.onfocusout.apply(this,arguments);this.$().removeClass("sapMInputFocused");this.closeValueStateMessage(this);};h.prototype._hasTabularSuggestions=function(){return!!(this.getAggregation("suggestionColumns")&&this.getAggregation("suggestionColumns").length);};h.prototype._getSuggestionsTable=function(){var t=this;if(!this._oSuggestionTable){this._oSuggestionTable=new T(this.getId()+"-popup-table",{mode:sap.m.ListMode.SingleSelectMaster,showNoData:false,showSeparators:"All",width:"100%",enableBusyIndicator:false,rememberSelections:false,selectionChange:function(E){var s=E.getParameter("listItem");t.setSelectionRow(s,true);}});this._oSuggestionTable.addEventDelegate({onAfterRendering:this._highlightTableText.bind(this)});if(this._bUseDialog){this._oSuggestionTable.addStyleClass("sapMInputSuggestionTableHidden");}this._oSuggestionTable.updateItems=function(){T.prototype.updateItems.apply(this,arguments);t._refreshItemsDelayed();return this;};}return this._oSuggestionTable;};h.prototype._fireSuggestionItemSelectedEvent=function(){if(this._iPopupListSelectedIndex>=0){var s=this._oList.getItems()[this._iPopupListSelectedIndex];if(s){if(sap.m.ColumnListItem&&s instanceof sap.m.ColumnListItem){this.fireSuggestionItemSelected({selectedRow:s});}else{this.fireSuggestionItemSelected({selectedItem:s._oItem});}}this._iPopupListSelectedIndex=-1;}};h.prototype._callMethodInManagedObject=function(F,A){var i=Array.prototype.slice.call(arguments),s;if(A==="suggestionColumns"){s=this._getSuggestionsTable();return s[F].apply(s,["columns"].concat(i.slice(2)));}else if(A==="suggestionRows"){s=this._getSuggestionsTable();return s[F].apply(s,["items"].concat(i.slice(2)));}else{return sap.ui.core.Control.prototype[F].apply(this,i.slice(1));}};h.prototype.validateAggregation=function(A,o,m){return this._callMethodInManagedObject("validateAggregation",A,o,m);};h.prototype.setAggregation=function(A,o,s){this._callMethodInManagedObject("setAggregation",A,o,s);return this;};h.prototype.getAggregation=function(A,o){return this._callMethodInManagedObject("getAggregation",A,o);};h.prototype.indexOfAggregation=function(A,o){return this._callMethodInManagedObject("indexOfAggregation",A,o);};h.prototype.insertAggregation=function(A,o,i,s){this._callMethodInManagedObject("insertAggregation",A,o,i,s);return this;};h.prototype.addAggregation=function(A,o,s){this._callMethodInManagedObject("addAggregation",A,o,s);return this;};h.prototype.removeAggregation=function(A,o,s){return this._callMethodInManagedObject("removeAggregation",A,o,s);};h.prototype.removeAllAggregation=function(A,s){return this._callMethodInManagedObject("removeAllAggregation",A,s);};h.prototype.destroyAggregation=function(A,s){this._callMethodInManagedObject("destroyAggregation",A,s);return this;};h.prototype.getBinding=function(A){return this._callMethodInManagedObject("getBinding",A);};h.prototype.getBindingInfo=function(A){return this._callMethodInManagedObject("getBindingInfo",A);};h.prototype.getBindingPath=function(A){return this._callMethodInManagedObject("getBindingPath",A);};h.prototype.clone=function(){var i=sap.ui.core.Control.prototype.clone.apply(this,arguments),j;j=this.getBindingInfo("suggestionColumns");if(j){i.bindAggregation("suggestionColumns",q.extend({},j));}else{this.getSuggestionColumns().forEach(function(o){i.addSuggestionColumn(o.clone(),true);});}j=this.getBindingInfo("suggestionRows");if(j){i.bindAggregation("suggestionRows",q.extend({},j));}else{this.getSuggestionRows().forEach(function(r){i.addSuggestionRow(r.clone(),true);});}return i;};h.prototype.setValue=function(v){this._iSetCount++;I.prototype.setValue.call(this,v);this._onValueUpdated(v);return this;};h.prototype.getAccessibilityInfo=function(){var i=I.prototype.getAccessibilityInfo.apply(this,arguments);i.description=((i.description||"")+" "+this.getDescription()).trim();return i;};return h;},true);
