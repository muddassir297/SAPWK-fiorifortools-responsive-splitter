sap.ui.define(["jquery.sap.global", "sap/ui/base/Object", "sap/ui/Device", "sap/ui/model/json/JSONModel", "sap/ui/core/routing/History",
		"sap/ui/core/routing/HistoryDirection", "sap/m/MessageToast", "sap/m/ActionSheet", "sap/m/Dialog", "sap/m/Popover",
		"sap/suite/ui/generic/template/lib/routingHelper", "sap/suite/ui/generic/template/lib/ContextBookkeeping", "sap/suite/ui/generic/template/lib/testableHelper"
	],
	function(jQuery, BaseObject, Device, JSONModel, History, HistoryDirection, MessageToast, ActionSheet, Dialog, Popover, routingHelper, ContextBookkeeping, testableHelper) {
		"use strict";

		var sContentDensityClass = (testableHelper.testableStatic(function(bTouch, oBody) {
			var sCozyClass = "sapUiSizeCozy",
				sCompactClass = "sapUiSizeCompact";
			if (oBody.hasClass(sCozyClass) || oBody.hasClass(sCompactClass)) { // density class is already set by the FLP
				return "";
			} else {
				return bTouch ? sCozyClass : sCompactClass;
			}
		}, "Application_determineContentDensityClass")(Device.support.touch, jQuery(document.body)));
		
		function getContentDensityClass() {
			return sContentDensityClass;
		}

		// defines a dependency from oControl to a parent
		function fnAttachControlToParent(oControl, oParent) {
			jQuery.sap.syncStyleClass(sContentDensityClass, oParent, oControl);
			oParent.addDependent(oControl);
		}

		// Expose selected private static functions to unit tests
		/* eslint-disable */
		var fnAttachControlToParent = testableHelper.testableStatic(fnAttachControlToParent, "Application_attachControlToParent");
		/* eslint-enable */

		/* An instance of this class represents a Smart Template based application. Thus, there is a one-to-one relationship between
		 * instances of this class and instances of sap.suite.ui.generic.template.lib.AppComponent.
		 * However, this class is only used inside the sap.suite.ui.generic.template.lib package. It is not accessible to template developers
		 * or breakout developers.
		 * Instances of this class are generated in sap.suite.ui.generic.template.lib.TemplateAssembler.
		 * Note that TemplateAssembler also possesses a reference to the instance of this class which represents the app currently
		 * running.
		 * oTemplateContract: An object which is used for communication between this class and the AppComponent and its helper classes.
		 * Note that this class injects its api to these classes into the template contract object.
		 * Currently this class supports two use cases:
		 * 1. For non-draft apps it contains the information whether the app is currently in display or in edit state (methods set/getEditableNDC)
		 * 2. A 'navigation' model is supported. Thereby, we consider navigation to take place each time a route name or a route pattern is changed (but not when only the parameters added to the route are changed)
		 */
		function getMethods(oTemplateContract) {

			var oContextBookkeeping = new ContextBookkeeping(oTemplateContract.oAppComponent);
			
			var oCurrentDisplay = { // an object containing information about the view currently displayed
				api: {
				} // this object is exposed via method getCurrentDisplayObject
			};
			var oDataForNextPage = {}; // data bag that is transferred to the next page

			var oRouteParameters = {}; // parameters of the routing event for the view currently displayed. Handled by function isNewRoute.
			// this function is called when a route is matched. It returns the information whether this is a new route in the sense
			// of the navigation model realized by this class.
			function isNewRoute(oEvent) {
				var oNewRouteParameters = oEvent.getParameters();
				if (oNewRouteParameters.name !== oRouteParameters.name) {
					oRouteParameters = oNewRouteParameters;
					return true;
				}
				var oMerged = jQuery.extend({}, oRouteParameters.arguments, oNewRouteParameters.arguments);
				for (var sId in oMerged) {
					if (sId.indexOf("?") !== 0 && oMerged[sId] !== oRouteParameters.arguments[sId]) {
						oRouteParameters = oNewRouteParameters;
						return true;
					}
				}
				return false;
			}

			function getCurrentDisplayObject() {
				return oCurrentDisplay.api || {}; //TODO: ensure there is always something to return
			}
			
			var bIsWaitingForSideEffectExecution = false;
			
			// Executes fnFunction as soon as all side-effects have been executed.
			function fnPerformAfterSideEffectExecution(fnFunction){
				if (bIsWaitingForSideEffectExecution){
					return;   // do not let two operation wait for side effect execution
				}
				var i = 0;
				for (; i < oTemplateContract.aRunningSideEffectExecutions.length && !oTemplateContract.aRunningSideEffectExecutions[i]; i++){
					i++;
				}
				if (oTemplateContract.aRunningSideEffectExecutions[i]){
					bIsWaitingForSideEffectExecution = true;
					var oPromise = oTemplateContract.aRunningSideEffectExecutions[i];
					oPromise.then(function(){
						if (oTemplateContract.aRunningSideEffectExecutions[i] === oPromise){
							oTemplateContract.aRunningSideEffectExecutions[i] = null;	
						}
						bIsWaitingForSideEffectExecution = false;
						fnPerformAfterSideEffectExecution(fnFunction);
					});	
				} else {
					fnFunction();
				}
			}

			function fnMakeBusyAware(oControl) {
				var sOpenFunction;
				if (oControl instanceof Dialog) {
					sOpenFunction = "open";
				} else if (oControl instanceof Popover || oControl instanceof ActionSheet) {
					sOpenFunction = "openBy";
				}
				if (sOpenFunction) {
					var fnOpenFunction = oControl[sOpenFunction];
					oControl[sOpenFunction] = function() {
						var myArguments = arguments;
						fnPerformAfterSideEffectExecution(function(){
							if (!oTemplateContract.oBusyHelper.isBusy()) { // suppress dialogs while being busy
								oTemplateContract.oBusyHelper.getUnbusy().then(function() { // but the busy dialog may still not have been removed
									fnOpenFunction.apply(oControl, myArguments);
								});
							}
						});
					};
				}
			}

			var mFragmentStores = {};

			function getDialogFragmentForView(oView, sName, oFragmentController, sModel, fnOnFragmentCreated) {
				oView = oView || oTemplateContract.oNavigationHost;
				var sViewId = oView.getId();
				var mFragmentStore = mFragmentStores[sViewId] || (mFragmentStores[sViewId] = {});
				var oFragment = mFragmentStore[sName];
				if (!oFragment) {
					oFragment = sap.ui.xmlfragment(sViewId, sName, oFragmentController);
					fnAttachControlToParent(oFragment, oView);
					var oModel;
					if (sModel) {
						oModel = new JSONModel();
						oFragment.setModel(oModel, sModel);
					}
					(fnOnFragmentCreated || jQuery.noop)(oFragment, oModel);
					mFragmentStore[sName] = oFragment;
					fnMakeBusyAware(oFragment);
				}
				return oFragment;
			}

			function getOperationEndedPromise() {
				return new Promise(function(fnResolve) {
					oTemplateContract.oNavigationObserver.getProcessFinished(true).then(function(){
						oTemplateContract.oBusyHelper.getUnbusy().then(fnResolve);	
					});
				});
			}

			function setBackNavigation(fnBackNavigation) {
				if (oTemplateContract.oShellService) {
					oTemplateContract.oShellService.setBackNavigation(fnBackNavigation);
				}
			}

			function setTitle(sTitle) {
				if (oTemplateContract.oShellService) {
					oTemplateContract.oShellService.setTitle(sTitle);
				}
			}
			
			function getFclProxy(iViewLevel) {
				if (!oTemplateContract.oFlexibleColumnLayoutHandler){
					return {};
				}
				
				return {
					oActionButtonHandlers: oTemplateContract.oFlexibleColumnLayoutHandler.getActionButtonHandlers(iViewLevel),
					navigateToDraft: oTemplateContract.oFlexibleColumnLayoutHandler.navigateToDraft
				};
			}

			var bIsEditable = false;
			
			function setEditableNDC(isEditable) {
				bIsEditable = isEditable;
			}
			
			// This function indicates if a new HistoryEntry is required.
			// A new HistoryEntry is only required if the user navigates to an object which will be displayed in a new column.
			// If the object will be displayed in a column which is already visible no HistoryEntry is required
			function isNewHistoryEntryRequired(oTargetContext, sNavigationProperty){
				if (!oTemplateContract.oFlexibleColumnLayoutHandler){
					return true;
				}
				var oTarget = routingHelper.determineNavigationPath(oTargetContext, sNavigationProperty);
				return oTemplateContract.oFlexibleColumnLayoutHandler.isNewHistoryEntryRequired(oTarget);
			}
			
			function fnRegisterStateChanger(oStateChanger){
				oTemplateContract.aStateChangers.push(oStateChanger);
			}
			
			function getTargetAfterCancelPromise(oActive){
				return oTemplateContract.oFlexibleColumnLayoutHandler ? oTemplateContract.oFlexibleColumnLayoutHandler.getTargetAfterCancelPromise(oActive) : Promise.resolve(oActive);
			}
			
			function adaptAfterDeletion(aDeletedPath, iViewLevel){
				oContextBookkeeping.adaptAfterDeletion(aDeletedPath);
				if (aDeletedPath.length === 0 || !oTemplateContract.oFlexibleColumnLayoutHandler){
					return;
				}
				oTemplateContract.oFlexibleColumnLayoutHandler.adaptAfterDeletion(aDeletedPath, iViewLevel);
			}
			
			function fnBuildSections(sEntitySet, bOnlyEntitySetNames, aSections){
				var oTreeNode = oTemplateContract.mEntityTree[sEntitySet];
				var sNewEntry;
				if (oTreeNode.navigationProperty){
					sNewEntry = bOnlyEntitySetNames ? oTreeNode.entitySet : oTreeNode.navigationProperty;
				} else {
					sNewEntry = sEntitySet;
				}
				if (aSections.indexOf(sNewEntry) < 0){
					aSections.unshift(sNewEntry);
					if (oTreeNode.navigationProperty){
						fnBuildSections(oTreeNode.parent, bOnlyEntitySetNames, aSections);
					}
				}
			}
			
			function getSections(sEntitySet, bOnlyEntitySetNames){
				var aRet = [];
				fnBuildSections(sEntitySet, bOnlyEntitySetNames, aRet);
				return aRet;				
			}
			
			function getBreadCrumbInfo(sEntitySet){
				var aSections = getSections(sEntitySet);
				// remove the last one - this is the current shown section
				aSections.pop();
				var sPath = "";
				var delimiter = "";
				var aRet = [];
				for (var i = 0; i < aSections.length; i++){
					sPath = sPath + delimiter + aSections[i];
					aRet.push(sPath);
					delimiter = "/";
				}
				return aRet;
			}
			
			function getHierarchySectionsFromCurrentHash(){
				var sHash = oTemplateContract.oNavigationControllerProxy.oHashChanger.getHash();
						// remove query part if there's one
				var	sPath = sHash.split("?")[0];
				var aSections = sPath.split("/");

				if (aSections[0] === "" || aSections[0] === "#") {
					// Path started with a / - remove first section
					aSections.splice(0, 1);
				}
				return aSections;
			}
			
			function fnAdaptBreadCrumbUrl(sHash, iViewLevel, bIsHash){
				if (oTemplateContract.oFlexibleColumnLayoutHandler){
					return oTemplateContract.oFlexibleColumnLayoutHandler.adaptBreadCrumbUrl(sHash, iViewLevel, bIsHash);
				}
				return sHash;
			}
			
			function getResourceBundleForEditPromise(){
				var aActiveComponents = oTemplateContract.oNavigationControllerProxy.getActiveComponents();
				var iMinViewLevel = 0;
				var oComponent;
				for (var i = 0; i < aActiveComponents.length; i++){
					var oRegistryEntry = oTemplateContract.componentRegistry[aActiveComponents[i]];
					if (oRegistryEntry.viewLevel > 0 && (iMinViewLevel === 0 || oRegistryEntry.viewLevel < iMinViewLevel)){
						iMinViewLevel = oRegistryEntry.viewLevel;
						oComponent = oRegistryEntry.oComponent;
					}
				}
				var oComponentPromise = oComponent ? Promise.resolve(oComponent) : oTemplateContract.oNavigationControllerProxy.getRootComponentPromise();
				return oComponentPromise.then(function(oComp){
					return oComp.getModel("i18n").getResourceBundle();                         	
				});
			}
			
			var oHistory = History.getInstance();
			var sCurrentlyDisplayed; // id of the component container currently displayed, updated when navigation is finished
			var sGoingToBeDisplayed; // like CurrentlyDisplayed, but already updated when route is matched
			
			oTemplateContract.oApplicationProxy = { // inject own api for AppComponent into the Template Contract. Other classes (NavigationController, BusyHelper) will call these functions accordingly.
				getDraftSiblingPromise: oContextBookkeeping.getDraftSiblingPromise,
				
				getAlternativeContextPromise: oContextBookkeeping.getAlternativeContextPromise,
				
				getResourceBundleForEditPromise: getResourceBundleForEditPromise,
				
				onAfterNavigate: function(oEvent) { // called when navigation has finished
					sCurrentlyDisplayed = oEvent.getParameter("toId");
					var oComponentContainer = oEvent.getParameter("to");
					var sComponent = oComponentContainer && oComponentContainer.getComponent && oComponentContainer.getComponent();
					var oComponentRegistryEntry = sComponent && oTemplateContract.componentRegistry[sComponent];
					if (oComponentRegistryEntry){
						var fnSetView = function(){
							oCurrentDisplay.currentView = oComponentRegistryEntry.oController.getView();	
						};
						if (oComponentRegistryEntry.oController){
							fnSetView();
						} else {
							oComponentRegistryEntry.viewRegisterd.then(fnSetView);
						}
					} else {
						oCurrentDisplay.currentView = null;	
					}
				},

				onBypassed: function() {
					oRouteParameters = {};
					oCurrentDisplay.api.outdated = true;
					oCurrentDisplay.api = {
					};
				},

				onRouteMatched: function(oEvent) {
					if (!isNewRoute(oEvent)) {
						return; // ignore route changes which are not cosidered as navigation for our model
					}
					oCurrentDisplay.api.outdated = true; // mark the old object as outdated
					oCurrentDisplay.api = { // and create a new one
						isBack: oHistory.getDirection() === HistoryDirection.Backwards,
						dataFromLastPage: oDataForNextPage
					};
					oDataForNextPage = {}; // create a new data bag for next page
					var sRoute = oEvent.getParameter("config").target;   // Note: Route and targetnames are identical
					var oComponentPromise = oTemplateContract.mRouteToTemplateComponentPromise[sRoute];
					oComponentPromise.then(function(oComponent){
						sGoingToBeDisplayed = oComponent.getComponentContainer().getId();
						if (!sCurrentlyDisplayed || sGoingToBeDisplayed === sCurrentlyDisplayed) { // no view navigation will take place -> page is reached
							sCurrentlyDisplayed = sGoingToBeDisplayed;
						}						
					});
				},
				getHierarchySectionsFromCurrentHash: getHierarchySectionsFromCurrentHash,
				getCurrentDisplayObject: getCurrentDisplayObject,
				getContentDensityClass: getContentDensityClass,
				setEditableNDC: setEditableNDC,
				getDialogFragment: getDialogFragmentForView.bind(null, null),
				destroyView: function(sViewId){
					delete mFragmentStores[sViewId];
				}
			};

			return {
				setEditableNDC: setEditableNDC,
				getEditableNDC: function() {
					return bIsEditable;
				},
				// Return an object containing information about the current page. It contains the following attributes:
				// isBack: has this view been reached via back navigation
				// dataFromLastPage: data bag containing data provided by the previous view
				// outdated: this attribute is added (value: true) as soon as a new navigation to another view is started.
				// Note that this is the point in time getCurrentDisplayObject will already return another object.
				// Hence, only clients are affected that have stored a reference to the object returned by this function in their memory.
				getCurrentDisplayObject: getCurrentDisplayObject,
				getContentDensityClass: getContentDensityClass,
				attachControlToParent: fnAttachControlToParent,
				getDialogFragmentForView: getDialogFragmentForView,
				getBusyHelper: function() {
					return oTemplateContract.oBusyHelper;
				},
				performAfterSideEffectExecution: fnPerformAfterSideEffectExecution,
				isTemplateComponentActive: function(oTemplateComponent) {
					return oTemplateComponent.getComponentContainer().getId() === sGoingToBeDisplayed;
				},
				showMessageToast: function() {
					var myArguments = arguments;
					var fnMessageToast = function() {
						jQuery.sap.log.info("Show message toast");
						MessageToast.show.apply(MessageToast, myArguments);
					};
					Promise.all([getOperationEndedPromise(true), oTemplateContract.oBusyHelper.getUnbusy()]).then(fnMessageToast);
				},
				setBackNavigation: setBackNavigation,
				setTitle: setTitle,
				getFclProxy: getFclProxy,
				isNewHistoryEntryRequired: isNewHistoryEntryRequired,
				registerStateChanger: fnRegisterStateChanger,
				getDraftSiblingPromise: oContextBookkeeping.getDraftSiblingPromise,
				registerContext: oContextBookkeeping.registerContext,
				activationStarted: oContextBookkeeping.activationStarted,
				cancellationStarted: oContextBookkeeping.cancellationStarted,
				editingStarted: oContextBookkeeping.editingStarted,
				getTargetAfterCancelPromise: getTargetAfterCancelPromise,
				adaptAfterDeletion: adaptAfterDeletion,
				getBreadCrumbInfo: getBreadCrumbInfo,
				adaptBreadCrumbUrl: fnAdaptBreadCrumbUrl,
				getSections: getSections,
				getHierarchySectionsFromCurrentHash: getHierarchySectionsFromCurrentHash
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.lib.Application", {
			constructor: function(oTemplateContract) {
				jQuery.extend(this, getMethods(oTemplateContract));
			}
		});
	});