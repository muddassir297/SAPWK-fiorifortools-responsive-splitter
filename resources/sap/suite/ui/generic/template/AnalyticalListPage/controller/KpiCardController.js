sap.ui.define(["jquery.sap.global","sap/ui/core/Fragment","sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/ui/thirdparty/d3","sap/suite/ui/generic/template/AnalyticalListPage/util/KpiUtil"],function(q,F,C,J,D,K){"use strict";q.sap.require("sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter");var c=C.extend("sap.suite.ui.generic.template.AnalyticalListPage.controller.KpiCardController",{onInit:function(e){this.busyDelegate={onBeforeRendering:function(){this.setBusy(true);}};this.freeDelegate={onAfterRendering:function(){this.setBusy(false);}};},onExit:function(){},_updateTitle:function(t,s,u,I){var l=this.byId(I);l.setBusy(true);var f=K.getNumberFormatter(true,s,2);var a=f.oLocaleData.getDecimalFormat("short",s,"other");var S="";if(a){for(var i=0;i<a.length;i++){if(a[i]!="0"){S+=a[i];}}}if(u===undefined||u==="%"){u="";}var b=this.getView().getModel("i18n");if(!b){return"";}var r=b.getResourceBundle();if(S){l.setText(r.getText("KPI_CARD_TITLE_SF",[t,S]));}else{l.setText(r.getText("KPI_CARD_TITLE",[t]));}l.setBusy(false);},onBeforeRendering:function(){var v=this._getVizFrameContainer();if(!v){q.sap.log.error("no kpi card VIZ container"+": ("+this.getView().getId()+")");}else{v.addEventDelegate(this.busyDelegate,v);var s=this.getView().data("qualifierSettings");var d=this.getView().data("dataPointMeasure");var o=this.getView().data("chart");var e=this.getView().data("entityTypeProperty");var u=K.getUnitofMeasure(s.model,e);var S="";var t=K.getPathOrPrimitiveValue(o.Title);if(d&&d.ValueFormat&&d.ValueFormat.ScaleFactor){S=K.getPathOrPrimitiveValue(d.ValueFormat.ScaleFactor);}this._updateTitle(t,S,u,"kpiChartHeaderTitle");sap.suite.ui.generic.template.AnalyticalListPage.util.KpiVizAnnotationHelper.formatChartAxes(S);sap.suite.ui.generic.template.AnalyticalListPage.util.KpiVizAnnotationHelper.setupChartAttributes(v,s);var b=v.getDataset().getBinding("data");if(b.getPath()){b.attachDataReceived(q.proxy(this.onDataReceived,this));}else{}}},onAfterRendering:function(){},onDataReceived:function(e){var v=this._getVizFrameContainer();v.addEventDelegate(this.freeDelegate,v);},_getVizFrameContainer:function(){var m=this;if(!m._oChart){m._oChart=m.getView().byId("kpiCardChartVizFrame");}return m._oChart;},setActual:function(a){var m=this;m.getView().byId("kpiCardActual").setValue(a);},handleNavigationPress:function(e){var E=e.getSource();var n=sap.ushell.Container.getService("CrossApplicationNavigation");n.toExternal({target:{semanticObject:E.data("target"),action:e.getSource().data("action")},params:JSON.parse(E.data("parameters"))});}});return c;});
