/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.core.persistence");jQuery.sap.require("sap.apf.core.constants");(function(){'use strict';sap.apf.core.Persistence=function(I){var l;this.createPath=function(n,C,f){var R;var S=a(f);e().then(function(l){R={data:{AnalysisPath:"",AnalysisPathName:n,LogicalSystem:l,ApplicationConfigurationURL:I.functions.getComponentName(),SerializedAnalysisPath:JSON.stringify(f),StructuredAnalysisPath:JSON.stringify(S)},method:"POST"};if(I.instances.coreApi.getStartParameterFacade().getAnalyticalConfigurationId()){R.data.AnalyticalConfiguration=I.instances.coreApi.getStartParameterFacade().getAnalyticalConfigurationId().configurationId;}s(R,h);},function(m){C({oResponse:undefined,status:"failed"},{},m);});function h(o,E,m){if(m){C({oResponse:o,status:"failed"},E,m);}else{I.instances.messageHandler.check(o&&o.data&&o.statusCode===201&&o.statusText==="Created","Persistence create Path - proper response");C({AnalysisPath:o.data.AnalysisPath,status:"successful"},E,m);}}};this.readPaths=function(C){var R={method:"GET"};s(R,f.bind(this));function f(o,E,m){if(!m&&o&&o.data&&o.data.results){for(var i in o.data.results){o.data.results[i].StructuredAnalysisPath=JSON.parse(o.data.results[i].StructuredAnalysisPath);}}else if(!m||o.statusCode!==200||o.statusText!=="OK"){m=I.instances.messageHandler.createMessageObject({code:'5211'});}if(m){C({oResponse:o,status:"failed"},E,m);}else{C({paths:o.data.results,status:"successful"},E,m);}}};this.deletePath=function(A,C){var R={method:"DELETE"};s(R,f.bind(this),A);function f(o,E,m){if((o.statusCode!==204||o.statusText!=="No Content")&&(!m)){m=I.instances.messageHandler.createMessageObject({code:5201});m.setPrevious(I.instances.messageHandler.createMessageObject({code:5200,aParameters:[o.statusCode,o.statusText]}));}if(m){C({oResponse:o,status:"failed"},E,m);}else{C({status:"successful"},E,m);}}};this.modifyPath=function(A,n,C,f){var S=a(f);e().then(function(l){var o={data:{AnalysisPathName:n,LogicalSystem:l,ApplicationConfigurationURL:I.functions.getComponentName(),SerializedAnalysisPath:JSON.stringify(f),StructuredAnalysisPath:JSON.stringify(S)},method:"PUT"};s(o,R.bind(this),A);},function(m){C({oResponse:undefined,status:"failed"},{},m);});function R(o,E,m){if((o.statusCode!==204||o.statusText!=="No Content")&&(!m)){m=I.instances.messageHandler.createMessageObject({code:5201});m.setPrevious(I.instances.messageHandler.createMessageObject({code:5200,aParameters:[o.statusCode,o.statusText]}));}if(m){C({oResponse:o,status:"failed"},E,m);}else{C({AnalysisPath:A,status:"successful"},E,m);}}};this.openPath=function(A,C){var R={method:"GET"};s(R,f,A);function f(o,E,m){var h;if(!m&&o&&o.statusCode===200&&o.data&&o.data.SerializedAnalysisPath){o.data.SerializedAnalysisPath=JSON.parse(o.data.SerializedAnalysisPath);}if(m){h=I.instances.messageHandler.createMessageObject({code:'5210'});h.setPrevious(m);I.instances.messageHandler.putMessage(h);}C({path:o.data,status:"successful"},E);}};function s(R,L,A){var S=function(D,o){b().done(function(m){L(o,m,undefined);});};var E=function(o){var m;if(o.messageObject&&o.messageObject.getCode&&o.messageObject.getCode()===5021){b().done(function(h){L(o,h,o.messageObject);});return;}var f=c(o.response.body);if(f!==undefined){m=I.instances.messageHandler.createMessageObject({code:f});}if(o.response.body.match("274")){m=I.instances.messageHandler.createMessageObject({code:'5207'});}if(o.response.statusCode===400){m=I.instances.messageHandler.createMessageObject({code:'5203'});}if(o.response.statusCode===403){m=I.instances.messageHandler.createMessageObject({code:'5206'});}if(o.response.statusCode===405){m=I.instances.messageHandler.createMessageObject({code:'5202'});}if(o.response.statusCode===404){m=I.instances.messageHandler.createMessageObject({code:'5208'});}if(!m&&o.response.statusCode===500){m=I.instances.messageHandler.createMessageObject({code:'5200',aParameters:[o.response.statusCode,o.response.statusText]});}if(!m){m=I.instances.messageHandler.createMessageObject({code:'5201'});}I.instances.messageHandler.putMessage(m);b().done(function(h){L(o,h,m);});};I.instances.coreApi.getPersistenceConfiguration().done(function(p){var u=p.path.service+"/"+p.path.entitySet;R.headers={"x-csrf-token":I.instances.coreApi.getXsrfToken(p.path.service)};switch(R.method){case"GET":if(!R.data&&A){R.requestUri=u+"('"+A+"')";I.instances.coreApi.odataRequest(R,S,E);}else if(!R.data&&!A){g().then(function(f){R.requestUri=u+f;I.instances.coreApi.odataRequest(R,S,E);},function(m){b().done(function(f){L({},f,m);});});}break;case"POST":if(R.data&&!A){R.requestUri=u;}I.instances.coreApi.odataRequest(R,S,E);break;case"DELETE":if(!R.data&&A){R.requestUri=u+"('"+A+"')";}I.instances.coreApi.odataRequest(R,S,E);break;case"PUT":if(R.data&&A){R.requestUri=u+"('"+A+"')";}I.instances.coreApi.odataRequest(R,S,E);break;default:I.instances.coreApi.odataRequest(R,S,E);break;}});}function g(){var f=jQuery.Deferred();e().then(function(l){var h="";if(I.instances.coreApi.getStartParameterFacade().getAnalyticalConfigurationId()){h="AnalyticalConfiguration%20eq%20'"+I.instances.coreApi.getStartParameterFacade().getAnalyticalConfigurationId().configurationId+"'%20and%20";}var u="?$select=AnalysisPath,AnalysisPathName,StructuredAnalysisPath,CreationUTCDateTime,LastChangeUTCDateTime&$filter=("+h+"LogicalSystem%20eq%20'"+l+"'%20and%20"+"ApplicationConfigurationURL%20eq%20'"+I.functions.getComponentName()+"')"+"&$orderby=LastChangeUTCDateTime%20desc";f.resolve(u);},function(m){f.fail(m);});return f.promise();}function c(E){var f=E.match("52[0-9]{2}");if(f){return f[0];}return undefined;}function a(S){var f=[];var h=S.path.steps;var j;for(var i in h){f.push({stepId:h[i].stepId,selectedRepresentationId:h[i].binding.selectedRepresentationId});}j={steps:f,indexOfActiveStep:S.path.indicesOfActiveSteps[0]};return j;}function b(){var f=jQuery.Deferred();I.instances.coreApi.getPersistenceConfiguration().done(function(h){I.instances.coreApi.getEntityTypeMetadata(h.path.service,h.path.entitySet).done(function(m){f.resolve(m);});});return f;}function d(C){var t=C&&C.getFilterTermsForProperty('SAPClient');if(t===undefined||t.length!==1){return undefined;}return t[0].getValue();}function r(f,h){I.instances.coreApi.getPersistenceConfiguration().done(function(p){var m=I.instances.messageHandler;var i=p.logicalSystem;if(!i){l=h;f.resolve(h);return f.promise();}var S=i.service;var E=i.entitySet||i.entityType;if(S===null){l=h;f.resolve(h);return f.promise();}if(E===undefined){E=sap.apf.core.constants.entitySets.logicalSystem;}I.instances.coreApi.getMetadata(S).done(function(j){var F=new sap.apf.core.utils.Filter(m,"SAPClient",'eq',h);var u=I.instances.coreApi.getUriGenerator().getAbsolutePath(S);u=u+I.instances.coreApi.getUriGenerator().buildUri(m,E,['LogicalSystem'],F,undefined,undefined,undefined,undefined,undefined,'Results',j);var R={requestUri:u,method:"GET",headers:{"x-csrf-token":I.instances.coreApi.getXsrfToken(S)}};var o=function(D){var n;if(D&&D.results&&D.results instanceof Array&&D.results.length===1&&D.results[0].LogicalSystem){l=D.results[0].LogicalSystem;f.resolve(l);}else{n=m.createMessageObject({code:"5026",aParameters:[h]});f.fail(n);}};var k=function(n){var q=m.createMessageObject({code:"5026",aParameters:[h]});if(n.messageObject!==undefined&&n.messageObject.type==="messageObject"){q.setPrevious(n.messageObject);}f.fail(q);};I.instances.coreApi.odataRequest(R,o,k);});});}function e(){var f=jQuery.Deferred();if(l){f.resolve(l);return f.promise();}var h=I.instances.coreApi.getStartParameterFacade().getSapClient();if(h){r(f,h);return f.promise();}I.instances.coreApi.getCumulativeFilter().done(function(C){h=d(C);if(!h){f.resolve('');}else{r(f,h);}});return f.promise();}};}());