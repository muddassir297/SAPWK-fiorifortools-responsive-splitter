/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.modeler.core.instance");(function(){'use strict';jQuery.sap.require("sap.ui.thirdparty.datajs");jQuery.sap.require("sap.apf.utils.hashtable");jQuery.sap.require('sap.apf.core.constants');jQuery.sap.require('sap.apf.core.messageHandler');jQuery.sap.require('sap.apf.core.sessionHandler');jQuery.sap.require('sap.apf.core.representationTypes');jQuery.sap.require("sap.apf.core.entityTypeMetadata");jQuery.sap.require("sap.apf.core.configurationFactory");jQuery.sap.require("sap.apf.core.utils.uriGenerator");jQuery.sap.require("sap.apf.core.metadata");jQuery.sap.require("sap.apf.core.metadataFacade");jQuery.sap.require("sap.apf.core.metadataProperty");jQuery.sap.require('sap.apf.core.messageDefinition');jQuery.sap.require("sap.apf.core.metadataFactory");jQuery.sap.require('sap.apf.core.odataProxy');jQuery.sap.require('sap.apf.core.ajax');jQuery.sap.require('sap.apf.core.odataRequest');jQuery.sap.require('sap.apf.modeler.core.messageDefinition');jQuery.sap.require('sap.apf.modeler.core.textHandler');jQuery.sap.require('sap.apf.modeler.core.textPool');jQuery.sap.require('sap.apf.modeler.core.applicationHandler');jQuery.sap.require('sap.apf.modeler.core.configurationHandler');jQuery.sap.require('sap.apf.modeler.core.configurationEditor');jQuery.sap.require("sap.apf.modeler.core.step");jQuery.sap.require("sap.apf.modeler.core.hierarchicalStep");jQuery.sap.require("sap.apf.modeler.core.smartFilterBar");jQuery.sap.require("sap.apf.modeler.core.facetFilter");jQuery.sap.require("sap.apf.modeler.core.navigationTarget");jQuery.sap.require("sap.apf.modeler.core.elementContainer");jQuery.sap.require("sap.apf.modeler.core.representation");jQuery.sap.require("sap.apf.modeler.core.configurationObjects");jQuery.sap.require("sap.apf.modeler.core.elementContainer");jQuery.sap.require("sap.apf.utils.parseTextPropertyFile");jQuery.sap.require("sap.apf.modeler.core.lazyLoader");jQuery.sap.require("sap.apf.modeler.core.registryWrapper");jQuery.sap.require("sap.apf.utils.startParameter");jQuery.sap.require("sap.apf.core.utils.fileExists");jQuery.sap.require("sap.apf.core.utils.annotationHandler");sap.apf.modeler.core.Instance=function(p,a){var t=this;var A,C,b,c,d,S,H,e,F,N,R,E,f,g,M,h,j,k,l,L,m,n,o,q,s,r,u,v,w,x,y,O,z,B,D,G,I,J;var K=[];var P;var Q;A=(a&&a.constructors&&a.constructors.ApplicationHandler)||sap.apf.modeler.core.ApplicationHandler;C=(a&&a.constructors&&a.constructors.ConfigurationHandler)||sap.apf.modeler.core.ConfigurationHandler;b=(a&&a.constructors&&a.constructors.ConfigurationEditor)||sap.apf.modeler.core.ConfigurationEditor;c=(a&&a.constructors&&a.constructors.ConfigurationObjects)||sap.apf.modeler.core.ConfigurationObjects;d=(a&&a.constructors&&a.constructors.ConfigurationFactory)||sap.apf.core.ConfigurationFactory;E=(a&&a.constructors&&a.constructors.ElementContainer)||sap.apf.modeler.core.ElementContainer;S=(a&&a.constructors&&a.constructors.Step)||sap.apf.modeler.core.Step;H=(a&&a.constructors&&a.constructors.HierarchicalStep)||sap.apf.modeler.core.HierarchicalStep;e=(a&&a.constructors&&a.constructors.SmartFilterBar)||sap.apf.modeler.core.SmartFilterBar;F=(a&&a.constructors&&a.constructors.FacetFilter)||sap.apf.modeler.core.FacetFilter;N=(a&&a.constructors&&a.constructors.NavigationTarget)||sap.apf.modeler.core.NavigationTarget;R=(a&&a.constructors&&a.constructors.Representation)||sap.apf.modeler.core.Representation;f=(a&&a.constructors&&a.constructors.Hashtable)||sap.apf.utils.Hashtable;g=(a&&a.constructors&&a.constructors.RegistryProbe)||sap.apf.modeler.core.RegistryWrapper;L=(a&&a.constructors&&a.constructors.LazyLoader)||sap.apf.modeler.core.LazyLoader;M=(a&&a.constructors&&a.constructors.Metadata)||sap.apf.core.Metadata;h=(a&&a.constructors&&a.constructors.EntityTypeMetadata)||sap.apf.core.EntityTypeMetadata;j=(a&&a.constructors&&a.constructors.MetadataFacade)||sap.apf.core.MetadataFacade;k=(a&&a.constructors&&a.constructors.MetadataProperty)||sap.apf.core.MetadataProperty;l=(a&&a.constructors&&a.constructors.MetadataFactory)||sap.apf.core.MetadataFactory;m=(a&&a.constructors&&a.constructors.StartParameter)||sap.apf.utils.StartParameter;n=(a&&a.constructors&&a.constructors.AnnotationHandler)||sap.apf.core.utils.AnnotationHandler;Q=(a&&a.instances&&a.instances.datajs)||OData;if(a&&a.constructors&&a.constructors.TextHandler){o=new a.constructors.TextHandler();}else{o=new sap.apf.modeler.core.TextHandler();}if(a&&a.constructors&&a.constructors.MessageHandler){q=new a.constructors.MessageHandler(true);}else{q=new sap.apf.core.MessageHandler(true);}q.activateOnErrorHandling(true);q.loadConfig(sap.apf.core.messageDefinition);q.loadConfig(sap.apf.modeler.core.messageDefinition);q.setTextResourceHandler(o);if(a&&a.instances&&a.instances.component){J={};J.baseManifest=sap.apf.modeler.Component.prototype.getMetadata().getManifest();J.manifest=jQuery.extend({},true,a.instances.component.getMetadata().getManifest());}r=new m(a&&a.instances&&a.instances.component,J);this.getStartParameterFacade=function(){return r;};w={instances:{messageHandler:q,coreApi:this}};if(a&&a.constructors&&a.constructors.PersistenceProxy){u=new a.constructors.PersistenceProxy(p,w);}else{u=new sap.apf.core.OdataProxy(p,w);}if(a&&a.constructors&&a.constructors.SessionHandler){s=new a.constructors.SessionHandler(w);}else{s=new sap.apf.core.SessionHandler(w);}this.ajax=function(i){var X=jQuery.extend(true,{},i);if(a&&a.functions&&a.functions.ajax){X.functions=X.functions||{};X.functions.ajax=a.functions.ajax;}X.instances={messageHandler:q};return sap.apf.core.ajax(X);};var T={functions:{getComponentNameFromManifest:sap.apf.utils.getComponentNameFromManifest,getODataPath:sap.apf.core.utils.uriGenerator.getODataPath,getBaseURLOfComponent:sap.apf.core.utils.uriGenerator.getBaseURLOfComponent,addRelativeToAbsoluteURL:sap.apf.core.utils.uriGenerator.addRelativeToAbsoluteURL},instances:{fileExists:new sap.apf.core.utils.FileExists({functions:{ajax:this.ajax}})}};var U=new n(T);x={constructors:{EntityTypeMetadata:h,Hashtable:f,Metadata:M,MetadataFacade:j,MetadataProperty:k},functions:{getServiceDocuments:function(){return[p.serviceRoot];}},instances:{messageHandler:q,coreApi:t,annotationHandler:U},deactivateFatalError:true};v=new sap.apf.core.MetadataFactory(x);y={constructors:{Hashtable:f},instances:{messageHandler:q}};this.getCatalogServiceUri=a&&a.functions&&a.functions.getCatalogServiceUri;O=(a&&a.functions&&a.functions.odataRequestWrapper)||sap.apf.core.odataRequestWrapper;this.odataRequest=function(i,X,Y,Z){var $={instances:{datajs:Q}};O($,i,X,Y,Z);};this.checkForTimeout=function(i){var X=sap.apf.core.utils.checkForTimeout(i);if(X){q.putMessage(X);}return X;};this.getEntityTypeMetadataAsPromise=function(i,X){return v.getEntityTypeMetadata(i,X);};this.getEntityTypeMetadata=this.getEntityTypeMetadataAsPromise;this.getXsrfToken=function(i){return s.getXsrfToken(i);};this.getUriGenerator=function(){return sap.apf.core.utils.uriGenerator;};this.getText=function(i,X){return o.getText(i,X);};this.putMessage=function(i){return q.putMessage(i);};this.check=function(i,X,Y){return q.check(i,X,Y);};this.createMessageObject=function(i){return q.createMessageObject(i);};this.setCallbackForMessageHandling=function(i){q.setMessageCallback(i);};this.importConfigurationFromLrep=function(X,Y,Z,$){var _;u.readAllConfigurationsFromVendorLayer().then(function(g1){var h1=X+'.'+Y;var i;for(i=0;i<g1.length;i++){if(g1[i].value===h1){_=g1[i].applicationText;break;}}t.getApplicationHandler(a1);});function a1(i,g1){if(g1){$(undefined,undefined,g1);return;}var h1=false;var i1=i.getApplication(X);if(!i1){h1=true;}var j1={ApplicationName:_};i.setAndSave(j1,b1,X,h1);}function b1(i,g1,h1){if(h1){$(Y,undefined,h1);return;}c1();}function c1(){var i=new sap.apf.core.utils.Filter(q,'Language','eq',sap.apf.core.constants.developmentLanguage);var g1=new sap.apf.core.utils.Filter(q,'Application','eq',X);g1.addAnd(i);u.readCollection("texts",d1,undefined,undefined,g1,{layer:"VENDOR"});}function d1(i,g1,h1){if(h1){$(Y,undefined,h1);return;}V(i,X,e1);}function e1(i){if(i){$(Y,undefined,i);return;}u.readEntity("configuration",f1,[{value:Y}],undefined,X,{layer:"VENDOR"});}function f1(i,g1,h1){if(h1){$(undefined,g1,h1);return;}var i1=JSON.parse(i.SerializedAnalyticalConfiguration);W(i1,Z,$);}};function V(i,X,Y){t.getApplicationHandler($);function Z(_,a1,b1){var c1;var d1;if(b1){Y(b1);}else{c1={instances:{messageHandler:q,persistenceProxy:u},constructors:{Hashtable:f}};d1=new sap.apf.modeler.core.TextPool(c1,X,_);d1.addTextsAndSave(i,Y,X);}}function $(_,a1){if(a1){Y(a1);return;}var b1;var c1=_.getApplication(X);if(!c1){b1=q.createMessageObject({code:11021});Y(b1);return;}if(D&&D.getId()===X){D.getInstance().getTextPool().addTextsAndSave(i,Y,X);}else{var d1=new sap.apf.core.utils.Filter(q,'Application','eq',X);var e1=new sap.apf.core.utils.Filter(q,'Language','eq',sap.apf.core.constants.developmentLanguage);e1.addAnd(d1);u.readCollection("texts",Z,undefined,undefined,e1);}}}this.importTexts=function(X,Y){var Z;var $;var i;var _=sap.apf.utils.parseTextPropertyFile(X,{instances:{messageHandler:q}});if(_.Messages.length>0){Z=q.createMessageObject({code:11020});$=_.Messages.length;for(i=0;i<$-1;i++){_.Messages[i+1].setPrevious(_.Messages[i]);}Z.setPrevious(_.Messages[$-1]);Y(Z);}else{V(_.TextElements,_.Application,Y);}};function W(i,X,Y){var Z=i.configHeader;t.getApplicationHandler($);function $(c1,d1){if(d1){Y(undefined,undefined,d1);return;}var e1=false;var f1=c1.getList();f1.forEach(function(h1){if(h1.Application===Z.Application){e1=true;}});if(e1){t.getConfigurationHandler(Z.Application,a1);}else{var g1={ApplicationName:Z.ApplicationName,SemanticObject:Z.SemanticObject};c1.setAndSave(g1,_,Z.Application,true);}}function _(c1,d1,e1){if(e1){Y(undefined,undefined,e1);return;}t.getConfigurationHandler(Z.Application,a1);}function a1(c1,d1){if(d1){Y(undefined,undefined,d1);return;}var e1=jQuery.extend({},i,true);delete e1.configHeader;var f1=false;var g1=c1.getList();g1.forEach(function(k1){if(k1.AnalyticalConfiguration===Z.AnalyticalConfiguration){f1=true;}});if(f1){X(i1,j1,Z.AnalyticalConfigurationName);}else{c1.setConfiguration({AnalyticalConfigurationName:Z.AnalyticalConfigurationName},Z.AnalyticalConfiguration);var h1={id:Z.AnalyticalConfiguration,creationDate:Z.CreationUTCDateTime,lastChangeDate:Z.LastChangeUTCDateTime,content:e1};c1.loadConfiguration(h1,b1);}function i1(){c1.setConfiguration({AnalyticalConfigurationName:Z.AnalyticalConfigurationName},Z.AnalyticalConfiguration);var h1={updateExisting:true,id:Z.AnalyticalConfiguration,creationDate:Z.CreationUTCDateTime,lastChangeDate:Z.LastChangeUTCDateTime,content:e1};c1.loadConfiguration(h1,b1);}function j1(k1){if(k1&&k1!==""){Z.AnalyticalConfigurationName=k1;}var l1=c1.setConfiguration({AnalyticalConfigurationName:Z.AnalyticalConfigurationName});var m1={id:l1,content:e1};c1.loadConfiguration(m1,b1);}}function b1(c1,d1){if(d1){Y(undefined,undefined,d1);return;}c1.save(Y);}}this.importConfiguration=function(i,X,Y){var Z=JSON.parse(i);if(!$(Z,Y)){return;}W(Z,X,Y);function $(Z,Y){var _=[],a1=true,b1;if(!sap.apf.utils.isValidGuid(Z.configHeader.Application)){_.push(q.createMessageObject({code:11037,aParameters:[Z.configHeader.Application]}));a1=false;}if(!sap.apf.utils.isValidGuid(Z.configHeader.AnalyticalConfiguration)){_.push(q.createMessageObject({code:11038,aParameters:[Z.configHeader.AnalyticalConfiguration]}));a1=false;}b1=sap.apf.modeler.core.ConfigurationObjects.getTextKeysFromConfiguration(Z);b1.forEach(function(c1){var d1=new f(q);if(!d1.hasItem(c1)){d1.setItem(c1,c1);if(!sap.apf.utils.isValidGuid(c1)){_.push(q.createMessageObject({code:11039,aParameters:[c1]}));a1=false;}}});if(a1){return a1;}_.forEach(function(c1,d1,_){if(d1){c1.setPrevious(_[d1-1]);}});Y(i,undefined,_[_.length-1]);return a1;}};this.getApplicationHandler=function(i){if(!B){var X=(a&&a.functions&&a.functions.loadApplicationHandler)||Y;B=new L(y,X);}B.asyncGetInstance("ApplicationHandlerId",i);function Y(Z,$){new A({instances:{messageHandler:q,persistenceProxy:u},constructors:{Hashtable:f},functions:{resetConfigurationHandler:a1}},_);function _(b1,c1){$(Z,b1,c1);}function a1(b1){if(D&&D.getId()===b1){D.getInstance().removeAllConfigurations();D.reset();}}}};this.getConfigurationHandler=function(i,X){if(!D){z=(a&&a.functions&&a.functions.loadConfigurationHandler)||Y;D=new L(y,z);}D.asyncGetInstance(i,X);function Y(i,Z,$){var _=new sap.apf.core.utils.Filter(q,'Application','eq',i);var a1=new sap.apf.core.utils.Filter(q,'Language','eq',sap.apf.core.constants.developmentLanguage);a1.addAnd(_);var b1=[];var c1=["AnalyticalConfiguration","AnalyticalConfigurationName","Application","CreatedByUser","CreationUTCDateTime","LastChangeUTCDateTime","LastChangedByUser"];b1.push({entitySetName:"configuration",filter:_,selectList:c1});b1.push({entitySetName:'texts',filter:a1});u.readCollectionsInBatch(b1,d1);function d1(e1,f1){var g1,h1;var i1;var j1;var k1=$;if(f1){Z(i,undefined,f1);}else{i1=e1[0];j1=e1[1];h1={instances:{messageHandler:q,persistenceProxy:u},constructors:{Hashtable:f}};g1=new sap.apf.modeler.core.TextPool(h1,i,j1);if(!k1){k1=new C({instances:{messageHandler:q,persistenceProxy:u,coreApi:t,metadataFactory:v},constructors:{ConfigurationEditor:b,ConfigurationFactory:d,ConfigurationObjects:c,ElementContainer:E,EntityTypeMetadata:h,SmartFilterBar:e,FacetFilter:F,NavigationTarget:N,Hashtable:f,Representation:R,RegistryProbe:g,Step:S,HierarchicalStep:H,LazyLoader:L},functions:{getApplication:B.getInstance().getApplication}});}k1.setApplicationIdAndContext(i,i1,g1);Z(i,k1,f1);}}}};this.getUnusedTextKeys=function(i,X){var Y={instances:{messageHandler:q,persistenceProxy:u},constructors:{Hashtable:f}};var Z=new c(Y);var $=null,_=null,a1=null;Z.getTextKeysFromAllConfigurations(i,function(c1,d1){if(_){return;}$=c1;_=d1;if(d1||a1){b1();}});this.getConfigurationHandler(i,function(c1,d1){if(_){return;}a1=c1;_=d1;if(d1||$){b1();}});function b1(){var c1=[];if(_){X(undefined,_);return;}a1.getTextPool().getTextKeys().forEach(function(d1){if(!$.hasItem(d1)){c1.push(d1);}});X(c1,undefined);}};this.resetConfigurationHandler=function(){if(D){D.reset();}};this.getRepresentationTypes=function(){var i=sap.apf.core.representationTypes();var X=[];jQuery.extend(true,X,i);return X;};this.getAllAvailableSemanticObjects=function(i){if(I){i(I,P);return;}if(P){i([],P);return;}K.push(i);if(K.length===1){var X={requestUri:"/sap/opu/odata/UI2/INTEROP/SemanticObjects?$format=json&$select=id,text",method:"GET"};t.odataRequest(X,Y,Z);}function Y($,_){I=$.results;K.forEach(function(a1){a1($.results,undefined);});}function Z($){var _;if($&&$.messageObject){_=$.messageObject;}else{_=q.createMessageObject({code:"11041"});}P=_;K.forEach(function(a1){a1([],_);});}};this.getSemanticActions=function(X){var Y;var Z=jQuery.Deferred();if(!G){G=new f(q);}Y=G.getItem(X);if(Y){Z.resolve(Y);return Z.promise();}t.getAllAvailableSemanticObjects($);return Z.promise();function $(_,a1){if(a1){Z.reject(a1);return;}var b1=sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("CrossApplicationNavigation");var c1;var i;if(!b1){Z.reject(q.createMessageObject({code:"5038"}));return;}for(i=0;i<_.length;i++){if(_[i].id===X){c1=_[i];break;}}b1.getLinks({semanticObject:X,ignoreFormFactor:true,ui5Component:a.instances.component}).done(function(d1){var e1=[];d1.forEach(function(f1){var g1=f1.intent.split("-");var h1=g1[1].split("?");h1=h1[0].split("~");e1.push({id:h1[0],text:f1.text});});G.setItem(X,{semanticObject:c1,semanticActions:e1});Z.resolve({semanticObject:c1,semanticActions:e1});}).fail(function(){Z.reject(q.createMessageObject({code:"11042"}));});}};this.navigateToGenericRuntime=function(i,X,Y){var Z;if(a&&a.exits&&a.exits.getRuntimeUrl&&jQuery.isFunction(a.exits.getRuntimeUrl)){Z=a.exits.getRuntimeUrl(i,X);}else{var $=sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("CrossApplicationNavigation");var _={};if(t.getStartParameterFacade().isLrepActive()){_['sap-apf-configuration-id']=i+'.'+X;}else{_['sap-apf-configuration-id']=X;}var a1=$.hrefForExternal({target:a.functions.getNavigationTargetForGenericRuntime(),params:_});var b1=jQuery(location).attr('href');var c1=b1.split('#')[0];Z=c1+a1;}Y(Z);};this.readAllConfigurationsFromVendorLayer=function(){return u.readAllConfigurationsFromVendorLayer();};if(a&&a.probe&&typeof a.probe==='function'){a.probe({constructors:{ApplicationHandler:A,ConfigurationHandler:C,ConfigurationEditor:b,ConfigurationObjects:c,ConfigurationFactory:d,MetadataFactory:l,Metadata:M,EntityTypeMetadata:h,MetadataFacade:j,MetadataProperty:k,Step:S,HierarchicalStep:H,SmartFilterBar:e,FacetFilter:F,NavigationTarget:N,Representation:R,ElementContainer:E,Hashtable:f,LazyLoader:L,AnnotationHandler:n,RegistryProbe:g},textHandler:o,messageHandler:q,sessionHandler:s,persistenceProxy:u,metadataFactory:v,injectForFollowUp:w,injectMetadataFactory:x,fnOdataRequestWrapper:O,ajax:this.ajax,odataRequestWrapper:O,annotationHandler:U});}};}());
