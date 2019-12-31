sap.ui.define([
	"sap/viz/ui5/controls/VizFrame", "sap/viz/ui5/data/FlattenedDataset", "sap/viz/ui5/data/DimensionDefinition", "sap/viz/ui5/data/MeasureDefinition", "sap/viz/ui5/controls/common/feeds/FeedItem",
	"sap/viz/ui5/format/ChartFormatter", "sap/viz/ui5/api/env/Format",
	"sap/ui/model/Sorter",
	"sap/suite/ui/generic/template/AnalyticalListPage/control/visualfilterbar/FilterItemChart",
	"sap/ui/model/json/JSONModel"
],
function(VizFrame, FlattenedDataset, DimensionDefinition, MeasureDefinition, FeedItem,
		ChartFormatter, Format,
		Sorter,
		FilterItemChart,
		JSONModel) {
	"use strict";

	var FilterItemChartBar = FilterItemChart.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.FilterItemChartBar", {
		metadata: {
			properties: {
				labelWidthPercent: { type: "float", group: "Misc", defaultValue: 1 / 3 },
				fixedCount: {type: "int", defaultValue: 3}
			},
			aggregations: {
				dataset: {type: "sap.viz.ui5.data.Dataset", multiple : false}
			}
		},

		renderer: {}
	});

	FilterItemChartBar.prototype.init = function() {
		// Too many issues with using the Smart Chart, toolbar, duplicate ids, ... so use the VisFrame directly
		this._chart = new VizFrame({
			vizType: "bar",
			legendVisible: false
		});
		this.setControl(this._chart);

		this._chart.setModel(new JSONModel()); // set the chart's model to a JSON model initially so that the binding doesn't trigger an OData request
		this._sorters = [];
		FilterItemChart.prototype.init.apply(this, arguments);
	};

	FilterItemChartBar.prototype._updateBinding = function() {
		// Make sure all binding are available
		var entityName = this.getEntitySet();
		var dimField = this.getDimensionField();
		var dimFieldDisplay = this.getDimensionFieldDisplay();
		var measureField = this.getMeasureField();
		var unitField = this.getUnitField();
		var filter = this.getDimensionFilterExternal();
		var aSortOrder = [], aSortFields = [];
		aSortOrder = this.getSortOrder();
		var oSortObject = FilterItemChart._getSorter(aSortOrder);
		this._sorters = oSortObject.sorter;
		aSortFields = oSortObject.sortFields;
		if (!entityName || !measureField || !dimField || !dimFieldDisplay) // All fields must be present
			return;

		var vizProps = {
			general: {
				background: {
					color: "transparent"
				}
			},
			plotArea: {
				colorPalette: ["#006ca7"], // TODO: read palette from variables based on theme
				dataLabel: {
					formatString: this._formattingId,
					visible: true,
					position: "inside" // Need the equivalent of outsideFirst -> insideFirst, not supported by VizFrame
				},
				gridline: { visible: false },
				background: {
					color: "transparent"
				},
				gap: {
					barSpacing: 0.5
				}
			},
			valueAxis: { visible: false },
			categoryAxis: {
				title:    { visible: false },
				axisTick: { visible: false },
				axisLine: { visible: false },
				hoverShadow: {
					color: "transparent"
				},
				layout: {
					width: this.getLabelWidthPercent()
				}
			},
			tooltip: { visible: false },
			title:   { visible: false },
			interaction: {
				selectability: {
					mode: "MULTIPLE"
				},
				enableDeselectAll: false
			}
		};

		if (JSON.stringify(vizProps) != JSON.stringify(this.lastVizProps)) // diff objects, perhaps not the most efficient, but dealing with a small enough event, small and simple structure that this won't significantly impact performance
			this._chart.setVizProperties(vizProps);
		this.lastVizProps = vizProps;

		// Create the required Feed entries for the Chart
		var feedList = this._chart.getFeeds();
		var createFeeds = true;
		if (feedList && feedList.length == 2) {
			// check if the values set on the feed match
			var dimFeed = feedList[0]; // Dimension
			var measureFeed = feedList[1]; // Measure
			createFeeds = dimFeed.getValues() != dimFieldDisplay || measureFeed.getValues() != measureField;
		}

		// since dimension and measure for filter item will always be a string
		// but FeedItem expects an array of strings
		var dimFieldArray = [dimFieldDisplay],
			measureFieldArray = [measureField];

		if (createFeeds) {
			this._chart.removeAllFeeds(); // Clear any previously set feeds
			this._chart.addFeed(
				new FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": dimFieldArray
				})
			);

			this._chart.addFeed(
				new FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": measureFieldArray
				})
			);
		}

		// Collect the select fields, so that duplicates can be removed
		var selectFields = [measureField, dimField, aSortFields];

		if (dimField != dimFieldDisplay)
			selectFields.push(dimFieldDisplay);

		if (unitField)
			selectFields.push(unitField);

		var filterList = [];
		if (filter && filter.aFilters && filter.aFilters.length > 0)
			filterList = [filter];

		this.setDataset(this._getDataSet(entityName, selectFields, filterList, measureField, dimField, dimFieldDisplay));
		this._chart.setDataset(this._getChartDataSet(entityName, filterList, measureField, dimField, dimFieldDisplay));

		this._applyDimensionFilter();

		this._chart.setBusy(true);
	};

	FilterItemChartBar.prototype._getDataSet = function(entityName, selectFields, filterList, measureField, dimField, dimFieldDisplay) {
		var me = this;
		var count = this.getFixedCount();

		var dataSet = new FlattenedDataset({
			data: {
				path: "/" + entityName,
				startIndex: 0,
				length: count,
				sorter: this._sorters, // Not declarable (doesn't take effect if an instance of the Sorter is not provided)
				filters: filterList,
				parameters: {
					select: selectFields.join(",")
				},
				events: {
					dataReceived: function(ev) {
						me._onDataReceived(ev);
					}
				}
			},
			dimensions: new DimensionDefinition({
				name: dimFieldDisplay,
				value: "{" + dimField + "}",
				displayValue: { // Without this formatter and the subsequent call to data.GetContexts the "dataReceived" event will not be triggered
					parts: [dimFieldDisplay, measureField],
					formatter: function(dimLabel, dimValue) {
						var dataSet = me.getDataset();
						if (!dataSet)
							return "";

						// It would be great if the Donut chart would provide this
						var data = dataSet.getBinding("data");
						if (!data)
							return "";

						data.getContexts(0, count);

						return "";
					}
				}
			}),
			measures: [
				new MeasureDefinition({
					name: measureField,
					value: "{" + measureField + "}"
				})
			]
		});

		var binding = dataSet.getBinding("data");
		if (binding) // manually trigger
			binding.getContexts(0, count);

		return dataSet;
	};

	FilterItemChartBar.prototype._getChartDataSet = function(entityName, filterList, measureField, dimField, dimFieldDisplay) {
		var chartDataSet = new FlattenedDataset({
			data: {
				path: "/" + entityName
			},
			dimensions: new DimensionDefinition({
				name: dimFieldDisplay,
				value: "{" + dimField + "}",
				displayValue: { // Without this formatter and the subsequent call to data.GetContexts the "dataReceived" event will not be triggered
					parts: [dimFieldDisplay],
					formatter: function(dimLabel) {
						var dimLabel = dimLabel instanceof Date ? dimLabel.toDateString() : dimLabel;
						return dimLabel && typeof dimLabel == "string" && dimLabel.indexOf("__DUMMY_") == 0 ? "" : dimLabel;
					}
				}
			}),
			measures: [
				new MeasureDefinition({
					"name": measureField,
					"value": "{" + measureField + "}"
				})
			]
		});

		return chartDataSet;
	};

	FilterItemChartBar.prototype._onDataReceived = function(ev) {
		var dataSet = this.getDataset();
		if (!dataSet)
			return;

		// Copy the existing model and the missing data
		var dimField = this.getDimensionField();
		var dimFieldDisplay = this.getDimensionFieldDisplay();
		var propList = [
			dimField,
			dimFieldDisplay,
			this.getMeasureField(),
			this.getUnitField()
		];

		var dataList = [];

		// Copy from the request context to the local data to be stored in a json model
		var count = this.getFixedCount();
		var contextList = dataSet.getBinding("data").getContexts(0, count);
		for (var i = 0; i < contextList.length; i++) {
			var context = contextList[i];
			var rowObj = {};
			for (var j = 0; j < propList.length; j++) {
				var prop = propList[j];
				rowObj[prop] = context.getObject(prop);
			}

			dataList.push(rowObj);
		}

		// check that the list contains the required amount, if not add more blank entries
		for (var i = contextList.length; i < count; i++) {
			var rowObj = {};
			for (var j = 0; j < propList.length; j++) {
				var prop = propList[j];
				rowObj[prop] = ""; // set to empty
			}

			rowObj[dimField] = "__DUMMY_" + i;

			dataList.push(rowObj);
		}

		var data = {};
		var entityName = this.getEntitySet();

		data[entityName] = dataList;

		this._chart.setModel(new JSONModel(data));

		FilterItemChart.prototype._onDataReceived.apply(this, arguments);

		this._chart.rerender();
	};

	return FilterItemChartBar;
}, /* bExport= */true);
