sap.ui.define(["sap/suite/ui/microchart/InteractiveLineChart",
	"sap/suite/ui/microchart/InteractiveLineChartPoint"],
	function(InteractiveLineChart, InteractiveLineChartPoint) {
	"use strict";

	/* all visual filters should extend this class */
	var FilterItemMicroLine = InteractiveLineChart.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.FilterItemMicroLine", {
		metadata: {
			properties: {
				entitySet: { type: "string", group: "Misc", defaultValue: null },
				dimensionField: { type: "string", group: "Misc", defaultValue: null },
				dimensionFieldIsDateTime: { type: "boolean", group: "Misc", defaultValue: false },
				dimensionFieldDisplay: { type: "string", group: "Misc", defaultValue: null },
				dimensionFilter: { type: "string[]", group: "Misc", defaultValue: null },
				dimensionFilterExternal: { type: "sap.ui.model.Filter", group: "Misc", defaultValue: null },
				measureField: { type: "string", group: "Misc", defaultValue: null },
				measureSortDescending: { type: "boolean", group: "Misc", defaultValue: false },
				unitField: { type: "string", group: "Misc", defaultValue: null },
				width: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue : null},
				height: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue : null},
				labelWidthPercent: { type: "float", group: "Misc", defaultValue: 1 / 3 }
			},
			aggregations: {
				control: {type: "sap.suite.ui.microchart.InteractiveLineChart", multiple: false}
			},
			events: {
				filterChange: {},
				unitChange: {}
			}
		},
		renderer: function(oRm, oControl) {
			oRm.renderControl(oControl.getAggregation("control"));
		}
	});

	FilterItemMicroLine.prototype.init = function() {
		var oPoint = new sap.suite.ui.microchart.InteractiveLineChartPoint({
			label : "May",
			value : 40,
			unit : "%"
		});

		this._chart = new sap.suite.ui.microchart.InteractiveLineChart({
			maxDisplayedPoints : 6,
			selectionEnabled : true,
			points : [
				oPoint, oPoint.clone(), oPoint.clone(),
				oPoint.clone(), oPoint.clone(), oPoint.clone()
			]
		});

		this.setControl(this._chart);
	};

	FilterItemMicroLine.prototype.setWidth = function(width) {
		this.setProperty("width", width);
		//this._chart.setWidth(width);
	};

	FilterItemMicroLine.prototype.setHeight = function(height) {
		this.setProperty("height", height);
		//this._chart.setHeight(height);
	};


	return FilterItemMicroLine;

}, /* bExport= */ true);
