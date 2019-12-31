sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";
 
	var PageController = Controller.extend("UI5FioriForTools.controller.Tree", {
		onInit : function (evt) {
			/*	---------------------------------------------------------------------	*/
			/* 	------------------------ Initialize Model ---------------------------	*/
			/*	---------------------------------------------------------------------	*/
			var oModel = new JSONModel("model/tree.json");
			this.getView().setModel(oModel);
		},

		onAfterRendering: function () {
			/*	---------------------------------------------------------------------	*/
			/* 	--------------------- Select first Item in Tree ---------------------	*/
			/*	---------------------------------------------------------------------	*/
			var oTree = this.getView().byId("Tree");
			oTree.expandToLevel(3);
			var firstItem = oTree.getItems()[0];
			oTree.setSelectedItem(firstItem, true);
		},

		onSelectionChange : function (evt) {
			/*	---------------------------------------------------------------------	*/
			/* 	------------ Apply changed Selection to Models and Table ------------	*/
			/*	---------------------------------------------------------------------	*/
			var selectedFile = evt.getSource().getSelectedItem().getTitle();
			var selectedFileType=  evt.getSource().getSelectedItem().getBindingContext().getProperty("type");
			selectedFile = selectedFile.replace(" ", "");
			var oModel = new JSONModel(jQuery.sap.getModulePath("UI5FioriForTools.model", "/files/"+selectedFile+".json"));
			oModel.attachRequestCompleted(jQuery.proxy(function(){
				sap.ui.getCore().setModel(oModel, "file");
				var selectedTodo = oModel.getData().todos[0].id.replace(" ", "");
				var oModel3 = new JSONModel(jQuery.sap.getModulePath("UI5FioriForTools.model", "/todos/"+selectedTodo+".json"));
				sap.ui.getCore().setModel(oModel3, "todo");

				var filterMyNrDOM = $( "div[id$='idProductsTable']" );
				var oTable = sap.ui.getCore().byId(filterMyNrDOM[filterMyNrDOM.length-1].id);
				var firstItem = oTable.getItems()[0];
				oTable.setSelectedItem(firstItem, true);


				var client = new XMLHttpRequest();
				client.open('GET', 'model/code/' +selectedFile+ '.txt');
				client.onreadystatechange = function() {
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData({
						string: client.responseText,
						type: selectedFileType
					});
					sap.ui.getCore().setModel(oModel, "code");

					/*var ace = sap.ui.getCore().byId("__xmlview2--ace");
					console.log(ace);
					ace.setPosition(1,1,false);*/

				}
				client.send();
			},this));
		}
 
	});
 
	return PageController;
 
}); 