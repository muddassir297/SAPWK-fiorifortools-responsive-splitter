/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/date/UniversalDate'],function(q,U){"use strict";var C={};C.render=function(r,R){var t=R.getTooltip_AsString();var v=R.getAppointmentsVisualization();var l=R.getLegend();var T=[];if(l){var L=sap.ui.getCore().byId(l);if(L){T=L.getItems();}else{q.sap.log.warning("CalendarLegend "+l+" does not exist!",R);}}r.write("<div");r.writeControlData(R);r.addClass("sapUiCalendarRow");if(!sap.ui.Device.system.phone&&R.getAppointmentsReducedHeight()){r.addClass("sapUiCalendarRowAppsRedHeight");}if(v!=sap.ui.unified.CalendarAppointmentVisualization.Standard){r.addClass("sapUiCalendarRowVis"+v);}if(R._sFocusedAppointmentId){r.writeAttribute("tabindex","-1");}else{r.writeAttribute("tabindex","0");}if(t){r.writeAttributeEscaped("title",t);}var w=R.getWidth();if(w){r.addStyle("width",w);}var h=R.getHeight();if(h){r.addStyle("height",h);}r.writeAccessibilityState(R);r.writeClasses();r.writeStyles();r.write(">");this.renderAppointmentsRow(r,R,T);r.write("</div>");};C.renderAppointmentsRow=function(r,R,t){var i=R.getId();r.write("<div id=\""+i+"-Apps\" class=\"sapUiCalendarRowApps\">");this.renderAppointments(r,R,t);r.write("</div>");};C.renderAppointments=function(r,R,t){var a=R._getVisibleAppointments();var I=R._getVisibleIntervalHeaders();var s=R._getStartDate();var n=[];var S=0;var N=0;var b=[];var c=0;var d=0;var e=R.getIntervals();var f=R.getIntervalType();var w=100/e;var i=0;var o=new U(s);var F=false;var l=false;switch(f){case sap.ui.unified.CalendarIntervalType.Hour:n=R.getNonWorkingHours()||[];S=s.getUTCHours();N=24;break;case sap.ui.unified.CalendarIntervalType.Day:case sap.ui.unified.CalendarIntervalType.Week:case sap.ui.unified.CalendarIntervalType.OneMonth:n=R._getNonWorkingDays();S=s.getUTCDay();N=7;b=R.getNonWorkingHours()||[];c=s.getUTCHours();d=24;break;case sap.ui.unified.CalendarIntervalType.Month:b=R._getNonWorkingDays();c=s.getUTCDay();d=7;break;default:break;}for(i=0;i<e;i++){if(l){F=true;}else{F=false;}l=false;switch(f){case sap.ui.unified.CalendarIntervalType.Hour:o.setUTCHours(o.getUTCHours()+1);if(o.getUTCHours()==0){l=true;}break;case sap.ui.unified.CalendarIntervalType.Day:case sap.ui.unified.CalendarIntervalType.Week:case sap.ui.unified.CalendarIntervalType.OneMonth:o.setUTCDate(o.getUTCDate()+1);if(o.getUTCDate()==1){l=true;}break;case sap.ui.unified.CalendarIntervalType.Month:o.setUTCMonth(o.getUTCMonth()+1);if(o.getUTCMonth()==0){l=true;}break;default:break;}this.renderInterval(r,R,i,w,I,n,S,N,b,c,d,F,l);}this.renderIntervalHeaders(r,R,w,I,e);r.write("<div id=\""+R.getId()+"-Now\" class=\"sapUiCalendarRowNow\"></div>");for(i=0;i<a.length;i++){var A=a[i];this.renderAppointment(r,R,A,t);}r.write("<div id=\""+R.getId()+"-DummyApp\" class=\"sapUiCalendarApp sapUiCalendarAppTitleOnly sapUiCalendarAppDummy\"></div>");};C.renderInterval=function(r,R,I,w,a,n,s,N,b,S,c,f,l){var d=R.getId()+"-AppsInt"+I;var i=0;var e=R.getShowIntervalHeaders()&&(R.getShowEmptyIntervalHeaders()||a.length>0);var m=R.getStartDate().getMonth();var D=new Date(R.getStartDate().getFullYear(),m+1,0).getDate();r.write("<div id=\""+d+"\"");r.addClass("sapUiCalendarRowAppsInt");r.addStyle("width",w+"%");if(I>=D&&R.getIntervalType()===sap.ui.unified.CalendarIntervalType.OneMonth){r.addClass("sapUiCalDayFromNextMonth");}for(i=0;i<n.length;i++){if((I+s)%N==n[i]){r.addClass("sapUiCalendarRowAppsNoWork");break;}}if(!e){r.addClass("sapUiCalendarRowAppsIntNoHead");}if(f){r.addClass("sapUiCalendarRowAppsIntFirst");}if(l){r.addClass("sapUiCalendarRowAppsIntLast");}r.writeClasses();r.writeStyles();r.write(">");if(e){r.write("<div");r.addClass("sapUiCalendarRowAppsIntHead");r.writeClasses();r.write(">");r.write("</div>");}if(R.getShowSubIntervals()){var g=R.getIntervalType();var h=0;switch(g){case sap.ui.unified.CalendarIntervalType.Hour:h=4;break;case sap.ui.unified.CalendarIntervalType.Day:case sap.ui.unified.CalendarIntervalType.Week:case sap.ui.unified.CalendarIntervalType.OneMonth:h=24;break;case sap.ui.unified.CalendarIntervalType.Month:var o=R._getStartDate();var k=new U(o);k.setUTCMonth(k.getUTCMonth()+I+1,0);h=k.getUTCDate();k.setUTCDate(1);s=k.getUTCDay();break;default:break;}var p=100/h;for(i=0;i<h;i++){r.write("<div");r.addClass("sapUiCalendarRowAppsSubInt");r.addStyle("width",p+"%");for(var j=0;j<b.length;j++){if((i+S)%c==b[j]){r.addClass("sapUiCalendarRowAppsNoWork");break;}}r.writeStyles();r.writeClasses();r.write(">");r.write("</div>");}}r.write("</div>");};C.renderIntervalHeaders=function(r,R,w,I,a){var s=R.getShowIntervalHeaders()&&(R.getShowEmptyIntervalHeaders()||I.length>0);if(s){for(var i=0;i<I.length;i++){var o=I[i];r.write("<div");r.addClass("sapUiCalendarRowAppsIntHead");if(R._bRTL){r.addStyle("right",w*o.interval+"%");r.addStyle("left",w*(a-o.last-1)+"%");}else{r.addStyle("left",w*o.interval+"%");r.addStyle("right",w*(a-o.last-1)+"%");}r.writeElementData(o.appointment);var b=o.appointment.getId();r.addClass("sapUiCalendarRowAppsIntHeadFirst");if(o.appointment.getSelected()){r.addClass("sapUiCalendarRowAppsIntHeadSel");}if(o.appointment.getTentative()){r.addClass("sapUiCalendarRowAppsIntHeadTent");}var t=o.appointment.getTooltip_AsString();if(t){r.writeAttributeEscaped("title",t);}var T=o.appointment.getType();var c=o.appointment.getColor();if(!c&&T&&T!=sap.ui.unified.CalendarDayType.None){r.addClass("sapUiCalendarRowAppsIntHead"+T);}if(c){if(R._bRTL){r.addStyle("border-right-color",c);}else{r.addStyle("border-left-color",c);}}r.writeStyles();r.writeClasses();r.write(">");r.write("<div");r.addClass("sapUiCalendarIntervalHeaderCont");r.writeClasses();if(c){r.addStyle("background-color",o.appointment._getCSSColorForBackground(c));r.writeStyles();}r.write(">");var d=o.appointment.getIcon();if(d){var e=["sapUiCalendarRowAppsIntHeadIcon"];var A={};A["id"]=b+"-Icon";A["title"]=null;r.writeIcon(d,e,A);}var f=o.appointment.getTitle();if(f){r.write("<span");r.writeAttribute("id",b+"-Title");r.addClass("sapUiCalendarRowAppsIntHeadTitle");r.writeClasses();r.write(">");r.writeEscaped(f,true);r.write("</span>");}var g=o.appointment.getText();if(g){r.write("<span");r.writeAttribute("id",b+"-Text");r.addClass("sapUiCalendarRowAppsIntHeadText");r.writeClasses();r.write(">");r.writeEscaped(g,true);r.write("</span>");}r.write("</div>");r.write("</div>");}}};C.renderAppointment=function(r,R,a,t){var A=a.appointment;var T=A.getTooltip_AsString();var s=A.getType();var c=A.getColor();var b=A.getTitle();var d=A.getText();var I=A.getIcon();var e=A.getId();var m={labelledby:{value:sap.ui.unified.CalendarRow._oStaticAppointmentText.getId()+" "+e+"-Descr",append:true}};var f=R.getAriaLabelledBy();if(f.length>0){m["labelledby"].value=m["labelledby"].value+" "+f.join(" ");}if(b){m["labelledby"].value=m["labelledby"].value+" "+e+"-Title";}if(d){m["labelledby"].value=m["labelledby"].value+" "+e+"-Text";}r.write("<div");r.writeElementData(A);r.addClass("sapUiCalendarApp");if(A.getSelected()){r.addClass("sapUiCalendarAppSel");m["selected"]=true;}if(A.getTentative()){r.addClass("sapUiCalendarAppTent");m["labelledby"].value=m["labelledby"].value+" "+sap.ui.unified.CalendarRow._oStaticTentativeText.getId();}if(!d){r.addClass("sapUiCalendarAppTitleOnly");}if(I){r.addClass("sapUiCalendarAppWithIcon");}if(R._bRTL){r.addStyle("right",a.begin+"%");r.addStyle("left",a.end+"%");}else{r.addStyle("left",a.begin+"%");r.addStyle("right",a.end+"%");}r.writeAttribute("data-sap-level",a.level);if(R._sFocusedAppointmentId==e){r.writeAttribute("tabindex","0");}else{r.writeAttribute("tabindex","-1");}if(T){r.writeAttributeEscaped("title",T);}if(!c&&s&&s!=sap.ui.unified.CalendarDayType.None){r.addClass("sapUiCalendarApp"+s);}if(c){if(R._bRTL){r.addStyle("border-right-color",c);}else{r.addStyle("border-left-color",c);}}r.writeAccessibilityState(A,m);r.writeClasses();r.writeStyles();r.write(">");r.write("<div");r.addClass("sapUiCalendarAppCont");if(c&&R.getAppointmentsVisualization()===sap.ui.unified.CalendarAppointmentVisualization.Filled){r.addStyle("background-color",A._getCSSColorForBackground(c));r.writeStyles();}r.writeClasses();r.write(">");if(I){var g=["sapUiCalendarAppIcon"];var h={};h["id"]=e+"-Icon";h["title"]=null;r.writeIcon(I,g,h);}if(b){r.write("<span");r.writeAttribute("id",e+"-Title");r.addClass("sapUiCalendarAppTitle");r.writeClasses();r.write(">");r.writeEscaped(b,true);r.write("</span>");}if(d){r.write("<span");r.writeAttribute("id",e+"-Text");r.addClass("sapUiCalendarAppText");r.writeClasses();r.write(">");r.writeEscaped(d,true);r.write("</span>");}var j=R._oRb.getText("CALENDAR_START_TIME")+": "+R._oFormatAria.format(A.getStartDate());j=j+"; "+R._oRb.getText("CALENDAR_END_TIME")+": "+R._oFormatAria.format(A.getEndDate());if(T){j=j+"; "+T;}if(s&&s!=sap.ui.unified.CalendarDayType.None){for(var i=0;i<t.length;i++){var o=t[i];if(o.getType()==s){j=j+"; "+o.getText();break;}}}r.write("<span id=\""+e+"-Descr\" class=\"sapUiInvisibleText\">"+j+"</span>");r.write("</div>");r.write("</div>");};return C;},true);