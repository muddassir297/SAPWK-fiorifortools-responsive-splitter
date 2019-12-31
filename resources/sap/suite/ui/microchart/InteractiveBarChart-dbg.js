/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/Device'],
	function(jQuery, library, Control, Device) {
	"use strict";

	/**
	 * Constructor for a new InteractiveBarChart control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The InteractiveBarChart control belongs to a chart control group in the MicroChart library with a number of interactive features. These interactive features provide more information on a chart value.
	 * For example, by selecting a bar you can get more details on the displayed value.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.46.2
	 *
	 * @public
	 * @since 1.42.0
	 * @constructor
	 * @alias sap.suite.ui.microchart.InteractiveBarChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 *
	 */
	var InteractiveBarChart = Control.extend("sap.suite.ui.microchart.InteractiveBarChart", /** @lends sap.suite.ui.microchart.InteractiveBarChart.prototype */ {
		metadata : {
			library : "sap.suite.ui.microchart",
			properties : {
				/**
				 * The number of displayed bars.
				 */
				displayedBars : {type : "int", group : "Appearance", defaultValue : 3},

				/**
				 * Width of the labels column in the resulting layout (in percentage). Possible range of values from 0 to 100.
				 * A value of 40 results in the labels column taking up 40% of available space.
				 */
				labelWidth : {type : "sap.ui.core.Percentage", group : "Appearance", defaultValue : "40%"},

				/**
				 * Enables the selection in the chart.
				 */
				selectionEnabled : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Begin of displayed scale.
				 */
				min: {type : "float", group : "Appearance"},

				/**
				 * End of displayed scale.
				 */
				max: {type : "float", group : "Appearance"}
			},
			defaultAggregation : "bars",
			aggregations : {
				/**
				 * Bars displayed on the chart.
				 */
				bars : {type : "sap.suite.ui.microchart.InteractiveBarChartBar", multiple : true, bindable : "bindable"}
			},
			events : {
				/**
				 * Event is fired when user has selected or deselected a bar.
				 */
				selectionChanged : {
					parameters : {
						/**
						 * All bars which are in selected state.
						 */
						selectedBars : {type : "sap.suite.ui.microchart.InteractiveBarChartBar[]"},

						/**
						 * The bar being selected or deselected.
						 */
						bar : {type : "sap.suite.ui.microchart.InteractiveBarChartBar"},

						/**
						 * The selection state of the bar being selected or deselected.
						 */
						selected : {type : "boolean"}
					}
				},
				/**
				 * The event is fired when the user presses the chart while its bars are not selectable in non-interactive mode. This is decided internally, depending on the size of the bars.
				 */
				press: {}
			},
			associations : {
				/**
				 * Association to controls which label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
			}
		}
	});

	/* Constants */
	InteractiveBarChart.MIN_BAR_WIDTH_IN_PX = 1; // minimum bar width for small values (px)
	InteractiveBarChart.BAR_VALUE_PADDING_LEFT_IN_PX = 4; // 0.25rem space between the bar and the displayed value in case of the value is displayed outside of the bar
	InteractiveBarChart.BAR_VALUE_PADDING_RIGHT_IN_PX = 4; // 0.25rem space between the displayed value and the end of the bar
	InteractiveBarChart.SELECTION_AREA_BORDER_IN_PX = 1; // border width of selection area of each side
	InteractiveBarChart.DIVIDER_WIDTH_IN_PX = 1; // width of the divider separating negative and positive values
	// Responsiveness height
	InteractiveBarChart.AREA_HEIGHT_MINVALUE = 18; // area height threshold for which the chart should be hidden (px)
	InteractiveBarChart.BAR_HEIGHT_FONT_SMALLER = 22; // bar height threshold for a switch to smaller font (px)
	InteractiveBarChart.BAR_HEIGHT_MINVALUE = 6; // bar height threshold for which the chart should be hidden (px)
	InteractiveBarChart.BAR_HEIGHT_LABEL_HIDE = 16; // bar height threshold for which the labels inside bars should be hidden (px)
	// Responsiveness width
	InteractiveBarChart.CHART_WIDTH_FONT_SMALLER = 288; // chart width threshold for a switch to smaller font (px)
	InteractiveBarChart.LABEL_WIDTH_MINVALUE = 80; // label width threshold for a switch to move labels above bars (px)
	InteractiveBarChart.CHART_WIDTH_MINVALUE = 130; // chart width threshold for a switch to an invisible chart (px)
	// Responsiveness cozy vs compact mode
	InteractiveBarChart.AREA_HEIGHT_INTERACTIVE_MINVALUE = 48; // the minimum area height for an interactive mode (px)
	InteractiveBarChart.AREA_HEIGHT_INTERACTIVE_MINVALUE_COMPACT = 32;
	InteractiveBarChart.AREA_HEIGHT_PADDING_STAGE1 = 34; // the area height threshold for a smaller padding between bar and area - stage1 (px)
	InteractiveBarChart.AREA_HEIGHT_PADDING_STAGE1_COMPACT = 32;
	InteractiveBarChart.AREA_HEIGHT_PADDING_STAGE2 = 28; // the area height threshold for a smaller padding between bar and area - stage2 (px)
	InteractiveBarChart.AREA_HEIGHT_PADDING_STAGE2_COMPACT = 31;

	InteractiveBarChart.prototype.init = function() {
		/* Internal properties */
		this._iVisibleBars = 0; // visible bars is always a minimum value between available bars and displayed bars
		this._bInteractiveMode = true; // in non-interactive mode, the user cannot interact with the chart (user actions are ignored)
		this._bMinMaxValid = null;
		this._fDividerPositionRight = 0;
		this._iAreaHeightInteractiveMinValue;
		this._iAreaHeightPaddingStage1;
		this._iAreaHeightPaddingStage2;
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.microchart");

		this._bThemeApplied = true;
		if (!sap.ui.getCore().isInitialized()) {
			this._bThemeApplied = false;
			sap.ui.getCore().attachInit(this._handleCoreInitialized.bind(this));
		} else {
			this._handleCoreInitialized();
		}
	};

	/**
	 * Handler for the core's init event. In order for the control to be rendered only if all themes
	 * are loaded and everything is properly initialized, we attach a theme check in here.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._handleCoreInitialized = function() {
		this._bThemeApplied = sap.ui.getCore().isThemeApplied();
		if (!this._bThemeApplied) {
			sap.ui.getCore().attachThemeChanged(this._handleThemeApplied, this);
		}
	};

	/**
	 * The chart is not being rendered until the theme was applied.
	 * If the theme is applied, rendering starts by the control itself.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._handleThemeApplied = function() {
		this._bThemeApplied = true;
		this.invalidate();
		sap.ui.getCore().detachThemeChanged(this._handleThemeApplied, this);
	};

	InteractiveBarChart.prototype.onBeforeRendering = function() {
		this._bCompact = this._isCompact();
		this._bInteractiveMode = true;
		// set the data needed for responsiveness
		this._setResponsivenessData();
		this._bMinMaxValid = this._checkIfMinMaxValid();
		if (this.getAggregation("bars") && this.getDisplayedBars()) {
			this._iVisibleBars = Math.min(this.getAggregation("bars").length, this.getDisplayedBars());
		}
		if (!this.data("_parentRenderingContext") && jQuery.isFunction(this.getParent)) {
			this.data("_parentRenderingContext", this.getParent());
		}
		this._deregisterResizeHandler();
		sap.ui.getCore().detachIntervalTimer(this._checkContentDensity, this);
	};

	InteractiveBarChart.prototype.onAfterRendering = function() {
		this._sResizeHandlerId = sap.ui.core.ResizeHandler.register(this, this._onResize.bind(this));
		this._adjustToParent();
		this._calcBarsWidth();
		this._onResize();

		// attach an interval timer in order to check the control's density mode and invalidate on change
		sap.ui.getCore().attachIntervalTimer(this._checkContentDensity, this);
	};

	InteractiveBarChart.prototype.exit = function() {
		this._deregisterResizeHandler();
		sap.ui.getCore().detachIntervalTimer(this._checkContentDensity, this);
	};

	/* =========================================================== */
	/* Event handling */
	/* =========================================================== */
	/**
	 * Event handler for click. In non-interactive mode, all user actions are ignored.
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onclick = function(event) {
		// no click for disabled mode
		if (!this.getSelectionEnabled()) {
			 return;
		}
		if (this._bInteractiveMode) {
			var sId = jQuery(event.target).attr("id") || jQuery(event.target).parents(".sapSuiteIBCBarInteractionArea").attr("id"),
				$Focusables = this.$().find(".sapSuiteIBCBarInteractionArea"),
				iIndex, iHasFocus;
			if (sId) {
				iIndex = sId.substring(sId.lastIndexOf("-") + 1);
				if (isNaN(iIndex)) {
					return;
				} else {
					iIndex = parseInt(iIndex, 10);
				}
				this._toggleSelected(iIndex);
				// find out which bar has tabindex = 0 at this moment
				iHasFocus = $Focusables.index(this.$().find(".sapSuiteIBCBarInteractionArea[tabindex='0']"));
				this._switchTabindex(iHasFocus, iIndex, $Focusables);
			}
		} else {
			this.firePress();
			if (Device.browser.msie) {
				this.$().focus();
				event.preventDefault();
			}
		}
	};

	/**
	 * Handler for enter button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapenter = function(event) {
		if (this._bInteractiveMode) {
			var iIndex = this.$().find(".sapSuiteIBCBarInteractionArea").index(event.target);
			if (iIndex !== -1) {
				this._toggleSelected(iIndex);
			}
			event.preventDefault();
			event.stopImmediatePropagation();
		} else {
			this.firePress();
		}
	};

	/**
	 * Handler for space button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapspace = InteractiveBarChart.prototype.onsapenter;

	/**
	 * Handler for up arrow button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapup = function(event) {
		var $Focusables = this.$().find(".sapSuiteIBCBarInteractionArea");
		var iIndex = $Focusables.index(event.target);
		if ($Focusables.length > 0) {
			this._switchTabindex(iIndex, iIndex - 1, $Focusables);
		}
		event.preventDefault();
		event.stopImmediatePropagation();
	};

	/**
	 * Handler for down arrow button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapdown = function(event) {
		var $Focusables = this.$().find(".sapSuiteIBCBarInteractionArea");
		var iIndex = $Focusables.index(event.target);
		if ($Focusables.length > 0) {
			this._switchTabindex(iIndex, iIndex + 1, $Focusables);
		}
		event.preventDefault();
		event.stopImmediatePropagation();
	};

	/**
	 * Handler for home button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsaphome = function(event) {
		var $Focusables = this.$().find(".sapSuiteIBCBarInteractionArea");
		var iIndex = $Focusables.index(event.target);
		if (iIndex !== 0 && $Focusables.length > 0) {
			this._switchTabindex(iIndex, 0, $Focusables);
		}
		event.preventDefault();
		event.stopImmediatePropagation();
	};

	/**
	 * Handler for end button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapend = function(event) {
		var $Focusables = this.$().find(".sapSuiteIBCBarInteractionArea"),
			iIndex = $Focusables.index(event.target),
			iLength = $Focusables.length;
		if (iIndex !== iLength - 1 && iLength > 0) {
			this._switchTabindex(iIndex, iLength - 1, $Focusables);
		}
		event.preventDefault();
		event.stopImmediatePropagation();
	};

	/**
	 * Handler for left arrow button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapleft = InteractiveBarChart.prototype.onsapup;

	/**
	 * Handler for right arrow button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapright = InteractiveBarChart.prototype.onsapdown;

	/* =========================================================== */
	/* API methods */
	/* =========================================================== */
	/**
	 * Gets all selected bars.
	 *
	 * @returns {sap.suite.ui.microchart.InteractiveBarChartBar[]} All selected bars
	 * @public
	 */
	InteractiveBarChart.prototype.getSelectedBars = function() {
		var aBars = this.getAggregation("bars"),
			aSelectedBars = [], i;

		for (i = 0; i < aBars.length; i++) {
			if (aBars[i].getSelected()) {
				aSelectedBars.push(aBars[i]);
			}
		}
		return aSelectedBars;
	};

	/**
	 * Already selected bars will be deselected and members of the selectedBars parameter which are part of the bars aggregation will be set to selected state.
	 *
	 * @param {sap.suite.ui.microchart.InteractiveBarChartBar | sap.suite.ui.microchart.InteractiveBarChartBar[]} selectedBars A bar element or an array of bars for which the status should be set to selected.
	 * @returns {sap.suite.ui.microchart.InteractiveBarChart} this to allow method chaining
	 * @public
	 */
	InteractiveBarChart.prototype.setSelectedBars = function(selectedBars) {
		var aBars = this.getAggregation("bars"),
			i, iIndex;
		this._deselectAllSelectedBars();
		if (!selectedBars) {
			return this;
		}
		if (selectedBars instanceof library.InteractiveBarChartBar) {
			selectedBars = [selectedBars];
		}
		if (jQuery.isArray(selectedBars)) {
			for (i = 0; i < selectedBars.length; i++) {
				iIndex = this.indexOfAggregation("bars", selectedBars[i]);
				if (iIndex >= 0) {
					aBars[iIndex].setProperty("selected", true, true);
				} else {
					jQuery.sap.log.warning("setSelectedBars method called with invalid InteractiveBarChartBar element");
				}
			}
		}
		this.invalidate();
		return this;
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */
	/**
	 * Looks for the class '.sapUiSizeCompact' on the control and its parents to determine whether to render cozy or compact density mode.
	 *
	 * @returns {boolean} True if class 'sapUiSizeCompact' was found, otherwise false.
	 * @private
	 */
	InteractiveBarChart.prototype._isCompact = function() {
		return jQuery("body").hasClass("sapUiSizeCompact") || this.$().is(".sapUiSizeCompact") || this.$().closest(".sapUiSizeCompact").length > 0;
	};

	/**
	 * Changes data for compact mode related to cozy (default) mode.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._setResponsivenessData = function() {
		if (this._bCompact) {
			this._iAreaHeightInteractiveMinValue = InteractiveBarChart.AREA_HEIGHT_INTERACTIVE_MINVALUE_COMPACT;
			this._iAreaHeightPaddingStage1 = InteractiveBarChart.AREA_HEIGHT_PADDING_STAGE1_COMPACT;
			this._iAreaHeightPaddingStage2 = InteractiveBarChart.AREA_HEIGHT_PADDING_STAGE2_COMPACT;
		} else {
			this._iAreaHeightInteractiveMinValue = InteractiveBarChart.AREA_HEIGHT_INTERACTIVE_MINVALUE;
			this._iAreaHeightPaddingStage1 = InteractiveBarChart.AREA_HEIGHT_PADDING_STAGE1;
			this._iAreaHeightPaddingStage2 = InteractiveBarChart.AREA_HEIGHT_PADDING_STAGE2;
		}
	};

	/**
	 * Checks the current content density and invalidates the control if it is changed in order to trigger a re-rendering.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._checkContentDensity = function() {
		if (this.$().length > 0) {
			var bCompact = this._isCompact();
			if (bCompact !== this._bCompact) {
				this._bCompact = bCompact;
				this.invalidate();
			}
		}
	};

	/**
	 * Adjusts the height and width of the whole control if this is required depending on parent control.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._adjustToParent = function() {
		var $This = this.$();
		if (this.data("_parentRenderingContext") && this.data("_parentRenderingContext") instanceof sap.m.FlexBox) {
			// Subtracts two pixels, otherwise there's not enough space for the outline, and the chart won't be rendered properly
			var $Parent = this.data("_parentRenderingContext").$();
			var iParentWidth = $Parent.width() - 2;
			var iParentHeight = $Parent.height() - 2;
			$This.outerWidth(iParentWidth);
			$This.outerHeight(iParentHeight);
		}
	};

	/**
	 * Calculates the width of the bars.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._calcBarsWidth = function() {
		var fMin = this.getMin(),
			$This = this.$(),
			fMax = this.getMax(),
			fDividerWidth = InteractiveBarChart.DIVIDER_WIDTH_IN_PX,
			fLabelAreaWidth = parseFloat(this.getLabelWidth()),
			fBarAreaWidth, fDelta,
			fBarActualNegativeSpaceInPixel, fBarActualPositiveSpaceInPixel,
			fBarActualNegativeSpaceInPercent, fBarActualPositiveSpaceInPercent,
			fLabelAreaWidthFullWidth, fLabelLeftPositionFullWidth,
			fValue, fEdgeValue;
		if (!this._bMinMaxValid) {
			return this;
		}
		if (this._bFullWidth) {
			fLabelAreaWidth = 100;
			fBarAreaWidth = 100;
		} else {
			fBarAreaWidth = 100 - fLabelAreaWidth;
		}
		fDelta = Math.abs(fMax - fMin);
		if (fMin >= 0 && fMax >= 0) {
			fBarActualNegativeSpaceInPercent = 0;
			fBarActualPositiveSpaceInPercent = 1;
		} else if (fMin < 0 && fMax < 0) {
			fBarActualNegativeSpaceInPercent = 1;
			fBarActualPositiveSpaceInPercent = 0;
		} else {
			fBarActualNegativeSpaceInPercent = Math.abs(fMin / fDelta);
			fBarActualPositiveSpaceInPercent = Math.abs(fMax / fDelta);
		}

		if (this._bFullWidth) {
			if (fBarActualPositiveSpaceInPercent >= fBarActualNegativeSpaceInPercent) {
				fLabelAreaWidthFullWidth = fBarActualPositiveSpaceInPercent * 100;
				fLabelLeftPositionFullWidth = fBarActualNegativeSpaceInPercent * 100;
			} else {
				fLabelAreaWidthFullWidth = fBarActualNegativeSpaceInPercent * 100;
				fLabelLeftPositionFullWidth = 0;
			}
			$This.find(".sapSuiteIBCBarLabel").css("width", fLabelAreaWidthFullWidth + "%");
			$This.find(".sapSuiteIBCBarLabel").css("left", fLabelLeftPositionFullWidth + "%");
		} else {
			$This.find(".sapSuiteIBCBarLabel").css("width", fLabelAreaWidth + "%");
			$This.find(".sapSuiteIBCBarLabel").css("left", "");
		}
		$This.find(".sapSuiteIBCBarWrapper").css("width", fBarAreaWidth + "%");

		if (fBarActualNegativeSpaceInPercent > 0) {
			$This.find(".sapSuiteIBCBarWrapperNegative").width("calc(" + fBarActualNegativeSpaceInPercent * 100 + "% - " + fDividerWidth + "px)");
		} else {
			$This.find(".sapSuiteIBCBarWrapperNegative").width("0%");
		}
		if (fBarActualPositiveSpaceInPercent > 0) {
			$This.find(".sapSuiteIBCBarWrapperPositive").width("calc(" + fBarActualPositiveSpaceInPercent * 100 + "% - " + fDividerWidth + "px)");
		} else {
			$This.find(".sapSuiteIBCBarWrapperPositive").width("0%");
		}

		fBarActualNegativeSpaceInPixel = this.$("bar-negative-0").parent().width();
		fBarActualPositiveSpaceInPixel = this.$("bar-positive-0").parent().width();

		for (var i = 0; i < this._iVisibleBars; i++) {
			fValue = this.getBars()[i].getValue();
			if (!this.getBars()[i]._bNullValue || fValue !== 0) {
				if (fValue > 0) { //positive value
					fEdgeValue = Math.min(Math.max(fValue, fMin), fMax);
					this.$("bar-positive-" + i).css("width", this._calcPercent(fEdgeValue, fDelta, Math.max(0, fMin), fBarActualPositiveSpaceInPercent, fBarActualPositiveSpaceInPixel));
				} else { //negative value
					fEdgeValue = Math.max(Math.min(fValue, fMax), fMin);
					this.$("bar-negative-" + i).css("width", this._calcPercent(fEdgeValue, fDelta, Math.min(0, fMax), fBarActualNegativeSpaceInPercent, fBarActualNegativeSpaceInPixel));
				}
			}
		}
	};

	/**
	 * Calculates the percentage from the total width needed for the positive or negative bars.
	 * In case of very small bars, the minimum bar fixed width is returned.
	 *
	 * @param {float} barValue The value of the bar.
	 * @param {float} deltaValue The delta chart value as a difference between minimum and maximum values of the chart.
	 * @param {float} chartEdgeValue The edge value of the chart.
	 * @param {float} spaceValuePercent The value of the available space for the bar (in percent).
	 * @param {float} spaceValuePixel The value of the available space for the bar (in pixels).
	 * @returns {string} The percentage value of the bar's width or the minimum accepted bar's width in case of very small bars
	 * @private
	 */
	InteractiveBarChart.prototype._calcPercent = function(barValue, deltaValue, chartEdgeValue, spaceValuePercent, spaceValuePixel) {
		var fRelativeValue, fResult;
		fRelativeValue = Math.abs((barValue - chartEdgeValue) / (deltaValue * spaceValuePercent) * 100);
		// relative value divided by scale, multiplied by ratio of actual width
		fResult = (fRelativeValue / (deltaValue * spaceValuePercent) * spaceValuePercent).toFixed(2) * 100;
		if ((fRelativeValue > 0 && (fResult / 100 * spaceValuePixel) < 1)) {
			return InteractiveBarChart.MIN_BAR_WIDTH_IN_PX + "px"; // bar width should be at least 1 px, if value is higher than min
		}

		return fRelativeValue + "%";
	};

	/**
	 * Deselects all selected bars.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._deselectAllSelectedBars = function() {
		var aBars = this.getAggregation("bars"),
			iBarsCount = aBars.length, i;

		for (i = 0; i < iBarsCount; i++) {
			aBars[i].setProperty("selected", false, true);
		}
	};

	/**
	 * Toggles the selection state of the bar element.
	 *
	 * @param {int} index The index of the bar element
	 * @private
	 */
	InteractiveBarChart.prototype._toggleSelected = function(index) {
		var aBars = this.getAggregation("bars"),
			oBar = aBars[index];

		if (index < 0 || index >= aBars.length) {
			return;
		}
		var $InteractionArea = this.$("interactionArea-" + index);
		if (oBar.getSelected()) {
			$InteractionArea.removeClass("sapSuiteIBCBarSelected");
			oBar.setProperty("selected", false, true);
		} else {
			$InteractionArea.addClass("sapSuiteIBCBarSelected");
			oBar.setProperty("selected", true, true);
		}
		$InteractionArea.attr("aria-selected", oBar.getSelected());
		this.fireSelectionChanged({
			selectedBars: this.getSelectedBars(),
			bar: oBar,
			selected: oBar.getSelected()
		});
	};

	/**
	 * Sets the displayed value outside of the bar if there is not enough space in the bar.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._showValueOutsideBar = function() {
		var $Control = this.$(),
			$BarValues, iValueShift, fBarValueWidthWithPadding,
			fBarPositiveWidth, fBarNegativeWidth,
			fBarWrapperPositiveOuterWidth, fBarWrapperNegativeOuterWidth,
			fBarWrapperPositiveWidth = this.$("bar-positive-0").parent().width(),
			fBarWrapperNegativeWidth = this.$("bar-negative-0").parent().width();

		$BarValues = $Control.find(".sapSuiteIBCBarValue");
		if ($BarValues.length === 0) {
			return;
		}
		for (var i = 0; i < this._iVisibleBars; i++) {
			fBarValueWidthWithPadding = ($BarValues.eq(i).width() + InteractiveBarChart.BAR_VALUE_PADDING_LEFT_IN_PX + InteractiveBarChart.BAR_VALUE_PADDING_RIGHT_IN_PX);
			fBarPositiveWidth = this.$("bar-positive-" + i).width();
			fBarNegativeWidth = this.$("bar-negative-" + i).width();
			fBarWrapperPositiveOuterWidth = fBarWrapperPositiveWidth - fBarPositiveWidth;
			fBarWrapperNegativeOuterWidth = fBarWrapperNegativeWidth - fBarNegativeWidth;
			if (this.getBars()[i].getValue() >= 0 || (this.getBars()[i]._bNullValue && this.getMin() + this.getMax() >= 0)) {
				// align positive labels
				if (fBarValueWidthWithPadding > fBarPositiveWidth && fBarValueWidthWithPadding > fBarWrapperPositiveOuterWidth) {
					$BarValues.eq(i).css("visibility", "hidden");
				} else {
					$BarValues.eq(i).css("visibility", "inherit");
				}
				if (fBarValueWidthWithPadding > fBarPositiveWidth) {
					// bar value width plus margins don't fit into the bar
					iValueShift = this.$("bar-positive-" + i).width() + InteractiveBarChart.BAR_VALUE_PADDING_LEFT_IN_PX;
					$BarValues.eq(i).css({ "left": iValueShift });
					$BarValues.eq(i).addClass("sapSuiteIBCBarValueOutside");
				} else {
					$BarValues.eq(i).css({ "left": "" });
					$BarValues.eq(i).removeClass("sapSuiteIBCBarValueOutside");
				}
			} else {
				// align negative labels
				if (fBarValueWidthWithPadding > fBarNegativeWidth && fBarValueWidthWithPadding > fBarWrapperNegativeOuterWidth) {
					$BarValues.eq(i).css("visibility", "hidden");
				} else {
					$BarValues.eq(i).css("visibility", "inherit");
				}
				if (fBarValueWidthWithPadding > fBarNegativeWidth) {
					//bar value width plus margins don't fit into the bar
					iValueShift = this.$("bar-negative-" + i).width() + InteractiveBarChart.BAR_VALUE_PADDING_RIGHT_IN_PX;
					$BarValues.eq(i).css({ "right": iValueShift });
					$BarValues.eq(i).addClass("sapSuiteIBCBarValueOutside");
				} else {
					$BarValues.eq(i).css({ "right": "" });
					$BarValues.eq(i).removeClass("sapSuiteIBCBarValueOutside");
				}
			}
		}
	};

	/**
	 * Checks if min and max properties contain valid data.
	 *
	 * @returns {boolean} flag for valid min / max data
	 * @private
	 */
	InteractiveBarChart.prototype._checkIfMinMaxValid = function() {
		var fMin = this.getMin(),
			fMax = this.getMax();
		if (isNaN(fMin) || isNaN(fMax)) {
			jQuery.sap.log.warning("Min or Max value for InteractiveBarChart is not provided.");
			return false;
		}
		if (fMin > fMax) {
			jQuery.sap.log.warning("Min value for InteractiveBarChart is larger than Max value.");
			return false;
		}
		return true;
	};

	InteractiveBarChart.prototype.validateProperty = function(propertyName, value) {
		if (propertyName === "labelWidth" && (value !== null || value !== undefined)) {
			var fValue = parseFloat(value);
			if (fValue < 0 || fValue > 100) {
				jQuery.sap.log.warning("LabelWidth for InteractiveBarChart is not between 0 and 100.");
				value = null;
			}
		}
		return Control.prototype.validateProperty.apply(this, [propertyName, value]);
	};

	/**
	 * Adds and removes the tabindex between elements to support keyboard navigation.
	 *
	 * @param {int} oldIndex which is the bar index whose tabindex is 0 previously.
	 * @param {int} newIndex which is the bar index whose tabindex should be set to 0 this time.
	 * @param {jQuery} focusables all the elements who can have tabindex attribute.
	 * @private
	 */
	InteractiveBarChart.prototype._switchTabindex = function(oldIndex, newIndex, focusables) {
		if (oldIndex >= 0 && oldIndex < focusables.length && newIndex >= 0 && newIndex < focusables.length) {
			focusables.eq(oldIndex).removeAttr("tabindex");
			focusables.eq(newIndex).attr("tabindex", "0");
			focusables.eq(newIndex).focus();
		}
	};

	/**
	 * Verifies if the chart is enabled for user actions or not.
	 *
	 * @returns {boolean} True if the chart is enabled for user actions, otherwise false.
	 * @private
	 */
	InteractiveBarChart.prototype._isChartEnabled = function() {
		return this.getSelectionEnabled() && this._bInteractiveMode;
	};

	/**
	 * Resizes the chart vertically. All use cases depend on the area height.
	 * Assuming that all the css files have already been loaded and they are available.
	 *
	 * @param {object} flags Some flags used for defining the visibility of specific chart elements
	 * @private
	 */
	InteractiveBarChart.prototype._resizeVertically = function(flags) {
		var iAreaHeight, iMargin, iBarHeight, $This = this.$(),
			$SelectionAreas = $This.find(".sapSuiteIBCBarInteractionArea"),
			iCurrentControlHeight = $This.height(), iInteractiveModeMarginDelta = 0,
			iVisibleBars = this._iVisibleBars;

		// margin
		if (this._bInteractiveMode) {
			iInteractiveModeMarginDelta = 1;
		}
		iMargin = parseInt($SelectionAreas.css("margin-bottom"), 10) + parseInt($SelectionAreas.css("margin-top"), 10);

		// selection area height
		iAreaHeight = ((iCurrentControlHeight - ((iMargin + 2 * InteractiveBarChart.SELECTION_AREA_BORDER_IN_PX) * iVisibleBars)) / iVisibleBars);

		// non-interactive mode
		if (iAreaHeight + iInteractiveModeMarginDelta < this._iAreaHeightInteractiveMinValue) {
			if (this._bInteractiveMode) {
				this._bInteractiveMode = false;
				$This.addClass("sapSuiteIBCNonInteractive");
				// set the focus area
				if (this.getSelectionEnabled()) {
					var $ActiveArea = this.$().find(".sapSuiteIBCBarInteractionArea[tabindex='0']");
					this._iActiveElement = this.$().find(".sapSuiteIBCBarInteractionArea").index($ActiveArea);
					$ActiveArea.removeAttr("tabindex");
					this.$().attr("tabindex", "0");
				}
				this.$().attr("role", "button");
				this.$().attr("aria-multiselectable", "false");
				this.$().attr("aria-disabled", !this._isChartEnabled());
			}
		} else {
			if (!this._bInteractiveMode) {
				this._bInteractiveMode = true;
				$This.removeClass("sapSuiteIBCNonInteractive");
				// set the focus area
				if (this.getSelectionEnabled()) {
					this.$().removeAttr("tabindex");
					if (!this._iActiveElement || this._iActiveElement < 0) {
						this._iActiveElement = 0;
					}
					this.$().find(".sapSuiteIBCBarInteractionArea").eq(this._iActiveElement).attr("tabindex", "0");
				}
				this.$().attr("role", "listbox");
				this.$().attr("aria-multiselectable", "true");
				this.$().attr("aria-disabled", !this._isChartEnabled());
			}
		}

		// adjust the bar height
		$SelectionAreas.height(iAreaHeight);

		// adjust the paddings
		if (iAreaHeight <= this._iAreaHeightPaddingStage2) {
			$This.addClass("sapSuiteIBCStage2");
		} else {
			$This.removeClass("sapSuiteIBCStage2");
			if (iAreaHeight <= this._iAreaHeightPaddingStage1) {
				$This.addClass("sapSuiteIBCStage1");
			} else {
				$This.removeClass("sapSuiteIBCStage1");
			}
		}

		// adjust the font-size for value and label (based on exact dimension in float; if rounded, it will flicker)
		var $Bars = this.$().find(".sapSuiteIBCBar");
		if ($Bars.length > 0) {
			iBarHeight = $Bars[0].getBoundingClientRect().height;
		}
		if (iBarHeight <= InteractiveBarChart.BAR_HEIGHT_FONT_SMALLER) {
			$This.addClass("sapSuiteIBCSmallFont");
		}

		// hide the labels inside the bars
		if (iBarHeight <= InteractiveBarChart.BAR_HEIGHT_LABEL_HIDE) {
			$This.find(".sapSuiteIBCBarValue").css("visibility", "hidden");
			flags.labelsVisible = false;
		} else {
			$This.find(".sapSuiteIBCBarValue").css("visibility", "inherit");
		}

		// hide the chart
		if (iAreaHeight < InteractiveBarChart.AREA_HEIGHT_MINVALUE) {
			$This.css("visibility", "hidden");
			flags.labelsVisible = false;
			flags.chartVisible = false;
		}
	};

	/**
	 * Resizes the chart horizontally. The use cases depend on the labels' area width and truncation.
	 * Assuming that all the css files have already been loaded and they are available.
	 *
	 * @param {object} flags Some flags used for defining the visibility of specific chart elements
	 * @private
	 */
	InteractiveBarChart.prototype._resizeHorizontally = function(flags) {
		if (!flags.chartVisible) {
			return;
		}

		var $This = this.$(),
			$SelectionAreas = $This.find(".sapSuiteIBCBarInteractionArea"),
			$BarLabel = $This.find(".sapSuiteIBCBarLabel"),
			iBarLabelWidth = parseFloat(this.getLabelWidth()) / 100 * $SelectionAreas.eq(0).width(),
			iBarLabelPaddingDelta = 0,
			iChartWidth = $This.width(), iBarHeight,
			bIsEllipsisActive = false;

		// font-size smaller
		if (iChartWidth < InteractiveBarChart.CHART_WIDTH_FONT_SMALLER) {
			$This.addClass("sapSuiteIBCSmallFont");
			// iBarLabelWidth to be recalculated because of possible width's changes related to font change
			iBarLabelWidth = parseFloat(this.getLabelWidth()) / 100 * $SelectionAreas.eq(0).width();
		}
		// account for changes in left padding of interactionarea present in fullwidth mode before calculating elipsis
		if (this._bFullWidth) {
			iBarLabelPaddingDelta = 6;
		}
		// verify if at least one label would be truncated if LabelArea was its original size
		for (var i = 0; i < $BarLabel.length; i++) {
			// check if label ellipsis would be active for the given labelWidth when fullWidth is not active
			$BarLabel.eq(i).css("width", iBarLabelWidth + "px");
			if ($BarLabel.eq(i).children(".sapSuiteIBCBarLabelText").prop("clientWidth") < $BarLabel.eq(i).children(".sapSuiteIBCBarLabelText").prop("scrollWidth") - iBarLabelPaddingDelta) {
				bIsEllipsisActive = true;
			}
			$BarLabel.eq(i).css("width", "100%");
		}

		// labels above
		if ( iBarLabelWidth < InteractiveBarChart.LABEL_WIDTH_MINVALUE && bIsEllipsisActive) {
			$This.addClass("sapSuiteIBCFullWidth");
			this._bFullWidth = true;
			this._calcBarsWidth();
		} else {
			$This.removeClass("sapSuiteIBCFullWidth");
			this._bFullWidth = false;
			this._calcBarsWidth();
		}

		// hide the chart
		var $Bars = this.$().find(".sapSuiteIBCBar");
		if ($Bars.length > 0) {
			iBarHeight = $Bars[0].getBoundingClientRect().height;
		}
		if (iChartWidth < InteractiveBarChart.CHART_WIDTH_MINVALUE ||
				iBarHeight < InteractiveBarChart.BAR_HEIGHT_MINVALUE) {
			$This.css("visibility", "hidden");
			flags.labelsVisible = false;
			flags.chartVisible = false;
		} else if (iBarHeight <= InteractiveBarChart.BAR_HEIGHT_LABEL_HIDE) {
			$This.find(".sapSuiteIBCBarValue").css("visibility", "hidden");
			flags.labelsVisible = false;
		}
	};

	/**
	 * Handles the responsiveness.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._onResize = function() {
		var $This = this.$(),
			flags = {chartVisible : true, labelsVisible: true};

		// restore to normal state (needed to perform further processings)
		$This.css("visibility", "visible");
		$This.removeClass("sapSuiteIBCSmallFont");

		// responsiveness logic
		this._resizeVertically(flags);
		this._resizeHorizontally(flags);

		// labels
		if (flags.labelsVisible) {
			this._showValueOutsideBar();
		}
	};

	/**
	 * Deregisters all handlers.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._deregisterResizeHandler = function() {
		if (this._sResizeHandlerId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeHandlerId);
			this._sResizeHandlerId = null;
		}
	};
	return InteractiveBarChart;
});
