// @copyright@
(function(s,q){"use strict";s.ui.define(["sap/ushell/services/Container","sap/ushell/services/AppConfiguration","sap/ushell/services/Personalization","sap/ushell/services/URLParsing","sap/ushell/services/CrossApplicationNavigation","sap/ushell/services/AppLifeCycle","sap/ushell/services/_SmartNavigation/complements"],function(c,a,p,u,C,A,P){c=s.ushell.Container;u=c.getService("URLParsing");C=c.getService("CrossApplicationNavigation");A=c.getService("AppLifeCycle");p=c.getService("Personalization");function b(){return new S(P,a,p,u,C,A);}b.hasNoAdapter=true;return b;});s.ushell.services.SmartNavigation=S;function S(p,a,P,u,c,A){if(!S.instance){Object.defineProperty(S,"instance",{value:Object.create(null,{getLinks:{value:function(o){var b=c.getLinks(o);var f=a.getCurrentApplication().sShellHash;var d=A.getCurrentApplication().componentInstance;if(!f){q.sap.log.warning("Call to SmartNavigation#getLinks() simply "+"delegated to CrossApplicationNavigation#getLinks()"+" because oAppConfiguration#getCurrentApplication()#sShellHash"+" evaluates to undefined.");return b;}return q.when(b,p.getNavigationOccurrences(f,P,d,u)).then(function(l,n){if(n.length===0){return l;}return p.prepareLinksForSorting(l,n,u).sort(function(L,O){return O.clickCount-L.clickCount;});});}},toExternal:{value:function(o,C){var _=arguments;var d=p.getHashFromOArgs(o.target,u);var t=function(){return c.toExternal.apply(c,_);};var f=a.getCurrentApplication().sShellHash;var b=A.getCurrentApplication().componentInstance;if(!f){q.sap.log.warning("Current shell hash could not be identified. Navigation will not be tracked.",null,"sap.ushell.services.SmartNavigation");return q.when(t());}if(!d){q.sap.log.warning("Destination hash does not conform with the ushell guidelines. Navigation will not be tracked.",null,"sap.ushell.services.SmartNavigation");return q.when(t());}return p.recordNavigationOccurrences(f,d,P,b,u).then(t);}},hrefForExternal:{value:function(){var h=c.hrefForExternal.apply(c,arguments);return h;}},trackNavigation:{value:function(o){var t=o.target;var f=a.getCurrentApplication().sShellHash;var d;if(!f){q.sap.log.warning("Call to SmartNavigation#trackNavigation() simply ignored"+" because oAppConfiguration#getCurrentApplication()#sShellHash"+" evaluates to undefined.");return q.when(null);}d=p.getHashFromOArgs(t,u);if(!d){q.sap.log.warning("Navigation not tracked - no valid destination provided",null,"sap.ushell.services.SmartNavigation");return q.when(null);}q.sap.log.debug("Navigation to "+d+" was tracked out of "+f,null,"sap.ushell.services.SmartNavigation");return p.recordNavigationOccurrences(f,d,P,A.getCurrentApplication().componentInstance,u);}},constructor:{value:S}})});}return S.instance;}})(sap,jQuery);