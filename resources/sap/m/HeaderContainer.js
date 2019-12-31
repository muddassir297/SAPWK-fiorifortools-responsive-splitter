/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Control','sap/ui/Device','sap/ui/core/delegate/ScrollEnablement','sap/ui/core/delegate/ItemNavigation','sap/ui/core/Orientation','sap/ui/base/ManagedObject','sap/ui/core/Icon'],function(q,l,C,D,S,I,O,M,a){"use strict";var H=C.extend("HeaderContainerItemContainer",{metadata:{defaultAggregation:"item",aggregations:{item:{type:"sap.ui.core.Control",multiple:false}}},renderer:function(r,c){r.write("<div");r.writeControlData(c);r.addClass("sapMHdrCntrItemCntr");r.addClass("sapMHrdrCntrInner");r.writeClasses();r.write(">");r.renderControl(c.getAggregation("item"));r.write("</div>");}});var b=C.extend("sap.m.HeaderContainer",{metadata:{interfaces:["sap.m.ObjectHeaderContainer"],library:"sap.m",properties:{scrollStep:{type:"int",defaultValue:300,group:"Behavior"},scrollTime:{type:"int",defaultValue:500,group:"Behavior"},showDividers:{type:"boolean",defaultValue:true,group:"Appearance"},orientation:{type:"sap.ui.core.Orientation",defaultValue:O.Horizontal,group:"Appearance"},backgroundDesign:{type:"sap.m.BackgroundDesign",defaultValue:l.BackgroundDesign.Transparent,group:"Appearance"},width:{type:"sap.ui.core.CSSSize",group:"Appearance"},height:{type:"sap.ui.core.CSSSize",group:"Appearance"}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true},_scrollContainer:{type:"sap.m.ScrollContainer",multiple:false,visibility:"hidden"},_prevButton:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},_nextButton:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"}}}});b.prototype.init=function(){this._bRtl=sap.ui.getCore().getConfiguration().getRTL();this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.m");this._oScrollCntr=new l.ScrollContainer(this.getId()+"-scrl-cntnr",{width:"100%",height:"100%",horizontal:!D.system.desktop});this.setAggregation("_scrollContainer",this._oScrollCntr,true);if(D.system.desktop){this._oArrowPrev=new l.Button({id:this.getId()+"-scrl-prev-button",type:l.ButtonType.Transparent,tooltip:this._oRb.getText("HEADERCONTAINER_BUTTON_PREV_SECTION"),press:function(e){e.cancelBubble();this._scroll(-this.getScrollStep(),this.getScrollTime());}.bind(this)}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrLeft");this._oArrowPrev._bExcludeFromTabChain=true;this.setAggregation("_prevButton",this._oArrowPrev,true);this._oArrowNext=new l.Button({id:this.getId()+"-scrl-next-button",type:l.ButtonType.Transparent,tooltip:this._oRb.getText("HEADERCONTAINER_BUTTON_NEXT_SECTION"),press:function(e){e.cancelBubble();this._scroll(this.getScrollStep(),this.getScrollTime());}.bind(this)}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrRight");this._oArrowNext._bExcludeFromTabChain=true;this.setAggregation("_nextButton",this._oArrowNext,true);}else if(D.system.phone||D.system.tablet){this._oArrowPrev=new a({id:this.getId()+"-scrl-prev-button"}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrLeft");this.setAggregation("_prevButton",this._oArrowPrev,true);this._oArrowNext=new a({id:this.getId()+"-scrl-next-button"}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrRight");this.setAggregation("_nextButton",this._oArrowNext,true);}this._oScrollCntr.addDelegate({onAfterRendering:function(){if(D.system.desktop){var f=this._oScrollCntr.getDomRef("scroll");var F=this._oScrollCntr.$("scroll");var d=F.find(".sapMHrdrCntrInner").attr("tabindex","0");if(!this._oItemNavigation){this._oItemNavigation=new I();this.addDelegate(this._oItemNavigation);this._oItemNavigation.attachEvent(I.Events.BorderReached,this._handleBorderReached,this);this._oItemNavigation.attachEvent(I.Events.AfterFocus,this._handleBorderReached,this);this._oItemNavigation.attachEvent(I.Events.BeforeFocus,this._handleBeforeFocus,this);if(D.browser.msie||D.browser.edge){this._oItemNavigation.attachEvent(I.Events.FocusAgain,this._handleFocusAgain,this);}}this._oItemNavigation.setRootDomRef(f);this._oItemNavigation.setItemDomRefs(d);this._oItemNavigation.setTabIndex0();this._oItemNavigation.setCycling(false);}}.bind(this)});};b.prototype.onBeforeRendering=function(){if(!this.getHeight()){q.sap.log.warning("No height provided",this);}if(!this.getWidth()){q.sap.log.warning("No width provided",this);}if(D.system.desktop){this._oArrowPrev.setIcon(this.getOrientation()===O.Horizontal?"sap-icon://slim-arrow-left":"sap-icon://slim-arrow-up");this._oArrowNext.setIcon(this.getOrientation()===O.Horizontal?"sap-icon://slim-arrow-right":"sap-icon://slim-arrow-down");}else if(D.system.phone||D.system.tablet){this._oArrowPrev.setSrc(this.getOrientation()===O.Horizontal?"sap-icon://slim-arrow-left":"sap-icon://slim-arrow-up");this._oArrowNext.setSrc(this.getOrientation()===O.Horizontal?"sap-icon://slim-arrow-right":"sap-icon://slim-arrow-down");}sap.ui.getCore().attachIntervalTimer(this._checkOverflow,this);};b.prototype.exit=function(){if(this._oItemNavigation){this.removeDelegate(this._oItemNavigation);this._oItemNavigation.destroy();this._oItemNavigation=null;}};b.prototype.onsaptabnext=function(e){var f=this.$().find(":focusable");var t=f.index(e.target);var n=f.eq(t+1).get(0);var F=this._getParentCell(e.target);var T;if(n){T=this._getParentCell(n);}if(F&&T&&F.id!==T.id||n&&n.id===this.getId()+"-after"){var L=f.last().get(0);if(L){this._bIgnoreFocusIn=true;L.focus();}}};b.prototype.onsaptabprevious=function(e){this.$().find(".sapMHdrCntrItemCntr").css("border-color","");var f=this.$().find(":focusable");var t=f.index(e.target);var p=f.eq(t-1).get(0);var F=this._getParentCell(e.target);var T;if(p){T=this._getParentCell(p);}if(!T||F&&F.id!==T.id){var s=this.$().attr("tabindex");this.$().attr("tabindex","0");this.$().focus();if(!s){this.$().removeAttr("tabindex");}else{this.$().attr("tabindex",s);}}};b.prototype.setOrientation=function(v){this.setProperty("orientation",v);if(v===O.Horizontal&&!D.system.desktop){this._oScrollCntr.setHorizontal(true);this._oScrollCntr.setVertical(false);}else if(!D.system.desktop){this._oScrollCntr.setHorizontal(false);this._oScrollCntr.setVertical(true);}return this;};b.prototype.validateAggregation=function(A,o,m){return this._callMethodInManagedObject("validateAggregation",A,o,m);};b.prototype.getAggregation=function(A,o,s){return this._callMethodInManagedObject("getAggregation",A,o,s);};b.prototype.setAggregation=function(A,o,s){return this._callMethodInManagedObject("setAggregation",A,o,s);};b.prototype.indexOfAggregation=function(A,o){return this._callMethodInManagedObject("indexOfAggregation",A,o);};b.prototype.insertAggregation=function(A,o,i,s){return this._callMethodInManagedObject("insertAggregation",A,o,i,s);};b.prototype.addAggregation=function(A,o,s){return this._callMethodInManagedObject("addAggregation",A,o,s);};b.prototype.removeAggregation=function(A,o,s){return this._callMethodInManagedObject("removeAggregation",A,o,s);};b.prototype.removeAllAggregation=function(A,s){return this._callMethodInManagedObject("removeAllAggregation",A,s);};b.prototype.destroyAggregation=function(A,s){return this._callMethodInManagedObject("destroyAggregation",A,s);};b.prototype._setScrollInProcess=function(v){this.bScrollInProcess=v;};b.prototype._scroll=function(d,i){this._setScrollInProcess(true);q.sap.delayedCall(i+300,this,this._setScrollInProcess,[false]);if(this.getOrientation()===O.Horizontal){this._hScroll(d,i);}else{this._vScroll(d,i);}};b.prototype._vScroll=function(d,c){var o=this._oScrollCntr.getDomRef(),s=o.scrollTop,i=o.scrollHeight,e=s+d,f=o.clientHeight,p=parseFloat(this.$("scroll-area").css("padding-top")),r;if(e<=0){r=this._calculateRemainingScrolling(d,c,s);this.$("scroll-area").css("transition","padding "+r+"s");this.$().removeClass("sapMHrdrTopPadding");}else if(e+f+p>=i){r=this._calculateRemainingScrolling(d,c,i-f-s);this.$("scroll-area").css("transition","padding "+r+"s");if(f+d>i&&f!==i){this.$().removeClass("sapMHrdrBottomPadding");this.$().addClass("sapMHrdrTopPadding");}else{this.$().removeClass("sapMHrdrBottomPadding");}}else{this.$("scroll-area").css("transition","padding "+c/1000+"s");}this._oScrollCntr.scrollTo(0,e,c);};b.prototype._hScroll=function(d,c){var o=this._oScrollCntr.getDomRef();var s,i,e,f,p,r;if(!this._bRtl){i=o.scrollLeft;f=o.scrollWidth;e=o.clientWidth;s=i+d;p=parseFloat(this.$("scroll-area").css("padding-left"));if(s<=0){r=this._calculateRemainingScrolling(d,c,i);this.$("scroll-area").css("transition","padding "+r+"s");this.$().removeClass("sapMHrdrLeftPadding");}else if(s+o.clientWidth+p>=f){r=this._calculateRemainingScrolling(d,c,f-e-i);this.$("scroll-area").css("transition","padding "+r+"s");if(e+d>f&&e!==f){this.$().removeClass("sapMHrdrRightPadding");this.$().addClass("sapMHrdrLeftPadding");}else{this.$().removeClass("sapMHrdrRightPadding");}}else{this.$("scroll-area").css("transition","padding "+c/1000+"s");}this._oScrollCntr.scrollTo(s,0,c);}else{s=q(o).scrollRightRTL()+d;this._oScrollCntr.scrollTo((s>0)?s:0,0,c);}};b.prototype._calculateRemainingScrolling=function(d,c,e){return Math.abs(e*c/(1000*d));};b.prototype._checkOverflow=function(){if(this.getOrientation()===O.Horizontal){this._checkHOverflow();}else{this._checkVOverflow();}};b.prototype._checkVOverflow=function(){var B=this._oScrollCntr.getDomRef(),o;if(B){var s=Math.round(B.scrollTop);var c=false;var d=false;var r=B.scrollHeight;var e=B.clientHeight;if(Math.abs(r-e)===1){r=e;}if(s>0){c=true;}if((r>e)&&(s+e<r)){d=true;}o=this._oArrowPrev.$().is(":visible");if(o&&!c){this._oArrowPrev.$().hide();this.$().removeClass("sapMHrdrTopPadding");}if(!o&&c){this._oArrowPrev.$().show();this.$().addClass("sapMHrdrTopPadding");}var f=this._oArrowNext.$().is(":visible");if(f&&!d){this._oArrowNext.$().hide();this.$().removeClass("sapMHrdrBottomPadding");}if(!f&&d){this._oArrowNext.$().show();this.$().addClass("sapMHrdrBottomPadding");}}};b.prototype._checkHOverflow=function(){var B=this._oScrollCntr.getDomRef();if(B){var s=Math.floor(B.scrollLeft);var c=false;var d=false;var r=B.scrollWidth;var e=B.clientWidth;if(Math.abs(r-e)===1){r=e;}if(this._bRtl){var i=q(B).scrollLeftRTL();if(i>((D.browser.internet_explorer||D.browser.edge)?1:0)){d=true;}}else if(s>1){c=true;}if(r-5>e){if(this._bRtl){if(q(B).scrollRightRTL()>1){c=true;}}else if(s+e<r){d=true;}}var o=this._oArrowPrev.$().is(":visible");if(o&&!c){this._oArrowPrev.$().hide();this.$().removeClass("sapMHrdrLeftPadding");}if(!o&&c){this._oArrowPrev.$().show();this.$().addClass("sapMHrdrLeftPadding");}var f=this._oArrowNext.$().is(":visible");if(f&&!d){this._oArrowNext.$().hide();this.$().removeClass("sapMHrdrRightPadding");}if(!f&&d){this._oArrowNext.$().show();this.$().addClass("sapMHrdrRightPadding");}}};b.prototype._handleBorderReached=function(e){if(D.browser.internet_explorer&&this.bScrollInProcess){return;}var i=e.getParameter("index");if(i===0){this._scroll(-this.getScrollStep(),this.getScrollTime());}else if(i===this.getContent().length-1){this._scroll(this.getScrollStep(),this.getScrollTime());}};b.prototype._handleFocusAgain=function(e){e.getParameter("event").preventDefault();};b.prototype._handleBeforeFocus=function(e){var o=e.getParameter("event");if(q(o.target).hasClass("sapMHdrCntrItemCntr")||q(o.target).hasClass("sapMScrollContScroll")||q.sap.PseudoEvents.sapprevious.fnCheck(o)||q.sap.PseudoEvents.sapnext.fnCheck(o)){this.$().find(".sapMHdrCntrItemCntr").css("border-color","");}else{this.$().find(".sapMHdrCntrItemCntr").css("border-color","transparent");}};b.prototype._unWrapHeaderContainerItemContainer=function(w){if(w instanceof H){w=w.getItem();}else if(q.isArray(w)){for(var i=0;i<w.length;i++){if(w[i]instanceof H){w[i]=w[i].getItem();}}}return w;};b._AGGREGATION_FUNCTIONS=["validateAggregation","validateAggregation","getAggregation","setAggregation","indexOfAggregation","removeAggregation"];b._AGGREGATION_FUNCTIONS_FOR_INSERT=["insertAggregation","addAggregation"];b.prototype._callMethodInManagedObject=function(f,A){var c=Array.prototype.slice.call(arguments);if(A==="content"){var o=c[2];c[1]="content";if(o instanceof C){if(q.inArray(f,b._AGGREGATION_FUNCTIONS)>-1&&o.getParent()instanceof H){c[2]=o.getParent();}else if(q.inArray(f,b._AGGREGATION_FUNCTIONS_FOR_INSERT)>-1){c[2]=new H({item:o});}}return this._unWrapHeaderContainerItemContainer(this._oScrollCntr[f].apply(this._oScrollCntr,c.slice(1)));}else{return M.prototype[f].apply(this,c.slice(1));}};b.prototype._getParentCell=function(d){return q(d).parents(".sapMHrdrCntrInner").andSelf(".sapMHrdrCntrInner").get(0);};b.prototype.onfocusin=function(e){if(this._bIgnoreFocusIn){this._bIgnoreFocusIn=false;return;}if(e.target.id===this.getId()+"-after"){this._restoreLastFocused();}};b.prototype._restoreLastFocused=function(){if(!this._oItemNavigation){return;}var n=this._oItemNavigation.getItemDomRefs();var L=this._oItemNavigation.getFocusedIndex();var $=q(n[L]);var r=$.control(0)||{};var t=r.getTabbables?r.getTabbables():$.find(":sapTabbable");t.eq(-1).add($).eq(-1).focus();};return b;});
