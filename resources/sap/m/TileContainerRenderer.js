/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var T={};T.render=function(r,c){var a=c.getId();r.write("<div tabindex=\"-1\"");r.writeControlData(c);r.addStyle("height",c.getHeight());r.addStyle("width",c.getWidth());r.writeStyles();r.addClass("sapMTC");r.addClass("sapContrastPlus");r.writeClasses();r.writeAccessibilityState(c,{role:"listbox",multiSelectable:false,activeDescendant:c.getTiles().length>0?c.getTiles()[0].getId():""});r.write(" >");r.write("<div id=\""+a+"-scrl\" class=\"sapMTCScrl\" style=\"height:0px;");if(!c.bRtl){r.write(" overflow: hidden;");}r.write("\">");r.write("<div id=\""+a+"-blind\" class=\"sapMTCBlind\"></div>");r.write("<div id=\""+a+"-cnt\" class=\"sapMTCCnt sapMTCAnim\" style=\"height:0px; width:0px;\" role=\"group\">");var t=c.getTiles();for(var i=0;i<t.length;i++){t[i]._setVisible(false);r.renderControl(t[i]);}r.write("</div>");r.write("</div>");r.write("<div id=\""+a+"-pager\" class=\"sapMTCPager\">");r.write("</div>");r.write("<div id=\""+a+"-leftedge\" class=\"sapMTCEdgeLeft\"></div>");r.write("<div id=\""+a+"-rightedge\" class=\"sapMTCEdgeRight\"></div>");r.write("<div id=\""+a+"-leftscroller\" class=\"sapMTCScroller sapMTCLeft\" tabindex=\"-1\"><div class=\"sapMTCInner\" ></div></div>");r.write("<div id=\""+a+"-rightscroller\" class=\"sapMTCScroller sapMTCRight\" tabindex=\"-1\"><div class=\"sapMTCInner\" ></div></div>");r.write("</div>");};return T;},true);
