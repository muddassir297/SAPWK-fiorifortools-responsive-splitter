/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";return{serialize:function serializeRule(r){var a=function(k,v){if(typeof v==="function"){return v.toString();}else{return v;}};var b=JSON.stringify(r,a);return b;},deserialize:function(serializedRule,stringifyCheck){var rule=JSON.parse(serializedRule);if(!stringifyCheck&&rule.check!==undefined){eval("rule.check = "+rule.check);}return rule;}};},true);
