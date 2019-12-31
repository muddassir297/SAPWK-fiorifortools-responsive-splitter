(function() {
	"use strict";
	/*global sap, jQuery */

	sap.ui.controller("sap.ovp.cards.map.GeographicalMap", {

		onInit: function(evt) {
			/**
			 *If the state is 'Loading' or 'Error', we do not render the popover header. Hence, this is no oHeader.
			 */
			var sState = this.getView().mPreprocessors.xml[0].ovpCardProperties.oData.state;
			if (sState !== "Loading" && sState !== "Error") {
				var oHeader = this.getView().byId("popoverHeader");
				oHeader.attachBrowserEvent("click", this.onPopoverHeaderPress.bind(this, oHeader));

				// Attach the keyboard events so the you can navigate using Space and Return key
				oHeader.addEventDelegate({
					onkeydown: function(oEvent) {
						if (!oEvent.shiftKey && (oEvent.keyCode == 13 || oEvent.keyCode == 32)) {
							oEvent.preventDefault();
							this.onPopoverHeaderPress(oHeader);
						}
					}.bind(this)
				});
			}
		},

		resizeCard: function(newCardLayout) {},

		onPopoverHeaderPress: function(oHeader) {
			var aNavigationFields = this.getEntityNavigationEntries(oHeader.getBindingContext(), this.getCardPropertiesModel().getProperty("/annotationPath"));
			this.doNavigation(oHeader.getBindingContext(), aNavigationFields[0]);
		},

		onClickSpot: function(evt) {
			var spot = evt.getSource();
			// Retrieving the click offset; how many pixels away from the top-left corner of the map;
			var clickOffset = {};
			clickOffset[evt.getParameter("data").Action.Params.Param[0].name] = evt.getParameter("data").Action.Params.Param[0]["#"];
			clickOffset[evt.getParameter("data").Action.Params.Param[1].name] = evt.getParameter("data").Action.Params.Param[1]["#"];

			var oVBI = this.getView().byId("oVBI");

			// Getting the bounding client; we use this to calculate where to place the popover
			var boundingClientRect = oVBI.getDomRef().getBoundingClientRect();

			if (!this.oQuickViewPopover) {
				this.oQuickViewPopover = this.getView().byId("quickViewPopover");
			} else {
				// If the popover exists, we make sure we close to close it
				this.oQuickViewPopover.close();
			}

			// Some properties from the popover content are using this model
			// for data binding within the QuickView XML fragment.
			this.oPopoverModel = new sap.ui.model.json.JSONModel({
				objectAttribute1: spot.mClickGeoPos,
				objectAttribute2: spot.getId(),
				offsetX: Math.floor(parseFloat(clickOffset.x) - boundingClientRect.width) + 10,
				offsetY: Math.floor(parseFloat(clickOffset.y) - boundingClientRect.height / 2) - 5,
				test: "987"
			});

			// Set the model and open the quick view popover
			this.oQuickViewPopover.setModel(this.oPopoverModel, "popover");
			this.oQuickViewPopover.openBy(oVBI);
			this.oQuickViewPopover.setBindingContext(spot.getBindingContext());
		},
		onBeforeRendering: function() {
			var oVBI = this.getView().byId("oVBI");
			oVBI.getAggregation("vos")[0].getBinding("items").attachChange(function(item) {
				var zoomA = [],
					zoomB = [];

				this.getAggregation("vos")[0].getItems().forEach(function(item) {
					var pos = item.getPosition();
					if (pos != '0;0;0') {
						var Lon = item.getPosition().split(";")[0];
						var Lat = item.getPosition().split(";")[1];
						zoomA.push(Number(Lon));
						zoomB.push(Number(Lat));
					}
				});
				//zoom to one or multiple geo positions
				if (zoomA.length > 1) {
					//multiple spots. has no zoom level. remains at 10,000km
					this.zoomToGeoPosition(zoomA, zoomB);
				}
				if (zoomA.length <= 1) {
					//provide zoom level for a single spot. zooms to 500km.
					this.zoomToGeoPosition(zoomA, zoomB, 5);
				}
			}.bind(oVBI));

			//set the map using object oMapConfig created in Manifest file.
			var oMapConfig = this.getOwnerComponent().getComponentData().settings.oMapConfig;
			oVBI.setMapConfiguration(oMapConfig);
		}
	});
})();
