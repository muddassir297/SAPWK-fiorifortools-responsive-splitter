jQuery.sap.declare("sap.zen.crosstab.rendering.ScrollbarRenderer");jQuery.sap.require("sap.zen.crosstab.utils.Measuring");jQuery.sap.require("sap.zen.crosstab.utils.Utils");
sap.zen.crosstab.rendering.ScrollbarRenderer=function(c,r,m,d){"use strict";var s=0;var h=false;var v=false;var H=false;var o=null;var V=null;var a=null;var i=c.getPropertyBag().isPixelScrolling();function w(U){r.write("<div");r.writeAttribute("id",c.getId()+"_upperRightPad");r.writeAttribute("class","sapzencrosstab-UpperRightScrollPad");r.addStyle("width",s+"px");r.addStyle("height",U+"px");r.writeStyles();r.write(">");r.write("</div>");}function b(S,U){var e=null;var I=0;var z=0;if(!c.getVScrollbar()){e=new sap.ui.core.ScrollBar();c.setVScrollbar(e);}e=c.getVScrollbar();e.setVertical(true);if(H===true&&!h){I=$('#'+c.getId()+"_renderSizeDiv").outerHeight()-s;}else{I=S;}z=I-U;e.setSize(z+"px");r.renderControl(e);}function f(){r.write("<td");r.writeAttribute("class","sapzencrosstab-VScrollCell");r.write(">");}function g(S){var U=m.getUpperScrollDivHeight();r.write("<table");r.writeAttribute("id",c.getId()+"_vScrollTab");r.writeAttribute("class","sapzencrosstab-VScrollTable");r.write(">");r.write("<tr>");f();w(U);r.write("</td>");r.write("</tr>");r.write("<tr>");f();b(S,U);r.write("</td>");r.write("</tr>");r.write("</table>");}function j(){r.write("<div");r.writeAttribute("id",c.getId()+"_vScrollDiv");r.addStyle("position","absolute");r.addStyle("top","0px");r.addStyle(c.getPropertyBag().isRtl()?"left":"right","0px");r.addStyle("width",s+"px");var e=m.getRenderSizeDivSize().iHeight;if(h){e=Math.min(c.getContentHeight()-s,e);}r.addStyle("height",e+"px");r.writeStyles();r.write(">");g(e);r.write("</div>");}function k(){var W=0;var D=$('#'+c.getId()+"_upperLeft_scrollDiv");var U=c.getUtils();var P=c.getPropertyBag();if(D.length>0){W=U.isMsIE()||(P.isRtl()&&U.isMozilla())?D.width():D.outerWidth();}if(W===0){D=$('#'+c.getId()+"_lowerLeft_scrollDiv");W=U.isMsIE()||(P.isRtl()&&U.isMozilla())?D.width():D.outerWidth();}return W;}function l(L){if(!H){r.write("<div");r.writeAttribute("id",c.getId()+"_lowerLeftPad");r.writeAttribute("class","sapzencrosstab-LowerLeftScrollPad");r.addStyle("width",L+"px");r.addStyle("height",s+"px");r.writeStyles();r.write(">");r.write("</div>");}else{var e=null;if(!c.getHorizontalHeaderScrollbar()){e=new sap.ui.core.ScrollBar();c.setHorizontalHeaderScrollbar(e);}e=c.getHorizontalHeaderScrollbar();e.setVertical(false);var z=k();e.setSize(z+"px");r.renderControl(e);}}function n(H){if(H===true){r.write("<td");r.writeAttribute("id",c.getId()+"_hScrollTableCell");r.writeAttribute("class","sapzencrosstab-HScrollCell sapzencrosstab-HScrollCellWithHeaderScrollRightBorder");}else{r.write("<td");r.writeAttribute("class","sapzencrosstab-HScrollCell");}r.write(">");}function p(){r.write("<div");r.writeAttribute("id",c.getId()+"_lowerRightPad");r.writeAttribute("class","sapzencrosstab-LowerRightScrollPad");r.addStyle("width",s+"px");r.addStyle("height",s+"px");r.writeStyles();r.write(">");r.write("</div>");}function q(S,L){if(h===true){var e=null;if(!c.getHScrollbar()){e=new sap.ui.core.ScrollBar();c.setHScrollbar(e);}e=c.getHScrollbar();e.setVertical(false);e.setSize((S-L-(v?s:0))+"px");r.renderControl(e);}else{r.write("<div");r.writeAttribute("id",c.getId()+"_lowerMiddlePad");r.writeAttribute("class","sapzencrosstab-LowerMiddleScrollPad");r.addStyle("width",(S-L-(v?s:0))+"px");r.addStyle("height",s+"px");r.writeStyles();r.write(">");r.write("</div>");}}function t(W){var D=$('#'+c.getId()+"_lowerLeft");var L=D.outerWidth();r.write("<table");r.writeAttribute("id",c.getId()+"_hScrollTab");r.writeAttribute("class","sapzencrosstab-HScrollTable");r.write(">");r.write("<tr>");n(H);l(L);r.write("</td>");var S=c.getContentWidth();n();q(S,L);r.write("</td>");if(v){n();p();r.write("</td>");}r.write("</tr>");r.write("</table>");}function u(){r.write("<div");r.writeAttribute("id",c.getId()+"_hScrollDiv");r.addStyle("position","absolute");var T=c.getPropertyBag().getToolbarHeight();r.addStyle("bottom",T+"px");r.addStyle("height",s+"px");var W=c.getContentWidth();r.addStyle("width",W+"px");r.addStyle("height",s+"px");r.writeStyles();r.write(">");t(W);r.write("</div>");}this.renderScrollbars=function(S){h=S.bHasHScrollbar;v=S.bHasVScrollbar;H=S.bHasHHeaderScrollbar;if(h||v||H){s=m.getBrowserScrollbarWidth();if(s===0){if(v){var e=new sap.ui.core.ScrollBar();c.setVScrollbar(e);}if(h){var z=new sap.ui.core.ScrollBar();c.setHScrollbar(z);}if(H){var A=new sap.ui.core.ScrollBar();c.setHorizontalHeaderScrollbar(A);}}else{var T=d.getElement(c.getId());var I=T.html();if(v){j();}if(h||H){u();}r.write(I);r.flush(T[0]);}}};this.attachHandlers=function(e,z,A){this.detachHandlers();o=e;V=z;a=A;if(o&&c.getHScrollbar()){c.getHScrollbar().attachScroll(o);c.getHScrollbar().attachBrowserEvent("mousedown touchstart",sap.zen.crosstab.utils.Utils.cancelEvent);}if(V&&c.getVScrollbar()){c.getVScrollbar().attachScroll(V);c.getVScrollbar().attachBrowserEvent("mousedown touchstart",sap.zen.crosstab.utils.Utils.cancelEvent);this.attachMouseWheelHandler();}if(a&&c.getHorizontalHeaderScrollbar()){c.getHorizontalHeaderScrollbar().attachScroll(a);c.getHorizontalHeaderScrollbar().attachBrowserEvent("mousedown touchstart",sap.zen.crosstab.utils.Utils.cancelEvent);}};this.attachMouseWheelHandler=function(){if(!c.getPropertyBag().isMobileMode()){var T=c.getTableDiv();if(/Firefox/i.test(navigator.userAgent)){T[0].addEventListener("DOMMouseScroll",this.vScrollMouseWheelFireFox);}else{T.on("mousewheel",this.vScrollMouseWheel);}}};this.detachMouseWheelHandler=function(){if(!c.getPropertyBag().isMobileMode()){var T=c.getTableDiv();if(/Firefox/i.test(navigator.userAgent)){T[0].removeEventListener("DOMMouseScroll",this.vScrollMouseWheelFireFox);}else{T.off("mousewheel",this.vScrollMouseWheel);}}};function x(e){return e&&e/Math.abs(e);}this.vScrollMouseWheelFireFox=function(e){var F=x(e.detail);y(e,F);};this.vScrollMouseWheel=function(e){var F=-x(e.originalEvent.wheelDelta);y(e,F);};function y(e,F){if(c.hasLoadingPages()===false){var S=0;var U=0;if(i===true){S=120;U=parseInt(c.getVScrollbar().getContentSize(),10);}else{S=3;U=c.getVScrollbar().getSteps();}var N=c.getVScrollPos()+F*S;N=Math.max(0,N);N=Math.min(N,U);c.getRenderEngine().scrollVertical(N,true);}sap.zen.crosstab.utils.Utils.cancelEvent(e);}this.detachHandlers=function(){if(o&&c.getHScrollbar()){c.getHScrollbar().detachScroll(o);c.getHScrollbar().detachBrowserEvent("mousedown touchstart",sap.zen.crosstab.utils.Utils.cancelEvent);}if(V&&c.getVScrollbar()){c.getVScrollbar().detachScroll(V);c.getVScrollbar().detachBrowserEvent("mousedown touchstart",sap.zen.crosstab.utils.Utils.cancelEvent);this.detachMouseWheelHandler();}if(a&&c.getHorizontalHeaderScrollbar()){c.getHorizontalHeaderScrollbar().detachScroll(a);c.getHorizontalHeaderScrollbar().detachBrowserEvent("mousedown touchstart",sap.zen.crosstab.utils.Utils.cancelEvent);}o=null;V=null;a=null;};this.destroy=function(){this.detachHandlers();s=0;h=false;v=false;o=null;V=null;};this.setScrollbarSteps=function(){if(c.getPropertyBag().isPixelScrolling()){this.setScrollbarStepsInPixelMode();}else{this.setScrollbarStepsInStepMode();}if(H){this.setHorizontalHeaderScrollbarSteps();}};this.setHorizontalHeaderScrollbarSteps=function(){var e=c.getHorizontalHeaderScrollbar();if(e){var D=null;if(c.hasDimensionHeaderArea()){D=c.getId()+"_dimHeaderArea_container";}else if(c.hasRowHeaderArea()){D=c.getId()+"_rowHeaderArea_container";}if(D){var J=$('#'+D);e.setContentSize(J.outerWidth()+"px");e.rerender();}}};this.adjustHorizontalHeaderScrollbarContainerSize=function(){var e=c.getHorizontalHeaderScrollbar();if(e){var T=$('#'+c.getId()+"_hScrollTableCell");if(T.length>0){var W=parseInt(T.css("border-right-width"),10)+parseInt(T.css("border-left-width"),10);e.setSize((parseInt(e.getSize(),10)-W)+"px");e.rerender();}}};this.setScrollbarStepsInPixelMode=function(){var e=c.getVScrollbar();var z=c.getHScrollbar();var D=$('#'+c.getId()+"_dataArea_container");if(e){var A=0;if(!c.hasDataArea()){var B=$('#'+c.getId()+"_rowHeaderArea_container");A=B.outerHeight();}else{A=D.outerHeight();}e.setContentSize(A+"px");e.rerender();}if(z){var W=0;if(!c.hasDataArea()){var C=$('#'+c.getId()+"_colHeaderArea_container");W=C.outerWidth();}else{W=D.outerWidth();}z.setContentSize(W+"px");z.rerender();}};this.setScrollbarStepsInStepMode=function(){var R=m.getRenderSizeDivSize();var D=c.getDataArea();var e=c.getVScrollbar();var z=c.getHScrollbar();if(e){var C=m.getAreaHeight(c.getColumnHeaderArea());var A=R.iHeight-C;var B=D.getRenderStartRow();var M=B+D.getRenderRowCnt();var E=1;for(var F=B;F<M;F++){A-=D.getRowHeight(F);if(A<0){break;}E++;}e.setSteps(Math.max(1,D.getRowCnt()-E));e.rerender();}if(z){var G=m.getAreaWidth(c.getRowHeaderArea());var I=R.iWidth-G;var J=D.getRenderStartCol();var K=J+D.getRenderColCnt();var L=1;for(var N=J;N<K;N++){I-=D.getColWidth(N);if(I<0){break;}L++;}z.setSteps(Math.max(1,D.getColCnt()-L));z.rerender();}};this.adjustHScrollbarWidth=function(S){var D=$('#'+c.getId()+'_lowerLeftPad');var e=$('#'+c.getId()+'_lowerRight_scrollDiv');D.width(S);var z=c.getHScrollbar();z.setSize(e.outerWidth()+"px");z.rerender();};this.adjustVScrollbarHeight=function(S){var D=$('#'+c.getId()+'_upperRightPad');var e=$('#'+c.getId()+'_lowerRight_scrollDiv');D.height(S);var z=c.getVScrollbar();z.setSize(e.outerHeight()+"px");z.rerender();};};
