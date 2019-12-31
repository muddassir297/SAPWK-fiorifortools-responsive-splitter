(function () {
	"use strict";
	/*global sap, jQuery */

	sap.ui.controller("sap.ovp.cards.charts.analytical.analyticalChart", {
		onInit: function () {
				sap.ovp.cards.charts.VizAnnotationManager.formatChartAxes();
				this.bFlag = true;
		},
		onBeforeRendering : function() {
			if (this.bCardProcessed) {
				return;
			}
			sap.ovp.cards.charts.VizAnnotationManager.validateCardConfiguration(this);
			var vizFrame = this.getView().byId("analyticalChart");
			var bubbleText = this.getView().byId("bubbleText");
			var chartTitle = this.getView().byId("ovpCT");
			var bubbleSizeText = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("BUBBLESIZE");
			var navigation;
			/*var navigation = vizFrame.getModel('ovpCardProperties').getProperty("/navigation");
			if (navigation == "chartNav") {
				vizFrame.attachBrowserEvent("click", this.onHeaderClick.bind(this));
			} else {
				sap.ovp.cards.charts.VizAnnotationManager.getSelectedDataPoint(vizFrame, this);
			}*/
			if (!vizFrame) {
				jQuery.sap.log.error(sap.ovp.cards.charts.VizAnnotationManager.constants.ERROR_NO_CHART +
						": (" + this.getView().getId() + ")");
			} else {
				navigation = vizFrame.getModel('ovpCardProperties').getProperty("/navigation");
				if (navigation == "chartNav") {
					vizFrame.attachBrowserEvent("click", this.onHeaderClick.bind(this));
				} else {
					sap.ovp.cards.charts.VizAnnotationManager.getSelectedDataPoint(vizFrame, this);
				}
//				vizFrame.addEventDelegate(this.busyDelegate, vizFrame);
				var handler = vizFrame.getParent();
				
				sap.ovp.cards.charts.VizAnnotationManager.buildVizAttributes(vizFrame,handler,chartTitle);
				if (bubbleText != undefined) {
					var feeds = vizFrame.getFeeds();
					jQuery.each(feeds,function(i,v){
						if (feeds[i].getUid() == "bubbleWidth") {
							bubbleText.setText(bubbleSizeText + " " + feeds[i].getValues());
						}
					});
				}
				sap.ovp.cards.charts.VizAnnotationManager.hideDateTimeAxis(vizFrame);
				var binding = vizFrame.getParent().getBinding("data");

				this._handleKPIHeader();
				
				if (binding.getPath()) {
					binding.attachDataReceived(jQuery.proxy(this.onDataReceived, this));
					binding.attachDataRequested(jQuery.proxy(this.onDataRequested, this));
				} else {
					var noDataDiv = sap.ui.xmlfragment("sap.ovp.cards.charts.generic.noData");
					var cardContainer = this.getCardContentContainer();
					cardContainer.removeAllItems();
					cardContainer.addItem(noDataDiv);
				}
			}
			this.bCardProcessed = true;
		},
		onDataReceived: function(oEvent) {
			var vizFrame = this.getView().byId("analyticalChart");
			vizFrame.setBusy(false);
//			var handler = vizFrame.getParent();
//			var chartScaleTitle = this.getView().byId("ovpScaleUnit");
//			var vizData = oEvent ? oEvent.getParameter('data') : null;
			//FIORITECHP1-4935Reversal of Scale factor in Chart and Chart title.
//			sap.ovp.cards.charts.VizAnnotationManager.setChartScaleTitle(vizFrame,vizData,handler,chartScaleTitle);
			if (this.bFlag == true) {
//			vizFrame.addEventDelegate(this.freeDelegate, vizFrame);
			this.bFlag = false;
			} else {
				setTimeout(function(){
					vizFrame.setBusy(false);
					},0);
			}
			sap.ovp.cards.charts.VizAnnotationManager.checkNoData(oEvent, this.getCardContentContainer(), vizFrame);
		},
		onDataRequested : function() {
			var vizFrame = this.getView().byId("analyticalChart");
//			vizFrame.removeEventDelegate(this.freeDelegate, vizFrame);
			vizFrame.setBusy(true);
		},
		
		getCardItemsBinding: function() {
            var vizFrame = this.getView().byId("analyticalChart");
          //vizFrame.setBusy(true); Commenting for the issue 1780015305
            if (vizFrame.getParent().getBinding("data")){
               vizFrame.setBusy(false);
            }
            return vizFrame.getParent().getBinding("data");
        },
        
        resizeCard: function(newCardLayout) {
            var oCardPropertiesModel = this.getCardPropertiesModel();
            oCardPropertiesModel.setProperty("/oData/cardLayout/rowSpan", newCardLayout.rowSpan);
            oCardPropertiesModel.setProperty("/oData/cardLayout/colSpan", newCardLayout.colSpan);
            var oGenCardCtrl = this.getView().getController();
            var iHeaderHeight = this.getItemHeight(oGenCardCtrl, 'ovpCardHeader');
            var iDropDownHeight = this.getItemHeight(oGenCardCtrl, 'toolbar');
            var iBubbleTextHeight = this.getItemHeight(oGenCardCtrl,"bubbleText");
            var vizCard = this.getView().byId("analyticalChart");
            //Viz container height = Card Container height - header Height - View switch toolbar height - Height of the Chart text
            vizCard.setHeight(newCardLayout.rowSpan * newCardLayout.iRowHeightPx  - (iHeaderHeight + iDropDownHeight + iBubbleTextHeight +  67) + "px");
            //Viz container width = Card Container width - 32(16px padding is given both sides)
            vizCard.setWidth(+newCardLayout.width.split("px")[0] - 32 + "px");
        },
        refreshCard : function(){
            this.getView().rerender();
        }
     });
})();
