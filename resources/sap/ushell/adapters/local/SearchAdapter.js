// @copyright@
sap.ui.define(['sap/ushell/renderers/fiori2/search/esh/api/release/sina'],function(s){"use strict";var S=function(o,p,a){this.isSearchAvailable=function(){var d=jQuery.Deferred();d.resolve(true);return d.promise();};this.getSina=function(){return window.sina.getSina({systemType:"ABAP",startWithSearch:"false",noSapClientFromUrl:true});};};return S;},true);
