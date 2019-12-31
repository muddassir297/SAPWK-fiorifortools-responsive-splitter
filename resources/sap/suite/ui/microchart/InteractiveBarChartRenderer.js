/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";var I={};I.BAR_DIRECTION_POSITIVE={NAME:"positive",WRAPPER_CSSCLASS:"sapSuiteIBCBarWrapperPositive",CSSCLASS:"sapSuiteIBCBarPositive"};I.BAR_DIRECTION_NEGATIVE={NAME:"negative",WRAPPER_CSSCLASS:"sapSuiteIBCBarWrapperNegative",CSSCLASS:"sapSuiteIBCBarNegative"};I.render=function(r,c){if(!c._bThemeApplied){return;}var b,B;b=c.getDisplayedBars();B=c.getAggregation("bars");if(b>B.length){b=B.length;}r.write("<div");r.writeControlData(c);r.addClass("sapSuiteIBC");r.writeClasses();r.writeStyles();var a={};a.role="listbox";a.multiselectable=true;a.disabled=!c._isChartEnabled();a.labelledby=c.getAriaLabelledBy();a.describedby=this._getAriaDescribedBy(c,b);r.writeAccessibilityState(c,a);r.write(">");if(!c.getSelectionEnabled()){this.renderDisabledOverlay(r,c);}for(var i=0;i<b;i++){this._renderBar(r,c,B[i],i,b);}r.write("</div>");};I._renderBar=function(r,c,b,a,d){var v,l;r.write("<div");r.writeAttributeEscaped("id",c.getId()+"-interactionArea-"+a);r.addClass("sapSuiteIBCBarInteractionArea");if(b.getSelected()){r.addClass("sapSuiteIBCBarSelected");}if(a===0&&c._isChartEnabled()){r.writeAttribute("tabindex","0");}l=b.getLabel();var A=l;if(c._bMinMaxValid){v=this._getDisplayValue(b,c);if(A){A=A+" "+v;}else{A=v;}}var o={};o.role="option";o.label=A;o.selected=b.getSelected();o.posinset=a+1;o.setsize=d;r.writeAccessibilityState(b,o);r.writeStyles();r.writeClasses();r.write(">");l=b.getLabel();r.write("<div");r.writeAttributeEscaped("id",c.getId()+"-label-"+a);r.addClass("sapSuiteIBCBarLabel");r.writeClasses();r.write(">");r.write("<div");r.addClass("sapSuiteIBCBarLabelText");r.writeClasses();r.write(">");r.writeEscaped(l);r.write("</div>");r.write("</div>");if(c._bMinMaxValid){r.write("<div");r.addClass("sapSuiteIBCBarWrapper");r.writeClasses();r.write(">");this._renderBarDirection(r,c,b,a,v,I.BAR_DIRECTION_NEGATIVE);r.write("<div");r.addClass("sapSuiteIBCDivider");r.writeClasses();r.write("/>");this._renderBarDirection(r,c,b,a,v,I.BAR_DIRECTION_POSITIVE);r.write("</div>");}r.write("</div>");};I._renderBarDirection=function(r,c,b,a,d,e){r.write("<div");r.addClass(e.WRAPPER_CSSCLASS);r.writeClasses();r.write(">");r.write("<div");r.writeAttributeEscaped("id",c.getId()+"-bar-"+e.NAME+"-"+a);r.addClass("sapSuiteIBCBar");r.addClass(e.CSSCLASS);r.writeClasses();if(b._bNullValue||b.getValue()===0){r.addStyle("width","0");}r.writeStyles();r.write(">");this._renderDisplayedValue(r,c,b,c.getId(),a,d,e);r.write("</div>");r.write("</div>");};I._renderDisplayedValue=function(r,c,b,a,d,e,f){var p;if(b._bNullValue){if(c.getMin()<0&&c.getMax()>0){p=Math.abs(c.getMax())>=Math.abs(c.getMin());}else{p=c.getMin()>=0;}}else{p=b.getValue()>=0;}if(f===I.BAR_DIRECTION_POSITIVE&&p||f===I.BAR_DIRECTION_NEGATIVE&&!p){if(b._bNullValue){r.addClass("sapSuiteIBCBarValueNA");r.addClass("sapSuiteIBCBarValueOutside");}r.write("<span");r.writeAttributeEscaped("id",a+"-displayedValue-"+d);r.addClass("sapSuiteIBCBarValue");r.writeClasses();r.write(">");r.writeEscaped(e);r.write("</span>");}};I.renderDisabledOverlay=function(r,c){r.write("<div");r.addClass("sapSuiteIBCDisabledOverlay");r.writeClasses();r.write(">");r.write("</div>");};I._getDisplayValue=function(b,c){var v,V;v=b.getDisplayedValue();V=b.getValue();if(b._bNullValue){v=c._oRb.getText("INTERACTIVECHART_NA");}else if(!v){v=V.toString();}return v;};I._getAriaDescribedBy=function(c,b){var a=[];for(var i=0;i<b;i++){a.push(c.getId()+"-interactionArea-"+i);}return a.join(",");};return I;},true);
