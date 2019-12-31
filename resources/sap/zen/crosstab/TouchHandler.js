jQuery.sap.declare("sap.zen.crosstab.TouchHandler");jQuery.sap.require("sap.zen.crosstab.utils.Utils");
sap.zen.crosstab.TouchHandler=function(E,c){var d=c.getDataArea();var r=c.getRowHeaderArea();var C=c.getColumnHeaderArea();var D=c.getDimensionHeaderArea();var l=0;var L=0;var t=false;var m=false;var o=$("#"+d.getId());var a=$("#"+r.getId());var b=$("#"+C.getId());var f=$("#"+D.getId());var T="";var g=null;var h="800";var v=0;var H=0;var R=0;var j=0;var n=0;var N=0;var O=0;var k=0;var p=null;var P=null;var I=2;var q=null;var V=null;var s=null;var u=false;function w(e){var M=null;var i=0;var Q=sap.ui.getCore().getControl(e.target.id);var S=null;var U=null;if(Q&&(Q.isMobileResize&&Q.isMobileResize())){M=Q;}else{var W=$(e.target).parents("td");if(W){for(i=0;i<W.length;i++){S=$(W[i]);U=S.attr("id");if(U&&U.length>0){Q=sap.ui.getCore().getControl(U);if(Q&&(Q.isMobileResize&&Q.isMobileResize())){M=Q;break;}}}}}return M;}function x(e){var i=e.getParameter("item").oSelectedCell;if(i){E.doColResize(i);}}function y(){if(!q){q=sap.ui.getCore().getControl("resizemenu");if(q){q.getItems()[0].destroy();q.destroy();}if(sap.zen.crosstab.utils.Utils.isDispatcherAvailable()===true&&sap.zen.Dispatcher.instance.isMainMode()){$.sap.require("sap.ui.unified.Menu");q=new sap.ui.unified.Menu("resizemenu",{ariaDescription:"Crosstab Menu",tooltip:"Menu containing crosstab related actions"});}else{q=new sap.ui.commons.Menu("resizemenu",{ariaDescription:"Crosstab Menu",tooltip:"Menu containing crosstab related actions"});}q.addStyleClass("sapzencrosstab-MenuStyle");var M=null;if(sap.zen.crosstab.utils.Utils.isDispatcherAvailable()===true&&sap.zen.Dispatcher.instance.isMainMode()){M=new sap.ui.unified.MenuItem("item1",{text:c.getPropertyBag().getText(sap.zen.crosstab.TextConstants.MOBILE_MENUITEM_COLWIDTH_ADJUST_TEXT_KEY)});}else{M=new sap.ui.commons.MenuItem("item1",{text:c.getPropertyBag().getText(sap.zen.crosstab.TextConstants.MOBILE_MENUITEM_COLWIDTH_ADJUST_TEXT_KEY)});}M.attachSelect(x);q.addItem(M);}}function z(){R=(d.getRowCnt()+"").length;j=(d.getColCnt()+"").length;p=new sap.ui.core.Popup();var e=null;if(sap.zen.crosstab.utils.Utils.isDispatcherAvailable()===true&&sap.zen.Dispatcher.instance.isMainMode()){e=new sap.m.Text();}else{e=new sap.ui.commons.TextView()}p.setContent(e);p.setDurations(125,500);p.setAutoClose(true);P=p.getContent();P.addStyleClass("sapzencrosstab-ScrollPopup");P.setWrapping(false);var i=sap.ui.core.Popup.Dock;p.setPosition(i.CenterCenter,i.CenterCenter,$('#'+c.getId()+"_renderSizeDiv")[0],"0");}function A(){var e=c.getPropertyBag().getText(sap.zen.crosstab.TextConstants.ROW_TEXT_KEY)+": "+sap.zen.crosstab.utils.Utils.padWithZeroes(n+1,R)+"/"+r.getRowCnt();var i=c.getPropertyBag().getText(sap.zen.crosstab.TextConstants.COL_TEXT_KEY)+": "+sap.zen.crosstab.utils.Utils.padWithZeroes(N+1,j)+"/"+C.getColCnt();var M=e+" "+i;p.getContent().setProperty("text",M,true);p.getContent().rerender();}function B(e){sap.zen.crosstab.utils.Utils.cancelEvent(e);v=0;H=0;n=0;N=0;if(q){q.close();}T=e.currentTarget.getAttribute("id");oCurrentlyHoveredCell=null;if(e.originalEvent.touches&&e.originalEvent.touches.length){e=e.originalEvent.touches[0];}else if(e.originalEvent.changedTouches&&e.originalEvent.changedTouches.length){e=e.originalEvent.changedTouches[0];}l=e.pageX;L=e.pageY;t=true;m=false;if(g){window.clearTimeout(g);g=null;}g=setTimeout(function(){t=false;m=false;var i=w(e);if(i){y();var M=$('#'+i.getId());if(M.length>0){var Q=sap.ui.core.Popup.Dock;q.getItems()[0].oSelectedCell=i;q.open(false,M,Q.BeginBottom,Q.BeginTop,M,0+" "+0,sap.ui.core.Collision.flip);}}},h);}function F(i,e){var M=c.getHorizontalHeaderScrollbar();if(M){k=M.getScrollPosition();N=Math.max(k-i,0);if(e>0){c.scrollHeaderHorizontal(N);}}}function G(i,e,M,Q){if(c.getPropertyBag().isPixelScrolling()){if(V){O=V.getScrollPosition();n=Math.max(O-e,0);}if(s){k=s.getScrollPosition();N=Math.max(k-i,0);}if(V&&Q>0){c.scrollVertical(n);}if(s&&M>0){c.scrollHorizontal(N);}}else{if(p.getOpenState()===sap.ui.core.OpenState.CLOSED){p.open(-1);}if(V){if(c.getRenderEngine().isVScrolledToEnd()){if(sap.zen.crosstab.utils.Utils.sign(e)>0){v-=sap.zen.crosstab.utils.Utils.sign(e);}else{v=0;}}else{v-=sap.zen.crosstab.utils.Utils.sign(e);}O=r.getRenderStartRow();n=Math.max(Math.floor(v/I)+O,0);n=Math.min(d.getRowCnt()-1,n);}if(s){if(c.getRenderEngine().isHScrolledToEnd()){if(sap.zen.crosstab.utils.Utils.sign(i)>0){H-=sap.zen.crosstab.utils.Utils.sign(i);}else{H=0;}}else{H-=sap.zen.crosstab.utils.Utils.sign(i);}k=C.getRenderStartCol();N=Math.max(Math.floor(H/I)+k,0);N=Math.min(d.getColCnt()-1,N);}A();}}function J(e){sap.zen.crosstab.utils.Utils.cancelEvent(e);if(t==false){return true;}if(e.originalEvent.touches&&e.originalEvent.touches.length){e=e.originalEvent.touches[0];}else if(e.originalEvent.changedTouches&&e.originalEvent.changedTouches.length){e=e.originalEvent.changedTouches[0];}var i=e.pageX;var M=e.pageY;var Q=i-l;var S=M-L;var U=Math.abs(S);var W=Math.abs(Q);if(U>W&&W<10){Q=0;W=0;}else if(W>U&&U<10){S=0;U=0;}if(Q==0&&S==0){m=false;return true;}m=true;if(g){window.clearTimeout(g);g=null;}V=c.getVScrollbar();s=c.getHScrollbar();u=false;if(T===r.getId()){u=c.isHeaderHScrolling()&&(Q!==0);if(!u){Q=0;W=0;}}else if(T===C.getId()){S=0;U=0;}else if(T===D.getId()){u=c.isHeaderHScrolling()&&(Q!==0);if(!u){Q=0;W=0;}S=0;U=0;}if(u===true){F(Q,W);}else{G(Q,S,W,U);}l=e.pageX;L=e.pageY;}function K(e){sap.zen.crosstab.utils.Utils.cancelEvent(e);if(g){window.clearTimeout(g);g=null;}if(t==false){return true;}if(!m){E.executeOnClickAction(e);}t=false;m=false;if(!u){if(!c.getPropertyBag().isPixelScrolling()){if((p.getOpenState()===sap.ui.core.OpenState.OPEN)||(p.getOpenState()===sap.ui.core.OpenState.OPENING)){p.close();}var i=false;if(n!==O){c.scrollVertical(n);i=true;}if(N!==k){c.scrollHorizontal(N);i=true;}if(i===true){E.attachEvents();}}v=0;H=0;}}this.registerTouchEvents=function(e){z();var i="touchstart";if(c.getPropertyBag().isTestMobileMode()&&!c.getPropertyBag().isMobileMode()){i="mousedown";}o.unbind(i);o.bind(i,B);a.unbind(i);a.bind(i,B);b.unbind(i);b.bind(i,B);f.unbind(i);f.bind(i,B);i="touchmove";if(c.getPropertyBag().isTestMobileMode()&&!c.getPropertyBag().isMobileMode()){i="mousemove";}e.unbind(i);e.bind(i,J);i="touchend";if(c.getPropertyBag().isTestMobileMode()&&!c.getPropertyBag().isMobileMode()){i="mouseup";}e.unbind(i);e.bind(i,K);};}
