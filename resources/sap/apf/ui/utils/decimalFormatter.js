jQuery.sap.declare('sap.apf.ui.utils.decimalFormatter');(function(){"use strict";sap.apf.ui.utils.decimalFormatter=function(){this.oSemanticsFormatterMap=_();};sap.apf.ui.utils.decimalFormatter.prototype.constructor=sap.apf.ui.utils.decimalFormatter;function _(){var s=new Map();s.set("currency-code",a);s.set(undefined,b);return s;}function a(m,o){var c=sap.ui.core.format.NumberFormat.getCurrencyInstance();return c.format(o);}function b(m,o,p){var f=sap.ui.core.format.NumberFormat.getFloatInstance({style:'standard',minFractionDigits:p});return f.format(o);}sap.apf.ui.utils.decimalFormatter.prototype.getFormattedValue=function(m,o,p){var s=m["semantics"]!==undefined?m["semantics"]:undefined;return this.oSemanticsFormatterMap.get(s).call(self,m,o,p);}}());
