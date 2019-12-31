/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/Renderer'],function(q,R){"use strict";var O={};O.render=function(r,o){var t=o.getTooltip_AsString(),T=o.getTextDirection(),s=o.getTextAlign();r.write("<div");r.writeControlData(o);r.addClass("sapMObjectNumber");r.addClass(o._sCSSPrefixObjNumberStatus+o.getState());if(o.getEmphasized()){r.addClass("sapMObjectNumberEmph");}if(t){r.writeAttributeEscaped("title",t);}if(T!==sap.ui.core.TextDirection.Inherit){r.writeAttribute("dir",T.toLowerCase());}s=R.getTextAlign(s,T);if(s){r.addStyle("text-align",s);}r.writeClasses();r.writeStyles();if(o.getState()!==sap.ui.core.ValueState.None){r.writeAccessibilityState({labelledby:o.getId()+"-state"});}r.write(">");this.renderText(r,o);r.write("  ");this.renderUnit(r,o);this.renderHiddenARIAElement(r,o);r.write("</div>");};O.renderText=function(r,o){r.write("<span");r.addClass("sapMObjectNumberText");r.writeClasses();r.write(">");r.writeEscaped(o.getNumber());r.write("</span>");};O.renderUnit=function(r,o){var u=o.getUnit()||o.getNumberUnit();r.write("<span");r.addClass("sapMObjectNumberUnit");r.writeClasses();r.write(">");r.writeEscaped(u);r.write("</span>");};O.renderHiddenARIAElement=function(r,o){var a="",b=sap.ui.getCore().getLibraryResourceBundle("sap.m");if(o.getState()==sap.ui.core.ValueState.None){return;}r.write("<span id='"+o.getId()+"-state' class='sapUiInvisibleText' aria-hidden='true'>");switch(o.getState()){case sap.ui.core.ValueState.Error:a=b.getText("OBJECTNUMBER_ARIA_VALUE_STATE_ERROR");break;case sap.ui.core.ValueState.Warning:a=b.getText("OBJECTNUMBER_ARIA_VALUE_STATE_WARNING");break;case sap.ui.core.ValueState.Success:a=b.getText("OBJECTNUMBER_ARIA_VALUE_STATE_SUCCESS");break;}r.write(a);r.write("</span>");};return O;},true);
