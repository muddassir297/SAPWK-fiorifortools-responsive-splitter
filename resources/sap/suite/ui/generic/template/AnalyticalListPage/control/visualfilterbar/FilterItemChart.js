sap.ui.define(["sap/viz/ui5/controls/VizFrame","sap/viz/ui5/format/ChartFormatter","sap/viz/ui5/api/env/Format","sap/suite/ui/generic/template/AnalyticalListPage/control/visualfilterbar/FilterItem","sap/ui/model/Sorter"],function(V,C,F,a,S){"use strict";var b=a.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.visualfilterbar.FilterItemChart",{metadata:{aggregations:{control:{type:"sap.viz.ui5.controls.VizFrame",multiple:false}}},renderer:function(r,c){r.renderControl(c.getAggregation("control"));if(c._multiUnit){var o=c.getIsCurrency()?c.getModel("i18n").getResourceBundle().getText("MULTIPLE_CURRENCY_OVERLAY_MESSAGE"):c.getModel("i18n").getResourceBundle().getText("MULTIPLE_UNIT_OVERLAY_MESSAGE");r.write('<div class = "sapUiOverlay alpVFOverflow"');r.addStyle("width",c._chart.getWidth());r.addStyle("height",String(parseFloat(c.getHeight())-0.25)+"rem");r.writeStyles();r.write('>');r.write('<Label>'+o+'</Label>');r.write('</div>');}}});b.prototype._formattingId="__UI5__ShortIntegerMaxFraction2";b.prototype._maxFractionalDigits=1;b.prototype._maxFractionalDigitsValsLessThanZero=7;b.prototype._minFractionalDigits=1;b.prototype._shortRefNumber=undefined;b.prototype._thousandsRefNumber=undefined;b.prototype._isTriggeredBySync=false;b.prototype._multiUnit=false;b.prototype.init=function(){this._registerChartFormatters();this._attachChartEvents();};b._getSorter=function(s){var c=[],d=[],e=[];for(var i=0;i<s.length;i++){c[i]=s[i].Field.String;d[i]=s[i].Descending.Boolean;e.push(new S(c[i],d[i]));}var o={sorter:e,sortFields:c};return o;};b.prototype._getNumberFormatter=function(s,m){var f=sap.ui.core.format.NumberFormat.getIntegerInstance({style:"short",minFractionDigits:this._minFractionalDigits,maxFractionDigits:m,showScale:s,shortRefNumber:this._shortRefNumber});return f;};b.prototype._registerChartFormatters=function(){var c=C.getInstance();var m=this;c.registerCustomFormatter(this._formattingId,function(v){var d=m._maxFractionalDigits;var s=Math.abs(v)/m._thousandsRefNumber;if(m._thousandsRefNumber!=undefined&&s<1){var i=0;for(;i<m._maxFractionalDigitsValsLessThanZero&&s<1;i++)s*=10;d=i;}var f=m._getNumberFormatter(false,d);return f.format(v);});F.numericFormatter(c);};b.prototype._attachChartEvents=function(){if(this._chart.onAfterRendering){var o=this._chart.onAfterRendering;var m=this;this._chart.onAfterRendering=function(){m._registerChartFormatters();o.apply(this,arguments);m._applyDimensionFilter();m._chart.setBusy(false);};}this._chart.attachSelectData(this._onChartSelectData,this);this._chart.attachDeselectData(this._onChartDeselectData,this);};b.prototype.setWidth=function(w){this.setProperty("width",w);this._chart.setWidth(w);};b.prototype.setHeight=function(h){this.setProperty("height",h);this._chart.setHeight(h);};b.prototype.setEntitySet=function(e){this.setProperty("entitySet",e);this._updateBinding();};b.prototype.setDimensionField=function(d){this.setProperty("dimensionField",d);this._updateBinding();};b.prototype.setDimensionFieldIsDateTime=function(d){this._isDateTimeChanged=this.getDimensionFieldIsDateTime()!=d;this.setProperty("dimensionFieldIsDateTime",d);this._updateBinding();this._isDateTimeChanged=false;};b.prototype.setDimensionFieldDisplay=function(d){this.setProperty("dimensionFieldDisplay",d);this._updateBinding();};b.prototype.setMeasureField=function(m){this.setProperty("measureField",m);this._updateBinding();};b.prototype.setMeasureSortDescending=function(m){this.setProperty("measureSortDescending",m);this._updateBinding();};b.prototype.setUnitField=function(u){this.setProperty("unitField",u);this._updateBinding();};b.prototype.setSortOrder=function(s){this.setProperty("sortOrder",s);this._updateBinding();};b.prototype.setDimensionFilterExternal=function(f,i){this.setProperty("dimensionFilterExternal",f);if(!this._isTriggeredBySync){this._isTriggeredBySync=(i!=undefined&&i);}this._updateBinding();};b.prototype._onChartSelectData=function(e){var d=this.getDimensionFilter(),c=e.getParameter("data");if(this._ignoreNextSelectionChange){this._ignoreNextSelectionChange=false;return;}var f=this.getDimensionFieldDisplay();var g=this.getFilterRestriction();var d=this.getDimensionFilter();if(!d||g=="single"){d=[];}var h=function(k){return k.dimValue===this;};for(var i=0;i<c.length;i++){var j=c[i].data;var v=d.filter(h,j[f]);if(v.length===0){d.push({dimValue:j[f],dimValueDisplay:j[f+".d"]});}}this.setProperty("dimensionFilter",d);this.fireFilterChange({filterList:d,property:this.getParentProperty(),filterRestriction:g});};b.prototype._onChartDeselectData=function(e){if(this._ignoreNextSelectionChange){this._ignoreNextSelectionChange=false;return;}var d=this.getDimensionFieldDisplay();var v=[];var c=e.getParameter("data");for(var i=0;i<c.length;i++){var f=c[i].data;v.push({dimValue:f[d],dimValueDisplay:f[d+".d"]});}var g=this.getDimensionFilter();if(!g)g=[];for(var i=0;i<v.length;i++){var h=v[i].dimValue;for(var j=0;j<g.length;j++){if(h==g[j].dimValue)g.splice(j,1);}}this.setProperty("dimensionFilter",g);this.fireFilterChange({filterList:g,property:this.getParentProperty(),filterRestriction:this.getFilterRestriction(),removeGlobalFilter:this.getOutParameter(),removeGlobalFilterValue:f[d]});};b.prototype.getP13NConfig=function(){var p=["width","height","filterRestriction","sortOrder","scaleFactor","entitySet","dimensionField","dimensionFieldDisplay","dimensionFieldIsDateTime","dimensionFilter","measureField","measureSortDescending","unitField","isCurrency","isMandatory","outParameter","inParameters","parentProperty"];var c={};for(var i=0;i<p.length;i++){var n=p[i];c[n]=this.getProperty(n);if((n=='outParameter'||n=='inParameters')&&c[n]==""){c[n]=undefined;}}return c;};b.prototype.setDimensionFilter=function(d){this.setProperty("dimensionFilter",d);this._applyDimensionFilter();};b.prototype._applyDimensionFilter=function(){var p=[];var d=this.getDimensionFilter();if(d){this._ignoreNextSelectionChange=this._ignoreNextSelectionChange||d.length>0;var c=this.getDimensionFieldDisplay();for(var i=0;i<d.length;i++){var e={};e[c]=d[i].dimValue;p.push({data:e});}}this._chart.vizSelection(p,{});var f=this._chart.vizSelection();if(this._ignoreNextSelectionChange===true&&(f&&f.length===0)&&d.length>0){this._ignoreNextSelectionChange=false;}};b.prototype._onDataReceived=function(e){var d=e.getParameter("data");if(!d||!d.results)return;if(this.getControl().getVizType()!="donut"){this._determineUnit(d.results);var m=this.getMeasureField();var c=null;var f=null;for(var i=0;i<d.results.length;i++){var v=Math.abs(parseFloat(d.results[i][m]));c=i==0?v:Math.min(c,v);f=i==0?v:Math.max(f,v);}if(!c)c=0;if(!f)f=0;this._applyMinMaxValue(c,f);}};b.prototype._determineUnit=function(d){var u=this.getUnitField();if(u){var p="";this._multiUnit=false;for(var i=0;i<d.length;i++){if(d[i]["__IS_OTHER__"]!==true){var c=d[i][u];}if(!c||(p&&c!=p)){if(d.length>1){this._multiUnit=true;}break;}p=c;}var t=this.getModel("_templPriv");var e=t.getProperty("/alp/visualFilter/"+this.getParentProperty());if(!e){e={hasMultiUnit:this._multiUnit};}else{e.hasMultiUnit=this._multiUnit;}t.setProperty("/alp/visualFilter/"+this.getParentProperty(),e);this._applyUnitValue(this._multiUnit?"":p);}else{this._applyUnitValue("");}};b.prototype._applyUnitValue=function(v){if(this._lastUnitValue!=v){this._lastUnitValue=v;this.fireTitleChange();}};b.prototype._applyMinMaxValue=function(m,c){if(this._lastMinValue!=m||this._lastMaxValue!=c){this._lastMinValue=m;this._lastMaxValue=c;this._scaleValue="";this._shortRefNumber=undefined;var d=Math.max(Math.abs(m),Math.abs(c));if(d){var s=this.getScaleFactor()?this.getScaleFactor():this._getScaleFactor(d);this._shortRefNumber=s;this._determineThousandsRefNumber(s);var f=this._getNumberFormatter(true,this.maxFractionalDigits);var e=f.oLocaleData.getDecimalFormat("short",s,"other");if(e){for(var i=0;i<e.length;i++){if(e[i]!="0")this._scaleValue+=e[i];}}}this.fireTitleChange();}};b.prototype._determineThousandsRefNumber=function(s){var c=s;if(s>=1000){var t=0;while(c>=1000){c/=1000;t++;}this._thousandsRefNumber=t==0?undefined:t*1000;}else{this._thousandsRefNumber=undefined;}};b.prototype._getScaleFactor=function(v){var v=parseFloat(v);var p=this._minFractionalDigits;for(var i=0;i<14;i++){var s=Math.pow(10,i);if(Math.round(Math.abs(v)/s,p-1)<10)return s;}return undefined;};b.prototype.rerender=function(){if(this._multiUnit){var o=this.getIsCurrency()?this.getModel("i18n").getResourceBundle().getText("MULTIPLE_CURRENCY_OVERLAY_MESSAGE"):this.getModel("i18n").getResourceBundle().getText("MULTIPLE_UNIT_OVERLAY_MESSAGE");var $=jQuery("<Label>").text(o);var c=jQuery("<div></div>").addClass("sapUiOverlay alpVFOverflow").css({"height":String(parseFloat(this._chart.getHeight())-0.25)+"rem","width":this._chart.getWidth()});this._chart.$().append(c.append($));}};b.prototype.getTitle=function(){var m=this.getModel();if(!m)return"";var c="/"+this.getEntitySet()+"/";var d=m.getData(c+this.getMeasureField()+"/#@sap:label");if(d===undefined){d=this.getMeasureField();}var e=m.getData(c+this.getDimensionField()+"/#@sap:label");if(e===undefined){e=this.getDimensionField();}var u=this._lastUnitValue?this._lastUnitValue:"";var s=this._scaleValue?this._scaleValue:"";var i=this.getModel("i18n");if(!i)return"";var r=i.getResourceBundle();var t="";if(s&&u)t=r.getText("VIS_FILTER_TITLE_MD_UNIT_CURR",[d,e,s,u]);else if(u)t=r.getText("VIS_FILTER_TITLE_MD_UNIT",[d,e,u]);else if(s)t=r.getText("VIS_FILTER_TITLE_MD_UNIT",[d,e,s]);else t=r.getText("VIS_FILTER_TITLE_MD",[d,e]);return t;};return b;},true);
