/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","./library","sap/ui/support/supportRules/Main"],function(q,l,M){"use strict";var B={initSupportRules:function(s){if(s[0].toLowerCase()==="true"||s[0].toLowerCase()==="silent"){M.startPlugin();q.sap.log.logSupportInfo(true);}}};return B;});
