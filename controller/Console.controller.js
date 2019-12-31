sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";
 
	var PageController = Controller.extend("UI5FioriForTools.controller.Console", {
		onInit : function (evt) {
			/*	---------------------------------------------------------------------	*/
			/* 	------------------------ Initialize Model ---------------------------	*/
			/*	---------------------------------------------------------------------	*/
			var client = new XMLHttpRequest();
			client.open('GET', 'model/code/BlockLayout.txt');
			client.onreadystatechange = function() {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					string: client.responseText,
					type: "text"
				});
				sap.ui.getCore().setModel(oModel, "code");	
			}
			client.send();

		},

		onAfterRendering : function () {
			/*	---------------------------------------------------------------------	*/
			/* 	---------------------- Force Resizing of ACE ------------------------	*/
			/*	---------------------------------------------------------------------	*/
			/*document.getElementById("__splitter3-splitbar-1").addEventListener("dragstart", function( event ) {
				alert(event.target);
			});*/
		}
	});
 
	return PageController;
 
});