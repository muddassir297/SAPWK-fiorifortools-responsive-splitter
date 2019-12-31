sap.ui.define(['sap/chart/coloring/ColoringUtils','sap/chart/coloring/criticality/DimensionValues','sap/chart/ChartLog'],function(C,D,a){"use strict";var t=jQuery.type;var b={};b.qualify=function(c,m,d,i,A,o){return D.qualify(c,m,d,i,A,"Emphasis",o);};b.parse=function(c,l){var L={};var d=c.dim;var o=c.setting[d];var v=o.Values;var h=(t(v)==="array")?v:[v];var H=function(e){return h.indexOf(e[d])>-1;};if(h.length>1&&!(o.Legend&&o.Legend.Highlighted)){throw new a('error','Colorings.Emphasis.DimensionValues','Legend.Highlighted is mandatory when Highlight has multiple values');}else{if(o.Legend&&o.Legend.Highlighted!=null){L.Highlight=o.Legend.Highlighted;}else{L.Highlight=h[0];}}if(o.Legend&&o.Legend.Others){L.Others=o.Legend.Others;}else{L.Others=l.getText("COLORING_TYPE_OTHER");}var m={Highlight:H};return{callbacks:m,legend:L};};return b;});
