sap.ui.define(["sap/suite/ui/microchart/InteractiveDonutChart",
	"sap/suite/ui/microchart/InteractiveDonutChartSegment"],
	function(InteractiveDonutChart, InteractiveDonutChartSegment) {
	"use strict";

	/* all visual filters should extend this class */
	var FilterItemMicroDonut = InteractiveDonutChart.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.FilterItemMicroDonut", {
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
				control: {type: "sap.suite.ui.microchart.InteractiveDonutChart", multiple: false}
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

	FilterItemMicroDonut.prototype.init = function() {
		var oSegment = new sap.suite.ui.microchart.InteractiveDonutChartSegment({
			label : "Phase 1",
			value : 20
		});

		this._chart = new sap.suite.ui.microchart.InteractiveDonutChart({
			maxDisplayedSegemnts : 3,
			selectionEnabled : true,
			segments : [
				oSegment.clone(), oSegment.clone(), oSegment.clone().setLabel("others")
			]
		});

		this.setControl(this._chart);
	};

	FilterItemMicroDonut.prototype.setWidth = function(width) {
		this.setProperty("width", width);
		//this._chart.setWidth(width);
	};

	FilterItemMicroDonut.prototype.setHeight = function(height) {
		this.setProperty("height", height);
		//this._chart.setHeight(height);
	};


	return FilterItemMicroDonut;

}, /* bExport= */ true);
