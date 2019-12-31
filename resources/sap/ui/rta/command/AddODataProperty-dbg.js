/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/rta/command/FlexCommand', "sap/ui/fl/Utils", "sap/ui/fl/changeHandler/BaseTreeModifier"], function(jQuery, FlexCommand, FlexUtils, BaseTreeModifier) {
	"use strict";

	/**
	 * Add new OData property to a control
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.46.2
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.command.AddODataProperty
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var AddODataProperty = FlexCommand.extend("sap.ui.rta.command.AddODataProperty", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				index : {
					type : "int"
				},
				newControlId : {
					type : "string"
				},
				label : {
					type : "string"
				},
				bindingString : {
					type : "string"
				}
			}
		}
	});

	AddODataProperty.prototype._getChangeSpecificData = function() {
		// general format
		return {
			changeType : this.getChangeType(),
			index : this.getIndex(),
			newControlId : this.getNewControlId(),
			label : this.getLabel(),
			bindingPath : this.getBindingString()
		};
	};

	return AddODataProperty;

}, /* bExport= */true);
