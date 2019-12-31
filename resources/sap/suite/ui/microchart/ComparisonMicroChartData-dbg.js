/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

// Provides control sap.suite.ui.microchart.ComparisonMicroChartData.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element'],
	function(jQuery, library, Element) {
	"use strict";

	/**
	 * Constructor for a new ComparisonMicroChartData.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Contains the values of the comparison chart.
	 * @extends sap.ui.core.Element
	 *
	 * @version 1.46.2
	 * @since 1.34
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.microchart.ComparisonMicroChartData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ComparisonMicroChartData = Element.extend("sap.suite.ui.microchart.ComparisonMicroChartData", /** @lends sap.suite.ui.microchart.ComparisonMicroChartData.prototype */ {
		metadata : {
			library: "sap.suite.ui.microchart",
			properties: {
				/**
				 * The value for comparison.
				 */
				value: {type: "float", group: "Misc", defaultValue: "0"},

				/**
				 * The semantic color of the value.
				 */
				color: {type: "sap.m.ValueColor", group: "Misc", defaultValue: "Neutral"},

				/**
				 * The comparison bar title.
				 */
				title: {type: "string", group: "Misc", defaultValue: ""},

				/**
				 * If this property is set then it will be displayed instead of value.
				 */
				displayValue: {type: "string", group: "Misc", defaultValue: ""}
			},
			events: {
				/**
				 * The event is fired when the user chooses the comparison chart bar.
				 */
				press : {}
			}
		}
	});

	ComparisonMicroChartData.prototype.setValue = function(fValue, bSuppressInvalidate) {
		this._isValueSet = this._fnIsNumber(fValue);
		return this.setProperty("value", this._isValueSet ? fValue : NaN, bSuppressInvalidate);
	};

	ComparisonMicroChartData.prototype._fnIsNumber = function(n) {
		return typeof n == 'number' && !isNaN(n) && isFinite(n);
	};

	ComparisonMicroChartData.prototype.clone = function(sIdSuffix, aLocalIds, oOptions) {
		var oClone = sap.ui.core.Control.prototype.clone.apply(this, arguments);
		oClone._isValueSet = this._isValueSet;
		return oClone;
	};

	ComparisonMicroChartData.prototype.attachEvent = function(sEventId, oData, fnFunction, oListener) {
		sap.ui.core.Control.prototype.attachEvent.call(this, sEventId, oData, fnFunction, oListener);
		if (this.getParent()) {
			this.getParent().setBarPressable(this.getParent().getData().indexOf(this), true);
		}
			return this;
	};

	ComparisonMicroChartData.prototype.detachEvent = function(sEventId, fnFunction, oListener) {
		sap.ui.core.Control.prototype.detachEvent.call(this, sEventId, fnFunction, oListener);
		if (this.getParent()) {
			this.getParent().setBarPressable(this.getParent().getData().indexOf(this), false);
		}
		return this;
	};

	return ComparisonMicroChartData;

});
