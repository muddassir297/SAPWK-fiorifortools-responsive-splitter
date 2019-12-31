/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/date/UniversalDate'],function(q,U){"use strict";var C={};C._createLocalDate=function(d,t){var l;if(d){var m;if(d instanceof U){m=d.getJSDate();}else{m=d;}l=new Date(m.getUTCFullYear(),m.getUTCMonth(),m.getUTCDate());if(m.getFullYear()<1000){l.setFullYear(m.getFullYear());}if(t){l.setHours(m.getUTCHours());l.setMinutes(m.getUTCMinutes());l.setSeconds(m.getUTCSeconds());l.setMilliseconds(m.getUTCMilliseconds());}}return l;};C._createUTCDate=function(d,t){var u;if(d){var m;if(d instanceof U){m=d.getJSDate();}else{m=d;}u=new Date(Date.UTC(m.getFullYear(),m.getMonth(),m.getDate()));if(m.getFullYear()<1000){u.setUTCFullYear(m.getFullYear());}if(t){u.setUTCHours(m.getHours());u.setUTCMinutes(m.getMinutes());u.setUTCSeconds(m.getSeconds());u.setUTCMilliseconds(m.getMilliseconds());}}return u;};C._createUniversalUTCDate=function(d,c,t){var u;if(c){u=U.getInstance(this._createUTCDate(d,t),c);}else{u=new U(this._createUTCDate(d,t).getTime());}return u;};C.calculateWeekNumber=function(d,y,l,L){var w=0;var W=0;var f=L.getFirstDayOfWeek();var o=new sap.ui.core.Locale(l);if(o&&(o.getLanguage()=='en'&&o.getRegion()=='US')){var j=new U(d.getTime());j.setUTCFullYear(y,0,1);W=j.getUTCDay();var c=new U(d.getTime());c.setUTCDate(c.getUTCDate()-c.getUTCDay()+W);w=Math.round((c.getTime()-j.getTime())/86400000/7)+1;}else{var t=new U(d.getTime());t.setUTCDate(t.getUTCDate()-f);W=t.getUTCDay();t.setUTCDate(t.getUTCDate()-W+4);var F=new U(t.getTime());F.setUTCMonth(0,1);W=F.getUTCDay();var a=0;if(W>4){a=7;}var b=new U(F.getTime());b.setUTCDate(1-W+4+a);w=Math.round((t.getTime()-b.getTime())/86400000/7)+1;}return w;};C.getFirstDateOfWeek=function(d){var u=new U(d.getTime()),f,w;w=U.getWeekByDate(u.getCalendarType(),u.getUTCFullYear(),u.getUTCMonth(),u.getUTCDate());if(w.week===0&&sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().getRegion()==="US"){w.year--;w.week=52;}f=U.getFirstDateOfWeek(u.getCalendarType(),w.year,w.week);return new U(Date.UTC(f.year,f.month,f.day,d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds())).getJSDate();};C.getFirstDateOfMonth=function(d){var n=new U(d.getTime());n.setUTCDate(1);return n;};C._getNumberOfWeeksForYear=function(y){var l=sap.ui.getCore().getConfiguration().getFormatLocale(),L=sap.ui.core.LocaleData.getInstance(new sap.ui.core.Locale(l)),o=new Date(Date.UTC(y,0,1)),i=o.getUTCDay(),n=52;if(L.getFirstDayOfWeek()===0){if(i===5||i===6){n=53;}}else{if(i===3||i===4){n=53;}}return n;};return C;},true);
