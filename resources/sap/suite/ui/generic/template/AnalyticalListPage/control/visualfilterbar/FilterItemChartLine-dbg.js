sap.ui.define([
	"sap/viz/ui5/controls/VizFrame", "sap/viz/ui5/controls/VizFrameRenderer", "sap/viz/ui5/data/FlattenedDataset", "sap/viz/ui5/data/DimensionDefinition", "sap/viz/ui5/data/MeasureDefinition", "sap/viz/ui5/controls/common/feeds/FeedItem",
	"sap/viz/ui5/format/ChartFormatter", "sap/viz/ui5/api/env/Format",
	"sap/ui/model/Sorter",
	"sap/suite/ui/generic/template/AnalyticalListPage/control/visualfilterbar/FilterItemChart",
	"sap/ui/model/json/JSONModel"
],
function(VizFrame, VizFrameRenderer, FlattenedDataset, DimensionDefinition, MeasureDefinition, FeedItem,
		ChartFormatter, Format,
		Sorter,
		FilterItemChart,
		JSONModel) {
	"use strict";

	var FilterItemChartLine = FilterItemChart.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.FilterItemChartLine", {
		metadata: {
			properties: {
				labelWidthPercent: { type: "float", group: "Misc", defaultValue: 1 / 3 },
				fixedCount: {type: "int", defaultValue: 6}
			},
			aggregations: {
				dataset: {type: "sap.viz.ui5.data.Dataset", multiple : false}
			}
		},

		renderer: {}
	});

	FilterItemChartLine.prototype.init = function() {
		// Too many issues with using the Smart Chart, toolbar, duplicate ids, ... so use the VisFrame directly
		this._chart = new VizFrame({
			vizType: "line",
			legendVisible: false
		});
		this.setControl(this._chart);

		this._chart.setModel(new JSONModel()); // set the chart's model to a JSON model initially so that the binding doesn't trigger an OData request

		this._generateFiller = true;
		this._sorters = [];
		FilterItemChart.prototype.init.apply(this, arguments);
	};

	FilterItemChartLine.prototype._updateBinding = function() {
		// Make sure all binding are available
		var entityName = this.getEntitySet();
		var dimField = this.getDimensionField();
		var dimFieldDisplay = this.getDimensionFieldDisplay();
		var isDateTime = this.getDimensionFieldIsDateTime();
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

		var chartTypeChange = false;
		// If the dimension is of type dateTime, the different chart type
		if (isDateTime && this._chart.getVizType() != "timeseries_line") {
			this._chart = new VizFrame({
				vizType: "timeseries_line",
				legendVisible: false
			});

			chartTypeChange = true;
		}
		else if (!isDateTime && this._chart.getVizType() != "line") {
			this._chart = new VizFrame({
				vizType: "line",
				legendVisible: false
			});

			chartTypeChange = true;
		}

		if (chartTypeChange) { // reinitialize
			this.setControl(this._chart);

			this._chart.setWidth(this.getWidth());
			this._chart.setHeight(this.getHeight());

			this._attachChartEvents();
		}

		// Get the chart properties
		var vizProps = this._getVizProps(isDateTime);

		if (chartTypeChange || JSON.stringify(vizProps) != JSON.stringify(this.lastVizProps)) // diff objects, perhaps not the most efficient, but dealing with a small enough event, small and simple structure that this won't significantly impact performance
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

		if (chartTypeChange || createFeeds) {
			this._chart.removeAllFeeds(); // Clear any previously set feeds
			// since dimension and measure for filter item will always be a string
			// but FeedItem expects an array of strings
			var dimFieldArray = [dimFieldDisplay],
				measureFieldArray = [measureField];
			this._chart.addFeed(
				new FeedItem({
					"uid": isDateTime ? "timeAxis" : "categoryAxis",
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

	FilterItemChartLine.prototype._getVizProps = function(isDateTime) {
		var vizProps;

		if (isDateTime) {
			vizProps = {
				general: {
					background: {
						color: "transparent"
					},
					layout: {
						padding: 0
					}
				},
				plotArea: {
					colorPalette: ["#006ca7"], // TODO: read palette from variables based on theme
					dataLabel: {
						formatString: this._formattingId,
						visible: true
					},
					window: {
						start: "firstDataPoint",
						end: "lastDataPoint"
					},
					gridline: { visible: false },
					background: {
						color: "transparent"
					}
				},
				valueAxis: { visible: false },
				timeAxis: {
					title:    { visible: false },
					axisTick: { visible: false },
					hoverShadow: {
						color: "transparent"
					},
					levels: [
						"day",
						"month"
					],
					levelConfig: {
						year: {
							visible: false
						}
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
		}
		else {
			vizProps = {
				general: {
					background: {
						color: "transparent"
					},
					layout: {
						padding: 0
					}
				},
				plotArea: {
					colorPalette: ["#006ca7"], // TODO: read palette from variables based on theme
					dataLabel: {
						formatString: this._formattingId,
						visible: true,
						position: "inside"
					},
					gridline: { visible: false },
					background: {
						color: "transparent"
					}
				},
				valueAxis: { visible: false },
				categoryAxis: {
					title:    { visible: false },
					axisTick: { visible: false },
					hoverShadow: {
						color: "transparent"
					},
					label: {
						angle: 0,
						rotation: "auto"
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
		}

		return vizProps;
	};

	FilterItemChartLine.prototype._getDataSet = function(entityName, selectFields, filterList, measureField, dimField, dimFieldDisplay) {
		var me = this;
		var count = this.getFixedCount();
		var isDateTime = this.getDimensionFieldIsDateTime();
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
				},
				dataType: isDateTime ? "date" : "string"
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

	FilterItemChartLine.prototype._getChartDataSet = function(entityName, filterList, measureField, dimField, dimFieldDisplay) {
		var isDateTime = this.getDimensionFieldIsDateTime();

		var chartDataSet = new FlattenedDataset({
			data: {
				path: "/" + entityName
			},
			dimensions: new DimensionDefinition({
				name: dimFieldDisplay,
				value: "{" + dimField + "}",
				displayValue: {
					parts: [dimFieldDisplay],
					formatter: function(dimLabel) {
						return dimLabel && typeof dimLabel == "string" && dimLabel.indexOf("__DUMMY_") == 0 ? "" : dimLabel;
					}
				},
				dataType: isDateTime ? "date" : "string"
			}),
			measures: [
				new MeasureDefinition({
					name: measureField,
					value: "{" + measureField + "}"
				})
			]
		});

		return chartDataSet;
	};

	FilterItemChartLine.prototype._onDataReceived = function(ev) {
		var dataSet = this.getDataset();
		if (!dataSet)
			return;

		// Copy the existing model and the missing data
		var propList = this._propsToCopy();
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

		// Fill in missing data, always want the fixed count (i.e. 6 points in the line)
		if (this._generateFiller) {
			if (this.getDimensionFieldIsDateTime())
				dataList = this._generateDateTimeFiller(contextList, dataList, count);
			else
				dataList = this._generateStringFiller(contextList, dataList, count);
		}

		// Adjust to fit data
		this._adjustMinMax(dataList);

		var data = {};
		var entityName = this.getEntitySet();

		data[entityName] = dataList;

		this._chart.setModel(new JSONModel(data));

		FilterItemChart.prototype._onDataReceived.apply(this, arguments);

		this._chart.rerender();
	};

	FilterItemChartLine.prototype._adjustMinMax = function(dataList) {
		// Workaround for values getting clipped on the top and bottom of the plotArea, determine min/max and create enough buffer that they won't be clipped
		var measureField = this.getMeasureField();
		var min = 0;
		var max = 100;

		for (var i = 0; i < dataList.length; i++) {
			var rowObj = dataList[i];
			var val = parseFloat(rowObj[measureField]);
			if (isNaN(val))
				val = 0;
			if (i == 0) {
				min = max = val;
			}
			else {
				min = Math.min(min, val);
				max = Math.max(max, val);
			}
		}

		// based on the height, calculate a buffer
		var height = parseInt(this.getHeight(), 10) * 0.4; // remove the height taken up by the axis
		var diff = max - min;
		var bufferHeight = 2;
		if (diff != 0) {
			var percent = (height - 2 * bufferHeight) / height; // buffer (top bottom) * height
			var bufferVal = (diff - diff * percent) / 2;
			min -= bufferVal;
			max += bufferVal;
		}

		this._chart.setVizScales([{
			feed: "valueAxis",
			min: min,
			max: max
		}]);
	};

	FilterItemChartLine.prototype._propsToCopy = function() {
		var propList = [
			this.getDimensionField(),
			this.getDimensionFieldDisplay(),
			this.getMeasureField(),
			this.getUnitField()
		];

		return propList;
	};

	FilterItemChartLine.prototype._generateDateTimeFiller = function(contextList, dataList, count) {
		var dimField = this.getDimensionField();

		var periodIncrementFn = this._getPeriodIncrementFn();

		// List is already sorted, starting point is always today, need to work back from today and find the 6 matching entries (may not be included in the result set)
		var date = new Date();
		date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
//		var date = new Date(1446249600000); // test date for EASI service

		var firstDate = date;
		var lastDate = date;

		var resultIndex = 0;
		var fixedDateList = [];
		for (var i = 0; i < count; i++) {
			// see if the date is in the result dataList
			var rowObj = null;
			if (resultIndex < dataList.length) {
				var resultDate = dataList[resultIndex][dimField];

				if (date.getUTCFullYear() == resultDate.getUTCFullYear() && date.getUTCMonth() == resultDate.getUTCMonth() && date.getUTCDate() == resultDate.getUTCDate()) {
					// Then date matches, so use its value here instead of dummy
					rowObj = dataList[resultIndex];

					// Restrict to Year, Month, Day
					dataList[resultIndex][dimField] = new Date(resultDate.getUTCFullYear(), resultDate.getUTCMonth(), resultDate.getUTCDate());
					resultIndex++;
				}
			}

			if (!rowObj) { // Add dummy
				rowObj = this._createDummyRowDate(date);
			}

			fixedDateList.splice(0, 0, rowObj);

			lastDate = date;

			date = periodIncrementFn.apply(this, [date]);
		}

		// Add buffer so the first and last dates are not clipped by the plotting area
		var firstBuffer = periodIncrementFn.apply(this, [firstDate, true]);

		var rowObj = this._createDummyRowDate(firstBuffer);
		fixedDateList.splice(0, 0, rowObj);

		var lastBuffer = periodIncrementFn.apply(this, [lastDate, false, true]);

		var rowObj = this._createDummyRowDate(lastBuffer);
		fixedDateList.push(rowObj);

		return fixedDateList;
	};

	FilterItemChartLine.prototype._createDummyRowDate = function(date) {
		var propList = this._propsToCopy();
		var dimField = this.getDimensionField();
		var dimFieldDisplay = this.getDimensionFieldDisplay();
		var measureField = this.getMeasureField();

		var rowObj = {};
		for (var j = 0; j < propList.length; j++) {
			var prop = propList[j];
			rowObj[prop] = ""; // set to empty
		}

		rowObj[dimField] = date;
		rowObj[dimFieldDisplay] = date;
		rowObj[measureField] = null;

		return rowObj;
	};

	FilterItemChartLine.prototype._getPeriodIncrementFn = function() {
		var bDecrease = this.getMeasureSortDescending();

		// Don't have a fixed period, for now can only assume single day, should come through a setting (via annotation)
		var dayPeriodFn = function(date, bOpposite, bHalfInc) {
			var ms = date.getTime();

			var factor = (bDecrease ? -1 : 1);
			if (bOpposite)
				factor *= -1;

			ms = ms + factor * (bHalfInc ? 86400000 / 4 : 86400000);
			return new Date(ms);
		};

		return dayPeriodFn;
	};

	FilterItemChartLine.prototype._generateStringFiller = function(contextList, dataList, count) {
		var propList = this._propsToCopy();
		var dimField = this.getDimensionField();

		// check that the list contains the required amount, if not add more blank entries
		for (var i = contextList.length; i < count; i++) {
			var rowObj = {};
			for (var j = 0; j < propList.length; j++) {
				var prop = propList[j];
				rowObj[prop] = ""; // set to empty
			}

			rowObj[dimField] = "__DUMMY_" + i;

			dataList.splice(0, 0, rowObj);
		}

		return dataList;
	};

	return FilterItemChartLine;
}, /* bExport= */true);
