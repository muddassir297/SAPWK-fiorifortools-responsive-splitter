sap.ui.define(["jquery.sap.global","sap/ui/base/Object","sap/ui/core/format/DateFormat","sap/m/ComboBox","sap/m/MessageBox","sap/m/MessageToast","sap/m/Table","sap/ui/model/Filter","sap/ui/model/Sorter","sap/ui/comp/smartfilterbar/SmartFilterBar","sap/ui/table/AnalyticalTable","sap/ui/table/Table","sap/ui/model/odata/type/Time","sap/suite/ui/generic/template/lib/testableHelper"],function(q,B,D,C,M,a,T,F,S,b,A,U,c,t){"use strict";function g(p){var s="";var m=[];return function(o){var l="";var e=p;var f;for(var h in m){if(m[h].path===p){f=m[h];break;}}if(!f){var i=o.getModel("entitySet").getMetaModel();var P=i.getObject(i.getMetaContext(o.sPath+"/"+p).sPath);if(P){var j=" ";for(var k=0;k<P.extensions.length;k++){if(P.extensions[k].namespace==="http://www.sap.com/Protocols/SAPData"){switch(P.extensions[k].name){case"display-format":j=P.extensions[k].value;break;case"label":l=P.extensions[k].value;break;case"text":var n=P.extensions[k].value;var r=p.split("/");r[r.length-1]=n;e=r.join("/");break;default:break;}}}if(l===""){l=p;}f={path:p,data:{type:P.type,displayFormat:j,label:l,textPath:e}};m.push(f);}}l=f.data.label;if(f.data.textPath!==""){if(f.data.textPath===p){s=o.getProperty(f.data.textPath);}else{s=o.getProperty(f.data.textPath)+" ("+o.getProperty(p)+")";}if(s===null||s===undefined){s="";}}else if(o.getProperty(p)!==""){s=o.getProperty(p);}switch(f.data.type){case"Edm.DateTime":if(f.data.displayFormat==="Date"){var u=D.getDateInstance({style:"medium"});var v=new Date(0).getTimezoneOffset()*60*1000;if(s&&s!==""&&s.getTime){s=u.format(new Date(s.getTime()+v));}}break;case"Edm.Time":if(s&&s!==""){var w=new c();s=w.formatValue(s,"string");}break;case"Edm.Boolean":if(s===true){s="{i18n>YES}";}else if(s===false){s="{i18n>NO}";}break;default:break;}return{key:s?s:p,text:l?l+": "+s:s};};}function d(o,e,s,f){function E(i){var j={};for(var k in i){var h1=i[k];if(typeof h1==="string"){j[k]=h1;}else if(typeof h1==="object"){if(h1.value){j[k]=E(h1).value;}else{j[k]=h1;}}}return j;}function h(i){if(i instanceof sap.ui.generic.app.navigation.service.NavError){sap.m.MessageBox.show(i.getErrorCode(),{title:f.getText("ST_GENERIC_ERROR_TITLE")});}}function l(){var i=o.getView().getBindingContext();return s.oApplication.getDraftSiblingPromise(i);}var I;var m;function n(i){I=true;m=i;var j=f.getDialogFragment("sap.suite.ui.generic.template.fragments.DiscardDraftPopover",{onDiscardConfirm:function(){q.sap.log.info("Draft cancellation confirmed");if(!I){q.sap.log.info("Draft popover no longer active -> Ignore.");return;}var k=s.oApplication.getBusyHelper();if(k.isBusy()){q.sap.log.info("Ignore discarding confirmation as app is already busy");return;}q.sap.log.info("Discarding was confirmed, draft will be discarded");k.setBusy(m);m.then(function(h1){q.sap.log.info("Active information for current draft has been read. Start discarding the draft");var i1=h1&&h1.getObject();var j1=i1&&i1.IsActiveEntity;var k1=j1?s.oApplication.getTargetAfterCancelPromise(h1):Promise.resolve();k1.then(function(l1){var m1=s.oCRUDManager.deleteEntity();m1.then(function(){q.sap.log.info("Draft was discarded successfully");I=false;j.close();q.sap.log.info("Draft popover closed");s.oViewDependencyHelper.setRootPageToDirty();s.oViewDependencyHelper.unbindChildren(o.getOwnerComponent());if(l1){q.sap.log.info("Navigate to active entityy");s.oNavigationController.navigateToContext(l1,null,true,1);}else{q.sap.log.info("Deleted draft was create draft. Navigate back");var o1=o.getOwnerComponent().getModel("_templPrivGlobal");var p1=o1.getProperty("/generic/forceFullscreenCreate");if(p1){s.oNavigationController.navigateBack();}else{s.oNavigationController.navigateToRoot(true);}}});var n1={discardPromise:m1};e.fire(o,"AfterCancel",n1);});},function(h1){j.close();});}},"discard");return j;}var p;function r(){p=true;var i=f.getDialogFragment("sap.suite.ui.generic.template.fragments.DiscardSubItemPopover",{onDiscardConfirm:function(){q.sap.log.info("Sub item cancellation confirmed");if(!p){q.sap.log.info("Sub item popover no longer active -> Ignore.");return;}var j=s.oCRUDManager.deleteEntity(false,true);j.then(function(){var h1=o.getOwnerComponent();s.oViewDependencyHelper.setParentToDirty(h1,h1.getNavigationProperty());s.oViewDependencyHelper.unbindChildren(h1,true);i.close();p=false;s.oNavigationController.navigateBack();});var k={deleteEntityPromise:j};e.fire(o,"AfterDelete",k);}},"discard");return i;}function u(j){var k=j;var h1=-1,i1=-1;var j1=f.getOwnerControl(j);if(j1.getTable){j1=j1.getTable();}var k1=j1 instanceof A;if(!k1){var l1=f.getTableBinding(j1);var m1=l1&&l1.binding;var n1=null;if(m1){if(j1 instanceof U){n1=m1.getContexts();}else if(j1 instanceof T){n1=m1.getCurrentContexts();}}var o1=null;var p1=f.getSelectedContexts(j1);var q1=null;if(p1&&p1.length>0){q1=p1[0].getPath();}else if(k){if(j1 instanceof T){q1=k.getBindingContext()?k.getBindingContext().sPath:null;}}if(m1&&m1.getContexts&&q1){for(var i=0;i<n1.length;i++){o1=n1[i];if(o1.getPath()===q1){h1=i;break;}}}if(j1&&h1!==-1){i1=m1.getLength();var r1=Math.floor(i1/5);if(j1 instanceof T){r1=j1.getGrowingThreshold();}else if(j1 instanceof U){r1=j1.getThreshold();}var s1=null;if(m1&&j1 instanceof U){s1=m1.getContexts();}else if(m1&&j1 instanceof T){s1=m1.getCurrentContexts();}var t1=s1&&{listBinding:m1,tableMaxItems:i1,growingThreshold:r1,selectedRelativeIndex:h1,objectPageNavigationContexts:s1,tableNavFrom:j1,endIndex:s1.length-1};var u1=e.getTemplatePrivateModel();var v1=u1.getProperty("/generic/viewLevel");var w1=o.getOwnerComponent().getModel("_templPrivGlobal");w1.setProperty("/generic/paginatorInfo/"+v1,t1);}}}function v(j,k){var h1=o.getView().getModel().getMetaModel();var i1=k;var j1=h1.getODataEntitySet(j,false);var k1=h1.getODataEntityType(j1.entityType,false);var l1=k1.key.propertyRef;var i;var m1=s.oDraftController.getDraftContext();if(m1.isDraftEnabled(j)){l1=l1.concat(m1.getSemanticKey(j));l1.push({name:"IsActiveEntity"},{name:"HasDraftEntity"},{name:"HasActiveEntity"});}if(i1.parameters.select&&i1.parameters.select.length>0){var n1=i1.parameters.select.split(",");for(i=0;i<l1.length;i++){if(q.inArray(l1[i].name,n1)===-1){i1.parameters.select+=","+l1[i].name;}}}return i1;}function w(i,j){var k=i.getSource().getUrl();i.preventDefault();f.processDataLossConfirmationIfNonDraft(function(){sap.m.URLHelper.redirect(k,false);},q.noop,j);}function x(i,j){i.preventDefault();var k=i.getSource().getHref();f.processDataLossConfirmationIfNonDraft(function(){window.location.hash=k;},q.noop,j);}function y(j){return f.getDialogFragment("sap.suite.ui.generic.template.ListReport.view.fragments.DeleteConfirmation",{onCancel:function(i){var k=i.getSource().getParent();k.close();},onDelete:function(k){var h1=k.getSource().getParent();var i1=h1.getModel("delete");var j1=i1.getProperty("/items");var k1=[];for(var i=0;i<j1.length;i++){if(!j1[i].draftStatus.locked&&j1[i].deletable){if(j1.length===i1.getProperty("/unsavedChangesItemsCount")||!j1[i].draftStatus.unsavedChanges||i1.getProperty("/checkboxSelected")){k1.push(j1[i].context.getPath());}}}s.oCRUDManager.deleteEntities(k1).then(function(l1){var m1=j.getTable();m1.getModel("_templPriv").setProperty("/listReport/deleteEnabled",false);var n1=k1.length-l1.length;if(l1.length>0){var o1="";if(n1>0){o1+=(n1>1)?f.getText("ST_GENERIC_DELETE_SUCCESS_PLURAL_WITH_COUNT",[n1]):f.getText("ST_GENERIC_DELETE_SUCCESS_WITH_COUNT",[n1]);o1+="\n";o1+=(l1.length>1)?f.getText("ST_GENERIC_DELETE_ERROR_PLURAL_WITH_COUNT",[l1.length]):f.getText("ST_GENERIC_DELETE_ERROR_WITH_COUNT",[l1.length]);}else{o1=(l1.length>1)?f.getText("ST_GENERIC_DELETE_ERROR_PLURAL"):f.getText("ST_GENERIC_DELETE_ERROR");}M.error(o1);}else{var p1="";p1=(n1>1)?f.getText("ST_GENERIC_DELETE_SUCCESS_PLURAL"):f.getText("ST_GENERIC_OBJECT_DELETED");a.show(p1);}j.getTable().attachEventOnce("updateFinished",function(){f.setEnabledToolbarButtons(j);});j.rebindTable();},function(l1){M.error(f.getText("ST_GENERIC_DELETE_ERROR_PLURAL",[k1.length]),{styleClass:f.getContentDensityClass()});});h1.close();}},"delete");}function z(j){var k=o.getView().getModel();var h1=k.getMetaModel();var i1=h1.getODataEntitySet(o.getOwnerComponent().getEntitySet());var j1=i1["Org.OData.Capabilities.V1.DeleteRestrictions"];var k1=(j1&&j1.Deletable&&j1.Deletable.Path)?j1.Deletable.Path:"";var l1={items:undefined,itemsCount:j.length,text:{title:undefined,shortText:undefined,unsavedChanges:undefined,longText:undefined,undeletableText:undefined},lockedItemsCount:0,unsavedChangesItemsCount:0,undeletableCount:0,checkboxSelected:true};var m1=[];for(var i=0;i<j.length;i++){var n1=k.getObject(j[i].getPath());var o1={};var p1=true;if(!n1.IsActiveEntity){o1.draft=true;}else if(n1.HasDraftEntity){var q1=k.getProperty("DraftAdministrativeData/InProcessByUser",j[i]);if(q1){o1.locked=true;o1.user=q1;l1.lockedItemsCount++;}else{o1.unsavedChanges=true;o1.user=k.getProperty("DraftAdministrativeData/LastChangedByUser",j[i]);l1.unsavedChangesItemsCount++;}}if(k1&&k1!==""){if(k.getProperty(k1,j[i])===false){p1=false;l1.undeletableCount++;}}m1.push({context:j[i],draftStatus:o1,deletable:p1});}l1.items=m1;if(l1.lockedItemsCount===l1.itemsCount){l1.text.title=f.getText("ST_GENERIC_ERROR_TITLE");}else{l1.text.title=(l1.itemsCount>1)?f.getText("ST_GENERIC_DELETE_TITLE_WITH_COUNT",[l1.itemsCount]):f.getText("ST_GENERIC_DELETE_TITLE");}l1.text.unsavedChanges=f.getText("ST_GENERIC_UNSAVED_CHANGES_CHECKBOX");if(l1.itemsCount>1){if(l1.lockedItemsCount===l1.itemsCount){l1.text.shortText=f.getText("ST_GENERIC_DELETE_LOCKED_PLURAL");}else if(l1.unsavedChangesItemsCount===l1.itemsCount){l1.text.shortText=f.getText("ST_GENERIC_DELETE_UNSAVED_CHANGES_PLURAL");}else if(l1.lockedItemsCount>0){var r1=l1.itemsCount-l1.lockedItemsCount;l1.text.shortText=(l1.lockedItemsCount>1)?f.getText("ST_GENERIC_CURRENTLY_LOCKED_PLURAL",[l1.lockedItemsCount,l1.itemsCount]):f.getText("ST_GENERIC_CURRENTLY_LOCKED",[l1.itemsCount]);l1.text.shortText+="\n";if(r1===l1.unsavedChangesItemsCount){l1.text.shortText+=(r1>1)?f.getText("ST_GENERIC_DELETE_REMAINING_UNSAVED_CHANGES_PLURAL"):f.getText("ST_GENERIC_DELETE_REMAINING_UNSAVED_CHANGES");}else{l1.text.shortText+=(r1>1)?f.getText("ST_GENERIC_DELETE_REMAINING_PLURAL",[r1]):f.getText("ST_GENERIC_DELETE_REMAINING");}}else{l1.text.shortText=f.getText("ST_GENERIC_DELETE_SELECTED_PLURAL");}if(l1.undeletableCount>0){l1.text.undeletableText=f.getText("ST_GENERIC_DELETE_UNDELETABLE",[l1.undeletableCount,l1.itemsCount]);}}else{if(l1.lockedItemsCount>0){l1.text.shortText=f.getText("ST_GENERIC_DELETE_LOCKED",[" ",l1.items[0].draftStatus.user]);}else if(l1.unsavedChangesItemsCount>0){l1.text.shortText=f.getText("ST_GENERIC_DELETE_UNSAVED_CHANGES",[" ",l1.items[0].draftStatus.user]);}else{l1.text.shortText=f.getText("ST_GENERIC_DELETE_SELECTED");}}return l1;}function G(i){M.error(f.getText(i),{styleClass:f.getContentDensityClass()});}function H(i,j,k,h1){var i1=f.getNavigationHandler();var j1={};var k1={};for(var l1 in i.parameters){if(q.isEmptyObject(i.parameters[l1])){j1[l1]=i.parameters[l1];}else{k1[l1]=i.parameters[l1];}}k1=E(k1);i1.mixAttributesAndSelectionVariant({},h1).getParameterNames().forEach(function(l1){delete j1[l1];});var m1=k&&k.getObject();var n1=j&&j.getObject();var o1=q.extend({},j1,m1,n1,k1);return i1.mixAttributesAndSelectionVariant(o1,h1);}function N(i,j,k,h1){var i1=f.getNavigationHandler();var j1;if(k){j1=k.getDataSuiteFormat();}var k1=H(i,j,o.getView().getBindingContext(),j1);i1.navigate(i.semanticObject,i.action,k1.toJSONString(),null,h);}function J(i,j,k){var h1=o.getOwnerComponent().getAppComponent().getManifestEntry("sap.app");var i1=h1.crossNavigation.outbounds[i.data("CrossNavigation")];var j1;if(k){j1=f.getOwnerControl(i).getParent();}N(i1,j,k,j1);}function K(j,k){for(var i=0;i<j.length;i++){if(j[i].indexOf("/")!==-1){var h1=j[i].split("/");h1.pop();var i1=h1.join("/");if(k.indexOf(i1)===-1){k.push(i1);}}}}function L(i,j){}function O(k){var h1=o.getOwnerComponent().getAppComponent().getManifestEntry("sap.ui.generic.app");var i1={};if(h1&&h1.pages[0]&&h1.pages[0].component&&h1.pages[0].component.settings){i1=h1.pages[0].component.settings.tableTabs;}var j1=[];for(var k1 in i1){var l1=i1[k1].qualifier;if(l1){j1[k1]=[];var m1=k[l1];for(var i in m1.SelectOptions){if(m1.SelectOptions[i].PropertyName){var n1=m1.SelectOptions[i].PropertyName.PropertyPath;for(var j in m1.SelectOptions[i].Ranges){var o1=m1.SelectOptions[i].Ranges[j].Option;o1.EnumMember=o1.EnumMember.replace("com.sap.vocabularies.UI.v1.SelectionRangeOptionType/","");var p1=m1.SelectOptions[i].Ranges[j].Low;var q1=m1.SelectOptions[i].Ranges[j].High;if(q1){j1[k1].push(new F(n1,o1.EnumMember,p1.String,q1.String));}else{j1[k1].push(new F(n1,o1.EnumMember,p1.String));}}}}}}return j1;}function V(o,j,k,h1){var i1=o.getOwnerComponent().getAppComponent().getManifestEntry("sap.ui.generic.app");if(o.getMetadata().getName()==='sap.suite.ui.generic.template.ListReport.view.ListReport'&&i1&&i1.pages[0]&&i1.pages[0].component&&i1.pages[0].component.settings&&i1.pages[0].component.settings.tableTabs){var j1=j.getFilters();if(j1[0]&&j1[0]._bMultiFilter){j1=j1[0].aFilters;}if(j1){for(var i in j1){h1.filters.push(j1[i]);}}}}function P(i){var h1=i.getSource();var i1=h1.getTable();if(i1 instanceof T){var j1=i1.getColumns();for(var k1=0;k1<j1.length;k1++){if(j1[k1].getCustomData()[0].getValue()&&j1[k1].getCustomData()[0].getValue()["actionButton"]==="true"){j1[k1].setPopinDisplay("WithoutHeader");}}}var l1=i.getParameter("bindingParams");l1.parameters=l1.parameters||{};var m1=o.byId(h1.getSmartFilterId());if(!m1){m1=o.byId("listReportFilter");V(o,m1,h1,l1);}if(m1 instanceof b){var n1=m1.getControlByKey("EditState");if(n1 instanceof C){var o1=n1.getSelectedKey();switch(o1){case"1":l1.filters.push(new F("IsActiveEntity","EQ",true));l1.filters.push(new F("HasDraftEntity","EQ",false));break;case"2":l1.filters.push(new F("IsActiveEntity","EQ",false));break;case"3":l1.filters.push(new F("IsActiveEntity","EQ",true));l1.filters.push(new F("SiblingEntity/IsActiveEntity","EQ",null));l1.filters.push(new F("DraftAdministrativeData/InProcessByUser","NE",""));break;case"4":l1.filters.push(new F("IsActiveEntity","EQ",true));l1.filters.push(new F("SiblingEntity/IsActiveEntity","EQ",null));l1.filters.push(new F("DraftAdministrativeData/InProcessByUser","EQ",""));break;default:var p1=new F({filters:[new F("IsActiveEntity","EQ",false),new F("SiblingEntity/IsActiveEntity","EQ",null)],and:false});if(l1.filters[0]&&l1.filters[0].aFilters){var q1=l1.filters[0];l1.filters[0]=new F([q1,p1],true);}else{l1.filters.push(p1);}break;}}}v(h1.getEntitySet(),l1);var r1=l1.parameters.select&&l1.parameters.select.split(",")||[];var s1=l1.parameters&&l1.parameters.expand&&l1.parameters.expand.split(",")||[];var t1=h1.getEntitySet();if(r1&&r1.length>0){var u1=h1.getModel().getMetaModel();var v1=u1.getODataEntitySet(t1);var w1={};var x1=u1.getODataEntityType(v1.entityType);for(var y1=0;y1<r1.length;y1++){var z1=r1[y1];if(z1){var w1=u1.getODataProperty(x1,z1);if(w1&&w1["com.sap.vocabularies.Common.v1.FieldControl"]&&w1["com.sap.vocabularies.Common.v1.FieldControl"].Path){var A1=w1["com.sap.vocabularies.Common.v1.FieldControl"].Path;if(A1!==" "&&l1.parameters.select.search(A1)===-1){l1.parameters.select+=","+A1;r1.push(A1);}}}}if(i1 instanceof T){var B1=l1.sorter[0];if(B1&&B1.vGroup){var C1=u1.getODataProperty(x1,B1.sPath);var D1=C1["sap:text"]||(C1["com.sap.vocabularies.Common.v1.Text"]||"").Path||"";if(D1){if(q.inArray(D1,r1)===-1){l1.parameters.select+=","+D1;r1.push(D1);}}}}var E1=v1["Org.OData.Capabilities.V1.DeleteRestrictions"];if(E1&&E1.Deletable&&E1.Deletable.Path&&l1.parameters.select.search(E1.Deletable.Path)===-1){l1.parameters.select+=","+E1.Deletable.Path;r1.push(E1.Deletable.Path);}var F1,G1;var x1=u1.getODataEntityType(v1.entityType);var H1=x1["com.sap.vocabularies.UI.v1.LineItem"]||[];for(var y1=0;y1<H1.length;y1++){if(H1[y1].RecordType==="com.sap.vocabularies.UI.v1.DataFieldForAction"){F1=u1.getODataFunctionImport(H1[y1].Action.String,true);if(F1){G1=u1.getObject(F1);if(G1["sap:action-for"]!==" "&&G1["sap:applicable-path"]!==" "&&l1.parameters.select.search(G1["sap:applicable-path"])===-1){l1.parameters.select+=","+G1["sap:applicable-path"];r1.push(G1["sap:applicable-path"]);}}}}var I1=f.getBreakoutActionsForTable(h1,o);var J1=f.getBreakoutActionsFromManifest(i1.getModel());for(var K1 in J1){if(q.inArray(J1[K1].id,I1)!==-1){if(J1[K1].requiresSelection&&J1[K1].applicablePath){if(l1.parameters.select.search(J1[K1].applicablePath)===-1){l1.parameters.select+=","+J1[K1].applicablePath;r1.push(J1[K1].applicablePath);}}}}}K(r1,s1);var L1=s.oDraftController.getDraftContext();if(L1.isDraftEnabled(t1)&&L1.isDraftRoot(t1)){if(L1.hasDraftAdministrativeData(t1)){if(r1&&r1.length>0){if(r1.indexOf("DraftAdministrativeData")===-1){l1.parameters.select=l1.parameters.select+",DraftAdministrativeData";}}if(s1.indexOf("DraftAdministrativeData")===-1){s1.push("DraftAdministrativeData");}}}if(s1.length>0){l1.parameters.expand=s1.join(",");}var M1=h1.getCustomData();var N1={};for(var k=0;k<M1.length;k++){N1[M1[k].getKey()]=M1[k].getValue();}var O1=h1.fetchVariant();if((!O1||!O1.sort)&&i1 instanceof T&&N1.TemplateSortOrder){var P1=N1.TemplateSortOrder.split(", ");for(var j=0;j<P1.length;j++){var Q1=P1[j].split(" ");if(Q1.length>1){l1.sorter.push(new S(Q1[0],Q1[1]==="true"));}else{l1.sorter.push(new S(Q1[0]));}}}if(i1 instanceof T){var B1=l1.sorter[0];if(B1&&B1.vGroup){B1.fnGroup=g(B1.sPath);}}h1.getTable().attachEventOnce("updateFinished",function(){f.setEnabledToolbarButtons(h1);f.setEnabledFooterButtons(h1,o);});}function Q(i,j,k){i[j].setCount(k);}function R(j){var k=o.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui.generic.app");if(k&&k.pages[0]&&k.pages[0].component&&k.pages[0].component.settings&&k.pages[0].component.settings.tableTabs){var h1=j.getParameter("bindingParams");h1.parameters=h1.parameters||{};var i1=j.getSource();var j1=i1.getModel();var k1=j1.getMetaModel();var l1=i1.getEntitySet();var m1=k1.getODataEntitySet(l1);var n1=k1.getODataEntityType(m1.entityType);var o1=O(n1);var p1=o.byId("iconTabBar");var q1=p1.getSelectedKey();var r1=p1.getItems();for(var s1 in r1){var t1=[];for(var i in h1.filters){t1.push(h1.filters[i]);}for(var i in o1[s1]){t1.push(o1[s1][i]);}var u1=o.byId("listReport-"+s1);var l1=u1.getEntitySet();j1.read("/"+l1+"/$count",{urlParameters:h1.parameters,filters:t1,groupId:"updateTabs",success:Q.bind(null,r1,s1),error:function(v1,w1){}});}for(var i in o1[q1]){h1.filters.push(o1[q1][i]);}}}function W(i,j){f.processDataLossConfirmationIfNonDraft(function(){if(i.data("CrossNavigation")){J(i,i.getBindingContext(),j.oSmartFilterbar);return;}var k=f.getOwnerControl(i);u(i);f.navigateFromListItem(i.getBindingContext(),k);},q.noop,j);}function X(i,j){var k=i.getParent().getParent().getTable();var h1=f.getSelectedContexts(k);switch(h1.length){case 0:G("ST_GENERIC_NO_ITEM_SELECTED");return;case 1:f.processDataLossConfirmationIfNonDraft(function(){if(i.data("CrossNavigation")){J(i,h1[0],j.oSmartFilterbar);return;}u(i);f.navigateFromListItem(h1[0],k);},q.noop,j);return;default:G("ST_GENERIC_MULTIPLE_ITEMS_SELECTED");return;}}function Y(i,j){var k=i.getSource();var h1=f.getOwnerControl(k);var i1=f.getSelectedContexts(h1);switch(i1.length){case 0:case 1:f.processDataLossConfirmationIfNonDraft(function(){var j1={action:k.data('Action'),semanticObject:k.data('SemanticObject')};N(j1,i1[0],j.oSmartFilterbar||undefined,j.oSmartTable||undefined);},q.noop,j);return;default:G("ST_GENERIC_MULTIPLE_ITEMS_SELECTED");return;}}function Z(i,j){var k=i.getSource();var h1=k.getParent().getBindingContext();var i1=k.data('SemanticObject');var j1=k.data('Action');f.processDataLossConfirmationIfNonDraft(function(){var k1={action:j1,semanticObject:i1};N(k1,h1,j.oSmartFilterbar||undefined,j.oSmartTable||undefined);},q.noop,j);}function $(i,j,k){f.processDataLossConfirmationIfNonDraft(function(){var h1={action:j.Action,semanticObject:j.SemanticObject};N(h1,i,k.oSmartFilterbar,k.oSmartTable);},q.noop,k);}function _(i,j){f.processDataLossConfirmationIfNonDraft(function(){var k={semanticObject:i.data("SemanticObject"),action:i.data("Action")};var h1=i.getParent().getBindingContext();N(k,h1,j.oSmartFilterbar,j.oSmartTable);},q.noop,j);}function a1(i,j){var k,h1="";var i1=f.getOwnerControl(i.getSource());var j1=i.getSource().data();var k1=f.getSelectedContexts(i1);var l1=i1.getMetadata().getName();if(l1==="sap.ui.comp.smarttable.SmartTable"){k=i1.getTable();h1=i1.getTableBindingPath();}else if(l1==="sap.ui.comp.smartchart.SmartChart"){k=i1.getChart();h1=i1.getChartBindingPath();}b1({functionImportPath:j1.Action,contexts:k1,sourceControl:k,label:j1.Label,operationGrouping:j1.InvocationGrouping,navigationProperty:""},j,h1);}function b1(i,j,k){var h1;f.processDataLossConfirmationIfNonDraft(function(){s.oCRUDManager.callAction({functionImportPath:i.functionImportPath,contexts:i.contexts,sourceControl:i.sourceControl,label:i.label,operationGrouping:i.operationGrouping,navigationProperty:i.navigationProperty},j).then(function(i1){if(i1&&i1.length&&i1.length===1){h1=i1[0];if(h1.response&&h1.response.context&&(!h1.actionContext||h1.actionContext&&h1.response.context.getPath()!==h1.actionContext.getPath())){s.oViewDependencyHelper.setMeToDirty(o.getOwnerComponent(),k);}}});},q.noop,j,"Proceed");}function c1(i){var j=i.getSource();var k=l();var h1=n(k);var i1=h1.getModel("discard");i1.setProperty("/placement",sap.m.PlacementType.Top);var j1=o.getView().getBindingContext();var k1=j1.getObject();var l1=k1.hasOwnProperty("HasActiveEntity")&&!j1.getProperty("IsActiveEntity")&&!j1.getProperty("HasActiveEntity");i1.setProperty("/isCreateDraft",l1);h1.openBy(j);}function d1(i){var j=i.getSource();var k=j.getCustomData();var h1=r();var i1=h1.getModel("discard");var j1=k&&k[0]?k[0].getValue():sap.m.PlacementType.Top;i1.setProperty("/placement",j1);h1.openBy(j);}function e1(i,j,k){if(i.data("CrossNavigation")){J(i,i.getBindingContext(),k);return new Promise(function(l1){l1();});}var h1=f.getOwnerControl(i);var i1=h1.getTableBindingPath();var j1=o.getOwnerComponent();var k1=s.oCRUDManager.addEntry(h1).then(function(l1){if(!j){s.oNavigationController.navigateToContext(l1.newContext,l1.tableBindingPath,false,4);s.oViewDependencyHelper.setMeToDirty(j1,i1);}else{h1.rebindTable();}});k1.catch(q.noop);return k1;}function f1(i){var j=f.getOwnerControl(i.getSource());var k=f.getSelectedContexts(j);if(k&&k.length>0){var h1=z(k);var i1=y(j);var j1=i1.getModel("delete");j1.setData(h1);i1.open();}else{M.error(f.getText("ST_GENERIC_NO_ITEM_SELECTED"),{styleClass:f.getContentDensityClass()});}}function g1(i){var j;if(i.getSource().data("Location")==="Header"){j=i.getSource().getParent().getAggregation("items")[0];}else if(i.getSource().data("Location")==="Section"){j=i.getSource().getParent().getAggregation("items")[0];}else if(i.getSource().data("Location")==="SmartTable"){j=i.getSource().getParent().getAggregation("items")[0];}else{j=i.getSource().getParent().getParent().getParent().getParent().getParent().getAggregation("items")[1];}j.bindElement(i.getSource().getBindingContext().getPath());j.openBy(i.getSource());}var H=t.testable(H,"fnBuildSelectionVariantForNavigation");var E=t.testable(E,"fnEvaluateParameters");return{onBeforeRebindTable:P,onBeforeRebindTableFinally:R,onListNavigate:W,onShowDetails:X,onEditNavigateIntent:J,onSemanticObjectLinkPopoverLinkPressed:L,onDataFieldForIntentBasedNavigation:Y,onDataFieldForIntentBasedNavigationSelectedContext:$,onInlineDataFieldForIntentBasedNavigation:_,onDataFieldWithIntentBasedNavigation:Z,onSmartFieldUrlPressed:w,onBreadCrumbUrlPressed:x,onCallActionFromToolBar:a1,onDiscardDraft:c1,onDiscardSubItem:d1,addEntry:e1,deleteEntries:f1,onContactDetails:g1};}return B.extend("sap.suite.ui.generic.template.lib.CommonEventHandlers",{constructor:function(o,e,s,f){q.extend(this,d(o,e,s,f));}});});