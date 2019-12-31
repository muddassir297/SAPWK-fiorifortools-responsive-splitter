/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/ui/base/Object"],function(q,B){"use strict";var _=[];var a=[];var I={addIssue:function(i){_.push(i);},walkIssues:function(c){_.forEach(c);},clearIssues:function(){if(!_.length){return;}a.push({issues:_.slice()});_=[];},getHistory:function(){this.clearIssues();return a.slice();},createCheckFunctionProxy:function(r){return new C(r);}};var C=function(r){this.oRule=r;};C.prototype.addIssue=function(i){i.rule=this.oRule;if(!sap.ui.support.Severity[i.severity]){throw"The issue from rule "+this.oRule.title+" does not have proper severity defined. Allowed values can be found"+"in sap.ui.support.Severity";}if(!i.context||!i.context.id){throw"The issue from rule '"+this.oRule.title+"' should provide a context id.";}if(!i.details){throw"The issue from rule '"+this.oRule.title+"' should provide details for the generated issue.";}I.addIssue(i);};return I;},true);
