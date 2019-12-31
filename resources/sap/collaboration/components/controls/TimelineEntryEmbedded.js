/*
* ! @copyright@
*/
sap.ui.define(['jquery.sap.global','sap/ui/core/Control','sap/collaboration/components/utils/LanguageBundle','sap/collaboration/components/controls/PlaceholderUtility','sap/collaboration/components/utils/MediaTypeToSAPIcon'],function(q,C,L,p,M){"use strict";var T=C.extend("sap.collaboration.components.controls.TimelineEntryEmbedded",{metadata:{interfaces:[],library:"sap.m",properties:{"timelineEntry":{type:"object",group:"data"}},events:{},aggregations:{}}});T.prototype.init=function(){this._oLangBundle=new L();q.sap.includeStyleSheet(q.sap.getModulePath("sap.collaboration.components.resources.css.EmbeddedControl",".css"));this._aTimelineItemTextDisplay;};T.prototype.onBeforeRendering=function(){if(!this._aTimelineItemTextDisplay){this._createTimelineItemText();}};T.prototype.exit=function(){if(this._aTimelineItemTextDisplay){this._aTimelineItemTextDisplay.forEach(function(c){c.destroy();});}if(this._oPopover){this._oPopover.destroy();}};T.prototype._getTimelineItemTextControls=function(){return this._aTimelineItemTextDisplay;};T.prototype._createTimelineItemText=function(){var t=this.getTimelineEntry();this._aTimelineItemTextDisplay=[];if(t.timelineEntryDetails!=undefined&&t.timelineEntryDetails.length>0){var f=this._parseTimelineEntryDetail(t.timelineEntryDetails[0]);this._aTimelineItemTextDisplay.push(new sap.m.Text({text:f+" "}).addStyleClass("alignMiddle"));if(t.timelineEntryDetails.length>1){var l=this._createTLEntryDetailsLink(t.timelineEntryDetails).addStyleClass("alignMiddle");this._aTimelineItemTextDisplay.push(l);}}else{this._aTimelineItemTextDisplay.push(new sap.m.Text({text:t.text}).addStyleClass("alignMiddle"));}};T.prototype._renderTimelineItemText=function(r){var s="&nbsp;";if(this._aTimelineItemTextDisplay.length>0){r.write("<div");r.writeControlData(this);r.write(">");for(var i=0;i<this._aTimelineItemTextDisplay.length;i++){var c=this._aTimelineItemTextDisplay[i].getMetadata().getName();switch(c){case"sap.m.Text":var t=this._aTimelineItemTextDisplay[i].getText();if(t.search(/\s/)==0){var f=t.search(/\S/);do{r.write(s);f--;}while(f>0);}r.renderControl(this._aTimelineItemTextDisplay[i]);if(t[t.length-1]==" "){var a=t.length-1;var b=t[a];do{r.write(s);b=t[--a];}while(b==" "&&b!=undefined);}break;case"sap.m.Link":case"sap.ui.core.HTML":default:r.renderControl(this._aTimelineItemTextDisplay[i]);}}r.write("</div>");}};T.prototype._createTLEntryDetailsLink=function(t){var a=this;var A=t.length-1;var l=this._oLangBundle.getText("TE_LINK_TEXT",A);var o=new sap.m.Link(this.getId()+"_PopoverLink",{text:l});o.attachPress(function(){if(!a._oPopover){a._oPopover=a._createTLEntryDetailsPopover(t);}a._oPopover.openBy(o);});return o;};T.prototype._createTLEntryDetailsPopover=function(t){var c=new sap.m.List(this.getId()+"_ChangeList",{inset:false});for(var e in t){var E=this._parseTimelineEntryDetail(t[e]);var l=new sap.m.FeedListItem({text:E,showIcon:false});c.addItem(l);}var S="20em";var P=new sap.m.Popover(this.getId()+"_Popover",{contentWidth:S,placement:sap.m.PlacementType.Auto,title:this._oLangBundle.getText("TE_DETAILS_POPOVER_HEADER")+"("+t.length+")",content:[c]});return P;};T.prototype._parseTimelineEntryDetail=function(d){var t="";switch(d.changeType){case"U":t=this._oLangBundle.getText("TE_DETAILS_CHANGED",[d.propertyLabel,d.beforeValue,d.afterValue]);break;case"I":t=this._oLangBundle.getText("TE_DETAILS_SET",[d.propertyLabel,d.afterValue]);break;case"D":t=this._oLangBundle.getText("TE_DETAILS_CLEARED",[d.propertyLabel,d.beforeValue]);break;}return t;};return T;},true);
