/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// ------------------------------------------------------------------------------------------------------------
// This class handles inner app navigation for Smart Template based apps.
// The class exposes its services in two ways:
// 1. There is a public API providing the navigation methods navigateToRoot, navigateToContext, navigateToMessagePage, and navigateBack
//    to Template developers and even Breakout developers.
// 2. A richer object oNavigationControllerProxy is created (see constructor) which is used by the core classes of the SmartTemplate framework.
//    This object allows more detailed interaction with navigation.

// Within this class we differentiate between a number of different scenarios for url-changes:
// 1. A state change is a change of the url which does not lead to a new route, but just modifies the encoding of the internal state of one view in the
//    url. Whenever a route matched event occurs it is first checked, whether this corresponds to a state change.
//    If this is true, we do not consider it as a navigation and all further handling of the url within this class is stopped. 
//    It is assumed that the state change is totally controlled by the component that has initiated the state change.
//    Note that agents might register themselves as possible state changers via sap.suite.ui.generic.template.lib.Application.registerStateChanger.
//    A new url is passed to the registered state changers one after the other (method isStateChange). If any of those returns true the processing
//    of the url is stopped.
// 2. Illegal urls: The user enters a url which belongs to this App but not to a legal route. This is not considered as a navigation. 
// 3. Back navigation: Back navigation can be triggered by the user pressing the browser-back button (then we have no control), the user pressing the
//    back button within the App, or programmatically (e.g. after cancelling an action).
// 3. Programmatic (forward) navigation: The program logic often demands the navigation to be triggerd programmatically. Such navigation is always forwarded to
//    function fnNavigate. Note that this function automatically performs a back navigation, when the navigation target is the same as the last history entry.
//    Note that it is also possible to navigate programmatically to the MessagePage. However, this does not change the url and is therefore not considered as 
// 5. Manual navigation: The user can navigate inside the running App by modifying the url manually (more probable: by selecting a bookmark/history entry
//    which leads to some other place within the App). Note that in this case the navigation may be totally uncontrolled within the App.
// ------------------------------------------------------------------------------------------------------------
sap.ui.define([
	"jquery.sap.global", "sap/ui/base/Object", "sap/ui/core/ComponentContainer", "sap/ui/core/routing/HashChanger", "sap/ui/core/routing/History", "sap/ui/core/routing/HistoryDirection",
	"sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/m/MessageBox", "sap/m/MessagePage", "sap/m/Link",
	"sap/suite/ui/generic/template/lib/ProcessObserver", "sap/suite/ui/generic/template/lib/routingHelper", 
	"sap/suite/ui/generic/template/lib/TemplateComponent", "sap/suite/ui/generic/template/lib/testableHelper"
], function(jQuery, BaseObject, ComponentContainer, HashChanger, History, HistoryDirection, Filter, FilterOperator, MessageBox, MessagePage, Link, 
	ProcessObserver, routingHelper, TemplateComponent, testableHelper) {
	"use strict";
	
	var oHistory = History.getInstance();

	// Private static methods
	
	function fnNormalizeHash(sHash) {
		if (sHash.indexOf("/") === 0){
			return sHash;
		}
		return "/" + sHash;
	}
	/*
	 * Creates a new ComponentContainer with template from routing configuration
	 * @param {Object}oAppComponentg - the application component
	 * @param {Object} oRouteConfig - the route configuration
	 * @returns {sap.ui.core.ComponentContainer} instance of the component container
	 */
	function fnCreateComponentInstance(oTemplateContract, oRouteConfig, fnComponentCreateResolve) {
		var sTemplate = oRouteConfig.template;
		var sEntitySet = oRouteConfig.entitySet;
		var iViewLevel = oRouteConfig.viewLevel;
		var iObserverIndex = -1;
		if (oTemplateContract.oFlexibleColumnLayoutHandler){
			iObserverIndex = iViewLevel < 3 ? iViewLevel : 0;	
		}
		var oNavigationObserver = iObserverIndex < 0 ? oTemplateContract.oNavigationObserver : oTemplateContract.aNavigationObservers[iObserverIndex];
		var oHeaderLoadingObserver = new ProcessObserver();
		var oLoadingObserverParent = iObserverIndex < 0 ? oTemplateContract.oHeaderLoadingObserver : oTemplateContract.aHeaderLoadingObservers[iObserverIndex];
		oLoadingObserverParent.addObserver(oHeaderLoadingObserver);
		var oPreprocessorsData = {};
		var oSettings = {
			appComponent: oTemplateContract.oAppComponent,
			isLeaf: !oRouteConfig.pages || !oRouteConfig.pages.length,
			subPages: oRouteConfig.pages,
			entitySet: sEntitySet,
			navigationProperty: oRouteConfig.navigationProperty,
			routeConfig: oRouteConfig,
			componentData: {
				registryEntry: {
					componentCreateResolve: fnComponentCreateResolve,
					route: oRouteConfig.name,
					viewLevel: iViewLevel,
					oNavigationObserver: oNavigationObserver,
					oHeaderLoadingObserver: oHeaderLoadingObserver,
					preprocessorsData: oPreprocessorsData
				}
			}
		};
		
		if (oRouteConfig.component.settings) {
			// consider component specific settings from app descriptor
			jQuery.extend(oSettings, oRouteConfig.component.settings);
		}
		
		var oComponentContainer;
		// Note: settings are passed to Component and to ComponentContainer. This has to be revisited.
		oTemplateContract.oAppComponent.runAsOwner(function() {
			try {
				var oComponentPromise = sap.ui.component({
					name: sTemplate,
					settings: oSettings,
					handleValidation: true,
					async: true
				});
	
				var oLoadedPromise;
	
				oComponentContainer = new ComponentContainer({
					propagateModel: true,
					width: "100%",
					height: "100%",
					settings: oSettings
				});
	
				oLoadedPromise = oComponentPromise.then(function(oComponent) {
					oComponentContainer.setComponent(oComponent);
					return oComponentContainer;
				});
	
	
				// add the 'loaded' function to make the component container behave the same as a view
				oComponentContainer.loaded = function() {
					return oLoadedPromise;
				};
			} catch (e) {
				throw new Error("Component " + sTemplate + " could not be loaded");
			}
		});
		return oComponentContainer;
	}

	// Definition of instance methods
	function getMethods(oTemplateContract, oNavigationControllerProxy) {
		
		var mMessagePageParams = {};
		var oCurrentHash = {	// this variable contains some information about the current navigation state. A new instance is created each navigation step (when the url is caught)
			iHashChangeCount: 0, // the value of this property is increased with each navigation step
			backTarget: 0
		};
		var oActivationPromise = Promise.resolve(); // Enables to wait for the end of the current activation of all components
		
		var aPreviousHashes = []; // array of previous instances of oCurrentHash. Length should always be identical to oCurrentHash.iHashChangeCount

		function getRootComponentPromise(){
			// Make sure that the loading of the root component starts
			var oViews = oNavigationControllerProxy.oRouter.getViews();
			oViews.getView({
				viewName: "root"	
			});
			return oTemplateContract.mRouteToTemplateComponentPromise.root;
		}

		var oAppTitlePromise;
		function getAppTitlePromise(){
			if (!oAppTitlePromise){
				var oRootComponentPromise =	getRootComponentPromise();
				return oRootComponentPromise.then(function(oRootComponent){
					return oRootComponent.getModel("i18n").getResourceBundle().getText("PAGEHEADER");
				});
			}
			return oAppTitlePromise;
		}
		
		function getCurrenActivationTakt(){
			return oCurrentHash.iHashChangeCount;
		}
		
		function fnSetTitleForComponent(oTitleProvider){
			var oTitlePromise;
			if (oTitleProvider instanceof TemplateComponent){
				var oRegistryEntry = oTitleProvider && oTemplateContract.componentRegistry[oTitleProvider.getId()];
				var fnGetTitle = oRegistryEntry && oRegistryEntry.methods.getTitle;
				oTitlePromise = fnGetTitle && Promise.resolve(fnGetTitle());
			} else if (oTitleProvider && oTitleProvider.title){
				oTitlePromise = Promise.resolve(oTitleProvider.title);
			} 
			oTitlePromise = oTitlePromise || getAppTitlePromise();
			
			oTitlePromise.then(function(sTitle){
				if (oTemplateContract.oShellService) {
					oTemplateContract.oShellService.setTitle(sTitle);
				}					
			});
		}
		
		function fnActivateMessageButtonHelpers(mViewLevel2MessageButtonHelper, maxActiveViewLevel){
			var oMaster;
			var aSlaves = [];
			for (var i = 0; i <= maxActiveViewLevel; i++){
				var oMessageButtonHelper = mViewLevel2MessageButtonHelper[i];
				if (oMessageButtonHelper){
					if (oMaster){
						aSlaves.push(oMessageButtonHelper);
					} else {
						oMaster = oMessageButtonHelper;
					}
				}
			}
			if (oMaster){
				oMaster.resume(aSlaves);
			}
		}
		
		// This method is called when all views have been set to their places
		function fnAfterActivationImpl(oTitleProvider){
			var aPageDataLoadedPromises = [oTemplateContract.oPagesDataLoadedObserver.getProcessFinished(true)];
			var oActiveComponent = null;
			var iCurrentHashCount = oCurrentHash.iHashChangeCount;
			var maxActiveViewLevel = -1;
			var mViewLevel2MessageButtonHelper = {};
			for (var sComponentId in oTemplateContract.componentRegistry){
				var oRegistryEntry = oTemplateContract.componentRegistry[sComponentId];
				var oMessageButtonHelper = oRegistryEntry.oControllerRegistryEntry.oTemplateUtils.oServices.oTemplateCapabilities.oMessageButtonHelper;
				if (oRegistryEntry.activationTakt < iCurrentHashCount){ // component is currently not active
					oRegistryEntry.utils.suspendBinding();
					if (oMessageButtonHelper){
						oMessageButtonHelper.suspend();
					}
				} else {
					aPageDataLoadedPromises.push(oRegistryEntry.oViewRenderdPromise);
					if (oRegistryEntry.viewLevel > maxActiveViewLevel){
						maxActiveViewLevel = oRegistryEntry.viewLevel;
						oActiveComponent = oRegistryEntry.oComponent;
					}
					mViewLevel2MessageButtonHelper[oRegistryEntry.viewLevel] = oMessageButtonHelper;
				}
			}
			fnActivateMessageButtonHelpers(mViewLevel2MessageButtonHelper, maxActiveViewLevel);
			var oElementBinding = oActiveComponent && oActiveComponent.getComponentContainer().getElementBinding();
			oCurrentHash.bindingPath = oElementBinding && fnNormalizeHash(oElementBinding.getPath());
			oTitleProvider = oTitleProvider || oActiveComponent;
			if (oTemplateContract.oFlexibleColumnLayoutHandler){
				oTemplateContract.oFlexibleColumnLayoutHandler.setTitleForActiveComponent(oTitleProvider, fnSetTitleForComponent);	
			} else {
				fnSetTitleForComponent(oTitleProvider);
			}
			Promise.all(aPageDataLoadedPromises).then(function(){
				if (iCurrentHashCount === oCurrentHash.iHashChangeCount && jQuery.isEmptyObject(mMessagePageParams)){ 
					oTemplateContract.oAppComponent.firePageDataLoaded();
				}
			});
		}
		
		// Default call
		var fnAfterActivation = fnAfterActivationImpl.bind(null, null); // do not pass a TitleProvider/forward to fnAfterActivationImpl
		
		function fnAddUrlParameterInfoForRoute(sRoute, oAppStates, sPath) {
			var fnExtendPars = function(oNewPars){
				jQuery.extend(oAppStates, oNewPars);	
			};
			for (var sPar in oTemplateContract.componentRegistry){
				var oComponentRegistryEntry = oTemplateContract.componentRegistry[sPar];
				if (oComponentRegistryEntry.route === sRoute){
					var getUrlParameterInfo = oComponentRegistryEntry.methods.getUrlParameterInfo; 
					return getUrlParameterInfo ? getUrlParameterInfo(sPath).then(fnExtendPars) : Promise.resolve();
				}
			}
			return Promise.resolve();		
		}
		
		function fnGetParStringPromise(oAppStates, bAddLevel0Info){
			var oAppStatePromise = bAddLevel0Info ? fnAddUrlParameterInfoForRoute("root", oAppStates) : Promise.resolve();
			return oAppStatePromise.then(function(){
				var sDelimiter = "";
				var sRet = "";
				for (var sPar in oAppStates){
					var aValues = oAppStates[sPar];
					for (var i = 0; i < aValues.length; i++){
						var sValue = aValues[i];	
						sRet = sRet + sDelimiter + sPar + "=" + sValue;
						sDelimiter = "&";
					}
				}								
				return sRet;					
			});
		}
		
		// Start: navigation methods

		function fnNavigateBack(){
			jQuery.sap.log.info("Navigate back");
			if (oCurrentHash.backTarget && fnNormalizeHash(oHistory.getPreviousHash() || "") !== fnNormalizeHash(oCurrentHash.hash)){
				oTemplateContract.oBusyHelper.setBusyReason("HashChange", true);
			}
			oCurrentHash.LeaveByBack = true;
			window.history.back();			
		}
		
		/*
		 * Sets/Replaces the hash via the router/hash changer
		 * @param {string} sHash - the hash string
		 * @param {boolean} bReplace - whether the hash should be replaced
		 */
		function fnNavigate(sHash, bReplace) {
			sHash = sHash || ""; // normalization (to avoid an 'undefined' in the url)
			jQuery.sap.log.info("Navigate to hash: " + sHash);
			if (sHash === oCurrentHash.hash){
				jQuery.sap.log.info("Navigation suppressed since hash is the current hash");
				return; // ignore navigation that does nothing
			}
			oTemplateContract.oBusyHelper.setBusyReason("HashChange", true);
			oCurrentHash.targetHash = sHash;
			if (oCurrentHash.backTarget && fnNormalizeHash(oHistory.getPreviousHash() || "") === fnNormalizeHash(sHash)){
				fnNavigateBack();
				return;
			}
			oCurrentHash.LeaveByReplace = bReplace;
			if (bReplace) {
				oNavigationControllerProxy.oHashChanger.replaceHash(sHash);
			} else {
				oNavigationControllerProxy.oHashChanger.setHash(sHash);
			}
		}
		
		function fnNavigateToParStringPromise(sPath, oParStringPromise, bReplace, oBackwardingInfo){
			oParStringPromise.then(function(sPars){
				if (sPars){
					sPath = sPath + "?" + sPars;
				}
				if (oBackwardingInfo){
					oCurrentHash.backwardingInfo = {
						backCount: oBackwardingInfo.backCount,
						targetViewLevel: oBackwardingInfo.targetViewLevel,
						path: sPath
					};
					fnNavigateBack();					
				} else {
					fnNavigate(sPath, bReplace);
				}
			});
			oTemplateContract.oBusyHelper.setBusy(oParStringPromise);
		}
		
		function getBackLengthToRoot(bOnlyDirect){
			var iRet = 0;
			for (var oHash = oCurrentHash; oHash.oEvent; ){
				var iViewLevel = oHash.oEvent.getParameter("config").viewLevel;
				if (iViewLevel === 0){
					return iRet;
				}
				if (bOnlyDirect && iRet > 0){
					return -1;
				}
				iRet++;
				oHash = aPreviousHashes[oHash.backTarget];
			}
			return -1;
		}

		// Navigates to the root page. Thereby it restores the iappstate the root page was left (if we have already been there)
		function fnNavigateToRoot(bReplace) {
			var iBackLengthToRoot = getBackLengthToRoot(!bReplace);
			var oParStringPromise = fnGetParStringPromise({}, true);
			var oBackwardingInfo = (iBackLengthToRoot > 0) && {
				backCount: iBackLengthToRoot,
				targetViewLevel: 0			
			};
			fnNavigateToParStringPromise("", oParStringPromise, bReplace, oBackwardingInfo);
		}
		
		function getTargetComponentPromises(oTarget){
			var sRouteName = oTemplateContract.mEntityTree[oTarget.entitySet].sRouteName;
			var oComponentPromise = oTemplateContract.mRouteToTemplateComponentPromise[sRouteName];
			return [oComponentPromise];
		}
		
		function fnPresetDisplayMode(aTargetComponentPromises, iDisplayMode){
			var iCurrentTakt = oCurrentHash.iHashChangeCount;
			var fnPreset = function(oComponent){
				var oRegistryEntry = oTemplateContract.componentRegistry[oComponent.getId()];
				(oRegistryEntry.methods.presetDisplayMode || jQuery.noop)(iDisplayMode, iCurrentTakt === oRegistryEntry.activationTakt);                         
			};
			for (var i = 0; i < aTargetComponentPromises.length; i++){
				var oTargetPromise = aTargetComponentPromises[i];
				oTargetPromise.then(fnPreset);
			}
		}
		
		function getTargetLevel(oTarget) {
			var oTargetTreeNode = oTarget && oTemplateContract.mEntityTree[oTarget.entitySet];
			var iTargetLevel = oTargetTreeNode ? oTargetTreeNode.level : 1;
			return iTargetLevel;
		}

		// vTargetContext is either a string or an object. Only in the second case sNavigationProperty may be used.
		function fnNavigateToContextImpl(vTargetContext, sNavigationProperty, bReplace, iDisplayMode, oQuery) {
			var sPath;

			var oTarget, iTargetLevel;
			var aTargetComponentPromises = [];
			if (typeof vTargetContext === "string"){
				sPath = vTargetContext;
				iTargetLevel = fnNormalizeHash(sPath).split("/").length - 1;
			} else {
			// get the navigation path from binding context
				oTarget = routingHelper.determineNavigationPath(vTargetContext, sNavigationProperty);
				iTargetLevel = getTargetLevel(oTarget);
				sPath = oTarget.path;
				aTargetComponentPromises = getTargetComponentPromises(oTarget);
			}
			if (sPath) {
				if (sNavigationProperty) {
					var aParts = oTemplateContract.oApplicationProxy.getHierarchySectionsFromCurrentHash();              
	
					for (var i = iTargetLevel - 2; i >= 0; i--){
						sPath = aParts[i] + "/" + sPath;	
					}
					sPath = "/" + sPath;
				}
				fnPresetDisplayMode(aTargetComponentPromises, iDisplayMode || 0);
				// navigate to context
				if (oQuery){
					var sQuery = "";
					var sDelim = "&";
					for (var sPar in oQuery){
						sQuery = sQuery + sDelim + sPar + "=" + oQuery[sPar];
						sDelim = "&";
					}
					if (sQuery){
						sPath = sPath + "?" + sQuery;
					}
					fnNavigate(sPath, bReplace);
				} else {
					var oAppStates = {};
					// Currently, it seems cumbersome to get the route name in case no target is available (i.e. vTargetContext was only a string).
					// It is however only needed for the theoretical case of object pages providing appstates, which is currently not the case.
					// Therefore, the routename is not determined in the cumbersome cases.
					var sRoute = oTarget && oTemplateContract.mEntityTree[oTarget.entitySet].sRouteName;
					var oNavigationPromise = fnAddUrlParameterInfoForRoute(sRoute, oAppStates, sPath).then(function(){
						var oParStringPromise = oTemplateContract.oFlexibleColumnLayoutHandler ? 
							oTemplateContract.oFlexibleColumnLayoutHandler.getAppStateParStringForNavigation(iTargetLevel, oAppStates) :
							fnGetParStringPromise(oAppStates, false);
						var oPreviousHash = aPreviousHashes[oCurrentHash.backTarget];
						var oBackwardingInfo = (oPreviousHash.hash && fnNormalizeHash(oPreviousHash.hash.split("?")[0]) === fnNormalizeHash(sPath)) && { backCount: 1 };
						fnNavigateToParStringPromise(sPath, oParStringPromise, bReplace, oBackwardingInfo);
					});
					oTemplateContract.oBusyHelper.setBusy(oNavigationPromise);
				}
			}
		}
		
		function fnNavigateToContext(vTargetContext, sNavigationProperty, bReplace, iDisplayMode) {
			return fnNavigateToContextImpl(vTargetContext, sNavigationProperty, bReplace, iDisplayMode);	
		}
		
		function fnPerformPseudoHashChange(aStaysVisible){
			var iLastHashCount = oCurrentHash.iHashChangeCount;
			oCurrentHash.iHashChangeCount++;
			aPreviousHashes.push(null);
			if (aStaysVisible){
				for (var sPar in oTemplateContract.componentRegistry){
					var oRegistryEntry = oTemplateContract.componentRegistry[sPar];
					if (oRegistryEntry.activationTakt === iLastHashCount && aStaysVisible[oRegistryEntry.viewLevel]){
						oRegistryEntry.activationTakt = oCurrentHash.iHashChangeCount;	
					}
				}
			}
			return {
				iHashChangeCount: oCurrentHash.iHashChangeCount
			};
		}
		
		function fnTransferMessageParametersToGlobalModelAndDisplayMessage(mParameters) {
			var sEntitySet, sText, oEntitySet, oEntityType, oHeaderInfo, sIcon = null,
				oMetaModel, sDescription;
			if (mParameters) {
				sEntitySet = mParameters.entitySet;
				sText = mParameters.text;
				sIcon = mParameters.icon;
				sDescription = mParameters.description;
			}

			if (sEntitySet) {
				oMetaModel = oTemplateContract.oAppComponent.getModel().getMetaModel();
				if (oMetaModel) {
					oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
					oHeaderInfo = oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"];
				}
				if (oHeaderInfo && oHeaderInfo.TypeImageUrl && oHeaderInfo.TypeImageUrl.String) {
					sIcon = oHeaderInfo.TypeImageUrl.String;
				}
			}
			
			oTemplateContract.oNoOwnTitlePromise.then(function(bNoOwnTitle) {
				if (oTemplateContract.oShellService) {
					oTemplateContract.oShellService.setBackNavigation(undefined);
				}
			});
			oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/messagePage", {
				text: sText,
				icon: sIcon,
				description: sDescription
			});
			
			var aLevelsBecomingInvisible;
			if (oNavigationControllerProxy.oTemplateContract.oFlexibleColumnLayoutHandler){
				aLevelsBecomingInvisible = oNavigationControllerProxy.oTemplateContract.oFlexibleColumnLayoutHandler.displayMessagePage(mParameters);
			} else {
				var oTargets = oNavigationControllerProxy.oRouter.getTargets();
				oTargets.display("messagePage");
			}
			fnPerformPseudoHashChange(aLevelsBecomingInvisible);
			fnAfterActivationImpl(mParameters);
		}
		
		function fnShowStoredMessage(){
			if (!jQuery.isEmptyObject(mMessagePageParams)){
				var mParameters = null;
				for (var i = 0; !mParameters; i++){
					mParameters = mMessagePageParams[i];
				}
				mMessagePageParams = {};
				fnTransferMessageParametersToGlobalModelAndDisplayMessage(mParameters);				
			}
		}

		function fnNavigateToMessagePage(mParameters) {
			if (oNavigationControllerProxy.oTemplateContract.oFlexibleColumnLayoutHandler){
				mParameters.viewLevel = mParameters.viewLevel || 0;
				mMessagePageParams[mParameters.viewLevel] = mParameters;
				var oLoadedFinishedPromise = Promise.all([oActivationPromise, oNavigationControllerProxy.oTemplateContract.oPagesDataLoadedObserver.getProcessFinished(true)]);
				oLoadedFinishedPromise.then(fnShowStoredMessage);
				return;
			}
			fnTransferMessageParametersToGlobalModelAndDisplayMessage(mParameters);
		}

		// End: Navigation methods
		
		function getActiveComponents(){
			var aRet = [];
			var iCurrentHashCount = oCurrentHash.iHashChangeCount;
			for (var sComponentId in oTemplateContract.componentRegistry){
				var oRegistryEntry = oTemplateContract.componentRegistry[sComponentId];
				if (oRegistryEntry.activationTakt === iCurrentHashCount){ // component is currently active
					aRet.push(sComponentId);
				}
			}
			return aRet;
		}

		// Start: Handling url-changes
		
		/*
		 * calls onActivate on the specified view, if it exists
		 * @param {Object} oView - the view
		 * @param {string} sPath - the path in the model
		 * @param {boolean} bDelayedActivate - optional boolean flag, true if activate is (re-)triggered delayed
		 */
		function fnActivateOneComponent(sPath, oActivationInfo, oComponent) {
			var oRegistryEntry = oTemplateContract.componentRegistry[oComponent.getId()] || {};
			var bIsComponentCurrentlyActive = (oRegistryEntry.activationTakt === oActivationInfo.iHashChangeCount - 1);
			oRegistryEntry.activationTakt = oActivationInfo.iHashChangeCount;
			// trigger onActivate on the component instance
			// if Component is assembled without TemplateAssembler it could be that oComponent.onActivate is undefined
			// e.g. an application has an own implementation of Component
			var oRet;
			if (oComponent && oComponent.onActivate) {
				oRet = oComponent.onActivate(sPath, bIsComponentCurrentlyActive);
			}
			return oRet || oRegistryEntry.viewRegisterd;
		}		
		
		/*
		 * calls onActivate on the specified view, if it exists. Only used in the Non-FCL case
		 * @param {Object} oView - the view
		 * @param {string} sPath - the path in the model
		 * @param {boolean} bDelayedActivate - optional boolean flag, true if activate is (re-)triggered delayed
		 */
		function fnActivateComponent(sPath, oActivationInfo, oComponent) {
			return fnActivateOneComponent(sPath, oActivationInfo, oComponent).then(fnAfterActivation);
		}

		function fnAdaptPaginatorInfoAfterNavigation(oEvent, bIsProgrammatic, bIsBack){
			var oNewPaginatorInfo = {};
			if (bIsProgrammatic || bIsBack){
				var iViewLevel = oEvent.getParameter("config").viewLevel;
				var oCurrentPaginatorInfo = oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/paginatorInfo");
				for (var iLevel = 0; iLevel < iViewLevel; iLevel++){
					oNewPaginatorInfo[iLevel] = oCurrentPaginatorInfo[iLevel];	
				}
			}
			oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/paginatorInfo", oNewPaginatorInfo);
		}
		
		function fnGetAlternativeContextPromise(sPath){
			return oTemplateContract.oApplicationProxy.getAlternativeContextPromise(sPath);              
		}
		
		function fnHandleBeforeRouteMatched(oEvent){
			if (oTemplateContract.oFlexibleColumnLayoutHandler){
				oTemplateContract.oFlexibleColumnLayoutHandler.handleBeforeRouteMatched(oEvent);	
			}
		}
		
		// Event handler fired by router once it finds a match
		function fnHandleRouteMatched(oEvent) {
			oTemplateContract.oBusyHelper.setBusyReason("HashChange", false);
			oEvent = jQuery.extend({}, oEvent);
			var iViewLevel = oEvent.getParameter("config").viewLevel;
			var sHash = oNavigationControllerProxy.oHashChanger.getHash() || "";
			jQuery.sap.log.info("Route matched with hash " + sHash);
			if (oCurrentHash.backwardingInfo){
				oCurrentHash.backwardingInfo.backCount--;
				if (oCurrentHash.backwardingInfo.backCount && iViewLevel !== oCurrentHash.backwardingInfo.targetViewLevel){
					oCurrentHash.backTarget = aPreviousHashes[oCurrentHash.backTarget].backTarget;
					oCurrentHash.hash = sHash;
					fnNavigateBack();
					return;
				} else {
					var sTargetHash = oCurrentHash.backwardingInfo.path;
					delete oCurrentHash.backwardingInfo;
					if (sTargetHash !== sHash){
						oCurrentHash.forwardingInfo = {
							bIsProgrammatic: true,
							bIsBack: true,
							iHashChangeCount: oCurrentHash.iHashChangeCount + 1
						};
						fnNavigate(sTargetHash, true);
						return;
					}
				}
			} else if (!oCurrentHash.forwardingInfo){
				// State changers may identify the hash change as something which can be handled by them internally. In this case we do not need to run the whole mechanism
				for (var i = 0; i < oTemplateContract.aStateChangers.length; i++){
					var oStateChanger = oTemplateContract.aStateChangers[i];
					if (oStateChanger.isStateChange(oEvent)){
						return;
					}
				}
			}
			
			oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/routeLevel", iViewLevel);
			var oActivationInfo = oCurrentHash.forwardingInfo;
			delete oCurrentHash.forwardingInfo;
			if (!oActivationInfo){
				oActivationInfo = {};
				var iPreviousHashChangeCount = oCurrentHash.iHashChangeCount;
				oActivationInfo.iHashChangeCount = iPreviousHashChangeCount + 1;
				oActivationInfo.bIsProgrammatic = (sHash === oCurrentHash.targetHash);
				oActivationInfo.bIsBack = !!(oCurrentHash.LeaveByBack || (!oActivationInfo.bIsProgrammatic && (oHistory.getDirection() === HistoryDirection.Backwards)));
				oCurrentHash.LeaveByBack = oActivationInfo.bIsBack;
				oCurrentHash.LeaveByReplace = oActivationInfo.bIsProgrammatic && oCurrentHash.LeaveByReplace;
				var oPreviousHash = oCurrentHash;
				aPreviousHashes.push(oPreviousHash);
				oCurrentHash = { 
					iHashChangeCount: oActivationInfo.iHashChangeCount
				};
				// identify the back target
				if (oPreviousHash.LeaveByReplace){
					oCurrentHash.backTarget = oPreviousHash.backTarget; // url is replaced  -> back target remains unchanged
				} else if (oActivationInfo.bIsBack){
					oCurrentHash.backTarget = aPreviousHashes[oPreviousHash.backTarget].backTarget; // -> new back target is the back target of the previous back target
				} else {
					oCurrentHash.backTarget = iPreviousHashChangeCount;	// last url is back target
				}
				fnAdaptPaginatorInfoAfterNavigation(oEvent, oActivationInfo.bIsProgrammatic, oActivationInfo.bIsBack);
			}
			oCurrentHash.oEvent = oEvent;
			oCurrentHash.hash = sHash;

			var oRouteConfig = oEvent.getParameter("config");			
			var sPath = routingHelper.determinePath(oRouteConfig, oEvent);
			var sTestPath = iViewLevel < 2 ? sPath : routingHelper.determinePath(oRouteConfig, oEvent, oTemplateContract.routeViewLevel1.pattern);
			fnGetAlternativeContextPromise(sTestPath).then(function(oAlternativeContextInfo){
				if (oAlternativeContextInfo){
					var oKeys = oEvent.getParameter("arguments");
					var oQuery = oKeys["?query"];
					oCurrentHash.forwardingInfo = oActivationInfo;
					fnNavigateToContextImpl(oAlternativeContextInfo.context, null, true, oAlternativeContextInfo.iDisplayMode, oQuery || {});
					return;
				}
			
				if (oTemplateContract.oFlexibleColumnLayoutHandler){
					oActivationPromise = oTemplateContract.oFlexibleColumnLayoutHandler.handleRouteMatched(oEvent, oRouteConfig, sPath, oActivationInfo);
					return;
				}
				oTemplateContract.oApplicationProxy.onRouteMatched(oEvent);

				if (oRouteConfig.viewLevel === 0 || !(oActivationInfo.bIsProgrammatic || oActivationInfo.bIsBack)){
					oTemplateContract.oApplicationProxy.setEditableNDC(false);           	
				}

				var sRoute = oRouteConfig.target;   // Note: Route and targetnames are identical
				var oComponentPromise = oTemplateContract.mRouteToTemplateComponentPromise[sRoute];
				oActivationPromise = new Promise(function(fnResolve){
					oComponentPromise.then(function(oComponent){
						fnActivateComponent(sPath, oActivationInfo, oComponent).then(fnResolve);	
					});	
				});
			});
		}

		// Event handler fired by router when no matching route is found
		function fnHandleBypassed() {
			oTemplateContract.oApplicationProxy.onBypassed();
			fnNavigateToMessagePage({
				title: oTemplateContract.getText("ST_GENERIC_UNKNOWN_NAVIGATION_TARGET"),
				replaceURL: true
			});
		}
		
		if (oTemplateContract.sRoutingType === "f"){
			oNavigationControllerProxy.oRouter.attachBeforeRouteMatched(fnHandleBeforeRouteMatched);
		}
		oNavigationControllerProxy.oRouter.attachRouteMatched(fnHandleRouteMatched);

		oNavigationControllerProxy.oRouter.attachBypassed(fnHandleBypassed);
		// End: Handling url-changes
		
		// Expose methods via NavigationController proxy
		oNavigationControllerProxy.navigate = fnNavigate;
		oNavigationControllerProxy.navigateToParStringPromise = fnNavigateToParStringPromise;
		oNavigationControllerProxy.activateOneComponent = fnActivateOneComponent;
		oNavigationControllerProxy.afterActivation = fnAfterActivation;
		oNavigationControllerProxy.addUrlParameterInfoForRoute = fnAddUrlParameterInfoForRoute;
		oNavigationControllerProxy.getParStringPromise = fnGetParStringPromise;
		oNavigationControllerProxy.performPseudoHashChange = fnPerformPseudoHashChange;
		oNavigationControllerProxy.getActiveComponents = getActiveComponents;
		oNavigationControllerProxy.getRootComponentPromise = getRootComponentPromise;
		oNavigationControllerProxy.getCurrenActivationTakt = getCurrenActivationTakt;
		oNavigationControllerProxy.getTargetLevel = getTargetLevel;

		// Expose selected private functions to unit tests
		testableHelper.testable(function(){
			aPreviousHashes.push(oCurrentHash);	
		}, "NavigationController_init"); // Enable startup for tests. Usuallay this is achieved by the first routeMatched

		return {
			/**
			* Navigates to the root view.
			*
			* @public
			* @param {boolean} bReplace If this is true the navigation/hash will be replaced
			*/
			navigateToRoot: fnNavigateToRoot,

			/**
			 * Navigates to the specified context.
			 *
			 * @public
			 * @param {Object} oTargetContext - The context to navigate to (or null - e.g. when the navigationProperty should be appended to the current path)
			 * @param {string} sNavigationProperty - The navigation property
			 * @param {boolean} bReplace If this is true the navigation/hash will be replaced
			 */
			navigateToContext: fnNavigateToContext,
			/**
			 * Navigates to the message page and shows the specified content.
			 *
			 * @public
			 * @param {Object} mParameters - The parameters for message page
			 */
			navigateToMessagePage: fnNavigateToMessagePage,

			/**
			 * Navigate back
			 *
			 * @public
			 */			
			navigateBack: fnNavigateBack
		};
	}
	
	function constructor(oNavigationController, oTemplateContract){
		var oNavigationControllerProxy = {
			oAppComponent: oTemplateContract.oAppComponent,
			oRouter: oTemplateContract.oAppComponent.getRouter(),
			oTemplateContract: oTemplateContract,
			oHashChanger: HashChanger.getInstance(),
			mRouteToComponentResolve: {}
		};
		oTemplateContract.oNavigationControllerProxy = oNavigationControllerProxy;
		var oFinishedPromise = new Promise(function(fnResolve){
			// remark: In case of inbound navigation with edit-mode and an existing draft, this promise will be resolved
			// before the initialization is actually finished.
			// This is necessary to be able to show the unsavedChanges-Dialog
			oNavigationControllerProxy.fnInitializationResolve = fnResolve;
		});
		oTemplateContract.oBusyHelper.setBusy(oFinishedPromise);
		jQuery.extend(oNavigationController, getMethods(oTemplateContract, oNavigationControllerProxy));
		jQuery.extend(oNavigationControllerProxy, oNavigationController);
		var mViews = {};
		// TODO: this has to be clarified and fixed
		oNavigationControllerProxy.oRouter._oViews._getViewWithGlobalId = function(oView) {
			// Test only
			if (!mViews[oView.viewName]){
				var oRoute = oNavigationControllerProxy.oRouter.getRoute(oView.viewName);
				var oContainer;
				if (oRoute && oRoute._oConfig) {
					oContainer = fnCreateComponentInstance(oTemplateContract, oRoute._oConfig, oNavigationControllerProxy.mRouteToComponentResolve[oView.viewName]);
				} else {
					oContainer = sap.ui.view({
						viewName: oView.viewName,
						type: oView.type,
						height: "100%"
					});
				}
				mViews[oView.viewName] = oContainer;
				if (oView.viewName === "root") {
					oTemplateContract.rootContainer = oContainer;
				}					
			}
			return mViews[oView.viewName];
		};
		routingHelper.startupRouter(oNavigationControllerProxy);		
	}

	/*
	 * Handles all navigation and routing-related tasks for the application.
	 *
	 * @class The NavigationController class creates and initializes a new navigation controller with the given
	 *        {@link sap.suite.ui.generic.template.lib.AppComponent AppComponent}.
	 * @param {sap.suite.ui.generic.template.lib.AppComponent} oAppComponent The AppComponent instance
	 * @public
	 * @extends sap.ui.base.Object
	 * @version 1.46.0
	 * @since 1.30.0
	 * @alias sap.suite.ui.generic.template.lib.NavigationController
	 */
	var NavigationController = BaseObject.extend("sap.suite.ui.generic.template.lib.NavigationController", {
		metadata: {
			library: "sap.suite.ui.generic.template"
		},
		constructor: function(oTemplateContract) {
			// inherit from base object.
			BaseObject.apply(this, arguments);
			testableHelper.testableStatic(constructor, "NavigationController")(this, oTemplateContract);
		}
	});

	NavigationController._sChanges = "Changes";
	return NavigationController;
});