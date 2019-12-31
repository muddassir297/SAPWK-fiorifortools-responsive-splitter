/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides class sap.gantt.ShapeSelectionModel
sap.ui.define(["jquery.sap.global", "sap/ui/base/ManagedObject", "sap/gantt/misc/Utility"],
	function(jQuery, ManagedObject, Utility) {
	"use strict";

	/**
	 * Constructs an instance of a sap.gantt.ShapeSelectionModel.
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version {version}
	 *
	 * @param {string} sSelectionMode <code>sap.gantt.SelectionMode.MultiWithKeyboard</code> or
	 * <code>sap.gantt.SelectionMode.Multiple</code> or <code>sap.gantt.SelectionMode.Single</code>
	 * or <code>sap.gantt.SelectionMode.None</code>
	 *
	 * @constructor
	 * @private
	 * @alias sap.gantt.ShapeSelectionModel
	 */
	var ShapeSelectionModel = ManagedObject.extend("sap.gantt.ShapeSelectionModel", /** @lends sap.gantt.ShapeSelectionModel.prototype */ {

		constructor : function(sId, mSettings) {
			ManagedObject.apply(this, arguments);

			this.aSelectedRelationships = [];

			this.mSelectedShapes = {
				"uid": [],
				"shapes": []
			};
		},
		metadata: {
			properties: {
				"selectionMode": {
					type: "sap.gantt.SelectionMode",
					defaultValue: sap.gantt.SelectionMode.MultiWithKeyboard
				}
			},
			associations: {
				/**
				 * The target gantt chart.
				 */
				"ganttChart": {
					type: "sap.gantt.GanttChart",
					multiple: false
				}
			}
		}
	});

	ShapeSelectionModel.prototype.clearAllSelections = function() {
		var bChanged = this.clearShapeSelection();
		var bRlsChanged = this.clearRelationshipSelection();
		return bChanged && bRlsChanged;
	};

	/**
	 * Clear shape selection.
	 *
	 * @return {boolean} true if shape selection changed.
	 */
	ShapeSelectionModel.prototype.clearShapeSelection = function() {
		if (this.mSelectedShapes.uid.length === 0) {
			return false;
		}
		this.mSelectedShapes.uid = [];
//		this.mSelectedShapes.shapes = [];
		return true;
	};

	/**
	 * Clear relationship selection.
	 *
	 * @return {boolean} true if shape selection changed.
	 */
	ShapeSelectionModel.prototype.clearRelationshipSelection = function() {
		if (this.aSelectedRelationships.length === 0) {
			return false;
		}
		this.aSelectedRelationships = [];
		return true;
	};

	/**
	 * Get all selected shapes in Row.
	 *
	 * @return {array} return an array of selected shape datum
	 */
	ShapeSelectionModel.prototype.getSelectedShapeDatum = function() {
		var aDatum = [];
		var iLength = this.mSelectedShapes.uid.length;
		for(var i = 0; i < iLength; i++) {
			var sUid = this.mSelectedShapes.uid[i];
			var oDatum = this.getShapeDatumByShapeUid(sUid);
			if (oDatum) {
				aDatum.push(oDatum);
			}
		}
		return aDatum;
	};

	/**
	 * Get All selected relationships.
	 *
	 * @return {array} an list of selected relationship
	 */
	ShapeSelectionModel.prototype.getSelectedRelationships = function() {
		return this.aSelectedRelationships;
	};

	/**
	 * Check if the shape is selected
	 *
	 * @param {string} sShapeUid Shape UID
	 * @return {boolean} true if shape is selected, otherwise false returned
	 */
	ShapeSelectionModel.prototype.isShapeSelected = function(sShapeUid) {
		return jQuery.inArray(sShapeUid, this.mSelectedShapes.uid) === -1 ? false : true;
	};

	/**
	 * Check whether a relationship is selected or not.
	 *
	 * @param {string} sUid shape UID
	 * @return {boolean} true selected false: unselected
	 */
	ShapeSelectionModel.prototype.isRelationshipSelected = function(sUid) {
		return this.aSelectedRelationships.some(function(oShape){
			return oShape.uid === sUid;
		});
	};

	/**
	 * @private
	 */
	ShapeSelectionModel.prototype.isSelectedShapeVisible = function(sShapeUid, sContainer) {
		var sShapeId = Utility.getIdByUid(sShapeUid);
		// same shape might displayed in different gantt chart
		var aDatum = Utility.getShapeDatumById(sShapeId, sContainer);
		return aDatum.some(function(oItem){
			return oItem.uid === sShapeUid;
		});
	};

	/**
	 * Check if shapeSelectionChange and relationshipSelectionChange happen
	 *
	 * @param {object} oShapeData the shape you want to select
	 * @param {object} oRowInfo the original event, e.g. mouseup
	 * @param {boolean} bCtrl if ctrl key pressed in the original event, e.g. mouseup
	 * @param {boolean} bDragging if user is dragging the shape
	 * @return {object} {shapeSelectionChange, relationshipSelectionChange} return
	 * shapeSelectionChange=true when select shape selection changed,
	 * relationshipSelectionChange=true when relationship selection changed
	 */
	ShapeSelectionModel.prototype.changeShapeSelection = function (oShapeData, oRowInfo, bCtrl, bDragging) {
		/*
		 * Click on Shapes:	Clear any existing selection of all shape and select current shape.
		 * Click on Shapes + control key:	Keep existing selection of all shapes and change selection of current shape.	Keep all rows selection. Keep all relationship selection
		 * above 2 same for the relationships
		 * Old: Click on Shape + shift key = Click on Shape
		 */
		var bShapeSelectionChange,
			bRelationshipSelectionChange;

		// shouldn't do anything if selection mode is None
		if (this.getSelectionMode() === sap.gantt.SelectionMode.None) {
			return {
				shapeSelectionChange: false,
				relationshipSelectionChange: false
			};
		}

		//check is the current shape a relationship
		var isRelationship = (Utility.getShapeDataNameByUid(oShapeData.uid) === sap.gantt.shape.ShapeCategory.Relationship);

		var bMultiSelection = (bCtrl && this.getSelectionMode() === sap.gantt.SelectionMode.MultiWithKeyboard) || this.getSelectionMode() === sap.gantt.SelectionMode.Multiple;
		/*
		 * when ctrl key is pressed or in Fiori multiple selection mode, clicking on an selected shape should be de-selection
		 */
		if (bMultiSelection) {
			// multiple selection scenario
			if (isRelationship) {
				if (this.isRelationshipSelected(oShapeData.uid)){
					bRelationshipSelectionChange = this.deselectRelationship(oShapeData.uid);
				} else {
					bRelationshipSelectionChange = this.selectRelationship(oShapeData);
				}
			} else {
				//if the shape is already in selectedShapes, deselect it, otherwise select it
				if (this.isShapeSelected(oShapeData.uid)){
					bShapeSelectionChange = this.deselectShape(oShapeData.uid);
				} else {
					bShapeSelectionChange = this.selectByShapeData(oShapeData);
				}
			}
		} else {
			// non-multiple selection
			if (isRelationship) {
				/*
				 * clicking a relationship without control key,
				 * if the relationship was unselected, clear existing shape/relationship selection and select current relationship
				 */
				if (!this.isRelationshipSelected(oShapeData.uid)) {
					bRelationshipSelectionChange = this.clearRelationshipSelection();
					bShapeSelectionChange = this.clearShapeSelection();
					bRelationshipSelectionChange = this.selectRelationship(oShapeData) ? true : bRelationshipSelectionChange;
				}
			} else {
				/* clicking a shape, without control key
				 * if the shape was unselected, clear existing shape/relationship selection and select current shape
				 */
				if (!this.isShapeSelected(oShapeData.uid)) {
					bRelationshipSelectionChange = this.clearRelationshipSelection();
					bShapeSelectionChange = this.clearShapeSelection();
					bShapeSelectionChange = this.selectByShapeData(oShapeData) ? true : bShapeSelectionChange;
				}
			}
		}
		return {
			shapeSelectionChange: bShapeSelectionChange,
			relationshipSelectionChange: bRelationshipSelectionChange
		};
	};

	/**
	 * Select a single shape
	 *
	 * @param {object} oShapeData the binded shape data you want to select
	 * @return {boolean} return true when select a shape successfully
	 */
	ShapeSelectionModel.prototype.selectByShapeData = function (oShapeData) {
		if (!oShapeData || this.isShapeSelected(oShapeData.uid)) {
			return false;
		}

		this.mSelectedShapes.uid.push(oShapeData.uid);
//		this.mSelectedShapes.shapes.push(oShapeData);

		return true;
	};

	ShapeSelectionModel.prototype.selectShapeByUid = function (aUid) {
		var bRetVal;
		if (aUid && aUid.length > 0) {
			for (var i = 0; i < aUid.length; i++) {
				bRetVal = bRetVal || this.selectByShapeData(this.getShapeDatumByShapeUid(aUid[i]));
			}
		}
		return bRetVal;
	};

	/**
	 * de-select a single shape by it's uid
	 *
	 * @param {object} sShapeUid the shape you want to deselect
	 * @return {boolean} return true when deselect a shape successfully
	 */
	ShapeSelectionModel.prototype.deselectShape = function (sShapeUid) {
		var iIndex = jQuery.inArray(sShapeUid, this.mSelectedShapes.uid);
		if (iIndex >= 0) {
			this.mSelectedShapes.uid.splice(iIndex, 1);
//			this.mSelectedShapes.shapes.splice(iIndex, 1);
		} else {
			return false;
		}

		return true;
	};

	/**
	 * Select multiple shapes by their binded shape data
	 *
	 * @param {array} [aShapes] a list of shapes data
	 * @param {boolean} bExclusive if need to clear other existing selection of shapes
	 * @return {boolean} return true when select shapes successfully
	 */
	ShapeSelectionModel.prototype.selectShapes = function(aShapes, bExclusive) {

		if (!aShapes || aShapes.length === 0) {
			return this.clearShapeSelection();
		}
		var bUpdated;
		if (bExclusive) {
			bUpdated = this.clearShapeSelection();
		}

		for (var j = 0; j < aShapes.length; j++) {
			bUpdated = this.selectByShapeData(aShapes[j]) ? true : bUpdated;
		}
		return bUpdated;
	};

	/**
	 * Deselect shapes accordingly to shape IDs
	 *
	 * @param {array} [aIds] List ID of the shapes
	 * @return {boolean} true when shape selection changed
	 */
	ShapeSelectionModel.prototype.deselectShapes = function(aIds) {
		if (!aIds || aIds.length === 0) {
			return this.clearShapeSelection();
		}
		var bUpdated;

		var aShapeDatum = this.getSelectedShapeDatum();
		for (var i = 0; i < aShapeDatum.length; i++){
			var oShapeData = aShapeDatum[i];
			if (jQuery.inArray(oShapeData.id, aIds) >= 0) {
				bUpdated = this.deselectShape(oShapeData.uid) ? true : bUpdated;
			}
		}

		return bUpdated;
	};

	/**
	 * Select a single relationship shape
	 *
	 * @param {object} oRelationship relationship data
	 * @return {boolean} true if relationship selection changed
	 */
	ShapeSelectionModel.prototype.selectRelationship = function(oRelationship) {
		if (this.isRelationshipSelected(oRelationship.uid)) {
			return false;
		}
		this.aSelectedRelationships.push(oRelationship);
		return true;
	};

	/**
	 * De-select a relationship by it's uid
	 *
	 * @private
	 * @param {string} sRelationshipUid uid of the relationship to be selected
	 * @return {boolean} true if relationship selection changed
	 */
	ShapeSelectionModel.prototype.deselectRelationship = function(sRelationshipUid) {
		var that = this;
		var bUpdated = jQuery.each(this.aSelectedRelationships, function (iIndex, relationship) {
			if (relationship.uid === sRelationshipUid) {
				that.aSelectedRelationships.splice(iIndex, 1);
				return true;
			}
		});
		return bUpdated ? true : false;
	};

	/**
	 * select multiple relationships
	 * @param {array} [aRelationships] List relationships which enable Selection
	 * @param {boolean} bExclusive if clear existing relationship selection
	 * @return {boolean} return true when select relationships successfully
	 */
	ShapeSelectionModel.prototype.selectRelationships = function(aRelationships, bExclusive) {
		if (!aRelationships || aRelationships.length === 0) {
			return this.clearRelationshipSelection();
		}
		var bUpdated;
		if (bExclusive) {
			bUpdated = this.clearRelationshipSelection();
		}
		for (var i = 0; i < aRelationships.length; i++) {
			bUpdated = this.selectRelationship(aRelationships[i]) ? true : bUpdated;
		}
		return bUpdated;
	};

	/**
	 * de-select multiple relationships by their ids
	 * @param {array} [aIds] List ids of the relationships you want to deselect
	 * @return {boolean} return true when deselect relationships successfully
	 */
	ShapeSelectionModel.prototype.deselectRelationships = function(aIds) {
		if (!aIds || aIds.length === 0) {
			return this.clearRelationshipSelection();
		} else {
			var bUpdated;
			for (var j in this.aSelectedRelationships) {
				var oRelationship = this.aSelectedRelationships[j];
				if (jQuery.inArray(oRelationship.id, aIds) >= 0) {
					bUpdated = this.deselectRelationship(oRelationship.uid) ? true : bUpdated;
				}
			}
			return bUpdated;
		}
	};

	/**
	 * @private
	 */
	ShapeSelectionModel.prototype.selectUnderlyingTableRows = function(aIds, oTable, bExclusive) {

		// clear all row selection if exclusive is true
		var aTableSelectedIndices = oTable.getSelectedIndices();
		if (bExclusive && aTableSelectedIndices.length > 0) {
			oTable.clearSelection();
		}

		var aRowDatum = this._getRowDatumForSelection(aIds, oTable);

		for (var iIndex = 0; iIndex < aRowDatum.length; iIndex++) {
			var oRowInfo = aRowDatum[iIndex];

			var sSelectionMode = this.getSelectionMode();
			if (sSelectionMode === sap.gantt.SelectionMode.Multiple ||
				sSelectionMode === sap.gantt.SelectionMode.MultiWithKeyboard) {
				oTable.addSelectionInterval(oRowInfo.rowIndex, oRowInfo.rowIndex);
			}else {
				oTable.setSelectedIndex(oRowInfo.rowIndex);
			}

		}
	};

	/**
	 * @private
	 */
	ShapeSelectionModel.prototype.deselectUnderlyingTableRows = function(aIds, oTable) {

		if (!aIds || aIds.length === 0) {
			// Passing null/undefined/[]/"" clears all table row selection??
			// The behavior is rather strange, but to keep the backward compatibility!
			oTable.clearSelection();
			return;
		}

		var aRowDatum = this._getRowDatumForSelection(aIds, oTable);

		for (var iIndex = 0; iIndex < aRowDatum.length; iIndex++) {
			var oRowInfo = aRowDatum[iIndex];

			oTable.removeSelectionInterval(oRowInfo.rowIndex, oRowInfo.rowIndex);
		}
	};

	/**
	 * Get binded shape datum by shape UID.
	 * 
	 * @param {string} sShapeUid generated UID on binded shape data
	 * 
	 * @return {object} binded shape datum
	 * 
	 * @private
	 */
	ShapeSelectionModel.prototype.getShapeDatumByShapeUid = function (sShapeUid) {
		return this._getDatumByUid(sShapeUid, "shape");
	};

	/**
	 * Get binded row datum by shape UID.
	 * 
	 * @param {string} sShapeUid generated UID on binded shape data
	 * 
	 * @return {object} binded row datum
	 * @private
	 */
	ShapeSelectionModel.prototype.getRowDatumByShapeUid = function(sShapeUid) {
		return this._getDatumByUid(sShapeUid, "row");
	};

	ShapeSelectionModel.prototype._getDatumByUid = function (sShapeUid, sReturnData) {
		var oGantt = this._getGanttChart();

		var rowData, shapeData;
		var sShapeDataName = Utility.getShapeDataNameByUid(sShapeUid);
		var bJSONTreeBinding = (oGantt._oTT.getBinding("rows").getMetadata().getName() === "sap.ui.model.json.JSONTreeBinding");
		var sRowChartScheme = Utility.getChartSchemeByShapeUid(sShapeUid);
		//consider all rows including invisible rows
		var aAllRowData = oGantt.getAllRowData();
		jQuery.each(aAllRowData, function (k, v) {
			var rowInfo = v;
			if (sRowChartScheme === "" || sRowChartScheme === rowInfo.chartScheme) {
				if (bJSONTreeBinding && rowInfo.data[sShapeDataName]) {
					for ( var i = 0; i < rowInfo.data[sShapeDataName].length; i++) {
						if (rowInfo.data[sShapeDataName][i].uid === sShapeUid) {
							rowData = rowInfo;
							shapeData = rowInfo.data[sShapeDataName][i];
							return false;
						}
					}
				}else if (rowInfo.data.uid === sShapeUid) {
					rowData = rowInfo;
					shapeData = rowInfo.data;
					return false;
				}
			}
		});

		if (sReturnData === "shape") {
			return shapeData;
		}
		return rowData;
	};

	ShapeSelectionModel.prototype._getRowDatumForSelection = function(aIds, oTable) {
		var aRowIds = aIds ? aIds : [],
			aRowDatum = Utility.getRowDatumRefById(aRowIds, oTable.getParent().getId()),
			bMatched = aRowDatum.length === aRowIds.length;

		if (!bMatched) {
			// If not matched, possible reason is rowId is invalid or rows are in invisible area.
			// For invalid row id, do nothing, here only try to lookup datum in invisible area.
			var aAllRowData = oTable.getParent().getAllRowData();
			var aInvisibleRowDatum = this._lookupInvisibleRowDatum(aRowIds, aRowDatum, aAllRowData);
			aRowDatum = aRowDatum.concat(aInvisibleRowDatum);
		}
		return aRowDatum;
	};

	/**
	 * Determine binded row datum from invisible area.
	 * 
	 * @return {array} list of row datum
	 * @private
	 */
	ShapeSelectionModel.prototype._lookupInvisibleRowDatum = function(aRowIds, aFoundRowDatum, aAllRowData) {
		var aFoundId = aFoundRowDatum.map(function(oDatum) { return oDatum.id; });

		var aNotFoundId = aRowIds.filter(function(sId){
			return jQuery.inArray(sId, aFoundId) === -1;
		});

		var aDatum = [];
		if (aNotFoundId.length > 0) {
			// not found the row, invisible row?
			var fnLookupRowDatumById = function(sId) {
				var oResult = null;
				jQuery.each(aAllRowData, function (i, oRowData) {
					if (oRowData.id === sId) {
						oResult = oRowData;
						return false;
					}
				});
				return oResult;
			};

			aDatum = aNotFoundId.map(function(sRowId){
				return fnLookupRowDatumById(sRowId);
			});
		}
		return aDatum;
	};

	ShapeSelectionModel.prototype._getGanttChart = function() {
		return sap.ui.getCore().byId(this.getGanttChart());
	};

	return ShapeSelectionModel;
});
