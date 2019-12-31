sap.ui.define(["jquery.sap.global", "sap/ui/base/Object", "sap/ui/generic/app/navigation/service/SelectionVariant"], function(jQuery, BaseObject, SelectionVariant) {
	"use strict";

		// Constants which are used as property names for storing custom filter data and generic filter data
		var dataPropertyNameCustom = "sap.suite.ui.generic.template.customData",
			dataPropertyNameGeneric = "sap.suite.ui.generic.template.genericData";
			
		// variant contexts which should not lead to change the iappstate
		var aIrrelevantVariantLoadContext = ["INIT", "DATA_SUITE", "CANCEL", "RESET", "SET_VM_ID"];
	
	function fnNullify(oObject) {
		if (oObject) {
			for (var sProp in oObject) {
				oObject[sProp] = null;
			}
		}
	}
	
	function fnNotEqual(oObject1, oObject2){
		var aKeys1 = Object.keys(oObject1);
		if (aKeys1.length !== Object.keys(oObject2).length){
			return true;
		}
		for (var i = 0; i < aKeys1.length; i++){
			var sKey = aKeys1[i];
			var aPar1 = oObject1[sKey];
			var aPar2 = oObject2[sKey];
			if (aPar1.length !== aPar2.length){
				return true;
			}
			for (var j = 0; j < aPar1.length; j++){
				if (aPar1[j] !== aPar2[j]){
					return true;
				}
			}
		}
		return false;
	}
	
	function getMethods(oState, oController, oNavigationHandler) {
		
		var bSmartVariantManagement = oController.getOwnerComponent().getSmartVariantManagement();
		var oInnerAppStatePromise = Promise.resolve({ 
			appStateKey: "",
			urlParams: {},
			selectionVariant: "",
			tableVariantId: ""			
		}); // A Promise that resolves to the information currently available in the url about parameters
		var bDataAreShownInTable = false;
		var iOpenAdaptations = 0;
		var iOpenUrlAdaptations = 0;
		var bAppStateDirty = false;
		var oEditStateFilter = oController.byId("editStateFilter");

		var getByDefaultNonVisibleCustomFilterNames = (function(){
			var aNonVisibleCustomFilterNames;
			return function(){
				aNonVisibleCustomFilterNames = aNonVisibleCustomFilterNames || oState.oSmartFilterbar.getNonVisibleCustomFilterNames();
				return aNonVisibleCustomFilterNames;
			};
		})();
		
		function areDataShownInTable(){
			return bDataAreShownInTable;
		}

		function getPageState() {
			var oCustomAndGenericData = {};
			oCustomAndGenericData[dataPropertyNameCustom] = {};
			// Store information about visible custom filters
			var aVisibleCustomFieldNames = [];
			var aByDefaultNonVisibleCustomFilterNames = getByDefaultNonVisibleCustomFilterNames();
			for (var i = 0; i < aByDefaultNonVisibleCustomFilterNames.length; i++){ // loop over all custom fields which are not visible in filterbar by default
				var sName = aByDefaultNonVisibleCustomFilterNames[i];
				if (oState.oSmartFilterbar.isVisibleInFilterBarByName(sName)){ // custom field is visible in filterbar now
					aVisibleCustomFieldNames.push(sName);
				}
			}			
			oCustomAndGenericData[dataPropertyNameGeneric] = {
				suppressDataSelection: !bDataAreShownInTable,
				visibleCustomFields: aVisibleCustomFieldNames
			};
			if (oEditStateFilter) {
				oCustomAndGenericData[dataPropertyNameGeneric].editStateFilter = oEditStateFilter.getSelectedKey();
			}
			// extension is responsible for retrieving custom filter state. The method has a more generic name		
			// for historical reasons (change would be incompatible).		

			oController.getCustomAppStateDataExtension(oCustomAndGenericData[dataPropertyNameCustom]);
			return oCustomAndGenericData;
		}

		function getCurrentAppState() {
			/*			 
			 * Special handling for selection fields, for which defaults are defined: If a field is visible in the	
			 * SmartFilterBar and the user has cleared the input value, the field is not included in the selection		
			 * variant, which is returned by getDataSuiteFormat() of the SmartFilterBar. But since it was cleared by	
			 * purpose, we have to store the selection with the value "", in order to set it again to an empty value,
			 * when restoring the selection after a back navigation. Otherwise, the default value would be set.		
			 */
			
			var sCurrentSelectionVariant = oState.oSmartFilterbar.getDataSuiteFormat();
			var oSelectionVariant = new SelectionVariant(sCurrentSelectionVariant);
			var aVisibleFields = oController.getVisibleSelectionsWithDefaults();
			for (var i = 0; i < aVisibleFields.length; i++) {
				if (!oSelectionVariant.getValue(aVisibleFields[i])) {
					oSelectionVariant.addSelectOption(aVisibleFields[i], "I", "EQ", "");
				}
			}
			var oRet = {
				selectionVariant: oSelectionVariant.toJSONString(),
				tableVariantId: (!bSmartVariantManagement && oState.oSmartTable.getCurrentVariantId()) || "",
				customData: getPageState()
			};
			return oRet;
		}
		
		function fnReduceOpenUrlAdaptations(){
			iOpenUrlAdaptations--;	
		}
		
		function fnStoreCurrentAppStateAndAdjustURL() {
			// - nothing, if ushellContainer not available		
			// - adjusts URL immediately		
			// - stores appState for this URL (asynchronously)	

			if (!bAppStateDirty){
				return;
			}
			
			bAppStateDirty = false;

			// currently NavigationHandler raises an exception when ushellContainer is not available, should be changed		
			// by Denver
			iOpenUrlAdaptations++;
			var oDenverAppStatePromise;
			try {
				oDenverAppStatePromise = oNavigationHandler.storeInnerAppState(getCurrentAppState());
			} catch (err) {
				jQuery.sap.log.error("ListReport.fnStoreCurrentAppStateAndAdjustURL: " + err);
			}
			if (oDenverAppStatePromise){
				oDenverAppStatePromise.then(fnReduceOpenUrlAdaptations, fnReduceOpenUrlAdaptations);
			} else {
				iOpenUrlAdaptations--;	
			}
		}

		function fnRestoreGenericFilterState(oGenericData, bApplySearchIfConfigured) {
			if (oGenericData && oGenericData.editStateFilter !== undefined) {
				if (oEditStateFilter) {
					oEditStateFilter.setSelectedKey((oGenericData.editStateFilter === null) ? 0 : oGenericData.editStateFilter);
				}
			}
			// Restore information about visible custom filters
			var aVisibleCustomFields = oGenericData && oGenericData.visibleCustomFields;
			if (aVisibleCustomFields && aVisibleCustomFields.length > 0){
				var aItems = oState.oSmartFilterbar.getAllFilterItems();
				for (var i = 0; i < aItems.length; i++){
					var oItem = aItems[i];
					var sName = oItem.getName();
					if (aVisibleCustomFields.indexOf(sName) !== -1){
						oItem.setVisibleInFilterBar(true);
					}
				}
			}
			bDataAreShownInTable = bApplySearchIfConfigured && !(oGenericData && oGenericData.suppressDataSelection);
			if (bDataAreShownInTable){
				oState.oSmartFilterbar.search();	
			}
		}

		// method is responsible for retrieving custom filter state. The correspomding extension-method has a more generic name	
		// for historical reasons (change would be incompatible).	
		function fnRestoreCustomFilterState(oCustomData) {
			oController.restoreCustomAppStateDataExtension(oCustomData || {});
		}

		// This method is responsible for restoring the data which have been stored via getPageState.	
		// However, it must be taken care of data which have been stored with another (historical) format.	
		// Therefore, it is checked whether oCustomAndGenericData possesses two properties with the right names.
		// If this is this case it is assumed that the data have been stored according to curreent logic. Otherwise, it is	
		// assumed that the data have been stored with the current logic. Otherwise, it is assumed that the properties have been
		// stored with a logic containing only custom properties (with possible addition of _editStateFilter).	

		function fnRestorePageState(oCustomAndGenericData, bApplySearchIfConfigured) {
			oCustomAndGenericData = oCustomAndGenericData || {};
			if (oCustomAndGenericData.hasOwnProperty(dataPropertyNameCustom) && oCustomAndGenericData.hasOwnProperty(dataPropertyNameGeneric)) {
				fnRestoreCustomFilterState(oCustomAndGenericData[dataPropertyNameCustom]);
				fnRestoreGenericFilterState(oCustomAndGenericData[dataPropertyNameGeneric], bApplySearchIfConfigured);
			} else {
				// historic format. May still have property _editStateFilter which was used generically.	
				if (oCustomAndGenericData._editStateFilter !== undefined) {
					fnRestoreGenericFilterState({
						editStateFilter: oCustomAndGenericData._editStateFilter
					});
					delete oCustomAndGenericData._editStateFilter;
				}
				fnRestoreCustomFilterState(oCustomAndGenericData);
			}
		}
		
		// returns a Promise which resolves to an iAppstate-parameter-value pair
		function getUrlParameterInfo(){
			return oInnerAppStatePromise.then(function(oAppState){
				if (oAppState.appStateKey){
					return {
						"sap-iapp-state": [oAppState.appStateKey]
					};
				}
				return oAppState.urlParams;
			});	
		}
		
		function changeIappState(bFilterOrSettingsChange, bDataAreShown){
			if (iOpenAdaptations === 0 && (bFilterOrSettingsChange || bDataAreShown !== bDataAreShownInTable)){
				bDataAreShownInTable = bDataAreShown;
				if (!bAppStateDirty){
					bAppStateDirty = true;
					if (!oState.oSmartFilterbar.isDialogOpen()){
						setTimeout(fnStoreCurrentAppStateAndAdjustURL, 0);
					}
				}
			}
		}
		
		function fnAdaptToAppStateImpl(oCurrentAppState, fnResolve, oAppData, oURLParameters, sNavType){
			var sAppstateKey = oAppData.appStateKey || "";
			var sSelectionVariant =  oAppData.selectionVariant || "";
			var sTableVariantId = (!bSmartVariantManagement && oAppData.tableVariantId) || "";
			var oNewUrlParameters = (!sAppstateKey && oURLParameters) || {};
			if ((oCurrentAppState.appStateKey !== sAppstateKey || 
				oCurrentAppState.selectionVariant !== sSelectionVariant || 
				oCurrentAppState.tableVariantId !== sTableVariantId ||
				fnNotEqual(oCurrentAppState.urlParams, oNewUrlParameters)) && sNavType !== sap.ui.generic.app.navigation.service.NavType.initial) {
				if (iOpenUrlAdaptations === 0){
					var bHasOnlyDefaults = oAppData && oAppData.bNavSelVarHasDefaultsOnly;
					if (oAppData.oSelectionVariant && oCurrentAppState.selectionVariant !== sSelectionVariant){
						var aSelectionVariantProperties = oAppData.oSelectionVariant.getParameterNames().concat(
							oAppData.oSelectionVariant.getSelectOptionsPropertyNames());
						for (var i = 0; i < aSelectionVariantProperties.length; i++) {
							oState.oSmartFilterbar.addFieldToAdvancedArea(aSelectionVariantProperties[i]);
						}
					}
					//according to BCP 1670373497 and 1670406892 we need to check whether the current variant is standard 
					if (!bHasOnlyDefaults || oState.oSmartFilterbar.isCurrentVariantStandard()) {
						// A default variant could be loaded.
						// Do not clear oSmartFilterbar.clearVariantSelection and oSmartFilterbar.clear due to BCP 1680012595 is not valid anymore
						// with BCP 1670406892 it was made clear that both clear are needed when this GIT change 1941921 in navigation handler is available
						oState.oSmartFilterbar.clearVariantSelection();
						oState.oSmartFilterbar.clear();
						oState.oSmartFilterbar.setDataSuiteFormat(sSelectionVariant, true);
					}
					if (sTableVariantId !== oCurrentAppState.tableVariantId) {
						oState.oSmartTable.setCurrentVariantId(sTableVariantId);
					}
					fnRestorePageState(oAppData.customData, true);
				}
				oInnerAppStatePromise = Promise.resolve({
					appStateKey: sAppstateKey,
					urlParams: oNewUrlParameters,
					selectionVariant: sSelectionVariant,
					tableVariantId: sTableVariantId
				});
			}
			fnResolve();			
		}
		
		function fnAdaptToAppState(fnResolve, oAppData, oURLParameters, sNavType){
			var oCurrentInnerAppStatePromise = oInnerAppStatePromise;
			oCurrentInnerAppStatePromise.then(function(oCurrentAppState){
				if (oCurrentInnerAppStatePromise !== oInnerAppStatePromise){  // inner app state has been modified meanwhile. Try again with new inner app state
					fnAdaptToAppState(fnResolve, oAppData, oURLParameters, sNavType);
					return;
				}
				fnAdaptToAppStateImpl(oCurrentAppState, fnResolve, oAppData, oURLParameters, sNavType);
			});
		}
		
		function fnReduceOpenAdaptations(){
			iOpenAdaptations--;	
		}
		
		function fnParseUrlAndApplyAppState(){
			iOpenAdaptations++;
			var oRet = new Promise(function(fnResolve, fnReject){
				var oParseNavigationPromise = oNavigationHandler.parseNavigation();
				oParseNavigationPromise.done(fnAdaptToAppState.bind(null, fnResolve));
				oParseNavigationPromise.fail(fnReject);
			});
			oRet.then(fnReduceOpenAdaptations, fnReduceOpenAdaptations);
			return oRet;
		}
		
		function onBeforeSFBVariantSave(bAdjust){
			/*
			 * When the app is started, the VariantManagement of the SmartFilterBar saves the initial state in the
			 * STANDARD (=default) variant and therefore this event handler is called. So, even though the name of
			 * the event handler is confusing, we need to provide the initial state to allow the SmartFilterBar to
			 * restore it when needed (i.e. when the user clicks on restore). Thus, no check against STANDARD
			* context is needed!
			 */
			var oCurrentAppState = getCurrentAppState();
			oState.oSmartFilterbar.setFilterData({
				_CUSTOM: oCurrentAppState.customData
			});
		}
		
		function onAfterSFBVariantSave(){
			changeIappState(true, bDataAreShownInTable);	
		}
		
		function onAfterSFBVariantLoad(oEvent) {
			var sContext = oEvent.getParameter("context");
			var oData = oState.oSmartFilterbar.getFilterData();
			if (oData._CUSTOM !== undefined) {
				fnRestorePageState(oData._CUSTOM);
			} else {
				// make sure that the custom data are nulled for the STANDARD variant
				var oCustomAndGenericData = getPageState();
				fnNullify(oCustomAndGenericData[dataPropertyNameCustom]);
				fnNullify(oCustomAndGenericData[dataPropertyNameGeneric]);
				fnRestorePageState(oCustomAndGenericData);
			}
			bDataAreShownInTable = oEvent.getParameter("executeOnSelect");
			// store navigation context
			if (aIrrelevantVariantLoadContext.indexOf(sContext) < 0) {
				changeIappState(true, bDataAreShownInTable);
			} 
		}
		
		function onAfterTableVariantSave() {
			if (!bSmartVariantManagement){
				changeIappState(true, bDataAreShownInTable);
			}
		}
		
		function onAfterApplyTableVariant() {
			if (!bSmartVariantManagement){
				changeIappState(true, bDataAreShownInTable);
			}
		}
		
		function isStateChange(){
			if (iOpenUrlAdaptations > 0){
				fnParseUrlAndApplyAppState();
				return true;
			}
			return false;
		}
		
		function onSmartFilterBarInitialise(){
			oState.oSmartFilterbar.attachFiltersDialogClosed(fnStoreCurrentAppStateAndAdjustURL);
		}
		
		// Make the getCurrentAppState function available for others via the oState object
		oState.getCurrentAppState = getCurrentAppState;
		
		return {
			areDataShownInTable: areDataShownInTable,
			parseUrlAndApplyAppState: fnParseUrlAndApplyAppState,
			getUrlParameterInfo: getUrlParameterInfo,
			changeIappState: changeIappState,
			onSmartFilterBarInitialise: onSmartFilterBarInitialise,
			onBeforeSFBVariantSave: onBeforeSFBVariantSave,
			onAfterSFBVariantSave: onAfterSFBVariantSave,
			onAfterSFBVariantLoad: onAfterSFBVariantLoad,
			onAfterTableVariantSave: onAfterTableVariantSave,
			onAfterApplyTableVariant: onAfterApplyTableVariant,
			isStateChange: isStateChange
		};
	}
	
	return BaseObject.extend("sap.suite.ui.generic.template.lib.IappStateHandler", {
		constructor: function(oState, oController, oNavigationHandler) {
			jQuery.extend(this, getMethods(oState, oController, oNavigationHandler));
		}
	});
});