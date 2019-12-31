/*
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */
jQuery.sap.declare("sap.suite.ui.commons.ProcessFlowRenderer");
jQuery.sap.require("sap.suite.ui.commons.ProcessFlowLaneHeader");

/**
 * @class ProcessFlow renderer.
 * @static
 */
sap.suite.ui.commons.ProcessFlowRenderer = {};

/* =========================================================== */
/* Rendering Handling                                         */
/* =========================================================== */

/**
 * Renders the HTML for the given control, using the provided
 * {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager}
 *            oRm the RenderManager that can be used for writing to the render
 *            output buffer
 * @param {sap.ui.core.Control}
 *            oControl an object representation of the control that should be
 *            rendered
 */
sap.suite.ui.commons.ProcessFlowRenderer.render = function (oRm, oControl) {
  var sStyleZoomLevelClass = this._getZoomStyleClass(oControl),
      mCalculatedMatrix,
      aLanePositionNodes,
      iLaneNumber,
      oProcessFlowRenderer = sap.suite.ui.commons.ProcessFlowRenderer,
      aConnectionsBetweenNodes,
      oClosedElement;

  oClosedElement = oProcessFlowRenderer._renderBasicStructure(oRm, oControl);
  if (oClosedElement) {
    return;
  }

  try {
    mCalculatedMatrix = oControl._getOrCreateProcessFlow();
    aLanePositionNodes = oControl._getOrCreateLaneMap();
    aConnectionsBetweenNodes = oControl._getConnectionsMap();
  } catch (exc) {
    oControl._handleException(exc);
    return;
  }

  oRm.write("<table");
  oRm.writeAttribute("id", oControl.getId() + "-table");
  //Write ARIA details
  oRm.writeAttribute("aria-label", oControl._getAriaText());
  oRm.addClass("sapSuiteUiCommonsPF");
  oRm.addClass(sStyleZoomLevelClass);
  oRm.writeClasses();
  oRm.write(">");

  iLaneNumber = Object.keys(aLanePositionNodes).length;
  oProcessFlowRenderer._renderTableHeader(oRm, oControl, aLanePositionNodes, iLaneNumber);
  oProcessFlowRenderer._renderTableBody(oRm, oControl, iLaneNumber, mCalculatedMatrix, aConnectionsBetweenNodes);

  oRm.write("</table>");
  oRm.write("</div>"); //Scroll content.
  oRm.write("</div>"); //Scroll container.
  this._writeCounter(oRm, oControl, "Right");
  oRm.renderControl(oControl._getScrollingArrow("right"));
  oRm.write("</div>"); //ProcessFlow container
};

/**
 * Renders a node header (not merged lane).
 *
 * @private
 * @param {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
 * @param {sap.suite.ui.commons.ProcessFlow} The current ProcessFlow
 * @param {sap.suite.ui.commons.ProcessFlowNode} The current ProcessFlowNode the header needs to be rendered for
 * @param {Number} The counter for lane number check
 * @param {Number} The current lane Number
 */
sap.suite.ui.commons.ProcessFlowRenderer._renderNormalNodeHeader = function (oRm, oControl, node, counterLaneNumber, laneNumber) {
  oRm.write("<th colspan=\"3\">");
  oRm.renderControl(node);
  oRm.write("</th>");
  if (counterLaneNumber < laneNumber - 1) {
    oRm.write("<th colspan=\"2\">");
    var oLaneHeaderSymbol = sap.suite.ui.commons.ProcessFlowLaneHeader.createNewProcessSymbol(oControl._isHeaderMode());
    //Forward the icon click events from the lane header items to the flow control.
    oLaneHeaderSymbol.attachPress(jQuery.proxy(oControl.ontouchend, oControl));
    oRm.renderControl(oLaneHeaderSymbol);
    oRm.write("</th>");
  }
};

/**
 * Renders a merged node header.
 *
 * @private
 * @param {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
 * @param {sap.suite.ui.commons.ProcessFlow} The current ProcessFlow
 * @param {sap.suite.ui.commons.ProcessFlowNode} The current merged ProcessFlowNode the header needs to be rendered for
 * @param {Number} The counter for lane number check
 * @param {sap.suite.ui.commons.ProcessFlowNodeState[]} Array containing relevant node states
 * @param {Boolean} Value which controls rendering of process symbol or not
 */
sap.suite.ui.commons.ProcessFlowRenderer._renderMergedNodeHeader = function (oRm, oControl, node, counterLaneNumber, laneNodeStates, renderProcessSymbol) {
  var aNodeStates = oControl._mergeLaneIdNodeStates(laneNodeStates);
  node.setState(aNodeStates);
  counterLaneNumber++;
  var nCollNumber = counterLaneNumber * 3 + (counterLaneNumber - 1) * 2;
  oRm.write("<th colspan=\"" + nCollNumber + "\">");
  oRm.renderControl(node);
  oRm.write("</th>");
  if (renderProcessSymbol) {
    oRm.write("<th colspan=\"2\">");
    var oLaneHeaderSymbol = sap.suite.ui.commons.ProcessFlowLaneHeader.createNewProcessSymbol(oControl._isHeaderMode());
    //Forward the icon click events from the lane header items to the flow control.
    oLaneHeaderSymbol.attachPress(jQuery.proxy(oControl.ontouchend, oControl));
    oRm.renderControl(oLaneHeaderSymbol);
    oRm.write("</th>");
  }
};

/**
 * Renders the node.
 *
 * @private
 * @param {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
 * @param {sap.suite.ui.commons.ProcessFlow} The current ProcessFlow
 * @param {sap.suite.ui.commons.ProcessFlowNode} The current ProcessFlowNode which needs to be rendered
 * @param {Boolean} Value which shows if TD tag is open or not
 * @returns {Boolean} Value which shows if TD tag is open or not
 */
sap.suite.ui.commons.ProcessFlowRenderer._renderNode = function (oRm, oControl, node, isTDTagOpen) {
  if (isTDTagOpen) {
    oRm.writeAttribute("tabindex", 0);
    oRm.writeAttributeEscaped("aria-label", node._getAriaText());
    oRm.write(">");
    isTDTagOpen = false;
  }
  node._setParentFlow(oControl);
  node._setZoomLevel(oControl.getZoomLevel());
  node._setFoldedCorner(oControl.getFoldedCorners());
  oRm.renderControl(node);
  return isTDTagOpen;
};

/**
 * Renders the connection.
 *
 * @private
 * @param {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
 * @param {sap.suite.ui.commons.ProcessFlow} The current ProcessFlow
 * @param {sap.suite.ui.commons.ProcessFlowConnection} The current ProcessFlowConnection which needs to be rendered
 * @param {Boolean} Value which shows if TD tag is open or not
 * @returns {Boolean} Value which shows if TD tag is open or not
 */
sap.suite.ui.commons.ProcessFlowRenderer._renderConnection = function (oRm, oControl, connection, isTDTagOpen) {
  if (isTDTagOpen) {
    if (connection.getAggregation("_labels") && connection.getAggregation("_labels").length > 0) {
      oRm.writeAttribute("tabindex", 0);
    }
    oRm.write(">");
    isTDTagOpen = false;
  }
  connection.setZoomLevel(oControl.getZoomLevel());
  oControl.addAggregation("_connections", connection);
  oRm.renderControl(connection);
  return isTDTagOpen;
};

/**
 * Renders the table header.
 *
 * @private
 * @param {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
 * @param {sap.suite.ui.commons.ProcessFlow} The current ProcessFlow
 * @param {sap.suite.ui.commons.ProcessFlowNode[]} Array containing the related nodes
 * @param {Number} The current lane number
 */
sap.suite.ui.commons.ProcessFlowRenderer._renderTableHeader = function (oRm, oControl, lanePositionNodes, laneNumber) {
  var iLanePosition,
      oNode = null,
      oNextNode = null,
      oLaneHeaderSymbol,
      bDrawProcessSymbol;

  oRm.write("<thead");
  oRm.writeAttribute("id", oControl.getId() + "-thead");
  oRm.write(">");

  oRm.write("<tr");
  oRm.addClass("sapSuiteUiCommonsPFHeader");
  oRm.addClass("sapSuiteUiCommonsPFHeaderHidden");
  if (oControl.getShowLabels()) {
    oRm.addClass("sapSuiteUiPFWithLabel");
  }
  oRm.writeClasses();
  oRm.write(">");

  //Reserves space width for start symbol.
  oRm.write("<th></th>");
  iLanePosition = 0;
  while (iLanePosition < laneNumber - 1) {
    //Reserves space width for other parts to be displayed.
    oRm.write("<th></th><th></th><th></th><th></th><th></th>");
    iLanePosition++;
  }

  //Space for the last node.
  oRm.write("<th></th><th></th><th></th>");

  //Reserves space width for end symbol.
  oRm.write("<th></th>");
  oRm.write("</tr>");

  oRm.write("<tr");
  oRm.addClass("sapSuiteUiCommonsPFHeaderRow");
  oRm.writeClasses();
  oRm.write(">");

  oRm.write("<th>");
  oLaneHeaderSymbol = sap.suite.ui.commons.ProcessFlowLaneHeader.createNewStartSymbol(oControl._isHeaderMode());
  oRm.renderControl(oLaneHeaderSymbol);
  oRm.write("</th>");

  iLanePosition = 0;
  var iArtificialNodesCount = 0;
  var aNodeStates = [];
  var sArtificialNodeSuffix = "1"; //Each following artificial node has one more '1' at the end.
  bDrawProcessSymbol = false;
  while (iLanePosition < (laneNumber - 1)) {
    oNode = lanePositionNodes[iLanePosition];
    oNextNode = lanePositionNodes[iLanePosition + 1];
    if (oNode.getLaneId() + sArtificialNodeSuffix === oNextNode.getLaneId()) {
      //Artificial node identified; increase the counter
      iArtificialNodesCount = iArtificialNodesCount + 1;
      aNodeStates.push(oNode.getState());
    } else {
      if (iArtificialNodesCount === 0) {
        this._renderNormalNodeHeader(oRm, oControl, oNode, iLanePosition, laneNumber);
      } else {
        aNodeStates.push(oNode.getState());
        bDrawProcessSymbol = true;
        this._renderMergedNodeHeader(oRm, oControl, oNode, iArtificialNodesCount, aNodeStates, bDrawProcessSymbol);
        aNodeStates = [];
        iArtificialNodesCount = 0;
      }
    }
    iLanePosition++;
  }
  if (iArtificialNodesCount === 0) {
    if (!oNextNode) {
      oNextNode = lanePositionNodes[0];
    }
    this._renderNormalNodeHeader(oRm, oControl, oNextNode, iLanePosition, laneNumber);
  } else {
    aNodeStates.push(oNextNode.getState());
    bDrawProcessSymbol = false;
    this._renderMergedNodeHeader(oRm, oControl, oNode, iArtificialNodesCount, aNodeStates, bDrawProcessSymbol);
    iArtificialNodesCount = 0;
  }
  oRm.write("<th>");
  oLaneHeaderSymbol = sap.suite.ui.commons.ProcessFlowLaneHeader.createNewEndSymbol(oControl._isHeaderMode());
  oRm.renderControl(oLaneHeaderSymbol);
  oRm.write("</th>");
  oRm.write("</tr>");
  oRm.write("</thead>");
};

/**
 * Renders the table body.
 *
 * @private
 * @param {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
 * @param {Number} The current lane number
 * @param {sap.suite.ui.commons.ProcessFlow[]} The calculated matrix
 * @param {Object} The array of available connectionMap Entries of ProcessFlow
 */
sap.suite.ui.commons.ProcessFlowRenderer._renderTableBody = function (oRm, oControl, laneNumber, calculatedMatrix, connectionsNodes) {
  var i,            //index for dimension1
      j,            //index for dimension2
      iMatrixDim1,  //matrix dimension1 length
      iMatrixDim2,  //matrix dimension2 length
      oNode;

  var bSelectedOrHighlightedWasFound = sap.suite.ui.commons.ProcessFlowRenderer._checkIfHighlightedOrSelectedNodesExists(connectionsNodes);

  //Starting the body, which means table (node and connection rendering).
  oRm.write("<tbody>");
  iMatrixDim1 = calculatedMatrix.length;
  //First empty line to make the space between the header and table (see also visual design document).
  if (iMatrixDim1 > 0) {
    oRm.write("<tr>");
    oRm.write("<td");
    oRm.writeAttribute("colspan", (laneNumber * 5).toString());
    oRm.write(">");
    oRm.write("</tr>");
  }
  i = 0;
  while (i < iMatrixDim1) {
    oRm.write("<tr>");
    oRm.write("<td></td>");

    iMatrixDim2 = calculatedMatrix[i].length;
    j = 0;

    while (j < iMatrixDim2 - 1) {
      oNode = calculatedMatrix[i][j];
      var isTDTagOpen = true; //Indicates if td element tag is open.
      if ((j == 0) || (j % 2)) {
        oRm.write("<td");
      } else {
        oRm.write("<td colspan=\"4\"");
        //Needed by Chrome (cr) in order to render the connections correctly on the
        //aggregated nodes.
        if (sap.ui.Device.browser.name === "cr") {
          oRm.addClass("sapSuiteUiCommonsProcessFlowZIndexForConnectors");
          oRm.writeClasses();
        }
      }
      if (oNode) {
        if (oNode instanceof sap.suite.ui.commons.ProcessFlowNode) {
          isTDTagOpen = sap.suite.ui.commons.ProcessFlowRenderer._renderNode(oRm, oControl, oNode, isTDTagOpen);
        } else {
          oNode._setShowLabels(oControl.getShowLabels());
          sap.suite.ui.commons.ProcessFlowRenderer._setLabelsInConnection(calculatedMatrix, connectionsNodes, oNode, { row: i, column: j }, oControl, bSelectedOrHighlightedWasFound);
          isTDTagOpen = sap.suite.ui.commons.ProcessFlowRenderer._renderConnection(oRm, oControl, oNode, isTDTagOpen);
        }
      }
      if (isTDTagOpen) {
        oRm.write(">");
      }
      oRm.write("</td>");
      j++;
    }

    //The last space after a node + space under the end symbol.
    oRm.write("<td></td>");
    oRm.write("<td></td>");
    oRm.write("</tr>");
    i++;
  }

  oRm.write("</tbody>");
};

/**
 * Renders the basic structure.
 *
 * @private
 * @param {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
 * @param {sap.suite.ui.commons.ProcessFlow} The current ProcessFlow
 * @returns {Boolean} Value which shows if controls have been closed or not
 */
sap.suite.ui.commons.ProcessFlowRenderer._renderBasicStructure = function (oRm, oControl) {
  //Write the HTML into the render manager.
  oRm.write("<div"); // ProcessFlow container
  oRm.writeAttribute("aria-label", "process flow");
  oRm.writeControlData(oControl);
  oRm.addClass("sapSuiteUiPFContainer");
  if (oControl._arrowScrollable) {
    oRm.addClass("sapPFHScrollable");
    if (oControl._bPreviousScrollForward) {
      oRm.addClass("sapPFHScrollForward");
    } else {
      oRm.addClass("sapPFHNoScrollForward");
    }
    if (oControl._bPreviousScrollBack) {
      oRm.addClass("sapPFHScrollBack");
    } else {
      oRm.addClass("sapPFHNoScrollBack");
    }
  } else {
    oRm.addClass("sapPFHNotScrollable");
  }
  oRm.writeClasses();
  oRm.write(">");

  this._writeCounter(oRm, oControl, "Left");
  oRm.renderControl(oControl._getScrollingArrow("left"));

  oRm.write("<div"); //Scroll container.
  oRm.writeAttribute("id", oControl.getId() + "-scrollContainer");
  oRm.addClass("sapSuiteUiScrollContainerPF");
  oRm.addClass("sapSuiteUiDefaultCursorPF");
  oRm.writeClasses();
  oRm.write(">");

  oRm.write("<div"); //Scroll content.
  oRm.writeAttribute("id", oControl.getId() + "-scroll-content");
  oRm.writeAttribute("tabindex", 0);
  oRm.write(">");

  //Nothing to render if there are no lanes.
  if (!oControl.getLanes() || oControl.getLanes().length == 0) {
    oRm.write("</div>"); //Scroll content.
    oRm.write("</div>"); //Scroll container.
    oRm.write("</div>"); //Whole control.
    return true;
  }
  return false;
};

/* =========================================================== */
/* Helper methods                                              */
/* =========================================================== */

/**
 * Returns the style class for selected zoom level.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlow} The current ProcessFlow
 * @returns {String} Style class for zoom level
 */
sap.suite.ui.commons.ProcessFlowRenderer._getZoomStyleClass = function (oControl) {
  switch (oControl.getZoomLevel()) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      return "sapSuiteUiCommonsPFZoomLevel1";
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Two:
      return "sapSuiteUiCommonsPFZoomLevel2";
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      return "sapSuiteUiCommonsPFZoomLevel3";
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      return "sapSuiteUiCommonsPFZoomLevel4";
  }
};

/**
 * Sets the labels to the current connections based on the calculated Matrix and the connectionsMap.
 * This is required since connections are created dynamically by the control but they can be configured by the children
 * array in the ProcessFlowNode.
 *
 * @private
 * @param {Object} The calculated matrix of the current ProcessFlow
 * @param {Object[]} The array of available connectionMap Entries of ProcessFlow
 * @param {sap.suite.ui.commons.ProcessFlowConnection} Current connection object the labels will be added to
 * @param {Object} Position of current connection object in calculated matrix
 * @param {sap.suite.ui.commons.ProcessFlow} ProcessFlow to render, used for event handling
 */
sap.suite.ui.commons.ProcessFlowRenderer._setLabelsInConnection = function (calculatedMatrix, connectionsBetweenNodes, connection, positionOfConnection, oControl, selectedOrHighlightedWasFound) {
  //Iterate over connection maps
  for (var i = 0; i < connectionsBetweenNodes.length; i++) {
    var oConnectionEntry = connectionsBetweenNodes[i];
    if (oConnectionEntry && oConnectionEntry.label) {
      //Iterates over connectionParts
      for (var j = 0; j < oConnectionEntry.connectionParts.length; j++) {
        var connectionPart = oConnectionEntry.connectionParts[j];
        //Selects the connection part to render from the current oConnectionEntry
        if (connectionPart.x === positionOfConnection.column &&
            connectionPart.y === positionOfConnection.row) {
          //Next node (right) is target node of current oConnectionEntry --> Means last connectionPart in the current connection and correct position for label.
          if (calculatedMatrix[positionOfConnection.row][positionOfConnection.column + 1] instanceof sap.suite.ui.commons.ProcessFlowNode &&
              calculatedMatrix[positionOfConnection.row][positionOfConnection.column + 1].getNodeId() === oConnectionEntry.targetNode.getNodeId()) {
            sap.suite.ui.commons.ProcessFlowRenderer._setLineTypeInLabel(oConnectionEntry, selectedOrHighlightedWasFound);
            if (oConnectionEntry.label.getEnabled()) {
              if (oConnectionEntry.label.hasListeners("press")) {
                oConnectionEntry.label.detachEvent("press", oControl._handleLabelClick, oControl);
              }
              oConnectionEntry.label.attachPress(oControl._handleLabelClick, oControl);
            }
            connection.addAggregation("_labels", oConnectionEntry.label, true);
          }
        }
      }
    }
  }
};

/**
 * Sets the selected and highlighted information on Label.
 *
 * @private
 * @param {Object[]} The array of available connectionMap Entries of ProcessFlow
 * @returns void
 */
sap.suite.ui.commons.ProcessFlowRenderer._setLineTypeInLabel = function (connectionEntries, selectedOrHighlightedWasFound) {
  var bCurrentLabelIsSelected = false;
  var bCurrentLabelIsHighlighted = false;
  if (connectionEntries.sourceNode.getSelected() && connectionEntries.targetNode.getSelected()) {
    bCurrentLabelIsSelected = true;
    connectionEntries.label._setSelected(true);
  } else {
    connectionEntries.label._setSelected(false);
  }
  if (connectionEntries.sourceNode.getHighlighted() && connectionEntries.targetNode.getHighlighted()) {
    bCurrentLabelIsHighlighted = true;
    connectionEntries.label._setHighlighted(true);
  } else {
    connectionEntries.label._setHighlighted(false);
  }
  if (selectedOrHighlightedWasFound && !bCurrentLabelIsSelected && !bCurrentLabelIsHighlighted) {
    connectionEntries.label._setDimmed(true);
  } else {
    connectionEntries.label._setDimmed(false);
  }
};

/**
 * Checks if a selected or a highlighted node exists in the current process flow.
 *
 * @private
 * @param {Object[]} The array of available connectionMap Entries of ProcessFlow
 * @returns {Boolean} true if a highlighted or a selected node was found, false if no highlighted or selected node was found
 */
sap.suite.ui.commons.ProcessFlowRenderer._checkIfHighlightedOrSelectedNodesExists = function(connectionsBetweenNodes) {
  var bSelectedOrHighlightedWasFound = false;
  for (var i = 0; i < connectionsBetweenNodes.length; i++) {
    var oConnectionMapEntry = connectionsBetweenNodes[i];
    if (oConnectionMapEntry.label) {
      if (oConnectionMapEntry.sourceNode.getSelected() && oConnectionMapEntry.targetNode.getSelected() ||
          oConnectionMapEntry.sourceNode.getHighlighted() && oConnectionMapEntry.targetNode.getHighlighted()) {
        bSelectedOrHighlightedWasFound = true;
      }
    }
  }
  return bSelectedOrHighlightedWasFound;
};

/**
 * Writes the counter.
 *
 * @private
 * @param {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
 * @param {sap.suite.ui.commons.ProcessFlow} The current ProcessFlow
 * @param {String} Contains the direction (e.g. Left/Right)
 */
sap.suite.ui.commons.ProcessFlowRenderer._writeCounter = function (oRm, oControl, direction) {
  oRm.write("<span");
  oRm.writeAttribute("id", oControl.getId() + "-counter" + direction);
  oRm.addClass("suiteUiPFHCounter");
  oRm.addClass("suiteUiPFHCounter" + direction);
  oRm.writeClasses();
  oRm.write(">");
  oRm.writeEscaped("0");
  oRm.write("</span>");
};