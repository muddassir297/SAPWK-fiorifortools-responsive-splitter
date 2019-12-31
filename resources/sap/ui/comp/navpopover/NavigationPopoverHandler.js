/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/comp/library',"sap/ui/base/ManagedObject",'./SemanticObjectController','sap/ui/model/json/JSONModel','sap/ui/core/Control','./Factory','./NavigationPopover','./Util','sap/m/VBox','./LinkData','sap/m/MessageBox','sap/ui/comp/personalization/Controller','sap/ui/comp/personalization/Util','./FlexHandler'],function(q,C,M,S,J,a,F,N,U,V,L,b,c,P,d){"use strict";var e=M.extend("sap.ui.comp.navpopover.NavigationPopoverHandler",{metadata:{library:"sap.ui.comp",properties:{semanticObject:{type:"string",defaultValue:null},additionalSemanticObjects:{type:"string[]",defaultValue:[]},semanticObjectController:{type:"any",defaultValue:null},fieldName:{type:"string",defaultValue:null},semanticObjectLabel:{type:"string",defaultValue:null},mapFieldToSemanticObject:{type:"boolean",defaultValue:true},semanticAttributes:{type:"object",visibility:"hidden",defaultValue:null},contactAnnotationPath:{type:"string",defaultValue:undefined},enableAvailableActionsPersonalization:{type:"boolean",defaultValue:true}},associations:{control:{type:"sap.ui.core.Control",multiple:false}},events:{beforePopoverOpens:{parameters:{semanticObject:{type:"string"},semanticAttributes:{type:"object"},semanticAttributesOfSemanticObjects:{type:"object"},setSemanticAttributes:{type:"function"},setAppStateKey:{type:"function"},originalId:{type:"string"},open:{type:"function"}}},navigationTargetsObtained:{parameters:{mainNavigation:{type:"sap.ui.comp.navpopover.LinkData"},actions:{type:"sap.ui.comp.navpopover.LinkData[]"},ownNavigation:{type:"sap.ui.comp.navpopover.LinkData"},popoverForms:{type:"sap.ui.layout.form.SimpleForm[]"},semanticObject:{type:"string"},semanticAttributes:{type:"object"},originalId:{type:"string"},show:{type:"function"}}},innerNavigate:{parameters:{text:{type:"string"},href:{type:"string"},semanticObject:{type:"string"},semanticAttributes:{type:"object"},originalId:{type:"string"}}}}}});e.prototype.init=function(){this._oPopover=null;var m=new J({semanticObject:undefined,semanticObjectLabel:undefined,semanticAttributes:undefined,appStateKey:undefined,mainNavigationId:undefined,contact:{exists:false,bindingPath:undefined,expand:undefined,select:undefined},navigationTarget:{mainNavigation:undefined,availableActionsPersonalizationText:undefined,extraContent:undefined},availableActions:[]});m.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);m.setSizeLimit(1000);this.setModel(m,"$sapuicompNavigationPopoverHandler");};e.prototype.applySettings=function(s){M.prototype.applySettings.apply(this,arguments);this.setSemanticAttributes(this._calculateSemanticAttributes());};e.prototype.openPopover=function(){var t=this;return new Promise(function(r){t._getPopover().then(function(p){if(!p.hasContent()){t._showErrorDialog(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_DETAILS_NAV_NOT_POSSIBLE"),sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_MSG_NAV_NOT_POSSIBLE"),p);t._destroyPopover();return r();}var l=p.getDirectLink();if(l){t._fireInnerNavigate({text:l.getText(),href:l.getHref()});window.location.href=l.getHref();t._destroyPopover();return r();}q.sap.delayedCall(0,this,function(){p.show();return r();});});});};e.prototype.getSemanticObjectValue=function(){var s=this.getSemanticAttributes();if(s){return s[this.getSemanticObject()][this.getSemanticObject()];}return undefined;};e.prototype.getNavigationPopoverStableId=function(){var A=this._getAppComponent();var s=this.getModel("$sapuicompNavigationPopoverHandler").getProperty("/semanticObject");if(!A||!s){return undefined;}var f=[s].concat(this.getAdditionalSemanticObjects());U.sortArrayAlphabetical(f);var g=f.join("--");return"sapuicompnavpopoverNavigationPopover---"+A.getId()+"---"+g;};e.prototype.updateBindingContext=function(){a.prototype.updateBindingContext.apply(this,arguments);this.setSemanticAttributes(this._calculateSemanticAttributes());this._destroyPopover();};e.prototype.setSemanticObjectLabel=function(l){this.setProperty("semanticObjectLabel",l);var m=this.getModel("$sapuicompNavigationPopoverHandler");m.setProperty("/semanticObjectLabel",l);return this;};e.prototype.setSemanticObject=function(s){this._destroyPopover();this.setProperty("semanticObject",s);var m=this.getModel("$sapuicompNavigationPopoverHandler");m.setProperty("/semanticObject",s);this.setSemanticAttributes(this._calculateSemanticAttributes());return this;};e.prototype.setSemanticAttributes=function(s){this.setProperty("semanticAttributes",s);var m=this.getModel("$sapuicompNavigationPopoverHandler");m.setProperty("/semanticAttributes",s);return this;};e.prototype.setFieldName=function(f){this.setProperty("fieldName",f);this.setSemanticAttributes(this._calculateSemanticAttributes());return this;};e.prototype.setControl=function(o){this.setAssociation("control",o);this.setModel(o.getModel());this._destroyPopover();this._updateSemanticObjectController();this.setSemanticAttributes(this._calculateSemanticAttributes());return this;};e.prototype.setMapFieldToSemanticObject=function(m){this.setProperty("mapFieldToSemanticObject",m);this.setSemanticAttributes(this._calculateSemanticAttributes());return this;};e.prototype.setSemanticObjectController=function(s){this._updateSemanticObjectController(s);this.setSemanticAttributes(this._calculateSemanticAttributes());return this;};e.prototype.exit=function(){this._destroyPopover();if(this.getSemanticObjectController()){this.getSemanticObjectController().unregisterControl(this);}if(this.getModel("$sapuicompNavigationPopoverHandler")){this.getModel("$sapuicompNavigationPopoverHandler").destroy();}};e.prototype._initModel=function(){var t=this;this.setSemanticAttributes(this._calculateSemanticAttributes());var s=this.getSemanticAttributes();var f=this.getSemanticObject();var A=this.getAdditionalSemanticObjects();var g=this.getContactAnnotationPath();if(g===undefined&&this.getSemanticObjectController()&&this.getSemanticObjectController().getContactAnnotationPaths()&&this.getSemanticObjectController().getContactAnnotationPaths()[this.getFieldName()]!==undefined){g=this.getSemanticObjectController().getContactAnnotationPaths()[this.getFieldName()];}var o=sap.ui.getCore().byId(this.getControl());var B=o&&o.getBindingContext()?o.getBindingContext().getPath():null;var O=this.getModel();var h=this._getComponent();var i=o&&o.getId();var m,j;return new Promise(function(r){t._fireBeforePopoverOpens(s,f,i).then(function(R){t.setSemanticAttributes(R.semanticAttributes);m=j=t.getSemanticObjectValue();t.getModel("$sapuicompNavigationPopoverHandler").setProperty("/appStateKey",R.appStateKey);t._prepareFormsAndTargets(f,A,R.appStateKey,h,R.semanticAttributes,m,O,B,g,j).then(function(k){t._fireNavigationTargetsObtained(m,f,R.semanticAttributes,i,k[0].forms,k[1]).then(function(l){var n=t.getModel("$sapuicompNavigationPopoverHandler");n.setProperty("/mainNavigationId",l.mainNavigationId);n.setProperty("/navigationTarget/mainNavigation",l.mainNavigation);n.setProperty("/navigationTarget/extraContent",l.extraContent);n.setProperty("/contact/exists",!!k[0].forms.length);n.setProperty("/contact/bindingPath",k[0].bindingPath);n.setProperty("/contact/expand",k[0].expand);n.setProperty("/contact/select",k[0].select);n.setProperty("/availableActions",t._updateVisibilityOfAvailableActions(L.convert2Json(l.availableActions)));return r();});});});});};e.prototype._initPopover=function(){var t=this;return new Promise(function(r){t._initModel().then(function(){var m=t.getModel("$sapuicompNavigationPopoverHandler");var p=t._createPopover();if(m.getProperty("/contact/exists")){var o=sap.ui.getCore().byId(t.getControl());var B=o&&o.getBindingContext()?o.getBindingContext().getPath():null;if(m.getProperty("/contact/bindingPath")){p.bindContext({path:m.getProperty("/contact/bindingPath"),events:{change:function(){p.invalidate();}}});}else if(B){p.bindContext({path:B,parameters:{expand:m.getProperty("/contact/expand"),select:m.getProperty("/contact/select")},events:{change:function(){p.invalidate();}}});}}return r(p);});});};e.prototype._getPopover=function(){var t=this;return new Promise(function(r){if(!t._oPopover){t._initPopover().then(function(p){return r(p);});}else{return r(t._oPopover);}});};e.prototype._destroyPopover=function(){if(this._oPopover){this._oPopover.destroy();this._oPopover=null;}};e.prototype._createPopover=function(){if(this._oPopover){return this._oPopover;}var m=this.getModel("$sapuicompNavigationPopoverHandler");this._oPopover=new N(this.getNavigationPopoverStableId(),{title:"{$sapuicompNavigationPopoverHandler>/semanticObjectLabel}",mainNavigationId:"{$sapuicompNavigationPopoverHandler>/mainNavigationId}",semanticObjectName:"{$sapuicompNavigationPopoverHandler>/semanticObject}",semanticAttributes:"{$sapuicompNavigationPopoverHandler>/semanticAttributes}",appStateKey:"{$sapuicompNavigationPopoverHandler>/appStateKey}",mainNavigation:m.getProperty("/navigationTarget/mainNavigation"),availableActions:{path:'$sapuicompNavigationPopoverHandler>/availableActions',templateShareable:false,template:new L({key:"{$sapuicompNavigationPopoverHandler>key}",href:"{$sapuicompNavigationPopoverHandler>href}",text:"{$sapuicompNavigationPopoverHandler>text}",target:"{$sapuicompNavigationPopoverHandler>target}",description:"{$sapuicompNavigationPopoverHandler>description}",visible:"{$sapuicompNavigationPopoverHandler>visible}"})},extraContent:m.getProperty("/navigationTarget/extraContent")?m.getProperty("/navigationTarget/extraContent").getId():undefined,availableActionsPersonalizationText:"{$sapuicompNavigationPopoverHandler>/navigationTarget/availableActionsPersonalizationText}",source:this.getControl(),component:this._getComponent(),navigate:q.proxy(this._onNavigate,this),availableActionsPersonalizationPress:q.proxy(this._onAvailableActionsPersonalizationPress,this),afterClose:q.proxy(this._destroyPopover,this)});this._oPopover._getFlexHandler().setInitialSnapshot(d.convertArrayToSnapshot("key",m.getProperty("/availableActions")));this._oPopover.setModel(m,"$sapuicompNavigationPopoverHandler");var o=sap.ui.getCore().byId(this.getControl());if(o){o.addDependent(this._oPopover);}this._updateAvailableActionsPersonalizationText();return this._oPopover;};e.prototype._prepareFormsAndTargets=function(s,A,f,o,g,m,O,B,h,i){var p=new Promise(function(r){U.retrieveContactAnnotationData(O,B,h).then(function(k){var l=U.parseContactAnnotation(k);return r({bindingPath:k.entitySet?"/"+k.entitySet+"('"+i+"')":undefined,expand:l.expand,select:l.select,forms:U.createContactDetailForms(l.groups)});});});var j=new Promise(function(r){U.retrieveNavigationTargets(s,A,f,o,g,m).then(function(n){return r(n);});});return Promise.all([p,j]);};e.prototype._fireBeforePopoverOpens=function(s,f,i){var t=this;return new Promise(function(r){var R={semanticAttributes:s,appStateKey:undefined};if(!t.hasListeners("beforePopoverOpens")){return r(R);}t.fireBeforePopoverOpens({originalId:i,semanticObject:f,semanticAttributes:s?s[f]:s,semanticAttributesOfSemanticObjects:s,setSemanticAttributes:function(g,h){h=h||f;R.semanticAttributes=R.semanticAttributes||{};R.semanticAttributes[h]=g;},setAppStateKey:function(A){R.appStateKey=A;},open:function(){return r(R);}});});};e.prototype._fireNavigationTargetsObtained=function(m,s,o,i,f,n){var t=this;return new Promise(function(r){var R={mainNavigationId:m,mainNavigation:n.mainNavigation,availableActions:n.availableActions,ownNavigation:n.ownNavigation,extraContent:f.length?new V({items:f}):undefined};if(!t.hasListeners("navigationTargetsObtained")){return r(R);}t.fireNavigationTargetsObtained({mainNavigation:n.mainNavigation,actions:n.availableActions,ownNavigation:n.ownNavigation,popoverForms:f,semanticObject:s,semanticAttributes:o?o[s]:o,originalId:i,show:function(m,g,A,h){if(!(typeof m==="string"||g instanceof sap.ui.comp.navpopover.LinkData||q.isArray(A))&&h===undefined){h=A;A=g;g=m;m=undefined;}if(m!==undefined&&m!==null){R.mainNavigationId=m;}if(g!==undefined){R.mainNavigation=g;}if(A){A.forEach(function(j){if(j.getKey()===undefined){q.sap.log.error("'key' attribute of 'availableAction' '"+j.getText()+"' is undefined. Links without 'key' can not be persisted.");q.sap.log.warning("The 'visible' attribute of 'availableAction' '"+j.getText()+"' is set to 'true'");j.setVisible(true);}});R.availableActions=A;}if(h){R.extraContent=h;}return r(R);}});});};e.prototype._onNavigate=function(E){var p=E.getParameters();this._fireInnerNavigate({text:p.text,href:p.href});};e.prototype._onAvailableActionsPersonalizationPress=function(E){var t=this;var n=E.getSource();this._oPopover.setModal(true);this._oPopover._getFlexHandler().openSelectionDialog(n).then(function(){t._oPopover.setModal(false);t._updateAvailableActionsPersonalizationText();},this);};e.prototype._fireInnerNavigate=function(p){var o=sap.ui.getCore().byId(this.getControl());var s=this.getSemanticObject();var f=this.getSemanticAttributes();this.fireInnerNavigate({text:p.text,href:p.href,originalId:o?o.getId():undefined,semanticObject:s,semanticAttributes:f?f[s]:f});};e.prototype._getComponent=function(){var o=sap.ui.getCore().byId(this.getControl());if(!o){return null;}var p=o.getParent();while(p){if(p instanceof sap.ui.core.Component){if(p&&p.getAppComponent){p=p.getAppComponent();}return p;}p=p.getParent();}return null;};e.prototype._getAppComponent=function(){return F.getService("FlexConnector").getAppComponentForControl(sap.ui.getCore().byId(this.getControl()));};e.prototype._calculateSemanticAttributes=function(){var o=sap.ui.getCore().byId(this.getControl());var B=this.getBindingContext()||(o&&o.getBindingContext());if(!B){return null;}var r={};var s=this.getFieldName();var f=B.getObject(B.getPath());for(var A in f){if(A==="__metadata"){continue;}if(!f[A]){continue;}var g=A;if(this.getMapFieldToSemanticObject()){g=this._mapFieldToSemanticObject(A);}var h=f[A];if(r[g]){if(f[s]){h=f[s];}}r[g]=h;}var R={};["",this.getSemanticObject()].concat(this.getAdditionalSemanticObjects()).forEach(function(i){R[i]=r;});return R;};e.prototype._mapFieldToSemanticObject=function(f){if(this.getFieldName()===f&&this.getSemanticObject()){return this.getSemanticObject();}var s=this.getSemanticObjectController();if(!s){return f;}var m=s.getFieldSemanticObjectMap();if(!m){return f;}return m[f]||f;};e.prototype._updateSemanticObjectController=function(o){var f=this.getProperty("semanticObjectController");var g=sap.ui.getCore().byId(this.getControl());o=o||this.getSemanticObjectController()||this._getSemanticObjectControllerOfControl(g);if(o&&g&&o.isControlRegistered(g)){o.unregisterControl(this);}if(o!==f&&f){f.unregisterControl(this);}this.setProperty("semanticObjectController",o);if(o&&!o.isControlRegistered(g)){o.registerControl(this);}};e.prototype._getSemanticObjectControllerOfControl=function(o){if(!o){return undefined;}var s;var p=o.getParent();while(p){if(p.getSemanticObjectController){s=p.getSemanticObjectController();if(s){this.setSemanticObjectController(s);break;}}p=p.getParent();}return s;};e.prototype._updateVisibilityOfAvailableActions=function(m){var f=U.getStorableAvailableActions(m);f.forEach(function(o){if(m.length>10){o.visible=false;}});return m;};e.prototype._updateAvailableActionsPersonalizationText=function(){var m=this.getModel("$sapuicompNavigationPopoverHandler");var f=U.getStorableAvailableActions(m.getProperty("/availableActions"));if(f.length===0){m.setProperty("/navigationTarget/availableActionsPersonalizationText",undefined);return;}var E=this.getEnableAvailableActionsPersonalization();if(this.getSemanticObjectController()&&this.getSemanticObjectController().getEnableAvailableActionsPersonalization()&&this.getSemanticObjectController().getEnableAvailableActionsPersonalization()[this.getFieldName()]!==undefined){E=this.getSemanticObjectController().getEnableAvailableActionsPersonalization()[this.getFieldName()];}if(!E){m.setProperty("/navigationTarget/availableActionsPersonalizationText",undefined);return;}var A=sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_DEFINE_LINKS");if(this._oPopover){var s=this._oPopover._getFlexHandler().determineSnapshotOfChangedAvailableActions();if(!q.isEmptyObject(s)){A=sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_DEFINE_MORE_LINKS");}}m.setProperty("/navigationTarget/availableActionsPersonalizationText",A);};e.prototype._showErrorDialog=function(t,T,o){b.show(t,{icon:b.Icon.ERROR,title:T,actions:[sap.m.MessageBox.Action.CLOSE],styleClass:(o.$()&&o.$().closest(".sapUiSizeCompact").length)?"sapUiSizeCompact navigationPopoverErrorDialog":"navigationPopoverErrorDialog"});};return e;},true);
