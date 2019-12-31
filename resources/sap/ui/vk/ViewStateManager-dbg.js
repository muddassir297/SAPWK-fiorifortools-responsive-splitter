/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the ViewStateManager class.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/base/ManagedObject"
], function(jQuery, library, ManagedObject) {
	"use strict";

	var NodeSet;
	var log = jQuery.sap.log;

	// Visibility Tracker is an object which keeps track of visibility changes.
	// These changes will be used in Viewport getViewInfo/setViewInfo
	var VisibilityTracker = function() {
		// all visibility changes are saved in a Set. When a node changes visibility,
		// we add that id to the Set. When the visibility is changed back, we remove
		// the node id from the set.
		this._visibilityChanges = new Set();
		// flag which tells us if the _visibilityChanges set requires clearing
		this._requiresClearing = false;
	};

	// It returns an object with all the relevant information about the node visibility
	// changes. In this case, we need to retrieve a list of all nodes that suffered changes
	// and an overall state against which the node visibility changes is applied.
	// For example: The overall visibility state is ALL VISIBLE and these 2 nodes changed state.
	VisibilityTracker.prototype.getInfo = function(nodeHierarchy) {

		var findVeLocator = function(veId) {
			return veId.type === "VE_LOCATOR";
		};

		jQuery.sap.require("sap.ui.vk.NodeProxy");

		// converting the collection of changed node ids to ve ids
		var changedNodes = [];
		this._visibilityChanges.forEach(function(nodeId) {
			// create node proxy based on dynamic node id
			var nodeProxy = new sap.ui.vk.NodeProxy(nodeHierarchy, nodeId),
				// get the VE_LOCATOR ve id
				veId = jQuery.grep(nodeProxy.getVeIds(), findVeLocator)[0].fields[0].value;
			// destroy the node proxy
			nodeProxy.destroy();
			changedNodes.push(veId);
		});

		return changedNodes;
	};

	// some actions which are performed asyncronous (for e.g: playing a step)
	// will change this flag so cleaning would be performed at the relevant moment.
	VisibilityTracker.prototype.getRequiresClearing = function() {
		return this._requiresClearing;
	};

	VisibilityTracker.prototype.setRequiresClearing = function(requiresClearing) {
		this._requiresClearing = requiresClearing;
	};

	// It clears all the node ids from the _visibilityChanges set.
	// This action can be performed for example, when a step is activated or
	// when the nodes are either all visible or all not visible.
	VisibilityTracker.prototype.clear = function() {
		this._visibilityChanges.clear();
	};

	// If a node suffers a visibility change, we check if that node is already tracked.
	// If it is, we remove it from the list of changed nodes. If it isn't, we add it.
	VisibilityTracker.prototype.trackNodeId = function(nodeId) {
		if (this._visibilityChanges.has(nodeId)) {
			this._visibilityChanges.delete(nodeId);
		} else {
			this._visibilityChanges.add(nodeId);
		}
	};

	// NB: Implementation details:
	// ViewStateManager should have its own set of visible and selected nodes.
	// At the moment only one viewport per scene is supported and hence we can delegate
	// visibility and selection handling to the scene.

	/**
	 * Constructor for a new ViewStateManager.
	 *
	 * @class
	 * Manages the visibility and selection states of nodes in the scene.
	 *
	 * The objects of this class should not be created directly.
	 * They should be created with the {@link sap.ui.vk.GraphicsCore#createViewStateManager sap.ui.vk.GraphicsCore.createViewStateManager} method,
	 * and destroyed with the {@link sap.ui.vk.GraphicsCore#destroyViewStateManager sap.ui.vk.GraphicsCore.destroyViewStateManager} method.
	 *
	 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The NodeHierarchy object.
	 * @public
	 * @author SAP SE
	 * @version 1.46.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.ViewStateManager
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var ViewStateManager = ManagedObject.extend("sap.ui.vk.ViewStateManager", /** @lends sap.ui.vk.ViewStateManager.prototype */ {
		metadata: {
			publicMethods: [
				"enumerateSelection",
				"getNodeHierarchy",
				"getSelectionState",
				"getVisibilityState",
				"setSelectionState",
				"setVisibilityState",
				"getVisibilityChanges"
			],
			events: {
				/**
				 * This event is fired when the visibility of the node changes.
				 */
				visibilityChanged: {
					parameters: {
						/**
						 * IDs of newly shown nodes.
						 */
						visible: {
							type: "string[]"
						},
						/**
						 * IDs of newly hidden nodes.
						 */
						hidden: {
							type: "string[]"
						}
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when the nodes are selected/unselected.
				 */
				selectionChanged: {
					parameters: {
						/**
						 * IDs of newly selected nodes.
						 */
						selected: {
							type: "string[]"
						},
						/**
						 * IDs of newly unselected nodes.
						 */
						unselected: {
							type: "string[]"
						}
					},
					enableEventBubbling: true
				}
			}
		},
		constructor: function(nodeHierarchy, shouldTrackVisibilityChanges, canTrackVisibilityChanges) {
			log.debug("sap.ui.vk.ViewStateManager.constructor() called.");

			ManagedObject.apply(this);

			var scene = nodeHierarchy.getScene();
			this._nodeHierarchy = nodeHierarchy;

			this._dvlSceneId = scene._getDvlSceneId();
			this._dvl = scene.getGraphicsCore()._getDvl();

			this._dvlClientId = scene.getGraphicsCore()._getDvlClientId();
			this._dvl.Client.attachNodeVisibilityChanged(this._handleNodeVisibilityChanged, this);
			this._dvl.Client.attachNodeSelectionChanged(this._handleNodeSelectionChanged, this);

			// Visibility tracking is strictly dependant on VE IDs which means
			// only VDS4 files can track visibility changes.
			this._canTrackVisibilityChanges = canTrackVisibilityChanges;
			// This option is set by the application developer.
			this._shouldTrackVisibilityChanges = shouldTrackVisibilityChanges;

			this._nodeHierarchy.attachChanged(this._handleNodeHierarchyChanged, this);
			// When we create a new ViewStateManager, we call _handleNodeHierarchyChanged()
			// so we can update the node hierarchy related information which is requires
			// at tracking visibility changes.
			this._handleNodeHierarchyChanged();

			this._selectedNodes = new NodeSet();
			this._newlyVisibleNodes = [];
			this._newlyHiddenNodes = [];
			this._visibilityTimerId = null;
			this._selectionTimerId = null;

		}
	});

	ViewStateManager.prototype.destroy = function() {
		log.debug("sap.ui.vk.ViewStateManager.destroy() called.");

		if (this._selectionTimerId) {
			jQuery.sap.clearDelayedCall(this._selectionTimerId);
			this._selectionTimerId = null;
		}
		if (this._visibilityTimerId) {
			jQuery.sap.clearDelayedCall(this._visibilityTimerId);
			this._visibilityTimerId = null;
		}
		this._newlyHiddenNodes = null;
		this._newlyVisibleNodes = null;
		this._selectedNodes = null;
		if (this._dvl) {
			this._dvl.Client.detachNodeSelectionChanged(this._handleNodeSelectionChanged, this);
			this._dvl.Client.detachNodeVisibilityChanged(this._handleNodeVisibilityChanged, this);
			this._dvl.Client.detachStepEvent(this._handleStepEvent, this);
		}
		this._dvlClientId = null;
		this._dvlSceneId = null;
		this._dvl = null;
		this._scene = null;

		this._nodeHierarchy.detachChanged(this._handleNodeHierarchyChanged, this);

		ManagedObject.prototype.destroy.apply(this);
	};

	/**
	 * Gets the NodeHierarchy object associated with this ViewStateManager object.
	 * @returns {sap.ui.vk.NodeHierarchy} The node hierarchy associated with this ViewStateManager object.
	 * @public
	 */
	ViewStateManager.prototype.getNodeHierarchy = function() {
		return this._nodeHierarchy;
	};

	/**
	 * Gets the visibility changes in the current ViewStateManager object.
	 * @returns {string[]} The visibility changes are in the form of an array. The array is a list of node VE ids which suffered a visibility changed relative to the default state.
	 * @public
	 */
	ViewStateManager.prototype.getVisibilityChanges = function() {
		return (this._getShouldTrackVisibilityChanges() && this.getCanTrackVisibilityChanges()) ? this._visibilityTracker.getInfo(this.getNodeHierarchy()) : null;
	};

	ViewStateManager.prototype.getVisibilityComplete = function() {
		var nodeHierarchy = this.getNodeHierarchy(),
			allNodeIds = nodeHierarchy.findNodesByName(),
			visible = [],
			hidden = [];

		jQuery.sap.require("sap.ui.vk.NodeProxy");

		allNodeIds.forEach(function(nodeId) {
			// create node proxy based on dynamic node id
			var nodeProxy = new sap.ui.vk.NodeProxy(nodeHierarchy, nodeId),
				// get the VE_LOCATOR ve id
				veId = jQuery.grep(nodeProxy.getVeIds(), function(veId) {
					return veId.type === "VE_LOCATOR";
				})[0].fields[0].value;
			// destroy the node proxy
			nodeProxy.destroy();
			// push the ve id to either visible/hidden array
			if (this.getVisibilityState(nodeId)) {
				visible.push(veId);
			} else {
				hidden.push(veId);
			}
		}.bind(this));

		return {
			visible: visible,
			hidden: hidden
		};
	};
	/**
	 * Gets the visibility state of nodes.
	 *
	 * If a single node ID is passed to the method then a single visibility state is returned.<br/>
	 * If an array of node IDs is passed to the method then an array of visibility states is returned.
	 *
	 * @param {string|string[]} nodeIds The node ID or the array of node IDs.
	 * @return {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is visible, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getVisibilityState = function(nodeIds) {
		if (Array.isArray(nodeIds)) {
			return nodeIds.map(function(nodeId) {
				return (this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE) !== 0;
			}.bind(this));
		} else {
			var nodeId = nodeIds; // The nodeIds argument is a single nodeId.
			return (this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE) !== 0;
		}
	};

	/**
	 * Sets the visibility state of the nodes.
	 * @param {string|string[]} nodeIds The node ID or the array of node IDs.
	 * @param {boolean} visible The new visibility state of the nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @return {sap.ui.vk.ViewStateManager} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setVisibilityState = function(nodeIds, visible, recursive) {
		if (!Array.isArray(nodeIds)) {
			nodeIds = [ nodeIds ];
		}

		var changed = jQuery.sap.unique((recursive ? this._collectNodesRecursively(nodeIds) : nodeIds)).filter(function(nodeId) {
			var isCurrentlyVisible = (sap.ui.vk.dvl.getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE) !== 0;
			return isCurrentlyVisible !== visible;
		}.bind(this));

		if (changed.length > 0) {
			changed.forEach(function(nodeId) {
				this._dvl.Scene.ChangeNodeFlags(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE,
					visible ? sap.ve.dvl.DVLFLAGOPERATION.DVLFLAGOP_SET : sap.ve.dvl.DVLFLAGOPERATION.DVLFLAGOP_CLEAR);
			}.bind(this));

			this.fireVisibilityChanged({
				visible: visible ? changed : [],
				hidden: visible ? [] : changed
			});
		}

		return this;
	};

	ViewStateManager.prototype._handleNodeVisibilityChanged = function(parameters) {
		if (parameters.clientId === this._dvlClientId && parameters.sceneId === this._dvlSceneId) {
			this[parameters.visible ? "_newlyVisibleNodes" : "_newlyHiddenNodes"].push(parameters.nodeId);
			if (!this._visibilityTimerId) {
				this._visibilityTimerId = jQuery.sap.delayedCall(0, this, function() {

					if (this._getShouldTrackVisibilityChanges() && this.getCanTrackVisibilityChanges()) {
						this._newlyVisibleNodes.forEach(this._visibilityTracker.trackNodeId.bind(this._visibilityTracker));
						this._newlyHiddenNodes.forEach(this._visibilityTracker.trackNodeId.bind(this._visibilityTracker));

						if (this._visibilityTracker.getRequiresClearing()) {
							this._visibilityTracker.setRequiresClearing(false);
							this._visibilityTracker.clear();
						}
					}

					this._visibilityTimerId = null;
					this.fireVisibilityChanged({
						visible: this._newlyVisibleNodes.splice(0, this._newlyVisibleNodes.length),
						hidden: this._newlyHiddenNodes.splice(0, this._newlyHiddenNodes.length)
					});

				}.bind(this));
			}
		}
	};

	/**
	 * Enumerates IDs of the selected nodes.
	 *
	 * @param {function} callback A function to call when the selected nodes are enumerated. The function takes one parameter of type <code>string</code>.
	 * @returns {sap.ui.vk.ViewStateManager} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.enumerateSelection = function(callback) {
		this._selectedNodes.forEach(callback);
		return this;
	};

	/**
	 * Gets the selection state of the node.
	 *
	 * If a single node ID is passed to the method then a single selection state is returned.<br/>
	 * If an array of node IDs is passed to the method then an array of selection states is returned.
	 *
	 * @param {string|string[]} nodeIds The node ID or the array of node IDs.
	 * @return {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is selected, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getSelectionState = function(nodeIds) {
		if (Array.isArray(nodeIds)) {
			return nodeIds.map(function(nodeId) {
				return (this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED) !== 0;
			}.bind(this));
		} else {
			var nodeId = nodeIds; // The nodeIds argument is a single nodeId.
			return (this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED) !== 0;
		}
	};

	/**
	 * Sets the selection state of the nodes.
	 * @param {string|string[]} nodeIds The node ID or the array of node IDs.
	 * @param {boolean} selected The new selection state of the nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @return {sap.ui.vk.ViewStateManager} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setSelectionState = function(nodeIds, selected, recursive) {
		if (!Array.isArray(nodeIds)) {
			nodeIds = [ nodeIds ];
		}

		var changed = jQuery.sap.unique((recursive ? this._collectNodesRecursively(nodeIds) : nodeIds)).filter(function(nodeId) {
			var isCurrentlySelected = (sap.ui.vk.dvl.getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED) !== 0;
			return isCurrentlySelected !== selected;
		}.bind(this));

		if (changed.length > 0) {
			var change = this._selectedNodes[selected ? "add" : "delete"].bind(this._selectedNodes);
			changed.forEach(function(nodeId) {
				this._dvl.Scene.ChangeNodeFlags(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED,
					selected ? sap.ve.dvl.DVLFLAGOPERATION.DVLFLAGOP_SET : sap.ve.dvl.DVLFLAGOPERATION.DVLFLAGOP_CLEAR);
				change(nodeId);
			}.bind(this));

			this.fireSelectionChanged({
				selected: selected ? changed : [],
				unselected: selected ? [] : changed
			});
		}

		return this;
	};

	ViewStateManager.prototype._handleNodeSelectionChanged = function(parameters) {
		if (parameters.clientId === this._dvlClientId && parameters.sceneId === this._dvlSceneId) {
			if (!this._selectionTimerId) {
				this._selectionTimerId = jQuery.sap.delayedCall(0, this, function() {
					this._selectionTimerId = null;
					var currentlySelectedNodes = new NodeSet(this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneId, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_SELECTED).SelectedNodes);
					var newlyUnselectedNodes = [];
					this._selectedNodes.forEach(function(nodeId) {
						if (!currentlySelectedNodes.has(nodeId)) {
							newlyUnselectedNodes.push(nodeId);
						}
					});
					var newlySelectedNodes = [];
					currentlySelectedNodes.forEach(function(nodeId) {
						if (!this._selectedNodes.has(nodeId)) {
							newlySelectedNodes.push(nodeId);
						}
					}.bind(this));

					this._selectedNodes = currentlySelectedNodes;

					this.fireSelectionChanged({
						selected: newlySelectedNodes,
						unselected: newlyUnselectedNodes
					});
				});
			}
		}
	};

	ViewStateManager.prototype._handleNodeHierarchyChanged = function() {
		// If we can and we should track visibility, we create a new instance of visibility tracker
		// and we attach the event listener.
		if (this._getShouldTrackVisibilityChanges() && this.getCanTrackVisibilityChanges()) {
			if (!this._visibilityTracker) {
				// this is where we track all the node visibility changes
				this._visibilityTracker = new VisibilityTracker();
				// attaching event listener for step activation
				this._dvl.Client.attachStepEvent(this._handleStepEvent, this);
			}
		}
	};

	ViewStateManager.prototype._handleStepEvent = function(event) {
		if (event.type === sap.ve.dvl.DVLSTEPEVENT.DVLSTEPEVENT_STARTED) {
			this._visibilityTracker.setRequiresClearing(true);
		}
	};

	// Only VDS4 files can track visibility changes. VDS3 files are not able to do this.
	ViewStateManager.prototype.getCanTrackVisibilityChanges = function() {
		return this._canTrackVisibilityChanges;
	};

	ViewStateManager.prototype.setCanTrackVisibilityChanges = function(canTrackChanges) {
		this._canTrackVisibilityChanges = canTrackChanges;
	};

	ViewStateManager.prototype._getShouldTrackVisibilityChanges = function() {
		return this._shouldTrackVisibilityChanges;
	};

	ViewStateManager.prototype._collectNodesRecursively = function(nodeIds) {
		var result = [];
		var collectChildNodes = function(node) {
			var nodeId = typeof node === "string" ? node : node.getNodeId();
			result.push(nodeId);
			if ((sap.ui.vk.dvl.getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_CLOSED) === 0) {
				this._nodeHierarchy.enumerateChildren(nodeId, collectChildNodes);
			}
		}.bind(this);
		nodeIds.forEach(collectChildNodes);
		return result;
	};

	NodeSet = function(array) {
		array = array || [];
		if (this._builtin) {
			if (sap.ui.Device.browser.msie) {
				this._set = new Set();
				array.forEach(this._set.add.bind(this._set));
			} else {
				this._set = new Set(array);
			}
		} else {
			this._set = array.slice();
		}
	};

	NodeSet.prototype = {
		constructor: NodeSet,

		_builtin: !!Set,

		add: function(value) {
			if (this._builtin) {
				this._set.add(value);
			} else if (this._set.indexOf() < 0) {
				this._set.push(value);
			}
			return this;
		},

		"delete": function(value) {
			if (this._builtin) {
				return this._set.delete(value);
			} else {
				var index = this._set.indexOf(value);
				if (index >= 0) {
					this.splice(index, 1);
					return true;
				} else {
					return false;
				}
			}
		},

		clear: function() {
			if (this._builtin) {
				this._set.clear();
			} else {
				this._set.splice(0, this._set.length);
			}
		},

		has: function(value) {
			if (this._builtin) {
				return this._set.has(value);
			} else {
				return this._set.indexOf(value) >= 0;
			}
		},

		forEach: function(callback, thisArg) {
			this._set.forEach(callback, thisArg);
		}
	};

	return ViewStateManager;
});
