jQuery.sap.require("sap.apf.modeler.ui.utils.textPoolHelper");jQuery.sap.require("sap.apf.modeler.ui.utils.nullObjectChecker");jQuery.sap.require("sap.apf.modeler.ui.utils.optionsValueModelBuilder");jQuery.sap.require("sap.apf.modeler.ui.utils.viewValidator");jQuery.sap.require('sap.apf.modeler.ui.utils.sortDataHandler');jQuery.sap.require('sap.apf.modeler.ui.utils.stepPropertyMetadataHandler');(function(){"use strict";var p,t,c,C,T,g,s,v,S,o,I;var n=new sap.apf.modeler.ui.utils.NullObjectChecker();var a=new sap.apf.modeler.ui.utils.OptionsValueModelBuilder();var b=sap.apf.modeler.ui.utils.TranslationFormatMap.STEP_TITLE;var d=sap.apf.modeler.ui.utils.TranslationFormatMap.STEP_LONG_TITLE;function _(i){i.byId("idStepBasicData").setText(t("stepBasicData"));i.byId("idStepTitleLabel").setText(t("stepTitle"));i.byId("idStepTitle").setPlaceholder(t("newStep"));i.byId("idStepLongTitleLabel").setText(t("stepLongTitle"));i.byId("idStepLongTitle").setPlaceholder(t("stepLongTitle"));i.byId("idCategoryTitleLabel").setText(t("categoryAssignments"));i.byId("idGlobalLabel").setText(t("globalNavigationTarget"));i.byId("idStepSpecificLabel").setText(t("stepSpecificNavTargets"));i.byId("idDataRequest").setText(t("dataRequest"));i.byId("idFilterMapping").setText(t("filterMap"));i.byId("idFilterMapKeepSourceLabel").setText(t("filterMapKeepSource"));i.byId("idNavigationTarget").setText(t("navigationTargetAssignment"));i.byId("idDataReduction").setText(t("dataReduction"));i.byId("idDataReductionLabel").setText(t("dataReductionType"));i.byId("idNoDataReduction").setText(t("noDataReduction"));i.byId("idTopN").setText(t("topN"));i.byId("idNumberOfRecordsLabel").setText(t("recordNumber"));}function e(i,j){var J=t("step")+": "+j;i.getView().getViewData().updateTitleAndBreadCrumb(J);}function f(i,j){var J={id:s.getId(),icon:"sap-icon://BusinessSuiteInAppSymbols/icon-phase"};if(j){J.name=j;}i.getView().getViewData().updateSelectedNode(J);}function h(i){var j,J;if(p&&p.arguments&&p.arguments.stepId){s=C.getStep(p.arguments.stepId);I=(s&&s.getType()==="hierarchicalStep")?true:false;}if(!n.checkIsNotUndefined(s)){J=p.arguments.categoryId;I=p.bIsHierarchicalStep;if(I){j=C.createHierarchicalStep(J);}else{j=C.createStep(J);}s=C.getStep(j);f(i);}}function k(i){var j=this;var J=i.getParameter("bShowFilterMappingLayout");j.byId("idStepFilterMappingVBox").setVisible(J);j.byId("idFilterMapKeepSourceLabel").setVisible(J);j.byId("idFilterKeepSourceCheckBox").setVisible(J);if(!J){j.byId("idFilterMapping").setText("");j.getView().fireEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.step.RESETFILTERMAPPINGFIELDS);}else{j.byId("idFilterMapping").setText(t("filterMap"));}}function l(i){i.byId("idDataReductionForm").setVisible(!I);}function m(i,j,V,J,U){sap.ui.view({viewName:J,type:sap.ui.core.mvc.ViewType.XML,id:i.createId(U),viewData:V,controller:j});}function q(i){var V,j,J,K,L,M,N;V={oTextReader:t,oConfigurationEditor:C,oTextPool:T,oParentObject:s};j=new sap.ui.controller("sap.apf.modeler.ui.controller.stepCornerTexts");m(i,j,V,"sap.apf.modeler.ui.view.cornerTexts","idStepCornerTextView");L=i.byId("idStepCornerTextView");i.byId("idStepCornerTextVBox").insertItem(L);V.oConfigurationHandler=c;V.getCalatogServiceUri=i.getView().getViewData().getCalatogServiceUri;if(I){J=new sap.ui.controller("sap.apf.modeler.ui.controller.hierarchicalStepRequest");}else{J=new sap.ui.controller("sap.apf.modeler.ui.controller.stepRequest");}m(i,J,V,"sap.apf.modeler.ui.view.requestOptions","idStepRequestView");M=i.byId("idStepRequestView");i.byId("idStepRequestVBox").insertItem(M);K=new sap.ui.controller("sap.apf.modeler.ui.controller.stepFilterMapping");m(i,K,V,"sap.apf.modeler.ui.view.requestOptions","idStepFilterMappingView");N=i.byId("idStepFilterMappingView");i.byId("idStepFilterMappingVBox").insertItem(N);M.attachEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.step.SETDATAREDUCTIONSECTION,i.setDataReductionSection.bind(i));M.attachEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.step.SETVISIBILITYOFFILTERMAPPINGFIELDS,k.bind(i));i.getView().attachEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.step.SETVISIBILITYOFFILTERMAPPINGFIELDS,k.bind(i));M.attachEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.step.UPDATEFILTERMAPPINGFIELDS,N.getController().updateFilterMappingFields.bind(N.getController()));i.getView().attachEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.step.RESETFILTERMAPPINGFIELDS,N.getController().resetFilterMappingFields.bind(N.getController()));i.getView().attachEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.UPDATESUBVIEWINSTANCESONRESET,L.getController().updateSubViewInstancesOnReset.bind(L.getController()));i.getView().attachEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.UPDATESUBVIEWINSTANCESONRESET,M.getController().updateSubViewInstancesOnReset.bind(M.getController()));i.getView().attachEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.UPDATESUBVIEWINSTANCESONRESET,N.getController().updateSubViewInstancesOnReset.bind(N.getController()));M.addStyleClass("formTopPadding");M.addStyleClass("formBottomPadding");N.addStyleClass("formTopPadding");N.addStyleClass("formBottomPadding");}function r(i){if(!n.checkIsNotNullOrUndefinedOrBlank(C.getStep(p.arguments.stepId))){return;}i.byId("idStepTitle").setValue(s.getId());if(n.checkIsNotNullOrUndefinedOrBlank(s.getTitleId())&&T.get(s.getTitleId())){i.byId("idStepTitle").setValue(T.get(s.getTitleId()).TextElementDescription);}}function u(i){if(!n.checkIsNotNullOrUndefinedOrBlank(C.getStep(p.arguments.stepId))){return;}i.byId("idStepLongTitle").setValue("");if(n.checkIsNotNullOrUndefinedOrBlank(s.getLongTitleId())&&T.get(s.getLongTitleId())){i.byId("idStepLongTitle").setValue(T.get(s.getLongTitleId()).TextElementDescription);}}function w(i){var j=[];var J=C.getCategories();J.forEach(function(L){var N={};N.CategoryId=L.getId();N.CategoryTitle=T.get(L.labelKey)?T.get(L.labelKey).TextElementDescription:L.labelKey;j.push(N);});var M=a.prepareModel(j,j.length);i.byId("idCategorySelect").setModel(M);var K=C.getCategoriesForStep(s.getId());if(n.checkIsNotNullOrUndefinedOrBlank(K)){i.byId("idCategorySelect").setSelectedKeys(K);}}function x(i){i.byId("idNumberOfRecordsValue").setValue("");i.byId("idNumberOfRecordsValue").setValueState("None");if(s.getTopN()){i.byId("idNumberOfRecordsValue").setValue(s.getTopN().top);}z(i);}function y(i){i.byId("idDataReductionRadioGroup").setSelectedButton(i.byId("idNoDataReduction"));B(i);if(s.getTopN()){i.byId("idDataReductionRadioGroup").setSelectedButton(i.byId("idTopN"));}}function z(i){var j=i.byId("idDataReductionRadioGroup").getSelectedButton()===i.byId("idTopN")?true:false;i.byId("idNumberOfRecordsLabel").setVisible(j);i.byId("idNumberOfRecordsValue").setVisible(j);if(j){v.addField("idNumberOfRecordsValue");}else{v.removeField("idNumberOfRecordsValue");}}function A(i){if(s.getTopN()){S.instantiateStepSortData();if(s.getTopN().orderby.length===0){i.getView().fireEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.step.SETTOPNPROPERTIES);var M=o.createMessageObject({code:"11523"});o.putMessage(M);}}else{S.destroySortData();}}function B(i){var j=(s.getSelectProperties().length!==0)?true:false;i.byId("idDataReductionRadioGroup").setEnabled(j);}function D(i){var j=(s.getFilterProperties().length!==0)?true:false;i.getView().fireEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.step.SETVISIBILITYOFFILTERMAPPINGFIELDS,{"bShowFilterMappingLayout":j});}function E(i){if(n.checkIsNotNullOrUndefinedOrBlank(s.getFilterMappingKeepSource())){i.byId("idFilterKeepSourceCheckBox").setSelected(s.getFilterMappingKeepSource());}}function F(i,N,j,J){var M=[];if(N.length!==0){j.setBusy(true);}N.forEach(function(K){var L={};L.navTargetKey=K.getId();g(K.getId()).then(function(O){L.navTargetName=O;M.push(L);if(M.length===N.length){var P=a.prepareModel(M,M.length);j.setModel(P);j.setSelectedKeys(J);j.setBusy(false);}});});}function G(i){var j=C.getNavigationTargets();var J=s.getNavigationTargets();var N=j.filter(function(K){return K.isStepSpecific();});F(i,N,i.byId("idStepSpecificCombo"),J);}function H(i){var j=C.getNavigationTargets();var N=j.filter(function(K){return K.isGlobal();});var J=N.map(function(K){return K.getId();});F(i,N,i.byId("idGlobalCombo"),J);}sap.ui.controller("sap.apf.modeler.ui.controller.step",{onInit:function(){var i=this,j;var V=i.getView().getViewData();o=V.oCoreApi;t=o.getText;p=V.oParams;c=V.oConfigurationHandler;T=c.getTextPool();C=V.oConfigurationEditor;g=V.getNavigationTargetName;v=new sap.apf.modeler.ui.utils.ViewValidator(i.getView());_(i);h(i);j=new sap.apf.modeler.ui.utils.StepPropertyMetadataHandler(o,s);S=new sap.apf.modeler.ui.utils.SortDataHandler(i.getView(),s,j,t);q(i);i.setDetailData();v.addFields(["idStepTitle","idCategorySelect"]);},setDetailData:function(){var i=this;r(i);u(i);w(i);i.setDataReductionSection();l(i);D(i);E(i);G(i);H(i);},onAfterRendering:function(){var i=this;if(i.byId("idStepTitle").getValue().length===0){i.byId("idStepTitle").focus();}},updateSubViewInstancesOnReset:function(i){var j=this;C=i;s=C.getStep(s.getId());j.getView().fireEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.UPDATESUBVIEWINSTANCESONRESET,{"oConfigurationEditor":C,"oParentObject":s});},setDataReductionSection:function(){var i=this;y(i);x(i);A(i);},handleChangeForStepTitle:function(){var i=this;var j=C.getCategoriesForStep(s.getId());var J=i.byId("idStepTitle").getValue().trim();if(n.checkIsNotNullOrUndefinedOrBlank(J)){T.setTextAsPromise(J,b).done(function(K){s.setTitleId(K);if(j.length>1){i.getView().getViewData().updateTree();}else{f(i,J);}e(i,J);C.setIsUnsaved();});}else{C.setIsUnsaved();}},handleSuggestionsForStepTitle:function(i){var j=new sap.apf.modeler.ui.utils.SuggestionTextHandler(T);j.manageSuggestionTexts(i,b);},handleChangeForStepLongTitle:function(){var i=this;var j=i.byId("idStepLongTitle").getValue().trim();if(n.checkIsNotNullOrUndefinedOrBlank(j)){T.setTextAsPromise(j,d).done(function(J){s.setLongTitleId(J);C.setIsUnsaved();});}else{C.setIsUnsaved();}},handleSuggestionsForStepLongTitle:function(i){var j=new sap.apf.modeler.ui.utils.SuggestionTextHandler(T);j.manageSuggestionTexts(i,d);},handleChangeForCategory:function(){var J=this;var K=s.getId();var L=p.arguments.categoryId;var P=C.getCategoriesForStep(s.getId());var M=J.byId("idCategorySelect").getSelectedKeys();var N=M.indexOf(L);var O=[];var Q=[];var i,j;for(i=0;i<P.length;i++){var R=false;for(j=0;j<M.length;j++){if(P[i]===M[j]){R=true;break;}}if(!R){Q.push(P[i]);}}if(M.length!==0){M.forEach(function(U){C.addCategoryStepAssignment(U,K);var V={oldContext:{name:p.name,arguments:{configId:p.arguments.configId,categoryId:L,stepId:K}},newContext:{arguments:{configId:p.arguments.configId,categoryId:U}}};if(U!==L){O.push(V);}});P.forEach(function(U){if(M.indexOf(U)===-1){C.removeCategoryStepAssignment(U,s.getId());}});if(Q.length!==0){Q.forEach(function(U){var V={oldContext:{name:p.name,arguments:{configId:p.arguments.configId,categoryId:L,stepId:K}},newContext:{arguments:{configId:p.arguments.configId,categoryId:U}},removeStep:true};if(N===-1&&U===L){var W={arguments:{appId:p.arguments.appId,configId:p.arguments.configId,categoryId:M[0],stepId:K}};V.categoryChangeContext=W;V.changeCategory=true;}O.push(V);});}}if(O.length!==0){J.getView().getViewData().updateTree(O);}C.setIsUnsaved();},handleChangeForDataReductionType:function(){var i=this;if(i.byId("idDataReductionRadioGroup").getSelectedButton()===i.byId("idNoDataReduction")){s.resetTopN();i.setDataReductionSection();}else{S.instantiateStepSortData();}z(i);C.setIsUnsaved();},handleValidationForNumberOfRecords:function(i){var j=i.getSource();var V=j.getValue().trim();var J=(V.indexOf(".")!==-1||V<=0||V>10000)?sap.ui.core.ValueState.Error:sap.ui.core.ValueState.None;j.setValueState(J);C.setIsUnsaved();},handleChangeForNoOfRecords:function(i){var j=this;var V=i.getSource().getValue().trim();if(i.getSource().getValueState()===sap.ui.core.ValueState.Error){return;}if(n.checkIsNotNullOrUndefinedOrBlank(V)){if(s.getTopN()===undefined){j.getView().fireEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.step.SETTOPNPROPERTIES);}s.setTopNValue(V);}C.setIsUnsaved();},handleFilterMapKeepSource:function(){var i=this;var j=i.byId("idFilterKeepSourceCheckBox").getSelected();s.setFilterMappingKeepSource(j);C.setIsUnsaved();},handleChangeForStepSpecificNavTargets:function(){var i=this;var j=i.byId("idStepSpecificCombo").getSelectedKeys();var J=s.getNavigationTargets();J.forEach(function(K){if(j.indexOf(K)===-1){s.removeNavigationTarget(K);}});j.forEach(function(K){if(J.indexOf(K)===-1){s.addNavigationTarget(K);}});C.setIsUnsaved();},getValidationState:function(){var i=this;return v.getValidationState()&&i.byId("idStepRequestView").getController().getValidationState()&&i.byId("idStepFilterMappingView").getController().getValidationState();},onExit:function(){var i=this;i.byId("idStepCornerTextView").destroy();i.byId("idStepRequestView").destroy();i.byId("idStepFilterMappingView").destroy();}});}());
