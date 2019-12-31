/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.require("sap.apf.modeler.ui.controller.propertyType");jQuery.sap.require("sap.apf.modeler.ui.utils.textManipulator");jQuery.sap.require("sap.apf.utils.utils");(function(){"use strict";var t=new sap.apf.modeler.ui.utils.TextManipulator();sap.apf.modeler.ui.controller.propertyType.extend("sap.apf.modeler.ui.controller.representationMeasure",{onBeforeRendering:function(){var c=this;if(c.byId("idLabelDisplayOptionType")){c.byId("idLabelDisplayOptionType").destroy();}c.byId("idPropertyTypeLayout").setSpan("L4 M4 S4");},getAllPropertiesAsPromise:function(){var c=this,a,s,p,A,m=[];var S=c.oStepPropertyMetadataHandler.oStep;var C=sap.apf.modeler.ui.utils.CONSTANTS;var d=jQuery.Deferred();c.oStepPropertyMetadataHandler.getEntityTypeMetadataAsPromise().done(function(e){S.getConsumablePropertiesForRepresentation(c.oRepresentation.getId()).done(function(r){a=r.consumable;a.forEach(function(P){if(c.oStepPropertyMetadataHandler.getPropertyMetadata(e,P)){A=c.oStepPropertyMetadataHandler.getPropertyMetadata(e,P)["aggregation-role"];if(A===C.aggregationRoles.MEASURE){m.push(P);}}});s=c.getSelectedProperty();if(s!==undefined){p=m.indexOf(s)!==-1?m:m.concat(s);m=r.available.indexOf(s)!==-1?p:m.concat(t.addPrefixText([s],sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE));s=r.available.indexOf(s)!==-1?s:t.addPrefixText([s],sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE)[0];}d.resolve({aAllProperties:m,sSelectedKey:s});});});return d.promise();},getPropertyTextLabelKey:function(p){var c=this;return c.oRepresentation.getMeasureTextLabelKey(p);},updateProperties:function(p){var c=this;c.oRepresentation.getMeasures().forEach(function(m){c.oRepresentation.removeMeasure(m);});p.forEach(function(P){c.oRepresentation.addMeasure(P.sProperty);c.oRepresentation.setMeasureKind(P.sProperty,P.sKind);c.oRepresentation.setMeasureTextLabelKey(P.sProperty,P.sTextLabelKey);});},createNewPropertyInfoAsPromise:function(n){var c=this,N={};N.sProperty=n;N.sKind=c.getView().getViewData().oPropertyTypeData.sContext;N.sTextLabelKey=undefined;return sap.apf.utils.createPromise(N);},createCurrentProperiesInfo:function(m,n){var c={},C=this;c.sProperty=m;c.sKind=C.oRepresentation.getMeasureKind(m);c.sTextLabelKey=C.oRepresentation.getMeasureTextLabelKey(m);return c;},setPropertyTextLabelKey:function(p,l){var c=this;c.oRepresentation.setMeasureTextLabelKey(p,l);},setNextPropertyInParentObject:function(){var c=this;var p=c.getView().getViewData().oPropertyTypeData.sProperty;var k=c.getView().getViewData().oPropertyTypeData.sContext;c.oRepresentation.addMeasure(p);c.oRepresentation.setMeasureKind(p,k);c.setPropertyTextLabelKey(p,undefined);c.setDetailData();},removePropertyFromParentObject:function(){var c=this;c.oRepresentation.removeMeasure(t.removePrefixText(c.byId("idPropertyType").getSelectedKey(),sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE));},addPropertyAsPromise:function(){var d=jQuery.Deferred();var c=this,a,m=[];var s=c.oStepPropertyMetadataHandler.oStep;var C=sap.apf.modeler.ui.utils.CONSTANTS;c.oStepPropertyMetadataHandler.getEntityTypeMetadataAsPromise().done(function(e){s.getConsumablePropertiesForRepresentation(c.oRepresentation.getId()).done(function(r){r.consumable.forEach(function(p){if(c.oStepPropertyMetadataHandler.getPropertyMetadata(e,p)){a=c.oStepPropertyMetadataHandler.getPropertyMetadata(e,p)["aggregation-role"];if(a===C.aggregationRoles.MEASURE){m.push(p);}}});c.getView().fireEvent(C.events.ADDPROPERTY,{"sProperty":m[0],"sContext":c.getView().getViewData().oPropertyTypeData.sContext});c.oConfigurationEditor.setIsUnsaved();d.resolve();});});return d.promise();},addRemovedProperty:function(e){var c=this;var p=e.getParameter("sProperty");var i=new sap.ui.core.Item({key:p,text:p});c.byId("idPropertyType").addItem(i);},removeAddedProperty:function(e){var c=this;var p=e.getParameter("sProperty");var i=c.byId("idPropertyType").getItems();i.forEach(function(I){if(I.getKey()===p){c.byId("idPropertyType").removeItem(I);}});}});}());
