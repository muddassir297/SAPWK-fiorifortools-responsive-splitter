sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/ui/support/supportRules/WindowCommunicationBus","sap/ui/support/supportRules/ui/models/SharedModel"],function(C,J,W,S){"use strict";return C.extend("sap.ui.support.supportRules.ui.controllers.Main",{onInit:function(){this.model=S;this.getView().setModel(this.model);this.resizeDown();this.initSettingsPopover();this.setCommunicationSubscriptions();this.hidden=false;this.updateShowButton();},initSettingsPopover:function(){this._settingsPopover=sap.ui.xmlfragment("sap.ui.support.supportRules.ui.views.AnalyzeSettings",this);this._settingsPopover.setModel(S);this.getView().addDependent(this._oPopover);},setCommunicationSubscriptions:function(){W.subscribe("analyzeFinish",function(d){this.ensureOpened();this.model.setProperty("/showProgressIndicator",false);this.model.setProperty("/coreStateChanged",false);this.model.setProperty("/lastAnalysisElapsedTime",d.elapsedTime);this.goToIssues();},this);W.subscribe("progressUpdate",function(d){var c=d.currentProgress,p=this.getView().byId("progressIndicator");p.setDisplayValue(c+"/"+100);this.model.setProperty("/progress",c);},this);W.subscribe("coreStateChanged",function(){this.model.setProperty("/coreStateChanged",true);},this);W.subscribe("postAvailableComponents",function(d){this.model.setProperty("/availableComponents",d);},this);},resizeUp:function(){W.publish("resizeFrame",{bigger:true});},ensureOpened:function(){W.publish("ensureOpened");},resizeDown:function(){W.publish("resizeFrame",{bigger:false});},onAnalyze:function(){var s=this._getSelectedRules(),e=this._getExecutionContext();W.publish("onAnalyzePressed",{selectedRules:s,executionContext:e});this.model.setProperty("/showProgressIndicator",true);this.clearProgressIndicator();},onViewReport:function(){var d=this._getReportData();W.publish("onViewReportPressed",d);},onContextSelect:function(e){if(e.getParameter("selected")){var s=e.getSource(),r=s.getCustomData()[0].getValue(),a=this.model.getProperty("/executionScopes")[r];this.model.setProperty("/analyzeContext",a);}},onBeforePopoverOpen:function(){W.publish("getAvailableComponents");},onAnalyzeSettings:function(e){W.publish("ensureOpened");this._settingsPopover.openBy(e.getSource());},onDownloadReport:function(){var d=this._getReportData();W.publish("onDownloadReportPressed",d);},onNavConAfterNavigate:function(e){var t=e.getParameter("to");if(t===this.getView().byId("analysis")){setTimeout(function(){t.getController().markLIBAsSelected();},250);}},_getReportData:function(){return{executionScopes:this.model.getProperty("/executionScopes"),executionScopeTitle:this.model.getProperty("/executionScopeTitle"),analysisDurationTitle:this.model.getProperty("/analysisDurationTitle")};},_getExecutionContext:function(){var c={type:this.model.getProperty("/analyzeContext/key")};if(c.type==="parent"){c.parentId=this.model.getProperty("/parentExecutionContextId");}if(c.type==="components"){var s=sap.ui.getCore().byId("componentsSelectionContainer"),a=s.getContent();c.components=[];a.forEach(function(b){if(b.getSelected()){c.components.push(b.getText());}});}return c;},_getSelectedRules:function(){var l=this.model.getProperty("/libraries"),s=[];l.forEach(function(a,b){a.rules.forEach(function(r){if(r.selected){s.push({libName:a.title,ruleId:r.id});}});});return s;},goToAnalysis:function(e){var n=this.getView().byId("navCon");n.to(this.getView().byId("analysis"),"show");this.ensureOpened();},goToIssues:function(){var n=this.getView().byId("navCon");n.to(this.getView().byId("issues"),"show");this.ensureOpened();},goToWiki:function(){window.open('https://uacp2.hana.ondemand.com/viewer/DRAFT/SAPUI5_Internal/57ccd7d7103640e3a187ed55e1d2c163.html','_blank');},clearProgressIndicator:function(){var p=this.getView().byId("progressIndicator");p.setDisplayValue("None");this.model.setProperty("/progress",0.1);},setRulesLabel:function(l){var s=0;if(l===null){return"Manage Rules ("+s+")";}else{l.forEach(function(a,b){s+=a.rules.length;});return"Manage Rules ("+s+")";}},updateShowButton:function(){this.getView().byId("sapSTShowButtonBar").setVisible(this.hidden);},toggleHide:function(){this.hidden=!this.hidden;this.updateShowButton();W.publish("toggleFrameHidden",this.hidden);}});});