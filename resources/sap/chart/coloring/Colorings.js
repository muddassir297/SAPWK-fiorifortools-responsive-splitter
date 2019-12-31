/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/chart/coloring/criticality/Criticality","sap/chart/coloring/emphasis/Emphasis",'sap/chart/ChartLog'],function(C,E,a){"use strict";var S=['Criticality','Emphasis'];function u(c,A){var u=null;var s=A?A.coloring:null;var p=A?A.parameters:null;if(p&&p.dimension&&p.measure){throw new a('error','activeColoring',"Either \"dimension\" or \"measure\" can be set in activeColoring.parameters, but not both of them");}if(S.indexOf(s)>-1){u=s;}return u;}return{getCandidateSetting:function(c,A,m,d,i,s,b,l){var e=u(c,A);var f,o={};o.bMBC=(b==="heatmap")?true:false;o.bShowUnmentionedMsr=(b==="scatter"||b==="bubble")?false:true;o.bIsPie=(b==="pie"||b==="donut")?true:false;o.chartType=b;switch(e){case'Criticality':f=C;break;case'Emphasis':f=E;break;default:f=null;break;}if(f){return f.getCandidateSetting(c,A,m,d,i,s,o,l);}else{return{};}}};});
