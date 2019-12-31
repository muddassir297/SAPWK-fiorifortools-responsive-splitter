/*!
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */
jQuery.sap.declare("sap.suite.ui.commons.util.FeedAggregator");jQuery.sap.require("sap.suite.ui.commons.util.DateUtils");
sap.suite.ui.commons.util.FeedAggregator=function(){throw new Error();};
sap.suite.ui.commons.util.FeedAggregator.filterItems=function($,I,e){var f=function(F,a){var b=$.find("rss>channel>item");if(b.length>0){for(var i=b.length-1;i>=0;i--){var c=jQuery(b[i]);var d=c.find("title");var m=false;for(var j=0;j<F.length;j++){var f=F[j];if(f){if(d.text().toLowerCase().indexOf(f.toLowerCase())!==-1){m=true;break;}}}if(m!==a){c.remove();}}}};if(I&&I.length>0){f(I,true);}if(e&&e.length>0){f(e,false);}};
sap.suite.ui.commons.util.FeedAggregator.getFeeds=function(f,I,e,c,F){var j={items:[]};var r=new sap.ui.model.json.JSONModel();var a=f.length;var b=0;var C=function(o){var $=jQuery(this.getData());sap.suite.ui.commons.util.FeedAggregator.filterItems($,I,e);if($.find("rss>channel>item>title").length>0){var d=$.find("rss>channel>item");var s=jQuery($.find("rss>channel>title")).text();var g=jQuery($.find("rss>channel>image>url")).text();for(var i=0;i<d.length;i++){var h=jQuery(d[i]);var k=new Date(h.children("pubDate").text());var l=h.children("image").text();if(l){g=l;}if(!sap.suite.ui.commons.util.DateUtils.isValidDate(k)){k=null;}j.items.push({title:h.children("title").text(),link:h.children("link").text(),description:h.children("description").text(),pubDate:k,source:s,image:g});}}b++;if(b===a){r.setData(j);if(c){c();}}};for(var i=0;i<f.length;i++){var t=new sap.ui.model.xml.XMLModel();t.attachRequestCompleted(C);t.loadData(f[i]);}return r;};
