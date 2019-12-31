jQuery.sap.declare("sap.zen.crosstab.EventHandler");
jQuery.sap.require("sap.zen.crosstab.TouchHandler");
jQuery.sap.require("sap.zen.crosstab.SelectionHandler");
jQuery.sap.require("sap.zen.crosstab.rendering.CrossRequestManager");
jQuery.sap.require("sap.zen.crosstab.rendering.RenderingConstants");
jQuery.sap.require("sap.zen.crosstab.utils.Utils");
jQuery.sap.require("sap.zen.crosstab.keyboard.CrosstabKeyboardNavHandler");

sap.zen.crosstab.EventHandler = function (oCrosstab) {
	"use strict";
	
	var that = this;
	var oRenderEngine = oCrosstab.getRenderEngine();
	var oCrossRequestManager = oRenderEngine.getCrossRequestManager();
	var oDataArea = oCrosstab.getDataArea();
	var oRowHeaderArea = oCrosstab.getRowHeaderArea();
	var oColHeaderArea = oCrosstab.getColumnHeaderArea();
	var oDimensionHeaderArea = oCrosstab.getDimensionHeaderArea();
	var oHighlightingInfo = null;
	var oKeyboardHandler = new sap.zen.crosstab.keyboard.CrosstabKeyboardNavHandler(oCrosstab, this);
	var sMouseDownTargetId = null;
	var bPreventClickAction = false;
	var oTouchHandler = null;
	var oJqHeaderResizeHandle = null;
	var iOldMouseX = 0;
	var bResizeHandleDragMode = false;
	var iRenderSizeDivWidthForHeaderResize = 0;
	var iLeftAreaContainerWidthForHeaderResize = 0;
	var sCurrentInputFieldText = "";
	var oInputField = null;

	this.handleHierarchyClick = function (e, sTargetId, sClickAction) {
		var oCell = getCellById(sTargetId);
		var sHierarchyAction = oCell.getHierarchyAction();
		var sDrillState = oCell.getDrillState();
		if (sDrillState !== "L") {
			oCrossRequestManager.saveTableDimensions();
			oCrossRequestManager.saveHScrollInfo(sClickAction);
			oCrossRequestManager.saveVScrollInfo(sClickAction);
			executeAction(sHierarchyAction);
		}
		sap.zen.crosstab.utils.Utils.cancelEvent(e);
	};

	this.handleSortClick = function (e, sTargetId, sClickAction) {
		var oCell = getCellById(sTargetId);
		var sSortAction = oCell.getSortAction();
		if (sSortAction || oCrosstab.getTestProxy().getTestAction()) {
			oCrossRequestManager.saveVScrollInfo(sClickAction);
			oCrossRequestManager.saveHScrollInfo(sClickAction);
			oCrossRequestManager.saveColWidths();
			if (!oCrosstab.getTestProxy().getTestAction()) {
				executeAction(sSortAction);
			}
		}
		sap.zen.crosstab.utils.Utils.cancelEvent(e);
	};

	this.findTargetId = function (oDomTarget) {
		var sTargetId = null;
		var oJqClosestDiv;
		var sCellId;
		
		sCellId = $(oDomTarget).attr("xtabspacer-cellid");
		if (sCellId && sCellId.length > 0) {
			sTargetId = sCellId;
		} else {
			oJqClosestDiv = $(oDomTarget).closest("div");
			if (oJqClosestDiv.length > 0) {
				var sId = oJqClosestDiv.attr("id");
				if (sId) {
					var idx = sId.indexOf("_contentDiv");
					if (idx > -1) {
						sTargetId = sId.slice(0, idx);
					}
				}
			}
		}
		return sTargetId;
	};

	this.executeOnClickAction = function (e) {
		if (bPreventClickAction) {
			return;
		}
		sMouseDownTargetId = null;
		bPreventClickAction = false;
		var sTargetId = e.target.id;

		if (!sTargetId) {
			sTargetId = that.findTargetId(e.target);
		}

		if (!sTargetId) {
			return;
		}
		var sClickAction = getActionById(sTargetId);

		if (sClickAction === "sort") {
			that.handleSortClick(e, sTargetId, sClickAction);
		} else if (sClickAction === "hier") {
			that.handleHierarchyClick(e, sTargetId, sClickAction);
		} else if (sClickAction === "__ce") {
			that.handleClickOnCell(e, sTargetId);
		} else if (sClickAction === "vhlp") {
			that.handleValueHelpClick(sTargetId);
		}
		sap.zen.crosstab.utils.Utils.cancelEvent(e);
	};
	
	this.handleClickOnCell = function(e, sTargetId){
		if (oCrosstab.hasLoadingPages()) {
			sap.zen.crosstab.utils.Utils.cancelEvent(e);
			return;
		}
		
		if (sTargetId) {
			var sCellId = oCrosstab.getUtils().getCellIdFromContenDivId(sTargetId);
			if (sCellId) {
				var oModelCell = sap.ui.getCore().getControl(sCellId);
				if (oModelCell) {
					if(oModelCell.isEntryEnabled()){
						that.handleInputEnabledCell(sTargetId, -1, -1);						
					} else {
						if(oCrosstab.getSelectionMode() !== undefined && oCrosstab.getSelectionMode() !== ""){
							var sFlag = "";
							if(e.ctrlKey){
								sFlag = "CTRL";
							} else if(e.shiftKey){
								sFlag = "SHIFT";
							}
							oCrosstab.getSelectionHandler().handleCellClick(oModelCell, sFlag);	
						}
					}
				}
			}
		}
	};	
	
	this.postPlanningValue = function () {
		if (oCrosstab.isPlanningMode() === true && oInputField && oInputField.length > 0) {
			var oJqInputField = $(document.activeElement);
			if (oJqInputField.is("input") && oInputField.attr("id") === oJqInputField.attr("id")) {
				var sInputFieldValueText = oInputField.val() || "";
				if (sInputFieldValueText !== sCurrentInputFieldText) {
					oInputField.blur();
				}
			}
		}
	};

	this.provideInputEnabledCell = function (oModelCell, sTargetId, oContentDiv, iSelectionStartPos, iSelectionEndPos) {
		oInputField = oContentDiv.find("input");

		if (oInputField.length === 0) {
			var sRenderText = oContentDiv.text();
			var html = oContentDiv.html();
			var bCellIsDataCell = oModelCell.getArea().isDataArea();

			var sSetContentDivWidth = null;

			var executeTransferData = function (sValue) {
				// Cut away the unit if the input was provided with a unit, otherwise the input is invalid
				var sUnit = oModelCell.getUnit();
				if (sUnit && sUnit !== "") {
					var iUnitIndex = sValue.toUpperCase().indexOf(sUnit.toUpperCase());
					if (iUnitIndex !== -1) {
						if (iUnitIndex === 0) {
							// leading unit
							sValue = sValue.substring(iUnitIndex + sUnit.length);
						} else {
							// trailing unit
							sValue = sValue.substring(0, iUnitIndex);
						}

					}
				}

				var iOffset = oCrosstab.calculateOffset(oModelCell);

				// Trim the input, leading and trailing whitespaces lead to errors
				sValue = $.trim(sValue);

				var sTransferDataCommand = oCrosstab.getTransferDataCommand();
				sTransferDataCommand = sTransferDataCommand.replace("__ROW__", oModelCell.getRow() + "");
				sTransferDataCommand = sTransferDataCommand.replace("__COL__", (oModelCell.getCol() - iOffset) + "");
				sTransferDataCommand = sTransferDataCommand.replace("__VALUE__", sValue);
				sTransferDataCommand = sTransferDataCommand.replace("__CTYPE__", oModelCell.getPassiveCellType());

				oCrossRequestManager.saveVScrollInfo("plan");
				oCrossRequestManager.saveHScrollInfo("plan");
				oCrossRequestManager.saveColWidths();

				executeAction(sTransferDataCommand, true);
			};

			var onLoseFocus = function (e) {
				if (oInputField.val() !== sRenderText) {
					executeTransferData(oInputField.val());

					// This prevents that the previous entry shows up again in the cell while waiting for the delta with
					// the new value
					var sEncodedRenderText = $('<div/>').text(sRenderText).html();
					html = html.replace(sEncodedRenderText, oInputField.val());
				}
				onFocusLost(e);
			};
			
			var checkTargetIsInCrosstab = function(e) {
				var bIsInCrosstab = true;
				var sTargetId = null;
				var oJqTableDiv = null;
				var oJqTarget = null;
				// do keep focus if a value help is opening although the newly focused element is not part of the crosstab
				if (e && e.relatedTarget && e.relatedTarget.id && oCrosstab.getValueHelpStatus() !== sap.zen.crosstab.VHLP_STATUS_OPENING) {
					// does not work in FireFox yet (see https://bugzilla.mozilla.org/show_bug.cgi?id=962251)
					sTargetId = e.relatedTarget.id;
					oJqTarget = $('#' + sTargetId);
					oJqTableDiv = oCrosstab.getTableDiv();
					bIsInCrosstab = oJqTarget.closest(oJqTableDiv).length > 0;
				}
				return bIsInCrosstab;
			};

			var onFocusLost = function (e) {
				var oJqDiv = $('#' + sTargetId + "_contentDiv");
				oJqDiv.html(html);

				if (sSetContentDivWidth && bCellIsDataCell) {
					oJqDiv.width(sSetContentDivWidth);
				}
						
				if (checkTargetIsInCrosstab(e) === true) {
					oJqDiv.focus();
				} else {
					oKeyboardHandler.reset();
					sCurrentInputFieldText = "";
					oInputField.off("keydown focusout");
					oInputField = null;
				}
			};

			var onInputFieldKeyDown = function (e) {
				if (e.which === 27) {
					onFocusLost();
					sap.zen.crosstab.utils.Utils.cancelEvent(e);
				}
				if (e.which === 13) {
					if (oInputField.val() !== sRenderText) {
						sap.zen.crosstab.utils.Utils.cancelEvent(e);
						executeTransferData(oInputField.val());
					} else {
						onFocusLost();
						if (oCrosstab.isIE8Mode()) {
							oKeyboardHandler.keyboardNavKeyHandler(e);
						}
					}
				}
				if (e.which === 38 || e.which === 40) {
					// enable vert keyboard navigation
					return true;
				}
				if (e.which === 37 || e.which === 39) {
					if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
						// left/right keys must work in the input field to move back and forward in the text string.
						// however, left/right keys must not lead to leaving the cell/input field.
						// Hence, just prevent bubbling of the event to the navigation key handler, but still execute
						// the
						// default
						sap.zen.crosstab.utils.Utils.stopEventPropagation(e);
					}
					return true;
				}
				// F4
				if (e.which === 115 && !bCellIsDataCell) {
					that.invokeValueHelp(oModelCell, "vhlp_" + oModelCell.getId());
				}
			};

			var iContentDivWidth = 0;
			// content Div handling for data cells
			if (bCellIsDataCell) {
				iContentDivWidth = oContentDiv.innerWidth();
				sSetContentDivWidth = sap.zen.crosstab.utils.Utils.getWidthFromStyle(oContentDiv);
			}
			oContentDiv.html("<input id=\"" + sTargetId + "_input" + "\" type=\"text\" value=\"" + sRenderText
					+ "\" />");

			if (bCellIsDataCell) {
				oContentDiv.width(iContentDivWidth + "px");
			}
			oInputField = $('#' + sTargetId + "_input");
			if (sap.zen.crosstab.utils.Utils.isMainMode()) {
				oInputField.addClass("sapzencrosstab-EntryEnabledInput-MainMode");
			} else {
				oInputField.addClass("sapzencrosstab-EntryEnabledInput");				
			}
			oInputField.on("keydown",onInputFieldKeyDown);
			oInputField.focus();
			oCrosstab.getUtils().selectTextInInputField(oInputField, iSelectionStartPos, iSelectionEndPos);
			oInputField.on("focusout", onLoseFocus);
		} else {
			oCrosstab.getUtils().selectTextInInputField(oInputField, iSelectionStartPos, iSelectionEndPos);
		}
		sCurrentInputFieldText = oInputField.val() || "";
		// oJqCurrentInputField = oInputField;
	};
	
	this.handleValueHelpClick = function (sTargetId) {
		var oCell = getCellById(sTargetId);
		that.invokeValueHelp(oCell, sTargetId);
	};
	
	this.invokeValueHelp = function(oCell, sTargetId) {
		if (oCell) {
			oKeyboardHandler.focusNewCell(oCell, -1, -1);
			var sCallValueHelpCommand = oCrosstab.getCallValueHelpCommand();

			var iOffset = oCrosstab.calculateOffset(oCell);

			oCrossRequestManager.saveVScrollInfo("plan");
			oCrossRequestManager.saveHScrollInfo("plan");
			oCrossRequestManager.saveColWidths();

			sCallValueHelpCommand = sCallValueHelpCommand.replace("__ROW__", oCell.getRow());
			sCallValueHelpCommand = sCallValueHelpCommand.replace("__COL__", oCell.getCol() - iOffset);
			sCallValueHelpCommand = sCallValueHelpCommand.replace("__DOM_REF_ID__", sTargetId);
			executeAction(sCallValueHelpCommand, true);
		}
	};

	this.handleInputEnabledCell = function (sTargetId, iSelectionStartPos, iSelectionEndPos) {
		if (sTargetId) {
			sTargetId = oCrosstab.getUtils().getCellIdFromContenDivId(sTargetId);
			if (sTargetId) {
				var oModelCell = sap.ui.getCore().getControl(sTargetId);
				if (oModelCell) {
					if (oModelCell.getArea().isDataArea() || oModelCell.getArea().isRowHeaderArea()) {
						oKeyboardHandler.focusNewCell(oModelCell, iSelectionStartPos, iSelectionEndPos);
					}
				}
			}
		}
	};

	this.sendSelectCommand = function (oCell) {
		var iRow = -1;
		var iCol = -1;
		var sAxis = "";

		if (oCell) {
			var oArea = oCell.getArea();
			// BICS values!
			if (oArea.isRowHeaderArea()) {
				sAxis = "ROWS";
			} else if (oArea.isColHeaderArea()) {
				sAxis = "COLUMNS";
			} else {
				sAxis = "DATA";
			}
			iRow = oCell.getRow();
			iCol = oCell.getCol();
		}

		var onSelectJsCommand = oCrosstab.getOnSelectCommand();
		onSelectJsCommand = onSelectJsCommand.replace("__ROW__", iRow + "");
		onSelectJsCommand = onSelectJsCommand.replace("__COL__", iCol + "");
		onSelectJsCommand = onSelectJsCommand.replace("__AXIS__", sAxis);
		executeAction(onSelectJsCommand, true);
	};
	
	this.resetColWidths = function(oCell, oUpperArea, oLowerArea) {
		var iEffectiveCol = oCell.getCol() + oCell.getColSpan() - 1;
		var iCol = 0;
		var iEndCol = oCell.getCol() + oCell.getColSpan() - oCell.getEffectiveColSpan();
		for (iCol = iEffectiveCol; iCol >= iEndCol; iCol--) {
			oUpperArea.resetColWidth(iCol);
			oLowerArea.resetColWidth(iCol);
			oUpperArea.setUserResizedCol(iCol);
			oLowerArea.setUserResizedCol(iCol);
		}
	};
	
	this.doColResize = function(oCell) {
		var oUpperArea = oCell.getArea();
		if (oUpperArea.isColHeaderArea()) {
			var oDataArea = oCrosstab.getDataArea();
			this.resetColWidths(oCell, oUpperArea, oDataArea);
		} else if (oUpperArea.isDimHeaderArea()) {
			var oRowHeaderArea = oCrosstab.getRowHeaderArea();
			this.resetColWidths(oCell, oUpperArea, oRowHeaderArea);
		}
		oCrosstab.invalidate();
	};

	this.executeOnDblClickAction = function (e) {
		var sTargetId = e.target.id;
		var sDblClickAction = getActionById(sTargetId);
		var oCell;

		if (sDblClickAction === "resi") {
			oCell = getCellById(sTargetId);
			that.doColResize(oCell);
			sap.zen.crosstab.utils.Utils.cancelEvent(e);
		}
	};


	this.attachEvents = function () {
		var oDomRenderSizeDiv = $("#" + oCrosstab.getId() + "_renderSizeDiv");

		oDomRenderSizeDiv.unbind("dblclick");
		oDomRenderSizeDiv.bind("dblclick", this.executeOnDblClickAction);

		oDomRenderSizeDiv.unbind("mousedown");
		oDomRenderSizeDiv.bind("mousedown", this.executeOnMouseDown);

		if (oCrosstab.getPropertyBag().isMobileMode() || oCrosstab.getPropertyBag().isTestMobileMode()) {
			oDomRenderSizeDiv.unbind('click');
			oDomRenderSizeDiv.bind('click', function (e) {
				sap.zen.crosstab.utils.Utils.cancelEvent(e);
			});

			oDomRenderSizeDiv.unbind('mousedown');
			oDomRenderSizeDiv.bind('mousedown', function (e) {
				sap.zen.crosstab.utils.Utils.cancelEvent(e);
			});

			oTouchHandler = new sap.zen.crosstab.TouchHandler(this, oCrosstab);
			oTouchHandler.registerTouchEvents(oDomRenderSizeDiv);
			
			oKeyboardHandler.setEnabled(false);
		} else {
			oDomRenderSizeDiv.unbind("mouseup", this.executeOnMouseUp);
			oDomRenderSizeDiv.bind("mouseup", this.executeOnMouseUp);

			oDomRenderSizeDiv.unbind('click');
			oDomRenderSizeDiv.bind('click', this.executeOnClickAction);
			
			if (oCrosstab.isSelectable() === true && oCrosstab.isHoveringEnabled() === true) {
				oDomRenderSizeDiv.unbind('mouseover');
				oDomRenderSizeDiv.bind('mouseover', this.executeOnMouseEnter);

				oDomRenderSizeDiv.unbind('mouseout');
				oDomRenderSizeDiv.bind('mouseout', this.executeOnMouseOut);
			}
			
			// CHANGE THE FOLLOWING CALL TO DISABLE KEYBOARD HANDLER: single point of entry
			oKeyboardHandler.setEnabled(oCrosstab.isPlanningMode());
			oKeyboardHandler.attachEvents(oDomRenderSizeDiv);
			
			// header horizontal resize
			if (oCrosstab.getUserHeaderWidthCommand() && oCrosstab.getUserHeaderWidthCommand().length > 0) {
				this.attachEventsToResizeHeaderDiv();
				oDomRenderSizeDiv.unbind("mousemove", this.handleMouseMoveHeaderResizeHandle);
				oDomRenderSizeDiv.bind("mousemove", this.handleMouseMoveHeaderResizeHandle);
			}
			
			
		}
	};

	this.handleMouseMoveHeaderResizeHandle = function(e) {
		var iOldLeft;
		var iDelta;
		var iNewLeft;
		var iMaxLeft;
		var iMaxLimit = oCrosstab.getPropertyBag().getMaxHeaderWidth();

		if (oJqHeaderResizeHandle) {
			bResizeHandleDragMode = true;
			if (oCrosstab.getPropertyBag().isRtl()) {
				iOldLeft = parseInt(oJqHeaderResizeHandle.css("right"), 10);
				iDelta = iOldMouseX - e.clientX;
			} else {
				iOldLeft = parseInt(oJqHeaderResizeHandle.css("left"), 10);				
				iDelta = e.clientX - iOldMouseX;
			}
			iOldMouseX = e.clientX;
			
			// don't allow larger left values than the non-reduced header size or the size of the rendersizeDiv,
			// depending on what is smaller
			iMaxLeft = Math.min(iLeftAreaContainerWidthForHeaderResize, iRenderSizeDivWidthForHeaderResize);
			if (iMaxLimit > 0) {
				iMaxLeft = Math.min(iMaxLeft, iMaxLimit);
			}
			
			// don't let "left" become 0 by user interaction since this will lead to the weird
			// effect that that this will lead to no limiting at all
			iNewLeft = Math.max(1, Math.min(iOldLeft + iDelta, iMaxLeft));
			if (oCrosstab.getPropertyBag().isRtl()) {
				oJqHeaderResizeHandle.css("right", iNewLeft + "px");
			} else {
				oJqHeaderResizeHandle.css("left", iNewLeft + "px");
			}
			sap.zen.crosstab.utils.Utils.cancelEvent(e);
		}		
	};
	
	this.handleMouseUpHeaderResizeHandle = function(e) {	
		var iMaxLeft = oRenderEngine.getLeftAreaContainerWidth();
		var iLeft;
		var sWidth = "";
		
		if (oCrosstab.getPropertyBag().isRtl()) {
			iLeft = parseInt(oJqHeaderResizeHandle.css("right"), 10);
		} else {
			iLeft = parseInt(oJqHeaderResizeHandle.css("left"), 10);			
		}

		sWidth = iLeft + "";
		oRenderEngine.sendHeaderLimit(sWidth, false);
		
		// cleanup
		bResizeHandleDragMode = false;
		oJqHeaderResizeHandle.removeClass("sapzencrosstab-headerResizeHandleActive");
		oJqHeaderResizeHandle = null;
		$(document).unbind("mouseup", that.handleMouseUpHeaderResizeHandle);
		sap.zen.crosstab.utils.Utils.cancelEvent(e);
	};
	
	this.onMouseDownHeaderResizer = function(e) {
		oJqHeaderResizeHandle = $(e.currentTarget);
		iRenderSizeDivWidthForHeaderResize = $('#' + oCrosstab.getId() + "_renderSizeDiv").outerWidth();
		iLeftAreaContainerWidthForHeaderResize = oRenderEngine.getLeftAreaContainerWidth();
		iOldMouseX = e.clientX;
		$(document).on("mouseup", that.handleMouseUpHeaderResizeHandle);
		sap.zen.crosstab.utils.Utils.cancelEvent(e);
	};
	
	this.attachEventsToResizeHeaderDiv = function() {
		var oResizeHandle = $('#' + oCrosstab.getId() + "_headerResizeHandle");

		oResizeHandle.unbind("hover");
		oResizeHandle.hover(function() {
			oResizeHandle.addClass("sapzencrosstab-headerResizeHandleActive");
		}, function() {
			if (!bResizeHandleDragMode) {
				oResizeHandle.removeClass("sapzencrosstab-headerResizeHandleActive");
			}
		});
		
		oResizeHandle.unbind("mousedown", this.onMouseDownHeaderResizer);
		oResizeHandle.bind("mousedown", this.onMouseDownHeaderResizer);
		
		oResizeHandle.unbind("mouseup", this.executeOnMouseUp);
		oResizeHandle.bind("mouseup", this.executeOnMouseUp);
		
		oResizeHandle.unbind("mousemove", this.handleMouseMoveHeaderResizeHandle);
		oResizeHandle.bind("mousemove", this.handleMouseMoveHeaderResizeHandle);
	};
	
	this.executeOnMouseDown = function (e) {
		var sTargetId = e.target.id;
		var sClickAction = getActionById(sTargetId);

		if (sClickAction === "resi") {
			sap.zen.crosstab.utils.Utils.cancelEvent(e);
		} else {
			sMouseDownTargetId = sTargetId;
		}
	};

	function checkMouseUpInSameCell (sCellId, e) {
		var bInSameCell = false;
		var oDomCell = $('#' + sCellId)[0];
		if (oDomCell) {
			var oRect = oDomCell.getBoundingClientRect();
			var bHMatches = (oRect.left < e.clientX) && (e.clientX < oRect.right);
			var bVMatches = (oRect.bottom > e.clientY) && (e.clientY > oRect.top);
			bInSameCell = bHMatches && bVMatches;
		}
		return bInSameCell;
	}

	this.executeOnMouseUp = function (e) {
		if (oJqHeaderResizeHandle) {
			that.handleMouseUpHeaderResizeHandle(e);
		} else {
			bPreventClickAction = false;
			if (sMouseDownTargetId) {
				var sCellId = oCrosstab.getUtils().getCellIdFromContenDivId(sMouseDownTargetId);
				// prevent action during multiple selection of cells. Make sure we stay in the same cell
				if (checkMouseUpInSameCell(sCellId, e)) {
					var oCell = sap.ui.getCore().getControl(sCellId);
					if (oCell) {
						if (oCrosstab.isPlanningMode()) {
							var oDomContainerDiv = $('#' + sMouseDownTargetId)[0];
							var oPositions = null;
							if (oDomContainerDiv) {
								oPositions = oCrosstab.getUtils().getSelectionParams(oDomContainerDiv);
							}
							if (oPositions.iSelectionStartPos >= 0 || oPositions.iSelectionEndPos >= 0) {
								bPreventClickAction = true;
								that.handleInputEnabledCell(e.target.id, oPositions.iSelectionStartPos,
										oPositions.iSelectionEndPos);
							}
						}
					}
				} else {
					if (!oCrosstab.isDragAction()) {
						sap.zen.crosstab.utils.Utils.cancelEvent(e);
						sap.zen.crosstab.utils.Utils.stopEventPropagation(e);
					}
					bPreventClickAction = true;
				}
			}
		}
	};

	this.restoreFocusOnCell = function () {
		oKeyboardHandler.restoreFocusOnCell();
	};

	function getActionById (sId) {
		var sAction = sId.slice(0, 4);
		return sAction;
	}

	function getCellById (sId) {
		var sCellId = sId.slice(5);
		return sap.ui.getCore().getControl(sCellId);
	}

	function executeAction (sAction, bDontShowLoading) {
		if (sAction) {
			if (!bDontShowLoading) {
				// oCrosstab.showLoadingIndicator();
			}
			oCrosstab.getUtils().executeCommandAction(sAction);
		}
	}
	
	this.handleHoverEntry = function(sTargetId) {	
		if (sTargetId) {
			var sCellId = oCrosstab.getUtils().getCellIdFromContenDivId(sTargetId);
			if (sCellId && sCellId !== undefined) {
				var oModelCell = sap.ui.getCore().getControl(sCellId);
				if (oModelCell && oModelCell !== undefined) {
					oCrosstab.getSelectionHandler().handleCellHoverEntry(oModelCell);	
				}
			}
		}
	};
	
	this.executeOnMouseEnter = function(e) {	
		var sPotentialAction = null;
		var sTargetId = e.target.id;
		
		if (oCrosstab.hasLoadingPages()) {
			sap.zen.crosstab.utils.Utils.cancelEvent(e);
			return;
		}

		if (!sTargetId) {
			sTargetId = that.findTargetId(e.target);
		}

		if (!sTargetId) {
			return;
		}
		sPotentialAction = getActionById(sTargetId);

		if (sPotentialAction === "__ce") {
			that.handleHoverEntry(sTargetId);
		}
		sap.zen.crosstab.utils.Utils.cancelEvent(e);
	};


	this.executeOnMouseOut = function(e) {
		oCrosstab.getSelectionHandler().handleCellHoverOut(e);
		sap.zen.crosstab.utils.Utils.cancelEvent(e);
	};

	this.enableClick = function() {
		bPreventClickAction = false;
		sMouseDownTargetId = null;
	};
};