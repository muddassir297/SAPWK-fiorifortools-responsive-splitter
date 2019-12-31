/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/Global','sap/ui/core/Core','./js/highlight-query-terms','sap/ui/core/library','sap/ui/commons/library'],function(q,G,C){"use strict";sap.ui.getCore().initLibrary({name:"sap.ui.demokit",version:"1.46.2",dependencies:["sap.ui.core","sap.ui.commons"],types:["sap.ui.demokit.UI5EntityCueCardStyle"],interfaces:[],controls:["sap.ui.demokit.CodeSampleContainer","sap.ui.demokit.CodeViewer","sap.ui.demokit.FileUploadIntrospector","sap.ui.demokit.HexagonButton","sap.ui.demokit.HexagonButtonGroup","sap.ui.demokit.IndexLayout","sap.ui.demokit.SimpleTree","sap.ui.demokit.TagCloud","sap.ui.demokit.UI5EntityCueCard"],elements:["sap.ui.demokit.SimpleTreeNode","sap.ui.demokit.Tag","sap.ui.demokit.UIAreaSubstitute"]});var t=sap.ui.demokit;t.UI5EntityCueCardStyle={Standard:"Standard",Demokit:"Demokit"};sap.ui.lazyRequire("sap.ui.demokit.UI5EntityCueCard","attachToContextMenu detachFromContextMenu");sap.ui.lazyRequire("sap.ui.demokit.DemokitApp","new getInstance");sap.ui.lazyRequire("sap.ui.demokit.IndexPage");sap.ui.getCore().attachInit(function(){if(q("body").hasClass("sapUiDemokitBody")){var b=sap.ui.requireSync('sap/ui/demokit/CodeSampleContainer');var H=sap.ui.requireSync('sap/ui/demokit/HexagonButton');var U=sap.ui.requireSync('sap/ui/demokit/UI5EntityCueCard');q("h1").each(function(){var $=q(this),T=$.text(),a="Gray",i=$.attr('icon'),I=$.attr('iconPos')||'left:40px;top:20px;',f=q("<div class='sapUiDemokitTitle'><span>"+T+"</span></div>");$.replaceWith(f);if(a||i){f.prepend("<div id='sap-demokit-icon'></div>");new H({color:a,imagePosition:'position: relative;'+I,icon:i}).placeAt("sap-demokit-icon");}});var c=q("h2");var d=q('h2[id="settings"]');var s=q("html").attr('data-sap-ui-dk-controls');if(d.size()===0&&c.size()>=2&&s){q(c[1]).before(q("<h2 id='settings'>Settings (Overview)</h2><div cue-card='"+s.split(',')[0]+"'></div>"));c=q("h2");}var e=q("ul.sapDkTLN");if(c.size()>0&&e.size()==0){c.first().before(e=q("<ul class='sapDkTLN'></ul>"));}c.each(function(i){var $=q(this);if($.css('display')==='none'){return;}if(!$.attr('id')){$.attr('id','__'+i);}var a=q("<a></a>").attr("href","#"+$.attr('id')).text($.text()).addClass('sapDkLnk');var l=q("<li></li>").append(a);e.append(l);});q("[code-sample]").each(function(){var $=q(this),u=$.attr('code-sample'),S=$.attr('script')||$.children('script').attr('id')||u+"-script";$.addClass("sapUiDemokitSampleCont");new b("code-sample-"+u,{scriptElementId:S,uiAreaId:u}).placeAt(this);});q("[cue-card]").each(function(){var $=q(this),E=$.attr('cue-card');new U({entityName:E,collapsible:false,expanded:true,style:'Demokit',navigable:true,navigate:function(o){top.sap.ui.demokit.DemokitApp.getInstance().navigateToType(o.getParameter("entityName"));o.preventDefault();},title:'Settings (Overview)'}).placeAt(this);});}});t._getAppInfo=function(c){var u=sap.ui.resource("","sap-ui-version.json");q.ajax({url:u,dataType:"json",error:function(x,s,e){q.sap.log.error("failed to load library list from '"+u+"': "+s+", "+e);c(null);},success:function(a,s,x){if(!a){q.sap.log.error("failed to load library list from '"+u+"': "+s+", Data: "+a);c(null);return;}c(a);}});};t._loadAllLibInfo=function(a,I,r,c){if(typeof r==="function"){c=r;r=undefined;}q.sap.require("sap.ui.core.util.LibraryInfo");var L=sap.ui.require("sap/ui/core/util/LibraryInfo");var l=new L();var f=I=="_getLibraryInfoAndReleaseNotes";if(f){I="_getLibraryInfo";}t._getAppInfo(function(A){if(!(A&&A.libraries)){c(null,null);return;}var b=0,d=A.libraries,e=d.length,o={},g={},h=[],j,k;for(var i=0;i<e;i++){j=d[i].name;k=d[i].version;h.push(j);g[j]=k;l[I](j,function(E){var D=function(){b++;if(b==e){c(h,o,A);}};o[E.library]=E;if(!o[E.library].version){o[E.library].version=g[E.library];}if(f){if(!r){r=g[E.library];}l._getReleaseNotes(E.library,r,function(R){o[E.library].relnotes=R;D();});}else{D();}});}});};return t;});
