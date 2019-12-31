sap.ui.define([
	"sap/ovp/ui/DashboardLayoutRearrange",
	"sap/ovp/ui/DashboardLayoutModel"
], function(Rearrange, DashboardLayoutModel) {

	// (function() {
	"use strict";

	var ROW_HEIGHT_PX = 16; //176;
	var MIN_COL_WIDTH_PX = 320;
	var CARD_BORDER_PX = 8; //--> css class .sapOvpDashboardLayoutItem
	var EXTRA_MARGIN = 8; //dynamicpageheader had 8px less margin

	var DashboardLayoutUtil = function(uiModel) {

		this.aCards = null;
		this.dashboardLayoutModel = new DashboardLayoutModel(uiModel);
		this.layoutDomId = "";
		this.oLayoutCtrl = {};
		this.componentDomId = "";
		this.ROW_HEIGHT_PX = 16;
        this.CARD_BORDER_PX = 8;
		this.oLayoutData = {
			layoutWidthPx: 1680,
			contentWidthPx: 1600,
			colCount: 5,
			colWidthPx: MIN_COL_WIDTH_PX,
			rowHeightPx: ROW_HEIGHT_PX,
			marginPx: this.convertRemToPx(3) - CARD_BORDER_PX
		};
		this.lastTriggeredColWidth = 0.0;
	};

	DashboardLayoutUtil.prototype.setLayout = function(layout) {
		this.oLayoutCtrl = layout;
		this.layoutDomId = layout.getId();
		this.componentDomId = this.layoutDomId.split("--")[0];
	};

	DashboardLayoutUtil.prototype.getDashboardLayoutModel = function() {
		return this.dashboardLayoutModel;
	};

	DashboardLayoutUtil.prototype.updateCardVisibility = function(aChgCards) {
		this.dashboardLayoutModel.updateCardVisibility(aChgCards);
		this.aCards = this.dashboardLayoutModel.getCards(this.oLayoutData.colCount);
		this._setCardsCssValues(this.aCards);
		this.layoutCards();
	};

	DashboardLayoutUtil.prototype.updateLayoutData = function(iDashboardWidth) {
		// shortcut
		if (this.oLayoutData.layoutWidthPx === iDashboardWidth) {
			return this.oLayoutData;
		}

		var iDashboardMargin = this.oLayoutData.marginPx,
			iExtraSpaceForDesktop = 0,
			iSmallScreenWidth = 320,
			iMiddleScreenWidth = 1024,
			iCardMargin = CARD_BORDER_PX,
			iMargin = EXTRA_MARGIN,
			iNewScreenWidth = iDashboardWidth + iDashboardMargin,
			iDashboardMarginLeft,
			iDashboardMarginRight; //iDashboardWidth is without left margin
		this.oLayoutData.layoutWidthPx = iDashboardWidth;

		if (iNewScreenWidth <= iSmallScreenWidth) {
			iDashboardMargin = this.convertRemToPx(0.5) - iCardMargin;
			iExtraSpaceForDesktop = sap.ui.Device.system.desktop ? 16 : 0; //considering vertical scrollbar on the desktop
		} else if (iNewScreenWidth <= iMiddleScreenWidth) {
			iDashboardMargin = this.convertRemToPx(1) - iCardMargin;
			iExtraSpaceForDesktop = sap.ui.Device.system.desktop ? 8 : 0;
		} else {
			iDashboardMargin = this.convertRemToPx(3) - iCardMargin;
		}
		if (iDashboardMargin !== this.oLayoutData.marginPx) {
			this.oLayoutData.marginPx = iDashboardMargin;
			jQuery(".sapUshellEasyScanLayout").css({
				"margin-left": iDashboardMargin + "px"
			});
		}

		//calculates content width excluding symmetric margin space on the right 
		//and the extra space for vertical scrollbar on the desktop
		this.oLayoutData.contentWidthPx = iDashboardWidth - iDashboardMargin - iExtraSpaceForDesktop;
		this.oLayoutData.colCount = Math.floor(this.oLayoutData.contentWidthPx / MIN_COL_WIDTH_PX);
		if (this.oLayoutData.colCount === 0) {
			this.oLayoutData.colCount = 1;
		}
		this.oLayoutData.colWidthPx = this.oLayoutData.contentWidthPx / this.oLayoutData.colCount;
		if (jQuery(".sapOvpDashboardDragAndDrop").length > 0 && jQuery(".easyScanLayoutItemWrapper").length > 0) {
            iDashboardMarginLeft = jQuery(".sapOvpDashboardDragAndDrop").offset().left + jQuery(".easyScanLayoutItemWrapper")[0].clientLeft;
            iDashboardMarginRight = iDashboardMarginLeft;
        } else {
            iDashboardMarginLeft = iDashboardMargin + iMargin;
            iDashboardMarginRight = iDashboardMargin + iExtraSpaceForDesktop + iMargin;
        }
		jQuery('.sapFDynamicPageTitle').css({"margin-left": iDashboardMarginLeft + "px", "margin-right": iDashboardMarginRight + "px","visibility": "visible"});
		jQuery('.sapFDynamicPageHeader').css({"margin-left": iDashboardMarginLeft + "px", "margin-right": iDashboardMarginRight + "px","visibility": "visible"}); 
		
		return this.oLayoutData;
	};

	DashboardLayoutUtil.prototype.getRearrange = function(settings) {
		var defaultSettings = {
			containerSelector: ".sapUshellEasyScanLayoutInner",
			wrapper: ".sapUshellEasyScanLayout",
			draggableSelector: ".easyScanLayoutItemWrapper",
			placeHolderClass: "easyScanLayoutItemWrapper-placeHolder",
			cloneClass: "easyScanLayoutItemWrapperClone",
			moveTolerance: 10,
			switchModeDelay: 500,
			isTouch: !sap.ui.Device.system.desktop,
			debug: false,
			aCards: this.aCards,
			layoutUtil: this,
			rowHeight: this.oLayoutData.rowHeightPx,
			colWidth: this.oLayoutData.colWidthPx
		};

		return new Rearrange(jQuery.extend(defaultSettings, settings));
	};

    /**
     * Method to calculate the height of the container "sapUshellEasyScanLayoutInner"
     * upon resize or change the card position
     *
     * @method calculateContainerHeight
     * @returns {Number} height of the "sapUshellEasyScanLayoutInner"
     */
    DashboardLayoutUtil.prototype.calculateContainerHeight = function () {
        var iColumnCount = this.dashboardLayoutModel.iColCount;
        var maxHeightArr = [];

        function filterByColCount(element) {
            return element.dashboardLayout.column === iCount;
        }

        function findCardwithMaxRowCount(element, index, array) {
            return element.dashboardLayout.row ===
                Math.max.apply(Math, array.map(function (ele) {
                    return ele.dashboardLayout.row;
                }));
        }

        for (var iCount = 1; iCount <= iColumnCount; iCount++) {
            //get the list of cards for each column
            var aArray = this.aCards.filter(filterByColCount);
            if (!!aArray) {
                //For particular column find the card which has row count is maximum
                //if row count is maximum means the card is present at the bottom for that column
                var oObj = aArray.filter(findCardwithMaxRowCount)[0];
                if (!!oObj) {
                    //For each column push the column height into the array
                    //Height of the column = margin-top of the card which is present at bottom + height of the card which is present at bottom
                    maxHeightArr.push(+(oObj.dashboardLayout.top.split('px')[0]) + +(oObj.dashboardLayout.height.split('px')[0]));
                }
            }
        }
        //Take the maximum height from the array which is equal to the height of the container
        var iHeightOfcontainer = Math.max.apply(Math, maxHeightArr.map(function (ele) {
            return ele;
        }));
        return iHeightOfcontainer + 32;
    };

	DashboardLayoutUtil.prototype.resizeLayout = function(iWidth) {

		var iBeforeCol = this.oLayoutData.colCount;
		var bTriggerResize = false;

		if (this.oLayoutData.layoutWidthPx !== iWidth) {
			this.updateLayoutData(iWidth);
			bTriggerResize = Math.abs(this.lastTriggeredColWidth - this.oLayoutData.colWidthPx) > this.convertRemToPx(0.5);

			// column width can grow pixel by pixel --> render even if number of columns stays same
			this.aCards = this.dashboardLayoutModel.getCards(this.oLayoutData.colCount);
			var i = 0;

			for (i = 0; i < this.aCards.length; i++) {

				//re-set css values for current card
				this.setCardCssValues(this.aCards[i]);

				var $card = jQuery("#" + this.getCardDomId(this.aCards[i].id));
				$card.css({
					top: this.aCards[i].dashboardLayout.top,
					left: this.aCards[i].dashboardLayout.left,
					width: this.aCards[i].dashboardLayout.width,
					height: this.aCards[i].dashboardLayout.height
				});

				//if number of columns changed --> trigger card resize
				if (iBeforeCol !== this.oLayoutData.colCount || bTriggerResize) {
					this._triggerCardResize(this.aCards[i].dashboardLayout, $card);
				}
			}

			if (bTriggerResize) {
				this.lastTriggeredColWidth = this.oLayoutData.colWidthPx;
			}
		}
	};

	/**
	 * build layout variant for specified width
	 *
	 * @method buildLayout
	 * @param {Int} iWidth - layout width in pixel
	 * @returns {Object} layout variant
	 */
	DashboardLayoutUtil.prototype.buildLayout = function(iWidth) {
		var oLayoutVar = {};
		if (!iWidth) {
			return oLayoutVar;
		}

		this.updateLayoutData(iWidth);
		this.aCards = this.dashboardLayoutModel.getCards(this.oLayoutData.colCount);
		this._setCardsCssValues(this.aCards);

		oLayoutVar = this.dashboardLayoutModel.extractCurrentLayoutVariant();
		return oLayoutVar;
	};

	/**
	 * get cards for specified number of columns
	 *
	 * @method getCards
	 * @param {Int} iColCount - number of columns
	 * @returns {Array} cards
	 */
	DashboardLayoutUtil.prototype.getCards = function(iColCount) {

		if (this.aCards && this.oLayoutData.colCount === iColCount) {
			return this.aCards;
		}

		this._setColCount(iColCount);
		this.aCards = this.dashboardLayoutModel.getCards(iColCount);
		this._setCardsCssValues(this.aCards);

		return this.aCards;
	};

	DashboardLayoutUtil.prototype.resetToManifest = function() {
		this.aCards = [];
		this.dashboardLayoutModel.resetToManifest();
		this.buildLayout(this.oLayoutData.layoutWidthPx);
		this.layoutCards();
	};

	/**
	 * get card at pixel position in it's container
	 * scroll and offset are not considered here
	 *
	 * @method getCardDomId
	 * @param {ID} cardId - ID of a card
	 * @returns {ID} card dom id
	 */
	DashboardLayoutUtil.prototype.getCardDomId = function(cardId) {
		// card00 --> __xmlview0--ovpLayout--card00
		return this.layoutDomId + "--" + cardId;
	};

	DashboardLayoutUtil.prototype.getCardId = function(cardDomId) {
		// example card Id:  __xmlview0--ovpLayout--card00 --> card00
		var cdi = "";
		if (cardDomId) {
			cdi = cardDomId.split("--")[2];
		}
		return cdi;
	};

	/**
	 * get card at pixel position in it's container
	 * scroll and offset are not considered here
	 *
	 * @method getCardByPosition
	 * @param {Object} pos - position
	 * @returns {Object} card residing at grid position
	 */
	DashboardLayoutUtil.prototype.getCardByPositionPx = function(pos) {
		var iRow = Math.floor(pos.top / this.oLayoutData.rowHeightPx) + 1;
		var iCol = Math.floor(pos.left / this.oLayoutData.colWidthPx) + 1;

		var gridPos = {
			row: iRow,
			column: iCol
		};
		return this.dashboardLayoutModel.getCardByGridPos(gridPos);
	};

	/**
	 * get cards in (partly) contained in given area in it's container
	 * scroll and offset are not considered here
	 *
	 * @method getCardsByArea
	 * @param {Object} area (x,y,width,height)
	 * @param {Boolean} bRoundHalfUp - wether to use scientific number rounding
	 * @returns {Object} cards contained in area
	 */
	DashboardLayoutUtil.prototype.getCardsByArea = function(area, bRoundHalfUp) {
		var oGridSpan = {};
		var oCardAtPos = this.getCardByPositionPx(area);

		var oTPCell = {};
		// floor + 1 vs round
		if (bRoundHalfUp) {
			oTPCell.column = Math.round(area.x / this.oLayoutData.colWidthPx);
			oTPCell.row = Math.round(area.y / this.oLayoutData.rowHeightPx);
		} else {
			oTPCell.column = Math.floor(area.x / this.oLayoutData.colWidthPx) + 1;
			oTPCell.row = Math.floor(area.y / this.oLayoutData.rowHeightPx) + 1;
		}

		// min 1 / 1
		if (oTPCell.column > 1) {
			oTPCell.column = 1;
		}
		if (oTPCell.row > 1) {
			oTPCell.row = 1;
		}

		if (oCardAtPos) {
			oGridSpan.x1 = oCardAtPos.dashboardLayout.column;
			oGridSpan.y1 = oCardAtPos.dashboardLayout.row;
		} else {
			oGridSpan.x1 = oTPCell.column;
			oGridSpan.y1 = oTPCell.row;
		}
		oGridSpan.x2 = Math.ceil(area.width / this.oLayoutData.colWidthPx) + oGridSpan.x1 - 1;
		oGridSpan.y2 = Math.ceil(area.height / this.oLayoutData.rowHeightPx) + oGridSpan.y1 - 1;
		var result = {
			cards: this.dashboardLayoutModel.getCardsByGrid(oGridSpan),
			upperLeftEdge: this._mapGridToPositionPx({
				column: oGridSpan.x1,
				row: oGridSpan.y1
			}),
			upperLeftGridCell: {
				column: oGridSpan.x1,
				row: oGridSpan.y1
			},
			cardUpperLeft: oCardAtPos,
			touchPointCell: this._mapGridToPositionPx(oTPCell),
			touchPointGridCell: oTPCell
		};

		return result;
	};

	DashboardLayoutUtil.prototype.isCardAutoSpan = function(cardId) {
		return this.dashboardLayoutModel.getCardById(cardId).dashboardLayout.autoSpan;
	};

    DashboardLayoutUtil.prototype.setAutoCardSpanHeight = function (evt, cardId, height) { //cardId, iHeight) {
        var layoutChanges;
        var sCardId = cardId;
        if (!sCardId && evt && evt.target.parentElement) {
            sCardId = evt.target.parentElement.parentElement.id.split("--")[1];
        }
        var iHeight = height;
        if (!iHeight && evt) {
            iHeight = evt.size.height;
        }

        //verify that card is autoSpan and resize it
        if (this.isCardAutoSpan(sCardId)) {
            if (this.bRecreate) {
                var cardSizeProperties = this.calculateCardProperties(sCardId);
                var currentHeight = this.bRecreate.rowSpan * this.getRowHeightPx();
                if (cardSizeProperties && currentHeight < cardSizeProperties.minCardHeight) {
                    this.bRecreate.rowSpan = Math.ceil(cardSizeProperties.minCardHeight / this.getRowHeightPx());
                }
                layoutChanges = this.resizeCard(this.getCardDomId(sCardId), this.bRecreate, /*manual resize*/ true);
            } else {
                var iRows = Math.round((iHeight + 2 * this.CARD_BORDER_PX) / this.getRowHeightPx());
                //resizeCard mathod called upon on first time loading
                layoutChanges = this.dashboardLayoutModel.resizeCard(sCardId, {
                    rowSpan: iRows,
                    colSpan: 1
                }, /*manual resize*/ false);
                this._sizeCard(layoutChanges.resizeCard);
                this._positionCards(layoutChanges.affectedCards);
            }
        }
    };

    /**
     * Method called for calculating different parameters of card for resize
     *
     * @method calculateCardProperties
     * @param {string} sCardId- card id
     * @param {Object} object - object which returns the properties like Header / Dropdown / Item height / Minimum card height / Least card height
     */
    DashboardLayoutUtil.prototype.calculateCardProperties = function (sCardId) {
        var $card = jQuery("#" + this.getCardDomId(sCardId)),
            cardId = $card.children().first().attr("id"),
            oCard = this.dashboardLayoutModel.getCardById(sCardId),
            oCompInst = sap.ui.getCore().byId(cardId).getComponentInstance(),
            oGenCardCtrl, iHeaderHeight, iDropDownHeight, iLineItemHeight, minCardHeight;
        if (oCompInst) {
            oGenCardCtrl = oCompInst.getAggregation("rootControl").getController();
            iHeaderHeight = oGenCardCtrl.getItemHeight(oGenCardCtrl, 'ovpCardHeader');
            iDropDownHeight = oGenCardCtrl.getItemHeight(oGenCardCtrl, 'toolbar');
            if (oCard.template === "sap.ovp.cards.list") {
                iLineItemHeight = oGenCardCtrl.getItemHeight(oGenCardCtrl, 'ovpList', true);
                minCardHeight = iHeaderHeight + iDropDownHeight + (iLineItemHeight > 0 ? iLineItemHeight : 32);
            } else if (oCard.template === "sap.ovp.cards.table") {
                iLineItemHeight = oGenCardCtrl.getItemHeight(oGenCardCtrl, 'ovpTable', true);
                minCardHeight = iHeaderHeight + iDropDownHeight + (iLineItemHeight > 0 ? 2 * iLineItemHeight : 2 * 62);
            } else if (oCard.template === "sap.ovp.cards.linklist") {
                //For link list card Minimum height = header height + item height + upperListPadding
                iLineItemHeight = oGenCardCtrl.getItemHeight(oGenCardCtrl, 'ovpLinkList', true);
                var densityType = oGenCardCtrl.getView().getModel("ovpCardProperties").getProperty("/densityStyle");
                if (densityType === 'cozy') {
                    minCardHeight = iHeaderHeight + iLineItemHeight + 8; //8px padding for 'cozy' mode
                } else {
                    minCardHeight = iHeaderHeight + iLineItemHeight + 4; //4px padding for 'compact' mode
                }
            } else {
                //Else header height + dropdown height
                minCardHeight = iHeaderHeight + iDropDownHeight;
            }
            return {
                headerHeight: iHeaderHeight,
                dropDownHeight: iDropDownHeight,
                itemHeight: iLineItemHeight,
                minCardHeight: minCardHeight,
                leastHeight: iHeaderHeight
            };
        }
    };

	DashboardLayoutUtil.prototype._sizeCard = function(oCard) {
		if (!oCard) {
			return;
		}
        var $card = jQuery("#" + this.getCardDomId(oCard.id));
        //bRecreate is the flag to check for view switch which contains the previous card size
        if (this.bRecreate) {
            oCard.dashboardLayout.colSpan = this.bRecreate.colSpan;
            oCard.dashboardLayout.rowSpan = this.bRecreate.rowSpan;
            oCard.dashboardLayout.autoSpan = false;
            this.bRecreate = null;
        }
        oCard.dashboardLayout.width = oCard.dashboardLayout.colSpan * this.oLayoutData.colWidthPx + "px";
        oCard.dashboardLayout.height = oCard.dashboardLayout.rowSpan * this.oLayoutData.rowHeightPx + "px";
        $card.css({
            width: oCard.dashboardLayout.width,
            height: oCard.dashboardLayout.height
        });
        this._triggerCardResize(oCard.dashboardLayout, $card);
        //Calculate the height of the container upon card resize
        var iContainerHeight = this.calculateContainerHeight();
        jQuery(".sapUshellEasyScanLayoutInner").css({"height": iContainerHeight + "px", "z-index": "1"});
    };

	DashboardLayoutUtil.prototype._triggerCardResize = function(cardLayout, $card) {
		//get card controller and send resize data
		if (cardLayout.autoSpan || !cardLayout.visible) {
			//no trigger for autoSpan and hidden cards
			return;
		}

		//set height px data and layouter (compatibility to card property model)
		cardLayout.iRowHeightPx = this.getRowHeightPx();
        cardLayout.iColumnWidthPx = this.getColWidthPx();
        cardLayout.iCardBorderPx = this.CARD_BORDER_PX;
		cardLayout.containerLayout = "resizable";

		var cardId = $card.children().first().attr("id");
		try {
			var oCompInst = sap.ui.getCore().byId(cardId).getComponentInstance();
			if (oCompInst) {
				var oGenCardCtrl = oCompInst.getAggregation("rootControl").getController();
				if (oGenCardCtrl) {
                    oGenCardCtrl.resizeCard(cardLayout);
				} else {
					jQuery.sap.log.warning("OVP resize: no controller found for " + cardId);
				}
			}
		} catch (err) {
			jQuery.sap.log.warning("OVP resize: " + cardId + " catch " + err.toString());
		}
	};
	DashboardLayoutUtil.prototype.refreshOnDrag = function(card) {
		var $card = jQuery("#" + this.getCardDomId(card.id));
		var cardId = $card.children().first().attr("id");
		var oCompInst = sap.ui.getCore().byId(cardId).getComponentInstance();
		if (oCompInst) {
			var oGenCardCtrl = oCompInst.getAggregation("rootControl").getController();
			if (oGenCardCtrl) {
				oGenCardCtrl.refreshCard($card);
			} else {
				jQuery.sap.log.warning("OVP resize: no controller found for " + cardId);
			}
		}
			
	};
	DashboardLayoutUtil.prototype._positionCards = function(aCards) {
		if (!aCards) {
			return;
		}
		var i = 0;
		var pos = {};

		for (i = 0; i < aCards.length; i++) {
			if (!aCards[i].dashboardLayout.visible) {
				continue; //skip invisible cards
			}
			pos = this._mapGridToPositionPx(aCards[i].dashboardLayout);
			aCards[i].dashboardLayout.top = pos.top;
			aCards[i].dashboardLayout.left = pos.left;

			var $card = jQuery("#" + this.getCardDomId(aCards[i].id));
			$card.css({
				top: pos.top,
				left: pos.left
			});
		}
	};

	DashboardLayoutUtil.prototype.layoutCards = function(cards) {
		var aCards = cards || this.aCards;

		var i = 0;
		var pos = {};

		for (i = 0; i < aCards.length; i++) {
			if (!aCards[i].dashboardLayout.visible) {
				continue; //skip invisible cards
			}
			pos = this._mapGridToPositionPx(aCards[i].dashboardLayout);

			aCards[i].dashboardLayout.top = pos.top;
			aCards[i].dashboardLayout.left = pos.left;
			aCards[i].dashboardLayout.width = aCards[i].dashboardLayout.colSpan * this.oLayoutData.colWidthPx + "px";
			aCards[i].dashboardLayout.height = aCards[i].dashboardLayout.rowSpan * this.oLayoutData.rowHeightPx + "px";

			var $card = jQuery("#" + this.getCardDomId(aCards[i].id));
			$card.css({
				top: pos.top,
				left: pos.left,
				width: aCards[i].dashboardLayout.width,
				height: aCards[i].dashboardLayout.height
			});
			this._triggerCardResize(aCards[i].dashboardLayout, $card);
		}
	};

	DashboardLayoutUtil.prototype.resizeCard = function(cardDomId, span) {
		var layoutChanges = this.dashboardLayoutModel.resizeCard(this.getCardId(cardDomId), span, /*manual resize*/ true);

		this._sizeCard(layoutChanges.resizeCard);
		this._positionCards(layoutChanges.affectedCards);

		if (!this.dashboardLayoutModel.validateGrid()) {
			/*sap.m.MessageToast.show("DashboardLayoutModel is inconsistent! [ResizeCard]", {
				at: "center center",
				width: "50rem"
			});*/
			//should not happen! fallback: undo last change to avoid inconsisties in model
			this.dashboardLayoutModel.undoLastChange();
		}
	};

	DashboardLayoutUtil.prototype._sortCardsByCol = function(aCards) {

		//sort by columns and order in column
		aCards.sort(function(card1, card2) {
			// defaults for cards without dashboardLayout data
			if (card1.dashboardLayout.column && card1.dashboardLayout.row && card1.dashboardLayout.column === card2.dashboardLayout.column) {
				if (card1.dashboardLayout.row < card2.dashboardLayout.row) {
					return -1;
				} else if (card1.dashboardLayout.row > card2.dashboardLayout.row) {
					return 1;
				}
			} else if (card1.dashboardLayout.column) {
				return card1.dashboardLayout.column - card2.dashboardLayout.column;
			} else {
				return 0;
			}
		});
	};

	DashboardLayoutUtil.prototype._sortCardsByRow = function(aCards) {

		//sort by columns and order in column
		aCards.sort(function(card1, card2) {
			// defaults for cards without dashboardLayout data
			if (card1.dashboardLayout.column && card1.dashboardLayout.row && card1.dashboardLayout.row === card2.dashboardLayout.row) {
				if (card1.dashboardLayout.column < card2.dashboardLayout.column) {
					return -1;
				} else if (card1.dashboardLayout.column > card2.dashboardLayout.column) {
					return 1;
				}
			} else if (card1.dashboardLayout.row) {
				return card1.dashboardLayout.row - card2.dashboardLayout.row;
			} else {
				return 0;
			}
		});
	};

	// map grid coords to position coords
	DashboardLayoutUtil.prototype._mapGridToPositionPx = function(gridPos) {
		var pos = {
			top: (gridPos.row - 1) * this.getRowHeightPx() + "px",
			left: (gridPos.column - 1) * this.getColWidthPx() + "px"
		};
		return pos;
	};

	// map position coords to grid coords to position coords
	DashboardLayoutUtil.prototype.mapPositionToGrid = function(pos) {
		var gridPos = {};
		//get grid coordinates from the current touchpoint coordinates
        gridPos.row = Math.floor((pos.top + 1) / this.oLayoutData.rowHeightPx) + 1;
        gridPos.column = Math.floor((pos.left + 1) / this.oLayoutData.colWidthPx) + 1;
		return gridPos;
	};

	//returns the number of pixel for one rem from the current browser font size
	DashboardLayoutUtil.prototype.getPixelPerRem = function() {
		// Returns a number
		var fontSize = parseFloat(
			// of the computed font-size, so in px
			getComputedStyle(
				// for the root <html> element
				document.documentElement
			)
			.fontSize
		);
		return fontSize;
	};

	DashboardLayoutUtil.prototype._getCardComponentDomId = function(cardId) {
		return this.componentDomId + "--" + cardId;
	};

	DashboardLayoutUtil.prototype._getCardController = function(cardId) {
		var oCtrl = null;
		var cardView = sap.ui.getCore().byId(this._getCardComponentDomId(cardId));
		if (cardView) {
			oCtrl = cardView.getComponentInstance().getAggregation("rootControl").getController();
		}
		return oCtrl;
	};

	DashboardLayoutUtil.prototype._setCardsCssValues = function(aCards) {
		var i = 0;
		for (i = 0; i < aCards.length; i++) {
			this.setCardCssValues(aCards[i]);
		}
	};

	DashboardLayoutUtil.prototype.setCardCssValues = function(oCard) {
		oCard.dashboardLayout.top = ((oCard.dashboardLayout.row - 1) * this.oLayoutData.rowHeightPx) + "px";
		oCard.dashboardLayout.left = ((oCard.dashboardLayout.column - 1) * this.oLayoutData.colWidthPx) + "px";
		oCard.dashboardLayout.width = (oCard.dashboardLayout.colSpan * this.oLayoutData.colWidthPx) + "px";
		oCard.dashboardLayout.height = (oCard.dashboardLayout.rowSpan * this.oLayoutData.rowHeightPx) + "px";
	};

	DashboardLayoutUtil.prototype.convertRemToPx = function(value) {
		var val = value;
		if (typeof value === "string" || value instanceof String) { //take string with a rem unit
			val = value.length > 0 ? parseInt(value.split("rem")[0], 10) : 0;
		}
		return val * this.getPixelPerRem();
	};

	DashboardLayoutUtil.prototype.convertPxToRem = function(value) {
		var val = value;
		if (typeof value === "string" || value instanceof String) { //take string with a rem unit
			val = value.length > 0 ? parseFloat(value.split("px")[0], 10) : 0;
		}
		return val / this.getPixelPerRem();
	};

	DashboardLayoutUtil.prototype.getLayoutWidthPx = function() {
		return this.oLayoutData.colCount * this.oLayoutData.colWidthPx;
	};

	DashboardLayoutUtil.prototype.getColWidthPx = function() {
		return this.oLayoutData.colWidthPx;
	};

	DashboardLayoutUtil.prototype.getRowHeightPx = function() {
		return this.oLayoutData.rowHeightPx;
	};

	DashboardLayoutUtil.prototype._setColCount = function(iColCount) {
		this.oLayoutData.colCount = iColCount;
		//console.log("ColCount set to " + this.oLayoutData.colCount);
	};

	/**
	 * simulates floater dropping
	 * get affected cell by rounded position values, cards covered by ghost and the push direction
	 * scroll and offset are not considered here
	 *
	 * @method getDropSimData
	 * @param {Object} floaterData - top/left/id
	 * @returns {Object} containing cellPos + coveredCardIds + push direction
	 */
    DashboardLayoutUtil.prototype.getDropSimData = function(floaterData) {
        var oGridSpan = {};
        var aCoveredCards = [];
        var aCoveredCardIds = [];
        var i = 0;

        var rowHeightPx = this.oLayoutData.rowHeightPx;
        var colWidthPx = this.oLayoutData.colWidthPx;
        var oCard = this.dashboardLayoutModel.getCardById(this.getCardId(floaterData.id));

        var targetCell = {
            column: Math.round(floaterData.left / colWidthPx),
            row: Math.round(floaterData.top / rowHeightPx)
        };
        //for top/left 0 is valid
        targetCell.row = (targetCell.row < 1) ? 0 : targetCell.row;
        targetCell.column = (targetCell.column < 0) ? 0 : targetCell.column;

        var floaterColumns = oCard ? oCard.dashboardLayout.colSpan : 0;
        if (targetCell.column + floaterColumns > (this.oLayoutData.colCount)) {
            targetCell.column = this.oLayoutData.colCount - floaterColumns;
        }
        var cellPos = {
            left: (targetCell.column) * colWidthPx,
            top: (targetCell.row) * rowHeightPx
        };
        if (cellPos.left > this.oLayoutData.colCount * colWidthPx) {
            cellPos.left = this.oLayoutData.colCount * colWidthPx;
        }

        if (oCard) {
            //for cards location: + 1
            oGridSpan.y1 = targetCell.row + 1;
            oGridSpan.x1 = targetCell.column + 1;
            oGridSpan.y2 = oGridSpan.y1 + oCard.dashboardLayout.rowSpan - 1;
            oGridSpan.x2 = oGridSpan.x1 + oCard.dashboardLayout.colSpan - 1;

            aCoveredCards = this.dashboardLayoutModel.getCardsByGrid(oGridSpan, this.getCardId(floaterData.id));
            for (i = 0; i < aCoveredCards.length; i++) {
                aCoveredCardIds.push(this.getCardDomId(aCoveredCards[i].id));
            }
        }
        return {
            cellPos: cellPos,
            coveredCards: aCoveredCards,
            coveredCardIds: aCoveredCardIds
        };
    };

    DashboardLayoutUtil.prototype.setRecreateCard = function (bRecreate) {
        this.bRecreate = bRecreate;
    };

    /**
     * Calculates the cards affected when user resize any card
     *
     * @method getImmediateAffectedCards
     * @param {Object} oCard - card object which is resized
     * @param {Object} resizeData - object conatins the new rowspan/colspan after resize
     * @returns {Object} affectedCards -  Objects contains a array which holds the id's of affected cards
     */

    DashboardLayoutUtil.prototype.getImmediateAffectedCards = function (oCard, resizeData) {
        var affectedCards = {
            cardIds: []
        }, bFlag = false, cardObject = {};

        cardObject = JSON.parse(JSON.stringify(oCard));
        cardObject.dashboardLayout.rowSpan = resizeData.rowSpan;
        cardObject.dashboardLayout.colSpan = resizeData.colSpan;
        this._sortCardsByRow(this.aCards);
        this.aCards.forEach(function (card) {
            if (card.id === cardObject.id || !card.dashboardLayout.visible) {
                return;
            } else {
                bFlag = this.dashboardLayoutModel._checkOverlapOfCards(cardObject, card);
                if (bFlag === true) {
                    affectedCards.cardIds.push(this.getCardDomId(card.id));
                }
            }

        }.bind(this));
        return affectedCards;
    };

    return DashboardLayoutUtil;
}, /* bExport*/ true); //();