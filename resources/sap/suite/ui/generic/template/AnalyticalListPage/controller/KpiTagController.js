sap.ui.define(["sap/suite/ui/generic/template/AnalyticalListPage/controller/KpiCardController","sap/ui/model/json/JSONModel","sap/ui/model/json/JSONModel","sap/ui/core/mvc/ViewType","sap/m/Popover"],function(K,J,F,V,P){"use strict";return{_kpiCards:[],init:function(s){var m=this;m.oState=s;m.oGenericModel=new J();var g={header:"Some Header",title:"Some Title",titleUrl:"",icon:"sap-icon://camera"};m.oGenericModel.setData(g);},openKpiCard:function(e){var m=this;var s;if(typeof e.currentTarget!="undefined"){s=sap.ui.getCore().byId(e.currentTarget.id);}else{s=e.getSource();}m.createPopover(function(){var m=this;m._openCard(s);}.bind(m,s),s);},_openCard:function(s){var m=this;jQuery.sap.delayedCall(0,this,function(){m._kpiCards[s.getQualifier()].openBy(s);});},handleKpiPress:function(e){this.openKpiCard(e);},createPopover:function(o,s){var m=this;var q=s.getQualifier();var c=m.oState.oController.getOwnerComponent();var S=c.getComponentContainer().getSettings();var Q=S.keyPerformanceIndicators[q];var a=S.appComponent.getManifestEntry("/sap.app/crossNavigation/outbounds/"+Q.detailNavigation);var M=c.getModel(Q.model);M.getMetaModel().loaded().then(function(){var m=this;m._oCardController=new K();var c=m.oState.oController.getOwnerComponent();var p=new J();var Q=arguments[0];var M=c.getModel(Q.model);var b=M.getMetaModel();var e=b.getODataEntitySet(Q.entitySet);var E=b.getODataEntityType(e.entityType);var d=E["com.sap.vocabularies.UI.v1.DataPoint#"+q];var f=b.getODataProperty(E,d.Value.Path);var D;var C=E["com.sap.vocabularies.UI.v1.Chart#"+q];if(C.MeasureAttributes[0]&&C.MeasureAttributes[0].DataPoint){D=E[(C.MeasureAttributes[0].DataPoint.AnnotationPath).toString().substring(1)];}Q.metaModel=b;p.setData(Q);var v=sap.ui.view({async:false,preprocessors:{xml:{bindingContexts:{entityType:b.createBindingContext(b.getODataEntityType(e.entityType,true)),entitySet:b.createBindingContext(b.getODataEntitySet(Q.entitySet,true))},models:{entitySet:b,entityType:b,parameter:p},dataModel:M,settings:p,preprocessorsData:c.getComponentData().preprocessorsData}},type:V.XML,viewName:"sap.suite.ui.generic.template.AnalyticalListPage.view.KpiCardSizeM",height:"100%"});v.data({"qualifierSettings":Q,"dataPoint":d,"dataPointMeasure":D,"chart":C,"entityTypeProperty":f});v.setModel(c.getModel(Q.model));var g=new sap.ui.model.json.JSONModel();var h={"visible":Q.detailNavigation?true:false};if(Q.detailNavigation&&a){h.target=a.semanticObject;h.action=a.action;h.parameters=JSON.stringify(a.parameters?a.parameters:{});}else{h.visible=false;}g.setData(h);v.setModel(g,"detailNavigation");if(typeof m._kpiCards[q]!="undefined"){m._kpiCards[q].destroy();}m._kpiCards[q]=new P();m._kpiCards[q].setShowHeader(false);m._kpiCards[q].addContent(v);m._oKpiCardController=v.getController();m.oState.oController.getView().addDependent(m._kpiCards[q]);o();}.bind(this,Q));},onExit:function(){if(this._oKpiCard){this._oKpiCard.destroy();}},_setModel:function(m){this._oKpiCard.setModel(m);}};});