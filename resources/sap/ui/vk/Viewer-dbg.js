/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
/* global File */
// Provides control sap.ui.vk.Viewer.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/core/Control", "./Scene", "./ContentResource", "sap/ui/layout/Splitter", "sap/ui/layout/SplitterLayoutData",
	"./FlexibleControl", "./FlexibleControlLayoutData", "sap/ui/core/ResizeHandler", "./DvlException", "./Messages", "./ProgressIndicator", "./Notifications"
], function(jQuery, library, Control, Scene, ContentResource, Splitter, SplitterLayoutData,
	FlexibleControl, FlexibleControlLayoutData, ResizeHandler, DvlException, Messages, ProgressIndicator, Notifications) {

	"use strict";

	var log = jQuery.sap.log;

	sap.ui.lazyRequire("sap.ui.vk.NativeViewport");
	sap.ui.lazyRequire("sap.ui.vk.Overlay");
	sap.ui.lazyRequire("sap.ui.vk.SceneTree");
	sap.ui.lazyRequire("sap.ui.vk.StepNavigation");
	sap.ui.lazyRequire("sap.ui.vk.Toolbar");
	sap.ui.lazyRequire("sap.ui.vk.Viewport");

	/**
	 * Constructor for a new Viewer. Besides the settings documented below, Viewer itself supports the following special settings:
	 * <ul>
	 *   <li>
	 *     <code>runtimeSettings</code>: <i><code>object</code></i> Optional Emscripten runtime module settings. A JSON object with the
	 *     following properties:
	 *     <ul>
	 *       <li><code>totalMemory</code>: <i><code>int</code></i> (default: 128 * 1024 * 1024) size of Emscripten module memory in bytes.</li>
	 *       <li><code>logElementId</code>: <i><code>string</code></i> ID of a textarea DOM element to write the log to.</li>
	 *       <li><code>statusElementId</code>: <i><code>string</code></i> ID of a DOM element to write the status messages to.</li>
	 *     </ul>
	 *   </li>
	 *   <li>
	 *     <code>webGLContextAttributes</code>: <i><code>object</code></i> Optional WebGL context attributes. A JSON object with the following
	 *     boolean properties:
	 *     <ul>
	 *       <li><code>antialias</code>: <i><code>boolean</code></i> (default: <code>true</code>) If set to <code>true</code>, the context
	 *         will attempt to perform antialiased rendering if possible.</li>
	 *       <li><code>alpha</code>: <i><code>boolean</code></i> (default: <code>true</code>) If set to <code>true</code>, the context will
	 *         have an alpha (transparency) channel.</li>
	 *       <li><code>premultipliedAlpha</code>: <i><code>boolean</code></i> (default: <code>false</code>) If set to <code>true</code>, the
	 *         color channels in the framebuffer will be stored premultiplied by the alpha channel to improve performance.</li>
	 *     </ul>
	 *     Other {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes} are also supported.
	 *   </li>
	 * </ul>
	 *
	 * @class Provides simple 3D visualization capability by connecting, configuring and presenting the essential Visualization Toolkit controls a single composite control.
	 * @param {string} [sId] ID for the new Viewer control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new Viewer control
	 * @public
	 * @author SAP SE
	 * @version 1.46.0
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.Viewer
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Viewer = Control.extend("sap.ui.vk.Viewer", /** @lends sap.ui.vk.Viewer.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			properties: {
				/**
				 * Enables or disables the Overlay control
				 */
				enableOverlay: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Disables the scene tree control Button on the menu
				 */
				enableSceneTree: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Shows or hides the scene tree control
				 */
				showSceneTree: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Disables the Step Navigation Control Button on the menu
				 */
				enableStepNavigation: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Disables the Message Popover Control
				 */
				enableNotifications: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Shows or hides the Step Navigation Control
				 */
				showStepNavigation: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Shows or hides the Step Navigation thumbnails
				 */
				showStepNavigationThumbnails: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Shows or hides Toolbar control
				 */
				enableToolbar: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Enable / disable full screen mode
				 */
				enableFullScreen: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Enable / disable progress indicator for downloading and rendering VDS files
				 */
				enableProgressIndicator: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Width of the Viewer control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				/**
				 * Height of the Viewer control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				/**
				 * The toolbar title
				 */
				toolbarTitle: {
					type: "string",
					defaultValue: ""
				},
				/**
				 * Whether or not we want ViewStateManager to keep track of visibility changes.
				 */
				shouldTrackVisibilityChanges: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Optional Emscripten runtime module settings. A JSON object with the following properties:
				 * <ul>
				 * <li>totalMemory {int} size of Emscripten module memory in bytes, default value: 128 MB.</li>
				 * <li>logElementId {string} ID of a textarea DOM element to write the log to.</li>
				 * <li>statusElementId {string} ID of a DOM element to write the status messages to.</li>
				 * </ul>
				 * Emscripten runtime module settings cannot be changed after the control is fully initialized.
				 */
				runtimeSettings: {
					type: "object"
				},

				/**
				 * Optional WebGL context attributes. A JSON object with the following boolean properties:
				 * <ul>
				 * <li>antialias {boolean} default value <code>true</code>. If set to <code>true</code>, the context will attempt to perform
				 * antialiased rendering if possible.</li>
				 * <li>alpha {boolean} default value <code>true</code>. If set to <code>true</code>, the context will have an alpha
				 * (transparency) channel.</li>
				 * <li>premultipliedAlpha {boolean} default value <code>false</code>. If set to <code>true</code>, the color channels in the
				 * framebuffer will be stored premultiplied by the alpha channel to improve performance.</li>
				 * </ul>
				 * Other {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes} are also supported. WebGL
				 * context attributes cannot be changed after the control is fully initialized.
				 */
				webGLContextAttributes: {
					type: "object"
				},
				/**
				 * Enables or disables showing of all hotspots
				 */
				showAllHotspots: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Color used for highlighting Smart2D hotspots
				 */
				hotspotColorABGR: {
					type: "int",
					defaultValue: 0xc00000ff
				}
			},

			publicMethods: [
				"getGraphicsCore",
				"getNativeViewport",
				"getScene",
				"getViewport",
				"getViewStateManager"
			],

			aggregations: {
				/**
				 * Content resources to load and display in the Viewer control.
				 */
				contentResources: {
					type: "sap.ui.vk.ContentResource"
				},

				overlay: {
					type: "sap.ui.vk.Overlay",
					multiple: false
				},

				toolbar: {
					type: "sap.ui.vk.Toolbar",
					multiple: false,
					visibility: "hidden"
				},

				progressIndicator: {
					type: "sap.ui.vk.ProgressIndicator",
					multiple: false,
					visibility: "hidden"
				},

				viewport: {
					type: "sap.ui.vk.Viewport",
					multiple: false,
					visibility: "hidden"
				},

				nativeViewport: {
					type: "sap.ui.vk.NativeViewport",
					multiple: false,
					visibility: "hidden"
				},

				stepNavigation: {
					type: "sap.ui.vk.StepNavigation",
					multiple: false,
					visibility: "hidden"
				},

				sceneTree: {
					type: "sap.ui.vk.SceneTree",
					multiple: false,
					visibility: "hidden"
				},

				layout: {
					type: "sap.ui.vk.FlexibleControl",
					multiple: false,
					visibility: "hidden"
				},

				viewStateManager: {
					type: "sap.ui.vk.ViewStateManager",
					multiple: false,
					visibility: "hidden"
				},

				messagePopover: {
					type: "sap.ui.vk.Notifications",
					multiple: false,
					visibility: "hidden"
				}
			},

			events: {
				/**
				 * This event will be fired when any content resource or the contentResources aggregation has been changed and processed.
				 */
				contentResourceChangesProcessed: {},

				/**
				 * This event will be fired when a scene / image has been loaded into the Viewer.
				 */
				sceneLoadingSucceeded: {
					parameters: {
						/**
						 * Returns a reference to the loaded Scene.
						 */
						scene: {
							type: "sap.ui.vk.Scene"
						}
					}
				},

				/**
				 * This event will be fired when a critical error occurs during scene / image loading.
				 */
				sceneLoadingFailed: {
					parameters: {
						/**
						 * Returns an optional object describing the reason of the failure.
						 */
						reason: {
							type: "object"
						}
					}
				},

				/**
				 * This event will be fired when scene / image loaded in Viewer is about to be destroyed.
				 */
				sceneDestroying: {
					parameters: {
						/**
						 * Returns a reference to the scene to be destroyed.
						 */
						scene: {
							type: "sap.ui.vk.Scene"
						}
					}
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
					}
				},

				/**
				 * This event is fired when viewer enters/exits full screen mode.
				 */
				fullScreen: {
					parameters: {
						/**
						 * true: entered full screen; false: exited full screen.
						 */
						isFullScreen: {
							type: "boolean"
						}
					}
				},

				/**
				 * This event will be fired when a URL in a note is clicked.
				 */
				urlClicked: {
					parameters: {
						/**
						 * Returns a node ID of the note that contains the URL.
						 */
						nodeId: "string",
						/**
						 * Returns a URL that was clicked.
						 */
						url: "string"
					}
				},
				/**
				 * This event will be fired when a node is clicked.
				 */
				nodeClicked: {
					parameters: {
						/**
						 * Returns a node ID.
						 */
						nodeId: "string",
						x: "int",
						y: "int"
					}
				}
			}
		}
	});

	Viewer.prototype.applySettings = function(settings) {
		if (settings) {
			this._runtimeSettings = settings.runtimeSettings;
			this._webGLContextAttributes = settings.webGLContextAttributes;
			delete settings.runtimeSettings;
			delete settings.webGLContextAttributes;
		}
		Control.prototype.applySettings.apply(this, arguments);

		// _componentsState stores the default state of the scene tree and step navigation.
		// It also stores the last user interaction such as show/hide.
		// These settings are used to restore states after switching between 2D and 3D.
		this._componentsState = {
			sceneTree: {
				defaultEnable: this.getEnableSceneTree(),
				// shouldBeEnabled refers to certain scenarios when the scene tree should not be dsiplayed (for example Smart2D files)
				shouldBeEnabled: true,
				// saving the last state set by user interaction (turn scene tree ON/OFF)
				userInteractionShow: this.getShowSceneTree()
			},
			stepNavigation: {
				defaultEnable: this.getEnableStepNavigation(),
				userInteractionShow: this.getShowStepNavigation()
			},
			progressIndicator: {
				defaultEnable: this.getEnableProgressIndicator()
			},
			messagePopover: {
				defaultEnable: this.getEnableNotifications()
			}
		};
		// We initialise the viewer with the both scene tree and step navigation disabled.
		this.setEnableSceneTree(false);
		this.setEnableStepNavigation(false);
	};

	Viewer.prototype.init = function() {

		this._messagePopover = new Notifications();
		this.setAggregation("messagePopover", this._messagePopover);

		this._messagePopover.attachAllMessagesCleared(function() {
			this._messagePopover.setVisible(false);
			this._updateLayout();
		}, this);

		this._messagePopover.attachMessageAdded(function() {
			this._messagePopover.setVisible(true);
			this._updateLayout();
		}, this);

		log.debug("sap.ui.vk.Viewer.init() called.");

		if (Control.prototype.init) {
			Control.prototype.init.apply(this);
		}

		this._scheduleContentResourcesUpdateTimerId = null;
		this._resizeListenerId = null;
		this._busyIndicatorCounter = 0;
		this._toolbar = null;
		this._viewport = null;
		this._nativeViewport = null;
		this._redlineDesign = null;
		this._stepNavigation = null;
		this._mainScene = null;
		this._sceneTree = null;
		this._overlayManager = {
			initialized: false,
			changed: false,
			control: null,
			// Event handler for Native Viewport zoom & pan
			onNativeViewportMove: function(event) {
				var oPan = event.getParameter("pan");
				var zoomFactor = event.getParameter("zoom");
				this.control.setPanAndZoom(oPan.x, oPan.y, zoomFactor);
			},
			// Event handler for Viewport zoom
			onViewportZoom: function(event) {
				var zoomFactor = event.getParameter("zoomFactor");
				this.control.setPanAndZoom(0, 0, zoomFactor);
			},
			// Event handler for Viewport pan
			onViewportPan: function(event) {
				var dx = event.getParameter("dx");
				var dy = event.getParameter("dy");
				this.control.setPanAndZoom(dx, dy, 1);
			}
		};
		this._overlayManager.delegate = {
			onAfterRendering: this._onAfterRenderingOverlay.bind(this, this._viewport, this._nativeViewport, this._overlayManager)
		};

		this._updateSizeTimer = 0;
		this._fullScreenToggle = false;

		this._content = new Splitter(this.getId() + "-splitter", {
			orientation: "Horizontal"
		});

		this._stackedViewport = new FlexibleControl({
			width: "100%",
			height: "100%",
			layout: "Stacked"
		});

		this._layout = new FlexibleControl(this.getId() + "-flexibleControl", {
			width: "100%",
			height: "100%",
			layout: "Vertical"
		});

		this._stackedViewport.setLayoutData(new SplitterLayoutData({
			size: "100%",
			minSize: 160,
			resizable: true
		}));

		this._content.addContentArea(this._stackedViewport);
		this.setAggregation("layout", this._layout);

		this.setTooltip(sap.ui.vk.getResourceBundle().getText("VIEWER_TITLE"));

		if (this.getEnableProgressIndicator()) {
			this._createProgressIndicator();
		}
	};

	/**
	 * Destroys the Viewer control. All scenes will be destroyed and all Viewports will be unregistered by the Graphics Core.
	 *
	 * @private
	 */
	Viewer.prototype.exit = function() {
		log.debug("sap.ui.vk.Viewer.exit() called.");

		// Cancel the delayed call if any.
		if (this._scheduleContentResourcesUpdateTimerId) {
			jQuery.sap.clearDelayedCall(this._scheduleContentResourcesUpdateTimerId);
			this._scheduleContentResourcesUpdateTimerId = null;
		}

		if (this._viewport) {
			this._viewport.detachEvent("viewActivated", this._onViewportViewActivated, this);
		}

		// All scenes will be destroyed and all viewports will be unregistered by GraphicsCore.destroy.
		this._setMainScene(null);
		this._toolbar = null;
		this._messagePopover = null;
		this._sceneTree = null;
		this._nativeViewport = null;
		this._stepNavigation = null;
		this._viewport = null;
		this._componentsState = null;
		this._setViewStateManager(null);

		if (this._graphicsCore) {
			this._graphicsCore.destroy();
			this._graphicsCore = null;
		}

		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}

		if (Control.prototype.exit) {
			Control.prototype.exit.apply(this);
		}
	};

	Viewer.prototype._setMainScene = function(scene, canTrackVisibilityChanges) {
		if (scene) {
			if (scene !== this._mainScene) {
				this._mainScene = scene;
				this._showViewport();
				this._viewport.setScene(this._mainScene);
				this._setViewStateManager(this._graphicsCore.createViewStateManager(this._mainScene.getDefaultNodeHierarchy(), this.getShouldTrackVisibilityChanges(), canTrackVisibilityChanges));
				this._viewport.setViewStateManager(this.getViewStateManager());

				// Set the scene tree & step navigation state based on default settings and last user interaction (if any).
				if (this._componentsState.sceneTree.defaultEnable) {
					this._instantiateSceneTree();
					this._sceneTree.setScene(this._mainScene, this.getViewStateManager());
					this.setEnableSceneTree(true);
					if (this._componentsState.sceneTree.userInteractionShow && this._componentsState.sceneTree.shouldBeEnabled) {
						this.setShowSceneTree(true);
						this._sceneTree.setVisible(true);
					} else {
						this.setShowSceneTree(false);
					}
				}
				if (this._componentsState.stepNavigation.defaultEnable) {
					this._instantiateStepNavigation();
					this._stepNavigation.setScene(this._mainScene);
					this.setEnableStepNavigation(true);
					if (this._componentsState.stepNavigation.userInteractionShow) {
						this.setShowStepNavigation(true);
						this._stepNavigation.setVisible(true);
					} else {
						this.setShowStepNavigation(false);
					}
				}
			} else {
				// if we don't recreate the view state manager, we only update the canTrackVisibilityChanges flag
				this.getViewStateManager().setCanTrackVisibilityChanges(canTrackVisibilityChanges);
			}
			if (this._sceneTree) {
				this._sceneTree.refresh();
			}
			if (this._stepNavigation) {
				this._stepNavigation.refresh(scene);
			}
		} else {
			this._mainScene = null;
			this._setViewStateManager(null);
			if (this._viewport) {
				this._viewport.setScene(null);
			}
			if (this._sceneTree) {
				this._sceneTree.setScene(null, null);
			}
			if (this._stepNavigation) {
				this._stepNavigation.setScene(null);
			}
			this.setEnableSceneTree(false);
			this.setEnableStepNavigation(false);
		}
		return this;
	};

	Viewer.prototype._destroyMainScene = function() {
		if (this._mainScene) {
			var scene = this._mainScene;
			this.fireSceneDestroying({
				scene: scene
			});
			this._setMainScene(null);
			this._graphicsCore.destroyScene(scene);
		} else if (this._nativeViewport) {
			this.fireSceneDestroying({
				scene: null
			});
		}
		return this;
	};

	/**
	 * Gets the GraphicsCore object.
	 *
	 * @returns {sap.ui.vk.GraphicsCore} The GraphicsCore object.
	 * @public
	 */
	Viewer.prototype.getGraphicsCore = function() {
		if (!this._graphicsCore) {
			jQuery.sap.require("sap.ui.vk.GraphicsCore");
			this._graphicsCore = new sap.ui.vk.GraphicsCore(this._getRuntimeSettings(), jQuery.extend({
				antialias: true,
				alpha: true,
				premultipliedAlpha: true
			}, this._getWebGLContextAttributes()));

			if (this._deferredDecryptionHandler) {
				// DecryptionHandler was set before GraphicsCore was created.
				this._graphicsCore.setDecryptionHandler(this._deferredDecryptionHandler);
				delete this._deferredDecryptionHandler;
			}
		}
		return this._graphicsCore;
	};

	/**
	 * Gets the Scene currently loaded in the Viewer control.
	 *
	 * @returns {sap.ui.vk.Scene} The scene loaded in the control.
	 * @public
	 */
	Viewer.prototype.getScene = function() {
		return this._mainScene;
	};

	/**
	 * Gets the view state manager object used for handling visibility and selection of nodes.
	 *
	 * @returns {sap.ui.vk.ViewStateManager} The view state manager object.
	 * @public
	 */
	Viewer.prototype.getViewStateManager = function() {
		return this.getAggregation("viewStateManager");
	};

	/**
	 * Sets the view state manager object used for handling visibility and selection of nodes.
	 *
	 * @param {sap.ui.vk.ViewStateManager} viewStateManager The ViewStateManager object.
	 * @returns {sap.ui.vk.Viewer} <code>this</code> to allow method chaining.
	 * @private
	 */
	Viewer.prototype._setViewStateManager = function(viewStateManager) {
		if (!this._graphicsCore) {
			return this;
		}
		if (viewStateManager === this.getViewStateManager()) {
			return this;
		}
		if (this.getViewStateManager()) {
			this._graphicsCore.destroyViewStateManager(this.getViewStateManager());
		}
		this.setAggregation("viewStateManager", viewStateManager, true);
		return this;
	};

	/**
	 * Gets the 3D viewport.
	 *
	 * @returns {sap.ui.vk.Viewport} The 3D viewport.
	 * @public
	 */
	Viewer.prototype.getViewport = function() {
		return this._viewport;
	};

	/**
	 * Gets the 2D viewport used for displaying format natively supported by the browser - 2D images etc.
	 *
	 * @returns {sap.ui.vk.NativeViewport} The 2D viewport.
	 * @public
	 */
	Viewer.prototype.getNativeViewport = function() {
		return this._nativeViewport;
	};

	/**
	 * Gets the RedlineDesign instance used for creating redlining shapes.
	 *
	 * @returns {sap.ui.vk.RedlineDesign} The RedlineDesign instance.
	 * @public
	 */
	Viewer.prototype.getRedlineDesign = function() {
		return this._redlineDesign;
	};

	/**
	 * @return {object} The Emscripten runtime settings.
	 * @private
	 */
	Viewer.prototype._getRuntimeSettings = function() {
		return this._runtimeSettings;
	};

	/**
	 * @returns {object} The webGLContextAttributes property.
	 * @private
	 */
	Viewer.prototype._getWebGLContextAttributes = function() {
		return this._webGLContextAttributes;
	};

	Viewer.prototype.getOverlay = function() {
		// overlay control is not stored in overlay aggregation, since it may be aggregated by the stavked viewport
		// therefore we keep an additional reference in the _overlayManager
		return this._overlayManager.control;
	};

	Viewer.prototype.setEnableOverlay = function(oProperty) {
		if (oProperty !== this.getProperty("enableOverlay")) {
			this.setProperty("enableOverlay", oProperty);
			this._overlayManager.changed = true;
		}
		return this;
	};

	Viewer.prototype.setEnableSceneTree = function(oProperty) {
		this.setProperty("enableSceneTree", oProperty, true);
		if (!oProperty) {
			this.setProperty("showSceneTree", false);
		}
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setEnableNotifications = function(oProperty) {
		this.setProperty("enableNotifications", oProperty, true);
		this._messagePopover.setVisible(false);
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setShowSceneTree = function(oProperty) {
		this.setProperty("showSceneTree", oProperty, true);
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setEnableStepNavigation = function(oProperty) {
		this.setProperty("enableStepNavigation", oProperty, true);
		if (!oProperty) {
			this.setProperty("showStepNavigation", false);
		}
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setShowStepNavigation = function(oProperty) {
		this.setProperty("showStepNavigation", oProperty, true);
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setEnableToolbar = function(oProperty) {
		this.setProperty("enableToolbar", oProperty, true);
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setEnableFullScreen = function(oProperty) {
		// It checks if the current document is in full screen mode
		var isInFullScreenMode = function(document) {
			return document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement;
		};

		this.setProperty("enableFullScreen", oProperty, true);
		this._fullScreenToggle = true;

		// Fullscreen toggle
		var isFullScreenPropertyEnabled = this.getProperty("enableFullScreen");
		var bChanged = false;

		if (isFullScreenPropertyEnabled) {
			if (!isInFullScreenMode(document)) {

				if (!this._fullScreenHandler) {
					this._fullScreenHandler = function(event) {
						if (!isInFullScreenMode(document)) {
							document.removeEventListener("fullscreenchange", this._fullScreenHandler.bind(this));
							document.removeEventListener("mozfullscreenchange", this._fullScreenHandler.bind(this));
							document.removeEventListener("webkitfullscreenchange", this._fullScreenHandler.bind(this));
							document.removeEventListener("MSFullscreenChange", this._fullScreenHandler.bind(this));

							this.removeStyleClass("sapVizKitViewerFullScreen");
							this._updateSize();
							this.fireFullScreen({
								isFullScreen: false
							});
						}
					};

					document.addEventListener("fullscreenchange", this._fullScreenHandler.bind(this));
					document.addEventListener("mozfullscreenchange", this._fullScreenHandler.bind(this));
					document.addEventListener("webkitfullscreenchange", this._fullScreenHandler.bind(this));
					document.addEventListener("MSFullscreenChange", this._fullScreenHandler.bind(this));
				}

				bChanged = true;

				var bodyElement = document.getElementsByTagName("body")[0];
				if (bodyElement.requestFullScreen) {
					bodyElement.requestFullScreen();
				} else if (bodyElement.webkitRequestFullScreen) {
					bodyElement.webkitRequestFullScreen();
				} else if (bodyElement.mozRequestFullScreen) {
					bodyElement.mozRequestFullScreen();
				} else if (bodyElement.msRequestFullscreen) {
					bodyElement.msRequestFullscreen();
				} else {
					bChanged = false;
				}

				if (bChanged) {
					this.addStyleClass("sapVizKitViewerFullScreen");
				}
			}
		} else if (isInFullScreenMode(document)) {
			bChanged = true;

			if (document.cancelFullScreen) {
				document.cancelFullScreen();
			} else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else {
				bChanged = false;
			}

			if (bChanged) {
				this.removeStyleClass("sapVizKitViewerFullScreen");
			}
		}

		if (bChanged) {
			this._updateSize();
			this.fireFullScreen({
				isFullScreen: isFullScreenPropertyEnabled
			});
		}

		return this;
	};

	Viewer.prototype.getShowAllHotspots = function() {
		return this.getViewport() ? this.getViewport().getShowAllHotspots() : this.getProperty("showAllHotspots");
	};

	Viewer.prototype.setShowAllHotspots = function(value) {
		this.setProperty("showAllHotspots", value, true);
		if (this.getViewport()) {
			this.getViewport().setShowAllHotspots(value);
		}
		return this;
	};

	Viewer.prototype.getHotspotColorABGR = function() {
		return this.getViewport() ? this.getViewport().getHotspotColorABGR() : this.getProperty("hotspotColorABGR");
	};

	Viewer.prototype.setHotspotColorABGR = function(value) {
		this.setProperty("hotspotColorABGR", value, true);
		if (this.getViewport()) {
			this.getViewport().setHotspotColorABGR(value);
		}
		return this;
	};

	Viewer.prototype.setRuntimeSettings = function(settings) {
		// runtimeSettings property should not be changeable in other cases than the constructor
		log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT29.summary), Messages.VIT29.code, "sap.ui.vk.Viewer");
	};

	Viewer.prototype.setWebGLContextAttributes = function(options) {
		// webGLContextAttributes property should not be changeable in other cases than the constructor
		log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT30.summary), Messages.VIT30.code, "sap.ui.vk.Viewer");
	};

	Viewer.prototype.invalidate = function(origin) {
		if (origin instanceof ContentResource) {
			this._scheduleContentResourcesUpdate();
			return;
		}
		Control.prototype.invalidate.apply(this, arguments);
	};

	Viewer.prototype._queueContentResourcesUpdateIfNeeded = function(aggregationName) {
		if (aggregationName === "contentResources") {
			this._scheduleContentResourcesUpdate();
			return true;
		}
	};

	Viewer.prototype.addAggregation = function(aggregationName, object, suppressInvalidate) {
		if (this._queueContentResourcesUpdateIfNeeded(aggregationName)) {
			suppressInvalidate = true;
		}
		return Control.prototype.addAggregation.call(this, aggregationName, object, suppressInvalidate);
	};

	Viewer.prototype.insertAggregation = function(aggregationName, object, index, suppressInvalidate) {
		if (this._queueContentResourcesUpdateIfNeeded(aggregationName)) {
			suppressInvalidate = true;
		}
		return Control.prototype.insertAggregation.call(this, aggregationName, object, index, suppressInvalidate);
	};

	Viewer.prototype.removeAggregation = function(aggregationName, object, suppressInvalidate) {
		if (aggregationName === "contentResources") {
			var result = Control.prototype.removeAggregation.call(this, aggregationName, object, true);
			if (result) {
				this._scheduleContentResourcesUpdate();
			}
			return result;
		} else {
			return Control.prototype.removeAggregation.call(this, aggregationName, object, suppressInvalidate);
		}
	};

	Viewer.prototype.removeAllAggregation = function(aggregationName, suppressInvalidate) {
		if (this._queueContentResourcesUpdateIfNeeded(aggregationName)) {
			suppressInvalidate = true;
		}
		return Control.prototype.removeAllAggregation.call(this, aggregationName, suppressInvalidate);
	};

	Viewer.prototype.destroyAggregation = function(aggregationName, suppressInvalidate) {
		if (this._queueContentResourcesUpdateIfNeeded(aggregationName)) {
			suppressInvalidate = true;
		}
		return Control.prototype.destroyAggregation.call(this, aggregationName, suppressInvalidate);
	};

	/*
	 * Schedules an update of the content resource hierarchy.
	 *
	 * @returns {sap.ui.vk.Viewer} <code>this</code> to allow method chaining. @private
	 */
	Viewer.prototype._scheduleContentResourcesUpdate = function() {
		if (!this._scheduleContentResourcesUpdateTimerId) {
			this._scheduleContentResourcesUpdateTimerId = jQuery.sap.delayedCall(0, this, function() {
				// The delayed call is invoked once. Reset the ID to indicate that there is no pending delayed call.
				this._scheduleContentResourcesUpdateTimerId = null;

				var that = this;

				function loadContent3D(contentResources) {
					that.setBusy(true);
					var graphicsCore = that.getGraphicsCore();
					var onDownloadProgress;
					if (that._componentsState.progressIndicator.defaultEnable) {
						that._progressIndicator.reset();
						that._progressIndicator.setNumberOfFiles(contentResources.length);
						that._progressIndicator.setVisible(true);

						graphicsCore._dvl.Client.NotifyFileLoadProgress = function(clientId, currentPercentage) {
							that._progressIndicator.updateRenderStatus(currentPercentage);
							return 1;
						};

						onDownloadProgress = function(data) {
							var fileName = data.getParameter("source");
							var downloaded = data.getParameter("loaded");
							var totalFileSize = data.getParameter("total");
							that._progressIndicator.updateDownloadStatus(fileName, downloaded, totalFileSize);
						};
					}

					graphicsCore.loadContentResourcesAsync(contentResources, function(sourcesFailedToDownload) {
						try {
							if (sourcesFailedToDownload) {
								if (that.getEnableNotifications() === false) {
									that._destroyMainScene();
									that._showNativeViewport();
									var errorLoadingFile = sap.ui.vk.getResourceBundle().getText("VIEWPORT_MESSAGEERRORLOADINGFILE");
									that._nativeViewport.loadFailed(errorLoadingFile);
								}
								log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT13.summary), Messages.VIT13.code, "sap.ui.vk.Viewer");
								that.fireSceneLoadingFailed({ reason: { sourcesFailedToDownload: sourcesFailedToDownload } });
							} else {
								var failureReason;
								var scene = graphicsCore.updateSceneTree(that.getScene(), contentResources, function(reason) {
									failureReason = reason;
								});
								if (scene !== that._mainScene) {
									that._destroyMainScene();
								}

								// checking whether the current content resources are VDS4 files so we know if the View State Manager
								// is able to track the visibility changes
								var canTrackVisibilityChanges = false;
								if (that.getShouldTrackVisibilityChanges()) {
									canTrackVisibilityChanges = !contentResources.some(function(contentResource) {
										var version = contentResource.getSourceProperties().version;
										return version && version.major < 4;
									});
								}

								// each time we load a 3D mode, we have to update the panning ratio of the redline control
								if (that.getRedlineDesign()) {
									that.getRedlineDesign().updatePanningRatio();
								}

								that._setMainScene(scene, canTrackVisibilityChanges);

								// Every time we load content resources into the graphics core,
								// we check if the Overlay is enabled. The other condition is that the
								// Viewport is a 2D viewport (2D VDS files)
								if (that.getEnableOverlay() && that.getViewport()._is2D) {
									that._overlayManager.changed = true;
									that._showOverlay();
								}
								if (scene) {
									that.fireSceneLoadingSucceeded({
										scene: scene
									});
								} else {
									that.fireSceneLoadingFailed({
										reason: failureReason
									});
								}
							}
						} catch (e) {
							var details = sap.ui.vk.getResourceBundle().getText(Messages.VIT14.summary);
							if (e instanceof DvlException) {
								details += "\ncode: " + e.code + ", message: " + e.message;
							} else if (e instanceof Error) {
								details += "\nmessage: " + e.message;
							} else {
								details += "\n" + e.toString();
							}
							log.error(details, Messages.VIT14.code, "sap.ui.vk.Viewer");
							that._destroyMainScene();
							that.fireSceneLoadingFailed({
								reason: {
									error: e,
									errorMessage: details
								}
							});
						} finally {
							that.fireContentResourceChangesProcessed();
							that.setBusy(false);
							that._progressIndicator.setVisible(false);
						}
					}, onDownloadProgress);
				}

				function loadContent2D(contentResources) {
					function onImageLoadingSucceeded() {
						if (that.getEnableOverlay()) {
							that._overlayManager.changed = true;
							that._showOverlay();
						}
						that.fireSceneLoadingSucceeded({
							scene: null
						});
						that.fireContentResourceChangesProcessed();
					}

					function onImageLoadingFailed() {
						that.fireSceneLoadingFailed();
						that.fireContentResourceChangesProcessed();
						if (that.getEnableNotifications() === false) {
							var errorLoadingFile = sap.ui.vk.getResourceBundle().getText("VIEWPORT_MESSAGEERRORLOADINGFILE");
							that._nativeViewport.loadFailed(errorLoadingFile);
						}
					}

					that._destroyMainScene();

					if (contentResources.length === 1) {
						that._showNativeViewport();
						var resource = contentResources[0];
						var source = resource.getSource();
						if (source instanceof File) {
							var fileReader = new FileReader();
							fileReader.onload = function(event) {
								that._nativeViewport.loadUrl(fileReader.result, onImageLoadingSucceeded, onImageLoadingFailed, null, resource.getSourceType());
							};
							fileReader.readAsDataURL(source);
						} else {
							that._nativeViewport.loadUrl(source, onImageLoadingSucceeded, onImageLoadingFailed, null, resource.getSourceType());
						}
					} else {
						log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT15.summary), Messages.VIT15.code, "sap.ui.vk.Viewer");
						that.fireContentResourceChangesProcessed();
					}
				}

				var needToDestroyScene = true;
				var category;
				var categories;
				var contentResources = this.getContentResources();

				if (contentResources.length > 0) {
					// Find the category of content resources. Valid ones are 3D and 2D.
					categories = ContentResource.collectCategories(contentResources);
					if (categories.length === 0) {
						// Pure grouping content resources.
						if (this._viewport && this._viewport.getVisible()) {
							// All content resources have no sourceType. If the 3D viewport is visible
							// we assume that the content resources are 3D and we do not hide the 3D viewport;
							category = sap.ui.vk.ContentResourceSourceCategory["3D"];
							needToDestroyScene = false;
						} else if (this._nativeViewport && this._nativeViewport.getVisible()) {
							// All content resources have no sourceType. If the 2D viewport is visible
							// we assume that the content resources are 2D and we do not hide the 2D viewport;
							category = sap.ui.vk.ContentResourceSourceCategory["2D"];
							needToDestroyScene = false;
						}
					} else if (categories.length === 1) {
						category = categories[0];
						if (category === "unknown") {
							log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT16.summary), Messages.VIT16.code, "sap.ui.vk.Viewer");
							if (this._nativeViewport == null) {
								this._showNativeViewport();
							}
							if (this.getEnableNotifications() === false) {
								this._nativeViewport.loadFailed();
							}
							this._showNativeViewport(false);
						} else {
							needToDestroyScene = false;
						}
					} else if (categories.length > 1) {
						log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT17.summary), Messages.VIT17.code, "sap.ui.vk.Viewer");
					}
				}

				if (needToDestroyScene) {
					this._destroyMainScene();
					this.fireContentResourceChangesProcessed();
					return;
				}

				if (category === sap.ui.vk.ContentResourceSourceCategory["3D"]) {
					loadContent3D(contentResources);
				} else if (category === sap.ui.vk.ContentResourceSourceCategory["2D"]) {
					loadContent2D(contentResources);
				}
			});
		}
		return this;
	};

	Viewer.prototype.onBeforeRendering = function() {
		if (this._fullScreenToggle) {
			this._fullScreenToggle = false;
		} else {
			this._showToolbar();
		}
		this._showOverlay();

		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}
	};

	Viewer.prototype.onAfterRendering = function() {
		var domRef = this.getDomRef();
		this._resizeListenerId = ResizeHandler.register(this, this._handleResize.bind(this));
		this._handleResize({
			size: {
				width: domRef.clientWidth,
				height: domRef.clientHeight
			}
		});
	};

	/**
	 * Handles the resize events from the {@link sap.ui.core.ResizeHandler ResizeHandler} object.
	 *
	 * @param {jQuery.Event} event The event object.
	 * @private
	 */
	Viewer.prototype._handleResize = function(event) {
		this._updateSize();

		if (this.getRedlineDesign()) {
			var x = this.getRedlineDesign().exportJSON();
			this.getRedlineDesign().removeAllRedlineElements();

			jQuery.sap.delayedCall(200, this, function() {
				var virtualViewportSize;
				if (this.getViewport() && this.getViewport().getVisible()) {
					virtualViewportSize = this.getViewport().getOutputSize();
				} else if (this.getNativeViewport() && this.getNativeViewport().getVisible()) {
					virtualViewportSize = this.getNativeViewport().getOutputSize();
				}
				this.getRedlineDesign().setProperty("virtualLeft", virtualViewportSize.left, true);
				this.getRedlineDesign().setProperty("virtualTop", virtualViewportSize.top, true);
				this.getRedlineDesign().setProperty("virtualSideLength", virtualViewportSize.sideLength, true);
				this.getRedlineDesign().invalidate();

				this.getRedlineDesign().importJSON(x);
			});
		}
	};

	Viewer.prototype._updateSize = function() {
		if (this._updateSizeTimer) {
			clearTimeout(this._updateSizeTimer);
		}
		this._updateSizeTimer = setTimeout(this._doUpdateSize.bind(this), 100);
	};

	Viewer.prototype._doUpdateSize = function() {
		var flexId = this.getId() + "-flexibleControl";
		var layout = document.getElementById(flexId);

		if (!layout) {
			return;
		}

		layout.style.width = "100%";
		layout.style.height = "100%";

		var height = layout.clientHeight;

		var subheight = [];

		for (var i = 0; i < 4; i++) {
			subheight[i] = document.getElementById(flexId + "Content_" + i);
		}

		height -= subheight[0].clientHeight;

		for (var j = 2; j < 4; j++) {
			if (subheight[j] != null && subheight[j].style.visibility != "hidden") {
				height -= subheight[j].clientHeight;
			}
		}

		if (subheight[1]) {
			subheight[1].style.height = height + "px";
		}

		if (this._stackedViewport) {
			this._stackedViewport.setLayoutData(new SplitterLayoutData({
				minSize: 160,
				resizable: true
			}));
		}
	};

	Viewer.prototype.isTreeBinding = function(name) {
		return name === "contentResources";
	};

	Viewer.prototype.setBusy = function(busy) {
		if (busy) {
			if (this._busyIndicatorCounter === 0) {
				this.setBusyIndicatorDelay(0);
				Control.prototype.setBusy.call(this, true);
			}
			this._busyIndicatorCounter += 1;
		} else {
			this._busyIndicatorCounter -= 1;
			if (this._busyIndicatorCounter == 0) {
				Control.prototype.setBusy.call(this, false);
			}
		}
	};

	Viewer.prototype._showToolbar = function() {
		if (!this._toolbar) {
			this._toolbar = new sap.ui.vk.Toolbar({
				title: this.getToolbarTitle()
			});
			this._toolbar.setViewer(this);
			this.setAggregation("toolbar", this._toolbar);
		}
		this._toolbar.setVisible(this.getEnableToolbar());
		this._updateLayout();
		return this;
	};


	Viewer.prototype._createProgressIndicator = function() {
		if (!this._progressIndicator) {
			this._progressIndicator = new ProgressIndicator({
				visible: false
			});
			this.setAggregation("progressIndicator", this._progressIndicator);
		} else {
			this._progressIndicator.reset();
		}
	};

	Viewer.prototype._updateLayout = function() {
		this._layout.setWidth(this.getWidth());
		this._layout.removeAllContent();
		this._layout.setHeight(this.getHeight());

		var height = this.getHeight();
		var contentHeight = [
			0, 0, 0
		];

		if (height == "auto") {
			height = 400;
		} else if (height.substr(height.length - 1) == "%") {
			height = 400;
		} else {
			height = parseInt(height, 10);
		}

		if (this._toolbar != null && this.getEnableToolbar()) {
			contentHeight[0] = 48;
		}
		if (this._stepNavigation != null && this.getShowStepNavigation()) {
			contentHeight[2] = 150;
		}

		contentHeight[1] = height - contentHeight[0] - contentHeight[2];

		if (this._toolbar != null && this.getEnableToolbar()) {
			this._toolbar.setVisible(true);
			this._toolbar.setLayoutData(new FlexibleControlLayoutData({
				size: contentHeight[0] + "px"
			}));
			this._layout.insertContent(this._toolbar, 0);
		} else if (this._toolbar != null) {
			this._toolbar.setVisible(false);
		}

		if (this._sceneTree != null && this.getShowSceneTree() && this.getEnableSceneTree()) {
			this._sceneTree.setVisible(true);
			this._sceneTree.setLayoutData(new SplitterLayoutData({
				size: "320px",
				minSize: 200,
				resizable: true
			}));
			this._content.insertContentArea(this._sceneTree, 0);
		} else if (this._sceneTree != null) {
			this._content.removeContentArea(this._sceneTree);
			this._sceneTree.setVisible(false);
		}
		this._content.setLayoutData(new FlexibleControlLayoutData({
			size: contentHeight[1] + "px"
		}));
		this._layout.addContent(this._content);

		if (this._messagePopover != null) {
			contentHeight[1] -= contentHeight[0]; // since MsgPopover = height of toolbar (48px)
		}

		if (this._stepNavigation != null && this.getShowStepNavigation() && this.getEnableStepNavigation()) {
			if (this._graphicsCore != null && !this._stepNavigation.hasGraphicsCore()) {
				this._stepNavigation.setGraphicsCore(this._graphicsCore);
			}
			this._stepNavigation.setLayoutData(new FlexibleControlLayoutData({
				size: contentHeight[2] + "px"
			}));
			this._layout.addContent(this._stepNavigation);
		}

		if (this._messagePopover !== null && this._messagePopover.getAggregation("_messagePopover").getItems().length > 0 && this.getEnableNotifications()) {
			this._messagePopover.setVisible(true);
			this._messagePopover.setLayoutData(new FlexibleControlLayoutData({
				size: contentHeight[0] + "px"
			}));
			this._layout.addContent(this._messagePopover);
		} else {
			this._content.removeContentArea(this._messagePopover);
			this._messagePopover.setVisible(false);
		}

		if (this._toolbar) {
			this._toolbar.refresh();
		}
		this._updateSize();
	};

	Viewer.prototype._instantiateSceneTree = function() {
		if (!this._sceneTree) {
			this._sceneTree = new sap.ui.vk.SceneTree();
			this.setAggregation("sceneTree", this._sceneTree);
		}
		return this;
	};

	Viewer.prototype._instantiateStepNavigation = function() {
		if (!this._stepNavigation) {
			this._stepNavigation = new sap.ui.vk.StepNavigation(this.getId() + "-stepNavigation", {
				showThumbnails: this.getShowStepNavigationThumbnails()
			});
			this.setAggregation("stepNavigation", this._stepNavigation);
		}
		return this;
	};

	Viewer.prototype._showViewport = function() {
		if (!this._viewport) {
			this._viewport = new sap.ui.vk.Viewport(this.getId() + "-viewport", {
				showAllHotspots: this.getShowAllHotspots(),
				hotspotColorABGR: this.getHotspotColorABGR()
			});
			this.setAggregation("viewport", this._viewport);
			this._viewport.attachEvent("viewActivated", this._onViewportViewActivated, this);
			this._viewport.setGraphicsCore(this.getGraphicsCore());
		}

		if (this._nativeViewport) {
			this._nativeViewport.setVisible(false);
		}
		this._stackedViewport.removeAllContent();
		this._stackedViewport.addContent(this._viewport);
		this._viewport.setVisible(true);

		return this;
	};

	Viewer.prototype._showNativeViewport = function() {
		if (!this._nativeViewport) {
			this._nativeViewport = new sap.ui.vk.NativeViewport(this.getId() + "-nativeViewport", {
				limitZoomOut: true
			});
			this.setAggregation("nativeViewport", this._nativeViewport);
		}

		if (this._viewport) {
			this._viewport.setVisible(false);
		}
		this._stackedViewport.removeAllContent();
		this._stackedViewport.addContent(this._nativeViewport);
		this._nativeViewport.setVisible(true);

		return this;
	};

	Viewer.prototype._showOverlay = function() {
		var oOverlayManager = this._overlayManager;
		if (oOverlayManager.changed) {
			var oOverlay;
			if (this.getEnableOverlay()) {
				if (!oOverlayManager.initialized) {
					// overlay not yet initialized -> check if overlay is given
					if (!(oOverlay = this.getAggregation("overlay"))) {
						// no Overlay control given -> create one
						oOverlay = new sap.ui.vk.Overlay();
					}
					oOverlay.setZoomOnResize(false);
					oOverlayManager.control = oOverlay;
					oOverlayManager.initialized = true;
				} else {
					oOverlay = oOverlayManager.control;
					oOverlay.reset();
				}
				// The Overlay needs to be appended to either Viewport or Native Viewport
				// so we check which one is active.
				if (this._nativeViewport && this._nativeViewport.getVisible()) {
					oOverlay.setTarget(this._nativeViewport);
					// set zoom restriction
					oOverlayManager.savedLimitZoomOutState = this._nativeViewport.getLimitZoomOut();
					this._nativeViewport.setLimitZoomOut(true);
					// register move event of native Viewport to adapt pan and zoom state
					this._nativeViewport.attachEvent("move", oOverlayManager.onNativeViewportMove, oOverlayManager);
				} else if (this._viewport && this._viewport.getVisible()) {
					oOverlay.setTarget(this._viewport);
					oOverlayManager.savedLimitZoomOutState = false;
					// Capturing the Viewport zooming and panning events so we can pass them
					// through to the Overlay so it can zoom and pan the overlay areas (hotspots).
					this._viewport.attachEvent("zoom", oOverlayManager.onViewportZoom, oOverlayManager);
					this._viewport.attachEvent("pan", oOverlayManager.onViewportPan, oOverlayManager);
				}

				// add Overlay to stacked Viewport
				this._stackedViewport.addContent(oOverlay);
				this._stackedViewport.addDelegate(oOverlayManager.delegate);
			} else {
				// de-register move event of native Viewport to adapt pan and zoom state
				this._nativeViewport.detachEvent("move", oOverlayManager.onNativeViewportMove, oOverlayManager);
				// remove Overlay from stacked Viewport
				this._stackedViewport.removeDelegate(oOverlayManager.delegate);
				this._stackedViewport.removeContent(oOverlayManager.control);
				// remove zoom restriction
				this._nativeViewport.setLimitZoomOut(oOverlayManager.savedLimitZoomOutState);
			}
			oOverlayManager.changed = false;
		}
	};

	Viewer.prototype._onAfterRenderingOverlay = function(oEvent) {
		// manipulate DOM tree after rendering of stacked viewport
		var overlayDiv = this._overlayManager.control.getDomRef();

		if (overlayDiv && (this._nativeViewport || this._viewport)) {
			// viewportToAppend is the domRef to either viewport or nativeViewport
			var viewportToAppend = this._nativeViewport && this._nativeViewport.getVisible() ? this._nativeViewport.getDomRef() : this._viewport.getDomRef();

			if (overlayDiv.parentNode !== viewportToAppend) {
				// Do not display the content div the overlay belongs to;
				// otherwise it would receive all events we expect on the overlay
				overlayDiv.parentNode.style.display = "none";
			}
			// make overlay a child of viewport/nativeViewport to get event bubbling right
			viewportToAppend.appendChild(overlayDiv);
			// adapt overlay size to parent node
			overlayDiv.style.width = "100%";
			overlayDiv.style.height = "100%";
		}
	};

	/**
	 * Sets an object that decrypts content of encrypted models.
	 *
	 * @param {sap.ui.vk.DecryptionHandler} handler An object that decrypts content of encrypted models.
	 * @return {sap.ui.vk.Viewer} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewer.prototype.setDecryptionHandler = function(handler) {
		if (this._graphicsCore) {
			this._graphicsCore.setDecryptionHandler(handler);
		} else {
			// If GraphicsCore is not created yet, store the value for later assignment.
			this._deferredDecryptionHandler = handler;
		}
		return this;
	};

	/**
	 * Gets an object that decrypts content of encrypted models.
	 *
	 * @return {sap.ui.vk.DecryptionHandler} An object that decrypts content of encrypted models.
	 * @public
	 */
	Viewer.prototype.getDecryptionHandler = function() {
		return this._graphicsCore ? this._graphicsCore.getDecryptionHandler() : this._deferredDecryptionHandler;
	};

	/*
	 * It creates a new instance of {sap.ui.vk.RedlineDesign}.
	 * @returns {sap.ui.vk.Viewer} <code>this</code> to allow method chaining.
	 * @private
	 */
	Viewer.prototype._instantiateRedlineDesign = function(redlineElements) {

		// if either Viewport/NativeViewport exist and are visible, we instantiate RedlineDesign
		if ((this.getViewport() && this.getViewport().getVisible()) || (this.getNativeViewport() && this.getNativeViewport().getVisible())) {
			jQuery.sap.require("sap.ui.vk.RedlineDesign");
			var activeViewport = this.getViewport() && this.getViewport().getVisible() ? this.getViewport() : this.getNativeViewport();
			var virtualViewportSize = activeViewport.getOutputSize();

			this._redlineDesign = new sap.ui.vk.RedlineDesign({
				visible: false,
				virtualTop: virtualViewportSize.top,
				virtualLeft: virtualViewportSize.left,
				virtualSideLength: virtualViewportSize.sideLength,
				redlineElements: redlineElements
			});
		}
		return this;
	};

	/*
	 * Activates the redline design control.
	 * @param {sap.ui.vk.RedlineElement | sap.ui.vk.RedlineElement[]} The redline element/elements which will be rendered
	 * as soon as the redline design control is activated.
	 * @returns {sap.ui.vk.Viewer} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewer.prototype.activateRedlineDesign = function(redlineElements) {
		redlineElements = redlineElements || [];
		this._instantiateRedlineDesign(redlineElements);
		// placing the RedlineDesign inside the _stackedViewport
		this.getRedlineDesign().placeAt(this._stackedViewport);
		this.getRedlineDesign().setVisible(true);

		var onRedlineDesignPanViewport = function(event) {
			var deltaX = event.getParameter("deltaX"),
				deltaY = event.getParameter("deltaY");
			this.getViewport().queueCommand(function(deltaX, deltaY) {
				this.getViewport().pan(deltaX, deltaY);
				this.getViewport().endGesture();
			}.bind(this, deltaX, deltaY));
		};

		var onRedlineDesignZoomViewport = function(event) {
			var originX = event.getParameter("originX"),
				originY = event.getParameter("originY"),
				zoomFactor = event.getParameter("zoomFactor");
			this.getViewport().queueCommand(function(originX, originY, zoomFactor) {
				this.getViewport().beginGesture(originX, originY);
				this.getViewport().zoom(zoomFactor);
				this.getViewport().endGesture();
			}.bind(this, originX, originY, zoomFactor));
		};

		var onRedlineDesignPanNativeViewport = function(event) {
			var deltaX = event.getParameter("deltaX"),
				deltaY = event.getParameter("deltaY");

			this.getNativeViewport().queueCommand(function() {
				this.getNativeViewport().pan(deltaX, deltaY);
				this.getNativeViewport().endGesture();
			}.bind(this));
		};

		var onRedlineDesignZoomNativeViewport = function(event) {
			var originX = event.getParameter("originX"),
				originY = event.getParameter("originY"),
				zoomFactor = event.getParameter("zoomFactor");

			this.getNativeViewport().queueCommand(function(originX, originY, zoomFactor) {
				this.getNativeViewport().beginGesture(originX, originY);
				this.getNativeViewport().zoom(zoomFactor);
				this.getNativeViewport().endGesture();
			}.bind(this, originX, originY, zoomFactor));
		};

		// Subscribing to the events fired by the RedlineDesign.
		// Everytime the RedlineDesign moves, we receive the new coordinates/zoom level
		// and we use them to update the Viewport/NativeViewport
		if (this.getNativeViewport() && this.getNativeViewport().getVisible()) {
			this.getRedlineDesign().attachEvent("pan", onRedlineDesignPanNativeViewport.bind(this));
			this.getRedlineDesign().attachEvent("zoom", onRedlineDesignZoomNativeViewport.bind(this));
		} else if (this.getViewport() && this.getViewport().getVisible()) {
			this.getRedlineDesign().attachEvent("pan", onRedlineDesignPanViewport.bind(this));
			this.getRedlineDesign().attachEvent("zoom", onRedlineDesignZoomViewport.bind(this));
		}

		return this;
	};

	/*
	 * It destroys the current instance of {sap.ui.vk.RedlineDesign}.
	 * @returns {sap.ui.vk.Viewer} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewer.prototype.destroyRedlineDesign = function() {
		if (this.getRedlineDesign()) {
			this.getRedlineDesign().destroy();
			this._redlineDesign = null;
		}
		return this;
	};

	Viewer.prototype._onViewportViewActivated = function(event) {
		// If it's 3D content, we mark the scene tree as 'usable'.
		// In case of 2D, the scene tree should not be enabled.
		this._componentsState.sceneTree.shouldBeEnabled = event.getParameter("type") === "3D";
	};

	return Viewer;

});
