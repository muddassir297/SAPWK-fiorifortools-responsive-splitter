/* Static helper class of NavigationController used to initialize the routing of the app during startup
 * More precisely the following tasks are performed:
 * - Create routes from the pages-section of the manifest
 * - Process startup parameters
 * - Finally, initialize router
 * Note that all methods of this class use a parameter oNavigationControllerProxy. This is a copy of the public NavigationController
 * enhanced by attributes oAppComponent, oRouter, oTemplateContract, and oHashChanger and a method fnInitializationResolve (which is to be called, when everything is done).
 */

sap.ui.define(["sap/f/FlexibleColumnLayout", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/generic/app/util/ModelUtil",
		"sap/suite/ui/generic/template/lib/CRUDHelper", "sap/suite/ui/generic/template/lib/FlexibleColumnLayoutHandler",
		"sap/suite/ui/generic/template/lib/testableHelper", "sap/m/routing/Targets"
	],
	function(FlexibleColumnLayout, Filter, FilterOperator, ModelUtil, CRUDHelper, FlexibleColumnLayoutHandler, testableHelper, Targets) {
		"use strict";
		
		function createTarget(oRouter, sControlId, sViewName, sTargetName, sControlAggregation) {
			var oTarget = {};
			oTarget = {
				viewName: sViewName,
				controlId: sControlId,
				controlAggregation: sControlAggregation
			};

			var oTargets = oRouter.getTargets();
			oTargets.addTarget(sTargetName, oTarget);
		}
		
		function createMessagePageTargets(oNavigationControllerProxy, sTargetControlId){
			if (oNavigationControllerProxy.oTemplateContract.oFlexibleColumnLayoutHandler){
				oNavigationControllerProxy.oTemplateContract.oFlexibleColumnLayoutHandler.createMessagePageTargets(createTarget.bind(null, oNavigationControllerProxy.oRouter, sTargetControlId, "sap.suite.ui.generic.template.fragments.MessagePage"));
			} else {
				createTarget(oNavigationControllerProxy.oRouter, sTargetControlId, "sap.suite.ui.generic.template.fragments.MessagePage", "messagePage", "pages");	
			}
		}
		
		/**
		 * Creates necessary routing metadata from configuration and adds it to the Router
		 *
		 * @public
		 * @param {String} sNavigationTargetId - the navigation target ID
		 * @returns {String} sEntitySet - the root EntitySet
		 */
		function generateRoutingMetadataAndGetRootEntitySet(oNavigationControllerProxy) {
			var sTargetControlId = oNavigationControllerProxy.oTemplateContract.oNavigationHost.getId();
			var oConfig = oNavigationControllerProxy.oAppComponent.getConfig(),
				oTopRouteConfig, oTopRoute;
			if (!oConfig.pages || !oConfig.pages.length) {
				throw new Error("Route Configuration missing");
			}
			if (oConfig.pages.length > 1) {
				throw new Error("Currently only one Top route supported");
			}

			// create Top-Route
			// currently only one top route supported
			oTopRouteConfig = oConfig.pages[0];

			oNavigationControllerProxy.oTemplateContract.mEntityTree = {};

			oTopRoute = createRoute([], oTopRouteConfig, "root", 0, null, oNavigationControllerProxy, sTargetControlId);
			oNavigationControllerProxy.oRouter.addRoute(oTopRoute);

			createQueryRoute(oTopRoute, oNavigationControllerProxy);

			createChildRoutes(oTopRoute.target, oTopRouteConfig, 0, null, oNavigationControllerProxy, sTargetControlId);
			
			createMessagePageTargets(oNavigationControllerProxy, sTargetControlId);
			
			return oTopRouteConfig.entitySet;
		}

		/**
		 * Creates child route from the specified route configuration
		 *
		 * @private
		 * @param {Object} oRoute - the route configuration
		 * @param {Number} iLevel - the level
		 * @param {Object} oParent - the parent route (if any)
		 * @param {Array} aNodes - optional: Add the names of entity sets for the created roots to this array
		 */
		function createChildRoutes(vPredecessorTargets, oRoute, iLevel, oParent, oNavigationControllerProxy, sTargetControlId, aNodes) {
			var i, iLen;
			if (oRoute.pages) {
				iLen = oRoute.pages.length;
				for (i = 0; i < iLen; i++) {
					createRoutes(vPredecessorTargets, oRoute.pages[i], (iLevel + 1), oParent, oNavigationControllerProxy, sTargetControlId, aNodes);
				}
			}
		}

		/**
		 * Creates all necessary route(s) metadata from configuration and adds it to the Router instance
		 *
		 * @private
		 * @param {Object} oRoute - the route configuration
		 * @param {Number} iLevel - the level
		 * @param {Object} oParent - the parent route (if any)
		 * @param {Array} aNodes - optional: Add the names of entity sets for the created roots to this array
		 */
		function createRoutes(vPredecessorTargets, oRoute, iLevel, oParent, oNavigationControllerProxy, sTargetControlId, aNodes) {
			if (oRoute.component) { //in case of intent there is no internal route to be created
				var oTreeNode = {
					parent: oParent && oParent.entitySet,
					navigationProperty: oRoute.navigationProperty,
					level: iLevel,
					children: []
				};
				var oNewRoute = createRoute(vPredecessorTargets, oRoute, oRoute.component.list ? "aggregation" : "detail", iLevel, oParent,
					oNavigationControllerProxy, sTargetControlId);
				oTreeNode.sRouteName = oNewRoute.name;
				oTreeNode.entitySet = oNewRoute.entitySet;
				if (aNodes){
					aNodes.push(oNewRoute.entitySet);
				}
				var oExistingTreeNode = oNavigationControllerProxy.oTemplateContract.mEntityTree[oNewRoute.entitySet];
				// Expected: oExistingTreeNode is faulty. However, there are scenarios with circular page structures.
				if (!oExistingTreeNode || oExistingTreeNode.level > oTreeNode.level){
					oNavigationControllerProxy.oTemplateContract.mEntityTree[oNewRoute.entitySet] = oTreeNode;
				}
				oNavigationControllerProxy.oRouter.addRoute(oNewRoute);
				createQueryRoute(oNewRoute, oNavigationControllerProxy);
				createChildRoutes(oNewRoute.target, oRoute, iLevel, oNewRoute, oNavigationControllerProxy, sTargetControlId, oTreeNode.children);
			}
		}

		/**
		 * Creates a Query route from the specified route and adds it to the router
		 *
		 * @private
		 * @param {Object} oRoute - the route configuration
		 */
		function createQueryRoute(oRoute, oNavigationControllerProxy) {
			var oQueryRoute = jQuery.extend({}, oRoute);
			oQueryRoute.name = oRoute.name + "query";
			oQueryRoute.pattern = oRoute.pattern + "{?query}";
			oNavigationControllerProxy.oRouter.addRoute(oQueryRoute);
		}

		/**
		 * Creates and returns a route metadata from configuration
		 *
		 * @private
		 * @param {Object} oRoute - the route configuration
		 * @param {string} sOperation - the operation for which the route has to be created
		 * @param {Number} iLevel - the level
		 * @param {Object} oParentRoute - the parent route (if any)
		 * @returns {Object} the created route metadata
		 */
		function createRoute(vPredecessorTargets, oRoute, sOperation, iLevel, oParentRoute, oNavigationControllerProxy, sTargetControlId) {
			var aPredecessorTargets = jQuery.isArray(vPredecessorTargets) ? vPredecessorTargets : [vPredecessorTargets];
			var sPathPattern, oNewRoute;
			sPathPattern = oRoute.navigationProperty || oRoute.entitySet;

			oNewRoute = jQuery.extend({}, oRoute);
			oNewRoute.path = "/" + oRoute.entitySet;
			oNewRoute.operation = sOperation;
			oNewRoute.viewLevel = iLevel;
			// TODO: use only component name here?
			oNewRoute.template = oRoute.component ? (oRoute.component.name || oRoute.component) : oRoute.template;

			switch (sOperation) {
				case "root":
					oNewRoute.name = "root";
					oNewRoute.pattern = "";
					break;
				case "aggregation":
					oNewRoute.name = sPathPattern + "~aggregation";
					oNewRoute.pattern = sPathPattern;
					break;
				default:
					oNewRoute.name = sPathPattern;
					oNewRoute.pattern = sPathPattern + "({keys" + iLevel + "})";
					break;
			}

			if (oParentRoute) {
				oNewRoute.name = oParentRoute.name + "/" + oNewRoute.name;
				oNewRoute.pattern = oParentRoute.pattern + "/" + oNewRoute.pattern;
				oNewRoute.parentEntitySet = oParentRoute.entitySet;
			}
			// Store information about root of entity set tree
			if (oNewRoute.viewLevel === 1){
				oNavigationControllerProxy.oTemplateContract.routeViewLevel1 = {
					pattern: oNewRoute.pattern,
					name: oNewRoute.name
				};
			}
			var sControlAggregation;
			var sTargetName = oNewRoute.name;
			if (oNavigationControllerProxy.oTemplateContract.oFlexibleColumnLayoutHandler) { // In this case the view is hosted by the FCL
				sControlAggregation =  oNavigationControllerProxy.oTemplateContract.oFlexibleColumnLayoutHandler.adaptRoutingInfo(oNewRoute, sTargetName, aPredecessorTargets);
			} else { // In this case the view is hosted by the NavContainer
				sControlAggregation = "pages";
				oNewRoute.target = sTargetName;
			}
			createTarget(oNavigationControllerProxy.oRouter, sTargetControlId, oNewRoute.name, sTargetName, sControlAggregation);

			var oPromise = new Promise(function(fnResolve){
				oNavigationControllerProxy.mRouteToComponentResolve[oNewRoute.name] = fnResolve;
			});
			oNavigationControllerProxy.oTemplateContract.mRouteToTemplateComponentPromise[oNewRoute.name] = oPromise;

			return oNewRoute;
		}

		// - End methods for creating the routes

		/*
		 * Creates necessary routing info and initialises the Router
		 */
		function fnInitialiseRouting(oNavigationControllerProxy, oStartupParameters) {
			var sHash;
			if (!oNavigationControllerProxy.oHashChanger.getHash()) {
				sHash = "";
				// no route is set yet, check if start entity was passed via parameter
				if (oStartupParameters && oStartupParameters.route && oStartupParameters.route.length === 1) {
					sHash = oStartupParameters.route[0];
					oNavigationControllerProxy.navigate(sHash, true);
				}
			}
			oNavigationControllerProxy.oRouter.initialize();
			oNavigationControllerProxy.fnInitializationResolve();
		}

		// - Start methods for processing the startup parameters

		/*
		 * perform a read with the specified data and trigger further initialisation of router
		 *
		 * @param {Array} aKeys - the keys used to create the filter
		 * @param {Object} oStartupParameters - object containing parameters
		 * @param {Object} oModel- the odata model instance
		 */
		function fnReadObject(oNavigationControllerProxy, sEntitySet, aKeys, oStartupParameters, oModel) {
			var i, iLen, sProperty, sValue, aFilters = [];
			if (aKeys && oStartupParameters && oModel) {
				iLen = aKeys.length;
				for (i = 0; i < iLen; i++) {
					// get property from property path
					sProperty = aKeys[i].PropertyPath;
					// get value from parameter array (should have only 1)
					sValue = oStartupParameters[sProperty][0];
					aFilters.push(new Filter(sProperty, FilterOperator.EQ, sValue));
				}
				if (oNavigationControllerProxy.oAppComponent.getTransactionController().getDraftController()
						.getDraftContext().isDraftEnabled(sEntitySet)) {
					var oDraftFilter = new Filter({
						filters: [new Filter("IsActiveEntity", "EQ", false),
						          new Filter("SiblingEntity/IsActiveEntity", "EQ", null)],
						          and: false
					});
					aFilters.push(oDraftFilter);
				}
				var oCompleteFilter = new Filter(aFilters, true);
				oModel.read("/" + sEntitySet, {
					filters: [oCompleteFilter],
					success: function(oResult) {
						var oRow, i, iLength, sKey;
						if (oResult && oResult.results) {
							iLength = oResult.results.length;
							for (i = 0; i < iLength; i++) {
								oRow = oResult.results[i];
								if (oRow && oRow.IsActiveEntity) {
									break;
								}
								oRow = null;
							}
							if (!oRow) {
								oRow = oResult.results[0];
							}
						}
						if (oRow) {
							sKey = oModel.getKey(oRow);
						}
						if (sKey) {
							oNavigationControllerProxy.navigate(sKey, true);
						}
						fnInitialiseRouting(oNavigationControllerProxy, oStartupParameters);
					},
					error: function(oError) {
						// just continue with initialisation in case of errors
						fnInitialiseRouting(oNavigationControllerProxy, oStartupParameters);
					}
				});
			}
		}

		function fnCombineMode(sPreferredMode, sMode) {
			// in case of not allowed combinations of mode navigate to the List Report
			if ((sPreferredMode && sMode) || (sMode === "display"))	{ 
				return { 
					mode: "unsupported"
				}; 
			}

			var oResult = {
					mode: "display",
					force: "false"
			}; // historic default behavior

			oResult.mode = sMode || sPreferredMode || oResult.mode;
			oResult.force = !!sMode;

			return oResult;
		}

		function fnDefaultNavigationProcessing(oModel, oNavigationControllerProxy, sEntitySet, oStartupParameters, oMode) {
			var oNavigationPossible = fnCheckNavigation(oModel, oNavigationControllerProxy, sEntitySet, oStartupParameters, oMode);
			var sHash;
			if (oNavigationPossible.bNavigationWithTechnicalKeyPossible) {
				// created
				sHash = oModel.createKey(sEntitySet, oStartupParameters);
				if (sHash) {
					oNavigationControllerProxy.navigate(sHash, true);
				}
			} else if (oNavigationPossible.bNavigationWithSemanticKeyPossible) {
				fnReadObject(oNavigationControllerProxy, sEntitySet, oNavigationPossible.aSemanticKey, oStartupParameters, oModel);
				// read will trigger the initialisation as needed
				return;
			}
			fnInitialiseRouting(oNavigationControllerProxy, oStartupParameters);
		}

		function fnCheckKeys(aKeys, mParams) {
			var i, iLength, bSuccess = false, oKey, sKeyProperty;
			if (mParams && aKeys) {
				iLength = aKeys.length;
				for (i = 0; i < iLength; i++) {
					// assume key handling shall be successful
					bSuccess = true;
					oKey = aKeys[i];
					// Keys are located either at name (resource/entity key) or PropertyPath (SemanticKey annotation)
					sKeyProperty = oKey.name || oKey.PropertyPath;
					if (!mParams[sKeyProperty] || mParams[sKeyProperty].length > 1) {
						// if no key params or multiple key params are present set unsuccessful and break
						bSuccess = false;
						break;
					}
				}
			}
			return bSuccess;
		}

		function fnCheckNavigation(oModel, oNavigationControllerProxy, sEntitySet, oStartupParameters, oMode) {
			//check: only if the page exists a navigation is allowed
			if (!oNavigationControllerProxy.oRouter.getRoute(sEntitySet)) {return {};}

			// if page exists, but for the current mode is replaced by external navigation, internal navigation is not allowed
			if (oNavigationControllerProxy.oAppComponent.getManifestEntry("sap.ui.generic.app").pages[0].pages[0].navigation &&
					oNavigationControllerProxy.oAppComponent.getManifestEntry("sap.ui.generic.app").pages[0].pages[0].navigation[oMode.mode]){return {};}
			
			// if entitySet does not exist in metaModel, navigation is not allowed
			var oEntitySet = oModel.getMetaModel().getODataEntitySet(sEntitySet);
			if (!oEntitySet) {return {};}
			
			var oEntityType = oModel.getMetaModel().getODataEntityType(oEntitySet.entityType);
			
			if (fnCheckKeys(oEntityType.key.propertyRef, oStartupParameters)) {
				// full technical key provided
				return {
					bNavigationWithTechnicalKeyPossible: true
				};
			}
			
			var aSemanticKey = oEntityType["com.sap.vocabularies.Common.v1.SemanticKey"];
			if (fnCheckKeys(aSemanticKey, oStartupParameters)) {
				// complete semantic key provided
				return {
					bNavigationWithSemanticKeyPossible: true,
					aSemanticKey: aSemanticKey
				};
			}
			return {};
		}
		
		function fnPrepareCreate(oNavigationControllerProxy){
			var oGlobalModel = oNavigationControllerProxy.oAppComponent.getModel("_templPrivGlobal");
			oGlobalModel.setProperty("/generic/forceFullscreenCreate", true);
		}

		/* checks the startup parameters for triggering navigation
		 * Note: this function is only called when sEntitySet and oStartupParameters are truthy
		 */
		function fnProcessStartupParameters(oNavigationControllerProxy, sEntitySet, oStartupParameters) {
			var oModel;
			// wait for the ODataMetaModel to be loaded
			oModel = oNavigationControllerProxy.oAppComponent.getModel();
			oModel.attachMetadataFailed(oNavigationControllerProxy.fnInitializationResolve);
			oModel.getMetaModel().loaded().then(function() {
				var oEntitySet;

				var sPreferredMode = oStartupParameters.preferredMode && oStartupParameters.preferredMode[0];
				var sMode = oStartupParameters.mode && oStartupParameters.mode[0];
				var oMode = fnCombineMode(sPreferredMode, sMode);

				// if startup parameters contain draft keys, they should be completely ignored - navigation should only specify the target object, not its state
				// (basically that's the idea of semantic URL)
				// just change them (if present) to the ones of the active entity 
				if (oStartupParameters.DraftUUID) { oStartupParameters.DraftUUID = ["00000000-0000-0000-0000-000000000000"]; }
				if (oStartupParameters.IsActiveEntity) { oStartupParameters.IsActiveEntity = ["true"]; }

				switch (oMode.mode) {
					case "create":
						fnPrepareCreate(oNavigationControllerProxy);

						var oCreatePromise = CRUDHelper.create(oNavigationControllerProxy.oAppComponent
								.getTransactionController().getDraftController(), sEntitySet, "/" + sEntitySet, oModel, oNavigationControllerProxy.oTemplateContract.oApplicationProxy.setEditableNDC);

						oCreatePromise.then(function(oContext) {
							fnInitialiseRouting(oNavigationControllerProxy, oStartupParameters);
							oNavigationControllerProxy.navigateToContext(oContext, "", true, 4);
						}, function(oError) {
							oNavigationControllerProxy.navigateToMessagePage({
								title: oNavigationControllerProxy.oTemplateContract.getText("ST_GENERIC_ERROR_TITLE"),
								text: oError.messageText,
								description: "",
								icon: "sap-icon://message-error",
								replaceURL: true
							});
						});
						oNavigationControllerProxy.oTemplateContract.oBusyHelper.setBusy(oCreatePromise, true);
						break;

						//Create with context
					case "createWithContext":
						fnPrepareCreate(oNavigationControllerProxy);
						oEntitySet = oModel.getMetaModel().getODataEntitySet(sEntitySet);
						var oDraftRoot = oEntitySet["com.sap.vocabularies.Common.v1.DraftRoot"];
						if (oDraftRoot && oDraftRoot.NewAction) {
							var oFunctionImport = oModel.getMetaModel().getODataFunctionImport(oDraftRoot.NewAction.String.split("/")[1]);
							var oUrlParameters = {};

							if (oFunctionImport && oFunctionImport.parameter) {
								for (var i = 0; i < oFunctionImport.parameter.length; i++) {
									if (oFunctionImport.parameter[i].mode === "In" && oStartupParameters[oFunctionImport.parameter[i].name][0]) {
										oUrlParameters[oFunctionImport.parameter[i].name] = oStartupParameters[oFunctionImport.parameter[i].name][0];
									}
								}

								// TODO: use Smart Templates busy indicator
								sap.ui.core.BusyIndicator.show();

								oModel.callFunction("/" + oFunctionImport.name, {
									success: function(oData, oResponse) {
										fnInitialiseRouting(oNavigationControllerProxy, oStartupParameters);
										sap.ui.core.BusyIndicator.hide();
										var oModelUtil = new ModelUtil(oModel);
										var oContext = oModelUtil.getContextFromResponse(oData);
										if (oContext) {
											oNavigationControllerProxy.navigateToContext(oContext, null, true, 4);
										} else {
											oNavigationControllerProxy.navigateToMessagePage({
												title: oNavigationControllerProxy.oTemplateContract.getText("ST_GENERIC_UNKNOWN_NAVIGATION_TARGET"),
												replaceURL: true
											});
										}
									},
									error: function(oError) {
										sap.ui.core.BusyIndicator.hide();
										oNavigationControllerProxy.navigateToMessagePage({
											title: oNavigationControllerProxy.oTemplateContract.getText("ST_GENERIC_UNKNOWN_NAVIGATION_TARGET"),
											replaceURL: true
										});
									},
									method: "POST",
									urlParameters: oUrlParameters
								});
							} else {
								oNavigationControllerProxy.navigateToMessagePage({
									title: oNavigationControllerProxy.oTemplateContract.getText("ST_GENERIC_UNKNOWN_NAVIGATION_TARGET"),
									replaceURL: true
								});
							}
						}
						break;

					case "edit":
						// App opens with an edit view, if there is a draft...if not, creates a draft
						var oNavigationPossible = fnCheckNavigation(oModel, oNavigationControllerProxy, sEntitySet,
								oStartupParameters, oMode);
						if (oNavigationPossible.bNavigationWithTechnicalKeyPossible || oNavigationPossible.bNavigationWithSemanticKeyPossible) {
							var oEditPromise = CRUDHelper.edit(
									oNavigationControllerProxy.oAppComponent.getTransactionController(), sEntitySet,
									"/" + oModel.createKey(sEntitySet, oStartupParameters), oModel,
									oNavigationControllerProxy.oTemplateContract,
									oNavigationControllerProxy.fnInitializationResolve);

							oEditPromise.then(function(oResult) {
								oNavigationControllerProxy.navigate(oResult.context.getPath(), true);
								fnInitialiseRouting(oNavigationControllerProxy);
							}, function(oError) {
								if (oError.lockedByUser) {
									if (!oMode.force) {
										fnDefaultNavigationProcessing(oModel, oNavigationControllerProxy, sEntitySet,
												oStartupParameters, oMode);
									} else {
										oNavigationControllerProxy.fnInitializationResolve(); // to finish busyIndicator
										// before
										oNavigationControllerProxy.navigateToMessagePage({
											title: oNavigationControllerProxy.oTemplateContract
											.getText("LOCKED_OBJECT_POPOVER_TITLE"),
											text: oNavigationControllerProxy.oTemplateContract
											.getText("LOCKED_OBJECT_POPOVER_TITLE"),
											description: oNavigationControllerProxy.oTemplateContract.getText(
													"ST_GENERIC_LOCKED_OBJECT_POPOVER_TEXT", [oError.lockedByUser]),
													icon: "sap-icon://message-error",
													replaceURL: true
										});
									}
								} else if (oError.draftAdminReadResponse) {
									oNavigationControllerProxy.fnInitializationResolve(); // to finish busyIndicator before
									oNavigationControllerProxy
									.navigateToMessagePage({
										title: oNavigationControllerProxy.oTemplateContract
										.getText("ST_GENERIC_ERROR_TITLE"),
										text: oNavigationControllerProxy.oTemplateContract
										.getText("ST_GENERIC_ERROR_SYSTEM_UNAVAILABLE"),
										description: oNavigationControllerProxy.oTemplateContract
										.getText("ST_GENERIC_ERROR_SYSTEM_UNAVAILABLE_DESC"),
										icon: "sap-icon://message-error",
										replaceURL: true
									});
								}
							});
						} else {
							fnInitialiseRouting(oNavigationControllerProxy, oStartupParameters);
						}
						break;

					case "display":
						fnDefaultNavigationProcessing(oModel, oNavigationControllerProxy, sEntitySet, oStartupParameters, oMode);
						break;

					default: // including case "unsupported"
						oNavigationControllerProxy.fnInitializationResolve(); // to finish busyIndicator before showing error page
					oNavigationControllerProxy.navigateToMessagePage({
						title: oNavigationControllerProxy.oTemplateContract.getText("ST_GENERIC_ERROR_TITLE"),
						text: oNavigationControllerProxy.oTemplateContract.getText("ST_GENERIC_ERROR_TITLE"),
						description: oNavigationControllerProxy.oTemplateContract.getText("PARAMETER_COMBINATION_NOT_SUPPORTED", [sMode, sPreferredMode]),
						icon: "sap-icon://message-error",
						replaceURL: true
					});
				}
			});
		}
		// - End methods for processing the startup parameters

		// The function exposed by this class: Startup the router
		function fnStartupRouter(oNavigationControllerProxy) {
			var oManifestEntryGenricApp = oNavigationControllerProxy.oAppComponent.getManifestEntry("sap.ui.generic.app");
			// check the manifest.json for the flexibleColumnLayout flag
			if (oManifestEntryGenricApp.settings && oManifestEntryGenricApp.settings.flexibleColumnLayout) {
				oNavigationControllerProxy.oTemplateContract.oFlexibleColumnLayoutHandler = new FlexibleColumnLayoutHandler(
					oNavigationControllerProxy.oTemplateContract.oNavigationHost, oNavigationControllerProxy
				);
			}

			var sEntitySet = generateRoutingMetadataAndGetRootEntitySet(oNavigationControllerProxy);
			var oData = oNavigationControllerProxy.oAppComponent.getComponentData();
			var oStartupParameters = oData && oData.startupParameters;
			// check if there entitySet and startup parameters are present and no hash exists!
			if (sEntitySet && oStartupParameters && !oNavigationControllerProxy.oHashChanger.getHash()) {
				fnProcessStartupParameters(oNavigationControllerProxy, sEntitySet, oStartupParameters);
			} else {
				fnInitialiseRouting(oNavigationControllerProxy);
			}
		}

		/*
		 * get the context path from navigation path/pattern
		 * @param {Object} oRouteConfig - the route configuration
		 * @returns {String} the context path
		 */
		function fnDetermineContextPath(oRouteConfig) {
			var sPath, sPathPattern, iIndex;
			if (oRouteConfig) {
				// get the pattern from route configuration
				sPath = oRouteConfig.pattern;
				// get the current path pattern from either navigation property or the entitySet
				sPathPattern = oRouteConfig.navigationProperty || oRouteConfig.entitySet;
				if (sPath && sPathPattern) {
					iIndex = sPath.indexOf("{?query}");
					// if the query is not at the beginning there is a query suffix
					if (iIndex > 0) {
						// get the current path by ignoring the query suffix
						sPath = sPath.substring(0, iIndex);
					}
					// reset the index
					iIndex = -1;
					// Look for path pattern with ({key
					sPathPattern += "({keys";
					iIndex = sPath.indexOf(sPathPattern);
					// if the pattern is not at the beginning there is a parent path prefix
					if (iIndex > 0) {
						// get the current path by ignoring the parent prefix
						sPath = sPath.substring(iIndex);
					}
					// replace the navigation property with entity set to form the binding context path
					if (oRouteConfig.navigationProperty) {
						sPath = sPath.replace(oRouteConfig.navigationProperty, oRouteConfig.entitySet);
					}
					// context always needs to start with a "/"
					sPath = "/" + sPath;
				}
			}
			return sPath;
		}

		// Determine path the component has to be bound to according to the event obtained from the router
		function fnDeterminePath(oRouteConfig, oEvent, sPattern){
			var sPath, oKeys, sKey;
			if (oRouteConfig.operation === "root") { // check for operation
				return null;
			}

			if (oRouteConfig.operation === "aggregation") {
				sPath = oRouteConfig.pattern;
			} else {
				if (sPattern){
					sPath = sPattern;
				} else {
					// The view is for an instance
					sPath = fnDetermineContextPath(oRouteConfig);
				}
			}
			if (sPath.indexOf("/") !== 0){
				sPath = "/" + sPath;
			}
			oKeys = oEvent.getParameter("arguments");
			if (oKeys) {
				for (sKey in oKeys) {
					// replace each key in pattern with corresponding key in argument
					if (sKey !== "?query"){
						sPath = sPath.replace("{" + sKey + "}", oKeys[sKey]);
					}
				}
				return sPath;
			}
		}
		
		/*
		 * get the navigation path from binding context
		 * @param {Object} oTargetContext - the binding context
		 * @param {string} sNavigationProperty - the navigation property that should replace the entity
		 * @returns {string} the resolved path
		 */
		function fnDetermineNavigationPath(oTargetContext, sNavigationProperty) {
			var sPath, aPath, sEntitySet;
			// Get the path from binding context without "/"
			sPath = oTargetContext.getPath().substring(1);
			// Get the entityset from path
			aPath = sPath.split("(");
			if (aPath[0]) {
				sEntitySet = aPath[0];
			}
			// Replace the entitySet with navigationProperty in the path, if it is specified
			if (sNavigationProperty) {
				sPath = sPath.replace(sEntitySet, sNavigationProperty);
				if (sPath.indexOf("/") === 0) {
					sPath = sPath.substring(1);
				}
			}
			return { 
				entitySet: sEntitySet,
				path: sPath
			};
		}

		// Expose selected private functions to unit tests
		//
		/* eslint-disable */
		var generateRoutingMetadataAndGetRootEntitySet = testableHelper.testableStatic(generateRoutingMetadataAndGetRootEntitySet,
			"routingHelpergenerateRoutingMetadataAndGetRootEntitySet");
		var fnInitialiseRouting = testableHelper.testableStatic(fnInitialiseRouting, "routingHelper_initialiseRouting");
		var fnReadObject = testableHelper.testableStatic(fnReadObject, "routingHelper_readObject");
		var fnProcessStartupParameters = testableHelper.testableStatic(fnProcessStartupParameters, "routingHelper_processStartupParameters");
		/* eslint-enable */

		return {
			startupRouter: fnStartupRouter,
			determinePath: fnDeterminePath,
			determineNavigationPath: fnDetermineNavigationPath
		};
	});