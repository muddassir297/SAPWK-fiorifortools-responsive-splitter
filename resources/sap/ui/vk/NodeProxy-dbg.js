/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the NodeProxy class.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/base/ManagedObject"
], function(jQuery, library, ManagedObject) {
	"use strict";

	var getJSONObject = sap.ui.vk.dvl.getJSONObject;

	/**
	 * Constructor for a new NodeProxy.
	 *
	 * @class
	 * Provides a proxy object to the node in the node hierarchy.
	 *
	 * Objects of this type should only be created with the {@link sap.ui.vk.NodeHierarchy#createNodeProxy sap.ui.vk.NodeHierarchy.createNodeProxy} method.
	 * and destroyed with the {@link sap.ui.vk.NodeHierarchy#destroyNodeProxy sap.ui.vk.NodeHierarchy.destroyNodeProxy} method.
	 *
	 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The node hierarchy the node belongs to.
	 * @param {string} nodeId The node ID.
	 * @public
	 * @author SAP SE
	 * @version 1.46.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.NodeProxy
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var NodeProxy = ManagedObject.extend("sap.ui.vk.NodeProxy", /** @lends sap.ui.vk.NodeProxy.prototype */ {
		metadata: {
			properties: {
				/**
				 * The node ID. This property is read-only.
				 */
				nodeId: "string",

				/**
				 * The node VE IDs. This property is read-only.
				 */
				veIds: "object[]",

				/**
				 * The name of the node. This property is read-only.
				 */
				name: "string",

				/**
				 * The local transformation matrix of the node.
				 */
				localMatrix: {
					type: "sap.ui.vk.TransformationMatrix",
					bindable: "bindable"
				},

				/**
				 * The world transformation matrix of the node.
				 */
				worldMatrix: {
					type: "sap.ui.vk.TransformationMatrix",
					bindable: "bindable"
				},

				/**
				 * The node opacity.
				 */
				opacity: {
					type: "float",
					bindable: "bindable"
				},

				/**
				 * The tint color.<br/>
				 *
				 * The tint color is a 32-bit integer in the ABGR notation, where A is amount of blending between material color and tint color.
				 */
				tintColorABGR: {
					type: "int",
					bindable: "bindable"
				},

				/**
				 * The node metadata. This property is read-only.
				 */
				nodeMetadata: "object",

				/**
				 * The indicator showing if the node has child nodes. This property is read-only.
				 */
				hasChildren: "boolean",

				/**
				 * The indicator showing if the node is closed. This property is read-only.
				 */
				closed: "boolean"
			}
		},

		constructor: function(nodeHierarchy, nodeId) {
			ManagedObject.call(this);

			this._dvl = nodeHierarchy ? nodeHierarchy.getGraphicsCore()._getDvl() : null;
			this._dvlSceneId = nodeHierarchy ? nodeHierarchy._getDvlSceneId() : null;
			this._dvlNodeId = nodeId;
		}
	});

	NodeProxy.prototype.destroy = function() {
		this._dvlNodeId = null;
		this._dvlSceneId = null;
		this._dvl = null;

		ManagedObject.prototype.destroy.call(this);
	};

	NodeProxy.prototype.getNodeId = function() {
		return this._dvlNodeId;
	};

	NodeProxy.prototype.getVeIds = function() {
		return getJSONObject(this._dvl.Scene.RetrieveVEIDs(this._dvlSceneId, this._dvlNodeId));
	};

	NodeProxy.prototype.getName = function() {
		return getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, this._dvlNodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_NAME)).NodeName;
	};

	NodeProxy.prototype.getLocalMatrix = function() {
		return sap.ui.vk.TransformationMatrix.convertTo4x3(getJSONObject(this._dvl.Scene.GetNodeLocalMatrix(this._dvlSceneId, this._dvlNodeId)).matrix);
	};

	NodeProxy.prototype.setLocalMatrix = function(value) {
		this._dvl.Scene.SetNodeLocalMatrix(this._dvlSceneId, this._dvlNodeId, value && sap.ui.vk.TransformationMatrix.convertTo4x4(value));
		this.setProperty("localMatrix", value, true);
		return this;
	};

	NodeProxy.prototype.getWorldMatrix = function() {
		return sap.ui.vk.TransformationMatrix.convertTo4x3(getJSONObject(this._dvl.Scene.GetNodeWorldMatrix(this._dvlSceneId, this._dvlNodeId)).matrix);
	};

	NodeProxy.prototype.setWorldMatrix = function(value) {
		this._dvl.Scene.SetNodeWorldMatrix(this._dvlSceneId, this._dvlNodeId, value && sap.ui.vk.TransformationMatrix.convertTo4x4(value));
		this.setProperty("worldMatrix", value, true);
		return this;
	};

	NodeProxy.prototype.getOpacity = function() {
		return getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, this._dvlNodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_OPACITY)).Opacity;
	};

	NodeProxy.prototype.setOpacity = function(value) {
		this._dvl.Scene.SetNodeOpacity(this._dvlSceneId, this._dvlNodeId, value);
		this.setProperty("opacity", value, true);
		return this;
	};

	NodeProxy.prototype.getTintColorABGR = function() {
		return getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, this._dvlNodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_HIGHLIGHT_COLOR)).HighlightColor;
	};

	NodeProxy.prototype.setTintColorABGR = function(value) {
		this._dvl.Scene.SetNodeHighlightColor(this._dvlSceneId, this._dvlNodeId, value);
		this.setProperty("tintColorABGR", value, true);
		return this;
	};

	NodeProxy.prototype.getNodeMetadata = function() {
		return getJSONObject(this._dvl.Scene.RetrieveMetadata(this._dvlSceneId, this._dvlNodeId)).metadata;
	};

	NodeProxy.prototype.getHasChildren = function() {
		return (getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, this._dvlNodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & (sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_MAPPED_HASCHILDREN | sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_CLOSED)) === sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_MAPPED_HASCHILDREN;
	};

	NodeProxy.prototype.getClosed = function() {
		return (getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, this._dvlNodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_CLOSED) !== 0;
	};

	delete NodeProxy.prototype.setClosed;
	delete NodeProxy.prototype.setHasChildren;
	delete NodeProxy.prototype.setName;
	delete NodeProxy.prototype.setNodeId;
	delete NodeProxy.prototype.setNodeMetadata;
	delete NodeProxy.prototype.setVeIds;

	return NodeProxy;
});
