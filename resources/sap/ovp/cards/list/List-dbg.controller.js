(function () {
    "use strict";
    /*global sap, jQuery */

    sap.ui.controller("sap.ovp.cards.list.List", {
        counter: 0,
        arrayLength: 0,
        minMaxModel: {},
        onInit: function () {
            this.counter = 0;
            this.minMaxModel = new sap.ui.model.json.JSONModel();
            this.minMaxModel.setData({
                minValue: 1,
                maxValue: -1
            });
            this.getView().setModel(this.minMaxModel, "minMaxModel");
        },

        onAfterRendering: function () {

            var isImageCard = this.getCardPropertiesModel().oData.imageSupported;
            var densityStyle = this.getCardPropertiesModel().oData.densityStyle;
            if (isImageCard && isImageCard === "true") {

                var imageList = this.byId('ovpList');

                /**
                 * This function does some CSS changes after the card is rendered
                 */
                imageList.attachUpdateFinished(
                    function () {
                        var iL = this.byId('ovpList');
                        var items = iL.getItems();
                        var isIcon = false;
                        var cls = iL.getDomRef().getAttribute("class");

                        if (densityStyle === "cozy") {
                            cls = cls + " sapOvpListImageCozy";
                        } else {
                            cls = cls + " sapOvpListImageCompact";
                        }

                        iL.getDomRef().setAttribute("class", cls);

                        /**
                         * Looping through all elements in the displayed list to find out
                         * if it is icon or image type card,
                         * the size of the icon/image varies accordingly
                         */
                        items.forEach(
                            function (item) {
                                if (item.getIcon().indexOf("icon") != -1) {
                                    isIcon = true;
                                }
                            }
                        );

                        items.forEach(
                            function (item) {

                                var listItemRef = item.getDomRef();
                                var imgIcon;
                                if ( listItemRef && listItemRef.children[0] && listItemRef.children[0].children[0] ) {
                                   imgIcon = listItemRef.children[0].children[0];
                                }
                                var itemDescription = item.getDescription();
                                var icon = item.getIcon();
                                var tIcon = isIcon;
                                var title = item.getTitle();

                                var initials = title.split(' ').map(function (str) {
                                    return str ? str[0].toUpperCase() : "";
                                }).join('').substring(0, 2);

                                /**
                                 * Condition for card in which images and icons are present
                                 * we are checking if any list item is an image to set
                                 * appropriate CSS
                                 */
                                if (icon != "" && icon.indexOf("icon") == -1) {
                                    isIcon = false;
                                }

                                if (imgIcon && densityStyle === "cozy" && isIcon === false) {
                                    if (imgIcon) {
                                        var cls = imgIcon.getAttribute("class");
                                        cls = cls + " sapOvpImageCozy";
                                        imgIcon.setAttribute("class", cls);
                                    }
                                }

                                var itemStyle = "";
                                if (isIcon === true && itemDescription === "") {
                                    itemStyle = densityStyle === "compact" ? "sapOvpListWithIconNoDescCompact" : "sapOvpListWithIconNoDescCozy";
                                } else if (isIcon === false && itemDescription === "") {
                                    itemStyle = densityStyle === "compact" ? "sapOvpListWithImageNoDescCompact" : "sapOvpListWithImageNoDescCozy";
                                } else {
                                    itemStyle = densityStyle === "compact" ? "sapOvpListWithImageIconCompact" : "sapOvpListWithImageIconCozy";
                                }

                                item.addStyleClass(itemStyle);

                                if (listItemRef && listItemRef.children[0] && icon === "" && listItemRef.children[0].id !== "ovpIconImagePlaceHolder") {
                                    var placeHolder = document.createElement('div');
                                    placeHolder.innerHTML = initials;
                                    placeHolder.setAttribute("id", "ovpIconImagePlaceHolder");
                                    placeHolder.className = isIcon === true ? "sapOvpIconPlaceHolder" : "sapOvpImagePlaceHolder";
                                    if (isIcon === false && densityStyle === "cozy") {
                                        placeHolder.className = placeHolder.className + " sapOvpImageCozy";
                                    }
                                    listItemRef.insertBefore(placeHolder, listItemRef.children[0]);
                                }
                                isIcon = tIcon;

                            }
                        );
                    }.bind(this));
            }
        },

        onListItemPress: function (oEvent) {
            var aNavigationFields = this.getEntityNavigationEntries(oEvent.getSource().getBindingContext(), this.getCardPropertiesModel().getProperty("/annotationPath"));
            this.doNavigation(oEvent.getSource().getBindingContext(), aNavigationFields[0]);
        },

        /**
         * This function loops through context values and gets
         * the Max & Min Value for the card in 'this'
         * context(ie different for different cards)
         * Requirement: In case of global filters applied context changes and Max and Min should also change
         * Drawback : Max and Min are calculated for each list Items again considering all items in context.
         * */
        _getMinMaxObjectFromContext: function () {
            this.counter++;
            var oEntityType = this.getEntityType(),
                sAnnotationPath = this.getCardPropertiesModel().getProperty("/annotationPath"),
                aRecords = oEntityType[sAnnotationPath],
                context = this.getMetaModel().createBindingContext(oEntityType.$path + "/" + sAnnotationPath),
                minMaxObject = {
                    minValue: 1,
                    maxValue: -1
                };

            //Case 1:  In case of percentage
            if (sap.ovp.cards.AnnotationHelper.isFirstDataPointPercentageUnit(context, aRecords)) {
                minMaxObject.minValue = 0;
                minMaxObject.maxValue = 100;
                return minMaxObject;
            }

            //Case 2: Otherwise
            var dataPointValue = sap.ovp.cards.AnnotationHelper.getFirstDataPointValue(context, aRecords),
                barList = this.getView().byId("ovpList"),
                listItems = barList.getBinding("items"),
                itemsContextsArray = listItems.getCurrentContexts();
            for (var i = 0; i < itemsContextsArray.length; i++) {
                var currentItemValue = parseInt(itemsContextsArray[i].getObject()[dataPointValue], 10);
                if (currentItemValue < minMaxObject.minValue) {
                    minMaxObject.minValue = currentItemValue;
                } else if (currentItemValue > minMaxObject.maxValue){
                    minMaxObject.maxValue = currentItemValue;
                }
            }
            return minMaxObject;
        },

        /**
         *  this function
         *  1.updates both min and max values in 'this' context
         *  and
         *  2.then updates the model attached to that particular card
         *  3.then refreshes the model to affect the changes
         *  */
        _updateMinMaxModel: function () {
            var minMaxObject = this._getMinMaxObjectFromContext();
            this.minMaxModel.setData({
                minValue: minMaxObject.minValue,
                maxValue: minMaxObject.maxValue
            });
            this.minMaxModel.refresh();
            return minMaxObject;
        },

        /**
         * this function call update method and return the value.
         * */
        returnBarChartValue: function (value) {
            var minMaxObject = this._updateMinMaxModel();
            //parseInt return values b/w (-1,1) as 0
            var iValue = parseInt(value, 10);
            // In case of values are not between (-1,1) show value as is
            if (iValue !== 0) {
                return iValue;
                // If max Value is less than Zero and Values is between (-1,1) then show minimal value in negative
            } else if (minMaxObject.maxValue <= 0) {
                return -0.5;
                // If min Value is more than Zero and Values is between (-1,1) then show minimal value in positive
            } else if (minMaxObject.minValue >= 0) {
                return 0.5;
            }
            //If both Max is greater than 0 and min is less than Zero ,Show value as it is.
            return iValue;

        },

        /**
         * Gets the card items binding object for the count footer
         */
        getCardItemsBinding: function () {
            var list = this.getView().byId("ovpList");
            return list.getBinding("items");
        },

        /**
         * Gets the card items binding info
         */
        getCardItemBindingInfo: function () {
            var oList = this.getView().byId("ovpList");
            return oList.getBindingInfo("items");
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
                    iAvailableSpace = newCardLayout.rowSpan * newCardLayout.iRowHeightPx - (cardSizeProperties.headerHeight + cardSizeProperties.dropDownHeight + 2 * newCardLayout.iCardBorderPx);
                if (cardSizeProperties.itemHeight) {
                    iNoOfItems = Math.floor(iAvailableSpace / cardSizeProperties.itemHeight);
                }
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
