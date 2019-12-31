/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/comp/odata/MetadataAnalyser','sap/ui/comp/smartfield/AnnotationHelper','sap/ui/core/StashedControlSupport','sap/ui/dt/ElementUtil','sap/ui/rta/Utils'],function(M,A,S,E,R){"use strict";var a=new A();function _(p){if(p&&p.type){if(p.type.toLowerCase().indexOf("edm")!==0){return true;}}return false;}function b(O,m){return O.reduce(function(j,p){var P=p;if(_(p)){P=m.getFieldsByComplexTypeName(p.type).map(function(C){C.bindingPath=p.name+"/"+C.name;C.entityName=p.entityName;C.referencedComplexPropertyName=p.fieldLabel?p.fieldLabel:p.name;return C;});}else{P.bindingPath=p.name;}return j.concat(P);},[]);}function c(O,j){return O.filter(function(p){return p.visible;}).filter(function(p){var F=a.getFieldControlPath(p);if(F){var m=j.getBindingContext().getProperty(F);return m!==0;}return true;});}function d(j){var m=j.getModel();var r=[];if(m){var s=m.getMetadata().getName();if(s==="sap.ui.model.odata.ODataModel"||s==="sap.ui.model.odata.v2.ODataModel"){r=m.getMetaModel().loaded().then(function(){var n=new M(m);var p=R.getBoundEntityType(j,m);var O=n.getFieldsByEntityTypeName(p)||[];O=b(O,n);O=c(O,j);return O;});}}return r;}function e(O){return{selected:false,label:O.renamedLabel?O.renamedLabel:O.fieldLabel,referencedComplexPropertyName:O.referencedComplexPropertyName?O.referencedComplexPropertyName:"",duplicateComplexName:O.duplicateComplexName?O.duplicateComplexName:false,tooltip:O.quickInfo||O.fieldLabel,type:"odata",entityType:O.entityName,name:O.name,bindingPath:O.bindingPath,originalLabel:O.renamedLabel&&O.renamedLabel!==O.fieldLabel?O.fieldLabel:""};}function f(D){var j=D.element;var m=D.action;return{selected:false,label:R.getLabelForElement(j,m.getLabel),tooltip:R.getLabelForElement(j,m.getLabel),referencedComplexPropertyName:j.referencedComplexPropertyName?j.referencedComplexPropertyName:"",duplicateComplexName:j.duplicateComplexName?j.duplicateComplexName:false,bindingPaths:j.bindingPaths,originalLabel:j.renamedLabel&&j.renamedLabel!==j.labelFromOData?j.labelFromOData:"",type:"invisible",element:j};}function g(j){var B=[];h(j).forEach(function(F){if(F.mBindingInfos){for(var I in F.mBindingInfos){var p=R.getPathFromBindingInfo(I,F.mBindingInfos);if(p){B.push(p);}}}});return B;}function h(C){var B=[];if(jQuery.isEmptyObject(C.mBindingInfos)){for(var s in C.getMetadata().getAllAggregations()){B=B.concat(i(s,C));}}else{B.push(C);}return B;}function i(s,j){var B=[];E.getAggregation(j,s).forEach(function(C){if(jQuery.isEmptyObject(C.mBindingInfos)){if(C.getMetadata){for(var m in C.getMetadata().getAllAggregations()){B=B.concat(i(m,C));}}}else{B.push(C);}});return B;}function k(j,r){if(r){return E.findAllSiblingsInContainer(j,r);}else{return[j];}}function l(O){O.forEach(function(m,n,O){if(m["duplicateComplexName"]!==true){for(var j=n+1;j<O.length-1;j++){if(m.fieldLabel===O[j].fieldLabel){m["duplicateComplexName"]=true;O[j]["duplicateComplexName"]=true;}}}});return O;}var o={enhanceInvisibleElements:function(p,r){return Promise.resolve().then(function(){return d(p);}).then(function(O){O=l(O);var I=r.elements||[];return I.map(function(j){var t=j.getMetadata().getName();var T=r.types[t];var m=T.action;j.bindingPaths=g(j);j.fieldLabel=R.getLabelForElement(j,m.getLabel);O.some(function(u){if(u.fieldLabel===j.fieldLabel){j.duplicateComplexName=true;return true;}});O.some(function(u){if(j.bindingPaths&&j.bindingPaths.indexOf(u.bindingPath)>-1){j.labelFromOData=u.fieldLabel;if(j.fieldLabel!==j.labelFromOData){j.renamedLabel=true;}if(u.referencedComplexPropertyName){j.referencedComplexPropertyName=u.referencedComplexPropertyName;}return true;}});return{element:j,action:m};});}).then(function(j){return j.map(f);});},getUnboundODataProperties:function(j,m){return Promise.resolve().then(function(){return d(j);}).then(function(O){var r=k(j,m.relevantContainer);var n=r.reduce(function(P,C){return P.concat(i.bind(null,m.action.aggregation)(C));},[]);var p={};var v=n.reduce(function(P,C){if(C.mBindingInfos){for(var I in C.mBindingInfos){var s=R.getPathFromBindingInfo(I,C.mBindingInfos);if(s){P[s]=true;p[s]=R.getLabelForElement(C,m.getLabel);}}}return P;},{});var F=m.filter?m.filter:function(){return true;};O=O.reduce(function(O,D){D["renamedLabel"]=p[D.bindingPath];if(!v[D.bindingPath]&&F(j,D)){return O.concat(D);}else{return O;}},[]);O=l(O);return O;}).then(function(u){return u.map(e);});}};return o;});
