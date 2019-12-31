/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var A={};A.render=function(r,c){var a=c._getAllButtons(),I=c.getAggregation("_invisibleAriaTexts"),R=sap.ui.getCore().getLibraryResourceBundle('sap.m'),b=a.length,v=a.filter(function(B){return B.getVisible();}).length,i,m,B,V=1;for(i=0;i<b;i++){B=a[i];B.removeStyleClass("sapMActionSheetButtonNoIcon");if(B.getIcon()&&B.getVisible()){m=true;}else{B.addStyleClass("sapMActionSheetButtonNoIcon");}}r.write("<div");r.writeControlData(c);r.addClass("sapMActionSheet");if(m){r.addClass("sapMActionSheetMixedButtons");}r.writeClasses();var t=c.getTooltip_AsString();if(t){r.writeAttributeEscaped("title",t);}r.write(">");for(i=0;i<b;i++){B=a[i];r.renderControl(a[i].addStyleClass("sapMActionSheetButton"));if(B.getVisible()&&sap.ui.getCore().getConfiguration().getAccessibility()){I[i].setText(R.getText('ACTIONSHEET_BUTTON_INDEX',[V,v]));V++;r.renderControl(I[i]);}else{I[i].setText("");}}if(sap.ui.Device.system.phone&&c.getShowCancelButton()){r.renderControl(c._getCancelButton());}r.write("</div>");};return A;},true);
