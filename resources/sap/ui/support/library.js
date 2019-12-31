/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/library"],function(l){"use strict";sap.ui.getCore().initLibrary({name:"sap.ui.support",dependencies:["sap.ui.core","sap.ui.fl","sap.m","sap.ui.layout","sap.ui.codeeditor"],types:["sap.ui.support.Severity"],interfaces:[],controls:[],elements:[],noLibraryCSS:false,version:"1.46.2"});sap.ui.support.Severity={Hint:"Hint",Warning:"Warning",Error:"Error"};sap.ui.support.Audiences={Control:"Control",Internal:"Internal",Application:"Application"};sap.ui.support.Categories={Accessibility:"Accessibility",Performance:"Performance",Memory:"Memory",Bindings:"Bindings",Consistency:"Consistency",Functionality:"Functionality",DataModel:"DataModel",Other:"Other"};return sap.ui.support;});
