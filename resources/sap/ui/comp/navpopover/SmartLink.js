/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/base/ManagedObject','sap/m/Link','sap/m/LinkRenderer','./LinkData','sap/ui/core/Control','./SemanticObjectController','./NavigationPopoverHandler','sap/ui/model/json/JSONModel','sap/ui/comp/personalization/Util'],function(q,M,L,a,b,C,S,N,J,P){"use strict";var c=L.extend("sap.ui.comp.navpopover.SmartLink",{metadata:{library:"sap.ui.comp",designTime:true,properties:{semanticObject:{type:"string",defaultValue:null},additionalSemanticObjects:{type:"string[]",defaultValue:[]},semanticObjectController:{type:"any",defaultValue:null},fieldName:{type:"string",defaultValue:null},semanticObjectLabel:{type:"string",defaultValue:null},createControlCallback:{type:"object",defaultValue:null},mapFieldToSemanticObject:{type:"boolean",defaultValue:true},contactAnnotationPath:{type:"string",defaultValue:undefined},ignoreLinkRendering:{type:"boolean",defaultValue:false},enableAvailableActionsPersonalization:{type:"boolean",defaultValue:true}},aggregations:{innerControl:{type:"sap.ui.core.Control",multiple:false}},events:{beforePopoverOpens:{parameters:{semanticObject:{type:"string"},semanticAttributes:{type:"object"},semanticAttributesOfSemanticObjects:{type:"object"},setSemanticAttributes:{type:"function"},setAppStateKey:{type:"function"},originalId:{type:"string"},open:{type:"function"}}},navigationTargetsObtained:{parameters:{mainNavigation:{type:"sap.ui.comp.navpopover.LinkData"},actions:{type:"sap.ui.comp.navpopover.LinkData[]"},ownNavigation:{type:"sap.ui.comp.navpopover.LinkData"},popoverForms:{type:"sap.ui.layout.form.SimpleForm[]"},semanticObject:{type:"string"},semanticAttributes:{type:"object"},originalId:{type:"string"},show:{type:"function"}}},innerNavigate:{parameters:{text:{type:"string"},href:{type:"string"},semanticObject:{type:"string"},semanticAttributes:{type:"object"},originalId:{type:"string"}}}}},renderer:function(r,o){var R=true;if(o.getIgnoreLinkRendering()){var d=o._getInnerControl();if(d){r.write("<div ");r.writeControlData(o);r.writeClasses();r.write(">");r.renderControl(d);r.write("</div>");R=false;}}if(R){a.render.call(a,r,o);}}});c.prototype.getInnerControlValue=function(){if(this._isRenderingInnerControl()){var i=this._getInnerControl();if(i){if(i.getText){return i.getText();}if(i.getValue){return i.getValue();}}}return this.getText();};c.prototype.getNavigationPopoverHandler=function(){return this._createNavigationPopoverHandler();};c.prototype.init=function(){S.prefetchDistinctSemanticObjects();this._oNavigationPopoverHandler=null;this.attachPress(this._onLinkPressed);this.addStyleClass("sapUiCompSmartLink");};c.prototype.applySettings=function(s){M.prototype.applySettings.apply(this,arguments);this._updateEnabled();};c.prototype.updateBindingContext=function(){C.prototype.updateBindingContext.apply(this,arguments);this.setHref(null);this.setTarget(null);if(this._oNavigationPopoverHandler){this._oNavigationPopoverHandler.setBindingContext(this.getBindingContext());}};c.prototype.setSemanticObjectLabel=function(l){this.setProperty("semanticObjectLabel",l);if(this._oNavigationPopoverHandler){this._oNavigationPopoverHandler.setSemanticObjectLabel(l);}return this;};c.prototype.setText=function(t){if(this._isRenderingInnerControl()){this.setProperty("text",t,true);}else{L.prototype.setText.call(this,t);}return this;};c.prototype.setMapFieldToSemanticObject=function(m){this.setProperty("mapFieldToSemanticObject",m);if(this._oNavigationPopoverHandler){this._oNavigationPopoverHandler.setMapFieldToSemanticObject(m);}return this;};c.prototype.setSemanticObject=function(s){this.setProperty("semanticObject",s);if(this._oNavigationPopoverHandler){this._oNavigationPopoverHandler.setSemanticObject(s);}this._updateEnabled();return this;};c.prototype.setAdditionalSemanticObjects=function(s){this.setProperty("additionalSemanticObjects",s);if(this._oNavigationPopoverHandler){this._oNavigationPopoverHandler.setAdditionalSemanticObjects(s);}return this;};c.prototype.setContactAnnotationPath=function(s){this.setProperty("contactAnnotationPath",s);if(this._oNavigationPopoverHandler){this._oNavigationPopoverHandler.setContactAnnotationPath(s);}this._updateEnabled();return this;};c.prototype.setEnableAvailableActionsPersonalization=function(e){this.setProperty("enableAvailableActionsPersonalization",e);if(this._oNavigationPopoverHandler){this._oNavigationPopoverHandler.setEnableAvailableActionsPersonalization(e);}return this;};c.prototype.setIgnoreLinkRendering=function(i){this.setProperty("ignoreLinkRendering",i);this._updateEnabled();return this;};c.prototype.setFieldName=function(f){this.setProperty("fieldName",f);if(this._oNavigationPopoverHandler){this._oNavigationPopoverHandler.setFieldName(f);}this._updateEnabled();return this;};c.prototype.setSemanticObjectController=function(o){if(o&&!(o instanceof sap.ui.comp.navpopover.SemanticObjectController)){q.sap.log.warning("Warning: setSemanticObjectController() has to be an object of sap.ui.comp.navpopover.SemanticObjectController instances",this);return this;}var d=this.getProperty("semanticObjectController");if(d===o){return;}if(d){d.unregisterControl(this);}this.setProperty("semanticObjectController",o,true);if(o){o.registerControl(this);}if(this._oNavigationPopoverHandler){this._oNavigationPopoverHandler.setSemanticObjectController(o);}this._updateEnabled();return this;};c.prototype.onBeforeRendering=function(){L.prototype.onBeforeRendering.apply(this,arguments);if(!this.getSemanticObjectController()){var s=this._getSemanticObjectControllerOfParent();if(s){this.setSemanticObjectController(s);}}};c.prototype.exit=function(){if(this.getSemanticObjectController()){this.getSemanticObjectController().unregisterControl(this);}if(this._oNavigationPopoverHandler){this._oNavigationPopoverHandler.destroy();this._oNavigationPopoverHandler=null;}};c.prototype._onLinkPressed=function(e){this._createNavigationPopoverHandler().openPopover();};c.prototype._createNavigationPopoverHandler=function(){if(!this._oNavigationPopoverHandler){if(!this.getFieldName()){var B=this.getBinding("text");var f=B&&B.getPath();if(!f&&B&&B.getBindings){f=B.getBindings()[0].getPath();}this.setFieldName(f);}this._oNavigationPopoverHandler=new N({semanticObject:this.getSemanticObject(),additionalSemanticObjects:this.getAdditionalSemanticObjects(),semanticObjectController:this.getSemanticObjectController(),fieldName:this.getFieldName(),semanticObjectLabel:this.getSemanticObjectLabel(),mapFieldToSemanticObject:this.getMapFieldToSemanticObject(),contactAnnotationPath:this.getContactAnnotationPath(),enableAvailableActionsPersonalization:this.getEnableAvailableActionsPersonalization(),control:this,beforePopoverOpens:q.proxy(this._onBeforePopoverOpens,this),navigationTargetsObtained:q.proxy(this._onNavigationTargetsObtained,this),innerNavigate:q.proxy(this._onInnerNavigate,this)});this._oNavigationPopoverHandler.setModel(this.getModel());}return this._oNavigationPopoverHandler;};c.prototype._onNavigationTargetsObtained=function(e){var p=e.getParameters();if(!this.hasListeners("navigationTargetsObtained")){p.show();return;}this.fireNavigationTargetsObtained({mainNavigation:p.mainNavigation,actions:p.actions,ownNavigation:p.ownNavigation,popoverForms:p.popoverForms,semanticObject:p.semanticObject,semanticAttributes:p.semanticAttributes,originalId:p.originalId,show:p.show});};c.prototype._onBeforePopoverOpens=function(e){var p=e.getParameters();if(!this.hasListeners("beforePopoverOpens")){p.open();return;}this.fireBeforePopoverOpens({originalId:p.originalId,semanticObject:p.semanticObject,semanticAttributes:p.semanticAttributes,semanticAttributesOfSemanticObjects:p.semanticAttributesOfSemanticObjects,setSemanticAttributes:p.setSemanticAttributes,setAppStateKey:p.setAppStateKey,open:p.open});};c.prototype._onInnerNavigate=function(e){var p=e.getParameters();if(!this.hasListeners("innerNavigate")){return;}this.fireInnerNavigate({text:p.text,href:p.href,originalId:p.originalId,semanticObject:p.semanticObject,semanticAttributes:p.semanticAttributes});};c.prototype._isRenderingInnerControl=function(){return this.getIgnoreLinkRendering()&&this._getInnerControl()!=null;};c.prototype._getInnerControl=function(){var i=this.getAggregation("innerControl");if(i){return i;}var f=this.getCreateControlCallback();if(f){i=f();this.setAggregation("innerControl",i,true);return i;}return null;};c.prototype._getSemanticObjectControllerOfParent=function(){var s;var p=this.getParent();while(p){if(p.getSemanticObjectController){s=p.getSemanticObjectController();if(s){this.setSemanticObjectController(s);break;}}p=p.getParent();}return s;};c.prototype._updateEnabled=function(){var t=this;S.getDistinctSemanticObjects().then(function(s){var i=false;if(t.getSemanticObjectController()){var I=P.createArrayFromString(t.getSemanticObjectController().getIgnoredFields());i=I.indexOf(t.getFieldName())>-1;}var d=(t.getIgnoreLinkRendering()===false||t.getIgnoreLinkRendering()===true)?t.getIgnoreLinkRendering():false;var h=!(t.getContactAnnotationPath()===undefined);t.setEnabled(!i&&!d&&(S.hasDistinctSemanticObject(t.getSemanticObject(),s)||h));});};return c;},true);
