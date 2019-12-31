sap.ui.define(["jquery.sap.global", "sap/ui/base/Object", "sap/f/FlexibleColumnLayoutSemanticHelper", "sap/f/LayoutType"],
	function(jQuery, BaseObject, FlexibleColumnLayoutSemanticHelper, LayoutType) {
		"use strict";
		
		// routing helper is not part of sap.ui.define in order to avoid cyclic dependencies
		function onRoutingHelper(fnOnRoutingHelper){
			sap.ui.require(["sap/suite/ui/generic/template/lib/routingHelper"], fnOnRoutingHelper);
		}
		
		var oResolvedPromise = Promise.resolve(); // constant for a trivial resolved Promise
		
		var iDefaultColumn = 2;
		
		var aColumnNames = ["begin", "mid", "end"];
		
		var aMessagePageTargets = ["messagePageBeginColumn", "messagePageMidColumn", "messagePageEndColumn"];
		
		function tVL(iViewLevel){
			return aColumnNames[iViewLevel] ? iViewLevel : iDefaultColumn;
		}
		
		function isInsideFCL(iViewLevel){
			return 	tVL(iViewLevel) === iViewLevel;
		}
		
		function getPagesAggregation(iViewLevel){
			return 	aColumnNames[tVL(iViewLevel)] + "ColumnPages";
		}
		
		// Adapts the route and returns the control aggregation
		function fnAdaptRoutingInfo(oRoute, sTargetName, aPredecessorTargets){
			oRoute.showBeginColumn = oRoute.viewLevel < 3;
			oRoute.showMidColumn = oRoute.viewLevel === 1 || oRoute.viewLevel === 2;
			oRoute.showEndColumn = oRoute.viewLevel > 1;
			oRoute.target = oRoute.showMidColumn ? aPredecessorTargets.concat([sTargetName]) : sTargetName;
			return getPagesAggregation(oRoute.viewLevel);
		}
		
		function createMessagePageTargets(fnCreateAdditionalMessageTarget){
			for (var i = 0; i < aColumnNames.length; i++){
				fnCreateAdditionalMessageTarget(aMessagePageTargets[i], getPagesAggregation(i));	
			}
		}
		
		function getTargetForMessagePage(iViewLevel){
			return aMessagePageTargets[tVL(iViewLevel)];
		}
		
		function getColumnForViewLevel(iViewLevel){
			return 	aColumnNames[tVL(iViewLevel)];
		}

		function getMethods(oFlexibleColumnLayout, oNavigationControllerProxy) {

			var oFlexibleColumnLayoutSemanticHelper = FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFlexibleColumnLayout, {});
			var oDefaultUiLayouts = oFlexibleColumnLayoutSemanticHelper.getDefaultLayouts();
			var oRouteMatchedEventEndColumn; // TODO1: Comment this
			var oLastRoute;
			var oUiState;
			var sCurrentLayout;
			var sStoredTargetLayout;
			var iMessagePageColumn = -1;
			var oExtendedRoutingInfo;
			
			var oTemplateContract =	oNavigationControllerProxy.oTemplateContract,
				oRouter = oNavigationControllerProxy.oRouter;
			
			function isLayoutDefault(sLayout){
				return sLayout === oDefaultUiLayouts.defaultLayoutType || sLayout === oDefaultUiLayouts.defaultTwoColumnLayoutType || sLayout === oDefaultUiLayouts.defaultThreeColumnLayoutType;
			}
			
			function activateView(oActivationInfo, sPath, sRouteName) {
				var oPromise = oTemplateContract.mRouteToTemplateComponentPromise[sRouteName];
				if (oPromise) {
					return oPromise.then(function(oComponent) {
						return oNavigationControllerProxy.activateOneComponent(sPath, oActivationInfo, oComponent);
					});
				}
				return oResolvedPromise;
			}

			function removeQueryInRouteName(sRouteName) {
				// remove query in sRouteName
				var checkForQuery = sRouteName.substring(sRouteName.length - 5, sRouteName.length);
				if (checkForQuery === "query") {
					return sRouteName.substring(0, sRouteName.length - 5);
				}
				return sRouteName;
			}
			
			function fnAfterActivation(aActivationPromises){
				return Promise.all(aActivationPromises).then(oNavigationControllerProxy.afterActivation);
			}
			
			function fnReplaceLayoutInHash(sNewLayout, bReplace) {
				var bIsDefault = isLayoutDefault(sNewLayout);
				// check wether we are in a query route
				if (oLastRoute.name.lastIndexOf("query") === oLastRoute.name.length - "query".length) {
					oLastRoute.arguments.query = oLastRoute.arguments["?query"];
					if (bIsDefault){
						delete oLastRoute.arguments.query.FCLLayout;
						if (jQuery.isEmptyObject(oLastRoute.arguments.query)){
							delete oLastRoute.arguments.query;
							oLastRoute.name = removeQueryInRouteName(oLastRoute.name);
						}
					} else {
						oLastRoute.arguments.query.FCLLayout = sNewLayout;
					}
				} else if (!bIsDefault){
					oLastRoute.name = oLastRoute.name + "query";
					oLastRoute.arguments.query = {
						FCLLayout : sNewLayout
					};
				}

				var sHash = oRouter.getURL(oLastRoute.name, oLastRoute.arguments);
				// router put unwanted / to the end of the route
				sHash = sHash.replace("/?", "?");
				oNavigationControllerProxy.navigate(sHash, bReplace);
			}
			
			function getMidColumnPathPromise(oConfig, oEvent){
				return new Promise(function(fnResolve){
					onRoutingHelper(function(routingHelper) {
						fnResolve(routingHelper.determinePath(oConfig, oEvent, oTemplateContract.routeViewLevel1.pattern));
					});
				});
			}
			
			function fnDetermineRoutesAndPathes(){
				var fnPromise = function(fnResolve){
					var oRet = {};
					var iViewLevel = oLastRoute.event.getParameter("config").viewLevel;
					if (iViewLevel < 3){
						oRet.begin = {
							route: "root",
							path: "",
							isVisible: oUiState.columnsVisibility.beginColumn
						};
						
						if (iViewLevel === 0){
							fnResolve(oRet);
							return;
						}
					}
					var sRouteName = removeQueryInRouteName(oLastRoute.name);
					
					if (iViewLevel > 0){
						var sPar = getColumnForViewLevel(iViewLevel);
						oRet[sPar] = {
							route: sRouteName,
							path: oLastRoute.path,
							isVisible: iViewLevel > 2 || (iViewLevel === 1 && oUiState.columnsVisibility.midColumn) || (iViewLevel === 2 && oUiState.columnsVisibility.endColumn)
						};
					}
					
					if (iViewLevel === 2) { // activate view in midColumn if we show endColumn
						getMidColumnPathPromise(oLastRoute.routeConfig, oLastRoute.event).then(function(sMidColumnPath){
							oRet.mid = {
								route: oTemplateContract.routeViewLevel1.name,
								path: sMidColumnPath,
								isVisible: oUiState.columnsVisibility.midColumn
							};
							fnResolve(oRet);
						});
					} else {
						fnResolve(oRet);
					}
				};
				return new Promise(fnPromise);
			}

			function fnAdaptToVisibilityChange(oVisibilityChanged){
				var oRouesAndPathesPromise = fnDetermineRoutesAndPathes();
				oRouesAndPathesPromise.then(function(oRoutesAndPathes){
					var aActivationPromises = [];
					var aStaysVisible = [oRoutesAndPathes.begin, oRoutesAndPathes.mid, oRoutesAndPathes.end];
					var oActivationInfo = oNavigationControllerProxy.performPseudoHashChange(aStaysVisible);
					for (var sColumn in oVisibilityChanged){
						if (oVisibilityChanged[sColumn]){
							var oColumnInfo = oRoutesAndPathes[sColumn];
							if (oColumnInfo){
								aActivationPromises.push(activateView(oActivationInfo, oColumnInfo.path, oColumnInfo.route));
							}
							// Note: deactivation is handled by the afterActivation
						}
					}
					fnAfterActivation(aActivationPromises);
				});
			}

			function fnAdaptLayout(bChangedRoute){
				var oNewUiState = oFlexibleColumnLayoutSemanticHelper.getCurrentUIState();
				var oVisibilityChanged = {};
				oVisibilityChanged.end = oUiState && (oUiState.columnsVisibility.endColumn !== oNewUiState.columnsVisibility.endColumn);
				oVisibilityChanged.mid = oUiState && (oUiState.columnsVisibility.midColumn !== oNewUiState.columnsVisibility.midColumn);
				oVisibilityChanged.begin = oUiState && (oUiState.columnsVisibility.beginColumn !== oNewUiState.columnsVisibility.beginColumn);
				oUiState = oNewUiState;
				
				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/midActionButtons", {
					fullScreen: oUiState.actionButtonsInfo.midColumn.fullScreen !== null,
					exitFullScreen: oUiState.actionButtonsInfo.midColumn.exitFullScreen !== null,
					closeColumn: oUiState.actionButtonsInfo.midColumn.closeColumn !== null
				});
				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/endActionButtons", {
					fullScreen: oUiState.actionButtonsInfo.endColumn.fullScreen !== null,
					exitFullScreen: oUiState.actionButtonsInfo.endColumn.exitFullScreen !== null,
					closeColumn: oUiState.actionButtonsInfo.endColumn.closeColumn !== null
				});
				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/isLogicallyFullScreen", oUiState.isLogicallyFullScreen);
				var iHighestViewLevel;
				if (oUiState.columnsVisibility.endColumn){
					iHighestViewLevel = iHighestViewLevel = oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/routeLevel");	
				} else if (oUiState.columnsVisibility.midColumn) {
					iHighestViewLevel = 1;
				} else {
					iHighestViewLevel = 0;
				}
				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/highestViewLevel", iHighestViewLevel);
				
				var iLowestDetailViewLevel;
				if (oUiState.columnsVisibility.midColumn){
					iLowestDetailViewLevel = 1;
				} else {
					iLowestDetailViewLevel = oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/routeLevel");
				}
				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/lowestDetailViewLevel", iLowestDetailViewLevel);
				
				if (oLastRoute && sCurrentLayout !== oUiState.layout){
					fnReplaceLayoutInHash(oUiState.layout, true);
				} else if ((oVisibilityChanged.begin || oVisibilityChanged.mid || oVisibilityChanged.end)  && !bChangedRoute){
					fnAdaptToVisibilityChange(oVisibilityChanged);	
				}
			}

			// we expect oEvent to be a cloned version of UI5 event
			function fnDetermineAndSetContextPath(oEvent, oRouteConfig, sPath, oActivationInfo) {
				return new Promise(function(fnResolve){
					fnAdaptLayout(true);
					var oRoutesAndPathPromise = fnDetermineRoutesAndPathes();
					oRoutesAndPathPromise.then(function(oRoutesAndPathes){
						oExtendedRoutingInfo = oRoutesAndPathes;
						var aActivationPromises = [];
						for (var sColumn in oRoutesAndPathes){
							var oColumnInfo = oRoutesAndPathes[sColumn];
							if (oColumnInfo.isVisible){
								aActivationPromises.push(activateView(oActivationInfo, oColumnInfo.path, oColumnInfo.route));
							}
						}
						fnAfterActivation(aActivationPromises).then(fnResolve);
					});
				});
			}
			
			function fnHandleBeforeRouteMatched(oEvent){
				var iViewLevel = oEvent.getParameter("config").viewLevel;
				var oQuery = oEvent.getParameter("arguments")["?query"];
				if (isInsideFCL(iViewLevel)){
					sCurrentLayout = (oQuery && oQuery.FCLLayout);
					if (!sCurrentLayout){
						switch (iViewLevel){
							case 0:
								sCurrentLayout = oDefaultUiLayouts.defaultLayoutType;
								break;
							case 1:
								sCurrentLayout = oDefaultUiLayouts.defaultTwoColumnLayoutType;
								break;
							case 2:
								sCurrentLayout = oDefaultUiLayouts.defaultThreeColumnLayoutType;
						}
					}
				} else {
					sCurrentLayout = LayoutType.EndColumnFullScreen;	
				}
				oFlexibleColumnLayout.setLayout(sCurrentLayout);				
			}

			// we expect oEvent to be a cloned version of UI5 event
			function fnHandleRouteMatched(oEvent, oRouteConfig, sPath, oActivationInfo) {
				iMessagePageColumn = -1;
				var iViewLevel = oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/routeLevel");
				oRouteMatchedEventEndColumn = iViewLevel === 2 ? oEvent : null;
				
				oLastRoute = {
					name: oEvent.getParameter("name"),
					arguments: oEvent.getParameter("arguments"),
					path: sPath,
					event: oEvent,
					routeConfig: oRouteConfig
				};

				return fnDetermineAndSetContextPath(oEvent, oRouteConfig, sPath, oActivationInfo);
			}

			function getAppStateFromLayout(sLayout){
				return isLayoutDefault(sLayout) ? {}  : {
					FCLLayout: [sLayout]
				};
			}
			
			function isFullscreenLayout(sLayout){
				return sLayout === LayoutType.EndColumnFullScreen || sLayout === LayoutType.MidColumnFullScreen;
			}

			// returns a Promise that resolves to the parameter string for the given target level
			function getAppStateParStringForNavigation(iLevel, oAppStates) {
				if (!isInsideFCL(iLevel)) {
					return oNavigationControllerProxy.getParStringPromise(oAppStates, false);
				}				
				var sNextUiLayout = sStoredTargetLayout || oFlexibleColumnLayoutSemanticHelper.getNextUIState(iLevel).layout;		
				jQuery.extend(oAppStates, getAppStateFromLayout(sNextUiLayout));
				sStoredTargetLayout = null;
				if (isFullscreenLayout(sNextUiLayout)){
					return oNavigationControllerProxy.getParStringPromise(oAppStates, false);	
				}
				var oLevel1Promise = (iLevel === 2) ? oNavigationControllerProxy.addUrlParameterInfoForRoute(oTemplateContract.routeViewLevel1.name, oAppStates) : oResolvedPromise;
				return new Promise(function(fnResolve){
					oLevel1Promise.then(function(){
						oNavigationControllerProxy.getParStringPromise(oAppStates, true).then(fnResolve);	
					});	
				});				
			}

			/******************************************
			 * begin: Event Handlers for common FCL Action Buttons
			 ******************************************/

			function onCloseMidColumnPressed() {
				oNavigationControllerProxy.navigateToRoot(true);
			}

			function onCloseEndColumnPressed() {
				sStoredTargetLayout = oUiState.actionButtonsInfo.endColumn.closeColumn;
				var oRouteConfigEndColumn = oRouteMatchedEventEndColumn.getParameter("config");
				getMidColumnPathPromise(oRouteConfigEndColumn, oRouteMatchedEventEndColumn).then(function(sMidColumnPath){
					// TODO2: check whether DisplayMode can be determined in advance
					oNavigationControllerProxy.navigateToContext(sMidColumnPath, null, true, 0);
				});		
			}
			
			function fnNavigateByReplacingAppState(oAppStates, bAddLevel0Info){
				var sHash = oNavigationControllerProxy.oHashChanger.getHash() || "";
				sHash = sHash.split("?")[0];			
				var oParStringPromise = oNavigationControllerProxy.getParStringPromise(oAppStates, bAddLevel0Info);
				oNavigationControllerProxy.navigateToParStringPromise(sHash, oParStringPromise, false);					
			}

			function onFullscreenColumnPressed() {
				// we rely on the fact that fullScreen property is not null for exactly one column
				var sTargetLayout = oUiState.actionButtonsInfo.midColumn.fullScreen;
				var sRoute;
				if (sTargetLayout === null){
					sTargetLayout = oUiState.actionButtonsInfo.endColumn.fullScreen;
					var aComponents = oNavigationControllerProxy.getActiveComponents();
					for (var i = 0; i < aComponents.length; i++){
						var oRegistryEntry = oTemplateContract.componentRegistry[aComponents[i]];
						if (oRegistryEntry.viewLevel === 2){
							sRoute = oRegistryEntry.route;
							break;
						}
					}
				} else {
					sRoute = oTemplateContract.routeViewLevel1.name;
				}
				var oAppStates = getAppStateFromLayout(sTargetLayout);
				oNavigationControllerProxy.addUrlParameterInfoForRoute(sRoute, oAppStates).then(function(){
					fnNavigateByReplacingAppState(oAppStates, false);
				});
			}

			function onExitFullscreenColumnPressed() {
				// we rely on the fact that exitFullScreen property is not null for exactly one column
				var sTargetLayout = oUiState.actionButtonsInfo.midColumn.exitFullScreen;
				var oLevel2Promise;
				var oMidColumnPathPromise;
				if (sTargetLayout === null){
					sTargetLayout = oUiState.actionButtonsInfo.endColumn.exitFullScreen;
				}
				var oAppStates = getAppStateFromLayout(sTargetLayout);
				if (sTargetLayout === oUiState.actionButtonsInfo.endColumn.exitFullScreen){
					var aComponents = oNavigationControllerProxy.getActiveComponents();
					var sComponentId = aComponents[0];
					var oRegistryEntry = oTemplateContract.componentRegistry[sComponentId];
					if (oRegistryEntry){
						oLevel2Promise = oNavigationControllerProxy.addUrlParameterInfoForRoute(oRegistryEntry.route, oAppStates);
						oMidColumnPathPromise = getMidColumnPathPromise(oLastRoute.routeConfig, oLastRoute.event);
					}
				}
				(oLevel2Promise || oResolvedPromise).then(function(){
					(oMidColumnPathPromise || oResolvedPromise).then(function(sMidColumnPath){
						var oLevel1Promise = oNavigationControllerProxy.addUrlParameterInfoForRoute(oTemplateContract.routeViewLevel1.name, oAppStates, sMidColumnPath);
						oLevel1Promise.then(function(){
							fnNavigateByReplacingAppState(oAppStates, true);
						});
					});
				});
			}

			function getActionButtonHandlers(iViewLevel) {
				return isInsideFCL(iViewLevel) && {
					onCloseColumnPressed: iViewLevel === 1 ? onCloseMidColumnPressed : onCloseEndColumnPressed,
					onFullscreenColumnPressed: onFullscreenColumnPressed,
					onExitFullscreenColumnPressed: onExitFullscreenColumnPressed
				};
			}

			/******************************************
			 * end: Event Handlers for common FCL Action Buttons
			 *******************************************/
			 
			function getDraftSibling(oContext) {
				return oTemplateContract.oApplicationProxy.getDraftSiblingPromise(oContext);                         
			}
			
			 function fnNavigateToDraft(oDraftContextRootEntity) {
				// navigate to draft
				if (oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/FCL/highestViewLevel") === 2){
					var oRouteConfigEndColumn = oRouteMatchedEventEndColumn.getParameter("config");
					var oComponentPromise = oTemplateContract.mRouteToTemplateComponentPromise[removeQueryInRouteName(oRouteConfigEndColumn.name)];
					oComponentPromise.then(function(oComponent){
						var oBindingContextEndColumn = oComponent.getBindingContext();
						var oDraftSiblingPromise = getDraftSibling(oBindingContextEndColumn, true);
						oDraftSiblingPromise.then(function(oDraftContext){
							onRoutingHelper(function(routingHelper) {
								var sNavigationProperty = oRouteConfigEndColumn.navigationProperty;
								var sContextPath = oDraftContextRootEntity.getPath() + "/" + routingHelper.determineNavigationPath(oDraftContext, sNavigationProperty).path;
								sStoredTargetLayout = oUiState.layout;
								oNavigationControllerProxy.navigateToContext(sContextPath, null, true, 2);
							});
						});
					});
				} else {
					oNavigationControllerProxy.navigateToContext(oDraftContextRootEntity, null, true, 2);
				}
			 }
			
			function getTargetAfterCancelPromise(oActive){
				if (oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/FCL/highestViewLevel") !== 2){
					return Promise.resolve(oActive);
				}
				return new Promise(function(fnResolve){
					var oRouteConfigEndColumn = oRouteMatchedEventEndColumn.getParameter("config");
					var oComponentPromise = oTemplateContract.mRouteToTemplateComponentPromise[removeQueryInRouteName(oRouteConfigEndColumn.name)];
					oComponentPromise.then(function(oComponent){
						var oBindingContextEndColumn = oComponent.getBindingContext();
						var oDraftSiblingPromise = getDraftSibling(oBindingContextEndColumn, true);
						oDraftSiblingPromise.then(function(oDraftContext){
							if (!oDraftContext){
								fnResolve(oActive);
								return;
							}
							onRoutingHelper(function(routingHelper) {
								var sNavigationProperty = oRouteConfigEndColumn.navigationProperty;
								var sContextPath = oActive.getPath() + "/" + routingHelper.determineNavigationPath(oDraftContext, sNavigationProperty).path;
								fnResolve(sContextPath);
							});
						});
					});
				});
			}
			
			// Asumption: Deleted Objects have level iViewLevel + 1 (deleteEntities)
			function adaptAfterDeletion(aDeletedPath, iViewLevel){
				var bMidColumnClose = oExtendedRoutingInfo.mid && aDeletedPath.indexOf(oExtendedRoutingInfo.mid.path) >= 0;
				var bEndColumnClose = oExtendedRoutingInfo.end && aDeletedPath.indexOf(oExtendedRoutingInfo.end.path) >= 0;
				
				if (bMidColumnClose){
					oNavigationControllerProxy.navigateToRoot(true);
				} else if (bEndColumnClose){
					oNavigationControllerProxy.navigateToContext(oExtendedRoutingInfo.mid.path, null, true);
				}
			}
			
			oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL", { });
			
			// This function indicates if a new HistoryEntry is required.
			// A new HistoryEntry is only required if the user navigates to an object which will be displayed in a new column.
			// If the object will be displayed in a column which is already visible no HistoryEntry is required
			function isNewHistoryEntryRequired(oTarget){
				var iTargetLevel = oNavigationControllerProxy.getTargetLevel(oTarget);
				
				switch (iTargetLevel){
					case 1:
						return !oUiState.columnsVisibility.midColumn;
					case 2:
						return !oUiState.columnsVisibility.endColumn;
					default:
						return true;
				}
			}
			
			function fnCloseRightColumns(iViewLevel) {
				sCurrentLayout = oFlexibleColumnLayoutSemanticHelper.getNextUIState(iViewLevel).layout;
				oFlexibleColumnLayout.setLayout(sCurrentLayout);
			}
			
			function setTitleForActiveComponent(oTitleProvider, fnSetTitleForComponent){
				fnSetTitleForComponent(oUiState.isLogicallyFullScreen && oTitleProvider);
			}
			
			function fnDisplayMessagePage(mParameters){
				iMessagePageColumn = tVL(mParameters.viewLevel);
				fnCloseRightColumns(mParameters.viewLevel);
				var oTargets = oNavigationControllerProxy.oRouter.getTargets();
				var sTarget = getTargetForMessagePage(mParameters.viewLevel);
				oTargets.display(sTarget);
				var aStaysVisible;
				if (mParameters.viewLevel === iMessagePageColumn){
					aStaysVisible = [];
					for (var i = 0; i < mParameters.viewLevel; i++){
						aStaysVisible.push(true);
					}
				}
				return aStaysVisible;
			}
			
			// Is the view on level iViewLevel displayed and is it not the MessagePage
			function isLevelActive(iViewLevel){
				if (iViewLevel < iMessagePageColumn || iMessagePageColumn < 0){
					return oUiState.columnsVisibility[getColumnForViewLevel(iViewLevel) + "Column"];
				}
				return false;
			}
			
			function fnAdaptBreadCrumbUrl(sHash, iViewLevel){
				if (!isInsideFCL(iViewLevel)){
					return sHash;
				}
				var sLayout = oFlexibleColumnLayoutSemanticHelper.getNextUIState(iViewLevel).layout;
				if (isLayoutDefault(sLayout)){
					return sHash;
				}
				return sHash + "?FCLLayout=" + sLayout;
			}
			
			oFlexibleColumnLayout.attachStateChange(fnAdaptLayout.bind(null, false));
			
			return {
				adaptRoutingInfo: fnAdaptRoutingInfo,
				createMessagePageTargets: createMessagePageTargets,
				displayMessagePage: fnDisplayMessagePage,
				isLevelActive: isLevelActive,
				handleBeforeRouteMatched: fnHandleBeforeRouteMatched,
				handleRouteMatched: fnHandleRouteMatched,
				getAppStateParStringForNavigation: getAppStateParStringForNavigation,
				getActionButtonHandlers: getActionButtonHandlers,
				navigateToDraft: fnNavigateToDraft,
				getTargetAfterCancelPromise: getTargetAfterCancelPromise,
				adaptAfterDeletion: adaptAfterDeletion,
				isNewHistoryEntryRequired: isNewHistoryEntryRequired,
				setTitleForActiveComponent: setTitleForActiveComponent,
				adaptBreadCrumbUrl: fnAdaptBreadCrumbUrl
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.lib.FlexibleColumnLayoutHandler", {
			constructor: function(oFlexibleColumnLayout, oNavigationControllerProxy) {
				jQuery.extend(this, getMethods(oFlexibleColumnLayout, oNavigationControllerProxy));
			}
		});
	});