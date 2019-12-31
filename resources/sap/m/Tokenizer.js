/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Control','sap/ui/core/delegate/ScrollEnablement','sap/ui/Device'],function(q,l,C,S,D){"use strict";var T=C.extend("sap.m.Tokenizer",{metadata:{library:"sap.m",properties:{editable:{type:"boolean",group:"Misc",defaultValue:true},width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null}},defaultAggregation:"tokens",aggregations:{tokens:{type:"sap.m.Token",multiple:true,singularName:"token"}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{tokenChange:{parameters:{type:{type:"string"},token:{type:"sap.m.Token"},tokens:{type:"sap.m.Token[]"},addedTokens:{type:"sap.m.Token[]"},removedTokens:{type:"sap.m.Token[]"}}},tokenUpdate:{type:{type:"string"},addedTokens:{type:"sap.m.Token[]"},removedTokens:{type:"sap.m.Token[]"}}}}});var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");T.prototype._sAriaTokenizerLabelId=new sap.ui.core.InvisibleText({text:r.getText("TOKENIZER_ARIA_LABEL")}).toStatic().getId();T.prototype.init=function(){this._bScrollToEndIsActive=false;this.bAllowTextSelection=false;this._aTokenValidators=[];this._oScroller=new S(this,this.getId()+"-scrollContainer",{horizontal:true,vertical:false,nonTouchScrolling:true});};T.prototype.getScrollDelegate=function(){return this._oScroller;};T.prototype.scrollToEnd=function(){if(!this._bScrollToEndIsActive){this._bScrollToEndIsActive=true;var t=this;var d=this.getDomRef();if(d){this._sResizeHandlerId=sap.ui.core.ResizeHandler.register(d,function(){t._doScrollToEnd();});}}this._doScrollToEnd();};T.prototype.setWidth=function(w){this.setProperty("width",w,true);this.$().css("width",this.getWidth());return this;};T.prototype.setPixelWidth=function(n){this._truncateLastToken(n);var w=(n/parseFloat(sap.m.BaseFontSize))+"rem";this.$().css("width",w);if(this._oScroller){this._oScroller.refresh();}};T.prototype._truncateLastToken=function(n){var a=this._removeLastTokensTruncation();if(a===null){return;}var t=this;var L=a.$();var s=null;s=function(){a.removeStyleClass("sapMTokenTruncate");this.$().removeAttr("style");this.detachSelect(s);t.scrollToEnd();};var w=L.width();if(!a.getSelected()&&n>=0&&w>=0&&n<w){L.outerWidth(n,true);a.addStyleClass("sapMTokenTruncate");a.attachSelect(s);}else{a.detachSelect(s);}this.scrollToEnd();};T.prototype._doScrollToEnd=function(){var t=this.getDomRef();if(!t){return;}var $=this.$();var s=$.find(".sapMTokenizerScrollContainer")[0];$[0].scrollLeft=s.scrollWidth;};T.prototype.scrollToStart=function(){this._deactivateScrollToEnd();var t=this.getDomRef();if(!t){return;}var m=q(t);m[0].scrollLeft=0;};T.prototype._deactivateScrollToEnd=function(){this._deregisterResizeHandler();this._bScrollToEndIsActive=false;};T.prototype._removeLastTokensTruncation=function(){var t=this.getTokens();var L=null;if(t.length>0){L=t[t.length-1];var $=L.$();if($.length>0){$[0].style.cssText="";}}return L;};T.prototype.getScrollWidth=function(){if(!this.getDomRef()){return 0;}this._removeLastTokensTruncation();return this.$().children(".sapMTokenizerScrollContainer")[0].scrollWidth;};T.prototype.onBeforeRendering=function(){this._deregisterResizeHandler();};T.prototype.onAfterRendering=function(){if(C.prototype.onAfterRendering){C.prototype.onAfterRendering.apply(this,arguments);}var t=this;if(this._bScrollToEndIsActive){this._sResizeHandlerId=sap.ui.core.ResizeHandler.register(this.getDomRef(),function(){t._doScrollToEnd();});}};T.prototype.invalidate=function(o){var p=this.getParent();if(p instanceof sap.m.MultiInput){p.invalidate(o);}else{C.prototype.invalidate.call(this,o);}};T.prototype.onsapfocusleave=function(e){if(document.activeElement==this.getDomRef()||!this._checkFocus()){this._changeAllTokensSelection(false);this._oSelectionOrigin=null;}};T.prototype.saptabnext=function(e){this._changeAllTokensSelection(false);};T.prototype.isAllTokenSelected=function(){if(this.getTokens().length===this.getSelectedTokens().length){return true;}return false;};T.prototype.onkeydown=function(e){if(e.which===q.sap.KeyCodes.TAB){this._changeAllTokensSelection(false);}if((e.ctrlKey||e.metaKey)&&e.which===q.sap.KeyCodes.A){this._iSelectedToken=this.getSelectedTokens().length;if(this.getTokens().length>0){this.focus();this._changeAllTokensSelection(true);e.preventDefault();}}if((e.ctrlKey||e.metaKey)&&(e.which===q.sap.KeyCodes.C||e.which===q.sap.KeyCodes.INSERT)){this._copy();}if(((e.ctrlKey||e.metaKey)&&e.which===q.sap.KeyCodes.X)||(e.shiftKey&&e.which===q.sap.KeyCodes.DELETE)){if(this.getEditable()){this._cut();}else{this._copy();}}};T.prototype._copy=function(){var s=this,c=function(e){var a=s.getSelectedTokens(),b="",t;for(var i=0;i<a.length;i++){t=a[i];b+=(i>0?"\r\n":"")+t.getText();}if(!b){return;}if(e.clipboardData){e.clipboardData.setData('text/plain',b);}else{e.originalEvent.clipboardData.setData('text/plain',b);}e.preventDefault();};document.addEventListener('copy',c);document.execCommand('copy');document.removeEventListener('copy',c);};T.prototype._cut=function(){var s=this;var c=function(e){var a=s.getSelectedTokens(),b="",d=[],t;for(var i=0;i<a.length;i++){t=a[i];b+=(i>0?"\r\n":"")+t.getText();if(t.getEditable()){s.removeToken(t);d.push(t);}}if(d.length>0){s.fireTokenUpdate({addedTokens:[],removedTokens:d,type:T.TokenUpdateType.Removed});}if(!b){return;}if(e.clipboardData){e.clipboardData.setData('text/plain',b);}else{e.originalEvent.clipboardData.setData('text/plain',b);}e.preventDefault();};document.addEventListener('cut',c);document.execCommand('cut');document.removeEventListener('cut',c);};T.prototype.onsapbackspace=function(e){if(this.getSelectedTokens().length===0){this.onsapprevious(e);}else if(this.getEditable()){this._removeSelectedTokens();}e.preventDefault();e.stopPropagation();};T.prototype.onsapdelete=function(e){if(this.getEditable()){this._removeSelectedTokens();}};T.prototype._ensureTokenVisible=function(t){var i=this.$().offset().left,a=t.$().offset().left;if(a<i){this.$().scrollLeft(this.$().scrollLeft()-i+a);}};T.prototype.onsapprevious=function(e){if(e.which===q.sap.KeyCodes.ARROW_UP){return;}var L=this.getTokens().length;if(L===0){return;}var f=q(document.activeElement).control()[0];if(f===this){return;}var i=f?this.getTokens().indexOf(f):-1;if(i==0){return;}if(i>0){var p=this.getTokens()[i-1];this._changeAllTokensSelection(false,p);p._changeSelection(true);p.focus();}else{var t=this.getTokens()[this.getTokens().length-1];t._changeSelection(true);t.focus();}this._deactivateScrollToEnd();e.setMarked();};T.prototype.onsapnext=function(e){if(e.which===q.sap.KeyCodes.ARROW_DOWN){return;}var L=this.getTokens().length;if(L===0){return;}var f=q(document.activeElement).control()[0];if(f===this){return;}var i=f?this.getTokens().indexOf(f):-1;if(i<L-1){var n=this.getTokens()[i+1];this._changeAllTokensSelection(false,n);n._changeSelection(true);n.focus();}else{return;}this._deactivateScrollToEnd();e.setMarked();};T.prototype.addValidator=function(v){if(typeof(v)==="function"){this._aTokenValidators.push(v);}};T.prototype.removeValidator=function(v){var i=this._aTokenValidators.indexOf(v);if(i!==-1){this._aTokenValidators.splice(i,1);}};T.prototype.removeAllValidators=function(){this._aTokenValidators=[];};T.prototype._validateToken=function(p,v){var t=p.token;var s;if(t&&t.getText()){s=t.getText();}else{s=p.text;}var V=p.validationCallback;var o=p.suggestionObject;var i,a,b;if(!v){v=this._aTokenValidators;}b=v.length;if(b===0){if(!t&&V){V(false);}return t;}for(i=0;i<b;i++){a=v[i];t=a({text:s,suggestedToken:t,suggestionObject:o,asyncCallback:this._getAsyncValidationCallback(v,i,s,o,V)});if(!t){if(V){V(false);}return null;}if(t===T.WaitForAsyncValidation){return null;}}return t;};T.prototype._getAsyncValidationCallback=function(v,V,i,s,f){var t=this,a;return function(o){if(o){v=v.slice(V+1);o=t._validateToken({text:i,token:o,suggestionObject:s,validationCallback:f},v);a=t._addUniqueToken(o,f);if(a){t.fireTokenUpdate({addedTokens:[o],removedTokens:[],type:T.TokenUpdateType.Added});}}else{if(f){f(false);}}};};T.prototype.addValidateToken=function(p){var t=this._validateToken(p);this._addUniqueToken(t,p.validationCallback);};T.prototype._addValidateToken=function(p){var t=this._validateToken(p),a=this._addUniqueToken(t,p.validationCallback);if(a){this.fireTokenUpdate({addedTokens:[t],removedTokens:[],type:T.TokenUpdateType.Added});}};T.prototype._addUniqueToken=function(t,v){if(!t){return false;}var a=this._tokenExists(t);if(a){return false;}this.addToken(t);if(v){v(true);}this.fireTokenChange({addedTokens:[t],removedTokens:[],type:T.TokenChangeType.TokensChanged});return true;};T.prototype._parseString=function(s){return s.split(/\r\n|\r|\n/g);};T.prototype._checkFocus=function(){return this.getDomRef()&&q.sap.containsOrEquals(this.getDomRef(),document.activeElement);};T.prototype._tokenExists=function(t){var a=this.getTokens();if(!(a&&a.length)){return false;}var k=t.getKey();if(!k){return false;}var b=a.length;for(var i=0;i<b;i++){var c=a[i];var d=c.getKey();if(d===k){return true;}}return false;};T.prototype.addToken=function(t,s){var p=this.getParent();if(p instanceof sap.m.MultiInput){if(p.getMaxTokens()!==undefined&&p.getTokens().length>=p.getMaxTokens()){return this;}}this.addAggregation("tokens",t,s);this._bScrollToEndIsActive=true;this.fireTokenChange({token:t,type:T.TokenChangeType.Added});return this;};T.prototype.removeToken=function(t){t=this.removeAggregation("tokens",t);this._bScrollToEndIsActive=true;this.fireTokenChange({token:t,type:T.TokenChangeType.Removed});return t;};T.prototype.setTokens=function(t){var o=this.getTokens();this.removeAllTokens(false);var i;for(i=0;i<t.length;i++){this.addToken(t[i],true);}this.invalidate();this._bScrollToEndIsActive=true;this.fireTokenChange({addedTokens:t,removedTokens:o,type:T.TokenChangeType.TokensChanged});};T.prototype.removeAllTokens=function(f){var t=this.getTokens();this.removeAllAggregation("tokens");if(typeof(f)==="boolean"&&!f){return;}this.fireTokenChange({addedTokens:[],removedTokens:t,type:T.TokenChangeType.TokensChanged});this.fireTokenChange({tokens:t,type:T.TokenChangeType.RemovedAll});};T.prototype.updateTokens=function(){this.destroyTokens();this.updateAggregation("tokens");};T.prototype._removeSelectedTokens=function(){var t=this.getSelectedTokens();var a,i,b;b=t.length;if(b===0){return this;}for(i=0;i<b;i++){a=t[i];if(a.getEditable()){a.destroy();}}this.scrollToEnd();this.fireTokenChange({addedTokens:[],removedTokens:t,type:T.TokenChangeType.TokensChanged});this.fireTokenUpdate({addedTokens:[],removedTokens:t,type:T.TokenUpdateType.Removed});var p=this.getParent();if(p&&p instanceof sap.m.MultiInput&&!p._bUseDialog){p.$('inner').focus();}this._doSelect();return this;};T.prototype.selectAllTokens=function(s){if(s===undefined){s=true;}var t=this.getTokens(),a=t.length,i;for(i=0;i<a;i++){t[i].setSelected(s);}this._doSelect();return this;};T.prototype._changeAllTokensSelection=function(s,a){var t=this.getTokens(),b=t.length,c,i;for(i=0;i<b;i++){c=t[i];if(c!==a){c._changeSelection(s);}}this._doSelect();return this;};T.prototype.getSelectedTokens=function(){var s=[],t=this.getTokens(),i,a,b=t.length;for(i=0;i<b;i++){a=t[i];if(a.getSelected()){s.push(a);}}return s;};T.prototype._onTokenDelete=function(t){if(t&&this.getEditable()){t.destroy();this.fireTokenChange({addedTokens:[],removedTokens:[t],type:T.TokenChangeType.TokensChanged});this.fireTokenUpdate({addedTokens:[],removedTokens:[t],type:T.TokenUpdateType.Removed});}};T.prototype._onTokenSelect=function(t,c,s){var a=this.getTokens(),o,i;if(s){var f=this._getFocusedToken();if(!f){this._oSelectionOrigin=null;return;}if(this._oSelectionOrigin){f=this._oSelectionOrigin;}else{this._oSelectionOrigin=f;}var F=this.indexOfToken(f),I=this.indexOfToken(t),m=Math.min(F,I),M=Math.max(F,I);for(i=0;i<a.length;i++){o=a[i];if(i>=m&&i<=M){o._changeSelection(true);}else if(!c){o._changeSelection(false);}}return;}this._oSelectionOrigin=null;if(c){return;}this._oSelectionOrigin=t;for(i=0;i<a.length;i++){o=a[i];if(o!==t){o._changeSelection(false);}}};T.prototype._getFocusedToken=function(){var f=sap.ui.getCore().byId(document.activeElement.id);if(!f||!(f instanceof sap.m.Token)||this.indexOfToken(f)==-1){return null;}return f;};T.prototype.setEditable=function(e){this.$().toggleClass("sapMTokenizerReadonly",!e);return this.setProperty("editable",e,true);};T.prototype.onsaphome=function(e){this.scrollToStart();};T.prototype.onsapend=function(e){this.scrollToEnd();};T.prototype.ontouchstart=function(e){if(D.browser.chrome&&window.getSelection()){window.getSelection().removeAllRanges();}};T.prototype.exit=function(){this._deregisterResizeHandler();};T.prototype._deregisterResizeHandler=function(){if(this._sResizeHandlerId){sap.ui.core.ResizeHandler.deregister(this._sResizeHandlerId);delete this._sResizeHandlerId;}};T.prototype._doSelect=function(){if(this._checkFocus()&&this._bCopyToClipboardSupport){var f=document.activeElement;var s=window.getSelection();s.removeAllRanges();if(this.getSelectedTokens().length){var R=document.createRange();R.selectNodeContents(this.getDomRef("clip"));s.addRange(R);}if(window.clipboardData&&document.activeElement.id==this.getId()+"-clip"){q.sap.focus(f.id==this.getId()+"-clip"?this.getDomRef():f);}}};T.prototype.getReverseTokens=function(){return!!this._reverseTokens;};T.prototype.setReverseTokens=function(R){this._reverseTokens=R;};T.TokenChangeType={Added:"added",Removed:"removed",RemovedAll:"removedAll",TokensChanged:"tokensChanged"};T.TokenUpdateType={Added:"added",Removed:"removed"};T.WaitForAsyncValidation="sap.m.Tokenizer.WaitForAsyncValidation";return T;},true);
