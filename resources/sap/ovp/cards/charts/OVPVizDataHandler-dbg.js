sap.ui.define(["sap/ui/core/Control"], function(Control) {
	"use strict";
	return Control.extend("sap.ovp.cards.charts..OVPVizDataHandler", {
		metadata : {
			aggregations : {
				data : {
					type : "sap.ui.core.Element"
				},
				content : {
					multiple : false
				}
			},
			properties : {
				chartType : { defaultValue : false },
				scale : { defaultValue : "" }
			}
		},
		renderer : function(r, c) {
			r.write("<div");
			r.writeElementData(c);
			r.write(">");
			if (c.getContent()) {
				r.renderControl(c.getContent());
			}
			r.write("</div>");
		},
		updateBindingContext : function() {
			var b = this.getBinding("data");
			var that = this;
			if (this.bindingC == b) {
				return;
			} else {
				this.bindingC = b;
				if (b) {
					var that = this;
					b.attachEvent("dataReceived", function(oEvent) {

						var oData = oEvent && oEvent.getParameter("data");
						var oDataClone = jQuery.extend(true, {}, oData);
						if (that.getChartType() == "donut" && oData.results.length > 0 && oData.results.length < oData.__count ) {
						that.readAggregateNumber(b,oData,function(result){
							oDataClone.results.push(result);
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oDataClone.results);
							that.getContent().setModel(oModel, "analyticalmodel");
						});
						} else {
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oData.results);
							that.getContent().setModel(oModel, "analyticalmodel");
						}
					});
				}
				Control.prototype.updateBindingContext.apply(this, arguments);
			}
		},

		readAggregateNumber : function(binding,oData,callback) {
			this.aggregate;
			var model = this.getModel();
			var parameters = binding.mParameters;
			var bData = jQuery.extend(true, {}, oData );
			var selectedProperties = parameters.select.split(",");
			var entitySetPath = binding.getPath().substring(1);
			var pos = -1;
			
			if ( entitySetPath ) {
				pos = entitySetPath.indexOf('Parameters');
			}
			if ( pos >= 0 ) {
				entitySetPath = entitySetPath.substr(0, entitySetPath.indexOf('Parameters'));
			}
			var metaModel = model.getMetaModel();
			var entityset = metaModel.getODataEntitySet(entitySetPath);
			var entityType = metaModel.getODataEntityType(entityset.entityType);
			var finalMeasures = [];
			var finalDimensions = [];
			for ( var i = 0; i < entityType.property.length; i++ ) { //as part of supporting V4 annotation
                if (entityType.property[i]["com.sap.vocabularies.Analytics.v1.Measure"] || (entityType.property[i].hasOwnProperty("sap:aggregation-role") && entityType.property[i]["sap:aggregation-role"] === "measure")) {
					if ( selectedProperties.indexOf(entityType.property[i].name) !== -1 ) {
						finalMeasures.push(entityType.property[i].name);
					}
				} else {
					if ( selectedProperties.indexOf(entityType.property[i].name) !== -1 ) {
						finalDimensions.push(entityType.property[i].name);
					}
				}
			}
			
			for (var i = 0;i < bData.results.length - 1;i++) {
				for (var j = 0;j < finalMeasures.length;j++) {
					bData.results[0][finalMeasures[j]] = Number(bData.results[0][finalMeasures[j]]) + Number(bData.results[i + 1][finalMeasures[j]]);
				}
			}
			var count = oData.__count - bData.results.length;
			var object = {};
			object.results = [];
			object.results[0] = bData.results[0];
			var context = {};
			context.urlParameters = [ binding.sFilterParams, "$select=" + finalMeasures.join(","),"$top=1" ];
			context.success = jQuery.proxy(function(aggregate) {
				var aggregateObject = jQuery.extend(true, {}, aggregate);
				jQuery.each(finalMeasures,function(i){
					aggregateObject.results[0][finalMeasures[i]] = String(Number(aggregate.results[0][finalMeasures[i]]) - Number(object.results[0][finalMeasures[i]]));
				});
				jQuery.each(finalDimensions,function(i){
					aggregateObject.results[0][finalDimensions[i]] = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("OTHERS_DONUT",[count]);
				});
				aggregateObject.results[0].$isOthers = true;
				//var cData = jQuery.extend(true, {}, oData);
				//cData.results.push(aggregate.results[0]);
				callback(aggregateObject.results[0]);
			}, this);
			model.read(binding.getPath(),context);
			}

	});
}, true);
