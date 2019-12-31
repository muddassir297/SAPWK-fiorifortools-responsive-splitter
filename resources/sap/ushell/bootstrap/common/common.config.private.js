"use strict";
function readConfigItemsFromMeta(c,$,j){var s="meta[name^='"+c+"']:not([name=''])";var m=$.querySelectorAll(s);var C=[];Array.prototype.slice.call(m).forEach(function(M){try{C.push(j.parse(M.content));}catch(e){}});return C;}
function mergeConfig(m,c,C,j){var a;if(!c){return;}a=C?j.parse(j.stringify(c)):c;Object.keys(a).forEach(function(k){if(typeof m[k]==="object"&&typeof a[k]==="object"){mergeConfig(m[k],a[k],false);return;}m[k]=a[k];});}
function createGlobalConfigs(m,x,s,$,j){var c="sap-ushell-config";$[c]=$[c]||{};m.forEach(function(C){mergeConfig($[c],C,true,j);});s&&s.forEach(function(S){mergeConfig($[c],S,true,j);});$["sap-ui-config"]={"xx-bootTask":x};}
module.exports.readConfigItemsFromMeta=readConfigItemsFromMeta;module.exports.createGlobalConfigs=createGlobalConfigs;module.exports.mergeConfig=mergeConfig;
