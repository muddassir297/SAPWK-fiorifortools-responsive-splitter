/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare('sap.apf.ui.utils.facetFilterValueFormatter');jQuery.sap.require("sap.apf.ui.utils.formatter");
sap.apf.ui.utils.FacetFilterValueFormatter=function(){"use strict";this.getFormattedFFData=function(f){var F,t,s;var p=f.oPropertyMetadata;var S=f.sSelectProperty;var a=f.aFilterValues;var o=new sap.apf.ui.utils.formatter({getEventCallback:f.oUiApi.getEventCallback.bind(f.oUiApi),getTextNotHtmlEncoded:f.oCoreApi.getTextNotHtmlEncoded,getExits:f.oUiApi.getCustomFormatExit()},p,a);var T=p.text;a.forEach(function(b){F=o.getFormattedValue(S,b[S]);t=F;if(T!==undefined&&b[T]!==undefined){t=F+" - "+b[T];}b.formattedValue=t;});return a;};};
