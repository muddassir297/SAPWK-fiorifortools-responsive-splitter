jQuery.sap.declare('sap.apf.ui.utils.dateTimeFormatter');jQuery.sap.require('sap.ui.core.format.DateFormat');jQuery.sap.require("sap.ui.core.date.Gregorian");(function(){"use strict";sap.apf.ui.utils.dateTimeFormatter=function(){this.oDisplayFormatterMap=_();};sap.apf.ui.utils.dateTimeFormatter.prototype.constructor=sap.apf.ui.utils.dateTimeFormatter;function _(){var d=new Map();d.set("Date",a);d.set(undefined,b);return d;}function a(o){var d=sap.ui.core.format.DateFormat.getDateInstance({pattern:"MM/dd/yy"});var c=d.format(o,false);return c;}function b(o){return o;}sap.apf.ui.utils.dateTimeFormatter.prototype.getFormattedValue=function(m,o){var d=m["sap:display-format"]!==undefined?m["sap:display-format"]:undefined;var c=new Date(o);if(c.toLocaleString()==="Invalid Date")return"-";var f=this.oDisplayFormatterMap.get(d)!==undefined?this.oDisplayFormatterMap.get(d).call(this,c):c;return f;}}());
