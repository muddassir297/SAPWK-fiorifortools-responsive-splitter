(function(g){"use strict";jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchModel');sap.ushell.renderers.fiori2.search.SearchModel.extend("sap.ushell.renderers.fiori2.search.SearchFacetDialogModel",{constructor:function(){var t=this;sap.ushell.renderers.fiori2.search.SearchModel.prototype.constructor.apply(t,[]);t.aAllowedAccessUsage=["AutoFacet"];t.facetQuery=t.sina.createPerspectiveQuery({templateFactsheet:true});t.chartQuery=t.sina.createChartQuery();t.aFilters=[];},prepareFacetList:function(){var t=this;var m=t.getDataSource().getMetaDataSync();t.setProperty('/facetDialog',t.oFacetFormatter.getDialogFacetsFromMetaData(m,t));},facetDialogSingleCall:function(p){var t=this;t.chartQuery.setDataSource(t.getDataSource());t.chartQuery.setSkip(0);t.chartQuery.setTop(1);t.chartQuery.dimensions=[];t.chartQuery.addDimension(p.sAttribute);t.chartQuery.setAttributeLimit(p.sAttributeLimit);if(t.getProperty("/fuzzy")){t.chartQuery.addOption(g.sinabase.QueryOptions.FUZZY);}else{t.chartQuery.removeOption(g.sinabase.QueryOptions.FUZZY);}if(p.bValueHelpMode){t.chartQuery.addOption(g.sinabase.QueryOptions.VALUEHELP);}else{t.chartQuery.removeOption(g.sinabase.QueryOptions.VALUEHELP);}return t.chartQuery.getResultSet().then(function(r){var f=t.oFacetFormatter.getDialogFacetsFromChartQuery(r,t,p.bInitialFilters);var F=jQuery.extend(true,{},f);f.items4pie=F.items;var a=0,b=0,c=0,d=0;for(var i=0;i<f.items4pie.length;i++){if(i<9){f.items4pie[i].pieReady=true;if(f.items4pie[i].value>0){a+=f.items4pie[i].value;}}else{f.items4pie[i].pieReady=false;if(f.items4pie[i].value>0){b+=f.items4pie[i].value;}}}c=b*100/(a+b);c=Math.ceil(c);d=a/9;d=Math.floor(d);if(c>0){var n=f.items4pie[0].clone([true,true]);n.value=d;n.label=sap.ushell.resources.i18n.getText("facetPieChartOverflowText2",[c,9]);n.pieReady=true;n.valueLabel=""+d;n.isPieChartDummy=true;f.items4pie.push(n);}for(var j=0;j<f.items4pie.length;j++){f.items4pie[j].percentageMissingInBigPie=c;}t.setProperty(p.sBindingPath+"/items4pie",f.items4pie);t.setProperty(p.sBindingPath+"/items",f.items);});},resetFacetQueryFilterConditions:function(){var t=this;t.facetQuery.resetFilterConditions();},resetChartQueryFilterConditions:function(){var t=this;t.chartQuery.resetFilterConditions();},hasFilterCondition:function(f){var t=this;for(var i=0;i<t.aFilters.length;i++){if(t.aFilters[i].filterCondition.equals&&t.aFilters[i].filterCondition.equals(f)){return true;}}return false;},hasFilter:function(i){var t=this;var f=i.filterCondition;return t.hasFilterCondition(f);},addFilter:function(i){var t=this;if(!t.hasFilter(i)){t.aFilters.push(i);}},removeFilter:function(a){var t=this;var f=a.filterCondition;for(var i=0;i<t.aFilters.length;i++){if(t.aFilters[i].filterCondition.equals&&t.aFilters[i].filterCondition.equals(f)){t.aFilters.splice(i,1);return;}}},changeFilterAdvaced:function(a,A){var t=this;var f=a.filterCondition;for(var i=0;i<t.aFilters.length;i++){if(t.aFilters[i].filterCondition.equals&&t.aFilters[i].filterCondition.equals(f)){t.aFilters[i].advanced=A;return;}}},getAttributeDataType:function(d){switch(d){case"Double":return"number";case"Timestamp":return"date";case"String":return"string";case"Text":return"text";default:return"string";}}});})(window);