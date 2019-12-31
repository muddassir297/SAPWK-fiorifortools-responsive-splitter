/*
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */
jQuery.sap.declare("sap.suite.ui.commons.ProcessFlowNodeRenderer");

/**
 * @class ProcessFlowNode renderer.
 * @static
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer = {
};

/**
 * ProcessFlowNodeRenderer constants
 *
 * @static
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer._constants = {
    top:    "top",
    right:  "right",
    bottom: "bottom",
    left:   "left",
    corner: "corner"
};

/**
 * ProcessFlowNodeRenderer node levels
 *
 * @static
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels = {
    iLevel0: 0,
    iLevel1: 1,
    iLevel2: 2,
    iLevel3: 3
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer.render = function (oRm, oControl) { // EXC_SAP_006_1, EXC_JSHINT_046
  var oFoldedCornerControl = null;

  if (oControl._getFoldedCorner()) {
    oFoldedCornerControl = oControl._getFoldedCornerControl();
  }
  var oHeaderControl = oControl._getHeaderControl();
  var oIconControl = oControl._getIconControl();
  var oStateControl = oControl._getStateTextControl();
  var oText1Control = oControl._createText1Control();
  var oText2Control = oControl._createText2Control();

  /*
   In order to be able to display folded corner we have add another four div containers -
    - node1-node4
   node0 - base container contains all subparts
   node1 - corner container contains folded corner
   node2 - top container
   node3 - node components
  */
  // node0
  oRm.write("<div");
  oRm.writeControlData(oControl);
  sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeClasses(oRm, oControl, 0);

  oRm.write(">");
  switch (oControl._getDisplayState()) {
    case sap.suite.ui.commons.ProcessFlowDisplayState.Highlighted:
    case sap.suite.ui.commons.ProcessFlowDisplayState.HighlightedFocused:
    case sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlighted:
    case sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlightedFocused:
      //border-top shadowing
      oRm.write("<div");
      sap.suite.ui.commons.ProcessFlowNodeRenderer._assignShadowClasses(oRm, oControl, "top");
      oRm.write("></div>");

      //border-right shadowing
      oRm.write("<div");
      sap.suite.ui.commons.ProcessFlowNodeRenderer._assignShadowClasses(oRm, oControl, "right");
      oRm.write("></div>");

      //border-bottom shadowing
      oRm.write("<div");
      sap.suite.ui.commons.ProcessFlowNodeRenderer._assignShadowClasses(oRm, oControl, "bottom");
      oRm.write("></div>");

      //border-left shadowing
      oRm.write("<div");
      sap.suite.ui.commons.ProcessFlowNodeRenderer._assignShadowClasses(oRm, oControl, "left");
      oRm.write("></div>");

      if (oControl._getFoldedCorner()) {
        //folded corner shadowing
        oRm.write("<div");
        sap.suite.ui.commons.ProcessFlowNodeRenderer._assignShadowClasses(oRm, oControl, "corner");
        oRm.write("></div>");
      }
      break;
  }
  // node1
  oRm.write("<div");
  sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeClasses(oRm, oControl, 1);
  oRm.write(">");
  if (oControl._getFoldedCorner()) {
    oRm.renderControl(oFoldedCornerControl);
  }
  oRm.write("</div>");
  // node2
  oRm.write("<div");
  sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeClasses(oRm, oControl, 2);
  oRm.write(">");
  oRm.write("</div>");
  // node3
  oRm.write("<div");
  sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeClasses(oRm, oControl, 3);
  oRm.write(">");
  // node3 contents (actual node contents - title, state, texts)
  // title
  oRm.write("<div");
  sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeTitleClasses(oRm, oControl);
  oRm.write(">");
  oRm.renderControl(oHeaderControl);
  oRm.write("</div>");
  // state area
  oRm.write("<div");
  sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeStateClasses(oRm, oControl);
  oRm.write(">");
  // state icon
  oRm.write("<div");
  sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeIconClasses(oRm, oControl);
  oRm.write(">");
  oRm.renderControl(oIconControl);
  oRm.write("</div>");
  // state text
  oRm.write("<div");
  sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeStateTextClasses(oRm, oControl);
  oRm.write(">");
  oRm.renderControl(oStateControl);
  oRm.write("</div>");
  oRm.write("</div>");
  // end of state
  // text1
  oRm.write("<div");
  sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeText1Classes(oRm, oControl);
  oRm.write(">");
  oRm.renderControl(oText1Control);
  oRm.write("</div>");
  // text2
  oRm.write("<div");
  sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeText2Classes(oRm, oControl);
  oRm.write(">"); // div element for text2
  oRm.renderControl(oText2Control);
  oRm.write("</div>");
  oRm.write("</div>"); // end of node3
  oRm.write("</div>"); // end of node0
};

/* =========================================================== */
/* Helper methods                                              */
/* =========================================================== */

/*
 * Navigation focus is used for the keyboard support
 *
 * business focus comes from outside and just make different visual representation (blue rectangle around). The focus
 * is in the styles represents with the word selected (timing and historical reasons)
 */

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 * @param {integer} nodeLevel of the node (0 - parent node, 1 - upper left (folded corner icon), 2 - top part of the node, 3 - bottom part of the node
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeClasses = function (oRm, oControl, nodeLevel) { // EXC_SAP_006_1, EXC_JSHINT_047
  switch (nodeLevel) {
    case sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel0:
      //oRm.writeAttribute("id", oControl.getId() + "-base-container");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel1:
      oRm.writeAttribute("id", oControl.getId() + "-corner-container");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel2:
      oRm.writeAttribute("id", oControl.getId() + "-top-container");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel3:
      oRm.writeAttribute("id", oControl.getId() + "-content-container");
      break;
  }
  if (nodeLevel > sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel0) {
    // Planned
    switch (oControl.getState()) {
      case sap.suite.ui.commons.ProcessFlowNodeState.Planned:
        if ((nodeLevel === sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner())) {
          oRm.addClass("sapSuiteUiCommonsProcessFlowFoldedCornerPlanned");
        }
        else {
          oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStatePlanned");
          oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStatePlannedDashedBorder");
        }
        break;
      case sap.suite.ui.commons.ProcessFlowNodeState.PlannedNegative:
        if ((nodeLevel === sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner())) {
          oRm.addClass("sapSuiteUiCommonsProcessFlowFoldedCornerPlanned");
        }
        else {
          oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStatePlanned");
          oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStatePlannedDashedBorder");
        }
        break;
    }
    if (oControl._getNavigationFocus()) {
      oRm.addClass("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateNavigation");
    }
    // Display state: Focused
    switch (oControl._getDisplayState()) {
      case sap.suite.ui.commons.ProcessFlowDisplayState.RegularFocused:
      case sap.suite.ui.commons.ProcessFlowDisplayState.HighlightedFocused:
      case sap.suite.ui.commons.ProcessFlowDisplayState.DimmedFocused:
      case sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlightedFocused:
      case sap.suite.ui.commons.ProcessFlowDisplayState.SelectedFocused:
        if ((nodeLevel === sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner())) {
          oRm.addClass("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateFocused");
        }
        else {
          oRm.addClass("sapSuiteUiCommonsProcessFlowNodeDisplayStateFocused");
        }
        break;
    }
    // Display state: Regular, Highlighted, Dimmed
    switch (oControl._getDisplayState()) {
      case sap.suite.ui.commons.ProcessFlowDisplayState.Regular:
      case sap.suite.ui.commons.ProcessFlowDisplayState.RegularFocused:
      case sap.suite.ui.commons.ProcessFlowDisplayState.Selected:
        if ((nodeLevel === sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner())) {
          oRm.addClass("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateRegular");
        }
        else {
          oRm.addClass("sapSuiteUiCommonsProcessFlowNodeDisplayStateRegular");
        }
        break;
      case sap.suite.ui.commons.ProcessFlowDisplayState.Highlighted:
      case sap.suite.ui.commons.ProcessFlowDisplayState.HighlightedFocused:
      case sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlighted:
      case sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlightedFocused:
        if ((nodeLevel === sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner())) {
          oRm.addClass("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateHighlighted");
        }
        else {
          oRm.addClass("sapSuiteUiCommonsProcessFlowNodeDisplayStateHighlighted");
        }
        break;
      case sap.suite.ui.commons.ProcessFlowDisplayState.Dimmed:
      case sap.suite.ui.commons.ProcessFlowDisplayState.DimmedFocused:
        if ((nodeLevel === sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner())) {
          oRm.addClass("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateDimmed");
        }
        else {
          oRm.addClass("sapSuiteUiCommonsProcessFlowNodeDisplayStateDimmed");
        }
        break;
    }
  }
  if (nodeLevel === sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel0) {
    if (oControl._getNavigationFocus()) {
      oRm.addClass("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateNavigation");
    }
    if (oControl._getDisplayState() == sap.suite.ui.commons.ProcessFlowDisplayState.Highlighted) {
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeDisplayStateHighlighted");
    }
    if (oControl.getType() === sap.suite.ui.commons.ProcessFlowNodeType.Aggregated) {
      sap.suite.ui.commons.ProcessFlowNodeRenderer._assignAggregatedNodeClasses(oRm, oControl);
    }
  }
  switch (oControl._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode" + nodeLevel + "ZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode" + nodeLevel + "ZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode" + nodeLevel + "ZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode" + nodeLevel + "ZoomLevel4");
      break;
  }
  if (nodeLevel === sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel1) {
    if (oControl._getFoldedCorner()) {
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode1FoldedBorderStyle");
    } else {
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode1BorderStyle");
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeBorderStandard");
    }
  } else if (nodeLevel > sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel1) {
    oRm.addClass("sapSuiteUiCommonsProcessFlowNode" + nodeLevel + "BorderStyle");
    oRm.addClass("sapSuiteUiCommonsProcessFlowNodeBorderStandard");
  }

  if (((nodeLevel === sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner()))) {
    oRm.addClass("sapSuiteUiCommonsProcessFlowFoldedCornerNode1");
  }
  else {
    oRm.addClass("sapSuiteUiCommonsProcessFlowNode" + nodeLevel);
  }
  if (((nodeLevel === sap.suite.ui.commons.ProcessFlowNodeRenderer._nodeLevels.iLevel0) && (oControl._getFoldedCorner()))) {
    oRm.addClass("sapSuiteUiCommonsProcessFlowFoldedCornerIndication");
  }

  oRm.writeClasses();
};

/**
 * Renders the HTML shadow borders for the given aggregated node, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer._assignAggregatedNodeClasses = function (oRm, oControl) {
  switch (oControl._getDisplayState()) {
    // Highlighted and regular states uses the same color
    case sap.suite.ui.commons.ProcessFlowDisplayState.Highlighted:
    case sap.suite.ui.commons.ProcessFlowDisplayState.Regular:
    case sap.suite.ui.commons.ProcessFlowDisplayState.Selected:
      if (oControl._getZoomLevel() == sap.suite.ui.commons.ProcessFlowZoomLevel.Four) {
        oRm.addClass("sapSuiteUiCommonsProcessFlowNodeAggregatedZoomLevel4");
      } else {
        oRm.addClass("sapSuiteUiCommonsProcessFlowNodeAggregated");
      }
      break;
      // Dimmed state uses a lighter color
    case sap.suite.ui.commons.ProcessFlowDisplayState.Dimmed:
      if (oControl._getZoomLevel() == sap.suite.ui.commons.ProcessFlowZoomLevel.Four) {
        oRm.addClass("sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedZoomLevel4");
      } else {
        oRm.addClass("sapSuiteUiCommonsProcessFlowNodeAggregatedDimmed");
      }
      break;
      // The other possible states are focused states
    default:
      if (oControl._getZoomLevel() == sap.suite.ui.commons.ProcessFlowZoomLevel.Four) {
        oRm.addClass("sapSuiteUiCommonsProcessFlowNodeAggregatedFocusedZoomLevel4");
      } else {
        oRm.addClass("sapSuiteUiCommonsProcessFlowNodeAggregatedFocused");
      }
      break;
  }
};

/**
 * Renders the HTML shadow borders for the given highlighted node, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 * @param {string} border type: "top", "bottom", "left", "right"
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer._assignShadowClasses = function (oRm, oControl, border) {
  oRm.addClass("shadowedDivCommon");
  switch (border) {
    case sap.suite.ui.commons.ProcessFlowNodeRenderer._constants.top:
      if (oControl._getFoldedCorner()) {
        oRm.addClass("shadowedDivFoldedCornerBorderTop");
      }
      else {
        oRm.addClass("shadowedDivBorderTop");
      }
      break;
    case sap.suite.ui.commons.ProcessFlowNodeRenderer._constants.right:
      oRm.addClass("shadowedDivBorderRight");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeRenderer._constants.bottom:
      oRm.addClass("shadowedDivBorderBottom");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeRenderer._constants.left:
      if (oControl._getFoldedCorner()) {
        oRm.addClass("shadowedDivFoldedCornerBorderLeft");
      }
      else {
        oRm.addClass("shadowedDivBorderLeft");
      }
      break;
    case sap.suite.ui.commons.ProcessFlowNodeRenderer._constants.corner:
      if (sap.ui.Device.browser.safari) {
        oRm.addClass("shadowedDivFoldedCornerSafari");
      }
      else {
        oRm.addClass("shadowedDivFoldedCorner");
      }
      break;
  }

  oRm.writeClasses();
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeTitleClasses = function (oRm, oControl) {
  oRm.writeAttribute("id", oControl.getId() + "-title");

  switch (oControl._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel4");
      break;
  }
  oRm.addClass("sapSuiteUiCommonsProcessFlowNode3Title");
  oRm.writeClasses();
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeStateClasses = function (oRm, oControl) {
  oRm.writeAttribute("id", oControl.getId() + "-state");

  switch (oControl._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateZoomLevel4");
      break;
  }
  oRm.addClass("sapSuiteUiCommonsProcessFlowNode3State");
  oRm.writeClasses();
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeIconClasses = function (oRm, oControl) {
  oRm.writeAttribute("id", oControl.getId() + "-icon-container");

  switch (oControl.getState()) {
    case sap.suite.ui.commons.ProcessFlowNodeState.Positive:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStatePositive");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Negative:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStateNegative");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Planned:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStatePlanned");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Neutral:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStateNeutral");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.PlannedNegative:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStateNegative");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Critical:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStateCritical");
      break;
  }
  switch (oControl._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel4");
      break;
  }
  oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateIcon");
  oRm.writeClasses();
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeStateTextClasses = function (oRm, oControl) {
  oRm.writeAttribute("id", oControl.getId() + "-state-text");

  switch (oControl.getState()) {
    case sap.suite.ui.commons.ProcessFlowNodeState.Positive:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStatePositive");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Negative:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStateNegative");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Planned:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStatePlanned");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Neutral:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStateNeutral");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.PlannedNegative:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStateNegative");
      break;
    case sap.suite.ui.commons.ProcessFlowNodeState.Critical:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNodeStateCritical");
      break;
  }
  switch (oControl._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel4");
      break;
  }
  oRm.addClass("sapSuiteUiCommonsProcessFlowNode3StateText");
  oRm.writeClasses();
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeText1Classes = function (oRm, oControl) {
  oRm.writeAttribute("id", oControl.getId() + "-text1");

  switch (oControl._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TextWithGapZoomLevel1");
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TextWithGapZoomLevel2");
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel4");
      break;
  }
  oRm.addClass("sapSuiteUiCommonsProcessFlowNode3Text");
  oRm.writeClasses();
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.suite.ui.commons.ProcessFlowNodeRenderer._assignNodeText2Classes = function (oRm, oControl) {
  oRm.writeAttribute("id", oControl.getId() + "-text2");

  switch (oControl._getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel1");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel2");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel3");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel4");
      break;
  }
  oRm.addClass("sapSuiteUiCommonsProcessFlowNode3Text");
  oRm.writeClasses();
};