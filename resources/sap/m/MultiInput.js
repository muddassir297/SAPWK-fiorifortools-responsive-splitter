/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./Input','./Tokenizer','./Token','./library','sap/ui/Device','sap/ui/core/InvisibleText'],function(q,I,T,a,l,D,b){"use strict";var M=I.extend("sap.m.MultiInput",{metadata:{library:"sap.m",properties:{enableMultiLineMode:{type:"boolean",group:"Behavior",defaultValue:false},maxTokens:{type:"int",group:"Behavior"}},aggregations:{tokens:{type:"sap.m.Token",multiple:true,singularName:"token"},tokenizer:{type:"sap.m.Tokenizer",multiple:false,visibility:"hidden"},_tokensInfo:{type:"sap.ui.core.InvisibleText",multiple:false,visibility:"hidden"}},events:{tokenChange:{parameters:{type:{type:"string"},token:{type:"sap.m.Token"},tokens:{type:"sap.m.Token[]"},addedTokens:{type:"sap.m.Token[]"},removedTokens:{type:"sap.m.Token[]"}}},tokenUpdate:{type:{type:"string"},addedTokens:{type:"sap.m.Token[]"},removedTokens:{type:"sap.m.Token[]"}}}}});var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");M.prototype.init=function(){I.prototype.init.call(this);this._bIsValidating=false;this._tokenizer=new T();this.setAggregation("tokenizer",this._tokenizer);this._tokenizer.attachTokenChange(this._onTokenChange,this);this._tokenizer.attachTokenUpdate(this._onTokenUpdate,this);this.setShowValueHelp(true);this.setShowSuggestion(true);this.attachSuggestionItemSelected(this._onSuggestionItemSelected,this);this.attachLiveChange(this._onLiveChange,this);if(sap.ui.getCore().getConfiguration().getAccessibility()){var A=new b({text:r.getText("MULTIINPUT_ARIA_CONTAIN_TOKEN")});this.setAggregation("_tokensInfo",A);}};M.prototype._onTokenChange=function(c){var t=this.getTokens(),L=t.length;this.fireTokenChange(c.getParameters());this.invalidate();if(this._bUseDialog&&this._tokenizer.getParent()instanceof sap.m.Dialog){this._showAllTokens();return;}var f=q.sap.containsOrEquals(this.getDomRef(),document.activeElement);if(c.getParameter("type")==="tokensChanged"&&c.getParameter("removedTokens").length>0&&f){this.focus();}if(c.getParameter("type")==="added"&&L>1&&this.getEditable()&&this._isMultiLineMode&&!this.$("border").hasClass("sapMMultiInputMultiModeBorder")){this._showIndicator();}if(c.getParameter("type")==="removed"&&this._isMultiLineMode){if(L<2){this._removeIndicator();}}};M.prototype._onTokenUpdate=function(c){this.fireTokenUpdate(c.getParameters());this.invalidate();};M.prototype._onSuggestionItemSelected=function(e){var i=null,t=null,c=this,o=this._tokenizer.getTokens().length;if(this.getMaxTokens()&&o>=this.getMaxTokens()){return;}if(this._hasTabularSuggestions()){i=e.getParameter("selectedRow");}else{i=e.getParameter("selectedItem");if(i){t=new a({text:i.getText(),key:i.getKey()});}}if(i){var d=this.getValue();this._tokenizer._addValidateToken({text:d,token:t,suggestionObject:i,validationCallback:function(v){if(v){c.setValue("");}}});}if(this._bUseDialog&&this._tokenizer.getParent()instanceof sap.m.Dialog){var n=this._tokenizer.getTokens().length;if(o<n){this.setValue("");}if(this._tokenizer.getVisible()===false){this._tokenizer.setVisible(true);}if(this._oList instanceof sap.m.Table){this._oList.addStyleClass("sapMInputSuggestionTableHidden");}else{this._oList.destroyItems();}var s=this._oSuggestionPopup.getScrollDelegate();if(s){s.scrollTo(0,0,0);}this._oPopupInput.focus();}};M.prototype._onLiveChange=function(e){this._tokenizer._removeSelectedTokens();if(this._bUseDialog&&this._isMultiLineMode){var v=e.getParameter("newValue");if(this._oSuggestionPopup&&this._oSuggestionPopup.getContent().length>1&&v.length>0){this._tokenizer.setVisible(false);}else{this._tokenizer.setVisible(true);}}};M.prototype._showIndicator=function(){var t=this.getTokens(),i=t.length;this._tokenizer.setVisible(true);if(i>1){if(this.$().find(".sapMMultiInputIndicator").length!==0){this._removeIndicator();}var s="<span class=\"sapMMultiInputIndicator\">"+r.getText("MULTIINPUT_SHOW_MORE_TOKENS",i-1)+"</span>";this.$().find(".sapMMultiInputInputContainer").prepend(s);this._setValueInvisible();this._bShowIndicator=true;}};M.prototype._setValueInvisible=function(){this.$("inner").css("opacity","0");};M.prototype._setValueVisible=function(){this.$("inner").css("opacity","1");};M.prototype._showAllTokens=function(){this._tokenizer.setVisible(true);this._removeIndicator();};M.prototype._removeIndicator=function(){this.$().find(".sapMMultiInputIndicator").remove();this._bShowIndicator=false;};M.prototype.setEnableMultiLineMode=function(m){this.setProperty("enableMultiLineMode",m,true);if(m){this.$().addClass("sapMMultiInputMultiLine");}else{this.$().removeClass("sapMMultiInputMultiLine");}this.closeMultiLine();var t=this;if(this._bUseDialog){m=true;}if(m){if(this.getEditable()){this._showIndicator();}this._isMultiLineMode=true;if(this.getDomRef()){setTimeout(function(){t._tokenizer.scrollToEnd();},0);}}else{this._isMultiLineMode=false;this._showAllTokens();this._setValueVisible();if(this.getDomRef()){setTimeout(function(){t._tokenizer.scrollToEnd();},0);}}return this;};M.prototype._openMultiLineOnPhone=function(){var t=this;if(!this.getEditable()){return;}this._oSuggestionPopup.open();this._oSuggestionPopup.insertContent(this._tokenizer,0);this._tokenizer.setReverseTokens(true);var v=this._oPopupInput.getValue();if(this._oSuggestionPopup&&this._oSuggestionPopup.getContent().length>1&&v.length>0){this._tokenizer.setVisible(false);}else{this._tokenizer.setVisible(true);}this._tokenizer._oScroller.setHorizontal(false);this._tokenizer.addStyleClass("sapMTokenizerMultiLine");if(this._oSuggestionTable.getItems().length===0){this._oPopupInput.onsapenter=function(e){t._validateCurrentText();t._setValueInvisible();};}};M.prototype._openMultiLineOnDesktop=function(){var t=this;this._setValueVisible();this.$("border").addClass("sapMMultiInputMultiModeBorder");if(this._$input){this._$input.parents('.sapMMultiInputBorder').addClass("sapMMultiInputMultiModeInputContainer");}this.$().find(".sapMInputValHelp").attr("tabindex","-1");var p=this.getParent();this._originalOverflow=null;if(p&&p.$&&p.$().css("overflow")==="hidden"){this._originalOverflow=p.$().css("overflow");p.$().css("overflow","visible");}var P;if(this.$().closest('.sapUiVlt').length!==0){P=this.$().closest('.sapUiVlt');}else if(this.$().parent('[class*="sapUiRespGridSpan"]').length!==0){P=this.$().parent('[class*="sapUiRespGridSpan"]');}else if(this.$().parents(".sapUiRFLContainer").length!==0){P=this.$().parents(".sapUiRFLContainer");}if(P&&P.length>0&&P.css("overflow")==="hidden"){P.css("overflow","visible");}setTimeout(function(){t._showAllTokens();t._tokenizer.scrollToStart();},0);};M.prototype.openMultiLine=function(){var t=this.getTokens();if(!this.getEditable()){return;}if(this.getEnableMultiLineMode()&&t.length>0&&!D.system.phone){this._openMultiLineOnDesktop();}};M.prototype.closeMultiLine=function(){if(!this.getEditable()){return;}if(this._bUseDialog){this._oSuggestionPopup.close();this._tokenizer.setVisible(true);}else{this.$("border").removeClass("sapMMultiInputMultiModeBorder");if(this._$input){this._$input.parents('.sapMMultiInputBorder').removeClass("sapMMultiInputMultiModeInputContainer");}this.$().find(".sapMInputValHelp").removeAttr("tabindex");if(this._originalOverflow){var p=this.getParent();p.$().css("overflow",this._originalOverflow);}}};M.prototype.getScrollDelegate=function(){return this._tokenizer._oScroller;};M.prototype.onBeforeRendering=function(){var t=this.getAggregation("tokenizer"),i=this.getTokens().length,o,m="";if(t){t.toggleStyleClass("sapMTokenizerEmpty",t.getTokens().length===0);}if(sap.ui.getCore().getConfiguration().getAccessibility()){o=this.getAggregation("_tokensInfo");switch(i){case 0:m=r.getText("MULTIINPUT_ARIA_CONTAIN_TOKEN");break;case 1:m=r.getText("MULTIINPUT_ARIA_CONTAIN_ONE_TOKEN");break;default:m=r.getText("MULTIINPUT_ARIA_CONTAIN_SEVERAL_TOKENS",i);break;}o.setText(m);}I.prototype.onBeforeRendering.apply(this,arguments);};M.prototype.onAfterRendering=function(){this._tokenizer._doScrollToEnd();I.prototype.onAfterRendering.apply(this,arguments);};M.prototype.addValidator=function(v){this._tokenizer.addValidator(v);};M.prototype.removeValidator=function(v){this._tokenizer.removeValidator(v);};M.prototype.removeAllValidators=function(){this._tokenizer.removeAllValidators();};M.prototype.onsapnext=function(e){if(e.isMarked()){return;}var f=q(document.activeElement).control()[0];if(!f){return;}if(this._tokenizer===f||this._tokenizer.$().find(f.$()).length>0){this._scrollAndFocus();}};M.prototype.onsapbackspace=function(e){if(this.getCursorPosition()>0||!this.getEditable()||this.getValue().length>0){return;}T.prototype.onsapbackspace.apply(this._tokenizer,arguments);e.preventDefault();e.stopPropagation();};M.prototype.onsapdelete=function(e){if(!this.getEditable()){return;}if(this.getValue()&&!this._completeTextIsSelected()){return;}T.prototype.onsapdelete.apply(this._tokenizer,arguments);};M.prototype.onkeydown=function(e){if(e.which===q.sap.KeyCodes.TAB){T._changeAllTokensSelection(false);}if((e.ctrlKey||e.metaKey)&&e.which===q.sap.KeyCodes.A){if(this._tokenizer.getTokens().length>0){this._tokenizer.focus();this._tokenizer._changeAllTokensSelection(true);e.preventDefault();}}if((e.ctrlKey||e.metaKey)&&(e.which===q.sap.KeyCodes.C||e.which===q.sap.KeyCodes.INSERT)){this._tokenizer._copy();}if(((e.ctrlKey||e.metaKey)&&e.which===q.sap.KeyCodes.X)||(e.shiftKey&&e.which===q.sap.KeyCodes.DELETE)){if(this.getEditable()){this._tokenizer._cut();}else{this._tokenizer._copy();}}};M.prototype.onpaste=function(e){var o,i,v=[],A=[];if(this.getValueHelpOnly()){return;}if(window.clipboardData){o=window.clipboardData.getData("Text");}else{o=e.originalEvent.clipboardData.getData('text/plain');}var s=this._tokenizer._parseString(o);setTimeout(function(){if(s){if(this.fireEvent("_validateOnPaste",{texts:s},true)){var c="";for(i=0;i<s.length;i++){if(s[i]){var t=this._convertTextToToken(s[i]);if(t){v.push(t);}else{c=s[i];}}}this.updateDomValue(c);for(i=0;i<v.length;i++){if(this._tokenizer._addUniqueToken(v[i])){A.push(v[i]);}}if(A.length>0){this.fireTokenUpdate({addedTokens:A,removedTokens:[],type:T.TokenUpdateType.Added});}}this.cancelPendingSuggest();}}.bind(this),0);};M.prototype._convertTextToToken=function(t){var c=null,i=null,d=null,o=this._tokenizer.getTokens().length;if(!this.getEditable()){return null;}t=t.trim();if(!t){return null;}if(this._getIsSuggestionPopupOpen()){if(this._hasTabularSuggestions()){i=this._oSuggestionTable._oSelectedItem;}else{i=this._getSuggestionItem(t);}}if(i&&i.getText&&i.getKey){d=new a({text:i.getText(),key:i.getKey()});}var e=this;c=this._tokenizer._validateToken({text:t,token:d,suggestionObject:i,validationCallback:function(v){e._bIsValidating=false;if(v){e.setValue("");if(e._bUseDialog&&e._isMultiLineMode&&e._oSuggestionTable.getItems().length===0){var n=e._tokenizer.getTokens().length;if(o<n){e._oPopupInput.setValue("");}if(e._tokenizer.getVisible()===false){e._tokenizer.setVisible(true);}e._setAllTokenVisible();}}}});return c;};M.prototype.onsapprevious=function(e){if(this._getIsSuggestionPopupOpen()){return;}if(this.getCursorPosition()===0){if(e.srcControl===this){T.prototype.onsapprevious.apply(this._tokenizer,arguments);e.preventDefault();}}};M.prototype._scrollAndFocus=function(){this._tokenizer.scrollToEnd();this.$().find("input").focus();};M.prototype.onsaphome=function(e){if(this._tokenizer._checkFocus()){T.prototype.onsaphome.apply(this._tokenizer,arguments);}};M.prototype.onsapend=function(e){if(this._tokenizer._checkFocus()){T.prototype.onsapend.apply(this._tokenizer,arguments);e.preventDefault();}};M.prototype.onsapenter=function(e){var v=true;if(this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()){if(this._hasTabularSuggestions()){v=!this._oSuggestionTable.getSelectedItem();}else{v=!this._oList.getSelectedItem();}}if(v){this._validateCurrentText();}if(I.prototype.onsapenter){I.prototype.onsapenter.apply(this,arguments);}this.focus();};M.prototype._checkFocus=function(){return this.getDomRef()&&q.sap.containsOrEquals(this.getDomRef(),document.activeElement);};M.prototype.onsapfocusleave=function(e){var p=this._oSuggestionPopup,n=false,N=false,c=this._checkFocus(),R;if(p instanceof sap.m.Popover){if(e.relatedControlId){R=sap.ui.getCore().byId(e.relatedControlId).getFocusDomRef();n=q.sap.containsOrEquals(p.getFocusDomRef(),R);N=q.sap.containsOrEquals(this._tokenizer.getFocusDomRef(),R);}}if(!N&&!n&&!this._isMultiLineMode){this._tokenizer.scrollToEnd();}I.prototype.onsapfocusleave.apply(this,arguments);if(this._bIsValidating){return;}if(!this._bUseDialog&&!n&&e.relatedControlId!==this.getId()&&e.relatedControlId!==this._tokenizer.getId()&&!N&&!(this._isMultiLineMode&&this._bShowIndicator)){this._validateCurrentText(true);}if(!this._bUseDialog&&this._isMultiLineMode&&!this._bShowIndicator&&this.getEditable()){if(c||n){return;}this.closeMultiLine();this._showIndicator();}T.prototype.onsapfocusleave.apply(this._tokenizer,arguments);if(!this._bUseDialog&&this._isMultiLineMode&&this._bShowIndicator){var $=this.$().find(".sapMMultiInputBorder");$.scrollTop(0);}};M.prototype._onDialogClose=function(){this._validateCurrentText();this._tokenizer._oScroller.setHorizontal(true);this._tokenizer.removeStyleClass("sapMTokenizerMultiLine");this.setAggregation("tokenizer",this._tokenizer);this._tokenizer.setReverseTokens(false);this._tokenizer.invalidate();};M.prototype.ontap=function(e){if(document.activeElement===this._$input[0]){this._tokenizer.selectAllTokens(false);}I.prototype.ontap.apply(this,arguments);};M.prototype._onclick=function(e){if(this._bUseDialog){this._openMultiLineOnPhone();}};M.prototype.onfocusin=function(e){if(this.getEditable()&&this.getEnableMultiLineMode()){this.openMultiLine();}if(e.target===this.getFocusDomRef()){I.prototype.onfocusin.apply(this,arguments);}};M.prototype.onsapescape=function(e){this._tokenizer.selectAllTokens(false);this.selectText(0,0);I.prototype.onsapescape.apply(this,arguments);};M.prototype._validateCurrentText=function(e){var o=this._tokenizer.getTokens().length;var t=this.getValue();if(!t||!this.getEditable()){return;}t=t.trim();if(!t){return;}var i=null;if(e||this._getIsSuggestionPopupOpen()){if(this._hasTabularSuggestions()){i=this._oSuggestionTable._oSelectedItem;}else{i=this._getSuggestionItem(t,e);}}var c=null;if(i&&i.getText&&i.getKey){c=new a({text:i.getText(),key:i.getKey()});}var d=this;if(!this.getMaxTokens()||this.getTokens().length<this.getMaxTokens()){this._bIsValidating=true;this._tokenizer._addValidateToken({text:t,token:c,suggestionObject:i,validationCallback:function(v){d._bIsValidating=false;if(v){d.setValue("");if(d._bUseDialog&&d._isMultiLineMode&&d._oSuggestionTable.getItems().length===0){var n=d._tokenizer.getTokens().length;if(o<n){d._oPopupInput.setValue("");}if(d._tokenizer.getVisible()===false){d._tokenizer.setVisible(true);}}}}});}};M.prototype.getCursorPosition=function(){return this._$input.cursorPos();};M.prototype._completeTextIsSelected=function(){var i=this._$input[0];if(i.selectionStart!==0){return false;}if(i.selectionEnd!==this.getValue().length){return false;}return true;};M.prototype._getIsSuggestionPopupOpen=function(){return this._oSuggestionPopup&&this._oSuggestionPopup.isOpen();};M.prototype.setEditable=function(e){e=this.validateProperty("editable",e);if(e===this.getEditable()){return this;}if(e&&(this.getEnableMultiLineMode()||this._bUseDialog)&&this.getTokens().length>1){this._bShowIndicator=true;}else{this._bShowIndicator=false;}if(I.prototype.setEditable){I.prototype.setEditable.apply(this,arguments);}this._tokenizer.setEditable(e);return this;};M.prototype._findItem=function(t,c,e,g){if(!t){return;}if(!(c&&c.length)){return;}t=t.toLowerCase();var d=c.length;for(var i=0;i<d;i++){var f=c[i];var h=g(f);if(!h){continue;}h=h.toLowerCase();if(h===t){return f;}if(!e&&h.indexOf(t)===0){return f;}}};M.prototype._getSuggestionItem=function(t,e){var c=null;var d=null;if(this._hasTabularSuggestions()){c=this.getSuggestionRows();d=this._findItem(t,c,e,function(R){var f=R.getCells();var g=null;if(f){var i;for(i=0;i<f.length;i++){if(f[i].getText){g=f[i].getText();break;}}}return g;});}else{c=this.getSuggestionItems();d=this._findItem(t,c,e,function(d){return d.getText();});}return d;};M.prototype.addToken=function(t){this._tokenizer.addToken(t);return this;};M.prototype.removeToken=function(t){return this._tokenizer.removeToken(t);};M.prototype.removeAllTokens=function(){return this._tokenizer.removeAllTokens();};M.prototype.getTokens=function(){return this._tokenizer.getTokens();};M.prototype.insertToken=function(t,i){this._tokenizer.insertToken(t,i);return this;};M.prototype.indexOfToken=function(t){return this._tokenizer.indexOfToken(t);};M.prototype.destroyTokens=function(){this._tokenizer.destroyTokens();return this;};M.prototype.updateTokens=function(){this.destroyTokens();this.updateAggregation("tokens");};M.prototype.getAggregation=function(A,d){var t;if(A==="tokens"){t=this.getTokens();if(t.length===0){t=d||null;}return t;}else{return I.prototype.getAggregation.apply(this,arguments);}};M.prototype.clone=function(){var c,t;this._tokenizer.detachTokenChange(this._onTokenChange,this);this.detachSuggestionItemSelected(this._onSuggestionItemSelected,this);this.detachLiveChange(this._onLiveChange,this);c=I.prototype.clone.apply(this,arguments);t=this._tokenizer.clone();c._tokenizer=t;c.setAggregation("tokenizer",t,true);this._tokenizer.attachTokenChange(this._onTokenChange,this);this.attachSuggestionItemSelected(this._onSuggestionItemSelected,this);this.attachLiveChange(this._onLiveChange,this);return c;};M.prototype.getPopupAnchorDomRef=function(){return this.getDomRef("border");};M.prototype.setTokens=function(t){var v,V=[],i;if(Array.isArray(t)){for(i=0;i<t.length;i++){v=this.validateAggregation("tokens",t[i],true);V.push(v);}this._tokenizer.setTokens(V);}else{throw new Error("\""+t+"\" is of type "+typeof t+", expected array for aggregation tokens of "+this);}return this;};M.TokenChangeType={Added:"added",Removed:"removed",RemovedAll:"removedAll",TokensChanged:"tokensChanged"};M.WaitForAsyncValidation="sap.m.Tokenizer.WaitForAsyncValidation";M.prototype.getDomRefForValueStateMessage=M.prototype.getPopupAnchorDomRef;M.prototype.getAccessibilityInfo=function(){var t=this.getTokens().map(function(o){return o.getText();}).join(" ");var i=I.prototype.getAccessibilityInfo.apply(this,arguments);i.type=r.getText("ACC_CTR_TYPE_MULTIINPUT");i.description=((i.description||"")+" "+t).trim();return i;};return M;},true);
