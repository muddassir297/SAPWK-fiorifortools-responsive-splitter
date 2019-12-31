/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Viewport.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/core/Control", "sap/ui/core/ResizeHandler", "./Loco", "./ViewportHandler", "./Smart2DHandler", "./GraphicsCore", "./Messages"
], function(jQuery, library, Control, ResizeHandler, Loco, ViewportHandler, Smart2DHandler, GraphicsCore, Messages) {
	"use strict";

	// dictionaries for strings
	var dictionary = {
		encodedProjectionType: {},
		decodedProjectionType: {
			perspective: sap.ve.dvl.DVLCAMERAPROJECTION.PERSPECTIVE,
			orthographic: sap.ve.dvl.DVLCAMERAPROJECTION.ORTHOGRAPHIC
		},
		encodedBindingType: {},
		decodedBindingType: {
			minimum: sap.ve.dvl.DVLCAMERAFOVBINDING.MIN,
			maximum: sap.ve.dvl.DVLCAMERAFOVBINDING.MAX,
			horizontal: sap.ve.dvl.DVLCAMERAFOVBINDING.HORZ,
			vertical: sap.ve.dvl.DVLCAMERAFOVBINDING.VERT
		}
	};
	// camera projection type
	dictionary.encodedProjectionType[sap.ve.dvl.DVLCAMERAPROJECTION.PERSPECTIVE] = "perspective";
	dictionary.encodedProjectionType[sap.ve.dvl.DVLCAMERAPROJECTION.ORTHOGRAPHIC] = "orthographic";
	// camera FOVBinding
	dictionary.encodedBindingType[sap.ve.dvl.DVLCAMERAFOVBINDING.MIN] = "minimum";
	dictionary.encodedBindingType[sap.ve.dvl.DVLCAMERAFOVBINDING.MAX] = "maximum";
	dictionary.encodedBindingType[sap.ve.dvl.DVLCAMERAFOVBINDING.HORZ] = "horizontal";
	dictionary.encodedBindingType[sap.ve.dvl.DVLCAMERAFOVBINDING.VERT] = "vertical";

	/**
	 * Constructor for a new Viewport.
	 *
	 * @class
	 * Provides a rendering canvas for the 3D elements of a loaded scene.
	 *
	 * @param {string} [sId] ID for the new Viewport control. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new Viewport control.
	 * @public
	 * @author SAP SE
	 * @version 1.46.0
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.Viewport
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Viewport = Control.extend("sap.ui.vk.Viewport", /** @lends sap.ui.vk.Viewport.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"setGraphicsCore",
				"getGraphicsCore",
				"setScene",
				"setViewStateManager",
				"beginGesture",
				"endGesture",
				"pan",
				"rotate",
				"zoom",
				"tap",
				"hitTest",
				"queueCommand",
				"getViewInfo",
				"setViewInfo"
			],
			properties: {
				/**
				 * Shows or hides the debug info.
				 */
				showDebugInfo: "boolean",
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
				},
				/**
				 * Viewport background top color
				 */
				backgroundColorTopABGR: {
					type: "int",
					defaultValue: 0xff000000 // rgba(0, 0, 0, 1) black
				},
				/**
				 * Viewport background bottom color
				 */
				backgroundColorBottomABGR: {
					type: "int",
					defaultValue: 0xffffffff // rgba (100%, 100%, 100%, 100%) white
				},
				/**
				 * Viewport width
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				},
				/**
				 * Viewport height
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				}
			},
			events: {
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
					},
					enableEventBubbling: true
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
					},
					enableEventBubbling: true
				},
				pan: {
					parameters: {
						dx: "int",
						dy: "int"
					}
				},
				zoom: {
					parameters: {
						zoomFactor: "float"
					}
				},
				resize: {
					parameters: {
						/*
						 * Returns the width and height of new size
						 */
						size: "object"
					}
				},
				/**
				 * This event will be fired when a VDS file has been loaded into the Viewport.
				 */
				viewActivated: {
					parameters: {
						/**
						 * The type of content loaded into the Viewport (for example: 2D, 3D).
						 */
						type: {
							type: "string"
						}
					}
				}
			}
		}
	});

	Viewport.prototype.init = function() {
		if (Control.prototype.init) {
			Control.prototype.init(this);
		}

		this._graphicsCore = null;
		this._dvl = null;
		this._dvlRendererId = null;
		this._canvas = null;
		this._resizeListenerId = null;
		// _is2D indicated whether this is a 2D Viewport or not
		this._is2D = false;

		this._viewportHandler = new ViewportHandler(this);
		this._loco = new Loco();
		this._loco.addHandler(this._viewportHandler);
		this._smart2DHandler = null;

		// we keep track of which was the last played step; this info will be used in getViewInfo/setViewInfo
		this._lastPlayedStep = null;
	};

	Viewport.prototype.exit = function() {
		this._loco.removeHandler(this._viewportHandler);
		this._viewportHandler.destroy();

		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}

		this.setViewStateManager(null);
		this.setScene(null);
		this.setGraphicsCore(null);
		if (Control.prototype.exit) {
			Control.prototype.exit.apply(this);
		}
	};

	/**
	 * Attaches or detaches the Viewport to the {@link sap.ui.vk.GraphicsCore GraphicsCore} object.
	 *
	 * @param {sap.ui.vk.GraphicsCore} graphicsCore The {@link sap.ui.vk.GraphicsCore GraphicsCore} object or <code>null</code>.
	 * If the <code>graphicsCore</code> parameter is not <code>null</code>, a rendering object corresponding to the Viewport is created.
	 * If the <code>graphicsCore</code> parameter is <code>null</code>, the rendering object corresponding to the Viewport is destroyed.
	 * @returns {sap.ui.vk.Viewport} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.setGraphicsCore = function(graphicsCore) {
		if (graphicsCore != this._graphicsCore) {
			if (graphicsCore && this._graphicsCore && this._graphicsCore._getViewportCount() > 0) {
				jQuery.sap.log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT18.summary), Messages.VIT18.code, "sap.ui.vk.Viewport");
			}

			if (this._graphicsCore) {
				if (this._graphicsCore._unregisterViewport(this)) {
					if (this._graphicsCore._getViewportCount() === 0) {
						this._dvl.Core.StopRenderLoop();
					}
				}
			}

			this._dvlRendererId = null;
			this._dvl = null;

			this._graphicsCore = graphicsCore;

			if (this._graphicsCore) {
				var shouldStartRenderLoop = this._graphicsCore._getViewportCount() === 0;
				this._dvl = this._graphicsCore._getDvl();
				this._dvlRendererId = this._dvl.Core.GetRendererPtr();

				this._setCanvas(this._graphicsCore._getCanvas());
				this._graphicsCore._registerViewport(this);
				if (shouldStartRenderLoop) {
					this._dvl.Core.StartRenderLoop();
				}
				this.setShowDebugInfo(this.getShowDebugInfo()); // Synchronise DVL internals with viewport properties.

				this._dvl.Client.attachStepEvent(function(event) {
					if (event.type === sap.ve.dvl.DVLSTEPEVENT.DVLSTEPEVENT_STARTED) {
						this._lastPlayedStep = event.stepId;
					}
				}.bind(this));
			}
		}
		return this;
	};

	/**
	 * Gets the {@link sap.ui.vk.GraphicsCore GraphicsCore} object the Viewport is attached to.
	 * @returns {sap.ui.vk.GraphicsCore} The {@link sap.ui.vk.GraphicsCore GraphicsCore} object the Viewport is attached to, or <code>null</code>.
	 * @public
	 */
	Viewport.prototype.getGraphicsCore = function() {
		return this._graphicsCore;
	};

	/**
	 * Sets the {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement HTMLCanvasElement} element for rendering 3D content.
	 * @param {HTMLCanvasElement} canvas The {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement HTMLCanvasElement} element.
	 * @returns {sap.ui.vk.Viewport} <code>this</code> to allow method chaining.
	 * @private
	 */
	Viewport.prototype._setCanvas = function(canvas) {
		// Invalidate the viewport only when it is already rendered.
		var shouldInvalidate = this.getDomRef() && this._canvas !== canvas;
		this._canvas = canvas;
		if (shouldInvalidate) {
			this.invalidate();
		}
		return this;
	};

	/**
	 * Attaches the scene to the Viewport for rendering.
	 * @param {sap.ui.vk.Scene} scene The scene to attach to the Viewport.
	 * @returns {sap.ui.vk.Viewport} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.setScene = function(scene) {
		if (this._dvlRendererId) {
			this._dvl.Renderer.AttachScene(scene && scene._getDvlSceneId() || null);
			this._dvlSceneId = scene ? scene._getDvlSceneId() : null;
			if (scene) {
				this._dvl.Client.attachUrlClicked(this._fireUrlClicked, this);

				var isSmart2DContent = this._isSmart2DContent() || this._isSmart2DContentLegacy();
				// setting the Viewport background color
				if (isSmart2DContent) {
					// If it's smart 2D, make the viewport background white.
					this._dvl.Renderer.SetBackgroundColor(1, 1, 1, 1, 1, 1, 1, 1);
				} else {
					var topColor = this._getDecomposedABGR(this.getBackgroundColorTopABGR());
					var bottomColor = this._getDecomposedABGR(this.getBackgroundColorBottomABGR());
					this._dvl.Renderer.SetBackgroundColor(topColor.red, topColor.green, topColor.blue, topColor.alpha, bottomColor.red, bottomColor.green, bottomColor.blue, bottomColor.alpha);
				}
				// Firing the 'viewActivated' event. We are notifying the listeners that a 2D/3D models has been loaded.
				this.fireViewActivated({
					type: isSmart2DContent ? "2D" : "3D"
				});
			} else {
				this._dvl.Client.detachUrlClicked(this._fireUrlClicked, this);
				if (this._smart2DHandler) {
					var loco = new Loco();
					loco.removeHandler(this._smart2DHandler);
				}
			}
		}
		return this;
	};

	Viewport.prototype._isSmart2DContent = function() {
		var hotspotNodeIds = sap.ui.vk.dvl.getJSONObject(this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneId, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_HOTSPOTS).ChildNodes);
		// If a model has nodes flagged as hotspots, it means it's a Smart 2D model.
		return hotspotNodeIds && hotspotNodeIds.length > 0;
	};

	Viewport.prototype._isSmart2DContentLegacy = function() {
		var cameraId = this._dvl.Scene.GetCurrentCamera(this._dvlSceneId),
			rotation = this._dvl.Camera.GetRotation(cameraId),
			projection = this._dvl.Camera.GetProjection(cameraId);
		return rotation[0] === 90 && rotation[1] === -90 && rotation[2] === 0 && projection === sap.ve.dvl.DVLCAMERAPROJECTION.ORTHOGRAPHIC;
	};

	Viewport.prototype._initializeSmart2DHandler = function() {

		if (this._viewStateManager) {
			if (this._smart2DHandler) {
				this._loco.removeHandler(this._smart2DHandler);
			}
			this._smart2DHandler = new Smart2DHandler(this, this._viewStateManager);
			this._loco.addHandler(this._smart2DHandler);
		}

		if (this.getShowAllHotspots()) {
			var nodeHierarchy = this._viewStateManager.getNodeHierarchy(),
				hotspotsNodeIds = nodeHierarchy.getHotspotNodeIds();
			this.showHotspots(hotspotsNodeIds, true);
		}
	};

	Viewport.prototype._fireUrlClicked = function(paramaters) {
		this.fireUrlClicked({
			url: paramaters.url,
			nodeId: paramaters.nodeId
		});
	};

	/**
	 * Retrieves the step index and the procedure index that can be used to store different steps since you cannot the save the dynamically generated stepId.
	 * @param {array} procedures The first argument is the procedure array where the search takes place.
	 * @param {string} stepId The second argument is the stepId for which we need to retrieve the step index and procedure index.
	 * @returns {object} An object which has to properties: <code>stepIndex</code> and <code>procedureIndex</code>.
	 * @private
	 */
	Viewport.prototype._getStepAndProcedureIndexes = function(procedures, stepId) {
		var procedureIndex = -1,
			stepIndex = -1,
			isFound = false;

		for (var i = 0; i < procedures.length; i++) {
			if (!isFound) {
				for (var j = 0; j < procedures[i].steps.length; j++) {
					if (procedures[i].steps[j].id === stepId) {
						stepIndex = j;
						procedureIndex = i;
						isFound = true;
						break;
					}
				}
			} else {
				break;
			}
		}

		return {
			stepIndex: stepIndex,
			procedureIndex: procedureIndex
		};
	};

	/**
	 * Retrieves information about the current camera view in the scene, and saves the information in a JSON-like object.
	 * The information can then be used at a later time to restore the scene to the same camera view using the
	 * {@link sap.ui.vk.Viewport#setViewInfo setViewInfo} method.<br/>
	 * @param {object} query Query object which indicates what information to be retrieved by the <i>getViewInfo</i> method.
	 * @returns {object} JSON-like object which holds the current view information.
	 * @public
	 */
	Viewport.prototype.getViewInfo = function(query) {

		var getValidatedQuery = function(queryObject) {
			// validate query object
			var validatedQuery = queryObject === undefined ? {} : jQuery.extend(true, {}, queryObject);

			// validate animation
			validatedQuery.animation = validatedQuery.animation === false ? false : true;

			// validate camera
			// If camera is false, we leave it like this and we don't save any camera related information.
			if (!validatedQuery.camera !== false) {
				validatedQuery.camera = (validatedQuery.camera === undefined || typeof validatedQuery.camera !== "object") ? {} : validatedQuery.camera;
				validatedQuery.camera.position = validatedQuery.position === false ? false : true;
				validatedQuery.camera.rotation = validatedQuery.rotation === false ? false : true;
				validatedQuery.camera.projectionType = validatedQuery.projectionType === false ? false : true;
				validatedQuery.camera.bindingType = validatedQuery.bindingType === false ? false : true;
			}

			// validate visibility
			// Visibility is not saved by default. If it has a falsy value, we make it false.
			// Otherwise, we process it.
			if (!validatedQuery.visibility) {
				validatedQuery.visibility = false;
			} else {
				validatedQuery.visibility = typeof validatedQuery.visibility !== "object" ? {} : validatedQuery.visibility;
				validatedQuery.visibility = validatedQuery.visibility === undefined || typeof validatedQuery.visibility !== "object" ? {} : validatedQuery.visibility;
				validatedQuery.visibility.mode = validatedQuery.visibility.mode === undefined ? sap.ui.vk.VisibilityMode.Complete : validatedQuery.visibility.mode;
				if (validatedQuery.visibility.mode !== sap.ui.vk.VisibilityMode.Complete && validatedQuery.visibility.mode !== sap.ui.vk.VisibilityMode.Differences) {
					jQuery.sap.log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT28.summary), Messages.VIT28.code, "sap.ui.vk.Viewport");
				}
				validatedQuery.visibility.compressed = validatedQuery.visibility.compressed === true ? true : false;
			}

			return validatedQuery;
		};

		// return null if dvlSceneId is null or not set
		if (this._dvlSceneId === null || this._dvlSceneId === undefined) {
			return null;
		}

		var validQuery = getValidatedQuery(query),
			viewInfo = {};

		// getting camera information
		if (validQuery.camera) {
			viewInfo.camera = {};
			var cameraId = this._dvl.Scene.GetCurrentCamera(this._dvlSceneId);

			if (validQuery.camera.rotation) {
				// calculate camera rotation
				var rotation = this._dvl.Camera.GetRotation(cameraId),
				cameraRotation = {
					yaw: rotation[0],
					pitch: rotation[1],
					roll: rotation[2]
				};
				viewInfo.camera.rotation = cameraRotation;
			}

			// calculate camera position
			if (validQuery.camera.position) {
				var cameraOrigin = this._dvl.Camera.GetOrigin(cameraId),
				cameraPosition = {
					x: cameraOrigin[0],
					y: cameraOrigin[1],
					z: cameraOrigin[2]
				};
				viewInfo.camera.position = cameraPosition;
			}

			// calculate camera projection type
			if (validQuery.camera.projectionType) {
				viewInfo.camera.projectionType = dictionary.encodedProjectionType[this._dvl.Camera.GetProjection(cameraId)];
				// calculating the zoom factor / field of view
				if (dictionary.encodedProjectionType[this._dvl.Camera.GetProjection(cameraId)] === "perspective") {
					// If the projection is "perspective", we get the Field of View.
					viewInfo.camera.fieldOfView = this._dvl.Camera.GetFOV(cameraId);
				} else if (dictionary.encodedProjectionType[this._dvl.Camera.GetProjection(cameraId)] === "orthographic") {
					// If the projection is "orthographic", we get the Zoom Factor.
					viewInfo.camera.zoomFactor = this._dvl.Camera.GetOrthoZoomFactor(cameraId);
				}
			}

			// calculate camera binding type
			if (validQuery.camera.bindingType) {
				viewInfo.camera.bindingType = dictionary.encodedBindingType[this._dvl.Camera.GetFOVBinding(cameraId)];
			}
		}

		// save the node visibility changes
		if (this._viewStateManager && validQuery.visibility) {
			viewInfo.visibility = {};
			switch (validQuery.visibility.mode) {
				case sap.ui.vk.VisibilityMode.Complete:
					var allVisibility = this._viewStateManager.getVisibilityComplete();
					viewInfo.visibility.visible = allVisibility.visible;
					viewInfo.visibility.hidden = allVisibility.hidden;
					break;
				case sap.ui.vk.VisibilityMode.Differences:
					viewInfo.visibility.changes = this._viewStateManager.getVisibilityChanges();
					break;
				default:
					jQuery.sap.log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT28.summary), Messages.VIT28.code, "sap.ui.vk.Viewport");
			}
			viewInfo.visibility.mode = validQuery.visibility.mode;

//			// TO DO: COMPRESS
//			if (validQuery.visibility.compressed) {
//				// compress the visibility
//			}
			viewInfo.visibility.compressed = validQuery.visibility.compressed;
		}

		// calculate step and procedure indexes and animation time
		if (validQuery.animation) {
			var stepInfo = this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneId, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_STEP_INFO),
				isStepBeingPlayed = stepInfo.StepId !== sap.ve.dvl.DVLID_INVALID;

			var stepId = isStepBeingPlayed ? stepInfo.StepId : this._lastPlayedStep,
				animationTime = isStepBeingPlayed ? stepInfo.StepTime : 0,
				procedures = this._dvl.Scene.RetrieveProcedures(this._dvlSceneId),
				stepAndProcedureIndexes = this._getStepAndProcedureIndexes(procedures.procedures, stepId);

			viewInfo.animation = {
				animationTime: animationTime,
				stepIndex: stepAndProcedureIndexes.stepIndex,
				procedureIndex: stepAndProcedureIndexes.procedureIndex
			};
		}

		return viewInfo;
	};

	/**
	 * Sets the current scene to use the camera view information acquired from the {@link sap.ui.vk.Viewport#getViewInfo getViewInfo} method.<br/>
	 * Internally, the <code>setViewInfo</code> method activates certain steps at certain animation times,
	 * and then changes the camera position, rotation and field of view (FOV) / zoom factor.
	 * @param {object} viewInfo A JSON-like object containing view information acquired using the {@link sap.ui.vk.Viewport#getViewInfo getViewInfo} method.<br/>
	 * The structure of the <code>viewInfo</code> object is outlined as follows:<br/>
	 * <ul>
	<li>
		animation
		<ul>
		<li>animationTime</li>
		<li>stepIndex</li>
		<li>procedureIndex</li>
		</ul>
	</li>
	<li>
		camera
		<ul>
		<li>rotation
			<ul>
			<li>yaw</li>
			<li>pitch</li>
			<li>roll</li>
			</ul>
		</li>
		<li>position
			<ul>
			<li>x</li>
			<li>y</li>
			<li>z</li>
			</ul>
		</li>
		<li>
			projection
		</li>
		<li>
			bindingType
		</li>
		<li>
			fieldOfView/zoomFactor
		</li>
		</ul>
	</li>
	<li>
		visibiluty
		<ul>
		<li>changes</li>
		<li>initialState</li>
		</ul>
	</li>
	</ul>
	 * @public
	 */
	Viewport.prototype.setViewInfo = function(viewInfo) {
		if (viewInfo.animation) {
			// retrieve all procedures from model
			var procedures = this._dvl.Scene.RetrieveProcedures(this._dvlSceneId);
			if (procedures.procedures.length > 0 && viewInfo.animation.stepIndex !== -1 && viewInfo.animation.procedureIndex !== -1) {
				// if the saved view info has steps and procedures, we use them for activating the indicated step
				if (viewInfo.animation.procedureIndex >= 0 && viewInfo.animation.procedureIndex < procedures.procedures.length) {
					// checking if step index has a valid value
					if (viewInfo.animation.stepIndex >= 0 && viewInfo.animation.stepIndex < procedures.procedures[viewInfo.animation.procedureIndex].steps.length) {
						var animationTime = viewInfo.animation.animationTime || 0,
						// retrieving stepId from step index and procedure index
						stepId = procedures.procedures[viewInfo.animation.procedureIndex].steps[viewInfo.animation.stepIndex].id;
						// activating the current step
						this._dvl.Scene.ActivateStep(this._dvlSceneId, stepId, false, false, 0);
						// stopping the step animation
						setTimeout(function() {
							this._dvl.Scene.PauseCurrentStep(this._dvlSceneId);
						}.bind(this), animationTime * 1000);
					} else {
						// Unsupported value for step index
						jQuery.sap.log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT26.summary), Messages.VIT26.code, "sap.ui.vk.Viewport");
					}
				} else {
					// Unsupported value for procedure index
					jQuery.sap.log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT27.summary), Messages.VIT27.code, "sap.ui.vk.Viewport");
				}
			} else {
				// if the saved info doesn't have steps, we reset the view
				this.resetView({
					camera: true,
					visibility: true,
					transition: false
				});
			}
		} else {
			// if the saved info doesn't have an <code>animation</code> property, we reset the view
			this.resetView({
				camera: true,
				visibility: true,
				transition: false
			});
		}

		if (viewInfo.camera) {
			var projectionType = dictionary.decodedProjectionType[viewInfo.camera.projectionType];
			// creating a new camera
			var currentCamera = this._dvl.Scene.CreateCamera(this._dvlSceneId, projectionType, sap.ve.dvl.DVLID_INVALID);

			if (viewInfo.camera.projectionType) {
				// setting the field of view / zoom factor
				switch (projectionType) {
					case dictionary.decodedProjectionType.perspective:
						this._dvl.Camera.SetFOV(currentCamera, viewInfo.camera.fieldOfView);
						break;
					case dictionary.decodedProjectionType.orthographic:
						this._dvl.Camera.SetOrthoZoomFactor(currentCamera, viewInfo.camera.zoomFactor);
						break;
					default:
						jQuery.sap.log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT19.summary), Messages.VIT19.code, "sap.ui.vk.Viewport");
				}
			}

			if (viewInfo.camera.position) {
				// positioning the camera in space
				this._dvl.Camera.SetOrigin(currentCamera, viewInfo.camera.position.x, viewInfo.camera.position.y, viewInfo.camera.position.z);
			}

			if (viewInfo.camera.rotation) {
				// setting the camera rotation
				this._dvl.Camera.SetRotation(currentCamera, viewInfo.camera.rotation.yaw, viewInfo.camera.rotation.pitch, viewInfo.camera.rotation.roll);
			}

			if (viewInfo.camera.bindingType) {
				var bindingType = dictionary.decodedBindingType[viewInfo.camera.bindingType];
				this._dvl.Camera.SetFOVBinding(currentCamera, bindingType);
			}

			// activating the camera
			this._dvl.Scene.ActivateCamera(this._dvlSceneId, currentCamera);
			// removing the camera that we created from the memory
			this._dvl.Scene.DeleteNode(this._dvlSceneId, currentCamera);
		}

		// restoring the visibility state
		if (viewInfo.visibility) {
			var nodeHierarchy = this._viewStateManager.getNodeHierarchy(),
				veIdToNodeIdMap = new Map(),
				allNodeIds = nodeHierarchy.findNodesByName();

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
				veIdToNodeIdMap.set(veId, nodeId);
			});

			switch (viewInfo.visibility.mode) {
				case sap.ui.vk.VisibilityMode.Complete:
					// TO DO: decompression
					var visibleVeIds = viewInfo.visibility.compressed ? viewInfo.visibility.visible : viewInfo.visibility.visible,
						hiddenVeIds = viewInfo.visibility.compressed ? viewInfo.visibility.hidden : viewInfo.visibility.hidden;

					visibleVeIds.forEach(function(veId) {
						this._viewStateManager.setVisibilityState(veIdToNodeIdMap.get(veId), true, false);
					}.bind(this));

					hiddenVeIds.forEach(function(veId) {
						this._viewStateManager.setVisibilityState(veIdToNodeIdMap.get(veId), false, false);
					}.bind(this));

					break;
				case sap.ui.vk.VisibilityMode.Differences:
					// TO DO: decompression
					var changedVeIds = viewInfo.visibility.compressed ? viewInfo.visibility.changes : viewInfo.visibility.changes;
					changedVeIds.forEach(function(veId) {
						var nodeId = veIdToNodeIdMap.get(veId);
						// reverting the visibility for this particular node
						this._viewStateManager.setVisibilityState(nodeId, !this._viewStateManager.getVisibilityState(nodeId), false);
					}.bind(this));

					break;
				default:
					jQuery.sap.log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT28.summary), Messages.VIT28.code, "sap.ui.vk.Viewport");
			}
		}
	};

	Viewport.prototype.onBeforeRendering = function() {
		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}
	};

	/**
	 * Gets position and size of the viewport square.
	 * The information can be used for making calculations when restoring Redlining elements.
	 * @returns {object} The information in this object:
	 *   <ul>
	 *     <li><b>left</b> - The x coordinate of the top-left corner of the square.</li>
	 *     <li><b>top</b> - The y coordinate of the top-left corner of the square.</li>
	 *     <li><b>sideLength</b> - The length of the square.</li>
	 *   </ul>
	 * @public
	 */
	Viewport.prototype.getOutputSize = function() {
		var bindingType = this.getViewInfo().camera.bindingType,
			boundingClientRect = this.getDomRef().getBoundingClientRect(),
			// The height and width of the sap.ui.vk.Viewport() control
			viewportWidth = boundingClientRect.width,
			viewportHeight = boundingClientRect.height,
			// relevantDimension is either viewportWidth or viewportHeight,
			// depending which of them drives the viewport output size when resizing
			relevantDimension;

		switch (dictionary.decodedBindingType[bindingType]) {
			case sap.ve.dvl.DVLCAMERAFOVBINDING.MIN:
				relevantDimension = Math.min(viewportWidth, viewportHeight);
				break;
			case sap.ve.dvl.DVLCAMERAFOVBINDING.MAX:
				relevantDimension = Math.max(viewportWidth, viewportHeight);
				break;
			case sap.ve.dvl.DVLCAMERAFOVBINDING.HORZ:
				relevantDimension = viewportWidth;
				break;
			case sap.ve.dvl.DVLCAMERAFOVBINDING.VERT:
				relevantDimension = viewportHeight;
				break;
			default:
				break;
		}

		return {
			left: (viewportWidth - relevantDimension) / 2,
			top: (viewportHeight - relevantDimension) / 2,
			sideLength: relevantDimension
		};
	};

	Viewport.prototype.onAfterRendering = function() {
		if (this._canvas) {
			var domRef = this.getDomRef();
			domRef.appendChild(this._canvas);
			this._resizeListenerId = ResizeHandler.register(this, this._handleResize.bind(this));
			this._handleResize({
				size: {
					width: domRef.clientWidth,
					height: domRef.clientHeight
				}
			});
		}
	};

	/**
	 * Handles the resize events from the {@link sap.ui.core.ResizeHandler ResizeHandler} object.
	 * @param {jQuery.Event} event The event object.
	 * @returns {boolean} Returns <code>true</code>, unless the <code>if</code> statement inside the method is false which causes the method to return <code>undefined</code>.
	 * @private
	 */
	Viewport.prototype._handleResize = function(event) {
		if (this._dvlRendererId && this._canvas) {
			var devicePixelRatio = window.devicePixelRatio || 1;
			var drawingBufferWidth = event.size.width * devicePixelRatio;
			var drawingBufferHeight = event.size.height * devicePixelRatio;

			this._dvl.Renderer.SetDimensions(drawingBufferWidth, drawingBufferHeight);
			this._dvl.Renderer.SetOptionF(sap.ve.dvl.DVLRENDEROPTIONF.DVLRENDEROPTIONF_DPI, 96 * devicePixelRatio);
			this._canvas.width = drawingBufferWidth;
			this._canvas.height = drawingBufferHeight;
			// Do not use width/height "100%" to reduce visual artifacts (stretching) when resizing the viewport via UI.
			this._canvas.style.width = event.size.width + "px";
			this._canvas.style.height = event.size.height + "px";

			this.fireResize({
				size: {
					width: event.size.width,
					height: event.size.height
				}
			});

			return true;
		}
	};

	/**
	 * @param {object} viewStateManager Takes a viewStateManager object as parameter.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.setViewStateManager = function(viewStateManager) {
		this._viewStateManager = viewStateManager;
		if (this._viewStateManager && (this._isSmart2DContent() || this._isSmart2DContentLegacy())) {
			this._initializeSmart2DHandler();
		}
		return this;
	};

	/**
	 * @param {string|string[]} nodeIds The node ID or the array of node IDs that we want to tint.
	 * @param {boolean} show Whether to highlight the nodes or remove the highlight.
	 * @param {integer} color The color to use for highlighting the nodes passed as argument.
	 * @return {sap.ui.vk.Viewport} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.showHotspots = function(nodeIds, show, color) {
		// this function creates a node proxy based on the node id and then changes its tint
		var setNodeProxyTintColor = function(nodeHierarchy, color, nodeId) {
			var nodeProxy = nodeHierarchy.createNodeProxy(nodeId);
			nodeProxy.setTintColorABGR(color);
			nodeHierarchy.destroyNodeProxy(nodeProxy);
		};

		if (!Array.isArray(nodeIds)) {
			nodeIds = [ nodeIds ];
		}

		// if the highlight color is not passed as argument, we use the default hightlight color
		var highlightColor = color === undefined ? this.getHotspotColorABGR() : color;

		// if show is falsy, we remove the highlight (which means highlight color becomes 0)
		if (!show) {
			highlightColor = 0;
		}

		var nodeHierarchy = this._viewStateManager.getNodeHierarchy();

		if (this._isSmart2DContent()) {
			// When we tint the hotspots, we have to tint their children as-well.
			var children = [];
			nodeIds.forEach(function(nodeId) {
				var nodeChildren = sap.ui.vk.dvl.getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_CHILDREN).ChildNodes);
				Array.prototype.push.apply(children, nodeChildren);
			}.bind(this));

			// joining together the nodes to be tinted and their children
			Array.prototype.push.apply(children, nodeIds);

			// Tinting the nodes
			children.forEach(setNodeProxyTintColor.bind(null, nodeHierarchy, highlightColor));
		} else {

			var descendants = [];
			var getAllDescendants = function(nodeId) {
				// Getting children of the node
				var children = nodeHierarchy.getChildren(nodeId);
				// Adding the children to the list of nodes to be tinted
				Array.prototype.push.apply(descendants, children);
				// collecting children recursively
				children.forEach(getAllDescendants);
			};
			nodeIds.forEach(getAllDescendants);

			// Tinting all the node ids that were passed as argument together with their descendants
			Array.prototype.push.apply(descendants, nodeIds);
			descendants.forEach(setNodeProxyTintColor.bind(null, nodeHierarchy, highlightColor));
		}

		return this;
	};

	/**
	 * @param {number} integerColor The ABGR integer format (with 0x prefix) color to be decomposed into RGBA. For example,
	 * 0xFF00FF00 stands for prefix (0x) + 100% opacity (FF) + 0% red (00) + 100% green (FF) + 0% blue (00) .
	 * @returns {object} Object whose properties are the red, green, blue and alpha components in a 0-1 format.
	 * @private
	 */
	Viewport.prototype._getDecomposedABGR = function(integerColor) {
		return {
			red: (integerColor >>> 0 & 0xff) / 255,
			green: (integerColor >>> 8 & 0xff) / 255,
			blue: (integerColor >>> 16 & 0xff) / 255,
			alpha: (integerColor >>> 24 & 0xff) / 255
		};
	};

	/**
	 * It retrieves the current background colors from the public properties and it applies them via DVL Renderer.
	 * @private
	 */
	Viewport.prototype._setBackgroundColor = function() {
		var top = this._getDecomposedABGR(this.getBackgroundColorTopABGR()),
			bottom = this._getDecomposedABGR(this.getBackgroundColorBottomABGR());
		this._dvl.Renderer.SetBackgroundColor(top.red, top.green, top.blue, top.alpha, bottom.red, bottom.green, bottom.blue, bottom.alpha);
	};

	/**
	 * Sets the background color for the top area of the Viewport.
	 * @param {int} integerColor Takes an integer value as parameter.
	 * For example: 0xffffffff as hexadecimal value (0x prefix, FF alpha, FF blue, FF green, FF red)
	 * @returns {sap.ui.vk.Viewport} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.setBackgroundColorTopABGR = function(integerColor) {
		this.setProperty("backgroundColorTopABGR", integerColor, true);
		// applying the background color
		this._setBackgroundColor();
		return this;
	};

	/**
	 * Sets the background color for the bottom area of the Viewport.
	 * @param {int} integerColor Takes an integer value as parameter.
	 * For example: 0xffffffff as hexadecimal value (0x prefix, FF alpha, FF blue, FF green, FF red)
	 * @returns {sap.ui.vk.Viewport} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.setBackgroundColorBottomABGR = function(integerColor) {
		this.setProperty("backgroundColorBottomABGR", integerColor, true);
		// applying the background color
		this._setBackgroundColor();
		return this;
	};

	////////////////////////////////////////////////////////////////////////
	// 3D Rendering handling begins.

	/**
	 * @returns {bool} It returns <code>true</code> or <code>false</code> whether the frame should be rendered or not.
	 * @experimental
	 */
	Viewport.prototype.shouldRenderFrame = function() {
		return this._dvlRendererId && this._dvl.Renderer.ShouldRenderFrame();
	};

	/**
	 * @returns {sap.ui.vk.Viewport} this
	 * @experimental
	 */
	Viewport.prototype.renderFrame = function() {
		if (this._dvlRendererId) {
			this._dvl.Renderer.RenderFrame(this._dvlRendererId);
		}
		return this;
	};

	/**
	 * @param {array} viewMatrix The <code>viewMatrix</code> array.
	 * @param {array} projectionMatrix The <code>projectionMatrix</code> array.
	 * @returns {sap.ui.vk.Viewport} this
	 * @experimental
	 */
	Viewport.prototype.renderFrameEx = function(viewMatrix, projectionMatrix) {
		if (this._dvlRendererId) {
			this._dvl.Renderer.RenderFrameEx.apply(this, [].concat(viewMatrix, projectionMatrix), this._dvlRendererId);
		}
		return this;
	};

	/**
	 * @param {object} resetOptions An object which is used for configuring the 'resetView' method.<br>
	 * It has three properties: <br>
	 <ul>
		<li> camera: boolean (defaults to true) - whether to reset the camera position to the initial state </li>
		<li> visibility: boolean (defaults to false) - whether to reset the visibility state to the default state </li>
		<li> transition: boolean (defaults to true) - whether to use transition or not when performing the reset </li>
	 </ul>
	 * @returns {sap.ui.vk.Viewport} this
	 * @experimental
	 */
	Viewport.prototype.resetView = function(resetOptions) {
		// if 'resetOptions' is defined, it has to be an object
		if (resetOptions !== undefined && !jQuery.isPlainObject(resetOptions)) {
			jQuery.sap.log.error(sap.ui.vk.getResourceBundle().getText(Messages.VIT31.summary), Messages.VIT31.code, "sap.ui.vk.Viewport");
		}

		// default options
		var options = {
			camera: true,
			transition: true,
			visibility: false
		};
		// attaching the options passed as argument to the default options
		jQuery.extend(options, resetOptions);

		// we perform the reset only if we need to reset the camera or the visibility
		if (options.camera || options.visibility) {

			var dvlOption = (options.camera ? sap.ve.dvl.DVLRESETVIEWFLAG.CAMERA : 0)
			| (options.transition ? sap.ve.dvl.DVLRESETVIEWFLAG.SMOOTHTRANSITION : 0)
			| (options.visibility ? sap.ve.dvl.DVLRESETVIEWFLAG.VISIBILITY : 0);

			if (this._dvlRendererId) {
				this._dvl.Renderer.ResetView(dvlOption, this._dvlRendererId);
				this._lastPlayedStep = null;
			}
		}
		return this;
	};

	/**
	 * @param {string} nodeId The ID of the node to check.
	 * @returns {sap.ui.vk.Viewport} this
	 * @experimental
	 */
	Viewport.prototype.canIsolateNode = function(nodeId) {
		if (this._dvlRendererId) {
			return this._dvl.Renderer.CanIsolateNode(nodeId, this._dvlRendererId);
		} else {
			return false;
		}
	};

	/**
	 * @param {string} nodeId The nodeId that we want to set as isolated.
	 * @returns {sap.ui.vk.Viewport} this
	 * @experimental
	 */
	Viewport.prototype.setIsolatedNode = function(nodeId) {
		if (this._dvlRendererId) {
			this._dvl.Renderer.SetIsolatedNode(nodeId, this._dvlRendererId);
		}
		return this;
	};

	/**
	 * @returns {string} nodeId The ID of the node that is currently set as isolated.
	 * @public
	 * @experimental
	 */
	Viewport.prototype.getIsolatedNode = function() {
		if (this._dvlRendererId) {
			return this._dvl.Renderer.GetIsolatedNode(this._dvlRendererId);
		} else {
			return sap.ve.dvl.DVLID_INVALID;
		}
	};

	/**
	 * Performs a screen-space hit test and gets the hit node id, it must be called between beginGesture() and endGesture()
	 *
	 * @param {int} x: x coordinate in viewport to perform hit test
	 * @param {int} y: y coordinate in viewport to perform hit test
	 * @returns {string} nodeId The ID of the node that is under the viewport coordinates (x, y).
	 * @experimental
	 */
	Viewport.prototype.hitTest = function(x, y) {
		if (this._dvlRendererId) {
			return this._dvl.Renderer.HitTest(x * window.devicePixelRatio, y * window.devicePixelRatio, this._dvlRendererId).id;
		} else {
			return sap.ve.dvl.DVLID_INVALID;
		}
	};

	Viewport.prototype.setShowDebugInfo = function(value) {
		this.setProperty("showDebugInfo", value, true);
		if (this._dvlRendererId) {
			this._dvl.Renderer.SetOption(sap.ve.dvl.DVLRENDEROPTION.DVLRENDEROPTION_SHOW_DEBUG_INFO, value, this._dvlRendererId);
		}
		return this;
	};

	// 3D Rendering handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Gesture handling ends.

	/**
	 * Marks the start of the current gesture operation.
	 *
	 * @param {int} x The x-coordinate of the gesture.
	 * @param {int} y The y-coordinate of the gesture.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.beginGesture = function(x, y) {
		if (this._dvlRendererId) {
			var pixelRatio = window.devicePixelRatio || 1;
			this._dvl.Renderer.BeginGesture(x * pixelRatio, y * pixelRatio, this._dvlRendererId);
		}
		return this;
	};

	/**
	 * Marks the end of the current gesture operation.
	 *
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.endGesture = function() {
		if (this._dvlRendererId) {
			this._dvl.Renderer.EndGesture(this._dvlRendererId);
		}
		return this;
	};

	/**
	 * Performs a <code>pan</code> gesture to pan across the Viewport.
	 *
	 * @param {int} dx The change in distance along the x-coordinate.
	 * @param {int} dy The change in distance along the y-coordinate.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.pan = function(dx, dy) {
		if (this._dvlRendererId) {
			var pixelRatio = window.devicePixelRatio || 1;
			this._dvl.Renderer.Pan(dx * pixelRatio, dy * pixelRatio, this._dvlRendererId);
			this.firePan({
				dx: dx,
				dy: dy
			});
		}
		return this;
	};

	/**
	 * Rotates the content resource displayed on the Viewport.
	 *
	 * @param {int} dx The change in x-coordinate used to define the desired rotation.
	 * @param {int} dy The change in y-coordinate used to define the desired rotation.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.rotate = function(dx, dy) {
		if (this._dvlRendererId) {
			var pixelRatio = window.devicePixelRatio || 1;
			this._dvl.Renderer.Rotate(dx * pixelRatio, dy * pixelRatio, this._dvlRendererId);
		}
		return this;
	};

	/**
	 * Performs a <code>zoom</code> gesture to zoom in or out on the beginGesture coordinate.
	 * @param {double} dy Zoom factor. A scale factor that specifies how much to zoom in or out by.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.zoom = function(dy) {
		if (this._dvlRendererId) {
			this._dvl.Renderer.Zoom(dy, this._dvlRendererId);
			this.fireZoom({
				zoomFactor: dy
			});
		}
		return this;
	};

	/**
	 * Executes a click or tap gesture.
	 *
	 * @param {int} x The tap gesture's x-coordinate.
	 * @param {int} y The tap gesture's y-coordinate.
	 * @param {boolean} isDoubleClick Indicates whether the tap gesture should be interpreted as a double-click. A value of <code>true</code> indicates a double-click gesture, and <code>false</code> indicates a single click gesture.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.tap = function(x, y, isDoubleClick) {
		if (this._dvlRendererId) {
			var pixelRatio = window.devicePixelRatio || 1;
			var px = x * pixelRatio, py = y * pixelRatio;
			if (!isDoubleClick) {
				var node = this.hitTest(x, y); // NB: pass (x, y) in CSS pixels, hitTest will convert them to device pixles.
				if (node != sap.ve.dvl.DVLID_INVALID) {
					var param = { nodeId: node, x: x, y: y };
					this.fireNodeClicked(param, true, true);
				}
			}
			this._dvl.Renderer.Tap(px, py, isDoubleClick, this._dvlRendererId);
		}
		return this;
	};

	/**
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.queueCommand = function(command) {
		if (this._dvlRendererId) {
			this._dvl.Renderer._queueCommand(command, this._dvlRendererId);
		}
		return this;
	};

	// Gesture handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Keyboard handling begins.

	var offscreenPosition = { x: -2, y: -2 };
	var rotateDelta = 2;
	var panDelta = 5;

	[
		{ key: "left",  dx: -rotateDelta, dy:            0 },
		{ key: "right", dx: +rotateDelta, dy:            0 },
		{ key: "up",    dx:            0, dy: -rotateDelta },
		{ key: "down",  dx:            0, dy: +rotateDelta }
	].forEach(function(item) {
		Viewport.prototype["onsap" + item.key] = function(event) {
			this.beginGesture(offscreenPosition.x, offscreenPosition.y);
			this.rotate(item.dx, item.dy);
			this.endGesture();
			this.renderFrame();
			event.preventDefault();
			event.stopPropagation();
		};
	});

	[
		{ key: "left",  dx: -panDelta, dy:         0 },
		{ key: "right", dx: +panDelta, dy:         0 },
		{ key: "up",    dx:         0, dy: -panDelta },
		{ key: "down",  dx:         0, dy: +panDelta }
	].forEach(function(item) {
		Viewport.prototype["onsap" + item.key + "modifiers"] = function(event) {
			if (event.shiftKey && !(event.ctrlKey || event.altKey || event.metaKey)) {
				this.beginGesture(offscreenPosition.x, offscreenPosition.y);
				this.pan(item.dx, item.dy);
				this.endGesture();
				this.renderFrame();
				event.preventDefault();
				event.stopPropagation();
			}
		};
	});

	[
		{ key: "minus", d: 0.98 },
		{ key: "plus",  d: 1.02 }
	].forEach(function(item) {
		Viewport.prototype["onsap" + item.key] = function(event) {
			this.beginGesture(this.$().width() / 2, this.$().height() / 2);
			this.zoom(item.d);
			this.endGesture();
			this.renderFrame();
			event.preventDefault();
			event.stopPropagation();
		};
	});

	// Keyboard handling ends.
	////////////////////////////////////////////////////////////////////////

	return Viewport;
});
