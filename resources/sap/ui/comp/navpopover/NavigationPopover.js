/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/m/Link','sap/m/ResponsivePopover','sap/m/Title','sap/m/Image','sap/m/Text','sap/ui/layout/form/SimpleForm','sap/m/VBox','sap/m/ResponsivePopoverRenderer','./Factory','./LinkData','sap/ui/model/json/JSONModel','./Util','sap/ui/core/TitleLevel','sap/ui/layout/HorizontalLayout','sap/ui/layout/VerticalLayout','sap/ui/layout/form/SimpleFormLayout','sap/ui/comp/personalization/Util','./FlexHandler'],function(q,L,R,T,I,a,S,V,b,F,c,J,U,C,H,d,e,P,f){"use strict";var N=R.extend("sap.ui.comp.navpopover.NavigationPopover",{metadata:{library:"sap.ui.comp",properties:{semanticObjectName:{type:"string",group:"Misc",defaultValue:null},semanticAttributes:{type:"object",group:"Misc",defaultValue:null},appStateKey:{type:"string",group:"Misc",defaultValue:null},mainNavigationId:{type:"string",group:"Misc",defaultValue:null},availableActionsPersonalizationText:{type:"string",group:"Misc",defaultValue:undefined}},aggregations:{availableActions:{type:"sap.ui.comp.navpopover.LinkData",multiple:true,singularName:"availableAction"},mainNavigation:{type:"sap.ui.comp.navpopover.LinkData",multiple:false},ownNavigation:{type:"sap.ui.comp.navpopover.LinkData",multiple:false},flexHandler:{type:"sap.ui.comp.navpopover.FlexHandler",visibility:"hidden",multiple:false}},associations:{source:{type:"sap.ui.core.Control",multiple:false},extraContent:{type:"sap.ui.core.Control",multiple:false},component:{type:"sap.ui.core.Element",multiple:false}},events:{targetsObtained:{},navigate:{},availableActionsPersonalizationPress:{}}},renderer:b.render});N.prototype.init=function(){R.prototype.init.call(this);var m=new J({mainNavigationLink:{title:undefined,subtitle:undefined,href:undefined,target:undefined},ownNavigation:undefined,availableActions:[],availableActionsPressMap:{},availableActionsPersonalizationText:undefined,extraContent:undefined});m.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);m.setSizeLimit(1000);this.setModel(m,"$sapuicompNavigationPopover");this._createContent();this.setAggregation("flexHandler",new f());};N.prototype.retrieveNavTargets=function(){var x=F.getService("CrossApplicationNavigation");var u=F.getService("URLParsing");if(!x||!u){q.sap.log.error("Service 'CrossApplicationNavigation' could not be obtained");this.fireTargetsObtained();return;}var t=this;this.setMainNavigation(null);this.setOwnNavigation(null);this.removeAllAvailableActions();var p=x.getLinks({semanticObject:this.getSemanticObjectName(),params:this.getSemanticAttributes(),appStateKey:this.getAppStateKey(),ui5Component:this._getComponent(),sortResultOnTexts:true});p.done(function(l){if(!l||!l.length){this.fireTargetsObtained();return;}var s=x.hrefForExternal();if(s&&s.indexOf("?")!==-1){s=s.split("?")[0];}l.forEach(function(o){if(o.intent.indexOf(s)===0){t.setOwnNavigation(new c({href:o.intent,text:o.text}));return;}var g=u.parseShellHash(o.intent);if(g.action&&(g.action==='displayFactSheet')){t.setMainNavigation(new c({href:o.intent,text:sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_FACTSHEET")}));return;}t.addAvailableAction(new c({href:o.intent,text:o.text}));});t.fireTargetsObtained();});p.fail(function(E){q.sap.log.error("'retrieveNavTargets' failed");return;});};N.prototype.show=function(){if(!this._hasNavigationTargets()){q.sap.log.error("no navigation targets assigned");return;}var o=this._getControl();if(!o){q.sap.log.error("no source assigned");return;}this.openBy(o);};N.prototype.getDirectLink=function(){var m=this.getModel("$sapuicompNavigationPopover");if(m.getProperty('/extraContent')){return null;}if(m.getProperty('/mainNavigationLink/href')&&!m.getProperty('/availableActions').length){return this._oHeaderForm.getContent()[0];}if(m.getProperty('/availableActions').length===1&&!m.getProperty('/mainNavigationLink/href')){return this._oActionBox.getItems()[0].getItems()[0];}return null;};N.prototype.hasContent=function(){var m=this.getModel("$sapuicompNavigationPopover");return!!m.getProperty("/mainNavigationLink/href")||!!m.getProperty("/availableActions").length||!!m.getProperty('/extraContent');};N.prototype.setExtraContent=function(o){var m=this.getModel("$sapuicompNavigationPopover");if(m.getProperty("/extraContent")){this._getContentContainer().removeItem(1);}if(typeof o==="string"){o=sap.ui.getCore().byId(o);}this._getContentContainer().insertItem(o,1);this.setAssociation("extraContent",o);m.setProperty("/extraContent",o);return this;};N.prototype.setMainNavigationId=function(m){this.setProperty("mainNavigationId",m,true);var M=this.getModel("$sapuicompNavigationPopover");if(typeof m==="string"){M.setProperty("/mainNavigationLink/title",m);}return this;};N.prototype.setMainNavigation=function(l){this.setAggregation("mainNavigation",l,true);if(!l){return this;}var m=this.getModel("$sapuicompNavigationPopover");if(l.getHref()){m.setProperty("/mainNavigationLink/href",this._convertToExternal(l.getHref()));m.setProperty("/mainNavigationLink/target",l.getTarget());this._oHeaderForm.removeStyleClass("navpopoversmallheader");}else{this._oHeaderForm.addStyleClass("navpopoversmallheader");}if(!m.getProperty("/mainNavigationLink/title")){m.setProperty("/mainNavigationLink/title",l.getText());}m.setProperty("/mainNavigationLink/subtitle",l.getDescription());return this;};N.prototype.setAvailableActionsPersonalizationText=function(A){this.setProperty("availableActionsPersonalizationText",A,true);var m=this.getModel("$sapuicompNavigationPopover");m.setProperty("/availableActionsPersonalizationText",A);return this;};N.prototype.addAvailableAction=function(l){l.setHref(this._convertToExternal(l.getHref()));l.setPress(q.proxy(this._onLinkPress,this));this.addAggregation("availableActions",l);if(!l){return this;}var m=this.getModel("$sapuicompNavigationPopover");var i=m.getProperty("/availableActions").length;m.getData().availableActions.splice(i,0,l.getJson());m.getData().availableActionsPressMap[l.getText()+"---"+l.getHref()]=q.proxy(this._onLinkPress,this);m.refresh(true);return this;};N.prototype.insertAvailableAction=function(l,i){l.setHref(this._convertToExternal(l.getHref()));l.setPress(q.proxy(this._onLinkPress,this));this.insertAggregation("availableActions",l,i);if(!l){return this;}var m=this.getModel("$sapuicompNavigationPopover");m.getData().availableActions.splice(i,0,l.getJson());m.getData().availableActionsPressMap[l.getText()+"---"+l.getHref()]=q.proxy(this._onLinkPress,this);m.refresh(true);return this;};N.prototype.removeAvailableAction=function(l){var i=this.indexOfAvailableAction(l);if(i>-1){var m=this.getModel("$sapuicompNavigationPopover");m.getData().availableActions.splice(i,1);m.refresh(true);}l=this.removeAggregation("availableActions",l);return l;};N.prototype.removeAllAvailableActions=function(){var A=this.removeAllAggregation("availableActions");var m=this.getModel("$sapuicompNavigationPopover");m.setProperty("/availableActions",[]);m.refresh(true);return A;};N.prototype.exit=function(o){if(this.getModel("$sapuicompNavigationPopover")){this.getModel("$sapuicompNavigationPopover").destroy();}R.prototype.exit.apply(this,arguments);};N.prototype.onAfterRenderingActionForm=function(){var m=this.getModel("$sapuicompNavigationPopover");var $=m.getProperty("/extraContent")?m.getProperty("/extraContent").$()[0]:undefined;if($&&$.scrollHeight>$.clientHeight){this._getContentContainer().setFitContainer(false).setJustifyContent(sap.m.FlexJustifyContent.Start);}};N.prototype._createContent=function(){var t=this;this.addStyleClass("navigationPopover");this.setContentWidth("380px");this.setHorizontalScrolling(false);this.setShowHeader(!!sap.ui.Device.system.phone);this.setPlacement(sap.m.PlacementType.Auto);var o=new L({href:{path:'/mainNavigationLink/href'},text:{path:'/mainNavigationLink/title'},target:{path:'/mainNavigationLink/target'},visible:{path:'/mainNavigationLink/title',formatter:function(g){return!!g;}},enabled:{path:'/mainNavigationLink/href',formatter:function(v){return!!v;}},press:q.proxy(this._onLinkPress,this)});o.addStyleClass("navigationPopoverTitle");this._oHeaderForm=new S({maxContainerCols:1,layout:e.ResponsiveGridLayout,visible:{parts:[{path:'/mainNavigationLink/title'},{path:'/mainNavigationLink/subtitle'}],formatter:function(g,s){return!!g||!!s;}},content:[o,new a({text:{path:'/mainNavigationLink/subtitle'},visible:{path:'/mainNavigationLink/subtitle',formatter:function(v){return!!v;}}})]});this._oHeaderForm.addStyleClass("navigationPopoverTitleH1");this._oHeaderForm.setModel(this.getModel("$sapuicompNavigationPopover"));this._oActionBox=new V({visible:{parts:[{path:'/availableActions'},{path:'/availableActionsPersonalizationText'}],formatter:function(m,A){var M=m.filter(function(g){return g.visible===true;});return M.length>0||!!A;}},items:[new V({items:{path:'/availableActions',template:new L({text:"{text}",href:"{href}",target:"{target}",press:function(E){var O=this.getModel("$sapuicompNavigationPopover").getProperty("/availableActionsPressMap")[this.getText()+"---"+this.getHref()];if(O){O(E);}},visible:"{visible}"})}}),new L({width:"100%",textAlign:sap.ui.core.TextAlign.End,text:{path:'/availableActionsPersonalizationText'},visible:{parts:[{path:'/availableActions'},{path:'/availableActionsPersonalizationText'}],formatter:function(m,A){return m.length>0&&!!A;}},press:function(){t.fireAvailableActionsPersonalizationPress();}})]});this._oActionBox.addEventDelegate({onAfterRendering:q.proxy(this.onAfterRenderingActionForm,this)});this._oActionBox.addStyleClass("navigationPopoverAvailableLinks");this._oActionBox.setModel(this.getModel("$sapuicompNavigationPopover"));this.addContent(new V({fitContainer:true,justifyContent:sap.m.FlexJustifyContent.SpaceBetween,items:[this._oHeaderForm,this._oActionBox]}));};N.prototype._getContentContainer=function(){return this.getContent()[0];};N.prototype._onLinkPress=function(E){this.fireNavigate({text:E.getSource().getText(),href:E.getSource().getHref()});};N.prototype._hasNavigationTargets=function(){var m=this.getModel("$sapuicompNavigationPopover");if(!m.getProperty("/mainNavigationLink/href")&&!m.getProperty("/availableActions").length&&!m.getProperty('/extraContent')){q.sap.require("sap.m.MessageBox");var M=sap.ui.require("sap/m/MessageBox");M.show(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_DETAILS_NAV_NOT_POSSIBLE"),{icon:M.Icon.ERROR,title:sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_MSG_NAV_NOT_POSSIBLE"),actions:[sap.m.MessageBox.Action.CLOSE],styleClass:(this.$()&&this.$().closest(".sapUiSizeCompact").length)?"sapUiSizeCompact":""});return false;}return true;};N.prototype._convertToExternal=function(h){var x=F.getService("CrossApplicationNavigation");if(!x){return h;}return x.hrefForExternal({target:{shellHash:h}},this._getComponent());};N.prototype._getControl=function(){var o=this.getAssociation("source");if(typeof o==="string"){o=sap.ui.getCore().byId(o);}return o;};N.prototype._getComponent=function(){var o=this.getComponent();if(typeof o==="string"){o=sap.ui.getCore().getComponent(o);}return o;};N.prototype._getFlexHandler=function(){return this.getAggregation("flexHandler");};N.prototype._updateAvailableAction=function(l,s){this._getFlexHandler().updateAvailableActionOfSnapshot(l,s);this._syncAvailableActions();};N.prototype._discardAvailableActions=function(l){this._getFlexHandler().discardAvailableActionsOfSnapshot(l);this._syncAvailableActions();};N.prototype._syncAvailableActions=function(){var s=this._getFlexHandler().determineSnapshotOfAvailableActions();var m=this.getModel("$sapuicompNavigationPopover");m.getProperty("/availableActions").forEach(function(M,i){if(s[M.key]!==undefined){m.setProperty("/availableActions/"+i+"/visible",s[M.key].visible);}});};return N;},true);
