/*!
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */

jQuery.sap.declare("sap.suite.ui.commons.TimelineRenderManager");

sap.ui.define("sap.suite.ui.commons.TimelineRenderManager", [
	"jquery.sap.global",
	"sap/m/Text",
	"sap/ui/core/Icon",
	"sap/m/ViewSettingsDialog",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/Item",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/ToolbarSpacer",
	"sap/m/SearchField",
	"sap/m/OverflowToolbar",
	"sap/m/Toolbar",
	"sap/m/DisplayListItem",
	"sap/m/List",
	"sap/m/ListMode",
	"sap/m/ResponsivePopover",
	"sap/m/PlacementType",
	"sap/m/Select",
	"sap/m/RangeSlider",
	"sap/m/Label",
	"sap/m/Panel",
	"sap/m/FlexBox",
	"sap/m/FlexJustifyContent",
	"sap/m/OverflowToolbarButton",
	"sap/m/MessageStrip",
	"sap/suite/ui/commons/TimelineGroupType",
	"sap/suite/ui/commons/TimelineAxisOrientation",
	"sap/ui/core/CSSSize",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/m/ViewSettingsFilterItem",
	"sap/m/ViewSettingsCustomItem",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/OverflowToolbarPriority",
	"sap/m/MessageToast",
	"sap/ui/core/InvisibleText"
], function ($, Text, Icon, ViewSettingsDialog, ResizeHandler, Item, Button, ButtonType, ToolbarSpacer, SearchField,
			 OverflowToolbar, Toolbar, DisplayListItem, List, ListMode, ResponsivePopover, PlacementType, Select, RangeSlider, Label, Panel,
			 FlexBox, FlexJustifyContent, OverflowToolbarButton, MessageStrip, TimelineGroupType, TimelineAxisOrientation, CSSSize,
			 FilterOperator, Filter, ViewSettingsFilterItem, ViewSettingsCustomItem, OverflowToolbarLayoutData, OverflowToolbarPriority,
			 MessageToast, InvisibleText) {
	"use strict";

	var resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
	var VERTICAL_MAX_WIDTH = 680;

	var DateRoundType = Object.freeze({
		UP: "UP",
		DOWN: "DOWN",
		NONE: "NONE"
	});

	function switchClass($item, removeClass, addClass) {
		$item.removeClass(removeClass).addClass(addClass);
	}

	// get attributed from $element and convert it to number
	function _getConvertedAttribute($elem, sAttrName) {
		return parseInt($elem.css(sAttrName).replace("px", ""), 10);
	}

	var TimelineRenderManager = {
		extendTimeline: function (Timeline) {
			/**
			 * Init filter bar, filter dialogs, message strips
			 * @private
			 */
			Timeline.prototype._initControls = function () {
				this._setupMessageStrip();
				this._setupRangeFilterPage();
				this._setupFilterDialog();
				this._setupHeaderToolbar();
				this._setupAccessibilityItems();
			};

			/**
			 * Register resize listener. We don't register timeline itself, but it's parent.
			 * @private
			 */
			Timeline.prototype._registerResizeListener = function () {
				this.oResizeListener = ResizeHandler.register(this.$().parent().get(0), jQuery.proxy(this._performResizeChanges, this));
			};

			/**
			 * @private
			 */
			Timeline.prototype._deregisterResizeListener = function () {
				if (this.oResizeListener) {
					ResizeHandler.deregister(this.oResizeListener);
				}
			};

			/**
			 * Recalcute all positions after some change occured (basically it's after rendering or after resize)
			 * @private
			 */
			Timeline.prototype._performUiChanges = function () {
				// deregister resize listener - changes to timeline will change the parent too so we don't want to trigger resize right away
				this._deregisterResizeListener();

				this._isVertical() ? this._performUiChangesV() : this._performUiChangesH();
				this._setupScrollers();
				this._startItemNavigation();

				// register again
				this._registerResizeListener();
			};

			/**
			 * Change from doublesided to singlesided or vice versa for single item
			 * @param $li {object} LI element representing timeline item
			 * @param isOdd {boolean} indicates whether item is odd or even
			 * @private
			 */
			Timeline.prototype._performDoubleSidedChangesLi = function ($li, bIsOdd) {
				var $child = $li.children().first(),
					sClassName = this._isLeftAlignment() ? "sapSuiteUiCommonsTimelineItemWrapperVLeft" : "sapSuiteUiCommonsTimelineItemWrapperVRight";
				if (this._renderDblSided) {
					if ($li.hasClass('sapSuiteUiCommonsTimelineItem')) {
						$li.removeClass('sapSuiteUiCommonsTimelineItem')
							.addClass(bIsOdd ? "sapSuiteUiCommonsTimelineItemOdd" : "sapSuiteUiCommonsTimelineItemEven");

						if (!bIsOdd) {
							switchClass($child, "sapSuiteUiCommonsTimelineItemWrapperVLeft", "sapSuiteUiCommonsTimelineItemWrapperVRight");
						} else {
							switchClass($child, "sapSuiteUiCommonsTimelineItemWrapperVRight", "sapSuiteUiCommonsTimelineItemWrapperVLeft");
						}
					}
				} else {
					$li.removeClass("sapSuiteUiCommonsTimelineItemOdd").removeClass("sapSuiteUiCommonsTimelineItemEven").addClass("sapSuiteUiCommonsTimelineItem");
					$child.removeClass("sapSuiteUiCommonsTimelineItemWrapperVLeft").removeClass("sapSuiteUiCommonsTimelineItemWrapperVRight").addClass(sClassName);
				}
			};

			/**
			 * * Change from doublesided to singlesided or vice versa
			 * @private
			 */
			Timeline.prototype._performDoubleSidedChanges = function () {
				var $this = this.$(),
					$ulItems = $this.find('.sapSuiteUiCommonsTimelineItemUlWrapper').not(".sapSuiteUiCommonsTimelineShowMoreWrapper"),
					$headers = $this.find(".sapSuiteUiCommonsTimelineScrollV .sapSuiteUiCommonsTimelineGroupHeader"),
					$item, sHeaderClass;

				if (this._renderDblSided) {
					this._$content.addClass("sapSuiteUiCommonsTimelineDblSided");
					$headers.addClass("sapSuiteUiCommonsTimelineGroupHeaderDblSided");
					$headers.addClass("sapSuiteUiCommonsTimelineItemWrapperVLeft").removeClass("sapSuiteUiCommonsTimelineItemWrapperVRight");
				} else {
					this._$content.removeClass("sapSuiteUiCommonsTimelineDblSided");
					$headers.removeClass("sapSuiteUiCommonsTimelineGroupHeaderDblSided sapSuiteUiCommonsTimelineItemWrapperVLeft");
					$headers.addClass(this._isLeftAlignment() ? "sapSuiteUiCommonsTimelineItemWrapperVLeft" : "sapSuiteUiCommonsTimelineItemWrapperVRight");
				}

				for (var j = 0; j < $ulItems.length; j++) {
					var $ul = jQuery($ulItems[j]),
						$liItems = $ul.find('> li').not(".sapSuiteUiCommonsTimelineGroupHeader");

					// first is group item, second is "first" classic item, so we want to move down third
					$liItems.eq(1).css("margin-top", this._renderDblSided ? "40px" : "auto");

					for (var i = 0; i < $liItems.length; i++) {
						$item = $($liItems[i]);
						this._performDoubleSidedChangesLi($item, (i % 2) === 0);
					}
				}

				$this.find(".sapSuiteUiCommonsTimelineItemBarV").css("height", "");
				$this.find(".sapSuiteUiCommonsTimelineItem").css("margin-bottom", "");
			};

			/**
			 * Recalculate for horizontal TL
			 * @private
			 */
			Timeline.prototype._performUiChangesH = function () {
				var $this = this.$(),
					that = this,
					$prev,
					oTopLine, oBottomLine,
					fnSetWidth = function () {
						// we dont know which line is exactly the longest so compare all of them and set width of timeline by the longest one
						var aWidths = this.$().find(".sapSuiteUiCommonsTimelineHorizontalScrollingLine").map(function () {
								return jQuery(this).width();
							}),

							// padding offset
							OFFSET = 70,
							iMax = Math.max.apply(null, aWidths),
							iCurrentWidth = this.$().width(),
							iNewWidth = iMax + OFFSET;

						if (iNewWidth > iCurrentWidth) {
							this.$().width(iMax + OFFSET);
						}

						// enfore scrollbar is hidden
						$this.find(".sapSuiteUiCommonsTimelineContentsH").css("overflow-x", "hidden");
					}.bind(this),
					fnRight = function ($element) {
						return ($this.width() - ($element.position().left + $element.outerWidth()));
					};

				// calculate bottom line margin for each item
				if (this.getEnableDoubleSided() && this._isGrouped()) {
					oTopLine = $this.find(".sapSuiteUiCommonsTimelineHorizontalTopLine");
					oBottomLine = $this.find(".sapSuiteUiCommonsTimelineHorizontalBottomLine ul");

					// we fix margin left (right for RTL) from previous item
					// to do this we find corresponding icon in icon bar and convert its left position
					// to margin (we have to take in count previous item and it's position)
					// easier solution would be absolute positioning of bottom line
					// but this is better solution
					$this.find("[firstgroupevenitem = true]:visible").each(function (iIndex, oItem) {
						var fnCreateAttribute = function (sName) {
								return sName + "-" + ( that._bRtlMode ? "right" : "left");
							},
							// icon in middle line for corresponding timeline item
							$icon = $("#" + oItem.id + "-line"),
							// left (right for RTL) for timeline icon
							iDistance = that._bRtlMode ? fnRight($icon) : $icon.position().left,
							// distance between left icon pos and start of timeline item
							OFFSET = 30,
							$item = $(oItem),
							sSuffix = that._bRtlMode ? "right" : "left",
							iLineMargin = _getConvertedAttribute(oBottomLine, fnCreateAttribute("padding")),
							iMargin, iPrevPos;

						if (iIndex === 0) {
							iMargin = iDistance - OFFSET - iLineMargin;
						} else {
							$prev = $item.prevAll(".sapSuiteUiCommonsTimelineItemLiWrapperV:visible:first");
							// otherwise count margin as previsous item left + width minus from group header left position + OFFSET
							iPrevPos = that._bRtlMode ? fnRight($prev) : ($prev.position().left + _getConvertedAttribute($prev, fnCreateAttribute("margin")));
							iMargin = (iDistance - OFFSET) - (iPrevPos + $prev.outerWidth());
						}
						$item.css(fnCreateAttribute("margin"), iMargin + "px");
					});

				};

				// for disable scroll, stretch width of timeline to fullsize of it's content, which is best determined
				// by UL elements
				if (!this.getEnableScroll()) {
					fnSetWidth();
				}

				this._calculateTextHeight();
			};

			/**
			 * Recalculate for vertical TL
			 * @private
			 */
			Timeline.prototype._performUiChangesV = function () {
				var $this = this.$(),
					iOuterWidth = $this.outerWidth() + 50;

				//check if width can handle to display dobulesided timeline
				if (this.getEnableDoubleSided()) {
					this._renderDblSided = iOuterWidth >= VERTICAL_MAX_WIDTH;
					// performance check, process only when its really neccessary
					if (this._renderDblSided != this._lastStateDblSided) {
						this._performDoubleSidedChanges();
					}

					this._lastStateDblSided = this._renderDblSided;
				}

				this._calculateTextHeight();
				this._calculateHeightV();
			};

			/**
			 * Correct item margins and separator heights for double sided timeline. If enableScroll is OFF, calculate timeline height to fit parent
			 * @private
			 */
			Timeline.prototype._calculateHeightV = function () {
				var $this = this.$(),
					iFilterBarHeight = this.$("headerBar").outerHeight() || 0,
					iFilterInfoBarHeight = this.$("filterMessage").outerHeight() || 0,
					iMessageStripHeight = this.$("messageStrip").outerHeight() || 0,
					iBarsHeight = iMessageStripHeight + iFilterInfoBarHeight + iFilterBarHeight,
					// correct separator height for double sided timeline
					fnCorrectSeparatorHeight = function (aLI) {
						for (var i = 0; i < aLI.length - 1; i++) {
							var $next = jQuery(aLI[i + 1]),
								$current = jQuery(aLI[i]),
								// margin between items and bars (we have to count icon size)
								MARGIN = 33,
								diff = $next.offset().top - $current.offset().top,
								$bar = $current.find(".sapSuiteUiCommonsTimelineItemBarV");

							$bar.css("height", (diff - MARGIN) + "px");
						}

						// if last item is very small compared to last-1
						// we have to enlarge bar to the last-1 end
						if (aLI.length > 1) {
							var $last = $(aLI[aLI.length - 1]),
								$prevLast = $(aLI[aLI.length - 2]),
								$bar = $last.find(".sapSuiteUiCommonsTimelineItemBarV");

							// [last - 1] item is larger then the last one, we need to stretch its bar to the bottom of prev item
							var diff = $prevLast.offset().top + $prevLast.height() - ($bar.offset().top + $bar.height());

							if (diff > 0) {
								$bar.height($prevLast.offset().top + $prevLast.height() - ($bar.offset().top));
							}
						}
					},
					fnCorrectItemMargin = function (aLI, $ul) {
						var fnFixMargin = function () {
							var iDiff = _getConvertedAttribute($prevPrev, "margin-top") +
								$prevPrev.position().top + $prevPrev.height() - $item.position().top;
							$prev.css("margin-bottom", iDiff + OFFSET + "px");
						};

						// we use a little trick here, when item is wrong positioned due to the fact odd and even items are of different height
						// odd items are positioned left (or should be) so we test whether their offset is too far right
						// we can fix it by adding margin-bottom of the [item-2]. By doing this we set both 'columns' to similar sizes
						for (var i = 2; i < aLI.length; i++) {
							var $item = $(aLI[i]),
								$prev = $(aLI[i - 1]),
								$prevPrev = $(aLI[i - 2]),
								bIsOdd = this._bRtlMode ? !$item.hasClass("sapSuiteUiCommonsTimelineItemOdd") : $item.hasClass("sapSuiteUiCommonsTimelineItemOdd"),
								iLeft = $item.position().left,
								OFFSET = 40,
								DELIMITER = 100;

							// odd is supposed to be left
							if (!bIsOdd && iLeft < DELIMITER ||
								bIsOdd && iLeft > DELIMITER) {
								fnFixMargin();
							} else {
								var iDiff = $item.position().top - $prev.position().top,
									iPrevMargin = _getConvertedAttribute($prevPrev, "margin-bottom");

								if (iDiff < OFFSET) {
									$prevPrev.css("margin-bottom", iPrevMargin + OFFSET - iDiff);
								}
							}
						}
					},
					fnCalculateHeight = function () {
						var OFFSET = 5,
							iCurrentTop = $this.position().top,
							iParentHeight = $this.parent().height(),
							iContentPaddingBottom = _getConvertedAttribute(this._$content, "padding-bottom"),
							iContentPaddingTop = _getConvertedAttribute(this._$content, "padding-top"),
							iHeight = iParentHeight - iCurrentTop - iBarsHeight - iContentPaddingTop - iContentPaddingBottom - OFFSET;

						this._$content.height(iHeight);
					}.bind(this);

				// function start
				if (this.getEnableScroll()) {
					fnCalculateHeight();
				}

				if (this._renderDblSided) {
					// find all UL tags
					$this.find(".sapSuiteUiCommonsTimelineItemUlWrapper").each(jQuery.proxy(function (index, ul) {
						var $ul = jQuery(ul),
							aLI = $ul.find(" > li:not(.sapSuiteUiCommonsTimelineGroupHeader):visible");

						// we have to first correct DOM to have all items right ordered.
						aLI.css("margin-bottom", "");
						fnCorrectItemMargin.call(this, aLI, $ul);
						fnCorrectSeparatorHeight.call(this, aLI);
					}, this));
				}
			};

			/**
			 * Event after parent is resized
			 * @private
			 */
			Timeline.prototype._performResizeChanges = function () {
				this._performUiChanges();
			};

			/**
			 * Given textHeight settings (line count, automatic to parent or height) we calculate precise pixels height to fit full rows
			 * so we prevent trimming div in half of line.
			 * @private
			 */
			Timeline.prototype._calculateTextHeight = function () {
				var $this = this.$(),
					sTextHeight = this.getTextHeight(),
					oRegex, aMatches,
					fnSetHeightByLineCount = function (iLinesCount) {
						fnSetHeight(0, parseInt(iLinesCount, 10));
					},
					fnSetHeightByNumber = function (iHeight) {
						fnSetHeight(iHeight, 0);
					},
					fnSetHeight = function (iHeight, iLinesCount) {
						$this.find(".sapSuiteUiCommonsTimelineItemTextWrapper:visible").each(function (iIndex, oWrapper) {
							var $item = $(oWrapper),
								$span = $item.children().first(),
								aRects = $span.get(0).getClientRects(),
								iCalculatedHeight = 0,
								iLines = 0,
								iTop, currentBottom = -100000,
								realLineCount = 0;

							if (aRects && aRects.length > 0) {
								iTop = aRects[0].top;
								currentBottom = -100000;
								realLineCount = 0;

								for (var i = 0; i < aRects.length - 1; i++) {
									if (currentBottom !== aRects[i].bottom) {
										currentBottom = aRects[i].bottom;
										realLineCount++;
									}

									// search by preferred height
									if (iHeight > 0 && (aRects[i + 1].bottom - iTop > iHeight)) {
										iLines = realLineCount;
										iCalculatedHeight = aRects[i].bottom - iTop;
										break;
									}

									// search by preferred line count
									if (iLinesCount > 0 && realLineCount === iLinesCount) {
										iCalculatedHeight = aRects[i].bottom - aRects[0].top;
										iLines = iLinesCount;
										break;
									}
								}
							}

							if (iCalculatedHeight > 0) {
								$item.height(iCalculatedHeight);
								$item.css("-webkit-line-clamp", iLines.toString());
								// more button
								$item.next().show();
							} else {
								if (!$item.attr("expandable")) {
									$item.next().hide();
								}
							}
						});
					},
					fnFindMaxHeightForAutomatic = function () {
						var aTexts = $this.find(".sapSuiteUiCommonsTimelineItemTextWrapper");

						// reset heigh flags for all items
						aTexts.css("height", "");
						aTexts.css("-webkit-line-clamp", "");
						$this.css("height", "100%");

						var iContentHeight = this._$content.height(),
							iContentPadding = _getConvertedAttribute(this._$content, "padding-bottom"),
							iScrollHeight = this._$content.get(0).scrollHeight,
							iDiff = iScrollHeight - iContentHeight - iContentPadding,
							oMax = {height: 0},
							bShowMoreHeight,
							OFFSET = 20;

						// find largest item and check whether its show more button is visible
						$this.find(".sapSuiteUiCommonsTimelineItemTextWrapper").each(function (iIndex, oItem) {
							var iHeight = $(oItem).height();
							if (iHeight > oMax.height) {
								oMax.height = iHeight;
								oMax.item = $(this);
							}
						});
						if (oMax.item) {
							// check if max height has show more button. If it is visible, its height is already calculated and is no more
							// needed to be added
							bShowMoreHeight = oMax.item.parent().find(".sapSuiteUiCommonsTimelineItemShowMore:hidden").height();

							// we don't want to stretch right to the end --> OFFSET
							return oMax.height - iDiff - bShowMoreHeight - OFFSET;
						}

						return 1;
					};

				if (sTextHeight) {
					// for automatic in horizontal mode, try to calculate max allowed height
					// find 'scroll' div and get his height and scrollheight. The difference between these number and the height of the largest visible
					// textarea is the maximum possible height for all items
					if (sTextHeight.toLowerCase() == "automatic" && !this._isVertical()) {
						fnSetHeightByNumber(fnFindMaxHeightForAutomatic.call(this));
					} else if ($.isNumeric(sTextHeight)) {
						fnSetHeightByLineCount(sTextHeight);
					} else {
						// for px we can compute rounded height and line count
						oRegex = /([0-9]*\.?[0-9]+)(px)+/i;
						aMatches = oRegex.exec(sTextHeight);
						if (aMatches && aMatches.length > 1) {
							fnSetHeightByNumber(aMatches[1]);
						} else if (CSSSize.isValid(sTextHeight)) {
							// if not px just add the selected style
							$this.find(".sapSuiteUiCommonsTimelineItemTextWrapper").height(sTextHeight);
						}
					}
				}
			};

			/**
			 * Scroller position for horizontal TL
			 * @private
			 */
			Timeline.prototype._fixScrollerPositionH = function () {
				var $this = this.$(),
					$middleLine = $this.find(".sapSuiteUiCommonsTimelineHorizontalMiddleLine"),
					$scrollers = $this.find(".sapSuiteUiCommonsTimelineHorizontalScroller"),
					iPosY,
					iContentTop = this._$content.position().top;

				if ($middleLine.get(0)) {
					iPosY = $middleLine.position().top;
					// center scrollbars and scroll icons to center of middle line
					$this.find(".sapSuiteUiCommonsTimelineScrollerIconWrapper").css("top", iPosY - 5);
					$scrollers.css("top", iContentTop + "px");
					$scrollers.height(this._$content.outerHeight() - 15);
				}
			};

			/**
			 * setup scrollers and background div with gradient opacity. For this we need to know background color of timeline
			 * we try to get it from parents. IF we find a color (and background image is not set) we try to setup scroller buttons and
			 * gradient background.
			 * These scrollers are children of directly timeline control iteself and are absolute, so they need to be positioned by JS.
			 * This is for not shortening scrollable area.
			 * @private
			 */
			Timeline.prototype._setupScrollers = function () {
				var $this = this.$(),
					MIN_SIZE = 450,
					sNoColor = 'rgba(0, 0, 0, 0)',
					iSize, sBackgroundColor, aRgb, iR, iG, iB, sFrom, sTo, sMid,
					$scrollerA, $scrollerB, sGradientA, sGradientB,
					// this method returns first set background color of any parent but only if there is no background image set
					fnGetParentBackground = function ($element) {
						var sColor = sNoColor;
						$element.parents().each(function (iIndex, domEl) {
							var sBackgroundColor = $(domEl).css("background-color"),
								sBackgroundImage = $(domEl).css("background-image");

							// if both are set in same element we don't use scrollbars so this condition if first
							if (sBackgroundImage !== "none") {
								sColor = sNoColor;
								return;
							}

							if (sBackgroundColor !== sNoColor && sBackgroundColor !== "transparent") {
								sColor = sBackgroundColor;
								return;
							}
						});

						return sColor;
					};

				if (this._scrollingFadeout()) {
					// show scrollers only if there is enought space
					iSize = this._isVertical() ? $this.height() : $this.width();
					if (iSize < MIN_SIZE) {
						$this.find(".sapSuiteUiCommonsTimelineVerticalScroller", ".sapSuiteUiCommonsTimelineHorizontalScroller").hide();
						this._scrollersSet = false;
						return;
					}

					if (!this._scrollersSet) {
						// find parent color
						sBackgroundColor = fnGetParentBackground(this.$());

						// if there is background image defined or color is not defined
						// we are not able to setup gradient, hide all scraller buttons and divs
						if (sBackgroundColor && sBackgroundColor !== sNoColor) {
							aRgb = sBackgroundColor.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

							if (aRgb && aRgb.length >= 4) {
								var iR = parseInt(aRgb[1], 10),
									iG = parseInt(aRgb[2], 10),
									iB = parseInt(aRgb[3], 10),

									sFrom = "rgba(" + iR + "," + iG + "," + iB + ", 0)",
									sMid = "rgba(" + iR + "," + iG + "," + iB + ", 0.7)",
									sTo = "rgba(" + iR + "," + iG + "," + iB + ", 1)";

								$scrollerA = $this.find(".sapSuiteUiCommonsTimelineHorizontalLeftScroller, .sapSuiteUiCommonsTimelineTopScroller ");
								$scrollerB = $this.find(".sapSuiteUiCommonsTimelineHorizontalRightScroller, .sapSuiteUiCommonsTimelineBottomScroller");
								sGradientA = this._isVertical() ? "top" : "left";
								sGradientB = this._isVertical() ? "bottom" : "right";

								$scrollerA.css("background-image", "linear-gradient(to " + sGradientA + ", " + sFrom + ", " + sTo + ")");
								$scrollerB.css("background-image", "linear-gradient(to " + sGradientB + ", " + sFrom + ", " + sTo + ")");

								$scrollerA.css("background-image", "-webkit-linear-gradient(" + sGradientB + ", " + sFrom + ", " + sMid + " 30%," + sTo + ")");
								$scrollerB.css("background-image", "-webkit-linear-gradient(" + sGradientA + ", " + sFrom + ", " + sMid + " 30%," + sTo + ")");


								// we setup scroller once for rendering
								this._scrollersSet = true;

								// oData or delayed loading for empty items fix
								if (this.getContent().length > 0) {
									// if there is scrollbar show right scroller
									// left scrollbar is shown only after some scrolling is done
									if ((!this._isVertical() && this._$content.get(0).scrollWidth > this._$content.outerWidth()) ||
										(this._isVertical() && this._$content.get(0).scrollHeight > this._$content.outerHeight())) {
										$scrollerB.show();
									}
								}
							}
						} else {
							// we were not able to find background color or there is background image selected ->
							// unable to set gradient color so we hide scrollers
							$this.find(".sapSuiteUiCommonsTimelineHorizontalScroller").hide();
						}
					}

					if (!this._isVertical()) {
						this._fixScrollerPositionH();
					}
				}
			};

			/**
			 * Events for scrollers and lazy loading management
			 * @private
			 */
			Timeline.prototype._setupScrollEvent = function () {
				var $this = this.$(),
					$scrollerAIcon = $this.find(".sapSuiteUiCommonsTimelineHorizontalLeftScroller .sapSuiteUiCommonsTimelineScrollerIconWrapper, .sapSuiteUiCommonsTimelineTopScroller .sapSuiteUiCommonsTimelineScrollerIconWrapper"),
					$scrollerBIcon = $this.find(".sapSuiteUiCommonsTimelineHorizontalRightScroller .sapSuiteUiCommonsTimelineScrollerIconWrapper, .sapSuiteUiCommonsTimelineBottomScroller .sapSuiteUiCommonsTimelineScrollerIconWrapper"),
					$scrollerA = $this.find(".sapSuiteUiCommonsTimelineHorizontalLeftScroller, .sapSuiteUiCommonsTimelineTopScroller"),
					$scrollerB = $this.find(".sapSuiteUiCommonsTimelineHorizontalRightScroller, .sapSuiteUiCommonsTimelineBottomScroller"),
					$scroller = this._$content,
					that = this;

				// setup lazy loading for timeline without growing buttons
				if (that._lazyLoading() || that._scrollingFadeout()) {
					$scroller.on("scroll", function (event) {
						var $target = $(event.currentTarget),
							iScrollLeft = $target.get(0).scrollLeft,
							iScrollTop = $target.get(0).scrollTop,
							bEndPosition = false,
							OFFSET = 200,
							ENDOFFSET = 5,
							// this marker is for preventing multiple lazy loading events
							// once lazy loading started, set this flag off and wait for afterrender for new round (then set it on)
							bLoadMore = false,
							iHeight, iScrollHeight, iWidth, iScrollWidth,
							$scroller;

						if (that._isVertical()) {
							iHeight = $target.outerHeight();
							iScrollHeight = $target.get(0).scrollHeight;

							bLoadMore = iScrollTop + iHeight > iScrollHeight - OFFSET;
							bEndPosition = iScrollTop + iHeight >= iScrollHeight - ENDOFFSET;

						} else {
							iWidth = $target.width();
							iScrollWidth = $target.get(0).scrollWidth;

							bLoadMore = iScrollLeft + iWidth > iScrollWidth - OFFSET;
							bEndPosition = iScrollLeft + iWidth >= iScrollWidth - ENDOFFSET - 185 /*ul margin*/;
						}

						if (that._lazyLoading() && that._scrollMoreEvent) {
							if (bLoadMore && !that._isMaxed()) {
								that._scrollMoreEvent = false;
								that._loadMore();
							}
						}

						// hide/show left scroller if scroller position is right at the begining
						if (that._scrollersSet) {
							if (iScrollLeft > 50 || iScrollTop > 50) {
								$scrollerA.show();
							} else {
								$scrollerA.hide();
								that._manualScrolling = false;
							}

							if (bEndPosition) {
								$scrollerB.hide();
							} else {
								$scrollerB.show();
							}

							// when scrolling performed, make special background for scrolling buttons
							// determine whether we scroll left or right (top or bottom)
							if (that._isVertical()) {
								var currentScrollPosition = $target.get(0).scrollTop;
								$scroller = currentScrollPosition > that._lastScrollPosition.y ? $scrollerBIcon : $scrollerAIcon;
								that._lastScrollPosition.y = currentScrollPosition;

							} else {
								var currentScrollPosition = $target.get(0).scrollLeft;
								$scroller = currentScrollPosition > that._lastScrollPosition.x ? $scrollerBIcon : $scrollerAIcon;
								that._lastScrollPosition.x = currentScrollPosition;
							}

							// add special scrolling background
							$scroller.addClass("sapSuiteUiCommonsTimelineScrolling");

							// after some delay remove scrolling background
							clearTimeout(jQuery.data(this, 'scrollTimer'));
							jQuery.data(this, 'scrollTimer', setTimeout(function () {
								// clear both to prevent chaining
								$scrollerAIcon.removeClass("sapSuiteUiCommonsTimelineScrolling");
								$scrollerBIcon.removeClass("sapSuiteUiCommonsTimelineScrolling");
							}, 350));
						}
					});

					// setup scroller click events
					this.$().find(".sapSuiteUiCommonsTimelineScrollerIconWrapper").mousedown(function (event) {
						var SCROLLSIZE = 90,
							iDiff = ($(this).hasClass("sapSuiteUiCommonsTimelineScrollerIconWrapperLeft") ||
							$(this).hasClass("sapSuiteUiCommonsTimelineScrollerIconWrapperTop")) ? -SCROLLSIZE : SCROLLSIZE;

						that._manualScrolling = true;
						that._performScroll(iDiff);
					});

					this.$().find(".sapSuiteUiCommonsTimelineScrollerIconWrapper").mouseup(function () {
						that._manualScrolling = false;
					});
				}

				// setup wheel scrolling for horizontal timeline
				if (this.getEnableScroll()) {
					// horizontal mouse scroll
					this._$content.on("wheel", function (event) {
						var iDeltaY = event.originalEvent.deltaY;
						this.scrollLeft += iDeltaY * 2;
					});

					$this.find(".sapSuiteUiCommonsTimelineHorizontalScroller, .sapSuiteUiCommonsTimelineVerticalScroller").on("wheel", function (event) {
						var iDeltaY = event.originalEvent.deltaY;
						that._isVertical() ? that._$content.get(0).scrollTop += iDeltaY * 2 : that._$content.get(0).scrollLeft += iDeltaY * 2;
					});
				}
			};

			/**
			 * Message strip creation
			 * @private
			 */
			Timeline.prototype._setupMessageStrip = function () {
				var that = this;
				this._objects.register("messageStrip", function () {
					return new MessageStrip(that.getId() + "-messageStrip", {
						close: function () {
							that.setCustomMessage("");
							that.fireCustomMessageClosed();
						},
						showCloseButton: true
					});
				});

				this._objects.register("filterMessageText", function () {
					return new Text(that.getId() + "-filterMessageText", {});
				});

				this._objects.register("filterMessage", function () {
					var oText = that._objects.getFilterMessageText(),
						oToolbar, oIcon;

					oIcon = new Icon(that.getId() + "filterMessageIcon", {
						src: "sap-icon://decline",
						press: [that._clearFilter.bind(that)]
					});

					oToolbar = new OverflowToolbar(that.getId() + "-filterMessage", {
						design: "Info",
						content: [oText, new ToolbarSpacer(), oIcon]
					});

					oToolbar.addStyleClass("sapSuiteUiCommonsTimelineFilterInfoBar");
					oToolbar.setHeight("auto");

					return oToolbar;
				});
			};

			/**
			 * If there is any filter message to show, display filter bar
			 * @param ctrl {object} control for filter bar to be appended to
			 * @private
			 */
			Timeline.prototype._setMessageBars = function (ctrl) {
				var sMessage = this._getFilterMessage();
				if (sMessage) {
					ctrl.addChild(this._objects.getFilterMessage());
					this._objects.getFilterMessageText().setText(sMessage);
				}
			};

			/**
			 * Range filter dialog creation
			 * @private
			 */
			Timeline.prototype._setupRangeFilterPage = function () {
				var that = this;
				this._rangeFilterType = null;

				this._objects.register("timeFilterSelect", new Select(this.getId() + "-timeFilterSelect", {
					change: function (event) {
						that._rangeFilterType = event.getParameter("selectedItem").getProperty("key");
						that._setRangeFilter();
					},
					items: [
						new Item({
							text: resourceBundle.getText("TIMELINE_YEAR"),
							key: TimelineGroupType.Year
						}),
						new Item({
							text: resourceBundle.getText("TIMELINE_QUARTER"),
							key: TimelineGroupType.Quarter
						}),
						new Item({
							text: resourceBundle.getText("TIMELINE_MONTH"),
							key: TimelineGroupType.Month
						}),
						new Item({
							text: resourceBundle.getText("TIMELINE_DAY"),
							key: TimelineGroupType.Day
						})]
				}));

				this._objects.getTimeFilterSelect().addStyleClass("sapSuiteUiCommonsTimelineRangeSelect");

				this._objects.register("timeRangeSlider", function () {
					var oSlider = new RangeSlider(that.getId() + "-timeRangeSlider", {
						enableTickmarks: true,
						visible: false,
						step: 1
					});

					oSlider._updateTooltipContent = function (oTooltip, iNewValue) {
						var oLabelDate = that._fnAddDate(iNewValue);
						if (oLabelDate > that._maxDate) {
							oLabelDate = that._maxDate;
						}
						if (oLabelDate < that._minDate) {
							oLabelDate = that._minDate;
						}

						oTooltip.text(that._formatGroupBy(oLabelDate, that._rangeFilterType).title);
					};
					oSlider.addStyleClass("sapSuiteUiCommonsTimelineRangeFilter");
					oSlider.onAfterRendering = function () {
						RangeSlider.prototype.onAfterRendering.apply(this);

						var aChildren = this.$().find(".sapMSliderLabel");
						aChildren.eq(0).html(that._formatGroupBy(that._minDate, that._rangeFilterType).title);
						aChildren.eq(1).html(that._formatGroupBy(that._maxDate, that._rangeFilterType).title);
					};

					return oSlider;
				});

				this._objects.register("rangeTypeLbl", new Label(this.getId() + "-rangeTypeLbl", {
					text: resourceBundle.getText("TIMELINE_GROUP_BY_PERIOD") + ":"
				}));

				this._objects.register("rangeTypePanel", function () {
					var oPanel = new Panel(that.getId() + "-rangeTypePanel", {
						content: [that._objects.getRangeTypeLbl(), that._objects.getTimeFilterSelect()]
					});
					oPanel.addStyleClass("sapSuiteUiCommonsTimelineRangeFilterPanel");
					return oPanel;
				});

				this._objects.register("rangePanel", new FlexBox(this.getId() + "rangePanel", {
					direction: "Column",
					items: [this._objects.getRangeTypePanel(), this._objects.getTimeRangeSlider()],
				}));
			};

			/**
			 * Filter dialog creation
			 * @private
			 */
			Timeline.prototype._setupFilterDialog = function () {
				var that = this;
				this._objects.register("filterContent", function () {
					var fnProcessToDataFilterPage = function (oPage) {
							// recreate from the scratch every time its opened as data may dynamically change
							that._setFilterList();
							oPage.removeAllItems();
							that._aFilterList.forEach(function (oItem) {
								var bSelected = $.grep(that._currentFilterKeys, function (oSelectedItem) {
										return oItem.key == oSelectedItem.key;
									}).length > 0;

								oPage.addItem(new ViewSettingsFilterItem({
									key: oItem.key,
									text: oItem.text,
									selected: bSelected
								}));
							});
						},
						fnProcessToRangeFilterPage = function () {
							var fnShowErrorToast = function () {
									MessageToast.show(resourceBundle.getText("TIMELINE_NO_LIMIT_DATA"));
								},
								iDiffStart, iDiffEnd;

							oFilterDialog.setBusy(true);
							that._getTimeFilterData().then(function () {
								oFilterDialog.setBusy(false);
								if ((!that._minDate || !that._maxDate) ||
									(!(that._minDate instanceof Date) || !(that._maxDate instanceof Date))) {
									fnShowErrorToast();
									return;
								}

								if (!that._rangeFilterType) {
									// first time load - calculate range type by date difference
									that._rangeFilterType = that._calculateRangeTypeFilter();
								}

								if (that._startDate == null && that._endDate == null) {
									that._setRangeFilter();
								} else {
									// convert selected date time to integer number (difference from the start) to correctly setup time range selector
									iDiffStart = that._fnDateDiff(that._rangeFilterType, that._minDate, that._startDate);
									iDiffEnd = that._fnDateDiff(that._rangeFilterType, that._minDate, that._endDate);

									that._objects.getTimeRangeSlider().setRange([iDiffStart, iDiffEnd]);
								}

								// reselect drop down with type
								that._objects.getTimeFilterSelect().setSelectedKey(that._rangeFilterType);

								// process dialog setup
								that._objects.getTimeRangeSlider().setVisible(true);
								that._objects.getTimeRangeSlider().invalidate();
							}).catch(function () {
								oFilterDialog.setBusy(false);
								fnShowErrorToast();
							});
						},
						oFilterDialog = new ViewSettingsDialog(that.getId() + "-filterContent", {
							confirm: function (oEvent) {
								// collect filter items
								var aItems = oEvent.getParameter("filterItems"),
									oSlider, iMin, iMax, aRange, bRange;
								that._currentFilterKeys = aItems.map(function (oItem) {
									return {
										key: oItem.getProperty("key"),
										text: oItem.getProperty("text")
									}
								});

								// collect time range items
								oSlider = that._objects.getTimeRangeSlider();
								aRange = oSlider.getRange();
								iMin = oSlider.getMin();
								iMax = oSlider.getMax();

								that._startDate = null;
								that._endDate = null;

								if (aRange[0] !== iMin || aRange[1] !== iMax) {
									that._startDate = that._fnAddDate(Math.min.apply(null, aRange), DateRoundType.DOWN);
									that._endDate = that._fnAddDate(Math.max.apply(null, aRange), DateRoundType.UP);
									bRange = true;
								}

								that._filterData(bRange);
							},
							filterDetailPageOpened: function (oItem) {
								var sKey = oItem.getParameter("parentFilterItem").getProperty("key"),
									oParent;
								if (sKey === "items") {
									fnProcessToDataFilterPage(oItem.getParameter("parentFilterItem"));
								}
								if (sKey === "range") {
									fnProcessToRangeFilterPage();
								}
							},
							filterItems: [
								new ViewSettingsFilterItem({
									key: "items",
									text: that._getFilterTitle()
								})
							]
						});

					if (that.getShowTimeFilter()) {
						oFilterDialog.addAggregation("filterItems", new ViewSettingsCustomItem({
							key: "range",
							text: resourceBundle.getText("TIMELINE_RANGE_SELECTION"),
							customControl: [that._objects.getRangePanel()]
						}));
					}

					return oFilterDialog;
				});
			};

			/**
			 * Header toolbar creation + icons
			 * @private
			 */
			Timeline.prototype._setupHeaderToolbar = function () {
				var that = this,
					fnRegisterControl = function (oOptions) {
						that._objects.register(oOptions.name, function () {
							var btn = new OverflowToolbarButton(that.getId() + "-" + oOptions.name, {
								type: ButtonType.Transparent,
								icon: oOptions.icon,
								tooltip: oOptions.tooltip,
								press: oOptions.fnPress
							});

							btn.setLayoutData(new OverflowToolbarLayoutData({
								priority: oOptions.priority
							}));

							return btn;
						});
					};

				fnRegisterControl({
					name: "filterIcon",
					icon: "sap-icon://add-filter",
					tooltip: resourceBundle.getText("TIMELINE_FILTER_BY"),
					fnPress: function (oEvent) {
						that._openFilterDialog();
					},
					priority: OverflowToolbarPriority.NeverOverflow
				});

				fnRegisterControl({
					name: "sortIcon",
					icon: "sap-icon://arrow-bottom",
					tooltip: resourceBundle.getText("TIMELINE_SORT"),
					fnPress: function (oEvent) {
						that._sortClick();
					},
					priority: OverflowToolbarPriority.High
				});

				var oToolbarSpacer = new ToolbarSpacer();

				this._objects.register("searchField", function () {
					var btn = new SearchField(that.getId() + "-searchField", {
						width: "14rem",
						search: function (oEvent) {
							that._search(oEvent.getSource().getValue());
						}
					});
					btn.setLayoutData(new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.Low
					}));

					return btn;
				});

				this._objects.register("headerBar", function () {
					var aContent = [];
					if (that._isVertical()) {
						aContent = [oToolbarSpacer, that._objects.getSearchField(), that._objects.getSortIcon(), that._objects.getFilterIcon()];
					} else {
						aContent = [that._objects.getSortIcon(), that._objects.getFilterIcon(), that._objects.getSearchField()];
					}

					var oHeaderBar = new OverflowToolbar(that.getId() + "-headerBar", {
						content: aContent
					});

					oHeaderBar.addStyleClass("sapSuiteUiCommonsTimelineHeaderBar");
					oHeaderBar.setVisible(that.getShowFilterBar());
					oHeaderBar.setParent(that);

					return oHeaderBar;
				});
			};

			/**
			 * Initializes elements for accessibility support.
			 * @private
			 */
			Timeline.prototype._setupAccessibilityItems = function () {
				var that = this;
				this._objects.register("accessibilityTitle", function () {
					return new InvisibleText(that.getId() + "-accessibilityTitle", {
						text: resourceBundle.getText("TIMELINE_ACCESSIBILITY_TITLE")
					});
				});
			};
		}
	};

	return TimelineRenderManager;
}, true);