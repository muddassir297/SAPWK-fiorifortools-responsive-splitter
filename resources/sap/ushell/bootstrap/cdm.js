(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(r,m,a){"use strict";(function($,b,j,u){var s,S;var U=u.getBootPath(b);var o={"":U};var d=/sap-ui-debug=(true|x|X)/.test($.location.search);var c=new u.ConfigUtil("sap.ushellConfig",$,b,j);var x=function(C){$.jQuery.sap.require("sap.ushell.services.Container");$.sap.ushell.bootstrap("local").done(C);};$.fnOnUI5Init=u.onUI5Init;try{if(!d){S=$.localStorage.getItem("sap-ui-debug");d=!!S&&/^(true|x|X)$/.test(S);}}catch(e){}c.createGlobalConfigs(x,null);$["sap-ushell-config"]["sap-ui-debug"]=d;s="<script id='sap-ui-bootstrap' src='"+U+"/sap/fiori/core-min-0.js' "+"data-sap-ui-evt-oninit='fnOnUI5Init( sap, jQuery );' "+"data-sap-ui-xx-bindingSyntax='complex' "+"data-sap-ui-libs='sap.fiori, sap.m, sap.ushell' "+"data-sap-ui-theme='sap_belize' "+"data-sap-ui-compatVersion='1.16' "+"data-sap-ui-resourceroots='"+JSON.stringify(o)+"' "+"><\/script>";if(!d){s+="<script src='"+U+"/sap/fiori/core-min-1.js' "+"><\/script>"+"<script src='"+U+"/sap/fiori/core-min-2.js' "+"><\/script>"+"<script src='"+U+"/sap/fiori/core-min-3.js' "+"><\/script>";}b.write(s);})(window,document,JSON,r("../common/"));},{"../common/":8}],2:[function(r,m,e){"use strict";var g=r("./common.boot.script");var b;m.exports=function getBootPath($){var B;if(!b){B=g($);if(B){b=B.src.split("/").slice(0,-4).join("/");}else{}}return b;};},{"./common.boot.script":3}],3:[function(r,m,e){"use strict";m.exports=function getBootScript($){return $.getElementById("sap-ushell-bootstrap");};},{}],4:[function(r,m,e){"use strict";var f=r("./common.config.private");C.prototype.createGlobalConfigs=function(x,s){var M=f.readConfigItemsFromMeta(this.prefix,this.document,this.JSON);f.createGlobalConfigs(M,x,s,this.window,this.JSON);};function C(c,$,a,j){return Object.create(C.prototype,{JSON:{value:j},prefix:{value:c},window:{value:$},document:{value:a}});}m.exports=C;},{"./common.config.private":5}],5:[function(r,m,a){"use strict";function b(C,$,j){var s="meta[name^='"+C+"']:not([name=''])";var M=$.querySelectorAll(s);var f=[];Array.prototype.slice.call(M).forEach(function(o){try{f.push(j.parse(o.content));}catch(e){}});return f;}function c(M,C,e,j){var A;if(!C){return;}A=e?j.parse(j.stringify(C)):C;Object.keys(A).forEach(function(k){if(typeof M[k]==="object"&&typeof A[k]==="object"){c(M[k],A[k],false);return;}M[k]=A[k];});}function d(M,x,s,$,j){var C="sap-ushell-config";$[C]=$[C]||{};M.forEach(function(o){c($[C],o,true,j);});s&&s.forEach(function(S){c($[C],S,true,j);});$["sap-ui-config"]={"xx-bootTask":x};}m.exports.readConfigItemsFromMeta=b;m.exports.createGlobalConfigs=d;m.exports.mergeConfig=c;},{}],6:[function(r,m,e){"use strict";var g=r("./common.boot.path");m.exports=function loadContent(s,q){var b=g();var v=q.sap.getUriParameters().get("sap-ushell-cdm-site-url");var c=s.ushell.Container.createRenderer();if(v){q.sap.getObject("sap-ushell-config.services.CommonDataModel.adapter.config",0).cdmSiteUrl=v;}q.sap.setIcons({"phone":b+'/sap/ushell/themes/base/img/launchicons/57_iPhone_Desktop_Launch.png',"phone@2":b+'/sap/ushell/themes/base/img/launchicons/114_iPhone-Retina_Web_Clip.png',"tablet":b+'/sap/ushell/themes/base/img/launchicons/72_iPad_Desktop_Launch.png',"tablet@2":b+'/sap/ushell/themes/base/img/launchicons/144_iPad_Retina_Web_Clip.png',"favicon":b+'/sap/ushell/themes/base/img/launchpad_favicon.ico',"precomposed":true});q.sap.require("sap.ushell.iconfonts");q.sap.require("sap.ushell.services.AppConfiguration");s.ushell.iconfonts.registerFiori2IconFont();q("#canvas").empty();c.placeAt("canvas");};},{"./common.boot.path":2}],7:[function(r,m,e){"use strict";var g=r("./common.boot.path");var G=r("./common.boot.script");m.exports=function loadSplashscreen($){var b=g($);var R="apple-touch-startup-image";var c=G($);[{href:"320_x_460.png",media:"(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 1)"},{href:"640_x_920.png",media:"(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 2)"},{href:"640_x_1096.png",media:"(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"},{href:"768_x_1004.png",media:"(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 1)"},{href:"1024_x_748.png",media:"(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 1)"},{href:"1536_x_2008.png",media:"(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 2)"},{href:"2048_x_1496.png",media:"(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 2)"}].forEach(function(s){var l=$.createElement("link");l.rel=R;l.href=b+s.href;l.media=s.media;$.head.insertBefore(l,c);});};},{"./common.boot.path":2,"./common.boot.script":3}],8:[function(r,m,e){"use strict";m.exports.loadSplashscreen=r("./common.load.splashscreen");m.exports.getBootPath=r("./common.boot.path");m.exports.ConfigUtil=r("./common.config");m.exports.onUI5Init=r("./common.load.content");},{"./common.boot.path":2,"./common.config":4,"./common.load.content":6,"./common.load.splashscreen":7}]},{},[1]);