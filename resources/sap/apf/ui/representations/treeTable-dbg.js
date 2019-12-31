/* SAP APF Analysis Path Framework
* 
* (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
jQuery.sap.declare("sap.apf.ui.representations.treeTable");
jQuery.sap.require("sap.apf.core.constants");
jQuery.sap.require("sap.apf.ui.utils.formatter");
jQuery.sap.require("sap.apf.ui.representations.BaseUI5ChartRepresentation");
(function() {
	'use strict';
	var oTreeTable;
	function _createTreeTableAndBindColumns(aTreeTableColumns, oStepTitle, oTreeTableInstance) {
		var oFormatter = new sap.apf.ui.utils.formatter({ // formatter for the value formatting
			getEventCallback : oTreeTableInstance.oApi.getEventCallback.bind(oTreeTableInstance.oApi),
			getTextNotHtmlEncoded : oTreeTableInstance.oApi.getTextNotHtmlEncoded
		}, oTreeTableInstance.metadata, oTreeTableInstance.aDataResponse);
		var formatCellValue = function(columnValueToBeFormatted) {
			return function(columnValue) {
				if (oTreeTableInstance.metadata !== undefined) {
					var formatedColumnValue;
					if (columnValue) {
						formatedColumnValue = oFormatter.getFormattedValue(columnValueToBeFormatted, columnValue);
						if (formatedColumnValue !== undefined) {
							return formatedColumnValue;
						}
					}
				}
				return columnValue;
			};
		};
		oTreeTable = new sap.ui.table.TreeTable({ // Creating tree table
			showNoData : false,
			title : oStepTitle,
			enableSelectAll : false,
			selectionMode : sap.ui.table.SelectionMode.None
		});
		var aColumnForTreeTable = [], oColumnText, oTreeColumn;
		aTreeTableColumns.name.forEach(function(columnName, nColumnIndex) {
			oColumnText = new sap.m.Text().bindText(aTreeTableColumns.value[nColumnIndex], formatCellValue(aTreeTableColumns.value[nColumnIndex]), sap.ui.model.BindingMode.OneWay);
			oTreeColumn = new sap.ui.table.Column({
				label : new sap.m.Label({
					text : columnName
				}),
				template : oColumnText,
				tooltip : columnName
			});
			aColumnForTreeTable.push(oTreeColumn);
		});
		aColumnForTreeTable.forEach(function(column) { //Adding all columns to tree table.
			oTreeTable.addColumn(column);
		});
		oTreeTableInstance.oTreeTableModel.attachBatchRequestCompleted(function() { //Once the batch request is completed, busy indicator is set to false
			_setVisibleRowCountInTreeTable();
			if (oTreeTable.getParent().getParent()) {
				oTreeTable.getParent().getParent().getParent().getParent().setBusy(false);
			}
		});
		oTreeTable.setModel(oTreeTableInstance.oTreeTableModel); // set model to tree table
		oTreeTable.bindRows(oTreeTableInstance.oTreeTableControlObject);
		return oTreeTable;
	}
	function _setVisibleRowCountInTreeTable() { //set visible rows count in tree table according to the height available
		var totalHeightForTreeTable;
		if (jQuery('.layoutView').height()) {
			totalHeightForTreeTable = jQuery('.chartContainer').height() - (jQuery(".chartContainer > div :first-child").height() + 120);
		}
		var oVisibleRowCount = (totalHeightForTreeTable > 0) ? totalHeightForTreeTable / 32 : 15;
		var nVisibleRow = Math.floor(oVisibleRowCount);
		oTreeTable.setVisibleRowCount(nVisibleRow);
	}
	/**
	* @description creates the column structure for the table which has the name and value. Also appends the unit of the column in the header of the table.
	* returns oColumnData - oColumnData has name and value of each column which has to be formed in the table.
	*                 e.g. oColumnData = {
	*                                      name : ["column1","column2"],
	*                                      value :["value1","value2"] 
	*                                     }
	*/
	function _getColumnFromProperties(oTreeTableInstance) {
		var oColumnData = {
			name : [],
			value : []
		};
		var aPropertiesForTreeTableColumns = oTreeTableInstance.oParameters.hierarchicalProperty.concat(oTreeTableInstance.oParameters.properties);
		aPropertiesForTreeTableColumns.forEach(function(property, index) {
			var defaultLabel = oTreeTableInstance.metadata.getPropertyMetadata(property.fieldName).label || oTreeTableInstance.metadata.getPropertyMetadata(property.fieldName).name;// read the label of the property 
			oColumnData.name[index] = property.fieldDesc === undefined || !oTreeTableInstance.oApi.getTextNotHtmlEncoded(property.fieldDesc).length ? defaultLabel : oTreeTableInstance.oApi.getTextNotHtmlEncoded(property.fieldDesc);
			oColumnData.value[index] = property.fieldName;
			if (property.fieldDesc) {
				oColumnData.name[index] = oTreeTableInstance.oApi.getTextNotHtmlEncoded(property.fieldDesc);
			}
		});
		return oColumnData;
	}
	/**
	* @class treetTable constructor.
	* @param oApi,oParameters
	* defines parameters required for chart such as Dimension/Measures.
	* @returns treeTable object
	*/
	sap.apf.ui.representations.treeTable = function(oApi, oParameters) {
		this.oParameters = oParameters;
		this.type = sap.apf.ui.utils.CONSTANTS.representationTypes.TREE_TABLE_REPRESENTATION;
		sap.apf.ui.representations.BaseUI5ChartRepresentation.apply(this, [ oApi, oParameters ]);
	};
	sap.apf.ui.representations.treeTable.prototype = Object.create(sap.apf.ui.representations.BaseUI5ChartRepresentation.prototype);
	sap.apf.ui.representations.treeTable.prototype.constructor = sap.apf.ui.representations.treeTable; // Set the constructor property to refer to tree table
	/**
	* @method getMainContent
	* @param oStepTitle - title of the main chart 
	* @param isTreeTableWindowResized - boolean value for window resize
	* @description draws Main chart into the Chart area
	*/
	sap.apf.ui.representations.treeTable.prototype.getMainContent = function(oStepTitle, isTreeTableWindowResized) {
		if (!isTreeTableWindowResized) {
			var aTreeTableColumns = _getColumnFromProperties(this);
			oTreeTable = _createTreeTableAndBindColumns(aTreeTableColumns, oStepTitle, this);
			oTreeTable.addEventDelegate({
				onAfterRendering : function() {
					_setVisibleRowCountInTreeTable();
				}
			});
		}
		var containerForTreeTable = new sap.m.ScrollContainer({ // Scroll container to hold tree table
			content : [ oTreeTable ],
			horizontal : false
		}).addStyleClass("treeTableRepresentation");
		containerForTreeTable.addStyleClass("sapUiSizeCompact");
		return containerForTreeTable;
	};
	/**
	 * @method updateTreetable
	 * @param controlObject - object for the tree table 
	 * @param oModel - model for tree table
	 * @param _bindTreeFunction - call back function to bind the properties of tree table
	 * @param oMetaData -  metadata for tree table
	 * @description updates the current tree table with updated control properties and model
	 */
	sap.apf.ui.representations.treeTable.prototype.updateTreetable = function(controlObject, oModel, updatePathFunction, oMetaData) {
		this.oTreeTableModel = oModel;
		this.oTreeTableControlObject = controlObject;
		this.metadata = oMetaData;
		updatePathFunction();
	};
	/**
	* @method getThumbnailContent
	* @description draws Thumbnail for the current chart
	* @returns thumbnail object for column
	*/
	sap.apf.ui.representations.treeTable.prototype.getThumbnailContent = function() {
		var oThumbnailContent;
		var oTableIcon = new sap.ui.core.Icon({
			src : "sap-icon://tree",
			size : "70px"
		}).addStyleClass('thumbnailTableImage');
		oThumbnailContent = oTableIcon;
		return oThumbnailContent;
	};
	/**
	* @method getPrintContent
	* @param oStepTitle - title of the step
	* @description gets the printable content of the representation
	*/
	sap.apf.ui.representations.treeTable.prototype.getPrintContent = function(oStepTitle) {
		var oTreeTableForPrint = oTreeTable.clone();
		var oPrintObject = {
			oRepresentation : oTreeTableForPrint
		};
		return oPrintObject;
	};
	/**
	* @method destroy
	* @description Destroying instance level variables
	*/
	sap.apf.ui.representations.treeTable.prototype.destroy = function() {
		if (this.oParameters) {
			this.oParameters = null;
		}
		if (this.oTreeTableModel) {
			this.oTreeTableModel = null;
		}
		if (this.oTreeTableControlObject) {
			this.oTreeTableControlObject = null;
		}
		if (this.metadata) {
			this.metadata = null;
		}
	};
}());