sap.ui.define([], function() {
	"use strict";

	jQuery.sap.require("sap.ovp.ui.UIActions");

	var Rearrange = function(settings) {
		this.init(settings);
	};

	Rearrange.prototype.init = function(settings) {
		settings.beforeDragCallback = this._beforeDragHandler.bind(this);
		settings.dragStartCallback = this._dragStartHandler.bind(this);
		settings.dragMoveCallback = this._dragMoveHandler.bind(this);
		settings.dragEndCallback = this._dragEndHandler.bind(this);
		settings.resizeStartCallback = this._resizeStartHandler.bind(this);
		settings.resizeMoveCallback = this._resizeMoveHandler.bind(this);
		settings.resizeEndCallback = this._resizeEndHandler.bind(this);
		settings.endCallback = this._endHandler.bind(this);

		this.placeHolderClass = settings.placeHolderClass;
		this.layout = settings.layout;
		this.settings = settings;
		this.destroy(); //destroy the previous instance of UIActions
		this.uiActions = new sap.ovp.ui.UIActions(this.settings).enable();
		this.aCardsOrder = null; //DOM elements array
		this.aCards = settings.aCards; //cards properties persistence
		this.layoutUtil = settings.layoutUtil;
		this.verticalMargin = null; //space vertical between items
		this.horizontalMargin = null; //horizontal space vertical between items
		this.top = null; //space between layout top and first card
		this.left = null; //space between layout left and first card
		this.width = null; //item width
		this.layoutOffset = null; //layout coordinates on screen, needed to normalize mouse position to layout
		this.jqLayout = null; //layout jQuery reference
		this.jqLayoutInner = null; //layout inner wrapper jQuery reference
		this.isRTLEnabled = null; //RTL flag
		this.lastCollidedEl = null; //last collided element
		this.rowHeight = settings.rowHeight;
		this.dropZoneItem = null; //floater drop item and insert section 
		this.floaterData = null; //id, position and width of the currently dragged card
		this.resizeData = {}; //card resize data (ghost values)
		this.delta = {
			top: 0,
			left: 0
		};
        this.dragAndDropObject = {};
		switch (true) {
			case sap.ui.Device.browser.webkit:
				this.cssVendorTransition = "-webkit-transition";
				this.cssVendorTransform = "-webkit-transform";
				break;
			case sap.ui.Device.browser.msie:
				this.cssVendorTransition = "-ms-transition";
				this.cssVendorTransform = "-ms-transform";
				break;
			case sap.ui.Device.browser.mozilla:
				this.cssVendorTransition = "-moz-transition";
				this.cssVendorTransform = "-moz-transform";
				break;
			default:
				this.cssVendorTransition = "transition";
				this.cssVendorTransform = "transform";
		}
	};

	Rearrange.prototype.destroy = function() {
		if (this.uiActions) {
			this.uiActions.disable();
			this.uiActions = null;
		}
	};

    //*******************************Resizing Card handlers************************************************//

    /**
     * Callback for UIActions resizeStartCallback, every time when resize starts
     *
     * @method {Private} _resizeStartHandler
     * @param {Object} evt - Event object
     * @param {Object} cardElement - jquery element object on which resize is triggered
     */

    Rearrange.prototype._resizeStartHandler = function (evt, cardElement) {

        var oCard = this.layoutUtil.dashboardLayoutModel.getCardById(this.layoutUtil.getCardId(cardElement.id));
        if (oCard.template === "sap.ovp.cards.stack") {
            return;
        }
        //Prevent selection of text on tiles and groups
        if (jQuery(window).getSelection) {
            var selection = jQuery(window).getSelection();
            selection.removeAllRanges();
        }
        this.initCardsSettings();
    };

    /**
     * Callback for UIActions resizeEndCallback, every time when resize ends
     *
     * @method {Private} _resizeEndHandler
     * @param {Object} evt - Event object
     * @param {Object} cardElement - jquery element object on which resize is triggered
     */

    Rearrange.prototype._resizeEndHandler = function (evt, cardElement) {
        //reset previous preview
        if (jQuery(".displaceItem")[0]) {
            jQuery(".displaceItem").css(this.getCSSTransition(0, 0));
            jQuery(".sapUshellEasyScanLayoutInner").children().removeClass("displaceItem");
        }
        if (cardElement) {
            if (sap.ui.Device.system.desktop) {
                jQuery("body").removeClass("sapOVPDisableUserSelect sapOVPDisableImageDrag");
            }
            jQuery(this.settings.wrapper).removeClass("dragAndDropMode");
            jQuery("#ovpResizeRubberBand").remove();
            if (this.resizeData.colSpan && this.resizeData.rowSpan) {
                //get card controller and send resize data
                this.layoutUtil.resizeCard(cardElement.getAttribute("id"), this.resizeData);
            }
            this.resizeData = {};
            //Save all the layout changes to LREP
            this.layoutUtil.oLayoutCtrl.fireAfterDragEnds();
            if (jQuery(window).getSelection) {
                var selection = jQuery(window).getSelection();
                selection.removeAllRanges();
            }
        }
    };

    /**
     * Callback for UIActions resizeMoveCallback, every time when mouse pointer moves in resize mode
     *
     * @method {Private} _resizeMoveHandler
     * @param {Object} actionObject - jquery element object on which resize is triggered
     */

    Rearrange.prototype._resizeMoveHandler = function (actionObject) {
        if (actionObject.element) {
            actionObject.element.classList.remove("sapOvpMinHeightContainer");
            jQuery("#ovpResizeRubberBand").remove();
            var cardDetails, affectedCards, offset, ghostWidth,
                oCard = this.layoutUtil.dashboardLayoutModel.getCardById(this.layoutUtil.getCardId(actionObject.element.id)),
                oElementWrapper = jQuery(actionObject.element).parent();
            if (oCard.template === "sap.ovp.cards.stack") {
                return;
            }
            cardDetails = this._calculateMinimumCardHeight(actionObject, oCard);
            this.resizeData.rowSpan = Math.round(cardDetails.ghostHeightCursor / this.layoutUtil.getRowHeightPx());
            this.resizeData.colSpan = Math.round(cardDetails.ghostWidthCursor / this.layoutUtil.getColWidthPx());
            this.resizeData.colSpan = this.resizeData.colSpan < 1 ? 1 : this.resizeData.colSpan;

            if (this.resizeData.rowSpan <= cardDetails.iLeastRowSpan) {
                this.resizeData.rowSpan = cardDetails.iLeastRowSpan;
                actionObject.element.classList.add("sapOvpMinHeightContainer");
            } else if (this.resizeData.rowSpan > cardDetails.iLeastRowSpan && this.resizeData.rowSpan <= cardDetails.iMinRowSpan) {
                this.resizeData.rowSpan = cardDetails.iMinRowSpan;
            }
            if (cardDetails.ghostWidthCursor <= this.layoutUtil.getColWidthPx()) {
                ghostWidth = this.layoutUtil.getColWidthPx();
            } else {
                ghostWidth = cardDetails.ghostWidthCursor;
            }
            //Ghost dimension to align with card
            oElementWrapper.append("<div id='ovpResizeRubberBand' class='ovpResizeRubberBand' style='top: " + (cardDetails.fElementPosTop + this.layoutUtil.CARD_BORDER_PX) + "px; left: " +
            (cardDetails.fElementPosLeft + this.layoutUtil.CARD_BORDER_PX) + "px; width: " + (ghostWidth - 2 * this.layoutUtil.CARD_BORDER_PX) +
            "px; height: " + (this.resizeData.rowSpan * this.layoutUtil.getRowHeightPx() - 2 * this.layoutUtil.CARD_BORDER_PX) + "px; cursor:" + cardDetails.cursor + "'></div>");

            affectedCards = this.layoutUtil.getImmediateAffectedCards(oCard, this.resizeData);
            offset = this.layoutUtil.convertRemToPx("4rem");
            if (jQuery(".displaceItem")[0]) {
                jQuery(".displaceItem").css(this.getCSSTransition(0, 0));
                jQuery(".sapUshellEasyScanLayoutInner").children().removeClass("displaceItem");
            }
            affectedCards.cardIds.forEach(function (sCardId) {
                jQuery("#" + sCardId).addClass("displaceItem");
            });
            jQuery(".displaceItem").css(this.getCSSTransition(0, offset));
        }
    };

    //************************************* Drag and Drop Card handlers*****************************************//

    /**
     * Callback for beforeDragCallback in UIActions before clone created
     *
     * @method {Private} _beforeDragHandler
     * @param {Object} evt - Event object
     * @param {Object} cardElement - jquery element object on which drag is triggered
     */

    Rearrange.prototype._beforeDragHandler = function (evt, cardElement) {

        if (evt.type === "mousedown") {
            evt.preventDefault();
        }
        //Prevent the browser to mark any elements while dragging
        if (sap.ui.Device.system.desktop) {
            jQuery("body").addClass("sapOVPDisableUserSelect sapOVPDisableImageDrag");
        }
        //Prevent text selection menu and magnifier on mobile devices
        if (sap.ui.Device.browser.mobile) {
            this.selectableElemets = jQuery(cardElement).find(".sapUiSelectable");
            this.selectableElemets.removeClass("sapUiSelectable");
        }
        jQuery(this.settings.wrapper).addClass("dragAndDropMode");
    };

    /**
     * Callback for UIActions dragStartCallback, every time when before drag starts
     *
     * @method {Private} _dragStartHandler
     * @param {Object} evt - Event object
     * @param {Object} cardElement - jquery element object on which drag event is triggered
     */

    Rearrange.prototype._dragStartHandler = function (evt, cardElement) {
        //Prevent selection of text on tiles and groups
        jQuery.sap.log.info(cardElement);
        if (jQuery(window).getSelection) {
            var selection = jQuery(window).getSelection();
            selection.removeAllRanges();
        }
        this.initCardsSettings();
        //store the width and height of the card for ghost size
        var oCardRect = cardElement.children[0].getBoundingClientRect();
        this.floaterData = {
            width: oCardRect.width,
            height: oCardRect.height,
            startLeft: oCardRect.left - this.layoutOffset.left,
            startTop: oCardRect.top - this.layoutOffset.top - parseInt(jQuery("." + this.placeHolderClass).css("border-top-width"), 10)
        };
    };

    /**
     * Callback for UIActions dragMoveCallback, every time when mouse is moved in drag mode
     *
     * @method {Private} _dragMoveHandler
     * @param {Object} actionObject - jquery element object on which drag event is triggered
     */

    Rearrange.prototype._dragMoveHandler = function (actionObject) {
        jQuery(actionObject.element).css('opacity', 0);
        this.floaterData.id = actionObject.element.id;
        this.floaterData.left = actionObject.moveX - this.uiActions.startX + this.floaterData.startLeft;
        this.floaterData.top = actionObject.moveY - this.uiActions.startY + this.floaterData.startTop + this.jqLayout.scrollTop();

        this.dragAndDropObject = this.layoutUtil.getDropSimData(this.floaterData);
        this.showGhostWhileDragMove();

        //reset previous preview
        if (jQuery(".displaceItem")[0]) {
            jQuery(".displaceItem").css(this.getCSSTransition(0, 0));
            jQuery(".sapUshellEasyScanLayoutInner").children().removeClass("displaceItem");
        }

        if (this.dragAndDropObject.coveredCardIds.length > 0) {
            var offset = this.layoutUtil.convertRemToPx("4rem"); //displacment offset
            this.dragAndDropObject.coveredCardIds.forEach(function (sCardId) {
                jQuery("#" + sCardId).addClass("displaceItem");
            });
            jQuery(".displaceItem").css(this.getCSSTransition(0, offset));
        }
    };

    /**
     * Callback for UIActions dragEndCallback, every time after drag and drop finished
     *
     * @method {Private} _dragEndHandler
     * @param {Object} evt - Event object
     * @param {Object} cardElement - jquery element object on which drag event is triggered
     */

    Rearrange.prototype._dragEndHandler = function (evt, cardElement) {
        this.lastCollidedEl = null;
        jQuery("#ovpDashboardLayoutMarker").remove(); //remove insert marker
        jQuery(".displaceItem").css(this.getCSSTransition(0, 0));
        jQuery(".displaceItem").removeClass("displaceItem");
        var oCard = this.layoutUtil.dashboardLayoutModel.getCardById(this.layoutUtil.getCardId(this.floaterData.id));
        //Calculation of new position of card
        var newCardPosition = {
            row: Math.round(this.floaterData.top / this.layoutUtil.getRowHeightPx()) + 1,
            column: Math.round(this.floaterData.left / this.layoutUtil.getColWidthPx()) + 1
        };
        newCardPosition.row = newCardPosition.row <= 0 ? 1 : newCardPosition.row;
        newCardPosition.column = newCardPosition.column <= 1 ? 1 : newCardPosition.column;
        //If the new position is beyond the viewport then move the card to the desired position
        if (newCardPosition.column + oCard.dashboardLayout.colSpan > this.columnCount) {
            newCardPosition.column = (this.columnCount - oCard.dashboardLayout.colSpan) + 1;
        }

        jQuery.when(this.layoutUtil.dashboardLayoutModel._arrangeCards(oCard, newCardPosition, 'drag')).done(function () {
            this.layoutUtil._positionCards(this.aCards);
        }.bind(this));
        jQuery(cardElement).css('opacity', 1);
        //Save all the layout changes to LREP
        this.layoutUtil.oLayoutCtrl.fireAfterDragEnds();

        // Cleanup added classes and styles before drag
        if (sap.ui.Device.system.desktop) {
            jQuery("body").removeClass("sapOVPDisableUserSelect sapOVPDisableImageDrag");
        }
        jQuery(this.settings.wrapper).removeClass("dragAndDropMode");
        if (jQuery(window).getSelection) {
            var selection = jQuery(window).getSelection();
            selection.removeAllRanges();
        }
        //Calculate the height of the container upon card resize
        var iContainerHeight = this.layoutUtil.calculateContainerHeight();
        jQuery(".sapUshellEasyScanLayoutInner").css({"height": iContainerHeight + "px", "z-index": "1"});
        if (oCard.template === "sap.ovp.cards.charts.analytical") {
            this.layoutUtil.refreshOnDrag(oCard);
        }
    };

    /**
     * Callback for UIActions endCallback, after completion of event
     *
     * @method {Private} _endHandler
     * @param {Object} evt - Event object
     * @param {Object} cardElement - jquery element object on which drag event is triggered
     */

    Rearrange.prototype._endHandler = function (evt, cardElement) {
        jQuery.sap.log.info(cardElement);
        //Prevent text selection menu and magnifier on mobile devices
        if (sap.ui.Device.browser.mobile && this.selectableElemets) {
            this.selectableElemets.addClass("sapUiSelectable");
        }
    };

    //******** ***********************************Helper functions ***************************************************//

    /**
     *  Get the card and the viewport settings when the drag and resize starts
     *
     * @method initCardsSettings
     */

	Rearrange.prototype.initCardsSettings = function() {
		this.jqLayout = this.layout.$();
		this.jqLayoutInner = this.jqLayout.children().first();
		var layoutScroll = this.jqLayout.scrollTop();
		var layoutHeight = this.jqLayoutInner.height();
		this.isRTLEnabled = sap.ui.getCore().getConfiguration().getRTL() ? 1 : -1;
		this.aCardsOrder = [];
		this.layoutOffset = this.jqLayout.offset();
		this.corrY = this.jqLayout.get(0).getBoundingClientRect().top + this.jqLayout.scrollTop();
		this.corrX = this.layoutOffset.left;
		this.columnCount = this.layoutUtil.oLayoutData.colCount;
		var visibleLayoutItems = this.layout.getVisibleLayoutItems();
		if (!visibleLayoutItems) {
			return;
		}
		this.aCardsOrder = visibleLayoutItems.map(function(item) {
			var element = item.$().parent()[0];
			element.posDnD = {
				width: element.offsetWidth,
				height: element.offsetHeight
			};
			return element;
		});
		var jqFirstColumn = this.jqLayoutInner.children().first();
		var marginProp = (this.isRTLEnabled === 1) ? "margin-left" : "margin-right";
		this.verticalMargin = parseInt(jqFirstColumn.css(marginProp), 10);
		var firstItemEl = this.aCardsOrder[0];
		this.horizontalMargin = parseInt(jQuery(firstItemEl).css("margin-bottom"), 10);
		this.verticalMargin = this.horizontalMargin;
		this.top = firstItemEl.getBoundingClientRect().top - this.jqLayoutInner[0].getBoundingClientRect().top;
		this.left = firstItemEl.getBoundingClientRect().left - this.jqLayoutInner[0].getBoundingClientRect().left;
		this.width = firstItemEl.offsetWidth;

		jQuery(this.aCardsOrder).css("position", "absolute");
		this.drawLayout(this.aCardsOrder);

		//all elements are switched to position absolute to prevent layout from collapsing we put height on it like it was before change.
		//and fix scroll, so user will not see position changes on the screen.
		this.jqLayoutInner.height(layoutHeight);
		this.jqLayout.scrollTop(layoutScroll);
	};

	/**
	 * put all items to new positions
	 *
	 * @method drawLayout
	 * @param {Array} aCardsLayout - card layout
	 */
	Rearrange.prototype.drawLayout = function(aCardsLayout) {
		var oCountColumnHeight = [];
		for (var i = 0; i < this.columnCount; i++) {
			oCountColumnHeight[i] = 0;
		}
		for (var naturalIndex = 0; naturalIndex < aCardsLayout.length; naturalIndex++) {
			var domElement = aCardsLayout[naturalIndex];

			var $card = jQuery(aCardsLayout[naturalIndex]);
			domElement.posDnD.top = $card.position().top;
			domElement.posDnD.bottom = $card.position().top + domElement.posDnD.height;
			domElement.posDnD.left = $card.position().left;
			domElement.posDnD.right = $card.position().left + domElement.posDnD.width;
			this.updateElementCSS(aCardsLayout[naturalIndex]);
		}
    };

    Rearrange.prototype.showGhostWhileDragMove = function () {
        var pos = this.layoutUtil._mapGridToPositionPx(this.layoutUtil.mapPositionToGrid(this.dragAndDropObject.cellPos));
        var $ele = jQuery("#ovpDashboardLayoutMarker");
        if ($ele.length === 0) {
            jQuery(".sapUshellEasyScanLayoutInner").append(
                "<div id='ovpDashboardLayoutMarker' style= 'top: " + pos.top + ";" +
                "; left: " + pos.left + ";" +
                "; width: " + this.floaterData.width + "px;" +
                " height: " + this.floaterData.height + "px;'>" +
                "</div>");
        } else {
            $ele.css({
                top: pos.top,
                left: pos.left
            });
        }
    };

	Rearrange.prototype.updateElementCSS = function(element) {
		jQuery(element).css({
			top: element.posDnD.top,
			left: element.posDnD.left
		});
	};

	Rearrange.prototype.getCSSTransition = function(offsetX, offsetY) {
		var oCSS = {};
		oCSS[this.cssVendorTransition] = "all 0.25s ease";
		oCSS[this.cssVendorTransform] = "translate3d(" + offsetX + "px, " + offsetY + "px, 0px)";
		return oCSS;
	};

    /**
     * Function to calculate resize-direction(X, Y or both XY) , minimum card height and the wrapper height and cursor
     *
     * @method {Private} _calculateMinimumCardHeight
     * @param {Object} actionObject - jquery element object on which resize is triggered
     * @param {Object} oCard - card object containing all layout properties
     * @return {Object} - Object containing properties like ghost height , ghost width, cursor, top and left position
     *                    of the ghost, minimum rowspan and least row span
     */

    Rearrange.prototype._calculateMinimumCardHeight = function (actionObject, oCard) {
        var $elem = jQuery(actionObject.element),
            fElementPosLeft = $elem.position().left,
            fElementPosTop = $elem.position().top,
            iLeastRowSpan = 1,
            iMinRowSpan = 1,
            ghostWidthCursor, ghostHeightCursor, cursor;

        //if X-direction resize then ghost height is same as card height
        if (this.uiActions.isResizeX && !this.uiActions.isResizeY) {
            ghostWidthCursor = actionObject.moveX - fElementPosLeft - this.layoutOffset.left;
            ghostHeightCursor = $elem.outerHeight();
            cursor = "ew-resize";
            //if Y-direction resize then ghost width is same as card width
        } else if (!this.uiActions.isResizeX && this.uiActions.isResizeY) {
            ghostWidthCursor = $elem.outerWidth();
            ghostHeightCursor = actionObject.moveY - fElementPosTop - this.layoutOffset.top + this.jqLayout.scrollTop();
            cursor = "ns-resize";
        } else {
            ghostWidthCursor = actionObject.moveX - fElementPosLeft - this.layoutOffset.left;
            ghostHeightCursor = actionObject.moveY - fElementPosTop - this.layoutOffset.top + this.jqLayout.scrollTop(); //this.resizeStartOffset.top;
            cursor = "nwse-resize";
        }
        var cardSizeProperties = this.layoutUtil.calculateCardProperties(oCard.id);
        if (cardSizeProperties) {
            iLeastRowSpan = Math.ceil((cardSizeProperties.leastHeight) / this.layoutUtil.ROW_HEIGHT_PX);
            iMinRowSpan = Math.ceil((cardSizeProperties.minCardHeight + 16) / this.layoutUtil.ROW_HEIGHT_PX);
        }
        return {
            ghostWidthCursor: ghostWidthCursor,
            ghostHeightCursor: ghostHeightCursor,
            cursor: cursor,
            fElementPosTop: fElementPosTop,
            fElementPosLeft: fElementPosLeft,
            iLeastRowSpan: iLeastRowSpan,
            iMinRowSpan: iMinRowSpan
        };
    };
	return Rearrange;

});
