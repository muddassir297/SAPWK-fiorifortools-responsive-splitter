/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
/* global File, URI */
// Provides the GraphicsCore class.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/base/EventProvider", "./ve/thirdparty/html2canvas", "./ve/dvl", "./Scene", "./NodeHierarchy",
	"./ContentResource", "./DownloadManager", "./ViewStateManager", "./DvlException", "./Messages"
], function(jQuery, library, EventProvider, Html2Canvas, Dvl, Scene, NodeHierarchy, ContentResource,
			DownloadManager, ViewStateManager, DvlException, Messages) {
	"use strict";

	var log = jQuery.sap.log;

	/**
	 * Gets the name of the storage in Emscripten file system to use.
	 * @param {string|File} source The source to test.
	 * @returns {string} The name of the storage in Emscripten file system to use:
	 *                   "remote" for files downloaded from remote servers,
	 *                   "local" for files loaded from the local file system.
	 */
	function getStorageName(source) {
		return source instanceof File ? "local" : "remote";
	}

	/**
	 * Gets the name of the source.
	 * @param {string|File} source The source to get the name of.
	 * @returns {string} The name of the source. If the source is string then the source itself, if the source is File then source.name.
	 */
	function getSourceName(source) {
		return source instanceof File ? source.name : source;
	}

	// The SourceDatum class is used to record information about sources used in content resource hierarchies.
	// Sources correspond to files/models downloaded from remote servers or from local file systems.
	// To optimise the usage of sources we use caching - if multiple content resources reference the same source
	// the source is not downloaded multiple times, it is downloaded only once, and is destroyed when the last content
	// resource is destroyed.
	var SourceDatum = function(source) {
		Object.defineProperties(this, {
			source: {
				value: source,
				writable: false,
				enumerable: true
			},
			_refCount: {
				value: 0,
				writable: true,
				enumerable: false
			}
		});
	};

	SourceDatum.prototype.isInUse = function() {
		return this._refCount > 0;
	};

	SourceDatum.prototype.addRef = function() {
		++this._refCount;
		return this;
	};

	SourceDatum.prototype.release = function() {
		--this._refCount;
		jQuery.sap.assert(this._refCount >= 0, "Too many calls to SourceDatum.release().");
		return this;
	};

	SourceDatum.prototype.destroy = function() {
	};

	// The VdslSourceDatum is used to record information about VDSL sources.
	var VdslSourceDatum = function(source, vdsSourceDatum, vdslContent) {
		SourceDatum.call(this, source);
		Object.defineProperties(this, {
			content: {
				value: vdslContent,
				writable: false,
				enumerable: true
			},
			vdsSourceDatum: {
				value: vdsSourceDatum,
				writable: false,
				enumerable: true
			}
		});
	};

	VdslSourceDatum.prototype = Object.create(SourceDatum.prototype);
	VdslSourceDatum.prototype.constructor = VdslSourceDatum;

	VdslSourceDatum.prototype.destroy = function() {
		jQuery.sap.assert(this.vdsSourceDatum, "VDSL source without VDS reference");
		if (this.vdsSourceDatum) {
			this.vdsSourceDatum.release();
		}
		SourceDatum.prototype.destroy.call(this);
	};

	// The DvlSceneDatum class is used to record information about what source a DVL scene is created from
	// and whether it is a root scene. Root scenes are not shared. Non-root scenes are read only and can be
	// used as sources for cloning nodes into the root scene. It might happen that the same source is used
	// as a root scene and non-root scene, e.g. if there is a hierarchy of content resources and all content
	// resources are built from the same source, e.g. a model with just one box.
	var DvlSceneDatum = function(dvlSceneId, sourceDatum, root) {
		Object.defineProperties(this, {
			dvlSceneId: {
				value: dvlSceneId,
				writable: false,
				enumerable: true
			},
			sourceDatum: {              // This field can be null which means the DVL scene is created as empty, not from a source.
				value: sourceDatum,
				writable: false,
				enumerable: true
			},
			root: {
				value: !!root,
				writable: false,
				enumerable: true
			},
			_refCount: {
				value: 0,
				writable: true,
				enumerable: false
			}
		});
	};

	DvlSceneDatum.prototype.isInUse = function() {
		return this._refCount > 0;
	};

	DvlSceneDatum.prototype.addRef = function() {
		++this._refCount;
		return this;
	};

	DvlSceneDatum.prototype.release = function() {
		--this._refCount;
		jQuery.sap.assert(this._refCount >= 0, "Too many calls to DvlSceneDatum.release().");
		// NB: we do not release the reference to the SourceDatum object as this object can be re-used later.
		// The reference to the SoruceDatum object is released in the destroy method when this object is about to be completely dead.
		return this;
	};

	DvlSceneDatum.prototype.destroy = function() {
		// This object will not be re-used so we need to release the reference to the SourceDatum object if any.
		if (this.sourceDatum) {
			this.sourceDatum.release();
		}
	};

	var ShadowContentResource = function(contentResource, fake) {
		// nodeProxy and dvlSceneId are mutually exclusive.
		Object.defineProperties(this, {
			source: {
				value: contentResource.getSource()
			},
			sourceType: {
				value: contentResource.getSourceType()
			},
			sourceId: {
				value: contentResource.getSourceId(),
				writable: true
			},
			name: {
				value: contentResource.getName()
			},
			localMatrix: {
				value: contentResource.getLocalMatrix(),
				writable: true
			},
			password: {
				value: contentResource.getPassword()
			},
			children: {
				value: contentResource.getContentResources().map(function(contentResource) {
					return new ShadowContentResource(contentResource);
				})
			},
			dvlSceneDatum: {         // This field can be null which means this content resource is a pure grouping node.
				value: null,
				writable: true
			},
			nodeProxy: {             // This field is null when dvlSceneDatum.root equals true.
				value: null,
				writable: true
			},
			fake: {
				value: !!fake
			},
			sourceProperties: {
				value: null,
				writable: true
			}
		});
		contentResource._shadowContentResource = this;
	};

	ShadowContentResource.prototype.destroy = function() {
		// This object will not be re-used so we need to release the reference to DvlSceneData is any.
		if (this.dvlSceneDatum) {
			this.dvlSceneDatum.release();
		}
	};

	var VkSceneDatum = function(vkScene, shadowContentResource) {
		Object.defineProperties(this, {
			vkScene: {
				value: vkScene
			},
			shadowContentResource: {
				value: shadowContentResource
			}
		});
	};

	/**
	 * Constructor for a new GraphicsCore.
	 *
	 * @class
	 * Loads the DVL library, wraps it, and makes the wrapper available for the application.
	 *
	 * Example:<br/>
	 * <pre>   var oGraphicsCore = new GraphicsCore();</pre><br/>
	 *
	 * @param {object} runtimeSettings The Emscripten runtime settings.
	 * @param {int}    runtimeSettings.totalMemory The size of Emscripten module memory in bytes.
	 * @param {string} runtimeSettings.logElementId The ID of a textarea DOM element to write the log to.
	 * @param {string} runtimeSettings.statusElementId The ID of a DOM element to write the status messages to.
	 * @param {object} webGLContextAttributes The WebGL context attributes. See {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes}.
	 * @public
	 * @author SAP SE
	 * @version 1.46.0
	 * @extends sap.ui.base.EventProvider
	 * @alias sap.ui.vk.GraphicsCore
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var GraphicsCore = EventProvider.extend("sap.ui.vk.GraphicsCore", /** @lends sap.ui.vk.GraphicsCore.prototype */ {
		metadata: {
			publicMethods: [
				"buildSceneTree",
				"createViewStateManager",
				"destroyScene",
				"destroyViewStateManager",
				"getApi",
				"loadContentResourcesAsync",
				"showDebugInfo"
			]
		},
		constructor: function(runtimeSettings, webGLContextAttributes) {
			EventProvider.apply(this);

			var settings = jQuery.extend({}, runtimeSettings, {
				filePackagePrefixURL: jQuery.sap.getResourcePath("sap/ve") + "/"
			});
			this._dvlClientId = jQuery.sap.uid();
			this._dvl = sap.ve.dvl.createRuntime(settings);
			this._dvl.CreateCoreInstance(this._dvlClientId);
			sap.ui.vk.dvl.checkResult(this._dvl.Core.Init(this._DVLMajorVersion, this._DVLMinorVersion));

			var ui5Core = sap.ui.getCore();
			ui5Core.attachLocalizationChanged(this._onlocalizationChanged, this);
			sap.ui.vk.dvl.checkResult(this._dvl.Core.SetLocale(ui5Core.getConfiguration().getLanguageTag()));

			this._canvas = this._createRenderingCanvasAndContext(webGLContextAttributes);
			// The renderer needs to be initialised at the very beginning because it is required
			// to load geometry into GPU memory when loading models.
			this._dvl.Core.InitRenderer();

			// The list of URLs and File objects. Their content is downloaded and copied to the Emscripten file system.
			// The content of files in the Emscripten file system is read only.
			this._sourceData = [];

			// The list of records with information about what sources the DVL scenes are created from.
			// These records can be shared among multiple vkScenes.
			this._dvlSceneData = [];

			// The list of VkSceneDatum objects.
			this._vkSceneData = [];

			// The list of viewports (sap.ui.vk.Viewport).
			this._viewports = [];

			// The list of view state managers.
			this._viewStateManagers = [];
		},

		// NB: Change these numbers when changing dependency on dvl.js in pom.xml.
		_DVLMajorVersion: 6,
		_DVLMinorVersion: 2
	});

	GraphicsCore.prototype.destroy = function() {
		sap.ui.getCore().detachLocalizationChanged(this._onlocalizationChanged, this);

		// GraphicsCore does not own Viewport objects, it should not destroy them, it can only reset their association with GraphicsCore.
		this._viewports.slice().forEach(function(viewport) {
			viewport.setGraphicsCore(null);
		});
		this._viewports = null;

		this._cleanupVkSceneData();
		this._vkSceneData = null;

		this._cleanupDvlSceneData();
		jQuery.sap.assert(this._dvlSceneData.length === 0, "Not all DVL scenes are destroyed when sap.ui.vk.Scene objects are destroyed.");
		this._dvlSceneData = null;

		this._cleanupSourceData();
		jQuery.sap.assert(this._sourceData.length === 0, "Not all sources are deleted.");
		this._sourceData = null;

		this._viewStateManagers.slice().forEach(this.destroyViewStateManager.bind(this));
		this._viewStateManagers = null;

		this._webGLContext = null;
		this._canvas = null;

		this._dvl.Core.DoneRenderer();

		this._dvl.Core.Release();
		this._dvl = null;

		EventProvider.prototype.destroy.apply(this);
	};

	/**
	 * Creates a canvas element for the 3D viewport and initializes the WebGL context.
	 * @param {object} webGLContextAttributes WebGL context attributes. A JSON object with the following boolean properties:
	 * <ul>
	 *   <li>antialias {boolean} default value <code>true</code>.</li>
	 *   <li>alpha {boolean} default value <code>true</code>.</li>
	 *   <li>premultipliedAlpha {boolean} default value <code>false</code>.</li>
	 * </ul>
	 * Other {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes} are also supported.
	 * @returns {HTMLCanvasElement} The canvas element for the 3D viewport.
	 * @private
	 */
	GraphicsCore.prototype._createRenderingCanvasAndContext = function(webGLContextAttributes) {
		// _canvas is a private DOMElement used for WebGL rendering.
		// At the moment there can be only one canvas element and one viewport,
		// and the viewport uses the canvas.
		var canvas = document.createElement("canvas");
		canvas.id = jQuery.sap.uid();
		this._webGLContext = this._dvl.Core.CreateWebGLContext(canvas, webGLContextAttributes);
		return canvas;
	};

	/**
	 * Gets the canvas element used for 3D rendering.
	 * @returns {HTMLCanvasElement} The canvas element used for 3D rendering.
	 * @private
	 */
	GraphicsCore.prototype._getCanvas = function() {
		return this._canvas;
	};

	/**
	 * Gets the WebGL context used for 3D rendering.
	 * @returns {WebGLRenderingContext} The WebGL rendering context.
	 * @private
	 */
	GraphicsCore.prototype._getWebGLContext = function() {
		return this._webGLContext;
	};

	/**
	 * Gets the DVL object.
	 * @returns {DVL} The DVL object.
	 * @private
	 */
	GraphicsCore.prototype._getDvl = function() {
		return this._dvl;
	};

	/**
	 * Gets the DVL client ID used in processing notifications from DVL module.
	 * @returns {string} The DVL client ID.
	 * @private
	 */
	GraphicsCore.prototype._getDvlClientId = function() {
		return this._dvlClientId;
	};

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Source Data related methods.

	/**
	 * Returns an array of items from this._sourceData that matche the search criteria.
	 * @param {object} properties A JSON like object with one or several properties { source }.
	 * @returns {SourceDatum[]} An array of items from this._dvlSourceData that match the search criteria.
	 * @private
	 */
	GraphicsCore.prototype._findSourceData = function(properties) {
		var propNames = Object.getOwnPropertyNames(properties);
		return this._sourceData.filter(function(item) {
			return propNames.every(function(propName) {
				return properties[propName] === item[propName];
			});
		});
	};

	/**
	 * Destroys a single source.
	 * @param {SourceDatum} sourceDatum A SourceDatum object to destroy.
	 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
	 * @private
	 */
	GraphicsCore.prototype._destroySourceDatum = function(sourceDatum) {
		if (!(sourceDatum instanceof VdslSourceDatum)) {
			this._dvl.Core.DeleteFileByUrl(getSourceName(sourceDatum.source), getStorageName(sourceDatum.source));
		}
		sourceDatum.destroy();
		return this;
	};

	/**
	 * Cleans up unused sources.
	 *
	 * This method is called via jQuery.sap.delayedCall after multiple sources are released to collect unused objects.
	 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
	 * @private
	 */
	GraphicsCore.prototype._cleanupSourceData = function() {
		var needAnotherPass = false; // Another pass is need when any VDSL source datum is destroyed and its referenced VDS source datum gets not in use.
		for (var i = this._sourceData.length - 1; i >= 0; --i) {
			var sourceDatum = this._sourceData[i];
			if (!sourceDatum.isInUse()) {
				var referencedSourceDatum = sourceDatum instanceof VdslSourceDatum ? sourceDatum.vdsSourceDatum : null;
				this._sourceData.splice(i, 1);
				this._destroySourceDatum(sourceDatum);
				if (referencedSourceDatum && !referencedSourceDatum.isInUse()) {
					needAnotherPass = true;
				}
			}
		}
		if (needAnotherPass) {
			this._cleanupSourceData();
		}
		return this;
	};

	// END: Source Data related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: DVL Scene Data related methods.

	/**
	 * Returns an array of items from this._dvlSceneData that match the search criteria.
	 * @param {object} properties A JSON like object with one or several properties { dvlSceneId, source, root }.
	 * @return {DvlSceneDatum[]} An array of items from this._dvlSceneData that match the search criteria.
	 * @private
	 */
	GraphicsCore.prototype._findDvlSceneData = function(properties) {
		var propNames = Object.getOwnPropertyNames(properties);
		return this._dvlSceneData.filter(function(item) {
			return propNames.every(function(propName) {
				return properties[propName] === item[propName];
			});
		});
	};

	/**
	 * Destroys a single DVL scene datum object.
	 * @param {DvlSceneDatum} dvlSceneDatum A DvlSceneDatum object to destroy.
	 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
	 * @private
	 */
	GraphicsCore.prototype._destroyDvlSceneDatum = function(dvlSceneDatum) {
		this._dvl.Scene.Release(dvlSceneDatum.dvlSceneId);
		dvlSceneDatum.destroy();
		return this;
	};

	/**
	 * Cleans up unused DVL scene data.
	 *
	 * This method is called via jQuery.sap.delayedCall after multiple DVL scene data are released to collect unused objects.
	 * @private
	 */
	GraphicsCore.prototype._cleanupDvlSceneData = function() {
		for (var i = this._dvlSceneData.length - 1; i >= 0; --i) {
			var dvlSceneDatum = this._dvlSceneData[i];
			if (!dvlSceneDatum.isInUse()) {
				this._dvlSceneData.splice(i, 1);
				this._destroyDvlSceneDatum(dvlSceneDatum);
			}
		}
	};

	// END: DVL Scene Data related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: VK Scene Data related methods.

	/**
	 * Returns an array of items from this._vkSceneData that match the search criteria.
	 * @param {object} properties A JSON like object with one or several properties { vkSceneId, etc }.
	 * @return {VkSceneDatum[]} An array of items from this._vkSceneData that match the search criteria.
	 * @private
	 */
	GraphicsCore.prototype._findVkSceneData = function(properties) {
		var propNames = Object.getOwnPropertyNames(properties);
		return this._vkSceneData.filter(function(item) {
			return propNames.every(function(propName) {
				return properties[propName] === item[propName];
			});
		});
	};

	GraphicsCore.prototype._cleanupVkSceneData = function() {
		for (var i = this._vkSceneData.length - 1; i >= 0; --i) {
			this.destroyScene(this._vkSceneData[i].vkScene);
		}
	};

	// END: VK Scene Data related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Shadow Content Resource related methods.

	GraphicsCore.prototype._destroyShadowContentResource = function(vkScene, shadowContentResource) {
		if (shadowContentResource.children) {
			shadowContentResource.children.forEach(this._destroyShadowContentResource.bind(this, vkScene));
		}
		if (shadowContentResource.nodeProxy) {
			this._dvl.Scene.DeleteNode(vkScene._getDvlSceneId(), shadowContentResource.nodeProxy.getNodeId());
			vkScene.getDefaultNodeHierarchy().destroyNodeProxy(shadowContentResource.nodeProxy);
		}
		shadowContentResource.destroy();
	};

	// END: Shadow Content Resource related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Content Resource related methods.

	/**
	 * Gets a list of filtered content resources.
	 *
	 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to filter.
	 * @param {function} filter A function to test each content resource. Invoked with one argument <code>contentResource</code>.
	 * @return {sap.ui.vk.ContentResource[]} The content resources that are matched by the filter.
	 * @private
	 */
	GraphicsCore.prototype._filterContentResources = function(contentResources, filter) {
		var result = [];
		contentResources.forEach(function enumerate(contentResource) {
			if (filter(contentResource)) {
				result.push(contentResource);
			}
			contentResource.getContentResources().forEach(enumerate);
		});
		return result;
	};

	/**
	 * Gets a list of encrypted content resources without passwords.
	 *
	 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to check.
	 * @return {sap.ui.vk.ContentResource[]} The content resources that are encrypted and have no passwords.
	 * @private
	 */
	GraphicsCore.prototype._getContentResourcesWithMissingPasswords = function(contentResources) {
		var library = this._dvl.Library;
		return this._filterContentResources(contentResources, function(contentResource) {
			var source = contentResource.getSource();
			return source && (library.RetrieveInfo(getSourceName(source), getStorageName(source)).flags & sap.ve.dvl.DVLFILEFLAG.ENCRYPTED) && !contentResource.getPassword();
		});
	};

	/**
	 * Gets a list of content resources with encrypted VDS3 models.
	 *
	 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to check.
	 * @return {sap.ui.vk.ContentResource[]} The content resources with encrypted VDS3 models.
	 * @private
	 */
	GraphicsCore.prototype._getContentResourcesWithEncryptedVds3 = function(contentResources) {
		var library = this._dvl.Library;
		return this._filterContentResources(contentResources, function(contentResource) {
			var source = contentResource.getSource();
			if (source) {
				var fileInfo = library.RetrieveInfo(getSourceName(source), getStorageName(source));
				return fileInfo.major <= 3 && (fileInfo.flags & sap.ve.dvl.DVLFILEFLAG.ENCRYPTED);
			} else {
				return false;
			}
		});
	};

	/**
	 * Collects content resource source properties.
	 *
	 * @param {ShadowContentResource} shadowContentResource The shadow content resource to inspect.
	 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
	 * @private
	 */
	GraphicsCore.prototype._collectSourceProperties = function(shadowContentResource) {
		var sourceInfo = this._dvl.Library.RetrieveInfo(getSourceName(shadowContentResource.source), getStorageName(shadowContentResource.source));
		shadowContentResource.sourceProperties = {
			version: {
				major: sourceInfo.major,
				minor: sourceInfo.minor
			}
		};
		if (sourceInfo.flags & (sap.ve.dvl.DVLFILEFLAG.PAGESCOMPRESSED | sap.ve.dvl.DVLFILEFLAG.WHOLEFILECOMPRESSED)) {
			shadowContentResource.sourceProperties.compressed = true;
		}
		if (sourceInfo.flags & sap.ve.dvl.DVLFILEFLAG.ENCRYPTED) {
			shadowContentResource.sourceProperties.encrypted = true;
		}
		return this;
	};

	/**
	 * Loads content resources.
	 *
	 * Content resources can be downloaded from a URL or loaded from a local file.
	 *
	 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to build the scene from.
	 * @param {function} onComplete The callback function to call when all content resources are processed.
	 *                              The callback takes one parameter <code>sourcesFailedToLoad</code> - an array of
	 *                              the 'source' attribute values that are failed to be loaded.
	 * @param {function} onProgress The callback function to call to report the file loading progress.
	 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
	 * @public
	 */
	GraphicsCore.prototype.loadContentResourcesAsync = function(contentResources, onComplete, onProgress) {
		var that = this,
			sources = [], // this can be declared as new Set(), but in this case it will need to be converted to an array to pass to DownloadManager.
			vdslSources = new Map();

		// Collect unique sources that are not loaded yet.
		contentResources.forEach(function enumerate(contentResource) {
			var source = contentResource.getSource();
			if (source && sources.indexOf(source) < 0 && that._findSourceData({ source: source }).length === 0) {
				sources.push(source);
				if (contentResource.getSourceType() === "vdsl") {
					vdslSources.set(source, {});
				}
			}
			contentResource.getContentResources().forEach(enumerate);
		});

		// Accumulate source data in a local variable and then pass it to onComplete handler
		// otherwise the cleanup process can garbage collect them.
		var sourceData = [];

		// Asynchronously download all content resources with URLs or local files.
		if (sources.length > 0) {
			var sourcesFailedToLoad;
			var downloadManager = new DownloadManager(sources)
				.attachItemSucceeded(function(event) {
					var source = event.getParameter("source");
					var response = event.getParameter("response");

					if (vdslSources.has(source)) {
						// We do not add SourceDatum for VDSL file yet.
						// We will add it after we successfully download the referenced VDS file.
						var content = sap.ui.vk.utf8ArrayBufferToString(response);
						if (content.trim().length === 0) {
							sourcesFailedToLoad = sourcesFailedToLoad || [];
							sourcesFailedToLoad.push({
								source: source,
								status: Messages.VIT22.code,
								statusText: sap.ui.vk.getResourceBundle().getText(Messages.VIT22.summary)
							});
							log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT22.summary), Messages.VIT22.code, "sap.ui.vk.GraphicsCore");
							return;
						} else {
							var lines = content.split(/\n|\r\n/);
							var m = lines[0].match(/^file=(.+)$/);
							if (!m){
								sourcesFailedToLoad = sourcesFailedToLoad || [];
								sourcesFailedToLoad.push({
									source: source,
									status: Messages.VIT23.code,
									statusText: sap.ui.vk.getResourceBundle().getText(Messages.VIT23.summary)
								});
								log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT23.summary), Messages.VIT23.code, "sap.ui.vk.GraphicsCore");
								return;
							} else {
								var vdslSourceData = vdslSources.get(source);
								vdslSourceData.content = lines;
								var referencedSource = m[1];
								var originalReferencedSource = referencedSource;
								var originalReferencedSourceUrl = new URI(originalReferencedSource);
								if (originalReferencedSourceUrl.is("relative")) {
									if (source instanceof File) {
										sourcesFailedToLoad = sourcesFailedToLoad || [];
										sourcesFailedToLoad.push({
											source: source,
											status: Messages.VIT24.code,
											statusText: sap.ui.vk.getResourceBundle().getText(Messages.VIT24.summary)
										});
										log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT24.summary), Messages.VIT24.code, "sap.ui.vk.GraphicsCore");
										return;
									} else {
										var vdslSourceUrl = new URI(source);
										referencedSource = originalReferencedSourceUrl.absoluteTo(vdslSourceUrl).href();
									}
								}
								vdslSourceData.referencedSource = referencedSource;
								vdslSourceData.content[0] = vdslSourceData.content[0].replace(originalReferencedSource, this._dvl.Core.GetFilename(vdslSourceData.referencedSource, "remote"));
								if (sources.indexOf(vdslSourceData.referencedSource) < 0 && this._findSourceData({ source: vdslSourceData.referencedSource }).length === 0) {
									// The referenced source is not downloaded previously and is not queued for downloading yet.
									// It is possible to have a content resource hierarchy of VDSL files, some of them
									// can reference the same VDS file. In such cases we do not need to download the same
									// refereneced VDS file multiple times.
									sources.push(vdslSourceData.referencedSource);
									downloadManager.queue(vdslSourceData.referencedSource);
								}
							}
						}
					} else {
						// If it is not a vdsl file, just store in the Emscripten file system.
						var isFile = source instanceof File;
						var name = isFile ? source.name : source;
						var storageName = getStorageName(source);
						this._dvl.Core.CreateFileFromArrayBuffer(response, name, storageName);
						sourceData.push(new SourceDatum(source));
					}
				}, this)
				.attachAllItemsCompleted(function(event) {
					if (sourcesFailedToLoad) {
						// If anything failed then destroy all downloaded sources. This behaviour may change in future.
						sourceData.forEach(this._destroySourceDatum.bind(this));
					} else {
						// Otherwise, append newly downloaded sources to the list of all downloaded sources.
						Array.prototype.push.apply(this._sourceData, sourceData);
						// Create VdslSourceDatum for VDSL sources.
						vdslSources.forEach(function(vdslSourceData, vdslSource) {
							var vdsSourceDatum = this._findSourceData({ source: vdslSourceData.referencedSource })[0];
							var sourceDatum = new VdslSourceDatum(vdslSource, vdsSourceDatum, vdslSourceData.content.join("\n"));
							this._sourceData.push(sourceDatum);
							vdsSourceDatum.addRef();
							// VdslSourceDatum will be addRef'ed when the corresponding scene is created.
						}.bind(this));
					}
					if (onComplete) {
						onComplete(sourcesFailedToLoad);
					}
				}, this)
				.attachItemFailed(function(event) {
					sourcesFailedToLoad = sourcesFailedToLoad || [];
					sourcesFailedToLoad.push({
						source: event.getParameter("source"),
						status: event.getParameter("status"),
						statusText: event.getParameter("statusText")
					});
				}, this);
			if (onProgress) {
				downloadManager.attachItemProgress(onProgress, this);
			}
			downloadManager.start();
		} else if (onComplete) {
			// Nothing to download or everything is already downloaded.
			onComplete();
		}

		return this;
	};

	/**
	 * Merges content resources to the root scene.
	 *
	 * This is a private helper method used in methods buildSceneTree and updateSceneTree.
	 * @param {string} dvlRootSceneId The DVL ID of the root scene.
	 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The node hierarchy object.
	 * @param {string} dvlParentNodeId The DVL ID of the parent node.
	 * @param {string} dvlInsertBeforeNodeId The DVL ID of the node before which to insert the new subtree. If <code>null</code> then add at the end.
	 * @param {ShadowContentResource} shadowContentResource The content resource to merge into the root scene.
	 * @private
	 */
	GraphicsCore.prototype._mergeContentResource = function(dvlRootSceneId, nodeHierarchy, dvlParentNodeId, dvlInsertBeforeNodeId, shadowContentResource) {
		// A grouping node for the merged content resource.
		var dvlGroupingNodeId = this._dvl.Scene.CreateNode(dvlRootSceneId, dvlParentNodeId, shadowContentResource.name, dvlInsertBeforeNodeId);
		shadowContentResource.nodeProxy = nodeHierarchy.createNodeProxy(dvlGroupingNodeId);

		if (shadowContentResource.localMatrix) {
			shadowContentResource.nodeProxy.setLocalMatrix(shadowContentResource.localMatrix);
		}

		if (shadowContentResource.source) {
			var sourceDatum = this._findSourceData({ source: shadowContentResource.source })[0];
			var dvlSceneDatum = this._findDvlSceneData({ sourceDatum: sourceDatum, root: false })[0];
			if (!dvlSceneDatum) {
				// The DVL scene is not created yet.
				dvlSceneDatum = new DvlSceneDatum(
					sap.ui.vk.dvl.getPointer(
						sourceDatum instanceof VdslSourceDatum ?
							this._dvl.Core.LoadSceneFromVDSL(sourceDatum.content, shadowContentResource.password) :
							this._dvl.Core.LoadSceneByUrl(getSourceName(shadowContentResource.source), shadowContentResource.password, getStorageName(shadowContentResource.source))),
					sourceDatum, false);
				this._dvlSceneData.push(dvlSceneDatum);
				sourceDatum.addRef();
				this._collectSourceProperties(shadowContentResource);
				if (shadowContentResource.sourceProperties.version.major >= 4) {
					// If the loaded source is a VDS4 file, we will log a message via jQuery.sap.log.
					// This message will be captured by the Viewer's Message Popover control.
					log.warning(sap.ui.vk.getResourceBundle().getText(Messages.VIT20.summary), Messages.VIT20.code, "sap.ui.vk.GraphicsCore");
				}
			}
			shadowContentResource.dvlSceneDatum = dvlSceneDatum;
			dvlSceneDatum.addRef();
			// Clone top level nodes from the merged content resource under the newly created grouping node.
			this._dvl.Scene.RetrieveSceneInfo(dvlSceneDatum.dvlSceneId, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_CHILDREN).ChildNodes.forEach(function(nodeId) {
				this._dvl.Scene.CreateNodeCopy(dvlRootSceneId, nodeId, dvlGroupingNodeId, sap.ve.dvl.DVLCREATENODECOPYFLAG.COPY_CHILDREN);
			}.bind(this));
		}
		// NB: pass undefined as dvlInsertBeforeNodeId to add to the end.
		shadowContentResource.children.forEach(this._mergeContentResource.bind(this, dvlRootSceneId, nodeHierarchy, dvlGroupingNodeId, /* dvlInsertBeforeNodeId = */ undefined));
	};

	/**
	 * Builds a scene tree from the hierarchy of content resources. The content resources must be already loaded.
	 * @param {sap.ui.vk.ContentResource[]} contentResources The array of content resources to build the scene from.
	 * @returns {sap.ui.vk.Scene} The scene built from the content resources.
	 * @public
	 */
	GraphicsCore.prototype.buildSceneTree = function(contentResources) {
		// At this point all content contentResources must be downloaded.

		if (contentResources.length === 0) {
			return null;
		}

		var rootDvlSceneDatum;
		var rootShadowContentResource;
		var shadowContentResources = contentResources.map(function(contentResource) {
			return new ShadowContentResource(contentResource);
		});

		// Process top level content contentResources in a special way. Then process next level content contentResources recursively.
		if (shadowContentResources.length === 1) {
			rootShadowContentResource = shadowContentResources[0];
			if (rootShadowContentResource.source) {
				// If there is a single top level content resource with a URL or File then load the resource without creating
				// a grouping node and merging. Always create a new DVL scene because root DVL scenes are not shared among vkScenes.
				var sourceDatum = this._findSourceData({ source: rootShadowContentResource.source })[0];
				rootDvlSceneDatum = new DvlSceneDatum(
					sap.ui.vk.dvl.getPointer(
						sourceDatum instanceof VdslSourceDatum ?
							this._dvl.Core.LoadSceneFromVDSL(sourceDatum.content, rootShadowContentResource.password) :
							this._dvl.Core.LoadSceneByUrl(getSourceName(rootShadowContentResource.source), rootShadowContentResource.password, getStorageName(rootShadowContentResource.source))),
					sourceDatum, true);
				sourceDatum.addRef();
				this._collectSourceProperties(rootShadowContentResource);
				if (rootShadowContentResource.sourceProperties.version.major >= 4) {
					// If the loaded source is a VDS4 file, we will log a message via jQuery.sap.log.
					// This message will be captured by the Viewer's Message Popover control.
					log.warning(sap.ui.vk.getResourceBundle().getText(Messages.VIT20.summary), Messages.VIT20.code, "sap.ui.vk.GraphicsCore");
				}
			} else {
				rootDvlSceneDatum = new DvlSceneDatum(this._dvl.Core.CreateEmptyScene(), null, true);
			}
		} else {
			// Create a fake root content resource.
			var fakeRootContentResource = new ContentResource({
				sourceType: "vds",
				sourceId: jQuery.sap.uid()
			});
			rootShadowContentResource = new ShadowContentResource(fakeRootContentResource, true);
			fakeRootContentResource.destroy();
			fakeRootContentResource = null;
			Array.prototype.push.apply(rootShadowContentResource.children, shadowContentResources);
			shadowContentResources = [ rootShadowContentResource ];
			// Always create a new empty scene for the root node.
			rootDvlSceneDatum = new DvlSceneDatum(this._dvl.Core.CreateEmptyScene(), null, true);
		}
		this._dvlSceneData.push(rootDvlSceneDatum);
		rootShadowContentResource.dvlSceneDatum = rootDvlSceneDatum;
		rootDvlSceneDatum.addRef();

		var vkScene = new Scene(this, rootDvlSceneDatum.dvlSceneId);
		this._vkSceneData.push(new VkSceneDatum(vkScene, rootShadowContentResource));

		// NB: pass undefined as dvlInsertBeforeNodeId to add to the end.
		rootShadowContentResource.children.forEach(this._mergeContentResource.bind(this, rootDvlSceneDatum.dvlSceneId, vkScene.getDefaultNodeHierarchy(), /* dvlParentNodeId = */ null, /* dvlInsertBeforeNodeId = */ undefined));

		return vkScene;
	};

	/**
	 * Updates or rebuilds a scene tree from the hierarchy of content resources.
	 *
	 * The content resources must be already loaded. Some changes in the content resource hierarchy can lead to
	 * rebuilding the scene completely. In this case a new scene is created.
	 *
	 * @param {sap.ui.vk.Scene} vkScene The scene to update or null to force to create a new one.
	 * @param {sap.ui.vk.ContentResource[]} contentResources The array of content resources to update or build the scene from.
	 * @param {function} [onError] The callback function to call when an error happens.
	 * @returns {sap.ui.vk.Scene} The scene updated or created.
	 * @public
	 */
	GraphicsCore.prototype.updateSceneTree = function(vkScene, contentResources, onError) {
		// At this point all content contentResources must be downloaded.

		if (contentResources.length === 0) {
			return null;
		}

		var contentResourcesWithEncryptedVds3 = this._getContentResourcesWithEncryptedVds3(contentResources);
		if (contentResourcesWithEncryptedVds3.length > 0) {
			log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT25.summary), Messages.VIT25.code, "sap.ui.vk.GraphicsCore");
			if (onError) {
				onError({ contentResourcesWithEncryptedVds3: contentResourcesWithEncryptedVds3 });
			}
			return null;
		}

		var contentResourcesWithMissingPasswords = this._getContentResourcesWithMissingPasswords(contentResources);
		if (contentResourcesWithMissingPasswords.length > 0) {
			log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT21.summary), Messages.VIT21.code, "sap.ui.vk.GraphicsCore");
			if (onError) {
				onError({ contentResourcesWithMissingPasswords: contentResourcesWithMissingPasswords });
			}
			return null;
		}

		if (!vkScene) {
			return this.buildSceneTree(contentResources);
		}

		var rootShadowContentResource = this._findVkSceneData({ vkScene: vkScene })[0].shadowContentResource;
		var oldRootIsFromFile = !!rootShadowContentResource.source;
		var newRootIsFromFile = contentResources.length === 1 && !!contentResources[0].getSource();

		if (!(oldRootIsFromFile && newRootIsFromFile && rootShadowContentResource.source === contentResources[0].getSource()
				|| !oldRootIsFromFile && !newRootIsFromFile && rootShadowContentResource.fake === contentResources.length > 1)) {
			return this.buildSceneTree(contentResources);
		}

		var that = this;
		var dvlRootSceneId = vkScene._getDvlSceneId();
		var nodeHierarchy = vkScene.getDefaultNodeHierarchy();

		function update(shadowContentResources, contentResources, dvlParentNodeId) {
			// This function compares changes in properties which might lead to DVL node re-creation or deletion.
			function equals(shadowContentResource, contentResource) {
				if (!shadowContentResource && !contentResource) {
					// Both are undefined/null.
					return true;
				} else if (!!shadowContentResource ^ !!contentResource) {
					// One is undefined/null, another is not undefined/null.
					return false;
				} else {
					// Both are not undefined/null.
					return shadowContentResource.source === contentResource.getSource()
						&& shadowContentResource.sourceType === contentResource.getSourceType()
						&& shadowContentResource.name === contentResource.getName()
						&& shadowContentResource.password === contentResource.getPassword();
				}
			}

			// The mutable properties do not lead to re-creation of DVL nodes.
			function copyMutableProperties(shadowContentResource, contentResource) {
				contentResource._shadowContentResource = shadowContentResource;
				shadowContentResource.sourceId = contentResource.getSourceId();
				shadowContentResource.localMatrix = contentResource.getLocalMatrix();
				if (shadowContentResource.nodeProxy) {
					shadowContentResource.nodeProxy.setLocalMatrix(shadowContentResource.localMatrix);
				}
			}

			// Scan shadow content resources comparing them with new content resources.
			// Equal content resources are scanned recursively.
			var i = 0; // Shadow content resource index.
			var changes = jQuery.sap.arrayDiff(shadowContentResources, contentResources, equals, true);
			changes.forEach(function(change) {
				// Compare unchanged items.
				for (; i < change.index; ++i) {
					update(shadowContentResources[i].children, contentResources[i].getContentResources(), shadowContentResources[i].nodeProxy.getNodeId());
					copyMutableProperties(shadowContentResources[i], contentResources[i]);
				}
				if (change.type === "delete") {
					that._destroyShadowContentResource(vkScene, shadowContentResources[change.index]);
					shadowContentResources.splice(change.index, 1);
				} else if (change.type === "insert") {
					var nextNodeId;
					if (i < shadowContentResources.length && shadowContentResources[i].nodeProxy) {
						nextNodeId = shadowContentResources[i].nodeProxy.getNodeId();
					}
					var shadowContentResource = new ShadowContentResource(contentResources[change.index]);
					that._mergeContentResource(dvlRootSceneId, nodeHierarchy, dvlParentNodeId, nextNodeId, shadowContentResource);
					shadowContentResources.splice(change.index, 0, shadowContentResource);
					++i;
				}
			});
			// Compare remaining unchanged items.
			for (; i < shadowContentResources.length; ++i) {
				update(shadowContentResources[i].children, contentResources[i].getContentResources(), shadowContentResources[i].nodeProxy && shadowContentResources[i].nodeProxy.getNodeId());
				copyMutableProperties(shadowContentResources[i], contentResources[i]);
			}
		}

		update(rootShadowContentResource.fake ? rootShadowContentResource.children : [ rootShadowContentResource ], contentResources, 0);

		nodeHierarchy.fireChanged();

		return vkScene;
	};

	// END: Content Resource related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Scene related methods.

	/**
	 * Destroys the scene object.
	 * @param {sap.ui.vk.Scene} vkScene The scene to destroy.
	 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
	 * @public
	 */
	GraphicsCore.prototype.destroyScene = function(vkScene) {
		var vkSceneDataIndex;
		for (vkSceneDataIndex = 0; vkSceneDataIndex < this._vkSceneData.length; ++vkSceneDataIndex) {
			if (this._vkSceneData[vkSceneDataIndex].vkScene === vkScene) {
				break;
			}
		}
		if (vkSceneDataIndex === this._vkSceneData.length) {
			log.warning("Scene with id '" + vkScene.getId() + "' is not created by this GraphicsCore.");
			return this;
		}
		var vkSceneData = this._vkSceneData.splice(vkSceneDataIndex, 1)[0];
		this._destroyShadowContentResource(vkScene, vkSceneData.shadowContentResource);
		vkScene.destroy();
		return this;
	};

	// END: Scene related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Viewport related methods.

	/**
	 * Registers the viewport in GraphicsCore.
	 * Viewports are registered when corresponding DVLRenderers are created.
	 * @param {sap.ui.vk.Viewport} viewport The viewport to register.
	 * @returns {boolean} <code>true</code> if <code>viewport</code> gets registered, <code>false</code> if <code>viewport</code> was already registered.
	 * @private
	 */
	GraphicsCore.prototype._registerViewport = function(viewport) {
		if (this._viewports.indexOf(viewport) >= 0) {
			return false;
		}
		this._viewports.push(viewport);
		return true;
	};

	/**
	 * Unregisters the viewport in GraphicsCore.
	 * Viewports are unregistered when corresponding DVLRenderers are destroyed.
	 * @param {sap.ui.vk.Viewport} viewport The viewport to unregister.
	 * @returns {boolean} <code>true</code> if <code>viewport</code> gets unregistered, <code>false</code> if <code>viewport</code> was already unregistered.
	 * @private
	 */
	GraphicsCore.prototype._unregisterViewport = function(viewport) {
		var index = this._viewports.indexOf(viewport);
		if (index < 0) {
			return false;
		}
		this._viewports.splice(index, 1);
		return true;
	};

	/**
	 * Gets the Viewport object count.
	 * @returns {int} The number of Viewport objects registered in GraphicsCore.
	 * @private
	 */
	GraphicsCore.prototype._getViewportCount = function() {
		return this._viewports.length;
	};

	// END: Viewport related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: View State Manager related methods.

	/**
	 * Creates a new ViewStateManager object.
	 *
	 * GraphicsCore owns the new ViewStateManager object. The object must be destroyed with the {@link #destroyViewStateManager destroyViewStateManager} method;
	 *
	 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The NodeHierarchy object the view state manager is created for.
	 * @param {boolean} shouldTrackVisibilityChanges Flag set by the application to decide whether the {sap.ui.vk.ViewStateManager} should track the visibility changes or not.
	 * @param {boolean} canTrackVisibilityChanges Flag which indicates if the current content resource can track visibility changes.
	 * @returns {sap.ui.vk.ViewStateManager} The newly created ViewStateManager object.
	 * @public
	 */
	GraphicsCore.prototype.createViewStateManager = function(nodeHierarchy, shouldTrackVisibilityChanges, canTrackVisibilityChanges) {
		var viewStateManager = new ViewStateManager(nodeHierarchy, shouldTrackVisibilityChanges, canTrackVisibilityChanges);
		this._viewStateManagers.push(viewStateManager);
		return viewStateManager;
	};

	/**
	 * Destroys the ViewStateManager object created with the {@link #createViewStateManager createViewStateManager} method.
	 *
	 * @param {sap.ui.vk.ViewStateManager} viewStateManager The ViewStateManagerObject to destroy.
	 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
	 * @public
	 */
	GraphicsCore.prototype.destroyViewStateManager = function(viewStateManager) {
		var index = this._viewStateManagers.indexOf(viewStateManager);
		if (index >= 0) {
			this._viewStateManagers.splice(index, 1)[0].destroy();
		}
		return this;
	};

	// END: View State Manager related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Utility methods.

	/**
	 * Shows or hides debug information in the viewports.
	 *
	 * @param {boolean} enable <code>true</code> to show debug information, <code>false</code> to hide debug information.
	 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
	 * @public
	 * @experimental since version 1.32.0. The behavior might change in the next version.
	 */
	GraphicsCore.prototype.showDebugInfo = function(enable) {
		this._viewports.forEach(function(viewport) {
			viewport.setShowDebugInfo(enable);
		});
		return this;
	};

	/**
	 * Gets one of APIs supported by the DVL library.
	 *
	 * @param {sap.ui.vk.GraphicsCoreApi} apiId The API identifier.
	 * @returns {object} The object that implements the requested API or null if the API is not supported.
	 * @public
	 * @experimental since version 1.32.0. The behavior might change in the next version.
	 */
	GraphicsCore.prototype.getApi = function(apiId) {
		switch (apiId) {
			case sap.ui.vk.GraphicsCoreApi.LegacyDvl:
				return this._dvl;
			default:
				return null;
		}
	};

	/**
	 * Collects and destroys unused objects and resources.
	 *
	 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
	 * @public
	 * @experimental since version 1.34.1. The behavior might change in the next version.
	 */
	GraphicsCore.prototype.collectGarbage = function() {
		this._cleanupDvlSceneData();
		this._cleanupSourceData();
		return this;
	};

	// END: Utility methods.
	////////////////////////////////////////////////////////////////////////

	GraphicsCore.prototype._onlocalizationChanged = function(event) {
		if (event.getParameter("changes").language) {
			sap.ui.vk.dvl.checkResult(this._dvl.Core.SetLocale(sap.ui.getCore().getConfiguration().getLanguageTag()));
		}
	};

	/**
	 * Sets an object that decrypts content of encrypted models.
	 *
	 * @param {sap.ui.vk.DecryptionHandler} handler An object that decrypts content of encrypted models.
	 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
	 * @public
	 */
	GraphicsCore.prototype.setDecryptionHandler = function(handler) {
		this._dvl.Client.setDecryptionHandler(handler);
		return this;
	};

	/**
	 * Gets an object that decrypts content of encrypted models.
	 *
	 * @return {sap.ui.vk.DecryptionHandler} An object that decrypts content of encrypted models.
	 * @public
	 */
	GraphicsCore.prototype.getDecryptionHandler = function() {
		return this._dvl.Client.getDecryptionHandler();
	};

	/**
	 * @interface Contract for objects that implement decryption.
	 *
	 * An interface for an object provided by an application to decrypt content of encrypted models.
	 *
	 * Content is encrypted with the {@link https://en.wikipedia.org/wiki/Advanced_Encryption_Standard AES128} algorithm
	 * in the {@link https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_.28CBC.29 CBC} mode.
	 *
	 * A key is derived with the {@link https://en.wikipedia.org/wiki/PBKDF2 PBKDF2} algorithm by applying the
	 * {@link https://en.wikipedia.org/wiki/Hash-based_message_authentication_code HMAC}-{@link https://en.wikipedia.org/wiki/SHA-2 SHA256}
	 * function 10,000 times.
	 *
	 * @example <caption>A sample implementation and usage of the sap.ui.vk.DecryptionHandler interface with the {@link https://github.com/vibornoff/asmcrypto.js asmCrypto} library.</caption>
	 *
	 *   ...
	 *   <script src="http://vibornoff.com/asmcrypto.js"></script>
	 *   ...
	 *   var decryptionHandler = {
	 *       deriveKey: function(salt, password) {
	 *           try {
	 *               return asmCrypto.PBKDF2_HMAC_SHA256.bytes(password, salt, 10000, 16);
	 *           } catch (ex) {
	 *               return null;
	 *           }
	 *       },
	 *       decrypt: function(key, iv, input) {
	 *           try {
	 *               return asmCrypto.AES_CBC.decrypt(input, key, true, iv);
	 *           } catch (ex) {
	 *               return null;
	 *           }
	 *       }
	 *   };
	 *   ...
	 *   var viewer = new sap.ui.vk.Viewer();
	 *   viewer.setDecryptionHandler(decryptionHandler);
	 *   var contentResource = new sap.ui.vk.ContentResource({
	 *       source: "http://my-web-server.com/my-encrypted-model.vds",
	 *       sourceType: "vds",
	 *       sourceId: "abc",
	 *       password: "abracadabra"
	 *   });
	 *   viewer.addContentResource(contentResource);
	 *
	 * @name sap.ui.vk.DecryptionHandler
	 * @public
	 */

	/**
	 * Generates a cryptographic session key derived from a base data value.
	 *
	 * The key must be derived with the {@link https://en.wikipedia.org/wiki/PBKDF2 PBKDF2} algorithm by applying the
	 * {@link https://en.wikipedia.org/wiki/Hash-based_message_authentication_code HMAC}-{@link https://en.wikipedia.org/wiki/SHA-2 SHA256}
	 * function 10,000 times.
	 *
	 * The resulting 128-bit key should be passed to subseqeunt calls to {@link sap.ui.vk.DecryptionHandler#decrypt sap.ui.vk.DecryptionHandler.decrypt}.
	 *
	 * @name sap.ui.vk.DecryptionHandler.prototype.deriveKey
	 * @function
	 * @param {Uint8Array} salt Random data that is used as an additional input to a one-way function that "hashes" a password or passphrase.
	 * @param {Uint8Array} password A password used for encryption/decryption.
	 * @return {object} A derived 128-bit key that should be passed to subsequent calls to {@link sap.ui.vk.DecryptionHandler#decrypt sap.ui.vk.DecryptionHandler.decrypt}.
	 * @public
	 */

	/**
	 * Decrypts the input buffer with the {@link https://en.wikipedia.org/wiki/Advanced_Encryption_Standard AES128} algorithm
	 * in the {@link https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_.28CBC.29 CBC} mode.
	 *
	 * @name sap.ui.vk.DecryptionHandler.prototype.decrypt
	 * @function
	 * @param {object} key The derived key generated by the previous call to {@link sap.ui.vk.DecryptionHandler#deriveKey sap.ui.vk.DecryptionHandler.deriveKey}.
	 * @param {Uint8Array} iv The 128-bit {@link https://en.wikipedia.org/wiki/Initialization_vector initialization vector}.
	 * @param {Uint8Array} encryptedData The encrypted buffer.
	 * @return {Uint8Array} The decrypted buffer.
	 * @public
	 */

	return GraphicsCore;
});
