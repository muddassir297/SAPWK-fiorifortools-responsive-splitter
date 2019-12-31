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

	var FilterItemChartDonut = FilterItemChart.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.FilterItemChartDonut", {
		metadata: {
			properties: {
				labelWidthPercent: { type: "float", group: "Misc", defaultValue: 1 / 2 }
			},
			aggregations: {
				dataset : {type : "sap.viz.ui5.data.Dataset", multiple : false},
				totalDataset : {type : "sap.viz.ui5.data.Dataset", multiple : false}
			}
		},

		renderer: {}
	});

	FilterItemChartDonut.prototype.init = function() {
		// Too many issues with using the Smart Chart, toolbar, duplicate ids, ... so use the VisFrame directly
		this._chart = new VizFrame({
			vizType: "donut",
			legendVisible: false
		});

		this.setControl(this._chart);

		this._chart.setModel(new JSONModel()); // set the chart's model to a JSON model initially so that the binding doesn't trigger an OData request

		this._otherField = "__IS_OTHER__"; // may need to replace if the data contains this
		this._otherID = "__OTHER__"; // may need to replace if the data contains this
		this._measureScaledField = "__MEASURE_SCALED__"; // may need to replace if the data contains this
		this._percentField = "__PERCENT__"; // may need to replace if the data contains this
		this._sorters = [];
		FilterItemChart.prototype.init.apply(this, arguments);
	};

	FilterItemChartDonut.prototype._updateBinding = function() {
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
				layout: {
					paddingRight: 10,
					padding: 0
				},
				background: {
					color: "transparent"
				}
			},
			legend: {
				visible: true,
				itemMargin: 1.5
			},
			legendGroup: {
				layout: {
					alignment: "center",
					//width: this.getLabelWidthPercent() * parseInt(this.getWidth(), 10)
					//Converting width in percentage
					width: ((this.getLabelWidthPercent() * 100 )  + "%")
				}
			},
			plotArea: {
				innerRadiusRatio: 0.65,
				colorPalette: ["#006ca7", "#55A1C4", "#8BBDD4"], // TODO: read palette from variables based on theme
				background: {
					visible: false
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
			createFeeds = dimFeed.getValues() != dimFieldDisplay || measureFeed.getValues() != this._measureScaledField;
		}

		if (createFeeds) {
			this._chart.removeAllFeeds(); // Clear any previously set feeds
			// since dimension and measure for filter item will always be a string
			// but FeedItem expects an array of strings
			var dimFieldArray = [dimFieldDisplay],
				measureFieldArray = [this._measureScaledField];

			this._chart.addFeed(
				new FeedItem({
					"uid": "color",
					"type": "Dimension",
					"values": dimFieldArray
				})
			);

			this._chart.addFeed(
				new FeedItem({
					"uid": "size",
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

		// Set the regular, the total and the chart data sets
		this._totalReady = false;

		this.setDataset(this._getDataSet(entityName, selectFields, filterList, measureField, dimField, dimFieldDisplay));
		this.setTotalDataset(this._getTotalDataSet(entityName, filterList, measureField, dimField, dimFieldDisplay));
		this._chart.setDataset(this._getChartDataSet(entityName, filterList, measureField, dimField, dimFieldDisplay));

		this._applyDimensionFilter();

		this._chart.setBusy(true);
	};

	FilterItemChartDonut.prototype._getDataSet = function(entityName, selectFields, filterList, measureField, dimField, dimFieldDisplay) {
		var me = this;
		// Requsting for top four records to check if the chart selections are more than three
		var count = 4;

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
						//Need to be sure that top 4 query has returned as well.
						me._topTwoReady = true;
						me._onDataReceived(ev);	//Sending explicit true to indicate first two are also ready.
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
					value: measureField
				})
			]
		});

		var binding = dataSet.getBinding("data");
		if (binding) // manually trigger
			binding.getContexts(0, count);

		return dataSet;
	};

	FilterItemChartDonut.prototype._getTotalDataSet = function(entityName, filterList, measureField, dimField, dimFieldDisplay) {
		var me = this;
		var count = 1; // only 1 total

		var totalDataSet = new FlattenedDataset({
				data: {
				path: "/" + entityName,
				startIndex: 0,
				length: count,
				filters: filterList,
				parameters: {
					select: measureField
				},
				events: {
					dataReceived: function(ev) {
						me._onTotalReceived(ev);
					}
				}
			},
			dimensions: new DimensionDefinition({
				name: dimFieldDisplay,
				value: "{" + dimField + "}",
				displayValue: { // Without this formatter and the subsequent call to data.GetContexts the "dataReceived" event will not be triggered
					parts: [dimFieldDisplay, measureField],
					formatter: function(dimLabel, dimValue) {
						var totalDataSet = me.getTotalDataset();
						if (!totalDataSet)
							return "";

						// It would be great if the Donut chart would provide this
						var data = totalDataSet.getBinding("data");
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
					value: measureField
				})
			]
		});

		var binding = totalDataSet.getBinding("data");
		if (binding) // manually trigger
			binding.getContexts(0, count);

		return totalDataSet;
	};

	FilterItemChartDonut.prototype._getChartDataSet = function(entityName, filterList, measureField, dimField, dimFieldDisplay) {
		var me = this;
		var count = 3;

		var chartDataSet = new FlattenedDataset({
			data: {
				path: "/" + entityName
			},
			dimensions: new DimensionDefinition({
				name: dimFieldDisplay,
				value: "{" + dimField + "}",
				displayValue: {
					parts: [dimFieldDisplay, this._percentField],
					formatter: function(dimLabel, percent) {
						var chartDataSet = me._chart.getDataset();
						if (!chartDataSet)
							return "";

						// It would be great if the Donut chart would provide this
						var data = chartDataSet.getBinding("data");
						if (!data)
							return "";
						data.getContexts(0, count);

						return dimLabel + ": " + percent + "%";
					}
				}
			}),
			measures: [
				new MeasureDefinition({
					name: this._measureScaledField,
					value: {
						path: this._measureScaledField,
						formatter: function(valScaled) {
							return valScaled;
						}
					}
				})
			]
		});

		return chartDataSet;
	};

	FilterItemChartDonut.prototype._getMaxScaleFactor = function(contextList, field) {
		var max;
		for (var i = 0; i < contextList.length; i++) {
			var context = contextList[i];
			var val = Math.abs(parseFloat(context.getObject(field)));
			max = i == 0 ? val : Math.max(max, val);
		}

		return this._getScaleFactor(max); // get the scale factor from the max
	};

	FilterItemChartDonut.prototype._onDataReceived = function(ev) {
		//Update binding is setting chart busy status to true.
		//It will set back to false only after rendering – since there is no data it will bypass the rendering so we have set the busy status to false.
		if (ev.getParameter('data').results.length === 0) {
			this._chart.setBusy(false);
			return;
		}

		//Both top records and total has to be ready
		if (!(this._totalReady && this._topTwoReady))
			return;
		var dataSet = this.getDataset();
		var totalDataSet = this.getTotalDataset(totalDataSet);
		if (!dataSet || !totalDataSet)
			return;

		// Combine the existing model and the "Other" category
		var dimField = this.getDimensionField();
		var dimFieldDisplay = this.getDimensionFieldDisplay();
		var measureField = this.getMeasureField();
		var unitField = this.getUnitField();
		var propList = [
			dimField,
			dimFieldDisplay,
			measureField,
			unitField
		];

		var combinedDataList = [];

		var totalContextList = totalDataSet.getBinding("data").getContexts(0, 1);
		if (totalContextList.length != 1)
			return;

		var totalContext = totalContextList[0];

		var contextList = dataSet.getBinding("data").getContexts();
		// If more than three chart slections then add only top two to the combinedDataList.
		// And add Others as the third item to the list
		var iContextLength = contextList.length > 3 ? 2 : contextList.length;

		var otherVal = parseFloat(totalContext.getObject(measureField));
		var totalScaled = parseFloat(totalContext.getObject(measureField));
		var sumDataScaled = 0;

		for (var i = 0; i < iContextLength; i++) {
			var context = contextList[i];
			var rowObj = {};
			for (var j = 0; j < propList.length; j++) {
				var prop = propList[j];
				rowObj[prop] = context.getObject(prop);

				if (prop == measureField) {
					rowObj[this._measureScaledField] = rowObj[prop]; // scale so rounding can affect the sum and apply to the "Other" category so no discrepency
				}
			}

			combinedDataList.push(rowObj);

			sumDataScaled += parseFloat(rowObj[this._measureScaledField]);
			otherVal -= parseFloat(rowObj[measureField]);
		}

		// Adjust the total to account for when it is less than the sum
		//if (totalScaled < sumDataScaled)
			//totalScaled = totalScaled + sumDataScaled;

		if (contextList.length > 3) { // Only add Other if more than 3 chart selections
			var i18nModel = this.getModel("i18n");

			var rowObj = {};
			rowObj[this._otherField] = true;
			rowObj[dimField] = this._otherID;
			rowObj[dimFieldDisplay] = i18nModel ? i18nModel.getResourceBundle().getText("VIS_FILTER_DONUT_OTHER") : "";
			rowObj[measureField] = otherVal;
			rowObj[this._measureScaledField] = totalScaled - sumDataScaled;
			rowObj[unitField] = ""; // can't say, could be anything

			combinedDataList.push(rowObj);
		}

		// Calculate percentage based on scaled value (will be different than absolute value)

		var fixedInteger = sap.ui.core.format.NumberFormat.getFloatInstance({
			style: "short",
			minFractionDigits: this._minFractionalDigits,
			maxFractionDigits: this._maxFractionalDigits
		});

		for (var i = 0; i < combinedDataList.length; i++) {
			var percentVal = combinedDataList[i][this._measureScaledField] / totalScaled * 100;
			combinedDataList[i][this._percentField] = fixedInteger.format(percentVal); // round value
			//combinedDataList[i][this._percentField] = percentVal.toFixed(2); // round value
		}
		//unit determination
		if (combinedDataList){
			this._determineUnit(combinedDataList);
		}
		var combinedData = {};
		var entityName = this.getEntitySet();

		combinedData[entityName] = combinedDataList;

		this._chart.setModel(new JSONModel(combinedData));

		FilterItemChart.prototype._onDataReceived.apply(this, arguments);

		this._totalReady = false;
		this._topTwoReady = false;

		this._chart.rerender();
	};

	FilterItemChartDonut.prototype._getScaledValue = function(val, scaleFactor, keepSign) {
		var decimalShift = this._maxFractionalDigits * 10;

		var floatVal = keepSign ? parseFloat(val) : Math.abs(parseFloat(val));
		var scaledVal = Math.round(floatVal * decimalShift / scaleFactor) / decimalShift;
		return scaledVal;
	};

	FilterItemChartDonut.prototype._onTotalReceived = function(ev) {
		this._totalReady = true;

		this._onDataReceived(ev);
	};

	FilterItemChartDonut.prototype._onChartSelectData = function(ev) {
		var dimField = this.getDimensionField(); // although the display field key, actually the technical field key... due to setting the displayValue in the DimensionDefinition.  A little strange.
		var selectionList = this._chart.vizSelection();

		var binding = this._chart.getDataset().getBinding("data");
		var resetSelection = false;
		var points = [];
		for (var i = 0; i < selectionList.length; i++) {
			var selection = selectionList[i].data;

			var rowObj = binding.getContexts(selection._context_row_number, 1)[0].getObject();
			if (rowObj[this._otherField]) {
				// Cannot support the "Other" selection due to limitations on the Filter critera supported by SAP's Gateway implementation of OData/BI
				// So unselect
				resetSelection = true;
				selectionList.splice(i, 1);
			}
			else {
				var data = {};

				data[dimField] = selection[dimField];
				points.push({
					data: data
				});
			}
		}

		if (resetSelection) {
			var i18nModel = this.getModel("i18n");
			var dimFieldDisplay = this.getDimensionFieldDisplay();
			var points = [];
			var data = {};

			if (dimField === dimFieldDisplay) {
				data[dimField] = i18nModel ? i18nModel.getResourceBundle().getText("VIS_FILTER_DONUT_OTHER") : "";
			} else {
				data[dimFieldDisplay] = this._otherID;
			}

			points.push({
				data: data
			});
			this._ignoreNextSelectionChange = true; // ignore the deselect, else refilter
			this._chart.vizSelection(points, {deselection: true});
			this._chart.rerender();
		}
		else {
			FilterItemChart.prototype._onChartSelectData.apply(this, arguments);
		}
	};

	return FilterItemChartDonut;
}, /* bExport= */true);
