// @copyright@
sap.ui.define(["sap/ushell/utils"],function(u){"use strict";function A(){var m={},c=null,C=null,I=[],a=[];sap.ui.getCore().getEventBus().subscribe("sap.ushell.renderers.fiori2.Renderer","appOpened",b,this);function b(e,E,D){var i;C=D;if(a.length){for(i=0;i<a.length;i++){a[i]();}a.length=0;}}this.addActivity=function(r){var U=sap.ushell.Container.getService("UserRecents");return U.addActivity(r);};this.getCurrentAppliction=function(o){return c;};this.getCurrentApplication=this.getCurrentAppliction;this.getMetadata=function(o){if(!o){o=c;}if(o){var h=hasher&&hasher.getHash?hasher.getHash():'',k=this._processKey(h);if(!(m.hasOwnProperty(k))||!m[k].complete){this.addMetadata(o,k);}if(!m[k]){m[k]={complete:false};}if(!m[k].title){m[k].title=o.text||sap.ushell.resources.i18n.getText("default_app_title");}return m[k];}return{};};this._processKey=function(e){var i=e.split('?')[0],p=e.split('?')[1],S,P={},f,g='',h='',o;if(p){S=p.split('&');S.forEach(function(j){var k=j.split('=');P[k[0]]=k[1];});f=Object.keys(P).sort();f.forEach(function(k,j){h=j?'&':'?';g+=h+k+'='+P[k];});return i+g;}o=sap.ushell.Container.getService("URLParsing").parseShellHash(e);i=o?o.semanticObject+"-"+o.action:"";return i;};this.setCurrentApplication=function(o){c=o;if(a.length){a.length=0;}};this.setHeaderHiding=function(h){if(sap.ui.Device.system.phone){if(c===C){s(h);}else{a.push(function(){s(h);});}}else{jQuery.sap.log.warning("Application configuration could not be trigger setHeaderHiding on Shell as the running device is not a phone");}};function s(h){var r=sap.ushell.Container.getRenderer("fiori2");if(r){r.setHeaderHiding(h);}}this.addApplicationSettingsButtons=function(B){if(c&&C&&c.url&&C.url&&c.url===C.url){d(B);}else{a.push(function(){d(B);});}};function d(B){var i,e=[],o,r=sap.ushell.Container.getRenderer("fiori2");for(i=0;i<B.length;i++){o=B[i];e.push(o.getId());o.setIcon(o.getIcon()||sap.ui.core.IconPool.getIconURI('customize'));if(sap.ushell.resources.i18n.getText("userSettings")===o.getProperty("text")){o.setProperty("text",sap.ushell.resources.i18n.getText("userAppSettings"));}o.setType(sap.m.ButtonType.Unstyled);}if(sap.ushell.Container&&r){if(I.length){r.hideActionButton(I,true);}I=e;r.showActionButton(e,true,undefined,true);}}this.setWindowTitle=function(t){window.document.title=t;};this.setIcons=function(i){jQuery.sap.setIcons(i);};this.setApplicationFullWidth=function(v){var V=sap.ui.getCore().byId("viewPortContainer");V.setApplicationFullWidth(v);};this.getSettingsControl=function(){sap.ui.require(["sap/ushell/ui/footerbar/SettingsButton"],function(S){return new S();});};this.getApplicationName=function(o){var M,e=(o&&o.additionalInformation)||null;if(e){M=/^SAPUI5\.Component=(.+)$/i.exec(e);if(M){return M[1];}}return null;};this.getApplicationUrl=function(o){var U=(o&&o.url)||null,S="P_TCODE",i;if(U){if(o.applicationType==="NWBC"&&U.indexOf(S)){return U;}i=U.indexOf("?");if(i>=0){U=U.slice(0,i);}if(U.slice(-1)!=='/'){U+='/';}}return U;};this.getPropertyValueFromConfig=function(o,p,r){var v;if(r&&o.hasOwnProperty(p+"Resource")){v=r.getText(o[p+"Resource"]);}else if(o.hasOwnProperty(p)){v=o[p];}return v;};this.getPropertyValueFromManifest=function(l,p,P){var M=p[P].manifestEntryKey,e=p[P].path,o=l.getManifestEntry(M);return jQuery.sap.getObject(e,undefined,o);};this.addMetadata=function(o,k){try{var e=this.getApplicationName(o),U=this.getApplicationUrl(o),l,f,p={"fullWidth":{"manifestEntryKey":"sap.ui","path":"fullWidth"},"hideLightBackground":{"manifestEntryKey":"sap.ui","path":"hideLightBackground"},"title":{"manifestEntryKey":"sap.app","path":"title"},"icon":{"manifestEntryKey":"sap.ui","path":"icons.icon"},"favIcon":{"manifestEntryKey":"sap.ui","path":"icons.favIcon"},"homeScreenIconPhone":{"manifestEntryKey":"sap.ui","path":"icons.phone"},"homeScreenIconPhone@2":{"manifestEntryKey":"sap.ui","path":"icons.phone@2"},"homeScreenIconTablet":{"manifestEntryKey":"sap.ui","path":"icons.tablet"},"homeScreenIconTablet@2":{"manifestEntryKey":"sap.ui","path":"icons.tablet@2"},"startupImage320x460":{"manifestEntryKey":"sap.ui","path":"icons.startupImage640x920"},"startupImage640x920":{"manifestEntryKey":"sap.ui","path":"icons.startupImage640x920"},"startupImage640x1096":{"manifestEntryKey":"sap.ui","path":"icons.startupImage640x1096"},"startupImage768x1004":{"manifestEntryKey":"sap.ui","path":"icons.startupImage768x1004"},"startupImage748x1024":{"manifestEntryKey":"sap.ui","path":"icons.startupImage748x1024"},"startupImage1536x2008":{"manifestEntryKey":"sap.ui","path":"icons.startupImage1536x2008"},"startupImage1496x2048":{"manifestEntryKey":"sap.ui","path":"icons.startupImage1496x2048"},"compactContentDensity":{"manifestEntryKey":"sap.ui5","path":"contentDensities.compact"},"cozyContentDensity":{"manifestEntryKey":"sap.ui5","path":"contentDensities.cozy"}},g,h,i,M,P,j,r,n=o&&o.componentHandle;if(k){if(!(m.hasOwnProperty(k))){m[k]={complete:false};}if(!m[k].complete){if(n){l=n.getMetadata();}else if(e){jQuery.sap.log.warning("No component handle available for '"+e+"'; SAPUI5 component metadata is incomplete",null,"sap.ushell.services.AppConfiguration");return;}if(l){f=l.getConfig();M=(l.getManifest()!==undefined);m[k].complete=true;if(f){j=f.resourceBundle||"";if(j){if(j.slice(0,1)!=='/'){j=U+j;}r=jQuery.sap.resources({url:j,locale:sap.ui.getCore().getConfiguration().getLanguage()});}}for(P in p){if(p.hasOwnProperty(P)){if(M){m[k][P]=this.getPropertyValueFromManifest(l,p,P);}if(f&&m[k][P]===undefined){m[k][P]=this.getPropertyValueFromConfig(f,P,r);}}}m[k].version=l.getVersion();m[k].libraryName=l.getLibraryName();}else if(u.isApplicationTypeNWBCRelated(o.applicationType)){var w="/~canvas;window=app/wda/",q=o.url.indexOf(w),W="/bc/gui/sap/its/webgui",t=o.url.indexOf(W);if(q>=0){m[k].libraryName=o.url.substring((q+w.length),o.url.indexOf("/",(q+w.length)));}m[k].complete=true;if(t>=0){var E="etransaction=",v=o.url.indexOf(E,t+W.length),x=o.url.indexOf("&",v),y=(x>=0)?x:o.url.length;m[k].libraryName=o.url.substring(v+E.length,y)+" (TCODE)";}}else{jQuery.sap.log.warning("No technical information for the given application could be determined",null,"sap.ushell.services.AppConfiguration");}}g=["favIcon","homeScreenIconPhone","homeScreenIconPhone@2","homeScreenIconTablet","homeScreenIconTablet@2","startupImage320x460","startupImage640x920","startupImage640x1096","startupImage768x1004","startupImage748x1024","startupImage1536x2008","startupImage1496x2048"];h=(U&&U[U.length-1]==='/')?U.substring(0,U.length-1):U;i=function(U){if(U.match(/^https?:\/\/.*/)){return false;}return U&&U[0]!=='/';};g.forEach(function(B){var O=m[k][B],F=null;if(O){F=i(O)?h+"/"+O:O;}m[k][B]=F;});}}catch(z){jQuery.sap.log.warning("Application configuration could not be parsed");}};}return new A();},true);
