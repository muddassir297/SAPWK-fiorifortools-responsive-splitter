jQuery.sap.declare('sap.apf.ui.utils.timeFormatter');
jQuery.sap.require("sap.ui.model.odata.type.Time");
(function() {
	"use strict";
	sap.apf.ui.utils.timeFormatter = function() {
	};
	sap.apf.ui.utils.timeFormatter.prototype.constructor = sap.apf.ui.utils.timeFormatter;
	sap.apf.ui.utils.timeFormatter.prototype.getFormattedValue = function(oMetadata, originalFieldValue) {
		var formattedDateValue = originalFieldValue;
		if (originalFieldValue.__edmType != undefined && originalFieldValue.__edmType === "Edm.Time") {
			var timeFormatter = new sap.ui.model.odata.type.Time();
			formattedDateValue = timeFormatter.formatValue(originalFieldValue, "string");
		}
		return formattedDateValue;
	}
}());
