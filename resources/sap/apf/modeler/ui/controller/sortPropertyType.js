/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.require("sap.apf.modeler.ui.utils.optionsValueModelBuilder");jQuery.sap.require("sap.apf.modeler.ui.utils.staticValuesBuilder");jQuery.sap.require('sap.apf.modeler.ui.utils.constants');jQuery.sap.require("sap.apf.modeler.ui.utils.textManipulator");jQuery.sap.require("sap.apf.utils.utils");(function(){"use strict";var o=new sap.apf.modeler.ui.utils.OptionsValueModelBuilder();var t=new sap.apf.modeler.ui.utils.TextManipulator();var c=sap.apf.modeler.ui.utils.CONSTANTS.events;function _(C){C.byId("idSortLabel").setText(C.oTextReader("sortingField"));C.byId("idSortLabel").setTooltip(C.oTextReader("sortingField"));C.byId("idSortDirectionLabel").setText(C.oTextReader("direction"));C.byId("idSortDirectionLabel").setTooltip(C.oTextReader("direction"));C.byId("idAddPropertyIcon").setTooltip(C.oTextReader("addButton"));C.byId("idRemovePropertyIcon").setTooltip(C.oTextReader("deleteButton"));}function a(C){C.byId("idAriaPropertyForAdd").setText(C.oTextReader("ariaTextForAddIcon"));C.byId("idAriaPropertyForDelete").setText(C.oTextReader("ariaTextForDeleteIcon"));}function b(C){var m;var g=C.byId("idSortProperty");C.getAllPropertiesAsPromise().done(function(r){m=o.convert(r.aAllProperties);g.setModel(m);g.setSelectedKey(r.sSelectedKey);});}function d(C){var s=new sap.apf.modeler.ui.utils.StaticValuesBuilder(C.oTextReader,o);var m=s.getSortDirections();C.byId("idSortDirection").setModel(m);C.byId("idSortDirection").setSelectedKey(C.getView().getViewData().oPropertyTypeData.sContext);}function e(C){var s=true,S=true;var p=C.getView().getViewData().oPropertyTypeState;if(p.indexOfPropertyTypeViewId(C.getView().getId())===0){S=false;}C.byId("idAddPropertyIcon").setVisible(s);C.byId("idRemovePropertyIcon").setVisible(S);}function f(C){C.byId("idAddPropertyIcon").attachEvent(c.SETFOCUSONADDICON,C.setFocusOnAddIcons.bind(C));}sap.ui.core.mvc.Controller.extend("sap.apf.modeler.ui.controller.sortPropertyType",{oConfigurationEditor:{},oParentObject:{},oStepPropertyMetadataHandler:{},oTextReader:{},onInit:function(){var C=this;C.oConfigurationEditor=C.getView().getViewData().oConfigurationEditor;C.oParentObject=C.getView().getViewData().oParentObject;C.oStepPropertyMetadataHandler=C.getView().getViewData().oStepPropertyMetadataHandler;C.oTextReader=C.getView().getViewData().oCoreApi.getText;C.setDetailData();},onAfterRendering:function(){var C=this;C.byId("idAddPropertyIcon").fireEvent(c.SETFOCUSONADDICON);},setDetailData:function(){var C=this;_(C);a(C);b(C);d(C);e(C);C.disableView();},handleChangeForSortProperty:function(){var C=this;var n=C.getView().getViewData().oPropertyTypeState.indexOfPropertyTypeViewId(C.getView().getId());var O=C.getView().getViewData().oPropertyTypeState.getPropertyValueState()[n];var N=t.removePrefixText(C.byId("idSortProperty").getSelectedKey(),sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE);var D=C.byId("idSortDirection").getSelectedKey()==="true"?true:false;C.getView().fireEvent(c.UPDATEPROPERTYVALUESTATE,{"sProperty":N});C.updateSortProperty(N,D);C.getView().fireEvent(c.UPDATEPROPERTY,{"sOldProperty":O});C.oConfigurationEditor.setIsUnsaved();},handleChangeForSortDirection:function(){var C=this;var s=t.removePrefixText(C.byId("idSortProperty").getSelectedKey(),sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE);var n=C.byId("idSortDirection").getSelectedKey()==="true"?true:false;C.updateSortProperty(s,n);C.oConfigurationEditor.setIsUnsaved();},setFocusOnAddIcons:function(){var C=this;C.byId("idAddPropertyIcon").focus();},setFocusOnRemoveIcons:function(){var C=this;C.byId("idSortProperty").focus();},handlePressOfAddPropertyIcon:function(){var C=this;f(C);C.addPropertyAsPromise();},handlePressOfRemovePropertyIcon:function(){var C=this;C.getView().fireEvent(c.FOCUSONREMOVE);C.getView().fireEvent(c.REMOVEPROPERTY);C.oConfigurationEditor.setIsUnsaved();C.getView().destroy();},updateSortProperty:function(s,S){var C=this,n,N={},g=[];var p=C.getView().getViewData().oPropertyTypeState;var h=p.getPropertyValueState();var i=p.indexOfPropertyTypeViewId(C.getView().getId());N.property=s;N.ascending=S;for(n=0;n<h.length;n++){if(h[n]===C.oTextReader("none")){continue;}if(i===n){g.push(N);}else{g.push(C.createCurrentSortPropertiesInfo(h[n]));}}C.updateSortProperties(g);},createCurrentSortPropertiesInfo:function(s,S){var C=this,g={},S=true;var O=C.getOrderBy();O.forEach(function(h){if(h.property===s){S=h.ascending;}});g.property=s;g.ascending=S;return g;},getSelectedSortProperty:function(){var C=this;var p=C.getView().getViewData().oPropertyTypeState;var g=p.getPropertyValueState();var n=p.indexOfPropertyTypeViewId(C.getView().getId());return g[n];},updateSortProperties:function(s){},getOrderBy:function(){},setNextPropertyInParentObject:function(){},removePropertyFromParentObject:function(){},disableView:function(){},addPropertyAsPromise:function(){return sap.apf.utils.createPromise();}});}());
