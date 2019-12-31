/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
(function() {
	'use strict';
	var oSelectedRepresentation, oViewSettingDialog;
	/**
	* @description sorts the data in the table representation
	*/
	function _sortTableData(oSortOption) {
		var sorter = [];
		sorter.push(new sap.ui.model.Sorter(oSortOption.property, oSortOption.descending));
		oSelectedRepresentation.oTableRepresentation.getBinding("rows").sort(sorter); // sort the data in the table 
	}
	/**
	* @description update path is called which sets the sorted data in the main table representation
	* @param it takes a function callback as parameter which needs to be executed after update path is called
	*/
	function _updatePathForTableRepresentation(callbackAfterUpdatePath) {
		oSelectedRepresentation.resetPaginationForTable();
		oSelectedRepresentation.oApi.updatePath(function(oStep, bStepChanged) { // if it is table representation
			if (oStep === oSelectedRepresentation.oApi.getActiveStep()) {
				oSelectedRepresentation.oTableRepresentation.getModel().setData({ // update the data in the table with the sorted data
					tableData : oSelectedRepresentation.aDataResponse
				});
				callbackAfterUpdatePath();
			}
		});
	}
	/**
		* Creates the sort option for the representation.      
		* @description sets the selected sort item on the view setting dialog. Selects the first property in case the default property has to be selected
		* @param oPreviousSelectedSortItem - the sort property which was selected on the view setting dialog and needs to be retained
		*/
	function _selectSortItemOnViewSettingDialog(oPreviousSelectedSortItem) {
		var oSelectedSortItem = {}, isDescending;
		if (oSelectedRepresentation.orderby && oSelectedRepresentation.orderby.length) { // if the orderby is configured, select the option in the view setting dialog
			oSelectedSortItem = oSelectedRepresentation.orderby[0].property;
			isDescending = !oSelectedRepresentation.orderby[0].ascending;
		} else {
			oSelectedSortItem = oViewSettingDialog.getSortItems()[0];//Default sort property
			isDescending = false;
		}
		if (oPreviousSelectedSortItem !== undefined) { // if the sort property for table is changed from view setting dialog.  
			oSelectedSortItem = oPreviousSelectedSortItem.oSortProperty;
			isDescending = oPreviousSelectedSortItem.isDescending;
		}
		oViewSettingDialog.setSelectedSortItem(oSelectedSortItem);
		oViewSettingDialog.setSortDescending(isDescending);
	}
	function _bIsSortoptionChanged(oSortEvent) {
		var bIsSortOptionChanged = true;
		var oPreviousSortOption = {
			property : oSortEvent.oSource._oPreviousState.sortItem.getKey(),
			descending : oSortEvent.oSource._oPreviousState.sortDescending
		};
		var oCurrentSortOption = {
			property : oSortEvent.getParameters().sortItem.getKey(), // read the sort property and sort order
			descending : oSortEvent.getParameters().sortDescending
		};
		if (oPreviousSortOption.property === oCurrentSortOption.property && oPreviousSortOption.descending === oCurrentSortOption.descending) {
			bIsSortOptionChanged = false;
		}
		return bIsSortOptionChanged;
	}
	function _updateTableSelectionAndBusyState() {
		oSelectedRepresentation.markSelectionInTable();
		oSelectedRepresentation.oTableRepresentation.getParent().setBusy(false); // set the table to busy
	}
	sap.ui.controller("sap.apf.ui.reuse.controller.viewSetting", {
		/**
		* @method onInit - lifecycle event 
		* @description reads the selected representation and alternate representation (if any) from the view data.
		* Also sets the sort property and sort order on the view setting dialog
		*/
		onInit : function() {
			var oController = this;
			oViewSettingDialog = oController.getView().getContent()[0];
			oSelectedRepresentation = oController.getView().getViewData().oTableInstance;
			var oSelectedSortItem = oController.getView().getViewData().oSelectedSortItem ? oController.getView().getViewData().oSelectedSortItem : undefined;
			_selectSortItemOnViewSettingDialog(oSelectedSortItem); //select the first sort item in case orderby is not available or the previous selected property should be retained (if any)
		},
		/**
		* @method handleConfirmForSort
		* @description handler for the sort property change on press of ok in view setting dialog.
		* Reads the sort property from the event and sorts the data in the table as well as in alternate representation
		*/
		handleConfirmForSort : function(oSortEvent) {
			if (!_bIsSortoptionChanged(oSortEvent)) {
				return;
			}
			var oCurrentSortOption = {
				property : oSortEvent.getParameters().sortItem.getKey(), // read the sort property and sort order
				descending : oSortEvent.getParameters().sortDescending
			};
			oSelectedRepresentation.oTableRepresentation.getParent().setBusy(true); // set the table to busy
			if (oCurrentSortOption.property) { // if there is sort item , table should be updated with the sorted data
				if (oSelectedRepresentation.oParameter.isAlternateRepresentation) { // if it is alternate table
					_sortTableData(oCurrentSortOption);
					_updateTableSelectionAndBusyState();
				} else {
					_updatePathForTableRepresentation(function() {
						_updateTableSelectionAndBusyState();
					});
				}
			}
		}
	});
}());