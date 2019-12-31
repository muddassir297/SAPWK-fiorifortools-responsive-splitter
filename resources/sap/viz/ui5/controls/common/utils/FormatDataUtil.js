/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(function(){"use strict";var F={};F.formatData=function(o,c){if(!(o.data&&o.data.val&&o.data.val.length>0)){return o.data;}var d=o.data,f=sap.viz.api.env.Format.format,a=jQuery.extend(true,{},d),t=a.val.hasOwnProperty("timeMeasure")?a.val.timeMeasure:-1,b=a.val.hasOwnProperty("timeDimensions")?a.val.timeDimensions:[],e=c.formatString,g=null,h={},p;if(typeof e==="string"){g=e;}else if(e instanceof Object){if(e.formatPattern||e.dataUnit){g=e;}else{h=e;}}if(t!==-1){var j=a.val.filter(function(i){return(i.type)&&(i.type.toLowerCase()==="measure");})[t];j.value=new Date(j.value);}if(o.timeTooltipData&&c.chartType.indexOf('time')>-1){var k=false;if(e){b.forEach(function(i){if(a.val[i]&&a.val[i].id){var m=h[a.val[i].id];if(m&&(typeof m==="string"||m.formatPattern)){k=true;}}});}if(k){a.val.forEach(function(i,m){if(b.indexOf(m)>-1){i.type="measure";i.value=new Date(i.value);}});}else{var l=jQuery.extend(true,[],o.timeTooltipData);l.forEach(function(i,m){if(a.val[m].dataName){l[m].dataName=a.val[m].dataName;}});a.val=l;a.isTimeSeries=true;}}a.val.forEach(function(v,i){if(v.type&&v.type.toLowerCase()==="measure"){p=h[v.id]||g||v.formatString;if(p){if((p.formatPattern||p.dataUnit)){v.value=f(v.value,p.formatPattern);var m=a.val.timeDimensions&&a.val.timeDimensions.indexOf(i)>-1;if(!m){v.unit=p.dataUnit||v.unit;}}else{v.value=f(v.value,p);}}else{v.value=f(v.value);}}});return a;};return F;});