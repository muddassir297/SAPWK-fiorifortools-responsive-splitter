/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global'],function(){"use strict";var A={};A.render=function(r,c){if(!c._bThemeApplied){return;}var t=c.getTooltip_AsString();if(typeof t!=="string"){t="";}var T=((c.getView()=="Normal"&&c.getFirstYLabel()&&c.getFirstYLabel().getLabel())?"L":"")+((c.getMaxLabel()&&c.getMaxLabel().getLabel())?"C":"")+((c.getView()=="Normal"&&c.getLastYLabel()&&c.getLastYLabel().getLabel())?"R":"");var b=((c.getView()=="Normal"&&c.getFirstXLabel()&&c.getFirstXLabel().getLabel())?"L":"")+((c.getMinLabel()&&c.getMinLabel().getLabel())?"C":"")+((c.getView()=="Normal"&&c.getLastXLabel()&&c.getLastXLabel().getLabel())?"R":"");var l,R;R=l=c.getView()=="Wide";r.write("<div");r.writeControlData(c);if(t){r.writeAttributeEscaped("title",t);}r.addStyle("width",c.getIsResponsive()?"100%":c.getWidth());r.addStyle("height",c.getIsResponsive()?"100%":c.getHeight());r.writeStyles();r.writeAttribute("role","presentation");r.writeAttributeEscaped("aria-label",c.getAltText().replace(/\s/g," ")+(sap.ui.Device.browser.firefox?"":" "+t));r.addClass("sapSuiteAMC");if(c.hasListeners("press")){r.addClass("sapSuiteUiMicroChartPointer");r.writeAttribute("tabindex","0");}if(T){r.addClass("sapSuiteAMCTopLbls");}if(b){r.addClass("sapSuiteAMCBtmLbls");}r.writeClasses();r.write(">");if(T&&c.getShowLabel()){var s="sapSuiteAMCLblType"+T;r.write("<div");r.writeAttributeEscaped("id",c.getId()+"-top-labels");r.addClass("sapSuiteAMCLabels");r.addClass("sapSuiteAMCPositionTop");r.writeClasses();r.write(">");this._writeLabel(r,c,c.getFirstYLabel(),"-top-left-lbl","sapSuiteAMCPositionLeft",s);this._writeLabel(r,c,c.getMaxLabel(),"-top-center-lbl","sapSuiteAMCPositionCenter",s);this._writeLabel(r,c,c.getLastYLabel(),"-top-right-lbl","sapSuiteAMCPositionRight",s);r.write("</div>");}if(l&&c.getShowLabel()){r.write("<div");r.writeAttributeEscaped("id",c.getId()+"-left-labels");r.addClass("sapSuiteAMCSideLabels");r.addClass("sapSuiteAMCPositionLeft");r.writeClasses();r.write(">");this._writeLabel(r,c,c.getFirstYLabel(),"-top-left-lbl","sapSuiteAMCPositionTop","sapSuiteAMCPositionLeft");this._writeLabel(r,c,c.getFirstXLabel(),"-btm-left-lbl","sapSuiteAMCPositionBtm","sapSuiteAMCPositionLeft");r.write("</div>");}r.write("<div");r.writeAttributeEscaped("id",c.getId()+"-canvas-cont");r.addClass("sapSuiteAMCCanvas");r.writeClasses();r.write(">");r.write("<canvas");r.writeAttributeEscaped("id",c.getId()+"-canvas");r.addStyle("width","100%");r.addStyle("height","100%");r.addStyle("position","absolute");r.writeStyles();r.write("></canvas>");r.write("</div>");if(R&&c.getShowLabel()){r.write("<div");r.writeAttributeEscaped("id",c.getId()+"-right-labels");r.addClass("sapSuiteAMCSideLabels");r.addClass("sapSuiteAMCPositionRight");r.writeClasses();r.write(">");this._writeLabel(r,c,c.getLastYLabel(),"-top-right-lbl","sapSuiteAMCPositionTop","sapSuiteAMCPositionRight");this._writeLabel(r,c,c.getLastXLabel(),"-btm-right-lbl","sapSuiteAMCPositionBtm","sapSuiteAMCPositionRight");r.write("</div>");}if(b&&c.getShowLabel()){var B="sapSuiteAMCLblType"+b;r.write("<div");r.writeAttributeEscaped("id",c.getId()+"-bottom-labels");r.addClass("sapSuiteAMCLabels");r.addClass("sapSuiteAMCPositionBtm");r.writeClasses();r.write(">");this._writeLabel(r,c,c.getFirstXLabel(),"-btm-left-lbl","sapSuiteAMCPositionLeft",B);this._writeLabel(r,c,c.getMinLabel(),"-btm-center-lbl","sapSuiteAMCPositionCenter",B);this._writeLabel(r,c,c.getLastXLabel(),"-btm-right-lbl","sapSuiteAMCPositionRight",B);r.write("</div>");}r.write("<div");r.writeAttributeEscaped("id",c.getId()+"-css-helper");r.addStyle("display","none");r.writeStyles();r.write("></div>");r.write("</div>");};A._writeLabel=function(r,c,l,i,C,t){var L=l?l.getLabel():"";r.write("<div");r.writeAttribute("id",c.getId()+i);if(l){r.addClass(jQuery.sap.encodeHTML("sapSuiteAMCSemanticColor"+l.getColor()));}r.addClass("sapSuiteAMCLbl");r.addClass(jQuery.sap.encodeHTML(C));r.addClass(jQuery.sap.encodeHTML(t));r.writeClasses();r.write(">");r.writeEscaped(L);r.write("</div>");};return A;},true);
