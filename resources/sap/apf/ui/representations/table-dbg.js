/* SAP APF Analysis Path Framework
* 
* (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
jQuery.sap.declare("sap.apf.ui.representations.table");
jQuery.sap.require("sap.apf.core.constants");
jQuery.sap.require('sap.apf.ui.utils.formatter');
jQuery.sap.require("sap.apf.ui.representations.utils.paginationHandler");
jQuery.sap.require("sap.apf.ui.representations.BaseUI5ChartRepresentation");
(function() {
	'use strict';
	var oTable, selectedRowScrollTop = 0;
	//select the items in the table which are passed as parameter
	function _selectItemsInTable(aSelectedItems) {
		aSelectedItems.forEach(function(item) {
			oTable.addSelectionInterval(item, item);
		});
	}
	function _findUniqueFilters(aValidatedFilters, aFilterFromTable) {
		var aCombinedFilters = aValidatedFilters.concat(aFilterFromTable);
		aCombinedFilters = aCombinedFilters.filter(function(filter, index, aCombinedFilters) {
			return aCombinedFilters.lastIndexOf(filter) === index;
		});
		return aCombinedFilters;
	}
	//clear the filters from the UI5Charthelper and also from APF filters
	function _clearFilters(oTableInstance) {
		oTableInstance.oApi.getActiveStep().getSelectedRepresentation().UI5ChartHelper.filterValues = []; // reset the filter values from table to the selected representation
		oTableInstance.UI5ChartHelper.filterValues = [];
		oTableInstance.aValidatedFilter = [];
		oTableInstance.aFiltersInTable = [];
	}
	//get the filter values from the filters for table print
	function _getFilterTermsFromPrintTableSelection(oTableInstance) {
		var aFilterTermsForPrint = oTableInstance.oApi.getActiveStep().getSelectedRepresentation().UI5ChartHelper.filterValues;
		var aFilterValuesForPrint = aFilterTermsForPrint.map(function(term) {
			return term[0];
		});
		return aFilterValuesForPrint;
	}
	//toggles the selection based on the event.
	function _getToggledSelection(sRequiredFilter, aCurrentSelectedItem, aFilterValues) {
		var newAddedFilters = [];
		var sCurrentRequiredFilter = oTable.getContextByIndex(aCurrentSelectedItem[0]).getProperty(sRequiredFilter);
		if ((oTable.isIndexSelected(aCurrentSelectedItem[0])) && (newAddedFilters.indexOf(sCurrentRequiredFilter)) === -1) {
			newAddedFilters.push(sCurrentRequiredFilter); // if new item is selected, add it to the new added filter array
		} else {
			var indexOfToggledItem = aFilterValues.indexOf(sCurrentRequiredFilter);
			if (indexOfToggledItem !== -1) { // if item is deselected, find the index of item and remove it from array
				aFilterValues.splice(indexOfToggledItem, 1);
			}
		}
		return newAddedFilters;
	}
	//update the filter 
	function _updateFilters(oTableInstance, aFilterValues) {
		_clearFilters(oTableInstance); // clear the filters first, so that older values are not retained on the UI5ChartHelper filter values
		oTableInstance.filter = oTableInstance.UI5ChartHelper.getFilterFromSelection(aFilterValues);
		oTableInstance.oApi.getActiveStep().getSelectedRepresentation().UI5ChartHelper.filterValues = [];
		aFilterValues.forEach(function(value) {
			oTableInstance.oApi.getActiveStep().getSelectedRepresentation().UI5ChartHelper.filterValues.push([ value ]);
		});
		oTableInstance.aFiltersInTable = aFilterValues;
		oTableInstance.oApi.selectionChanged(); // trigger the selection change event
	}
	//get all the selected items in the table based on the required filter
	function _getAllSelectionInTable(oAllItemsInTable, sRequiredFilterProperty, aFilterValues) {
		var aSelectedIndex = [];
		oAllItemsInTable.forEach(function(item, index) { // selection in table which are based on the result filter values
			var reqFilterValue = item[sRequiredFilterProperty];
			if (aFilterValues.indexOf(reqFilterValue) !== -1) {
				aSelectedIndex.push(index);
			}
		});
		return aSelectedIndex;
	}
	//read the filters and select the rows in table. Also read the selected items where selection is enabled, creates the filters from selections
	function _drawSelection(oEvent) {
		var sRequiredFilterProperty;
		var aRequiredFilter = this.oParameter.requiredFilters;
		var isUserInteraction = oEvent.getParameter("userInteraction");
		var aCurrentSelectedItem = oEvent.getParameter("rowIndices"); // store the current selected item for which selection event is triggered
		if (oEvent.getSource().getFocusDomRef() && oEvent.getSource().getFocusDomRef().offsetTop !== 0) { //if row is selected, get the scroll position
			selectedRowScrollTop = jQuery(".sapUiTableVSb").prop("scrollTop");
		}
		if (!isUserInteraction || aCurrentSelectedItem.length === 0) {
			return;
		}
		sRequiredFilterProperty = aRequiredFilter && (aRequiredFilter.length > 0) ? aRequiredFilter[0] : undefined; //read the required filter from the internal filter or the required filters (when table is created, the internal filter wont be available)  
		var newAddedFilters = _getToggledSelection(sRequiredFilterProperty, aCurrentSelectedItem, this.aFiltersInTable);
		_updateFilters(this, this.aFiltersInTable.concat(newAddedFilters));
	}
	//reads the filters and selects the rows in print of table
	function _drawSelectionForPrint(oTableInstance, oPrintTable) {
		var aRequiredFilter = oTableInstance.oParameter.requiredFilters;
		var sRequiredFilterProperty = aRequiredFilter && (aRequiredFilter.length > 0) ? aRequiredFilter[0] : undefined; //read the required filter from the internal filter or the required filters (when table is created, the internal filter wont be available)  
		var aFilterValues = _getFilterTermsFromPrintTableSelection(oTableInstance);
		var oAllItemsInTable = oPrintTable.getModel().getData().tableData;
		var aSelectedListItems = [];
		oAllItemsInTable.forEach(function(item, index) {
			if (aFilterValues.indexOf(item[sRequiredFilterProperty]) !== -1) {
				aSelectedListItems.push(index);
			}
		});
		var selectionMode = (aRequiredFilter && (aRequiredFilter.length > 0)) ? "MultiToggle" : "None";
		oPrintTable.setSelectionMode(selectionMode);
		//For highlight selected rows in printlayout table (Because checboxes are not visible in printlayout)
		oPrintTable.onAfterRendering = function() {
			aSelectedListItems.forEach(function(index) {
				oPrintTable.getRows()[index].$().addClass("sapTableSelectionForPrint");
			});
		};
	}
	function _sortTableData(oSortOption, oTableInstance) {
		var sorter = [];
		sorter.push(new sap.ui.model.Sorter(oSortOption.property, oSortOption.descending));
		oTableInstance.oTableRepresentation.getBinding("rows").sort(sorter); // sort the data in the table 
	}
	//creates the table and binds the columns to it. Also formats the cell value based on the metadata.
	function _createTableAndBindColumns(tableColumns, oStepTitle, oTableInstance) {
		var oFormatter = new sap.apf.ui.utils.formatter({ // formatter for the value formatting
			getEventCallback : oTableInstance.oApi.getEventCallback.bind(oTableInstance.oApi),
			getTextNotHtmlEncoded : oTableInstance.oApi.getTextNotHtmlEncoded,
			getExits : oTableInstance.oApi.getExits()
		}, oTableInstance.metadata, oTableInstance.aDataResponse);
		var formatCellValue = function(index) {
			return function(columnValue) {
				if (oTableInstance.metadata !== undefined) {
					var formatedColumnValue;
					if (tableColumns.value[index] && columnValue) {
						formatedColumnValue = oFormatter.getFormattedValue(tableColumns.value[index], columnValue);
						if (formatedColumnValue !== undefined) {
							return formatedColumnValue;
						}
					}
				}
				return columnValue;
			};
		};
		//Creating Table.
		var oTable = new sap.ui.table.Table({
			showNoData : false,
			title : oStepTitle,
			enableSelectAll : false,
			visibleRowCount : 15
		});
		var aRequiredFilter = oTableInstance.oParameter.requiredFilters;
		var selectionMode = (aRequiredFilter && (aRequiredFilter.length > 0)) ? "MultiToggle" : "None";
		oTable.setSelectionMode(selectionMode);
		//Adding the columns headers ,column data to table and custom data for view setting dialog.
		var columnForDataTable = [], oControl, oColumn, customDataForColumnText;
		for( var indexTableColumn = 0; indexTableColumn < tableColumns.name.length; indexTableColumn++) {
			oControl = new sap.m.Text().bindText(tableColumns.value[indexTableColumn], formatCellValue(indexTableColumn), sap.ui.model.BindingMode.OneWay);
			oColumn = new sap.ui.table.Column({
				label : new sap.m.Label({
					text : tableColumns.name[indexTableColumn]
				}),
				template : oControl,
				tooltip : tableColumns.name[indexTableColumn]
			});
			customDataForColumnText = new sap.ui.core.CustomData({
				value : {
					text : tableColumns.name[indexTableColumn],
					key : tableColumns.value[indexTableColumn]
				}
			});
			oColumn.addCustomData(customDataForColumnText);
			columnForDataTable.push(oColumn);
		}
		//Adding all columns to table.
		var aColumns;
		aColumns = columnForDataTable;
		aColumns.forEach(function(column) {
			oTable.addColumn(column);
		});
		if (columnForDataTable.length > 10) {
			oTable.getColumns().forEach(function(oColumn) { // Columns > 10, horizontal scroll should come in table
				oColumn.setWidth("125px");// since the chart width is 1000px ,hence setting the columns  width based on it.
			});
		}
		//Create a JSONModel, fill in the data and bind the Table to this model.
		var oModelForTable = new sap.ui.model.json.JSONModel();
		oModelForTable.setSizeLimit(10000);
		var aTableData = oTableInstance.getData();
		oModelForTable.setData({
			tableData : aTableData
		});
		oTable.setModel(oModelForTable);
		oTable.bindRows("/tableData");
		_setVisibleRowCountInTable(oTable);
		if (oTableInstance.metadata !== undefined) {// aligning amount fields
			for( var fieldIndex = 0; fieldIndex < tableColumns.name.length; fieldIndex++) {
				var oMetadata = oTableInstance.metadata.getPropertyMetadata(tableColumns.value[fieldIndex]);
				if (oMetadata.unit) {
					var amountCol = oTable.getColumns()[fieldIndex];
					amountCol.setHAlign(sap.ui.core.TextAlign.Right);
				}
			}
		}
		return oTable;
	}
	function _setVisibleRowCountInTable(oTable) {
		var nTableDataLength = oTable.getModel().getData().tableData.length;
		var totalHeightForTable;
		if (jQuery('.chartContainer').height()) {
			totalHeightForTable = jQuery('.chartContainer').height() - (jQuery(".chartContainer > div :first-child").height() + 120);
		}
		var oVisibleRowCount = (totalHeightForTable > 0) ? totalHeightForTable / 32 : 15; // calculating the no of rows to display in table based on the row height 
		var nVisibleRowInTable = Math.floor(oVisibleRowCount);
		if (nTableDataLength < 15 || oVisibleRowCount > nTableDataLength) {
			nVisibleRowInTable = nTableDataLength;
		}
		oTable.setVisibleRowCount(nVisibleRowInTable);
	}
	function _adjustTableHeightAndVisibleRow(oContainer) {
		var scrollContainerHeight, offsetTop;
		jQuery(".scrollContainer > div:first-child").css({// For IE-Full width for alternate representation
			"display" : "table",
			"width" : "inherit"
		});
		if (offsetTop === undefined) {
			offsetTop = jQuery(".tableRepresentation").offset().top;
		}
		if (jQuery(".tableRepresentation").offset().top !== offsetTop) {// fullscreen
			scrollContainerHeight = ((window.innerHeight - jQuery('.tableRepresentation').offset().top)) + "px";
		} else {
			scrollContainerHeight = ((window.innerHeight - jQuery('.tableRepresentation').offset().top) - (jQuery(".applicationFooter").height())) + "px";
		}
		document.querySelector('.tableRepresentation').style.cssText += "height : " + scrollContainerHeight;
		sap.ui.Device.orientation.attachHandler(function() {// for height issue on orientation change
			oContainer.rerender();
		});
		jQuery(".sapUiTableVSb").animate({ //Scroll to the recently selected row
			scrollTop : selectedRowScrollTop
		}, 0);
		selectedRowScrollTop = 0;
	}
	function _getAvailableFilterInTableData(oTableInstance) {
		var aTableData = oTableInstance.getData();
		if (oTableInstance.oParameter.requiredFilters !== undefined) {
			var aTotalDataWithRequiredFilter = aTableData.map(function(tableRow) {
				return tableRow[oTableInstance.oParameter.requiredFilters[0]];
			});
			oTableInstance.aFiltersInTable.forEach(function(selection, index) {
				if (aTotalDataWithRequiredFilter.indexOf(selection) === -1 && oTableInstance.aFiltersInTable.indexOf(selection) !== -1) {
					oTableInstance.aFiltersInTable.splice(index, 1);
					oTableInstance.UI5ChartHelper.filterValues.splice(index, 1);
				}
			});
		}
	}
	/**
	* @description creates the column structure for the table which has the name and value. Also appends the unit of the column in the header of the table.
	* returns oColumnData - oColumnData has name and value of each column which has to be formed in the table.
	*                 e.g. oColumnData = {
	*                                      name : ["column1","column2"],
	*                                      value :["value1","value2"] 
	*                                     }
	*/
	function _getColumnFromProperties(oTableInstance) {
		var aTableData = oTableInstance.getData();
		var aProperties = [];
		var oColumnData = {
			name : [],
			value : []
		};
		aProperties = oTableInstance.oParameter.dimensions.concat(oTableInstance.oParameter.measures).length ? oTableInstance.oParameter.dimensions.concat(oTableInstance.oParameter.measures) : oTableInstance.parameter.properties; // read the table properties if available , else Concatenate dimensions & measures
		if (aTableData.length !== 0) {
			for( var i = 0; i < aProperties.length; i++) {
				oColumnData.value[i] = aProperties[i].fieldName;
				var name = "";
				var defaultLabel = oTableInstance.metadata.getPropertyMetadata(aProperties[i].fieldName).label || oTableInstance.metadata.getPropertyMetadata(aProperties[i].fieldName).name;// read the label of the property and assign it to the column
				var sUnitValue = "";
				if (oTableInstance.metadata !== undefined && oTableInstance.metadata.getPropertyMetadata(aProperties[i].fieldName).unit !== undefined) {
					var sUnitReference = oTableInstance.metadata.getPropertyMetadata(aProperties[i].fieldName).unit; // read the unit of the data in one column
					sUnitValue = oTableInstance.getData()[0][sUnitReference]; // take value of unit from first data set
					name = aProperties[i].fieldDesc === undefined || !oTableInstance.oApi.getTextNotHtmlEncoded(aProperties[i].fieldDesc).length ? defaultLabel + " (" + sUnitValue + ")" : oTableInstance.oApi
							.getTextNotHtmlEncoded(aProperties[i].fieldDesc)
							+ " (" + sUnitValue + ")"; // append the unit to the label 
					oColumnData.name[i] = name;
				} else { // if there is no unit, just display the label of the column
					oColumnData.name[i] = aProperties[i].fieldDesc === undefined || !oTableInstance.oApi.getTextNotHtmlEncoded(aProperties[i].fieldDesc).length ? defaultLabel : oTableInstance.oApi.getTextNotHtmlEncoded(aProperties[i].fieldDesc);
				}
			}
		}
		return oColumnData;
	}
	function _getSelectedSortItemById(oViewSettingDialog) {
		var sSortItemKey;
		var oSelectedSortItem = oViewSettingDialog.getSelectedSortItem();
		oViewSettingDialog.getSortItems().forEach(function(oSortItem) {
			if (oSortItem.getId() === oSelectedSortItem) {
				sSortItemKey = oSortItem.getKey();
			}
		});
		return sSortItemKey;
	}
	/**
	* @class table constructor.
	* @param oApi,oParameters
	* defines parameters required for chart such as Dimension/Measures.
	* @returns table object
	*/
	sap.apf.ui.representations.table = function(oApi, oParameters) {
		this.oViewSettingDialog = undefined;
		this.aDataResponse = [];// getData in the base class reads the value of data response from this
		this.aValidatedFilter = [];
		this.aFiltersInTable = [];
		this.oParameter = oParameters;
		this.orderby = oParameters.orderby;
		sap.apf.ui.representations.BaseUI5ChartRepresentation.apply(this, [ oApi, oParameters ]);
		this.alternateRepresentation = oParameters.alternateRepresentationType;
		this.type = sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION; //the type is read from step toolbar and step container
		this.oPaginationHandler = new sap.apf.ui.representations.utils.PaginationHandler(this);//initialize the pagination handler
	};
	sap.apf.ui.representations.table.prototype = Object.create(sap.apf.ui.representations.BaseUI5ChartRepresentation.prototype);
	sap.apf.ui.representations.table.prototype.constructor = sap.apf.ui.representations.table;// Set the "constructor" property to refer to table
	/**
	* @method setData
	* @param aDataResponse - Response from oData service
	* @param metadata - Metadata of the oData service
	* @description Public API which Fetches the data from oData service and updates the selection if present
	*/
	sap.apf.ui.representations.table.prototype.setData = function(aDataResponse, metadata, nDataResponseCount, aValidatedFilters) {
		var self = this;
		if (aValidatedFilters && aValidatedFilters.length > 0) {
			this.aValidatedFilter = [];
			var sRequiredFilterProperty = this.oParameter.requiredFilters[0];
			aValidatedFilters.forEach(function(filter) {
				self.aValidatedFilter.push(filter[sRequiredFilterProperty]);
			});
		}
		var skip = this.oPaginationHandler.getPagingOption().skip;
		this.nDataResponseCount = nDataResponseCount;
		if (skip === undefined || skip === 0) { //if data is getting fetched for the first time and no data has to be skipped
			this.aDataResponse = aDataResponse;// For new table, read only 100 data set
		} else { //if pagination is triggered , only 10 data has to be fetched and appended to the existing data set
			aDataResponse.map(function(dataRow) {
				self.aDataResponse.push(dataRow);// for pagination , append the data to the existing data set
			});
		}
		if (!metadata) {
			this.oMessageObject = this.oApi.createMessageObject({
				code : "6004",
				aParameters : [ this.oApi.getTextNotHtmlEncoded("step") ]
			});
			this.oApi.putMessage(this.oMessageObject);
		} else { //if metadata is available
			this.metadata = metadata; // assign the metadata to be used in the table representation
			this.UI5ChartHelper.metadata = metadata;
		}
		_getAvailableFilterInTableData(this);
	};
	sap.apf.ui.representations.table.prototype.getSelectionFromChart = function() {
		var aSelection = oTable.getSelectedIndices();
		return aSelection;
	};
	sap.apf.ui.representations.table.prototype.getFilter = function() {
		this.filter = this.UI5ChartHelper.getFilterFromSelection(this.aFiltersInTable);
		return this.filter;
	};
	sap.apf.ui.representations.table.prototype.getSelections = function() {
		var oSelectionObject = [], self = this;
		var aValidatedFilters = (this.aValidatedFilter && this.aValidatedFilter.length > 0) ? this.aValidatedFilter : [];
		if (this.oApi.getActiveStep() !== undefined) {
			this.oApi.getActiveStep().getSelectedRepresentation().UI5ChartHelper.filterValues.forEach(function(aFilter) {
				if (self.aFiltersInTable.indexOf(aFilter[0]) === -1) {
					self.aFiltersInTable.push(aFilter[0]);
				}
			});
		}
		var aSelectedItemInTable = _findUniqueFilters(aValidatedFilters, this.aFiltersInTable);
		aSelectedItemInTable.forEach(function(selection) {
			oSelectionObject.push({
				id : selection,
				text : selection
			});
		});
		return oSelectionObject;
	};
	/**
	* @method markSelectionInTable
	* @description Public API which is called after rendering of table and also after pagination to mark the selection
	*/
	sap.apf.ui.representations.table.prototype.markSelectionInTable = function(bIsCalledFromTable) {
		var aSelectedIndicesInSortedTable = [];
		var aSelectedFilter = this.aFiltersInTable;
		if (!bIsCalledFromTable && !this.oParameter.isAlternateRepresentation) {
			aSelectedFilter = this.aValidatedFilter ? this.aValidatedFilter : [];
		}
		var aSelectedIndicesInTable = _getAllSelectionInTable(this.aDataResponse, this.oParameter.requiredFilters, aSelectedFilter);
		if (this.oParameter.isAlternateRepresentation) {
			var aSortedIndicesInAlternateTable = this.oTableRepresentation.getBinding().aIndices;
			aSelectedIndicesInTable.forEach(function(selectedItem) {
				aSelectedIndicesInSortedTable.push(aSortedIndicesInAlternateTable.indexOf(selectedItem));
			});
			aSelectedIndicesInTable = aSelectedIndicesInSortedTable;
		}
		if (aSelectedFilter.length > 0) { //  if there are any filters ,mark the selection in table filter values
			this.oTableRepresentation.clearSelection();
			_selectItemsInTable(aSelectedIndicesInTable);
		}
	};
	sap.apf.ui.representations.table.prototype.getRequestOptions = function(bFilterChanged) {
		if (bFilterChanged) { // When the filter is changed, then paging option is reset to default.
			this.oPaginationHandler.resetPaginationOption();
		}
		var requestObj = {
			paging : this.oPaginationHandler.getPagingOption(this.oParameter.top),
			orderby : []
		};
		//table can have the sort property defined in the parameter or the sort property can be changed from view setting dialog
		if (this.orderby && this.orderby.length) { //else read it from the parameter
			var orderByArray = this.orderby.map(function(oOrderby) {
				return {
					property : oOrderby.property,
					descending : !oOrderby.ascending
				};
			});
			requestObj.orderby = orderByArray;
		}
		if (this.oViewSettingDialog) {
			var oSortOptionFromViewSetting = {
				property : _getSelectedSortItemById(this.oViewSettingDialog),
				descending : this.oViewSettingDialog.getSortDescending()
			};
			requestObj.orderby = [ oSortOptionFromViewSetting ];//if the sort property is changed from view setting
		}
		return requestObj;
	};
	/**
	* @method resetPaginationForTable
	* @description calls the method from pagination handler to resets the paging option to default when there filter change in the path 
	*/
	sap.apf.ui.representations.table.prototype.resetPaginationForTable = function() {
		this.oPaginationHandler.resetPaginationOption();
	};
	/**
	* @method getMainContent
	* @param oStepTitle - title of the main chart
	* @param width - width of the main chart
	* @param height - height of the main chart       
	 * @description draws Main chart into the Chart area
	*/
	sap.apf.ui.representations.table.prototype.getMainContent = function(oStepTitle, height, width) {
		var self = this;
		var aTableData = this.getData();
		var tableFields = this.oParameter.dimensions.concat(this.oParameter.measures).length ? this.oParameter.dimensions.concat(this.oParameter.measures) : this.oParameter.properties; // read the table properties if available , else Concatenate dimensions & measures
		var tableColumns = _getColumnFromProperties(this);
		var oMessageObject;
		if (!oStepTitle) {
			oMessageObject = this.oApi.createMessageObject({
				code : "6002",
				aParameters : [ "title", this.oApi.getTextNotHtmlEncoded("step") ]
			});
			this.oApi.putMessage(oMessageObject);
		}
		if (tableFields.length === 0) {
			oMessageObject = this.oApi.createMessageObject({
				code : "6002",
				aParameters : [ "dimensions", oStepTitle ]
			});
			this.oApi.putMessage(oMessageObject);
		}
		if (!aTableData || aTableData.length === 0) {
			oMessageObject = this.oApi.createMessageObject({
				code : "6000",
				aParameters : [ oStepTitle ]
			});
			this.oApi.putMessage(oMessageObject);
		}
		var chartWidth = (width || 1000) + "px";
		oTable = _createTableAndBindColumns(tableColumns, oStepTitle, this);
		oTable.attachRowSelectionChange(_drawSelection.bind(self));
		this.oTableRepresentation = oTable; // the table is accessed from the view setting. To sort the data and set the table to busy
		var containerForTable = new sap.m.ScrollContainer({ // Scroll container to hold table with headers
			content : [ oTable ],
			width : chartWidth,
			horizontal : false
		}).addStyleClass("tableRepresentation");
		containerForTable.addStyleClass("sapUiSizeCompact");
		oTable.addEventDelegate({//Event delegate to bind pagination action
			onAfterRendering : function() {
				if (self.oViewSettingDialog && self.oParameter.isAlternateRepresentation) {
					var oSortOptionFromViewSetting = {
						property : _getSelectedSortItemById(self.oViewSettingDialog),
						descending : self.oViewSettingDialog.getSortDescending()
					};
					_sortTableData(oSortOptionFromViewSetting, self);
				}
				self.markSelectionInTable(true);
				_setVisibleRowCountInTable(oTable);
				_adjustTableHeightAndVisibleRow(containerForTable);
				//if top N not is provided and table is not an alternate representation, attach the pagination event
				if (!self.oParameter.top && !self.oParameter.isAlternateRepresentation && self.nDataResponseCount > 100) {
					self.oPaginationHandler.attachPaginationOnTable(self);
				}
			}
		});
		return containerForTable;
	};
	/**
	* @method getThumbnailContent
	* @description draws Thumbnail for the current chart
	* @returns thumbnail object for column
	*/
	sap.apf.ui.representations.table.prototype.getThumbnailContent = function() {
		var oThumbnailContent;
		var aTableData = this.getData();
		var oIconForAlternateRep = this.oParameter.isAlternateRepresentation ? "sap-icon://table-view" : "sap-icon://table-chart";
		if (aTableData !== undefined && aTableData.length !== 0) {
			var oTableIcon = new sap.ui.core.Icon({
				src : oIconForAlternateRep,
				size : "70px"
			}).addStyleClass('thumbnailTableImage');
			oThumbnailContent = oTableIcon;
		} else {
			var noDataText = new sap.m.Text({
				text : this.oApi.getTextNotHtmlEncoded("noDataText")
			}).addStyleClass('noDataText');
			oThumbnailContent = new sap.ui.layout.VerticalLayout({
				content : noDataText
			});
		}
		return oThumbnailContent;
	};
	/**
	* @method removeAllSelection
	* @description removes all Selection from Chart
	*/
	sap.apf.ui.representations.table.prototype.removeAllSelection = function() {
		_clearFilters(this);
		oTable.clearSelection();
		this.oApi.selectionChanged();
	};
	/**
	* @method getPrintContent
	* @param oStepTitle
	* title of the step
	* @description gets the printable content of the representation
	*/
	sap.apf.ui.representations.table.prototype.getPrintContent = function(oStepTitle) {
		var tableColumnsForPrint = _getColumnFromProperties(this), oPrintObject;
		var oPrintTable = _createTableAndBindColumns(tableColumnsForPrint, oStepTitle, this);
		oPrintTable.setTitle(oStepTitle);
		oPrintTable.getColumns().forEach(function(column) {
			column.setWidth("auto");//auto witdh set for print preview for table column
		});
		oPrintTable.setVisibleRowCount(oPrintTable.getModel().getData().tableData.length);
		_drawSelectionForPrint(this, oPrintTable);// set the selections on table
		oPrintObject = {
			oRepresentation : oPrintTable
		};
		return oPrintObject;
	};
	sap.apf.ui.representations.table.prototype.createViewSettingDialog = function() {
		var oSelectedSortItem;
		if (this.oViewSettingDialog) { //retain the sort property and destroy the dialog so that sort works (otherwise the data does not sort)
			oSelectedSortItem = {
				oSortProperty : _getSelectedSortItemById(this.oViewSettingDialog),
				isDescending : this.oViewSettingDialog.getSortDescending()
			};
			this.oViewSettingDialog.destroy();
		}
		var oViewData = {
			oSelectedSortItem : oSelectedSortItem,
			oTableInstance : this
		};
		var oViewSetting = new sap.ui.view({
			type : sap.ui.core.mvc.ViewType.JS,
			viewName : "sap.apf.ui.reuse.view.viewSetting",
			viewData : oViewData
		});
		this.oViewSettingDialog = oViewSetting.getContent()[0];
		this.oViewSettingDialog.addStyleClass("sapUiSizeCompact");
		return this.oViewSettingDialog;
	};
	/**
	* @method serialize
	* @description Getter for Serialized data for a representation
	* @returns selectionObject
	*/
	sap.apf.ui.representations.table.prototype.serialize = function() {
		return {
			oFilter : this.aFiltersInTable,
			bIsAlternateView : this.bIsAlternateView
		};
	};
	/**
	* @method deserialize
	* @description This method uses selection object from serialized data and sets the selection to representation
	*/
	sap.apf.ui.representations.table.prototype.deserialize = function(oSerializable) {
		this.aFiltersInTable = oSerializable.oFilter;
		this.bIsAlternateView = oSerializable.bIsAlternateView;
	};
	/**
	* @method destroy
	* @description Destroying instance level variables
	*/
	sap.apf.ui.representations.table.prototype.destroy = function() {
		if (this.UI5ChartHelper) {
			this.UI5ChartHelper.filterValues = [];
			this.UI5ChartHelper.destroy();
			this.UI5ChartHelper = null;
		}
		if (this.orderby) {
			this.orderby = null;
		}
		if (this.oParameter) {
			this.oParameter = null;
		}
		if (this.oViewSettingDialog) {
			this.oViewSettingDialog.destroy();
		}
		if (this.aDataResponse) {
			this.aDataResponse = null;
		}
		if (this.aValidatedFilter) {
			this.aValidatedFilter = [];
		}
		if (this.aFiltersInTable) {
			this.aFiltersInTable = [];
		}
	};
}());