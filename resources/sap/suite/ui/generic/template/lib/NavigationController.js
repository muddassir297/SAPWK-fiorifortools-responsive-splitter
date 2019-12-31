/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","sap/ui/base/Object","sap/ui/core/ComponentContainer","sap/ui/core/routing/HashChanger","sap/ui/core/routing/History","sap/ui/core/routing/HistoryDirection","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/m/MessageBox","sap/m/MessagePage","sap/m/Link","sap/suite/ui/generic/template/lib/ProcessObserver","sap/suite/ui/generic/template/lib/routingHelper","sap/suite/ui/generic/template/lib/TemplateComponent","sap/suite/ui/generic/template/lib/testableHelper"],function(q,B,C,H,a,b,F,c,M,d,L,P,r,T,t){"use strict";var h=a.getInstance();function n(s){if(s.indexOf("/")===0){return s;}return"/"+s;}function f(o,R,i){var s=R.template;var E=R.entitySet;var v=R.viewLevel;var O=-1;if(o.oFlexibleColumnLayoutHandler){O=v<3?v:0;}var k=O<0?o.oNavigationObserver:o.aNavigationObservers[O];var l=new P();var m=O<0?o.oHeaderLoadingObserver:o.aHeaderLoadingObservers[O];m.addObserver(l);var p={};var S={appComponent:o.oAppComponent,isLeaf:!R.pages||!R.pages.length,subPages:R.pages,entitySet:E,navigationProperty:R.navigationProperty,routeConfig:R,componentData:{registryEntry:{componentCreateResolve:i,route:R.name,viewLevel:v,oNavigationObserver:k,oHeaderLoadingObserver:l,preprocessorsData:p}}};if(R.component.settings){q.extend(S,R.component.settings);}var u;o.oAppComponent.runAsOwner(function(){try{var w=sap.ui.component({name:s,settings:S,handleValidation:true,async:true});var x;u=new C({propagateModel:true,width:"100%",height:"100%",settings:S});x=w.then(function(y){u.setComponent(y);return u;});u.loaded=function(){return x;};}catch(e){throw new Error("Component "+s+" could not be loaded");}});return u;}function g(o,e){var m={};var k={iHashChangeCount:0,backTarget:0};var A=Promise.resolve();var p=[];function l(){var i=e.oRouter.getViews();i.getView({viewName:"root"});return o.mRouteToTemplateComponentPromise.root;}var s;function u(){if(!s){var i=l();return i.then(function(g1){return g1.getModel("i18n").getResourceBundle().getText("PAGEHEADER");});}return s;}function v(){return k.iHashChangeCount;}function S(i){var g1;if(i instanceof T){var h1=i&&o.componentRegistry[i.getId()];var i1=h1&&h1.methods.getTitle;g1=i1&&Promise.resolve(i1());}else if(i&&i.title){g1=Promise.resolve(i.title);}g1=g1||u();g1.then(function(j1){if(o.oShellService){o.oShellService.setTitle(j1);}});}function w(g1,h1){var i1;var j1=[];for(var i=0;i<=h1;i++){var k1=g1[i];if(k1){if(i1){j1.push(k1);}else{i1=k1;}}}if(i1){i1.resume(j1);}}function x(i){var g1=[o.oPagesDataLoadedObserver.getProcessFinished(true)];var h1=null;var i1=k.iHashChangeCount;var j1=-1;var k1={};for(var l1 in o.componentRegistry){var m1=o.componentRegistry[l1];var n1=m1.oControllerRegistryEntry.oTemplateUtils.oServices.oTemplateCapabilities.oMessageButtonHelper;if(m1.activationTakt<i1){m1.utils.suspendBinding();if(n1){n1.suspend();}}else{g1.push(m1.oViewRenderdPromise);if(m1.viewLevel>j1){j1=m1.viewLevel;h1=m1.oComponent;}k1[m1.viewLevel]=n1;}}w(k1,j1);var o1=h1&&h1.getComponentContainer().getElementBinding();k.bindingPath=o1&&n(o1.getPath());i=i||h1;if(o.oFlexibleColumnLayoutHandler){o.oFlexibleColumnLayoutHandler.setTitleForActiveComponent(i,S);}else{S(i);}Promise.all(g1).then(function(){if(i1===k.iHashChangeCount&&q.isEmptyObject(m)){o.oAppComponent.firePageDataLoaded();}});}var y=x.bind(null,null);function z(i,g1,h1){var i1=function(m1){q.extend(g1,m1);};for(var j1 in o.componentRegistry){var k1=o.componentRegistry[j1];if(k1.route===i){var l1=k1.methods.getUrlParameterInfo;return l1?l1(h1).then(i1):Promise.resolve();}}return Promise.resolve();}function G(g1,h1){var i1=h1?z("root",g1):Promise.resolve();return i1.then(function(){var j1="";var k1="";for(var l1 in g1){var m1=g1[l1];for(var i=0;i<m1.length;i++){var n1=m1[i];k1=k1+j1+l1+"="+n1;j1="&";}}return k1;});}function D(){q.sap.log.info("Navigate back");if(k.backTarget&&n(h.getPreviousHash()||"")!==n(k.hash)){o.oBusyHelper.setBusyReason("HashChange",true);}k.LeaveByBack=true;window.history.back();}function E(i,g1){i=i||"";q.sap.log.info("Navigate to hash: "+i);if(i===k.hash){q.sap.log.info("Navigation suppressed since hash is the current hash");return;}o.oBusyHelper.setBusyReason("HashChange",true);k.targetHash=i;if(k.backTarget&&n(h.getPreviousHash()||"")===n(i)){D();return;}k.LeaveByReplace=g1;if(g1){e.oHashChanger.replaceHash(i);}else{e.oHashChanger.setHash(i);}}function I(i,g1,h1,i1){g1.then(function(j1){if(j1){i=i+"?"+j1;}if(i1){k.backwardingInfo={backCount:i1.backCount,targetViewLevel:i1.targetViewLevel,path:i};D();}else{E(i,h1);}});o.oBusyHelper.setBusy(g1);}function J(i){var g1=0;for(var h1=k;h1.oEvent;){var i1=h1.oEvent.getParameter("config").viewLevel;if(i1===0){return g1;}if(i&&g1>0){return-1;}g1++;h1=p[h1.backTarget];}return-1;}function K(i){var g1=J(!i);var h1=G({},true);var i1=(g1>0)&&{backCount:g1,targetViewLevel:0};I("",h1,i,i1);}function O(i){var g1=o.mEntityTree[i.entitySet].sRouteName;var h1=o.mRouteToTemplateComponentPromise[g1];return[h1];}function Q(g1,h1){var i1=k.iHashChangeCount;var j1=function(l1){var m1=o.componentRegistry[l1.getId()];(m1.methods.presetDisplayMode||q.noop)(h1,i1===m1.activationTakt);};for(var i=0;i<g1.length;i++){var k1=g1[i];k1.then(j1);}}function R(i){var g1=i&&o.mEntityTree[i.entitySet];var h1=g1?g1.level:1;return h1;}function U(g1,h1,i1,j1,k1){var l1;var m1,n1;var o1=[];if(typeof g1==="string"){l1=g1;n1=n(l1).split("/").length-1;}else{m1=r.determineNavigationPath(g1,h1);n1=R(m1);l1=m1.path;o1=O(m1);}if(l1){if(h1){var p1=o.oApplicationProxy.getHierarchySectionsFromCurrentHash();for(var i=n1-2;i>=0;i--){l1=p1[i]+"/"+l1;}l1="/"+l1;}Q(o1,j1||0);if(k1){var q1="";var r1="&";for(var s1 in k1){q1=q1+r1+s1+"="+k1[s1];r1="&";}if(q1){l1=l1+"?"+q1;}E(l1,i1);}else{var t1={};var u1=m1&&o.mEntityTree[m1.entitySet].sRouteName;var v1=z(u1,t1,l1).then(function(){var w1=o.oFlexibleColumnLayoutHandler?o.oFlexibleColumnLayoutHandler.getAppStateParStringForNavigation(n1,t1):G(t1,false);var x1=p[k.backTarget];var y1=(x1.hash&&n(x1.hash.split("?")[0])===n(l1))&&{backCount:1};I(l1,w1,i1,y1);});o.oBusyHelper.setBusy(v1);}}}function V(i,g1,h1,i1){return U(i,g1,h1,i1);}function W(i){var g1=k.iHashChangeCount;k.iHashChangeCount++;p.push(null);if(i){for(var h1 in o.componentRegistry){var i1=o.componentRegistry[h1];if(i1.activationTakt===g1&&i[i1.viewLevel]){i1.activationTakt=k.iHashChangeCount;}}}return{iHashChangeCount:k.iHashChangeCount};}function X(i){var g1,h1,i1,j1,k1,l1=null,m1,n1;if(i){g1=i.entitySet;h1=i.text;l1=i.icon;n1=i.description;}if(g1){m1=o.oAppComponent.getModel().getMetaModel();if(m1){i1=m1.getODataEntitySet(g1);j1=m1.getODataEntityType(i1.entityType);k1=j1["com.sap.vocabularies.UI.v1.HeaderInfo"];}if(k1&&k1.TypeImageUrl&&k1.TypeImageUrl.String){l1=k1.TypeImageUrl.String;}}o.oNoOwnTitlePromise.then(function(q1){if(o.oShellService){o.oShellService.setBackNavigation(undefined);}});o.oTemplatePrivateGlobalModel.setProperty("/generic/messagePage",{text:h1,icon:l1,description:n1});var o1;if(e.oTemplateContract.oFlexibleColumnLayoutHandler){o1=e.oTemplateContract.oFlexibleColumnLayoutHandler.displayMessagePage(i);}else{var p1=e.oRouter.getTargets();p1.display("messagePage");}W(o1);x(i);}function Y(){if(!q.isEmptyObject(m)){var g1=null;for(var i=0;!g1;i++){g1=m[i];}m={};X(g1);}}function Z(i){if(e.oTemplateContract.oFlexibleColumnLayoutHandler){i.viewLevel=i.viewLevel||0;m[i.viewLevel]=i;var g1=Promise.all([A,e.oTemplateContract.oPagesDataLoadedObserver.getProcessFinished(true)]);g1.then(Y);return;}X(i);}function $(){var i=[];var g1=k.iHashChangeCount;for(var h1 in o.componentRegistry){var i1=o.componentRegistry[h1];if(i1.activationTakt===g1){i.push(h1);}}return i;}function _(i,g1,h1){var i1=o.componentRegistry[h1.getId()]||{};var j1=(i1.activationTakt===g1.iHashChangeCount-1);i1.activationTakt=g1.iHashChangeCount;var k1;if(h1&&h1.onActivate){k1=h1.onActivate(i,j1);}return k1||i1.viewRegisterd;}function a1(i,g1,h1){return _(i,g1,h1).then(y);}function b1(i,g1,h1){var i1={};if(g1||h1){var j1=i.getParameter("config").viewLevel;var k1=o.oTemplatePrivateGlobalModel.getProperty("/generic/paginatorInfo");for(var l1=0;l1<j1;l1++){i1[l1]=k1[l1];}}o.oTemplatePrivateGlobalModel.setProperty("/generic/paginatorInfo",i1);}function c1(i){return o.oApplicationProxy.getAlternativeContextPromise(i);}function d1(i){if(o.oFlexibleColumnLayoutHandler){o.oFlexibleColumnLayoutHandler.handleBeforeRouteMatched(i);}}function e1(g1){o.oBusyHelper.setBusyReason("HashChange",false);g1=q.extend({},g1);var h1=g1.getParameter("config").viewLevel;var i1=e.oHashChanger.getHash()||"";q.sap.log.info("Route matched with hash "+i1);if(k.backwardingInfo){k.backwardingInfo.backCount--;if(k.backwardingInfo.backCount&&h1!==k.backwardingInfo.targetViewLevel){k.backTarget=p[k.backTarget].backTarget;k.hash=i1;D();return;}else{var j1=k.backwardingInfo.path;delete k.backwardingInfo;if(j1!==i1){k.forwardingInfo={bIsProgrammatic:true,bIsBack:true,iHashChangeCount:k.iHashChangeCount+1};E(j1,true);return;}}}else if(!k.forwardingInfo){for(var i=0;i<o.aStateChangers.length;i++){var k1=o.aStateChangers[i];if(k1.isStateChange(g1)){return;}}}o.oTemplatePrivateGlobalModel.setProperty("/generic/routeLevel",h1);var l1=k.forwardingInfo;delete k.forwardingInfo;if(!l1){l1={};var m1=k.iHashChangeCount;l1.iHashChangeCount=m1+1;l1.bIsProgrammatic=(i1===k.targetHash);l1.bIsBack=!!(k.LeaveByBack||(!l1.bIsProgrammatic&&(h.getDirection()===b.Backwards)));k.LeaveByBack=l1.bIsBack;k.LeaveByReplace=l1.bIsProgrammatic&&k.LeaveByReplace;var n1=k;p.push(n1);k={iHashChangeCount:l1.iHashChangeCount};if(n1.LeaveByReplace){k.backTarget=n1.backTarget;}else if(l1.bIsBack){k.backTarget=p[n1.backTarget].backTarget;}else{k.backTarget=m1;}b1(g1,l1.bIsProgrammatic,l1.bIsBack);}k.oEvent=g1;k.hash=i1;var o1=g1.getParameter("config");var p1=r.determinePath(o1,g1);var q1=h1<2?p1:r.determinePath(o1,g1,o.routeViewLevel1.pattern);c1(q1).then(function(r1){if(r1){var s1=g1.getParameter("arguments");var t1=s1["?query"];k.forwardingInfo=l1;U(r1.context,null,true,r1.iDisplayMode,t1||{});return;}if(o.oFlexibleColumnLayoutHandler){A=o.oFlexibleColumnLayoutHandler.handleRouteMatched(g1,o1,p1,l1);return;}o.oApplicationProxy.onRouteMatched(g1);if(o1.viewLevel===0||!(l1.bIsProgrammatic||l1.bIsBack)){o.oApplicationProxy.setEditableNDC(false);}var u1=o1.target;var v1=o.mRouteToTemplateComponentPromise[u1];A=new Promise(function(w1){v1.then(function(x1){a1(p1,l1,x1).then(w1);});});});}function f1(){o.oApplicationProxy.onBypassed();Z({title:o.getText("ST_GENERIC_UNKNOWN_NAVIGATION_TARGET"),replaceURL:true});}if(o.sRoutingType==="f"){e.oRouter.attachBeforeRouteMatched(d1);}e.oRouter.attachRouteMatched(e1);e.oRouter.attachBypassed(f1);e.navigate=E;e.navigateToParStringPromise=I;e.activateOneComponent=_;e.afterActivation=y;e.addUrlParameterInfoForRoute=z;e.getParStringPromise=G;e.performPseudoHashChange=W;e.getActiveComponents=$;e.getRootComponentPromise=l;e.getCurrenActivationTakt=v;e.getTargetLevel=R;t.testable(function(){p.push(k);},"NavigationController_init");return{navigateToRoot:K,navigateToContext:V,navigateToMessagePage:Z,navigateBack:D};}function j(o,e){var i={oAppComponent:e.oAppComponent,oRouter:e.oAppComponent.getRouter(),oTemplateContract:e,oHashChanger:H.getInstance(),mRouteToComponentResolve:{}};e.oNavigationControllerProxy=i;var k=new Promise(function(R){i.fnInitializationResolve=R;});e.oBusyHelper.setBusy(k);q.extend(o,g(e,i));q.extend(i,o);var v={};i.oRouter._oViews._getViewWithGlobalId=function(V){if(!v[V.viewName]){var R=i.oRouter.getRoute(V.viewName);var l;if(R&&R._oConfig){l=f(e,R._oConfig,i.mRouteToComponentResolve[V.viewName]);}else{l=sap.ui.view({viewName:V.viewName,type:V.type,height:"100%"});}v[V.viewName]=l;if(V.viewName==="root"){e.rootContainer=l;}}return v[V.viewName];};r.startupRouter(i);}var N=B.extend("sap.suite.ui.generic.template.lib.NavigationController",{metadata:{library:"sap.suite.ui.generic.template"},constructor:function(o){B.apply(this,arguments);t.testableStatic(j,"NavigationController")(this,o);}});N._sChanges="Changes";return N;});
