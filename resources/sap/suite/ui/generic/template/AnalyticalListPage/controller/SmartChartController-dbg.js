sap.ui.define(["sap/m/OverflowToolbar","sap/m/ToolbarSpacer","sap/m/FlexItemData", "sap/m/ToolbarDesign",
		"sap/ui/core/mvc/Controller"
	],
    function(OverflowToolbar, ToolbarSpacer, FlexItemData, ToolbarDesign, Controller) {
		"use strict";
		var cController = Controller.extend("sap.suite.ui.generic.template.AnalyticalListPage.controller.SmartChartController", {
			setState: function(oState) {
				this.triggeredByTableSort = false;
				this.tableSortSelection;
				this._selectFilterByMeasure = false; // else will filter by all dimensions/measures at the selection
				this.oState = oState;

				// Attach the init method to e.g., hook into the data selection event
				oState.oSmartChart.attachInitialise(this._onSmartChartInit, this);
				oState.oSmartChart.attachBeforeRebindChart(this._onBeforeRebindChart, this);

				this.oState.attachSearchButtonPressed(this._onSearchButtonPressed, this);
			},
			/**
			 * onBeforeRebindChart binds the table query params
			 * @param  {Object} oEvent Event object
			 */
			_onBeforeRebindChart: function (oEvent) {
				//this check is to prevent rebind of chart triggered by table via smartFilterBar
				//comparing previous list of applied filters with current filters list
				var currentFilter = oEvent.mParameters.bindingParams.filters;
				if (this._lastFilter) {
					if (!this.oState.detailController._isFilterDiff(this._lastFilter,currentFilter)) {
						oEvent.mParameters.bindingParams.preventChartBind = true;
					}
				}
				this._lastFilter = oEvent.mParameters.bindingParams.filters;
				// modifying chart binding params to sort chart based on table data
				if (this.triggeredByTableSort && this.tableSortSelection) {
					var variant = this.oState.oSmartChart.fetchVariant();
					if (this.tableSortSelection.length > 0) {
						variant.sort = {};
						variant.sort.sortItems = [];
						for (var i = 0; i < (this.tableSortSelection.length); i++) {
							oEvent.mParameters.bindingParams.sorter.push(this.tableSortSelection[i]);
							variant.sort.sortItems.push({
								columnKey: this.tableSortSelection[i].sPath,
								operation: this.tableSortSelection[i].bDescending ? "Descending" : "Ascending"
							});
						}
					} else {
						oEvent.mParameters.bindingParams.sorter = this.tableSortSelection;
						// to set data in personalization dailog
						if (variant.sort) {
							delete variant.sort;
						}
					}

					// apply variant so that P13n is also updated, rebind chart does not update p13n
					this.oState.oSmartChart.applyVariant(variant);
					this.triggeredByTableSort = false;
				}

				//Make sure views with paramters are working
				if (this.oState.oSmartFilterbar && this.oState.oSmartFilterbar.getAnalyticBindingPath && this.oState.oSmartFilterbar.getConsiderAnalyticalParameters()) {
					try {
						var sAnalyticalPath = this.oState.oSmartFilterbar.getAnalyticBindingPath();
						if (sAnalyticalPath) {
							this.oState.oSmartChart.setChartBindingPath(sAnalyticalPath);
						}
					} catch (e) {
						jQuery.sap.log.warning("Mandatory parameters have no values", "", "AnalyticalListPage");
					}
				}

				this.oState.oController.onBeforeRebindChartExtension(oEvent);
			},
			_onSmartChartInit: function() {
				var oState = this.oState;

				this.oChart = oState.oSmartChart.getChart();
				//Disable the toolbars once search is triggered
				oState.oSmartChart.attachShowOverlay(function(oEvent){
					oState.oSmartChart.getToolbar().setEnabled(!oEvent.getParameter("overlay").show);
				}, this);
				
				// TODO: check if need to handle chart type change
				this.oChart.attachSelectData(this._onChartSelectData, this);
				this.oChart.attachDeselectData(this._onChartDeselectData, this);

				// Adding the view switch button to smartChart toolbar
				// Buttons added here as opposed to XML to maintain their position in toolbar
				if (this.oState._pendingChartToolbarInit) {
					this.oState.oSmartChart.getToolbar().insertContent(this.oState.alr_viewSwitchButtonOnChart, this.oState.oSmartChart.getToolbar().getContent().length);
				}

				delete this.oState._pendingChartToolbarInit;

				this.oState.oSmartChart.getChart().setVizProperties({
					"valueAxis":{
						"title":{
							"visible":false
						}
					},
					"legendGroup":{
						"layout":{
							"position":"bottom"
						}
					}
				});

				jQuery.sap.log.info("Smart Chart Annotation initialized");
			},
			_onChartSelectData: function(ev) {
				var chart = this.oState.oSmartChart.getChart();
				if (chart._getVizFrame().vizSelection()) { // workaround for bug in chart, will get null pointer exception if vizSelection is not checked
					var selList = chart.getSelectedDataPoints().dataPoints;
					this._lastSelected = this._getLastSel(selList, this._lastSelectedList);
					this._lastSelectedList = selList;
				}

				// get the set of filter critera based on the selection, could be differences based on type, so get in a different function
				this._updateTable("selection");
			},
			_getLastSel: function(newList, oldList) {
				var chart = this.oState.oSmartChart.getChart();
				var newSelList = this.oState.detailController._getSelParamsFromDPList(newList);
				var oldSelList = this.oState.detailController._getSelParamsFromDPList(oldList);

				for (var i = 0; i < newSelList.length; i++) {
					var newSel = newSelList[i];
					var match = false;
					for (var j = 0; j < oldSelList.length; j++) {
						var oldSel = oldSelList[j];

						match = true;
						for (var a in oldSel) {
							if (a.indexOf("__") != -1)
								continue;

							if (newSel[a] != oldSel[a]) {
								match = false;
								break;
							}
						}

						if (match)
							break;
					}

					if (!match) {
						var dimList = chart.getVisibleDimensions();
						var newSelOnlyDim = {};
						for (var j = 0; j < dimList.length; j++) {
							var name = dimList[j];
							newSelOnlyDim[name] = newSel[name];
						}

						return newSelOnlyDim;
					}
				}

				return null;
			},
			_onChartDeselectData: function(ev) {
				var me = this;
				this._lastSelected = null;
				setTimeout(function() { // due to the selection data points not being updated during the deselectData event, must check again asynchronously
					var chart = me.oState.oSmartChart.getChart();
					if (chart.getSelectedDataPoints().count == 0) // Clear the filter if no selections remain.  If a selection exists it would have come through the SelectData event
						me._updateTable("selection");
					else if (chart.getSelectionMode() == "MULTIPLE") // Treat an unselect with remaining selection points as a select
						me._onChartSelectData(ev);
				}, 1);

				// A drilldown via the breadcrumb (no other event to listen to drilldown events), the drilledUp event doesn't get triggered in this case
				var evtSrc = ev.getParameter("oSource");
				if (evtSrc && evtSrc instanceof sap.m.Link && evtSrc.getParent() instanceof sap.m.Breadcrumbs)
					me._onChartDrilledUp(ev);
			},
			_onChartDrilledUp: function(ev) {
				this._updateTable();
			},
			_onChartDrilledDown: function(ev) {
				this._updateTable();
			},
			_onSearchButtonPressed: function() {
				this._updateTable();
			},
			updateTable: function() {
				var variant = this.oState.oSmartChart.fetchVariant(),
				sortData = {};

				if (variant.sort && variant.sort.sortItems) {
					sortData.sortList = variant.sort.sortItems;
					sortData.allSortRemoved = false;
				} else {
					sortData.sortList = undefined;
					sortData.allSortRemoved = true;
				}

				this._updateTable(undefined, sortData);
			},
			_updateTable: function(updateType) {

				var chart = this.oState.oSmartChart.getChart();
				if (!chart) {
					return;
				}

				var dpList = [];
				if (chart._getVizFrame().vizSelection()) // workaround for bug in chart, will get null pointer exception if vizSelection is not checked
					dpList = chart.getSelectedDataPoints().dataPoints;
				if (!dpList || dpList.length == 0)
					this._lastSelected = null;

				this.oState.detailController.applyParamsToTable();

			}
		});
		return cController;
	});
