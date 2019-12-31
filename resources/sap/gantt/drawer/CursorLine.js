/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/Device","sap/gantt/misc/Format","sap/gantt/drawer/Drawer","sap/ui/thirdparty/d3"],function(C,D,F,a){"use strict";var b=a.extend("sap.gantt.drawer.CursorLine");b.prototype.drawSvg=function(s,S,l,c){this._oLocale=l;var i=jQuery('#'+c.svgId).offset().left;var A=[];s.each(function(d,e){var o=jQuery(this),f=o.offset();A.push({x:c.x+i-f.left,y:c.y,svgId:o.attr("id"),svgHeight:o.height()});});var t=this;S.each(function(d,e){var h=t._createHeaderTopG(d3.select(this));t._drawHeaderLabel(h,A[e]);});s.each(function(d,e){var B=t._createBodyTopG(d3.select(this));t._drawCursorLine(B,A[e]);});};b.prototype._createBodyTopG=function(s){var B=s.selectAll(".cursorline-top").data(function(){return[{svgHeight:jQuery(this.parentNode).height()}];});B.enter().append("g").classed("cursorline-top",true);B.exit().remove();return B;};b.prototype._drawCursorLine=function(g,s){var p=g.selectAll("path").data(function(d){return[{svgHeight:d.svgHeight,x:s.x,y:s.y}];});p.enter().append("path").classed("sapGanttCursorLineBody",true);p.attr("d",function(d){return"M"+d.x+",0v"+d.svgHeight+"h1h-1";});p.exit().remove();};b.prototype._createHeaderTopG=function(s){var h=s.selectAll(".cursorline-header-top").data(function(){return[{svgHeight:jQuery(this.parentNode).height()}];});h.enter().append("g").classed("cursorline-header-top",true);h.exit().remove();return h;};b.prototype._drawHeaderLabel=function(g,s){var t=this;var A=this._getAxisTime(s.svgId);var r=g.selectAll("rect").data(function(d){return[{svgHeight:d.svgHeight,svgId:d.svgId,x:s.x,y:s.y}];});r.enter().append("rect").classed("sapGanttCursorLineHeader",true);r.attr("width",function(d){return 64;}).attr("height",function(d){return d.svgHeight>80?30:25;}).attr("x",function(d){return d.x-parseFloat(r.attr('width'))/2;}).attr("y",function(d){return d.svgHeight-parseFloat(r.attr('height'))-5;});r.exit().remove();var T=g.selectAll("text").data(function(d){return[{x:parseFloat(r.attr('x'))+parseFloat(r.attr('width')/2),y:parseFloat(r.attr('y'))+parseFloat(r.attr('height')/2)}];});T.enter().append("text").classed("sapGanttCursorLineLabel",true);T.attr("x",function(d){return d.x;}).attr("y",function(d){return d.y;}).text(function(d){return t._getTimeLabel(F.dateToAbapTimestamp(A.viewToTime(d.x)),t._oLocale,A);});if(D.browser.msie){T.attr("dy",".35em");}T.exit().remove();};b.prototype.destroySvg=function(s,S){s.selectAll(".cursorline-top").remove();S.selectAll(".cursorline-header-top").remove();};b.prototype._getAxisTime=function(e){var $=jQuery("#"+e);var A=null;if($&&$.control()){A=$.control()[0].getAxisTime();}return A;};b.prototype._getTimeLabel=function(t,l,A){var L=F._convertUTCToLocalTime(t,l),z=A.getZoomStrategy();return z.getLowerRowFormatter().format(L);};return b;},true);
