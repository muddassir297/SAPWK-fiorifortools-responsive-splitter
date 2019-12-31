// @copyright@
sap.ui.define(["sap/ushell/services/ShellNavigationHashChanger"],function(S){"use strict";function a(c,p,s){function r(){sap.ui.require(['sap.m.MessageBox'],function(M){M.show("Due to a configuration change on the server,\nclient and server are out of sync.\n We strongly recommend to reload the page soon.\nReload page now?",{icon:sap.m.MessageBox.Icon.ERROR,title:"Client out of sync with server.",actions:[sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],onClose:function(A){if(A===sap.m.MessageBox.Action.YES){window.setTimeout(function(){window.location.reload();},0);}}});});}var o=s&&s.config;this.hashChanger=new S(o);this.isInitialNavigation=function(){return this.hashChanger.isInitialNavigation();};this.hrefForExternal=function(A,v,C,b){return this.hashChanger.hrefForExternal(A,v,C,b);};this.hrefForAppSpecificHash=function(A){return this.hashChanger.hrefForAppSpecificHash(A);};this.compactParams=function(P,R,C,t){return this.hashChanger.compactParams(P,R,C,t);};this.toExternal=function(A,C,w){this.hashChanger.toExternal(A,C,w);};this.toAppHash=function(A,w){this.hashChanger.toAppHash(A,w);};this.init=function(f){hasher.prependHash="";sap.ui.core.routing.HashChanger.replaceHashChanger(this.hashChanger);var b=sap.ui.getCore().getEventBus();b.subscribe("sap.ui.core.UnrecoverableClientStateCorruption","RequestReload",r);this.hashChanger.initShellNavigation(f);return this;};this.NavigationFilterStatus=this.hashChanger.NavigationFilterStatus;this.registerNavigationFilter=function(f){this.hashChanger.registerNavigationFilter(f);};}a.hasNoAdapter=true;return a;},true);
