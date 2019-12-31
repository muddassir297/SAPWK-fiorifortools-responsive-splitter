(function () {
	"use strict";
	jQuery.sap.require("sap.ui.comp.smartfield.SmartField");
    jQuery.sap.require("sap.suite.ui.generic.template.extensionAPI.UIMode");
    var UIMode = sap.ui.require("sap/suite/ui/generic/template/extensionAPI/UIMode");

	jQuery.sap.declare("sap.suite.ui.generic.template.js.AnnotationHelper");

	var oAnnotationHelper = {
		// returns the enablement expression for Delete buttons on Object Page toolbars
		buildDeleteButtonEnablementExpression: function (mFacet) {
			var sButtonId = sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(mFacet) + "::deleteEntry";
			return "{= !!${_templPriv>/generic/controlProperties/" + sButtonId + "/enabled}}";
		},

		// the following getXYId and getIconTabFilterKey/Text methods are needed for the table tab mode to correctly initialize the table instances
		// use same IDs as for non-table-tab mode and add a unique suffix (table tab filter key) 
		getSmartTableId: function(oManifestEntry, oTabItem) {
			var sSuffix = sap.suite.ui.generic.template.js.AnnotationHelper.getIconTabFilterKey(oManifestEntry, oTabItem);
			var sResult = "listReport";
			if (sSuffix) {
				sResult = sResult.concat("-" + sSuffix);
			}
			return sResult;
		},

		getAnalyticalTableId: function(oManifestEntry, oTabItem) {
			var sSuffix = sap.suite.ui.generic.template.js.AnnotationHelper.getIconTabFilterKey(oManifestEntry, oTabItem);
			var sResult = "analyticalTable";
			if (sSuffix) {
				sResult = sResult.concat("-" + sSuffix);
			}
			return sResult;
		},

		getGridTableId: function(oManifestEntry, oTabItem) {
			var sSuffix = sap.suite.ui.generic.template.js.AnnotationHelper.getIconTabFilterKey(oManifestEntry, oTabItem);
			var sResult = "GridTable";
			if (sSuffix) {
				sResult = sResult.concat("-" + sSuffix);
			}
			return sResult;
		},

		getResponsiveTableId: function(oManifestEntry, oTabItem) {
			var sSuffix = sap.suite.ui.generic.template.js.AnnotationHelper.getIconTabFilterKey(oManifestEntry, oTabItem);
			var sResult = "responsiveTable";
			if (sSuffix) {
				sResult = sResult.concat("-" + sSuffix);
			}
			return sResult;
		},

		getAddEntryId: function(oManifestEntry, oTabItem) {
			var sSuffix = sap.suite.ui.generic.template.js.AnnotationHelper.getIconTabFilterKey(oManifestEntry, oTabItem);
			var sResult = "addEntry";
			if (sSuffix) {
				sResult = sResult.concat("-" + sSuffix);
			}
			return sResult;
		},

		getDeleteEntryId: function(oManifestEntry, oTabItem) {
			var sSuffix = sap.suite.ui.generic.template.js.AnnotationHelper.getIconTabFilterKey(oManifestEntry, oTabItem);
			var sResult = "deleteEntry";
			if (sSuffix) {
				sResult = sResult.concat("-" + sSuffix);
			}
			return sResult;
		},

		getShowDetailsId: function(oManifestEntry, oTabItem) {
			var sSuffix = sap.suite.ui.generic.template.js.AnnotationHelper.getIconTabFilterKey(oManifestEntry, oTabItem);
			var sResult = "showDetails";
			if (sSuffix) {
				sResult = sResult.concat("-" + sSuffix);
			}
			return sResult;
		},

		getDraftObjectMarkerId: function(oManifestEntry, oTabItem) {
			var sSuffix = sap.suite.ui.generic.template.js.AnnotationHelper.getIconTabFilterKey(oManifestEntry, oTabItem);
			var sResult = "DraftObjectMarker";
			if (sSuffix) {
				sResult = sResult.concat("-" + sSuffix);
			}
			return sResult;
		},

		getIconTabFilterKey: function(oManifestEntry, oTabItem) {
			if (oTabItem && oTabItem.key) {
				return oTabItem.key;
			} else {
				for (var i in oManifestEntry) {
					if (oManifestEntry[i].qualifier === oTabItem.qualifier) {
						return oTabItem.qualifier;
					}
				}
			}
			return "";
		},
		
		getIconTabFilterText: function(oInterface, oManifestEntry) {
			var oModel = oInterface.getModel();
			var sEntityType = oModel.oData.entityType;
			var oEntityType = oModel.oData.metaModel.getODataEntityType(sEntityType);
			var oSelectionVariant = oEntityType[oManifestEntry.qualifier];
			if (oSelectionVariant && oSelectionVariant.Text) {
				return oSelectionVariant.Text.String;
			}
		},

		// returns the 'enabled' value for a button based on annotations
		buildAnnotatedActionButtonEnablementExpression: function (mInterface, mDataField, mFacet, mEntityType, bIsPhone) {
			var mFunctionImport, sButtonId, sAction, oMetaModel;

			// WORKAROUND: as analytical table/chart is not yet fully capable of supporting applicable path (issues with analytical binding), we always set enabled to true
			if (mEntityType && mEntityType["sap:semantics"] === "aggregate" && !bIsPhone) {
				return true;
			}
			// END OF WORKAROUND

			sAction =  mDataField && mDataField.Action && mDataField.Action.String;
			if (sAction) {
				sButtonId = sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartForDatafieldActionButton(mDataField, mFacet);
				 // if RecordType is UI.DataFieldForIntentBasedNavigation and RequiresContext is not "false" (default value is "true") then return binding expression
				if (mDataField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
					if (!mDataField.RequiresContext || mDataField.RequiresContext.Bool !== "false") {
						return "{= !!${_templPriv>/generic/controlProperties/" + sButtonId + "/enabled}}";
					}
				} else if (mDataField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
					oMetaModel = mInterface.getInterface(0).getModel();
					mFunctionImport = oMetaModel.getODataFunctionImport(sAction);
					 // if RecordType is UI.DataFieldForAction and if sap:action-for is defined then return binding expression
					if (!mFunctionImport) {
						jQuery.sap.log.error("The function import " + sAction + " is not defined in the metadata. Buttons that call this function import will not behave as expected.");
					} else if (mFunctionImport["sap:action-for"] && mFunctionImport["sap:action-for"] !== "" && mFunctionImport["sap:action-for"] !== " ") {
						return "{= !!${_templPriv>/generic/controlProperties/" + sButtonId + "/enabled}}";
					}
				}

				return true; // default enabled value for annotated actions
			}
		},

		// returns the applicable-path - which is set to the property 'requestAtLeastFields' on the SmartChart
		// the requestAtLeastFields property will add to the $select OData parameter in order to get the necessary data
		getApplicablePathForChartToolbarActions: function (oInterface, mChartAnnotation, sEntityType) {
			var oMetaModel = oInterface.getInterface(0).getModel();
			var mEntityType = oMetaModel.getODataEntityType(sEntityType);
			var aActions = (mChartAnnotation && mChartAnnotation.Actions) || [];
			var sFunctionImport, mFunctionImport, mODataProperty, aFunctionImport = [], aApplicablePath = [], sApplicablePath;

			// check each annotation for UI.DataFieldForAction and verify that Inline & Determining are not set to true, which will imply that the Action is a toolbar action (based on Actions Concept)
			for (var i = 0; i < aActions.length; i++) {
				if (aActions[i].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction" &&
						(!aActions[i].Inline || aActions[i].Inline.Bool !== "true") && (!aActions[i].Determining || aActions[i].Determining.Bool !== "true")) {
					sFunctionImport = aActions[i].Action && aActions[i].Action.String;
					mFunctionImport = oMetaModel.getODataFunctionImport(sFunctionImport);
					if (mFunctionImport) {
						aFunctionImport.push(mFunctionImport);
					}
				}
			}

			for (var i = 0; i < aFunctionImport.length; i++) {
				// verify that both the sap:action-for and sap:applicable-path annotation are applied to the function import
				mFunctionImport = aFunctionImport[i];
				if (mFunctionImport &&
					mFunctionImport["sap:action-for"] && mFunctionImport["sap:action-for"] !== "" && mFunctionImport["sap:action-for"] !== " " &&
					mFunctionImport["sap:applicable-path"] && mFunctionImport["sap:applicable-path"] !== "" && mFunctionImport["sap:applicable-path"] !== " ") {
					sApplicablePath = mFunctionImport["sap:applicable-path"];
					mODataProperty = oMetaModel.getODataProperty(mEntityType, sApplicablePath);

					// the applicable-path needs to point to a property that has the annotation 'sap:aggregation-role' equal to 'dimension' (and not 'measure' for example)
					if (mODataProperty && mODataProperty["sap:aggregation-role"] === "dimension") {
						aApplicablePath.push(sApplicablePath);
					} else {
						jQuery.sap.log.error("AnnotationHelper.js - method getApplicablePathForChartToolbarActions: the applicable-path " + sApplicablePath +
							" is either pointing to an entity type property which doesn't exist or does not have 'sap:aggregation-role' set to to 'dimension'.");
					}
				}
			}

			// if there are applicable paths in aApplicablePath, then return a comma separated string which contains each applicable path - e.g. ["property1", "property2"] -> "property1, property2"
			if (aApplicablePath.length > 0 ) {
				return aApplicablePath.join();
			}
		},

		// build expression binding for bread crumbs
		buildBreadCrumbExpression: function (oContext, oTitle, oTypeName) {
			var sBinding,
				sBindingTitle = sap.ui.model.odata.AnnotationHelper.format(oContext, oTitle);

			if (oTitle && oTitle.Path && oTypeName && oTypeName.String) {
				sBinding = "{= $" + sBindingTitle + " ? $" + sBindingTitle + " : '" + oTypeName.String + "' }";
				return sBinding;
			} else {
				// in case of a complex binding of the title we do not introduce our default text fallback
				if (!sBindingTitle) {
					return ("no title");
				}
				return sBindingTitle;
			}
		},


		// builds the expression for the Rating Indicator Subtitle
		buildRatingIndicatorSubtitleExpression: function (mSampleSize) {
			if (mSampleSize) {
				return "{parts: [{path: '" + mSampleSize.Path + "'}], formatter: 'sap.suite.ui.generic.template.js.AnnotationHelper.formatRatingIndicatorSubTitle'}";
			}
		},

		// returns the text for the Rating Indicator Subtitle (e.g. '7 reviews')
		formatRatingIndicatorSubTitle: function (iSampleSizeValue) {
			if (iSampleSizeValue) {
				var oResBundle = this.getModel("i18n").getResourceBundle();
				if (this.getCustomData().length > 0) {
					return oResBundle.getText("RATING_INDICATOR_SUBTITLE", [iSampleSizeValue, this.data("Subtitle")]);
				} else {
					var sSubTitleLabel = iSampleSizeValue > 1 ? oResBundle.getText("RATING_INDICATOR_SUBTITLE_LABEL_PLURAL") : oResBundle.getText("RATING_INDICATOR_SUBTITLE_LABEL");
					return oResBundle.getText("RATING_INDICATOR_SUBTITLE", [iSampleSizeValue, sSubTitleLabel]);
				}
			}
		},

		// builds the expression for the Rating Indicator footer
		buildRatingIndicatorFooterExpression: function (mValue, mTargetValue) {
			if (mTargetValue) {
				return "{parts: [{path: '" + mValue.Path + "'}, {path: '" + mTargetValue.Path + "'}], formatter: 'sap.suite.ui.generic.template.js.AnnotationHelper.formatRatingIndicatorFooterText'}";
			}
			return "{parts: [{path: '" + mValue.Path + "'}], formatter: 'sap.suite.ui.generic.template.js.AnnotationHelper.formatRatingIndicatorFooterText'}";
		},

		// returns the text for the Rating Indicator footer (e.g. '2 out of 5')
		// note: the second placeholder (e.g. "5") for the text "RATING_INDICATOR_FOOTER" can come one from the following:
		// i. if the Property TargetValue for the term UI.DataPoint is a Path then the value is resolved by the method buildRatingIndicatorFooterExpression and passed to this method as 'targetValue'
		// ii. if the Property TargetValue is not a Path (i.e. 'Decimal') then we get the value from the control's Custom Data
		// iii. if neither i. or ii. apply then we use the default max value for the sap.m.RatingIndicator control
		formatRatingIndicatorFooterText: function (value, targetValue) {
			if (value) {
				var oResBundle = this.getModel("i18n").getResourceBundle();
				if (targetValue) {
					return oResBundle.getText("RATING_INDICATOR_FOOTER", [value, targetValue]);
				} else if (this.getCustomData().length > 0) {
					return oResBundle.getText("RATING_INDICATOR_FOOTER", [value, this.data("Footer")]);
				} else {
					var iRatingIndicatorDefaultMaxValue = sap.m.RatingIndicator.getMetadata().getPropertyDefaults().maxValue;
					return oResBundle.getText("RATING_INDICATOR_FOOTER", [value, iRatingIndicatorDefaultMaxValue]);
				}
			}
		},

		// builds the expression for the Rating Indicator aggregate Ccunt
		buildRatingIndicatorAggregateCountExpression: function (mValue) {
			return "{parts: [{path: '" + mValue.Path + "'}], formatter: 'sap.suite.ui.generic.template.js.AnnotationHelper.formatRatingIndicatorAggregateCount'}";
		},

		// returns the text for the Rating Indicator aggregated count (e.g. (243))
		formatRatingIndicatorAggregateCount: function (value) {
			var oResBundle = this.getModel("i18n").getResourceBundle();
			var sText;
			if (value) {
				sText = oResBundle.getText("RATING_INDICATOR_AGGREGATE_COUNT", [value]);
			} else if (this.getCustomData().length > 0) {
				sText = oResBundle.getText("RATING_INDICATOR_AGGREGATE_COUNT", [this.data("AggregateCount")]);
			} else {
				sText = "";
			}

			return sText;
		},

		getEditActionButtonVisibility: function (oInterface, mRestrictions, sEntityType, bParameterEdit) {
			//Standard behaviour is that EDIT Button visbility is bound to ui>/editable
			//if an external EDIT has been specified in the manifest with bParameterEdit this can also be restricted by an applicable path
			var	oMetaModel = oInterface.getInterface(0).getModel();

			if (sap.suite.ui.generic.template.js.AnnotationHelper._areUpdateRestrictionsValid(oMetaModel, sEntityType, mRestrictions)) {
				var sUIEditableExpression = "!${ui>/editable}";
				if (mRestrictions) {
					if (mRestrictions.Updatable.Path) {
						sap.suite.ui.generic.template.js.AnnotationHelper._actionControlExpand(oInterface, mRestrictions.Updatable.Path, sEntityType);
						return "{= ${" + mRestrictions.Updatable.Path + "} ? " + sUIEditableExpression + " : false}";
					} else if (mRestrictions.Updatable.Bool === "false" && !bParameterEdit) {
						return false;
					}
				}
				return "{=" + sUIEditableExpression + "}";
			} else {
				return false;
			}
		},

		getDeleteActionButtonVisibility: function (oInterface, mRestrictions, sEntityType) {
			var	oMetaModel = oInterface.getInterface(0).getModel();

			if (sap.suite.ui.generic.template.js.AnnotationHelper.areDeleteRestrictionsValid(oMetaModel, sEntityType, mRestrictions)) {
				var sUIEditableExpression = "!${ui>/editable}";
				if (mRestrictions) {
					if (mRestrictions.Deletable.Path) {
						sap.suite.ui.generic.template.js.AnnotationHelper._actionControlExpand(oInterface, mRestrictions.Deletable.Path, sEntityType);
						return "{= ${" + mRestrictions.Deletable.Path + "} ? " + sUIEditableExpression + " : false}";
					} else if (mRestrictions.Deletable.Bool === "false") {
						return false;
					}
				}
				return "{=" + sUIEditableExpression + "}";
			} else {
				return false;
			}
		},

		getIdForMoreBlockContent : function(oFacet){
			if (oFacet["com.sap.vocabularies.UI.v1.PartOfPreview"] && oFacet["com.sap.vocabularies.UI.v1.PartOfPreview"].Bool === "false"){
				return "::MoreContent";
			}
		},

		checkMoreBlockContent : function(oFacetContext){
			return sap.suite.ui.generic.template.js.AnnotationHelper.checkFacetContent(oFacetContext, false);
		},

		checkBlockContent : function(oFacetContext){
			return sap.suite.ui.generic.template.js.AnnotationHelper.checkFacetContent(oFacetContext, true);
		},

		checkFacetContent : function(oFacetContext, bBlock){
			var sPath;
			var oInterface = oFacetContext.getInterface(0);
			var aFacets = oFacetContext.getModel().getProperty("", oFacetContext);

			//for Reference Facets directly under UI-Facets we need to check facets one level higher - by removing the last part of the path
			var aForPathOfFacetOneLevelHigher = oFacetContext.getPath().split("/Facets");
			var sContextOfFacetOneLevelHigher = oInterface.getModel().getContext(aForPathOfFacetOneLevelHigher[0]);
			if (oInterface.getModel().getProperty('', sContextOfFacetOneLevelHigher).RecordType === "com.sap.vocabularies.UI.v1.ReferenceFacet"){
				return sContextOfFacetOneLevelHigher.getPath();
			} else {
				if (!aFacets){
					return;
				}

				for (var iFacet = 0; iFacet < aFacets.length; iFacet++) {
					if (!bBlock){
						if (aFacets[iFacet]["com.sap.vocabularies.UI.v1.PartOfPreview"] && aFacets[iFacet]["com.sap.vocabularies.UI.v1.PartOfPreview"].Bool === "false"){
							sPath = oInterface.getPath() + "/" + iFacet;
							break;
						}
					} else {
						if (aFacets[iFacet].RecordType !== "com.sap.vocabularies.UI.v1.ReferenceFacet" || (!aFacets[iFacet]["com.sap.vocabularies.UI.v1.PartOfPreview"] || aFacets[iFacet]["com.sap.vocabularies.UI.v1.PartOfPreview"].Bool === "true")){
							sPath = oInterface.getPath() + "/" + iFacet;
							break;
						}
					}
				}
			}

			return sPath;
		},

        // Checks whether inline-create feature has been configured for the given facet
		isInlineCreate : function(oFacet, oSections){
			var oSettings = oSections[sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet)];
			return !!(oSettings && oSettings.createMode && oSettings.createMode === "inline");
		},

		isImageUrl : function(oPropertyAnnotations) {
			var oShowImage = oPropertyAnnotations["com.sap.vocabularies.UI.v1.IsImageURL"] || oPropertyAnnotations["com.sap.vocabularies.UI.v1.IsImageUrl"];
			if (oShowImage && oShowImage.Bool && oShowImage.Bool === "false") {
				return false;
			} else if (oShowImage) {
				return true;
			}
			return false;
		},

		matchesBreadCrumb: function(oInterface, oCandidate, sPath) {
			if (sPath) {
				var aSections = sPath.split("/");
				var oEntitySet, oEntityType, oAssociationEnd;

				if (aSections.length > 0) {
					// there's at least one section left - crate breadcrumbs
					var oMetaModel = oInterface.getInterface(0).getModel();
					var sEntitySet = aSections[0];

					for (var i = 0; i < aSections.length; i++) {
						if (i > 0) {
							oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
							oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
							oAssociationEnd = oMetaModel.getODataAssociationSetEnd(oEntityType, aSections[i]);
							sEntitySet = oAssociationEnd.entitySet;
						}

						if ((i + 1) === aSections.length) {
							if (sEntitySet === oCandidate.name) {
								return true;
							} else {
								return false;
							}
						}
					}
				}
			}
		},
		showFullScreenButton : function(oRouteConfig, oFacet) {
			if (oRouteConfig && oFacet) {
				var sFacetId = sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
				if (oRouteConfig.component
						&& oRouteConfig.component.settings
						&& oRouteConfig.component.settings.sections
						&& oRouteConfig.component.settings.sections[sFacetId]
						&& oRouteConfig.component.settings.sections[sFacetId].tableMode === "FullScreenTable") {
					return true;
				}
			}
			return false;
		},
		getPersistencyKeyForSmartTable : function(oRouteConfig) {
			// ListReport
			return "listReportFloorplanTable";
		},
		getCreateNavigationIntent: function (sListEntitySet, aSubPages, sAnnotationPath) {
			return sap.suite.ui.generic.template.js.AnnotationHelper.getSubObjectPageIntent(sListEntitySet, aSubPages, sAnnotationPath, 'create');
		},
		getDisplayNavigationIntent: function (sListEntitySet, aSubPages, sAnnotationPath) {
			return sap.suite.ui.generic.template.js.AnnotationHelper.getSubObjectPageIntent(sListEntitySet, aSubPages, sAnnotationPath, 'display');
		},
		getSubObjectPageIntent: function (sListEntitySet, aSubPages, sAnnotationPath, sMode) {
			var sNavigationProperty;
			if (sAnnotationPath){
				//AnnotationPath is only filled on Object Page which contains facets->annotationPath
				sNavigationProperty = sAnnotationPath.split("/")[0];
			}
			if (sListEntitySet && aSubPages && aSubPages.length > 0) {
				if (sNavigationProperty){
					for (var i = 0; i < aSubPages.length; i++) {
						if (sListEntitySet === aSubPages[i].entitySet && sNavigationProperty === aSubPages[i].navigationProperty && aSubPages[i].navigation && aSubPages[i].navigation[sMode]) {
							return aSubPages[i].navigation[sMode].target;
						}
					}
				} else {
					for (var i = 0; i < aSubPages.length; i++) {
						if (sListEntitySet === aSubPages[i].entitySet && aSubPages[i].navigation && aSubPages[i].navigation[sMode]) {
							return aSubPages[i].navigation[sMode].target;
						}
					}
				}
			}
		},
		extensionPointFragmentExists: function (oFacet, sFragmentId) {
			var sId = sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
			if (sId === sFragmentId) {
				return true;
			} else {
				return false;
			}
		},
		containsFormWithBreakoutAction: function (oFacetCandidate, sIdCriterion) {
			var sCandidateId = sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacetCandidate);
			if (sCandidateId === sIdCriterion) {
				if (oFacetCandidate.RecordType === "com.sap.vocabularies.UI.v1.ReferenceFacet" &&
						oFacetCandidate.Target &&
						oFacetCandidate.Target.AnnotationPath &&
						oFacetCandidate.Target.AnnotationPath.indexOf("com.sap.vocabularies.UI.v1.FieldGroup") != -1) {
					return true;
				}
			}
			return false;
		},
		formatWithExpandSimple: function (oInterface, oDataField, oEntitySet) {
			var aExpand = [], sExpand, oEntityType;
			var oMetaModel = oInterface && oInterface.getModel && oInterface.getModel();
			if (!oMetaModel) {
				// called with entity set therefore use the correct interface
				oInterface = oInterface.getInterface(0);
				oMetaModel = oInterface.getModel();
			}

			if (oEntitySet) {
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
			} else {
				// TODO: check with UI2 if helper to get entity type can be used, avoid using this path
				var aMatches = /^(\/dataServices\/schema\/\d+\/entityType\/\d+)(?:\/|$)/.exec(oInterface.getPath());
				if (aMatches && aMatches.length && aMatches[0]) {
					var oEntityTypeContext = oMetaModel.getProperty(aMatches[0]);
					var sNamespace = oMetaModel.getODataEntityContainer().namespace;
					oEntityType = oMetaModel.getODataEntityType(sNamespace + '.' + oEntityTypeContext.name);
				}
			}

			if (oEntityType) {
				// check if expand is needed
				if (oDataField && oDataField.Path) {
					sExpand = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, oDataField.Path);
					if (sExpand) {
						aExpand.push(sExpand);
					}

				} else if (oDataField && oDataField.Apply && oDataField.Apply.Name === "odata.concat") {
					oDataField.Apply.Parameters.forEach(function (oParameter) {
						if (oParameter.Type === "Path") {
							sExpand = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, oParameter.Value);
							if (sExpand) {
								if (aExpand.indexOf(sExpand) === -1) {
									aExpand.push(sExpand);
								}
							}
						}
					});
				}

				if (aExpand.length > 0) {
					// we analyze a facet that is part of the root context
					// set expand to expand data bag
					var oPreprocessorsData = oInterface.getSetting("preprocessorsData");
					if (oPreprocessorsData) {
						var aRootContextExpand = oPreprocessorsData.rootContextExpand || [];
						for (var j = 0; j < aExpand.length; j++) {
							if (aRootContextExpand.indexOf(aExpand[j]) === -1) {
								aRootContextExpand.push(aExpand[j]);
							}
						}
						oPreprocessorsData.rootContextExpand = aRootContextExpand;
					}

				}
			}

			return sap.ui.model.odata.AnnotationHelper.format(oInterface, oDataField);
		},

		formatWithExpand: function (oInterface, oDataField, oEntitySet) {
			sap.suite.ui.generic.template.js.AnnotationHelper.getNavigationPathWithExpand(oInterface, oDataField, oEntitySet);

			oInterface = oInterface.getInterface(0);
			sap.suite.ui.generic.template.js.AnnotationHelper.formatWithExpandSimple(oInterface, oDataField, oEntitySet);
			return sap.ui.model.odata.AnnotationHelper.format(oInterface, oDataField);
		},

		_getNavigationPrefix: function (oMetaModel, oEntityType, sProperty) {
			var sExpand = "";
			var aParts = sProperty.split("/");

			if (aParts.length > 1) {
				for (var i = 0; i < (aParts.length - 1); i++) {
					var oAssociationEnd = oMetaModel.getODataAssociationEnd(oEntityType, aParts[i]);
					if (oAssociationEnd) {
						oEntityType = oMetaModel.getODataEntityType(oAssociationEnd.type);
						if (sExpand) {
							sExpand = sExpand + "/";
						}
						sExpand = sExpand + aParts[i];
					} else {
						return sExpand;
					}
				}
			}

			return sExpand;
		},

		getCurrentPathWithExpand: function (oInterface, oContext, oEntitySetContext, sNavigationProperty ) {
			//oContext is needed to be set for having the correct "context" for oInterface
			oInterface = oInterface.getInterface(0);
			var aExpand = [], sNavigationPath;
			var oMetaModel = oInterface.getModel();
			var oEntitySet = oMetaModel.getODataEntitySet(oEntitySetContext.name || '');
			var sResolvedPath = sap.ui.model.odata.AnnotationHelper.resolvePath(oMetaModel.getContext(oInterface.getPath()));
			var oEntityType = oMetaModel.getODataEntityType(oEntitySetContext.entityType);

			aExpand = sap.suite.ui.generic.template.js.AnnotationHelper.getFacetExpand(sResolvedPath, oMetaModel, oEntityType, oEntitySet);

			if (aExpand.length > 0) {
				sNavigationPath = "{ path : '" + sNavigationProperty + "', parameters : { expand : '" + aExpand.join(',') + "'} }";
			} else {
				sNavigationPath = "{ path : '" + sNavigationProperty + "' }";
			}
			//needed in Non Draft Case: binding="{}" NOT WORKING - the fields are NOT visible and editable after clicking + in List Report
			//XMLTemplateProcessor also supports empty string
			if (sNavigationPath === "{}"){
				sNavigationPath = "";
			}
			return sNavigationPath;
		},

		getNavigationPathWithExpand: function (oInterface, oContext, oEntitySetContext) {
			oInterface = oInterface.getInterface(0);
			var aExpand = [];
			var oMetaModel = oInterface.getModel();
			var oEntitySet = oMetaModel.getODataEntitySet(oEntitySetContext.name || '');
			var sResolvedPath = sap.ui.model.odata.AnnotationHelper.resolvePath(oMetaModel.getContext(oInterface.getPath()));

			var sNavigationPath = sap.ui.model.odata.AnnotationHelper.getNavigationPath(oInterface, oContext);
			var sNavigationProperty = sNavigationPath.replace("{", "").replace("}", "");
			if (sNavigationProperty) {
				// from now on we need to set the entity set to the target
				var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
				var oAssociationEnd = oMetaModel.getODataAssociationSetEnd(oEntityType, sNavigationProperty);
				if (oAssociationEnd && oAssociationEnd.entitySet) {
					oEntitySet = oMetaModel.getODataEntitySet(oAssociationEnd.entitySet);
				}
			} else {
				var oEntityType = oMetaModel.getODataEntityType(oEntitySetContext.entityType);
			}

			aExpand = sap.suite.ui.generic.template.js.AnnotationHelper.getFacetExpand(sResolvedPath, oMetaModel, oEntityType, oEntitySet);

			if (aExpand.length > 0) {
				if (sNavigationProperty === "") {
					// we analyze a facet that is part of the root context
					// set expand to expand data bag
					var oPreprocessorsData = oInterface.getSetting("preprocessorsData");
					if (oPreprocessorsData) {
						var aRootContextExpand = oPreprocessorsData.rootContextExpand || [];
						for (var j = 0; j < aExpand.length; j++) {
							if (aRootContextExpand.indexOf(aExpand[j]) === -1) {
								aRootContextExpand.push(aExpand[j]);
							}
						}
						oPreprocessorsData.rootContextExpand = aRootContextExpand;
					}
				} else {
					// add expand to navigation path
					sNavigationPath = "{ path : '" + sNavigationProperty + "', parameters : { expand : '" + aExpand.join(',') + "'} }";
				}
			}
			//needed in Non Draft Case: binding="{}" NOT WORKING - the fields are NOT visible and editable after clicking + in List Report
			//XMLTemplateProcessor also supports empty string
			if (sNavigationPath === "{}"){
				sNavigationPath = "";
			}
			return sNavigationPath;
		},

		getFacetExpand: function (sResolvedPath, oMetaModel, oEntityType, oEntitySet){
			var aDependents = [], aExpand = [], oFacetContent, aFacetContent = [];

			if (sResolvedPath) {
				aFacetContent = oMetaModel.getObject(sResolvedPath) || [];
			}

			aFacetContent = aFacetContent.Data || aFacetContent;

			var fnGetDependents = function (sProperty, bIsValue) {
				var sExpand = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, sProperty);
				if (sExpand) {
					// check if already in expand array - if not yet add it
					if (aExpand.indexOf(sExpand) === -1) {
						aExpand.push(sExpand);
					}
				}
				if (bIsValue) {
					try {
						aDependents = sap.ui.comp.smartfield.SmartField.getSupportedAnnotationPaths(oMetaModel, oEntitySet, sProperty, true) || [];
					} catch (e) {
						aDependents = [];
					}
					for (var i = 0; i < aDependents.length; i++) {
						if (aExpand.indexOf(aDependents[i]) === -1) {
							aExpand.push(aDependents[i]);
						}
					}
				}
			};

			var fnAnalyzeApplyFunctions = function (oParameter) {
				if (oParameter.Type === "LabeledElement") {
					fnGetDependents(oParameter.Value.Path);
				} else if (oParameter.Type === "Path") {
					fnGetDependents(oParameter.Value);
				}
			};

			for (var i = 0; i < aFacetContent.length; i++) {
				oFacetContent = aFacetContent[i];

				if (oFacetContent.Value && oFacetContent.Value.Path) {
					fnGetDependents(oFacetContent.Value.Path, true);
				}

				if (oFacetContent.Value && oFacetContent.Value.Apply && oFacetContent.Value.Apply.Name === "odata.concat") {
					oFacetContent.Value.Apply.Parameters.forEach(fnAnalyzeApplyFunctions);
				}

				if (oFacetContent.Action && oFacetContent.Action.Path) {
					fnGetDependents(oFacetContent.Action.Path);
				}

				if (oFacetContent.Target) {
					if (oFacetContent.Target.Path){
						fnGetDependents(oFacetContent.Target.Path);
					}
					if (oFacetContent.Target.AnnotationPath){
						fnGetDependents(oFacetContent.Target.AnnotationPath);
					}
				}

				if (oFacetContent.SemanticObject && oFacetContent.SemanticObject.Path) {
					fnGetDependents(oFacetContent.SemanticObject.Path);
				}

				if (oFacetContent.Url && oFacetContent.Url.Path) {
					fnGetDependents(oFacetContent.Url.Path);
				}

				if (oFacetContent.Url && oFacetContent.Url.Apply && oFacetContent.Url.Apply.Parameters) {
					oFacetContent.Url.Apply.Parameters.forEach(fnAnalyzeApplyFunctions);
				}


				if (oFacetContent.UrlContentType && oFacetContent.UrlContentType.Path) {
					fnGetDependents(oFacetContent.UrlContentType.Path);
				}

			}

			if (aFacetContent.name) {
				fnGetDependents(aFacetContent.name, true);
			}

			return aExpand;
		},

		isSelf: function (sPath) {
			if (sPath === undefined || (sPath && sPath.indexOf('@') === 0 && sPath.indexOf('/') === -1)) {
				return true;
			}
			return false;
		},
		// Needed for analytics fragments
		number: function (val) {
			if (!val) {
				return NaN;
			} else if (val.Decimal) {
				return +val.Decimal;
			} else if (val.Path) {
				return '{' + val.Path + '}';
			} else {
				return NaN;
			}
		},
		// Needed for analytics fragments
		formatColor: (function () {
			function formatVal(val) {
				if (!val) {
					return NaN;
				} else if (val.Decimal) {
					return val.Decimal;
				} else if (val.EnumMember) {
					return '\'' + val.EnumMember + '\'';
				} else if (val.Path) {
					return '${' + val.Path + '}';
				} else {
					return NaN;
				}
			}

			function formatCriticality(oDataPoint) {
				var criticality = oDataPoint.Criticality;

				return '{= ' + formatVal(criticality) + ' === \'UI.CriticalityType/Negative\' ? \'Error\' : ' + formatVal(criticality) + '=== \'UI.CriticalityType/Critical\' ? \'Critical\' : \'Good\'}';
			}

			function formatCriticalityCalculation(oDataPoint) {
				var value = formatVal(oDataPoint.Value);
				var oCriticalityCalc = oDataPoint.CriticalityCalculation;

				return '{= (' + value + ' < ' + formatVal(oCriticalityCalc.DeviationRangeLowValue) + ' || ' + value + ' > ' + formatVal(oCriticalityCalc.DeviationRangeHighValue) + ') ? \'Error\' : (' + value
					+ ' < ' + formatVal(oCriticalityCalc.ToleranceRangeLowValue) + ' || ' + value + ' > ' + formatVal(oCriticalityCalc.ToleranceRangeHighValue) + ') ? \'Critical\' : \'Good\'}';
			}

			return function (oDataPoint) {
				if (oDataPoint.Criticality) {
					return formatCriticality(oDataPoint);
				} else if (oDataPoint.CriticalityCalculation) {
					return formatCriticalityCalculation(oDataPoint);
				}
			};
		})(),

		_determineColumnIndex: function (oContext) {
			var sColumn = oContext.getPath();
			var iColumnIndex = Number(sColumn.slice(sColumn.lastIndexOf("/") + 1));
			var sLineItem = sColumn.slice(0, sColumn.lastIndexOf("/"));
			var oLineItem = oContext.getModel().getObject(sLineItem);
			for (var iRecord = 0; iRecord < iColumnIndex; iRecord++) {
				if ((oLineItem[iRecord].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
						oLineItem[iRecord].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") &&
						(!oLineItem[iRecord].Inline || oLineItem[iRecord].Inline.Bool === "false")) {
					iColumnIndex--;
				}
			}
			return iColumnIndex;
		},

		createP13NColumnForAction: function (iContext, oDataField) {
			var iColumnIndex = sap.suite.ui.generic.template.js.AnnotationHelper._determineColumnIndex( iContext );

			var sP13N = '\\{"columnKey":"' + oDataField.Label.String + '", "columnIndex":"' + iColumnIndex + '", "actionButton":"true" \\}';
			return sP13N;
		},

		// For Personalization and ContactPopUp for contact column
		createP13NColumnForContactPopUp: function (oInterface, oContextSet, oDataField, oDataFieldTarget, sAnnotationPath) {
			var sP13N = "";
			var sNavigation = "";
			var aAdditionalProperties = [];
			var oMetaModel = oInterface.getInterface(0).getModel();
			if (oMetaModel){
				var oEntityType = oMetaModel.getODataEntityType(oContextSet.entityType);
				if (oEntityType){
					sNavigation = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, sAnnotationPath);
				}
			}
			// Make the Column Key unique for the contact. Check if Navigation exist then create P13N from Navigation path adding DatafieldTarget else create P13N from DataFieldTarget
			if (sNavigation) {
				sP13N = '\\{"columnKey":"' + sNavigation + '/' + oDataFieldTarget.fn.Path + '", "leadingProperty":"' + sNavigation;
				sNavigation = sNavigation + "/";
			} else if (oDataFieldTarget.fn) {
				sP13N = '\\{"columnKey":"' + oDataFieldTarget.fn.Path;
			}
			// For the expand property of Navigation, add navigation and DataFieldTarget to the AdditionalProperties of P13N
			if (oDataFieldTarget.fn && oDataFieldTarget.fn.Path) {
				aAdditionalProperties.push(sNavigation + oDataFieldTarget.fn.Path);
			}
			// Form String to add to P13N from AdditionalProperties Array
			if (aAdditionalProperties.length > 0) {
				var sAdditionalProperties = "";
				aAdditionalProperties.forEach(function (oProperty) {
					if (sAdditionalProperties) {
						sAdditionalProperties = sAdditionalProperties + ",";
					}
					sAdditionalProperties = sAdditionalProperties + oProperty;
				});
				sP13N += '", "additionalProperty":"' + sAdditionalProperties;
			}
			// Determine column index
			var oContext = oInterface.getInterface(1);
			var iColumnIndex = sap.suite.ui.generic.template.js.AnnotationHelper._determineColumnIndex( oContext );
			if (iColumnIndex) {
				sP13N += '", "columnIndex":"' + iColumnIndex;
			}
			sP13N += '" \\}'; // add terminator string again
			return sP13N;
		},

		createP13NColumnForIndicator: function (oInterface, oContextSet, oContextProp, oDataField, oDataFieldTarget, oDataFieldTargetValue, sAnnotationPath) {
			var sP13N = "";
			var sNavigation = "";
			var aAdditionalProperties = [];
			var oMetaModel = oInterface.getInterface(0).getModel();
			if (oMetaModel){
				var oEntityType = oMetaModel.getODataEntityType(oContextSet.entityType);
				if (oEntityType){
					sNavigation = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, sAnnotationPath);
				}
			}
			if (sNavigation){
				sP13N = '\\{"columnKey":"' + sNavigation + '", "leadingProperty":"' + sNavigation;
				sNavigation = sNavigation + "/";
			} else {
				sP13N = '\\{"columnKey":"';
				if (oDataField.Label){
					sP13N += oDataField.Label.String;
				} else if (oDataField.Value) {
					sP13N += oDataField.Value.Path;
				} else {
					sP13N += sAnnotationPath.split('@')[1];
				}
			}
			if (oDataFieldTarget.Value && oDataFieldTarget.Value.Path) {
				aAdditionalProperties.push(sNavigation + oDataFieldTarget.Value.Path);
			}
			if (oDataFieldTarget.TargetValue && oDataFieldTarget.TargetValue.Path) {
				aAdditionalProperties.push(sNavigation + oDataFieldTarget.TargetValue.Path);
			}
			if (oDataFieldTarget.Criticality && oDataFieldTarget.Criticality.Path) {
				aAdditionalProperties.push(sNavigation + oDataFieldTarget.Criticality.Path);
			}
			if (aAdditionalProperties.length > 0) {
				var sAdditionalProperties = "";
				aAdditionalProperties.forEach(function (oProperty) {
					if (sAdditionalProperties) {
						sAdditionalProperties = sAdditionalProperties + ",";
					}
					sAdditionalProperties = sAdditionalProperties + oProperty;
				});
				sP13N += '", "additionalProperty":"' + sAdditionalProperties;
			}
			// Determine column index
			var oContext = oInterface.getInterface(2);
			var iColumnIndex = sap.suite.ui.generic.template.js.AnnotationHelper._determineColumnIndex( oContext );
			if (iColumnIndex) {
				sP13N += '", "columnIndex":"' + iColumnIndex;
			}
			sP13N += '" \\}'; // add terminator string again
			return sP13N;
		},

		createP13NColumnForChart: function (oInterface, oContextSet, oDataField, oDataFieldTarget, sAnnotationPath) {
			var sP13N = '\\{"columnKey":"', aAdditionalProperties = [], sNavigation = "";
			var oMetaModel = oInterface.getInterface(0).getModel();
			if (oMetaModel) {
				var oEntityType = oMetaModel.getODataEntityType(oContextSet.entityType);
				if (oEntityType){
					sNavigation = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, sAnnotationPath);
				}
			}

			if (sNavigation !== "") {
				sP13N += sNavigation + '", "leadingProperty":"' + sNavigation;
				sNavigation += "/";
			} else if (oDataField.Label){
				sP13N += oDataField.Label.String;
			} else {
				sP13N += sAnnotationPath.split('@')[1];
			}

			if (oDataFieldTarget.Dimensions) {
				oDataFieldTarget.Dimensions.forEach(function(oDimension){
					aAdditionalProperties.push(sNavigation + oDimension.PropertyPath);
				});
			}
			if (oDataFieldTarget.Measures) {
				oDataFieldTarget.Measures.forEach(function(oMeasure){
					aAdditionalProperties.push(sNavigation + oMeasure.PropertyPath);
				});
			}

			if (aAdditionalProperties.length > 0) {
				sP13N += '", "additionalProperty":"' + aAdditionalProperties.join();
			}

			var oContext = oInterface.getInterface(1);
			var iColumnIndex = sap.suite.ui.generic.template.js.AnnotationHelper._determineColumnIndex(oContext);
			if (iColumnIndex) {
				sP13N += '", "columnIndex":"' + iColumnIndex;
			}

			sP13N += '" \\}';

			return sP13N;
		},

		createP13N: function (oInterface, oContextSet, oContextProp, oDataField, oDataFieldTarget, oDataFieldTargetValue) {
			var sP13N = "", aAdditionalProperties = [], sNavigation = "";

			if (oDataField.RecordType === "com.sap.vocabularies.UI.v1.DataField" || oDataField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" ||
				oDataField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {

			if (oDataField.Value.Path) {

			    var sColumnKey = oDataField.Value.Path;
				if (oDataField.Visualization && oDataField.Visualization.EnumMember){
					sColumnKey = sColumnKey + oDataField.Visualization.EnumMember.slice(oDataField.Visualization.EnumMember.lastIndexOf("/") + 1, oDataField.Visualization.EnumMember.length);
				}
				sP13N = '\\{"columnKey":"' + sColumnKey + '", "leadingProperty":"' + oDataField.Value.Path;
				// get Navigation Prefix
				var oMetaModel = oInterface.getInterface(0).getModel();
				if (oMetaModel){
					var oEntityType = oMetaModel.getODataEntityType(oContextSet.entityType);
					if (oEntityType){
						sNavigation = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, oDataField.Value.Path);
						if (sNavigation){
							sNavigation = sNavigation + "/";
						}
					}
				}
			} else if (oDataField.Value.Apply && oDataField.Value.Apply.Name === "odata.concat") {
				oDataField.Value.Apply.Parameters.forEach(function (oParameter) {
					if (oParameter.Type === "Path") {
						if (!sP13N) {
							sP13N = '\\{"columnKey":"' + oParameter.Value + '", "leadingProperty":"' + oParameter.Value;
						} else {
							aAdditionalProperties.push(oParameter.Value);
						}
					}
				});
			}
			if ((oContextProp.type === "Edm.DateTime") && (oContextProp["sap:display-format"] === "Date")) {
				sP13N += '", "type":"date';
			}
			if (oDataField.Criticality && oDataField.Criticality.Path) {
				aAdditionalProperties.push(oDataField.Criticality.Path);
			}
			if (oContextProp["com.sap.vocabularies.Common.v1.Text"] && oContextProp["com.sap.vocabularies.Common.v1.Text"].Path) {
				aAdditionalProperties.push(sNavigation + oContextProp["com.sap.vocabularies.Common.v1.Text"].Path);
			}
			if (oContextProp["Org.OData.Measures.V1.ISOCurrency"] && oContextProp["Org.OData.Measures.V1.ISOCurrency"].Path) {
				aAdditionalProperties.push(sNavigation + oContextProp["Org.OData.Measures.V1.ISOCurrency"].Path);
			}
			if (oContextProp["Org.OData.Measures.V1.Unit"] && oContextProp["Org.OData.Measures.V1.Unit"].Path) {
				aAdditionalProperties.push(sNavigation + oContextProp["Org.OData.Measures.V1.Unit"].Path);
			}
			if (oContextProp["com.sap.vocabularies.Common.v1.FieldControl"] && oContextProp["com.sap.vocabularies.Common.v1.FieldControl"].Path) {
				aAdditionalProperties.push(sNavigation + oContextProp["com.sap.vocabularies.Common.v1.FieldControl"].Path);
			}

			if ((oDataField["RecordType"] === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") && oDataField.Url && oDataField.Url.Apply && oDataField.Url.Apply.Parameters) {
				oDataField.Url.Apply.Parameters.forEach(function (oParameter) {
					if (oParameter.Type === "LabeledElement") {
						aAdditionalProperties.push(oParameter.Value.Path);
					}
				});
			}
			if ((oDataField["RecordType"] === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") && oDataField.Url && oDataField.Url.Path) {
				aAdditionalProperties.push(oDataField.Url.Path);
			}
			if (aAdditionalProperties.length > 0) {
				var sAdditionalProperties = "";
				aAdditionalProperties.forEach(function (oProperty) {
					if (sAdditionalProperties) {
						sAdditionalProperties = sAdditionalProperties + ",";
					}
					sAdditionalProperties = sAdditionalProperties + oProperty;
				});
				sP13N += '", "additionalProperty":"' + sAdditionalProperties;
			}
			var bNotSortable = false;
			if (oContextSet["Org.OData.Capabilities.V1.SortRestrictions"] && oContextSet["Org.OData.Capabilities.V1.SortRestrictions"].NonSortableProperties) {
				var aNonSortableProperties = oContextSet["Org.OData.Capabilities.V1.SortRestrictions"].NonSortableProperties;
				for (var i = aNonSortableProperties.length - 1; i >= 0; i--) {
					if (aNonSortableProperties[i].PropertyPath === oDataField.Value.Path) {
						bNotSortable = true;
						break;
					}
				}
			}
			if (!bNotSortable) {
				if (sNavigation) {
					sP13N += '", "sortProperty":"' + sNavigation + oContextProp.name;
				} else {
					sP13N += '", "sortProperty":"' + oContextProp.name;
				}
			}
			var bNotFilterable = false;
			if (oContextSet["Org.OData.Capabilities.V1.FilterRestrictions"]) {
				if (oContextSet["Org.OData.Capabilities.V1.FilterRestrictions"].Filterable !== 'false') {
					if (oContextSet["Org.OData.Capabilities.V1.FilterRestrictions"].NonFilterableProperties) {
						var aNonFilterableProperties = oContextSet["Org.OData.Capabilities.V1.FilterRestrictions"].NonFilterableProperties;
						for (var j = aNonFilterableProperties.length - 1; j >= 0; j--) {
							if (aNonFilterableProperties[j].PropertyPath === oDataField.Value.Path) {
								bNotFilterable = true;
								break;
							}
						}
					}
				} else {
					bNotFilterable = true;
				}
			}
			if (!bNotFilterable) {
				sP13N += '", "filterProperty":"' + oContextProp.name;
			}
			} else {
				sP13N = '\\{"columnKey":"' + oDataField.Label.String + '", "actionButton":"true';
			}
			return sP13N + '" \\}';
		},
		hasActions: function (Par) {
			for (var i = 0; i < Par.length; i++) {
				if (Par[i].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction" || Par[i].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
					return true;
				}
			}
			return false;
		},
		hasCustomActions: function(oRouteConfig, sEntitySet, oManifestExt, oFacet) {
			if (sEntitySet && oManifestExt) {
				if (oFacet) {
					// helper was called from facet (i.e. Object Page table)
					if (oManifestExt[sEntitySet]) {
						var oManifestExtEntitySet = oManifestExt[sEntitySet];
						if (oManifestExtEntitySet.EntitySet === sEntitySet) {
							// helper was called from fragment (i.e. SmartTable)
							var sFacetId = sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
							if (!oManifestExtEntitySet.Sections) {
								return false;
							}
							var oSection = oManifestExtEntitySet.Sections[sFacetId];
							if (oSection && oSection.id === sFacetId && oSection.Actions) {
								for (var i in oSection.Actions) {
									if (oSection.Actions[i].requiresSelection !== false) {
										return true;
									}
								}
							}
						}
					}
				} else {
					// helper was called from ListReport or AnalyticalListPage
					if (oManifestExt["sap.suite.ui.generic.template.ListReport.view.ListReport"]) {
						oManifestExt = oManifestExt["sap.suite.ui.generic.template.ListReport.view.ListReport"]["sap.ui.generic.app"];
					} else if (oManifestExt["sap.suite.ui.generic.template.AnalyticalListPage.view.AnalyticalListPage"]) {
						oManifestExt = oManifestExt["sap.suite.ui.generic.template.AnalyticalListPage.view.AnalyticalListPage"]["sap.ui.generic.app"];
					}
					if (oManifestExt && oManifestExt[sEntitySet]) {
						var oManifestExtEntitySet = oManifestExt[sEntitySet];
						if (oManifestExtEntitySet.EntitySet === sEntitySet) {
							if (oManifestExtEntitySet.Actions) {
								for (var i in oManifestExtEntitySet.Actions) {
									if (oManifestExtEntitySet.Actions[i].requiresSelection !== false) {
										return true;
									}
								}
							}
						}
					}
				}
			}
			return false;
		},
		// Determine selection mode of grid table
		getSelectionModeGridTable: function(aEntities, sRootEntitySet, oManifestExt, oFacet, oEntitySet, oRouteConfig, bIsDraftEnabled) {
			for ( var i in oRouteConfig.pages) {
				if (oRouteConfig.pages[i].entitySet === sRootEntitySet &&  sap.suite.ui.generic.template.js.AnnotationHelper.hasSubObjectPage(oEntitySet, oRouteConfig.pages[i].pages)) {
					return "Single";
				}
			}
			if ((sap.suite.ui.generic.template.js.AnnotationHelper.hasActions(aEntities) || sap.suite.ui.generic.template.js.AnnotationHelper.hasCustomActions(oRouteConfig, sRootEntitySet, oManifestExt, oFacet))){
				return "Single";
			}
			var oDeleteRestrictions = oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"];
			if (oDeleteRestrictions && oDeleteRestrictions.Deletable) {
				if (oDeleteRestrictions.Deletable.Bool && oDeleteRestrictions.Deletable.Bool !== 'false') {
					return "{= ${ui>/editable} ? 'Single' : 'None' }";
				}
				if (oDeleteRestrictions.Deletable.Path) {
					return "{= ${ui>/editable} ? 'Single' : 'None' }";
				}
			}
			//Default mode, only IsDraftEnabled and NO settings in Annotation like sap:deletable="true" or sap:deletable="false"
			if (bIsDraftEnabled) {
				return "{= ${ui>/editable} ? 'Single' : 'None' }";
			}
			return "None";
		},
		// Determine selection mode of responsive table
		getSelectionModeResponsiveTable: function(aEntities, sRootEntitySet, oManifestExt, oFacet, oEntitySet, oRouteConfig, bIsDraftEnabled) {
			if (sap.suite.ui.generic.template.js.AnnotationHelper.hasActions(aEntities) || sap.suite.ui.generic.template.js.AnnotationHelper.hasCustomActions(oRouteConfig, sRootEntitySet, oManifestExt, oFacet)) {
					return "SingleSelectLeft";
			}
			var oDeleteRestrictions = oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"];
			if (oDeleteRestrictions && oDeleteRestrictions.Deletable) {
				if (oDeleteRestrictions.Deletable.Bool && oDeleteRestrictions.Deletable.Bool !== 'false') {
					return "{= ${ui>/editable} ? 'SingleSelectLeft' : 'None' }";
				}
				if (oDeleteRestrictions.Deletable.Path) {
					return "{= ${ui>/editable} ? 'SingleSelectLeft' : 'None' }";
				}
			}
			//Default mode, only IsDraftEnabled and NO settings in Annotation like sap:deletable="true" or sap:deletable="false"
			if (bIsDraftEnabled) {
				return "{= ${ui>/editable} ? 'SingleSelectLeft' : 'None' }";
			}
			return "None";
		},
		getSortOrder: function (Par) {
			var str = '';
			for (var i = 0; i < Par.length; i++) {
				if (!str) {
					str = Par[i].Property.PropertyPath;
				} else {
					str = str + ', ' + Par[i].Property.PropertyPath;
				}
				if (Par[i].Descending) {
					str = str + ' ' + Par[i].Descending.Bool;
				}
			}
			return str;
		},
		replaceSpecialCharsInId: function (sId) {
			if (sId.indexOf(" ") >= 0) {
				jQuery.sap.log.error("Annotation Helper: Spaces are not allowed in ID parts. Please check the annotations, probably something is wrong there.");
			}
			return sId.replace(/@/g, "").replace(/\//g, "::").replace(/#/g, "::");
		},
		getStableIdPartFromDataField: function (oDataField) {
			var sPathConcat = "", sIdPart = "";
			if (oDataField.RecordType && oDataField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
				return sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.Action.String);
			} else if (oDataField.RecordType && oDataField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
				if (oDataField.SemanticObject.String) {
					sIdPart = sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.SemanticObject.String);
				} else if (oDataField.SemanticObject.Path) {
					sIdPart = sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.SemanticObject.Path);
				}
				if (oDataField.Action && oDataField.Action.String) {
					sIdPart = sIdPart + "::" + sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.Action.String);
				} else if (oDataField.Action && oDataField.Action.Path) {
					sIdPart = sIdPart + "::" + sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.Action.Path);
				}
				return sIdPart;
			} else if (oDataField.RecordType && oDataField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
				return sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.Target.AnnotationPath);
			} else if (oDataField.Value && oDataField.Value.Path) {
				return sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.Value.Path);
			} else if (oDataField.Value && oDataField.Value.Apply && oDataField.Value.Apply.Name === "odata.concat") {
				for (var i = 0; i < oDataField.Value.Apply.Parameters.length; i++) {
					if (oDataField.Value.Apply.Parameters[i].Type === "Path") {
						if (sPathConcat) {
							sPathConcat = sPathConcat + "::";
						}
						sPathConcat = sPathConcat + sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.Value.Apply.Parameters[i].Value);
					}
				}
				return sPathConcat;
			} else {
				// In case of a string or unknown property
				jQuery.sap.log.error("Annotation Helper: Unable to create a stable ID. Please check the annotations.");
			}
		},
		getStableIdPartFromDataPoint: function (oDataPoint) {
			var sPathConcat = "";
			if (oDataPoint.Value && oDataPoint.Value.Path) {
				return sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataPoint.Value.Path);
			} else if (oDataPoint.Value && oDataPoint.Value.Apply && oDataPoint.Value.Apply.Name === "odata.concat") {
				for (var i = 0; i < oDataPoint.Value.Apply.Parameters.length; i++) {
					if (oDataPoint.Value.Apply.Parameters[i].Type === "Path") {
						if (sPathConcat) {
							sPathConcat = sPathConcat + "::";
						}
						sPathConcat = sPathConcat + sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataPoint.Value.Apply.Parameters[i].Value);
					}
				}
				return sPathConcat;
			} else {
				// In case of a string or unknown property
				jQuery.sap.log.error("Annotation Helper: Unable to create stable ID derived from annotations.");
			}
		},
		getStableIdPartFromFacet: function (oFacet) {
			var sHeaderFacetPrefix = "";
			if (typeof this.getContext === "function" && this.getContext() && this.getContext().getPath() && this.getContext().getPath().indexOf("com.sap.vocabularies.UI.v1.HeaderFacets") >= 0) {
				sHeaderFacetPrefix = "headerEditable::";
			}
			if (oFacet.RecordType && oFacet.RecordType === "com.sap.vocabularies.UI.v1.CollectionFacet") {
				if (oFacet.ID && oFacet.ID.String) {
					return sHeaderFacetPrefix + oFacet.ID.String;
				} else {
					// If the ID is missing a random value is returned because a duplicate ID error will be thrown as soon as there is
					// more than one form on the UI.
					jQuery.sap.log.error("Annotation Helper: Unable to create a stable ID. You have to set an ID at all collection facets.");
					return Math.floor((Math.random() * 99999) + 1).toString();
				}
			} else if (oFacet.RecordType && oFacet.RecordType === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
				if (oFacet.ID && oFacet.ID.String) {
					return sHeaderFacetPrefix + oFacet.ID.String;
				} else {
					return sHeaderFacetPrefix + sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oFacet.Target.AnnotationPath);
				}
			} else {
				jQuery.sap.log.error("Annotation Helper: Unable to create a stable ID. Please check the facet annotations.");
				return Math.floor((Math.random() * 99999) + 1).toString();
			}
		},
		extensionPointBeforeFacetExists: function (sEntitySet, oFacet, oManifestExtend) {
			if (oManifestExtend){
				var sExtensionPointId = "BeforeFacet|" + sEntitySet + "|" + sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
				return oManifestExtend[sExtensionPointId];
			}
			return false;
		},
		extensionPointAfterFacetExists: function (sEntitySet, oFacet, oManifestExtend) {
			if (oManifestExtend){
				var sExtensionPointId = "AfterFacet|" + sEntitySet + "|" + sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
				return oManifestExtend[sExtensionPointId];
			}
			return false;
		},
		getExtensionPointBeforeFacetTitle: function (sEntitySet, oFacet, oManifestExtend) {
			var sExtensionPointId = "BeforeFacet|" + sEntitySet + "|" + sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
			var oExtension = oManifestExtend[sExtensionPointId];
			if (oExtension && oExtension['sap.ui.generic.app'] && oExtension['sap.ui.generic.app'].title) {
				return oExtension['sap.ui.generic.app'].title;
			}
		},
		getExtensionPointAfterFacetTitle: function (sEntitySet, oFacet, oManifestExtend) {
			var sExtensionPointId = "AfterFacet|" + sEntitySet + "|" + sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
			var oExtension = oManifestExtend[sExtensionPointId];
			if (oExtension && oExtension['sap.ui.generic.app'] && oExtension['sap.ui.generic.app'].title) {
				return oExtension['sap.ui.generic.app'].title;
			}
		},
		getRepeatIndex: function (oValue) {
			if (oValue && oValue.getPath()) {
				var sPadding = "0000000000";
				var sPaddedIndex = sPadding + ((parseInt(oValue.getPath().substring(oValue.getPath().lastIndexOf("/") + 1), 10) + 1 ) * 10).toString();
				return sPaddedIndex.substr(sPaddedIndex.length - sPadding.length);
			} else {
				jQuery.sap.log.error("Annotation Helper: Unable to get index.");
			}
		},
		getColumnListItemType: function (oListEntitySet, aSubPages) {
			if (sap.suite.ui.generic.template.js.AnnotationHelper.hasSubObjectPage(oListEntitySet, aSubPages)) {
				return "Navigation";
			} else {
				return "Inactive";
			}
		},
		hasSubObjectPage: function (oListEntitySet, aSubPages) {
			var bHasSubObjectPage = false;
			if (oListEntitySet.name && aSubPages && aSubPages.length > 0) {
				aSubPages.forEach(function (oSubPage) {
					if (oListEntitySet.name === oSubPage.entitySet) {
						bHasSubObjectPage = true;
						return bHasSubObjectPage;
					}
				});
			}
			return bHasSubObjectPage;
		},

		// Check for Creatable-Path. Returns either true, false, or creatable-path
		isRelatedEntityCreatable: function (oInterface, oSourceEntitySet, oRelatedEntitySet, aSubPages, oFacet, oSections) {

			var result = false;
			var oModel = oInterface.getInterface(0).getModel();
			var oInsertRestrictions = oSourceEntitySet["Org.OData.Capabilities.V1.InsertRestrictions"];
			var oSourceEntityType = oModel.getODataEntityType(oSourceEntitySet.entityType);

			if (oAnnotationHelper.hasSubObjectPage(oRelatedEntitySet, aSubPages) || (oSections && oAnnotationHelper.isInlineCreate(oFacet, oSections))) {
				result = "{= ${ui>/editable}}";

				// check if there are Insert Restrictions.
				if (oInsertRestrictions && oInsertRestrictions.NonInsertableNavigationProperties && oInsertRestrictions.NonInsertableNavigationProperties.length > 0) {
					// find the Insert Restriction for the RelatedEntitySet if available
					for (var i = 0; i < oInsertRestrictions.NonInsertableNavigationProperties.length; i++) {
						var oNavigationProperty = oInsertRestrictions.NonInsertableNavigationProperties[i];
						var sNavigationPropertyPath = sap.suite.ui.generic.template.js.AnnotationHelper._getNonInsertableNavigationPropertyPath(oNavigationProperty);

						if (sNavigationPropertyPath) {	// if Navigation Property Path is undefined, skip this iteration
							var oAssociationSetEnd = oModel.getODataAssociationSetEnd(oSourceEntityType, sNavigationPropertyPath); // get the association set end

							//check if entity set of the Navigation Property Path matches to the input parameter RelatedEntitySet.
							if (oAssociationSetEnd && oAssociationSetEnd.entitySet === oRelatedEntitySet.name) {
								if (oNavigationProperty.If && oNavigationProperty.If.length === 2) { // 2 entries: 1st is the condition and the 2nd is the navigation path
									var oIfCondition = oNavigationProperty.If[0]; // 1st entry is the If condition
									var sFullCreatablePath = oIfCondition.Not ? oIfCondition.Not.Path : oIfCondition.Path;

									// Check if the creatable-path is valid
									if (sap.suite.ui.generic.template.js.AnnotationHelper._isPropertyPathBoolean(oModel, oSourceEntityType.entityType, sFullCreatablePath)) {
										sap.suite.ui.generic.template.js.AnnotationHelper._actionControlExpand(oInterface, sFullCreatablePath, oSourceEntityType.name); // expand the Creatable-Path

										if (oIfCondition.Not) {
											result = "{= ${ui>/editable} ? ${" + sFullCreatablePath + "} : false}";
										} else {
											result = "{= ${ui>/editable} ? !${" + sFullCreatablePath + "} : false}";
										}
									} else {
										result = false; // if the creatable-path is not valid, disable creation; assuming error in the annotations
										jQuery.sap.log.warning("Creatable-Path is not valid. Creation for " + oRelatedEntitySet.name + " is disabled");
									}
								} else {
									result = false; //there is no IF condition therefore the creation for the related entity is disabled
								}
								break; // stop loop
							}
						}
					}
				}
			}
			return result;
		},
		/***************************************************************
			Get the Navigation Property Path from the annotations with IF or not.
		 ***************************************************************/
		_getNonInsertableNavigationPropertyPath: function (oNavigationProperty) {
			var sNavigationPropertyPath;
			if (oNavigationProperty.NavigationPropertyPath) {
				sNavigationPropertyPath = oNavigationProperty.NavigationPropertyPath; // no IF annotation
			} else if (oNavigationProperty.If) {
				sNavigationPropertyPath = oNavigationProperty.If[1].NavigationPropertyPath; // 2nd entry in for the IF is the Navigation Property Path
			}
			return sNavigationPropertyPath;
		},

		areDeleteRestrictionsValid: function (oModel, sEntityType, mRestrictions) {
			// Valid if there is no restrictions,
			var result = !(mRestrictions && mRestrictions.Deletable && mRestrictions.Deletable.Bool && mRestrictions.Deletable.Path) &&
				((!mRestrictions) || (mRestrictions.Deletable && mRestrictions.Deletable.Bool)
					|| (mRestrictions.Deletable && mRestrictions.Deletable.Path && sap.suite.ui.generic.template.js.AnnotationHelper._isPropertyPathBoolean(oModel, sEntityType, mRestrictions.Deletable.Path)));

			if (!result) {
				jQuery.sap.log.error("Service Broken: Delete Restrictions annotations are invalid. ");
			}
			return result;
		},

		_areUpdateRestrictionsValid: function (oModel, sEntityType, mRestrictions) {
			// Valid if there is no restrictions,
			var result = !(mRestrictions && mRestrictions.Updatable && mRestrictions.Updatable.Bool && mRestrictions.Updatable.Path) &&
				((!mRestrictions) || (mRestrictions.Updatable && mRestrictions.Updatable.Bool)
				|| (mRestrictions.Updatable && mRestrictions.Updatable.Path && sap.suite.ui.generic.template.js.AnnotationHelper._isPropertyPathBoolean(oModel, sEntityType, mRestrictions.Updatable.Path)));

			if (!result) {
				jQuery.sap.log.error("Service Broken: Delete Restrictions annotations are invalid. ");
			}
			return result;
		},

		_isPropertyPathBoolean: function (oModel, sEntityTypeName, sPropertyPath) {
			var sProperty = sPropertyPath;
			var oPathEntityType = oModel.getODataEntityType(sEntityTypeName);
			if (sProperty.indexOf("/") > -1) { // if it's a navigation path, we have to expand to find the right entity type
				var aPathParts = sProperty.split("/");
				for (var j = 0; j < aPathParts.length - 1; j++) {  // go through the parts finding the last entity type;
					var oAssociationEnd = oModel.getODataAssociationEnd(oPathEntityType, aPathParts[j]);
					oPathEntityType = oModel.getODataEntityType(oAssociationEnd.type);
				}
				sProperty = aPathParts[aPathParts.length - 1]; // last entry in array is a property
			}

			var oODataProperty = oModel.getODataProperty(oPathEntityType, sProperty);
			return (oODataProperty && oODataProperty.type === "Edm.Boolean");
		},
		actionControl: function (oInterface, sActionApplicablePath, sEntityType) {
			sap.suite.ui.generic.template.js.AnnotationHelper._actionControlExpand(oInterface, sActionApplicablePath, sEntityType);
			if (sActionApplicablePath) {
				return "{path: '" + sActionApplicablePath + "'}";
			} else {
				return "true";
			}
		},
		_actionControlExpand: function (oInterface, sPath, sEntityType) {
			var aExpand = [], sExpand;
			oInterface = oInterface.getInterface(0);
			var oMetaModel = oInterface.getModel();
			var oEntityType = oMetaModel.getODataEntityType(sEntityType);
			// check if expand is needed
			if (sPath) {
				sExpand = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, sPath);
				if (sExpand) {
					aExpand.push(sExpand);
				}
			}
			if (aExpand.length > 0) {
				// we analyze a facet that is part of the root context
				// set expand to expand data bag
				var oPreprocessorsData = oInterface.getSetting("preprocessorsData");
				if (oPreprocessorsData) {
					var aRootContextExpand = oPreprocessorsData.rootContextExpand || [];
					for (var j = 0; j < aExpand.length; j++) {
						if (aRootContextExpand.indexOf(aExpand[j]) === -1) {
							aRootContextExpand.push(aExpand[j]);
						}
					}
					oPreprocessorsData.rootContextExpand = aRootContextExpand;
				}
			}
		},
		getEntityTypesForFormPersonalization: function (oInterface, oFacet, oEntitySetContext) {
			oInterface = oInterface.getInterface(0);
			var aEntityTypes = [];
			var oMetaModel = oInterface.getModel();
			var oEntitySet = oMetaModel.getODataEntitySet(oEntitySetContext.name || '');
			var aFacets = [];
			if (oFacet.RecordType === "com.sap.vocabularies.UI.v1.CollectionFacet" && oFacet.Facets) {
				aFacets = oFacet.Facets;
			} else if (oFacet.RecordType === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
				aFacets.push(oFacet);
			}
			aFacets.forEach(function (oFacet) {
				var sNavigationProperty;
				if (oFacet.Target && oFacet.Target.AnnotationPath && oFacet.Target.AnnotationPath.indexOf("/") > 0) {
					sNavigationProperty = oFacet.Target.AnnotationPath.split("/")[0];
					var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
					var oAssociationEnd = oMetaModel.getODataAssociationSetEnd(oEntityType, sNavigationProperty);
					if (oAssociationEnd && oAssociationEnd.entitySet) {
						oEntitySet = oMetaModel.getODataEntitySet(oAssociationEnd.entitySet);
						if (aEntityTypes.indexOf(oEntitySet.entityType.split(".")[1]) === -1) {
							aEntityTypes.push(oEntitySet.entityType.split(".")[1]);
						}
					}
				} else {
					if (aEntityTypes.indexOf(oEntitySetContext.entityType.split(".")[1]) === -1) {
						aEntityTypes.push(oEntitySetContext.entityType.split(".")[1]);
					}
				}
			});
			return aEntityTypes.join(", ");
		},

		formatHeaderTitle: function(oInterface, oDataField) {
			// return Expression Binding for DefaultTitle in createMode
			return "{parts: [{path: 'ui>/createMode'}, {path: '" + oDataField.Title.Value.Path + "'}], formatter: '._templateFormatters.formatDefaultObjectTitle'}";
		},

		_mapTextArrangement4smartControl: function(sTextArrangementIn) {
			var sTextArrangement = "descriptionAndId";
			switch (sTextArrangementIn) {
				case "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast":
					sTextArrangement = "idAndDescription";
					break;
				case "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate":
					sTextArrangement = "idOnly";
					break;
				case "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly":
					sTextArrangement = "descriptionOnly";
					break;
				default:
					break;
			}
			return sTextArrangement;
		},

		getTextArrangementForSmartControl: function (oInterface, oField, refEntitySet, oEntitySet) {
			oInterface = oInterface.getInterface(0);
			var oEntityType;
			var oMetaModel = oInterface.getModel();

			if (refEntitySet.name == undefined) {
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
			} else {
				oEntityType = oMetaModel.getODataEntityType(refEntitySet.entityType);
			}

		    var sTextArrangement = "descriptionAndId";
			if  (oMetaModel.getODataProperty(oEntityType, oField.Value.Path)) {
				var oPropertyTextModel = oMetaModel.getODataProperty(oEntityType, oField.Value.Path)["com.sap.vocabularies.Common.v1.Text"];
				// 1. check TextArrangement definition for property
				if (oPropertyTextModel && oPropertyTextModel["com.sap.vocabularies.UI.v1.TextArrangement"] && oPropertyTextModel["com.sap.vocabularies.UI.v1.TextArrangement"].EnumMember) {
				  sTextArrangement = sap.suite.ui.generic.template.js.AnnotationHelper._mapTextArrangement4smartControl(
										oPropertyTextModel["com.sap.vocabularies.UI.v1.TextArrangement"].EnumMember);
				}
			}
			// 2. check TextArrangement definition for entity type
			if (oEntityType["com.sap.vocabularies.UI.v1.TextArrangement"] && oEntityType["com.sap.vocabularies.UI.v1.TextArrangement"].EnumMember) {
				sTextArrangement = sap.suite.ui.generic.template.js.AnnotationHelper._mapTextArrangement4smartControl(
									oEntityType["com.sap.vocabularies.UI.v1.TextArrangement"].EnumMember);
			}
			return sTextArrangement;
		},

		isDeepFacetHierarchy: function (oFacet) {
			if (oFacet.Facets) {
				for (var i = 0; i < oFacet.Facets.length; i++) {
					if (oFacet.Facets[i].RecordType === "com.sap.vocabularies.UI.v1.CollectionFacet") {
						return true;
					}
				}
			}
			return false;
		},

		doesCollectionFacetOnlyContainForms: function (oFacet) {
			var bReturn = true;
			if (oFacet.Facets) {
				for (var i = 0; i < oFacet.Facets.length; i++) {
					if (oFacet.Facets[i].Target && oFacet.Facets[i].Target.AnnotationPath) {
						if ((oFacet.Facets[i].Target.AnnotationPath.indexOf("com.sap.vocabularies.UI.v1.FieldGroup") < 0)
							&& (oFacet.Facets[i].Target.AnnotationPath.indexOf("com.sap.vocabularies.UI.v1.Identification") < 0)
							&& (oFacet.Facets[i].Target.AnnotationPath.indexOf("com.sap.vocabularies.UI.v1.DataPoint") < 0)) {
							bReturn = false;
						}
					}
				}
			} else {
				bReturn = false;
			}
			return bReturn;
		},

		doesFieldGroupContainOnlyOneMultiLineDataField: function (oFieldGroup, oFirstDataFieldProperties) {
			if (oFieldGroup.Data.length !== 1) {
				return false;
			}
			if ((oFirstDataFieldProperties['com.sap.vocabularies.UI.v1.MultiLineText'] === undefined)
				|| (oFieldGroup.Data[0].RecordType !== "com.sap.vocabularies.UI.v1.DataField")) {
				return false;
			}
			return true;
		},
		testFormatter: function(value) {
			return "formatted:" + value;
		},
		getFacetID: function(sEntitySet, oFacet) {
			return sEntitySet + "|" + sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
		},
		formatComponentSettings: function(oInterface, oEntitySet, oReuseComponent, sNavigationProperty)	{
			var oThisInterface = oInterface.getInterface(0),
				oMetaModel = oThisInterface.getModel(),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
			sNavigationProperty = sNavigationProperty || oReuseComponent.binding;
			if (sNavigationProperty) {
				// from now on we need to set the entity set to the target
				var oAssociationEnd = oMetaModel.getODataAssociationSetEnd(oEntityType, sNavigationProperty);
				if (oAssociationEnd && oAssociationEnd.entitySet) {
					oEntitySet = oMetaModel.getODataEntitySet(oAssociationEnd.entitySet);
					// fix the type to the target type
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
				}
			}
			var sSemanticObject = sap.ui.model.odata.AnnotationHelper.format(oThisInterface, oEntitySet["com.sap.vocabularies.Common.v1.SemanticObject"]);
			var sObjectKeys = "";
			oEntityType.key.propertyRef.forEach(function (key) {
				sObjectKeys += "{" + key.name + "}::";
			});
			sObjectKeys = sObjectKeys.replace(/::$/, "");
			var	settings = {
			        //Bind the UI mode to the component. Three states are allowed (display,edit,create)
					"uiMode": "{= ${ui>/createMode} ? '" +
					    UIMode.Create +
					    "' : ( ${ui>/editable} ? '" +
					    UIMode.Edit +
					    "' : '" +
					    UIMode.Display +
					    "') }",
                    // The semanti cobject is constant for this context
					"semanticObject": sSemanticObject || ""
				};


			if (oReuseComponent) {
				jQuery.extend(settings, oReuseComponent.settings);
				var sValue = JSON.stringify(settings);
				sValue = sValue.replace(/\}/g, "\\}").replace(/\{/g, "\\{"); // check bindingparser.js escape function
				return sValue;
			}
		},
		isListReportTemplate: function(oRouteConfig) {
			if (oRouteConfig) {
				return oRouteConfig.template === "sap.suite.ui.generic.template.ListReport";
			}
		},
		isAnalyticalListPageOrListReportTemplate: function(oRouteConfig) {
			if (oRouteConfig) {
				return (oRouteConfig.template === "sap.suite.ui.generic.template.AnalyticalListPage" || oRouteConfig.template === "sap.suite.ui.generic.template.ListReport");
			}
		},

		getStableIdPartForDatafieldActionButton: function(oDatafield, oFacet) {
			var sStableId = "";
			var sDatafieldStableId = "";
			var sFacetStableId = "";
			if (oFacet) {
				sFacetStableId = sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
			}
			if (oDatafield) {
				sDatafieldStableId = sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromDataField(oDatafield);
			}
			sStableId = (sFacetStableId !== "" ? sFacetStableId + "::" : "") + "action::" + sDatafieldStableId;
			return sStableId;
		},
		_hasCustomDeterminingActionsInListReport: function(sEntitySet, oManifestExt) {
			if (oManifestExt && oManifestExt[sEntitySet]) {
				var oManifestExtEntitySet = oManifestExt[sEntitySet];
				if (oManifestExtEntitySet.Actions) {
					for (var action in oManifestExtEntitySet.Actions) {
						if (oManifestExtEntitySet.Actions[action].determining) {
							return true;
						}
					}
				}
			}
			return false;
		},
		_hasCustomDeterminingActionsInObjectPage: function(sEntitySet, oManifestExt) {
			if (oManifestExt && oManifestExt[sEntitySet]) {
				var oManifestExtEntitySet = oManifestExt[sEntitySet];
				if (oManifestExtEntitySet.Header && oManifestExtEntitySet.Header.Actions) {
					for (var action in oManifestExtEntitySet.Header.Actions) {
						if (oManifestExtEntitySet.Header.Actions[action].determining) {
							return true;
						}
					}
				}
			}
			return false;
		},
		hasDeterminingActionsRespectingApplicablePath: function(oContext, aTerm, sEntitySet, oManifestExt) {
			var sApplicablePaths = "";
			oContext = oContext.getInterface(0);
			if (sEntitySet && oManifestExt && oManifestExt["sap.suite.ui.generic.template.ObjectPage.view.Details"] &&
					sap.suite.ui.generic.template.js.AnnotationHelper._hasCustomDeterminingActionsInObjectPage(sEntitySet, oManifestExt["sap.suite.ui.generic.template.ObjectPage.view.Details"]["sap.ui.generic.app"])) {
						return "true";
				}
			if (aTerm){
				for (var iRecord = 0; iRecord < aTerm.length; iRecord++) {
					if ((aTerm[iRecord].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction") &&
							aTerm[iRecord].Determining && aTerm[iRecord].Determining.Bool === "true") {
						var sFunctionImport = oContext.getModel().getODataFunctionImport(aTerm[iRecord].Action.String, true);
						var oFunctionImport = oContext.getModel().getObject(sFunctionImport);
						if (oFunctionImport["sap:applicable-path"]) {
							if (sApplicablePaths.length > 0) {
								sApplicablePaths += " || ";
							}
							sApplicablePaths += "${path: '" + oFunctionImport["sap:applicable-path"] + "'}";
						} else {
							return "true";
						}
					}
				}
			}
			if (sApplicablePaths.length > 0) {
				return "{= " + sApplicablePaths +  " || ${ui>/editable}}";
			} else {
				return "{ui>/editable}";
			}
		},
		hasDeterminingActions: function(aTerm, sEntitySet, oManifestExt) {
			if (sEntitySet && oManifestExt && oManifestExt["sap.suite.ui.generic.template.ListReport.view.ListReport"] &&
					sap.suite.ui.generic.template.js.AnnotationHelper._hasCustomDeterminingActionsInListReport(sEntitySet, oManifestExt["sap.suite.ui.generic.template.ListReport.view.ListReport"]["sap.ui.generic.app"])) {
				return "true";
			} else if (sEntitySet && oManifestExt && oManifestExt["sap.suite.ui.generic.template.AnalyticalListPage.view.AnalyticalListPage"] &&
					sap.suite.ui.generic.template.js.AnnotationHelper._hasCustomDeterminingActionsInListReport(sEntitySet, oManifestExt["sap.suite.ui.generic.template.AnalyticalListPage.view.AnalyticalListPage"]["sap.ui.generic.app"])) { //Check for AnalyticalListPage
				return "true";
			}
			for (var iRecord = 0; iRecord < aTerm.length; iRecord++) {
				if ((aTerm[iRecord].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction" || aTerm[iRecord].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") &&
						aTerm[iRecord].Determining && aTerm[iRecord].Determining.Bool === "true") {
						return "true";
					}
			}

			return "false";
		},

		actionControlDetermining: function(oRouteConfig, sActionApplicablePath) {
			if (sap.suite.ui.generic.template.js.AnnotationHelper.isListReportTemplate(oRouteConfig) || !sActionApplicablePath) {
				return true;
			} else {
				return "{path: '" + sActionApplicablePath + "'}";
			}
		},
		actionControlInline: function(sActionApplicablePath) {
			if (!sActionApplicablePath) {
				return true;
			} else {
				return "{path: '" + sActionApplicablePath + "'}";
			}
		},
		actionControlBreakout: function(sActionApplicablePath) {
			if (!sActionApplicablePath) {
				return true;
			} else {
				return "{path: '" + sActionApplicablePath + "'}";
			}
		},

		/**
		 * Build a binding expression that will executed at runtime to calculate the percent value for a datapoint, so it can be consumed in the Progress Indicator.
		 * Rules to calculate:
		 * If the UoM is % then use the value as the percent value
		 * If the UoM is not % or is not provided then build the expression to calculate the percent value = data point value / target * 100
		 * The expression will be then resolved at runtime by the view
		 * Responsibility, resolve paths at pre-processing
		 * @function
		 * @private
		 * @parameter {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface Callback interface object
		 * @parameter {map} dataPoint A DataPoint map as per the vocabulary term com.sap.vocabularies.UI.v1.DataPoint
		 * @parameter {map} [mUoM] A map containg the unit of measure as per the vocabulary term Org.OData.Measures.V1.Unit or Org.OData.Measures.V1.ISOCurrency
		 * @returns {string} A binding expression containing the formula to calculate the Progress Indicator percent value
		 */
		buildExpressionForProgressIndicatorPercentValue : function(oInterface, dataPoint, mUoM){
			var sPercentValueExpression = "0";

			if (dataPoint.Value && dataPoint.Value.Path){ // Value is mandatory and it must be a path
					var sValue = "$" + sap.ui.model.odata.AnnotationHelper.format(oInterface, dataPoint.Value); // Value is expected to be always a path. ${Property}
					var sTarget, sUoM;

					if (dataPoint.TargetValue){ // Target can be a path or Edm Primitive Type
						sTarget = sap.ui.model.odata.AnnotationHelper.format(oInterface, dataPoint.TargetValue);
						sTarget = dataPoint.TargetValue.Path ? "$" + sTarget : sTarget;
					}

					if (mUoM){ // UoM or Currency can be a path or directly in the annotation
						mUoM = mUoM['Org.OData.Measures.V1.Unit'] || mUoM["Org.OData.Measures.V1.ISOCurrency"];
						if (mUoM){
							sUoM = sap.ui.model.odata.AnnotationHelper.simplePath(oInterface, mUoM);
							sUoM = sUoM && mUoM.Path ?  "$" + sUoM : "'" + sUoM + "'";
						}
					}

					// The expression consists of the following parts:
					// 1) When UoM is '%' then percent = value (target is ignored), and check for boundaries (value > 100 and value < 0).
					// 2) When UoM is not '%' (or is not provided) then percent = value / target * 100, check for division by zero and boundaries:
					// percent > 100 (value > target) and percent < 0 (value < 0)
					// Where 0 is Value, 1 is Target, 2 is UoM
					var sExpressionForUoMPercent = "({0} > 100 ? 100 : {0} < 0 ? 0 : {0})";
					var sExpressionForUoMNotPercent = "(({1} > 0) ? (({0} > {1}) ? 100 : (({0} < 0) ? 0 : ({0} / {1} * 100))) : 0)";
					var sExpressionTemplate = "'{'= ({2} === ''%'') ? " + sExpressionForUoMPercent + " : " + sExpressionForUoMNotPercent + " '}'";
					sPercentValueExpression = jQuery.sap.formatMessage(sExpressionTemplate, [sValue, sTarget, sUoM]);
			}

			return sPercentValueExpression;
		},

		/**
		 * The resposibility of this method is to build an expression and its parts to call the runtime formatter to display value
		 * This formatter is called at pre-processing time
		 * @function
		 * @private
		 * @parameter {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface Callback interface object
		 * @parameter {map} dataPoint A DataPoint map as per the vocabulary term com.sap.vocabularies.UI.v1.DataPoint
		 * @parameter {map} [mUoM] A map containg the unit of measure as per the vocabulary term Org.OData.Measures.V1.Unit or Org.OData.Measures.V1.ISOCurrency
		 * @returns {string} A binding expression containing the formatter and parts to compute the Progress Indicator display value
		 */
		buildExpressionForProgressIndicatorDisplayValue : function(oInterface, dataPoint, mUoM){
			var sParts;

			var buildPart = function(oInterface, oProperty){
				var sPropertyPath = sap.suite.ui.generic.template.js.AnnotationHelper.trimCurlyBraces(sap.ui.model.odata.AnnotationHelper.format(oInterface, oProperty));
				var sPart = "{path: '" + sPropertyPath + "'}";
				return sPart;
			};

			sParts = buildPart(oInterface, dataPoint.Value) + ", " + buildPart(oInterface, dataPoint.TargetValue) + ", " + buildPart(oInterface, mUoM);

			var sDisplayValueExpression = "{ parts: [" + sParts + "], formatter: 'sap.suite.ui.generic.template.js.AnnotationHelper.formatDisplayValue' }";
			return sDisplayValueExpression;
		},

		/**
		 * This function is meant ro run at runtime, so the control and resource bundle can be available
		 * @function
		 * @private
		 * @parameter {string} sValue A string containing the value
		 * @parameter {string} sTarget A string containing the target value
		 * @parameter {string} sUoM A string containing the unit of measure
		 * @returns {string} A string containing the text that will be used in the display value of the Progress Indicator
		 */
		formatDisplayValue : function(sValue, sTarget, sUoM){
			var sDisplayValue = "";

			if (sValue){
				var oControl = this;
				var oResourceBundle = oControl.getModel("i18n").getResourceBundle();
				var aCustomData = oControl.getCustomData();
				sTarget = sTarget || aCustomData[0].getValue();
				sUoM = sUoM || aCustomData[1].getValue();
				if (sUoM){
					if (sUoM === '%'){ // uom.String && uom.String === '%'
						sDisplayValue = oResourceBundle.getText("PROGRESS_INDICATOR_DISPLAY_VALUE_UOM_IS_PERCENT", [sValue]);
					} else {// (uom.String and not '%') or uom.Path
						if (sTarget){
							sDisplayValue = oResourceBundle.getText("PROGRESS_INDICATOR_DISPLAY_VALUE_UOM_IS_NOT_PERCENT", [sValue, sTarget, sUoM]);
						} else {
							sDisplayValue = oResourceBundle.getText("PROGRESS_INDICATOR_DISPLAY_VALUE_UOM_IS_NOT_PERCENT_NO_TARGET_VALUE", [sValue, sUoM]);
						}
					}
				} else {
					if (sTarget){
						sDisplayValue = oResourceBundle.getText("PROGRESS_INDICATOR_DISPLAY_VALUE_NO_UOM", [sValue, sTarget]);
					} else {
						sDisplayValue = sValue;
					}
				}
			} else { // Cannot do anything
				jQuery.sap.log.warning("Value property is mandatory, the default (empty string) will be returned");
			}

			return sDisplayValue;
		},

		/**
		 * Build a binding expression for criticality in the progress indicator data point.
		 * Step 1: Check if datapoint is annotated with CriticalityType or CriticalityCalculationType
		 * Step 2: For CriticalityType build the binding expression to check if the property contains, Name or Value of the enumType (Example: 'UI.CriticalityType/Neutral' or '0')
		 * Other cases are not valid and the default sap.ui.core.ValueState.None will be returned
		 * Step 3: For CriticalityCalculationType build the binding expression to calculate the criticality
		 * @parameter {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface Callback interface object
		 * @parameter {map} dataPoint A DataPoint map as per the vocabulary term com.sap.vocabularies.UI.v1.DataPoint
		 * @returns {string} A binding expression for the criticality property of the Progress Indicator
		 */
		buildExpressionForProgressIndicatorCriticality : function(oInterface, dataPoint){
			var sFormatCriticalityExpression = sap.ui.core.ValueState.None;
			var sExpressionTemplate;
			var oCriticalityProperty = dataPoint.Criticality;

			if (oCriticalityProperty) {
				sExpressionTemplate = "'{'= ({0} === ''com.sap.vocabularies.UI.v1.CriticalityType/Negative'') || ({0} === ''1'') || ({0} === 1) ? ''" + sap.ui.core.ValueState.Error + "'' : " +
				"({0} === ''com.sap.vocabularies.UI.v1.CriticalityType/Critical'') || ({0} === ''2'') || ({0} === 2) ? ''" + sap.ui.core.ValueState.Warning + "'' : " +
				"({0} === ''com.sap.vocabularies.UI.v1.CriticalityType/Positive'') || ({0} === ''3'') || ({0} === 3) ? ''" + sap.ui.core.ValueState.Success + "'' : " +
				"''" + sap.ui.core.ValueState.None + "'' '}'";
				if (oCriticalityProperty.Path){
					var sCriticalitySimplePath = '$' + sap.ui.model.odata.AnnotationHelper.simplePath(oInterface, oCriticalityProperty);
					sFormatCriticalityExpression = jQuery.sap.formatMessage(sExpressionTemplate, sCriticalitySimplePath);
				} else if (oCriticalityProperty.EnumMember){
					var sCriticality = "'" + oCriticalityProperty.EnumMember + "'";
					sFormatCriticalityExpression = jQuery.sap.formatMessage(sExpressionTemplate, sCriticality);
				} else {
					jQuery.sap.log.warning("Case not supported, returning the default sap.ui.core.ValueState.None");
				}
			} else {
				// Any other cases are not valid, the default value of 'None' will be returned
				jQuery.sap.log.warning("Case not supported, returning the default sap.ui.core.ValueState.None");
			}

			return sFormatCriticalityExpression;
		},

		trimCurlyBraces : function (value){
			return value ? value.replace("{","").replace("}","") : undefined;
		},

		/**
		 * Get entity set name for Smart Chart and Smart Microchart.
		 * Returns the name of the main entity set (current node in the object page) or the referenced entity set (as per the target of the annotation path).
		 * @parameter {object} refEntitySet The referenced entity set
		 * @parameter {object} entitySet The entity set of the current object in the page
		 * @returns {string} sEntitySetName The entity set name for the main object type or the referenced entity set
		 */
		getEntitySetName : function (refEntitySet, entitySet) {
			var sEntitySetName = "";
			try {
				sEntitySetName = refEntitySet.name || entitySet.name;
			} catch (oError) {
				jQuery.sap.log.warning("At least one of the input parameters is undefined. Returning default value for entity set name.");
			}
			return sEntitySetName;
		},

		getBreakoutActionEnabledKey: function (oAction) {
			var sEnabledKey = "{_templPriv>/generic/listCommons/breakoutActionsEnabled/" + oAction.id + "/enabled}";
			return sEnabledKey;
		},

		buildVisibilityExprOfDataFieldForIntentBasedNaviButton: function (oDataField) {
			if (oDataField.Inline.Bool == "false" && oDataField.RequiresContext.Bool == "false") {
				var sSemanticObject = oDataField.SemanticObject.String;
				var sAction =  oDataField.Action.String;
				return "{= !!${_templPriv>/generic/supportedIntents/" + sSemanticObject + "/" + sAction + "/visible}}"; // maybe we can optimize it later and do one call for all buttons in the toolbar somewhere
			} else {
				return true; // if the button is inline or the button is in the toolbar and has requresContext=true the button is always visible and is enabled/disabled depending on the context
			}
		}
	};
	
	sap.suite.ui.generic.template.js.AnnotationHelper = oAnnotationHelper;
	
	sap.suite.ui.generic.template.js.AnnotationHelper.formatComponentSettings.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.getRepeatIndex.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.formatWithExpand.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.formatWithExpandSimple.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.getNavigationPathWithExpand.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.getCurrentPathWithExpand.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.getEntityTypesForFormPersonalization.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.actionControl.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.formatHeaderTitle.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.getTextArrangementForSmartControl.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.matchesBreadCrumb.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.createP13N.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.createP13NColumnForIndicator.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.createP13NColumnForAction.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.createP13NColumnForContactPopUp.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.createP13NColumnForChart.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.hasDeterminingActionsRespectingApplicablePath.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.buildExpressionForProgressIndicatorPercentValue.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.buildExpressionForProgressIndicatorDisplayValue.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.buildExpressionForProgressIndicatorCriticality.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.getEditActionButtonVisibility.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.getDeleteActionButtonVisibility.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.isRelatedEntityCreatable.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.buildBreadCrumbExpression.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.getApplicablePathForChartToolbarActions.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.buildAnnotatedActionButtonEnablementExpression.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.getIconTabFilterText.requiresIContext = true;
})();