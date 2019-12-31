sap.ui.define(["jquery.sap.global", "sap/ui/base/Object"
	],
	function(jQuery, BaseObject) {
		"use strict";

		function getMethods(oAppComponent) {
			
			var mPath2ContextData = { }; // currently only used for draft scearios

			function fnCreateDraftInfo(oContext){
				var oDraftController = oAppComponent.getTransactionController().getDraftController();
				var oDraftContext = oDraftController.getDraftContext();
				var oActiveEntity = oContext.getObject();
				// check whether we are draft enabled AND the current context represents a draft
				var bIsDraftSupported = oDraftContext.hasDraft(oContext);
				var bIsDraft = bIsDraftSupported && !oActiveEntity.IsActiveEntity;
				var bHasActiveEntity = oActiveEntity.HasActiveEntity;
				var bIsCreate;
				
				if (bIsDraft) {
					if (bHasActiveEntity) {
						bIsCreate = false;
					} else {
						bIsCreate = true;
					}
				} else {
					bIsCreate = false;
				}
				
				return {
					bIsDraft: bIsDraft,
					bIsDraftSupported: bIsDraftSupported,
					bIsCreate: bIsCreate
				};
			}
			
			// Note this is the only method which can also be called in non draft scenarios NDC
			function registerContext(oContext){
				var sPath = oContext.getPath();
				var oContextInfo = fnCreateDraftInfo(oContext);
				mPath2ContextData[sPath] = {
					oContextInfo: oContextInfo,
					oContext: oContext
				};
				return oContextInfo;
			}
			
			function getContextData(oContext){
				var sPath = oContext.getPath();
				var oRet = mPath2ContextData[sPath];
				if (!oRet){
					registerContext(oContext);
					oRet = mPath2ContextData[sPath];
				}
				return oRet;
			}
			
			function createDraftSiblingPromise(oModel, sPath){
				return new Promise(function(fnResolve, fnReject) {
					oModel.read(sPath + "/SiblingEntity", {
						success: function(oResponseData) {
							var oActive = oModel.getContext("/" + oModel.getKey(oResponseData));
							fnResolve(oActive);
						},
						error: function(oError) {
							fnReject(oError);
						}
					});
				});				
			}
			
			function getDraftSiblingPromise(oContext){
				var oContextData = getContextData(oContext);
				if (oContextData.oContextInfo.bIsCreate){
					return Promise.resolve();
				}
				var oSiblingPromise = oContextData.oSiblingPromise;
				if (!oSiblingPromise){
					oSiblingPromise = oContextData.oContextInfo.bIsDraftSupported ? 
						createDraftSiblingPromise(oContext.getModel(), oContext.getPath()) :
						Promise.resolve(oContext);
					if (oContextData.oContextInfo.bIsDraft || !oContextData.oContextInfo.bIsDraftSupported){
						oContextData.oSiblingPromise = oSiblingPromise;
					}
				}
				return oSiblingPromise;
			}
			
			function draftRemovalStarted(oContext, oRemovalPromise){
				var oContextData = getContextData(oContext);
				oContextData.oRemovalPromise = oRemovalPromise;
				oRemovalPromise.then(function(oResponse){ // Removal was successfull -> remove Edit Promise from the active version
					var sDisplayPath = oResponse.context.getPath();
					var oDisplayContextInfo = mPath2ContextData[sDisplayPath];
					if (oDisplayContextInfo){
						delete oDisplayContextInfo.oEditingPromise;	
					}
					oContextData.oContext = null;  // remove deleted context
				},function(){
					delete oContextData.oRemovalPromise;	
				});				
			}
			
			function activationStarted(oContext, oActivationPromise){
				draftRemovalStarted(oContext, oActivationPromise);
			}
			
			function cancellationStarted(oContext, oCancellationPromise){
				draftRemovalStarted(oContext, oCancellationPromise);	
			}
			
			// called when the user has started an editing procedure (of a draft based object)
			// oContext: the context of the object to be edited
			// oEditingPromise: A promise that behaves as the Promise returned by function editEntity of CRUDManager 
			function editingStarted(oContext, oEditingPromise){
				var oContextData = getContextData(oContext);
				oContextData.oEditingPromise = new Promise(function(fnResolve, fnReject){
					var fnNoEdit = function(){
						delete oContextData.oEditingPromise;
						fnReject();
					};
					oEditingPromise.then(function(oEditInfo){
						if (oEditInfo.draftAdministrativeData){
							fnNoEdit();
						} else {
							fnResolve(oEditInfo);	
						}	
					}, fnNoEdit);					
				});
				oContextData.oEditingPromise.catch(jQuery.noop); // avoid ugly console messages
			}
			
			// Check whether navigation to a context should be forwarded to another context.
			// sPath describes the path that is navigated to
			// Returns a Promise that either returns to faulty (no forwarding needed) or to an AlternativeContextInfo
			function getAlternativeContextPromise(sPath){
				var oContextData = mPath2ContextData[sPath];
				if (!oContextData){ // nothing known about this context -> no farwarding needed
					return Promise.resolve();
				}
				return new Promise(function(fnResolve){
					var oAlternativeContextInfo = null; // the object that will be resolved to -> current assumption: no forwarding needed
					var fnResolveToAlternativeContext = function(){ // execute the resolution
						fnResolve(oAlternativeContextInfo);	
					};
					var fnHandleEditingPromise = function(oEditingPromise){ // function to be called when there is an EditingPromise for the object to be displayed
						oEditingPromise.then(function(oEditingInfo){ // oEditingInfo contains the context for the draft that currently replaces the object
							// Currently we have the following problem: A delete operation on the draft does not delete the whole object, but only the draft.
							// However, in this case draftRemovalStarted is not called, but only fnAdaptAfterObjectDeleted.
							// This function does NOT remove the EditingPromise from the active version. Thus, although the EditingPromise is present
							// it still might be correct to show the active object.
							// Therefore, we check for the corresponsing entry of the draft. If this entry exists, but no context is available anymore
							// the draft has meanwhile been deleted.
							var sEditingPath = oEditingInfo.context.getPath();
							var oEditingContextData = mPath2ContextData[sEditingPath];
							if (!oEditingContextData || oEditingContextData.oContext){
								oAlternativeContextInfo = {
									context: oEditingInfo.context,
									iDisplayMode: 2
								};
							}
							fnResolveToAlternativeContext();
						}, fnResolveToAlternativeContext);						
					};
					
					if (oContextData.oRemovalPromise){ // sPath describes a draft for which an activation has been started
						oContextData.oRemovalPromise.then(function(oResponse){ // activation was successfull
							oAlternativeContextInfo = { // forward to active entity
								context: oResponse.context,
								iDisplayMode: 1
							};								
							var sDisplayPath = oResponse.context.getPath();
							var oDisplayData = mPath2ContextData[sDisplayPath];
							var oEditingPromise =  oDisplayData && oDisplayData.oEditingPromise;
							if (oEditingPromise){ // active entity might already be in (another) draft
								fnHandleEditingPromise(oEditingPromise);									
							} else {
								fnResolveToAlternativeContext();
							}
						}, fnResolveToAlternativeContext);
					} else if (oContextData.oEditingPromise){ // sPath describes an active object for which a draft is being created 
						fnHandleEditingPromise(oContextData.oEditingPromise);
					} else {
						fnResolveToAlternativeContext();	
					}
				});
			}
			
			function fnAdaptAfterObjectDeleted(sPath){
				var oContextData = mPath2ContextData[sPath];
				if (oContextData){
					oContextData.oContext = null;
				}
			}
			
			function fnAdaptAfterDeletion(aDeletedPath){
				for (var i = 0; i < aDeletedPath.length; i++){
					fnAdaptAfterObjectDeleted(aDeletedPath[i]);	
				}
			}

			return {
				registerContext: registerContext,
				getDraftSiblingPromise: getDraftSiblingPromise,
				activationStarted: activationStarted,
				cancellationStarted: cancellationStarted,
				editingStarted: editingStarted,
				getAlternativeContextPromise: getAlternativeContextPromise,
				adaptAfterDeletion: fnAdaptAfterDeletion
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.lib.ContextBookkeeping", {
			constructor: function(oAppComponent) {
				jQuery.extend(this, getMethods(oAppComponent));
			}
		});
	});