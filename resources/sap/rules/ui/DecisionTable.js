/*!   
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	                          
 */
sap.ui.define(["jquery.sap.global","./library","sap/rules/ui/DecisionTableCell","sap/rules/ui/RuleBase","sap/rules/ui/Utils","sap/ui/table/Table","sap/ui/table/Column","sap/m/Toolbar","sap/m/Popover","sap/ui/unified/Menu","sap/m/Dialog","sap/m/Button","sap/m/ToolbarSpacer","sap/m/Text","sap/m/Input","sap/m/ObjectIdentifier","sap/m/Link","sap/m/Label","sap/m/BusyIndicator","sap/m/DisplayListItem","sap/ui/unified/MenuItem","sap/m/FlexBox","sap/m/MessageStrip","sap/rules/ui/type/DecisionTableHeader","sap/rules/ui/DecisionTableSettingsOld"],function(q,l,D,R,U,T,C,a,P,M,b,B,c,d,I,O,L,e,f,g,h,F,k,m,n){"use strict";var o={vocabulary:"vocabulary",rule:"rule",columns:"columns",rows:"rows"};var v={emptyTable:3,max:10};var p=R.extend("sap.rules.ui.DecisionTable",{metadata:{properties:{enableSettings:{type:"boolean",group:"Misc",defaultValue:false},cellFormat:{type:"sap.rules.ui.DecisionTableCellFormat",defaultValue:sap.rules.ui.DecisionTableCellFormat.Text},hitPolicies:{type:"sap.rules.ui.RuleHitPolicy[]",defaultValue:[sap.rules.ui.RuleHitPolicy.FirstMatch,sap.rules.ui.RuleHitPolicy.AllMatch]}},aggregations:{"_toolbar":{type:"sap.m.Toolbar",multiple:false,singularName:"_toolbar"},"_table":{type:"sap.ui.core.Control",multiple:false,singularName:"_table"},"_errorsText":{type:"sap.m.MessageStrip",multiple:false,singularName:"_errorsText"}}},_addErrorLabel:function(){var E=new k({showCloseButton:true,showIcon:true,type:sap.ui.core.MessageType.Error,visible:false}).addStyleClass("sapUiTinyMargin");this.setAggregation("_errorsText",E,true);},init:function(){this.multiHeaderFlag=false;this.resetContent=true;this._initInternalModel();this._initDisplayModel();this._initDataBucket();this.bindProperty("busy","dtModel>/busyState");this.oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");this._addToolBar();this._addTable();this._addErrorLabel();this._decisionTableHeaderFormatter=new m();this.setBusyIndicatorDelay(0);},setEditable:function(i){this.setProperty("editable",i,true);this._internalModel.setProperty("/editable",i);var t=this.getAggregation("_table");var j=this.getAggregation("_toolbar");if(i===false){t.addStyleClass("sapRULDecisionTableEdit");j.removeStyleClass("sapRULDecisionTableToolBar");}else{t.removeStyleClass("sapRULDecisionTableEdit");j.addStyleClass("sapRULDecisionTableToolBar");}return this;},setExpressionLanguage:function(i){this.setAssociation("expressionLanguage",i,true);this._decisionTableHeaderFormatter.setExpressionLanguage(this.getExpressionLanguage());var j=(i instanceof Object)?i:sap.ui.getCore().byId(i);if(!j){return this;}var t=this.getAggregation("_table");if(t){var r=t.getBinding("columns");if(r){r.refresh();}}if(j._isDataExist()){var E=new sap.ui.base.Event("","",{data:true});this._handleVocabularyDataChanged(E);}j.attachDataChange(this._handleVocabularyDataChanged.bind(this));return this;},setEnableSettings:function(i){this.setProperty("enableSettings",i,true);this._internalModel.setProperty("/enableSettings",i);return this;},setHitPolicies:function(i){this.setProperty("hitPolicies",i,true);this._internalModel.setProperty("/hitPolicies",i);return this;},setCellFormat:function(i){this.setProperty("cellFormat",i,true);this._internalModel.setProperty("/cellFormat",i);return this;},_initInternalModel:function(){var i={};i.editable=this.getEditable();i.newTable=true;i.busyState=true;i.busyTableState=true;i.cellFormat=this.getCellFormat();i.hitPolicies=this.getHitPolicies();i.enableSettings=this.getEnableSettings();i.isAtLeastOneRowSelected=false;i.validationStatus={};this._internalModel=new sap.ui.model.json.JSONModel(i);this.setModel(this._internalModel,"dtModel");},_initDisplayModel:function(){this._displayModel=new sap.ui.model.json.JSONModel();this.setModel(this._displayModel,"displayModel");this._settingsModel=new sap.ui.model.json.JSONModel();this.setModel(this._settingsModel,"settingModel");},_initDataBucket:function(){var i=false;var E=sap.ui.getCore().byId(this.getExpressionLanguage());if(E&&E._isDataExist()){i=true;}this.dataBucket={dataReceived:{vocabulary:i,rule:false,rows:false,columns:false},rows:{},columns:{},collectRowsMode:"replace"};},_setDataLoadedPromise:function(){if(!this._dataLoaded||this._dataLoaded.state()!=="pending"){this._dataLoaded=new q.Deferred();}},_getDataLoadedPromise:function(){if(!this._dataLoaded){this._setDataLoadedPromise();}return this._dataLoaded.promise();},setBindingContextPath:function(i){var j=this.getBindingContextPath();if(j!==i){this._unbindRule();this._unbindRows();this._unbindColumns();this.setProperty("bindingContextPath",i);this.resetContent=true;this._initDataBucket();}return this;},setModelName:function(i){this.setProperty("modelName",i);this.resetContent=true;return this;},resetControl:function(){this._unbindRule();this._unbindRows();this._unbindColumns();this._clearErrorMessages();this._initDataBucket();this._initDisplayModel();this._updateBusyState();var i=this._getModel();var j=this.getBindingContextPath();if(!j||!i){return;}var r=new sap.ui.model.Context(i,j);this.setBindingContext(r);this._bindRule();this._bindRows();this._bindColumns();},isSequenceExistsInOdataMetadata:function(){var r=this.getModel();var s=r.getServiceMetadata();var E=s.dataServices.schema[0].entityType;var t;var u;var w;for(var i=0;i<E.length;i++){t=E[i];if(t.entityType!=="RULE_SRV.DecisionTableColumn"){continue;}u=t.property;for(var j=0;j<u.length;j++){w=u[j];if(w.name==="Sequence"){return true;}}}return false;},_createNewDecisionTableSettings:function(){var i=this._getModel();var j=this.getBindingContext();var r=new sap.rules.ui.DecisionTableSettings({expressionLanguage:this.getExpressionLanguage(),hitPolicies:"{dtModel>/hitPolicies}",newDecisionTable:this._internalModel.getProperty("/newTable"),cellFormat:"{dtModel>/cellFormat}"});var s=JSON.stringify(this._settingsModel.getData());var t=JSON.parse(s);var u=new sap.ui.model.json.JSONModel(t);r.setModel(u);r.setModel(this._internalModel,"dtModel");r.setModel(i,"oDataModel");r.setBindingContext(j);return r;},_createOldDecisionTableSettings:function(){var i=this._getModel();var j=this.getBindingContext();var r=new n({expressionLanguage:this.getExpressionLanguage(),hitPolicies:"{dtModel>/hitPolicies}",newDecisionTable:this._internalModel.getProperty("/newTable")});r.setModel(i);r.setModel(this._internalModel,"dtModel");r.setBindingContext(j);return r;},_createDecisionTableSettings:function(){var i;if(this.isSequenceExistsInOdataMetadata()){i=this._createNewDecisionTableSettings();}else{i=this._createOldDecisionTableSettings();}return i;},_openTableSettings:function(){var j=this._createDecisionTableSettings();var r=new b({contentWidth:"70%",title:this.oBundle.getText("tableSettings")});r.addContent(j);var s=j.getButtons(r);for(var i=0;i<s.length;i++){r.addButton(s[i]);}r.attachBeforeClose(function(t){var u=r.getState();r.destroy();if(u===sap.ui.core.ValueState.Success){this._initDisplayModel();this._refreshBinding();}},this);r.open();},_getBindModelName:function(){var i="";var j=this.getModelName();if(j){i=j+">";}return i;},_getModel:function(){var i=this.getModelName();if(i){return this.getModel(i);}return this.getModel();},columnFactory:function(i,j){if(this.multiHeaderFlag){this.multiHeaderFlag=false;}var r=this._getBindModelName();var s=new C(i,{width:"auto",multiLabels:[this._createColIfThenHeader(j),this._createColDescriptionHeader(j)],template:this._createCell(j)});s.isConditionOrFirstResultColumn=!this.firstResultColumnBound;r=this._getBindModelName();this.firstResultColumnBound=j.getProperty(r+"Type")===sap.rules.ui.DecisionTableColumn.Result;return s;},_createColDescriptionHeader:function(i){var r=this._getBindModelName(),j=i.getProperty(r+"Type"),s=i.getProperty(r+"Id"),t=i.getProperty(r+"RuleId"),u=i.getProperty(r+"Version");var w;var H={RuleId:t,Id:s,Version:u};var x=document.getElementsByClassName("sapUiSizeCozy").length>0?3:1;var y=new d({maxLines:x}).addStyleClass("sapRULDecisionTableColumnHeaderLabel");if(j===sap.rules.ui.DecisionTableColumn.Condition){w=r+i.getModel().createKey("/DecisionTableColumnConditions",H);y.bindText({parts:[{path:w+"/Expression"},{path:w+"/FixedOperator"}],type:this._decisionTableHeaderFormatter});y.bindProperty("tooltip",{parts:[{path:w+"/Expression"},{path:w+"/FixedOperator"}],type:this._decisionTableHeaderFormatter});}else if(j===sap.rules.ui.DecisionTableColumn.Result){w=r+i.getModel().createKey("/DecisionTableColumnResults",H);y.bindText({path:w+"/DataObjectAttributeName"});y.bindProperty("tooltip",{path:w+"/DataObjectAttributeName"});}return y;},_createColIfThenHeader:function(i){var r=this._getBindModelName();var j=this.oBundle;return new e({text:{parts:[{path:r+"Type"},{path:r+"Id"}],formatter:function(t,s){if(s===1){return j.getText("conditionIfColumn");}else if(t===sap.rules.ui.DecisionTableColumn.Result&&this.getParent().isConditionOrFirstResultColumn){return j.getText("resultThenColumn");}else{return"";}}},design:"Bold"});},_createCell:function(i){var j=i.getProperty("Id");var r=i.getProperty("Type");return new D({editable:"{dtModel>/editable}",expressionLanguage:this.getExpressionLanguage(),displayModelName:"displayModel"}).data({colId:j,colType:r,table:this.getAggregation("_table")});},_updateTableCell:function(i,r,j,s){var t="null";if(r){var u=i.data("colId");var w=r.getProperty("Id");var x=r.getProperty("RuleId");var y=r.getProperty("Version");var z='';var A="DecisionTableRowCells(RuleId='"+x+"',Version='"+y+"',RowId="+w+",ColId="+u+")";var E={RuleId:x,Id:u,Version:y};t="/"+A+"/Content";switch(i.data("colType")){case"CONDITION":z="/"+r.getModel().createKey("DecisionTableColumnConditions",E);i.setHeaderValuePath(z+'/Expression');i.setFixedOperatorPath(z+'/FixedOperator');i.setValueOnlyPath(z+'/ValueOnly');break;case"RESULT":z="/"+r.getModel().createKey("DecisionTableColumnResults",E);i.setTypePath(z+'/BusinessDataType');break;default:break;}i.setValueStateTextPath("dtModel>/validationStatus/"+"RowId="+w+",ColId="+u);}i.setValuePath(t);},_bindRule:function(){var i=[this._getBindModelName(),this.getBindingContextPath()].join("");this.bindElement({path:i,parameters:{expand:"DecisionTable"}});this.getElementBinding().attachDataRequested(this._handleRuleDataRequested,this);this.getElementBinding().attachDataReceived(this._handleRuleDataReceived,this);this.getElementBinding().refresh();},_unbindRule:function(){this.unbindElement();},_bindColumns:function(){var t=this.getAggregation("_table");var i=[this._getBindModelName(),this.getBindingContextPath(),"/DecisionTable/DecisionTableColumns"].join("");t.bindColumns({path:i,parameters:{expand:"Condition,Result"},factory:this.columnFactory.bind(this)});t.getBinding("columns").attachDataRequested(this._handleColumnsDataRequested,this);t.getBinding("columns").attachDataReceived(this._handleColumnsDataReceived,this);},_unbindColumns:function(){var t=this.getAggregation("_table");t.unbindColumns();},_bindRows:function(){var t=this.getAggregation("_table");var i=[this._getBindModelName(),this.getBindingContextPath(),"/DecisionTable/DecisionTableRows"].join("");t.bindRows({path:i,parameters:{expand:"Cells"}});t.getBinding("rows").attachDataRequested(this._handleRowsDataRequested,this);t.getBinding("rows").attachDataReceived(this._handleRowsDataReceived,this);},_unbindRows:function(){var t=this.getAggregation("_table");t.unbindRows();},_refreshBinding:function(){var t=this.getAggregation("_table");var r=this.getElementBinding();if(r){r.refresh();}var i=t.getBinding("columns");if(i){i.refresh();}var j=t.getBinding("rows");if(j){j.refresh();}},_handleRuleDataRequested:function(){this._dataPartRequested(o.rule);},_handleRuleDataReceived:function(i){if(i){this._dataPartReceived(o.rule);}},_handleColumnsDataRequested:function(E){this._dataPartRequested(o.columns);},_handleColumnsDataReceived:function(E){var i=E.getParameter("data");if(!i){return;}var t=this.getAggregation("_table");if(i.results&&i.results.length>0){this._internalModel.setProperty("/newTable",false);t.setNoData(null);}else{this._internalModel.setProperty("/newTable",true);var j=this._getBlankContent();t.setNoData(j);}this.dataBucket[o.columns]=i;this._dataPartReceived(o.columns);this._handleHeaderSpan();},_handleRowsDataRequested:function(E){this._dataPartRequested(o.rows);},_handleRowsDataReceived:function(E){var i=E.getParameter("data");if(i){if(this.dataBucket.collectRowsMode==="replace"){this.dataBucket[o.rows]=i;this.dataBucket.collectRowsMode="append";}else{var j=this.dataBucket[o.rows];var r={results:(j.results)?j.results.concat(i.results):i.results};this.dataBucket[o.rows]=r;}this._dataPartReceived(o.rows);}this._setTableRows();},_handleVocabularyDataChanged:function(E){var i=E.getParameter("data");if(i){this._handleVocabularyDataReceived(i);}else{this._handleVocabularyDataRequested();}},_handleVocabularyDataRequested:function(){this._dataPartRequested(o.vocabulary);},_handleVocabularyDataReceived:function(i){if(i){this._dataPartReceived(o.vocabulary);}},_dataPartRequested:function(i){this.dataBucket.dataReceived[i]=false;this._setDataLoadedPromise();this._updateBusyState();},_dataPartReceived:function(i){this.dataBucket.dataReceived[i]=true;if(!this._isAllDataReceived()){return;}try{this._convertAndValidate();this.dataBucket.collectRowsMode="replace";}catch(E){window.console.log(E);}this._updateBusyState();this._dataLoaded.resolve();},_isAllDataReceived:function(){var i=this.dataBucket.dataReceived;return i.rule&&i.rows&&i.columns&&i.vocabulary;},_updateBusyState:function(){var i=this.dataBucket.dataReceived;var j=i.rule&&i.columns&&i.vocabulary;var r=!j;this._internalModel.setProperty("/busyState",r);var t=!i.rows;this._internalModel.setProperty("/busyTableState",t);},_decideSettingsEnablement:function(i,j){return i&&j;},_decideDeleteRowEnablement:function(i,j){return i===false&&j;},_decideAddRowEnablement:function(i){return!i;},_addToolBar:function(){var t=new a({design:"Transparent",enabled:"{dtModel>/editable}"});var i=new sap.m.Title({text:this.oBundle.getText("decisionTable")});var s=new B({text:"",press:this._openTableSettings.bind(this),visible:{parts:[{path:"dtModel>/enableSettings"},{path:"dtModel>/editable"}],formatter:this._decideSettingsEnablement},enabled:{parts:[{path:"dtModel>/enableSettings"},{path:"dtModel>/editable"}],formatter:this._decideSettingsEnablement}}).setTooltip(this.oBundle.getText("tableSettings"));s.setIcon("sap-icon://action-settings");var j=new L({text:this.oBundle.getText("deleteRow"),press:[this._deleteRowWorkaround,this],visible:"{dtModel>/editable}",enabled:{parts:[{path:"dtModel>/newTable"},{path:"dtModel>/isAtLeastOneRowSelected"}],formatter:this._decideDeleteRowEnablement}}).setTooltip(this.oBundle.getText("deleteRow"));var A=new L({text:this.oBundle.getText("addRow"),visible:"{dtModel>/editable}",enabled:{parts:[{path:"dtModel>/newTable"}],formatter:this._decideAddRowEnablement},press:function(E){this.oMenu=new M({items:this._getMenuItems()});var r=sap.ui.core.Popup.Dock;this.oMenu.open("keyup",A,r.CenterTop,r.CenterBottom,A);}.bind(this)}).setTooltip(this.oBundle.getText("addRow"));t.addContent(i);t.addContent(new c({}));t.addContent(A);t.addContent(new c({width:"1em"}));t.addContent(j);t._delete=j;t.addContent(new c({width:"1em"}));t.addContent(s);t.addContent(new c({width:"1em"}));this.setAggregation("_toolbar",t,true);},_addNewRowWorkaround:function(s,i){this._addNewRow(s,i);this._saveWorkAround();},_addNewRow:function(s,j){var r=this.oMenu;if(r){r.close();}var t=this._getModel();var u=this.dataBucket.columns&&this.dataBucket.columns.results;if(!t||!u){return;}var w=this.getAggregation("_table"),x=this.getBindingContext(),y=x.getProperty("Id"),V=x.getProperty("Version");var z={RuleId:y,Version:V};if(j){z.Id=1;}else if(s||s===0){z.Id=s+2;}t.createEntry("/DecisionTableRows",{properties:z});for(var i=0;i<u.length;i++){var A=u[i].Id;var E={RuleId:y,Version:V,RowId:z.Id,ColId:A,Content:""};t.createEntry("/DecisionTableRowCells",{properties:E});}w.setSelectedIndex(-1);this._clearErrorMessages();},_deleteRowWorkaround:function(){var i=this._getModel();if(i.hasPendingChanges()){this._saveWorkAround({success:function(){this._deleteRow();}.bind(this)});}else{this._deleteRow();}},_deleteRow:function(){var j=this._getModel();if(!j){return;}var t=this.getAggregation("_table");var s=[];if(t){s=t.getSelectedIndices();}if(s.length===0){return;}var r=s.length;for(var i=0;i<r;i++){var u=t.getContextByIndex(s[i]).getPath();j.remove(u);}t.setSelectedIndex(-1);this._clearErrorMessages();},_setTableRows:function(){var t=this.getAggregation("_table");var r=t.getBinding("rows");var V=v.emptyTable;if(r&&r.getLength()){V=Math.min(r.getLength(),v.max);}var i=t.getVisibleRowCount();if(i!==V){t.setVisibleRowCount(V);}if(this.dataBucket.rows.results.length===0||!this.getEditable()){t.setSelectionMode(sap.ui.table.SelectionMode.None);}else{t.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);}},_getMenuItems:function(){var t=this.getAggregation("_table");var s=[];if(t){s=t.getSelectedIndices();}var i=[new h({text:this.oBundle.getText("insertFirst"),enabled:true,select:this._addNewRowWorkaround.bind(this,s[0],true)}),new h({text:this.oBundle.getText("insertAfter"),enabled:s.length===1?true:false,select:this._addNewRowWorkaround.bind(this,s[0],false)})];return i;},_rowSelectionChange:function(){var t=this.getAggregation("_table");var s=[];if(t){s=t.getSelectedIndices();}if(s.length>0){this._internalModel.setProperty("/isAtLeastOneRowSelected",true);}else{this._internalModel.setProperty("/isAtLeastOneRowSelected",false);}},_getBlankContent:function(){var i=new e({text:this.oBundle.getText("start")});var s=new d();s.setText("\u00a0");var j=new L({enabled:{parts:[{path:"dtModel>/enableSettings"},{path:"dtModel>/editable"}],formatter:this._decideSettingsEnablement},text:" "+this.oBundle.getText("settings"),press:[this._openTableSettings,this]}).addStyleClass("sapRULDecisionTableLink");var r=new F({justifyContent:"Center",items:[i,s,j],visible:{parts:[{path:"dtModel>/enableSettings"},{path:"dtModel>/editable"}],formatter:this._decideSettingsEnablement}}).addStyleClass("sapUiMediumMargin");return r;},_decideSelectionMode:function(i){return i?sap.ui.table.SelectionMode.MultiToggle:sap.ui.table.SelectionMode.None;},_addTable:function(){var t=new T({visibleRowCount:v.emptyTable,visibleRowCountMode:sap.ui.table.VisibleRowCountMode.Fixed,threshold:20,selectionMode:{parts:[{path:"dtModel>/editable"}],formatter:this._decideSelectionMode},rowSelectionChange:function(){this.oParent._rowSelectionChange();},enableColumnReordering:false,busy:"{dtModel>/busyTableState}"});t._updateTableCell=this._updateTableCell;t.setBusyIndicatorDelay(0);this.setAggregation("_table",t,true);},_buildMessagesStructure:function(j,r,s){var t;var u;var x;var y;if(!j.details){return r;}for(var w=0;w<j.details.length;w++){t=j.details[w];if(!t.messages){continue;}for(var i=0;i<t.messages.length;i++){x=t.messages[i].description;u=t.messages[i].additionalInfo;if(u.type==="ruleResult"){s.push(x);y="genericError";r[y]=s;}else if(u.type==="column"){y="errorInColumnHeader";r[y]=true;}else if(u.type==="cell"){y="RowId="+u.rowId+",ColId="+u.colId;r[y]=x;}}}return r;},_concatinateHeaderErrors:function(j){var r="";for(var i=0;i<j.length;i++){r+="\n"+j[i];}return r;},_concatinateColumnsHeaderErrors:function(i){var j="";for(var r in i){if(i.hasOwnProperty(r)){if(i[r].header){j+="In Col: "+r+" - "+i[r].header+"\n";}}}return j;},_displayHeaderErrorMessages:function(i,j){var t=this.getAggregation("_errorsText");this.oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");var r=this._concatinateHeaderErrors(i);t.setText(this.oBundle.getText("errorInTableHeader")+r);t.setVisible(true);},_clearErrorMessages:function(){var t=this.getAggregation("_errorsText");t.setText("");t.setVisible(false);this._internalModel.setProperty("/validationStatus",{},null,true);},_displayErrorMessages:function(i,j){},_flatRule:function(r){var i=this._getModel();var j={};var s=function(t,u,w){var x=i.createKey(u,w);t[x]=w;};r.DecisionTable.DecisionTableColumns.results.forEach(function(t,u){if(t.Type==="CONDITION"){var w=t.Condition;if(w.parserResults&&w.parserResults.status==="Success"){w.Expression=w.parserResults.converted.Expression;w.FixedOperator=w.FixedOperator;}delete w.parserResults;s(j,"DecisionTableColumnConditions",w);}else if(t.Type==="RESULT"){var x=t.Result;s(j,"DecisionTableColumnResults",x);}});r.DecisionTable.DecisionTableRows.results.forEach(function(t){var u=t.Cells;u.results.forEach(function(w){if(w.parserResults&&w.parserResults.status==="Success"){w.Content=w.parserResults.converted.Content;}delete w.parserResults;s(j,"DecisionTableRowCells",w);});});return j;},_processValidationResults:function(i,r){if(i&&i.output){if(i.output.status==="Error"){var j=[];var s=this._internalModel.getProperty("/validationStatus");s=this._buildMessagesStructure(i,s,j);this._displayErrorMessages(j,s);this._internalModel.setProperty("/validationStatus",s,null,true);}var t=this._flatRule(i.output.decisionTableData);i.output.decisionTableData.DecisionTable.DecisionTableRows=null;this._settingsModel.setData(i.output.decisionTableData);this._displayModel.setData(t,true);}},_convertAndValidate:function(){var r=this._getRuleData();var E=sap.ui.getCore().byId(this.getExpressionLanguage());var i={};if(E&&r){i=E.convertRuleToDisplayValues(r);if(i.deferredResult){i.deferredResult.done(this._processValidationResults.bind(this));}else{this._processValidationResults(i);}}},_getRuleData:function(){var i=this.getBindingContextPath();var j=this._getModel();var r=q.extend({},true,j.getProperty(i,null,true));var s=r.DecisionTable;s.DecisionTableColumns=this.dataBucket.columns;s.DecisionTableRows=this.dataBucket.rows;return r;},onBeforeRendering:function(){if(this.resetContent){this.resetControl();this.resetContent=false;}},_handleHeaderSpan:function(){if(!this.multiHeaderFlag){var i;this.multiHeaderFlag=true;var j=this.dataBucket.columns.results;this.iNumOfCondition=0;this.iNumOfResults=0;for(i=0;i<j.length;i++){if(j[i].Type===sap.rules.ui.DecisionTableColumn.Condition){this.iNumOfCondition++;}else if(j[i].Type===sap.rules.ui.DecisionTableColumn.Result){this.iNumOfResults++;}}var t=this.getAggregation('_table');j=t.getAggregation('columns');for(i=0;i<this.iNumOfCondition;i++){j[i].setHeaderSpan([this.iNumOfCondition,1]);}for(;i<j.length;i++){j[i].setHeaderSpan([this.iNumOfResults,1]);}}},exit:function(){var i=this.oMenu;if(i){i.destroy();}}});sap.rules.ui.DecisionTable.prototype._saveWorkAround=function(i){var j=this._getModel();j.submitChanges(i);};return p;},true);