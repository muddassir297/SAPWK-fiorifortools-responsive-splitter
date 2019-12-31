sap.ui.define(["sap/suite/ui/microchart/InteractiveBarChart",
	"sap/suite/ui/microchart/InteractiveBarChartBar",
	"sap/viz/ui5/controls/common/feeds/FeedItem",
	"sap/viz/ui5/data/FlattenedDataset",
	"sap/ui/model/Sorter",
	"sap/viz/ui5/data/DimensionDefinition",
	"sap/viz/ui5/data/MeasureDefinition"],
	function(InteractiveBarChart, InteractiveBarChartBar, FeedItem, FlattenedDataset, Sorter, DimensionDefinition, MeasureDefinition) {
	"use strict";

	/* all visual filters should extend this class */
	var FilterItemMicroBar = InteractiveBarChart.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.FilterItemMicroBar", {
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
				control: {type: "sap.suite.ui.microchart.InteractiveBarChart", multiple: false}
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

	FilterItemMicroBar.prototype.init = function() {
		var oBar = new InteractiveBarChartBar({
			label : "S/4 Hana Implementations",
			value : 20
		});

		// Too many issues with using the Smart Chart, toolbar, duplicate ids, ... so use the VisFrame directly
		this._chart = new sap.suite.ui.microchart.InteractiveBarChart({
			maxDisplayedSegemnts : 3,
			selectionEnabled : true,
			bars : [
				oBar.clone(), oBar.clone(), oBar.clone()
			],
			min: 0,
			max: 100
		});
		this.setControl(this._chart);

		this._attachChartEvents();
	};

	FilterItemMicroBar.prototype._attachChartEvents = function() {
		if (this._chart.onAfterRendering) {
			var origOnAfterRendering = this._chart.onAfterRendering;
			var me = this;

			this._chart.onAfterRendering = function() {
				origOnAfterRendering.apply(this, arguments);

				// apply selection
				//me._applyDimensionFilter();
				me._chart.setBusy(false);
			};
		}

		// this._chart.attachSelectData(this._onChartSelectData, this);
		// this._chart.attachDeselectData(this._onChartDeselectData, this);
	};

	FilterItemMicroBar.prototype.setWidth = function(width) {
		this.setProperty("width", width);
		//this._chart.setWidth(width);
	};

	FilterItemMicroBar.prototype.setHeight = function(height) {
		this.setProperty("height", height);
		//this._chart.setHeight(height);
	};

	FilterItemMicroBar.prototype.setEntitySet = function(sEntitySetName) {
		this.setProperty("entitySet", sEntitySetName);
		this._updateBinding();
	};

	FilterItemMicroBar.prototype.setDimensionField = function(dimensionField) {
		this.setProperty("dimensionField", dimensionField);
		this._updateBinding();
	};

	FilterItemMicroBar.prototype.setDimensionFieldIsDateTime = function(dimensionFieldIsDateTime) {
		this._isDateTimeChanged = this.getDimensionFieldIsDateTime() != dimensionFieldIsDateTime;
		this.setProperty("dimensionFieldIsDateTime", dimensionFieldIsDateTime);
		this._updateBinding();
		this._isDateTimeChanged = false;
	};

	FilterItemMicroBar.prototype.setDimensionFieldDisplay = function(dimensionFieldDisplay) {
		this.setProperty("dimensionFieldDisplay", dimensionFieldDisplay);
		this._updateBinding();
	};

	FilterItemMicroBar.prototype.setMeasureField = function(measureField) {
		this.setProperty("measureField", measureField);
		this._updateBinding();
	};

	FilterItemMicroBar.prototype.setMeasureSortDescending = function(measureSortDescending) {
		this.setProperty("measureSortDescending", measureSortDescending);
		this._updateBinding();
	};

	FilterItemMicroBar.prototype.setUnitField = function(unitField) {
		this.setProperty("unitField", unitField);
		this._updateBinding();
	};

	FilterItemMicroBar.prototype.setDimensionFilterExternal = function(filter) {
		this.setProperty("dimensionFilterExternal", filter);
		this._updateBinding();
	};

	FilterItemMicroBar.prototype.getP13NConfig = function() {
		var propList = [
			"width", "height",
			"entitySet", "dimensionField", "dimensionFieldDisplay", "dimensionFieldIsDateTime", "dimensionFilter", "measureField", "measureSortDescending"
		];

		// simple properties
		var config = {};
		for (var i = 0; i < propList.length; i++) {
			var name = propList[i];
			config[name] = this.getProperty(name);
		}

		return config;
	};

	FilterItemMicroBar.prototype.setDimensionFilter = function(dimFilter) {
		this.setProperty("dimensionFilter", dimFilter);

		//this._applyDimensionFilter();
	};

	FilterItemMicroBar.prototype._updateBinding = function() {
		// Make sure all binding are available
		var entityName = this.getEntitySet();
		var dimField = this.getDimensionField();
		var dimFieldDisplay = this.getDimensionFieldDisplay();
		var measureField = this.getMeasureField();
		var unitField = this.getUnitField();
		var filter = this.getDimensionFilterExternal();

		if (!entityName || !measureField || !dimField || !dimFieldDisplay) // All fields must be present
			return;

		// Create the required Feed entries for the Chart
		var feedList = this._chart.getFeeds();
		var createFeeds = true;
		if (feedList && feedList.length == 2) {
			// check if the values set on the feed match
			var dimFeed = feedList[0]; // Dimension
			var measureFeed = feedList[1]; // Measure
			createFeeds = dimFeed.getValues() != dimFieldDisplay || measureFeed.getValues() != measureField;
		}

		if (createFeeds) {
			this._chart.removeAllFeeds(); // Clear any previously set feeds
			this._chart.addFeed(
				new FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": dimFieldDisplay
				})
			);

			this._chart.addFeed(
				new FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": measureField
				})
			);
		}

		// Collect the select fields, so that duplicates can be removed
		var selectFields = [measureField, dimField];

		if (dimField != dimFieldDisplay)
			selectFields.push(dimFieldDisplay);

		if (unitField)
			selectFields.push(unitField);

		var filterList = [];
		if (filter && filter.aFilters && filter.aFilters.length > 0)
			filterList = [filter];

		var me = this;
		var count = 3;
		var measureSortDescending = this.getMeasureSortDescending();

		var dataBinding = {
			path: "/" + entityName,
			startIndex: 0,
			length: count,
			sorter: new Sorter(measureField, measureSortDescending), // Not declarable (doesn't take effect if an instance of the Sorter is not provided)
			filters: filterList,
			parameters: {
				select: selectFields.join(",")
			},
			events: {
				dataReceived: function(ev) {
					me._onDataReceived(ev);
				}
			}
		};

		var dataSet = new FlattenedDataset({
			data: dataBinding,
			dimensions: new DimensionDefinition({
				name: dimFieldDisplay,
				value: "{" + dimField + "}",
				displayValue: "{" + dimFieldDisplay + "}"
			}),
			measures: [
				new MeasureDefinition({
					"name": measureField,
					"value": "{" + measureField + "}"
				})
			]
		});
		this._chart.setDataset(dataSet);

		this._applyDimensionFilter();

		var binding = dataSet.getBinding("data");
		if (binding) // manually trigger
			binding.getContexts(0, count);

		this._chart.setBusy(true);
	};

	FilterItemMicroBar.prototype._onDataReceived = function(ev) {
		var data = ev.getParameter("data");
		var unitField = this.getUnitField();
		if (!data || !data.results || !unitField) {
			this._applyUnitValue("");
			return;
		}

		var prevVal = "";
		for (var i = 0; i < data.results.length; i++) {
			var unit = data.results[i][unitField];
			if (!unit || (prevVal && unit != prevVal)) {
				this._applyUnitValue("");
				return;
			}

			prevVal = unit;
		}

		this._applyUnitValue(prevVal);
	};

	FilterItemMicroBar.prototype._applyUnitValue = function(val) {
		if (this._lastUnit != val) {
			this._lastUnit = val;
			//TODO RC Check with Vincent what is this function do?
			this.fireUnitChange({unitValue: val});
		}
	};


	return FilterItemMicroBar;

}, /* bExport= */ true);
