/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

// Provides control sap.rules.ui.
sap.ui.define(["jquery.sap.global"], function(jQuery) {
	"use strict";
		/**
		 * Constructor for a new sap.rules.ui.type.ExpressionAbs.
		 *
		 * @param {object} ExpressionLanguage
		 *
		 * @class
		 * Abstract class will be extend by all dedicated types (DecisionTableHeaderSetting, DecisionTableHeader etc.)
		 * @extends  sap.ui.model.CompositeType
		 *
		 * @author SAP SE
		 * @version 1.46.0
		 *
		 * @constructor
		 * @private
		 * @alias ssap.rules.ui.type.ExpressionAbs
		 */

	var ExpressionAbs = sap.ui.model.CompositeType.extend("sap.rules.ui.type.ExpressionAbs", {
		constructor: function(expressionLanguage) {
			this.bParseWithValues = true;
			this.expressionLanguage = (expressionLanguage instanceof Object)? expressionLanguage : sap.ui.getCore().byId(expressionLanguage);
		},
		validateValue: function() {
			return true;
		},
		setExpressionLanguage: function(expressionLanguage){
			this.expressionLanguage = (expressionLanguage instanceof Object)? expressionLanguage : sap.ui.getCore().byId(expressionLanguage);
		}
	});

	return ExpressionAbs;

}, /* bExport= */ true);