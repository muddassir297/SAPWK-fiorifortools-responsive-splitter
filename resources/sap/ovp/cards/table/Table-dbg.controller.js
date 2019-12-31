(function () {
    "use strict";
    /*global sap, jQuery */

    sap.ui.controller("sap.ovp.cards.table.Table", {

        onInit: function () {
        },

        onColumnListItemPress: function (oEvent) {
            var aNavigationFields = this.getEntityNavigationEntries(oEvent.getSource().getBindingContext(), this.getCardPropertiesModel().getProperty("/annotationPath"));
            this.doNavigation(oEvent.getSource().getBindingContext(), aNavigationFields[0]);
        },

        /**
         * Gets the card items binding object for the count footer
         */
        getCardItemsBinding: function() {
            var table = this.getView().byId("ovpTable");
            return table.getBinding("items");
        },

        onAfterRendering: function () {
            var oTable = this.getView().byId("ovpTable");
            var aAggregation = oTable.getAggregation("columns");
            for (var iCount = 0; iCount < 3; iCount++) {
                if (aAggregation[iCount]) {
                    aAggregation[iCount].setStyleClass("sapTableColumnShow").setVisible(true);
                }
            }
        },

        /**
         * Gets the card items binding info
         */
        getCardItemBindingInfo: function () {
            var oList = this.getView().byId("ovpTable");
            return oList.getBindingInfo("items");
        },

        /**
         * Handles no of columns to be shown in table when view-switch happens
         *
         * @method addColumnInTable
         * @param {String} sCardId - Card Id
         * @param {Object} oCardResizeData- card resize properties
         */
        addColumnInTable: function ($card, oCardResizeData) {
            if (oCardResizeData.colSpan >= 1) {
                if (jQuery($card).find("tr").length != 0) {
                    var table = sap.ui.getCore().byId(jQuery($card).find(".sapMList").attr("id"));
                    var aggregation = table.getAggregation("columns");
                    var iColSpan = oCardResizeData.colSpan;
                    // No of columns to be shown calculated based upon colspan
                    var iIndicator = iColSpan + 1;
                    for (var i = 0; i < 6; i++) {
                        if (aggregation[i]) {
                            if (i <= iIndicator) {
                                //Show any particular column
                                aggregation[i].setStyleClass("sapTableColumnShow").setVisible(true);
                            } else {
                                //hide any particular column
                                aggregation[i].setStyleClass("sapTableColumnHide").setVisible(false);
                            }
                        }
                    }
                    table.rerender();
                }
            }
        },

        /**
         * Method called upon card resize
         *
         * @method resizeCard
         * @param {Object} newCardLayout- resize data of the card
         * @return {Object} $card - Jquery object of the card
         */
        resizeCard: function (newCardLayout) {
            var iNoOfItems, iAvailableSpace;
            try {
                var oCardPropertiesModel = this.getCardPropertiesModel(),
                    oBindingInfo = this.getCardItemBindingInfo(),
                    cardSizeProperties = this.oDashboardLayoutUtil.calculateCardProperties(this.cardId),
                    $card = jQuery('#' + this.oDashboardLayoutUtil.getCardDomId(this.cardId));
                    iAvailableSpace = newCardLayout.rowSpan * newCardLayout.iRowHeightPx - (cardSizeProperties.headerHeight + cardSizeProperties.dropDownHeight + cardSizeProperties.itemHeight + 2 * newCardLayout.iCardBorderPx);
                if (cardSizeProperties.itemHeight) {
                    iNoOfItems = Math.floor(iAvailableSpace / cardSizeProperties.itemHeight);
                }
                this.addColumnInTable($card, newCardLayout);
                jQuery($card).find(".sapOvpWrapper").css({
                    height: ((newCardLayout.rowSpan * newCardLayout.iRowHeightPx) - (cardSizeProperties.headerHeight + 2 * newCardLayout.iCardBorderPx)) + "px"
                });
                oCardPropertiesModel.setProperty("/cardLayout/rowSpan", newCardLayout.rowSpan);
                oCardPropertiesModel.setProperty("/cardLayout/colSpan", newCardLayout.colSpan);
                oCardPropertiesModel.setProperty("/cardLayout/noOfItems", iNoOfItems);
                oBindingInfo.length = iNoOfItems < 1 ? 1 : iNoOfItems;
                this.getCardItemsBinding().refresh();
            } catch (error) {
                jQuery.sap.log.warning("OVP resize: " + this.cardId + " catch " + error.toString());
            }
        }
    });
})();
