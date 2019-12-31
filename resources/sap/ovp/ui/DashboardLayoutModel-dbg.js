sap.ui.define([], function() {
		"use strict";

		var LayoutModel = function(uiModel, iColCount) {
			this.uiModel = uiModel;
			this.setColCount(iColCount);
			this.aCards = [];
			this.oLayoutVars = null;
			this.oUndoBuffer = {};
			this.bSequenceLayout = null;
			this.oCurrLayoutVar = null;
			this.sManifestLayoutsJSON = null;
			this.iDisplaceRow = 9999;
		};

		/**
		 * set number of columns
		 *
		 * @method setColCount
		 * @param {Int} iColCount - number of columns
		 */
		LayoutModel.prototype.setColCount = function(iColCount) {

			if (!iColCount) {
				this.iColCount = 5; //default
			} else if (iColCount !== this.iColCount) {
				//extract current changed layout variant for later use
				if (this.bLayoutChanged) {
					this._updateCurrentLayoutVariant();
					this.oUndoBuffer = {};
					this.bLayoutChanged = false;
				}
				this.iColCount = iColCount;
			}
		};

		/**
		 * set layout variants
		 * (add and overwriting existing ones)
		 *
		 * @method setLayoutVars
		 * @param {Object} oLayoutVars - object containing layout variants
		 */
		LayoutModel.prototype.setLayoutVars = function(oLayoutVars) {
			var layoutKey = null;
			var sCurrentId = null;
			if (this.oCurrLayoutVar && this.oCurrLayoutVar.__ovpDBLVarId) {
				sCurrentId = this.oCurrLayoutVar.__ovpDBLVarId;
			}
			for (layoutKey in oLayoutVars) {
				if (oLayoutVars.hasOwnProperty(layoutKey) && oLayoutVars[layoutKey]) {
					//overwrite existing ones
					this.oLayoutVars[layoutKey] = oLayoutVars[layoutKey];
				}
			}
			if (sCurrentId) {
				this.oCurrLayoutVar = this.oLayoutVars[sCurrentId];
			}

			//build layout based on new variant
			this._buildGrid();

			//condense empty rows (includes update of current layout variant)
            this._removeSpaceBeforeCard();
		};

		LayoutModel.prototype.setManifestLayoutsJSON = function(sManifestJSON) {
			this.sManifestLayoutsJSON = sManifestJSON;
		};

		/**
		 * update visibility of given cards
		 * (usually called from manage cards dialog)
		 *
		 * @method updateCardVisibility
		 * @param {Array} aChgCards - array containing card ids and visibility state
		 */
		LayoutModel.prototype.updateCardVisibility = function(aChgCards) {
			var i = 0;
			var layoutKey;
			var layoutVar;

			//extract current layout
			this.oLayoutVars["C" + this.iColCount] = this.extractCurrentLayoutVariant();

			for (i = 0; i < aChgCards.length; i++) {
				for (layoutKey in this.oLayoutVars) {
					if (this.oLayoutVars[layoutKey].hasOwnProperty(aChgCards[i].id)) {
						layoutVar = this.oLayoutVars[layoutKey];
						if (layoutVar[aChgCards[i].id].hasOwnProperty("visible") && layoutVar[aChgCards[i].id].visible === false && aChgCards[i].visibility) {
							//init cell coordinates - will be handled later in setCardsLayoutFromVariant
							layoutVar[aChgCards[i].id].col = 0;
							layoutVar[aChgCards[i].id].row = 0;
						}
						layoutVar[aChgCards[i].id].visible = aChgCards[i].visibility;
					}
				}
				this.oCurrLayoutVar = this.oLayoutVars["C" + this.iColCount];
			}
			this._setCardsLayoutFromVariant(this.aCards, this.oCurrLayoutVar);

			//condense empty rows (includes update of current layout variant)
            this._removeSpaceBeforeCard();
		};

		/**
		 * return number of columns
		 *
		 * @method getColCount
		 * @returns {Int} iColCount - number of columns
		 */
		LayoutModel.prototype.getColCount = function() {
			return this.iColCount;
		};

		/**
		 * get cards in current layout
		 *
		 * @method getCards
		 * @param {Int} iColCount (optional)- number of columns
		 * @returns {Array} array containing cards in layout
		 */
		LayoutModel.prototype.getCards = function(iColCount) {

			//build grid if cards array was not filled before or the number of columns has changed
			if (this.aCards.length === 0 || iColCount && iColCount !== this.iColCount) {
				if (iColCount) {
					this.setColCount(iColCount);
				}
				//build grid for this.iColCount columns
				this._buildGrid();
			}

			return this.aCards;
		};

		/**
		 * get card by its id
		 *
		 * @method getCardById
		 * @param {ID} cardId
		 * @returns {Object} card
		 */
		LayoutModel.prototype.getCardById = function(cardId) {

			var oCard = null;
			var i = 0;
			for (i = 0; i < this.aCards.length; i++) {
				oCard = this.aCards[i];
				if (oCard.id === cardId) {
					break;
				}
			}
			return oCard;
		};

		/**
		 * get cards that are (partly) located in given grid
		 *
		 * @method getCardsByGrid
		 * @param {Object} gridSpan - card x1,x2 and y1,y2 grid coordinates
		 * @param {String} ignoreId - (optional) id of card that should be skipped
		 * @returns {Array} of cards
		 */
		LayoutModel.prototype.getCardsByGrid = function(gridSpan, ignoreId) {
			var oCardSpan = {};
			var i = 0;
			var oCard = {};
			var aMatches = [];

			for (i = 0; i < this.aCards.length; i++) {
				oCard = this.aCards[i];

				if (oCard.id === ignoreId || !oCard.dashboardLayout.visible) {
					continue;
				}

				oCardSpan.y1 = oCard.dashboardLayout.row;
				oCardSpan.x1 = oCard.dashboardLayout.column;
				oCardSpan.y2 = oCard.dashboardLayout.row + oCard.dashboardLayout.rowSpan - 1;
				oCardSpan.x2 = oCard.dashboardLayout.column + oCard.dashboardLayout.colSpan - 1;

				if (this._checkOverlap(oCardSpan, gridSpan)) {
					aMatches.push(oCard);
				}
			}
			return aMatches;
		};

		/** 
		 * get the DashboardLayout variants in JSON format
		 * (only variants that were changed manually or originate from lrep)
		 * 
		 * @method getLayoutVariants
		 * @returns {Object} JSON containing the layout variants
		 */
		LayoutModel.prototype.getLayoutVariants4Pers = function() {
			var variant = null;
			//clone this.oLayoutVars and remove variants that were not changed manually
			var oPersVars = JSON.parse(JSON.stringify(this.oLayoutVars));
			for (variant in oPersVars) {
				if (oPersVars[variant].__ovpDBLVarSource === "auto" || oPersVars[variant].__ovpDBLVarSource === "manifest") {
					//delete unchanged variants
					delete oPersVars[variant];
				}
			}
			return oPersVars;
		};

		/**
		 * get card that resides at given grid position
		 *
		 * @method getCardByGridPos
		 * @param {Object} gridPos - column and row
		 * @returns {Object} card residing at grid position
		 */
		LayoutModel.prototype.getCardByGridPos = function(gridPos) {

			this._sortCardsByCol(this.aCards); // can we trust that's already sorted correctly??? not sure...

			var i = 0;
			var oCard = {};

			for (i = 0; i < this.aCards.length; i++) {
				oCard = this.aCards[i];

				if (oCard.dashboardLayout.column <= gridPos.column && (oCard.dashboardLayout.column + oCard.dashboardLayout.colSpan - 1) >= gridPos.column &&
					oCard.dashboardLayout.row <= gridPos.row && (oCard.dashboardLayout.row + oCard.dashboardLayout.rowSpan - 1) >= gridPos.row) {
					return oCard;
				}
			}
		};

		/** 
		 * read layout variants from ui model
		 * @method _readVariants
		 * @param {Boolean} bUseManifest - use manifest versions
		 */
		LayoutModel.prototype._readVariants = function(bUseManifest) {
			var oVariant = {};
			this.oLayoutVars = {};
			var oLayoutRaw = null;

			if (!this.sManifestLayoutsJSON) {
				//this is the initial call, lrep merge not yet done --> "decouple" manifest variants by storing JSON, lrep merge might overwrite later
				oLayoutRaw = this.uiModel.getProperty("/dashboardLayout");
				if (oLayoutRaw) {
					this.sManifestLayoutsJSON = JSON.stringify(oLayoutRaw);
				}
			}

			if (bUseManifest) {
				//these variants are purely manifest based (see above)
				oLayoutRaw = JSON.parse(this.sManifestLayoutsJSON);
			} else {
				//these variants can contain local changes
				oLayoutRaw = this.uiModel.getProperty("/dashboardLayout");
			}

			//pre-set bSequenceLayout; if no variants exist, grid will be build from cards sequence
			this.bSequenceLayout = true;

			if (!oLayoutRaw) {
				return;
			}
			for (var layoutKey in oLayoutRaw) {
				if (oLayoutRaw.hasOwnProperty(layoutKey) && oLayoutRaw[layoutKey]) {
					oVariant = oLayoutRaw[layoutKey];
					oVariant.id = layoutKey;

					if (bUseManifest) {
						oVariant.__ovpDBLVarSource = "manifest";
						oVariant.__ovpDBLVarId = "C" + parseInt(oVariant.id.replace(/[^0-9\.]/g, ""), 10);
					}
					this.oLayoutVars["C" + parseInt(oVariant.id.replace(/[^0-9\.]/g, ""), 10)] = oVariant;
					//variant exists --> no fallback to cards sequence
					this.bSequenceLayout = false;

				}
			}
		};

		/** 
		 * drop layout variants and reload manifest variants
		 * @method resetToManifest
		 */
		LayoutModel.prototype.resetToManifest = function() {
			this.oCurrLayoutVar = null;
			this.oLayoutVars = null;

			this._buildGrid( /*bUseManifest*/ true);
		};

		/**
		 * find best matching layout variant (or create one) and update card dashboardLayout
		 *
		 * @method _buildGrid
		 * @param {Boolean} bUseManifest - use manifest layout variants for read variants (needed for reset)
		 */
		LayoutModel.prototype._buildGrid = function(bUseManifest) {

			var i = 0;
			var oLayoutVar = null;

			if (this.aCards.length === 0) {
				//read cards if not yet done
				this.aCards = this.uiModel.getProperty("/cards");
			}
			if (!this.oLayoutVars || bUseManifest) {
				//read layout variants is not yet done
				this._readVariants(bUseManifest);
			}

			//find best matching layout variant
			if (this.bSequenceLayout) {
				this._sliceSequenceSausage();
				oLayoutVar = this.oLayoutVars["C" + this.iColCount];
				oLayoutVar.__ovpDBLVarSource = "auto";
				this.bSequenceLayout = false;
				// }
			} else if (this.oLayoutVars["C" + this.iColCount]) {
				//get matching variant -- BEST MATCH
				oLayoutVar = this.oLayoutVars["C" + this.iColCount];
			} else if (this.oCurrLayoutVar) {
				//slice current layout variant
				this._sliceSequenceSausage(this.oCurrLayoutVar);
				oLayoutVar = this.oLayoutVars["C" + this.iColCount];
				oLayoutVar.__ovpDBLVarSource = "auto";
			} else {
				//use layout variants for smaller colCounts
				for (i = this.iColCount; i > 0; i--) {
					if (this.oLayoutVars["C" + i]) {
						this._sliceSequenceSausage(this.oLayoutVars["C" + i]);
						oLayoutVar = this.oLayoutVars["C" + this.iColCount];
						oLayoutVar.__ovpDBLVarSource = "auto";
						break;
					}
				}
			}
			if (!oLayoutVar) {
				//last chance: take first variant in object
				for (var oLVar in this.oLayoutVars) {
					//slice this layout variant (the number of columns != this.iColCount)
					this._sliceSequenceSausage(this.oLayoutVars[oLVar]);
					oLayoutVar = this.oLayoutVars["C" + this.iColCount];
					oLayoutVar.__ovpDBLVarSource = "auto";
					break;
				}
			}

			this.oCurrLayoutVar = oLayoutVar;

			// set card grid data from layout variant
			this._setCardsLayoutFromVariant(this.aCards, this.oCurrLayoutVar);
			this._sortCardsByCol(this.aCards);
		};

		LayoutModel.prototype._setCardsLayoutFromVariant = function(aCards, oLayoutVariant) {
			var oCard = {};
			var oLayoutCard = {};
			var i = 0;

			for (i = 0; i < aCards.length; i++) {
				oCard = aCards[i];
				oLayoutCard = oLayoutVariant[oCard.id];
				if (oLayoutCard) {
					oCard.dashboardLayout = {};
					if (oLayoutCard.colSpan) {
						oCard.dashboardLayout.colSpan = oLayoutCard.colSpan;
					} else {
						oCard.dashboardLayout.colSpan = 1;
					}
					if (oLayoutCard.rowSpan) {
						oCard.dashboardLayout.rowSpan = oLayoutCard.rowSpan;
					} else {
						oCard.dashboardLayout.rowSpan = 12;
					}

					if (oLayoutCard.hasOwnProperty("visible") && oLayoutCard.visible === false) {
						oCard.dashboardLayout.visible = false;
					} else {
						oCard.dashboardLayout.visible = true;

						if (oLayoutCard.col === 0 || oLayoutCard.row === 0) {
							//card was invisible before --> put it at the very end (empty rows will be condensed later)
							this._displaceCardToEnd(oCard);
						} else {
							oCard.dashboardLayout.column = oLayoutCard.col;
							oCard.dashboardLayout.row = oLayoutCard.row;
						}

						if (oLayoutCard.autoSpan) {
							oCard.dashboardLayout.autoSpan = oLayoutCard.autoSpan;
						}
						if (oCard.dashboardLayout.colSpan > this.iColCount) {
							oCard.dashboardLayout.colSpan = this.iColCount;
						}
					}
				} else {
					//card is not maintained in layout --> put it at the very end
					//get default span from card settings
					this._setCardSpanFromDefault(oCard);
					this._displaceCardToEnd(oCard);

					//add card to layout variant
					oLayoutVariant[oCard.id] = {
						col: oCard.dashboardLayout.column,
						row: oCard.dashboardLayout.row,
						colSpan: oCard.dashboardLayout.colSpan,
						rowSpan: oCard.dashboardLayout.rowSpan
					};
					oLayoutVariant.__ovpDBLVarSource = "auto";
				}

				//layout verification; if data is inconsistent (non existing column, too wide) put card to the end
				if (oCard.dashboardLayout.column > this.iColCount) {
					//card is located in invalid column
					this._displaceCardToEnd(oCard);
					jQuery.sap.log.warning("DashboardLayout: card (" + oCard.id + ") in invalid column -> moved to end");
				}
				if (oCard.dashboardLayout.column + oCard.dashboardLayout.colSpan - 1 > this.iColCount) {
					//card is too wide for its position
					oCard.dashboardLayout.colSpan = Math.min(oCard.dashboardLayout.colSpan, this.iColCount);
					this._displaceCardToEnd(oCard);
					jQuery.sap.log.warning("DashboardLayout: card (" + oCard.id + ") too wide -> moved to end");
				}
			}

			//finally ensure a consistent grid
			this.validateGrid( /*bRepair*/ true);
		};

		LayoutModel.prototype._displaceCardToEnd = function(oCard) {
			oCard.dashboardLayout.column = 1;
			oCard.dashboardLayout.row = this.iDisplaceRow;
			this.iDisplaceRow += oCard.dashboardLayout.rowSpan;
		};

		LayoutModel.prototype._setCardSpanFromDefault = function(oCard) {
			if (!oCard.dashboardLayout) {
				oCard.dashboardLayout = {};
			}
			if (!oCard.settings.defaultSpan || oCard.settings.defaultSpan === "auto") {
				oCard.dashboardLayout.autoSpan = true;
				oCard.dashboardLayout.colSpan = 1;
				oCard.dashboardLayout.rowSpan = 12;
			} else {
				if (oCard.settings.defaultSpan && oCard.settings.defaultSpan.cols) {
					oCard.dashboardLayout.colSpan = Math.min(oCard.settings.defaultSpan.cols, this.iColCount);
				} else {
					oCard.dashboardLayout.colSpan = 1;
				}
				if (oCard.settings.defaultSpan && oCard.settings.defaultSpan.rows) {
					oCard.dashboardLayout.rowSpan = oCard.settings.defaultSpan.rows;
				} else {
					oCard.dashboardLayout.rowSpan = 12;
				}
			}
		};

		/**
		 * LayoutModel _sliceSequenceSausage
		 *
		 * @method _sliceSequenceSausage
		 * @param {Object} oUseVariant - layout variant to use
		 */
		LayoutModel.prototype._sliceSequenceSausage = function(oUseVariant) {
			// fallback grid
			var i = 0;
			var j = 0;
			var iCol = 0;
			var iColEnd = 0;
			var iMaxRows = 0;
			var oCard = {};
			var aSliceCols = [];

			if (!oUseVariant) {
				this._sortCardsSausage(this.aCards);
			}

			// array to remember occupied columns
			for (i = 0; i < this.iColCount; i++) {
				aSliceCols.push({
					col: i + 1,
					rows: 0
				});
			}

			for (i = 0; i < this.aCards.length; i++) {
				oCard = this.aCards[i];

				// span data from card settings
				if (!oCard.dashboardLayout) {
					oCard.dashboardLayout = {};
				}

				if (!oUseVariant || !oUseVariant.hasOwnProperty(oCard.id)) {
					//set defaults if variant not given or card is not included in variant
					this._setCardSpanFromDefault(oCard);
				} else {
					if (oUseVariant[oCard.id].hasOwnProperty("visible")) {
						oCard.dashboardLayout.visible = oUseVariant[oCard.id].visible;
					}
					if (oUseVariant[oCard.id].colSpan && oUseVariant[oCard.id].colSpan > 0) {
						oCard.dashboardLayout.colSpan = oUseVariant[oCard.id].colSpan;
					} else {
						oCard.dashboardLayout.colSpan = 1;
					}
					if (oUseVariant[oCard.id].rowSpan && oUseVariant[oCard.id].rowSpan > 0) {
						oCard.dashboardLayout.rowSpan = oUseVariant[oCard.id].rowSpan;
					} else {
						oCard.dashboardLayout.rowSpan = 12;
					}
				}

				if (oCard.dashboardLayout.hasOwnProperty("visible") && oCard.dashboardLayout.visible === false) {
					oCard.dashboardLayout.column = 0;
					oCard.dashboardLayout.row = 0;
					continue;
				} else if (!oCard.dashboardLayout.hasOwnProperty("visible")) {
					oCard.dashboardLayout.visible = true;
				}

				if (oCard.dashboardLayout.colSpan > this.iColCount) {
					oCard.dashboardLayout.colSpan = this.iColCount;
				}

				if (iColEnd < this.iColCount) {
					iCol = iColEnd + 1;
				} else {
					iCol = 1;
				}

				//check end col
				if (iCol + oCard.dashboardLayout.colSpan - 1 > this.iColCount) {
					iCol = 1;
				}
				iColEnd = iCol + oCard.dashboardLayout.colSpan - 1;
				oCard.dashboardLayout.column = iCol;

				// get max rows of all affected rows
				iMaxRows = 0;
				for (j = oCard.dashboardLayout.column; j < oCard.dashboardLayout.column + oCard.dashboardLayout.colSpan; j++) {
					if (aSliceCols[j - 1].rows > iMaxRows) {
						iMaxRows = aSliceCols[j - 1].rows;
					}
				}
				oCard.dashboardLayout.row = iMaxRows + 1;

				// set rows count of all affected columns
				for (j = oCard.dashboardLayout.column; j < oCard.dashboardLayout.column + oCard.dashboardLayout.colSpan; j++) {
					aSliceCols[j - 1].rows = iMaxRows + oCard.dashboardLayout.rowSpan;
				}
			}

			this.oLayoutVars["C" + this.iColCount] = this.extractCurrentLayoutVariant();
		};

		/**
		 * LayoutModel _sortCardsSausage
		 *
		 * @method _sortCardsSausage
		 * @param {Array} aCards - cards array
		 */
		LayoutModel.prototype._sortCardsSausage = function(aCards) {
			aCards.sort(function(card1, card2) {
				// both cards have sequence position
				if (card1.sequencePos && card2.sequencePos) {
					if (card1.sequencePos < card2.sequencePos) {
						return -1;
					} else if (card1.sequencePos > card2.sequencePos) {
						return 1;
					} else {
						return 0;
					}
					// the one with sequence pos moves up
				} else if (card1.sequencePos && !card2.sequencePos) {
					return -1;
				} else if (!card1.sequencePos && card2.sequencePos) {
					return 1;
					// sort by id
				} else {
					if (card1.id < card2.id) {
						return -1;
					} else if (card1.id > card2.id) {
						return 1;
					} else {
						return 0;
					}
				}
			});
		};

		/**
		 * sort and order cards by column
		 *
		 * @method _sortCardsByCol
		 * @param {Array} aCards - cards array
		 */
		LayoutModel.prototype._sortCardsByCol = function(aCards) {

			//sort by columns and order in column
			aCards.sort(function(card1, card2) {
				//if one card has no layout data, the other one get's up
				if (!card1.dashboardLayout && card2.dashboardLayout) {
					return 1;
				} else if (card1.dashboardLayout && !card2.dashboardLayout) {
					return -1;
				}

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

		/**
		 * sort and order cards by row
		 *
		 * @method _sortCardsByRow
		 * @param {Array} aCards - cards array
		 */
		LayoutModel.prototype._sortCardsByRow = function(aCards) {

			//sort by columns and order in column
			aCards.sort(function(card1, card2) {
				//if one card has no layout data, the other one get's up
				if (!card1.dashboardLayout && card2.dashboardLayout) {
					return 1;
				} else if (card1.dashboardLayout && !card2.dashboardLayout) {
					return -1;
				}

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

		/**
		 * check if two cards are overlapping
		 *
		 * @method _checkOverlap
		 * @param {Object} a - card x1,x2 and y1,y2 grid coordinates
		 * @param {Object} b - card x1,x2 and y1,y2 grid coordinates
		 * @returns {Boolean} true if a and b overlaps
		 */
		LayoutModel.prototype._checkOverlap = function(a, b) {
			var bX, bY = false;

			if ((a.x1 >= b.x1 && a.x1 <= b.x2) || // overlaps a from the left
				(a.x2 >= b.x1 && a.x2 <= b.x2) || // overlaps a from the right
				(b.x1 >= a.x1 && b.x2 <= a.x2) // inside a
			) {
				bX = true;
			}

			if ((a.y1 >= b.y1 && a.y1 <= b.y2) || // overlaps from top
				(a.y2 >= b.y1 && a.y2 <= b.y2) || // overlaps from bottom
				(b.y1 >= a.y1 && b.y2 <= a.y2) // inside a
			) {
				bY = true;
			}
			return (bX && bY);
		};

		/**
		 * rewind last card arrangement
		 * using undo buffer
		 */
		LayoutModel.prototype.undoLastChange = function() {
			if (this.oUndoBuffer.layoutVariant) {
				this.oLayoutVars["C" + this.iColCount] = this.oUndoBuffer.layoutVariant;
				this.oUndoBuffer = {};
			}
		};

        /**
         * Method to handle resize of card
         *
         * @method {Public} resizeCard
         * @param {String} cardId - Card Id which is resized
         * @param {object} oSpan - Updated rowspan and colspan of the card
         * @param {boolean} bManualResize - Flag to check that if the card is resized by user or the initial loading
         * @return {Object}   {resizeCard : , affectedCards: } - Object containing the Updated card properties and affected cards
         */
        LayoutModel.prototype.resizeCard = function (cardId, oSpan, bManualResize) {

            this._registerChange("resize");
            var oRCard = this.getCardById(cardId);
            if (!oRCard) {
                return [];
            }
            var deltaH = oSpan.colSpan - oRCard.dashboardLayout.colSpan;
            var deltaV = oSpan.rowSpan - oRCard.dashboardLayout.rowSpan;

            if (deltaH === 0 && deltaV === 0) {
                return {
                    resizeCard: oRCard,
                    affectedCards: []
                };
            } else if (bManualResize && oRCard.dashboardLayout.autoSpan) {
                oRCard.dashboardLayout.autoSpan = false;
            }

            if (!bManualResize || (deltaV && deltaH === 0)) {
                this._arrangeCards(oRCard, {
                    "row": oSpan.rowSpan,
                    "column": oRCard.dashboardLayout.colSpan
                }, 'resize');
            } else {
                this._arrangeCards(oRCard, {
                    "row": oSpan.rowSpan,
                    "column": oSpan.colSpan
                }, 'resize');
            }
            oRCard.dashboardLayout.colSpan = oSpan.colSpan;
            oRCard.dashboardLayout.rowSpan = oSpan.rowSpan;
            return {
                resizeCard: oRCard,
                affectedCards: this.aCards
                //affectedCards: this._removeSpaceBeforeCard()
            };
        };

        /**
         * Method to remove the unnesessary spaces before card
         *
         * @method {Private} _removeSpaceBeforeCard
         * @return {Array of Objects} this.aCards - Updated position of array of cards object
         */
        LayoutModel.prototype._removeSpaceBeforeCard = function () {
            this._sortCardsByRow(this.aCards);
            var delta = {}, tempArr = [];

            for (var i = 1; i <= this.iColCount; i++) {
                delta[i] = 1;
            }

            for (var j = 0; j < this.aCards.length; j++) {
                var lowerLimit = this.aCards[j].dashboardLayout.column;
                var upperLimit = this.aCards[j].dashboardLayout.column + this.aCards[j].dashboardLayout.colSpan - 1;
                if (this.aCards[j].dashboardLayout.colSpan > 1) {
                    for (var k = lowerLimit; k <= upperLimit; k++) {
                        tempArr.push(delta[k]);
                    }
                    var maxRow = Math.max.apply(Math, tempArr);
                    for (var l = lowerLimit; l <= upperLimit; l++) {
                        delta[l] = maxRow + this.aCards[j].dashboardLayout.rowSpan;
                    }
                    this.aCards[j].dashboardLayout.row = maxRow;
                } else {
                    if ((this.aCards[j].dashboardLayout.row !== delta[lowerLimit])) {
                        this.aCards[j].dashboardLayout.row = delta[lowerLimit];
                    }
                    delta[lowerLimit] = this.aCards[j].dashboardLayout.row + this.aCards[j].dashboardLayout.rowSpan;
                }
            }
            this._updateCurrentLayoutVariant();
            return this.aCards;
        };

        /**
         * Method called to update new position of cards upon drag or resize
         *
         * @method {Private} _arrangeCards
         * @param {Object} oCard - Card object
         * @param {Object} newCardPosition - If the card is dragged then newCardPosition is the new starting point of the card
         *                                 - If the card is resized then newCardPosition is the changes in the rowspan and colspan
         * @param {Boolean} dragOrResize - Flag to distiguish between drag and drop or resize
         */
        LayoutModel.prototype._arrangeCards = function (oCard, newCardPosition, dragOrResize) {
            this._sortCardsByRow(this.aCards);
            var affectedCards = [];
            var flag = false;
            //If the card is dragged then newCardPosition is the new starting point of the card
            if (dragOrResize === "drag") {
                oCard.dashboardLayout.row = newCardPosition.row;
                oCard.dashboardLayout.column = newCardPosition.column;
                //If the card is resized then newCardPosition is the changes in the rowspan and colspan
            } else if (dragOrResize === "resize") {
                oCard.dashboardLayout.rowSpan = newCardPosition.row;
                oCard.dashboardLayout.colSpan = newCardPosition.column;
            }

            affectedCards.push(oCard);
            for (var i = 0; i < affectedCards.length; i++) {
                for (var j = 0; j < this.aCards.length; j++) {
                    if (affectedCards[i].id === this.aCards[j].id || !affectedCards[i].dashboardLayout.visible) {
                        continue;
                    } else {
                        flag = this._checkOverlapOfCards(affectedCards[i], this.aCards[j]);
                        if (flag === true) {
                            this.aCards[j].dashboardLayout.row = affectedCards[i].dashboardLayout.row + affectedCards[i].dashboardLayout.rowSpan;
                            affectedCards.push(this.aCards[j]);
                        }
                    }
                }
            }
        };

        /**
         * Method to check that if two cards are colliding or not
         *
         * @method {Private} _checkOverlapOfCards
         * @param {Object} originalCard - Original card object
         * @param {Object} affectedCard - The card with which needs to be checked object
         * @return {Boolean} collideX && collideY - collide in x-direction and collide in y-direction
         */
        LayoutModel.prototype._checkOverlapOfCards = function (originalCard, affectedCard) {
            var originalCardStartRow = originalCard.dashboardLayout.row;
            var originalCardEndRow = originalCard.dashboardLayout.row + originalCard.dashboardLayout.rowSpan;
            var originalCardStartColumn = originalCard.dashboardLayout.column;
            var originalCardEndColumn = originalCard.dashboardLayout.column + originalCard.dashboardLayout.colSpan;

            var affectedCardStartRow = affectedCard.dashboardLayout.row;
            var affectedCardEndRow = affectedCard.dashboardLayout.row + affectedCard.dashboardLayout.rowSpan;
            var affectedCardStartColumn = affectedCard.dashboardLayout.column;
            var affectedCardEndColumn = affectedCard.dashboardLayout.column + affectedCard.dashboardLayout.colSpan;

            var collideX = false,
                collideY = false;
            //Collision in X-direction

            if ((affectedCardStartColumn >= originalCardStartColumn && affectedCardStartColumn < originalCardEndColumn) ||
                (affectedCardEndColumn > originalCardStartColumn && affectedCardEndColumn <= originalCardEndColumn) ||
                (affectedCardStartColumn <= originalCardStartColumn && affectedCardEndColumn >= originalCardEndColumn)) {
                collideX = true;
            }
            //Collision in Y-direction
            if ((affectedCardStartRow >= originalCardStartRow && affectedCardStartRow < originalCardEndRow) ||
                (affectedCardEndRow > originalCardStartRow && affectedCardEndRow <= originalCardEndRow) ||
                (affectedCardStartRow <= originalCardStartRow && affectedCardEndRow >= originalCardEndRow)) {
                collideY = true;
            }
            return collideX && collideY;
        };
		/**
		 * drop duplicate entries in given array
		 *
		 * @method condenseCardArray
		 * @param {Array} array of cards
		 * @return {Array} resulting condensed array
		 */
		LayoutModel.prototype.condenseCardArray = function(array) {
			this._sortCardsByCol(array);
			return array.reduce(function(collect, current) {
				if (collect.indexOf(current) < 0) {
					collect.push(current);
				}
				return collect;
			}, []);
		};

		/**
		 * extract the current layout variant into a new object
		 *
		 * @method extractCurrentLayoutVariant
		 * @returns {Object} new object containing current layout variant data
		 */
		LayoutModel.prototype.extractCurrentLayoutVariant = function() {
			var i = 0;
			var oCard = {};
			var oVariant = {};

			for (i = 0; i < this.aCards.length; i++) {
				oCard = this.aCards[i];
				oVariant[oCard.id] = {
					col: oCard.dashboardLayout.column,
					row: oCard.dashboardLayout.row,
					colSpan: oCard.dashboardLayout.colSpan,
					rowSpan: oCard.dashboardLayout.rowSpan,
					visible: oCard.dashboardLayout.visible
				};
				if (oCard.dashboardLayout.autoSpan) {
					oVariant[oCard.id].autoSpan = oCard.dashboardLayout.autoSpan;
				}
			}
			if (this.oCurrLayoutVar && this.oCurrLayoutVar.__ovpDBLVarSource) {
				oVariant.__ovpDBLVarSource = this.oCurrLayoutVar.__ovpDBLVarSource;
			}
			oVariant.__ovpDBLVarId = "C" + this.iColCount;
			return oVariant;
		};

		/**
		 * update the current layout variant
		 *
		 * @method _updateCurrentLayoutVariant
		 */
		LayoutModel.prototype._updateCurrentLayoutVariant = function() {
			this.oCurrLayoutVar = this.extractCurrentLayoutVariant();
			this.oLayoutVars["C" + this.iColCount] = this.oCurrLayoutVar;
		};

		/**
		 * get the current layout variant
		 *
		 * @method _getCurrentLayoutVariant
		 * @returns current layout variant
		 */
		LayoutModel.prototype._getCurrentLayoutVariant = function() {
			//return this.oLayoutVars["C" + this.iColCount];
			return this.oCurrLayoutVar;
		};

		LayoutModel.prototype._registerChange = function(action) {
			this.bLayoutChanged = true;
			this.oCurrLayoutVar.__ovpDBLVarSource = "user";
			this.oUndoBuffer.action = action;
			this.oUndoBuffer.layoutVariant = this.extractCurrentLayoutVariant();
		};

		/**
		 * get an array containing all occupied grid cells and their "tenant"
		 *
		 * @method _extractGrid
		 * @param {String} sortBy - "col" or "row"
		 * @returns {Array} aCells - array of cells
		 */
		LayoutModel.prototype._extractGrid = function(sortBy) {
			var first = sortBy;
			var second = "";

			if (first === "col") {
				second = "row";
			} else if (first === "row") {
				second = "col";
			} else {
				jQuery.sap.log.error("DashboardLayoutModel._getCurrentLayoutVariant: param sortBy has to be col or row!");
			}

			//get occupied cells first
			var aCells = [];
			var i = 0;
			var ri = 0;
			var ci = 0;

			for (i = 0; i < this.aCards.length; i++) {
				var cardLayout = this.aCards[i].dashboardLayout;
				if (cardLayout.visible === false) {
					continue;
				}
				for (ri = cardLayout.row; ri < cardLayout.row + cardLayout.rowSpan; ri++) {
					for (ci = cardLayout.column; ci < cardLayout.column + cardLayout.colSpan; ci++) {
						aCells.push({
							col: ci,
							row: ri,
							card: this.aCards[i]
						});
					}
				}
			}

			//sort by given attribute
			aCells.sort(function(cell1, cell2) {
				// defaults for cards without dashboardLayout data
				if (cell1[first] === cell2[first]) {
					if (cell1[second] < cell2[second]) {
						return -1;
					} else if (cell1[second] > cell2[second]) {
						return 1;
					}
				} else {
					return cell1[first] - cell2[first];
				}
			});
			return aCells;
		};

		/**
		 * get the current layout variant
		 *
		 * @method validateGrid
		 * @param {Boolean} bRepair - wether to repair grid (true) -> put inconistent cards at the end
		 * @returns {Boolean} bGridValid - indicates the validity
		 */
		LayoutModel.prototype.validateGrid = function(bRepair) {
			var bGridValid = true;
			var i = 0;
			var aCells = this._extractGrid("row");
			var prev = aCells[0];
			var curr = {};
			var aDisplaceCards = [];

			for (i = 1; i < aCells.length; i++) {
				curr = aCells[i];
				if (curr.col > this.iColCount || curr.col < 0) {
					bGridValid = false;
					aDisplaceCards.push(curr.card);
					jQuery.sap.log.warning("DashboardLayout: Cell is outside (col/row): " + curr.col + "/" + curr.row);
				}
				if (curr.col === prev.col && curr.row === prev.row) {
					bGridValid = false;
					aDisplaceCards.push(curr.card);
					jQuery.sap.log.warning("DashboardLayout: Cell has two tenants (col/row//id1/id2: " + curr.col + "/" + curr.row + "//" + prev.card.id +
						"/" + curr
						.card.id);
				}
				prev = curr;
			}

			//repair grid
			if (bRepair && aDisplaceCards.length > 0) {
				aDisplaceCards = this.condenseCardArray(aDisplaceCards);
				for (i = 0; i < aDisplaceCards.length; i++) {
					this._displaceCardToEnd(aDisplaceCards[i]);
				}
               this._removeSpaceBeforeCard();
				bGridValid = true;
				jQuery.sap.log.info("DashboardLayout: invalid grid repaired");
			}

			return bGridValid;
		};
		return LayoutModel;

	}, /* bExport= */
	true);