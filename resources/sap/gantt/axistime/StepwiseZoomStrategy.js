sap.ui.define(["./AxisTimeStrategyBase","sap/gantt/misc/Format"],function(A,F){"use strict";var r=sap.ui.getCore().getLibraryResourceBundle("sap.gantt");sap.gantt.axistime.StepwiseTimeLineOptions={"FiveMinutes":{text:r.getText("SWZS_FIVE_MINUTES"),innerInterval:{unit:sap.gantt.config.TimeUnit.minute,span:5,range:32},largeInterval:{unit:sap.gantt.config.TimeUnit.hour,span:1,pattern:"ha / MMMM dd, yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.minute,span:5,pattern:"mm"}},"FifteenMinutes":{text:r.getText("SWZS_FIFTEEN_MINUTES"),innerInterval:{unit:sap.gantt.config.TimeUnit.minute,span:15,range:48},largeInterval:{unit:sap.gantt.config.TimeUnit.hour,span:1,pattern:"ha / MMMM dd, yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.minute,span:15,pattern:"mm"}},"Hour":{text:r.getText("SWZS_HOUR"),innerInterval:{unit:sap.gantt.config.TimeUnit.hour,span:1,range:48},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,pattern:"MMMM dd, yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.hour,span:1,pattern:"HH:mm"}},"SixHours":{text:r.getText("SWZS_SIX_HOURS"),innerInterval:{unit:sap.gantt.config.TimeUnit.hour,span:6,range:64},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,pattern:"MMMM dd, yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.hour,span:6,pattern:"HH:mm"}},"DayDate":{text:r.getText("SWZS_DATE_1"),innerInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,range:64},largeInterval:{unit:sap.gantt.config.TimeUnit.week,span:1,pattern:"MMM yyyy, 'Week' ww"},smallInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,pattern:sap.ui.getCore().getConfiguration().getRTL()?"d EEE":"EEE d"}},"Date":{text:r.getText("SWZS_DATE_2"),innerInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,range:32},largeInterval:{unit:sap.gantt.config.TimeUnit.week,span:1,pattern:"MMM yyyy, 'Week' ww"},smallInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,pattern:"d"}},"CWWeek":{text:r.getText("SWZS_WEEK_1"),innerInterval:{unit:sap.gantt.config.TimeUnit.week,span:1,range:56},largeInterval:{unit:sap.gantt.config.TimeUnit.month,span:1,pattern:"MMM yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.week,span:1,pattern:sap.ui.getCore().getConfiguration().getRTL()?"'CW' ww":"'CW' ww"}},"WeekOfYear":{text:r.getText("SWZS_WEEK_2"),innerInterval:{unit:sap.gantt.config.TimeUnit.week,span:1,range:32},largeInterval:{unit:sap.gantt.config.TimeUnit.month,span:1,pattern:"MMM yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.week,span:1,pattern:"ww"}},"Month":{text:r.getText("SWZS_MONTH"),innerInterval:{unit:sap.gantt.config.TimeUnit.month,span:1,range:48},largeInterval:{unit:sap.gantt.config.TimeUnit.quarter,span:1,pattern:"yyyy QQQ"},smallInterval:{unit:sap.gantt.config.TimeUnit.month,span:1,pattern:"MMM"}},"Quarter":{text:r.getText("SWZS_QUARTER"),innerInterval:{unit:sap.gantt.config.TimeUnit.month,span:3,range:48},largeInterval:{unit:sap.gantt.config.TimeUnit.year,span:1,pattern:"yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.month,span:3,pattern:"QQQ"}},"Year":{text:r.getText("SWZS_YEAR"),innerInterval:{unit:sap.gantt.config.TimeUnit.year,span:1,range:48},largeInterval:{unit:sap.gantt.config.TimeUnit.year,span:5,pattern:"yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.year,span:1,pattern:"yyyy"}}};var S=sap.gantt.axistime.StepwiseTimeLineOptions;var a=A.extend("sap.gantt.axistime.StepwiseZoomStrategy",{metadata:{library:"sap.gantt"}});a.prototype.init=function(){var t=S.DayDate;this.setProperty("timeLineOption",t,true);this.setProperty("timeLineOptions",S,true);this.setProperty("zoomLevel",this._getIndexOfTimeLineOption(t,S),true);this.setProperty("mouseWheelZoomType",sap.gantt.MouseWheelZoomType.None,true);this.setProperty("finestTimeLineOption",null,true);this.setProperty("coarsestTimeLineOption",null,true);this.setProperty("zoomLevels",0,true);this._oTotalHorizonBeforeExtension=null;};a.prototype.applySettings=function(){A.prototype.applySettings.apply(this,arguments);this._updateZoomRateArray();return this;};a.prototype.setVisibleHorizon=function(v){A.prototype.setVisibleHorizon.apply(this,arguments);this.fireRedrawRequest(true,"visibleHorizonUpdated");return this;};a.prototype.setTotalHorizon=function(t){A.prototype.setTotalHorizon.apply(this,arguments);var o=this.getAxisTime();if(o){o.setTimeRange([F.getTimeStampFormatter().parse(t.getStartTime()),F.getTimeStampFormatter().parse(t.getEndTime())]);var h=F.getTimeStampFormatter().parse(t.getStartTime());var H=F.getTimeStampFormatter().parse(t.getEndTime());var n=H.valueOf()-h.valueOf();var T=this.getTimeLineOption();var b=jQuery.sap.getObject(T.innerInterval.unit).offset(h,T.innerInterval.span).valueOf()-h.valueOf();o.setViewRange([0,Math.ceil((n*T.innerInterval.range/b)/this._aZoomRate[this.getZoomLevel()])]);}return this;};a.prototype.setZoomLevels=function(z){return this;};a.prototype.setZoomLevel=function(z){if(z>=0&&z!==this.getZoomLevel()){this.setProperty("zoomLevel",z,true);if(this._aZoomRate[z]){var o=this.getAxisTime();if(o){o.setZoomRate(this._aZoomRate[z]);}var t=this.getTotalHorizon();if(this._oTotalHorizonBeforeExtension){if(this._oTotalHorizonBeforeExtension.getStartTime()!==t.getStartTime()||this._oTotalHorizonBeforeExtension.getEndTime()!==t.getEndTime()){this.setTotalHorizon(new sap.gantt.config.TimeHorizon({startTime:this._oTotalHorizonBeforeExtension.getStartTime(),endTime:this._oTotalHorizonBeforeExtension.getEndTime()}));}}var w=this._getWidthOfTotalHorizon();if(w<this._nGanttVisibleWidth){this._extendTotalHorizon(this._nGanttVisibleWidth);}var v=this.getVisibleHorizon();var m=this.calMiddleDate(F.getTimeStampFormatter().parse(v.getStartTime()),F.getTimeStampFormatter().parse(v.getEndTime()));var n=this.calVisibleHorizonByRate(this._aZoomRate[z],m);this.setVisibleHorizon(n);}}return this;};a.prototype.setCoarsestTimeLineOption=function(t){return this;};a.prototype.setFinestTimeLineOption=function(t){return this;};a.prototype.setTimeLineOptions=function(t){A.prototype.setTimeLineOptions.apply(this,arguments);this._updateZoomRateArray();return this;};a.prototype.syncContext=function(n){this.updateGanttVisibleWidth(n);var R={zoomLevelChanged:true,axisTimeChanged:true};return R;};a.prototype._updateZoomRateArray=function(){if(this._oZoom){var t=this.getTimeLineOptions();if(t){var i=0;this._aZoomRate=[];for(var j in t){this._aZoomRate[i]=this._oZoom.base.scale/this.calZoomScale(t[j].innerInterval.unit,t[j].innerInterval.span,t[j].innerInterval.range);i++;}}else{this._aZoomRate[0]=1;}}};a.prototype.updateStopInfo=function(s){this.setProperty("timeLineOption",this.getTimeLineOptions()[s.selectedItem.getKey()],true);this.setZoomLevel(s.index);return this;};a.prototype._getIndexOfTimeLineOption=function(t,T){var I=-1,o=T;if(!o){o=this.getTimeLineOptions();}for(var i in o){I++;if(t==o[i]){return I;}}return-1;};a.prototype._getTimeLineOptionByIndex=function(I){var t=this.getTimeLineOptions();var c=0;for(var i in t){if(c===I){return t[i];}c++;}return null;};a.prototype._getWidthOfTotalHorizon=function(){var t=this.getTotalHorizon();var s=F.getTimeStampFormatter().parse(t.getStartTime());var e=F.getTimeStampFormatter().parse(t.getEndTime());var o=this.getAxisTime();var b=o.timeToView(s);var c=o.timeToView(e);return Math.abs(c-b);};a.prototype._extendTotalHorizon=function(n){var t=this.getTotalHorizon();var v=this.getVisibleHorizon();if(!this._oTotalHorizonBeforeExtension){this._oTotalHorizonBeforeExtension=new sap.gantt.config.TimeHorizon({startTime:t.getStartTime(),endTime:t.getEndTime()});}var s=F.getTimeStampFormatter().parse(v.getStartTime());var e=F.getTimeStampFormatter().parse(v.getEndTime());var m=this.calMiddleDate(s,e);var T=this.getTimeLineOption();var o=jQuery.sap.getObject(T.innerInterval.unit);var b=this.getAxisTime();var i=b.timeToView(s);var E=b.timeToView(e);var c=1;while(Math.abs(E-i)<n){s=o.offset(m,-c);e=o.offset(m,c);i=b.timeToView(s);E=b.timeToView(e);c++;}t.setStartTime(F.dateToAbapTimestamp(s));t.setEndTime(F.dateToAbapTimestamp(e));this.setTotalHorizon(t);};return a;},true);
