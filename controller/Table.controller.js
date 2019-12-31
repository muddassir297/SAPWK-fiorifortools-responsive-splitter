sap.ui.define([
  'sap/m/MessagePopover',
  'sap/m/MessagePopoverItem',
  'jquery.sap.global',
  'sap/ui/core/Fragment',
  'sap/ui/core/mvc/Controller',
  'sap/ui/model/json/JSONModel'
], function(MessagePopover, MessagePopoverItem, jQuery, Fragment, Controller, JSONModel, Popover, Button) {
  "use strict";

	return Controller.extend("UI5FioriForTools.controller.Table", {
		onInit: function (oEvent) {
			/*	---------------------------------------------------------------------	*/
			/* 	------------------------ Initialize Models --------------------------	*/
			/*	---------------------------------------------------------------------	*/
			var oModel2 = new JSONModel(jQuery.sap.getModulePath("UI5FioriForTools.model", "/files/BlockLayout.json"));
			sap.ui.getCore().setModel(oModel2, "file");

			var oModel3 = new JSONModel(jQuery.sap.getModulePath("UI5FioriForTools.model", "/todos/1.json"));
			sap.ui.getCore().setModel(oModel3, "todo");
		},

		onAfterRendering: function () {
			/*	---------------------------------------------------------------------	*/
			/* 	------------------- Select first Item in Table ----------------------	*/
			/*	---------------------------------------------------------------------	*/
			var oTable = this.getView().byId("idProductsTable");
			var firstItem = oTable.getItems()[0];
			oTable.setSelectedItem(firstItem, true);
		},

		onSelectionChange: function(evt){
			/*	---------------------------------------------------------------------	*/
			/* 	----------------- Apply changed Selection to Model  -----------------	*/
			/*	---------------------------------------------------------------------	*/
			var selectedRowNum = evt.getSource().indexOfItem(evt.getParameter("listItem"));
			var oData = sap.ui.getCore().getModel("file").getData();
			var selectedItem = oData.todos[selectedRowNum].id.replace(" ", "");

			var oModel3 = new JSONModel(jQuery.sap.getModulePath("UI5FioriForTools.model", "/todos/"+selectedItem+".json"));
			sap.ui.getCore().setModel(oModel3, "todo");

			/*	---------------------------------------------------------------------	*/
			/* 	----------- Automatic Navigation to SplitPage offCanvas  ------------	*/
			/*	---------------------------------------------------------------------	*/
			/*var buttons = document.getElementsByClassName('sapUiResponsiveSplitterPaginatorButtons')[0];
			var detailsButton = buttons.childNodes[2];
			console.log(detailsButton);
			detailsButton.click();*/
		}
	});
}, true)
