/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.core.sessionHandler");jQuery.sap.require("sap.apf.core.ajax");jQuery.sap.require("sap.apf.utils.filter");jQuery.sap.require("sap.apf.core.constants");(function(){'use strict';sap.apf.core.SessionHandler=function(i){var a=null;var s=false;var d=false;var b=false;var p='';var x="";var h=new sap.apf.utils.Hashtable(i.instances.messageHandler);var n=0;var c=i.instances.coreApi;var m=i.instances.messageHandler;if(i&&i.functions&&i.functions.serializeApfState&&typeof i.functions.serializeApfState=='function'){s=i.functions.serializeApfState;}if(i&&i.functions&&i.functions.deserializeApfState&&typeof i.functions.deserializeApfState=='function'){d=i.functions.deserializeApfState;}this.type="sessionHandler";this.ajax=function(S){sap.apf.core.ajax(S);};this.getXsrfToken=function(e){var f=h.getItem(e);if(f!==undefined&&f!==false){return f;}this.fetchXcsrfToken(e);h.setItem(e,x);return x;};this.fetchXcsrfToken=function(e){var f="HEAD";if(h.getItem(e)===false){f="GET";}this.ajax({url:c.getUriGenerator().getAbsolutePath(e),type:f,beforeSend:function(j){j.setRequestHeader("x-csrf-token","Fetch");},success:o.bind(this),error:g.bind(this),async:false});n=n+1;function o(D,S,X){x=X.getResponseHeader("x-csrf-token");if(x===null){x="";}}function g(r,S,E){if(r.status===405&&h.getItem(e)!==false){h.setItem(e,false);this.fetchXcsrfToken(e);}else{x="";var M=m.createMessageObject({code:5101,aParameters:[]});m.putMessage(M);}}};this.setDirtyState=function(e){b=e;};this.isDirty=function(){return b;};this.setPathName=function(e){if(typeof e!='string'){p='';return;}p=e;};this.getPathName=function(){return p;};this.isApfStateAvailable=function(){if(a===null){return false;}return true;};this.storeApfState=function(){var k=true;if(s){s(undefined,k).done(function(e){a=e;});}};this.restoreApfState=function(){if(this.isApfStateAvailable()&&d){c.resetPath();return d(a);}};};}());
