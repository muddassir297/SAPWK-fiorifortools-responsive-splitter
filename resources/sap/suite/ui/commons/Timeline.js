/*!
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */
jQuery.sap.declare("sap.suite.ui.commons.Timeline");jQuery.sap.require("sap.suite.ui.commons.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.suite.ui.commons.Timeline",{metadata:{publicMethods:["adjustUI","getCurrentFilter","getGroups","setCustomFilterMessage","setCustomGrouping","setCustomModelFilter","setCurrentFilter","setCurrentSearch","setCurrentTimeFilter","setModelFilter","setModelFilterMessage"],library:"sap.suite.ui.commons",properties:{"alignment":{type:"sap.suite.ui.commons.TimelineAlignment",group:"Misc",defaultValue:sap.suite.ui.commons.TimelineAlignment.Right},"axisOrientation":{type:"sap.suite.ui.commons.TimelineAxisOrientation",group:"Misc",defaultValue:sap.suite.ui.commons.TimelineAxisOrientation.Vertical},"data":{type:"object",group:"Misc",defaultValue:null,deprecated:true},"enableAllInFilterItem":{type:"boolean",group:"Behavior",defaultValue:true,deprecated:true},"enableBackendFilter":{type:"boolean",group:"Misc",defaultValue:true,deprecated:true},"enableBusyIndicator":{type:"boolean",group:"Misc",defaultValue:true},"enableDoubleSided":{type:"boolean",group:"Misc",defaultValue:false},"enableModelFilter":{type:"boolean",group:"Misc",defaultValue:true},"enableScroll":{type:"boolean",group:"Misc",defaultValue:true},"enableSocial":{type:"boolean",group:"Misc",defaultValue:false},"filterTitle":{type:"string",group:"Misc",defaultValue:null},"forceGrowing":{type:"boolean",group:"Misc",defaultValue:false},"group":{type:"boolean",group:"Misc",defaultValue:false,deprecated:true},"groupBy":{type:"string",group:"Misc",defaultValue:null},"groupByType":{type:"sap.suite.ui.commons.TimelineGroupType",group:"Misc",defaultValue:sap.suite.ui.commons.TimelineGroupType.None},"growing":{type:"boolean",group:"Misc",defaultValue:true,deprecated:true},"growingThreshold":{type:"int",group:"Misc",defaultValue:5},"height":{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:''},"lazyLoading":{type:"boolean",group:"Dimension",defaultValue:false},"noDataText":{type:"string",group:"Misc",defaultValue:null},"scrollingFadeout":{type:"sap.suite.ui.commons.TimelineScrollingFadeout",group:"Misc",defaultValue:sap.suite.ui.commons.TimelineScrollingFadeout.None},"showFilterBar":{type:"boolean",group:"Misc",defaultValue:true,deprecated:true},"showHeaderBar":{type:"boolean",group:"Misc",defaultValue:true},"showIcons":{type:"boolean",group:"Misc",defaultValue:true},"showSearch":{type:"boolean",group:"Misc",defaultValue:true},"showSuggestion":{type:"boolean",group:"Behavior",defaultValue:true,deprecated:true},"showTimeFilter":{type:"boolean",group:"Misc",defaultValue:true},"sort":{type:"boolean",group:"Misc",defaultValue:true},"sortOldestFirst":{type:"boolean",group:"Misc",defaultValue:false},"textHeight":{type:"string",group:"Misc",defaultValue:''},"width":{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:'100%'}},aggregations:{"content":{type:"sap.suite.ui.commons.TimelineItem",multiple:true,singularName:"content"},"customFilter":{type:"sap.ui.core.Control",multiple:false},"filterList":{type:"sap.suite.ui.commons.TimelineFilterListItem",multiple:true,singularName:"filterList"},"suggestionItems":{type:"sap.m.StandardListItem",multiple:true,singularName:"suggestionItem",deprecated:true}},events:{"addPost":{deprecated:true,parameters:{"value":{type:"string"}}},"customMessageClosed":{},"filterOpen":{},"filterSelectionChange":{parameters:{"type":{type:"sap.suite.ui.commons.TimelineFilterType"},"searchTerm":{type:"string"},"selectedItem":{type:"string"},"selectedItems":{type:"object"},"timeKeys":{type:"object"},"clear":{type:"boolean"}}},"grow":{},"itemFiltering":{parameters:{"item":{type:"sap.suite.ui.commons.TimelineItem"},"reasons":{type:"object"},"dataKeys":{type:"object"},"timeKeys":{type:"object"},"searchTerm":{type:"string"}}},"select":{parameters:{"selectedItem":{type:"sap.suite.ui.commons.TimelineItem"}}},"suggest":{deprecated:true,parameters:{"suggestValue":{type:"string"}}},"suggestionItemSelected":{deprecated:true,parameters:{"selectedItem":{type:"sap.ui.core.Item"}}}}}});sap.suite.ui.commons.Timeline.M_EVENTS={'addPost':'addPost','customMessageClosed':'customMessageClosed','filterOpen':'filterOpen','filterSelectionChange':'filterSelectionChange','grow':'grow','itemFiltering':'itemFiltering','select':'select','suggest':'suggest','suggestionItemSelected':'suggestionItemSelected'};sap.ui.define(["jquery.sap.global","sap/ui/core/ResizeHandler","sap/ui/core/format/DateFormat","sap/ui/model/odata/ODataListBinding","sap/ui/model/ClientListBinding","sap/ui/model/FilterType","sap/ui/Device","sap/suite/ui/commons/TimelineAxisOrientation","sap/suite/ui/commons/TimelineFilterType","sap/suite/ui/commons/TimelineNavigator","sap/suite/ui/commons/TimelineGroupType","sap/suite/ui/commons/util/DateUtils","sap/suite/ui/commons/util/ManagedObjectRegister","sap/ui/model/json/JSONModel","sap/ui/model/Sorter","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/base/ManagedObject","sap/suite/ui/commons/TimelineItem","sap/ui/core/Item","sap/suite/ui/commons/TimelineAlignment","sap/m/MessageToast","sap/suite/ui/commons/TimelineScrollingFadeout","sap/suite/ui/commons/TimelineRenderManager"],function($,R,D,O,C,F,c,T,d,e,f,g,M,J,S,h,j,l,m,I,n,o,p,q){"use strict";var r=sap.suite.ui.commons.Timeline,s=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons"),t=Object.freeze({ASCENDING:"ASCENDING",DESCENDING:"DESCENDING"}),u=Object.freeze({UP:"UP",DOWN:"DOWN",NONE:"NONE"}),v={Year:D.getDateInstance({pattern:"YYYY"}),Quarter:D.getDateInstance({pattern:"QQQQ YYYY"}),Month:D.getDateInstance({pattern:"MMMM YYYY"}),Week:D.getDateInstance({pattern:"w"}),Day:D.getDateInstance({style:"long"}),MonthDay:D.getDateInstance({style:"medium"})};function w(a,b){var i;if(typeof a.findIndex==="function"){return a.findIndex(b);}for(i=0;i<a.length;i++){if(b(a[i],i,a)){return i;}}return-1;}r.prototype.init=function(){this._aFilterList=[];this._collapsedGroups={};this._objects=new M();this._renderDblSided=null;this._groupId=0;this._lastScrollPosition={x:0,y:0,more:0};this._scrollersSet=false;this._currentFilterKeys=[];this._customFilter=false;this._initControls();this.setBusyIndicatorDelay(0);};r.prototype.setCustomModelFilter=function(a,b){var B=this.getBinding("content");if(B){var i=B.aFilters||[];var k=w(i,function(b){return b._customTimelineId===a;});if(k!==-1){i.splice(k,1);}if(b!=null){b._customTimelineId=a;i.push(b);}B.filter(i,F.Control);}};r.prototype.setCustomGrouping=function(G){var b=this.getBindingInfo("content");this._fnCustomGroupBy=G;if(b){this._bindGroupingAndSorting(b);this.updateAggregation("content");}};r.prototype.setCurrentTimeFilter=function(a){this._startDate=a.from;this._endDate=a.to;this._rangeFilterType=a.type;};r.prototype.setCurrentSearch=function(a){this._objects.getSearchField().setText(a);};r.prototype.setCurrentFilter=function(a){var b=this,H=function(V){for(var i=0;i<a.length;i++){if(a[i]===V){return true;}}return false;};if(!a){return;}if(!Array.isArray(a)){a=[a];}if(this._aFilterList.length===0){this._setFilterList();}b._currentFilterKeys=[];this._aFilterList.forEach(function(i){var k=i.key;if(H(k)){b._currentFilterKeys.push({key:k,text:i.text?i.text:i.key});}});};r.prototype.getGroups=function(){return this._useBinding()?this.getContent().filter(function(i){return i._isGroupHeader;}):this._aGroups;};r.prototype.exit=function(){this._objects.destroyAll();if(this.oItemNavigation){this.removeDelegate(this.oItemNavigation);this.oItemNavigation.destroy();this.oItemNavigation=null;}if(this._oScroller){this._oScroller.destroy();this._oScroller=null;}if(this.oResizeListener){R.deregister(this.oResizeListener);this.oResizeListener=null;}};r.prototype.adjustUI=function(){this._performUiChanges();};r.prototype.setModelFilterMessage=function(a,b){if(a===d.Data){this._dataMessage=b;}if(a===d.Time){this._rangeMessage=b;}};r.prototype.setCustomFilterMessage=function(a){this._customFilterMessage=a;};r.prototype.setModelFilter=function(a){switch(a.type){case d.Data:this._dataFilter=a.filter;break;case d.Time:this._rangeFilter=a.filter;break;case d.Search:this._searchFilter=a.filter;break;}if(a.refresh!==false){this.recreateFilter();}};r.prototype._formatGroupBy=function(a,b){if(this._fnCustomGroupBy){return this._fnCustomGroupBy(a);}var k=a,i=a;if(a instanceof Date){switch(b){case f.Year:k=a.getFullYear();i=v.Year.format(a);break;case f.Quarter:k=a.getFullYear()+"/"+Math.floor(a.getMonth()/4);i=v.Quarter.format(a);break;case f.Month:k=a.getFullYear()+"/"+a.getMonth();i=v.Month.format(a);break;case f.Week:var x=new Date(a),y=new Date(a),z=a.getFullYear(),A=v.Week.format(a),k=z+"/"+A,B=a.getDate()-a.getDay(),E=B+6,G=new Date(x.setDate(B)),H=new Date(y.setDate(E));i=v.MonthDay.format(G)+" \u2013 "+v.MonthDay.format(H);break;case f.Day:k=a.getFullYear()+"/"+a.getMonth()+"/"+a.getDate();i=v.Day.format(a);break;}}return{key:k,title:i,date:a};};r.prototype._fnDateDiff=function(a,b,i){var k,y,x,z;b=b||this._minDate;i=i||this._maxDate;switch(a){case f.Year:return i.getFullYear()-b.getFullYear();case f.Month:k=(i.getFullYear()-b.getFullYear())*12;k+=i.getMonth()-b.getMonth();return k<=0?0:k;case f.Quarter:y=(i.getFullYear()-b.getFullYear())*4;x=Math.floor(b.getMonth()/3);z=Math.floor(i.getMonth()/3);return y+(z-x);case f.Day:var A=24*60*60*1000;return Math.round(Math.abs((b.getTime()-i.getTime())/(A)));}};r.prototype._fnAddDate=function(V,a){var N,b,i,k=function(H,y,z){this.setHours(H);this.setMinutes(y);this.setSeconds(z);},x=function(y,b,i){if(a===u.UP){k.call(i,23,59,59);return new Date(Math.min.apply(null,[this._maxDate,i]));}if(a===u.DOWN){k.call(b,0,0,0);return new Date(Math.max.apply(null,[this._minDate,b]));}return y;};switch(this._rangeFilterType){case f.Year:N=new Date(new Date(this._minDate).setFullYear(this._minDate.getFullYear()+V));b=new Date(N.getFullYear(),0,1);i=new Date(N.getFullYear(),11,31);break;case f.Month:N=new Date(new Date(this._minDate).setMonth(this._minDate.getMonth()+V));b=new Date(N.getFullYear(),N.getMonth(),1);i=new Date(N.getFullYear(),N.getMonth()+1,0);break;case f.Quarter:N=new Date(new Date(this._minDate).setMonth(this._minDate.getMonth()+(V*3)));var Q=N.getMonth()%3;b=new Date(N.getFullYear(),N.getMonth()-Q,1);i=new Date(N.getFullYear(),N.getMonth()+(2-Q)+1,0);break;case f.Day:N=b=i=new Date(new Date(this._minDate).setDate(this._minDate.getDate()+V));}return x.call(this,N,b,i);};r.prototype._calculateRangeTypeFilter=function(){var a=this._fnDateDiff(f.Day);if(a>500){return f.Year;}else if(a>200){return f.Quarter;}else if(a>62){return f.Month;}return f.Day;};r.prototype._setRangeFilter=function(){var a=this._fnDateDiff(this._rangeFilterType);this._objects.getTimeRangeSlider().setMin(0);this._objects.getTimeRangeSlider().setMax(a);this._objects.getTimeRangeSlider().setRange([0,a]);this._objects.getTimeRangeSlider().invalidate();};r.prototype._sortClick=function(){var b,P;this._sortOrder=this._sortOrder===t.ASCENDING?t.DESCENDING:t.ASCENDING;this._objects.getSortIcon().setIcon(this._sortOrder===t.ASCENDING?"sap-icon://arrow-bottom":"sap-icon://arrow-top");if(this._useModelFilter()){b=this.getBinding("content");P=this._findBindingPath("dateTime");b.sort(this._getDefaultSorter(P,this._sortOrder===t.ASCENDING));}else{this.invalidate();}};r.prototype._sort=function(a,b){var i=b||this._sortOrder;a.sort(function(k,x){var y=k.getDateTime(),z=x.getDateTime(),A=(i===t.ASCENDING)?-1:1;return y<z?1*A:-1*A;});return a;};r.prototype._loadMore=function(){var b,a,i=function(){var k=this._displayShowMore()?this.getGrowingThreshold():this._calculateItemCountToLoad(this.$());this._iItemCount+=k;this._iItemCount=Math.min(this._getMaxItemsCount(),this._iItemCount);}.bind(this);this._lastScrollPosition.more=this._isVertical()?this._$content.get(0).scrollTop:this._$content.get(0).scrollLeft;this._setBusy(true);this.fireGrow();if(this._useBinding()){if(this._isMaxed()){this._setBusy(false);return;}i();b=this.getBindingInfo("content");b.startIndex=0;if(!this._loadAllData()){b.length=this._iItemCount;}a=this.getBinding("content").getContexts(0,b.length);if(a&&a.dataRequested){return;}this.updateAggregation("content");}else{i();this.invalidate();}};r.prototype.recreateFilter=function(b){var B=this.getBinding("content"),a=this,i=[],k=[];if(B){if(!b){i=B.aFilters||[];}if(this._dataFilter){k.push(this._dataFilter);}if(this._rangeDataFilter){k.push(this._rangeDataFilter);}if(this._searchFilter){k.push(this._searchFilter);}if(this._filter&&!b){var x=w(i,function(y){return y===a._filter;});if(x!==-1){i.splice(x,1);}}if(k.length>0){this._filter=new h(k,true);i.push(this._filter);}B.filter(i,F.Control);}else{this.invalidate();}};r.prototype._getRangeMessage=function(){var a=this._rangeMessage;if(!a){var b=this._formatGroupBy(this._startDate,this._rangeFilterType).title,i=this._formatGroupBy(this._endDate,this._rangeFilterType).title;a=s.getText("TIMELINE_RANGE_SELECTION")+" (";a+=b+" - "+i+")";}return a;};r.prototype._getFilterMessage=function(){var a="";if(this._dataMessage){a=this._dataMessage;}else{if(this._currentFilterKeys.length>0){a=this._currentFilterKeys.map(function(i){return i.text?i.text:i.key;}).join(", ");a=this._getFilterTitle()+" ("+a+")";}}if(this._rangeDataFilter||this._rangeMessage||(this._startDate&&this._endDate)){a=a?a+", ":"";a+=this._getRangeMessage();}if(this._customFilterMessage){a=a?a+", "+this._customFilterMessage:this._customFilterMessage;}if(a){return s.getText("TIMELINE_FILTER_INFO_BY",a);}};r.prototype.refreshContent=function(a){var b=this.getBinding("content"),B=this.getBindingInfo("content");this._setBusy(true);if(b&&B){b.getContexts(0,B.length);b.attachEventOnce("dataReceived",$.proxy(function(){this.updateAggregation("content");},this));}else{this.updateAggregation("content");}};r.prototype.updateContent=function(a){this._setBusy(false);this.updateAggregation("content");this.invalidate();};r.prototype.destroyContent=function(){var b=this.getBinding("content"),a=b&&b.bPendingRequest,i=this.$("line"),k=this.$().find(".sapSuiteUiCommonsTimelineItemGetMoreButton");if(i.get(0)){i.remove();}if(k.get(0)){k.remove();}this.destroyAggregation("content");};r.prototype._search=function(a){var b=this,E,i,k,U,x=[];this._searchValue=a;if(this._useModelFilter()){E=this._fireSelectionChange({searchTerm:this._searchValue,type:d.Search});if(E){this._searchFilter=null;if(this._searchValue){i=this._findBindingPaths("text");k=this._findBindingPaths("title");U=this._findBindingPaths("userName");if(i.length>0){x.push(i);}if(k.length>0){x.push(k);}if(U){x.push(U);}if(x.length>0){this._searchFilter=new h(x.map(function(y){return new h(y.map(function(z){return new h(z,j.Contains,b._searchValue);}),false);}));}}this.recreateFilter();}}else{this.invalidate();}};r.prototype._filterData=function(b){var E,P;this._dataMessage="";if(this._useModelFilter()){this._dataFilter=null;E=this._fireSelectionChange({selectedItem:this._currentFilterKeys[0]?this._currentFilterKeys[0].key:"",selectedItems:this._currentFilterKeys,type:d.Data});if(E){if(this._currentFilterKeys.length>0){P=this._findBindingPath("filterValue");if(P){this._dataFilter=new h(this._currentFilterKeys.map(function(i){return new h(P,j.EQ,i.key);}),false);}}}this._rangeDataFilter=null;if(b){E=this._fireSelectionChange({type:d.Time,timeKeys:{from:this._startDate,to:this._endDate,}});if(E){P=this._findBindingPath("dateTime");if(P){this._rangeDataFilter=new h({path:P,operator:j.BT,value1:this._startDate,value2:this._endDate});}}}this._setBusy(true);this.recreateFilter();}else{this.invalidate();}};r.prototype._filterRangeData=function(){var E,P;this._rangeMessage="";if(this._useModelFilter()){E=this._fireSelectionChange({from:this._startDate,to:this._endDate,type:d.Time});if(E){P=this._findBindingPath("dateTime");this._rangeDataFilter=null;if(P){this._rangeDataFilter=new h({path:P,operator:j.BT,value1:this._startDate,value2:this._endDate});}this._setBusy(true);this.recreateFilter();}}else{this.invalidate();}};r.prototype.applySettings=function(a,b){l.prototype.applySettings.apply(this,[a,b]);this._settingsApplied=true;if(this._bindOptions){this.bindAggregation("content",this._bindOptions);this._bindOptions=null;}};r.prototype._setFilterList=function(){var k=false,x,y,K,z,A={},B,E;this._aFilterList=[];if(this._useModelFilter()){this._aFilterList=this.getFilterList().map(function(a){return{key:a.getProperty("key"),text:a.getProperty("text")}});if(this._aFilterList.length===0){E=this._findBindingData("filterValue");B=this.getBinding("content");if(E&&B){x=B.getDistinctValues(E.path);if(Array.isArray(x)){this._aFilterList=x.map(function(a){return{key:a,text:E.formatter?E.formatter(a):a}});this._aFilterList=this._aFilterList.filter(function(a){return a.key;});}k=true;}}}else{y=this.getContent();k=true;for(var i=0;i<y.length;i++){K=y[i].getFilterValue();if(!K){continue;}if(!(K in A)){A[K]=1;this._aFilterList.push({key:K,text:K});}}}if(k){this._aFilterList.sort(function(a,b){if(a.text.toLowerCase){return a.text.toLowerCase().localeCompare(b.text.toLowerCase());}else{return a.text>b.text;}});}};r.prototype._clearFilter=function(){var a=function(){var E,x=this._objects.getTimeRangeSlider();this._startDate=null;this._endDate=null;this._rangeMessage=null;x.setRange([x.getMin(),x.getMax()]);if(this._useModelFilter()){E=this._fireSelectionChange({clear:true,timeKeys:{from:null,to:null},type:d.Range});}return E;}.bind(this),b=function(){var E;this._currentFilterKeys=[];if(this._useModelFilter()){E=this._fireSelectionChange({clear:true,selectedItems:[],selectedItem:"",type:d.Data});}return E;}.bind(this);var i=b(),k=a();this._customFilterMessage="";if(i||k){if(i){this._dataFilter=null;}if(k){this._rangeDataFilter=null;}this.recreateFilter(true);}else{this.invalidate();}};r.prototype._getTimeFilterData=function(){var a=this,b,k,x,y,z=function(i,N){return A(i,a[N]).then(function(E){if(E){var H=g.parseDate(E);if(H instanceof Date){a[N]=H;}}}).catch(function(){});},G=function(i){var E,H,K,L;E=this.getModel();if(!E){return Promise.reject();}H=this._findBindingPath("dateTime");K=new S(H,i);L=this.getBindingInfo("content");if(!L){return Promise.reject();}var N=E.bindList(L.path,null,K,null);if(typeof N.initialize==="function"){N.initialize();}if(N instanceof C){if(N.getLength()===0){return Promise.resolve(null);}return Promise.resolve(g.parseDate(N.oList[N.aIndices[0]][H]));}else if(N&&N.attachDataReceived){a._setBusy(true);return new Promise(function(P,Q){N.attachDataReceived(function(U){a._setBusy(false);if(typeof U==="undefined"){Q();return;}var V=U.getParameter("data");P(g.parseDate(V.results[0][H]));});N.loadData(0,1);});}return Promise.reject();}.bind(this),A=function(i,y){if(y){return Promise.resolve(y);}return G(i==="max");},B=function(){b=this.getContent();if(b.length>0){this._minDate=b[0].getDateTime();this._maxDate=b[0].getDateTime();for(var i=1;i<b.length;i++){y=b[i].getDateTime();if(y<this._minDate){this._minDate=y;}if(y>this._maxDate){this._maxDate=y;}}}};return new Promise(function(i,E){if(!a._maxDate||!a._minDate){if(a._useModelFilter()){k=z("min","_minDate",k);x=z("max","_maxDate",x);Promise.all([k,x]).then(function(){i();}).catch(function(){E();});}else{B.call(a);i();}}else{i();}});};r.prototype._openFilterDialog=function(){if(this._customFilter){this.getCustomFilter().openBy(this._objects.getFilterIcon());this.fireFilterOpen();return;}if(!this.getShowTimeFilter()){this._objects.getFilterContent().removeAggregation("filterItems",1);}this._objects.getFilterContent().open();this.fireFilterOpen();};r.prototype._createGroupHeader=function(a,b){var i=this.getId()+"-timelinegroupheader-"+this._groupId,k=a.key,G=new m(i,{text:"GroupHeader",dateTime:a.date,userName:k,title:a.title,icon:"sap-icon://arrow-down"});G._isGroupHeader=true;if(b){G.setParent(this,"content");this._aGroups.push(G);}else{this.addAggregation("content",G,false);}this._groupId++;return G;};r.prototype._getDefaultSorter=function(P,a){var b=this;return new S(P,!a,function(i){var V=i.getProperty(P),k=g.parseDate(V);return k instanceof Date?b._formatGroupBy(k,b.getGroupByType()):{date:k};});};r.prototype._findBindingInfoFromTemplate=function(P,a){if(!a){var b=this.getBindingInfo("content");if(b){a=b.template;}}if(a){var i=a.getBindingInfo(P);if(i&&i.parts&&i.parts[0]){return i;}}return null;};r.prototype._findBindingPaths=function(P,a){var i=this._findBindingInfoFromTemplate(P,a);if(i&&i.parts){return i.parts.map(function(b){return b.path;});}return[];};r.prototype._findBindingPath=function(P,a){var i=this._findBindingInfoFromTemplate(P,a);if(i){return i.parts[0].path;}return null;};r.prototype._findBindingData=function(P,a){var i=this._findBindingInfoFromTemplate(P,a);if(i){return{path:i.parts[0].path,formatter:i.formatter}}return null;};r.prototype._bindGroupingAndSorting=function(b){if(!this._isGrouped()&&this.getSort()){var a=this._findBindingPath("dateTime",b.template);if(a){b.sorter=this._getDefaultSorter(a,this.getSortOldestFirst());}}b.groupHeaderFactory=null;if(this._isGrouped()){b.sorter=this._getDefaultSorter(this.getGroupBy(),this.getSortOldestFirst());b.groupHeaderFactory=jQuery.proxy(this._createGroupHeader,this);}};r.prototype.bindAggregation=function(N,a){if(N==="content"){if(!this._settingsApplied){this._bindOptions=a;return;}this._bindGroupingAndSorting(a);if(this._lazyLoading()){this._iItemCount=this._calculateItemCountToLoad($(window));if(!this._loadAllData(true)){a.length=this._iItemCount;}}else if(this._displayShowMore()&&!this._loadAllData(a.template)){this._iItemCount=this.getGrowingThreshold();a.length=this._iItemCount;}this._oOptions=a;}return l.prototype.bindAggregation.apply(this,[N,a]);};r.prototype._calculateItemCountToLoad=function(a){var i=T.Vertical===this.getAxisOrientation(),b=i?a.height():a.width(),k=this.getEnableDoubleSided(),x=k?0.6:1,y=i?1200:2000,z=i?120:280,A=(13*x),B;if(!b){b=y;}B=(b/(z*x))*1.5;return Math.floor(Math.max(B,A));};r.prototype._setItemVisibility=function(){if(!this.getShowHeaderBar()){this._objects.getHeaderBar().setVisible(false);}if(!this.getShowSearch()){this._objects.getSearchField().setVisible(false);}this._objects.getSortIcon().setVisible(this.getSort());};r.prototype.onBeforeRendering=function(){var G=this.getGrowingThreshold(),a;this._bRtlMode=sap.ui.getCore().getConfiguration().getRTL();this._setItemVisibility();this._objects.getSortIcon().setIcon(this._sortOrder===t.ASCENDING?"sap-icon://arrow-bottom":"sap-icon://arrow-top");this._aGroups=[];a=this.getContent();if(!this._iItemCount&&!this._useBinding()&&this._lazyLoading()){this._iItemCount=this._calculateItemCountToLoad($(window));}if(!this._iItemCount){if(G!=0){this._iItemCount=G;}}if(!this._iItemCount||!this._useGrowing()){this._iItemCount=a.filter(function(i){return!i._isGroupHeader;}).length;}this._setOutput(a);};r.prototype.addContentGroup=function(a){};r.prototype._performScroll=function(a){var b=this,i=this._isVertical()?this._$content.get(0).scrollTop+a:this._$content.get(0).scrollLeft+a;if(i>0){this._isVertical()?this._$content.get(0).scrollTop=i:this._$content.get(0).scrollLeft=i;}if(this._manualScrolling){setTimeout(b._performScroll.bind(b,a),50);}};r.prototype._moveScrollBar=function(U){if(this._lastScrollPosition.more||this._lastScrollPosition.backup){if(U){this._lastScrollPosition.more=this._lastScrollPosition.backup;}this._isVertical()?this._oScroller.scrollTo(0,this._lastScrollPosition.more):this._oScroller.scrollTo(this._lastScrollPosition.more,0);if(!U){this._lastScrollPosition.backup=this._lastScrollPosition.more;}this._lastScrollPosition.more=0;}};r.prototype.onAfterRendering=function(){var a=this.$();if(this._isVertical()){this._$content=this.$("content");this._$scroll=this.$("scroll");}else{this._$content=this.$("contentH");this._$scroll=this.$("scrollH");}this.setBusy(false);if(!this._oScroller){this._oScroller=new sap.ui.core.delegate.ScrollEnablement(this,this._$scroll.attr('id'),{});}this._oScroller._$Container=this._$scroll.parent();this._oScroller.setVertical(this._isVertical());this._oScroller.setHorizontal(!this._isVertical());this._startItemNavigation();this._scrollersSet=false;this._scrollMoreEvent=true;this._lastStateDblSided=null;this._showCustomMessage();this._setupScrollEvent();this._performUiChanges();this._moveScrollBar();a.css("opacity",1);};r.prototype._clientFilter=function(a){var b=[],k,x,y,z,A,B,E,G,U,H;for(var i=0;i<a.length;i++){k=a[i];x=false;y={};if(this._currentFilterKeys.length>0){z=w(this._currentFilterKeys,function(K){return K.key===k.getProperty("filterValue");});if(z===-1){x=true;y[d.Data]=1;}}if(this._startDate&&this._endDate){var A=k.getDateTime();if(A<this._startDate||A>this._endDate){x=true;y[d.Time]=1;}}if(this._searchValue){B=this._searchValue.toLowerCase();E=k.getProperty("text")||"";G=k.getProperty("title")||"";U=k.getProperty("userName")||"";if(!((E.toLowerCase().indexOf(B)!=-1)||(G.toLowerCase().indexOf(B)!=-1)||(U.toLowerCase().indexOf(B)!=-1))){x=true;y[d.Search]=1;}}H=!this.fireEvent("itemFiltering",{item:k,reasons:y,dataKeys:this._currentFilterKeys,timeKeys:{from:this._startDate,to:this._endDate},searchTerm:this._searchValue},true);if(H){x=!x;}if(!x){b.push(k);}}return b;};r.prototype._setOutput=function(a){var b=function(){var N=0,L=[],i=0,P=0;if(this._iItemCount!=E.length){for(;i<E.length;i++){if(!E[i]._isGroupHeader){N++}if(N>this._iItemCount){break;}L.push(E[i]);}E=L;}},A=function(){var L=[],N,P,Q={key:""};for(var i=0;i<E.length;i++){N=E[i];P=this._formatGroupBy(N.getDateTime(),this.getGroupByType());if(P.key!=Q.key){L.push(this._createGroupHeader(P,true));Q=P;}L.push(N);}return L;},G=function(){var L;if(!this._maxDate&&!this._minDate){if(this.getSort()||this._isGrouped()){for(var i=0;i<a.length;i++){L=a[i];if(!L._isGroupHeader){this._sortOrder===t.ASCENDING?this._minDate=L.getDateTime():this._maxDate=L.getDateTime();break;}}}}},x,y,z,B;G.call(this);if((!this._useBinding()||!this._useModelFilter())&&this.getSort()){a=this._sort(a);}var E=this._useModelFilter()?a:this._clientFilter(a);E=E.filter(function(K){return!K._isGroupHeader;});this._showMore=false;if(this._displayShowMore()){this._showMore=E.length>this._iItemCount;if(!this._showMore&&this._useModelFilter()){this._showMore=E.length===this._iItemCount&&this._iItemCount<this._getMaxItemsCount()}}E=E.filter(function(K){return K.getVisible();});b.call(this);this._outputItem=[];if(this._isGrouped()){if(!this._useBinding()){a=A.call(this);}var H=a.filter(function(L){return L._isGroupHeader;});this._groupCount=H.length;for(var i=0;i<H.length;i++){x=H[i];z=x.getUserName();B=true;x._groupID=z;for(var k=0;k<E.length;k++){var K=E[k];y=this._formatGroupBy(K.getDateTime(),this.getGroupByType());if(y.key==z&&!K._isGroupHeader){if(B){this._outputItem.push(x);B=false;}K._groupID=z;this._outputItem.push(K);}}}}else{this._outputItem=$.extend(true,[],E);}};r.prototype._getMaxItemsCount=function(){var b=this.getBinding("content"),L=this.getContent().length;if(b){return b.getLength()||0;}return L;};r.prototype._showCustomMessage=function(){var b=!!this._customMessage,i=this._objects.getMessageStrip(),a=this._objects.getMessageStrip().$();this._objects.getMessageStrip().setVisible(b);this._objects.getMessageStrip().setText(this._customMessage);b?a.show():a.hide();};r.prototype._performExpandCollapse=function(G,b){var a,N,k,x,y=this.$(),z=y.find('li[groupid="'+G+'"]');for(var i=0;i<z.length;i++){a=jQuery(z[i]);N=a.attr('nodeType');x=N==="GroupHeader";k=N==="GroupHeaderBar";if(!x){if(k){if(!b){a.addClass("sapSuiteUiCommonsTimelineItemGroupCollapsedBar")}else{a.removeClass("sapSuiteUiCommonsTimelineItemGroupCollapsedBar");}}else{if(a.is(':hidden')){a.show();}else{a.hide();}}}}this._performUiChanges();};r.prototype._startItemNavigation=function(E){var i=this._getItemsForNavigation();if(!this.oItemNavigation){this.oItemNavigation=new e(this.$()[0],i.items,false,i.rows);this.oItemNavigation.setPageSize(10);this.addDelegate(this.oItemNavigation);}else{this.oItemNavigation.updateReferences(this.$()[0],i.items,i.rows);}if(i.columns){this.oItemNavigation.setColumns(i.columns,false);}};r.prototype._getItemsForNavigation=function(){var i={},a,b,B,k,x;if(this.getEnableDoubleSided()){if(this._isVertical()){i.items=this._outputItem;i.rows=[];k=[];i.items.forEach(function(y){var z=y.$(),A=z.hasClass("sapSuiteUiCommonsTimelineItemWrapperVLeft")||z.hasClass("sapSuiteUiCommonsTimelineItemOdd");if(A&&k.length==1){k.push(null);}else if(!A&&k.length==0){k.push(null);}if(k.length>1){i.rows.push(k);k=[];}k.push(y);});if(k.length>0){i.rows.push(k);}}else{b=[];B=[];this._outputItem.forEach(function(y){if(y._placementLine==="top"){b.push(y);}else{while(B.length+1<b.length){B.push(null);}B.push(y);}});i.items=this._outputItem;i.rows=[b,B];}}else{i.items=this._outputItem;}i.items=i.items.map(function(y){return y.getFocusDomRef();});if(i.rows){x=0;i.rows=i.rows.map(function(y){if(y.length>x){x=y.length;}return y.map(function(z){return z===null?null:z.getFocusDomRef();});});i.rows.forEach(function(y){while(y.length<x){y.push(null);}});}a=this.$("showMoreWrapper");if(a.length>0){i.items.push(a[0]);if(i.rows){i.rows.push(i.rows[0].map(function(){return a;}));}}return i;};r.prototype._getFilterTitle=function(){var V=this.getFilterTitle();if(!V){V=s.getText("TIMELINE_FILTER_ITEMS");}return V;};r.prototype.getNoDataText=function(){var a=this.getProperty("noDataText");if(!a){a=s.getText('TIMELINE_NO_DATA');}return a;};r.prototype.setSortOldestFirst=function(b){this._sortOrder=b?t.ASCENDING:t.DESCENDING;this._objects.getSortIcon().setIcon(this._sortOrder===t.ASCENDING?"sap-icon://arrow-bottom":"sap-icon://arrow-top");this.setProperty("sortOldestFirst",b);};r.prototype.setGrowingThreshold=function(a){this.setProperty("growingThreshold",a,true);this._iItemCount=a;};r.prototype.setShowHeaderBar=function(a){this.setProperty("showHeaderBar",a,true);this._objects.getHeaderBar().setVisible(a);};r.prototype.setSort=function(b){this.setProperty("sort",b);};r.prototype.setAxisOrientation=function(a){this.setProperty("axisOrientation",a);if(this._oScroller){this._oScroller.destroy();this._oScroller=null;}};r.prototype.setEnableDoubleSided=function(E){this.setProperty("enableDoubleSided",E);this._renderDblSided=E;};r.prototype.getCurrentFilter=function(){var a=this._currentFilterKeys.map(function(i){return{key:i.key,text:i.text||i.key};});return a;};r.prototype.setShowFilterBar=function(a){this.setProperty("showFilterBar",a);this._objects.getHeaderBar().setVisible(a);};r.prototype.setShowSearch=function(a){this.setProperty("showSearch",a);this._objects.getSearchField().setVisible(!!a);};r.prototype.setCustomMessage=function(a){this._customMessage=a;this._showCustomMessage();};r.prototype.getHeaderBar=function(){return this._objects.getHeaderBar();};r.prototype.getMessageStrip=function(){return this._objects.getMessageStrip();};r.prototype.setContent=function(a){this.removeAllContent();var b=0;for(var i=0;i<a.length;i++){var k=a[i];if(k instanceof m){if(this._isGrouped()){var G=this._formatGroupBy(k.getDateTime(),this.getGroupByType());if(G.key!==b.key){this._createGroupHeader(G);b=G;}}this.addContent(k);}}this._iItemCount=0;};r.prototype.setData=function(a){var b="sapsuiteuicommonsTimelineInternalModel",i=new J(),P,B,k=function(y,z){var A=new m({dateTime:z.getProperty("dateTime"),icon:z.getProperty("icon"),userName:z.getProperty("userName"),title:z.getProperty("title"),text:z.getProperty("text"),filterValue:z.getProperty("filterValue")});if(z.getProperty("content")){A.setEmbeddedControl(z.getProperty("content"));}return A;},x=function(P,y){var z=P;if(y){z=y+">"+P;}return z;};if(a==undefined){return;}P=x("/",b);i.setData(a);this.setModel(i,b);this.setProperty("data",a,true);B={path:P,sorter:this._getDefaultSorter('dateTime',this.getSortOldestFirst()),factory:jQuery.proxy(k,this)};if(this._isGrouped()){B.groupHeaderFactory=jQuery.proxy(this._getGroupHeader,this);}this.bindAggregation("content",B);return this;};r.prototype.setCustomFilter=function(a){if(a){this._customFilter=true;this.setAggregation("customFilter",a,true);}else{this._customFilter=false;}};r.prototype.getSuspendSocialFeature=function(){return this._suspenseSocial;};r.prototype.setSuspendSocialFeature=function(b){this._suspenseSocial=b;if(!this.getEnableSocial()){return;}var a=this.getContent();for(var i=0;i<a.length;i++){a[i]._replyLink.setEnabled(!b);}this.invalidate();};r.prototype.updateFilterList=function(){this.updateAggregation("filterList");this._setFilterList();};r.prototype.setGroupByType=function(a){var b=this.getBindingInfo("content");this.setProperty("groupByType",a);if(b){this._bindGroupingAndSorting(b);this.updateAggregation("content");}};r.prototype.getGroup=function(){return this.getGroupByType()!=="None";};r.prototype.setGroup=function(G){if(G&&this.getGroupByType()===f.None){this.setGroupByType(f.Year);}if(!G){this.setGroupByType(f.None);}};r.prototype.setGrowing=function(G){if(!G){this.setGrowingThreshold(0);}};r.prototype.getGrowing=function(G){return this.getGrowingThreshold()!==0;};r.prototype.setEnableBackendFilter=function(b){this.setProperty("enableModelFilter",b);};r.prototype.getEnableBackendFilter=function(){return this.getProperty("enableModelFilter");};r.prototype._isGrouped=function(){return(this.getGroupByType()!==f.None||this._fnCustomGroupBy)&&(this.getGroupBy()!=="");};r.prototype._lazyLoading=function(){return this.getEnableScroll()&&this.getLazyLoading();};r.prototype._loadAllData=function(a){return!this._useModelFilter(a);};r.prototype._isVertical=function(){return T.Vertical===this.getAxisOrientation();};r.prototype._displayShowMore=function(){return this.getForceGrowing()||(this.getGrowingThreshold()!==0&&!this._lazyLoading());};r.prototype._useGrowing=function(){return this.getForceGrowing()||this.getGrowingThreshold()!==0||this._lazyLoading();};r.prototype._isMaxed=function(){return this._iItemCount>=this._getMaxItemsCount();};r.prototype._useModelFilter=function(a){return this.getEnableModelFilter()&&(a||this._useTemplateBinding());};r.prototype._scrollingFadeout=function(a){return this.getScrollingFadeout()!==p.None&&this.getEnableScroll();};r.prototype._setBusy=function(b){if(this.getEnableBusyIndicator()){this.setBusy(b);}};r.prototype._fireSelectionChange=function(P){return this.fireEvent("filterSelectionChange",P,true);};r.prototype._isLeftAlignment=function(){return this.getAlignment()===n.Left||this.getAlignment()===n.Top;};r.prototype._useBinding=function(b){return this.getBindingInfo("content")!=null;};r.prototype._useTemplateBinding=function(){var a=this.getBindingInfo("content");return a&&a.template!=null;};r.prototype._getItemsCount=function(){return this._outputItem?this._outputItem.length:0;};q.extendTimeline(r);return r;});
