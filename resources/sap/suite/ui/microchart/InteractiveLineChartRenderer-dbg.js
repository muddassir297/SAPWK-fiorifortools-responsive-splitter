/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	/**
	* InteractiveLineChartRenderer renderer.
	* @namespace
	*/
	var InteractiveLineChartRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render - Output - Buffer
	 * @param {sap.ui.core.Control} oControl the control to be rendered
	 */
	InteractiveLineChartRenderer.render = function(oRm, oControl) {
		if (!oControl._bThemeApplied) {
			return;
		}

		var nDisplayedPoints = oControl.getDisplayedPoints();
		var nPointLength = oControl.getPoints().length, iIndex = 0;
		if (nDisplayedPoints < nPointLength) {
			nPointLength = nDisplayedPoints;
		}
		var nPercentageWidth = 100 / nPointLength;
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapSuiteILC");
		oRm.writeClasses();

		//container accessibility
		var oAccOptions = {};
		oAccOptions.role = "listbox";
		oAccOptions.multiselectable = true;
		oAccOptions.disabled = !oControl._isChartEnabled();
		oAccOptions.labelledby = oControl.getAriaLabelledBy();
		oAccOptions.describedby = this._getAriaDescribedBy(oControl, nPointLength);
		oRm.writeAccessibilityState(oControl, oAccOptions);

		oRm.write(">");
		if (!oControl.getSelectionEnabled()) {
			this._renderDisabledOverlay(oRm, oControl);
		}
		this._renderChartCanvas(oRm, oControl, nPointLength, nPercentageWidth);
		oRm.write("<div");
		oRm.addClass("sapSuiteILCBottomLabelArea");
		if (oControl._fNormalizedZero) {
			oRm.addClass("sapSuiteILCBottomLabelAreaNoDivider");
		}
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapSuiteILCInteraction");
		oRm.writeClasses();
		oRm.write(">");

		for (iIndex = 0; iIndex < nPointLength; iIndex++) {
			this._renderPoint(oRm, oControl, iIndex, nPointLength, nPercentageWidth);
		}
		oRm.write("</div>");
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the given point, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the rendering buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {int} index The index of the point to be rendered inside the points aggregation
	 * @param {int} pointsLength The amount of points to be displayed
	 * @param {int} percentageWidth The width of the current point expressed in percentage from the total available chart width
	 * @private
	 */
	InteractiveLineChartRenderer._renderPoint = function(oRm, oControl, index, pointsLength, percentageWidth) {
		var oPoint = oControl.getPoints()[index];

		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oControl.getId() + "-point-area-" + index);
		oRm.addClass("sapSuiteILCSection");
		oRm.addClass("sapSuiteILCCanvasLayout");
		if (oPoint.getSelected()) {
			oRm.addClass("sapSuiteILCSelected");
		}
		oRm.writeClasses();
		oRm.addStyle("width", jQuery.sap.encodeHTML(percentageWidth + "%"));
		oRm.addStyle("left", jQuery.sap.encodeHTML(index * percentageWidth + "%"));
		oRm.writeStyles();
		oRm.write(">");
		oRm.write("<div");
		oRm.addClass("sapSuiteILCBackgroundArea");
		oRm.writeClasses();
		oRm.write("/>");
		var sAreaLabel = this._renderPointLabel(oRm, oControl, index, pointsLength);
		oRm.write("<div");
		oRm.addClass("sapSuiteILCInteractionArea");
		oRm.addClass("sapMPointer");
		oRm.writeClasses();
		if (index === 0 && oControl._isChartEnabled()) {
			oRm.writeAttribute("tabindex", "0");
		}

		// point accessibility
		var oAccOptions = {};
		oAccOptions.role = "option";
		oAccOptions.label = sAreaLabel;
		oAccOptions.selected = oPoint.getSelected();
		oAccOptions.posinset = index + 1;
		oAccOptions.setsize = pointsLength;
		oRm.writeAccessibilityState(oPoint, oAccOptions);

		oRm.write("/>");
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the given chart canvas, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the rendering buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {int} pointsLength The amount of points to be displayed
	 * @param {int} percentageWidth The width corresponding to each point expressed in percentage from the total available chart width
	 * @private
	 */
	InteractiveLineChartRenderer._renderChartCanvas = function(oRm, oControl, pointsLength, percentageWidth) {
		var iIndex;
		oRm.write("<div");
		oRm.addClass("sapSuiteILCChartCanvas");
		oRm.addClass("sapSuiteILCCanvasLayout");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<svg");
		oRm.addClass("sapSuiteILCSvgElement");
		oRm.writeClasses();
		oRm.writeAttribute("focusable", "false");
		oRm.write(">");

		if (oControl._fNormalizedZero) {
			oRm.write("<line");
			oRm.writeAttribute("x1", "1%");
			oRm.writeAttributeEscaped("y1", 100 - oControl._fNormalizedZero + "%");
			oRm.writeAttribute("x2", "99%");
			oRm.writeAttributeEscaped("y2", 100 - oControl._fNormalizedZero + "%");
			oRm.writeAttribute("stroke-width", "1");
			oRm.addClass("sapSuiteILCDivider");
			oRm.writeClasses();
			oRm.write("/>");
		}
		for (iIndex = 1; iIndex < pointsLength; iIndex++) {
			if (!oControl.getPoints()[iIndex - 1]._bNullValue && !oControl.getPoints()[iIndex]._bNullValue) {
				oRm.write("<line");
				oRm.writeAttributeEscaped("x1", percentageWidth / 2 + (iIndex - 1) * percentageWidth + "%");
				oRm.writeAttributeEscaped("y1", 100 - oControl._aNormalizedValues[iIndex - 1] + "%");
				oRm.writeAttributeEscaped("x2", percentageWidth / 2 + (iIndex) * percentageWidth + "%");
				oRm.writeAttributeEscaped("y2", 100 - oControl._aNormalizedValues[iIndex] + "%");
				oRm.writeAttribute("stroke-width", "2");
				oRm.write("/>");
			}
		}
		oRm.write("</svg>");
		for (iIndex = 0; iIndex < pointsLength; iIndex++) {
			oRm.write("<div");
			oRm.addStyle("left", jQuery.sap.encodeHTML(percentageWidth / 2 + iIndex * percentageWidth + "%"));
			if (!oControl.getPoints()[iIndex]._bNullValue) {
				oRm.addClass("sapSuiteILCPoint");
				oRm.addStyle("bottom", jQuery.sap.encodeHTML(oControl._aNormalizedValues[iIndex] + "%"));
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write("/>");
		}
		oRm.write("</div>");
	};

	/**
	 * Renders the label to be displayed for the current point, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the rendering buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {int} index The index of the point to be rendered inside the points aggregation
	 * @param {int} pointsLength The amount of points to be displayed
	 * @returns {string} The value of the aria-label accessibility attribute
	 * @private
	 */
	InteractiveLineChartRenderer._renderPointLabel = function(oRm, oControl, index, pointsLength) {
		var oPoint = oControl.getPoints()[index];
		var sBottomLabelText = oPoint.getLabel() || "", sTopLabelText = oPoint.getDisplayedValue();
		var aHeights;
		oRm.write("<div");
		oRm.addClass("sapSuiteILCTextElement");
		oRm.addClass("sapSuiteILCBottomText");
		oRm.addClass("sapMPointer");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(sBottomLabelText);
		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapSuiteILCTextElement");
		oRm.addClass("sapSuiteILCToplabel");
		oRm.addClass("sapMPointer");
		if (!oPoint._bNullValue) {
			if (!sTopLabelText) {
				sTopLabelText = oPoint.getValue().toString();
			}
			aHeights = [oControl._aNormalizedValues[index]];
			if (index > 0 && !oControl.getPoints()[index - 1]._bNullValue) {
				aHeights.push((oControl._aNormalizedValues[index] + oControl._aNormalizedValues[index - 1]) / 2);
			}
			if (index < pointsLength - 1 && !oControl.getPoints()[index + 1]._bNullValue) {
				aHeights.push((oControl._aNormalizedValues[index] + oControl._aNormalizedValues[index + 1]) / 2);
			}
			aHeights.sort(function(a, b) {
				return a - b;
			});
			if (oPoint.getValue() === oControl.nMax && oControl.nMax !== oControl.nMin) {
				oRm.addStyle("bottom", jQuery.sap.encodeHTML(aHeights[aHeights.length - 1] + "%"));
				oRm.addClass("sapSuiteILCShiftAbove");
			} else if (oPoint.getValue() === oControl.nMin && oControl.nMax !== oControl.nMin) {
				oRm.addStyle("bottom", jQuery.sap.encodeHTML(aHeights[0] + "%"));
				oRm.addClass("sapSuiteILCShiftBelow");
			} else if (Math.abs(oControl._aNormalizedValues[index] - aHeights[0]) < Math.abs(oControl._aNormalizedValues[index] - aHeights[aHeights.length - 1])) {
				oRm.addStyle("bottom", jQuery.sap.encodeHTML(aHeights[0] + "%"));
				oRm.addClass("sapSuiteILCShiftBelow");
			} else {
				oRm.addStyle("bottom", jQuery.sap.encodeHTML(aHeights[aHeights.length - 1] + "%"));
				oRm.addClass("sapSuiteILCShiftAbove");
			}
		} else {
			sTopLabelText = oControl._oRb.getText("INTERACTIVECHART_NA");
			oRm.addClass("sapSuiteILCShiftBelow");
			oRm.addClass("sapSuiteILCNaLabel");
		}
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");
		oRm.writeEscaped(sTopLabelText);
		oRm.write("</div>");

		return sBottomLabelText + ' ' + sTopLabelText;
	};

	/**
	 * Renders an additional disabling overlay.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the rendering buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @private
	 */
	InteractiveLineChartRenderer._renderDisabledOverlay = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapSuiteILCDisabledOverlay");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");
	};

	/**
	 * Creates the value of the aria-describedby accessibility attribute
	 *
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {int} pointsLength The amount of points
	 * @returns {string} A comma-separated list of all InteractionAreas' IDs
	 * @private
	 */
	InteractiveLineChartRenderer._getAriaDescribedBy = function(oControl, pointsLength) {
		var aAreaIds = [];
		for (var i = 0; i < pointsLength; i++) {
			aAreaIds.push(oControl.getId() + "-point-area-" + i);
		}
		return aAreaIds.join(",");
	};

	return InteractiveLineChartRenderer;

}, /* bExport */ true);
