sap.ui.define(["jquery.sap.global","sap/ui/base/Object"],function(q,B){"use strict";function g(c,C){var h;var H=null;var b;var I=false;var e=[];function a(i){var y;var M=c.getModel();if(i){if(M){y=M.getProperty(i);}}else{var z=c.getBindingContext();if(z){y=z.getObject();}}return!!(y&&y.__metadata&&y.__metadata.created);}function d(){return c.getModel("_templPriv");}function f(){return d().getProperty("/generic/viewLevel");}function j(){return C.preprocessorsData;}function k(){var R=c.getModel("i18n").getResourceBundle();return{dataLoadFailedTitle:R.getText("ST_GENERIC_ERROR_LOAD_DATA_TITLE"),dataLoadFailedText:R.getText("ST_GENERIC_ERROR_LOAD_DATA_TEXT")};}function A(T,i,y){if(typeof y!=="function"){throw new Error("Event handler must be a function");}e.push({template:T,event:i,handler:y});}function D(T,y,z){for(var i=e.length;i--;){if(e[i].handler===z&&e[i].event===y&&e[i].template===T){e.splice(i,1);}}}function F(T,y,z){for(var i=0;i<e.length;i++){if(e[i].event===y&&e[i].template===T){e[i].handler(z);}}}function l(i){return i.getMetadata().getName();}function p(i){h.then(function(y){if(y&&!i.outdated){var N=C.oNavigationObserver.getProcessFinished(true);N.then(function(){F(l(C.oController),"PageDataLoaded",{context:y});});}});}function s(){C.oHeaderLoadingObserver.startProcess();if(!b){var i=new Promise(function(R){b=R();});C.oApplication.getBusyHelper().setBusy(i);}}function m(){I=true;if(!H){h=new Promise(function(R){H=R;});}if(!c.getComponentContainer().getElementBinding().isSuspended()){s();}}function E(){if(b){b();b=null;}C.oHeaderLoadingObserver.stopProcess();}function n(i){E();if(H){var y=i.getSource().getBoundContext();if(y){H(y);(C.methods.updateBindingContext||q.noop)();}}I=false;}function o(i){var y=i.getSource().getBoundContext();if(y){if(H){H(y);}(C.methods.updateBindingContext||q.noop)();}else{var z=k();var N=c.getAppComponent().getNavigationController();N.navigateToMessagePage({title:z.dataLoadFailedTitle,text:z.dataLoadFailedText,viewLevel:f()});}C.oHeaderLoadingObserver.stopProcess();H=null;}function r(i){var P={};var y=j();if(y.rootContextExpand&&y.rootContextExpand.length){P.expand=y.rootContextExpand.join(",");}C.oHeaderLoadingObserver.startProcess();h=new Promise(function(R){H=R;c.getComponentContainer().bindElement({path:i,events:{dataRequested:m,dataReceived:n,change:o},parameters:P,batchGroupId:"Changes",changeSetId:"Changes"});});}function t(i,y){if(!i){return;}var z=c.getComponentContainer();if(!z){return;}if(a(i)){z.unbindElement();z.setBindingContext(z.getModel().getContext(i));}else{var G=C.oApplication.getCurrentDisplayObject();var J=z.getElementBinding();if(J){if(J.getPath()===i){if(J.isSuspended()){J.resume();}if(I){s();}if(!y){p(G);}return;}else if(!y){z.unbindElement();}}var U=c.getModel("ui");U.setProperty("/enabled",false);U.setProperty("/editable",false);r(i);p(G);}}function S(){var i=c.getComponentContainer();var y=i.getElementBinding();if(y&&!y.isSuspended()){y.suspend();E();}}function u(i){C.oApplication.setBackNavigation(i);}function v(T){C.oApplication.setTitle(T);}function w(i){return C.oApplication.registerContext(i);}function x(){return C.oApplication.getBreadCrumbInfo(c.getEntitySet());}return{setEditableNDC:function(i){C.oApplication.setEditableNDC(i);},getEditableNDC:function(){return C.oApplication.getEditableNDC();},getBusyHelper:function(){return C.oApplication.getBusyHelper();},isNonDraftCreate:a,attach:function(i,y,z){A(l(i),y,z);},detach:function(i,y,z){D(l(i),y,z);},fire:function(i,y,z){F(l(i),y,z);},getCurrentDisplayObject:function(){return C.oApplication.getCurrentDisplayObject();},rebindHeaderData:r,getPreprocessorsData:j,bindComponent:t,suspendBinding:S,setBackNavigation:u,setTitle:v,getTemplatePrivateModel:d,registerContext:w,getViewLevel:f,getBreadCrumbInfo:x};}return B.extend("sap.suite.ui.generic.template.lib.ComponentUtils.js",{constructor:function(c,C){q.extend(this,g(c,C));}});});
